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

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	var oManifestForObjectFieldWithValues = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectFieldWithValues",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectWithPropertiesDefinedAndValueFromJsonList": {
						"value": {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"}}
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

	var oDefaultNewObject = {"_dt": {"_selected": true},"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
	var oUpdatedNewObject1 = {"_dt": {"_selected": true},"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"};
	var oEditObject = {"text": "textnew","key": "keynew","url": "https://sap.com/04","icon": "sap-icon://zoom-in","iconcolor": "#E69A17","int": 3,"_dt": {"_selected": true}};
	var oChangedObject = {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","iconcolor": "#E69A17","int": 1,"_dt": {"_selected": true},"editable": true,"number": 0.55};
	var oResponseData = {
		"Customers": [
			{"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1"},
			{"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2"},
			{"CustomerID": "c", "CompanyName": "C1 Company", "Country": "Country 3", "City": "City 3", "Address": "Address 3"},
			{"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4"},
			{"CustomerID": "e", "CompanyName": "E Company", "Country": "Country 5", "City": "City 5", "Address": "Address 5"},
			{"CustomerID": "f", "CompanyName": "F Company", "Country": "Country 6", "City": "City 6", "Address": "Address 5"}
		]
	};

	Core.getConfiguration().setLanguage("en");
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

	QUnit.module("CUD", {
		before: function () {
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: RegExp("/mock_request/Customers.*"),
					response: function (xhr) {
						xhr.respondJSON(200, null, {"value": oResponseData["Customers"]});
					}
				}
			]);
			this.oMockServer.start();

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
			this.oMockServer.destroy();
			this.oHost.destroy();
			this.oContextHost.destroy();
			sandbox.restore();
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
				document.body.style.zIndex = "unset";
			}
		}
	});

	QUnit.test("add 01 - match the filter key", function (assert) {
		var oTable, oCell, oMenu, oInput, oField, oValue, oValueInTable, oKeyColumn, oRemoveValueButton;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectFieldWithValues
		});
		return EditorQunitUtils.isReady(oEditor).then(function () {
			assert.ok(oEditor.isReady(), "Editor is ready");
			oValue = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3
			};
			oValueInTable = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3,
				"_dt": {"_selected": true}
			};
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
			oTable = oField.getAggregation("_field");
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
			var oSelectionColumn = oTable.getColumns()[0];
			oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oKeyColumn = oTable.getColumns()[1];
			oTable.filter(oKeyColumn, "new");
			return wait();
		}).then(function () {
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function () {
			oMenu = oKeyColumn.getHeaderMenuInstance();
			assert.ok(oMenu, "Table column: header menu instance ok");
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			assert.equal(oInput.getValue(), "new", "Table: Key Column filter value OK");
			oMenu.close();
			return wait();
		}).then(function () {
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount length is 1");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			var oAddButton = oToolbar.getContent()[1];
			assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
			oAddButton.firePress();
			return wait();
		}).then(function () {
			var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
			assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
			var oContents = oSimpleForm.getContent();
			assert.equal(oContents.length, 16, "SimpleForm: length");
			assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
			var oFormLabel = oContents[0];
			var oFormField = oContents[1];
			assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
			assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
			oFormField.setValue("keynew01");
			oFormField.fireChange({value: "keynew01"});
			oFormLabel = oContents[14];
			oFormField = oContents[15];
			assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
			assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
			assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oUpdatedNewObject1), "SimpleForm field8: Has updated value");
			var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
			oAddButtonInPopover.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 2, "Table: value length is 2");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[1].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row is added to the end");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			oCell = oTable.getRows()[1].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 2: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01"
			}), "Field 1: Value changed");
			oTable.filter(oKeyColumn, "");
			assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 10, "Table: RowCount after removing filter");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01"
			}), "Field 1: Value");
			// scroll to the bottom
			oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
			return wait();
		}).then(function () {
			var oRow5 = oTable.getRows()[4];
			var oSelectionCell5 = oRow5.getCells()[0];
			assert.ok(oSelectionCell5.isA("sap.m.CheckBox"), "Row 10: Cell 1 is CheckBox");
			assert.ok(oSelectionCell5.getSelected(), "Row 10: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oRow5.getBindingContext().getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row in the bottom");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			return Promise.resolve();
		});
	});

	QUnit.test("add 02 - not match the filter key", function (assert) {
		var oTable, oCell, oMenu, oInput, oField, oValue, oValueInTable, oKeyColumn, oRemoveValueButton;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectFieldWithValues
		});
		return EditorQunitUtils.isReady(oEditor).then(function() {
			assert.ok(oEditor.isReady(), "Editor is ready");
			oValue = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3
			};
			oValueInTable = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3,
				"_dt": {"_selected": true}
			};
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
			oTable = oField.getAggregation("_field");
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
			var oSelectionColumn = oTable.getColumns()[0];
			oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oKeyColumn = oTable.getColumns()[1];
			oTable.filter(oKeyColumn, "new");
			return wait();
		}).then(function() {
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function () {
			oMenu = oKeyColumn.getHeaderMenuInstance();
			assert.ok(oMenu, "Table column: header menu instance ok");
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			assert.equal(oInput.getValue(), "new", "Table: Key Column filter value OK");
			oMenu.close();
			return wait();
		}).then(function() {
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount length is 1");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			var oAddButton = oToolbar.getContent()[1];
			assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
			oAddButton.firePress();
			return wait();
		}).then(function () {
			var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
			assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
			var oContents = oSimpleForm.getContent();
			assert.equal(oContents.length, 16, "SimpleForm: length");
			assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
			var oFormLabel = oContents[0];
			var oFormField = oContents[1];
			assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
			assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
			oFormField.setValue("keyne01");
			oFormField.fireChange({value: "keyne01"});
			oFormLabel = oContents[14];
			oFormField = oContents[15];
			assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
			assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
			assert.ok(deepEqual(cleanUUID(oFormField.getValue()), Object.assign(deepClone(oUpdatedNewObject1), {"key": "keyne01"})), "SimpleForm field8: Has updated value");
			var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
			oAddButtonInPopover.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 1, "Table: value length is 1");
			assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column not enabled");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keyne01"
			}), "Field 1: Value changed");
			oTable.filter(oKeyColumn, "");
			assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 10, "Table: RowCount after removing filter");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keyne01"
			}), "Field 1: Value");
			// scroll to the bottom
			oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
			return wait();
		}).then(function () {
			var oRow5 = oTable.getRows()[4];
			var oSelectionCell5 = oRow5.getCells()[0];
			assert.ok(oSelectionCell5.isA("sap.m.CheckBox"), "Row 10: Cell 1 is CheckBox");
			assert.ok(oSelectionCell5.getSelected(), "Row 10: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oRow5.getBindingContext().getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keyne01",
				"_dt": {"_selected": true}
			}), "Table: new row in the bottom");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			return Promise.resolve();
		});
	});

	QUnit.test("update not selected object", function (assert) {
		var oTable, oCell, oMenu, oInput, oField, oValue, oValueInTable, oKeyColumn, oRemoveValueButton, oAddButton;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectFieldWithValues
		});
		return EditorQunitUtils.isReady(oEditor).then(function() {
			assert.ok(oEditor.isReady(), "Editor is ready");
			oValue = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3
			};
			oValueInTable = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3,
				"_dt": {"_selected": true}
			};
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
			oTable = oField.getAggregation("_field");
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
			var oRow1 = oTable.getRows()[0];
			oCell = oRow1.getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
			assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
			var oSelectionColumn = oTable.getColumns()[0];
			oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			oAddButton = oToolbar.getContent()[1];
			assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
			return wait();
		}).then(function () {
			oAddButton.firePress();
			var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
			assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
			var oContents = oSimpleForm.getContent();
			assert.equal(oContents.length, 16, "SimpleForm: length");
			assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
			var oFormLabel = oContents[0];
			var oFormField = oContents[1];
			assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
			assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
			oFormField.setValue("keynew01");
			oFormField.fireChange({value: "keynew01"});
			oFormLabel = oContents[14];
			oFormField = oContents[15];
			assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
			assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
			assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oUpdatedNewObject1), "SimpleForm field8: Has updated value");
			var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
			oAddButtonInPopover.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 10, "Table: value length is 10");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[9].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row is added to the end");
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01"
			}), "Field 1: Value");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oKeyColumn = oTable.getColumns()[1];
			oTable.filter(oKeyColumn, "new");
			return wait();
		}).then(function () {
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function () {
			// check that the column menu filter input field was updated
			oMenu = oKeyColumn.getHeaderMenuInstance();
			assert.ok(oMenu, "Table column: header menu instance ok");
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			assert.equal(oInput.getValue(), "new", "Table: Key Column filter value OK");
			oMenu.close();
			return wait();
		}).then(function () {
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			assert.equal(oTable.getBinding().getCount(), 2, "Table: RowCount after filtering new");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[1].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			oCell = oTable.getRows()[1].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 2: Cell 1 is selected");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			var oEditButton = oToolbar.getContent()[2];
			assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button not enabled");
			assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
			oTable.setSelectedIndex(0);
			oTable.fireRowSelectionChange({
				rowIndex: 0,
				userInteraction: true
			});
			oEditButton.firePress();
			return wait();
		}).then(function () {
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
			assert.equal(oContents.length, 16, "SimpleForm: length");
			var oFormFieldValueObject = deepClone(JSON.parse(oContents[15].getValue()), 500);
			assert.ok(!oFormFieldValueObject._dt._selected, "SimpleForm field textArea: value not selected");
			oFormFieldValueObject._dt = {"_selected": true};
			assert.ok(deepEqual(oFormFieldValueObject, oEditObject), "SimpleForm field textArea: Has the value");
			var oFormLabel = oContents[0];
			var oFormField = oContents[1];
			assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
			assert.equal(oFormField.getValue(), "keynew", "SimpleForm field1: Has value");
			oFormField.setValue("keynew01");
			oFormField.fireChange({value: "keynew01"});
			oFormLabel = oContents[2];
			oFormField = oContents[3];
			assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
			assert.equal(oFormField.getValue(), "sap-icon://zoom-in", "SimpleForm field2: Has value");
			oFormField.setValue("sap-icon://accept");
			oFormField.fireChange({value: "sap-icon://accept"});
			oFormLabel = oContents[4];
			oFormField = oContents[5];
			assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
			assert.equal(oFormField.getValue(), "textnew", "SimpleForm field3: Has value");
			oFormField.setValue("text01");
			oFormField.fireChange({value: "text01"});
			oFormLabel = oContents[6];
			oFormField = oContents[7];
			assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
			assert.equal(oFormField.getValue(), "https://sap.com/04", "SimpleForm field4: Has value");
			oFormField.setValue("https://sap.com/06");
			oFormField.fireChange({value: "https://sap.com/06"});
			oFormLabel = oContents[8];
			oFormField = oContents[9];
			assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
			assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
			assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
			assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
			oFormField.setSelected(true);
			oFormField.fireSelect({selected: true});
			oFormLabel = oContents[10];
			oFormField = oContents[11];
			assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
			assert.equal(oFormField.getValue(), "3", "SimpleForm field6: Has value");
			oFormField.setValue("1");
			oFormField.fireChange({value: "1"});
			oFormLabel = oContents[12];
			oFormField = oContents[13];
			assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
			assert.equal(oFormField.getValue(), "", "SimpleForm field7: Has value");
			oFormField.setValue("0.55");
			oFormField.fireChange({value: "0.55"});
			oFormLabel = oContents[14];
			oFormField = oContents[15];
			assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
			assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
			assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
			assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
			assert.ok(deepEqual(cleanUUID(oFormField.getValue()), {
				"text": "text01",
				"key": "keynew01",
				"url": "https://sap.com/06",
				"icon": "sap-icon://accept",
				"iconcolor": "#E69A17",
				"int": 1,
				"_dt": {"_selected": false},
				"editable": true,
				"number": 0.55
			}), "SimpleForm field textArea: Has changed value");
			oUpdateButtonInPopover.firePress();
			return wait();
		}).then(function () {
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01"
			}), "Field 1: Value");
			assert.equal(oTable.getBinding().getCount(), 2, "Table: value length is 2");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), {
				"text": "text01",
				"key": "keynew01",
				"url": "https://sap.com/06",
				"icon": "sap-icon://accept",
				"iconcolor": "#E69A17",
				"int": 1,
				"editable": true,
				"number": 0.55,
				"_dt": {"_selected": false}
			}), "Table: not selected row updated");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			oCell = oTable.getRows()[1].getCells()[0];
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			assert.ok(oCell.getSelected(), "Row 2: Cell 1 is selected");
			return Promise.resolve();
		});
	});

	QUnit.test("update not selected object, but been filtered out", function (assert) {
		var oTable, oCell, oMenu, oInput, oField, oValue, oValueInTable, oKeyColumn, oRemoveValueButton, oAddButton;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectFieldWithValues
		});
		return EditorQunitUtils.isReady(oEditor).then(function() {
			assert.ok(oEditor.isReady(), "Editor is ready");
			oValue = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3
			};
			oValueInTable = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3,
				"_dt": {"_selected": true}
			};
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
			oTable = oField.getAggregation("_field");
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
			var oRow1 = oTable.getRows()[0];
			oCell = oRow1.getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
			assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
			var oSelectionColumn = oTable.getColumns()[0];
			oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			oAddButton = oToolbar.getContent()[1];
			assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
			return wait();
		}).then(function () {
			oAddButton.firePress();
			var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
			assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
			var oContents = oSimpleForm.getContent();
			assert.equal(oContents.length, 16, "SimpleForm: length");
			assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
			var oFormLabel = oContents[0];
			var oFormField = oContents[1];
			assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
			assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
			oFormField.setValue("keynew01");
			oFormField.fireChange({value: "keynew01"});
			oFormLabel = oContents[14];
			oFormField = oContents[15];
			assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
			assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
			assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oUpdatedNewObject1), "SimpleForm field8: Has updated value");
			var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
			oAddButtonInPopover.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 10, "Table: value length is 10");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[9].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row is added to the end");
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01"
			}), "Field 1: Value");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oKeyColumn = oTable.getColumns()[1];
			oTable.filter(oKeyColumn, "new");
		}).then(function() {
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function() {
			oMenu = oKeyColumn.getHeaderMenuInstance();
			assert.ok(oMenu, "Table column: header menu instance ok");
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			assert.equal(oInput.getValue(), "new", "Table: Key Column filter value OK");
			oMenu.close();
			return wait();
		}).then(function() {
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			assert.equal(oTable.getBinding().getCount(), 2, "Table: RowCount after filtering new");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[1].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			oCell = oTable.getRows()[1].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 2: Cell 1 is selected");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			var oEditButton = oToolbar.getContent()[2];
			assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button not enabled");
			assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
			oTable.setSelectedIndex(0);
			oTable.fireRowSelectionChange({
				rowIndex: 0,
				userInteraction: true
			});
			oEditButton.firePress();
			return wait();
		}).then(function () {
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
			assert.equal(oContents.length, 16, "SimpleForm: length");
			var oFormFieldValueObject = deepClone(JSON.parse(oContents[15].getValue()), 500);
			assert.ok(!oFormFieldValueObject._dt._selected, "SimpleForm field textArea: value not selected");
			oFormFieldValueObject._dt = {"_selected": true};
			assert.ok(deepEqual(oFormFieldValueObject, oEditObject), "SimpleForm field textArea: Has the value");
			var oFormLabel = oContents[0];
			var oFormField = oContents[1];
			assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
			assert.equal(oFormField.getValue(), "keynew", "SimpleForm field1: Has value");
			oFormField.setValue("keyne01");
			oFormField.fireChange({value: "keyne01"});
			oFormLabel = oContents[2];
			oFormField = oContents[3];
			assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
			assert.equal(oFormField.getValue(), "sap-icon://zoom-in", "SimpleForm field2: Has value");
			oFormField.setValue("sap-icon://accept");
			oFormField.fireChange({value: "sap-icon://accept"});
			oFormLabel = oContents[4];
			oFormField = oContents[5];
			assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
			assert.equal(oFormField.getValue(), "textnew", "SimpleForm field3: Has value");
			oFormField.setValue("text01");
			oFormField.fireChange({value: "text01"});
			oFormLabel = oContents[6];
			oFormField = oContents[7];
			assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
			assert.equal(oFormField.getValue(), "https://sap.com/04", "SimpleForm field4: Has value");
			oFormField.setValue("https://sap.com/06");
			oFormField.fireChange({value: "https://sap.com/06"});
			oFormLabel = oContents[8];
			oFormField = oContents[9];
			assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
			assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
			assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
			assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
			oFormField.setSelected(true);
			oFormField.fireSelect({selected: true});
			oFormLabel = oContents[10];
			oFormField = oContents[11];
			assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
			assert.equal(oFormField.getValue(), "3", "SimpleForm field6: Has value");
			oFormField.setValue("1");
			oFormField.fireChange({value: "1"});
			oFormLabel = oContents[12];
			oFormField = oContents[13];
			assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
			assert.equal(oFormField.getValue(), "", "SimpleForm field7: Has value");
			oFormField.setValue("0.55");
			oFormField.fireChange({value: "0.55"});
			oFormLabel = oContents[14];
			oFormField = oContents[15];
			assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
			assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
			assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
			assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
			assert.ok(deepEqual(cleanUUID(oFormField.getValue()), Object.assign(deepClone(oChangedObject, 500), {
				"key": "keyne01",
				"_dt": {"_selected": false}
			})), "SimpleForm field8: Has updated value");
			oUpdateButtonInPopover.firePress();
			return wait();
		}).then(function () {
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Field 1: Value");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: value length is 1");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01", "_dt": {"_selected": true}}), "Table: selected row");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			return Promise.resolve();
		});
	});

	QUnit.test("update selected object", function (assert) {
		var oTable, oCell, oMenu, oInput, oField, oValue, oValueInTable, oKeyColumn, oRemoveValueButton, oAddButton;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectFieldWithValues
		});
		return EditorQunitUtils.isReady(oEditor).then(function() {
			assert.ok(oEditor.isReady(), "Editor is ready");
			oValue = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3
			};
			oValueInTable = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3,
				"_dt": {"_selected": true}
			};
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
			oTable = oField.getAggregation("_field");
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
			var oRow1 = oTable.getRows()[0];
			oCell = oRow1.getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
			assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
			var oSelectionColumn = oTable.getColumns()[0];
			oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			oAddButton = oToolbar.getContent()[1];
			assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
			return wait();
		}).then(function() {
			oAddButton.firePress();
			var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
			assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
			var oContents = oSimpleForm.getContent();
			assert.equal(oContents.length, 16, "SimpleForm: length");
			assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
			var oFormLabel = oContents[0];
			var oFormField = oContents[1];
			assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
			assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
			oFormField.setValue("keynew01");
			oFormField.fireChange({value: "keynew01"});
			oFormLabel = oContents[14];
			oFormField = oContents[15];
			assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
			assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
			assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oUpdatedNewObject1), "SimpleForm field8: Has updated value");
			var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
			oAddButtonInPopover.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 10, "Table: value length is 10");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[9].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row is added to the end");
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01"
			}), "Field 1: Value");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oKeyColumn = oTable.getColumns()[1];
			oTable.filter(oKeyColumn, "new");
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function () {
			oMenu = oKeyColumn.getHeaderMenuInstance();
			assert.ok(oMenu, "Table column: header menu instance ok");
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			assert.equal(oInput.getValue(), "new", "Table: Key Column filter value OK");
			oMenu.close();
			return wait();
		}).then(function () {
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			assert.equal(oTable.getBinding().getCount(), 2, "Table: RowCount after filtering new");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[1].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oCell = oTable.getRows()[1].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 2: Cell 1 is selected");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			oCell.setSelected(true);
			oCell.fireSelect({
				selected: true
			});
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			oCell = oTable.getRows()[1].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 2: Cell 1 is not selected");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3
			}), "Field 1: Value change back");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			var oEditButton = oToolbar.getContent()[2];
			assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button not enabled");
			assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
			oTable.setSelectedIndex(0);
			oTable.fireRowSelectionChange({
				rowIndex: 0,
				userInteraction: true
			});
			oEditButton.firePress();
			return wait();
		}).then(function () {
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
			assert.equal(oContents.length, 16, "SimpleForm: length");
			assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oEditObject), "SimpleForm field textArea: Has the value");
			var oFormLabel = oContents[0];
			var oFormField = oContents[1];
			assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
			assert.equal(oFormField.getValue(), "keynew", "SimpleForm field1: Has value");
			oFormField.setValue("keynew01");
			oFormField.fireChange({value: "keynew01"});
			oFormLabel = oContents[2];
			oFormField = oContents[3];
			assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
			assert.equal(oFormField.getValue(), "sap-icon://zoom-in", "SimpleForm field2: Has value");
			oFormField.setValue("sap-icon://accept");
			oFormField.fireChange({value: "sap-icon://accept"});
			oFormLabel = oContents[4];
			oFormField = oContents[5];
			assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
			assert.equal(oFormField.getValue(), "textnew", "SimpleForm field3: Has value");
			oFormField.setValue("text01");
			oFormField.fireChange({value: "text01"});
			oFormLabel = oContents[6];
			oFormField = oContents[7];
			assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
			assert.equal(oFormField.getValue(), "https://sap.com/04", "SimpleForm field4: Has value");
			oFormField.setValue("https://sap.com/06");
			oFormField.fireChange({value: "https://sap.com/06"});
			oFormLabel = oContents[8];
			oFormField = oContents[9];
			assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
			assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
			assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
			assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
			oFormField.setSelected(true);
			oFormField.fireSelect({selected: true});
			oFormLabel = oContents[10];
			oFormField = oContents[11];
			assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
			assert.equal(oFormField.getValue(), "3", "SimpleForm field6: Has value");
			oFormField.setValue("1");
			oFormField.fireChange({value: "1"});
			oFormLabel = oContents[12];
			oFormField = oContents[13];
			assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
			assert.equal(oFormField.getValue(), "", "SimpleForm field7: Has value");
			oFormField.setValue("0.55");
			oFormField.fireChange({value: "0.55"});
			oFormLabel = oContents[14];
			oFormField = oContents[15];
			assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
			assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
			assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
			assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
			assert.ok(deepEqual(cleanUUID(oFormField.getValue()), Object.assign(deepClone(oChangedObject, 500), {"key": "keynew01"})), "SimpleForm field textArea: Has changed value");
			oUpdateButtonInPopover.firePress();
			return wait();
		}).then(function () {
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), {
				"text": "text01",
				"key": "keynew01",
				"url": "https://sap.com/06",
				"icon": "sap-icon://accept",
				"iconcolor": "#E69A17",
				"int": 1,
				"editable": true,
				"number": 0.55
			}), "Field 1: Value");
			assert.equal(oTable.getBinding().getCount(), 2, "Table: value length is 2");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), {
				"text": "text01",
				"key": "keynew01",
				"url": "https://sap.com/06",
				"icon": "sap-icon://accept",
				"iconcolor": "#E69A17",
				"int": 1,
				"editable": true,
				"number": 0.55,
				"_dt": {"_selected": true}
			}), "Table: selected row updated");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			oCell = oTable.getRows()[1].getCells()[0];
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			assert.ok(!oCell.getSelected(), "Row 2: Cell 1 is not selected");
			return Promise.resolve();
		});
	});

	QUnit.test("update selected object, but been filtered out", function (assert) {
		var oTable, oCell, oMenu, oInput, oField, oValue, oValueInTable, oKeyColumn, oAddButton, oRemoveValueButton;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectFieldWithValues
		});
		return EditorQunitUtils.isReady(oEditor).then(function() {
			assert.ok(oEditor.isReady(), "Editor is ready");
			oValue = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3
			};
			oValueInTable = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3,
				"_dt": {"_selected": true}
			};
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
			oTable = oField.getAggregation("_field");
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
			var oRow1 = oTable.getRows()[0];
			oCell = oRow1.getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
			assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
			var oSelectionColumn = oTable.getColumns()[0];
			oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			oAddButton = oToolbar.getContent()[1];
			assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
			return wait();
		}).then(function() {
			oAddButton.firePress();
			var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
			assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
			var oContents = oSimpleForm.getContent();
			assert.equal(oContents.length, 16, "SimpleForm: length");
			assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
			var oFormLabel = oContents[0];
			var oFormField = oContents[1];
			assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
			assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
			oFormField.setValue("keynew01");
			oFormField.fireChange({value: "keynew01"});
			oFormLabel = oContents[14];
			oFormField = oContents[15];
			assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
			assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
			assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oUpdatedNewObject1), "SimpleForm field8: Has updated value");
			var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
			oAddButtonInPopover.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 10, "Table: value length is 10");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[9].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row is added to the end");
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01"
			}), "Field 1: Value");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oKeyColumn = oTable.getColumns()[1];
			oTable.filter(oKeyColumn, "new");
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function () {
			// check that the column menu filter input field was updated
			oMenu = oKeyColumn.getHeaderMenuInstance();
			assert.ok(oMenu, "Table column: header menu instance ok");
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			assert.equal(oInput.getValue(), "new", "Table: Key Column filter value OK");
			oMenu.close();
			return wait();
		}).then(function () {
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			assert.equal(oTable.getBinding().getCount(), 2, "Table: RowCount after filtering new");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[1].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oCell = oTable.getRows()[1].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 2: Cell 1 is selected");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			oCell.setSelected(true);
			oCell.fireSelect({
				selected: true
			});
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			oCell = oTable.getRows()[1].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 2: Cell 1 is not selected");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3
			}), "Field 1: Value change back");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			var oEditButton = oToolbar.getContent()[2];
			assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button not enabled");
			assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
			oTable.setSelectedIndex(0);
			oTable.fireRowSelectionChange({
				rowIndex: 0,
				userInteraction: true
			});
			oEditButton.firePress();
			return wait();
		}).then(function () {
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
			assert.equal(oContents.length, 16, "SimpleForm: length");
			assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oEditObject), "SimpleForm field textArea: Has the value");
			var oFormLabel = oContents[0];
			var oFormField = oContents[1];
			assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
			assert.equal(oFormField.getValue(), "keynew", "SimpleForm field1: Has value");
			oFormField.setValue("keyne01");
			oFormField.fireChange({value: "keyne01"});
			oFormLabel = oContents[2];
			oFormField = oContents[3];
			assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
			assert.equal(oFormField.getValue(), "sap-icon://zoom-in", "SimpleForm field2: Has value");
			oFormField.setValue("sap-icon://accept");
			oFormField.fireChange({value: "sap-icon://accept"});
			oFormLabel = oContents[4];
			oFormField = oContents[5];
			assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
			assert.equal(oFormField.getValue(), "textnew", "SimpleForm field3: Has value");
			oFormField.setValue("text01");
			oFormField.fireChange({value: "text01"});
			oFormLabel = oContents[6];
			oFormField = oContents[7];
			assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
			assert.equal(oFormField.getValue(), "https://sap.com/04", "SimpleForm field4: Has value");
			oFormField.setValue("https://sap.com/06");
			oFormField.fireChange({value: "https://sap.com/06"});
			oFormLabel = oContents[8];
			oFormField = oContents[9];
			assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
			assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
			assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
			assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
			oFormField.setSelected(true);
			oFormField.fireSelect({selected: true});
			oFormLabel = oContents[10];
			oFormField = oContents[11];
			assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
			assert.equal(oFormField.getValue(), "3", "SimpleForm field6: Has value");
			oFormField.setValue("1");
			oFormField.fireChange({value: "1"});
			oFormLabel = oContents[12];
			oFormField = oContents[13];
			assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
			assert.equal(oFormField.getValue(), "", "SimpleForm field7: Has value");
			oFormField.setValue("0.55");
			oFormField.fireChange({value: "0.55"});
			oFormLabel = oContents[14];
			oFormField = oContents[15];
			assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
			assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
			assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
			assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
			assert.ok(deepEqual(cleanUUID(oFormField.getValue()), Object.assign(deepClone(oChangedObject, 500), {"key": "keyne01"})), "SimpleForm field textArea: Has changed value");
			oUpdateButtonInPopover.firePress();
			return wait();
		}).then(function () {
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), {
				"text": "text01",
				"key": "keyne01",
				"url": "https://sap.com/06",
				"icon": "sap-icon://accept",
				"iconcolor": "#E69A17",
				"int": 1,
				"editable": true,
				"number": 0.55
			}), "Field 1: Value");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: value length is 1");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": false}
			}), "Table: not selected row");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			return Promise.resolve();
		});
	});

	QUnit.test("delete selected object", function (assert) {
		var oTable, oCell, oMenu, oInput, oField, oValue, oValueInTable, oKeyColumn, oAddButton, oRemoveValueButton;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectFieldWithValues
		});
		return EditorQunitUtils.isReady(oEditor).then(function() {
			assert.ok(oEditor.isReady(), "Editor is ready");
			oValue = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3
			};
			oValueInTable = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3,
				"_dt": {"_selected": true}
			};
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
			oTable = oField.getAggregation("_field");
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
			var oRow1 = oTable.getRows()[0];
			oCell = oRow1.getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
			assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
			var oSelectionColumn = oTable.getColumns()[0];
			oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			oAddButton = oToolbar.getContent()[1];
			assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
			return wait();
		}).then(function() {
			oAddButton.firePress();
			var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
			assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
			var oContents = oSimpleForm.getContent();
			assert.equal(oContents.length, 16, "SimpleForm: length");
			assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
			var oFormLabel = oContents[0];
			var oFormField = oContents[1];
			assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
			assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
			oFormField.setValue("keynew01");
			oFormField.fireChange({value: "keynew01"});
			oFormLabel = oContents[14];
			oFormField = oContents[15];
			assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
			assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
			assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oUpdatedNewObject1), "SimpleForm field8: Has updated value");
			var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
			oAddButtonInPopover.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 10, "Table: value length is 10");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[9].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row is added to the end");
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01"
			}), "Field 1: Value");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oKeyColumn = oTable.getColumns()[1];
			oTable.filter(oKeyColumn, "new");
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function() {
			// check that the column menu filter input field was updated
			oMenu = oKeyColumn.getHeaderMenuInstance();
			assert.ok(oMenu, "Table column: header menu instance ok");
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			assert.equal(oInput.getValue(), "new", "Table: Key Column filter value OK");
			oMenu.close();
			return wait();
		}).then(function () {
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			assert.equal(oTable.getBinding().getCount(), 2, "Table: RowCount after filtering new");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[1].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01"
			}), "Field 1: Value");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oCell = oTable.getRows()[1].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 2: Cell 1 is selected");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			var oDeleteButton = oToolbar.getContent()[3];
			assert.ok(!oDeleteButton.getEnabled(), "Table toolbar: delete button not enabled");
			assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
			oTable.setSelectedIndex(1);
			oTable.fireRowSelectionChange({
				rowIndex: 1,
				userInteraction: true
			});
			assert.equal(oTable.getSelectedIndices()[0], 1, "Table: selected row 2");
			assert.ok(oDeleteButton.getEnabled(), "Table toolbar: delete button enabled");
			oDeleteButton.firePress();
			return wait();
		}).then(function () {
			var sMessageBoxId = document.querySelector(".sapMMessageBox").id;
			var oMessageBox = Core.byId(sMessageBoxId);
			var oOKButton = oMessageBox._getToolbar().getContent()[1];
			oOKButton.firePress();
			return wait();
		}).then(function () {
			assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value deleted");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: value length is 1");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_selected": false}}), "Table: not seleted row");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column not enabled");
			return Promise.resolve();
		});
	});

	QUnit.test("delete not selected object", function (assert) {
		var oTable, oCell, oMenu, oInput, oField, oValue, oValueInTable, oKeyColumn, oAddButton, oRemoveValueButton;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectFieldWithValues
		});
		return EditorQunitUtils.isReady(oEditor).then(function() {
			assert.ok(oEditor.isReady(), "Editor is ready");
			oValue = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3
			};
			oValueInTable = {
				"text": "textnew",
				"key": "keynew",
				"url": "https://sap.com/04",
				"icon": "sap-icon://zoom-in",
				"iconcolor": "#E69A17",
				"int": 3,
				"_dt": {"_selected": true}
			};
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
			oTable = oField.getAggregation("_field");
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
			var oRow1 = oTable.getRows()[0];
			oCell = oRow1.getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
			assert.ok(deepEqual(cleanUUID(oRow1.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
			var oSelectionColumn = oTable.getColumns()[0];
			oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			oAddButton = oToolbar.getContent()[1];
			assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
			return wait();
		}).then(function() {
			oAddButton.firePress();
			var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
			assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
			var oContents = oSimpleForm.getContent();
			assert.equal(oContents.length, 16, "SimpleForm: length");
			assert.ok(deepEqual(cleanUUID(oContents[15].getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
			var oFormLabel = oContents[0];
			var oFormField = oContents[1];
			assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
			assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
			assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
			assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
			assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
			assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
			oFormField.setValue("keynew01");
			oFormField.fireChange({value: "keynew01"});
			oFormLabel = oContents[14];
			oFormField = oContents[15];
			assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
			assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
			assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oUpdatedNewObject1), "SimpleForm field8: Has updated value");
			var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
			oAddButtonInPopover.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 10, "Table: value length is 10");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[9].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row is added to the end");
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01"
			}), "Field 1: Value");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oKeyColumn = oTable.getColumns()[1];
			oTable.filter(oKeyColumn, "new");
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function() {
			// check that the column menu filter input field was updated
			oMenu = oKeyColumn.getHeaderMenuInstance();
			assert.ok(oMenu, "Table column: header menu instance ok");
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			assert.equal(oInput.getValue(), "new", "Table: Key Column filter value OK");
			oMenu.close();
			return wait();
		}).then(function () {
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			assert.equal(oTable.getBinding().getCount(), 2, "Table: RowCount after filtering new");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[1].getObject()), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01",
				"_dt": {"_selected": true}
			}), "Table: new row");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), {
				"icon": "sap-icon://add",
				"text": "text",
				"url": "http://",
				"number": 0.5,
				"key": "keynew01"
			}), "Field 1: Value");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oCell = oTable.getRows()[1].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 2: Cell 1 is selected");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			var oDeleteButton = oToolbar.getContent()[3];
			assert.ok(!oDeleteButton.getEnabled(), "Table toolbar: delete button not enabled");
			assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
			oTable.setSelectedIndex(0);
			oTable.fireRowSelectionChange({
				rowIndex: 0,
				userInteraction: true
			});
			assert.equal(oTable.getSelectedIndices()[0], 0, "Table: selected row 1");
			assert.ok(oDeleteButton.getEnabled(), "Table toolbar: delete button enabled");
			oDeleteButton.firePress();
			return wait();
		}).then(function () {
			var sMessageBoxId = document.querySelector(".sapMMessageBox").id;
			var oMessageBox = Core.byId(sMessageBoxId);
			var oOKButton = oMessageBox._getToolbar().getContent()[1];
			oOKButton.firePress();
			return wait();
		}).then(function () {
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01"}), "Field 1: Value");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: value length is 1");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5,"key": "keynew01", "_dt": {"_selected": true}}), "Table: seleted row");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			return Promise.resolve();
		});
	});
});
