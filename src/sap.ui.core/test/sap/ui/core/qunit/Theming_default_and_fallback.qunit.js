/* global QUnit, sinon, globalThis */

sap.ui.define([
	"sap/base/Event",
	"sap/ui/base/config/URLConfigurationProvider",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/ThemeHelper",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function (
	BaseEvent,
	URLConfigurationProvider,
	Theming,
	ThemeHelper,
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
			mEventCalls = {
				aChange: [],
				aApplied: []
			};
		},
		afterEach: function () {
			Theming.detachChange(checkChange);
			Theming.detachApplied(checkApplied);
			oURLConfigurationProviderStub.restore();
		}
	});

	QUnit.test("setTheme - fallback to default theme", async function(assert) {
		const sCurrentTheme = Theming.getTheme();
		const sCalculatedDefaultTheme = ThemeHelper.getDefaultThemeInfo().DEFAULT_THEME;

		// 0. Check if initially set theme via bootstrap is correctly changed to a valid default
		assert.equal(sCurrentTheme, sCalculatedDefaultTheme, "Initial theme is correctly set when bootstrap provides outdated theme name");

		// 1. fresh start with a consistent valid theme
		//    no fallback should be applied
		Theming.setTheme("sap_fiori_3_hcw");

		await fnAssert("sap_fiori_3_hcw",
			// change event for "theme"
			[{ theme: { "old": sCurrentTheme, "new": "sap_fiori_3_hcw" } }],
			// applied event with new theme name
			[{ theme: "sap_fiori_3_hcw" }]);

		// 2. set a theme that is no longer supported
		//    fallback to default (Aug. 2023: "sap_horizon") should be applied
		Theming.setTheme("sap_goldreflection");

		await fnAssert(sCalculatedDefaultTheme,
			// change event for "theme"
			[{ theme: { "old": "sap_fiori_3_hcw", "new": sCalculatedDefaultTheme } }],
			// applied event with new theme name
			[{ theme: sCalculatedDefaultTheme }]);

		// 3. another invalid theme is set
		//    no further events should be fired after setting another invalid theme
		Theming.setTheme("sap_platinum");

		await fnAssert(sCalculatedDefaultTheme,
			// no change event for "theme"
			[],
			// no further applied event, since the theme is not changed
			[]);

		// 4. setting a valid theme again should work
		Theming.setTheme("sap_belize");

		await fnAssert("sap_belize",
			// change event for "theme"
			[{ theme: { "old": sCalculatedDefaultTheme, "new": "sap_belize" } }],
			// applied event with new theme name
			[{ theme: "sap_belize" }]);
	});

});