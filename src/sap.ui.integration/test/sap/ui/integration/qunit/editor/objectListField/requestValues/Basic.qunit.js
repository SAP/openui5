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
	"sap/ui/core/Core"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	deepClone,
	MockServer,
	Core
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
	var oValue1Ori = {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#E69A17", "int": 1 , "editable": true, "number": 3.55};
	var oValue2Ori = {"text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55};
	var oValue3Ori = {"text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "editable": true};
	var oValue4Ori = {"text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "number": 3.55};
	var oValue5Ori = {"text": "text05", "key": "key05", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5, "editable": true};
	var oValue6Ori = {"text": "text06", "key": "key06", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6, "number": 3.55};
	var oValue7Ori = {"text": "text07", "key": "key07", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7, "editable": true};
	var oValue8Ori = {"text": "text08", "key": "key08", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8, "number": 3.55};

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

	QUnit.module("basic", {
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
		},
		after: function () {
			this.oMockServer.destroy();
		},
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
						"designtime": "designtime/objectListWithRequestValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectListWithRequestValues": {}
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
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === oResponseData.Objects.length, "Table: value length is " + oResponseData.Objects.length);
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUIDAndPosition(oRow1.getBindingContext().getObject()), Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}})), "Row 1: value");
						var oSelectionCell1 = oRow1.getCells()[0];
						assert.ok(oSelectionCell1.getVisible(), "Row 1: cell1 selection checkbox Visible");
						assert.ok(oSelectionCell1.getEnabled(), "Row 1: cell1 selection checkbox Enabled");
						assert.ok(!oSelectionCell1.getSelected(), "Row 1: cell1 selection checkbox not selected");

						var oRow2 = oTable.getRows()[1];
						assert.ok(deepEqual(cleanUUIDAndPosition(oRow2.getBindingContext().getObject()), Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}})), "Row 2: value");
						var oSelectionCell2 = oRow2.getCells()[0];
						assert.ok(oSelectionCell2.getVisible(), "Row 2: cell1 selection checkbox Visible");
						assert.ok(oSelectionCell2.getEnabled(), "Row 2: cell1 selection checkbox Enabled");
						assert.ok(!oSelectionCell2.getSelected(), "Row 2: cell1 selection checkbox not selected");

						var oRow3 = oTable.getRows()[2];
						assert.ok(deepEqual(cleanUUIDAndPosition(oRow3.getBindingContext().getObject()), Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}})), "Row 3: value");
						var oSelectionCell3 = oRow3.getCells()[0];
						assert.ok(oSelectionCell3.getVisible(), "Row 3: cell1 selection checkbox Visible");
						assert.ok(oSelectionCell3.getEnabled(), "Row 3: cell1 selection checkbox Enabled");
						assert.ok(!oSelectionCell3.getSelected(), "Row 3: cell1 selection checkbox not selected");

						var oRow4 = oTable.getRows()[3];
						assert.ok(deepEqual(cleanUUIDAndPosition(oRow4.getBindingContext().getObject()), Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}})), "Row 4: value");
						var oSelectionCell4 = oRow4.getCells()[0];
						assert.ok(oSelectionCell4.getVisible(), "Row 4: cell1 selection checkbox Visible");
						assert.ok(oSelectionCell4.getEnabled(), "Row 4: cell1 selection checkbox Enabled");
						assert.ok(!oSelectionCell4.getSelected(), "Row 4: cell1 selection checkbox not selected");

						var oRow5 = oTable.getRows()[4];
						assert.ok(deepEqual(cleanUUIDAndPosition(oRow5.getBindingContext().getObject()), Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}})), "Row 5: value");
						var oSelectionCell5 = oRow5.getCells()[0];
						assert.ok(oSelectionCell5.getVisible(), "Row 5: cell1 selection checkbox Visible");
						assert.ok(oSelectionCell5.getEnabled(), "Row 5: cell1 selection checkbox Enabled");
						assert.ok(!oSelectionCell5.getSelected(), "Row 5: cell1 selection checkbox not selected");

						oAddButton.firePress();
						wait().then(function () {
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
								// scroll to bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
								wait().then(function () {
									var oRow6 = oTable.getRows()[2];
									assert.ok(deepEqual(cleanUUIDAndPosition(oRow6.getBindingContext().getObject()), Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}})), "Row 6: value");
									var oSelectionCell6 = oRow6.getCells()[0];
									assert.ok(oSelectionCell6.getVisible(), "Row 6: cell1 selection checkbox Visible");
									assert.ok(oSelectionCell6.getEnabled(), "Row 6: cell1 selection checkbox Enabled");
									assert.ok(!oSelectionCell6.getSelected(), "Row 6: cell1 selection checkbox not selected");

									var oRow7 = oTable.getRows()[3];
									assert.ok(deepEqual(cleanUUIDAndPosition(oRow7.getBindingContext().getObject()), Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}})), "Row 7: value");
									var oSelectionCell7 = oRow7.getCells()[0];
									assert.ok(oSelectionCell7.getVisible(), "Row 7: cell1 selection checkbox Visible");
									assert.ok(oSelectionCell7.getEnabled(), "Row 7: cell1 selection checkbox Enabled");
									assert.ok(!oSelectionCell7.getSelected(), "Row 7: cell1 selection checkbox not selected");

									var oRow8 = oTable.getRows()[4];
									assert.ok(deepEqual(cleanUUIDAndPosition(oRow8.getBindingContext().getObject()), Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})), "Row 8: value");
									var oSelectionCell8 = oRow8.getCells()[0];
									assert.ok(oSelectionCell8.getVisible(), "Row 8: cell1 selection checkbox Visible");
									assert.ok(oSelectionCell8.getEnabled(), "Row 8: cell1 selection checkbox Enabled");
									assert.ok(!oSelectionCell8.getSelected(), "Row 8: cell1 selection checkbox not selected");

									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("all values selected as value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
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
									"value": [
										Object.assign(deepClone(oValue1Ori), {"_editable": false}),
										Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue4Ori), {"_editable": false}),
										Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue6Ori), {"_editable": false}),
										Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
									]
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
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
						Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
					]), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === oResponseData.Objects.length, "Table: value length is " + oResponseData.Objects.length);
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column selected");

						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUIDAndPosition(oRow1.getBindingContext().getObject()), Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false, "_selected": true}})), "Row 1: value");
						var oSelectionCell1 = oRow1.getCells()[0];
						assert.ok(oSelectionCell1.getVisible(), "Row 1: cell1 selection checkbox Visible");
						assert.ok(oSelectionCell1.getEnabled(), "Row 1: cell1 selection checkbox Enabled");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: cell1 selection checkbox selected");

						var oRow2 = oTable.getRows()[1];
						assert.ok(deepEqual(cleanUUIDAndPosition(oRow2.getBindingContext().getObject()), Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false, "_selected": true}})), "Row 2: value");
						var oSelectionCell2 = oRow2.getCells()[0];
						assert.ok(oSelectionCell2.getVisible(), "Row 2: cell1 selection checkbox Visible");
						assert.ok(oSelectionCell2.getEnabled(), "Row 2: cell1 selection checkbox Enabled");
						assert.ok(oSelectionCell2.getSelected(), "Row 2: cell1 selection checkbox selected");

						var oRow3 = oTable.getRows()[2];
						assert.ok(deepEqual(cleanUUIDAndPosition(oRow3.getBindingContext().getObject()), Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false, "_selected": true}})), "Row 3: value");
						var oSelectionCell3 = oRow3.getCells()[0];
						assert.ok(oSelectionCell3.getVisible(), "Row 3: cell1 selection checkbox Visible");
						assert.ok(oSelectionCell3.getEnabled(), "Row 3: cell1 selection checkbox Enabled");
						assert.ok(oSelectionCell3.getSelected(), "Row 3: cell1 selection checkbox selected");

						var oRow4 = oTable.getRows()[3];
						assert.ok(deepEqual(cleanUUIDAndPosition(oRow4.getBindingContext().getObject()), Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false, "_selected": true}})), "Row 4: value");
						var oSelectionCell4 = oRow4.getCells()[0];
						assert.ok(oSelectionCell4.getVisible(), "Row 4: cell1 selection checkbox Visible");
						assert.ok(oSelectionCell4.getEnabled(), "Row 4: cell1 selection checkbox Enabled");
						assert.ok(oSelectionCell4.getSelected(), "Row 4: cell1 selection checkbox selected");

						var oRow5 = oTable.getRows()[4];
						assert.ok(deepEqual(cleanUUIDAndPosition(oRow5.getBindingContext().getObject()), Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false, "_selected": true}})), "Row 5: value");
						var oSelectionCell5 = oRow5.getCells()[0];
						assert.ok(oSelectionCell5.getVisible(), "Row 5: cell1 selection checkbox Visible");
						assert.ok(oSelectionCell5.getEnabled(), "Row 5: cell1 selection checkbox Enabled");
						assert.ok(oSelectionCell5.getSelected(), "Row 5: cell1 selection checkbox selected");

						oAddButton.firePress();
						wait().then(function () {
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
								// scroll to bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
								wait().then(function () {
									var oRow6 = oTable.getRows()[2];
									assert.ok(deepEqual(cleanUUIDAndPosition(oRow6.getBindingContext().getObject()), Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false, "_selected": true}})), "Row 6: value");
									var oSelectionCell6 = oRow6.getCells()[0];
									assert.ok(oSelectionCell6.getVisible(), "Row 6: cell1 selection checkbox Visible");
									assert.ok(oSelectionCell6.getEnabled(), "Row 6: cell1 selection checkbox Enabled");
									assert.ok(oSelectionCell6.getSelected(), "Row 6: cell1 selection checkbox selected");

									var oRow7 = oTable.getRows()[3];
									assert.ok(deepEqual(cleanUUIDAndPosition(oRow7.getBindingContext().getObject()), Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false, "_selected": true}})), "Row 7: value");
									var oSelectionCell7 = oRow7.getCells()[0];
									assert.ok(oSelectionCell7.getVisible(), "Row 7: cell1 selection checkbox Visible");
									assert.ok(oSelectionCell7.getEnabled(), "Row 7: cell1 selection checkbox Enabled");
									assert.ok(oSelectionCell7.getSelected(), "Row 7: cell1 selection checkbox selected");

									var oRow8 = oTable.getRows()[4];
									assert.ok(deepEqual(cleanUUIDAndPosition(oRow8.getBindingContext().getObject()), Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false, "_selected": true}})), "Row 8: value");
									var oSelectionCell8 = oRow8.getCells()[0];
									assert.ok(oSelectionCell8.getVisible(), "Row 8: cell1 selection checkbox Visible");
									assert.ok(oSelectionCell8.getEnabled(), "Row 8: cell1 selection checkbox Enabled");
									assert.ok(oSelectionCell8.getSelected(), "Row 8: cell1 selection checkbox selected");

									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("select and deselectAll", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithRequestValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectListWithRequestValues": {}
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
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === oResponseData.Objects.length, "Table: value length is " + oResponseData.Objects.length);
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

						var oSelectionCell1 = oTable.getRows()[0].getCells()[0];
						oSelectionCell1.setSelected(true);
						oSelectionCell1.fireSelect({ selected: true });
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
							Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}})
						]), "Field 1: Value after selecting row1");

						var oSelectionCell2 = oTable.getRows()[1].getCells()[0];
						oSelectionCell2.setSelected(true);
						oSelectionCell2.fireSelect({ selected: true });
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
							Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}})
						]), "Field 1: Value after selecting row2");

						var oSelectionCell3 = oTable.getRows()[2].getCells()[0];
						oSelectionCell3.setSelected(true);
						oSelectionCell3.fireSelect({ selected: true });
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
							Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}})
						]), "Field 1: Value after selecting row3");

						var oSelectionCell4 = oTable.getRows()[3].getCells()[0];
						oSelectionCell4.setSelected(true);
						oSelectionCell4.fireSelect({ selected: true });
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
							Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}})
						]), "Field 1: Value after selecting row4");

						var oSelectionCell5 = oTable.getRows()[4].getCells()[0];
						oSelectionCell5.setSelected(true);
						oSelectionCell5.fireSelect({ selected: true });
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
							Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}})
						]), "Field 1: Value after selecting row5");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

						oAddButton.firePress();
						wait().then(function () {
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
								// scroll to bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
								wait().then(function () {
									var oSelectionCell6 = oTable.getRows()[2].getCells()[0];
									oSelectionCell6.setSelected(true);
									oSelectionCell6.fireSelect({ selected: true });
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
										Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}})
									]), "Field 1: Value after selecting row6");

									var oSelectionCell7 = oTable.getRows()[3].getCells()[0];
									oSelectionCell7.setSelected(true);
									oSelectionCell7.fireSelect({ selected: true });
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
										Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}})
									]), "Field 1: Value after selecting row7");
									assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

									var oSelectionCell8 = oTable.getRows()[4].getCells()[0];
									oSelectionCell8.setSelected(true);
									oSelectionCell8.fireSelect({ selected: true });
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
										Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
									]), "Field 1: Value after selecting row8");
									assert.ok(oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column selected");

									oSelectOrUnSelectAllButton.setSelected(false);
									oSelectOrUnSelectAllButton.fireSelect({ selected: false });
									assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value after deselectAll");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("deselect and selectAll", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
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
									"value": [
										Object.assign(deepClone(oValue1Ori), {"_editable": false}),
										Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue4Ori), {"_editable": false}),
										Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue6Ori), {"_editable": false}),
										Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
									]
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
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
						Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
						Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
					]), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === oResponseData.Objects.length, "Table: value length is " + oResponseData.Objects.length);
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column selected");

						var oSelectionCell1 = oTable.getRows()[0].getCells()[0];
						oSelectionCell1.setSelected(false);
						oSelectionCell1.fireSelect({ selected: false });
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
							Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
						]), "Field 1: Value after deselecting row1");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column unselected");

						var oSelectionCell2 = oTable.getRows()[1].getCells()[0];
						oSelectionCell2.setSelected(false);
						oSelectionCell2.fireSelect({ selected: false });
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
							Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
						]), "Field 1: Value after deselecting row2");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column unselected");

						var oSelectionCell3 = oTable.getRows()[2].getCells()[0];
						oSelectionCell3.setSelected(false);
						oSelectionCell3.fireSelect({ selected: false });
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
							Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
						]), "Field 1: Value after deselecting row3");

						var oSelectionCell4 = oTable.getRows()[3].getCells()[0];
						oSelectionCell4.setSelected(false);
						oSelectionCell4.fireSelect({ selected: false });
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
							Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
						]), "Field 1: Value after deselecting row4");

						var oSelectionCell5 = oTable.getRows()[4].getCells()[0];
						oSelectionCell5.setSelected(false);
						oSelectionCell5.fireSelect({ selected: false });
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
							Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
							Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
						]), "Field 1: Value after deselecting row5");

						oAddButton.firePress();
						wait().then(function () {
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
								// scroll to bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
								wait().then(function () {
									var oSelectionCell6 = oTable.getRows()[2].getCells()[0];
									oSelectionCell6.setSelected(false);
									oSelectionCell6.fireSelect({ selected: false });
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
										Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
									]), "Field 1: Value after deselecting row6");

									var oSelectionCell7 = oTable.getRows()[3].getCells()[0];
									oSelectionCell7.setSelected(false);
									oSelectionCell7.fireSelect({ selected: false });
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
										Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
									]), "Field 1: Value after deselecting row7");

									var oSelectionCell8 = oTable.getRows()[4].getCells()[0];
									oSelectionCell8.setSelected(false);
									oSelectionCell8.fireSelect({ selected: false });
									assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value after deselecting row8");
									assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column unselected");

									oSelectOrUnSelectAllButton.setSelected(true);
									oSelectOrUnSelectAllButton.fireSelect({ selected: true });
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
										Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue2Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue4Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue6Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
									]), "Field 1: Value after selectAll");
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
