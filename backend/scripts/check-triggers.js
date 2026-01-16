require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkTriggers() {
    console.log('--- Checking Triggers on "tracks" table ---');

    // Query to list triggers
    const { data, error } = await supabase.rpc('get_triggers', { table_name: 'tracks' });

    // If RPC doesn't exist (likely), try querying information_schema if possible, 
    // but Supabase client might not allow direct SQL.
    // Instead, we can try to infer or just ask the user.
    // But better: let's try to inspect the 'files' table for the specific track.

    console.log('Cannot list triggers directly via client without admin RPC.');
    console.log('Checking "files" table for track "noite de farra"...');

    const { data: tracks } = await supabase
        .from('tracks')
        .select('id, title, metadata')
        .ilike('title', '%noite de farra%');

    if (!tracks || tracks.length === 0) {
        console.log('Track "noite de farra" not found.');
        return;
    }

    const track = tracks[0];
    console.log(`Found track: ${track.title} (${track.id})`);
    console.log('Metadata Files:', JSON.stringify(track.metadata.files, null, 2));

    const { data: files } = await supabase
        .from('files')
        .select('*')
        .eq('track_id', track.id);

    console.log(`Found ${files.length} rows in "files" table for this track.`);
    if (files.length > 0) {
        console.log(JSON.stringify(files, null, 2));
    }
}

checkTriggers();
