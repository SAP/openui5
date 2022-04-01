/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/base/util/deepEqual",
	"sap/ui/core/util/MockServer"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	MockServer
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
	var oValue1 = {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55, "_editable": false};
	var oValue2 = {"text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55, "_editable": false};
	var oValue3 = {"text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "editable": true, "_editable": false};
	var oValue4 = {"text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "number": 3.55, "_editable": false};
	var oValue5 = {"text": "text05", "key": "key05", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5, "editable": true, "_editable": false};
	var oValue6 = {"text": "text06", "key": "key06", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6, "number": 3.55, "_editable": false};
	var oValue7 = {"text": "text07", "key": "key07", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7, "editable": true, "_editable": false};
	var oValue8 = {"text": "text08", "key": "key08", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8, "number": 3.55, "_editable": false};
	var oValueNew = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
	var aObjectsParameterValue = [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew];
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
						"value": aObjectsParameterValue
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
	var aSelectedIndices = [0, 1, 2, 3, 4, 5];

	var oResponseData = {
		"Objects": [
			{ "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, "editable": true, "number": 3.55 },
			{ "text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55 },
			{ "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "editable": true },
			{ "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "number": 3.55 },
			{ "text": "text05", "key": "key05", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5, "editable": true },
			{ "text": "text06", "key": "key06", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6, "number": 3.55 },
			{ "text": "text07", "key": "key07", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7, "editable": true },
			{ "text": "text08", "key": "key08", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8, "number": 3.55 }
		]
	};

	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

	QUnit.module("no value or [] as value", {
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
					assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
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
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
								var oNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
								assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), oNewObject), "Table: new row data");
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: no value");
								// scroll to bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									var oRow5 = oTable.getRows()[4];
									assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oNewObject), "Table: new row");
									// select row1
									oRow5.getDomRefs(true).rowSelector.click();
									assert.ok( oTable.getSelectedIndices()[0] === 8, "Table: SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewObject]), "Field 1: Value after selection change");
									// unselect row1
									oRow5.getDomRefs(true).rowSelector.click();
									assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
									assert.ok(!oField._getCurrentProperty("value"), "Field 1: no value");
									resolve();
								});
							});
						});
					};
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
					assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
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
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "key01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field8: Has value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
									var oNewObject = {"icon": "sap-icon://accept", "text": "text01", "url": "https://sapui5.hana.ondemand.com/06", "number": 0.55, "key": "key01", "editable": true, "int": 1};
									assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), oNewObject), "Table: new row data");

									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oRow5 = oTable.getRows()[4];
										assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oNewObject), "Table: new row");
										var oCells = oRow5.getCells();
										assert.ok(oCells.length === 8, "Row: cell length");
										assert.ok(oRow5.getCells()[0].isA("sap.m.Text"), "Cell 1: Text");
										assert.ok(oRow5.getCells()[1].isA("sap.ui.core.Icon"), "Cell 2: Icon");
										assert.ok(oRow5.getCells()[2].isA("sap.m.Text"), "Cell 3: Text");
										assert.ok(oRow5.getCells()[3].isA("sap.m.Link"), "Cell 4: Link");
										assert.ok(oRow5.getCells()[4].isA("sap.m.Switch"), "Cell 5: Switch");
										assert.ok(oRow5.getCells()[5].isA("sap.m.Text"), "Cell 6: Text");
										assert.ok(oRow5.getCells()[6].isA("sap.m.Text"), "Cell 7: Text");
										// select row1
										oRow5.getDomRefs(true).rowSelector.click();
										assert.ok( oTable.getSelectedIndices()[0] === 8, "Table: SelectedIndices after selection change");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewObject]), "Field 1: Value after selection change");
										// unselect row1
										oRow5.getDomRefs(true).rowSelector.click();
										assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
										assert.ok(!oField._getCurrentProperty("value"), "Field 1: no value");
										resolve();
									});
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("no value, add with TextArea field in popover", function (assert) {
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
					assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
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
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "key01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field8: Has value");
								var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
									var oNewObject = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55};
									assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), oNewObject), "Table: new row data");
									assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
									assert.ok(!oField._getCurrentProperty("value"), "Field 1: no value");

									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oRow5 = oTable.getRows()[4];
										assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oNewObject), "Table: new row");
										var oCells = oRow5.getCells();
										assert.ok(oCells.length === 8, "Row: cell length");
										assert.ok(oRow5.getCells()[0].isA("sap.m.Text"), "Cell 1: Text");
										assert.ok(oRow5.getCells()[1].isA("sap.ui.core.Icon"), "Cell 2: Icon");
										assert.ok(oRow5.getCells()[2].isA("sap.m.Text"), "Cell 3: Text");
										assert.ok(oRow5.getCells()[3].isA("sap.m.Link"), "Cell 4: Link");
										assert.ok(oRow5.getCells()[4].isA("sap.m.Switch"), "Cell 5: Switch");
										assert.ok(oRow5.getCells()[5].isA("sap.m.Text"), "Cell 6: Text");
										assert.ok(oRow5.getCells()[6].isA("sap.m.Text"), "Cell 7: Text");
										// select row1
										oRow5.getDomRefs(true).rowSelector.click();
										assert.ok( oTable.getSelectedIndices()[0] === 8, "Table: SelectedIndices after selection change");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewObject]), "Field 1: Value after selection change");
										// unselect row1
										oRow5.getDomRefs(true).rowSelector.click();
										assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
										assert.ok(!oField._getCurrentProperty("value"), "Field 1: no value");
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), []), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
					assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
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
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
								var oNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
								assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), oNewObject), "Table: new row data");
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), []), "Field 1: value []");
								// scroll to bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									var oRow5 = oTable.getRows()[4];
									assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oNewObject), "Table: new row");
									var oCells = oRow5.getCells();
									assert.ok(oCells.length === 8, "Row: cell length");
									assert.ok(oRow5.getCells()[0].isA("sap.m.Text"), "Cell 1: Text");
									assert.ok(oRow5.getCells()[1].isA("sap.ui.core.Icon"), "Cell 2: Icon");
									assert.ok(oRow5.getCells()[2].isA("sap.m.Text"), "Cell 3: Text");
									assert.ok(oRow5.getCells()[3].isA("sap.m.Link"), "Cell 4: Link");
									assert.ok(oRow5.getCells()[4].isA("sap.m.Switch"), "Cell 5: Switch");
									assert.ok(oRow5.getCells()[5].isA("sap.m.Text"), "Cell 6: Text");
									assert.ok(oRow5.getCells()[6].isA("sap.m.Text"), "Cell 7: Text");
									// select row1
									oRow5.getDomRefs(true).rowSelector.click();
									assert.ok( oTable.getSelectedIndices()[0] === 8, "Table: SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewObject]), "Field 1: Value after selection change");
									// unselect row1
									oRow5.getDomRefs(true).rowSelector.click();
									assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
									assert.ok(!oField._getCurrentProperty("value"), "Field 1: no value");
									resolve();
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), []), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
					assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
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
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "key01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field8: Has value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
									var oNewObject = {"icon": "sap-icon://accept", "text": "text01", "url": "https://sapui5.hana.ondemand.com/06", "number": 0.55, "key": "key01", "editable": true, "int": 1};
									assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), oNewObject), "Table: new row data");
									assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), []), "Field 1: value []");
									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oRow5 = oTable.getRows()[4];
										assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oNewObject), "Table: new row");
										var oCells = oRow5.getCells();
										assert.ok(oCells.length === 8, "Row: cell length");
										assert.ok(oRow5.getCells()[0].isA("sap.m.Text"), "Cell 1: Text");
										assert.ok(oRow5.getCells()[1].isA("sap.ui.core.Icon"), "Cell 2: Icon");
										assert.ok(oRow5.getCells()[2].isA("sap.m.Text"), "Cell 3: Text");
										assert.ok(oRow5.getCells()[3].isA("sap.m.Link"), "Cell 4: Link");
										assert.ok(oRow5.getCells()[4].isA("sap.m.Switch"), "Cell 5: Switch");
										assert.ok(oRow5.getCells()[5].isA("sap.m.Text"), "Cell 6: Text");
										assert.ok(oRow5.getCells()[6].isA("sap.m.Text"), "Cell 7: Text");
										// select row1
										oRow5.getDomRefs(true).rowSelector.click();
										assert.ok( oTable.getSelectedIndices()[0] === 8, "Table: SelectedIndices after selection change");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewObject]), "Field 1: Value after selection change");
										// unselect row1
										oRow5.getDomRefs(true).rowSelector.click();
										assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
										assert.ok(!oField._getCurrentProperty("value"), "Field 1: no value");
										resolve();
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), []), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
					assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oAddButton.onAfterRendering = function(oEvent) {
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						var oColumns = oTable.getColumns();
						assert.ok(oColumns.length === 8, "Table: column number is 8");
						assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
						assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
						assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
						assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
						assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
						assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
						assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
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
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "key01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field8: Has value");
								var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
									var oNewObject = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55};
									assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), oNewObject), "Table: new row data");
									assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), []), "Field 1: value []");
									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oRow5 = oTable.getRows()[4];
										assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oNewObject), "Table: new row");
										var oCells = oRow5.getCells();
										assert.ok(oCells.length === 8, "Row: cell length");
										assert.ok(oRow5.getCells()[0].isA("sap.m.Text"), "Cell 1: Text");
										assert.ok(oRow5.getCells()[1].isA("sap.ui.core.Icon"), "Cell 2: Icon");
										assert.ok(oRow5.getCells()[2].isA("sap.m.Text"), "Cell 3: Text");
										assert.ok(oRow5.getCells()[3].isA("sap.m.Link"), "Cell 4: Link");
										assert.ok(oRow5.getCells()[4].isA("sap.m.Switch"), "Cell 5: Switch");
										assert.ok(oRow5.getCells()[5].isA("sap.m.Text"), "Cell 6: Text");
										assert.ok(oRow5.getCells()[6].isA("sap.m.Text"), "Cell 7: Text");
										// select row1
										oRow5.getDomRefs(true).rowSelector.click();
										assert.ok( oTable.getSelectedIndices()[0] === 8, "Table: SelectedIndices after selection change");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewObject]), "Field 1: Value after selection change");
										// unselect row1
										oRow5.getDomRefs(true).rowSelector.click();
										assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
										assert.ok(!oField._getCurrentProperty("value"), "Field 1: no value");
										resolve();
									});
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("select and deselect", {
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
		QUnit.test("01", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
						var oActionHBox = oRow1.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton1 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton1.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton1.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");

						var oRow2 = oTable.getRows()[1];
						assert.ok(deepEqual(oRow2.getBindingContext().getObject(), oValue3), "Row 2: value");
						oActionHBox = oRow2.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
						var oEditOrDisplayButton2 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton2.getIcon() === "sap-icon://display", "Row 2: Display button icon");
						assert.ok(oEditOrDisplayButton2.getVisible(), "Row 2: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 2: Delete button not visible");

						var oRow3 = oTable.getRows()[2];
						assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue5), "Row 3: value");
						oActionHBox = oRow3.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
						var oEditOrDisplayButton3 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton3.getIcon() === "sap-icon://display", "Row 3: Display button icon");
						assert.ok(oEditOrDisplayButton3.getVisible(), "Row 3: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 3: Delete button not visible");

						var oRow4 = oTable.getRows()[3];
						assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue7), "Row 4: value");
						oActionHBox = oRow4.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
						var oEditOrDisplayButton4 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton4.getIcon() === "sap-icon://display", "Row 4: Dispaly button icon");
						assert.ok(oEditOrDisplayButton4.getVisible(), "Row 4: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 4: Delete button not visible");

						var oRow5 = oTable.getRows()[4];
						assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue8), "Row 5: value");
						oActionHBox = oRow5.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 5: Action cell contains 2 buttons");
						var oEditOrDisplayButton5 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton5.getIcon() === "sap-icon://display", "Row 5: Display button icon");
						assert.ok(oEditOrDisplayButton5.getVisible(), "Row 5: Edit button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 5: Delete button not visible");

						oRow1.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue5, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

						oRow1.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");

						oRow1.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue5, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

						oRow2.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

						oRow3.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [3, 4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue7, oValue8, oValueNew]), "Field 1: DT Value");

						oRow4.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue8, oValueNew]), "Field 1: DT Value");

						oRow5.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValueNew]), "Field 1: DT Value");

						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
							wait().then(function () {
								var oRow6 = oTable.getRows()[1];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
								oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditOrDisplayButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditOrDisplayButton6.getVisible(), "Row 6: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								var oRow7 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue2), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 7: Action cell contains 2 buttons");
								var oEditOrDisplayButton7 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton7.getIcon() === "sap-icon://display", "Row 7: Display button icon");
								assert.ok(oEditOrDisplayButton7.getVisible(), "Row 7: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 7: Delete button not visible");

								var oRow8 = oTable.getRows()[3];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue4), "Row 8: value");
								oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 8: Action cell contains 2 buttons");
								var oEditOrDisplayButton8 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton8.getIcon() === "sap-icon://display", "Row 8: Display button icon");
								assert.ok(oEditOrDisplayButton8.getVisible(), "Row 8: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 8: Delete button not visible");

								var oRow9 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow9.getBindingContext().getObject(), oValue6), "Row 9: value");
								oActionHBox = oRow9.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 9: Action cell contains 2 buttons");
								var oEditOrDisplayButton9 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton9.getIcon() === "sap-icon://display", "Row 9: Display button icon");
								assert.ok(oEditOrDisplayButton9.getVisible(), "Row 9: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 9: Delete button not visible");

								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no row selected");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: no Value");

								oRow7.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [6]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2]), "Field 1: DT Value");

								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue4]), "Field 1: DT Value");

								oRow9.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7, 8]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue4, oValue6]), "Field 1: DT Value");

								resolve();
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("03", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
						var oActionHBox = oRow1.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton1 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton1.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton1.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");

						var oRow2 = oTable.getRows()[1];
						assert.ok(deepEqual(oRow2.getBindingContext().getObject(), oValue3), "Row 2: value");
						oActionHBox = oRow2.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
						var oEditOrDisplayButton2 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton2.getIcon() === "sap-icon://display", "Row 2: Display button icon");
						assert.ok(oEditOrDisplayButton2.getVisible(), "Row 2: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 2: Delete button not visible");

						var oRow3 = oTable.getRows()[2];
						assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue5), "Row 3: value");
						oActionHBox = oRow3.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
						var oEditOrDisplayButton3 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton3.getIcon() === "sap-icon://display", "Row 3: Display button icon");
						assert.ok(oEditOrDisplayButton3.getVisible(), "Row 3: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 3: Delete button not visible");

						var oRow4 = oTable.getRows()[3];
						assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue7), "Row 4: value");
						oActionHBox = oRow4.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
						var oEditOrDisplayButton4 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton4.getIcon() === "sap-icon://display", "Row 4: Dispaly button icon");
						assert.ok(oEditOrDisplayButton4.getVisible(), "Row 4: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 4: Delete button not visible");

						var oRow5 = oTable.getRows()[4];
						assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue8), "Row 5: value");
						oActionHBox = oRow5.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 5: Action cell contains 2 buttons");
						var oEditOrDisplayButton5 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton5.getIcon() === "sap-icon://display", "Row 5: Display button icon");
						assert.ok(oEditOrDisplayButton5.getVisible(), "Row 5: Edit button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 5: Delete button not visible");

						oRow3.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3, 4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

						oRow3.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");

						oRow1.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue5, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

						oRow2.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

						oRow3.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [3, 4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue7, oValue8, oValueNew]), "Field 1: DT Value");

						oRow4.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue8, oValueNew]), "Field 1: DT Value");

						oRow5.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValueNew]), "Field 1: DT Value");

						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
							wait().then(function () {
								var oRow6 = oTable.getRows()[1];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
								oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditOrDisplayButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditOrDisplayButton6.getVisible(), "Row 6: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								var oRow7 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue2), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 7: Action cell contains 2 buttons");
								var oEditOrDisplayButton7 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton7.getIcon() === "sap-icon://display", "Row 7: Display button icon");
								assert.ok(oEditOrDisplayButton7.getVisible(), "Row 7: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 7: Delete button not visible");

								var oRow8 = oTable.getRows()[3];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue4), "Row 8: value");
								oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 8: Action cell contains 2 buttons");
								var oEditOrDisplayButton8 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton8.getIcon() === "sap-icon://display", "Row 8: Display button icon");
								assert.ok(oEditOrDisplayButton8.getVisible(), "Row 8: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 8: Delete button not visible");

								var oRow9 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow9.getBindingContext().getObject(), oValue6), "Row 9: value");
								oActionHBox = oRow9.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 9: Action cell contains 2 buttons");
								var oEditOrDisplayButton9 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton9.getIcon() === "sap-icon://display", "Row 9: Display button icon");
								assert.ok(oEditOrDisplayButton9.getVisible(), "Row 9: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 9: Delete button not visible");

								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no row selected");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: no Value");

								oRow7.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [6]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2]), "Field 1: DT Value");

								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue4]), "Field 1: DT Value");

								oRow9.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7, 8]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue4, oValue6]), "Field 1: DT Value");

								resolve();
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("05", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
						var oActionHBox = oRow1.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton1 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton1.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton1.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");

						var oRow2 = oTable.getRows()[1];
						assert.ok(deepEqual(oRow2.getBindingContext().getObject(), oValue3), "Row 2: value");
						oActionHBox = oRow2.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
						var oEditOrDisplayButton2 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton2.getIcon() === "sap-icon://display", "Row 2: Display button icon");
						assert.ok(oEditOrDisplayButton2.getVisible(), "Row 2: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 2: Delete button not visible");

						var oRow3 = oTable.getRows()[2];
						assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue5), "Row 3: value");
						oActionHBox = oRow3.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
						var oEditOrDisplayButton3 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton3.getIcon() === "sap-icon://display", "Row 3: Display button icon");
						assert.ok(oEditOrDisplayButton3.getVisible(), "Row 3: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 3: Delete button not visible");

						var oRow4 = oTable.getRows()[3];
						assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue7), "Row 4: value");
						oActionHBox = oRow4.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
						var oEditOrDisplayButton4 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton4.getIcon() === "sap-icon://display", "Row 4: Dispaly button icon");
						assert.ok(oEditOrDisplayButton4.getVisible(), "Row 4: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 4: Delete button not visible");

						var oRow5 = oTable.getRows()[4];
						assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue8), "Row 5: value");
						oActionHBox = oRow5.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 5: Action cell contains 2 buttons");
						var oEditOrDisplayButton5 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton5.getIcon() === "sap-icon://display", "Row 5: Display button icon");
						assert.ok(oEditOrDisplayButton5.getVisible(), "Row 5: Edit button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 5: Delete button not visible");

						oRow5.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValueNew]), "Field 1: DT Value");

						oRow5.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");

						oRow1.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue5, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

						oRow2.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

						oRow3.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [3, 4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue7, oValue8, oValueNew]), "Field 1: DT Value");

						oRow4.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue8, oValueNew]), "Field 1: DT Value");

						oRow5.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValueNew]), "Field 1: DT Value");

						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
							wait().then(function () {
								var oRow6 = oTable.getRows()[1];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
								oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditOrDisplayButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditOrDisplayButton6.getVisible(), "Row 6: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								var oRow7 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue2), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 7: Action cell contains 2 buttons");
								var oEditOrDisplayButton7 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton7.getIcon() === "sap-icon://display", "Row 7: Display button icon");
								assert.ok(oEditOrDisplayButton7.getVisible(), "Row 7: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 7: Delete button not visible");

								var oRow8 = oTable.getRows()[3];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue4), "Row 8: value");
								oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 8: Action cell contains 2 buttons");
								var oEditOrDisplayButton8 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton8.getIcon() === "sap-icon://display", "Row 8: Display button icon");
								assert.ok(oEditOrDisplayButton8.getVisible(), "Row 8: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 8: Delete button not visible");

								var oRow9 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow9.getBindingContext().getObject(), oValue6), "Row 9: value");
								oActionHBox = oRow9.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 9: Action cell contains 2 buttons");
								var oEditOrDisplayButton9 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton9.getIcon() === "sap-icon://display", "Row 9: Display button icon");
								assert.ok(oEditOrDisplayButton9.getVisible(), "Row 9: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 9: Delete button not visible");

								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no row selected");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: no Value");

								oRow7.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [6]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2]), "Field 1: DT Value");

								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue4]), "Field 1: DT Value");

								oRow9.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7, 8]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue4, oValue6]), "Field 1: DT Value");

								resolve();
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("06", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
						var oActionHBox = oRow1.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton1 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton1.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton1.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");

						var oRow2 = oTable.getRows()[1];
						assert.ok(deepEqual(oRow2.getBindingContext().getObject(), oValue3), "Row 2: value");
						oActionHBox = oRow2.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
						var oEditOrDisplayButton2 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton2.getIcon() === "sap-icon://display", "Row 2: Display button icon");
						assert.ok(oEditOrDisplayButton2.getVisible(), "Row 2: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 2: Delete button not visible");

						var oRow3 = oTable.getRows()[2];
						assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue5), "Row 3: value");
						oActionHBox = oRow3.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
						var oEditOrDisplayButton3 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton3.getIcon() === "sap-icon://display", "Row 3: Display button icon");
						assert.ok(oEditOrDisplayButton3.getVisible(), "Row 3: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 3: Delete button not visible");

						var oRow4 = oTable.getRows()[3];
						assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue7), "Row 4: value");
						oActionHBox = oRow4.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
						var oEditOrDisplayButton4 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton4.getIcon() === "sap-icon://display", "Row 4: Dispaly button icon");
						assert.ok(oEditOrDisplayButton4.getVisible(), "Row 4: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 4: Delete button not visible");

						var oRow5 = oTable.getRows()[4];
						assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue8), "Row 5: value");
						oActionHBox = oRow5.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 5: Action cell contains 2 buttons");
						var oEditOrDisplayButton5 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton5.getIcon() === "sap-icon://display", "Row 5: Display button icon");
						assert.ok(oEditOrDisplayButton5.getVisible(), "Row 5: Edit button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 5: Delete button not visible");

						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow6 = oTable.getRows()[1];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
								oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditOrDisplayButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditOrDisplayButton6.getVisible(), "Row 6: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								var oRow7 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue2), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 7: Action cell contains 2 buttons");
								var oEditOrDisplayButton7 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton7.getIcon() === "sap-icon://display", "Row 7: Display button icon");
								assert.ok(oEditOrDisplayButton7.getVisible(), "Row 7: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 7: Delete button not visible");

								var oRow8 = oTable.getRows()[3];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue4), "Row 8: value");
								oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 8: Action cell contains 2 buttons");
								var oEditOrDisplayButton8 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton8.getIcon() === "sap-icon://display", "Row 8: Display button icon");
								assert.ok(oEditOrDisplayButton8.getVisible(), "Row 8: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 8: Delete button not visible");

								var oRow9 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow9.getBindingContext().getObject(), oValue6), "Row 9: value");
								oActionHBox = oRow9.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 9: Action cell contains 2 buttons");
								var oEditOrDisplayButton9 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton9.getIcon() === "sap-icon://display", "Row 9: Display button icon");
								assert.ok(oEditOrDisplayButton9.getVisible(), "Row 9: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 9: Delete button not visible");

								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8]), "Field 1: DT Value");

								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");

								// scroll to top
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 0;
								wait().then(function () {
									oRow1.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue5, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

									oRow2.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

									oRow3.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [3, 4, 5]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue7, oValue8, oValueNew]), "Field 1: DT Value");

									oRow4.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [4, 5]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue8, oValueNew]), "Field 1: DT Value");

									oRow5.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [5]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValueNew]), "Field 1: DT Value");

									wait().then(function () {
										// scroll to bottom
										oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
										wait().then(function () {
											oRow6.getDomRefs(true).rowSelector.click();
											assert.ok(oTable.getSelectedIndices().length === 0, "Table: no row selected");
											assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
											assert.ok(!oField._getCurrentProperty("value"), "Field 1: no Value");

											oRow7.getDomRefs(true).rowSelector.click();
											assert.ok(deepEqual(oTable.getSelectedIndices(), [6]), "Table: selected rows changed");
											assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2]), "Field 1: DT Value");

											oRow8.getDomRefs(true).rowSelector.click();
											assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7]), "Table: selected rows changed");
											assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue4]), "Field 1: DT Value");

											oRow9.getDomRefs(true).rowSelector.click();
											assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7, 8]), "Table: selected rows changed");
											assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue4, oValue6]), "Field 1: DT Value");

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

		QUnit.test("08", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
						var oActionHBox = oRow1.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton1 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton1.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton1.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");

						var oRow2 = oTable.getRows()[1];
						assert.ok(deepEqual(oRow2.getBindingContext().getObject(), oValue3), "Row 2: value");
						oActionHBox = oRow2.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
						var oEditOrDisplayButton2 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton2.getIcon() === "sap-icon://display", "Row 2: Display button icon");
						assert.ok(oEditOrDisplayButton2.getVisible(), "Row 2: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 2: Delete button not visible");

						var oRow3 = oTable.getRows()[2];
						assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue5), "Row 3: value");
						oActionHBox = oRow3.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
						var oEditOrDisplayButton3 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton3.getIcon() === "sap-icon://display", "Row 3: Display button icon");
						assert.ok(oEditOrDisplayButton3.getVisible(), "Row 3: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 3: Delete button not visible");

						var oRow4 = oTable.getRows()[3];
						assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue7), "Row 4: value");
						oActionHBox = oRow4.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
						var oEditOrDisplayButton4 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton4.getIcon() === "sap-icon://display", "Row 4: Dispaly button icon");
						assert.ok(oEditOrDisplayButton4.getVisible(), "Row 4: Display button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 4: Delete button not visible");

						var oRow5 = oTable.getRows()[4];
						assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue8), "Row 5: value");
						oActionHBox = oRow5.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 5: Action cell contains 2 buttons");
						var oEditOrDisplayButton5 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton5.getIcon() === "sap-icon://display", "Row 5: Display button icon");
						assert.ok(oEditOrDisplayButton5.getVisible(), "Row 5: Edit button visible");
						oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 5: Delete button not visible");

						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow6 = oTable.getRows()[1];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
								oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditOrDisplayButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditOrDisplayButton6.getVisible(), "Row 6: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								var oRow7 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue2), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 7: Action cell contains 2 buttons");
								var oEditOrDisplayButton7 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton7.getIcon() === "sap-icon://display", "Row 7: Display button icon");
								assert.ok(oEditOrDisplayButton7.getVisible(), "Row 7: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 7: Delete button not visible");

								var oRow8 = oTable.getRows()[3];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue4), "Row 8: value");
								oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 8: Action cell contains 2 buttons");
								var oEditOrDisplayButton8 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton8.getIcon() === "sap-icon://display", "Row 8: Display button icon");
								assert.ok(oEditOrDisplayButton8.getVisible(), "Row 8: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 8: Delete button not visible");

								var oRow9 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow9.getBindingContext().getObject(), oValue6), "Row 9: value");
								oActionHBox = oRow9.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 9: Action cell contains 2 buttons");
								var oEditOrDisplayButton9 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton9.getIcon() === "sap-icon://display", "Row 9: Display button icon");
								assert.ok(oEditOrDisplayButton9.getVisible(), "Row 9: Display button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 9: Delete button not visible");

								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew, oValue4]), "Field 1: DT Value");

								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");

								// scroll to top
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 0;
								wait().then(function () {
									oRow1.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue5, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

									oRow2.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

									oRow3.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [3, 4, 5]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue7, oValue8, oValueNew]), "Field 1: DT Value");

									oRow4.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [4, 5]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue8, oValueNew]), "Field 1: DT Value");

									oRow5.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [5]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValueNew]), "Field 1: DT Value");

									wait().then(function () {
										// scroll to bottom
										oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
										wait().then(function () {
											oRow6.getDomRefs(true).rowSelector.click();
											assert.ok(oTable.getSelectedIndices().length === 0, "Table: no row selected");
											assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
											assert.ok(!oField._getCurrentProperty("value"), "Field 1: no Value");

											oRow7.getDomRefs(true).rowSelector.click();
											assert.ok(deepEqual(oTable.getSelectedIndices(), [6]), "Table: selected rows changed");
											assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2]), "Field 1: DT Value");

											oRow8.getDomRefs(true).rowSelector.click();
											assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7]), "Table: selected rows changed");
											assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue4]), "Field 1: DT Value");

											oRow9.getDomRefs(true).rowSelector.click();
											assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7, 8]), "Table: selected rows changed");
											assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue4, oValue6]), "Field 1: DT Value");

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
	});

	QUnit.module("switch edit mode in popover", {
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
		QUnit.test("not editable value object", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
						var sValue1 = '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#031E48",\n\t"int": 1,\n\t"editable": true,\n\t"number": 3.55,\n\t"_editable": false\n}';
						var oActionHBox = oRow1.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton1 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton1.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton1.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");

						oEditOrDisplayButton1.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(!oCancelButtonInPopover.getVisible(), "Popover: cancel button not visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(oCloseButtonInPopover.getVisible(), "Popover: close button visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field1: Not Editable");
							assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Has value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field2: Not Editable");
							assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Has value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field3: Not Editable");
							assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Has value");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field4: Not Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Has value");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: Switch Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(!oFormField.getEnabled(), "SimpleForm Field5: Not Enabled");
							assert.ok(oFormField.getState(), "SimpleForm field5: Has value");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field6: Not Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Has value");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field7: Not Editable");
							assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field8: Not Editable");
							assert.ok(oFormField.getValue() === sValue1, "SimpleForm field textArea: Has the value");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
							oSwitchModeButton.firePress();
							wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field1: Not Editable");
								assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Label text");
								assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Value");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field2: Not Editable");
								assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Label text");
								assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Value");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field3: Not Editable");
								assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Label text");
								assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Value");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field4: Not Editable");
								assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Label text");
								assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Value");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								assert.ok(!oFormField.getEnabled(), "SimpleForm Field5: Not Enabled");
								assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Label text");
								assert.ok(oFormField.getState(), "SimpleForm field5: Value");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field6: Not Editable");
								assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Label text");
								assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Value");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field7: Not Editable");
								assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Label text");
								assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Value");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field8: Not Editable");
								assert.ok(oFormField.getValue() === sValue1, "SimpleForm field textArea: Has the value");
								oSwitchModeButton.firePress();
								wait().then(function () {
									oContents = oSimpleForm.getContent();
									oFormLabel = oContents[0];
									oFormField = oContents[1];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field1: Not Editable");
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Label text");
									assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Value");
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field2: Not Editable");
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Label text");
									assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Value");
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field3: Not Editable");
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Label text");
									assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Value");
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field4: Not Editable");
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Label text");
									assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Value");
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.ok(!oFormField.getEnabled(), "SimpleForm Field5: Not Enabled");
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Label text");
									assert.ok(oFormField.getState(), "SimpleForm field5: Value");
									oFormLabel = oContents[10];
									oFormField = oContents[11];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field6: Not Editable");
									assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Label text");
									assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Value");
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field7: Not Editable");
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Label text");
									assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Value");
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field8: Not Editable");
									assert.ok(oFormField.getValue() === sValue1, "SimpleForm field textArea: Has the value");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("editable value object", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
							wait().then(function () {
								var oRow6 = oTable.getRows()[1];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
								var oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditOrDisplayButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditOrDisplayButton6.getVisible(), "Row 6: Edit button visible");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");
								oEditOrDisplayButton6.firePress();
								wait().then(function () {
									var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
									assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
									var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
									assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
									var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
									assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.ok(oContents.length === 16, "SimpleForm: length");
									assert.ok(oContents[15].getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#E69A17",\n\t"int": 3\n}', "SimpleForm field textArea: Has the value");
									var oFormLabel = oContents[0];
									var oFormField = oContents[1];
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
									assert.ok(oFormField.getValue() === "keynew", "SimpleForm field1: Has value");
									oFormField.setValue("key01");
									oFormField.fireChange({ value: "key01" });
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
									assert.ok(oFormField.getValue() === "sap-icon://zoom-in", "SimpleForm field2: Has value");
									oFormField.setValue("sap-icon://accept");
									oFormField.fireChange({ value: "sap-icon://accept" });
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
									assert.ok(oFormField.getValue() === "textnew", "SimpleForm field3: Has value");
									oFormField.setValue("text01");
									oFormField.fireChange({ value: "text01" });
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
									assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
									oFormField.setValue("https://sapui5.hana.ondemand.com/06");
									oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: Switch Field");
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
									assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Has value");
									oFormField.setValue("1");
									oFormField.fireChange({value: "1"});
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
									assert.ok(oFormField.getValue() === "", "SimpleForm field7: Has value");
									oFormField.setValue("0.55");
									oFormField.fireChange({ value: "0.55"});
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
									var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
										assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#E69A17",\n\t"int": 1,\n\t"editable": true,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
										var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
										oFormField.setValue(sNewValue);
										oFormField.fireChange({ value: sNewValue});
										oSwitchModeButton.firePress();
										wait().then(function () {
											oContents = oSimpleForm.getContent();
											oFormLabel = oContents[0];
											oFormField = oContents[1];
											assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
											assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
											assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Label text");
											assert.ok(oFormField.getValue() === "key01 2", "SimpleForm field1: Value changed");
											oFormLabel = oContents[2];
											oFormField = oContents[3];
											assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
											assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
											assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Label text");
											assert.ok(oFormField.getValue() === "sap-icon://accept 2", "SimpleForm field2: Value changed");
											oFormLabel = oContents[4];
											oFormField = oContents[5];
											assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
											assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
											assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Label text");
											assert.ok(oFormField.getValue() === "text01 2", "SimpleForm field3: Value changed");
											oFormLabel = oContents[6];
											oFormField = oContents[7];
											assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
											assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
											assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Label text");
											assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06 2", "SimpleForm field4: Value changed");
											oFormLabel = oContents[8];
											oFormField = oContents[9];
											assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
											assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
											assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Label text");
											assert.ok(!oFormField.getState(), "SimpleForm field5: Value changed");
											oFormLabel = oContents[10];
											oFormField = oContents[11];
											assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
											assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
											assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Label text");
											assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Value changed");
											oFormLabel = oContents[12];
											oFormField = oContents[13];
											assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
											assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
											assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Label text");
											assert.ok(oFormField.getValue() === "5.6", "SimpleForm field7: Value changed");
											oFormLabel = oContents[14];
											oFormField = oContents[15];
											assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
											assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
											assert.ok(oFormField.getValue() === sNewValue, "SimpleForm field5: Value changed");
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
	});

	QUnit.module("selectAll and deselectAll", {
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
		QUnit.test("01", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oRow1 = oTable.getRows()[0];
						assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
						var oActionHBox = oRow1.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton1 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton1.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton1.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");

						oRow1.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue5, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

						// selectAll
						oTable.$("selall").trigger("click");
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8]), "Table: selected rows changed");
						assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew, oValue2, oValue4, oValue6]), "Field 1: DT Value");
						// deselectAll
						oTable.$("selall").trigger("click");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
						resolve();

					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("03", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oRow3 = oTable.getRows()[2];
						assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue5), "Row 3: value");
						var oActionHBox = oRow3.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
						var oEditOrDisplayButton3 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton3.getIcon() === "sap-icon://display", "Row 3: Display button icon");
						assert.ok(oEditOrDisplayButton3.getVisible(), "Row 3: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 3: Delete button not visible");

						oRow3.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3, 4, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue7, oValue8, oValueNew]), "Field 1: DT Value");

						// selectAll
						oTable.$("selall").trigger("click");
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8]), "Table: selected rows changed");
						assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew, oValue2, oValue4, oValue6]), "Field 1: DT Value");
						// deselectAll
						oTable.$("selall").trigger("click");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
						resolve();

					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("05", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oRow5 = oTable.getRows()[4];
						assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue8), "Row 5: value");
						var oActionHBox = oRow5.getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 5: Action cell contains 2 buttons");
						var oEditOrDisplayButton5 = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton5.getIcon() === "sap-icon://display", "Row 5: Display button icon");
						assert.ok(oEditOrDisplayButton5.getVisible(), "Row 5: Edit button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 5: Delete button not visible");

						oRow5.getDomRefs(true).rowSelector.click();
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 5]), "Table: selected rows changed");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValueNew]), "Field 1: DT Value");

						// selectAll
						oTable.$("selall").trigger("click");
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8]), "Table: selected rows changed");
						assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew, oValue2, oValue4, oValue6]), "Field 1: DT Value");
						// deselectAll
						oTable.$("selall").trigger("click");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("06", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow6 = oTable.getRows()[1];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
								var oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditOrDisplayButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditOrDisplayButton6.getVisible(), "Row 6: Edit button visible");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8]), "Field 1: DT Value");

								// selectAll
								oTable.$("selall").trigger("click");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8]), "Table: selected rows changed");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew, oValue2, oValue4, oValue6]), "Field 1: DT Value");
								// deselectAll
								oTable.$("selall").trigger("click");
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
								resolve();
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("08", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow8 = oTable.getRows()[3];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue4), "Row 8: value");
								var oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 8: Action cell contains 2 buttons");
								var oEditOrDisplayButton8 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton8.getIcon() === "sap-icon://display", "Row 8: Display button icon");
								assert.ok(oEditOrDisplayButton8.getVisible(), "Row 8: Display button visible");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(!oDeleteButton.getVisible(), "Row 8: Delete button not visible");

								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew, oValue4]), "Field 1: DT Value");

								// selectAll
								oTable.$("selall").trigger("click");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8]), "Table: selected rows changed");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew, oValue2, oValue4, oValue6]), "Field 1: DT Value");
								// deselectAll
								oTable.$("selall").trigger("click");
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
								resolve();
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});
	});

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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
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
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							wait().then(function () {
								var oNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
								assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), oNewObject), "Table: new row data");
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not change");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								// scroll to the bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									var oNewRow = oTable.getRows()[4];
									assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewObject), "Table: new row in the bottom");
									var oActionHBox = oNewRow.getCells()[7];
									assert.ok(oActionHBox.getItems().length = 2, "New row: Action cell contains 2 buttons");
									var oEditOrDisplayButton8 = oActionHBox.getItems()[0];
									assert.ok(oEditOrDisplayButton8.getIcon() === "sap-icon://edit", "New row: Edit button icon");
									assert.ok(oEditOrDisplayButton8.getVisible(), "New row: Edit button visible");
									var oDeleteButton = oActionHBox.getItems()[1];
									assert.ok(oDeleteButton.getVisible(), "new row: Delete button visible");
									oNewRow.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 9]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew, oNewObject]), "Field 1: DT Value");
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
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
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not change");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
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
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "key01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field8: Has value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									var oNewObject = {"icon": "sap-icon://accept","text": "text01","url": "https://sapui5.hana.ondemand.com/06","number": 0.55,"key": "key01","editable": true,"int": 1};
									assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
									assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), oNewObject), "Table: new row data");
									assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not change");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									// scroll to the bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oNewRow = oTable.getRows()[4];
										assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewObject), "Table: new row in the bottom");
										var oActionHBox = oNewRow.getCells()[7];
										assert.ok(oActionHBox.getItems().length = 2, "New row: Action cell contains 2 buttons");
										var oEditOrDisplayButton8 = oActionHBox.getItems()[0];
										assert.ok(oEditOrDisplayButton8.getIcon() === "sap-icon://edit", "New row: Edit button icon");
										assert.ok(oEditOrDisplayButton8.getVisible(), "New row: Edit button visible");
										var oDeleteButton = oActionHBox.getItems()[1];
										assert.ok(oDeleteButton.getVisible(), "new row: Delete button visible");
										oNewRow.getDomRefs(true).rowSelector.click();
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 9]), "Table: selected rows changed");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew, oNewObject]), "Field 1: DT Value");
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
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
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "key01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field8: Has value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oCancelButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
									assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not change");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
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
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "key01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field8: Has value");
								var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								wait().then(function () {
									var oNewObject = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55};
									assert.ok(oTable.getBinding().getCount() === 10, "Table: value length is 10");
									assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), oNewObject), "Table: new row data");
									assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not change");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									// scroll to the bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oNewRow = oTable.getRows()[4];
										assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewObject), "Table: new row in the bottom");
										var oActionHBox = oNewRow.getCells()[7];
										assert.ok(oActionHBox.getItems().length = 2, "New row: Action cell contains 2 buttons");
										var oEditOrDisplayButton8 = oActionHBox.getItems()[0];
										assert.ok(oEditOrDisplayButton8.getIcon() === "sap-icon://edit", "New row: Edit button icon");
										assert.ok(oEditOrDisplayButton8.getVisible(), "New row: Edit button visible");
										var oDeleteButton = oActionHBox.getItems()[1];
										assert.ok(oDeleteButton.getVisible(), "new row: Delete button visible");
										oNewRow.getDomRefs(true).rowSelector.click();
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 9]), "Table: selected rows changed");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew, oNewObject]), "Field 1: DT Value");
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.ok(oContents.length === 16, "SimpleForm: length");
							assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
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
							var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
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
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "key01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field8: Has value");
								var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oCancelButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
									assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not change");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("update", {
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
		QUnit.test("update with property fields in popover", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
							wait().then(function () {
								var oRow6 = oTable.getRows()[1];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
								var oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditOrDisplayButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditOrDisplayButton6.getVisible(), "Row 6: Edit button visible");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");
								oEditOrDisplayButton6.firePress();
								wait().then(function () {
									var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
									assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
									var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
									assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
									var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
									assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.ok(oContents.length === 16, "SimpleForm: length");
									assert.ok(oContents[15].getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#E69A17",\n\t"int": 3\n}', "SimpleForm field textArea: Has the value");
									var oFormLabel = oContents[0];
									var oFormField = oContents[1];
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
									assert.ok(oFormField.getValue() === "keynew", "SimpleForm field1: Has value");
									oFormField.setValue("key01");
									oFormField.fireChange({ value: "key01" });
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
									assert.ok(oFormField.getValue() === "sap-icon://zoom-in", "SimpleForm field2: Has value");
									oFormField.setValue("sap-icon://accept");
									oFormField.fireChange({ value: "sap-icon://accept" });
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
									assert.ok(oFormField.getValue() === "textnew", "SimpleForm field3: Has value");
									oFormField.setValue("text01");
									oFormField.fireChange({ value: "text01" });
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
									assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
									oFormField.setValue("https://sapui5.hana.ondemand.com/06");
									oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: Switch Field");
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
									assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Has value");
									oFormField.setValue("1");
									oFormField.fireChange({value: "1"});
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
									assert.ok(oFormField.getValue() === "", "SimpleForm field7: Has value");
									oFormField.setValue("0.55");
									oFormField.fireChange({ value: "0.55"});
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
									assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#E69A17",\n\t"int": 1,\n\t"editable": true,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
									oUpdateButtonInPopover.firePress();
									wait().then(function () {
										var oNewValue = {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#E69A17", "int": 1, "editable": true, "number": 0.55};
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oNewValue]), "Field 1: Value updated");
										assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
										assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
										assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oNewValue), "Row 6: value");
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update with property fields in popover but cancel", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
							wait().then(function () {
								var oRow6 = oTable.getRows()[1];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
								var oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditOrDisplayButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditOrDisplayButton6.getVisible(), "Row 6: Edit button visible");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");
								oEditOrDisplayButton6.firePress();
								wait().then(function () {
									var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
									assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
									var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
									assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
									var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
									assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.ok(oContents.length === 16, "SimpleForm: length");
									assert.ok(oContents[15].getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#E69A17",\n\t"int": 3\n}', "SimpleForm field textArea: Has the value");
									var oFormLabel = oContents[0];
									var oFormField = oContents[1];
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
									assert.ok(oFormField.getValue() === "keynew", "SimpleForm field1: Has value");
									oFormField.setValue("key01");
									oFormField.fireChange({ value: "key01" });
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
									assert.ok(oFormField.getValue() === "sap-icon://zoom-in", "SimpleForm field2: Has value");
									oFormField.setValue("sap-icon://accept");
									oFormField.fireChange({ value: "sap-icon://accept" });
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
									assert.ok(oFormField.getValue() === "textnew", "SimpleForm field3: Has value");
									oFormField.setValue("text01");
									oFormField.fireChange({ value: "text01" });
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
									assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
									oFormField.setValue("https://sapui5.hana.ondemand.com/06");
									oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: Switch Field");
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
									assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Has value");
									oFormField.setValue("1");
									oFormField.fireChange({value: "1"});
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
									assert.ok(oFormField.getValue() === "", "SimpleForm field7: Has value");
									oFormField.setValue("0.55");
									oFormField.fireChange({ value: "0.55"});
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
									assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#E69A17",\n\t"int": 1,\n\t"editable": true,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
									oCancelButtonInPopover.firePress();
									wait().then(function () {
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew]), "Field 1: Value updated");
										assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
										assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
										assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update with TextArea field in popover", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
							wait().then(function () {
								var oRow6 = oTable.getRows()[1];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
								var oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditOrDisplayButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditOrDisplayButton6.getVisible(), "Row 6: Edit button visible");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");
								oEditOrDisplayButton6.firePress();
								wait().then(function () {
									var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
									assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
									var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
									assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
									var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
									assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.ok(oContents.length === 16, "SimpleForm: length");
									assert.ok(oContents[15].getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#E69A17",\n\t"int": 3\n}', "SimpleForm field textArea: Has the value");
									var oFormLabel = oContents[0];
									var oFormField = oContents[1];
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
									assert.ok(oFormField.getValue() === "keynew", "SimpleForm field1: Has value");
									oFormField.setValue("key01");
									oFormField.fireChange({ value: "key01" });
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
									assert.ok(oFormField.getValue() === "sap-icon://zoom-in", "SimpleForm field2: Has value");
									oFormField.setValue("sap-icon://accept");
									oFormField.fireChange({ value: "sap-icon://accept" });
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
									assert.ok(oFormField.getValue() === "textnew", "SimpleForm field3: Has value");
									oFormField.setValue("text01");
									oFormField.fireChange({ value: "text01" });
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
									assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
									oFormField.setValue("https://sapui5.hana.ondemand.com/06");
									oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: Switch Field");
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
									assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Has value");
									oFormField.setValue("1");
									oFormField.fireChange({value: "1"});
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
									assert.ok(oFormField.getValue() === "", "SimpleForm field7: Has value");
									oFormField.setValue("0.55");
									oFormField.fireChange({ value: "0.55"});
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
									assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#E69A17",\n\t"int": 1,\n\t"editable": true,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
									var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
									oSwitchModeButton.firePress();
									wait().then(function () {
										var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
										oFormField.setValue(sNewValue);
										oFormField.fireChange({ value: sNewValue});
										oUpdateButtonInPopover.firePress();
										wait().then(function () {
											var oNewValue = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55};
											assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oNewValue]), "Field 1: Value updated");
											assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
											assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
											assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oNewValue), "Row 6: value");
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

		QUnit.test("update with TextArea field in popover but cancel", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
							wait().then(function () {
								var oRow6 = oTable.getRows()[1];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
								var oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditOrDisplayButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditOrDisplayButton6.getVisible(), "Row 6: Edit button visible");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");
								oEditOrDisplayButton6.firePress();
								wait().then(function () {
									var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
									assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
									var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
									assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
									var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
									assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.ok(oContents.length === 16, "SimpleForm: length");
									assert.ok(oContents[15].getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#E69A17",\n\t"int": 3\n}', "SimpleForm field textArea: Has the value");
									var oFormLabel = oContents[0];
									var oFormField = oContents[1];
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
									assert.ok(oFormField.getValue() === "keynew", "SimpleForm field1: Has value");
									oFormField.setValue("key01");
									oFormField.fireChange({ value: "key01" });
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
									assert.ok(oFormField.getValue() === "sap-icon://zoom-in", "SimpleForm field2: Has value");
									oFormField.setValue("sap-icon://accept");
									oFormField.fireChange({ value: "sap-icon://accept" });
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
									assert.ok(oFormField.getValue() === "textnew", "SimpleForm field3: Has value");
									oFormField.setValue("text01");
									oFormField.fireChange({ value: "text01" });
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
									assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
									oFormField.setValue("https://sapui5.hana.ondemand.com/06");
									oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: Switch Field");
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
									assert.ok(oFormField.getValue() === "3", "SimpleForm field6: Has value");
									oFormField.setValue("1");
									oFormField.fireChange({value: "1"});
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
									assert.ok(oFormField.getValue() === "", "SimpleForm field7: Has value");
									oFormField.setValue("0.55");
									oFormField.fireChange({ value: "0.55"});
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
									assert.ok(oFormField.getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#E69A17",\n\t"int": 1,\n\t"editable": true,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
									var oSwitchModeButton = oField._oObjectDetailsPopover.getCustomHeader().getContent()[2];
									oSwitchModeButton.firePress();
									wait().then(function () {
										var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
										oFormField.setValue(sNewValue);
										oFormField.fireChange({ value: sNewValue});
										oCancelButtonInPopover.firePress();
										wait().then(function () {
											assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew]), "Field 1: Value updated");
											assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
											assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
											assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
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
	});

	QUnit.module("delete", {
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
		QUnit.test("delete selected object", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow6 = oTable.getRows()[1];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
								var oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditOrDisplayButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditOrDisplayButton6.getVisible(), "Row 6: Edit button visible");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								var oRow7 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue2), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 7: Action cell contains 2 buttons");
								var oEditOrDisplayButton7 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton7.getIcon() === "sap-icon://display", "Row 7: Display button icon");
								assert.ok(oEditOrDisplayButton7.getVisible(), "Row 7: Display button visible");

								oRow7.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew, oValue2]), "Field 1: DT Value");

								oDeleteButton.firePress();
								wait().then(function () {
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValue2]), "Field 1: Value updated");
									assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5]), "Table: selected row index change");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					var oColumns = oTable.getColumns();
					assert.ok(oColumns.length === 8, "Table: column number is 8");
					assert.ok(oColumns[0].getLabel().getText() === "Key", "Table: column 'Key'");
					assert.ok(oColumns[1].getLabel().getText() === "Icon", "Table: column 'Icon'");
					assert.ok(oColumns[2].getLabel().getText() === "Text", "Table: column 'Text'");
					assert.ok(oColumns[3].getLabel().getText() === "URL Link", "Table: column 'URL Link'");
					assert.ok(oColumns[4].getLabel().getText() === "Editable", "Table: column 'Editable'");
					assert.ok(oColumns[5].getLabel().getText() === "Integer", "Table: column 'Integer'");
					assert.ok(oColumns[6].getLabel().getText() === "Number", "Table: column 'Number'");
					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
						assert.ok(oTable.getBinding().getCount() === (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow6 = oTable.getRows()[1];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValueNew), "Row 6: value");
								var oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditOrDisplayButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditOrDisplayButton6.getVisible(), "Row 6: Edit button visible");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								var oRow7 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue2), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 7: Action cell contains 2 buttons");
								var oEditOrDisplayButton7 = oActionHBox.getItems()[0];
								assert.ok(oEditOrDisplayButton7.getIcon() === "sap-icon://display", "Row 7: Display button icon");
								assert.ok(oEditOrDisplayButton7.getVisible(), "Row 7: Display button visible");

								oRow7.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValueNew, oValue2]), "Field 1: DT Value");

								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 6]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValue2]), "Field 1: DT Value");

								oDeleteButton.firePress();
								wait().then(function () {
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue5, oValue7, oValue8, oValue2]), "Field 1: Value updated");
									assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5]), "Table: selected row index change");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("filter", {
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
		QUnit.test("filter via api", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						var oActionHBox = oTable.getRows()[0].getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");
						var oKeyColumn = oTable.getColumns()[0];
						oTable.filter(oKeyColumn, "n");
						// check that the column menu filter input field was updated
						var oMenu = oKeyColumn.getMenu();
						// open and close the menu to let it generate its items
						oMenu.open();
						oMenu.close();
						wait().then(function () {
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount length is 1");
							assert.ok( oTable.getSelectedIndices()[0] === 0, "Table: selected row");
							assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
							oTable.filter(oKeyColumn, "n*");
							assert.ok(oKeyColumn.getFiltered(), "Table: Column Key is filtered");
							assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering n*");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected row hided");
							oTable.filter(oKeyColumn, "key0*");
							assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering key0*");
							oTable.filter(oKeyColumn, "*01");
							assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering *01");
							oTable.filter(oKeyColumn, "*0*");
							assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering *0*");
							oTable.filter(oKeyColumn, "");
							wait().then(function () {
								assert.ok(!oKeyColumn.getFiltered(), "Table: Column Key is not filtered anymore");
								assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
								var oTextColumn = oTable.getColumns()[2];
								oTable.filter(oTextColumn, "n");
								// check that the column menu filter input field was updated
								oMenu = oTextColumn.getMenu();
								// open and close the menu to let it generate its items
								oMenu.open();
								oMenu.close();
								wait().then(function () {
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
									assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount length is 1");
									assert.ok( oTable.getSelectedIndices()[0] === 0, "Table: selected row");
									assert.ok(oTextColumn.getFiltered(), "Table: Column Text is filtered");
									oTable.filter(oTextColumn, "*n");
									assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering *n");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
									oTable.filter(oTextColumn, "*0*");
									assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering *0*");
									wait().then(function () {
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4]), "Table: all rows selected");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
										oTable.filter(oTextColumn, "01");
										wait().then(function () {
											assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering 01");
											assert.ok( oTable.getSelectedIndices()[0] === 0, "Table: selected row");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
											oTable.filter(oTextColumn, "");
											wait().then(function () {
												assert.ok(!oTextColumn.getFiltered(), "Table: Column Text is not filtered anymore");
												assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing all filters");
												assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
												assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
												resolve();
											});
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						var oActionHBox = oTable.getRows()[0].getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");
						var oURLColumn = oTable.getColumns()[3];
						var oIntColumn = oTable.getColumns()[5];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 6, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows");
							oMenu = oIntColumn.getMenu();
							// open the column filter menu, input filter value, close the menu.
							oMenu.open();
							oMenu.getItems()[0].setValue("4");
							oMenu.getItems()[0].fireSelect();
							oMenu.close();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering column Integer with '4'");
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
								// open the column filter menu, input filter value, close the menu.
								oMenu.open();
								oMenu.getItems()[0].setValue(">4");
								oMenu.getItems()[0].fireSelect();
								oMenu.close();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 2, "Table: RowCount after filtering column Integer with '>4'");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0]), "Table: selected rows");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");

									// clear all the filters
									oClearFilterButton.firePress();
									wait().then(function () {
										assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing all the filters");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
										assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
										resolve();
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("select and deselect", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						var oActionHBox = oTable.getRows()[0].getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");
						var oURLColumn = oTable.getColumns()[3];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 6, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows");

							var oRow5 = oTable.getRows()[4];
							assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue4), "Table: row5 value");
							oRow5.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue8, oValueNew, oValue4, oValue5, oValue7]), "Field 1: Value changed");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4]), "Table: selected rows updated");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

							wait().then(function () {
								// scroll to bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									var oRow6 = oTable.getRows()[4];
									assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValue6), "Table: row6 value");
									oRow6.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue8, oValueNew, oValue4, oValue6, oValue5, oValue7]), "Field 1: Value changed");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5]), "Table: selected rows updated");
									assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("selectAll and deselectAll", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						var oActionHBox = oTable.getRows()[0].getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");
						var oURLColumn = oTable.getColumns()[3];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 6, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

							// selectAll
							oTable.$("selall").trigger("click");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5]), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue8, oValueNew, oValue4, oValue6, oValue5, oValue7]), "Field 1: DT Value");

							// deselectAll
							oTable.$("selall").trigger("click");
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7]), "Field 1: Value after selection change");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add 01 - match the filter key", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						var oActionHBox = oTable.getRows()[0].getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");
						var oURLColumn = oTable.getColumns()[3];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 6, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

							var oToolbar = oTable.getToolbar();
							assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
							var oAddButton = oToolbar.getContent()[1];
							assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
							oAddButton.firePress();
							wait().then(function () {
								var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
								var oContents = oSimpleForm.getContent();
								assert.ok(oContents.length === 16, "SimpleForm: length");
								assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
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
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "https://",\n\t"number": 0.5\n}', "SimpleForm field8: Has updated value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								oAddButtonInPopover.firePress();
								wait().then(function () {
									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
										assert.ok(deepEqual(oTable.getBinding().getContexts()[6].getObject(), {"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5}), "Table: new row is added to the end");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed");
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
										// clear all the filters
										oClearFilterButton.firePress();
										wait().then(function () {
											assert.ok(oTable.getBinding().getCount() === 10, "Table: RowCount after removing filter");
											assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: rows selected");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
											// scroll to bottom
											oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
											wait().then(function () {
												assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), {"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5}), "Table: new row is added to the end");
												assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
												resolve();
											});
										});
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("add 02 - not match the filter key", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						var oActionHBox = oTable.getRows()[0].getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");
						var oURLColumn = oTable.getColumns()[3];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 6, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

							var oToolbar = oTable.getToolbar();
							assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
							var oAddButton = oToolbar.getContent()[1];
							assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
							oAddButton.firePress();
							wait().then(function () {
								var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
								var oContents = oSimpleForm.getContent();
								assert.ok(oContents.length === 16, "SimpleForm: length");
								assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
								var oFormLabel = oContents[6];
								var oFormField = oContents[7];
								assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
								assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field8: Has updated value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								oAddButtonInPopover.firePress();
								wait().then(function () {
									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										assert.ok(oTable.getBinding().getCount() === 6, "Table: value length is 6");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed");
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
										// clear all the filters
										oClearFilterButton.firePress();
										wait().then(function () {
											assert.ok(oTable.getBinding().getCount() === 10, "Table: RowCount after removing filter");
											assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: rows selected");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
											// scroll to bottom
											oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
											wait().then(function () {
												assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5}), "Table: new row is added to the end");
												assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
												resolve();
											});
										});
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update selected object", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						var oActionHBox = oTable.getRows()[0].getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");
						var oURLColumn = oTable.getColumns()[3];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("http:");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering column URL with 'http:'");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

							var oToolbar = oTable.getToolbar();
							assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
							var oAddButton = oToolbar.getContent()[1];
							assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
							oAddButton.firePress();
							wait().then(function () {
								var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
								var oContents = oSimpleForm.getContent();
								assert.ok(oContents.length === 16, "SimpleForm: length");
								assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
									var oNewRow = oTable.getRows()[3];
									var oNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
									assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewObject), "Table: new row is added to the end");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

									oNewRow.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oNewObject, oValue1, oValue3, oValue8, oValueNew]), "Field 1: Value changed");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3]), "Table: selected rows updated");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

									var oActionHBox = oNewRow.getCells()[7];
									assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
									var oEditOrDisplayButton = oActionHBox.getItems()[0];
									oEditOrDisplayButton.firePress();
									wait().then(function () {
										var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
										assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
										var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
										assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
										var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
										assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
										var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
										assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
										var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
										assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
										var oContents = oSimpleForm.getContent();
										assert.ok(oContents.length === 16, "SimpleForm: length");
										assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has the value");
										var oFormLabel = oContents[0];
										var oFormField = oContents[1];
										assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
										assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
										assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
										assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
										assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
										assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has value");
										oFormField.setValue("keynew");
										oFormField.fireChange({ value: "keynew" });
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
										oFormField.setValue("textnew");
										oFormField.fireChange({ value: "textnew" });
										oFormLabel = oContents[6];
										oFormField = oContents[7];
										assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
										assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
										assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
										assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
										assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
										assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
										oFormField.setValue("http://sapui5.hana.ondemand.com/06");
										oFormField.fireChange({ value: "http://sapui5.hana.ondemand.com/06" });
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
										assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has value");
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
										assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "textnew",\n\t"url": "http://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "keynew",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field textArea: Has changed value");
										oUpdateButtonInPopover.firePress();
										wait().then(function () {
											oNewObject = {"text": "textnew", "key": "keynew", "url": "http://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "int": 1, "editable": true, "number": 0.55};
											assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oNewObject, oValue1, oValue3, oValue8, oValueNew]), "Field 1: Value updated");
											assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
											assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3]), "Table: selected row index not change");
											assert.ok(deepEqual(oTable.getBinding().getContexts()[3].getObject(), oNewObject), "Table: selected row updated");
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

		QUnit.test("update selected object, but been filtered out", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						var oActionHBox = oTable.getRows()[0].getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");
						var oURLColumn = oTable.getColumns()[3];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("http:");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering column URL with 'http:'");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

							var oToolbar = oTable.getToolbar();
							assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
							var oAddButton = oToolbar.getContent()[1];
							assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
							oAddButton.firePress();
							wait().then(function () {
								var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
								var oContents = oSimpleForm.getContent();
								assert.ok(oContents.length === 16, "SimpleForm: length");
								assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
									var oNewRow = oTable.getRows()[3];
									var oNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
									assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewObject), "Table: new row is added to the end");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

									oNewRow.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oNewObject, oValue1, oValue3, oValue8, oValueNew]), "Field 1: Value changed");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3]), "Table: selected rows updated");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

									var oActionHBox = oNewRow.getCells()[7];
									assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
									var oEditOrDisplayButton = oActionHBox.getItems()[0];
									oEditOrDisplayButton.firePress();
									wait().then(function () {
										var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
										assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
										var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
										assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
										var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
										assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
										var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
										assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
										var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
										assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
										var oContents = oSimpleForm.getContent();
										assert.ok(oContents.length === 16, "SimpleForm: length");
										assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has the value");
										var oFormLabel = oContents[0];
										var oFormField = oContents[1];
										assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
										assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
										assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
										assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
										assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
										assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has value");
										oFormField.setValue("keynew");
										oFormField.fireChange({ value: "keynew" });
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
										oFormField.setValue("textnew");
										oFormField.fireChange({ value: "textnew" });
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
										assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has value");
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
										assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "textnew",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "keynew",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field textArea: Has changed value");
										oUpdateButtonInPopover.firePress();
										wait().then(function () {
											oNewObject = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "int": 1, "editable": true, "number": 0.55};
											assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oValue1, oValue3, oValue8, oValueNew, oNewObject]), "Field 1: Value updated");
											assert.ok(oTable.getBinding().getCount() === 3, "Table: value length is 3");
											assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected row index change");
											// clear all the filters
											oClearFilterButton.firePress();
											wait().then(function () {
												assert.ok(oTable.getBinding().getCount() === 10, "Table: RowCount after removing filter");
												// scroll to bottom
												oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
												wait().then(function () {
													assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 9]), "Table: selected row index");
													assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oValue1, oValue3, oValue8, oValueNew, oNewObject]), "Field 1: Value updated");
													assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), oNewObject), "Table: new row is added to the end");
													resolve();
												});
											});
										});
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update not selected object", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						var oActionHBox = oTable.getRows()[0].getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");
						var oURLColumn = oTable.getColumns()[3];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("http:");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering column URL with 'http:'");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

							var oToolbar = oTable.getToolbar();
							assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
							var oAddButton = oToolbar.getContent()[1];
							assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
							oAddButton.firePress();
							wait().then(function () {
								var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
								var oContents = oSimpleForm.getContent();
								assert.ok(oContents.length === 16, "SimpleForm: length");
								assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
									var oNewRow = oTable.getRows()[3];
									var oNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
									assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewObject), "Table: new row is added to the end");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

									var oActionHBox = oNewRow.getCells()[7];
									assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
									var oEditOrDisplayButton = oActionHBox.getItems()[0];
									oEditOrDisplayButton.firePress();
									wait().then(function () {
										var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
										assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
										var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
										assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
										var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
										assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
										var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
										assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
										var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
										assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
										var oContents = oSimpleForm.getContent();
										assert.ok(oContents.length === 16, "SimpleForm: length");
										assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has the value");
										var oFormLabel = oContents[0];
										var oFormField = oContents[1];
										assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
										assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
										assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
										assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
										assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
										assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has value");
										oFormField.setValue("keynew");
										oFormField.fireChange({ value: "keynew" });
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
										oFormField.setValue("textnew");
										oFormField.fireChange({ value: "textnew" });
										oFormLabel = oContents[6];
										oFormField = oContents[7];
										assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
										assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
										assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
										assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
										assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
										assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
										oFormField.setValue("http://sapui5.hana.ondemand.com/06");
										oFormField.fireChange({ value: "http://sapui5.hana.ondemand.com/06" });
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
										assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has value");
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
										assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "textnew",\n\t"url": "http://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "keynew",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field textArea: Has changed value");
										oUpdateButtonInPopover.firePress();
										wait().then(function () {
											oNewObject = {"text": "textnew", "key": "keynew", "url": "http://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "int": 1, "editable": true, "number": 0.55};
											assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value updated");
											assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
											assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected row index not change");
											assert.ok(deepEqual(oTable.getBinding().getContexts()[3].getObject(), oNewObject), "Table: row updated");
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

		QUnit.test("update not selected object, but been filtered out", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						var oActionHBox = oTable.getRows()[0].getCells()[7];
						assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
						var oEditOrDisplayButton = oActionHBox.getItems()[0];
						assert.ok(oEditOrDisplayButton.getIcon() === "sap-icon://display", "Row 1: Display button icon");
						assert.ok(oEditOrDisplayButton.getVisible(), "Row 1: Display button visible");
						var oDeleteButton = oActionHBox.getItems()[1];
						assert.ok(!oDeleteButton.getVisible(), "Row 1: Delete button not visible");
						var oURLColumn = oTable.getColumns()[3];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("http:");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering column URL with 'http:'");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

							var oToolbar = oTable.getToolbar();
							assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
							var oAddButton = oToolbar.getContent()[1];
							assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
							oAddButton.firePress();
							wait().then(function () {
								var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
								var oContents = oSimpleForm.getContent();
								assert.ok(oContents.length === 16, "SimpleForm: length");
								assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
									var oNewRow = oTable.getRows()[3];
									var oNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
									assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewObject), "Table: new row is added to the end");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

									var oActionHBox = oNewRow.getCells()[7];
									assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
									var oEditOrDisplayButton = oActionHBox.getItems()[0];
									oEditOrDisplayButton.firePress();
									wait().then(function () {
										var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
										assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
										var oUpdateButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[2];
										assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
										var oCancelButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[3];
										assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
										var oCloseButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[4];
										assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
										var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
										assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
										var oContents = oSimpleForm.getContent();
										assert.ok(oContents.length === 16, "SimpleForm: length");
										assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has the value");
										var oFormLabel = oContents[0];
										var oFormField = oContents[1];
										assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
										assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
										assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
										assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
										assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
										assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has value");
										oFormField.setValue("keynew");
										oFormField.fireChange({ value: "keynew" });
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
										oFormField.setValue("textnew");
										oFormField.fireChange({ value: "textnew" });
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
										assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has value");
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
										assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "textnew",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "keynew",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field textArea: Has changed value");
										oUpdateButtonInPopover.firePress();
										wait().then(function () {
											oNewObject = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "int": 1, "editable": true, "number": 0.55};
											assert.ok(oTable.getBinding().getCount() === 3, "Table: value length is 3");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed");
											assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows");
											assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
											// clear all the filters
											oClearFilterButton.firePress();
											wait().then(function () {
												assert.ok(oTable.getBinding().getCount() === 10, "Table: RowCount after removing filter");
												// scroll to bottom
												oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
												wait().then(function () {
													assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5]), "Table: selected row index");
													assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed");
													assert.ok(deepEqual(oTable.getBinding().getContexts()[9].getObject(), oNewObject), "Table: new row is added to the end");
													resolve();
												});
											});
										});
									});
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						var oURLColumn = oTable.getColumns()[3];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 6, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

							var oToolbar = oTable.getToolbar();
							assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
							var oAddButton = oToolbar.getContent()[1];
							assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
							oAddButton.firePress();
							wait().then(function () {
								var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
								var oContents = oSimpleForm.getContent();
								assert.ok(oContents.length === 16, "SimpleForm: length");
								assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
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
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "https://",\n\t"number": 0.5\n}', "SimpleForm field8: Has updated value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								oAddButtonInPopover.firePress();
								wait().then(function () {
									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oNewObject = {"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5};
										assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
										assert.ok(deepEqual(oTable.getBinding().getContexts()[6].getObject(), oNewObject), "Table: new row is added to the end");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed");
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

										var oNewRow = oTable.getRows()[4];
										oNewRow.getDomRefs(true).rowSelector.click();
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue8, oValueNew, oNewObject, oValue5, oValue7]), "Field 1: Value changed");
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 6]), "Table: selected rows updated");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

										var oDeletedRow = oTable.getRows()[1];
										assert.ok(deepEqual(oDeletedRow.getBindingContext().getObject(), oValueNew), "Table: deleted row value");
										var oActionHBox = oDeletedRow.getCells()[7];
										assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
										var oDeleteButton = oActionHBox.getItems()[1];
										assert.ok(oDeleteButton.getVisible(), "Row: Delete button visible");
										oDeleteButton.firePress();
										wait().then(function () {
											assert.ok(oTable.getBinding().getCount() === 6, "Table: value length is 6");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue8, oNewObject, oValue5, oValue7]), "Field 1: Value changed");
											assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 5]), "Table: selected rows updated");
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

		QUnit.test("delete not selected object 01", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						var oURLColumn = oTable.getColumns()[3];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 6, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

							var oToolbar = oTable.getToolbar();
							assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
							var oAddButton = oToolbar.getContent()[1];
							assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
							oAddButton.firePress();
							wait().then(function () {
								var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
								var oContents = oSimpleForm.getContent();
								assert.ok(oContents.length === 16, "SimpleForm: length");
								assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
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
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "https://",\n\t"number": 0.5\n}', "SimpleForm field8: Has updated value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								oAddButtonInPopover.firePress();
								wait().then(function () {
									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oNewObject = {"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5};
										assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
										assert.ok(deepEqual(oTable.getBinding().getContexts()[6].getObject(), oNewObject), "Table: new row is added to the end");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed");
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

										var oNewRow = oTable.getRows()[4];
										var oActionHBox = oNewRow.getCells()[7];
										assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
										var oDeleteButton = oActionHBox.getItems()[1];
										assert.ok(oDeleteButton.getVisible(), "Row: Delete button visible");
										oDeleteButton.firePress();
										wait().then(function () {
											assert.ok(oTable.getBinding().getCount() === 6, "Table: value length is 6");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed");
											assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3]), "Table: selected rows not updated");
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

		QUnit.test("delete not selected object 02", function (assert) {
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
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					oTable.attachEventOnce("rowsUpdated", function(oEvent) {
						assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
						assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows");
						var oToolbar = oTable.getToolbar();
						assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[2];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

						var oURLColumn = oTable.getColumns()[3];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("http:");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering column URL with 'http:'");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

							var oToolbar = oTable.getToolbar();
							assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
							var oAddButton = oToolbar.getContent()[1];
							assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
							oAddButton.firePress();
							wait().then(function () {
								var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0];
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
								var oContents = oSimpleForm.getContent();
								assert.ok(oContents.length === 16, "SimpleForm: length");
								assert.ok(oContents[15].getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field textArea: Has Default value");
								var oFormLabel = oContents[6];
								var oFormField = oContents[7];
								assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
								assert.ok(oFormField.getValue() === "http://", "SimpleForm field4: Has value");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
								assert.ok(oFormField.getValue() === "", "SimpleForm field6: Has value");
								oFormField.setValue("1");
								oFormField.fireChange({value: "1"});
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5,\n\t"int": 1\n}', "SimpleForm field8: Has updated value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
								oAddButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected row");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

									var oIntColumn = oTable.getColumns()[5];
									oTable.filter(oIntColumn, "1");
									wait().then(function () {
										assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
										assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

										var oNotSelectedRow = oTable.getRows()[0];
										assert.ok(deepEqual(oNotSelectedRow.getBindingContext().getObject(), {"icon": "sap-icon://add", "text": "text", "url": "http://", "number": 0.5, "int": 1}), "Table: value row");
										var oActionHBox = oNotSelectedRow.getCells()[7];
										assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
										var oDeleteButton = oActionHBox.getItems()[1];
										assert.ok(oDeleteButton.getVisible(), "Table: Delete Button is visible");
										oDeleteButton.firePress();
										wait().then(function () {
											assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value deleted");
											assert.ok(oTable.getBinding().getCount() === 0, "Table: value length is 0");
											assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
											assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
											// clear all the filters
											oClearFilterButton.firePress();
											wait().then(function () {
												assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
												assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5]), "Table: selected row index");
												assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed");
												resolve();
											});
										});
									});
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
