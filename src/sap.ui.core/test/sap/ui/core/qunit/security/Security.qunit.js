/* globals QUnit, sinon */
sap.ui.require([
	"sap/base/config",
	"sap/base/config/GlobalConfigurationProvider",
	"sap/ui/security/Security"
], (
	BaseConfig,
	GlobalConfigurationProvider,
	Security
) => {
	"use strict";

	let mConfigStubValues = {};

	QUnit.module("Security: Allowlist configuration options", {
		beforeEach: function() {
			BaseConfig._.invalidate();
			this.oStub = sinon.stub(BaseConfig, "get");
			this.oStub.callsFake((oParams) =>
				(mConfigStubValues.hasOwnProperty(oParams.name) ? mConfigStubValues[oParams.name] : this.oStub.wrappedMethod.call(this, oParams))
			);
		},
		afterEach: function() {
			mConfigStubValues = {};
			this.oStub.restore();
		}
	});

	// AllowList Service only
	QUnit.test("allowlistService", function(assert) {
		var SERVICE_URL = "/service/url/from/config";
		mConfigStubValues["sapUiAllowlistService"] = SERVICE_URL;

		assert.equal(Security.getAllowlistService(), SERVICE_URL, "Successor getAllowlistService should return service url");
	});

	QUnit.module("Security: OData V4", {
		beforeEach: function() {
			BaseConfig._.invalidate();
			this.oStub = sinon.stub(GlobalConfigurationProvider, "get");
			this.oStub.callsFake((sKey) =>
				(mConfigStubValues.hasOwnProperty(sKey) ? mConfigStubValues[sKey] : this.oStub.wrappedMethod.call(this, sKey))
			);
		},
		afterEach: function() {
			mConfigStubValues = {};
			this.oStub.restore();
		}
	});

	QUnit.test("securityTokenHandlers", function(assert) {
		var fnSecurityTokenHandler1 = function () {},
			fnSecurityTokenHandler2 = function () {};
		BaseConfig._.invalidate();

		// code under test
		assert.deepEqual(Security.getSecurityTokenHandlers(), []);

		// bootstrap does some magic and converts to lower case, test does not :-(
		mConfigStubValues["sapUiSecurityTokenHandlers"] = [];
		BaseConfig._.invalidate();

		// code under test
		assert.strictEqual(Security.getSecurityTokenHandlers().length, 0, "check length");

		mConfigStubValues["sapUiSecurityTokenHandlers"] = [fnSecurityTokenHandler1];
		BaseConfig._.invalidate();

		// code under test
		assert.strictEqual(Security.getSecurityTokenHandlers()[0], fnSecurityTokenHandler1, "check Fn");
		assert.strictEqual(Security.getSecurityTokenHandlers().length, 1, "check length");

		mConfigStubValues["sapUiSecurityTokenHandlers"]
			= [fnSecurityTokenHandler1, fnSecurityTokenHandler2];
		BaseConfig._.invalidate();

		// code under test
		assert.strictEqual(Security.getSecurityTokenHandlers().length, 2, "check length");
		assert.strictEqual(Security.getSecurityTokenHandlers()[0], fnSecurityTokenHandler1, "check Fn");
		assert.strictEqual(Security.getSecurityTokenHandlers()[1], fnSecurityTokenHandler2, "check Fn");

		mConfigStubValues["sapUiSecurityTokenHandlers"] = fnSecurityTokenHandler1;
		BaseConfig._.invalidate();

		assert.throws(function () {
			// code under test
			Security.getSecurityTokenHandlers();
		}); // aSecurityTokenHandlers.forEach is not a function

		mConfigStubValues["sapUiSecurityTokenHandlers"] = [fnSecurityTokenHandler1, "foo"];
		BaseConfig._.invalidate();

		assert.throws(function () {
			// code under test
			Security.getSecurityTokenHandlers();
		}, "Not a function: foo");

		// code under test
		Security.setSecurityTokenHandlers([fnSecurityTokenHandler1]);

		assert.notStrictEqual([fnSecurityTokenHandler1], Security.securityTokenHandlers);
		assert.notStrictEqual(Security.getSecurityTokenHandlers(), Security.securityTokenHandlers);
		assert.strictEqual(Security.getSecurityTokenHandlers().length, 1);
		assert.strictEqual(Security.getSecurityTokenHandlers()[0], fnSecurityTokenHandler1);

		assert.throws(function () {
			// code under test
			Security.setSecurityTokenHandlers([fnSecurityTokenHandler1, "foo"]);
		}, "Not a function: foo");

		assert.throws(function () {
			// code under test
			Security.setSecurityTokenHandlers([undefined]);
		}, "Not a function: undefined");

		assert.throws(function () {
			// code under test
			Security.setSecurityTokenHandlers("foo");
		}); // aSecurityTokenHandlers.forEach is not a function

		// code under test
		Security.setSecurityTokenHandlers([fnSecurityTokenHandler1, fnSecurityTokenHandler2]);

		assert.strictEqual(Security.getSecurityTokenHandlers().length, 2);
		assert.strictEqual(Security.getSecurityTokenHandlers()[0], fnSecurityTokenHandler1);
		assert.strictEqual(Security.getSecurityTokenHandlers()[1], fnSecurityTokenHandler2);

		// code under test
		Security.setSecurityTokenHandlers([]);

		assert.deepEqual(Security.getSecurityTokenHandlers(), []);
	});
});