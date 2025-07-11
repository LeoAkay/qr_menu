import { redirect } from 'next/navigation'

export default function Home() {
  // CHECK  THE LOGGED I USER
  // GET THE USER ROLE
  // DEPENDING ON THE ROLE, REDIRECT TO THE APPROPRIATE DASHBOARD
  // IF NOT LOGGED IN, REDIRECT TO LOGIN PAGE
  redirect('/admin_login')
}
