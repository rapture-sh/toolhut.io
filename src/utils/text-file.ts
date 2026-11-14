const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "json",
  "jsonc",
  "yaml",
  "yml",
  "toml",
  "xml",
  "svg",
  "csv",
  "tsv",
  "html",
  "htm",
  "css",
  "scss",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "ts",
  "tsx",
  "sql",
  "sh",
  "env",
  "ini",
  "conf",
  "log",
  "py",
  "rb",
  "go",
  "rs",
  "java",
  "kt",
  "php",
  "c",
  "h",
  "cpp",
  "cs",
  "swift",
  "graphql",
  "gql",
  "pem",
  "srt",
  "vtt",
]);

const TEXT_TYPES = new Set([
  "application/json",
  "application/xml",
  "application/yaml",
  "application/x-yaml",
  "application/toml",
  "application/sql",
  "application/javascript",
  "application/x-sh",
  "image/svg+xml",
]);

/** Reading a binary as text gives nonsense, so a drop target checks first. */
export function isTextFileName(name: string): boolean {
  const extension = name.toLowerCase().split(".").pop();

  return extension !== undefined && TEXT_EXTENSIONS.has(extension);
}

export function isTextFileType(type: string): boolean {
  const normalized = type.trim().toLowerCase().split(";")[0] ?? "";

  return normalized.startsWith("text/") || TEXT_TYPES.has(normalized);
}
