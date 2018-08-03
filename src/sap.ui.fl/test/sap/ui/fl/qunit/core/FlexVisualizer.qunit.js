/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery"
], function(
	jQuery
) {
	"use strict";

	QUnit.module("sap.ui.fl.core.FlexVisualizer", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	}, function() {
		QUnit.test("These are not the droids you are looking for", function (assert) {
			assert.ok(true);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
