/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
	"sap/m/GenericTile",
	"sap/m/TileContent",
	"sap/m/NumericContent",
	"sap/m/ImageContent",
	"sap/ui/Device",
	"sap/ui/core/IntervalTrigger",
	"sap/ui/core/ResizeHandler",
	"sap/m/GenericTileLineModeRenderer",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/ScrollContainer",
	"sap/m/FlexBox",
	"sap/m/GenericTileRenderer",
	"sap/m/library",
	"sap/base/util/isEmptyObject",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"sap/f/GridContainerItemLayoutData",
	"sap/f/GridContainerSettings",
	"sap/f/GridContainer",
	"sap/m/FormattedText",
	"sap/m/NewsContent",
	"sap/ui/core/theming/Parameters",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/dnd/DragInfo",
	"sap/f/dnd/GridDropInfo",
	"sap/ui/core/Theming",
	"sap/m/LinkTileContent",
	"sap/m/TileInfo",
	"sap/ui/qunit/utils/nextUIUpdate",
	/* jQuery custom selectors ":sapTabbable"*/
	"sap/ui/dom/jquery/Selectors",
	// used only indirectly
	"sap/ui/events/jquery/EventExtension"
], function(Localization, Element, Library, jQuery, GenericTile, TileContent, NumericContent, ImageContent, Device, IntervalTrigger, ResizeHandler, GenericTileLineModeRenderer, Button, Text, ScrollContainer, FlexBox, GenericTileRenderer, library, isEmptyObject, KeyCodes, oCore, GridContainerItemLayoutData, GridContainerSettings, GridContainer, FormattedText, NewsContent, Parameters, qutils, DragInfo, GridDropInfo, Theming, LinkTileContent, Badge, nextUIUpdate) {
	"use strict";

	// shortcut for sap.m.Size
	var Size = library.Size;

	// shortcut for sap.m.DeviationIndicator
	var DeviationIndicator = library.DeviationIndicator;

	// shortcut for sap.m.FrameType
	var FrameType = library.FrameType;

	// shortcut for sap.m.TileSizeBehavior
	var TileSizeBehavior = library.TileSizeBehavior;

	// shortcut for sap.m.ValueColor
	var ValueColor = library.ValueColor;

	// shortcut for sap.m.LoadState
	var LoadState = library.LoadState;

	// shortcut for sap.m.GenericTileMode
	var GenericTileMode = library.GenericTileMode;

	//shortcut for sap.m.Priority
	var Priority = library.Priority;

	// shortcut for sap.m.GenericTileScope
	var GenericTileScope = library.GenericTileScope;

	// shortcut for sap.m.TileInfoColor
	var TileInfoColor = library.TileInfoColor;

	var IMAGE_PATH = "test-resources/sap/m/images/";

	function createMouseEnterEvent() {
		return new Event("mouseenter");
	}

	function createMouseLeaveEvent() {
		return new Event("mouseleave");
	}

	function hexToRgb(hex) {
		var result = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(hex);
		var clr = result ? {
			r: parseInt(result[1].length === 1 ? result[1] + result[1] : result[1], 16),
			g: parseInt(result[2].length === 1 ? result[2] + result[2] : result[2], 16),
			b: parseInt(result[3].length === 1 ? result[3] + result[3] : result[3], 16)
		} : null;
		if (clr) {
			return "rgb(" + clr.r + ", " + clr.g + ", " + clr.b + ")";
		}
		return hex;
	}

	QUnit.module("Control initialization core and theme checks", {
		beforeEach: function() {
			this.fnSpyReady = this.spy(oCore, "ready");
			this.fnSpyHandleCoreInitialized = this.spy(GenericTile.prototype, "_handleCoreInitialized");
			this.fnStubAttachThemeApplied = this.stub(Theming, "attachApplied").callsFake(function(fn, context) {
				fn.call(context); //simulate immediate theme change
			});
			this.fnSpyHandleThemeApplied = this.spy(GenericTile.prototype, "_handleThemeApplied");
		},
		afterEach: function() {
		}
	});

	QUnit.test("Core initialization check - core and theme", function(assert) {
		//Act
		var oTile = new GenericTile();

		//Assert
		assert.ok(oTile._bThemeApplied, "Rendering variable has been correctly set.");
		assert.ok(this.fnSpyReady.calledOnce, "Method Core.ready has been called once.");
		assert.ok(this.fnSpyHandleCoreInitialized.calledOnce, "Method _handleCoreInitialized has been called once.");
		assert.ok(this.fnStubAttachThemeApplied.calledOnce, "Method Core.attachThemeChanged has been called once.");
		assert.ok(this.fnSpyHandleThemeApplied.calledOnce, "Method _handleThemeApplied has been called once.");
	});

	QUnit.test("Clamp title height when theme is ready", function(assert) {
		//Arrange
		this.spy(Text.prototype, "clampHeight");

		//Act
		new GenericTile();

		//Assert
		assert.ok(Text.prototype.clampHeight.calledOnce, "The tile's title height has been recalculated.");
	});

	QUnit.module("Default values", {
		beforeEach: function() {
			this.oGenericTile = new GenericTile();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Default value of mode", function(assert) {
		assert.strictEqual(this.oGenericTile.getProperty("mode"), GenericTileMode.ContentMode);
	});
	QUnit.test("Default value of header", function(assert) {
		assert.strictEqual(this.oGenericTile.getProperty("header"), "");
	});
	QUnit.test("Default value of subheader", function(assert) {
		assert.strictEqual(this.oGenericTile.getProperty("subheader"), "");
	});
	QUnit.test("Default value of failedText", function(assert) {
		assert.strictEqual(this.oGenericTile.getProperty("failedText"), "");
	});

	QUnit.test("Default value of frameType", function(assert) {
		assert.strictEqual(this.oGenericTile.getProperty("frameType"), FrameType.OneByOne);
	});
	QUnit.test("Default value of backgroundImage", function(assert) {
		assert.strictEqual(this.oGenericTile.getProperty("backgroundImage"), "");
	});
	QUnit.test("Default value of headerImage", function(assert) {
		assert.strictEqual(this.oGenericTile.getProperty("headerImage"), "");
	});
	QUnit.test("Default value of state", function(assert) {
		assert.strictEqual(this.oGenericTile.getProperty("state"), LoadState.Loaded);
	});
	QUnit.test("Default value of imageDescription", function(assert) {
		assert.strictEqual(this.oGenericTile.getProperty("imageDescription"), "");
	});
	QUnit.test("Default value of scope", function(assert) {
		assert.strictEqual(this.oGenericTile.getProperty("scope"), GenericTileScope.Display);
	});
	QUnit.test("Default value of iconLoaded", function(assert) {
		assert.strictEqual(this.oGenericTile.getProperty("iconLoaded"), true);
	});

	QUnit.module("Rendering tests", {
		beforeEach: async function() {
			this.fnSpyBeforeRendering = this.spy(GenericTile.prototype, "onBeforeRendering");
			this.fnSpysetUpResizeHandler = this.spy(GenericTile.prototype, "_setupResizeClassHandler");
			this.oGenericTile = new GenericTile("generic-tile", {
				subheader: "Expenses By Region",
				frameType: FrameType.OneByOne,
				header: "Comparative Annual Totals",
				headerImage: IMAGE_PATH + "female_BaySu.jpg",
				tileContent: new TileContent("tile-cont", {
					unit: "EUR",
					footer: "Current Quarter",
					content: new NumericContent("numeric-cnt", {
						state: LoadState.Loaded,
						scale: "M",
						indicator: DeviationIndicator.Up,
						truncateValueTo: 4,
						value: 20,
						nullifyValue: true,
						formatterValue: false,
						valueColor: ValueColor.Good,
						withMargin: false,
						icon: "sap-icon://customer-financial-fact-sheet"
					})
				}),
				press: function() {} //attach empty press to enable :focus state
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			this.sStartTheme = Theming.getTheme();
			this.sRequiredTheme = null;

			var fnAttachApplied = (oEvent) => {
				Theming.detachApplied(fnAttachApplied);
				if (Theming.getTheme() === this.sRequiredTheme) {
					if (typeof this.fnCallback === "function") {
						this.fnCallback.bind(this)();
						this.fnCallback = undefined;
					}
				}
			};

			this.applyTheme = function(sTheme, fnCallback) {
				this.fnCallback = fnCallback;
				this.sRequiredTheme = sTheme;
				if (Theming.getTheme() === this.sRequiredTheme) {
					if (typeof fnCallback === "function") {
						fnCallback.bind(this)();
						fnCallback = undefined;
					}
				} else {
					Theming.setTheme(sTheme);
					Theming.attachApplied(fnAttachApplied.bind(this));
				}
			};

			// In case dev tools are open, focus setting is not possible. If so, disable the test
			this.checkFocus = function($Control) {
				return $Control.is(":focus");
			};
		},
		afterEach: function(assert) {
			this.oGenericTile.destroy();
			this.oGenericTile = null;

			var done = assert.async();
			this.applyTheme(this.sStartTheme, done);
		},
		fnWithRenderAsserts: function(assert) {
			assert.ok(document.getElementById("generic-tile"), "Generic tile was rendered successfully");
			assert.ok(document.getElementById("generic-tile-hdr-text"), "Generic tile header was rendered successfully");
			assert.ok(document.getElementById("generic-tile-subHdr-text"), "Generic tile subheader was rendered successfully");
			assert.ok(document.getElementById("generic-tile-icon-image"), "Generic tile icon was rendered successfully");
			assert.ok(document.getElementById("tile-cont"), "TileContent was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt"), "NumericContent was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt-indicator"), "Indicator was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt-value"), "Value was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt-scale"), "Scale was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt-icon-image"), "Icon was rendered successfully");
			assert.ok(this.oGenericTile.$().hasClass("OneByOne"), "FrameType class has been added");
		}
	});

	QUnit.test("OnBeforeRendering is called once", function(assert) {
		assert.ok(this.fnSpyBeforeRendering.calledOnce, "Generic tile was rendered only once");
	});
	QUnit.test("Resize Event handler is attached only once", function(assert) {
		assert.ok(this.fnSpysetUpResizeHandler.called, "Generic Tile resize event handler attached");
	});

	QUnit.test("GenericTile rendered", function(assert) {
		this.fnWithRenderAsserts(assert);

		var oLinkElements = document.getElementById("generic-tile").childNodes;
		assert.notStrictEqual(oLinkElements.length, 1, "There is no tag wrapped around the tile.");
	});

	QUnit.test("GenericTile rendered with custom width", async function(assert) {
		this.oGenericTile.setWidth("500px");
		await nextUIUpdate();

		this.fnWithRenderAsserts(assert);
	});

	QUnit.test("Numeric Content rendering", function(assert) {
		assert.ok(this.oGenericTile.mAggregations.tileContent[0].mAggregations.content.getDomRef().classList.value, "sapMNCValue WithoutMargin Good Loaded", "NumericContent assigned properly in the tile");
	});

	QUnit.test("GenericTile not rendered with link when in action mode", async function(assert) {
		//Arrange
		var sLink = "http://localhost/myLink";
		this.oGenericTile.setUrl(sLink);
		this.oGenericTile.setScope(GenericTileScope.Actions);

		//Act
		await nextUIUpdate();

		//Assert
		var oTileElements = document.getElementById("generic-tile").childNodes;

		this.fnWithRenderAsserts(assert);
		assert.notStrictEqual(oTileElements[0].tagName, "A", "The node is not a link.");
	});

	QUnit.test("GenericTile not rendered with link when in disabled state", async function(assert) {
		//Arrange
		var sLink = "http://localhost/myLink";
		this.oGenericTile.setUrl(sLink);
		this.oGenericTile.setState("Disabled");
		await nextUIUpdate();

		var oTileElements = document.getElementById("generic-tile").childNodes;

		this.fnWithRenderAsserts(assert);
		assert.notStrictEqual(oTileElements[0].tagName, "A", "The node is not a link.");
	});

	QUnit.test("GenericTile rendered with link when not in action mode", async function(assert) {
		//Arrange
		var sLink = "http://localhost/myLink";
		this.oGenericTile.setUrl(sLink);
		this.oGenericTile.setScope(GenericTileScope.Display);

		//Act
		await nextUIUpdate();

		//Assert
		var oTileElement = document.getElementById("generic-tile");
		var sDraggableAttr = oTileElement.attributes["draggable"];
		this.fnWithRenderAsserts(assert);
		assert.strictEqual(oTileElement.tagName, "A", "The node is a link.");
		assert.strictEqual(sDraggableAttr && sDraggableAttr.value, "false", "The draggable attribute is set to false.");
		assert.strictEqual(oTileElement.getAttribute("role"), "link", "The role attribute for the link element is set to link.");
		assert.strictEqual(oTileElement.href, sLink, "The link is correctly set.");
		assert.strictEqual(document.getElementById("generic-tile-content").parentNode, oTileElement, "The tile content is a child of the link.");
		assert.strictEqual(document.getElementById("generic-tile-hover-overlay").parentNode, oTileElement, "The tile overlay is a child of the link.");
		assert.strictEqual(document.getElementById("generic-tile-focus").parentNode, oTileElement, "The tile content is a child of the link.");
	});

	QUnit.test("Wrapping type is propagated to title", async function(assert) {
		this.oGenericTile.setWrappingType(library.WrappingType.Hyphenated);
		await nextUIUpdate();
		assert.strictEqual(library.WrappingType.Hyphenated, this.oGenericTile._oTitle.getWrappingType(), "Title wrapping type should be Hyphenated");
	});

	QUnit.test("Wrapping type is propagated to subTitle", async function(assert) {
		this.oGenericTile.setWrappingType(library.WrappingType.Hyphenated);
		await nextUIUpdate();
		assert.strictEqual(library.WrappingType.Hyphenated, this.oGenericTile._oSubTitle.getWrappingType(), "Subtitle wrapping type should be Hyphenated");
	});

	QUnit.test("Wrapping type is propagated to appShortcut", async function(assert) {
		this.oGenericTile.setWrappingType(library.WrappingType.Hyphenated);
		await nextUIUpdate();
		assert.strictEqual(library.WrappingType.Hyphenated, this.oGenericTile._oAppShortcut.getWrappingType(), "AppShortcut wrapping type should be Hyphenated");
	});

	QUnit.test("Wrapping type is propagated to systemInfo", async function(assert) {
		this.oGenericTile.setWrappingType(library.WrappingType.Hyphenated);
		await nextUIUpdate();
		assert.strictEqual(library.WrappingType.Hyphenated, this.oGenericTile._oSystemInfo.getWrappingType(), "SystemInfo wrapping type should be Hyphenated");
	});

	QUnit.test("GenericTile border rendered for valueColor", async function(assert) {
		assert.notOk(document.querySelector("#generic-tile .sapMGTCriticalBorder"), "Generic tile has no criticality border");
		this.oGenericTile.setValueColor("Error");
		await nextUIUpdate();
		assert.ok(document.querySelector("#generic-tile .sapMGTCriticalBorder"), "Generic tile border was rendered sucessfully");
		assert.equal(document.querySelector("#generic-tile .sapMGTCriticalBorder").classList[1], "Error", "Generic tile border has error state");
	});

	QUnit.test("GenericTile border not rendered when no valueColor", async function(assert) {
		this.oGenericTile.setValueColor("None");
		await nextUIUpdate();
		assert.notOk(document.querySelector("#generic-tile .sapMGTCriticalBorder"), "Generic tile border was not rendered");
	});

	QUnit.test("GenericTile is dragged", async function(assert) {
		this.oGenericTile.invalidate();
		await nextUIUpdate();
		//Style class which gets added when Generic Tile when it is Dragged.
		this.oGenericTile.addStyleClass("sapMGTPressActive");
		this.oGenericTile.addStyleClass("sapUiDnDDragging");
		this.oGenericTile.addStyleClass("sapUiDnDGridControl");
		//Style class for Generic Tile when it is dragged.
		assert.ok(this.oGenericTile.hasStyleClass("sapMGTPressActive"), "Generic tile contains Press Active Style Class");
		assert.ok(this.oGenericTile.hasStyleClass("sapUiDnDDragging"), "Generic tile contains Drag Style Class Style");
		assert.ok(this.oGenericTile.hasStyleClass("sapUiDnDGridControl"), "Generic tile contains sapUiDnDGridControl Style Class");
		//OnAfterRendering gets Retrigerredafter the Generic Tile is Dragged.
		this.oGenericTile.onDragComplete();
		//Style Classes for Generic Tile should be removed from hover Overlay, once Drag is completed.
		assert.notOk(this.oGenericTile.hasStyleClass("sapMGTPressActive"), "Press state from Generic Tile is removed.");
	});
	QUnit.module("Small phone Tile tests", {
	beforeEach: async function() {
		this.oGenericTile = new GenericTile({
			header: "This is a header",
			subheader: "This is a subheader",
			sizeBehavior: TileSizeBehavior.Small
		});
		this.oParent = new FlexBox({
			width: "100px",
			items: [this.oGenericTile]
		}).placeAt("qunit-fixture");
		this.oParent.addStyleClass('sapUshellSection');
		await nextUIUpdate();
	},
	afterEach: function() {
		this.oGenericTile.destroy();
		this.oGenericTile = null;
		this.oParent.destroy();
		this.oParent = null;
	}
});
	QUnit.test("Tiles in small phone with small behavior are working properly", async function(assert) {
        this.oGenericTile.setFrameType(FrameType.TwoByOne);
        await nextUIUpdate();
        assert.equal(this.oGenericTile.$().css('width'), '304px', 'Rendering successful');
    });
	QUnit.test("Tiles in small phone with small behavior are working properly", async function(assert) {
        this.oGenericTile.setFrameType(FrameType.TwoByHalf);
        await nextUIUpdate();
        assert.equal(this.oGenericTile.$().css('width'), '304px', 'Rendering successful');
    });

	QUnit.module("FrameType rendering tests", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile({
				frameType: FrameType.Auto,
				header: "This is a header",
				subheader: "This is a subheader"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("FrameType is in OneByOne", function(assert) {
		//Arrange
		//Act
		//Assert
		var sSizeDescription = this.oGenericTile._oRb.getText("GENERIC_TILE_ROLE_DESCRIPTION");
		assert.equal(this.oGenericTile.getFrameType(), FrameType.OneByOne, "FrameType Auto set to OneByOne");
		assert.ok(this.oGenericTile.getDomRef().getAttribute("aria-label").includes(sSizeDescription),"Size description rendered successfully");
	});

	QUnit.test("FrameType is in TwoByOne", async function(assert) {
		//Arrange
		this.oGenericTile.setFrameType(FrameType.TwoByOne);
		//Act
		await nextUIUpdate();
		//Assert
		assert.equal(this.oGenericTile.getFrameType(), FrameType.TwoByOne, "FrameType Auto set to TwoByOne");
		assert.ok(this.oGenericTile.getDomRef().getAttribute("aria-label").includes("Wide Tile"),"Size description rendered successfully");
	});

	QUnit.test("FrameType is in OneByHalf", async function(assert) {
		//Arrange
		this.oGenericTile.setFrameType(FrameType.OneByHalf);
		var sSizeDescription = this.oGenericTile._oRb.getText("GENERIC_TILE_FLAT_SIZE");

		//Act
		await nextUIUpdate();

		//Assert
		assert.equal(this.oGenericTile.getFrameType(), FrameType.OneByHalf, "FrameType Auto set to TwoByOne");
		assert.ok(this.oGenericTile.getDomRef().getAttribute("aria-label").includes(sSizeDescription),"Size description rendered successfully");
	});

	QUnit.test("FrameType is in TwoByHalf", async function(assert) {
		//Arrange
		this.oGenericTile.setFrameType(FrameType.TwoByHalf);
		var sSizeDescription = this.oGenericTile._oRb.getText("GENERIC_TILE_FLAT_WIDE_SIZE");

		//Act
		await nextUIUpdate();

		//Assert
		assert.equal(this.oGenericTile.getFrameType(), FrameType.TwoByHalf, "FrameType Auto set to TwoByOne");
		assert.ok(this.oGenericTile.getDomRef().getAttribute("aria-label").includes(sSizeDescription),"Size description rendered successfully");
	});

	QUnit.module("Scope rendering tests", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile({
				scope: GenericTileScope.Display,
				header: "This is a header",
				subheader: "This is a subheader",
				tileContent: new TileContent("tile-cont", {
					unit: "EUR",
					footer: "Current Quarter"
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Display scope with actions view", async function(assert) {
		//Arrange
		this.oGenericTile.showActionsView(true);
		//Act
		await nextUIUpdate();
		//Assert
		assert.equal(this.oGenericTile.getScope(), GenericTileScope.Display, "The GenericTile was in Display scope");
		assert.ok(this.oGenericTile.$().hasClass("sapMGTScopeActions"), "The actions scope class was added");
		assert.notOk(document.getElementById("tile-cont-footer-text"), "The footer text has not been rendered in actions view");
	});

	QUnit.test("Display scope with actions view in failed state", async function(assert) {
		//Arrange
		this.oGenericTile.setState("Failed");
		this.oGenericTile.showActionsView(true);
		//Act
		await nextUIUpdate();
		//Assert
		assert.ok(this.oGenericTile.$("failed-text").length === 0, "Failed text has not been rendered");
	});

	QUnit.test("Action scope in normal mode", async function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);

		//Act
		this.oGenericTile.invalidate();
		await nextUIUpdate();

		//Assert
		assert.ok(this.oGenericTile.$("action-more").length > 0, "More icon has been rendered");
		assert.ok(this.oGenericTile.$("action-remove").length > 0, "Remove icon has been rendered");
	});

	QUnit.test("Action scope in LineMode/compact", async function(assert) {
		//Arrange
		this.oGenericTile.addStyleClass("sapUiSizeCompact");
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		this.oGenericTile.setScope(GenericTileScope.Actions);
		//Act
		this.oGenericTile.invalidate();
		await nextUIUpdate();

		//Assert
		assert.ok(this.oGenericTile.$("actions").length > 0, "Action container has been rendered");
		assert.ok(this.oGenericTile.$("action-more").length > 0, "More icon has been rendered");
		assert.ok(this.oGenericTile.$("action-remove").length > 0, "Remove icon has been rendered");
	});

	QUnit.test("Action scope remove button does not steal focus", async function(assert) {
		//Arrange
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		this.oGenericTile.setScope(GenericTileScope.Actions);

		//Act
		await nextUIUpdate();

		//Assert
		assert.equal(this.oGenericTile.$("action-remove").attr("tabindex"), "-1", "Correct tabindex is set on remove icon.");
		assert.equal(this.oGenericTile._oRemoveButton._bExcludeFromTabChain, true, "Remove button is excluded from tab chain on rendering.");
	});

	QUnit.test("Action scope in disabled LineMode GenericTile", async function(assert) {
		//Arrange
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		this.oGenericTile.setScope(GenericTileScope.Actions);
		this.oGenericTile.setState("Disabled");
		//Act
		await nextUIUpdate();
		//Assert
		assert.ok(this.oGenericTile.$("actions").length === 0, "Action container has not been rendered");
		assert.ok(this.oGenericTile.$("action-more").length === 0, "More icon has not been rendered");
		assert.ok(this.oGenericTile.$("action-remove").length === 0, "Remove icon has not been rendered");
	});

	QUnit.test("Action scope in failed LineMode GenericTile", async function(assert) {
		//Arrange
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		this.oGenericTile.setScope(GenericTileScope.Actions);
		this.oGenericTile.setState("Failed");
		//Act
		await nextUIUpdate();
		//Assert
		assert.ok(this.oGenericTile.$("actions").length > 0, "Action container has been rendered");
		assert.ok(this.oGenericTile.$("action-more").length > 0, "More icon has been rendered");
		assert.ok(this.oGenericTile.$("action-remove").length > 0, "Remove icon has been rendered");
		assert.ok(this.oGenericTile.$("warn-icon").length > 0, "Failed icon has been rendered");
	});

	QUnit.test("Action scope in disabled regular GenericTile", async function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		this.oGenericTile.setState("Disabled");
		//Act
		await nextUIUpdate();
		//Assert
		assert.ok(this.oGenericTile.$("action-more").length === 0, "More icon has not been rendered");
		assert.ok(this.oGenericTile.$("action-remove").length === 0, "Remove button has not been rendered");
	});

	QUnit.test("Action scope in failed regular GenericTile", async function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		this.oGenericTile.setState("Failed");
		//Act
		await nextUIUpdate();
		//Assert
		assert.ok(this.oGenericTile.$("action-more").length > 0, "More icon has been rendered");
		assert.ok(this.oGenericTile.$("action-remove").length > 0, "Remove button has been rendered");
		assert.ok(this.oGenericTile.$("failed-icon").length > 0, "Failed icon has been rendered");
		assert.ok(this.oGenericTile.$("failed-text").length === 0, "Failed text has not been rendered");
	});

	QUnit.test("ActionMore scope in failed regular GenericTile", async function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.ActionMore);
		this.oGenericTile.setState(library.LoadState.Loaded);
		//Act
		await nextUIUpdate();
		//Assert
		assert.strictEqual(this.oGenericTile.$("action-more").length, 1, "More icon has been rendered");
		assert.strictEqual(this.oGenericTile.$("action-remove").length, 0, "Remove button has not been rendered");
	});

	QUnit.test("Tab navigation check in action more", async function(assert) {
        var bForward = true;
        //Arrange
        var done = assert.async();
        //Act
        this.oGenericTile.setFrameType("TwoByHalf");
        this.oGenericTile.setMode("IconMode");
        this.oGenericTile.setTileIcon("sap-icon://key");
        this.oGenericTile.setBackgroundColor("teal");
        this.oGenericTile.setScope(GenericTileScope.ActionMore);
        await nextUIUpdate();
        setTimeout(function() {
                qutils.triggerKeydown(this.oGenericTile.getDomRef(), KeyCodes.TAB);
                var $Tabbables = findTabbables(document.activeElement, [document.getElementById("qunit-fixture")], bForward);
                if ($Tabbables.length) {
                    $Tabbables.get(!bForward ? $Tabbables.length - 1 : 0).focus();
                }
                //Assert
                assert.equal(this.oGenericTile.$("action-more").hasClass("sapMGTVisible"), true, "The Action More button is visible on focus of Generic Tile");
                done();
				qutils.triggerKeyup(this.oGenericTile.getDomRef(), KeyCodes.TAB);
        }.bind(this), 100);
    });

	QUnit.test("ActionRemove scope in loaded regular GenericTile", async function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.ActionRemove);
		this.oGenericTile.setState(library.LoadState.Loaded);
		//Act
		await nextUIUpdate();
		//Assert
		assert.strictEqual(this.oGenericTile.$("action-remove").length, 1, "Remove button has been rendered");
		assert.strictEqual(this.oGenericTile.$("action-more").length, 0, "More icon has not been rendered");
	});


	QUnit.test("Scope content is created on beforeRendering", async function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		this.spy(this.oGenericTile, "_initScopeContent");

		//Act
		await nextUIUpdate();

		//Assert
		assert.equal(this.oGenericTile._initScopeContent.callCount, 1, "_initScopeContent has been called once.");
	});

	QUnit.module("sap.m.GenericTileMode.LineMode ListView cozy (small screen only)", {
		beforeEach: async function() {
			this.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				header: "headerText",
				subheader: "subheaderText",
				mode: GenericTileMode.LineMode
			}).placeAt("qunit-fixture");
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").addClass("sapUiMedia-GenericTileDeviceSet-small");
			this.stub(this.oGenericTile, "_isScreenLarge").returns(false);
			await nextUIUpdate();
		},
		afterEach: function() {
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("All elements found", function(assert) {
		assert.ok(this.oGenericTile.$().hasClass("sapMGT"), "Tile has class 'sapMGT'");
		assert.ok(this.oGenericTile.$().hasClass("sapMGTLineMode"), "Tile has class 'sapMGTLineMode'");
		assert.ok(this.oGenericTile.$("hdr-text").length > 0, "Header was found");
		assert.equal(this.oGenericTile.$("hdr-text").text(), "headerText", "Header text was correct");
		assert.ok(this.oGenericTile.$("subHdr-text").length > 0, "SubHeader was found");
		assert.equal(this.oGenericTile.$("subHdr-text").text(), "subheaderText", "SubHeader text was correct");
		assert.ok(this.oGenericTile.$("focus").length > 0, "Focus helper was found");
		assert.ok(this.oGenericTile.$("touchArea").length > 0, "Touch area for line mode was found");
		assert.ok(this.oGenericTile.$("lineModeHelpContainer").length > 0, "Help container for line mode was found");

	});

	QUnit.module("LineMode FloatingView (large screen only) w/o parent", {
		beforeEach: async function() {
			this.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				mode: GenericTileMode.LineMode
			}).placeAt("qunit-fixture");
			jQuery("html").addClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.stub(this.oGenericTile, "_isScreenLarge").returns(true);
			await nextUIUpdate();
		},
		afterEach: function() {
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Correct parameters provided to Resize Handler", async function(assert) {
		//Arrange
		var oSpy = this.spy(ResizeHandler, "register");
		this.oGenericTile._bCompact = true;
		await nextUIUpdate();
		this.oGenericTile._sParentResizeListenerId = null;

		//Act
		this.oGenericTile.invalidate();
		await nextUIUpdate();

		//Assert
		assert.ok(oSpy.calledWith(this.oGenericTile.$().parent()), "Correct parameter provided if parent is UIArea");
	});

	QUnit.module("sap.m.GenericTileMode.LineMode FloatingView cozy (large screen only)", {
		beforeEach: async function() {
			this.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				header: "headerText",
				subheader: "subheaderText",
				mode: GenericTileMode.LineMode
			}).placeAt("qunit-fixture");
			jQuery("html").addClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.stub(this.oGenericTile, "_isScreenLarge").returns(true);
			await nextUIUpdate();
		},
		afterEach: function() {
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("All elements found", function(assert) {
		var sLineModeDescription = this.oGenericTile._oRb.getText("GENERIC_TILE_LINE_SIZE");
		assert.ok(this.oGenericTile.$().hasClass("sapMGT"), "Tile has class 'sapMGT'");
		assert.ok(this.oGenericTile.$().hasClass("sapMGTLineMode"), "Tile has class 'sapMGTLineMode'");
		assert.ok(this.oGenericTile.$("startMarker").length > 0, "StartMarker was found.");
		assert.ok(this.oGenericTile.$("endMarker").length > 0, "EndMarker was found.");
		assert.ok(this.oGenericTile.$("hdr-text").length > 0, "Header was found");
		assert.equal(this.oGenericTile.$("hdr-text").text(), "headerText", "Header text was correct");
		assert.ok(this.oGenericTile.$("subHdr-text").length > 0, "SubHeader was found");
		assert.equal(this.oGenericTile.$("subHdr-text").text(), "subheaderText", "SubHeader text was correct");
		assert.ok(this.oGenericTile.$("styleHelper").length > 0, "Style helper was found.");
		assert.ok(this.oGenericTile.getDomRef().getAttribute("aria-label").includes(sLineModeDescription),"Size description rendered successfully");

	});

	QUnit.module("sap.m.GenericTileMode.LineMode ListView compact (small screen only)", {
		beforeEach: async function() {
			this.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				subheader: "Expenses By Region",
				header: "Comparative Annual Totals",
				mode: GenericTileMode.LineMode
			});
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").addClass("sapUiMedia-GenericTileDeviceSet-small");
			this.stub(this.oGenericTile, "_isScreenLarge").returns(false);
			//stub this function in order to not queue any updates which might influence the other tests
			this.stub(this.oGenericTile, "_updateHoverStyle");

			this.oParent = new FlexBox({
				width: "100px",
				items: [this.oGenericTile]
			}).placeAt("qunit-fixture");
			this.oParent.addStyleClass("sapUiSizeCompact");
			await nextUIUpdate();
			this.oGenericTile._updateHoverStyle.resetHistory();
		},
		afterEach: function() {
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
			this.oParent.destroy();
			this.oParent = null;
		}
	});

	QUnit.test("All elements found", function(assert) {
		assert.ok(this.oGenericTile.$().hasClass("sapMGT"), "Tile has class 'sapMGT'");
		assert.ok(this.oGenericTile.$().hasClass("sapMGTLineMode"), "Tile has class 'sapMGTLineMode'");
		assert.ok(this.oGenericTile.$("hdr-text").length > 0, "Header was found.");
		assert.equal(this.oGenericTile.$("hdr-text").text(), "Comparative Annual Totals", "Header was correct.");
		assert.ok(this.oGenericTile.$("subHdr-text").length > 0, "SubHeader was found.");
		assert.equal(this.oGenericTile.$("subHdr-text").text(), "Expenses By Region", "SubHeader was correct.");
		assert.ok(this.oGenericTile.$("focus").length > 0, "Focus helper was found");
		assert.ok(this.oGenericTile.$("touchArea").length > 0, "Touch area for line mode was found");
		assert.ok(this.oGenericTile.$("lineModeHelpContainer").length > 0, "Help container for line mode was found");

	});

	QUnit.module("sap.m.GenericTileMode.LineMode FloatingView compact (large screen only)", {
		beforeEach: async function() {
			this.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				subheader: "Expenses By Region",
				header: "Comparative Annual Totals",
				mode: GenericTileMode.LineMode
			});
			jQuery("html").addClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.stub(this.oGenericTile, "_isScreenLarge").returns(true);
			//stub this function in order to not queue any updates which might influence the other tests
			this.stub(this.oGenericTile, "_updateHoverStyle");

			this.oParent = new FlexBox({
				width: "100px",
				items: [this.oGenericTile]
			}).placeAt("qunit-fixture");
			this.oParent.addStyleClass("sapUiSizeCompact");
			await nextUIUpdate();
			this.oGenericTile._updateHoverStyle.resetHistory();
		},
		afterEach: function() {
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
			this.oParent.destroy();
			this.oParent = null;
		}
	});

	QUnit.test("Correct parameter provided to Resize Handler", async function(assert) {
		//Arrange
		var oSpy = this.spy(ResizeHandler, "register");
		this.oGenericTile._sParentResizeListenerId = null;

		//Act
		this.oGenericTile.invalidate();
		await nextUIUpdate();

		//Assert
		assert.ok(oSpy.calledWith(this.oGenericTile.getParent()), "Correct parameter provided if parent is a control");
	});

	QUnit.test("All elements found", function(assert) {
		assert.ok(this.oGenericTile.$().hasClass("sapMGT"), "Tile has class 'sapMGT'");
		assert.ok(this.oGenericTile.$().hasClass("sapMGTLineMode"), "Tile has class 'sapMGTLineMode'");
		assert.ok(this.oGenericTile.$("startMarker").length > 0, "StartMarker was found.");
		assert.ok(this.oGenericTile.$("endMarker").length > 0, "EndMarker was found.");
		assert.ok(this.oGenericTile.$("hdr-text").length > 0, "Header was found.");
		assert.equal(this.oGenericTile.$("hdr-text").text(), "Comparative Annual Totals", "Header was correct.");
		assert.ok(this.oGenericTile.$("subHdr-text").length > 0, "SubHeader was found.");
		assert.equal(this.oGenericTile.$("subHdr-text").text(), "Expenses By Region", "SubHeader was correct.");
		assert.ok(this.oGenericTile.$("styleHelper").length > 0, "Style helper was found.");

	});

	QUnit.module("sap.m.GenericTileMode.LineMode FloatingView Functions tests (large screen only)", {
		beforeEach: async function() {
			this.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				subheader: "Expenses By Region",
				header: "Comparative Annual Totals",
				mode: GenericTileMode.LineMode
			});
			jQuery("html").addClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.stub(this.oGenericTile, "_isScreenLarge").returns(true);
			//stub this function in order to not queue any updates which might influence the other tests
			this.stub(this.oGenericTile, "_updateHoverStyle");

			this.oParent = new FlexBox({
				width: "100px",
				items: [this.oGenericTile]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oGenericTile._updateHoverStyle.resetHistory();
		},
		afterEach: function() {
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
			this.oParent.destroy();
			this.oParent = null;
		}
	});

	QUnit.test("Tile attached mediaContainerWidthChange handler after rendering", async function(assert) {
		//Arrange
		// remove stub to attach spy
		Device.media.attachHandler.restore();
		var deviceAttachHandlerSpy = this.spy(Device.media, "attachHandler");

		//Act
		this.oGenericTile.invalidate();
		await nextUIUpdate();

		//Assert
		assert.ok(deviceAttachHandlerSpy.calledOnce, "The mediaContainerWidthChange handler was attached after invalidation");
	});

	QUnit.test("Tile is invalidated on device size change", async function(assert) {
		//Arrange
		// restore previous stub and replace it with different stub.
		var oMediaChangeSpy = this.spy(this.oGenericTile, "onAfterRendering");

		//Act
		this.oGenericTile._handleMediaChange();
		await nextUIUpdate();

		//Assert
		assert.equal(oMediaChangeSpy.calledOnce, true, "Invalidate triggered a rerendering");
	});

	QUnit.test("All elements found in failed state", async function(assert) {
		//Arrange
		this.oGenericTile.setState("Failed");

		//Act
		await nextUIUpdate();

		//Assert
		assert.ok(this.oGenericTile.$("warn-icon").length > 0, "Warning icon was found.");
	});

	QUnit.test("Attributes written in RTL", async function(assert) {
		//Arrange
		Localization.setRTL(true);

		this.oGenericTile.invalidate();

		//Act
		await nextUIUpdate();

		//Assert
		assert.equal(this.oGenericTile.$().attr("dir"), "rtl");
		assert.equal(this.oGenericTile.$("hdr-text").attr("dir"), "rtl");
		assert.equal(this.oGenericTile.$("subHdr-text").attr("dir"), "rtl");

		//Cleanup
		Localization.setRTL(false);
	});

	QUnit.test("Hover style update on rendering", async function(assert) {
		//Arrange
		this.oGenericTile._updateHoverStyle.restore();

		this.spy(this.oGenericTile, "_updateHoverStyle");
		this.spy(GenericTileLineModeRenderer, "_updateHoverStyle");
		this.stub(this.oGenericTile, "_getStyleData").returns(true);
		this.spy(this.oGenericTile, "_queueAnimationEnd");
		var oClock = sinon.useFakeTimers();

		//Act
		this.oGenericTile.invalidate();
		await nextUIUpdate(oClock);

		oClock.tick(11);

		//Assert
		assert.equal(this.oGenericTile._updateHoverStyle.callCount, 1, "The hover style is updated when the control is rendered.");
		assert.equal(this.oGenericTile._queueAnimationEnd.callCount, 1, "The hover style update is queued when the control is rendered.");
		assert.ok(GenericTileLineModeRenderer._updateHoverStyle.called, "The renderer's update function is called if the style data changed.");

		//Cleanup
		oClock.restore();
	});

	QUnit.test("Hover style is not updated on rendering", async function(assert) {
		//Arrange
		this.oGenericTile._updateHoverStyle.restore();
		this.spy(this.oGenericTile, "_updateHoverStyle");
		this.spy(GenericTileLineModeRenderer, "_updateHoverStyle");
		this.stub(this.oGenericTile, "_getStyleData").returns(false);

		//Act
		this.oGenericTile.invalidate();
		await nextUIUpdate();

		//Assert
		assert.ok(this.oGenericTile._updateHoverStyle.calledOnce, "The hover style is updated when the control is rendered.");
		assert.ok(GenericTileLineModeRenderer._updateHoverStyle.notCalled, "The renderer's update function is not called if the style data has not changed.");
	});

	QUnit.test("Function _calculateStyleData returns object with necessary fields", async function(assert) {
		//Arrange
		var oStubGetPixelValue = this.stub(GenericTileLineModeRenderer, "_getCSSPixelValue");
		oStubGetPixelValue.withArgs(this.oGenericTile, "line-height").returns(30);
		oStubGetPixelValue.withArgs(this.oGenericTile, "min-height").returns(26);
		oStubGetPixelValue.withArgs(this.oGenericTile, "margin-top").returns(4);

		//Act
		this.oGenericTile.invalidate();
		await nextUIUpdate();

		var oData = this.oGenericTile._calculateStyleData();

		//Assert
		assert.notEqual(oData.rtl, undefined, "The field rtl is available.");
		assert.notEqual(oData.positionLeft, undefined, "The field positionLeft is available.");
		assert.notEqual(oData.positionRight, undefined, "The field positionRight is available.");
		assert.notEqual(oData.lines, undefined, "The field lines is available.");
		assert.ok(oData.lines.length >= 1, "There are lines available.");
		assert.notEqual(oData.lines[0].width, undefined, "The field lines[0].width is available.");
		assert.notEqual(oData.lines[0].height, undefined, "The field lines[0].height is available.");
		assert.notEqual(oData.lines[0].offset.x, undefined, "The field lines[0].offset.x is available.");
		assert.notEqual(oData.lines[0].offset.y, undefined, "The field lines[0].offset.y is available.");
	});

	QUnit.test("_calculateStyleData returns null if no rendering was done", function(assert) {
		//Arrange
		var oTile = new GenericTile({
			mode: GenericTileMode.LineMode
		});

		//Act
		var oStyleData = oTile._calculateStyleData();

		//Assert
		assert.equal(oStyleData, null, "In case no rendering happened, this function returns null.");
	});

	QUnit.test("Function _getStyleData updates internal object on change", function(assert) {
		//Arrange
		this.stub(this.oGenericTile, "_calculateStyleData").returns({ field: "value" });
		this.oGenericTile._oStyleData = null;

		//Act
		var bChanged = this.oGenericTile._getStyleData();

		//Assert
		assert.ok(bChanged, "The return value is 'true' on change.");
		assert.equal(this.oGenericTile._oStyleData.field, "value", "The changed field has been set.");
		assert.ok(!isEmptyObject(this.oGenericTile._oStyleData), "The internal object has been updated.");
	});

	QUnit.test("Function _getStyleData does not update internal object", function(assert) {
		//Arrange
		this.stub(this.oGenericTile, "_calculateStyleData").returns(null);
		this.oGenericTile._oStyleData = null;

		//Act
		var bChanged = this.oGenericTile._getStyleData();

		//Assert
		assert.ok(!bChanged, "The return value is 'false'.");
		assert.equal(this.oGenericTile._oStyleData, null, "Style data has not been updated.");
	});

	QUnit.test("Hover style update on resize", async function(assert) {
		//Arrange
		this.stub(GenericTileLineModeRenderer, "_updateHoverStyle");
		var done = assert.async();
		var oClock = sinon.useFakeTimers();

		//Act
		this.oParent.setWidth("500px");
		await nextUIUpdate(oClock);

		//Assert
		IntervalTrigger.addListener(checkAssertions);

		function checkAssertions() {
			oClock.tick(11);
			assert.ok(GenericTileLineModeRenderer._updateHoverStyle.called, "Renderer function _updateHoverStyle is called once.");

			//Cleanup
			IntervalTrigger.removeListener(checkAssertions);
			oClock.restore();

			done();
		}
	});

	QUnit.test("Hover style update of siblings on state change", async function(assert) {
		//Arrange
		this.spy(this.oGenericTile, "_updateLineTileSiblings");
		var oSiblingTile = new GenericTile("sibling-tile", {
			state: LoadState.Loaded,
			subheader: "Expenses By Region",
			header: "Comparative Annual Totals",
			mode: GenericTileMode.LineMode
		});
		this.stub(oSiblingTile, "_isScreenLarge").returns(true);
		this.oParent.addItem(oSiblingTile);
		await nextUIUpdate();

		this.oGenericTile._updateHoverStyle.restore(); //restore stub in order to use spy
		this.spy(this.oGenericTile, "_updateHoverStyle");
		this.spy(oSiblingTile, "_updateHoverStyle");

		//Act
		this.oGenericTile.setState("Failed");
		await nextUIUpdate();

		//Assert
		assert.equal(this.oGenericTile._updateLineTileSiblings.callCount, 1, "Function _updateLineTileSiblings has been called on changed Tile.");
		assert.equal(this.oGenericTile._updateHoverStyle.callCount, 1, "Function _updateHoverStyle has been called on tile.");
		assert.equal(oSiblingTile._updateHoverStyle.callCount, 1, "Function _updateHoverStyle has been called on sibling.");

		//Cleanup
		oSiblingTile.destroy();
	});

	QUnit.test("No hover style update of non-GenericTile siblings", async function(assert) {
		//Arrange
		var oSibling = new Text();
		this.oParent.addItem(oSibling);
		this.spy(this.oGenericTile, "_updateLineTileSiblings");

		this.oGenericTile._updateHoverStyle.restore(); //restore stub in order to use spy
		this.spy(this.oGenericTile, "_updateHoverStyle");

		//Act
		this.oGenericTile.setState("Failed");
		await nextUIUpdate();

		//Assert
		assert.equal(this.oGenericTile._updateLineTileSiblings.callCount, 1, "Function _updateLineTileSiblings has been called on changed Tile.");
		assert.equal(this.oGenericTile._updateHoverStyle.callCount, 1, "Function _updateHoverStyle has been called once.");

		//Cleanup
		oSibling.destroy();
	});

	QUnit.test("Resize Handler attached to parent, no deregister", async function(assert) {
		//Arrange
		this.spy(ResizeHandler, "deregister");
		this.spy(ResizeHandler, "register");
		this.oGenericTile._sParentResizeListenerId = null;
		this.oGenericTile._sGenericTileResizeListenerId = null;

		//Act
		this.oGenericTile.invalidate();
		await nextUIUpdate();

		//Assert
		assert.ok(ResizeHandler.deregister.notCalled);
		assert.equal(ResizeHandler.register.callCount,2,"Total of two resize handler has been attached");
	});

	QUnit.test("Resize Handler attached to parent, with deregister", async function(assert) {
		//Arrange
		this.spy(ResizeHandler, "deregister");
		this.spy(ResizeHandler, "register");
		this.oGenericTile._sParentResizeListenerId = "SomeListener";
		this.oGenericTile._sGenericTileResizeListenerId = "SomeListener";

		//Act
		this.oGenericTile.invalidate();
		await nextUIUpdate();

		//Assert
		assert.equal(ResizeHandler.deregister.callCount,2,"Total of two resize handler has been detached");
		assert.equal(ResizeHandler.register.callCount,2,"Total of two resize handler has been attached");
	});

	QUnit.test("Hover style update on transitionend", function(assert) {
		//Arrange
		this.oGenericTile._updateHoverStyle.restore();

		//stub renderer method in order to not render/manipulate anything
		this.stub(GenericTileLineModeRenderer, "_updateHoverStyle");
		this.stub(this.oGenericTile, "_queueAnimationEnd");
		this.stub(this.oGenericTile, "_getStyleData").returns(true);
		this.oGenericTile._oStyleData = {
			lineBreak: true
		};

		//Act
		this.oGenericTile._updateHoverStyle();
		this.oGenericTile._queueAnimationEnd.resetHistory();
		this.oGenericTile._$RootNode.trigger("transitionend");

		//Assert
		assert.equal(this.oGenericTile._queueAnimationEnd.callCount, 1, "Previously attached event handler _queueAnimationEnd has been called once.");
	});

	QUnit.test("Hover style update on animationend", function(assert) {
		//Arrange
		this.oGenericTile._updateHoverStyle.restore();

		//stub renderer method in order to not render/manipulate anything
		this.stub(GenericTileLineModeRenderer, "_updateHoverStyle");
		this.stub(this.oGenericTile, "_queueAnimationEnd");
		this.stub(this.oGenericTile, "_getStyleData").returns(true);
		this.oGenericTile._oStyleData = {
			lineBreak: true
		};

		//Act
		this.oGenericTile._updateHoverStyle();
		this.oGenericTile._queueAnimationEnd.resetHistory();
		this.oGenericTile._$RootNode.trigger("animationend");

		//Assert
		assert.equal(this.oGenericTile._queueAnimationEnd.callCount, 1, "Previously attached event handler _queueAnimationEnd has been called once.");
	});

	QUnit.test("Function _queueAnimationEnd called with GenericTile as event target", function(assert) {
		//Arrange
		var oEvent = {
			target: jQuery("<div class='sapMGT' />")
		};

		//Act
		var bPropagationStopped = this.oGenericTile._queueAnimationEnd(oEvent) === false;

		//Assert
		assert.ok(bPropagationStopped, "Event is not being handled.");
	});

	QUnit.test("Function _queueAnimationEnd called with GenericTile child as event target", function(assert) {
		//Arrange
		var $Tile = jQuery("<div class='sapMGT' />");
		var $Child = jQuery("<div class='sapMText' />");
		$Tile.append($Child);
		var oEvent = {
			target: $Child
		};

		//Act
		var bPropagationStopped = this.oGenericTile._queueAnimationEnd(oEvent) === false;

		//Assert
		assert.ok(bPropagationStopped, "Event is not being handled.");
	});

	QUnit.test("Function _queueAnimationEnd called with Page as event target", function(assert) {
		//Arrange
		var oEvent = {
			target: jQuery("<div class='sapMPage' />")
		};
		this.stub(this.oGenericTile, "_handleAnimationEnd");
		this.oGenericTile._oAnimationEndCallIds = {};

		//Act
		var bPropagationStopped = this.oGenericTile._queueAnimationEnd(oEvent) === false;

		//Assert
		assert.notOk(bPropagationStopped, "Event is being handled.");
	});

	QUnit.test("Mutex mechanism for animation/transition handling", function(assert) {
		//Arrange
		this.spy(this.oGenericTile, "_queueAnimationEnd");
		this.spy(this.oGenericTile, "_handleAnimationEnd");
		this.spy(this.oGenericTile, "_getStyleData");
		this.stub(GenericTileLineModeRenderer, "_updateHoverStyle");
		this.stub(this.oGenericTile, "_updateLineTileSiblings");
		this.stub(this.oGenericTile, "_calculateStyleData").returns({
			lineBreak: true
		});
		this.oGenericTile._updateHoverStyle.restore();
		var done = assert.async();

		//Act
		this.oGenericTile._updateHoverStyle();
		this.oGenericTile._$RootNode.trigger("transitionend");

		setTimeout(function() {
			//Assert
			assert.ok(GenericTileLineModeRenderer._updateHoverStyle.called, "Rendering update has been executed.");
			assert.ok(GenericTileLineModeRenderer._updateHoverStyle.calledOn(this.oGenericTile), "Rendering update has been executed.");
			assert.ok(this.oGenericTile._getStyleData.called, "Function _getStyleData has been called.");
			assert.ok(this.oGenericTile._queueAnimationEnd.called, "Function _queueAnimationEnd has been called.");
			assert.ok(this.oGenericTile._handleAnimationEnd.called, "Function _handleAnimationEnd has been called.");
			assert.ok(this.oGenericTile._handleAnimationEnd.calledWith(0), "Function _handleAnimationEnd has been called with correct index.");
			assert.ok(this.oGenericTile._handleAnimationEnd.calledWith(1), "Function _handleAnimationEnd has been called with correct index.");

			done();
		}.bind(this), 1000); // 1000ms, to make sure to wait for the 10ms delay
	});

	QUnit.test("Function _clearAnimationUpdateQueue", function(assert) {
		//Arrange
		var oClearTimeoutSpy = this.spy(window, "clearTimeout");
		this.oGenericTile._oAnimationEndCallIds = {
			0: 100,
			1: 200
		};

		//Act
		this.oGenericTile._clearAnimationUpdateQueue();

		//Assert
		assert.equal(oClearTimeoutSpy.callCount, 2, "Cleared setTimeout count is correct.");
		assert.equal(oClearTimeoutSpy.firstCall.args[0], 100, "Correct first ID has been cleared.");
		assert.equal(oClearTimeoutSpy.secondCall.args[0], 200, "Correct second ID has been cleared.");
		assert.deepEqual(this.oGenericTile._oAnimationEndCallIds, {}, "All IDs have been removed from the object.");
	});

	QUnit.module("Protected method getBoundingRects", {
		beforeEach: async function() {
			this.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				subheader: "Expenses By Region",
				header: "Comparative Annual Totals",
				mode: GenericTileMode.LineMode
			});

			jQuery("html").addClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.stub(this.oGenericTile, "_isScreenLarge").returns(true);
			//stub this function on order to not queue any updates which might influence the other tests
			this.stub(this.oGenericTile, "_updateHoverStyle");

			this.oGenericTile.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});


	QUnit.test("getBoundingRects in cozy tile returns object with necessary fields in list view (small screen)", async function(assert) {
		//Arrange
		jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").addClass("sapUiMedia-GenericTileDeviceSet-small");
		this.oGenericTile._isScreenLarge.restore();
		this.stub(this.oGenericTile, "_isScreenLarge").returns(false);
		await nextUIUpdate();

		//Act
		var aBoundingRects = this.oGenericTile.getBoundingRects();

		//Assert
		assert.equal(aBoundingRects.length, 1, "An array has been returned.");
		assert.equal(typeof aBoundingRects[0].offset.x, "number", "The field 'offset.x' is available.");
		assert.equal(typeof aBoundingRects[0].offset.y, "number", "The field 'offset.y' is available.");
		assert.ok(aBoundingRects[0].width >= 0, "The field 'width' is available.");
		assert.ok(aBoundingRects[0].height >= 0, "The field 'height' is available.");
	});

	QUnit.test("getBoundingRects returns object with necessary fields in floating view (large screen)", async function(assert) {
		//Arrange
		var oStubGetPixelValue = this.stub(GenericTileLineModeRenderer, "_getCSSPixelValue");
		oStubGetPixelValue.withArgs(this.oGenericTile, "line-height").returns(50);
		oStubGetPixelValue.withArgs(this.oGenericTile, "min-height").returns(26);
		oStubGetPixelValue.withArgs(this.oGenericTile, "margin-top").returns(4);
		//Act
		this.oGenericTile.invalidate();
		await nextUIUpdate();

		this.oGenericTile._getStyleData();
		GenericTileLineModeRenderer._updateHoverStyle.call(this.oGenericTile);

		var aBoundingRects = this.oGenericTile.getBoundingRects();

		//Assert
		assert.equal(aBoundingRects.length, 1, "An array has been returned.");
		assert.equal(typeof aBoundingRects[0].offset.x, "number", "The field 'offset.x' is available.");
		assert.equal(typeof aBoundingRects[0].offset.y, "number", "The field 'offset.y' is available.");
		assert.ok(aBoundingRects[0].width >= 0, "The field 'width' is available.");
		assert.ok(aBoundingRects[0].height >= 0, "The field 'height' is available.");
	});

	QUnit.module("Rendering tests for failing state", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("generic-tile-failed", {
				state: LoadState.Failed,
				subheader: "Expenses By Region",
				frameType: FrameType.OneByOne,
				header: "Comparative Annual Totals",
				headerImage: IMAGE_PATH + "female_BaySu.jpg",
				tileContent: new TileContent("tile-cont-failed", {
					unit: "EUR",
					footer: "Current Quarter",
					content: new NumericContent("numeric-cnt-failed", {
						state: LoadState.Loading,
						scale: "M",
						indicator: DeviationIndicator.Up,
						truncateValueTo: 4,
						value: 20,
						nullifyValue: true,
						formatterValue: false,
						valueColor: ValueColor.Good,
						icon: "sap-icon://customer-financial-fact-sheet"
					})
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("GenericTile in Failed state rendered", async function(assert) {
		assert.ok(document.getElementById("generic-tile-failed"), "Generic tile was rendered successfully");
		assert.ok(document.getElementById("generic-tile-failed-content"), "Generic tile content was rendered successfully");
		assert.ok(document.getElementById("generic-tile-failed-failed-icon"), "Generic tile icone was rendered successfully");
		assert.ok(document.getElementById("generic-tile-failed-failed-text"), "Generic tile icone text was rendered successfully");
		assert.ok(document.getElementById("generic-tile-failed-failed-txt"), "Generic tile text rendered successfully");
		assert.ok(document.getElementById("generic-tile-failed-failed-txt-inner"), "Generic tile text inner was rendered successfully");
		assert.ok(document.getElementById("generic-tile-failed-failed-ftr"), "Generic tile footer was rendered successfully");
		assert.ok(document.getElementById("generic-tile-failed-hdr-text"), "Generic tile header was rendered successfully");
		assert.ok(document.getElementById("generic-tile-failed-subHdr-text"), "Generic tile subheader was rendered successfully");
		assert.ok(document.getElementById("generic-tile-failed-title"), "Generic tile title subheader was rendered successfully");
		assert.ok(document.getElementById("generic-tile-failed-title-inner"), "Generic tile title inner subheader was rendered successfully");
		assert.ok(document.getElementById("generic-tile-failed-warn-icon"), "Generic tile warning icone subheader was rendered successfully");
		assert.ok(document.getElementById("generic-tile-failed-icon-image"), "Generic tile icon was rendered successfully");
		assert.ok(document.getElementById("generic-tile-failed-overlay"), "Generic tile icon was rendered successfully");
		assert.ok(document.getElementById("tile-cont-failed"), "TileContent was rendered successfully");
		assert.ok(!document.getElementById("tile-cont-failed-footer-text"), "TileContent footer text was not rendered");
		assert.ok(document.querySelector(".sapMGTOverlay"),"Overlay has been added successfully");

		this.oGenericTile.setState("Loaded");
		await nextUIUpdate();
	});

	QUnit.test("GenericTile is setting protected property only in Failed state", async function(assert) {
		this.oGenericTile.setState("Loaded");
		await nextUIUpdate();
		assert.ok(this.oGenericTile.getTileContent()[0]._bRenderFooter, "bRenderFooter set to true");
		this.oGenericTile.setState("Loading");
		await nextUIUpdate();
		assert.ok(this.oGenericTile.getTileContent()[0]._bRenderFooter, "bRenderFooter set to true");
		this.oGenericTile.setState("Disabled");
		await nextUIUpdate();
		assert.ok(this.oGenericTile.getTileContent()[0]._bRenderFooter, "bRenderFooter set to true");
		this.oGenericTile.setState("Failed");
		await nextUIUpdate();
		assert.ok(!this.oGenericTile.getTileContent()[0]._bRenderFooter, "bRenderFooter set to false");
	});

	QUnit.test("GenericTile error icon check in Failed state", async function(assert) {
		this.oGenericTile.setState("Failed");
		await nextUIUpdate();
		assert.equal(this.oGenericTile._oErrorIcon.getSrc(),"sap-icon://error","Icon in failed state should match with error icon");
	});

	QUnit.module("Rendering tests for Disabled state", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("generic-tile-failed", {
				state: LoadState.Disabled,
				subheader: "Expenses By Region",
				frameType: FrameType.OneByOne,
				header: "Comparative Annual Totals",
				headerImage: IMAGE_PATH + "female_BaySu.jpg",
				tileContent: new TileContent("tile-cont-failed", {
					unit: "EUR",
					footer: "Current Quarter",
					content: new NumericContent("numeric-cnt-failed", {
						state: LoadState.Loading,
						scale: "M",
						indicator: DeviationIndicator.Up,
						truncateValueTo: 4,
						value: 20,
						nullifyValue: true,
						formatterValue: false,
						valueColor: ValueColor.Good,
						icon: "sap-icon://customer-financial-fact-sheet"
					})
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("GenericTile in Disabled state rendered", function(assert) {
		assert.ok(document.querySelector(".sapMGTOverlay"),"Overlay has been added successfully");
	});

	QUnit.module("GenericTileMode tests", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				subheader: "Expenses By Region",
				frameType: FrameType.OneByOne,
				header: "Comparative Annual Totals",
				tileContent: new TileContent("tile-cont", {
					unit: "EUR",
					footer: "Current Quarter",
					content: new NumericContent({
						state: LoadState.Loading,
						scale: "M",
						indicator: DeviationIndicator.Up,
						truncateValueTo: 4,
						value: 20,
						nullifyValue: true,
						formatterValue: false,
						valueColor: ValueColor.Good,
						icon: "sap-icon://customer-financial-fact-sheet"
					})
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("GenericTile in ContentMode (Display mode)", async function(assert) {
		// In ContentMode, when the subheader available, the number of header lines should be 2
		assert.equal(Element.getElementById("generic-tile-title").getMaxLines(), 2, "The header has 2 lines and subheader has 1 line");

		// In ContentMode, when the subheader not available, the number of header lines should be 3
		this.oGenericTile.setSubheader("");
		await nextUIUpdate();
		assert.equal(Element.getElementById("generic-tile-title").getMaxLines(), 3, "The header has 3 lines when subheader unavailable");

		// Check if the content in TileContent is still kept.
		assert.ok(this.oGenericTile.getTileContent()[0].getContent() !== null, "The content aggregation in TileContent is kept.");
	});

	QUnit.test("ContentMode - Check if the TileContent's content visibility is changed", async function(assert) {
		//Arrange
		this.oGenericTile.setMode(GenericTileMode.HeaderMode);
		await nextUIUpdate();
		var oVisibilitySpy = this.spy(this.oGenericTile, "_changeTileContentContentVisibility");
		this.oGenericTile.setMode(GenericTileMode.ContentMode);
		//Act
		await nextUIUpdate();
		//Assert
		assert.ok(oVisibilitySpy.calledWith(true), "The visibility is changed to visible");
	});

	QUnit.test("GenericTile in HeaderMode", async function(assert) {
		this.oGenericTile.setMode(GenericTileMode.HeaderMode);
		await nextUIUpdate();

		// In HeaderMode, when the subheader available, the number of header lines should be 4
		assert.equal(Element.getElementById("generic-tile-title").getMaxLines(), 4, "The header has 4 lines and subheader has 1 line");

		// In HeaderMode, when the subheader unavailable, the number of header lines should be 5
		this.oGenericTile.setSubheader("");
		await nextUIUpdate();
		assert.equal(Element.getElementById("generic-tile-title").getMaxLines(), 5, "The header has 5 lines when subheader unavailable");
	});

	QUnit.test("HeaderMode - Check if the TileContent's content visibility is changed", async function(assert) {
		//Arrange
		var oVisibilitySpy = this.spy(this.oGenericTile, "_changeTileContentContentVisibility");
		this.oGenericTile.setMode(GenericTileMode.HeaderMode);
		//Act
		await nextUIUpdate();
		//Assert
		assert.ok(oVisibilitySpy.calledWith(false), "The visibility is changed to not visible");
	});

	QUnit.test("Content visibility change of TileContent", function(assert) {
		//Act
		this.oGenericTile._changeTileContentContentVisibility(true);
		//Assert
		assert.ok(this.oGenericTile.getTileContent()[0].getContent().getVisible(), "The content in TileContent is visible");
	});

	QUnit.test("GenericTileLineModeRenderer called for LineMode", async function(assert) {
		// Arrange
		var oSpy = this.spy(GenericTileLineModeRenderer, "render");
		this.oGenericTile.getParent().addStyleClass = function() {
		};
		// Act
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		await nextUIUpdate();
		// Assert
		assert.ok(oSpy.calledOnce, "GenericTileLineModeRenderer called");
	});

	QUnit.test("GenericTileRenderer called for HeaderMode", async function(assert) {
		// Arrange
		var oSpy = this.spy(GenericTileRenderer, "render");
		// Act
		this.oGenericTile.setMode(GenericTileMode.HeaderMode);
		await nextUIUpdate();
		// Assert
		assert.ok(oSpy.calledOnce, "GenericTileRenderer called");
	});

	QUnit.test("Test content density class - cozy as default", function(assert) {
		assert.notOk(this.oGenericTile._isCompact());
	});

	QUnit.test("Test content density class - compact from control", function(assert) {
		//Arrange
		this.oGenericTile.addStyleClass("sapUiSizeCompact");
		//Act
		//Assert
		assert.ok(this.oGenericTile._isCompact());
	});

	QUnit.test("Test content density class - compact from html parent", function(assert) {
		//Arrange
		var $body = jQuery("body");
		$body.addClass("sapUiSizeCompact");

		//Act
		//Assert
		assert.ok(this.oGenericTile._isCompact());

		//Cleanup
		$body.removeClass("sapUiSizeCompact");
	});

	QUnit.test("Test content density class - compact from control parent", async function(assert) {
		//Arrange
		new FlexBox({
			items: [this.oGenericTile]
		}).addStyleClass("sapUiSizeCompact").placeAt("qunit-fixture");

		//Act
		await nextUIUpdate();

		//Assert
		assert.ok(this.oGenericTile._isCompact());
	});

	/* --------------------------------------- */
	/* Test internal methods                   */
	/* --------------------------------------- */
	QUnit.module("Internal method _getEventParams", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				header: "header",
				subheader: "subheader"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Internal method _getEventParams in scope 'Display'", function(assert) {
		//Arrange
		var oParams;
		var oEvent = {
			target: {
				id: "dummy"
			}
		};

		//Act
		oParams = this.oGenericTile._getEventParams(oEvent);

		//Assert
		assert.equal(oParams.scope, GenericTileScope.Display, "Event parameter 'scope' is 'Display'");
		assert.equal(oParams.action, GenericTile._Action.Press, "Event parameter 'action' is 'Press'");
		assert.equal(oParams.domRef, this.oGenericTile.getDomRef(), "Event parameter 'domRef' points to GenericTile");
	});

	QUnit.test("Internal method _getEventParams in scope 'Actions', tap icon 'Remove'", async function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		await nextUIUpdate();
		var oParams;
		var oEvent = {
			target: {
				id: "-action-remove"
			}
		};

		//Act
		oParams = this.oGenericTile._getEventParams(oEvent);

		//Assert
		assert.equal(oParams.scope, GenericTileScope.Actions, "Event parameter 'scope' is 'Actions'");
		assert.equal(oParams.action, GenericTile._Action.Remove, "Event parameter 'action' is 'Remove'");
		assert.equal(oParams.domRef, this.oGenericTile._oRemoveButton.getPopupAnchorDomRef(), "Event parameter 'domRef' points to Remove Button");
	});

	QUnit.test("Internal method _getEventParams in scope 'Actions', tap icon 'More'", async function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		await nextUIUpdate();
		var oParams;
		var oEvent = {
			target: {
				id: "-action-more"
			}
		};

		//Act
		oParams = this.oGenericTile._getEventParams(oEvent);

		//Assert
		assert.equal(oParams.scope, GenericTileScope.Actions, "Event parameter 'scope' is 'Actions'");
		assert.equal(oParams.action, GenericTile._Action.Press, "Event parameter 'action' is 'Press'");
		assert.equal(oParams.domRef, this.oGenericTile._oMoreIcon.getDomRef(), "Event parameter 'domRef' points to More Icon");
	});

	QUnit.module("Internal methods for ARIA-label and tooltip handling", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				header: "header text of GenericTile",
				subheader: "subheader text of GenericTile",
				tileContent: [new TileContent("tile-cont-1"), new TileContent("tile-cont-2")]
			}).placeAt("qunit-fixture");
			// stub function _getAriaAndTooltipText of the content
			this.oGenericTile.getTileContent()[0]._getAriaAndTooltipText = function() {
				return "ARIA and tooltip text of TileContent 1";
			};
			// stub function _getAriaAndTooltipText of the content
			this.oGenericTile.getTileContent()[1]._getAriaAndTooltipText = function() {
				return "ARIA and tooltip text of TileContent 2";
			};
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Internal method _getHeaderAriaAndTooltipText", function(assert) {
		//Arrange
		var sHeaderAriaAndTooltipText,
			sExpectedHeaderAriaAndTooltipText = "header text of GenericTile\nsubheader text of GenericTile";
		//Act
		sHeaderAriaAndTooltipText = this.oGenericTile._getHeaderAriaAndTooltipText();
		//Assert
		assert.equal(sHeaderAriaAndTooltipText, sExpectedHeaderAriaAndTooltipText, "Expected text for header ARIA-label and tooltip generated if no tooltip set");
		//Act
		this.oGenericTile.setTooltip(" ");
		sHeaderAriaAndTooltipText = this.oGenericTile._getHeaderAriaAndTooltipText();
		//Assert
		assert.equal(sHeaderAriaAndTooltipText, sExpectedHeaderAriaAndTooltipText, "Expected text for header ARIA-label and tooltip generated if tooltip is supressed");
		//Act
		this.oGenericTile.setTooltip("someTooltipText");
		sHeaderAriaAndTooltipText = this.oGenericTile._getHeaderAriaAndTooltipText();
		//Assert
		assert.equal(sHeaderAriaAndTooltipText, sExpectedHeaderAriaAndTooltipText, "Expected text for header ARIA-label and tooltip generated if an explicite tooltip is set");
	});

	QUnit.test("Internal method _getContentAriaAndTooltipText", function(assert) {
		//Arrange
		var sContentAriaAndTooltipText,
			sExpectedContentAriaAndTooltipText = "ARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2";
		//Act
		sContentAriaAndTooltipText = this.oGenericTile._getContentAriaAndTooltipText();
		//Assert
		assert.equal(sContentAriaAndTooltipText, sExpectedContentAriaAndTooltipText, "Expected text for ARIA-label and tooltip of content generated if no tooltip set");
		//Act
		this.oGenericTile.setTooltip(" ");
		sContentAriaAndTooltipText = this.oGenericTile._getContentAriaAndTooltipText();
		//Assert
		assert.equal(sContentAriaAndTooltipText, sExpectedContentAriaAndTooltipText, "Expected text for ARIA-label and tooltip  of content generated if tooltip is supressed");
		//Act
		this.oGenericTile.setTooltip("someTooltipText");
		sContentAriaAndTooltipText = this.oGenericTile._getContentAriaAndTooltipText();
		//Assert
		assert.equal(sContentAriaAndTooltipText, sExpectedContentAriaAndTooltipText, "Expected text for ARIA-label and tooltip  of content generated if an explicite tooltip is set");
	});

	QUnit.test("Internal method _getAriaAndTooltipText", async function(assert) {
		//Arrange
		var sAriaAndTooltipText,fnDone = assert.async(),
			sExpectedAriaAndTooltipText = "header text of GenericTile\nsubheader text of GenericTile\nARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2";
		//Act
		sAriaAndTooltipText = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaAndTooltipText, sExpectedAriaAndTooltipText, "Expected text for ARIA-label and tooltip generated if no tooltip set");
		//Act
		this.oGenericTile.setTooltip(" ");
		sAriaAndTooltipText = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaAndTooltipText, sExpectedAriaAndTooltipText, "Expected text for ARIA-label and tooltip generated if tooltip is supressed");
		//Act
		this.oGenericTile.setTooltip("someTooltipText");
		await nextUIUpdate();
		//Assert
		setTimeout(function(){
			assert.equal(this.oGenericTile.getAggregation("_invisibleText").getText(),"someTooltipText","Tooltip has been successfully attached to the invisible text");
			fnDone();
		}.bind(this), 100);

		//Arrange - stubs GenericTile's functions, no store & restore needed on the instance level
		this.oGenericTile.getTooltip_AsString = function() {
			return "";
		};
		this.oGenericTile._isTooltipSuppressed = function() {
			return false;
		};
		this.oGenericTile._getHeaderAriaAndTooltipText = function() {
			return "";
		};
		this.oGenericTile._getContentAriaAndTooltipText = function() {
			return " ";
		};
		//Act
		sAriaAndTooltipText = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaAndTooltipText, "", "Expected empty string for ARIA-label and tooltip generated");
	});

	QUnit.test("Internal method _getAriaText", async function(assert) {
		//Arrange
		var sAriaText;
		// stub GenericTile's function _getAriaAndTooltipText
		this.oGenericTile._getAriaAndTooltipText = function() {
			return "ARIA and tooltip text";
		};
		//Act
		sAriaText = this.oGenericTile._getAriaText();
		//Assert
		assert.equal(sAriaText, "ARIA and tooltip text\n" + this.oGenericTile._oRb.getText("GENERIC_TILE_ROLE_DESCRIPTION"), "Expected text for ARIA-label generated if no tooltip set");
		//Act
		this.oGenericTile.setTooltip(" ");
		sAriaText = this.oGenericTile._getAriaText();
		//Assert
		assert.equal(sAriaText, "ARIA and tooltip text\n" + this.oGenericTile._oRb.getText("GENERIC_TILE_ROLE_DESCRIPTION"), "Expected text for ARIA-label generated in case tooltip is supressed");
		//Act
		this.oGenericTile.setTooltip("someTooltipText");
		await nextUIUpdate();
		//Assert
		assert.equal(this.oGenericTile.getAggregation("_invisibleText").getText(),"someTooltipText","Tooltip has been successfully attached to the invisible text");
		//Act
		sAriaText = this.oGenericTile._getAriaText();
		this.oGenericTile.setProperty("ariaLabel", "additional aria text");
		//Assert
		assert.equal(this.oGenericTile._getAriaText(), "additional aria text " + sAriaText, "Value of ariaLabel property has been appended to resulting aria-label.");
	});

	QUnit.test("Internal method _getAriaText for actions scope", async function(assert) {
		//Arrange
		this.oGenericTile.setScope("Actions");
		this.oGenericTile._getAriaAndTooltipText = function() {
			return "ARIA and tooltip test";
		};
		await nextUIUpdate();
		//Act
		var sAriaText = this.oGenericTile._getAriaText();
		var sActionsText = this.oGenericTile._oRb.getText("GENERICTILE_ACTIONS_ARIA_TEXT");
		//Assert
		assert.equal(sAriaText, sActionsText + " ARIA and tooltip test\n" + this.oGenericTile._oRb.getText("GENERIC_TILE_ROLE_DESCRIPTION"), "Expected text for ARIA-label generated for actions scope");
	});

	QUnit.test("Internal method _getAriaText for ActionMore scope", async function(assert) {
		//Arrange
		this.oGenericTile.setScope("ActionMore");
		this.oGenericTile._getAriaAndTooltipText = function() {
			return "ARIA and tooltip test";
		};
		await nextUIUpdate();
		//Act
		var sAriaText = this.oGenericTile._getAriaText();
		//Assert
		assert.equal(sAriaText, "ARIA and tooltip test\n" + this.oGenericTile._oRb.getText("GENERIC_TILE_ROLE_DESCRIPTION"), "Expected text for ARIA-label generated for actionMore scope");
	});

	QUnit.test("Internal method _getTooltipText", function(assert) {
		//Arrange
		var sTooltipText;
		//Act
		sTooltipText = this.oGenericTile._getTooltipText();
		//Assert
		assert.equal(sTooltipText, null, "No tooltip generated if no tooltip set");
		//Act
		this.oGenericTile.setTooltip(" ");
		sTooltipText = this.oGenericTile._getTooltipText();
		//Assert
		assert.equal(sTooltipText, null, "No text for tooltip generated in case tooltip is supressed");
		//Act
		this.oGenericTile.setTooltip("someTooltipText");
		sTooltipText = this.oGenericTile._getTooltipText();
		//Assert
		assert.equal(sTooltipText, "someTooltipText", "Expected text for tooltip generated in case an explicite tooltip is set");
	});

	QUnit.module("Tests for ARIA-label", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				subheader: "Expenses By Region",
				frameType: FrameType.OneByOne,
				header: "Comparative Annual Totals",
				tileContent: new TileContent("tile-cont", {
					unit: "EUR",
					footer: "Current Quarter",
					content: new NumericContent("numeric-cnt", {
						state: LoadState.Loaded,
						scale: "M",
						indicator: DeviationIndicator.Up,
						truncateValueTo: 4,
						value: 20,
						nullifyValue: true,
						formatterValue: false,
						valueColor: ValueColor.Good,
						icon: "sap-icon://customer-financial-fact-sheet"
					})
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Generation of text for ARIA-label when the tile content is not visible", function(assert) {
		//Arrange
		this.oGenericTile.setState(LoadState.Loaded);
		this.oGenericTile.getTileContent()[0].setVisible(false);
		var sLoadedText = "Comparative Annual Totals\nExpenses By Region\n";
		//Act
		var sAriaLabel = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaLabel, sLoadedText, "Text for ARIA-label has been generated for Loaded state");
	});

	QUnit.test("Generation of text for ARIA-label when the content inside the tile content is not visible", function(assert) {
		//Arrange
		this.oGenericTile.setState(LoadState.Loaded);
		this.oGenericTile.getTileContent()[0].getContent().setVisible(false);
		var sLoadedText = "Comparative Annual Totals\nExpenses By Region\nEUR\nCurrent Quarter";
		//Act
		var sAriaLabel = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaLabel, sLoadedText, "Text for ARIA-label has been generated for Loaded state");
	});

	QUnit.test("Generation of text for ARIA-label, Loaded state", function(assert) {
		//Arrange
		this.oGenericTile.setState(LoadState.Loaded);
		var sLoadedText = "Comparative Annual Totals\nExpenses By Region\n20M\nAscending\nGood\nEUR\nCurrent Quarter";
		//Act
		var sAriaLabel = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaLabel, sLoadedText, "Text for ARIA-label has been generated for Loaded state");
	});

	QUnit.test("Generation of text for ARIA-label, Loading state", function(assert) {
		//Arrange
		this.oGenericTile.setState(LoadState.Loading);
		var sLoadingText = "Comparative Annual Totals\nExpenses By Region\n20M\nAscending\nGood\nEUR\nCurrent Quarter\n" + this.oGenericTile._oRb.getText("INFOTILE_LOADING");
		//Act
		var sAriaLabel = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaLabel, sLoadingText, "Text for ARIA-label has been generated for Loading state");
	});

	QUnit.test("Generation of text for ARIA-label generated by the control, Failed state", function(assert) {
		//Arrange
		this.oGenericTile.setState(LoadState.Failed);
		var sFailedText = "Comparative Annual Totals\nExpenses By Region\n20M\nAscending\nGood\nEUR\nCurrent Quarter\n" + this.oGenericTile._oFailedText.getText();
		//Act
		var sAriaLabel = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaLabel, sFailedText, "Text for ARIA-label has been generated for Failed state");
	});

	QUnit.test("Explicit text for Failed state set by user", async function(assert) {
		//Arrange
		this.oGenericTile.setFailedText("explicitFailedText");
		this.oGenericTile.setState(LoadState.Failed);
		await nextUIUpdate();
		var sFailedText = "Comparative Annual Totals\nExpenses By Region\n20M\nAscending\nGood\nEUR\nCurrent Quarter\n" + "explicitFailedText";
		//Act
		var sAriaLabel = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaLabel, sFailedText, "Text for ARIA-label has been generated for Failed state");
	});

	QUnit.test("Generation of text for ARIA-label and tooltip, Disabled state", function(assert) {
		//Arrange
		this.oGenericTile.setState(LoadState.Disabled);
		//Act
		var sAriaLabel = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaLabel, "", "No text for ARIA-label has been generated for Disabled state");
	});

	QUnit.test("Generation of text for ARIA-label and tooltip after updated content", function(assert) {
		//Arrange
		//Act
		var sAriaAndTooltipText = this.oGenericTile._getAriaAndTooltipText(),
			sExpectedAriaAndTooltipText = "Comparative Annual Totals\nExpenses By Region\n20M\nAscending\nGood\nEUR\nCurrent Quarter";
		//Assert
		assert.equal(sAriaAndTooltipText, sExpectedAriaAndTooltipText, "Expected text for ARIA-label and tooltip has been generated");
		//Arrange
		sExpectedAriaAndTooltipText = "Comparative Annual Totals\nExpenses By Region\n555M\nAscending\nGood\nEUR\nCurrent Quarter";
		//Act
		this.oGenericTile.getTileContent()[0].getContent().setValue(555);
		sAriaAndTooltipText = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaAndTooltipText, sExpectedAriaAndTooltipText, "Expected text for ARIA-label and tooltip has been generated after was content updated");
		//Arrange
		var sAriaText = this.oGenericTile._getAriaText(),
			sTooltipText;
		//Act
		this.oGenericTile.setTooltip(" ");
		sTooltipText = this.oGenericTile._getTooltipText();
		//Assert
		assert.equal(sAriaAndTooltipText, sExpectedAriaAndTooltipText, "Expected text for ARIA-label and tooltip has been generated after content was updated and tooltip was suppressed");
		sExpectedAriaAndTooltipText += ("\n" + this.oGenericTile._oRb.getText("GENERIC_TILE_ROLE_DESCRIPTION"));
		assert.equal(sAriaText, sExpectedAriaAndTooltipText, "Expected text for ARIA-label has been generated after content was updated and tooltip was suppressed");
		assert.equal(sTooltipText, null, "No text for tooltip has been generated after content was updated and tooltip was suppressed");
		//Arrange
		sExpectedAriaAndTooltipText = "Comparative Annual Totals\nExpenses By Region\n777M\nAscending\nGood\nEUR\nCurrent Quarter";
		//Act
		this.oGenericTile.getTileContent()[0].getContent().setValue(777);
		this.oGenericTile.destroyTooltip();
		sAriaAndTooltipText = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaAndTooltipText, sExpectedAriaAndTooltipText, "Expected text for ARIA-label and tooltip has been generated after content was updated and tooltip was destroyed");
	});

	QUnit.module("Tooltip handling", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				header: "Header text",
				subheader: "subheader text",
				tileContent: [new TileContent("tile-cont-1"), new TileContent("tile-cont-2")]
			}).placeAt("qunit-fixture");
			// stub function _getAriaAndTooltipText of the content
			this.oGenericTile.getTileContent()[0]._getAriaAndTooltipText = function() {
				return "ARIA and tooltip text of TileContent 1";
			};
			// stub function _getAriaAndTooltipText of the content
			this.oGenericTile.getTileContent()[1]._getAriaAndTooltipText = function() {
				return "ARIA and tooltip text of TileContent 2";
			};
			await nextUIUpdate();
		},
		afterEach: function(assert) {
			this.oGenericTile.destroy();
			this.oGenericTile = null;

			var done = assert.async();
			setTimeout(done, 0); // needed to slow down until the tile is rendered
		}
	});

	QUnit.test("GenericTile tooltip provided by the control enhanced by additionalTooltip property", function(assert) {
		//Arrange
		this.oGenericTile.setAdditionalTooltip("System U1Y");
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());
		var sAriaLabel = "Header text\nsubheader text\nARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2\nSystem U1Y\n" + this.oGenericTile._oRb.getText("GENERIC_TILE_ROLE_DESCRIPTION");
		var sTooltip = "Header text\nsubheader text\nARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2\nSystem U1Y";

		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		var sGenericTileAriaLabel = this.oGenericTile.$()[0].getAttribute("aria-label");
		//Assert
		assert.equal(sGenericTileTooltip, sTooltip, "ToolTip with Header+SubHeader and content data together with additionalTooltip property value");
		assert.equal(sGenericTileAriaLabel, sAriaLabel, "Aria-Label has been rendered with the additionalTooltip property value");
	});

	QUnit.test("GenericTile tooltip provided by the control", function(assert) {
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());
		var sAriaLabel = "Header text\nsubheader text\nARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2\n" + this.oGenericTile._oRb.getText("GENERIC_TILE_ROLE_DESCRIPTION");
		var sTooltip = "Header text\nsubheader text\nARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2";

		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		var sGenericTileAriaLabel = this.oGenericTile.$()[0].getAttribute("aria-label");
		//Assert
		assert.equal(sGenericTileTooltip, sTooltip, "ToolTip with Header+SubHeader and content data");
		assert.equal(sGenericTileAriaLabel, sAriaLabel, "Tooltip of GenericTile is identical with ARIA-label");
	});

	QUnit.test("Explicit tooltip set by user with short header text, short subheader text", async function(assert) {
		//Arrange
		this.oGenericTile.setTooltip("tooltip");
		await nextUIUpdate();
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());
		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		var sGenericTileAriaLabel = this.oGenericTile.$()[0].getAttribute("aria-label");
		//Assert
		assert.equal(sGenericTileTooltip, "tooltip", "Explicit tooltip of GenericTile is consistent");
		assert.ok(this.oGenericTile.getAggregation("_invisibleText").getText(), "Tooltip has been successfully attached to the invisible text");
		assert.equal(this.oGenericTile.getDomRef().getAttribute("aria-describedby"),this.oGenericTile.getAggregation("_invisibleText").getId(), "ARIA-describedby has invisible text id");
		assert.equal(sGenericTileAriaLabel.indexOf("Generic Tile") === -1, true, "ARIA-label should not contain control specific information such as Generic Tile applications can use ariaLabel property for additional info");
		assert.equal(sGenericTileAriaLabel.indexOf("GenericTile") === -1, true, "ARIA-label should not contain control specific information such as GenericTile applications can use ariaLabel property for additional info");
	});

	QUnit.test("Check if in loading state placeholder div is visible", async function(assert) {
		//Arrange
		this.oGenericTile.setState("Loading");
		await nextUIUpdate();
		//Act
		var oDomRef = this.oGenericTile.getDomRef().children[0];
		//Assert
		assert.ok(oDomRef.classList.contains("sapMGTContentShimmerPlaceholderItem"), "Placeholder div is present when state is loading");
		//Arrange
		this.oGenericTile.setState("Loaded");
		await nextUIUpdate();
		assert.notOk(oDomRef.classList.contains("sapMGTContentShimmerPlaceholderItem"), "Placeholder div is not present when state is loaded");
	});

	QUnit.test("Explicit tooltip set by user with long header text, long subheader text", async function(assert) {
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile.setSubheader("A long long subheader text");
		this.oGenericTile.setTooltip("tooltip");
		await nextUIUpdate();
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());
		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		//Assert
		assert.equal(sGenericTileTooltip, "tooltip", "User tooltip overwrites the header and subheader text");
	});

	QUnit.test("Suppress tooltip with space tooltip set by user with short header text, short subheader text", async function(assert) {
		//Arrange
		this.oGenericTile.setTooltip(" ");
		await nextUIUpdate();
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());
		var sExpectedAriaLabel = "Header text\nsubheader text\nARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2\n" + this.oGenericTile._oRb.getText("GENERIC_TILE_ROLE_DESCRIPTION");
		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		var sGenericTileAriaLabel = this.oGenericTile.$()[0].getAttribute("aria-label");
		//Assert
		assert.equal(sGenericTileTooltip, null, "GenericTile rendered without tooltip");
		assert.equal(sGenericTileAriaLabel, sExpectedAriaLabel, "GenericTile has correct ARIA-label");
	});

	QUnit.test("Suppress tooltip with space tooltip set by user with long header text, long subheader text", async function(assert) {
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile.setSubheader("A long long subheader text");
		this.oGenericTile.setTooltip(" ");
		await nextUIUpdate();
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());
		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		//Assert
		assert.equal(sGenericTileTooltip, null, "GenericTile rendered without tooltip");
	});

	QUnit.test("Tooltip for GenericTile with long Header-subheader text and Tilecontent", async function(assert) {
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile.setSubheader("A long long subheader text");
		await nextUIUpdate();
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());
		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		//Assert
		assert.equal(sGenericTileTooltip, "A long long long long long long long long long long header text\nA long long subheader text\nARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2", "Generic Tile tooltip with Header SubHeader and TileContent");
	});

	QUnit.test("Tooltip is removed when mouse leaves the GenericTile", async function(assert) {
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		await nextUIUpdate();
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseLeaveEvent());
		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		//Assert
		assert.equal(sGenericTileTooltip, null, "Tooltip is removed");
	});

	QUnit.test("Test to make sure get dom element with suffix 'inner' from sap.m.Text does not return null (for safety)", function(assert) {
		//Arrange
		var oDom = this.oGenericTile.getAggregation("_titleText").getDomRef("inner");
		//Act
		//Assert
		assert.ok(oDom, "The span with suffix 'inner' exists");
	});

	QUnit.module("Tooltip handling in LineMode (large screens)", {
		beforeEach: async function() {
			this.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile("generic-tile", {
				header: "header",
				subheader: "subheader",
				mode: GenericTileMode.LineMode,
				tileContent: [new TileContent("tile-cont-1"), new TileContent("tile-cont-2")]
			});

			jQuery("html").addClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.stub(this.oGenericTile, "_isScreenLarge").returns(true);

			// stub function _getAriaAndTooltipText of the content
			this.oGenericTile.getTileContent()[0]._getAriaAndTooltipText = function() {
				return "ARIA and tooltip text of TileContent 1";
			};
			// stub function _getAriaAndTooltipText of the content
			this.oGenericTile.getTileContent()[1]._getAriaAndTooltipText = function() {
				return "ARIA and tooltip text of TileContent 2";
			};

			this.oParent = new ScrollContainer({
				width: "100px",
				content: [this.oGenericTile]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
			this.oParent.destroy();
			this.oParent = null;
		}
	});

	QUnit.test("GenericTile tooltip provided by the control", function(assert) {
		//Arrange
		var sAriaLabel = "header\nsubheader\n" + this.oGenericTile._oRb.getText("GENERIC_TILE_LINE_SIZE");

		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "header\nsubheader", "GenericTile tooltip");
		assert.equal(this.oGenericTile.$().attr("aria-label"), sAriaLabel, "GenericTile has correct ARIA-label");
	});

	QUnit.test("GenericTile tooltip provided by the control when TileContent is available but in line mode not shown", function(assert) {
		//Arrange
		var sAriaLabel = "header\nsubheader\n" + this.oGenericTile._oRb.getText("GENERIC_TILE_LINE_SIZE");

		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "header\nsubheader", "In LineMode only Header-SubHeader considered and TileContent omitted from tooltip");
		assert.equal(this.oGenericTile.$().attr("aria-label"), sAriaLabel, "GenericTile has correct ARIA-label");
	});

	QUnit.test("Explicit tooltip set by user with short header text, short subheader text", async function(assert) {
		//Arrange
		this.oGenericTile.setTooltip("tooltip");
		await nextUIUpdate();

		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "tooltip", "Explicit tooltip of GenericTile is consistent");
		assert.ok(this.oGenericTile.getAggregation("_invisibleText").getText(), "Tooltip has been successfully attached to the invisible text");
	});

	QUnit.test("Explicit tooltip set by user with long header text, long subheader text", async function(assert) {
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile.setSubheader("A long long subheader text");
		this.oGenericTile.setTooltip("tooltip");
		await nextUIUpdate();

		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "tooltip", "User tooltip overwrites the header and subheader texts");
		assert.ok(this.oGenericTile.getAggregation("_invisibleText").getText(), "Tooltip has been successfully attached to the invisible text");
	});

	QUnit.test("Suppress tooltip with space tooltip set by user with short header text, short subheader text", async function(assert) {
		//Arrange
		var sAriaLabel = "header\nsubheader\n" + this.oGenericTile._oRb.getText("GENERIC_TILE_LINE_SIZE");
		this.oGenericTile.setTooltip(" ");
		await nextUIUpdate();

		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), null, "GenericTile rendered without tooltip");
		assert.equal(this.oGenericTile.$().attr("aria-label"), sAriaLabel, "GenericTile has correct ARIA-label");
	});

	QUnit.test("Suppress tooltip with space tooltip set by user with long header text, long subheader text", async function(assert) {
		//Arrange
		var sAriaLabel = "A long long long long long long long long long long header text\nA long long subheader text\n" + this.oGenericTile._oRb.getText("GENERIC_TILE_LINE_SIZE");
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile.setSubheader("A long long subheader text");
		this.oGenericTile.setTooltip(" ");
		await nextUIUpdate();

		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), null, "GenericTile rendered without tooltip");
		assert.equal(this.oGenericTile.$().attr("aria-label"), sAriaLabel, "GenericTile has correct ARIA-label");
	});

	QUnit.test("Truncated header text tooltip is removed when mouse leaves the GenericTile", async function(assert) {
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long");

		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseLeaveEvent());
		await nextUIUpdate();

		//Assert
		assert.equal(null, this.oGenericTile.$().attr("title"), "Truncated text tooltip is removed");
	});

	QUnit.module("Tooltip handling in LineMode (small screens)", {
		beforeEach: async function() {
			this.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile("generic-tile", {
				header: "header",
				subheader: "subheader",
				mode: GenericTileMode.LineMode,
				tileContent: [new TileContent("tile-cont-1"), new TileContent("tile-cont-2")]
			});

			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").addClass("sapUiMedia-GenericTileDeviceSet-small");
			this.stub(this.oGenericTile, "_isScreenLarge").returns(false);

			// stub function _getAriaAndTooltipText of the content
			this.oGenericTile.getTileContent()[0]._getAriaAndTooltipText = function() {
				return "ARIA and tooltip text of TileContent 1";
			};
			// stub function _getAriaAndTooltipText of the content
			this.oGenericTile.getTileContent()[1]._getAriaAndTooltipText = function() {
				return "ARIA and tooltip text of TileContent 2";
			};

			this.oParent = new ScrollContainer({
				width: "100px",
				content: [this.oGenericTile]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
			this.oParent.destroy();
			this.oParent = null;
		}
	});
	QUnit.test("Tooltip for GenericTile with short header text and long subheader text", async function(assert) {
		//Arrange
		this.oGenericTile.setSubheader("A long long subheader text");
		await nextUIUpdate();

		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "header\nA long long subheader text", "Tooltip both Shot Header and Long SubHeader");
	});

	QUnit.test("Tooltip for GenericTile with long header text truncated, short subheader text", async function(assert) {
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile._oTitle.invalidate(); // needs to invalidate since the sap.m.Text doesn't invalidate (on purpose)
		await nextUIUpdate();

		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "A long long long long long long long long long long header text\nsubheader", "Tooltip both Long Header and short SubHeader");
	});

	QUnit.test("Tooltip for GenericTile with long header text and long subheader text truncated", async function(assert) {
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile.setSubheader("A long long subheader text");
		await nextUIUpdate();

		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "A long long long long long long long long long long header text\nA long long subheader text", "Truncated texts for header and for subheader have tooltips");
	});

	QUnit.test("Truncated header text tooltip is removed when mouse leaves the GenericTile", async function(assert) {
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long");

		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseLeaveEvent());
		await nextUIUpdate();

		//Assert
		assert.equal(null, this.oGenericTile.$().attr("title"), "Truncated text tooltip is removed");
	});

	QUnit.test("GenericTile tooltip provided by the control when TileContent is available", function(assert) {
		//Arrange
		this.oGenericTile.getTileContent()[0].setFooter("Tile Footer");
		this.oGenericTile.getTileContent()[0].setUnit("Tile Unit");

		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "header\nsubheader", "In LineMode only Header-SubHeader considered and TileContent omitted from tooltip");
	});

	QUnit.module("Tooltip handling on content elements", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				header: "header text of GenericTile",
				subheader: "subheader text of GenericTile",
				tileContent: [
					new TileContent("tile-cont-1", {
						tooltip: "tooltip of TileContent 1"
					}), new TileContent("tile-cont-2", {
						tooltip: "tooltip of TileContent 2",
						content: new NumericContent("numeric-content")
					})
				]
			}).placeAt("qunit-fixture");
			// stub function _getAriaAndTooltipText of the NumericContent
			this.oGenericTile.getTileContent()[1].getContent()._getAriaAndTooltipText = function() {
				return "ARIA and tooltip text of NumericContent";
			};
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Actions scope - title attribute of Remove button in LineMode", async function(assert) {
		//Arrange
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		this.oGenericTile.setScope(GenericTileScope.Actions);
		await nextUIUpdate();

		//Act
		jQuery("#remove").trigger("mouseenter");
		var sTitleOfRemove = this.oGenericTile.$("action-remove").attr("title");

		//Assert
		assert.ok(sTitleOfRemove, "Remove button contains expected attribute title");
	});

	QUnit.test("TileContent content doesn't contain attributes ARIA-label and title", function(assert) {
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());
		//Act
		var sAriaLabelOfContent1 = jQuery("#tile-cont-1").attr("aria-label");
		var sTitleOfTileContent1 = jQuery("#tile-cont-1").attr("title");
		var sAriaLabelOfContent2 = jQuery("#tile-cont-2").attr("aria-label");
		var sTitleOfTileContent2 = jQuery("#tile-cont-2").attr("title");
		//Assert
		assert.ok(!sAriaLabelOfContent1, "GenericTile 1 doesn't contain attribute aria-label");
		assert.ok(!sTitleOfTileContent1, "GenericTile 1 doesn't contain attribute title");
		assert.ok(!sAriaLabelOfContent2, "GenericTile 1 doesn't contain attribute aria-label");
		assert.ok(!sTitleOfTileContent2, "GenericTile 1 doesn't contain attribute title");
	});

	QUnit.test("NumericContent doesn't contain attributes ARIA-label and title", function(assert) {
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());
		var sAriaLabelOfNumericContent = jQuery("#numeric-content").attr("aria-label");
		var sTitleOfNumericContent = jQuery("#numeric-content").attr("title");
		//Assert
		assert.ok(!sAriaLabelOfNumericContent, "NumericContent doesn't contain attribute ARIA-label");
		assert.ok(!sTitleOfNumericContent, "NumericContent doesn't contain attribute title");
	});

	QUnit.module("Tooltip handling if content elements changed", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				header: "header text of GenericTile",
				subheader: "subheader text of GenericTile",
				tileContent: [
					new TileContent("tile-cont-1", {
						content: new NumericContent("numeric-content", {
							value: 111
						})
					})
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Attributes of GenericTile and its descendants updated after content changed", function(assert) {
		//Arrange
		var $Tile = this.oGenericTile.$();
		//Act
		var sAriaLabelOfGenericTile = $Tile.attr("aria-label");
		//Assert
		assert.equal(sAriaLabelOfGenericTile, sAriaLabelOfGenericTile, "GenericTile has correct ARIA-label attribute before content changed");

		//Arrange
		this.oGenericTile.getTileContent()[0].getContent().setValue("999");
		// Trigger the mouseenter event on the element
		this.oGenericTile.getDomRef().dispatchEvent(createMouseEnterEvent());
		//Act
		var sAriaLabelOfNumericContent = jQuery("#numeric-content").attr("aria-label");
		var sTitleOfNumericContent = jQuery("#numeric-content").attr("title");
		//Assert
		assert.ok(!sAriaLabelOfNumericContent, "NumericContent doesn't contain ARIA-label attribute after content changed");
		assert.ok(!sTitleOfNumericContent, "NumericContent doesn't contain title attribute after content changed");
	});

	QUnit.module("Event Tests", {
		beforeEach: async function() {
			this.ftnPressHandler = function() {
			};
			this.sRequiredTheme = null;

			var fnAttachApplied = (oEvent) => {
				Theming.detachApplied(fnAttachApplied);
				if (Theming.getTheme() === this.sRequiredTheme) {
					if (typeof this.fnCallback === "function") {
						this.fnCallback.bind(this)();
						this.fnCallback = undefined;
					}
				}
			};

			this.applyTheme = function(sTheme, fnCallback) {
				this.fnCallback = fnCallback;
				this.sRequiredTheme = sTheme;
				if (Theming.getTheme() === this.sRequiredTheme) {
					if (typeof fnCallback === "function") {
						fnCallback.bind(this)();
						fnCallback = undefined;
					}
				} else {
					Theming.setTheme(sTheme);
					Theming.attachApplied(fnAttachApplied.bind(this));
				}
			};
			this.hasAttribute = function(sAttribute, oCurrentObject) {
				var sAttributeValue = oCurrentObject.$().attr(sAttribute);
				if (typeof sAttributeValue !== "undefined" && sAttributeValue !== false) {
					return true;
				} else {
					return false;
				}
			};
			this.oGenericTile = new GenericTile("generic-tile", {
				subheader: "Expenses By Region",
				frameType: FrameType.OneByOne,
				header: "Comparative Annual Totals",
				headerImage: IMAGE_PATH + "female_BaySu.jpg",
				tileContent: new TileContent("tile-cont", {
					unit: "EUR",
					footer: "Current Quarter",
					content: new NumericContent("numeric-cnt", {
						state: LoadState.Loaded,
						scale: "M",
						indicator: DeviationIndicator.Up,
						truncateValueTo: 4,
						value: 20,
						nullifyValue: true,
						formatterValue: false,
						valueColor: ValueColor.Good,
						icon: "sap-icon://customer-financial-fact-sheet"
					})
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
			this.spy(this, "ftnPressHandler");
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("No press event test", function(assert) {
		//Arrange
		//Act
		this.oGenericTile.$().trigger("tap");

		//Assert
		assert.equal(this.hasAttribute("tabindex", this.oGenericTile), true, "GenericTile can have focus no matter it has press event or not");
		assert.equal(this.oGenericTile.$().hasClass("sapMPointer"), true, "GenericTile can have hand pointer no matter it has press event or not");
	});

	QUnit.test("No press event when press event disabled", function(assert) {
		var fnDone = assert.async();

		//Arrange
		var bEventNotTriggered = true;
		this.oGenericTile.attachEvent("press", handlePress);
		this.oGenericTile.setPressEnabled(false);

		//Act
		this.oGenericTile.$().trigger("tap");

		//Assert
		function handlePress(oEvent) {
			bEventNotTriggered = false;
		}

		assert.ok(bEventNotTriggered, "Press event of GenericTile is not triggered on mouse click.");
		setTimeout(function() {
			this.oGenericTile.getDomRef().classList.contains("sapMAutoPointer");
			fnDone();
		}.bind(this), 0);
	});

	QUnit.test("Press event on 'tap' with correct parameters in Display scope", function(assert) {
		//Arrange
		this.oGenericTile.attachEvent("press", handlePress);

		//Act
		this.oGenericTile.$().trigger("tap");

		//Assert
		function handlePress(oEvent) {
			assert.equal(oEvent.getParameter("scope"), GenericTileScope.Display, "Press event has correct parameter 'scope'");
			assert.equal(oEvent.getParameter("action"), GenericTile._Action.Press, "Press event has correct parameter 'action'");
		}
	});

	QUnit.test("Press event on 'tap' with correct parameters in Actions scope", async function(assert) {
		//Arrange
		var oGenericTile = this.oGenericTile;
		this.oGenericTile.setScope(GenericTileScope.Actions);
		await nextUIUpdate();
		this.oGenericTile.attachEvent("press", handlePress);

		//Act
		this.oGenericTile.$().trigger("tap");

		//Assert
		function handlePress(oEvent) {
			assert.equal(oEvent.getParameter("scope"), GenericTileScope.Actions, "Press event has correct parameter 'scope'");
			assert.equal(oEvent.getParameter("action"), GenericTile._Action.Press, "Press event has correct parameter 'action'");
			assert.equal(oEvent.getParameter("domRef"), oGenericTile._oMoreIcon.getDomRef(), "Event parameter 'domRef' points to More Icon");
		}
	});

	QUnit.test("Press event on 'tap' with correct parameters in Remove Actions scope", async function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.ActionRemove);
		await nextUIUpdate();
		var oHandlePressSpy = this.spy();
		this.oGenericTile.attachEvent("press", oHandlePressSpy);

		//Act
		this.oGenericTile.$().trigger("tap");

		//Assert
		assert.strictEqual(oHandlePressSpy.callCount, 0, "On tile press, remove is not triggered.");
	});

	QUnit.test("ENTER key down event in Display scope", function(assert) {
		//Arrange
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var e = jQuery.Event("keydown");
		e.keyCode = KeyCodes.ENTER;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(this.ftnPressHandler.notCalled, "Press event is not triggered on ENTER down");
	});

	QUnit.test("ENTER key event in Display scope", function(assert) {
		//Arrange
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var e = jQuery.Event("keyup");
		e.keyCode = KeyCodes.ENTER;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered on ENTER up");
	});

	QUnit.test("ENTER key event in Actions scope", async function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		await nextUIUpdate();
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var e = jQuery.Event("keyup");
		e.keyCode = KeyCodes.ENTER;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered on ENTER up");
	});

	QUnit.test("SPACE key event in Display scope", function(assert) {
		//Arrange
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var e = jQuery.Event("keyup");
		e.keyCode = KeyCodes.SPACE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered on SPACE up");
	});

	QUnit.test("SPACE key event in Display scope with correct parameters", async function(assert) {
		//Arrange
		var oGenericTile = this.oGenericTile;
		this.oGenericTile.setScope(GenericTileScope.Display);
		await nextUIUpdate();
		this.oGenericTile.attachEvent("press", handlePress);
		var e = jQuery.Event("keyup");
		e.keyCode = KeyCodes.SPACE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		function handlePress(oEvent) {
			assert.equal(oEvent.getParameter("scope"), GenericTileScope.Display, "Press event has correct parameter 'scope'");
			assert.equal(oEvent.getParameter("action"), GenericTile._Action.Press, "Press event has correct parameter 'action'");
			assert.equal(oEvent.getParameter("domRef"), oGenericTile.getDomRef(), "Event parameter 'domRef' points to GenericTile");
		}
	});

	QUnit.test("SPACE key event in Actions scope", async function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		await nextUIUpdate();
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var e = jQuery.Event("keyup");
		e.keyCode = KeyCodes.SPACE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered on SPACE up");
	});

	QUnit.test("SPACE key event in Actions scope with correct parameters", async function(assert) {
		//Arrange
		var oGenericTile = this.oGenericTile;
		this.oGenericTile.setScope(GenericTileScope.Actions);
		await nextUIUpdate();
		this.oGenericTile.attachEvent("press", handlePress);
		var e = jQuery.Event("keyup");
		e.keyCode = KeyCodes.SPACE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		function handlePress(oEvent) {
			assert.equal(oEvent.getParameter("scope"), GenericTileScope.Actions, "Press event has correct parameter 'scope'");
			assert.equal(oEvent.getParameter("action"), GenericTile._Action.Press, "Press event has correct parameter 'action'");
			assert.equal(oEvent.getParameter("domRef"), oGenericTile._oMoreIcon.getDomRef(), "Event parameter 'domRef' points to More Icon");
		}
	});

	QUnit.test("DELETE key event in Display scope", function(assert) {
		//Arrange
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var e = jQuery.Event("keyup");
		e.keyCode = KeyCodes.DELETE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(!this.ftnPressHandler.called, "No press event is triggered on DELETE up");
	});

	QUnit.test("BACKSPACE key event in Display scope", function(assert) {
		//Arrange
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var e = jQuery.Event("keyup");
		e.keyCode = KeyCodes.BACKSPACE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(!this.ftnPressHandler.called, "No press event is triggered on BACKSPACE up");
	});

	QUnit.test("DELETE key event in Actions scope with correct parameters", async function(assert) {
		//Arrange
		var oGenericTile = this.oGenericTile;
		this.oGenericTile.setScope(GenericTileScope.Actions);
		await nextUIUpdate();
		this.oGenericTile.attachEvent("press", handlePress);
		var e = jQuery.Event("keyup");
		e.keyCode = KeyCodes.DELETE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		function handlePress(oEvent) {
			assert.equal(oEvent.getParameter("scope"), GenericTileScope.Actions, "Press event has correct parameter 'scope'");
			assert.equal(oEvent.getParameter("action"), GenericTile._Action.Remove, "Press event has correct parameter 'action'");
			assert.equal(oEvent.getParameter("domRef"), oGenericTile._oRemoveButton.getPopupAnchorDomRef(), "Event parameter 'domRef' points to Remove Button");
		}
	});

	QUnit.test("BACKSPACE key event in Actions scope with correct parameters", async function(assert) {
		//Arrange
		var oGenericTile = this.oGenericTile;
		this.oGenericTile.setScope(GenericTileScope.Actions);
		await nextUIUpdate();
		this.oGenericTile.attachEvent("press", handlePress);
		var e = jQuery.Event("keyup");
		e.keyCode = KeyCodes.BACKSPACE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		function handlePress(oEvent) {
			assert.equal(oEvent.getParameter("scope"), GenericTileScope.Actions, "Press event has scope arameter 'Actions'");
			assert.equal(oEvent.getParameter("action"), GenericTile._Action.Remove, "Press event has action parameter 'Remove'");
			assert.equal(oEvent.getParameter("domRef"), oGenericTile._oRemoveButton.getPopupAnchorDomRef(), "Event parameter 'domRef' points to Remove Button");
		}
	});

	QUnit.test("GenericTile press state is removed after Kep Up", async function(assert) {
		this.oGenericTile.invalidate();
		await nextUIUpdate();
		assert.ok(document.getElementById("generic-tile-focus"), "Focus div was rendered successfully");
		assert.ok(jQuery("#generic-tile-hover-overlay").hasClass("sapMGTWithoutImageHoverOverlay"), "Hover overlay was rendered successfully");
		assert.ok(!jQuery("#generic-tile").hasClass("sapMGTPressActive"), "Press action is not triggered on GenericTile");
		assert.ok(!jQuery("#generic-tile-hover-overlay").hasClass("sapMGTPressActive"), "Press action is not triggered on GenericTile hover overlay");
		//Arrange
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var down = jQuery.Event("keydown");
		down.keyCode = KeyCodes.ENTER;

		//Act
		this.oGenericTile.$().trigger(down);
		assert.ok(jQuery("#generic-tile").hasClass("sapMGTPressActive"), "Press action is triggered and press active selector is added to GenericTile");
		assert.ok(jQuery("#generic-tile-hover-overlay").hasClass("sapMGTPressActive"), "Press action is triggered and press active selector is added to GenericTile hover overlay");
		//Arrange
		var up = jQuery.Event("keyup");
		up.keyCode = KeyCodes.ENTER;

		//Act
		this.oGenericTile.$().trigger(up);
		assert.ok(!jQuery("#generic-tile").hasClass("sapMGTPressActive"), "Press action stopped and press active selector is removed from GenericTile");
		assert.ok(!jQuery("#generic-tile-hover-overlay").hasClass("sapMGTPressActive"), "Press action stopped and press active selector is removed from GenericTile hover overlay");

	});

	QUnit.test("Navigation using keyboard to other tiles disabled when a tile is clicked", async function(assert){
		this.oGenericTile.invalidate();
		await nextUIUpdate();
		this.oGenericTile.$().trigger("focus");

		//simulate space key press
		var spaceDown = jQuery.Event("keydown");
		spaceDown.keyCode = KeyCodes.SPACE;
		this.oGenericTile.$().trigger(spaceDown);

		//simulate tab key navigation
		var tabDown = jQuery.Event("keydown");
		tabDown.keyCode = KeyCodes.TAB;
		this.oGenericTile.$().trigger(tabDown);
		var tabUp = jQuery.Event("keyup");
		tabUp.keyCode = KeyCodes.TAB;
		this.oGenericTile.$().trigger(tabUp);

		//Default event cancelled when space key is down
		assert.ok(tabDown.isDefaultPrevented(), "Navigation using TAB disabled when a tile is in selected state with SPACE key");
		var spaceUp = jQuery.Event("keyup");
		spaceUp.keyCode = KeyCodes.SPACE;
		this.oGenericTile.$().trigger(spaceUp);

		//simulate enter key press
		var enterDown = jQuery.Event("keydown");
		enterDown.keyCode = KeyCodes.ENTER;
		this.oGenericTile.$().trigger(enterDown);

		//simulate tab key navigation
		tabDown = jQuery.Event("keydown");
		tabDown.keyCode = KeyCodes.TAB;
		this.oGenericTile.$().trigger(tabDown);
		tabUp = jQuery.Event("keyup");
		tabUp.keyCode = KeyCodes.TAB;
		this.oGenericTile.$().trigger(tabUp);

		//Default event cancelled when enter key is down
		assert.ok(tabDown.isDefaultPrevented(), "Navigation using TAB disabled when a tile is in selected state with ENTER key");
		var enterUp = jQuery.Event("keyup");
		enterUp.keyCode = KeyCodes.ENTER;
		this.oGenericTile.$().trigger(enterUp);

		//simulate space key press
		spaceDown = jQuery.Event("keydown");
		spaceDown.keyCode = KeyCodes.SPACE;
		this.oGenericTile.$().trigger(spaceDown);

		//simulating shift+tab key press
		var shiftDown = jQuery.Event("keydown");
		shiftDown.keyCode = KeyCodes.SHIFT;
		this.oGenericTile.$().trigger(shiftDown);
		tabDown = jQuery.Event("keydown");
		tabDown.keyCode = KeyCodes.TAB;
		this.oGenericTile.$().trigger(tabDown);
		var shiftUp = jQuery.Event("keyup");
		shiftUp.keyCode = KeyCodes.SHIFT;
		this.oGenericTile.$().trigger(shiftUp);
		tabUp = jQuery.Event("keyup");
		tabUp.keyCode = KeyCodes.TAB;
		this.oGenericTile.$().trigger(tabUp);

		//navigation disabled using shift+tab when a tile is selected
		assert.ok(tabDown.isDefaultPrevented(), "Navigation using SHIFT+TAB disabled when a tile is in selected state with SPACE key");
		spaceUp = jQuery.Event("keyup");
		spaceUp.keyCode = KeyCodes.SPACE;
		this.oGenericTile.$().trigger(spaceUp);

		//tile released and action not invoked, on shift or escape press
		this.oGenericTile.$().trigger(spaceDown);
		this.oGenericTile.$().trigger(shiftDown);
		this.oGenericTile.$().trigger(shiftUp);
		assert.ok(!this.oGenericTile.$().hasClass("sapMGTPressActive"), "Press action is not triggered on GenericTile");
		this.oGenericTile.$().trigger(spaceUp);

		var escapeDown = jQuery.Event("keydown");
		escapeDown.keyCode = KeyCodes.ESCAPE;
		var escapeUp = jQuery.Event("keyup");
		escapeUp.keyCode = KeyCodes.ESCAPE;
		this.oGenericTile.$().trigger(spaceDown);
		this.oGenericTile.$().trigger(escapeDown);
		this.oGenericTile.$().trigger(escapeUp);
		assert.ok(!this.oGenericTile.$().hasClass("sapMGTPressActive"), "Press action is not triggered on GenericTile");
		this.oGenericTile.$().trigger(spaceUp);

		//simulating navigation using tab key when no tile is in selected state
		tabDown = jQuery.Event("keydown");
		tabDown.keyCode = KeyCodes.TAB;
		this.oGenericTile.$().trigger(tabDown);
		tabUp = jQuery.Event("keyup");
		tabUp.keyCode = KeyCodes.TAB;
		this.oGenericTile.$().trigger(tabUp);

		//Default event is not cancelled when no tile is selected
		assert.ok(!tabDown.isDefaultPrevented(), "Navigation using TAB enabled since no tile is in selected state");

	});

	QUnit.test("Check the max line of header if footer exists", async function(assert) {
		this.oGenericTile.setFrameType("TwoByHalf");
		this.oGenericTile.setSubheader("");
		var tileContent =  new TileContent("tile-cont-two-by-half", {
			unit: "EUR",
			footer: "Current Quarter"
		});
		this.oGenericTile.destroyTileContent();
		this.oGenericTile.addTileContent(tileContent);
		await nextUIUpdate();
		var check = document.getElementById("tile-cont-two-by-half-footer-text");
		if (check != null) {
			assert.equal(Element.getElementById("generic-tile-title").getMaxLines(), 2, "The header has 2 lines when footer is available");
		}
	});

	QUnit.test("Check for the visibilty of content in header mode in 4*1 tile", async function(assert) {
		this.oGenericTile.setFrameType("TwoByHalf");
		await nextUIUpdate();
		//to check if the content area is visible.
		var oVisibilityCheck = this.spy(this.oGenericTile, "_changeTileContentContentVisibility");
		this.oGenericTile.setMode(GenericTileMode.HeaderMode);
		await nextUIUpdate();
		assert.ok(oVisibilityCheck.calledWith(false), "The visibility is changed to not visible");
	});

	QUnit.test("Check the padding classes of the 4*1 tile", async function(assert) {
		this.oGenericTile.setFrameType("TwoByHalf");
		await nextUIUpdate();
		var check = this.oGenericTile.$().find(".sapMGTHdrContent").length == 1;
		assert.ok(check,"true","all ok");
		var height = getComputedStyle(this.oGenericTile.getDomRef().querySelector(".sapMGTHdrContent")).height;
		assert.ok(height,20,"all ok");
	});

	QUnit.test("Content Proritisation - No Content rendered in OneByHalf in case of image", async function(assert) {
		this.oGenericTile.setFrameType("OneByHalf");
		var tileContent =  new TileContent("tile-cont-two-by-half", {
			unit: "EUR",
			footer: "Current Quarter",
			content: new ImageContent('image-cnt', {
				src: IMAGE_PATH + "headerImg1.png",
				description: "image descriptions ..."
			})
		});
		this.oGenericTile.destroyTileContent();
		this.oGenericTile.addTileContent(tileContent);
		await nextUIUpdate();
		var tileContentChildren = this.oGenericTile.getTileContent()[0].getDomRef().children.length;
		assert.equal(tileContentChildren, 0);
		assert.notEqual(this.oGenericTile._oTitle.getDomRef(), null);
		assert.notEqual(this.oGenericTile._oSubTitle.getDomRef(), null);
		assert.equal(this.oGenericTile.getTileContent()[0]._bRenderFooter, false);
	});

	QUnit.test("Content Proritisation - Numeric content rendered in OneByHalf ", async function(assert) {
		this.oGenericTile.setFrameType("OneByHalf");
		await nextUIUpdate();
		assert.notEqual(this.oGenericTile.getTileContent()[0].getDomRef(), null);
		assert.notEqual(this.oGenericTile._oTitle.getDomRef(), null);
		assert.equal(this.oGenericTile._oSubTitle.getDomRef(), null);
		assert.equal(this.oGenericTile.getTileContent()[0]._bRenderFooter, false);
	});

	QUnit.test("Content Proritisation - Header has max one line when Numeric Content is present ", async function(assert) {
		this.oGenericTile.setFrameType("OneByHalf");
		this.oGenericTile.setHeader("this is a very long header which should exceed two lines so we can test it");
		this.oGenericTile.setSubheader("this is a very long subheader which should exceed two lines so we can test it");
		await nextUIUpdate();
		assert.equal(Element.getElementById("generic-tile-title").getMaxLines(), 1, "The header has 1 lines");
	});


	QUnit.test("Content Proritisation - Header has max two lines no Numeric Content is present ", async function(assert) {
		this.oGenericTile.setFrameType("OneByHalf");
		var tileContent =  new TileContent("tile-cont-two-by-half", {
			unit: "EUR",
			footer: "Current Quarter",
			content: new ImageContent('image-cnt', {
				src: IMAGE_PATH + "headerImg1.png",
				description: "image descriptions ..."
			})
		});
		this.oGenericTile.destroyTileContent();
		this.oGenericTile.addTileContent(tileContent);
		this.oGenericTile.setHeader("this is a very long header which should exceed two lines so we can test it");
		this.oGenericTile.setSubheader("this is a very long subheader which should exceed two lines so we can test it");
		await nextUIUpdate();
		assert.equal(Element.getElementById("generic-tile-title").getMaxLines(), 2, "The header has 2 lines");
	});

	QUnit.test("Content Proritisation -  Content rendered in TwoByHalf", async function(assert) {
		this.oGenericTile.setFrameType("TwoByHalf");
		await nextUIUpdate();
		assert.notEqual(this.oGenericTile.getTileContent()[0].getDomRef(), null);
		assert.notEqual(this.oGenericTile._oTitle.getDomRef(), null);
		assert.equal(this.oGenericTile._oSubTitle.getDomRef(), null);
		assert.equal(this.oGenericTile.getTileContent()[0]._bRenderFooter, false);
	});

	QUnit.test("Content Proritisation -  Header and subtitle rendered in TwoByHalf", async function(assert) {
		this.oGenericTile.setFrameType("TwoByHalf");
		var tileContent =  new TileContent("tile-cont-two-by-half", {
			unit: "EUR",
			footer: "Current Quarter"
		});
		this.oGenericTile.destroyTileContent();
		this.oGenericTile.addTileContent(tileContent);
		await nextUIUpdate();
		assert.notEqual(this.oGenericTile._oTitle.getDomRef(), null);
		assert.notEqual(this.oGenericTile._oSubTitle.getDomRef(), null);
		assert.equal(this.oGenericTile.getTileContent()[0]._bRenderFooter, false);
	});

	QUnit.test("Content Proritisation -  Footer rendered in TwoByHalf", async function(assert) {
		this.oGenericTile.setFrameType("TwoByHalf");
		var tileContent =  new TileContent("tile-cont-two-by-half", {
			unit: "EUR",
			footer: "Current Quarter"
		});
		this.oGenericTile.destroyTileContent();
		this.oGenericTile.addTileContent(tileContent);
		this.oGenericTile.setSubheader(null);
		await nextUIUpdate();
		assert.notEqual(this.oGenericTile._oTitle.getDomRef(), null);
		assert.equal(this.oGenericTile._oSubTitle.getDomRef(), null);
		assert.equal(this.oGenericTile.getTileContent()[0]._bRenderFooter, true);
	});

	QUnit.test("Content Proritisation -  Subheader rendered in OneByHalf", async function(assert) {
		this.oGenericTile.setFrameType("OneByHalf");
		var tileContent =  new TileContent("tile-cont-one-by-half", {
			footer: "Current Quarter"
		});
		this.oGenericTile.destroyTileContent();
		this.oGenericTile.addTileContent(tileContent);
		this.oGenericTile.setSubheader("Subtitle Launch Tile");
		await nextUIUpdate();
		assert.notEqual(this.oGenericTile._oTitle.getDomRef(), null);
		assert.notEqual(this.oGenericTile._oSubTitle.getDomRef(), null);
		assert.equal(this.oGenericTile.getTileContent()[0]._bRenderFooter, false);
	});

	QUnit.test("Content Proritisation -  Footer rendered in OneByHalf", async function(assert) {
		this.oGenericTile.setFrameType("OneByHalf");
		var tileContent =  new TileContent("tile-cont-one-by-half", {
			unit: "EUR",
			footer: "Current Quarter"
		});
		this.oGenericTile.destroyTileContent();
		this.oGenericTile.addTileContent(tileContent);
		this.oGenericTile.setSubheader(null);
		await nextUIUpdate();
		assert.notEqual(this.oGenericTile._oTitle.getDomRef(), null);
		assert.equal(this.oGenericTile._oSubTitle.getDomRef(), null);
		assert.equal(this.oGenericTile.getTileContent()[0]._bRenderFooter, true);
	});

	QUnit.test("Height of the system Info Container for OneByOne tile", async function(assert){
			this.oGenericTile.setFrameType("OneByOne");
			this.oGenericTile.setAppShortcut("app shortcut");
			this.oGenericTile.setSystemInfo("system info");
			await nextUIUpdate();
			assert.equal(this.oGenericTile.$().find(".sapMGTTInfoContainer").css("height"),"44px","Sufficient Height applied");
	});

	QUnit.test("Height of the system Info Container for TwoByOne tile", async function(assert){
			this.oGenericTile.setFrameType("TwoByOne");
			this.oGenericTile.setAppShortcut("app shortcut");
			this.oGenericTile.setSystemInfo("system info");
			await nextUIUpdate();
			assert.equal(this.oGenericTile.$().find(".sapMGTTInfo").css("margin-bottom"),"11.2px","Sufficient Height applied");
	});

	QUnit.test("App shortcut and System info only rendered in OneByOne", async function(assert) {
		this.oGenericTile.setFrameType("OneByOne");
		this.oGenericTile.setAppShortcut("app shortcut");
		this.oGenericTile.setSystemInfo("system info");
		await nextUIUpdate();
		assert.notEqual(this.oGenericTile._oAppShortcut.getDomRef(), null);
		assert.notEqual(this.oGenericTile._oSystemInfo.getDomRef(), null);

		this.oGenericTile.setFrameType("OneByHalf");
		await nextUIUpdate();

		assert.equal(this.oGenericTile._oAppShortcut.getDomRef(), null);
		assert.equal(this.oGenericTile._oSystemInfo.getDomRef(), null);
	});

	QUnit.test("App shortcut and System info only rendered in TwoByOne", async function(assert) {
		this.oGenericTile.setFrameType("TwoByOne");
		this.oGenericTile.setAppShortcut("app shortcut");
		this.oGenericTile.setSystemInfo("system info");
		await nextUIUpdate();
		assert.equal(this.oGenericTile.getAppShortcut(), "app shortcut");
		assert.equal(this.oGenericTile.getSystemInfo(),"system info" );
	});
	QUnit.test("App shortcut and System info only rendered in TwoByHalf", async function(assert) {
		this.oGenericTile.setFrameType("TwoByHalf");
		this.oGenericTile.setAppShortcut("app shortcut");
		this.oGenericTile.setSystemInfo("system info");
		await nextUIUpdate();
		assert.equal(this.oGenericTile.getAppShortcut(), "app shortcut");
		assert.equal(this.oGenericTile.getSystemInfo(),"system info" );
	});
	QUnit.test("App shortcut and System info only rendered in Linemode", async function(assert) {
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		this.oGenericTile.setAppShortcut("app shortcut");
		this.oGenericTile.setSystemInfo("system info");
		await nextUIUpdate();
		assert.equal(this.oGenericTile.getAppShortcut(), "app shortcut");
		assert.equal(this.oGenericTile.getSystemInfo(),"system info" );
	});

	QUnit.test("Check the padding classes of the 2*1 small tile", async function(assert) {
		this.oGenericTile.setFrameType("OneByHalf");
		await nextUIUpdate();
		var check = this.oGenericTile.$().find(".sapMGTHdrContent").length == 1;
		assert.ok(check,"true","all ok");
		var height = getComputedStyle(this.oGenericTile.getDomRef().querySelector(".sapMGTHdrContent")).height;
		assert.ok(height,28,"all ok");
	});

	QUnit.test("Check the padding classes of the 4*1 small tile", async function(assert) {
		this.oGenericTile.setFrameType("TwoByHalf");
		await nextUIUpdate();
		var check = this.oGenericTile.$().find(".sapMGTHdrContent").length == 1;
		assert.ok(check,"true","all ok");
		var height = getComputedStyle(this.oGenericTile.getDomRef().querySelector(".sapMGTHdrContent")).height;
		assert.ok(height,28,"all ok");
	});

	QUnit.test("Header has max two lines if subheader exists for 4*1 tile", async function(assert) {
		this.oGenericTile.setFrameType("TwoByHalf");
		var tileContent =  new TileContent("tile-cont-one-by-half", {
			footer: "Current Quarter"
		});
		this.oGenericTile.destroyTileContent();
		this.oGenericTile.addTileContent(tileContent);
		this.oGenericTile.setSubheader("Subtitle Launch Tile");
		this.oGenericTile.setHeader("this is a very long header which should exceed two lines so we can test it");
		await nextUIUpdate();
		assert.equal(Element.getElementById("generic-tile-title").getMaxLines(), 2, "The header has 2 lines");
	});

	QUnit.test("Header has max one lines if content aggregation exists for 4*1 tile", async function(assert) {
		this.oGenericTile.setFrameType("TwoByHalf");
		var tileContent =  new TileContent("tile-cont-one-by-half", {
			unit: "EUR",
			footer: "Current Quarter",
			content: new NumericContent("numeric-content", {
				state: LoadState.Loaded,
				scale: "M",
				indicator: DeviationIndicator.Up,
				truncateValueTo: 4,
				value: 20,
				nullifyValue: true,
				formatterValue: false,
				valueColor: ValueColor.Good,
				icon: "sap-icon://customer-financial-fact-sheet"
			})
		});
		this.oGenericTile.destroyTileContent();
		this.oGenericTile.addTileContent(tileContent);
		this.oGenericTile.setHeader("this is a very long header which should exceed one line so we can test it");
		await nextUIUpdate();
		assert.equal(Element.getElementById("generic-tile-title").getMaxLines(), 1, "The header has 1 line");
	});

	QUnit.test("Check the padding classes of the 2*1 tile", async function(assert) {
		this.oGenericTile.setFrameType("OneByHalf");
		await nextUIUpdate();
		var check = this.oGenericTile.$().find(".sapMGTHdrContent").length == 1;
		assert.ok(check,"true","all ok");
	});

	QUnit.test("Check for visibilty of content in header mode in 2*1 tile ", async function(assert) {
		this.oGenericTile.setFrameType("OneByHalf");
		await nextUIUpdate();
		//to check if the content area is visible.
		var oVisibilitySpy = this.spy(this.oGenericTile, "_changeTileContentContentVisibility");
		this.oGenericTile.setMode(GenericTileMode.HeaderMode);
		await nextUIUpdate();
		assert.ok(oVisibilitySpy.calledWith(false), "The visibility is changed to not visible");
		});

	QUnit.module("GenericTile Overlay", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				header: "header text of GenericTile",
				subheader: "subheader text of GenericTile",
				tileContent: []
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("OneByHalf Tile with NumericContent", async function(assert){
		this.oGenericTile.setFrameType("OneByHalf");
		var oTileContent =  new TileContent("tile-cont-two-by-half", {
			unit: "EUR",
			footer: "Current Quarter",
			content: new NumericContent("numeric-cnt", {
				state: LoadState.Loaded,
				scale: "M",
				indicator: DeviationIndicator.Up,
				truncateValueTo: 4,
				value: 20,
				nullifyValue: true,
				formatterValue: false,
				valueColor: ValueColor.Good,
				icon: "sap-icon://customer-financial-fact-sheet"
			})
		});
		this.oGenericTile.destroyTileContent();
		this.oGenericTile.addTileContent(oTileContent);
		await nextUIUpdate();
		var tileContentChildren = (this.oGenericTile.getTileContent()[0].getDomRef().children.length) > 0;
		assert.equal(this.oGenericTile.getTileContent().length, 1, "Single Tile content is added to GenericTile.");
		assert.equal(this.oGenericTile.getTileContent()[0].getAggregation('content').getMetadata()._sClassName, "sap.m.NumericContent", "Tile Content contains NumericContent.");
		assert.equal(this.oGenericTile.getTileContent()[0].getVisible(), true, "Tile Content with NumericContent is rendered for the GenericTile.");
		assert.ok(tileContentChildren, "Tile Content with NumericContent does add overlay on the GenericTile.");
	});

	QUnit.test("OneByHalf Tile with ImageContent", async function(assert){
		this.oGenericTile.setFrameType("OneByHalf");
		var oTileContent =  new TileContent("tile-cont-two-by-half", {
			unit: "EUR",
			footer: "Current Quarter",
			content: new ImageContent('image-cnt', {
				src: IMAGE_PATH + "headerImg1.png",
				description: "image descriptions ..."
			})
		});
		this.oGenericTile.destroyTileContent();
		this.oGenericTile.addTileContent(oTileContent);
		await nextUIUpdate();
		var tileContentChildren = this.oGenericTile.getTileContent()[0].getDomRef().children.length;
		assert.equal(this.oGenericTile.getTileContent().length, 1, "Single Tile content is added to GenericTile.");
		assert.equal(this.oGenericTile.getTileContent()[0].getAggregation('content').getMetadata()._sClassName, "sap.m.ImageContent", "Tile Content contains ImageContent.");
		assert.equal(this.oGenericTile.getTileContent()[0].getVisible(), true, "Tile Content with ImageContent is not rendered for the GenericTile.");
		assert.equal(tileContentChildren, 0, "Tile Content with ImageContent does not add overlay on the GenericTile.");
	});

	QUnit.test("TwoByHalf Tile with NumericContent", async function(assert){
		this.oGenericTile.setFrameType("TwoByHalf");
		var oTileContent =  new TileContent("tile-cont-two-by-half", {
			unit: "EUR",
			footer: "Current Quarter",
			content: new NumericContent("numeric-cnt", {
				state: LoadState.Loaded,
				scale: "M",
				indicator: DeviationIndicator.Up,
				truncateValueTo: 4,
				value: 20,
				nullifyValue: true,
				formatterValue: false,
				valueColor: ValueColor.Good,
				icon: "sap-icon://customer-financial-fact-sheet"
			})
		});
		this.oGenericTile.destroyTileContent();
		this.oGenericTile.addTileContent(oTileContent);
		await nextUIUpdate();
		var tileContentChildren = (this.oGenericTile.getTileContent()[0].getDomRef().children.length) > 0;
		assert.equal(this.oGenericTile.getTileContent().length, 1, "Single Tile content is added to GenericTile.");
		assert.equal(this.oGenericTile.getTileContent()[0].getAggregation('content').getMetadata()._sClassName, "sap.m.NumericContent", "Tile Content contains NumericContent.");
		assert.equal(this.oGenericTile.getTileContent()[0].getVisible(), true, "Tile Content with NumericContent is rendered for the GenericTile.");
		assert.ok(tileContentChildren, "Tile Content with NumericContent does add overlay on the GenericTile.");
	});

	QUnit.test("TwoByHalf Tile with ImageContent", async function(assert){
		this.oGenericTile.setFrameType("TwoByHalf");
		var oTileContent =  new TileContent("tile-cont-two-by-half", {
			unit: "EUR",
			footer: "Current Quarter",
			content: new ImageContent('image-cnt', {
				src: IMAGE_PATH + "headerImg1.png",
				description: "image descriptions ..."
			})
		});
		this.oGenericTile.destroyTileContent();
		this.oGenericTile.addTileContent(oTileContent);
		await nextUIUpdate();
		var tileContentChildren = (this.oGenericTile.getTileContent()[0].getDomRef().children.length) > 0;
		assert.equal(this.oGenericTile.getTileContent().length, 1, "Single Tile content is added to GenericTile.");
		assert.equal(this.oGenericTile.getTileContent()[0].getAggregation('content').getMetadata()._sClassName, "sap.m.ImageContent", "Tile Content contains ImageContent.");
		assert.equal(this.oGenericTile.getTileContent()[0].getVisible(), true, "Tile Content with ImageContent is rendered for the GenericTile.");
		assert.ok(tileContentChildren, "Tile Content with ImageContent does not add overlay on the GenericTile.");
	});

	QUnit.module("Action Mode Tests", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				mode: GenericTileMode.ActionMode,
				subheader: "Expenses By Region",
				frameType: FrameType.TwoByOne,
				header: "Comparative Annual Totals",
				headerImage: "sap-icon://alert",
				tileContent: new TileContent("tile-cont", {
					unit: "EUR",
					priority: Priority.High,
					priorityText: "High",
					footer: "Current Quarter",
					content: new NumericContent("numeric-cnt", {
						state: LoadState.Loaded,
						scale: "M",
						indicator: DeviationIndicator.Up,
						truncateValueTo: 4,
						value: 20,
						nullifyValue: true,
						formatterValue: false,
						valueColor: ValueColor.Good,
						icon: "sap-icon://customer-financial-fact-sheet"
					})
				}),
				actionButtons: [
					this.oActionButton1 = new Button(),
					this.oActionButton2 = new Button()
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},

		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		},

		fnWithRenderAsserts: function(assert) {
			assert.ok(document.getElementById("generic-tile"), "Generic tile was rendered successfully");
			assert.ok(document.getElementById("generic-tile-hdr-text"), "Generic tile header was rendered successfully");
			assert.ok(document.getElementById("generic-tile-subHdr-text"), "Generic tile subheader was rendered successfully");
			assert.ok(document.getElementById("generic-tile-icon-image"), "Generic tile icon was rendered successfully");
			assert.ok(document.getElementById("tile-cont"), "TileContent was rendered successfully");
			assert.ok(document.getElementById("tile-cont-priority"), "Priority container was rendered successfully");
			assert.ok(document.getElementById("tile-cont-priority-content"), "Priority content was rendered successfully");
			assert.ok(document.getElementById("tile-cont-priority-value"), "Priority value was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt"), "NumericContent was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt-indicator"), "Indicator was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt-value"), "Value was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt-scale"), "Scale was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt-icon-image"), "Icon was rendered successfully");
			assert.ok(this.oGenericTile.getDomRef().classList.contains("TwoByOne"), "TwoByOne FrameType class has been added");
		}
	});

	QUnit.test("Correct HTML Element is fetched", function(assert) {
        assert.ok(document.querySelector('[id="'  + this.oGenericTile.getId() + "-actionButtons" + '"]'), "Html element is fetched");
    });

	QUnit.test("_applyExtraHeight property should not be called when the tile is in loading state", async function(assert) {
		this.fnWithRenderAsserts(assert);

		var openSpy = sinon.spy(GenericTile.prototype, "_applyExtraHeight");

		this.oGenericTile.setState(LoadState.Loaded);
		this.oGenericTile.invalidate(); // force invalidation, in case state was already "Loaded"
		await nextUIUpdate();
		assert.equal(openSpy.callCount, 1, "The _applyExtraHeight function is called when the state is in loaded");
		openSpy.resetHistory();

		this.oGenericTile.setState(LoadState.Loading);
		await nextUIUpdate();
		assert.equal(openSpy.callCount, 0, "The _applyExtraHeight function is not called when the state is in loading");
	});

	QUnit.test("GenericTile rendered with Action Buttons", function(assert) {
		this.fnWithRenderAsserts(assert);

		assert.ok(document.getElementById("generic-tile-actionButtons"), "Action Buttons Container is rendered");
		assert.ok(document.getElementById(this.oActionButton1.getId()), "Action Button 1 is rendered");
		assert.ok(document.getElementById(this.oActionButton1.getId()), "Action Button 2 is rendered");
	});

	QUnit.test("Press Event Tests for Action Buttons", function(assert) {
		var oButtonPressHandler = this.spy(),
			oTilePressHandler = this.spy();
		this.oActionButton1.attachPress(oButtonPressHandler);
		this.oGenericTile.attachPress(oTilePressHandler);

		//Trigger press for Action Button
		this.oActionButton1.firePress();
		assert.ok(oButtonPressHandler.calledOnce, "Button press handler called on Button Press");
		assert.notOk(oTilePressHandler.calledOnce, "Generic Tile press handler is not called on Button Press");

		oButtonPressHandler = this.spy();

		//Trigger press for Generic Tile
		this.oGenericTile.firePress();
		assert.ok(oTilePressHandler.calledOnce, "Generic Tile press handler is called on Tile Press");
		assert.notOk(oButtonPressHandler.calledOnce, "Button press handler is not called on Tile Press");
	});

	QUnit.test("Addtion or Deletion of Action Buttons", async function(assert) {
		var oButton = new Button("test_button");

		//add test button
		this.oGenericTile.addActionButton(oButton);
		await nextUIUpdate();
		assert.ok(document.getElementById(oButton.getId()), "New Button is rendered successfully");

		//remove test button
		this.oGenericTile.removeActionButton(oButton);
		await nextUIUpdate();
		assert.equal(document.getElementById(oButton.getId()), null, "New Button is removed successfully");

		//remove all buttons
		this.oGenericTile.removeAllActionButtons();
		await nextUIUpdate();
		assert.notOk(document.getElementById(this.oActionButton1.getId()), "Action Button 1 is not rendered");
		assert.notOk(document.getElementById(this.oActionButton1.getId()), "Action Button 2 is rendered");
		assert.notOk(document.getElementById("generic-tile-actionButtons"), "Action Buttons Container is not rendered");
	});

	QUnit.test("Header Icon Color changes upon ValueColor property change", async function(assert) {
		//Default Color Check
		assert.ok(document.querySelector("#generic-tile-icon-image").classList.contains(ValueColor.None), "Default Color is applied");

		//Change to Good ValueColor
		this.oGenericTile.setValueColor(ValueColor.Good);
		await nextUIUpdate();
		assert.ok(document.querySelector("#generic-tile-icon-image").classList.contains(ValueColor.Good), "Good Color is applied");

		//Change to Critical ValueColor
		this.oGenericTile.setValueColor(ValueColor.Critical);
		await nextUIUpdate();
		assert.ok(document.querySelector("#generic-tile-icon-image").classList.contains(ValueColor.Critical), "Critical Color is applied");

		//Change to Error ValueColor
		this.oGenericTile.setValueColor(ValueColor.Error);
		await nextUIUpdate();
		assert.ok(document.querySelector("#generic-tile-icon-image").classList.contains(ValueColor.Error), "Error Color is applied");

		//Change to Neutral ValueColor
		this.oGenericTile.setValueColor(ValueColor.Neutral);
		await nextUIUpdate();
		assert.ok(document.querySelector("#generic-tile-icon-image").classList.contains(ValueColor.Neutral), "Neutral Color is applied");
	});

	QUnit.test("Priority Changes for TileContent", async function(assert) {
		var oTileContent = this.oGenericTile.getTileContent()[0];
		var sPriority = Library.getResourceBundleFor("sap.m").getText("TEXT_CONTENT_PRIORITY");

		//Switch to None Priority
		oTileContent.setPriority(Priority.None);
		await nextUIUpdate();
		assert.notOk(document.getElementById("tile-cont-priority"), Priority.None + ": Priority container is not rendered");
		assert.notOk(document.getElementById("tile-cont-priority-content"), Priority.None + ": Priority content is not rendered");
		assert.notOk(document.getElementById("tile-cont-priority-border"), Priority.None + ": Priority border is not rendered");
		assert.notOk(document.getElementById("tile-cont-priority-value"), Priority.None + ": Priority value is not rendered");

		//Switch to VeryHigh Priority
		oTileContent.setPriority(Priority.VeryHigh);
		oTileContent.setPriorityText("Very High");

		await nextUIUpdate();
		assert.ok(document.getElementById("tile-cont-priority"), Priority.VeryHigh + ": Priority container is rendered");
		assert.ok(document.getElementById("tile-cont-priority").classList.contains(Priority.VeryHigh), Priority.VeryHigh + ": VeryHigh StyleClass is applied");
		assert.ok(document.getElementById("tile-cont-priority-content"), Priority.VeryHigh + ":Priority content is rendered");
		assert.equal(document.getElementById("tile-cont-priority-value").innerText, this.oGenericTile.getTileContent()[0].getPriorityText(),Priority.VeryHigh + ":Priority value is rendered");

		//Switch to High Priority
		oTileContent.setPriority(Priority.High);
		oTileContent.setPriorityText("High");
		await nextUIUpdate();
		assert.ok(document.getElementById("tile-cont-priority"), Priority.High + ": Priority container is rendered");
		assert.ok(document.getElementById("tile-cont-priority").classList.contains(Priority.High), Priority.High + ": High StyleClass is applied");
		assert.ok(document.getElementById("tile-cont-priority-content"), Priority.High + ":Priority content is rendered");
		assert.equal(document.getElementById("tile-cont-priority-value").innerText, this.oGenericTile.getTileContent()[0].getPriorityText(), Priority.High + ":Priority value is rendered");

		//Switch to Medium Priority
		oTileContent.setPriority(Priority.Medium);
		oTileContent.setPriorityText("Medium");

		await nextUIUpdate();
		assert.ok(document.getElementById("tile-cont-priority"), Priority.Medium + ": Priority container is rendered");
		assert.ok(document.getElementById("tile-cont-priority").classList.contains(Priority.Medium), Priority.Medium + ": Medium StyleClass is applied");
		assert.ok(document.getElementById("tile-cont-priority-content"), Priority.Medium + ":Priority content is rendered");
		assert.equal(document.getElementById("tile-cont-priority-value").innerText, this.oGenericTile.getTileContent()[0].getPriorityText(), Priority.Medium + ":Priority value is rendered");

		//Switch to Low Priority
		oTileContent.setPriority(Priority.Low);
		oTileContent.setPriorityText("Low");

		await nextUIUpdate();
		assert.ok(document.getElementById("tile-cont-priority"), Priority.Low + ": Priority container is rendered");
		assert.ok(document.getElementById("tile-cont-priority").classList.contains(Priority.Low), Priority.Low + ": Low StyleClass is applied");
		assert.ok(document.getElementById("tile-cont-priority-content"), Priority.Low + ":Priority content is rendered");
		assert.equal(document.getElementById("tile-cont-priority-value").innerText, this.oGenericTile.getTileContent()[0].getPriorityText(), Priority.Low + ":Priority value is rendered");
		assert.notOk(this.oGenericTile.getTileContent()[0].getAltText().includes(sPriority),"Priority text is not rendered inside the tooltip");
	});

	QUnit.test("Action Mode for Different Frame Types", async function(assert) {
		//Switch to OneByOne
		this.oGenericTile.setFrameType(FrameType.OneByOne);
		await nextUIUpdate();

		assert.ok(this.oGenericTile.getDomRef().classList.contains("OneByOne"), "OneByOne FrameType class has been added");
		assert.notOk(document.getElementById("tile-cont-priority"), "Priority container is not rendered");
		assert.notOk(document.getElementById("generic-tile-actionButtons"), "Action Buttons Container is not rendered");

		//Switch to OneByHalf
		this.oGenericTile.setFrameType(FrameType.OneByHalf);
		await nextUIUpdate();

		assert.ok(this.oGenericTile.getDomRef().classList.contains("OneByHalf"), "OneByHalf FrameType class has been added");
		assert.notOk(document.getElementById("tile-cont-priority"), "Priority container is not rendered");
		assert.notOk(document.getElementById("generic-tile-actionButtons"), "Action Buttons Container is not rendered");

		//Switch to TwoByHalf
		this.oGenericTile.setFrameType(FrameType.TwoByHalf);
		await nextUIUpdate();

		assert.ok(this.oGenericTile.getDomRef().classList.contains("TwoByHalf"), "TwoByHalf FrameType class has been added");
		assert.notOk(document.getElementById("tile-cont-priority"), "Priority container is not rendered");
		assert.notOk(document.getElementById("generic-tile-actionButtons"), "Action Buttons Container is not rendered");

		//Switch to TwoByOne
		this.oGenericTile.setFrameType(FrameType.TwoByOne);
		await nextUIUpdate();

		assert.ok(this.oGenericTile.getDomRef().classList.contains("TwoByOne"), "TwoByOne FrameType class has been added");
		assert.ok(document.getElementById("tile-cont-priority"), "Priority container is rendered");
		assert.ok(document.getElementById("generic-tile-actionButtons"), "Action Buttons Container is rendered");
	});

	QUnit.test("TwoByOne Tile: Switch between modes", async function(assert) {
		//Switch to HeaderMode
		this.oGenericTile.setMode(GenericTileMode.HeaderMode);
		await nextUIUpdate();

		assert.notOk(document.getElementById("tile-cont-priority"), "Priority container is not rendered");
		assert.notOk(document.getElementById("generic-tile-actionButtons"), "Action Buttons Container is not rendered in Header Mode");

		//Switch to ContentMode
		this.oGenericTile.setMode(GenericTileMode.ContentMode);
		await nextUIUpdate();

		assert.notOk(document.getElementById("tile-cont-priority"), "Priority container is not rendered");
		assert.notOk(document.getElementById("generic-tile-actionButtons"), "Action Buttons Container is not rendered in Content Mode");

		//Switch to LineMode
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		await nextUIUpdate();

		assert.notOk(document.getElementById("tile-cont-priority"), "Priority container is not rendered");
		assert.notOk(document.getElementById("generic-tile-actionButtons"), "Action Buttons Container is not rendered in Line Mode");

		//Switch to ActionMode
		this.oGenericTile.setMode(GenericTileMode.ActionMode);
		await nextUIUpdate();

		assert.ok(document.getElementById("tile-cont-priority"), "Priority container is rendered");
		assert.ok(document.getElementById("generic-tile-actionButtons"), "Action Buttons Container is rendered in Action Mode");
	});

	QUnit.test("Value Color should not be applied to header text", async function(assert) {
		this.oGenericTile.setValueColor(ValueColor.Critical);
		await nextUIUpdate();
		var oHeader = document.querySelector(".sapMGTHdrTxt");
		assert.notOk(oHeader.classList.contains("sapMGTCriticalHdrTxt"),"The color has been removed from the text");
	});


	QUnit.module("Generic Tile in s4 Homes Tests", {
		beforeEach: async function() {
			this.oTask = new GenericTile("genericTile", {
				mode: GenericTileMode.ActionMode,
				subheader: "Expenses By Region",
				frameType: FrameType.TwoByOne,
				header: "Comparative Annual Totals",
				tileContent: new TileContent("tileCont", {
					unit: "EUR",
					priority: Priority.High,
					priorityText: "High",
					footer: "Current Quarter",
					content: new FormattedText("frmt-txt", {
						htmlText : "<p>Due Date: Apr 12, 2022 10:00:00 AM <br> Created By: Example Purchaser</p>"
					})
				})
			}).placeAt("qunit-fixture");
			this.oSituation = new GenericTile("generic-tile", {
				mode: GenericTileMode.ActionMode,
				subheader: "Expenses By Region",
				frameType: FrameType.TwoByOne,
				header: "Comparative Annual Totals",
				headerImage: "sap-icon://alert",
				tileContent: new TileContent("tile-cont", {
					unit: "EUR",
					footer: "Current Quarter",
					content: new Text("txt", {
						text : "This would be a situation long text description. it would have 3 lines of space,as a maximum."
					})
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTask.destroy();
			this.oTask = null;
			this.oSituation.destroy();
			this.oSituation = null;
		}
	});
	QUnit.test("Aria-Label Properties for Tiles", function(assert) {
		/**
		 * Arrange
		 * Getting focus on the Task Tile
		 */
		var tabDown = jQuery.Event("keydown");
		tabDown.keyCode = KeyCodes.TAB;
		this.oTask.$().trigger(tabDown);
		var tabUp = jQuery.Event("keyup");
		tabUp.keyCode = KeyCodes.TAB;
		this.oTask.$().trigger(tabUp);
		var oTask = this.oTask;
		//Act
		if (oTask && oTask.getDomRef() && oTask.getDomRef().getAttribute && oTask.getDomRef().getAttribute("aria-label")){
			assert.ok(oTask.getDomRef().getAttribute("aria-label"),"Aria-Label has been rendered Successfully");
		}
		/**
		 * Arrange
		 * Getting focus on the Situation Tile
		 */
		var tabDown = jQuery.Event("keydown");
		tabDown.keyCode = KeyCodes.TAB;
		this.oSituation.$().trigger(tabDown);
		var tabUp = jQuery.Event("keyup");
		tabUp.keyCode = KeyCodes.TAB;
		this.oSituation.$().trigger(tabUp);
		var oSituation = this.oSituation;
		//Act
		if (oSituation && oSituation.getDomRef() && oSituation.getDomRef().getAttribute && oSituation.getDomRef().getAttribute("aria-label")){
			assert.ok(oSituation.getDomRef().getAttribute("aria-label"),"Aria-Label has been rendered Successfully");
		}
	});
	QUnit.test("Max Lines property for situation card", function(assert) {
		//Act
		assert.equal(this.oSituation.getTileContent()[0].getContent().getMaxLines(),3,"Initially maxLines set correctly");
		//Arrange
		this.oSituation.getTileContent()[0].setPriorityText("medium");
		//Act
		assert.equal(this.oSituation.getTileContent()[0].getContent().getMaxLines(),3,"max lines has been set correct after setting priorityText property alone");
	});

	function setup() {
		this.DEFAULT_BG_COLOR = Parameters.get({
			name: "sapLegendColor9",
			callback: function (params) {
				this.DEFAULT_BG_COLOR = params;
			}
		});
	}

	QUnit.module("GenericTile IconMode", {
		before : function() {
			setup.call(this);
		},
		beforeEach: async function() {
			this.oGenericTile = new GenericTile({
				header: "GenericTile",
				subheader: "GenericTile subHeader",
				mode: "IconMode",
				appShortcut: "GenericTile Shortcutt",
				tileContent: [
					new TileContent({
						unit: "EUR",
						footer: "Current Quarter",
						content: new ImageContent({
									src: IMAGE_PATH + "headerImg1.png",
									description: "image descriptions ..."
								})
				})]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("OneByOne", async function(assert){
		var fnDone = assert.async();
		this.oGenericTile.setFrameType(FrameType.OneByOne);
		await nextUIUpdate();
		setTimeout(async function(){
			assert.equal(this.oGenericTile.getMode(), GenericTileMode.IconMode, "CurrentMode is " + GenericTileMode.IconMode);
			assert.equal(this.oGenericTile.getFrameType(), FrameType.OneByOne, "Current FrameType is " + FrameType.OneByOne);
			assert.equal(this.oGenericTile.getTileIcon(), undefined, "No Tile Icon.");
			assert.equal(this.oGenericTile._oBadgeColors["backgroundColor"],this.DEFAULT_BG_COLOR, "Default Background Color has been set");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTHdrContent").length, 1, "Header Created.");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTHdrTxt").length, 1, "Header Text Created.");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTSubHdrTxt").length, 1, "SubHeader Text is created.");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTContent").length, 1, "Content Created.");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMTileCntFtrTxt").length, 1, "Footer Text Created.");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTTInfoContainer").length, 1, "InfoContainer Created.");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTOneByOneIcon").length, 0, "No Icon Container Created.");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTOneByOne").length, 0, "No Text Container Created.");
			this.oGenericTile.setTileIcon("sap-icon://key");
			this.oGenericTile.setBackgroundColor("sapLegendColor1");
			await nextUIUpdate();
			setTimeout(async function(){
				assert.equal(this.oGenericTile.getMode(), GenericTileMode.IconMode, "CurrentMode is " + GenericTileMode.IconMode);
				assert.equal(this.oGenericTile.getFrameType(), FrameType.OneByOne, "Current FrameType is " + FrameType.OneByOne);
				assert.equal(this.oGenericTile.getTileIcon(), "sap-icon://key", "Tile Icon is present.");
				assert.equal(this.oGenericTile._oBadgeColors["backgroundColor"], "#c35500", "Tile Background Color is present");
				assert.ok(this.oGenericTile._oIcon.isA("sap.ui.core.Icon"), "Icon Created");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTHdrContent").length, 1, "Header Created.");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTHdrTxt").length, 1, "Header Text Created.");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTSubHdrTxt").length, 1, "SubHeader Text is created.");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTContent").length, 0, "No Content Created.");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMTileCntFtrTxt").length, 0, "No Footer Text Created.");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTTInfoContainer").length, 0, "No InfoContainer Created.");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTOneByOneIcon").length, 1, "Icon Container Created.");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTOneByOne").length, 1, "Text Container Created.");
				assert.ok(this.oGenericTile._oMoreIcon.isA("sap.m.Button"), "Button is created in place of action more icon");
				assert.ok(this.oGenericTile.getAggregation("_tileIcon"), "Icon Aggregation has a valid value");
				this.oGenericTile.setTileIcon(IMAGE_PATH + "female_BaySu.jpg");
				await nextUIUpdate();
				setTimeout(async function(){
					assert.equal(this.oGenericTile.getMode(), GenericTileMode.IconMode, "CurrentMode is " + GenericTileMode.IconMode);
					assert.equal(this.oGenericTile.getFrameType(), FrameType.OneByOne, "Current FrameType is " + FrameType.OneByOne);
					assert.equal(this.oGenericTile.getTileIcon(), IMAGE_PATH + "female_BaySu.jpg", "Tile Icon is present.");
					assert.equal(this.oGenericTile._oBadgeColors["backgroundColor"], "#c35500", "Tile Background Color is present");
					assert.ok(this.oGenericTile._oIcon.isA("sap.m.Image"), "Image Created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTHdrContent").length, 1, "Header Created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTHdrTxt").length, 1, "Header Text Created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTSubHdrTxt").length, 1, "SubHeader Text is created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTContent").length, 0, "No Content Created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMTileCntFtrTxt").length, 0, "No Footer Text Created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTTInfoContainer").length, 0, "No InfoContainer Created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTOneByOneIcon").length, 1, "Icon Container Created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTOneByOne").length, 1, "Text Container Created.");
					assert.ok(this.oGenericTile.getAggregation("_tileIconImage"), "Icon Image Aggregation has a valid value");
					this.oGenericTile.setState("Loading");
					await nextUIUpdate();
					setTimeout(async function(){
						var oDomRef = this.oGenericTile.getDomRef().children[0];
						assert.ok(oDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemOneByOne"), "Placeholder div is present when state is loading");
						this.oGenericTile.setState("Loaded");
						await nextUIUpdate();
						setTimeout(function(){
							assert.notOk(oDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemOneByOne"), "Placeholder div is not present when state is loaded");
							fnDone();
						}, 100);
					}.bind(this), 100);
				}.bind(this), 100);
			}.bind(this), 100);
		}.bind(this), 100);
	});

	QUnit.test("TwoByHalf", async function(assert){
		var fnDone = assert.async();
		this.oGenericTile.setFrameType(FrameType.TwoByHalf);
		await nextUIUpdate();
		setTimeout(async function(){
			assert.equal(this.oGenericTile.getMode(), GenericTileMode.IconMode, "CurrentMode is " + GenericTileMode.IconMode);
			assert.equal(this.oGenericTile.getFrameType(), FrameType.TwoByHalf, "Current FrameType is " + FrameType.TwoByHalf);
			assert.equal(this.oGenericTile.getTileIcon(), undefined, "No Tile Icon.");
			assert.equal(this.oGenericTile._oBadgeColors["backgroundColor"], this.DEFAULT_BG_COLOR, "Default Background Color has been set");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTHdrContent").length, 1, "Header Created.");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTHdrTxt").length, 1, "Header Text Created.");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTSubHdrTxt").length, 0, "SubHeader Text is created.");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTContent").length, 1, "Content Created.");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMTileCntFtrTxt").length, 0, "No Footer Text Created.");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTTInfoContainer").length, 0, "No InfoContainer Created.");
			assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTTwoByHalfIcon").length, 0, "No Icon Container Created.");
			assert.equal(this.oGenericTile._oMoreIcon.getType(), "Unstyled", "Button Created in Unstyled Type");
			this.oGenericTile.setTileIcon("sap-icon://key");
			this.oGenericTile.setBackgroundColor("sapLegendColor2");
			await nextUIUpdate();
			setTimeout(async function() {
				assert.equal(this.oGenericTile.getMode(), GenericTileMode.IconMode, "CurrentMode is " + GenericTileMode.IconMode);
				assert.equal(this.oGenericTile.getFrameType(), FrameType.TwoByHalf, "Current FrameType is " + FrameType.TwoByHalf);
				assert.equal(this.oGenericTile.getTileIcon(), "sap-icon://key", "Tile Icon is present.");
				assert.equal(this.oGenericTile._oBadgeColors["backgroundColor"], "#d23a0a", "Default background color is restored");
				assert.ok(this.oGenericTile._oIcon.isA("sap.ui.core.Icon"), "Icon Created");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTHdrContent").length, 1, "Header Created.");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTHdrTxt").length, 1, "Header Text Created.");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTSubHdrTxt").length, 0, "No SubHeader Text Created.");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTContent").length, 0, "No Content Created.");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMTileCntFtrTxt").length, 0, "No Footer Text Created.");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTTInfoContainer").length, 0, "No InfoContainer Created.");
				assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTTwoByHalfIcon").length, 1, "Icon Container Created.");
				assert.ok(this.oGenericTile._oMoreIcon.isA("sap.m.Button"), "Button is created in place of action more icon");
				assert.equal(this.oGenericTile._oMoreIcon.getType(), "Transparent", "Button Created in Transparent Type");
				assert.equal(this.oGenericTile._oMoreIcon.getTooltip_AsString(), this.oGenericTile._oRb.getText("GENERICTILE_MORE_ACTIONBUTTON_TEXT"), "More Action Button Tooltip is visible");
				this.oGenericTile.setTileIcon(IMAGE_PATH + "female_BaySu.jpg");
				await nextUIUpdate();
				setTimeout(async function(){
					assert.equal(this.oGenericTile.getMode(), GenericTileMode.IconMode, "CurrentMode is " + GenericTileMode.IconMode);
					assert.equal(this.oGenericTile.getFrameType(), FrameType.TwoByHalf, "Current FrameType is " + FrameType.TwoByHalf);
					assert.equal(this.oGenericTile.getTileIcon(), IMAGE_PATH + "female_BaySu.jpg", "Tile Icon is present.");
					assert.equal(this.oGenericTile._oBadgeColors["backgroundColor"], "#d23a0a", "Default background color is restored");
					assert.ok(this.oGenericTile._oIcon.isA("sap.m.Image"), "Image Created");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTHdrContent").length, 1, "Header Created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTHdrTxt").length, 1, "Header Text Created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTSubHdrTxt").length, 0, "No SubHeader Text Created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTContent").length, 0, "No Content Created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMTileCntFtrTxt").length, 0, "No SubHeader Text Created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTTInfoContainer").length, 0, "No InfoContainer Created.");
					assert.equal(this.oGenericTile.getDomRef().querySelectorAll(".sapMGTTwoByHalfIcon").length, 1, "Icon Container Created.");
					var sLink = "https://www.google.com/";
					this.oGenericTile.setUrl(sLink);
					this.oGenericTile.setScope(GenericTileScope.Actions);
					await nextUIUpdate();
					setTimeout(function(){
						assert.equal(this.oGenericTile.getDomRef().tagName, "A", "The GenericTile is rendered in anchor tag");
					}.bind(this),100);
					this.oGenericTile.setScope(GenericTileScope.Display);
					this.oGenericTile.setState("Loading");
					await nextUIUpdate();
					setTimeout(async function(){
						var oDomRef = this.oGenericTile.getDomRef().children[0];
						assert.ok(oDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemTwoByHalf"), "Placeholder div is present when state is loading");
						this.oGenericTile.setState("Loaded");
						await nextUIUpdate();
						setTimeout(function(){
							assert.notOk(oDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemTwoByHalf"), "Placeholder div is not present when state is loaded");
							fnDone();
						}, 100);
					}.bind(this), 100);
				}.bind(this), 100);
			}.bind(this), 100);
		}.bind(this), 100);
	});

	QUnit.module("Article Mode Tests", {
		beforeEach: async function() {
			this._navigateEventHandlerStub = sinon.stub(GenericTile.prototype, "_navigateEventHandler");
			this.oGenericTile = new GenericTile("generic-tile", {
				mode: GenericTileMode.ArticleMode,
				subheader: "Expenses By Region",
				frameType: FrameType.TwoByOne,
				header: "Comparative Annual Totals",
				url: "#",
				enableNavigationButton: true,
				headerImage: IMAGE_PATH + "female_BaySu.jpg",
				tileContent: new TileContent("tile-cont", {
					unit: "EUR",
					footer: "Current Quarter",
					content: new NumericContent("numeric-cnt", {
						state: LoadState.Loaded,
						scale: "M",
						indicator: DeviationIndicator.Up,
						truncateValueTo: 4,
						value: 20,
						nullifyValue: true,
						formatterValue: false,
						valueColor: ValueColor.Good,
						icon: "sap-icon://customer-financial-fact-sheet"
					})
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},

		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
			this._navigateEventHandlerStub.restore();
		},

		fnWithRenderAsserts: function(assert) {
			assert.ok(document.getElementById("generic-tile"), "Generic tile was rendered successfully");
			assert.ok(document.getElementById("generic-tile-hdr-text"), "Generic tile header was rendered successfully");
			assert.ok(document.getElementById("generic-tile-subHdr-text"), "Generic tile subheader was rendered successfully");
			assert.ok(document.getElementById("generic-tile-icon-image"), "Generic tile icon was rendered successfully");
			assert.ok(document.getElementById("tile-cont"), "TileContent was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt"), "NumericContent was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt-indicator"), "Indicator was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt-value"), "Value was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt-scale"), "Scale was rendered successfully");
			assert.ok(document.getElementById("numeric-cnt-icon-image"), "Icon was rendered successfully");
			assert.ok(this.oGenericTile.getDomRef().classList.contains("TwoByOne"), "TwoByOne FrameType class has been added");
		}
	});

	QUnit.test("Correct HTML Element is fetched", function(assert) {
        assert.ok(document.querySelector('[id="'  + this.oGenericTile.getId() + "-navigateActionContainer" + '"]'), "Html element is fetched");
    });

	QUnit.test("GenericTile rendered with Read More Button in Article Mode", function(assert) {
		this.fnWithRenderAsserts(assert);

		assert.ok(document.getElementById("generic-tile-navigateActionContainer"), "navigateAction Container is rendered");
		assert.ok(this.oGenericTile._getNavigateAction().getDomRef(), "Navigate Action Button is rendered");
	});

	QUnit.test("Press Event Tests for Navigate Action Button", function(assert) {
		var oButtonPressHandler = sinon.spy(),
			oTilePressHandler = sinon.spy();
		this.oGenericTile._getNavigateAction().attachPress(oButtonPressHandler);
		this.oGenericTile.attachPress(oTilePressHandler);

		//Trigger press for Navigate Action Button
		this.oGenericTile._getNavigateAction().firePress();
		assert.ok(oButtonPressHandler.calledOnce, "Button press handler called on Button Press");
		assert.ok(oButtonPressHandler.callCount === 1, "Button press handler called only once");
		assert.ok(this.oGenericTile._getNavigateAction().mEventRegistry.press.length === 2, "Two event handlers are present");
		assert.notOk(oTilePressHandler.calledOnce, "Generic Tile press handler is not called on Button Press");

		oButtonPressHandler = sinon.spy();

		//Trigger press for Generic Tile
		this.oGenericTile.firePress();
		assert.ok(oTilePressHandler.calledOnce, "Generic Tile press handler is called on Tile Press");
		assert.notOk(oButtonPressHandler.calledOnce, "Button press handler is not called on Tile Press");
	});

	QUnit.test("Update Action Button Text", async function(assert) {
		var sDefaultText = "Read More",
			sUpdatedText = "Read Article";

		assert.equal(this.oGenericTile._getNavigateAction().getText(), sDefaultText, "Default button text is shown");

		//update button text
		this.oGenericTile.setNavigationButtonText(sUpdatedText);
		await nextUIUpdate();
		assert.equal(this.oGenericTile._getNavigateAction().getText(), sUpdatedText, "Button text is updated");
	});

	QUnit.test("enableNavigationButton property changes", async function(assert) {
		assert.ok(document.getElementById("generic-tile-navigateActionContainer"), "navigateAction Container is rendered");
		assert.ok(this.oGenericTile._getNavigateAction().getDomRef(), "Navigate Action Button is rendered");

		// updated enableNavigationButton property
		this.oGenericTile.setEnableNavigationButton(false);
		await nextUIUpdate();
		assert.notOk(document.getElementById("generic-tile-navigateActionContainer"), "navigateAction Container is not rendered");
		assert.notOk(this.oGenericTile._getNavigateAction().getDomRef(), "Navigate Action Button is not rendered");
	});

	QUnit.test("Article Mode for Different Frame Types", async function(assert) {
		//Switch to OneByOne
		this.oGenericTile.setFrameType(FrameType.OneByOne);
		await nextUIUpdate();

		assert.ok(this.oGenericTile.getDomRef().classList.contains("OneByOne"), "OneByOne FrameType class has been added");
		assert.ok(document.getElementById("generic-tile-navigateActionContainer"), "navigateAction Container is rendered");

		//Switch to OneByHalf
		this.oGenericTile.setFrameType(FrameType.OneByHalf);
		await nextUIUpdate();

		assert.ok(this.oGenericTile.getDomRef().classList.contains("OneByHalf"), "OneByHalf FrameType class has been added");
		assert.notOk(document.getElementById("generic-tile-navigateActionContainer"), "navigateAction Container is not rendered");

		//Switch to TwoByHalf
		this.oGenericTile.setFrameType(FrameType.TwoByHalf);
		await nextUIUpdate();

		assert.ok(this.oGenericTile.getDomRef().classList.contains("TwoByHalf"), "TwoByHalf FrameType class has been added");
		assert.notOk(document.getElementById("generic-tile-navigateActionContainer"), "navigateAction Container is not rendered");

		//Switch to TwoByOne
		this.oGenericTile.setFrameType(FrameType.TwoByOne);
		await nextUIUpdate();

		assert.ok(this.oGenericTile.getDomRef().classList.contains("TwoByOne"), "TwoByOne FrameType class has been added");
		assert.ok(document.getElementById("generic-tile-navigateActionContainer"), "navigateAction Container is rendered");
	});

	QUnit.test("Generic Tile - Render footer div even if there are no footer elements", async function(assert) {
		this.oCustomTile = new GenericTile({
			subheader: "GenericTile SubHeader",
			frameType: "OneByOne",
			header: "GenericTile Header",
			headerImage: IMAGE_PATH + "female_BaySu.jpg",
			state: "Loaded",
			tileContent: new TileContent({
				content: new NumericContent({
					state: LoadState.Loaded,
					scale: "M",
					indicator: DeviationIndicator.Up,
					truncateValueTo: 4,
					value: 20,
					nullifyValue: true,
					formatterValue: false,
					valueColor: ValueColor.Good,
					icon: "sap-icon://customer-financial-fact-sheet"
				})
			})
		}).placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(document.querySelector("div[id*=footer]"), "Footer is rendered");
		this.oCustomTile.destroy();
	});

	QUnit.module("GenericTile with TileContent", {
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		},
		fnCreateGenericTile: async function(sGenericTileState, sTileContentState, sFrameType){
			this.oGenericTile = new GenericTile("generic-tile", {
				subheader: "GenericTile SubHeader",
				frameType: sFrameType,
				header: "GenericTile Header",
				headerImage: IMAGE_PATH + "female_BaySu.jpg",
				state: sGenericTileState,
				tileContent: new TileContent("tile-cont", {
					unit: "EUR",
					footer: "TileContent Footer",
					state: sTileContentState,
					content: new NumericContent("numeric-cnt", {
						state: LoadState.Loaded,
						scale: "M",
						indicator: DeviationIndicator.Up,
						truncateValueTo: 4,
						value: 20,
						nullifyValue: true,
						formatterValue: false,
						valueColor: ValueColor.Good,
						icon: "sap-icon://customer-financial-fact-sheet"
					})
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		fnWithRenderAsserts: function(assert, sGenericTileState, sTileContentState, sFrameType, oSpy) {
			assert.ok(document.getElementById("generic-tile"), "Generic tile was rendered successfully.");
			assert.ok(this.oGenericTile.getDomRef(), "Generic Tile is loaded on Dom");
			if (!(sFrameType === FrameType.TwoByHalf || sFrameType === FrameType.OneByHalf)) {
				assert.ok(this.oGenericTile.getTileContent()[0].getDomRef(), "TileContent is loaded on Dom.");
				assert.ok(document.getElementById("tile-cont"), "TileContent was rendered successfully.");
			}
			if (sTileContentState === LoadState.Loaded) {
				if (!(sFrameType === FrameType.TwoByHalf || sFrameType === FrameType.OneByHalf)) {
					assert.ok(document.getElementById("numeric-cnt"), "NumericContent was rendered successfully.");
					assert.ok(document.getElementById("numeric-cnt-indicator"), "Indicator was rendered successfully.");
					assert.ok(document.getElementById("numeric-cnt-value"), "Value was rendered successfully.");
					assert.ok(document.getElementById("numeric-cnt-scale"), "Scale was rendered successfully.");
					assert.ok(document.getElementById("numeric-cnt-icon-image"), "Icon was rendered successfully.");
				}
			} else if (sTileContentState === LoadState.Loading) {
				assert.ok(document.querySelector(".sapMTileCntContentShimmerPlaceholderWithDescription"), "Shimmer Description added successfully.");
				assert.ok(document.querySelector(".sapMTileCntContentShimmerPlaceholderRows"), "Shimmer RowContainer added successfully.");
				if (!(sFrameType === FrameType.TwoByHalf || sFrameType === FrameType.OneByHalf)) {
					assert.ok(document.querySelector(".sapMTileCntContentShimmerPlaceholderItemBox"), "Shimmer IemBox added successfully.");
				}
				assert.ok(document.querySelector(".sapMTileCntContentShimmerPlaceholderItemTextFooter"), "Shimmer Footer added successfully.");
			} else if (sTileContentState === LoadState.Disabled) {
				assert.ok(document.querySelector(".sapMTileCntDisabled"), "Tile disabled class added successfully.");
			} else {
				assert.ok(document.querySelector(".sapMTileCntFtrFld"), "Failed Container created.");
				assert.ok(document.querySelector(".sapMTileCntFtrFldIcn"), "Failed Icon created.");
				assert.ok(document.querySelector(".sapMTileCntFtrFldTxt"), "Failed Text feild created.");
			}

			if (sGenericTileState === LoadState.Loaded) {
				assert.ok(document.getElementById("generic-tile-hdr-text"), "Generic tile header was rendered successfully.");
				if (!(sFrameType === FrameType.TwoByHalf || sFrameType === FrameType.OneByHalf)) {
					assert.ok(document.getElementById("generic-tile-subHdr-text"), "Generic tile subheader was rendered successfully.");
				}
				assert.ok(document.getElementById("generic-tile-icon-image"), "Generic tile icon was rendered successfully.");
			} else if (sGenericTileState === LoadState.Failed) {
				assert.ok(document.querySelector(".sapMGenericTileFtrFld"), "Failed Container created.");
				assert.ok(document.querySelector(".sapMGenericTileFtrFldIcn"), "Failed Icon created.");
				assert.ok(document.querySelector(".sapMGenericTileFtrFldTxt"), "Failed Text feild created.");
			}
			assert.ok(this.oGenericTile.$().hasClass(sFrameType), "FrameType class has been added");
			if (sFrameType === FrameType.Stretch) {
				assert.ok(oSpy.notCalled, "_getSizeDescription method is not called.");
				oSpy.restore();
			}
		}
	});

	QUnit.test("GenericTile - Loaded/OneByOne , TileContent - Loaded", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Loaded, FrameType.OneByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/OneByOne , TileContent - Loading", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Loading, FrameType.OneByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/OneByOne , TileContent - Failed", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Failed, FrameType.OneByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/OneByOne , TileContent - Disabled", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Disabled, FrameType.OneByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loading/OneByOne", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loading, LoadState.Loaded, FrameType.OneByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Disabled/OneByOne", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Disabled, LoadState.Loaded, FrameType.OneByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Failed/OneByOne", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Failed, LoadState.Loaded, FrameType.OneByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/TwoByOne , TileContent - Loaded", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Loaded, FrameType.TwoByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/TwoByOne , TileContent - Loading", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Loading, FrameType.TwoByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/TwoByOne , TileContent - Failed", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Failed, FrameType.TwoByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/TwoByOne , TileContent - Disabled", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Disabled, FrameType.TwoByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loading/TwoByOne", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loading, LoadState.Loaded, FrameType.TwoByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Disabled/TwoByOne", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Disabled, LoadState.Loaded, FrameType.TwoByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Failed/TwoByOne", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Failed, LoadState.Loaded, FrameType.TwoByOne);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/Auto , TileContent - Loaded", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Loaded, FrameType.Auto);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/Auto , TileContent - Loading", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Loading, FrameType.Auto);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/Auto , TileContent - Failed", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Failed, FrameType.Auto);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/Auto , TileContent - Disabled", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Disabled, FrameType.Auto);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loading/Auto", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loading, LoadState.Loaded, FrameType.Auto);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Disabled/Auto", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Disabled, LoadState.Loaded, FrameType.Auto);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Failed/Auto", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Failed, LoadState.Loaded, FrameType.Auto);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/TwoByHalf , TileContent - Loaded", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Loaded, FrameType.TwoByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/TwoByHalf , TileContent - Loading", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Loading, FrameType.TwoByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/TwoByHalf , TileContent - Failed", async function(assert) {
		await this.fnCreateGenericTile(LoadState.FailLoadeded, LoadState.Failed, FrameType.TwoByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/TwoByHalf , TileContent - Disabled", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Disabled, FrameType.TwoByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loading/TwoByHalf", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loading, LoadState.Loaded, FrameType.TwoByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Disabled/TwoByHalf", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Disabled, LoadState.Loaded, FrameType.TwoByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Failed/TwoByHalf", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Failed, LoadState.Loaded, FrameType.TwoByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/OneByHalf , TileContent - Loaded", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Loaded, FrameType.OneByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/OneByHalf , TileContent - Loading", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Loading, FrameType.OneByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/OneByHalf , TileContent - Failed", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Failed, FrameType.OneByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/OneByHalf , TileContent - Disabled", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Disabled, FrameType.OneByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loading/OneByHalf", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loading, LoadState.Loaded, FrameType.TwoByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Disabled/OneByHalf", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Disabled, LoadState.Loaded, FrameType.OneByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Failed/OneByHalf", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Failed, LoadState.Loaded, FrameType.OneByHalf);
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType());
	});

	QUnit.test("GenericTile - Loaded/Stretch , TileContent - Loaded", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Loaded, FrameType.Stretch);
		var oSpy = this.spy(this.oGenericTile, "_getSizeDescription");
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType(), oSpy);
	});

	QUnit.test("GenericTile - Loaded/Stretch , TileContent - Loading", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Loading, FrameType.Stretch);
		var oSpy = this.spy(this.oGenericTile, "_getSizeDescription");
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType(), oSpy);
	});

	QUnit.test("GenericTile - Loaded/Stretch , TileContent - Failed", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Failed, FrameType.Stretch);
		var oSpy = this.spy(this.oGenericTile, "_getSizeDescription");
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType(), oSpy);
	});

	QUnit.test("GenericTile - Loaded/Stretch , TileContent - Disabled", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loaded, LoadState.Disabled, FrameType.Stretch);
		var oSpy = this.spy(this.oGenericTile, "_getSizeDescription");
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType(), oSpy);
	});

	QUnit.test("GenericTile - Loading/Stretch", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Loading, LoadState.Loaded, FrameType.Stretch);
		var oSpy = this.spy(this.oGenericTile, "_getSizeDescription");
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType(), oSpy);
	});

	QUnit.test("GenericTile - Disabled/Stretch", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Disabled, LoadState.Loaded, FrameType.Stretch);
		var oSpy = this.spy(this.oGenericTile, "_getSizeDescription");
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType(), oSpy);
	});

	QUnit.test("GenericTile - Failed/Stretch", async function(assert) {
		await this.fnCreateGenericTile(LoadState.Failed, LoadState.Loaded, FrameType.Stretch);
		var oSpy = this.spy(this.oGenericTile, "_getSizeDescription");
		this.fnWithRenderAsserts(assert,this.oGenericTile.getState(), this.oGenericTile.getTileContent()[0].getState(), this.oGenericTile.getFrameType(), oSpy);
	});

	QUnit.module("NewsContent Tests", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				mode: GenericTileMode.ArticleMode,
				subheader: "Expenses By Region",
				frameType: FrameType.TwoByOne,
				header: "Comparative Annual Totals",
				url: "#",
				enableNavigationButton: true,
				headerImage: IMAGE_PATH + "female_BaySu.jpg",
				tileContent: new TileContent("tile-cont", {
					unit: "EUR",
					footer: "Current Quarter",
					content: new NewsContent("numeric-cnt", {
						contentText: "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
						subheader: "August 21, 2013"
					})
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Checking if the  sapMGTNewsContent class has been applied", function (assert) {
		// Assert
		assert.ok(this.oGenericTile.getDomRef().classList.contains("sapMGTNewsContent"),"sapMGTNewsContent class is applied");
	});

	QUnit.module("Width Getting Increased when the Gap is 1rem only for TwoByOne and TwoByHalf tiles in the Grid container", {
		afterEach: function() {
			this.oGrid.destroy();
			this.oTile1.destroy();
			this.oTile2.destroy();
			this.oTile3.destroy();
			this.oGrid = null;
			this.oTile1 = null;
			this.oTile2 = null;
			this.oTile3 = null;
                },
		fnCreateGridContainer: async function(sGap){
			var oSettings = new GridContainerSettings({columns: 6, rowSize: "80px", columnSize: "80px", gap: sGap});

			this.oGrid = new GridContainer({
				layout: oSettings,
				items: [
					this.oTile1 = new GenericTile({
						header: "headerText 1",
						subheader: "subheaderText",
						frameType : FrameType.TwoByOne,
						state:"Loaded",
						layoutData: new GridContainerItemLayoutData({ columns: 2, rows: 2 })
					}),
					this.oTile2 = new GenericTile({
						header: "headerText 2",
						subheader: "subheaderText",
						frameType : FrameType.TwoByHalf,
						state:"Loaded",
						layoutData: new GridContainerItemLayoutData({ columns: 2, rows: 2 })
					}),
					this.oTile3 = new GenericTile({
						header: "headerText 2",
						subheader: "subheaderText",
						frameType : FrameType.OneByOne,
						state:"Loaded",
						layoutData: new GridContainerItemLayoutData({ columns: 2, rows: 2 })
					}),
					this.oTile4 = new GenericTile({
						header: "headerText 2",
						subheader: "subheaderText",
						frameType : FrameType.OneByHalf,
						state:"Loaded",
						layoutData: new GridContainerItemLayoutData({ columns: 2, rows: 2 })
					})
				]
			});

			this.oGrid.placeAt("qunit-fixture");
			await nextUIUpdate();
		}
	});

	QUnit.test("No border has been applied", async function(assert) {
		await this.fnCreateGridContainer("1rem");
		var aItems = this.oGrid.getItems();
		aItems[0].$().trigger("tap");
		assert.ok(aItems[0].$().css("border"), "No extra thick border line in focus");
	});

	QUnit.test("Checking if the width has been applied only for TwoByOne and TwoByHalf tiles when the gap is 1rem", async function (assert) {
		// Arrange
		await this.fnCreateGridContainer("1rem");
		var aItems = this.oGrid.getItems();

		// Assert
		assert.ok(aItems[0].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been applied successfully when the gap is 1rem");
		assert.ok(aItems[1].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been applied successfully when the gap is 1rem");
		assert.ok(aItems[2].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been applied successfully when the gap is 1rem");
		assert.ok(aItems[3].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been applied successfully when the gap is 1rem");


		//small tiles
		aItems[0].setSizeBehavior("Small");
		aItems[1].setSizeBehavior("Small");
		aItems[2].setSizeBehavior("Small");

		//Assert
		assert.ok(aItems[0].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been applied successfully when the gap is 1rem");
		assert.ok(aItems[1].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been applied successfully when the gap is 1rem");
		assert.ok(aItems[2].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been applied successfully when the gap is 1rem");
		assert.ok(aItems[3].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been applied successfully when the gap is 1rem");

	});

	QUnit.test("Checking if the Class has not been applied for the tiles when the gap is not 1rem", async function (assert) {
		// Arrange
		await this.fnCreateGridContainer("0.5rem");
		var aItems = this.oGrid.getItems();
		// Assert
		assert.notOk(aItems[0].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been not applied when the gap is 0.5rem");
		assert.notOk(aItems[1].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been not applied when the gap is 0.5rem");
		assert.notOk(aItems[2].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been not applied when the gap is 0.5rem");
		assert.notOk(aItems[3].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been not applied when the gap is 0.5rem");

		//small tiles
		aItems[0].setSizeBehavior("Small");
		aItems[1].setSizeBehavior("Small");
		aItems[2].setSizeBehavior("Small");

		//Assert
		assert.notOk(aItems[0].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been not applied when the gap is 0.5rem");
		assert.notOk(aItems[1].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been not applied when the gap is 0.5rem");
		assert.notOk(aItems[2].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been not applied when the gap is 0.5rem");
		assert.notOk(aItems[3].hasStyleClass("sapMGTGridContainerOneRemGap"),"Class has been not applied when the gap is 0.5rem");
	});

	QUnit.module("Button created in Place of action more icon", {
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		},
		fnCreateGenericTile: async function(sFrameType,sMode){
			this.oGenericTile = new GenericTile("generic-tile", {
				subheader: "GenericTile SubHeader",
				frameType: sFrameType,
				mode: sMode,
				header: "GenericTile Header",
				headerImage: IMAGE_PATH + "female_BaySu.jpg",
				tileContent: new TileContent("tile-cont", {
					unit: "EUR",
					footer: "TileContent Footer",
					content: new NumericContent("numeric-cnt", {
						state: LoadState.Loaded,
						scale: "M",
						indicator: DeviationIndicator.Up,
						truncateValueTo: 4,
						value: 20,
						nullifyValue: true,
						formatterValue: false,
						valueColor: ValueColor.Good,
						icon: "sap-icon://customer-financial-fact-sheet"
					})
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		}
	});

	QUnit.test("Checking if the Button created for OneByOne tile", async function (assert) {
		// Arrange
		await this.fnCreateGenericTile(FrameType.OneByOne,GenericTileMode.ContentMode);
		// Assert
		assert.ok(this.oGenericTile._oMoreIcon.isA("sap.m.Button"), "Button is created in place of action more icon");
	});

	QUnit.test("Checking if the Button created for TwoByOne tile", async function (assert) {
		// Arrange
		await this.fnCreateGenericTile(FrameType.TwoByOne,GenericTileMode.ContentMode);
		// Assert
		assert.ok(this.oGenericTile._oMoreIcon.isA("sap.m.Button"), "Button is created in place of action more icon");
	});

	QUnit.test("Checking if the Button created for TwoByHalf tile", async function (assert) {
		// Arrange
		await this.fnCreateGenericTile(FrameType.TwoByHalf,GenericTileMode.ContentMode);

		// Assert
		assert.ok(this.oGenericTile._oMoreIcon.isA("sap.m.Button"), "Button is created in place of action more icon");
	});

	QUnit.test("Checking if the Button created for OneByHalf tile", async function (assert) {
		// Arrange
		await this.fnCreateGenericTile(FrameType.OneByHalf,GenericTileMode.ContentMode);
		// Assert
		assert.ok(this.oGenericTile._oMoreIcon.isA("sap.m.Button"), "Button is created in place of action more icon");
	});
	QUnit.test("Checking if the Button created for linemode tile", async function (assert) {
		// Arrange
		await this.fnCreateGenericTile(FrameType.Auto,GenericTileMode.LineMode);
		// Assert
		assert.ok(this.oGenericTile._oMoreIcon.isA("sap.m.Button"), "Button is created in place of action more icon");
	});

	QUnit.module("GenericTile in IconMode to validate iconLoaded Property", {
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		},
		createTile: async function(sFrameType, sSizeBehavior, sSize) {
			this.oGenericTile = new GenericTile("generic-tile", {
				header: "GenericTile Header",
				frameType: sFrameType,
				size: sSize,
				mode: GenericTileMode.IconMode,
				sizeBehavior: sSizeBehavior,
				backgroundColor:"red",
				tileIcon: "sap-icon://home-share"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		}
	});

	QUnit.test("For FrameType = OneByOne and State = Loading", async function (assert) {
		// Arrange
		await this.createTile(FrameType.OneByOne, "Responsive", Size.Auto);
		// Assert
		assert.equal(this.oGenericTile.getIconLoaded(), true, "IconLoaded property = true");
		this.oGenericTile.setState(LoadState.Loading);
		await nextUIUpdate();
		//Act
		var oDomRef = this.oGenericTile.getDomRef().children[0];
		//Assert
		assert.ok(oDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemOneByOne"), "Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].classList.contains("sapMGTContentShimmerPlaceholderRowsOneByOne"), "Row Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].children[0].classList.contains("sapMGTContentShimmerPlaceholderIconOneByOne"), "Icon Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].children[1].classList.contains("sapMGTContentShimmerPlaceholderItemTextOneByOne"), "Text Placeholder div is present when state is loading");
	});

	QUnit.test("For IconLoaded = false, FrameType = OneByOne, State = Loading and TileIcon = ''", async function (assert) {
		//Arrange
		await this.createTile(FrameType.OneByOne, "Responsive", Size.Auto);
		this.oGenericTile.setState(LoadState.Loading);
		this.oGenericTile.setProperty("tileIcon", "", true);
		this.oGenericTile.setIconLoaded(false);
		await nextUIUpdate();
		//Act
		var oDomRef = this.oGenericTile.getDomRef().children[0];
		//Assert
		assert.equal(this.oGenericTile.getIconLoaded(), false, "IconLoaded property = false");
		assert.ok(oDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemOneByOne"), "Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].classList.contains("sapMGTContentShimmerPlaceholderRowsOneByOne"), "Row Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].children[0].classList.contains("sapMGTContentShimmerPlaceholderIconOneByOne"), "Icon Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].children[1].classList.contains("sapMGTContentShimmerPlaceholderItemTextOneByOne"), "Text Placeholder div is not present when state is loading");
	});

	QUnit.test("For IconLoaded = false, FrameType = OneByOne, State = Loaded and tileIcon = ''", async function (assert) {
		//Arrange
		await this.createTile(FrameType.OneByOne, "Responsive", Size.Auto);
		this.oGenericTile.setProperty("tileIcon", "", true);
		this.oGenericTile.setProperty("iconLoaded", false, false);
		this.oGenericTile.setState(LoadState.Loaded);
		await nextUIUpdate();
		//Act
		var oPlaceHolderDomRef = this.oGenericTile.getDomRef().children[0];
		var oContentDomRef = this.oGenericTile.getDomRef().children[1];
		//Assert
		assert.ok(oPlaceHolderDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemOneByOne"), "Placeholder div is present when state is loaded");
		assert.ok(oPlaceHolderDomRef.children[0].classList.contains("sapMGTContentShimmerPlaceholderRowsOneByOne"), "Row Placeholder div is present when state is loading");
		assert.ok(oPlaceHolderDomRef.children[0].children[0].classList.contains("sapMGTContentShimmerPlaceholderIconOneByOne"), "Icon Placeholder div is present when state is loading");
		assert.notOk(oPlaceHolderDomRef.children[0].children[1], "Text Placeholder div is not present when state is loading");
		assert.ok(oContentDomRef.children[0].classList.contains("sapMGTHdrTxt"), "Text div is present when state is loading");
	});

	QUnit.test("For IconLoaded = false, FrameType = OneByOne and State = Loaded", async function (assert) {
		//Arrange
		await this.createTile(FrameType.OneByOne, "Responsive", Size.Auto);
		this.oGenericTile.setProperty("tileIcon", "sap-icon://home-share", true);
		this.oGenericTile.setState(LoadState.Loaded);
		this.oGenericTile.setIconLoaded(true);
		await nextUIUpdate();
		//Act
		var oIconDomRef = document.querySelector(".sapMGTOneByOneIcon");
		var oContentDomRef = document.querySelector(".sapMGTHdrContent");
		//Assert
		assert.notOk(oIconDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemOneByOne"), "Placeholder div is not present when state is loaded");
		assert.ok(oIconDomRef.classList.contains("sapMGTOneByOneIcon"), "Icon div is present when state is loaded");
		assert.ok(oContentDomRef.children[0].classList.contains("sapMGTHdrTxt"), "Text div is present when state is loaded");
	});

	QUnit.test("For IconLoaded = false, FrameType = OneByOne, State = Loading and backgroundColor = ''", async function (assert) {
		//Arrange
		await this.createTile(FrameType.OneByOne, "Responsive", Size.Auto);
		this.oGenericTile.setProperty("backgroundColor", "", true);
		this.oGenericTile.setProperty("state", LoadState.Loading, true);
		this.oGenericTile.setIconLoaded(false);
		await nextUIUpdate();
		//Act
		var oDomRef = this.oGenericTile.getDomRef().children[0];
		//Assert
		assert.equal(this.oGenericTile.getIconLoaded(), false, "IconLoaded property = false");
		assert.ok(oDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemOneByOne"), "Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].classList.contains("sapMGTContentShimmerPlaceholderRowsOneByOne"), "Row Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].children[0].classList.contains("sapMGTContentShimmerPlaceholderIconOneByOne"), "Icon Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].children[1].classList.contains("sapMGTContentShimmerPlaceholderItemTextOneByOne"), "Text Placeholder div is present when state is loading");
	});

	QUnit.test("For IconLoaded = false, FrameType = OneByOne, State = Loaded and backgroundColor = ''", async function (assert) {
		//Arrange
		await this.createTile(FrameType.OneByOne, "Responsive", Size.Auto);
		this.oGenericTile.setProperty("backgroundColor", "", true);
		this.oGenericTile.setState(LoadState.Loaded);
		this.oGenericTile.setIconLoaded(false);
		await nextUIUpdate();
		//Act
		var oPlaceHolderDomRef = this.oGenericTile.getDomRef().children[0];
		var oContentDomRef = this.oGenericTile.getDomRef().children[1];
		//Assert
		assert.ok(oPlaceHolderDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemOneByOne"), "Placeholder div is not present when state is loaded");
		assert.ok(oPlaceHolderDomRef.children[0].classList.contains("sapMGTContentShimmerPlaceholderRowsOneByOne"), "Row Placeholder div is present when state is loaded");
		assert.ok(oPlaceHolderDomRef.children[0].children[0].classList.contains("sapMGTContentShimmerPlaceholderIconOneByOne"), "Icon Placeholder div is present when state is loaded");
		assert.notOk(oContentDomRef.children[0].children[1], "Text Placeholder div is not present when state is loaded");
		assert.ok(oContentDomRef.children[0].classList.contains("sapMGTHdrTxt"), "Text div is present when state is loaded");
	});

	QUnit.test("For IconLoaded = false, FrameType = OneByOne, State = Loaded and backgroundColor = ''", async function (assert) {
		//Arrange
		await this.createTile(FrameType.OneByOne, "Responsive", Size.Auto);
		this.oGenericTile.setProperty("backgroundColor", "red", true);
		this.oGenericTile.setState(LoadState.Loaded);
		this.oGenericTile.setIconLoaded(true);
		await nextUIUpdate();
		//Act
		var oIconDomRef = document.querySelector(".sapMGTOneByOneIcon");
		var oContentDomRef = document.querySelector(".sapMGTHdrContent");
		//Assert
		assert.notOk(oIconDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemOneByOne"), "Placeholder div is not present when state is loaded");
		assert.ok(oIconDomRef.classList.contains("sapMGTOneByOneIcon"), "Icon div is present when state is loaded");
		assert.ok(oContentDomRef.children[0].classList.contains("sapMGTHdrTxt"), "Text div is present when state is loaded");
	});

	QUnit.test("For FrameType = TwoByHalf and State = Loading", async function (assert) {
		// Arrange
		await this.createTile(FrameType.TwoByHalf, "Small");
		// Assert
		assert.equal(this.oGenericTile.getIconLoaded(), true, "IconLoaded property = true");
		this.oGenericTile.setState(LoadState.Loading);
		await nextUIUpdate();
		//Act
		var oDomRef = this.oGenericTile.getDomRef().children[0];
		//Assert
		assert.ok(oDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemTwoByHalf"), "Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].classList.contains("sapMGTContentShimmerPlaceholderRowsTwoByHalf"), "Row Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].children[0].classList.contains("sapMGTContentShimmerPlaceholderIconTwoByHalf"), "Icon Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].children[1].classList.contains("sapMGTContentShimmerPlaceholderItemTextTwoByHalf"), "Text Placeholder div is present when state is loading");
	});

	QUnit.test("For IconLoaded = false, FrameType = TwoByHalf, State = Loading and TileIcon = ''", async function (assert) {
		//Arrange
		await this.createTile(FrameType.TwoByHalf, "Small");
		this.oGenericTile.setState(LoadState.Loading);
		this.oGenericTile.setProperty("tileIcon", "", true);
		this.oGenericTile.setIconLoaded(false);
		await nextUIUpdate();
		//Act
		var oDomRef = this.oGenericTile.getDomRef().children[0];
		//Assert
		assert.equal(this.oGenericTile.getIconLoaded(), false, "IconLoaded property = false");
		assert.ok(oDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemTwoByHalf"), "Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].classList.contains("sapMGTContentShimmerPlaceholderRowsTwoByHalf"), "Row Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].children[0].classList.contains("sapMGTContentShimmerPlaceholderIconTwoByHalf"), "Icon Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].children[1].classList.contains("sapMGTContentShimmerPlaceholderItemTextTwoByHalf"), "Text Placeholder div is not present when state is loading");
	});

	QUnit.test("For IconLoaded = false, FrameType = TwoByHalf, State = Loaded and tileIcon = ''", async function (assert) {
		//Arrange
		await this.createTile(FrameType.TwoByHalf, "Small");
		this.oGenericTile.setProperty("tileIcon", "", true);
		this.oGenericTile.setProperty("iconLoaded", false, false);
		this.oGenericTile.setState(LoadState.Loaded);
		await nextUIUpdate();
		//Act
		var oPlaceHolderDomRef = this.oGenericTile.getDomRef().children[0];
		var oContentDomRef = this.oGenericTile.getDomRef().children[1];
		//Assert
		assert.ok(oPlaceHolderDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemTwoByHalf"), "Placeholder div is present when state is loaded");
		assert.ok(oPlaceHolderDomRef.children[0].classList.contains("sapMGTContentShimmerPlaceholderRowsTwoByHalf"), "Row Placeholder div is present when state is loading");
		assert.ok(oPlaceHolderDomRef.children[0].children[0].classList.contains("sapMGTContentShimmerPlaceholderIconTwoByHalf"), "Icon Placeholder div is present when state is loading");
		assert.notOk(oPlaceHolderDomRef.children[0].children[1], "Text Placeholder div is not present when state is loading");
		assert.ok(oContentDomRef.children[0].classList.contains("sapMGTHdrTxt"), "Text div is present when state is loading");
	});

	QUnit.test("For IconLoaded = false, FrameType = TwoByHalf and State = Loaded", async function (assert) {
		//Arrange
		await this.createTile(FrameType.TwoByHalf, "Small");
		this.oGenericTile.setProperty("tileIcon", "sap-icon://home-share", true);
		this.oGenericTile.setState(LoadState.Loaded);
		this.oGenericTile.setIconLoaded(true);
		await nextUIUpdate();
		//Act
		var oIconDomRef = this.oGenericTile.getDomRef().children[0];
		var oContentDomRef = this.oGenericTile.getDomRef().children[1];
		//Assert
		assert.notOk(oIconDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemTwoByHalf"), "Placeholder div is not present when state is loaded");
		assert.ok(oIconDomRef.classList.contains("sapMGTTwoByHalfIcon"), "Icon div is present when state is loaded");
		assert.ok(oContentDomRef.children[0].classList.contains("sapMGTHdrTxt"), "Text div is present when state is loaded");
	});

	QUnit.test("For IconLoaded = false, FrameType = TwoByHalf, State = Loading and backgroundColor = ''", async function (assert) {
		//Arrange
		await this.createTile(FrameType.TwoByHalf, "Small");
		this.oGenericTile.setProperty("backgroundColor", "", true);
		this.oGenericTile.setProperty("state", LoadState.Loading, true);
		this.oGenericTile.setIconLoaded(false);
		await nextUIUpdate();
		//Act
		var oDomRef = this.oGenericTile.getDomRef().children[0];
		//Assert
		assert.equal(this.oGenericTile.getIconLoaded(), false, "IconLoaded property = false");
		assert.ok(oDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemTwoByHalf"), "Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].classList.contains("sapMGTContentShimmerPlaceholderRowsTwoByHalf"), "Row Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].children[0].classList.contains("sapMGTContentShimmerPlaceholderIconTwoByHalf"), "Icon Placeholder div is present when state is loading");
		assert.ok(oDomRef.children[0].children[1].classList.contains("sapMGTContentShimmerPlaceholderItemTextTwoByHalf"), "Text Placeholder div is present when state is loading");
	});

	QUnit.test("For IconLoaded = false, FrameType = TwoByHalf, State = Loaded and backgroundColor = ''", async function (assert) {
		//Arrange
		await this.createTile(FrameType.TwoByHalf, "Small");
		this.oGenericTile.setProperty("backgroundColor", "", true);
		this.oGenericTile.setState(LoadState.Loaded);
		this.oGenericTile.setIconLoaded(false);
		await nextUIUpdate();
		//Act
		var oPlaceHolderDomRef = this.oGenericTile.getDomRef().children[0];
		var oContentDomRef = this.oGenericTile.getDomRef().children[1];
		//Assert
		assert.ok(oPlaceHolderDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemTwoByHalf"), "Placeholder div is not present when state is loaded");
		assert.ok(oPlaceHolderDomRef.children[0].classList.contains("sapMGTContentShimmerPlaceholderRowsTwoByHalf"), "Row Placeholder div is present when state is loaded");
		assert.ok(oPlaceHolderDomRef.children[0].children[0].classList.contains("sapMGTContentShimmerPlaceholderIconTwoByHalf"), "Icon Placeholder div is present when state is loaded");
		assert.notOk(oContentDomRef.children[0].children[1], "Text Placeholder div is not present when state is loaded");
		assert.ok(oContentDomRef.children[0].classList.contains("sapMGTHdrTxt"), "Text div is present when state is loaded");
	});

	QUnit.test("For IconLoaded = false, FrameType = TwoByHalf, State = Loaded and backgroundColor = ''", async function (assert) {
		//Arrange
		await this.createTile(FrameType.TwoByHalf, "Small");
		this.oGenericTile.setProperty("backgroundColor", "red", true);
		this.oGenericTile.setState(LoadState.Loaded);
		this.oGenericTile.setIconLoaded(true);
		await nextUIUpdate();
		//Act
		var oIconDomRef = this.oGenericTile.getDomRef().children[0];
		var oContentDomRef = this.oGenericTile.getDomRef().children[1];
		//Assert
		assert.notOk(oIconDomRef.classList.contains("sapMGTContentShimmerPlaceholderItemTwoByHalf"), "Placeholder div is not present when state is loaded");
		assert.ok(oIconDomRef.classList.contains("sapMGTTwoByHalfIcon"), "Icon div is present when state is loaded");
		assert.ok(oContentDomRef.children[0].classList.contains("sapMGTHdrTxt"), "Text div is present when state is loaded");
	});

	QUnit.module("sap.m.GenericTileMode.LineMode Test a Link", {
		beforeEach: async function() {
			this.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				header: "headerText",
				subheader: "subheaderText",
				mode: GenericTileMode.LineMode,
				url: "Test url"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Test a Link", function(assert) {
		var sLineModeDescription = this.oGenericTile._oRb.getText("GENERIC_TILE_LINK");
		assert.equal(this.oGenericTile.$().attr("draggable"),undefined, "a Links are draggale by default hence draggable attr should not be set manually ");
		assert.ok(this.oGenericTile.getDomRef().getAttribute("aria-label").includes(sLineModeDescription),"Size description rendered successfully");
	});

	QUnit.module("sap.m.GenericTileMode.LineMode Test a button", {
		beforeEach: async function() {
			this.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				header: "headerText",
				subheader: "subheaderText",
				mode: GenericTileMode.LineMode,
				press: "press"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Test a button", function(assert) {
		var sLineModeDescription = this.oGenericTile._oRb.getText("GENERIC_TILE_LINK");
		assert.ok(this.oGenericTile.getDomRef().getAttribute("aria-label").includes(sLineModeDescription),"Size description rendered successfully");
	});
	QUnit.module("Loading State Tests", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile({
				state: LoadState.Loading,
				header: "headerText",
				subheader: "subheaderText",
				url: "Test url",
				sizeBehavior: "Small",
				tileContent: new TileContent("tile-cont", {
					unit: "EUR",
					footer: "Current Quarter"
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});
	QUnit.test("GenericTile in OneByOne FrameType", function(assert) {
		//Assert
		assert.equal(getComputedStyle(document.querySelector(".sapMGTContentShimmerPlaceholderItemHeader")).width,"116px","Header Shimmer Width Set Correctly");
		assert.equal(getComputedStyle(document.querySelector(".sapMGTContentShimmerPlaceholderItemText")).width,"94px","Sub Header Shimmer Width Set Correctly");
		assert.equal(getComputedStyle(document.querySelector(".sapMTileCntContentShimmerPlaceholderItemTextFooter")).width,"94px","Footer Shimmer Width Set Correctly");
	});

	QUnit.module("Tests for renderOnThemeChange property", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile({
				state: LoadState.Loading,
				renderOnThemeChange: true,
				header: "headerText",
				subheader: "subheaderText",
				url: "Test url",
				sizeBehavior: "Small",
				tileContent: new TileContent("tile-cont", {
					unit: "EUR",
					footer: "Current Quarter"
				})
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
			this.sStartTheme = Theming.getTheme();
			this.sRequiredTheme = null;

			var fnAttachApplied = (oEvent) => {
				Theming.detachApplied(fnAttachApplied);
				if (Theming.getTheme() === this.sRequiredTheme) {
					if (typeof this.fnCallback === "function") {
						this.fnCallback.bind(this)();
						this.fnCallback = undefined;
					}
				}
			};

			this.applyTheme = function(sTheme, fnCallback) {
				this.fnCallback = fnCallback;
				this.sRequiredTheme = sTheme;
				if (Theming.getTheme() === this.sRequiredTheme) {
					if (typeof fnCallback === "function") {
						fnCallback.bind(this)();
						fnCallback = undefined;
					}
				} else {
					Theming.setTheme(sTheme);
					Theming.attachApplied(fnAttachApplied.bind(this));
				}
			};
		},
		afterEach: function(assert) {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
			var done = assert.async();
			this.applyTheme(this.sStartTheme, done);
		}
	});

	QUnit.test("Test if the tile has rendered again on theme change", function(assert){
		var done = assert.async();
		this.oSpy = this.spy(this.oGenericTile, "invalidate");
		this.applyTheme("sap_horizon_dark", function() {
			assert.ok(this.oSpy.calledOnce, "The Tile has been Rendered upon theme change");
			done();
		});
	});

	QUnit.test("Test if the tile has not rendered again on theme change", async function(assert){
		var done = assert.async();
		this.oGenericTile.setRenderOnThemeChange(false);
		await nextUIUpdate();
		this.oSpy = this.spy(this.oGenericTile, "invalidate");
		this.applyTheme("sap_horizon_dark", function() {
			assert.notOk(this.oSpy.callCount, "The Tile has not been Rendered upon theme change");
			done();
		});
	});

	QUnit.module("Test if the dragging and dropping is working on anchor tagged rendered tiles", {
		beforeEach: async function() {
			this.oGrid1 = new GridContainer({
				layout: new GridContainerSettings({columns: 2, rowSize: "80px", columnSize: "80px", gap: "16px"}),
				items: [
					new GenericTile({
						header: "GenericTile",
						subheader: "GenericTile subHeader",
						mode: "IconMode",
						tileIcon: "sap-icon://key",
						frameType: "TwoByHalf",
						url: "www.google.com",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 2",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 3",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 4",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					})
				],
				dragDropConfig: [
					new DragInfo({
						sourceAggregation: "items"
					})
				]
			});
			this.oGrid1.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGrid1.destroy();
		}
	});

	QUnit.test("Test if the tile is dragabble when it is an anchor tag", function (assert) {
		// Arrange
		this.oGrid1.addDragDropConfig(new GridDropInfo({
			targetAggregation: "items",
			dropPosition: "Between",
			dropLayout: "Horizontal"
		}));

		//Act
		assert.equal(this.oGrid1.getItems()[0].getDomRef().getAttribute("draggable"),"true","Tile is draggable");
	});

	QUnit.module("Test if the pressEnabled property is working on the IconMode tiles in action scope", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile({
				header: "GenericTile",
				subheader: "GenericTile subHeader",
				mode: "IconMode",
				tileIcon: "sap-icon://table-view",
				backgroundColor: "red",
				frameType: "TwoByHalf",
				pressEnabled : false,
				scope : "ActionMore"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
		}
	});

	QUnit.test("Test if the press event is getting fired on the tile by pressing spacebar or enter keys", function (assert) {
		//Arrange
		var bEventNotTriggered = true;
		this.oGenericTile.attachEvent("press", function() {
			bEventNotTriggered = false;
		});
		//Act
		qutils.triggerKeyup(this.oGenericTile.getDomRef(),KeyCodes.SPACE);
		//Assert
		assert.ok(bEventNotTriggered, "Press event of GenericTile is not getting triggered");
		//Act
		qutils.triggerKeyup(this.oGenericTile.getDomRef(),KeyCodes.ENTER);
		//Assert
		assert.ok(bEventNotTriggered, "Press event of GenericTile is not getting triggered");
	});

	QUnit.test("Test if the ActionMore button is getting fired by spacebar or enter keys", function (assert) {
		//Arrange
		var bEventNotTriggered = true;
		this.oGenericTile.attachEvent("press", function() {
			bEventNotTriggered = false;
		});
		var bForward = true;

		//Act
		qutils.triggerKeydown(this.oGenericTile.getDomRef(), KeyCodes.TAB);
		var $Tabbables = findTabbables(document.activeElement, [document.getElementById("qunit-fixture")], bForward);
		if ($Tabbables.length) {
			$Tabbables.get(!bForward ? $Tabbables.length - 1 : 0).focus();
		}
		qutils.triggerKeyup(this.oGenericTile._oMoreIcon.getDomRef(),KeyCodes.ENTER);

		//Assert
		assert.notOk(bEventNotTriggered, "Press event of GenericTile is getting triggered");
		//Act
		qutils.triggerKeyup(this.oGenericTile._oMoreIcon.getDomRef(),KeyCodes.SPACE);
		//Assert
		assert.notOk(bEventNotTriggered, "Press event of GenericTile is getting triggered");
	});

	QUnit.test("Test if the ActionMore button is getting fired by mouse", function (assert) {
		var bEventNotTriggered = true;
		this.oGenericTile.attachEvent("press", function() {
			bEventNotTriggered = false;
		});
		var bForward = true;

		//Act
		qutils.triggerKeydown(this.oGenericTile.getDomRef(), KeyCodes.TAB);
		var $Tabbables = findTabbables(document.activeElement, [document.getElementById("qunit-fixture")], bForward);
		if ($Tabbables.length) {
			$Tabbables.get(!bForward ? $Tabbables.length - 1 : 0).focus();
		}
		qutils.triggerKeyup(this.oGenericTile.getDomRef(), KeyCodes.TAB);
		qutils.triggerEvent("tap",this.oGenericTile._oMoreIcon.getDomRef());

		//Assert
		assert.notOk(bEventNotTriggered, "Press event of GenericTile is getting triggered");
	});

	QUnit.module("Resize handler on IconMode tiles", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile({
				header: "GenericTile",
				subheader: "GenericTile subHeader",
				mode: "IconMode",
				tileIcon: "sap-icon://table-view",
				backgroundColor: "red",
				frameType: "OneByOne"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
		}
	});

	QUnit.test("Test if the resize handler is getting activated on width change", function (assert) {
		//Arrange
		this.oSpy = this.spy(this.oGenericTile, "_handleResizeOnIconTile");
		var done = assert.async();

		//Act
		this.oGenericTile.getDomRef().style.width = "128px";

		//Assert
		handleResize(this.oSpy,function() {
			assert.ok(this.oSpy.calledOnce, "The resize handler has been called on the change of the dimension");
			done();
		}.bind(this));
	});

	QUnit.module("Tab navigating inside the IconMode tiles", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("tile",{
				header: "GenericTile",
				subheader: "GenericTile subHeader",
				mode: "IconMode",
				tileIcon: "sap-icon://table-view",
				backgroundColor: "red",
				frameType: "TwoByHalf",
				scope: "ActionMore"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
		}
	});

	QUnit.test("Checking the visibility of ActionMore button", function (assert) {
		//Getting focus on the tile
		var bForward = true;
		qutils.triggerKeydown(this.oGenericTile.getDomRef(), KeyCodes.TAB);
		var $Tabbables = findTabbables(document.activeElement, [document.getElementById("qunit-fixture")], bForward);
		if ($Tabbables.length) {
			$Tabbables.get(!bForward ? $Tabbables.length - 1 : 0).focus();
		}
		assert.equal(document.activeElement,this.oGenericTile.getDomRef(),"Focus is on the ActionMore button");

		//Getting focus on the ActionMore button
		qutils.triggerKeydown(this.oGenericTile.getDomRef(), KeyCodes.TAB);
		$Tabbables = findTabbables(document.activeElement, [document.getElementById("qunit-fixture")], bForward);
		if ($Tabbables.length) {
			$Tabbables.get(!bForward ? $Tabbables.length - 1 : 0).focus();
		}
		assert.equal(document.activeElement,this.oGenericTile._oMoreIcon.getDomRef(),"Focus is on the ActionMore button");
		assert.ok(this.oGenericTile.$("action-more").hasClass("sapMGTVisible"),"The Action More button is visible");

		//Shift tabbing back to tile level
		bForward = false;
		qutils.triggerKeyEvent("keydown",this.oGenericTile._oMoreIcon.getDomRef(),KeyCodes.TAB,true);
		$Tabbables = findTabbables(document.activeElement, [document.getElementById("qunit-fixture")], bForward);
		if ($Tabbables.length) {
			$Tabbables.get(!bForward ? $Tabbables.length - 1 : 0).focus();
		}
		assert.equal(document.activeElement,this.oGenericTile.getDomRef(),"Focus is on the GenericTile");
		assert.notOk(this.oGenericTile.$("action-more").hasClass("sapMGTVisible"),"The Action More button should not be visible");
	});

	QUnit.test("Adding aria-label to the more button",function(assert){
		var sText = this.oGenericTile._oMoreIcon.getDomRef().getAttribute("aria-label");
		assert.equal(sText,this.oGenericTile.getHeader() + " " + this.oGenericTile.getSubheader() + " " + this.oGenericTile._oRb.getText("GENERICTILE_MORE_ACTIONBUTTON_TEXT"),"Aria label has been set as expected for the more button");
	});

	QUnit.module("Keyboard mouse and focus handling", {
		beforeEach: function () {

			// Arrange
			var oSettings = new GridContainerSettings({columns: 2, rowSize: "80px", columnSize: "80px", gap: "16px"});

			this.oScrollContainer = new ScrollContainer({
				height: "200px",
				content: this.oGrid = new GridContainer({
					layout: oSettings,
					items: [
						new GenericTile({
							header: "GenericTile",
							subheader: "GenericTile subHeader",
							mode: "IconMode",
							tileIcon: "sap-icon://table-view",
							backgroundColor: "sapLegendColor1",
							frameType: "TwoByHalf",
							scope: "ActionMore"
						}),
						new GenericTile({
							header: "GenericTile",
							subheader: "GenericTile subHeader",
							mode: "IconMode",
							tileIcon: "sap-icon://table-view",
							backgroundColor: "sapLegendColor1",
							frameType: "TwoByHalf",
							scope: "ActionMore"
						}),
						new GenericTile({
							header: "GenericTile",
							subheader: "GenericTile subHeader",
							mode: "IconMode",
							tileIcon: "sap-icon://table-view",
							backgroundColor: "sapLegendColor1",
							frameType: "TwoByHalf",
							scope: "ActionMore"
						}),
						new GenericTile({
							header: "GenericTile",
							subheader: "GenericTile subHeader",
							mode: "IconMode",
							tileIcon: "sap-icon://table-view",
							backgroundColor: "sapLegendColor1",
							frameType: "TwoByHalf",
							scope: "ActionMore"
						})
					]
				})
			});

			this.oScrollContainer.placeAt("qunit-fixture");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oScrollContainer.destroy();
			this.oScrollContainer = null;
		}
	});

	QUnit.test("Right Arrow navigation through grid container", function (assert) {
		// Arrange
		var oItemWrapper1 = this.oGrid.getDomRef("listUl").children[0],
			bForward = true,
			oMoreButton = this.oGrid.getItems()[0]._oMoreIcon;
		//Act
		oItemWrapper1.focus();
		qutils.triggerKeydown(oItemWrapper1, KeyCodes.TAB);
		var $Tabbables = findTabbables(document.activeElement, [document.getElementById("qunit-fixture")], bForward);
		if ($Tabbables.length) {
			$Tabbables.get(!bForward ? $Tabbables.length - 1 : 0).focus();
		}
		//Assert
		assert.ok(oMoreButton.hasStyleClass("sapMGTVisible"),"The Action More button is visible");
	});

	QUnit.module("Getting focus on IconMode tiles", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("tile",{
				header: "GenericTile",
				subheader: "GenericTile subHeader",
				mode: "IconMode",
				tileIcon: "sap-icon://table-view",
				backgroundColor: "sapLegendColor1",
				frameType: "OneByOne"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
		}
	});

	QUnit.test("Getting the Focus on the tile", function (assert) {
		//Simulating focus on the tile
		simulateCssEvent(":focus");
		assert.equal(getComputedStyle(document.querySelector(".sapMGTFocusDiv")).outlineOffset,"2px","The width of the inner focus has been set successfully");
		//Removing the focus on the tile
		simulateCssEvent("stop");
	});

	QUnit.module("Testing the ondragend event on the iconMode tiles", {
		beforeEach: async function() {
			this.oGenericTile = new GenericTile("tile",{
				header: "GenericTile",
				subheader: "GenericTile subHeader",
				mode: "IconMode",
				tileIcon: "sap-icon://table-view",
				backgroundColor: "sapLegendColor1",
				frameType: FrameType.TwoByHalf
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
		}
	});

	QUnit.test("Simulating a drag and drop scenario", function (assert) {
		this.oGenericTile.addStyleClass("sapMGTPressActive");
		//Style class for Generic Tile when it is dragged.
		assert.ok(this.oGenericTile.hasStyleClass("sapMGTPressActive"), "Generic tile contains Press Active Style Class");
		this.oGenericTile.ondragend();
		//Style Classes for Generic Tile should be removed once Drag is completed.
		assert.notOk(this.oGenericTile.hasStyleClass("sapMGTPressActive"), "Press state from Generic Tile is removed.");
	});
	// Checks whether the given DomRef is contained or equals (in) one of the given container
	function isContained(aContainers, oRef) {
		for (var i = 0; i < aContainers.length; i++) {
			if (aContainers[i] === oRef || aContainers[i] !== oRef && aContainers[i].contains(oRef)) {
				return true;
			}
		}
		return false;
	}
	// Returns a jQuery object which contains all next/previous (bNext) tabbable DOM elements of the given starting point (oRef) within the given scopes (DOMRefs)
	function findTabbables(oRef, aScopes, bNext) {
		var $Ref = jQuery(oRef),
			$All, $Tabbables;

		if (bNext) {
			$All = jQuery.merge($Ref.find("*"), jQuery.merge($Ref.nextAll(), $Ref.parents().nextAll()));
			// jQuery custom selectors ":sapTabbable"
			$Tabbables = $All.find(':sapTabbable').addBack(':sapTabbable');
		} else {
			$All = jQuery.merge($Ref.prevAll(), $Ref.parents().prevAll());
			// jQuery custom selectors ":sapTabbable"
			$Tabbables = jQuery.merge($Ref.parents(':sapTabbable'), $All.find(':sapTabbable').addBack(':sapTabbable'));
		}

		$Tabbables = jQuery.uniqueSort($Tabbables);
		return $Tabbables.filter(function() {
			return isContained(aScopes, this);
		});
	}
	// Checks whether the attached resizeHandler is called when the dimensions are changed
	function handleResize(oSpy, fnCallback) {
		if (oSpy.calledOnce) {
			if (typeof fnCallback === "function") {
				fnCallback.bind(this)();
				fnCallback = undefined;
			}
		} else {
			setTimeout(function(){
				handleResize(oSpy,fnCallback);
			},200);
		}
	}

	// Simulates any CSS event like hover,focus.....etc
	function simulateCssEvent(type){
		var id = 'simulatedStyle';
		var generateEvent = function(selector){
			var style = "";
			for (var i in document.styleSheets) {
				var rules = document.styleSheets[i].cssRules;
				for (var r in rules) {
					if (rules[r].cssText && rules[r].selectorText){
						if (rules[r].selectorText.indexOf(selector) > -1){
							var regex = new RegExp(selector,"g");
							var text = rules[r].cssText.replace(regex,"");
							style += text + "\n";
						}
					}
				}
			}
			document.querySelector("head").insertAdjacentHTML("beforeend","<style id=" + id + ">" + style + "</style>");
		};
		var stopEvent = function(){
			document.querySelector("#" + id).remove();
		};
		if (type === "stop") {
			return stopEvent();
		} else {
			return generateEvent(type);
		}
	}

	QUnit.module("Generic Tile: 'tileBadge' property tests", {
		beforeEach: async function () {
			this.oGenericTile = new GenericTile({
				id: "badge-tile",
				header: "Test Header",
				subheader: "Test Subheader",
				mode: "IconMode",
				frameType: "TwoByHalf",
				backgroundColor: "black",
				tileIcon: "sap-icon://folder-full",
				tileBadge: "99"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Should Only be visible in IconMode and for TwoByHalf frameType", async function (assert) {
		assert.ok(document.getElementById("badge-tile-tileBadge"), "tile badge rendered initially");

		//Switch Mode
		this.oGenericTile.setMode("ContentMode");
		await nextUIUpdate();
		assert.notOk(document.getElementById("badge-tile-tileBadge"), "tile badge not rendered for other mode");

		//Switch Frame Type
		this.oGenericTile.setFrameType(FrameType.OneByOne);
		await nextUIUpdate();
		assert.notOk(document.getElementById("badge-tile-tileBadge"), "tile badge not rendered for other frame type");

		//Switch back to original state
		this.oGenericTile.setMode("IconMode");
		this.oGenericTile.setFrameType(FrameType.TwoByHalf);
		this.oGenericTile.setTileIcon("sap-icon://folder-full");
		await nextUIUpdate();
		assert.ok(document.getElementById("badge-tile-tileBadge"), "tile badge rendered again");

		//Switch to invalid icon
		this.oGenericTile.setTileIcon();
		await nextUIUpdate();
		assert.ok(document.getElementById("badge-tile-tileBadge"), "tile badge rendered even if invalid icon");
	});

	QUnit.test("Should only display 2 characters", async function (assert) {
		var sTestBadge = "1135";
		assert.ok(document.getElementById("badge-tile-tileBadge"), "tile badge rendered initially");

		//Change tile badge
		this.oGenericTile.setTileBadge(sTestBadge);
		await nextUIUpdate();
		assert.equal(document.getElementById("badge-tile-tileBadge").innerText, sTestBadge.substring(0, 3), "only first 2 characters of the badge value are displayed");
	});

	QUnit.module("Generic Tile: 'dropAreaOffset' property tests", {
		beforeEach: async function () {
			this.oGenericTile = new GenericTile({
				id: "drop-tile",
				header: "Test Header",
				subheader: "Test Subheader",
				mode: "IconMode",
				frameType: "OneByOne",
				backgroundColor: "black",
				tileIcon: "sap-icon://folder-full",
				dropAreaOffset: 0
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("should verify that drop area bounding rectangle is influenced on change of dropAreaOffset", async function (assert) {
		assert.ok(document.getElementById("drop-tile"), "tile rendered initially");

		var OFFSET = 100,
			oBoundingRect = this.oGenericTile.getDropAreaRect();

		//Update dropAreaOffset
		this.oGenericTile.setDropAreaOffset(OFFSET);
		await nextUIUpdate();

		//Horizontal Layout
		var oBoundingRectHorizontal = this.oGenericTile.getDropAreaRect("Horizontal");
		assert.equal(Math.abs(oBoundingRect.left - oBoundingRectHorizontal.left), OFFSET, "left updated");
		assert.equal(Math.abs(oBoundingRectHorizontal.right - oBoundingRect.right), OFFSET, "right updated");

		//Vertical Layout
		var oBoundingRectVertical = this.oGenericTile.getDropAreaRect("Vertical");
		assert.equal(Math.abs(oBoundingRect.top - oBoundingRectVertical.top), OFFSET, "top updated");
		assert.equal(Math.abs(oBoundingRectVertical.bottom - oBoundingRect.bottom), OFFSET, "bottom updated");
	});
	QUnit.module("GenericTile when linkTileContent is used", {
		beforeEach: async function () {
			this.oGenericTile = new GenericTile({
				id: "linkTile",
				header: "Test Header",
				subheader: "Test Subheader",
				frameType: FrameType.TwoByOne,
				linkTileContents:[
					new LinkTileContent({iconSrc:"sap-icon://action-settings",linkText:"SAP"})
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
			this.isRepeatedTwice = function(sInputString, sWord) {
				var sLowerInputString = sInputString.toLowerCase();
				var sLowerWord = sWord.toLowerCase();

				// Create a regular expression to match the word surrounded by word boundaries (\b)
				var rRegularExprForWord = new RegExp(`\\b${sLowerWord}\\b`, 'g');

				// Use the match method to find all occurrences of the word in the lowercased string
				var aMatches = sLowerInputString.match(rRegularExprForWord);

				// Check if the word is repeated twice by comparing the number of matches to 2
				return aMatches.length === 1;
			};
		},
		afterEach: function () {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Announcement of text tile should only be done once", function (assert) {
		assert.ok(this.isRepeatedTwice(this.oGenericTile.getDomRef().getAttribute("aria-label"),"tile"),"The word tile has been announced only once");
	});

	QUnit.module("GenericTile when badge is used", {
		beforeEach: async function () {
			this.oGenericTile = new GenericTile({
				header: "Test Header",
				subheader: "Test Subheader",
				frameType: FrameType.TwoByOne,
				badge:[
					new Badge({src:"sap-icon://ai",text:"SAP",textColor: TileInfoColor.NeutralElementColor,backgroundColor: TileInfoColor.NeutralBackgroundColor, borderColor: TileInfoColor.NeutralBorderColor})
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Check whether the badge is rendered", function (assert) {
		assert.ok(document.querySelector(".sapMGTBadge"),"Badge has been rendered");
	});

	QUnit.test("Check whether the Neutral colors has been set as enum", function (assert) {
		var fnDone = assert.async();
		var sColor = Parameters.get({
			name: "sapNeutralBackground",
			callback: function (sColor) {
				assert.equal(getComputedStyle(document.querySelector(".sapMGTBadge")).backgroundColor,hexToRgb(sColor),"Color has been applied");
				fnDone();
			}
		});
		if (sColor) {
			assert.equal(getComputedStyle(document.querySelector(".sapMGTBadge")).backgroundColor,hexToRgb(sColor),"Color has been applied");
			fnDone();
		}
	});
});