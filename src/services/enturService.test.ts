import { describe, it, expect, vi } from 'vitest';
import createEnturService from './enturService';

global.fetch = vi.fn();

describe('EnturService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create service with client name', () => {
    const service = createEnturService({ clientName: 'test-client' });
    expect(service).toBeDefined();
  });

  it('should return empty array for empty query', async () => {
    const service = createEnturService({ clientName: 'test-client' });
    const result = await service.getFeatures('');
    expect(result).toEqual([]);
  });

  it('should call Entur API with correct parameters', async () => {
    const mockResponse = {
      features: [
        {
          properties: {
            id: 'NSR:StopPlace:337',
            label: 'Jernbanetorget',
            category: ['onstreetBus', 'railStation']
          }
        }
      ]
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const service = createEnturService({ clientName: 'test-client' });
    const result = await service.getFeatures('Jernbanetorget', undefined, { limit: 5 });

    expect(fetch).toHaveBeenCalledWith(
      'https://api.entur.io/geocoder/v1/autocomplete?text=Jernbanetorget&size=5&lang=no',
      {
        headers: {
          'ET-Client-Name': 'test-client'
        }
      }
    );

    expect(result).toEqual([
      {
        properties: {
          id: 'NSR:StopPlace:337',
          label: 'Jernbanetorget',
          category: ['onstreetBus', 'railStation']
        }
      }
    ]);
  });

  it('should handle API errors gracefully', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const service = createEnturService({ clientName: 'test-client' });
    const result = await service.getFeatures('test');

    expect(result).toEqual([]);
  });

  it('should handle HTTP errors gracefully', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const service = createEnturService({ clientName: 'test-client' });
    const result = await service.getFeatures('test');

    expect(result).toEqual([]);
  });
});
