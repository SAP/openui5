/* global QUnit, sinon */

sap.ui.define([
	"sap/base/config",
	"sap/base/Event",
	"sap/base/Log",
	"sap/base/config/GlobalConfigurationProvider",
	"sap/base/util/Deferred",
	"sap/ui/base/config/URLConfigurationProvider",
	"sap/ui/core/Control",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/ThemeHelper",
	"sap/ui/test/utils/waitForThemeApplied",
	"sap/ui/test/starter/QUnitConfigurationProvider"
], function (
	BaseConfig,
	BaseEvent,
	Log,
	GlobalConfigurationProvider,
	Deferred,
	URLConfigurationProvider,
	Control,
	Theming,
	ThemeHelper,
	themeApplied,
	QUnitConfigurationProvider
) {
	"use strict";

	var oURLConfigurationProviderStub,
		oQUnitConfigurationProviderStub,
		oGlobalConfigurationProviderStub,
		mConfigStubValues,
		mEventCalls;

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

	function setupTestsBeforeEach(assert) {
		mConfigStubValues = {};
		oURLConfigurationProviderStub = sinon.stub(URLConfigurationProvider, "get");
		oURLConfigurationProviderStub.callsFake(function(sKey) {
				return mConfigStubValues.hasOwnProperty(sKey) ? mConfigStubValues[sKey] : oURLConfigurationProviderStub.wrappedMethod.call(this, sKey);
		});
		//testsuite config is now alive and "" is defaulted...
		oQUnitConfigurationProviderStub = sinon.stub(QUnitConfigurationProvider, "get");
		oQUnitConfigurationProviderStub.callsFake(function(sKey) {
				return mConfigStubValues.hasOwnProperty(sKey) ? mConfigStubValues[sKey] : oURLConfigurationProviderStub.wrappedMethod.call(this, sKey);
		});
		mEventCalls = {
			aChange: [],
			aApplied: []
		};
		Theming.attachChange(checkChange);
		Theming.attachApplied(checkApplied);

		mEventCalls = {
			aChange: [],
			aApplied: []
		};
	}

	function setupTestsAfterEach() {
		Theming.detachChange(checkChange);
		Theming.detachApplied(checkApplied);
		oURLConfigurationProviderStub.restore();
		oQUnitConfigurationProviderStub.restore();
	}

	QUnit.module("Initial Configuration", {
		beforeEach: setupTestsBeforeEach,
		afterEach: setupTestsAfterEach
	});

	/**
	 * This is regression test for when the initial theme is an empty string ("").
	 * The empty string is given in the "testsuite.theming.qunit.js" as a bootstrap parameter.
	 *
	 * Before fixing this regression, an empty string lead to a "Maximum call stack size exceeded" error.
	 */
	QUnit.test("Initial Theme - empty string fallback", function(assert) {
		const sExpectedDefaultTheme = ThemeHelper.getDefaultThemeInfo().DEFAULT_THEME;
		assert.equal(Theming.getTheme(), sExpectedDefaultTheme, `Initial Theme after bootstrapping should be ${sExpectedDefaultTheme}`);
	});

	QUnit.test("getTheme", function (assert) {
		assert.expect(27);
		BaseConfig._.invalidate();

		const sExpectedDefaultTheme = ThemeHelper.getDefaultThemeInfo().DEFAULT_THEME;

		mConfigStubValues = {
			"sapTheme": "sap_horizon",
			"sapUiTheme": "sap_fiori_3"
		};
		// sapTheme should be first
		return fnAssert("sap_horizon").then(function() {
			BaseConfig._.invalidate();
			mConfigStubValues["sapTheme"] = undefined;
			// if there is no sapTheme sapUiTheme should be used
			return fnAssert("sap_fiori_3");
		}).then(function() {
			BaseConfig._.invalidate();
			mConfigStubValues["sapUiTheme"] = undefined;
			// internally we determine a valid default theme in case there is no theme given at all
			return fnAssert(sExpectedDefaultTheme);
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
			// sap_corbu theme should be normalized to the latest default theme
			mConfigStubValues["sapTheme"] = "sap_corbu";
			return fnAssert(sExpectedDefaultTheme);
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

	QUnit.module("ThemeRoot Validation");

	// determine the default port depending on the protocol of the current page
	const defaultPort = window.location.protocol === "https:" ? 443 : 80;
	const origin = window.location.origin;
	const originWithoutProtocol = origin.replace(window.location.protocol, "");

	[
		{
			caption: "Relative URL, All Origins",
			theme: "custom@custom-theme/",
			allowedOrigins: "*",
			expectedThemeRoot: "custom-theme/UI5/"
		},
		{
			caption: "Relative URL, no valid origins",
			theme: "custom@custom-theme/",
			allowedOrigins: null,
			expectedThemeRoot: "custom-theme/UI5/"
		},
		{
			caption: "Relative URL, baseURI on different domain, no valid origins",
			theme: "custom@custom-theme/",
			allowedOrigins: null,
			expectedThemeRoot: "custom-theme/UI5/",
			baseURI: "http://example.org" //Check why needed
		},
		{
			caption: "Relative URL, baseURI on different domain, All origins",
			theme: "custom@custom-theme/",
			allowedOrigins: "*",
			expectedThemeRoot: "custom-theme/UI5/",
			baseURI: "http://example.org" //Check why needed
		},
		{
			caption: "Relative URL, relative baseURI",
			theme: "custom@../custom-theme",
			allowedOrigins: null,
			expectedThemeRoot: "../custom-theme/UI5/",
			baseURI: "/some/other/path/" //Check why needed
		},
		{
			caption: "Absolute URL, All Origins",
			theme: "custom@ftp://example.org/theming/custom-theme/",
			allowedOrigins: "*",
			expectedThemeRoot: "ftp://example.org/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL, Same Domain",
			theme: `custom@${origin}/theming/custom-theme/`,
			allowedOrigins: origin,
			expectedThemeRoot: "/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL, Valid, but Different Domain",
			theme: "custom@https://example.com/theming/custom-theme/",
			allowedOrigins: "https://example.com",
			expectedThemeRoot: "https://example.com/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL, no valid origins",
			theme: "custom@https://example.com/theming/custom-theme/",
			allowedOrigins: null,
			expectedThemeRoot: "/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL, empty valid origins",
			theme: "custom@https://example.com/theming/custom-theme/",
			allowedOrigins: "",
			expectedThemeRoot: "/theming/custom-theme/UI5/"
		},
		{
			caption: "Absolute URL with same protocol, Valid",
			theme: "custom@//example.com/theming/custom-theme/",
			allowedOrigins: "example.com",
			expectedThemeRoot: "//example.com/theming/custom-theme/UI5/",
			noProtocol: true
		},
		{
			caption: "Absolute URL with same protocol and themeRoot has default port, Valid",
			theme: `custom@//example.com:${defaultPort}/theming/custom-theme/`,
			allowedOrigins: "example.com",
			expectedThemeRoot: "//example.com/theming/custom-theme/UI5/",
			noProtocol: true
		},
		{
			caption: "Absolute URL with same protocol and allowedThemeOrigin has default port, Valid",
			theme: "custom@//example.com/theming/custom-theme/",
			allowedOrigins: `example.com:${defaultPort}`,
			expectedThemeRoot: "//example.com/theming/custom-theme/UI5/",
			noProtocol: true
		},
		{
			caption: "Absolute URL with same protocol and custom port, Valid",
			theme: "custom@//example.com:8080/theming/custom-theme/",
			allowedOrigins: "example.com:8080",
			expectedThemeRoot: "//example.com:8080/theming/custom-theme/UI5/",
			noProtocol: true
		},
		{
			caption: "Absolute URL with same protocol and themeRoot has custom port, not valid",
			theme: "custom@//example.com:8080/theming/custom-theme/",
			allowedOrigins: "example.com",
			expectedThemeRoot: `${originWithoutProtocol}/theming/custom-theme/UI5/`,
			noProtocol: true
		},
		{
			caption: "Absolute URL with same protocol and allowedThemeOrigin has custom port, not valid",
			theme: "custom@//example.com/theming/custom-theme/",
			allowedOrigins: "example.com:8080",
			expectedThemeRoot: `${originWithoutProtocol}/theming/custom-theme/UI5/`,
			noProtocol: true
		}
	].forEach(function(oSetup) {
		QUnit.test(oSetup.caption, function(assert) {
			BaseConfig._.invalidate();
			const oStub = sinon.stub(BaseConfig, "get");
			const fnFake = function(mParameters) {
				switch (mParameters.name) {
					case "sapAllowedThemeOrigins":
						return oSetup.allowedOrigins;
					case "sapUiTheme":
						return oSetup.theme;
					default:
						return oStub.wrappedMethod.call(this, mParameters);
				}
			};
			oStub.callsFake(fnFake);
			assert.equal(Theming.getTheme(), "custom", "Configuration 'getTheme' returns expected 'theme' " + Theming.getTheme());
			// eslint-disable-next-line no-restricted-globals
			assert.equal(Theming.getThemeRoot(), oSetup.noProtocol ? oSetup.expectedThemeRoot : new URL(oSetup.expectedThemeRoot, location.href).toString(),
				"Theming 'getThemeRoot' returns expected 'themeRoot' " + Theming.getThemeRoot());
			oStub.restore();
		});
	});

	QUnit.module("Theming runtime behavior", {
		beforeEach: async function (assert) {
			// make sure we have a fixed theme to begin with
			Theming.setTheme("sap_horizon");
			await themeApplied();

			setupTestsBeforeEach(assert);
		},
		afterEach: setupTestsAfterEach
	});

	QUnit.test("setTheme", function(assert) {
		Theming.setTheme("sap_horizon_hcb");

		return fnAssert("sap_horizon_hcb", [{
			theme: {
				"old": ThemeHelper.getDefaultThemeInfo().DEFAULT_THEME,
				"new": "sap_horizon_hcb"
			}
		}], [{
			theme: "sap_horizon_hcb"
		}]).then(function() {
			Theming.setTheme("sap_horizon_hcb");
			return fnAssert("sap_horizon_hcb");
		}).then(function() {
			assert.throws(function() {
				Theming.setTheme("sap_fiori_3@sap/custom/themeroot");
			}, new TypeError("Providing a theme root as part of the theme parameter is not allowed."), "Providing a theme root using setTheme should throw an error.");
			// Setting theme to undefined, should not change anything
			Theming.setTheme();
			return fnAssert("sap_horizon_hcb");
		});
	});

	QUnit.test("getThemeRoot/setThemeRoot", function(assert) {
		var sOldTheme = Theming.getTheme();
		var sExpectedOldThemeRoot;
		var sExpectedNewThemeRoot;
		Theming.setTheme("my_private_theme");

		return fnAssert("my_private_theme", [{
			theme: {
				"old": sOldTheme,
				"new": "my_private_theme"
			}
		}], [{
			theme: "my_private_theme"
		}]).then(function() {
			assert.strictEqual(Theming.getThemeRoot(), sExpectedNewThemeRoot, "ThemeRoot without parameter should return the expected themeRoot '" + sExpectedNewThemeRoot + "'");
			assert.strictEqual(Theming.getThemeRoot("my_private_theme"), sExpectedNewThemeRoot, "ThemeRoot for current theme should return the expected themeRoot '" + sExpectedNewThemeRoot + "'");

			sExpectedNewThemeRoot = "sap/another/themeroot";
			Theming.setThemeRoot("my_private_theme", "sap/another/themeroot", true);
			return fnAssert("my_private_theme", [{
				themeRoots: {
					"new": sExpectedNewThemeRoot,
					"old": sExpectedOldThemeRoot,
					forceUpdate: true
				}
			}]);
		}).then(function() {
			assert.strictEqual(Theming.getThemeRoot(), sExpectedNewThemeRoot, "ThemeRoot without parameter should return the expected themeRoot '" + sExpectedNewThemeRoot + "'");
			assert.strictEqual(Theming.getThemeRoot("my_private_theme"), sExpectedNewThemeRoot, "ThemeRoot for current theme should return the expected themeRoot '" + sExpectedNewThemeRoot + "'");

			sExpectedOldThemeRoot = sExpectedNewThemeRoot;
			sExpectedNewThemeRoot = "sap/themeroot/for/libs";
			Theming.setThemeRoot("my_private_theme", "sap/themeroot/for/libs", ["sap_test_lib1", "sap_test_lib2"], true);
			return fnAssert("my_private_theme", [{
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
		var sThemeName = "theme_with_initial_themeRoot";
		var sInitialThemeRoot = "/somewhere/outside";

		assert.strictEqual(Theming.getThemeRoot(sThemeName), sInitialThemeRoot, "ThemeRoot for '" + sThemeName + "' should return the expected themeRoot '" + sInitialThemeRoot + "'");

		// Regression test: must not fail when initial theme-root is given only as a string, e.g.
		//                  themeRoots: {
		//                      "theme_with_initial_themeRoot": "/somewhere/outside"
		//                  }
		Theming.setThemeRoot(sThemeName, "https://back/inside");
	});

	QUnit.test("isApplied", async function(assert) {
		function isApplied() {
			var bApplied = false;
			function fnCheckApplied() {
				bApplied = true;
			}
			// if theme is applied fnCheckApplied is called sync
			Theming.attachApplied(fnCheckApplied);
			Theming.detachApplied(fnCheckApplied);
			return bApplied;
		}

		assert.ok(isApplied(), "Theming should be applied.");

		// check if isApplied flag is reset after setting a new theme
		Theming.setTheme("my_test_theme_for_applied");
		assert.strictEqual(isApplied(), false, "'true' for active ThemeManager");

		await themeApplied();

		assert.ok(isApplied(), "Theming should be applied.");
	});

	QUnit.module("others");

	/**
	 * Tests that <code>Theming.notifyContentDensityChanged()</code> calls each control's #onThemeChanged method
	 */
	QUnit.test(".notifyContentDensityChanged", function(assert) {
		const done = assert.async();
		assert.expect(4);

		const oCtrl = new Control();
		oCtrl.onThemeChanged = function(oEvent) {
			assert.ok(oEvent, "TestButton#onThemeChanged is called");
			assert.equal(oEvent.theme, Theming.getTheme(), "Current theme is passed along 'themeChanged' event");
		};

		let ignoreEvent = true;

		function handler(oEvent) {
			if ( ignoreEvent ) {
				return;
			}
			assert.ok(oEvent, "listener for 'applied' event is called");
			assert.equal(oEvent.theme, Theming.getTheme(), "Current theme is passed along 'applied' event");

			// cleanup
			Theming.detachApplied(handler);
			oCtrl.destroy();

			done();
		}
		Theming.attachApplied(handler); // immediately might call listener

		ignoreEvent = false;
		Theming.notifyContentDensityChanged();
	});

	QUnit.module("Favicon", {
		before: function() {
			Theming.setTheme("sap_horizon");
			return themeApplied();
		},
		beforeEach: function(assert) {
			const that = this;
			this.sDefaultFaviconPath = sap.ui.require.toUrl("sap/ui/core/themes/base/icons/favicon.ico");
			this.oRequireStub = sinon.stub(sap.ui, "require");
			this.parametersDeferred = new Deferred();
			this.mobileDeferred = new Deferred();
			this.oRequireStub.callsFake(function(aModules, callback) {
				let wrappedCallback;
				if (aModules[0] === "sap/ui/core/theming/Parameters" && callback) {
					wrappedCallback = function(module) {
						that.Parameters = module;
						that.sThemingServiceFaviconPath = "http://my.theming.service/my/custom/favicon.ico";
						that.oParametersGetStub ??= sinon.stub(that.Parameters, "get").returns(that.sThemingServiceFaviconPath);
						BaseConfig._.invalidate();
						that.parametersDeferred.resolve(that.Parameters);
						callback.apply(this, arguments);
					};
				} else if (aModules[0] === "sap/ui/util/Mobile" && callback) {
					wrappedCallback = function(module) {
						that.Mobile = module;
						that.oMobileSetIconsSpy ??= sinon.spy(that.Mobile, "setIcons");
						that.mobileDeferred.resolve(that.Mobile);
						callback.apply(this, arguments);
					};
				} else {
					wrappedCallback = callback;
				}
				that.oRequireStub.wrappedMethod.call(this, aModules, wrappedCallback);
			});
			mConfigStubValues = {};
			oGlobalConfigurationProviderStub = sinon.stub(GlobalConfigurationProvider, "get");
			oGlobalConfigurationProviderStub.callsFake(function(sKey) {
				return mConfigStubValues.hasOwnProperty(sKey) ? mConfigStubValues[sKey] : oGlobalConfigurationProviderStub.wrappedMethod.call(this, sKey);
			});
		},
		afterEach: function(assert) {
			oGlobalConfigurationProviderStub.restore();
			this.oRequireStub.restore();
			this.oMobileSetIconsSpy?.restore();
			this.oParametersGetStub?.restore();
		}
	});

	QUnit.test("getFavicon", async function(assert) {
		assert.expect(10);

		const oLogSpy = sinon.spy(Log, "error");

		assert.strictEqual(await Theming.getFavicon(), undefined, "getFavicon should return 'undefined' since no favicon is configured");

		mConfigStubValues = {
			"sapUiFavicon": true
		};
		BaseConfig._.invalidate();

		assert.strictEqual(await Theming.getFavicon(), this.sDefaultFaviconPath,
			`getFavicon should return path '${this.sDefaultFaviconPath}' to default favicon, since favicon is set to 'true' and the theme is a SAP standard theme`);
		assert.notOk(this.Parameters, "Parameters module should not be loaded since it's only needed in combination with custom theme");

		Theming.setTheme("my_custom_theme");

		// "sap/base/util/Mobile" is expected to be loaded after the favicon is set to a truthy value and a themeApplied event has occured
		await this.mobileDeferred.promise;

		assert.ok(!!this.Mobile, "Mobile module should be available after themeApplied, in case a favicon is configured (independed whether ThemeManager is active or not)");
		assert.strictEqual(!!this.Parameters, true, "Parameters module should be available");

		assert.strictEqual(await Theming.getFavicon(), this.sThemingServiceFaviconPath,
			`getFavicon should return path '${this.sThemingServiceFaviconPath}' to custom favicon since favicon is set to 'true' and there is an explicit favicon configured for the custom theme`);

		Theming.setTheme("sap_horizon");
		await themeApplied();

		mConfigStubValues = {
			"sapUiFavicon": true
		};
		BaseConfig._.invalidate();

		assert.strictEqual(await Theming.getFavicon(), this.sDefaultFaviconPath,
			`getFavicon should return path '${this.sDefaultFaviconPath}' to default favicon since favicon is set to 'true' and theme is a standard theme`);

		const sFaviconPath = "/path/to/my/favicon.ico";
		mConfigStubValues = {
			"sapUiFavicon": sFaviconPath
		};
		BaseConfig._.invalidate();

		assert.strictEqual(await Theming.getFavicon(), sFaviconPath, `getFavicon should return configured path '${sFaviconPath}}' for favicon`);

		mConfigStubValues = {
			"sapUiFavicon": "http://my.absolute.url/to/my/favicon.ico"
		};
		BaseConfig._.invalidate();

		assert.strictEqual(await Theming.getFavicon(), this.sDefaultFaviconPath,
			`getFavicon should return path '${this.sDefaultFaviconPath}' to default favicon since an absolute URL is configured but absolute URLs are not allowed`);
		assert.ok(oLogSpy.calledWith("Absolute URLs are not allowed for favicon. The configured favicon will be ignored.", undefined, "sap.ui.core.theming.Theming"),
			"Log should be called with the correct message");
		oLogSpy.restore();
	});

	QUnit.test("setFavicon", async function(assert) {
		assert.expect(10);
		await Theming.setFavicon();

		assert.strictEqual(await Theming.getFavicon(), undefined, "favicon should be 'undefined' when 'setFavicon' is called with 'undefined'");
		assert.notOk(this.Mobile, "'sap/base/util/Mobile' should not be loaded when 'setFavicon' is called with a falsy value");

		Theming.setFavicon(true);

		// "sap/base/util/Mobile" is expected to be loaded after the favicon is set to a truthy value
		await this.mobileDeferred.promise;

		assert.notOk(this.Parameters, "Parameters module should not be loaded because it's only needed in combination with custom theme");
		assert.ok(!!this.Mobile, "Mobile module should be available after themeApplied, in case a favicon is configured (independed whether ThemeManager is active or not)");
		assert.ok(this.oMobileSetIconsSpy.calledWith({ favicon: this.sDefaultFaviconPath }),
			`setIcons should be called with '${this.sDefaultFaviconPath}' because there is no favicon derived from Parameters module`);

		// Set a custom theme and wait for parameterswhich should be loaded to check for favicon from custom theme
		Theming.setTheme("my_custom_theme");
		await this.parametersDeferred.promise;

		assert.strictEqual(!!this.Parameters, true, "Parameters module should be available");

		await Theming.setFavicon(true);
		assert.ok(this.oMobileSetIconsSpy.calledWith({ favicon: this.sThemingServiceFaviconPath }),
			`setIcons should be called with '${this.sThemingServiceFaviconPath}' from custom theme`);

		await Theming.setFavicon("/path/to/my/favicon.ico");
		assert.ok(this.oMobileSetIconsSpy.calledWith({ favicon: "/path/to/my/favicon.ico" }), "setIcons should not be called when 'setFavicon' is called with a falsy value");

		await Theming.setFavicon("http://my.absolute.url/to/my/favicon.ico").catch((error) => {
			assert.ok(error instanceof TypeError, "TypeError should be thrown when trying to set an absolute URL as favicon");
			assert.strictEqual(error.message, "Path to favicon must be relative to the current origin", "Error message should be correct");
		});
	});
});
