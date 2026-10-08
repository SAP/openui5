# The Element Manifest Generator

The element manifest generator generates a [Custom Elements Manifest v2.1.0](https://github.com/webcomponents/custom-elements-manifest) (called CEM) for the OpenUI5 `sap.html` library under `dist/custom-elements.json`.

The CEM describes all standard HTML elements with their markup-usable attributes, types, constraints, and events. The output drives automated generation of UI5 controls that wrap native HTML elements.

## Scripts

| Command | Effect |
|---|---|
| `npm run build` | Full pipeline: generate `dist/custom-elements.json`, then call `generateControls` to emit UI5 control wrappers into `src/sap.html/src/` |
| `npm run generate` | JSON generation only (useful for inspection) |
| `npm run clean` | Remove generated control wrappers from `src/sap.html/src/sap/html/`, keeping static files like `.library` |

## How it works

The generator reads W3C WebRef data packages:

| Package | Role |
|---|---|
| [`@webref/elements`](https://www.npmjs.com/package/@webref/elements) | Maps element names to their IDL interface (e.g. `<a>` → `HTMLAnchorElement`) and flags obsolete elements |
| [`@webref/idl`](https://www.npmjs.com/package/@webref/idl) | Provides the parsed WebIDL AST for the HTML Living Standard |

The following IDL spec files are merged to build the complete interface map:

| IDL spec | Contribution |
|---|---|
| `html` | HTML elements, `GlobalEventHandlers`, `WindowEventHandlers`, all core attributes and events |
| `html-media-capture` | `capture` attribute on `<input>` |
| `pointerevents` | 11 pointer event handlers on `GlobalEventHandlers` (`onpointerdown`, `onpointermove`, etc.) |
| `wai-aria` | ARIA attributes on `ARIAMixin` (e.g. `ariaHidden`, `ariaLabel`, `ariaRole`) |

Obsolete elements (flagged in `@webref/elements`) and obsolete IDL members (in `partial interface HTML*` sections of `html.idl`) are filtered out before processing.

### Identifying HTML content attributes — three passes

Not every IDL attribute corresponds to an HTML markup attribute. The generator runs three passes per interface to collect the right set.

**Pass 1 — `[Reflect*]` family (authoritative)**

An IDL member marked with one of these extended attributes is a reflected HTML content attribute:

`[Reflect]`, `[ReflectURL]`, `[ReflectNonNegative]`, `[ReflectPositive]`, `[ReflectPositiveWithFallback]`, `[ReflectRange]`, `[ReflectSetter]`, `[ReflectDefault]`

Members can carry multiple variants simultaneously — the generator collects all of them to derive both the UI5 type and any numeric constraints:

```webidl
[CEReactions, Reflect, ReflectRange={1, 1000}, ReflectDefault=1]
attribute unsigned long span;
```

The `[Reflect="attrname"]` rhs overrides the IDL name when the HTML attribute name differs from the property name (e.g. IDL `formNoValidate` → HTML attribute `formnovalidate`).

**Pass 2 — writable `[CEReactions]`-only attributes with primitive types**

Some HTML content attributes are defined with only `[CEReactions]` and no `[Reflect*]` variant. Examples: `formenctype`, `formmethod`, `dir`, `translate`, `hidden`, `contenteditable`, `loading`, `decoding`, `crossorigin`, `referrerpolicy`. Pass 2 includes writable attributes in this category when:

- The IDL type is *primitive-like*: a string type, `boolean`, numeric, `DOMTokenList`, or a union of primitives (`TrustedHTML` is treated as string-equivalent)
- The lowercased attribute name is **not** in the denylist (see below)

The denylist excludes known IDL-only properties that are not HTML content attributes:

| Excluded name(s) | Reason |
|---|---|
| `innerhtml`, `outerhtml` | DOM serialisation helpers, not HTML attributes |
| `innertext`, `outertext`, `text` | Text-content aliases on anchor, script, option, title elements |
| `defaultvalue`, `value` | Runtime state properties; the `<input>` content attribute `value` is reflected via `defaultValue`'s `[Reflect="value"]` |
| `length` | DOM collection size on `<select>`, not a content attribute |
| `encoding` | Legacy IDL alias for `enctype`; the HTML attribute is `enctype` |
| `protocol`, `username`, `password`, `host`, `hostname`, `port`, `pathname`, `search`, `hash` | `HyperlinkElementUtils` URL decomposition; not HTML attributes |

**Pass 3 — curated IDREF attributes**

Some HTML content attributes take a referenced element's ID string in markup, but their IDL property is readonly and returns the resolved element object (no `[Reflect*]`, no `[CEReactions]`). These cannot be discovered automatically. The `form` attribute on form-associated elements is the canonical example.

### Inheritance

Each element's attributes and events are resolved by following the full IDL inheritance chain and all `includes` (mixin) statements. Global attributes and events that belong to `HTMLElement` and its mixins are factored out into a dedicated `HTMLElementBase` module and **not repeated** in element modules.

### Identifying events

Events are identified by scanning IDL members for `on*` attributes whose type is the `EventHandler` or `OnErrorEventHandler` callback typedef. The event name is the attribute name with the `on` prefix stripped (e.g. IDL `onclick` → event `click`).

All events use `type.text: "CustomEvent"` — the `EventHandler` typedef carries no specific event subtype in WebIDL.

**Global events** (from the `GlobalEventHandlers` mixin, 87 total including pointer events) appear in the `HTMLElementBase` module and are not repeated in individual element modules.

**Element-specific events** appear only in the element's own module. In practice only `<body>` and `<frameset>` have element-specific events (from the `WindowEventHandlers` mixin: `afterprint`, `beforeprint`, `hashchange`, `popstate`, etc.).

### Enumerated attributes

Many HTML attributes accept a fixed set of values (e.g. `dir`, `loading`, `decoding`, `crossorigin`, `inputmode`). The HTML WebIDL types them as plain `DOMString`, so their valid values are not machine-readable from the IDL. The generator overlays enum type information from [`@vscode/web-custom-data`](https://www.npmjs.com/package/@vscode/web-custom-data) via `VALUESET_MAPPINGS`, which maps vscode value-set identifiers to named UI5 enum types (e.g. `"loading"` → `Loading`, `"d"` → `Direction`). A corresponding enum module is generated for each mapped value set.

### Correcting vscode data

The vscode package occasionally has inaccuracies: missing `valueSet` references on known attributes, stale value lists from old spec drafts, duplicate entries, or missing values added in recent spec revisions. These are corrected via `VSCODE_OVERRIDES`:

- **`attributes`** — two-level map `(HTMLElementBase | tag name) → attr name → value-set name`. Assigns a value-set reference to attributes that vscode omits or annotates incorrectly (e.g. `inputmode` is a global attribute in vscode but has no `valueSet` reference, so it is wired to `"im"` here).

- **`valueSets`** — per value-set delta `{ add?, remove? }` applied on top of the vscode base list. `remove` names entries to drop; `add` appends new entries. The combined result is always deduplicated and sorted alphabetically by the general `buildEnumValues` step.

Example overrides applied:

| Value set | Correction |
|---|---|
| `im` (InputMode) | Remove 8 stale W3C draft values; add `none`, `text`, `decimal`, `search` |
| `t` (InputType) | Remove `datetime` (removed from HTML5 ~2013; `datetime-local` remains) |
| `s` (TableSection) | Add `auto` (the default state for `<th scope>`) |
| `inputautocomplete` | Add `one-time-code` and `webauthn` |
| `roles` (AriaRole) | Add 12 ARIA 1.2 structural roles; duplicate `region` entry removed by deduplication |

### Filtering experimental APIs

The `UNWANTED_APIS` constant provides a curated denylist of experimental or non-standard attributes and events. It is keyed by `"HTMLElementBase"` for global members or by HTML tag name for element-specific members. Members listed there are removed after the vscode overlay but before the CEM output is assembled; they are suppressed both from their defining module and from all element modules.

## Output format

The output is a [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest) (`schemaVersion: "2.1.0"`) with one module for `HTMLElementBase`, one per HTML element, and one per generated enum type.

Class names are derived from the HTML tag name by upper-casing the first letter (`button` → `Button`, `td` → `Td`).

```json
{
  "schemaVersion": "2.1.0",
  "modules": [
    {
      "kind": "javascript-module",
      "path": "dist/HTMLElementBase.js",
      "declarations": [{
        "kind": "class",
        "name": "HTMLElementBase",
        "description": "Base class for all HTML elements...",
        "members": [
          { "kind": "field", "name": "title",     "type": { "text": "string"  }, "default": "undefined", "privacy": "public" },
          { "kind": "field", "name": "tabindex",  "type": { "text": "integer" }, "default": "undefined", "privacy": "public" },
          { "kind": "field", "name": "autofocus", "type": { "text": "boolean" }, "default": "undefined", "privacy": "public" }
        ],
        "events": [
          { "name": "click",  "description": "...", "type": { "text": "CustomEvent" } },
          { "name": "keydown","description": "...", "type": { "text": "CustomEvent" } }
        ]
      }],
      "exports": [{ "kind": "custom-element-definition", "name": "HTMLElementBase",
                    "declaration": { "name": "HTMLElementBase", "package": "@ui5/html", "module": "dist/HTMLElementBase.js" } }]
    },
    {
      "kind": "javascript-module",
      "path": "dist/Button.js",
      "declarations": [{
        "kind": "class",
        "name": "Button",
        "customElement": true,
        "tagName": "button",
        "description": "...",
        "superclass": { "name": "HTMLElementBase", "package": "@ui5/html", "module": "dist/HTMLElementBase.js" },
        "members": [
          { "kind": "field", "name": "disabled",    "type": { "text": "boolean" }, "default": "undefined", "privacy": "public" },
          { "kind": "field", "name": "form",
            "type": { "text": "HTMLElement | string | undefined",
                      "references": [{ "name": "Form", "package": "@ui5/html", "module": "dist/Form.js" }] },
            "default": "undefined", "privacy": "public" },
          { "kind": "field", "name": "commandfor",
            "type": { "text": "HTMLElement | string | undefined" },
            "default": "undefined", "privacy": "public" },
          { "kind": "field", "name": "formaction",  "type": { "text": "sap.ui.core.URI" }, "default": "undefined", "privacy": "public" },
          { "kind": "field", "name": "formenctype",
            "type": { "text": "EncodingType",
                      "references": [{ "name": "EncodingType", "package": "@ui5/html", "module": "dist/enums/EncodingType.js" }] },
            "default": "undefined", "privacy": "public" }
        ]
      }],
      "exports": [{ "kind": "custom-element-definition", "name": "button",
                    "declaration": { "name": "Button", "package": "@ui5/html", "module": "dist/Button.js" } }]
    },
    {
      "kind": "javascript-module",
      "path": "dist/Td.js",
      "declarations": [{
        "kind": "class",
        "name": "Td",
        "customElement": true,
        "tagName": "td",
        "superclass": { "name": "HTMLElementBase", "package": "@ui5/html", "module": "dist/HTMLElementBase.js" },
        "members": [
          { "kind": "field", "name": "colspan", "type": { "text": "integer" }, "default": "1", "privacy": "public" },
          { "kind": "field", "name": "rowspan", "type": { "text": "integer" }, "default": "1", "privacy": "public" }
        ]
      }],
      "exports": [{ "kind": "custom-element-definition", "name": "td",
                    "declaration": { "name": "Td", "package": "@ui5/html", "module": "dist/Td.js" } }]
    },
    {
      "kind": "javascript-module",
      "path": "dist/enums/EncodingType.js",
      "declarations": [{
        "kind": "enum",
        "name": "EncodingType",
        "description": "...",
        "members": [
          { "name": "application/x-www-form-urlencoded", "value": "application/x-www-form-urlencoded",
            "default": "application/x-www-form-urlencoded", "privacy": "public", "readonly": true, "static": true,
            "kind": "field", "description": "..." }
        ]
      }],
      "exports": [{ "kind": "js", "name": "default",
                    "declaration": { "name": "EncodingType", "module": "dist/enums/EncodingType.js" } }]
    }
  ]
}
```

### IDREF attributes

Attributes whose value in markup is a referenced element's ID are typed as follows:

- **Generic element reference** (`Element?` or `HTMLElement?`): `{ "text": "HTMLElement | string | undefined" }` — no `references` array
- **Specific interface reference** (e.g. `HTMLFormElement?`): `{ "text": "HTMLElement | string | undefined", "references": [{ "name": "Form", "package": "@ui5/html", "module": "dist/Form.js" }] }` — the `references` entry points to the corresponding UI5 control module

This magic type string is handled by `ui5-tooling-modules`, which wires up the correct UI5 association type at control-generation time.

### Custom extension fields (`x-*`)

| Field | Location | Meaning |
|---|---|---|
| `x-idlType` | Member | Raw WebIDL type string; omitted when equal to `type.text` |
| `x-ui5Constraints` | Member | `{ minimum?, maximum? }` from `[ReflectRange]` / `[ReflectNonNegative]` / `[ReflectPositive]` |
| `x-specHref` | Class declaration | URL of the element's definition in the HTML Living Standard |

The following fields are always present:

| Field | Location | Meaning |
|---|---|---|
| `x-generatedAt` | Manifest root | ISO timestamp of generation |
| `x-sources` | Manifest root | URLs of the WebRef data packages used |

## Type mappings

### Primitive types

| IDL type | `type.text` |
|---|---|
| `boolean` | `boolean` |
| `long`, `unsigned long`, `short`, `unsigned short`, `long long`, `unsigned long long`, `byte`, `octet` | `integer` |
| `double`, `float`, `unrestricted double`, `unrestricted float` | `number` |
| `DOMString`, `CSSOMString`, `ByteString` | `string` |
| `DOMString?` (nullable string) | `string` |
| `DOMTokenList` (space-separated token list in markup) | `string` |
| Union of primitive types (e.g. `boolean or DOMString`) | `string` |
| `TrustedHTML`, `TrustedScript` | `string` |
| `USVString` | `sap.ui.core.URI` |
| `[ReflectURL]` on any string type | `sap.ui.core.URI` |
| `Element?` / `HTML*Element?` (IDREF) | `HTMLElement \| string \| undefined` (+ optional `references`) |
| Other object references | `object` |

### Numeric constraints via `[Reflect*]` variant

Derived at generation time and stored in `default` (as a string) and in `x-ui5Constraints` (when `MINIMIZE_DIFF = false`):

| Reflect variant | Effect |
|---|---|
| `[ReflectNonNegative]` | `x-ui5Constraints: { minimum: 0 }` |
| `[ReflectPositive]` / `[ReflectPositiveWithFallback]` | `x-ui5Constraints: { minimum: 1 }` |
| `[ReflectRange={lo, hi}]` | `x-ui5Constraints: { minimum: lo, maximum: hi }` |
| `[ReflectDefault={n}]` | `default: "n"` |

## Known limitations

**`autocomplete` on `<button>`.** This attribute was added to the HTML spec after the `@webref/idl@3.83.0` data snapshot (the latest available version) and is therefore absent from the IDL source.

**`capture` on `<input>`.** The `html-media-capture` spec defines `capture` with only `[CEReactions]` (no `[Reflect*]`). The attribute is currently suppressed via `UNWANTED_APIS` because it is only available in Chrome for Android. It can be promoted to a supported attribute by removing it from `UNWANTED_APIS["input"]`.

**Deprecation markers.** The HTML WebIDL does not carry `[Deprecated]` markers for individual attributes. Obsolete *elements* are filtered via the `obsolete` flag in `@webref/elements`, and obsolete *IDL members* are excluded by stripping `partial interface HTML*` sections from `html.idl`. Individual attributes that are deprecated-but-not-removed remain visible in the output.
