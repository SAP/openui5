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

		function getIndexJsonPromise() {

			if (oLibraryDataCache["index"]) {
				return Promise.resolve(oLibraryDataCache["index"]);
			}

			return new Promise(function (resolve, reject) {
				jQuery.ajax({
					async: true,
					url : "./docs/api/api-index.json",
					dataType : 'json',
					success : function(vResponse) {
						var aResult = vResponse.symbols || [];
						oLibraryDataCache["index"] = aResult;
						resolve(aResult);
					},
					error : function () {
						jQuery.sap.log.error("failed to load api-index.json");
						oLibraryDataCache["index"] = [];
						resolve([]);
					}
				});
			});
		}

		function getDeprecatedPromise() {

			if (oLibraryDataCache["deprecated"]) {
				return Promise.resolve(oLibraryDataCache["deprecated"]);
			}

			return new Promise(function (resolve, reject) {
				jQuery.ajax({
					async: true,
					url : "./docs/api/api-index-deprecated.json",
					dataType : 'json',
					success : function(vResponse) {
						oLibraryDataCache["deprecated"] = vResponse;
						resolve(vResponse);
					},
					error : function () {
						reject();
					}
				});
			});

		}

		function getExperimentalPromise() {

			if (oLibraryDataCache["experimental"]) {
				return Promise.resolve(oLibraryDataCache["experimental"]);
			}

			return new Promise(function (resolve, reject) {
				jQuery.ajax({
					async: true,
					url : "./docs/api/api-index-experimental.json",
					dataType : 'json',
					success : function(vResponse) {
						oLibraryDataCache["experimental"] = vResponse;
						resolve(vResponse);
					},
					error : function () {
						reject();
					}
				});
			});

		}

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
				url : sTestResourcesRoot + sLibraryName.replace(/\./g, '/') + '/designtime/apiref/api.json',
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
					url : sTestResourcesRoot + sLibraryName.replace(/\./g, '/') + '/designtime/apiref/api.json',
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

		function isLibraryAllowed(oLibrary) {
			var bIsBlacklisted = LIBRARIES_BLACK_LIST.indexOf(oLibrary.name) !== -1;
			var bStartsWithBlacklistedPrefix = LIBRARY_PREFIXES_BLACK_LIST.some(function (sPrefix) {
				return oLibrary.name.indexOf(sPrefix) === 0;
			});

			return !bIsBlacklisted && !bStartsWithBlacklistedPrefix;
		}

		function getAllLibrariesElementsJSONPromise(aLibraries) {
			if (oAllLibrariesPromise) {
				return oAllLibrariesPromise;
			}

			aLibraries = aLibraries || sap.ui.getVersionInfo().libraries || [];
			aLibraries = aLibraries.filter(isLibraryAllowed);

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
			getIndexJsonPromise: getIndexJsonPromise,
			getDeprecatedPromise: getDeprecatedPromise,
			getExperimentalPromise: getExperimentalPromise,
			getLibraryElementsJSONSync : getLibraryElementsJSONSync,
			getLibraryElementsJSONPromise: getLibraryElementsJSONPromise,
			getAllLibrariesElementsJSONPromise: getAllLibrariesElementsJSONPromise
		};

	});
