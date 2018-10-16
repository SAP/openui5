/*global QUnit */
sap.ui.define([
	"sap/m/routing/RouteMatchedHandler",
	"sap/m/routing/Router"
], function (RouteMatchedHandler, MobileRouter) {
	"use strict";

	QUnit.module("Mobile router");

	QUnit.test("Should not register on events when a mobile router is used", function (assert) {
		var oRouter = new MobileRouter();

		new RouteMatchedHandler(oRouter);

		assert.strictEqual(oRouter.mEventRegistry.routeMatched, undefined);
		assert.strictEqual(oRouter.mEventRegistry.routePatternMatched, undefined);
	});
});