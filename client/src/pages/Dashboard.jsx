import React, {
  useEffect,
  useState
} from 'react'

import axios from 'axios'

import Layout from '../components/Layout'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const Dashboard = () => {

  const [employees, setEmployees] =
    useState([])

  const [payrolls, setPayrolls] =
    useState([])

  const [attendance, setAttendance] =
    useState([])

  // =========================
  // FETCH DATA
  // =========================

  useEffect(() => {

    fetchDashboardData()

  }, [])

  const fetchDashboardData = async () => {

    try {

      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }

      const employeeRes = await axios.get('\/api/employees', { headers })
      const payrollRes = await axios.get('\/api/payroll', { headers })
      const attendanceRes = await axios.get('\/api/attendance', { headers })

      setEmployees(
        employeeRes.data.employees || []
      )

      setPayrolls(
        payrollRes.data.payrolls || []
      )

      setAttendance(
        attendanceRes.data.attendance || []
      )

    } catch (err) {

      console.log(err)

    }

  }

  // =========================
  // STATS
  // =========================

  const totalDoctors =
    employees.filter(
      (emp) =>
        emp.role === 'doctor'
    ).length

  const totalAssistants =
    employees.filter(
      (emp) =>
        emp.role === 'assistant'
    ).length

  const totalPayroll =
    payrolls.reduce(
      (acc, curr) =>
        acc +
        Number(
          curr.final_salary || 0
        ),
      0
    )

  const lateEmployees =
    attendance.filter(
      (att) =>
        Number(
          att.late_minutes
        ) > 0
    ).length

  // =========================
  // CHART DATA
  // =========================

  const roleData = [

    {
      name: 'Doctors',
      value: totalDoctors
    },

    {
      name: 'Assistants',
      value: totalAssistants
    }

  ]

  const payrollChartData =
    payrolls.map((payroll) => ({

      name: payroll.eid,

      salary:
        payroll.final_salary

    }))

    return (
    <Layout>
      <div className="min-h-screen pb-10">
        {/* PILL HEADER */}
        <div className="pill-header p-5 md:p-10 pb-16 md:pb-32 text-white relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-[10px] md:text-sm font-medium opacity-80 uppercase tracking-widest mb-1">Clinic Dashboard</h1>
              <div className="text-3xl md:text-5xl font-bold leading-tight">
                Welcome to <br className="md:hidden" /><span className="opacity-70 font-light">Admin</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl w-full md:w-auto">
                <div className="flex items-center gap-3 px-3 py-1">
                    <span className="text-white/60">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search stats..." 
                        className="bg-transparent border-none outline-none text-white placeholder:text-white/40 w-full md:w-64 text-sm"
                    />
                </div>
            </div>
          </div>

          {/* STAT CARDS - Relative on mobile, Absolute on Desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 relative md:absolute md:-bottom-16 md:left-10 md:right-10 z-10">
            {[
              { label: 'Employees', value: employees.length, color: 'blue' },
              { label: 'Doctors', value: totalDoctors, color: 'emerald' },
              { label: 'Assistants', value: totalAssistants, color: 'sky' },
              { label: 'Payroll', value: `₹${totalPayroll.toLocaleString()}`, color: 'indigo' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[30px] card-shadow flex flex-col justify-center border border-gray-100 h-24 md:h-32">
                <p className="text-gray-400 text-[10px] md:text-sm font-bold uppercase tracking-tight mb-1 md:mb-2 line-clamp-1">{stat.label}</p>
                <p className="text-lg md:text-3xl font-extrabold text-[#2c3e50]">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-10 mt-6 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* CHARTS */}
          <div className="bg-white rounded-[30px] md:rounded-[40px] p-6 md:p-10 card-shadow">

            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-[#2c3e50]">Payroll Analytics</h2>
              <button className="text-blue-500 font-bold text-sm">View Reports</button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={payrollChartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} 
                    cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="salary" fill="#2a73e8" radius={[10, 10, 10, 10]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-[30px] md:rounded-[40px] p-6 md:p-10 card-shadow">

            <h2 className="text-2xl font-black text-[#2c3e50] mb-10">Staff Composition</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  cornerRadius={10}
                >
                  {roleData.map((_, index) => (
                    <Cell key={index} fill={index === 0 ? '#2a73e8' : '#34d399'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LATE SECTION */}
        <div className="p-4 md:p-10 pt-0">
            <div className="bg-white rounded-[30px] md:rounded-[40px] p-6 md:p-10 card-shadow flex flex-col md:flex-row items-center justify-between border-l-[8px] md:border-l-[12px] border-red-400 gap-4">

                <div>
                    <h2 className="text-2xl font-black text-[#2c3e50]">Punctuality Warning</h2>
                    <p className="text-gray-400 font-medium">Employees arriving after shift start today</p>
                </div>
                <div className="bg-red-50 px-8 py-4 rounded-3xl">
                    <span className="text-4xl font-black text-red-500">{lateEmployees}</span>
                    <span className="text-red-300 ml-2 font-bold">LATE</span>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard;