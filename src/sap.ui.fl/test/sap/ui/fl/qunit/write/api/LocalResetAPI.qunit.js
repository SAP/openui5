/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/write/api/LocalResetAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/m/VBox",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(
	sinon,
	UIChangesState,
	FlexState,
	ManifestUtils,
	FlexObjectFactory,
	States,
	LocalResetAPI,
	PersistenceWriteAPI,
	ChangesWriteAPI,
	Layer,
	ChangePersistence,
	ChangePersistenceFactory,
	VBox,
	JsControlTreeModifier
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function createChange(sChangeId, sSelectorId, oCustomDef) {
		return FlexObjectFactory.createFromFileContent(Object.assign(
			{
				fileName: sChangeId,
				fileType: "change",
				layer: Layer.CUSTOMER,
				selector: {
					id: sSelectorId
				}
			},
			oCustomDef
		));
	}

	QUnit.module("Reset/Restore", {
		beforeEach() {
			this.oFooElement = new VBox("fooElement");
			this.oBarElement = new VBox("barElement");
			this.oElement = new VBox("parentElement", {
				items: [
					this.oFooElement,
					this.oBarElement
				]
			});
			this.oComponent = {
				name: "MyComponent"
			};
			this.oChangePersistence = new ChangePersistence(this.oComponent);
			var aChanges = [
				createChange("foo", "fooElement"),
				createChange("foo2", "fooElement")
			];
			aChanges[0].setState(States.LifecycleState.PERSISTED);
			sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForControl").returns(this.oChangePersistence);
			sandbox.stub(UIChangesState, "getAllUIChanges").returns(aChanges);
		},
		afterEach() {
			FlexState.clearState();
			sandbox.restore();
			this.oElement.destroy();
		}
	}, function() {
		QUnit.test("when the isEnabled check is called", function(assert) {
			assert.ok(
				LocalResetAPI.isResetEnabled(this.oFooElement, {
					layer: Layer.CUSTOMER
				}),
				"then it returns true if at least one change exists"
			);

			assert.notOk(
				LocalResetAPI.isResetEnabled(this.oBarElement, {
					layer: Layer.CUSTOMER
				}),
				"then it returns false if no change exists"
			);
		});

		QUnit.test("when changes are reset", function(assert) {
			var aNestedChanges = LocalResetAPI.getNestedUIChangesForControl(this.oElement, {
				layer: Layer.CUSTOMER
			});
			var oRemoveStub = sandbox.stub(PersistenceWriteAPI, "remove").resolves();
			var oRevertStub = sandbox.stub(ChangesWriteAPI, "revert").resolves();
			return LocalResetAPI.resetChanges(aNestedChanges, this.oComponent)
			.then(function() {
				assert.ok(
					oRemoveStub.calledWith({flexObjects: aNestedChanges.reverse(), selector: this.oComponent}),
					"Then all changes are removed"
				);
				assert.strictEqual(oRevertStub.callCount, 2, "Then all changes are reverted");
				assert.strictEqual(
					oRevertStub.firstCall.args[0].change.getId(),
					"foo2",
					"then the changes are reverted in the correct order"
				);
			}.bind(this));
		});

		QUnit.test("when a reset is restored", function(assert) {
			var aNestedChanges = LocalResetAPI.getNestedUIChangesForControl(this.oElement, {
				layer: Layer.CUSTOMER
			});
			sandbox.stub(PersistenceWriteAPI, "remove").callsFake(function(aArguments) {
				// Simulate deletion to validate that the state is restored
				this.oChangePersistence.deleteChanges(aArguments.flexObjects);
				return Promise.resolve();
			}.bind(this));
			sandbox.stub(ChangesWriteAPI, "revert").resolves();

			return LocalResetAPI.resetChanges(aNestedChanges, this.oComponent).then(function() {
				var oAddStub = sandbox.stub(PersistenceWriteAPI, "add");
				var oApplyStub = sandbox.stub(ChangesWriteAPI, "apply").resolves();

				return LocalResetAPI.restoreChanges(aNestedChanges, this.oComponent).then(function() {
					assert.ok(
						oAddStub.calledWith({flexObjects: aNestedChanges, selector: this.oComponent}),
						"Then all changes are added again"
					);
					assert.strictEqual(oApplyStub.callCount, 2, "Then all changes are applied again");
					assert.strictEqual(
						oApplyStub.firstCall.args[0].change.getId(),
						"foo",
						"then the changes are applied in the correct order"
					);
					assert.deepEqual(
						aNestedChanges.map(function(oChange) {
							return oChange.getState();
						}),
						[States.LifecycleState.PERSISTED, States.LifecycleState.NEW],
						"then the original change states are restored"
					);
					assert.notOk(
						this.oChangePersistence.getDirtyChanges().includes(aNestedChanges[0]),
						"then dirty changes from deletion are removed"
					);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("when a reset containing dependent changes is restored", function(assert) {
			assert.expect(2);

			var aNestedChanges = [
				createChange("addControl", "parentId"),
				createChange("renameAddedControl", "addedControlId")
			];

			var oBySelectorStub = sandbox.stub(JsControlTreeModifier, "bySelector");
			sandbox.stub(PersistenceWriteAPI, "add");
			sandbox.stub(ChangesWriteAPI, "apply").callsFake(function(oPayload) {
				// Simulate async apply
				return Promise.resolve().then(function() {
					if (oPayload.change === aNestedChanges[0]) {
						assert.ok(
							oBySelectorStub.neverCalledWith({ id: "addedControlId" }),
							"then the selector for change2 is not looked up before change 1 is applied"
						);
					}
				});
			});

			return LocalResetAPI.restoreChanges(aNestedChanges, this.oComponent).then(function() {
				assert.ok(
					oBySelectorStub.withArgs({ id: "addedControlId" }).calledOnce,
					"then the selector for the second change is looked up later"
				);
			});
		});
	});

	QUnit.module("Nested change collection", {
		beforeEach() {
			this.oElement = new VBox("element", {
				items: [
					new VBox("childElement")
				]
			});
			this.oParentElement = new VBox("parentElement", {
				items: [
					this.oElement,
					new VBox("siblingElement")
				]
			});
			var oComponent = {
				name: "MyComponent"
			};
			this.oChangePersistence = new ChangePersistence(oComponent);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(oComponent.name);
		},
		afterEach() {
			sandbox.restore();
			this.oParentElement.destroy();
		}
	}, function() {
		QUnit.test("when the checked control is the selector of a change", function(assert) {
			var aChanges = [createChange("foo", "element"), createChange("bar", "element", {layer: Layer.USER})];
			sandbox.stub(UIChangesState, "getAllUIChanges").returns(aChanges);
			var aNestedChanges = LocalResetAPI.getNestedUIChangesForControl(this.oElement, {
				layer: Layer.CUSTOMER
			});

			assert.strictEqual(
				aNestedChanges.length,
				1,
				"then the change is detected as a nested change"
			);
		});

		QUnit.test("when the selector of a change is part of the searched control tree", function(assert) {
			var aChanges = [
				createChange("foo", "element"),
				createChange("bar", "childElement")
			];
			sandbox.stub(UIChangesState, "getAllUIChanges").returns(aChanges);
			var aNestedChanges = LocalResetAPI.getNestedUIChangesForControl(this.oElement, {
				layer: Layer.CUSTOMER
			});

			assert.strictEqual(
				aNestedChanges.length,
				2,
				"then the change is detected as a nested change"
			);
		});

		QUnit.test("when a dependent selector of a change is part of the searched control tree", function(assert) {
			var aChanges = [createChange("foo", "element", {
				dependentSelector: {
					someDependentSelector: {
						id: "childElement"
					}
				}
			})];
			sandbox.stub(UIChangesState, "getAllUIChanges").returns(aChanges);
			var aNestedChanges = LocalResetAPI.getNestedUIChangesForControl(this.oElement, {
				layer: Layer.CUSTOMER
			});

			assert.strictEqual(
				aNestedChanges.length,
				1,
				"then the change is detected as a nested change"
			);
		});

		QUnit.test("when a change was already deleted", function(assert) {
			var aChanges = [createChange("foo", "element")];
			aChanges[0].setState(States.LifecycleState.DELETED);
			sandbox.stub(UIChangesState, "getAllUIChanges").returns(aChanges);
			var aNestedChanges = LocalResetAPI.getNestedUIChangesForControl(this.oElement, {
				layer: Layer.CUSTOMER
			});

			assert.strictEqual(
				aNestedChanges.length,
				0,
				"then the change is not detected as a nested change"
			);
		});

		function getFilenamesForChanges(aChanges) {
			return aChanges.map(function(oChange) {
				return oChange.getId();
			});
		}

		QUnit.test("when a variant reference is specified", function(assert) {
			var aChanges = [
				createChange("foo", "element", {
					variantReference: "fooVariant"
				}),
				createChange("bar", "element", {
					variantReference: "someOtherVariantManagementId"
				}),
				createChange("baz", "element")
			];
			sandbox.stub(UIChangesState, "getAllUIChanges").returns(aChanges);

			var aNestedChangesForFooVariant = LocalResetAPI.getNestedUIChangesForControl(this.oElement, {
				layer: Layer.CUSTOMER,
				currentVariant: "fooVariant"
			});
			assert.deepEqual(
				getFilenamesForChanges(aNestedChangesForFooVariant),
				["foo"],
				"then the foo change is detected as a nested change of foo variant"
			);

			var aNestedChangesWithoutVariant = LocalResetAPI.getNestedUIChangesForControl(this.oElement, {
				layer: Layer.CUSTOMER
			});
			assert.deepEqual(
				getFilenamesForChanges(aNestedChangesWithoutVariant),
				["baz"],
				"then the baz change is detected as a nested change without variant"
			);
		});

		QUnit.test("when the selector of a change is the parent of the searched element", function(assert) {
			var aChanges = [createChange("foo", "parentElement")];
			sandbox.stub(UIChangesState, "getAllUIChanges").returns(aChanges);
			var aNestedChanges = LocalResetAPI.getNestedUIChangesForControl(this.oElement, {
				layer: Layer.CUSTOMER
			});

			assert.strictEqual(
				aNestedChanges.length,
				0,
				"then the change is not detected as a nested change"
			);
		});

		QUnit.test("when the selector of a change is a sibling of the searched element", function(assert) {
			var aChanges = [createChange("foo", "siblingElement")];
			sandbox.stub(UIChangesState, "getAllUIChanges").returns(aChanges);
			var aNestedChanges = LocalResetAPI.getNestedUIChangesForControl(this.oElement, {
				layer: Layer.CUSTOMER
			});

			assert.strictEqual(
				aNestedChanges.length,
				0,
				"then the change is not detected as a nested change"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});