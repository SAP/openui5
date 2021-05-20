/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/HBox",
	"sap/ui/core/HTML",
	"sap/m/FlexItemData",
	"sap/m/VBox",
	"sap/ui/dom/includeStylesheet"
], function (
	createAndAppendDiv,
	HBox,
	HTML,
	FlexItemData,
	VBox,
	includeStylesheet
) {
	"use strict";

	createAndAppendDiv("content").classList.add("fitContainerH");

	// Calculate width and height for the elements
	var outerhboxWidth = 600,
		outerhboxHeight = 400,
		vboxWidth = outerhboxWidth * ( 5 / 15 ),
		vboxHeight = outerhboxHeight,
		innerhboxWidth = outerhboxWidth * ( 5 / 15 ),
		innerhboxHeight = outerhboxHeight * ( 3 / 8 ),
		item1Width = outerhboxWidth * ( 2 / 15 ),
		item1Height = outerhboxHeight,
		item2Width = outerhboxWidth * ( 3 / 15 ),
		item2Height = outerhboxHeight,
		item3Width = outerhboxWidth * ( 5 / 15 ),
		item3Height = outerhboxHeight * ( 5 / 8 ),
		item4Width = outerhboxWidth * ( 5 / 15 ) / 2,
		item4Height = outerhboxHeight * ( 3 / 8 ),
		item5Width = outerhboxWidth * ( 5 / 15 ) / 2,
		item5Height = outerhboxHeight * ( 3 / 8 ),
		item6Width = outerhboxWidth * ( 5 / 15 ),
		item6Height = outerhboxHeight;

	var oOuterHBox = new HBox("outerHBox", {
		items: [
				new HTML("panel1", {
					content: "<div></div>",
					layoutData: new FlexItemData({ growFactor: 2, id: "item1" })
				}),
				new HTML("panel2", {
					content: "<div></div>",
					layoutData: new FlexItemData({ growFactor: 3, id: "item2" })
				}),
				new VBox("vbox", {
					items: [
						new HTML("panel3", {
							content: "<div></div>",
							layoutData: new FlexItemData({ growFactor: 5, id: "item3" })
						}),
						new HBox("innerHBox", {
							items: [
								new HTML("panel4", {
									content: "<div></div>",
									layoutData: new FlexItemData({ growFactor: 1, id: "item4" })
								}),
								new HTML("panel5", {
									content: "<div></div>",
									layoutData: new FlexItemData({ growFactor: 1, id: "item5" })
								})
							],
							fitContainer: true,
							alignItems: "Stretch",
							layoutData: new FlexItemData({ growFactor: 3 })
						})
					],
					fitContainer: true,
					layoutData: new FlexItemData({ growFactor: 5 })
				}),
				new HTML("panel6", {
					content:"<div></div>",
					layoutData: new FlexItemData({ growFactor: 5, id: "item6" })
				})
			],
		fitContainer: true,
		alignItems: "Stretch"
	});

	oOuterHBox.placeAt("content");



	QUnit.test("Flex Boxes rendered", function(assert) {
		assert.ok(document.getElementById("outerHBox"), "Outer HBox should be rendered");
		assert.ok(document.getElementById("item1"), "Item 1 should be rendered");
		assert.ok(document.getElementById("item2"), "Item 2 should be rendered");
		assert.ok(document.getElementById("vbox"), "VBox should be rendered");
		assert.ok(document.getElementById("item3"), "Item 3 should be rendered");
		assert.ok(document.getElementById("innerHBox"), "Inner HBox should be rendered");
		assert.ok(document.getElementById("item4"), "Item 4 should be rendered");
		assert.ok(document.getElementById("item5"), "Item 5 should be rendered");
		assert.ok(document.getElementById("item6"), "Item 6 should be rendered");
	});

	QUnit.test("Width and height correct", function(assert) {
		assert.equal(document.getElementById("outerHBox").offsetWidth, outerhboxWidth, "Outer HBox should have the correct width");
		assert.equal(document.getElementById("outerHBox").offsetHeight, outerhboxHeight, "Outer HBox should have the correct height");
		assert.equal(document.getElementById("vbox").offsetWidth, vboxWidth, "VBox should have the correct width");
		assert.equal(document.getElementById("vbox").offsetHeight, vboxHeight, "VBox should have the correct height");
		assert.equal(document.getElementById("innerHBox").offsetWidth, innerhboxWidth, "Inner HBox should have the correct width");
		assert.equal(document.getElementById("innerHBox").offsetHeight, innerhboxHeight, "Inner HBox should have the correct height");
		assert.equal(document.getElementById("item1").offsetWidth, item1Width, "Item 1 should have the correct width");
		assert.equal(document.getElementById("item1").offsetHeight, item1Height, "Item 1 should have the correct height");
		assert.equal(document.getElementById("item2").offsetWidth, item2Width, "Item 2 should have the correct width");
		assert.equal(document.getElementById("item2").offsetHeight, item2Height, "Item 2 should have the correct height");
		assert.equal(document.getElementById("item3").offsetWidth, item3Width, "Item 3 should have the correct width");
		assert.equal(document.getElementById("item3").offsetHeight, item3Height, "Item 3 should have the correct height");
		assert.equal(document.getElementById("item4").offsetWidth, item4Width, "Item 4 should have the correct width");
		assert.equal(document.getElementById("item4").offsetHeight, item4Height, "Item 4 should have the correct height");
		assert.equal(document.getElementById("item5").offsetWidth, item5Width, "Item 5 should have the correct width");
		assert.equal(document.getElementById("item5").offsetHeight, item5Height, "Item 5 should have the correct height");
		assert.equal(document.getElementById("item6").offsetWidth, item6Width, "Item 6 should have the correct width");
		assert.equal(document.getElementById("item6").offsetHeight, item6Height, "Item 6 should have the correct height");
	});

	// include stylesheet and return promise, test starter will wait for it
	return includeStylesheet({
		url: sap.ui.require.toUrl("test-resources/sap/m/qunit/FlexBoxFit.css")
	});
});
