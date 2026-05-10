import React, {
  useEffect,
  useState
} from 'react'

import axios from 'axios'

import Layout from '../components/Layout'

const formatMoney = (value) =>
  `₹${Number(value || 0).toFixed(2)}`

const formatHours = (value) =>
  Number(value || 0).toFixed(2)

const PayrollHistory = () => {

  const [payrolls, setPayrolls] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    fetchPayrolls()
  }, [])

  const fetchPayrolls = async () => {

    try {

      setError('')

      const response = await axios.get('/api/payroll', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.data.success) {
        setPayrolls(response.data.payrolls || [])
      } else {
        setError(
          response.data.error ||
          'Failed to load payroll history'
        )
      }

    } catch (err) {

      console.log(err)

      setError(
        err.response?.data?.error ||
        'Failed to load payroll history'
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
            mb-4
            text-center
            "
          >
            Payroll History
          </h1>

          <div className="flex justify-center gap-10 mb-10">
            <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-100 text-center">
                <div className="text-purple-600 font-semibold uppercase tracking-wider text-sm">Total Payout</div>
                <div className="text-4xl font-bold text-purple-900">
                    {formatMoney(payrolls.reduce((sum, p) => sum + Number(p.final_salary), 0))}
                </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 text-center">
                <div className="text-blue-600 font-semibold uppercase tracking-wider text-sm">Employees Paid</div>
                <div className="text-4xl font-bold text-blue-900">
                    {new Set(payrolls.map(p => p.eid)).size}
                </div>
            </div>
          </div>

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
              : error
                ? (
                  <div
                    className="
                    rounded-2xl
                    bg-red-50
                    border
                    border-red-200
                    text-red-700
                    p-6
                    text-center
                    text-xl
                    font-semibold
                    "
                  >
                    {error}
                  </div>
                )
                : payrolls.length === 0
                  ? (
                    <div
                      className="
                      rounded-2xl
                      bg-gray-50
                      border
                      border-gray-200
                      text-gray-600
                      p-8
                      text-center
                      text-xl
                      "
                    >
                      No payroll history found. Generate payroll first.
                    </div>
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
                            bg-purple-700
                            text-white
                            "
                          >

                            <th className="p-4">
                              Employee
                            </th>

                            <th className="p-4">
                              Month
                            </th>

                            <th className="p-4">
                              Hours
                            </th>

                            <th className="p-4">
                              Late Minutes
                            </th>

                            <th className="p-4">
                              Gross
                            </th>

                            <th className="p-4">
                              Deduction
                            </th>

                            <th className="p-4">
                              Final Salary
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {
                            payrolls.map(
                              (payroll) => (

                                <tr
                                  key={payroll.id}
                                  className="
                                  border-b
                                  hover:bg-gray-100
                                  "
                                >

                                  <td className="p-4">
                                    <div className="font-bold">
                                      {
                                        payroll.employee_name
                                      }
                                    </div>
                                    <div className="text-sm text-gray-500 uppercase tracking-tighter">
                                      {payroll.employee_role} • {payroll.eid}
                                    </div>
                                  </td>

                                  <td className="p-4">
                                    {payroll.month}
                                  </td>

                                  <td className="p-4">
                                    {formatHours(payroll.total_hours)}
                                  </td>

                                  <td className="p-4">
                                    {payroll.late_minutes || 0}
                                  </td>

                                  <td className="p-4">
                                    {formatMoney(payroll.gross_salary)}
                                  </td>

                                  <td className="p-4">
                                    {formatMoney(payroll.deduction)}
                                  </td>

                                  <td
                                    className="
                                    p-4
                                    font-bold
                                    text-green-700
                                    "
                                  >
                                    {formatMoney(payroll.final_salary)}
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

export default PayrollHistory
