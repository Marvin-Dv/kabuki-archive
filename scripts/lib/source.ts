// Leitura de arquivos JSON de uma fonte (HTTP ou pasta local) com cache em data/raw.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export interface SourceOptions {
  baseUrl: string
  rawDir: string
  offline: boolean
}

const isHttp = (value: string) => /^https?:\/\//.test(value)

export async function readJson<T>(opts: SourceOptions, relPath: string): Promise<T> {
  const cacheFile = join(opts.rawDir, relPath)

  if (opts.offline) {
    if (!existsSync(cacheFile)) throw new Error(`sem cache para ${relPath} (modo --offline)`)
    return JSON.parse(readFileSync(cacheFile, 'utf8')) as T
  }

  let text: string
  if (isHttp(opts.baseUrl)) {
    const url = `${opts.baseUrl.replace(/\/+$/, '')}/${relPath}`
    const response = await fetch(url, { signal: AbortSignal.timeout(60_000) })
    if (!response.ok) throw new Error(`HTTP ${response.status} em ${url}`)
    text = await response.text()
  } else {
    text = readFileSync(join(opts.baseUrl, relPath), 'utf8')
  }

  const data = JSON.parse(text) as T
  mkdirSync(dirname(cacheFile), { recursive: true })
  writeFileSync(cacheFile, text)
  return data
}
