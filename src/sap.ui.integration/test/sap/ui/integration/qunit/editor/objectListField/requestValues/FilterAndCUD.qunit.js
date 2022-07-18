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
	var oEditObject = {"text": "textnew","key": "keynew","url": "https://sapui5.hana.ondemand.com/04","icon": "sap-icon://zoom-in","iconcolor": "#E69A17","int": 3,"_dt": {"_selected": true}};

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

	QUnit.module("CUD", {
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
		QUnit.test("add - match the filter key", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					oField.attachEventOnce("tableUpdated", function(oEvent) {
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
						var oURLColumn = oColumns[4];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("http://");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.equal(oTable.getBinding().getCount(), 3, "Table: RowCount after filtering column URL with 'http://'");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
							var oToolbar = oTable.getToolbar();
							assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
							var oAddButton = oToolbar.getContent()[1];
							assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
							oAddButton.firePress();
							wait().then(function () {
								var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
								var oContents = oSimpleForm.getContent();
								assert.equal(oContents.length, 16, "SimpleForm: length");
								var oFormLabel = oContents[0];
								var oFormField = oContents[1];
								assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
								assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
								assert.equal(oFormField.getValue(), "sap-icon://add", "SimpleForm field2: Has value");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
								assert.equal(oFormField.getValue(), "text", "SimpleForm field3: Has value");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
								assert.equal(oFormField.getValue(), "http://", "SimpleForm field4: Has value");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
								assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
								assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
								assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
								assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
								assert.equal(oFormField.getValue(), "", "SimpleForm field6: Has No value");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
								assert.equal(oFormField.getValue(), "0.5", "SimpleForm field7: Has value");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
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
									assert.equal(oTable.getBinding().getCount(), 4, "Table: value length is 4");
									assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[3].getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row data");
									var oNewRow = oTable.getRows()[3];
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

		QUnit.test("add - not match the filter key", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					oField.attachEventOnce("tableUpdated", function(oEvent) {
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
						var oURLColumn = oColumns[4];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("http://");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.equal(oTable.getBinding().getCount(), 3, "Table: RowCount after filtering column URL with 'http://'");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
							var oToolbar = oTable.getToolbar();
							assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
							var oAddButton = oToolbar.getContent()[1];
							assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
							oAddButton.firePress();
							wait().then(function () {
								var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
								var oContents = oSimpleForm.getContent();
								assert.equal(oContents.length, 16, "SimpleForm: length");
								var oFormLabel = oContents[0];
								var oFormField = oContents[1];
								assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
								assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
								assert.equal(oFormField.getValue(), "sap-icon://add", "SimpleForm field2: Has value");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
								assert.equal(oFormField.getValue(), "text", "SimpleForm field3: Has value");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
								assert.equal(oFormField.getValue(), "http://", "SimpleForm field4: Has value");
								oFormField.setValue("https://");
								oFormField.fireChange({ value: "https://" });
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
								assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: SwitchField");
								assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
								assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
								assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
								assert.equal(oFormField.getValue(), "", "SimpleForm field6: Has No value");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
								assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
								assert.equal(oFormField.getValue(), "0.5", "SimpleForm field7: Has value");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
								assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
								assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), Object.assign(oDefalutNewObjectSelected, {"url": "https://"})), "SimpleForm field textArea: Has changed value");
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
									var oNewObject = {"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5};
									assert.equal(oTable.getBinding().getCount(), 3, "Table: value length is still 3");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue.concat(oNewObject)), "Field 1: DT Value");

									// clear all the filters
									oClearFilterButton.firePress();
									wait().then(function () {
										assert.equal(oTable.getBinding().getCount(), 10, "Table: RowCount after removing all the filters");
										assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue.concat(oNewObject)), "Field 1: Value");
										// scroll to the bottom
										oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
										wait().then(function () {
											var oNewRow = oTable.getRows()[4];
											assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oNewObject), {"_dt": {"_selected": true}})), "Table: new row in the bottom");
											var oSelectionCell10 = oNewRow.getCells()[0];
											assert.ok(oSelectionCell10.getSelected(), "Row 10: selected");
											assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue.concat(oNewObject)), "Field 1: DT Value");
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

		QUnit.test("update selected object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					oField.attachEventOnce("tableUpdated", function(oEvent) {
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
						var oURLColumn = oColumns[4];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.equal(oTable.getBinding().getCount(), 6, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
							var oNewRow = oTable.getRows()[3];
							assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oValueNew), ({"_dt": {"_selected": true}}))), "Row 4: value");
							var oSelectionCell4 = oNewRow.getCells()[0];
							assert.ok(oSelectionCell4.getSelected(), "Row 4: selected");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
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
								assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), oEditObject), "SimpleForm field textArea: Has the value");
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
								assert.equal(oFormField.getValue(), "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
								oFormField.setValue("https://sapui5.hana.ondemand.com/06");
								oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
								assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: Switch Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
								assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
								assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
								oFormField.setState(true);
								oFormField.fireChange({ state: true });
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
								assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), Object.assign(deepClone(oValue1Ori, 500), {"_dt": {"_selected": true}, "number": 0.55})), "SimpleForm field textArea: Has changed value");
								oUpdateButtonInPopover.firePress();
								wait().then(function () {
									var oNewValue = {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#E69A17", "int": 1, "editable": true, "number": 0.55};
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
										Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}}),
										oNewValue
									]), "Field 1: Value updated");
									assert.equal(oTable.getBinding().getCount(), 6, "Table: value length is still 6 after updating");
									assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oNewValue), ({"_dt": {"_selected": true}}))), "Row 4: new value");
									assert.ok(oSelectionCell4.getSelected(), "Row 4: still selected");
									resolve();
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
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					oField.attachEventOnce("tableUpdated", function(oEvent) {
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
						var oURLColumn = oColumns[4];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.equal(oTable.getBinding().getCount(), 6, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
							var oNewRow = oTable.getRows()[3];
							assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oValueNew), ({"_dt": {"_selected": true}}))), "Row 4: value");
							var oSelectionCell4 = oNewRow.getCells()[0];
							assert.ok(oSelectionCell4.getSelected(), "Row 4: selected");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
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
								assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), oEditObject), "SimpleForm field textArea: Has the value");
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
								assert.equal(oFormField.getValue(), "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
								oFormField.setValue("http://sapui5.hana.ondemand.com/06");
								oFormField.fireChange({ value: "http://sapui5.hana.ondemand.com/06" });
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
								assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: Switch Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
								assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
								assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
								oFormField.setState(true);
								oFormField.fireChange({ state: true });
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
								var oNewValue = {"text": "text01", "key": "key01", "url": "http://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#E69A17", "int": 1, "editable": true, "number": 0.55};
								assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), Object.assign(deepClone(oNewValue, 500), {"_dt": {"_selected": true}})), "SimpleForm field textArea: Has changed value");
								oUpdateButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
										Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}}),
										oNewValue
									]), "Field 1: Value updated");
									assert.equal(oTable.getBinding().getCount(), 5, "Table: value length is 5 after updating");
									// clear all the filters
									oClearFilterButton.firePress();
									wait().then(function () {
										assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount after removing all the filters");
										assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
											Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
											Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
											Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
											Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
											Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}}),
											oNewValue
										]), "Field 1: Value");
										// scroll to the bottom
										oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
										wait().then(function () {
											var oNewRow = oTable.getRows()[1];
											assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oNewValue), ({"_dt": {"_selected": true}}))), "Row 4: new value");
											var oSelectionCell6 = oNewRow.getCells()[0];
											assert.ok(oSelectionCell6.getSelected(), "Row 6: selected");
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
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					oField.attachEventOnce("tableUpdated", function(oEvent) {
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
						var oURLColumn = oColumns[4];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.equal(oTable.getBinding().getCount(), 6, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
							var oNewRow = oTable.getRows()[3];
							assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oValueNew), ({"_dt": {"_selected": true}}))), "Row 4: value");
							var oSelectionCell4 = oNewRow.getCells()[0];
							assert.ok(oSelectionCell4.getSelected(), "Row 4: selected");
							oSelectionCell4.setSelected(false);
							oSelectionCell4.fireSelect({ selected: false });
							assert.ok(!oSelectionCell4.getSelected(), "Row 4: not selected");
							assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oValueNew), ({"_dt": {"_selected": false}}))), "Row 4: value after deselecting");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
								Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
								Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
								Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
								Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
								Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
							]), "Field 1: Value after deselecting row4");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
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
								assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), Object.assign(oEditObject, {"_dt":{"_selected":false}})), "SimpleForm field textArea: Has the value");
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
								assert.equal(oFormField.getValue(), "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
								oFormField.setValue("https://sapui5.hana.ondemand.com/06");
								oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
								assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: Switch Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
								assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
								assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
								oFormField.setState(true);
								oFormField.fireChange({ state: true });
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
								var oNewValue = {"text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#E69A17", "int": 1, "editable": true, "number": 0.55};
								assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), Object.assign(deepClone(oNewValue, 500), {"_dt": {"_selected": false}})), "SimpleForm field textArea: Has changed value");
								oUpdateButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
										Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
									]), "Field 1: Value not changed");
									assert.equal(oTable.getBinding().getCount(), 6, "Table: value length is still 6 after updating");
									assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oNewValue), ({"_dt": {"_selected": false}}))), "Row 6: new value");
									assert.ok(!oSelectionCell4.getSelected(), "Row 4: still not selected");
									resolve();
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
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					oField.attachEventOnce("tableUpdated", function(oEvent) {
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
						var oURLColumn = oColumns[4];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.equal(oTable.getBinding().getCount(), 6, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
							var oNewRow = oTable.getRows()[3];
							assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oValueNew), ({"_dt": {"_selected": true}}))), "Row 4: value");
							var oSelectionCell4 = oNewRow.getCells()[0];
							assert.ok(oSelectionCell4.getSelected(), "Row 4: selected");
							oSelectionCell4.setSelected(false);
							oSelectionCell4.fireSelect({ selected: false });
							assert.ok(!oSelectionCell4.getSelected(), "Row 4: not selected");
							assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oValueNew), ({"_dt": {"_selected": false}}))), "Row 4: value after deselecting");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
								Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
								Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
								Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
								Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
								Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
							]), "Field 1: Value after deselecting row4");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
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
								assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), Object.assign(oEditObject, {"_dt":{"_selected":false}})), "SimpleForm field textArea: Has the value");
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
								assert.equal(oFormField.getValue(), "https://sapui5.hana.ondemand.com/04", "SimpleForm field4: Has value");
								oFormField.setValue("http://sapui5.hana.ondemand.com/06");
								oFormField.fireChange({ value: "http://sapui5.hana.ondemand.com/06" });
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
								assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
								assert.ok(oFormField.isA("sap.m.Switch"), "SimpleForm Field5: Switch Field");
								assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
								assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
								assert.ok(!oFormField.getState(), "SimpleForm field5: Has No value");
								oFormField.setState(true);
								oFormField.fireChange({ state: true });
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
								var oNewValue = {"text": "text01", "key": "key01", "url": "http://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#E69A17", "int": 1, "editable": true, "number": 0.55};
								assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()),  Object.assign(deepClone(oNewValue, 500), {"_dt": {"_selected": false}})), "SimpleForm field textArea: Has changed value");
								oUpdateButtonInPopover.firePress();
								wait().then(function () {
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
										Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
									]), "Field 1: Value not changed");
									assert.equal(oTable.getBinding().getCount(), 5, "Table: value length is 5 after updating");
									// clear all the filters
									oClearFilterButton.firePress();
									wait().then(function () {
										assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount after removing all the filters");
										assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
											Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
											Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
											Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
											Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
											Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
										]), "Field 1: Value");
										// scroll to the bottom
										oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
										wait().then(function () {
											var oNewRow = oTable.getRows()[1];
											assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oNewValue), ({"_dt": {"_selected": false}}))), "Row 6: new value");
											var oSelectionCell6 = oNewRow.getCells()[0];
											assert.ok(!oSelectionCell6.getSelected(), "Row 6: not selected");
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

		QUnit.test("delete selected object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oDeleteButon = oToolbar.getContent()[3];
					assert.ok(!oDeleteButon.getEnabled(), "Table toolbar: delete button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					oField.attachEventOnce("tableUpdated", function(oEvent) {
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
						var oURLColumn = oColumns[4];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.equal(oTable.getBinding().getCount(), 6, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
							var oNewRow = oTable.getRows()[3];
							assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oValueNew), ({"_dt": {"_selected": true}}))), "Row 4: value");
							var oSelectionCell4 = oNewRow.getCells()[0];
							assert.ok(oSelectionCell4.getSelected(), "Row 4: selected");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oDeleteButon.getEnabled(), "Table toolbar: delete button enabled");
							oDeleteButon.firePress();
							wait().then(function () {
								var sMessageBoxId = document.querySelector(".sapMMessageBox").id;
								var oMessageBox = Core.byId(sMessageBoxId);
								var oOKButton = oMessageBox._getToolbar().getContent()[1];
								oOKButton.firePress();
								wait().then(function () {
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
										Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
									]), "Field 1: Value updated");
									assert.equal(oTable.getBinding().getCount(), 5, "Table: value length is still 5 after deleting");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete not selected object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFields
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from request", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: DT Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oDeleteButon = oToolbar.getContent()[3];
					assert.ok(!oDeleteButon.getEnabled(), "Table toolbar: delete button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					oField.attachEventOnce("tableUpdated", function(oEvent) {
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), (oResponseData.Objects.length + 1), "Table: value length is " + (oResponseData.Objects.length + 1));
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column visible");
						assert.ok(oSelectOrUnSelectAllButton.getEnabled(), "Table: Select or Unselect All button in Selection column enabled");
						assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");
						var oURLColumn = oColumns[4];
						var oMenu = oURLColumn.getMenu();
						// open the column filter menu, input filter value, close the menu.
						oMenu.open();
						oMenu.getItems()[0].setValue("https");
						oMenu.getItems()[0].fireSelect();
						oMenu.close();
						wait().then(function () {
							assert.equal(oTable.getBinding().getCount(), 6, "Table: RowCount after filtering column URL with 'https'");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue), "Field 1: Value not changed after filtering");
							assert.ok(!oSelectOrUnSelectAllButton.getSelected(), "Table: Select or Unselect All button in Selection column not selected");

							assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
							var oNewRow = oTable.getRows()[3];
							assert.ok(deepEqual(cleanUUIDAndPosition(oNewRow.getBindingContext().getObject()), Object.assign(deepClone(oValueNew), ({"_dt": {"_selected": true}}))), "Row 4: value");
							var oSelectionCell4 = oNewRow.getCells()[0];
							assert.ok(oSelectionCell4.getSelected(), "Row 4: selected");
							oSelectionCell4.setSelected(false);
							oSelectionCell4.fireSelect({ selected: false});
							assert.ok(!oSelectionCell4.getSelected(), "Row 4: not selected");
							assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
								Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
								Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
								Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
								Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
								Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
							]), "Field 1: Value updated after deselecting");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oDeleteButon.getEnabled(), "Table toolbar: delete button enabled");
							oDeleteButon.firePress();
							wait().then(function () {
								var sMessageBoxId = document.querySelector(".sapMMessageBox").id;
								var oMessageBox = Core.byId(sMessageBoxId);
								var oOKButton = oMessageBox._getToolbar().getContent()[1];
								oOKButton.firePress();
								wait().then(function () {
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [
										Object.assign(deepClone(oValue1Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue3Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue5Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue7Ori), {"_dt": {"_editable": false}}),
										Object.assign(deepClone(oValue8Ori), {"_dt": {"_editable": false}})
									]), "Field 1: Value not change after deleting");
									assert.equal(oTable.getBinding().getCount(), 5, "Table: value length is still 5 after deleting");
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
