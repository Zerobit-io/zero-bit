/**
 * config/apollo.ts
 * Apollo Client singleton for client-side GraphQL queries.
 *
 * Security note: The Hasura admin secret must NEVER be a NEXT_PUBLIC_ var.
 * Authenticated requests use a Firebase JWT Bearer token. Hasura maps
 * Firebase JWT claims to roles via its JWT config — no admin secret needed
 * on the frontend. The admin secret is used only in server-side code
 * (lib/server/hasura.ts) and in the API service.
 */

import { auth } from "@/lib/firebase";
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Inject Firebase ID token as Bearer for Hasura JWT auth
const authLink = setContext(async (_, { headers }) => {
  const currentUser = auth.currentUser;
  const token = currentUser ? await currentUser.getIdToken() : null;

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const httpLink = new HttpLink({
  uri:
    process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL ??
    "http://localhost:8080/v1/graphql",
  // No admin secret here — auth is handled via JWT Bearer token above.
  // If you need unauthenticated public queries during development, set
  // NEXT_PUBLIC_HASURA_GRAPHQL_URL to a role-restricted endpoint or add
  // a Hasura anonymous role with limited permissions.
});

export const apolloClient = new ApolloClient({
  link: from([authLink as unknown as ApolloLink, httpLink]),
  cache: new InMemoryCache(),
});
