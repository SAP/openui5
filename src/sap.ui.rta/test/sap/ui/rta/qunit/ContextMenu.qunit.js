/* global QUnit */

sap.ui.define([
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageLayout",
	"sap/ui/rta/RuntimeAuthoring",
	"qunit/RtaQunitUtils",
	"sap/ui/rta/Utils",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/thirdparty/sinon-4"
],
function(
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageLayout,
	RuntimeAuthoring,
	RtaQunitUtils,
	Utils,
	OverlayRegistry,
	ChangeRegistry,
	Page,
	Button,
	sinon
) {
	"use strict";

	var oCompCont = RtaQunitUtils.renderTestAppAt("qunit-fixture");
	var oComp = oCompCont.getComponentInstance();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given RTA is started...", {
		beforeEach: function(assert) {
			var fnDone = assert.async();
			this.oPage = sap.ui.getCore().byId("Comp1---idMain1--mainPage");
			this.oSmartForm = sap.ui.getCore().byId("Comp1---idMain1--MainForm");
			this.oGroup = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument");
			this.oBoundGroupElement = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			this.oAnotherBoundGroupElement = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.Name");
			this.oUnBoundGroupElement = sap.ui.getCore().byId("Comp1---idMain1--Victim");
			this.oMultipleFieldTwoBoundGroupElements = sap.ui.getCore().byId("Comp1---idMain1--Dates.BoundButton35");
			this.oMultipleBoundFieldGroupElement = sap.ui.getCore().byId("Comp1---idMain1--Dates.BoundButton35");
			this.oFieldInGroupWithoutStableId = sap.ui.getCore().byId("Comp1---idMain1--FieldInGroupWithoutStableId");
			this.oSimpleFormWithTitles = sap.ui.getCore().byId("Comp1---idMain1--SimpleForm");

			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl"),
				showToolbars: false
			});

			this.oRta.start().then(function() {
				// wait for Binding Context of the Group before starting the Tests
				// The Context-Menu entry for adding an element needs the Binding Context to determine entries
				if (!this.oGroup.getBindingContext()) {
					this.oGroup.attachModelContextChange(fnDone);
				} else {
					fnDone();
				}
			}.bind(this));
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When the context menu is opened on various overlays", function(assert) {
			// SmartForm
			return keyboardGroupElement.call(this, assert)
				.then(keyboardGroupElementWithoutAdditionalFieldsAvailable.bind(this, assert))
				.then(keyboardGroupElementWithCustomFieldsAndNoFieldsAvailable.bind(this, assert))
				.then(mouseGroup.bind(this, assert))
				.then(keyboardSmartForm.bind(this, assert))
				.then(mouseTwoSelectedGroupElementsWithBoundFields.bind(this, assert))
				.then(mouseTwoSelectedGroupElementsWithOneBoundField.bind(this, assert))
				.then(mouseTwoGroupElementsWithOneBoundField.bind(this, assert))
				.then(mouseGroupElementWithTwoFields.bind(this, assert))
				.then(mouseStableGroupElementInUnstableGroup.bind(this, assert))
				.then(keyboardCustomSettings.bind(this, assert))
				.then(keyboardPageWithoutTitle.bind(this, assert))

				// SimpleForm
				.then(keyboardSimpleFormFormElement.bind(this, assert))
				.then(keyboardSimpleFormWithTitle.bind(this, assert))
				.then(keyboardSimpleFormGroup.bind(this, assert))
				.then(contextMenuOpenWithTestData.bind(this, assert));
		});

		function keyboardGroupElement(assert) {
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			oGroupElementOverlay.focus();
			oGroupElementOverlay.setSelected(true);
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupElementOverlay).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu is opened (via keyboard) for a sap.ui.comp.smartform.GroupElement");
				assert.equal(oContextMenuControl.getButtons().length, 5, "5 Menu Buttons are available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
				assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
				assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), true, "add field Button is enabled, because there are fields available");
				assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
				assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut field");
				assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste field");
			}.bind(this));
		}

		function keyboardGroupElementWithoutAdditionalFieldsAvailable(assert) {
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			oGroupElementOverlay.focus();
			oGroupElementOverlay.setSelected(true);
			// fake no Elements available
			var oAdditionalElementsPlugin = this.oRta.getPlugins()["additionalElements"];
			sandbox.stub(oAdditionalElementsPlugin, "getAllElements").resolves([]);
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupElementOverlay).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu is opened and there are no Fields available to be added");
				assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
				assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), false, "add field Button is disabled, because there are no available fields");
				sandbox.restore();
			}.bind(this));
		}

		function keyboardGroupElementWithCustomFieldsAndNoFieldsAvailable(assert) {
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			oGroupElementOverlay.focus();
			oGroupElementOverlay.setSelected(true);
			// Fake Custom Fields Creation available
			sandbox.stub(Utils, "isCustomFieldAvailable").resolves(true);
			// fake no Elements available
			var oAdditionalElementsPlugin = this.oRta.getPlugins()["additionalElements"];
			sandbox.stub(oAdditionalElementsPlugin, "_combineAnalyzerResults").resolves([]);
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupElementOverlay).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu is opened and there are no Fields to be added, but custom fields is available");
				assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
				assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), true, "add field Button is enabled, because custom fields creation is available");
				sandbox.restore();
			}.bind(this));
		}

		function mouseGroup(assert) {
			var oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);
			return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupOverlay, sinon).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu is opened (via mouse) for a sap.ui.comp.smartform.Group");
				assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a group");
				assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_CHILD", "add field Button is visible");
				assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_CREATE_SIBLING_CONTAINER", "we can create group");
				assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_REMOVE", "we can remove group");
				assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_CUT", "we can cut group");
				assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_PASTE", "we can paste group");
			}.bind(this));
		}

		function keyboardSmartForm(assert) {
			var oFormOverlay = OverlayRegistry.getOverlay(this.oSmartForm);
			oFormOverlay.focus();
			oFormOverlay.setSelected(true);

			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFormOverlay).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened (via keyboard) for a sap.ui.comp.smartform.SmartForm");
				assert.equal(oContextMenuControl.getButtons().length, 1, "1 Menu Buttons is available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_CREATE_CHILD_CONTAINER", "we can create group");
			}.bind(this));
		}

		function mouseTwoSelectedGroupElementsWithBoundFields(assert) {
			var oGroupElementOverlay1 = OverlayRegistry.getOverlay(this.oAnotherBoundGroupElement);
			var oGroupElementOverlay2 = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			this.oRta._oDesignTime.getSelectionManager().set([oGroupElementOverlay1, oGroupElementOverlay2]);
			return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay1, sinon).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened on two selected GroupElements and both have bound fields");
				assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
				assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
				assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
				assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
				assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
				assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_GROUP_FIELDS", "we can group fields");
				assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "we can not rename multiple fields");

				this.oRta._oDesignTime.getSelectionManager().reset();
			}.bind(this));
		}

		function mouseTwoSelectedGroupElementsWithOneBoundField(assert) {
			var oGroupElementOverlay1 = OverlayRegistry.getOverlay(this.oUnBoundGroupElement);
			var oGroupElementOverlay2 = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			this.oRta._oDesignTime.getSelectionManager().set([oGroupElementOverlay1, oGroupElementOverlay2]);
			return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay1, sinon).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened on two selected GroupElements when one field has no binding");
				assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
				assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
				assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
				assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
				assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
				assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_GROUP_FIELDS", "group fields is there ");
				assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "we can not rename multiple fields");
				assert.equal(oContextMenuControl.getButtons()[5].getEnabled(), true, "we can group fields");

				this.oRta._oDesignTime.getSelectionManager().reset();
			}.bind(this));
		}

		function mouseTwoGroupElementsWithOneBoundField(assert) {
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oMultipleFieldTwoBoundGroupElements);
			return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay, sinon).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened on GroupElement when two fields, one field has no binding");
				assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
				assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
				assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
				assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
				assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
				assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_UNGROUP_FIELDS", "ungroup fields is there ");
				assert.equal(oContextMenuControl.getButtons()[5].getEnabled(), true, "we can ungroup fields");
			}.bind(this));
		}

		function mouseGroupElementWithTwoFields(assert) {
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oMultipleBoundFieldGroupElement);
			return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay, sinon).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened on GroupElement with two fields");
				assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
				assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
				assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
				assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
				assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
				assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_UNGROUP_FIELDS", "ungroup fields is there ");
				assert.equal(oContextMenuControl.getButtons()[5].getEnabled(), true, "we can ungroup fields");
			}.bind(this));
		}

		function mouseStableGroupElementInUnstableGroup(assert) {
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oFieldInGroupWithoutStableId);
			return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay, sinon).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened on GroupElement with stable id, but the Group has no stable id");
				assert.equal(oContextMenuControl.getButtons().length, 2, "2 Menu Buttons are available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename is available");
				assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "and rename is enabled");
				assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_REMOVE", "remove field is available");
				assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), false, "we cannot remove the field");
			}.bind(this));
		}

		function keyboardCustomSettings(assert) {
			var oSettings = this.oRta.getPlugins()["settings"];

			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.ui.comp.smartform.Group" : {
					changeSettings : "sap/ui/fl/changeHandler/PropertyChange"
				}
			})
				.then(function() {
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
					oGroupOverlay.setSelected(true);
					return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupOverlay).then(function() {
						var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
						assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened on a Control with a defined settings action");
						assert.equal(oContextMenuControl.getButtons()[oContextMenuControl.getButtons().length - 1].data("id"), "CTX_SETTINGS", "Settings is available");
					}.bind(this));
				}.bind(this));
		}

		function keyboardPageWithoutTitle(assert) {
			this.oPage._headerTitle.destroy();
			this.oPage._headerTitle = null;
			var oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
			oPageOverlay.focus();
			oPageOverlay.setSelected(true);
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oPageOverlay).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened (via keyboard) for a sap.m.Page without title");
				assert.equal(oContextMenuControl.getButtons().length, 1, "1 Menu Button is available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename Page is available");
				assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "but rename Page is disabled");
			}.bind(this));
		}

		function keyboardSimpleFormFormElement(assert) {
			var oLabel = this.oSimpleFormWithTitles.getContent()[3];
			var oFormElement = oLabel.getParent();
			var oFormElementOverlay = OverlayRegistry.getOverlay(oFormElement);
			oFormElementOverlay.focus();
			oFormElementOverlay.setSelected(true);
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFormElementOverlay).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened (via keyboard) for a SimpleForm FormElement");
				assert.equal(oContextMenuControl.getButtons().length, 5, "5 Menu Buttons are available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename label is available");
				assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
				assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "remove field is available");
				assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "cut field is available");
				assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "paste field is available");
			}.bind(this));
		}

		function keyboardSimpleFormWithTitle(assert) {
			var oForm = this.oSimpleFormWithTitles.getAggregation("form");
			var oFormOverlay = OverlayRegistry.getOverlay(oForm);
			oFormOverlay.focus();
			oFormOverlay.setSelected(true);
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFormOverlay).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened (via keyboard) for a SimpleForm with Title");
				assert.equal(oContextMenuControl.getButtons().length, 1, "1 Menu Button is available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_CREATE_CHILD_CONTAINER", "create group is available");
			}.bind(this));
		}

		function keyboardSimpleFormGroup(assert) {
			var oTitle = this.oSimpleFormWithTitles.getContent()[0];
			var oFormContainer = oTitle.getParent();
			var oFormContainerOverlay = OverlayRegistry.getOverlay(oFormContainer);
			oFormContainerOverlay.focus();
			oFormContainerOverlay.setSelected(true);
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFormContainerOverlay).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "when context menu (context menu) is opened (via keyboard) for a SimpleForm Group with Title");
				assert.equal(oContextMenuControl.getButtons().length, 5, "5 Menu Buttons are available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename title is available");
				assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "and rename title is enabled");
				assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_CHILD", "add field Button is visible");
				assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_CREATE_SIBLING_CONTAINER", "create group is available");
				assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_REMOVE", "remove group is available");
				assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "paste field is available");
			}.bind(this));
		}

		function contextMenuOpenWithTestData(assert) {
			var done = assert.async();
			var oForm = this.oSimpleFormWithTitles.getAggregation("form");
			var oFormOverlay = OverlayRegistry.getOverlay(oForm);
			var oContextMenuPlugin = this.oRta.getPlugins()["contextMenu"];

			sandbox.stub(oContextMenuPlugin.getDesignTime(), "getSelection").returns([oFormOverlay]);
			var oEvent = {
				data : function(sDataParamName) {
					var oItemData = {
						id : "CTX_TEST"
					};
					return oItemData[sDataParamName];
				},
				getSubmenu : function() {
					return false;
				}
			};

			oContextMenuPlugin._aMenuItems = [{
				menuItem : {
					id : "CTX_TEST",
					handler : function() {
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
			// View
			// 	Page
			// 		ObjectPageLayout
			//			ObjectPageSection - visible
			//				ObjectPageSubSection
			//					Button
			//			ObjectPageSection - invisible
			//			ObjectPageSection - visible

			var oEmbeddedView = sap.ui.getCore().byId("Comp1---idMain1");

			var oSubSection = new ObjectPageSubSection({
				id : oEmbeddedView.createId("subsection1"),
				blocks: [new Button({text: "abc"})]
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
			return RtaQunitUtils.openContextMenuWithClick.call(this, oOverlay, sinon).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
				assert.equal(oContextMenuControl.getButtons().length, 5, " and 5 Menu Buttons are available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename section is available");
				assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "rename section is enabled");
				assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add section is available");
				assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), true, "add section is enabled");
				assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "remove section is available");
				assert.equal(oContextMenuControl.getButtons()[2].getEnabled(), true, "we can remove a section");
				assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "cut sections available");
				assert.equal(oContextMenuControl.getButtons()[3].getEnabled(), true, "cut is enabled");
				assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "paste is available");
				assert.equal(oContextMenuControl.getButtons()[4].getEnabled(), false, "we cannot paste a section");
			}.bind(this));
		});
	});

	QUnit.module("Given RTA is started for Object Page without stable ids...", {
		beforeEach : function() {
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

			sandbox.stub(RuntimeAuthoring.prototype, '_checkChangesExist').resolves(false);

			this.oRta = new RuntimeAuthoring({
				rootControl : this.oObjectPageLayout,
				showToolbars: false
			});

			return this.oRta.start();
		},
		afterEach : function() {
			this.oRta.destroy();
			this.oObjectPageLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when context menu (context menu) is opened on ObjectPageSection", function(assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection1);
			return RtaQunitUtils.openContextMenuWithClick.call(this, oOverlay, sinon).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.ok(oContextMenuControl.bOpen, "then Menu gets opened");
				assert.equal(oContextMenuControl.getButtons().length, 2, " and 2 Menu Buttons are available");
				assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename section is available");
				assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "add section is enabled");
				assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_REMOVE", "remove section is available");
				assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), true, "we cannot remove a section");
				oContextMenuControl.close();
			}.bind(this));
		});
	});

	QUnit.module("Given RTA is started for Object Page...", {
		beforeEach : function() {
			var oEmbeddedView = sap.ui.getCore().byId("Comp1---idMain1");

			this.oObjectPageSection1 = new ObjectPageSection({
				title: "Section_1",
				visible : false
			});

			this.oObjectPageSection2 = new ObjectPageSection({
				title: "Section_2",
				visible : false
			});

			var oEmbeddedPage = sap.ui.getCore().byId("Comp1---idMain1--mainPage");

			this.oObjectPageLayout = new ObjectPageLayout({
				id : oEmbeddedView.createId("ObjectPageLayout"),
				sections : [
					this.oObjectPageSection1,
					this.oObjectPageSection2
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
			this.oRta.destroy();
			this.oObjectPageLayout.destroy();
		}
	}, function() {
		QUnit.test("when context menu (context menu) is opened on ObjectPageLayout, and the Section has an unstable ID and is hidden, ", function(assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout);
			return RtaQunitUtils.openContextMenuWithClick.call(this, oOverlay, sinon).then(function() {
				var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
				assert.notOk(oContextMenuControl.bOpen, "then the context menu (context menu) opens");
				assert.notOk(oOverlay.isEditable(), "then the overlay is not editable");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
