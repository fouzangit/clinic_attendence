import dotenv from 'dotenv'
import app from './app.js'
import { startAttendanceJob } from './jobs/attendanceJob.js'

dotenv.config()

const PORT = process.env.PORT || 5000

// Start background CRON jobs
startAttendanceJob()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})