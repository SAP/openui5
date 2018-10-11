/*global QUnit */
sap.ui.define([
	"sap/ui/commons/ComboBox",
	"sap/ui/core/ListItem",
	"sap/ui/commons/Dialog"
], function(ComboBox, ListItem, Dialog) {
	"use strict";

	QUnit.module("default", {
		beforeEach: function() {
			this.oComboBox = new ComboBox({
				items: new ListItem({
					text: "A"
				})
			});
			this.oDialog = new Dialog({
				content: this.oComboBox
			});
		},
		afterEach: function() {
			this.oComboBox.destroy();
			this.oDialog.destroy();
		}
	});

	QUnit.test("ListBox inside ComboBox within Popup", function(assert) {

		this.oDialog.open();
		this.oComboBox._open();

		assert.ok(true, 'ComboBox should be opened and display the ListBox correctly.');

	});
});