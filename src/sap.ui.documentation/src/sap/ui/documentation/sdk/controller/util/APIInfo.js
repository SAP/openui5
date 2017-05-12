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

			return new Promise(function (resolve) {
				// If no library name given, resolve immediately with empty array
				if ( !sLibraryName ) {
					resolve([]);
					return;
				}

				if (oLibraryDataCache[sLibraryName]) {
					resolve(oLibraryDataCache[sLibraryName]);
				}

				// Fetch library data, then cache it no matter the result
				jQuery.ajax({
					async: true,
					url : sTestResourcesRoot + sLibraryName.replace(/\./g, '/') + '/designtime/api.json',
					dataType : 'json',
					success : function(vResponse) {
						oLibraryDataCache[sLibraryName] = vResponse.symbols;
						resolve(vResponse.symbols);
					},
					error : function (err) {
						jQuery.sap.log.error("failed to load api.json for: " + sLibraryName);
						oLibraryDataCache[sLibraryName] = [];
						resolve([]);
					}
				});
			});

		}

		function getAllLibrariesElementsJSONPromise() {
			if (oAllLibrariesPromise) {
				return oAllLibrariesPromise;
			}

			oAllLibrariesPromise = new Promise(function (resolve) {
				var aLibraries = sap.ui.getVersionInfo().libraries;

				// Get a list of promises for each library (these never reject, but can resolve with an empty array)
				var aPromises = aLibraries.map(function (oLibrary) {
					return getLibraryElementsJSONPromise(oLibrary.name);
				});

				// Load all libraries asynchronously and return when ready
				Promise.all(aPromises).then(function (aLibsData) {
					resolve(aLibsData);
				});
			});

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
