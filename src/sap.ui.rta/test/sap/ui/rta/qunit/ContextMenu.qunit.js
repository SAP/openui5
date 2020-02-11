/* global QUnit */

sap.ui.define([
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageLayout",
	"sap/ui/rta/RuntimeAuthoring",
	"qunit/RtaQunitUtils",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/Device",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
],
function(
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageLayout,
	RuntimeAuthoring,
	RtaQunitUtils,
	FlexUtils,
	Utils,
	OverlayRegistry,
	ChangeRegistry,
	Device,
	Page,
	Button,
	sinon,
	jQuery
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oComp;

	if (Device.browser.edge) {
		QUnit.module("dummy test module", function() {
			QUnit.test("dummy test", function(assert) {
				assert.ok(true, "this test does not work reliable in Edge in build environments and needs better synced event queuing, managed dom updates or similar scheduling improvements");
			});
		});
	} else {
		QUnit.module("Given RTA is started...", {
			before: function(assert) {
				jQuery("<div/>", {
					id: "content"
				}).css({
					width: "600px",
					height: "600px",
					position: "fixed",
					right: "0",
					bottom: "0",
					top: "auto"
				}).appendTo(jQuery("body"));

				return RtaQunitUtils.renderTestAppAtAsync("content")
				.then(function(oCompCont) {
					oComp = oCompCont.getComponentInstance();
				})
				.then(function() {
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
				}.bind(this));
			},
			afterEach: function() {
				sandbox.restore();
			},
			after: function() {
				this.oRta.destroy();
			}
		}, function() {
			QUnit.test("when context menu is opened (via keyboard) for a sap.ui.comp.smartform.GroupElement", function(assert) {
				var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);
				oGroupElementOverlay.focus();
				oGroupElementOverlay.setSelected(true);
				return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupElementOverlay).then(function() {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					var sText = "";
					oContextMenuControl.getButtons().forEach(function(oButton) {
						sText = sText + " - " + oButton.data("id");
					});
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					if (oContextMenuControl.getButtons().length === 5) {
						assert.equal(oContextMenuControl.getButtons().length, 5, "5 Menu Buttons are available");
						assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
						assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
						assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), true, "add field Button is enabled, because there are fields available");
						assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
						assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut field");
						assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste field");
					} else {
						assert.ok(false, sText);
					}
				}.bind(this));
			});

			QUnit.test("when context menu is opened and there are no Fields available to be added", function(assert) {
				var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);
				oGroupElementOverlay.focus();
				oGroupElementOverlay.setSelected(true);
				// fake no Elements available
				var oAdditionalElementsPlugin = this.oRta.getPlugins()["additionalElements"];
				sandbox.stub(oAdditionalElementsPlugin, "getAllElements").resolves([]);
				return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupElementOverlay).then(function() {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
					assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), false, "add field Button is disabled, because there are no available fields");
					sandbox.restore();
				}.bind(this));
			});

			QUnit.test("when context menu is opened and there are no Fields to be added, but custom fields is available", function(assert) {
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
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
					assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), true, "add field Button is enabled, because custom fields creation is available");
					sandbox.restore();
				}.bind(this));
			});

			QUnit.test("when context menu is opened (via mouse) for a sap.ui.comp.smartform.Group", function(assert) {
				var oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);
				return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupOverlay, sinon).then(function() {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					var sText = "";
					oContextMenuControl.getButtons().forEach(function(oButton) {
						sText = sText + " - " + oButton.data("id");
					});
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					if (oContextMenuControl.getButtons().length === 6) {
						assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
						assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a group");
						assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_CHILD", "add field Button is visible");
						assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_CREATE_SIBLING_CONTAINER", "we can create group");
						assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_REMOVE", "we can remove group");
						assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_CUT", "we can cut group");
						assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_PASTE", "we can paste group");
					} else {
						assert.ok(false, sText);
					}
				}.bind(this));
			});

			QUnit.test("when context menu (context menu) is opened (via keyboard) for a sap.ui.comp.smartform.SmartForm", function(assert) {
				var oFormOverlay = OverlayRegistry.getOverlay(this.oSmartForm);
				oFormOverlay.focus();
				oFormOverlay.setSelected(true);

				return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFormOverlay).then(function() {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					assert.equal(oContextMenuControl.getButtons().length, 1, "1 Menu Buttons is available");
					assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_CREATE_CHILD_CONTAINER", "we can create group");
				}.bind(this));
			});

			QUnit.test("when context menu (context menu) is opened on two selected GroupElements and both have bound fields", function(assert) {
				var oGroupElementOverlay1 = OverlayRegistry.getOverlay(this.oAnotherBoundGroupElement);
				var oGroupElementOverlay2 = OverlayRegistry.getOverlay(this.oBoundGroupElement);
				this.oRta._oDesignTime.getSelectionManager().set([oGroupElementOverlay1, oGroupElementOverlay2]);
				return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay1, sinon).then(function() {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					var sText = "";
					oContextMenuControl.getButtons().forEach(function(oButton) {
						sText = sText + " - " + oButton.data("id");
					});
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					if (oContextMenuControl.getButtons().length === 6) {
						assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
						assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
						assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
						assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
						assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
						assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
						assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_GROUP_FIELDS", "we can group fields");
						assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "we can not rename multiple fields");
					} else {
						assert.ok(false, sText);
					}

					this.oRta._oDesignTime.getSelectionManager().reset();
				}.bind(this));
			});

			QUnit.test("when context menu (context menu) is opened on two selected GroupElements when one field has no binding", function(assert) {
				var oGroupElementOverlay1 = OverlayRegistry.getOverlay(this.oUnBoundGroupElement);
				var oGroupElementOverlay2 = OverlayRegistry.getOverlay(this.oBoundGroupElement);
				this.oRta._oDesignTime.getSelectionManager().set([oGroupElementOverlay1, oGroupElementOverlay2]);
				return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay1, sinon).then(function() {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					var sText = "";
					oContextMenuControl.getButtons().forEach(function(oButton) {
						sText = sText + " - " + oButton.data("id");
					});
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					if (oContextMenuControl.getButtons().length === 6) {
						assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
						assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
						assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
						assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
						assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
						assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
						assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_GROUP_FIELDS", "group fields is there ");
						assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "we can not rename multiple fields");
						assert.equal(oContextMenuControl.getButtons()[5].getEnabled(), true, "we can group fields");
					} else {
						assert.ok(false, sText);
					}

					this.oRta._oDesignTime.getSelectionManager().reset();
				}.bind(this));
			});

			QUnit.test("when context menu (context menu) is opened on GroupElement when two fields, one field has no binding", function(assert) {
				var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oMultipleFieldTwoBoundGroupElements);
				return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay, sinon).then(function() {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					var sText = "";
					oContextMenuControl.getButtons().forEach(function(oButton) {
						sText = sText + " - " + oButton.data("id");
					});
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					if (oContextMenuControl.getButtons().length === 6) {
						assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
						assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
						assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
						assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
						assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
						assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
						assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_UNGROUP_FIELDS", "ungroup fields is there ");
						assert.equal(oContextMenuControl.getButtons()[5].getEnabled(), true, "we can ungroup fields");
					} else {
						assert.ok(false, sText);
					}
				}.bind(this));
			});

			QUnit.test("when context menu (context menu) is opened on GroupElement with two fields", function(assert) {
				var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oMultipleBoundFieldGroupElement);
				return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay, sinon).then(function() {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					var sText = "";
					oContextMenuControl.getButtons().forEach(function(oButton) {
						sText = sText + " - " + oButton.data("id");
					});
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					if (oContextMenuControl.getButtons().length === 6) {
						assert.equal(oContextMenuControl.getButtons().length, 6, "6 Menu Buttons are available");
						assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "we can rename a label");
						assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
						assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "we can remove field");
						assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "we can cut groups");
						assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "we can paste groups");
						assert.equal(oContextMenuControl.getButtons()[5].data("id"), "CTX_UNGROUP_FIELDS", "ungroup fields is there ");
						assert.equal(oContextMenuControl.getButtons()[5].getEnabled(), true, "we can ungroup fields");
					} else {
						assert.ok(false, sText);
					}
				}.bind(this));
			});

			QUnit.test("when context menu (context menu) is opened on GroupElement with stable id, but the Group has no stable id", function(assert) {
				var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oFieldInGroupWithoutStableId);
				return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay, sinon).then(function() {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					var sText = "";
					oContextMenuControl.getButtons().forEach(function(oButton) {
						sText = sText + " - " + oButton.data("id");
					});
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					if (oContextMenuControl.getButtons().length === 2) {
						assert.equal(oContextMenuControl.getButtons().length, 2, "2 Menu Buttons are available");
						assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename is available");
						assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "and rename is enabled");
						assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_REMOVE", "remove field is available");
						assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), false, "we cannot remove the field");
					} else {
						assert.ok(false, sText);
					}
				}.bind(this));
			});

			QUnit.test("when context menu (context menu) is opened on a Control with a defined settings action", function(assert) {
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
							assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
							assert.equal(oContextMenuControl.getButtons()[oContextMenuControl.getButtons().length - 1].data("id"), "CTX_SETTINGS", "Settings is available");
						}.bind(this));
					}.bind(this));
			});

			QUnit.test("when context menu (context menu) is opened (via keyboard) for a sap.m.Page without title", function(assert) {
				this.oPage._headerTitle.destroy();
				this.oPage._headerTitle = null;
				var oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
				oPageOverlay.focus();
				oPageOverlay.setSelected(true);
				return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oPageOverlay).then(function() {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					assert.equal(oContextMenuControl.getButtons().length, 1, "1 Menu Button is available");
					assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename Page is available");
					assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), false, "but rename Page is disabled");
				}.bind(this));
			});

			QUnit.test("when context menu (context menu) is opened (via keyboard) for a SimpleForm FormElement", function(assert) {
				var oLabel = this.oSimpleFormWithTitles.getContent()[3];
				var oFormElement = oLabel.getParent();
				var oFormElementOverlay = OverlayRegistry.getOverlay(oFormElement);
				oFormElementOverlay.focus();
				oFormElementOverlay.setSelected(true);
				return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFormElementOverlay).then(function() {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					var sText = "";
					oContextMenuControl.getButtons().forEach(function(oButton) {
						sText = sText + " - " + oButton.data("id");
					});
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					if (oContextMenuControl.getButtons().length === 5) {
						assert.equal(oContextMenuControl.getButtons().length, 5, "5 Menu Buttons are available");
						assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename label is available");
						assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field Button is visible");
						assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_REMOVE", "remove field is available");
						assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_CUT", "cut field is available");
						assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "paste field is available");
					} else {
						assert.ok(false, sText);
					}
				}.bind(this));
			});

			QUnit.test("when context menu (context menu) is opened (via keyboard) for a SimpleForm with Title", function(assert) {
				var oForm = this.oSimpleFormWithTitles.getAggregation("form");
				var oFormOverlay = OverlayRegistry.getOverlay(oForm);
				oFormOverlay.focus();
				oFormOverlay.setSelected(true);
				return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFormOverlay).then(function() {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					assert.equal(oContextMenuControl.getButtons().length, 1, "1 Menu Button is available");
					assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_CREATE_CHILD_CONTAINER", "create group is available");
				}.bind(this));
			});

			QUnit.test("when context menu (context menu) is opened (via keyboard) for a SimpleForm Group with Title", function(assert) {
				var oTitle = this.oSimpleFormWithTitles.getContent()[0];
				var oFormContainer = oTitle.getParent();
				var oFormContainerOverlay = OverlayRegistry.getOverlay(oFormContainer);
				oFormContainerOverlay.focus();
				oFormContainerOverlay.setSelected(true);
				return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFormContainerOverlay).then(function() {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					var sText = "";
					oContextMenuControl.getButtons().forEach(function(oButton) {
						sText = sText + " - " + oButton.data("id");
					});
					assert.ok(oContextMenuControl.isPopupOpen(true), "the contextMenu is open");
					if (oContextMenuControl.getButtons().length === 5) {
						assert.equal(oContextMenuControl.getButtons().length, 5, "5 Menu Buttons are available");
						assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename title is available");
						assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "and rename title is enabled");
						assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_ADD_ELEMENTS_AS_CHILD", "add field Button is visible");
						assert.equal(oContextMenuControl.getButtons()[2].data("id"), "CTX_CREATE_SIBLING_CONTAINER", "create group is available");
						assert.equal(oContextMenuControl.getButtons()[3].data("id"), "CTX_REMOVE", "remove group is available");
						assert.equal(oContextMenuControl.getButtons()[4].data("id"), "CTX_PASTE", "paste field is available");
					} else {
						assert.ok(false, sText);
					}
				}.bind(this));
			});

			QUnit.test("when context menu (context menu) is opened (via keyboard) with test data", function(assert) {
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
			});
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

				sandbox.stub(FlexUtils, "getAppComponentForControl").returns(oComp);

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
					var sText = "";
					oContextMenuControl.getButtons().forEach(function(oButton) {
						sText = sText + " - " + oButton.data("id");
					});
					assert.ok(oContextMenuControl.isPopupOpen(true), "then Menu gets opened");
					if (oContextMenuControl.getButtons().length === 5) {
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
					} else {
						assert.ok(false, sText);
					}
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
					var sText = "";
					oContextMenuControl.getButtons().forEach(function(oButton) {
						sText = sText + " - " + oButton.data("id");
					});
					assert.ok(oContextMenuControl.isPopupOpen(true), "then Menu gets opened");
					if (oContextMenuControl.getButtons().length === 2) {
						assert.equal(oContextMenuControl.getButtons().length, 2, " and 2 Menu Buttons are available");
						assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_RENAME", "rename section is available");
						assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "add section is enabled");
						assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_REMOVE", "remove section is available");
						assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), true, "we can remove a section");
					} else {
						assert.ok(false, sText);
					}
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
					assert.ok(oContextMenuControl.isPopupOpen(true), "then the context menu (context menu) opens");
					assert.ok(oOverlay.isEditable(), "then the overlay is editable");
					if (oContextMenuControl.getButtons().length === 2) {
						assert.equal(oContextMenuControl.getButtons().length, 2, " and 2 Menu Buttons are available");
						assert.equal(oContextMenuControl.getButtons()[0].data("id"), "CTX_CREATE_CHILD_IFRAME_SECTIONS", "add iframe to section is available");
						assert.equal(oContextMenuControl.getButtons()[0].getEnabled(), true, "add iframe to section is enabled");
						assert.equal(oContextMenuControl.getButtons()[1].data("id"), "CTX_CREATE_CHILD_IFRAME_HEADERCONTENT", "add iframe to header is available");
						assert.equal(oContextMenuControl.getButtons()[1].getEnabled(), true, "add iframe to header is enabled");
					} else {
						assert.ok(false, "but shows the wrong number of menu buttons");
					}
				}.bind(this));
			});
		});
	}

	QUnit.done(function() {
		oComp && oComp.destroy();
		jQuery("#content").hide();
		jQuery("#qunit-fixture").hide();
	});
});
