import { useState } from 'react'
import './App.css'
import { Header } from './components/Header'

function App() {
  return (
     <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-8">
        <h1 className="text-2xl">Bienvenido a El Fogón</h1>
      </main>
    </div>
  )
}

export default App
