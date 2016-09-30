/*global QUnit*/
jQuery.sap.require("sap.ui.fl.registry.SimpleChanges");

(function(SimpleChanges) {
	'use strict';

	QUnit.module("sap.ui.fl.registry.SimpleChanges", {
		setup: function() {
		},
		teardown: function() {
		}
	});

	QUnit.test("Shall contain a simpleChange hideControl", function(assert) {
		assert.ok(SimpleChanges.hideControl);
		assert.equal(SimpleChanges.hideControl.changeType, "hideControl");
		assert.equal(typeof SimpleChanges.hideControl.changeHandler, "object");
	});

	QUnit.test("Shall contain a simpleChange unhideControl", function(assert) {
		assert.ok(SimpleChanges.unhideControl);
		assert.equal(SimpleChanges.unhideControl.changeType, "unhideControl");
		assert.equal(typeof SimpleChanges.unhideControl.changeHandler, "object");
	});

	QUnit.test("Shall contain a simpleChange moveElement", function(assert) {
		assert.ok(SimpleChanges.moveElements);
		assert.equal(SimpleChanges.moveElements.changeType, "moveElements");
		assert.equal(typeof SimpleChanges.moveElements.changeHandler, "object");
	});

	QUnit.test("Shall contain a simpleChange propertyChange", function(assert) {
		assert.ok(SimpleChanges.propertyChange);
		assert.equal(SimpleChanges.propertyChange.changeType, "propertyChange");
		assert.equal(typeof SimpleChanges.propertyChange.changeHandler, "object");
	});

	QUnit.test("Shall contain a simpleChange propertyBindingChange", function(assert) {
		assert.ok(SimpleChanges.propertyBindingChange);
		assert.equal(SimpleChanges.propertyBindingChange.changeType, "propertyBindingChange");
		assert.equal(typeof SimpleChanges.propertyBindingChange.changeHandler, "object");
	});
}(sap.ui.fl.registry.SimpleChanges));
