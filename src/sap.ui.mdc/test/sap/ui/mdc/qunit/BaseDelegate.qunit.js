/* global QUnit*/

sap.ui.define([
	"sap/ui/mdc/BaseDelegate", "sap/ui/mdc/DefaultTypeMap"
], function (
		BaseDelegate,
		DefaultTypeMap
	) {
	"use strict";

	QUnit.test("getTypeMap", function(assert) {
		assert.equal(BaseDelegate.getTypeMap(), DefaultTypeMap, "returns correct default");
	});
});
