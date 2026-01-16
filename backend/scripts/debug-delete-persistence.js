require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const artistService = require('../services/artistService');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function runDebug() {
    console.log('--- Starting Debug Persistence ---');

    // 1. Get a user
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .limit(1);

    if (userError || !users.length) {
        console.error('No users found or error:', userError);
        return;
    }
    const user = users[0];
    console.log(`Using user: ${user.email} (${user.id})`);

    // 2. Get a track
    const { data: tracks, error: trackError } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

    if (trackError || !tracks.length) {
        console.error('No tracks found for user.');
        return;
    }
    const track = tracks[0];
    console.log(`Using track: ${track.title} (${track.id})`);
    console.log('Initial Metadata:', JSON.stringify(track.metadata, null, 2));

    // 3. Simulate adding a dummy file if needed
    if (!track.metadata?.files?.mp3) {
        console.log('Adding dummy mp3 file...');
        const newMetadata = track.metadata || {};
        if (!newMetadata.files) newMetadata.files = {};
        newMetadata.files.mp3 = 'https://example.com/dummy.mp3';

        await supabase
            .from('tracks')
            .update({ metadata: newMetadata })
            .eq('id', track.id);

        console.log('Dummy file added.');
    }

    // 4. Try to delete it using the service logic
    console.log('Attempting to delete mp3 file...');
    try {
        const result = await artistService.deleteTrackFile(user.id, track.id, 'mp3');
        console.log('Service returned:', JSON.stringify(result.track.metadata, null, 2));
    } catch (err) {
        console.error('Service error:', err);
    }

    // 5. Verify directly from DB
    const { data: refreshedTrack } = await supabase
        .from('tracks')
        .select('metadata')
        .eq('id', track.id)
        .single();

    console.log('Refreshed Metadata from DB:', JSON.stringify(refreshedTrack.metadata, null, 2));

    if (refreshedTrack.metadata?.files?.mp3) {
        console.error('FAILURE: File still exists in DB!');
    } else {
        console.log('SUCCESS: File is gone from DB.');
    }

    // 6. Check files table
    const { data: filesTable } = await supabase
        .from('files')
        .select('*')
        .eq('track_id', track.id);

    console.log('Related rows in "files" table:', filesTable.length);
    if (filesTable.length > 0) {
        console.log(filesTable);
    }
}

runDebug();
