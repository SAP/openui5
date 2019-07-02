/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.documentation.
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    'sap/ui/core/util/LibraryInfo',
	"sap/base/Log",
    'sap/ui/core/library',
	'sap/m/library'
], // library dependency
	function(jQuery, LibraryInfo, Log) {

	'use strict';

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : 'sap.ui.documentation',
		version: '${version}',
		dependencies : ['sap.ui.core','sap.m'],
		types: [],
		interfaces: [],
		controls: [
			"sap.ui.documentation.sdk.controls.BorrowedList",
			"sap.ui.documentation.sdk.controls.DemokitTreeItem",
			"sap.ui.documentation.sdk.controls.JSDocText",
			"sap.ui.documentation.sdk.controls.LightTable",
			"sap.ui.documentation.sdk.controls.ObjectPageSubSection",
			"sap.ui.documentation.sdk.controls.ParamText",
			"sap.ui.documentation.sdk.controls.Search",
			"sap.ui.documentation.sdk.controls.TitleLink"
		],
		elements: [
			"sap.ui.documentation.sdk.controls.Row",
			"sap.ui.documentation.sdk.controls.WebPageTitleUtil"
		],
		noLibraryCSS: true
	});

	/**
	 * SAPUI5 library with controls specialized for administrative applications.
	 *
	 * @namespace
	 * @name sap.ui.documentation
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */
	var thisLibrary = sap.ui.documentation;

	var _libraryInfoSingleton;

	thisLibrary._getLicense = function () {
		var sUrl = "./LICENSE.txt";

		return jQuery.ajax({
			url: sUrl,
			dataType: "text"
		});
	};

	thisLibrary._getAppInfo = function(fnCallback) {
		var sUrl = sap.ui.resource("", "sap-ui-version.json");

		jQuery.ajax({
			url: sUrl,
			dataType: "json",
			error: function(xhr, status, e) {
				Log.error("failed to load library list from '" + sUrl + "': " + status + ", " + e);
				fnCallback(null);
			},
			success : function(oAppInfo, sStatus, oXHR) {
				if (!oAppInfo) {
					Log.error("failed to load library list from '" + sUrl + "': " + sStatus + ", Data: " + oAppInfo);
					fnCallback(null);
					return;
				}

				fnCallback(oAppInfo);
			}
		});
	};

	/**
	 * Ensures that only one instance of LibraryInfo will be used across the app.
	 * This is important, because the LibraryInfo object stores internally the content of already loaded .library files
	 * @returns {*}
	 * @private
	 */
	thisLibrary._getLibraryInfoSingleton = function () {
		if (!_libraryInfoSingleton) {
			_libraryInfoSingleton = new LibraryInfo();
		}

		return _libraryInfoSingleton;
	};

	thisLibrary._loadAllLibInfo = function(sAppRoot, sInfoType, sReqVersion, fnCallback) {

		// parameter fallback for compatibility: if the version is a function
		// then it is the old signature: (sAppRoot, sInfoType, fnCallback)
		if (typeof sReqVersion === "function") {
			fnCallback = sReqVersion;
			sReqVersion = undefined;
		}

		var libInfo = thisLibrary._getLibraryInfoSingleton();

		// special case: fetching library info and release notes in one cycle
		// this will use the _getLibraryInfo functionality and
		var bFetchReleaseNotes = sInfoType == "_getLibraryInfoAndReleaseNotes";
		if (bFetchReleaseNotes) {
			sInfoType = "_getLibraryInfo";
		}

		thisLibrary._getAppInfo(function(oAppInfo) {
			if (!(oAppInfo && oAppInfo.libraries)) {
				fnCallback(null, null);
				return;
			}

			var count = 0,
				aLibraries = oAppInfo.libraries,
				len = aLibraries.length,
				oLibInfos = {},
				oLibVersions = {},
				aLibs = [],
				libName,
				libVersion;
			for (var i = 0; i < len; i++) {
				libName = aLibraries[i].name;
				libVersion = aLibraries[i].version;
				aLibs.push(libName);
				oLibVersions[libName] = libVersion;

				/*eslint-disable no-loop-func */
				libInfo[sInfoType](libName, function(oExtensionData){
					var fnDone = function() {
						count++;
						if (count == len) {
							fnCallback(aLibs, oLibInfos, oAppInfo);
						}
					};
					oLibInfos[oExtensionData.library] = oExtensionData;
					// fallback to version coming from version info file
					// (in case of ABAP we always should refer to the libVersion if available!)
					if (!oLibInfos[oExtensionData.library].version) {
						oLibInfos[oExtensionData.library].version = oLibVersions[oExtensionData.library];
					}
					// fetch the release notes if defined - in case of no version
					// is specified we fallback to the current library version
					if (bFetchReleaseNotes) {
						libInfo._getReleaseNotes(oExtensionData.library, sReqVersion, function(oReleaseNotes) {
							oLibInfos[oExtensionData.library].relnotes = oReleaseNotes;
							fnDone();
						});
					} else {
						fnDone();
					}
				});
				/*eslint-enable no-loop-func */
			}
		});
	};

	return thisLibrary;

});