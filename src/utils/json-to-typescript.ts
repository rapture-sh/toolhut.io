export interface JsonToTypeScriptOptions {
  /** The name of the interface the whole sample becomes. */
  rootName?: string;
}

/** Thrown when the sample cannot be read as JSON. */
export class JsonParseError extends Error {
  constructor(
    message = "That is not valid JSON, so there is nothing to turn into types.",
  ) {
    super(message);
    this.name = "JsonParseError";
  }
}

interface Field {
  node: TypeNode;
  optional: boolean;
}

interface ObjectShape {
  fields: Map<string, Field>;
}

interface TypeNode {
  /** The primitive names seen at this place, which become a union. */
  primitives: Set<string>;
  object: ObjectShape | null;
  /** The merged element type, null when every array seen here was empty. */
  element: TypeNode | null;
  arraySeen: boolean;
}

/**
 * TypeScript interfaces for a JSON sample. Array elements are merged into one
 * shape, so a key that only some elements carry comes out optional.
 *
 * @throws JsonParseError when the input is not JSON.
 */
export function jsonToTypeScript(
  input: string,
  { rootName = "Root" }: JsonToTypeScriptOptions = {},
): string {
  if (input.trim() === "") {
    return "";
  }

  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch {
    throw new JsonParseError();
  }

  const root = pascalCase(rootName) || "Root";
  const declarations: string[] = [];
  const used = new Set<string>();
  const type = renderNode(nodeFrom(value), root, declarations, used);

  if (type === root || type === `${root}[]`) {
    return declarations.join("\n\n");
  }

  return [
    ...declarations,
    `export type ${uniqueName(root, used)} = ${type};`,
  ].join("\n\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function emptyNode(): TypeNode {
  return {
    primitives: new Set<string>(),
    object: null,
    element: null,
    arraySeen: false,
  };
}

function primitiveName(value: unknown): string {
  const kind = typeof value;

  return kind === "string" || kind === "number" || kind === "boolean"
    ? kind
    : "unknown";
}

function nodeFrom(value: unknown): TypeNode {
  const node = emptyNode();

  if (value === null) {
    node.primitives.add("null");
    return node;
  }

  if (Array.isArray(value)) {
    node.arraySeen = true;
    for (const item of value) {
      const element = nodeFrom(item);
      node.element = node.element ? merged(node.element, element) : element;
    }
    return node;
  }

  if (isRecord(value)) {
    const fields = new Map<string, Field>();
    for (const [key, item] of Object.entries(value)) {
      fields.set(key, { node: nodeFrom(item), optional: false });
    }
    node.object = { fields };
    return node;
  }

  node.primitives.add(primitiveName(value));

  return node;
}

function merged(left: TypeNode, right: TypeNode): TypeNode {
  return {
    primitives: new Set([...left.primitives, ...right.primitives]),
    object: mergedObject(left.object, right.object),
    element:
      left.element && right.element
        ? merged(left.element, right.element)
        : (left.element ?? right.element),
    arraySeen: left.arraySeen || right.arraySeen,
  };
}

function mergedObject(
  left: ObjectShape | null,
  right: ObjectShape | null,
): ObjectShape | null {
  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  const fields = new Map<string, Field>();

  for (const [key, field] of left.fields) {
    const other = right.fields.get(key);
    fields.set(
      key,
      other
        ? {
            node: merged(field.node, other.node),
            optional: field.optional || other.optional,
          }
        : { node: field.node, optional: true },
    );
  }

  for (const [key, field] of right.fields) {
    if (!left.fields.has(key)) {
      fields.set(key, { node: field.node, optional: true });
    }
  }

  return { fields };
}

function renderNode(
  node: TypeNode,
  nameHint: string,
  declarations: string[],
  used: Set<string>,
): string {
  const parts: string[] = [];

  for (const primitive of node.primitives) {
    if (primitive !== "null") {
      parts.push(primitive);
    }
  }

  if (node.object) {
    parts.push(renderObject(node.object, nameHint, declarations, used));
  }

  if (node.arraySeen) {
    parts.push(renderArray(node.element, nameHint, declarations, used));
  }

  if (node.primitives.has("null")) {
    parts.push("null");
  }

  return parts.length === 0 ? "unknown" : parts.join(" | ");
}

function renderObject(
  shape: ObjectShape,
  nameHint: string,
  declarations: string[],
  used: Set<string>,
): string {
  if (shape.fields.size === 0) {
    return "Record<string, unknown>";
  }

  const name = uniqueName(pascalCase(nameHint) || "Item", used);
  const slot = declarations.length;
  declarations.push("");

  const lines: string[] = [];
  for (const [key, field] of shape.fields) {
    const type = renderNode(field.node, key, declarations, used);
    lines.push(`  ${propertyName(key)}${field.optional ? "?" : ""}: ${type};`);
  }

  declarations[slot] = `export interface ${name} {\n${lines.join("\n")}\n}`;

  return name;
}

function renderArray(
  element: TypeNode | null,
  nameHint: string,
  declarations: string[],
  used: Set<string>,
): string {
  if (!element) {
    return "unknown[]";
  }

  const inner = renderNode(element, singular(nameHint), declarations, used);

  return inner.includes(" | ") ? `(${inner})[]` : `${inner}[]`;
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function propertyName(key: string): string {
  return IDENTIFIER.test(key) ? key : JSON.stringify(key);
}

function uniqueName(base: string, used: Set<string>): string {
  let name = base;
  let suffix = 2;

  while (used.has(name)) {
    name = `${base}${suffix}`;
    suffix += 1;
  }

  used.add(name);

  return name;
}

function pascalCase(value: string): string {
  const joined = value
    .split(/[^A-Za-z0-9]+/)
    .filter((word) => word !== "")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  return /^[0-9]/.test(joined) ? `N${joined}` : joined;
}

const KEPT = /(ss|us|is)$/i;

const PLURALS: readonly [RegExp, string][] = [
  [/ies$/i, "y"],
  [/(ch|sh|ss|x|z|s)es$/i, "$1"],
  [/s$/i, ""],
];

/** Naive on purpose: "users" names a "User", and anything odd is left alone. */
function singular(name: string): string {
  if (KEPT.test(name)) {
    return name;
  }

  for (const [plural, replacement] of PLURALS) {
    if (plural.test(name)) {
      return name.replace(plural, replacement);
    }
  }

  return name;
}
