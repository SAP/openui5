/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/HBox",
	"sap/ui/core/HTML",
	"sap/m/FlexItemData",
	"sap/m/VBox",
	"sap/m/App",
	"sap/m/Page",
	"jquery.sap.global",
	"sap/ui/dom/includeStylesheet"
], function(
	createAndAppendDiv,
	HBox,
	HTML,
	FlexItemData,
	VBox,
	App,
	Page,
	jQuery,
	includeStylesheet
) {
	createAndAppendDiv("content");


	var outerhboxWidth,
		outerhboxHeight,
		vboxWidth,
		vboxHeight,
		innerhboxWidth,
		innerhboxHeight,
		item1Width,
		item1Height,
		item2Width,
		item2Height,
		item3Width,
		item3Height,
		item4Width,
		item4Height,
		item5Width,
		item5Height,
		item6Width,
		item6Height;

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

	var app = new App();
	app.placeAt("content");
	app.addPage(new Page("page", {
		enableScrolling: false,
		content: [
			oOuterHBox
		]
	}));


	QUnit.test("Flex Boxes rendered", function(assert) {
		assert.ok(jQuery.sap.domById("outerHBox"), "Outer HBox should be rendered");
		assert.ok(jQuery.sap.domById("item1"), "item 1 should be rendered");
		assert.ok(jQuery.sap.domById("item2"), "Item 2 should be rendered");
		assert.ok(jQuery.sap.domById("vbox"), "VBox should be rendered");
		assert.ok(jQuery.sap.domById("item3"), "Item 3 should be rendered");
		assert.ok(jQuery.sap.domById("innerHBox"), "Inner HBox should be rendered");
		assert.ok(jQuery.sap.domById("item4"), "Item 4 should be rendered");
		assert.ok(jQuery.sap.domById("item5"), "Item 5 should be rendered");
		assert.ok(jQuery.sap.domById("item6"), "Item 6 should be rendered");
	});

	QUnit.test("Width and height correct", function(assert) {
		assert.ok(Math.abs(jQuery.sap.domById("outerHBox").offsetWidth - outerhboxWidth) <= 1, "Outer HBox should have the correct width");
		assert.ok(Math.abs(jQuery.sap.domById("outerHBox").offsetHeight - outerhboxHeight) <= 1, "Outer HBox should have the correct height");
		assert.ok(Math.abs(jQuery.sap.domById("vbox").offsetWidth - vboxWidth) <= 1, "VBox should have the correct width");
		assert.ok(Math.abs(jQuery.sap.domById("vbox").offsetHeight - vboxHeight) <= 1, "VBox should have the correct height");
		assert.ok(Math.abs(jQuery.sap.domById("innerHBox").offsetWidth - innerhboxWidth) <= 1, "Inner HBox should have the correct width");
		assert.ok(Math.abs(jQuery.sap.domById("innerHBox").offsetHeight - innerhboxHeight) <= 1, "Inner HBox should have the correct height");
		assert.ok(Math.abs(jQuery.sap.domById("item1").offsetWidth - item1Width) <= 1, "Item 1 should have the correct width");
		assert.ok(Math.abs(jQuery.sap.domById("item1").offsetHeight - item1Height) <= 1, "Item 1 should have the correct height");
		assert.ok(Math.abs(jQuery.sap.domById("item2").offsetWidth - item2Width) <= 1, "Item 2 should have the correct width");
		assert.ok(Math.abs(jQuery.sap.domById("item2").offsetHeight - item2Height) <= 1, "Item 2 should have the correct height");
		assert.ok(Math.abs(jQuery.sap.domById("item3").offsetWidth - item3Width) <= 1, "Item 3 should have the correct width");
		assert.ok(Math.abs(jQuery.sap.domById("item3").offsetHeight - item3Height) <= 1, "Item 3 should have the correct height");
		assert.ok(Math.abs(jQuery.sap.domById("item4").offsetWidth - item4Width) <= 1, "Item 4 should have the correct width");
		assert.ok(Math.abs(jQuery.sap.domById("item4").offsetHeight - item4Height) <= 1, "Item 4 should have the correct height");
		assert.ok(Math.abs(jQuery.sap.domById("item5").offsetWidth - item5Width) <= 1, "Item 5 should have the correct width");
		assert.ok(Math.abs(jQuery.sap.domById("item5").offsetHeight - item5Height) <= 1, "Item 5 should have the correct height");
		assert.ok(Math.abs(jQuery.sap.domById("item6").offsetWidth - item6Width) <= 1, "Item 6 should have the correct width");
		assert.ok(Math.abs(jQuery.sap.domById("item6").offsetHeight - item6Height) <= 1, "Item 6 should have the correct height");
	});

	// include stylesheet, wait for it + 1000ms then calculate expected sizes.
	// test starter will wait for the returned promise
	return includeStylesheet({
		url: sap.ui.require.toUrl("test-resources/sap/m/qunit/FlexBoxFit.css")
	}).then(function() {
		// HACK: enforce scrollbars
		// - with a dedicated *.qunit.html page, the QUnit header + 100% body always enforced a scrollbar
		// - with the generic test starter, the QUnit header get a height only after all tests have been created
		document.getElementById("qunit").setAttribute("style", "height:200px;");

		return new Promise(function(resolve) {
			setTimeout(function() {

				// Calculate width and height for the elements
				outerhboxWidth = jQuery.sap.domById("page-cont").offsetWidth;
				outerhboxHeight = jQuery.sap.domById("page-cont").offsetHeight;
				vboxWidth = outerhboxWidth * ( 5 / 15 );
				vboxHeight = outerhboxHeight;
				innerhboxWidth = outerhboxWidth * ( 5 / 15 );
				innerhboxHeight = outerhboxHeight * ( 3 / 8 );
				item1Width = outerhboxWidth * ( 2 / 15 );
				item1Height = outerhboxHeight;
				item2Width = outerhboxWidth * ( 3 / 15 );
				item2Height = outerhboxHeight;
				item3Width = outerhboxWidth * ( 5 / 15 );
				item3Height = outerhboxHeight * ( 5 / 8 );
				item4Width = outerhboxWidth * ( 5 / 15 ) / 2;
				item4Height = outerhboxHeight * ( 3 / 8 );
				item5Width = outerhboxWidth * ( 5 / 15 ) / 2;
				item5Height = outerhboxHeight * ( 3 / 8 );
				item6Width = outerhboxWidth * ( 5 / 15 );
				item6Height = outerhboxHeight;

				resolve();
			}, 1000);
		});
	});

});