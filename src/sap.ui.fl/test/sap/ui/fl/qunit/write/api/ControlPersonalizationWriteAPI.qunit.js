/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/App",
	"sap/m/Dialog",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/StaticArea",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	App,
	Dialog,
	XMLView,
	ComponentContainer,
	Control,
	Element,
	StaticArea,
	UIComponent,
	Reverter,
	VariantUtils,
	FlexObjectFactory,
	FlexObjectState,
	FlexState,
	ControlVariantApplyAPI,
	FlexRuntimeInfoAPI,
	ChangeHandlerRegistration,
	ChangeHandlerStorage,
	Settings,
	VariantManagement,
	VariantModel,
	UIChangeManager,
	FlexObjectManager,
	ChangesWriteAPI,
	ControlPersonalizationWriteAPI,
	ChangePersistenceFactory,
	FlexControllerFactory,
	Layer,
	Utils,
	nextUIUpdate,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oViewPromise = Promise.resolve();

	QUnit.module("Given an instance of VariantModel", {
		before() {
			var MockComponent = UIComponent.extend("MockController", {
				metadata: {
					manifest: {
						"sap.app": {
							applicationVersion: {
								version: "1.2.3"
							},
							id: "MockController"
						}
					}
				},
				createContent() {
					var oApp = new App(this.createId("mockapp"));
					oViewPromise = XMLView.create({
						id: this.createId("mockview"),
						viewName: "test-resources/sap/ui/fl/qunit/testResources/VariantManagementTestApp"
					}).then(function(oView) {
						oApp.addPage(oView);
						return oView.loaded();
					});
					return oApp;
				}
			});
			this.oComp = new MockComponent("testComponent");
			this.oCompContainer = new ComponentContainer({
				component: this.oComp
			});
			FlexState.clearState();
			return FlexState.initialize({
				componentId: this.oComp.getId()
			});
		},
		beforeEach() {
			sandbox.stub(Settings, "getInstance").resolves({
				isVariantPersonalizationEnabled() {
					return true;
				},
				isPublicFlVariantEnabled() {
					return false;
				}
			});

			return oViewPromise.then(function() {
				this.oFlexController = FlexControllerFactory.createForControl(this.oComp);
				this.oVariantModel = new VariantModel({
					variantManagement: {
						variants: []
					}
				}, {
					flexController: this.oFlexController,
					appComponent: this.oComp
				});
				return this.oVariantModel.initialize();
			}.bind(this))
			.then(function() {
				this.oComp.setModel(this.oVariantModel, ControlVariantApplyAPI.getVariantModelName());
				this.oCompContainer.placeAt("qunit-fixture");

				this.oObjectPageLayout = Element.getElementById("testComponent---mockview--ObjectPageLayout");
				this.mMoveChangeData1 = {
					selectorElement: this.oObjectPageLayout,
					changeSpecificData: {
						changeType: "moveControls",
						movedElements: [{
							id: "testComponent---mockview--ObjectPageSection1",
							sourceIndex: 0,
							targetIndex: 1
						}],
						source: {
							id: "testComponent---mockview--ObjectPageLayout",
							aggregation: "sections"
						},
						target: {
							id: "testComponent---mockview--ObjectPageLayout",
							aggregation: "sections"
						}
					}
				};
				this.mMoveChangeData2 = {
					selectorElement: this.oObjectPageLayout,
					changeSpecificData: {
						changeType: "moveControls",
						movedElements: [{
							id: "testComponent---mockview--ObjectPageSection3",
							sourceIndex: 2,
							targetIndex: 1
						}],
						source: {
							id: "testComponent---mockview--ObjectPageLayout",
							aggregation: "sections"
						},
						target: {
							id: "testComponent---mockview--ObjectPageLayout",
							aggregation: "sections"
						}
					}
				};
				this.mRenameChangeData1 = {
					selectorElement: Element.getElementById("testComponent---mockview--ObjectPageSection1"),
					changeSpecificData: {
						changeType: "rename",
						renamedElement: {
							id: "testComponent---mockview--ObjectPageSection1"
						},
						value: "Personalization Test"
					}
				};
				this.mRenameChangeData2 = {
					selectorElement: Element.getElementById("testComponent---mockview--TextTitle1"),
					changeSpecificData: {
						changeType: "rename",
						renamedElement: {
							id: "testComponent---mockview--TextTitle1"
						},
						value: "Change for the inner variant"
					}
				};

				this.oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(this.oComp);
				this.fnLogErrorStub = sandbox.stub(Log, "error");
				this.fnAddChangesSpy = sandbox.spy(UIChangeManager, "addDirtyChanges");
				this.fnApplyChangeSpy = sandbox.spy(ChangesWriteAPI, "apply");

				// registration is triggered by instantiation of XML View above
				return ChangeHandlerRegistration.waitForChangeHandlerRegistration("sap.uxap");
			}.bind(this)).then(function() {
				// register all ChangeHandlers again with modified default layer permissions
				ChangeHandlerStorage.clearAll();
				sandbox.stub(Settings, "getDefaultLayerPermissions").returns({
					VENDOR: true,
					CUSTOMER_BASE: true,
					CUSTOMER: true,
					PUBLIC: false,
					USER: true
				});
				ChangeHandlerRegistration.registerPredefinedChangeHandlers();
				return ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs();
			})
			.then(function() {
				return ChangeHandlerRegistration.waitForChangeHandlerRegistration("sap.uxap");
			});
		},
		afterEach() {
			sandbox.restore();
			ControlPersonalizationWriteAPI.detachAllChangeCreationListeners();
			ChangePersistenceFactory._instanceCache = {};
			FlexControllerFactory._instanceCache = {};
		},
		after() {
			this.oComp.destroy();
			this.oCompContainer.destroy();
		}
	}, function() {
		QUnit.test("when calling 'add' with two valid variant changes", function(assert) {
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mMoveChangeData2]
			})
			.then(function(aSuccessfulChanges) {
				assert.equal(this.fnLogErrorStub.callCount, 0, "no errors occurred");
				assert.strictEqual(
					this.fnAddChangesSpy.lastCall.args[1].length,
					2,
					"UIChangeManager.addDirtyChanges was called with both changes"
				);
				assert.equal(this.fnApplyChangeSpy.callCount, 2, "ChangesWriteAPI.apply has been called twice");
				assert.deepEqual(aSuccessfulChanges[0].getSelector(), {
					id: "mockview--ObjectPageLayout",
					idIsLocal: true
				}, "then first successfully applied change was returned");
				assert.deepEqual(aSuccessfulChanges[1].getSelector(), {
					id: "mockview--ObjectPageLayout",
					idIsLocal: true
				}, "then second successfully applied change was returned");
			}.bind(this));
		});

		QUnit.test("when adding multiple changes at once", function(assert) {
			this.fnApplyChangeSpy.restore();
			var fnApplyChangeStub = sandbox.stub(ChangesWriteAPI, "apply")
			.callsFake(function() {
				assert.strictEqual(
					this.fnAddChangesSpy.lastCall.args[1].length,
					2,
					"both changes have been created and added before one is applied"
				);
				return {success: true};
			}.bind(this));

			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mMoveChangeData2]
			})
			.then(function() {
				assert.ok(
					this.fnAddChangesSpy.calledBefore(fnApplyChangeStub),
					"then the changes are created before they are applied"
				);
				assert.strictEqual(fnApplyChangeStub.callCount, 2, "ChangesWriteAPI.apply has been called twice");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with three changes, one with an invalid, one without and the other with a valid changeSpecificData", function(assert) {
			delete this.mMoveChangeData1.changeSpecificData;
			this.mRenameChangeData1.changeSpecificData = {};
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mMoveChangeData2, this.mRenameChangeData1]
			})
			.then(function(aSuccessfulChanges) {
				assert.equal(this.fnLogErrorStub.callCount, 2, "two errors occurred");
				assert.equal(this.fnLogErrorStub.args[0][0],
					"A Change was not created successfully. Reason: ", "then the correct error was logged");
				assert.equal(this.fnLogErrorStub.args[0][1],
					"No changeSpecificData available", "then the correct error was logged");
				assert.equal(this.fnLogErrorStub.args[1][0],
					"A Change was not created successfully. Reason: ", "then the correct error was logged");
				assert.equal(this.fnLogErrorStub.args[1][1],
					"No valid changeType", "then the correct error was logged");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "ChangesWriteAPI.apply was called once");
				assert.deepEqual(aSuccessfulChanges[0].getSelector(), {id: "mockview--ObjectPageLayout", idIsLocal: true},
					"then only the successfully applied change was returned");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with two changes, one with an unstable control id and the other with a with a stable control id", function(assert) {
			const oUnstableIdChangeData = { ...this.mMoveChangeData2 };
			// mocking unstable id
			oUnstableIdChangeData.changeSpecificData.movedElements[0].id =
				`__${oUnstableIdChangeData.changeSpecificData.movedElements[0].id}`;
			return ControlPersonalizationWriteAPI.add({
				changes: [oUnstableIdChangeData, this.mMoveChangeData1]
			})
			.then(function(aSuccessfulChanges) {
				assert.equal(this.fnLogErrorStub.callCount, 1, "one error occurred");
				assert.equal(this.fnLogErrorStub.args[0][0], "A Change was not created successfully. Reason: ",
					"then the correct error was logged");
				assert.equal(
					this.fnLogErrorStub.args[0][1],
					`Generated ID attribute found - to offer flexibility a stable control ID is needed to assign the changes to,`
					+ ` but for this control the ID was generated by SAPUI5 ${
					 oUnstableIdChangeData.changeSpecificData.movedElements[0].id}`,
					"then the correct error was logged"
				);
				assert.strictEqual(aSuccessfulChanges.length, 1, "then only one change was successfully applied");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with two valid variant changes and an invalid change", function(assert) {
			this.mRenameChangeData1.selectorElement = undefined;
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mRenameChangeData1, this.mMoveChangeData2]
			})
			.then(function() {
				assert.equal(this.fnLogErrorStub.callCount, 1, "one error occurred");
				assert.equal(this.fnApplyChangeSpy.callCount, 2, "ChangesWriteAPI.apply has been called twice");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with two valid variant changes, but one of them couldn't be applied", function(assert) {
			var sErrorText = "My test error";
			var fnDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			this.fnApplyChangeSpy.restore();
			var oApplyStub = sandbox.stub(ChangesWriteAPI, "apply").callsFake(function(mPropertyBag) {
				if (mPropertyBag.change.getChangeType() === "rename") {
					return {
						success: false,
						error: new Error(sErrorText)
					};
				}
				return oApplyStub.wrappedMethod(mPropertyBag);
			});

			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mRenameChangeData1]
			})
			.then(function() {
				assert.equal(oApplyStub.callCount, 2, "ChangesWriteAPI.apply has been called twice");
				assert.equal(this.fnLogErrorStub.args[0][1], sErrorText, "the right error was propagated");
				assert.ok(fnDeleteFlexObjectsStub.calledOnce, "then the failing change was deleted");
			}.bind(this));
		});

		QUnit.test("when calling 'add' where one change content has variantReference set", function(assert) {
			this.mMoveChangeData1.changeSpecificData.variantReference = "mockVariantReference";
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mRenameChangeData1, this.mMoveChangeData2, this.mRenameChangeData2]
			})
			.then(function(aSuccessfulChanges) {
				assert.equal(this.fnLogErrorStub.callCount, 0, "no error occurred");
				assert.equal(this.fnApplyChangeSpy.callCount, 4, "ChangesWriteAPI.apply has been called four times");
				assert.strictEqual(
					this.fnAddChangesSpy.lastCall.args[1].length,
					4,
					"UIChangeManager.addDirtyChanges has been called once with the four changes"
				);
				assert.strictEqual(aSuccessfulChanges.length, 4, "then all passed change contents were applied successfully");
				assert.equal(this.fnAddChangesSpy.lastCall.args[1][0].getVariantReference(), "mockVariantReference",
					"first change belongs to the preset variant reference");
				assert.equal(this.fnAddChangesSpy.lastCall.args[1][1].getVariantReference(), "mockview--VariantManagement1",
					"second change belongs to VariantManagement1");
				assert.equal(this.fnAddChangesSpy.lastCall.args[1][2].getVariantReference(), "mockview--VariantManagement1",
					"third change belongs to VariantManagement1");
				assert.equal(this.fnAddChangesSpy.lastCall.args[1][3].getVariantReference(), "mockview--VariantManagement2",
					"fourth change belongs to VariantManagement2");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with a change outside of a variant management control", function(assert) {
			var oButton = Element.getElementById("testComponent---mockview--Button");
			var oChangeData = {
				selectorElement: oButton,
				changeSpecificData: {
					changeType: "rename",
					renamedElement: {
						id: "testComponent---mockview--Button"
					},
					value: "Personalized Text"
				}
			};
			return ControlPersonalizationWriteAPI.add({
				changes: [oChangeData]
			})
			.then(function() {
				assert.equal(this.fnLogErrorStub.callCount, 0, "no error occurred");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "ChangesWriteAPI.apply has been called once");
				assert.strictEqual(
					this.fnAddChangesSpy.callCount,
					1,
					"UIChangeManager.addDirtyChanges has been called once"
				);
				assert.deepEqual(
					this.fnAddChangesSpy.lastCall.args[1][0].getSelector().id,
					"mockview--Button",
					"UIChangeManager.addDirtyChanges was called with the correct renamed element"
				);
				assert.deepEqual(
					this.fnAddChangesSpy.lastCall.args[1][0].getChangeType(),
					oChangeData.changeSpecificData.changeType,
					"UIChangeManager.addDirtyChanges was called with the correct change type"
				);
				assert.deepEqual(
					this.fnAddChangesSpy.lastCall.args[1][0].getTexts().newText.value,
					oChangeData.changeSpecificData.value,
					"UIChangeManager.addDirtyChanges was called with the correct value"
				);
				assert.notOk(
					this.fnAddChangesSpy.lastCall.args[1][0].getVariantReference(),
					"UIChangeManager.addDirtyChanges was called for a change without variant management"
				);
				assert.strictEqual(
					this.fnAddChangesSpy.lastCall.args[2],
					this.oComp,
					"UIChangeManager.addDirtyChanges was called with the correct component"
				);
			}.bind(this));
		});

		QUnit.test("when calling 'add' with 'ignoreVariantManagement' property set, for change contents with and without variantReferences and a variant model", function(assert) {
			this.mMoveChangeData1.changeSpecificData.variantReference = "mockVariantReference";
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mRenameChangeData1, this.mMoveChangeData2, this.mRenameChangeData2],
				ignoreVariantManagement: true
			})
			.then(function(aSuccessfulChanges) {
				assert.equal(this.fnLogErrorStub.callCount, 0, "no error occurred");
				assert.equal(this.fnApplyChangeSpy.callCount, 4, "ChangesWriteAPI.apply has been called four times");
				assert.strictEqual(aSuccessfulChanges.length, 4, "then all passed change contents were applied successfully");
				assert.notOk(aSuccessfulChanges[0].getVariantReference(),
					"then variantReference property is deleted for the change, where it was preset");
				assert.notOk(this.fnApplyChangeSpy.getCall(0).args[0].change.getVariantReference(),
					"first change is without the preset variant reference");
				assert.notOk(this.fnApplyChangeSpy.getCall(1).args[0].change.getVariantReference(),
					"second change is without VariantManagement1");
				assert.notOk(this.fnApplyChangeSpy.getCall(2).args[0].change.getVariantReference(),
					"third change is without VariantManagement1");
				assert.notOk(this.fnApplyChangeSpy.getCall(3).args[0].change.getVariantReference(),
					"fourth change is without VariantManagement2");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with 'ignoreVariantManagement' property set, for change contents with and without variantReferences and no variant model", function(assert) {
			sandbox.stub(this.oComp, "getModel")
			.callThrough()
			.withArgs(ControlVariantApplyAPI.getVariantModelName())
			.returns(undefined);
			this.mMoveChangeData1.changeSpecificData.variantReference = "mockVariantReference";
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mRenameChangeData1],
				ignoreVariantManagement: true
			})
			.then(function(aSuccessfulChanges) {
				assert.equal(this.fnLogErrorStub.callCount, 0, "no error occurred");
				assert.equal(this.fnApplyChangeSpy.callCount, 2, "ChangesWriteAPI.apply was called twice");
				assert.strictEqual(aSuccessfulChanges.length, 2, "then all passed change contents were applied successfully");
				assert.notOk(aSuccessfulChanges[0].getVariantReference(),
					"then variantReference property is deleted for the change, where it was preset");
			}.bind(this));
		});

		QUnit.test("when calling 'add' without any changes", function(assert) {
			return ControlPersonalizationWriteAPI.add({
				changes: []
			})
			.then(function(aSuccessfulChanges) {
				assert.equal(this.fnLogErrorStub.callCount, 0, "no errors occurred");
				assert.strictEqual(
					this.fnAddChangesSpy.callCount,
					0,
					"UIChangeManager.addDirtyChanges has not been called"
				);
				assert.deepEqual(aSuccessfulChanges, [], "the function resolves with an empty array");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with one transient change", function(assert) {
			var oButton = Element.getElementById("testComponent---mockview--Button");
			var oChangeData = {
				selectorElement: oButton,
				changeSpecificData: {
					changeType: "rename",
					renamedElement: {
						id: "testComponent---mockview--Button"
					},
					value: "Personalized Text"
				},
				"transient": true
			};
			return ControlPersonalizationWriteAPI.add({
				changes: [oChangeData]
			})
			.then(function() {
				assert.equal(this.fnLogErrorStub.callCount, 0, "no error occurred");
				assert.strictEqual(
					this.fnAddChangesSpy.lastCall.args[1].length,
					0,
					"UIChangeManager.addDirtyChanges is called with an empty array"
				);
			}.bind(this));
		});

		QUnit.test("When save() is called with an array of changes and a valid component", function(assert) {
			var sChangesSaved = "changesSaved";
			var aSuccessfulChanges = ["mockChange1", "mockChange2"];
			var oSaveStub = sandbox.stub(this.oFlexController, "saveSequenceOfDirtyChanges").resolves(sChangesSaved);

			return ControlPersonalizationWriteAPI.save({selector: {appComponent: this.oComp}, changes: aSuccessfulChanges})

			.then(function(vResponse) {
				assert.strictEqual(vResponse, sChangesSaved, "then the correct response was received");
				assert.strictEqual(oSaveStub.lastCall.args[0], aSuccessfulChanges, "the two changes were passed to the FlexController");
			});
		});

		QUnit.test("When save() is called but flex state is not initialized", function(assert) {
			var sChangesSaved = "changesSaved";
			var aSuccessfulChanges = ["mockChange1", "mockChange2"];
			var oSaveStub = sandbox.stub(this.oFlexController, "saveSequenceOfDirtyChanges").resolves(sChangesSaved);
			sandbox.stub(FlexState, "isInitialized").returns(false);

			return ControlPersonalizationWriteAPI.save({selector: {appComponent: this.oComp}, changes: aSuccessfulChanges})

			.then(function() {
				assert.notOk(oSaveStub.calledOnce, "then FlexController.saveSequenceOfDirtyChanges is not called");
			});
		});

		QUnit.test("When save() is called with an array of changes and a valid component and an invalid VM control on the page", async function(assert) {
			var sChangesSaved = "changesSaved";
			var aSuccessfulChanges = ["mockChange1", "mockChange2"];
			var oSaveStub = sandbox.stub(this.oFlexController, "saveSequenceOfDirtyChanges").resolves(sChangesSaved);
			var aVMControl = new VariantManagement({
				modelName: ControlVariantApplyAPI.getVariantModelName()
			}).placeAt(StaticArea.getDomRef());
			sandbox.stub(VariantUtils, "getAllVariantManagementControlIds").returns([aVMControl.getId()]);
			await nextUIUpdate();

			const vResponse = await ControlPersonalizationWriteAPI.save({selector: {appComponent: this.oComp}, changes: aSuccessfulChanges});

			assert.strictEqual(vResponse, sChangesSaved, "then the correct response was received");
			assert.strictEqual(oSaveStub.lastCall.args[0], aSuccessfulChanges, "the two changes were passed to the FlexController");

			aVMControl.destroy();
		});

		QUnit.test("When save() is called with an invalid element", function(assert) {
			ControlPersonalizationWriteAPI.save({selector: {}, changes: []});
			assert.ok(this.fnLogErrorStub.calledWith("App Component could not be determined"), "then Log.error() called with an error");
		});

		QUnit.test("when attaching a change creation listener", function(assert) {
			var fnCallback = sandbox.spy();
			ControlPersonalizationWriteAPI.attachChangeCreation(this.oObjectPageLayout, fnCallback);

			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mMoveChangeData2]
			})
			.then(function() {
				assert.ok(fnCallback.calledOnce, "then the callback is called");
				assert.strictEqual(
					fnCallback.getCall(0).args[0].length,
					2,
					"then the callback is called with both personalization changes"
				);
			});
		});

		QUnit.test("when attaching and later detaching a change creation listener", function(assert) {
			var fnCallback = sandbox.spy();
			ControlPersonalizationWriteAPI.attachChangeCreation(this.oObjectPageLayout, fnCallback);
			ControlPersonalizationWriteAPI.detachChangeCreation(this.oObjectPageLayout, fnCallback);

			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1]
			})
			.then(function() {
				assert.ok(fnCallback.notCalled, "then the callback is not called");
			});
		});

		QUnit.test("when attaching multiple change creation listener", function(assert) {
			var fnCallback = sandbox.spy();
			var fnCallback2 = sandbox.spy();
			ControlPersonalizationWriteAPI.attachChangeCreation(this.oObjectPageLayout, fnCallback);
			ControlPersonalizationWriteAPI.attachChangeCreation(this.oObjectPageLayout, fnCallback2);

			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1]
			})
			.then(function() {
				assert.ok(fnCallback.calledOnce, "then the first callback is called");
				assert.ok(fnCallback2.calledOnce, "then the second callback is called");
			});
		});

		QUnit.test("when attaching change creation listeners for different flex references", function(assert) {
			var fnCallback = sandbox.spy();
			var fnCallback2 = sandbox.spy();
			sandbox.stub(FlexRuntimeInfoAPI, "getFlexReference")
			.callThrough()
			.onFirstCall().returns("someDifferentReference");
			ControlPersonalizationWriteAPI.attachChangeCreation("someControl", fnCallback2);
			ControlPersonalizationWriteAPI.attachChangeCreation(this.oObjectPageLayout, fnCallback);

			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1]
			})
			.then(function() {
				assert.ok(fnCallback.calledOnce, "then the first callback is called");
				assert.ok(fnCallback2.notCalled, "then the callback for the different reference is not called");
			});
		});
	});

	QUnit.module("Given an instance of VariantModel on a dialog", {
		before() {
			var MockComponent = UIComponent.extend("MockController", {
				metadata: {
					manifest: {
						"sap.app": {
							applicationVersion: {
								version: "1.2.3"
							},
							id: "MockController"
						}
					}
				},
				createContent() {
					var oApp = new App(this.createId("mockapp"));
					var oRootView;
					oViewPromise = XMLView.create({
						id: this.createId("root-mockview"),
						definition: '<mvc:View id="mockview" xmlns:mvc="sap.ui.core.mvc"/>'
					}).then(function(oView) {
						oRootView = oView;
						oApp.addPage(oView);
						return oView.loaded();
					}).then(function() {
						return XMLView.create({
							id: this.createId("mockview"),
							viewName: "test-resources.sap.ui.fl.qunit.testResources.VariantManagementTestApp"
						});
					}.bind(this)).then(function(oView) {
						var oDialog = new Dialog("dialog", {
							content: oView
						});
						oRootView.addDependent(oDialog);
						oDialog.open();
						return oView.loaded();
					});
					return oApp;
				}
			});
			this.oComp = new MockComponent("testComponent");

			FlexState.clearState();
			return FlexState.initialize({
				componentId: this.oComp.getId()
			});
		},
		beforeEach(assert) {
			var done = assert.async();
			sandbox.stub(Settings, "getInstance").resolves({
				isVariantPersonalizationEnabled() {
					return true;
				},
				isPublicFlVariantEnabled() {
					return false;
				}
			});

			oViewPromise.then(function() {
				this.oFlexController = FlexControllerFactory.createForControl(this.oComp);
				this.oVariantModel = new VariantModel({
					variantManagement: {
						variants: []
					}
				}, {
					flexController: this.oFlexController,
					appComponent: this.oComp
				});
				return this.oVariantModel.initialize();
			}.bind(this))
			.then(function() {
				this.oComp.setModel(this.oVariantModel, ControlVariantApplyAPI.getVariantModelName());
				this.oCompContainer = new ComponentContainer({
					component: this.oComp
				}).placeAt("qunit-fixture");
				this.mMoveChangeData1 = {
					selectorElement: Element.getElementById("testComponent---mockview--ObjectPageLayout"),
					changeSpecificData: {
						changeType: "moveControls",
						movedElements: [{
							id: "testComponent---mockview--ObjectPageSection1",
							sourceIndex: 0,
							targetIndex: 1
						}],
						source: {
							id: "testComponent---mockview--ObjectPageLayout",
							aggregation: "sections"
						},
						target: {
							id: "testComponent---mockview--ObjectPageLayout",
							aggregation: "sections"
						}
					}
				};
				this.mMoveChangeData2 = {
					selectorElement: Element.getElementById("testComponent---mockview--ObjectPageLayout"),
					changeSpecificData: {
						changeType: "moveControls",
						movedElements: [{
							id: "testComponent---mockview--ObjectPageSection3",
							sourceIndex: 2,
							targetIndex: 1
						}],
						source: {
							id: "testComponent---mockview--ObjectPageLayout",
							aggregation: "sections"
						},
						target: {
							id: "testComponent---mockview--ObjectPageLayout",
							aggregation: "sections"
						}
					}
				};

				this.fnLogErrorStub = sandbox.stub(Log, "error");
				this.fnApplyChangeSpy = sandbox.spy(ChangesWriteAPI, "apply");

				// registration is triggered by instantiation of XML View above
				ChangeHandlerRegistration.waitForChangeHandlerRegistration("sap.uxap").then(done);
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
		},
		after() {
			this.oComp.destroy();
			ChangePersistenceFactory._instanceCache = {};
			FlexControllerFactory._instanceCache = {};
			this.oCompContainer.destroy();
		}
	}, function() {
		QUnit.test("when calling 'add' with two valid variant changes", function(assert) {
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mMoveChangeData2]
			})
			.then(function(aSuccessfulChanges) {
				// assert.equal(this.fnLogErrorStub.callCount, 0, "no errors occurred");
				assert.notOk(this.fnLogErrorStub.args[0], "no errors occurred");
				assert.equal(this.fnApplyChangeSpy.callCount, 2, "ChangesWriteAPI.apply has been called twice");
				assert.deepEqual(aSuccessfulChanges[0].getSelector(), {
					id: "mockview--ObjectPageLayout",
					idIsLocal: true
				}, "then first successfully applied change was returned");
				assert.equal(aSuccessfulChanges[0].getVariantReference(), "mockview--VariantManagement1",
					"the variant reference is correct");
				assert.deepEqual(aSuccessfulChanges[1].getSelector(), {
					id: "mockview--ObjectPageLayout",
					idIsLocal: true
				}, "then second successfully applied change was returned");
				assert.equal(aSuccessfulChanges[1].getVariantReference(), "mockview--VariantManagement1",
					"the variant reference is correct");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with 'useStaticArea' and two valid variant changes", function(assert) {
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mMoveChangeData2],
				useStaticArea: true
			})
			.then(function(aSuccessfulChanges) {
				assert.equal(this.fnLogErrorStub.callCount, 0, "no errors occurred");
				assert.equal(this.fnApplyChangeSpy.callCount, 2, "ChangesWriteAPI.apply has been called twice");
				assert.deepEqual(aSuccessfulChanges[0].getSelector(), {
					id: "mockview--ObjectPageLayout",
					idIsLocal: true
				}, "then first successfully applied change was returned");
				assert.equal(aSuccessfulChanges[0].getVariantReference(), "mockview--VariantManagement1",
					"the variant reference is correct");
				assert.deepEqual(aSuccessfulChanges[1].getSelector(), {
					id: "mockview--ObjectPageLayout",
					idIsLocal: true
				}, "then second successfully applied change was returned");
				assert.equal(aSuccessfulChanges[0].getVariantReference(), "mockview--VariantManagement1",
					"the variant reference is correct");
			}.bind(this));
		});
	});

	QUnit.module("reset", {
		beforeEach() {
			this.aControls = [];
			this.getControlIds = function() {
				return this.aControls.map(function(vControl) {
					return vControl instanceof Element ? vControl.getId() : vControl.id;
				});
			};
			sandbox.stub(Log, "error");
			sandbox.stub(FlexState, "isInitialized").returns(true);
			this.oResetStub = sandbox.stub(FlexObjectManager, "resetFlexObjects").resolves();
		},
		afterEach() {
			this.aControls.forEach(function(vControl) {
				var oControl = vControl instanceof Element ? vControl : Element.getElementById(vControl.id);
				if (oControl) {
					oControl.destroy();
				}
			});
			if (this.oAppComponent) {
				this.oAppComponent.destroy();
			}
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When reset() is called with an array of control IDs and change types", async function(assert) {
			var aChangeTypes = ["changeType1", "changeType2"];
			this.oAppComponent = new UIComponent("AppComponent2");
			this.aControls.push({id: "controlId", appComponent: this.oAppComponent});

			await ControlPersonalizationWriteAPI.reset({selectors: this.aControls, changeTypes: aChangeTypes});
			assert.ok(this.oResetStub.calledWith({
				layer: Layer.USER,
				appComponent: this.oAppComponent,
				selectorIds: this.getControlIds(),
				changeTypes: aChangeTypes
			}), "then reset is called with the passed selectors and change types");
		});

		QUnit.test("When reset() is called with an array of control IDs which are partially local and partially not", async function(assert) {
			this.oAppComponent = new UIComponent("AppComponent2");
			var aChangeTypes = ["changeType1", "changeType2"];
			this.aControls.push({id: this.oAppComponent.createId("view--controlId2"), appComponent: this.oAppComponent});
			 // element currently not present in the runtime
			this.aControls.push({id: "feElementsView::controlId", appComponent: this.oAppComponent});

			await ControlPersonalizationWriteAPI.reset({selectors: this.aControls, changeTypes: aChangeTypes});
			assert.ok(this.oResetStub.calledWith({
				layer: Layer.USER,
				appComponent: this.oAppComponent,
				selectorIds: ["view--controlId2", "feElementsView::controlId"],
				changeTypes: aChangeTypes
			}), "then FlexObjectManager.resetFlexObjects is called with the passed control IDs and change types");
		});

		QUnit.test("When reset() is called with a control IDs map and for no control ID a control is instantiated but an app component was provided", async function(assert) {
			this.oAppComponent = new UIComponent("AppComponent2");
			// view ID normally generated by the view between the component and the control
			var oControl = new Control(this.oAppComponent.createId("view--controlId4"));
			this.aControls.push({id: oControl.getId()});
			var aSelector = [{id: "controlId3", appComponent: this.oAppComponent}, oControl];

			await ControlPersonalizationWriteAPI.reset({selectors: aSelector});
			assert.ok(this.oResetStub.calledWith({
				layer: Layer.USER,
				appComponent: this.oAppComponent,
				selectorIds: ["controlId3", "view--controlId4"],
				changeTypes: undefined
			}), "then FlexObjectManager.resetFlexObjects is called with the passed control IDs and change types");
		});

		QUnit.test("When reset() is called with a mixture of control IDs and controls and for no control ID a control", function(assert) {
			this.oAppComponent = new UIComponent("AppComponent2");
			var aSelectors = [{id: "controlId3", appComponent: this.oAppComponent}, {id: "controlId4", appComponent: this.oAppComponent}];

			return ControlPersonalizationWriteAPI.reset({selectors: aSelectors})
			.then(function() {
				assert.ok(this.oResetStub.calledWith({
					layer: Layer.USER,
					appComponent: this.oAppComponent,
					selectorIds: ["controlId3", "controlId4"],
					changeTypes: undefined
				}), "then FlexObjectManager.resetFlexObjects is called with the passed control IDs and change types");
			}.bind(this));
		});

		QUnit.test("When reset() is called with an undefined selector array", function(assert) {
			assert.throws(
				ControlPersonalizationWriteAPI.reset({changeTypes: []}),
				"a rejection takes place"
			);
		});

		QUnit.test("When reset() is called with an empty selector array", function(assert) {
			assert.throws(
				ControlPersonalizationWriteAPI.reset({selectors: []}),
				"a rejection takes place"
			);
		});

		QUnit.test("When reset() is called with an control IDs map and no app component", function(assert) {
			var aSelectors = ["controlId3", "controlId4"];
			assert.throws(
				ControlPersonalizationWriteAPI.reset({selectors: aSelectors, changeTypes: []}),
				"a rejection takes place"
			);
		});
	});

	QUnit.module("restore", {
		beforeEach() {
			this.oAppComponent = new UIComponent();
			this.sControlId = "view--control1";
			this.oControl = new Control(this.oAppComponent.createId(this.sControlId));
			sandbox.stub(FlexState, "isInitialized").returns(true);
		},
		afterEach() {
			sandbox.restore();
			this.oAppComponent.destroy();
			this.oControl.destroy();
		}
	}, function() {
		QUnit.test("when called without a property bag", function(assert) {
			return ControlPersonalizationWriteAPI.restore()
			.catch(function(sMessage) {
				assert.equal(sMessage, "No selector was provided", "then a rejection with the correct message was done");
			});
		});

		QUnit.test("when called without a selector", function(assert) {
			return ControlPersonalizationWriteAPI.restore({})
			.catch(function(sMessage) {
				assert.equal(sMessage, "No selector was provided", "then a rejection with the correct message was done");
			});
		});

		QUnit.test("when no app component could be determined", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(undefined);

			return ControlPersonalizationWriteAPI.restore({
				selector: this.oControl
			})
			.catch(function(sMessage) {
				assert.equal(sMessage, "App Component could not be determined", "then a rejection with the correct message was done");
			});
		});

		QUnit.test("When FlexState is not initialized", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			const oRemoveDirtyFlexObjectsSpy = sandbox.spy(FlexObjectManager, "removeDirtyFlexObjects");
			FlexState.isInitialized.restore();
			sandbox.stub(FlexState, "isInitialized").returns(false);

			var sGenerator = "Change.createInitialFileContent";
			return ControlPersonalizationWriteAPI.restore({
				selector: this.oControl,
				generator: sGenerator
			})
			.then(function() {
				assert.ok(oRemoveDirtyFlexObjectsSpy.notCalled, "then removeDirtyFlexObjects is not called");
			});
		});

		QUnit.test("when a restore with a generator was called", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			const aCurrentChanges = [
				createUIChange(undefined, undefined, "id1"),
				createUIChange(undefined, undefined, "id2")
			];
			const oRemoveDirtyFlexObjectsSpy = sandbox.stub(FlexObjectManager, "removeDirtyFlexObjects").returns(aCurrentChanges);
			const oRevertSpy = sandbox.spy(Reverter, "revertMultipleChanges");

			var sGenerator = "Change.createInitialFileContent";
			return ControlPersonalizationWriteAPI.restore({
				selector: this.oControl,
				generator: sGenerator
			})
			.then(function() {
				assert.equal(oRemoveDirtyFlexObjectsSpy.callCount, 1, "removeDirtyFlexObjects was called once");
				const oArgument = oRemoveDirtyFlexObjectsSpy.getCall(0).args[0];
				assert.deepEqual(
					oArgument,
					{
						reference: "sap.ui.core",
						layers: Layer.USER,
						component: this.oAppComponent,
						control: this.oControl,
						generator: sGenerator,
						changeTypes: undefined
					},
					"then the correct arguments were passed"
				);
				assert.strictEqual(oRevertSpy.callCount, 1, "then the revertMultipleChanges function was called once");
				assert.deepEqual(
					oRevertSpy.getCall(0).args[0],
					[...aCurrentChanges].reverse(),
					"then the revertMultipleChanges function was called with the removed changes in reverse"
				);
			}.bind(this));
		});

		QUnit.test("when a restore with a changeType list was called", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			const oRemoveDirtyFlexObjectsSpy = sandbox.spy(FlexObjectManager, "removeDirtyFlexObjects");

			var aChangeTypes = ["Change.createInitialFileContent"];
			return ControlPersonalizationWriteAPI.restore({
				selector: this.oControl,
				changeTypes: aChangeTypes
			})
			.then(function() {
				assert.equal(oRemoveDirtyFlexObjectsSpy.callCount, 1, "removeDirtyFlexObjects was called once");
				const oArgument = oRemoveDirtyFlexObjectsSpy.getCall(0).args[0];
				assert.deepEqual(
					oArgument,
					{
						reference: "sap.ui.core",
						layers: Layer.USER,
						component: this.oAppComponent,
						control: this.oControl,
						generator: undefined,
						changeTypes: aChangeTypes
					},
					"then the correct arguments were passed"
				);
			}.bind(this));
		});

		QUnit.test("when a restore without a changeType list or generator was called", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			const oRemoveDirtyFlexObjectsSpy = sandbox.spy(FlexObjectManager, "removeDirtyFlexObjects");

			var sSelectorIds = ["myControl"];
			return ControlPersonalizationWriteAPI.restore({
				selector: this.oControl,
				selectorIds: sSelectorIds
			})
			.then(function() {
				assert.equal(oRemoveDirtyFlexObjectsSpy.callCount, 1, "removeDirtyFlexObjects was called once");
				const oArgument = oRemoveDirtyFlexObjectsSpy.getCall(0).args[0];
				assert.deepEqual(
					oArgument,
					{
						reference: "sap.ui.core",
						layers: Layer.USER,
						component: this.oAppComponent,
						control: this.oControl,
						generator: undefined,
						changeTypes: undefined
					},
					"then the correct arguments were passed"
				);
			}.bind(this));
		});
	});

	function createUIChange(sLayer, sChangeType, sId) {
		return FlexObjectFactory.createUIChange({
			layer: sLayer || Layer.USER,
			changeType: sChangeType || "someChangeType",
			selector: {
				idIsLocal: true,
				id: sId || "view--control1"
			},
			generator: "myFancyGenerator"
		});
	}

	QUnit.module("hasFlexObjects", {
		beforeEach() {
			this.oAppComponent = new UIComponent();
			this.sControlId = "view--control1";
			this.oControl = new Control(this.oAppComponent.createId(this.sControlId));
			this.oGetAppComponentStub = sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(FlexState, "isInitialized").returns(true);
			this.oGetDirtyFOStub = sandbox.stub(FlexObjectState, "getDirtyFlexObjects");
		},
		afterEach() {
			sandbox.restore();
			this.oAppComponent.destroy();
			this.oControl.destroy();
		}
	}, function() {
		QUnit.test("when called with insufficient information", function(assert) {
			assert.throws(
				function() {
					ControlPersonalizationWriteAPI.hasDirtyFlexObjects();
				},
				/No selector was provided/,
				"the function throws an error"
			);
			assert.throws(
				function() {
					ControlPersonalizationWriteAPI.hasDirtyFlexObjects({});
				},
				/No selector was provided/,
				"the function throws an error"
			);
			this.oGetAppComponentStub.restore();
			assert.throws(
				function() {
					ControlPersonalizationWriteAPI.hasDirtyFlexObjects({selector: this.oControl});
				},
				/App Component could not be determined/,
				"the function throws an error"
			);
		});

		QUnit.test("when there are no dirty flex objects", function(assert) {
			this.oGetDirtyFOStub.returns([]);
			assert.notOk(
				ControlPersonalizationWriteAPI.hasDirtyFlexObjects({selector: this.oControl}),
				"the function returns false"
			);
		});

		QUnit.test("with no USER layer changes", function(assert) {
			this.oGetDirtyFOStub.returns([
				createUIChange(Layer.CUSTOMER),
				createUIChange(Layer.VENDOR)
			]);
			assert.notOk(
				ControlPersonalizationWriteAPI.hasDirtyFlexObjects({selector: this.oControl}),
				"the function returns false"
			);
		});

		QUnit.test("with only changes for other controls", function(assert) {
			this.oGetDirtyFOStub.returns([
				createUIChange(undefined, undefined, "otherId"),
				createUIChange(undefined, undefined, "otherId2")
			]);
			assert.notOk(
				ControlPersonalizationWriteAPI.hasDirtyFlexObjects({
					selector: this.oControl
				}),
				"the function returns false"
			);
		});

		QUnit.test("called with change types", function(assert) {
			this.oGetDirtyFOStub.returns([
				createUIChange()
			]);
			assert.ok(
				ControlPersonalizationWriteAPI.hasDirtyFlexObjects({
					selector: this.oControl,
					changeTypes: ["someChangeType"]
				}),
				"the function returns true"
			);
			assert.notOk(
				ControlPersonalizationWriteAPI.hasDirtyFlexObjects({
					selector: this.oControl,
					changeTypes: ["otherChangeType"]
				}),
				"the function returns false"
			);
			assert.ok(
				ControlPersonalizationWriteAPI.hasDirtyFlexObjects({
					selector: this.oControl,
					changeTypes: ["otherChangeType", "someChangeType"]
				}),
				"the function returns true"
			);
		});

		QUnit.test("called with a generator", function(assert) {
			this.oGetDirtyFOStub.returns([
				createUIChange()
			]);
			assert.ok(
				ControlPersonalizationWriteAPI.hasDirtyFlexObjects({
					selector: this.oControl,
					generator: "myFancyGenerator"
				}),
				"the function returns true"
			);
			assert.notOk(
				ControlPersonalizationWriteAPI.hasDirtyFlexObjects({
					selector: this.oControl,
					generator: "myNotSoFancyGenerator"
				}),
				"the function returns false"
			);
		});
	});

	QUnit.module("buildSelectorFromElementIdAndType", {
		beforeEach() {
			this.oAppComponent = new UIComponent();
			this.oExpectedResult = {
				elementId: "elementId",
				elementType: "elementType",
				appComponent: this.oAppComponent,
				id: "elementId",
				controlType: "elementType"
			};
			sandbox.stub(Utils, "getAppComponentForControl").callsFake(function(oControl) {
				if (oControl === "control") {
					return this.oAppComponent;
				}
				return undefined;
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oAppComponent.destroy();
		}
	}, function() {
		QUnit.test("when called with a control", function(assert) {
			var oControlEquivalent = ControlPersonalizationWriteAPI.buildSelectorFromElementIdAndType({
				element: "control",
				elementId: "elementId",
				elementType: "elementType"
			});
			assert.deepEqual(oControlEquivalent, this.oExpectedResult, "the expected result is returned");
		});

		QUnit.test("when called with insufficient information", function(assert) {
			assert.throws(
				function() {
					return ControlPersonalizationWriteAPI.buildSelectorFromElementIdAndType({
						element: "noControl",
						elementId: "elementId",
						elementType: "elementType"
					});
				},
				Error("Not enough information given to build selector."),
				"an Error is thrown"
			);
			assert.throws(
				function() {
					return ControlPersonalizationWriteAPI.buildSelectorFromElementIdAndType({
						element: "control",
						elementType: "elementType"
					});
				},
				Error("Not enough information given to build selector."),
				"an Error is thrown"
			);
			assert.throws(
				function() {
					return ControlPersonalizationWriteAPI.buildSelectorFromElementIdAndType({
						element: "control",
						elementId: "elementId"
					});
				},
				Error("Not enough information given to build selector."),
				"an Error is thrown"
			);
		});
	});

	QUnit.module("isCondensingEnabled", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		[true, false].forEach(function(bCondensingEnabledSetting) {
			QUnit.test(`when called and condensing is set to ${bCondensingEnabledSetting}`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isCondensingEnabled() {
						return bCondensingEnabledSetting;
					},
					isPublicFlVariantEnabled() {
						return false;
					}
				});

				return ControlPersonalizationWriteAPI.isCondensingEnabled().then(function(bCondensingEnabled) {
					assert.equal(bCondensingEnabledSetting, bCondensingEnabled, "it is returned correct");
				});
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});