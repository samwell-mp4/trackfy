const API_URL = '/api/artist-hub';

async function request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('videosia_token'); // Corrected key
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch (e) {
            // Response was not JSON (likely HTML error page or empty)
            console.error('Non-JSON error response:', response);
        }
        throw new Error(errorMessage);
    }

    return response.json();
}

export const artistHubService = {
    // Artists
    getArtists: () => request('/artists'),
    createArtist: (data: any) => request('/artists', { method: 'POST', body: JSON.stringify(data) }),
    updateArtist: (id: string, data: any) => request(`/artists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteArtist: (id: string) => request(`/artists/${id}`, { method: 'DELETE' }),
    createArtistUser: (artistId: string, data: any) => request(`/artists/${artistId}/user`, { method: 'POST', body: JSON.stringify(data) }),

    // Files
    uploadFile: async (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    const token = localStorage.getItem('videosia_token');
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            file: reader.result,
                            filename: file.name,
                            type: file.type
                        })
                    });

                    if (!response.ok) throw new Error('Upload failed');
                    const data = await response.json();
                    resolve(data);
                } catch (e) { reject(e); }
            };
            reader.onerror = error => reject(error);
        });
    },



    // Tracks
    getTracks: (artistId?: string) => request(`/tracks${artistId ? `?artist_id=${artistId}` : ''}`),
    getTrack: (id: string) => request(`/tracks/${id}`),
    createTrack: (data: any) => request('/tracks', { method: 'POST', body: JSON.stringify(data) }),
    updateTrack: (id: string, data: any) => request(`/tracks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTrack: (id: string) => request(`/tracks/${id}`, { method: 'DELETE' }),
    deleteTrackFile: (id: string, type: string) => request(`/tracks/${id}/files/${type}`, { method: 'DELETE' }),

    // Shared Tracks
    getSharedTrack: async (token: string, password?: string) => {
        const response = await fetch('/api/public/track/access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw error;
        }
        return response.json();
    },

    // Events
    getEvents: (start?: string, end?: string, track_id?: string) => {
        const params = new URLSearchParams();
        if (start) params.append('start', start);
        if (end) params.append('end', end);
        if (track_id) params.append('track_id', track_id);
        return request(`/events?${params.toString()}`);
    },
    createEvent: (data: any) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
    updateEvent: (id: string, data: any) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteEvent: (id: string) => request(`/events/${id}`, { method: 'DELETE' }),

    // Checklists & Tasks
    getChecklists: (type?: string, id?: string) => {
        const params = new URLSearchParams();
        if (type) params.append('related_entity_type', type);
        if (id) params.append('related_entity_id', id);
        return request(`/checklists?${params.toString()}`);
    },
    createChecklist: (data: any) => request('/checklists', { method: 'POST', body: JSON.stringify(data) }),
    deleteChecklist: (id: string) => request(`/checklists/${id}`, { method: 'DELETE' }),
    createTask: (data: any) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    updateTask: (id: string, data: any) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTask: (id: string) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
