import { QueryClient } from "@tanstack/react-query";

// A single, importable instance (rather than one only reachable via
// QueryClientProvider's context) so non-component code — like the sign-out
// reset helper and the 401 auto-recovery in useApi — can clear the cache too.
export const queryClient = new QueryClient();
