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
	var oValue1 = Object.assign(deepClone(oValue1Ori), {"_editable": false});
	var oValue3 = Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}});
	var oValue5 = Object.assign(deepClone(oValue5Ori), {"_editable": false});
	var oValue7 = Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}});
	var oValue8 = Object.assign(deepClone(oValue8Ori), {"_editable": false});

	var oDefalutNewObjectSelected = {"_dt": {"_selected": true},"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};

	var oValueNew = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
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

	QUnit.module("add", {
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
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllCheckBox = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllCheckBox.getVisible(), "Table: Select or Unselect All Checkbox in Selection column visible");
						assert.ok(!oSelectOrUnSelectAllCheckBox.getSelected(), "Table: Select or Unselect All Checkbox in Selection column not selected");
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
							assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
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
							assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), oDefalutNewObjectSelected), "SimpleForm field textArea: Has Default value");
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
								var oNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
								assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[8].getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row data");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oNewObject]), "Field 1: value");
								// scroll to bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									var oRow5 = oTable.getRows()[4];
									assert.ok(deepEqual(cleanUUIDAndPosition(oRow5.getBindingContext().getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row");
									var oSelectionCell5 = oRow5.getCells()[0];
									assert.ok(oSelectionCell5.getVisible(), "Row: selection checkbox visible");
									assert.ok(oSelectionCell5.getEnabled(), "Row: selection checkbox enabled");
									assert.ok(oSelectionCell5.getSelected(), "Row: selection checkbox selected");
									resolve();
								});
							});
						});
					});
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
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllCheckBox = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllCheckBox.getVisible(), "Table: Select or Unselect All Checkbox in Selection column visible");
						assert.ok(!oSelectOrUnSelectAllCheckBox.getSelected(), "Table: Select or Unselect All Checkbox in Selection column not selected");
						assert.ok(oColumns[1].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[2].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[3].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[4].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[5].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[6].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[7].getLabel().getText() === "Number", "Table: column 'Number'");
						wait().then(function () {
							oAddButton.firePress();
							wait().then(function () {
								var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
								var oContents = oSimpleForm.getContent();
								assert.ok(oContents.length === 16, "SimpleForm: length");
								assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), oDefalutNewObjectSelected), "SimpleForm field textArea: Has Default value");
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
								assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
								assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
								assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
								assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
								oFormField.setState(true);
								oFormField.fireChange({ state: true });
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
									assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
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
										var oNewObject = {"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1};
										assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[8].getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row data");
										assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oNewObject]), "Field 1: value");
										// scroll to bottom
										oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
										wait().then(function () {
											var oRow5 = oTable.getRows()[4];
											assert.ok(deepEqual(cleanUUIDAndPosition(oRow5.getBindingContext().getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row");
											var oSelectionCell5 = oRow5.getCells()[0];
											assert.ok(oSelectionCell5.getVisible(), "Row: selection checkbox visible");
											assert.ok(oSelectionCell5.getEnabled(), "Row: selection checkbox enabled");
											assert.ok(oSelectionCell5.getSelected(), "Row: selection checkbox selected");
											resolve();
										});
									});
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("no value, add with TextArea fields in popover", function (assert) {
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
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllCheckBox = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllCheckBox.getVisible(), "Table: Select or Unselect All Checkbox in Selection column visible");
						assert.ok(!oSelectOrUnSelectAllCheckBox.getSelected(), "Table: Select or Unselect All Checkbox in Selection column not selected");
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
							assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), oDefalutNewObjectSelected), "SimpleForm field textArea: Has Default value");
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
							assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
							oFormField.setState(true);
							oFormField.fireChange({ state: true });
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
								assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
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
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
									var oNewObject = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55};
									assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[8].getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row data");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oNewObject]), "Field 1: value");
									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oRow5 = oTable.getRows()[4];
										assert.ok(deepEqual(cleanUUIDAndPosition(oRow5.getBindingContext().getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row");
										var oSelectionCell5 = oRow5.getCells()[0];
										assert.ok(oSelectionCell5.getVisible(), "Row: selection checkbox visible");
										assert.ok(oSelectionCell5.getEnabled(), "Row: selection checkbox enabled");
										assert.ok(oSelectionCell5.getSelected(), "Row: selection checkbox selected");
										resolve();
									});
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
						"designtime": "designtime/objectListWithRequestValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectListWithRequestValues": {
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
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), []), "Field 1: Value");
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
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllCheckBox = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllCheckBox.getVisible(), "Table: Select or Unselect All Checkbox in Selection column visible");
						assert.ok(!oSelectOrUnSelectAllCheckBox.getSelected(), "Table: Select or Unselect All Checkbox in Selection column not selected");
						assert.ok(oColumns[1].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[2].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[3].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[4].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[5].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[6].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[7].getLabel().getText() === "Number", "Table: column 'Number'");
						wait().then(function () {
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
								assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
								assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
								assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
								assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
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
								assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), oDefalutNewObjectSelected), "SimpleForm field textArea: Has Default value");
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
									var oNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
									assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[8].getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row data");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oNewObject]), "Field 1: value");
									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oRow5 = oTable.getRows()[4];
										assert.ok(deepEqual(cleanUUIDAndPosition(oRow5.getBindingContext().getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row");
										var oSelectionCell5 = oRow5.getCells()[0];
										assert.ok(oSelectionCell5.getVisible(), "Row: selection checkbox visible");
										assert.ok(oSelectionCell5.getEnabled(), "Row: selection checkbox enabled");
										assert.ok(oSelectionCell5.getSelected(), "Row: selection checkbox selected");
										resolve();
									});
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("[] as value, add with property fields in popover", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), []), "Field 1: Value");
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
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllCheckBox = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllCheckBox.getVisible(), "Table: Select or Unselect All Checkbox in Selection column visible");
						assert.ok(!oSelectOrUnSelectAllCheckBox.getSelected(), "Table: Select or Unselect All Checkbox in Selection column not selected");
						assert.ok(oColumns[1].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[2].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[3].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[4].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[5].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[6].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[7].getLabel().getText() === "Number", "Table: column 'Number'");
						wait().then(function () {
							oAddButton.firePress();
							wait().then(function () {
								var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
								var oContents = oSimpleForm.getContent();
								assert.ok(oContents.length === 16, "SimpleForm: length");
								assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), oDefalutNewObjectSelected), "SimpleForm field textArea: Has Default value");
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
								assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
								assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
								assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
								assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
								oFormField.setState(true);
								oFormField.fireChange({ state: true });
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
									assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
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
										var oNewObject = {"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1};
										assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[8].getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row data");
										assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oNewObject]), "Field 1: value");
										// scroll to bottom
										oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
										wait().then(function () {
											var oRow5 = oTable.getRows()[4];
											assert.ok(deepEqual(cleanUUIDAndPosition(oRow5.getBindingContext().getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row");
											var oSelectionCell5 = oRow5.getCells()[0];
											assert.ok(oSelectionCell5.getVisible(), "Row: selection checkbox visible");
											assert.ok(oSelectionCell5.getEnabled(), "Row: selection checkbox enabled");
											assert.ok(oSelectionCell5.getSelected(), "Row: selection checkbox selected");
											resolve();
										});
									});
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
						"designtime": "designtime/objectListWithRequestValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectListWithRequestValues": {
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
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), []), "Field 1: Value");
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
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllCheckBox = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllCheckBox.getVisible(), "Table: Select or Unselect All Checkbox in Selection column visible");
						assert.ok(!oSelectOrUnSelectAllCheckBox.getSelected(), "Table: Select or Unselect All Checkbox in Selection column not selected");
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
							assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), oDefalutNewObjectSelected), "SimpleForm field textArea: Has Default value");
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
							assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
							oFormField.setState(true);
							oFormField.fireChange({ state: true });
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
								assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
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
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
									var oNewObject = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55};
									assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[8].getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row data");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oNewObject]), "Field 1: value");
									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oRow5 = oTable.getRows()[4];
										assert.ok(deepEqual(cleanUUIDAndPosition(oRow5.getBindingContext().getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row");
										var oSelectionCell5 = oRow5.getCells()[0];
										assert.ok(oSelectionCell5.getVisible(), "Row: selection checkbox visible");
										assert.ok(oSelectionCell5.getEnabled(), "Row: selection checkbox enabled");
										assert.ok(oSelectionCell5.getSelected(), "Row: selection checkbox selected");
										resolve();
									});
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add with default property values in popover", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
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
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

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
							assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
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
							assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), oDefalutNewObjectSelected), "SimpleForm field textArea: Has Default value");
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
								var oNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
								assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
								assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[9].getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row data");
								// scroll to the bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									var oNewRow = oTable.getRows()[4];
									assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row in the bottom");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue.concat(oNewObject)), "Field 1: DT Value");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add with default property values in popover but cancel", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
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
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

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
							assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
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
							assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), oDefalutNewObjectSelected), "SimpleForm field textArea: Has Default value");
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
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 10");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
								resolve();
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

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
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
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
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), oDefalutNewObjectSelected), "SimpleForm field textArea: Has Default value");
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
							assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
							oFormField.setState(true);
							oFormField.fireChange({ state: true });
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
								assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
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
									var oNewObject = {"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1};
									assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
									assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[9].getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row data");
									// scroll to the bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oNewRow = oTable.getRows()[4];
										assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row in the bottom");
										assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue.concat(oNewObject)), "Field 1: DT Value");
										resolve();
									});
								});
							});
						});
					});
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
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
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
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), oDefalutNewObjectSelected), "SimpleForm field textArea: Has Default value");
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
							assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
							oFormField.setState(true);
							oFormField.fireChange({ state: true });
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
								assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
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
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 10");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
									resolve();
								});
							});
						});
					});
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
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
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
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), oDefalutNewObjectSelected), "SimpleForm field textArea: Has Default value");
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
							assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
							oFormField.setState(true);
							oFormField.fireChange({ state: true });
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
								assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
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
									var oNewObject = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55};
									assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
									assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[9].getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row data");
									// scroll to the bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oNewRow = oTable.getRows()[4];
										assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row in the bottom");
										assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue.concat(oNewObject)), "Field 1: DT Value");
										resolve();
									});
								});
							});
						});
					});
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
					assert.ok(oLabel.getText() === "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
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
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), oDefalutNewObjectSelected), "SimpleForm field textArea: Has Default value");
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
							assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
							oFormField.setState(true);
							oFormField.fireChange({ state: true });
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
								assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
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
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 10");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
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
