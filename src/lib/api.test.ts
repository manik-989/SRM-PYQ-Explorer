import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  getCourse,
  getFileDownloadUrl,
  getHealth,
  getPaper,
  listCoursePapers,
  listCourses,
  listPaperFiles,
} from './api'

const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<unknown>>()

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

function lastRequestUrl(): URL {
  const calls = fetchMock.mock.calls
  const [input] = calls[calls.length - 1] ?? []
  return new URL(String(input), 'http://localhost')
}

describe('api client', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('encodes course codes in path segments', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { course_code: 'CS/101' } }))

    await getCourse('CS/101')

    expect(lastRequestUrl().pathname).toBe('/api/v1/courses/CS%2F101')
  })

  it('builds query parameters and omits empty values', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [], page: {} }))

    await listCourses({ q: 'AI', cursor: null, limit: 5 })

    const url = lastRequestUrl()
    expect(url.pathname).toBe('/api/v1/courses')
    expect(url.searchParams.get('q')).toBe('AI')
    expect(url.searchParams.get('limit')).toBe('5')
    expect(url.searchParams.has('cursor')).toBe(false)
  })

  it('requests a fresh download URL with the requested TTL', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { download_url: 'https://example.com' } }))

    await getFileDownloadUrl('file-1', 1200)

    const url = lastRequestUrl()
    expect(url.pathname).toBe('/api/v1/files/file-1/download')
    expect(url.searchParams.get('ttl_seconds')).toBe('1200')
  })

  it('covers every documented endpoint path', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [] }))

    await getHealth()
    await listCoursePapers('21CSE101', { year: 2024, term: 'FALL' })
    await getPaper('paper-1')
    await listPaperFiles('paper-1')

    const paths = fetchMock.mock.calls.map(([input]) => new URL(String(input), 'http://localhost').pathname)
    expect(paths).toEqual([
      '/api/health',
      '/api/v1/courses/21CSE101/papers',
      '/api/v1/papers/paper-1',
      '/api/v1/papers/paper-1/files',
    ])
  })

  it('surfaces API error details without retrying 4xx responses', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: 'Course not found' }, 404))

    await expect(getCourse('missing')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Course not found',
      status: 404,
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries transient 5xx responses and then fails', async () => {
    vi.useFakeTimers()
    fetchMock.mockResolvedValue(jsonResponse({ detail: 'temporary failure' }, 500))

    const assertion = expect(getCourse('retry-me')).rejects.toBeInstanceOf(ApiError)
    await vi.runAllTimersAsync()
    await assertion

    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
