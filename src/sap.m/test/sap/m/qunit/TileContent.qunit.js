/*global QUnit */
sap.ui.define([
	"sap/m/TileContent",
	"sap/m/NewsContent",
	"sap/m/FeedContent",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/NumericContent",
	"sap/m/GenericTile"
], function(TileContent, NewsContent, FeedContent, Text, library, nextUIUpdate, NumericContent, GenericTile ) {
	"use strict";


	// shortcut for sap.m.ValueColor
	var ValueColor = library.ValueColor;


	QUnit.module("Default Values", {
		beforeEach : async function() {
			this.oTileContent = new TileContent();
			await nextUIUpdate();
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

	QUnit.module("TileContent Inside GenericTile",{
		beforeEach : async function(){
			this.tileContent = new TileContent({
				content: new NumericContent({
					icon: "sap-icon://world",
					truncateValueTo: 5,
					value: "0",
					width: "100%",
					withMargin: false
				})
			});

			this.tile = new GenericTile({
			header: "Manage my Timesheet",
			systemInfo: "S/4HANA Cloud",
			sizeBehavior: "Responsive",
			wrappingType: "Hyphenated",
			additionalTooltip: "S/4HANA Cloud",
			tileContent: this.tileContent
			});
			//window.setTimeout(function () {this.tileContent.setFooter("Hours Missing")}, 1000);
			this.tile.placeAt("qunit-fixture");
			this.tileContent.setFooter("Hours Missing");
			await nextUIUpdate();

		},

		afterEach : function(){
			this.tile.destroy();
		}
	});

	QUnit.test("Footer property changes the GenericTile CSS class after explicitly being changed later", function(assert){
		assert.equal(this.tile.getDomRef("content").classList[1], "appInfoWithFooter", "The CSS class is applied properly");
	});

	/**
	 * @deprecated Since version 1.38.0.
	 */
	QUnit.module("Rendering", {
		beforeEach : async function() {
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
			await nextUIUpdate();
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
		beforeEach : async function() {
			this.oTileContent = new TileContent();
			this.oTileContent.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oTileContent.destroy();
		}
	});

	QUnit.test("Neutral CSS Class added", function(assert) {
		assert.ok(this.oTileContent.$("footer-text").hasClass("sapMTileCntFooterTextColorNeutral"), "Correct CSS class added");
	});

	QUnit.test("Critical CSS Class added", async function(assert) {
		//Act
		this.oTileContent.setFooterColor(ValueColor.Critical);
		await nextUIUpdate();
		//Assert
		assert.ok(this.oTileContent.$("footer-text").hasClass("sapMTileCntFooterTextColorCritical"), "Correct CSS class added");
	});

	QUnit.test("Error CSS Class added", async function(assert) {
		//Act
		this.oTileContent.setFooterColor(ValueColor.Error);
		await nextUIUpdate();
		//Assert
		assert.ok(this.oTileContent.$("footer-text").hasClass("sapMTileCntFooterTextColorError"), "Correct CSS class added");
	});

	QUnit.test("Good CSS Class added", async function(assert) {
		//Act
		this.oTileContent.setFooterColor(ValueColor.Good);
		await nextUIUpdate();
		//Assert
		assert.ok(this.oTileContent.$("footer-text").hasClass("sapMTileCntFooterTextColorGood"), "Correct CSS class added");
	});

	/**
	 * @deprecated Since version 1.38.0.
	 */
	QUnit.module("Functional test", {
		beforeEach : async function() {
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
			await nextUIUpdate();
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
		beforeEach : async function() {
			this.oTileContent = new TileContent("tileContent", {
				footer : "Current Quarter",
				unit : "EUR"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
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

	QUnit.test("Footer is not rendered in case _bRenderFooter is false", async function(assert) {
		//Arrange
		this.oTileContent.setRenderFooter(false);

		//Act
		this.oTileContent.invalidate();
		await nextUIUpdate();

		//Assert
		assert.ok(!document.getElementById("tileContent-footer-text"), "No footer has been rendered.");
	});

	QUnit.module("Protected property _bRenderContent", {
		beforeEach : async function() {
			this.oTileContent = new TileContent("tileContent", {
				content: new Text()
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
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

	QUnit.test("Content is not rendered in case _bRenderContent is false", async function(assert) {
		//Arrange
		this.oTileContent.setRenderContent(false);

		//Act
		this.oTileContent.invalidate();
		await nextUIUpdate();

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
	QUnit.test("when both content and tile have tooltip", async function(assert) {
		this.oTileContent =  new TileContent("tileContent", {
			size : "Auto",
			content : new FeedContent({
				size : "Auto",
				contentText : "content"
			}),
			tooltip: "fulltile"
		});
		this.oTileContent.placeAt("qunit-fixture");
		await nextUIUpdate();
		var tooltip = "fulltile" + "\n" + "content " + "\n";
		//Assert
		assert.equal(document.getElementById("tileContent").title,tooltip);
	});

	/**
	 * @deprecated Since version 1.38.0.
	 */
	QUnit.test("when only content has tooltip", async function(assert) {
		this.oTileContent =  new TileContent("tileContent1", {
			size : "Auto",
			content : new FeedContent("feeditem", {
				size : "Auto",
				contentText : "content"
			})
		});
		this.oTileContent.placeAt("qunit-fixture");
		await nextUIUpdate();
		//Assert
		assert.equal(document.getElementById("tileContent1").title,"content " + "\n");
	});

	/**
	 * @deprecated Since version 1.38.0.
	 */
	QUnit.test("when only tile has tooltip", async function(assert) {
		this.oTileContent =  new TileContent("tileContent2", {
			content : new FeedContent("feed2", {
				size : "Auto"
			}),
			tooltip: "fulltile"
		});
		this.oTileContent.placeAt("qunit-fixture");
		await nextUIUpdate();
		//Assert
		assert.equal(document.getElementById("tileContent2").title,"fulltile");
	});

	var sPriorityText = "Medium Priority";
	QUnit.module("Priority Badge tests",{
		beforeEach : async function(){
			this.tileContent = new TileContent("customTileContent", {
				priority: "Medium",
				priorityText: sPriorityText,
				content: new NumericContent({
					icon: "sap-icon://world",
					truncateValueTo: 5,
					value: "0",
					width: "100%",
					withMargin: false
				})
			});

			this.tile = new GenericTile({
				header: "Manage my Timesheet",
				systemInfo: "S/4HANA Cloud",
				sizeBehavior: "Responsive",
				wrappingType: "Hyphenated",
				additionalTooltip: "S/4HANA Cloud",
				tileContent: this.tileContent
			});
			this.tile.placeAt("qunit-fixture");
			await nextUIUpdate();
		},

		afterEach : function(){
			this.tile.destroy();
		}
	});

	QUnit.test("ensure that priority badge is not displayed only for NewsContent", async function(assert) {
		//Assert
		assert.equal(document.getElementById("customTileContent-priority"), null, "Priority badge is not displayed for NumericContent");

		//Act
		this.tileContent.setContent(new NewsContent("newsContent", {
			contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
			subheader : "August 21, 2013"
		}));
		await nextUIUpdate();

		//Assert
		assert.ok(document.getElementById("customTileContent-priority"), "Priority badge is displayed for NewsContent");
		assert.equal(document.getElementById("customTileContent-priority-text").innerText, sPriorityText, "Priority badge text is correct");
		assert.equal(document.querySelectorAll('.sapMGTBackgroundBadge .sapMGTPriorityBadge').length, 0, "Priority badge is only rendered for NewsContent and not for GenericTile");
	});

	QUnit.test("ensure that priority badge is rendered for GenericTile only in Article Mode", async function(assert) {
		//Act
		this.tile.setMode("ArticleMode");
		this.tileContent.setContent(new NewsContent("newsContent", {
			contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
			subheader : "August 21, 2013"
		}));
		await nextUIUpdate();

		//Assert
		assert.ok(document.getElementById("customTileContent-priority"), "Priority badge is displayed");
		assert.equal(document.querySelectorAll('.sapMGTPriorityBadge').length, 2, "Priority badge is rendered for both NewsContent and GenericTile");
		assert.equal(document.querySelectorAll('.sapMGTBackgroundBadge .sapMGTPriorityBadge').length, 1, "Priority badge present for GenericTile");
	});

});