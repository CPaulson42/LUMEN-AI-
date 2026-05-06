const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  "https://snxtaochbcjumediqxxq.supabase.co",
  "sb_secret_eBzIue-8ZEp_ksIosfjC1A_idN7F13J"
);

async function checkCampaigns() {
  const { data, error } = await supabaseAdmin.from('campaigns').select('*').limit(1);
  if (error) console.error("Error:", error.message);
  else console.log("Campaigns columns:", Object.keys(data[0] || {}));
}

checkCampaigns();
