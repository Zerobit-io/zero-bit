/**
 * lib/server/hasura.ts
 * Server-side only — never imported by client components.
 * Provides typed mutations for Hasura GraphQL admin operations.
 * Uses HASURA_ADMIN_SECRET (server-only, no NEXT_PUBLIC_ prefix).
 */

const HASURA_URL =
  process.env.HASURA_GRAPHQL_URL ?? "http://localhost:8080/v1/graphql";
const HASURA_ADMIN_SECRET =
  process.env.HASURA_ADMIN_SECRET ?? "myadminsecretkey";

interface HasuraResponse<T> {
  data?: T;
  errors?: { message: string; extensions?: Record<string, unknown> }[];
}

async function hasuraQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(HASURA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as HasuraResponse<T>;

  if (json.errors && json.errors.length > 0) {
    throw new Error(
      `Hasura error: ${json.errors.map((e) => e.message).join("; ")}`,
    );
  }

  if (!json.data) {
    throw new Error("Hasura returned no data");
  }

  return json.data;
}

/* ── Escrow mutations ─────────────────────────────────── */

interface InsertEscrowArgs {
  contractId: string;
  engagementId: string;
  propertyId: string;
  senderAddress: string;
  receiverAddress: string;
  amount: number;
  status: string;
}

interface InsertEscrowResult {
  insert_escrows_one: { id: string };
}

export async function insertEscrowRecord(
  args: InsertEscrowArgs,
): Promise<InsertEscrowResult> {
  return hasuraQuery<InsertEscrowResult>(
    `mutation InsertEscrow(
      $contractId: String!
      $engagementId: String!
      $propertyId: String!
      $senderAddress: String!
      $receiverAddress: String!
      $amount: numeric!
      $status: String!
    ) {
      insert_escrows_one(object: {
        contract_id: $contractId
        engagement_id: $engagementId
        property_id: $propertyId
        sender_address: $senderAddress
        receiver_address: $receiverAddress
        amount: $amount
        status: $status
      }) {
        id
      }
    }`,
    {
      contractId: args.contractId,
      engagementId: args.engagementId,
      propertyId: args.propertyId,
      senderAddress: args.senderAddress,
      receiverAddress: args.receiverAddress,
      amount: args.amount,
      status: args.status,
    },
  );
}

interface UpdateEscrowStatusResult {
  update_escrows: { affected_rows: number };
}

export async function updateEscrowStatus(
  engagementId: string,
  status: string,
): Promise<UpdateEscrowStatusResult> {
  return hasuraQuery<UpdateEscrowStatusResult>(
    `mutation UpdateEscrowStatus($engagementId: String!, $status: String!) {
      update_escrows(
        where: { engagement_id: { _eq: $engagementId } }
        _set: { status: $status }
      ) {
        affected_rows
      }
    }`,
    { engagementId, status },
  );
}
