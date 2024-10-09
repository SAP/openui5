/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/util/IdentifierUtil",
	'sap/ui/base/DataType'
], function(
	IdentifierUtil,
	DataType
) {
	"use strict";

	const idType = DataType.getType("sap.ui.core.ID");

	QUnit.module("FilterUtil basics", {
		beforeEach: function() {},
		afterEach: function() {}
	});

	QUnit.test("check replace method", function(assert) {
		let s = IdentifierUtil.replace("Items*/_book_ID");
		assert.ok(idType.isValid(s));

		s = IdentifierUtil.replace("Items+/_book_ID");
		assert.ok(idType.isValid(s));

		s = IdentifierUtil.replace("hu&go");
		assert.ok(idType.isValid(s));

		s = IdentifierUtil.replace("hu&g&o");
		assert.ok(idType.isValid(s));

		s = IdentifierUtil.replace("hu/go");
		assert.ok(idType.isValid(s));
		s = IdentifierUtil.replace("hu/g/o");
		assert.ok(idType.isValid(s));
	});


});
