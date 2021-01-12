/*
 * Node script to create cross-library API index files for use in the UI5 SDKs.
 *
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

"use strict";
const path = require("path");
const log = (function() {
	try {
		return require("@ui5/logger").getLogger("builder:processors:jsdoc:create-api-index");
	} catch (error) {
		/* eslint-disable no-console */
		return {
			info: function info(...msg) {
				console.log("[INFO]", ...msg);
			},
			error: function error(...msg) {
				console.error(...msg);
			}
		};
		/* eslint-enable no-console */
	}
}());

function createIndexFiles(versionInfoFile, unpackedTestresourcesRoot, targetFile, targetFileDeprecated, targetFileExperimental, targetFileSince, options) {
	const fs = options && options.fs || require("fs");
	const returnOutputFiles = options && !!options.returnOutputFiles;

	log.info("creating API index files");
	log.info("  sap-ui-version.json: " + versionInfoFile);
	log.info("  unpacked test-resources: " + unpackedTestresourcesRoot);
	log.info("  target file: " + targetFile);
	log.info("  target file deprecated: " + targetFileDeprecated);
	log.info("  target file experimental: " + targetFileExperimental);
	log.info("  target file since: " + targetFileSince);
	if (options && options.fs) {
		log.info("Using custom fs");
	}
	if (returnOutputFiles) {
		log.info("Returning output files instead of writing to fs.")
	}
	log.info("");

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
		since: {}
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
				let oReturn = {
					name: symbol.name,
					kind: symbol.kind,
					visibility: symbol.visibility,
					extends: symbol.extends,
					implements: symbol.implements,
					lib: lib
				};
				// We add deprecated member only when the control is deprecated to keep file size at check
				if (symbol.deprecated) {
					oReturn.deprecated = true;
				}
				collectLists(symbol);
				return oReturn;
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

			if (sSince && sSince !== "undefined" /* Sometimes sSince comes as string "undefined" */) {
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
			} else if (oDataType !== "since" /* noVersion does not make sense for since and will fail */) {
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

		if (oSymbol.since && oSymbol.since !== "undefined" /* Sometimes sSince comes as string "undefined" */) {
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

	function convertListToTree(symbols) {
		let aTree = [];

		// Filter out excluded libraries
		symbols = symbols.filter(({lib}) => ["sap.ui.documentation"].indexOf(lib) === -1);

		// Create treeName and displayName
		symbols.forEach(oSymbol => {
			oSymbol.treeName = oSymbol.name.replace(/^module:/, "").replace(/\//g, ".");
			oSymbol.displayName = oSymbol.treeName.split(".").pop();
		});

		// Create missing - virtual namespaces
		symbols.forEach(oSymbol => {
			oSymbol.treeName.split(".").forEach((sPart, i, a) => {
				let sName = a.slice(0, (i + 1)).join(".");

				if (!symbols.find(o => o.treeName === sName)) {
					symbols.push({
						name: sName,
						treeName: sName,
						displayName: sPart,
						lib: oSymbol.lib,
						kind: "namespace",
						visibility: "public" // Virtual namespace are always public
					});
				}
			});
		});

		// Discover parents
		symbols.forEach(oSymbol => {
			let aParent = oSymbol.treeName.split("."),
				sParent;

			// Extract parent name
			aParent.pop();
			sParent = aParent.join(".");

			// Mark parent
			if (symbols.find(({treeName}) => treeName === sParent)) {
				oSymbol.parent = sParent;
			}
		});

		// Sort the list before building the tree
		symbols.sort((a, b) => {
			let sA = a.treeName.toUpperCase(),
				sB = b.treeName.toUpperCase();

			if (sA < sB) return -1;
			if (sA > sB) return 1;
			return 0;
		});

		// Build tree
		symbols.forEach(oSymbol => {
			if (oSymbol.parent) {
				let oParent = symbols.find(({treeName}) => treeName === oSymbol.parent);

				if (!oParent.nodes) oParent.nodes = [];
				oParent.nodes.push(oSymbol);
			} else {
				aTree.push(oSymbol);
			}
		});

		// Custom sort first level tree items - "sap" namespace should be on top
		aTree.sort((a, b) => {
			let sA = a.displayName.toUpperCase(),
				sB = b.displayName.toUpperCase();

			if (sA === "SAP") return -1;
			if (sB === "SAP") return 1;
			if (sA < sB) return -1;
			if (sA > sB) return 1;

			return 0;
		});

		// walk the tree *from bottom to top*
		// in order to detect all parent nodes
		// that should be marked as content-deprecated
		// because their children are explicitly deprecated
		toChildrenFirstArray(aTree).forEach(markDeprecatedNodes);

		// Clean tree - keep file size down
		function cleanTree (oSymbol) {
			delete oSymbol.treeName;
			delete oSymbol.parent;
			if (oSymbol.nodes) {
				oSymbol.nodes.forEach(o => cleanTree(o));
			}
		}
		aTree.forEach(o => cleanTree(o));

		return aTree;
	}

	/**
	 * Creates an array of all tree nodes,
	 * where the child nodes precede the parent nodes
	 * @param aTree
	 * @returns {Array}
	 */
	function toChildrenFirstArray(aTree) {
		var aChildrenFirst = [];
		function addToLeafsFirst(node) {
			if (node.nodes) {
				node.nodes.forEach(function(child) {
					addToLeafsFirst(child);
				});
			}
			aChildrenFirst.push(node);
		}
		aTree.forEach(function(parent) {
			addToLeafsFirst(parent);
		});
		return aChildrenFirst;
	}

	/**
	 * Sets the <code>bAllContentDeprecated</code> flag of each symbol
	 *
	 * The <code>bAllContentDeprecated</code> flag differs from the already existing <code>deprecated</code> flag
	 * in the following respect:
	 *
	 *     1) if a node is deprecated => all its children should be marked as <code>bAllContentDeprecated</code>
	 *        (even if not explicitly deprecated in their JSDoc)
	 *     2) if all children of the node are deprecated => that node should also be marked as <code>bAllContentDeprecated</code>
	 *        (even if not explicitly deprecated in its JSDoc)
	 *     3) if a node is explicitly deprecated in its JSDoc => it should also be marked as <code>bAllContentDeprecated</code>
	 *        (for consistency)
	 *
	 * @param oSymbol
	 */
	function markDeprecatedNodes(oSymbol) {
		// 1. If the symbol is deprecated all content in it should be also deprecated
		if (oSymbol.deprecated) {
			// 2. If all content in the symbol is deprecated, flag should explicitly be passed to its child nodes.
			propagateFlags(oSymbol, { bAllContentDeprecated: true });
		} else {
			// 3. If all children are deprecated, then the parent is marked as content-deprecated
			oSymbol.bAllContentDeprecated = !!oSymbol.nodes && oSymbol.nodes.every(node => node.bAllContentDeprecated);
		}
	}

	/**
	 * Merges the set of flags from <code>oFlags</code> into the given <code>oSymbol</code>
	 * @param oSymbol
	 * @param oFlags
	 */
	function propagateFlags(oSymbol, oFlags) {
		Object.assign(oSymbol, oFlags);
		if (oSymbol.nodes) {
			oSymbol.nodes.forEach(node => {
				propagateFlags(node, oFlags);
			})
		}
	}

	function createOverallIndex() {
		let version = "0.0.0";
		const filesToReturn = {};

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
			.then(convertListToTree)
			.then(symbols => {
				let result = {
					"$schema-ref": "http://schemas.sap.com/sapui5/designtime/api-index.json/1.0",
					version: version,
					library: "*",
					symbols: symbols
				};
				if (returnOutputFiles) {
					filesToReturn[targetFile] = JSON.stringify(result);
				} else {
					return writeJSON(targetFile, result);
				}
			})
			.then(() => {
				/* Lists - modify and cleanup */
				let sortList = function (oList) {
					/* Sorting since records */
					let aKeys = Object.keys(oList),
						oSorted = {};

					aKeys.sort((a, b) => {
						let aA = a.split("."),
							aB = b.split(".");

						if (a === "noVersion") {
							return 1; /* No version always at end of list */
						}

						if (b === "noVersion") {
							return -1; /* No version always at end of list */
						}

						// Normalize old versions 1.4 to 1.04 for proper sorting
						a = [aA[0], ('0' + aA[1]).slice(-2)].join("");
						b = [aB[0], ('0' + aB[1]).slice(-2)].join("");

						// Sort descending
						return parseInt(b, 10) - parseInt(a, 10);
					});

					aKeys.forEach((sKey) => {
						oSorted[sKey] = oList[sKey];
					});

					return oSorted;
				};

				/* Since */
				oListCollection.since = sortList(oListCollection.since);

				/* Deprecated */
				oListCollection.deprecated = sortList(oListCollection.deprecated);
				if (!oListCollection.deprecated.noVersion.apis.length) {
					delete oListCollection.deprecated.noVersion;
				}

				/* Experimental */
				oListCollection.experimental = sortList(oListCollection.experimental);
				if (!oListCollection.experimental.noVersion.apis.length) {
					delete oListCollection.experimental.noVersion;
				}
			})
			.then(() => {
				if (returnOutputFiles) {
					filesToReturn[targetFileDeprecated] = JSON.stringify(oListCollection.deprecated);
					filesToReturn[targetFileExperimental] = JSON.stringify(oListCollection.experimental);
					filesToReturn[targetFileSince] = JSON.stringify(oListCollection.since);
					return filesToReturn;
				} else {
					return Promise.all([
						// write deprecated, experimental and since collections in the respective index files
						writeJSON(targetFileDeprecated, oListCollection.deprecated),
						writeJSON(targetFileExperimental, oListCollection.experimental),
						writeJSON(targetFileSince, oListCollection.since)
					]);
				}
			})
			.catch(err => {
				log.error("**** failed to create API index for libraries:", err)
				throw err;
			});

		return p;
	}

	return createOverallIndex();

}

module.exports = createIndexFiles;
