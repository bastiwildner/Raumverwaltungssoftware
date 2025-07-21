import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/benutzer';

export const fetchUserByToken = async () => {
  try {
    const token = localStorage.getItem('sessionToken');
    if (!token) {
      console.error('Kein Session-Token gefunden.');
      return null;
    }

    const response = await axios.get(`${API_BASE_URL}`, {
      headers: {
        Authorization: token,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzerinformationen:', error);
    return null;
  }
};

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzer:', error);
    return [];
  }
};

export const fetchUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen des Benutzers:', error);
    return null;
  }
};

export const fetchFacilityManagers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/facilitymanagers`);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Facility Manager:', error);
    throw error;
  }
};

export const fetchUserByEmail = async (email) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/email`, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen des Benutzers über die E-Mail:', error);
    return null;
  }
};