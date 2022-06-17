# How to generate the JSDoc for TestObjects

## 1. Install jsdoc2md
We use https://github.com/jsdoc2md/jsdoc-to-markdown to generate the Markdown files.<br>
The GitHub mentiones the following command to install it:<br><br>
<code>npm install --save-dev jsdoc-to-markdown</code><br><br>
NOTE: I would not recommend doing it this way. As this did not work for on MacOS so I instead installed it globally. Also installing it with the above command will change the package.json of the openui5 lib<br><br>
<code>npm install -g jsdoc-to-markdown</code>

## 2. Generate JSDoc
Use <code>jsdoc2md InputFile.js > OutPutFile.md</code>

### Example 1:
<code>jsdoc2md openui5/src/sap.ui.mdc/test/sap/ui/mdc/testutils/opa/link/TestObjects.js > openui5/src/sap.ui.mdc/test/sap/ui/mdc/testutils/opa/link/JSDoc.md</code>

### Example 2:
<code>cd openui5/src/sap.ui.mdc/test/sap/ui/mdc/testutils/opa</code><br>
<code>jsdoc2md link/TestObjects.js > link/JSDoc.md</code>