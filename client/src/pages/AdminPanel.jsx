import React, { useState } from 'react'
import axios from 'axios'

const AdminPanel = () => {

  const [formData, setFormData] = useState({
    full_name: '',
    role: 'assistant',
    hourly_rate: '',
    morning_shift: false,
    evening_shift: false
  })

  const [image, setImage] = useState(null)

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target

    setFormData({
      ...formData,
      [name]:
        type === 'checkbox'
          ? checked
          : value
    })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      const data = new FormData()

      data.append(
        'full_name',
        formData.full_name
      )

      data.append(
        'role',
        formData.role
      )

      data.append(
        'hourly_rate',
        formData.hourly_rate
      )

      data.append(
        'morning_shift',
        formData.morning_shift
      )

      data.append(
        'evening_shift',
        formData.evening_shift
      )

      data.append('image', image)

      const response = await axios.post(
        '\/api/employees/create',
        data
      )

      alert(response.data.message)

    } catch (err) {

      console.error(err)

      alert(
        err.response?.data?.error ||
        'Failed to create employee'
      )

    }
  }

  return (

    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-purple-700 to-pink-300 p-10">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-3xl w-full max-w-xl shadow-2xl flex flex-col gap-6"
      >

        <h1 className="text-4xl font-bold text-center">
          Admin Panel
        </h1>

        <input
          type="text"
          name="full_name"
          placeholder="Employee Name"
          value={formData.full_name}
          onChange={handleChange}
          className="p-4 rounded-xl border"
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="p-4 rounded-xl border"
        >

          <option value="doctor">
            Doctor
          </option>

          <option value="assistant">
            Assistant
          </option>

        </select>

        <input
          type="number"
          name="hourly_rate"
          placeholder="Hourly Salary"
          value={formData.hourly_rate}
          onChange={handleChange}
          className="p-4 rounded-xl border"
          required
        />

        <div className="flex gap-6">

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              name="morning_shift"
              checked={formData.morning_shift}
              onChange={handleChange}
            />

            Morning Shift

          </label>

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              name="evening_shift"
              checked={formData.evening_shift}
              onChange={handleChange}
            />

            Evening Shift

          </label>

        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImage(e.target.files[0])
          }
          required
        />

        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold text-xl"
        >
          Create Employee
        </button>

      </form>

    </div>

  )
}

export default AdminPanel