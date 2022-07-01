/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/compVariants/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Utils,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	function stubControls(bGetVariantManagement, bGetPersonalizableControlPersistencyKey, bGetPersistencyKey) {
		var oControl = {};
		if (bGetVariantManagement) {
			oControl.getVariantManagement = this.oGetVariantManagementStub;

			if (bGetPersonalizableControlPersistencyKey && bGetPersistencyKey) {
				this.oGetVariantManagementStub.returns({
					getPersistencyKey: this.oGetPersistencyKeyStub,
					getPersonalizableControlPersistencyKey: this.oGetPersonalizableControlPersistencyKeyStub
				});
			} else if (bGetPersonalizableControlPersistencyKey) {
				this.oGetVariantManagementStub.returns({
					getPersonalizableControlPersistencyKey: this.oGetPersonalizableControlPersistencyKeyStub
				});
			} else if (bGetPersistencyKey) {
				this.oGetVariantManagementStub.returns({
					getPersistencyKey: this.oGetPersistencyKeyStub
				});
			}
		} else {
			if (bGetPersistencyKey) {
				oControl.getPersistencyKey = this.oGetPersistencyKeyStub;
			}
			if (bGetPersonalizableControlPersistencyKey) {
				oControl.getPersonalizableControlPersistencyKey = this.oGetPersonalizableControlPersistencyKeyStub;
			}
		}

		return oControl;
	}

	QUnit.module("getPersistencyKey with a control implementing...", {
		beforeEach: function() {
			this.oGetVariantManagementStub = sandbox.stub();
			this.oGetPersonalizableControlPersistencyKeyStub = sandbox.stub().returns("myFancyPeristencyKey");
			this.oGetPersistencyKeyStub = sandbox.stub().returns("myNotSoFancyPersistencyKey");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("without control", function(assert) {
			assert.strictEqual(Utils.getPersistencyKey(), undefined, "nothing gets retutned");
		});

		QUnit.test("none of the used functions", function(assert) {
			assert.strictEqual(Utils.getPersistencyKey({}), undefined, "nothing gets retutned");
		});

		QUnit.test("getVariantManagement and getPersonalizableControlPersistencyKey", function(assert) {
			var oControl = stubControls.call(this, true, true, false);
			assert.strictEqual(Utils.getPersistencyKey(oControl), "myFancyPeristencyKey", "the correct persistencyKey is returned");
		});

		QUnit.test("getVariantManagement and getPersistencyKey", function(assert) {
			var oControl = stubControls.call(this, true, false, true);
			assert.strictEqual(Utils.getPersistencyKey(oControl), "myNotSoFancyPersistencyKey", "the correct persistencyKey is returned");
		});

		QUnit.test("getVariantManagement and getPersistencyKey and getPersonalizableControlPersistencyKey", function(assert) {
			var oControl = stubControls.call(this, true, true, true);
			assert.strictEqual(Utils.getPersistencyKey(oControl), "myFancyPeristencyKey", "the correct persistencyKey is returned");
		});

		QUnit.test("getPersonalizableControlPersistencyKey", function(assert) {
			var oControl = stubControls.call(this, false, true, false);
			assert.strictEqual(Utils.getPersistencyKey(oControl), "myFancyPeristencyKey", "the correct persistencyKey is returned");
		});

		QUnit.test("getPersistencyKey", function(assert) {
			var oControl = stubControls.call(this, false, false, true);
			assert.strictEqual(Utils.getPersistencyKey(oControl), "myNotSoFancyPersistencyKey", "the correct persistencyKey is returned");
		});

		QUnit.test("getPersistencyKey and getPersonalizableControlPersistencyKey", function(assert) {
			var oControl = stubControls.call(this, false, true, true);
			assert.strictEqual(Utils.getPersistencyKey(oControl), "myFancyPeristencyKey", "the correct persistencyKey is returned");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});