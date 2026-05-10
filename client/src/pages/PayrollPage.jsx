import React, {
  useEffect,
  useState
} from 'react'

import axios from 'axios'
import toast from 'react-hot-toast'

import Layout from '../components/Layout'

const formatMoney = (value) =>
  `Rs. ${Number(value || 0).toFixed(2)}`

const PayrollPage = () => {

  const [employees, setEmployees] =
    useState([])

  const [selectedEid, setSelectedEid] =
    useState('')

  const [month, setMonth] =
    useState(new Date().toISOString().slice(0, 7))

  const [payroll, setPayroll] =
    useState(null)

  const [loading, setLoading] =
    useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {

    try {

      const response = await axios.get('/api/employees', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.data.success) {
        setEmployees(response.data.employees || [])
      } else {
        toast.error('Failed to fetch employees')
      }

    } catch (err) {

      console.error('EMPLOYEE FETCH ERROR:', err)
      toast.error('Unable to get employees')

    }

  }

  const generatePayroll = async () => {

    try {

      if (!selectedEid) {
        toast.error('Please select employee')
        return
      }

      setLoading(true)
      setPayroll(null)

      const response = await axios.post('/api/payroll/generate', {
        eid: selectedEid,
        month
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.data.success) {
        setPayroll(response.data.payroll)
        toast.success('Payroll generated successfully')
      } else {
        toast.error('Payroll generation failed')
      }

    } catch (err) {

      console.error('PAYROLL ERROR:', err)

      toast.error(
        err.response?.data?.error ||
        'Payroll generation failed'
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
        from-purple-700
        to-pink-300
        p-10
        "
      >

        <div
          className="
          max-w-4xl
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
            text-center
            mb-12
            "
          >
            Payroll Dashboard
          </h1>

          <select
            value={selectedEid}
            onChange={(e) =>
              setSelectedEid(e.target.value)
            }
            className="
            w-full
            p-5
            rounded-2xl
            border
            text-2xl
            mb-6
            "
          >
            <option value="">
              Select Employee
            </option>

            {
              employees.length > 0
                ? employees.map((emp) => (
                  <option
                    key={emp.id}
                    value={emp.eid}
                  >
                    {emp.full_name} ({emp.eid})
                  </option>
                ))
                : (
                  <option disabled>
                    No employees found
                  </option>
                )
            }
          </select>

          <input
            type="month"
            value={month}
            onChange={(e) =>
              setMonth(e.target.value)
            }
            className="
            w-full
            p-5
            rounded-2xl
            border
            text-2xl
            mb-8
            "
          />

          <button
            onClick={generatePayroll}
            disabled={loading}
            className="
            w-full
            bg-purple-700
            hover:bg-purple-800
            text-white
            py-5
            rounded-2xl
            font-bold
            text-3xl
            disabled:opacity-50
            "
          >
            {
              loading
                ? 'Generating...'
                : 'Generate Payroll'
            }
          </button>

          {
            payroll && (
              <div
                className="
                mt-10
                bg-gray-100
                rounded-3xl
                p-8
                "
              >
                <h2
                  className="
                  text-5xl
                  font-bold
                  mb-8
                  "
                >
                  Payroll Summary
                </h2>

                <div
                  className="
                  space-y-5
                  text-2xl
                  "
                >
                  <p>
                    <strong>Employee:</strong>{' '}
                    {payroll.employee_name || payroll.eid} ({payroll.eid})
                  </p>

                  <p>
                    <strong>Month:</strong>{' '}
                    {payroll.month}
                  </p>

                  <p>
                    <strong>Attendance Records:</strong>{' '}
                    {payroll.attendance_count || 0}
                  </p>

                  <p>
                    <strong>Total Hours:</strong>{' '}
                    {Number(payroll.total_hours || 0).toFixed(2)}
                  </p>

                  <p>
                    <strong>Late Minutes:</strong>{' '}
                    {payroll.late_minutes || 0}
                  </p>

                  <p>
                    <strong>Gross Salary:</strong>{' '}
                    {formatMoney(payroll.gross_salary)}
                  </p>

                  <p>
                    <strong>Deduction Applied:</strong>{' '}
                    {formatMoney(payroll.deduction)}
                  </p>

                  {
                    Number(payroll.calculated_deduction || 0) >
                    Number(payroll.deduction || 0) && (
                      <p className="text-lg text-gray-600">
                        Late deduction was capped to gross salary.
                      </p>
                    )
                  }

                  <p
                    className="
                    text-5xl
                    font-bold
                    text-green-700
                    "
                  >
                    Final Salary:{' '}
                    {formatMoney(payroll.final_salary)}
                  </p>
                </div>
              </div>
            )
          }

        </div>

      </div>

    </Layout>

  )

}

export default PayrollPage
