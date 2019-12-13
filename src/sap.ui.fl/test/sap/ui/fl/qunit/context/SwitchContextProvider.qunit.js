/* global QUnit*/

sap.ui.define([
	"sap/ui/fl/context/SwitchContextProvider",
	"sap/ui/fl/Cache",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function(
	SwitchContextProvider,
	Cache,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given an instance of the SwitchContextProvider", {
		beforeEach : function() {
			this.oSwitchContextProvider = new SwitchContextProvider();
		},
		afterEach : function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling loadData", function(assert) {
			return this.oSwitchContextProvider.loadData().then(function(mValue) {
				assert.deepEqual(mValue, {}, " then an empty object is returned");
			});
		});

		QUnit.test("when calling getValueHelp", function(assert) {
			return this.oSwitchContextProvider.getValueHelp().then(function(mValue) {
				assert.deepEqual(mValue, {}, " then an empty object is returned");
			});
		});

		QUnit.test("when calling validate for a key - value pair", function(assert) {
			return this.oSwitchContextProvider.validate("key", "value").then(function(bValue) {
				assert.equal(bValue, true, " then true is returned");
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});