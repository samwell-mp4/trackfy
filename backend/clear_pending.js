require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function clearPending() {
    console.log('Clearing stuck pending requests...');

    const { data, error } = await supabase
        .from('video_requests')
        .update({ status: 'failed' })
        .eq('status', 'pending')
        .select();

    if (error) {
        console.error('Error clearing requests:', error);
    } else {
        console.log(`Cleared ${data.length} stuck requests.`);
    }
}

clearPending();
