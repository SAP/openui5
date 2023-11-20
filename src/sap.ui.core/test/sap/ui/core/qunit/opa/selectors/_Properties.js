/*global QUnit*/
sap.ui.define([
	"sap/ui/test/selectors/_ControlSelectorGenerator",
	"sap/m/Input",
	"sap/m/Image",
	"sap/ui/core/Icon",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (_ControlSelectorGenerator, Input, Image, Icon, nextUIUpdate) {
	"use strict";

	QUnit.module("_Properties");

	QUnit.test("Should generate selector for property", async function (assert) {
		this.oInput = new Input({placeholder: "myText"});
		this.oInput.placeAt("qunit-fixture");

		await nextUIUpdate();

		var fnDone = assert.async();
		_ControlSelectorGenerator._generate({control: this.oInput, includeAll: true})
			.then(function (aSelectors) {
				assert.strictEqual(aSelectors[0][0].properties.valueState, "None", "Should generate selector with property valueState");
				assert.strictEqual(aSelectors[0][1].properties.placeholder, "myText", "Should generate selector with property placeholder");
				assert.strictEqual(aSelectors[0][2].properties.editable, true, "Should generate selector with property type");
				assert.strictEqual(aSelectors[0][3].properties.type, "Text", "Should generate selector with property type");
			}).finally(function() {
				this.oInput.destroy();
				fnDone();
			}.bind(this));
	});

	QUnit.test("Should generate selector for property with regex value", async function (assert) {
		this.oImage = new Image({src: "./../../test-resources/sap/ui/documentation/sdk/images/HT1040.jpg"});
		this.oImage1 = new Image({src: "./../../test-resources/sap/ui/HT[-10$40].jpg"});
		this.oIcon = new Icon({src: "sap-icon://action"});

		this.oImage.placeAt("qunit-fixture");
		this.oImage1.placeAt("qunit-fixture");
		this.oIcon.placeAt("qunit-fixture");

		await nextUIUpdate();

		var fnDone = assert.async();
		_ControlSelectorGenerator._generate({control: this.oImage, includeAll: true})
			.then(function (aSelectors) {
				assert.strictEqual(aSelectors[0][0].properties.src.regex.source, "HT1040\\.jpg", "Should generate selector with regex src");
				return _ControlSelectorGenerator._generate({control: this.oImage1, includeAll: true});
			}.bind(this)).then(function (aSelectors) {
				assert.strictEqual(aSelectors[0][0].properties.src.regex.source, "HT\\[\\-10\\$40\\]\\.jpg", "Should generate selector with regex src and special chars");
				return _ControlSelectorGenerator._generate({control: this.oIcon, includeAll: true});
			}.bind(this)).then(function (aSelectors) {
				assert.strictEqual(aSelectors[0][0].properties.src.regex.source, "action", "Should generate selector with regex src and icon path");
			}).finally(function() {
				this.oImage.destroy();
				this.oImage1.destroy();
				this.oIcon.destroy();
				fnDone();
			}.bind(this));
	});
});
