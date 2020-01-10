/*global QUnit, sinon */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/GenericTile",
	"sap/m/TileContent",
	"sap/m/NumericContent",
	"sap/ui/Device",
	"sap/ui/core/ResizeHandler",
	"sap/m/GenericTileLineModeRenderer",
	"sap/m/Text",
	"sap/m/ScrollContainer",
	"sap/m/FlexBox",
	"sap/m/GenericTileRenderer",
	"sap/m/library",
	// used only indirectly
	"sap/ui/events/jquery/EventExtension",
	"jquery.sap.keycodes"
], function(jQuery, GenericTile, TileContent, NumericContent, Device, ResizeHandler, GenericTileLineModeRenderer,
			Text, ScrollContainer, FlexBox, GenericTileRenderer, library) {
	"use strict";

	// shortcut for sap.m.Size
	var Size = library.Size;

	// shortcut for sap.m.DeviationIndicator
	var DeviationIndicator = library.DeviationIndicator;

	// shortcut for sap.m.FrameType
	var FrameType = library.FrameType;

	// shortcut for sap.m.ValueColor
	var ValueColor = library.ValueColor;

	// shortcut for sap.m.LoadState
	var LoadState = library.LoadState;

	// shortcut for sap.m.GenericTileMode
	var GenericTileMode = library.GenericTileMode;

	// shortcut for sap.m.GenericTileScope
	var GenericTileScope = library.GenericTileScope;

	var IMAGE_PATH = "test-resources/sap/m/images/";

	QUnit.module("Control initialization core and theme checks", {
		beforeEach: function() {
			this.fnStubIsInitialized = sinon.stub(sap.ui.getCore(), "isInitialized");
			this.fnSpyAttachInit = sinon.spy(sap.ui.getCore(), "attachInit");
			this.fnSpyHandleCoreInitialized = sinon.spy(GenericTile.prototype, "_handleCoreInitialized");
			this.fnStubThemeApplied = sinon.stub(sap.ui.getCore(), "isThemeApplied");
			this.fnStubAttachThemeApplied = sinon.stub(sap.ui.getCore(), "attachThemeChanged").callsFake(function(fn, context) {
				fn.call(context); //simulate immediate theme change
			});
			this.fnSpyHandleThemeApplied = sinon.spy(GenericTile.prototype, "_handleThemeApplied");
		},
		afterEach: function() {
			this.fnStubIsInitialized.restore();
			this.fnSpyAttachInit.restore();
			this.fnSpyHandleCoreInitialized.restore();
			this.fnStubThemeApplied.restore();
			this.fnStubAttachThemeApplied.restore();
			this.fnSpyHandleThemeApplied.restore();
		}
	});

	QUnit.test("Core initialization check - no core, no theme", function(assert) {
		//Arrange
		this.fnStubIsInitialized.returns(false);
		this.fnStubThemeApplied.returns(false);

		//Act
		var oTile = new GenericTile();

		//Assert
		assert.ok(oTile._bThemeApplied, "Rendering variable has been correctly set.");
		assert.ok(this.fnSpyAttachInit.calledOnce, "Method Core.attachInit has been called once.");
		assert.ok(this.fnSpyHandleCoreInitialized.calledOnce, "Method _handleCoreInitialized has been called once.");
		assert.ok(this.fnStubAttachThemeApplied.calledOnce, "Method Core.attachThemeChanged has been called once.");
		assert.ok(this.fnSpyHandleThemeApplied.calledOnce, "Method _handleThemeApplied has been called once.");
	});

	QUnit.test("Core initialization check - no core, but theme", function(assert) {
		//Arrange
		this.fnStubIsInitialized.returns(false);
		this.fnStubThemeApplied.returns(true);

		//Act
		var oTile = new GenericTile();

		//Assert
		assert.ok(oTile._bThemeApplied, "Rendering variable has been correctly set.");
		assert.ok(this.fnSpyAttachInit.calledOnce, "Method Core.attachInit has been called once.");
		assert.ok(this.fnSpyHandleCoreInitialized.calledOnce, "Method _handleCoreInitialized has been called once.");
		assert.ok(this.fnStubAttachThemeApplied.notCalled, "Method Core.attachThemeChanged has not been called.");
		assert.ok(this.fnSpyHandleThemeApplied.notCalled, "Method _handleThemeApplied has not been called.");
	});

	QUnit.test("Core initialization check - core, but no theme", function(assert) {
		//Arrange
		this.fnStubIsInitialized.returns(true);
		this.fnStubThemeApplied.returns(false);

		//Act
		var oTile = new GenericTile();

		//Assert
		assert.ok(oTile._bThemeApplied, "Rendering variable has been correctly set.");
		assert.ok(this.fnSpyAttachInit.notCalled, "Method Core.attachInit has not been called.");
		assert.ok(this.fnSpyHandleCoreInitialized.calledOnce, "Method _handleCoreInitialized has been called once.");
		assert.ok(this.fnStubAttachThemeApplied.calledOnce, "Method Core.attachThemeChanged has been called once.");
		assert.ok(this.fnSpyHandleThemeApplied.calledOnce, "Method _handleThemeApplied has been called once.");
	});

	QUnit.test("Core initialization check - core and theme", function(assert) {
		//Arrange
		this.fnStubIsInitialized.returns(true);
		this.fnStubThemeApplied.returns(true);

		//Act
		var oTile = new GenericTile();

		//Assert
		assert.ok(oTile._bThemeApplied, "Rendering variable has been correctly set.");
		assert.ok(this.fnSpyAttachInit.notCalled, "Method Core.attachInit has not been called.");
		assert.ok(this.fnSpyHandleCoreInitialized.calledOnce, "Method _handleCoreInitialized has been called once.");
		assert.ok(this.fnStubAttachThemeApplied.notCalled, "Method Core.attachThemeChanged has not been called.");
		assert.ok(this.fnSpyHandleThemeApplied.notCalled, "Method _handleThemeApplied has not been called.");
	});

	QUnit.test("Clamp title height when theme is ready", function(assert) {
		//Arrange
		this.fnStubIsInitialized.returns(true);
		this.fnStubThemeApplied.returns(false);
		sinon.spy(Text.prototype, "clampHeight");

		//Act
		new GenericTile();

		//Assert
		assert.ok(Text.prototype.clampHeight.calledOnce, "The tile's title height has been recalculated.");

		//Cleanup
		Text.prototype.clampHeight.restore();
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
	QUnit.test("Default value of size", function(assert) {
		assert.strictEqual(this.oGenericTile.getProperty("size"), Size.Auto);
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

	QUnit.module("Rendering tests", {
		beforeEach : function() {
			this.fnSpyBeforeRendering = sinon.spy(GenericTile.prototype, "onBeforeRendering");

			this.oGenericTile = new GenericTile("generic-tile", {
				subheader : "Expenses By Region",
				frameType : FrameType.OneByOne,
				header : "Comparative Annual Totals",
				headerImage : IMAGE_PATH + "female_BaySu.jpg",
				tileContent : new TileContent("tile-cont", {
					unit : "EUR",
					footer : "Current Quarter",
					content : new NumericContent("numeric-cnt", {
						state : LoadState.Loaded,
						scale : "M",
						indicator : DeviationIndicator.Up,
						truncateValueTo : 4,
						value : 20,
						nullifyValue : true,
						formatterValue : false,
						valueColor : ValueColor.Good,
						icon : "sap-icon://customer-financial-fact-sheet"
					})
				}),
				press: jQuery.noop //attach empty press to enable :focus state
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.sStartTheme = sap.ui.getCore().getConfiguration().getTheme();
			this.sRequiredTheme = null;

			this.applyTheme = function(sTheme, fnCallback) {
				this.sRequiredTheme = sTheme;
				if (sap.ui.getCore().getConfiguration().getTheme() === this.sRequiredTheme && sap.ui.getCore().isThemeApplied()) {
					if (jQuery.isFunction(fnCallback)) {
						fnCallback.bind(this)();
						fnCallback = undefined;
					}
				} else {
					sap.ui.getCore().attachThemeChanged(fnThemeApplied.bind(this));
					sap.ui.getCore().applyTheme(sTheme);
				}

				function fnThemeApplied(oEvent) {
					sap.ui.getCore().detachThemeChanged(fnThemeApplied);
					if (sap.ui.getCore().getConfiguration().getTheme() === this.sRequiredTheme && sap.ui.getCore().isThemeApplied()) {
						if (jQuery.isFunction(fnCallback)) {
							fnCallback.bind(this)();
							fnCallback = undefined;
						}
					} else {
						jQuery.sap.delayedCall(1500, this, fnThemeApplied, oEvent);
					}
				}
			};

			// In case dev tools are open, focus setting is not possible. If so, disable the test
			this.checkFocus = function($Control) {
				return $Control.is(":focus");
			};
		},
		afterEach : function(assert) {
			this.oGenericTile.destroy();
			this.oGenericTile = null;

			var done = assert.async();
			this.applyTheme(this.sStartTheme, done);

			this.fnSpyBeforeRendering.restore();
		},
		fnWithRenderAsserts: function (assert) {
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

	QUnit.test("GenericTile rendered", function (assert) {
		this.fnWithRenderAsserts(assert);
	});

	QUnit.test("GenericTile rendered with custom width", function (assert) {
		this.oGenericTile.setWidth("500px");
		sap.ui.getCore().applyChanges();

		this.fnWithRenderAsserts(assert);
	});

	QUnit.test("GenericTile border rendered - blue crystal", function(assert) {
		var $tile = this.oGenericTile.$();

		var done = assert.async();
		this.applyTheme("sap_bluecrystal", function() {
			// the complete property name should be written for test in 'ie' and 'firefox'
			assert.equal($tile.css('border-bottom-width'), "1px", "Border bottom width was rendered successfully");
			assert.equal($tile.css('border-bottom-style'), "solid", "Border bottom style was rendered successfully");
			assert.equal($tile.css('border-top-width'), "1px", "Border top width was rendered successfully");
			assert.equal($tile.css('border-top-style'), "solid", "Border top style was rendered successfully");
			assert.equal($tile.css('border-right-width'), "1px", "Border right width was rendered successfully");
			assert.equal($tile.css('border-right-style'), "solid", "Border right style was rendered successfully");
			assert.equal($tile.css('border-left-width'), "1px", "Border left width was rendered successfully");
			assert.equal($tile.css('border-left-style'), "solid", "Border left style was rendered successfully");
			done();
		});
	});

	QUnit.test("GenericTile focus rendered - blue crystal", function(assert) {
		if (Device.browser.phantomJS) {
			assert.expect(0);
			return;
		}
		var done = assert.async();
		this.applyTheme("sap_bluecrystal", function() {
			assert.ok(jQuery.sap.byId("generic-tile-hover-overlay"), "Hover overlay div was rendered successfully");
			assert.ok(jQuery.sap.byId("generic-tile-focus"), "Focus div was rendered successfully");
			done();
		});
	});

	QUnit.test("GenericTile border rendered - HCB", function(assert) {
		if (Device.browser.phantomJS) {
			assert.expect(0);
			return;
		}
		var done = assert.async();
		this.applyTheme("sap_hcb", function() {
			this.oGenericTile.rerender();
			var $tile = this.oGenericTile.$();
			// the complete property name should be written for test in 'ie' and 'firefox'
			assert.equal($tile.css('border-bottom-style'), "solid", "Border bottom style was rendered successfully");
			assert.equal($tile.css('border-top-style'), "solid", "Border top style was rendered successfully");
			assert.equal($tile.css('border-right-style'), "solid", "Border right style was rendered successfully");
			assert.equal($tile.css('border-left-style'), "solid", "Border left style was rendered successfully");
			done();
		}.bind(this));
	});

	QUnit.test("GenericTile focus rendered - HCB", function(assert) {
		if (Device.browser.phantomJS) {
			assert.expect(0);
			return;
		}
		var done = assert.async();
		this.applyTheme("sap_hcb", function() {
			this.oGenericTile.rerender();
			assert.ok(jQuery.sap.byId("generic-tile-hover-overlay"), "Hover overlay div was rendered successfully");
			assert.ok(jQuery.sap.byId("generic-tile-focus"), "Focus div was rendered successfully");
			done();
		});
	});

	QUnit.test("GenericTile border rendered - Belize", function(assert) {
		if (Device.browser.phantomJS) {
			assert.expect(0);
			return;
		}
		var done = assert.async();
		this.applyTheme("sap_belize", function() {
			this.oGenericTile.rerender();
			var $tile = this.oGenericTile.$();
			// the complete property name should be written for test in 'ie' and 'firefox'
			assert.equal($tile.css('border-bottom-style'), "solid", "Border bottom style was rendered successfully");
			assert.equal($tile.css('border-top-style'), "solid", "Border top style was rendered successfully");
			assert.equal($tile.css('border-right-style'), "solid", "Border right style was rendered successfully");
			assert.equal($tile.css('border-left-style'), "solid", "Border left style was rendered successfully");
			done();
		}.bind(this));
	});

	QUnit.test("GenericTile focus and hover overlay rendered - Belize", function(assert) {
		if (Device.browser.phantomJS) {
			assert.expect(0);
			return;
		}
		var done = assert.async();
		this.applyTheme("sap_belize", function() {
			this.oGenericTile.rerender();
			assert.ok(jQuery.sap.byId("generic-tile-focus"), "Focus div was rendered successfully");
			assert.ok(jQuery.sap.byId("generic-tile-hover-overlay").hasClass("sapMGTWithoutImageHoverOverlay"), "Hover overlay was rendered successfully");
			assert.ok(!jQuery.sap.byId("generic-tile-hover-overlay").hasClass("sapMGTPressActive"), "Press action is not triggered");
			this.oGenericTile.ontouchstart();
			assert.ok(jQuery.sap.byId("generic-tile-hover-overlay").hasClass("sapMGTPressActive"), "Press action is triggered and press active selector is added");
			this.oGenericTile.ontouchend();
			assert.ok(!jQuery.sap.byId("generic-tile-hover-overlay").hasClass("sapMGTPressActive"), "Press action stopped and press active selector is removed");
			done();
		});
	});

	QUnit.test("GenericTile focus and hover overlay rendered - Fiori 3", function (assert) {
		if (Device.browser.phantomJS) {
			assert.expect(0);
			return;
		}
		var done = assert.async();
		this.applyTheme("sap_fiori_3", function () {
			this.oGenericTile.rerender();
			// hover overlay is used only in case of tiles with background image
			assert.ok(jQuery.sap.byId("generic-tile-focus"), "Focus div was rendered successfully");
			assert.ok(jQuery.sap.byId("generic-tile-hover-overlay").hasClass("sapMGTWithoutImageHoverOverlay"), "Hover overlay was rendered successfully");
			assert.ok(!jQuery.sap.byId("generic-tile").hasClass("sapMGTPressActive"), "Press action is not triggered on GenericTile");
			assert.ok(!jQuery.sap.byId("generic-tile-hover-overlay").hasClass("sapMGTPressActive"), "Press action is not triggered on GenericTile hover overlay");
			this.oGenericTile.ontouchstart();
			assert.ok(jQuery.sap.byId("generic-tile").hasClass("sapMGTPressActive"), "Press action is triggered and press active selector is added to GenericTile");
			assert.ok(jQuery.sap.byId("generic-tile-hover-overlay").hasClass("sapMGTPressActive"), "Press action is triggered and press active selector is added to GenericTile hover overlay");
			this.oGenericTile.ontouchend();
			assert.ok(!jQuery.sap.byId("generic-tile").hasClass("sapMGTPressActive"), "Press action stopped and press active selector is removed from GenericTile");
			assert.ok(!jQuery.sap.byId("generic-tile-hover-overlay").hasClass("sapMGTPressActive"), "Press action stopped and press active selector is removed from GenericTile hover overlay");
			done();
		});
	});

	QUnit.test("GenericTile does not expand on focus - theme hcb", function(assert) {
		var $tile = this.oGenericTile.$();

		var done = assert.async();
		this.applyTheme("sap_hcb", function(){

			//get dimensions
			var beforeWidth = $tile.outerWidth();
			var beforeHeight = $tile.outerHeight();

			//set :focus on tile
			$tile.focus();
			if (!this.checkFocus($tile)){
				assert.expect(0);
				done();
				return;
			}

			//get new dimensions
			var afterWidth = $tile.outerWidth();
			var afterHeight = $tile.outerHeight();

			assert.strictEqual(afterWidth, beforeWidth, "Tile's outer width did not change");
			assert.strictEqual(afterHeight, beforeHeight, "Tile's outer height did not change");

			done();
		});
	});

	QUnit.test("GenericTile does not expand on focus - theme bluecrystal", function(assert) {
		var $tile = this.oGenericTile.$();

		var done = assert.async();
		this.applyTheme("sap_bluecrystal", function(){

			//get dimensions
			var beforeWidth = $tile.outerWidth();
			var beforeHeight = $tile.outerHeight();

			//set :focus on tile
			$tile.focus();
			if (!this.checkFocus($tile)){
				assert.expect(0);
				done();
				return;
			}

			//get new dimensions
			var afterWidth = $tile.outerWidth();
			var afterHeight = $tile.outerHeight();

			assert.strictEqual(afterWidth, beforeWidth, "Tile's outer width did not change");
			assert.strictEqual(afterHeight, beforeHeight, "Tile's outer height did not change");

			done();
		}.bind(this));
	});

	QUnit.test("Wrapping type is propagated to title", function (assert) {
		this.oGenericTile.setWrappingType(library.WrappingType.Hyphenated);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(library.WrappingType.Hyphenated, this.oGenericTile._oTitle.getWrappingType(), "Title wrapping type should be Hyphenated");
	});

	QUnit.test("Wrapping type is propagated to subTitle", function (assert) {
		this.oGenericTile.setWrappingType(library.WrappingType.Hyphenated);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(library.WrappingType.Hyphenated, this.oGenericTile._oSubTitle.getWrappingType(), "Subtitle wrapping type should be Hyphenated");
	});

	QUnit.module("FrameType rendering tests", {
		beforeEach: function() {
			this.oGenericTile = new GenericTile({
				frameType : FrameType.Auto,
				header: "This is a header",
				subheader: "This is a subheader"
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
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
		assert.equal(this.oGenericTile.getFrameType(), FrameType.OneByOne, "FrameType Auto set to OneByOne");
	});

	QUnit.test("FrameType is in TwoByOne", function(assert) {
		//Arrange
		this.oGenericTile.setFrameType(FrameType.TwoByOne);

		//Act
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(this.oGenericTile.getFrameType(), FrameType.TwoByOne, "FrameType Auto set to TwoByOne");
	});

	QUnit.module("Scope rendering tests", {
		beforeEach: function() {
			this.oGenericTile = new GenericTile({
				scope: GenericTileScope.Display,
				header: "This is a header",
				subheader: "This is a subheader",
				tileContent : new TileContent("tile-cont", {
					unit : "EUR",
					footer : "Current Quarter"
				})
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Display scope with actions view", function(assert) {
		//Arrange
		this.oGenericTile.showActionsView(true);
		//Act
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oGenericTile.getScope(), GenericTileScope.Display, "The GenericTile was in Display scope");
		assert.ok(this.oGenericTile.$().hasClass("sapMGTScopeActions"), "The actions scope class was added");
		assert.notOk(jQuery.sap.domById("tile-cont-footer-text"), "The footer text has not been rendered in actions view");
	});

	QUnit.test("Display scope with actions view in failed state", function(assert) {
		//Arrange
		this.oGenericTile.setState("Failed");
		this.oGenericTile.showActionsView(true);
		//Act
		sap.ui.getCore().applyChanges();
		//Assert
		assert.ok(this.oGenericTile.$("failed-text").length === 0, "Failed text has not been rendered");
	});

	QUnit.test("Action scope in normal mode", function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);

		//Act
		this.oGenericTile.invalidate();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(this.oGenericTile.$("action-more").length > 0, "More icon has been rendered");
		assert.ok(this.oGenericTile.$("action-remove").length > 0, "Remove icon has been rendered");
	});

	QUnit.test("Action scope in LineMode/compact", function(assert) {
		//Arrange
		this.oGenericTile.addStyleClass("sapUiSizeCompact");
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		this.oGenericTile.setScope(GenericTileScope.Actions);
		//Act
		this.oGenericTile.invalidate();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(this.oGenericTile.$("actions").length > 0, "Action container has been rendered");
		assert.ok(this.oGenericTile.$("action-more").length > 0, "More icon has been rendered");
		assert.ok(this.oGenericTile.$("action-remove").length > 0, "Remove icon has been rendered");
	});

	QUnit.test("Action scope remove button does not steal focus", function(assert) {
		//Arrange
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		this.oGenericTile.setScope(GenericTileScope.Actions);

		//Act
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(this.oGenericTile.$("action-remove").attr("tabindex"), "-1", "Correct tabindex is set on remove icon.");
		assert.equal(this.oGenericTile._oRemoveButton._bExcludeFromTabChain, true, "Remove button is excluded from tab chain on rendering.");
	});

	QUnit.test("Action scope in disabled LineMode GenericTile", function(assert) {
		//Arrange
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		this.oGenericTile.setScope(GenericTileScope.Actions);
		this.oGenericTile.setState("Disabled");
		//Act
		sap.ui.getCore().applyChanges();
		//Assert
		assert.ok(this.oGenericTile.$("actions").length === 0, "Action container has not been rendered");
		assert.ok(this.oGenericTile.$("action-more").length === 0, "More icon has not been rendered");
		assert.ok(this.oGenericTile.$("action-remove").length === 0, "Remove icon has not been rendered");
	});

	QUnit.test("Action scope in failed LineMode GenericTile", function(assert) {
		//Arrange
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		this.oGenericTile.setScope(GenericTileScope.Actions);
		this.oGenericTile.setState("Failed");
		//Act
		sap.ui.getCore().applyChanges();
		//Assert
		assert.ok(this.oGenericTile.$("actions").length > 0, "Action container has been rendered");
		assert.ok(this.oGenericTile.$("action-more").length > 0, "More icon has been rendered");
		assert.ok(this.oGenericTile.$("action-remove").length > 0, "Remove icon has been rendered");
		assert.ok(this.oGenericTile.$("warn-icon").length > 0, "Failed icon has been rendered");
	});

	QUnit.test("Action scope in disabled regular GenericTile", function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		this.oGenericTile.setState("Disabled");
		//Act
		sap.ui.getCore().applyChanges();
		//Assert
		assert.ok(this.oGenericTile.$("action-more").length === 0, "More icon has not been rendered");
		assert.ok(this.oGenericTile.$("action-remove").length === 0, "Remove button has not been rendered");
	});

	QUnit.test("Action scope in failed regular GenericTile", function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		this.oGenericTile.setState("Failed");
		//Act
		sap.ui.getCore().applyChanges();
		//Assert
		assert.ok(this.oGenericTile.$("action-more").length > 0, "More icon has been rendered");
		assert.ok(this.oGenericTile.$("action-remove").length > 0, "Remove button has been rendered");
		assert.ok(this.oGenericTile.$("failed-icon").length > 0, "Failed icon has been rendered");
		assert.ok(this.oGenericTile.$("failed-text").length === 0, "Failed text has not been rendered");
	});

	QUnit.test("Scope content is created on beforeRendering", function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		sinon.spy(this.oGenericTile, "_initScopeContent");

		//Act
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(this.oGenericTile._initScopeContent.callCount, 1, "_initScopeContent has been called once.");
	});

	QUnit.module("sap.m.GenericTileMode.LineMode ListView cozy (small screen only)", {
		beforeEach: function() {
			sinon.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				header: "headerText",
				subheader: "subheaderText",
				mode: GenericTileMode.LineMode
			}).placeAt("qunit-fixture");
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").addClass("sapUiMedia-GenericTileDeviceSet-small");
			sinon.stub(this.oGenericTile, "_isScreenLarge").returns(false);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			Device.media.attachHandler.restore();
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("All elements found", function (assert) {
		assert.ok(this.oGenericTile.$().hasClass("sapMGT"), "Tile has class 'sapMGT'");
		assert.ok(this.oGenericTile.$().hasClass("sapMGTLineMode"), "Tile has class 'sapMGTLineMode'");
		assert.ok(this.oGenericTile.$("hdr-text").length > 0, "Header was found");
		assert.equal(this.oGenericTile.$("hdr-text").text(), "headerText", "Header text was correct");
		assert.ok(this.oGenericTile.$("subHdr-text").length > 0, "SubHeader was found");
		assert.equal(this.oGenericTile.$("subHdr-text").text(), "subheaderText", "SubHeader text was correct");
		assert.ok(this.oGenericTile.$("focus").length > 0, "Focus helper was found");
		assert.ok(this.oGenericTile.$("touchArea").length > 0, "Touch area for line mode was found");
		assert.ok(this.oGenericTile.$("lineModeHelpContainer").length > 0, "Help container for line mode was found");

		var $Parent = this.oGenericTile.$().parent();
		assert.ok($Parent.hasClass("sapMGTLineModeListContainer"), "Parent container should have class for the line mode list container.");
		assert.notOk($Parent.hasClass("sapMGTLineModeFloatingContainer"), "Parent container should not have class for the line mode floating container.");
	});

	QUnit.module("LineMode FloatingView (large screen only) w/o parent", {
		beforeEach: function() {
			sinon.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				mode: GenericTileMode.LineMode
			}).placeAt("qunit-fixture");
			jQuery("html").addClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			sinon.stub(this.oGenericTile, "_isScreenLarge").returns(true);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			Device.media.attachHandler.restore();
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Correct parameters provided to Resize Handler", function(assert) {
		//Arrange
		var oSpy = sinon.spy(ResizeHandler, "register");
		this.oGenericTile._bCompact = true;
		sap.ui.getCore().applyChanges();
		this.oGenericTile._sParentResizeListenerId = null;

		//Act
		this.oGenericTile.invalidate();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(oSpy.calledWith(this.oGenericTile.$().parent()), "Correct parameter provided if parent is UIArea");

		//Cleanup
		oSpy.restore();
	});

	QUnit.module("sap.m.GenericTileMode.LineMode FloatingView cozy (large screen only)", {
		beforeEach: function() {
			sinon.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				header: "headerText",
				subheader: "subheaderText",
				mode: GenericTileMode.LineMode
			}).placeAt("qunit-fixture");
			jQuery("html").addClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			sinon.stub(this.oGenericTile, "_isScreenLarge").returns(true);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			Device.media.attachHandler.restore();
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("All elements found", function(assert) {
		assert.ok(this.oGenericTile.$().hasClass("sapMGT"), "Tile has class 'sapMGT'");
		assert.ok(this.oGenericTile.$().hasClass("sapMGTLineMode"), "Tile has class 'sapMGTLineMode'");
		assert.ok(this.oGenericTile.$("startMarker").length > 0, "StartMarker was found.");
		assert.ok(this.oGenericTile.$("endMarker").length > 0, "EndMarker was found.");
		assert.ok(this.oGenericTile.$("hdr-text").length > 0, "Header was found");
		assert.equal(this.oGenericTile.$("hdr-text").text(), "headerText", "Header text was correct");
		assert.ok(this.oGenericTile.$("subHdr-text").length > 0, "SubHeader was found");
		assert.equal(this.oGenericTile.$("subHdr-text").text(), "subheaderText", "SubHeader text was correct");
		assert.ok(this.oGenericTile.$("styleHelper").length > 0, "Style helper was found.");

		var $Parent = this.oGenericTile.$().parent();
		assert.ok($Parent.hasClass("sapMGTLineModeContainer"), "Parent container should have class for the line mode container.");
		assert.ok($Parent.hasClass("sapMGTLineModeFloatingContainer"), "Parent container should have class for the line mode floating container.");
		assert.notOk($Parent.hasClass("sapMGTLineModeListContainer"), "Parent container should not have class for the line mode list container.");
	});

	QUnit.module("sap.m.GenericTileMode.LineMode ListView compact (small screen only)", {
		beforeEach: function() {
			sinon.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				subheader: "Expenses By Region",
				header: "Comparative Annual Totals",
				mode: GenericTileMode.LineMode
			});
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").addClass("sapUiMedia-GenericTileDeviceSet-small");
			sinon.stub(this.oGenericTile, "_isScreenLarge").returns(false);
			//stub this function in order to not queue any updates which might influence the other tests
			sinon.stub(this.oGenericTile, "_updateHoverStyle");

			this.oParent = new FlexBox({
				width: "100px",
				items: [ this.oGenericTile ]
			}).placeAt("qunit-fixture");
			this.oParent.addStyleClass("sapUiSizeCompact");
			sap.ui.getCore().applyChanges();
			this.oGenericTile._updateHoverStyle.reset();
		},
		afterEach: function() {
			Device.media.attachHandler.restore();
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

		var $Parent = this.oGenericTile.$().parent();
		assert.ok($Parent.hasClass("sapMGTLineModeListContainer"), "Parent container should have class for the line mode list container.");
		assert.notOk($Parent.hasClass("sapMGTLineModeFloatingContainer"), "Parent container should not have class for the line mode floating container.");
	});

	QUnit.module("sap.m.GenericTileMode.LineMode FloatingView compact (large screen only)", {
		beforeEach: function() {
			sinon.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				subheader: "Expenses By Region",
				header: "Comparative Annual Totals",
				mode: GenericTileMode.LineMode
			});
			jQuery("html").addClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			sinon.stub(this.oGenericTile, "_isScreenLarge").returns(true);
			//stub this function in order to not queue any updates which might influence the other tests
			sinon.stub(this.oGenericTile, "_updateHoverStyle");

			this.oParent = new FlexBox({
				width: "100px",
				items: [ this.oGenericTile ]
			}).placeAt("qunit-fixture");
			this.oParent.addStyleClass("sapUiSizeCompact");
			sap.ui.getCore().applyChanges();
			this.oGenericTile._updateHoverStyle.reset();
		},
		afterEach: function() {
			Device.media.attachHandler.restore();
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
			this.oParent.destroy();
			this.oParent = null;
		}
	});

	QUnit.test("Correct parameter provided to Resize Handler", function(assert) {
		//Arrange
		var oSpy = sinon.spy(ResizeHandler, "register");
		this.oGenericTile._sParentResizeListenerId = null;

		//Act
		this.oGenericTile.invalidate();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(oSpy.calledWith(this.oGenericTile.getParent()), "Correct parameter provided if parent is a control");

		//Cleanup
		oSpy.restore();
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

		var $Parent = this.oGenericTile.$().parent();
		assert.ok($Parent.hasClass("sapMGTLineModeContainer"), "Parent container should have class for the line mode container.");
		assert.ok($Parent.hasClass("sapMGTLineModeFloatingContainer"), "Parent container should have class for the line mode floating container.");
		assert.notOk($Parent.hasClass("sapMGTLineModeListContainer"), "Parent container should not have class for the line mode list container.");
	});

	QUnit.module("sap.m.GenericTileMode.LineMode FloatingView Functions tests (large screen only)", {
		beforeEach: function() {
			sinon.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				subheader: "Expenses By Region",
				header: "Comparative Annual Totals",
				mode: GenericTileMode.LineMode
			});
			jQuery("html").addClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			sinon.stub(this.oGenericTile, "_isScreenLarge").returns(true);
			//stub this function in order to not queue any updates which might influence the other tests
			sinon.stub(this.oGenericTile, "_updateHoverStyle");

			this.oParent = new FlexBox({
				width: "100px",
				items: [ this.oGenericTile ]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oGenericTile._updateHoverStyle.reset();
		},
		afterEach: function() {
			Device.media.attachHandler.restore();
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
			this.oParent.destroy();
			this.oParent = null;
		}
	});

	QUnit.test("Tile attached mediaContainerWidthChange handler after rendering", function(assert) {
		//Arrange
		// remove stub to attach spy
		Device.media.attachHandler.restore();
		var deviceAttachHandlerSpy = sinon.spy(Device.media, "attachHandler");

		//Act
		this.oGenericTile.invalidate();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(deviceAttachHandlerSpy.calledOnce, "The mediaContainerWidthChange handler was attached after invalidation");
	});

	QUnit.test("Tile is invalidated on device size change", function(assert) {
		//Arrange
		// restore previous stub and replace it with different stub.
		var oMediaChangeSpy = sinon.spy(this.oGenericTile, "onAfterRendering");

		//Act
		this.oGenericTile._handleMediaChange();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(oMediaChangeSpy.calledOnce, true, "Invalidate triggered a rerendering");
	});

	QUnit.test("All elements found in failed state", function(assert) {
		//Arrange
		this.oGenericTile.setState("Failed");

		//Act
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(this.oGenericTile.$("warn-icon").length > 0, "Warning icon was found.");
	});

	QUnit.test("Attributes written in RTL", function(assert) {
		//Arrange
		sap.ui.getCore().getConfiguration().setRTL(true);

		//Act
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(this.oGenericTile.$().attr("dir"), "rtl");
		assert.equal(this.oGenericTile.$("hdr-text").attr("dir"), "rtl");
		assert.equal(this.oGenericTile.$("subHdr-text").attr("dir"), "rtl");

		//Cleanup
		sap.ui.getCore().getConfiguration().setRTL(false);
	});

	QUnit.test("Hover style update on rendering", function(assert) {
		//Arrange
		this.oGenericTile._updateHoverStyle.restore();

		sinon.spy(this.oGenericTile, "_updateHoverStyle");
		sinon.spy(GenericTileLineModeRenderer, "_updateHoverStyle");
		sinon.stub(this.oGenericTile, "_getStyleData").returns(true);
		sinon.spy(this.oGenericTile, "_queueAnimationEnd");
		var oClock = sinon.useFakeTimers();

		//Act
		this.oGenericTile.invalidate();
		sap.ui.getCore().applyChanges();

		oClock.tick(11);

		//Assert
		assert.equal(this.oGenericTile._updateHoverStyle.callCount, 1, "The hover style is updated when the control is rendered.");
		assert.equal(this.oGenericTile._queueAnimationEnd.callCount, 1, "The hover style update is queued when the control is rendered.");
		assert.ok(GenericTileLineModeRenderer._updateHoverStyle.called, "The renderer's update function is called if the style data changed.");

		//Cleanup
		GenericTileLineModeRenderer._updateHoverStyle.restore();
		oClock.restore();
	});

	QUnit.test("Hover style is not updated on rendering", function(assert) {
		//Arrange
		this.oGenericTile._updateHoverStyle.restore();
		sinon.spy(this.oGenericTile, "_updateHoverStyle");
		sinon.spy(GenericTileLineModeRenderer, "_updateHoverStyle");
		sinon.stub(this.oGenericTile, "_getStyleData").returns(false);

		//Act
		this.oGenericTile.invalidate();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(this.oGenericTile._updateHoverStyle.calledOnce, "The hover style is updated when the control is rendered.");
		assert.ok(GenericTileLineModeRenderer._updateHoverStyle.notCalled, "The renderer's update function is not called if the style data has not changed.");
		GenericTileLineModeRenderer._updateHoverStyle.restore();
	});

	QUnit.test("Function _calculateStyleData returns object with necessary fields", function(assert) {
		//Arrange
		var oStubGetPixelValue = sinon.stub(GenericTileLineModeRenderer, "_getCSSPixelValue");
		oStubGetPixelValue.withArgs(this.oGenericTile, "line-height").returns(30);
		oStubGetPixelValue.withArgs(this.oGenericTile, "min-height").returns(26);
		oStubGetPixelValue.withArgs(this.oGenericTile, "margin-top").returns(4);

		//Act
		this.oGenericTile.invalidate();
		sap.ui.getCore().applyChanges();

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

		//Cleanup
		oStubGetPixelValue.restore();
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
		sinon.stub(this.oGenericTile, "_calculateStyleData").returns({ field: "value" });
		this.oGenericTile._oStyleData = null;

		//Act
		var bChanged = this.oGenericTile._getStyleData();

		//Assert
		assert.ok(bChanged, "The return value is 'true' on change.");
		assert.equal(this.oGenericTile._oStyleData.field, "value", "The changed field has been set.");
		assert.ok(!jQuery.isEmptyObject(this.oGenericTile._oStyleData), "The internal object has been updated.");
	});

	QUnit.test("Function _getStyleData does not update internal object", function(assert) {
		//Arrange
		sinon.stub(this.oGenericTile, "_calculateStyleData").returns(null);
		this.oGenericTile._oStyleData = null;

		//Act
		var bChanged = this.oGenericTile._getStyleData();

		//Assert
		assert.ok(!bChanged, "The return value is 'false'.");
		assert.equal(this.oGenericTile._oStyleData, null, "Style data has not been updated.");
	});

	QUnit.test("Hover style update on resize", function(assert) {
		//Arrange
		sinon.stub(GenericTileLineModeRenderer, "_updateHoverStyle");
		var done = assert.async();
		var oClock = sinon.useFakeTimers();

		//Act
		this.oParent.setWidth("500px");

		//Assert
		sap.ui.getCore().attachIntervalTimer(checkAssertions);

		function checkAssertions() {
			oClock.tick(11);
			assert.ok(GenericTileLineModeRenderer._updateHoverStyle.called, "Renderer function _updateHoverStyle is called once.");

			//Cleanup
			sap.ui.getCore().detachIntervalTimer(checkAssertions);
			GenericTileLineModeRenderer._updateHoverStyle.restore();
			oClock.restore();

			done();
		}
	});

	QUnit.test("Hover style update of siblings on state change", function(assert) {
		//Arrange
		sinon.spy(this.oGenericTile, "_updateLineTileSiblings");
		var oSiblingTile = new GenericTile("sibling-tile", {
			state: LoadState.Loaded,
			subheader: "Expenses By Region",
			header: "Comparative Annual Totals",
			mode: GenericTileMode.LineMode
		});
		sinon.stub(oSiblingTile, "_isScreenLarge").returns(true);
		this.oParent.addItem(oSiblingTile);
		sap.ui.getCore().applyChanges();

		this.oGenericTile._updateHoverStyle.restore(); //restore stub in order to use spy
		sinon.spy(this.oGenericTile, "_updateHoverStyle");
		sinon.spy(oSiblingTile, "_updateHoverStyle");

		//Act
		this.oGenericTile.setState("Failed");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(this.oGenericTile._updateLineTileSiblings.callCount, 1, "Function _updateLineTileSiblings has been called on changed Tile.");
		assert.equal(this.oGenericTile._updateHoverStyle.callCount, 1, "Function _updateHoverStyle has been called on tile.");
		assert.equal(oSiblingTile._updateHoverStyle.callCount, 1, "Function _updateHoverStyle has been called on sibling.");

		//Cleanup
		oSiblingTile.destroy();
	});

	QUnit.test("No hover style update of non-GenericTile siblings", function(assert) {
		//Arrange
		var oSibling = new Text();
		this.oParent.addItem(oSibling);
		sinon.spy(this.oGenericTile, "_updateLineTileSiblings");

		this.oGenericTile._updateHoverStyle.restore(); //restore stub in order to use spy
		sinon.spy(this.oGenericTile, "_updateHoverStyle");

		//Act
		this.oGenericTile.setState("Failed");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(this.oGenericTile._updateLineTileSiblings.callCount, 1, "Function _updateLineTileSiblings has been called on changed Tile.");
		assert.equal(this.oGenericTile._updateHoverStyle.callCount, 1, "Function _updateHoverStyle has been called once.");

		//Cleanup
		oSibling.destroy();
	});

	QUnit.test("Resize Handler attached to parent, no deregister", function(assert) {
		//Arrange
		sinon.spy(ResizeHandler, "deregister");
		sinon.spy(ResizeHandler, "register");
		this.oGenericTile._sParentResizeListenerId = null;

		//Act
		this.oGenericTile.invalidate();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(ResizeHandler.deregister.notCalled);
		assert.ok(ResizeHandler.register.calledOnce);

		//Cleanup
		ResizeHandler.deregister.restore();
		ResizeHandler.register.restore();
	});

	QUnit.test("Resize Handler attached to parent, with deregister", function(assert) {
		//Arrange
		sinon.spy(ResizeHandler, "deregister");
		sinon.spy(ResizeHandler, "register");
		this.oGenericTile._sParentResizeListenerId = "SomeListener";

		//Act
		this.oGenericTile.invalidate();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(ResizeHandler.deregister.calledOnce);
		assert.ok(ResizeHandler.register.calledOnce);

		//Cleanup
		ResizeHandler.deregister.restore();
		ResizeHandler.register.restore();
	});

	QUnit.test("Hover style update on transitionend", function(assert) {
		//Arrange
		this.oGenericTile._updateHoverStyle.restore();

		//stub renderer method in order to not render/manipulate anything
		sinon.stub(GenericTileLineModeRenderer, "_updateHoverStyle");
		sinon.stub(this.oGenericTile, "_queueAnimationEnd");
		sinon.stub(this.oGenericTile, "_getStyleData").returns(true);
		this.oGenericTile._oStyleData = {
			lineBreak: true
		};

		//Act
		this.oGenericTile._updateHoverStyle();
		this.oGenericTile._queueAnimationEnd.reset();
		this.oGenericTile._$RootNode.trigger("transitionend");

		//Assert
		assert.equal(this.oGenericTile._queueAnimationEnd.callCount, 1, "Previously attached event handler _queueAnimationEnd has been called once.");

		//Cleanup
		GenericTileLineModeRenderer._updateHoverStyle.restore();
	});

	QUnit.test("Hover style update on animationend", function(assert) {
		//Arrange
		this.oGenericTile._updateHoverStyle.restore();

		//stub renderer method in order to not render/manipulate anything
		sinon.stub(GenericTileLineModeRenderer, "_updateHoverStyle");
		sinon.stub(this.oGenericTile, "_queueAnimationEnd");
		sinon.stub(this.oGenericTile, "_getStyleData").returns(true);
		this.oGenericTile._oStyleData = {
			lineBreak: true
		};

		//Act
		this.oGenericTile._updateHoverStyle();
		this.oGenericTile._queueAnimationEnd.reset();
		this.oGenericTile._$RootNode.trigger("animationend");

		//Assert
		assert.equal(this.oGenericTile._queueAnimationEnd.callCount, 1, "Previously attached event handler _queueAnimationEnd has been called once.");

		//Cleanup
		GenericTileLineModeRenderer._updateHoverStyle.restore();
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
		sinon.stub(this.oGenericTile, "_handleAnimationEnd");
		this.oGenericTile._oAnimationEndCallIds = {};

		//Act
		var bPropagationStopped = this.oGenericTile._queueAnimationEnd(oEvent) === false;

		//Assert
		assert.notOk(bPropagationStopped, "Event is being handled.");
	});

	QUnit.test("Mutex mechanism for animation/transition handling", function(assert) {
		if (Device.browser.phantomJS) {
			assert.expect(0);
			return;
		}

		//Arrange
		sinon.spy(this.oGenericTile, "_queueAnimationEnd");
		sinon.spy(this.oGenericTile, "_handleAnimationEnd");
		sinon.spy(this.oGenericTile, "_getStyleData");
		sinon.stub(GenericTileLineModeRenderer, "_updateHoverStyle");
		sinon.stub(this.oGenericTile, "_updateLineTileSiblings");
		sinon.stub(this.oGenericTile, "_calculateStyleData").returns({
			lineBreak: true
		});
		this.oGenericTile._updateHoverStyle.restore();
		var done = assert.async();

		//Act
		this.oGenericTile._updateHoverStyle();
		this.oGenericTile._$RootNode.trigger("transitionend");

		jQuery.sap.delayedCall(1000, null, function() { //1000ms, to make sure to wait for the 10ms delay
			//Assert
			assert.ok(GenericTileLineModeRenderer._updateHoverStyle.called, "Rendering update has been executed.");
			assert.ok(GenericTileLineModeRenderer._updateHoverStyle.calledOn(this.oGenericTile), "Rendering update has been executed.");
			assert.ok(this.oGenericTile._getStyleData.called, "Function _getStyleData has been called.");
			assert.ok(this.oGenericTile._queueAnimationEnd.called, "Function _queueAnimationEnd has been called.");
			assert.ok(this.oGenericTile._handleAnimationEnd.called, "Function _handleAnimationEnd has been called.");
			assert.ok(this.oGenericTile._handleAnimationEnd.calledWith(0), "Function _handleAnimationEnd has been called with correct index.");
			assert.ok(this.oGenericTile._handleAnimationEnd.calledWith(1), "Function _handleAnimationEnd has been called with correct index.");

			GenericTileLineModeRenderer._updateHoverStyle.restore();
			done();
		}.bind(this));
	});

	QUnit.test("Function _clearAnimationUpdateQueue", function(assert) {
		//Arrange
		var oClearTimeoutSpy = sinon.spy(window, "clearTimeout");
		this.oGenericTile._oAnimationEndCallIds = {
			0: 100,
			1: 200
		};

		//Act
		this.oGenericTile._clearAnimationUpdateQueue();

		//Assert
		assert.equal(oClearTimeoutSpy.callCount, 2, "Cleared delayedCall count is correct.");
		assert.equal(oClearTimeoutSpy.firstCall.args[0], 100, "Correct first ID has been cleared.");
		assert.equal(oClearTimeoutSpy.secondCall.args[0], 200, "Correct second ID has been cleared.");
		assert.deepEqual(this.oGenericTile._oAnimationEndCallIds, {}, "All IDs have been removed from the object.");

		//Cleanup
		oClearTimeoutSpy.restore();
	});

	QUnit.module("Protected method getBoundingRects", {
		beforeEach: function() {
			sinon.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile({
				state: LoadState.Loaded,
				subheader: "Expenses By Region",
				header: "Comparative Annual Totals",
				mode: GenericTileMode.LineMode
			});

			jQuery("html").addClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			sinon.stub(this.oGenericTile, "_isScreenLarge").returns(true);
			//stub this function on order to not queue any updates which might influence the other tests
			sinon.stub(this.oGenericTile, "_updateHoverStyle");

			this.oGenericTile.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			Device.media.attachHandler.restore();
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("getBoundingRects in compact tile creates styleData when nothing exists yet", function(assert) {
		//Arrange
		this.oGenericTile._oStyleData = null;
		sinon.spy(this.oGenericTile, "_getStyleData");
		sinon.stub(this.oGenericTile, "_calculateStyleData").returns({
			lines: []
		});

		//Act
		this.oGenericTile.getBoundingRects();

		//Assert
		assert.equal(this.oGenericTile._getStyleData.callCount, 1, "_getStyleData has been called once.");
	});

	QUnit.test("getBoundingRects in cozy tile returns object with necessary fields in list view (small screen)", function(assert) {
		//Arrange
		jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").addClass("sapUiMedia-GenericTileDeviceSet-small");
		this.oGenericTile._isScreenLarge.restore();
		sinon.stub(this.oGenericTile, "_isScreenLarge").returns(false);
		sap.ui.getCore().applyChanges();

		//Act
		var aBoundingRects = this.oGenericTile.getBoundingRects();

		//Assert
		assert.equal(aBoundingRects.length, 1, "An array has been returned.");
		assert.equal(typeof aBoundingRects[0].offset.x, "number", "The field 'offset.x' is available.");
		assert.equal(typeof aBoundingRects[0].offset.y, "number", "The field 'offset.y' is available.");
		assert.ok(aBoundingRects[0].width >= 0, "The field 'width' is available.");
		assert.ok(aBoundingRects[0].height >= 0, "The field 'height' is available.");
	});

	QUnit.test("getBoundingRects returns object with necessary fields in floating view (large screen)", function(assert) {
		//Arrange
		var oStubGetPixelValue = sinon.stub(GenericTileLineModeRenderer, "_getCSSPixelValue");
		oStubGetPixelValue.withArgs(this.oGenericTile, "line-height").returns(50);
		oStubGetPixelValue.withArgs(this.oGenericTile, "min-height").returns(26);
		oStubGetPixelValue.withArgs(this.oGenericTile, "margin-top").returns(4);
		//Act
		this.oGenericTile.invalidate();
		sap.ui.getCore().applyChanges();

		this.oGenericTile._getStyleData();
		GenericTileLineModeRenderer._updateHoverStyle.call(this.oGenericTile);

		var aBoundingRects = this.oGenericTile.getBoundingRects();

		//Assert
		assert.equal(aBoundingRects.length, 1, "An array has been returned.");
		assert.equal(typeof aBoundingRects[0].offset.x, "number", "The field 'offset.x' is available.");
		assert.equal(typeof aBoundingRects[0].offset.y, "number", "The field 'offset.y' is available.");
		assert.ok(aBoundingRects[0].width >= 0, "The field 'width' is available.");
		assert.ok(aBoundingRects[0].height >= 0, "The field 'height' is available.");

		//Cleanup
		oStubGetPixelValue.restore();
	});

	QUnit.module("Rendering tests for failing state", {
		beforeEach : function() {
			this.oGenericTile = new GenericTile("generic-tile-failed", {
				state : LoadState.Failed,
				subheader : "Expenses By Region",
				frameType : FrameType.OneByOne,
				header : "Comparative Annual Totals",
				headerImage : IMAGE_PATH + "female_BaySu.jpg",
				tileContent : new TileContent("tile-cont-failed", {
					unit : "EUR",
					footer : "Current Quarter",
					content : new NumericContent("numeric-cnt-failed", {
						state : LoadState.Loading,
						scale : "M",
						indicator : DeviationIndicator.Up,
						truncateValueTo : 4,
						value : 20,
						nullifyValue : true,
						formatterValue : false,
						valueColor : ValueColor.Good,
						icon : "sap-icon://customer-financial-fact-sheet"
					})
				})
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("GenericTile in Failed state rendered", function(assert) {
		assert.ok(jQuery.sap.domById("generic-tile-failed"), "Generic tile was rendered successfully");
		assert.ok(jQuery.sap.domById("generic-tile-failed-content"), "Generic tile content was rendered successfully");
		assert.ok(jQuery.sap.domById("generic-tile-failed-failed-icon"), "Generic tile icone was rendered successfully");
		assert.ok(jQuery.sap.domById("generic-tile-failed-failed-text"), "Generic tile icone text was rendered successfully");
		assert.ok(jQuery.sap.domById("generic-tile-failed-failed-txt"), "Generic tile text rendered successfully");
		assert.ok(jQuery.sap.domById("generic-tile-failed-failed-txt-inner"), "Generic tile text inner was rendered successfully");
		assert.ok(jQuery.sap.domById("generic-tile-failed-failed-ftr"), "Generic tile footer was rendered successfully");
		assert.ok(jQuery.sap.domById("generic-tile-failed-hdr-text"), "Generic tile header was rendered successfully");
		assert.ok(jQuery.sap.domById("generic-tile-failed-subHdr-text"), "Generic tile subheader was rendered successfully");
		assert.ok(jQuery.sap.domById("generic-tile-failed-title"), "Generic tile title subheader was rendered successfully");
		assert.ok(jQuery.sap.domById("generic-tile-failed-title-inner"), "Generic tile title inner subheader was rendered successfully");
		assert.ok(jQuery.sap.domById("generic-tile-failed-warn-icon"), "Generic tile warning icone subheader was rendered successfully");
		assert.ok(jQuery.sap.domById("generic-tile-failed-icon-image"), "Generic tile icon was rendered successfully");
		assert.ok(jQuery.sap.domById("generic-tile-failed-overlay"), "Generic tile icon was rendered successfully");
		assert.ok(jQuery.sap.domById("tile-cont-failed"), "TileContent was rendered successfully");
		assert.ok(jQuery.sap.domById("tile-cont-failed-content"), "TileContent content was rendered successfully");
		assert.ok(!jQuery.sap.domById("tile-cont-failed-footer-text"), "TileContent footer text was not rendered");
		assert.ok(jQuery.sap.domById("numeric-cnt-failed"), "NumericContent was rendered successfully");
		assert.ok(jQuery.sap.domById("numeric-cnt-failed-indicator"), "Indicator was rendered successfully");
		assert.ok(jQuery.sap.domById("numeric-cnt-failed-value"), "Value was rendered successfully");
		assert.ok(jQuery.sap.domById("numeric-cnt-failed-value-scr"), "Value was rendered successfully");
		assert.ok(jQuery.sap.domById("numeric-cnt-failed-scale"), "Scale was rendered successfully");
		assert.ok(jQuery.sap.domById("numeric-cnt-failed-icon-image"), "Icon was rendered successfully");

		this.oGenericTile.setState("Loaded");
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery.sap.domById("tile-cont-failed-footer-text"), "TileContent footer text was rendered successfully");
	});

	QUnit.test("GenericTile is setting protected property only in Failed state", function(assert) {
		this.oGenericTile.setState("Loaded");
		sap.ui.getCore().applyChanges();
		assert.ok(this.oGenericTile.getTileContent()[0]._bRenderFooter, "bRenderFooter set to true");
		this.oGenericTile.setState("Loading");
		sap.ui.getCore().applyChanges();
		assert.ok(this.oGenericTile.getTileContent()[0]._bRenderFooter, "bRenderFooter set to true");
		this.oGenericTile.setState("Disabled");
		sap.ui.getCore().applyChanges();
		assert.ok(this.oGenericTile.getTileContent()[0]._bRenderFooter, "bRenderFooter set to true");
		this.oGenericTile.setState("Failed");
		sap.ui.getCore().applyChanges();
		assert.ok(!this.oGenericTile.getTileContent()[0]._bRenderFooter, "bRenderFooter set to false");
	});

	QUnit.module("GenericTileMode tests", {
		beforeEach : function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				subheader : "Expenses By Region",
				frameType : FrameType.OneByOne,
				header : "Comparative Annual Totals",
				tileContent : new TileContent("tile-cont", {
					unit : "EUR",
					footer : "Current Quarter",
					content : new NumericContent({
						state : LoadState.Loading,
						scale : "M",
						indicator : DeviationIndicator.Up,
						truncateValueTo : 4,
						value : 20,
						nullifyValue : true,
						formatterValue : false,
						valueColor : ValueColor.Good,
						icon : "sap-icon://customer-financial-fact-sheet"
					})
				})
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("GenericTile in ContentMode (Display mode)", function(assert) {
		// In ContentMode, when the subheader available, the number of header lines should be 2
		assert.equal(sap.ui.getCore().byId("generic-tile-title").getMaxLines(), 2, "The header has 2 lines and subheader has 1 line");

		// In ContentMode, when the subheader not available, the number of header lines should be 3
		this.oGenericTile.setSubheader("");
		sap.ui.getCore().applyChanges();
		assert.equal(sap.ui.getCore().byId("generic-tile-title").getMaxLines(), 3, "The header has 3 lines when subheader unavailable");

		// Check if the content in TileContent is still kept.
		assert.ok(this.oGenericTile.getTileContent()[0].getContent() !== null, "The content aggregation in TileContent is kept.");
	});

	QUnit.test("ContentMode - Check if the TileContent's content visibility is changed", function(assert) {
		//Arrange
		this.oGenericTile.setMode(GenericTileMode.HeaderMode);
		sap.ui.getCore().applyChanges();
		var oVisibilitySpy = sinon.spy(this.oGenericTile, "_changeTileContentContentVisibility");
		this.oGenericTile.setMode(GenericTileMode.ContentMode);
		//Act
		sap.ui.getCore().applyChanges();
		//Assert
		assert.ok(oVisibilitySpy.calledWith(true), "The visibility is changed to visible");
	});

	QUnit.test("GenericTile in HeaderMode", function(assert) {
		this.oGenericTile.setMode(GenericTileMode.HeaderMode);
		sap.ui.getCore().applyChanges();

		// In HeaderMode, when the subheader available, the number of header lines should be 4
		assert.equal(sap.ui.getCore().byId("generic-tile-title").getMaxLines(), 4, "The header has 4 lines and subheader has 1 line");

		// In HeaderMode, when the subheader unavailable, the number of header lines should be 5
		this.oGenericTile.setSubheader("");
		sap.ui.getCore().applyChanges();
		assert.equal(sap.ui.getCore().byId("generic-tile-title").getMaxLines(), 5, "The header has 5 lines when subheader unavailable");
	});

	QUnit.test("HeaderMode - Check if the TileContent's content visibility is changed", function(assert) {
		//Arrange
		var oVisibilitySpy = sinon.spy(this.oGenericTile, "_changeTileContentContentVisibility");
		this.oGenericTile.setMode(GenericTileMode.HeaderMode);
		//Act
		sap.ui.getCore().applyChanges();
		//Assert
		assert.ok(oVisibilitySpy.calledWith(false), "The visibility is changed to not visible");
	});

	QUnit.test("Content visibility change of TileContent", function(assert) {
		//Act
		this.oGenericTile._changeTileContentContentVisibility(true);
		//Assert
		assert.ok(this.oGenericTile.getTileContent()[0].getContent().getVisible(), "The content in TileContent is visible");
	});

	QUnit.test("GenericTileLineModeRenderer called for LineMode", function(assert) {
		// Arrange
		var oSpy = sinon.spy(GenericTileLineModeRenderer, "render");
		this.oGenericTile.getParent().addStyleClass = function() {};
		// Act
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		sap.ui.getCore().applyChanges();
		// Assert
		assert.ok(oSpy.calledOnce, "GenericTileLineModeRenderer called");
		//Restore
		oSpy.restore();
	});

	QUnit.test("GenericTileRenderer called for HeaderMode", function(assert) {
		// Arrange
		var oSpy = sinon.spy(GenericTileRenderer, "render");
		// Act
		this.oGenericTile.setMode(GenericTileMode.HeaderMode);
		sap.ui.getCore().applyChanges();
		// Assert
		assert.ok(oSpy.calledOnce, "GenericTileRenderer called");
		//Restore
		oSpy.restore();
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

	QUnit.test("Test content density class - compact from control parent", function(assert) {
		//Arrange
		new FlexBox({
			items: [ this.oGenericTile ]
		}).addStyleClass("sapUiSizeCompact").placeAt("qunit-fixture");

		//Act
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(this.oGenericTile._isCompact());
	});

	/* --------------------------------------- */
	/* Test internal methods                   */
	/* --------------------------------------- */
	QUnit.module("Internal method _getEventParams", {
		beforeEach : function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				header : "header",
				subheader : "subheader"
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Internal method _getEventParams in scope 'Display'", function(assert) {
		//Arrange
		var oParams;
		var oEvent = {
			target : {
				id : "dummy"
			}
		};

		//Act
		oParams = this.oGenericTile._getEventParams(oEvent);

		//Assert
		assert.equal(oParams.scope, GenericTileScope.Display, "Event parameter 'scope' is 'Display'");
		assert.equal(oParams.action, GenericTile._Action.Press, "Event parameter 'action' is 'Press'");
		assert.equal(oParams.domRef, this.oGenericTile.getDomRef(), "Event parameter 'domRef' points to GenericTile");
	});

	QUnit.test("Internal method _getEventParams in scope 'Actions', tap icon 'Remove'", function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		sap.ui.getCore().applyChanges();
		var oParams;
		var oEvent = {
			target : {
				id : "-action-remove"
			}
		};

		//Act
		oParams = this.oGenericTile._getEventParams(oEvent);

		//Assert
		assert.equal(oParams.scope, GenericTileScope.Actions, "Event parameter 'scope' is 'Actions'");
		assert.equal(oParams.action, GenericTile._Action.Remove, "Event parameter 'action' is 'Remove'");
		assert.equal(oParams.domRef, this.oGenericTile._oRemoveButton.getPopupAnchorDomRef(), "Event parameter 'domRef' points to Remove Button");
	});

	QUnit.test("Internal method _getEventParams in scope 'Actions', tap icon 'More'", function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		sap.ui.getCore().applyChanges();
		var oParams;
		var oEvent = {
			target : {
				id : "-action-more"
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
		beforeEach : function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				header : "header text of GenericTile",
				subheader : "subheader text of GenericTile",
				tileContent : [new TileContent("tile-cont-1"), new TileContent("tile-cont-2")]
			}).placeAt("qunit-fixture");
			// stub function _getAriaAndTooltipText of the content
			this.oGenericTile.getTileContent()[0]._getAriaAndTooltipText = function() {
				return "ARIA and tooltip text of TileContent 1";
			};
			// stub function _getAriaAndTooltipText of the content
			this.oGenericTile.getTileContent()[1]._getAriaAndTooltipText = function() {
				return "ARIA and tooltip text of TileContent 2";
			};
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
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

	QUnit.test("Internal method _getAriaAndTooltipText", function(assert) {
		//Arrange
		var sAriaAndTooltipText,
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
		sAriaAndTooltipText = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaAndTooltipText, "someTooltipText", "Expected text for ARIA-label and tooltip generated if an explicite tooltip is set");

		//Arrange - stubs GenericTile's functions, no store & restore needed on the instance level
		this.oGenericTile.getTooltip_AsString = function () {
			return "";
		};
		this.oGenericTile._isTooltipSuppressed = function () {
			return false;
		};
		this.oGenericTile._getHeaderAriaAndTooltipText = function () {
			return "";
		};
		this.oGenericTile._getContentAriaAndTooltipText = function () {
			return " ";
		};
		//Act
		sAriaAndTooltipText = this.oGenericTile._getAriaAndTooltipText();
		//Assert
		assert.equal(sAriaAndTooltipText, "", "Expected empty string for ARIA-label and tooltip generated");
	});

	QUnit.test("Internal method _getAriaText", function(assert) {
		//Arrange
		var sAriaText;
		// stub GenericTile's function _getAriaAndTooltipText
		this.oGenericTile._getAriaAndTooltipText = function() {
			return "ARIA and tooltip text";
		};
		//Act
		sAriaText = this.oGenericTile._getAriaText();
		//Assert
		assert.equal(sAriaText, "ARIA and tooltip text", "Expected text for ARIA-label generated if no tooltip set");
		//Act
		this.oGenericTile.setTooltip(" ");
		sAriaText = this.oGenericTile._getAriaText();
		//Assert
		assert.equal(sAriaText, "ARIA and tooltip text", "Expected text for ARIA-label generated in case tooltip is supressed");
		//Act
		this.oGenericTile.setTooltip("someTooltipText");
		sAriaText = this.oGenericTile._getAriaText();
		//Assert
		assert.equal(sAriaText, "someTooltipText", "Expected text for ARIA-label generated in case an explicite tooltip is set");
		//Act
		sAriaText = this.oGenericTile._getAriaText();
		this.oGenericTile.setProperty("ariaLabel", "additional aria text");
		//Assert
		assert.equal(this.oGenericTile._getAriaText(), "additional aria text " + sAriaText, "Value of ariaLabel property has been appended to resulting aria-label.");
	});

	QUnit.test("Internal method _getAriaText for actions scope", function(assert) {
		//Arrange
		this.oGenericTile.setScope("Actions");
		this.oGenericTile._getAriaAndTooltipText = function() {
			return "ARIA and tooltip test";
		};
		sap.ui.getCore().applyChanges();
		//Act
		var sAriaText = this.oGenericTile._getAriaText();
		var sActionsText = this.oGenericTile._oRb.getText("GENERICTILE_ACTIONS_ARIA_TEXT");
		//Assert
		assert.equal(sAriaText, sActionsText + " ARIA and tooltip test", "Expected text for ARIA-label generated for actions scope");
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
		beforeEach : function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				subheader : "Expenses By Region",
				frameType : FrameType.OneByOne,
				header : "Comparative Annual Totals",
				tileContent : new TileContent("tile-cont", {
					unit : "EUR",
					footer : "Current Quarter",
					content : new NumericContent("numeric-cnt", {
						state : LoadState.Loaded,
						scale : "M",
						indicator : DeviationIndicator.Up,
						truncateValueTo : 4,
						value : 20,
						nullifyValue : true,
						formatterValue : false,
						valueColor : ValueColor.Good,
						icon : "sap-icon://customer-financial-fact-sheet"
					})
				})
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
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

	QUnit.test("Explicit text for Failed state set by user", function(assert) {
		//Arrange
		this.oGenericTile.setFailedText("explicitFailedText");
		this.oGenericTile.setState(LoadState.Failed);
		sap.ui.getCore().applyChanges();
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
		beforeEach : function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				header : "Header text",
				subheader : "subheader text",
				tileContent : [new TileContent("tile-cont-1"), new TileContent("tile-cont-2")]
			}).placeAt("qunit-fixture");
			// stub function _getAriaAndTooltipText of the content
			this.oGenericTile.getTileContent()[0]._getAriaAndTooltipText = function() {
				return "ARIA and tooltip text of TileContent 1";
			};
			// stub function _getAriaAndTooltipText of the content
			this.oGenericTile.getTileContent()[1]._getAriaAndTooltipText = function() {
				return "ARIA and tooltip text of TileContent 2";
			};
			sap.ui.getCore().applyChanges();
		},
		afterEach : function(assert) {
			this.oGenericTile.destroy();
			this.oGenericTile = null;

			var done = assert.async();
			jQuery.sap.delayedCall(0, this, done); // needed to slow down until the tile is rendered
		}
	});

	QUnit.test("GenericTile tooltip provided by the control", function(assert) {
		//Arrange
		this.oGenericTile.$().trigger("mouseenter");
		var sAriaLabel = "Header text\nsubheader text\nARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2";
		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		var sGenericTileAriaLabel = this.oGenericTile.$()[0].getAttribute("aria-label");
		//Assert
		assert.equal(sGenericTileTooltip, "Header text\nsubheader text", "ToolTip with Header+SubHeader no content data");
		assert.equal(sGenericTileAriaLabel, sAriaLabel, "Tooltip of GenericTile is identical with ARIA-label");
	});

	QUnit.test("Explicit tooltip set by user with short header text, short subheader text", function(assert) {
		//Arrange
		this.oGenericTile.setTooltip("tooltip");
		sap.ui.getCore().applyChanges();
		this.oGenericTile.$().trigger("mouseenter");
		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		var sGenericTileAriaLabel = this.oGenericTile.$()[0].getAttribute("aria-label");
		//Assert
		assert.equal(sGenericTileTooltip, "tooltip", "Explicit tooltip of GenericTile is consistent");
		assert.equal(sGenericTileAriaLabel,sGenericTileAriaLabel, "Explicit tooltip of GenericTile is identical with ARIA-label");
	});

	QUnit.test("Explicit tooltip set by user with long header text, long subheader text", function(assert) {
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile.setSubheader("A long long subheader text");
		this.oGenericTile.setTooltip("tooltip");
		sap.ui.getCore().applyChanges();
		this.oGenericTile.$().trigger("mouseenter");
		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		//Assert
		assert.equal(sGenericTileTooltip, "tooltip", "User tooltip overwrites the header and subheader text");
	});

	QUnit.test("Suppress tooltip with space tooltip set by user with short header text, short subheader text", function(assert) {
		//Arrange
		this.oGenericTile.setTooltip(" ");
		sap.ui.getCore().applyChanges();
		this.oGenericTile.$().trigger("mouseenter");
		var sConsistentTooltip = "Header text\nsubheader text\nARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2";
		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		var sGenericTileAriaLabel = this.oGenericTile.$()[0].getAttribute("aria-label");
		//Assert
		assert.equal(sGenericTileTooltip, null, "GenericTile rendered without tooltip");
		assert.equal(sGenericTileAriaLabel, sConsistentTooltip, "GenericTile has correct ARIA-label");
	});

	QUnit.test("Suppress tooltip with space tooltip set by user with long header text, long subheader text", function(assert) {
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile.setSubheader("A long long subheader text");
		this.oGenericTile.setTooltip(" ");
		sap.ui.getCore().applyChanges();
		this.oGenericTile.$().trigger("mouseenter");
		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		//Assert
		assert.equal(sGenericTileTooltip, null, "GenericTile rendered without tooltip");
	});

	QUnit.test("Tooltip for GenericTile with long Header-subheader text and Tilecontent", function(assert) {
		//Arrange
        this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile.setSubheader("A long long subheader text");
        this.oGenericTile.getTileContent()[0].setFooter("Tile Footer");
        this.oGenericTile.getTileContent()[0].setUnit("Tile Unit");
		sap.ui.getCore().applyChanges();
		this.oGenericTile.$().trigger("mouseenter");
		//Act
		var sGenericTileTooltip = this.oGenericTile.$()[0].getAttribute("title");
		//Assert
		assert.equal(sGenericTileTooltip, "A long long long long long long long long long long header text\nA long long subheader text\nTile Unit\nTile Footer", "Generic Tile tooltip with Header SubHeader and TileContent");
	});

	QUnit.test("Tooltip is removed when mouse leaves the GenericTile", function(assert) {
		//Arrange
		var $Tile = this.oGenericTile.$();
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		sap.ui.getCore().applyChanges();
		$Tile.trigger("mouseenter");
		$Tile.trigger("mouseleave");
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
		beforeEach : function() {
			sinon.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile("generic-tile", {
				header : "header",
				subheader : "subheader",
				mode: GenericTileMode.LineMode,
				tileContent : [new TileContent("tile-cont-1"), new TileContent("tile-cont-2")]
			});

			jQuery("html").addClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			sinon.stub(this.oGenericTile, "_isScreenLarge").returns(true);

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
				content: [ this.oGenericTile ]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			Device.media.attachHandler.restore();
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
			this.oParent.destroy();
			this.oParent = null;
		}
	});

	QUnit.test("GenericTile tooltip provided by the control", function(assert) {
		//Arrange
		var sAriaLabel = "header\nsubheader\nARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2";

		//Act
		this.oGenericTile.$().trigger("mouseenter");

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "header\nsubheader", "GenericTile tooltip");
		assert.equal(this.oGenericTile.$().attr("aria-label"), sAriaLabel, "GenericTile has correct ARIA-label");
	});

	QUnit.test("GenericTile tooltip provided by the control when TileContent is available", function(assert) {
        //Arrange
        var sAriaLabel = "header\nsubheader\nARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2";
        this.oGenericTile.getTileContent()[0].setFooter("Tile Footer");
        this.oGenericTile.getTileContent()[0].setUnit("Tile Unit");

        //Act
        this.oGenericTile.$().trigger("mouseenter");

        //Assert
        assert.equal(this.oGenericTile.$().attr("title"), "header\nsubheader", "In LineMode only Header-SubHeader considered and TileContent omitted from tooltip");
        assert.equal(this.oGenericTile.$().attr("aria-label"), sAriaLabel, "GenericTile has correct ARIA-label");
    });

	QUnit.test("Explicit tooltip set by user with short header text, short subheader text", function(assert) {
		//Arrange
		this.oGenericTile.setTooltip("tooltip");
		sap.ui.getCore().applyChanges();

		//Act
		this.oGenericTile.$().trigger("mouseenter");

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "tooltip", "Explicit tooltip of GenericTile is consistent");
		assert.equal(this.oGenericTile.$().attr("aria-label"), this.oGenericTile.$().attr("title"), "Explicit tooltip of GenericTile is identical with ARIA-label");
	});

	QUnit.test("Explicit tooltip set by user with long header text, long subheader text", function(assert) {
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile.setSubheader("A long long subheader text");
		this.oGenericTile.setTooltip("tooltip");
		sap.ui.getCore().applyChanges();

		//Act
		this.oGenericTile.$().trigger("mouseenter");

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "tooltip", "User tooltip overwrites the header and subheader texts");
		assert.equal(this.oGenericTile.$().attr("aria-label"), this.oGenericTile.$().attr("title"), "Explicit tooltip of GenericTile is identical with ARIA-label");
	});

	QUnit.test("Suppress tooltip with space tooltip set by user with short header text, short subheader text", function(assert) {
		//Arrange
		var sAriaLabel = "header\nsubheader\nARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2";
		this.oGenericTile.setTooltip(" ");
		sap.ui.getCore().applyChanges();

		//Act
		this.oGenericTile.$().trigger("mouseenter");

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), null, "GenericTile rendered without tooltip");
		assert.equal(this.oGenericTile.$().attr("aria-label"), sAriaLabel, "GenericTile has correct ARIA-label");
	});

	QUnit.test("Suppress tooltip with space tooltip set by user with long header text, long subheader text", function(assert) {
		//Arrange
		var sAriaLabel = "A long long long long long long long long long long header text\nA long long subheader text\nARIA and tooltip text of TileContent 1\nARIA and tooltip text of TileContent 2";
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile.setSubheader("A long long subheader text");
		this.oGenericTile.setTooltip(" ");
		sap.ui.getCore().applyChanges();

		//Act
		this.oGenericTile.$().trigger("mouseenter");

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), null, "GenericTile rendered without tooltip");
		assert.equal(this.oGenericTile.$().attr("aria-label"), sAriaLabel, "GenericTile has correct ARIA-label");
	});

	QUnit.test("Truncated header text tooltip is removed when mouse leaves the GenericTile", function(assert) {
		//Arrange
		var $Tile = this.oGenericTile.$();
		this.oGenericTile.setHeader("A long long long long long long long long long long");

		//Act
		$Tile.trigger("mouseenter");
		$Tile.trigger("mouseleave");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(null, this.oGenericTile.$().attr("title"), "Truncated text tooltip is removed");
	});

	QUnit.module("Tooltip handling in LineMode (small screens)", {
		beforeEach : function() {
			sinon.stub(Device.media, "attachHandler");
			this.oGenericTile = new GenericTile("generic-tile", {
				header : "header",
				subheader : "subheader",
				mode: GenericTileMode.LineMode,
				tileContent : [new TileContent("tile-cont-1"), new TileContent("tile-cont-2")]
			});

			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").addClass("sapUiMedia-GenericTileDeviceSet-small");
			sinon.stub(this.oGenericTile, "_isScreenLarge").returns(false);

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
				content: [ this.oGenericTile ]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			Device.media.attachHandler.restore();
			jQuery("html").removeClass("sapUiMedia-GenericTileDeviceSet-large").removeClass("sapUiMedia-GenericTileDeviceSet-small");
			this.oGenericTile.destroy();
			this.oGenericTile = null;
			this.oParent.destroy();
			this.oParent = null;
		}
	});
	QUnit.test("Tooltip for GenericTile with short header text and long subheader text", function(assert) {
		if (Device.browser.phantomJS) {
			assert.expect(0);
			return;
		}
		//Arrange
		this.oGenericTile.setSubheader("A long long subheader text");
		sap.ui.getCore().applyChanges();

		//Act
		this.oGenericTile.$().trigger("mouseenter");

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "header\nA long long subheader text", "Tooltip both Shot Header and Long SubHeader");
	});

	QUnit.test("Tooltip for GenericTile with long header text truncated, short subheader text", function(assert) {
		if (Device.browser.phantomJS) {
			assert.expect(0);
			return;
		}
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile._oTitle.invalidate(); // needs to invalidate since the sap.m.Text doesn't invalidate (on purpose)
		sap.ui.getCore().applyChanges();

		//Act
		this.oGenericTile.$().trigger("mouseenter");

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "A long long long long long long long long long long header text\nsubheader", "Tooltip both Long Header and short SubHeader");
	});

	QUnit.test("Tooltip for GenericTile with long header text and long subheader text truncated", function(assert) {
		if (Device.browser.phantomJS) {
			assert.expect(0);
			return;
		}
		//Arrange
		this.oGenericTile.setHeader("A long long long long long long long long long long header text");
		this.oGenericTile.setSubheader("A long long subheader text");
		sap.ui.getCore().applyChanges();

		//Act
		this.oGenericTile.$().trigger("mouseenter");

		//Assert
		assert.equal(this.oGenericTile.$().attr("title"), "A long long long long long long long long long long header text\nA long long subheader text", "Truncated texts for header and for subheader have tooltips");
	});

	QUnit.test("Truncated header text tooltip is removed when mouse leaves the GenericTile", function(assert) {
		if (Device.browser.phantomJS) {
			assert.expect(0);
			return;
		}
		//Arrange
		var $Tile = this.oGenericTile.$();
		this.oGenericTile.setHeader("A long long long long long long long long long long");

		//Act
		$Tile.trigger("mouseenter");
		$Tile.trigger("mouseleave");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(null, this.oGenericTile.$().attr("title"), "Truncated text tooltip is removed");
	});

	QUnit.test("GenericTile tooltip provided by the control when TileContent is available", function(assert) {
        if (Device.browser.phantomJS) {
            assert.expect(0);
            return;
        }
        //Arrange
        this.oGenericTile.getTileContent()[0].setFooter("Tile Footer");
        this.oGenericTile.getTileContent()[0].setUnit("Tile Unit");

        //Act
        this.oGenericTile.$().trigger("mouseenter");

        //Assert
        assert.equal(this.oGenericTile.$().attr("title"), "header\nsubheader", "In LineMode only Header-SubHeader considered and TileContent omitted from tooltip");
    });

	QUnit.module("Tooltip handling on content elements", {
		beforeEach : function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				header : "header text of GenericTile",
				subheader : "subheader text of GenericTile",
				tileContent : [new TileContent("tile-cont-1", {
					tooltip : "tooltip of TileContent 1"
				}), new TileContent("tile-cont-2", {
					tooltip : "tooltip of TileContent 2",
					content : new NumericContent("numeric-content")})]
			}).placeAt("qunit-fixture");
			// stub function _getAriaAndTooltipText of the NumericContent
			this.oGenericTile.getTileContent()[1].getContent()._getAriaAndTooltipText = function () {
				return "ARIA and tooltip text of NumericContent";
			};
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Actions scope - title attribute of Remove button in LineMode", function(assert) {
		//Arrange
		this.oGenericTile.setMode(GenericTileMode.LineMode);
		this.oGenericTile.setScope(GenericTileScope.Actions);
		sap.ui.getCore().applyChanges();

		//Act
		jQuery.sap.byId("remove").trigger("mouseenter");
		var sTitleOfRemove = this.oGenericTile.$("action-remove").attr("title");

		//Assert
		assert.ok(sTitleOfRemove, "Remove button contains expected attribute title");
	});

	QUnit.test("TileContent content doesn't contain attributes ARIA-label and title", function(assert) {
		//Arrange
		jQuery.sap.byId("tile-cont-1").trigger("mouseenter");
		jQuery.sap.byId("tile-cont-2").trigger("mouseenter");
		//Act
		var sAriaLabelOfContent1 = jQuery.sap.byId("tile-cont-1").attr("aria-label");
		var sTitleOfTileContent1 = jQuery.sap.byId("tile-cont-1").attr("title");
		var sAriaLabelOfContent2 = jQuery.sap.byId("tile-cont-2").attr("aria-label");
		var sTitleOfTileContent2 = jQuery.sap.byId("tile-cont-2").attr("title");
		//Assert
		assert.ok(!sAriaLabelOfContent1,"GenericTile 1 doesn't contain attribute aria-label");
		assert.ok(!sTitleOfTileContent1,"GenericTile 1 doesn't contain attribute title");
		assert.ok(!sAriaLabelOfContent2,"GenericTile 1 doesn't contain attribute aria-label");
		assert.ok(!sTitleOfTileContent2,"GenericTile 1 doesn't contain attribute title");
	});

	QUnit.test("NumericContent doesn't contain attributes ARIA-label and title", function(assert) {
		//Arrange
		jQuery.sap.byId("numeric-content").trigger("mouseover");
		//Act
		var sAriaLabelOfNumericContent = jQuery.sap.byId("numeric-content").attr("aria-label");
		var sTitleOfNumericContent = jQuery.sap.byId("numeric-content").attr("title");
		//Assert
		assert.ok(!sAriaLabelOfNumericContent,"NumericContent doesn't contain attribute ARIA-label");
		assert.ok(!sTitleOfNumericContent,"NumericContent doesn't contain attribute title");
	});

	QUnit.module("Tooltip handling if content elements changed", {
		beforeEach : function() {
			this.oGenericTile = new GenericTile("generic-tile", {
				header : "header text of GenericTile",
				subheader : "subheader text of GenericTile",
				tileContent : [
					new TileContent("tile-cont-1", {
						content: new NumericContent("numeric-content", {
							value: 111
						})
					})
				]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
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
		assert.equal(sAriaLabelOfGenericTile,sAriaLabelOfGenericTile ,"GenericTile has correct ARIA-label attribute before content changed");

		//Arrange
		this.oGenericTile.getTileContent()[0].getContent().setValue("999");
		$Tile.trigger("mouseenter");
		//Act
		var sAriaLabelOfNumericContent = jQuery.sap.byId("numeric-content").attr("aria-label");
		var sTitleOfNumericContent = jQuery.sap.byId("numeric-content").attr("title");
		//Assert
		assert.ok(!sAriaLabelOfNumericContent, "NumericContent doesn't contain ARIA-label attribute after content changed");
		assert.ok(!sTitleOfNumericContent, "NumericContent doesn't contain title attribute after content changed");
	});

	QUnit.module("Event Tests", {
		beforeEach : function() {
			this.ftnPressHandler = function() {
			};
			this.hasAttribute = function(sAttribute, oCurrentObject) {
				var sAttributeValue = oCurrentObject.$().attr(sAttribute);
				if (typeof sAttributeValue !== typeof undefined && sAttributeValue !== false) {
					return true;
				} else {
					return false;
				}
			};
			this.oGenericTile = new GenericTile("generic-tile", {
				subheader : "Expenses By Region",
				frameType : FrameType.OneByOne,
				header : "Comparative Annual Totals",
				headerImage : IMAGE_PATH + "female_BaySu.jpg",
				tileContent : new TileContent("tile-cont", {
					unit : "EUR",
					footer : "Current Quarter",
					content : new NumericContent("numeric-cnt", {
						state : LoadState.Loaded,
						scale : "M",
						indicator : DeviationIndicator.Up,
						truncateValueTo : 4,
						value : 20,
						nullifyValue : true,
						formatterValue : false,
						valueColor : ValueColor.Good,
						icon : "sap-icon://customer-financial-fact-sheet"
					})
				})
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			sinon.spy(this, "ftnPressHandler");
		},
		afterEach : function() {
			this.ftnPressHandler.restore();
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("No press event test", function(assert) {
		//Arrange
		//Act
		this.oGenericTile.$().trigger('tap');

		//Assert
		assert.equal(this.hasAttribute("tabindex", this.oGenericTile), true, "GenericTile can have focus no matter it has press event or not");
		assert.equal(this.oGenericTile.$().hasClass("sapMPointer"), true, "GenericTile can have hand pointer no matter it has press event or not");
	});

	QUnit.test("No press event when press event disabled", function(assert) {
		//Arrange
		var bEventNotTriggered = true;
		this.oGenericTile.attachEvent("press", handlePress);
		this.oGenericTile.setPressEnabled(false);

		//Act
		this.oGenericTile.$().trigger('tap');

		//Assert
		function handlePress(oEvent) {
			bEventNotTriggered = false;
		}
		assert.ok(bEventNotTriggered, "Press event of GenericTile is not triggered on mouse click.");
	});

	QUnit.test("Press event on 'tap' with correct parameters in Display scope", function(assert) {
		//Arrange
		this.oGenericTile.attachEvent("press", handlePress);

		//Act
		this.oGenericTile.$().trigger('tap');

		//Assert
		function handlePress(oEvent) {
			assert.equal(oEvent.getParameter("scope"), GenericTileScope.Display, "Press event has correct parameter 'scope'");
			assert.equal(oEvent.getParameter("action"), GenericTile._Action.Press, "Press event has correct parameter 'action'");
		}
	});

	QUnit.test("Press event on 'tap' with correct parameters in Actions scope", function(assert) {
		//Arrange
		var oGenericTile = this.oGenericTile;
		this.oGenericTile.setScope(GenericTileScope.Actions);
		sap.ui.getCore().applyChanges();
		this.oGenericTile.attachEvent("press", handlePress);

		//Act
		this.oGenericTile.$().trigger('tap');

		//Assert
		function handlePress(oEvent) {
			assert.equal(oEvent.getParameter("scope"), GenericTileScope.Actions, "Press event has correct parameter 'scope'");
			assert.equal(oEvent.getParameter("action"), GenericTile._Action.Press, "Press event has correct parameter 'action'");
			assert.equal(oEvent.getParameter("domRef"), oGenericTile._oMoreIcon.getDomRef(), "Event parameter 'domRef' points to More Icon");
		}
	});

	QUnit.test("ENTER key down event in Display scope", function(assert) {
		//Arrange
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var e = jQuery.Event('keydown');
		e.keyCode = jQuery.sap.KeyCodes.ENTER;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(this.ftnPressHandler.notCalled, "Press event is not triggered on ENTER down");
	});

	QUnit.test("ENTER key event in Display scope", function(assert) {
		//Arrange
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var e = jQuery.Event('keyup');
		e.keyCode = jQuery.sap.KeyCodes.ENTER;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered on ENTER up");
	});

	QUnit.test("ENTER key event in Actions scope", function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		sap.ui.getCore().applyChanges();
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var e = jQuery.Event('keyup');
		e.keyCode = jQuery.sap.KeyCodes.ENTER;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered on ENTER up");
	});

	QUnit.test("SPACE key event in Display scope", function(assert) {
		//Arrange
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var e = jQuery.Event('keyup');
		e.keyCode = jQuery.sap.KeyCodes.SPACE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered on SPACE up");
	});

	QUnit.test("SPACE key event in Display scope with correct parameters", function(assert) {
		//Arrange
		var oGenericTile = this.oGenericTile;
		this.oGenericTile.setScope(GenericTileScope.Display);
		sap.ui.getCore().applyChanges();
		this.oGenericTile.attachEvent("press", handlePress);
		var e = jQuery.Event('keyup');
		e.keyCode = jQuery.sap.KeyCodes.SPACE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		function handlePress(oEvent) {
			assert.equal(oEvent.getParameter("scope"), GenericTileScope.Display, "Press event has correct parameter 'scope'");
			assert.equal(oEvent.getParameter("action"), GenericTile._Action.Press, "Press event has correct parameter 'action'");
			assert.equal(oEvent.getParameter("domRef"), oGenericTile.getDomRef(), "Event parameter 'domRef' points to GenericTile");
		}
	});

	QUnit.test("SPACE key event in Actions scope", function(assert) {
		//Arrange
		this.oGenericTile.setScope(GenericTileScope.Actions);
		sap.ui.getCore().applyChanges();
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var e = jQuery.Event('keyup');
		e.keyCode = jQuery.sap.KeyCodes.SPACE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered on SPACE up");
	});

	QUnit.test("SPACE key event in Actions scope with correct parameters", function(assert) {
		//Arrange
		var oGenericTile = this.oGenericTile;
		this.oGenericTile.setScope(GenericTileScope.Actions);
		sap.ui.getCore().applyChanges();
		this.oGenericTile.attachEvent("press", handlePress);
		var e = jQuery.Event('keyup');
		e.keyCode = jQuery.sap.KeyCodes.SPACE;

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
		var e = jQuery.Event('keyup');
		e.keyCode = jQuery.sap.KeyCodes.DELETE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(!this.ftnPressHandler.called, "No press event is triggered on DELETE up");
	});

	QUnit.test("BACKSPACE key event in Display scope", function(assert) {
		//Arrange
		this.oGenericTile.attachEvent("press", this.ftnPressHandler);
		var e = jQuery.Event('keyup');
		e.keyCode = jQuery.sap.KeyCodes.BACKSPACE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		assert.ok(!this.ftnPressHandler.called, "No press event is triggered on BACKSPACE up");
	});

	QUnit.test("DELETE key event in Actions scope with correct parameters", function(assert) {
		//Arrange
		var oGenericTile = this.oGenericTile;
		this.oGenericTile.setScope(GenericTileScope.Actions);
		sap.ui.getCore().applyChanges();
		this.oGenericTile.attachEvent("press", handlePress);
		var e = jQuery.Event('keyup');
		e.keyCode = jQuery.sap.KeyCodes.DELETE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		function handlePress(oEvent) {
			assert.equal(oEvent.getParameter("scope"), GenericTileScope.Actions, "Press event has correct parameter 'scope'");
			assert.equal(oEvent.getParameter("action"), GenericTile._Action.Remove, "Press event has correct parameter 'action'");
			assert.equal(oEvent.getParameter("domRef"), oGenericTile._oRemoveButton.getPopupAnchorDomRef(), "Event parameter 'domRef' points to Remove Button");
		}
	});

	QUnit.test("BACKSPACE key event in Actions scope with correct parameters", function(assert) {
		//Arrange
		var oGenericTile = this.oGenericTile;
		this.oGenericTile.setScope(GenericTileScope.Actions);
		sap.ui.getCore().applyChanges();
		this.oGenericTile.attachEvent("press", handlePress);
		var e = jQuery.Event('keyup');
		e.keyCode = jQuery.sap.KeyCodes.BACKSPACE;

		//Act
		this.oGenericTile.$().trigger(e);

		//Assert
		function handlePress(oEvent) {
			assert.equal(oEvent.getParameter("scope"), GenericTileScope.Actions, "Press event has scope arameter 'Actions'");
			assert.equal(oEvent.getParameter("action"), GenericTile._Action.Remove, "Press event has action parameter 'Remove'");
			assert.equal(oEvent.getParameter("domRef"), oGenericTile._oRemoveButton.getPopupAnchorDomRef(), "Event parameter 'domRef' points to Remove Button");
		}
	});
});