const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- Artists ---

async function listArtists(userId) {
    console.log('Listing artists for user:', userId);
    const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('user_id', userId)
        .order('name');

    if (error) {
        console.error('Error listing artists:', error);
        throw error;
    }
    console.log('Artists found:', data?.length);
    return data;
}

async function createArtist(userId, artistData) {
    console.log('Creating artist for user:', userId, 'Data:', artistData);
    const { data, error } = await supabase
        .from('artists')
        .insert([{ ...artistData, user_id: userId }])
        .select()
        .single();

    if (error) {
        console.error('Error creating artist:', error);
        throw error;
    }
    console.log('Artist created:', data);
    return data;
}

async function updateArtist(userId, artistId, updates) {
    const { data, error } = await supabase
        .from('artists')
        .update(updates)
        .eq('id', artistId)
        .eq('user_id', userId) // Security check
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteArtist(userId, artistId) {
    const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', artistId)
        .eq('user_id', userId);

    if (error) throw error;
    return true;
}

// --- Tracks ---

async function listTracks(userId, artistId = null) {
    let query = supabase
        .from('tracks')
        .select('*, artists(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (artistId) {
        query = query.eq('artist_id', artistId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

async function getTrack(userId, trackId) {
    const { data, error } = await supabase
        .from('tracks')
        .select('*, artists(*)')
        .eq('id', trackId)
        .eq('user_id', userId)
        .single();

    if (error) throw error;
    return data;
}

async function createTrack(userId, trackData) {
    console.log('Creating track for user:', userId, 'Data:', trackData);
    const { data, error } = await supabase
        .from('tracks')
        .insert([{ ...trackData, user_id: userId }])
        .select()
        .single();

    if (error) {
        console.error('Error creating track:', error);
        throw error;
    }
    console.log('Track created:', data);
    return data;
}

async function updateTrack(userId, trackId, updates) {
    const { data, error } = await supabase
        .from('tracks')
        .update(updates)
        .eq('id', trackId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteTrack(userId, trackId) {
    const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId)
        .eq('user_id', userId);

    if (error) throw error;
    return true;
}

async function deleteTrackFile(userId, trackId, fileType) {
    console.log(`[deleteTrackFile] User: ${userId}, Track: ${trackId}, Type: ${fileType}`);

    // 1. Get current track
    const { data: track, error: getError } = await supabase
        .from('tracks')
        .select('metadata')
        .eq('id', trackId)
        .eq('user_id', userId)
        .single();

    if (getError) {
        console.error('[deleteTrackFile] Error fetching track:', getError);
        throw getError;
    }
    if (!track) {
        console.error('[deleteTrackFile] Track not found or access denied');
        throw new Error('Track not found');
    }

    // 2. Update metadata
    const metadata = track.metadata || {};
    if (!metadata.files) metadata.files = {};

    // Capture old URL for physical deletion
    const deletedFileUrl = metadata.files[fileType];

    // Use delete operator to remove the key entirely
    delete metadata.files[fileType];

    // Handle special case for mp3/audio_file_url
    if (fileType === 'mp3') {
        delete metadata.audio_file_url;
    }

    console.log('[deleteTrackFile] Updating metadata to:', JSON.stringify(metadata));

    // 3. Save updates
    const { data: updatedTrack, error: updateError } = await supabase
        .from('tracks')
        .update({ metadata })
        .eq('id', trackId)
        .eq('user_id', userId)
        .select()
        .single();

    if (updateError) {
        console.error('[deleteTrackFile] Error updating track:', updateError);
        throw updateError;
    }

    console.log('[deleteTrackFile] Update success. New metadata:', JSON.stringify(updatedTrack?.metadata));

    return { track: updatedTrack, deletedFileUrl };
}

module.exports = {
    listArtists,
    createArtist,
    updateArtist,
    deleteArtist,
    listTracks,
    getTrack,
    createTrack,
    updateTrack,
    deleteTrack,
    deleteTrackFile
};
