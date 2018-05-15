const host = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:7001'

export default function fetchHost(path: string, requestInit?: RequestInit) {
  return fetch(`${host}${path}`, requestInit)
}
