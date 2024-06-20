/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Text",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	Text,
	JsControlTreeModifier,
	Control,
	Applier,
	ChangeUtils,
	FlexCustomData,
	Reverter,
	DependencyHandler,
	FlexObjectState,
	UIChange,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sControlId = "foo";
	const sReference = "appComponent";

	QUnit.module("revertChangeOnControl", {
		beforeEach() {
			this.oChange = new UIChange({
				selector: {
					id: sControlId,
					isIsLocal: false
				}
			});
			this.oAppliedChange = new UIChange({
				selector: {
					id: sControlId,
					isIsLocal: false
				}
			});
			this.oAppliedChange.markFinished();
			this.oControl = new Control(sControlId);
			this.mPropertyBag = {
				modifier: JsControlTreeModifier
			};
			this.oRevertChangeStub = sandbox.stub().resolves();
			this.oSetChangeRevertDataStub = sandbox.stub();
			this.oGetChangeHandlerStub = sandbox.stub(ChangeUtils, "getChangeHandler").resolves({
				revertChange: this.oRevertChangeStub,
				setChangeRevertData: this.oSetChangeRevertDataStub
			});
			this.oLogStub = sandbox.stub(Log, "error");
		},
		afterEach() {
			sandbox.restore();
			this.oControl.destroy();
		}
	}, function() {
		QUnit.test("with an unavailable change handler", function(assert) {
			this.oGetChangeHandlerStub.restore();
			sandbox.stub(ChangeUtils, "getChangeHandler").rejects(Error("no change handler"));

			return Reverter.revertChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function(oResult) {
				assert.equal(oResult, false, "the function returns false");
				assert.equal(this.oRevertChangeStub.callCount, 0, "the change handler was not called");
				assert.equal(this.oLogStub.callCount, 1, "an error was logged");
				assert.ok(this.oLogStub.lastCall.args[0].indexOf("no change handler") > -1, "the specific message was logged");
			}.bind(this));
		});

		QUnit.test("with an applied change with revert data and available change handler", function(assert) {
			sandbox.stub(this.oAppliedChange, "hasRevertData").returns(true);
			var oUpdateAggregationStub = sandbox.stub(JsControlTreeModifier, "updateAggregation");

			return Reverter.revertChangeOnControl(this.oAppliedChange, this.oControl, this.mPropertyBag).then(function(oResult) {
				assert.deepEqual(oResult, this.oControl, "the control is returned");
				assert.equal(this.oRevertChangeStub.callCount, 1, "the change handler was called");
				assert.equal(oUpdateAggregationStub.callCount, 0, "the function was not called");
			}.bind(this));
		});

		QUnit.test("with an applied change with revert data and available change handler returning a new control", function(assert) {
			sandbox.stub(this.oAppliedChange, "hasRevertData").returns(true);
			this.oRevertChangeStub.callsFake(function() {
				this.oControl.destroy();
				this.oText = new Text(sControlId);
				return Promise.resolve();
			}.bind(this));

			return Reverter.revertChangeOnControl(this.oAppliedChange, this.oControl, this.mPropertyBag).then(function(oResult) {
				assert.deepEqual(oResult, this.oText, "the new control is returned");
				assert.equal(this.oRevertChangeStub.callCount, 1, "the change handler was called");
				this.oText.destroy();
			}.bind(this));
		});

		QUnit.test("with an applied change with revert data and available change handler and the change handler rejects", function(assert) {
			var sErrorMessage = "change handler reject";
			this.oRevertChangeStub.rejects(new Error(sErrorMessage));
			return Reverter.revertChangeOnControl(this.oAppliedChange, this.oControl, this.mPropertyBag).then(function(oResult) {
				assert.equal(oResult, false, "the function returns false");
				assert.equal(this.oRevertChangeStub.callCount, 1, "the change handler was called");
				assert.equal(this.oLogStub.callCount, 1, "an error was logged");
				assert.ok(this.oLogStub.lastCall.args[0].indexOf(sErrorMessage) > -1, "the specific message was logged");
			}.bind(this));
		});

		QUnit.test("with a change currently being applied and apply working fine", function(assert) {
			sandbox.stub(this.oAppliedChange, "hasApplyProcessStarted").returns(true);
			var oIsApplyFinishedStub = sandbox.stub(this.oAppliedChange, "isSuccessfullyApplied").returns(false);
			var oAddPromiseStub = sandbox.stub(this.oAppliedChange, "addPromiseForApplyProcessing").callsFake(function() {
				oIsApplyFinishedStub.returns(true);
				return Promise.resolve();
			});

			return Reverter.revertChangeOnControl(this.oAppliedChange, this.oControl, this.mPropertyBag).then(function(oResult) {
				assert.ok(oResult, "the return value is truthy");
				assert.equal(oAddPromiseStub.callCount, 1, "the function was called");
				assert.equal(this.oRevertChangeStub.callCount, 1, "the change handler was called");
			}.bind(this));
		});

		QUnit.test("with a change currently being applied and apply throwing an error", function(assert) {
			var sErrorMessage = "myError";
			sandbox.stub(this.oChange, "hasApplyProcessStarted").returns(true);
			sandbox.stub(this.oChange, "isSuccessfullyApplied").returns(false);
			var oAddPromiseStub = sandbox.stub(this.oChange, "addPromiseForApplyProcessing").resolves({
				error: sErrorMessage
			});

			return Reverter.revertChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function(oResult) {
				assert.equal(oResult, false, "the function returns false");
				assert.equal(oAddPromiseStub.callCount, 1, "the function was called");
				assert.equal(this.oRevertChangeStub.callCount, 0, "the change handler was not called");
				assert.equal(this.oLogStub.callCount, 1, "an error was logged");
				assert.ok(this.oLogStub.lastCall.args[0].indexOf(sErrorMessage) > -1, "the specific message was logged");
			}.bind(this));
		});

		QUnit.test("with an unapplied change", function(assert) {
			return Reverter.revertChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function(oResult) {
				assert.equal(oResult, false, "the function returns false");
				assert.equal(this.oRevertChangeStub.callCount, 0, "the change handler was not called");
				assert.equal(this.oLogStub.callCount, 1, "an error was logged");
				assert.ok(this.oLogStub.lastCall.args[0].indexOf("Change was never applied") > -1, "the specific message was logged");
			}.bind(this));
		});

		QUnit.test("with a failed change", function(assert) {
			sandbox.stub(this.oChange, "isSuccessfullyApplied").returns(false);
			return Reverter.revertChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function(bResult) {
				assert.notOk(bResult, "the function returns false");
				assert.ok(this.oRevertChangeStub.notCalled, "the change handler was not called");
				assert.ok(this.oLogStub.calledOnce, "an error was logged");
				assert.ok(this.oLogStub.lastCall.args[0].includes("Change was never applied"), "the specific message was logged");
			}.bind(this));
		});

		QUnit.test("with a template being affected", function(assert) {
			var oUpdateAggregationStub = sandbox.stub(JsControlTreeModifier, "updateAggregation");
			sandbox.stub(ChangeUtils, "getControlIfTemplateAffected").returns({
				bTemplateAffected: true,
				control: this.oControl
			});

			return Reverter.revertChangeOnControl(this.oAppliedChange, this.oControl, this.mPropertyBag).then(function(oResult) {
				assert.ok(oResult, "the return value is truthy");
				assert.equal(oUpdateAggregationStub.callCount, 1, "the function was called");
			});
		});
	});

	QUnit.module("revertMultipleChanges", {
		beforeEach() {
			this.oChange = new UIChange({
				selector: {
					id: sControlId,
					isIsLocal: false
				}
			});
			this.oFailingChange = new UIChange({
				selector: {
					id: "unavailable",
					isIsLocal: false
				}
			});
			this.oAppliedChange0 = new UIChange({
				selector: {
					id: sControlId,
					isIsLocal: false
				}
			});
			this.oAppliedChange1 = new UIChange({
				selector: {
					id: sControlId,
					isIsLocal: false
				}
			});
			this.oAppliedChange0.markFinished();
			this.oAppliedChange1.markFinished();

			this.oControl = new Control(sControlId);
			this.mPropertyBag = {
				modifier: JsControlTreeModifier,
				reference: sReference
			};
			this.oRemoveFromMapSpy = sandbox.spy(DependencyHandler, "removeChangeFromMap");
			this.oRemoveFromDepSpy = sandbox.spy(DependencyHandler, "removeChangeFromDependencies");
			this.oDestroyCDStub = sandbox.stub(FlexCustomData, "destroyAppliedCustomData").resolves();
			this.oAddPreConStub = sandbox.stub(Applier, "addPreConditionForInitialChangeApplying");
			sandbox.stub(Reverter, "revertChangeOnControl")
			.onCall(0).resolves(false)
			.onCall(1).resolves(true)
			.onCall(2).resolves(this.oControl);
		},
		afterEach() {
			sandbox.restore();
			this.oControl.destroy();
		}
	}, function() {
		QUnit.test("with applied changes and one unapplied and one pointing to an unavailable control", async function(assert) {
			const aChanges = [this.oChange, this.oAppliedChange0, this.oFailingChange, this.oAppliedChange1];
			const oLiveDependencyMap = FlexObjectState.getLiveDependencyMap(sReference);
			DependencyHandler.addChangeAndUpdateDependencies(this.oAppliedChange1, sReference, oLiveDependencyMap);
			DependencyHandler.addChangeAndUpdateDependencies(this.oFailingChange, sReference, oLiveDependencyMap);
			DependencyHandler.addChangeAndUpdateDependencies(this.oAppliedChange0, sReference, oLiveDependencyMap);
			assert.strictEqual(oLiveDependencyMap.aChanges.length, 3, "all changes are in the map");

			await Reverter.revertMultipleChanges(aChanges, this.mPropertyBag);
			assert.ok(this.oAddPreConStub.called, "the promise was set to the applier");

			assert.strictEqual(this.oDestroyCDStub.callCount, 3, "destroyAppliedCustomData was called for all non failing changes");
			assert.strictEqual(this.oDestroyCDStub.firstCall.args[0].getId(), this.oControl.getId(), "the correct value is passed");
			assert.strictEqual(this.oDestroyCDStub.firstCall.args[1].getId(), this.oChange.getId(), "the first change' CustomData was destroyed");
			assert.strictEqual(this.oDestroyCDStub.secondCall.args[0], true, "the correct value is passed");
			assert.strictEqual(this.oDestroyCDStub.secondCall.args[1].getId(), this.oAppliedChange0.getId(), "the second change' CustomData was destroyed");
			assert.strictEqual(this.oDestroyCDStub.thirdCall.args[0].getId(), this.oControl.getId(), "the correct value is passed");
			assert.strictEqual(this.oDestroyCDStub.thirdCall.args[1].getId(), this.oAppliedChange1.getId(), "the third change' CustomData was destroyed");

			assert.strictEqual(this.oRemoveFromDepSpy.callCount, 3, "applied and failing changes were removed from the dependencies");
			assert.strictEqual(this.oRemoveFromMapSpy.callCount, 3, "applied and failing changes were removed from the map");
			assert.strictEqual(this.oRemoveFromMapSpy.firstCall.args[1], this.oAppliedChange0.getId(), "change0 was reverted first");
			assert.strictEqual(this.oRemoveFromMapSpy.secondCall.args[1], this.oFailingChange.getId(), "failing change was reverted second");
			assert.strictEqual(this.oRemoveFromMapSpy.thirdCall.args[1], this.oAppliedChange1.getId(), "change1 was reverted third");
			assert.strictEqual(oLiveDependencyMap.aChanges.length, 0, "applied and failed changes are removed from the map");

			aChanges.forEach(function(oChange) {
				assert.ok(oChange.isQueuedForRevert(), "the change was queued for revert");
			});
		});

		QUnit.test("with an empty array of changes", async function(assert) {
			await Reverter.revertMultipleChanges([], this.mPropertyBag);
			assert.strictEqual(this.oRemoveFromMapSpy.callCount, 0, "the change was not removed from the map");
			assert.strictEqual(this.oRemoveFromDepSpy.callCount, 0, "the change was not removed from the dependencies");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
