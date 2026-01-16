const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testUpdate() {
    console.log('Testing update to check schema...');

    // 1. Get an artist
    const { data: artists, error: listError } = await supabase
        .from('artists')
        .select('id, user_id')
        .limit(1);

    if (listError) {
        console.error('Error listing artists:', listError);
        return;
    }

    if (!artists || artists.length === 0) {
        console.log('No artists found to test.');
        return;
    }

    const artist = artists[0];
    console.log('Testing with artist:', artist.id);

    // 2. Try to update with new fields
    const updates = {
        full_name: 'Test Name',
        cpf: '12345678900',
        rg: '1234567',
        phone: '11999999999',
        email_contact: 'test@example.com',
        responsible_company: 'Test Co',
        birth_date: '' // Test empty date string
    };

    const { data, error } = await supabase
        .from('artists')
        .update(updates)
        .eq('id', artist.id)
        .select();

    if (error) {
        console.error('Update failed. Schema likely missing columns.');
        console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
        console.log('Update successful! Schema is correct.');
    }
}

testUpdate();
