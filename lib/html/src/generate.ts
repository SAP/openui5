/**
 * Generates custom-element-manifest.json for HTML5 elements.
 *
 * Data sources:
 *   @webref/elements  – element names, spec URLs, IDL interface names
 *   @webref/idl       – parsed WebIDL AST for the HTML spec
 *
 * Three passes identify HTML content attributes from IDL members:
 *
 *  Pass 1 – [Reflect*] family (authoritative)
 *    Members with Reflect, ReflectURL, ReflectNonNegative, ReflectPositive,
 *    ReflectPositiveWithFallback, ReflectRange, ReflectSetter, or ReflectDefault
 *    are reflected HTML content attributes. The [Reflect="name"] rhs overrides
 *    the IDL attribute name (e.g. `formNoValidate` → `formnovalidate`).
 *
 *  Pass 2 – [CEReactions]-only writable attributes with primitive types
 *    Some HTML content attributes are defined in the IDL with only [CEReactions]
 *    and no [Reflect*] variant (e.g. formenctype, formmethod, dir, translate,
 *    hidden, contenteditable, loading, decoding, crossorigin, …). Pass 2 includes
 *    them when:
 *      – The attribute is writable (not readonly)
 *      – The IDL type is primitive-like: a string type, boolean, numeric,
 *        DOMTokenList, or a union thereof (TrustedHTML treated as string)
 *      – The lowercased attribute name is NOT in CE_REACTIONS_ATTR_DENYLIST
 *    Attributes not meeting these conditions are assumed to be DOM-only
 *    properties (text content aliases, URL decomposition helpers, etc.).
 *
 *  Pass 3 – Curated IDREF attributes
 *    Some HTML content attributes take an element ID string in markup, but
 *    their IDL property returns the resolved element (readonly, no Reflect*,
 *    no CEReactions). These cannot be discovered automatically; they are listed
 *    in IDREF_ATTRS. The `form` attribute is the canonical example.
 *
 * Type mapping to UI5 primitive types
 * ─────────────────────────────────────
 * The IDL type is preserved as `type`; the UI5 target type is added as
 * `ui5Type`. Mapping rules:
 *
 *  IDL type                         → ui5Type
 *  boolean                          → "boolean"
 *  long / unsigned long / short …   → "integer"
 *  double / float / unrestricted …  → "number"
 *  DOMString / CSSOMString / …          → "string"  (base)
 *  USVString                            → "sap.ui.core.URI"  (USVString is used for URL-valued attrs)
 *    + [ReflectURL] on any string type  → "sap.ui.core.URI"
 *  DOMTokenList (via PutForwards)   → "string"  (space-separated tokens in markup)
 *  Union of primitives              → "string"  (HTML markup always serialises as string)
 *  Element? / object refs           → "object"
 *  IDREF attributes (Element? with Reflect* or Pass 3)
 *    – generic Element? / HTMLElement?              → { text: "HTMLElement | string | undefined" }
 *    – specific HTML*Element? (e.g. HTMLFormElement?) → { text: "HTMLElement | string | undefined",
 *                                                         references: [{ name, package, module }] }
 *    The references entry points to the corresponding UI5 control module; the magic type string
 *    is recognised by ui5-tooling-modules, which wires up the correct UI5 association.
 *
 * Numeric constraints from Reflect variants are stored in `constraints`:
 *  [ReflectNonNegative]             → { minimum: 0 }
 *  [ReflectPositive/WithFallback]   → { minimum: 1 }
 *  [ReflectRange={lo, hi}]         → { minimum: lo, maximum: hi }
 *  [ReflectDefault={n}]            → defaultValue: n
 *
 * Enumerated string attributes: the HTML spec does NOT encode valid enum values
 * in WebIDL. Enum types are supplied by overlaying @vscode/web-custom-data via
 * VALUESET_MAPPINGS, which maps vscode value-set identifiers to named UI5 enum
 * types. A CEM enum module is generated for each mapped value set.
 *
 * Inaccurate or incomplete vscode data can be corrected via VSCODE_OVERRIDES:
 *   – attributes: assigns a valueset name to attributes vscode omits or annotates incorrectly
 *   – valueSets:  per-set delta { add?, remove? } applied on top of the vscode base values;
 *                 the combined result is always deduplicated and sorted alphabetically
 *
 * Known gap: `autocomplete` on <button> was added to the HTML spec after the
 * @webref/idl@3.83.0 data snapshot and is therefore absent from the IDL source.
 *
 * Known gap: the `capture` attribute on <input> (html-media-capture spec) carries
 * only [CEReactions] and the denylist currently excludes it.  It can be added via
 * IDREF_ATTRS or a future manual-override mechanism.
 *
 * Deprecation: WebIDL for the HTML spec does not carry [Deprecated] markers.
 * Obsolete elements/attributes: https://html.spec.whatwg.org/multipage/obsolete.html
 */

import * as webrefElements from "@webref/elements";
import * as webrefIdl from "@webref/idl";
import type * as WebIDL2 from "webidl2";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type * as CEM from "custom-elements-manifest";

import vscodeHtmlData, { ValueSetValue } from "@vscode/web-custom-data/data/browsers.html-data.json" with { type: "json" };

// ── Constants ────────────────────────────────────────────────────────────────

// Extended-attribute names that mark a reflected HTML content attribute (Pass 1)
const REFLECT_NAMES = new Set([
  "Reflect",
  "ReflectURL",
  "ReflectNonNegative",
  "ReflectPositive",
  "ReflectPositiveWithFallback",
  "ReflectRange",
  "ReflectSetter",
  "ReflectDefault",
]);

// IDL callback typedef names that identify event handler attributes
const EVENT_HANDLER_TYPES = new Set(["EventHandler", "OnErrorEventHandler"]);

// IDL primitive types that map to UI5 "integer"
const IDL_INT_TYPES = new Set([
  "long", "unsigned long", "short", "unsigned short",
  "long long", "unsigned long long", "byte", "octet",
]);

// IDL primitive types that map to UI5 "number"
const IDL_FLOAT_TYPES = new Set([
  "double", "float", "unrestricted double", "unrestricted float",
]);

// IDL string types that map to UI5 "string" (base, before Reflect-variant refinement)
const IDL_STRING_TYPES = new Set([
  "DOMString", "USVString", "CSSOMString", "ByteString",
]);

// Trusted-Types wrappers that appear in unions but are string-equivalent in HTML markup
const IDL_TRUSTED_TYPES = new Set(["TrustedHTML", "TrustedScript", "TrustedScriptURL"]);

// Pass 2 denylist: attribute names (lowercased) that are IDL-only and NOT HTML
// content attributes, even though they are writable + [CEReactions] + primitive type.
const CE_REACTIONS_ATTR_DENYLIST = new Set([
  // text content properties (not HTML content attributes)
  "innertext", "outertext", "text",
  // DOM serialisation properties (not HTML content attributes)
  "innerhtml", "outerhtml",
  // runtime state property on form-associated elements (not a content attribute;
  // the <input> value *content attribute* is reflected via defaultValue's [Reflect="value"])
  "defaultvalue", "value",
  // DOM collection size property on <select>, not a content attribute
  "length",
  // legacy IDL alias for enctype (the HTML attribute is "enctype", not "encoding")
  "encoding",
  // HyperlinkElementUtils URL decomposition properties (not HTML content attributes;
  // they parse/decompose the href URL and are included via HTMLAnchorElement / HTMLAreaElement)
  "protocol", "username", "password", "host", "hostname", "port", "pathname", "search", "hash",
]);

// Pass 3 – Curated IDREF attributes.
// HTML content attributes whose IDL property is readonly and returns a resolved
// element reference. The HTML attribute value is the referenced element's ID string.
// Map: IDL interface name → array of { htmlName, idlType }
const IDREF_ATTRS = new Map([  // form-associated elements: the `form` attribute references a <form> by its ID
  ["HTMLButtonElement",   [{ htmlName: "form", idlType: "HTMLFormElement?" }]],
  ["HTMLInputElement",    [{ htmlName: "form", idlType: "HTMLFormElement?" },
                           { htmlName: "list", idlType: "HTMLDataListElement?" }]],
  ["HTMLSelectElement",   [{ htmlName: "form", idlType: "HTMLFormElement?" }]],
  ["HTMLTextAreaElement", [{ htmlName: "form", idlType: "HTMLFormElement?" }]],
  ["HTMLOutputElement",   [{ htmlName: "form", idlType: "HTMLFormElement?" }]],
  ["HTMLFieldSetElement", [{ htmlName: "form", idlType: "HTMLFormElement?" }]],
  ["HTMLLabelElement",    [{ htmlName: "form", idlType: "HTMLFormElement?" }]],
  ["HTMLObjectElement",   [{ htmlName: "form", idlType: "HTMLFormElement?" }]],
]);

// Global HTML content attributes that cannot be auto-discovered via the three IDL passes.
// style: defined in cssom.idl as [PutForwards=cssText] readonly — not [Reflect*] and not
// writable, so all three passes miss it. It is a genuine HTML content attribute.
const GLOBAL_EXTRA_ATTRS: AttributeInfo[] = [
  { name: "style", idlType: "CSSOMString", ui5Type: "string" },
];

// Void elements have no content model and no closing tag in HTML markup.
// The HTML WebIDL does not carry a marker for this; the set is curated from the spec.
const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

// Elements excluded from generation — mirrors lib/html's UNWANTED_TAGS.
// Excluded because they are structural, unsafe, or rely on external resources.
const EXCLUDED_ELEMENTS = new Set([
  "audio", "base", "body", "dialog", "embed", "fencedframe", "head", "html",
  "iframe", "link", "meta", "noscript", "object", "picture", "script", "slot",
  "source", "style", "template", "title", "track", "video",
]);

// Curated denylist of experimental or otherwise unwanted attributes and events.
// Key: "HTMLElementBase" for global members, HTML tag name for element-specific members.
// Attribute names must match the processed output name (camelCase for aria-* attributes,
// lower-case for all others). Both arrays are optional.
const UNWANTED_APIS: Record<string, {attributes?: string[], events?: string[]}> = {
  "HTMLElementBase": {
    attributes: [
      "headingoffset", // experimental, only available in FF
      "headingreset", // experimental, only available in FF
      "writingsuggestions", // experimental, not available in FF
      // this attribute opens a freeform DOM editing surface that cannot be reconciled with the UI5
      // control tree (user edits/pasted markup will not create new controls and any change will be lost on rerender)
      "contenteditable",
    ],
    events: [
      "contextlost", // experimental, not available in SF, fired only on Canvas
      "contextrestored", // experimental, not available in SF, fired only on Canvas
      "pointerrawupdate", // non standard event (not available in SF)
      "slotchange", // only useful for web components / shadow DOM usages
      "webkitanimationend", // vendor specific
      "webkitanimationiteration", // vendor specific
      "webkitanimationstart", // vendor specific
      "webkittransitionend", // vendor specific
      "wheel", // not available in Mobile Safari
    ]
  },
  "input": {
    attributes: [
      "alpha", // experimental, only FF / SF
      "capture", // experimental, only Chrome Android
      "colorspace", // experimental, only FF / SF
    ]
  },
  "td": {
    attributes: [
      "scope", // in MDN only listed for TH
    ]
  },
};

type ValueSetMappingDef = {
    ignoreAsEnum?: boolean;
    type?: string;
    replacementName?: string;
    ignoreValues?: string[];
}

type ValueSetDelta = {
  add?: ValueSetValue[];
  remove?: string[];
};

// Value set name → enum type info, ported from lib/html/src/ValueSetMappings.ts.
// Drives the overlay of vscode enum types onto IDL-derived "string" attributes.
const VALUESET_MAPPINGS: Record<string, ValueSetMappingDef> = {
  "b":                { replacementName: "Boolean" },
  "v":                { ignoreAsEnum: true, type: "boolean" },
  "u":                { replacementName: "OptionalBoolean" },
  "o":                { replacementName: "Toggle" },
  "y":                { replacementName: "Decision" },
  "w":                { replacementName: "Wrapping" },
  "d":                { replacementName: "Direction" },
  "m":                { replacementName: "Method" },
  "fm":               { replacementName: "Method" },  // formmethod: same values as method per WHATWG spec → shares the Method enum
  "s":                { replacementName: "TableSection" },
  "t":                { replacementName: "InputType" },
  "im":               { replacementName: "InputMode" },
  "bt":               { replacementName: "ButtonType" },
  "lt":               { replacementName: "ListType" },
  "mt":               { replacementName: "MenuType" },   // orphaned: <menu type> was removed from HTML5; no element references valueset "mt"
  "mit":              { replacementName: "MenuItemType" }, // orphaned: <menuitem> was removed from HTML5; no element references valueset "mit"
  "et":               { replacementName: "EncodingType" },
  "tk":               { replacementName: "TrackKind" },
  "pl":               { replacementName: "Preload" },
  "sh":               { replacementName: "Shape" },
  "xo":               { replacementName: "CrossOrigin" },
  "target":           { ignoreAsEnum: true, type: "string" },
  "sb":               { replacementName: "Sandbox" },
  "tristate":         { replacementName: "Tristate" },
  "inputautocomplete": { replacementName: "InputAutocomplete" },
  "autocomplete":     { replacementName: "Autocomplete" },
  "current":          { replacementName: "Current" },
  "dropeffect":       { replacementName: "DropEffect" },
  "invalid":          { replacementName: "Invalid" },
  "live":             { replacementName: "Live" },
  "orientation":      { replacementName: "Orientation" },
  "relevant":         { ignoreAsEnum: true, type: "string" },
  "sort":             { replacementName: "Sort" },
  "roles":            { replacementName: "AriaRole" },
  "metanames":        { replacementName: "MetaName" },
  "haspopup":         { replacementName: "HasPopup" },
  "decoding":         { replacementName: "Decoding" },
  "loading":          { replacementName: "Loading" },
  "referrerpolicy":   { replacementName: "ReferrerPolicy" },
  "enterkeyhint":     { replacementName: "EnterKeyHint" },
  "popover":          { replacementName: "Popover" },
  "fetchpriority":    { replacementName: "FetchPriority" },
};

// Corrections for inaccurate or incomplete @vscode/web-custom-data entries.
// attributes: two-level map (HTMLElementBase | tag name) → attr name → value-set name.
//   Adds a value-set reference to attributes that vscode omits or annotates incorrectly.
// valueSets: value-set name → replacement ValueSetValue array.
//   Replaces vscode value-set values with the correct HTML-spec values.
const VSCODE_OVERRIDES: {
  attributes: Record<string, Record<string, string>>;
  valueSets: Record<string, ValueSetDelta>;
} = {
  attributes: {
    "HTMLElementBase": {
      "inputmode": "im", // vscode lists inputmode without a valueSet reference
    },
  },
  valueSets: {
    // vscode carries a stale draft list (verbatim, latin, …) from an old W3C proposal.
    // Keep overlapping correct values (numeric, tel, email, url); remove the stale ones;
    // add the missing ones (none, text, decimal, search).
    // https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
    "im": {
      remove: ["verbatim", "latin", "latin-name", "latin-prose", "full-width-latin",
               "kana", "kana-name", "katakana"],
      add:    [{ name: "none" }, { name: "text" }, { name: "decimal" }, { name: "search" }],
    },
    // `datetime` was removed from HTML5 (~2013); `datetime-local` is the correct replacement.
    // https://html.spec.whatwg.org/multipage/input.html#states-of-the-type-attribute
    "t": {
      remove: ["datetime"],
    },
    // `auto` (the default state) is missing from the vscode list.
    // https://html.spec.whatwg.org/multipage/tables.html#attr-th-scope
    "s": {
      add: [{ name: "auto" }],
    },
    // `one-time-code` and `webauthn` were added to the WHATWG HTML spec.
    // https://html.spec.whatwg.org/multipage/form-elements.html#autofill-processing-model
    "inputautocomplete": {
      add: [{ name: "one-time-code" }, { name: "webauthn" }],
    },
    // vscode has a duplicate `region` entry (handled by the universal deduplication step).
    // Missing 12 roles added in ARIA 1.2: structural roles mirroring native HTML elements.
    // https://www.w3.org/TR/wai-aria-1.2/#role_definitions
    "roles": {
      add: [
        { name: "blockquote" }, { name: "caption" },    { name: "code" },
        { name: "deletion" },   { name: "emphasis" },   { name: "generic" },
        { name: "insertion" },  { name: "paragraph" },  { name: "strong" },
        { name: "subscript" },  { name: "superscript" }, { name: "time" },
      ],
    },
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Converts a kebab-case attribute name to lowerCamelCase (used for aria-* names). */
function normalizeAttrName(name: string) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/** Normalises a vscode description field, which can be a plain string or {kind,value} object. */
function vscodeDesc(raw: string | {value : string } | undefined) {
  if (!raw) return undefined;
  return typeof raw === "string" ? raw : raw.value;
}

/** Filters vscode ValueSet values: drops duplicates and the literal "undefined" sentinel. */
function buildEnumValues(values: ValueSetValue[] = []) {
  const seen = new Set();
  return values.filter(v => {
    if (v.name === "undefined" || seen.has(v.name)) return false;
    seen.add(v.name);
    return true;
  });
}

/** Applies a VSCODE_OVERRIDES delta to a vscode value-set base array. */
function applyValueSetDelta(base: ValueSetValue[], delta: ValueSetDelta): ValueSetValue[] {
  const removeSet = new Set(delta.remove ?? []);
  return [
    ...base.filter(v => !removeSet.has(v.name)),
    ...(delta.add ?? []),
  ];
}

/** Returns the first matching Reflect* extended attribute (used for name resolution). */
function getReflect(member: IDLMemberType) {
  return (member.extAttrs ?? []).find((ea) => REFLECT_NAMES.has(ea.name)) ?? null;
}

/** Returns ALL matching Reflect* extended attributes (for constraint extraction). */
function getAllReflects(member: IDLMemberType) {
  return (member.extAttrs ?? []).filter((ea) => REFLECT_NAMES.has(ea.name));
}

/** Resolves the HTML attribute name from IDL member + Reflect extended attribute. */
function htmlAttrName(member: IDLMemberType, reflectAttr: WebIDL2.ExtendedAttribute) {
  const rhs = reflectAttr.rhs;
  if (rhs?.type === "string") {
    return rhs.value.replace(/^"|"$/g, "");
  }
  return member.name.toLowerCase();
}

/** Converts a WebIDL type descriptor to a compact string representation. */
function idlTypeToString(idlType: WebIDL2.IDLTypeDescription): string {
  if (!idlType) return "any";
  if (idlType.union) {
    return `(${idlType.idlType.map(idlTypeToString).join(" or ")})`;
  }
  const inner: string = Array.isArray(idlType.idlType)
    ? idlType.idlType.map(idlTypeToString).join(", ")
    : String(idlType.idlType);
  const base = idlType.generic ? `${idlType.generic}<${inner}>` : inner;
  return idlType.nullable ? `${base}?` : base;
}

/**
 * Returns true if the IDL type can be represented as a primitive HTML attribute
 * value (string, boolean, or number). Union types are primitive-like when every
 * member is primitive or a Trusted-Type wrapper.
 */
function isPrimitiveLike(idlType: WebIDL2.IDLTypeDescription): boolean {
  if (!idlType) return false;
  if (idlType.union) {
    return idlType.idlType.every((t) => isPrimitiveLike(t));
  }
  const t = idlType.idlType;
  if (typeof t !== "string") return false;
  return (
    IDL_STRING_TYPES.has(t) ||
    IDL_INT_TYPES.has(t) ||
    IDL_FLOAT_TYPES.has(t) ||
    t === "boolean" ||
    t === "DOMTokenList" ||
    IDL_TRUSTED_TYPES.has(t)
  );
}

/**
 * Builds the CEM type object for an IDREF attribute given its raw IDL type string
 * (e.g. "HTMLFormElement?", "Element?") and the interface→tag lookup map.
 *
 * Generic element references (Element / HTMLElement) use the magic type string
 * recognised by ui5-tooling-modules. Specific interface types are resolved to the
 * corresponding UI5 control class and emit a CEM reference so the registry can
 * wire up the correct module.
 */
function idrefCemType(rawIdlType: string, ifaceToTag: Map<string, string>): CEM.Type {
  const ifaceName = rawIdlType.endsWith("?") ? rawIdlType.slice(0, -1) : rawIdlType;
  if (ifaceName === "Element" || ifaceName === "HTMLElement") {
    return { text: "HTMLElement | string | undefined" };
  }
  const tag = ifaceToTag.get(ifaceName);
  if (!tag) {
    return { text: ifaceName };
  }
  const className = tag.charAt(0).toUpperCase() + tag.slice(1);
  return {
    text: "HTMLElement | string | undefined",
    references: [{ name: className, package: "@ui5/html", module: `dist/${className}.js` }],
  };
}

/**
 * A temporary object describing the type of a member
 */
interface TypeInfo {
  ui5Type?: string,
  cemType?: CEM.Type;
  constraints?: object;
  defaultValue?: any;
};

/**
 * Maps an IDL member (with ALL its Reflect* variants) to a UI5 type name and
 * optional constraints / defaultValue.
 *
 * When reflectAttrs is empty (Pass 2 CEReactions-only path), no URL or constraint
 * refinement is applied — the IDL type alone drives the mapping.
 *
 * Returns { ui5Type, constraints?, defaultValue? }
 */
function toUi5Type(
  member: WebIDL2.AttributeMemberType,
  reflectAttrs: WebIDL2.ExtendedAttribute[],
  ifaceToTag: Map<string, string> = new Map()
): TypeInfo {
  const rawType = idlTypeToString(member.idlType);
  // Strip nullable marker for type classification; the ? only affects DOM access,
  // not the HTML attribute value (attributes are always strings in markup).
  const baseType = rawType.endsWith("?") ? rawType.slice(0, -1) : rawType;

  const byReflect = Object.fromEntries(reflectAttrs.map((ea) => [ea.name, ea]));

  // ── Union types (e.g. hidden: boolean or unrestricted double or DOMString) ─
  if (member.idlType?.union) {
    const types = member.idlType.idlType;
    const allBool = types.every((t) => t.idlType === "boolean");
    return { ui5Type: allBool ? "boolean" : "string" };
  }

  // ── boolean ────────────────────────────────────────────────────────────────
  if (baseType === "boolean") {
    return { ui5Type: "boolean" };
  }

  // ── integers ───────────────────────────────────────────────────────────────
  if (IDL_INT_TYPES.has(baseType)) {
    const result: TypeInfo = { ui5Type: "integer" };
    if (byReflect.ReflectNonNegative) {
      result.constraints = { minimum: 0 };
    } else if (byReflect.ReflectPositive || byReflect.ReflectPositiveWithFallback) {
      result.constraints = { minimum: 1 };
    } else if (byReflect.ReflectRange?.rhs?.type === "integer-list") {
      const [lo, hi] = byReflect.ReflectRange.rhs.value;
      result.constraints = { minimum: Number(lo.value), maximum: Number(hi.value) };
    }
    const defRhs = byReflect.ReflectDefault?.rhs;
    if (defRhs?.type === "integer") {
      result.defaultValue = Number(defRhs.value);
    }
    return result;
  }

  // ── floats ─────────────────────────────────────────────────────────────────
  if (IDL_FLOAT_TYPES.has(baseType)) {
    const result: TypeInfo = { ui5Type: "number" };
    if (byReflect.ReflectPositive) {
      result.constraints = { minimum: 1 };
    }
    const defRhs = byReflect.ReflectDefault?.rhs;
    if (defRhs) {
      result.defaultValue = Number(defRhs.value);
    }
    return result;
  }

  // ── strings ────────────────────────────────────────────────────────────────
  if (IDL_STRING_TYPES.has(baseType)) {
    if (byReflect.ReflectURL || baseType === "USVString") {
      return { ui5Type: "sap.ui.core.URI" };
    }
    return { ui5Type: "string" };
  }

  // ── DOMTokenList (sandbox, rel, for, …) ───────────────────────────────────
  if (baseType === "DOMTokenList") {
    return { ui5Type: "string" };
  }

  // ── Trusted Types wrappers (TrustedHTML in srcdoc, etc.) ──────────────────
  if (IDL_TRUSTED_TYPES.has(baseType)) {
    return { ui5Type: "string" };
  }

  // ── FrozenArray<Element>? → space-separated IDREF list ───────────────────
  // ARIA attributes like aria-controls, aria-describedby, aria-labelledby etc.
  // take a space-separated list of element IDs in HTML markup → "string".
  if (
    member.idlType?.generic === "FrozenArray" &&
    member.idlType?.nullable &&
    Array.isArray(member.idlType.idlType) &&
    member.idlType.idlType.length === 1 &&
    member.idlType.idlType[0].idlType === "Element"
  ) {
    return { ui5Type: "string" };
  }

  // ── Nullable element references with [Reflect*] → IDREF ───────────────────
  // When an IDL attribute reflects an HTML content attribute and its type is a
  // nullable element reference (e.g. Element?, HTMLFormElement?), the HTML
  // attribute value is the referenced element's ID string.
  if (
    member.idlType?.nullable &&
    !member.idlType?.union &&
    reflectAttrs.length > 0 &&
    typeof member.idlType.idlType === "string" &&
    (member.idlType.idlType === "Element" || member.idlType.idlType.endsWith("Element"))
  ) {
    return { cemType: idrefCemType(rawType, ifaceToTag) };
  }

  return { ui5Type: "object" };
}

type IDLMemberType = WebIDL2.AttributeMemberType | WebIDL2.ConstantMemberType;

/**
 * Collects all interface/mixin members for a given interface name, following
 * the inheritance chain and mixin inclusions.
 */
function collectMembers(
  name: string,
  idlByName: Map<string, WebIDL2.IDLRootType[]>,
  mixinMap: Map<string, string[]>,
  visited = new Set()
): IDLMemberType[] {
  if (visited.has(name)) return [];
  visited.add(name);

  const nodes = idlByName.get(name) ?? [];
  const members: IDLMemberType[] = [];

  for (const _node of nodes) {
    const node: any = _node;
    members.push(...(node.members ?? []));
    if (node.inheritance) {
      members.push(...collectMembers(node.inheritance, idlByName, mixinMap, visited));
    }
  }

  for (const mixinName of mixinMap.get(name) ?? []) {
    members.push(...collectMembers(mixinName, idlByName, mixinMap, visited));
  }

  return members;
}

type AttributeInfo = Omit<CEM.ClassField, "kind"> & {
  ui5Type?: string,
  idlType?: string,
  enumType?: string,
  constraints?: object,
  defaultValue?: any,
 };


/**
 * Extracts HTML content attribute descriptors from an IDL member list using
 * three passes (see file header). Optionally adds curated IDREF attributes for
 * the given interface name.
 *
 * Returns a Map: attrName → attribute descriptor object.
 */
function extractAttributes(
  members: IDLMemberType[],
  ifaceName: string,
  ifaceToTag: Map<string, string> = new Map()
): Map<string, AttributeInfo> {
  const result = new Map<string, AttributeInfo>();

  // ── Pass 1: [Reflect*] attributes ─────────────────────────────────────────
  for (const member of members) {
    if (member.type !== "attribute") continue;
    const reflect = getReflect(member);
    if (!reflect) continue;

    const attrName = normalizeAttrName(htmlAttrName(member, reflect));
    if (result.has(attrName)) continue;

    const deprecated =
      (member.extAttrs ?? []).some((ea) => ea.name === "Deprecated" || ea.name === "Obsolete");
    const allReflects = getAllReflects(member);
    const { ui5Type, cemType, constraints, defaultValue } = toUi5Type(member, allReflects, ifaceToTag);

    result.set(attrName, {
      name: attrName,
      idlType: idlTypeToString(member.idlType),
      ...(cemType !== undefined ? { type: cemType } : { ui5Type }),
      ...(constraints !== undefined ? { constraints } : {}),
      ...(defaultValue !== undefined ? { defaultValue } : {}),
      ...(deprecated ? { deprecated: true } : {}),
    });
  }

  // ── Pass 2: writable [CEReactions]-only attributes with primitive types ────
  for (const member of members) {
    if (member.type !== "attribute" || member.readonly) continue;

    const extNames = (member.extAttrs ?? []).map((ea) => ea.name);
    const hasCE = extNames.includes("CEReactions");
    const hasReflect = extNames.some((n) => REFLECT_NAMES.has(n));
    if (!hasCE || hasReflect) continue; // already in Pass 1, or not CE-only

    const attrName = normalizeAttrName(member.name.toLowerCase());
    if (result.has(attrName)) continue;
    if (CE_REACTIONS_ATTR_DENYLIST.has(attrName)) continue;
    if (!isPrimitiveLike(member.idlType)) continue;

    const deprecated =
      (member.extAttrs ?? []).some((ea) => ea.name === "Deprecated" || ea.name === "Obsolete");
    const { ui5Type } = toUi5Type(member, []); // no Reflect* variants

    result.set(attrName, {
      name: attrName,
      idlType: idlTypeToString(member.idlType),
      ui5Type,
      ...(deprecated ? { deprecated: true } : {}),
    });
  }

  // ── Pass 3: curated IDREF attributes ──────────────────────────────────────
  for (const { htmlName, idlType } of IDREF_ATTRS.get(ifaceName) ?? []) {
    if (result.has(htmlName)) continue;
    result.set(htmlName, {
      name: htmlName,
      idlType: idlType,
      type: idrefCemType(idlType, ifaceToTag),
    });
  }

  return result;
}

type EventInfo = {
  name: string,
  description?: string,
 };

/**
 * Returns true when an IDL type descriptor refers to an event handler callback
 * (EventHandler or OnErrorEventHandler). Used to identify event-emitting attributes.
 */
function isEventHandler(
  idlType: WebIDL2.IDLTypeDescription
) {
  if (idlType == null || idlType.union || idlType.generic) {
    return false;
  }
  return EVENT_HANDLER_TYPES.has((idlType as WebIDL2.SingleTypeDescription).idlType);
}

/**
 * Extracts HTML event descriptors from an IDL member list.
 * Identifies on* attributes whose IDL type is EventHandler or OnErrorEventHandler.
 *
 * Returns a Map: eventName → { name } (the "on" prefix is stripped).
 */
function extractEvents(
  members: IDLMemberType[],
): Map<string, EventInfo>
{
  const result = new Map<string, EventInfo>();
  for (const member of members) {
    if (member.type !== "attribute") continue;
    if (!member.name?.startsWith("on")) continue;
    if (!isEventHandler(member.idlType)) continue;
    const name = member.name.slice(2);
    if (!result.has(name)) result.set(name, { name });
  }
  return result;
}

/**
 * Converts an internal event descriptor to a CEM v2.1.0 Event object.
 * Type is always "CustomEvent" — the HTML WebIDL EventHandler typedef carries
 * no specific subtype information.
 */
function toCemEvent({ name, description }: EventInfo): CEM.Event {
  return { name, description: description ?? "", type: { text: "CustomEvent" } };
}

/**
 * Removes attributes and events listed in UNWANTED_APIS[key] from the given maps.
 * Must be called after overlays (descriptions, enum types) but before map-to-array conversion.
 */
function applyUnwantedFilter(
  attrMap: Map<string, AttributeInfo>,
  eventMap: Map<string, EventInfo>,
  key: string
) {
  const entry = UNWANTED_APIS[key];
  if (!entry) return;
  for (const name of entry.attributes ?? []) {
    if (attrMap.has(name)) {
      console.info(`remove unwanted attribute ${name} from ${key}`);
      attrMap.delete(name);
    } else {
      console.error(`unwanted attribute ${name} not found in ${key}`);
    }
  }
  for (const name of entry.events ?? []) {
    if (eventMap.has(name)) {
      console.info(`remove unwanted event ${name} from ${key}`);
      eventMap.delete(name);
    } else {
      console.error(`unwanted event ${name} not found in ${key}`);
    }
  }
}

/**
 * Converts a vscode ValueSet value to a CEM v2.1.0 ClassField for an enum declaration.
 * Property order matches lib/html: name, value, default, privacy, readonly, static, kind, description.
 */
function toCemEnumMember(
  v: ValueSetValue
): CEM.ClassField & { value: any } {
  const desc = vscodeDesc(v.description);
  return {
    name: v.name,
    value: v.name,
    default: v.name,
    privacy: "public",
    readonly: true,
    static: true,
    kind: "field",
    description: desc || undefined,
  };
}

/**
 * Converts an internal attribute descriptor to a CEM v2.1.0 ClassField member.
 *   kind              = "field"
 *   privacy           = "public"
 *   type              ← descriptor.type when already a CEM.Type (IDREF, pre-built);
 *                       otherwise built from enumType (with CEM reference) or ui5Type
 *   x-idlType         ← raw IDL type string
 *   x-ui5Constraints  ← constraints object
 *   default           ← defaultValue serialised as a string (CEM requires string)
 *   deprecated        ← boolean (standard CEM field)
 */
function toCemMember({
  name,
  idlType,
  ui5Type,
  type,
  constraints,
  defaultValue,
  deprecated,
  description,
  enumType
}: AttributeInfo
): CEM.ClassMember {
  if (type == null) {
    const typeText = enumType ?? ui5Type;
    const typeRef = enumType
      ? [{ name: enumType, package: "@ui5/html", module: `dist/enums/${enumType}.js` }]
      : undefined;
    type = {
      text: typeText!,
      ...(typeRef ? { references: typeRef } : {})
    };
  }
  return {
    kind: "field",
    name,
    description: description || undefined,
    type,
    ...(idlType !== ui5Type ? { "x-idlType": idlType } : {}),
    ...(constraints !== undefined ? { "x-ui5Constraints": constraints } : {}),
    default: defaultValue !== undefined ? String(defaultValue) : undefined,
    ...(deprecated ? { deprecated: true } : {}),
    privacy: "public",
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // ── 1. Load element list ──────────────────────────────────────────────────
  const allElementSpecs = await webrefElements.listAll();
  const htmlSpec = allElementSpecs["html"];
  if (!htmlSpec) throw new Error("No 'html' entry found in @webref/elements");

  // Reverse map: IDL interface name → HTML tag name, used to resolve IDREF types.
  const ifaceToTag = new Map<string, string>(
    htmlSpec.elements
      .filter((el) => el.interface)
      .map((el) => [el.interface!, el.name])
  );

  // ── 2. Load and index IDL ─────────────────────────────────────────────────
  const allIdl = await webrefIdl.parseAll();
  const htmlIdl = allIdl["html"];
  if (!htmlIdl) throw new Error("No 'html' IDL found in @webref/idl");

  // Partial HTML*Element interfaces in html.idl are the obsolete-members sections.
  // They must be stripped here so obsolete attributes are not collected.
  // Legitimate partial HTML* interfaces from other specs (e.g. HTMLInputElement in
  // html-media-capture for the `capture` attribute) are kept.
  const isObsoleteHtmlPartial = (node: WebIDL2.IDLRootType) =>
    node.type === "interface" &&
    node.partial === true &&
    typeof node.name === "string" &&
    node.name.startsWith("HTML");

  const allNodes = [
    ...htmlIdl.filter((node) => !isObsoleteHtmlPartial(node)),
    ...(allIdl["html-media-capture"] ?? []),
    ...(allIdl["pointerevents"] ?? []),
    ...(allIdl["wai-aria"] ?? []),
  ];

  const idlByName = new Map<string, WebIDL2.IDLRootType[]>();
  const mixinMap = new Map<string, string[]>();

  for (const node of allNodes) {
    if (node.type === "includes") {
      const list = mixinMap.get(node.target) ?? [];
      list.push(node.includes);
      mixinMap.set(node.target, list);
      continue;
    }
    if (!node.name) continue;
    const list = idlByName.get(node.name) ?? [];
    list.push(node);
    idlByName.set(node.name, list);
  }

  // ── 2.5. Build vscode lookup maps and overlay helpers ────────────────────
  // Keys are normalised to camelCase (aria-hidden → ariaHidden) for consistent matching.
  const vscodeGlobalAttrMap = new Map(
    (vscodeHtmlData.globalAttributes ?? []).map(a => [normalizeAttrName(a.name), a])
  );
  const vscodeTagAttrMap = new Map(
    (vscodeHtmlData.tags ?? []).map(t => [
      t.name,
      new Map((t.attributes ?? []).map(a => [normalizeAttrName(a.name), a])),
    ])
  );
  const vscodeTagDescMap = new Map(
    (vscodeHtmlData.tags ?? []).map(t => [t.name, vscodeDesc(t.description) ?? ""])
  );
  const vscodeValueSetMap = new Map(
    (vscodeHtmlData.valueSets ?? []).map(vs => [vs.name, vs])
  );
  const enumsToGenerate = new Map(); // replacementName → valueSetName

  // Mutates each descriptor in attrMap to add description + enumType from vscode data.
  // tagName is the element's HTML tag (for element-specific attr lookup), or null for globals.
  function overlayVscodeAttrs(
    attrMap: Map<string, AttributeInfo>,
    tagName?: string
  ): void {
    const overrideKey = tagName ?? "HTMLElementBase";
    for (const desc of attrMap.values()) {
      const vscodeAttr =
        (tagName ? vscodeTagAttrMap.get(tagName)?.get(desc.name) : undefined) ??
        vscodeGlobalAttrMap.get(desc.name);
      if (!vscodeAttr) continue;
      desc.description = vscodeDesc(vscodeAttr.description) ?? "";
      const effectiveValueSet = vscodeAttr.valueSet ?? VSCODE_OVERRIDES.attributes[overrideKey]?.[desc.name];
      if (effectiveValueSet) {
        const mapping = VALUESET_MAPPINGS[effectiveValueSet];
        if (mapping && !mapping.ignoreAsEnum && mapping.replacementName) {
          desc.enumType = mapping.replacementName;
          if (!enumsToGenerate.has(mapping.replacementName)) {
            enumsToGenerate.set(mapping.replacementName, effectiveValueSet);
          }
        }
      }
    }
  }

  // Mutates each event descriptor in eventMap to add description from vscode global attrs.
  function overlayVscodeEvents(
    eventMap: Map<string, EventInfo>
  ): void {
    for (const ev of eventMap.values()) {
      ev.description = vscodeDesc(vscodeGlobalAttrMap.get("on" + ev.name)?.description);
    }
  }

  // ── 3. Build HTMLElement base type (global attributes + events) ──────────────
  const globalMembers = collectMembers("HTMLElement", idlByName, mixinMap);
  const globalAttrMap = extractAttributes(globalMembers, "HTMLElement", ifaceToTag);
  for (const attr of GLOBAL_EXTRA_ATTRS) {
    if (!globalAttrMap.has(attr.name)) globalAttrMap.set(attr.name, attr);
  }
  const globalEventMap = extractEvents(globalMembers);
  overlayVscodeAttrs(globalAttrMap);
  overlayVscodeEvents(globalEventMap);
  // Snapshot keys before filtering so the element loop can still deduplicate against
  // the full set of "conceptually global" names (filtered-out members must not leak
  // into individual element modules either).
  const globalAttrNames = new Set(globalAttrMap.keys());
  const globalEventNames = new Set(globalEventMap.keys());
  applyUnwantedFilter(globalAttrMap, globalEventMap, "HTMLElementBase");
  const globalAttrs = [...globalAttrMap.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(toCemMember);
  const globalEvents = [...globalEventMap.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(toCemEvent);

  const htmlElementModule: CEM.JavaScriptModule = {
    kind: "javascript-module",
    path: "dist/HTMLElementBase.js",
    declarations: [
      {
        kind: "class",
        name: "HTMLElementBase",
        description:
          "Base class for all HTML elements. " +
          "Defines the global HTML content attributes shared by every element.",
        members: globalAttrs,
        events: globalEvents,
        superclass: { name: "HTMLElement", package: "sap.ui.core", module: "sap/ui/core/html/HTMLElement.js" },
      },
    ],
    exports: [
      {
        kind: "custom-element-definition",
        name: "HTMLElementBase",
        declaration: {
          name: "HTMLElementBase",
          package: "@ui5/html",
          module: "dist/HTMLElementBase.js"
        },
      },
    ],
  };

  // ── 4. Build per-element modules ──────────────────────────────────────────
  const elementModules = [];

  for (const el of htmlSpec.elements) {
    if (EXCLUDED_ELEMENTS.has(el.name)) continue;
    if (el.obsolete) continue;

    const ifaceName = el.interface;
    const className = ifaceName ?? el.name;

    const allAttrMap = ifaceName
      ? extractAttributes(
          collectMembers(ifaceName, idlByName, mixinMap),
          ifaceName,
          ifaceToTag
        )
      : new Map();
    const allEventMap = ifaceName
      ? extractEvents(collectMembers(ifaceName, idlByName, mixinMap))
      : new Map();
    overlayVscodeAttrs(allAttrMap, el.name);
    overlayVscodeEvents(allEventMap);
    applyUnwantedFilter(allAttrMap, allEventMap, el.name);

    // Only include attributes NOT already in the HTMLElement base type
    const ownAttrs = [...allAttrMap.values()]
      .filter((a) => !globalAttrNames.has(a.name))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(toCemMember);

    // Only include events NOT already in the HTMLElement base type
    const ownEvents = [...allEventMap.values()]
      .filter((ev) => !globalEventNames.has(ev.name))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(toCemEvent);

    const tagDisplayName = `${el.name[0].toUpperCase()}${el.name.slice(1)}`;

    elementModules.push({
      kind: "javascript-module",
      path: `dist/${tagDisplayName}.js`,
      declarations: [
        {
          kind: "class",
          name: tagDisplayName,
          customElement: true,
          tagName: el.name,
          description: vscodeTagDescMap.get(el.name) ?? "",
          "x-specHref": el.href,
          members: ownAttrs,
          events: ownEvents.length > 0 ? ownEvents : undefined,
          superclass: { name: "HTMLElementBase", package: "@ui5/html", module: "dist/HTMLElementBase.js" },
          ...(VOID_ELEMENTS.has(el.name) ? { "void" : true } : {}),
        },
      ],
      exports: [
        {
          kind: "custom-element-definition",
          name: el.name,
          declaration: {
            name: tagDisplayName,
            package: `@ui5/html`,
            module: `dist/${tagDisplayName}.js`,
          },
        },
      ],
    });
  }

  elementModules.sort((a, b) => a.path.localeCompare(b.path));

  // ── 5. Build enum modules (from collected value sets) ─────────────────────
  const enumModules = [];
  for (const [enumType, vsName] of [...enumsToGenerate.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const vs = vscodeValueSetMap.get(vsName);
    const delta = VSCODE_OVERRIDES.valueSets[vsName];
    const values = delta ? applyValueSetDelta(vs?.values ?? [], delta) : vs?.values;
    if (!values) continue;
    enumModules.push({
      kind: "javascript-module",
      path: `dist/enums/${enumType}.js`,
      declarations: [{
        kind: "enum",
        name: enumType,
        description: vs?.description ?? `Enum for ${enumType}`,
        members: buildEnumValues(values)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(toCemEnumMember),
      }],
      exports: [{
        kind: "js",
        name: "default",
        declaration: { name: enumType, module: `dist/enums/${enumType}.js` },
      }],
    });
  }

  // ── 6. Write output ───────────────────────────────────────────────────────
  const manifest = {
    schemaVersion: "2.1.0",
    "x-generatedAt": new Date().toISOString(),
    "x-sources": {
      elements: htmlSpec.spec.url,
      idl: "https://html.spec.whatwg.org/multipage/",
    },
    modules: [htmlElementModule, ...elementModules, ...enumModules],
  };

  const distDir = fileURLToPath(new URL("../dist/", import.meta.url));
  mkdirSync(distDir, { recursive: true });
  const outPath = fileURLToPath(new URL("../dist/custom-elements.json", import.meta.url));
  writeFileSync(outPath, JSON.stringify(manifest, null, 2));

  const totalOwnAttrs = elementModules.reduce(
    (n, m) => n + m.declarations[0].members.length, 0
  );
  const totalOwnEvents = elementModules.reduce(
    (n, m) => n + (m.declarations[0].events?.length ?? 0), 0
  );
  console.log(`Wrote ${elementModules.length} elements + ${enumModules.length} enum modules to custom-elements.json`);
  console.log(`  Global (HTMLElement) attrs  : ${globalAttrs.length}`);
  console.log(`  Global (HTMLElement) events : ${globalEvents.length}`);
  console.log(`  Element-specific attrs      : ${totalOwnAttrs}`);
  console.log(`  Element-specific events     : ${totalOwnEvents}`);
}

/*
 * NOTE-enums — Enum types for enumerated HTML attributes
 * ───────────────────────────────────────────────────────
 * The HTML spec defines many attributes as "enumerated" (e.g. dir, wrap,
 * loading, decoding, crossorigin, inputmode, …) but their valid values are
 * documented only in spec prose, not in the WebIDL (all typed as DOMString).
 *
 * Enum types are supplied by @vscode/web-custom-data (see VALUESET_MAPPINGS).
 * Each value set referenced by a vscode attribute that has a VALUESET_MAPPINGS
 * entry results in a generated CEM enum module under dist/enums/.
 *
 * Attributes whose value set maps to ignoreAsEnum:true (e.g. "target", "relevant")
 * keep their plain "string" type and no enum module is generated for them.
 */

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { main };
