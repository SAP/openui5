/* global QUnit */

sap.ui.define([
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], (
	isEmptyObject,
	merge,
	Utils,
	FlexObjectFactory,
	DataSelector,
	FlexState,
	DependencyHandler,
	FlexObjectState,
	VariantManagementState,
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
			sandbox.stub(Utils, "checkIfDependencyIsStillValid").returns(true);
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
			sandbox.stub(Utils, "checkIfDependencyIsStillValid").returns(false);
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
			const oValidityCheck = sandbox.stub(Utils, "checkIfDependencyIsStillValid");
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
});