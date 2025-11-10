// Client-side geolocation service
export interface GeoLocation {
  latitude: number
  longitude: number
  country: string
  countryCode: string
}

export async function fetchGeolocation(): Promise<GeoLocation> {
  try {
    const response = await fetch("https://ipapi.co/json/")
    const data = await response.json()

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      country: data.country_name,
      countryCode: data.country_code,
    }
  } catch (error) {
    console.error("[v0] Geolocation fetch error:", error)
    // Fallback to default location (Earth center)
    return {
      latitude: 0,
      longitude: 0,
      country: "Unknown",
      countryCode: "XX",
    }
  }
}

// Get country flag emoji from country code
export function getCountryFlag(countryCode: string): string {
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  } catch {
    return "🌍"
  }
}
