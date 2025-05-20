/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], (
	Log,
	ManagedObject,
	Settings,
	Storage,
	Utils,
	sinon
) => {
	"use strict";
	const sandbox = sinon.createSandbox();

	QUnit.module("Settings", {
		beforeEach() {
			this.oLoadFeaturesStub = sandbox.stub(Storage, "loadFeatures").resolves({
				isKeyUser: true
			});
		},
		afterEach() {
			Settings.clearInstance();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("loading settings multiple times in parallel", async function(assert) {
			const oSettingsPromise1 = Settings.getInstance();
			const oSettingsPromise2 = Settings.getInstance();
			const [oSettings1, oSettings2] = await Promise.all([oSettingsPromise1, oSettingsPromise2]);

			assert.strictEqual(this.oLoadFeaturesStub.callCount, 1, "then the settings are loaded only once");
			assert.deepEqual(oSettings1, oSettings2, "then the same instance is returned");
			assert.strictEqual(oSettings1.getIsKeyUser(), true, "then the setting from the backend is available");
		});

		QUnit.test("getInstanceOrUndef with and without settings available", async function(assert) {
			assert.notOk(Settings.getInstanceOrUndef(), "then the settings instance is not available");

			await Settings.getInstance();
			assert.ok(Settings.getInstanceOrUndef(), "then the settings instance is available");
		});

		QUnit.test("retrieveUserId with logonUser", async function(assert) {
			this.oLoadFeaturesStub.restore();
			this.oLoadFeaturesStub = sandbox.stub(Storage, "loadFeatures").resolves({
				logonUser: "testUser"
			});
			sandbox.stub(Utils, "getUshellContainer");
			const oSettings = await Settings.getInstance();
			assert.strictEqual(Utils.getUshellContainer.callCount, 0, "then the ushell container is not called");
			assert.strictEqual(oSettings.getUserId(), "testUser", "then the user id is available");
		});

		QUnit.test("retrieveUserId without logonUser but with ushell container", async function(assert) {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			sandbox.stub(Utils, "getUShellService").resolves({
				getUser: () => ({
					getId: () => "testUser"
				})
			});
			const oSettings = await Settings.getInstance();
			assert.strictEqual(oSettings.getUserId(), "testUser", "then the user id is available");
		});

		QUnit.test("retrieveUserId without logonUser and with ushell throwing an error", async function(assert) {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			sandbox.stub(Log, "error");
			sandbox.stub(Utils, "getUShellService").rejects("fancyError");
			const oSettings = await Settings.getInstance();
			assert.strictEqual(oSettings.getUserId(), "", "then the user id is not available");
			assert.strictEqual(Log.error.callCount, 1, "then the error is logged");
		});

		QUnit.test("context based adaptation url parameter", async function(assert) {
			sandbox.stub(URLSearchParams.prototype, "has").withArgs("sap-ui-xx-rta-adaptations").returns(true);
			sandbox.stub(URLSearchParams.prototype, "get").withArgs("sap-ui-xx-rta-adaptations").returns("true");
			const oSettings = await Settings.getInstance();
			assert.strictEqual(oSettings.getIsContextBasedAdaptationEnabled(), true, "then the context based adaptation is enabled");
		});

		QUnit.test("context based adaptation url parameter set to something other than true", async function(assert) {
			sandbox.stub(URLSearchParams.prototype, "has").withArgs("sap-ui-xx-rta-adaptations").returns(true);
			sandbox.stub(URLSearchParams.prototype, "get").withArgs("sap-ui-xx-rta-adaptations").returns("true1");
			const oSettings = await Settings.getInstance();
			assert.strictEqual(oSettings.getIsContextBasedAdaptationEnabled(), false, "then the context based adaptation is not enabled");
		});

		QUnit.test("legacy settings", async function(assert) {
			const oConstructorSpy = sandbox.spy(ManagedObject.prototype, "applySettings");
			this.oLoadFeaturesStub.restore();
			this.oLoadFeaturesStub = sandbox.stub(Storage, "loadFeatures").resolves({
				isAtoAvailable: true,
				isZeroDowntimeUpgradeRunning: true
			});
			await Settings.getInstance();
			const oConstructorSettings = oConstructorSpy.getCall(0).args[0];
			assert.strictEqual(oConstructorSettings.isAtoAvailable, undefined, "then the legacy settings are not set");
			assert.strictEqual(oConstructorSettings.isZeroDowntimeUpgradeRunning, undefined, "then the legacy settings are not set");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
