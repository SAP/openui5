/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/ui/comp/smartvariants/SmartVariantManagement",
	"sap/ui/core/Core",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/CompVariant",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Button,
	SmartVariantManagement,
	Core,
	DesignTime,
	OverlayRegistry,
	KeyCodes,
	SmartVariantManagementApplyAPI,
	SmartVariantManagementWriteAPI,
	Layer,
	CommandFactory,
	CompVariant,
	Utils,
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
		oPlugin._$oEditableControlDomRef.text(sText);
		oPlugin._$editableField.text(oPlugin._$oEditableControlDomRef.text());
		var oEvent = new Event("keydown");
		oEvent.keyCode = KeyCodes.ENTER;
		oPlugin._$editableField.get(0).dispatchEvent(oEvent);
	}

	QUnit.module("Given a designTime and ControlVariant plugin are instantiated", {
		before: function() {
			this.oVariantManagementControl = new SmartVariantManagement("svm", {
				persistencyKey: "myPersistencyKey"
			});
			return SmartVariantManagementApplyAPI.loadVariants({
				control: this.oVariantManagementControl,
				standardVariant: {}
			});
		},
		beforeEach: function(assert) {
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
			Core.applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVariantManagementControl],
				plugins: [this.oPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVariantManagementOverlay = OverlayRegistry.getOverlay(this.oVariantManagementControl);
				done();
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
			this.oDesignTime.destroy();
		},
		after: function() {
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

		QUnit.test("Rename", function(assert) {
			var sNewText = "myFancyText";
			var pReturn = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var oCommand = oParameters.command;
				var mExpectedNewVariantProps = {};
				mExpectedNewVariantProps[this.oVariantId] = {
					name: sNewText
				};
				assert.deepEqual(oCommand.getNewVariantProperties(), mExpectedNewVariantProps, "the property newVariantProperties was set correctly");
				assert.strictEqual(oCommand.getElement().getId(), "svm", "the SVM is passed as element key is set");
			}.bind(this));

			var oMenuItem = getContextMenuEntryById.call(this, "CTX_COMP_VARIANT_RENAME");
			oMenuItem.handler([this.oVariantManagementOverlay]);
			setTextAndTriggerEnterOnEditableField(this.oPlugin, sNewText);
			return pReturn;
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
				getParameters: function () {
					return {
						item: {
							getProperty: function() {
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

		QUnit.test("SaveAs with return value from the dialog", function(assert) {
			var oContent = {foo: "bar"};
			var sPreviousDefaultVarId = "previousDefaultVariantId";
			var sName = "myFancyName";
			var sType = "myType";
			sandbox.stub(this.oVariantManagementControl, "getModified").returns(true);
			sandbox.stub(this.oVariantManagementControl, "getDefaultVariantId").returns(sPreviousDefaultVarId);
			sandbox.stub(this.oVariantManagementControl, "openSaveAsDialogForKeyUser").callsFake(function(sStyleClass, fCallback, oCompCont) {
				assert.strictEqual(sStyleClass, Utils.getRtaStyleClassName(), "the style class is set");
				assert.notEqual(oCompCont, undefined, "the component container is set");
				fCallback({
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
			sandbox.stub(this.oVariantManagementControl, "openManageViewsDialogForKeyUser").callsFake(function(mPropertyBag, fCallback) {
				assert.strictEqual(mPropertyBag.rtaStyleClass, Utils.getRtaStyleClassName(), "the style class is set");
				assert.notEqual(mPropertyBag.contextSharingComponentContainer, undefined, "the component container is set");
				assert.strictEqual(mPropertyBag.layer, Layer.CUSTOMER, "the layer is passed");
				fCallback(Object.assign({}, oNewVariantProperties, {"default": sNewDefaultVarId}));
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
		before: function() {
			this.oVariantManagementControl = new SmartVariantManagement("svm", {
				persistencyKey: "myPersistencyKey"
			});
			this.oControl = new Button("stableId");
			this.oControl.getVariantManagement = function() {
				return this.oVariantManagementControl;
			}.bind(this);
			return SmartVariantManagementApplyAPI.loadVariants({
				control: this.oVariantManagementControl,
				standardVariant: {}
			});
		},
		beforeEach: function(assert) {
			var done = assert.async();
			this.oPlugin = new CompVariant({
				commandFactory: new CommandFactory()
			});

			this.oControl.placeAt("qunit-fixture");
			Core.applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oControl],
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
		afterEach: function() {
			sandbox.restore();
			this.oDesignTime.destroy();
		},
		after: function() {
			this.oControl.destroy();
			this.oVariantManagementControl.destroy();
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
			var pReturn = waitForCommandToBeCreated(this.oPlugin).then(function(oParameters) {
				var oCommand = oParameters.command;
				assert.strictEqual(oCommand.getVariantId(), "myKey", "the key is set");
				assert.deepEqual(oCommand.getNewContent(), {foo: "myContent"}, "the new content is set");
				assert.strictEqual(oCommand.getPersistencyKey(), "myPersistencyKey", "the persistency key is set");
				assert.strictEqual(oCommand.getElement().getId(), "svm", "the SVM is passed as element key is set");
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
	});

	QUnit.done(function() {
		oComp.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});