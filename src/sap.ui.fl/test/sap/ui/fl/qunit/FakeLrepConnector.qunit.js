/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/FakeLrepConnectorLocalStorage"
], function(
	FakeLrepConnector,
	FakeLrepConnectorLocalStorage
) {
	"use strict";

	QUnit.module("Given a FakeLrepConnector", {
		beforeEach : function () {
			FakeLrepConnectorLocalStorage.disableFakeConnector();
		}
	}, function () {
		QUnit.test("when a prototype function of the connector is overwritten", function (assert) {
			function fnInjectedFuction () {}
			FakeLrepConnector.prototype.create = fnInjectedFuction;

			assert.equal(FakeLrepConnector.prototype.create, fnInjectedFuction, "then the function is set");
		});

		QUnit.test("when a prototype function of the connector is overwritten and the disableFakeConnector is called", function (assert) {
			FakeLrepConnector.prototype.create = function () {};
			FakeLrepConnectorLocalStorage.disableFakeConnector();

			assert.deepEqual(FakeLrepConnector.prototype, {}, "then the function is no longer set");
		});
	});
});