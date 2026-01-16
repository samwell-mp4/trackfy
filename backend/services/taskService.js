const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- Checklists ---

async function listChecklists(userId, relatedEntityType = null, relatedEntityId = null) {
    let query = supabase
        .from('checklists')
        .select('*, tasks(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (relatedEntityType) {
        query = query.eq('related_entity_type', relatedEntityType);
    }
    if (relatedEntityId) {
        query = query.eq('related_entity_id', relatedEntityId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

async function createChecklist(userId, checklistData) {
    const { data, error } = await supabase
        .from('checklists')
        .insert([{ ...checklistData, user_id: userId }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteChecklist(userId, checklistId) {
    console.log('Deleting checklist:', checklistId, 'User:', userId);
    // 1. Delete all tasks in the checklist first (Manual Cascade)
    const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('checklist_id', checklistId);

    if (tasksError) {
        console.error('Error deleting checklist tasks:', tasksError);
        throw tasksError;
    }

    // 2. Delete the checklist
    const { data, error, count } = await supabase
        .from('checklists')
        .delete({ count: 'exact' }) // Request count
        .eq('id', checklistId)
        .eq('user_id', userId)
        .select(); // Select to get data back

    if (error) {
        console.error('Error deleting checklist:', error);
        throw error;
    }

    console.log('Deleted checklist rows:', data?.length);

    if (!data || data.length === 0) {
        console.warn('WARNING: No checklist deleted. ID or User mismatch?');
        // Optional: Throw error if we expect it to exist
        // throw new Error('Checklist not found or permission denied');
    }

    return true;
}

// --- Tasks ---

async function createTask(userId, taskData) {
    // Verify checklist ownership first
    const { data: checklist, error: checkError } = await supabase
        .from('checklists')
        .select('user_id')
        .eq('id', taskData.checklist_id)
        .single();

    if (checkError || !checklist || checklist.user_id !== userId) {
        throw new Error('Checklist not found or access denied');
    }

    const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function updateTask(userId, taskId, updates) {
    // We need to join with checklist to verify ownership
    const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('checklist_id, checklists(user_id)')
        .eq('id', taskId)
        .single();

    if (fetchError || !task) {
        throw new Error('Task not found');
    }

    // Check ownership safely
    const checklistOwner = task.checklists ? task.checklists.user_id : null;
    if (checklistOwner !== userId) {
        throw new Error('Access denied');
    }

    const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteTask(userId, taskId) {
    // 1. Get task to find checklist_id
    const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('checklist_id')
        .eq('id', taskId)
        .single();

    if (taskError || !task) {
        console.error('Task delete fetch error:', taskError);
        throw new Error('Task not found');
    }

    // 2. Verify checklist ownership
    const { data: checklist, error: listError } = await supabase
        .from('checklists')
        .select('user_id')
        .eq('id', task.checklist_id)
        .single();

    if (listError || !checklist) {
        console.error('Checklist fetch error during task delete:', listError);
        throw new Error('Checklist not found');
    }

    if (checklist.user_id !== userId) {
        console.error('Task delete access denied:', { userId, owner: checklist.user_id });
        throw new Error('Access denied');
    }

    // 3. Delete task
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

    if (error) throw error;
    return true;
}

module.exports = {
    listChecklists,
    createChecklist,
    deleteChecklist,
    createTask,
    updateTask,
    deleteTask
};
