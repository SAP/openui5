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

	QUnit.module("filter", {
		before: function() {
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
		beforeEach: function () {
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

	QUnit.test("filter via api", function (assert) {
		var oTable, oCell, oClearFilterButton, oField, oValue, oValueInTable, oKeyColumn, oTextColumn;
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
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			oClearFilterButton = oToolbar.getContent()[4];
			assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
			var oNewRow = oTable.getRows()[0];
			assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
			oKeyColumn = oTable.getColumns()[1];
			oTable.filter(oKeyColumn, "n");
			return wait();
		}).then(function () {
			assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount length is 1");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			oTable.filter(oKeyColumn, "n*");
			return wait();
		}).then(function () {
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			assert.equal(oTable.getBinding().getCount(), 0, "Table: RowCount after filtering n*");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
			oTable.filter(oKeyColumn, "key0*");
			return wait();
		}).then(function () {
			assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
			assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount after filtering key0*");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			oTable.filter(oKeyColumn, "keyn*");
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount after filtering keyn*");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			oTable.filter(oKeyColumn, "*n");
			assert.equal(oTable.getBinding().getCount(), 0, "Table: RowCount after filtering *n");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
			oTable.filter(oKeyColumn, "*01");
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount after filtering *01");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			oTable.filter(oKeyColumn, "*0*");
			assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount after filtering *0*");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			oTable.filter(oKeyColumn, "");
			assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount after removing filter");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
			oTextColumn = oTable.getColumns()[3];
			oTable.filter(oTextColumn, "n");
			return wait();
		}).then(function () {
			assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount length is 1");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(oTextColumn.getFiltered(), "Table: Column Text is filtered");
			oTable.filter(oTextColumn, "*n*");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount after filtering *n*");
			oTable.filter(oTextColumn, "*n");
			assert.equal(oTable.getBinding().getCount(), 0, "Table: RowCount after filtering *n");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			oTable.filter(oTextColumn, "*0*");
			assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount after filtering *0*");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			oTable.filter(oTextColumn, "");
			return wait();
		}).then(function () {
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			assert.ok(!oTextColumn.getFiltered(), "Table: Column Text is not filtered anymore");
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount after removing filter");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			return Promise.resolve();
		});
	});

	QUnit.test("filter via ui", function (assert) {
		var oTable, oCell, oMenu, oInput, oField, oValue, oValueInTable, oKeyColumn, oURLColumn, oClearFilterButton;
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
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			var oAddButton = oToolbar.getContent()[1];
			assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
			oClearFilterButton = oToolbar.getContent()[4];
			assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			var oNewRow = oTable.getRows()[0];
			assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
			oKeyColumn = oTable.getColumns()[1];
			oURLColumn = oTable.getColumns()[4];
			return wait();
		}).then(function() {
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function () {
			oMenu = oKeyColumn.getHeaderMenuInstance();
			assert.ok(oMenu, "Table column: header menu instance ok");
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			EditorQunitUtils.setInputValueAndConfirm(oInput, "n");
			return wait();
		}).then(function () {
			assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount length is 1");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function () {
			EditorQunitUtils.setInputValueAndConfirm(oInput, "keyn*");
			return wait();
		}).then(function () {
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount after filtering keyn*");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function () {
			EditorQunitUtils.setInputValueAndConfirm(oInput, "key0*");
			return wait();
		}).then(function () {
			assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
			assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount after filtering key0*");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected row hided");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			return EditorQunitUtils.openColumnMenu(oURLColumn, assert);
		}).then(function () {
			oMenu = oURLColumn.getHeaderMenuInstance();
			assert.ok(oMenu, "Table column: header menu instance ok");
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			EditorQunitUtils.setInputValueAndConfirm(oInput, "http:");
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 3, "Table: RowCount after filtering column URL with 'http:'");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
			// clear all the filters
			oClearFilterButton.firePress();
			return wait();
		}).then(function () {
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount after filtering key0");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			return Promise.resolve();
		});
	});

	QUnit.test("select and deselect", function (assert) {
		var oTable, oCell, oMenu, oInput, oField, oValue, oValueInTable, oKeyColumn;
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
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
			var oAddButton = oToolbar.getContent()[1];
			assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
			var oClearFilterButton = oToolbar.getContent()[4];
			assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			var oNewRow = oTable.getRows()[0];
			assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
			oKeyColumn = oTable.getColumns()[1];
			return wait();
		}).then(function () {
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function () {
			oMenu = oKeyColumn.getHeaderMenuInstance();
			assert.ok(oMenu, "Table column: header menu instance ok");
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			EditorQunitUtils.setInputValueAndConfirm(oInput, "n");
			return wait();
		}).then(function() {
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount length is 1");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function () {
			EditorQunitUtils.setInputValueAndConfirm(oInput, "keyn*");
			return wait();
		}).then(function() {
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount after filtering keyn*");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			return EditorQunitUtils.openColumnMenu(oKeyColumn, assert);
		}).then(function () {
			EditorQunitUtils.setInputValueAndConfirm(oInput, "key0*");
			return wait();
		}).then(function() {
			assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount after filtering key0*");
			assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value not changed after filtering");
			oCell = oTable.getRows()[0].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 1: Cell 1 is not selected");
			oCell.setSelected(true);
			oCell.fireSelect({
				selected: true
			});
			assert.ok(oCell.getSelected(), "Row 1: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selection change");
			oCell = oTable.getRows()[3].getCells()[0];
			assert.ok(!oCell.getSelected(), "Row 3: Cell 1 is not selected");
			oCell.setSelected(true);
			oCell.fireSelect({
				selected: true
			});
			assert.ok(oCell.getSelected(), "Row 3: Cell 1 is selected");
			assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text04", "key": "key04", "url": "https://sap.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selection change again");
			var oSelectionColumn = oTable.getColumns()[0];
			var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
			assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
			oRemoveValueButton.firePress();
			assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
			assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value removed after clicking remove value button");
			return Promise.resolve();
		});
	});
});
