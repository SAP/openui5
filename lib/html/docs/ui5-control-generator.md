# The UI5 Control Generator

The second stage turns the CEM (`dist/custom-elements.json`) into the `sap.html` UI5 control wrappers under `src/sap.html/src/sap/html/` (one control per HTML element, plus `HTMLElementBase`, the `library.js` and the enum modules).

Unlike the [Element Manifest Generator](./element-manifest-generator.md), this stage is **not** implemented in this subproject. It is provided by the [`ui5-tooling-modules`](https://www.npmjs.com/package/ui5-tooling-modules) package of the UI5 ecosystem; this subproject only *invokes* it.

## Invocation

`npm run build` first runs the Element Manifest Generator and then calls `generateControls` (from `ui5-tooling-modules/cli/createControls.js`) in [`src/main.ts`](../src/main.ts). The relevant options:

| Option | Value | Purpose |
|---|---|---|
| `input` | `dist/custom-elements.json` | The CEM produced by stage 1 |
| `output` | `src/sap.html/src` | Target source tree for the wrappers |
| `namespace` | `@ui5/html` | npm package namespace used inside the CEM |
| `ui5Namespace` | `sap.html` | UI5 library namespace of the generated controls |
| `stripModulePrefix` | `dist` | Strips the `dist/` prefix from CEM module paths |
| `version` | `${version}` | UI5 build-time version placeholder (not the npm version) |
| `libraryMode` + `libraryDescription` + `since` | — | Emit a full UI5 library (incl. `library.js`) |
| `prettierOptions` | tabs, width 4 | Emit sources in the UI5 code style |

## How it works

`generateControls` loads the CEM into a `WebComponentRegistry` (`ui5-tooling-modules/lib/utils/WebComponentRegistry.js`), which:

1. resolves every class (HTML element) and its superclass chain — each element extends `HTMLElementBase`, which in turn extends the runtime base class `sap/ui/core/html/HTMLElement` (shipped in `sap.ui.core`, **not** generated here);
2. translates each CEM member into UI5 metadata — `field` members become **properties** (or **associations** for element references), slots become **aggregations**, and `on*`-derived entries become **events**;
3. derives the UI5 property `mapping` from the member (see below);
4. emits one UI5 control module per element, one enum module per enum type, and the library's `library.js`.

The result is a set of ordinary UI5 control classes: an app imports e.g. `sap/html/Button` or writes `<button>` in an XML view under the `sap.html` namespace.

## Mapping derivation

The UI5 `mapping` (how a property is reflected onto the DOM) is **not stored in the CEM** — the registry computes it from the member's type and name. The main cases:

| Member | Resulting UI5 mapping |
|---|---|
| *default* | `"property"` — rendered as an HTML attribute |
| `disabled` | `enabled` property, `{ to: "disabled", formatter: "_mapEnabled" }` (+ `EnabledPropagator`) |
| `accessibleNameRef` | `ariaLabelledBy` association, `{ formatter: "_getAriaLabelledByForRendering" }` |
| type `sap.ui.core.URI` | `{ formatter: "_validateUrl" }` — blocks unsafe URL schemes at render time |
| type `sap.ui.core.ValueState` | `{ formatter: "_mapValueState", parser: "_parseValueState" }` |

The referenced formatters/parsers are implemented on `sap/ui/core/html/HTMLElement` (and `sap/ui/core/webc/WebComponent`, which the registry also serves).
