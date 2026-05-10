import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


import FaceScanner from '../components/FaceScanner';

const EmployeeCheckOut = () => {
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFaceCapture = (image) => {
    if (submitted) {
      return;
    }
    setCapturedImage(image);
  };

  const checkOut = () => {
    if (loading || submitted) {
      return;
    }

    if (!employeeId) {
      toast.error('Enter employee ID');
      return;
    }

    if (!capturedImage) {
      toast.error('Capture image first');
      return;
    }

    setLoading(true);
    setSubmitted(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await axios.post('/api/attendance/check-out', {
            eid: employeeId,
            latitude,
            longitude,
            image: capturedImage
          }, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.data.success) {
            toast.success(`Face matched (${response.data.matchPercentage}%). Attendance posted.`);
            navigate('/employee-dashboard');
          }
        } catch (err) {
          console.error(err);
          const errorMsg = err.response?.data?.error;
          if (errorMsg && errorMsg.includes('Face does not match')) {
              toast.error(`Face not matched. Attendance not posted. (${errorMsg.split('.')[1] || ''})`);
          } else {
              toast.error(errorMsg || 'Check out failed. Attendance not posted.');
          }
          setSubmitted(false);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        setSubmitted(false);
        if (error.code === error.TIMEOUT) {
            toast.error('GPS timeout. Please ensure you have strong signal.');
        } else {
            toast.error('Location permission denied');
        }
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-emerald-700 to-green-300 p-10">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-4xl">
        <h1 className="text-6xl font-bold text-center mb-10">Employee Check-Out</h1>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Enter Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            disabled={loading || submitted}
            className="w-full border border-gray-300 rounded-2xl p-5 text-2xl"
          />
        </div>

        <FaceScanner 
            eid={employeeId}
            onCapture={handleFaceCapture} 
        />

        <div className="text-center text-2xl font-semibold mt-8 mb-8">
          {capturedImage ? (
            <span className="text-blue-600">Face captured. You can now post attendance.</span>
          ) : (
            <span className="text-gray-400">Please scan your face to check out</span>
          )}
        </div>

        <div className="space-y-5">
          <button
            onClick={() => checkOut()}
            disabled={loading || submitted || !capturedImage}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold text-3xl shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Post Attendance'}
          </button>

          <button
            onClick={() => navigate('/employee-dashboard')}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-5 rounded-2xl font-bold text-3xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCheckOut;
