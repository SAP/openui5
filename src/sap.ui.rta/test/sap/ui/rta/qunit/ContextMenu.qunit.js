/* global QUnit */

sap.ui.define([
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageLayout",
	"sap/ui/rta/RuntimeAuthoring",
	"qunit/RtaQunitUtils",
	"sap/ui/fl/FlexController",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/sinon-4"
],
function(
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageLayout,
	RuntimeAuthoring,
	RtaQunitUtils,
	FlexController,
	OverlayRegistry,
	ChangeRegistry,
	Page,
	Button,
	KeyCodes,
	QUnitUtils,
	sinon
) {
	"use strict";

	var oCompCont = RtaQunitUtils.renderRuntimeAuthoringAppAt("qunit-fixture");
	var oComp = oCompCont.getComponentInstance();

	var sandbox = sinon.sandbox.create();

	function fnTriggerKeydown(oTargetDomRef, iKeyCode, bShiftKey, bAltKey, bCtrlKey, bMetaKey) {
		var oParams = {};
		oParams.keyCode = iKeyCode;
		oParams.which = oParams.keyCode;
		oParams.shiftKey = bShiftKey;
		oParams.altKey = bAltKey;
		oParams.metaKey = bMetaKey;
		oParams.ctrlKey = bCtrlKey;
		QUnitUtils.triggerEvent("keydown", oTargetDomRef, oParams);
	}
	function fnTriggerContextMenuClick(oTarget) {
		QUnitUtils.triggerMouseEvent(oTarget.getDomRef(), "contextmenu");
	}

	QUnit.module("Given RTA is started...", {
		before: function() {
			this.oPage = sap.ui.getCore().byId("Comp1---idMain1--mainPage");
			this.oSmartForm = sap.ui.getCore().byId("Comp1---idMain1--MainForm");
			this.oGroup = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument");
			this.oBoundGroupElement = sap.ui.getCore().byId("Comp1---idMain1--MainFormExpandable.GeneralLedgerDocument.CompanyCode");
			this.oMandatoryGroupElement = sap.ui.getCore().byId("Comp1---idMain1--MainFormExpandable.GeneralLedgerDocument.Mandatory");
			this.oUnBoundGroupElement = sap.ui.getCore().byId("Comp1---idMain1--MainFormExpandable.GeneralLedgerDocument.UnboundButton");
			this.oMultipleFieldOneBoundGroupElement = sap.ui.getCore().byId("Comp1---idMain1--MainFormExpandable.GeneralLedgerDocument.BoundButton");
			this.oMultipleBoundFieldGroupElement = sap.ui.getCore().byId("Comp1---idMain1--Dates.BoundButton35");
			this.oFieldInGroupWithoutStableId = sap.ui.getCore().byId("Comp1---idMain1--FieldInGroupWithoutStableId");
			this.oSimpleFormWithTitles = sap.ui.getCore().byId("Comp1---idMain1--SimpleForm");
			this.oSimpleFormWithToolbars = sap.ui.getCore().byId("Comp1---idMain1--SimpleFormWithToolbars");

			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl"),
				showToolbars: false
			});
		},
		beforeEach: function() {
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When the context menu is opened on various overlays", function(assert) {
			// SmartForm
			fnKeyboardGroupElement.call(this, assert);
			fnMouseGroup.call(this, assert);
			fnKeyboardSmartForm.call(this, assert);
			fnMouseMandatoryGroupElement.call(this, assert);
			fnMouseTwoSelectedGroupElementsWithBoundFields.call(this, assert);
			fnMouseTwoSelectedGroupElementsWithOneBoundField.call(this, assert);
			fnMouseTwoGroupElementsWithOneBoundField.call(this, assert);
			fnMouseGroupElementWithTwoFields.call(this, assert);
			fnMouseStableGroupElementInUnstableGroup.call(this, assert);
			fnKeyboardCustomSettings.call(this, assert);
			fnKeyboardPageWithoutTitle.call(this, assert);

			// SimpleForm
			fnKeyboardSimpleFormFormElement.call(this, assert);
			fnKeyboardSimpleFormWithTitle.call(this, assert);
			fnKeyboardSimpleFormGroup.call(this, assert);
			fnSimpleFormFormContainer.call(this, assert);
			fnContextMenuOpenWithTestData.call(this, assert);
		});

		function fnKeyboardGroupElement(assert) {
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			oGroupElementOverlay.focus();
			fnTriggerKeydown(oGroupElementOverlay.getDomRef(), KeyCodes.F10, true, false, false);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu is opened (via keyboard) for a sap.ui.comp.smartform.GroupElement");
			assert.equal(oContextMenuControl.getButtons().length, 5, "5 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
			assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
			assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
			assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut field");
			assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste field");
		}

		function fnMouseGroup(assert) {
			var oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);
			fnTriggerContextMenuClick(oGroupOverlay);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu is opened (via mouse) for a sap.ui.comp.smartform.Group");
			assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a group");
			assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_CHILD", "we can add field");
			assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_CREATE_SIBLING_CONTAINER", "we can create group");
			assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_REMOVE", "we can remove group");
			assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_CUT", "we can cut group");
			assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_PASTE", "we can paste group");
		}

		function fnKeyboardSmartForm(assert) {
			var oFormOverlay = OverlayRegistry.getOverlay(this.oSmartForm);
			oFormOverlay.focus();
			fnTriggerKeydown(oFormOverlay.getDomRef(), KeyCodes.F10, true, false, false);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened (via keyboard) for a sap.ui.comp.smartform.SmartForm");
			assert.equal(oContextMenuControl.getButtons().length, 3, "3 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_CREATE_CHILD_CONTAINER", "we can create group");
			assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_CUT", "we can cut a group");
			assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_PASTE", "we can paste a group");
		}

		function fnMouseMandatoryGroupElement(assert) {
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oMandatoryGroupElement);
			fnTriggerContextMenuClick(oGroupElementOverlay);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened (via mouse) for a mandatory selected GroupElement");
			assert.equal(oContextMenuControl.getButtons().length, 5, "5 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
			assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
			assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
			assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut field");
			assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste field");
		}

		function fnMouseTwoSelectedGroupElementsWithBoundFields(assert) {
			var oGroupElementOverlay1 = OverlayRegistry.getOverlay(this.oMandatoryGroupElement);
			var oGroupElementOverlay2 = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			this.oRta._oDesignTime.getSelectionManager().set([oGroupElementOverlay1, oGroupElementOverlay2]);
			fnTriggerContextMenuClick(oGroupElementOverlay1);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened on two selected GroupElements and both have bound fields");
			assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
			assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
			assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
			assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
			assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
			assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_GROUP_FIELDS", "we can group fields");
			assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "we can not rename multiple fields");

			this.oRta._oDesignTime.getSelectionManager().reset();
		}

		function fnMouseTwoSelectedGroupElementsWithOneBoundField(assert) {
			var oGroupElementOverlay1 = OverlayRegistry.getOverlay(this.oUnBoundGroupElement);
			var oGroupElementOverlay2 = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			this.oRta._oDesignTime.getSelectionManager().set([oGroupElementOverlay1, oGroupElementOverlay2]);
			fnTriggerContextMenuClick(oGroupElementOverlay1);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened on two selected GroupElements when one field has no binding");
			assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
			assert.equal(oContextMenuControl.getButtons()[1].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
			assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
			assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
			assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
			assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_GROUP_FIELDS" , "group fields is there ");
			assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "we can not rename multiple fields");
			assert.equal(oContextMenuControl.getButtons()[5].getEnabled(), true, "we can group fields");

			this.oRta._oDesignTime.getSelectionManager().reset();
		}

		function fnMouseTwoGroupElementsWithOneBoundField(assert) {
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oMultipleFieldOneBoundGroupElement);
			fnTriggerContextMenuClick(oGroupElementOverlay);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened on GroupElement when two fields, one field has no binding");
			assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id") , "CTX_RENAME", "we can rename a label");
			assert.equal(oContextMenuControl.getButtons()[1].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
			assert.equal(oContextMenuControl.getButtons()[2].data("id") , "CTX_REMOVE", "we can remove field");
			assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
			assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
			assert.equal(oContextMenuControl.getButtons()[5].data("id") , "CTX_UNGROUP_FIELDS", "ungroup fields is there ");
			assert.equal(oContextMenuControl.getButtons()[5].getEnabled(), true, "we can ungroup fields");
		}

		function fnMouseGroupElementWithTwoFields(assert) {
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oMultipleBoundFieldGroupElement);
			fnTriggerContextMenuClick(oGroupElementOverlay);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened on GroupElement with two fields");
			assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id") , "CTX_RENAME", "we can rename a label");
			assert.equal(oContextMenuControl.getButtons()[1].data("id") , "CTX_ADD_ELEMENTS_AS_SIBLING", "we can add field");
			assert.equal(oContextMenuControl.getButtons()[2].data("id") , "CTX_REMOVE", "we can remove field");
			assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
			assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
			assert.equal(oContextMenuControl.getButtons()[5].data("id") , "CTX_UNGROUP_FIELDS", "ungroup fields is there ");
			assert.equal(oContextMenuControl.getButtons()[5].getEnabled(), true, "we can ungroup fields");
		}

		function fnMouseStableGroupElementInUnstableGroup(assert) {
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oFieldInGroupWithoutStableId);
			fnTriggerContextMenuClick(oGroupElementOverlay);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened on GroupElement with stable id, but the Group has no stable id");
			assert.equal(oContextMenuControl.getButtons().length, 2, "2 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id") , "CTX_RENAME", "rename is available");
			assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "and rename is enabled");
			assert.equal(oContextMenuControl.getButtons()[1].data("id") , "CTX_REMOVE", "remove field is available");
			assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), false, "we cannot remove the field");
		}

		function fnKeyboardCustomSettings(assert) {
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
			sandbox.stub(oSettings, "getAction").callsFake(function() {
				return oGroupDesigntime.settings();
			});
			var oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);
			oSettings.deregisterElementOverlay(oGroupOverlay);
			oSettings.registerElementOverlay(oGroupOverlay);

			oGroupOverlay.focus();
			fnTriggerKeydown(oGroupOverlay.getDomRef(), KeyCodes.F10, true, false, false);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened on a Control with a defined settings action");
			assert.equal(oContextMenuControl.getButtons()[oContextMenuControl.getButtons().length - 1].data("id"), "CTX_SETTINGS", "Settings is available");
		}

		function fnKeyboardPageWithoutTitle(assert) {
			this.oPage._headerTitle.destroy();
			this.oPage._headerTitle = null;
			var oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
			oPageOverlay.focus();
			fnTriggerKeydown(oPageOverlay.getDomRef(), KeyCodes.F10, true, false, false);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened (via keyboard) for a sap.m.Page without title");
			assert.equal(oContextMenuControl.getButtons().length, 1, "1 Menu Button is available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename Page is available");
			assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "but rename Page is disabled");
		}

		function fnKeyboardSimpleFormFormElement(assert) {
			var oLabel = this.oSimpleFormWithTitles.getContent()[3];
			var oFormElement = oLabel.getParent();
			var oFormElementOverlay = OverlayRegistry.getOverlay(oFormElement);
			oFormElementOverlay.focus();
			fnTriggerKeydown(oFormElementOverlay.getDomRef(), KeyCodes.F10, true, false, false);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened (via keyboard) for a SimpleForm FormElement");
			assert.equal(oContextMenuControl.getButtons().length, 5, "5 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename label is available");
			assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field is available");
			assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "remove field is available");
			assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "cut field is available");
			assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "paste field is available");
		}

		function fnKeyboardSimpleFormWithTitle(assert) {
			var oForm = this.oSimpleFormWithTitles.getAggregation("form");
			var oFormOverlay = OverlayRegistry.getOverlay(oForm);
			oFormOverlay.focus();
			fnTriggerKeydown(oFormOverlay.getDomRef(), KeyCodes.F10, true, false, false);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened (via keyboard) for a SimpleForm with Title");
			assert.equal(oContextMenuControl.getButtons().length, 1, "1 Menu Button is available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_CREATE_CHILD_CONTAINER", "create group is available");
		}

		function fnKeyboardSimpleFormGroup(assert) {
			var oTitle = this.oSimpleFormWithTitles.getContent()[0];
			var oFormContainer = oTitle.getParent();
			var oFormContainerOverlay = OverlayRegistry.getOverlay(oFormContainer);
			oFormContainerOverlay.focus();
			fnTriggerKeydown(oFormContainerOverlay.getDomRef(), KeyCodes.F10, true, false, false);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened (via keyboard) for a SimpleForm Group with Title");
			assert.equal(oContextMenuControl.getButtons().length, 5, "5 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename title is available");
			assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "and rename title is enabled");
			assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_CHILD", "add field is available");
			assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_CREATE_SIBLING_CONTAINER", "create group is available");
			assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_REMOVE", "remove group is available");
			assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "paste field is available");
		}

		function fnSimpleFormFormContainer(assert) {
			var oToolbar = this.oSimpleFormWithToolbars.getContent()[0];
			var oFormContainer = oToolbar.getParent();
			var oFormContainerOverlay = OverlayRegistry.getOverlay(oFormContainer);
			oFormContainerOverlay.focus();
			fnTriggerKeydown(oFormContainerOverlay.getDomRef(), KeyCodes.F10, true, false, false);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened (via keyboard) for a SimpleForm FormContainer with Toolbar");
			assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename toolbar is available");
			assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "but rename toolbar is disabled");
			assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_CHILD", "add field is available");
			assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_CREATE_SIBLING_CONTAINER", "create group is available");
			assert.equal(oContextMenuControl.getButtons()[2].getEnabled(), false, "but creating group is disabled");
			assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_REMOVE", "remove group is available");
			assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_CUT", "cut field is available");
			assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_PASTE", "paste field is available");
		}

		function fnContextMenuOpenWithTestData(assert) {
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
		}
	});

	QUnit.module("Given RTA is started for Object Page...", {
		beforeEach : function() {
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
				rootControl : this.oObjectPageLayout,
				showToolbars: false
			});

			return this.oRta.start();
		},
		afterEach : function() {
			this.oObjectPageLayout.destroy();
			this.oRta.destroy();
		}
	}, function() {
		QUnit.test("when context menu (context menu) is opened on ObjectPageSection", function(assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection1);
			fnTriggerContextMenuClick(oOverlay);

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
	});

	QUnit.module("Given RTA is started for Object Page without stable ids...", {
		beforeEach : function() {
			sandbox.stub(FlexController.prototype, "getResetAndPublishInfo").resolves({
				isResetEnabled : false,
				isPublishEnabled : false
			});

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
			this.oObjectPageLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl : this.oObjectPageLayout,
				showToolbars: false
			});

			return this.oRta.start();
		},
		afterEach : function() {
			this.oObjectPageLayout.destroy();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when context menu (context menu) is opened on ObjectPageSection", function(assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection1);
			fnTriggerContextMenuClick(oOverlay);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
			assert.equal(oContextMenuControl.getButtons().length, 2, " and 2 Menu Buttons are available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id") , "CTX_RENAME", "rename section is available");
			assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "add section is enabled");
			assert.equal(oContextMenuControl.getButtons()[1].data("id") , "CTX_REMOVE", "remove section is available");
			assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), true, "we cannot remove a section");
		});
	});

	QUnit.module("Given RTA is started for Object Page...", {
		beforeEach : function() {
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
				rootControl : oPage,
				showToolbars: false
			});

			return this.oRta.start();
		},
		afterEach : function() {
			this.oObjectPageLayout.destroy();
			this.oRta.destroy();
		}
	}, function() {
		QUnit.test("when context menu (context menu) is opened on ObjectPageLayout, and the Section has an unstable ID and is hidden, ", function(assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout);
			this.oRta.getPlugins()["contextMenu"].open({ pageX: 0, pageY: 0 }, oOverlay);

			var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
			assert.ok(oContextMenuControl.bOpen, "then the context menu (context menu) opens");
			assert.equal(oContextMenuControl.getButtons().length, 1, " and only one Menu Button is available");
			assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_PASTE", "only paste menu Button is available, no possibility to add a section");
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
