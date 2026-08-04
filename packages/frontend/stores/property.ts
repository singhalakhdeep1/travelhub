import { defineStore } from 'pinia'
import type { Property } from '~/types'
import { propertiesApi } from '~/utils/api'

export const usePropertyStore = defineStore('property', {
  state: () => ({
    properties: [] as Property[],
    selectedProperty: null as Property | null,
    isLoading: false
  }),
  actions: {
    async fetchProperties(filters?: any) {
      this.isLoading = true
      try {
        this.properties = await propertiesApi.getAll(filters)
      } finally {
        this.isLoading = false
      }
    },
    async fetchPropertyById(id: string) {
      this.isLoading = true
      try {
        this.selectedProperty = await propertiesApi.getById(id)
      } finally {
        this.isLoading = false
      }
    },
    async createProperty(data: any) {
      this.isLoading = true
      try {
        const property = await propertiesApi.create(data)
        this.properties.push(property)
      } finally {
        this.isLoading = false
      }
    },
    async updateProperty(id: string, data: any) {
      this.isLoading = true
      try {
        const property = await propertiesApi.update(id, data)
        const index = this.properties.findIndex(p => p.id === id)
        if (index !== -1) {
          this.properties[index] = property
        }
        if (this.selectedProperty?.id === id) {
          this.selectedProperty = property
        }
      } finally {
        this.isLoading = false
      }
    },
    async deleteProperty(id: string) {
      this.isLoading = true
      try {
        await propertiesApi.delete(id)
        this.properties = this.properties.filter(p => p.id !== id)
        if (this.selectedProperty?.id === id) {
          this.selectedProperty = null
        }
      } finally {
        this.isLoading = false
      }
    },
    setSelectedProperty(property: Property | null) {
      this.selectedProperty = property
    }
  }
})
