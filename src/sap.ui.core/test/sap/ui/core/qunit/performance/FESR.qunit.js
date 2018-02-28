/*global QUnit */
sap.ui.define(['sap/ui/performance/FESR', 'sap/ui/performance/XHRInterceptor'], function(FESR, XHRInterceptor) {
	"use strict";

	QUnit.module("FESR");

	QUnit.test("activation", function(assert) {
		assert.notOk(XHRInterceptor.isRegistered("FESR", "open"), "FESR must not be registered");
		FESR.setActive(true);
		assert.ok(FESR.getActive(), "FESR should must be active");
		assert.ok(XHRInterceptor.isRegistered("FESR", "open"), "FESR must be registered");
		assert.ok(XHRInterceptor.isRegistered("PASSPORT_ID", "open"), "PASSPORT_ID must be registered");
		assert.ok(XHRInterceptor.isRegistered("PASSPORT_HEADER", "open"), "PASSPORT_HEADER must be registered");
		FESR.setActive(false);
		assert.notOk(FESR.getActive(), "should must not be active")
		assert.notOk(XHRInterceptor.isRegistered("FESR", "open"), "FESR must not be registered");
	});

});