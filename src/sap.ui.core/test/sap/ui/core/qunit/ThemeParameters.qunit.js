/*global QUnit, URI*/
sap.ui.define(["sap/ui/core/theming/Parameters", "sap/ui/core/Control", "sap/ui/core/Element"], function(Parameters, Control, Element) {
	"use strict";

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

		sap.ui.getCore().loadLibrary("sap.ui.testlib");
		assert.equal(Parameters.get("sapUiTstTextColor"), "#fafafa", "parameter for newly loaded library should be known now");
	});

	QUnit.test("Read scoped parameters (from sap.ui.testlib)", function(assert) {
		var oControl = new Control();

		assert.equal(Parameters.get("sapUiTstTextColor", oControl), "#fafafa",
			"No scope set - default value should get returned");

		oControl.addStyleClass("sapTestScope");

		assert.equal(getParameterInUnifiedHexNotation("sapUiTstTextColor", oControl), "#000000",
			"Scope set directly on control - scoped param should be returned");
		assert.equal(getParameterInUnifiedHexNotation("sapUiColor", oControl), "#ffffff",
			"Scope set directly on control but no scoped value defined - default value should get returned");

		oControl.removeStyleClass("sapTestScope");
		var oParent = new Control();
		oParent.addStyleClass("sapTestScope");
		oControl.setParent(oParent);

		assert.equal(getParameterInUnifiedHexNotation("sapUiTstTextColor", oControl), "#000000",
			"Scope set on parent control - scoped param should be returned");
		assert.equal(getParameterInUnifiedHexNotation("sapUiText", oControl), "#000000",
			"Scope set on parent control but no scoped value defined - default value should get returned");

	});

	QUnit.test("Read scoped parameters (error handling)", function(assert) {
		var oElement = new Element();

		assert.equal(Parameters.get("sapUiTstTextColor", oElement), "#fafafa",
			"No scope set - default value should get returned");

		assert.equal(Parameters.get("sapUiTstTextColor", null), "#fafafa",
			"'null' value provided as 'oControl' - default value should get returned");

		assert.equal(Parameters.get("sapUiTstTextColor", {}), "#fafafa",
			"'{}' value provided as 'oControl' - default value should get returned");

		var oParent = new Control();
		oParent.addStyleClass("sapTestScope");
		oElement.setParent(oParent);

		assert.equal(getParameterInUnifiedHexNotation("sapUiTstTextColor", oElement), "#000000",
			"Scope set on parent control - scoped param should be returned");

	});

	QUnit.test("Read multiple given parameters", function(assert) {
		var aParams = ["sapUiTstTextColor", "sapUiText"];
		var oExpected = {
			"sapUiTstTextColor": "#fafafa",
			"sapUiText": "#ffffff"
		};

		var oParamResult = getParametersInUnifiedHexNotation(aParams);

		assert.deepEqual(oParamResult, oExpected,
			"Key-value map for the given params 'sapUiTstTextColor' and 'sapUiText' should be returned");
	});

	QUnit.test("Read multiple given parameters and Element", function(assert) {
		var oElement = new Element();
		var oParent = new Control();

		oParent.addStyleClass("sapTestScope");
		oElement.setParent(oParent);

		var aParams = ["sapUiTstTextColor", "sapUiText"];
		var oExpected = {
			"sapUiTstTextColor": "#000000",
			"sapUiText": "#000000"
		};

		var oParamResult = getParametersInUnifiedHexNotation(aParams, oElement);

		assert.deepEqual(oParamResult, oExpected,
			"Key-value map for the given params 'sapUiTstTextColor' and 'sapUiText' should be returned");
	});

	QUnit.test("Read multiple given parameters (including undefined param name)", function(assert) {
		var aParams = ["sapUiTstTextColor", "sapUiText", "sapUiTestParam"];
		var oExpected = {
			"sapUiTstTextColor": "#fafafa",
			"sapUiText": "#ffffff",
			"sapUiTestParam": undefined
		};

		var oParamResult = getParametersInUnifiedHexNotation(aParams);

		assert.deepEqual(oParamResult, oExpected,
			"Key-value map for the given params 'sapUiTstTextColor' and 'sapUiText' should be returned");
	});

	QUnit.test("Relative URLs in parameters", function(assert) {

		var expected = {
			url1: sPath + "/testdata/uilib/img1.jpg",
			url2: sPath + "/testdata/uilib/foo/img2.jpg",
			url3: sPath + "/testdata/uilib/foo/bar/img3.jpg",
			url4: sPath + "/testdata/uilib/themes/sap_hcb/",
			url5: sPath + "/testdata/uilib/themes/sap_hcb/",
			url6: sPath + "/testdata/uilib/themes/sap_hcb/",
			url7: "blob:http://example.com/6e88648c-00e1-4512-9695-5b702d8455b4",
			url8: "data:text/plain;utf-8,foo",
			url9: {
				plain: "none",
				themeImage: null,
				themeImageForce: sap.ui.resource("sap.ui.core", "themes/base/img/1x1.gif")
			}
		};

		// plain values
		assert.equal(Parameters.get("sapUiTestUrl1"), "url('" + expected.url1 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/uilib/img1.jpg'.");
		assert.equal(Parameters.get("sapUiTestUrl2"), "url('" + expected.url2 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/uilib/foo/img2.jpg'.");
		assert.equal(Parameters.get("sapUiTestUrl3"), "url('" + expected.url3 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/uilib/foo/bar/img3.jpg'.");
		assert.equal(Parameters.get("sapUiTestUrl4"), "url('" + expected.url4 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/uilib/themes/sap_hcb/'.");
		assert.equal(Parameters.get("sapUiTestUrl5"), "url('" + expected.url5 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/uilib/themes/sap_hcb/'.");
		assert.equal(Parameters.get("sapUiTestUrl6"), "url('" + expected.url6 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/uilib/themes/sap_hcb/'.");
		assert.equal(Parameters.get("sapUiTestUrl7"), "url('" + expected.url7 + "')", "Relative URL should be resolved correctly 'blob:http://example.com/6e88648c-00e1-4512-9695-5b702d8455b4'.");
		assert.equal(Parameters.get("sapUiTestUrl8"), "url('" + expected.url8 + "')", "Relative URL should be resolved correctly 'data:text/plain;utf-8,foo'.");
		assert.equal(Parameters.get("sapUiTestUrl9"), expected.url9.plain, "'none' should stay as defined");

		// _getThemeImage
		assert.equal(Parameters._getThemeImage("sapUiTestUrl1"), expected.url1, "Theme Image value should be correct for 'sapUiTestUrl1'.");
		assert.equal(Parameters._getThemeImage("sapUiTestUrl2"), expected.url2, "Theme Image value should be correct for 'sapUiTestUrl2'.");
		assert.equal(Parameters._getThemeImage("sapUiTestUrl3"), expected.url3, "Theme Image value should be correct for 'sapUiTestUrl3'.");
		assert.equal(Parameters._getThemeImage("sapUiTestUrl4"), expected.url4, "Theme Image value should be correct for 'sapUiTestUrl4'.");
		assert.equal(Parameters._getThemeImage("sapUiTestUrl5"), expected.url5, "Theme Image value should be correct for 'sapUiTestUrl5'.");
		assert.equal(Parameters._getThemeImage("sapUiTestUrl6"), expected.url6, "Theme Image value should be correct for 'sapUiTestUrl6'.");
		assert.equal(Parameters._getThemeImage("sapUiTestUrl7"), expected.url7, "Theme Image value should be correct for 'sapUiTestUrl7'.");
		assert.equal(Parameters._getThemeImage("sapUiTestUrl8"), expected.url8, "Theme Image value should be correct for 'sapUiTestUrl8'.");
		assert.equal(Parameters._getThemeImage("sapUiTestUrl9"), expected.url9.themeImage, "Theme Image value should be 'null' for parameter value 'none'.");
		assert.equal(Parameters._getThemeImage("sapUiTestUrl9", true), expected.url9.themeImageForce, "Theme Image value should be 'sap/ui/core/themes/base/img/1x1.gif' for parameter value 'none' (force).");

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
});