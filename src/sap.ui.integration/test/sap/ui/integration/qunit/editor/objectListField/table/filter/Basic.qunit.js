/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../../ContextHost",
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

	var oValue1 = { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55 };
	var oValue2 = { "text": "text02", "key": "key02", "url": "http://sap.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55 };
	var oValue3 = { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "editable": true };
	var oValue4 = { "text": "text04", "key": "key04", "url": "https://sap.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "number": 3.55 };
	var oValue5 = { "text": "text05", "key": "key05", "url": "http://sap.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5, "editable": true };
	var oValue6 = { "text": "text06", "key": "key06", "url": "https://sap.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6, "number": 3.55 };
	var oValue7 = { "text": "text07", "key": "key07", "url": "http://sap.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7, "editable": true };
	var oValue8 = { "text": "text08", "key": "key08", "url": "https://sap.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8, "number": 3.55 };
	var aObjectsParameterValue1 = [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8];
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

	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

	function cleanUUIDAndPosition(oValue) {
		var oClonedValue = deepClone(oValue, 500);
		if (typeof oClonedValue === "string") {
			oClonedValue = JSON.parse(oClonedValue);
		}
		if (Array.isArray(oClonedValue)) {
			oClonedValue.forEach(function(oResult) {
				if (oResult._dt) {
					delete oResult._dt._uuid;
					delete oResult._dt._position;
				}
				if (deepEqual(oResult._dt, {})) {
					delete oResult._dt;
				}
			});
		} else if (typeof oClonedValue === "object") {
			if (oClonedValue._dt) {
				delete oClonedValue._dt._uuid;
				delete oClonedValue._dt._position;
			}
			if (deepEqual(oClonedValue._dt, {})) {
				delete oClonedValue._dt;
			}
		}
		return oClonedValue;
	}

	function isReady(oEditor) {
		return new Promise(function(resolve) {
			oEditor.attachReady(function() {
				resolve();
			});
		});
	}

	function openColumnMenu(oColumn) {
		return new Promise(function(resolve) {
			oColumn.attachEventOnce("columnMenuOpen", function() {
				resolve();
			});
			oColumn._openHeaderMenu();
		});
	}

	QUnit.module("Basic", {
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
	});

	QUnit.test("filter via api", function (assert) {
		var oTable, oMenu, oField, oKeyColumn, oTextColumn, oClearFilterButton, oEditButton;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectListFieldsWithPropertiesOnly
		});
		return isReady(oEditor).then(function () {
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
			oTable = oField.getAggregation("_field");
			assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
			assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
			assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
			assert.equal(oTable.getBinding().getCount(), aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
			var oToolbar = oTable.getToolbar();
			assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
			oEditButton = oToolbar.getContent()[2];
			assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
			oClearFilterButton = oToolbar.getContent()[4];
			assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
			oKeyColumn = oTable.getColumns()[1];
			oTable.filter(oKeyColumn, "n");
			return wait();
		}).then(function() {
			return openColumnMenu(oKeyColumn);
		}).then(function () {
			oMenu = oKeyColumn.getMenu();
			oMenu.close();
			return wait();
		}).then(function () {
			assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
			assert.equal(oTable.getBinding().getCount(), 0, "Table: RowCount length is 0");
			assert.equal(oTable.getSelectedIndices().length, 0, "Table: selected row hided");
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			oTable.filter(oKeyColumn, "n*");
			assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
			assert.equal(oTable.getBinding().getCount(), 0, "Table: RowCount after filtering n*");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
			assert.equal(oTable.getSelectedIndices().length, 0, "Table: selected row hided");
			oTable.filter(oKeyColumn, "key0*");
			assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount after filtering key0*");
			oTable.filter(oKeyColumn, "*01");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount after filtering *01");
			oTable.filter(oKeyColumn, "*0*");
			assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount after filtering *0*");
			oTable.filter(oKeyColumn, "");
			return wait();
		}).then(function () {
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
			assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount after removing filter");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
			oTextColumn = oTable.getColumns()[3];
			oTable.filter(oTextColumn, "n");
			return openColumnMenu(oTextColumn);
		}).then(function () {
			oMenu = oTextColumn.getMenu();
			oMenu.close();
			return wait();
		}).then(function () {
			assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
			assert.equal(oTable.getBinding().getCount(), 0, "Table: RowCount length is 0");
			assert.ok(oTextColumn.getFiltered(), "Table: Column Text is filtered");
			oTable.filter(oTextColumn, "*n");
			assert.equal(oTable.getBinding().getCount(), 0, "Table: RowCount after filtering *n");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
			oTable.filter(oTextColumn, "*0*");
			assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount after filtering *0*");
			return wait();
		}).then(function () {
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
			oTable.filter(oTextColumn, "01");
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount after filtering 01");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
			oTable.filter(oTextColumn, "");
			return wait();
		}).then(function () {
			assert.ok(!oTextColumn.getFiltered(), "Table: Column Text is not filtered anymore");
			assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount after removing all filters");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			return Promise.resolve();
		});
	});

	QUnit.test("filter via ui", function (assert) {
		var oTable, oMenu, oField, oURLColumn, oIntColumn, oClearFilterButton, oEditButton;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectListFieldsWithPropertiesOnly
		});
		return isReady(oEditor).then(function() {
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
			oTable = oField.getAggregation("_field");
			assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
			assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
			assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
			assert.equal(oTable.getBinding().getCount(), aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
			var oToolbar = oTable.getToolbar();
			assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
			oEditButton = oToolbar.getContent()[2];
			assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
			oClearFilterButton = oToolbar.getContent()[4];
			assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
			oURLColumn = oTable.getColumns()[4];
			oIntColumn = oTable.getColumns()[6];
			return wait();
		}).then(function() {
			return openColumnMenu(oURLColumn);
		}).then(function() {
			oMenu = oURLColumn.getMenu();
			oMenu.getItems()[0].setValue("https");
			oMenu.getItems()[0].fireSelect();
			oMenu.close();
			return wait();
		}).then(function () {
			assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
			assert.equal(oTable.getBinding().getCount(), 5, "Table: RowCount after filtering column URL with 'https'");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
			return openColumnMenu(oIntColumn);
		}).then(function() {
			oMenu = oIntColumn.getMenu();
			oMenu.getItems()[0].setValue("4");
			oMenu.getItems()[0].fireSelect();
			oMenu.close();
			return wait();
		}).then(function () {
			assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount after filtering column Integer with '4'");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
			return openColumnMenu(oIntColumn);
		}).then(function() {
			oMenu.getItems()[0].setValue(">4");
			oMenu.getItems()[0].fireSelect();
			oMenu.close();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 2, "Table: RowCount after filtering column Integer with '>4'");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");

			assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
			// clear all the filters
			oClearFilterButton.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount after removing all the filters");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			return Promise.resolve();
		});
	});
});
