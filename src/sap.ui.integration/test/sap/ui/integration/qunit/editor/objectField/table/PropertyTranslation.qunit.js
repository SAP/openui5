/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../ContextHost",
	"sap/base/util/deepEqual",
	"sap/ui/core/util/MockServer",
	"sap/ui/core/Core",
	"sap/base/util/deepClone",
	"qunit/designtime/EditorQunitUtils"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	MockServer,
	Core,
	deepClone,
	EditorQunitUtils
) {
	"use strict";

	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	var oManifestForObjectFieldsWithTranslation = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectFieldWithTranslation",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectWithPropertiesDefinedAndValueFromJsonList": {
						"value": {"text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false, "_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"}}
					}
				},
				"destinations": {
					"local": {
						"name": "local",
						"defaultUrl": "./"
					}
				}
			}
		}
	};

	function destroyEditor(oEditor) {
		oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}
	}

	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function cleanUUID(oValue) {
		var oClonedValue = deepClone(oValue, 500);
		if (typeof oClonedValue === "string") {
			oClonedValue = JSON.parse(oClonedValue);
		}
		if (Array.isArray(oClonedValue)) {
			oClonedValue.forEach(function(oResult) {
				if (oResult._dt) {
					delete oResult._dt._uuid;
				}
				if (deepEqual(oResult._dt, {})) {
					delete oResult._dt;
				}
			});
		} else if (typeof oClonedValue === "object") {
			if (oClonedValue._dt) {
				delete oClonedValue._dt._uuid;
			}
			if (deepEqual(oClonedValue._dt, {})) {
				delete oClonedValue._dt;
			}
		}
		return oClonedValue;
	}

	QUnit.module("object property translation", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("syntax {{KEY}}: en", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectFieldsWithTranslation
				});
				EditorQunitUtils.isReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false }}), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oSelectionColumn = oTable.getColumns()[0];
					var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
					var oSelectionCell2 = oTable.getRows()[2].getCells()[0];
					assert.ok(oSelectionCell2.isA("sap.m.CheckBox"), "Row 2: Cell 1 is CheckBox");
					assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");
					var oToolbar = oTable.getExtension()[0];
					assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oKeyColumn = oTable.getColumns()[1];
					assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
					EditorQunitUtils.wait().then(function () {
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "translated key en", "SimpleForm label1: key label text translated");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "text", "SimpleForm field3: Has value");
							oFormField.setValue("{{TRANSLATED_TEXT01}}");
							oFormField.fireChange({ value: "{{TRANSLATED_TEXT01}}" });
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							EditorQunitUtils.wait().then(function () {
								var oNewObject = {"icon": "sap-icon://add","text": "{i18n>TRANSLATED_TEXT01}","url": "http://","number": 0.5, "_dt": {"_selected": true}};
								assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[8].getObject()), oNewObject), "Table: new row data");
								assert.ok(!oSelectionCell2.getSelected(), "Row 2: Cell 1 is not selected");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"icon": "sap-icon://add","text": "{i18n>TRANSLATED_TEXT01}","url": "http://","number": 0.5}), "Field 1: Value changed");
								// scroll to the bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								EditorQunitUtils.wait().then(function () {
									var oNewRow = oTable.getRows()[4];
									assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oNewObject), "Table: new row in the bottom");
									var oTextCell = oNewRow.getCells()[3];
									assert.equal(oTextCell.getText(), "translated text01 en", "Row: Text cell value");
									var oSelectionCell10 = oNewRow.getCells()[0];
									assert.ok(oSelectionCell10.getSelected(), "Row 10: Cell 1 is not selected");
									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("syntax {{KEY}}: fr", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("fr");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectFieldsWithTranslation
				});
				EditorQunitUtils.isReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false }}), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oSelectionColumn = oTable.getColumns()[0];
					var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
					var oSelectionCell2 = oTable.getRows()[2].getCells()[0];
					assert.ok(oSelectionCell2.isA("sap.m.CheckBox"), "Row 2: Cell 1 is CheckBox");
					assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");
					var oToolbar = oTable.getExtension()[0];
					assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oKeyColumn = oTable.getColumns()[1];
					assert.equal(oKeyColumn.getLabel().getText(), "translated key France", "Column key: key label text translated");
					EditorQunitUtils.wait().then(function () {
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "translated key France", "SimpleForm label1: key label text translated");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "text", "SimpleForm field3: Has value");
							oFormField.setValue("{{TRANSLATED_TEXT01}}");
							oFormField.fireChange({ value: "{{TRANSLATED_TEXT01}}" });
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							EditorQunitUtils.wait().then(function () {
								var oNewObject = {"icon": "sap-icon://add","text": "{i18n>TRANSLATED_TEXT01}","url": "http://","number": 0.5, "_dt": {"_selected": true}};
								assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[8].getObject()), oNewObject), "Table: new row data");
								assert.ok(!oSelectionCell2.getSelected(), "Row 2: Cell 1 is not selected");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"icon": "sap-icon://add","text": "{i18n>TRANSLATED_TEXT01}","url": "http://","number": 0.5}), "Field 1: Value changed");
								// scroll to the bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								EditorQunitUtils.wait().then(function () {
									var oNewRow = oTable.getRows()[4];
									assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oNewObject), "Table: new row in the bottom");
									var oTextCell = oNewRow.getCells()[3];
									assert.equal(oTextCell.getText(), "translated text01 France", "Row: Text cell value");
									var oSelectionCell10 = oNewRow.getCells()[0];
									assert.ok(oSelectionCell10.getSelected(), "Row 10: Cell 1 is not selected");
									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("syntax {i18n>KEY}: en", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectFieldsWithTranslation
				});
				EditorQunitUtils.isReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false }}), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oSelectionColumn = oTable.getColumns()[0];
					var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
					var oSelectionCell2 = oTable.getRows()[2].getCells()[0];
					assert.ok(oSelectionCell2.isA("sap.m.CheckBox"), "Row 2: Cell 1 is CheckBox");
					assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");
					var oToolbar = oTable.getExtension()[0];
					assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oKeyColumn = oTable.getColumns()[1];
					assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
					EditorQunitUtils.wait().then(function () {
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "translated key en", "SimpleForm label1: key label text translated");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "text", "SimpleForm field3: Has value");
							oFormField.setValue("{i18n>TRANSLATED_TEXT02}");
							oFormField.fireChange({ value: "{i18n>TRANSLATED_TEXT02}" });
							assert.equal(oFormField.getValue(), "{i18n>TRANSLATED_TEXT02}", "SimpleForm field3: Has formatted value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							EditorQunitUtils.wait().then(function () {
								var oNewObject = {"icon": "sap-icon://add","text": "{i18n>TRANSLATED_TEXT02}","url": "http://","number": 0.5, "_dt": {"_selected": true}};
								assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[8].getObject()), oNewObject), "Table: new row data");
								assert.ok(!oSelectionCell2.getSelected(), "Row 2: Cell 1 is not selected");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"icon": "sap-icon://add","text": "{i18n>TRANSLATED_TEXT02}","url": "http://","number": 0.5}), "Field 1: Value changed");
								// scroll to the bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								EditorQunitUtils.wait().then(function () {
									var oNewRow = oTable.getRows()[4];
									assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oNewObject), "Table: new row in the bottom");
									var oTextCell = oNewRow.getCells()[3];
									assert.equal(oTextCell.getText(), "translated text02 en", "Row: Text cell value");
									var oSelectionCell10 = oNewRow.getCells()[0];
									assert.ok(oSelectionCell10.getSelected(), "Row 10: Cell 1 is not selected");
									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("syntax {i18n>KEY}: fr", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("fr");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectFieldsWithTranslation
				});
				EditorQunitUtils.isReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false }}), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oSelectionColumn = oTable.getColumns()[0];
					var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
					var oSelectionCell2 = oTable.getRows()[2].getCells()[0];
					assert.ok(oSelectionCell2.isA("sap.m.CheckBox"), "Row 2: Cell 1 is CheckBox");
					assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");
					var oToolbar = oTable.getExtension()[0];
					assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oKeyColumn = oTable.getColumns()[1];
					assert.equal(oKeyColumn.getLabel().getText(), "translated key France", "Column key: key label text translated");
					EditorQunitUtils.wait().then(function () {
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "translated key France", "SimpleForm label1: key label text translated");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "text", "SimpleForm field3: Has value");
							oFormField.setValue("{i18n>TRANSLATED_TEXT02}");
							oFormField.fireChange({ value: "{i18n>TRANSLATED_TEXT02}" });
							assert.equal(oFormField.getValue(), "{i18n>TRANSLATED_TEXT02}", "SimpleForm field3: Has formatted value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							EditorQunitUtils.wait().then(function () {
								var oNewObject = {"icon": "sap-icon://add","text": "{i18n>TRANSLATED_TEXT02}","url": "http://","number": 0.5, "_dt": {"_selected": true}};
								assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[8].getObject()), oNewObject), "Table: new row data");
								assert.ok(!oSelectionCell2.getSelected(), "Row 2: Cell 1 is not selected");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {"icon": "sap-icon://add","text": "{i18n>TRANSLATED_TEXT02}","url": "http://","number": 0.5}), "Field 1: Value changed");
								// scroll to the bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								EditorQunitUtils.wait().then(function () {
									var oNewRow = oTable.getRows()[4];
									assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oNewObject), "Table: new row in the bottom");
									var oTextCell = oNewRow.getCells()[3];
									assert.equal(oTextCell.getText(), "translated text02 France", "Row: Text cell value");
									var oSelectionCell10 = oNewRow.getCells()[0];
									assert.ok(oSelectionCell10.getSelected(), "Row 10: Cell 1 is not selected");
									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					});
				});
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
