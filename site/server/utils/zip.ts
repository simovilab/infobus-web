import { inflateRawSync } from 'node:zlib'

/**
 * Minimal ZIP reader (central-directory walk + per-entry inflate), just
 * enough to read the flat, uncompressed-filename, DEFLATE-or-stored entries
 * that Python's zipfile.ZipFile produces (see bucr/build.py's build_zip) —
 * not a general-purpose ZIP implementation (no zip64, no encryption, no
 * data descriptors). Kept dependency-free (node:zlib only) since this repo
 * installs with `pnpm install --frozen-lockfile` and there's no way to
 * regenerate the lockfile from this environment.
 */

const EOCD_SIGNATURE = 0x06054b50
const CENTRAL_DIR_SIGNATURE = 0x02014b50
const LOCAL_FILE_SIGNATURE = 0x04034b50

export function unzip(buffer: Buffer): Map<string, Buffer> {
  const eocdOffset = findEndOfCentralDirectory(buffer)
  const entryCount = buffer.readUInt16LE(eocdOffset + 10)
  const centralDirOffset = buffer.readUInt32LE(eocdOffset + 16)

  const entries = new Map<string, Buffer>()
  let offset = centralDirOffset
  for (let i = 0; i < entryCount; i++) {
    if (buffer.readUInt32LE(offset) !== CENTRAL_DIR_SIGNATURE) {
      throw new Error(`Malformed zip: expected central directory signature at ${offset}`)
    }
    const compressionMethod = buffer.readUInt16LE(offset + 10)
    const compressedSize = buffer.readUInt32LE(offset + 20)
    const nameLength = buffer.readUInt16LE(offset + 28)
    const extraLength = buffer.readUInt16LE(offset + 30)
    const commentLength = buffer.readUInt16LE(offset + 32)
    const localHeaderOffset = buffer.readUInt32LE(offset + 42)
    const name = buffer.toString('utf-8', offset + 46, offset + 46 + nameLength)

    entries.set(name, readLocalEntry(buffer, localHeaderOffset, compressionMethod, compressedSize))

    offset += 46 + nameLength + extraLength + commentLength
  }
  return entries
}

function readLocalEntry(buffer: Buffer, offset: number, compressionMethod: number, compressedSize: number): Buffer {
  if (buffer.readUInt32LE(offset) !== LOCAL_FILE_SIGNATURE) {
    throw new Error(`Malformed zip: expected local file header at ${offset}`)
  }
  const nameLength = buffer.readUInt16LE(offset + 26)
  const extraLength = buffer.readUInt16LE(offset + 28)
  const dataStart = offset + 30 + nameLength + extraLength
  const compressed = buffer.subarray(dataStart, dataStart + compressedSize)

  if (compressionMethod === 0) return Buffer.from(compressed)
  if (compressionMethod === 8) return inflateRawSync(compressed)
  throw new Error(`Unsupported zip compression method ${compressionMethod}`)
}

function findEndOfCentralDirectory(buffer: Buffer): number {
  // EOCD is 22 bytes plus an optional up-to-65535-byte comment; scan
  // backward from the end for its signature.
  const minOffset = Math.max(0, buffer.length - 22 - 65535)
  for (let i = buffer.length - 22; i >= minOffset; i--) {
    if (buffer.readUInt32LE(i) === EOCD_SIGNATURE) return i
  }
  throw new Error('Malformed zip: end of central directory not found')
}
