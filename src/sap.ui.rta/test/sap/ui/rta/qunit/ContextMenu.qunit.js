/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/changeHandler/PropertyChange",
	"sap/ui/fl/util/IFrame",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/fl/registry/Settings",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/thirdparty/sinon-4",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element"
], function(
	RtaQunitUtils,
	KeyCodes,
	OverlayRegistry,
	DtUtil,
	PropertyChange,
	IFrame,
	ChangesWriteAPI,
	FieldExtensibility,
	Settings,
	Page,
	Button,
	RuntimeAuthoring,
	sinon,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	QUnitUtils,
	nextUIUpdate,
	Element
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oComp;
	var oContentDOM = document.createElement("div");
	oContentDOM.setAttribute("id", "content");
	oContentDOM.style.width = "600px";
	oContentDOM.style.height = "600px";
	oContentDOM.style.position = "fixed";
	oContentDOM.style.right = "0";
	oContentDOM.style.bottom = "0";
	oContentDOM.style.top = "auto";
	document.querySelector("body").appendChild(oContentDOM);

	RtaQunitUtils.renderTestAppAtAsync("content")
	.then(function(oCompCont) {
		oComp = oCompCont.getComponentInstance();
		QUnit.start();
	});

	QUnit.module("Given RTA is started...", {
		before(assert) {
			var fnDone = assert.async();
			this.oPage = Element.getElementById("Comp1---idMain1--mainPage");
			this.oSmartForm = Element.getElementById("Comp1---idMain1--MainForm");
			this.oGroup = Element.getElementById("Comp1---idMain1--GeneralLedgerDocument");
			this.oBoundGroupElement = Element.getElementById("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			this.oAnotherBoundGroupElement = Element.getElementById("Comp1---idMain1--GeneralLedgerDocument.Name");
			this.oUnBoundGroupElement = Element.getElementById("Comp1---idMain1--Victim");
			this.oMultipleFieldTwoBoundGroupElements = Element.getElementById("Comp1---idMain1--Dates.BoundButton35");
			this.oMultipleBoundFieldGroupElement = Element.getElementById("Comp1---idMain1--Dates.BoundButton35");
			this.oFieldInGroupWithoutStableId = Element.getElementById("Comp1---idMain1--FieldInGroupWithoutStableId");
			this.oSimpleFormWithTitles = Element.getElementById("Comp1---idMain1--SimpleForm");

			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl"),
				showToolbars: false
			});

			this.oRta.start().then(function() {
				this.oContextMenu = this.oRta.getPlugins().contextMenu;
				this.oContextMenuControl = this.oContextMenu.oContextMenuControl;
				// wait for Binding Context of the Group before starting the Tests
				// The Context-Menu entry for adding an element needs the Binding Context to determine entries
				if (!this.oGroup.getBindingContext()) {
					this.oGroup.attachModelContextChange(fnDone);
				} else {
					fnDone();
				}
			}.bind(this));
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isVariantAdaptationEnabled() {
					return true;
				},
				isLocalResetEnabled() {
					return true;
				}
			});
		},
		beforeEach() {
			return DtUtil.waitForSynced(this.oRta._oDesignTime)();
		},
		afterEach() {
			sandbox.restore();
			return RtaQunitUtils.closeContextMenu.call(this, this.oContextMenuControl);
		},
		after() {
			this.oRta.destroy();
		}
	}, function() {
		QUnit.test("when context menu is opened (via keyboard) for a sap.ui.comp.smartform.GroupElement", function(assert) {
			assert.expect(7);
			const done = assert.async();
			const oGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			oGroupElementOverlay.focus();
			oGroupElementOverlay.setSelected(true);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});

			window.requestAnimationFrame(async () => {
				await DtUtil.waitForSynced(this.oRta._oDesignTime)();
				await RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupElementOverlay);

				let sText = "";
				function concatItemKey(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				}
				this.oContextMenuControl.getItems().forEach(concatItemKey);
				if (this.oContextMenuControl.getItems().length === 5) {
					assert.equal(this.oContextMenuControl.getItems().length, 5, "5 Menu Items are available");
					assert.equal(this.oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "we can rename a label");
					assert.equal(this.oContextMenuControl.getItems()[1].getKey(), "CTX_ADD_ELEMENTS_AS_SIBLING",
						"add field entry is visible");
					assert.equal(this.oContextMenuControl.getItems()[2].getKey(), "CTX_REMOVE", "we can remove field");
					assert.equal(this.oContextMenuControl.getItems()[3].getKey(), "CTX_CUT", "we can cut field");
					assert.equal(this.oContextMenuControl.getItems()[4].getKey(), "CTX_PASTE", "we can paste field");
				} else {
					assert.ok(false, sText);
				}
				done();
			});
		});

		QUnit.test("when context menu is opened for a sap.ui.comp.smartform.GroupElement and no fields are available", function(assert) {
			assert.expect(8);
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			oGroupElementOverlay.focus();
			oGroupElementOverlay.setSelected(true);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			// fake no Elements available (with empty CachedElements)
			var oAdditionalElementsPlugin = this.oRta.getPlugins().additionalElements;
			sandbox.stub(oAdditionalElementsPlugin, "_combineAnalyzerResults").resolves([]);
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupElementOverlay).then(function() {
				var sText = "";
				this.oContextMenuControl.getItems().forEach(function(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				});
				if (this.oContextMenuControl.getItems().length === 5) {
					assert.equal(
						this.oContextMenuControl.getItems().length,
						5,
						"5 Menu items are available"
					);
					assert.equal(
						this.oContextMenuControl.getItems()[0].getKey(),
						"CTX_RENAME",
						"we can rename a label"
					);
					assert.equal(
						this.oContextMenuControl.getItems()[1].getKey(),
						"CTX_ADD_ELEMENTS_AS_SIBLING",
						"add field entry is visible"
					);
					assert.notOk(
						this.oContextMenuControl.getItems()[1].getEnabled(),
						"add field entry is disabled, because there are no fields available"
					);
					assert.equal(
						this.oContextMenuControl.getItems()[2].getKey(),
						"CTX_REMOVE",
						"we can remove field"
					);
					assert.equal(
						this.oContextMenuControl.getItems()[3].getKey(),
						"CTX_CUT",
						"we can cut field"
					);
					assert.equal(
						this.oContextMenuControl.getItems()[4].getKey(),
						"CTX_PASTE",
						"we can paste field"
					);
				} else {
					assert.ok(false, sText);
				}
			}.bind(this));
		});

		QUnit.test("when context menu is opened and there are no Fields available to be added", function(assert) {
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			oGroupElementOverlay.focus();
			oGroupElementOverlay.setSelected(true);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			// fake no Elements available (with undefined CachedElements)
			var oAdditionalElementsPlugin = this.oRta.getPlugins().additionalElements;
			sandbox.stub(oAdditionalElementsPlugin, "getAllElements").resolves([]);
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupElementOverlay).then(function() {
				assert.equal(this.oContextMenuControl.getItems()[1].getKey(), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field entry is visible");
				assert.equal(
					this.oContextMenuControl.getItems()[1].getEnabled(),
					false,
					"add field entry is disabled, because there are no available fields"
				);
				sandbox.restore();
			}.bind(this));
		});

		QUnit.test("when context menu is opened and there are no Fields to be added, but custom fields is available", function(assert) {
			assert.expect(3);
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			oGroupElementOverlay.focus();
			oGroupElementOverlay.setSelected(true);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			// Fake Custom Fields Creation available
			sandbox.stub(FieldExtensibility, "isExtensibilityEnabled").resolves(true);
			sandbox.stub(FieldExtensibility, "getExtensionData").resolves({});
			// fake no Elements available
			var oAdditionalElementsPlugin = this.oRta.getPlugins().additionalElements;
			sandbox.stub(oAdditionalElementsPlugin, "_combineAnalyzerResults").resolves([]);
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupElementOverlay).then(function() {
				assert.equal(this.oContextMenuControl.getItems()[1].getKey(), "CTX_ADD_ELEMENTS_AS_SIBLING", "add field entry is visible");
				assert.equal(this.oContextMenuControl.getItems()[1].getEnabled(), true,
					"add field entry is enabled, because custom fields creation is available");
				sandbox.restore();
			}.bind(this));
		});

		QUnit.test("when context menu is opened (via mouse) for a sap.ui.comp.smartform.Group", function(assert) {
			assert.expect(8);
			var oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupOverlay, sinon).then(function() {
				var sText = "";
				this.oContextMenuControl.getItems().forEach(function(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				});
				if (this.oContextMenuControl.getItems().length === 6) {
					assert.equal(this.oContextMenuControl.getItems().length, 6, "6 Menu Items are available");
					assert.equal(this.oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "we can rename a group");
					assert.equal(this.oContextMenuControl.getItems()[1].getKey(), "CTX_ADD_ELEMENTS_AS_CHILD",
						"add field entry is visible");
					assert.equal(this.oContextMenuControl.getItems()[2].getKey(), "CTX_CREATE_SIBLING_CONTAINER", "we can create group");
					assert.equal(this.oContextMenuControl.getItems()[3].getKey(), "CTX_REMOVE", "we can remove group");
					assert.equal(this.oContextMenuControl.getItems()[4].getKey(), "CTX_CUT", "we can cut group");
					assert.equal(this.oContextMenuControl.getItems()[5].getKey(), "CTX_PASTE", "we can paste group");
				} else {
					assert.ok(false, sText);
				}
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened (via keyboard) for a sap.ui.comp.smartform.SmartForm", function(assert) {
			var oFormOverlay = OverlayRegistry.getOverlay(this.oSmartForm);
			oFormOverlay.focus();
			oFormOverlay.setSelected(true);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFormOverlay).then(function() {
				assert.equal(this.oContextMenuControl.getItems()[0].getKey(), "CTX_CREATE_CHILD_CONTAINER", "we can create group");
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened on two selected GroupElements and both have bound fields", function(assert) {
			assert.expect(9);
			var oGroupElementOverlay1 = OverlayRegistry.getOverlay(this.oAnotherBoundGroupElement);
			var oGroupElementOverlay2 = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			this.oRta._oDesignTime.getSelectionManager().set([oGroupElementOverlay1, oGroupElementOverlay2]);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay1, sinon).then(function() {
				var sText = "";
				this.oContextMenuControl.getItems().forEach(function(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				});
				if (this.oContextMenuControl.getItems().length === 6) {
					assert.equal(this.oContextMenuControl.getItems().length, 6, "6 Menu Items are available");
					assert.equal(this.oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "we can rename a label");
					assert.equal(this.oContextMenuControl.getItems()[1].getKey(), "CTX_ADD_ELEMENTS_AS_SIBLING",
						"add field entry is visible");
					assert.equal(this.oContextMenuControl.getItems()[2].getKey(), "CTX_REMOVE", "we can remove field");
					assert.equal(this.oContextMenuControl.getItems()[3].getKey(), "CTX_CUT", "we can cut groups");
					assert.equal(this.oContextMenuControl.getItems()[4].getKey(), "CTX_PASTE", "we can paste groups");
					assert.equal(this.oContextMenuControl.getItems()[5].getKey(), "CTX_GROUP_FIELDS", "we can group fields");
					assert.equal(this.oContextMenuControl.getItems()[0].getEnabled(), false, "we can not rename multiple fields");
				} else {
					assert.ok(false, sText);
				}
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened on two selected GroupElements when one field has no binding", function(assert) {
			assert.expect(10);
			var oGroupElementOverlay1 = OverlayRegistry.getOverlay(this.oUnBoundGroupElement);
			var oGroupElementOverlay2 = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			this.oRta._oDesignTime.getSelectionManager().set([oGroupElementOverlay1, oGroupElementOverlay2]);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay1, sinon).then(function() {
				var sText = "";
				this.oContextMenuControl.getItems().forEach(function(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				});
				if (this.oContextMenuControl.getItems().length === 6) {
					assert.equal(this.oContextMenuControl.getItems().length, 6, "6 Menu Items are available");
					assert.equal(this.oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "we can rename a label");
					assert.equal(this.oContextMenuControl.getItems()[1].getKey(), "CTX_ADD_ELEMENTS_AS_SIBLING",
						"add field entry is visible");
					assert.equal(this.oContextMenuControl.getItems()[2].getKey(), "CTX_REMOVE", "we can remove field");
					assert.equal(this.oContextMenuControl.getItems()[3].getKey(), "CTX_CUT", "we can cut groups");
					assert.equal(this.oContextMenuControl.getItems()[4].getKey(), "CTX_PASTE", "we can paste groups");
					assert.equal(this.oContextMenuControl.getItems()[5].getKey(), "CTX_GROUP_FIELDS", "group fields is there ");
					assert.equal(this.oContextMenuControl.getItems()[0].getEnabled(), false, "we can not rename multiple fields");
					assert.equal(this.oContextMenuControl.getItems()[5].getEnabled(), true, "we can group fields");
				} else {
					assert.ok(false, sText);
				}
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened on GroupElement when two fields, one field has no binding", function(assert) {
			assert.expect(9);
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oMultipleFieldTwoBoundGroupElements);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay, sinon).then(function() {
				var sText = "";
				this.oContextMenuControl.getItems().forEach(function(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				});
				if (this.oContextMenuControl.getItems().length === 6) {
					assert.equal(this.oContextMenuControl.getItems().length, 6, "6 Menu Items are available");
					assert.equal(this.oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "we can rename a label");
					assert.equal(this.oContextMenuControl.getItems()[1].getKey(), "CTX_ADD_ELEMENTS_AS_SIBLING",
						"add field entry is visible");
					assert.equal(this.oContextMenuControl.getItems()[2].getKey(), "CTX_REMOVE", "we can remove field");
					assert.equal(this.oContextMenuControl.getItems()[3].getKey(), "CTX_CUT", "we can cut groups");
					assert.equal(this.oContextMenuControl.getItems()[4].getKey(), "CTX_PASTE", "we can paste groups");
					assert.equal(this.oContextMenuControl.getItems()[5].getKey(), "CTX_UNGROUP_FIELDS", "ungroup fields is there ");
					assert.equal(this.oContextMenuControl.getItems()[5].getEnabled(), true, "we can ungroup fields");
				} else {
					assert.ok(false, sText);
				}
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened on GroupElement with two fields", function(assert) {
			assert.expect(9);
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oMultipleBoundFieldGroupElement);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay, sinon).then(function() {
				var sText = "";
				this.oContextMenuControl.getItems().forEach(function(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				});
				if (this.oContextMenuControl.getItems().length === 6) {
					assert.equal(this.oContextMenuControl.getItems().length, 6, "6 Menu Items are available");
					assert.equal(this.oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "we can rename a label");
					assert.equal(this.oContextMenuControl.getItems()[1].getKey(), "CTX_ADD_ELEMENTS_AS_SIBLING",
						"add field entry is visible");
					assert.equal(this.oContextMenuControl.getItems()[2].getKey(), "CTX_REMOVE", "we can remove field");
					assert.equal(this.oContextMenuControl.getItems()[3].getKey(), "CTX_CUT", "we can cut groups");
					assert.equal(this.oContextMenuControl.getItems()[4].getKey(), "CTX_PASTE", "we can paste groups");
					assert.equal(this.oContextMenuControl.getItems()[5].getKey(), "CTX_UNGROUP_FIELDS", "ungroup fields is there ");
					assert.equal(this.oContextMenuControl.getItems()[5].getEnabled(), true, "we can ungroup fields");
				} else {
					assert.ok(false, sText);
				}
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened on GroupElement with stable id, but the Group has no stable id", function(assert) {
			assert.expect(6);
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oFieldInGroupWithoutStableId);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithClick.call(this, oGroupElementOverlay, sinon).then(function() {
				var sText = "";
				this.oContextMenuControl.getItems().forEach(function(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				});
				if (this.oContextMenuControl.getItems().length === 2) {
					assert.equal(this.oContextMenuControl.getItems().length, 2, "2 Menu Items are available");
					assert.equal(this.oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "rename is available");
					assert.equal(this.oContextMenuControl.getItems()[0].getEnabled(), true, "and rename is enabled");
					assert.equal(this.oContextMenuControl.getItems()[1].getKey(), "CTX_REMOVE", "remove field is available");
					assert.equal(this.oContextMenuControl.getItems()[1].getEnabled(), true, "we can remove the field");
				} else {
					assert.ok(false, sText);
				}
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened on a Control with a defined settings action", function(assert) {
			var oSettings = this.oRta.getPlugins().settings;

			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves(PropertyChange);
			var oGroupDesigntime = {
				settings() {
					return {
						changeType: "changeSettings",
						isEnabled: true,
						handler() {}
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
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupOverlay).then(function() {
				assert.equal(
					this.oContextMenuControl.getItems()[this.oContextMenuControl.getItems().length - 1].getKey(),
					"CTX_SETTINGS",
					"Settings is available"
				);
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened (via keyboard) for a sap.m.Page without title", async function(assert) {
			assert.expect(4);
			this.oPage._headerTitle.destroy();
			await nextUIUpdate();
			this.oPage._headerTitle = null;
			var oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
			oPageOverlay.focus();
			oPageOverlay.setSelected(true);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oPageOverlay).then(function() {
				assert.equal(this.oContextMenuControl.getItems().length, 1, "1 Menu Item is available");
				assert.equal(this.oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "rename Page is available");
				assert.equal(this.oContextMenuControl.getItems()[0].getEnabled(), false, "but rename Page is disabled");
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened (via keyboard) for a SimpleForm FormElement", function(assert) {
			assert.expect(7);
			var oLabel = this.oSimpleFormWithTitles.getContent()[3];
			var oFormElement = oLabel.getParent();
			var oFormElementOverlay = OverlayRegistry.getOverlay(oFormElement);
			oFormElementOverlay.focus();
			oFormElementOverlay.setSelected(true);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFormElementOverlay).then(function() {
				var sText = "";
				this.oContextMenuControl.getItems().forEach(function(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				});
				if (this.oContextMenuControl.getItems().length === 5) {
					assert.equal(this.oContextMenuControl.getItems().length, 5, "5 Menu Items are available");
					assert.equal(this.oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "rename label is available");
					assert.equal(this.oContextMenuControl.getItems()[1].getKey(), "CTX_ADD_ELEMENTS_AS_SIBLING",
						"add field entry is visible");
					assert.equal(this.oContextMenuControl.getItems()[2].getKey(), "CTX_REMOVE", "remove field is available");
					assert.equal(this.oContextMenuControl.getItems()[3].getKey(), "CTX_CUT", "cut field is available");
					assert.equal(this.oContextMenuControl.getItems()[4].getKey(), "CTX_PASTE", "paste field is available");
				} else {
					assert.ok(false, sText);
				}
			}.bind(this));
		});

		QUnit.test("when trying to open ContextMenu (via keyboard using ENTER) after an Overlay was renamed (finishing with ENTER)", function(assert) {
			var fnDone = assert.async();
			var oLabel = this.oSimpleFormWithTitles.getContent()[3];
			var oFormElement = oLabel.getParent();
			var oFormElementOverlay = OverlayRegistry.getOverlay(oFormElement);
			oFormElementOverlay.focus();
			oFormElementOverlay.setSelected(true);
			oFormElementOverlay.setIgnoreEnterKeyUpOnce(true); // flag that the Overlay has just been renamed
			var oParams = {};
			oParams.keyCode = KeyCodes.ENTER;
			oParams.which = oParams.keyCode;
			oParams.shiftKey = false;
			oParams.altKey = false;
			oParams.metaKey = false;
			oParams.ctrlKey = false;
			var bFirstCallIgnored;

			function fnExecuteChecks() {
				assert.ok(bFirstCallIgnored, "the context menu only opens when ENTER is pressed again after the rename is completed");
				assert.notOk(oFormElementOverlay.getIgnoreEnterKeyUpOnce(),
					"the 'ignoreEnterKeyUpOnce' property on the Overlay was set to false by the first call");
				fnDone();
			}

			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", fnExecuteChecks);
			QUnitUtils.triggerEvent("keyup", oFormElementOverlay.getDomRef(), oParams); // should be ignored
			bFirstCallIgnored = true;
			QUnitUtils.triggerEvent("keyup", oFormElementOverlay.getDomRef(), oParams);
		});

		QUnit.test("when context menu (context menu) is opened (via keyboard) for a SimpleForm with Title", function(assert) {
			assert.expect(4);
			var oForm = this.oSimpleFormWithTitles.getAggregation("form");
			var oFormOverlay = OverlayRegistry.getOverlay(oForm);
			oFormOverlay.focus();
			oFormOverlay.setSelected(true);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFormOverlay).then(function() {
				assert.equal(this.oContextMenuControl.getItems().length, 2, "2 Menu Items are available");
				assert.equal(this.oContextMenuControl.getItems()[0].getKey(), "CTX_CREATE_CHILD_CONTAINER", "create group is available");
				assert.equal(this.oContextMenuControl.getItems()[1].getKey(), "CTX_LOCAL_RESET", "local reset is available");
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened (via keyboard) for a SimpleForm Group with Title", function(assert) {
			var oTitle = this.oSimpleFormWithTitles.getContent()[0];
			var oFormContainer = oTitle.getParent();
			var oFormContainerOverlay = OverlayRegistry.getOverlay(oFormContainer);
			oFormContainerOverlay.focus();
			oFormContainerOverlay.setSelected(true);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFormContainerOverlay).then(function() {
				var sText = "";
				this.oContextMenuControl.getItems().forEach(function(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				});
				if (this.oContextMenuControl.getItems().length === 5) {
					assert.equal(this.oContextMenuControl.getItems().length, 5, "5 Menu Items are available");
					assert.equal(this.oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "rename title is available");
					assert.equal(this.oContextMenuControl.getItems()[0].getEnabled(), true, "and rename title is enabled");
					assert.equal(this.oContextMenuControl.getItems()[1].getKey(), "CTX_ADD_ELEMENTS_AS_CHILD",
						"add field entry is visible");
					assert.equal(this.oContextMenuControl.getItems()[2].getKey(), "CTX_CREATE_SIBLING_CONTAINER",
						"create group is available");
					assert.equal(this.oContextMenuControl.getItems()[3].getKey(), "CTX_REMOVE", "remove group is available");
					assert.equal(this.oContextMenuControl.getItems()[4].getKey(), "CTX_PASTE", "paste field is available");
				} else {
					assert.ok(false, sText);
				}
			}.bind(this));
		});

		QUnit.test("when the context menu is opened twice on the same element", function(assert) {
			assert.expect(2);
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.getContextMenuItemCount.call(this, oGroupElementOverlay).then(function(iExpectedMenuItemsCount) {
				oGroupElementOverlay.focus();
				oGroupElementOverlay.setSelected(true);

				RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupElementOverlay);
				return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupElementOverlay).then(function() {
					assert.equal(this.oContextMenuControl.getItems().length, iExpectedMenuItemsCount,
						"the second open is ignored and the five menu items are only added once");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("when the context menu is opened twice on different elements", function(assert) {
			assert.expect(2);
			var oGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);
			var oFormOverlay = OverlayRegistry.getOverlay(this.oSmartForm);
			this.oContextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});

			return RtaQunitUtils.getContextMenuItemCount.call(this, oGroupElementOverlay).then(function(iExpectedMenuItemsCount) {
				oFormOverlay.focus();
				oFormOverlay.setSelected(true);
				RtaQunitUtils.openContextMenuWithKeyboard.call(this, oFormOverlay);

				oGroupElementOverlay.focus();
				oGroupElementOverlay.setSelected(true);
				return RtaQunitUtils.openContextMenuWithKeyboard.call(this, oGroupElementOverlay).then(function() {
					assert.equal(this.oContextMenuControl.getItems().length, iExpectedMenuItemsCount,
						"the first open is canceled and the five menu items are only added once");
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Given RTA is started for Object Page...", {
		async before() {
			// View
			// 	Page
			// 		ObjectPageLayout
			//			ObjectPageSection - visible
			//				ObjectPageSubSection
			//					Button
			//			ObjectPageSection - invisible
			//			ObjectPageSection - visible
			//				ObjectPageSubSection
			//					Button
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);

			var oEmbeddedView = Element.getElementById("Comp1---idMain1");

			var oSubSection = new ObjectPageSubSection({
				id: oEmbeddedView.createId("subsection1"),
				blocks: [new Button({text: "ButtonSubsection1"})]
			});

			var oSubSection2 = new ObjectPageSubSection({
				id: oEmbeddedView.createId("subsection2"),
				blocks: [new Button({text: "ButtonSubsection2"})]
			});

			var oSubSection3 = new ObjectPageSubSection({
				id: oEmbeddedView.createId("subsection3"),
				blocks: [new IFrame()]
			});

			this.oObjectPageSection1 = new ObjectPageSection({
				id: oEmbeddedView.createId("section1"),
				title: "Section_1",
				visible: true,
				subSections: [oSubSection]
			});

			var oObjectPageSection2 = new ObjectPageSection({
				id: oEmbeddedView.createId("section2"),
				title: "Section_2",
				visible: false
			});

			var oObjectPageSection3 = new ObjectPageSection({
				id: oEmbeddedView.createId("section3"),
				title: "Section_3",
				visible: true,
				subSections: [oSubSection2]
			});

			this.oObjectPageSection3 = oObjectPageSection3;

			this.oObjectPageSection4 = new ObjectPageSection({
				id: oEmbeddedView.createId("section4"),
				title: "Section_4",
				visible: true,
				subSections: [oSubSection3]
			});

			var oEmbeddedPage = Element.getElementById("Comp1---idMain1--mainPage");

			this.oObjectPageLayout = new ObjectPageLayout({
				id: oEmbeddedView.createId("ObjectPageLayout"),
				sections: [
					this.oObjectPageSection1,
					oObjectPageSection2,
					oObjectPageSection3,
					this.oObjectPageSection4
				]
			});
			oEmbeddedPage.addContent(this.oObjectPageLayout);
			var clock = sinon.useFakeTimers();
			// If the content is not set to a bigger width, the anchor bar will collapse
			// and the anchor bar buttons are not rendered, thus evaluateEditable is not calculated
			document.getElementById("content").style.width = "1000px";
			clock.tick(1000);
			await nextUIUpdate();
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oObjectPageLayout,
				showToolbars: false
			});

			clock.restore();
			return this.oRta.start();
		},
		after() {
			this.oObjectPageLayout.destroy();
			this.oMockedAppComponent._restoreGetAppComponentStub();
			this.oMockedAppComponent.destroy();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when context menu (context menu) is opened on ObjectPageSection", function(assert) {
			assert.expect(13);
			var oOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection1);
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithClick.call(this, oOverlay, sinon).then(function() {
				var {oContextMenuControl} = this.oRta.getPlugins().contextMenu;
				var sText = "";
				oContextMenuControl.getItems().forEach(function(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				});
				if (oContextMenuControl.getItems().length === 5) {
					assert.equal(oContextMenuControl.getItems().length, 5, " and 5 Menu Items are available");
					assert.equal(oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "rename section is available");
					assert.equal(oContextMenuControl.getItems()[0].getEnabled(), false, "rename section is disabled");
					assert.equal(oContextMenuControl.getItems()[1].getKey(), "CTX_ADD_ELEMENTS_AS_SIBLING", "add section is available");
					assert.equal(oContextMenuControl.getItems()[1].getEnabled(), true, "add section is enabled");
					assert.equal(oContextMenuControl.getItems()[1].getText(), "Add: Section", "add section has the correct text");
					assert.equal(oContextMenuControl.getItems()[2].getKey(), "CTX_REMOVE", "remove section is available");
					assert.equal(oContextMenuControl.getItems()[2].getEnabled(), true, "we can remove a section");
					assert.equal(oContextMenuControl.getItems()[3].getKey(), "CTX_CUT", "cut sections available");
					assert.equal(oContextMenuControl.getItems()[3].getEnabled(), true, "cut is enabled");
					assert.equal(oContextMenuControl.getItems()[4].getKey(), "CTX_PASTE", "paste is available");
					assert.equal(oContextMenuControl.getItems()[4].getEnabled(), false, "we cannot paste a section");
				} else {
					assert.ok(false, sText);
				}
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened on ObjectPageSection3", function(assert) {
			assert.expect(13);
			var oOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection3);
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithClick.call(this, oOverlay, sinon).then(function() {
				var {oContextMenuControl} = this.oRta.getPlugins().contextMenu;
				var sText = "";
				oContextMenuControl.getItems().forEach(function(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				});
				if (oContextMenuControl.getItems().length === 5) {
					assert.equal(oContextMenuControl.getItems().length, 5, " and 5 Menu Items are available");
					assert.equal(oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "rename section is available");
					assert.equal(oContextMenuControl.getItems()[0].getEnabled(), true, "rename section is enabled");
					assert.equal(oContextMenuControl.getItems()[1].getKey(), "CTX_ADD_ELEMENTS_AS_SIBLING", "add section is available");
					assert.equal(oContextMenuControl.getItems()[1].getEnabled(), true, "add section is enabled");
					assert.equal(oContextMenuControl.getItems()[1].getText(), "Add: Section", "add section has the correct text");
					assert.equal(oContextMenuControl.getItems()[2].getKey(), "CTX_REMOVE", "remove section is available");
					assert.equal(oContextMenuControl.getItems()[2].getEnabled(), true, "we can remove a section");
					assert.equal(oContextMenuControl.getItems()[3].getKey(), "CTX_CUT", "cut sections available");
					assert.equal(oContextMenuControl.getItems()[3].getEnabled(), true, "cut is enabled");
					assert.equal(oContextMenuControl.getItems()[4].getKey(), "CTX_PASTE", "paste is available");
					assert.equal(oContextMenuControl.getItems()[4].getEnabled(), false, "we cannot paste a section");
				} else {
					assert.ok(false, sText);
				}
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened on ObjectPageSection on the anchor bar", function(assert) {
			assert.expect(13);
			var oOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout.getAggregation("_anchorBar").getItems()[0]);
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithClick.call(this, oOverlay, sinon).then(function() {
				var {oContextMenuControl} = this.oRta.getPlugins().contextMenu;
				var sText = "";
				oContextMenuControl.getItems().forEach(function(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				});
				if (oContextMenuControl.getItems().length === 5) {
					assert.equal(oContextMenuControl.getItems().length, 5, " and 5 Menu Items are available");
					assert.equal(oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "rename section is available");
					assert.equal(oContextMenuControl.getItems()[0].getEnabled(), true, "rename section is enabled");
					assert.equal(oContextMenuControl.getItems()[1].getKey(), "CTX_ADD_ELEMENTS_AS_SIBLING", "add section is available");
					assert.equal(oContextMenuControl.getItems()[1].getEnabled(), true, "add section is enabled");
					assert.equal(oContextMenuControl.getItems()[1].getText(), "Add: Section", "add section has the correct text");
					assert.equal(oContextMenuControl.getItems()[2].getKey(), "CTX_REMOVE", "remove section is available");
					assert.equal(oContextMenuControl.getItems()[2].getEnabled(), true, "we can remove a section");
					assert.equal(oContextMenuControl.getItems()[3].getKey(), "CTX_CUT", "cut sections available");
					assert.equal(oContextMenuControl.getItems()[3].getEnabled(), true, "cut is enabled");
					assert.equal(oContextMenuControl.getItems()[4].getKey(), "CTX_PASTE", "paste is available");
					assert.equal(oContextMenuControl.getItems()[4].getEnabled(), false, "we cannot paste a section");
				} else {
					assert.ok(false, sText);
				}
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened on ObjectPageSection that contains an iFrame", function(assert) {
			const oOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection4);
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithClick.call(this, oOverlay, sinon).then(function() {
				const {oContextMenuControl} = this.oRta.getPlugins().contextMenu;
				assert.strictEqual(oContextMenuControl.getItems().length, 6, " and 6 Menu Items are available");
				assert.strictEqual(
					oContextMenuControl.getItems()[5].getKey(),
					"CTX_SETTINGS",
					"settings action is available (update embedded content)"
				);
				assert.strictEqual(
					oContextMenuControl.getItems()[5].getEnabled(),
					true,
					"update embedded content is enabled (update embedded content)"
				);
			}.bind(this));
		});

		QUnit.test("when context menu (context menu) is opened on ObjectPageSection on the anchorbar that contains an iFrame", async function(assert) {
			const oObjectPageSection4 = this.oObjectPageLayout.getSections()[3];
			this.oObjectPageLayout.removeSection(oObjectPageSection4);
			this.oObjectPageLayout.insertSection(oObjectPageSection4, 0);
			await nextUIUpdate();
			await DtUtil.waitForSynced(this.oRta._oDesignTime)();
			const oOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout.getAggregation("_anchorBar").getItems()[0]);
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithClick.call(this, oOverlay, sinon).then(function() {
				const {oContextMenuControl} = this.oRta.getPlugins().contextMenu;
				assert.strictEqual(oContextMenuControl.getItems().length, 6, " and 6 Menu Items are available");
				assert.strictEqual(
					oContextMenuControl.getItems()[5].getKey(),
					"CTX_SETTINGS",
					"settings action is available (update embedded content)"
				);
				assert.strictEqual(
					oContextMenuControl.getItems()[5].getEnabled(),
					true,
					"update embedded content is enabled (update embedded content)"
				);
			}.bind(this));
		});
	});

	QUnit.module("Given RTA is started for Object Page without stable ids...", {
		async beforeEach() {
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);

			var oSubSection = new ObjectPageSubSection({
				id: "subsection1",
				blocks: [new Button({text: "abc"})]
			});

			this.oObjectPageSection1 = new ObjectPageSection({
				id: "section1",
				title: "Section_1",
				visible: true,
				subSections: [oSubSection]
			});

			var oObjectPageSection2 = new ObjectPageSection({
				id: "section2",
				title: "Section_2",
				visible: false
			});

			var oObjectPageSection3 = new ObjectPageSection({
				id: "section3",
				title: "Section_3",
				visible: true
			});

			this.oObjectPageLayout = new ObjectPageLayout({
				sections: [
					this.oObjectPageSection1,
					oObjectPageSection2,
					oObjectPageSection3
				]
			});
			this.oObjectPageLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oRta = new RuntimeAuthoring({
				rootControl: this.oObjectPageLayout,
				showToolbars: false
			});

			return this.oRta.start();
		},
		afterEach() {
			this.oRta.destroy();
			this.oMockedAppComponent.destroy();
			this.oObjectPageLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when context menu (context menu) is opened on ObjectPageSection", function(assert) {
			assert.expect(6);
			var oOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection1);
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithClick.call(this, oOverlay, sinon).then(function() {
				var {oContextMenuControl} = this.oRta.getPlugins().contextMenu;
				var sText = "";
				oContextMenuControl.getItems().forEach(function(oItem) {
					sText = `${sText} - ${oItem.getKey()}`;
				});
				if (oContextMenuControl.getItems().length === 2) {
					assert.equal(oContextMenuControl.getItems().length, 2, " and 2 Menu Items are available");
					assert.equal(oContextMenuControl.getItems()[0].getKey(), "CTX_RENAME", "rename section is available");
					assert.equal(oContextMenuControl.getItems()[0].getEnabled(), true, "rename section is enabled");
					assert.equal(oContextMenuControl.getItems()[1].getKey(), "CTX_REMOVE", "remove section is available");
					assert.equal(oContextMenuControl.getItems()[1].getEnabled(), true, "we can remove a section");
				} else {
					assert.ok(false, sText);
				}
				oContextMenuControl.close();
			}.bind(this));
		});
	});

	QUnit.module("Given RTA is started for Object Page...", {
		async beforeEach() {
			var oEmbeddedView = Element.getElementById("Comp1---idMain1");

			this.oObjectPageSection1 = new ObjectPageSection({
				title: "Section_1",
				visible: false
			});

			this.oObjectPageSection2 = new ObjectPageSection({
				title: "Section_2",
				visible: false
			});

			var oEmbeddedPage = Element.getElementById("Comp1---idMain1--mainPage");

			this.oObjectPageLayout = new ObjectPageLayout({
				id: oEmbeddedView.createId("ObjectPageLayout"),
				sections: [
					this.oObjectPageSection1,
					this.oObjectPageSection2
				]
			});

			var oPage = new Page({
				id: oEmbeddedView.createId("Page")
			});
			oPage.addContent(this.oObjectPageLayout);
			oEmbeddedPage.addContent(oPage);
			await nextUIUpdate();

			this.oRta = new RuntimeAuthoring({
				rootControl: oPage,
				showToolbars: false
			});

			return this.oRta.start();
		},
		afterEach() {
			this.oRta.destroy();
			this.oObjectPageLayout.destroy();
		}
	}, function() {
		QUnit.test("when context menu (context menu) is opened on ObjectPageLayout, and the Section has an unstable ID and is hidden, ", function(assert) {
			assert.expect(7);
			var oOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout);
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", function() {
				assert.ok(true, "the contextMenu is open");
			});
			return RtaQunitUtils.openContextMenuWithClick.call(this, oOverlay, sinon).then(function() {
				var {oContextMenuControl} = this.oRta.getPlugins().contextMenu;
				assert.ok(oOverlay.isEditable(), "then the overlay is editable");
				if (oContextMenuControl.getItems().length === 2) {
					assert.equal(oContextMenuControl.getItems().length, 2, " and 2 Menu Items are available");
					assert.equal(oContextMenuControl.getItems()[0].getKey(), "CTX_CREATE_CHILD_IFRAME_SECTIONS",
						"add iframe to section is available");
					assert.equal(oContextMenuControl.getItems()[0].getEnabled(), true, "add iframe to section is enabled");
					assert.equal(oContextMenuControl.getItems()[1].getKey(), "CTX_CREATE_CHILD_IFRAME_HEADERCONTENT",
						"add iframe to header is available");
					assert.equal(oContextMenuControl.getItems()[1].getEnabled(), true, "add iframe to header is enabled");
				} else {
					assert.ok(false, "but shows the wrong number of menu items");
				}
			}.bind(this));
		});
	});

	QUnit.done(function() {
		if (oComp) {
			oComp.destroy();
		}
		document.getElementById("content").style.display = "none";
		document.getElementById("qunit-fixture").style.display = "none";
	});
});