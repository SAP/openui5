/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/base/util/deepEqual"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
	var aObjectsParameterValue = [
		{"a": "aa", "b": "bb", "d": 2},
		{"b": "bbb", "c": "ccc", "d": 3},
		{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
		{"a": "aaa", "b": "bbb", "e": true}
	];
	var oManifestForObjectListFields = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectListWithTypeDefinedOnly",
			"type": "List",
			"configuration": {
				"parameters": {
					"objects": {
						"value": aObjectsParameterValue
					}
				},
				"destinations": {
					"local": {
						"name": "local",
						"defaultUrl": "./"
					},
					"mock_request": {
						"name": "mock_request"
					}
				}
			}
		}
	};

	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

	QUnit.module("TextArea", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

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
		QUnit.test("no value, add, update, delete", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithTypeDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
							},
							"destinations": {
								"local": {
									"name": "local",
									"defaultUrl": "./"
								},
								"mock_request": {
									"name": "mock_request"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					var oTextArea = oField.getAggregation("_field");
					assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
					assert.ok(oTextArea.getValue() === "", "Field 1: Object Value null");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value null");
					var sNewValue = '[{\n\t"string": "string value",\n\t"boolean": true,\n\t"integer": 5,\n\t"number": 5.22\n}]';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [{"string":"string value", "boolean": true, "integer": 5, "number": 5.22}]), "Field 1: DT Value created");

					sNewValue = '[{\n\t"string1": "string value 1",\n\t"boolean": true,\n\t"integer": 5,\n\t"number": 5.22\n}]';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [{"string1":"string value 1", "boolean": true, "integer": 5, "number": 5.22}]), "Field 1: DT Value updated");

					sNewValue = '[]';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), []), "Field 1: DT Value updated");

					sNewValue = '';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value deleted");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("[] as value, add, update, delete", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithTypeDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objects": {
									"value": []
								}
							},
							"destinations": {
								"local": {
									"name": "local",
									"defaultUrl": "./"
								},
								"mock_request": {
									"name": "mock_request"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					var oTextArea = oField.getAggregation("_field");
					assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
					assert.ok(oTextArea.getValue() === "[]", "Field 1: Object Value []");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), []), "Field 1: DT Value []");
					var sNewValue = '[{\n\t"string": "string value",\n\t"boolean": true,\n\t"integer": 5,\n\t"number": 5.22\n}]';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [{"string":"string value", "boolean": true, "integer": 5, "number": 5.22}]), "Field 1: DT Value updated");

					sNewValue = '[{\n\t"string1": "string value 1",\n\t"boolean": true,\n\t"integer": 5,\n\t"number": 5.22\n}]';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [{"string1":"string value 1", "boolean": true, "integer": 5, "number": 5.22}]), "Field 1: DT Value updated");

					sNewValue = '[]';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(oField._getCurrentProperty("value"), []), "Field 1: DT Value updated");

					sNewValue = '';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value deleted");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("TextArea->Table - select and unselect", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

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
		QUnit.test("01", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					var oEditButton2 = oActionHBox.getItems()[0];
					assert.ok(oEditButton2.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton2.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton4 = oActionHBox.getItems()[0];
					assert.ok(oEditButton4.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton4.getVisible(), "Row 4: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oEditButton1.onAfterRendering = function(oEvent) {
						oEditButton1.onAfterRendering = function () {};
						wait(2000).then(function () {
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2}
							]), "Field 1: DT Value");
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3}
							]), "Field 1: DT Value");
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("02", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					var oEditButton2 = oActionHBox.getItems()[0];
					assert.ok(oEditButton2.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton2.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton4 = oActionHBox.getItems()[0];
					assert.ok(oEditButton4.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton4.getVisible(), "Row 4: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oEditButton2.onAfterRendering = function(oEvent) {
						oEditButton2.onAfterRendering = function () {};
						wait(2000).then(function () {
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2}
							]), "Field 1: DT Value");
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3}
							]), "Field 1: DT Value");
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("03", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					var oEditButton2 = oActionHBox.getItems()[0];
					assert.ok(oEditButton2.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton2.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton4 = oActionHBox.getItems()[0];
					assert.ok(oEditButton4.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton4.getVisible(), "Row 4: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oEditButton3.onAfterRendering = function(oEvent) {
						oEditButton3.onAfterRendering = function () {};
						wait(2000).then(function () {
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2}
							]), "Field 1: DT Value");
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3}
							]), "Field 1: DT Value");
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("04", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					var oEditButton2 = oActionHBox.getItems()[0];
					assert.ok(oEditButton2.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton2.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton4 = oActionHBox.getItems()[0];
					assert.ok(oEditButton4.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton4.getVisible(), "Row 4: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oEditButton4.onAfterRendering = function(oEvent) {
						oEditButton4.onAfterRendering = function () {};
						wait(2000).then(function () {
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2}
							]), "Field 1: DT Value");
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3}
							]), "Field 1: DT Value");
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("TextArea->Table - selectAll and deselectAll", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

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
		QUnit.test("01", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					var oEditButton2 = oActionHBox.getItems()[0];
					assert.ok(oEditButton2.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton2.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton4 = oActionHBox.getItems()[0];
					assert.ok(oEditButton4.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton4.getVisible(), "Row 4: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oEditButton1.onAfterRendering = function(oEvent) {
						oEditButton1.onAfterRendering = function () {};
						wait(2000).then(function () {
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							// selectAll
							oTable.$("selall").trigger("click");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							// deselectAll
							oTable.$("selall").trigger("click");
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("02", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					var oEditButton2 = oActionHBox.getItems()[0];
					assert.ok(oEditButton2.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton2.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton4 = oActionHBox.getItems()[0];
					assert.ok(oEditButton4.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton4.getVisible(), "Row 4: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oEditButton2.onAfterRendering = function(oEvent) {
						oEditButton2.onAfterRendering = function () {};
						wait(2000).then(function () {
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							// selectAll
							oTable.$("selall").trigger("click");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							// deselectAll
							oTable.$("selall").trigger("click");
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("03", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					var oEditButton2 = oActionHBox.getItems()[0];
					assert.ok(oEditButton2.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton2.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton4 = oActionHBox.getItems()[0];
					assert.ok(oEditButton4.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton4.getVisible(), "Row 4: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oEditButton2.onAfterRendering = function(oEvent) {
						oEditButton2.onAfterRendering = function () {};
						wait(2000).then(function () {
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							// selectAll
							oTable.$("selall").trigger("click");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							// deselectAll
							oTable.$("selall").trigger("click");
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("04", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					var oEditButton2 = oActionHBox.getItems()[0];
					assert.ok(oEditButton2.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton2.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton4 = oActionHBox.getItems()[0];
					assert.ok(oEditButton4.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton4.getVisible(), "Row 4: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oEditButton2.onAfterRendering = function(oEvent) {
						oEditButton2.onAfterRendering = function () {};
						wait(2000).then(function () {
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
							// selectAll
							oTable.$("selall").trigger("click");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							// deselectAll
							oTable.$("selall").trigger("click");
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("TextArea->Table - add", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

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
		QUnit.test("add with property fields in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow = oTable.getRows()[0];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					oRow = oTable.getRows()[1];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					oRow = oTable.getRows()[2];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							assert.ok(!oAddButtonInPopover.getEnabled(), "Popover: add button not enabled");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(oContents[11].getValue() === '{}', "SimpleForm field textArea: Has value {}");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "a", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("a1");
							oFormField.fireChange({ value: "a1" });
							assert.ok(oAddButtonInPopover.getEnabled(), "Popover: add button enabled since has value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "b", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field2: Has No value");
							oFormField.setValue("b1");
							oFormField.fireChange({ value: "b1" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "d", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field3: Has no value");
							oFormField.setValue(2);
							oFormField.fireChange({ value: 2 });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "c", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field4: Has no value");
							oFormField.setValue("c1");
							oFormField.fireChange({ value: "c1" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "e", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"a": "a1",\n\t"b": "b1",\n\t"d": 2,\n\t"c": "c1",\n\t"e": true\n}', "SimpleForm field textArea: Has updated value");
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 5, "Table: value length is 5");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[4].getObject(), {"a": "a1","b": "b1","c": "c1","d": 2,"e": true}), "Table: new row");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: rows selected");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add with property fields in popover but cancel", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow = oTable.getRows()[0];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					oRow = oTable.getRows()[1];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					oRow = oTable.getRows()[2];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							assert.ok(!oAddButtonInPopover.getEnabled(), "Popover: add button not enabled");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(oContents[11].getValue() === '{}', "SimpleForm field textArea: Has value {}");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "a", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("a1");
							oFormField.fireChange({ value: "a1" });
							assert.ok(oAddButtonInPopover.getEnabled(), "Popover: add button enabled since has value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "b", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field2: Has No value");
							oFormField.setValue("b1");
							oFormField.fireChange({ value: "b1" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "d", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field3: Has no value");
							oFormField.setValue(2);
							oFormField.fireChange({ value: 2 });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "c", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field4: Has no value");
							oFormField.setValue("c1");
							oFormField.fireChange({ value: "c1" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "e", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"a": "a1",\n\t"b": "b1",\n\t"d": 2,\n\t"c": "c1",\n\t"e": true\n}', "SimpleForm field textArea: Has updated value");
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is still checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add with TextArea field in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow = oTable.getRows()[0];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					oRow = oTable.getRows()[1];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					oRow = oTable.getRows()[2];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							assert.ok(!oAddButtonInPopover.getEnabled(), "Popover: add button not enabled");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(oContents[11].getValue() === '{}', "SimpleForm field textArea: Has value {}");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "a", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("a1");
							oFormField.fireChange({ value: "a1" });
							assert.ok(oAddButtonInPopover.getEnabled(), "Popover: add button enabled since has value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "b", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field2: Has No value");
							oFormField.setValue("b1");
							oFormField.fireChange({ value: "b1" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "d", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field3: Has no value");
							oFormField.setValue(2);
							oFormField.fireChange({ value: 2 });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "c", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field4: Has no value");
							oFormField.setValue("c1");
							oFormField.fireChange({ value: "c1" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "e", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"a": "a1",\n\t"b": "b1",\n\t"d": 2,\n\t"c": "c1",\n\t"e": true\n}', "SimpleForm field textArea: Has updated value");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
							oSwitchModeButton.firePress();
							var sNewValue = '{\n\t"c": "c2",\n\t"d": 3,\n\t"a": "a2",\n\t"e": false,\n\t"b": "b2"\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 5, "Table: value length is 5");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[4].getObject(), {"a": "a2","b": "b2","c": "c2","d": 3,"e": false}), "Table: new row");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: rows selected");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add with TextArea field in popover but cancel", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow = oTable.getRows()[0];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					oRow = oTable.getRows()[1];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					oRow = oTable.getRows()[2];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							assert.ok(!oAddButtonInPopover.getEnabled(), "Popover: add button not enabled");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(oContents[11].getValue() === '{}', "SimpleForm field textArea: Has value {}");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "a", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("a1");
							oFormField.fireChange({ value: "a1" });
							assert.ok(oAddButtonInPopover.getEnabled(), "Popover: add button enabled since has value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "b", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field2: Has No value");
							oFormField.setValue("b1");
							oFormField.fireChange({ value: "b1" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "d", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field3: Has no value");
							oFormField.setValue(2);
							oFormField.fireChange({ value: 2 });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "c", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field4: Has no value");
							oFormField.setValue("c1");
							oFormField.fireChange({ value: "c1" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "e", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"a": "a1",\n\t"b": "b1",\n\t"d": 2,\n\t"c": "c1",\n\t"e": true\n}', "SimpleForm field textArea: Has updated value");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
							oSwitchModeButton.firePress();
							var sNewValue = '{\n\t"c": "c2",\n\t"d": 3,\n\t"a": "a2",\n\t"e": false,\n\t"b": "b2"\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: rows selected");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("TextArea->Table - update", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

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
		QUnit.test("update with property fields in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow = oTable.getRows()[0];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					oRow = oTable.getRows()[1];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					oRow = oTable.getRows()[2];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							assert.ok(oUpdateButtonInPopover.getEnabled(), "Popover: update button enabled");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(oContents[11].getValue() === '{\n\t"c": "cccc",\n\t"d": 1,\n\t"a": "aaaa",\n\t"e": false\n}', "SimpleForm field textArea: Has value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "a", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "aaaa", "SimpleForm field1: Has No value");
							oFormField.setValue("a1");
							oFormField.fireChange({ value: "a1" });
							assert.ok(oAddButtonInPopover.getEnabled(), "Popover: add button enabled since has value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "b", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field2: Has No value");
							oFormField.setValue("b1");
							oFormField.fireChange({ value: "b1" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "d", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field3: Has value");
							oFormField.setValue(2);
							oFormField.fireChange({ value: 2 });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "c", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "cccc", "SimpleForm field4: Has value");
							oFormField.setValue("c1");
							oFormField.fireChange({ value: "c1" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "e", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"c": "c1",\n\t"d": 2,\n\t"a": "a1",\n\t"e": true,\n\t"b": "b1"\n}', "SimpleForm field textArea: Has updated value");
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getBinding().getContexts()[2].getObject(), {"a": "a1","b": "b1","c": "c1","d": 2,"e": true}), "Table: row updated");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: rows selected");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [
									{"a": "aa", "b": "bb", "d": 2},
									{"b": "bbb", "c": "ccc", "d": 3},
									{"a": "a1","b": "b1","c": "c1","d": 2,"e": true},
									{"a": "aaa", "b": "bbb", "e": true}
								]), "Field 1: DT Value");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update with property fields in popover but cancel", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow = oTable.getRows()[0];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					oRow = oTable.getRows()[1];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					oRow = oTable.getRows()[2];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							assert.ok(oUpdateButtonInPopover.getEnabled(), "Popover: update button enabled");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(oContents[11].getValue() === '{\n\t"c": "cccc",\n\t"d": 1,\n\t"a": "aaaa",\n\t"e": false\n}', "SimpleForm field textArea: Has value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "a", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "aaaa", "SimpleForm field1: Has No value");
							oFormField.setValue("a1");
							oFormField.fireChange({ value: "a1" });
							assert.ok(oAddButtonInPopover.getEnabled(), "Popover: add button enabled since has value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "b", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field2: Has No value");
							oFormField.setValue("b1");
							oFormField.fireChange({ value: "b1" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "d", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field3: Has value");
							oFormField.setValue(2);
							oFormField.fireChange({ value: 2 });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "c", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "cccc", "SimpleForm field4: Has value");
							oFormField.setValue("c1");
							oFormField.fireChange({ value: "c1" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "e", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"c": "c1",\n\t"d": 2,\n\t"a": "a1",\n\t"e": true,\n\t"b": "b1"\n}', "SimpleForm field textArea: Has updated value");
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getBinding().getContexts()[2].getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Table: row not updated");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: rows selected");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update with TextArea field in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow = oTable.getRows()[0];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					oRow = oTable.getRows()[1];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					oRow = oTable.getRows()[2];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							assert.ok(oUpdateButtonInPopover.getEnabled(), "Popover: update button enabled");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(oContents[11].getValue() === '{\n\t"c": "cccc",\n\t"d": 1,\n\t"a": "aaaa",\n\t"e": false\n}', "SimpleForm field textArea: Has value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "a", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "aaaa", "SimpleForm field1: Has No value");
							oFormField.setValue("a1");
							oFormField.fireChange({ value: "a1" });
							assert.ok(oAddButtonInPopover.getEnabled(), "Popover: add button enabled since has value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "b", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field2: Has No value");
							oFormField.setValue("b1");
							oFormField.fireChange({ value: "b1" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "d", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field3: Has value");
							oFormField.setValue(2);
							oFormField.fireChange({ value: 2 });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "c", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "cccc", "SimpleForm field4: Has value");
							oFormField.setValue("c1");
							oFormField.fireChange({ value: "c1" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "e", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
							oSwitchModeButton.firePress();
							assert.ok(oFormField.getValue() === '{\n\t"c": "c1",\n\t"d": 2,\n\t"a": "a1",\n\t"e": true,\n\t"b": "b1"\n}', "SimpleForm field textArea: Has updated value");
							var sNewValue = '{\n\t"c": "c2",\n\t"d": 3,\n\t"a": "a2",\n\t"e": false,\n\t"b": "b2"\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								var oNewValue = {"c": "c2", "d": 3, "a": "a2", "e": false, "b": "b2"};
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getBinding().getContexts()[2].getObject(), oNewValue), "Table: row updated");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: rows selected");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [
									{"a": "aa", "b": "bb", "d": 2},
									{"b": "bbb", "c": "ccc", "d": 3},
									oNewValue,
									{"a": "aaa", "b": "bbb", "e": true}
								]), "Field 1: DT Value updated");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update with TextArea field in popover but cancel", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow = oTable.getRows()[0];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					oRow = oTable.getRows()[1];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");
					oRow = oTable.getRows()[2];
					assert.ok(deepEqual(oRow.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							assert.ok(oUpdateButtonInPopover.getEnabled(), "Popover: update button enabled");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(oContents[11].getValue() === '{\n\t"c": "cccc",\n\t"d": 1,\n\t"a": "aaaa",\n\t"e": false\n}', "SimpleForm field textArea: Has value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "a", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "aaaa", "SimpleForm field1: Has No value");
							oFormField.setValue("a1");
							oFormField.fireChange({ value: "a1" });
							assert.ok(oAddButtonInPopover.getEnabled(), "Popover: add button enabled since has value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "b", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field2: Has No value");
							oFormField.setValue("b1");
							oFormField.fireChange({ value: "b1" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "d", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field3: Has value");
							oFormField.setValue(2);
							oFormField.fireChange({ value: 2 });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "c", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "cccc", "SimpleForm field4: Has value");
							oFormField.setValue("c1");
							oFormField.fireChange({ value: "c1" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "e", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
							oSwitchModeButton.firePress();
							assert.ok(oFormField.getValue() === '{\n\t"c": "c1",\n\t"d": 2,\n\t"a": "a1",\n\t"e": true,\n\t"b": "b1"\n}', "SimpleForm field textArea: Has updated value");
							var sNewValue = '{\n\t"c": "c2",\n\t"d": 3,\n\t"a": "a2",\n\t"e": false,\n\t"b": "b2"\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getBinding().getContexts()[2].getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Table: row not updated");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: rows selected");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("TextArea->Table - delete", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

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
		QUnit.test("delete selected object 01", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton1.onAfterRendering = function(oEvent) {
						oDeleteButton1.onAfterRendering = function () {};
						oDeleteButton1.firePress();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object 02", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton2.onAfterRendering = function(oEvent) {
						oDeleteButton2.onAfterRendering = function () {};
						oDeleteButton2.firePress();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object 03", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton3.onAfterRendering = function(oEvent) {
						oDeleteButton3.onAfterRendering = function () {};
						oDeleteButton3.firePress();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object 04", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton4.onAfterRendering = function(oEvent) {
						oDeleteButton4.onAfterRendering = function () {};
						oDeleteButton4.firePress();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object when have unselected objects 01", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton1.onAfterRendering = function(oEvent) {
						oDeleteButton1.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row1
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oDeleteButton1.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object when have unselected objects 02", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton2.onAfterRendering = function(oEvent) {
						oDeleteButton2.onAfterRendering = function () {};
						wait().then(function () {
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oDeleteButton2.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object when have unselected objects 03", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton3.onAfterRendering = function(oEvent) {
						oDeleteButton3.onAfterRendering = function () {};
						wait().then(function () {
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							oDeleteButton3.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object when have unselected objects 04", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton4.onAfterRendering = function(oEvent) {
						oDeleteButton4.onAfterRendering = function () {};
						wait().then(function () {
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oDeleteButton4.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object when have unselected objects 05", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton1.onAfterRendering = function(oEvent) {
						oDeleteButton1.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row4
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							oDeleteButton1.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object when have unselected objects 06", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton2.onAfterRendering = function(oEvent) {
						oDeleteButton2.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row1
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oDeleteButton2.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object when have unselected objects 07", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton3.onAfterRendering = function(oEvent) {
						oDeleteButton3.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row2
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oDeleteButton3.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object when have unselected objects 08", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton4.onAfterRendering = function(oEvent) {
						oDeleteButton4.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row3
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oDeleteButton4.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object 01", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton1.onAfterRendering = function(oEvent) {
						oDeleteButton1.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row1
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oDeleteButton1.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object 02", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton2.onAfterRendering = function(oEvent) {
						oDeleteButton2.onAfterRendering = function () {};
						wait().then(function () {
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oDeleteButton2.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object 03", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton3.onAfterRendering = function(oEvent) {
						oDeleteButton3.onAfterRendering = function () {};
						wait().then(function () {
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oDeleteButton3.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object 04", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton4.onAfterRendering = function(oEvent) {
						oDeleteButton4.onAfterRendering = function () {};
						wait().then(function () {
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							oDeleteButton4.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object when have unselected objects 01", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton1.onAfterRendering = function(oEvent) {
						oDeleteButton1.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row1
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							// unselect row2
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oDeleteButton1.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object when have unselected objects 02", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton2.onAfterRendering = function(oEvent) {
						oDeleteButton2.onAfterRendering = function () {};
						wait().then(function () {
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oDeleteButton2.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object when have unselected objects 03", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton3.onAfterRendering = function(oEvent) {
						oDeleteButton3.onAfterRendering = function () {};
						wait().then(function () {
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3}
							]), "Field 1: DT Value");
							oDeleteButton3.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object when have unselected objects 04", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton4.onAfterRendering = function(oEvent) {
						oDeleteButton4.onAfterRendering = function () {};
						wait().then(function () {
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							oDeleteButton4.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object when have unselected objects 05", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton1.onAfterRendering = function(oEvent) {
						oDeleteButton1.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row1
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							// unselect row4
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							oDeleteButton1.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object when have unselected objects 06", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton2.onAfterRendering = function(oEvent) {
						oDeleteButton2.onAfterRendering = function () {};
						wait().then(function () {
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oDeleteButton2.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object when have unselected objects 07", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton3.onAfterRendering = function(oEvent) {
						oDeleteButton3.onAfterRendering = function () {};
						wait().then(function () {
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 3]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							oDeleteButton3.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"a": "aaa", "b": "bbb", "e": true}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object when have unselected objects 08", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					assert.ok(oColumns[0].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[1].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[2].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[3].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[4].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), {"a": "aa", "b": "bb", "d": 2}), "Row 1: value");
					var oActionHBox = oRow1.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), {"b": "bbb", "c": "ccc", "d": 3}), "Row 2: value");
					oActionHBox = oRow2.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), {"c": "cccc", "d": 1, "a": "aaaa", "e": false}), "Row 3: value");
					oActionHBox = oRow3.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton3 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton3.getVisible(), "Row 3: Delete button visible");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), {"a": "aaa", "b": "bbb", "e": true}), "Row 4: value");
					oActionHBox = oRow4.getCells()[5];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					oDeleteButton4.onAfterRendering = function(oEvent) {
						oDeleteButton4.onAfterRendering = function () {};
						wait().then(function () {
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3},
								{"c": "cccc", "d": 1, "a": "aaaa", "e": false}
							]), "Field 1: DT Value");
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3}
							]), "Field 1: DT Value");
							oDeleteButton4.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [
								{"a": "aa", "b": "bb", "d": 2},
								{"b": "bbb", "c": "ccc", "d": 3}
							]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
