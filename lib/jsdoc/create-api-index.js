/*
 * Node script to create cross-library API index files for use in the UI5 SDKs.
 *
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

"use strict";
const fs = require("fs");
const path = require("path");

function process(versionInfoFile, unpackedTestresourcesRoot, targetFile, targetFileDeprecated, targetFileExperimental, targetFileSince) {

	console.log("[INFO] creating API index files");
	console.log("[INFO]   sap-ui-version.json: " + versionInfoFile);
	console.log("[INFO]   unpacked test-resources: " + unpackedTestresourcesRoot);
	console.log("[INFO]   target file: " + targetFile);
	console.log("[INFO]   target file deprecated: " + targetFileDeprecated);
	console.log("[INFO]   target file experimental: " + targetFileExperimental);
	console.log("[INFO]   target file since: " + targetFileSince);
	console.log("[INFO]");

	// Deprecated, Experimental and Since collections
	let oListCollection = {
		deprecated: {
			noVersion: {
				apis: []
			}
		},
		experimental: {
			noVersion: {
				apis: []
			}
		},
		since: {
			noVersion: {
				apis: []
			}
		}
	};

	function readJSONFile(file) {
		return new Promise(function (resolve, reject) {
			fs.readFile(file, 'utf8', function (err, data) {
				if (err) {
					reject(err);
				} else {
					// Handle empty files scenario
					if (data.trim() === "") {
						resolve({});
					} else {
						resolve(JSON.parse(String(data)));
					}
				}
			});
		});
	}

	function mkdirSync(dir) {
		if (dir && !fs.existsSync(dir)) {
			mkdirSync( path.dirname(dir) );
			fs.mkdirSync(dir);
		}
	}

	function writeJSON(file, content) {
		return new Promise(function(resolve,reject) {
			// Create dir if it does not exist
			mkdirSync( path.dirname(file) );
			fs.writeFile(file, JSON.stringify(content), "utf-8", function(err) {
				if ( err ) {
					reject(err);
					return;
				}
				resolve(true);
			});
		});
	}

	/*
	 * Extracts main symbol information from a library api.json.
	 * Also collects deprecated, experimental and since api's.
	 * Returns a promise that resolves with an array of symbols.
	 */
	function createSymbolSummaryForLib(lib) {
		let file = path.join(unpackedTestresourcesRoot, lib.replace(/\./g, "/"), "designtime/api.json");

		return readJSONFile(file).then(function (apijson) {
			if (!apijson.hasOwnProperty("symbols") || !Array.isArray(apijson.symbols)) {
				// Ignore libraries with invalid api.json content like empty object or non-array "symbols" property.
				return [];
			}
			return apijson.symbols.map(symbol => {
				collectLists(symbol);
				return {
					name: symbol.name,
					kind: symbol.kind,
					visibility: symbol.visibility,
					extends: symbol.extends,
					implements: symbol.implements,
					lib: lib
				};
			});
		})
	}

	/*
	 * Collects Deprecated, Experimental and Since data from passed symbol
	 * including symbol itself, methods and events.
	 */
	function collectLists(oSymbol) {

		function addData(oDataType, oEntityObject, sObjectType, sSymbolName) {
			let sSince = oDataType !== "since" ? oEntityObject[oDataType].since : oEntityObject.since,
				oData = {
					control: sSymbolName,
					text: oEntityObject[oDataType].text || oEntityObject.description,
					type: sObjectType,
					"static": !!oEntityObject.static,
					visibility: oEntityObject.visibility
				};

			// For class we skip entityName
			if (sObjectType !== "class") {
				oData.entityName = oEntityObject.name;
			}

			if (sSince) {
				// take only major and minor versions
				let sVersion = sSince.split(".").slice(0, 2).join(".");

				oData.since = sSince;

				if (!oListCollection[oDataType][sVersion]) {
					oListCollection[oDataType][sVersion] = {
						name: sVersion,
						apis: []
					};
				}

				oListCollection[oDataType][sVersion].apis.push(oData);
			} else {
				oListCollection[oDataType].noVersion.apis.push(oData);
			}
		}

		// Classes
		if (oSymbol.deprecated) {
			addData("deprecated", oSymbol, "class", oSymbol.name);
		}

		if (oSymbol.experimental) {
			addData("experimental", oSymbol, "class", oSymbol.name);
		}

		if (oSymbol.since) {
			addData("since", oSymbol, "class", oSymbol.name);
		}

		// Methods
		oSymbol.methods && oSymbol.methods.forEach(oMethod => {
			if (oMethod.deprecated) {
				addData("deprecated", oMethod, "methods", oSymbol.name);
			}

			if (oMethod.experimental) {
				addData("experimental", oMethod, "methods", oSymbol.name);
			}

			if (oMethod.since) {
				addData("since", oMethod, "methods", oSymbol.name);
			}
		});

		// Events
		oSymbol.events && oSymbol.events.forEach(oEvent => {
			if (oEvent.deprecated) {
				addData("deprecated", oEvent, "events", oSymbol.name);
			}

			if (oEvent.experimental) {
				addData("experimental", oEvent, "events", oSymbol.name);
			}

			if (oEvent.since) {
				addData("since", oEvent, "events", oSymbol.name);
			}
		});

	}

	function deepMerge(arrayOfArrays) {
		return arrayOfArrays.reduce((array, items) => {
			array.push.apply(array, items);
			return array;
		}, []);
	}

	function expandHierarchyInfo(symbols) {
		let byName = new Map();
		symbols.forEach(symbol => {
			byName.set(symbol.name, symbol);
		});
		symbols.forEach(symbol => {
			let parent = symbol.extends && byName.get(symbol.extends);
			if (parent) {
				parent.extendedBy = parent.extendedBy ||  [];
				parent.extendedBy.push(symbol.name);
			}
			if (symbol.implements) {
				symbol.implements.forEach(intfName => {
					let intf = byName.get(intfName);
					if (intf) {
						intf.implementedBy = intf.implementedBy ||  [];
						intf.implementedBy.push(symbol.name);
					}
				});
			}
		});
		return symbols;
	}

	function createOverallIndex() {
		let version = "0.0.0";

		var p = readJSONFile(versionInfoFile)
			.then(versionInfo => {
				version = versionInfo.version;
				return Promise.all(
					versionInfo.libraries.map(
						lib => createSymbolSummaryForLib(lib.name).catch(err => {
							// ignore 'file not found' errors as some libs don't have an api.json (themes, server libs)
							if (err.code === 'ENOENT') {
								return [];
							}
							throw err;
						})
					)
				);
			})
			.then(deepMerge)
			.then(expandHierarchyInfo)
			.then(symbols => {
				let result = {
					"$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
					version: version,
					library: "*",
					symbols: symbols
				};
				return writeJSON(targetFile, result);
			})
			.then(() => Promise.all([
				// write deprecated, experimental and since collections in the respective index files
				writeJSON(targetFileDeprecated, oListCollection.deprecated),
				writeJSON(targetFileExperimental, oListCollection.experimental),
				writeJSON(targetFileSince, oListCollection.since)
			]))
			.catch(err => {
				console.error("**** failed to create API index for libraries:", err)
				throw err;
			});

		return p;
	}

	return createOverallIndex();

}

module.exports = process;
