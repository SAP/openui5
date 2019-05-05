/*global QUnit */
sap.ui.define([
	"sap/ui/core/BusyIndicator",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Input"
], function(BusyIndicator, Button, Dialog, createAndAppendDiv, Input) {
	"use strict";

	QUnit.module("Focus Issue");

	/**
	 * Opens A Dialog, then opens a BusyIndicator (which remembers the last focused element which is in the Dialog).
	 * Then this closes the Dialog again, which removes the focused element.
	 * Then closes the BusyIndicator which tries to focus the element in the Dialog again.
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
		var oContainerElement = createAndAppendDiv("scroll_container");
		oContainerElement.style.overflow = "scroll";
		oContainerElement.style.height = "400px";
		createAndAppendDiv("input_uiarea", oContainerElement);
		createAndAppendDiv("large_content", oContainerElement).style.height = "3000px";
		var oInputAtEnd = document.createElement("input");
		oContainerElement.appendChild(oInputAtEnd);

		var oInput = new Input();
		oInput.placeAt("input_uiarea");
		sap.ui.getCore().applyChanges();

		oInputAtEnd.scrollIntoView();

		var iScrollY = oContainerElement.scrollTop;
		assert.ok(iScrollY > 0,
			"Setting the focus to the last input element should already have caused scrolling in the container");

		// act
		oInput.focus({
			preventScroll: true
		});

		var done = assert.async();
		setTimeout(function() {
			assert.equal(oContainerElement.scrollTop, iScrollY, "The vertical scroll position of the container isn't changed");

			// cleanup
			oInput.destroy();
			oContainerElement.remove();
			done();
		}, 0);
	});

});
