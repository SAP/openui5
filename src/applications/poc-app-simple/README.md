# modular-core-poc
POC to show-case the possibilities of UI5 with a Modular Core.

## Repository structure

The repository includes two sub-projects as UI5 applications:

* `/ui5`
  * contains a notepad control without theming
* `/ui5webc`
  * contains a button as a UI5 webcomponent

## POC Details

* `[...]/lib/Core.js`
  * a stub for the default Core
    * used to remove unnecessary dependencies and minimize the bundle size
* `[...]/lib/UltraCore.js`
  * contains mostly a simplified jQuery facade
* `[...]/lib/ES6Magic.js`
  * Contains some code to connect a standard ES6 class with UI5's class system.
* `[...]/App.js`
  * App startup code, creates the Button UI

## Run it

The project uses the watch plugin to modify and check the result immediately. As it uses custom bundling the application must be run in productive mode. You can start it via:

```bash
npm run watch
```

In case of changes of HTML, CSS, JS, JSON, ui5.yaml file the watch mode triggers the rebuild of the application.

To run the project use the following link [https://localhost:8000/index-custom.html](https://localhost:8000/index-custom.html) or [https://localhost:8000/index.html](https://localhost:8000/index.html). The index.html is using the self-contained build result (as comparision!).

## Optimizing bundles after code changes

To avoid any other requests than the `sap-ui-ultracore.js` bundle, it is required to adapt the build bundle definition.
You need to provide the full list of all modules that should be bundled.
To get this list perform the following steps:

1. Adapt the `ui5.yaml`: You need to clear the `filters` bundle section for the `sap-ui-ultracore.js` bundle.

2. Inspect the list of loaded modules by running each app via: 
[https://localhost:8000/index-custom-inspect.html](https://localhost:8000/index-custom-inspect.html)

3. After starting the app perform the following command in the debug console:

```javascript
copy(window["sap-ui-modules"].join("\n- "))`
```

4. After copying the list, paste this list in the `filters` section of the `sap-ui-ultracore.js` bundle definition.