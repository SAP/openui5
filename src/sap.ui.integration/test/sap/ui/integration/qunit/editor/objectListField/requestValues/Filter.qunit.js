/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../ContextHost",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone",
	"sap/ui/core/util/MockServer",
	"sap/ui/core/Core",
	"qunit/designtime/EditorQunitUtils"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	deepClone,
	MockServer,
	Core,
	EditorQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
	var oValue1Ori = {"text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#E69A17", "int": 1 , "editable": true, "number": 3.55};
	var oValue2Ori = {"text": "text02", "key": "key02", "url": "http://sap.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55};
	var oValue3Ori = {"text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "editable": true};
	var oValue4Ori = {"text": "text04", "key": "key04", "url": "https://sap.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "number": 3.55};
	var oValue5Ori = {"text": "text05", "key": "key05", "url": "http://sap.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5, "editable": true};
	var oValue6Ori = {"text": "text06", "key": "key06", "url": "https://sap.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6, "number": 3.55};
	var oValue7Ori = {"text": "text07", "key": "key07", "url": "http://sap.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7, "editable": true};
	var oValue8Ori = {"text": "text08", "key": "key08", "url": "https://sap.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8, "number": 3.55};
	var oValue1 = Object.assign(deepClone(oValue1Ori), {"_editable": false});
	var oValue2 = Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}});
	var oValue3 = Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}});
	var oValue5 = Object.assign(deepClone(oValue5Ori), {"_editable": false});
	var oValue7 = Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}});
	var oValue8 = Object.assign(deepClone(oValue8Ori), {"_editable": false});

	var oValueNew = {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
	var aObjectsParameterValue = [
		Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
		Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
		Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
		Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
		Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}}),
		oValueNew
	];
	var oManifestForObjectListFields = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectListWithRequestValues",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectListWithRequestValues": {
						"value": [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew]
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
		"Objects": [oValue1Ori, oValue2Ori, oValue3Ori, oValue4Ori, oValue5Ori, oValue6Ori, oValue7Ori, oValue8Ori]
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

	QUnit.module("Basic", {
		before: function () {
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: RegExp("/mock_request/Objects.*"),
					response: function (xhr) {
						xhr.respondJSON(200, null, {"value": oResponseData["Objects"]});
					}
				}
			]);
			this.oMockServer.start();

			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		after: function () {
			this.oMockServer.destroy();
			this.oHost.destroy();
			this.oContextHost.destroy();
			sandbox.restore();
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
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
				document.body.style.zIndex = "unset";
			}
		}
	});

	QUnit.test("basic", function (assert) {
		var oTable, oMenu, oInput, oField, oURLColumn, oIntColumn, oClearFilterButton;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectListFields
		});
		return EditorQunitUtils.isReady(oEditor).then(function() {
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined: value from request", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
			oTable = oField.getAggregation("_field");
			assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
			var oEditButton = oToolbar.getContent()[2];
			assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
			oClearFilterButton = oToolbar.getContent()[4];
			assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			return EditorQunitUtils.tableUpdated(oField);
		}).then(function() {
			assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
			assert.equal(oTable.getBinding().getCount(), (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
			oURLColumn = oTable.getColumns()[4];
			oIntColumn = oTable.getColumns()[6];
			return EditorQunitUtils.openColumnMenu(oURLColumn);
		}).then(function() {
			oMenu = oURLColumn.getHeaderMenuInstance();
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			EditorQunitUtils.setInputValueAndConfirm(oInput, "https");
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 6, "Table: RowCount after filtering column URL with 'https'");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
			// open the column filter menu, input filter value, close the menu.
			return EditorQunitUtils.openColumnMenu(oIntColumn);
		}).then(function() {
			oMenu = oIntColumn.getHeaderMenuInstance();
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			EditorQunitUtils.setInputValueAndConfirm(oInput, "4");
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 1, "Table: RowCount after filtering column Integer with '4'");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
			// open the column filter menu, input filter value, close the menu.
			return EditorQunitUtils.openColumnMenu(oIntColumn);
		}).then(function() {
			EditorQunitUtils.setInputValueAndConfirm(oInput, ">4");
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 2, "Table: RowCount after filtering column Integer with '>4'");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");

			// clear all the filters
			oClearFilterButton.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount after removing all the filters");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
			return Promise.resolve();
		});
	});

	QUnit.test("select", function (assert) {
		var oTable, oMenu, oInput, oField, oURLColumn, oClearFilterButton, oSelectOrUnSelectAllButton, oRow5, oRow6, oSelectionCell5, oSelectionCell6;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectListFields
		});
		return EditorQunitUtils.isReady(oEditor).then(function() {
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined: value from request", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
			oTable = oField.getAggregation("_field");
			assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
			var oEditButton = oToolbar.getContent()[2];
			assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
			oClearFilterButton = oToolbar.getContent()[4];
			assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			return EditorQunitUtils.tableUpdated(oField);
		}).then(function() {
			assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
			assert.equal(oTable.getBinding().getCount(), (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
			var oColumns = oTable.getColumns();
			assert.equal(oColumns.length, 8, "Table: column number is 8");
			var oSelectionColumn = oColumns[0];
			oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
			assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
			assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
			oURLColumn = oColumns[4];
			return EditorQunitUtils.openColumnMenu(oURLColumn);
		}).then(function() {
			oMenu = oURLColumn.getHeaderMenuInstance();
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			EditorQunitUtils.setInputValueAndConfirm(oInput, "https");
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 6, "Table: RowCount after filtering column URL with 'https'");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

			// scroll to the bottom
			oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
			return wait();
		}).then(function () {
			oRow5 = oTable.getRows()[3];
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow5.getBindingContext().getObject()), Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}})), "Table: row 5 value");
			oSelectionCell5 = oRow5.getCells()[0];
			assert.ok(!oSelectionCell5.getSelected(), "Row 5: not selected");
			oSelectionCell5.setSelected(true);
			oSelectionCell5.fireSelect({selected: true});
			return wait();
		}).then(function () {
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow5.getBindingContext().getObject()), Object.assign(deepClone(oValue4Ori), {
				"_dt": {
					"_editable": false,
					"_selected": true
				}
			})), "Table: row 5 value");
			assert.ok(oSelectionCell5.getSelected(), "Row 5: selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
				Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}}),
				oValueNew,
				Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}})
			]), "Field 1: Value after selecting row5");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

			oRow6 = oTable.getRows()[4];
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow6.getBindingContext().getObject()), Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}})), "Table: row 6 value");
			oSelectionCell6 = oRow6.getCells()[0];
			assert.ok(!oSelectionCell6.getSelected(), "Row 6: not selected");
			oSelectionCell6.setSelected(true);
			oSelectionCell6.fireSelect({selected: true});
			return wait();
		}).then(function () {
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow6.getBindingContext().getObject()), Object.assign(deepClone(oValue6Ori), {
				"_dt": {
					"_editable": false,
					"_selected": true
				}
			})), "Table: row 6 value");
			assert.ok(oSelectionCell6.getSelected(), "Row 6: selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
				Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}}),
				oValueNew,
				Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}})
			]), "Field 1: Value after selecting row6");
			assert.ok(oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column selected");

			// clear all the filters
			oClearFilterButton.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount after removing all the filters");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue.concat([
				Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}})
			])), "Field 1: Value after selecting row6");
			return Promise.resolve();
		});
	});

	QUnit.test("selectAll", function (assert) {
		var oTable, oMenu, oInput, oField, oURLColumn, oClearFilterButton, oSelectOrUnSelectAllButton, oRow5, oRow6, oSelectionCell5, oSelectionCell6;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectListFields
		});
		return EditorQunitUtils.isReady(oEditor).then(function() {
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined: value from request", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
			oTable = oField.getAggregation("_field");
			assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
			var oEditButton = oToolbar.getContent()[2];
			assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
			oClearFilterButton = oToolbar.getContent()[4];
			assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			return EditorQunitUtils.tableUpdated(oField);
		}).then(function() {
			assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
			assert.equal(oTable.getBinding().getCount(), (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
			var oColumns = oTable.getColumns();
			assert.equal(oColumns.length, 8, "Table: column number is 8");
			var oSelectionColumn = oColumns[0];
			oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
			assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
			assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
			oURLColumn = oColumns[4];
			return EditorQunitUtils.openColumnMenu(oURLColumn);
		}).then(function() {
			oMenu = oURLColumn.getHeaderMenuInstance();
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			EditorQunitUtils.setInputValueAndConfirm(oInput, "https");
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 6, "Table: RowCount after filtering column URL with 'https'");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

			// scroll to the bottom
			oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
			return wait();
		}).then(function () {
			oRow5 = oTable.getRows()[3];
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow5.getBindingContext().getObject()), Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}})), "Table: row 5 value");
			oSelectionCell5 = oRow5.getCells()[0];
			assert.ok(!oSelectionCell5.getSelected(), "Row 5: not selected");
			oRow6 = oTable.getRows()[4];
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow6.getBindingContext().getObject()), Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}})), "Table: row 6 value");
			oSelectionCell6 = oRow6.getCells()[0];
			assert.ok(!oSelectionCell6.getSelected(), "Row 6: not selected");
			// select all
			oSelectOrUnSelectAllButton.setSelected(true);
			oSelectOrUnSelectAllButton.fireSelect({selected: true});
			return wait();
		}).then(function () {
			assert.ok(oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow5.getBindingContext().getObject()), Object.assign(deepClone(oValue4Ori), {
				"_dt": {
					"_editable": false,
					"_selected": true
				}
			})), "Table: row 5 value");
			assert.ok(oSelectionCell5.getSelected(), "Row 5: selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow6.getBindingContext().getObject()), Object.assign(deepClone(oValue6Ori), {
				"_dt": {
					"_editable": false,
					"_selected": true
				}
			})), "Table: row 6 value");
			assert.ok(oSelectionCell6.getSelected(), "Row 6: selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
				Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}}),
				oValueNew,
				Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}})
			]), "Field 1: Value after selecting all");

			// clear all the filters
			oClearFilterButton.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount after removing all the filters");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue.concat([
				Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}})
			])), "Field 1: Value after selecting row6");
			return Promise.resolve();
		});
	});

	QUnit.test("deselect", function (assert) {
		var oTable, oMenu, oInput, oField, oURLColumn, oClearFilterButton, oSelectOrUnSelectAllButton, oRow1, oRow2, oRow3, oSelectionCell1, oSelectionCell2, oSelectionCell3;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectListFields
		});
		return EditorQunitUtils.isReady(oEditor).then(function() {
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined: value from request", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
			oTable = oField.getAggregation("_field");
			assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
			var oEditButton = oToolbar.getContent()[2];
			assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
			oClearFilterButton = oToolbar.getContent()[4];
			assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			return EditorQunitUtils.tableUpdated(oField);
		}).then(function() {
			assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
			assert.equal(oTable.getBinding().getCount(), (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
			var oColumns = oTable.getColumns();
			assert.equal(oColumns.length, 8, "Table: column number is 8");
			var oSelectionColumn = oColumns[0];
			oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
			assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
			assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
			oURLColumn = oColumns[4];
			return EditorQunitUtils.openColumnMenu(oURLColumn);
		}).then(function() {
			oMenu = oURLColumn.getHeaderMenuInstance();
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			EditorQunitUtils.setInputValueAndConfirm(oInput, "http://");
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 3, "Table: RowCount after filtering column URL with 'http://'");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

			oRow1 = oTable.getRows()[0];
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow1.getBindingContext().getObject()), Object.assign(deepClone(oValue5Ori), {
				"_dt": {
					"_editable": false,
					"_selected": true
				}
			})), "Table: row 1 value");
			oSelectionCell1 = oRow1.getCells()[0];
			assert.ok(oSelectionCell1.getSelected(), "Row1: selected");
			oRow2 = oTable.getRows()[1];
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow2.getBindingContext().getObject()), Object.assign(deepClone(oValue7Ori), {
				"_dt": {
					"_editable": false,
					"_selected": true
				}
			})), "Table: row 2 value");
			oSelectionCell2 = oRow2.getCells()[0];
			assert.ok(oSelectionCell2.getSelected(), "Row2: selected");
			oRow3 = oTable.getRows()[2];
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow3.getBindingContext().getObject()), oValue2), "Table: row 2 value");
			oSelectionCell3 = oRow3.getCells()[0];
			assert.ok(!oSelectionCell3.getSelected(), "Row3: not selected");
			oSelectionCell1.setSelected(false);
			oSelectionCell1.fireSelect({selected: false});
			return wait();
		}).then(function () {
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow1.getBindingContext().getObject()), Object.assign(deepClone(oValue5Ori), {
				"_dt": {
					"_editable": false,
					"_selected": false
				}
			})), "Table: row 1 value after deselecting");
			assert.ok(!oSelectionCell1.getSelected(), "Row1: not selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
				Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}}),
				oValueNew
			]), "Field 1: Value after deselecting row1");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

			oSelectionCell2.setSelected(false);
			oSelectionCell2.fireSelect({selected: false});
			return wait();
		}).then(function () {
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow2.getBindingContext().getObject()), Object.assign(deepClone(oValue7Ori), {
				"_dt": {
					"_editable": false,
					"_selected": false
				}
			})), "Table: row 2 value after deselecting");
			assert.ok(!oSelectionCell2.getSelected(), "Row2: not selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
				Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}}),
				oValueNew
			]), "Field 1: Value after deselecting row2");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

			// clear all the filters
			oClearFilterButton.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount after removing all the filters");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
				Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}}),
				oValueNew
			]), "Field 1: Value");
			return Promise.resolve();
		});
	});

	QUnit.test("deselectAll", function (assert) {
		var oTable, oMenu, oInput, oField, oURLColumn, oClearFilterButton, oSelectOrUnSelectAllButton, oRow1, oRow2, oRow3, oSelectionCell1, oSelectionCell2, oSelectionCell3;
		var oEditor = this.oEditor;
		oEditor.setJson({
			baseUrl: sBaseUrl,
			host: "contexthost",
			manifest: oManifestForObjectListFields
		});
		return EditorQunitUtils.isReady(oEditor).then(function() {
			var oLabel = oEditor.getAggregation("_formContent")[1];
			oField = oEditor.getAggregation("_formContent")[2];
			assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
			assert.equal(oLabel.getText(), "Object properties defined: value from request", "Label 1: Has label text");
			assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
			oTable = oField.getAggregation("_field");
			assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
			var oToolbar = oTable.getExtension()[0];
			assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
			var oEditButton = oToolbar.getContent()[2];
			assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
			oClearFilterButton = oToolbar.getContent()[4];
			assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
			assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
			return EditorQunitUtils.tableUpdated(oField);
		}).then(function() {
			assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
			assert.equal(oTable.getBinding().getCount(), (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
			var oColumns = oTable.getColumns();
			assert.equal(oColumns.length, 8, "Table: column number is 8");
			var oSelectionColumn = oColumns[0];
			oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
			assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
			assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
			oURLColumn = oColumns[4];
			return EditorQunitUtils.openColumnMenu(oURLColumn);
		}).then(function() {
			oMenu = oURLColumn.getHeaderMenuInstance();
			oInput = oMenu.getAggregation("_quickActions")[0].getQuickActions()[0].getContent()[0];
			EditorQunitUtils.setInputValueAndConfirm(oInput, "http://");
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 3, "Table: RowCount after filtering column URL with 'http://'");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

			oRow1 = oTable.getRows()[0];
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow1.getBindingContext().getObject()), Object.assign(deepClone(oValue5Ori), {
				"_dt": {
					"_editable": false,
					"_selected": true
				}
			})), "Table: row 1 value");
			oSelectionCell1 = oRow1.getCells()[0];
			assert.ok(oSelectionCell1.getSelected(), "Row1: selected");
			oRow2 = oTable.getRows()[1];
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow2.getBindingContext().getObject()), Object.assign(deepClone(oValue7Ori), {
				"_dt": {
					"_editable": false,
					"_selected": true
				}
			})), "Table: row 2 value");
			oSelectionCell2 = oRow2.getCells()[0];
			assert.ok(oSelectionCell2.getSelected(), "Row2: selected");
			oRow3 = oTable.getRows()[2];
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow3.getBindingContext().getObject()), oValue2), "Table: row 2 value");
			oSelectionCell3 = oRow3.getCells()[0];
			assert.ok(!oSelectionCell3.getSelected(), "Row3: not selected");
			oSelectionCell3.setSelected(true);
			oSelectionCell3.fireSelect({selected: true});
			return wait();
		}).then(function () {
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow3.getBindingContext().getObject()), Object.assign(deepClone(oValue2Ori), {
				"_dt": {
					"_editable": false,
					"_selected": true
				}
			})), "Table: row 3 value after selecting");
			assert.ok(oSelectionCell3.getSelected(), "Row1: not selected");
			assert.ok(oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue.concat([
				oValue2
			])), "Field 1: Value after selectingAll");
			assert.ok(oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column selected");

			oSelectOrUnSelectAllButton.setSelected(false);
			oSelectOrUnSelectAllButton.fireSelect({selected: false});
			return wait();
		}).then(function () {
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow1.getBindingContext().getObject()), Object.assign(deepClone(oValue5Ori), {
				"_dt": {
					"_editable": false,
					"_selected": false
				}
			})), "Table: row 1 value after deselectAll");
			assert.ok(!oSelectionCell1.getSelected(), "Row1: not selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow2.getBindingContext().getObject()), Object.assign(deepClone(oValue7Ori), {
				"_dt": {
					"_editable": false,
					"_selected": false
				}
			})), "Table: row 2 value after deselectAll");
			assert.ok(!oSelectionCell2.getSelected(), "Row2: not selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oRow3.getBindingContext().getObject()), Object.assign(deepClone(oValue2Ori), {
				"_dt": {
					"_editable": false,
					"_selected": false
				}
			})), "Table: row 3 value after deselectAll");
			assert.ok(!oSelectionCell3.getSelected(), "Row3: not selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
				Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}}),
				oValueNew
			]), "Field 1: Value after deselectAll");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

			// clear all the filters
			oClearFilterButton.firePress();
			return wait();
		}).then(function () {
			assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount after removing all the filters");
			assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
			assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
				Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
				Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}}),
				oValueNew
			]), "Field 1: Value");
			return Promise.resolve();
		});
	});
});
