/* global QUnit */

sap.ui.define([
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/support/_internal/getFlexSettings",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Settings,
	getFlexSettings,
	Utils,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	function checkPropertiesInSettings(assert, aSettings, aExpectedSettings) {
		aExpectedSettings.forEach(function(oExpectedSetting) {
			const oSetting = aSettings.find(function(oSetting) {
				return oSetting.key === oExpectedSetting.key;
			});
			assert.ok(oSetting, "the setting is available");
			assert.strictEqual(oSetting.value, oExpectedSetting.value, "the setting has the expected value");
		});
	}

	QUnit.module("getFlexSettings", {
		beforeEach() {
			this.oSettings = {
				versioning: {
					CUSTOMER: false,
					ALL: false
				},
				isKeyUser: true,
				isLocalResetEnabled: false
			};
			sandbox.stub(Settings, "getInstance").resolves(new Settings(this.oSettings));
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with no versioning in CUSTOMER or ALL", async function(assert) {
			const aSettings = await getFlexSettings("dummyComponent");
			checkPropertiesInSettings(assert, aSettings, [
				{ key: "versioning", value: false },
				{ key: "isKeyUser", value: true },
				{ key: "isLocalResetEnabled", value: false }
			]);
		});

		QUnit.test("with versioning in CUSTOMER", async function(assert) {
			this.oSettings.versioning.CUSTOMER = true;
			const aSettings = await getFlexSettings("dummyComponent");
			checkPropertiesInSettings(assert, aSettings, [
				{ key: "versioning", value: true },
				{ key: "isKeyUser", value: true },
				{ key: "isLocalResetEnabled", value: false }
			]);
		});

		QUnit.test("with versioning in ALL", async function(assert) {
			this.oSettings.versioning.ALL = true;
			const aSettings = await getFlexSettings("dummyComponent");
			checkPropertiesInSettings(assert, aSettings, [
				{ key: "versioning", value: true },
				{ key: "isKeyUser", value: true },
				{ key: "isLocalResetEnabled", value: false }
			]);
		});

		QUnit.test("without passing a component", async function(assert) {
			sandbox.stub(Utils, "getUShellService").resolves({
				getCurrentApplication() {
					return {
						componentInstance: "dummyComponent"
					};
				}
			});
			const aSettings = await getFlexSettings();
			checkPropertiesInSettings(assert, aSettings, [
				{ key: "versioning", value: false },
				{ key: "isKeyUser", value: true },
				{ key: "isLocalResetEnabled", value: false }
			]);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});