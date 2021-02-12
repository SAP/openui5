/*global QUnit, URI*/
sap.ui.define(["sap/ui/core/theming/Parameters", "sap/ui/core/Control", "sap/ui/core/Element"], function(Parameters, Control, Element) {
	"use strict";

	QUnit.module("Parmeters.get");

	var sPath = new URI(sap.ui.require.toUrl("testdata/core"), document.baseURI).toString();

	QUnit.test("InitialCheck", function(assert) {
		assert.ok(Parameters, "sap.ui.core.theming.Parameters must exist");
		assert.ok(Parameters.get, "sap.ui.core.theming.Parameters.get() must exist");
	});

	/**
	 * converts short notation hex color code to long notation
	 * @param input, e.g. #abc
	 * @returns {string}, e.g. #aabbcc
	 */
	function unifyHexNotation(input) {
		if (input.length === 4) {
			var colorShortNotationRegexp = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			var sResult = colorShortNotationRegexp.exec(input);
			if (sResult) {
				return "#" + sResult[1] + sResult[1] + sResult[2] + sResult[2] + sResult[3] + sResult[3];
			}
		}
		return input;
	}

	function getParameterInUnifiedHexNotation(key, oElement) {
		var sParameter = Parameters.get(key, oElement);
		if (sParameter) {
			return unifyHexNotation(sParameter);
		}
		return sParameter;
	}

	function getParametersInUnifiedHexNotation(aKeys, oElement) {
		var oParameters = Parameters.get(aKeys, oElement);
		if (oParameters) {
			aKeys.forEach(function(key) {
				if (oParameters[key]) {
					oParameters[key] = unifyHexNotation(oParameters[key]);
				}
			});
		}
		return oParameters;
	}

	function checkLibraryParametersJsonRequestForLib(sLibNumber) {
		return window.performance.getEntriesByType("resource").filter(function (oResource) {
			return oResource.name.endsWith("themeParameters/lib" + sLibNumber + "/themes/sap_hcb/library-parameters.json");
		});
	}

	QUnit.test("Read single parameters", function(assert) {
		/* HCB theme was chosen because:
		 *  1. it should be quite stable in general
		 *  2. background and text color are defined by design and thus even less likely to change
		 *  3. it should be reliably there for accessibility reasons
		 *  4. text and background color differ from the base theme
		 */
		assert.equal(getParameterInUnifiedHexNotation("sapUiText"), "#ffffff", "sapUiText must be defined as 'white - #ffffff'");
		assert.equal(getParameterInUnifiedHexNotation("sapUiExtraLightBG"), "#000000", "sapUiExtraLightBG must be defined as black '#000000'");

		// Read parameters of legacy library-parameters.json format
		assert.equal(Parameters.get("sapUiLegacyTstTextColor"), "#fafafa", "sapUiLegacyTstTextColor must be defined as '#fafafa'");
		assert.equal(getParameterInUnifiedHexNotation("sapUiLegacyText"), "#ffffff", "sapUiLegacyText must be defined as '#ffffff'");
	});

	QUnit.test("Undefined parameter", function(assert) {
		assert.equal(Parameters.get("thisParameterNameMayNeverExist"), undefined, "'undefined' should be returned for unknown parameter names");
	});

	QUnit.test("Invalid parameter", function(assert) {
		assert.equal(Parameters.get(null), undefined, "'undefined' should be returned for 'null' parameter name");
	});

	QUnit.test("All parameters", function(assert) {
		var mAllParams = Parameters.get();
		assert.ok(mAllParams, "A map of parameters should be returned when get is called without parameter name");

		var count = 0;
		for (var property in mAllParams) {
			assert.equal(typeof mAllParams[property], "string", "Parameter '" + property + "' should be a string");
			count++;
		}
		assert.ok(count > 10, "The map of parameters should have quite some entries");
	});

	QUnit.test("Parameter from Unknown Library", function(assert) {
		assert.equal(Parameters.get("sapUiTstTextColor"), undefined, "'undefined' should be returned for a parameter of a library that currently is not loaded");
	});

	QUnit.test("After Theme Change", function(assert) {
		var done = assert.async();
		var fnContinue = function() {
			sap.ui.getCore().detachThemeChanged(fnContinue);
			done();
		};
		var fnAssertThemeChanged = function() {

			// parameters of base theme should now be present
			assert.equal(getParameterInUnifiedHexNotation("sapUiText"), "#000000", "sapUiText must be defined as 'black - #000000'");
			assert.equal(getParameterInUnifiedHexNotation("sapUiExtraLightBG"), "#ffffff", "sapUiExtraLightBG must be defined as 'white - #ffffff'");

			sap.ui.getCore().detachThemeChanged(fnAssertThemeChanged);
			sap.ui.getCore().attachThemeChanged(fnContinue);
			sap.ui.getCore().applyTheme("sap_hcb");
		};

		sap.ui.getCore().attachThemeChanged(fnAssertThemeChanged);
		sap.ui.getCore().applyTheme("base");
	});

	QUnit.test("Dynamically Loaded Library", function(assert) {

		function getStyleId(i) {
			return "style" + (i + 1);
		}

		// include 40 stylesheets to test IE9 stylesheet limit
		var iNewStylesheets = 40;
		var sStyleBaseUrl = "test-resources/sap/ui/core/qunit/testdata/stylesheets/";
		var i;
		for (i = 0; i < iNewStylesheets; i++) {
			var sStyleId = getStyleId(i);
			jQuery.sap.includeStyleSheet(sStyleBaseUrl + sStyleId + '.css', sStyleId);
		}

		sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib1");
		assert.equal(Parameters.get("sapUiThemeParamForLib1"), "#fafafa", "parameter for newly loaded library should be known now");

		assert.strictEqual(checkLibraryParametersJsonRequestForLib("1").length, 1, "library-parameters.json requested once for testlibs.themeParameters.lib1");
	});

	QUnit.test("Read scoped parameters (from testlibs.themeParameters.lib2)", function(assert) {
		var oControl = new Control();

		sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib2");

		assert.equal(Parameters.get("sapUiThemeParamWithScopeForLib2", oControl), "#fbfbfb",
			"No scope set - default value should get returned");

		oControl.addStyleClass("sapTestScope");

		assert.equal(getParameterInUnifiedHexNotation("sapUiThemeParamWithScopeForLib2", oControl), "#000000",
			"Scope set directly on control - scoped param should be returned");
		assert.equal(getParameterInUnifiedHexNotation("sapUiThemeParamWithoutScopeForLib2", oControl), "#ffffff",
			"Scope set directly on control but no scoped value defined - default value should get returned");

		oControl.removeStyleClass("sapTestScope");
		var oParent = new Control();
		oParent.addStyleClass("sapTestScope");
		oControl.setParent(oParent);

		assert.equal(getParameterInUnifiedHexNotation("sapUiThemeParamWithScopeForLib2", oControl), "#000000",
			"Scope set on parent control - scoped param should be returned");
		assert.equal(getParameterInUnifiedHexNotation("sapUiThemeParamWithoutScopeForLib2", oControl), "#ffffff",
			"Scope set on parent control but no scoped value defined - default value should get returned");

			assert.strictEqual(checkLibraryParametersJsonRequestForLib("2").length, 1, "library-parameters.json requested once for testlibs.themeParameters.lib2");
	});

	QUnit.test("Read scoped parameters (error handling)", function(assert) {
		var oElement = new Element();

		sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib3");

		assert.equal(Parameters.get("sapUiThemeParamWithScopeForLib3", oElement), "#fcfcfc",
			"No scope set - default value should get returned");

		assert.equal(Parameters.get("sapUiThemeParamWithScopeForLib3", null), "#fcfcfc",
			"'null' value provided as 'oControl' - default value should get returned");

		assert.equal(Parameters.get("sapUiThemeParamWithScopeForLib3", {}), "#fcfcfc",
			"'{}' value provided as 'oControl' - default value should get returned");

		var oParent = new Control();
		oParent.addStyleClass("sapTestScope");
		oElement.setParent(oParent);

		assert.equal(getParameterInUnifiedHexNotation("sapUiThemeParamWithScopeForLib3", oElement), "#111111",
			"Scope set on parent control - scoped param should be returned");

		assert.strictEqual(checkLibraryParametersJsonRequestForLib("3").length, 1, "library-parameters.json requested once for testlibs.themeParameters.lib3");
	});

	QUnit.test("Read multiple given parameters", function(assert) {
		var aParams = ["sapUiThemeParamWithScopeForLib2", "sapUiThemeParamWithoutScopeForLib2"];
		var oExpected = {
			"sapUiThemeParamWithScopeForLib2": "#fbfbfb",
			"sapUiThemeParamWithoutScopeForLib2": "#ffffff"
		};

		// Only relevant for single test execution
		if (!sap.ui.getCore().getLoadedLibraries()["testlibs.themeParameters.lib2"]) {
			sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib2");
		}

		var oParamResult = getParametersInUnifiedHexNotation(aParams);

		assert.deepEqual(oParamResult, oExpected,
			"Key-value map for the given params 'sapUiThemeParamWithScopeForLib2' and 'sapUiThemeParamWithoutScopeForLib2' should be returned");
	});

	QUnit.test("Read multiple given parameters and Element", function(assert) {
		var oElement = new Element();
		var oParent = new Control();

		// Only relevant for single test execution
		if (!sap.ui.getCore().getLoadedLibraries()["testlibs.themeParameters.lib2"]) {
			sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib2");
		}

		oParent.addStyleClass("sapTestScope");
		oElement.setParent(oParent);

		var aParams = ["sapUiThemeParamWithScopeForLib2", "sapUiThemeParamWithoutScopeForLib2"];
		var oExpected = {
			"sapUiThemeParamWithScopeForLib2": "#000000",
			"sapUiThemeParamWithoutScopeForLib2": "#ffffff"
		};

		var oParamResult = getParametersInUnifiedHexNotation(aParams, oElement);

		assert.deepEqual(oParamResult, oExpected,
			"Key-value map for the given params 'sapUiThemeParamWithScopeForLib2' and 'sapUiThemeParamWithoutScopeForLib2' should be returned");
	});

	QUnit.test("Read multiple given parameters (including undefined param name)", function(assert) {
		var aParams = ["sapUiThemeParamWithScopeForLib2", "sapUiThemeParamWithoutScopeForLib2", "sapUiThemeParamDoesNotExistForLib2"];
		var oExpected = {
			"sapUiThemeParamWithScopeForLib2": "#fbfbfb",
			"sapUiThemeParamWithoutScopeForLib2": "#ffffff",
			"sapUiThemeParamDoesNotExistForLib2": undefined
		};

		// Only relevant for single test execution
		if (!sap.ui.getCore().getLoadedLibraries()["testlibs.themeParameters.lib2"]) {
			sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib2");
		}

		var oParamResult = getParametersInUnifiedHexNotation(aParams);

		assert.deepEqual(oParamResult, oExpected,
			"Key-value map for the given params 'sapUiThemeParamWithScopeForLib2' and 'sapUiThemeParamWithoutScopeForLib2' should be returned");
	});

	QUnit.test("Relative URLs in parameters", function(assert) {

		sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib4");

		var expected = {
			url1: sPath + "/testdata/libraries/themeParameters/lib4/img1.jpg",
			url2: sPath + "/testdata/libraries/themeParameters/lib4/foo/img2.jpg",
			url3: sPath + "/testdata/libraries/themeParameters/lib4/foo/bar/img3.jpg",
			url4: sPath + "/testdata/libraries/themeParameters/lib4/themes/sap_hcb/",
			url5: sPath + "/testdata/libraries/themeParameters/lib4/themes/sap_hcb/",
			url6: sPath + "/testdata/libraries/themeParameters/lib4/themes/sap_hcb/",
			url7: "blob:http://example.com/6e88648c-00e1-4512-9695-5b702d8455b4",
			url8: "data:text/plain;utf-8,foo",
			url9: {
				plain: "none",
				themeImage: null,
				themeImageForce: sap.ui.resource("sap.ui.core", "themes/base/img/1x1.gif")
			}
		};

		// plain values
		assert.equal(Parameters.get("sapUiThemeParamUrl1"), "url('" + expected.url1 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/libraries/themeParameters/lib4/img1.jpg'.");
		assert.equal(Parameters.get("sapUiThemeParamUrl2"), "url('" + expected.url2 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/libraries/themeParameters/lib4/foo/img2.jpg'.");
		assert.equal(Parameters.get("sapUiThemeParamUrl3"), "url('" + expected.url3 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/libraries/themeParameters/lib4/foo/bar/img3.jpg'.");
		assert.equal(Parameters.get("sapUiThemeParamUrl4"), "url('" + expected.url4 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/libraries/themeParameters/lib4/themes/sap_hcb/'.");
		assert.equal(Parameters.get("sapUiThemeParamUrl5"), "url('" + expected.url5 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/libraries/themeParameters/lib4/themes/sap_hcb/'.");
		assert.equal(Parameters.get("sapUiThemeParamUrl6"), "url('" + expected.url6 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/libraries/themeParameters/lib4/themes/sap_hcb/'.");
		assert.equal(Parameters.get("sapUiThemeParamUrl7"), "url('" + expected.url7 + "')", "Relative URL should be resolved correctly 'blob:http://example.com/6e88648c-00e1-4512-9695-5b702d8455b4'.");
		assert.equal(Parameters.get("sapUiThemeParamUrl8"), "url('" + expected.url8 + "')", "Relative URL should be resolved correctly 'data:text/plain;utf-8,foo'.");
		assert.equal(Parameters.get("sapUiThemeParamUrl9"), expected.url9.plain, "'none' should stay as defined");

		// _getThemeImage
		assert.equal(Parameters._getThemeImage("sapUiThemeParamUrl1"), expected.url1, "Theme Image value should be correct for 'sapUiThemeParamUrl1'.");
		assert.equal(Parameters._getThemeImage("sapUiThemeParamUrl2"), expected.url2, "Theme Image value should be correct for 'sapUiThemeParamUrl2'.");
		assert.equal(Parameters._getThemeImage("sapUiThemeParamUrl3"), expected.url3, "Theme Image value should be correct for 'sapUiThemeParamUrl3'.");
		assert.equal(Parameters._getThemeImage("sapUiThemeParamUrl4"), expected.url4, "Theme Image value should be correct for 'sapUiThemeParamUrl4'.");
		assert.equal(Parameters._getThemeImage("sapUiThemeParamUrl5"), expected.url5, "Theme Image value should be correct for 'sapUiThemeParamUrl5'.");
		assert.equal(Parameters._getThemeImage("sapUiThemeParamUrl6"), expected.url6, "Theme Image value should be correct for 'sapUiThemeParamUrl6'.");
		assert.equal(Parameters._getThemeImage("sapUiThemeParamUrl7"), expected.url7, "Theme Image value should be correct for 'sapUiThemeParamUrl7'.");
		assert.equal(Parameters._getThemeImage("sapUiThemeParamUrl8"), expected.url8, "Theme Image value should be correct for 'sapUiThemeParamUrl8'.");
		assert.equal(Parameters._getThemeImage("sapUiThemeParamUrl9"), expected.url9.themeImage, "Theme Image value should be 'null' for parameter value 'none'.");
		assert.equal(Parameters._getThemeImage("sapUiThemeParamUrl9", true), expected.url9.themeImageForce, "Theme Image value should be 'sap/ui/core/themes/base/img/1x1.gif' for parameter value 'none' (force).");

		assert.strictEqual(checkLibraryParametersJsonRequestForLib("4").length, 1, "library-parameters.json requested once for testlibs.themeParameters.lib4");
	});

	QUnit.test("Relative URLs in parameters (legacy library)", function(assert) {

		var expected = {
			url1: sPath + "/testdata/legacy-uilib/img1.jpg",
			url2: {
				plain: "none",
				themeImage: null,
				themeImageForce: sap.ui.resource("sap.ui.core", "themes/base/img/1x1.gif")
			}
		};

		// plain values
		assert.equal(Parameters.get("sapUiLegacyTestUrl1"), "url('" + expected.url1 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/uilib/img1.jpg'.");
		assert.equal(Parameters.get("sapUiLegacyTestUrl2"), expected.url2.plain, "'none' should stay as defined");

		// _getThemeImage
		assert.equal(Parameters._getThemeImage("sapUiLegacyTestUrl1"), expected.url1, "Theme Image value should be correct for 'sapUiLegacyTestUrl1'.");
		assert.equal(Parameters._getThemeImage("sapUiLegacyTestUrl2"), expected.url2.themeImage, "Theme Image value should be 'null' for parameter value 'none'.");
		assert.equal(Parameters._getThemeImage("sapUiLegacyTestUrl2", true), expected.url2.themeImageForce, "Theme Image value should be 'sap/ui/core/themes/base/img/1x1.gif' for parameter value 'none' (force).");

	});

	QUnit.test("Dynamically Loaded Library (async)", function (assert) {
		var done = assert.async();
		assert.equal(Parameters.get({
			name: "sapUiAsyncThemeParamForLib5"
		}), undefined, "'undefined' should be returned for a parameter of a library that currently is not loaded");

		sap.ui.getCore().initLibrary({ name: "testlibs.themeParameters.lib5" });

		Parameters.get({
			name: "sapUiAsyncThemeParamForLib5",
			callback: function (sParamValue) {
				assert.equal(sParamValue, "0.5rem", "sapUiAsyncThemeParamForLib5 must be defined as '0.5rem'");
				assert.strictEqual(checkLibraryParametersJsonRequestForLib("5").length, 0, "library-parameters.json not requested for testlibs.themeParameters.lib5");
				done();
			}
		});
	});

	QUnit.test("Read scoped parameters (async from testlibs.themeParameters.lib6)", function(assert) {
		var oControl = new Control(), done = assert.async();

		sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib6");

		Parameters.get({
			name: "sapUiAsyncThemeParamWithScopeForLib6",
			scopeElement: oControl,
			callback: function (sParamValue) {
				assert.equal(sParamValue, "#ababab", "No scope set - default value should get returned");
				oControl.addStyleClass("sapTestScope");

				assert.equal(Parameters.get({
					name: "sapUiAsyncThemeParamWithScopeForLib6",
					scopeElement: oControl
				}), "#222222", "Scope set directly on control - scoped param should be returned");

				assert.equal(Parameters.get({
					name: "sapUiAsyncThemeParamWithoutScopeForLib6",
					scopeElement: oControl
				}), "#aaaaaa", "Scope set directly on control but no scoped value defined - default value should get returned");

				assert.strictEqual(checkLibraryParametersJsonRequestForLib("6").length, 0, "library-parameters.json not requested for testlibs.themeParameters.lib6");

				done();
			}
		});
	});

	QUnit.test("Read multiple given parameters (async including undefined param name)", function(assert) {
		var done = assert.async();
		var oControl = new Control();
		var aParams = ["sapUiMultipleAsyncThemeParamWithScopeForLib7", "sapUiMultipleAsyncThemeParamWithoutScopeForLib7", "sapUiNotExistingTestParam", "sapHighlightColor"];
		var oExpected = {
			"sapUiMultipleAsyncThemeParamWithScopeForLib7": "#cccccc",
			"sapUiMultipleAsyncThemeParamWithoutScopeForLib7": "#dddddd",
			"sapHighlightColor": "#cc8700"
		};

		sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib7");
		oControl.addStyleClass("sapTestScope");

		assert.strictEqual(Parameters.get({
			name: aParams,
			scopeElement: oControl,
			callback: function (oParamResult) {
				assert.deepEqual(oParamResult, oExpected, "Key-value map for the given params 'sapUiMultipleAsyncThemeParamWithScopeForLib7', 'sapUiMultipleAsyncThemeParamWithoutScopeForLib7' and 'sapHighlightColor' should be returned");
				assert.strictEqual(checkLibraryParametersJsonRequestForLib("7").length, 0, "library-parameters.json not requested for testlibs.themeParameters.lib7");
				done();
			}
		}), undefined, "Parameter 'sapHighlightColor' should already be available but value should be returned in callback.");
	});

	QUnit.test("Call Parameters.get multiple times with same callback function should only be executed once", function (assert) {
		assert.expect(3);
		var done = assert.async(), callback = function (oParamResult) {
			assert.deepEqual(oParamResult, {
				"sapUiThemeParam1ForLib8": "#123456",
				"sapUiThemeParam2ForLib8": "#654321"
			}, "Callback should be called once with values for the given params 'sapUiThemeParam1ForLib8' and 'sapUiThemeParam2ForLib8'");
			assert.strictEqual(checkLibraryParametersJsonRequestForLib("8").length, 0, "library-parameters.json not requested for testlibs.themeParameters.lib8");
		};

		sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib8");

		Parameters.get({
			name: "sapUiThemeParam1ForLib8",
			callback: callback
		});

		Parameters.get({
			name: ["sapUiThemeParam1ForLib8", "sapUiThemeParam2ForLib8"],
			callback: callback
		});

		Parameters.get({
			name: "sapUiThemeParam2ForLib8",
			callback: function (sParamResult) {
				assert.strictEqual(sParamResult, "#654321", "Different callback function should be called once with value for the given param 'sapUiThemeParam2ForLib8' should be returned");
				done();
			}
		});
	});

	QUnit.test("Read not defined parameter using callback", function(assert) {
		var done = assert.async();

		sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib9");

		Parameters.get({
			name: "sapUiNotExistingTestParam",
			callback: function (oParamResult) {
				assert.deepEqual(oParamResult, undefined, "Value for the given param 'sapUiNotExistingTestParam' does not exist and 'undefined' should be returned");
				assert.strictEqual(checkLibraryParametersJsonRequestForLib("8").length, 0, "library-parameters.json not requested for testlibs.themeParameters.lib9");
				done();
			}
		});
	});

	QUnit.test("Read parameter first time from lib which CSS is already loaded shouldn't trigger a library-parameters.json request", function(assert) {
		var done = assert.async();
		var fnAssertThemeChanged = function() {

			// parameters of base theme should now be present
			assert.equal(getParameterInUnifiedHexNotation("sapUiThemeParam1ForLib10"), "#123321", "sapUiText must be defined as '#123321'");
			assert.strictEqual(checkLibraryParametersJsonRequestForLib("10").length, 0, "library-parameters.json not requested for testlibs.themeParameters.lib10");

			sap.ui.getCore().detachThemeChanged(fnAssertThemeChanged);
			done();
		};

		sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib10");

		sap.ui.getCore().attachThemeChanged(fnAssertThemeChanged);
	});
});