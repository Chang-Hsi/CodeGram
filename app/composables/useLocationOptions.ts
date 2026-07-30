import {
  computed,
  ref,
  shallowRef,
} from 'vue'
import {
  loadLocationCities,
  loadLocationCountries,
} from '../utils/locationData'
import type {
  LocationCityOption,
  LocationCountryOption,
} from '../types/location'

export const useLocationOptions = () => {
  const countries = shallowRef<
    LocationCountryOption[]
  >([])

  const cities = shallowRef<
    LocationCityOption[]
  >([])

  const selectedCountryCode = ref('')
  const loadingCountries = ref(false)
  const loadingCities = ref(false)
  const loadError = ref<unknown>(null)

  const selectedCountry = computed(() => {
    return (
      countries.value.find(
        country =>
          country.code
          === selectedCountryCode.value,
      )
      || null
    )
  })

  const initializeCountries = async () => {
    if (countries.value.length > 0) {
      return countries.value
    }

    loadingCountries.value = true
    loadError.value = null

    try {
      countries.value =
        await loadLocationCountries()

      return countries.value
    } catch (error) {
      loadError.value = error
      throw error
    } finally {
      loadingCountries.value = false
    }
  }

  const selectCountry = async (
    countryCode: string,
  ) => {
    const normalizedCountryCode =
      countryCode.trim().toUpperCase()

    selectedCountryCode.value =
      normalizedCountryCode

    cities.value = []

    if (!normalizedCountryCode) {
      return []
    }

    loadingCities.value = true
    loadError.value = null

    try {
      cities.value =
        await loadLocationCities(
          normalizedCountryCode,
        )

      return cities.value
    } catch (error) {
      loadError.value = error
      throw error
    } finally {
      loadingCities.value = false
    }
  }

  const resetLocation = () => {
    selectedCountryCode.value = ''
    cities.value = []
    loadError.value = null
  }

  const clearLoadError = () => {
    loadError.value = null
  }

  return {
    countries,
    cities,
    selectedCountryCode,
    selectedCountry,
    loadingCountries,
    loadingCities,
    loadError,
    initializeCountries,
    selectCountry,
    resetLocation,
    clearLoadError,
  }
}
