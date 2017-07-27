/* global QUnit sinon */

QUnit.config.autostart = false;

jQuery.sap.require("sap.ui.qunit.qunit-coverage");
jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

sap.ui.define([ "sap/ui/fl/Utils",
		"sap/ui/layout/VerticalLayout",
		"sap/ui/dt/DesignTime",
		"sap/ui/rta/command/CommandFactory",
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
		"sap/m/Page"],
	function(Utils, VerticalLayout, DesignTime, CommandFactory, OverlayRegistry, ElementOverlay, ChangeRegistry, FormContainer, Form, FormLayout, ControlVariantPlugin, Title, Button, ObjectPageLayout, ObjectPageSection, ObjectPageSubSection, Page) {
		"use strict";

		QUnit.start();

		var sandbox = sinon.sandbox.create();

		ObjectPageLayout.prototype.variantManagement;
		ObjectPageLayout.prototype.getVariantManagement = function () { return this.variantManagement; };
		ObjectPageLayout.prototype.setVariantManagement = function (sVarMgmt) { this.variantManagement = sVarMgmt; };

		QUnit.module("Given a designTime and ControlVariant plugin are instantiated", {
			beforeEach: function (assert) {
				var done = assert.async();
				var oChangeRegistry = ChangeRegistry.getInstance();
				oChangeRegistry.registerControlsForChanges({
					"sap.ui.layout.VerticalLayout" : {
						"moveControls": "default"
					}
				});

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

				this.oObjectPageLayout = new ObjectPageLayout("objPage",{
					sections : [this.oObjectPageSection]
				});

				this.oObjectPageLayout.setVariantManagement("varMgtKey");

				this.oLayoutOuter = new VerticalLayout("verlayouter", {
					content: [this.oObjectPageLayout]
				});

				this.oPage = new Page("mainPage", {
					content: [this.oLayoutOuter, this.oObjectPageLayout]
				}).placeAt("content");

				this.oDesignTime = new DesignTime({
					rootElements : [this.oPage]
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oObjectPageLayoutOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout);
					this.oObjectPageSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection);
					this.oObjectPageSubSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSubSection);
					this.oLayoutOuterOverlay = OverlayRegistry.getOverlay(this.oLayoutOuter);
					this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
					done();
				}.bind(this));

				sap.ui.getCore().applyChanges();

				this.oControlVariantPlugin = new ControlVariantPlugin();
			},
			afterEach: function (assert) {
				sandbox.restore();
				this.oPage.destroy();
				this.oDesignTime.destroy();
			}
		});

		QUnit.test("when registerElementOverlay is called", function(assert) {
			assert.ok(ElementOverlay.prototype.getVariantManagement, "then getVariantManagement added to the  ElementOverlay prototype");
			assert.ok(ElementOverlay.prototype.setVariantManagement, "then setVariantManagement added to the ElementOverlay prototype");
		});

		QUnit.test("when registerElementOverlay is called with an ElementOverlay of a control having variantManagement as property", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oObjectPageLayoutOverlay);
			assert.ok(this.oObjectPageLayoutOverlay.getVariantManagement(), "varMgtKey", "then Variant Management Key successfully set to ObjectPageLayout Overlay");
		});

		QUnit.test("when registerElementOverlay is called with an ElementOverlays which are not contained in an ObjectPageLayout", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oLayoutOuterOverlay);
			assert.notOk(this.oLayoutOuterOverlay.getVariantManagement(), "then no VariantManagement Key set to this overlay");
		});

		QUnit.test("when registerElementOverlay is called with an ElementOverlay whose parentElementOverlay has a variantMangement key set", function(assert) {

			sandbox.stub(this.oObjectPageLayoutOverlay, "getVariantManagement").returns("varMgtKeyStubbed");
			this.oControlVariantPlugin.registerElementOverlay(this.oObjectPageSectionOverlay);
			this.oControlVariantPlugin.registerElementOverlay(this.oObjectPageSubSectionOverlay);

			assert.ok(this.oObjectPageSectionOverlay.getVariantManagement(), "varMgtKeyStubbed", "then Variant Management Key successfully set to ObjectPageSection (first child) Overlay");
			assert.ok(this.oObjectPageSubSectionOverlay.getVariantManagement(), "varMgtKeyStubbed", "then Variant Management Key successfully set to ObjectPageSubSection (second child) Overlay");
		});

		//Integration Test
		QUnit.test("when ControlVariant Plugin is added to designTime", function(assert) {
			assert.notOk(this.oButtonOverlay.getVariantManagement(), "then Variant Management Key is initially undefined");
			this.oDesignTime.addPlugin(this.oControlVariantPlugin);
			sap.ui.getCore().applyChanges();
			assert.ok(this.oButtonOverlay.getVariantManagement(), "varMgtKey", "then Variant Management Key successfully propagated from ObjectPageLayout to Button (last element)");
		});
	});