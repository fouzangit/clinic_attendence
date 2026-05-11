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
      bg-[#0f172a]
      p-4 md:p-10
      "


        >

            <div
                className="
        bg-slate-900/50
        backdrop-blur-2xl
        rounded-[40px] md:rounded-[60px]
        shadow-2xl
        p-6 md:p-12
        w-full
        max-w-4xl
        border border-white/5
        "


            >

                <h1
                    className="
          text-3xl md:text-5xl
          font-black
          text-center
          text-white
          mb-8 md:mb-12
          tracking-tight
          "
                >
                    Biometric <span className="text-blue-400">Check-In</span>
                </h1>



                {/* EMPLOYEE ID */}

                <div className="flex flex-col md:flex-row gap-4 mb-8">

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
            bg-white/5
            border border-white/10
            rounded-2xl
            p-4 md:p-5
            text-lg md:text-2xl
            text-white
            placeholder:text-white/20
            focus:ring-2
            ring-blue-500
            outline-none
            "


                    />
                    <button
                        onClick={fetchEmployee}
                        disabled={verifyingId}
                        className="bg-blue-600 text-white px-8 py-4 md:py-0 rounded-2xl font-bold text-lg md:text-xl shadow-lg"
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
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 md:py-5 rounded-2xl font-bold text-xl md:text-3xl shadow-xl transition-all disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Post Attendance'}
                            </button>

                        )}
                    </div>
                )}

                {!employee && (
                    <div className="text-center p-10 md:p-20 bg-gray-100 rounded-3xl text-gray-500 text-xl md:text-2xl border-2 border-dashed border-gray-300">
                        Please verify your Employee ID to start face scan
                    </div>
                )}


                {/* BACK BUTTON */}
                <div className="mt-10">
                    <button
                        onClick={() => navigate('/employee-dashboard')}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white py-4 md:py-5 rounded-2xl font-bold text-xl md:text-3xl"
                    >
                        Back
                    </button>

                </div>

            </div>

        </div>

    )

}

export default EmployeeCheckIn