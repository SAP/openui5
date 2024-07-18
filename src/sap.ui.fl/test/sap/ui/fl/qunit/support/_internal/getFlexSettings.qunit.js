/* global QUnit */

sap.ui.define([
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/support/_internal/getFlexSettings",
	"sap/ui/thirdparty/sinon-4"
], function(
	Settings,
	getFlexSettings,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("getFlexSettings", {
		beforeEach() {
			this.oSettings = {
				versioning: {
					CUSTOMER: false,
					ALL: false
				},
				isKeyUser: true,
				isAtoAvailable: false,
				isLocalResetEnabled: false
			};
			sandbox.stub(Settings, "getInstance").resolves({
				_oSettings: this.oSettings
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with no versioning in CUSTOMER or ALL", async function(assert) {
			const aSettings = await getFlexSettings();
			assert.deepEqual(aSettings, [
				{ key: "versioning", value: false },
				{ key: "isKeyUser", value: true },
				{ key: "isAtoAvailable", value: false },
				{ key: "isLocalResetEnabled", value: false }
			], "the settings are returned");
		});

		QUnit.test("with versioning in CUSTOMER", async function(assert) {
			this.oSettings.versioning.CUSTOMER = true;
			const aSettings = await getFlexSettings();
			assert.deepEqual(aSettings, [
				{ key: "versioning", value: true },
				{ key: "isKeyUser", value: true },
				{ key: "isAtoAvailable", value: false },
				{ key: "isLocalResetEnabled", value: false }
			], "the settings are returned");
		});

		QUnit.test("with versioning in ALL", async function(assert) {
			this.oSettings.versioning.ALL = true;
			const aSettings = await getFlexSettings();
			assert.deepEqual(aSettings, [
				{ key: "versioning", value: true },
				{ key: "isKeyUser", value: true },
				{ key: "isAtoAvailable", value: false },
				{ key: "isLocalResetEnabled", value: false }
			], "the settings are returned");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});