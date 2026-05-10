import React, { useEffect, useState } from 'react'
import axios from 'axios'

const EmployeeList = () => {

    const [employees, setEmployees] = useState([])

    useEffect(() => {

        fetchEmployees()

    }, [])

    const fetchEmployees = async () => {

        try {

            const res = await axios.get(
                '\/api/employees'
            )

            setEmployees(res.data.employees)

        } catch (err) {

            console.error(err)

            alert('Failed to load employees')

        }

    }

    return (

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
          max-w-5xl
          mx-auto
          bg-white
          rounded-3xl
          shadow-2xl
          p-8
        "
            >

                <h1
                    className="
            text-5xl
            font-bold
            mb-8
            text-center
          "
                >
                    Employees
                </h1>

                <div className="grid gap-6">

                    {
                        employees.map((employee) => (

                            <div
                                key={employee.id}
                                className="
                  border
                  rounded-2xl
                  p-5
                  flex
                  justify-between
                  items-center
                  shadow-md
                "
                            >

                                <div>

                                    <h2 className="text-2xl font-bold">
                                        {employee.full_name}
                                    </h2>

                                    <p>
                                        Role:
                                        {' '}
                                        {employee.role}
                                    </p>

                                    <p>
                                        EID:
                                        {' '}
                                        {employee.eid}
                                    </p>

                                    <p>
                                        Salary:
                                        {' '}
                                        ₹{employee.hourly_rate}/hr
                                    </p>

                                </div>

                                {
                                    employee.image_url && (

                                        <img
                                            src={`\${employee.image_url}`}
                                            alt="employee"
                                            className="
                        w-28
                        h-28
                        rounded-2xl
                        object-cover
                      "
                                        />

                                    )
                                }

                            </div>

                        ))
                    }

                </div>

            </div>

        </div>

    )

}

export default EmployeeList