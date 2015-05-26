/*global QUnit*/

sap.ui.require([
		"sap/ui/demo/wt/model/formatter",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function (formatter, ResourceModel) {
		"use strict";

		QUnit.module("Formatting functions", {
			setup: function () {
				this._oResourceModel = new ResourceModel({
					bundleUrl: jQuery.sap.getModulePath("sap.ui.demo.wt", "/i18n/i18n.properties")
				});
			},
			teardown: function () {
				this._oResourceModel.destroy();
			}
		});


		QUnit.test("Should return the translated texts", function (assert) {

			// Arrange
			var oViewStub = {
				getModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};
			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};

			// System under test
			var fnIsolatedFormatter = formatter.statusText.bind(oControllerStub);

			// Assert
			assert.strictEqual(fnIsolatedFormatter("A"), this._oResourceModel.getProperty("invoiceStatusA"), "The long text for status A is correct");

			assert.strictEqual(fnIsolatedFormatter("B"), this._oResourceModel.getProperty("invoiceStatusB"), "The long text for status B is correct");

			assert.strictEqual(fnIsolatedFormatter("C"), this._oResourceModel.getProperty("invoiceStatusC"), "The long text for status C is correct");

			assert.strictEqual(fnIsolatedFormatter("Foo"), "Foo", "The long text for status Foo is correct");
		});

	}
);
