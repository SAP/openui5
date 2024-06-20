/*global QUnit */
sap.ui.define([
	"sap/base/future",
	"sap/ui/core/theming/Parameters",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/Icon",
	"sap/ui/core/Lib",
	"sap/ui/core/Theming",
	"sap/ui/dom/includeStylesheet",
	"sap/m/Bar",
	"sap/ui/thirdparty/URI",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(future, Parameters, Control, Element, Icon, Library, Theming, includeStylesheet, Bar, URI, nextUIUpdate) {
	"use strict";

	QUnit.module("Parmeters.get", {
		before: function() {
			// For some reasons performance.getResourceByType does only return the first 250?!
			// entries therefore clear the resource timings upfront
			performance.clearResourceTimings();
		}
	});

	QUnit.test("InitialCheck", function(assert) {
		assert.ok(Parameters, "sap.ui.core.theming.Parameters must exist");
		assert.ok(Parameters.get, "sap.ui.core.theming.Parameters.get() must exist");
	});

	/**
	 * converts short notation hex color code to long notation
	 * @param {string} input Color string, e.g. #abc
	 * @returns {string} Normalized, 6-hex-digit color string, e.g. #aabbcc
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

	function checkLibraryParametersJsonRequestForLib(sLibNumber) {
		return performance.getEntriesByType("resource").filter(function (oResource) {
			return oResource.name.endsWith("themeParameters/lib" + sLibNumber + "/themes/sap_horizon_hcb/library-parameters.json");
		});
	}
	function createLinkElement (sId, bBase) {
		var sUrl = sap.ui.require.toUrl("test-resources/sap/ui/core/qunit/testdata/libraries/themeParameters/lib17/themes/" + (bBase ? "base" : "sap_horizon_hcb") + "/library.css");
		return includeStylesheet({
			url: sUrl,
			id: bBase ? sId : undefined
		}).then(function () {
			if (bBase) {
				return;
			}
			Array.from(document.querySelectorAll("link")).forEach(function (oLink) {
				if (!oLink.getAttribute("id") && oLink.getAttribute("href") === sUrl) {
					oLink.setAttribute("data-sap-ui-foucmarker", sId);
				}
			});
		});
	}

	QUnit.module("Parmeters.get (async)", {
		before: function() {
			// For some reasons performance.getResourceByType does only return the first 250?!
			// entries therefore clear the resource timings upfront
			performance.clearResourceTimings();
		}
	});

	QUnit.test("Dynamically Loaded Library", function (assert) {
		var done = assert.async();
		assert.equal(Parameters.get({
			name: "sapUiAsyncThemeParamForLib5"
		}), undefined, "'undefined' should be returned for a parameter of a library that currently is not loaded");

		Library.init({
			name: "testlibs.themeParameters.lib5",
			apiVersion: 2
		});

		Parameters.get({
			name: "sapUiAsyncThemeParamForLib5",
			callback: function (sParamValue) {
				assert.equal(sParamValue, "0.5rem", "sapUiAsyncThemeParamForLib5 must be defined as '0.5rem'");
				assert.strictEqual(checkLibraryParametersJsonRequestForLib("5").length, 0, "library-parameters.json not requested for testlibs.themeParameters.lib5");
				done();
			}
		});
	});

	QUnit.test("Read scoped parameters (from testlibs.themeParameters.lib6)", async function(assert) {
		var oControl = new Control(), done = assert.async();

		await Library.load({name: "testlibs.themeParameters.lib6"});

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

	/**
	 * @deprecated
	 */
	QUnit.test("Read multiple given parameters (including undefined param name) (future=false)", async function(assert) {
		future.active = false;
		var done = assert.async();
		var oControl = new Control();
		var aParams = ["sapUiMultipleAsyncThemeParamWithScopeForLib7", "sapUiMultipleAsyncThemeParamWithoutScopeForLib7", "sapUiNotExistingTestParam", "sapUiBaseColor"];
		var oExpected = {
			"sapUiMultipleAsyncThemeParamWithScopeForLib7": "#cccccc",
			"sapUiMultipleAsyncThemeParamWithoutScopeForLib7": "#dddddd",
			"sapUiBaseColor": "#000000"
		};

		await Library.load({name: "testlibs.themeParameters.lib7"});

		oControl.addStyleClass("sapTestScope");

		assert.strictEqual(Parameters.get({
			name: aParams,
			scopeElement: oControl,
			callback: function (oParamResult) {
				aParams.forEach(function(key) {
					if (oParamResult[key]) {
						oParamResult[key] = unifyHexNotation(oParamResult[key]);
					}
				});
				assert.deepEqual(oParamResult, oExpected, "Key-value map for the given params 'sapUiMultipleAsyncThemeParamWithScopeForLib7', 'sapUiMultipleAsyncThemeParamWithoutScopeForLib7' and 'sapUiBaseColor' should be returned");
				assert.strictEqual(checkLibraryParametersJsonRequestForLib("7").length, 0, "library-parameters.json not requested for testlibs.themeParameters.lib7");
				future.active = undefined;
				done();
			}
		}), undefined, "Parameter 'sapUiBaseColor' should already be available but value should be returned in callback.");
	});

	QUnit.test("Read multiple given parameters (including undefined param name) (future=true)", async function (assert) {
		future.active = true;
		var done = assert.async();
		var oControl = new Control();
		var aParams = ["sapUiMultipleAsyncThemeParamWithScopeForLib7", "sapUiMultipleAsyncThemeParamWithoutScopeForLib7", "sapUiNotExistingTestParam", "sapUiBaseColor"];

		await Library.load({ name: "testlibs.themeParameters.lib7" });

		Theming.attachAppliedOnce((oEvent) => {
			oControl.addStyleClass("sapTestScope");

			assert.throws(() => {
				Parameters.get({
					name: aParams,
					scopeElement: oControl,
					callback: function () {
						assert.ok(false, "Callback should not be executed");
					}
				});
			}, new Error("One or more parameters could not be found."), "Throws Error.");
			future.active = undefined;
			done();
		});
	});

	QUnit.test("Call Parameters.get multiple times with same callback function should only be executed once", async function (assert) {
		assert.expect(3);
		var done = assert.async(), callback = function (oParamResult) {
			assert.deepEqual(oParamResult, {
				"sapUiThemeParam1ForLib8": "#123456",
				"sapUiThemeParam2ForLib8": "#654321"
			}, "Callback should be called once with values for the given params 'sapUiThemeParam1ForLib8' and 'sapUiThemeParam2ForLib8'");
			assert.strictEqual(checkLibraryParametersJsonRequestForLib("8").length, 0, "library-parameters.json not requested for testlibs.themeParameters.lib8");
		};

		await Library.load({name: "testlibs.themeParameters.lib8"});

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

	/**
	 * @deprecated
	 */
	QUnit.test("Read not defined parameter using callback (future=false)", async function(assert) {
		future.active = false;
		var done = assert.async();

		await Library.load({name: "testlibs.themeParameters.lib9"});

		Parameters.get({
			name: "sapUiNotExistingTestParam",
			callback: function (oParamResult) {
				assert.deepEqual(oParamResult, undefined, "Value for the given param 'sapUiNotExistingTestParam' does not exist and 'undefined' should be returned");
				assert.strictEqual(checkLibraryParametersJsonRequestForLib("8").length, 0, "library-parameters.json not requested for testlibs.themeParameters.lib9");
				future.active = undefined;
				done();
			}
		});
	});

	QUnit.test("Read not defined parameter using callback (future=true)", async function (assert) {
		future.active = true;
		var done = assert.async();

		await Library.load({ name: "testlibs.themeParameters.lib9" });

		Theming.attachAppliedOnce((oEvent) => {
			assert.throws(() => {
				Parameters.get({
					name: "sapUiNotExistingTestParam",
					callback: function () {
						assert.ok(false, "Callback should not be executed");
					}
				});
			}, new Error("One or more parameters could not be found."), "Throws Error.");
			future.active = undefined;
			done();
		});
	});

	QUnit.test("Read parameter first time from lib which CSS is already loaded shouldn't trigger a library-parameters.json request", async function(assert) {
		var done = assert.async();
		var fnAssertApplied = function() {

			// parameters of base theme should now be present
			assert.equal(getParameterInUnifiedHexNotation("sapUiThemeParam1ForLib10"), "#123321", "sapUiThemeParam1ForLib10 must be defined as '#123321'");
			assert.strictEqual(checkLibraryParametersJsonRequestForLib("10").length, 0, "library-parameters.json not requested for testlibs.themeParameters.lib10");

			Theming.detachApplied(fnAssertApplied);
			done();
		};

		await Library.load({name:"testlibs.themeParameters.lib10"});

		Theming.attachApplied(fnAssertApplied);
	});

	QUnit.test("getActiveScopesFor: Check scope chain for given rendered control", async function(assert) {
		assert.expect(18);
		var done = assert.async();

		var oInnerIcon1 =  new Icon();
		var oInnerIcon2 =  new Icon();
		oInnerIcon2.addStyleClass("TestScope1");
		var oOuterIcon1 =  new Icon();
		var oOuterIcon2 =  new Icon();
		oOuterIcon2.addStyleClass("TestScope1");
		var oInnerBar = new Bar({ contentLeft: [oInnerIcon1, oInnerIcon2] });
		oInnerBar.addStyleClass("TestScope1");
		var oOuterBar = new Bar({ contentLeft: oInnerBar, contentRight: [oOuterIcon1, oOuterIcon2] });
		oOuterBar.addStyleClass("TestScope2"); // No valid TestScope ==> only checking that this is not part of the ScopeChain
		oOuterBar.placeAt("qunit-fixture");

		await nextUIUpdate();

		var fnAssertApplied = function () {
			// CSS is loaded and scope 'TestScope1' is defined therefore different scope chains expected
			assert.deepEqual(Parameters.getActiveScopesFor(oOuterBar, true), [], "OuterBar - no own scope - empty scope chain");
			assert.deepEqual(Parameters.getActiveScopesFor(oInnerBar, true), [["TestScope1"]], "InnerBar - TestScope1 - [['TestScope1']]");
			assert.deepEqual(Parameters.getActiveScopesFor(oOuterIcon1, true), [], "InnerIcon1 - no own scope - empty scope chain");
			assert.deepEqual(Parameters.getActiveScopesFor(oOuterIcon2, true), [["TestScope1"]], "OuterIcon2 - TestScope1 - [['TestScope1']]");
			assert.deepEqual(Parameters.getActiveScopesFor(oInnerIcon1, true), [["TestScope1"]], "InnerIcon1 - no own scope - [['TestScope1']]");
			assert.deepEqual(Parameters.getActiveScopesFor(oInnerIcon2, true), [["TestScope1"], ["TestScope1"]], "InnerIcon2 - TestScope1 - [['TestScope1'], ['TestScope1']]");

			assert.deepEqual(Parameters.get("sapUiThemeParam1ForLib11", oOuterBar), "#111213", "OuterBar - no own scope - default scope value #111213");
			assert.deepEqual(Parameters.get("sapUiThemeParam1ForLib11", oInnerBar), "#312111", "InnerBar - TestScope1 - TestScope1 value #312111");
			assert.deepEqual(Parameters.get("sapUiThemeParam1ForLib11", oOuterIcon1), "#111213", "OuterBar - no own scope - default scope value #111213");
			assert.deepEqual(Parameters.get("sapUiThemeParam1ForLib11", oOuterIcon2), "#312111", "OuterIcon2 - TestScope1 - TestScope1 value #312111");
			assert.deepEqual(Parameters.get("sapUiThemeParam1ForLib11", oInnerIcon1), "#312111", "InnerIcon1 - no own scope - TestScope1 value #312111");
			assert.deepEqual(Parameters.get("sapUiThemeParam1ForLib11", oInnerIcon2), "#312111", "InnerIcon2 - TestScope1 - TestScope1 value #312111");

			oOuterBar.destroy();
			Theming.detachApplied(fnAssertApplied);
			done();
		};

		await Library.load({name: "testlibs.themeParameters.lib11" });

		Theming.attachApplied(fnAssertApplied);

		// No scope in css defined therefore empty scope chain for all combinations
		assert.deepEqual(Parameters.getActiveScopesFor(oOuterBar, true), [], "OuterBar - no own scope - no scope defined ==> empty scope chain");
		assert.deepEqual(Parameters.getActiveScopesFor(oInnerBar, true), [], "InnerBar - TestScope1 - no scope defined ==> empty scope chain");
		assert.deepEqual(Parameters.getActiveScopesFor(oOuterIcon1, true), [], "InnerIcon1 - no own scope - no scope defined ==> empty scope chain");
		assert.deepEqual(Parameters.getActiveScopesFor(oOuterIcon2, true), [], "OuterIcon2 - TestScope1 - no scope defined ==> empty scope chain");
		assert.deepEqual(Parameters.getActiveScopesFor(oInnerIcon1, true), [], "InnerIcon1 - no own scope - no scope defined ==> empty scope chain");
		assert.deepEqual(Parameters.getActiveScopesFor(oInnerIcon2, true), [], "InnerIcon2 - TestScope1 - no scope defined ==> empty scope chain");
	});


	QUnit.test("After Theme Change: Using Parameters.get", async function(assert) {
		var done = assert.async();
		var fnContinue = function(oEvent) {
			if (oEvent.theme === "base") {
				Theming.detachApplied(fnContinue);
				done();
			}
		};

		var fnApplied = async function (oEvent) {
			if (oEvent.theme === "sap_horizon_hcb") {
				Theming.detachApplied(fnApplied);

				await Library.load({name: "testlibs.themeParameters.lib14"});

				Parameters.get({
					name: "sapUiThemeParamForLib14",
					callback: function (oParamResult) {
						assert.deepEqual(oParamResult, "#dfdfdf", "Value for the given param 'sapUiThemeParamForLib14' must be defined as '#dfdfdf' for theme 'base'");
						assert.equal(getParameterInUnifiedHexNotation("sapUiThemeParamForLib13"), "#efefef", "sapUiThemeParamForLib13 must be defined as '#efefef' for theme 'base'");

						Theming.attachApplied(fnContinue);
						Theming.setTheme("sap_horizon_hcb");
					}
				});
				assert.equal(getParameterInUnifiedHexNotation("sapUiThemeParamForLib13"), "#fefefe", "sapUiThemeParamForLib13 must be defined as '#fefefe' for theme 'hcb'");
				Theming.setTheme("base");
			}
		};

		await Library.load({name: "testlibs.themeParameters.lib13"});

		Theming.attachApplied(fnApplied);
	});

	QUnit.test("Get parameter while CSS after Applied finished loading and before ThemeManager processed Applied event", function(assert) {
		var sPrefixedLibId = "sap-ui-theme-testlibs.themeParameters.lib17";

		// Setup
		Parameters.reset();
		var oCssPromise1 = createLinkElement(sPrefixedLibId, true);
		var oCssPromise2 = createLinkElement(sPrefixedLibId, false);
		return Promise.all([oCssPromise1, oCssPromise2]).then(function() {
			assert.strictEqual(Parameters.get({ name: "sapUiThemeParamForLib17" }), "#fafafa", "Parameter 'sapUiThemeParamForLib17' has value: '#fafafa'");

			// Cleanup
			Array.from(document.querySelectorAll("link")).forEach(function (oLink) {
				if (oLink.getAttribute("id") === sPrefixedLibId || oLink.getAttribute("data-sap-ui-foucmarker") === sPrefixedLibId) {
					oLink.remove();
				}
			});
		});
	});

	QUnit.test("Relative URLs in parameters", async function(assert) {

		const sPath = new URI(sap.ui.require.toUrl("testdata/core"), document.baseURI).toString();
		const coreBase1x1Gif = sap.ui.require.toUrl("sap/ui/core/themes/base/img/1x1.gif");

		await Library.load("testlibs.themeParameters.lib4");

		return new Promise((endTest, reject) => {
			Theming.attachApplied(() => {
				const expected = {
					url1: sPath + "/testdata/libraries/themeParameters/lib4/img1.jpg",
					url2: sPath + "/testdata/libraries/themeParameters/lib4/foo/img2.jpg",
					url3: sPath + "/testdata/libraries/themeParameters/lib4/foo/bar/img3.jpg",
					url4: sPath + "/testdata/libraries/themeParameters/lib4/themes/sap_horizon_hcb/",
					url5: sPath + "/testdata/libraries/themeParameters/lib4/themes/sap_horizon_hcb/",
					url6: sPath + "/testdata/libraries/themeParameters/lib4/themes/sap_horizon_hcb/",
					url7: "blob:http://example.com/6e88648c-00e1-4512-9695-5b702d8455b4",
					url8: "data:text/plain;utf-8,foo",
					url9: {
						plain: "none",
						themeImageDefault: coreBase1x1Gif
					}
				};

				const actualPlain = Parameters.get({
					name: ["sapUiThemeParamUrl1", "sapUiThemeParamUrl2", "sapUiThemeParamUrl3",
						   "sapUiThemeParamUrl4", "sapUiThemeParamUrl5", "sapUiThemeParamUrl6",
						   "sapUiThemeParamUrl7", "sapUiThemeParamUrl8", "sapUiThemeParamUrl9"
					]
				});

				// plain values available after library load
				// Result must be in CSS-URL syntax
				assert.equal(actualPlain["sapUiThemeParamUrl1"], "url('" + expected.url1 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/libraries/themeParameters/lib4/img1.jpg'.");
				assert.equal(actualPlain["sapUiThemeParamUrl2"], "url('" + expected.url2 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/libraries/themeParameters/lib4/foo/img2.jpg'.");
				assert.equal(actualPlain["sapUiThemeParamUrl3"], "url('" + expected.url3 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/libraries/themeParameters/lib4/foo/bar/img3.jpg'.");
				assert.equal(actualPlain["sapUiThemeParamUrl4"], "url('" + expected.url4 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/libraries/themeParameters/lib4/themes/sap_horizon_hcb/'.");
				assert.equal(actualPlain["sapUiThemeParamUrl5"], "url('" + expected.url5 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/libraries/themeParameters/lib4/themes/sap_horizon_hcb/'.");
				assert.equal(actualPlain["sapUiThemeParamUrl6"], "url('" + expected.url6 + "')", "Relative URL should be resolved correctly 'sap/ui/core/qunit/testdata/libraries/themeParameters/lib4/themes/sap_horizon_hcb/'.");
				assert.equal(actualPlain["sapUiThemeParamUrl7"], "url('" + expected.url7 + "')", "Relative URL should be resolved correctly 'blob:http://example.com/6e88648c-00e1-4512-9695-5b702d8455b4'.");
				assert.equal(actualPlain["sapUiThemeParamUrl8"], "url('" + expected.url8 + "')", "Relative URL should be resolved correctly 'data:text/plain;utf-8,foo'.");
				assert.equal(actualPlain["sapUiThemeParamUrl9"], expected.url9.plain, "'none' should stay as defined");

				const actualParsed = Parameters.get({
					name: ["sapUiThemeParamUrl1", "sapUiThemeParamUrl2", "sapUiThemeParamUrl3",
						   "sapUiThemeParamUrl4", "sapUiThemeParamUrl5", "sapUiThemeParamUrl6",
						   "sapUiThemeParamUrl7", "sapUiThemeParamUrl8"
					],
					_restrictedParseUrls: true
				});

				// Additional parsing of CSS-URLs
				// Result must be identical wrt. to the original URLs (s.a.)
				assert.equal(actualParsed["sapUiThemeParamUrl1"], expected.url1, "Theme Image value should be correct for 'sapUiThemeParamUrl1'.");
				assert.equal(actualParsed["sapUiThemeParamUrl2"], expected.url2, "Theme Image value should be correct for 'sapUiThemeParamUrl2'.");
				assert.equal(actualParsed["sapUiThemeParamUrl3"], expected.url3, "Theme Image value should be correct for 'sapUiThemeParamUrl3'.");
				assert.equal(actualParsed["sapUiThemeParamUrl4"], expected.url4, "Theme Image value should be correct for 'sapUiThemeParamUrl4'.");
				assert.equal(actualParsed["sapUiThemeParamUrl5"], expected.url5, "Theme Image value should be correct for 'sapUiThemeParamUrl5'.");
				assert.equal(actualParsed["sapUiThemeParamUrl6"], expected.url6, "Theme Image value should be correct for 'sapUiThemeParamUrl6'.");
				assert.equal(actualParsed["sapUiThemeParamUrl7"], expected.url7, "Theme Image value should be correct for 'sapUiThemeParamUrl7'.");
				assert.equal(actualParsed["sapUiThemeParamUrl8"], expected.url8, "Theme Image value should be correct for 'sapUiThemeParamUrl8'.");

				// Value 'none' is parsed to <undefined>, which leads to the default value
				const actualParsedWithDefaults = Object.assign({
					"sapUiThemeParamUrl9": coreBase1x1Gif
				}, Parameters.get({
					name: ["sapUiThemeParamUrl9"],
					_restrictedParseUrls: true
				}));

				assert.equal(actualParsedWithDefaults["sapUiThemeParamUrl9"], expected.url9.themeImageDefault, "Theme Image value should be 'sap/ui/core/themes/base/img/1x1.gif' for parameter value 'none'.");

				// No sync XHR, since we wait for the Library to load and the theme-applied event
				assert.strictEqual(checkLibraryParametersJsonRequestForLib("4").length, 0, "library-parameters.json requested once for testlibs.themeParameters.lib4");

				endTest();
			});
		});
	});
});
