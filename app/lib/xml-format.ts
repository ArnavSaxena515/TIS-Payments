export function formatXml(xml: string, indent = 2): string {
  if (!xml) return ''
  const pad = ' '.repeat(indent)
  // Insert newlines between tags, then walk and indent.
  const normalized = xml
    .replace(/\r\n/g, '\n')
    .replace(/>\s+</g, '><')
    .replace(/></g, '>\n<')
    .trim()

  const lines = normalized.split('\n')
  let depth = 0
  const out: string[] = []

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    const isDecl = /^<\?/.test(line) || /^<!/.test(line)
    const isClose = /^<\//.test(line)
    const isSelfClose = /\/>$/.test(line) || isDecl
    const hasOpenAndClose = /^<[^!?/][^>]*>.*<\/[^>]+>$/.test(line)

    if (isClose) depth = Math.max(0, depth - 1)

    out.push(pad.repeat(depth) + line)

    if (!isClose && !isSelfClose && !hasOpenAndClose) {
      depth += 1
    }
  }
  return out.join('\n')
}
