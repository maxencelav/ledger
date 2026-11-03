import { requireMcpAuth } from "@better-auth/mcp";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { MCP_RESOURCE } from "@/lib/env";

const mcpServerHandler = createMcpHandler(
  () => {
    const server = new McpServer({
      name: "ledger",
      version: "0.1.0",
    });

    server.registerTool(
      "whoami",
      {
        description: "Return the authenticated user this MCP session belongs to",
        inputSchema: z.object({}),
      },
      async () => ({
        content: [{ type: "text", text: "Signed in to Ledger" }],
      }),
    );

    return server;
  },
  {
    // Accept only the MCP 2026-07-28 protocol, matching the CIMD profile
    // configured on the auth instance.
    legacy: "reject",
  },
);

// `resource` must be byte-identical to mcp({ resource }), since access tokens
// are audience-bound to that exact string.
const POST = requireMcpAuth(auth, (request) => mcpServerHandler.fetch(request), {
  resource: MCP_RESOURCE,
});

// Only POST is exported, so GET and DELETE correctly return 405.
export { POST };
