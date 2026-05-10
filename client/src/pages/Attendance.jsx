import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import FaceScanner from '../components/FaceScanner'

const Attendance = () => {

  const [eid, setEid] = useState('')
  const [capturedImage, setCapturedImage] =
    useState(null)

  const [loading, setLoading] =
    useState(false)

  const handleCapture = (image) => {

    setCapturedImage(image)
  }

  const submitAttendance = async () => {

    try {

      if (!eid || !capturedImage) {
        toast.error('Please enter EID and capture face')
        return
      }

      setLoading(true)

      // FACE VERIFY
      const faceResponse =
        await axios.post(
          '/api/face/verify',
          {
            eid,
            image: capturedImage
          }
        )

      if (!faceResponse.data.success) {
        toast.error('Face verification failed')
        setLoading(false)
        return
      }

      // MARK ATTENDANCE
      const attendanceResponse =
        await axios.post(
          '/api/attendance/mark',
          {
            eid
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )

      const data =
        attendanceResponse.data

      toast.success(
        `${data.message} for ${eid}`,
        { duration: 5000 }
      )
      
      setEid('')
      setCapturedImage(null)

    } catch (err) {

      console.error(err)

      toast.error(
        err.response?.data?.error ||
        'Attendance failed'
      )

    } finally {

      setLoading(false)
    }
  }

  return (
    <Layout>
      <div
        className="min-h-screen bg-gradient-to-r from-blue-900 to-indigo-800 p-10 flex flex-col items-center"
      >
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10">
          <h1 className="text-5xl font-bold text-center mb-10 text-gray-800">
            Manual Attendance
          </h1>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-xl font-semibold text-gray-600 ml-2">Employee ID</label>
              <input
                type="text"
                placeholder="Enter Employee ID (e.g. A1234)"
                value={eid}
                onChange={(e) => setEid(e.target.value.toUpperCase())}
                className="w-full p-5 rounded-2xl border-2 border-gray-100 text-2xl focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200">
                <FaceScanner onCapture={handleCapture} mode="capture" />
            </div>

            <button
              onClick={submitAttendance}
              disabled={loading}
              className={`
                w-full py-6 rounded-2xl text-3xl font-bold text-white shadow-lg transition-all
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'}
              `}
            >
              {loading ? 'Verifying...' : 'Mark Present'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Attendance