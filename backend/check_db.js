require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
    console.log('Checking database schema...');
    const testId = 'test_text_id_' + Date.now();
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID

    try {
        const { data, error } = await supabase
            .from('gallery_tracking')
            .insert([
                {
                    user_id: testUserId,
                    drive_file_id: testId,
                    is_posted: false
                }
            ])
            .select();

        if (error) {
            console.error('❌ Error inserting record:', error.message);
            if (error.message.includes('invalid input syntax for type uuid')) {
                console.log('👉 DIAGNOSIS: The table still expects UUID for drive_file_id. The SQL command was not run successfully.');
            } else if (error.message.includes('foreign key constraint')) {
                console.log('👉 DIAGNOSIS: Foreign key constraint failed. This is expected if using dummy user_id, but implies schema might be okay regarding types.');
            }
        } else {
            console.log('✅ Success! The table accepted a TEXT drive_file_id.');
            // Clean up
            await supabase.from('gallery_tracking').delete().eq('drive_file_id', testId);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

check();
