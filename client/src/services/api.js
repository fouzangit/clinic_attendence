import axios from 'axios'

const configuredApiUrl = import.meta.env.VITE_API_URL || ''
const apiBaseUrl =
  import.meta.env.PROD && configuredApiUrl.includes('localhost')
    ? ''
    : configuredApiUrl

axios.defaults.baseURL = apiBaseUrl

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default axios
