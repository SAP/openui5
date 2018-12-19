/*
 * Node script to preprocess api.json files for use in the UI5 SDKs.
 *
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

"use strict";
const fs = require("fs");
const cheerio = require("cheerio");
const path = require('path');

/*
 * Transforms the api.json as created by the JSDoc build into a pre-processed api.json file suitable for the SDK.
 * 
 * The pre-processing includes formatting of type references, rewriting of links and other time consuming calculations. 
 * 
 * @param {string} sInputFile Path of the original api.json file that should be transformed
 * @param {string} sOutputFile Path that the transformed api.json file should should be written to
 * @param {string} sLibraryFile Path to the .library file of the library, used to extract further documentation information
 * @param {string|string[]} vDependencyAPIFiles Path of folder that contains api.json files of predecessor libs or 
 *                 an array of paths of those files
 * @returns {Promise} A Promise that resolves after the transformation has been completed
 */
function transformer(sInputFile, sOutputFile, sLibraryFile, vDependencyAPIFiles) {

	console.log("[INFO] Transform API index files for sap.ui.documentation");
	console.log("[INFO]   original file: " + sInputFile);
	console.log("[INFO]   output file: " + sOutputFile);
	console.log("[INFO]   library file: " + sLibraryFile);
	console.log("[INFO]   dependency dir: " + vDependencyAPIFiles);
	console.log("[INFO]");

	/**
	 * Transforms api.json file
	 * @param {object} oChainObject chain object
	 */
	let transformApiJson = function (oChainObject) {
		function isBuiltInType(type) {
			return formatters._baseTypes.indexOf(type) >= 0;
		}

		/**
		 * Heuristically determining if there is a possibility the given input string
		 * to be a UI5 symbol
		 * @param {string} sName
		 * @returns {boolean}
		 */
		function possibleUI5Symbol(sName) {
			return /^[a-zA-Z][a-zA-Z.]*[a-zA-Z]$/.test(sName);
		}

		// Function is a copy from: LibraryInfo.js => LibraryInfo.prototype._getActualComponent => "match" inline method
		function matchComponent(sModuleName, sPattern) {
			sModuleName = sModuleName.toLowerCase();
			sPattern = sPattern.toLowerCase();
			return (
				sModuleName === sPattern
				|| sPattern.match(/\*$/) && sModuleName.indexOf(sPattern.slice(0,-1)) === 0 // simple prefix match
				|| sPattern.match(/\.\*$/) && sModuleName === sPattern.slice(0,-2) // directory pattern also matches directory itself
			);
		}

		// Transform to object
		let oData = oChainObject.fileData;

		// Attach default component for the library if available
		if (oChainObject.defaultComponent) {
			oData.defaultComponent = oChainObject.defaultComponent;
		}

		// Populate methods.aTreeContent for later use for symbol children if applicable
		// NOTE: This will inject missing root sub_namespace entries in oData.symbols array!!!
		methods._parseLibraryElements(oData.symbols);

		formatters._oOwnLibrary = oData;

		// Apply formatter's and modify data as needed
		oData.symbols.forEach((oSymbol) => {

			// when the module name starts with the library name, then we apply the default component
			if (oSymbol.name.indexOf(oData.library) === 0) {
				oSymbol.component = oChainObject.defaultComponent;
			}

			// Attach symbol specific component if available (special cases)
			// Note: Last hit wins as there may be a more specific component pattern
			if (oChainObject.customSymbolComponents) {
				Object.keys(oChainObject.customSymbolComponents).forEach(sComponent => {
					if (matchComponent(oSymbol.name, sComponent)) {
						oSymbol.component = oChainObject.customSymbolComponents[sComponent];
					}
				});
			}

			// Attach symbol sample flag if available
			if (oChainObject.entitiesWithSamples) {
				oSymbol.hasSample = oChainObject.entitiesWithSamples.indexOf(oSymbol.name) >= 0;
			}

			// Apply settings to formatter object - needed until formatter's are rewritten
			formatters._sTopicId = oSymbol.name;
			formatters._oTopicData = oSymbol;

			// Format Page Title
			oSymbol.title = (oSymbol.abstract ? "abstract " : "") + oSymbol.kind + " " + oSymbol.name;
			oSymbol.subTitle = formatters.formatSubtitle(oSymbol.deprecated);

			// Symbol children
			let aControlChildren = methods._getControlChildren(oSymbol.name);
			if (aControlChildren) {
				oSymbol.nodes = aControlChildren;
				methods._addChildrenDescription(oData.symbols, oSymbol.nodes);
			}

			// Constructor
			if (oSymbol.constructor) {
				let oConstructor = oSymbol.constructor;

				// Description
				if (oConstructor.description) {
					oConstructor.description = formatters.formatDescription(oConstructor.description);
				}

				// References
				methods.modifyReferences(oSymbol);

				// Examples
				if (oConstructor.examples) {
					oConstructor.examples.forEach((oExample) => {
						oExample.data = formatters.formatExample(oExample.caption, oExample.text);

						// Keep file size in check
						if (oExample.caption) {
							delete oExample.caption;
						}
						if (oExample.text) {
							delete oExample.text;
						}
					});
				}

				// Code Example string
				oConstructor.codeExample = formatters.formatConstructor(oSymbol.name, oConstructor.parameters);

				// Parameters
				if (oConstructor.parameters) {
					oConstructor.parameters = methods.buildConstructorParameters(oConstructor.parameters);

					let aParameters = oConstructor.parameters;
					aParameters.forEach(oParameter => {

						// Types
						oParameter.types = [];
						if (oParameter.type) {
							let aTypes = oParameter.type.split("|");

							for (let i = 0; i < aTypes.length; i++) {
								oParameter.types.push({
									name: aTypes[i],
									linkEnabled: !isBuiltInType(aTypes[i])
								});
							}

							// Keep file size in check
							delete oParameter.type;
						}

						// Default value
						oParameter.defaultValue = formatters.formatDefaultValue(oParameter.defaultValue);

						// Description
						if (oParameter.description) {
							oParameter.description = formatters.formatDescription(oParameter.description);
						}

					})
				}

				// Throws
				if (oConstructor.throws) {
					oConstructor.throws.forEach(oThrows => {

						// Description
						if (oThrows.description) {
							oThrows.description = formatters.formatDescription(oThrows.description);
						}

						// Exception link enabled
						if (oThrows.type) {
							oThrows.linkEnabled = formatters.formatExceptionLink(oThrows.type);
						}

					});
				}
			}

			// Description
			if (oSymbol.description) {
				oSymbol.description = formatters.formatOverviewDescription(oSymbol.description, oSymbol.constructor.references);
			}

			// Deprecated
			if (oSymbol.deprecated) {
				oSymbol.deprecatedText = formatters.formatDeprecated(oSymbol.deprecated.since, oSymbol.deprecated.text);
				// Keep file size in check
				delete oSymbol.deprecated;
			}

			// Properties
			if (oSymbol.properties) {
				oSymbol.properties.forEach((oProperty) => {

					// Name
					oProperty.name = formatters.formatEntityName(oProperty.name, oSymbol.name, oProperty.static);

					// Description
					if (oProperty.deprecated) {
						oProperty.description = formatters.formatDescription(oProperty.description,
							oProperty.deprecated.text, oProperty.deprecated.since);
					} else {
						oProperty.description = formatters.formatDescription(oProperty.description);
					}

					// Link Enabled
					if (oSymbol.kind !== "enum" && !isBuiltInType(oProperty.type) && possibleUI5Symbol(oProperty.type)) {
						oProperty.linkEnabled = true;
						oProperty.href = "#/api/" + oProperty.type.replace("[]", "");
					}

					// Keep file size in check
					if (oProperty.static) {
						delete oProperty.static;
					}

					if (oSymbol.kind === "enum" || oProperty.type === "undefined") {
					    delete oProperty.type;
					}
				
				});
			}

			// UI5 Metadata
			if (oSymbol["ui5-metadata"]) {
				let oMeta = oSymbol["ui5-metadata"];

				// Properties
				if (oMeta.properties) {
					// Sort
					oMeta.properties.sort(function (a, b) {
						if (a.name < b.name) {
							return -1;
						} else if (a.name > b.name) {
							return 1;
						} else {
							return 0;
						}
					});

					// Pre-process
					oMeta.properties.forEach((oProperty) => {
						// Name
						oProperty.name = formatters.formatEntityName(oProperty.name, oSymbol.name, oProperty.static);

						// Description
						oProperty.description = formatters.formatDescriptionSince(oProperty.description, oProperty.since);

						// Link Enabled
						if (!isBuiltInType(oProperty.type)) {
							oProperty.linkEnabled = true;
						}

						// Default value
						oProperty.defaultValue = formatters.formatDefaultValue(oProperty.defaultValue);

						// Deprecated
						if (oProperty.deprecated) {
							oProperty.deprecatedText = formatters.formatDeprecated(oProperty.deprecated.since,
								oProperty.deprecated.text);

							// Keep file size in check
							delete oProperty.deprecated;
						}
					});
				}

				// Aggregations
				if (oMeta.aggregations) {
					// Sort
					oMeta.aggregations.sort(function (a, b) {
						if (a.name < b.name) {
							return -1;
						} else if (a.name > b.name) {
							return 1;
						} else {
							return 0;
						}
					});

					// Pre-process
					oMeta.aggregations.forEach((oAggregation) => {
						// Link Enabled
						if (!isBuiltInType(oAggregation.type)) {
							oAggregation.linkEnabled = true;
						}

						// Description
						if (oAggregation.deprecated) {
							oAggregation.description = formatters.formatDescription(oAggregation.description,
								oAggregation.deprecated.text, oAggregation.deprecated.since);
						} else {
							oAggregation.description = formatters.formatDescription(oAggregation.description);
						}

						// Link enabled
						oAggregation.linkEnabled = !isBuiltInType(oAggregation.type);
					});
				}

				// Associations

				if (oMeta.associations) {
					// Sort
					oMeta.associations.sort(function (a, b) {
						if (a.name < b.name) {
							return -1;
						} else if (a.name > b.name) {
							return 1;
						} else {
							return 0;
						}
					});

					// Pre-process
					oMeta.associations.forEach((oAssociation) => {
						// Link Enabled
						if (!isBuiltInType(oAssociation.type)) {
							oAssociation.linkEnabled = true;
						}

						// Description
						if (oAssociation.deprecated) {
							oAssociation.description = formatters.formatDescription(oAssociation.description,
								oAssociation.deprecated.text, oAssociation.deprecated.since);
						} else {
							oAssociation.description = formatters.formatDescription(oAssociation.description);
						}
					});
				}

				// Events
				if (oMeta.events) {
					// We don't need event's data from the UI5-metadata for now. Keep file size in check
					delete oMeta.events;
				}

				// Special Settings
				if (oMeta.specialSettings) {
					oMeta.specialSettings.forEach(oSetting => {

						// Link Enabled
						if (!isBuiltInType(oSetting.type)) {
							oSetting.linkEnabled = true;
						}

						// Description
						if (oSetting.deprecated) {
							oSetting.description = formatters.formatDescription(oSetting.description,
								oSetting.deprecated.text, oSetting.deprecated.since);
						} else {
							oSetting.description = formatters.formatDescription(oSetting.description);
						}

					});
				}

				// Annotations
				if (oMeta.annotations) {
					oMeta.annotations.forEach(oAnnotation => {

						// Description
						oAnnotation.description = formatters.formatAnnotationDescription(oAnnotation.description,
							oAnnotation.since);

						// Namespace
						oAnnotation.namespaceText = oAnnotation.namespace;
						oAnnotation.namespace = formatters.formatAnnotationNamespace(oAnnotation.namespace);

						// Target
						oAnnotation.target = formatters.formatAnnotationTarget(oAnnotation.target);

						// Applies to
						oAnnotation.appliesTo = formatters.formatAnnotationTarget(oAnnotation.appliesTo);

					});
				}

			}

			if (oSymbol.events) {

				// Pre-process events
				methods.buildEventsModel(oSymbol.events);

				oSymbol.events.forEach(oEvent => {

					// Description
					if (oEvent.description) {
						oEvent.description = formatters.formatDescriptionSince(oEvent.description, oEvent.since);
					}

					// Deprecated
					if (oEvent.deprecated) {
						oEvent.deprecatedText = formatters.formatEventDeprecated(oEvent.deprecated.since,
							oEvent.deprecated.text);
					}

					// Parameters
					if (oEvent.parameters && Array.isArray(oEvent.parameters)) {
						oEvent.parameters.forEach(oParameter => {

							// Link Enabled
							if (!isBuiltInType(oParameter.type)) {
								oParameter.linkEnabled = true;
							}

							// Description
							if (oParameter.deprecated) {
								oParameter.description = formatters.formatDescription(oParameter.description,
									oParameter.deprecated.text, oParameter.deprecated.since);
							} else {
								oParameter.description = formatters.formatDescription(oParameter.description);
							}

						});
					}

				});

			}

			// Methods
			if (oSymbol.methods) {

				// Pre-process methods
				methods.buildMethodsModel(oSymbol.methods);

				oSymbol.methods.forEach(oMethod => {

					// Name and link
					if (oMethod.name) {
						oMethod.name = formatters.formatEntityName(oMethod.name, oSymbol.name, oMethod.static);

						// Link
						oMethod.href = "#/api/" + encodeURIComponent(oSymbol.name) +
							"/methods/" + encodeURIComponent(oMethod.name);
					}

					// Description
					if (oMethod.description) {
						oMethod.description = formatters.formatDescription(oMethod.description);
					}

					// Examples
					oMethod.examples && oMethod.examples.forEach(oExample => {
						oExample = formatters.formatExample(oExample.caption, oExample.text);
					});

					// Deprecated
					if (oMethod.deprecated) {
						oMethod.deprecatedText = formatters.formatEventDeprecated(oMethod.deprecated.since,
							oMethod.deprecated.text);
					}

					// Code example
					oMethod.code = formatters.formatMethodCode(oMethod.name, oMethod.parameters, oMethod.returnValue);

					// Parameters
					if (oMethod.parameters) {
						oMethod.parameters.forEach(oParameter => {

							// Types
							if (oParameter.types) {
								oParameter.types.forEach(oType => {

									// Link Enabled
									if (!isBuiltInType(oType.value) && possibleUI5Symbol(oType.value)) {
										oType.linkEnabled = true;
										oType.href = "#/api/" + oType.value.replace("[]", "");
									}

								});
							}

							// Default value
							oParameter.defaultValue = formatters.formatDefaultValue(oParameter.defaultValue);

							// Description
							if (oParameter.deprecated) {
								oParameter.description = formatters.formatDescription(oParameter.description,
									oParameter.deprecated.text, oParameter.deprecated.since);
							} else {
								oParameter.description = formatters.formatDescription(oParameter.description);
							}

						});
					}

					// Return value
					if (oMethod.returnValue) {

						// Description
						oMethod.returnValue.description = formatters.formatDescription(oMethod.returnValue.description);

						// Types
						if (oMethod.returnValue.types) {
							oMethod.returnValue.types.forEach(oType => {

								// Link Enabled
								if (!isBuiltInType(oType.value)) {
									oType.href = "#/api/" + encodeURIComponent(oType.value.replace("[]", ""));
									oType.linkEnabled = true;
								}

							});
						}

					}

					// Throws
					if (oMethod.throws) {
						oMethod.throws.forEach(oThrows => {

							// Description
							if (oThrows.description) {
								oThrows.description = formatters.formatDescription(oThrows.description);
							}

							// Exception link enabled
							if (oThrows.type) {
								oThrows.linkEnabled = formatters.formatExceptionLink(oThrows.type);
							}

						});
					}

					// Examples
					if (oMethod.examples) {
						oMethod.examples.forEach((oExample) => {
							oExample.data = formatters.formatExample(oExample.caption, oExample.text);

							// Keep file size in check
							if (oExample.caption) {
								delete oExample.caption;
							}
							if (oExample.text) {
								delete oExample.text;
							}
						});

					}


				});
			}

		});

		oChainObject.parsedData = oData;

		return oChainObject;
	};

	function getDependencyLibraryFilesList(oChainObject) {
		// if vDependencyAPIFiles is an array, it contains the file paths of api.json files
		if ( Array.isArray(vDependencyAPIFiles) ) {
			return oChainObject;
		}
		
		// otherwise, it names a directory that has to be scanned for the files
		return new Promise(oResolve => {
			fs.readdir(vDependencyAPIFiles, function (oError, aItems) {
				if (!oError && aItems && aItems.length) {
					let aFiles = [];
					aItems.forEach(sItem => {
						aFiles.push(path.join(vDependencyAPIFiles, sItem));
					})
					oChainObject.aDependentLibraryFiles = aFiles;
				}
				oResolve(oChainObject); // We don't fail if no dependency library files are available
			});
		});
	}

	function loadDependencyLibraryFiles (oChainObject) {
		if (!oChainObject.aDependentLibraryFiles) {
			return oChainObject;
		}
		let aPromises = [];
		oChainObject.aDependentLibraryFiles.forEach(sFile => {
			aPromises.push(new Promise(oResolve => {
				fs.readFile(sFile, 'utf8', (oError, oData) => {
					oResolve(oError ? false : oData);
				});
			}));
		});
		return Promise.all(aPromises).then(aValues => {
			let oDependentAPIs = {};

			aValues.forEach(sData => {
				let oData = JSON.parse(sData);

				// OpenUI5 build specific - own library can be listed as dependency library also.
				// In this case we don't add it to the dependency list to skip double iteration.
				if (oChainObject.fileData.library !== oData.library) {
					oDependentAPIs[oData.library] = oData.symbols;
				}
			});

			oChainObject.oDependentAPIs = oDependentAPIs;
			return oChainObject;
		})
	}

	/**
	 * Create api.json from parsed data
	 * @param oChainObject chain object
	 */
	function createApiRefApiJson(oChainObject) {
		let sOutputDir = path.dirname(oChainObject.outputFile);

		// Create dir if it does not exist
		if (!fs.existsSync(sOutputDir)) {
			fs.mkdirSync(sOutputDir);
		}

		// Write result to file
		fs.writeFileSync(oChainObject.outputFile, JSON.stringify(oChainObject.parsedData) /* Transform back to string */, 'utf8');
	}

	/**
	 * Load .library file
	 * @param oChainObject chain return object
	 * @returns {Promise} library file promise
	 */
	function getLibraryPromise(oChainObject) {
		return new Promise(function(oResolve) {
			fs.readFile(oChainObject.libraryFile, 'utf8', (oError, oData) => {
				oChainObject.libraryFileData = oData;
				oResolve(oChainObject);
			});
		});
	}

	/**
	 * Extracts components list and docuindex.json relative path from .library file data
	 * @param {object} oChainObject chain object
	 * @returns {object} chain object
	 */
	function extractComponentAndDocuindexUrl(oChainObject) {
		oChainObject.modules = [];

		if (oChainObject.libraryFileData) {
			let $ = cheerio.load(oChainObject.libraryFileData, {
				ignoreWhitespace: true,
				xmlMode: true,
				lowerCaseTags: false
			});

			// Extract documentation URL
			oChainObject.docuPath = $("appData documentation").attr("indexUrl");

			// Extract components
			$("ownership > component").each((i, oComponent) => {

				if (oComponent.children) {
					if (oComponent.children.length === 1) {
						oChainObject.defaultComponent = $(oComponent).text();
					} else {
						let sCurrentComponentName = $(oComponent).find("name").text();
						let aCurrentModules = [];
						$(oComponent).find("module").each((a, oC) => {
							aCurrentModules.push($(oC).text().replace(/\//g, "."));
						});

						oChainObject.modules.push({
							componentName: sCurrentComponentName,
							modules: aCurrentModules
						});
					}
				}

			});

		}

		return oChainObject;
	}

	/**
	 * Adds to the passed object custom symbol component map generated from the extracted components list
	 * to be easily searchable later
	 * @param {object} oChainObject chain object
	 * @returns {object} chain object
	 */
	function flattenComponents(oChainObject) {
		if (oChainObject.modules && oChainObject.modules.length > 0) {
			oChainObject.customSymbolComponents = {};
			oChainObject.modules.forEach(oComponent => {
				let sCurrentComponent = oComponent.componentName;
				oComponent.modules.forEach(sModule => {
					oChainObject.customSymbolComponents[sModule] = sCurrentComponent;
				});
			});
		}

		return oChainObject;
	}

	/**
	 * Adds to the passed object array with entities which have explored samples
	 * @param {object} oChainObject chain object
	 * @returns {object} chain object
	 */
	function extractSamplesFromDocuIndex(oChainObject) {
		// If we have not extracted docuPath we return early
		if (!oChainObject.docuPath) {
			return oChainObject;
		}
		return new Promise(function(oResolve) {
			// Join .library path with relative docuindex.json path
			let sPath = path.join(path.dirname(oChainObject.libraryFile), oChainObject.docuPath);
			// Normalize path to resolve relative path
			sPath = path.normalize(sPath);

			fs.readFile(sPath, 'utf8', (oError, oFileData) => {
				if (!oError) {
					oFileData = JSON.parse(oFileData);
					if (oFileData.explored && oFileData.explored.entities && oFileData.explored.entities.length > 0) {
						oChainObject.entitiesWithSamples = [];
						oFileData.explored.entities.forEach(oEntity => {
							oChainObject.entitiesWithSamples.push(oEntity.id);
						});
					}
				}
				// We aways resolve as this data is not mandatory
				oResolve(oChainObject);
			});

		});
	}

	/**
	 * Load api.json file
	 * @param {object} oChainObject chain object
	 * @returns {object} chain object
	 */
	function getAPIJSONPromise(oChainObject) {
		return new Promise(function(oResolve, oReject) {
			fs.readFile(sInputFile, 'utf8', (oError, sFileData) => {
				if (oError) {
					oReject(oError);
				} else {
					oChainObject.fileData = JSON.parse(sFileData);
					oResolve(oChainObject);
				}
			});
		});
	}

	/*
	 * =====================================================================================================================
	 * IMPORTANT NOTE: Formatter code is a copy from APIDetail.controller.js with a very little modification and mocking and
	 * code can be significantly improved
	 * =====================================================================================================================
	 */
	let formatters = {

		_sTopicId: "",
		_oTopicData: {},
		_baseTypes: [
			"sap.ui.core.any",
			"sap.ui.core.object",
			"sap.ui.core.function",
			"sap.ui.core.number", // TODO discuss with Thomas, type does not exist
			"sap.ui.core.float",
			"sap.ui.core.int",
			"sap.ui.core.boolean",
			"sap.ui.core.string",
			"sap.ui.core.void",
			"null",
			"any",
			"any[]",
			"Error",
			"Error[]",
			"array",
			"element",
			"Element",
			"DomRef",
			"object",
			"Object",
			"object[]",
			"object|object[]",
			"[object Object][]",
			"Array.<[object Object]>",
			"Object.<string,string>",
			"function",
			"float",
			"int",
			"boolean",
			"string",
			"string[]",
			"number",
			"map",
			"promise",
			"Promise",
			"document",
			"Document",
			"Touch",
			"TouchList",
			"undefined"
		],
		ANNOTATIONS_LINK: 'http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html',
		ANNOTATIONS_NAMESPACE_LINK: 'http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/vocabularies/',

		/**
		 * Adds "deprecated" information if such exists to the header area
		 * @param deprecated - object containing information about deprecation
		 * @returns {string} - the deprecated text to display
		 */
		formatSubtitle: function (deprecated) {
			var result = "";

			if (deprecated) {
				result += "Deprecated in version: " + deprecated.since;
			}

			return result;
		},

		/**
		 * Formats the target and applies to texts of annotations
		 * @param target - the array of texts to be formatted
		 * @returns string - the formatted text
		 */
		formatAnnotationTarget: function (target) {
			var result = "";

			if (target) {
				target.forEach(function (element) {
					result += element + '<br>';
				});
			}

			result = this._preProcessLinksInTextBlock(result);
			return result;
		},

		/**
		 * Formats the namespace of annotations
		 * @param namespace - the namespace to be formatted
		 * @returns string - the formatted text
		 */
		formatAnnotationNamespace: function (namespace) {
			var result,
				aNamespaceParts = namespace.split(".");

			if (aNamespaceParts[0] === "Org" && aNamespaceParts[1] === "OData") {
				result = '<a href="' + this.ANNOTATIONS_NAMESPACE_LINK + namespace + '.xml">' + namespace + '</a>';
			} else {
				result = namespace;
			}

			result = this._preProcessLinksInTextBlock(result);
			return result;
		},

		/**
		 * Formats the description of annotations
		 * @param description - the description of the annotation
		 * @param since - the since version information of the annotation
		 * @returns string - the formatted description
		 */
		formatAnnotationDescription: function (description, since) {
			var result = description || "";

			result += '<br>For more information, see ' + this.handleExternalUrl(this.ANNOTATIONS_LINK, "OData v4 Annotations");

			if (since) {
				result += '<br><br><i>Since: ' + since + '.</i>';
			}

			result = this._preProcessLinksInTextBlock(result);
			return result;
		},

		formatExceptionLink: function (linkText) {
			linkText = linkText || '';
			return linkText.indexOf('sap.ui.') !== -1;
		},

		formatMethodCode: function (sName, aParams, aReturnValue) {
			var result = '<pre class="prettyprint">' + sName + '(';

			if (aParams && aParams.length > 0) {
				/* We consider only root level parameters so we get rid of all that are not on the root level */
				aParams = aParams.filter(oElem => {
					return oElem.depth === undefined;
				});
				aParams.forEach(function (element, index, array) {
					result += element.name;

					if (element.optional) {
						result += '?';
					}

					if (index < array.length - 1) {
						result += ', ';
					}
				});
			}

			result += ') : ';

			if (aReturnValue) {
				result += aReturnValue.type;
			} else {
				result += 'void';
			}

			result += "</pre>";

			return result;
		},

		/**
		 * Formats method deprecation message and pre-process jsDoc link and code blocks
		 * @param {string} sSince since text
		 * @param {string} sDescription deprecation description text
		 * @returns {string} formatted deprecation message
		 */
		formatMethodDeprecated: function (sSince, sDescription) {
			return this.formatDeprecated(sSince, sDescription, "methods");
		},

		/**
		 * Formats event deprecation message and pre-process jsDoc link and code blocks
		 * @param {string} sSince since text
		 * @param {string} sDescription deprecation description text
		 * @returns {string} formatted deprecation message
		 */
		formatEventDeprecated: function (sSince, sDescription) {
			return this.formatDeprecated(sSince, sDescription, "events");
		},

		/**
		 * Formats the description of control properties
		 * @param description - the description of the property
		 * @param since - the since version information of the property
		 * @returns string - the formatted description
		 */
		formatDescriptionSince: function (description, since) {
			var result = description || "";

			if (since) {
				result += '<br><br><i>Since: ' + since + '.</i>';
			}

			result = this._preProcessLinksInTextBlock(result);
			return result;
		},

		/**
		 * Formats the default value of the property as a string.
		 * @param defaultValue - the default value of the property
		 * @returns string - The default value of the property formatted as a string.
		 */
		formatDefaultValue: function (defaultValue) {
			var sReturn;

			switch (defaultValue) {
				case null:
				case undefined:
					sReturn = '';
					break;
				case '':
					sReturn = 'empty string';
					break;
				default:
					sReturn = defaultValue;
			}

			return Array.isArray(sReturn) ? sReturn.join(', ') : sReturn;
		},

		/**
		 * Formats the constructor of the class
		 * @param name
		 * @param params
		 * @returns string - The code needed to create an object of that class
		 */
		formatConstructor: function (name, params) {
			var result = '<pre class="prettyprint">new ';

			if (name) {
				result += name + '(';
			}

			if (params) {
				params.forEach(function (element, index, array) {
					result += element.name;

					if (element.optional) {
						result += '?';
					}

					if (index < array.length - 1) {
						result += ', ';
					}
				});
			}

			if (name) {
				result += ')</pre>';
			}

			return result;
		},

		formatExample: function (sCaption, sText) {
			return this.formatDescription(
				["<span><strong>Example: </strong>",
					sCaption,
					"<pre class='sapUiSmallMarginTop'>",
					sText,
					"</pre></span>"].join("")
			);
		},

		/**
		 * Formats the name of a property or a method depending on if it's static or not
		 * @param sName {string} - Name
		 * @param sClassName {string} - Name of the class
		 * @param bStatic {boolean} - If it's static
		 * @returns {string} - Formatted name
		 */
		formatEntityName: function (sName, sClassName, bStatic) {
			return (bStatic === true) ? sClassName + "." + sName : sName;
		},

		JSDocUtil: function () {

			var rEscapeRegExp = /[[\]{}()*+?.\\^$|]/g;

			// Local mocked methods
			var escapeRegExp = function escapeRegExp(sString) {
				return sString.replace(rEscapeRegExp, "\\$&");
			};

			function defaultLinkFormatter(target, text) {
				return "<code>" + (text || target) + "</code>";
			}

			function format(src, options) {

				options = options || {};
				var beforeParagraph = options.beforeParagraph === undefined ? '<p>' : options.beforeParagraph;
				var afterParagraph = options.afterParagraph === undefined ? '</p>' : options.afterParagraph;
				var beforeFirstParagraph = options.beforeFirstParagraph === undefined ? beforeParagraph : options.beforeFirstParagraph;
				var afterLastParagraph = options.afterLastParagraph === undefined ? afterParagraph : options.afterLastParagraph;
				var linkFormatter = typeof options.linkFormatter === 'function' ? options.linkFormatter : defaultLinkFormatter;

				/*
				 * regexp to recognize important places in the text
				 *
				 * Capturing groups of the RegExp:
				 *   group 1: begin of a pre block
				 *   group 2: end of a pre block
				 *   group 3: begin of a header, implicitly ends a paragraph
				 *   group 4: end of a header, implicitly starts a new paragraph
				 *   group 5: target portion of an inline @link tag
				 *   group 6: (optional) text portion of an inline link tag
				 *   group 7: an empty line which implicitly starts a new paragraph
				 *
				 *      [-- <pre> block -] [---- some header ----] [---- an inline [@link ...} tag ----] [---------- an empty line ---------]  */
				var r = /(<pre>)|(<\/pre>)|(<h[\d+]>)|(<\/h[\d+]>)|\{@link\s+([^}\s]+)(?:\s+([^\}]*))?\}|((?:\r\n|\r|\n)[ \t]*(?:\r\n|\r|\n))/gi;
				var inpre = false;

				src = src || '';
				linkFormatter = linkFormatter || defaultLinkFormatter;

				src = beforeFirstParagraph + src.replace(r, function(match, pre, endpre, header, endheader, linkTarget, linkText, emptyline) {
					if ( pre ) {
						inpre = true;
					} else if ( endpre ) {
						inpre = false;
					} else if ( header ) {
						if ( !inpre ) {
							return afterParagraph + match;
						}
					} else if ( endheader ) {
						if ( !inpre ) {
							return match + beforeParagraph;
						}
					} else if ( emptyline ) {
						if ( !inpre ) {
							return afterParagraph + beforeParagraph;
						}
					} else if ( linkTarget ) {
						if ( !inpre ) {
							return linkFormatter(linkTarget, linkText);
						}
					}
					return match;
				}) + afterLastParagraph;

				// remove empty paragraphs
				if (beforeParagraph !== "" && afterParagraph !== "") {
					src = src.replace(new RegExp(escapeRegExp(beforeParagraph) + "\\s*" + escapeRegExp(afterParagraph), "g"), "");
				}

				return src;
			}

			return {
				formatTextBlock: format
			};

		},

		handleExternalUrl: function (sTarget, sText) {
			// Check if the external domain is SAP hosted
			let bSAPHosted = /^https?:\/\/(?:www.)?[\w.]*(?:sap|hana\.ondemand|sapfioritrial)\.com/.test(sTarget);

		return `<a target="_blank" href="${sTarget}">${sText}</a>
<img src="./resources/sap/ui/documentation/sdk/images/${bSAPHosted ? 'link-sap' : 'link-external'}.png" 
title="Information published on ${bSAPHosted ? '' : 'non '}SAP site" class="sapUISDKExternalLink"/>`;
		},

	/**
	 * Discover possible target type by looking at symbols from own and depending libraries
	 * @param {string} target
	 * @param {object} self
	 * @param {object} ownLibrary
	 * @param {object} dependencyLibs
	 * @param {boolean} module
	 * @returns {string}
	 */
	createLinkFromTargetType: function ({className, methodName, target, self, ownLibrary, dependencyLibs}) {
		let sResult;

		function searchInSymbol(oSymbol) {
			function findProperty(oEntity, sName, sTarget) {
				if (!oEntity || !oEntity.properties) {
					return;
				}
				return oEntity.properties.find(({name}) => name === sName || name === sTarget);
			}

			function findMethod(oEntity, sName, sTarget) {
				if (!oEntity || !oEntity.methods) {
					return;
				}
				return oEntity.methods.find(({name}) => name === sName || name === sTarget);
			}

			function findEvent(oEntity, sName) {
				if (!oEntity || !oEntity.events) {
					return;
				}
				return oEntity.events.find(({name}) => name === sName);
			}

			if (oSymbol.name === target) {
				sResult = this.createLink({
					name: oSymbol.name,
					text: oSymbol.name
				});
				return true;
			}
			if (oSymbol.name === className) {
				let oProperty = findProperty(oSymbol, methodName, target);
				if (oProperty) {
					sResult = this.createLink({
						name: oProperty.name,
						text: target
					});
					return true;
				}
				let oMethod = findMethod(oSymbol, methodName, target);
				if (oMethod) {
					sResult = this.createLink({
						name: oMethod.static ? target : oMethod.name,
						type: "methods",
						text: target,
						className: className
					});
					return true;
				}

				let oEvent = findEvent(oSymbol, methodName);
				if (oEvent) {
					sResult = this.createLink({
						name: oEvent.name,
						type: "events",
						text: target,
						className: className
					});
					return true;
				}
			}

			return false;
		}

		// Self link
		if (self.name === target) {
			return this.createLink({
				name: target
			});
		}

		// Own methods search
		if (self.name === className && self.methods) {
			let oResult = self.methods.find(({name}) => name === methodName);
			if (oResult) {
				return this.createLink({
					name: oResult.static ? [self.name, oResult.name].join(".") : oResult.name,
					type: "methods",
					className: className,
					text: target,
					local: true
				});
			}
		}

		// Local library symbols
		ownLibrary.symbols.find(oSymbol => {
			return searchInSymbol.call(this, oSymbol);
		});

		if (sResult) return sResult;

		// Dependent library symbols
		dependencyLibs && Object.keys(dependencyLibs).find(sLib => {
			if (sLib === target) {
				sResult = this.createLink({
					name: sLib,
					text: target
				});
				return true;
			}
			return dependencyLibs[sLib].find(oSymbol => {
				return searchInSymbol.call(this, oSymbol);
			});
		});

		return sResult;
	},

	/**
	 * Creates a html link
	 * @param {string} name
	 * @param {string} type
	 * @param {string} className
	 * @param {string=name} text by default if no text is provided the name will be used
	 * @param {boolean=false} local
	 * @param {string=""} hrefAppend
	 * @returns {string} link
	 */
	createLink: function ({name, type, className, text=name, local=false, hrefAppend=""}) {
		let sLink;

		// handling module's
		if (className !== undefined && (/^module:/.test(name) || /^module:/.test(className))) {
			name = name.replace(/^module:/, "");
		}

		name = encodeURIComponent(name);
		className = encodeURIComponent(className);

		// Build the link
 		sLink = type ? `${className}/${type}/${name}` : name;

		if (hrefAppend) {
			sLink += hrefAppend;
		}

		if (local) {
			return `<a target="_self" class="jsdoclink scrollTo${type === `events` ? `Event` : `Method`}" data-sap-ui-target="${name}" href="#/api/${sLink}">${text}</a>`;
		}

		return `<a target="_self" class="jsdoclink" href="#/api/${sLink}">${text}</a>`;
	},

		/**
		 * Pre-process links in text block
		 * @param {string} sText text block
	 * @param {boolean} bSkipParagraphs skip paragraphs
		 * @returns {string} processed text block
		 * @private
		 */
		_preProcessLinksInTextBlock: function (sText, bSkipParagraphs) {
		let oSelf = this._oTopicData,
			oOwnLibrary = this._oOwnLibrary,
			oDependencyLibs = oChainObject.oDependentAPIs,
				oOptions = {
				linkFormatter: function (sTarget, sText) {
					let aMatch,
						aTarget;

					// keep the full target in the fallback text
					sText = sText || sTarget;

						// If the link has a protocol, do not modify, but open in a new window
					if (/:\/\//.test(sTarget)) {
						return this.handleExternalUrl(sTarget, sText);
						}

					// topic:xxx Topic
					aMatch = sTarget.match(/^topic:(\w{32})$/);
					if (aMatch) {
						return '<a target="_self" href="#/topic/' + aMatch[1] + '">' + sText + '</a>';
					}

					// sap.x.Xxx.prototype.xxx - In case of prototype we have a link to method
					aMatch = sTarget.match(/([a-zA-Z0-9.$_]+?)\.prototype\.([a-zA-Z0-9.$_]+)$/);
						if (aMatch) {
						return this.createLink({
							name: aMatch[2],
							type: "methods",
							className: aMatch[1],
							text: sText
						});
					}

					// Heuristics: Extend is always a static method
					// sap.x.Xxx.extend
					// module:sap/x/Xxx.extend
					aMatch = sTarget.match(/^(module:)?([a-zA-Z0-9.$_\/]+?)\.extend$/);
					if (aMatch) {
						let [, sModule, sClass] = aMatch;
						return this.createLink({
							name: sTarget.replace(/^module:/, ""),
							type: "methods",
							className: (sModule ? sModule : "") + sClass,
							text: sText
						});
					}

					// Constructor links are handled in special manner by the SDK
					// sap.x.Xxx.constructor
					// sap.x.Xxx#constructor
					// module:sap/x/Xxx.constructor
					// #constructor
					aMatch = sTarget.match(/^(module:)?([a-zA-Z0-9.$_\/]+?)?[\.#]constructor$/i);
					if (aMatch) {
						let [, sModule, sClass] = aMatch,
							sName;

						if (sClass) {
							sName = (sModule ? sModule : "") + sClass;
						} else {
							sName = oSelf.name
										}

						return this.createLink({
							name: sName,
							hrefAppend: "/constructor",
							text: sText
						});
										}

					// #.setText - local static method
					// #setText - local instance method
					// #.setText.from - local nested method
					aMatch = sTarget.match(/^#(\.)?([a-zA-Z0-9.$_]+)$/);
					if (aMatch) {
						return this.createLink({
							name: aMatch[1] ? `${oSelf.name}.${aMatch[2]}` : aMatch[2],
							type: "methods",
							className: oSelf.name,
							local: true,
							text: sText
						});
					}

					// #event:press - local event
					aMatch = sTarget.match(/^#event:([a-zA-Z0-9$_]+)$/);
					if (aMatch) {
						return this.createLink({
							name: aMatch[1],
							type: "events",
							className: oSelf.name,
							local: true,
							text: sText
						});
					}

					// Event links
					// sap.m.Button#event:press
					// sap.m.Button.event:press
					// module:sap/m/Button.event:press
					// module:sap/m/Button#event:press
					aMatch = sTarget.match(/^(module:)?([a-zA-Z0-9.$_\/]+?)[.#]event:([a-zA-Z0-9$_]+)$/);
					if (aMatch) {
						let [, sModule, sClass, sEvent] = aMatch;
						return this.createLink({
							name: sEvent,
							type: "events",
							className: (sModule ? sModule : "") + sClass,
							text: sText
						});
					}

					// sap.m.Button#setText - instance method
					// module:sap/m/Button#setText
					aMatch = sTarget.match(/^(module:)?([a-zA-Z0-9.$_\/]+)#([a-zA-Z0-9.$_]+)$/);
					if (aMatch) {
						let [, sModule, sClass, sMethod] = aMatch;
						return this.createLink({
							name: sMethod,
							type: "methods",
							className: (sModule ? sModule : "") + sClass,
							text: sText
						});
					}

					// Unresolved type - try to discover target type
					// sap.x.Xxx.xxx
					// module:sap/x/Xxx.xxx
					if (/^(?:module:)?([a-zA-Z0-9.$_\/]+?)\.([a-zA-Z0-9$_]+)$/.test(sTarget)) {
						let [,sClass, sName] = sTarget.match(/^((?:module:)?[a-zA-Z0-9.$_\/]+?)\.([a-zA-Z0-9$_]+)$/),
							sResult = this.createLinkFromTargetType({
								className: sClass,
								methodName: sName,
								target: sTarget,
								self: oSelf,
								ownLibrary: oOwnLibrary,
								dependencyLibs: oDependencyLibs
							});
						if (sResult) {
							return sResult;
								}
					}

					// Possible nested functions discovery - currently we do this only for regular symbols
					aTarget = sTarget.split(".");
					if (aTarget.length >= 3) {
						let sResult = this.createLinkFromTargetType({
							methodName: aTarget.splice(-2).join("."),
							className: aTarget.join("."),
							target: sTarget,
							self: oSelf,
							ownLibrary: oOwnLibrary,
							dependencyLibs: oDependencyLibs
						});
						if (sResult) {
							return sResult;
						}
					}

					// Possible forward reference - we will treat them as symbol link
					return this.createLink({
						name: sTarget
					});

					}.bind(this)
				};

			if (bSkipParagraphs) {
				oOptions.beforeParagraph = "";
				oOptions.afterParagraph = "";
			}

			return this.JSDocUtil().formatTextBlock(sText, oOptions);
		},

		/**
		 * Formatter for Overview section
		 * @param {string} sDescription - Class about description
		 * @param {array} aReferences - References
		 * @returns {string} - formatted text block
		 */
		formatOverviewDescription: function (sDescription, aReferences) {
			var iLen,
				i;

			// format references
			if (aReferences && aReferences.length > 0) {
				sDescription += "<br><br><span>Documentation links:</span><ul>";

				iLen = aReferences.length;
				for (i = 0; i < iLen; i++) {
					// We treat references as links but as they may not be defined as such we enforce it if needed
					if (/{@link.*}/.test(aReferences[i])) {
						sDescription += "<li>" + aReferences[i] + "</li>";
					} else {
						sDescription += "<li>{@link " + aReferences[i] + "}</li>";
					}
				}

				sDescription += "</ul>";
			}

			// Calling formatDescription so it could handle further formatting
			return this.formatDescription(sDescription);
		},

		/**
		 * Formats the description of the property
		 * @param description - the description of the property
		 * @param deprecatedText - the text explaining this property is deprecated
		 * @param deprecatedSince - the version when this property was deprecated
		 * @returns string - the formatted description
		 */
		formatDescription: function (description, deprecatedText, deprecatedSince) {
			if (!description && !deprecatedText && !deprecatedSince) {
				return "";
			}

			var result = description || "";

			if (deprecatedSince || deprecatedText) {
				// Note: sapUiDocumentationDeprecated - transformed to sapUiDeprecated to keep json file size low
				result += "<span class=\"sapUiDeprecated\"><br>";

				result += this.formatDeprecated(deprecatedSince, deprecatedText);

				result += "</span>";
			}

			result = this._preProcessLinksInTextBlock(result);
			return result;
		},

		/**
		 * Formats the entity deprecation message and pre-process jsDoc link and code blocks
		 * @param {string} sSince since text
		 * @param {string} sDescription deprecation description text
		 * @param {string} sEntityType string representation of entity type
		 * @returns {string} formatted deprecation message
		 */
		formatDeprecated: function (sSince, sDescription, sEntityType) {
			var aResult;

			// Build deprecation message
			// Note: there may be no since or no description text available
			aResult = ["Deprecated"];
			if (sSince) {
				aResult.push(" as of version " + sSince);
			}
			if (sDescription) {
				// Evaluate code blocks - Handle <code>...</code> pattern
				sDescription = sDescription.replace(/<code>(\S+)<\/code>/gi, function (sMatch, sCodeEntity) {
						return ['<em>', sCodeEntity, '</em>'].join("");
					}
				);

				// Evaluate links in the deprecation description
				aResult.push(". " + this._preProcessLinksInTextBlock(sDescription, true));
			}

			return aResult.join("");
		},

		_formatChildDescription: function (description) {
			if (description) {
				return this._extractFirstSentence(description);
			}
		},

		/** Just the first sentence (up to a full stop). Should not break on dotted variable names. */
		_extractFirstSentence: function(desc) {
			if ( desc ) {
				desc = String(desc).replace(/\s+/g, ' ').
				replace(/^(<\/?p>|<br\/?>|<h\d>\w+<\/h\d>|\s)+/, '');

				var match = /([\w\W]+?\.)[^a-z0-9_$]/i.exec(desc);
				return match ? match[1] : desc;
			}
			return "";
		},

		_sliceSpecialTags: function (descriptionCopy, startSymbol, endSymbol) {
			var startIndex, endIndex;
			while (descriptionCopy.indexOf(startSymbol) !== -1 && descriptionCopy.indexOf(startSymbol) < descriptionCopy.indexOf(".")) {
				startIndex = descriptionCopy.indexOf(startSymbol);
				endIndex = descriptionCopy.indexOf(endSymbol);
				descriptionCopy = descriptionCopy.slice(0, startIndex) + descriptionCopy.slice(endIndex + endSymbol.length, descriptionCopy.length);
			}
			return descriptionCopy;
		}

	};

	/* Methods direct copy from API Detail */
	let methods = {

		/**
		 * Pre-process and modify references
		 * @param {object} oSymbol control data object which will be modified
		 * @private
		 */
		modifyReferences: function (oSymbol) {
			var bHeaderDocuLinkFound = false,
				bUXGuidelinesLinkFound = false,
				aReferences = [];

			const UX_GUIDELINES_BASE_URL = "https://experience.sap.com/fiori-design-web/";

			if (oSymbol.constructor.references && oSymbol.constructor.references.length > 0) {
				oSymbol.constructor.references.forEach(function (sReference) {
					var aParts;

					// Docu link - For the header we take into account only the first link that matches one of the patterns
					if (!bHeaderDocuLinkFound) {

						// Handled patterns:
						// * topic:59a0e11712e84a648bb990a1dba76bc7
						// * {@link topic:59a0e11712e84a648bb990a1dba76bc7}
						// * {@link topic:59a0e11712e84a648bb990a1dba76bc7 Link text}
						aParts = sReference.match(/^{@link\s+topic:(\w{32})(\s.+)?}$|^topic:(\w{32})$/);

						if (aParts) {
							if (aParts[3]) {
								// Link is of type topic:GUID
								oSymbol.docuLink = aParts[3];
								oSymbol.docuLinkText = oSymbol.basename;
							} else if (aParts[1]) {
								// Link of type {@link topic:GUID} or {@link topic:GUID Link text}
								oSymbol.docuLink = aParts[1];
								oSymbol.docuLinkText = aParts[2] ? aParts[2] : oSymbol.basename;
							}
							bHeaderDocuLinkFound = true;
							return;
						}
					}

					// Fiori link - Handled patterns:
					// * fiori:flexible-column-layout
					// * fiori:/flexible-column-layout/
					// * fiori:https://experience.sap.com/fiori-design-web/flexible-column-layout/
					// * {@link fiori:flexible-column-layout}
					// * {@link fiori:/flexible-column-layout/}
					// * {@link fiori:/flexible-column-layout/ Flexible Column Layout}
					// * {@link fiori:https://experience.sap.com/fiori-design-web/flexible-column-layout/}
					// * {@link fiori:https://experience.sap.com/fiori-design-web/flexible-column-layout/ Flexible Column Layout}
					aParts = sReference.match(/^(?:{@link\s)?fiori:(?:https:\/\/experience\.sap\.com\/fiori-design-web\/)?\/?(\S+\b)\/?\s?(.*[^\s}])?}?$/);

					if (aParts) {
						let [, sTarget, sTargetName] = aParts;

						if (!bUXGuidelinesLinkFound) {
							// Extract first found UX Guidelines link as primary
							oSymbol.uxGuidelinesLink = UX_GUIDELINES_BASE_URL + sTarget;
							oSymbol.uxGuidelinesLinkText = sTargetName ? sTargetName : oSymbol.basename;
								bUXGuidelinesLinkFound = true;
								return;
						} else {
							// BCP: 1870155880 - Every consecutive "fiori:" link should be handled as a normal link
							sReference = "{@link " + UX_GUIDELINES_BASE_URL + sTarget + (sTargetName ? " " + sTargetName : "") + "}";
						}
					}

					aReferences.push(sReference);
				});
				oSymbol.constructor.references = aReferences;
			} else {
				oSymbol.constructor.references = [];
			}
		},

		/**
		 * Adjusts methods info so that it can be easily displayed in a table
		 * @param aMethods - the methods array initially coming from the server
		 */
		buildMethodsModel: function (aMethods) {
			var fnCreateTypesArr = function (sTypes) {
				return sTypes.split("|").map(function (sType) {
					return {value: sType}
				});
			};
			var fnExtractParameterProperties = function (oParameter, aParameters, iDepth, aPhoneName) {
				if (oParameter.parameterProperties) {
					Object.keys(oParameter.parameterProperties).forEach(function (sProperty) {
						var oProperty = oParameter.parameterProperties[sProperty];

						oProperty.depth = iDepth;

						// Handle types
						if (oProperty.type) {
							oProperty.types = fnCreateTypesArr(oProperty.type);
						}

						// Phone name - available only for parameters
						oProperty.phoneName = [aPhoneName.join("."), oProperty.name].join(".");

						// Add property to parameter array as we need a simple structure
						aParameters.push(oProperty);

						// Handle child parameterProperties
						fnExtractParameterProperties(oProperty, aParameters, (iDepth + 1), aPhoneName.concat([oProperty.name]));

						// Keep file size in check
						delete oProperty.type;
					});

					// Keep file size in check
					delete oParameter.parameterProperties;
				}
			};
			aMethods.forEach(function (oMethod) {
				// New array to hold modified parameters
				var aParameters = [];

				// Handle parameters
				if (oMethod.parameters) {
					oMethod.parameters.forEach(function (oParameter) {
						if (oParameter.type) {
							oParameter.types = fnCreateTypesArr(oParameter.type);
						}

						// Keep file size in check
						delete oParameter.type;

						// Add the parameter before the properties
						aParameters.push(oParameter);

						// Handle Parameter Properties
						// Note: We flatten the structure
						fnExtractParameterProperties(oParameter, aParameters, 1, [oParameter.name]);

					});

					// Override the old data
					oMethod.parameters = aParameters;
				}

				// Handle return values
				if (oMethod.returnValue && oMethod.returnValue.type) {
					// Handle types
					oMethod.returnValue.types = fnCreateTypesArr(oMethod.returnValue.type);
				}

			});
		},

		/**
		 * Adjusts events info so that it can be easily displayed in a table
		 * @param {Array} aEvents - the events array initially coming from the server
		 */
		buildEventsModel: function (aEvents) {
			var fnExtractParameterProperties = function (oParameter, aParameters, iDepth, aPhoneName) {
				if (oParameter.parameterProperties) {
					Object.keys(oParameter.parameterProperties).forEach(function (sProperty) {
						var oProperty = oParameter.parameterProperties[sProperty],
							sPhoneTypeSuffix;

						oProperty.depth = iDepth;

						// Phone name - available only for parameters
						sPhoneTypeSuffix = oProperty.type === "array" ? "[]" : "";
						oProperty.phoneName = [aPhoneName.join("."), (oProperty.name + sPhoneTypeSuffix)].join(".");

						// Add property to parameter array as we need a simple structure
						aParameters.push(oProperty);

						// Handle child parameterProperties
						fnExtractParameterProperties(oProperty, aParameters, (iDepth + 1),
							aPhoneName.concat([oProperty.name + sPhoneTypeSuffix]));
					});

					// Keep file size in check
					delete oParameter.parameterProperties;
				}
			};
			aEvents.forEach(function (aEvents) {
				// New array to hold modified parameters
				var aParameters = [];

				// Handle parameters
				if (aEvents.parameters) {
					aEvents.parameters.forEach(function (oParameter) {
						// Add the parameter before the properties
						aParameters.push(oParameter);

						// Handle Parameter Properties
						// Note: We flatten the structure
						fnExtractParameterProperties(oParameter, aParameters, 1, [oParameter.name]);
					});

					// Override the old data
					aEvents.parameters = aParameters;
				}
			});
		},

		/**
		 * Adjusts constructor parameters info so that it can be easily displayed in a table
		 * @param {Array} aParameters - the events array initially coming from the server
		 */
		buildConstructorParameters: function (aParameters) {
			// New array to hold modified parameters
			var aNodes = [],
				processNode = function (oNode, sPhoneName, iDepth, aNodes) {
					// Handle phone name
					oNode.phoneName = sPhoneName ? [sPhoneName, oNode.name].join(".") : oNode.name;

					// Depth
					oNode.depth = iDepth;

					// Add to array
					aNodes.push(oNode);

					// Handle nesting
					if (oNode.parameterProperties) {
						Object.keys(oNode.parameterProperties).forEach(function (sNode) {
							processNode(oNode.parameterProperties[sNode], oNode.phoneName, (iDepth + 1), aNodes);
						});
					}

					delete oNode.parameterProperties;
				};

			aParameters.forEach(function (oParameter) {
				// Handle Parameter Properties
				// Note: We flatten the structure
				processNode(oParameter, undefined, 0, aNodes);
			});

			return aNodes;
		},

		oLibsData: {},
		aTreeContent: [],

		_getControlChildren: function (sTopicId) {
			// Find tree node
			var findTreeNode = function (aNodes, sTopicId) {
					var iLen,
						oNode,
						i;

					for (i = 0, iLen = aNodes.length; i < iLen; i++) {
						oNode = aNodes[i];
						if (oNode.name === sTopicId) {
							return oNode;
						}
						if (oNode.nodes) {
							oNode = findTreeNode(aNodes[i].nodes, sTopicId);
							if (oNode) {
								return oNode;
							}
						}
					}
				},
				oNode = findTreeNode(this.aTreeContent, sTopicId);

			return oNode.nodes ? oNode.nodes : false;
		},

		_parseLibraryElements : function (aLibraryElements) {
			var oLibraryElement,
				aNodes,
				i;

			for (i = 0; i < aLibraryElements.length; i++) {
				oLibraryElement = aLibraryElements[i];
				aNodes = oLibraryElement.nodes;

				if (!aNodes) {
					this.oLibsData[oLibraryElement.name] = oLibraryElement;
				}

				this._addElementToTreeData(oLibraryElement, aLibraryElements);

				if (aNodes) {
					this._parseLibraryElements(aNodes, true);
				}
			}

			return this.aTreeContent;
		},

		_addElementToTreeData : function (oJSONElement, aLibraryElements) {
			var oNewNodeNamespace;

			if (oJSONElement.kind !== "namespace") {
				var aNameParts = oJSONElement.name.split("."),
					sBaseName = aNameParts.pop(),
					sNodeNamespace = aNameParts.join("."), // Note: Array.pop() on the previous line modifies the array itself
					oTreeNode = this._createTreeNode(sBaseName, oJSONElement.name),
					oExistingNodeNamespace = this._findNodeNamespaceInTreeStructure(sNodeNamespace);

				if (oExistingNodeNamespace) {
					if (!oExistingNodeNamespace.nodes) {
						oExistingNodeNamespace.nodes = [];
					}
					oExistingNodeNamespace.nodes.push(oTreeNode);
				} else if (sNodeNamespace) {
					oNewNodeNamespace = this._createTreeNode(sNodeNamespace, sNodeNamespace);
					oNewNodeNamespace.nodes = [];
					oNewNodeNamespace.nodes.push(oTreeNode);
					this.aTreeContent.push(oNewNodeNamespace);

					this._removeDuplicatedNodeFromTree(sNodeNamespace);

					// Inject missing new root namespace in main collection
					aLibraryElements.push({
						kind: "namespace", // Note: we show this elements as namespaces
						name: sNodeNamespace,
						ref: "#/api/" + sNodeNamespace
					});

				} else {
					// Entities for which we can't resolve namespace we are shown in the root level
					oNewNodeNamespace = this._createTreeNode(oJSONElement.name, oJSONElement.name);
					this.aTreeContent.push(oNewNodeNamespace);
				}
			} else {
				oNewNodeNamespace = this._createTreeNode(oJSONElement.name, oJSONElement.name);
				this.aTreeContent.push(oNewNodeNamespace);
			}
		},

		_createTreeNode : function (text, name, sLib) {
			var oTreeNode = {};
			oTreeNode.text = text;
			oTreeNode.name = name;
			oTreeNode.ref = "#/api/" + encodeURIComponent(name);
			return oTreeNode;
		},

		_findNodeNamespaceInTreeStructure : function (sNodeNamespace, aTreeStructure) {
			aTreeStructure = aTreeStructure || this.aTreeContent;
			for (var i = 0; i < aTreeStructure.length; i++) {
				var oTreeNode = aTreeStructure[i];
				if (oTreeNode.name === sNodeNamespace) {
					return oTreeNode;
				}
				if (oTreeNode.nodes) {
					var oChildNode = this._findNodeNamespaceInTreeStructure(sNodeNamespace, oTreeNode.nodes);
					if (oChildNode) {
						return oChildNode;
					}
				}
			}
		},

		_removeNodeFromNamespace : function (sNode, oNamespace) {
			for (var i = 0; i < oNamespace.nodes.length; i++) {
				if (oNamespace.nodes[i].text === sNode) {
					oNamespace.nodes.splice(i, 1);
					return;
				}
			}
		},

		_removeDuplicatedNodeFromTree : function (sNodeFullName) {
			if (this.oLibsData[sNodeFullName]) {
				var sNodeNamespace = sNodeFullName.substring(0, sNodeFullName.lastIndexOf("."));
				var oNamespace = this._findNodeNamespaceInTreeStructure(sNodeNamespace);
				var sNode = sNodeFullName.substring(sNodeFullName.lastIndexOf(".") + 1, sNodeFullName.lenght);
				this._removeNodeFromNamespace(sNode, oNamespace);
			}
		},
		_addChildrenDescription: function (aLibsData, aControlChildren) {
			function getDataByName (sName) {
				var iLen,
					i;

				for (i = 0, iLen = aLibsData.length; i < iLen; i++) {
					if (aLibsData[i].name === sName) {
						return aLibsData[i];
					}
				}
				return false;
			}
			for (var i = 0; i < aControlChildren.length; i++) {
				aControlChildren[i].description = formatters._formatChildDescription(getDataByName(aControlChildren[i].name).description);
				aControlChildren[i].description = formatters._preProcessLinksInTextBlock(aControlChildren[i].description, true);

				// Handle nesting
				if (aControlChildren[i].nodes) {
					this._addChildrenDescription(aLibsData, aControlChildren[i].nodes);
				}
			}
		}
	};

	// Create the chain object
	let oChainObject = {
		inputFile: sInputFile,
		outputFile: sOutputFile,
		libraryFile: sLibraryFile,
		aDependentLibraryFiles: Array.isArray(vDependencyAPIFiles) ? vDependencyAPIFiles : null 
	};

	// Start the work here
	let p = getLibraryPromise(oChainObject)
		.then(extractComponentAndDocuindexUrl)
		.then(flattenComponents)
		.then(extractSamplesFromDocuIndex)
		.then(getDependencyLibraryFilesList)
		.then(getAPIJSONPromise)
		.then(loadDependencyLibraryFiles)
		.then(transformApiJson)
		.then(createApiRefApiJson);
	return p;

};

module.exports = transformer;

// auto execute the transformer, if this module is the executed script (not used in grunt tooling)
if ( process.argv.length > 1 && /transform-apijson-for-sdk.js$/.test(process.argv[1]) ) {

	let sInputFile = process.argv[2];
	let sOutputFile = process.argv[3];
	let sLibraryFile = process.argv[4];
	let sAPIJSonDependencyDir = process.argv[5];
	
	transformer(sInputFile, sOutputFile, sLibraryFile, sAPIJSonDependencyDir)
	.catch(oError => {
		console.log(oError);
	});

}
