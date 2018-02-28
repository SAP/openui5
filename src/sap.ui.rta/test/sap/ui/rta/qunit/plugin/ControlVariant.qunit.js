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
	"sap/ui/rta/command/CompositeCommand",
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
], function(
	Utils,
	VerticalLayout,
	DesignTime,
	CommandFactory,
	ControlVariantSwitch,
	ControlVariantDuplicate,
	ControlVariantSetTitle,
	ControlVariantConfigure,
	CompositeCommand,
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

	var checkTitle = function(assert, sExpectedTitle, sTitleToBeCopied) {
		assert.strictEqual(this.oControlVariantPlugin._getVariantTitleForCopy(sTitleToBeCopied, "varMgtKey", this.oModel.getData()), sExpectedTitle, "then correct title returned for duplicate");
	};

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

	QUnit.test("when _isPersonalizationMode is called", function(assert) {
		assert.notOk(this.oControlVariantPlugin._isPersonalizationMode(), "then _isPersonalizationMode for CUSTOMER layer is false");
		sandbox.stub(this.oControlVariantPlugin.getCommandFactory(), "getFlexSettings").returns({layer : "USER"});
		assert.ok(this.oControlVariantPlugin._isPersonalizationMode(), "then _isPersonalizationMode for USER layer is true");
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
		var bVMAvailable = this.oControlVariantPlugin.isVariantSwitchAvailable(this.oVariantManagementOverlay);
		var bButtonAvailable = this.oControlVariantPlugin.isVariantSwitchAvailable(this.oButtonOverlay);
		assert.ok(bVMAvailable, "then variant switch is available for VariantManagement control");
		assert.notOk(bButtonAvailable, "then variant switch not available for a non VariantManagement control overlay");
	});

	QUnit.test("when isVariantSwitchEnabled is called with VariantManagement overlay", function(assert) {
		this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
		var bVMEnabled = this.oControlVariantPlugin.isVariantSwitchEnabled(this.oVariantManagementOverlay);
		var bButtonEnabled = this.oControlVariantPlugin.isVariantSwitchEnabled(this.oButtonOverlay);
		assert.ok(bVMEnabled, "then variant switch is enabled for VariantManagement control");
		assert.notOk(bButtonEnabled, "then variant switch is not enabled for a non VariantManagement control");
	});

	QUnit.test("when isVariantDuplicateAvailable is called with different overlays", function(assert) {
		assert.notOk(this.oControlVariantPlugin.isVariantDuplicateAvailable(this.oObjectPageLayoutOverlay), "then duplicate not available for a non VariantManagement control overlay with variantReference");
		assert.ok(this.oControlVariantPlugin.isVariantDuplicateAvailable(this.oVariantManagementOverlay), "then duplicate available for a VariantManagement control overlay with variantReference");
		assert.notOk(this.oControlVariantPlugin.isVariantDuplicateAvailable(this.oLayoutOuterOverlay), "then duplicate not available for a non VariantManagement control overlay without variantReference");
	});

	QUnit.test("when isVariantDuplicateEnabled is called with VariantManagement overlay", function(assert) {
		this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
		var bVMEnabled = this.oControlVariantPlugin.isVariantDuplicateEnabled(this.oVariantManagementOverlay);
		var bButtonEnabled = this.oControlVariantPlugin.isVariantDuplicateEnabled(this.oButtonOverlay);
		assert.ok(bVMEnabled, "then variant duplicate is enabled for VariantManagement control");
		assert.notOk(bButtonEnabled, "then variant duplicate is not enabled for a non VariantManagement control");
	});

	QUnit.test("when isVariantRenameAvailable is called with VariantManagement overlay", function(assert) {
		var bVMAvailable = this.oControlVariantPlugin.isRenameAvailable(this.oVariantManagementOverlay);
		var bButtonAvailable = this.oControlVariantPlugin.isRenameAvailable(this.oButtonOverlay);
		assert.ok(bVMAvailable, "then variant rename is available for VariantManagement control");
		assert.notOk(bButtonAvailable, "then variant rename is not available for non VariantManagement control");
	});

	QUnit.test("when isVariantRenameEnabled is called with VariantManagement overlay", function(assert) {
		var bVMEnabled = this.oControlVariantPlugin.isRenameEnabled(this.oVariantManagementOverlay);
		var bButtonEnabled = this.oControlVariantPlugin.isRenameEnabled(this.oButtonOverlay);
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
		var bVMEnabled = this.oControlVariantPlugin.isVariantConfigureEnabled(this.oVariantManagementOverlay);
		var bButtonEnabled = this.oControlVariantPlugin.isVariantConfigureEnabled(this.oButtonOverlay);
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

	QUnit.test("when calling '_getVariantTitleForCopy' with a title containing -> no copy pattern, no counter, no previous existence", function(assert) {
		checkTitle.call(this, assert, "SampleTitle Copy", "SampleTitle");
	});

	QUnit.test("when calling '_getVariantTitleForCopy' with a title containing -> copy pattern, no counter, no previous existence", function(assert) {
		checkTitle.call(this, assert, "SampleTitle Copy", "SampleTitle Copy");
	});

	QUnit.test("when calling '_getVariantTitleForCopy' with a title containing -> copy pattern, no counter, previous existence without counter", function(assert) {
		this.oModel.oData["varMgtKey"].variants.push({
			title: "SampleTitle Copy",
			visible: true
		});
		checkTitle.call(this, assert, "SampleTitle Copy(1)", "SampleTitle Copy");
		this.oModel.oData["varMgtKey"].variants.splice(3, 1);
	});

	QUnit.test("when calling '_getVariantTitleForCopy' with a title containing -> no copy pattern, no counter, previous existence with counter", function(assert) {
		this.oModel.oData["varMgtKey"].variants.push({
			title: "SampleTitle Copy(5)",
			visible: true
		});
		checkTitle.call(this, assert, "SampleTitle Copy(6)", "SampleTitle");
		this.oModel.oData["varMgtKey"].variants.splice(3, 1);
	});

	QUnit.test("when calling '_getVariantTitleForCopy' with a title containing -> copy pattern, counter, previous existence with counter", function(assert) {
		this.oModel.oData["varMgtKey"].variants.push({
			title: "SampleTitle Copy(5)",
			visible: true
		}, {
			title: "SampleTitle Copy(8)",
			visible: true
		});
		checkTitle.call(this, assert, "SampleTitle Copy(9)", "SampleTitle Copy(5)");
		this.oModel.oData["varMgtKey"].variants.splice(3, 2);
	});

	QUnit.test("when calling '_getVariantTitleForCopy' with a title containing -> copy pattern, counter, previous existence without counter and a different base title", function(assert) {
		this.oModel.oData["varMgtKey"].variants.push({
			title: "TitleSample",
			visible: true
		}, {
			title: "SampleTitle Copy(1)",
			visible: true
		});
		checkTitle.call(this, assert, "TitleSample Copy", "TitleSample");
		this.oModel.oData["varMgtKey"].variants.splice(3, 2);
	});

	QUnit.test("when calling '_getVariantTitleForCopy' with a title containing -> copy pattern, counter, no previous existence and a different resource bundle pattern", function(assert) {
		sandbox.stub(this.oModel._oResourceBundle, "getText", function(sText, aArguments){
			if (sText === "VARIANT_COPY_SINGLE_TEXT") {
				return "{0} Copy";
			} else if (sText === "VARIANT_COPY_MULTIPLE_TEXT") {
				if (!aArguments) {
					return "({1}) {0} Copy";
				}
				return "(" + aArguments[1] + ") " + aArguments[0] + " Copy";
			}
		});
		this.oModel.oData["varMgtKey"].variants.push({
			title: "SampleTitle Copy",
			visible: true
		}, {
			title: "SampleTitle Copy(8)",
			visible: true
		});
		checkTitle.call(this, assert, "(1) SampleTitle Copy", "SampleTitle Copy(5)");
		this.oModel.oData["varMgtKey"].variants.splice(3, 2);
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
		var duplicateDone = assert.async();
		var renameDone = assert.async();
		var configureDone = assert.async();
		var switchDone = assert.async();

		sandbox.stub(this.oControlVariantPlugin, "renameVariant", function(aOverlays){
			if (aOverlays[0]._triggerDuplicate) {
				// Duplicate
				assert.ok(true, "Overlay._triggerDuplicate property set for duplicate");
				assert.deepEqual(aOverlays[0], this.oVariantManagementOverlay, "the 'handler' function calls renameVariant for duplicate menu item with the correct overlay");
				duplicateDone();
			} else {
				// Rename
				assert.deepEqual(aOverlays[0], this.oVariantManagementOverlay, "the 'handler' function calls renameVariant for rename menu item with the correct overlay");
				renameDone();
			}
		}.bind(this));

		// Configure
		sandbox.stub(this.oControlVariantPlugin, "configureVariants", function(){
			assert.ok(true, "the 'handler' function calls the configureVariants method");
			configureDone();
		});

		// Switch SubMenu
		var oItem = {
			eventItem: {
				data: function () {
					return {
						id: "CTX_VARIANT_SWITCH_SUBMENU",
						key: "variant2"
					};
				}
			}
		};
		this.oVariantManagementOverlay.getVariantManagement = function(){
			return "varMgtKey";
		};
		var aExpectedSubmenu = [
			{id: "variant1", text: "Variant 1", icon: "sap-icon://accept", enabled: false},
			{id: "variant2", text: "Variant 2", icon: "", enabled: true}
		];

		sandbox.stub(this.oControlVariantPlugin, "switchVariant", function(oTargetOverlay, sNewVariantReference, sCurrentVariantReference){
			assert.equal(oTargetOverlay, this.oVariantManagementOverlay, "the 'handler' function calls the switchVariant method with the correct oTargetOverlay");
			assert.equal(sNewVariantReference, "variant2", "the 'handler' function calls the switchVariant method with the correct sNewVariantKey");
			assert.equal(sCurrentVariantReference, "variant1", "the 'handler' function calls the switchVariant method with the correct sCurrentVariantKey");
			switchDone();
		}.bind(this));

		var aMenuItems = this.oControlVariantPlugin.getMenuItems(this.oVariantManagementOverlay);

		assert.equal(aMenuItems[0].id, "CTX_VARIANT_SET_TITLE", "there is an entry for rename variant");
		assert.equal(aMenuItems[0].rank, 210, "and the entry has the correct rank");
		aMenuItems[0].handler([this.oVariantManagementOverlay]);
		assert.ok(aMenuItems[0].enabled(this.oVariantManagementOverlay), "and the entry is enabled");

		assert.equal(aMenuItems[1].id, "CTX_VARIANT_DUPLICATE", "there is an entry for duplicate variant");
		assert.equal(aMenuItems[1].rank, 220, "and the entry has the correct rank");
		aMenuItems[1].handler([this.oVariantManagementOverlay]);
		assert.ok(aMenuItems[1].enabled(this.oVariantManagementOverlay), "and the entry is enabled");

		assert.equal(aMenuItems[2].id, "CTX_VARIANT_MANAGE", "there is an entry for configure variant");
		assert.equal(aMenuItems[2].rank, 230, "and the entry has the correct rank");
		aMenuItems[2].handler([this.oVariantManagementOverlay]);
		assert.ok(aMenuItems[2].enabled(this.oVariantManagementOverlay), "and the entry is enabled");
		assert.equal(aMenuItems[2].startSection, true, "the configure variant starts a new section on the menu");

		assert.equal(aMenuItems[3].id, "CTX_VARIANT_SWITCH_SUBMENU", "there is an entry for switch variant");
		assert.equal(aMenuItems[3].rank, 240, "and the entry has the correct rank");
		assert.ok(aMenuItems[3].enabled(this.oVariantManagementOverlay), "and the entry is enabled");
		assert.propEqual(aMenuItems[3].submenu, aExpectedSubmenu, "and the submenu array is correct");
		aMenuItems[3].handler([this.oVariantManagementOverlay], oItem);
	});

	QUnit.module("Given variant management control is renamed/duplicated", {
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

			var oMockedAppComponent = {
				getModel: function () {
					return this.oModel;
				}.bind(this),
				getLocalId: function () {
					return "varMgtKey";
				}
			};

			var oManifest = new Manifest(oManifestObj);

			var oFlexController = FlexControllerFactory.createForControl(oMockedAppComponent, oManifest);

			this.oModel = new VariantModel({}, oFlexController, oMockedAppComponent);

			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

			this.oVariantManagementControl = new VariantManagement("varMgtKey").placeAt("content");

			this.oVariantManagementControl.setModel(this.oModel, "$FlexVariants");

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
				this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
				this.oVariantManagementOverlay.setSelectable(true);
				this.oControlVariantPlugin._oEditedOverlay = this.oVariantManagementOverlay;
				this.oControlVariantPlugin._$oEditableControlDomRef = jQuery(this.oVariantManagementControl.getTitle().getDomRef("inner"));
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
		var sOldVariantTitle = "Old Variant Title";
		this.oControlVariantPlugin._$editableField = {
			text : function(){
				return "New Variant Title  ";
			}
		};
		this.oControlVariantPlugin.setOldValue(sOldVariantTitle);
		this.oControlVariantPlugin._$oEditableControlDomRef.text(sOldVariantTitle);

		this.oControlVariantPlugin.attachElementModified(function(oEvent) {
			assert.ok(oEvent.getParameter("command") instanceof ControlVariantSetTitle, "then an set title Variant event is received with a setTitle command");
			assert.equal(oEvent.getParameter("command").getNewText(), "New Variant Title", "then the new title is trimmed for ending spaces");
			done();
		});

		this.oControlVariantPlugin._emitLabelChangeEvent();
	});

	QUnit.test("when variant rename is stopped and _emitLabelChangeEvent is called with an existing variant, on variant duplicate", function(assert) {
		var sNewVariantTitle = "Existing Variant Title",
			fnMessageBoxShowStub = sandbox.stub(RtaUtils, "_showMessageBox").returns(Promise.resolve()),
			fnValueStateMessageOpenStub = sandbox.stub(ValueStateMessage.prototype, "open"),
			done = assert.async();

		this.oModel.setData({
			"varMgtKey" : {
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
		this.oVariantManagementOverlay._triggerDuplicate = true;
		sap.ui.getCore().applyChanges();

		sandbox.stub(this.oControlVariantPlugin, "startEdit", function() {
			assert.ok(this.oVariantManagementOverlay.hasStyleClass("sapUiRtaErrorBg"), "then error border added to VariantManagement control overlay");
			assert.ok(this.oControlVariantPlugin._oValueStateMessage instanceof ValueStateMessage, "then value state message intitialized for plugin");
			assert.ok(fnMessageBoxShowStub.calledOnce, "then RtaUtils._showMessageBox called once");
			assert.ok(fnValueStateMessageOpenStub.calledOnce, "then ValueStateMessage.open called once");
			assert.equal(typeof this.oVariantManagementOverlay.getValueState, "function", "then getValueState function set for VariantManagement control overlay");
			assert.equal(typeof this.oVariantManagementOverlay.getValueStateText, "function", "then getValueStateText function set for VariantManagement control overlay");
			assert.equal(typeof this.oVariantManagementOverlay.getDomRefForValueStateMessage, "function", "then getValueStateText function set for VariantManagement control overlay");
			done();
		}.bind(this));

		this.oControlVariantPlugin._emitLabelChangeEvent();
	});

	QUnit.test("when variant is renamed with an existing title, but the other variant with same title is not visible", function(assert) {
		var done = assert.async();
		var sNewVariantTitle = "Existing Variant Title";

		this.oModel.setData({
			"varMgtKey" : {
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
		this.oControlVariantPlugin._$oEditableControlDomRef.text(sOldVariantTitle);
		sap.ui.getCore().applyChanges();

		this.oControlVariantPlugin.attachElementModified(function(oEvent) {
			assert.ok(oEvent.getParameter("command") instanceof ControlVariantSetTitle, "then an set title Variant event is received with a setTitle command");
			done();
		});

		this.oControlVariantPlugin._emitLabelChangeEvent();
	});

	QUnit.test("when variant is renamed with a blank title", function(assert) {
		var done = assert.async();
		var sExistingVariantTitle = "Existing Variant Title",
			fnMessageBoxShowStub = sandbox.stub(RtaUtils, "_showMessageBox").returns(Promise.resolve()),
			fnValueStateMessageOpenStub = sandbox.stub(ValueStateMessage.prototype, "open");

		this.oModel.setData({
			"varMgtKey" : {
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

		sandbox.stub(this.oControlVariantPlugin, "startEdit", function() {
			assert.ok(this.oVariantManagementOverlay.hasStyleClass("sapUiRtaErrorBg"), "then error border added to VariantManagement control overlay");
			assert.ok(this.oControlVariantPlugin._oValueStateMessage instanceof ValueStateMessage, "then value state message intitialized for plugin");
			assert.ok(fnMessageBoxShowStub.calledOnce, "then RtaUtils._showMessageBox called once");
			assert.ok(fnValueStateMessageOpenStub.calledOnce, "then ValueStateMessage.open called once");
			assert.equal(typeof this.oVariantManagementOverlay.getValueState, "function", "then getValueState function set for VariantManagement control overlay");
			assert.equal(typeof this.oVariantManagementOverlay.getValueStateText, "function", "then getValueStateText function set for VariantManagement control overlay");
			assert.equal(typeof this.oVariantManagementOverlay.getDomRefForValueStateMessage, "function", "then getValueStateText function set for VariantManagement control overlay");
			done();
		}.bind(this));

		this.oControlVariantPlugin._emitLabelChangeEvent();
	});

	QUnit.test("when variant rename is stopped and _emitLabelChangeEvent is called with the same text as source", function(assert) {
		var done = assert.async();
		var fnMessageBoxShowStub = sandbox.stub(RtaUtils, "_showMessageBox").returns(Promise.resolve()),
			fnCreateSetTitleCommandSpy = sandbox.spy(this.oControlVariantPlugin, "_createSetTitleCommand"),
			fnCreateDuplicateCommandSpy = sandbox.spy(this.oControlVariantPlugin, "_createDuplicateCommand"),
			fnElementModifiedStub = sandbox.stub(this.oControlVariantPlugin, "fireElementModified");

		var sOldVariantTitle = "Old Variant Title";
		sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns(sOldVariantTitle);
		this.oControlVariantPlugin.setOldValue(sOldVariantTitle);
		sap.ui.getCore().applyChanges();

		this.oControlVariantPlugin._emitLabelChangeEvent();
		assert.equal(fnCreateSetTitleCommandSpy.callCount, 0,  "then no SetTitleCommand created");
		assert.equal(fnCreateDuplicateCommandSpy.callCount, 0,  "then no Duplicate created");
		assert.notOk(this.oVariantManagementOverlay.hasStyleClass("sapUiRtaErrorBg"), "then error border not added to VariantManagement control overlay");
		assert.notOk(this.oControlVariantPlugin._oValueStateMessage, "then no value state message exists for plugin");
		assert.equal(fnMessageBoxShowStub.callCount, 0, "then RtaUtils._showMessageBox never called");
		assert.equal(fnElementModifiedStub.callCount, 0,  "then fireElementModified never called");
		done();
	});

	QUnit.test("when variant rename is stopped and _emitLabelChangeEvent is called with the same text as source, on variant duplicate", function(assert) {
		var done = assert.async();
		var fnMessageBoxShowStub = sandbox.stub(RtaUtils, "_showMessageBox").returns(Promise.resolve()),
			fnCreateSetTitleCommandSpy = sandbox.spy(this.oControlVariantPlugin, "_createSetTitleCommand"),
			fnCreateDuplicateCommandSpy = sandbox.spy(this.oControlVariantPlugin, "_createDuplicateCommand"),
			fnValueStateMessageOpenStub = sandbox.stub(ValueStateMessage.prototype, "open");

		var sOldVariantTitle = "Standard";
		sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns(sOldVariantTitle);
		this.oControlVariantPlugin.setOldValue(sOldVariantTitle);
		this.oVariantManagementOverlay._triggerDuplicate = true;
		sap.ui.getCore().applyChanges();

		this.oControlVariantPlugin._emitLabelChangeEvent();
		sandbox.stub(this.oControlVariantPlugin, "startEdit", function() {
			assert.equal(fnCreateSetTitleCommandSpy.callCount, 0, "then no SetTitleCommand created");
			assert.equal(fnCreateDuplicateCommandSpy.callCount, 0, "then no Duplicate created");
			assert.ok(this.oVariantManagementOverlay.hasStyleClass("sapUiRtaErrorBg"), "then error border added to VariantManagement control overlay");
			assert.ok(this.oControlVariantPlugin._oValueStateMessage, "then no value state message exists for plugin");
			assert.ok(fnMessageBoxShowStub.calledOnce, "then RtaUtils._showMessageBox called once");
			assert.ok(fnValueStateMessageOpenStub.calledOnce, "then ValueStateMessage.open called once");
			assert.equal(typeof this.oVariantManagementOverlay.getValueState, "function", "then getValueState function set for VariantManagement control overlay");
			assert.equal(typeof this.oVariantManagementOverlay.getValueStateText, "function", "then getValueStateText function set for VariantManagement control overlay");
			assert.equal(typeof this.oVariantManagementOverlay.getDomRefForValueStateMessage, "function", "then getValueStateText function set for VariantManagement control overlay");
			done();
		}.bind(this));
	});

	QUnit.test("when variant rename is stopped and _emitLabelChangeEvent is called with a new variant title and no previous existence", function(assert) {
		var done = assert.async();
		var sExistingVariantTitle = "Existing Variant Title",
			fnMessageBoxShowStub = sandbox.stub(RtaUtils, "_showMessageBox").returns(Promise.resolve()),
			fnCreateSetTitleCommandSpy = sandbox.spy(this.oControlVariantPlugin, "_createSetTitleCommand"),
			fnValueStateMessageOpenStub = sandbox.stub(ValueStateMessage.prototype, "open");

		this.oModel.setData({
			"varMgtKey" : {
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

			assert.equal(fnCreateSetTitleCommandSpy.callCount, 1,  "then ControlVariantPlugin._createSetTitleCommand called once");
			assert.ok(oCommand instanceof ControlVariantSetTitle, "then an event is received with a setTitle command, returned from ControlVariantPlugin._createSetTitleCommand");
			assert.equal(oCommand.getNewText(), "Existing Variant Title Copy", "then command has the correct new title");
			assert.equal(oCommand.getElement(), this.oVariantManagementControl, "then command has the correct control");

			assert.notOk(this.oVariantManagementOverlay.hasStyleClass("sapUiRtaErrorBg"), "then error border not added to VariantManagement control overlay");
			assert.notOk(this.oControlVariantPlugin._oValueStateMessage, "then no value state message exists for plugin");
			assert.equal(fnMessageBoxShowStub.callCount, 0, "then RtaUtils._showMessageBox never called");
			assert.equal(fnValueStateMessageOpenStub.callCount, 0,  "then ValueStateMessage.open never called");
			done();
		}.bind(this));

		this.oControlVariantPlugin._emitLabelChangeEvent();
	});

	QUnit.test("when variant rename is stopped and _emitLabelChangeEvent is called with an unchanged title on variant duplicate", function(assert) {
		var done = assert.async();

		var sExistingVariantTitle = "Existing Variant Title",
			fnMessageBoxShowStub = sandbox.stub(RtaUtils, "_showMessageBox").returns(Promise.resolve()),
			fnCreateDuplicateCommandSpy = sandbox.spy(this.oControlVariantPlugin, "_createDuplicateCommand"),
			fnValueStateMessageOpenStub = sandbox.stub(ValueStateMessage.prototype, "open");

		this.oModel.setData({
			"varMgtKey" : {
				variants: [
					{
						title: sExistingVariantTitle,
						visible: true
					}
				]
			}
		});

		var sSourceVariantTitle = "Source Variant Title";
		this.oVariantManagementOverlay._triggerDuplicate = true;
		sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns("Source Variant Title Copy");
		sandbox.stub(this.oModel, "getCurrentVariantReference").returns("varMgtKey");
		this.oControlVariantPlugin.setOldValue(sSourceVariantTitle);
		this.oControlVariantPlugin.sCustomTextForDuplicate = "Source Variant Title Copy";
		sap.ui.getCore().applyChanges();

		this.oControlVariantPlugin.attachElementModified(function(oEvent) {
			assert.ok(oEvent, "then fireElementModified is called once");

			var oCommand = oEvent.getParameter("command");
			var oDuplicateCommand = oCommand.getCommands()[0];

			assert.equal(fnCreateDuplicateCommandSpy.callCount, 1,  "then ControlVariantPlugin._createDuplicateCommand called once");
			assert.ok(oCommand instanceof CompositeCommand, "then a composite command is received");
			assert.equal(oCommand.getCommands().length, 1,  "then one command inside composite command");

			assert.ok(oDuplicateCommand instanceof ControlVariantDuplicate, "then control variant duplicate command present inside composite command, returned from ControlVariantPlugin._createDuplicateCommand");
			assert.equal(oDuplicateCommand.getNewVariantTitle(), "Source Variant Title Copy", "then command has the correct title");
			assert.equal(oDuplicateCommand.getElement(), this.oVariantManagementControl, "then command has the correct control");
			assert.equal(oDuplicateCommand.getSourceVariantReference(), "varMgtKey", "then command has correct variant management reference");

			assert.notOk(this.oVariantManagementOverlay.hasStyleClass("sapUiRtaErrorBg"), "then error border not added to VariantManagement control overlay");
			assert.notOk(this.oControlVariantPlugin._oValueStateMessage, "then no value state message exists for plugin");
			assert.equal(fnMessageBoxShowStub.callCount, 0, "then RtaUtils._showMessageBox never called");
			assert.equal(fnValueStateMessageOpenStub.callCount, 0,  "then ValueStateMessage.open never called");
			done();
		}.bind(this));

		this.oControlVariantPlugin._emitLabelChangeEvent();
	});

	QUnit.test("when variant rename is stopped and _emitLabelChangeEvent is called with a changed title on variant duplicate", function(assert) {
		var done = assert.async();

		var sExistingVariantTitle = "Source Variant Title",
			fnMessageBoxShowStub = sandbox.stub(RtaUtils, "_showMessageBox").returns(Promise.resolve()),
			fnCreateDuplicateCommandSpy = sandbox.spy(this.oControlVariantPlugin, "_createDuplicateCommand"),
			fnCreateSetTitleCommandSpy = sandbox.spy(this.oControlVariantPlugin, "_createSetTitleCommand"),
			fnValueStateMessageOpenStub = sandbox.stub(ValueStateMessage.prototype, "open");

		this.oModel.setData({
			"varMgtKey" : {
				variants: [
					{
						title: sExistingVariantTitle,
						visible: true
					}
				]
			}
		});

		var sSourceVariantTitle = "Source Variant Title";
		this.oVariantManagementOverlay._triggerDuplicate = true;
		sandbox.stub(RenameHandler, "_getCurrentEditableFieldText").returns("Modified Source Variant Title Copy");
		sandbox.stub(this.oModel, "getCurrentVariantReference").returns("varMgtKey");
		this.oControlVariantPlugin.setOldValue(sSourceVariantTitle);
		this.oControlVariantPlugin.sCustomTextForDuplicate = "Source Variant Title Copy";
		sap.ui.getCore().applyChanges();

		this.oControlVariantPlugin.attachElementModified(function(oEvent) {
			assert.ok(oEvent, "then fireElementModified is called once");

			var oCommand = oEvent.getParameter("command");
			var oDuplicateCommand = oCommand.getCommands()[0];
			var oSetTitleCommand = oCommand.getCommands()[1];

			assert.equal(fnCreateDuplicateCommandSpy.callCount, 1,  "then ControlVariantPlugin._createDuplicateCommand called once");
			assert.equal(fnCreateSetTitleCommandSpy.callCount, 1,  "then ControlVariantPlugin._createSetTitleCommand called once");
			assert.ok(oCommand instanceof CompositeCommand, "then a composite command is received");
			assert.equal(oCommand.getCommands().length, 2,  "then one command inside composite command");


			assert.ok(oSetTitleCommand  instanceof ControlVariantSetTitle, "then an event is received with a setTitle command, returned from ControlVariantPlugin._createSetTitleCommand");
			assert.equal(oSetTitleCommand .getNewText(), "Modified Source Variant Title Copy", "then setTitle command has the correct new title");
			assert.equal(oSetTitleCommand .getElement(), this.oVariantManagementControl, "then setTitle command has the correct control");

			assert.ok(oDuplicateCommand instanceof ControlVariantDuplicate, "then control variant duplicate command present inside composite command, returned from ControlVariantPlugin._createDuplicateCommand");
			assert.equal(oDuplicateCommand.getNewVariantTitle(), "Source Variant Title Copy", "then duplicate command has the correct title");
			assert.equal(oDuplicateCommand.getElement(), this.oVariantManagementControl, "then duplicate command has the correct control");
			assert.equal(oDuplicateCommand.getSourceVariantReference(), "varMgtKey", "then duplicate command has correct variant management reference");

			assert.notOk(this.oVariantManagementOverlay.hasStyleClass("sapUiRtaErrorBg"), "then error border not added to VariantManagement control overlay");
			assert.notOk(this.oControlVariantPlugin._oValueStateMessage, "then no value state message exists for plugin");
			assert.equal(fnMessageBoxShowStub.callCount, 0, "then RtaUtils._showMessageBox never called");
			assert.equal(fnValueStateMessageOpenStub.callCount, 0,  "then ValueStateMessage.open never called");
			done();
		}.bind(this));

		this.oControlVariantPlugin._emitLabelChangeEvent();
	});

	QUnit.test("when startEdit is called and renamed control's text container has overflow", function(assert) {
		var vDomRef = this.oVariantManagementOverlay.getDesignTimeMetadata().getDomRef();

		var $editableControl = this.oVariantManagementOverlay.getDesignTimeMetadata().getAssociatedDomRef(this.oVariantManagementControl, vDomRef); /* Text control */
		var $control = jQuery(this.oVariantManagementControl.getDomRef()); /* Main control */
		var iOverlayInnerWidth = parseInt(this.oVariantManagementOverlay.$().innerWidth(), 10);

		$control.css({
			"width": "10px",
			"max-width": "10px",
			"position": "fixed"
		});
		$editableControl.parent().css({
			"width": "8px",
			"max-width": "8px",
			"position": "fixed"
		});

		var iWidthDiff = parseInt($control.outerWidth(), 10) - parseInt($editableControl.parent().outerWidth(), 10);
		this.oControlVariantPlugin.startEdit(this.oVariantManagementOverlay);

		var $editableWrapper = this.oVariantManagementOverlay.$().find(".sapUiRtaEditableField");
		assert.strictEqual($editableWrapper.css("width"), (iOverlayInnerWidth - iWidthDiff) + "px", "then correct with set for the editable field wrapper");
	});

	QUnit.test("when startEdit is called and renamed control's text container has no overflow", function(assert) {
		var vDomRef = this.oVariantManagementOverlay.getDesignTimeMetadata().getDomRef();

		var $editableControl = this.oVariantManagementOverlay.getDesignTimeMetadata().getAssociatedDomRef(this.oVariantManagementControl, vDomRef); /* Text control */
		var $control = jQuery(this.oVariantManagementControl.getDomRef()); /* Main control */
		var iOverlayInnerWidth = parseInt(this.oVariantManagementOverlay.$().innerWidth(), 10);

		var iWidthDiff = parseInt($control.outerWidth(), 10) - parseInt($editableControl.outerWidth(), 10);
		this.oControlVariantPlugin.startEdit(this.oVariantManagementOverlay);

		var $editableWrapper = this.oVariantManagementOverlay.$().find(".sapUiRtaEditableField");
		assert.equal($editableWrapper.css("width"), (iOverlayInnerWidth - iWidthDiff) + "px", "then correct with set for the editable field wrapper");
	});

	QUnit.test("when startEdit is called and renamed control's text container and parent container having overflow", function(assert) {
		var vDomRef = this.oVariantManagementOverlay.getDesignTimeMetadata().getDomRef();

		var $editableControl = this.oVariantManagementOverlay.getDesignTimeMetadata().getAssociatedDomRef(this.oVariantManagementControl, vDomRef); /* Text control */
		var $control = jQuery(this.oVariantManagementControl.getDomRef()); /* Main control */

		$control.css({
			"width": "10px",
			"max-width": "10px",
			"position": "fixed"
		});
		$editableControl.parent().css({
			"width": "20px",
			"min-width": "20px",
			"position": "fixed"
		});
		var iOverlayInnerWidth = parseInt(this.oVariantManagementOverlay.$().innerWidth(), 10);

		this.oControlVariantPlugin.startEdit(this.oVariantManagementOverlay);

		var $editableWrapper = this.oVariantManagementOverlay.$().find(".sapUiRtaEditableField");
		assert.equal($editableWrapper.css("width"), iOverlayInnerWidth + "px", "then correct with set for the editable field wrapper");
	});

	QUnit.test("when startEdit is called in duplicate mode", function(assert) {
		var done = assert.async();
		var vDomRef = this.oVariantManagementOverlay.getDesignTimeMetadata().getDomRef();
		this.oVariantManagementOverlay._triggerDuplicate = true;

		var mPropertyBag = {
			domRef: vDomRef,
			overlay: this.oVariantManagementOverlay,
			pluginMethodName: "plugin.ControlVariant.startEdit"
		};

		sandbox.stub(RenameHandler, "startEdit", function() {
			assert.ok(true, "RenameHandler.startEdit called in the end");
			assert.deepEqual(arguments[0], mPropertyBag, "then correct map argument passed to RenameHandler");
			done();
		});

		this.oVariantManagementOverlay.attachEventOnce("geometryChanged", function() {
			assert.strictEqual(this.oControlVariantPlugin.sCustomTextForDuplicate, "Standard Copy", "then text calculated and persisted for variant duplicate");
			assert.strictEqual(this.oControlVariantPlugin.getOldValue(), "Standard", "then current variant title stored in oldValue property of plugin");
			assert.strictEqual(this.oVariantManagementControl.getTitle().getText(), "Standard Copy", "then calculated text set as variant control title");
		}.bind(this));
		this.oControlVariantPlugin.startEdit(this.oVariantManagementOverlay);
	});

	QUnit.test("when stopEdit is called in non-error mode on duplicate", function(assert) {
		var oControl = this.oVariantManagementControl.getTitle();
		var $oControl = jQuery(oControl.getDomRef("inner"));
		this.oVariantManagementOverlay._triggerDuplicate = true;
		this.oControlVariantPlugin.sCustomTextForDuplicate = "Title Copy";
		this.oControlVariantPlugin.setOldValue("Title Old");
		this.oControlVariantPlugin._oEditedOverlay = this.oVariantManagementOverlay;
		oControl.setText(this.oControlVariantPlugin.sCustomTextForDuplicate);

		$oControl.css("visibility", "hidden");
		this.oControlVariantPlugin.stopEdit();

		assert.notOk(this.oControlVariantPlugin.getOldValue(), "then old value is reset");
		assert.notEqual(oControl.getText(), this.oControlVariantPlugin.sCustomTextForDuplicate, "then control binding refreshed");
		assert.notOk(this.oVariantManagementOverlay._triggerDuplicate, "then Overlay._triggerDuplicate property reset (deleted)");
		assert.ok($oControl.css("visibility"), "visible", "then control visibility set back to visible");
		assert.notOk(this._$oEditableControlDomRef);
		assert.notOk(this._oEditedOverlay);
	});

	QUnit.test("when stopEdit is called in error mode on duplicate", function(assert) {
		var oControl = this.oVariantManagementControl.getTitle();
		var $oControl = jQuery(oControl.getDomRef("inner"));
		this.oVariantManagementOverlay._triggerDuplicate = true;
		this.oControlVariantPlugin.sCustomTextForDuplicate = "Title Copy";
		this.oControlVariantPlugin.setOldValue("Title Old");
		this.oControlVariantPlugin._oEditedOverlay = this.oVariantManagementOverlay;
		sandbox.stub(this.oVariantManagementOverlay, "hasStyleClass").returns(true);

		$oControl.css("visibility", "hidden");
		this.oControlVariantPlugin.stopEdit();

		assert.strictEqual(this.oControlVariantPlugin.getOldValue(), "Title Old", "then old value is not reset");
		assert.ok(this.oVariantManagementOverlay._triggerDuplicate, "then Overlay._triggerDuplicate property still set");
		assert.ok($oControl.css("visibility"), "visible", "then control visibility set back to visible");
		assert.notOk(this._$oEditableControlDomRef);
		assert.notOk(this._oEditedOverlay);
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

	QUnit.module("Given a designTime and ControlVariant plugin are instantiated and the model has only one visible variant", {
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

			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
			sandbox.stub(Utils, "getComponentForControl").returns(oMockedAppComponent);
			sandbox.stub(Utils, "getComponentClassName").returns("Dummy.Component");

			this.sLocalVariantManagementId = "varMgtKey";
			this.oModel = new VariantModel(this.oData, oFlexController, oMockedAppComponent);
			this.oVariantManagementControl = new VariantManagement(this.sLocalVariantManagementId);
			this.oVariantManagementControl.setModel(this.oModel, "$FlexVariants");
			this.oVariantManagementControl.setAssociation("for", "objPage", true);

			var oVariantManagementDesignTimeMetadata = {
				"sap.ui.fl.variants.VariantManagement": {}
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
			this.oDesignTime.destroy();
			this.oData = null;
			this.oModel.destroy();
		}
	});

	QUnit.test("when retrieving the context menu items", function(assert){
		this.oVariantManagementOverlay.getVariantManagement = function(){
			return "varMgtKey";
		};

		var aMenuItems = this.oControlVariantPlugin.getMenuItems(this.oVariantManagementOverlay);

		assert.equal(aMenuItems[3].id, "CTX_VARIANT_SWITCH_SUBMENU", "there is an entry for switch variant");
		assert.equal(aMenuItems[3].rank, 240, "and the entry has the correct rank");
		assert.notOk(aMenuItems[3].enabled(this.oVariantManagementOverlay), "and the entry is disabled");
	});

});