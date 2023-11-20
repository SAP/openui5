/*global QUnit */
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/test/Opa',
	'sap/ui/test/Opa5',
	'sap/ui/core/routing/HashChanger',
	'../utils/sinon',
	'samples/components/button/Component'
], function ($, Opa, Opa5, HashChanger, sinonUtils) {
	"use strict";

	QUnit.test("Should not execute the test in debug mode", function (assert) {
		assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
	});

	QUnit.module("Component");

	QUnit.test("Should start and teardown a UIComponent", function(assert) {
		// System under Test
		var oOpa5 = new Opa5();
		var done = assert.async();

		// Act
		oOpa5.iStartMyUIComponent({
			componentConfig: {
				name: "samples.components.button"
			},
			hash: ""
		}).done(function(){
			assert.ok($(".sapUiOpaComponent").length, "The UIComponent was started");
		});

		oOpa5.iTeardownMyUIComponent();

		oOpa5.emptyQueue().done(function () {
			assert.ok(!$(".sapUiOpaComponent").length, "The UIComponent was removed");
			done();
		});

	});

	QUnit.test("Should increase timeout to 40 seconds", function(assert) {
		// System under Test
		var oOpa5 = new Opa5();
		var oSpy = this.spy(Opa.prototype, "_schedulePromiseOnFlow");
		var done = assert.async();

		oOpa5.iStartMyUIComponent({
			componentConfig: {
				name: "samples.components.button"
			},
			hash: "",
			timeout: 40
		});

		oOpa5.emptyQueue().done(function() {
			assert.equal(oSpy.firstCall.args[1].timeout, 40, "Timeout was increased to 40 seconds");
			oOpa5.iTeardownMyUIComponent();
			oSpy.restore();
			done();
		});
	});

	QUnit.test("Should provide detailed message upon component load error", function(assert) {
		// System under Test
		var oOpa5 = new Opa5();
		var done = assert.async();
		// provide invalid module name
		var moduleName = "unexistingModule";

		// try to start a component with invalid name
		oOpa5.iStartMyUIComponent({
			componentConfig: {
				name: moduleName
			},
			hash: "",
			timeout: 40
		});

		oOpa5.emptyQueue().fail(function(oError) {
			assert.ok(oError.errorMessage.indexOf("ModuleError") > 0, "error message contains error details");
			oOpa5.iTeardownMyUIComponent();
			done();
		});
	});

	function componentHashTestCase (oOptions){
		// System under Test
		var oOpa5 = new Opa5();
		var done = oOptions.assert.async();
		var oHashChanger = HashChanger.getInstance();

		oHashChanger.setHash("#foo");

		// Act
		oOpa5.iStartMyUIComponent({
			componentConfig: {
				name: "samples.components.button"
			},
			hash: oOptions.hashValues.newHash
		});

		oOpa5.waitFor({
			controlType: "sap.m.Button",
			success: function () {
				oOptions.assert.strictEqual(
					oHashChanger.getHash(),
					oOptions.hashValues.expectedHash,
					oOptions.message
				);
			}
		});

		oOpa5.iTeardownMyUIComponent();

		oOpa5.emptyQueue().done(function () {
			done();
		});

	}

	QUnit.test("Should set the hash to an empty hash if an empty hash is given", function(assert) {
		// System under Test
		//test for empty hash equal empty hash
		componentHashTestCase.call(this, {
			hashValues : {
				expectedHash : "",
				newHash : ""
			},
			assert : assert,
			message : "A empty hash was set to url"
		});

	});

	QUnit.test("Should set the hash to an empty hash if undefined is given", function(assert) {
		//test for no hash equal empty hash
		componentHashTestCase.call(this, {
			hashValues : {
				expectedHash : ""
			},
			assert : assert,
			message : "A empty hash was set to url because no one was given"
		});
	});

	QUnit.test("Should set the hash to 'test' if 'test' is specified", function(assert) {
		//test for value hash equal value hash
		componentHashTestCase.call(this, {
			hashValues : {
				expectedHash : "test",
				newHash : "test"
			},
			assert : assert,
			message : "A given hash value was set to url"
		});
	});

});
