sap.ui.define(['jquery.sap.global', 'sap/ui/test/Opa5', 'sap/ui/core/routing/HashChanger'], function ($, Opa5, HashChanger) {
	"use strict";


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
		var stub = this.stub(oOpa5, "waitFor", function(){});


		oOpa5.iStartMyUIComponent({
			componentConfig: {
				name: "samples.components.button"
			},
			hash: "",
			timeout: 40
		});

		assert.equal(stub.lastCall.args[0].timeout, 40, "Timeout was increased to 40 seconds")
	});

	function componentHashTestCase (oOptions){
		// System under Test
		var oOpa5 = new Opa5();
		var done = assert.async();
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
			controlType: "sap.ui.commons.Button",
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

	QUnit.test("Should set the hash to 'test' if 'test' is specified", function(assert){
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