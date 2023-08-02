/* global QUnit, sinon, globalThis */

sap.ui.define([
	"sap/base/config",
	"sap/base/Event",
	"sap/ui/base/config/URLConfigurationProvider",
	"sap/ui/core/Theming",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function (
	BaseConfig,
	BaseEvent,
	URLConfigurationProvider,
	Theming,
	themeApplied
) {
	"use strict";

	var oURLConfigurationProviderStub,
		mConfigStubValues,
		mEventCalls,
		bThemeManagerNotActive = !!globalThis["sap-ui-test-config"].themeManagerNotActive;

	function checkChange(oEvent) {
		mEventCalls.aChange.push(BaseEvent.getParameters(oEvent));
	}

	function checkApplied(oEvent) {
		mEventCalls.aApplied.push(BaseEvent.getParameters(oEvent));
	}

	function fnAssert(sTheme, aChangeEvents, aAppliedEvents) {
		// Always wait for possible themeApplied
		aChangeEvents = aChangeEvents || [];
		aAppliedEvents = aAppliedEvents || [];
		QUnit.assert.strictEqual(Theming.getTheme(), sTheme, "Theming.getTheme() should return theme '" + sTheme + "' with provider setup " + JSON.stringify(mConfigStubValues) + ".");
		return themeApplied().then(function() {
			QUnit.assert.strictEqual(mEventCalls.aChange.length, aChangeEvents.length, "There should " + aChangeEvents.length + " 'change' event(s).");
			QUnit.assert.strictEqual(mEventCalls.aApplied.length, aAppliedEvents.length, "There should " + aAppliedEvents.length + " 'applied' event(s).");

			for (var i = aChangeEvents.length - 1; i >= 0; i--) {
				QUnit.assert.deepEqual(mEventCalls.aChange[i], aChangeEvents[i], "Expected parameters in 'change' event.");
				mEventCalls.aChange.pop();
				aChangeEvents.pop();
			}

			for (var j = aAppliedEvents.length - 1; j >= 0; j--) {
				QUnit.assert.deepEqual(mEventCalls.aApplied[j], aAppliedEvents[j], "Expected parameters in 'applied' event.");
				mEventCalls.aApplied.pop();
				aAppliedEvents.pop();
			}
		});
	}

	QUnit.module("Theming", {
		beforeEach: function (assert) {
			mConfigStubValues = {};
			mEventCalls = {
				aChange: [],
				aApplied: []
			};
			oURLConfigurationProviderStub = sinon.stub(URLConfigurationProvider, "get");
			oURLConfigurationProviderStub.callsFake(function(sKey) {
					return mConfigStubValues.hasOwnProperty(sKey) ? mConfigStubValues[sKey] : oURLConfigurationProviderStub.wrappedMethod.call(this, sKey);
			});
			Theming.attachChange(checkChange);
			Theming.attachApplied(checkApplied);
			if (bThemeManagerNotActive) {
				assert.strictEqual(mEventCalls.aApplied[0].theme, Theming.getTheme(), "In case there is no ThemeManager, the applied event should be called immediately.");
				mEventCalls.aApplied.pop();
			}
		},
		afterEach: function () {
			Theming.detachChange(checkChange);
			Theming.detachApplied(checkApplied);
			oURLConfigurationProviderStub.restore();
		}
	});

	/**
	 * This is regression test for when the initial theme is an empty string ("").
	 * The empty string is given in the "testsuite.theming.qunit.js" as a bootstrap parameter.
	 *
	 * Before fixing this regression, an empty string lead to a "Maximum call stack size exceeded" error.
	 */
	QUnit.test("Initial Theme - empty string fallback", function(assert) {
		assert.equal(Theming.getTheme(), "base", "Initial Theme after bootstrapping should be 'base'");
	});

	QUnit.test("getTheme", function (assert) {
		assert.expect(bThemeManagerNotActive ? 28 : 27);
		BaseConfig._.invalidate();
		mConfigStubValues = {
			"sapTheme": "sap_test_theme_1",
			"sapUiTheme": "sap_test_theme_2"
		};
		// sapTheme should be first
		return fnAssert("sap_test_theme_1").then(function() {
			BaseConfig._.invalidate();
			mConfigStubValues["sapTheme"] = undefined;
			// if there is no sapTheme sapUiTheme should be used
			return fnAssert("sap_test_theme_2");
		}).then(function() {
			BaseConfig._.invalidate();
			mConfigStubValues["sapUiTheme"] = undefined;
			// use default value 'base' in case there is no theming parameter at all
			return fnAssert("base");
		}).then(function() {
			BaseConfig._.invalidate();
			mConfigStubValues["sapTheme"] = "sap_test_theme_3@/sap/test/themeroot";
			// first call with themeroot should trigger a change event for the implicit setThemeRoot call
			return fnAssert("sap_test_theme_3", [{
				themeRoots: {
					"new": globalThis.location.origin + "/sap/test/themeroot/UI5/",
					"old": Theming.getThemeRoot("sap_test_theme_3"),
					"forceUpdate": undefined
				}
			}]);
		}).then(function() {
			// second call with identical theme and themeroot should not trigger a change event because themeroot for given theme did not change
			return fnAssert("sap_test_theme_3");
		}).then(function() {
			// third call with identical theme but different themeroot should trigger a change event for the implicit setThemeRoot call
			BaseConfig._.invalidate();
			mConfigStubValues["sapTheme"] = "sap_test_theme_3@/sap/different/test/themeroot";
			return fnAssert("sap_test_theme_3", [{
				themeRoots: {
					"new": globalThis.location.origin + "/sap/different/test/themeroot/UI5/",
					"old": Theming.getThemeRoot("sap_test_theme_3"),
					"forceUpdate": undefined
				}
			}]);
		}).then(function() {
			// sap_corbu theme should be normalized to sap_fiori_3 theme
			BaseConfig._.invalidate();
			mConfigStubValues["sapTheme"] = "sap_corbu";
			return fnAssert("sap_fiori_3");
		}).then(function() {
			// sap_corbu theme with specific themeroots should not be normalized and themeroots for sap_corbu should trigger a change event
			BaseConfig._.invalidate();
			mConfigStubValues["sapTheme"] = "sap_corbu@/sap/test/themeroot";
			return fnAssert("sap_corbu", [{
				themeRoots: {
					"new": globalThis.location.origin + "/sap/test/themeroot/UI5/",
					"old": Theming.getThemeRoot("sap_corbu"),
					"forceUpdate": undefined
				}
			}]);
		});
	});

	QUnit.test("setTheme", function(assert) {
		Theming.setTheme("sap_hcb");

		return fnAssert("sap_hcb", [{
			theme: {
				"old": "base",
				"new": "sap_hcb"
			}
		}], [{
			theme: "sap_hcb"
		}]).then(function() {
			Theming.setTheme("sap_hcb");
			return fnAssert("sap_hcb");
		}).then(function() {
			assert.throws(function() {
				Theming.setTheme("sap_fiori_3@sap/custom/themeroot");
			}, new TypeError("Providing a theme root as part of the theme parameter is not allowed."), "Providing a theme root using setTheme should throw an error.");
			// Setting theme to undefined, should not change anything
			Theming.setTheme();
			return fnAssert("sap_hcb");
		});
	});

	QUnit.test("getThemeRoot/setThemeRoot", function(assert) {
		var sOldTheme = Theming.getTheme();
		var sExpectedOldThemeRoot;
		var sExpectedNewThemeRoot;
		Theming.setTheme("sap_test_theme_4");

		return fnAssert("sap_test_theme_4", [{
			theme: {
				"old": sOldTheme,
				"new": "sap_test_theme_4"
			}
		}], [{
			theme: "sap_test_theme_4"
		}]).then(function() {
			assert.strictEqual(Theming.getThemeRoot(), sExpectedNewThemeRoot, "ThemeRoot without parameter should return the expected themeRoot '" + sExpectedNewThemeRoot + "'");
			assert.strictEqual(Theming.getThemeRoot("sap_test_theme_4"), sExpectedNewThemeRoot, "ThemeRoot for current theme should return the expected themeRoot '" + sExpectedNewThemeRoot + "'");

			sExpectedNewThemeRoot = "sap/another/themeroot";
			Theming.setThemeRoot("sap_test_theme_4", "sap/another/themeroot", true);
			return fnAssert("sap_test_theme_4", [{
				themeRoots: {
					"new": sExpectedNewThemeRoot,
					"old": sExpectedOldThemeRoot,
					forceUpdate: true
				}
			}]);
		}).then(function() {
			assert.strictEqual(Theming.getThemeRoot(), sExpectedNewThemeRoot, "ThemeRoot without parameter should return the expected themeRoot '" + sExpectedNewThemeRoot + "'");
			assert.strictEqual(Theming.getThemeRoot("sap_test_theme_4"), sExpectedNewThemeRoot, "ThemeRoot for current theme should return the expected themeRoot '" + sExpectedNewThemeRoot + "'");

			sExpectedOldThemeRoot = sExpectedNewThemeRoot;
			sExpectedNewThemeRoot = "sap/themeroot/for/libs";
			Theming.setThemeRoot("sap_test_theme_4", "sap/themeroot/for/libs", ["sap_test_lib1", "sap_test_lib2"], true);
			return fnAssert("sap_test_theme_4", [{
				themeRoots: {
					"old": {
						"": sExpectedOldThemeRoot
					},
					"new": {
						"": sExpectedOldThemeRoot,
						"sap_test_lib1": sExpectedNewThemeRoot,
						"sap_test_lib2": sExpectedNewThemeRoot
					},
					forceUpdate: true
				}
			}]);
		});
	});

	QUnit.test("setThemeRoot - Initial 'string' value must be overridable by API", function(assert) {
		var sThemeName = "sap_initialThemeRoot";
		var sInitialThemeRoot = "/somewhere/outside";

		assert.strictEqual(Theming.getThemeRoot(sThemeName), sInitialThemeRoot, "ThemeRoot for '" + sThemeName + "' should return the expected themeRoot '" + sInitialThemeRoot + "'");

		// Regression test: must not fail when initial theme-root is given only as a string, e.g.
		//                  themeRoots: {
		//                      "sap_initialThemeRoot": "/somewhere/outside"
		//                  }
		Theming.setThemeRoot(sThemeName, "https://back/inside");
	});

	QUnit.test("isApplied", function(assert) {
		assert.ok(Theming.isApplied(), "Theming should be applied.");

		Theming.setTheme("sap_test_theme_5");
		assert.strictEqual(Theming.isApplied(), bThemeManagerNotActive, "'true' if ThemeManager is active; else 'false'");

		return themeApplied().then(function() {
			assert.ok(Theming.isApplied(), "Theming should be applied.");
		});
	});

});