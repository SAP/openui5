
/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	FlexObjectFactory,
	DependencyHandler,
	FlexObjectState,
	FlexState,
	UIChangeManager,
	Layer,
	sinon,
	FlQUnitUtils,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sReference = "my.fancy.reference";

	function createChange(sId, sLayer, sFileType, sVariantReference, oSelector) {
		return FlexObjectFactory.createFromFileContent(
			{
				fileType: sFileType || "change",
				fileName: sId || "fileNameChange0",
				layer: sLayer || Layer.USER,
				reference: "appComponentReference",
				namespace: "namespace",
				selector: oSelector || {id: "control1"},
				variantReference: sVariantReference || ""
			}
		);
	}

	QUnit.module("addChanges", {
		beforeEach() {
			this.oAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sReference);
			return FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference);
		},
		afterEach() {
			this.oAppComponent.destroy();
			sandbox.restore();
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("When call addChanges 3 times, 3 new changes are returned and the dependencies map also got updated", function(assert) {
			const oAddPropagationListenerSpy = sandbox.spy(this.oAppComponent, "addPropagationListener");
			const oAddChangeToMapStub = sandbox.stub(DependencyHandler, "addRuntimeChangeToMap");
			UIChangeManager.addDirtyChanges(
				sReference,
				[createChange("id1"), createChange("id2"), createChange("id3")],
				 this.oAppComponent
			);
			const aDirtyChanges = FlexObjectState.getDirtyFlexObjects(sReference);
			assert.strictEqual(aDirtyChanges[0].getId(), "id1", "then addDirtyChange called with the change content 1");
			assert.strictEqual(aDirtyChanges[1].getId(), "id2", "then addDirtyChange called with the change content 2");
			assert.strictEqual(aDirtyChanges[2].getId(), "id3", "then addDirtyChange called with the change content 3");
			assert.strictEqual(oAddChangeToMapStub.callCount, 3, "addRuntimeChangeToMap is called three times");
			assert.strictEqual(oAddPropagationListenerSpy.callCount, 1, "the propagation listener was added once");
		});

		QUnit.test("Shall not add the same change twice", function(assert) {
			// possible scenario: change gets saved, then without reload undo and redo gets called. both would add a dirty change
			const oAddChangeToMapStub = sandbox.stub(DependencyHandler, "addRuntimeChangeToMap");
			const oUIChange = createChange("myChange");
			const aAddedFlexObjectsOnFirstCall = UIChangeManager.addDirtyChanges(sReference, [oUIChange], this.oAppComponent);
			const aAddedFlexObjectsOnSecondCall = UIChangeManager.addDirtyChanges(sReference, [oUIChange], this.oAppComponent);

			const aDirtyChanges = FlexObjectState.getDirtyFlexObjects(sReference);
			assert.strictEqual(aDirtyChanges.length, 1, "only one change is added");
			assert.strictEqual(aAddedFlexObjectsOnFirstCall.length, 1, "only one change is returned");
			assert.strictEqual(aAddedFlexObjectsOnSecondCall.length, 0, "no change is returned on redundant call");
			assert.strictEqual(oAddChangeToMapStub.callCount, 1, "addRuntimeChangeToMap is only called once");
		});
	});
});
