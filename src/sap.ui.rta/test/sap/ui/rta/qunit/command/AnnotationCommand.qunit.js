/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/LocalResetAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/rta/command/AnnotationCommand",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	basicCommandTest,
	ChangesWriteAPI,
	FeaturesAPI,
	LocalResetAPI,
	PersistenceWriteAPI,
	Layer,
	AnnotationCommand,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	basicCommandTest({
		commandName: "annotation",
		designtimeActionStructure: "annotation",
		variantIndependent: true
	}, {
		changeType: "annotation",
		serviceUrl: "testServiceUrl",
		content: {
			myFancy: "Content"
		}
	}, {
		changeType: "annotation",
		serviceUrl: "testServiceUrl",
		content: {
			myFancy: "Content"
		}
	});

	QUnit.module("AnnotationCommand Tests", {
		afterEach() {
			this.oAnnotationCommand?.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("needsReload property is true", function(assert) {
			this.oAnnotationCommand = new AnnotationCommand();
			assert.strictEqual(this.oAnnotationCommand.needsReload, true, "needsReload is true");
		});

		QUnit.test("execute / undo with changesToDelete without localResetEnabled", async function(assert) {
			const oDeactivateChange = {fileName: "deactivateChange"};
			sandbox.stub(ChangesWriteAPI, "create")
			.onCall(0).returns(oDeactivateChange)
			.onCall(1).returns();

			const aChanges = [RtaQunitUtils.createUIChange({fileName: "change1"}), RtaQunitUtils.createUIChange({fileName: "change2"})];
			this.oAnnotationCommand = new AnnotationCommand({
				changesToDelete: aChanges,
				selector: {
					appComponent: "appComponent"
				},
				content: {
					annotationPath: "path"
				}
			});
			await this.oAnnotationCommand.prepare({layer: "USER", generator: "myGenerator"});
			assert.ok(ChangesWriteAPI.create.calledWith({
				changeSpecificData: {
					changeType: "deactivateChanges",
					content: {changeIds: ["change1", "change2"]},
					generator: "myGenerator",
					layer: "USER"
				},
				selector: "appComponent"
			}), "ChangesWriteAPI.create was called with the correct parameters");

			sandbox.stub(FeaturesAPI, "isLocalResetEnabled").returns(false);
			const oResetStub = sandbox.stub(LocalResetAPI, "resetChanges").resolves();
			const oRestoreStub = sandbox.stub(LocalResetAPI, "restoreChanges").resolves();
			const oPersonalizationApiAddStub = sandbox.stub(PersistenceWriteAPI, "add").resolves();
			const oPersonalizationApiRemoveStub = sandbox.stub(PersistenceWriteAPI, "remove").resolves();

			await this.oAnnotationCommand.execute();
			assert.ok(oResetStub.notCalled, "the LocalResetAPI was not used");
			assert.ok(oPersonalizationApiAddStub.calledWith({
				selector: "appComponent",
				flexObjects: [oDeactivateChange]
			}), "PersistenceWriteAPI.add was called with the correct parameters");

			await this.oAnnotationCommand.undo();
			assert.ok(oRestoreStub.notCalled, "the LocalResetAPI was not used");
			assert.ok(oPersonalizationApiRemoveStub.calledWith({
				selector: "appComponent",
				flexObjects: [oDeactivateChange]
			}), "PersistenceWriteAPI.remove was called with the correct parameters");
		});

		QUnit.test("execute / undo with changesToDelete (including developer changes) with localResetEnabled", async function(assert) {
			const aKeyUserChanges = [
				RtaQunitUtils.createUIChange({fileName: "change1", layer: Layer.CUSTOMER}),
				RtaQunitUtils.createUIChange({fileName: "change2", layer: Layer.CUSTOMER})
			];
			const aDeveloperChanges = [
				RtaQunitUtils.createUIChange({fileName: "change3", layer: Layer.CUSTOMER_BASE}),
				RtaQunitUtils.createUIChange({fileName: "change4", layer: Layer.VENDOR})
			];
			this.oAnnotationCommand = new AnnotationCommand({
				changesToDelete: aKeyUserChanges.concat(aDeveloperChanges),
				selector: {
					appComponent: "appComponent"
				},
				content: {
					annotationPath: "path"
				}
			});
			sandbox.stub(FeaturesAPI, "isLocalResetEnabled").returns(true);
			const oResetStub = sandbox.stub(LocalResetAPI, "resetChanges").resolves();
			const oRestoreStub = sandbox.stub(LocalResetAPI, "restoreChanges").resolves();
			const oPersonalizationApiAddStub = sandbox.stub(PersistenceWriteAPI, "add").resolves();
			const oPersonalizationApiRemoveStub = sandbox.stub(PersistenceWriteAPI, "remove").resolves();

			await this.oAnnotationCommand.prepare({layer: Layer.CUSTOMER, generator: "myGenerator"});
			await this.oAnnotationCommand.execute();
			assert.ok(oResetStub.calledWith(aKeyUserChanges, "appComponent", true), "reset was called with the correct parameters");
			assert.strictEqual(oPersonalizationApiAddStub.callCount, 1, "PersistenceWriteAPI.add was called once");
			assert.strictEqual(
				oPersonalizationApiAddStub.firstCall.args[0].flexObjects.length, 1,
				"PersistenceWriteAPI.add was called with one change"
			);
			assert.strictEqual(
				oPersonalizationApiAddStub.firstCall.args[0].flexObjects[0].getContent().changeIds.length, 2,
				"PersistenceWriteAPI.add was called with two changeIds"
			);
			assert.strictEqual(
				oPersonalizationApiAddStub.firstCall.args[0].flexObjects[0].getContent().changeIds[0], "change3",
				"PersistenceWriteAPI.add was called with the correct changeId"
			);
			assert.strictEqual(
				oPersonalizationApiAddStub.firstCall.args[0].flexObjects[0].getContent().changeIds[1], "change4",
				"PersistenceWriteAPI.add was called with the correct changeId"
			);

			await this.oAnnotationCommand.undo();
			assert.ok(oRestoreStub.calledWith(aKeyUserChanges, "appComponent", true), "restore was called with the correct parameters");
			assert.strictEqual(oPersonalizationApiRemoveStub.callCount, 1, "PersistenceWriteAPI.remove was called once");
			assert.strictEqual(
				oPersonalizationApiRemoveStub.firstCall.args[0].flexObjects.length, 1,
				"PersistenceWriteAPI.remove was called with one change"
			);
			assert.strictEqual(
				oPersonalizationApiRemoveStub.firstCall.args[0].flexObjects[0].getContent().changeIds.length, 2,
				"PersistenceWriteAPI.remove was called with two changeIds"
			);
			assert.strictEqual(
				oPersonalizationApiRemoveStub.firstCall.args[0].flexObjects[0].getContent().changeIds[0], "change3",
				"PersistenceWriteAPI.remove was called with the correct changeId"
			);
			assert.strictEqual(
				oPersonalizationApiRemoveStub.firstCall.args[0].flexObjects[0].getContent().changeIds[1], "change4",
				"PersistenceWriteAPI.remove was called with the correct changeId"
			);
		});

		QUnit.test("execute / undo with changesToDelete with localResetEnabled", async function(assert) {
			const aChanges = [
				RtaQunitUtils.createUIChange({fileName: "change1", layer: Layer.CUSTOMER}),
				RtaQunitUtils.createUIChange({fileName: "change2", layer: Layer.CUSTOMER})
			];
			this.oAnnotationCommand = new AnnotationCommand({
				changesToDelete: aChanges,
				selector: {
					appComponent: "appComponent"
				},
				content: {
					annotationPath: "path"
				}
			});
			sandbox.stub(FeaturesAPI, "isLocalResetEnabled").returns(true);
			const oResetStub = sandbox.stub(LocalResetAPI, "resetChanges").resolves();
			const oRestoreStub = sandbox.stub(LocalResetAPI, "restoreChanges").resolves();
			const oPersonalizationApiAddStub = sandbox.stub(PersistenceWriteAPI, "add").resolves();
			const oPersonalizationApiRemoveStub = sandbox.stub(PersistenceWriteAPI, "remove").resolves();

			await this.oAnnotationCommand.prepare({layer: Layer.CUSTOMER, generator: "myGenerator"});
			await this.oAnnotationCommand.execute();
			assert.ok(oResetStub.calledWith(aChanges, "appComponent", true), "resetChanges was called with the correct parameters");
			assert.strictEqual(oPersonalizationApiAddStub.callCount, 0, "PersistenceWriteAPI.add was not called");

			await this.oAnnotationCommand.undo();
			assert.ok(oRestoreStub.calledWith(aChanges, "appComponent", true), "restoreChanges was called with the correct parameters");
			assert.strictEqual(oPersonalizationApiRemoveStub.callCount, 0, "PersistenceWriteAPI.remove was not called");
		});

		QUnit.test("execute / undo without changesToDelete", async function(assert) {
			this.oAnnotationCommand = new AnnotationCommand({
				selector: {
					appComponent: "appComponent"
				},
				content: {
					annotationPath: "path"
				}
			});
			const oResetStub = sandbox.stub(LocalResetAPI, "resetChanges").resolves();
			const oRestoreStub = sandbox.stub(LocalResetAPI, "restoreChanges").resolves();
			const oPersonalizationApiAddStub = sandbox.stub(PersistenceWriteAPI, "add").resolves();
			const oPersonalizationApiRemoveStub = sandbox.stub(PersistenceWriteAPI, "remove").resolves();

			await this.oAnnotationCommand.prepare({layer: Layer.CUSTOMER, generator: "myGenerator"});
			await this.oAnnotationCommand.execute();
			assert.strictEqual(oResetStub.callCount, 0, "the LocalResetAPI.resetChanges was not called");
			assert.strictEqual(oPersonalizationApiAddStub.callCount, 0, "the PersistenceWriteAPI.add was not called");

			await this.oAnnotationCommand.undo();
			assert.strictEqual(oRestoreStub.callCount, 0, "the LocalResetAPI.restoreChanges was not called");
			assert.strictEqual(oPersonalizationApiRemoveStub.callCount, 0, "the PersistenceWriteAPI.remove was not called");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});