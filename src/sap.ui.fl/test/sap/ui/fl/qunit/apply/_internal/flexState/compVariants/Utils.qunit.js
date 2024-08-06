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
		beforeEach() {
			this.oGetVariantManagementStub = sandbox.stub();
			this.oGetPersonalizableControlPersistencyKeyStub = sandbox.stub().returns("myFancyPersistencyKey");
			this.oGetPersistencyKeyStub = sandbox.stub().returns("myNotSoFancyPersistencyKey");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("without control", function(assert) {
			assert.strictEqual(Utils.getPersistencyKey(), undefined, "nothing gets returned");
		});

		QUnit.test("none of the used functions", function(assert) {
			assert.strictEqual(Utils.getPersistencyKey({}), undefined, "nothing gets returned");
		});

		QUnit.test("getVariantManagement and getPersonalizableControlPersistencyKey", function(assert) {
			var oControl = stubControls.call(this, true, true, false);
			assert.strictEqual(Utils.getPersistencyKey(oControl), "myFancyPersistencyKey", "the correct persistencyKey is returned");
		});

		QUnit.test("getVariantManagement and getPersistencyKey", function(assert) {
			var oControl = stubControls.call(this, true, false, true);
			assert.strictEqual(Utils.getPersistencyKey(oControl), "myNotSoFancyPersistencyKey", "the correct persistencyKey is returned");
		});

		QUnit.test("getVariantManagement and getPersistencyKey and getPersonalizableControlPersistencyKey", function(assert) {
			var oControl = stubControls.call(this, true, true, true);
			assert.strictEqual(Utils.getPersistencyKey(oControl), "myFancyPersistencyKey", "the correct persistencyKey is returned");
		});

		QUnit.test("getPersonalizableControlPersistencyKey", function(assert) {
			var oControl = stubControls.call(this, false, true, false);
			assert.strictEqual(Utils.getPersistencyKey(oControl), "myFancyPersistencyKey", "the correct persistencyKey is returned");
		});

		QUnit.test("getPersistencyKey", function(assert) {
			var oControl = stubControls.call(this, false, false, true);
			assert.strictEqual(Utils.getPersistencyKey(oControl), "myNotSoFancyPersistencyKey", "the correct persistencyKey is returned");
		});

		QUnit.test("getPersistencyKey and getPersonalizableControlPersistencyKey", function(assert) {
			var oControl = stubControls.call(this, false, true, true);
			assert.strictEqual(Utils.getPersistencyKey(oControl), "myFancyPersistencyKey", "the correct persistencyKey is returned");
		});
	});

	QUnit.module("getDefaultVariantId...", {
		beforeEach: () => {
			this.mCompVariantsMap = {
				defaultVariants: [],
				byId: {}
			};
		},
		afterEach: () => {
			sandbox.restore();
		}
	}, () => {
		QUnit.test("One defaultVariant change with two variants", (assert) => {
			const sVariantName = "MyDummyVariant";
			this.mCompVariantsMap.defaultVariants[0] = {
				getContent: () => {
					return {
						defaultVariantName: sVariantName
					};
				}
			};
			this.mCompVariantsMap.byId = {
				[sVariantName]: {},
				AnotherVariant: {}
			};

			assert.strictEqual(
				Utils.getDefaultVariantId(this.mCompVariantsMap),
				sVariantName,
				"the correct variant is returned"
			);
		});

		QUnit.test("Two defaultVariant changes with two variants", (assert) => {
			const sFirstVariantName = "FirstVariant";
			const sSecondVariantName = "SecondVariant";
			this.mCompVariantsMap.defaultVariants[0] = {
				getContent: () => {
					return {
						defaultVariantName: sSecondVariantName
					};
				}
			};
			this.mCompVariantsMap.defaultVariants[1] = {
				getContent: () => {
					return {
						defaultVariantName: sFirstVariantName
					};
				}
			};
			this.mCompVariantsMap.byId = {
				[sSecondVariantName]: {},
				[sFirstVariantName]: {}
			};

			assert.strictEqual(
				Utils.getDefaultVariantId(this.mCompVariantsMap),
				sFirstVariantName,
				"the last defaultVariant ID is returned"
			);
		});

		QUnit.test("Two defaultVariant changes with one variant => the variant from the last defaultVariant change was removed", (assert) => {
			const sRemovedVariant = "RemovedVariant";
			const sSecondVariantName = "SecondVariant";
			this.mCompVariantsMap.defaultVariants[0] = {
				getContent: () => {
					return {
						defaultVariantName: sSecondVariantName
					};
				}
			};
			this.mCompVariantsMap.defaultVariants[1] = {
				getContent: () => {
					return {
						defaultVariantName: sRemovedVariant
					};
				}
			};
			this.mCompVariantsMap.byId = {
				[sSecondVariantName]: {}
			};

			assert.strictEqual(
				Utils.getDefaultVariantId(this.mCompVariantsMap),
				sSecondVariantName,
				"the defaultVariant change of the still existing variant is the default"
			);
		});

		QUnit.test("No defaultVariant changes", (assert) => {
			this.mCompVariantsMap.byId = {
				FirstVariant: {},
				SecondVariant: {}
			};

			assert.strictEqual(
				Utils.getDefaultVariantId(this.mCompVariantsMap),
				"",
				"the function returns an empty string"
			);
		});

		QUnit.test("No valid variants", (assert) => {
			this.mCompVariantsMap.byId = {
				FirstVariant: {},
				SecondVariant: {}
			};
			this.mCompVariantsMap.defaultVariants[0] = {
				getContent: () => {
					return {
						defaultVariantName: "PreviouslyExistingVariant1"
					};
				}
			};
			this.mCompVariantsMap.defaultVariants[1] = {
				getContent: () => {
					return {
						defaultVariantName: "PreviouslyExistingVariant2"
					};
				}
			};

			assert.strictEqual(
				Utils.getDefaultVariantId(this.mCompVariantsMap),
				"",
				"the function returns an empty string"
			);
		});

		QUnit.test("No variants", (assert) => {
			this.mCompVariantsMap.defaultVariants[0] = {
				getContent: () => {
					return {
						defaultVariantName: "PreviouslyExistingVariant1"
					};
				}
			};
			this.mCompVariantsMap.defaultVariants[1] = {
				getContent: () => {
					return {
						defaultVariantName: "PreviouslyExistingVariant2"
					};
				}
			};

			assert.strictEqual(
				Utils.getDefaultVariantId(this.mCompVariantsMap),
				"",
				"the function returns an empty string"
			);
		});

		QUnit.test("Two defaultVariant changes - the most recent one sets the standard variant as default", (assert) => {
			const sDefaultVariantName = "*standard*";
			const sFirstVariantName = "FirstVariant";
			this.mCompVariantsMap.defaultVariants[0] = {
				getContent: () => {
					return {
						defaultVariantName: sFirstVariantName
					};
				}
			};
			this.mCompVariantsMap.defaultVariants[1] = {
				getContent: () => {
					return {
						defaultVariantName: sDefaultVariantName
					};
				}
			};
			this.mCompVariantsMap.byId = {
				[sFirstVariantName]: {}
			};

			assert.strictEqual(
				Utils.getDefaultVariantId(this.mCompVariantsMap),
				sDefaultVariantName,
				"the default variant ID is returned"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});