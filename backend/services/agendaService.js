const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function listEvents(userId, startDate, endDate, trackId) {
    let query = supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time');

    if (startDate) {
        query = query.gte('start_time', startDate);
    }
    if (endDate) {
        query = query.lte('start_time', endDate);
    }
    if (trackId) {
        query = query.eq('track_id', trackId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

async function createEvent(userId, eventData) {
    const { data, error } = await supabase
        .from('events')
        .insert([{ ...eventData, user_id: userId }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function updateEvent(userId, eventId, updates) {
    const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteEvent(userId, eventId) {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userId);

    if (error) throw error;
    return true;
}

module.exports = {
    listEvents,
    createEvent,
    updateEvent,
    deleteEvent
};
