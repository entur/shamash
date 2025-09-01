interface EnturServiceOptions {
  clientName: string;
}

interface Feature {
  properties: {
    id: string;
    label: string;
    category: string[];
  };
}

interface GetFeaturesOptions {
  limit?: number;
}

class EnturService {
  private clientName: string;

  constructor(options: EnturServiceOptions) {
    this.clientName = options.clientName;
  }

  async getFeatures(
    query: string,
    _unused?: undefined,
    options: GetFeaturesOptions = {}
  ): Promise<Feature[]> {
    const { limit = 8 } = options;

    if (!query || query.trim().length === 0) {
      return [];
    }

    try {
      const response = await fetch(
        `https://api.entur.io/geocoder/v1/autocomplete?text=${encodeURIComponent(
          query
        )}&size=${limit}&lang=no`,
        {
          headers: {
            'ET-Client-Name': this.clientName,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return (
        data.features?.map((feature: any) => ({
          properties: {
            id: feature.properties.id,
            label: feature.properties.label,
            category: feature.properties.category || [],
          },
        })) || []
      );
    } catch (error) {
      console.error('Error fetching features:', error);
      return [];
    }
  }
}

export default function createEnturService(
  options: EnturServiceOptions
): EnturService {
  return new EnturService(options);
}
