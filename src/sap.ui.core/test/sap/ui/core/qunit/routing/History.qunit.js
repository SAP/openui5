/*global QUnit */
sap.ui.define([
	"sap/ui/core/routing/HashChanger",
	"sap/ui/core/routing/History"
], function (HashChanger, History) {
	"use strict";

	HashChanger.getInstance().init();

	QUnit.module("history management", {
		beforeEach : function() {
			HashChanger.getInstance().replaceHash(""); //since the initial hash will be parsed, we want it to be empty on every test
		}
	});

	// singleton test only runs standalone
	QUnit.test("Should use the hashChanger in the singleton", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = History.getInstance(),
			oHashChanged = this.spy(sut, "_hashChangedByApp"),
			lengthBefore = sut.aHistory.length;

		//Act
		oHashChanger.setHash("foo");
		oHashChanger.replaceHash("bar");

		//Assert
		assert.strictEqual(sut, History.getInstance(), "Should be a singleton");

		assert.strictEqual(oHashChanged.callCount, 2, "Should be called twice");

		assert.ok(oHashChanged.firstCall.calledWithExactly("foo", false), "Should register to setHash");
		assert.ok(oHashChanged.secondCall.calledWithExactly("bar", true), "Should register to replaceHash");

		assert.strictEqual(sut.aHistory.length, lengthBefore + 1, "should have 1 entry in the history");
		assert.strictEqual(sut.aHistory[lengthBefore], "bar");

	});

	// The functionality of the sap.ui.core.routing.History heavily depends on the events of the HashChanger.
	// The HashChanger allows to replace the default instance with a custom implementation to intercept the logic -
	// this is currently done by the unified shell in order to handle cross-application navigation.
	// Factoring out the unit tests into this module allows to execute the same test suite in the shell context
	sap.ui.require(["sap/ui/core/qunit/routing/HistoryQunit"], function() {
		QUnit.start();
	});

});
