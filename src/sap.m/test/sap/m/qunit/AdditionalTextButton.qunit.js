/*global QUnit */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/library",
	"sap/m/AdditionalTextButton",
	"sap/ui/core/Core"
], function(
	qutils,
    library,
	AdditionalTextButton,
	oCore
) {
	"use strict";
	var oAdditionalTextButton;

	QUnit.module("Initial rendering", {
		beforeEach: function(){
			oAdditionalTextButton = new AdditionalTextButton();
			oAdditionalTextButton.setText("first text");
			oAdditionalTextButton.placeAt("qunit-fixture");
			oCore.applyChanges();
		 },
		afterEach: function(){
			oAdditionalTextButton.destroy();
		}
	});

    QUnit.test("Add additional class to root element", function(assert){
		//Assert
        assert.ok(oAdditionalTextButton.$("inner").hasClass("sapMBtnAdditionalTextContent"), "The additional text button should have a class added");
	});

	QUnit.test("Instantiation without additional text", function(assert) {
		//Act
		var oBdiTags = oAdditionalTextButton.getDomRef().querySelectorAll("bdi");

		//Assert
		assert.equal(oBdiTags.length, 1, "It should retain the behavior from the Button and create one bdi tag");
	});

	QUnit.test("Add second bdi tag", function(assert){
		//Arrange
		oAdditionalTextButton.setAdditionalText("additional text");
		oCore.applyChanges();

		//Act
		var oBdiTags = oAdditionalTextButton.getDomRef().querySelectorAll("bdi");

		//Assert
        assert.equal(oBdiTags.length, 2, "When additional text is added, there must be created two bdi tag");
	});
});