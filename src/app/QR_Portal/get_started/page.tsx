'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function GetStartedPage() {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    restaurant: '',
    country: '',
    city: '',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/QR_Panel/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setSubmitted(true)
      setForm({
        name: '',
        surname: '',
        phone: '',
        email: '',
        restaurant: '',
        country: '',
        city: '',
        message: '',
      })
    } else {
      alert('Error sending message.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mix-blend-multiply opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-52 h-52 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
      <div className="absolute top-1/4 right-1/4 w-44 h-44 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-3000"></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-5000"></div>
      {!submitted &&(<div className="mt-8 text-center">
        <Link
          href="/"
          className="absolute right-5 top-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
        >
          Return
        </Link> 
        </div>)}
      

        
        {submitted ? (
          <>
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
    
    <div className="text-green-600 font-semibold text-4xl text-center">
      Thank you! We'll contact you soon.
    </div><div className="text-green-600 font-semibold text-4xl">
      ✅
    </div>
    <Link
      href="/"
      className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
    >
      Return to Home
    </Link>
  </div>

</>


        ) : (
        <div className="max-w-2xl w-full space-y-6 relative z-10">
        <h1 className="text-6xl font-bold text-center text-gray-900">Get Started</h1>
        <p className="text-center text-gray-700 mb-6">Fill out the form below and we’ll get back to you shortly.</p>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'name', placeholder: 'First Name' },
                { name: 'surname', placeholder: 'Last Name' },
                { name: 'phone', placeholder: 'Phone Number' },
                { name: 'email', placeholder: 'Email Address', type: 'email' },
                { name: 'restaurant', placeholder: 'Restaurant Name' },
                { name: 'country', placeholder: 'Country' },
                { name: 'city', placeholder: 'City' },
              ].map(({ name, placeholder, type }) => (
                <input
                  key={name}
                  name={name}
                  type={type || 'text'}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  required
                  placeholder={placeholder}
                  className="w-full px-5 py-3 rounded-xl bg-white border border-gray-300 placeholder-gray-400 text-gray-900 text-lg transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                />
              ))}
            </div>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Optional message or request..."
              rows={5}
              className="w-full px-5 py-4 rounded-xl bg-white border border-gray-300 placeholder-gray-400 text-gray-900 text-lg resize-none transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
            />
            <button
              type="submit"
              className="w-full py-4 bg-purple-600 text-white text-lg font-semibold rounded-xl hover:bg-purple-700 transition shadow-md"
            >
              Send Details
            </button>
          </form>
          </div>
        )}
      </div>
  )
}
