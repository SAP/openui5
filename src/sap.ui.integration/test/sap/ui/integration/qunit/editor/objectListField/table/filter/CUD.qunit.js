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
	var oDefaultNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
	var oDefaultNewObjectSelected = {"_dt": {"_selected": true},"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
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

	QUnit.module("CUD", {
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
		QUnit.test("add, match the filter key", function (assert) {
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
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oURLColumn = oTable.getColumns()[4];
					oTable.filter(oURLColumn, "https");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
						assert.equal(oTable.getBinding().getCount(), 5, "Table: RowCount after filtering https");
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");

						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[6];
							var oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.equal(oFormField.getValue(), "http://", "SimpleForm field4: Has value");
							oFormField.setValue("https://");
							oFormField.fireChange({ value: "https://" });
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
							assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5}), "SimpleForm field8: Has updated value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							oAddButtonInPopover.firePress();
							wait().then(function () {
								// scroll to bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									assert.equal(oTable.getBinding().getCount(), 6, "Table: value length is 6");
									assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[5].getObject()), {"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5, "_dt": {"_selected": true}}), "Table: new row is added to the end");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1.concat([{"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5}])), "Field 1: Value");
									oTable.filter(oURLColumn, "");
									assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
									wait().then(function () {
										assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
										assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount after removing filter");
										assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1.concat([{"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5}])), "Field 1: Value");
										// scroll to bottom
										oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
										wait().then(function () {
											assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[8].getObject()), {"icon": "sap-icon://add","text": "text","url": "https://","number": 0.5, "_dt": {"_selected": true}}), "Table: new row is added to the end");
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

		QUnit.test("add, not match the filter key", function (assert) {
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
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oURLColumn = oTable.getColumns()[4];
					oTable.filter(oURLColumn, "https");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
						assert.equal(oTable.getBinding().getCount(), 5, "Table: RowCount after filtering https");
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");

						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						oAddButton.firePress();
						wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[6];
							var oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.equal(oFormField.getValue(), "http://", "SimpleForm field4: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Visible");
							assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), oDefaultNewObjectSelected), "SimpleForm field8: Has updated value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							oAddButtonInPopover.firePress();
							wait().then(function () {
								// scroll to bottom
								oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
								wait().then(function () {
									assert.equal(oTable.getBinding().getCount(), 5, "Table: value length is 5");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1.concat([oDefaultNewObject])), "Field 1: Value");
									oTable.filter(oURLColumn, "");
									assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
									wait().then(function () {
										assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
										assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount after removing filter");
										assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1.concat([oDefaultNewObject])), "Field 1: Value");
										// scroll to bottom
										oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 400;
										wait().then(function () {
											assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[8].getObject()), {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5, "_dt": {"_selected": true}}), "Table: new row is added to the end");
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

		QUnit.test("update", function (assert) {
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
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oURLColumn = oTable.getColumns()[4];
					oTable.filter(oURLColumn, "http:");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.equal(oTable.getBinding().getCount(), 3, "Table: RowCount after filtering http:");
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");

						var oSelectedRow = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUIDAndPosition(oSelectedRow.getBindingContext().getObject()), { "text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55, "_dt": {"_selected": true} }), "Table: value row");
						var oEditButton = oToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
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
							assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), Object.assign(deepClone(oValue2), {"_dt": {"_selected": true}})), "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.equal(oFormField.getValue(), "key02", "SimpleForm field1: Has value");
							oFormField.setValue("keynew");
							oFormField.fireChange({ value: "keynew" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.equal(oFormField.getValue(), "sap-icon://cart", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "text02", "SimpleForm field3: Has value");
							oFormField.setValue("textnew");
							oFormField.fireChange({ value: "textnew" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.equal(oFormField.getValue(), "http://sapui5.hana.ondemand.com/05", "SimpleForm field4: Has value");
							oFormField.setValue("http://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "http://sapui5.hana.ondemand.com/06" });
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
							assert.equal(oFormField.getValue(), "2", "SimpleForm field6: Has value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.equal(oFormField.getValue(), "3.6", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), {"text": "textnew","key": "keynew","url": "http://sapui5.hana.ondemand.com/06","icon": "sap-icon://accept","iconcolor": "#64E4CE","int": 1,"number": 0.55,"_dt": {"_selected": true},"editable": true}), "SimpleForm field textArea: Has changed value");
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								assert.equal(oTable.getBinding().getCount(), 3, "Table: RowCount after updating");
								var oNewValue = {"text": "textnew", "key": "keynew", "url": "http://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#64E4CE", "int": 1, "editable": true, "number": 0.55};
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oValue1, oNewValue, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
								assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[0].getObject()), {"text": "textnew", "key": "keynew", "url": "http://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#64E4CE", "int": 1, "editable": true, "number": 0.55, "_dt": {"_selected": true}}), "Table: selected row updated");
								assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
								oTable.filter(oURLColumn, "");
								assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
								wait().then(function () {
									assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
									assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount after removing filter");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oValue1, oNewValue, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
									assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[1].getObject()), {"text": "textnew", "key": "keynew", "url": "http://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#64E4CE", "int": 1, "editable": true, "number": 0.55, "_dt": {"_selected": true}}), "Table: selected row updated");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("update, but been filtered out", function (assert) {
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
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oURLColumn = oTable.getColumns()[4];
					oTable.filter(oURLColumn, "http:");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.equal(oTable.getBinding().getCount(), 3, "Table: RowCount after filtering http:");
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");

						var oSelectedRow = oTable.getRows()[0];
						assert.ok(deepEqual(cleanUUIDAndPosition(oSelectedRow.getBindingContext().getObject()), { "text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2, "number": 3.55, "_dt": {"_selected": true} }), "Table: value row");
						var oEditButton = oToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
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
							assert.ok(deepEqual(cleanUUIDAndPosition(oContents[15].getValue()), Object.assign(deepClone(oValue2), {"_dt": {"_selected": true}})), "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.equal(oFormField.getValue(), "key02", "SimpleForm field1: Has value");
							oFormField.setValue("keynew");
							oFormField.fireChange({ value: "keynew" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.equal(oFormField.getValue(), "sap-icon://cart", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "text02", "SimpleForm field3: Has value");
							oFormField.setValue("textnew");
							oFormField.fireChange({ value: "textnew" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.equal(oFormField.getValue(), "http://sapui5.hana.ondemand.com/05", "SimpleForm field4: Has value");
							oFormField.setValue("https://sapui5.hana.ondemand.com/06");
							oFormField.fireChange({ value: "https://sapui5.hana.ondemand.com/06" });
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
							assert.equal(oFormField.getValue(), "2", "SimpleForm field6: Has value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.equal(oFormField.getValue(), "3.6", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oNewValue = {"text": "textnew", "key": "keynew", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#64E4CE", "int": 1, "editable": true, "number": 0.55};
							assert.ok(deepEqual(cleanUUIDAndPosition(oFormField.getValue()), Object.assign(deepClone(oNewValue), {"_dt": {"_selected": true}})), "SimpleForm field textArea: Has changed value");
							oUpdateButtonInPopover.firePress();
							wait().then(function () {
								assert.equal(oTable.getBinding().getCount(), 2, "Table: RowCount after updating");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oValue1, oNewValue, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
								assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[0].getObject()), Object.assign(deepClone(oValue5), {"_dt": {"_selected": true}})), "Table: row 0");
								assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
								oTable.filter(oURLColumn, "");
								assert.ok(!oURLColumn.getFiltered(), "Table: Column URL is not filtered anymore");
								wait().then(function () {
									assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
									assert.equal(oTable.getBinding().getCount(), 8, "Table: RowCount after removing filter");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oValue1, oNewValue, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value updated");
									assert.ok(deepEqual(cleanUUIDAndPosition(oTable.getBinding().getContexts()[1].getObject()), Object.assign(deepClone(oNewValue), {"_dt": {"_selected": true}})), "Table: selected row updated");
									resolve();
								});
							});
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("delete", function (assert) {
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
					var oEditButton = oToolbar.getContent()[2];
					assert.ok(!oEditButton.getEnabled(), "Table toolbar: edit button disabled");
					var oDeleteButton = oToolbar.getContent()[3];
					assert.ok(!oDeleteButton.getEnabled(), "Table toolbar: delete button disabled");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
					assert.ok(oTable.getSelectedIndex() === -1 && oTable.getSelectedIndices().length === 0, "Table: no selected row");
					var oURLColumn = oTable.getColumns()[4];
					oTable.filter(oURLColumn, "http:");
					// check that the column menu filter input field was updated
					var oMenu = oURLColumn.getMenu();
					// open and close the menu to let it generate its items
					oMenu.open();
					oMenu.close();
					wait().then(function () {
						assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
						assert.equal(oTable.getBinding().getCount(), 3, "Table: RowCount after filtering http:");
						assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), aObjectsParameterValue1), "Field 1: Value not changed after filtering");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
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
								assert.ok(oClearFilterButton.getEnabled(), "Table toolbar: clear filter button enabled");
								assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oValue1, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value deleted");
								assert.equal(oTable.getBinding().getCount(), 2, "Table: value length is 2");
								oTable.filter(oURLColumn, "");
								assert.ok(!oURLColumn.getFiltered(), "Table: Column Key is not filtered anymore");
								wait().then(function () {
									assert.ok(!oClearFilterButton.getEnabled(), "Table toolbar: clear filter button disabled");
									assert.ok(deepEqual(cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oValue1, oValue3, oValue4, oValue5, oValue6, oValue7, oValue8]), "Field 1: Value deleted");
									assert.equal(oTable.getBinding().getCount(), 7, "Table: value length is 7");
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
