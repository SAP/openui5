/*!
 * ${copyright}
 */

// Provides reuse functionality for reading documentation from api.json files (as created by the UI5 JSDoc3 template/plugin)
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	/**
	 * Root path to read api.json files from
	 */
	var sTestResourcesRoot;

	/**
	 * Cached content of api.json files per library.
	 */

	var oLibraryDocumentation;

	function findLibrary(sEntityName) {
		var oVersionInfo = sap.ui.getVersionInfo();
		if ( oVersionInfo && Array.isArray(oVersionInfo.libraries) ) {
			for ( var i = 0; i < oVersionInfo.libraries.length; i++) {
				var library = oVersionInfo.libraries[i];
				if ( sEntityName === library.name || sEntityName.indexOf(library.name + ".") === 0 ) {
					return library.name;
				}
			}
		}

		// fallback to core (this ensures that the extraordinary packages of sap.ui.core are found, but doesn't work as soon as other libs do the same)
		return "sap.ui.core";

		/*
		// TODO: avoid hard coded knowledge about the extraordinary packages of sap.ui.core
		if ( /^sap\.ui\.(base|model|test|thirdparty)(\.|$)/.test(sEntityName) // sibling packages of sap.ui.cor
			 || /^sap\.ui(\.[^.]+)?$/.test(sEntityName) // sap.ui package and its content (without sub packages - won't find sap.ui.component.load)
			 || /^jQuery\.sap\./.test(sEntityName) ) { // jQuery plugin stuff
			return 'sap.ui.core';
		}

		return undefined;
		*/
	}

	function getAPIJSON(sLibrary) {

		if ( !sLibrary ) {
			return undefined;
		}

		var oLibraryDoc = oLibraryDocumentation[sLibrary];

		if ( oLibraryDoc === undefined ) {
			jQuery.ajax({
				async: false,
				url : sTestResourcesRoot + sLibrary.replace(/\./g, '/') + '/designtime/api.json',
				dataType : 'json',
				success : function(vResponse) {
					oLibraryDoc = oLibraryDocumentation[sLibrary] = vResponse;
				},
				error : function (err) {
					jQuery.sap.log.debug("failed to load api.json for: " + sLibrary);
					oLibraryDocumentation[sLibrary] = null; // avoid future loading
				}
			});
		}

		return oLibraryDoc;
	}

	function findSymbol(oLibDoc, sEntityName) {

		var i,j;

		if ( !oLibDoc ) {
			return undefined;
		}

		var symbols = oLibDoc.symbols;
		for ( i = 0; i < symbols.length; i++) {
			if ( symbols[i].name === sEntityName ) {
				return symbols[i];
			}
			if ( sEntityName.indexOf(symbols[i].name + '.') === 0 ) {
				if ( symbols[i].properties ) {
					for ( j = 0; j < symbols[i].properties.length; j++ ) {
						if ( symbols[i].properties[j].static && sEntityName === symbols[i].name + "." + symbols[i].properties[j].name ) {
							return symbols[i].properties[j];
						}
					}
				}
				if ( symbols[i].methods ) {
					for ( j = 0; j < symbols[i].methods.length; j++ ) {
						if ( symbols[i].methods[j].static && sEntityName === symbols[i].name + "." + symbols[i].methods[j].name ) {
							return symbols[i].methods[j];
						}
					}
				}
			}
		}
	}

	function convertSymbolAPI(json) {

		var ui5 = json['ui5-metadata'],
			oEntityDoc = {
				metatype : ui5 && ui5.stereotype,
				name : json.name,
				module : json.module,
				baseType : json.extends || undefined,
				doc : json.description,
				deprecation : json.deprecated && json.deprecated.text,
				since : json.since,
				experimental : json.experimental && json.experimental.text,
				specialSettings: {},
				properties : {},
				aggregations : {},
				associations : {},
				events : {},
				values : {},
				methods : {}
			},
			generatedMethods = {},
			generatedStaticMethods = {
				getMetadata: true,
				extend: true
			},
			HUNGARIAN_PREFIX = /^(?:fn|a|b|d|f|i|j|m|o|r|s|v)([A-Z])(.*)$/;

		function removeHungarianNotation(s) {
			var match = HUNGARIAN_PREFIX.exec(s);
			if ( match ) {
				return match[1].toLowerCase() + match[2];
			}
			return s;
		}

		function collectMethods(methods) {
			if ( methods ) {
				if ( typeof methods === 'string' ) {
					methods = methods.split(' ');
				}
				methods.forEach(function(method) {
					generatedMethods[method] = true;
				});
			}
			return methods;
		}

		if ( ui5 ) {
			if ( ui5.specialSettings ) {
				ui5.specialSettings.forEach(function(oSpecialSetting) {
					oEntityDoc.specialSettings[oSpecialSetting.name] = {
						kind : -1,
						name : oSpecialSetting.name,
						type : oSpecialSetting.type || 'any'
					};
				});
			}
			if ( ui5.properties ) {
				ui5.properties.forEach(function(oProperty) {
					oEntityDoc.properties[oProperty.name] = {
						kind : 0,
						name : oProperty.name,
						visibility: oProperty.visibility || "public",
						type : oProperty.type,
						defaultValue : oProperty.defaultValue,
						doc : oProperty.description,
						deprecation : oProperty.deprecated && oProperty.deprecated.text,
						experimental : oProperty.experimental && oProperty.experimental.text,
						since : oProperty.since,
						bindable: oProperty.bindable || false,
						methods: collectMethods(oProperty.methods)
					};
				});
			}
			if ( ui5.aggregations ) {
				ui5.aggregations.forEach(function(oAggregation) {
					oEntityDoc.aggregations[oAggregation.name] = {
						kind : oAggregation.cardinality === "0..1" ? 1 : 2,
						name : oAggregation.name,
						type : oAggregation.type,
						cardinality: oAggregation.cardinality || "0..n",
						visibility: oAggregation.visibility || "public",
						doc : oAggregation.description,
						deprecation : oAggregation.deprecated && oAggregation.deprecated.text,
						experimental : oAggregation.experimental && oAggregation.experimental.text,
						since : oAggregation.since,
						bindable: oAggregation.bindable || false,
						methods: collectMethods(oAggregation.methods)
					};
				});
			}
			if ( ui5.associations ) {
				ui5.associations.forEach(function(oAssociation) {
					oEntityDoc.associations[oAssociation.name] = {
						kind : oAssociation.cardinality === "0..n" ? 4 : 3,
						name : oAssociation.name,
						type : oAssociation.type,
						cardinality: oAssociation.cardinality || "0..1",
						visibility: oAssociation.visibility || "public",
						doc : oAssociation.description,
						deprecation : oAssociation.deprecated && oAssociation.deprecated.text,
						experimental : oAssociation.experimental && oAssociation.experimental.text,
						since : oAssociation.since,
						methods: collectMethods(oAssociation.methods)
					};
				});
			}
			if ( ui5.events ) {
				ui5.events.forEach(function(oEvent) {
					oEntityDoc.events[oEvent.name] = {
						kind : 5,
						doc : oEvent.description,
						deprecation : oEvent.deprecated && oEvent.deprecated.text,
						since : oEvent.since,
						parameters : {},
						methods: collectMethods(oEvent.methods)
					};
					if ( oEvent.parameters ) {
						jQuery.each(oEvent.parameters, function(sName, oParameter) {
							oEntityDoc.events[oEvent.name].parameters[oParameter.name] = {
								kind: 6,
								name : oParameter.name,
								type : oParameter.type,
								doc : oParameter.description,
								since : oParameter.since,
								deprecation : oParameter.deprecated && oParameter.deprecated.text
							};
						});
					}
				});
			}
		}

		if ( json.properties ) {
			json.properties.forEach(function (oField) {
				oEntityDoc.values[oField.name] = {
					kind : 9,
					type : oField.type,
					module : oField.module,
					visibility : oField.visibility || 'public',
					'static' : oField['static'] || false,
					doc : oField.description,
					deprecation : oField.deprecated && oField.deprecated.text,
					experimental : oField.experimental && oField.experimental.text,
					since : oField.since
				};
			});
		}
		if ( json.methods ) {
			json.methods.slice().sort(function(a,b) {
				if ( !a.static && b.static ) {
					return -1;
				} else if ( a.static && !b.static ) {
					return 1;
				} else if ( a.name !== b.name ) {
					return a.name < b.name ? -1 : 1;
				} else {
					return 0;
				}
			}).forEach(function (oMethod) {
				oEntityDoc.methods[oMethod.name] = {
					kind : 7,
					type : oMethod.returnValue && oMethod.returnValue.type  || "sap.ui.core.void",
					module : oMethod.module,
					visibility : oMethod.visibility || 'public',
					'static' : oMethod['static'] || false,
					doc : oMethod.description,
					deprecation : oMethod.deprecated && oMethod.deprecated.text,
					since : oMethod.since,
					parameters : [],
					synthetic: generatedMethods.hasOwnProperty(oMethod.name) || (oMethod['static'] && generatedStaticMethods.hasOwnProperty(oMethod.name))
				};
				if ( oMethod.parameters ) {
					oMethod.parameters.forEach(function (oParameter) {
						oEntityDoc.methods[oMethod.name].parameters.push({
							kind: 8,
							name : removeHungarianNotation(oParameter.name),
							type : oParameter.type,
							doc : oParameter.description,
							since : oParameter.since,
							deprecation : oParameter.deprecated && oParameter.deprecated.text
						});
					});
				}
			});
		}

		return oEntityDoc;
	}

	function setRoot(sRoot) {
		sRoot = sRoot == null ? jQuery.sap.getModulePath('', '/') + '../test-resources/' : sRoot;
		if ( sRoot.slice(-1) != '/' ) {
			sRoot += '/';
		}
		sTestResourcesRoot = sRoot;
		oLibraryDocumentation = {}; // clear cache
	}

	function getFromAPIJSON(sEntityName) {
		var oLibDoc = getAPIJSON(findLibrary(sEntityName));
		var oSymbolAPIJSON = findSymbol(oLibDoc, sEntityName);
		return oSymbolAPIJSON ? convertSymbolAPI(oSymbolAPIJSON) : undefined;
	}

	setRoot();

	return {
		_setRoot : setRoot,
		getEntityInfo : getFromAPIJSON
	};

});
