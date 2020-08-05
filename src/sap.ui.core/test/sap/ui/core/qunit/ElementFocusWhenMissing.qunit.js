/*global QUnit */
sap.ui.define([
	"sap/ui/core/BusyIndicator",
	"sap/m/Button",
	"sap/m/Dialog"
], function(BusyIndicator, Button, Dialog) {
	"use strict";

	var oDialog;

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

		oDialog = new Dialog({
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

});
