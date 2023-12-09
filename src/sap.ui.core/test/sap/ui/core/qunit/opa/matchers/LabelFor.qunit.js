/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/matchers/LabelFor",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Button",
	"sap/ui/model/resource/ResourceModel",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/layout/library",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/Link",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/test/OpaPlugin"
], function (LabelFor, Input, Label, Button, ResourceModel, App, Page, layoutLibrary, SimpleForm, Link, nextUIUpdate) {
	"use strict";

	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;
	var BUNDLE_URL = "test-resources/sap/ui/core/qunit/opa/fixture/I18NText.properties";

	QUnit.module("LabelFor", {
		beforeEach: function () {
			var sInputId = "first_name";
			this.oInput = new Input({id: sInputId});
			this.oLabel = new Label({id: "name_label" ,text: "First name", labelFor: this.oInput});
			this.oModel = new ResourceModel({ bundleUrl: BUNDLE_URL });
			this.oLink = new Link({text: "click"});
			this.oLabelWithNoAssoc = new Label({id: "non_label", text: "Non labelable", labelFor: this.oLink});

			this.oLabelWithNoInput = new Label({id: "no_input", text: "No input", labelFor: null});
			this.oInvisibleLabel = new Label({
				id: "invisible_label",
				text: "I am invisible",
				labelFor: this.oInput,
				visible: false
			});

			this.oLabeli18n = new Label({id: "i18n_label", text: "{i18n>labelText}", labelFor: this.oInput});

			this.oFormInput = new Input({id: "form_input"});
			this.oForm = new SimpleForm({
				id: "form",
				layout: SimpleFormLayout.ColumnLayout,
				content:
				[
					new Label({id: "form_label", text: "form input", labelFor: this.oFormInput}),
					this.oFormInput
				]
			});

			this.oButton = new Button({id: "button", text: "Button"});
			this.oLabelForButton = new Label({
				id: "label_for_button",
				text: "Label for button",
				labelFor: this.oButton});

			this.oApp = new App().addPage(new Page({
				title: "LabelFor matcher",
				content: [
					this.oLabel,
					this.oInput,
					this.oLabelWithNoInput,
					this.oInvisibleLabel,
					this.oLabeli18n,
					this.oForm,
					this.oButton,
					this.oLabelForButton,
					this.oLink,
					this.oLabelWithNoAssoc
				]
			})).setModel(this.oModel, "i18n").placeAt("qunit-fixture");

			return nextUIUpdate();
		},
		afterEach: function () {
			this.oApp.destroy();
		}
	});

	QUnit.test("Should match input labeled with given text", function(assert) {
		var oMatcher = new LabelFor({text: "First name"});
		var bResult = oMatcher.isMatching(this.oInput);
		assert.ok(bResult, "Matches with the given text");
	});

	QUnit.test("Shouldn't match input labeled with given text", function(assert) {
		var oMatcher = new LabelFor({text: "Last name"});
		var bResult = oMatcher.isMatching(this.oInput);
		assert.ok(!bResult, "Did not match with given text");
	});

	QUnit.test("Should match input labeled with given key", function(assert) {
		var oMatcher = new LabelFor({key: "labelText"});
		var bResult = oMatcher.isMatching(this.oInput);
		assert.ok(bResult, "Matches with given key");
	});

	QUnit.test("Should not match input labeled with given key", function(assert) {
		var oMatcher = new LabelFor({key: "noKey"});
		var bResult = oMatcher.isMatching(this.oInput);
		assert.ok(!bResult, "Did not match with given key");
	});

	QUnit.test("Should match input labeled with given key and model name", function(assert) {
		var oMatcher = new LabelFor({key: "labelText", modelName: "i18n"});
		var bResult = oMatcher.isMatching(this.oInput);
		assert.ok(bResult, "Matches with given key and model name");
	});

	QUnit.test("Should not match input labeled with given key and model name", function(assert) {
		var oMatcher = new LabelFor({key: "fooLabel", modelName: "notExistingModel"});
		var bResult = oMatcher.isMatching(this.oInput);
		assert.ok(!bResult, "Did not match with given key and model name");
	});

	QUnit.test("Should fail because of combination of key and text", function(assert) {
		var oMatcher = new LabelFor({key: "fooLabel", text: "label"});
		var oErrorSpy = this.spy(oMatcher._oLogger, "error");
		assert.ok(!oMatcher.isMatching(this.oInput));
		sinon.assert.calledWithMatch(oErrorSpy, "Combination of text and key properties is not allowed");
	});

	QUnit.test("Should fail because of no key and no label text", function(assert) {
		var oMatcher = new LabelFor();
		var oErrorSpy = this.spy(oMatcher._oLogger, "error");
		assert.ok(!oMatcher.isMatching(this.oInput));
		sinon.assert.calledWithMatch(oErrorSpy, "Text and key properties are not defined but exactly one is required");
	});

	QUnit.test("Should not match label with given text but no input for it", function(assert) {
		var oMatcher = new LabelFor({text: "No input"});
		var bResult = oMatcher.isMatching(this.oInput);
		assert.ok(!bResult, "Did not match labeled input");
	});

	QUnit.test("Should not match invisible label", function (assert) {
		var oMatcher = new LabelFor({text: "I am invisible"});
		var bResult = oMatcher.isMatching(this.oInput);
		assert.ok(bResult, "Did not Match invisible label");
	});

	QUnit.test("Should not match with given text", function(assert) {
		var sLabelText = "foo";
		var oMatcher = new LabelFor({text: sLabelText});
		var oDebugSpy = this.spy(oMatcher._oLogger, "debug");

		var bResult = oMatcher.isMatching(this.oInput);

		assert.ok(!bResult, "Did not match");
		sinon.assert.calledWith(oDebugSpy, "Control '" + this.oInput + "' does not have an associated label with text " + sLabelText);
		sinon.assert.calledOnce(oDebugSpy);
	});

	QUnit.test("Should not match with given key", function(assert) {
		var sKey = "foo";
		var oMatcher = new LabelFor({key: sKey});
		var oDebugSpy = this.spy(oMatcher._oLogger, "debug");

		var bResult = oMatcher.isMatching(this.oInput);

		assert.ok(!bResult, "Did not match");
		sinon.assert.calledWith(oDebugSpy, "Control '" + this.oInput + "' does not have an associated label with I18N text key " + sKey);
	});

	QUnit.test("Should match input in form by given label text", function(assert) {
		var oMatcher = new LabelFor({text: "form input"});
		var bResult = oMatcher.isMatching(this.oFormInput);
		assert.ok(bResult, "Match input in form");
	});

	QUnit.test("Should match button associated with label", function(assert) {
		var oMatcher = new LabelFor({text: "Label for button"});
		var bResult = oMatcher.isMatching(this.oButton);
		assert.ok(bResult, "Match button");
	});

	QUnit.test("Should not match non-labelable control", function(assert) {
		var oMatcher = new LabelFor({text: "click"});
		var bResult = oMatcher.isMatching(this.oLink);
		assert.ok(!bResult, "Did not match non-labelable Link");
	});

	QUnit.test("Should match when text contains binding symbols", function(assert) {
		this.oLabel.setText("{foo");
		var oMatcher = new LabelFor({text: "{foo"});
		var bResult = oMatcher.isMatching(this.oInput);
		assert.ok(bResult, "Matches with the given text");
	});
});
