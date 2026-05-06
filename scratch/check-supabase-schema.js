const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  "https://snxtaochbcjumediqxxq.supabase.co",
  "sb_secret_eBzIue-8ZEp_ksIosfjC1A_idN7F13J"
);

async function checkTable() {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error("Error accessing 'profiles' table:", error.message);
      console.log("Attempting to list all tables...");
      const { data: tables, error: tableError } = await supabaseAdmin.rpc('get_tables');
      if (tableError) console.error("Could not list tables:", tableError.message);
      else console.log("Tables:", tables);
    } else {
      console.log("'profiles' table exists. Columns found in first record:", Object.keys(data[0] || {}));
    }
  } catch (e) {
    console.error("Connection failed:", e.message);
  }
}

checkTable();
