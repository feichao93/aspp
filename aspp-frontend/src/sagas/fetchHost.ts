export default function fetchHost(path:string, requestInit?:RequestInit) {
  return fetch(`http://localhost:7001${path}`, requestInit)
}
