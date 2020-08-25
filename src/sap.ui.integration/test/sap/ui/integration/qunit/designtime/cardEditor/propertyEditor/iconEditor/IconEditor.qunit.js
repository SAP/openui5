/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/cardEditor/propertyEditor/iconEditor/IconEditor",
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
			this.mConfig = {
				context: "/",
				properties: {
					icon: this.oPropertyConfig
				},
				propertyEditors: {
					"icon": "sap/ui/integration/designtime/cardEditor/propertyEditor/iconEditor/IconEditor",
					"simpleicon": "sap/ui/integration/designtime/baseEditor/propertyEditor/iconEditor/IconEditor",
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			};
		},
		beforeEach: function () {
			// needed to properly wait for the settings dialog to be initialized / opened
			sandbox.spy(IconEditor.prototype, "_handleSettings");

			var mJson = {
				content: {src:"sap-icon://target-group"}
			};
			this.oBaseEditor = new BaseEditor({
				config: this.mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("icon").then(function(aPropertyEditor) {
				this.oIconEditor = aPropertyEditor[0].getAggregation("propertyEditor");
				this.oIconEditorTypeSelect = this.oIconEditor.getContent().getItems()[0].getContent()[0];
				this.oIconEditorInput = this.oIconEditor.getContent().getItems()[1].getContent()[0];
				this.oIconEditorSettingsButton = this.oIconEditor.getContent().getItems()[2];
				this.oIconModel = this.oIconEditor.getModel("icon");
				sap.ui.getCore().applyChanges();
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
			assert.equal(this.oIconEditor.getFocusDomRef().getAttribute("role"), "combobox",  "Then the focus is set correct");
		});

		QUnit.test("When an IconEditor is created", function (assert) {
			assert.equal(this.oIconEditorTypeSelect.getValue(), "icon",  "Then the default type is correct");
			assert.equal(this.oIconEditorInput.getValue(), "sap-icon://target-group",  "Then the given scr-value is set correct");
			assert.equal(this.oIconEditor.getModel("icon").getData().shape, "Circle",  "Then the default value for shape is set correct");
		});

		QUnit.test("When the type is changed to text", function (assert) {
			var fnDone = assert.async();
			this.oIconEditor.ready().then(function () {
				var oBox = this.oIconEditorTypeSelect.getAggregation("propertyEditor").getContent();
				EditorQunitUtils.selectComboBoxValue(oBox, "text");
				this.oIconEditor.ready().then(function(){
					var sEditorName = this.oIconEditor.getContent().getItems()[1].getContent()[0].getAggregation("propertyEditor").getMetadata().getName();
					var sEditorValue = this.oIconEditor.getContent().getItems()[1].getContent()[0].getAggregation("propertyEditor").getValue();
					assert.equal(sEditorName, "sap.ui.integration.designtime.baseEditor.propertyEditor.stringEditor.StringEditor", "After Type change there is an string editor");
					assert.equal(sEditorValue, "", "After Type change the value of the string editor is correct");
					fnDone();
				}.bind(this));
			}.bind(this));
			var sEditorName = this.oIconEditor.getContent().getItems()[1].getContent()[0].getAggregation("propertyEditor").getMetadata().getName();
			var sEditorValue = this.oIconEditor.getContent().getItems()[1].getContent()[0].getAggregation("propertyEditor").getValue();
			assert.equal(sEditorName, "sap.ui.integration.designtime.baseEditor.propertyEditor.iconEditor.IconEditor", "Before Type change there is an icon editor");
			assert.equal(sEditorValue, "sap-icon://target-group", "Before Type change the value of the icon editor is correct");
		});

		QUnit.test("When the type is changed to picture", function (assert) {
			var fnDone = assert.async();
			this.oIconEditor.ready().then(function () {
				var oBox = this.oIconEditorTypeSelect.getAggregation("propertyEditor").getContent();
				EditorQunitUtils.selectComboBoxValue(oBox, "picture");
				this.oIconEditor.ready().then(function(){
					var sEditorName = this.oIconEditor.getContent().getItems()[1].getContent()[0].getAggregation("propertyEditor").getMetadata().getName();
					var sEditorValue = this.oIconEditor.getContent().getItems()[1].getContent()[0].getAggregation("propertyEditor").getValue();
					assert.equal(sEditorName, "sap.ui.integration.designtime.baseEditor.propertyEditor.stringEditor.StringEditor", "After Type change there is an string editor");
					assert.equal(sEditorValue, "sap-icon://target-group", "After Type change the value of the string editor is correct");
					fnDone();
				}.bind(this));
			}.bind(this));
			var sEditorName = this.oIconEditor.getContent().getItems()[1].getContent()[0].getAggregation("propertyEditor").getMetadata().getName();
			var sEditorValue = this.oIconEditor.getContent().getItems()[1].getContent()[0].getAggregation("propertyEditor").getValue();
			assert.equal(sEditorName, "sap.ui.integration.designtime.baseEditor.propertyEditor.iconEditor.IconEditor", "Before Type change there is an icon editor");
			assert.equal(sEditorValue, "sap-icon://target-group", "Before Type change the value of the icon editor is correct");
		});

		QUnit.test("When the Settings Dialog is opened", function (assert) {
			var fnDone = assert.async();
			this.oIconEditor.ready().then(function () {
				this.oIconEditorSettingsButton.firePress();
				sap.ui.getCore().applyChanges();
				this.oIconEditor._handleSettings.returnValues[0].then(function (oDialog) {
					assert.ok(oDialog && oDialog.getDomRef() instanceof HTMLElement, "Then the settings dialog is rendered correctly (1/3)");
					assert.ok(oDialog && oDialog.getDomRef() && oDialog.getDomRef().offsetHeight > 0, "Then the settings dialog is rendered correctly (2/3)");
					assert.ok(oDialog && oDialog.getDomRef() && oDialog.getDomRef().offsetWidth > 0, "Then the settings dialog is rendered correctly (3/3)");
					fnDone();
				});
			}.bind(this));
		});

		QUnit.test("When the Settings Dialog is opened for the type 'icon'", function (assert) {
			var fnDone = assert.async();
			this.oIconEditor.ready().then(function () {
				this.oIconEditorSettingsButton.firePress();
				sap.ui.getCore().applyChanges();
				this.oIconEditor._handleSettings.returnValues[0].then(function (oDialog) {
					var nVisible = 0;
					var aItems = oDialog.getContent()[0].getItems()[0].getContent();
					aItems.forEach(function (oItem) {
						if (oItem.getVisible()) {
							nVisible++;
						}
					});
					assert.equal(nVisible, 4, "Then the settings dialog has two visible Elements"); //including labels, therefore visible*2
					fnDone();
				});
			}.bind(this));
		});

		QUnit.test("When the Settings Dialog is opened for the type 'text'", function (assert) {
			var fnDone = assert.async();
			this.oIconEditor.ready().then(function () {
				var oBox = this.oIconEditorTypeSelect.getAggregation("propertyEditor").getContent();
				EditorQunitUtils.selectComboBoxValue(oBox, "text");
				this.oIconEditor.ready().then(function(){
					this.oIconEditorSettingsButton.firePress();
					sap.ui.getCore().applyChanges();
					this.oIconEditor._handleSettings.returnValues[0].then(function (oDialog) {
						var nVisible = 0;
						var aItems = oDialog.getContent()[0].getItems()[0].getContent();
						aItems.forEach(function (oItem) {
							if (oItem.getVisible()) {
								nVisible++;
							}
						});
						assert.equal(nVisible, 2, "Then the settings dialog has only one visible Element"); //including labels, therefore visible*2
						fnDone();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("When a value is changed in the editor", function (assert) {
			this.oIconEditor.setValue({
				src: "sap-icon://complete"
			});
			assert.strictEqual(this.oIconEditorInput.getValue(), "sap-icon://complete", "Then the editor value is updated");
		});

		QUnit.test("When a text-value is changed in the editor", function (assert) {
			var fnDone = assert.async();
			this.oIconEditor.ready().then(function () {
				var oBox = this.oIconEditorTypeSelect.getAggregation("propertyEditor").getContent();
				EditorQunitUtils.selectComboBoxValue(oBox, "text");
				this.oIconEditor.ready().then(function(){
					sap.ui.getCore().applyChanges();
					var oInput = this.oIconEditor.getContent().getItems()[1].getContent()[0].getAggregation("propertyEditor").getContent();
					var sValueBefore = this.oIconEditor.getContent().getItems()[1].getContent()[0].getAggregation("propertyEditor").getValue();
					assert.equal(sValueBefore, "", "The value before changing is correct");
					EditorQunitUtils.setInputValueAndConfirm(oInput, "TT");
					assert.equal(this.oIconEditor.getValue().text, "TT", "The Icon Editor has correct Value after the change");
					fnDone();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("When a wrong text-value is entered in the editor", function (assert) {
			var fnDone = assert.async();
			this.oIconEditor.ready().then(function () {
				var oBox = this.oIconEditorTypeSelect.getAggregation("propertyEditor").getContent();
				EditorQunitUtils.selectComboBoxValue(oBox, "text");
				this.oIconEditor.ready().then(function(){
					sap.ui.getCore().applyChanges();
					var oInput = this.oIconEditor.getContent().getItems()[1].getContent()[0].getAggregation("propertyEditor").getContent();
					var sValueBefore = this.oIconEditor.getContent().getItems()[1].getContent()[0].getAggregation("propertyEditor").getValue();
					assert.equal(sValueBefore, "", "The value before changing is correct");
					EditorQunitUtils.setInputValueAndConfirm(oInput, "88");
					assert.equal(oInput.getValueState(), "Error", "The Input Element has status ERROR");
					assert.equal(this.oIconEditor.getValue(), undefined, "The Icon Editor has no Value");
					fnDone();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("When the Settings Dialog is opened", function (assert) {
			var fnDone = assert.async();
			this.oIconEditor.ready().then(function () {
				assert.equal(this.oIconEditor.getValue().src, "sap-icon://target-group", "Then the src-value of the icon is correct before opening");
				var oOldValue = this.oIconEditor.getValue();
				this.oIconEditorSettingsButton.firePress();
				sap.ui.getCore().applyChanges();
				this.oIconEditor._handleSettings.returnValues[0].then(function (oDialog) {
					var oInput = oDialog.getContent()[0].getItems()[0].getContent()[3];
					var oCancelButton = oDialog.getEndButton();
					EditorQunitUtils.setInputValueAndConfirm(oInput, "Alt-Text");
					oCancelButton.firePress();
					sap.ui.getCore().applyChanges();
					assert.equal(this.oIconEditor.getValue(), oOldValue, "The Value does not change on closing with 'cancel'");
					this.oIconEditorSettingsButton.firePress();
					sap.ui.getCore().applyChanges();
					this.oIconEditor._handleSettings.returnValues[0].then(function (oNewDialog) {
						var oInput = oNewDialog.getContent()[0].getItems()[0].getContent()[3];
						var oSaveButton = oDialog.getBeginButton();
						EditorQunitUtils.setInputValueAndConfirm(oInput, "Alt-Text");
						oSaveButton.firePress();
						sap.ui.getCore().applyChanges();
						assert.equal(this.oIconEditor.getValue().alt, "Alt-Text", "The Value is set on closing with 'save'");
						fnDone();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("When a settings value (alt) is set without src-value for type 'icon'", function (assert) {
			this.oIconEditor.setValue({
				src: "",
				alt: "Alt-text"
			});
			assert.strictEqual(this.oIconEditorInput.getValue(), "", "Then the value is cleared");
		});

		QUnit.test("When a settings value (alt) is set without src-value for type 'picture'", function (assert) {
			var fnDone = assert.async();
			this.oIconEditor.ready().then(function () {
				var oBox = this.oIconEditorTypeSelect.getAggregation("propertyEditor").getContent();
				EditorQunitUtils.selectComboBoxValue(oBox, "picture");
				this.oIconEditor.ready().then(function(){
					this.oIconEditor.setValue({
						src: "",
						alt: "Alt-text"
					});
					assert.strictEqual(this.oIconEditorInput.getValue(), "", "Then the value is cleared");
					fnDone();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("When an icon editor of type picture is created", function (assert) {
			var fnDone = assert.async();
			var mJsonPicture = {
				content: {src:"http://www.sap.com/picture.jpg"}
			};
			this.oBaseEditor2 = new BaseEditor({
				config: this.mConfig,
				json: mJsonPicture
			});
			this.oBaseEditor2.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oBaseEditor2.getPropertyEditorsByName("icon").then(function(aPropertyEditor) {
				this.oIconEditor2 = aPropertyEditor[0].getAggregation("propertyEditor");
				this.oIconModel2 = this.oIconEditor2.getModel("icon");
				this.oIconEditor2.ready().then(function () {
					assert.equal(this.oIconModel2.getData().type, "picture", "Then the correct type is found");
					this.oBaseEditor2.destroy();
					fnDone();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("When an icon editor of type text is created", function (assert) {
			var fnDone = assert.async();
			var mJsonText = {
				content: {text:"Some Text"}
			};
			this.oBaseEditor2 = new BaseEditor({
				config: this.mConfig,
				json: mJsonText
			});
			this.oBaseEditor2.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oBaseEditor2.getPropertyEditorsByName("icon").then(function(aPropertyEditor) {
				this.oIconEditor2 = aPropertyEditor[0].getAggregation("propertyEditor");
				this.oIconModel2 = this.oIconEditor2.getModel("icon");
				this.oIconEditor2.ready().then(function () {
					assert.equal(this.oIconModel2.getData().type, "text", "Then the correct type is found");
					this.oBaseEditor2.destroy();
					fnDone();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("When an icon editor with no content is created", function (assert) {
			var fnDone = assert.async();
			var mJsonEmpty = {};
			this.oBaseEditor3 = new BaseEditor({
				config: this.mConfig,
				json: mJsonEmpty
			});
			this.oBaseEditor3.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oBaseEditor3.getPropertyEditorsByName("icon").then(function(aPropertyEditor) {
				this.oIconEditor3 = aPropertyEditor[0].getAggregation("propertyEditor");
				this.oIconModel3 = this.oIconEditor3.getModel("icon");
				this.oIconEditor3.ready().then(function () {
					assert.equal(this.oIconModel3.getData().type, "icon", "Then the correct type is found");
					this.oBaseEditor3.destroy();
					fnDone();
				}.bind(this));
			}.bind(this));
		});

	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});