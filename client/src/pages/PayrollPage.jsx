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

    <Layout>
      <div className="min-h-screen">
        {/* PILL HEADER */}
        <div className="pill-header p-6 md:p-10 pb-20 md:pb-24 text-white relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-xs md:text-sm font-medium opacity-80 uppercase tracking-widest mb-1">Financial Suite</h1>
              <div className="text-3xl md:text-5xl font-bold">
                Payroll <br className="md:hidden" /><span className="opacity-70 font-light">Dashboard</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-10 -mt-10 md:-mt-16">
          <div className="max-w-4xl mx-auto bg-white rounded-[30px] md:rounded-[40px] shadow-2xl p-6 md:p-10">
            <div className="space-y-4 md:space-y-6 mb-8">
                <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-2">Select Employee</label>
                    <select
                        value={selectedEid}
                        onChange={(e) => setSelectedEid(e.target.value)}
                        className="w-full bg-gray-50 border-none p-4 md:p-5 rounded-2xl focus:ring-2 ring-purple-500 outline-none font-semibold text-lg md:text-xl appearance-none"
                    >
                        <option value="">Choose an employee...</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.eid}>{emp.full_name} ({emp.eid})</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-2">Select Month</label>
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full bg-gray-50 border-none p-4 md:p-5 rounded-2xl focus:ring-2 ring-purple-500 outline-none font-semibold text-lg md:text-xl"
                    />
                </div>
            </div>

            <button
                onClick={generatePayroll}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 md:py-6 rounded-2xl md:rounded-[25px] font-black text-xl md:text-2xl shadow-xl transition-smooth disabled:opacity-50 active:scale-95 mb-10"
            >
                {loading ? 'Processing...' : 'Generate Payroll'}
            </button>

            {payroll && (
              <div className="mt-6 md:mt-10 bg-purple-50/50 rounded-[30px] p-6 md:p-10 border border-purple-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-[#2c3e50] flex items-center gap-3">
                    <span className="bg-purple-600 text-white p-2 rounded-xl text-sm">📄</span>
                    Payroll Summary
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-[#2c3e50]">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Employee</p>
                    <p className="font-bold">{payroll.employee_name} ({payroll.eid})</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Worked Hours</p>
                    <p className="font-bold">{Number(payroll.total_hours || 0).toFixed(2)} hrs</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Lateness</p>
                    <p className={`font-bold ${Number(payroll.late_minutes) > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {payroll.late_minutes || 0} minutes
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Deductions</p>
                    <p className="font-bold text-red-500">{formatMoney(payroll.deduction)}</p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-purple-200">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Final Salary Disbursable</p>
                        <p className="text-4xl md:text-5xl font-black text-purple-600 bg-white px-6 py-3 rounded-2xl shadow-lg ring-4 ring-purple-100">
                            {formatMoney(payroll.final_salary)}
                        </p>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>

    </Layout>

  )

}

export default PayrollPage
