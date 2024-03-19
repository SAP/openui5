sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/smoke/samples/pages/App",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function(Opa5, opaTest, App, TestLibrary) {
	"use strict";

	Opa5.extendConfig({
		viewNamespace: "sap.ui.mdc.demokit.sample.FieldCustomContent",
		appParams: {
			"sap-ui-animation": false
		}
	});

	const oFields = {
		MaskedInput: {id: "container-mdc.sample---sample--F-Mask", value: "123-45-678-9012-3", newValue: "4567890212312"},
		Slider: {id: "container-mdc.sample---sample--F-Slider", value: 10, newValue: 70},
		ObjectStatus: {id: "container-mdc.sample---sample--F-Object", value: "Test", newValue: "Another one"},
		CheckBox: {id: "container-mdc.sample---sample--F-Check", value: true, newValue: false}
	};


	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/FieldCustomContent/index.html";

	opaTest("App start successful", function(Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Opa5.assert.ok(true, "The app started successfully");
	});

	opaTest("MaskedInput field works", function(Given, When, Then) {
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oFields.MaskedInput.id, oFields.MaskedInput.value);
		When.onTheApp.iChangeTheMaskInputValueInTheField(oFields.MaskedInput.value);
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oFields.MaskedInput.id, oFields.MaskedInput.newValue);
	});

	opaTest("Slider field works", function(Given, When, Then) {
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oFields.Slider.id, oFields.Slider.value);
		When.onTheApp.iChangeTheSliderValueInTheField(oFields.Slider.newValue);
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oFields.Slider.id, oFields.Slider.newValue);
	});

	opaTest("ObjectStatus field works", function(Given, When, Then) {
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oFields.ObjectStatus.id, oFields.ObjectStatus.value);
		When.onTheMDCField.iEnterTextOnTheField(oFields.ObjectStatus.id, oFields.ObjectStatus.newValue);
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oFields.ObjectStatus.id, oFields.ObjectStatus.newValue);
	});

	opaTest("CheckBox field works", function(Given, When, Then) {
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oFields.CheckBox.id, oFields.CheckBox.value);
		When.onTheApp.iChangeTheCheckBoxValueInTheField(oFields.CheckBox.newValue);
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oFields.CheckBox.id, oFields.CheckBox.newValue);
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});