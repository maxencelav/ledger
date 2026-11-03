import { Suspense } from "react";
import { ConsentForm } from "./consent-form";

/**
 * Where Better Auth sends the user when an MCP (or any OAuth) client requests
 * consent. The provider appends `client_id`, `scope`, `claims` and `code` to
 * this URL; the whole query string is handed back to /oauth2/consent as
 * `oauth_query` so the provider can resume the authorization it started.
 */
export default function ConsentPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <Suspense fallback={null}>
        <ConsentForm />
      </Suspense>
    </div>
  );
}
