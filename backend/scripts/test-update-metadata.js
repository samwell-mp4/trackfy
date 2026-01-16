
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testUpdate() {
    console.log('Testing metadata update...');

    // 1. Create a dummy track
    const { data: track, error: createError } = await supabase
        .from('tracks')
        .insert([{
            title: 'Test Track Deletion',
            user_id: 'd0d3c623-688b-4220-8c2f-827293776609', // Using a known user ID or I need to fetch one. 
            // Let's first fetch a user to use.
            status: 'pre_production',
            metadata: {
                genre: 'Rock',
                files: {
                    mp3: 'http://example.com/song.mp3',
                    wav: 'http://example.com/song.wav'
                },
                audio_file_url: 'http://example.com/song.mp3'
            }
        }])
        .select()
        .single();

    if (createError) {
        // If user constraint fails, let's try to find a user first
        console.error('Error creating track (likely user_id):', createError.message);
        return;
    }

    console.log('Track created:', track.id);
    console.log('Initial Metadata:', JSON.stringify(track.metadata, null, 2));

    // 2. Update metadata to remove mp3
    const updatedMetadata = JSON.parse(JSON.stringify(track.metadata));
    updatedMetadata.files.mp3 = null;
    updatedMetadata.audio_file_url = null;

    console.log('Sending Update:', JSON.stringify(updatedMetadata, null, 2));

    const { data: updatedTrack, error: updateError } = await supabase
        .from('tracks')
        .update({ metadata: updatedMetadata })
        .eq('id', track.id)
        .select()
        .single();

    if (updateError) {
        console.error('Error updating track:', updateError);
    } else {
        console.log('Track Updated.');
        console.log('Final Metadata:', JSON.stringify(updatedTrack.metadata, null, 2));

        if (updatedTrack.metadata.files.mp3 === null && updatedTrack.metadata.audio_file_url === null) {
            console.log('SUCCESS: Fields are null.');
        } else {
            console.log('FAILURE: Fields are NOT null.');
        }
    }

    // 3. Cleanup
    await supabase.from('tracks').delete().eq('id', track.id);
    console.log('Cleanup done.');
}

// Helper to get a valid user id
async function run() {
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (users && users.length > 0) {
        // Patch the function to use this user
        const originalInsert = supabase.from('tracks').insert;
        // Actually I'll just copy the code above but use users[0].id

        console.log('Using user_id:', users[0].id);

        const { data: track, error: createError } = await supabase
            .from('tracks')
            .insert([{
                title: 'Test Track Deletion',
                user_id: users[0].id,
                status: 'pre_production',
                metadata: {
                    genre: 'Rock',
                    files: {
                        mp3: 'http://example.com/song.mp3',
                        wav: 'http://example.com/song.wav'
                    },
                    audio_file_url: 'http://example.com/song.mp3'
                }
            }])
            .select()
            .single();

        if (createError) {
            console.error('Error creating track:', createError);
            return;
        }

        console.log('Track created:', track.id);
        console.log('Initial Metadata:', JSON.stringify(track.metadata, null, 2));

        // 2. Update metadata to remove mp3
        const updatedMetadata = JSON.parse(JSON.stringify(track.metadata));
        updatedMetadata.files.mp3 = null;
        updatedMetadata.audio_file_url = null;

        console.log('Sending Update with NULLs...');

        const { data: updatedTrack, error: updateError } = await supabase
            .from('tracks')
            .update({ metadata: updatedMetadata })
            .eq('id', track.id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating track:', updateError);
        } else {
            console.log('Track Updated.');
            console.log('Final Metadata:', JSON.stringify(updatedTrack.metadata, null, 2));

            // Check if it persisted
            if (updatedTrack.metadata.files.mp3 === null) {
                console.log('SUCCESS: files.mp3 is null');
            } else {
                console.log('FAILURE: files.mp3 is ' + updatedTrack.metadata.files.mp3);
            }
        }

        // Cleanup
        await supabase.from('tracks').delete().eq('id', track.id);

    } else {
        console.error('No users found to test with.');
    }
}

run();
