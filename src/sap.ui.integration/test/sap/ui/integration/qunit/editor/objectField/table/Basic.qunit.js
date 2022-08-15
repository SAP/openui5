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
	"sap/base/util/deepClone"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	MockServer,
	Core,
	deepClone
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	var oManifestForObjectFieldsWithValues = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectFieldsWithValues",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectWithPropertiesDefinedAndValueFromJsonList": {
						"value": {"text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false, "_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"}}
					},
					"objectWithPropertiesDefinedAndValueFromRequestedFile": {
						"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false, "_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"}}
					},
					"objectWithPropertiesDefinedAndValueFromODataRequest": {
						"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false, "_uuid": "333771a4-0d3f-4fec-af20-6f28f1b894cb"}}
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

	QUnit.module("basic", {
		beforeEach: function () {
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
	}, function () {
		QUnit.test("no value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldsWithValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithPropertiesDefinedAndValueFromJsonList": {},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {}
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
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oTableToolbar = oTable.getToolbar();
					var oAddButton = oTableToolbar.getContent()[1];
					assert.ok(oAddButton.getEnabled(), "Table: Add button in toolbar enabled");
					var oEditButton = oTableToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
					var oDeleteButton = oTableToolbar.getContent()[3];
					assert.ok(!oDeleteButton.getEnabled(), "Table: Delete button in toolbar disabled");
					var oClearFitlersButton = oTableToolbar.getContent()[4];
					assert.ok(!oClearFitlersButton.getEnabled(), "Table: ClearAllFilters button in toolbar disabled");
					var oSelectAllSelectionsButton = oTableToolbar.getContent()[5];
					assert.ok(!oSelectAllSelectionsButton.getVisible(), "Table: SelectAllSelections button in toolbar hided");
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					var oClearAllSelectionsButton = oTableToolbar.getContent()[6];
					assert.ok(!oClearAllSelectionsButton.getVisible(), "Table: ClearAllSelections button in toolbar hided");
					assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
					var oSelectionColumn = oTable.getColumns()[0];
					var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
					var oColumns = oTable.getColumns();
					assert.equal(oColumns.length, 8, "Table: column number is 8");
					assert.equal(oColumns[1].getLabel().getText(), "Key", "Table: column 'Key'");
					assert.equal(oColumns[2].getLabel().getText(), "Icon", "Table: column 'Icon'");
					assert.equal(oColumns[3].getLabel().getText(), "Text", "Table: column 'Text'");
					assert.equal(oColumns[4].getLabel().getText(), "URL Link", "Table: column 'URL Link'");
					assert.equal(oColumns[5].getLabel().getText(), "Editable", "Table: column 'Editable'");
					assert.equal(oColumns[6].getLabel().getText(), "Integer", "Table: column 'Integer'");
					assert.equal(oColumns[7].getLabel().getText(), "Number", "Table: column 'Number'");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange({
						rowIndex: 0,
						userInteraction: true
					});
					assert.equal(oTable.getSelectedIndices()[0], 0, "Table: SelectedIndices Value after table selection change");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value not change after table selection change");
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
					oTable.setSelectedIndex(3);
					oTable.fireRowSelectionChange({
						rowIndex: 3,
						userInteraction: true
					});
					assert.equal(oTable.getSelectedIndices()[0], 3, "Table: SelectedIndices Value after table selection change again");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value not change after table selection change again");
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
					oTable.setSelectedIndex(-1);
					oTable.fireRowSelectionChange({
						rowIndex: -1,
						userInteraction: true
					});
					assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value after remove table selection");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value after remove table selection");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value not change after remove table selection");
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");

					oSelectAllSelectionsButton.firePress();
					assert.ok(!oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar disabled");
					assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
					assert.equal(oTable.getSelectedIndices().length, 8, "Table: Select All selections working");

					oClearAllSelectionsButton.firePress();
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: Clear All selections working");

					var oRow1 = oTable.getRows()[0];
					var oSelectionCell1 = oRow1.getCells()[0];
					assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
					assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
					oSelectionCell1.setSelected(true);
					oSelectionCell1.fireSelect({
						selected: true
					});
					assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
					assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selecting");
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
					oSelectionCell1.setSelected(false);
					oSelectionCell1.fireSelect({
						selected: false
					});
					assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
					assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after deselecting");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value removed after deselecting");
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

					var oRow4 = oTable.getRows()[3];
					var oSelectionCell4 = oRow4.getCells()[0];
					assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
					assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
					oSelectionCell4.setSelected(true);
					oSelectionCell4.fireSelect({
						selected: true
					});
					assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
					assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text04", "key": "key04", "url": "https://sap.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selecting again");
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");

					oRemoveValueButton.firePress();
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value removed after clicking remove value button");

					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					wait().then(function () {
						assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.equal(oLabel2.getText(), "Object properties defined: value from requested file", "Label 2: Has label text");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField2._getCurrentProperty("value"), "Field 2: Value");
						oTable = oField2.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 2: Control is Table");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 4, "Table: value length is 4");
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
						oSelectionColumn = oTable.getColumns()[0];
						oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
						assert.ok(!oField2._getCurrentProperty("value"), "Field 2: Value not change");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
						oTable.setSelectedIndex(3);
						oTable.fireRowSelectionChange({
							rowIndex: 3,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
						assert.ok(!oField2._getCurrentProperty("value"), "Field 2: Value not change");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
						oTable.setSelectedIndex(-1);
						oTable.fireRowSelectionChange({
							rowIndex: -1,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove table selection");
						assert.ok(!oField2._getCurrentProperty("value"), "Field 2: Value not change");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");

						var oRow1 = oTable.getRows()[0];
						var oSelectionCell1 = oRow1.getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
						oSelectionCell1.setSelected(true);
						oSelectionCell1.fireSelect({
							selected: true
						});
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
						assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
						assert.ok(deepEqual(cleanUUID(oField2._getCurrentProperty("value")), {"text": "text1req", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept", "_dt": {"_editable": false} }), "Field 2: DT Value changed after selecting");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
						oSelectionCell1.setSelected(false);
						oSelectionCell1.fireSelect({
							selected: false
						});
						assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
						assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after deselecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
						assert.ok(!oField2._getCurrentProperty("value"), "Field 2: DT Value removed after deselecting");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

						var oRow4 = oTable.getRows()[3];
						var oSelectionCell4 = oRow4.getCells()[0];
						assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
						assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
						oSelectionCell4.setSelected(true);
						oSelectionCell4.fireSelect({
							selected: true
						});
						assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
						assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
						assert.ok(deepEqual(cleanUUID(oField2._getCurrentProperty("value")), { "text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false} }), "Field 2: DT Value changed after selecting");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						oRemoveValueButton.firePress();
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
						assert.ok(!oField2._getCurrentProperty("value"), "Field 2: DT Value removed after clicking remove value button");

						wait().then(function () {
							assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
							assert.equal(oLabel3.getText(), "Object properties defined: value from OData Request", "Label 3: Has label text");
							assert.ok(oField3.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
							assert.ok(!oField3._getCurrentProperty("value"), "Field 3: Value");
							oTable = oField3.getAggregation("_field");
							assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
							assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
							assert.equal(oTable.getBinding().getCount(), 6, "Table: value length is 6");
							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
							oSelectionColumn = oTable.getColumns()[0];
							oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
							assert.ok(!oField3._getCurrentProperty("value"), "Field 3: Value not change");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
							assert.ok(!oField3._getCurrentProperty("value"), "Field 3: Value not change");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
							oTable.setSelectedIndex(-1);
							oTable.fireRowSelectionChange({
								rowIndex: -1,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove table selection");
							assert.ok(!oField3._getCurrentProperty("value"), "Field 3: Value not change");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");

							var oRow1 = oTable.getRows()[0];
							var oSelectionCell1 = oRow1.getCells()[0];
							assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
							assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
							oSelectionCell1.setSelected(true);
							oSelectionCell1.fireSelect({
								selected: true
							});
							assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
							assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
							assert.ok(deepEqual(cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1", "_dt": {"_editable": false} }), "Field 3: DT Value not change after table selection change");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
							oSelectionCell1.setSelected(false);
							oSelectionCell1.fireSelect({
								selected: false
							});
							assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
							assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after deselecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
							assert.ok(!oField3._getCurrentProperty("value"), "Field 3: DT Value removed after deselecting");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

							var oRow4 = oTable.getRows()[3];
							var oSelectionCell4 = oRow4.getCells()[0];
							assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
							assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
							oSelectionCell4.setSelected(true);
							oSelectionCell4.fireSelect({
								selected: true
							});
							assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
							assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
							assert.ok(deepEqual(cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4", "_dt": {"_editable": false} }), "Field 3: DT Value not change after table selection change again");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
							oRemoveValueButton.firePress();
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
							assert.ok(!oField._getCurrentProperty("value"), "Field 3: DT Value removed after clicking remove value button");

							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("{} as value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldsWithValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {}
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
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oTableToolbar = oTable.getToolbar();
					var oAddButton = oTableToolbar.getContent()[1];
					assert.ok(oAddButton.getEnabled(), "Table: Add button in toolbar enabled");
					var oEditButton = oTableToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
					var oDeleteButton = oTableToolbar.getContent()[3];
					assert.ok(!oDeleteButton.getEnabled(), "Table: Delete button in toolbar disabled");
					var oClearFitlersButton = oTableToolbar.getContent()[4];
					assert.ok(!oClearFitlersButton.getEnabled(), "Table: ClearAllFilters button in toolbar disabled");
					var oSelectAllSelectionsButton = oTableToolbar.getContent()[5];
					assert.ok(!oSelectAllSelectionsButton.getVisible(), "Table: SelectAllSelections button in toolbar hided");
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					var oClearAllSelectionsButton = oTableToolbar.getContent()[6];
					assert.ok(!oClearAllSelectionsButton.getVisible(), "Table: ClearAllSelections button in toolbar hided");
					assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
					var oSelectionColumn = oTable.getColumns()[0];
					var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
					var oColumns = oTable.getColumns();
					assert.equal(oColumns.length, 8, "Table: column number is 8");
					assert.equal(oColumns[1].getLabel().getText(), "Key", "Table: column 'Key'");
					assert.equal(oColumns[2].getLabel().getText(), "Icon", "Table: column 'Icon'");
					assert.equal(oColumns[3].getLabel().getText(), "Text", "Table: column 'Text'");
					assert.equal(oColumns[4].getLabel().getText(), "URL Link", "Table: column 'URL Link'");
					assert.equal(oColumns[5].getLabel().getText(), "Editable", "Table: column 'Editable'");
					assert.equal(oColumns[6].getLabel().getText(), "Integer", "Table: column 'Integer'");
					assert.equal(oColumns[7].getLabel().getText(), "Number", "Table: column 'Number'");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange({
						rowIndex: 0,
						userInteraction: true
					});
					assert.equal(oTable.getSelectedIndices()[0], 0, "Table: SelectedIndices Value after table selection change");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: DT Value not change after table selection change");
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
					oTable.setSelectedIndex(3);
					oTable.fireRowSelectionChange({
						rowIndex: 3,
						userInteraction: true
					});
					assert.equal(oTable.getSelectedIndices()[0], 3, "Table: SelectedIndices Value after table selection change again");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: DT Value not change after table selection change again");
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
					oTable.setSelectedIndex(-1);
					oTable.fireRowSelectionChange({
						rowIndex: -1,
						userInteraction: true
					});
					assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value after remove table selection");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value after remove table selection");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: Value not change after remove table selection");
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");

					oSelectAllSelectionsButton.firePress();
					assert.ok(!oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar disabled");
					assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
					assert.equal(oTable.getSelectedIndices().length, 8, "Table: Select All selections working");

					oClearAllSelectionsButton.firePress();
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: Clear All selections working");

					var oRow1 = oTable.getRows()[0];
					var oSelectionCell1 = oRow1.getCells()[0];
					assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
					assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
					oSelectionCell1.setSelected(true);
					oSelectionCell1.fireSelect({
						selected: true
					});
					assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
					assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selecting");
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
					oSelectionCell1.setSelected(false);
					oSelectionCell1.fireSelect({
						selected: false
					});
					assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
					assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after deselecting");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value removed after deselecting");
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

					var oRow4 = oTable.getRows()[3];
					var oSelectionCell4 = oRow4.getCells()[0];
					assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
					assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
					oSelectionCell4.setSelected(true);
					oSelectionCell4.fireSelect({
						selected: true
					});
					assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
					assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text04", "key": "key04", "url": "https://sap.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selecting again");
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");

					oRemoveValueButton.firePress();
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value removed after clicking remove value button");

					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					wait().then(function () {
						assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.equal(oLabel2.getText(), "Object properties defined: value from requested file", "Label 2: Has label text");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(deepEqual(oField2._getCurrentProperty("value"), {}), "Field 2: Value");
						oTable = oField2.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 2: Control is Table");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 4, "Table: value length is 4");
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
						oSelectionColumn = oTable.getColumns()[0];
						oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
						assert.ok(deepEqual(oField2._getCurrentProperty("value"), {}), "Field 2: Value not change");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
						oTable.setSelectedIndex(3);
						oTable.fireRowSelectionChange({
							rowIndex: 3,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
						assert.ok(deepEqual(oField2._getCurrentProperty("value"), {}), "Field 2: Value not change");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
						oTable.setSelectedIndex(-1);
						oTable.fireRowSelectionChange({
							rowIndex: -1,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove table selection");
						assert.ok(deepEqual(oField2._getCurrentProperty("value"), {}), "Field 2: Value not change");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");

						var oRow1 = oTable.getRows()[0];
						var oSelectionCell1 = oRow1.getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
						oSelectionCell1.setSelected(true);
						oSelectionCell1.fireSelect({
							selected: true
						});
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
						assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
						assert.ok(deepEqual(cleanUUID(oField2._getCurrentProperty("value")), { "text": "text1req", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept", "_dt": {"_editable": false} }), "Field 2: DT Value changed after selecting");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
						oSelectionCell1.setSelected(false);
						oSelectionCell1.fireSelect({
							selected: false
						});
						assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
						assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after deselecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: DT Value removed after deselecting");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

						var oRow4 = oTable.getRows()[3];
						var oSelectionCell4 = oRow4.getCells()[0];
						assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
						assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
						oSelectionCell4.setSelected(true);
						oSelectionCell4.fireSelect({
							selected: true
						});
						assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
						assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
						assert.ok(deepEqual(cleanUUID(oField2._getCurrentProperty("value")), { "text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false} }), "Field 2: DT Value changed after selecting");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						oRemoveValueButton.firePress();
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
						assert.ok(!oField._getCurrentProperty("value"), "Field 2: DT Value removed after clicking remove value button");

						wait().then(function () {
							assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
							assert.equal(oLabel3.getText(), "Object properties defined: value from OData Request", "Label 3: Has label text");
							assert.ok(oField3.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
							assert.ok(deepEqual(oField3._getCurrentProperty("value"), {}), "Field 3: Value");
							oTable = oField3.getAggregation("_field");
							assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
							assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
							assert.equal(oTable.getBinding().getCount(), 6, "Table: value length is 6");
							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
							oSelectionColumn = oTable.getColumns()[0];
							oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
							assert.ok(deepEqual(oField3._getCurrentProperty("value"), {}), "Field 3: Value not change");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
							assert.ok(deepEqual(oField3._getCurrentProperty("value"), {}), "Field 3: Value not change");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
							oTable.setSelectedIndex(-1);
							oTable.fireRowSelectionChange({
								rowIndex: -1,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove table selection");
							assert.ok(deepEqual(oField3._getCurrentProperty("value"), {}), "Field 3: Value not change");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");

							var oRow1 = oTable.getRows()[0];
							var oSelectionCell1 = oRow1.getCells()[0];
							assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
							assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
							oSelectionCell1.setSelected(true);
							oSelectionCell1.fireSelect({
								selected: true
							});
							assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
							assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
							assert.ok(deepEqual(cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1", "_dt": {"_editable": false} }), "Field 3: DT Value not change after table selection change");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
							oSelectionCell1.setSelected(false);
							oSelectionCell1.fireSelect({
								selected: false
							});
							assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
							assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after deselecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
							assert.ok(!oField3._getCurrentProperty("value"), "Field 3: DT Value removed after deselecting");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

							var oRow4 = oTable.getRows()[3];
							var oSelectionCell4 = oRow4.getCells()[0];
							assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
							assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
							oSelectionCell4.setSelected(true);
							oSelectionCell4.fireSelect({
								selected: true
							});
							assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
							assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
							assert.ok(deepEqual(cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4", "_dt": {"_editable": false} }), "Field 3: DT Value not change after table selection change again");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
							oRemoveValueButton.firePress();
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
							assert.ok(!oField._getCurrentProperty("value"), "Field 2: DT Value removed after clicking remove value button");

							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("no add and clearFilter buttons in table toolbar", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldWithoutAddAndClearFilterButtons",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithoutAddAndClearFilterButtons": {
									"value": {}
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
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oSelectionColumn = oTable.getColumns()[0];
					var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(!oAddButton.getVisible(), "Table toolbar: add button not visible");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("select and unselect", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest:  oManifestForObjectFieldsWithValues
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false }}), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oTableToolbar = oTable.getToolbar();
					var oAddButton = oTableToolbar.getContent()[1];
					assert.ok(oAddButton.getEnabled(), "Table: Add button in toolbar enabled");
					var oEditButton = oTableToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
					var oDeleteButton = oTableToolbar.getContent()[3];
					assert.ok(!oDeleteButton.getEnabled(), "Table: Delete button in toolbar disabled");
					var oClearFitlersButton = oTableToolbar.getContent()[4];
					assert.ok(!oClearFitlersButton.getEnabled(), "Table: ClearAllFilters button in toolbar disabled");
					var oSelectAllSelectionsButton = oTableToolbar.getContent()[5];
					assert.ok(!oSelectAllSelectionsButton.getVisible(), "Table: SelectAllSelections button in toolbar hided");
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					var oClearAllSelectionsButton = oTableToolbar.getContent()[6];
					assert.ok(!oClearAllSelectionsButton.getVisible(), "Table: ClearAllSelections button in toolbar hided");
					assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
					var oSelectionColumn = oTable.getColumns()[0];
					var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
					var oColumns = oTable.getColumns();
					assert.equal(oColumns.length, 8, "Table: column number is 8");
					assert.equal(oColumns[1].getLabel().getText(), "Key", "Table: column 'Key'");
					assert.equal(oColumns[2].getLabel().getText(), "Icon", "Table: column 'Icon'");
					assert.equal(oColumns[3].getLabel().getText(), "Text", "Table: column 'Text'");
					assert.equal(oColumns[4].getLabel().getText(), "URL Link", "Table: column 'URL Link'");
					assert.equal(oColumns[5].getLabel().getText(), "Editable", "Table: column 'Editable'");
					assert.equal(oColumns[6].getLabel().getText(), "Integer", "Table: column 'Integer'");
					assert.equal(oColumns[7].getLabel().getText(), "Number", "Table: column 'Number'");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange({
						rowIndex: 0,
						userInteraction: true
					});
					assert.equal(oTable.getSelectedIndices()[0], 0, "Table: SelectedIndices Value after table selection change");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false }}), "Field 1: DT Value not change after table selection change");
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
					oTable.setSelectedIndex(3);
					oTable.fireRowSelectionChange({
						rowIndex: 3,
						userInteraction: true
					});
					assert.equal(oTable.getSelectedIndices()[0], 3, "Table: SelectedIndices Value after table selection change again");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false }}), "Field 1: DT Value not change after table selection change again");
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
					oTable.setSelectedIndex(-1);
					oTable.fireRowSelectionChange({
						rowIndex: -1,
						userInteraction: true
					});
					assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value after remove table selection");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value after remove table selection");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false }}), "Field 1: Value not change after remove table selection");
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");

					oSelectAllSelectionsButton.firePress();
					assert.ok(!oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar disabled");
					assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
					assert.equal(oTable.getSelectedIndices().length, 8, "Table: Select All selections working");

					oClearAllSelectionsButton.firePress();
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: Clear All selections working");

					var oRow3 = oTable.getRows()[2];
					var oSelectionCell3 = oRow3.getCells()[0];
					assert.ok(oSelectionCell3.isA("sap.m.CheckBox"), "Row 3: Cell 1 is CheckBox");
					assert.ok(oSelectionCell3.getSelected(), "Row 3: Cell 1 is selected");

					var oRow1 = oTable.getRows()[0];
					var oSelectionCell1 = oRow1.getCells()[0];
					assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
					assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
					oSelectionCell1.setSelected(true);
					oSelectionCell1.fireSelect({
						selected: true
					});
					assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
					assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selecting");
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
					oSelectionCell1.setSelected(false);
					oSelectionCell1.fireSelect({
						selected: false
					});
					assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
					assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after deselecting");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value removed after deselecting");
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

					var oRow4 = oTable.getRows()[3];
					var oSelectionCell4 = oRow4.getCells()[0];
					assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
					assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
					oSelectionCell4.setSelected(true);
					oSelectionCell4.fireSelect({
						selected: true
					});
					assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
					assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
					assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
					assert.ok(deepEqual(cleanUUID(oField._getCurrentProperty("value")), { "text": "text04", "key": "key04", "url": "https://sap.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selecting again");
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");

					oRemoveValueButton.firePress();
					assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value removed after clicking remove value button");

					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					wait().then(function () {
						assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.equal(oLabel2.getText(), "Object properties defined: value from requested file", "Label 2: Has label text");
						assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(deepEqual(oField2._getCurrentProperty("value"), {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false, "_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"}}), "Field 2: Value");
						oTable = oField2.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 2: Control is Table");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 4, "Table: value length is 4");
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
						oSelectionColumn = oTable.getColumns()[0];
						oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
						assert.ok(deepEqual(oField2._getCurrentProperty("value"), {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false, "_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"}}), "Field 2: Value not change after table selection changed");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						oTable.setSelectedIndex(2);
						oTable.fireRowSelectionChange({
							rowIndex: 2,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === 2 && oTable.getSelectedIndices()[0] === 2, "Table: SelectedIndex and SelectedIndices Value after selection change again");
						assert.ok(deepEqual(oField2._getCurrentProperty("value"), {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false, "_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"}}), "Field 2: Value not change after table selection changed");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						oTable.setSelectedIndex(-1);
						oTable.fireRowSelectionChange({
							rowIndex: -1,
							userInteraction: true
						});
						assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove table selection");
						assert.ok(deepEqual(oField2._getCurrentProperty("value"), {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false, "_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"}}), "Field 2: Value not change after table selection changed");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");

						oRow4 = oTable.getRows()[3];
						oSelectionCell4 = oRow4.getCells()[0];
						assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
						assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected");
						wait().then(function () {
							assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
							assert.equal(oLabel3.getText(), "Object properties defined: value from OData Request", "Label 3: Has label text");
							assert.ok(oField3.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
							assert.ok(deepEqual(cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false}}), "Field 3: Value");
							oTable = oField3.getAggregation("_field");
							assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
							assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
							assert.equal(oTable.getBinding().getCount(), 6, "Table: value length is 6");
							assert.equal(oTable.getSelectedIndex(), -1, "Table: no selected row");
							oSelectionColumn = oTable.getColumns()[0];
							oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 0 && oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndices Value after table selection change");
							assert.ok(deepEqual(cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false}}), "Field 3: DT Value not change after table selection change");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === 3 && oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndices Value after table selection change again");
							assert.ok(deepEqual(cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false}}), "Field 3: DT Value not change after table selection change again");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
							oTable.setSelectedIndex(-1);
							oTable.fireRowSelectionChange({
								rowIndex: -1,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: SetectedIndex and SelectedIndices Value after remove table selection");
							assert.ok(deepEqual(cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false}}), "Field 3: DT Value not change after remove table selections");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");

							var oRow2 = oTable.getRows()[1];
							var oSelectionCell2 = oRow2.getCells()[0];
							assert.ok(oSelectionCell2.isA("sap.m.CheckBox"), "Row 2: Cell 1 is CheckBox");
							assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");

							var oRow1 = oTable.getRows()[0];
							var oSelectionCell1 = oRow1.getCells()[0];
							assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
							assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
							oSelectionCell1.setSelected(true);
							oSelectionCell1.fireSelect({
								selected: true
							});
							assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
							assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
							assert.ok(deepEqual(cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1", "_dt": {"_editable": false} }), "Field 3: DT Value not change after table selection change");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
							oSelectionCell1.setSelected(false);
							oSelectionCell1.fireSelect({
								selected: false
							});
							assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
							assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after deselecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
							assert.ok(!oField3._getCurrentProperty("value"), "Field 3: DT Value removed after deselecting");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

							var oRow4 = oTable.getRows()[3];
							var oSelectionCell4 = oRow4.getCells()[0];
							assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
							assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
							oSelectionCell4.setSelected(true);
							oSelectionCell4.fireSelect({
								selected: true
							});
							assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
							assert.equal(oTable.getSelectedIndex(), -1, "Table: SetectedIndex Value not change after selecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
							assert.ok(deepEqual(cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4", "_dt": {"_editable": false} }), "Field 3: DT Value not change after table selection change again");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
							oRemoveValueButton.firePress();
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
							assert.ok(!oField._getCurrentProperty("value"), "Field 3: DT Value removed after clicking remove value button");

							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("switch edit mode in popover for editable object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldsWithValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false}}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oValueInTable = {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_selected": true}};
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
					assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
					var oSelectionCell1 = oNewRow.getCells()[0];
					assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
					assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
					var oTableToolbar = oTable.getToolbar();
					var oAddButton = oTableToolbar.getContent()[1];
					assert.ok(oAddButton.getEnabled(), "Table: Add button in toolbar enabled");
					var oEditButton = oTableToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
					var oDeleteButton = oTableToolbar.getContent()[3];
					assert.ok(!oDeleteButton.getEnabled(), "Table: Delete button in toolbar disabled");
					var oClearFitlersButton = oTableToolbar.getContent()[4];
					assert.ok(!oClearFitlersButton.getEnabled(), "Table: ClearAllFilters button in toolbar disabled");
					var oSelectAllSelectionsButton = oTableToolbar.getContent()[5];
					assert.ok(!oSelectAllSelectionsButton.getVisible(), "Table: SelectAllSelections button in toolbar hided");
					assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
					var oClearAllSelectionsButton = oTableToolbar.getContent()[6];
					assert.ok(!oClearAllSelectionsButton.getVisible(), "Table: ClearAllSelections button in toolbar hided");
					assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
					oTable.setSelectedIndex(0);
					oTable.fireRowSelectionChange();
					assert.ok(oEditButton.getEnabled(), "Table: Edit button in toolbar enabled");
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
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.equal(oFormField.getValue(), "sap-icon://zoom-in", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "textnew", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.equal(oFormField.getValue(), "https://sap.com/04", "SimpleForm field4: Has value");
							oFormField.setValue("https://sap.com/06");
							oFormField.fireChange({ value: "https://sap.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
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
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
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
								assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oChangedObject), "SimpleForm field textArea: Has changed value");
								var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sap.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								oSwitchModeButton.firePress();
								wait().then(function () {
									oContents = oSimpleForm.getContent();
									oFormLabel = oContents[0];
									oFormField = oContents[1];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Label text");
									assert.equal(oFormField.getValue(), "key01 2", "SimpleForm field1: Value changed");
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Label text");
									assert.equal(oFormField.getValue(), "sap-icon://accept 2", "SimpleForm field2: Value changed");
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Label text");
									assert.equal(oFormField.getValue(), "text01 2", "SimpleForm field3: Value changed");
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Label text");
									assert.equal(oFormField.getValue(), "https://sap.com/06 2", "SimpleForm field4: Value changed");
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Label text");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Value changed");
									oFormLabel = oContents[10];
									oFormField = oContents[11];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
									assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Label text");
									assert.equal(oFormField.getValue(), "3", "SimpleForm field6: Value changed");
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Label text");
									assert.equal(oFormField.getValue(), "5.6", "SimpleForm field7: Value changed");
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.equal(oFormField.getValue(), sNewValue, "SimpleForm field5: Value changed");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("switch edit mode in popover for not editable object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldsWithValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false}}
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
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oValueInTable = {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_selected": true}};
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
					assert.ok(deepEqual(cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
					var oNewRow = oTable.getRows()[0];
					assert.ok(deepEqual(cleanUUID(oNewRow.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
					var oSelectionCell1 = oNewRow.getCells()[0];
					assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
					assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
					var oTableToolbar = oTable.getToolbar();
					var oEditButton = oTableToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
					var oRow = oTable.getRows()[1];
					assert.ok(deepEqual(cleanUUID(oRow.getBindingContext().getObject()), { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, "_dt": {"_editable": false}}), "Table: target row");
					oTable.setSelectedIndex(1);
					oTable.fireRowSelectionChange();
					assert.ok(oEditButton.getEnabled(), "Table: Edit button in toolbar enabled");
					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(!oCancelButtonInPopover.getVisible(), "Popover: cancel button not visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(oCloseButtonInPopover.getVisible(), "Popover: close button visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field1: Not Editable");
							assert.equal(oFormField.getValue(), "key01", "SimpleForm field1: Has value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field2: Not Editable");
							assert.equal(oFormField.getValue(), "sap-icon://accept", "SimpleForm field2: Has value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field3: Not Editable");
							assert.equal(oFormField.getValue(), "text01", "SimpleForm field3: Has value");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field4: Not Editable");
							assert.equal(oFormField.getValue(), "https://sap.com/06", "SimpleForm field4: Has value");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(!oFormField.getEnabled(), "SimpleForm Field5: Not Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field6: Not Editable");
							assert.equal(oFormField.getValue(), "1", "SimpleForm field6: Has value");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field7: Not Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field7: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field8: Not Editable");
							var oFormFieldObject = {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","iconcolor": "#031E48","int": 1,"_dt": {"_editable": false}};
							assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oFormFieldObject), "SimpleForm field textArea: Has the value");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field1: Not Editable");
								assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Label text");
								assert.equal(oFormField.getValue(), "key01", "SimpleForm field1: Value");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field2: Not Editable");
								assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Label text");
								assert.equal(oFormField.getValue(), "sap-icon://accept", "SimpleForm field2: Value");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field3: Not Editable");
								assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Label text");
								assert.equal(oFormField.getValue(), "text01", "SimpleForm field3: Value");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field4: Not Editable");
								assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Label text");
								assert.equal(oFormField.getValue(), "https://sap.com/06", "SimpleForm field4: Value");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								assert.ok(!oFormField.getEnabled(), "SimpleForm Field5: Not Enabled");
								assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Label text");
								assert.ok(!oFormField.getSelected(), "SimpleForm field5: Value");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field6: Not Editable");
								assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Label text");
								assert.equal(oFormField.getValue(), "1", "SimpleForm field6: Value");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field7: Not Editable");
								assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Label text");
								assert.equal(oFormField.getValue(), "", "SimpleForm field7: Value");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field8: Not Editable");
								assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oFormFieldObject), "SimpleForm field textArea: Has the value");
								oSwitchModeButton.firePress();
								wait().then(function () {
									oContents = oSimpleForm.getContent();
									oFormLabel = oContents[0];
									oFormField = oContents[1];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field1: Not Editable");
									assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Label text");
									assert.equal(oFormField.getValue(), "key01", "SimpleForm field1: Value");
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field2: Not Editable");
									assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Label text");
									assert.equal(oFormField.getValue(), "sap-icon://accept", "SimpleForm field2: Value");
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field3: Not Editable");
									assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Label text");
									assert.equal(oFormField.getValue(), "text01", "SimpleForm field3: Value");
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field4: Not Editable");
									assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Label text");
									assert.equal(oFormField.getValue(), "https://sap.com/06", "SimpleForm field4: Value");
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.ok(!oFormField.getEnabled(), "SimpleForm Field5: Not Enabled");
									assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Label text");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Value");
									oFormLabel = oContents[10];
									oFormField = oContents[11];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field6: Not Editable");
									assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Label text");
									assert.equal(oFormField.getValue(), "1", "SimpleForm field6: Value");
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field7: Not Editable");
									assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Label text");
									assert.equal(oFormField.getValue(), "", "SimpleForm field7: Value");
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field8: Not Editable");
									assert.ok(deepEqual(cleanUUID(oFormField.getValue()), oFormFieldObject), "SimpleForm field textArea: Has the value");
									resolve();
								});
							});
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
