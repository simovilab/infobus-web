/**
 * Minimal RFC4180 CSV parser — handles quoted fields (embedded commas,
 * escaped "" quotes, embedded newlines), matching what Python's csv.writer
 * produces in bucr/build.py (e.g. routes.txt's quoted route_desc). First
 * row is the header; every row becomes a Record keyed by it, same shape as
 * Python's csv.DictReader.
 */
export function parseCsv(text: string): Record<string, string>[] {
  const rows = parseCsvRows(text)
  if (rows.length === 0) return []
  const header = rows[0]!
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {}
    header.forEach((key, i) => {
      record[key] = row[i] ?? ''
    })
    return record
  })
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  const n = text.length

  function endField() {
    row.push(field)
    field = ''
  }

  function endRow() {
    endField()
    rows.push(row)
    row = []
  }

  while (i < n) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += char
      i++
      continue
    }

    if (char === '"') {
      inQuotes = true
      i++
      continue
    }
    if (char === ',') {
      endField()
      i++
      continue
    }
    if (char === '\r') {
      i++
      continue
    }
    if (char === '\n') {
      endRow()
      i++
      continue
    }
    field += char
    i++
  }
  if (field.length > 0 || row.length > 0) endRow()

  return rows.filter(r => !(r.length === 1 && r[0] === ''))
}
