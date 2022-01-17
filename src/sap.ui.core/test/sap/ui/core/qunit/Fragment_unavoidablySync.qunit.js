/* global sinon QUnit */
sap.ui.define([
	"sap/base/Log"
], function (Log) {
	"use strict";

	QUnit.module("Error handling", {
		beforeEach: function() {
			this.logSpy = this.spy(Log, "error");
		},
		afterEach: function() {
			this.logSpy.restore();
		}
	});

	QUnit.test("Sync XML Fragment from string with duplicate id error", function(assert) {
		try {
			var oFrag = sap.ui.xmlfragment({
				id: "syncFragment",
				fragmentContent:
				'<Panel id="panel" xmlns="sap.m">'
				+ '<Button id="button4"/>'
				+ '<Button id="button4" text="text"/>'
				+ '</Panel>'
			});

			// check for error log
			// The first error log call is done in ElementRegistry
			// The second error log call is done in XMLTemplateProcessor
			assert.equal(this.logSpy.callCount, 2, "duplicate id error is logged");
			sinon.assert.calledWithMatch(this.logSpy.getCall(1), sinon.match("An Error occured during XML processing of 'sap.ui.core.Fragment' with id 'syncFragment':"));
			assert.deepEqual(oFrag, [], "No control can be returned");
		} catch (error) {
			assert.ok(false, "error shouldn't be thrown");
		}
	});
});
