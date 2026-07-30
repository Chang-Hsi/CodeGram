export interface LocationCityOption {
  value: string
  label: string
  aliases?: string[]
}

export interface LocationCountryOption {
  code: string
  label: string
  englishName: string
  flagIcon: string
  aliases?: string[]
  cities: LocationCityOption[]
}