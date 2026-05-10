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

      <div
        className="
        min-h-screen
        bg-gradient-to-r
        from-blue-700
        to-cyan-300
        p-10
        "
      >

        <div
          className="
          max-w-7xl
          mx-auto
          bg-white
          rounded-3xl
          shadow-2xl
          p-10
          "
        >

          <h1
            className="
            text-6xl
            font-bold
            mb-10
            text-center
            "
          >
            Attendance History
          </h1>

          {
            loading
              ? (
                <p
                  className="
                  text-2xl
                  text-center
                  "
                >
                  Loading...
                </p>
              )
              : (

                <div
                  className="
                  overflow-x-auto
                  "
                >

                  <table
                    className="
                    w-full
                    text-left
                    border-collapse
                    "
                  >

                    <thead>

                      <tr
                        className="
                        bg-blue-700
                        text-white
                        "
                      >

                        <th className="p-4">
                          Employee
                        </th>

                        <th className="p-4">
                          Date
                        </th>

                        <th className="p-4">
                          Shift
                        </th>

                        <th className="p-4">
                          Clock In
                        </th>

                        <th className="p-4">
                          Clock Out
                        </th>

                        <th className="p-4">
                          Worked Hours
                        </th>

                        <th className="p-4">
                          Late Minutes
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {
                        attendance.map(
                          (record) => (

                            <tr
                              key={record.id}
                              className="
                              border-b
                              hover:bg-gray-100
                              "
                            >

                              <td className="p-4">
                                <div className="font-bold">{record.employee_name}</div>
                                <div className="text-sm text-gray-500">{record.eid}</div>
                              </td>

                              <td className="p-4">
                                {record.date}
                              </td>

                              <td className="p-4">
                                {record.shift}
                              </td>

                              <td className="p-4">
                                {record.check_in ? (
                                  (() => {
                                    const d = new Date(record.check_in);
                                    return isNaN(d.getTime()) 
                                      ? (record.check_in.split('T')[1]?.slice(0,5) || record.check_in)
                                      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                  })()
                                ) : '—'}
                              </td>

                              <td className="p-4">
                                {record.check_out ? (
                                  (() => {
                                    const d = new Date(record.check_out);
                                    return isNaN(d.getTime()) 
                                      ? (record.check_out.split('T')[1]?.slice(0,5) || record.check_out)
                                      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                  })()
                                ) : '—'}
                              </td>

                              <td className="p-4">
                                {
                                  record.working_hours ||
                                  0
                                }
                              </td>

                              <td
                                className="
                                p-4
                                text-red-600
                                font-bold
                                "
                              >
                                {
                                  record.late_minutes ||
                                  0
                                }
                              </td>

                            </tr>

                          )
                        )
                      }

                    </tbody>

                  </table>

                </div>

              )
          }

        </div>

      </div>

    </Layout>

  )

}

export default AttendanceHistory