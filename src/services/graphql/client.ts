import { GraphQLClient } from "graphql-request";

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

if (!GRAPHQL_ENDPOINT) {
  throw new Error("VITE_GRAPHQL_ENDPOINT is not defined");
}

export const graphQLClient = new GraphQLClient(GRAPHQL_ENDPOINT);

export class GraphQLService {
  protected client: GraphQLClient;

  constructor(client: GraphQLClient = graphQLClient) {
    this.client = client;
  }

  protected async request<T>(query: string, variables?: any): Promise<T> {
    try {
      return await this.client.request<T>(query, variables);
    } catch (error) {
      console.error("GraphQL Request Error:", error);
      throw error;
    }
  }
}
