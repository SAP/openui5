/* global QUnit */

sap.ui.define([
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/ControlVariantSwitch",
	"sap/ui/rta/command/ControlVariantSave",
	"sap/ui/rta/command/ControlVariantSaveAs",
	"sap/ui/rta/command/ControlVariantSetTitle",
	"sap/ui/rta/command/ControlVariantConfigure",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/rta/plugin/ControlVariant",
	"sap/ui/dt/plugin/ToolHooks",
	"sap/ui/rta/plugin/RenameHandler",
	"sap/ui/core/Manifest",
	"sap/m/Button",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/m/Page",
	"sap/m/FlexBox",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	KeyCodes,
	flUtils,
	Layer,
	VerticalLayout,
	DesignTime,
	CommandFactory,
	ControlVariantSwitch,
	ControlVariantSave,
	ControlVariantSaveAs,
	ControlVariantSetTitle,
	ControlVariantConfigure,
	OverlayRegistry,
	ElementOverlay,
	ChangeRegistry,
	ControlVariantPlugin,
	ToolHooksPlugin,
	RenameHandler,
	Manifest,
	Button,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	Page,
	FlexBox,
	VariantManagement,
	VariantModel,
	RtaUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var oManifestObj = {
		"sap.app": {
			id: "MyComponent",
			applicationVersion: {
				version: "1.2.3"
			}
		}
	};

	var oManifest = new Manifest(oManifestObj);

	function getMockComponent() {
		return {
			getLocalId: function () {
				return "varMgtKey";
			},
			getModel: function () { return this.oModel; }.bind(this),
			getManifest: function() { return oManifest; }
		};
	}

	var fnCheckErrorRequirements = function(assert, fnMessageBoxShowStub, oPlugin, bShowError) {
		assert.strictEqual(oPlugin._createSetTitleCommand.callCount, 0, "then _createSetTitleCommand() was not called");
		assert.equal(oPlugin.stopEdit.callCount, 1, "then stopEdit() was called once");

		if (bShowError) {
			assert.notOk(oPlugin._bBlurOrKeyDownStarted, "then flag for blur / keydown is unset");
			assert.ok(oPlugin.stopEdit.calledBefore(oPlugin.startEdit), "then startEdit() was called after stopEdit() was called");
			assert.equal(fnMessageBoxShowStub.callCount, 1, "then RtaUtils.showMessageBox was called once");
		}
	};

	QUnit.module("Given a designTime and ControlVariant plugin are instantiated", {
		beforeEach: function (assert) {
			var done = assert.async();

			var oMockAppComponent = getMockComponent.call(this);
			sandbox.stub(flUtils, "getAppComponentForControl").returns(oMockAppComponent);
			sandbox.stub(flUtils, "getComponentForControl").returns(oMockAppComponent);
			sandbox.stub(flUtils, "getComponentClassName").returns("Dummy.Component");
			this.oData = {
				varMgtKey: {
					defaultVariant: "variant1",
					variantsEditable: true,
					variants: [
						{
							key: "variant1",
							title: "Variant 1",
							visible: true
						},
						{
							key: "variant2",
							title: "Variant 2",
							visible: true
						}
					]
				}
			};

			//	page
			//		verticalLayout
			//		objectPageLayout
			//			variantManagement (headerContent)
			//			objectPageSection (sections)
			//				objectPageSubSection
			//					verticalLayout
			//						button

			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.ui.layout.VerticalLayout": {
					moveControls: "default"
				}
			})

			.then(function() {
				this.oButton = new Button();
				this.oLayout = new VerticalLayout("overlay1", {
					content: [this.oButton]
				});
				this.oObjectPageSubSection = new ObjectPageSubSection("objSubSection", {
					blocks: [this.oLayout]
				});
				this.oObjectPageSection = new ObjectPageSection("objSection", {
					subSections: [this.oObjectPageSubSection]
				});
				this.sLocalVariantManagementId = "varMgtKey";
				this.oModel = new VariantModel(this.oData, undefined, oMockAppComponent);
				this.oVariantManagementControl = new VariantManagement(this.sLocalVariantManagementId);
				this.oVariantManagementControl.setModel(this.oModel, flUtils.VARIANT_MODEL_NAME);
				this.oObjectPageLayout = new ObjectPageLayout("objPage", {
					headerContent: [this.oVariantManagementControl],
					sections: [this.oObjectPageSection]
				});
				this.oVariantManagementControl.addAssociation("for", "objPage", true);
				this.oButton2 = new Button();
				this.oLayoutOuter = new VerticalLayout("verlayouter", {
					content: [this.oButton2]
				});
				this.oPage = new Page("mainPage", {
					content: [this.oLayoutOuter, this.oObjectPageLayout]
				}).placeAt("qunit-fixture");
				var oVariantManagementDesignTimeMetadata = {
					"sap.ui.fl.variants.VariantManagement": {}
				};

				this.oDesignTime = new DesignTime({
					designTimeMetadata: oVariantManagementDesignTimeMetadata,
					rootElements: [this.oPage]
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oObjectPageLayoutOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout);
					this.oObjectPageSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection);
					this.oObjectPageSubSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSubSection);
					this.oLayoutOuterOverlay = OverlayRegistry.getOverlay(this.oLayoutOuter);
					this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
					this.oVariantManagementOverlay = OverlayRegistry.getOverlay(this.oVariantManagementControl);
					this.oControlVariantPlugin = new ControlVariantPlugin({
						commandFactory: new CommandFactory()
					});
					this.oToolHooksPlugin = new ToolHooksPlugin();
					done();
				}.bind(this));

				sap.ui.getCore().applyChanges();
			}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
			this.oLayoutOuter.destroy();
			this.oPage.destroy();
			this.oDesignTime.destroy();
			this.oData = null;
			this.oModel.destroy();
		}
	}, function () {
		QUnit.test("when _isPersonalizationMode is called", function(assert) {
			assert.notOk(this.oControlVariantPlugin._isPersonalizationMode(), "then _isPersonalizationMode for CUSTOMER layer is false");
			sandbox.stub(this.oControlVariantPlugin.getCommandFactory(), "getFlexSettings").returns({layer: Layer.USER});
			assert.ok(this.oControlVariantPlugin._isPersonalizationMode(), "then _isPersonalizationMode for USER layer is true");
		});

		QUnit.test("when registerElementOverlay is called", function(assert) {
			assert.ok(ElementOverlay.prototype.getVariantManagement, "then getVariantManagement added to the ElementOverlay prototype");
			assert.ok(ElementOverlay.prototype.setVariantManagement, "then setVariantManagement added to the ElementOverlay prototype");
		});

		QUnit.test("when _isEditable is called with VariantManagement overlay", function(assert) {
			sandbox.spy(this.oControlVariantPlugin, "hasStableId");
			var bEditable = this.oControlVariantPlugin._isEditable(this.oVariantManagementOverlay);
			assert.ok(bEditable, "then VariantManagement overlay is editable");
			assert.ok(this.oControlVariantPlugin.hasStableId.calledWith(this.oVariantManagementOverlay), "then the VariantManagement overlay was checked for a stable ID");
		});

		QUnit.test("when registerElementOverlay is called with VariantManagement control Overlay", function(assert) {
			this.oToolHooksPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			assert.strictEqual(this.oObjectPageLayoutOverlay.getVariantManagement(), this.sLocalVariantManagementId, "then VariantManagement reference successfully set to ObjectPageLayout Overlay from the id of VariantManagement control");
			assert.strictEqual(this.oVariantManagementOverlay.getVariantManagement(), this.sLocalVariantManagementId, "then VariantManagement reference successfully set to VariantManagement control itself");
			assert.notOk(this.oLayoutOuterOverlay.getVariantManagement(), "then no VariantManagement reference set to an element outside element not a part of the associated control");
			assert.deepEqual(this.oVariantManagementOverlay.getEditableByPlugins(), [this.oControlVariantPlugin.getMetadata().getName()],
				"then VariantManagement is marked as editable by ControlVariant plugin");
			assert.notOk(this.oModel.getData()[this.sLocalVariantManagementId].variantsEditable, "the parameter 'variantsEditable' is set to false");
		});

		QUnit.test("when registerElementOverlay and afterwards deregisterElementOverlay are called with VariantManagement control Overlay", function(assert) {
			assert.ok(this.oModel.getData()[this.sLocalVariantManagementId].variantsEditable, "the parameter 'variantsEditable' is true by default");
			this.oToolHooksPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			assert.notOk(this.oModel.getData()[this.sLocalVariantManagementId].variantsEditable, "'variantsEditable' is set to false after registering");
			this.oToolHooksPlugin.deregisterElementOverlay(this.oVariantManagementOverlay);
			this.oControlVariantPlugin.deregisterElementOverlay(this.oVariantManagementOverlay);
			assert.ok(this.oModel.getData()[this.sLocalVariantManagementId].variantsEditable, "'variantsEditable' is set to true after deregistering");
		});

		QUnit.test("when isVariantSwitchAvailable is called with VariantManagement overlay", function(assert) {
			var bVMAvailable = this.oControlVariantPlugin.isVariantSwitchAvailable(this.oVariantManagementOverlay);
			var bButtonAvailable = this.oControlVariantPlugin.isVariantSwitchAvailable(this.oButtonOverlay);
			assert.ok(bVMAvailable, "then variant switch is available for VariantManagement control");
			assert.notOk(bButtonAvailable, "then variant switch not available for a non VariantManagement control overlay");
		});

		QUnit.test("when isVariantSwitchEnabled is called with VariantManagement overlay", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			var bVMEnabled = this.oControlVariantPlugin.isVariantSwitchEnabled([this.oVariantManagementOverlay]);
			var bButtonEnabled = this.oControlVariantPlugin.isVariantSwitchEnabled([this.oButtonOverlay]);
			assert.ok(bVMEnabled, "then variant switch is enabled for VariantManagement control");
			assert.notOk(bButtonEnabled, "then variant switch is not enabled for a non VariantManagement control");
		});

		QUnit.test("when isVariantSaveAvailable is called with different overlays", function(assert) {
			assert.notOk(this.oControlVariantPlugin.isVariantSaveAvailable(this.oObjectPageLayoutOverlay), "then save not available for a non VariantManagement control overlay with variantReference");
			assert.ok(this.oControlVariantPlugin.isVariantSaveAvailable(this.oVariantManagementOverlay), "then save available for a VariantManagement control overlay with variantReference");
			assert.notOk(this.oControlVariantPlugin.isVariantSaveAvailable(this.oLayoutOuterOverlay), "then save not available for a non VariantManagement control overlay without variantReference");
		});

		[
			["variant management is modified", true, "enabled"],
			["variant management is not modified", false, "disabled"]
		].forEach(function (obj) {
			QUnit.test("when isVariantSaveEnabled is called with VariantManagement overlay and " + obj[0], function(assert) {
				this.oModel.oData[this.sLocalVariantManagementId].modified = obj[1];
				this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
				var bVMEnabled = this.oControlVariantPlugin.isVariantSaveEnabled([this.oVariantManagementOverlay]);
				assert.strictEqual(bVMEnabled, obj[1], "then variant save is " + obj[2] + " for VariantManagement control");
			});
		});

		QUnit.test("when isVariantSaveAsAvailable is called with different overlays", function(assert) {
			assert.notOk(this.oControlVariantPlugin.isVariantSaveAsAvailable(this.oObjectPageLayoutOverlay), "then saveAs not available for a non VariantManagement control overlay with variantReference");
			assert.ok(this.oControlVariantPlugin.isVariantSaveAsAvailable(this.oVariantManagementOverlay), "then saveAs available for a VariantManagement control overlay with variantReference");
			assert.notOk(this.oControlVariantPlugin.isVariantSaveAsAvailable(this.oLayoutOuterOverlay), "then saveAs not available for a non VariantManagement control overlay without variantReference");
		});

		QUnit.test("when isVariantSaveAsEnabled is called with VariantManagement overlay", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			var bVMEnabled = this.oControlVariantPlugin.isVariantSaveAsEnabled([this.oVariantManagementOverlay]);
			var bButtonEnabled = this.oControlVariantPlugin.isVariantSaveAsEnabled([this.oButtonOverlay]);
			assert.ok(bVMEnabled, "then variant saveAs is enabled for VariantManagement control");
			assert.notOk(bButtonEnabled, "then variant saveAs is not enabled for a non VariantManagement control");
		});

		QUnit.test("when isVariantRenameAvailable is called with VariantManagement overlay", function(assert) {
			var bVMAvailable = this.oControlVariantPlugin.isRenameAvailable(this.oVariantManagementOverlay);
			var bButtonAvailable = this.oControlVariantPlugin.isRenameAvailable(this.oButtonOverlay);
			assert.ok(bVMAvailable, "then variant rename is available for VariantManagement control");
			assert.notOk(bButtonAvailable, "then variant rename is not available for non VariantManagement control");
		});

		QUnit.test("when isVariantRenameEnabled is called with VariantManagement overlay", function(assert) {
			var bVMEnabled = this.oControlVariantPlugin.isRenameEnabled([this.oVariantManagementOverlay]);
			var bButtonEnabled = this.oControlVariantPlugin.isRenameEnabled([this.oButtonOverlay]);
			assert.ok(bVMEnabled, "then variant rename is enabled for VariantManagement control");
			assert.notOk(bButtonEnabled, "then variant rename is not enabled for a non VariantManagement control");
		});

		QUnit.test("when isVariantConfigureAvailable is called with VariantManagement overlay", function(assert) {
			var bVMAvailable = this.oControlVariantPlugin.isVariantConfigureAvailable(this.oVariantManagementOverlay);
			var bButtonAvailable = this.oControlVariantPlugin.isVariantConfigureAvailable(this.oButtonOverlay);
			assert.ok(bVMAvailable, "then variant configure is available for VariantManagement control");
			assert.notOk(bButtonAvailable, "then variant configure is not available for non VariantManagement control");
		});

		QUnit.test("when isVariantConfigureEnabled is called with VariantManagement overlay", function(assert) {
			var bVMEnabled = this.oControlVariantPlugin.isVariantConfigureEnabled([this.oVariantManagementOverlay]);
			var bButtonEnabled = this.oControlVariantPlugin.isVariantConfigureEnabled([this.oButtonOverlay]);
			assert.ok(bVMEnabled, "then variant configure is enabled for VariantManagement control");
			assert.notOk(bButtonEnabled, "then variant configure is not enabled for a non VariantManagement control");
		});

		QUnit.test("when switchVariant is called", function(assert) {
			var done = assert.async();
			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof ControlVariantSwitch, "then an switchVariant event is received with a switch command");
				done();
			});
			this.oControlVariantPlugin.switchVariant(this.oVariantManagementOverlay, "variant2", "variant1");
		});

		QUnit.test("when renameVariant is called via startEdit", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			this.oVariantManagementOverlay.setSelectable(true);

			var done = assert.async();
			var done2 = assert.async();

			sap.ui.getCore().getEventBus().subscribeOnce("sap.ui.rta", "plugin.ControlVariant.startEdit", function () {
				assert.strictEqual(this.oVariantManagementOverlay.getSelected(), true, "then the overlay is still selected");
				this.oControlVariantPlugin._$oEditableControlDomRef.text("Test");
				this.oControlVariantPlugin._$editableField.text(this.oControlVariantPlugin._$oEditableControlDomRef.text());
				var $Event = jQuery.Event("keydown"); // eslint-disable-line new-cap
				$Event.keyCode = KeyCodes.ENTER;
				this.oControlVariantPlugin._$editableField.trigger($Event);
				sap.ui.getCore().applyChanges();
				done2();
			}, this);

			this.oControlVariantPlugin.startEdit(this.oVariantManagementOverlay);

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof ControlVariantSetTitle, "then an set title Variant event is received with a setTitle command");
				done();
			});
		});

		QUnit.test("when configureVariants is called", function(assert) {
			var done = assert.async();
			var aChanges = ["change1", "change2"];
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			sandbox.stub(this.oModel, "manageVariants").resolves(aChanges);

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof ControlVariantConfigure, "then a configure Variant event is received with a configure command");
				assert.equal(oCommand.getChanges(), aChanges, "and the command contains the given changes");
				done();
			});
			this.oControlVariantPlugin.configureVariants([this.oVariantManagementOverlay]);
		});

		QUnit.test("when createSaveCommand is called and the key user presses the save button", function(assert) {
			var done = assert.async();
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof ControlVariantSave, "then a save Variant event is received with a save command");
				done();
			});
			this.oControlVariantPlugin.createSaveCommand([this.oVariantManagementOverlay]);
		});

		QUnit.test("when createSaveAsCommand is called and the key user presses the save button", function(assert) {
			var done = assert.async();
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			var fnCreateSaveAsDialog = this.oVariantManagementControl._createSaveAsDialog;
			sandbox.stub(this.oVariantManagementControl, "_createSaveAsDialog").callsFake(function() {
				fnCreateSaveAsDialog.call(this.oVariantManagementControl);
				this.oVariantManagementControl.oSaveAsDialog.attachEventOnce("afterOpen", function() {
					this.oVariantManagementControl._handleVariantSaveAs("myNewVariant");
				}.bind(this));
			}.bind(this));
			var oOpenSaveAsDialogSpy = sandbox.spy(this.oVariantManagementControl, "_openSaveAsDialog");

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				var oCommand = oEvent.getParameter("command");
				assert.equal(oOpenSaveAsDialogSpy.callCount, 1, "then openSaveAsDialog has been called once");
				assert.ok(oCommand instanceof ControlVariantSaveAs, "then a saveAs Variant event is received with a saveAs command");
				done();
			});
			this.oControlVariantPlugin.createSaveAsCommand([this.oVariantManagementOverlay]);
		});

		QUnit.test("when createSaveAsCommand is called and the key user presses the cancel button", function(assert) {
			var done = assert.async();
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			var fnCreateSaveAsDialog = this.oVariantManagementControl._createSaveAsDialog;
			sandbox.stub(this.oVariantManagementControl, "_createSaveAsDialog").callsFake(function() {
				fnCreateSaveAsDialog.call(this.oVariantManagementControl);
				this.oVariantManagementControl.oSaveAsDialog.attachEventOnce("afterOpen", function() {
					this.oVariantManagementControl._cancelPressed();
				}.bind(this));
			}.bind(this));
			var oOpenSaveAsDialogSpy = sandbox.spy(this.oVariantManagementControl, "_openSaveAsDialog");

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				var oCommand = oEvent.getParameter("command");
				assert.equal(oOpenSaveAsDialogSpy.callCount, 1, "then openSaveAsDialog has been called once");
				assert.notOk(oCommand, "then a saveAs Variant event is received, but no command is created");
				done();
			});
			this.oControlVariantPlugin.createSaveAsCommand([this.oVariantManagementOverlay]);
		});

		QUnit.test("when manage dialog is already open, followed by registration of variant management overlay", function(assert) {
			var done = assert.async();
			this.oVariantManagementControl.openManagementDialog();
			this.oVariantManagementControl.getManageDialog().attachEventOnce("afterOpen", function() {
				this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
				assert.ok(this.oVariantManagementControl.getManageDialog().bIsDestroyed, "then on overlay registration, manage dialog is destroyed");
				done();
			}.bind(this));
		});

		QUnit.test("when configure variants context menu item opens the manage dialog, followed by de-registration of variant management overlay", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			this.oControlVariantPlugin.configureVariants([this.oVariantManagementOverlay]);
			assert.ok(this.oVariantManagementControl.getManageDialog().isA("sap.m.Dialog"), "then initially a dialog is created");
			this.oControlVariantPlugin.deregisterElementOverlay(this.oVariantManagementOverlay);
			assert.ok(this.oVariantManagementControl.getManageDialog().bIsDestroyed, "then on overlay de-registration, manage dialog is destroyed");
		});

		QUnit.test("when _propagateVariantManagement is called with a root overlay and VariantManagement reference", function(assert) {
			var aOverlays = this.oControlVariantPlugin._propagateVariantManagement(this.oObjectPageLayoutOverlay, "varMgtKey");
			assert.equal(this.oButtonOverlay.getVariantManagement(), "varMgtKey", "then VariantManagement reference successfully propagated from the root overlay to last child overlay)");
			assert.equal(aOverlays.length, 6, "then VariantManagement reference successfully set for all 6 child ElementOverlays");
		});

		QUnit.test("when _getVariantManagementFromParent is called with an overlay with no VariantManagement reference", function(assert) {
			assert.notOk(this.oButtonOverlay.getVariantManagement(), "no VariantManagement reference set initially for the last overlay");
			this.oObjectPageLayoutOverlay.setVariantManagement("varMgtKey");
			var sVarMgmt = this.oControlVariantPlugin._getVariantManagementFromParent(this.oButtonOverlay);
			assert.equal(sVarMgmt, "varMgtKey", "then correct VariantManagement reference returned");
		});

		//Integration Test
		QUnit.test("when ControlVariant Plugin is added to designTime and a new overlay is rendered dynamically", function(assert) {
			var done = assert.async();
			assert.notOk(this.oButtonOverlay.getVariantManagement(), "then VariantManagement Key is initially undefined");
			this.oDesignTime.addPlugin(this.oControlVariantPlugin);
			sap.ui.getCore().applyChanges();
			assert.ok(this.oButtonOverlay.getVariantManagement(), this.sLocalVariantManagementId, "then VariantManagement reference successfully propagated from ObjectPageLayout to Button (last element)");
			var oTestButton = new Button("testButton");
			this.oLayout.addContent(oTestButton);
			sap.ui.getCore().applyChanges();
			this.oDesignTime.attachEventOnce("synced", function() {
				var oTestButtonOverlay = OverlayRegistry.getOverlay(oTestButton);
				assert.equal(oTestButtonOverlay.getVariantManagement(), this.sLocalVariantManagementId, "then VariantManagement reference successfully set for newly inserted ElementOverlay from parent ElementOverlays");
				done();
			}.bind(this));
		});

		QUnit.test("when retrieving the context menu items", function(assert) {
			var renameDone = assert.async();
			var createSaveAsCommandDone = assert.async();
			var configureDone = assert.async();
			var switchDone = assert.async();
			this.oModel.oData[this.sLocalVariantManagementId].modified = true;

			sandbox.stub(this.oControlVariantPlugin, "renameVariant").callsFake(function (aElementOverlays) {
				// Rename
				assert.deepEqual(aElementOverlays[0], this.oVariantManagementOverlay, "the 'handler' function calls renameVariant for rename menu item with the correct overlay");
				renameDone();
			}.bind(this));

			// SaveAs
			sandbox.stub(this.oControlVariantPlugin, "createSaveAsCommand").callsFake(function() {
				assert.ok(true, "the 'handler' function calls the createSaveAsCommand method");
				createSaveAsCommandDone();
			});

			// Configure
			sandbox.stub(this.oControlVariantPlugin, "configureVariants").callsFake(function() {
				assert.ok(true, "the 'handler' function calls the configureVariants method");
				configureDone();
			});

			// Switch SubMenu
			var mPropertyBag = {
				eventItem: {
					data: function () {
						return {
							id: "CTX_VARIANT_SWITCH_SUBMENU",
							key: "variant2"
						};
					}
				}
			};
			this.oVariantManagementOverlay.getVariantManagement = function() {
				return "varMgtKey";
			};
			var aExpectedSubmenu = [
				{id: "variant1", text: "Variant 1", icon: "sap-icon://accept", enabled: false},
				{id: "variant2", text: "Variant 2", icon: "blank", enabled: true}
			];

			sandbox.stub(this.oControlVariantPlugin, "switchVariant").callsFake(function (oTargetOverlay, sNewVariantReference, sCurrentVariantReference) {
				assert.equal(oTargetOverlay, this.oVariantManagementOverlay, "the 'handler' function calls the switchVariant method with the correct oTargetOverlay");
				assert.equal(sNewVariantReference, "variant2", "the 'handler' function calls the switchVariant method with the correct sNewVariantKey");
				assert.equal(sCurrentVariantReference, "variant1", "the 'handler' function calls the switchVariant method with the correct sCurrentVariantKey");
				switchDone();
			}.bind(this));

			var aMenuItems = this.oControlVariantPlugin.getMenuItems([this.oVariantManagementOverlay]);

			assert.equal(aMenuItems[0].id, "CTX_VARIANT_SET_TITLE", "there is an entry for rename variant");
			assert.equal(aMenuItems[0].rank, 210, "and the entry has the correct rank");
			aMenuItems[0].handler([this.oVariantManagementOverlay]);
			assert.ok(aMenuItems[0].enabled([this.oVariantManagementOverlay]), "and the entry is enabled");

			assert.equal(aMenuItems[1].id, "CTX_VARIANT_SAVE", "there is an entry for save variant");
			assert.equal(aMenuItems[1].rank, 220, "and the entry has the correct rank");
			aMenuItems[1].handler([this.oVariantManagementOverlay]);
			assert.ok(aMenuItems[1].enabled([this.oVariantManagementOverlay]), "and the entry is enabled");

			assert.equal(aMenuItems[2].id, "CTX_VARIANT_SAVEAS", "there is an entry for saveAs variant");
			assert.equal(aMenuItems[2].rank, 225, "and the entry has the correct rank");
			aMenuItems[2].handler([this.oVariantManagementOverlay]);
			assert.ok(aMenuItems[2].enabled([this.oVariantManagementOverlay]), "and the entry is enabled");

			assert.equal(aMenuItems[3].id, "CTX_VARIANT_MANAGE", "there is an entry for configure variant");
			assert.equal(aMenuItems[3].rank, 230, "and the entry has the correct rank");
			aMenuItems[3].handler([this.oVariantManagementOverlay]);
			assert.ok(aMenuItems[3].enabled([this.oVariantManagementOverlay]), "and the entry is enabled");
			assert.equal(aMenuItems[3].startSection, true, "the configure variant starts a new section on the menu");

			assert.equal(aMenuItems[4].id, "CTX_VARIANT_SWITCH_SUBMENU", "there is an entry for switch variant");
			assert.equal(aMenuItems[4].rank, 240, "and the entry has the correct rank");
			assert.ok(aMenuItems[4].enabled([this.oVariantManagementOverlay]), "and the entry is enabled");
			assert.propEqual(aMenuItems[4].submenu, aExpectedSubmenu, "and the submenu array is correct");
			aMenuItems[4].handler([this.oVariantManagementOverlay], mPropertyBag);
		});
	});

	QUnit.module("Given a designTime where variant management control is not part of responsible control tree and ControlVariant plugin are instantiated", {
		beforeEach: function (assert) {
			var done = assert.async();

			var oMockAppComponent = getMockComponent.call(this);
			sandbox.stub(flUtils, "getAppComponentForControl").returns(oMockAppComponent);
			sandbox.stub(flUtils, "getComponentForControl").returns(oMockAppComponent);
			sandbox.stub(flUtils, "getComponentClassName").returns("Dummy.Component");
			this.oData = {
				varMgtKey: {
					defaultVariant: "variant1",
					variantsEditable: true,
					variants: [
						{
							key: "variant1",
							title: "Variant 1",
							visible: true
						},
						{
							key: "variant2",
							title: "Variant 2",
							visible: true
						}
					]
				}
			};

			//	page
			//		verticalLayout
			//			flexBox1
			//				variantManagement
			//				button1
			//			flexBox2
			//				button2

			this.sLocalVariantManagementId = "varMgtKey";
			this.oModel = new VariantModel(this.oData, undefined, oMockAppComponent);
			this.oVariantManagementControl = new VariantManagement(this.sLocalVariantManagementId);
			this.oVariantManagementControl.setModel(this.oModel, flUtils.VARIANT_MODEL_NAME);
			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oFlexBox1 = new FlexBox("flexbox1", {
				items: [this.oVariantManagementControl, this.oButton1]
			});
			this.oFlexBox2 = new FlexBox("flexbox2", {
				items: [this.oButton2]
			});
			this.oVariantManagementControl.addAssociation("for", "flexbox2", true);
			this.oLayoutOuter = new VerticalLayout("layoutouter", {
				content: [this.oFlexBox1, this.oFlexBox2]
			});
			this.oPage = new Page("mainPage", {
				content: [this.oLayoutOuter]
			}).placeAt("qunit-fixture");
			var oVariantManagementDesignTimeMetadata = {
				"sap.ui.fl.variants.VariantManagement": {}
			};

			this.oDesignTime = new DesignTime({
				designTimeMetadata: oVariantManagementDesignTimeMetadata,
				rootElements: [this.oPage]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOuterOverlay = OverlayRegistry.getOverlay(this.oLayoutOuter);
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oFlexBox1Overlay = OverlayRegistry.getOverlay(this.oFlexBox1);
				this.oFlexBox2Overlay = OverlayRegistry.getOverlay(this.oFlexBox2);
				this.oVariantManagementOverlay = OverlayRegistry.getOverlay(this.oVariantManagementControl);
				this.oControlVariantPlugin = new ControlVariantPlugin({
					commandFactory: new CommandFactory()
				});
				this.oToolHooksPlugin = new ToolHooksPlugin();
				done();
			}.bind(this));

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			sandbox.restore();
			this.oLayoutOuter.destroy();
			this.oPage.destroy();
			this.oDesignTime.destroy();
			this.oData = null;
			this.oModel.destroy();
		}
	}, function () {
		QUnit.test("when registerElementOverlay is called with VariantManagement control Overlay", function(assert) {
			this.oToolHooksPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			assert.strictEqual(this.oFlexBox2Overlay.getVariantManagement(), this.sLocalVariantManagementId, "then VariantManagement reference successfully set to ObjectPageLayout Overlay from the id of VariantManagement control");
			assert.strictEqual(this.oButton2Overlay.getVariantManagement(), this.sLocalVariantManagementId, "then VariantManagement reference successfully set to ObjectPageLayout Overlay from the id of VariantManagement control");
			assert.strictEqual(this.oVariantManagementOverlay.getVariantManagement(), this.sLocalVariantManagementId, "then VariantManagement reference successfully set to VariantManagement control itself");
			assert.notOk(this.oLayoutOuterOverlay.getVariantManagement(), "then no VariantManagement reference set to an element outside element not a part of the associated control");
			assert.notOk(this.oFlexBox1Overlay.getVariantManagement(), "then no VariantManagement reference set to an element outside element not a part of the associated control");
			assert.notOk(this.oButton1Overlay.getVariantManagement(), this.sLocalVariantManagementId, "then VariantManagement reference successfully set to ObjectPageLayout Overlay from the id of VariantManagement control");
			assert.deepEqual(this.oVariantManagementOverlay.getEditableByPlugins(), [this.oControlVariantPlugin.getMetadata().getName()],
				"then VariantManagement is marked as editable by ControlVariant plugin");
			assert.notOk(this.oModel.getData()[this.sLocalVariantManagementId].variantsEditable, "the parameter 'variantsEditable' is set to false");
		});
	});

	QUnit.module("Given variant management control is renamed", {
		beforeEach: function (assert) {
			var done = assert.async();

			var oMockAppComponent = getMockComponent.call(this);
			sandbox.stub(flUtils, "getAppComponentForControl").returns(oMockAppComponent);
			sandbox.stub(flUtils, "getComponentClassName").returns("Dummy.Component");

			this.oModel = new VariantModel({variantManagementReference: {variants: []}}, undefined, oMockAppComponent);
			this.oVariantManagementControl = new VariantManagement("varMgtKey").placeAt("qunit-fixture");
			this.oVariantManagementControl.setModel(this.oModel, flUtils.VARIANT_MODEL_NAME);

			var oVariantManagementDesignTimeMetadata = {
				"sap.ui.fl.variants.VariantManagement": {
					actions: {}
				}
			};
			sap.ui.getCore().applyChanges();
			this.oDesignTime = new DesignTime({
				designTimeMetadata: oVariantManagementDesignTimeMetadata,
				rootElements: [this.oVariantManagementControl]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVariantManagementOverlay = OverlayRegistry.getOverlay(this.oVariantManagementControl);
				this.oControlVariantPlugin = new ControlVariantPlugin({
					commandFactory: new CommandFactory()
				});
				this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
				this.oVariantManagementOverlay.setSelectable(true);
				this.oControlVariantPlugin._oEditedOverlay = this.oVariantManagementOverlay;
				this.oControlVariantPlugin._$oEditableControlDomRef = jQuery(this.oVariantManagementControl.getTitle().getDomRef("inner"));
				done();
			}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
			this.oVariantManagementControl.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when variant is renamed with a new title", function(assert) {
			assert.expect(2);
			var sOldVariantTitle = "Old Variant Title";
			this.oControlVariantPlugin._$editableField = {
				text: function() {
					return "New Variant Title  ";
				}
			};
			this.oControlVariantPlugin.setOldValue(sOldVariantTitle);
			this.oControlVariantPlugin._$oEditableControlDomRef.text(sOldVariantTitle);

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent.getParameter("command") instanceof ControlVariantSetTitle, "then an set title Variant event is received with a setTitle command");
				assert.equal(oEvent.getParameter("command").getNewText(), "New Variant Title", "then the new title is trimmed for ending spaces");
			});

			return RenameHandler._handlePostRename.call(this.oControlVariantPlugin);
		});

		QUnit.test("when _handlePostRename is called two times back to back", function(assert) {
			sap.ui.getCore().applyChanges();

			sandbox.stub(this.oControlVariantPlugin, "_emitLabelChangeEvent").resolves();
			sandbox.stub(RenameHandler, "_validateNewText");
			sandbox.stub(this.oControlVariantPlugin, "stopEdit");

			return RenameHandler._handlePostRename.call(this.oControlVariantPlugin)
				.then(function() {
					assert.strictEqual(this.oControlVariantPlugin._emitLabelChangeEvent.callCount, 1, "then RenameHandler._emitLabelChangeEvent called once");
					assert.strictEqual(this.oControlVariantPlugin.stopEdit.callCount, 1, "then RenameHandler._stopEdit called once");
					assert.ok(this.oControlVariantPlugin._bBlurOrKeyDownStarted, "then flag for blur / keydown event is set");
					return RenameHandler._handlePostRename.call(this.oControlVariantPlugin).then(function() {
						assert.strictEqual(this.oControlVariantPlugin._emitLabelChangeEvent.callCount, 1, "then RenameHandler._emitLabelChangeEvent not called another time");
						assert.strictEqual(this.oControlVariantPlugin.stopEdit.callCount, 1, "then RenameHandler._stopEdit not called another time");
						assert.ok(this.oControlVariantPlugin._bBlurOrKeyDownStarted, "then flag for blur / keydown is still set");
					}.bind(this));
				}.bind(this));
		});

		QUnit.test("when variant is RENAMED with an EXISTING VARIANT TITLE, after which _handlePostRename is called", function (assert) {
			var sNewVariantTitle = "Existing Variant Title";
			var fnMessageBoxShowStub = sandbox.stub(RtaUtils, "showMessageBox").resolves();

			sandbox.spy(this.oControlVariantPlugin, "_createSetTitleCommand");
			sandbox.spy(this.oControlVariantPlugin, "startEdit");
			sandbox.spy(this.oControlVariantPlugin, "stopEdit");
			sandbox.spy(RenameHandler, "startEdit");

			this.oModel.setData({
				varMgtKey: {
					variants: [
						{
							title: sNewVariantTitle,
							visible: true
						}
					]
				}
			});

			var sOldVariantTitle = "Old Variant Title";
			sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns(sNewVariantTitle);
			this.oControlVariantPlugin.setOldValue(sOldVariantTitle);
			this.oControlVariantPlugin._$oEditableControlDomRef.text(sOldVariantTitle);
			sap.ui.getCore().applyChanges();

			return RenameHandler._handlePostRename.call(this.oControlVariantPlugin)
				.then(fnCheckErrorRequirements.bind(this, assert, fnMessageBoxShowStub, this.oControlVariantPlugin, true, true));
		});

		QUnit.test("when variant is RENAMED with the TITLE OF ANOTHER INVISIBLE VARIANT, after which _handlePostRename is called", function(assert) {
			assert.expect(1);
			var sNewVariantTitle = "Existing Variant Title";

			this.oModel.setData({
				varMgtKey: {
					variants: [
						{
							title: "Standard",
							visible: true
						},
						{
							title: sNewVariantTitle,
							visible: false
						}
					]
				}
			});

			var sOldVariantTitle = "Old Variant Title";

			sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns(sNewVariantTitle);
			this.oControlVariantPlugin.setOldValue(sOldVariantTitle);
			sap.ui.getCore().applyChanges();

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent.getParameter("command") instanceof ControlVariantSetTitle, "then an set title Variant event is received with a setTitle command");
			});

			return RenameHandler._handlePostRename.call(this.oControlVariantPlugin);
		});

		QUnit.test("when variant is RENAMED with a BLANK TITLE", function(assert) {
			var sExistingVariantTitle = "Existing Variant Title";
			var fnMessageBoxShowStub = sandbox.stub(RtaUtils, "showMessageBox").resolves();

			sandbox.spy(this.oControlVariantPlugin, "_createSetTitleCommand");
			sandbox.stub(this.oControlVariantPlugin, "startEdit");
			sandbox.spy(this.oControlVariantPlugin, "stopEdit");

			this.oModel.setData({
				varMgtKey: {
					variants: [
						{
							title: sExistingVariantTitle,
							visible: true
						}
					]
				}
			});

			var sOldVariantTitle = "Old Variant Title";

			sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns("\xa0");
			this.oControlVariantPlugin.setOldValue(sOldVariantTitle);
			this.oControlVariantPlugin._$oEditableControlDomRef.text(sOldVariantTitle);
			sap.ui.getCore().applyChanges();

			return RenameHandler._handlePostRename.call(this.oControlVariantPlugin)
				.then(fnCheckErrorRequirements.bind(this, assert, fnMessageBoxShowStub, this.oControlVariantPlugin, true));
		});

		QUnit.test("when variant RENAMED with the an EXISTING VARIANT TITLE, after which _handlePostRename is called", function(assert) {
			var fnMessageBoxShowStub = sandbox.stub(RtaUtils, "showMessageBox").resolves();
			var sExistingVariantTitle = "Existing Variant Title";

			sandbox.spy(this.oControlVariantPlugin, "_createSetTitleCommand");
			sandbox.stub(this.oControlVariantPlugin, "startEdit");
			sandbox.spy(this.oControlVariantPlugin, "stopEdit");

			this.oModel.setData({
				varMgtKey: {
					variants: [
						{
							title: sExistingVariantTitle,
							visible: true
						}
					]
				}
			});

			sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns(sExistingVariantTitle);
			this.oControlVariantPlugin.setOldValue("Source Variant Title");
			sap.ui.getCore().applyChanges();

			return RenameHandler._handlePostRename.call(this.oControlVariantPlugin)
				.then(fnCheckErrorRequirements.bind(this, assert, fnMessageBoxShowStub, this.oControlVariantPlugin, true));
		});

		QUnit.test("when variant is RENAMED with a new variant title and NO PREVIOUS EXISTENCE, after which _handlePostRename is called", function(assert) {
			assert.expect(7);
			var sExistingVariantTitle = "Existing Variant Title";
			var fnMessageBoxShowStub = sandbox.stub(RtaUtils, "showMessageBox").resolves();
			var fnCreateSetTitleCommandSpy = sandbox.spy(this.oControlVariantPlugin, "_createSetTitleCommand");

			this.oModel.setData({
				varMgtKey: {
					variants: [
						{
							title: sExistingVariantTitle,
							visible: true
						}
					]
				}
			});
			var sOldVariantTitle = "Old Variant Title";
			sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns("Existing Variant Title Copy");
			this.oControlVariantPlugin.setOldValue(sOldVariantTitle);
			sap.ui.getCore().applyChanges();

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				var oCommand = oEvent.getParameter("command");

				assert.equal(fnCreateSetTitleCommandSpy.callCount, 1, "then ControlVariantPlugin._createSetTitleCommand called once");
				assert.ok(oCommand instanceof ControlVariantSetTitle, "then an event is received with a setTitle command, returned from ControlVariantPlugin._createSetTitleCommand");
				assert.equal(oCommand.getNewText(), "Existing Variant Title Copy", "then command has the correct new title");
				assert.equal(oCommand.getElement(), this.oVariantManagementControl, "then command has the correct control");

				assert.notOk(this.oVariantManagementOverlay.hasStyleClass("sapUiRtaErrorBg"), "then error border not added to VariantManagement control overlay");
				assert.equal(fnMessageBoxShowStub.callCount, 0, "then RtaUtils.showMessageBox never called");
			}.bind(this));

			return RenameHandler._handlePostRename.call(this.oControlVariantPlugin);
		});

		QUnit.test("when variant is RENAMED with a CHANGED TITLE, after which _handlePostRename is called", function(assert) {
			var sExistingVariantTitle = "Source Variant Title";
			var fnMessageBoxShowStub = sandbox.stub(RtaUtils, "showMessageBox").resolves();
			var fnCreateSetTitleCommandSpy = sandbox.spy(this.oControlVariantPlugin, "_createSetTitleCommand");

			this.oModel.setData({
				varMgtKey: {
					variants: [
						{
							title: sExistingVariantTitle,
							visible: true
						}
					]
				}
			});

			sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns("Modified Source Variant Title Copy");
			sandbox.stub(this.oModel, "getCurrentVariantReference").returns("varMgtKey");
			this.oControlVariantPlugin.setOldValue(sExistingVariantTitle + " Copy");
			sap.ui.getCore().applyChanges();

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");

				var oSetTitleCommand = oEvent.getParameter("command");

				assert.equal(fnCreateSetTitleCommandSpy.callCount, 1, "then ControlVariantPlugin._createSetTitleCommand called once");
				assert.ok(oSetTitleCommand instanceof ControlVariantSetTitle, "then an event is received with a setTitle command, returned from ControlVariantPlugin._createSetTitleCommand");
				assert.equal(oSetTitleCommand .getNewText(), "Modified Source Variant Title Copy", "then setTitle command has the correct new title");
				assert.equal(oSetTitleCommand .getElement(), this.oVariantManagementControl, "then setTitle command has the correct control");

				assert.notOk(this.oVariantManagementOverlay.hasStyleClass("sapUiRtaErrorBg"), "then error border not added to VariantManagement control overlay");
				assert.equal(fnMessageBoxShowStub.callCount, 0, "then RtaUtils.showMessageBox never called");
			}.bind(this));

			return RenameHandler._handlePostRename.call(this.oControlVariantPlugin);
		});

		QUnit.test("when startEdit is called and renamed control's text container has overflow", function(assert) {
			var vDomRef = this.oVariantManagementOverlay.getDesignTimeMetadata().getData().variantRenameDomRef;

			var $editableControl = this.oVariantManagementOverlay.getDesignTimeMetadata().getAssociatedDomRef(this.oVariantManagementControl, vDomRef); /* Text control */
			var $control = jQuery(this.oVariantManagementControl.getDomRef()); /* Main control */
			var iOverlayInnerWidth = parseInt(this.oVariantManagementOverlay.$().outerWidth());

			$control.css({
				width: "10px",
				"max-width": "10px",
				position: "fixed"
			});
			$editableControl.css({
				"min-width": "15px",
				width: "15px",
				position: "fixed"
			});
			$editableControl.parent().css({
				width: "8px",
				"max-width": "8px",
				position: "fixed"
			});

			var iWidthDiff = parseInt($control.outerWidth()) - parseInt($editableControl.parent().outerWidth());
			this.oControlVariantPlugin.startEdit(this.oVariantManagementOverlay);

			var $editableWrapper = this.oVariantManagementOverlay.$().find(".sapUiRtaEditableField");
			assert.strictEqual($editableWrapper.width(), iOverlayInnerWidth - iWidthDiff, "then correct width set for the editable field wrapper");
		});

		QUnit.test("when startEdit is called and renamed control's text container has no overflow", function(assert) {
			var vDomRef = this.oVariantManagementOverlay.getDesignTimeMetadata().getData().variantRenameDomRef;

			var $editableControl = this.oVariantManagementOverlay.getDesignTimeMetadata().getAssociatedDomRef(this.oVariantManagementControl, vDomRef); /* Text control */
			var $control = jQuery(this.oVariantManagementControl.getDomRef()); /* Main control */
			var iOverlayInnerWidth = parseInt(this.oVariantManagementOverlay.$().innerWidth());

			var iWidthDiff = parseInt($control.outerWidth()) - parseInt($editableControl.outerWidth());
			this.oControlVariantPlugin.startEdit(this.oVariantManagementOverlay);

			var $editableWrapper = this.oVariantManagementOverlay.$().find(".sapUiRtaEditableField");
			assert.equal($editableWrapper.width(), iOverlayInnerWidth - iWidthDiff, "then correct with set for the editable field wrapper");
		});

		QUnit.test("when startEdit is called and renamed control's text container and parent container having overflow", function(assert) {
			var vDomRef = this.oVariantManagementOverlay.getDesignTimeMetadata().getData().variantRenameDomRef;

			var $editableControl = this.oVariantManagementOverlay.getDesignTimeMetadata().getAssociatedDomRef(this.oVariantManagementControl, vDomRef); /* Text control */
			var $control = jQuery(this.oVariantManagementControl.getDomRef()); /* Main control */

			$control.css({
				width: "10px",
				"max-width": "10px",
				position: "fixed"
			});
			$editableControl.parent().css({
				width: "20px",
				"min-width": "20px",
				position: "fixed"
			});
			var iOverlayInnerWidth = parseInt(this.oVariantManagementOverlay.$().innerWidth());

			this.oControlVariantPlugin.startEdit(this.oVariantManagementOverlay);

			var $editableWrapper = this.oVariantManagementOverlay.$().find(".sapUiRtaEditableField");
			assert.equal($editableWrapper.width(), iOverlayInnerWidth, "then correct width set for the editable field wrapper");
		});

		QUnit.test("when startEdit is called and renamed control's editable dom has its own overlay", function(assert) {
			var vDomRef = this.oVariantManagementOverlay.getDesignTimeMetadata().getData().variantRenameDomRef;

			var $editableControl = this.oVariantManagementOverlay.getDesignTimeMetadata().getAssociatedDomRef(this.oVariantManagementControl, vDomRef);/* Text control */
			var $control = jQuery(this.oVariantManagementControl.getDomRef());/* Main control */
			var sInnerControlOverlayWidth = "10px";
			$control.css({
				width: "100px",
				"max-width": "100px",
				position: "fixed"
			});

			return new Promise(function (fnResolve) {
				new ElementOverlay({
					element: this.oVariantManagementControl.getTitle(),
					init: function (oEvent) {
						var oTitleOverlay = oEvent.getSource();
						oTitleOverlay.render();
						oTitleOverlay.$().appendTo(this.oVariantManagementOverlay.$());
						fnResolve(oTitleOverlay);
					}.bind(this)
				});
			}.bind(this))
				.then(function (oTitleOverlay) {
					oTitleOverlay.$().css({
						width: sInnerControlOverlayWidth,
						"min-width": sInnerControlOverlayWidth,
						position: "fixed"
					});

					sandbox.stub(OverlayRegistry, "getOverlay")
						.callThrough()
						.withArgs($editableControl.get(0).id)
						.returns(oTitleOverlay);

					this.oControlVariantPlugin.startEdit(this.oVariantManagementOverlay);

					var $editableWrapper = this.oVariantManagementOverlay.$().find(".sapUiRtaEditableField");
					assert.equal($editableWrapper.css("width"), sInnerControlOverlayWidth, "then correct width is set for the editable field wrapper, outer control width not considered");
				}.bind(this));
		});

		QUnit.test("when startEdit is called", function (assert) {
			var done = assert.async();
			var vDomRef = this.oVariantManagementOverlay.getDesignTimeMetadata().getData().variantRenameDomRef;

			var mPropertyBag = {
				domRef: vDomRef,
				overlay: this.oVariantManagementOverlay,
				pluginMethodName: "plugin.ControlVariant.startEdit"
			};

			sandbox.stub(RenameHandler, "startEdit").callsFake(function () {
				assert.ok(true, "RenameHandler.startEdit called in the end");
				assert.deepEqual(arguments[0], mPropertyBag, "then correct map argument passed to RenameHandler");
				done();
			});

			this.oVariantManagementOverlay.attachEventOnce("geometryChanged", function() {
				assert.strictEqual(this.oVariantManagementControl.getTitle().getText(), "Standard Copy", "then calculated text set as variant control title");
			}, this);
			this.oControlVariantPlugin.startEdit(this.oVariantManagementOverlay);
		});

		QUnit.test("when stopEdit is called in non-error mode", function(assert) {
			var oControl = this.oVariantManagementControl.getTitle();
			var $oControl = jQuery(oControl.getDomRef("inner"));
			var sOldText = "Title Old";
			this.oControlVariantPlugin.setOldValue(sOldText);
			this.oControlVariantPlugin._oEditedOverlay = this.oVariantManagementOverlay;

			$oControl.css("visibility", "hidden");
			this.oControlVariantPlugin.stopEdit();

			assert.strictEqual(this.oControlVariantPlugin.getOldValue(), sOldText, "then old value is the same");
			assert.ok($oControl.css("visibility"), "visible", "then control visibility set back to visible");
			assert.notOk(this._$oEditableControlDomRef);
			assert.notOk(this._oEditedOverlay);
		});

		QUnit.test("when stopEdit is called in error mode", function(assert) {
			var oControl = this.oVariantManagementControl.getTitle();
			var $oControl = jQuery(oControl.getDomRef("inner"));
			var sOldText = "Title Old";
			this.oControlVariantPlugin.setOldValue(sOldText);
			this.oControlVariantPlugin._oEditedOverlay = this.oVariantManagementOverlay;
			sandbox.stub(this.oVariantManagementOverlay, "hasStyleClass").returns(true);

			$oControl.css("visibility", "hidden");
			this.oControlVariantPlugin.stopEdit();

			assert.strictEqual(this.oControlVariantPlugin.getOldValue(), sOldText, "then old value is the same");
			assert.ok($oControl.css("visibility"), "visible", "then control visibility set back to visible");
			assert.notOk(this._$oEditableControlDomRef);
			assert.notOk(this._oEditedOverlay);
		});
	});


	QUnit.module("Given a designTime, a ControlVariant plugin and a VariantManagement control with global id are instantiated", {
		beforeEach: function (assert) {
			var done = assert.async();

			var oMockAppComponent = getMockComponent.call(this);
			sandbox.stub(flUtils, "getAppComponentForControl").returns(oMockAppComponent);
			sandbox.stub(flUtils, "getComponentForControl").returns(oMockAppComponent);
			sandbox.stub(flUtils, "getComponentClassName").returns("Dummy.Component");
			this.oData = {
				varMgtKey: {
					defaultVariant: "variant1",
					variantsEditable: true,
					variants: [
						{key: "variant1"},
						{key: "variant2"}
					]
				}
			};

			//	page
			//		verticalLayout
			//		objectPageLayout
			//			variantManagement (headerContent)
			//			objectPageSection (sections)
			//				objectPageSubSection
			//					verticalLayout
			//						button

			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.ui.layout.VerticalLayout": {
					moveControls: "default"
				}
			})
			.then(function() {
				this.oButton = new Button();
				this.oLayout = new VerticalLayout("overlay1", {
					content: [this.oButton]
				});
				this.oObjectPageSubSection = new ObjectPageSubSection("objSubSection", {
					blocks: [this.oLayout]
				});
				this.oObjectPageSection = new ObjectPageSection("objSection", {
					subSections: [this.oObjectPageSubSection]
				});
				this.sLocalVariantManagementId = "varMgtKey";
				this.sGlobalVariantManagementId = "Comp1--varMgtKey";
				this.oModel = new VariantModel(this.oData, undefined, oMockAppComponent);
				this.oVariantManagementControl = new VariantManagement(this.sGlobalVariantManagementId);
				this.oVariantManagementControl.setModel(this.oModel, flUtils.VARIANT_MODEL_NAME);
				this.oObjectPageLayout = new ObjectPageLayout("objPage", {
					headerContent: [this.oVariantManagementControl],
					sections: [this.oObjectPageSection]
				});
				this.oVariantManagementControl.addAssociation("for", "objPage", true);
				this.oButton2 = new Button();
				this.oLayoutOuter = new VerticalLayout("verlayouter", {
					content: [this.oButton2]
				});
				this.oPage = new Page("mainPage", {
					content: [this.oLayoutOuter, this.oObjectPageLayout]
				}).placeAt("qunit-fixture");

				sap.ui.getCore().applyChanges();

				var oVariantManagementDesignTimeMetadata = {
					"sap.ui.fl.variants.VariantManagement": {}
				};

				this.oDesignTime = new DesignTime({
					designTimeMetadata: oVariantManagementDesignTimeMetadata,
					rootElements: [this.oPage]
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oObjectPageLayoutOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout);
					this.oObjectPageSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection);
					this.oObjectPageSubSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSubSection);
					this.oLayoutOuterOverlay = OverlayRegistry.getOverlay(this.oLayoutOuter);
					this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
					this.oVariantManagementOverlay = OverlayRegistry.getOverlay(this.oVariantManagementControl);
					this.oControlVariantPlugin = new ControlVariantPlugin({
						commandFactory: new CommandFactory()
					});
					done();
				}.bind(this));
				sap.ui.getCore().applyChanges();
			}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
			this.oLayoutOuter.destroy();
			this.oPage.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when registerElementOverlay is called with VariantManagement control Overlay with componentid prefix", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);

			assert.strictEqual(this.oObjectPageSectionOverlay.getVariantManagement(), this.sLocalVariantManagementId, "then local VariantManagement reference successfully set to ObjectPageSection (first child) Overlay");
			assert.strictEqual(this.oObjectPageSubSectionOverlay.getVariantManagement(), this.sLocalVariantManagementId, "then local Variant Management reference successfully set to ObjectPageSubSection (second child) Overlay");
		});
	});

	QUnit.module("Given a designTime and ControlVariant plugin are instantiated and the model has only one visible variant", {
		beforeEach: function (assert) {
			var done = assert.async();

			var oMockAppComponent = getMockComponent.call(this);
			sandbox.stub(flUtils, "getAppComponentForControl").returns(oMockAppComponent);
			sandbox.stub(flUtils, "getComponentForControl").returns(oMockAppComponent);
			sandbox.stub(flUtils, "getComponentClassName").returns("Dummy.Component");
			this.oData = {
				varMgtKey: {
					defaultVariant: "variant1",
					variantsEditable: true,
					variants: [
						{
							key: "variant1",
							title: "Variant 1",
							visible: true
						},
						{
							key: "variant2",
							title: "Variant 2",
							visible: false
						}
					]
				}
			};

			this.sLocalVariantManagementId = "varMgtKey";
			this.oModel = new VariantModel(this.oData, undefined, oMockAppComponent);
			this.oVariantManagementControl = new VariantManagement(this.sLocalVariantManagementId);
			this.oVariantManagementControl.setModel(this.oModel, flUtils.VARIANT_MODEL_NAME);
			this.oVariantManagementControl.addAssociation("for", "objPage", true);

			var oVariantManagementDesignTimeMetadata = {
				"sap.ui.fl.variants.VariantManagement": {}
			};

			this.oVariantManagementControl.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				designTimeMetadata: oVariantManagementDesignTimeMetadata,
				rootElements: [this.oVariantManagementControl]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVariantManagementOverlay = OverlayRegistry.getOverlay(this.oVariantManagementControl);
				this.oControlVariantPlugin = new ControlVariantPlugin({
					commandFactory: new CommandFactory()
				});
				done();
			}.bind(this));

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			sandbox.restore();
			this.oVariantManagementControl.destroy();
			this.oDesignTime.destroy();
			this.oData = null;
			this.oModel.destroy();
		}
	}, function () {
		QUnit.test("when retrieving the context menu items", function(assert) {
			this.oVariantManagementOverlay.getVariantManagement = function() {
				return "varMgtKey";
			};

			var aMenuItems = this.oControlVariantPlugin.getMenuItems([this.oVariantManagementOverlay]);

			assert.equal(aMenuItems[4].id, "CTX_VARIANT_SWITCH_SUBMENU", "there is an entry for switch variant");
			assert.equal(aMenuItems[4].rank, 240, "and the entry has the correct rank");
			assert.notOk(aMenuItems[4].enabled([this.oVariantManagementOverlay]), "and the entry is disabled");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});