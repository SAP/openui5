/* eslint-disable max-nested-callbacks */
/* global QUnit */
sap.ui.define(function() {
	"use strict";

	QUnit.module("module a", function() {
		QUnit.test("a basic test example", function(assert) {
			assert.ok(true);
		});
	});

	QUnit.module("module b", function() {
		QUnit.test("a basic test example 2", function(assert) {
			assert.ok(true);
		});
		QUnit.module("nested module b.1", function() {
			// This test will be prefixed with the following module label:
			// "module b > nested module b.1"
			QUnit.test("a basic test example 3", function(assert) {
				assert.ok(true);
			});
		});
	});

});
