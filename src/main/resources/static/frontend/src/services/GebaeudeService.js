import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/gebaeude';

export const fetchAllBuildings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Gebäude:', error);
    throw error;
  }
};

export const fetchBuildingById = async (buildingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${buildingId}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Abrufen des Gebäudes mit ID ${buildingId}:`, error);
    throw error;
  }
};

export const fetchOpeningHoursByBuildingId = async (buildingId) => {
  try {
    const response = await axios.get(`http://localhost:8080/oeffnungszeiten/${buildingId}`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Abrufen der Öffnungszeiten:", error);
    throw error;
  }
};

export const fetchRoomsByBuildingId = async (buildingId) => {
  try {
    const response = await axios.get(`http://localhost:8080/raeume/gebaeude/${buildingId}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Abrufen der Räume des Gebäudes mit ID ${buildingId}:`, error);
    throw error;
  }
};