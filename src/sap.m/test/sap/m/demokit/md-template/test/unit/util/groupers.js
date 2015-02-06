/*global QUnit, jQuery *///declare unusual global vars for JSLint/SAPUI5 validation
sap.ui.require(
	[
		'sap/ui/demo/mdtemplate/util/groupers',
		'sap/ui/model/resource/ResourceModel',
		'sap/ui/thirdparty/sinon',
		'sap/ui/thirdparty/sinon-qunit'
	],
	function (Groupers, ResourceModel) {
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

		QUnit.test("Should Group the Rating", function () {
			// Arrange
			var iRating2 = 2,
				oContextObject2 = createContextObject(iRating2),
				iRating5 = 5,
				oContextObject5 = createContextObject(iRating5),
				oGetModelStub = this.stub(),
				oControlStub = {
					getModel: oGetModelStub
				},
				oGrouperReturn;

			// System under test
			oGetModelStub.withArgs("i18n").returns(this._oResourceModel);

			// Assert
			oGrouperReturn = $.proxy(Groupers.Group1, oControlStub)(oContextObject2);
			strictEqual(oGrouperReturn.key, iRating2,"The key was as expected for rating 2");
			strictEqual(oGrouperReturn.text, this._oResourceModel.getResourceBundle().getText("masterGroup1Header", [iRating2]),"The group header is correct for rating 2");

			oGrouperReturn = $.proxy(Groupers.Group1, oControlStub)(oContextObject5);
			strictEqual(oGrouperReturn.key, iRating5,"The key was as expected for rating 5");
			strictEqual(oGrouperReturn.text, this._oResourceModel.getResourceBundle().getText("masterGroup1Header", [iRating5]),"The group header is correct for rating 5");
		});

		QUnit.test("Should group the price", function () {
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
			oGrouperReturn = $.proxy(Groupers.Group2, oControlStub)(oContextObjectLower);
			strictEqual(oGrouperReturn.key,"LE20", "The key is as expected for a low value");
			strictEqual(oGrouperReturn.text,this._oResourceModel.getResourceBundle().getText("masterGroup2Header1"), "The group header is as expected for a low value");

			oGrouperReturn = $.proxy(Groupers.Group2, oControlStub)(oContextObjectHigher);
			strictEqual(oGrouperReturn.key,"GT20", "The key is as expected for a high value");
			strictEqual(oGrouperReturn.text,this._oResourceModel.getResourceBundle().getText("masterGroup2Header2"), "The group header is as expected for a high value");
		});


	});
