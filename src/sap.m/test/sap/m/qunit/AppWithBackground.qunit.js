/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/thirdparty/jquery"
], function(QUnitUtils, createAndAppendDiv, App, Page, jQuery) {
	createAndAppendDiv("content");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		"#page1-scroll {" +
		"    padding: 100px;" +
		"    box-sizing: border-box;" +
		"}";
	document.head.appendChild(styleElement);



	var app = new App("myFirstApp", {
		initialPage: "page1",
		pages: [
			new Page("page1", {
				title: "Page 1"
			})
		],
		backgroundImage: "../images/demo/nature/huntingLeopard.jpg",
		backgroundColor: "rgb(255, 0, 0)",
		backgroundOpacity: 0.6,
		backgroundRepeat: true
	});
	app.placeAt("content");


	QUnit.test("App rendered", function(assert) {
		assert.ok(document.getElementById("myFirstApp"), "App should be rendered");
		assert.ok(document.getElementById("page1"), "Initially the first page should be rendered");
	});


	QUnit.test("Background Image", function(assert) {
		if (window.getComputedStyle) {
			var appStyle = window.getComputedStyle(document.getElementById("myFirstApp"));
			var bgStyle = window.getComputedStyle(document.getElementById("myFirstApp-BG"));
			assert.equal(appStyle.backgroundColor, "rgb(255, 0, 0)", "the custom background color should be set");
			assert.equal(appStyle.backgroundImage, "none", "no standard background image should be set");
			assert.ok(bgStyle.backgroundImage.indexOf("images/demo/nature/huntingLeopard.jpg") > -1, "Background image should be a Cheetah");
			assert.equal(bgStyle.backgroundRepeat, "repeat", "Background-repeat should be set to 'repeat'");
			assert.equal(Math.round(bgStyle.opacity * 10,10) / 10, 0.6, "Opacity should be right"); // rounding errors in Chrome...
		} else {
			assert.ok(true, "older browsers don't matter");
		}
	});
});