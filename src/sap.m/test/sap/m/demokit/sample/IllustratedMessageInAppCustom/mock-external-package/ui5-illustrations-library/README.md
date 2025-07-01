# UI5 Illustrations Library Demo

A template package demonstrating how to create and distribute custom SVG illustrations for SAP UI5 applications that use `sap.m.IllustratedMessage`.

## Validation

This library also provides validation tools to ensure illustration sets meet required specifications:

### Validation criteria

1. **Metadata**: If present, `metadata.json` should contain valid JSON with a `symbols` field listing alphanumeric illustration IDs.

2. **Filename Format**: SVG files must follow the format `<SetID>-<Size>-<IllustrationID>.svg`, where:
   - `<SetID>` is an alphanumeric string and must be the same for all SVG files
   - `<Size>` is one of the valid sizes `Scene`, `Dialog`, `Dot`, `Spot`
   - `<IllustrationID>` is an alphanumeric string that should be listed in `metadata.json` if it exists

3. **Completeness**: For each `<IllustrationID>`, there must be exactly one SVG file for each size.

4. **SVG Content**:
   - The root `<svg>` tag must have an `id` attribute matching the filename (without extension)
   - No `style` attributes are allowed (use `class` attributes instead)
   - Sanitization of the SVG content using DOMPurify is also applied

### Validation Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fixIds` | boolean | `false` | Automatically corrects invalid `id` attributes in the root `<svg>` tag within the SVG file content. |
| `silent` | boolean | `false` | If true, suppresses console output |

## Usage

### For Package Maintainers

Before publishing your npm package, validate your illustrations set by running:

```bash
# Basic validation
npm run validate

# Validation with automatic correction of invalid `id` attributes in the root `<svg>` tag within the SVG file content.
npm run validate:fix-ids

```

The validation process will check your illustrations against the listed criteria and log any errors with detailed information.

### For Consuming Applications

Applications consuming this library can also validate the illustrations set independently:

```javascript
const { validateIllustrations } = require('ui5-illustrations-library');
const validationResult = validateIllustrations('<path-to-illustrations-folder>');

if (result.isValid) {
  console.log('All illustrations are valid!');
} else {
  console.error('Validation errors:', result.errors);
}
```