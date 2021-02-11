/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.test.LibraryEnablementTest.
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"controlEnablementReport/ElementActionDefinitionTest"
], function(ManagedObject, ElementActionDefinitionTest) {
	"use strict";


	/**
	 * Constructor for a LibraryEnablementTest.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The LibraryEnablementTest class allows to create a design time test
	 * which tests a given library on compatibility with the sap.ui.dt.DesignTime.
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.dt.test.LibraryEnablementTest2
	 * @experimental Since 1.48. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var LibraryEnablementTest2 = ManagedObject.extend("sap.ui.dt.test.LibraryEnablementTest", /** @lends sap.ui.dt.test.LibraryEnablementTest2.prototype */ {
	});


	LibraryEnablementTest2.prototype._fillElementArray = function(sType) {
		var oElementTestData = {};
		if (["sap.ui.richtexteditor.RichTextEditor",
				"sap.ui.ux3.QuickView",
				"sap.uiext.inbox.SubstitutionRulesManager",
				"sap.ui.codeeditor.CodeEditor"].indexOf(sType) === -1) {
			oElementTestData.type = sType;
			this.aElementEnablementTest.push(new ElementActionDefinitionTest(oElementTestData));
		}
	};


	/**
	 * @return {Promise} A promise providing the test results.
	 * @override
	 */
	LibraryEnablementTest2.prototype.run = function(aLibraries) {
		this._aResult = [];

		this.aElementEnablementTest = [];
		this._aControlsCollection = [];
		var aLoadLibraryPromises = [];

		if (aLibraries.length === 0) {
			var oVersionInfo = sap.ui.getVersionInfo();
			oVersionInfo.libraries.forEach(function(oLib) {
				if (oLib.name.indexOf("sap.ui.server") === -1 &&
						oLib.name.indexOf("themelib_") === -1 &&
						oLib.name.indexOf("sap.ui.dev") === -1 &&
						oLib.name.indexOf("sap.ui.demoapps") === -1 &&
						oLib.name !== "sap.ui.core" &&
						oLib.name !== "sap.ui.fl") {
					aLoadLibraryPromises.push(sap.ui.getCore().loadLibrary(oLib.name, { async: true }));
				}
			});
		} else {
			aLibraries.forEach(function(sLib) {
				aLoadLibraryPromises.push(sap.ui.getCore().loadLibrary(sLib, { async: true }));
			});
		}

		return Promise.all(aLoadLibraryPromises).then(function () {
			var oLoadedLibs = sap.ui.getCore().getLoadedLibraries();
			for (var sLibraryName in oLoadedLibs) {
				if (aLibraries.length > 0 && aLibraries.indexOf(sLibraryName) === -1) {
					continue;
				}
				var oLib = sap.ui.getCore().getLoadedLibraries()[sLibraryName];
				if (oLib && sLibraryName !== "sap.ui.core") {
					var aLibraryControls = oLib.controls;
					var aLibraryElements = oLib.elements;
					var aAllControls = aLibraryControls.concat(aLibraryElements).sort();
					aAllControls.forEach(this._fillElementArray, this);
				}
			}

			var aResults = [];
			var fnIterate = function (mResult) {
				if (mResult && mResult.actions) {
					aResults.push(mResult);
				}
				var oElementEnablementTest = this.aElementEnablementTest.shift();
				if (oElementEnablementTest) {
					return oElementEnablementTest.run().then(function (mResult) {
						oElementEnablementTest.destroy();
						return fnIterate(mResult);
					});
				}

				return Promise.resolve(aResults);
			}.bind(this);


			return fnIterate().then(function (aResults) {
				var mResult = {
					results: []
				};

				aResults.forEach(function (mElementTestResult) {
					mResult.results.push(mElementTestResult);
				});


				return mResult;
			});
		}.bind(this));
	};

	return LibraryEnablementTest2;
}, /* bExport= */ true);