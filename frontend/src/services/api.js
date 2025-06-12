import axios from 'axios';

// The Vite proxy in vite.config.js will redirect /api requests
// to the backend server (e.g., http://localhost:8000/api)
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches the list of top scores from the backend.
 * @async
 * @function getScores
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of score objects.
 * Each score object should have `id`, `player_name`, `score`, and `created_at` fields.
 * @throws {Error} If the API request fails.
 */
export const getScores = async () => {
  try {
    const response = await apiClient.get('/scores');
    return response.data;
  } catch (error) {
    console.error('Error fetching scores:', error.response ? error.response.data : error.message);
    throw error.response ? new Error(error.response.data.detail || 'Failed to fetch scores') : error;
  }
};

/**
 * Submits a new score to the backend.
 * @async
 * @function submitScore
 * @param {Object} scoreData - The score data to submit.
 * @param {string} scoreData.player_name - The name of the player.
 * @param {number} scoreData.score - The score achieved by the player.
 * @returns {Promise<Object>} A promise that resolves to the created score object from the backend.
 * The created score object should have `id`, `player_name`, `score`, and `created_at` fields.
 * @throws {Error} If the API request fails or validation fails.
 */
export const submitScore = async (scoreData) => {
  try {
    const response = await apiClient.post('/scores', scoreData);
    return response.data;
  } catch (error) {
    console.error('Error submitting score:', error.response ? error.response.data : error.message);
    // FastAPI validation errors often come in error.response.data.detail which can be an array
    let errorMessage = 'Failed to submit score.';
    if (error.response && error.response.data && error.response.data.detail) {
      if (Array.isArray(error.response.data.detail)) {
        errorMessage = error.response.data.detail.map(err => `${err.loc.join('.')} - ${err.msg}`).join('; ');
      } else if (typeof error.response.data.detail === 'string'){
        errorMessage = error.response.data.detail;
      }
    }
    throw new Error(errorMessage);
  }
};

// Placeholder for a potential health check, though not strictly required by current components
/**
 * Checks the health of the API.
 * @async
 * @function checkApiHealth
 * @returns {Promise<Object>} A promise that resolves to the health check response.
 * @throws {Error} If the API request fails.
 */
export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking API health:', error.response ? error.response.data : error.message);
    throw error.response ? new Error(error.response.data.detail || 'API health check failed') : error;
  }
};

export default {
  getScores,
  submitScore,
  checkApiHealth,
};
