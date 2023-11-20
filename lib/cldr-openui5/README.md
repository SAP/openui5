# cldr-openui5

## Installation
Install all dependencies for `OpenUI5` and `cldr-openui5`.
```sh
# open terminal in the directory of your local openui5 repository
npm install
cd lib/cldr-openui5
npm install
```

## Generate CLDR Files
To execute `cldr-openui5` you can call the following commands depending on the current user's terminal directory:
```sh
# via openui5
npm run generate-cldr

# via openui5/lib/cldr-openui5
npm start
```

Optionally, these commands can be enhanced with CLI arguments to individually start the `download` or `generate` step:

Argument | Description
-------- | ---------------------------------------------------------
download | Downloads all required CLDR packages
generate | Generates CLDR files based on the downloaded packages

```sh
npm run generate-cldr <argument>
# e.g.: npm run generate-cldr download
```

## Upgrade CLDR Version
To upgrade to a newer CLDR version pick a valid version number from [Unicode CLDR](https://cldr.unicode.org/).  
Simply change the configured `CLDR_VERSION` in `openui5/lib/cldr-openui5/cli.js` and generate new CLDR files as described above.

## Tests
Starts static ESLint code checks and generator tests which are defined in `openui5/lib/cldr-openui5/test`:
```sh
# via openui5/lib/cldr-openui5
npm test
```
