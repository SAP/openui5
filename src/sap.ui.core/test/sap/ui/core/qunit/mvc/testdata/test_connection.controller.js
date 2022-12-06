/* global QUnit */
sap.ui.define([
], function () {
	"use strict";

	sap.ui.controller("example.mvc.test_connection", {

		onInit: function () {
			QUnit.assert.ok(true, "onInit is called.");
		}

	});
});
