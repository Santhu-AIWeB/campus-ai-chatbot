export const getRegistrations = async () => {
    try {
        const response = await fetch('/api/registrations/');
        if (!response.ok) throw new Error('Failed to fetch registrations');
        return await response.json();
    } catch (error) {
        console.error('Error fetching registrations:', error);
        return [];
    }
};

export const deleteRegistration = async (id) => {
    try {
        const response = await fetch(`/api/registrations/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete registration');
        return true;
    } catch (error) {
        console.error('Error deleting registration:', error);
        return false;
    }
};
export const getRegistrationsByEvent = async (eventId) => {
    try {
        const response = await fetch(`/api/registrations/event/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch event registrations');
        return await response.json();
    } catch (error) {
        console.error('Error fetching event registrations:', error);
        return [];
    }
};
