/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/m/Button",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log",
	"sap/ui/fl/changeHandler/PropertyChange",
	"sap/ui/fl/Change",
	"sap/ui/fl/changeHandler/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/XmlTreeModifier"
], function(
	jQuery,
	sinon,
	Button,
	JSONModel,
	Log,
	PropertyChange,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a Property Change Handler", {
		beforeEach: function() {
			this.oChangeHandler = PropertyChange;
			this.sBindingError = "Please use 'PropertyBindingChange' to set a binding";

			this.OLD_BINDING_VALUE = "oldBindingValue";
			this.OLD_VALUE = "original";
			this.NEW_VALUE = "newValue";

			this.oButton = new Button({text: this.OLD_VALUE});
			this.oDOMParser = new DOMParser();
			this.oXmlDocument = this.oDOMParser.parseFromString("<Button xmlns='sap.m' text='" + this.OLD_VALUE + "' enabled='true' />", "application/xml");
			this.oXmlButton = this.oXmlDocument.childNodes[0];

			this.mExpectedSelector = {
				id: this.oButton.getId(),
				type: "sap.m.Button"
			};

			this.mExpectedChangeContent = {
				property: "text",
				oldValue: this.OLD_VALUE,
				newValue: this.NEW_VALUE,
				semantic: "rename"
			};

			this.mSpecificChangeData = {
				selector: this.mExpectedSelector,
				changeType: "propertyChange",
				content: this.mExpectedChangeContent
			};

			this.oChange = new Change(this.mSpecificChangeData);
		},
		afterEach: function() {
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test('When providing change data via specific change info, Then', function(assert) {
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData);
			assert.deepEqual(this.oChange.getSelector(), this.mExpectedSelector, "the change SELECTOR is filled correctly");
			assert.deepEqual(this.oChange.getContent(), this.mExpectedChangeContent, "the change CONTENT is filled correctly");
			assert.equal(this.oChange.getChangeType(), "propertyChange", "the change TYPE is filled correctly");
		});

		QUnit.test("When calling completeChangeContent without content", function(assert) {
			assert.throws(
				function() {this.oChangeHandler.completeChangeContent(this.oChange, {});},
				Error("oSpecificChangeInfo attribute required"),
				"an Error is thrown"
			);
		});

		// TODO: enable again when apps have adapted
		QUnit.skip("When calling completeChangeContent with a binding as newValue", function(assert) {
			var mExpectedChangeContentWithBinding = {
				content: {
					newValue: "{model>path}"
				}
			};

			assert.throws(
				function() {this.oChangeHandler.completeChangeContent(this.oChange, mExpectedChangeContentWithBinding);},
				Error(this.sBindingError),
				"an Error is thrown"
			);
		});

		QUnit.test('When applying the property change on a js control tree and reverting it afterwards, Then', function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});
			assert.equal(this.oButton.getText(), this.NEW_VALUE, "property text has changed as expected");

			this.oChangeHandler.revertChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});
			assert.equal(this.oButton.getText(), this.OLD_VALUE, "property text has original value");
		});

		QUnit.test('When applying the property change on a xml control tree and reverting it afterwards, Then', function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
			assert.equal(this.oXmlButton.getAttribute("text"), this.NEW_VALUE, "property text has changed as expected");

			this.oChangeHandler.revertChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
			assert.equal(this.oXmlButton.getAttribute("text"), this.OLD_VALUE, "property text has original value");
		});

		QUnit.test("When reverting an unapplied change", function(assert) {
			var oErrorLogSpy = sandbox.spy(Log, "error");
			var bResult = this.oChangeHandler.revertChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});

			assert.notOk(bResult, "the revertChange function returns false");
			assert.equal(oErrorLogSpy.callCount, 1, "an Error was logged");
			assert.equal(oErrorLogSpy.firstCall.args[0], "Attempt to revert an unapplied change.");
		});

		QUnit.test("When oModifier.setProperty throws an error", function(assert) {
			sandbox.stub(JsControlTreeModifier, "setProperty").throws(Error("testError"));

			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});},
				Error("Applying property changes failed: Error: testError"),
				"then apply change throws an error"
			);
		});

		// TODO: enable again when apps have adapted
		QUnit.skip('When applying a property change which sets a binding on a js control tree, Then', function(assert) {
			this.NEW_VALUE = "{i18n>textKey}";

			this.mExpectedChangeContent = {
				property: "text",
				oldValue: this.OLD_VALUE,
				newValue: this.NEW_VALUE,
				semantic: "rename"
			};

			this.mSpecificChangeData = {
				selector: this.mExpectedSelector,
				changeType: "propertyChange",
				content: this.mExpectedChangeContent
			};

			this.oChange = new Change(this.mSpecificChangeData);
			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});},
				Error(this.sBindingError),
				"then apply change throws an error"
			);

			assert.notOk(this.oButton.getBindingInfo("text"), "the bindingInfo was not set");
		});

		QUnit.test('When applying and reverting a property change which changes a binding on a js control tree, Then', function(assert) {
			this.OLD_VALUE = "{path:'namedModel>/textKey'}";
			this.oButton = new Button({text: this.OLD_VALUE});

			var oNamedModel = new JSONModel({
				textKey: this.OLD_BINDING_VALUE
			});
			this.oButton.setModel(oNamedModel, "namedModel");

			this.mExpectedChangeContent = {
				property: "text",
				oldValue: this.OLD_VALUE,
				newValue: this.NEW_VALUE,
				semantic: "rename"
			};

			this.mSpecificChangeData = {
				selector: this.mExpectedSelector,
				changeType: "propertyChange",
				content: this.mExpectedChangeContent
			};

			this.oChange = new Change(this.mSpecificChangeData);

			// apply
			this.oChangeHandler.applyChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});
			assert.equal(this.oButton.getBindingInfo("text"), undefined, "property text has no binding");
			assert.equal(this.oButton.getText(), this.NEW_VALUE, "property text has changed as expected");

			// revert
			this.oChangeHandler.revertChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});
			assert.equal(this.oButton.getText(), this.OLD_BINDING_VALUE, "property text has changed back");
			var oBindingInfo = this.oButton.getBindingInfo("text");
			assert.equal(oBindingInfo.parts[0].path, "/textKey", "property value binding path has changed as expected");
			assert.equal(oBindingInfo.parts[0].model, "namedModel", "property value binding model has changed as expected");
		});

		// TODO: enable again when apps have adapted
		QUnit.skip('When applying a property change which sets a binding on a xml control tree, Then', function(assert) {
			this.NEW_VALUE = "{i18n>textKey}";

			this.mExpectedChangeContent = {
				property: "text",
				oldValue: this.OLD_VALUE,
				newValue: this.NEW_VALUE,
				semantic: "rename"
			};

			this.mSpecificChangeData = {
				selector: this.mExpectedSelector,
				changeType: "propertyChange",
				content: this.mExpectedChangeContent
			};

			this.oChange = new Change(this.mSpecificChangeData);

			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});},
				Error(this.sBindingError),
				"then apply change throws an error"
			);

			assert.equal(this.oXmlButton.getAttribute("text"), this.OLD_VALUE, "the text property has not changed");
		});

		QUnit.test('When applying and reverting a property change which changes a binding on a xml control tree, Then', function(assert) {
			this.OLD_VALUE = "{i18n>textKey}";
			this.oXmlDocument = this.oDOMParser.parseFromString("<Button xmlns='sap.m' text='" + this.OLD_VALUE + "' enabled='true' />", "application/xml");
			this.oXmlButton = this.oXmlDocument.childNodes[0];

			this.mExpectedChangeContent = {
				property: "text",
				oldValue: this.OLD_VALUE,
				newValue: this.NEW_VALUE,
				semantic: "rename"
			};

			this.mSpecificChangeData = {
				selector: this.mExpectedSelector,
				changeType: "propertyChange",
				content: this.mExpectedChangeContent
			};

			this.oChange = new Change(this.mSpecificChangeData);

			this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
			assert.equal(this.oXmlButton.getAttribute("text"), this.NEW_VALUE, "property value has original value");

			assert.throws(function() {
				this.oChangeHandler.revertChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
			}, Error, "Revert change throws an error, because this is not supported yet.");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});