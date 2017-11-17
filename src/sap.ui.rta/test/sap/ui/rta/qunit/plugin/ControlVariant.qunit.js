/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/ControlVariantSwitch",
	"sap/ui/rta/command/ControlVariantDuplicate",
	"sap/ui/rta/command/ControlVariantSetTitle",
	"sap/ui/rta/command/ControlVariantConfigure",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/fl/registry/ChangeRegistry",
	'sap/ui/fl/FlexControllerFactory',
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/rta/plugin/ControlVariant",
	"sap/ui/rta/plugin/RenameHandler",
	'sap/ui/core/Manifest',
	"sap/ui/core/Title",
	"sap/m/Button",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/m/Page",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/changeHandler/BaseTreeModifier",
	"sap/m/delegate/ValueStateMessage",
	"sap/ui/rta/Utils",
	// should be last
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
], 	function(
	Utils,
	VerticalLayout,
	DesignTime,
	CommandFactory,
	ControlVariantSwitch,
	ControlVariantDuplicate,
	ControlVariantSetTitle,
	ControlVariantConfigure,
	OverlayRegistry,
	ElementOverlay,
	ChangeRegistry,
	FlexControllerFactory,
	FormContainer,
	Form,
	FormLayout,
	ControlVariantPlugin,
	RenameHandler,
	Manifest,
	Title,
	Button,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	Page,
	VariantManagement,
	VariantModel,
	BaseTreeModifier,
	ValueStateMessage,
	RtaUtils,
	sinon
) {
		"use strict";

		QUnit.start();

		var sandbox = sinon.sandbox.create();

		QUnit.module("Given a designTime and ControlVariant plugin are instantiated", {
			beforeEach: function (assert) {
				var done = assert.async();

				// create fl objects and stubs
				var oManifestObj = {
					"sap.app": {
						id: "MyComponent",
						"applicationVersion": {
							"version": "1.2.3"
						}
					}
				};
				var oManifest = new Manifest(oManifestObj);

				var oMockedAppComponent = {
					getLocalId: function () {
						return "varMgtKey";
					},
					getModel: function () {return this.oModel;}.bind(this)
				};

				var oFlexController = FlexControllerFactory.createForControl(oMockedAppComponent, oManifest);
				this.oData = {
					"varMgtKey": {
						defaultVariant : "variant1",
						variantsEditable : true,
						variants: [
							{key: "variant1"},
							{key: "variant2"}
						]
					}
				};

				sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
				sandbox.stub(Utils, "getComponentForControl").returns(oMockedAppComponent);
				sandbox.stub(Utils, "getComponentClassName").returns("Dummy.Component");

				//	page
				//		verticalLayout
				//		objectPageLayout
				//			variantManagement (headerContent)
				//			objectPageSection (sections)
				//				objectPageSubSection
				//					verticalLayout
				//						button

				var oChangeRegistry = ChangeRegistry.getInstance();
				oChangeRegistry.registerControlsForChanges({
					"sap.ui.layout.VerticalLayout" : {
						"moveControls": "default"
					}
				});

				this.oButton = new Button();

				this.oLayout = new VerticalLayout("overlay1",{
					content : [this.oButton]
				});

				this.oObjectPageSubSection = new ObjectPageSubSection("objSubSection", {
					blocks: [this.oLayout]
				});

				this.oObjectPageSection = new ObjectPageSection("objSection",{
					subSections: [this.oObjectPageSubSection]
				});

				this.sLocalVariantManagementId = "varMgtKey";
				this.oModel = new VariantModel(this.oData, oFlexController, oMockedAppComponent);
				this.oVariantManagementControl = new VariantManagement(this.sLocalVariantManagementId);
				this.oVariantManagementControl.setModel(this.oModel, "$FlexVariants");

				this.oObjectPageLayout = new ObjectPageLayout("objPage",{
					headerContent: [this.oVariantManagementControl],
					sections : [this.oObjectPageSection]
				});

				this.oVariantManagementControl.setAssociation("for", "objPage", true);

				this.oButton2 = new Button();
				this.oLayoutOuter = new VerticalLayout("verlayouter", {
					content: [this.oButton2]
				});

				this.oPage = new Page("mainPage", {
					content: [this.oLayoutOuter, this.oObjectPageLayout]
				}).placeAt("content");

				var oVariantManagementDesignTimeMetadata = {
					"sap.ui.fl.variants.VariantManagement": {}
				};

				this.oDesignTime = new DesignTime({
					designTimeMetadata : oVariantManagementDesignTimeMetadata,
					rootElements : [this.oPage]
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
			},
			afterEach: function (assert) {
				sandbox.restore();
				this.oLayoutOuter.destroy();
				this.oPage.destroy();
				this.oDesignTime.destroy();
				this.oData = null;
				this.oModel.destroy();
			}
		});

		QUnit.test("when registerElementOverlay is called", function(assert) {
			assert.ok(ElementOverlay.prototype.getVariantManagement, "then getVariantManagement added to the ElementOverlay prototype");
			assert.ok(ElementOverlay.prototype.setVariantManagement, "then setVariantManagement added to the ElementOverlay prototype");
		});

		QUnit.test("when _isEditable is called with VariantManagement overlay", function(assert) {
			var bEditable = this.oControlVariantPlugin._isEditable(this.oVariantManagementOverlay);
			assert.ok(bEditable, "then VariantManagement overlay is editable");
		});

		QUnit.test("when registerElementOverlay is called with VariantManagement control Overlay", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			assert.strictEqual(this.oObjectPageLayoutOverlay.getVariantManagement(), this.sLocalVariantManagementId, "then VariantManagement reference successfully set to ObjectPageLayout Overlay from the id of VariantManagement control");
			assert.notOk(this.oLayoutOuterOverlay.getVariantManagement(), "then no VariantManagement reference set to an element outside element not a part of the associated control");
			assert.deepEqual(this.oVariantManagementOverlay.getEditableByPlugins(), [this.oControlVariantPlugin.getMetadata().getName()],
				"then VariantManagement is marked as editable by ControlVariant plugin");
			assert.equal(this.oModel.getData()[this.sLocalVariantManagementId].variantsEditable, false, "the parameter 'variantsEditable' is set to false");
		});

		QUnit.test("when registerElementOverlay and afterwards deregisterElementOverlay are called with VariantManagement control Overlay", function(assert) {
			assert.equal(this.oModel.getData()[this.sLocalVariantManagementId].variantsEditable, true, "the parameter 'variantsEditable' is true by default");
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			assert.equal(this.oModel.getData()[this.sLocalVariantManagementId].variantsEditable, false, "'variantsEditable' is set to false after registering");
			this.oControlVariantPlugin.deregisterElementOverlay(this.oVariantManagementOverlay);
			assert.equal(this.oModel.getData()[this.sLocalVariantManagementId].variantsEditable, true, "'variantsEditable' is set to true after deregistering");
		});

		QUnit.test("when isVariantSwitchAvailable is called with VariantManagement overlay", function(assert) {
			var bAvailable = this.oControlVariantPlugin.isVariantSwitchAvailable(this.oVariantManagementOverlay);
			assert.ok(bAvailable, "then variant switch is available for VariantManagement control");
		});

		QUnit.test("when isVariantSwitchEnabled is called with VariantManagement overlay", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			var bEnabled = this.oControlVariantPlugin.isVariantSwitchEnabled(this.oVariantManagementOverlay);
			assert.ok(bEnabled, "then variant switch is enabled for VariantManagement control");
		});

		QUnit.test("when isVariantDuplicateAvailable is called with different overlays", function(assert) {
			assert.notOk(this.oControlVariantPlugin.isVariantDuplicateAvailable(this.oObjectPageLayoutOverlay), "then duplicate not available for a non VariantManagement control overlay with variantReference");
			assert.ok(this.oControlVariantPlugin.isVariantDuplicateAvailable(this.oVariantManagementOverlay), "then duplicate available for a VariantManagement control overlay withvariantReference");
			assert.notOk(this.oControlVariantPlugin.isVariantDuplicateAvailable(this.oLayoutOuterOverlay), "then duplicate not available for a non VariantManagement control overlay without variantReference");
		});

		QUnit.test("when isVariantDuplicateEnabled is called with VariantManagement overlay", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			var bEnabled = this.oControlVariantPlugin.isVariantDuplicateEnabled(this.oVariantManagementOverlay);
			assert.ok(bEnabled, "then variant duplicate is enabled for VariantManagement control");
		});

		QUnit.test("when isVariantRenameAvailable is called with VariantManagement overlay", function(assert) {
			var bAvailable = this.oControlVariantPlugin.isRenameAvailable(this.oVariantManagementOverlay);
			assert.ok(bAvailable, "then variant rename is available for VariantManagement control");
		});

		QUnit.test("when isVariantRenameEnabled is called with VariantManagement overlay", function(assert) {
			var bEnabled = this.oControlVariantPlugin.isRenameEnabled(this.oVariantManagementOverlay);
			assert.ok(bEnabled, "then variant rename is enabled for VariantManagement control");
		});

		QUnit.test("when isVariantConfigureAvailable is called with VariantManagement overlay", function(assert) {
			var bAvailable = this.oControlVariantPlugin.isVariantConfigureAvailable(this.oVariantManagementOverlay);
			assert.ok(bAvailable, "then variant configure is available for VariantManagement control");
		});

		QUnit.test("when isVariantConfigureEnabled is called with VariantManagement overlay", function(assert) {
			var bEnabled = this.oControlVariantPlugin.isVariantConfigureEnabled(this.oVariantManagementOverlay);
			assert.ok(bEnabled, "then variant configure is enabled for VariantManagement control");
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

		QUnit.test("when duplicateVariant is called", function(assert) {
			var done = assert.async();
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			sandbox.stub(this.oModel, "getCurrentVariantReference").returns(this.oData[this.sLocalVariantManagementId].variants[0]);
			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof ControlVariantDuplicate, "then a duplicate Variant event is received with a duplicate command");
				done();
			});
			this.oControlVariantPlugin.duplicateVariant(this.oVariantManagementOverlay);
		});

		QUnit.test("when renameVariant is called", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			this.oVariantManagementOverlay.setSelectable(true);

			var done = assert.async();
			var fnDone = assert.async();

			sap.ui.getCore().getEventBus().subscribeOnce('sap.ui.rta', 'plugin.ControlVariant.startEdit', function (sChannel, sEvent, mParams) {
				if (mParams.overlay === this.oVariantManagementOverlay) {
					assert.strictEqual(this.oVariantManagementOverlay.getSelected(), true, "then the overlay is still selected");
					this.oControlVariantPlugin._$oEditableControlDomRef.text("Test");
					this.oControlVariantPlugin._$editableField.text(this.oControlVariantPlugin._$oEditableControlDomRef.text());
					var $Event = jQuery.Event("keydown");
					$Event.keyCode = jQuery.sap.KeyCodes.ENTER;
					this.oControlVariantPlugin._$editableField.trigger($Event);
					sap.ui.getCore().applyChanges();
					fnDone();
				}
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
			sandbox.stub(this.oModel, "manageVariants").returns(Promise.resolve(aChanges));

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof ControlVariantConfigure, "then a configure Variant event is received with a configure command");
				assert.equal(oCommand.getChanges(), aChanges, "and the command contains the given changes");
				done();
			});
			this.oControlVariantPlugin.configureVariants([this.oVariantManagementOverlay]);
		});

		QUnit.test("when _propagateVariantManagement is called with a root overlay and VariantManagement reference", function(assert) {
			var aOverlays = this.oControlVariantPlugin._propagateVariantManagement(this.oObjectPageLayoutOverlay, "varMgtKey");
			assert.equal(this.oButtonOverlay.getVariantManagement(), "varMgtKey", "then VariantManagement reference successfully propagated from the root overlay to last child overlay)");
			assert.equal(aOverlays.length, 5, "then VariantManagement reference successfully set for all 5 child ElementOverlays");
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

		QUnit.test("when retrieving the context menu items", function(assert){
			var bDuplicateAvailable = true;

			// Rename
			sandbox.stub(this.oControlVariantPlugin, "isRenameAvailable", function(oOverlay){
				assert.deepEqual(oOverlay, this.oButtonOverlay, "the 'available' function calls isRenameAvailable with the correct overlay");
				return true;
			}.bind(this));
			sandbox.stub(this.oControlVariantPlugin, "renameVariant", function(){
				assert.ok(true, "the 'handler' function calls the renameVariant method");
			});
			sandbox.stub(this.oControlVariantPlugin, "isRenameEnabled", function(oOverlay){
				assert.deepEqual(oOverlay, this.oButtonOverlay, "the 'enabled' function calls isRenameEnabled with the correct overlay");
			}.bind(this));

			// Duplicate
			sandbox.stub(this.oControlVariantPlugin, "isVariantDuplicateAvailable", function(oOverlay){
				assert.deepEqual(oOverlay, this.oButtonOverlay, "the 'available' function calls isVariantDuplicateAvailable with the correct overlay");
				return bDuplicateAvailable;
			}.bind(this));
			sandbox.stub(this.oControlVariantPlugin, "duplicateVariant", function(oOverlay){
				assert.deepEqual(oOverlay, this.oButtonOverlay, "the 'handler' function calls duplicateVariant with the correct overlay");
			}.bind(this));
			sandbox.stub(this.oControlVariantPlugin, "isVariantDuplicateEnabled", function(oOverlay){
				assert.deepEqual(oOverlay, this.oButtonOverlay, "the 'enabled' function calls isVariantDuplicateEnabled with the correct overlay");
			}.bind(this));

			// Configure
			sandbox.stub(this.oControlVariantPlugin, "isVariantConfigureAvailable", function(oOverlay){
				assert.deepEqual(oOverlay, this.oButtonOverlay, "the 'available' function calls isVariantConfigureAvailable with the correct overlay");
				return true;
			}.bind(this));
			sandbox.stub(this.oControlVariantPlugin, "configureVariants", function(){
				assert.ok(true, "the 'handler' function calls the configureVariants method");
			});
			sandbox.stub(this.oControlVariantPlugin, "isVariantConfigureEnabled", function(oOverlay){
				assert.deepEqual(oOverlay, this.oButtonOverlay, "the 'enabled' function calls isVariantConfigureEnabled with the correct overlay");
			}.bind(this));

			// Switch SubMenu
			var oItem = {
				eventItem: {
					data: function () {
						return {
							targetOverlay: "dummyOverlay",
							key: "dummyKey",
							current: "dummyCurrent"
						};
					}
				}
			};
			var sVariantModelName = '$FlexVariants';
			this.oButtonOverlay.getVariantManagement = function(){
				return "dummyManagementReferenceId";
			};
			var oModel = {
				getData : function() {
					return {
						dummyManagementReferenceId : {
							currentVariant : "dummyCurrentVariant",
							variants : "dummyVariants"
						}
					};
				}
			};
			sandbox.stub(this.oControlVariantPlugin, "isVariantSwitchAvailable", function(oOverlay){
				assert.deepEqual(oOverlay, this.oButtonOverlay, "the 'available' function calls isVariantSwitchAvailable with the correct overlay");
				return true;
			}.bind(this));
			sandbox.stub(this.oControlVariantPlugin, "switchVariant", function(oTargetOverlay, sNewVariantKey, sCurrentVariantKey){
				assert.equal(oTargetOverlay, "dummyOverlay", "the 'handler' function calls the switchVariant method with the correct oTargetOverlay");
				assert.equal(sNewVariantKey, "dummyKey", "the 'handler' function calls the switchVariant method with the correct sNewVariantKey");
				assert.equal(sCurrentVariantKey, "dummyCurrent", "the 'handler' function calls the switchVariant method with the correct sCurrentVariantKey");
			});
			sandbox.stub(this.oControlVariantPlugin, "isVariantSwitchEnabled", function(oOverlay){
				assert.deepEqual(oOverlay, this.oButtonOverlay, "the 'enabled' function calls isVariantSwitchEnabled with the correct overlay");
			}.bind(this));

			var aMenuItems = this.oControlVariantPlugin.getMenuItems(this.oButtonOverlay);

			assert.equal(aMenuItems[0].id, "CTX_VARIANT_SET_TITLE", "there is an entry for rename variant");
			assert.equal(aMenuItems[0].rank, 210, "and the entry has the correct rank");
			aMenuItems[0].handler([this.oButtonOverlay]);
			aMenuItems[0].enabled(this.oButtonOverlay);
			assert.equal(aMenuItems[1].id, "CTX_VARIANT_DUPLICATE", "there is an entry for duplicate variant");
			assert.equal(aMenuItems[1].rank, 220, "and the entry has the correct rank");
			aMenuItems[1].handler([this.oButtonOverlay]);
			aMenuItems[1].enabled(this.oButtonOverlay);
			assert.equal(aMenuItems[2].id, "CTX_VARIANT_CONFIGURE", "there is an entry for configure variant");
			assert.equal(aMenuItems[2].rank, 230, "and the entry has the correct rank");
			aMenuItems[2].handler([this.oButtonOverlay]);
			aMenuItems[2].enabled(this.oButtonOverlay);
			assert.equal(aMenuItems[2].startSection, true, "the configure variant starts a new section on the menu");

			assert.equal(aMenuItems[3].id, "CTX_VARIANT_SWITCH_SUBMENU", "there is a submenu for switch variant");
			assert.equal(aMenuItems[3].rank, 240, "and the entry has the correct rank");
			assert.equal(aMenuItems[3].submenu.id, "{" + sVariantModelName + ">key}", "the submenu id is correct");
			assert.equal(aMenuItems[3].submenu.text, "{" + sVariantModelName + ">title}", "the submenu text is correct");
			assert.equal(aMenuItems[3].submenu.model, sVariantModelName, "the submenu model is correct");
			assert.equal(aMenuItems[3].submenu.current(this.oButtonOverlay, oModel), "dummyCurrentVariant", "the 'current' function returns the correct variant");
			assert.equal(aMenuItems[3].submenu.items(this.oButtonOverlay, oModel), "dummyVariants", "the 'items' function returns the correct variants");
			aMenuItems[3].handler([this.oButtonOverlay], oItem);
			aMenuItems[3].enabled(this.oButtonOverlay);

			bDuplicateAvailable = false;
			assert.equal(this.oControlVariantPlugin.getMenuItems(this.oButtonOverlay).length,
				3,
				"then if e.g. duplicate variant is not available, its menu item is not returned");
		});

		QUnit.module("Given _emitLabelChangeEvent is called after renaming (blur or click events)", {
			beforeEach: function (assert) {
				var done = assert.async();

				var oManifestObj = {
					"sap.app": {
						id: "MyComponent",
						"applicationVersion": {
							"version": "1.2.3"
						}
					}
				};
				this.oManifest = new Manifest(oManifestObj);

				this.oVariantManagementControl = new VariantManagement("varMgtKey").placeAt("content");

				var oVariantManagementDesignTimeMetadata = {
					"sap.ui.fl.variants.VariantManagement": {
						actions : {}
					}
				};

				this.oDesignTime = new DesignTime({
					designTimeMetadata : oVariantManagementDesignTimeMetadata,
					rootElements : [this.oVariantManagementControl]
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
			afterEach: function (assert) {
				sandbox.restore();
				this.oVariantManagementControl.destroy();
				this.oDesignTime.destroy();
			}
		});

		QUnit.test("when variant is renamed with a new title", function(assert) {
			var done = assert.async();
			var oModelData = {};
			oModelData["varMgtKey"] = {
				variants: []
			};

			var oMockedAppComponent = {
				getModel: function () {return oModel;}
			};

			var oFlexController = FlexControllerFactory.createForControl(oMockedAppComponent, this.oManifest);
			var oModel = new VariantModel(oModelData, oFlexController, oMockedAppComponent);

			var sOldVariantTitle = "Old Variant Title";

			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
			sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns("New Variant Title");

			this.oVariantManagementControl.setModel(oModel, "$FlexVariants");
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			this.oVariantManagementOverlay.setSelectable(true);

			this.oControlVariantPlugin._oEditedOverlay = this.oVariantManagementOverlay;
			this.oControlVariantPlugin.setOldValue(sOldVariantTitle);
			this.oControlVariantPlugin._$oEditableControlDomRef = jQuery(this.oVariantManagementControl.getTitle().getDomRef("inner"));
			this.oControlVariantPlugin._$oEditableControlDomRef.text(sOldVariantTitle);

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent.getParameter("command") instanceof ControlVariantSetTitle, "then an set title Variant event is received with a setTitle command");
				done();
			});

			this.oControlVariantPlugin._emitLabelChangeEvent();
		});

		QUnit.test("when variant is renamed with an existing title", function(assert) {
			var done = assert.async();
			var oModelData = {};
			var sNewVariantTitle = "Existing Variant Title",
				fnMessageBoxShowStub = sandbox.stub(RtaUtils, "_showMessageBox").returns(Promise.resolve()),
				fnValueStateMessageOpenStub = sandbox.stub(ValueStateMessage.prototype, "open");

			oModelData["varMgtKey"] = {
				variants: [
					{
						title: sNewVariantTitle
					}
				]
			};
			var oMockedAppComponent = {
				getModel: function () {return oModel;}
			};

			var oFlexController = FlexControllerFactory.createForControl(oMockedAppComponent, this.oManifest);
			var oModel = new VariantModel(oModelData, oFlexController, oMockedAppComponent);

			var sOldVariantTitle = "Old Variant Title";

			sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns(sNewVariantTitle);
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);

			this.oControlVariantPlugin._oEditedOverlay = this.oVariantManagementOverlay;
			this.oControlVariantPlugin.setOldValue(sOldVariantTitle);
			this.oControlVariantPlugin._$oEditableControlDomRef = jQuery(this.oVariantManagementControl.getTitle().getDomRef("inner"));
			this.oControlVariantPlugin._$oEditableControlDomRef.text(sOldVariantTitle);
			sap.ui.getCore().applyChanges();

			this.oControlVariantPlugin._emitLabelChangeEvent().then( function () {
				assert.ok(this.oVariantManagementOverlay.$().hasClass("sapUiErrorBg"), "then error border added to VariantManagement control overlay");
				assert.ok(this.oControlVariantPlugin._oValueStateMessage instanceof ValueStateMessage, "then value state message intitialized for plugin");
				assert.ok(fnMessageBoxShowStub.calledOnce, "then RtaUtils._showMessageBox called once");
				assert.ok(fnValueStateMessageOpenStub.calledOnce, "then ValueStateMessage.open called once");
				assert.equal(typeof this.oVariantManagementOverlay.getValueState, "function", "then getValueState function set for VariantManagement control overlay");
				assert.equal(typeof this.oVariantManagementOverlay.getValueStateText, "function", "then getValueStateText function set for VariantManagement control overlay");
				assert.equal(typeof this.oVariantManagementOverlay.getDomRefForValueStateMessage, "function", "then getValueStateText function set for VariantManagement control overlay");
				done();
			}.bind(this));
		});

		QUnit.test("when variant is renamed with a blank title", function(assert) {
			var done = assert.async();
			var oModelData = {};
			var sExistingVariantTitle = "Existing Variant Title",
				fnMessageBoxShowStub = sandbox.stub(RtaUtils, "_showMessageBox").returns(Promise.resolve()),
				fnValueStateMessageOpenStub = sandbox.stub(ValueStateMessage.prototype, "open");

			oModelData["varMgtKey"] = {
				variants: [
					{
						title: sExistingVariantTitle
					}
				]
			};
			var oMockedAppComponent = {
				getModel: function () {return oModel;}
			};

			var oFlexController = FlexControllerFactory.createForControl(oMockedAppComponent, this.oManifest);
			var oModel = new VariantModel(oModelData, oFlexController, oMockedAppComponent);

			var sOldVariantTitle = "Old Variant Title";

			sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns("\xa0");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);

			this.oControlVariantPlugin._oEditedOverlay = this.oVariantManagementOverlay;
			this.oControlVariantPlugin.setOldValue(sOldVariantTitle);
			this.oControlVariantPlugin._$oEditableControlDomRef = jQuery(this.oVariantManagementControl.getTitle().getDomRef("inner"));
			this.oControlVariantPlugin._$oEditableControlDomRef.text(sOldVariantTitle);
			sap.ui.getCore().applyChanges();

			this.oControlVariantPlugin._emitLabelChangeEvent().then( function () {
				assert.ok(this.oVariantManagementOverlay.$().hasClass("sapUiErrorBg"), "then error border added to VariantManagement control overlay");
				assert.ok(this.oControlVariantPlugin._oValueStateMessage instanceof ValueStateMessage, "then value state message intitialized for plugin");
				assert.ok(fnMessageBoxShowStub.calledOnce, "then RtaUtils._showMessageBox called once");
				assert.ok(fnValueStateMessageOpenStub.calledOnce, "then ValueStateMessage.open called once");
				assert.equal(typeof this.oVariantManagementOverlay.getValueState, "function", "then getValueState function set for VariantManagement control overlay");
				assert.equal(typeof this.oVariantManagementOverlay.getValueStateText, "function", "then getValueStateText function set for VariantManagement control overlay");
				assert.equal(typeof this.oVariantManagementOverlay.getDomRefForValueStateMessage, "function", "then getValueStateText function set for VariantManagement control overlay");
				done();
			}.bind(this));
		});

		QUnit.test("when variant is renamed after a duplicate variant is triggered from the same source variant for the second time (both with the default title)", function(assert) {
			var done = assert.async();
			var oModelData = {};
			var sExistingVariantTitle = "Existing Variant Title Copy",
				fnMessageBoxShowStub = sandbox.stub(RtaUtils, "_showMessageBox").returns(Promise.resolve()),
				fnValueStateMessageOpenStub = sandbox.stub(ValueStateMessage.prototype, "open");

			oModelData["varMgtKey"] = {
				variants: [
					{
						title: sExistingVariantTitle
					},
					{
						title: sExistingVariantTitle
					}
				]
			};
			var oMockedAppComponent = {
					getModel: function () {return oModel;}
				};

			var oFlexController = FlexControllerFactory.createForControl(oMockedAppComponent, this.oManifest);
			var oModel = new VariantModel(oModelData, oFlexController, oMockedAppComponent);

			var sOldVariantTitle = "Old Variant Title";

			sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns("Existing Variant Title Copy");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);

			this.oControlVariantPlugin._oEditedOverlay = this.oVariantManagementOverlay;
			this.oControlVariantPlugin.setOldValue(sOldVariantTitle);
			this.oControlVariantPlugin._$oEditableControlDomRef = jQuery(this.oVariantManagementControl.getTitle().getDomRef("inner"));
			this.oControlVariantPlugin._$oEditableControlDomRef.text(sOldVariantTitle);
			sap.ui.getCore().applyChanges();

			this.oControlVariantPlugin._emitLabelChangeEvent().then( function () {
				assert.ok(this.oVariantManagementOverlay.$().hasClass("sapUiErrorBg"), "then error border added to VariantManagement control overlay");
				assert.ok(this.oControlVariantPlugin._oValueStateMessage instanceof ValueStateMessage, "then value state message intitialized for plugin");
				assert.ok(fnMessageBoxShowStub.calledOnce, "then RtaUtils._showMessageBox called once");
				assert.ok(fnValueStateMessageOpenStub.calledOnce, "then ValueStateMessage.open called once");
				assert.equal(typeof this.oVariantManagementOverlay.getValueState, "function", "then getValueState function set for VariantManagement control overlay");
				assert.equal(typeof this.oVariantManagementOverlay.getValueStateText, "function", "then getValueStateText function set for VariantManagement control overlay");
				assert.equal(typeof this.oVariantManagementOverlay.getDomRefForValueStateMessage, "function", "then getValueStateText function set for VariantManagement control overlay");
				done();
			}.bind(this));
		});

		QUnit.module("Given a designTime, a ControlVariant plugin and a VariantManagement control with global id are instantiated", {
			beforeEach: function (assert) {
				var done = assert.async();

				// create fl objects and stubs
				var oManifestObj = {
					"sap.app": {
						id: "MyComponent",
						"applicationVersion": {
							"version": "1.2.3"
						}
					}
				};
				var oManifest = new Manifest(oManifestObj);

				var oMockedAppComponent = {
					getLocalId: function () {
						return "varMgtKey";
					},
					getModel: function () {return this.oModel;}.bind(this)
				};

				var oFlexController = FlexControllerFactory.createForControl(oMockedAppComponent, oManifest);
				this.oData = {
					"varMgtKey": {
						defaultVariant : "variant1",
						variantsEditable : true,
						variants: [
							{key: "variant1"},
							{key: "variant2"}
						]
					}
				};

				sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
				sandbox.stub(Utils, "getComponentForControl").returns(oMockedAppComponent);
				sandbox.stub(Utils, "getComponentClassName").returns("Dummy.Component");

				//	page
				//		verticalLayout
				//		objectPageLayout
				//			variantManagement (headerContent)
				//			objectPageSection (sections)
				//				objectPageSubSection
				//					verticalLayout
				//						button

				var oChangeRegistry = ChangeRegistry.getInstance();
				oChangeRegistry.registerControlsForChanges({
					"sap.ui.layout.VerticalLayout" : {
						"moveControls": "default"
					}
				});

				this.oButton = new Button();

				this.oLayout = new VerticalLayout("overlay1",{
					content : [this.oButton]
				});

				this.oObjectPageSubSection = new ObjectPageSubSection("objSubSection", {
					blocks: [this.oLayout]
				});

				this.oObjectPageSection = new ObjectPageSection("objSection",{
					subSections: [this.oObjectPageSubSection]
				});

				this.sLocalVariantManagementId = "varMgtKey";
				this.sGlobalVariantManagementId = "Comp1--varMgtKey";
				this.oModel = new VariantModel(this.oData, oFlexController, oMockedAppComponent);
				this.oVariantManagementControl = new VariantManagement(this.sGlobalVariantManagementId);
				this.oVariantManagementControl.setModel(this.oModel, "$FlexVariants");

				this.oObjectPageLayout = new ObjectPageLayout("objPage",{
					headerContent: [this.oVariantManagementControl],
					sections : [this.oObjectPageSection]
				});

				this.oVariantManagementControl.setAssociation("for", "objPage", true);

				this.oButton2 = new Button();
				this.oLayoutOuter = new VerticalLayout("verlayouter", {
					content: [this.oButton2]
				});

				this.oPage = new Page("mainPage", {
					content: [this.oLayoutOuter, this.oObjectPageLayout]
				}).placeAt("content");

				var oVariantManagementDesignTimeMetadata = {
					"sap.ui.fl.variants.VariantManagement": {}
				};

				this.oDesignTime = new DesignTime({
					designTimeMetadata : oVariantManagementDesignTimeMetadata,
					rootElements : [this.oPage]
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
			},
			afterEach: function (assert) {
				sandbox.restore();
				this.oLayoutOuter.destroy();
				this.oPage.destroy();
				this.oDesignTime.destroy();
			}
		});

		QUnit.test("when registerElementOverlay is called with VariantManagement control Overlay with componentid prefix", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);

			assert.strictEqual(this.oObjectPageSectionOverlay.getVariantManagement(), this.sLocalVariantManagementId, "then local VariantManagement reference successfully set to ObjectPageSection (first child) Overlay");
			assert.strictEqual(this.oObjectPageSubSectionOverlay.getVariantManagement(), this.sLocalVariantManagementId, "then local Variant Management reference successfully set to ObjectPageSubSection (second child) Overlay");
		});

	});