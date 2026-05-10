import React, {
  useState
} from 'react'

import axios from 'axios'

import Layout from '../components/Layout'

const CheckIn = () => {

  const [eid, setEid] =
    useState('')

  const [loading,
    setLoading] =
      useState(false)

  // =========================
  // CHECK IN
  // =========================

  const checkIn = () => {

    if (!eid) {

      alert(
        'Enter employee ID'
      )

      return

    }

    // =========================
    // GET GPS
    // =========================

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        try {

          setLoading(true)

          const latitude =
            position.coords.latitude

          const longitude =
            position.coords.longitude

          console.log(
            latitude,
            longitude
          )

          const response =
            await axios.post(
              '\/api/attendance/check-in',
              {

                eid,

                latitude,

                longitude

              }
            )

          if (
            response.data.success
          ) {

            alert(
              'Attendance marked successfully'
            )

          }

        } catch (err) {

          console.log(err)

          alert(

            err.response?.data?.error ||

            'Check-in failed'

          )

        } finally {

          setLoading(false)

        }

      },

      () => {

        alert(
          'Location permission denied'
        )

      }

    )

  }

  return (

    <Layout>

      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gradient-to-r
        from-green-700
        to-emerald-300
        p-10
        "
      >

        <div
          className="
          bg-white
          rounded-3xl
          shadow-2xl
          p-10
          w-full
          max-w-xl
          "
        >

          <h1
            className="
            text-5xl
            font-bold
            text-center
            mb-10
            "
          >
            Employee Check-In
          </h1>

          <div
            className="
            space-y-6
            "
          >

            <input
              type="text"
              placeholder="Employee ID"
              value={eid}
              onChange={(e) =>
                setEid(
                  e.target.value
                )
              }
              className="
              w-full
              border
              p-5
              rounded-2xl
              text-xl
              "
            />

            <button
              onClick={checkIn}
              disabled={loading}
              className="
              w-full
              bg-green-600
              hover:bg-green-700
              text-white
              py-5
              rounded-2xl
              font-bold
              text-2xl
              "
            >

              {
                loading
                  ? 'Checking In...'
                  : 'Check In'
              }

            </button>

          </div>

        </div>

      </div>

    </Layout>

  )

}

export default CheckIn