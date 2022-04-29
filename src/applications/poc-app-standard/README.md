# Optimized Bootstrap and Core

POC to show-case a minimalistic boot bundle to run the `openui5-sample-app`. The idea is to reduce the bundle size of the `custom-boot.js` by exlcuding some "unnecessary" modules from the `custom-boot.js` bundle. These modules must be stubbed before the `Core.js` and the `ComponentContainer.js` are required to avoid errors, e.g. as in `Boot.js`.

## Repository structure

The repository includes two sub-projects as UI5 applications. Both projects contain the `openui5-sample-app` application code with config for a `custom-boot.js` bundle and `Component-bundle.js` build.

* `/ui5`
  * classic UI5 approach using jQuery
* `/ui5webc`
  * app built with ui5 webcomponents using jQuery stubs, since jQuery is not needed by webcomponents and shouldn't be needed by the `Core.js` as well
* `/ui5loader.js`
  * Only required for UI5 version < `1.101.0`

## POC Details

* `[...]/Boot.js`
  * Boots the `sap/ui/core/Core.js` and creates the app component.
  

## Build it using local UI5 sources

> Prerequisites: Node >= v10; npm >= v7 or npm < v7 and yarn

> Note: In case you use npm >= v7 please check, that package.json workspaces has correct reference to your local UI5 src folder.

First run in your local UI5 root folder

```bash
# for npm >= v7
npm install

# for npm < v7 and yarn
yarn
yarn run link-all # Consider this is only necessary if your repository is not linked yet and it's only possible in case you did not already link to another local openui5 repository.
```

Second run in application directory

```bash
# for npm >= v7
npm install

# for npm < v7 and yarn
yarn
yarn link @openui5/sap.ui.core @openui5/sap.ui.webc.main
```

To build the application with its required dependent (library) resources, run the following command once.

```bash
npm run build
```
Use the next command to re-build the application, when changes are made to the app only.

```bash
npm run build-app
```

## Run it
Start a local server and run the application (https://localhost:8000)

```sh
npm run serve-dist
```

## Link it (to local openui5 resources)

Follow the instruction on [working-with-local-dependencies](https://github.com/SAP/openui5-sample-app#working-with-local-dependencies).



