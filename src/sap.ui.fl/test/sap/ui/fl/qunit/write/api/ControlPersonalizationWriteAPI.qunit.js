/* global QUnit */

sap.ui.define([
	"sap/ui/fl/ControlPersonalizationAPI",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/registry/ChangeHandlerRegistration",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/ui/fl/registry/Settings",
	"sap/m/App",
	"sap/m/Dialog",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/UIComponent",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
], function(
	ControlPersonalizationAPI,
	FlexControllerFactory,
	Utils,
	Layer,
	LayerUtils,
	ChangeRegistry,
	ChangeHandlerRegistration,
	VariantModel,
	ControlPersonalizationWriteAPI,
	Settings,
	App,
	Dialog,
	ManagedObject,
	ComponentContainer,
	Control,
	Element,
	UIComponent,
	Log,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("_checkChangeSpecificData", {
		before: function() {
			this.oElement = new Element();
		},
		afterEach: function() {
			sandbox.restore();
		},
		after: function() {
			this.oElement.destroy();
		}
	}, function() {
		QUnit.test("when _checkChangeSpecificData is called without selector control", function(assert) {
			var oChange = {
				changeSpecificData: {
					changeType: "foo"
				}
			};
			return ControlPersonalizationAPI._checkChangeSpecificData(oChange)
				.catch(function(oError) {
					assert.equal(oError.message, "No valid selectorControl", "the function returns an error");
				});
		});

		QUnit.test("when _checkChangeSpecificData is called with an invalid selector control", function(assert) {
			var oChange = {
				changeSpecificData: {
					changeType: "foo"
				},
				selectorControl: {}
			};
			return ControlPersonalizationAPI._checkChangeSpecificData(oChange)
				.catch(function(oError) {
					assert.equal(oError.message, "No valid selectorControl", "the function returns an error");
				});
		});

		QUnit.test("when _checkChangeSpecificData is called with a valid selector for selector control", function(assert) {
			var oChange = {
				changeSpecificData: {
					changeType: "foo"
				},
				selectorControl: {
					id: "testComponent---mockview--ObjectPageLayout",
					controlType: "sap.uxap.ObjectPageLayout",
					appComponent: this.oComp
				}
			};
			return ControlPersonalizationAPI._checkChangeSpecificData(oChange)
				.catch(function(oError) {
					assert.equal(oError.message, "No valid selectorControl", "the function returns an error");
				});
		});

		QUnit.test("when _checkChangeSpecificData is called without changeSpecificData", function(assert) {
			var oChange = {
				selectorControl: {}
			};
			return ControlPersonalizationAPI._checkChangeSpecificData(oChange)
				.catch(function(oError) {
					assert.equal(oError.message, "No changeSpecificData available", "the function returns an error");
				});
		});

		QUnit.test("when _checkChangeSpecificData is called without changeType", function(assert) {
			var oChange = {
				changeSpecificData: {},
				selectorControl: {}
			};
			return ControlPersonalizationAPI._checkChangeSpecificData(oChange)
				.catch(function(oError) {
					assert.equal(oError.message, "No valid changeType", "the function returns an error");
				});
		});

		QUnit.test("when _checkChangeSpecificData is called without valid changeHandler", function(assert) {
			var oChange = {
				changeSpecificData: {
					changeType: "foo"
				},
				selectorControl: this.oElement
			};
			return ControlPersonalizationAPI._checkChangeSpecificData(oChange)
			.catch(function(oError) {
				assert.ok(oError, "the function rejects with an error");
			});
		});
	});

	QUnit.module("Given dirty changes in change persistence are required to be saved", {
		beforeEach: function() {
			sandbox.stub(Log, "error");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When save() is called with an array of changes and a valid component", function(assert) {
			var sChangesSaved = "changesSaved";
			var aReferences = ["variantManagementRef1", "variantManagementRef2"];
			var oManagedObject = new ManagedObject("mockManagedObject");
			var aSuccessfulChanges = ["mockChange1", "mockChange2"];
			var oVariantModel = {
				checkDirtyStateForControlModels: function(aVariantManagementReferences) {
					assert.deepEqual(aVariantManagementReferences, aReferences, "then the correct variant management references were passed");
				}
			};
			sandbox.stub(ControlPersonalizationAPI, "_determineParameters")
				.returns({
					flexController: {
						saveSequenceOfDirtyChanges: function(aChanges) {
							assert.deepEqual(aChanges, aSuccessfulChanges, "then the correct changes were passed");
							return Promise.resolve(sChangesSaved);
						}
					},
					variantModel: oVariantModel,
					variantManagement: {
						id1: aReferences[0],
						id2: aReferences[1]
					}
				});

			return ControlPersonalizationWriteAPI.save({selector: {appComponent: oManagedObject}, changes: aSuccessfulChanges})
				.then(function (vResponse) {
					assert.strictEqual(vResponse, sChangesSaved, "then the correct response was received");
					assert.strictEqual(Log.error.callCount, 0, "then Log.error() not called");
					oManagedObject.destroy();
				});
		});

		QUnit.test("When save() is called with an invalid element", function(assert) {
			ControlPersonalizationWriteAPI.save({selector: {}, changes: []});
			assert.ok(Log.error.calledWith("A valid sap.ui.base.ManagedObject instance is required as a parameter"), "then Log.error() called with an error");
		});
	});

	QUnit.module("Given an instance of VariantModel", {
		beforeEach: function(assert) {
			var done = assert.async();

			sandbox.stub(Settings, "getInstance").resolves({
				isVariantPersonalizationEnabled: function () {
					return true;
				}
			});

			jQuery.get("test-resources/sap/ui/fl/qunit/testResources/VariantManagementTestApp.view.xml", null,
			function(viewContent) {
				var MockComponent = UIComponent.extend("MockController", {
					metadata: {
						manifest: {
							"sap.app": {
								applicationVersion: {
									version: "1.2.3"
								}
							}
						}
					},
					createContent: function() {
						var oApp = new App(this.createId("mockapp"));
						var oView = sap.ui.xmlview({
							id: this.createId("mockview"),
							viewContent: viewContent
						});
						oApp.addPage(oView);
						return oApp;
					}
				});
				this.oComp = new MockComponent("testComponent");
				this.oFlexController = FlexControllerFactory.createForControl(this.oComp);
				var oVariantModel = new VariantModel({
					variantManagement: {
						variants: []
					}
				}, this.oFlexController, this.oComp);
				sandbox.stub(oVariantModel, "addChange");
				this.oComp.setModel(oVariantModel, Utils.VARIANT_MODEL_NAME);
				this.oCompContainer = new ComponentContainer({
					component: this.oComp
				}).placeAt("qunit-fixture");

				this.mMoveChangeData1 = {
					selectorElement: sap.ui.getCore().byId("testComponent---mockview--ObjectPageLayout"),
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
					selectorElement: sap.ui.getCore().byId("testComponent---mockview--ObjectPageLayout"),
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
					selectorElement: sap.ui.getCore().byId("testComponent---mockview--ObjectPageSection1"),
					changeSpecificData: {
						changeType: "rename",
						renamedElement: {
							id: "testComponent---mockview--ObjectPageSection1"
						},
						value: "Personalization Test"
					}
				};
				this.mRenameChangeData2 = {
					selectorElement: sap.ui.getCore().byId("testComponent---mockview--TextTitle1"),
					changeSpecificData: {
						changeType: "rename",
						renamedElement: {
							id: "testComponent---mockview--TextTitle1"
						},
						value: "Change for the inner variant"
					}
				};

				this.fnLogErrorSpy = sandbox.spy(Log, "error");
				this.fnCreateAndAddChangeSpy = sandbox.spy(this.oFlexController, "addChange");
				this.fnApplyChangeSpy = sandbox.spy(this.oFlexController, "applyChange");

				//registration is triggered by instantiation of XML View above
				ChangeHandlerRegistration.waitForChangeHandlerRegistration("sap.uxap").then(done);
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
			this.oCompContainer.destroy();
			this.oComp.destroy();
		}
	}, function() {
		QUnit.test("when calling 'add' with two valid variant changes", function(assert) {
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mMoveChangeData2]
			})
			.then(function (aSuccessfulChanges) {
				assert.equal(this.fnLogErrorSpy.callCount, 0, "no errors occurred");
				assert.equal(this.fnCreateAndAddChangeSpy.callCount, 2, "FlexController.addChange has been called twice");
				assert.equal(this.fnApplyChangeSpy.callCount, 2, "FlexController.applyChange has been called twice");
				assert.deepEqual(aSuccessfulChanges[0].getSelector(), {
					id: "mockview--ObjectPageLayout",
					idIsLocal: true
				}, "then first successfully applied change was returned");
				assert.deepEqual(aSuccessfulChanges[1].getSelector(), {
					id: "mockview--ObjectPageLayout",
					idIsLocal: true
				}, "then second successfully applied change was returned");
				assert.ok(this.fnCreateAndAddChangeSpy.getCall(1).calledBefore(this.fnApplyChangeSpy.getCall(0)));
			}.bind(this));
		});

		QUnit.test("when calling 'add' with two changes, one with an invalid and the other with a valid changeSpecificData", function(assert) {
			sandbox.stub(ControlPersonalizationAPI, "_checkChangeSpecificData")
				.callThrough()
				.withArgs(this.mMoveChangeData1)
				.rejects(new Error("myError"));
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mMoveChangeData2]
			})
			.then(function(aSuccessfulChanges) {
				assert.equal(this.fnLogErrorSpy.callCount, 1, "one error occurred");
				assert.equal(this.fnLogErrorSpy.args[0][0], "Error during execPromiseQueueSequentially processing occured: myError", "then the correct error was logged");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "FlexController.applyChange was called once");
				assert.deepEqual(aSuccessfulChanges[0].getSelector(), {id: "mockview--ObjectPageLayout", idIsLocal: true}, "then only the successfully applied change was returned");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with two changes, one with an unstable control id and the other with a with a stable control id", function(assert) {
			var oUnstableIdChangeData = Object.assign({}, this.mMoveChangeData2);
			// mocking unstable id
			oUnstableIdChangeData.changeSpecificData.movedElements[0].id = "__" + oUnstableIdChangeData.changeSpecificData.movedElements[0].id;
			return ControlPersonalizationWriteAPI.add({
				changes: [oUnstableIdChangeData, this.mMoveChangeData1]
			})
			.then(function(aSuccessfulChanges) {
				assert.equal(this.fnLogErrorSpy.callCount, 1, "one error occurred");
				assert.equal(this.fnLogErrorSpy.args[0][0],
					"Error during execPromiseQueueSequentially processing occured: Generated ID attribute found - to offer flexibility a stable control ID is needed to assign the changes to, but for this control the ID was generated by SAPUI5 " + oUnstableIdChangeData.changeSpecificData.movedElements[0].id,
					"then the correct error was logged");
				assert.strictEqual(aSuccessfulChanges.length, 1, "then only one change was successfully applied");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with two valid variant changes and an invalid change", function(assert) {
			this.mRenameChangeData1.selectorElement = undefined;
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mRenameChangeData1, this.mMoveChangeData2]
			})
			.then(function() {
				assert.equal(this.fnLogErrorSpy.callCount, 1, "one error occurred");
				assert.equal(this.fnApplyChangeSpy.callCount, 2, "FlexController.applyChange has been called twice");
			}.bind(this));
		});

		QUnit.test("when calling 'add' where one change content has variantReference set", function(assert) {
			sandbox.stub(ChangeRegistry.getInstance(), "_isRegistryItemValidForLayer").returns(true); //needed as some ChangeHandlers are not available for USER layer

			sandbox.spy(ControlPersonalizationAPI, "_getVariantManagement");
			this.mMoveChangeData1.changeSpecificData.variantReference = "mockVariantReference";
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mRenameChangeData1, this.mMoveChangeData2, this.mRenameChangeData2]
			})
			.then(function(aSuccessfulChanges) {
				assert.equal(this.fnLogErrorSpy.callCount, 0, "no error occurred");
				assert.equal(this.fnApplyChangeSpy.callCount, 4, "FlexController.applyChange has been called four times");
				assert.equal(this.fnCreateAndAddChangeSpy.callCount, 4, "FlexController.addChange has been called four times");
				assert.strictEqual(aSuccessfulChanges.length, 4, "then all passed change contents were applied successfully");
				assert.strictEqual(ControlPersonalizationAPI._getVariantManagement.callCount, 3, "then variant reference is not called for the change content where variantReference was preset");
				assert.equal(this.fnCreateAndAddChangeSpy.getCall(0).args[0].variantReference, "mockVariantReference", "first change belongs to the preset variant reference");
				assert.equal(this.fnCreateAndAddChangeSpy.getCall(1).args[0].variantReference, "mockview--VariantManagement1", "second change belongs to VariantManagement1");
				assert.equal(this.fnCreateAndAddChangeSpy.getCall(2).args[0].variantReference, "mockview--VariantManagement1", "third change belongs to VariantManagement1");
				assert.equal(this.fnCreateAndAddChangeSpy.getCall(3).args[0].variantReference, "mockview--VariantManagement2", "fourth change belongs to VariantManagement2");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with a change outside of a variant management control", function(assert) {
			sandbox.stub(ChangeRegistry.getInstance(), "_isRegistryItemValidForLayer").returns(true); //needed as some ChangeHandlers are not available for USER layer
			var oButton = sap.ui.getCore().byId("testComponent---mockview--Button");
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
				assert.equal(this.fnLogErrorSpy.callCount, 0, "no error occurred");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "FlexController.applyChange has been called once");
				assert.equal(this.fnCreateAndAddChangeSpy.callCount, 1, "FlexController.addChange has been called four times");
				assert.deepEqual(this.fnCreateAndAddChangeSpy.getCall(0).args[0].renamedElement, oChangeData.changeSpecificData.renamedElement, "FlexController.addChange was called with the correct renamed element");
				assert.deepEqual(this.fnCreateAndAddChangeSpy.getCall(0).args[0].changeType, oChangeData.changeSpecificData.changeType, "FlexController.addChange was called with the correct change type");
				assert.deepEqual(this.fnCreateAndAddChangeSpy.getCall(0).args[0].value, oChangeData.changeSpecificData.value, "FlexController.addChange was called with the correct value");
				assert.notOk(this.fnCreateAndAddChangeSpy.getCall(0).args[0].variantReference, "FlexController.addChange was called for a change without variant management");
				assert.deepEqual(this.fnCreateAndAddChangeSpy.getCall(0).args[1], oButton, "FlexController.addChange was called with the correct control");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with 'ignoreVariantManagement' property set, for change contents with and without variantReferences and a variant model", function(assert) {
			sandbox.stub(ChangeRegistry.getInstance(), "_isRegistryItemValidForLayer").returns(true); //needed as some ChangeHandlers are not available for USER layer
			this.mMoveChangeData1.changeSpecificData.variantReference = "mockVariantReference";
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mRenameChangeData1, this.mMoveChangeData2, this.mRenameChangeData2],
				ignoreVariantManagement: true
			})
			.then(function (aSuccessfulChanges) {
				assert.equal(this.fnLogErrorSpy.callCount, 0, "no error occurred");
				assert.equal(this.fnApplyChangeSpy.callCount, 4, "FlexController.applyChange has been called four times");
				assert.strictEqual(aSuccessfulChanges.length, 4, "then all passed change contents were applied successfully");
				assert.notOk(aSuccessfulChanges[0].getVariantReference(), "then variantReference property is deleted for the change, where it was preset");
				assert.notOk(this.fnApplyChangeSpy.getCall(0).args[0].variantReference, "first change is without the preset variant reference");
				assert.notOk(this.fnApplyChangeSpy.getCall(1).args[0].variantReference, "second change is without VariantManagement1");
				assert.notOk(this.fnApplyChangeSpy.getCall(2).args[0].variantReference, "third change is without VariantManagement1");
				assert.notOk(this.fnApplyChangeSpy.getCall(3).args[0].variantReference, "fourth change is without VariantManagement2");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with 'ignoreVariantManagement' property set, for change contents with and without variantReferences and no variant model", function(assert) {
			sandbox.stub(ChangeRegistry.getInstance(), "_isRegistryItemValidForLayer").returns(true); //needed as some ChangeHandlers are not available for USER layer
			sandbox.stub(this.oComp, "getModel")
				.callThrough()
				.withArgs(Utils.VARIANT_MODEL_NAME)
				.returns(undefined);
			this.mMoveChangeData1.changeSpecificData.variantReference = "mockVariantReference";
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mRenameChangeData1],
				ignoreVariantManagement: true
			})
				.then(function (aSuccessfulChanges) {
					assert.equal(this.fnLogErrorSpy.callCount, 0, "no error occurred");
					assert.equal(this.fnApplyChangeSpy.callCount, 2, "FlexController.applyChange was called twice");
					assert.strictEqual(aSuccessfulChanges.length, 2, "then all passed change contents were applied successfully");
					assert.notOk(aSuccessfulChanges[0].getVariantReference(), "then variantReference property is deleted for the change, where it was preset");
				}.bind(this));
		});
	});

	QUnit.module("Given an instance of VariantModel on a dialog", {
		beforeEach: function(assert) {
			var done = assert.async();

			sandbox.stub(Settings, "getInstance").resolves({
				isVariantPersonalizationEnabled: function () {
					return true;
				}
			});

			jQuery.get("test-resources/sap/ui/fl/qunit/testResources/VariantManagementTestApp.view.xml", null,
			function(viewContent) {
				var MockComponent = UIComponent.extend("MockController", {
					metadata: {
						manifest: {
							"sap.app": {
								applicationVersion: {
									version: "1.2.3"
								}
							}
						}
					},
					createContent: function() {
						var oApp = new App(this.createId("mockapp"));
						var oRootView = sap.ui.xmlview({
							id: this.createId("root-mockview"),
							viewContent: '<mvc:View id="mockview" xmlns:mvc="sap.ui.core.mvc"/>'
						});
						var oView = sap.ui.xmlview({
							id: this.createId("mockview"),
							viewContent: viewContent
						});
						var oDialog = new Dialog("dialog", {
							content: oView
						});
						oApp.addPage(oRootView);
						oRootView.addDependent(oDialog);
						oDialog.open();
						return oApp;
					}
				});
				this.oComp = new MockComponent("testComponent");
				this.oFlexController = FlexControllerFactory.createForControl(this.oComp);
				var oVariantModel = new VariantModel({
					variantManagement: {
						variants: []
					}
				}, this.oFlexController, this.oComp);
				sandbox.stub(oVariantModel, "addChange");
				this.oComp.setModel(oVariantModel, Utils.VARIANT_MODEL_NAME);
				this.oCompContainer = new ComponentContainer({
					component: this.oComp
				}).placeAt("qunit-fixture");

				this.mMoveChangeData1 = {
					selectorElement: sap.ui.getCore().byId("testComponent---mockview--ObjectPageLayout"),
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
					selectorElement: sap.ui.getCore().byId("testComponent---mockview--ObjectPageLayout"),
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

				this.fnLogErrorSpy = sandbox.spy(Log, "error");
				this.fnApplyChangeSpy = sandbox.spy(this.oFlexController, "applyChange");

				//registration is triggered by instantiation of XML View above
				ChangeHandlerRegistration.waitForChangeHandlerRegistration("sap.uxap").then(done);
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
			this.oCompContainer.destroy();
			this.oComp.destroy();
		}
	}, function() {
		QUnit.test("when calling 'add' with two valid variant changes", function(assert) {
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mMoveChangeData2]
			})
			.then(function (aSuccessfulChanges) {
				assert.equal(this.fnLogErrorSpy.callCount, 0, "no errors occurred");
				assert.equal(this.fnApplyChangeSpy.callCount, 2, "FlexController.applyChange has been called twice");
				assert.deepEqual(aSuccessfulChanges[0].getSelector(), {
					id: "mockview--ObjectPageLayout",
					idIsLocal: true
				}, "then first successfully applied change was returned");
				assert.equal(aSuccessfulChanges[0].getDefinition().variantReference, "mockview--VariantManagement1", "the variant reference is correct");
				assert.deepEqual(aSuccessfulChanges[1].getSelector(), {
					id: "mockview--ObjectPageLayout",
					idIsLocal: true
				}, "then second successfully applied change was returned");
				assert.equal(aSuccessfulChanges[1].getDefinition().variantReference, "mockview--VariantManagement1", "the variant reference is correct");
			}.bind(this));
		});

		QUnit.test("when calling 'add' with 'useStaticArea' and two valid variant changes", function(assert) {
			return ControlPersonalizationWriteAPI.add({
				changes: [this.mMoveChangeData1, this.mMoveChangeData2],
				useStaticArea: true
			})
			.then(function (aSuccessfulChanges) {
				assert.equal(this.fnLogErrorSpy.callCount, 0, "no errors occurred");
				assert.equal(this.fnApplyChangeSpy.callCount, 2, "FlexController.applyChange has been called twice");
				assert.deepEqual(aSuccessfulChanges[0].getSelector(), {
					id: "mockview--ObjectPageLayout",
					idIsLocal: true
				}, "then first successfully applied change was returned");
				assert.equal(aSuccessfulChanges[0].getDefinition().variantReference, "mockview--VariantManagement1", "the variant reference is correct");
				assert.deepEqual(aSuccessfulChanges[1].getSelector(), {
					id: "mockview--ObjectPageLayout",
					idIsLocal: true
				}, "then second successfully applied change was returned");
				assert.equal(aSuccessfulChanges[0].getDefinition().variantReference, "mockview--VariantManagement1", "the variant reference is correct");
			}.bind(this));
		});
	});

	function createResetStub(oAppComponent) {
		var fnResetStub = sandbox.stub();
		sandbox.stub(FlexControllerFactory, "createForControl")
			.callThrough()
			.withArgs(oAppComponent)
			.returns({
				resetChanges: fnResetStub.resolves()
			});

		return fnResetStub;
	}

	QUnit.module("reset", {
		beforeEach: function() {
			this.aControls = [];
			this.getControlIds = function () {
				return this.aControls.map(function(vControl) {
					return vControl instanceof Element ? vControl.getId() : vControl.id;
				});
			};
			sandbox.stub(Log, "error");
		},
		afterEach: function() {
			this.aControls.forEach(function (vControl) {
				var oControl = vControl instanceof Element ? vControl : sap.ui.getCore().byId(vControl.id);
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
		QUnit.test("When reset() is called with an array of control IDs and change types", function(assert) {
			var aChangeTypes = ["changeType1", "changeType2"];
			this.oAppComponent = new UIComponent("AppComponent2");
			this.aControls.push({id: "controlId", appComponent: this.oAppComponent});
			var fnResetStub = createResetStub(this.oAppComponent);

			return ControlPersonalizationWriteAPI.reset({selectors: this.aControls, changeTypes: aChangeTypes})
				.then(function () {
					assert.ok(fnResetStub.calledWith(Layer.USER, undefined, this.oAppComponent, this.getControlIds(), aChangeTypes), "then FlexController.reset is called with the passed selectors and change types");
				}.bind(this));
		});

		QUnit.test("When reset() is called with an array of control IDs which are partially local and partially not", function(assert) {
			this.oAppComponent = new UIComponent("AppComponent2");
			var aChangeTypes = ["changeType1", "changeType2"];
			this.aControls.push({id: this.oAppComponent.createId("view--controlId2"), appComponent: this.oAppComponent});
			this.aControls.push({id: "feElementsView::controlId", appComponent: this.oAppComponent}); // element currently not present in the runtime
			var fnResetStub = createResetStub(this.oAppComponent);

			return ControlPersonalizationWriteAPI.reset({selectors: this.aControls, changeTypes: aChangeTypes})
				.then(function () {
					assert.ok(fnResetStub.calledWith(Layer.USER, undefined, this.oAppComponent, ["view--controlId2", "feElementsView::controlId"], aChangeTypes), "then FlexController.reset is called with the passed control IDs and change types");
				}.bind(this));
		});

		QUnit.test("When reset() is called with a control IDs map and for no control ID a control is instantiated but an app component was provided", function(assert) {
			this.oAppComponent = new UIComponent("AppComponent2");
			var oControl = new Control(this.oAppComponent.createId("view--controlId4")); // view ID normally generated by the view between the component and the control
			this.aControls.push({id: oControl.getId()});
			var aSelector = [{id: "controlId3", appComponent: this.oAppComponent}, oControl];
			var fnResetStub = createResetStub(this.oAppComponent);

			return ControlPersonalizationWriteAPI.reset({selectors: aSelector})
				.then(function () {
					assert.ok(fnResetStub.calledWith(Layer.USER, undefined, this.oAppComponent, ["controlId3", "view--controlId4"], undefined), "then FlexController.reset is called with the passed control IDs and change types");
				}.bind(this));
		});

		QUnit.test("When reset() is called with a mixture of control IDs and controls and for no control ID a control", function(assert) {
			this.oAppComponent = new UIComponent("AppComponent2");
			var aSelectors = [{id: "controlId3", appComponent: this.oAppComponent}, {id: "controlId4", appComponent: this.oAppComponent}];
			var fnResetStub = createResetStub(this.oAppComponent);

			return ControlPersonalizationWriteAPI.reset({selectors: aSelectors})
				.then(function () {
					assert.ok(fnResetStub.calledWith(Layer.USER, undefined, this.oAppComponent, ["controlId3", "controlId4"], undefined), "then FlexController.reset is called with the passed control IDs and change types");
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
		beforeEach: function() {
			this.oAppComponent = new UIComponent();
			this.sControlId = "view--control1";
			this.oControl = new Control(this.oAppComponent.createId(this.sControlId));
		},
		afterEach: function() {
			sandbox.restore();
			this.oAppComponent.destroy();
			this.oControl.destroy();
		}
	}, function() {
		QUnit.test("when called without a property bag", function (assert) {
			return ControlPersonalizationWriteAPI.restore()
				.catch(function (sMessage) {
					assert.equal(sMessage, "No selector was provided", "then a rejection with the correct message was done");
				});
		});

		QUnit.test("when called without a selector", function (assert) {
			return ControlPersonalizationWriteAPI.restore({})
				.catch(function (sMessage) {
					assert.equal(sMessage, "No selector was provided", "then a rejection with the correct message was done");
				});
		});

		QUnit.test("when no app component could be determined", function (assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(undefined);

			return ControlPersonalizationWriteAPI.restore({
				selector: new Control(this.oControl)
			})
				.catch(function (sMessage) {
					assert.equal(sMessage, "App Component could not be determined", "then a rejection with the correct message was done");
				});
		});

		QUnit.test("when a restore with a generator was called", function (assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var oFlexController = FlexControllerFactory.createForControl(this.oAppComponent);
			var oRemoveDirtyChangesSpy = sandbox.spy(oFlexController, "removeDirtyChanges");

			var sGenerator = "Change.createInitialFileContent";
			return ControlPersonalizationWriteAPI.restore({
				selector: this.oControl,
				generator: sGenerator
			})
			.then(function () {
				assert.equal(oRemoveDirtyChangesSpy.callCount, 1, "removeDirtyChanges was called once");
				var aArguments = oRemoveDirtyChangesSpy.getCall(0).args;
				assert.equal(aArguments[0], Layer.USER, "the USER layer was passed");
				assert.equal(aArguments[1], this.oAppComponent, "the app component was passed");
				assert.equal(aArguments[2], this.oControl, "the the control was passed");
				assert.equal(aArguments[3], sGenerator, "the generator was passed");
				assert.equal(aArguments[4], undefined, "the changeTypes were not passed");
			}.bind(this));
		});

		QUnit.test("when a restore with a changeType list was called", function (assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var oFlexController = FlexControllerFactory.createForControl(this.oAppComponent);
			var oRemoveDirtyChangesSpy = sandbox.spy(oFlexController, "removeDirtyChanges");

			var aChangeTypes = ["Change.createInitialFileContent"];
			return ControlPersonalizationWriteAPI.restore({
				selector: this.oControl,
				changeTypes: aChangeTypes
			})
			.then(function () {
				assert.equal(oRemoveDirtyChangesSpy.callCount, 1, "removeDirtyChanges was called once");
				var aArguments = oRemoveDirtyChangesSpy.getCall(0).args;
				assert.equal(aArguments[0], Layer.USER, "the USER layer was passed");
				assert.equal(aArguments[1], this.oAppComponent, "the app component was passed");
				assert.equal(aArguments[2], this.oControl, "the the control was passed");
				assert.equal(aArguments[3], undefined, "the generator was passed");
				assert.equal(aArguments[4], aChangeTypes, "the changeTypes were passed");
			}.bind(this));
		});

		QUnit.test("when a restore with a changeType list was called", function (assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var oFlexController = FlexControllerFactory.createForControl(this.oAppComponent);
			var oRemoveDirtyChangesSpy = sandbox.spy(oFlexController, "removeDirtyChanges");

			var sSelectorIds = ["myControl"];
			return ControlPersonalizationWriteAPI.restore({
				selector: this.oControl,
				selectorIds: sSelectorIds
			})
			.then(function () {
				assert.equal(oRemoveDirtyChangesSpy.callCount, 1, "removeDirtyChanges was called once");
				var aArguments = oRemoveDirtyChangesSpy.getCall(0).args;
				assert.equal(aArguments[0], Layer.USER, "the USER layer was passed");
				assert.equal(aArguments[1], this.oAppComponent, "the app component was passed");
				assert.equal(aArguments[2], this.oControl, "the the control was passed");
				assert.equal(aArguments[3], undefined, "the generator was passed");
				assert.equal(aArguments[4], undefined, "the changeTypes were not passed");
			}.bind(this));
		});
	});

	QUnit.module("buildSelectorFromElementIdAndType", {
		beforeEach: function() {
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
		afterEach: function() {
			sandbox.restore();
			this.oAppComponent.destroy();
		}
	}, function() {
		QUnit.test("when called with a control", function(assert) {
			var oControlEquivalent = ControlPersonalizationWriteAPI.buildSelectorFromElementIdAndType({element: "control", elementId: "elementId", elementType: "elementType"});
			assert.deepEqual(oControlEquivalent, this.oExpectedResult, "the expected result is returned");
		});

		QUnit.test("when called with insufficient information", function(assert) {
			assert.throws(
				function() {
					return ControlPersonalizationWriteAPI.buildSelectorFromElementIdAndType({element: "noControl", elementId: "elementId", elementType: "elementType"});
				},
				Error("Not enough information given to build selector."),
				"an Error is thrown"
			);
			assert.throws(
				function() {
					return ControlPersonalizationWriteAPI.buildSelectorFromElementIdAndType({element: "control", elementType: "elementType"});
				},
				Error("Not enough information given to build selector."),
				"an Error is thrown"
			);
			assert.throws(
				function() {
					return ControlPersonalizationWriteAPI.buildSelectorFromElementIdAndType({element: "control", elementId: "elementId"});
				},
				Error("Not enough information given to build selector."),
				"an Error is thrown"
			);
		});
	});


	QUnit.module("isCondensingEnabled", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		[true, false].forEach(function (bCondensingEnabledSetting) {
			QUnit.test("when called and condensing is set to " + bCondensingEnabledSetting, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isCondensingEnabled: function () {
						return bCondensingEnabledSetting;
					}
				});

				return ControlPersonalizationWriteAPI.isCondensingEnabled().then(function (bCondensingEnabled) {
					assert.equal(bCondensingEnabledSetting, bCondensingEnabled, "it is returned correct");
				});
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
