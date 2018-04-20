/* global QUnit sinon */

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/core/ComponentContainer',
	'sap/uxap/ObjectPageSection',
	'sap/uxap/ObjectPageSubSection',
	'sap/uxap/ObjectPageLayout',
	'sap/ui/comp/smartform/GroupElement',
	'sap/ui/comp/smartform/Group',
	'sap/ui/comp/smartform/SmartForm',
	'sap/ui/comp/smartfield/SmartField',
	'sap/ui/rta/RuntimeAuthoring',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/SelectionMode',
	'sap/ui/rta/plugin/Settings',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/m/Page',
	'sap/m/Button',
	'sap/ui/dt/DesignTime'
],
function(
	ComponentContainer,
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageLayout,
	GroupElement,
	Group,
	SmartForm,
	SmartField,
	RuntimeAuthoring,
	OverlayRegistry,
	SelectionMode,
	Settings,
	ChangeRegistry,
	Page,
	Button,
	DesignTime
) {
	"use strict";

	QUnit.start();

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

	var oCompCont = new ComponentContainer({
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

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(fnResolve);
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when context menu is opened (via keyboard) for a sap.ui.comp.smartform.GroupElement,", function(assert) {
		var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);
		oGroupElementOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oGroupElementOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 5, " and 5 Menu Buttons are available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
		assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
		assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
		assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut field");
		assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste field");
	});

	QUnit.test("when context menu is opened (via mouse) for a sap.ui.comp.smartform.Group,", function(assert) {
		var oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);

		sap.ui.test.qunit.triggerMouseEvent(oGroupOverlay.getDomRef(), "contextmenu");

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 6, " and 6 Menu Buttons are available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a group");
		assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_CHILD", "we can add field");
		assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_CREATE_SIBLING_CONTAINER", "we can create group");
		assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_REMOVE", "we can remove group");
		assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_CUT", "we can cut group");
		assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_PASTE", "we can paste group");
	});

	QUnit.test("when context menu (context menu) is opened (via keyboard) for a sap.ui.comp.smartform.SmartForm,", function(assert) {
		var oFormOverlay = OverlayRegistry.getOverlay(this.oSmartForm);
		oFormOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFormOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 2, " and 2 Menu Buttons are available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_CREATE_CHILD_CONTAINER", "we can create group");
		assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_PASTE", "we can paste a group");
	});

	QUnit.test("when context menu (context menu) is opened (via mouse) for a mandatory selected GroupElement,", function(assert) {
		var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oMandatoryGroupElement);

		sap.ui.test.qunit.triggerMouseEvent(oGroupElementOverlay.getDomRef(), "contextmenu");

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 5, " and 5 Menu Buttons are available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
		assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
		assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
		assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut field");
		assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste field");
	});

	QUnit.test("when context menu (context menu) is opened on two selected GroupElements and both have bound fields,", function(assert) {
		var oGroupElementOverlay1 = OverlayRegistry.getOverlay(this.oMandatoryGroupElement);
		var oGroupElementOverlay2 = OverlayRegistry.getOverlay(this.oBoundGroupElement);

		this.oRta._oDesignTime.setSelectionMode(sap.ui.dt.SelectionMode.Multi);
		oGroupElementOverlay1.setSelected(true);
		oGroupElementOverlay2.setSelected(true);

		sap.ui.test.qunit.triggerMouseEvent(oGroupElementOverlay1.getDomRef(), "contextmenu");

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 6, " and 6 Menu Buttons are available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
		assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
		assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
		assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
		assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
		assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_GROUP_FIELDS", "we can group fields");
		assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "we can not rename multiple fields");
	});

	QUnit.test("when context menu (context menu) is opened on two selected GroupElements when one field has no binding,", function(assert) {
		var oGroupElementOverlay1 = OverlayRegistry.getOverlay(this.oUnBoundGroupElement);
		var oGroupElementOverlay2 = OverlayRegistry.getOverlay(this.oBoundGroupElement);

		this.oRta._oDesignTime.setSelectionMode(SelectionMode.Multi);
		oGroupElementOverlay1.setSelected(true);
		oGroupElementOverlay2.setSelected(true);

		sap.ui.test.qunit.triggerMouseEvent(oGroupElementOverlay1.getDomRef(), "contextmenu");

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 6, " and 6 Menu Buttons are available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
		assert.equal(oContextMenuControl.getButtons()[1].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
		assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
		assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
		assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
		assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_GROUP_FIELDS" , "group fields is there ");
		assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "we can not rename multiple fields");
		assert.equal(oContextMenuControl.getButtons()[5].getEnabled(), true, "we can group fields");
	});

	QUnit.test("when context menu (context menu) is opened on GroupElement when two fields, one field has no binding,", function(assert) {
		var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oMultipleFieldOneBoundGroupElement);

		sap.ui.test.qunit.triggerMouseEvent(oGroupElementOverlay.getDomRef(), "contextmenu");

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 6, " and 6 Menu Buttons are available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id") , "CTX_RENAME", "we can rename a label");
		assert.equal(oContextMenuControl.getButtons()[1].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
		assert.equal(oContextMenuControl.getButtons()[2].data("id") , "CTX_REMOVE", "we can remove field");
		assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
		assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
		assert.equal(oContextMenuControl.getButtons()[5].data("id") , "CTX_UNGROUP_FIELDS", "ungroup fields is there ");
		assert.equal(oContextMenuControl.getButtons()[5].getEnabled(), true, "we can ungroup fields");

	});

	QUnit.test("when context menu (context menu) is opened on GroupElement when two fields,", function(assert) {
		var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oMultipleBoundFieldGroupElement);

		sap.ui.test.qunit.triggerMouseEvent(oGroupElementOverlay.getDomRef(), "contextmenu");

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 6, " and 6 Menu Buttons are available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id") , "CTX_RENAME", "we can rename a label");
		assert.equal(oContextMenuControl.getButtons()[1].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
		assert.equal(oContextMenuControl.getButtons()[2].data("id") , "CTX_REMOVE", "we can remove field");
		assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
		assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
		assert.equal(oContextMenuControl.getButtons()[5].data("id") , "CTX_UNGROUP_FIELDS", "ungroup fields is there ");
		assert.equal(oContextMenuControl.getButtons()[5].getEnabled(), true, "we can ungroup fields");

	});

	QUnit.test("when context menu (context menu) is opened on GroupElement with stable id, but the Group has no stable id,", function(assert) {
		var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oFieldInGroupWithoutStableId);

		sap.ui.test.qunit.triggerMouseEvent(oGroupElementOverlay.getDomRef(), "contextmenu");

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 3, " and 3 Menu Buttons are available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id") , "CTX_RENAME", "rename is available");
		assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "and rename is enabled");
		assert.equal(oContextMenuControl.getButtons()[1].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "add field is available");
		assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), false, "but add field is disabled");
		assert.equal(oContextMenuControl.getButtons()[2].data("id") , "CTX_REMOVE", "remove field is available");
		// TODO: reactivate after Add action will be implemented
		// // assert.equal(oContextMenuControl.getButtons()[2].getEnabled(), false, "we cannot remove the field");
	});

	QUnit.test("when context menu (context menu) is opened on a Control with a defined settings action,", function(assert) {
		var oSettings = this.oRta.getPlugins()["settings"];

		var oChangeRegistry = ChangeRegistry.getInstance();
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
		sandbox.stub(oSettings, "getAction", function() {
			return oGroupDesigntime.settings();
		});
		var oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);
		oSettings.deregisterElementOverlay(oGroupOverlay);
		oSettings.registerElementOverlay(oGroupOverlay);

		oGroupOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oGroupOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons()[oContextMenuControl.getButtons().length - 1].data("id"), "CTX_SETTINGS", "and Settings is available");
	});

	QUnit.test("when context menu (context menu) is opened (via keyboard) for a sap.m.Page without title,", function(assert) {
		this.oPage._headerTitle.destroy();
		this.oPage._headerTitle = null;
		var oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
		oPageOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oPageOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 1, " and 1 Menu Button is available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename Page is available");
		assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "but rename Page is disabled");
	});

	QUnit.module("Given RTA is started for Object Page...", {
		beforeEach : function(assert) {
			var oEmbeddedView = sap.ui.getCore().byId("Comp1---idMain1");

			var oSubSection = new ObjectPageSubSection({
				id : oEmbeddedView.createId("subsection1"),
				blocks: [new sap.m.Button({text: "abc"})]
			});

			this.oObjectPageSection1 = new ObjectPageSection({
				id : oEmbeddedView.createId("section1"),
				title: "Section_1",
				visible : true,
				subSections: [oSubSection]
			});

			var oObjectPageSection2 = new ObjectPageSection({
				id : oEmbeddedView.createId("section2"),
				title: "Section_2",
				visible : false
			});

			var oObjectPageSection3 = new ObjectPageSection({
				id : oEmbeddedView.createId("section3"),
				title: "Section_3",
				visible : true
			});

			var oEmbeddedPage = sap.ui.getCore().byId("Comp1---idMain1--mainPage");

			this.oObjectPageLayout = new ObjectPageLayout({
				id : oEmbeddedView.createId("ObjectPageLayout"),
				sections : [
					this.oObjectPageSection1,
					oObjectPageSection2,
					oObjectPageSection3
				]
			});
			oEmbeddedPage.addContent(this.oObjectPageLayout);
			sap.ui.getCore().applyChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl : this.oObjectPageLayout
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(fnResolve);
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach : function(assert) {
			this.oObjectPageLayout.destroy();
			this.oRta.destroy();
		}
	});

	QUnit.test("when context menu (context menu) is opened on ObjectPageSection", function(assert) {
		var oOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection1);

		sap.ui.test.qunit.triggerMouseEvent(oOverlay.getDomRef(), "contextmenu");

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 5, " and 5 Menu Buttons are available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id") , "CTX_RENAME", "rename section is available");
		assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "rename section is enabled");
		assert.equal(oContextMenuControl.getButtons()[1].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "add section is available");
		assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), true, "add section is enabled");
		assert.equal(oContextMenuControl.getButtons()[2].data("id") , "CTX_REMOVE", "remove section is available");
		assert.equal(oContextMenuControl.getButtons()[2].getEnabled(), true, "we can remove a section");
		assert.equal(oContextMenuControl.getButtons()[3].data("id") , "CTX_CUT", "cut sections available");
		assert.equal(oContextMenuControl.getButtons()[3].getEnabled(), true, "cut is enabled");
		assert.equal(oContextMenuControl.getButtons()[4].data("id") , "CTX_PASTE", "paste is available");
		assert.equal(oContextMenuControl.getButtons()[4].getEnabled(), false, "we cannot paste a section");
	});

	QUnit.module("Given RTA is started for Object Page without stable ids...", {
		beforeEach : function(assert) {

			var oSubSection = new ObjectPageSubSection({
				id : "subsection1",
				blocks: [new Button({text: "abc"})]
			});

			this.oObjectPageSection1 = new ObjectPageSection({
				id : "section1",
				title: "Section_1",
				visible : true,
				subSections: [oSubSection]
			});

			var oObjectPageSection2 = new ObjectPageSection({
				id : "section2",
				title: "Section_2",
				visible : false
			});

			var oObjectPageSection3 = new ObjectPageSection({
				id : "section3",
				title: "Section_3",
				visible : true
			});

			this.oObjectPageLayout = new ObjectPageLayout({
				sections : [
					this.oObjectPageSection1,
					oObjectPageSection2,
					oObjectPageSection3
				]
			});
			this.oObjectPageLayout.placeAt("test-view");
			sap.ui.getCore().applyChanges();

			sandbox.stub(RuntimeAuthoring.prototype, '_checkChangesExist', function () {
				return Promise.resolve(false);
			});

			this.oRta = new RuntimeAuthoring({
				rootControl : this.oObjectPageLayout
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(fnResolve);
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach : function(assert) {
			this.oObjectPageLayout.destroy();
			this.oRta.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when context menu (context menu) is opened on ObjectPageSection", function(assert) {
		var oOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection1);

		sap.ui.test.qunit.triggerMouseEvent(oOverlay.getDomRef(), "contextmenu");

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 4, " and 4 Menu Buttons are available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id") , "CTX_RENAME", "rename section is available");
		assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "add section is enabled");
		assert.equal(oContextMenuControl.getButtons()[1].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "add section is available");
		assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), false, "add section is disabled");
		assert.equal(oContextMenuControl.getButtons()[2].data("id") , "CTX_REMOVE", "remove section is available");
		assert.equal(oContextMenuControl.getButtons()[2].getEnabled(), true, "we cannot remove a section");
		assert.equal(oContextMenuControl.getButtons()[3].data("id") , "CTX_PASTE", "paste section is available");
		assert.equal(oContextMenuControl.getButtons()[3].getEnabled(), false, "we cannot paste a section, as no cut has been triggered");
	});

	QUnit.module("Given RTA is started for Object Page...", {
		beforeEach : function(assert) {
			var oEmbeddedView = sap.ui.getCore().byId("Comp1---idMain1");

			this.oObjectPageSection1 = new ObjectPageSection({
				title: "Section_1",
				visible : false
			});

			var oEmbeddedPage = sap.ui.getCore().byId("Comp1---idMain1--mainPage");

			this.oObjectPageLayout = new ObjectPageLayout({
				id : oEmbeddedView.createId("ObjectPageLayout"),
				sections : [
					this.oObjectPageSection1
				]
			});

			var oPage = new Page({
				id: oEmbeddedView.createId("Page")
			});
			oPage.addContent(this.oObjectPageLayout);
			oEmbeddedPage.addContent(oPage);
			sap.ui.getCore().applyChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl : oPage
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(fnResolve);
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach : function(assert) {
			this.oObjectPageLayout.destroy();
			this.oRta.destroy();
		}
	});

	QUnit.test("when context menu (context menu) is opened on ObjectPageLayout, and the Section has an unstable ID and is hidden, ", function(assert) {
		var oOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout);

		this.oRta.getPlugins()["contextMenu"].open({ pageX: 0, pageY: 0 }, oOverlay);

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then the context menu (context menu) opens");
		assert.equal(oContextMenuControl.getButtons().length, 1, " and only one Menu Button is available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_PASTE", "only paste menu Button is available, no possibility to add a section");
	});

	QUnit.module("Given RTA is started...", {
		beforeEach : function(assert) {
			this.oSimpleFormWithTitles = sap.ui.getCore().byId("Comp1---idMain1--SimpleForm");
			this.oSimpleFormWithToolbars = sap.ui.getCore().byId("Comp1---idMain1--SimpleFormWithToolbars");

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(fnResolve);
				}.bind(this)),
				this.oRta.start()
			]);
		},
		afterEach : function(assert) {
			this.oRta.destroy();
		}
	});

	QUnit.test("when context menu (context menu) is opened (via keyboard) for a SimpleForm FormElement,", function(assert) {
		var done = assert.async();
		var oLabel = this.oSimpleFormWithTitles.getContent()[3];
		var oFormElement = oLabel.getParent();
		var oFormElementOverlay = OverlayRegistry.getOverlay(oFormElement);
		var oContextMenuPlugin = this.oRta.getPlugins()["contextMenu"];

		oContextMenuPlugin.attachOpenedContextMenu(function(oEvent) {
			var oContextMenuControl = oContextMenuPlugin.oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
			assert.equal(oContextMenuControl.getButtons().length, 5, " and 5 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename label is available");
			assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field is available");
			assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "remove field is available");
			assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "cut field is available");
			assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "paste field is available");
			done();
		});

		oFormElementOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFormElementOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

	});

	QUnit.test("when context menu (context menu) is opened (via keyboard) for a SimpleForm with Title,", function(assert) {
		var oForm = this.oSimpleFormWithTitles.getAggregation("form");

		var oFormOverlay = OverlayRegistry.getOverlay(oForm);
		oFormOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFormOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 1, " and 1 Menu Button is available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_CREATE_CHILD_CONTAINER", "create group is available");
	});

	QUnit.test("when context menu (context menu) is opened (via keyboard) for a SimpleForm with Title,", function(assert) {
		var oTitle = this.oSimpleFormWithTitles.getContent()[0];
		var oFormContainer = oTitle.getParent();

		var oFormContainerOverlay = OverlayRegistry.getOverlay(oFormContainer);
		oFormContainerOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFormContainerOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 6, " and 6 Menu Buttons are available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename title is available");
		assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "and rename title is enabled");
		assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_CHILD", "add field is available");
		assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_CREATE_SIBLING_CONTAINER", "create group is available");
		assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_REMOVE", "remove group is available");
		assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_CUT", "cut field is available");
		assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_PASTE", "paste field is available");
	});

	QUnit.test("when context menu (context menu) is opened (via keyboard) for a SimpleForm FormContainer with Toolbar,", function(assert) {
		var oToolbar = this.oSimpleFormWithToolbars.getContent()[0];
		var oFormContainer = oToolbar.getParent();

		var oFormContainerOverlay = OverlayRegistry.getOverlay(oFormContainer);
		oFormContainerOverlay.focus();
		sap.ui.test.qunit.triggerKeydown(oFormContainerOverlay.getDomRef(), jQuery.sap.KeyCodes.F10, true, false, false);

		var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
		assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
		assert.equal(oContextMenuControl.getButtons().length, 6, " and 6 Menu Buttons are available");
		assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename toolbar is available");
		assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "but rename toolbar is disabled");
		assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_CHILD", "add field is available");
		assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_CREATE_SIBLING_CONTAINER", "create group is available");
		assert.equal(oContextMenuControl.getButtons()[2].getEnabled(), false, "but creating group is disabled");
		assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_REMOVE", "remove group is available");
		assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_CUT", "cut field is available");
		assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_PASTE", "paste field is available");
	});

	QUnit.test("when an Button on the context menu (context menu) is selected,", function(assert){
		var done = assert.async();
		var oForm = this.oSimpleFormWithTitles.getAggregation("form");
		var oFormOverlay = OverlayRegistry.getOverlay(oForm);

		var oContextMenuPlugin = this.oRta.getPlugins()["contextMenu"];

		sandbox.stub(oContextMenuPlugin.getDesignTime(), "getSelection").returns([oFormOverlay]);
		var oEvent = {
			data : function(sDataParamName){
				var oItemData = {
					id : "CTX_TEST"
				};
				return oItemData[sDataParamName];
			},
			getSubmenu : function(){
				return false;
			}
		};

		oContextMenuPlugin._aMenuItems = [{
			menuItem : {
				id : "CTX_TEST",
				handler : function(){
					assert.ok("Then the handler for the Button is called");
					done();
				}
			}
		}];
		oContextMenuPlugin._onItemSelected(oEvent);
	});

	QUnit.done(function( details ) {
		oCompCont.getComponentInstance().destroy();
		if (details.failed === 0){
			jQuery("#test-view").hide();
		}
	});
});
