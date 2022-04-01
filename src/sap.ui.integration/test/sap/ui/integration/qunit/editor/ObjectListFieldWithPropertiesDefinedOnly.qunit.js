/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/base/util/deepEqual"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual
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
	var aObjectsParameterValue = [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8];
	var oManifestForObjectListFields = {
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
						"value": aObjectsParameterValue
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
	var aSelectedIndices = [0, 1, 2, 3, 4, 5, 6, 7];

	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 600);
		});
	}

	QUnit.module("no value or [] as value", {
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
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {}
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
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
						oAddButton.onAfterRendering = function () {};
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
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
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
								assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
								var oNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
								assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oNewObject), "Table: new row data");
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: no value");
								var oRow1 = oTable.getRows()[0];
								assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oNewObject), "Table: new row");
								// select row1
								oRow1.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndices after selection change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewObject]), "Field 1: Value after selection change");
								// unselect row1
								oRow1.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: no value");
								resolve();
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
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {}
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
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
						oAddButton.onAfterRendering = function () {};
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
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
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
									assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
									var oNewObject = {"icon": "sap-icon://accept", "text": "text01", "url": "https://sapui5.hana.ondemand.com/06", "number": 0.55, "key": "key01", "editable": true, "int": 1};
									assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oNewObject), "Table: new row data");
									assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
									assert.ok(!oField._getCurrentProperty("value"), "Field 1: no value");
									var oRow1 = oTable.getRows()[0];
									assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oNewObject), "Table: new row");
									var oCells = oRow1.getCells();
									assert.ok(oCells.length === 8, "Row: cell length");
									assert.ok(oRow1.getCells()[0].isA("sap.m.Text"), "Cell 1: Text");
									assert.ok(oRow1.getCells()[1].isA("sap.ui.core.Icon"), "Cell 2: Icon");
									assert.ok(oRow1.getCells()[2].isA("sap.m.Text"), "Cell 3: Text");
									assert.ok(oRow1.getCells()[3].isA("sap.m.Link"), "Cell 4: Link");
									assert.ok(oRow1.getCells()[4].isA("sap.m.CheckBox"), "Cell 5: CheckBox");
									assert.ok(oRow1.getCells()[5].isA("sap.m.Text"), "Cell 6: Text");
									assert.ok(oRow1.getCells()[6].isA("sap.m.Text"), "Cell 7: Text");
									// select row1
									oRow1.getDomRefs(true).rowSelector.click();
									assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewObject]), "Field 1: Value after selection change");
									// unselect row1
									oRow1.getDomRefs(true).rowSelector.click();
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
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {}
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
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
						oAddButton.onAfterRendering = function () {};
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
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
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
									assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
									var oNewObject = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55};
									assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oNewObject), "Table: new row data");
									assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
									assert.ok(!oField._getCurrentProperty("value"), "Field 1: no value");
									var oRow1 = oTable.getRows()[0];
									assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oNewObject), "Table: new row");
									// select row1
									oRow1.getDomRefs(true).rowSelector.click();
									assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewObject]), "Field 1: Value after selection change");
									// unselect row1
									oRow1.getDomRefs(true).rowSelector.click();
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
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {
									"value": []
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
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
						oAddButton.onAfterRendering = function () {};
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
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
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
								assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
								var oNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
								assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oNewObject), "Table: new row data");
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), []), "Field 1: value []");
								var oRow1 = oTable.getRows()[0];
								assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oNewObject), "Table: new row");
								// select row1
								oRow1.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndices after selection change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewObject]), "Field 1: Value after selection change");
								// unselect row1
								oRow1.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: no value");
								resolve();
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
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {
									"value": []
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
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
						oAddButton.onAfterRendering = function () {};
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
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
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
									assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
									var oNewObject = {"icon": "sap-icon://accept", "text": "text01", "url": "https://sapui5.hana.ondemand.com/06", "number": 0.55, "key": "key01", "editable": true, "int": 1};
									assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oNewObject), "Table: new row data");
									assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), []), "Field 1: value []");
									var oRow1 = oTable.getRows()[0];
									assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oNewObject), "Table: new row");
									// select row1
									oRow1.getDomRefs(true).rowSelector.click();
									assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewObject]), "Field 1: Value after selection change");
									// unselect row1
									oRow1.getDomRefs(true).rowSelector.click();
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
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {
									"value": []
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
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
						oAddButton.onAfterRendering = function () {};
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
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
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
									assert.ok(oTable.getBinding().getCount() === 1, "Table: value length is 1");
									var oNewObject = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55};
									assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oNewObject), "Table: new row data");
									assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), []), "Field 1: value []");
									var oRow1 = oTable.getRows()[0];
									assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oNewObject), "Table: new row");
									// select row1
									oRow1.getDomRefs(true).rowSelector.click();
									assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndices after selection change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewObject]), "Field 1: Value after selection change");
									// unselect row1
									oRow1.getDomRefs(true).rowSelector.click();
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
	});

	QUnit.module("select and deselect", {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
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

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");

					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), oValue2), "Row 2: value");
					oActionHBox = oRow2.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					var oEditButton2 = oActionHBox.getItems()[0];
					assert.ok(oEditButton2.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton2.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");

					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue3), "Row 3: value");
					oActionHBox = oRow3.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");

					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue4), "Row 4: value");
					oActionHBox = oRow4.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton4 = oActionHBox.getItems()[0];
					assert.ok(oEditButton4.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton4.getVisible(), "Row 4: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 4: Delete button visible");

					var oRow5 = oTable.getRows()[4];
					assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue5), "Row 5: value");
					oActionHBox = oRow5.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton5 = oActionHBox.getItems()[0];
					assert.ok(oEditButton5.getIcon() === "sap-icon://edit", "Row 5: Edit button icon");
					assert.ok(oEditButton5.getVisible(), "Row 5: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 5: Delete button visible");

					oEditButton5.onAfterRendering = function(oEvent) {
						oEditButton5.onAfterRendering = function () {};
						wait().then(function () {
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");

							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow5.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue6, oValue7, oValue8]), "Field 1: DT Value");

							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow6 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValue6), "Row 6: value");
								oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditButton6.getVisible(), "Row 6: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								var oRow7 = oTable.getRows()[3];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue7), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 7: Action cell contains 2 buttons");
								var oEditButton7 = oActionHBox.getItems()[0];
								assert.ok(oEditButton7.getIcon() === "sap-icon://edit", "Row 7: Edit button icon");
								assert.ok(oEditButton7.getVisible(), "Row 7: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 7: Delete button visible");

								var oRow8 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue8), "Row 8: value");
								oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 8: Action cell contains 2 buttons");
								var oEditButton8 = oActionHBox.getItems()[0];
								assert.ok(oEditButton8.getIcon() === "sap-icon://edit", "Row 8: Edit button icon");
								assert.ok(oEditButton8.getVisible(), "Row 8: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 8: Delete button visible");

								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue7, oValue8]), "Field 1: DT Value");

								oRow7.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue8]), "Field 1: DT Value");

								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no row selected");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");

								resolve();
							});
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
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

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");

					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), oValue2), "Row 2: value");
					oActionHBox = oRow2.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					var oEditButton2 = oActionHBox.getItems()[0];
					assert.ok(oEditButton2.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton2.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");

					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue3), "Row 3: value");
					oActionHBox = oRow3.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");

					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue4), "Row 4: value");
					oActionHBox = oRow4.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton4 = oActionHBox.getItems()[0];
					assert.ok(oEditButton4.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton4.getVisible(), "Row 4: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 4: Delete button visible");

					var oRow5 = oTable.getRows()[4];
					assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue5), "Row 5: value");
					oActionHBox = oRow5.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton5 = oActionHBox.getItems()[0];
					assert.ok(oEditButton5.getIcon() === "sap-icon://edit", "Row 5: Edit button icon");
					assert.ok(oEditButton5.getVisible(), "Row 5: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 5: Delete button visible");

					oEditButton5.onAfterRendering = function(oEvent) {
						oEditButton5.onAfterRendering = function () {};
						wait().then(function () {
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");

							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow5.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue6, oValue7, oValue8]), "Field 1: DT Value");

							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow6 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValue6), "Row 6: value");
								oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditButton6.getVisible(), "Row 6: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								var oRow7 = oTable.getRows()[3];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue7), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 7: Action cell contains 2 buttons");
								var oEditButton7 = oActionHBox.getItems()[0];
								assert.ok(oEditButton7.getIcon() === "sap-icon://edit", "Row 7: Edit button icon");
								assert.ok(oEditButton7.getVisible(), "Row 7: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 7: Delete button visible");

								var oRow8 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue8), "Row 8: value");
								oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 8: Action cell contains 2 buttons");
								var oEditButton8 = oActionHBox.getItems()[0];
								assert.ok(oEditButton8.getIcon() === "sap-icon://edit", "Row 8: Edit button icon");
								assert.ok(oEditButton8.getVisible(), "Row 8: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 8: Delete button visible");

								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue7, oValue8]), "Field 1: DT Value");

								oRow7.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue8]), "Field 1: DT Value");

								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no row selected");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");

								resolve();
							});
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
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

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");

					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), oValue2), "Row 2: value");
					oActionHBox = oRow2.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					var oEditButton2 = oActionHBox.getItems()[0];
					assert.ok(oEditButton2.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton2.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");

					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue3), "Row 3: value");
					oActionHBox = oRow3.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");

					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue4), "Row 4: value");
					oActionHBox = oRow4.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton4 = oActionHBox.getItems()[0];
					assert.ok(oEditButton4.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton4.getVisible(), "Row 4: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 4: Delete button visible");

					var oRow5 = oTable.getRows()[4];
					assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue5), "Row 5: value");
					oActionHBox = oRow5.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton5 = oActionHBox.getItems()[0];
					assert.ok(oEditButton5.getIcon() === "sap-icon://edit", "Row 5: Edit button icon");
					assert.ok(oEditButton5.getVisible(), "Row 5: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 5: Delete button visible");

					oEditButton5.onAfterRendering = function(oEvent) {
						oEditButton5.onAfterRendering = function () {};
						wait().then(function () {
							oRow5.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow5.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");

							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

							oRow5.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue6, oValue7, oValue8]), "Field 1: DT Value");

							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow6 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValue6), "Row 6: value");
								oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditButton6.getVisible(), "Row 6: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								var oRow7 = oTable.getRows()[3];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue7), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 7: Action cell contains 2 buttons");
								var oEditButton7 = oActionHBox.getItems()[0];
								assert.ok(oEditButton7.getIcon() === "sap-icon://edit", "Row 7: Edit button icon");
								assert.ok(oEditButton7.getVisible(), "Row 7: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 7: Delete button visible");

								var oRow8 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue8), "Row 8: value");
								oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 8: Action cell contains 2 buttons");
								var oEditButton8 = oActionHBox.getItems()[0];
								assert.ok(oEditButton8.getIcon() === "sap-icon://edit", "Row 8: Edit button icon");
								assert.ok(oEditButton8.getVisible(), "Row 8: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 8: Delete button visible");

								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue7, oValue8]), "Field 1: DT Value");

								oRow7.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue8]), "Field 1: DT Value");

								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no row selected");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");

								resolve();
							});
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
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

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");

					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), oValue2), "Row 2: value");
					oActionHBox = oRow2.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					var oEditButton2 = oActionHBox.getItems()[0];
					assert.ok(oEditButton2.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton2.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");

					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue3), "Row 3: value");
					oActionHBox = oRow3.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");

					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue4), "Row 4: value");
					oActionHBox = oRow4.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton4 = oActionHBox.getItems()[0];
					assert.ok(oEditButton4.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton4.getVisible(), "Row 4: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 4: Delete button visible");

					var oRow5 = oTable.getRows()[4];
					assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue5), "Row 5: value");
					oActionHBox = oRow5.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton5 = oActionHBox.getItems()[0];
					assert.ok(oEditButton5.getIcon() === "sap-icon://edit", "Row 5: Edit button icon");
					assert.ok(oEditButton5.getVisible(), "Row 5: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 5: Delete button visible");

					oEditButton5.onAfterRendering = function(oEvent) {
						oEditButton5.onAfterRendering = function () {};
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow6 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValue6), "Row 6: value");
								oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditButton6.getVisible(), "Row 6: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								var oRow7 = oTable.getRows()[3];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue7), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 7: Action cell contains 2 buttons");
								var oEditButton7 = oActionHBox.getItems()[0];
								assert.ok(oEditButton7.getIcon() === "sap-icon://edit", "Row 7: Edit button icon");
								assert.ok(oEditButton7.getVisible(), "Row 7: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 7: Delete button visible");

								var oRow8 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue8), "Row 8: value");
								oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 8: Action cell contains 2 buttons");
								var oEditButton8 = oActionHBox.getItems()[0];
								assert.ok(oEditButton8.getIcon() === "sap-icon://edit", "Row 8: Edit button icon");
								assert.ok(oEditButton8.getVisible(), "Row 8: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 8: Delete button visible");

								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 6, 7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue7, oValue8]), "Field 1: DT Value");

								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");

								// scroll to top
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 0;
								wait().then(function () {
									oRow1.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

									oRow2.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

									oRow3.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [3, 4, 5, 6, 7]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

									oRow4.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [4, 5, 6, 7]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

									oRow5.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [5, 6, 7]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue6, oValue7, oValue8]), "Field 1: DT Value");

									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										oRow6.getDomRefs(true).rowSelector.click();
										assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7]), "Table: selected rows changed");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue7, oValue8]), "Field 1: DT Value");

										oRow7.getDomRefs(true).rowSelector.click();
										assert.ok(deepEqual(oTable.getSelectedIndices(), [7]), "Table: selected rows changed");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue8]), "Field 1: DT Value");

										oRow8.getDomRefs(true).rowSelector.click();
										assert.ok(oTable.getSelectedIndices().length === 0, "Table: no row selected");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
										assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");

										resolve();
									});
								});
							});
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
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

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");

					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), oValue2), "Row 2: value");
					oActionHBox = oRow2.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					var oEditButton2 = oActionHBox.getItems()[0];
					assert.ok(oEditButton2.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton2.getVisible(), "Row 2: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 2: Delete button visible");

					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue3), "Row 3: value");
					oActionHBox = oRow3.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");

					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue4), "Row 4: value");
					oActionHBox = oRow4.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton4 = oActionHBox.getItems()[0];
					assert.ok(oEditButton4.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton4.getVisible(), "Row 4: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 4: Delete button visible");

					var oRow5 = oTable.getRows()[4];
					assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue5), "Row 5: value");
					oActionHBox = oRow5.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton5 = oActionHBox.getItems()[0];
					assert.ok(oEditButton5.getIcon() === "sap-icon://edit", "Row 5: Edit button icon");
					assert.ok(oEditButton5.getVisible(), "Row 5: Edit button visible");
					oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 5: Delete button visible");

					oEditButton5.onAfterRendering = function(oEvent) {
						oEditButton5.onAfterRendering = function () {};
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow6 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValue6), "Row 6: value");
								oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditButton6.getVisible(), "Row 6: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								var oRow7 = oTable.getRows()[3];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue7), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 7: Action cell contains 2 buttons");
								var oEditButton7 = oActionHBox.getItems()[0];
								assert.ok(oEditButton7.getIcon() === "sap-icon://edit", "Row 7: Edit button icon");
								assert.ok(oEditButton7.getVisible(), "Row 7: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 7: Delete button visible");

								var oRow8 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue8), "Row 8: value");
								oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 8: Action cell contains 2 buttons");
								var oEditButton8 = oActionHBox.getItems()[0];
								assert.ok(oEditButton8.getIcon() === "sap-icon://edit", "Row 8: Edit button icon");
								assert.ok(oEditButton8.getVisible(), "Row 8: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 8: Delete button visible");

								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7]), "Field 1: DT Value");

								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");

								// scroll to top
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 0;
								wait().then(function () {
									oRow1.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

									oRow2.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

									oRow3.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [3, 4, 5, 6, 7]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

									oRow4.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [4, 5, 6, 7]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");

									oRow5.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [5, 6, 7]), "Table: selected rows changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue6, oValue7, oValue8]), "Field 1: DT Value");

									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										oRow6.getDomRefs(true).rowSelector.click();
										assert.ok(deepEqual(oTable.getSelectedIndices(), [6, 7]), "Table: selected rows changed");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue7, oValue8]), "Field 1: DT Value");

										oRow7.getDomRefs(true).rowSelector.click();
										assert.ok(deepEqual(oTable.getSelectedIndices(), [7]), "Table: selected rows changed");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue8]), "Field 1: DT Value");

										oRow8.getDomRefs(true).rowSelector.click();
										assert.ok(oTable.getSelectedIndices().length === 0, "Table: no row selected");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
										assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");

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

	QUnit.module("selectAll and deselectAll", {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");

					oEditButton1.onAfterRendering = function(oEvent) {
						oEditButton1.onAfterRendering = function () {};
						wait().then(function () {
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							// selectAll
							oTable.$("selall").trigger("click");
							assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							// deselectAll
							oTable.$("selall").trigger("click");
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
							resolve();
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue3), "Row 3: value");
					var oActionHBox = oRow3.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton3 = oActionHBox.getItems()[0];
					assert.ok(oEditButton3.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton3.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");

					oEditButton3.onAfterRendering = function(oEvent) {
						oEditButton3.onAfterRendering = function () {};
						wait().then(function () {
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							// selectAll
							oTable.$("selall").trigger("click");
							assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							// deselectAll
							oTable.$("selall").trigger("click");
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
							resolve();
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow5 = oTable.getRows()[4];
					assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue5), "Row 5: value");
					var oActionHBox = oRow5.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton5 = oActionHBox.getItems()[0];
					assert.ok(oEditButton5.getIcon() === "sap-icon://edit", "Row 5: Edit button icon");
					assert.ok(oEditButton5.getVisible(), "Row 5: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 5: Delete button visible");

					oEditButton5.onAfterRendering = function(oEvent) {
						oEditButton5.onAfterRendering = function () {};
						wait().then(function () {
							oRow5.getDomRefs(true).rowSelector.click();
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							// selectAll
							oTable.$("selall").trigger("click");
							assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
							assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
							// deselectAll
							oTable.$("selall").trigger("click");
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
							resolve();
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");

					oEditButton1.onAfterRendering = function(oEvent) {
						oEditButton1.onAfterRendering = function () {};
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow6 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValue6), "Row 6: value");
								oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditButton6.getVisible(), "Row 6: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 6, 7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue7, oValue8]), "Field 1: DT Value");

								// selectAll
								oTable.$("selall").trigger("click");
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
								// deselectAll
								oTable.$("selall").trigger("click");
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
								resolve();
							});
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton1 = oActionHBox.getItems()[0];
					assert.ok(oEditButton1.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton1.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");

					oEditButton1.onAfterRendering = function(oEvent) {
						oEditButton1.onAfterRendering = function () {};
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow8 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue8), "Row 8: value");
								oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 8: Action cell contains 2 buttons");
								var oEditButton8 = oActionHBox.getItems()[0];
								assert.ok(oEditButton8.getIcon() === "sap-icon://edit", "Row 8: Edit button icon");
								assert.ok(oEditButton8.getVisible(), "Row 8: Edit button visible");
								oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 8: Delete button visible");

								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7]), "Field 1: DT Value");

								// selectAll
								oTable.$("selall").trigger("click");
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected rows changed");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
								// deselectAll
								oTable.$("selall").trigger("click");
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("add", {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
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
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
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
								assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), oNewObject), "Table: new row data");
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
									var oEditButton8 = oActionHBox.getItems()[0];
									assert.ok(oEditButton8.getIcon() === "sap-icon://edit", "New row: Edit button icon");
									assert.ok(oEditButton8.getVisible(), "New row: Edit button visible");
									var oDeleteButton = oActionHBox.getItems()[1];
									assert.ok(oDeleteButton.getVisible(), "new row: Delete button visible");

									oNewRow.getDomRefs(true).rowSelector.click();
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8]), "Table: selected rows changed");
									assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8, oNewObject]), "Field 1: DT Value");
									resolve();
								});
							});
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
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
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
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
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not change");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								resolve();
							});
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
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
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
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
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
									assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), oNewObject), "Table: new row data");
									assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not change");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									// scroll to the bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oNewRow = oTable.getRows()[4];
										assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewObject), "Table: new row in the bottom");
										var oCells = oNewRow.getCells();
										assert.ok(oCells.length === 8, "Row: cell length");
										assert.ok(oNewRow.getCells()[0].isA("sap.m.Text"), "Cell 1: Text");
										assert.ok(oNewRow.getCells()[1].isA("sap.ui.core.Icon"), "Cell 2: Icon");
										assert.ok(oNewRow.getCells()[2].isA("sap.m.Text"), "Cell 3: Text");
										assert.ok(oNewRow.getCells()[3].isA("sap.m.Link"), "Cell 4: Link");
										assert.ok(oNewRow.getCells()[4].isA("sap.m.CheckBox"), "Cell 5: CheckBox");
										assert.ok(oNewRow.getCells()[5].isA("sap.m.Text"), "Cell 6: Text");
										assert.ok(oNewRow.getCells()[6].isA("sap.m.Text"), "Cell 7: Text");
										var oActionHBox = oCells[7];
										assert.ok(oActionHBox.getItems().length = 2, "New row: Action cell contains 2 buttons");
										var oEditButton8 = oActionHBox.getItems()[0];
										assert.ok(oEditButton8.getIcon() === "sap-icon://edit", "New row: Edit button icon");
										assert.ok(oEditButton8.getVisible(), "New row: Edit button visible");
										var oDeleteButton = oActionHBox.getItems()[1];
										assert.ok(oDeleteButton.getVisible(), "new row: Delete button visible");

										oNewRow.getDomRefs(true).rowSelector.click();
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8]), "Table: selected rows changed");
										assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8, oNewObject]), "Field 1: DT Value");
										resolve();
									});
								});
							});
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
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
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
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
									assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
									assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not change");
									assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
									resolve();
								});
							});
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
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
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
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
									assert.ok(oTable.getBinding().getCount() === 9, "Table: value length is 9");
									assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), oNewObject), "Table: new row data");
									assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not change");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									// scroll to the bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
									wait().then(function () {
										var oNewRow = oTable.getRows()[4];
										assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewObject), "Table: new row in the bottom");
										var oCells = oNewRow.getCells();
										assert.ok(oCells.length === 8, "Row: cell length");
										assert.ok(oNewRow.getCells()[0].isA("sap.m.Text"), "Cell 1: Text");
										assert.ok(oNewRow.getCells()[1].isA("sap.ui.core.Icon"), "Cell 2: Icon");
										assert.ok(oNewRow.getCells()[2].isA("sap.m.Text"), "Cell 3: Text");
										assert.ok(oNewRow.getCells()[3].isA("sap.m.Link"), "Cell 4: Link");
										assert.ok(oNewRow.getCells()[4].isA("sap.m.CheckBox"), "Cell 5: CheckBox");
										assert.ok(oNewRow.getCells()[5].isA("sap.m.Text"), "Cell 6: Text");
										assert.ok(oNewRow.getCells()[6].isA("sap.m.Text"), "Cell 7: Text");
										var oActionHBox = oCells[7];
										assert.ok(oActionHBox.getItems().length = 2, "New row: Action cell contains 2 buttons");
										var oEditButton8 = oActionHBox.getItems()[0];
										assert.ok(oEditButton8.getIcon() === "sap-icon://edit", "New row: Edit button icon");
										assert.ok(oEditButton8.getVisible(), "New row: Edit button visible");
										var oDeleteButton = oActionHBox.getItems()[1];
										assert.ok(oDeleteButton.getVisible(), "new row: Delete button visible");

										oNewRow.getDomRefs(true).rowSelector.click();
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8]), "Table: selected rows changed");
										assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8, oNewObject]), "Field 1: DT Value");
										resolve();
									});
								});
							});
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oToolbar = oTable.getToolbar();
					assert.ok(oToolbar.getContent().length === 3, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[2];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");

					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
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
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
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
									assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
									assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not change");
									assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("update", {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Table: value row is at top");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");

					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
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
							assert.ok(oContents[15].getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#031E48",\n\t"int": 1,\n\t"editable": true,\n\t"number": 3.55\n}', "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Has value");
							oFormField.setValue("keynew");
							oFormField.fireChange({ value: "keynew" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://zoom-in");
							oFormField.fireChange({ value: "sap-icon://zoom-in" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Has value");
							oFormField.setValue("textnew");
							oFormField.fireChange({ value: "textnew" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/04");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/04" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(oFormField.getSelected(), "SimpleForm field5: Has value");
							oFormField.setSelected(false);
							oFormField.fireSelect({ selected: false });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Has value");
							oFormField.setValue("3");
							oFormField.fireChange({value: "3"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#031E48",\n\t"int": 3,\n\t"editable": false,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								var oNewValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#031E48", "int": 3, "editable": false, "number": 0.55};
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewValue, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oNewValue), "Table: new row");
								var oNewRow = oTable.getRows()[0];
								assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewValue), "Table: value row is at top");
								resolve();
							});
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Table: value row is at top");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");

					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
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
							assert.ok(oContents[15].getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#031E48",\n\t"int": 1,\n\t"editable": true,\n\t"number": 3.55\n}', "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Has value");
							oFormField.setValue("keynew");
							oFormField.fireChange({ value: "keynew" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://zoom-in");
							oFormField.fireChange({ value: "sap-icon://zoom-in" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Has value");
							oFormField.setValue("textnew");
							oFormField.fireChange({ value: "textnew" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/04");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/04" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(oFormField.getSelected(), "SimpleForm field5: Has value");
							oFormField.setSelected(false);
							oFormField.fireSelect({ selected: false });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Has value");
							oFormField.setValue("3");
							oFormField.fireChange({value: "3"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#031E48",\n\t"int": 3,\n\t"editable": false,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not change");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								resolve();
							});
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Table: value row is at top");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");

					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
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
							assert.ok(oContents[15].getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#031E48",\n\t"int": 1,\n\t"editable": true,\n\t"number": 3.55\n}', "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Has value");
							oFormField.setValue("keynew");
							oFormField.fireChange({ value: "keynew" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://zoom-in");
							oFormField.fireChange({ value: "sap-icon://zoom-in" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Has value");
							oFormField.setValue("textnew");
							oFormField.fireChange({ value: "textnew" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/04");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/04" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(oFormField.getSelected(), "SimpleForm field5: Has value");
							oFormField.setSelected(false);
							oFormField.fireSelect({ selected: false });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Has value");
							oFormField.setValue("3");
							oFormField.fireChange({value: "3"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#031E48",\n\t"int": 3,\n\t"editable": false,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
							var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								var oNewValue = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sapui5.hana.ondemand.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55};
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewValue, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
								assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oNewValue), "Table: new row");
								var oNewRow = oTable.getRows()[0];
								assert.ok(deepEqual(oNewRow.getBindingContext().getObject(), oNewValue), "Table: value row is at top");
								resolve();
							});
						});
					};
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Table: value row is at top");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");

					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						oEditButton.firePress();
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
							assert.ok(oContents[15].getValue() === '{\n\t"text": "text01",\n\t"key": "key01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#031E48",\n\t"int": 1,\n\t"editable": true,\n\t"number": 3.55\n}', "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.ok(oFormField.getValue() === "key01", "SimpleForm field1: Has value");
							oFormField.setValue("keynew");
							oFormField.fireChange({ value: "keynew" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.ok(oFormField.getValue() === "sap-icon://accept", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://zoom-in");
							oFormField.fireChange({ value: "sap-icon://zoom-in" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.ok(oFormField.getValue() === "text01", "SimpleForm field3: Has value");
							oFormField.setValue("textnew");
							oFormField.fireChange({ value: "textnew" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.ok(oFormField.getValue() === "https://sapui5.hana.ondemand.com/06", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/04");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/04" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(oFormField.getSelected(), "SimpleForm field5: Has value");
							oFormField.setSelected(false);
							oFormField.fireSelect({ selected: false });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.ok(oFormField.getValue() === "1", "SimpleForm field6: Has value");
							oFormField.setValue("3");
							oFormField.fireChange({value: "3"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(oFormField.getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/04",\n\t"icon": "sap-icon://zoom-in",\n\t"iconcolor": "#031E48",\n\t"int": 3,\n\t"editable": false,\n\t"number": 0.55\n}', "SimpleForm field textArea: Has changed value");
							var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sapui5.hana.ondemand.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
							oFormField.setValue(sNewValue);
							oFormField.fireChange({ value: sNewValue});
							oCancelButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row not change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not change");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("delete", {
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
		QUnit.test("delete selected object 01", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Table: value row is at top");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");

					oDeleteButton.onAfterRendering = function(oEvent) {
						oDeleteButton.onAfterRendering = function () {};
						oDeleteButton.firePress();
						wait().then(function () {
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
							assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected row not change");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object 03", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue3), "Table: value row");
					var oActionHBox = oRow3.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Table: Delete button visible");

					oDeleteButton.onAfterRendering = function(oEvent) {
						oDeleteButton.onAfterRendering = function () {};
						oDeleteButton.firePress();
						wait().then(function () {
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
							assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected row not change");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object 05", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow5 = oTable.getRows()[4];
					assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue5), "Table: value row");
					var oActionHBox = oRow5.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row: Delete button visible");

					oDeleteButton.onAfterRendering = function(oEvent) {
						oDeleteButton.onAfterRendering = function () {};
						oDeleteButton.firePress();
						wait().then(function () {
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue6, oValue7, oValue8]), "Field 1: Value updated");
							assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected row not change");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object 06", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow5 = oTable.getRows()[4];
					var oActionHBox = oRow5.getCells()[7];
					var oEditButton = oActionHBox.getItems()[0];

					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow6 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValue6), "Row 6: value");
								oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oEditButton6 = oActionHBox.getItems()[0];
								assert.ok(oEditButton6.getIcon() === "sap-icon://edit", "Row 6: Edit button icon");
								assert.ok(oEditButton6.getVisible(), "Row 6: Edit button visible");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row 6: Delete button visible");

								oDeleteButton.firePress();
								wait().then(function () {
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue7, oValue8]), "Field 1: Value updated");
									assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected row not change");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object 08", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow5 = oTable.getRows()[4];
					var oActionHBox = oRow5.getCells()[7];
					var oEditButton = oActionHBox.getItems()[0];

					oEditButton.onAfterRendering = function(oEvent) {
						oEditButton.onAfterRendering = function () {};
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow8 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue8), "Row: value");
								oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row: Action cell contains 2 buttons");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Row: Delete button visible");

								oDeleteButton.firePress();
								wait().then(function () {
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7]), "Field 1: Value updated");
									assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected row not change");
									resolve();
								});
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object when have unselected objects 01", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton1 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton1.getVisible(), "Row 1: Delete button visible");

					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), oValue2), "Row 2: value");
					oActionHBox = oRow2.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");

					oDeleteButton1.onAfterRendering = function(oEvent) {
						oDeleteButton1.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row2
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							oDeleteButton1.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5, 6]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object when have unselected objects 04", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue4), "Row 4: value");
					var oActionHBox = oRow4.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");

					var oRow5 = oTable.getRows()[4];
					assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue5), "Row 5: value");
					oActionHBox = oRow5.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 5: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 5: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 5: Edit button visible");
					var oDeleteButton5 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton5.getVisible(), "Row 5: Delete button visible");

					oDeleteButton4.onAfterRendering = function(oEvent) {
						oDeleteButton4.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row5
							oRow5.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							oDeleteButton4.firePress();
							assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 4, 5, 6]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete selected object when have unselected objects 07", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue4), "Row 4: value");
					var oActionHBox = oRow4.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");

					oDeleteButton4.onAfterRendering = function(oEvent) {
						oDeleteButton4.onAfterRendering = function () {};
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow7 = oTable.getRows()[3];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue7), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row: Action cell contains 2 buttons");
								var oDeleteButton7 = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton7.getVisible(), "Row: Delete button visible");

								var oRow8 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue8), "Row 8 value");
								// unselect row8
								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7]), "Field 1: DT Value");

								oDeleteButton7.firePress();
								assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6]), "Field 1: DT Value");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object 01", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");

					oDeleteButton.onAfterRendering = function(oEvent) {
						oDeleteButton.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row1
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							oDeleteButton.firePress();
							wait().then(function () {
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected row not change");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object 03", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow3 = oTable.getRows()[2];
					assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue3), "Row 3: value");
					var oActionHBox = oRow3.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 3: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 3: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 3: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 3: Delete button visible");

					oDeleteButton.onAfterRendering = function(oEvent) {
						oDeleteButton.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row5
							oRow3.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							oDeleteButton.firePress();
							wait().then(function () {
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected row not change");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object 05", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow5 = oTable.getRows()[4];
					assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue5), "Row 5: value");
					var oActionHBox = oRow5.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 5: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 5: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 5: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 5: Delete button visible");

					oDeleteButton.onAfterRendering = function(oEvent) {
						oDeleteButton.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row5
							oRow5.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							oDeleteButton.firePress();
							wait().then(function () {
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue6, oValue7, oValue8]), "Field 1: Value updated");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected row not change");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object 06", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue4), "Row 4: value");
					var oActionHBox = oRow4.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");

					oDeleteButton4.onAfterRendering = function(oEvent) {
						oDeleteButton4.onAfterRendering = function () {};
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow6 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow6.getBindingContext().getObject(), oValue6), "Row 6: value");
								oActionHBox = oRow6.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 6: Action cell contains 2 buttons");
								var oDeleteButton6 = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton6.getVisible(), "Row 6: Delete button visible");

								// unselect row6
								oRow6.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 6, 7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue7, oValue8]), "Field 1: DT Value");

								oDeleteButton6.firePress();
								assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected rows changed");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue7, oValue8]), "Field 1: DT Value");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object 08", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue4), "Row 4: value");
					var oActionHBox = oRow4.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");

					oDeleteButton4.onAfterRendering = function(oEvent) {
						oDeleteButton4.onAfterRendering = function () {};
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow8 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue8), "Row 8: value");
								oActionHBox = oRow8.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row 8: Action cell contains 2 buttons");
								var oDeleteButton8 = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton8.getVisible(), "Row 8: Delete button visible");

								// unselect row8
								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7]), "Field 1: DT Value");

								oDeleteButton8.firePress();
								assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected rows changed");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue7]), "Field 1: DT Value");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object when have unselected objects 01", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow1 = oTable.getRows()[0];
					assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Row 1: value");
					var oActionHBox = oRow1.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");

					var oRow2 = oTable.getRows()[1];
					assert.ok(deepEqual(oRow2.getBindingContext().getObject(), oValue2), "Row 2: value");
					oActionHBox = oRow2.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 2: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 2: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 2: Edit button visible");
					var oDeleteButton2 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton2.getVisible(), "Row 2: Delete button visible");

					oDeleteButton.onAfterRendering = function(oEvent) {
						oDeleteButton.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row1
							oRow1.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							// unselect row2
							oRow2.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							oDeleteButton.firePress();
							wait().then(function () {
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4, 5, 6]), "Table: selected row not change");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object when have unselected objects 04", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue4), "Row 4: value");
					var oActionHBox = oRow4.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");

					var oRow5 = oTable.getRows()[4];
					assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oValue5), "Row 5: value");
					oActionHBox = oRow5.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 5: Action cell contains 2 buttons");
					oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 5: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 5: Edit button visible");
					var oDeleteButton5 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton5.getVisible(), "Row 5: Delete button visible");

					oDeleteButton4.onAfterRendering = function(oEvent) {
						oDeleteButton4.onAfterRendering = function () {};
						wait().then(function () {
							// unselect row4
							oRow4.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 4, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue5, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							// unselect row5
							oRow5.getDomRefs(true).rowSelector.click();
							assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 5, 6, 7]), "Table: selected rows changed");
							assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue6, oValue7, oValue8]), "Field 1: DT Value");
							oDeleteButton4.firePress();
							wait().then(function () {
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue6, oValue7, oValue8]), "Field 1: Value updated");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(oTable.getBinding().getCount() === 7, "Table: value length is 7");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 4, 5, 6]), "Table: selected row not change");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete unselected object when have unselected objects 07", function (assert) {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.ok(oTable.getRows().length === 5, "Table: line number is 5");
					assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
					assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

					var oRow4 = oTable.getRows()[3];
					assert.ok(deepEqual(oRow4.getBindingContext().getObject(), oValue4), "Row 4: value");
					var oActionHBox = oRow4.getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 4: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 4: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 4: Edit button visible");
					var oDeleteButton4 = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton4.getVisible(), "Row 4: Delete button visible");

					oDeleteButton4.onAfterRendering = function(oEvent) {
						oDeleteButton4.onAfterRendering = function () {};
						wait().then(function () {
							// scroll to bottom
							oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
							wait().then(function () {
								var oRow7 = oTable.getRows()[3];
								assert.ok(deepEqual(oRow7.getBindingContext().getObject(), oValue7), "Row 7: value");
								oActionHBox = oRow7.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Row: Action cell contains 2 buttons");
								var oDeleteButton7 = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton7.getVisible(), "Row: Delete button visible");
								// unselect row7
								oRow7.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 7]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6, oValue8]), "Field 1: DT Value");

								var oRow8 = oTable.getRows()[4];
								assert.ok(deepEqual(oRow8.getBindingContext().getObject(), oValue8), "Row 8 value");
								// unselect row8
								oRow8.getDomRefs(true).rowSelector.click();
								assert.ok(oTable.getBinding().getCount() === aObjectsParameterValue.length, "Table: value length is " + aObjectsParameterValue.length);
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6]), "Field 1: DT Value");

								oDeleteButton7.firePress();
								assert.ok(oTable.getBinding().getCount() === (aObjectsParameterValue.length - 1), "Table: value length is " + (aObjectsParameterValue.length - 1));
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5]), "Table: selected rows changed");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue2, oValue3, oValue4, oValue5, oValue6]), "Field 1: DT Value");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("filter", {
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					var oActionHBox = oTable.getRows()[0].getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oKeyColumn = oTable.getColumns()[0];
					oTable.filter(oKeyColumn, "n");
					// check that the column menu filter input field was updated
					var oMenu = oKeyColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount length is 0");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected row hided");
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
							assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after removing filter");
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
								assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount length is 0");
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected row hided");
								assert.ok(oTextColumn.getFiltered(), "Table: Column Text is filtered");
								oTable.filter(oTextColumn, "*n");
								assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering *n");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
								oTable.filter(oTextColumn, "*0*");
								assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering *0*");
								wait().then(function () {
									assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
									oTable.filter(oTextColumn, "01");
									wait().then(function () {
										assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering 01");
										assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: selected row");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
										oTable.filter(oTextColumn, "");
										wait().then(function () {
											assert.ok(!oTextColumn.getFiltered(), "Table: Column Text is not filtered anymore");
											assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after removing all filters");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
											assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
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
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount0");
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
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oURLColumn = oTable.getColumns()[3];
					var oIntColumn = oTable.getColumns()[5];
					var oMenu = oURLColumn.getMenu();
					// open the column filter menu, input filter value, close the menu.
					oMenu.open();
					oMenu.getItems()[0].setValue("https");
					oMenu.getItems()[0].fireSelect();
					oMenu.close();
					wait().then(function () {
						assert.ok(oTable.getBinding().getCount() === 5, "Table: RowCount after filtering column URL with 'https'");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4]), "Table: all rows selected");
						oMenu = oIntColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("4");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.ok(oTable.getBinding().getCount() === 1, "Table: RowCount after filtering column Integer with '4'");
							assert.ok(deepEqual(oTable.getSelectedIndices(), [0]), "Table: all rows selected");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							// open the column filter menu, input filter value, close the menu.
							oMenu.open();
							oMenu.getItems()[0].setValue(">4");
							oMenu.getItems()[0].fireSelect();
							oMenu.close();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 2, "Table: RowCount after filtering column Integer with '>4'");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: all rows selected");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");

								// clear all the filters
								oClearFilterButton.firePress();
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after removing all the filters");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
									assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
									resolve();
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					var oActionHBox = oTable.getRows()[0].getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oURLColumn = oTable.getColumns()[3];
					oTable.filter(oURLColumn, "n");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount length is 0");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected row hided");
						assert.ok(oURLColumn.getFiltered(), "Table: Column Key is filtered");
						oTable.filter(oURLColumn, "n*");
						assert.ok(oURLColumn.getFiltered(), "Table: Column Key is filtered");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering n*");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected row hided");
						oTable.filter(oURLColumn, "*01");
						assert.ok(oTable.getBinding().getCount() === 2, "Table: RowCount after filtering *01");
						oTable.filter(oURLColumn, "01");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering 01");
						oTable.filter(oURLColumn, "http");
						assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering http");
						oTable.filter(oURLColumn, "https");
						assert.ok(oTable.getBinding().getCount() === 5, "Table: RowCount after filtering https");
						oTable.filter(oURLColumn, "");
						wait().then(function () {
							assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
							assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after removing filter");
							assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							oTable.filter(oURLColumn, "https");
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 5, "Table: RowCount after filtering https");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

								// deselect row1
								var oRow1 = oTable.getRows()[0];
								assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Table: row1 value");
								oRow1.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4]), "Table: SelectedIndices after selection change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue4, oValue6, oValue8, oValue2, oValue5, oValue7]), "Field 1: Value after selection change");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

								// deselect row3
								var oRow3 = oTable.getRows()[2];
								assert.ok(deepEqual(oRow3.getBindingContext().getObject(), oValue4), "Table: row3 value");
								oRow3.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 3, 4]), "Table: SelectedIndices after selection change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue6, oValue8, oValue2, oValue5, oValue7]), "Field 1: Value after selection change");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

								// select row3 again
								oRow3.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4]), "Table: SelectedIndices after selection change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue4, oValue6, oValue8, oValue2, oValue5, oValue7]), "Field 1: Value after selection change");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

								// select row1 again
								oRow1.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4]), "Table: SelectedIndices after selection change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue4, oValue6, oValue8, oValue2, oValue5, oValue7]), "Field 1: Value after selection change");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

								resolve();
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					var oActionHBox = oTable.getRows()[0].getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oURLColumn = oTable.getColumns()[3];
					oTable.filter(oURLColumn, "n");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount length is 0");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected row hided");
						assert.ok(oURLColumn.getFiltered(), "Table: Column Key is filtered");
						oTable.filter(oURLColumn, "n*");
						assert.ok(oURLColumn.getFiltered(), "Table: Column Key is filtered");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering n*");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: selected row hided");
						oTable.filter(oURLColumn, "*01");
						assert.ok(oTable.getBinding().getCount() === 2, "Table: RowCount after filtering *01");
						oTable.filter(oURLColumn, "01");
						assert.ok(oTable.getBinding().getCount() === 0, "Table: RowCount after filtering 01");
						oTable.filter(oURLColumn, "http");
						assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after filtering http");
						oTable.filter(oURLColumn, "https");
						assert.ok(oTable.getBinding().getCount() === 5, "Table: RowCount after filtering https");
						oTable.filter(oURLColumn, "");
						wait().then(function () {
							assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
							assert.ok(oTable.getBinding().getCount() === 8, "Table: RowCount after removing filter");
							assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: all rows selected");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							oTable.filter(oURLColumn, "https");
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 5, "Table: RowCount after filtering https");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");

								// deselect row1
								var oRow1 = oTable.getRows()[0];
								assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oValue1), "Table: row1 value");
								oRow1.getDomRefs(true).rowSelector.click();
								assert.ok(deepEqual(oTable.getSelectedIndices(), [1, 2, 3, 4]), "Table: SelectedIndices after selection change");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue3, oValue4, oValue6, oValue8, oValue2, oValue5, oValue7]), "Field 1: Value after selection change");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");

								// selectAll
								oTable.$("selall").trigger("click");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4]), "Table: selected rows changed");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue1, oValue3, oValue4, oValue6, oValue8, oValue2, oValue5, oValue7]), "Field 1: DT Value");

								// deselectAll
								oTable.$("selall").trigger("click");
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected rows");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue2, oValue5, oValue7]), "Field 1: Value after selection change");

								resolve();
							});
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					var oActionHBox = oTable.getRows()[0].getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oURLColumn = oTable.getColumns()[3];
					oTable.filter(oURLColumn, "https");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oTable.getBinding().getCount() === 5, "Table: RowCount after filtering https");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4]), "Table: selected rows changed");

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
									assert.ok(oTable.getBinding().getCount() === 6, "Table: value length is 6");
									assert.ok(deepEqual(oTable.getBinding().getContexts()[5].getObject(), {"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5}), "Table: new row is added to the end");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4]), "Table: selected row");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									oTable.filter(oURLColumn, "");
									assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
									wait().then(function () {
										assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
										assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: rows selected");
										assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
										// scroll to bottom
										oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
										wait().then(function () {
											assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), {"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5}), "Table: new row is added to the end");
											assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					var oActionHBox = oTable.getRows()[0].getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oURLColumn = oTable.getColumns()[3];
					oTable.filter(oURLColumn, "https");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oTable.getBinding().getCount() === 5, "Table: RowCount after filtering https");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4]), "Table: selected rows changed");

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
								assert.ok(oTable.getBinding().getCount() === 5, "Table: value length is 5");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4]), "Table: selected row");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
								assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
								oTable.filter(oURLColumn, "");
								assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
								wait().then(function () {
									assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
									assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: rows selected");
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
									// scroll to bottom
									oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
									wait().then(function () {
										assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5}), "Table: new row is added to the end");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
										resolve();
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					var oActionHBox = oTable.getRows()[0].getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oURLColumn = oTable.getColumns()[3];
					oTable.filter(oURLColumn, "http:");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering http:");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows");

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
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field8: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected row");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								var oSelectedRow = oTable.getRows()[0];
								assert.ok(deepEqual(oSelectedRow.getBindingContext().getObject(), oValue2), "Table: value row");
								var oActionHBox = oSelectedRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oEditButton = oActionHBox.getItems()[0];
								oEditButton.firePress();
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
									assert.ok(oContents[15].getValue() === '{\n\t"text": "text02",\n\t"key": "key02",\n\t"url": "http://sapui5.hana.ondemand.com/05",\n\t"icon": "sap-icon://cart",\n\t"iconcolor": "#64E4CE",\n\t"int": 2,\n\t"number": 3.55\n}', "SimpleForm field textArea: Has the value");
									var oFormLabel = oContents[0];
									var oFormField = oContents[1];
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
									assert.ok(oFormField.getValue() === "key02", "SimpleForm field1: Has value");
									oFormField.setValue("keynew");
									oFormField.fireChange({ value: "keynew" });
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
									assert.ok(oFormField.getValue() === "sap-icon://cart", "SimpleForm field2: Has value");
									oFormField.setValue("sap-icon://accept");
									oFormField.fireChange({ value: "sap-icon://accept" });
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
									assert.ok(oFormField.getValue() === "text02", "SimpleForm field3: Has value");
									oFormField.setValue("textnew");
									oFormField.fireChange({ value: "textnew" });
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
									assert.ok(oFormField.getValue() === "http://sapui5.hana.ondemand.com/05", "SimpleForm field4: Has value");
									oFormField.setValue("http://sapui5.hana.ondemand.com/06");
									oFormField.fireChange({ value: "http://sapui5.hana.ondemand.com/06" });
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
									oFormField.setSelected(true);
									oFormField.fireSelect({ selected: true });
									oFormLabel = oContents[10];
									oFormField = oContents[11];
									assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
									assert.ok(oFormField.getValue() === "2", "SimpleForm field6: Has value");
									oFormField.setValue("1");
									oFormField.fireChange({value: "1"});
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
									assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
									oFormField.setValue("0.55");
									oFormField.fireChange({ value: "0.55"});
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
									assert.ok(oFormField.getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "http://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#64E4CE",\n\t"int": 1,\n\t"number": 0.55,\n\t"editable": true\n}', "SimpleForm field textArea: Has changed value");
									oUpdateButtonInPopover.firePress();
									wait().then(function () {
										var oNewValue = {"text": "textnew", "key": "keynew", "url": "http://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#64E4CE", "int": 1, "editable": true, "number": 0.55};
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oNewValue, oValue5, oValue7, oValue1, oValue3, oValue4, oValue6, oValue8]), "Field 1: Value updated");
										assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected row index not change");
										assert.ok(deepEqual(oTable.getBinding().getContexts()[0].getObject(), oNewValue), "Table: selected row updated");
										resolve();
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					var oActionHBox = oTable.getRows()[0].getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oURLColumn = oTable.getColumns()[3];
					oTable.filter(oURLColumn, "http:");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering http:");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows");

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
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field8: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected row");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								var oSelectedRow = oTable.getRows()[0];
								assert.ok(deepEqual(oSelectedRow.getBindingContext().getObject(), oValue2), "Table: value row");
								var oActionHBox = oSelectedRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oEditButton = oActionHBox.getItems()[0];
								oEditButton.firePress();
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
									assert.ok(oContents[15].getValue() === '{\n\t"text": "text02",\n\t"key": "key02",\n\t"url": "http://sapui5.hana.ondemand.com/05",\n\t"icon": "sap-icon://cart",\n\t"iconcolor": "#64E4CE",\n\t"int": 2,\n\t"number": 3.55\n}', "SimpleForm field textArea: Has the value");
									var oFormLabel = oContents[0];
									var oFormField = oContents[1];
									assert.ok(oFormLabel.getText() === "Key", "SimpleForm label1: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
									assert.ok(oFormField.getValue() === "key02", "SimpleForm field1: Has value");
									oFormField.setValue("keynew");
									oFormField.fireChange({ value: "keynew" });
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getText() === "Icon", "SimpleForm label2: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
									assert.ok(oFormField.getValue() === "sap-icon://cart", "SimpleForm field2: Has value");
									oFormField.setValue("sap-icon://accept");
									oFormField.fireChange({ value: "sap-icon://accept" });
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getText() === "Text", "SimpleForm label3: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
									assert.ok(oFormField.getValue() === "text02", "SimpleForm field3: Has value");
									oFormField.setValue("textnew");
									oFormField.fireChange({ value: "textnew" });
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getText() === "URL", "SimpleForm label4: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
									assert.ok(oFormField.getValue() === "http://sapui5.hana.ondemand.com/05", "SimpleForm field4: Has value");
									oFormField.setValue("https://sapui5.hana.ondemand.com/06");
									oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
									oFormField.setSelected(true);
									oFormField.fireSelect({ selected: true });
									oFormLabel = oContents[10];
									oFormField = oContents[11];
									assert.ok(oFormLabel.getText() === "Integer", "SimpleForm label6: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
									assert.ok(oFormField.getValue() === "2", "SimpleForm field6: Has value");
									oFormField.setValue("1");
									oFormField.fireChange({value: "1"});
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getText() === "Number", "SimpleForm label7: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
									assert.ok(oFormField.getValue() === "3.6", "SimpleForm field7: Has value");
									oFormField.setValue("0.55");
									oFormField.fireChange({ value: "0.55"});
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(oFormLabel.getText() === "", "SimpleForm label8: Has no label text");
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
									assert.ok(oFormField.getValue() === '{\n\t"text": "textnew",\n\t"key": "keynew",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"icon": "sap-icon://accept",\n\t"iconcolor": "#64E4CE",\n\t"int": 1,\n\t"number": 0.55,\n\t"editable": true\n}', "SimpleForm field textArea: Has changed value");
									oUpdateButtonInPopover.firePress();
									wait().then(function () {
										var oNewValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#64E4CE", "int": 1, "editable": true, "number": 0.55};
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oValue1, oValue3, oValue4, oValue6, oValue8, oNewValue]), "Field 1: Value updated");
										assert.ok(oTable.getBinding().getCount() === 3, "Table: value length is 3");
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected row index change");
										oTable.filter(oURLColumn, "");
										assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
										wait().then(function () {
											assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
											assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: rows selected");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oValue1, oValue3, oValue4, oValue6, oValue8, oNewValue]), "Field 1: Value");
											assert.ok(deepEqual(oTable.getBinding().getContexts()[1].getObject(), oNewValue), "Table: row is updated");
											assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					var oActionHBox = oTable.getRows()[0].getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oURLColumn = oTable.getColumns()[3];
					oTable.filter(oURLColumn, "http:");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering http:");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows");

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
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field8: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							oAddButtonInPopover.firePress();
							wait().then(function () {
								var oNewObject = {"icon": "sap-icon://add", "text": "text", "url": "http://", "number": 0.5};
								assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected row");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								var oSelectedRow = oTable.getRows()[3];
								assert.ok(deepEqual(oSelectedRow.getBindingContext().getObject(), oNewObject), "Table: new row");
								var oActionHBox = oSelectedRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oEditButton = oActionHBox.getItems()[0];
								assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
								assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
								oEditButton.firePress();
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
									assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has no value");
									oFormField.setValue("keynew01");
									oFormField.fireChange({ value: "keynew01" });
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
									oFormField.setValue("http://sapui5.hana.ondemand.com/06");
									oFormField.fireChange({ value: "http://sapui5.hana.ondemand.com/06" });
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getText() === "Editable", "SimpleForm label5: Has label text");
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
									oFormField.setSelected(true);
									oFormField.fireSelect({ selected: true });
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
									assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "http://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "keynew01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field textArea: Has changed value");
									oUpdateButtonInPopover.firePress();
									wait().then(function () {
										assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not updated");
										assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected row index not change");
										assert.ok(deepEqual(oTable.getBinding().getContexts()[3].getObject(), {"icon": "sap-icon://accept", "text": "text01", "url": "http://sapui5.hana.ondemand.com/06", "number": 0.55, "key": "keynew01", "editable": true, "int": 1}), "Table: selected row updated");
										resolve();
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					var oActionHBox = oTable.getRows()[0].getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oURLColumn = oTable.getColumns()[3];
					oTable.filter(oURLColumn, "http:");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering http:");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows");

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
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field8: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							oAddButtonInPopover.firePress();
							wait().then(function () {
								var oNewObject = {"icon": "sap-icon://add", "text": "text", "url": "http://", "number": 0.5};
								assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected row");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								var oSelectedRow = oTable.getRows()[3];
								assert.ok(deepEqual(oSelectedRow.getBindingContext().getObject(), oNewObject), "Table: new row");
								var oActionHBox = oSelectedRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oEditButton = oActionHBox.getItems()[0];
								assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Table: Edit button icon");
								assert.ok(oEditButton.getVisible(), "Table: Edit button visible");
								oEditButton.firePress();
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
									assert.ok(oFormField.getValue() === "", "SimpleForm field1: Has no value");
									oFormField.setValue("keynew01");
									oFormField.fireChange({ value: "keynew01" });
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
									assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
									oFormField.setSelected(true);
									oFormField.fireSelect({ selected: true });
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
									assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://accept",\n\t"text": "text01",\n\t"url": "https://sapui5.hana.ondemand.com/06",\n\t"number": 0.55,\n\t"key": "keynew01",\n\t"editable": true,\n\t"int": 1\n}', "SimpleForm field textArea: Has changed value");
									oUpdateButtonInPopover.firePress();
									wait().then(function () {
										assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not updated");
										assert.ok(oTable.getBinding().getCount() === 3, "Table: value length is 3");
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected row index not change");
										oTable.filter(oURLColumn, "");
										assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
										wait().then(function () {
											assert.ok(oTable.getBinding().getCount() === 9, "Table: RowCount after removing filter");
											assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: rows selected");
											assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
											// scroll to bottom
											oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
											wait().then(function () {
												assert.ok(deepEqual(oTable.getBinding().getContexts()[8].getObject(), {"icon": "sap-icon://accept", "text": "text01", "url": "https://sapui5.hana.ondemand.com/06", "number": 0.55, "key": "keynew01", "editable": true, "int": 1}), "Table: new row is added and updated in the end");
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					var oActionHBox = oTable.getRows()[0].getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oURLColumn = oTable.getColumns()[3];
					oTable.filter(oURLColumn, "http:");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering http:");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows");

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
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field8: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected row");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								var oSelectedRow = oTable.getRows()[0];
								assert.ok(deepEqual(oSelectedRow.getBindingContext().getObject(), oValue2), "Table: value row");
								var oActionHBox = oSelectedRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Table: Delete Button is visible");
								oDeleteButton.firePress();
								wait().then(function () {
									assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oValue1, oValue3, oValue4, oValue6, oValue8]), "Field 1: Value deleted");
									assert.ok(oTable.getBinding().getCount() === 3, "Table: value length is 3");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1]), "Table: selected row changed");
									assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
									oTable.filter(oURLColumn, "");
									assert.ok(!oURLColumn.getFiltered(), "Table: Column Key is not filtered anymore");
									wait().then(function () {
										assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue5, oValue7, oValue1, oValue3, oValue4, oValue6, oValue8]), "Field 1: Value updated");
										assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
										assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6]), "Table: selected row index changed");
										assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
										resolve();
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					var oActionHBox = oTable.getRows()[0].getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oURLColumn = oTable.getColumns()[3];
					oTable.filter(oURLColumn, "http:");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering http:");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows");

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
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5\n}', "SimpleForm field8: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected row");
								assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value");
								assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is not checked");
								var oNotSelectedRow = oTable.getRows()[3];
								assert.ok(deepEqual(oNotSelectedRow.getBindingContext().getObject(), {"icon": "sap-icon://add", "text": "text", "url": "http://", "number": 0.5}), "Table: value row");
								var oActionHBox = oNotSelectedRow.getCells()[7];
								assert.ok(oActionHBox.getItems().length = 2, "Table: Action cell contains 2 buttons");
								var oDeleteButton = oActionHBox.getItems()[1];
								assert.ok(oDeleteButton.getVisible(), "Table: Delete Button is visible");
								oDeleteButton.firePress();
								wait().then(function () {
									assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value deleted");
									assert.ok(oTable.getBinding().getCount() === 3, "Table: value length is 3");
									assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected row not changed");
									assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
									oTable.filter(oURLColumn, "");
									assert.ok(!oURLColumn.getFiltered(), "Table: Column Key is not filtered anymore");
									wait().then(function () {
										assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value updated");
										assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
										assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row index not changed");
										assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
										resolve();
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
					assert.ok(oLabel.getText() === "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					var oActionHBox = oTable.getRows()[0].getCells()[7];
					assert.ok(oActionHBox.getItems().length = 2, "Row 1: Action cell contains 2 buttons");
					var oEditButton = oActionHBox.getItems()[0];
					assert.ok(oEditButton.getIcon() === "sap-icon://edit", "Row 1: Edit button icon");
					assert.ok(oEditButton.getVisible(), "Row 1: Edit button visible");
					var oDeleteButton = oActionHBox.getItems()[1];
					assert.ok(oDeleteButton.getVisible(), "Row 1: Delete button visible");
					var oURLColumn = oTable.getColumns()[3];
					oTable.filter(oURLColumn, "http:");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oTable.getBinding().getCount() === 3, "Table: RowCount after filtering http:");
						assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value not changed after filtering");
						assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
						assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected rows");

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
							assert.ok(oFormField.getValue() === '{\n\t"icon": "sap-icon://add",\n\t"text": "text",\n\t"url": "http://",\n\t"number": 0.5,\n\t"int": 1\n}', "SimpleForm field8: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover.getFooter().getContent()[1];
							oAddButtonInPopover.firePress();
							wait().then(function () {
								assert.ok(oTable.getBinding().getCount() === 4, "Table: value length is 4");
								assert.ok(deepEqual(oTable.getSelectedIndices(), [0, 1, 2]), "Table: selected row");
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
										oTable.filter(oURLColumn, "");
										oTable.filter(oIntColumn, "");
										assert.ok(!oURLColumn.getFiltered(), "Table: Column Key is not filtered anymore");
										assert.ok(!oIntColumn.getFiltered(), "Table: Column Integer is not filtered anymore");
										wait().then(function () {
											assert.ok(deepEqual(oField._getCurrentProperty("value"), aObjectsParameterValue), "Field 1: Value updated");
											assert.ok(oTable.getBinding().getCount() === 8, "Table: value length is 8");
											assert.ok(deepEqual(oTable.getSelectedIndices(), aSelectedIndices), "Table: selected row index not changed");
											assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Table: selectAll checkbox is checked");
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

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
