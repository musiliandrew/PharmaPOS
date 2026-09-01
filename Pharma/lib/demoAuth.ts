import api from '@/lib/api'

export async function loginAsDemoUser(): Promise<boolean> {
  try {
    const res = await api.post('/auth/login', {
      email: 'jane@abcchemist.co.ke',
      password: 'Password123!'
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('pharma_access_token', res.data.access_token)
    }
    return true
  } catch (err) {
    console.error('Demo authentication error:', err)
    return false
  }
}
