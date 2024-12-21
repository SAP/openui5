/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../ContextHost",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone",
	"qunit/designtime/EditorQunitUtils"
], function(
	x,
	Localization,
	Element,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	deepClone,
	EditorQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	var oManifestForobjectListWithValuesAndSpecialProperties = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectListWithValuesAndSpecialProperties",
			"type": "List",
			"configuration": {
				"destinations": {
					"local": {
						"name": "local",
						"defaultUrl": "./"
					}
				}
			}
		}
	};
	var oValue = {
		"text": "textnew",
		"key": "keynew",
		"type": "type03",
		"object": {
			"text": "textnew",
			"key": "keynew"
		}
	};

	var oValueInTable = deepClone(oValue, 500);
	oValueInTable._dt = {"_selected": true, "_position": 1};

	var oManifestForobjectListWithValuesAndSpecialPropertiesWithValue = deepClone(oManifestForobjectListWithValuesAndSpecialProperties, 500);
	oManifestForobjectListWithValuesAndSpecialPropertiesWithValue["sap.card"].configuration.parameters = {
		"objectsWithSpecialPropertiesDefined": {
			"value": [
				oValue
			]
		}
	};

	var oValueOfRow1 = { "text": "text01", "key": "key01", "type": "type01", "object": { "text": "text01", "key": "key01"}};
	var oDefaultNewObject = {"_dt": {"_selected": true},"text": "text"};

	var oObjectPropertyUpdated = {
		"text": "textupdated",
		"key": "keyupdated"
	};

	Localization.setLanguage("en");
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

	function cleanDT(oValue) {
		var oClonedValue = deepClone(oValue, 500);
		if (typeof oClonedValue === "string") {
			oClonedValue = JSON.parse(oClonedValue);
		}
		if (Array.isArray(oClonedValue)) {
			oClonedValue.forEach(function(oResult) {
				delete oResult._dt;
			});
		} else if (typeof oClonedValue === "object") {
			delete oClonedValue._dt;
		}
		return oClonedValue;
	}

	QUnit.module("StringPropertyWithValues", {
		before: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		beforeEach: function() {
			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";

				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oEditor.destroy();
		},
		after: function() {
			this.oHost.destroy();
			this.oContextHost.destroy();
			sandbox.restore();
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
				document.body.style.zIndex = "unset";
			}
		}
	}, function () {
		QUnit.test("basic - no value", function (assert) {
			var oTable, oField;
			var oEditor = this.oEditor;
			oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForobjectListWithValuesAndSpecialProperties
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object List with special properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: no Value");
					EditorQunitUtils.isReady(oEditor).then(function () {
						assert.ok(oEditor.isReady(), "Editor is ready");
						oTable = oField.getAggregation("_field");
						assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount beforeFiltering ok");
						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(cleanDT(cleanUUID(oRow1.getBindingContext().getObject())), oValueOfRow1), "Table: row1 value");
						var oCells1 = oRow1.getCells();
						assert.equal(oCells1.length, 5, "Row1: cells length ok");
						var oSelectionCell1 = oCells1[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
						assert.ok(oSelectionCell1.getEditable(), "Row 1: Cell 1 is editable");
						var oTypeCell = oCells1[3];
						assert.ok(oTypeCell.isA("sap.m.ComboBox"), "Row 1: Cell 4 is ComboBox");
						assert.ok(!oTypeCell.getEditable(), "Row 1: Cell 4 is not editable");
						assert.equal(oTypeCell.getSelectedKey(), oValueOfRow1.type, "Row 1: Cell 4 selectedkey ok");
						var oTableToolbar = oTable.getExtension()[0];
						var oEditButton = oTableToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange();
						assert.ok(oEditButton.getEnabled(), "Table: Edit button in toolbar enabled");
						oEditButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 10, "SimpleForm: length");
							var oFormLabel = oContents[4];
							var oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Type", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.ComboBox"), "SimpleForm field3: ComboBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm field3: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm field3: not Editable");
							assert.equal(oFormField.getSelectedKey(), oValueOfRow1.type, "SimpleForm field3: ComboBox Has value");
							var aComboBoxItems = oFormField.getItems();
							assert.equal(aComboBoxItems.length, 6, "SimpleForm field3: ComboBox items length");
							assert.equal(aComboBoxItems[0].getKey(), "type01", "SimpleForm field3: ComboBox item1 key");
							assert.equal(aComboBoxItems[0].getText(), "Type 01", "SimpleForm field3: ComboBox item1 text");
							assert.equal(aComboBoxItems[1].getKey(), "type02", "SimpleForm field3: ComboBox item2 key");
							assert.equal(aComboBoxItems[1].getText(), "Type 02", "SimpleForm field3: ComboBox item2 text");
							assert.equal(aComboBoxItems[2].getKey(), "type03", "SimpleForm field3: ComboBox item3 key");
							assert.equal(aComboBoxItems[2].getText(), "Type 03", "SimpleForm field3: ComboBox item3 text");
							assert.equal(aComboBoxItems[3].getKey(), "type04", "SimpleForm field3: ComboBox item4 key");
							assert.equal(aComboBoxItems[3].getText(), "Type 04", "SimpleForm field3: ComboBox item4 text");
							assert.equal(aComboBoxItems[4].getKey(), "type05", "SimpleForm field3: ComboBox item5 key");
							assert.equal(aComboBoxItems[4].getText(), "Type 05", "SimpleForm field3: ComboBox item5 text");
							assert.equal(aComboBoxItems[5].getKey(), "type06", "SimpleForm field3: ComboBox item6 key");
							assert.equal(aComboBoxItems[5].getText(), "Type 06", "SimpleForm field3: ComboBox item6 text");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field5: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm field5: Not Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm field5: Not Editable");
							assert.ok(deepEqual(cleanDT(cleanUUID(oFormField.getValue())), oValueOfRow1), "SimpleForm field5 textArea: Has correct value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(!oCancelButtonInPopover.getVisible(), "Popover: cancel button not visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(oCloseButtonInPopover.getVisible(), "Popover: close button visible");
							resolve();
						});
					});
				});
			});
		});

		QUnit.test("basic - exist value", function (assert) {
			var oTable, oCell, oField, oRemoveValueButton;
			var oEditor = this.oEditor;
			oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForobjectListWithValuesAndSpecialPropertiesWithValue
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object List with special properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), [oValue]), "Field 1: Value");
					EditorQunitUtils.isReady(oEditor).then(function () {
						assert.ok(oEditor.isReady(), "Editor is ready");
						oTable = oField.getAggregation("_field");
						assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
						oCell = oTable.getRows()[0].getCells()[0];
						assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
						var oSelectionColumn = oTable.getColumns()[0];
						oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
						var oCells1 = oRow1.getCells();
						assert.equal(oCells1.length, 5, "Row1: cells length ok");
						var oSelectionCell1 = oCells1[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(oSelectionCell1.getEditable(), "Row 1: Cell 1 is editable");
						var oTypeCell = oCells1[3];
						assert.ok(oTypeCell.isA("sap.m.ComboBox"), "Row 1: Cell 4 is ComboBox");
						assert.ok(!oTypeCell.getEditable(), "Row 1: Cell 4 is not editable");
						assert.equal(oTypeCell.getSelectedKey(), oValue.type, "Row 1: Cell 4 selectedkey ok");
						var oTableToolbar = oTable.getExtension()[0];
						var oEditButton = oTableToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange();
						assert.ok(oEditButton.getEnabled(), "Table: Edit button in toolbar enabled");
						oEditButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 10, "SimpleForm: length");
							var oFormLabel = oContents[4];
							var oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Type", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.ComboBox"), "SimpleForm field3: ComboBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm field3: Editable");
							assert.equal(oFormField.getSelectedKey(), oValue.type, "SimpleForm field3: ComboBox Has value");
							var aComboBoxItems = oFormField.getItems();
							assert.equal(aComboBoxItems.length, 6, "SimpleForm field3: ComboBox items length");
							assert.equal(aComboBoxItems[0].getKey(), "type01", "SimpleForm field3: ComboBox item1 key");
							assert.equal(aComboBoxItems[0].getText(), "Type 01", "SimpleForm field3: ComboBox item1 text");
							assert.equal(aComboBoxItems[1].getKey(), "type02", "SimpleForm field3: ComboBox item2 key");
							assert.equal(aComboBoxItems[1].getText(), "Type 02", "SimpleForm field3: ComboBox item2 text");
							assert.equal(aComboBoxItems[2].getKey(), "type03", "SimpleForm field3: ComboBox item3 key");
							assert.equal(aComboBoxItems[2].getText(), "Type 03", "SimpleForm field3: ComboBox item3 text");
							assert.equal(aComboBoxItems[3].getKey(), "type04", "SimpleForm field3: ComboBox item4 key");
							assert.equal(aComboBoxItems[3].getText(), "Type 04", "SimpleForm field3: ComboBox item4 text");
							assert.equal(aComboBoxItems[4].getKey(), "type05", "SimpleForm field3: ComboBox item5 key");
							assert.equal(aComboBoxItems[4].getText(), "Type 05", "SimpleForm field3: ComboBox item5 text");
							assert.equal(aComboBoxItems[5].getKey(), "type06", "SimpleForm field3: ComboBox item6 key");
							assert.equal(aComboBoxItems[5].getText(), "Type 06", "SimpleForm field3: ComboBox item6 text");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field5: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm field5: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm field5: Editable");
							assert.ok(deepEqual(cleanDT(cleanUUID(oFormField.getValue())), oValue), "SimpleForm field5 textArea: Has correct value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							resolve();
						});
					});
				});
			});
		});

		QUnit.test("add", function (assert) {
			var oTable, oCell, oField, oRemoveValueButton;
			var oEditor = this.oEditor;
			oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForobjectListWithValuesAndSpecialPropertiesWithValue
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object List with special properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), [oValue]), "Field 1: Value");
					EditorQunitUtils.isReady(oEditor).then(function () {
						assert.ok(oEditor.isReady(), "Editor is ready");
						oTable = oField.getAggregation("_field");
						assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
						oCell = oTable.getRows()[0].getCells()[0];
						assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
						var oSelectionColumn = oTable.getColumns()[0];
						oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
						var oCells1 = oRow1.getCells();
						assert.equal(oCells1.length, 5, "Row1: cells length ok");
						var oSelectionCell1 = oCells1[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(oSelectionCell1.getEditable(), "Row 1: Cell 1 is editable");
						var oTypeCell = oCells1[3];
						assert.ok(oTypeCell.isA("sap.m.ComboBox"), "Row 1: Cell 4 is ComboBox");
						assert.ok(!oTypeCell.getEditable(), "Row 1: Cell 4 is not editable");
						assert.equal(oTypeCell.getSelectedKey(), oValue.type, "Row 1: Cell 4 selectedkey ok");
						var oObjectCell = oCells1[4];
						assert.ok(oObjectCell.isA("sap.m.HBox"), "Row 1: Cell 4 is HBox");
						assert.equal(oObjectCell.getItems().length, 2, "Row 1: Cell 4 has 2 controls");
						assert.ok(oObjectCell.getItems()[0].isA("sap.m.Input"), "Row 1: Cell 4 control 1 is Input");
						assert.ok(!oObjectCell.getItems()[0].getEditable(), "Row 1: Cell 4 control 1 is not editable");
						var oObjectCellControl1Value = JSON.parse(oObjectCell.getItems()[0].getValue());
						assert.ok(deepEqual(oObjectCellControl1Value, oValue.object), "Row 1: Cell 4 control 1 value ok");
						assert.ok(oObjectCell.getItems()[1].isA("sap.m.Button"), "Row 1: Cell 4 control 2 is Button");
						assert.ok(oObjectCell.getItems()[1].getEnabled(), "Row 1: Cell 4 control 2 is enabled");
						assert.equal(oTypeCell.getSelectedKey(), oValue.type, "Row 1: Cell 4 selectedkey ok");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 10, "SimpleForm: length");
							var oFormLabel = oContents[4];
							var oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Type", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.ComboBox"), "SimpleForm field3: ComboBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm field3: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field3: Has empty value");
							oFormField.setSelectedKey("type05");
							oFormField.fireChange({ selectedItem: oFormField.getItems()[4] });
							EditorQunitUtils.wait().then(function () {
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field5: TextArea Field");
								assert.ok(!oFormField.getVisible(), "SimpleForm field5: Not Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm field5: Editable");
								var oUpdatedObject = deepClone(oDefaultNewObject, 500);
								oUpdatedObject.type = "type05";
								assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oUpdatedObject), "SimpleForm field5 textArea: Has updated value");
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
									assert.equal(oTable.getBinding().getCount(), 10, "Table: value length is 10");
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[9].getObject()), {"text": "text", "type": "type05", "_dt": {"_selected": true, "_position": 10}}), "Table: new row data");
									assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is still selected after new row added");
									assert.ok(deepEqual(cleanDT(cleanUUID(oField._getCurrentProperty("value"))), [oValue, {"text": "text", "type": "type05"}]), "Field 1: Value added");
									// scroll to the bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									EditorQunitUtils.wait().then(function () {
										var oRow5 = oTable.getRows()[4];
										var oSelectionCell5 = oRow5.getCells()[0];
										assert.ok(oSelectionCell5.isA("sap.m.CheckBox"), "Row 9: Cell 1 is CheckBox");
										assert.ok(oSelectionCell5.getSelected(), "Row 9: Cell 1 is selected");
										assert.ok(deepEqual(cleanUUID(oRow5.getBindingContext().getObject()), {"text": "text", "type": "type05", "_dt": {"_selected": true, "_position": 10}}), "Table: new row in the bottom");
										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("update with property fields(ComboBox) in popover", function (assert) {
			var oTable, oCell, oField, oRemoveValueButton;
			var oEditor = this.oEditor;
			oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForobjectListWithValuesAndSpecialPropertiesWithValue
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object List with special properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), [oValue]), "Field 1: Value");
					EditorQunitUtils.isReady(oEditor).then(function () {
						assert.ok(oEditor.isReady(), "Editor is ready");
						oTable = oField.getAggregation("_field");
						assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
						oCell = oTable.getRows()[0].getCells()[0];
						assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
						var oSelectionColumn = oTable.getColumns()[0];
						oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
						var oCells1 = oRow1.getCells();
						assert.equal(oCells1.length, 5, "Row1: cells length ok");
						var oSelectionCell1 = oCells1[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(oSelectionCell1.getEditable(), "Row 1: Cell 1 is editable");
						var oTypeCell = oCells1[3];
						assert.ok(oTypeCell.isA("sap.m.ComboBox"), "Row 1: Cell 4 is ComboBox");
						assert.ok(!oTypeCell.getEditable(), "Row 1: Cell 4 is not editable");
						assert.equal(oTypeCell.getSelectedKey(), oValue.type, "Row 1: Cell 4 selectedkey ok");
						var oTableToolbar = oTable.getExtension()[0];
						var oEditButton = oTableToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange();
						assert.ok(oEditButton.getEnabled(), "Table: Edit button in toolbar enabled");
						oEditButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 10, "SimpleForm: length");
							var oFormLabel = oContents[4];
							var oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Type", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.ComboBox"), "SimpleForm field3: ComboBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm field3: Editable");
							assert.equal(oFormField.getSelectedKey(), oValue.type, "SimpleForm field3: ComboBox Has value");
							oFormField.setSelectedKey("type05");
							oFormField.fireChange({ selectedItem: oFormField.getItems()[4] });
							EditorQunitUtils.wait().then(function () {
								var oUpdateValue = deepClone(oValue, 500);
								oUpdateValue.type = "type05";
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field5: TextArea Field");
								assert.ok(!oFormField.getVisible(), "SimpleForm field5: Not Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm field5: Editable");
								assert.ok(deepEqual(cleanDT(cleanUUID(oFormField.getValue())), oUpdateValue), "SimpleForm field5 textArea: Has correct value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oUpdateButtonInPopover.firePress();
								EditorQunitUtils.wait().then(function () {
									assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
									oUpdateValue._dt = {"_selected": true, "_position": 1};
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oUpdateValue), "Table: row data updated");
									assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is still selected after updated");
									delete oUpdateValue._dt;
									assert.ok(deepEqual(cleanDT(cleanUUID(oField._getCurrentProperty("value"))), [oUpdateValue]), "Field 1: Value changed to added object");
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("update with TextArea field in popover", function (assert) {
			var oTable, oCell, oField, oRemoveValueButton;
			var oEditor = this.oEditor;
			oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForobjectListWithValuesAndSpecialPropertiesWithValue
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object List with special properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), [oValue]), "Field 1: Value");
					EditorQunitUtils.isReady(oEditor).then(function () {
						assert.ok(oEditor.isReady(), "Editor is ready");
						oTable = oField.getAggregation("_field");
						assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
						oCell = oTable.getRows()[0].getCells()[0];
						assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
						var oSelectionColumn = oTable.getColumns()[0];
						oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
						var oCells1 = oRow1.getCells();
						assert.equal(oCells1.length, 5, "Row1: cells length ok");
						var oSelectionCell1 = oCells1[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(oSelectionCell1.getEditable(), "Row 1: Cell 1 is editable");
						var oTypeCell = oCells1[3];
						assert.ok(oTypeCell.isA("sap.m.ComboBox"), "Row 1: Cell 4 is ComboBox");
						assert.ok(!oTypeCell.getEditable(), "Row 1: Cell 4 is not editable");
						assert.equal(oTypeCell.getSelectedKey(), oValue.type, "Row 1: Cell 4 selectedkey ok");
						var oTableToolbar = oTable.getExtension()[0];
						var oEditButton = oTableToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange();
						assert.ok(oEditButton.getEnabled(), "Table: Edit button in toolbar enabled");
						oEditButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 10, "SimpleForm: length");
							var oFormLabel = oContents[4];
							var oTypeField = oContents[5];
							assert.equal(oFormLabel.getText(), "Type", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oTypeField.isA("sap.m.ComboBox"), "SimpleForm field3: ComboBox Field");
							assert.ok(oTypeField.getVisible(), "SimpleForm field3: Visible");
							assert.ok(oTypeField.getEditable(), "SimpleForm field3: Editable");
							assert.equal(oTypeField.getSelectedKey(), oValue.type, "SimpleForm field3: ComboBox Has value");
							oFormLabel = oContents[8];
							var oTextAreaField = oContents[9];
							assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
							assert.ok(oTextAreaField.isA("sap.m.TextArea"), "SimpleForm field5: TextArea Field");
							assert.ok(!oTextAreaField.getVisible(), "SimpleForm field5: Not Visible");
							assert.ok(oTextAreaField.getEditable(), "SimpleForm field5: Editable");
							assert.ok(deepEqual(cleanDT(cleanUUID(oTextAreaField.getValue())), oValue), "SimpleForm field5 textArea: Has correct value");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							EditorQunitUtils.wait().then(function () {
								assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(oTextAreaField.isA("sap.m.TextArea"), "SimpleForm field5: TextArea Field");
								assert.ok(oTextAreaField.getVisible(), "SimpleForm field5: Visible");
								assert.ok(oTextAreaField.getEditable(), "SimpleForm field5: Editable");
								assert.ok(deepEqual(cleanDT(cleanUUID(oTextAreaField.getValue())), oValue), "SimpleForm field5 textArea: Has correct value");
								var oUpdateValue = JSON.parse(oTextAreaField.getValue());
								oUpdateValue.type = "type05";
								var sNewValue = JSON.stringify(oUpdateValue, null, "\t");
								sNewValue = sNewValue.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g, function (s) {
									return s.substring(3, s.length - 3);
								});
								oTextAreaField.setValue(sNewValue);
								oTextAreaField.fireChange({ value: sNewValue});
								EditorQunitUtils.wait().then(function () {
									assert.equal(oTypeField.getSelectedKey(), oUpdateValue.type, "SimpleForm field3: ComboBox value updated");
									var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
									assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
									var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
									assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
									var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
									assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
									oUpdateButtonInPopover.firePress();
									EditorQunitUtils.wait().then(function () {
										assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
										oUpdateValue._dt = {"_selected": true, "_position": 1};
										assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oUpdateValue), "Table: row data updated");
										assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is still selected after updated");
										delete oUpdateValue._dt;
										assert.ok(deepEqual(cleanDT(cleanUUID(oField._getCurrentProperty("value"))), [oUpdateValue]), "Field 1: Value changed to added object");
										resolve();
									});
								});
							});
						});
					});
				});
			});
		});
	});

	QUnit.module("ObjectProperty", {
		before: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		beforeEach: function() {
			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";

				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oEditor.destroy();
		},
		after: function() {
			this.oHost.destroy();
			this.oContextHost.destroy();
			sandbox.restore();
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
				document.body.style.zIndex = "unset";
			}
		}
	}, function () {
		QUnit.test("basic - no value", function (assert) {
			var oTable, oField;
			var oEditor = this.oEditor;
			oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForobjectListWithValuesAndSpecialProperties
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object List with special properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: no Value");
					EditorQunitUtils.isReady(oEditor).then(function () {
						assert.ok(oEditor.isReady(), "Editor is ready");
						oTable = oField.getAggregation("_field");
						assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount beforeFiltering ok");
						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(cleanDT(cleanUUID(oRow1.getBindingContext().getObject())), oValueOfRow1), "Table: row1 value");
						var oCells1 = oRow1.getCells();
						assert.equal(oCells1.length, 5, "Row1: cells length ok");
						var oSelectionCell1 = oCells1[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
						assert.ok(oSelectionCell1.getEditable(), "Row 1: Cell 1 is editable");
						var oObjectCell = oCells1[4];
						assert.ok(oObjectCell.isA("sap.m.HBox"), "Row 1: Cell 4 is HBox");
						assert.equal(oObjectCell.getItems().length, 2, "Row 1: Cell 4 has 2 controls");
						var oObjectCellInput = oObjectCell.getItems()[0];
						assert.ok(oObjectCellInput.isA("sap.m.Input"), "Row 1: Cell 4 control 1 is Input");
						assert.ok(!oObjectCellInput.getEditable(), "Row 1: Cell 4 control 1 is not editable");
						assert.ok(deepEqual(JSON.parse(oObjectCellInput.getValue()), oValueOfRow1.object), "Row 1: Cell 4 control 1 value ok");
						var oDisplayButton = oObjectCell.getItems()[1];
						assert.ok(oDisplayButton.isA("sap.m.Button"), "Row 1: Cell 4 control 2 is Button");
						assert.ok(oDisplayButton.getEnabled(), "Row 1: Cell 4 control 2 is enabled");
						var oTableToolbar = oTable.getExtension()[0];
						var oEditButton = oTableToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange();
						assert.ok(oEditButton.getEnabled(), "Table: Edit button in toolbar enabled");
						oDisplayButton.firePress();
						EditorQunitUtils.wait().then(function () {
							assert.ok(oField._oObjectPropertyDetailsPopover.isOpen(), "Popover: object property details popover is open");
							var oTextAreaOfObjectProperty = oField._oObjectPropertyDetailsPopover.getContent()[0].getContent()[0];
							assert.ok(oTextAreaOfObjectProperty.isA("sap.m.TextArea"), "Popover: TextArea Field");
							assert.ok(oTextAreaOfObjectProperty.getVisible(), "Popover: TextArea Visible");
							assert.ok(!oTextAreaOfObjectProperty.getEditable(), "Popover: TextArea Not Editable");
							assert.ok(deepEqual(JSON.parse(oTextAreaOfObjectProperty.getValue()), oValueOfRow1.object), "Popover: TextArea has correct value");
							oField._oObjectPropertyDetailsPopover._oCloseButton.firePress();
							EditorQunitUtils.wait().then(function () {
								oEditButton.firePress();
								EditorQunitUtils.wait().then(function () {
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.equal(oContents.length, 10, "SimpleForm: length");
									var oFormLabel = oContents[6];
									var oFormField = oContents[7];
									assert.equal(oFormLabel.getText(), "Object", "SimpleForm label4: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field4: TextArea Field");
									assert.ok(oFormField.getVisible(), "SimpleForm field4: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm field4: not Editable");
									assert.ok(deepEqual(JSON.parse(oFormField.getValue()), oValueOfRow1.object), "SimpleForm field4: TextArea Has value");
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field8: Not Editable");
									assert.ok(deepEqual(cleanDT(cleanUUID(oFormField.getValue())), oValueOfRow1), "SimpleForm field textArea: Has correct value");
									var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
									assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
									var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
									assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
									var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
									assert.ok(!oCancelButtonInPopover.getVisible(), "Popover: cancel button not visible");
									var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
									assert.ok(oCloseButtonInPopover.getVisible(), "Popover: close button visible");
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("basic - exist value", function (assert) {
			var oTable, oCell, oField, oRemoveValueButton;
			var oEditor = this.oEditor;
			oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForobjectListWithValuesAndSpecialPropertiesWithValue
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object List with special properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), [oValue]), "Field 1: Value");
					EditorQunitUtils.isReady(oEditor).then(function () {
						assert.ok(oEditor.isReady(), "Editor is ready");
						oTable = oField.getAggregation("_field");
						assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
						oCell = oTable.getRows()[0].getCells()[0];
						assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
						var oSelectionColumn = oTable.getColumns()[0];
						oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
						var oCells1 = oRow1.getCells();
						assert.equal(oCells1.length, 5, "Row1: cells length ok");
						var oSelectionCell1 = oCells1[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(oSelectionCell1.getEditable(), "Row 1: Cell 1 is editable");
						var oObjectCell = oCells1[4];
						assert.ok(oObjectCell.isA("sap.m.HBox"), "Row 1: Cell 4 is HBox");
						assert.equal(oObjectCell.getItems().length, 2, "Row 1: Cell 4 has 2 controls");
						var oObjectCellInput = oObjectCell.getItems()[0];
						assert.ok(oObjectCellInput.isA("sap.m.Input"), "Row 1: Cell 4 control 1 is Input");
						assert.ok(!oObjectCellInput.getEditable(), "Row 1: Cell 4 control 1 is not editable");
						assert.ok(deepEqual(JSON.parse(oObjectCellInput.getValue()), oValue.object), "Row 1: Cell 4 control 1 value ok");
						var oDisplayButton = oObjectCell.getItems()[1];
						assert.ok(oDisplayButton.isA("sap.m.Button"), "Row 1: Cell 4 control 2 is Button");
						assert.ok(oDisplayButton.getEnabled(), "Row 1: Cell 4 control 2 is enabled");
						var oTableToolbar = oTable.getExtension()[0];
						var oEditButton = oTableToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange();
						assert.ok(oEditButton.getEnabled(), "Table: Edit button in toolbar enabled");
						oDisplayButton.firePress();
						EditorQunitUtils.wait().then(function () {
							assert.ok(oField._oObjectPropertyDetailsPopover.isOpen(), "Popover: object property details popover is open");
							var oTextAreaOfObjectProperty = oField._oObjectPropertyDetailsPopover.getContent()[0].getContent()[0];
							assert.ok(oTextAreaOfObjectProperty.isA("sap.m.TextArea"), "Popover: TextArea Field");
							assert.ok(oTextAreaOfObjectProperty.getVisible(), "Popover: TextArea Visible");
							assert.ok(!oTextAreaOfObjectProperty.getEditable(), "Popover: TextArea Not Editable");
							assert.ok(deepEqual(JSON.parse(oTextAreaOfObjectProperty.getValue()), oValue.object), "Popover: TextArea has correct value");
							oField._oObjectPropertyDetailsPopover._oCloseButton.firePress();
							EditorQunitUtils.wait().then(function () {
								oEditButton.firePress();
								EditorQunitUtils.wait().then(function () {
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.equal(oContents.length, 10, "SimpleForm: length");
									var oFormLabel = oContents[6];
									var oFormField = oContents[7];
									assert.equal(oFormLabel.getText(), "Object", "SimpleForm label4: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field4: TextArea Field");
									assert.ok(oFormField.getVisible(), "SimpleForm field4: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm field4: Editable");
									assert.ok(deepEqual(JSON.parse(oFormField.getValue()), oValue.object), "SimpleForm field4: TextArea Has value");
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field5: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm field5: Not Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm field5: Editable");
									assert.ok(deepEqual(cleanDT(cleanUUID(oFormField.getValue())), oValue), "SimpleForm field5 textArea: Has correct value");
									var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
									assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
									var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
									assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
									var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
									assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("add", function (assert) {
			var oTable, oCell, oField, oRemoveValueButton;
			var oEditor = this.oEditor;
			oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForobjectListWithValuesAndSpecialPropertiesWithValue
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object List with special properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), [oValue]), "Field 1: Value");
					EditorQunitUtils.isReady(oEditor).then(function () {
						assert.ok(oEditor.isReady(), "Editor is ready");
						oTable = oField.getAggregation("_field");
						assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
						oCell = oTable.getRows()[0].getCells()[0];
						assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
						var oSelectionColumn = oTable.getColumns()[0];
						oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
						var oCells1 = oRow1.getCells();
						assert.equal(oCells1.length, 5, "Row1: cells length ok");
						var oSelectionCell1 = oCells1[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(oSelectionCell1.getEditable(), "Row 1: Cell 1 is editable");
						var oTypeCell = oCells1[3];
						assert.ok(oTypeCell.isA("sap.m.ComboBox"), "Row 1: Cell 4 is ComboBox");
						assert.ok(!oTypeCell.getEditable(), "Row 1: Cell 4 is not editable");
						assert.equal(oTypeCell.getSelectedKey(), oValue.type, "Row 1: Cell 4 selectedkey ok");
						var oObjectCell = oCells1[4];
						assert.ok(oObjectCell.isA("sap.m.HBox"), "Row 1: Cell 4 is HBox");
						assert.equal(oObjectCell.getItems().length, 2, "Row 1: Cell 4 has 2 controls");
						assert.ok(oObjectCell.getItems()[0].isA("sap.m.Input"), "Row 1: Cell 4 control 1 is Input");
						assert.ok(!oObjectCell.getItems()[0].getEditable(), "Row 1: Cell 4 control 1 is not editable");
						var oObjectCellControl1Value = JSON.parse(oObjectCell.getItems()[0].getValue());
						assert.ok(deepEqual(oObjectCellControl1Value, oValue.object), "Row 1: Cell 4 control 1 value ok");
						assert.ok(oObjectCell.getItems()[1].isA("sap.m.Button"), "Row 1: Cell 4 control 2 is Button");
						assert.ok(oObjectCell.getItems()[1].getEnabled(), "Row 1: Cell 4 control 2 is enabled");
						assert.equal(oTypeCell.getSelectedKey(), oValue.type, "Row 1: Cell 4 selectedkey ok");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 10, "SimpleForm: length");
							var oFormLabel = oContents[6];
							var oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "Object", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field4: TextArea Field");
							assert.ok(oFormField.getVisible(), "SimpleForm field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm field4: Editable");
							assert.ok(!oFormField.getValue(), "SimpleForm field4: TextArea Has no value by default");

							var sNewObjectPropertyValue = JSON.stringify(oValue.object, null, "\t");
							sNewObjectPropertyValue = sNewObjectPropertyValue.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g, function (s) {
								return s.substring(3, s.length - 3);
							});
							oFormField.setValue(sNewObjectPropertyValue);
							oFormField.fireChange({ value: sNewObjectPropertyValue});

							EditorQunitUtils.wait().then(function () {
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field5: TextArea Field");
								assert.ok(!oFormField.getVisible(), "SimpleForm field5: Not Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm field5: Editable");
								var oUpdatedObject = deepClone(oDefaultNewObject, 500);
								oUpdatedObject.object = oValue.object;
								assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oUpdatedObject), "SimpleForm field5 textArea: Has updated value");
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
									assert.equal(oTable.getBinding().getCount(), 10, "Table: value length is 10");
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[9].getObject()), {"text": "text", "object": {"text": "textnew", "key": "keynew"}, "_dt": {"_selected": true, "_position": 10}}), "Table: new row data");
									assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is still selected after new row added");
									assert.ok(deepEqual(cleanDT(cleanUUID(oField._getCurrentProperty("value"))), [oValue, {"text": "text", "object": {"text": "textnew", "key": "keynew"}}]), "Field 1: Value changed to added object");
									// scroll to the bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									EditorQunitUtils.wait().then(function () {
										var oRow5 = oTable.getRows()[4];
										var oSelectionCell5 = oRow5.getCells()[0];
										assert.ok(oSelectionCell5.isA("sap.m.CheckBox"), "Row 9: Cell 1 is CheckBox");
										assert.ok(oSelectionCell5.getSelected(), "Row 9: Cell 1 is selected");
										assert.ok(deepEqual(cleanUUID(oRow5.getBindingContext().getObject()), {"text": "text", "object": {"text": "textnew", "key": "keynew"}, "_dt": {"_selected": true, "_position": 10}}), "Table: new row in the bottom");
										var oCells5 = oRow5.getCells();
										var oObjectCell5 = oCells5[4];
										assert.ok(oObjectCell5.isA("sap.m.HBox"), "Row 9: Cell 4 is HBox");
										assert.equal(oObjectCell5.getItems().length, 2, "Row 9: Cell 4 has 2 controls");
										var oObjectCellInput5 = oObjectCell5.getItems()[0];
										assert.ok(oObjectCellInput5.isA("sap.m.Input"), "Row 9: Cell 4 control 1 is Input");
										assert.ok(!oObjectCellInput5.getEditable(), "Row 9: Cell 4 control 1 is not editable");
										assert.ok(deepEqual(JSON.parse(oObjectCellInput5.getValue()), oValue.object), "Row 9: Cell 4 control 1 value ok");
										var oDisplayButton5 = oObjectCell5.getItems()[1];
										assert.ok(oDisplayButton5.isA("sap.m.Button"), "Row 9: Cell 4 control 2 is Button");
										assert.ok(oDisplayButton5.getEnabled(), "Row 9: Cell 4 control 2 is enabled");
										oDisplayButton5.firePress();
										EditorQunitUtils.wait().then(function () {
											assert.ok(oField._oObjectPropertyDetailsPopover.isOpen(), "Popover: object property details popover is open");
											var oTextAreaOfObjectProperty = oField._oObjectPropertyDetailsPopover.getContent()[0].getContent()[0];
											assert.ok(oTextAreaOfObjectProperty.isA("sap.m.TextArea"), "Popover: TextArea Field");
											assert.ok(oTextAreaOfObjectProperty.getVisible(), "Popover: TextArea Visible");
											assert.ok(!oTextAreaOfObjectProperty.getEditable(), "Popover: TextArea Not Editable");
											assert.ok(deepEqual(JSON.parse(oTextAreaOfObjectProperty.getValue()), oValue.object), "Popover: TextArea has correct value");
											oField._oObjectPropertyDetailsPopover._oCloseButton.firePress();
											resolve();
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("update with property fields(TextArea) in popover", function (assert) {
			var oTable, oCell, oField, oRemoveValueButton;
			var oEditor = this.oEditor;
			oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForobjectListWithValuesAndSpecialPropertiesWithValue
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object List with special properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), [oValue]), "Field 1: Value");
					EditorQunitUtils.isReady(oEditor).then(function () {
						assert.ok(oEditor.isReady(), "Editor is ready");
						oTable = oField.getAggregation("_field");
						assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
						oCell = oTable.getRows()[0].getCells()[0];
						assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
						var oSelectionColumn = oTable.getColumns()[0];
						oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
						var oCells1 = oRow1.getCells();
						assert.equal(oCells1.length, 5, "Row1: cells length ok");
						var oSelectionCell1 = oCells1[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(oSelectionCell1.getEditable(), "Row 1: Cell 1 is editable");
						var oObjectCell = oCells1[4];
						assert.ok(oObjectCell.isA("sap.m.HBox"), "Row 1: Cell 4 is HBox");
						assert.equal(oObjectCell.getItems().length, 2, "Row 1: Cell 4 has 2 controls");
						var oObjectCellInput = oObjectCell.getItems()[0];
						assert.ok(oObjectCellInput.isA("sap.m.Input"), "Row 1: Cell 4 control 1 is Input");
						assert.ok(!oObjectCellInput.getEditable(), "Row 1: Cell 4 control 1 is not editable");
						assert.ok(deepEqual(JSON.parse(oObjectCellInput.getValue()), oValue.object), "Row 1: Cell 4 control 1 value ok");
						var oDisplayButton = oObjectCell.getItems()[1];
						assert.ok(oDisplayButton.isA("sap.m.Button"), "Row 1: Cell 4 control 2 is Button");
						assert.ok(oDisplayButton.getEnabled(), "Row 1: Cell 4 control 2 is enabled");
						var oTableToolbar = oTable.getExtension()[0];
						var oEditButton = oTableToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange();
						assert.ok(oEditButton.getEnabled(), "Table: Edit button in toolbar enabled");
						oEditButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 10, "SimpleForm: length");
							var oFormLabel = oContents[6];
							var oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "Object", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field4: TextArea Field");
							assert.ok(oFormField.getVisible(), "SimpleForm field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm field4: Editable");
							assert.ok(deepEqual(JSON.parse(oFormField.getValue()), oValue.object), "SimpleForm field4: TextArea Has value");

							var sNewObjectPropertyValue = JSON.stringify(oObjectPropertyUpdated, null, "\t");
							sNewObjectPropertyValue = sNewObjectPropertyValue.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g, function (s) {
								return s.substring(3, s.length - 3);
							});
							oFormField.setValue(sNewObjectPropertyValue);
							oFormField.fireChange({ value: sNewObjectPropertyValue});
							EditorQunitUtils.wait().then(function () {
								var oUpdateValue = deepClone(oValue, 500);
								oUpdateValue.object = oObjectPropertyUpdated;
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field5: TextArea Field");
								assert.ok(!oFormField.getVisible(), "SimpleForm field5: Not Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm field5: Editable");
								assert.ok(deepEqual(cleanDT(cleanUUID(oFormField.getValue())), oUpdateValue), "SimpleForm field5 textArea: Has correct value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oUpdateButtonInPopover.firePress();
								EditorQunitUtils.wait().then(function () {
									assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
									oUpdateValue._dt = {"_selected": true, "_position": 1};
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oUpdateValue), "Table: row data updated");
									assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oUpdateValue), "Table: row data updated");

									assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is still selected after updated");
									delete oUpdateValue._dt;
									assert.ok(deepEqual(cleanDT(cleanUUID(oField._getCurrentProperty("value"))), [oUpdateValue]), "Field 1: Value changed to added object");

									assert.ok(!oObjectCellInput.getEditable(), "Row 1: Cell 4 control 1 is not editable");
									assert.ok(deepEqual(JSON.parse(oObjectCellInput.getValue()), oObjectPropertyUpdated), "Row 1: Cell 4 control 1 value updated");
									var oDisplayButton = oObjectCell.getItems()[1];
									assert.ok(oDisplayButton.isA("sap.m.Button"), "Row 1: Cell 4 control 2 is Button");
									assert.ok(oDisplayButton.getEnabled(), "Row 1: Cell 4 control 2 is enabled");

									oDisplayButton.firePress();
									EditorQunitUtils.wait().then(function () {
										assert.ok(oField._oObjectPropertyDetailsPopover.isOpen(), "Popover: object property details popover is open");
										var oTextAreaOfObjectProperty = oField._oObjectPropertyDetailsPopover.getContent()[0].getContent()[0];
										assert.ok(oTextAreaOfObjectProperty.isA("sap.m.TextArea"), "Popover: TextArea Field");
										assert.ok(oTextAreaOfObjectProperty.getVisible(), "Popover: TextArea Visible");
										assert.ok(!oTextAreaOfObjectProperty.getEditable(), "Popover: TextArea Not Editable");
										assert.ok(deepEqual(JSON.parse(oTextAreaOfObjectProperty.getValue()), oObjectPropertyUpdated), "Popover: TextArea has correct value");
										oField._oObjectPropertyDetailsPopover._oCloseButton.firePress();
										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("update with TextArea field in popover", function (assert) {
			var oTable, oCell, oField, oRemoveValueButton;
			var oEditor = this.oEditor;
			oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForobjectListWithValuesAndSpecialPropertiesWithValue
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(oEditor).then(function () {
					assert.ok(oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object List with special properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), [oValue]), "Field 1: Value");
					EditorQunitUtils.isReady(oEditor).then(function () {
						assert.ok(oEditor.isReady(), "Editor is ready");
						oTable = oField.getAggregation("_field");
						assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
						oCell = oTable.getRows()[0].getCells()[0];
						assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
						var oSelectionColumn = oTable.getColumns()[0];
						oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
						var oCells1 = oRow1.getCells();
						assert.equal(oCells1.length, 5, "Row1: cells length ok");
						var oSelectionCell1 = oCells1[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						assert.ok(oSelectionCell1.getEditable(), "Row 1: Cell 1 is editable");
						var oObjectCell = oCells1[4];
						assert.ok(oObjectCell.isA("sap.m.HBox"), "Row 1: Cell 4 is HBox");
						assert.equal(oObjectCell.getItems().length, 2, "Row 1: Cell 4 has 2 controls");
						var oObjectCellInput = oObjectCell.getItems()[0];
						assert.ok(oObjectCellInput.isA("sap.m.Input"), "Row 1: Cell 4 control 1 is Input");
						assert.ok(!oObjectCellInput.getEditable(), "Row 1: Cell 4 control 1 is not editable");
						assert.ok(deepEqual(JSON.parse(oObjectCellInput.getValue()), oValue.object), "Row 1: Cell 4 control 1 value ok");
						var oDisplayButton = oObjectCell.getItems()[1];
						assert.ok(oDisplayButton.isA("sap.m.Button"), "Row 1: Cell 4 control 2 is Button");
						assert.ok(oDisplayButton.getEnabled(), "Row 1: Cell 4 control 2 is enabled");
						var oTableToolbar = oTable.getExtension()[0];
						var oEditButton = oTableToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange();
						assert.ok(oEditButton.getEnabled(), "Table: Edit button in toolbar enabled");
						oEditButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 10, "SimpleForm: length");
							var oFormLabel = oContents[6];
							var oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "Object", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field4: TextArea Field");
							assert.ok(oFormField.getVisible(), "SimpleForm field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm field4: Editable");
							assert.ok(deepEqual(JSON.parse(oFormField.getValue()), oValue.object), "SimpleForm field4: TextArea Has value");

							oFormLabel = oContents[8];
							var oTextAreaField = oContents[9];
							assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
							assert.ok(oTextAreaField.isA("sap.m.TextArea"), "SimpleForm field5: TextArea Field");
							assert.ok(!oTextAreaField.getVisible(), "SimpleForm field5: Not Visible");
							assert.ok(oTextAreaField.getEditable(), "SimpleForm field5: Editable");
							assert.ok(deepEqual(cleanDT(cleanUUID(oTextAreaField.getValue())), oValue), "SimpleForm field5 textArea: Has correct value");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							EditorQunitUtils.wait().then(function () {
								assert.equal(oFormLabel.getText(), "", "SimpleForm label5: Has no label text");
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(oTextAreaField.isA("sap.m.TextArea"), "SimpleForm field5: TextArea Field");
								assert.ok(oTextAreaField.getVisible(), "SimpleForm field5: Visible");
								assert.ok(oTextAreaField.getEditable(), "SimpleForm field5: Editable");
								assert.ok(deepEqual(cleanDT(cleanUUID(oTextAreaField.getValue())), oValue), "SimpleForm field5 textArea: Has correct value");
								var oUpdateValue = JSON.parse(oTextAreaField.getValue());
								oUpdateValue.object = oObjectPropertyUpdated;
								var sNewValue = JSON.stringify(oUpdateValue, null, "\t");
								sNewValue = sNewValue.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g, function (s) {
									return s.substring(3, s.length - 3);
								});
								oTextAreaField.setValue(sNewValue);
								oTextAreaField.fireChange({ value: sNewValue});
								EditorQunitUtils.wait().then(function () {
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.equal(oFormLabel.getText(), "Object", "SimpleForm label4: Has label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm field4: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm field4: Not Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm field4: Editable");
									assert.ok(deepEqual(JSON.parse(oFormField.getValue()), oObjectPropertyUpdated), "SimpleForm field4: TextArea Has value");
									var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
									assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
									var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
									assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
									var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
									assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
									oUpdateButtonInPopover.firePress();
									EditorQunitUtils.wait().then(function () {
										assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
										oUpdateValue._dt = {"_selected": true, "_position": 1};
										assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oUpdateValue), "Table: row data updated");
										assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oUpdateValue), "Table: row data updated");

										assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is still selected after updated");
										delete oUpdateValue._dt;
										assert.ok(deepEqual(cleanDT(cleanUUID(oField._getCurrentProperty("value"))), [oUpdateValue]), "Field 1: Value changed to added object");

										assert.ok(!oObjectCellInput.getEditable(), "Row 1: Cell 4 control 1 is not editable");
										assert.ok(deepEqual(JSON.parse(oObjectCellInput.getValue()), oObjectPropertyUpdated), "Row 1: Cell 4 control 1 value updated");
										var oDisplayButton = oObjectCell.getItems()[1];
										assert.ok(oDisplayButton.isA("sap.m.Button"), "Row 1: Cell 4 control 2 is Button");
										assert.ok(oDisplayButton.getEnabled(), "Row 1: Cell 4 control 2 is enabled");

										oDisplayButton.firePress();
										EditorQunitUtils.wait().then(function () {
											assert.ok(oField._oObjectPropertyDetailsPopover.isOpen(), "Popover: object property details popover is open");
											var oTextAreaOfObjectProperty = oField._oObjectPropertyDetailsPopover.getContent()[0].getContent()[0];
											assert.ok(oTextAreaOfObjectProperty.isA("sap.m.TextArea"), "Popover: TextArea Field");
											assert.ok(oTextAreaOfObjectProperty.getVisible(), "Popover: TextArea Visible");
											assert.ok(!oTextAreaOfObjectProperty.getEditable(), "Popover: TextArea Not Editable");
											assert.ok(deepEqual(JSON.parse(oTextAreaOfObjectProperty.getValue()), oObjectPropertyUpdated), "Popover: TextArea has correct value");
											oField._oObjectPropertyDetailsPopover._oCloseButton.firePress();
											resolve();
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});
