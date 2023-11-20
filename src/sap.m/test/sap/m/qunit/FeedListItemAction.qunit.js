/*global QUnit */
sap.ui.define([
	"sap/m/FeedListItemAction"
], function(FeedListItemAction) {
	"use strict";

	QUnit.module("Default values", {
		beforeEach: function() {
			this.oAction = new FeedListItemAction();
		},
		afterEach: function() {
			this.oAction.destroy();
			this.oAction = null;
		}
	});

	QUnit.test("Default value of property icon", function(assert) {
		assert.equal(this.oAction.getProperty("icon"), "", "Default value is correct");
	});

	QUnit.test("Default value of property text", function(assert) {
		assert.equal(this.oAction.getProperty("text"), "", "Default value is correct");
	});

	QUnit.test("Default value of property key", function(assert) {
		assert.equal(this.oAction.getProperty("key"), "", "Default value is correct");
	});

	QUnit.test("Default value of property enabled", function(assert) {
		assert.equal(this.oAction.getProperty("enabled"), true, "Default value is correct");
	});

	QUnit.test("Default value of property visible", function(assert) {
		assert.equal(this.oAction.getProperty("visible"), true, "Default value is correct");
	});

});