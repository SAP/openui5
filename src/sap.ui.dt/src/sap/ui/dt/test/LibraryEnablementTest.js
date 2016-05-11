/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.test.LibraryEnablementTest.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/test/Test',
	'sap/ui/dt/test/ElementEnablementTest'
],
function(jQuery, Test, ElementEnablementTest) {
	"use strict";


	/**
	 * Constructor for an LibraryEnablementTest.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The LibraryEnablementTest class allows to create a design time test
	 * which tests a given library on compatibility with the sap.ui.dt.DesignTime.
	 * @extends sap.ui.dt.test.Test
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.ui.dt.test.LibraryEnablementTest
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var LibraryEnablementTest = Test.extend("sap.ui.dt.test.LibraryEnablementTest", /** @lends sap.ui.dt.test.LibraryEnablementTest.prototype */ {
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				libraryName : {
					type : "string"
				},
				testData : {
					type : "object"
				}
			}
		}
	});


	/**
	 * @return {Promise} A promise providing the test results.
	 * @override
	 */
	LibraryEnablementTest.prototype.run = function() {
		var that = this;
		this._aResult = [];
		var oTestData = this.getTestData() || {};
		var sLibraryName = this.getLibraryName();
		var aElementEnablementTest = [];
		var oLib = sap.ui.getCore().getLoadedLibraries()[sLibraryName];
		if (oLib) {
			var aLibraryControls = oLib.controls;
			aLibraryControls.forEach(function(sType) {
				var oElementTestData = oTestData[sType];
				if (!oElementTestData && oElementTestData !== false) {
					oElementTestData = {};
				}

				if (oElementTestData !== false) {
					oElementTestData.type = sType;
					var oElementEnablementTest = new ElementEnablementTest(oElementTestData);
					aElementEnablementTest.push(oElementEnablementTest);
				}
			});
		}

		var aResults = [];
		var fnIterate = function(mResult) {
			if (mResult) {
				aResults.push(mResult);
			}
			var oElementEnablementTest = aElementEnablementTest.shift();
			if (oElementEnablementTest) {
				return oElementEnablementTest.run().then(function(mResult) {
					oElementEnablementTest.destroy();
					return fnIterate(mResult);
				});
			} else {
				return Promise.resolve(aResults);
			}
		};


		return fnIterate().then(function(aResults) {
			var mResult = that.createSuite("Library Enablement Test");

			aResults.forEach(function(mElementTestResult) {
				mResult.children.push(mElementTestResult.children[0]);
			});

			mResult = that.aggregate(mResult);

			return mResult;
		});


	};

	return LibraryEnablementTest;
}, /* bExport= */ true);