import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Attendance from '../pages/Attendance'

const AppRoutes = () => {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Attendance />}
                />

            </Routes>

        </BrowserRouter>

    )
}

export default AppRoutes