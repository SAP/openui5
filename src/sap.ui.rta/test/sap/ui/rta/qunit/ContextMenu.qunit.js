/*global QUnit sinon*/

(function() {
	"use strict";
	jQuery.sap.require("sap.ui.qunit.qunit-coverage");

	if (window.blanket){
		window.blanket.options("sap-ui-cover-only", "[sap/ui/rta,sap/ui/dt]");
	}
	jQuery.sap.require("sap.ui.thirdparty.sinon");

	jQuery.sap.require("sap.uxap.ObjectPageSection");
	jQuery.sap.require("sap.uxap.ObjectPageLayout");

	jQuery.sap.require("sap.ui.comp.smartform.GroupElement");
	jQuery.sap.require("sap.ui.comp.smartform.Group");
	jQuery.sap.require("sap.ui.comp.smartform.SmartForm");
	jQuery.sap.require("sap.ui.comp.smartfield.SmartField");
	jQuery.sap.require("sap.ui.rta.RuntimeAuthoring");
	jQuery.sap.require("sap.ui.dt.OverlayRegistry");
	jQuery.sap.require("sap.ui.rta.plugin.Settings");

	var oComp = sap.ui.getCore().createComponent({
		name : "sap.ui.rta.test",
		id : "Comp1",
		settings : {
			componentData : {
				"showAdaptButton" : true
			}
		}
	});

	var sandbox = sinon.sandbox.create();

	var oCompCont = new sap.ui.core.ComponentContainer({
		component: oComp
	}).placeAt("test-view");
	sap.ui.getCore().applyChanges();

	QUnit.module("Given RTA is started...", {
		beforeEach : function(assert) {
			this.oPage = sap.ui.getCore().byId("Comp1---idMain1--mainPage");
			this.oSmartForm = sap.ui.getCore().byId("Comp1---idMain1--MainForm");
			this.oGroup = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument");
			this.oBoundGroupElement = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.Name");
			this.oMandatoryGroupElement = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.Mandatory");
			this.oUnBoundGroupElement = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.UnboundButton");
			this.oMultipleFieldOneBoundGroupElement = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.BoundButton");
			this.oMultipleBoundFieldGroupElement = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.BoundButton35");
			this.oFieldInGroupWithoutStableId = sap.ui.getCore().byId("Comp1---idMain1--FieldInGroupWithoutStableId");

			var done = assert.async();

			this.oRta = new sap.ui.rta.RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});
			this.oRta.attachStart(function() {
				done();
			});
			this.oRta.start();
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when context menu is opened (via keyboard) for a sap.ui.comp.smartform.GroupElement,", function(assert) {
		var oGroupElementOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oBoundGroupElement);
		oGroupElementOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oGroupElementOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 5, " and 5 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id"), "CTX_RENAME_LABEL", "we can rename a label");
		assert.equal(oContextMenu.getItems()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
		assert.equal(oContextMenu.getItems()[2].data("id"), "CTX_REMOVE", "we can remove field");
		assert.equal(oContextMenu.getItems()[3].data("id"), "CTX_CUT", "we can cut field");
		assert.equal(oContextMenu.getItems()[4].data("id"), "CTX_PASTE", "we can paste field");
	});

	QUnit.test("when context menu is opened (via mouse) for a sap.ui.comp.smartform.Group,", function(assert) {
		var oGroupOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oGroup);

		sap.ui.test.qunit.triggerMouseEvent(oGroupOverlay.getDomRef(), "contextmenu");

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 6, " and 6 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id"), "CTX_RENAME_LABEL", "we can rename a group");
		assert.equal(oContextMenu.getItems()[1].data("id"), "CTX_ADD_ELEMENTS_AS_CHILD", "we can add field");
		assert.equal(oContextMenu.getItems()[2].data("id"), "CTX_CREATE_SIBLING_CONTAINER", "we can create group");
		assert.equal(oContextMenu.getItems()[3].data("id"), "CTX_REMOVE", "we can remove group");
		assert.equal(oContextMenu.getItems()[4].data("id"), "CTX_CUT", "we can cut group");
		assert.equal(oContextMenu.getItems()[5].data("id"), "CTX_PASTE", "we can paste group");
	});

	QUnit.test("when context menu is opened (via keyboard) for a sap.ui.comp.smartform.SmartForm,", function(assert) {
		var oFormOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oSmartForm);
		oFormOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFormOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 1, " and 1 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id"), "CTX_CREATE_CHILD_CONTAINER", "we can create group");
	});

	QUnit.test("when context menu is opened (via mouse) for a mandatory selected GroupElement,", function(assert) {
		var oGroupElementOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oMandatoryGroupElement);

		sap.ui.test.qunit.triggerMouseEvent(oGroupElementOverlay.getDomRef(), "contextmenu");

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 5, " and 5 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id"), "CTX_RENAME_LABEL", "we can rename a label");
		assert.equal(oContextMenu.getItems()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
		assert.equal(oContextMenu.getItems()[2].data("id"), "CTX_REMOVE", "we can remove field");
		assert.equal(oContextMenu.getItems()[3].data("id"), "CTX_CUT", "we can cut field");
		assert.equal(oContextMenu.getItems()[4].data("id"), "CTX_PASTE", "we can paste field");
	});

	QUnit.test("when context menu is opened on two selected GroupElements and both have bound fields,", function(assert) {
		var oGroupElementOverlay1 = sap.ui.dt.OverlayRegistry.getOverlay(this.oMandatoryGroupElement);
		var oGroupElementOverlay2 = sap.ui.dt.OverlayRegistry.getOverlay(this.oBoundGroupElement);

		this.oRta._oDesignTime.setSelectionMode(sap.ui.dt.SelectionMode.Multi);
		oGroupElementOverlay1.setSelected(true);
		oGroupElementOverlay2.setSelected(true);

		sap.ui.test.qunit.triggerMouseEvent(oGroupElementOverlay1.getDomRef(), "contextmenu");

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 6, " and 6 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id"), "CTX_RENAME_LABEL", "we can rename a label");
		assert.equal(oContextMenu.getItems()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
		assert.equal(oContextMenu.getItems()[2].data("id"), "CTX_REMOVE", "we can remove field");
		assert.equal(oContextMenu.getItems()[3].data("id"), "CTX_CUT", "we can cut groups");
		assert.equal(oContextMenu.getItems()[4].data("id"), "CTX_PASTE", "we can paste groups");
		assert.equal(oContextMenu.getItems()[5].data("id"), "CTX_GROUP_FIELDS", "we can group fields");
		assert.equal(oContextMenu.getItems()[0].getEnabled(), false, "we can not rename multiple fields");
	});

	QUnit.test("when context menu is opened on two selected GroupElements when one field has no binding,", function(assert) {
		var oGroupElementOverlay1 = sap.ui.dt.OverlayRegistry.getOverlay(this.oUnBoundGroupElement);
		var oGroupElementOverlay2 = sap.ui.dt.OverlayRegistry.getOverlay(this.oBoundGroupElement);

		this.oRta._oDesignTime.setSelectionMode(sap.ui.dt.SelectionMode.Multi);
		oGroupElementOverlay1.setSelected(true);
		oGroupElementOverlay2.setSelected(true);

		sap.ui.test.qunit.triggerMouseEvent(oGroupElementOverlay1.getDomRef(), "contextmenu");

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 6, " and 6 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id"), "CTX_RENAME_LABEL", "we can rename a label");
		assert.equal(oContextMenu.getItems()[1].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
		assert.equal(oContextMenu.getItems()[2].data("id"), "CTX_REMOVE", "we can remove field");
		assert.equal(oContextMenu.getItems()[3].data("id"), "CTX_CUT", "we can cut groups");
		assert.equal(oContextMenu.getItems()[4].data("id"), "CTX_PASTE", "we can paste groups");
		assert.equal(oContextMenu.getItems()[5].data("id"), "CTX_GROUP_FIELDS" , "group fields is there ");
		assert.equal(oContextMenu.getItems()[0].getEnabled(), false, "we can not rename multiple fields");
		assert.equal(oContextMenu.getItems()[5].getEnabled(), true, "we can group fields");
	});

	QUnit.test("when context menu is opened on GroupElement when two fields, one field has no binding,", function(assert) {
		var oGroupElementOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oMultipleFieldOneBoundGroupElement);

		sap.ui.test.qunit.triggerMouseEvent(oGroupElementOverlay.getDomRef(), "contextmenu");

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 6, " and 6 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id") , "CTX_RENAME_LABEL", "we can rename a label");
		assert.equal(oContextMenu.getItems()[1].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
		assert.equal(oContextMenu.getItems()[2].data("id") , "CTX_REMOVE", "we can remove field");
		assert.equal(oContextMenu.getItems()[3].data("id"), "CTX_CUT", "we can cut groups");
		assert.equal(oContextMenu.getItems()[4].data("id"), "CTX_PASTE", "we can paste groups");
		assert.equal(oContextMenu.getItems()[5].data("id") , "CTX_UNGROUP_FIELDS", "ungroup fields is there ");
		assert.equal(oContextMenu.getItems()[5].getEnabled(), true, "we can ungroup fields");

	});

	QUnit.test("when context menu is opened on GroupElement when two fields,", function(assert) {
		var oGroupElementOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oMultipleBoundFieldGroupElement);

		sap.ui.test.qunit.triggerMouseEvent(oGroupElementOverlay.getDomRef(), "contextmenu");

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 6, " and 6 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id") , "CTX_RENAME_LABEL", "we can rename a label");
		assert.equal(oContextMenu.getItems()[1].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
		assert.equal(oContextMenu.getItems()[2].data("id") , "CTX_REMOVE", "we can remove field");
		assert.equal(oContextMenu.getItems()[3].data("id"), "CTX_CUT", "we can cut groups");
		assert.equal(oContextMenu.getItems()[4].data("id"), "CTX_PASTE", "we can paste groups");
		assert.equal(oContextMenu.getItems()[5].data("id") , "CTX_UNGROUP_FIELDS", "ungroup fields is there ");
		assert.equal(oContextMenu.getItems()[5].getEnabled(), true, "we can ungroup fields");

	});

	QUnit.test("when context menu is opened on GroupElement with stable id, but the Group has no stable id,", function(assert) {
		var oGroupElementOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oFieldInGroupWithoutStableId);

		sap.ui.test.qunit.triggerMouseEvent(oGroupElementOverlay.getDomRef(), "contextmenu");

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 3, " and 3 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id") , "CTX_RENAME_LABEL", "rename is available");
		assert.equal(oContextMenu.getItems()[0].getEnabled(), true, "we can rename the field");
		assert.equal(oContextMenu.getItems()[1].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "add field is available");
		assert.equal(oContextMenu.getItems()[1].getEnabled(), false, "we cannot add a field");
		assert.equal(oContextMenu.getItems()[2].data("id") , "CTX_REMOVE", "remove field is available");
		// TODO: reactivate after Add action will be implemented
		// assert.equal(oContextMenu.getItems()[2].getEnabled(), false, "we cannot remove the field");

	});

	QUnit.test("when context menu is opened on a Control with a defined settings action,", function(assert) {
		var oSettings = this.oRta.getPlugins()["settings"];

		var oChangeRegistry = sap.ui.fl.registry.ChangeRegistry.getInstance();
		oChangeRegistry.registerControlsForChanges({
			"sap.ui.comp.smartform.Group" : {
			"changeSettings" : "sap/ui/fl/changeHandler/PropertyChange"
			}
		});

		var oGroupDesigntime = {
			settings : function() {
				return {
					changeType : "changeSettings",
					isEnabled : true,
					handler : function() {}
				};
			}
		};
		sandbox.stub(oSettings, "_getSettingsAction", function() {
			return oGroupDesigntime.settings();
		});
		var oGroupOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oGroup);
		oSettings.deregisterElementOverlay(oGroupOverlay);
		oSettings.registerElementOverlay(oGroupOverlay);

		oGroupOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oGroupOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems()[oContextMenu.getItems().length - 1].data("id"), "CTX_SETTINGS", "and Settings is available");
	});

	QUnit.test("when context menu is opened (via keyboard) for a sap.m.Page without title,", function(assert) {
		this.oPage._headerTitle.destroy();
		this.oPage._headerTitle = null;
		var oPageOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oPage);
		oPageOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oPageOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 1, " and 1 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id"), "CTX_RENAME_LABEL", "rename Page is available");
		assert.equal(oContextMenu.getItems()[0].getEnabled(), false, "but rename Page is disabled");
	});

	QUnit.module("Given RTA is started for Object Page...", {
		beforeEach : function(assert) {
			var oEmbeddedView = sap.ui.getCore().byId("Comp1---idMain1");

			this.oSubSection = new sap.uxap.ObjectPageSubSection({
				id : oEmbeddedView.createId("subsection1"),
				blocks: [new sap.m.Button({text: "abc"})]
			});

			this.oObjectPageSection1 = new sap.uxap.ObjectPageSection({
				id : oEmbeddedView.createId("section1"),
				title: "Section_1",
				visible : true,
				subSections: [this.oSubSection]
			});

			this.oObjectPageSection2 = new sap.uxap.ObjectPageSection({
				id : oEmbeddedView.createId("section2"),
				title: "Section_2",
				visible : false
			});

			this.oObjectPageSection3 = new sap.uxap.ObjectPageSection({
				id : oEmbeddedView.createId("section3"),
				title: "Section_3",
				visible : true
			});

			var oEmbeddedPage = sap.ui.getCore().byId("Comp1---idMain1--mainPage");

			this.oObjectPageLayout = new sap.uxap.ObjectPageLayout({
				id : oEmbeddedView.createId("ObjectPageLayout"),
				sections : [
					this.oObjectPageSection1,
					this.oObjectPageSection2,
					this.oObjectPageSection3
				]
			});
			oEmbeddedPage.addContent(this.oObjectPageLayout);
			sap.ui.getCore().applyChanges();

			var done = assert.async();

			this.oRta = new sap.ui.rta.RuntimeAuthoring({
				rootControl : this.oObjectPageLayout
			});
			this.oRta.attachStart(function() {
				done();
			});
			this.oRta.start();
		},
		afterEach : function(assert) {
			this.oObjectPageLayout.destroy();
			this.oRta.destroy();
		}
	});

	QUnit.test("when context menu is opened on ObjectPageSection", function(assert) {
		var oOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oObjectPageSection1);

		this.oRta.getPlugins()["contextMenu"].open({ pageX: 0, pageY: 0 }, oOverlay);

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 4, " and 4 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "add section is available");
		assert.equal(oContextMenu.getItems()[0].getEnabled(), true, "add section is enabled");
		assert.equal(oContextMenu.getItems()[1].data("id") , "CTX_REMOVE", "remove section is available");
		assert.equal(oContextMenu.getItems()[1].getEnabled(), true, "we can remove a section");
		assert.equal(oContextMenu.getItems()[2].data("id") , "CTX_CUT", "cut sections available");
		assert.equal(oContextMenu.getItems()[2].getEnabled(), false, "cut is not enabled");
		assert.equal(oContextMenu.getItems()[3].data("id") , "CTX_PASTE", "paste is available");
		assert.equal(oContextMenu.getItems()[3].getEnabled(), false, "we cannot paste a section");
	});

	QUnit.module("Given RTA is started for Object Page without stable ids...", {
		beforeEach : function(assert) {

			this.oSubSection = new sap.uxap.ObjectPageSubSection({
				id : "subsection1",
				blocks: [new sap.m.Button({text: "abc"})]
			});

			this.oObjectPageSection1 = new sap.uxap.ObjectPageSection({
				id : "section1",
				title: "Section_1",
				visible : true,
				subSections: [this.oSubSection]
			});

			this.oObjectPageSection2 = new sap.uxap.ObjectPageSection({
				id : "section2",
				title: "Section_2",
				visible : false
			});

			this.oObjectPageSection3 = new sap.uxap.ObjectPageSection({
				id : "section3",
				title: "Section_3",
				visible : true
			});

			this.oObjectPageLayout = new sap.uxap.ObjectPageLayout({
				sections : [
					this.oObjectPageSection1,
					this.oObjectPageSection2,
					this.oObjectPageSection3
				]
			});
			this.oObjectPageLayout.placeAt("test-view");
			sap.ui.getCore().applyChanges();

			var done = assert.async();

			this.oRta = new sap.ui.rta.RuntimeAuthoring({
				rootControl : this.oObjectPageLayout
			});
			this.oRta.attachStart(function() {
				done();
			});

			this.oRta.start();
		},
		afterEach : function(assert) {
			this.oObjectPageLayout.destroy();
			this.oRta.destroy();
		}
	});

	QUnit.test("when context menu is opened on ObjectPageSection", function(assert) {
		var oOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oObjectPageSection1);

		this.oRta.getPlugins()["contextMenu"].open({ pageX: 0, pageY: 0 }, oOverlay);

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 2, " and 4 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "add section is available");
		assert.equal(oContextMenu.getItems()[0].getEnabled(), false, "add section is disabled");
		assert.equal(oContextMenu.getItems()[1].data("id") , "CTX_REMOVE", "remove section is available");
		// TODO: reactivate after Add action will be implemented
		// assert.equal(oContextMenu.getItems()[1].getEnabled(), false, "we cannot remove a section");
	});

	QUnit.module("Given RTA is started for Object Page...", {
		beforeEach : function(assert) {
			var oEmbeddedView = sap.ui.getCore().byId("Comp1---idMain1");

			this.oObjectPageSection1 = new sap.uxap.ObjectPageSection({
				title: "Section_1",
				visible : false
			});

			var oEmbeddedPage = sap.ui.getCore().byId("Comp1---idMain1--mainPage");

			this.oObjectPageLayout = new sap.uxap.ObjectPageLayout({
				id : oEmbeddedView.createId("ObjectPageLayout"),
				sections : [
					this.oObjectPageSection1
				]
			});

			var oPage = new sap.m.Page({
				id: oEmbeddedView.createId("Page")
			});
			oPage.addContent(this.oObjectPageLayout);
			oEmbeddedPage.addContent(oPage);
			sap.ui.getCore().applyChanges();

			var done = assert.async();

			this.oRta = new sap.ui.rta.RuntimeAuthoring({
				rootControl : oPage
			});
			this.oRta.attachStart(function() {
				done();
			});
			this.oRta.start();
		},
		afterEach : function(assert) {
			this.oObjectPageLayout.destroy();
			this.oRta.destroy();
		}
	});

	QUnit.test("when context menu is opened on ObjectPageLayout, and the Section has an unstable ID and is hidden, ", function(assert) {
		var oOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oObjectPageLayout);

		this.oRta.getPlugins()["contextMenu"].open({ pageX: 0, pageY: 0 }, oOverlay);

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then the context menu opens");
		assert.equal(oContextMenu.getItems().length, 2, " and only 2 Menu Items are available, add section is not available");
		assert.equal(oContextMenu.getItems()[0].data("id"), "CTX_CUT", "cut field is available");
		assert.equal(oContextMenu.getItems()[1].data("id"), "CTX_PASTE", "paste field is available");
	});

	QUnit.module("Given RTA is started...", {
		beforeEach : function(assert) {
			this.oSimpleFormWithTitles = sap.ui.getCore().byId("Comp1---idMain1--SimpleForm");
			this.oSimpleFormWithToolbars = sap.ui.getCore().byId("Comp1---idMain1--SimpleFormWithToolbars");

			var done = assert.async();

			this.oRta = new sap.ui.rta.RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});
			this.oRta.attachStart(function() {
				done();
			});
			this.oRta.start();
		},
		afterEach : function(assert) {
			this.oRta.destroy();
		}
	});

	QUnit.test("when context menu is opened (via keyboard) for a SimpleForm FormElement,", function(assert) {
		var done = assert.async();
		var oLabel = this.oSimpleFormWithTitles.getContent()[3];
		var oFormElement = oLabel.getParent();
		var oFormElementOverlay = sap.ui.dt.OverlayRegistry.getOverlay(oFormElement);
		var oContextMenuPlugin = this.oRta.getPlugins()["contextMenu"];

		oContextMenuPlugin.attachOpenedContextMenu(function(oEvent) {
			var oContextMenu = oContextMenuPlugin._oContextMenuControl;
			assert.ok(oContextMenu.bOpen, "then Menu gets opened");
			assert.equal(oContextMenu.getItems().length, 5, " and 5 Menu Items are available");
			assert.equal(oContextMenu.getItems()[0].data("id"), "CTX_RENAME_LABEL", "rename label is available");
			assert.equal(oContextMenu.getItems()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field is available");
			assert.equal(oContextMenu.getItems()[2].data("id"), "CTX_REMOVE", "remove field is available");
			assert.equal(oContextMenu.getItems()[3].data("id"), "CTX_CUT", "cut field is available");
			assert.equal(oContextMenu.getItems()[4].data("id"), "CTX_PASTE", "paste field is available");
			done();
		});

		oFormElementOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFormElementOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

	});

	QUnit.test("when context menu is opened (via keyboard) for a SimpleForm with Title,", function(assert) {
		var oForm = this.oSimpleFormWithTitles.getAggregation("form");

		var oFormOverlay = sap.ui.dt.OverlayRegistry.getOverlay(oForm);
		oFormOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFormOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 1, " and 1 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id"), "CTX_CREATE_CHILD_CONTAINER", "create group is available");
	});

	QUnit.test("when context menu is opened (via keyboard) for a SimpleForm with Title,", function(assert) {
		var oTitle = this.oSimpleFormWithTitles.getContent()[0];
		var oFormContainer = oTitle.getParent();

		var oFormContainerOverlay = sap.ui.dt.OverlayRegistry.getOverlay(oFormContainer);
		oFormContainerOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFormContainerOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 6, " and 6 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id"), "CTX_RENAME_LABEL", "rename title is available");
		assert.equal(oContextMenu.getItems()[0].getEnabled(), true, "and rename title is enabled");
		assert.equal(oContextMenu.getItems()[1].data("id"), "CTX_ADD_ELEMENTS_AS_CHILD", "add field is available");
		assert.equal(oContextMenu.getItems()[2].data("id"), "CTX_CREATE_SIBLING_CONTAINER", "create group is available");
		assert.equal(oContextMenu.getItems()[3].data("id"), "CTX_REMOVE", "remove group is available");
		assert.equal(oContextMenu.getItems()[4].data("id"), "CTX_CUT", "cut field is available");
		assert.equal(oContextMenu.getItems()[5].data("id"), "CTX_PASTE", "paste field is available");
	});

	QUnit.test("when context menu is opened (via keyboard) for a SimpleForm FormContainer with Toolbar,", function(assert) {
		var oToolbar = this.oSimpleFormWithToolbars.getContent()[0];
		var oFormContainer = oToolbar.getParent();

		var oFormContainerOverlay = sap.ui.dt.OverlayRegistry.getOverlay(oFormContainer);
		oFormContainerOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFormContainerOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenu = this.oRta.getPlugins()["contextMenu"]._oContextMenuControl;
		assert.ok(oContextMenu.bOpen, "then Menu gets opened");
		assert.equal(oContextMenu.getItems().length, 6, " and 6 Menu Items are available");
		assert.equal(oContextMenu.getItems()[0].data("id"), "CTX_RENAME_LABEL", "rename toolbar is available");
		assert.equal(oContextMenu.getItems()[0].getEnabled(), false, "but rename toolbar is disabled");
		assert.equal(oContextMenu.getItems()[1].data("id"), "CTX_ADD_ELEMENTS_AS_CHILD", "add field is available");
		assert.equal(oContextMenu.getItems()[2].data("id"), "CTX_CREATE_SIBLING_CONTAINER", "create group is available");
		assert.equal(oContextMenu.getItems()[2].getEnabled(), false, "but creating group is disabled");
		assert.equal(oContextMenu.getItems()[3].data("id"), "CTX_REMOVE", "remove group is available");
		assert.equal(oContextMenu.getItems()[4].data("id"), "CTX_CUT", "cut field is available");
		assert.equal(oContextMenu.getItems()[5].data("id"), "CTX_PASTE", "paste field is available");
	});

	QUnit.done(function( details ) {
		oCompCont.getComponentInstance().destroy();
		if (details.failed === 0){
			jQuery("#test-view").hide();
		}
	});
})();
