export function filenameToClassName (filename) {
  return filename
    .replace('.svg', '')
    .replace(/_/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

export function svgToDataUri (svg) {
  const cleaned = svg
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/"/g, "'")
    .replace(/#/g, '%23')
  return `url("data:image/svg+xml,${cleaned}")`
}
