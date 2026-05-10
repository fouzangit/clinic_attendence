import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { FaMapMarkedAlt, FaSave, FaCrosshairs } from 'react-icons/fa';

const Settings = () => {
  const [settings, setSettings] = useState({
    clinic_latitude: '',
    clinic_longitude: '',
    allowed_radius: 500
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('\/api/attendance/settings', {
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
      });
      if (res.data.success && res.data.settings) {
        setSettings({
          clinic_latitude: res.data.settings.clinic_latitude,
          clinic_longitude: res.data.settings.clinic_longitude,
          allowed_radius: res.data.settings.allowed_radius
        });
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async () => {
    try {
      const res = await axios.post('\/api/attendance/settings', settings, {
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
      });
      if (res.data.success) {
        toast.success('Settings updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setSettings({
        ...settings,
        clinic_latitude: pos.coords.latitude,
        clinic_longitude: pos.coords.longitude
      });
      toast.success('Location detected!');
    }, () => {
      toast.error('Location access denied');
    });
  };

  if (loading) return <div className="p-20 text-center text-2xl">Loading...</div>;

  return (
    <Layout>
      <div className="p-12 min-h-screen bg-slate-100">
        <h1 className="text-6xl font-bold mb-12 text-slate-800">System Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LOCATION SETTINGS */}
          <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
                <FaMapMarkedAlt className="text-3xl" />
              </div>
              <h2 className="text-3xl font-bold">Clinic Geofencing</h2>
            </div>

            <p className="text-gray-500 mb-10 text-lg">
              Set the exact coordinates of your clinic and the allowed radius for employee check-ins.
            </p>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Latitude</label>
                  <input
                    type="number"
                    value={settings.clinic_latitude}
                    onChange={(e) => setSettings({ ...settings, clinic_latitude: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl text-xl focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Longitude</label>
                  <input
                    type="number"
                    value={settings.clinic_longitude}
                    onChange={(e) => setSettings({ ...settings, clinic_longitude: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl text-xl focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Allowed Radius (Meters)</label>
                <input
                  type="number"
                  value={settings.allowed_radius}
                  onChange={(e) => setSettings({ ...settings, allowed_radius: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl text-xl focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={useCurrentLocation}
                  className="flex-1 flex items-center justify-center gap-3 bg-slate-800 text-white py-5 rounded-2xl font-bold text-xl hover:bg-slate-900 transition-all"
                >
                  <FaCrosshairs />
                  Detect My Location
                </button>
                <button
                  onClick={updateSettings}
                  className="flex-1 flex items-center justify-center gap-3 bg-blue-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all shadow-lg"
                >
                  <FaSave />
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* HELP CARD */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[40px] p-12 text-white shadow-2xl flex flex-col justify-center">
            <h2 className="text-4xl font-bold mb-6">How it works?</h2>
            <ul className="space-y-6 text-xl text-indigo-100">
              <li className="flex gap-4">
                <span className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                The system checks the employee's GPS during check-in.
              </li>
              <li className="flex gap-4">
                <span className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                If they are within the "Allowed Radius" (e.g., 500m), they can proceed.
              </li>
              <li className="flex gap-4">
                <span className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                This prevents staff from checking in while at home or away from the clinic.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
