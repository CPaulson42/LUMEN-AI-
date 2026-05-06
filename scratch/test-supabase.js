const { createBrowserClient } = require('@supabase/ssr');
const url = "https://snxtaochbcjumediqxxq.supabase.co";
const key = "sb_publishable_tgvNgHIWbZIV3eRRiVeEvA_jGiQtdbP";

try {
  const client = createBrowserClient(url, key);
  console.log("Client initialized successfully");
} catch (e) {
  console.error("Failed to initialize client:", e);
}
