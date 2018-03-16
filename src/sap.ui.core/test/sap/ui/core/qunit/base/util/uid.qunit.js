/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/util/uid'], function(uid) {
	"use strict";

	QUnit.module("sap.base.util.uid");

	QUnit.test("basic test", function(assert) {
		var myid = uid();
		assert.ok(myid);
	});
});