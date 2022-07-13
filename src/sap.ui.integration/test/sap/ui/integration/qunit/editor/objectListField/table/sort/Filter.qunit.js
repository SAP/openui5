/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../../ContextHost",
	"sap/base/util/deepEqual",
	"sap/ui/core/Core",
	"sap/base/util/deepClone",
	"sap/ui/core/util/MockServer",
	"sap/base/util/merge"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	Core,
	deepClone,
	MockServer,
	merge
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	var oValue1 = { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55 };
	var oValue2 = { "text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55 };
	var oValue3 = { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "editable": true };
	var oValue4 = { "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "number": 3.55 };
	var oValue5 = { "text": "text05", "key": "key05", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5, "editable": true };
	var oValue6 = { "text": "text06", "key": "key06", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6, "number": 3.55 };
	var oValue7 = { "text": "text07", "key": "key07", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7, "editable": true };
	var oValue8 = { "text": "text08", "key": "key08", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8, "number": 3.55 };
	var oDTSelected = {"_dt": {"_selected": true}};
	var oDefaultNewObject = {"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5};
	var oDefaultNewObjectSelected =  Object.assign(deepClone(oDefaultNewObject), oDTSelected);

	var oResponseData = {
		"Objects": [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]
	};
	var oDTNotEditable = {"_dt": {"_editable": false}};
	var oDTNotEditableAndSelected = merge(deepClone(oDTNotEditable), oDTSelected);
	var aObjectsParameterValue2 = [
		Object.assign(deepClone(oValue2), oDTNotEditable),
		Object.assign(deepClone(oValue3), oDTNotEditable),
		Object.assign(deepClone(oValue5), oDTNotEditable),
		Object.assign(deepClone(oValue7), oDTNotEditable),
		Object.assign(deepClone(oValue8), oDTNotEditable)
	];
	var oValue1InRequestValues = Object.assign(deepClone(oValue1), oDTNotEditable);
	var oValue3SelectedInRequestValues = Object.assign(deepClone(oValue3), oDTNotEditableAndSelected);
	var oValue4InRequestValues = Object.assign(deepClone(oValue4), oDTNotEditable);
	var oValue6InRequestValues = Object.assign(deepClone(oValue6), oDTNotEditable);
	var oValue8SelectedInRequestValues = Object.assign(deepClone(oValue8), oDTNotEditableAndSelected);

	var oManifestForObjectListFieldsWithRequestValues = {
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
						"value": aObjectsParameterValue2
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

	QUnit.module("request values", {
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
		QUnit.test("positions, move buttons", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithRequestValues
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: DT Value");
					wait().then(function () {
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[4];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
						var oMoveUpButton = oToolbar.getContent()[7];
						assert.ok(oMoveUpButton.getVisible(), "Table toolbar: move up button visible");
						assert.ok(!oMoveUpButton.getEnabled(), "Table toolbar: move up button not enabled");
						var oMoveDownButton = oToolbar.getContent()[8];
						assert.ok(oMoveDownButton.getVisible(), "Table toolbar: move down button visible");
						assert.ok(!oMoveDownButton.getEnabled(), "Table toolbar: move down button not enabled");
						var oURLColumn = oTable.getColumns()[4];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
							assert.ok(oTable.getBinding().getCount() === 5, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: Value not changed after filtering");

							var oRow1 = oTable.getRows()[0];
							var oValueOfRow1 = oRow1.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow1), oValue3SelectedInRequestValues), "Table: row 1");
							assert.ok(oValueOfRow1._dt._position === 2, "Table: row 1 position");
							var oRow2 = oTable.getRows()[1];
							var oValueOfRow2 = oRow2.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue8SelectedInRequestValues), "Table: row 2");
							assert.ok(oValueOfRow2._dt._position === 5, "Table: row 2 position");
							var oRow3 = oTable.getRows()[2];
							var oValueOfRow3 = oRow3.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow3), oValue1InRequestValues), "Table: row 3");
							assert.ok(oValueOfRow3._dt._position === 6, "Table: row 3 position");
							var oRow4 = oTable.getRows()[3];
							var oValueOfRow4 = oRow4.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow4), oValue4InRequestValues), "Table: row 4");
							assert.ok(oValueOfRow4._dt._position === 7, "Table: row 4 position");
							var oRow5 = oTable.getRows()[4];
							var oValueOfRow5 = oRow5.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow5), oValue6InRequestValues), "Table: row 5");
							assert.ok(oValueOfRow5._dt._position === 8, "Table: row 5 position");

							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oMoveUpButton.getEnabled(), "Table toolbar: move up button enabled");
							assert.ok(oMoveDownButton.getEnabled(), "Table toolbar: move down button enabled");

							oTable.setSelectedIndex(-1);
							oTable.fireRowSelectionChange({
								rowIndex: -1,
								userInteraction: true
							});
							assert.ok(!oMoveUpButton.getEnabled(), "Table toolbar: move up button not enabled");
							assert.ok(!oMoveDownButton.getEnabled(), "Table toolbar: move down button not enabled");

							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oMoveUpButton.getEnabled(), "Table toolbar: move up button enabled");
							assert.ok(oMoveDownButton.getEnabled(), "Table toolbar: move down button enabled");

							oTable.addSelectionInterval(3, 4);
							assert.ok(!oMoveUpButton.getEnabled(), "Table toolbar: move up button not enabled");
							assert.ok(!oMoveDownButton.getEnabled(), "Table toolbar: move down button not enabled");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("move selected 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithRequestValues
			});
			return new Promise(function (resolve, reject) {
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: DT Value");
					wait().then(function () {
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[4];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
						var oMoveUpButton = oToolbar.getContent()[7];
						assert.ok(oMoveUpButton.getVisible(), "Table toolbar: move up button visible");
						assert.ok(!oMoveUpButton.getEnabled(), "Table toolbar: move up button not enabled");
						var oMoveDownButton = oToolbar.getContent()[8];
						assert.ok(oMoveDownButton.getVisible(), "Table toolbar: move down button visible");
						assert.ok(!oMoveDownButton.getEnabled(), "Table toolbar: move down button not enabled");
						var oURLColumn = oTable.getColumns()[4];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							var oRow1 = oTable.getRows()[0];
							var oValueOfRow1 = oRow1.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow1), oValue3SelectedInRequestValues), "Table: row 1");
							assert.ok(oValueOfRow1._dt._position === 2, "Table: row 1 position");
							var oRow2 = oTable.getRows()[1];
							var oValueOfRow2 = oRow2.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue8SelectedInRequestValues), "Table: row 2");
							assert.ok(oValueOfRow2._dt._position === 5, "Table: row 2 position");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oMoveUpButton.getEnabled(), "Table toolbar: move up button enabled");
							assert.ok(oMoveDownButton.getEnabled(), "Table toolbar: move down button enabled");
							assert.ok(oTable.getSelectedIndex() === 0, "Table toolbar: selected index is 0");

							oMoveDownButton.firePress();
							wait().then(function () {
								assert.ok(oTable.getSelectedIndex() === 1, "Table toolbar: selected index is 1");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: Value");
								var oSettings = that.oEditor.getCurrentSettings();
								var oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
								assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), [
									Object.assign(deepClone(oValue2), oDTNotEditable),
									Object.assign(deepClone(oValue8), oDTNotEditable),
									Object.assign(deepClone(oValue5), oDTNotEditable),
									Object.assign(deepClone(oValue7), oDTNotEditable),
									Object.assign(deepClone(oValue3), oDTNotEditable)
								]), "Editor: Field 1 Value");

								oRow1 = oTable.getRows()[0];
								oValueOfRow1 = oRow1.getBindingContext().getObject();
								assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow1), oValue8SelectedInRequestValues), "Table: value 8 move up to row 1");
								assert.ok(oValueOfRow1._dt._position === 2, "Table: row 1 position");
								assert.ok(oField._getCurrentProperty("value")[4]._dt._position === 2, "Table: value 8 position");
								assert.ok(oFieldSettings[1]._dt._position === 2, "Editor: Field 1 value 8 position");

								oRow2 = oTable.getRows()[1];
								oValueOfRow2 = oRow2.getBindingContext().getObject();
								assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue3SelectedInRequestValues), "Table: value 3 move down to row 2");
								assert.ok(oValueOfRow2._dt._position === 5, "Table: row 2 position");
								assert.ok(oField._getCurrentProperty("value")[1]._dt._position === 5, "Table: value 3 position");
								assert.ok(oFieldSettings[4]._dt._position === 5, "Editor: Field 1 value 3 position");

								oMoveUpButton.firePress();
								wait().then(function () {
									assert.ok(oTable.getSelectedIndex() === 0, "Table toolbar: selected index is 0");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: Value");
									oSettings = that.oEditor.getCurrentSettings();
									oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
									assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), aObjectsParameterValue2), "Editor: Field 1 Value");

									oRow1 = oTable.getRows()[0];
									oValueOfRow1 = oRow1.getBindingContext().getObject();
									assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow1), oValue3SelectedInRequestValues), "Table: value 3 move up to row 1");
									assert.ok(oValueOfRow1._dt._position === 2, "Table: row 1 position");
									assert.ok(oField._getCurrentProperty("value")[1]._dt._position === 2, "Table: value 3 position");
									assert.ok(oFieldSettings[1]._dt._position === 2, "Editor: Field 1 value 3 position");

									oRow2 = oTable.getRows()[1];
									oValueOfRow2 = oRow2.getBindingContext().getObject();
									assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue8SelectedInRequestValues), "Table: value 8 move down to row 2");
									assert.ok(oValueOfRow2._dt._position === 5, "Table: row 2 position");
									assert.ok(oField._getCurrentProperty("value")[4]._dt._position === 5, "Table: value 8 position");
									assert.ok(oFieldSettings[4]._dt._position === 5, "Editor: Field 1 value 8 position");

									oMoveUpButton.firePress();
									wait().then(function () {
										assert.ok(oTable.getSelectedIndex() === 0, "Table toolbar: selected index is 0");
										assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: Value");
										oSettings = that.oEditor.getCurrentSettings();
										oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
										assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), aObjectsParameterValue2), "Editor: Field 1 Value");

										oRow1 = oTable.getRows()[0];
										oValueOfRow1 = oRow1.getBindingContext().getObject();
										assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow1), oValue3SelectedInRequestValues), "Table: value 3 not move");
										assert.ok(oValueOfRow1._dt._position === 2, "Table: row 1 position");
										assert.ok(oField._getCurrentProperty("value")[1]._dt._position === 2, "Table: value 3 position");
										assert.ok(oFieldSettings[1]._dt._position === 2, "Editor: Field 1 value 3 position");

										oRow2 = oTable.getRows()[1];
										oValueOfRow2 = oRow2.getBindingContext().getObject();
										assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue8SelectedInRequestValues), "Table: value 8 not move");
										assert.ok(oValueOfRow2._dt._position === 5, "Table: row 2 position");
										assert.ok(oField._getCurrentProperty("value")[4]._dt._position === 5, "Table: value 8 position");
										assert.ok(oFieldSettings[4]._dt._position === 5, "Editor: Field 1 value 8 position");
										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("move selected 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithRequestValues
			});
			return new Promise(function (resolve, reject) {
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: DT Value");
					wait().then(function () {
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[4];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
						var oMoveUpButton = oToolbar.getContent()[7];
						assert.ok(oMoveUpButton.getVisible(), "Table toolbar: move up button visible");
						assert.ok(!oMoveUpButton.getEnabled(), "Table toolbar: move up button not enabled");
						var oMoveDownButton = oToolbar.getContent()[8];
						assert.ok(oMoveDownButton.getVisible(), "Table toolbar: move down button visible");
						assert.ok(!oMoveDownButton.getEnabled(), "Table toolbar: move down button not enabled");
						var oURLColumn = oTable.getColumns()[4];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							var oRow2 = oTable.getRows()[1];
							var oValueOfRow2 = oRow2.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue8SelectedInRequestValues), "Table: row 2");
							assert.ok(oValueOfRow2._dt._position === 5, "Table: row 2 position");
							var oRow3 = oTable.getRows()[2];
							var oValueOfRow3 = oRow3.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow3), oValue1InRequestValues), "Table: row 3");
							assert.ok(oValueOfRow3._dt._position === 6, "Table: row 3 position");
							oTable.setSelectedIndex(1);
							oTable.fireRowSelectionChange({
								rowIndex: 1,
								userInteraction: true
							});
							assert.ok(oMoveUpButton.getEnabled(), "Table toolbar: move up button enabled");
							assert.ok(oMoveDownButton.getEnabled(), "Table toolbar: move down button enabled");
							assert.ok(oTable.getSelectedIndex() === 1, "Table toolbar: selected index is 1");

							oMoveDownButton.firePress();
							wait().then(function () {
								assert.ok(oTable.getSelectedIndex() === 2, "Table toolbar: selected index is 2");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: Value");
								var oSettings = that.oEditor.getCurrentSettings();
								var oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
								assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), aObjectsParameterValue2), "Editor: Field 1 Value");

								oRow2 = oTable.getRows()[1];
								oValueOfRow2 = oRow2.getBindingContext().getObject();
								assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue1InRequestValues), "Table: value 1 move up to row 2");
								assert.ok(oValueOfRow2._dt._position === 5, "Table: row 2 position");

								oRow3 = oTable.getRows()[2];
								oValueOfRow3 = oRow3.getBindingContext().getObject();
								assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow3), oValue8SelectedInRequestValues), "Table: value 8 move down to row 3");
								assert.ok(oValueOfRow3._dt._position === 6, "Table: row 3 position");
								assert.ok(oField._getCurrentProperty("value")[4]._dt._position === 6, "Table: value 8 position");
								assert.ok(oFieldSettings[4]._dt._position === 5, "Editor: Field 1 value 8 position");

								oMoveUpButton.firePress();
								wait().then(function () {
									assert.ok(oTable.getSelectedIndex() === 1, "Table toolbar: selected index is 1");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: Value");
									oSettings = that.oEditor.getCurrentSettings();
									oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
									assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), aObjectsParameterValue2), "Editor: Field 1 Value");

									oRow2 = oTable.getRows()[1];
									oValueOfRow2 = oRow2.getBindingContext().getObject();
									assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue8SelectedInRequestValues), "Table: value 8 move up to row 2");
									assert.ok(oValueOfRow2._dt._position === 5, "Table: row 2 position");
									assert.ok(oField._getCurrentProperty("value")[4]._dt._position === 5, "Table: value 8 position");
									assert.ok(oFieldSettings[4]._dt._position === 5, "Editor: Field 1 value 8 position");

									var oRow3 = oTable.getRows()[2];
									var oValueOfRow3 = oRow3.getBindingContext().getObject();
									assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow3), oValue1InRequestValues), "Table: row 3");
									assert.ok(oValueOfRow3._dt._position === 6, "Table: row 3 position");

									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("move unselected 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithRequestValues
			});
			return new Promise(function (resolve, reject) {
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: DT Value");
					wait().then(function () {
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[4];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
						var oMoveUpButton = oToolbar.getContent()[7];
						assert.ok(oMoveUpButton.getVisible(), "Table toolbar: move up button visible");
						assert.ok(!oMoveUpButton.getEnabled(), "Table toolbar: move up button not enabled");
						var oMoveDownButton = oToolbar.getContent()[8];
						assert.ok(oMoveDownButton.getVisible(), "Table toolbar: move down button visible");
						assert.ok(!oMoveDownButton.getEnabled(), "Table toolbar: move down button not enabled");
						var oURLColumn = oTable.getColumns()[4];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							var oRow2 = oTable.getRows()[1];
							var oValueOfRow2 = oRow2.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue8SelectedInRequestValues), "Table: row 2");
							assert.ok(oValueOfRow2._dt._position === 5, "Table: row 2 position");
							var oRow3 = oTable.getRows()[2];
							var oValueOfRow3 = oRow3.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow3), oValue1InRequestValues), "Table: row 3");
							assert.ok(oValueOfRow3._dt._position === 6, "Table: row 3 position");
							oTable.setSelectedIndex(2);
							oTable.fireRowSelectionChange({
								rowIndex: 2,
								userInteraction: true
							});
							assert.ok(oMoveUpButton.getEnabled(), "Table toolbar: move up button enabled");
							assert.ok(oMoveDownButton.getEnabled(), "Table toolbar: move down button enabled");
							assert.ok(oTable.getSelectedIndex() === 2, "Table toolbar: selected index is 2");

							oMoveUpButton.firePress();
							wait().then(function () {
								assert.ok(oTable.getSelectedIndex() === 1, "Table toolbar: selected index is 1");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: Value");
								var oSettings = that.oEditor.getCurrentSettings();
								var oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
								assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), aObjectsParameterValue2), "Editor: Field 1 Value");

								oRow2 = oTable.getRows()[1];
								oValueOfRow2 = oRow2.getBindingContext().getObject();
								assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue1InRequestValues), "Table: value 1 move up to row 2");
								assert.ok(oValueOfRow2._dt._position === 5, "Table: row 2 position");

								oRow3 = oTable.getRows()[2];
								oValueOfRow3 = oRow3.getBindingContext().getObject();
								assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow3), oValue8SelectedInRequestValues), "Table: value 8 move down to row 3");
								assert.ok(oValueOfRow3._dt._position === 6, "Table: row 3 position");
								assert.ok(oField._getCurrentProperty("value")[4]._dt._position === 6, "Table: value 8 position");
								assert.ok(oFieldSettings[4]._dt._position === 5, "Editor: Field 1 value 8 position");

								oMoveDownButton.firePress();
								wait().then(function () {
									assert.ok(oTable.getSelectedIndex() === 2, "Table toolbar: selected index is 2");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: Value");
									oSettings = that.oEditor.getCurrentSettings();
									oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
									assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), aObjectsParameterValue2), "Editor: Field 1 Value");

									oRow2 = oTable.getRows()[1];
									oValueOfRow2 = oRow2.getBindingContext().getObject();
									assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue8SelectedInRequestValues), "Table: value 8 move up to row 2");
									assert.ok(oValueOfRow2._dt._position === 5, "Table: row 2 position");
									assert.ok(oField._getCurrentProperty("value")[4]._dt._position === 5, "Table: value 8 position");
									assert.ok(oFieldSettings[4]._dt._position === 5, "Editor: Field 1 value 8 position");

									var oRow3 = oTable.getRows()[2];
									var oValueOfRow3 = oRow3.getBindingContext().getObject();
									assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow3), oValue1InRequestValues), "Table: row 3");
									assert.ok(oValueOfRow3._dt._position === 6, "Table: row 3 position");

									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("move unselected 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithRequestValues
			});
			return new Promise(function (resolve, reject) {
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: DT Value");
					wait().then(function () {
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[4];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
						var oMoveUpButton = oToolbar.getContent()[7];
						assert.ok(oMoveUpButton.getVisible(), "Table toolbar: move up button visible");
						assert.ok(!oMoveUpButton.getEnabled(), "Table toolbar: move up button not enabled");
						var oMoveDownButton = oToolbar.getContent()[8];
						assert.ok(oMoveDownButton.getVisible(), "Table toolbar: move down button visible");
						assert.ok(!oMoveDownButton.getEnabled(), "Table toolbar: move down button not enabled");
						var oURLColumn = oTable.getColumns()[4];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							var oRow3 = oTable.getRows()[2];
							var oValueOfRow3 = oRow3.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow3), oValue1InRequestValues), "Table: row 3");
							assert.ok(oValueOfRow3._dt._position === 6, "Table: row 3 position");
							var oRow4 = oTable.getRows()[3];
							var oValueOfRow4 = oRow4.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow4), oValue4InRequestValues), "Table: row 4");
							assert.ok(oValueOfRow4._dt._position === 7, "Table: row 4 position");
							oTable.setSelectedIndex(2);
							oTable.fireRowSelectionChange({
								rowIndex: 2,
								userInteraction: true
							});
							assert.ok(oMoveUpButton.getEnabled(), "Table toolbar: move up button enabled");
							assert.ok(oMoveDownButton.getEnabled(), "Table toolbar: move down button enabled");
							assert.ok(oTable.getSelectedIndex() === 2, "Table toolbar: selected index is 2");

							oMoveDownButton.firePress();
							wait().then(function () {
								assert.ok(oTable.getSelectedIndex() === 3, "Table toolbar: selected index is 3");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: Value");
								var oSettings = that.oEditor.getCurrentSettings();
								var oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
								assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), aObjectsParameterValue2), "Editor: Field 1 Value");

								oRow3 = oTable.getRows()[2];
								oValueOfRow3 = oRow3.getBindingContext().getObject();
								assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow3), oValue4InRequestValues), "Table: value 4 move up to row 3");
								assert.ok(oValueOfRow3._dt._position === 6, "Table: row 3 position");

								oRow4 = oTable.getRows()[3];
								oValueOfRow4 = oRow4.getBindingContext().getObject();
								assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow4), oValue1InRequestValues), "Table: value 1 move down to row 4");
								assert.ok(oValueOfRow4._dt._position === 7, "Table: row 4 position");

								oMoveUpButton.firePress();
								wait().then(function () {
									assert.ok(oTable.getSelectedIndex() === 2, "Table toolbar: selected index is 2");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: Value");
									oSettings = that.oEditor.getCurrentSettings();
									oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
									assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), aObjectsParameterValue2), "Editor: Field 1 Value");

									oRow3 = oTable.getRows()[2];
									oValueOfRow3 = oRow3.getBindingContext().getObject();
									assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow3), oValue1InRequestValues), "Table: value 1 move up to row 3");
									assert.ok(oValueOfRow3._dt._position === 6, "Table: row 3 position");

									oRow4 = oTable.getRows()[3];
									oValueOfRow4 = oRow4.getBindingContext().getObject();
									assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow4), oValue4InRequestValues), "Table: value 4 move down to row 4");
									assert.ok(oValueOfRow4._dt._position === 7, "Table: row 4 position");

									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("add and delete", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithRequestValues
			});
			return new Promise(function (resolve, reject) {
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					var oDeleteButton = oToolbar.getContent()[3];
					assert.ok(!oDeleteButton.getEnabled(), "Table toolbar: delete button disabled");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						wait().then(function () {
							var oURLColumn = oTable.getColumns()[4];
							var oMenu = oURLColumn.getMenu();
							// open the column filter menu, input filter value, close the menu.
							oMenu.open();
							oMenu.getItems()[0].setValue("https");
							oMenu.getItems()[0].fireSelect();
							oMenu.close();
							wait().then(function () {
								assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
								assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
								assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
								assert.ok(oTable.getBinding().getCount() === 5, "Table: value length is 5");
								var oColumns = oTable.getColumns();
								assert.ok(oColumns.length === 8, "Table: column number is 8");
								var oSelectionColumn = oColumns[0];
								var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
								assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column");
								oAddButton.firePress();
								wait().then(function () {
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.ok(oContents.length === 16, "SimpleForm: length");
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
										assert.ok(oTable.getBinding().getCount() === 6, "Table: value length is 6");
										assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[5].getObject()), oDefaultNewObjectSelected), "Table: new row data");
										assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue2.concat([oDefaultNewObject])), "Field 1: Value changed");
										assert.ok(oField._getCurrentProperty("value")[5]._dt._position === 9, "Table: added value position");
										var oSettings = that.oEditor.getCurrentSettings();
										var oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
										assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), aObjectsParameterValue2.concat([oDefaultNewObject])), "Editor: Field 1 Value");
										assert.ok(oFieldSettings[5]._dt._position === 6, "Editor: Field 1 value 6 position");

										// scroll to the bottom
										oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
										wait().then(function () {
											var oNewRow = oTable.getRows()[4];
											var oNewValue = oNewRow.getBindingContext().getObject();
											assert.ok(deepEqual(cleanUUIDAndPosition(oNewValue), oDefaultNewObjectSelected), "Table: new row in the bottom");
											assert.ok(oNewValue._dt._position === 9, "Table: new row position");

											// delete
											oTable.setSelectedIndex(5);
											oTable.fireRowSelectionChange({
												rowIndex: 5,
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
													var aFieldValue = oField._getCurrentProperty("value");
													assert.ok(deepEqual(cleanUUIDAndPosition(aFieldValue), aObjectsParameterValue2), "Field 1: Value updated");
													var oSettings = that.oEditor.getCurrentSettings();
													var oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
													assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), aObjectsParameterValue2), "Editor: Field 1 Value");
													resolve();
												});
											});
										});
									});
								});
							});
						});
					};
				});
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
