import { parse } from 'yaml'
import architectureSource from '../../architecture.yaml?raw'

export type ArchitectureStructure = {
  name?: string
  type: 'object' | 'array'
  values: ArchitectureValue[]
}

export type ArchitectureValue = string | ArchitectureStructure

export type ArchitectureEndpoint = {
  protocol: 'HTTP' | 'WebSocket'
  format: 'JSON' | 'GeoJSON'
  path: string
  key?: string
  topic?: string
}

export type ArchitectureComponent = {
  name: string
  description: string
  type: 'editorial_content' | 'feed' | 'local_storage'
  gtfs?: 'Schedule' | 'Realtime'
  endpoints?: ArchitectureEndpoint[]
  structure: ArchitectureStructure
}

export type ArchitecturePage = {
  name: string
  path: string
  description: string
  components: ArchitectureComponent[]
}

const architecture = parse(architectureSource) as {
  pages: ArchitecturePage[]
}

export function getArchitecturePage(path: string): ArchitecturePage {
  const page = architecture.pages.find(page => page.path === path)

  if (!page) {
    throw new Error(`No architecture page found for path: ${path}`)
  }

  return page
}

export function getArchitectureComponent(pagePath: string, componentName: string): ArchitectureComponent {
  const component = getArchitecturePage(pagePath).components.find(component => component.name === componentName)

  if (!component) {
    throw new Error(`No architecture component ${componentName} found for page: ${pagePath}`)
  }

  return component
}

// Converts a Vue Router record path such as /routes/:route_id() into the
// architecture notation /routes/<route_id>.
export function toArchitecturePath(routeRecordPath: string): string {
  return routeRecordPath.replace(/:([a-z][a-z0-9_]*)\(\)/g, '<$1>')
}

export function isArchitectureStructure(value: ArchitectureValue): value is ArchitectureStructure {
  return typeof value !== 'string'
}

/** Follows a path of nested structure names, e.g. findStructure(root, 'services', 'directions'). */
export function findStructure(structure: ArchitectureStructure, ...path: string[]): ArchitectureStructure {
  return path.reduce((current, name) => {
    const next = current.values.find((value): value is ArchitectureStructure => isArchitectureStructure(value) && value.name === name)

    if (!next) {
      throw new Error(`No nested structure ${name} in ${current.name ?? 'root'}`)
    }

    return next
  }, structure)
}

/** The structure's own data entities, without nested structures. */
export function ownStructure(structure: ArchitectureStructure, name = structure.name): ArchitectureStructure {
  return { name, type: 'object', values: structure.values.filter(value => !isArchitectureStructure(value)) }
}

export function nestedStructures(structure: ArchitectureStructure): ArchitectureStructure[] {
  return structure.values.filter(isArchitectureStructure)
}

/** First own entity whose field name matches the pattern, e.g. findEntity(structure, /\.title$/). */
export function findEntity(structure: ArchitectureStructure, pattern: RegExp): string | undefined {
  return structure.values.find((value): value is string => typeof value === 'string' && pattern.test(value))
}

export function findNested(structure: ArchitectureStructure, name: string): ArchitectureStructure | undefined {
  return nestedStructures(structure).find(nested => nested.name === name)
}
