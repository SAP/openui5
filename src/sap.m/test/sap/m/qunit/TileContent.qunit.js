/*global QUnit */
sap.ui.define([
	"sap/m/TileContent",
	"sap/m/NewsContent",
	"sap/m/FeedContent",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/core/Core"
], function(TileContent, NewsContent, FeedContent, Text, library, oCore) {
	"use strict";


	// shortcut for sap.m.ValueColor
	var ValueColor = library.ValueColor;


	QUnit.module("Default Values", {
		beforeEach : function() {
			this.oTileContent = new TileContent();
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oTileContent.destroy();
		}
	});

	/**
	 * @deprecated Since version 1.38.0.
	 */
	QUnit.test("Property 'size'", function(assert) {
		assert.equal(this.oTileContent.getSize(), "Auto", "Property 'size' default value is correct.");
	});

	QUnit.test("Property 'footer'", function(assert) {
		assert.equal(this.oTileContent.getFooter(), "", "Property 'footer' default value is correct.");
	});

	QUnit.test("Property 'footerColor'", function(assert) {
		assert.equal(this.oTileContent.getFooterColor(), "Neutral", "Property 'footerColor' default value is correct.");
	});

	QUnit.test("Property 'unit'", function(assert) {
		assert.equal(this.oTileContent.getUnit(), "", "Property 'unit' default value is correct.");
	});

	QUnit.test("Property 'disabled'", function(assert) {
		assert.equal(this.oTileContent.getDisabled(), false, "Property 'disabled' default value is correct.");
	});

	QUnit.test("Property 'frameType'", function(assert) {
		assert.equal(this.oTileContent.getFrameType(), "Auto", "Property 'frameType' default value is correct.");
	});

	/**
	 * @deprecated Since version 1.38.0.
	 */
	QUnit.module("Rendering", {
		beforeEach : function() {
			this.oNewsTileContent = new TileContent("tc1", {
				footer : "Current Quarter",
				unit : "EUR",
				size : "Auto",
				content : new NewsContent("news", {
					size : "Auto",
					contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
					subheader : "SAP News"
				})
			});
			this.oNewsTileContent.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oNewsTileContent.destroy();
		}
	});

	QUnit.test("DOM structure created", function(assert) {
		assert.equal(this.oNewsTileContent._getContentType(), "News", "Type was get successfully");
		assert.ok(document.getElementById("tc1"), "TileContent1 was rendered successfully");
		assert.ok(document.getElementById("news"), "News content was rendered successfully");
		assert.ok(document.getElementById("tc1-footer-text"), "TileContent1 footer was rendered successfully");
	});

	QUnit.module("Rendering of colored footer", {
		beforeEach : function() {
			this.oTileContent = new TileContent();
			this.oTileContent.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oTileContent.destroy();
		}
	});

	QUnit.test("Neutral CSS Class added", function(assert) {
		assert.ok(this.oTileContent.$("footer-text").hasClass("sapMTileCntFooterTextColorNeutral"), "Correct CSS class added");
	});

	QUnit.test("Critical CSS Class added", function(assert) {
		//Act
		this.oTileContent.setFooterColor(ValueColor.Critical);
		oCore.applyChanges();
		//Assert
		assert.ok(this.oTileContent.$("footer-text").hasClass("sapMTileCntFooterTextColorCritical"), "Correct CSS class added");
	});

	QUnit.test("Error CSS Class added", function(assert) {
		//Act
		this.oTileContent.setFooterColor(ValueColor.Error);
		oCore.applyChanges();
		//Assert
		assert.ok(this.oTileContent.$("footer-text").hasClass("sapMTileCntFooterTextColorError"), "Correct CSS class added");
	});

	QUnit.test("Good CSS Class added", function(assert) {
		//Act
		this.oTileContent.setFooterColor(ValueColor.Good);
		oCore.applyChanges();
		//Assert
		assert.ok(this.oTileContent.$("footer-text").hasClass("sapMTileCntFooterTextColorGood"), "Correct CSS class added");
	});

	/**
	 * @deprecated Since version 1.38.0.
	 */
	QUnit.module("Functional test", {
		beforeEach : function() {
			this.oFeedTileContent = new TileContent("tc2", {
				footer : "Current Quarter",
				unit : "EUR",
				size : "Auto",
				content : new FeedContent("feed", {
					size : "Auto",
					contentText : "@@notify Great outcome of the Presentation today. The new functionality and the design was well received. Berlin, Tokyo, Rome, Budapest, New York, Munich, London",
					subheader : "about 1 minute ago in Computer Market",
					value : "7"
				})
			});
			this.oFeedTileContent.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oFeedTileContent.destroy();
		}
	});

	QUnit.test("Getting content type.", function(assert) {
		assert.ok(document.getElementById("tc2"), "TileContent2 was rendered successfully");
		assert.ok(document.getElementById("feed"), "Feed content was rendered successfully");
		assert.ok(document.getElementById("tc2-footer-text"), "TileContent2 footer was rendered successfully");
		assert.equal(this.oFeedTileContent._getContentType(), undefined, "Type was get successfully");
	});

	QUnit.module("Protected property bRenderFooter", {
		beforeEach : function() {
			this.oTileContent = new TileContent("tileContent", {
				footer : "Current Quarter",
				unit : "EUR"
			}).placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oTileContent.destroy();
		}
	});

	QUnit.test("Default value of _bRenderFooter", function(assert) {
		assert.equal(this.oTileContent._bRenderFooter, true, "Default value of _bRenderFooter is correct.");
	});

	QUnit.test("Function setRenderFooter changes value and returns this", function(assert) {
		//Arrange
		var oReturnValue;

		//Act
		oReturnValue = this.oTileContent.setRenderFooter(false);

		//Assert
		assert.equal(this.oTileContent._bRenderFooter, false, "_bRenderFooter has been correctly updated.");
		assert.deepEqual(oReturnValue, this.oTileContent,  "Function setRenderFooter has returned a reference to the Tile Content.");
	});

	QUnit.test("Function setRenderFooter does not mark the control as invalidated", function(assert) {
		//Arrange
		this.spy(this.oTileContent, "invalidate");

		//Act
		this.oTileContent.setRenderFooter(false);

		//Assert
		assert.equal(this.oTileContent.invalidate.callCount, 0, "The control has not been invalidated.");
	});

	QUnit.test("Footer is not rendered in case _bRenderFooter is false", function(assert) {
		//Arrange
		this.oTileContent.setRenderFooter(false);

		//Act
		this.oTileContent.invalidate();
		oCore.applyChanges();

		//Assert
		assert.ok(!document.getElementById("tileContent-footer-text"), "No footer has been rendered.");
	});

	QUnit.module("Protected property _bRenderContent", {
		beforeEach : function() {
			this.oTileContent = new TileContent("tileContent", {
				content: new Text()
			}).placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oTileContent.destroy();
		}
	});

	QUnit.test("Default value of _bRenderContent", function(assert) {
		assert.equal(this.oTileContent._bRenderContent, true, "Default value of _bRenderContent is correct.");
	});

	QUnit.test("Function setRenderContent changes value and returns this", function(assert) {
		//Arrange
		var oReturnValue;

		//Act
		oReturnValue = this.oTileContent.setRenderContent(false);

		//Assert
		assert.equal(this.oTileContent._bRenderContent, false, "_bRenderContent has been correctly updated.");
		assert.deepEqual(oReturnValue, this.oTileContent, "Function setRenderContent has returned a reference to the Tile Content.");
	});

	QUnit.test("Function setRenderContent does not mark the control as invalidated", function(assert) {
		//Arrange
		this.spy(this.oTileContent, "invalidate");

		//Act
		this.oTileContent.setRenderContent(false);

		//Assert
		assert.equal(this.oTileContent.invalidate.callCount, 0, "The control has not been invalidated.");
	});

	QUnit.test("Content is not rendered in case _bRenderContent is false", function(assert) {
		//Arrange
		this.oTileContent.setRenderContent(false);

		//Act
		this.oTileContent.invalidate();
		oCore.applyChanges();

		//Assert
		assert.ok(!document.getElementById("tileContent-content"), "No content has been rendered.");
	});

	QUnit.module("testing tooltip", {
		afterEach : function() {
			this.oTileContent.destroy();
		}
	});

	/**
	 * @deprecated Since version 1.38.0.
	 */
	QUnit.test("when both content and tile have tooltip", function(assert) {
		this.oTileContent =  new TileContent("tileContent", {
			size : "Auto",
			content : new FeedContent({
				size : "Auto",
				contentText : "content"
			}),
			tooltip: "fulltile"
		});
		this.oTileContent.placeAt("qunit-fixture");
		oCore.applyChanges();
		var tooltip = "fulltile" + "\n" + "content " + "\n";
		//Assert
		assert.equal(document.getElementById("tileContent").title,tooltip);
	});

	/**
	 * @deprecated Since version 1.38.0.
	 */
	QUnit.test("when only content has tooltip", function(assert) {
		this.oTileContent =  new TileContent("tileContent1", {
			size : "Auto",
			content : new FeedContent("feeditem", {
				size : "Auto",
				contentText : "content"
			})
		});
		this.oTileContent.placeAt("qunit-fixture");
		oCore.applyChanges();
		//Assert
		assert.equal(document.getElementById("tileContent1").title,"content " + "\n");
	});

	/**
	 * @deprecated Since version 1.38.0.
	 */
	QUnit.test("when only tile has tooltip", function(assert) {
		this.oTileContent =  new TileContent("tileContent2", {
			content : new FeedContent("feed2", {
				size : "Auto"
			}),
			tooltip: "fulltile"
		});
		this.oTileContent.placeAt("qunit-fixture");
		oCore.applyChanges();
		//Assert
		assert.equal(document.getElementById("tileContent2").title,"fulltile");
	});

});