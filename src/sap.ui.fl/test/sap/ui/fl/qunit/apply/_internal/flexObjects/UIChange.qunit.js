/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	_omit,
	JsControlTreeModifier,
	Control,
	FlexObjectFactory,
	States,
	Settings,
	Layer,
	sinon
) {
	"use strict";
	const sandbox = sinon.createSandbox();

	const oFileContent = {
		fileName: "foo",
		fileType: "change",
		reference: "sap.ui.demoapps.rta.fiorielements",
		content: {
			originalControlType: "sap.m.Label"
		},
		selector: {
			id: "bar",
			idIsLocal: true
		},
		dependentSelector: {
			origin: {
				id: "foobar",
				idIsLocal: true
			}
		},
		packageName: "$TMP",
		originalLanguage: "EN",
		projectId: "sap.ui.demoapps.rta.fiorielements",
		layer: Layer.CUSTOMER,
		texts: {
			originalText: {
				value: "My original text",
				type: "XFLD"
			}
		},
		namespace: "apps/sap.ui.demoapps.rta.fiorielements/changes/",
		support: {
			generator: "sap.ui.rta.command"
		},
		variantReference: "myVariantReference"
	};

	QUnit.module("UIChange Creation", {
		beforeEach() {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getUserId() {
					return "userId";
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("FlexObjectFactory.createUIChange and set/reset revert data", function(assert) {
			const oUIChange = FlexObjectFactory.createUIChange({ generator: "sap.ui.rta.command", ...oFileContent });
			const oExpectedFileContent = { ...oFileContent, dependentSelector: {} };
			oExpectedFileContent.support.user = "userId";
			assert.strictEqual(oUIChange.getApplyState(), States.ApplyState.INITIAL, "the apply state is set to initial");
			assert.deepEqual(oUIChange.getSelector(), {id: "bar", idIsLocal: true}, "the selector is part of the instance");
			assert.deepEqual(oUIChange.getDependentSelectors(), {}, "the dependent selector cannot be set initially via this function");
			assert.strictEqual(oUIChange.getVariantReference(), "myVariantReference", "the variant reference is part of the instance");
			assert.deepEqual(oUIChange.convertToFileContent(), oExpectedFileContent, "the change is converted back to file content");
			assert.strictEqual(oUIChange.isInInitialState(), true, "the isInInitialState function returns true");
			assert.strictEqual(oUIChange.isValidForDependencyMap(), true, "with a selector the function returns true");
			assert.strictEqual(oUIChange.hasRevertData(), false, "no revert data available yet");

			oUIChange.setRevertData("foo");
			assert.strictEqual(oUIChange.hasRevertData(), true, "revert data available");
			oUIChange.resetRevertData();
			assert.strictEqual(oUIChange.hasRevertData(), false, "revert data not available anymore");
			assert.strictEqual(oUIChange.getRevertData(), null, "revert data not available anymore");
		});

		QUnit.test("FlexObjectFactory.createUIChange in developer layer", function(assert) {
			const oUIChange = FlexObjectFactory.createUIChange({ ...oFileContent, layer: Layer.CUSTOMER_BASE });
			assert.notOk(oUIChange.getSupportInformation().user, "no user is set");
		});

		QUnit.test("FlexObjectFactory.createUIChange in customer layer and user already set", function(assert) {
			const oUIChange = FlexObjectFactory.createUIChange({ ...oFileContent, user: "myFancyUser"});
			assert.strictEqual(oUIChange.getSupportInformation().user, "myFancyUser", "the user is set correctly");
		});

		QUnit.test("FlexObjectFactory.createFromFileContent", function(assert) {
			const oUIChange = FlexObjectFactory.createFromFileContent({ ...oFileContent });
			assert.strictEqual(oUIChange.getApplyState(), States.ApplyState.INITIAL, "the apply state is set to initial");
			assert.deepEqual(oUIChange.getSelector(), {id: "bar", idIsLocal: true}, "the selector is part of the instance");
			assert.deepEqual(oUIChange.getDependentSelectors(), { origin: { id: "foobar", idIsLocal: true } }, "the dependent selector is part of the instance");
			assert.strictEqual(oUIChange.getVariantReference(), "myVariantReference", "the variant reference is part of the instance");
			assert.deepEqual(oUIChange.convertToFileContent(), oFileContent, "the change is converted back to file content");
		});
	});

	QUnit.module("ApplyState handling", {
		beforeEach() {
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Change.applyState", function(assert) {
			const oUIChange = FlexObjectFactory.createFromFileContent({ ...oFileContent });
			assert.strictEqual(oUIChange.getProperty("applyState"), States.ApplyState.INITIAL, "initially the state is INITIAL");

			oUIChange.setQueuedForApply();
			assert.strictEqual(oUIChange.isInInitialState(), false, "the change is not in the initial state anymore");
			oUIChange.setQueuedForApply();
			oUIChange.startApplying();
			assert.strictEqual(oUIChange._aQueuedProcesses.length, 1, "APPLY operation only added once");
			assert.strictEqual(oUIChange.getProperty("applyState"), States.ApplyState.APPLYING, "the applyState got changed correctly");
			assert.ok(oUIChange.hasApplyProcessStarted(), "the function returns the correct value");
			assert.notOk(oUIChange.isCurrentProcessFinished());
			assert.notOk(oUIChange.isQueuedForRevert());
			assert.ok(oUIChange.isQueuedForApply());

			oUIChange.markSuccessful();
			assert.strictEqual(oUIChange.getProperty("applyState"), States.ApplyState.APPLY_SUCCESSFUL, "the applyState got changed correctly");
			assert.ok(oUIChange.isSuccessfullyApplied(), "the function returns the correct value");
			assert.ok(oUIChange.isApplyProcessFinished(), "isApplyProcessFinished returns the correct value");
			assert.ok(oUIChange.isCurrentProcessFinished());
			assert.notOk(oUIChange.isQueuedForRevert());
			assert.notOk(oUIChange.isQueuedForApply());

			oUIChange.markFailed();
			assert.strictEqual(oUIChange.getProperty("applyState"), States.ApplyState.APPLY_FAILED, "the applyState got changed correctly");
			assert.ok(oUIChange.hasApplyProcessFailed(), "the function returns the correct value");
			assert.ok(oUIChange.isApplyProcessFinished(), "isApplyProcessFinished returns the correct value");
			assert.ok(oUIChange.isCurrentProcessFinished());
			assert.notOk(oUIChange.isQueuedForRevert());
			assert.notOk(oUIChange.isQueuedForApply());

			oUIChange.markFinished();
			assert.strictEqual(oUIChange.getProperty("applyState"), States.ApplyState.APPLY_SUCCESSFUL, "the legacy setter is working");
			assert.ok(oUIChange.isCurrentProcessFinished());
			assert.notOk(oUIChange.isQueuedForRevert());
			assert.notOk(oUIChange.isQueuedForApply());

			oUIChange.setQueuedForRevert();
			oUIChange.setQueuedForRevert();
			oUIChange.startReverting();
			assert.strictEqual(oUIChange._aQueuedProcesses.length, 1, "REVERT operation only added once");
			assert.strictEqual(oUIChange.getProperty("applyState"), States.ApplyState.REVERTING, "the applyState got changed correctly");
			assert.ok(oUIChange.hasRevertProcessStarted(), "the function returns the correct value");
			assert.notOk(oUIChange.isCurrentProcessFinished());
			assert.ok(oUIChange.isQueuedForRevert());
			assert.notOk(oUIChange.isQueuedForApply());

			oUIChange.markRevertFinished();
			assert.strictEqual(oUIChange.getProperty("applyState"), States.ApplyState.REVERT_FINISHED, "the applyState got changed correctly");
			assert.ok(oUIChange.isRevertProcessFinished(), "the function returns the correct value");
			assert.ok(oUIChange.isCurrentProcessFinished());
			assert.notOk(oUIChange.isQueuedForRevert());
			assert.notOk(oUIChange.isQueuedForApply());
		});

		QUnit.test("ChangeProcessingPromise: resolve", function(assert) {
			const done = assert.async();
			const oUIChange = FlexObjectFactory.createFromFileContent({ ...oFileContent });
			const oPromise = oUIChange.addPromiseForApplyProcessing();
			const oPromise2 = oUIChange.addChangeProcessingPromise(States.Operations.REVERT);

			Promise.all([oPromise, oPromise2])
			.then(function() {
				assert.ok(true, "the function resolves");
				done();
			});

			oUIChange.markFinished();
			oUIChange.markRevertFinished();
		});

		QUnit.test("ChangeProcessingPromise: reject", function(assert) {
			const done = assert.async();
			const oUIChange = FlexObjectFactory.createFromFileContent({ ...oFileContent });
			const oPromise = oUIChange.addPromiseForApplyProcessing();
			const oPromise2 = oUIChange.addChangeProcessingPromise(States.Operations.REVERT);

			Promise.all([oPromise, oPromise2])
			.then(function() {
				assert.ok(true, "the promises were resolved");
				done();
			});

			oUIChange.markFinished();
			oUIChange.markRevertFinished();
		});

		QUnit.test("ChangeProcessingPromise: addChangeProcessingPromises when no apply/revert operation started", function(assert) {
			const done = assert.async();
			const oUIChange = FlexObjectFactory.createFromFileContent({ ...oFileContent });

			let aPromises = oUIChange.addChangeProcessingPromises();
			assert.equal(aPromises.length, 1, "1 promise got added");

			oUIChange.setQueuedForApply();
			oUIChange.setQueuedForRevert();
			aPromises = oUIChange.addChangeProcessingPromises();
			assert.equal(aPromises.length, 3, "3 promises got added");

			Promise.all(aPromises)
			.then(function() {
				assert.ok(true, "the function resolves");
				done();
			});

			oUIChange.markFinished();
			oUIChange.markRevertFinished();
		});

		QUnit.test("ChangeProcessingPromise: addChangeProcessingPromises when apply operation started", function(assert) {
			const done = assert.async();
			const oUIChange = FlexObjectFactory.createFromFileContent({ ...oFileContent });
			oUIChange.setQueuedForApply();
			oUIChange.startApplying();
			oUIChange.setQueuedForRevert();

			const aPromises = oUIChange.addChangeProcessingPromises();
			assert.equal(aPromises.length, 2, "2 promises got added");

			Promise.all(aPromises)
			.then(function() {
				assert.ok(true, "the function resolves");
				done();
			});

			oUIChange.markFinished();
			oUIChange.markRevertFinished();
		});
	});

	QUnit.module("Dependent Selector handling", {
		beforeEach() {
			this.oControl = new Control("myId");
			this.oControl2 = new Control("myId2");
			this.oUIChange = FlexObjectFactory.createUIChange({ ...oFileContent });
			this.mPropertyBag = {
				modifier: JsControlTreeModifier
			};
		},
		afterEach() {
			this.oControl.destroy();
			this.oControl2.destroy();
			this.oUIChange.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("addDependentSelector / getDependentControl - error cases", function(assert) {
			assert.throws(
				function() { this.oUIChange.addDependentControl(null, "alias", {}); },
				/Parameter vControl is mandatory/,
				"an error message is raised referring to the missing control"
			);
			assert.throws(
				function() { this.oUIChange.addDependentControl(this.oControl, "", {}); },
				/Parameter sAlias is mandatory/,
				"an error message is raised referring to the missing alias"
			);
			assert.throws(
				function() { this.oUIChange.addDependentControl(this.oControl, "alias", {}); },
				/Parameter mPropertyBag is mandatory/,
				"an error message is raised referring to the missing mPropertyBag"
			);

			this.oUIChange.addDependentControl(this.oControl, "origin", this.mPropertyBag);
			assert.throws(
				function() { this.oUIChange.addDependentControl(this.oControl, "origin", this.mPropertyBag); },
				/Alias 'origin' already exists in the change./,
				"an error message is raised referring to the already existing dependent control"
			);

			assert.throws(
				function() { this.oUIChange.getDependentControl("", this.mPropertyBag); },
				/Parameter sAlias is mandatory/,
				"an error message is raised referring to the missing alias"
			);
			assert.throws(
				function() { this.oUIChange.getDependentControl("origin"); },
				/Parameter mPropertyBag is mandatory/,
				"an error message is raised referring to the missing mPropertyBag"
			);
		});

		QUnit.test("add passing controls directly", function(assert) {
			this.oUIChange.addDependentControl(this.oControl, "origin", this.mPropertyBag);
			this.oUIChange.addDependentControl(this.oControl2, "originalSelector2", this.mPropertyBag);
			const oDependentSelectors = {
				origin: { id: "myId", idIsLocal: false },
				originalSelector2: { id: "myId2", idIsLocal: false }
			};

			assert.deepEqual(this.oUIChange.getDependentSelectors(), oDependentSelectors, "the dependent selectors property is correct");
			assert.deepEqual(this.oUIChange.getDependentControl("origin", this.mPropertyBag), this.oControl, "the control is returned");
			assert.deepEqual(this.oUIChange.getDependentControl("originalSelector2", this.mPropertyBag), this.oControl2, "the control is returned");
			assert.deepEqual(this.oUIChange.getDependentSelectorList(), [oFileContent.selector, oDependentSelectors.origin, oDependentSelectors.originalSelector2], "the selectors are returned in an array");
			assert.deepEqual(this.oUIChange.getDependentControlSelectorList(), [oDependentSelectors.origin, oDependentSelectors.originalSelector2], "the selectors are returned in an array");
		});

		QUnit.test("add passing an array", function(assert) {
			this.oUIChange.addDependentControl([this.oControl, this.oControl2], "origin", this.mPropertyBag);
			const oDependentSelectors = {
				origin: [
					{ id: "myId", idIsLocal: false },
					{ id: "myId2", idIsLocal: false }
				]
			};

			assert.deepEqual(this.oUIChange.getDependentSelectors(), oDependentSelectors, "the dependent selectors property is correct");
			assert.deepEqual(this.oUIChange.getDependentControl("origin", this.mPropertyBag), [this.oControl, this.oControl2], "the control is returned");
			assert.deepEqual(this.oUIChange.getDependentSelectorList(), [oFileContent.selector, oDependentSelectors.origin[0], oDependentSelectors.origin[1]], "the selectors are returned in an array");
			assert.deepEqual(this.oUIChange.getDependentControlSelectorList(), [oDependentSelectors.origin[0], oDependentSelectors.origin[1]], "the selectors are returned in an array");
		});

		QUnit.test("add with 'originalSelector'", function(assert) {
			this.oUIChange.addDependentControl(this.oControl, "origin", this.mPropertyBag);
			this.oUIChange.addDependentControl(this.oControl2, "originalSelector", this.mPropertyBag);
			const oDependentSelectors = {
				origin: { id: "myId", idIsLocal: false },
				originalSelector: { id: "myId2", idIsLocal: false }
			};

			assert.deepEqual(this.oUIChange.getDependentSelectors(), oDependentSelectors, "the dependent selectors property is correct");
			assert.deepEqual(this.oUIChange.getDependentControl("origin", this.mPropertyBag), this.oControl, "the control is returned");
			assert.deepEqual(this.oUIChange.getDependentControl("originalSelector", this.mPropertyBag), this.oControl2, "the control is returned");
			assert.deepEqual(this.oUIChange.getDependentSelectorList(), [oFileContent.selector], "only the original selector is returned");
			assert.deepEqual(this.oUIChange.getDependentControlSelectorList(), [], "an empty array is returned");
			assert.deepEqual(this.oUIChange.getOriginalSelector(), oDependentSelectors.originalSelector, "the selector is returned");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});