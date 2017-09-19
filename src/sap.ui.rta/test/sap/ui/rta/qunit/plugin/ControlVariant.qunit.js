/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/ControlVariantSwitch",
	"sap/ui/rta/command/ControlVariantDuplicate",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/rta/plugin/ControlVariant",
	"sap/ui/core/Title",
	"sap/m/Button",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/m/Page",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/changeHandler/BaseTreeModifier",
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
	OverlayRegistry,
	ElementOverlay,
	ChangeRegistry,
	FormContainer,
	Form,
	FormLayout,
	ControlVariantPlugin,
	Title,
	Button,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	Page,
	VariantManagement,
	VariantModel,
	BaseTreeModifier,
	sinon
) {
		"use strict";

		QUnit.start();

		var sandbox = sinon.sandbox.create();

		var fnGetMockedAppComponent = function(oModel) {
			return {
				getLocalId: function () {
					return undefined;
				},
				getManifestEntry: function () {
					return {};
				},
				getMetadata: function () {
					return {
						getName: function () {
							return "someName";
						}
					};
				},
				getManifest: function () {
					return {
						"sap.app" : {
							applicationVersion : {
								version : "1.2.3"
							}
						}
					};
				},
				getModel: function () { return oModel; }
			};
		};

		QUnit.module("Given a designTime and ControlVariant plugin are instantiated", {
			beforeEach: function (assert) {
				var done = assert.async();

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

				this.sLocalVariantManagementId = "component0--varMgtKeyStubbed";
				this.oButton = new Button();

				this.oLayout = new VerticalLayout("verlay1",{
					content : [this.oButton]
				});

				this.oObjectPageSubSection = new ObjectPageSubSection("objSubSection", {
					blocks: [this.oLayout]
				});

				this.oObjectPageSection = new ObjectPageSection("objSection",{
					subSections: [this.oObjectPageSubSection]
				});

				this.oVariantManagementControl = new VariantManagement("varMgtKey");

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
					"sap.ui.fl.variants.VariantManagement": {
						actions : {
							"switch" : {
								changeType : "controlVariantSwitch"
							}
						}
					}
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
					this.oControlVariantPlugin = new ControlVariantPlugin({ commandFactory: CommandFactory });
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
			assert.strictEqual(this.oObjectPageLayoutOverlay.getVariantManagement(), "varMgtKey", "then VariantManagement reference successfully set to ObjectPageLayout Overlay from the id of VariantManagement control");
			assert.notOk(this.oLayoutOuterOverlay.getVariantManagement(), "then no VariantManagement reference set to an element outside element not a part of the associated control");
			assert.deepEqual(this.oVariantManagementOverlay.getEditableByPlugins(), [this.oControlVariantPlugin.getMetadata().getName()],
				"then VariantManagement is marked as editable by ControlVariant plugin");
		});

		QUnit.test("when registerElementOverlay is called with VariantManagement control Overlay with componentid prefix", function(assert) {
			sandbox.stub(BaseTreeModifier, "getSelector").returns({id: this.sLocalVariantManagementId});
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);

			assert.strictEqual(this.oObjectPageSectionOverlay.getVariantManagement(), this.sLocalVariantManagementId, "then VariantManagement reference successfully set to ObjectPageSection (first child) Overlay");
			assert.strictEqual(this.oObjectPageSubSectionOverlay.getVariantManagement(), this.sLocalVariantManagementId, "then Variant Management reference successfully set to ObjectPageSubSection (second child) Overlay");
		});

		QUnit.test("when isVariantSwitchAvailable is called with VariantManagement overlay", function(assert) {
			var bAvailable = this.oControlVariantPlugin.isVariantSwitchAvailable(this.oVariantManagementOverlay);
			assert.ok(bAvailable, "then variant switch is available for VariantManagement control");
		});

		QUnit.test("when isVariantSwitchEnabled is called with VariantManagement overlay", function(assert) {
			var oModelData = {};
			oModelData[this.sLocalVariantManagementId] = {
				variants: [
					{key: "variant1"},
					{key: "variant2"}
				]
			};
			var oModel = new VariantModel(oModelData, {}),
				oMockedAppComponent = fnGetMockedAppComponent(oModel);
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
			sandbox.stub(BaseTreeModifier, "getSelector").returns({id: this.sLocalVariantManagementId});

			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			var bEnabled = this.oControlVariantPlugin.isVariantSwitchEnabled(this.oVariantManagementOverlay);
			assert.ok(bEnabled, "then variant switch is enabled for VariantManagement control");
		});

		QUnit.test("when isVariantDuplicateEnabled is called with VariantManagement overlay", function(assert) {
			assert.notOk(this.oControlVariantPlugin.isVariantDuplicateAvailable(this.oObjectPageLayoutOverlay), "then duplicate not enabled for a non VariantManagement control overlay with variantReference");
			assert.ok(this.oControlVariantPlugin.isVariantDuplicateAvailable(this.oVariantManagementOverlay), "then duplicate enabled for a VariantManagement control overlay withvariantReference");
			assert.notOk(this.oControlVariantPlugin.isVariantDuplicateAvailable(this.oLayoutOuterOverlay), "then duplicate not enabled for a non VariantManagement control overlay without variantReference");
		});

		QUnit.test("when isVariantDuplicateAvailable is called with VariantManagement overlay", function(assert) {
			var bAvailable = this.oControlVariantPlugin.isVariantDuplicateAvailable(this.oVariantManagementOverlay);
			assert.ok(bAvailable, "then variant duplicate is available for VariantManagement control");
		});

		QUnit.test("when isVariantRenameAvailable is called with VariantManagement overlay", function(assert) {
			var bAvailable = this.oControlVariantPlugin.isVariantRenameAvailable(this.oVariantManagementOverlay);
			assert.ok(bAvailable, "then variant rename is available for VariantManagement control");
		});

		QUnit.test("when isVariantRenameEnabled is called with VariantManagement overlay", function(assert) {
			var bAvailable = this.oControlVariantPlugin.isVariantRenameEnabled(this.oVariantManagementOverlay);
			assert.notOk(bAvailable, "then variant rename is not implemented yet");
		});

		QUnit.test("when isVariantDuplicateAvailable is called with VariantManagement overlay", function(assert) {
			var bAvailable = this.oControlVariantPlugin.isVariantDuplicateAvailable(this.oVariantManagementOverlay);
			assert.ok(bAvailable, "then variant duplicate is available for VariantManagement control");
		});

		QUnit.test("when isVariantDuplicateEnabled is called with VariantManagement overlay", function(assert) {
			var bAvailable = this.oControlVariantPlugin.isVariantDuplicateEnabled(this.oVariantManagementOverlay);
			assert.notOk(bAvailable, "then variant duplicate is not implemented yet");
		});

		QUnit.test("when isVariantConfigureAvailable is called with VariantManagement overlay", function(assert) {
			var bAvailable = this.oControlVariantPlugin.isVariantConfigureAvailable(this.oVariantManagementOverlay);
			assert.ok(bAvailable, "then variant configure is available for VariantManagement control");
		});

		QUnit.test("when isVariantConfigureEnabled is called with VariantManagement overlay", function(assert) {
			var bAvailable = this.oControlVariantPlugin.isVariantConfigureEnabled(this.oVariantManagementOverlay);
			assert.notOk(bAvailable, "then variant configure is not implemented yet");
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
			var oModelData = {};
			oModelData[this.sLocalVariantManagementId] = {
				variants: [
					{key: "variant1"},
					{key: "variant2"}
				]
			};
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			var oModel = new VariantModel(oModelData, {}),
				oMockedAppComponent = fnGetMockedAppComponent(oModel);
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
			sandbox.stub(oModel, "getCurrentVariantReference").returns(oModelData[this.sLocalVariantManagementId].variants[0]);
			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof ControlVariantDuplicate, "then a duplicate Variant event is received with a switch command");
				done();
			});
			this.oControlVariantPlugin.duplicateVariant(this.oVariantManagementOverlay);
		});

		QUnit.test("when renameVariant is called", function(assert) {
			assert.ok(this.oControlVariantPlugin.renameVariant, "then renameVariant added to the  ElementOverlay prototype");
		});

		QUnit.test("when duplicateVariant is called", function(assert) {
			assert.ok(this.oControlVariantPlugin.duplicateVariant, "then duplicateVariant added to the  ElementOverlay prototype");
		});

		QUnit.test("when configureVariants is called", function(assert) {
			assert.ok(this.oControlVariantPlugin.configureVariants, "then configureVariants added to the  ElementOverlay prototype");
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
			assert.ok(this.oButtonOverlay.getVariantManagement(), "varMgtKey", "then VariantManagement reference successfully propagated from ObjectPageLayout to Button (last element)");
			var oTestButton = new Button("testButton");
			this.oLayout.addContent(oTestButton);
			sap.ui.getCore().applyChanges();
			this.oDesignTime.attachEventOnce("synced", function() {
				var oTestButtonOverlay = OverlayRegistry.getOverlay(oTestButton);
				assert.equal(oTestButtonOverlay.getVariantManagement(), "varMgtKey", "then VariantManagement reference successfully set for newly inserted ElementOverlay from parent ElementOverlays");
				done();
			});
		});
	});