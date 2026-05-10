import axios from 'axios'

const API_URL = '\/api/face'

const verifyFaceAndMarkAttendance = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/verify`, data)
    return response.data
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || error.message
    }
  }
}

export default {
  verifyFaceAndMarkAttendance
}
