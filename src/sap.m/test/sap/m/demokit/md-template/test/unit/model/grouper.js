/*global QUnit, jQuery *///declare unusual global vars for JSLint/SAPUI5 validation
sap.ui.require(
	[
		'sap/ui/demo/mdtemplate/model/grouper',
		'sap/ui/model/resource/ResourceModel',
		'sap/ui/thirdparty/sinon',
		'sap/ui/thirdparty/sinon-qunit'
	],
	function (grouper, ResourceModel) {
	"use strict";

		var $ = jQuery;

		QUnit.module("Grouping functions", {
			setup: function () {
				this._oResourceModel = new ResourceModel({
					bundleUrl : [$.sap.getModulePath("sap.ui.demo.mdtemplate"), "i18n/messageBundle.properties"].join("/")
				});
			},
			teardown: function () {
				this._oResourceModel.destroy();
			}
		});

		function createContextObject(vValue) {
			return {
				getProperty: function () {
					return vValue;
				}
			};
		}

		QUnit.test("Should group the price", function (assert) {
			// Arrange
			var oContextObjectLower = createContextObject(17.2),
				oContextObjectHigher = createContextObject(55.5),
				oGetModelStub = this.stub(),
				oControlStub = {
					getModel: oGetModelStub
				},
				oGrouperReturn;

			// System under test
			oGetModelStub.withArgs("i18n").returns(this._oResourceModel);

			// Assert
			oGrouperReturn = $.proxy(grouper.Group1, oControlStub)(oContextObjectLower);
			assert.strictEqual(oGrouperReturn.key,"LE20", "The key is as expected for a low value");
			assert.strictEqual(oGrouperReturn.text,this._oResourceModel.getResourceBundle().getText("masterGroup1Header1"), "The group header is as expected for a low value");

			oGrouperReturn = $.proxy(grouper.Group1, oControlStub)(oContextObjectHigher);
			assert.strictEqual(oGrouperReturn.key,"GT20", "The key is as expected for a high value");
			assert.strictEqual(oGrouperReturn.text,this._oResourceModel.getResourceBundle().getText("masterGroup1Header2"), "The group header is as expected for a high value");
		});

	}
);
