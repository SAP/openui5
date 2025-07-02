# UI5 Demo Application with sap.m.IllustratedMessage and custom illustrations

This application demonstrates how to integrate libraries of cusrom illustrations into UI5 applications through npm packages and UI5 Tooling.

## Overview

This demo showcases:
1. How to consume custom illustrations from an npm package
2. How to validate and sanitize the custom illustrations during the build process
3. How to make custom illustrations available as UI5 resources
4. Best practices for using shared libraries of custom illustrations in enterprise UI5 applications

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- UI5 CLI (`npm install -g @ui5/cli`)

### Installation

```bash
npm install
```

## Project Structure

```
ui5-custom-illustrations-app/
├── webapp/
│   ├── Component.js
│   ├── controller/
│   ├── i18n/
│   ├── resources/            # Target directory for illustrations (populated during build)
│   ├── view/
│   └── index.html
├── ui5.yaml                  # UI5 Tooling configuration
└── package.json              # lists the custom illustrations library in its dependencies
└── add-illustrations-task.js # Custom UI5 build-time task to move the illustrations of the installed illustrations library into a local folder of the UI5 application
├── mock-external-package/    # mock representation of the custom illustrations library that in real scenarious will be fetched from an npm repo instead of this local folder (given the external package is declared in the package.json)
│   ├── ui5-illustrations-library/
│       ├── illustrations/
│       ├── src/
│           ├── illustrationsValidator.js # validates and sanitizes the illustrations
│           ├── index.js
│       ├── package.json
│       ├── README.md
```

## Key Features

### Custom UI5 Task

The custom task (`add-illustrations-task.js`) performs the following:

1. Triggers validation of the custom illustrations using the validation functions from the illustrations npm package
2. Copies validated illustrations to the application's resources directory

### UI5 Configuration

The `ui5.yaml` file configures the add-illustrations task:

```yaml
customTasks:
  - name: add-illustrations-task
      beforeTask: generateComponentPreload
      configuration:
        illustrationsPackage: ui5-illustrations-library  # Name of the illustrations npm package
        sourcePath: node_modules/ui5-illustrations-library/illustrations  # Optional: custom source path
        targetPath: webapp/resources/illustrations  # Optional: custom target path
```

## Development Workflow

1. **Build the application**:
   ```bash
   npm run build
   ```
   The build process will validate the custom illustrations and copy them to resources.

2. **Start the development server**:
   ```bash
   npm run start
   ```

3. **Access the application**:
   Open [http://localhost:8080](http://localhost:8080) in your browser.

## Usage Examples

### Registering the illustrations set

```javascript
sap.ui.define(['sap/ui/core/UIComponent', 'sap/m/IllustrationPool'],
function (UIComponent, IllustrationPool) {
  "use strict";
  return UIComponent.extend("sap.m.sample.IllustratedMessageInAppCustom.Component", {
    metadata: {
      manifest: "json"
    },
    init : function () {
      // call the base component's init function
      UIComponent.prototype.init.apply(this, arguments);
      var oCustomSet = {
        setFamily: "Custom",
        setURI: sap.ui.require.toUrl("illustrations")
      };
      // register Custom illustration set
      IllustrationPool.registerIllustrationSet(oCustomSet, false);
    }
  });
});
```
### Usage in XML Views

```xml
<mvc:View
  xmlns:mvc="sap.ui.core.mvc"
  xmlns="sap.m"
  xmlns:core="sap.ui.core"">
    <Page>
      <IllustratedMessage
        title="Sample Title"
        description="Sample Description"
        illustrationType="Custom-EmptyCart">
      </IllustratedMessage>
  </Page>
</mvc:View>
```

## Best Practices

1. **Separation of Concerns**: Keep illustration resources in dedicated npm packages
2. **Validation**: Always validate illustrations before including them in your application
4. **Resource Path Management**: Use UI5's resource path system for referencing illustrations

## Learn More

- [UI5 Tooling Documentation](https://sap.github.io/ui5-tooling/)
- [SVG in UI5 Applications](https://openui5.hana.ondemand.com/#/topic/3cc020e2ff3940e88c3d56913b64143a)
- [UI5 Resource Handling](https://openui5.hana.ondemand.com/#/topic/5bb388fc289d44dca886c8fa25da466e)