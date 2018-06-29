type Comparator<T> = (a: T, b: T) => boolean

const equals = <T>(a: T, b: T) => a === b

export default function calculateShouldComponentUpdate<T>(
  prevProps: T,
  nextProps: T,
  comparators: { [key in keyof T]?: Comparator<T[key]> },
) {
  const keys = Object.keys(prevProps) as Array<keyof T>
  for (const key of keys) {
    const cmp: any = comparators[key] || equals
    if (!cmp(prevProps[key], nextProps[key])) {
      return true
    }
  }
  return false
}
