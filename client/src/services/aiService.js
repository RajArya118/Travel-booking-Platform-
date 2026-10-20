import api from './api';

export const aiService = {
  /**
   * Generates a day-by-day travel itinerary using Gemini 3.8 Flash
   * @param {Object} data { destination, durationDays, budget, travelers, interests }
   */
  generateItinerary: async (data) => {
    const response = await api.post('/ai/generate-itinerary', data);
    return response.data;
  },
};

export default aiService;
