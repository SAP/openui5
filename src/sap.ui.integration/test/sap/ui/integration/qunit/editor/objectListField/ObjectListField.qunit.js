/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../ContextHost",
	"sap/base/util/deepEqual",
	"sap/ui/core/Core",
	"sap/base/util/deepClone"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	Core,
	deepClone
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
	var aObjectsParameterValueWithDT = [
		{"a": "aa", "b": "bb", "d": 2, "_dt": {"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"}},
		{"b": "bbb", "c": "ccc", "d": 3, "_dt": {"_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"}},
		{"c": "cccc", "d": 1, "a": "aaaa", "e": false, "_dt": {"_uuid": "333771a4-0d3f-4fec-af20-6f28f1b894cb"}},
		{"a": "aaa", "b": "bbb", "e": true, "_dt": {"_uuid": "444771a4-0d3f-4fec-af20-6f28f1b894cb"}}
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
						"value": aObjectsParameterValueWithDT
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

	var oValue1 = { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55 };
	var oValue2 = { "text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55 };
	var oValue3 = { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "editable": true };
	var oValue4 = { "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "number": 3.55 };
	var oValue5 = { "text": "text05", "key": "key05", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5, "editable": true };
	var oValue6 = { "text": "text06", "key": "key06", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6, "number": 3.55 };
	var oValue7 = { "text": "text07", "key": "key07", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7, "editable": true };
	var oValue8 = { "text": "text08", "key": "key08", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8, "number": 3.55 };
	var aObjectsParameterValue1 = [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8];
	var oDefaultNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
	var oDefaultNewObjectSelected = {"_dt": {"_selected": true},"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
	var oValue1Selected = Object.assign(deepClone(oValue1), {"_dt": {"_selected": true}});
	var oManifestForObjectListFieldsWithPropertiesOnly = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectListWithPropertiesDefinedOnly",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectsWithPropertiesDefined": {
						"value": aObjectsParameterValue1
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

	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

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
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [{"string":"string value", "boolean": true, "integer": 5, "number": 5.22}]), "Field 1: DT Value created");

					sNewValue = '[{\n\t"string1": "string value 1",\n\t"boolean": true,\n\t"integer": 5,\n\t"number": 5.22\n}]';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [{"string1":"string value 1", "boolean": true, "integer": 5, "number": 5.22}]), "Field 1: DT Value updated");

					sNewValue = '[]';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), []), "Field 1: DT Value updated");

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
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), []), "Field 1: DT Value []");
					var sNewValue = '[{\n\t"string": "string value",\n\t"boolean": true,\n\t"integer": 5,\n\t"number": 5.22\n}]';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [{"string":"string value", "boolean": true, "integer": 5, "number": 5.22}]), "Field 1: DT Value updated");

					sNewValue = '[{\n\t"string1": "string value 1",\n\t"boolean": true,\n\t"integer": 5,\n\t"number": 5.22\n}]';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [{"string1":"string value 1", "boolean": true, "integer": 5, "number": 5.22}]), "Field 1: DT Value updated");

					sNewValue = '[]';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), []), "Field 1: DT Value updated");

					sNewValue = '';
					oTextArea.setValue(sNewValue);
					oTextArea.fireChange({ value: sNewValue});
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value deleted");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("TextArea->Table - basic", {
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
		QUnit.test("basic", function (assert) {
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
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 6, "Table: column number is 6");
					var oSelectionColumn = oColumns[0];
					var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
					assert.ok(oColumns[1].getLabel().getText() === "a", "Table: column 'a'");
					assert.ok(oColumns[2].getLabel().getText() === "b", "Table: column 'b'");
					assert.ok(oColumns[3].getLabel().getText() === "d", "Table: column 'd'");
					assert.ok(oColumns[4].getLabel().getText() === "c", "Table: column 'c'");
					assert.ok(oColumns[5].getLabel().getText() === "e", "Table: column 'e'");
					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), {"a": "aa", "b": "bb", "d": 2, "_dt": {"_selected": true}}), "Row 1: value");
					var oSelectionCell1 = oRow1.getCells()[0];
					assert.ok(oSelectionCell1.getVisible(), "Row 1: Cell 1 is visible");
					assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
					assert.ok(!oSelectionCell1.getEnabled(), "Row 1: Cell 1 is disabled");
					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(cleanUUID(oRow2.getBindingContext().getObject()), {"b": "bbb", "c": "ccc", "d": 3, "_dt": {"_selected": true}}), "Row 2: value");
					var oSelectionCell2 = oRow2.getCells()[0];
					assert.ok(oSelectionCell2.getVisible(), "Row 2: Cell 1 is visible");
					assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");
					assert.ok(!oSelectionCell2.getEnabled(), "Row 2: Cell 1 is disabled");
					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(cleanUUID(oRow3.getBindingContext().getObject()), {"c": "cccc", "d": 1, "a": "aaaa", "e": false, "_dt": {"_selected": true}}), "Row 3: value");
					var oSelectionCell3 = oRow3.getCells()[0];
					assert.ok(oSelectionCell3.getVisible(), "Row 3: Cell 1 is visible");
					assert.ok(oSelectionCell3.getSelected(), "Row 3: Cell 1 is selected");
					assert.ok(!oSelectionCell3.getEnabled(), "Row 3: Cell 1 is disabled");
					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(cleanUUID(oRow4.getBindingContext().getObject()), {"a": "aaa", "b": "bbb", "e": true, "_dt": {"_selected": true}}), "Row 4: value");
					var oSelectionCell4 = oRow4.getCells()[0];
					assert.ok(oSelectionCell4.getVisible(), "Row 4: Cell 1 is visible");
					assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected");
					assert.ok(!oSelectionCell4.getEnabled(), "Row 4: Cell 1 is disabled");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					resolve();
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
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							assert.ok(!oAddButtonInPopover.getEnabled(), "Popover: add button not enabled");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[11].getValue()), {"_dt": {"_selected": true}}), "SimpleForm field textArea: Has value");
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
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"_dt": {"_selected": true},"a": "a1","b": "b1","d": 2,"c": "c1","e": true}), "SimpleForm field textArea: Has updated value");
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 5, "Table: value length is 5");
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[4].getObject()), {"a": "a1","b": "b1","c": "c1","d": 2,"e": true, "_dt": {"_selected": true}}), "Table: new row");
								var oRow1 = oTable.getRows()[0];
								var oSelectionCell1 = oRow1.getCells()[0];
								assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
								assert.ok(!oSelectionCell1.getEnabled(), "Row 1: Cell 1 is disabled");
								var oRow2 = oTable.getRows()[1];
								var oSelectionCell2 = oRow2.getCells()[0];
								assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");
								assert.ok(!oSelectionCell2.getEnabled(), "Row 2: Cell 1 is disabled");
								var oRow3 = oTable.getRows()[2];
								var oSelectionCell3 = oRow3.getCells()[0];
								assert.ok(oSelectionCell3.getSelected(), "Row 3: Cell 1 is selected");
								assert.ok(!oSelectionCell3.getEnabled(), "Row 3: Cell 1 is disabled");
								var oRow4 = oTable.getRows()[3];
								var oSelectionCell4 = oRow4.getCells()[0];
								assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected");
								assert.ok(!oSelectionCell4.getEnabled(), "Row 4: Cell 1 is disabled");
								var oRow5 = oTable.getRows()[4];
								var oSelectionCell5 = oRow5.getCells()[0];
								assert.ok(oSelectionCell5.getSelected(), "Row 5: Cell 1 is selected");
								assert.ok(!oSelectionCell5.getEnabled(), "Row 5: Cell 1 is disabled");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue.concat([{"a": "a1","b": "b1","c": "c1","d": 2,"e": true}])), "Field 1: updated DT Value");
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
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							assert.ok(!oAddButtonInPopover.getEnabled(), "Popover: add button not enabled");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[11].getValue()), {"_dt": {"_selected": true}}), "SimpleForm field textArea: Has value");
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
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"_dt": {"_selected": true},"a": "a1","b": "b1","d": 2,"c": "c1","e": true}), "SimpleForm field textArea: Has updated value");
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								var oRow1 = oTable.getRows()[0];
								var oSelectionCell1 = oRow1.getCells()[0];
								assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
								assert.ok(!oSelectionCell1.getEnabled(), "Row 1: Cell 1 is disabled");
								var oRow2 = oTable.getRows()[1];
								var oSelectionCell2 = oRow2.getCells()[0];
								assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");
								assert.ok(!oSelectionCell2.getEnabled(), "Row 2: Cell 1 is disabled");
								var oRow3 = oTable.getRows()[2];
								var oSelectionCell3 = oRow3.getCells()[0];
								assert.ok(oSelectionCell3.getSelected(), "Row 3: Cell 1 is selected");
								assert.ok(!oSelectionCell3.getEnabled(), "Row 3: Cell 1 is disabled");
								var oRow4 = oTable.getRows()[3];
								var oSelectionCell4 = oRow4.getCells()[0];
								assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected");
								assert.ok(!oSelectionCell4.getEnabled(), "Row 4: Cell 1 is disabled");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
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
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							assert.ok(!oAddButtonInPopover.getEnabled(), "Popover: add button not enabled");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[11].getValue()), {"_dt": {"_selected": true}}), "SimpleForm field textArea: Has value");
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
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"_dt": {"_selected": true},"a": "a1","b": "b1","d": 2,"c": "c1","e": true}), "SimpleForm field textArea: Has updated value");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							var sNewValue = '{\n\t"_dt": {\n\t\t"_selected": true\n\t},"c": "c2",\n\t"d": 3,\n\t"a": "a2",\n\t"e": false,\n\t"b": "b2"\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 5, "Table: value length is 5");
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[4].getObject()), {"a": "a2","b": "b2","c": "c2","d": 3,"e": false, "_dt": {"_selected": true}}), "Table: new row");
								var oRow1 = oTable.getRows()[0];
								var oSelectionCell1 = oRow1.getCells()[0];
								assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
								assert.ok(!oSelectionCell1.getEnabled(), "Row 1: Cell 1 is disabled");
								var oRow2 = oTable.getRows()[1];
								var oSelectionCell2 = oRow2.getCells()[0];
								assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");
								assert.ok(!oSelectionCell2.getEnabled(), "Row 2: Cell 1 is disabled");
								var oRow3 = oTable.getRows()[2];
								var oSelectionCell3 = oRow3.getCells()[0];
								assert.ok(oSelectionCell3.getSelected(), "Row 3: Cell 1 is selected");
								assert.ok(!oSelectionCell3.getEnabled(), "Row 3: Cell 1 is disabled");
								var oRow4 = oTable.getRows()[3];
								var oSelectionCell4 = oRow4.getCells()[0];
								assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected");
								assert.ok(!oSelectionCell4.getEnabled(), "Row 4: Cell 1 is disabled");
								var oRow5 = oTable.getRows()[4];
								var oSelectionCell5 = oRow5.getCells()[0];
								assert.ok(oSelectionCell5.getSelected(), "Row 5: Cell 1 is selected");
								assert.ok(!oSelectionCell5.getEnabled(), "Row 5: Cell 1 is disabled");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue.concat([{"a": "a2","b": "b2","c": "c2","d": 3,"e": false}])), "Field 1: updated DT Value");
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
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							assert.ok(!oAddButtonInPopover.getEnabled(), "Popover: add button not enabled");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[11].getValue()), {"_dt": {"_selected": true}}), "SimpleForm field textArea: Has value");
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
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"_dt": {"_selected": true},"a": "a1","b": "b1","d": 2,"c": "c1","e": true}), "SimpleForm field textArea: Has updated value");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							var sNewValue = '{\n\t"_dt": {\n\t\t"_selected": true\n\t},"c": "c2",\n\t"d": 3,\n\t"a": "a2",\n\t"e": false,\n\t"b": "b2"\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								var oRow1 = oTable.getRows()[0];
								var oSelectionCell1 = oRow1.getCells()[0];
								assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
								assert.ok(!oSelectionCell1.getEnabled(), "Row 1: Cell 1 is disabled");
								var oRow2 = oTable.getRows()[1];
								var oSelectionCell2 = oRow2.getCells()[0];
								assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");
								assert.ok(!oSelectionCell2.getEnabled(), "Row 2: Cell 1 is disabled");
								var oRow3 = oTable.getRows()[2];
								var oSelectionCell3 = oRow3.getCells()[0];
								assert.ok(oSelectionCell3.getSelected(), "Row 3: Cell 1 is selected");
								assert.ok(!oSelectionCell3.getEnabled(), "Row 3: Cell 1 is disabled");
								var oRow4 = oTable.getRows()[3];
								var oSelectionCell4 = oRow4.getCells()[0];
								assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected");
								assert.ok(!oSelectionCell4.getEnabled(), "Row 4: Cell 1 is disabled");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
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
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(2);
					oTable.fireRowSelectionChange({
						rowIndex: 2,
						userInteraction: true
					});
					assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							assert.ok(oUpdateButtonInPopover.getEnabled(), "Popover: update button enabled");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[11].getValue()), {"c": "cccc","d": 1,"a": "aaaa","e": false,"_dt": {"_selected": true}}), "SimpleForm field textArea: Has value");
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
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"c": "c1","d": 2,"a": "a1","e": true,"_dt": {"_selected": true},"b": "b1"}), "SimpleForm field textArea: Has updated value");
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[2].getObject()), {"a": "a1","b": "b1","c": "c1","d": 2,"e": true,"_dt": {"_selected": true}}), "Table: row updated");
								var oRow1 = oTable.getRows()[0];
								var oSelectionCell1 = oRow1.getCells()[0];
								assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
								assert.ok(!oSelectionCell1.getEnabled(), "Row 1: Cell 1 is disabled");
								var oRow2 = oTable.getRows()[1];
								var oSelectionCell2 = oRow2.getCells()[0];
								assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");
								assert.ok(!oSelectionCell2.getEnabled(), "Row 2: Cell 1 is disabled");
								var oRow3 = oTable.getRows()[2];
								var oSelectionCell3 = oRow3.getCells()[0];
								assert.ok(oSelectionCell3.getSelected(), "Row 3: Cell 1 is selected");
								assert.ok(!oSelectionCell3.getEnabled(), "Row 3: Cell 1 is disabled");
								var oRow4 = oTable.getRows()[3];
								var oSelectionCell4 = oRow4.getCells()[0];
								assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected");
								assert.ok(!oSelectionCell4.getEnabled(), "Row 4: Cell 1 is disabled");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [
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
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(2);
					oTable.fireRowSelectionChange({
						rowIndex: 2,
						userInteraction: true
					});
					assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							assert.ok(oUpdateButtonInPopover.getEnabled(), "Popover: update button enabled");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[11].getValue()), {"c": "cccc","d": 1,"a": "aaaa","e": false,"_dt": {"_selected": true}}), "SimpleForm field textArea: Has value");
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
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"c": "c1","d": 2,"a": "a1","e": true,"_dt": {"_selected": true},"b": "b1"}), "SimpleForm field textArea: Has updated value");
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[2].getObject()), {"c": "cccc", "d": 1, "a": "aaaa", "e": false, "_dt": {"_selected": true}}), "Table: row not updated");
								var oRow1 = oTable.getRows()[0];
								var oSelectionCell1 = oRow1.getCells()[0];
								assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
								assert.ok(!oSelectionCell1.getEnabled(), "Row 1: Cell 1 is disabled");
								var oRow2 = oTable.getRows()[1];
								var oSelectionCell2 = oRow2.getCells()[0];
								assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");
								assert.ok(!oSelectionCell2.getEnabled(), "Row 2: Cell 1 is disabled");
								var oRow3 = oTable.getRows()[2];
								var oSelectionCell3 = oRow3.getCells()[0];
								assert.ok(oSelectionCell3.getSelected(), "Row 3: Cell 1 is selected");
								assert.ok(!oSelectionCell3.getEnabled(), "Row 3: Cell 1 is disabled");
								var oRow4 = oTable.getRows()[3];
								var oSelectionCell4 = oRow4.getCells()[0];
								assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected");
								assert.ok(!oSelectionCell4.getEnabled(), "Row 4: Cell 1 is disabled");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
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
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(2);
					oTable.fireRowSelectionChange({
						rowIndex: 2,
						userInteraction: true
					});
					assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							assert.ok(oUpdateButtonInPopover.getEnabled(), "Popover: update button enabled");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[11].getValue()), {"c": "cccc","d": 1,"a": "aaaa","e": false,"_dt": {"_selected": true}}), "SimpleForm field textArea: Has value");
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
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"c": "c1","d": 2,"a": "a1","e": true,"_dt": {"_selected": true},"b": "b1"}), "SimpleForm field textArea: Has updated value");
							var sNewValue = '{\n\t"c": "c2",\n\t"d": 3,\n\t"a": "a2",\n\t"e": false,\n\t"_dt": {\n\t\t"_selected": true\n\t},\n\t"b": "b2"\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[2].getObject()), {"c": "c2", "d": 3, "a": "a2", "e": false, "b": "b2", "_dt": {"_selected": true}}), "Table: row updated");
								var oRow1 = oTable.getRows()[0];
								var oSelectionCell1 = oRow1.getCells()[0];
								assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
								assert.ok(!oSelectionCell1.getEnabled(), "Row 1: Cell 1 is disabled");
								var oRow2 = oTable.getRows()[1];
								var oSelectionCell2 = oRow2.getCells()[0];
								assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");
								assert.ok(!oSelectionCell2.getEnabled(), "Row 2: Cell 1 is disabled");
								var oRow3 = oTable.getRows()[2];
								var oSelectionCell3 = oRow3.getCells()[0];
								assert.ok(oSelectionCell3.getSelected(), "Row 3: Cell 1 is selected");
								assert.ok(!oSelectionCell3.getEnabled(), "Row 3: Cell 1 is disabled");
								var oRow4 = oTable.getRows()[3];
								var oSelectionCell4 = oRow4.getCells()[0];
								assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected");
								assert.ok(!oSelectionCell4.getEnabled(), "Row 4: Cell 1 is disabled");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [
									{"a": "aa", "b": "bb", "d": 2},
									{"b": "bbb", "c": "ccc", "d": 3},
									{"c": "c2", "d": 3, "a": "a2", "e": false, "b": "b2"},
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
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(2);
					oTable.fireRowSelectionChange({
						rowIndex: 2,
						userInteraction: true
					});
					assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							assert.ok(oUpdateButtonInPopover.getEnabled(), "Popover: update button enabled");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							assert.ok(oCancelButtonInPopover.getEnabled(), "Popover: cancel button enabled");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 12, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[11].getValue()), {"c": "cccc","d": 1,"a": "aaaa","e": false,"_dt": {"_selected": true}}), "SimpleForm field textArea: Has value");
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
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"c": "c1","d": 2,"a": "a1","e": true,"_dt": {"_selected": true},"b": "b1"}), "SimpleForm field textArea: Has updated value");
							var sNewValue = '{\n\t"c": "c2",\n\t"d": 3,\n\t"a": "a2",\n\t"e": false,\n\t"_dt": {\n\t\t"_selected": true\n\t},\n\t"b": "b2"\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[2].getObject()), {"c": "cccc", "d": 1, "a": "aaaa", "e": false, "_dt": {"_selected": true}}), "Table: row not updated");
								var oRow1 = oTable.getRows()[0];
								var oSelectionCell1 = oRow1.getCells()[0];
								assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
								assert.ok(!oSelectionCell1.getEnabled(), "Row 1: Cell 1 is disabled");
								var oRow2 = oTable.getRows()[1];
								var oSelectionCell2 = oRow2.getCells()[0];
								assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");
								assert.ok(!oSelectionCell2.getEnabled(), "Row 2: Cell 1 is disabled");
								var oRow3 = oTable.getRows()[2];
								var oSelectionCell3 = oRow3.getCells()[0];
								assert.ok(oSelectionCell3.getSelected(), "Row 3: Cell 1 is selected");
								assert.ok(!oSelectionCell3.getEnabled(), "Row 3: Cell 1 is disabled");
								var oRow4 = oTable.getRows()[3];
								var oSelectionCell4 = oRow4.getCells()[0];
								assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected");
								assert.ok(!oSelectionCell4.getEnabled(), "Row 4: Cell 1 is disabled");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
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
		QUnit.test("delete", function (assert) {
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
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oDeleteButton = oToolbar.getContent()[3];
					assert.ok(!oDeleteButton.getEnabled(), "Table toolbar: delete button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange({
						rowIndex: 0,
						userInteraction: true
					});
					assert.ok(oDeleteButton.getEnabled(), "Table toolbar: delete button enabled");
					oDeleteButton.onAfterRendering = function(oEvent) {
						oDeleteButton.onAfterRendering = function () {};
						oDeleteButton.firePress();
						wait().then(function () {
							var sMessageBoxId = document.querySelector(".sapMMessageBox").id;
							var oMessageBox = Core.byId(sMessageBoxId);
							var oOKButton = oMessageBox._getToolbar().getContent()[1];
							oOKButton.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [
									{"b": "bbb", "c": "ccc", "d": 3},
									{"c": "cccc", "d": 1, "a": "aaaa", "e": false},
									{"a": "aaa", "b": "bbb", "e": true}
								]), "Field 1: DT Value");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Table(properties defined only) - no value or [] as value", {
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
		QUnit.test("no value, add with default property values in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {}
							},
							"destinations": {
								"local": {
									"name": "local",
									"defaultUrl": "./"
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						assert.ok(oColumns[1].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[2].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[3].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[4].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[5].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[6].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[7].getLabel().getText() === "Number", "Table: column 'Number'");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oDefaultNewObjectSelected), "Table: new row data");
								var oRow1 = oTable.getRows()[0];
								assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oDefaultNewObjectSelected), "Table: new row");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [oDefaultNewObject]), "Field 1: Value after adding");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("no value, add with property fields in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {}
							},
							"destinations": {
								"local": {
									"name": "local",
									"defaultUrl": "./"
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						assert.ok(oColumns[1].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[2].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[3].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[4].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[5].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[6].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[7].getLabel().getText() === "Number", "Table: column 'Number'");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
									var oDefaultNewObject = {"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55, "key": "key01", "editable": true, "int": 1, "_dt": {"_selected": true}};
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oDefaultNewObject), "Table: new row data");
									var oRow1 = oTable.getRows()[0];
									assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oDefaultNewObject), "Table: new row");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [{"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55, "key": "key01", "editable": true, "int": 1}]), "Field 1: Value after adding");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("no value, add with TextArea field in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {}
							},
							"destinations": {
								"local": {
									"name": "local",
									"defaultUrl": "./"
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						assert.ok(oColumns[1].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[2].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[3].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[4].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[5].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[6].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[7].getLabel().getText() === "Number", "Table: column 'Number'");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
								var sNewValue = '{\n\t"_dt": {\n\t\t"_selected": true\n\t},\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
									var oDefaultNewObject = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55, "_dt": {"_selected": true}};
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oDefaultNewObject), "Table: new row data");
									var oRow1 = oTable.getRows()[0];
									assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oDefaultNewObject), "Table: new row");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [{"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55}]), "Field 1: Value after adding");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("[] as value, add with default property values in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {
									"value": []
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
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), []), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						assert.ok(oColumns[1].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[2].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[3].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[4].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[5].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[6].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[7].getLabel().getText() === "Number", "Table: column 'Number'");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oDefaultNewObjectSelected), "Table: new row data");
								var oRow1 = oTable.getRows()[0];
								assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oDefaultNewObjectSelected), "Table: new row");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [oDefaultNewObject]), "Field 1: Value after adding");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("[] as value, add with property values in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {
									"value": []
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
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), []), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						assert.ok(oColumns[1].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[2].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[3].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[4].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[5].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[6].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[7].getLabel().getText() === "Number", "Table: column 'Number'");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
									var oDefaultNewObject = {"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55, "key": "key01", "editable": true, "int": 1, "_dt": {"_selected": true}};
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oDefaultNewObject), "Table: new row data");
									var oRow1 = oTable.getRows()[0];
									assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oDefaultNewObject), "Table: new row");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [{"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55, "key": "key01", "editable": true, "int": 1}]), "Field 1: Value after adding");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("[] as value, add with TextArea field in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {
									"value": []
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
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), []), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						assert.ok(oColumns[1].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[2].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[3].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[4].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[5].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[6].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[7].getLabel().getText() === "Number", "Table: column 'Number'");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
								var sNewValue = '{\n\t"_dt": {\n\t\t"_selected": true\n\t},\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
									var oDefaultNewObject = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55, "_dt": {"_selected": true}};
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oDefaultNewObject), "Table: new row data");
									var oRow1 = oTable.getRows()[0];
									assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oDefaultNewObject), "Table: new row");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [{"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55}]), "Field 1: Value after adding");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Table(properties defined only) - add", {
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
		QUnit.test("add with default property values in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[8].getObject()), oDefaultNewObjectSelected), "Table: new row data");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1.concat([oDefaultNewObject])), "Field 1: Value changed");
								// scroll to the bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									var oNewRow = oTable.getRows()[4];
									assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oDefaultNewObjectSelected), "Table: new row in the bottom");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add with default property values in popover but cancel", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not change");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add with property fields in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									var oDefaultNewObject = {"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1, "_dt":{"_selected": true}};
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[8].getObject()), oDefaultNewObject), "Table: new row data");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1.concat([{"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}])), "Field 1: Value changed");
									// scroll to the bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oNewRow = oTable.getRows()[4];
										assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oDefaultNewObject), "Table: new row in the bottom");
										resolve();
									});
								});
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
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oCancelButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not change");
									resolve();
								});
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
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
								var sNewValue = '{\n\t"_dt": {\n\t\t"_selected": true\n\t},\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									var oDefaultNewObject = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55, "_dt": {"_selected": true}};
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[8].getObject()), oDefaultNewObject), "Table: new row data");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1.concat([{"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55}])), "Field 1: Value changed");
									// scroll to the bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oNewRow = oTable.getRows()[4];
										assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oDefaultNewObject), "Table: new row in the bottom");
										resolve();
									});
								});
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
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "0.5", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
								var sNewValue = '{\n\t"_dt": {\n\t\t"_selected": true\n\t},\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oCancelButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not change");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Table(properties defined only) - update", {
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
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange({
						rowIndex: 0,
						userInteraction: true
					});
					assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oValue1Selected), "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Has value");
							oFormField.setValue("keynew");
							oFormField.fireChange({ value: "keynew" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://zoom-in");
							oFormField.fireChange({ value: "sap-icon://zoom-in" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Has value");
							oFormField.setValue("textnew");
							oFormField.fireChange({ value: "textnew" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/04");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/04" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(oFormField.getSelected(), "SimpleForm field5: Has value");
							oFormField.setSelected(false);
							oFormField.fireSelect({ selected: false });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Has value");
							oFormField.setValue("3");
							oFormField.fireChange({value: "3"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"text": "textnew","key": "keynew","url": "https://sapui5.hana.ondemand.com/04","icon": "sap-icon://zoom-in","iconcolor": "#031E48","int": 3,"editable": false,"number": 0.55,"_dt": {"_selected": true}}), "SimpleForm field textArea: Has changed value");
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								var oNewValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#031E48", "int": 3, "editable": false, "number": 0.55, "_dt": {"_selected": true}};
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [
									{"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#031E48", "int": 3, "editable": false, "number": 0.55},
									oValue2,
									oValue3,
									oValue4,
									oValue5,
									oValue6,
									oValue7,
									oValue8
								]), "Field 1: Value updated");
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
								var oNewRow = oTable.getRows()[0];
								assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oNewValue), "Table: value row is at top");
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
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange({
						rowIndex: 0,
						userInteraction: true
					});
					assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oValue1Selected), "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Has value");
							oFormField.setValue("keynew");
							oFormField.fireChange({ value: "keynew" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://zoom-in");
							oFormField.fireChange({ value: "sap-icon://zoom-in" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Has value");
							oFormField.setValue("textnew");
							oFormField.fireChange({ value: "textnew" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/04");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/04" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(oFormField.getSelected(), "SimpleForm field5: Has value");
							oFormField.setSelected(false);
							oFormField.fireSelect({ selected: false });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Has value");
							oFormField.setValue("3");
							oFormField.fireChange({value: "3"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"text": "textnew","key": "keynew","url": "https://sapui5.hana.ondemand.com/04","icon": "sap-icon://zoom-in","iconcolor": "#031E48","int": 3,"editable": false,"number": 0.55,"_dt": {"_selected": true}}), "SimpleForm field textArea: Has changed value");
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not change");
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
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange({
						rowIndex: 0,
						userInteraction: true
					});
					assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oValue1Selected), "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Has value");
							oFormField.setValue("keynew");
							oFormField.fireChange({ value: "keynew" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://zoom-in");
							oFormField.fireChange({ value: "sap-icon://zoom-in" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Has value");
							oFormField.setValue("textnew");
							oFormField.fireChange({ value: "textnew" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/04");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/04" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(oFormField.getSelected(), "SimpleForm field5: Has value");
							oFormField.setSelected(false);
							oFormField.fireSelect({ selected: false });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Has value");
							oFormField.setValue("3");
							oFormField.fireChange({value: "3"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"text": "textnew","key": "keynew","url": "https://sapui5.hana.ondemand.com/04","icon": "sap-icon://zoom-in","iconcolor": "#031E48","int": 3,"editable": false,"number": 0.55,"_dt": {"_selected": true}}), "SimpleForm field textArea: Has changed value");
							var sNewValue = '{\n\t"_dt": {\n\t\t"_selected": true\n\t},\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								var oNewValue = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55, "_dt": {"_selected": true}};
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [
									{"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55},
									oValue2,
									oValue3,
									oValue4,
									oValue5,
									oValue6,
									oValue7,
									oValue8
								]), "Field 1: Value updated");
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
								var oNewRow = oTable.getRows()[0];
								assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oNewValue), "Table: value row is at top");
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
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange({
						rowIndex: 0,
						userInteraction: true
					});
					assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oValue1Selected), "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Has value");
							oFormField.setValue("keynew");
							oFormField.fireChange({ value: "keynew" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://zoom-in");
							oFormField.fireChange({ value: "sap-icon://zoom-in" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Has value");
							oFormField.setValue("textnew");
							oFormField.fireChange({ value: "textnew" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/04");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/04" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(oFormField.getSelected(), "SimpleForm field5: Has value");
							oFormField.setSelected(false);
							oFormField.fireSelect({ selected: false });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Has value");
							oFormField.setValue("3");
							oFormField.fireChange({value: "3"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"text": "textnew","key": "keynew","url": "https://sapui5.hana.ondemand.com/04","icon": "sap-icon://zoom-in","iconcolor": "#031E48","int": 3,"editable": false,"number": 0.55,"_dt": {"_selected": true}}), "SimpleForm field textArea: Has changed value");
							var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not change");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Table(properties defined only) - delete", {
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
		QUnit.test("delete object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oDeleteButton = oToolbar.getContent()[3];
					assert.ok(!oDeleteButton.getEnabled(), "Table toolbar: delete button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange({
						rowIndex: 0,
						userInteraction: true
					});
					assert.ok(oDeleteButton.getEnabled(), "Table toolbar: delete button enabled");
					oDeleteButton.onAfterRendering = function(oEvent) {
						oDeleteButton.onAfterRendering = function () {};
						oDeleteButton.firePress();
						wait().then(function () {
							var sMessageBoxId = document.querySelector(".sapMMessageBox").id;
							var oMessageBox = Core.byId(sMessageBoxId);
							var oOKButton = oMessageBox._getToolbar().getContent()[1];
							oOKButton.firePress();
							wait().then(function () {
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
								assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Table(properties defined only) - filter", {
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
		QUnit.test("filter via api", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oKeyColumn = oTable.getColumns()[1];
					oTable.filter(oKeyColumn, "n");
					// check that the column menu filter input field was updated
					var oMenu = oKeyColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount length is 0");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected row hided");
						assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
						oTable.filter(oKeyColumn, "n*");
						assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering n*");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected row hided");
						oTable.filter(oKeyColumn, "key0*");
						assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering key0*");
						oTable.filter(oKeyColumn, "*01");
						assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering *01");
						oTable.filter(oKeyColumn, "*0*");
						assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering *0*");
						oTable.filter(oKeyColumn, "");
						wait().then(function () {
							assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
							assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
							assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after removing filter");
							assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
							var oTextColumn = oTable.getColumns()[3];
							oTable.filter(oTextColumn, "n");
							// check that the column menu filter input field was updated
							oMenu = oTextColumn.getMenu();
							// open and close the menu to let it generate its items
							oMenu.open();
							oMenu.close();
							wait().then(function () {
								assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
								assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount length is 0");
								assert.ok(oTextColumn.getFiltered(), "Table: Column Text is filtered");
								oTable.filter(oTextColumn, "*n");
								assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering *n");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
								oTable.filter(oTextColumn, "*0*");
								assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering *0*");
								wait().then(function () {
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
									oTable.filter(oTextColumn, "01");
									wait().then(function () {
										assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering 01");
										assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
										oTable.filter(oTextColumn, "");
										wait().then(function () {
											assert.ok(!oTextColumn.getFiltered(), "Table: Column Text is not filtered anymore");
											assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after removing all filters");
											assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
											assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
											resolve();
										});
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("filter via ui", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oURLColumn = oTable.getColumns()[4];
					var oIntColumn = oTable.getColumns()[6];
					var oMenu = oURLColumn.getMenu();
					// open the column filter menu, input filter value, close the menu.
					oMenu.open();
					oMenu.getItems()[0].setValue("https");
					oMenu.getItems()[0].fireSelect();
					oMenu.close();
					wait().then(function () {
						assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
						assert.ok(oTable.getBinding().getCount() === 5, "Table: RowCount after filtering column URL with 'https'");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
						oMenu = oIntColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("4");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
							assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering column Integer with '4'");
							assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
							// open the column filter menu, input filter value, close the menu.
							oMenu.open();
							oMenu.getItems()[0].setValue(">4");
							oMenu.getItems()[0].fireSelect();
							oMenu.close();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 2, "Table: RowCount after filtering column Integer with '>4'");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");

								assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
								// clear all the filters
								oClearFilterButton.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after removing all the filters");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
									assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add, match the filter key", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oURLColumn = oTable.getColumns()[4];
					oTable.filter(oURLColumn, "https");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
						assert.ok(oTable.getBinding().getCount() === 5, "Table: RowCount after filtering https");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");

						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[6];
							var oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://");
							oFormField.fireChange({ value: "https://" });
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5}), "SimpleForm field8: Has updated value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							oAddButtonInPopover.firePress();
							wait().then(function () {
								// scroll to bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 6, "Table: value length is 6");
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[5].getObject()), {"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5, "_dt": {"_selected": true}}), "Table: new row is added to the end");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1.concat([{"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5}])), "Field 1: Value");
									oTable.filter(oURLColumn, "");
									assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
									wait().then(function () {
										assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
										assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
										assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1.concat([{"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5}])), "Field 1: Value");
										// scroll to bottom
										oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
										wait().then(function () {
											assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[8].getObject()), {"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5, "_dt": {"_selected": true}}), "Table: new row is added to the end");
											resolve();
										});
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add, not match the filter key", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oURLColumn = oTable.getColumns()[4];
					oTable.filter(oURLColumn, "https");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
						assert.ok(oTable.getBinding().getCount() === 5, "Table: RowCount after filtering https");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");

						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[6];
							var oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oDefaultNewObjectSelected), "SimpleForm field8: Has updated value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							oAddButtonInPopover.firePress();
							wait().then(function () {
								// scroll to bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 5, "Table: value length is 5");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1.concat([oDefaultNewObject])), "Field 1: Value");
									oTable.filter(oURLColumn, "");
									assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
									wait().then(function () {
										assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
										assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
										assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1.concat([oDefaultNewObject])), "Field 1: Value");
										// scroll to bottom
										oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
										wait().then(function () {
											assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[8].getObject()), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5, "_dt": {"_selected": true}}), "Table: new row is added to the end");
											resolve();
										});
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oURLColumn = oTable.getColumns()[4];
					oTable.filter(oURLColumn, "http:");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering http:");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");

						var oSelectedRow = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUID(oSelectedRow.getBindingContext().getObject()), { "text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55, "_dt": {"_selected": true} }), "Table: value row");
						var oEditButton = oToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), Object.assign(deepClone(oValue2), {"_dt": {"_selected": true}})), "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "key02", "SimpleForm field1: Has value");
							oFormField.setValue("keynew");
							oFormField.fireChange({ value: "keynew" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://cart", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text02", "SimpleForm field3: Has value");
							oFormField.setValue("textnew");
							oFormField.fireChange({ value: "textnew" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://sapui5.hana.ondemand.com/05", "SimpleForm field4: Has value");
							oFormField.setValue("http://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "http://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "2", "SimpleForm field6: Has value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {"text": "textnew","key": "keynew","url": "http://sapui5.hana.ondemand.com/06","icon": "sap-icon://accept","iconcolor": "#64E4CE","int": 1,"number": 0.55,"_dt": {"_selected": true},"editable": true}), "SimpleForm field textArea: Has changed value");
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after updating");
								var oNewValue = {"text": "textnew", "key": "keynew", "url": "http://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#64E4CE", "int": 1, "editable": true, "number": 0.55};
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [oValue1, oNewValue, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), {"text": "textnew", "key": "keynew", "url": "http://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#64E4CE", "int": 1, "editable": true, "number": 0.55, "_dt": {"_selected": true}}), "Table: selected row updated");
								assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
								oTable.filter(oURLColumn, "");
								assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
								wait().then(function () {
									assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
									assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after removing filter");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [oValue1, oNewValue, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[1].getObject()), {"text": "textnew", "key": "keynew", "url": "http://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#64E4CE", "int": 1, "editable": true, "number": 0.55, "_dt": {"_selected": true}}), "Table: selected row updated");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update, but been filtered out", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oURLColumn = oTable.getColumns()[4];
					oTable.filter(oURLColumn, "http:");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering http:");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");

						var oSelectedRow = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUID(oSelectedRow.getBindingContext().getObject()), { "text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55, "_dt": {"_selected": true} }), "Table: value row");
						var oEditButton = oToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), Object.assign(deepClone(oValue2), {"_dt": {"_selected": true}})), "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "key02", "SimpleForm field1: Has value");
							oFormField.setValue("keynew");
							oFormField.fireChange({ value: "keynew" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://cart", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text02", "SimpleForm field3: Has value");
							oFormField.setValue("textnew");
							oFormField.fireChange({ value: "textnew" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "http://sapui5.hana.ondemand.com/05", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "2", "SimpleForm field6: Has value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oNewValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#64E4CE", "int": 1, "editable": true, "number": 0.55};
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), Object.assign(deepClone(oNewValue), {"_dt": {"_selected": true}})), "SimpleForm field textArea: Has changed value");
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 2, "Table: RowCount after updating");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [oValue1, oNewValue, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
								assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), Object.assign(deepClone(oValue5), {"_dt": {"_selected": true}})), "Table: row 0");
								assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
								oTable.filter(oURLColumn, "");
								assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
								wait().then(function () {
									assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
									assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after removing filter");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [oValue1, oNewValue, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
									assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[1].getObject()), Object.assign(deepClone(oNewValue), {"_dt": {"_selected": true}})), "Table: selected row updated");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 8, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oDeleteButton = oToolbar.getContent()[3];
					assert.ok(!oDeleteButton.getEnabled(), "Table toolbar: delete button disabled");
					var oClearFilterButton = oToolbar.getContent()[5];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oURLColumn = oTable.getColumns()[4];
					oTable.filter(oURLColumn, "http:");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
						assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering http:");
						assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.ok(oDeleteButton.getEnabled(), "Table toolbar: delete button enabled");
						oDeleteButton.firePress();
						wait().then(function () {
							var sMessageBoxId = document.querySelector(".sapMMessageBox").id;
							var oMessageBox = Core.byId(sMessageBoxId);
							var oOKButton = oMessageBox._getToolbar().getContent()[1];
							oOKButton.firePress();
							wait().then(function () {
								assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
								assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [oValue1, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value deleted");
								assert.ok(oTable.getBinding().getCount() === 2, "Table: value length is 2");
								oTable.filter(oURLColumn, "");
								assert.ok(!oURLColumn.getFiltered(), "Table: Column Key is not filtered anymore");
								wait().then(function () {
									assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
									assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), [oValue1, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value deleted");
									assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
