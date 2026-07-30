import {
  locationCountryOverrides,
  preferredLocationCountryCodes,
} from '../data/locationOverrides'
import type {
  LocationCityOption,
  LocationCountryOption,
} from '../types/location'

const preferredCountryIndex = new Map<string, number>(
  preferredLocationCountryCodes.map((code, index) => [
    code,
    index,
  ]),
)

const localizedCountryCache = new Map<
  string,
  LocationCountryOption
>()

const createLocalizedCountry = (
  code: string,
): LocationCountryOption | null => {
  const override = locationCountryOverrides[code]

  /*
   * 國家與城市資料都已寫死在 locationOverrides.ts。
   * cities 可以是空陣列，例如無常住人口的海外領地。
   */
  if (
    !override?.label
    || !override.englishName
    || !override.flagIcon
    || !override.cities
  ) {
    return null
  }

  return {
    code: override.code.toUpperCase(),
    label: override.label,
    englishName: override.englishName,
    flagIcon: override.flagIcon,
    aliases: override.aliases,
    cities: override.cities,
  }
}

const sortCountries = (
  countries: LocationCountryOption[],
) => {
  return [...countries].sort((countryA, countryB) => {
    const indexA =
      preferredCountryIndex.get(countryA.code)
      ?? Number.MAX_SAFE_INTEGER
    const indexB =
      preferredCountryIndex.get(countryB.code)
      ?? Number.MAX_SAFE_INTEGER

    if (indexA !== indexB) {
      return indexA - indexB
    }

    return countryA.label.localeCompare(
      countryB.label,
      'zh-Hant',
    )
  })
}

const ensureLocalizedCountries = () => {
  if (localizedCountryCache.size > 0) {
    return
  }

  Object.keys(locationCountryOverrides).forEach((code) => {
    const country = createLocalizedCountry(code)

    if (country) {
      localizedCountryCache.set(country.code, country)
    }
  })
}

export const loadLocationCountries = async () => {
  ensureLocalizedCountries()

  return sortCountries(
    Array.from(localizedCountryCache.values()),
  )
}

export const loadLocationCities = async (
  countryCode: string,
) => {
  ensureLocalizedCountries()

  const normalizedCountryCode =
    countryCode.trim().toUpperCase()

  return (
    localizedCountryCache.get(
      normalizedCountryCode,
    )?.cities || []
  )
}

export const loadLocationCountry = async (
  countryCode: string,
) => {
  ensureLocalizedCountries()

  return (
    localizedCountryCache.get(
      countryCode.trim().toUpperCase(),
    ) || null
  )
}

export const searchLocationCities = async (
  countryCode: string,
  keyword: string,
) => {
  const normalizedKeyword = keyword
    .trim()
    .toLocaleLowerCase()

  const cities =
    await loadLocationCities(countryCode)

  if (!normalizedKeyword) {
    return cities
  }

  return cities.filter((city) => {
    return [
      city.label,
      ...(city.aliases || []),
    ].some(value =>
      value
        .toLocaleLowerCase()
        .includes(normalizedKeyword),
    )
  })
}

export const clearLocationDataCache = () => {
  localizedCountryCache.clear()
}