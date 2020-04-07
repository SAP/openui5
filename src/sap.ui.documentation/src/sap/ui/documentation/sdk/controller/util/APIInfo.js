/*!
 * ${copyright}
 */

// Provides reuse functionality for reading documentation from api.json files (as created by the UI5 JSDoc3 template/plugin)
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/base/Log"],
	function(jQuery, Log) {
		"use strict";

		/**
		 * Root path to read api.json files from
		 */
		var sTestResourcesRoot;

		var oLibraryDataCache = {};

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
						jQuery.ajax({
							async: true,
							url : "../../../../../../docs/api/api-index.json",
							dataType : 'json',
							success : function(vResponse) {
								var aResult = vResponse.symbols || [];
								oLibraryDataCache["index"] = aResult;
								resolve(aResult);
							},
							error : function () {
								Log.error("failed to load api-index.json");
								oLibraryDataCache["index"] = [];
								resolve([]);
							}
						});
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

		function getSincePromise() {

			if (oLibraryDataCache["since"]) {
				return Promise.resolve(oLibraryDataCache["since"]);
			}

			return new Promise(function (resolve, reject) {
				jQuery.ajax({
					async: true,
					url : "./docs/api/api-index-since.json",
					dataType : 'json',
					success : function(vResponse) {
						oLibraryDataCache["since"] = vResponse;
						resolve(vResponse);
					},
					error : function () {
						reject();
					}
				});
			});

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
						Log.error("failed to load api.json for: " + sLibraryName);
						oLibraryDataCache[sLibraryName] = [];
						resolve([]);
					}
				});
			});

		}

		function setRoot(sRoot) {
			sRoot = sRoot == null ? sap.ui.require.toUrl("") + "/" + '../test-resources/' : sRoot;
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
			getSincePromise: getSincePromise,
			getLibraryElementsJSONPromise: getLibraryElementsJSONPromise
		};

	});