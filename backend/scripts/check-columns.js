const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkColumns() {
    console.log('Checking columns in artists table...');

    // We can't easily query information_schema with supabase-js client unless we have a stored procedure or direct SQL access.
    // Instead, we'll try to select all columns from one row and see what we get.

    const { data: artists, error } = await supabase
        .from('artists')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (artists && artists.length > 0) {
        const columns = Object.keys(artists[0]);
        console.log('Columns found:', columns.join(', '));

        const hasSocialLinks = columns.includes('social_links');
        console.log('Has social_links:', hasSocialLinks);
    } else {
        console.log('No artists found, cannot infer columns from data.');
        // Try to insert a dummy row with social_links to see if it fails? No, that's risky.
        // We'll assume if it's not in the returned object (even if null), it might not be selected? 
        // But select('*') returns all columns.
    }
}

checkColumns();
