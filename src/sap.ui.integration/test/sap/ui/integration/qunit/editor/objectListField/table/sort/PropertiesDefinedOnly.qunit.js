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
	var oDTSelected = {"_dt": {"_selected": true}};
	var oValue1Selected = Object.assign(deepClone(oValue1), oDTSelected);
	var oValue2Selected = Object.assign(deepClone(oValue2), oDTSelected);
	var oValue3Selected = Object.assign(deepClone(oValue3), oDTSelected);
	var oValue4Selected = Object.assign(deepClone(oValue4), oDTSelected);
	var oValue5Selected = Object.assign(deepClone(oValue5), oDTSelected);
	var oValue6Selected = Object.assign(deepClone(oValue6), oDTSelected);
	var oValue7Selected = Object.assign(deepClone(oValue7), oDTSelected);
	var oValue8Selected = Object.assign(deepClone(oValue8), oDTSelected);
	var oDefaultNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
	var oDefaultNewObjectSelected =  Object.assign(deepClone(oDefaultNewObject), oDTSelected);
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

	QUnit.module("properties defined only", {
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
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
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
					wait().then(function () {
						var oRow1 = oTable.getRows()[0];
						var oValueOfRow1 = oRow1.getBindingContext().getObject();
						assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow1), oValue1Selected), "Table: row 1");
						assert.equal(oValueOfRow1._dt._position, 1, "Table: row 1 position");
						var oRow2 = oTable.getRows()[1];
						var oValueOfRow2 = oRow2.getBindingContext().getObject();
						assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue2Selected), "Table: row 2");
						assert.equal(oValueOfRow2._dt._position, 2, "Table: row 2 position");
						var oRow3 = oTable.getRows()[2];
						var oValueOfRow3 = oRow3.getBindingContext().getObject();
						assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow3), oValue3Selected), "Table: row 3");
						assert.equal(oValueOfRow3._dt._position, 3, "Table: row 3 position");
						var oRow4 = oTable.getRows()[3];
						var oValueOfRow4 = oRow4.getBindingContext().getObject();
						assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow4), oValue4Selected), "Table: row 4");
						assert.equal(oValueOfRow4._dt._position, 4, "Table: row 4 position");
						var oRow5 = oTable.getRows()[4];
						var oValueOfRow5 = oRow5.getBindingContext().getObject();
						assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow5), oValue5Selected), "Table: row 5");
						assert.equal(oValueOfRow5._dt._position, 5, "Table: row 5 position");
						// scroll to bottom
						oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
						wait().then(function () {
							var oRow6 = oTable.getRows()[2];
							var oValueOfRow6 = oRow6.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow6), oValue6Selected), "Table: row 6");
							assert.equal(oValueOfRow6._dt._position, 6, "Table: row 6 position");
							var oRow7 = oTable.getRows()[3];
							var oValueOfRow7 = oRow7.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow7), oValue7Selected), "Table: row 7");
							assert.equal(oValueOfRow7._dt._position, 7, "Table: row 7 position");
							var oRow8 = oTable.getRows()[4];
							var oValueOfRow8 = oRow8.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow8), oValue8Selected), "Table: row 8");
							assert.equal(oValueOfRow8._dt._position, 8, "Table: row 8 position");

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

		QUnit.test("move 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
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
					wait().then(function () {
						var oRow1 = oTable.getRows()[0];
						var oValueOfRow1 = oRow1.getBindingContext().getObject();
						assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow1), oValue1Selected), "Table: row 1");
						assert.equal(oValueOfRow1._dt._position, 1, "Table: row 1 position");
						var oRow2 = oTable.getRows()[1];
						var oValueOfRow2 = oRow2.getBindingContext().getObject();
						assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue2Selected), "Table: row 2");
						assert.equal(oValueOfRow2._dt._position, 2, "Table: row 2 position");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.ok(oMoveUpButton.getEnabled(), "Table toolbar: move up button enabled");
						assert.ok(oMoveDownButton.getEnabled(), "Table toolbar: move down button enabled");
						assert.equal(oTable.getSelectedIndex(), 0, "Table toolbar: selected index is 0");

						oMoveDownButton.firePress();
						wait().then(function () {
							assert.equal(oTable.getSelectedIndex(), 1, "Table toolbar: selected index is 1");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value");
							var oSettings = that.oEditor.getCurrentSettings();
							var oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
							assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), [oValue2, oValue1, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Editor: Field 1 Value");

							oRow1 = oTable.getRows()[0];
							oValueOfRow1 = oRow1.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow1), oValue2Selected), "Table: value 2 move up to row 1");
							assert.equal(oValueOfRow1._dt._position, 1, "Table: row 1 position");
							assert.equal(oField._getCurrentProperty("value")[1]._dt._position, 1, "Table: value 2 position");
							assert.equal(oFieldSettings[0]._dt._position, 1, "Editor: Field 1 value 1 position");

							oRow2 = oTable.getRows()[1];
							oValueOfRow2 = oRow2.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue1Selected), "Table: value 1 move down to row 2");
							assert.equal(oValueOfRow2._dt._position, 2, "Table: row 2 position");
							assert.equal(oField._getCurrentProperty("value")[0]._dt._position, 2, "Table: value 1 position");
							assert.equal(oFieldSettings[1]._dt._position, 2, "Editor: Field 1 value 2 position");

							oMoveUpButton.firePress();
							wait().then(function () {
								assert.equal(oTable.getSelectedIndex(), 0, "Table toolbar: selected index is 0");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value");
								oSettings = that.oEditor.getCurrentSettings();
								oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
								assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), aObjectsParameterValue1), "Editor: Field 1 Value");

								oRow1 = oTable.getRows()[0];
								oValueOfRow1 = oRow1.getBindingContext().getObject();
								assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow1), oValue1Selected), "Table: value 1 move up to row 1");
								assert.equal(oValueOfRow1._dt._position, 1, "Table: row 1 position");
								assert.equal(oField._getCurrentProperty("value")[0]._dt._position, 1, "Table: value 1 position");
								assert.equal(oFieldSettings[0]._dt._position, 1, "Editor: Field 1 value 1 position");

								oRow2 = oTable.getRows()[1];
								oValueOfRow2 = oRow2.getBindingContext().getObject();
								assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue2Selected), "Table: value 2 move down to row 2");
								assert.equal(oValueOfRow2._dt._position, 2, "Table: row 2 position");
								assert.equal(oField._getCurrentProperty("value")[1]._dt._position, 2, "Table: value 2 position");
								assert.equal(oFieldSettings[1]._dt._position, 2, "Editor: Field 1 value 2 position");

								oMoveUpButton.firePress();
								wait().then(function () {
									assert.equal(oTable.getSelectedIndex(), 0, "Table toolbar: selected index is 0");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value");
									oSettings = that.oEditor.getCurrentSettings();
									oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
									assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), aObjectsParameterValue1), "Editor: Field 1 Value");

									oRow1 = oTable.getRows()[0];
									oValueOfRow1 = oRow1.getBindingContext().getObject();
									assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow1), oValue1Selected), "Table: value 1 not change");
									assert.equal(oValueOfRow1._dt._position, 1, "Table: row 1 position");
									assert.equal(oField._getCurrentProperty("value")[0]._dt._position, 1, "Table: value 1 position");
									assert.equal(oFieldSettings[0]._dt._position, 1, "Editor: Field 1 value 1 position");

									oRow2 = oTable.getRows()[1];
									oValueOfRow2 = oRow2.getBindingContext().getObject();
									assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow2), oValue2Selected), "Table: value 2 not change");
									assert.equal(oValueOfRow2._dt._position, 2, "Table: row 2 position");
									assert.equal(oField._getCurrentProperty("value")[1]._dt._position, 2, "Table: value 2 position");
									assert.equal(oFieldSettings[1]._dt._position, 2, "Editor: Field 1 value 2 position");
									resolve();
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("move 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
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
					wait().then(function () {
						// scroll to bottom
						oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
						wait().then(function () {
							var oRow7 = oTable.getRows()[3];
							var oValueOfRow7 = oRow7.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow7), oValue7Selected), "Table: row 7");
							assert.equal(oValueOfRow7._dt._position, 7, "Table: row 7 position");
							var oRow8 = oTable.getRows()[4];
							var oValueOfRow8 = oRow8.getBindingContext().getObject();
							assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow8), oValue8Selected), "Table: row 8");
							assert.equal(oValueOfRow8._dt._position, 8, "Table: row 8 position");
							oTable.setSelectedIndex(6);
							oTable.fireRowSelectionChange({
								rowIndex: 6,
								userInteraction: true
							});
							assert.ok(oMoveUpButton.getEnabled(), "Table toolbar: move up button enabled");
							assert.ok(oMoveDownButton.getEnabled(), "Table toolbar: move down button enabled");
							assert.equal(oTable.getSelectedIndex(), 6, "Table toolbar: selected index is 6");

							oMoveDownButton.firePress();
							wait().then(function () {
								assert.equal(oTable.getSelectedIndex(), 7, "Table toolbar: selected index is 7");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value");
								var oSettings = that.oEditor.getCurrentSettings();
								var oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
								assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue8, oValue7]), "Editor: Field 1 Value");

								oRow7 = oTable.getRows()[3];
								oValueOfRow7 = oRow7.getBindingContext().getObject();
								assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow7), oValue8Selected), "Table: value 8 move up to row 7");
								assert.equal(oValueOfRow7._dt._position, 7, "Table: row 7 position");
								assert.equal(oField._getCurrentProperty("value")[7]._dt._position, 7, "Table: value 7 position");
								assert.equal(oFieldSettings[6]._dt._position, 7, "Editor: Field 1 value 7 position");

								oRow8 = oTable.getRows()[4];
								oValueOfRow8 = oRow8.getBindingContext().getObject();
								assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow8), oValue7Selected), "Table: value 7 move down to row 8");
								assert.equal(oValueOfRow8._dt._position, 8, "Table: row 8 position");
								assert.equal(oField._getCurrentProperty("value")[6]._dt._position, 8, "Table: value 8 position");
								assert.equal(oFieldSettings[7]._dt._position, 8, "Editor: Field 1 value 8 position");

								oMoveDownButton.firePress();
								wait().then(function () {
									assert.equal(oTable.getSelectedIndex(), 7, "Table toolbar: selected index is 7");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value");
									var oSettings = that.oEditor.getCurrentSettings();
									var oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
									assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue8, oValue7]), "Editor: Field 1 Value");

									oRow7 = oTable.getRows()[3];
									oValueOfRow7 = oRow7.getBindingContext().getObject();
									assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow7), oValue8Selected), "Table: value 8");
									assert.equal(oValueOfRow7._dt._position, 7, "Table: row 7 position");
									assert.equal(oField._getCurrentProperty("value")[7]._dt._position, 7, "Table: value 7 position");
									assert.equal(oFieldSettings[6]._dt._position, 7, "Editor: Field 1 value 7 position");

									oRow8 = oTable.getRows()[4];
									oValueOfRow8 = oRow8.getBindingContext().getObject();
									assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow8), oValue7Selected), "Table: value 7");
									assert.equal(oValueOfRow8._dt._position, 8, "Table: row 8 position");
									assert.equal(oField._getCurrentProperty("value")[6]._dt._position, 8, "Table: value 8 position");
									assert.equal(oFieldSettings[7]._dt._position, 8, "Editor: Field 1 value 8 position");

									oMoveUpButton.firePress();
									wait().then(function () {
										assert.equal(oTable.getSelectedIndex(), 6, "Table toolbar: selected index is 6");
										assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value");
										oSettings = that.oEditor.getCurrentSettings();
										oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
										assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), aObjectsParameterValue1), "Editor: Field 1 Value");

										oRow7 = oTable.getRows()[3];
										oValueOfRow7 = oRow7.getBindingContext().getObject();
										assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow7), oValue7Selected), "Table: value 7 move up to row 7");
										assert.equal(oValueOfRow7._dt._position, 7, "Table: row 7 position");
										assert.equal(oField._getCurrentProperty("value")[6]._dt._position, 7, "Table: value 7 position");
										assert.equal(oFieldSettings[6]._dt._position, 7, "Editor: Field 1 value 7 position");

										oRow8 = oTable.getRows()[4];
										oValueOfRow8 = oRow8.getBindingContext().getObject();
										assert.ok(deepEqual(cleanUUIDAndPosition(oValueOfRow8), oValue8Selected), "Table: value 8 move down to row 8");
										assert.equal(oValueOfRow8._dt._position, 8, "Table: row 8 position");
										assert.equal(oField._getCurrentProperty("value")[7]._dt._position, 8, "Table: value 8 position");
										assert.equal(oFieldSettings[7]._dt._position, 8, "Editor: Field 1 value 8 position");
										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("add", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
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
								assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
								assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[8].getObject()), oDefaultNewObjectSelected), "Table: new row data");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1.concat([oDefaultNewObject])), "Field 1: Value changed");
								assert.equal(oField._getCurrentProperty("value")[8]._dt._position, 9, "Table: added value position");
								var oSettings = that.oEditor.getCurrentSettings();
								var oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
								assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8, oDefaultNewObject]), "Editor: Field 1 Value");
								assert.equal(oFieldSettings[8]._dt._position, 9, "Editor: Field 1 value 9 position");

								// scroll to the bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									var oNewRow = oTable.getRows()[4];
									var oNewValue = oNewRow.getBindingContext().getObject();
									assert.ok(deepEqual(cleanUUIDAndPosition(oNewValue), oDefaultNewObjectSelected), "Table: new row in the bottom");
									assert.equal(oNewValue._dt._position, 9, "Table: new row position");
									resolve();
								});
							});
						});
					};
				});
			});
		});

		QUnit.test("delete", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), aObjectsParameterValue1.length, "Table: value length is " + aObjectsParameterValue1.length);
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oDeleteButton = oToolbar.getContent()[3];
					assert.ok(!oDeleteButton.getEnabled(), "Table toolbar: delete button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
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
								var aFieldValue = oField._getCurrentProperty("value");
								assert.ok(deepEqual(cleanUUIDAndPosition(aFieldValue), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
								assert.equal(aFieldValue[0]._dt._position, 2, "Field 1: value 2 position");
								assert.equal(aFieldValue[1]._dt._position, 3, "Field 1: value 3 position");
								assert.equal(aFieldValue[2]._dt._position, 4, "Field 1: value 4 position");
								assert.equal(aFieldValue[3]._dt._position, 5, "Field 1: value 5 position");
								assert.equal(aFieldValue[4]._dt._position, 6, "Field 1: value 6 position");
								assert.equal(aFieldValue[5]._dt._position, 7, "Field 1: value 7 position");
								assert.equal(aFieldValue[6]._dt._position, 8, "Field 1: value 8 position");
								assert.equal(oTable.getBinding().getCount(), 7, "Table: value length is 7");
								var oSettings = that.oEditor.getCurrentSettings();
								var oFieldSettings = oSettings[oField.getConfiguration().manifestpath];
								assert.ok(deepEqual(cleanUUIDAndPosition(oFieldSettings), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Editor: Field 1 Value");
								assert.equal(oFieldSettings[0]._dt._position, 1, "Editor: Field 1 value 2 position");
								assert.equal(oFieldSettings[1]._dt._position, 2, "Editor: Field 1 value 3 position");
								assert.equal(oFieldSettings[2]._dt._position, 3, "Editor: Field 1 value 4 position");
								assert.equal(oFieldSettings[3]._dt._position, 4, "Editor: Field 1 value 5 position");
								assert.equal(oFieldSettings[4]._dt._position, 5, "Editor: Field 1 value 6 position");
								assert.equal(oFieldSettings[5]._dt._position, 6, "Editor: Field 1 value 7 position");
								assert.equal(oFieldSettings[6]._dt._position, 7, "Editor: Field 1 value 8 position");
								resolve();
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
