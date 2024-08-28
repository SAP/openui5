/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/HBox",
	"sap/m/MessageBox",
	"sap/ui/comp/smartvariants/SmartVariantManagement",
	"sap/ui/core/Lib",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/CompVariant",
	"sap/ui/rta/Utils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Button,
	HBox,
	MessageBox,
	SmartVariantManagement,
	Lib,
	DesignTime,
	OverlayRegistry,
	KeyCodes,
	SmartVariantManagementApplyAPI,
	ContextSharingAPI,
	SmartVariantManagementWriteAPI,
	Settings,
	Layer,
	CommandFactory,
	CompVariant,
	Utils,
	nextUIUpdate,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oComp = RtaQunitUtils.createAndStubAppComponent(sinon);

	function waitForCommandToBeCreated(oPlugin) {
		return new Promise(function(resolve) {
			oPlugin.attachEventOnce("elementModified", function(oEvent) {
				resolve(oEvent.getParameters());
			});
		});
	}

	function getContextMenuEntryById(sId) {
		var aMenuItems = this.oPlugin.getMenuItems([this.oVariantManagementOverlay]);
		var oReturn;
		aMenuItems.some(function(oMenuItem) {
			if (oMenuItem.id === sId) {
				oReturn = oMenuItem;
				return true;
			}
		});
		return oReturn;
	}

	function setTextAndTriggerEnterOnEditableField(oPlugin, sText) {
		oPlugin._oEditableControlDomRef.textContent = sText;
		oPlugin._oEditableField.textContent = oPlugin._oEditableControlDomRef.textContent;
		var oEvent = new Event("keydown");
		oEvent.keyCode = KeyCodes.ENTER;
		oPlugin._oEditableField.dispatchEvent(oEvent);
	}

	QUnit.module("Given a designTime and ControlVariant plugin are instantiated", {
		before() {
			this.oVariantManagementControl = new SmartVariantManagement("svm", {
				persistencyKey: "myPersistencyKey"
			});
			this.oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");
			return SmartVariantManagementApplyAPI.loadVariants({
				control: this.oVariantManagementControl,
				standardVariant: {}
			});
		},
		async beforeEach(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({getUserId() {return undefined;}});
			var done = assert.async();
			this.oPlugin = new CompVariant({
				commandFactory: new CommandFactory()
			});

			this.oVariantId = "myFancyVariantId";
			sandbox.stub(this.oVariantManagementControl, "getPresentVariantId").returns(this.oVariantId);
			this.oVariant = SmartVariantManagementWriteAPI.addVariant({
				changeSpecificData: {
					id: this.oVariantId,
					texts: {
						variantName: "myFancyVariant"
					},
					layer: Layer.CUSTOMER
				},
				control: this.oVariantManagementControl
			});
			sandbox.stub(this.oVariantManagementControl, "getAllVariants").returns([this.oVariant]);

			this.oVariantManagementControl.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVariantManagementControl],
				plugins: [this.oPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVariantManagementOverlay = OverlayRegistry.getOverlay(this.oVariantManagementControl);
				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oDesignTime.destroy();
		},
		after() {
			this.oVariantManagementControl.destroy();
		}
	}, function() {
		QUnit.test("getMenuItems - Variant rename not enabled, edit not enabled", function(assert) {
			sandbox.stub(this.oVariant, "isRenameEnabled").returns(false);
			sandbox.stub(this.oVariant, "isEditEnabled").returns(false);

			var aMenuItems = this.oPlugin.getMenuItems([this.oVariantManagementOverlay]);
			assert.strictEqual(aMenuItems.length, 3, "three context menu items are visible for readyOnly");
			assert.strictEqual(aMenuItems[0].id, "CTX_COMP_VARIANT_SAVE_AS", "Save As is first");
			assert.strictEqual(aMenuItems[1].id, "CTX_COMP_VARIANT_MANAGE", "Manage is second");
			assert.strictEqual(aMenuItems[2].id, "CTX_COMP_VARIANT_SWITCH", "Switch is third");
		});

		QUnit.test("getMenuItems - Variant rename enabled, edit enabled", function(assert) {
			sandbox.stub(this.oVariant, "isRenameEnabled").returns(true);
			sandbox.stub(this.oVariant, "isEditEnabled").returns(true);

			var aMenuItems = this.oPlugin.getMenuItems([this.oVariantManagementOverlay]);
			assert.strictEqual(aMenuItems.length, 5, "five context menu items are visible for readyOnly");
			assert.strictEqual(aMenuItems[0].id, "CTX_COMP_VARIANT_RENAME", "Rename is first");
			assert.strictEqual(aMenuItems[1].id, "CTX_COMP_VARIANT_SAVE", "Save is second");
			assert.strictEqual(aMenuItems[2].id, "CTX_COMP_VARIANT_SAVE_AS", "Save As is third");
			assert.strictEqual(aMenuItems[3].id, "CTX_COMP_VARIANT_MANAGE", "Manage is fourth");
			assert.strictEqual(aMenuItems[4].id, "CTX_COMP_VARIANT_SWITCH", "Switch is fifth");
		});

		QUnit.test("Rename", async function(assert) {
			const sNewText = "myFancyText";
			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_RENAME");
			oMenuItem.handler([this.oVariantManagementOverlay]);
			setTextAndTriggerEnterOnEditableField(this.oPlugin, sNewText);
			const oParameters = await waitForCommandToBeCreated(this.oPlugin);
			const oCommand = oParameters.command;
			const mExpectedNewVariantProps = {};
			mExpectedNewVariantProps[this.oVariantId] = {
				name: sNewText
			};
			assert.deepEqual(
				oCommand.getNewVariantProperties(),
				mExpectedNewVariantProps,
				"the property newVariantProperties was set correctly"
			);
			assert.strictEqual(oCommand.getElement().getId(), "svm", "the SVM is passed as element key is set");
		});

		QUnit.test("when isRenameAvailable is called with VariantManagement overlay", function(assert) {
			const bVMAvailable = this.oPlugin.isRenameAvailable(this.oVariantManagementOverlay);
			assert.ok(bVMAvailable, "then variant rename is available for VariantManagement control");
		});

		QUnit.test("when isRenameEnabled is called with VariantManagement overlay", function(assert) {
			const bVMEnabled = this.oPlugin.isRenameEnabled([this.oVariantManagementOverlay]);
			assert.ok(bVMEnabled, "then variant rename is enabled for VariantManagement control");
		});

		QUnit.test("Save with not modified variant", function(assert) {
			sandbox.stub(this.oVariantManagementControl, "currentVariantGetModified").returns(false);
			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_SAVE");
			assert.strictEqual(oMenuItem.enabled([this.oVariantManagementOverlay]), false, "the save is not enabled");
		});

		QUnit.test("Save with modified variant", function(assert) {
			var oContent = {foo: "bar"};
			sandbox.stub(this.oVariantManagementControl, "currentVariantGetModified").returns(true);
			sandbox.stub(this.oVariantManagementControl, "getPresentVariantContent").resolves(oContent);

			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_SAVE");
			assert.strictEqual(oMenuItem.enabled([this.oVariantManagementOverlay]), true, "the save is enabled");

			var pReturn = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var mExpectedProperties = {};
				mExpectedProperties[this.oVariantId] = {
					content: oContent
				};
				var oCommand = oParameters.command;
				assert.strictEqual(oCommand.getOnlySave(), true, "the saveOnly property is set");
				assert.deepEqual(oCommand.getNewVariantProperties(), mExpectedProperties, "the newVariantProperties property is set");
				assert.strictEqual(oCommand.getElement().getId(), "svm", "the SVM is passed as element key is set");
			}.bind(this));

			oMenuItem.handler([this.oVariantManagementOverlay]);
			return pReturn;
		});

		QUnit.test("Switch with only one variant", function(assert) {
			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_SWITCH");
			assert.strictEqual(oMenuItem.enabled([this.oVariantManagementOverlay]), false, "the save is not enabled");
		});

		QUnit.test("Switch with multiple variants", function(assert) {
			var aVariants = [
				SmartVariantManagementWriteAPI.addVariant({
					changeSpecificData: {
						id: "id1",
						texts: {
							variantName: "text1"
						},
						layer: Layer.CUSTOMER
					},
					control: this.oVariantManagementControl
				}),
				SmartVariantManagementWriteAPI.addVariant({
					changeSpecificData: {
						id: "id2",
						texts: {
							variantName: "text2"
						},
						layer: Layer.CUSTOMER
					},
					control: this.oVariantManagementControl
				}),
				SmartVariantManagementWriteAPI.addVariant({
					changeSpecificData: {
						id: "id3",
						texts: {
							variantName: "text3"
						},
						layer: Layer.CUSTOMER
					},
					control: this.oVariantManagementControl
				})
			];
			this.oVariantManagementControl.getAllVariants.restore();
			sandbox.stub(this.oVariantManagementControl, "getAllVariants").returns(aVariants);
			this.oVariantManagementControl.getPresentVariantId.restore();
			sandbox.stub(this.oVariantManagementControl, "getPresentVariantId").returns("id2");

			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_SWITCH");
			assert.strictEqual(oMenuItem.enabled([this.oVariantManagementOverlay]), true, "the save is enabled");
			assert.strictEqual(oMenuItem.submenu.length, 3, "there are 3 entries in the submenu");
			assert.deepEqual(oMenuItem.submenu[0], {
				id: "id1",
				icon: "blank",
				enabled: true,
				text: "text1"
			}, "the first variant is there and correct");
			assert.deepEqual(oMenuItem.submenu[1], {
				id: "id2",
				icon: "sap-icon://accept",
				enabled: false,
				text: "text2"
			}, "the second variant is there and correct");
			assert.deepEqual(oMenuItem.submenu[2], {
				id: "id3",
				icon: "blank",
				enabled: true,
				text: "text3"
			}, "the third variant is there and correct");

			var oEvent = {
				getParameters() {
					return {
						item: {
							getProperty() {
								return "id3";
							}
						}
					};
				}
			};

			var pReturn = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var oCommand = oParameters.command;
				assert.strictEqual(oCommand.getTargetVariantId(), "id3", "the targetVariantId property is set");
				assert.deepEqual(oCommand.getSourceVariantId(), "id2", "the sourceVariantId property is set");
			});

			oMenuItem.handler([this.oVariantManagementOverlay], {eventItem: oEvent});
			return pReturn;
		});

		function testSwitchDialogOptions(fnDialogCheck, pReturn) {
			var aVariants = [
				SmartVariantManagementWriteAPI.addVariant({
					changeSpecificData: {
						id: "id1",
						texts: {
							variantName: "text1"
						},
						layer: Layer.CUSTOMER
					},
					control: this.oVariantManagementControl
				}),
				SmartVariantManagementWriteAPI.addVariant({
					changeSpecificData: {
						id: "id2",
						texts: {
							variantName: "text2"
						},
						layer: Layer.CUSTOMER
					},
					control: this.oVariantManagementControl
				})
			];
			this.oVariantManagementControl.getAllVariants.restore();
			sandbox.stub(this.oVariantManagementControl, "getAllVariants").returns(aVariants);
			this.oVariantManagementControl.getPresentVariantId.restore();
			sandbox.stub(this.oVariantManagementControl, "getPresentVariantId").returns("id1");

			sandbox.stub(this.oVariantManagementControl, "getModified").returns(true);

			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_SWITCH");

			var oEvent = {
				getParameters() {
					return {
						item: {
							getProperty() {
								return "id2";
							}
						}
					};
				}
			};

			sandbox.stub(MessageBox, "warning").callsFake(fnDialogCheck.bind(this));

			oMenuItem.handler([this.oVariantManagementOverlay], {eventItem: oEvent});
			return pReturn;
		}

		QUnit.test("when the current variant has unsaved changes and user switches to another variant - user chooses 'save'", function(assert) {
			function fnDialogCheck(sMessage, oParameters) {
				assert.strictEqual(sMessage, this.oLibraryBundle.getText("MSG_CHANGE_MODIFIED_VARIANT"), "the message is correct");
				assert.strictEqual(oParameters.styleClass, Utils.getRtaStyleClassName(), "the style class is set");
				assert.strictEqual(oParameters.emphasizedAction, this.oLibraryBundle.getText("BTN_MODIFIED_VARIANT_SAVE"), "the emphasized button text is correct");
				oParameters.onClose(oParameters.emphasizedAction);
			}

			var pReturn = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var aCommands = oParameters.command.getCommands();
				var oUpdateCommand = aCommands[0];
				assert.strictEqual(oUpdateCommand.getName(), "compVariantUpdate", "then the update command is created successfully");
				assert.ok(oUpdateCommand.getOnlySave(), "then the update command is created with onlySave = true");
				var oSwitchCommand = aCommands[1];
				assert.strictEqual(oSwitchCommand.getTargetVariantId(), "id2", "the targetVariantId property is set");
				assert.deepEqual(oSwitchCommand.getSourceVariantId(), "id1", "the sourceVariantId property is set");
			});

			return testSwitchDialogOptions.call(this, fnDialogCheck, pReturn);
		});

		QUnit.test("when the current variant has unsaved changes and user switches to another variant - user chooses 'discard'", function(assert) {
			function fnDialogCheck(sMessage, oParameters) {
				oParameters.onClose(this.oLibraryBundle.getText("BTN_MODIFIED_VARIANT_DISCARD"));
			}

			var pReturn = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var oCommand = oParameters.command;
				assert.strictEqual(oCommand.getTargetVariantId(), "id2", "the targetVariantId property is set");
				assert.deepEqual(oCommand.getSourceVariantId(), "id1", "the sourceVariantId property is set");
				assert.ok(oCommand.getDiscardVariantContent(), "the discard property was set on the command");
			});

			return testSwitchDialogOptions.call(this, fnDialogCheck, pReturn);
		});

		QUnit.test("when the current variant has unsaved changes and user switches to another variant - user chooses 'cancel'", function(assert) {
			var fnDone = assert.async();
			var oFireElementModifiedSpy = sandbox.spy(this.oPlugin, "fireElementModified");

			function fnDialogCheck(sMessage, oParameters) {
				oParameters.onClose(MessageBox.Action.CANCEL);
				assert.ok(oFireElementModifiedSpy.notCalled, "the variant does not switch");
				fnDone();
			}

			var pReturn = Promise.resolve();

			return testSwitchDialogOptions.call(this, fnDialogCheck, pReturn);
		});

		QUnit.test("SaveAs with return value from the dialog", function(assert) {
			var oContent = {foo: "bar"};
			var sPreviousDefaultVarId = "previousDefaultVariantId";
			var sName = "myFancyName";
			var sType = "myType";
			sandbox.stub(this.oVariantManagementControl, "getModified").returns(true);
			sandbox.stub(this.oVariantManagementControl, "getDefaultVariantId").returns(sPreviousDefaultVarId);
			sandbox.stub(this.oVariantManagementControl, "openSaveAsDialogForKeyUser").callsFake(function(sStyleClass, fnCallback, oCompCont) {
				assert.strictEqual(sStyleClass, Utils.getRtaStyleClassName(), "the style class is set");
				assert.notEqual(oCompCont, undefined, "the component container is set");
				fnCallback({
					"default": true,
					executeOnSelection: false,
					content: oContent,
					type: sType,
					text: sName,
					contexts: []
				});
			});

			var pReturn = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var oCommand = oParameters.command;
				var mExpectedNewVariantProps = {
					"default": true,
					executeOnSelection: false,
					content: oContent,
					type: sType,
					text: sName,
					contexts: []
				};
				assert.deepEqual(oCommand.getNewVariantProperties(), mExpectedNewVariantProps, "the newVariantProperties property is set");
				assert.strictEqual(oCommand.getPreviousDirtyFlag(), true, "the previousDirtyFlag property is set");
				assert.strictEqual(oCommand.getPreviousVariantId(), this.oVariantId, "the previousVariantId property is set");
				assert.strictEqual(oCommand.getPreviousDefault(), sPreviousDefaultVarId, "the previousDefault property is set");
				assert.strictEqual(oCommand.getElement().getId(), "svm", "the SVM is passed as element key is set");
				assert.strictEqual(oCommand.getActivateAfterUndo(), false, "the activateAfterUndo is not set");
			}.bind(this));

			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_SAVE_AS");
			oMenuItem.handler([this.oVariantManagementOverlay]);
			return pReturn;
		});

		QUnit.test("configure variants", function(assert) {
			var sPreviousDefaultVarId = "previousDefaultVariantId";
			var sNewDefaultVarId = "newDefaultVar";
			sandbox.stub(this.oVariantManagementControl, "getDefaultVariantId").returns(sPreviousDefaultVarId);
			var oNewVariantProperties = {foo: "bar"};
			var oCreateComponentSpy = sandbox.spy(ContextSharingAPI, "createComponent");
			sandbox.stub(this.oVariantManagementControl, "openManageViewsDialogForKeyUser").callsFake(function(mPropertyBag, fnCallback) {
				assert.strictEqual(mPropertyBag.rtaStyleClass, Utils.getRtaStyleClassName(), "the style class is set");
				assert.notEqual(mPropertyBag.contextSharingComponentContainer, undefined, "the component container is set");
				assert.strictEqual(mPropertyBag.layer, Layer.CUSTOMER, "the layer is passed");
				var oArgs = oCreateComponentSpy.getCall(0).args[0];
				assert.ok(oArgs.variantManagementControl, "then the correct control is used");
				fnCallback({ ...oNewVariantProperties, "default": sNewDefaultVarId });
			});

			var pReturn = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var oCommand = oParameters.command;
				assert.deepEqual(oCommand.getNewVariantProperties(), oNewVariantProperties, "the newVariantProperties property is set");
				assert.strictEqual(oCommand.getNewDefaultVariantId(), sNewDefaultVarId, "the newDefaultVariantId property is set");
				assert.strictEqual(oCommand.getOldDefaultVariantId(), sPreviousDefaultVarId, "the oldDefaultVariantId property is set");
			});

			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_MANAGE");
			oMenuItem.handler([this.oVariantManagementOverlay]);
			return pReturn;
		});
	});

	QUnit.module("Given a control implementing the 'variantContent' action", {
		before() {
			this.oVariantManagementControl = new SmartVariantManagement("svm", {
				persistencyKey: "myPersistencyKey"
			});
			this.oControl = new Button("stableId");
			this.oHBox = new HBox("box", {
				items: [this.oControl, this.oVariantManagementControl]
			});
			this.oControl.getVariantManagement = function() {
				return this.oVariantManagementControl;
			}.bind(this);
			return SmartVariantManagementApplyAPI.loadVariants({
				control: this.oVariantManagementControl,
				standardVariant: {}
			});
		},
		async beforeEach(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({getUserId() {return undefined;}});
			var done = assert.async();
			this.oPlugin = new CompVariant({
				commandFactory: new CommandFactory()
			});

			this.oVariant = SmartVariantManagementWriteAPI.addVariant({
				changeSpecificData: {
					id: "id1",
					texts: {
						variantName: "text1"
					},
					layer: Layer.CUSTOMER
				},
				control: this.oVariantManagementControl
			});
			sandbox.stub(this.oVariantManagementControl, "getAllVariants").returns([this.oVariant]);
			sandbox.stub(this.oVariantManagementControl, "getPresentVariantId").returns("id1");

			this.oHBox.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oHBox],
				plugins: [this.oPlugin]
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oOverlay = OverlayRegistry.getOverlay(this.oControl);
				this.oDTHandlerStub = sandbox.stub();
				this.oOverlay.setDesignTimeMetadata({
					actions: {
						compVariant: {
							name: "myFancyName",
							changeType: "variantContent",
							handler: this.oDTHandlerStub
						}
					}
				});
				// make sure _isEditable is checked with the newly set action
				this.oPlugin.deregisterElementOverlay(this.oOverlay);
				this.oPlugin.registerElementOverlay(this.oOverlay);
				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oDesignTime.destroy();
		},
		after() {
			this.oHBox.destroy();
		}
	}, function() {
		QUnit.test("getMenuItems", function(assert) {
			var aMenuItems = this.oPlugin.getMenuItems([this.oOverlay]);
			assert.strictEqual(aMenuItems.length, 1, "one context menu items is visible");
			assert.strictEqual(aMenuItems[0].id, "CTX_COMP_VARIANT_CONTENT", "VariantContent is the only entry");
		});

		QUnit.test("the handler is called", function(assert) {
			this.oDTHandlerStub.resolves([
				{
					changeSpecificData: {
						content: {
							key: "myKey",
							content: {foo: "myContent"},
							persistencyKey: "myPersistencyKey"
						}
					}
				}
			]);
			sandbox.stub(this.oVariantManagementControl, "getModified").returns(false);
			var pReturn = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var oCommand = oParameters.command;
				assert.strictEqual(oCommand.getVariantId(), "myKey", "the key is set");
				assert.deepEqual(oCommand.getNewContent(), {foo: "myContent"}, "the new content is set");
				assert.strictEqual(oCommand.getPersistencyKey(), "myPersistencyKey", "the persistency key is set");
				assert.strictEqual(oCommand.getElement().getId(), "svm", "the SVM is passed as element key is set");
				assert.strictEqual(oCommand.getIsModifiedBefore(), false, "the modified flag is passed");
			});

			var oMenuItem = this.oPlugin.getMenuItems([this.oOverlay])[0];
			oMenuItem.handler([this.oOverlay]);
			return pReturn;
		});

		QUnit.test("the handler is called and the dialog resolves to undefined", function(assert) {
			this.oDTHandlerStub.resolves();
			var oGetCommandSpy = sandbox.spy(this.oPlugin.getCommandFactory(), "getCommandFor");

			var oMenuItem = this.oPlugin.getMenuItems([this.oOverlay])[0];
			return oMenuItem.handler([this.oOverlay]).then(function() {
				assert.strictEqual(oGetCommandSpy.callCount, 0, "no command was created");
			});
		});

		QUnit.test("the handler is called and the dialog resolves to empty array", function(assert) {
			this.oDTHandlerStub.resolves([]);
			var oGetCommandSpy = sandbox.spy(this.oPlugin.getCommandFactory(), "getCommandFor");

			var oMenuItem = this.oPlugin.getMenuItems([this.oOverlay])[0];
			return oMenuItem.handler([this.oOverlay]).then(function() {
				assert.strictEqual(oGetCommandSpy.callCount, 0, "no command was created");
			});
		});

		QUnit.test("when the current variant is read only and the content gets changed and a new variant is created", function(assert) {
			var oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");
			sandbox.stub(this.oVariant, "isEditEnabled").returns(false);
			this.oDTHandlerStub.resolves([
				{
					changeSpecificData: {
						content: {
							key: "id1",
							content: {foo: "myContent"},
							persistencyKey: "myPersistencyKey"
						}
					}
				}
			]);
			sandbox.stub(this.oVariantManagementControl, "openSaveAsDialogForKeyUser").callsFake(function(sStyleClass, fnCallback, oCompCont) {
				assert.strictEqual(sStyleClass, Utils.getRtaStyleClassName(), "the style class is set");
				assert.notEqual(oCompCont, undefined, "the component container is set");
				fnCallback({
					"default": true,
					executeOnSelection: false,
					content: {foo: "bar"},
					type: "sType",
					text: "sName",
					contexts: []
				});
			});
			sandbox.stub(this.oVariantManagementControl, "getModified").returns(true);
			sandbox.stub(this.oVariantManagementControl, "getDefaultVariantId").returns("id1");
			sandbox.stub(MessageBox, "warning").callsFake(function(sMessage, oParameters) {
				assert.strictEqual(sMessage, oLibraryBundle.getText("MSG_CHANGE_READONLY_VARIANT"), "the message is correct");
				assert.strictEqual(oParameters.styleClass, Utils.getRtaStyleClassName(), "the style class is set");
				oParameters.onClose(oParameters.emphasizedAction);
			});

			var pReturn = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var oCommand = oParameters.command;
				var oNewVariantProperties = {
					"default": true,
					executeOnSelection: false,
					content: {foo: "bar"},
					type: "sType",
					text: "sName",
					contexts: []
				};
				assert.deepEqual(oCommand.getNewVariantProperties(), oNewVariantProperties, "the newVariantProperties is set");
				assert.deepEqual(oCommand.getPreviousDirtyFlag(), true, "the previous dirty flag is set");
				assert.strictEqual(oCommand.getPreviousVariantId(), "id1", "the previous variant id is set");
				assert.strictEqual(oCommand.getPreviousDefault(), "id1", "the previous default is set");
				assert.strictEqual(oCommand.getActivateAfterUndo(), true, "the activateAfterUndo is set");
			});

			this.oPlugin.getMenuItems([this.oOverlay])[0].handler([this.oOverlay]);
			return pReturn;
		});

		QUnit.test("when the current variant is read only and the content gets changed and the save as is canceled", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oVariant, "isEditEnabled").returns(false);
			var oCreateComponentSpy = sandbox.spy(ContextSharingAPI, "createComponent");
			this.oDTHandlerStub.resolves([
				{
					changeSpecificData: {
						content: {
							key: "id1",
							content: {foo: "myContent"},
							persistencyKey: "myPersistencyKey"
						}
					}
				}
			]);
			sandbox.stub(this.oVariantManagementControl, "openSaveAsDialogForKeyUser").callsFake(function(sStyleClass, fnCallback) {
				fnCallback();
				var oArgs = oCreateComponentSpy.getCall(0).args[0];
				assert.ok(oArgs.variantManagementControl, "then the correct control is used");
			});
			sandbox.stub(MessageBox, "warning").callsFake(function(sMessage, oParameters) {
				oParameters.onClose(oParameters.emphasizedAction);
			});
			sandbox.stub(this.oVariantManagementControl, "activateVariant").callsFake(function(sVariantId) {
				assert.strictEqual(sVariantId, "id1", "the variant is set back (activated)");
				fnDone();
			});
			this.oPlugin.getMenuItems([this.oOverlay])[0].handler([this.oOverlay]);
		});

		QUnit.test("when the current variant is read only and the warning popup is canceled", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oVariant, "isEditEnabled").returns(false);
			this.oDTHandlerStub.resolves([
				{
					changeSpecificData: {
						content: {
							key: "id1",
							content: {foo: "myContent"},
							persistencyKey: "myPersistencyKey"
						}
					}
				}
			]);
			sandbox.stub(this.oVariantManagementControl, "openSaveAsDialogForKeyUser").callsFake(function(sStyleClass, fnCallback, oCompCont) {
				assert.strictEqual(sStyleClass, Utils.getRtaStyleClassName(), "the style class is set");
				assert.notEqual(oCompCont, undefined, "the component container is set");
				fnCallback({
					"default": true,
					executeOnSelection: false,
					content: {foo: "bar"},
					type: "sType",
					text: "sName",
					contexts: []
				});
			});
			sandbox.stub(this.oVariantManagementControl, "getModified").returns(true);
			sandbox.stub(this.oVariantManagementControl, "getDefaultVariantId").returns("id1");
			sandbox.stub(MessageBox, "warning").callsFake(function(sMessage, oParameters) {
				oParameters.onClose(MessageBox.Action.CANCEL);
			});
			sandbox.stub(this.oVariantManagementControl, "activateVariant").callsFake(function(sVariantId) {
				assert.strictEqual(sVariantId, "id1", "the variant is set back (activated)");
				fnDone();
			});
			this.oPlugin.getMenuItems([this.oOverlay])[0].handler([this.oOverlay]);
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});