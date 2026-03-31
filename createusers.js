import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://fgqimxtgbgspihmxujhp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncWlteHRnYmdzcGlobXh1amhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkyMjEyOSwiZXhwIjoyMDg5NDk4MTI5fQ.sBBhHXoHPYOmmJg7XEsXmKUpWVQUQRY93-gw8AMZCD4"
);

const TABLE_NAME = "students"; // 👈 CHANGE THIS
const DEFAULT_PASSWORD = "12345678"; // same password

async function createUsers() {
  console.log("Fetching users...");

  // 1. Get users from your table
  const { data: users, error } = await supabase
    .from(TABLE_NAME)
    .select("email");

  if (error) {
    console.error("Error fetching users:", error.message);
    return;
  }

  console.log(`Found ${users.length} users`);

  // 2. Loop and create auth users
  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true
    });

    if (error) {
      console.log(`❌ ${user.email}: ${error.message}`);
    } else {
      console.log(`✅ Created: ${user.email}`);

      // 3. Link auth user to your table
      await supabase
        .from(TABLE_NAME)
        .update({ user_id: data.user.id }) // make sure column exists
        .eq("email", user.email);
    }
  }

  console.log("Done 🎉");
}

createUsers();