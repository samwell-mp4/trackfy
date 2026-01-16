require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log('Checking video_requests schema...');

    // Try to insert a valid record with STRING ID
    const testId = 'user-string-id-' + Date.now();

    const { error } = await supabase
        .from('video_requests')
        .insert([{
            user_id: testId,
            metodo: 'Automatico',
            num_images: 1,
            status: 'pending'
        }]);

    if (error) {
        console.log('Error inserting valid integer ID:', error.message);
        if (error.message.includes('invalid input syntax')) {
            console.log('⚠️ Schema Mismatch: Table might expect UUID or TEXT, but got Integer.');
        } else {
            console.log('❓ Other error:', error.message);
        }
    } else {
        console.log('✅ Success! The table accepted the integer user_id.');
        // Clean up
        await supabase.from('video_requests').delete().eq('user_id', testId).eq('metodo', 'Test');
    }
}

checkSchema();
