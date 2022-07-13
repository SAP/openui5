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

	var oValue1 = { "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55 };
	var oValue2 = { "text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55 };
	var oValue3 = { "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "editable": true };
	var oValue4 = { "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "number": 3.55 };
	var oValue5 = { "text": "text05", "key": "key05", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5, "editable": true };
	var oValue6 = { "text": "text06", "key": "key06", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6, "number": 3.55 };
	var oValue7 = { "text": "text07", "key": "key07", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7, "editable": true };
	var oValue8 = { "text": "text08", "key": "key08", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8, "number": 3.55 };
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
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 9, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
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
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount length is 0");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected row hided");
						assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
						oTable.filter(oKeyColumn, "n*");
						assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering n*");
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
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
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
							var oTextColumn = oTable.getColumns()[3];
							oTable.filter(oTextColumn, "n");
							// check that the column menu filter input field was updated
							oMenu = oTextColumn.getMenu();
							// open and close the menu to let it generate its items
							oMenu.open();
							oMenu.close();
							wait().then(function () {
								assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
								assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount length is 0");
								assert.ok(oTextColumn.getFiltered(), "Table: Column Text is filtered");
								oTable.filter(oTextColumn, "*n");
								assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering *n");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
								oTable.filter(oTextColumn, "*0*");
								assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering *0*");
								wait().then(function () {
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
									oTable.filter(oTextColumn, "01");
									wait().then(function () {
										assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering 01");
										assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
										oTable.filter(oTextColumn, "");
										wait().then(function () {
											assert.ok(!oTextColumn.getFiltered(), "Table: Column Text is not filtered anymore");
											assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after removing all filters");
											assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
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
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 9, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
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
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
						oMenu = oIntColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("4");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
							assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering column Integer with '4'");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
							// open the column filter menu, input filter value, close the menu.
							oMenu.open();
							oMenu.getItems()[0].setValue(">4");
							oMenu.getItems()[0].fireSelect();
							oMenu.close();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 2, "Table: RowCount after filtering column Integer with '>4'");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");

								assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
								// clear all the filters
								oClearFilterButton.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after removing all the filters");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
									assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
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
