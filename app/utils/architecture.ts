import { parse } from 'yaml'
import architectureSource from '../../architecture.yaml?raw'

type ArchitecturePage = {
  name: string
  path: string
  description: string
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