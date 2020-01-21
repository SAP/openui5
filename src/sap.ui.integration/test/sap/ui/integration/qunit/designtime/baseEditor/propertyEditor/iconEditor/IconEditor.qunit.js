/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/iconEditor/IconEditor",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/thirdparty/sinon-4"
], function (
	IconEditor,
	JSONModel,
	QUnitUtils,
	ResourceBundle,
	ResourceModel,
	sinon
) {
	"use strict";

	var oSandbox = sinon.createSandbox();

	QUnit.module("Icon Editor: Given an editor config", {
		before: function () {
			this.oPropertyConfig = {
				tags: ["content"],
				label: "Test Icon",
				type: "icon",
				path: "content"
			};
		},
		beforeEach: function (assert) {
			this.oContextModel = new JSONModel({
				content: "sap-icon://target-group"
			});
			this.oContextModel.setDefaultBindingMode("OneWay");

			oSandbox.spy(IconEditor.prototype, "_handleValueHelp");
			this.oEditor = new IconEditor();
			this.oEditor.setModel(this.oContextModel, "_context");
			this.oEditor.setConfig(this.oPropertyConfig);
			this.oEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var fnReady = assert.async();
			this.oEditor.attachReady(function () {
				this.oEditorElement = this.oEditor.getContent();
				fnReady();
			}, this);
		},
		afterEach: function () {
			this.oContextModel.destroy();
			this.oEditor.destroy();
			oSandbox.restore();
		}
	}, function () {
		QUnit.test("When an IconEditor is created", function (assert) {
			assert.ok(this.oEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When the icon value help is opened", function (assert) {
			var fnDone = assert.async();

			this.oEditorElement.attachValueHelpRequest(function () {
				this.oEditor._handleValueHelp.returnValues[0].then(function (oDialog) {
					assert.ok(oDialog && oDialog.getDomRef() instanceof HTMLElement, "Then the value help is rendered correctly (1/3)");
					assert.ok(oDialog && oDialog.getDomRef() && oDialog.getDomRef().offsetHeight > 0, "Then the value help is rendered correctly (2/3)");
					assert.ok(oDialog && oDialog.getDomRef() && oDialog.getDomRef().offsetWidth > 0, "Then the value help is rendered correctly (3/3)");
					fnDone();
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oEditorElement.$("vhi"));
		});

		QUnit.test("When a model is set", function (assert) {
			assert.strictEqual(this.oEditorElement.getValue(), "sap-icon://target-group", "Then the editor has the correct value");
		});

		QUnit.test("When a value is changed in the model", function (assert) {
			this.oContextModel.setData({
				content: "sap-icon://complete"
			});
			assert.strictEqual(this.oEditorElement.getValue(), "sap-icon://complete", "Then the editor value is updated");
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			var fnDone = assert.async();

			this.oEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "sap-icon://complete", "Then it is updated correctly");
				fnDone();
			});

			this.oEditorElement.setValue("sap-icon://complete");
			QUnitUtils.triggerEvent("input", this.oEditorElement.getDomRef());
		});

		QUnit.test("When a binding path is provided", function (assert) {
			var fnDone = assert.async();

			this.oEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "{someBindingPath}", "Then the value is updated correctly");
				fnDone();
			});

			this.oEditorElement.setValue("{someBindingPath}");
			QUnitUtils.triggerEvent("input", this.oEditorElement.getDomRef());
		});

		QUnit.test("When an invalid input is provided", function (assert) {
			var fnDone = assert.async();

			// Load the i18n model for the value state text on error
			ResourceBundle.create({
				url: sap.ui.require.toUrl("sap/ui/integration/designtime/baseEditor/i18n/i18n.properties"),
				async: true
			}).then(function (oI18nBundle) {
				var oI18nModel = new ResourceModel({
					bundle: oI18nBundle
				});
				oI18nModel.setDefaultBindingMode("OneWay");
				this.oEditor.setModel(oI18nModel, "i18n");

				// Test
				this.oEditorElement.setValue("sap-icon://not-a-valid-icon");
				QUnitUtils.triggerEvent("input", this.oEditorElement.getDomRef());

				assert.strictEqual(this.oEditorElement.getValueState(), "Error", "Then the error is displayed");
				assert.strictEqual(this.oEditor.getBindingContext().getObject().value, "sap-icon://target-group", "Then the model is not updated");

				fnDone();
			}.bind(this));
		});

		QUnit.test("When the value help is filtered", function (assert) {
			var fnDone = assert.async();

			this.oEditorElement.attachValueHelpRequest(function () {
				this.oEditor._handleValueHelp.returnValues[0].then(function (oDialog) {
					oDialog.attachEventOnce("liveChange", function () {
						assert.ok(oDialog.getItems().length > 1, "Icons are shown");
						fnDone();
					});

					oDialog._searchField.getInputElement().value = "approval";
					QUnitUtils.triggerEvent("input", oDialog._searchField.getInputElement());
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oEditorElement.$("vhi"));
		});

		QUnit.test("When an icon is selected in the value help", function (assert) {
			var fnDone = assert.async();

			this.oEditorElement.attachValueHelpRequest(function () {
				this.oEditor.attachValueChange(function (oEvent) {
					assert.ok(oEvent.getParameter("value").indexOf("approval") >= 0, "Then a new icon is set");
					fnDone();
				});

				this.oEditor._handleValueHelp.returnValues[0].then(function (oDialog) {
					oDialog.attachEventOnce("liveChange", function () {
						QUnitUtils.triggerEvent("tap", oDialog.getItems()[2].getDomRef());
					});

					oDialog._searchField.getInputElement().value = "approval";
					QUnitUtils.triggerEvent("input", oDialog._searchField.getInputElement());
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oEditorElement.$("vhi"));
		});

		QUnit.test("When the value help icon selection is canceled", function (assert) {
			var fnDone = assert.async();

			this.oEditorElement.attachValueHelpRequest(function () {
				this.oEditor._handleValueHelp.returnValues[0].then(function (oDialog) {
					QUnitUtils.triggerEvent("tap", oDialog._getCancelButton().getDomRef());
					assert.strictEqual(this.oEditor.getBindingContext().getObject().value, "sap-icon://target-group", "Then the model is not updated");
					fnDone();
				}.bind(this));
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oEditorElement.$("vhi"));
		});
	});
});