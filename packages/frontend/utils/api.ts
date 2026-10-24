import type { User, Property, Booking, AuthResponse } from '~/types'

const api = $fetch.create({
  baseURL: useRuntimeConfig().public.apiBase,
  onRequest({ options }) {
    const token = localStorage.getItem('token')
    if (token) {
      (options.headers as any)['Authorization'] = `Bearer ${token}`
    }
  },
  onResponseError({ response }) {
    if (response.status === 401) {
      localStorage.removeItem('token')
      navigateTo('/auth/login')
    }
  }
})

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return await api('/auth/login', {
      method: 'POST',
      body: { email, password }
    })
  },
  register: async (data: any): Promise<AuthResponse> => {
    return await api('/auth/register', {
      method: 'POST',
      body: data
    })
  },
  getProfile: async (): Promise<User> => {
    return await api('/auth/profile')
  }
}

export const propertiesApi = {
  getAll: async (filters?: any): Promise<Property[]> => {
    return await api('/properties', { params: filters })
  },
  getById: async (id: string): Promise<Property> => {
    return await api(`/properties/${id}`)
  },
  create: async (data: any): Promise<Property> => {
    return await api('/properties', {
      method: 'POST',
      body: data
    })
  },
  update: async (id: string, data: any): Promise<Property> => {
    return await api(`/properties/${id}`, {
      method: 'PUT',
      body: data
    })
  },
  delete: async (id: string): Promise<void> => {
    await api(`/properties/${id}`, { method: 'DELETE' })
  }
}

export const bookingsApi = {
  getAll: async (filters?: any): Promise<Booking[]> => {
    return await api('/bookings', { params: filters })
  },
  getById: async (id: string): Promise<Booking> => {
    return await api(`/bookings/${id}`)
  },
  create: async (data: any): Promise<Booking> => {
    return await api('/bookings', {
      method: 'POST',
      body: data
    })
  },
  cancel: async (id: string): Promise<Booking> => {
    return await api(`/bookings/${id}/cancel`, { method: 'POST' })
  }
}
