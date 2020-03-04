/* global QUnit */

sap.ui.define(function() {
	"use strict";

	// Checks whether the property is stubbed by jquery.sap.stubs
	function isStubbed(oTarget, sProperty) {
		var descriptor = Object.getOwnPropertyDescriptor(oTarget, sProperty);
		return descriptor && descriptor.get && descriptor.get["jquery.sap.stubs"];
	}

	QUnit.module("jquery.sap.stubs / jquery-ui-core");

	QUnit.test("Should not trigger lazy stubs when loading jquery-ui-core", function(assert) {
		var done = assert.async();

		var oRequireSyncSpy = this.spy(sap.ui, "requireSync");

		// Preconditions
		assert.equal(sap.ui.require("jquery.sap.stubs"), undefined, "jquery.sap.stubs should not be loaded");
		assert.equal(sap.ui.require("sap/ui/thirdparty/jqueryui/jquery-ui-core"), undefined, "jquery-ui-core should not be loaded");

		// First load stubs
		sap.ui.require(["jquery.sap.stubs"], function(jQuery) {

			// Check for active stubs
			assert.ok(isStubbed(jQuery.fn, "zIndex"), "jQuery.fn.zIndex should be stubbed");
			assert.ok(isStubbed(jQuery.fn, "enableSelection"), "jQuery.fn.enableSelection should be stubbed");
			assert.ok(isStubbed(jQuery.fn, "disableSelection"), "jQuery.fn.disableSelection should be stubbed");
			assert.ok(isStubbed(jQuery.expr.pseudos, "focusable"), "jQuery.expr.pseudos.focusable should be stubbed");
			assert.ok(isStubbed(jQuery.expr[ ":" ], "focusable"), "jQuery.expr[ \":\" ].focusable should be stubbed");

			// then require jquery-ui-core
			sap.ui.require(["sap/ui/thirdparty/jqueryui/jquery-ui-core"], function() {

				// Our jQuery plugin implementations should not be loaded
				assert.equal(sap.ui.require("sap/ui/dom/jquery/zIndex"), undefined, "sap/ui/dom/jquery/zIndex should not be loaded");
				assert.equal(sap.ui.require("sap/ui/dom/jquery/Selection"), undefined, "sap/ui/dom/jquery/Selection should not be loaded");
				assert.equal(sap.ui.require("sap/ui/dom/jquery/Selectors"), undefined, "sap/ui/dom/jquery/Selectors should not be loaded");

				// Check for stubs replaced with jquery-ui-core implementation
				assert.equal(typeof jQuery.fn.zIndex, "function", "jQuery.fn.zIndex should be a function");
				assert.equal(typeof jQuery.fn.enableSelection, "function", "jQuery.fn.enableSelection should be a function");
				assert.equal(typeof jQuery.fn.disableSelection, "function", "jQuery.fn.disableSelection should be a function");
				assert.equal(typeof jQuery.expr.pseudos.focusable, "function", "jQuery.expr.pseudos.focusable should be a function");
				assert.equal(typeof jQuery.expr[ ":" ].focusable, "function", "jQuery.expr[ \":\" ].focusable should be a function");

				// No sync require (e.g. lazy loading should be triggered)
				assert.ok(oRequireSyncSpy.notCalled, "requireSync should not be called");

				done();
			});
		});
	});

});
