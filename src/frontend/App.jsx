import React from "react"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'

// Import components directly instead of lazy loading
import HomePage from './HomePage'
import CalendarComponent from './CalendarComponent'

// Loading component for route transitions
const RouteLoadingFallback = () => (
  <div className="flex items-center justify-center h-[calc(100vh-64px)] w-full bg-gray-900">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/booking" element={<CalendarComponent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
