sap.ui.define([
		"sap/ui/demo/masterdetail/model/grouper",
		"sap/ui/model/resource/ResourceModel",
		"jquery.sap.global",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	], function (Grouper, ResourceModel, $) {
	"use strict";

	function createResourceModel () {
		return new ResourceModel({
			bundleUrl : [$.sap.getModulePath("sap.ui.demo.masterdetail"), "i18n/i18n.properties"].join("/")
		});
	}

	QUnit.module("Sorter - Grouping functions", {
		beforeEach : function () {
			this._oResourceModel = createResourceModel();
		},
		afterEach : function () {
			this._oResourceModel.destroy();
		}
	});

	function createContextObject(vValue) {
		return {
			getProperty : function () {
				return vValue;
			}
		};
	}

	QUnit.test("Should group a price lesser equal 20", function (assert) {
		// Arrange
		var oContextObject = createContextObject(17.2),
			oGrouperReturn;

		// System under test
		var fnGroup = Grouper.UnitNumber(this._oResourceModel.getResourceBundle());

		// Assert
		oGrouperReturn = fnGroup(oContextObject);
		assert.strictEqual(oGrouperReturn.key, "LE20", "The key is as expected for a low value");
		assert.strictEqual(oGrouperReturn.text, this._oResourceModel.getResourceBundle().getText("masterGroup1Header1"), "The group header is as expected for a low value");
	});

	QUnit.test("Should group the price", function (assert) {
		// Arrange
		var oContextObject = createContextObject(55.5),
			oGrouperReturn;

		// System under test
		var fnGroup = Grouper.UnitNumber(this._oResourceModel.getResourceBundle());

		// Assert
		oGrouperReturn = fnGroup(oContextObject);
		assert.strictEqual(oGrouperReturn.key, "GT20", "The key is as expected for a high value");
		assert.strictEqual(oGrouperReturn.text, this._oResourceModel.getResourceBundle().getText("masterGroup1Header2"), "The group header is as expected for a high value");
	});

});