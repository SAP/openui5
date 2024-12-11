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
# e.g.: npm run generate-cldr generate
```

## Upgrade CLDR Version
To upgrade to a newer CLDR version pick a valid version number from [Unicode CLDR](https://cldr.unicode.org/).<br>
Simply change the configured `CLDR_VERSION` in `openui5/lib/cldr-openui5/cli.js` and generate new CLDR files as described above.

## Tests
Starts static ESLint code checks and generator tests which are defined in `openui5/lib/cldr-openui5/test`:
```sh
# via openui5/lib/cldr-openui5
npm test
```

## Mocha tests
To run the package's mocha tests use the `npm run mocha` command.
To run a specific mocha test use the

```sh
npm run mocha -- --grep '<string contained in a 'describe' or 'it' in a mocha test file>'
```

command. The string part passed to the flag has to be case sensitive.
E.g:

```js
// Example from Generator.mocha.js
describe("Generator.js", function () {

	it("constructor", function () {
		// Test some stuff
	});

	it("private members", function () {
		// Test some stuff
	});
});
```

```sh
npm run mocha -- --grep 'Generator.js' # Runs all tests under describe("Generator.js", ...)
npm run mocha -- --grep 'private members' # Runs the test with the title 'private members'
```

## Show test coverage
After running the tests with coverage enabled (`npm test`), you can display the coverage results in the browser
by running `npm run serve-coverage` and accessing the results under [here](http://localhost:8082/index.html):
```sh
# via openui5/lib/cldr-openui5
npm run serve-coverage
```
