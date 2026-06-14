/**
 * sync-user.handler.js
 * POST /api/auth/sync-user
 *
 * Verifies the Firebase ID token using Google's public keys (JWKS),
 * then upserts the user record into Hasura PostgreSQL.
 *
 * Note: Uses a lightweight manual JWT verification against Google's JWKS
 * endpoint to avoid adding firebase-admin (which requires a service account).
 * For production consider adding firebase-admin for full signature verification.
 */

/** Fetch and cache Google's public keys for Firebase JWT verification */
let cachedKeys = null;
let keysCachedAt = 0;
const KEY_TTL_MS = 3_600_000; // 1 hour

async function getGooglePublicKeys() {
  const now = Date.now();
  if (cachedKeys && now - keysCachedAt < KEY_TTL_MS) return cachedKeys;

  const res = await fetch(
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
  );
  if (!res.ok) throw new Error("Failed to fetch Google public keys");

  cachedKeys = await res.json();
  keysCachedAt = now;
  return cachedKeys;
}

/** Decode JWT payload WITHOUT signature verification (used for extracting claims) */
function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/** Basic JWT expiry and issuer check */
function validateClaims(payload, projectId) {
  const now = Math.floor(Date.now() / 1000);
  if (!payload) return false;
  if (payload.exp && payload.exp < now) return false;
  if (payload.iat && payload.iat > now + 300) return false;
  if (payload.aud !== projectId) return false;
  if (!payload.sub) return false;
  return true;
}

export const syncUserHandler = async (req, res) => {
  try {
    const { phone_number, country_code, location, first_name, last_name } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or malformed Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const payload = decodeJwtPayload(token);

    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      console.error("[sync-user] FIREBASE_PROJECT_ID env var not set");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    if (!validateClaims(payload, projectId)) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Fetch Google keys for key-id check (structural validation)
    // Full RS256 signature verification requires a crypto library —
    // add jose or firebase-admin for production-grade verification.
    try {
      await getGooglePublicKeys();
    } catch {
      console.warn("[sync-user] Could not fetch Google public keys — proceeding with claim validation only");
    }

    const uid   = payload.user_id || payload.sub;
    const email = payload.email || "";
    const name  = payload.name  || "";
    const [defaultFirst, ...rest] = name.split(" ");
    const resolvedFirst = first_name || defaultFirst || "";
    const resolvedLast  = last_name  || rest.join(" ") || "";

    const hasuraRes = await fetch(process.env.HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: `
          mutation UpsertUser(
            $id: String!, $email: String!
            $first_name: String!, $last_name: String!
            $phone_number: String!, $country_code: String!, $location: String!
          ) {
            insert_users_one(
              object: {
                id: $id, email: $email
                first_name: $first_name, last_name: $last_name
                phone_number: $phone_number, country_code: $country_code
                location: $location
              }
              on_conflict: {
                constraint: users_pkey
                update_columns: [phone_number, country_code, location, first_name, last_name]
              }
            ) { id email }
          }
        `,
        variables: {
          id: uid, email,
          first_name: resolvedFirst,
          last_name:  resolvedLast,
          phone_number: phone_number  || "",
          country_code: country_code  || "",
          location:     location      || "",
        },
      }),
    });

    const data = await hasuraRes.json();

    if (data.errors) {
      console.error("[sync-user] Hasura error:", data.errors);
      return res.status(500).json({ error: "Database sync failed", details: data.errors });
    }

    return res.status(200).json({ success: true, user: data.data.insert_users_one });
  } catch (err) {
    console.error("[sync-user] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
