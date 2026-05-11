import React, { useState } from 'react'
import Sidebar from './Sidebar'
import { FaBars, FaTimes } from 'react-icons/fa'

const Layout = ({ children }) => {

  return (
    <div className="flex min-h-screen bg-[#f4f7fe] relative">
      
      {/* MOBILE HEADER - Only shows on small screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 z-50">
        <h1 className="text-xl font-black text-[#2a73e8]">Clinic Admin</h1>
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-3 text-[#2a73e8] bg-blue-50 rounded-xl hover:bg-blue-100 transition-all active:scale-95"
        >
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR - Responsive positioning */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* PAGE CONTENT */}
      <div className="flex-1 overflow-x-hidden pt-16 lg:pt-0">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </div>

    </div>
  )
}

export default Layout