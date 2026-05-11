import React, {
  useEffect,
  useState
} from 'react'

import axios from 'axios'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'

const AttendanceHistory = () => {

  const [attendance, setAttendance] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  // =========================
  // FETCH ATTENDANCE
  // =========================

  useEffect(() => {

    fetchAttendance()

  }, [])

  const fetchAttendance = async () => {

    try {

      const response = await axios.get('\/api/attendance', {
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
      })

      console.log(response.data)

      if (
        response.data.success
      ) {

        setAttendance(
          response.data.attendance
        )

      }

    } catch (err) {

      console.log(err)

      toast.error(
        err.response?.data?.error || 'Failed to load attendance'
      )

    } finally {

      setLoading(false)

    }

  }

  return (

    <Layout>
      <div className="min-h-screen">
        {/* PILL HEADER */}
        <div className="pill-header p-6 md:p-10 pb-20 md:pb-24 text-white relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-xs md:text-sm font-medium opacity-80 uppercase tracking-widest mb-1">Clinic Records</h1>
              <div className="text-3xl md:text-5xl font-bold">
                Attendance <br className="md:hidden" /><span className="opacity-70 font-light">History</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-10 -mt-10 md:-mt-16">
          <div className="bg-white rounded-[20px] md:rounded-[40px] shadow-2xl p-4 md:p-10 overflow-hidden">
            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="p-4 md:p-5 rounded-l-2xl font-bold uppercase text-xs tracking-wider">Employee</th>
                        <th className="p-4 md:p-5 font-bold uppercase text-xs tracking-wider">Date</th>
                        <th className="p-4 md:p-5 font-bold uppercase text-xs tracking-wider">Shift</th>
                        <th className="p-4 md:p-5 font-bold uppercase text-xs tracking-wider">Clock In</th>
                        <th className="p-4 md:p-5 font-bold uppercase text-xs tracking-wider">Clock Out</th>
                        <th className="p-4 md:p-5 font-bold uppercase text-xs tracking-wider">Hours</th>
                        <th className="p-4 md:p-5 rounded-r-2xl font-bold uppercase text-xs tracking-wider">Late (m)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {attendance.map((record) => (
                        <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="p-4 md:p-5">
                            <div className="font-bold text-[#2c3e50]">{record.employee_name}</div>
                            <div className="text-[10px] md:text-xs text-blue-500 font-bold">ID: {record.eid}</div>
                          </td>
                          <td className="p-4 md:p-5 text-sm font-medium text-gray-600">{record.date}</td>
                          <td className="p-4 md:p-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                record.shift === 'morning' ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'
                            }`}>
                                {record.shift}
                            </span>
                          </td>
                          <td className="p-4 md:p-5 text-sm font-bold text-emerald-600">
                            {record.check_in ? (
                                (() => {
                                const d = new Date(record.check_in);
                                return isNaN(d.getTime()) 
                                    ? (record.check_in.split('T')[1]?.slice(0,5) || record.check_in)
                                    : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                })()
                            ) : '—'}
                          </td>
                          <td className="p-4 md:p-5 text-sm font-bold text-blue-600">
                            {record.check_out ? (
                                (() => {
                                const d = new Date(record.check_out);
                                return isNaN(d.getTime()) 
                                    ? (record.check_out.split('T')[1]?.slice(0,5) || record.check_out)
                                    : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                })()
                            ) : '—'}
                          </td>
                          <td className="p-4 md:p-5 text-sm font-black text-[#2c3e50]">{record.working_hours || 0}</td>
                          <td className="p-4 md:p-5">
                            <span className={`font-black ${Number(record.late_minutes) > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                                {record.late_minutes || 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </Layout>

  )

}

export default AttendanceHistory