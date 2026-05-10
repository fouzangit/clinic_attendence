import React, {
    useState,
    useEffect
} from 'react'

import axios from 'axios'
import toast from 'react-hot-toast'

import {
    useNavigate
} from 'react-router-dom'



import FaceScanner from '../components/FaceScanner'

const EmployeeCheckIn = () => {

    const [employee,
        setEmployee] =
        useState(null)

    const navigate =
        useNavigate()

    // =========================
    // STATES
    // =========================

    const [employeeId,
        setEmployeeId] =
        useState('')

    const [loading,
        setLoading] =
        useState(false)

    const [capturedImage, setCapturedImage] = useState(null)

    const [verifyingId,
        setVerifyingId] =
        useState(false)

    // =========================
    // FACE VERIFIED -> AUTO CHECK IN
    // =========================

    const handleFaceCapture = (image) => {
        setCapturedImage(image)
    }

    // =========================
    // FETCH EMPLOYEE
    // =========================

    const fetchEmployee = async () => {
        if (!employeeId) {
            toast.error('Enter Employee ID')
            return
        }

        try {
            setVerifyingId(true)
            const response = await axios.get(`\/api/employees/${employeeId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.data.success) {
                setEmployee(response.data.employee)
                toast.success(`Employee found: ${response.data.employee.full_name}`)
            }
        } catch (err) {
            console.error(err)
            toast.error('Employee not found')
            setEmployee(null)
        } finally {
            setVerifyingId(false)
        }
    }

    // =========================
    // CHECK IN
    // =========================

    const checkIn = () => {

        // EMPLOYEE ID
        if (!employeeId) {
            toast.error('Enter employee ID')
            return
        }

        if (!capturedImage) {
            toast.error('Capture image first')
            return
        }

        // LOCATION
        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {
                    setLoading(true)

                    const latitude =
                        position.coords.latitude

                    const longitude =
                        position.coords.longitude

                    const response = await axios.post('\/api/attendance/check-in', {
                        eid: employeeId,
                        latitude,
                        longitude,
                        image: capturedImage
                    }, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })

                    if (response.data.success) {
                        toast.success(`Face matched (${response.data.matchPercentage}%). Attendance posted.`)
                        navigate('/employee-dashboard')
                    }

                } catch (err) {
                    console.error(err)
                    const errorMsg = err.response?.data?.error;
                    if (errorMsg && errorMsg.includes('Face does not match')) {
                        toast.error(`Face not matched. Attendance not posted. (${errorMsg.split('.')[1] || ''})`);
                    } else {
                        toast.error(errorMsg || 'Check in failed. Attendance not posted.')
                    }
                } finally {
                    setLoading(false)
                }

            },

            (error) => {
                setLoading(false)
                if (error.code === error.TIMEOUT) {
                    toast.error('GPS timeout. Please ensure you have strong signal.')
                } else {
                    toast.error('Location permission denied. Attendance requires GPS verification.')
                }
            },
            { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
        )

    }

    return (

        <div
            className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gradient-to-r
      from-emerald-700
      to-green-300
      p-10
      "
        >

            <div
                className="
        bg-white
        rounded-3xl
        shadow-2xl
        p-10
        w-full
        max-w-4xl
        "
            >

                <h1
                    className="
          text-6xl
          font-bold
          text-center
          mb-10
          "
                >
                    Employee Check-In
                </h1>

                {/* EMPLOYEE ID */}

                <div className="flex gap-4 mb-8">
                    <input
                        type="text"
                        placeholder="Enter Employee ID"
                        value={employeeId}
                        onChange={(e) =>
                            setEmployeeId(
                                e.target.value
                            )
                        }
                        className="
            flex-1
            border
            border-gray-300
            rounded-2xl
            p-5
            text-2xl
            "
                    />
                    <button
                        onClick={fetchEmployee}
                        disabled={verifyingId}
                        className="bg-blue-600 text-white px-8 rounded-2xl font-bold text-xl"
                    >
                        {verifyingId ? '...' : 'Verify ID'}
                    </button>
                </div>

                {/* FACE */}

                {/* ATTENDANCE ACTION */}

                {employee && (
                    <div className="space-y-6">
                        <div className="text-center text-2xl font-semibold text-gray-700">
                            Welcome, {employee.full_name}
                        </div>
                        <FaceScanner
                            eid={employee.eid}
                            employeeImage={employee.face_image}
                            onCapture={handleFaceCapture}
                        />
                        
                        {capturedImage && (
                            <button
                                onClick={checkIn}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold text-3xl shadow-xl transition-all disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Post Attendance'}
                            </button>
                        )}
                    </div>
                )}

                {!employee && (
                    <div className="text-center p-20 bg-gray-100 rounded-3xl text-gray-500 text-2xl border-2 border-dashed border-gray-300">
                        Please verify your Employee ID to start face scan
                    </div>
                )}

                {/* BACK BUTTON */}
                <div className="mt-10">
                    <button
                        onClick={() => navigate('/employee-dashboard')}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white py-5 rounded-2xl font-bold text-3xl"
                    >
                        Back
                    </button>
                </div>

            </div>

        </div>

    )

}

export default EmployeeCheckIn