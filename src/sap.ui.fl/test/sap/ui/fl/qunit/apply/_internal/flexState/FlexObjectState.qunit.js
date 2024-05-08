/* global QUnit */

sap.ui.define([
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], (
	isEmptyObject,
	merge,
	JsControlTreeModifier,
	Control,
	Applier,
	FlexCustomData,
	Reverter,
	ChangeUtils,
	FlexObjectFactory,
	UIChange,
	FlexState,
	DependencyHandler,
	VariantManagementState,
	FlexObjectState,
	sinon,
	FlQUnitUtils,
	RtaQunitUtils
) => {
	"use strict";
	const sandbox = sinon.createSandbox();
	const sReference = "my.reference";
	const oAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, sReference);

	QUnit.module("Given an initialized FlexState with some UIChanges", {
		async beforeEach() {
			this.oChange1 = {
				fileName: "fileNameChange1",
				selector: { id: "controlId1" }
			};
			this.oChange2 = {
				fileName: "fileNameChange2",
				selector: { id: "controlId2" },
				dependentSelector: {
					dependentSelector1: { id: "controlId1" }
				}
			};
			this.oChange3 = {
				fileName: "fileNameChange3",
				selector: { id: "controlId3" },
				variantReference: "foo"
			};
			this.oChange4 = {
				fileName: "fileNameChange4",
				selector: { id: "controlId4" },
				dependentSelector: {
					dependentSelector1: { id: "controlId3" }
				},
				variantReference: "foo"
			};
			this.oChange5 = {
				fileName: "fileNameChange5",
				selector: { id: "controlId1" },
				variantReference: "foo"
			};
			this.oChange6 = {
				fileName: "fileNameChange6",
				selector: { persistencyKey: "persistencyKey1" }
			};
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {
				changes: [this.oChange1, this.oChange2, this.oChange6],
				variantDependentControlChanges: [this.oChange3, this.oChange4, this.oChange5]
			});
		},
		afterEach() {
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getCompleteDependencyMap", function(assert) {
			// structure modified to make the assertions easier (no flex object instances available here)
			const oExpectedDependencyMap = {
				aChangeIds: ["fileNameChange1", "fileNameChange2", "fileNameChange3", "fileNameChange4", "fileNameChange5"],
				mDependencies: {
					fileNameChange1: {
						changeObject: this.oChange1,
						controlsDependencies: ["controlId1"],
						dependencies: [],
						dependentIds: []
					},
					fileNameChange2: {
						changeObject: this.oChange2,
						dependencies: ["fileNameChange1"],
						controlsDependencies: ["controlId1", "controlId2"],
						dependentIds: ["controlId1"]
					},
					fileNameChange3: {
						changeObject: this.oChange3,
						dependencies: [],
						controlsDependencies: ["controlId3"],
						dependentIds: []
					},
					fileNameChange4: {
						changeObject: this.oChange4,
						dependencies: ["fileNameChange3"],
						controlsDependencies: ["controlId3", "controlId4"],
						dependentIds: ["controlId3"]
					},
					fileNameChange5: {
						changeObject: this.oChange5,
						dependencies: ["fileNameChange"],
						controlsDependencies: ["controlId1"],
						dependentIds: ["controlId1"]
					}
				},
				mChanges: {
					controlId1: [this.oChange1.fileName, this.oChange5.fileName],
					controlId2: [this.oChange2.fileName],
					controlId3: [this.oChange3.fileName],
					controlId4: [this.oChange4.fileName]
				},
				mControlsWithDependencies: {
					controlId1: ["fileNameChange1", "fileNameChange2", "fileNameChange5"],
					controlId2: ["fileNameChange2"],
					controlId3: ["fileNameChange3", "fileNameChange4"],
					controlId4: ["fileNameChange4"]
				},
				mDependentChangesOnMe: {
					fileNameChange1: ["fileNameChange2"],
					fileNameChange3: ["fileNameChange4"]
				}
			};
			const oDependencyMap = FlexObjectState.getCompleteDependencyMap(sReference);
			oDependencyMap.aChanges.forEach((oFlexObject) => {
				assert.ok(oExpectedDependencyMap.aChangeIds.includes(oFlexObject.getId()), "aChanges is correct");
			});
			Object.keys(oDependencyMap.mDependencies).forEach((sId) => {
				assert.ok(oExpectedDependencyMap.aChangeIds.includes(sId), "mDependencies are correct");
			});
			Object.keys(oDependencyMap.mChanges).forEach((sKey) => {
				assert.deepEqual(
					oDependencyMap.mChanges[sKey].map((oFlexObject) => oFlexObject.getId()),
					oExpectedDependencyMap.mChanges[sKey],
					"mChanges are correct"
				);
			});
			assert.deepEqual(
				oDependencyMap.mControlsWithDependencies,
				oExpectedDependencyMap.mControlsWithDependencies,
				"mControlsWithDependencies is correct"
			);
			assert.deepEqual(
				oDependencyMap.mDependentChangesOnMe,
				oExpectedDependencyMap.mDependentChangesOnMe,
				"mDependentChangesOnMe is correct"
			);
		});

		QUnit.test("getLiveDependencyMap", function(assert) {
			const oDependencyMap = {foo: "bar"};
			const oGetStub = sandbox.stub(FlexState, "getRuntimeOnlyData").returns({
				liveDependencyMap: oDependencyMap
			});
			const oLiveDependencyMap = FlexObjectState.getLiveDependencyMap(sReference);
			assert.strictEqual(oGetStub.lastCall.args[0], sReference, "the reference was passed");
			assert.strictEqual(oLiveDependencyMap, oDependencyMap, "the FlexState returns the dependency map");
		});

		QUnit.test("getLiveDependencyMap without runtimeOnlyData", function(assert) {
			const oGetStub = sandbox.stub(FlexState, "getRuntimeOnlyData").returns({});
			const oDependencyHandlerStub = sandbox.stub(DependencyHandler, "createEmptyDependencyMap");
			const oLiveDependencyMap = FlexObjectState.getLiveDependencyMap(sReference);
			assert.strictEqual(oGetStub.lastCall.args[0], sReference, "the reference was passed");
			assert.strictEqual(oDependencyHandlerStub.callCount, 1, "an empty dependency map was created");
			assert.strictEqual(oLiveDependencyMap, oDependencyHandlerStub.lastCall.returnValue, "the FlexState returns the dependency map");
		});

		QUnit.test("copyDependenciesFromCompleteDependencyMap with valid dependencies", function(assert) {
			sandbox.stub(ChangeUtils, "checkIfDependencyIsStillValid").returns(true);
			// simulate all changes being applied successfully
			const oDependencyMap = FlexObjectState.getLiveDependencyMap(sReference);
			DependencyHandler.removeControlsDependencies(oDependencyMap, "controlId1");
			DependencyHandler.removeControlsDependencies(oDependencyMap, "controlId2");
			DependencyHandler.removeChangeFromDependencies(oDependencyMap, "fileNameChange1", "controlId1");
			DependencyHandler.removeChangeFromDependencies(oDependencyMap, "fileNameChange2", "controlId2");
			assert.ok(isEmptyObject(oDependencyMap.mDependencies));

			FlexObjectState.copyDependenciesFromCompleteDependencyMap(oDependencyMap.mChanges.controlId2[0], oAppComponent);
			assert.ok(oDependencyMap.mDependencies.fileNameChange2);
			assert.deepEqual(oDependencyMap.mDependentChangesOnMe.fileNameChange1, ["fileNameChange2"]);
			assert.deepEqual(oDependencyMap.mControlsWithDependencies.controlId1, ["fileNameChange2"]);
			assert.deepEqual(oDependencyMap.mControlsWithDependencies.controlId2, ["fileNameChange2"]);

			FlexObjectState.copyDependenciesFromCompleteDependencyMap(oDependencyMap.mChanges.controlId1[0], oAppComponent);
			assert.ok(oDependencyMap.mDependencies.fileNameChange1);
			assert.deepEqual(oDependencyMap.mDependentChangesOnMe.fileNameChange1, ["fileNameChange2"]);
			assert.deepEqual(oDependencyMap.mControlsWithDependencies.controlId1, ["fileNameChange2", "fileNameChange1"]);
			assert.deepEqual(oDependencyMap.mControlsWithDependencies.controlId2, ["fileNameChange2"]);
		});

		QUnit.test("copyDependenciesFromCompleteDependencyMap with invalid dependencies", function(assert) {
			sandbox.stub(ChangeUtils, "checkIfDependencyIsStillValid").returns(false);
			// simulate all changes being applied successfully
			// the variant dependent changes are not part of the live dependency map
			const oDependencyMap = FlexObjectState.getLiveDependencyMap(sReference);
			DependencyHandler.removeControlsDependencies(oDependencyMap, "controlId1");
			DependencyHandler.removeControlsDependencies(oDependencyMap, "controlId2");
			DependencyHandler.removeChangeFromDependencies(oDependencyMap, "fileNameChange1", "controlId1");
			DependencyHandler.removeChangeFromDependencies(oDependencyMap, "fileNameChange2", "controlId2");
			assert.ok(isEmptyObject(oDependencyMap.mDependencies));

			FlexObjectState.copyDependenciesFromCompleteDependencyMap(oDependencyMap.mChanges.controlId2[0], oAppComponent);
			assert.ok(oDependencyMap.mDependencies.fileNameChange2);
			assert.notOk(oDependencyMap.mDependentChangesOnMe.fileNameChange1);
			assert.deepEqual(oDependencyMap.mControlsWithDependencies.controlId1, ["fileNameChange2"]);
			assert.deepEqual(oDependencyMap.mControlsWithDependencies.controlId2, ["fileNameChange2"]);

			FlexObjectState.copyDependenciesFromCompleteDependencyMap(oDependencyMap.mChanges.controlId1[0], oAppComponent);
			assert.ok(oDependencyMap.mDependencies.fileNameChange1);
			assert.notOk(oDependencyMap.mDependentChangesOnMe.fileNameChange1);
			assert.deepEqual(oDependencyMap.mControlsWithDependencies.controlId1, ["fileNameChange2", "fileNameChange1"]);
			assert.deepEqual(oDependencyMap.mControlsWithDependencies.controlId2, ["fileNameChange2"]);
		});

		QUnit.test("copyDependenciesFromCompleteDependencyMap with not existing dependencies", function(assert) {
			const oValidityCheck = sandbox.stub(ChangeUtils, "checkIfDependencyIsStillValid");
			// simulate all changes being applied successfully
			// the variant dependent changes are not part of the live dependency map
			const oDependencyMap = merge({}, FlexObjectState.getLiveDependencyMap(sReference));
			FlexObjectState.copyDependenciesFromCompleteDependencyMap(FlexObjectFactory.createUIChange({}), oAppComponent);
			assert.deepEqual(oDependencyMap, FlexObjectState.getLiveDependencyMap(sReference), "the map has not changed");
			assert.strictEqual(oValidityCheck.callCount, 0, "the check was not performed");
		});

		QUnit.test("getAllApplicableUIChanges", function(assert) {
			FlexState.addDirtyFlexObject(sReference, FlexObjectFactory.createUIChange({
				fileName: "setDefaultChange",
				fileType: "ctrl_variant_management_change",
				selector: { id: "foo"},
				changeType: "setDefault"
			}));
			FlexState.addDirtyFlexObject(sReference, FlexObjectFactory.createUIChange({
				fileName: "setFavoriteChange",
				fileType: "ctrl_variant_change",
				changeType: "setFavorite"
			}));
			const aAllApplicableUIChanges = FlexObjectState.getAllApplicableUIChanges(sReference);
			assert.strictEqual(aAllApplicableUIChanges.length, 5, "all UIChanges are returned");
		});

		QUnit.test("getOpenDependentChangesForControl with the given test data", function(assert) {
			const aOpenDependentChanges = FlexObjectState.getOpenDependentChangesForControl(
				{ id: "controlId1" }, oAppComponent
			);
			assert.strictEqual(aOpenDependentChanges.length, 2, "initially there are two open dependencies");
		});

		QUnit.test("getOpenDependentChangesForControl with an empty map", function(assert) {
			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(DependencyHandler.createEmptyDependencyMap());
			const aOpenDependentChanges = FlexObjectState.getOpenDependentChangesForControl(
				{ id: "controlId1" }, oAppComponent
			);
			assert.strictEqual(aOpenDependentChanges.length, 0, "then there are no dependencies found");
		});
	});

	QUnit.module("waitForChangesToBeApplied is called with a control ", {
		async beforeEach() {
			this.oChange1 = {
				fileName: "fileNameChange1",
				selector: { id: "controlId1" },
				changeType: "changeType1"
			};
			this.oChange2 = {
				fileName: "fileNameChange2",
				selector: { id: "controlId1" },
				changeType: "changeType1"
			};
			this.oChange3 = {
				fileName: "fileNameChange3",
				selector: { id: "controlId1" },
				changeType: "changeType2"
			};
			this.oChange4 = {
				fileName: "fileNameChange4",
				selector: { id: "controlId2" }
			};
			this.oChange5 = {
				fileName: "fileNameChange5",
				selector: { id: "controlId3" },
				dependentSelector: {
					dependentSelector1: { id: "controlId2" }
				}
			};
			this.oChange6 = {
				fileName: "fileNameChange5",
				selector: { id: "controlId4" },
				dependentSelector: {
					dependentSelector1: { id: "controlId3" }
				}
			};
			this.oControl1 = new Control("controlId1");
			this.oControl3 = new Control("controlId3");
			this.oControl4 = new Control("controlId4");

			this.oAddAppliedCustomDataSpy = sandbox.spy(FlexCustomData, "addAppliedCustomData");
			this.oDestroyAppliedCustomDataSpy = sandbox.spy(FlexCustomData, "destroyAppliedCustomData");
			this.oWaitForChangeApplySpy = sandbox.spy(UIChange.prototype, "addChangeProcessingPromises");

			this.oChangeHandlerApplyChangeStub = sandbox.stub().resolves(function(fnResolve) {
				setTimeout(function() {
					fnResolve();
				});
			});
			this.oChangeHandlerRevertChangeStub = sandbox.stub().resolves(function(fnResolve) {
				setTimeout(function() {
					fnResolve();
				});
			});

			this.oGetChangeHandlerStub = sandbox.stub(ChangeUtils, "getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub,
				revertChange: this.oChangeHandlerRevertChangeStub
			});

			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {
				changes: [this.oChange1, this.oChange2, this.oChange3, this.oChange4, this.oChange5, this.oChange6]
			});
		},
		afterEach() {
			FlexState.clearState();
			this.oControl1.destroy();
			this.oControl3.destroy();
			this.oControl4.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with no changes for the given control", async function(assert) {
			const oControlWithoutChange = new Control("noChange");
			await FlexObjectState.waitForFlexObjectsToBeApplied([{selector: {id: "noChange"}}]);
			assert.strictEqual(this.oWaitForChangeApplySpy.callCount, 0, "no change was waited for");
			oControlWithoutChange.destroy();
		});

		QUnit.test("with 3 queued changes dependent on each other and the first throwing an error", async function(assert) {
			const oChangeHandlerApplyChangeRejectStub = sandbox.stub().throws(new Error());
			this.oGetChangeHandlerStub.restore();
			this.oGetChangeHandlerStub = sandbox.stub(ChangeUtils, "getChangeHandler")
			.onCall(0).resolves({
				applyChange: oChangeHandlerApplyChangeRejectStub
			})
			.onCall(1).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			})
			.onCall(2).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			});

			Applier.applyAllChangesForControl(oAppComponent, sReference, this.oControl1);

			await FlexObjectState.waitForFlexObjectsToBeApplied([{selector: this.oControl1}]);
			assert.strictEqual(this.oAddAppliedCustomDataSpy.callCount, 2, "addCustomData was called 2 times");
		});

		QUnit.test("twice with 3 queued changes", async function(assert) {
			Applier.applyAllChangesForControl(oAppComponent, sReference, this.oControl1);

			FlexObjectState.waitForFlexObjectsToBeApplied([{selector: this.oControl1}]);
			await FlexObjectState.waitForFlexObjectsToBeApplied([{selector: this.oControl1}]);
			assert.strictEqual(this.oAddAppliedCustomDataSpy.callCount, 3, "addCustomData was called 3 times");
			assert.strictEqual(this.oWaitForChangeApplySpy.callCount, 6, "all changes were waited for");
		});

		QUnit.test("with 3 queued changes dependent on each other with an unavailable control dependency", async function(assert) {
			Applier.applyAllChangesForControl(oAppComponent, sReference, this.oControl1);
			await FlexObjectState.waitForFlexObjectsToBeApplied([{selector: this.oControl4}]);
			assert.strictEqual(this.oAddAppliedCustomDataSpy.callCount, 0, "addCustomData was not called");
			assert.strictEqual(this.oWaitForChangeApplySpy.callCount, 0, "no change was waited for");
		});

		QUnit.test("with 3 queued changes depending on one another and the last change already failed", async function(assert) {
			await Applier.applyAllChangesForControl(oAppComponent, sReference, this.oControl1);
			FlexObjectState.getAllApplicableUIChanges(sReference).find((oChange) => oChange.getId() === "fileNameChange3").markFailed("");
			await FlexObjectState.waitForFlexObjectsToBeApplied([{selector: this.oControl1}]);
			assert.strictEqual(this.oWaitForChangeApplySpy.callCount, 0, "no change was waited for");
		});

		QUnit.test("with 3 queued changes depending on one another with the last change failing", async function(assert) {
			const oChangeHandlerApplyChangeRejectStub = sandbox.stub().returns(new Promise(function(fnResolve, fnReject) {
				setTimeout(function() {
					fnReject(new Error());
				});
			}));
			this.oGetChangeHandlerStub.restore();
			this.oGetChangeHandlerStub = sandbox.stub(ChangeUtils, "getChangeHandler")
			.onCall(0).resolves({
				applyChange: oChangeHandlerApplyChangeRejectStub
			})
			.onCall(1).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			})
			.onCall(2).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			});

			Applier.applyAllChangesForControl(oAppComponent, sReference, this.oControl1);

			await FlexObjectState.waitForFlexObjectsToBeApplied([{selector: this.oControl1}]);
			assert.strictEqual(this.oAddAppliedCustomDataSpy.callCount, 2, "two changes were applied");
			assert.strictEqual(this.oWaitForChangeApplySpy.callCount, 3, "all changes were waited for");
		});

		QUnit.test("with 3 changes that will be reverted", async function(assert) {
			const aChanges = [];
			FlexObjectState.getAllApplicableUIChanges(sReference).forEach((oChange) => {
				if (oChange.getSelector().id === "controlId1") {
					oChange.markFinished();
					aChanges.push(oChange);
				}
			});
			Reverter.revertMultipleChanges(aChanges, {
				appCOmponent: oAppComponent,
				modifier: JsControlTreeModifier,
				flexController: this.oFlexController
			});
			await FlexObjectState.waitForFlexObjectsToBeApplied([{selector: this.oControl1}]);
			assert.strictEqual(this.oDestroyAppliedCustomDataSpy.callCount, 3, "all three changes got reverted");
			assert.strictEqual(this.oWaitForChangeApplySpy.callCount, 3, "all changes were waited for");
		});

		QUnit.test("with a variant switch going on", async function(assert) {
			let bCalled = false;
			VariantManagementState.setVariantSwitchPromise(sReference, new Promise(function(resolve) {
				setTimeout(function() {
					bCalled = true;
					resolve();
				});
			}));

			Applier.applyAllChangesForControl(oAppComponent, sReference, this.oControl1);
			await FlexObjectState.waitForFlexObjectsToBeApplied([{selector: this.oControl1}]);
			assert.ok(bCalled, "the function waited for the variant switch");
		});

		QUnit.test("with a change type filter and 3 queued changes - 1", async function(assert) {
			Applier.applyAllChangesForControl(oAppComponent, sReference, this.oControl1);
			await FlexObjectState.waitForFlexObjectsToBeApplied([{selector: this.oControl1, changeTypes: ["changeType1"]}]);
			assert.strictEqual(this.oWaitForChangeApplySpy.callCount, 2, "only two changes were waited for");
		});

		QUnit.test("with a change type filter and 3 queued changes - 2", async function(assert) {
			// the last change should be waited for, but because of dependencies all changes need to be waited for
			Applier.applyAllChangesForControl(oAppComponent, sReference, this.oControl1);
			await FlexObjectState.waitForFlexObjectsToBeApplied([{selector: this.oControl1, changeTypes: ["changeType2"]}]);
			assert.strictEqual(this.oWaitForChangeApplySpy.callCount, 3, "all changes was waited for");
		});
	});
});