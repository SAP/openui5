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

		var oLibraryDataCache = {};
		var oAllLibrariesPromise = null;

		// Libraries that should be ommitted from the tree
		var LIBRARIES_BLACK_LIST = ["sap.ui.demokit", "sap.ui.documentation"];
		// Libraries that start with these prefixes should be ommitted from the tree
		var LIBRARY_PREFIXES_BLACK_LIST = ["themelib_"];

		function getLibraryElementsJSONSync(sLibraryName) {
			var oResponse = [];

			if ( !sLibraryName ) {
				return oResponse;
			}

			if (oLibraryDataCache[sLibraryName]) {
				return oLibraryDataCache[sLibraryName];
			}

			jQuery.ajax({
				async: false,
				url : sTestResourcesRoot + sLibraryName.replace(/\./g, '/') + '/designtime/api.json',
				dataType : 'json',
				success : function(vResponse) {
					oResponse = vResponse.symbols;
				},
				error : function () {
					oResponse = [];
					jQuery.sap.log.error("failed to load api.json for: " + sLibraryName);
				}
			});

			oLibraryDataCache[sLibraryName] = oResponse;

			return oResponse;
		}

		function getLibraryElementsJSONPromise(sLibraryName) {

			// If no library name given, resolve immediately with empty array
			if ( !sLibraryName ) {
				return Promise.resolve([]);
			}

			if (oLibraryDataCache[sLibraryName]) {
				return Promise.resolve(oLibraryDataCache[sLibraryName]);
			}

			return new Promise(function (resolve) {
				// Fetch library data, then cache it no matter the result
				jQuery.ajax({
					async: true,
					url : sTestResourcesRoot + sLibraryName.replace(/\./g, '/') + '/designtime/api.json',
					dataType : 'json',
					success : function(vResponse) {
						var aResult = vResponse.symbols || [];
						oLibraryDataCache[sLibraryName] = aResult;
						resolve(aResult);
					},
					error : function (err) {
						jQuery.sap.log.error("failed to load api.json for: " + sLibraryName);
						oLibraryDataCache[sLibraryName] = [];
						resolve([]);
					}
				});
			});

		}

		function getAllLibraryInfos() {
			var aLibraries = sap.ui.getVersionInfo().libraries;

			aLibraries = aLibraries.filter(function (oLibrary) {
				var bIsBlacklisted = LIBRARIES_BLACK_LIST.indexOf(oLibrary.name) !== -1;
				var bStartsWithBlacklistedPrefix = LIBRARY_PREFIXES_BLACK_LIST.some(function (sPrefix) {
					return oLibrary.name.indexOf(sPrefix) === 0;
				});

				return !bIsBlacklisted && !bStartsWithBlacklistedPrefix;
			});

			return aLibraries;
		}

		function getAllLibrariesElementsJSONPromise() {
			if (oAllLibrariesPromise) {
				return oAllLibrariesPromise;
			}

			var aLibraries = getAllLibraryInfos();

			// Get a list of promises for each library (these never reject, but can resolve with an empty array)
			var aPromises = aLibraries.map(function (oLibrary) {
				return getLibraryElementsJSONPromise(oLibrary.name);
			});

			oAllLibrariesPromise = Promise.all(aPromises);

			return oAllLibrariesPromise;
		}

		function setRoot(sRoot) {
			sRoot = sRoot == null ? jQuery.sap.getModulePath('', '/') + '../test-resources/' : sRoot;
			if ( sRoot.slice(-1) != '/' ) {
				sRoot += '/';
			}
			sTestResourcesRoot = sRoot;
		}

		setRoot();

		return {
			_setRoot : setRoot,
			getLibraryElementsJSONSync : getLibraryElementsJSONSync,
			getLibraryElementsJSONPromise: getLibraryElementsJSONPromise,
			getAllLibrariesElementsJSONPromise: getAllLibrariesElementsJSONPromise
		};

	});
