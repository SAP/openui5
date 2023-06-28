/*global QUnit */
sap.ui.define([
	"sap/ui/core/ListItem", "sap/ui/core/Configuration"
], function(ListItem, Configuration) {
	"use strict";

	var oListItem;
	var oListItem2;

	/**
	 * @deprecated As of Version 1.120.
	 */
	// check default settings
	QUnit.test("Default Settings", function(assert) {
		assert.expect(1);
		assert.equal(Configuration.getNoDuplicateIds(), true, "default setting should be: allow no duplicate IDs");
	});

		// make sure initially there is no error
	QUnit.test("First creation", function(assert) {
		assert.expect(0);
		oListItem = new ListItem("L1");
	});

	QUnit.test("Second, duplicate creation (with default settings)", function(assert) {
		assert.expect(1);
		try {
			oListItem2 = new ListItem("L1");
		} catch (e) {
			assert.equal(1, 1, "Error should be thrown");
		}
	});

	QUnit.test("Third, duplicate creation (after first element has been destroyed)", function(assert) {
		assert.expect(0);
		oListItem.destroy();
		oListItem2 = new ListItem("L1");
		oListItem2.destroy();
	});

	QUnit.test("ID Generation", function(assert) {
		assert.expect(1);
		oListItem = new ListItem();
		var oListItem2 = new ListItem();
		assert.ok(oListItem.getId() != oListItem2.getId(), "generated IDs should be different and there should have been no error");
	});
});