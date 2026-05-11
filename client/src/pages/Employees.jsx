import React, {
  useEffect,
  useState
} from 'react'

import axios from 'axios'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'

const Employees = () => {

  const [employees,
    setEmployees] =
      useState([])

  const [loading,
    setLoading] =
      useState(true)

  const [editingEmployee,
    setEditingEmployee] =
      useState(null)

  const [showAddModal,
    setShowAddModal] =
      useState(false)

  const [uploadingImage,
    setUploadingImage] =
      useState(false)

  const [newEmployee,
    setNewEmployee] =
      useState({

        eid: '',

        full_name: '',

        role: 'assistant',

        hourly_rate: '',

        morning_shift: true,

        evening_shift: false,

        face_image: '',

        password: ''

      })

  // =========================
  // FETCH EMPLOYEES
  // =========================

  useEffect(() => {

    fetchEmployees()

  }, [])

  const fetchEmployees =
    async () => {

      try {

        const response = await axios.get('\/api/employees', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })

        if (
          response.data.success
        ) {

          setEmployees(
            response.data.employees
          )

        }

      } catch (err) {

        console.log(err)

        toast.error(
          err.response?.data?.error || 'Failed to load employees'
        )

      } finally {

        setLoading(false)

      }

    }

  // =========================
  // ADD EMPLOYEE
  // =========================

  const addEmployee =
    async () => {

      try {
        if (!newEmployee.full_name || !newEmployee.password || !newEmployee.face_image) {
            toast.error('Please fill Full Name, Password and upload a face photo')
            return
        }

        const payload = {
          ...newEmployee,
          eid: newEmployee.eid.trim(),
          full_name: newEmployee.full_name.trim(),
          password: newEmployee.password.trim()
        }

        const response =
          await axios.post(

            '\/api/employees/create',

            payload,

            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }

          )

        if (
          response.data.success
        ) {

          toast.success(
            `Employee added. Login ID: ${response.data.employee.eid}`,
            {
              duration: 8000
            }
          )

          setShowAddModal(false)

          setNewEmployee({

            eid: '',

            full_name: '',

            role: 'assistant',

            hourly_rate: '',

            morning_shift: true,

            evening_shift: false,

            face_image: '',

            password: ''

          })

          fetchEmployees()

        }

      } catch (err) {

        console.log(err)

        toast.error(

          err.response?.data?.error ||

          'Add employee failed'

        )

      }

    }

  // =========================
  // DELETE EMPLOYEE
  // =========================

  const deleteEmployee =
    async (id) => {

      const confirmDelete =
        window.confirm(
          'Are you sure you want to delete this employee? This will also remove their attendance and payroll history.'
        )

      if (!confirmDelete) {

        return

      }

      try {

        const response = await axios.delete(`\/api/employees/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })

        if (
          response.data.success
        ) {

          toast.success(
            'Employee records removed'
          )

          fetchEmployees()

        }

      } catch (err) {

        console.log(err)

        toast.error(
          'Delete failed'
        )

      }

    }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* PILL HEADER */}
        <div className="pill-header p-6 md:p-10 pb-24 md:pb-24 text-white relative">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-xs md:text-sm font-medium opacity-80 uppercase tracking-widest mb-1">Staff Directory</h1>
              <div className="text-3xl md:text-5xl font-bold">
                Registered <br className="md:hidden" /><span className="opacity-70 font-light">Employees</span>
              </div>
            </div>
            <button
                onClick={() => setShowAddModal(true)}
                className="w-full md:w-auto bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-[20px] font-bold text-base md:text-lg transition-smooth shadow-lg flex items-center justify-center gap-2"
            >
                <span className="text-xl md:text-2xl">+</span> Add Member
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-2xl md:rounded-[25px] flex items-center gap-4 px-5 md:px-6 w-full max-w-2xl">
            <span className="text-white/60">🔍</span>
            <input 
                type="text" 
                placeholder="Search by name, ID or role..." 
                className="bg-transparent border-none outline-none text-white placeholder:text-white/40 w-full text-base md:text-lg"
            />
          </div>
        </div>

        <div className="p-6 md:p-10 -mt-8 md:-mt-12 space-y-4">
          {loading ? (
            <div className="flex justify-center p-20">
              <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            employees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white rounded-2xl md:rounded-[30px] p-4 md:p-6 card-shadow flex flex-col md:flex-row items-center justify-between border border-gray-50 group transition-smooth hover:scale-[1.01] gap-4"
              >
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto text-center md:text-left">
                  <img
                    src={employee.face_image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(employee.full_name) + '&background=dbeafe&color=2563eb&size=150'}
                    alt="employee"
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-blue-50 shadow-md"
                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(employee.full_name) + '&background=dbeafe&color=2563eb&size=150' }}
                  />
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-[#2c3e50]">{employee.full_name}</h2>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                        <span className="bg-blue-50 text-blue-600 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                            ID: {employee.eid}
                        </span>
                        <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                            employee.role === 'doctor' ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'
                        }`}>
                            {employee.role}
                        </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-0.5">Hourly Rate</p>
                    <p className="text-lg md:text-xl font-black text-[#2c3e50]">₹{employee.hourly_rate}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                        onClick={() => deleteEmployee(employee.id)}
                        className="bg-red-50 text-red-500 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-red-500 hover:text-white transition-smooth shadow-sm active:scale-90"
                    >
                        🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ADD MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[30px] md:rounded-[40px] p-6 md:p-10 w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">

              <h2 className="text-3xl font-black mb-8 text-[#2c3e50]">New Employee Registration</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-2">Employee ID</label>
                        <input
                            type="text"
                            placeholder="Auto-generate"
                            value={newEmployee.eid}
                            onChange={(e) => setNewEmployee({ ...newEmployee, eid: e.target.value })}
                            className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 ring-blue-500 outline-none font-semibold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-2">Hourly Rate (₹)</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={newEmployee.hourly_rate}
                            onChange={(e) => setNewEmployee({ ...newEmployee, hourly_rate: e.target.value })}
                            className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 ring-blue-500 outline-none font-semibold"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-2">Full Name</label>
                    <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={newEmployee.full_name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
                        className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 ring-blue-500 outline-none font-semibold"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-2">Login Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={newEmployee.password}
                        onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                        className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 ring-blue-500 outline-none font-semibold"
                    />
                </div>

                {/* IMAGE UPLOAD */}
                <div className="bg-gray-50 rounded-[30px] p-6 text-center border-2 border-dashed border-gray-200">
                    <input
                        type="file"
                        id="face-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                            try {
                                const file = e.target.files[0]
                                if (!file) return
                                setUploadingImage(true)
                                const formData = new FormData()
                                formData.append('image', file)
                                const response = await axios.post('/api/upload', formData, {
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                })
                                setNewEmployee({ ...newEmployee, face_image: response.data.imageUrl })
                                toast.success('Face photo uploaded!')
                            } catch (err) {
                                toast.error('Upload failed')
                            } finally {
                                setUploadingImage(false)
                            }
                        }}
                    />
                    <label htmlFor="face-upload" className="cursor-pointer block">
                        {newEmployee.face_image ? (
                            <img src={newEmployee.face_image} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-500 shadow-md" alt="preview" />
                        ) : (
                            <div className="text-gray-400">
                                <div className="text-4xl mb-2">📸</div>
                                <p className="font-bold text-sm">Click to upload face photo</p>
                            </div>
                        )}
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-2">Designation</label>
                    <select
                        value={newEmployee.role}
                        onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                        className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 ring-blue-500 outline-none font-semibold appearance-none"
                    >
                        <option value="doctor">Doctor</option>
                        <option value="assistant">Assistant</option>
                    </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={addEmployee}
                    disabled={uploadingImage}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-xl transition-smooth disabled:opacity-50"
                  >
                    {uploadingImage ? '...' : 'Register Employee'}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 py-4 rounded-2xl font-black transition-smooth"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Employees;
