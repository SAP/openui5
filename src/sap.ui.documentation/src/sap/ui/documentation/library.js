/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.documentation.
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/util/LibraryInfo',
	"sap/ui/documentation/sdk/util/Resources",
	'sap/ui/core/library',
	'sap/m/library'
], function(Log, Lib, jQuery, LibraryInfo, ResourcesUtil) {

	'use strict';

	/**
	 * SAPUI5 library with controls specialized for administrative applications.
	 *
	 * @namespace
	 * @alias sap.ui.documentation
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.48
	 * @public
	 */
	var thisLibrary = Lib.init({
		apiVersion: 2,
		name : 'sap.ui.documentation',
		version: '${version}',
		dependencies : ['sap.ui.core','sap.m'],
		types: [],
		interfaces: [],
		controls: [
			"sap.ui.documentation.BorrowedList",
			"sap.ui.documentation.DemokitTreeItem",
			"sap.ui.documentation.JSDocText",
			"sap.ui.documentation.LightTable",
			"sap.ui.documentation.ObjectPageSubSection",
			"sap.ui.documentation.ParamText",
			"sap.ui.documentation.Search",
			"sap.ui.documentation.TitleLink"
		],
		elements: [
			"sap.ui.documentation.Row",
			"sap.ui.documentation.WebPageTitleUtil"
		]
	});

	var _libraryInfoSingleton;

	var DocumentationLibraryInfo = LibraryInfo.extend("sap.ui.documentation.DocumentationLibraryInfo", {});

		if (ResourcesUtil.getHasProxy()) {
			DocumentationLibraryInfo.prototype.getResourceUrl = function(sUrl) {
				return ResourcesUtil.getResourceOriginPath(sUrl);
			};
		}

		thisLibrary._getLicense = function () {
		var sUrl = "./LICENSE.txt";

		return jQuery.ajax({
			url: sUrl,
			dataType: "text"
		});
	};

	thisLibrary._getAppInfo = function(fnCallback, sReqVersion) {
		var sUrl;
		if (sReqVersion){
			sUrl = ResourcesUtil.getResourceOriginPath(`${sReqVersion}/resources/sap-ui-version.json`);
		} else {
			sUrl = ResourcesUtil.getResourceOriginPath("resources/sap-ui-version.json");
		}

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
			_libraryInfoSingleton = new DocumentationLibraryInfo();
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
		var sReqVersionFull;

		// special case: fetching library info and release notes in one cycle
		// this will use the _getLibraryInfo functionality and
		var bFetchReleaseNotes = sInfoType == "_getLibraryInfoAndReleaseNotes";
		if (bFetchReleaseNotes) {
			sInfoType = "_getLibraryInfo";
		}

		if (!sReqVersion || (sReqVersion.match(/\./g) || []).length == 2) {
			sReqVersionFull = sReqVersion;

		} else {
			sReqVersionFull = sReqVersion + ".0";
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
		}, sReqVersionFull);
	};

	return thisLibrary;

});