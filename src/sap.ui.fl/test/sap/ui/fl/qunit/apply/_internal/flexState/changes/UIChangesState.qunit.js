/* global QUnit */

sap.ui.define([
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	isEmptyObject,
	merge,
	Utils,
	FlexObjectFactory,
	DataSelector,
	FlexState,
	DependencyHandler,
	UIChangesState,
	VariantManagementState,
	sinon,
	FlQUnitUtils,
	RtaQunitUtils
) {
	"use strict";
	var sandbox = sinon.createSandbox();

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
		QUnit.test("DataSelector invalidation", function(assert) {
			const aRelevantDataSelectorIds = ["vmIndependentCompleteDependencyMap", "vmIndependentUIChanges", "allUIChanges"];
			let iCounter = 0;
			sandbox.stub(VariantManagementState, "getDependencyMap").returns(DependencyHandler.createEmptyDependencyMap());
			UIChangesState.getVMIndependentCompleteDependencyMap(sReference);
			const oSetCacheSpy = sandbox.stub(DataSelector.prototype, "_clearCache");
			oSetCacheSpy.callsFake(function(...args) {
				oSetCacheSpy.wrappedMethod.apply(this, args);
				if (aRelevantDataSelectorIds.includes(this.getId())) {
					iCounter++;
				}
			});

			FlexState.addDirtyFlexObject(sReference, FlexObjectFactory.createUIChange({}));
			UIChangesState.getVMIndependentCompleteDependencyMap(sReference);
			assert.strictEqual(iCounter, 3, "all 3 data selectors are invalidated");
			iCounter = 0;

			FlexState.addDirtyFlexObject(sReference, FlexObjectFactory.createUIChange({variantReference: "foo"}));
			UIChangesState.getVMIndependentCompleteDependencyMap(sReference);
			assert.strictEqual(iCounter, 1, "only 1 data selectors are invalidated");
			iCounter = 0;

			FlexState.addDirtyFlexObject(sReference, FlexObjectFactory.createAppDescriptorChange({}));
			UIChangesState.getVMIndependentCompleteDependencyMap(sReference);
			assert.strictEqual(iCounter, 0, "no data selectors is invalidated");
			iCounter = 0;
		});

		QUnit.test("getAllUIChanges", function(assert) {
			assert.strictEqual(UIChangesState.getAllUIChanges(sReference).length, 6, "all changes are returned");

			FlexState.addDirtyFlexObject(sReference, FlexObjectFactory.createUIChange({}));
			assert.strictEqual(UIChangesState.getAllUIChanges(sReference).length, 7, "the dirty change is now also part of the return");

			FlexState.addDirtyFlexObject(sReference, FlexObjectFactory.createAppDescriptorChange({}));
			assert.strictEqual(UIChangesState.getAllUIChanges(sReference).length, 7, "the app descriptor change is not returned");

			FlexState.addDirtyFlexObject(sReference, FlexObjectFactory.createUIChange({variantReference: "foo"}));
			assert.strictEqual(UIChangesState.getAllUIChanges(sReference).length, 8, "the var dependent change is returned");
		});

		QUnit.test("getVariantIndependentUIChanges", function(assert) {
			assert.strictEqual(
				UIChangesState.getVariantIndependentUIChanges(sReference).length,
				2, "only the variant independent changes are returned"
			);
		});
	});

	QUnit.done(function() {
		oAppComponent._restoreGetAppComponentStub();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
