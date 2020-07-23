/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/iconEditor/IconEditor",
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/qunit/QUnitUtils",
	"qunit/designtime/EditorQunitUtils",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/thirdparty/sinon-4"
], function (
	IconEditor,
	BaseEditor,
	QUnitUtils,
	EditorQunitUtils,
	ResourceBundle,
	ResourceModel,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Icon Editor: Given an editor config", {
		before: function () {
			this.oPropertyConfig = {
				tags: ["content"],
				label: "Test Icon",
				type: "icon",
				path: "content"
			};
		},
		beforeEach: function () {
			// needed to properly wait for the value help dialog to be initialized / opened
			sandbox.spy(IconEditor.prototype, "_handleValueHelp");

			var mConfig = {
				context: "/",
				properties: {
					sampleIcon: this.oPropertyConfig
				},
				propertyEditors: {
					"icon": "sap/ui/integration/designtime/baseEditor/propertyEditor/iconEditor/IconEditor"
				}
			};
			var mJson = {
				content: 3.14
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleIcon").then(function(aPropertyEditor) {
				this.oIconEditor = aPropertyEditor[0].getAggregation("propertyEditor");
				this.oIconEditor.setValue("sap-icon://target-group");
				sap.ui.getCore().applyChanges();
				this.oIconEditorElement = this.oIconEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When an IconEditor is created", function (assert) {
			assert.ok(this.oIconEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oIconEditor.getDomRef() && this.oIconEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oIconEditor.getDomRef() && this.oIconEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When the icon value help is opened", function (assert) {
			var fnDone = assert.async();

			this.oIconEditorElement.attachValueHelpRequest(function () {
				this.oIconEditor._handleValueHelp.returnValues[0].then(function (oDialog) {
					assert.ok(oDialog && oDialog.getDomRef() instanceof HTMLElement, "Then the value help is rendered correctly (1/3)");
					assert.ok(oDialog && oDialog.getDomRef() && oDialog.getDomRef().offsetHeight > 0, "Then the value help is rendered correctly (2/3)");
					assert.ok(oDialog && oDialog.getDomRef() && oDialog.getDomRef().offsetWidth > 0, "Then the value help is rendered correctly (3/3)");
					fnDone();
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oIconEditorElement.$("vhi"));
		});

		QUnit.test("When a value is set", function (assert) {
			assert.strictEqual(this.oIconEditorElement.getValue(), "sap-icon://target-group", "Then the editor has the correct value");
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			this.oIconEditor.setValue("sap-icon://complete");
			assert.strictEqual(this.oIconEditorElement.getValue(), "sap-icon://complete", "Then the editor value is updated");
		});

		QUnit.test("When a value is changed in the internal field", function (assert) {
			var fnDone = assert.async();

			this.oIconEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "sap-icon://complete", "Then it is updated correctly");
				fnDone();
			});

			EditorQunitUtils.setInputValueAndConfirm(this.oIconEditorElement, "sap-icon://complete");
		});

		QUnit.test("When a binding path is provided", function (assert) {
			var fnDone = assert.async();

			this.oIconEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), "{someBindingPath}", "Then the value is updated correctly");
				fnDone();
			});

			EditorQunitUtils.setInputValueAndConfirm(this.oIconEditorElement, "{someBindingPath}");
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
				this.oIconEditor.setModel(oI18nModel, "i18n");

				// Test
				EditorQunitUtils.setInputValueAndConfirm(this.oIconEditorElement, "sap-icon://not-a-valid-icon");

				// SetTimeout is needed due to async behaviour of blur() call in setInputValue() util.
				setTimeout(function () {
					assert.strictEqual(this.oIconEditorElement.getValueState(), "Error", "Then the error is displayed");
					assert.strictEqual(this.oIconEditor.getValue(), "sap-icon://target-group", "Then the editor value is not updated");
					fnDone();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("When the value help is filtered", function (assert) {
			var fnDone = assert.async();

			this.oIconEditorElement.attachValueHelpRequest(function () {
				this.oIconEditor._handleValueHelp.returnValues[0].then(function (oDialog) {
					oDialog.attachEventOnce("liveChange", function () {
						assert.ok(oDialog.getItems().length > 1, "Icons are shown");
						fnDone();
					});

					EditorQunitUtils.setSearchFieldValue(oDialog._searchField, "approval");
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oIconEditorElement.$("vhi"));
		});

		QUnit.test("When an icon is selected in the value help", function (assert) {
			var fnDone = assert.async();

			this.oIconEditorElement.attachValueHelpRequest(function () {
				this.oIconEditor.attachValueChange(function (oEvent) {
					assert.ok(oEvent.getParameter("value").indexOf("approval") >= 0, "Then a new icon is set");
					fnDone();
				});

				this.oIconEditor._handleValueHelp.returnValues[0].then(function (oDialog) {
					oDialog.attachEventOnce("liveChange", function () {
						QUnitUtils.triggerEvent("tap", oDialog.getItems()[2].getDomRef());
					});

					EditorQunitUtils.setSearchFieldValue(oDialog._searchField, "approval");
				});
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oIconEditorElement.$("vhi"));
		});

		QUnit.test("When the value help icon selection is canceled", function (assert) {
			var fnDone = assert.async();

			this.oIconEditorElement.attachValueHelpRequest(function () {
				this.oIconEditor._handleValueHelp.returnValues[0].then(function (oDialog) {
					QUnitUtils.triggerEvent("tap", oDialog._getCancelButton().getDomRef());
					assert.strictEqual(this.oIconEditor.getValue(), "sap-icon://target-group", "Then the model is not updated");
					fnDone();
				}.bind(this));
			}.bind(this));

			QUnitUtils.triggerEvent("click", this.oIconEditorElement.$("vhi"));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});