import React from 'react'

import Sidebar from './Sidebar'

const Layout = ({ children }) => {

  return (

    <div
      className="
      flex
      min-h-screen
      bg-[#f4f7fe]
      "
    >

      {/* SIDEBAR */}

      <Sidebar />

      {/* PAGE CONTENT */}

      <div
        className="
        flex-1
        overflow-auto
        "
      >

        {children}

      </div>

    </div>

  )

}

export default Layout