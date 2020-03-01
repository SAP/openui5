/*global QUnit */
sap.ui.define([
	"sap/ui/core/BusyIndicator",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/HTML",
	"sap/m/Input"
], function(BusyIndicator, Button, Dialog, createAndAppendDiv, HTML, Input) {
	"use strict";

	QUnit.module("Focus Issue");

	/**
	 * Opens A Dialog, then opens a BusyIndicator (which remembers the last focused element which is in the Dialog).
	 * Then this closes the Dialog again, which removes the focused element.
	 * Then closes the BusyIndicator which tries to focus the element in the Dialog again, which is a problem at least in IE8.
	 * This effectively tests the fix (checking whether the element is still there) for this issue.
	 */
	QUnit.test("Focus a missing element (actual incident testcase)", function(assert) {
		var done = assert.async();
		assert.expect(1);

		var oDialog = new Dialog({
			title : "Some Title",
			buttons : [new Button({text:"OK"})]
		});

		oDialog.open();

		setTimeout(function() {
			BusyIndicator.show(0);
			oDialog.close();

			setTimeout(function() {
				BusyIndicator.hide();
				assert.ok(true, "when this checkpoint is reached, the test is passed");
				done();
			}, 600);
		}, 600);
	});

	QUnit.module("Focus with preventScroll");

	QUnit.test("Focus an element with preventScroll should NOT cause scrolling", function(assert) {
		createAndAppendDiv("content");
		var done = assert.async();
		var oHTMLControl = new HTML({
			content: "<div id='scroll_container' style='overflow:scroll; height: 400px'>\
						<div id='input_uiarea'></div>\
						<div style='height: 3000px'></div>\
						<input id='input_at_end'>\
					</div>"
		});

		oHTMLControl.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oInput = new Input();
		oInput.placeAt("input_uiarea");
		sap.ui.getCore().applyChanges();

		var oDomElement = document.getElementById("scroll_container"),
			oInputAtEnd = document.getElementById("input_at_end");

		oInputAtEnd.scrollIntoView();

		var iScrollY = oDomElement.scrollTop;

		assert.ok(iScrollY > 0, "The focus to last input should already caused scrolling in the container");

		// act
		oInput.focus({
			preventScroll: true
		});

		setTimeout(function() {
			assert.equal(oDomElement.scrollTop, iScrollY, "The vertical scroll position of the container isn't changed");
			oInput.destroy();
			oHTMLControl.destroy();
			done();
		}, 0);
	});

});
