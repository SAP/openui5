/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/base/i18n/ResourceBundle",
	"qunit/designtime/EditorQunitUtils"
], function (
	merge,
	x,
	Editor,
	CardEditor,
	Designtime,
	Host,
	sinon,
	ContextHost,
	Core,
	QUnitUtils,
	KeyCodes,
	ResourceBundle,
	EditorQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	QUnit.module("Basic", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("Basic fields", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/ids",
						"type": "List",
						"header": {},
						"configuration": {
							"parameters": {
								"string": {
									"value": "string value"
								},
								"integerVisualization": {
									"value": 3
								},
								"booleanVisualization": {
									"value": true
								},
								"date": {
									"value": "2023-04-03"
								},
								"datetime": {
									"value": "2023-04-03 16:03:01"
								},
								"number": {
									"value": 3.2
								},
								"stringArrayParameterNoValues": {}
							},
							"destinations": {
								"string": {
									"name": "Simple",
									"label": "String destination Label"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();

					var oGeneralGroupField = this.oEditor.getAggregation("_formContent")[0];
					assert.ok(oGeneralGroupField.isA("sap.ui.integration.editor.fields.GroupField"), "Field: Group Field");
					assert.equal(oGeneralGroupField.getId(), sEditorId + "_generalPanel_field", "Field: id");
					assert.ok(oGeneralGroupField.getAggregation("_field").isA("sap.m.Panel"), "Field: Default Panel control");
					assert.equal(oGeneralGroupField.getAggregation("_field").getId(), sEditorId + "_generalPanel_control", "Field: control id");

					var oLabel0 = this.oEditor.getAggregation("_formContent")[1];
					var oField0 = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel0.isA("sap.m.Label"), "Label: correct");
					assert.equal(oLabel0.getText(), "String Label", "Label: Has label text");
					assert.equal(oLabel0.getId(), sEditorId + "_string_label", "Label: id");
					assert.ok(oField0.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField0.getId(), sEditorId + "_string_field", "Field: id");
					assert.ok(oField0.getAggregation("_field").isA("sap.m.Input"), "Field: Default Input control");
					assert.equal(oField0.getAggregation("_field").getValue(), "string value", "Field: Value correct");
					assert.equal(oField0.getAggregation("_field").getId(), sEditorId + "_string_control", "Field: control id");
					assert.equal(oField0.getAggregation("_dynamicField").getId(), sEditorId + "_string_dynamic_control", "Field: dynamic control id");
					assert.equal(oField0.getAggregation("_field")._getValueHelpIcon().getId(), sEditorId + "_string_control-vhi", "Field: control help button id");
					assert.ok(Core.byId(sEditorId + "_string_control-vhi"), "Field: control help button exist");
					assert.ok(oField0.getAssociation("_messageStrip"), sEditorId + "_strip", "MessageStrip: id");

					var oLabel1 = this.oEditor.getAggregation("_formContent")[3];
					var oField1 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel1.isA("sap.m.Label"), "Label: correct");
					assert.equal(oLabel1.getText(), "Integer Label", "Label: Has label text");
					assert.equal(oLabel1.getId(), sEditorId + "_integer_label", "Label: id");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.equal(oField1.getId(), sEditorId + "_integer_field", "Field: id");
					assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "Field: Default Input control");
					assert.equal(oField1.getAggregation("_field").getId(), sEditorId + "_integer_control", "Field: control id");
					assert.equal(oField1.getAssociation("_messageStrip"), sEditorId + "_strip", "MessageStrip: id");

					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel2.isA("sap.m.Label"), "Label: correct");
					assert.equal(oLabel2.getText(), "Integer Label using Slider", "Label: Has label text");
					assert.equal(oLabel2.getId(), sEditorId + "_integerVisualization_label", "Label: id");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.equal(oField2.getId(), sEditorId + "_integerVisualization_field", "Field: id");
					assert.ok(oField2.getAggregation("_field").isA("sap.m.Slider"), "Field: Slider control");
					assert.equal(oField2.getAggregation("_field").getId(), sEditorId + "_integerVisualization_control", "Field: control id");
					assert.equal(oField2.getAggregation("_field").getValue(), 3, "Field: Value correct");

					var oLabel3 = this.oEditor.getAggregation("_formContent")[7];
					var oField3 = this.oEditor.getAggregation("_formContent")[8];
					assert.ok(oLabel3.isA("sap.m.Label"), "Label: correct");
					assert.equal(oLabel3.getText(), "Boolean Label", "Label: Has label text");
					assert.equal(oLabel3.getId(), sEditorId + "_boolean_label", "Label: id");
					assert.ok(oField3.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.equal(oField3.getId(), sEditorId + "_boolean_field", "Field: id");
					assert.ok(oField3.getAggregation("_field").isA("sap.m.CheckBox"), "Field: Default CheckBox control");
					assert.equal(oField3.getAggregation("_field").getId(), sEditorId + "_boolean_control", "Field: control id");

					var oLabel4 = this.oEditor.getAggregation("_formContent")[9];
					var oField4 = this.oEditor.getAggregation("_formContent")[10];
					assert.ok(oLabel4.isA("sap.m.Label"), "Label: correct");
					assert.equal(oLabel4.getText(), "Boolean Label using Switch", "Label: Has label text");
					assert.equal(oLabel4.getId(), sEditorId + "_booleanVisualization_label", "Label: id");
					assert.ok(oField4.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.equal(oField4.getId(), sEditorId + "_booleanVisualization_field", "Field: id");
					assert.ok(oField4.getAggregation("_field").isA("sap.m.Switch"), "Field: Switch control");
					assert.ok(oField4.getAggregation("_field").getState() === true, "Field: Value correct");
					assert.equal(oField4.getAggregation("_field").getId(), sEditorId + "_booleanVisualization_control", "Field: control id");

					var oLabel5 = this.oEditor.getAggregation("_formContent")[11];
					var oField5 = this.oEditor.getAggregation("_formContent")[12];
					assert.ok(oLabel5.isA("sap.m.Label"), "Label: correct");
					assert.equal(oLabel5.getText(), "Date Label", "Label: Has label text");
					assert.equal(oLabel5.getId(), sEditorId + "_date_label", "Label: id");
					assert.ok(oField5.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
					assert.equal(oField5.getId(), sEditorId + "_date_field", "Field: id");
					assert.ok(oField5.getAggregation("_field").isA("sap.m.DatePicker"), "Field: DatePicker control");
					assert.equal(oField5.getAggregation("_field").getId(), sEditorId + "_date_control", "Field: control id");

					var oLabel6 = this.oEditor.getAggregation("_formContent")[13];
					var oField6 = this.oEditor.getAggregation("_formContent")[14];
					assert.ok(oLabel6.isA("sap.m.Label"), "Label: correct");
					assert.equal(oLabel6.getText(), "Datetime Label", "Label: Has label text");
					assert.equal(oLabel6.getId(), sEditorId + "_datetime_label", "Label: id");
					assert.ok(oField6.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
					assert.equal(oField6.getId(), sEditorId + "_datetime_field", "Field: id");
					assert.ok(oField6.getAggregation("_field").isA("sap.m.DateTimePicker"), "Field: DateTimePicker control");
					assert.equal(oField6.getAggregation("_field").getId(), sEditorId + "_datetime_control", "Field: control id");

					var oLabel7 = this.oEditor.getAggregation("_formContent")[15];
					var oField7 = this.oEditor.getAggregation("_formContent")[16];
					assert.ok(oLabel7.isA("sap.m.Label"), "Label: correct");
					assert.equal(oLabel7.getText(), "Number Label", "Label: Has label text");
					assert.equal(oLabel7.getId(), sEditorId + "_number_label", "Label: id");
					assert.ok(oField7.isA("sap.ui.integration.editor.fields.NumberField"), "Field: Numer Field");
					assert.equal(oField7.getId(), sEditorId + "_number_field", "Field: id");
					assert.ok(oField7.getAggregation("_field").isA("sap.m.Input"), "Field: Default Input control");
					assert.equal(oField7.getAggregation("_field").getId(), sEditorId + "_number_control", "Field: control id");
					assert.equal(oField7.getAggregation("_field").getValue(), 3.2, "Field: Value correct");

					var oLabel8 = this.oEditor.getAggregation("_formContent")[17];
					var oField8 = this.oEditor.getAggregation("_formContent")[18];
					assert.ok(oLabel8.isA("sap.m.Label"), "Label: correct");
					assert.equal(oLabel8.getText(), "StringArrayWithNoValues Label", "Label: Has label text");
					assert.equal(oLabel8.getId(), sEditorId + "_stringArrayWithNoValues_label", "Label: id");
					assert.ok(oField8.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringList Field");
					assert.equal(oField8.getId(), sEditorId + "_stringArrayWithNoValues_field", "Field: id");
					assert.ok(oField8.getAggregation("_field").isA("sap.m.Input"), "Field: Default Input control");
					assert.equal(oField8.getAggregation("_field").getId(), sEditorId + "_stringArrayWithNoValues_control", "Field: control id");

					var oLabel9 = this.oEditor.getAggregation("_formContent")[19];
					var oField9 = this.oEditor.getAggregation("_formContent")[20];
					assert.ok(oLabel9.isA("sap.m.Label"), "Label: correct");
					assert.equal(oLabel9.getText(), "StringArray Label", "Label: Has label text");
					assert.equal(oLabel9.getId(), sEditorId + "_stringArray_label", "Label: id");
					assert.ok(oField9.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringList Field");
					assert.equal(oField9.getId(), sEditorId + "_stringArray_field", "Field: id");
					assert.ok(oField9.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: MultiComboBox control");
					assert.equal(oField9.getAggregation("_field").getId(), sEditorId + "_stringArray_control", "Field: control id");

					var oLabel10 = this.oEditor.getAggregation("_formContent")[21];
					var oField10 = this.oEditor.getAggregation("_formContent")[22];
					assert.ok(oLabel10.isA("sap.m.Label"), "Label: correct");
					assert.equal(oLabel10.getText(), "StringArrayWithRequestAndMultiInput Label", "Label: Has label text");
					assert.equal(oLabel10.getId(), sEditorId + "_stringArrayWithRequestAndMultiInput_label", "Label: id");
					assert.ok(oField10.isA("sap.ui.integration.editor.fields.StringListField"), "Field: StringList Field");
					assert.equal(oField10.getId(), sEditorId + "_stringArrayWithRequestAndMultiInput_field", "Field: id");
					assert.ok(oField10.getAggregation("_field").isA("sap.m.MultiInput"), "Field: MultiInput control");
					assert.equal(oField10.getAggregation("_field").getId(), sEditorId + "_stringArrayWithRequestAndMultiInput_control", "Field: control id");

					var oDestinationGroupField = this.oEditor.getAggregation("_formContent")[23];
					assert.ok(oDestinationGroupField.isA("sap.ui.integration.editor.fields.GroupField"), "Field: Group Field");
					assert.equal(oDestinationGroupField.getId(), sEditorId + "_destination.group_field", "Field: id");
					assert.ok(oDestinationGroupField.getAggregation("_field").isA("sap.m.Panel"), "Field: Default Panel control");
					assert.equal(oDestinationGroupField.getAggregation("_field").getId(), sEditorId + "_destination.group_control", "Field: control id");

					var oLabel11 = this.oEditor.getAggregation("_formContent")[24];
					var oField11 = this.oEditor.getAggregation("_formContent")[25];
					assert.ok(oLabel11.isA("sap.m.Label"), "Label: correct");
					assert.equal(oLabel11.getText(), "String destination Label", "Label: Has label text");
					assert.equal(oLabel11.getId(), sEditorId + "_string.destination_label", "Label: id");
					assert.ok(oField11.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");
					assert.equal(oField11.getId(), sEditorId + "_string.destination_field", "Field: id");
					assert.ok(oField11.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Default ComboBox control");
					assert.equal(oField11.getAggregation("_field").getId(), sEditorId + "_string.destination_control", "Field: control id");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Hints", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/hints",
						"type": "List",
						"configuration": {
							"parameters": {
								"string": {
									"value": "string"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oHint1 = this.oEditor.getAggregation("_formContent")[1];
					assert.equal(oHint1.getId(), sEditorId + "_group_hint", "Hint of group: id");
					var oHint2 = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oHint2.getId(), sEditorId + "_string_hint", "Hint of string: id");
					var oHint3 = this.oEditor.getAggregation("_formContent")[6];
					assert.equal(oHint3.getId(), sEditorId + "_subGroup1_hint", "Hint of subGroup1: id");
					var oHint4 = this.oEditor.getAggregation("_formContent")[9];
					assert.equal(oHint4.getId(), sEditorId + "_string1_hint", "Hint of string1: id");
					var oHint5 = this.oEditor.getAggregation("_formContent")[13];
					assert.equal(oHint5.getId(), sEditorId + "_subGroup2_hint", "Hint of tab subGroup2: id");
					var oHint6 = this.oEditor.getAggregation("_formContent")[18];
					assert.equal(oHint6.getId(), sEditorId + "_string4_hint", "Hint of string4: id");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Description Icon", function (assert) {
			var oJson = { baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } };
			this.oEditor.setJson(oJson);
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.equal(oField._descriptionIcon.getId(), sEditorId + "_stringParameter_description_icon", "Description Icon: id");
					assert.ok(Core.byId(oField._descriptionIcon.getId()), "Description Icon: exist");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Message Icon", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": ""
							}
						}
					}
				}
			};
			this.oEditor.setDesigntime({
				form: {
					items: {
						string1: {
							type: "string",
							label: "{i18n>string1label}",
							required: true,
							allowSettings: true,
							validation: {
								maxLength: 10
							},
							manifestpath: "/sap.card/configuration/parameters/string1/value"
						}
					}
				}
			});
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifest
			});

			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oField = this.oEditor.getAggregation("_formContent")[2];
					var sMessageIcon = oField.getAssociation("_messageIcon");
					assert.equal(sMessageIcon, sEditorId + "_string1_message_icon", "Message Icon: id");
					assert.ok(Core.byId(sMessageIcon), "Message Icon: exist");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Message strip of group and sub group", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "groupsWithErrorMessageStrip.json" });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					EditorQunitUtils.wait().then(function () {
						var sEditorId = this.oEditor.getId();
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						assert.equal(oPanel.getHeaderText(), "no default group", "Group text");
						var oMessageStripOfPanel = oPanel._messageStrip;
						assert.equal(oMessageStripOfPanel.getId(), sEditorId + "_group_strip", "MessageStrip of group: id");
						var oSubPanel = oPanel.getContent()[0].getAggregation("_field");
						assert.ok(oSubPanel.isA("sap.m.Panel"), "Item 1 of Default Panel is sub panel");
						assert.ok(oSubPanel.getExpanded(), "Sub group expanded by default");
						assert.equal(oSubPanel.getHeaderText(), "Sub group", "Sub group text");
						var oMessageStripOfSubPanel = oPanel.getContent()[1];
						assert.equal(oMessageStripOfSubPanel.getId(), sEditorId + "_subGroup_strip", "MessageStrip of sub group: id");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Message strip of sub tab", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "subTabsWithErrorMessageStrip.json" });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					EditorQunitUtils.wait().then(function () {
						var sEditorId = this.oEditor.getId();
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						assert.equal(oPanel.getHeaderText(), "no default group", "Group text");
						var oSubTab = oPanel.getContent()[1].getAggregation("_field");
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 0 of Default Panel is sub tab bar");
						assert.ok(oSubTab.getExpanded(), "Sub group expanded by default");
						var oMessageStripOfSubTab = oPanel.getContent()[0];
						assert.equal(oMessageStripOfSubTab.getId(), sEditorId + "_subGroup_strip", "MessageStrip of sub tab: id");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Translation mode", function (assert) {
			this.oEditor.setMode("translation");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/ids",
						"type": "List",
						"header": {},
						"configuration": {
							"parameters": {
								"string": {
									"value": "string value"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();

					var oTranslationTopPanelField = this.oEditor.getAggregation("_formContent")[0];
					assert.ok(oTranslationTopPanelField.isA("sap.ui.integration.editor.fields.GroupField"), "Field: Top Panel Group Field");
					assert.equal(oTranslationTopPanelField.getId(), sEditorId + "_translationTopPanel_field", "Field: Top Panel Group id");
					assert.ok(oTranslationTopPanelField.getAggregation("_field").isA("sap.m.Panel"), "Field: Top Panel Group control");
					assert.equal(oTranslationTopPanelField.getAggregation("_field").getId(), sEditorId + "_translationTopPanel_control", "Field: Top Panel Group control id");
					var oGeneralGroupField = this.oEditor.getAggregation("_formContent")[1];
					assert.ok(oGeneralGroupField.isA("sap.ui.integration.editor.fields.GroupField"), "Field: General Group Field");
					assert.equal(oGeneralGroupField.getId(), sEditorId + "_generalPanel_field", "Field: General Group id");
					assert.ok(oGeneralGroupField.getAggregation("_field").isA("sap.m.Panel"), "Field: General Panel Group control");
					assert.equal(oGeneralGroupField.getAggregation("_field").getId(), sEditorId + "_generalPanel_control", "Field: General Panel Group control id");

					var oLabel0 = this.oEditor.getAggregation("_formContent")[2];
					var oFieldOri = this.oEditor.getAggregation("_formContent")[3];
					var oFieldTrans = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel0.isA("sap.m.Label"), "Label: correct");
					assert.equal(oLabel0.getText(), "String Label", "Label: Has label text");
					assert.equal(oLabel0.getId(), sEditorId + "_string_label", "Label: id");
					assert.ok(oFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oFieldOri.getId(), sEditorId + "_string_ori_field", "Field: id");
					assert.ok(oFieldOri.getAggregation("_field").isA("sap.m.Text"), "Field: Default Text control");
					assert.equal(oFieldOri.getAggregation("_field").getText(), "string value", "Field: Value correct");
					assert.equal(oFieldOri.getAggregation("_field").getId(), sEditorId + "_string_ori_control", "Field: control id");
					assert.ok(oFieldTrans.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oFieldTrans.getId(), sEditorId + "_string_trans_field", "Field: id");
					assert.ok(oFieldTrans.getAggregation("_field").isA("sap.m.Input"), "Field: Default Input control");
					assert.equal(oFieldTrans.getAggregation("_field").getValue(), "string value", "Field: Value correct");
					assert.equal(oFieldTrans.getAggregation("_field").getId(), sEditorId + "_string_trans_control", "Field: control id");

					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Sub tab", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: sBaseUrl + "subTabsWithErrorMessageStrip.json" });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					EditorQunitUtils.wait().then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var sEditorId = this.oEditor.getId();
						var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
						assert.ok(oPanel.isA("sap.m.Panel"), "Field: Form content contains a Panel");
						assert.equal(oPanel.getHeaderText(), "no default group", "Group text");
						var oSubTab = oPanel.getContent()[1].getAggregation("_field");
						assert.ok(oSubTab.isA("sap.m.IconTabBar"), "Item 0 of Default Panel is sub tab bar");
						assert.equal(oSubTab.getId(), sEditorId + "_subGroup_control", "Field: sub tab bar id");
						assert.ok(oSubTab.getExpanded(), "Sub group expanded by default");
						var oMessageStripOfSubTab = oPanel.getContent()[0];
						assert.ok(!oMessageStripOfSubTab.getVisible(), "Message strip of sub tab is not visible since sub tab is expanded");
						assert.equal(oMessageStripOfSubTab.getId(), sEditorId + "_subGroup_strip", "Field: message strip id");
						var oSubTabFilter = oSubTab.getItems()[0];
						assert.equal(oSubTabFilter.getId(), sEditorId + "_subGroup_control_icontabfilter", "Field: sub tab filter id");
						oSubTab.setExpanded(false);
						EditorQunitUtils.wait(500).then(function () {
							var expandedBtn = oSubTabFilter._getExpandButton();
							assert.ok(expandedBtn.getVisible(), "Error icon appeared.");
							resolve();
							//TBD
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Object field", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("Textarea - no value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectField",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {}
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
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					var oTextArea = oField.getAggregation("_field");
					assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
					assert.equal(oTextArea.getId(), sEditorId + "_object_control", "Field 1: TextArea id");
					assert.equal(oTextArea.getValue(), "", "Field 1: Object Value null");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Textarea - value -> Simpleform", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectField",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22, "_dt": {"_uuid": "eec29fc6-d4a0-469e-a79d-e09486f74293"}}
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
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					var oSimpleForm = oField.getAggregation("_field");
					assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
					assert.equal(oSimpleForm.getId(), sEditorId + "_object_control", "Field 1: SimpleForm id");
					var aContents = oSimpleForm.getContent();
					assert.equal(aContents[0].getId(), sEditorId + "_object_control_form_property_string_label", "Field 1: SimpleForm property 'string' label id");
					assert.equal(aContents[1].getId(), sEditorId + "_object_control_form_property_string_control", "Field 1: SimpleForm property 'string' control id");
					assert.equal(aContents[2].getId(), sEditorId + "_object_control_form_property_boolean_label", "Field 1: SimpleForm property 'boolean' label id");
					assert.equal(aContents[3].getId(), sEditorId + "_object_control_form_property_boolean_control", "Field 1: SimpleForm property 'boolean' control id");
					assert.equal(aContents[4].getId(), sEditorId + "_object_control_form_property_integer_label", "Field 1: SimpleForm property 'integer' label id");
					assert.equal(aContents[5].getId(), sEditorId + "_object_control_form_property_integer_control", "Field 1: SimpleForm property 'integer' control id");
					assert.equal(aContents[6].getId(), sEditorId + "_object_control_form_property_number_label", "Field 1: SimpleForm property 'number' label id");
					assert.equal(aContents[7].getId(), sEditorId + "_object_control_form_property_number_control", "Field 1: SimpleForm property 'number' control id");
					assert.ok(!aContents[8].getVisible(), "Field 1: SimpleForm textarea label not visible");
					assert.equal(aContents[9].getId(), sEditorId + "_object_control_form_textarea", "Field 1: SimpleForm textarea control id");
					var oActions = oSimpleForm.getToolbar().getContent();
					assert.equal(oActions[1].getId(), sEditorId + "_object_control_form_editmode_btn", "Field 1: SimpleForm editmode button id");
					assert.equal(oActions[2].getId(), sEditorId + "_object_control_form_delete_btn", "Field 1: SimpleForm delete button id");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Simpleform", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldWithPropertiesDefined",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithPropertiesDefined": {}
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
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					var oSimpleForm = oField.getAggregation("_field");
					assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
					assert.equal(oSimpleForm.getId(), sEditorId + "_objectWithPropertiesDefined_control", "Field 1: SimpleForm id");
					var aContents = oSimpleForm.getContent();
					assert.equal(aContents[0].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_key_label", "Field 1: SimpleForm property 'key' label id");
					assert.equal(aContents[1].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_key_control", "Field 1: SimpleForm property 'key' control id");
					assert.equal(aContents[2].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_icon_label", "Field 1: SimpleForm property 'icon' label id");
					assert.equal(aContents[3].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_icon_control", "Field 1: SimpleForm property 'icon' control id");
					assert.equal(aContents[4].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_text_label", "Field 1: SimpleForm property 'text' label id");
					assert.equal(aContents[5].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_text_control", "Field 1: SimpleForm property 'text' control id");
					assert.equal(aContents[6].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_url_label", "Field 1: SimpleForm property 'url' label id");
					assert.equal(aContents[7].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_url_control", "Field 1: SimpleForm property 'url' control id");
					assert.equal(aContents[8].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_editable_label", "Field 1: SimpleForm property 'editable' label id");
					assert.equal(aContents[9].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_editable_control", "Field 1: SimpleForm property 'editable' control id");
					assert.equal(aContents[10].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_int_label", "Field 1: SimpleForm property 'int' label id");
					assert.equal(aContents[11].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_int_control", "Field 1: SimpleForm property 'int' control id");
					assert.equal(aContents[12].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_number_label", "Field 1: SimpleForm property 'number' label id");
					assert.equal(aContents[13].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_number_control", "Field 1: SimpleForm property 'number' control id");
					assert.ok(!aContents[14].getVisible(), "Field 1: SimpleForm textarea label not visible");
					assert.equal(aContents[15].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_textarea", "Field 1: SimpleForm textarea control id");
					var aActions = oSimpleForm.getToolbar().getContent();
					assert.equal(aActions[1].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_editmode_btn", "Field 1: SimpleForm editmode button id");
					assert.equal(aActions[2].getId(), sEditorId + "_objectWithPropertiesDefined_control_form_delete_btn", "Field 1: SimpleForm delete button id");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Table", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest:  {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldWithValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"}}
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
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is a table");
					assert.equal(oTable.getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control", "Table: id ok");
					assert.equal(oTable.getBinding().getCount(), 9, "Table: RowCount beforeFiltering ok");
					var aActions = oTable.getExtension()[0].getContent();
					assert.equal(aActions[1].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_add_btn", "Table: add button id");
					assert.equal(aActions[2].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_edit_btn", "Table: edit button id");
					assert.equal(aActions[3].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_delete_btn", "Table: delete button id");
					assert.equal(aActions[4].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_filter_btn", "Table: filter button id");
					assert.equal(aActions[5].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_multiselect_all_btn", "Table: multiselect_all button id");
					assert.equal(aActions[6].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_multiselect_none_btn", "Table: multiselect_none button id");
					var aColumns = oTable.getColumns();
					assert.equal(aColumns[0].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_column_selection", "Table: column selection id");
					assert.equal(aColumns[0].getMultiLabels()[0].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_column_selection_label_clearall_btn", "Table: column selection label button id");
					assert.equal(aColumns[1].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_column_property_key", "Table: column property 'key' id");
					assert.equal(aColumns[2].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_column_property_icon", "Table: column property 'icon' id");
					assert.equal(aColumns[3].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_column_property_text", "Table: column property 'text' id");
					assert.equal(aColumns[4].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_column_property_url", "Table: column property 'url' id");
					assert.equal(aColumns[5].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_column_property_editable", "Table: column property 'editable' id");
					assert.equal(aColumns[6].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_column_property_int", "Table: column property 'int' id");
					assert.equal(aColumns[7].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_table_column_property_number", "Table: column property 'number' id");
					var oAddButton = aActions[1];
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							assert.equal(oField._oObjectDetailsPopover.getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover", "Object Details popover: id");
							var oObjectDetailsPage = oField._oObjectDetailsPopover.getContent()[0].getPages()[0];
							var oEditModeButton = oObjectDetailsPage.getHeaderContent()[0];
							assert.equal(oEditModeButton.getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_editmode_btn", "Object Details popover: editmode button id");
							var aActionsInObjectDetailsPageFooter = oObjectDetailsPage.getFooter().getContent();
							assert.equal(aActionsInObjectDetailsPageFooter[1].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_add_btn", "Object Details popover: add button id");
							assert.equal(aActionsInObjectDetailsPageFooter[2].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_update_btn", "Object Details popover: update button id");
							assert.equal(aActionsInObjectDetailsPageFooter[3].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_cancel_btn", "Object Details popover: cancel button id");
							assert.equal(aActionsInObjectDetailsPageFooter[4].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_close_btn", "Object Details popover: close button id");
							var oSimpleForm = oObjectDetailsPage.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var aContents = oSimpleForm.getContent();
							assert.equal(aContents[0].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_key_label", "Object Details popover: SimpleForm property 'key' label id");
							assert.equal(aContents[1].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_key_control", "Object Details popover: SimpleForm property 'key' control id");
							assert.equal(aContents[2].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_icon_label", "Object Details popover: SimpleForm property 'icon' label id");
							assert.equal(aContents[3].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_icon_control", "Object Details popover: SimpleForm property 'icon' control id");
							assert.equal(aContents[4].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_text_label", "Object Details popover: SimpleForm property 'text' label id");
							assert.equal(aContents[5].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_text_control", "Object Details popover: SimpleForm property 'text' control id");
							assert.equal(aContents[6].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_url_label", "Object Details popover: SimpleForm property 'url' label id");
							assert.equal(aContents[7].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_url_control", "Object Details popover: SimpleForm property 'url' control id");
							assert.equal(aContents[8].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_editable_label", "Object Details popover: SimpleForm property 'editable' label id");
							assert.equal(aContents[9].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_editable_control", "Object Details popover: SimpleForm property 'editable' control id");
							assert.equal(aContents[10].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_int_label", "Object Details popover: SimpleForm property 'int' label id");
							assert.equal(aContents[11].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_int_control", "Object Details popover: SimpleForm property 'int' control id");
							assert.equal(aContents[12].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_number_label", "Object Details popover: SimpleForm property 'number' label id");
							assert.equal(aContents[13].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_number_control", "Object Details popover: SimpleForm property 'number' control id");
							assert.ok(!aContents[14].getVisible(), "Object Details popover: SimpleForm textarea label not visible");
							assert.equal(aContents[15].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_textarea", "Object Details popover: SimpleForm textarea control id");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("ObjectList field", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("Textarea - no value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithTypeDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objects": {}
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
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: ObjectList Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					var oTextArea = oField.getAggregation("_field");
					assert.ok(oTextArea.isA("sap.m.TextArea"), "Field 1: Control is TextArea");
					assert.equal(oTextArea.getId(), sEditorId + "_objects_control", "Field 1: TextArea id");
					assert.equal(oTextArea.getValue(), "", "Field 1: Object Value null");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Textarea - value -> Table", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithTypeDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objects": {
									"value": [
										{"key": "keynew", "icon": "sap-icon://zoom-in", "text": "textnew", "url": "https://sap.com/04", "editable": false, "int": 3, "number": 2.5, "_dt": {"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"}}
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
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object List Field", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: ObjectList Field");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.equal(oTable.getId(), sEditorId + "_objects_control", "Field 1: Table id");
					var aActions = oTable.getExtension()[0].getContent();
					assert.equal(aActions[1].getId(), sEditorId + "_objects_control_table_add_btn", "Table: add button id");
					assert.equal(aActions[2].getId(), sEditorId + "_objects_control_table_edit_btn", "Table: edit button id");
					assert.equal(aActions[3].getId(), sEditorId + "_objects_control_table_delete_btn", "Table: delete button id");
					assert.equal(aActions[4].getId(), sEditorId + "_objects_control_table_filter_btn", "Table: filter button id");
					assert.equal(aActions[5].getId(), sEditorId + "_objects_control_table_multiselect_all_btn", "Table: multiselect_all button id");
					assert.equal(aActions[6].getId(), sEditorId + "_objects_control_table_multiselect_none_btn", "Table: multiselect_none button id");
					assert.equal(aActions[7].getId(), sEditorId + "_objects_control_table_navigationup_btn", "Table: navigationup button id");
					assert.equal(aActions[8].getId(), sEditorId + "_objects_control_table_navigationdown_btn", "Table: navigationdown button id");
					var aColumns = oTable.getColumns();
					assert.equal(aColumns[0].getId(), sEditorId + "_objects_control_table_column_selection", "Table: column selection id");
					assert.equal(aColumns[1].getId(), sEditorId + "_objects_control_table_column_property_key", "Table: column property 'key' id");
					assert.equal(aColumns[2].getId(), sEditorId + "_objects_control_table_column_property_icon", "Table: column property 'icon' id");
					assert.equal(aColumns[3].getId(), sEditorId + "_objects_control_table_column_property_text", "Table: column property 'text' id");
					assert.equal(aColumns[4].getId(), sEditorId + "_objects_control_table_column_property_url", "Table: column property 'url' id");
					assert.equal(aColumns[5].getId(), sEditorId + "_objects_control_table_column_property_editable", "Table: column property 'editable' id");
					assert.equal(aColumns[6].getId(), sEditorId + "_objects_control_table_column_property_int", "Table: column property 'int' id");
					assert.equal(aColumns[7].getId(), sEditorId + "_objects_control_table_column_property_number", "Table: column property 'number' id");
					var oAddButton = aActions[1];
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							assert.equal(oField._oObjectDetailsPopover.getId(), sEditorId + "_objects_control_objectdetails_popover", "Object Details popover: id");
							var oObjectDetailsPage = oField._oObjectDetailsPopover.getContent()[0].getPages()[0];
							var oEditModeButton = oObjectDetailsPage.getHeaderContent()[0];
							assert.equal(oEditModeButton.getId(), sEditorId + "_objects_control_objectdetails_popover_editmode_btn", "Object Details popover: editmode button id");
							var aActionsInObjectDetailsPageFooter = oObjectDetailsPage.getFooter().getContent();
							assert.equal(aActionsInObjectDetailsPageFooter[1].getId(), sEditorId + "_objects_control_objectdetails_popover_add_btn", "Object Details popover: add button id");
							assert.equal(aActionsInObjectDetailsPageFooter[2].getId(), sEditorId + "_objects_control_objectdetails_popover_update_btn", "Object Details popover: update button id");
							assert.equal(aActionsInObjectDetailsPageFooter[3].getId(), sEditorId + "_objects_control_objectdetails_popover_cancel_btn", "Object Details popover: cancel button id");
							assert.equal(aActionsInObjectDetailsPageFooter[4].getId(), sEditorId + "_objects_control_objectdetails_popover_close_btn", "Object Details popover: close button id");
							var oSimpleForm = oObjectDetailsPage.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var aContents = oSimpleForm.getContent();
							assert.equal(aContents[0].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_key_label", "Object Details popover: SimpleForm property 'key' label id");
							assert.equal(aContents[1].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_key_control", "Object Details popover: SimpleForm property 'key' control id");
							assert.equal(aContents[2].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_icon_label", "Object Details popover: SimpleForm property 'icon' label id");
							assert.equal(aContents[3].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_icon_control", "Object Details popover: SimpleForm property 'icon' control id");
							assert.equal(aContents[4].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_text_label", "Object Details popover: SimpleForm property 'text' label id");
							assert.equal(aContents[5].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_text_control", "Object Details popover: SimpleForm property 'text' control id");
							assert.equal(aContents[6].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_url_label", "Object Details popover: SimpleForm property 'url' label id");
							assert.equal(aContents[7].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_url_control", "Object Details popover: SimpleForm property 'url' control id");
							assert.equal(aContents[8].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_editable_label", "Object Details popover: SimpleForm property 'editable' label id");
							assert.equal(aContents[9].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_editable_control", "Object Details popover: SimpleForm property 'editable' control id");
							assert.equal(aContents[10].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_int_label", "Object Details popover: SimpleForm property 'int' label id");
							assert.equal(aContents[11].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_int_control", "Object Details popover: SimpleForm property 'int' control id");
							assert.equal(aContents[12].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_number_label", "Object Details popover: SimpleForm property 'number' label id");
							assert.equal(aContents[13].getId(), sEditorId + "_objects_control_objectdetails_popover_form_property_number_control", "Object Details popover: SimpleForm property 'number' control id");
							assert.ok(!aContents[14].getVisible(), "Object Details popover: SimpleForm textarea label not visible");
							assert.equal(aContents[15].getId(), sEditorId + "_objects_control_objectdetails_popover_form_textarea", "Object Details popover: SimpleForm textarea control id");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Table", function (assert) {
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
									"value": [
										{"key": "keynew", "icon": "sap-icon://zoom-in", "text": "textnew", "url": "https://sap.com/04", "editable": false, "int": 3, "number": 2.5, "_dt": {"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"}}
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
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: ObjectList Field");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.equal(oTable.getId(), sEditorId + "_objectsWithPropertiesDefined_control", "Field 1: Table id");
					var aActions = oTable.getExtension()[0].getContent();
					assert.equal(aActions[1].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_add_btn", "Table: add button id");
					assert.equal(aActions[2].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_edit_btn", "Table: edit button id");
					assert.equal(aActions[3].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_delete_btn", "Table: delete button id");
					assert.equal(aActions[4].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_filter_btn", "Table: filter button id");
					assert.equal(aActions[5].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_multiselect_all_btn", "Table: multiselect_all button id");
					assert.equal(aActions[6].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_multiselect_none_btn", "Table: multiselect_none button id");
					assert.equal(aActions[7].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_navigationup_btn", "Table: navigationup button id");
					assert.equal(aActions[8].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_navigationdown_btn", "Table: navigationdown button id");
					var aColumns = oTable.getColumns();
					assert.equal(aColumns[0].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_column_selection", "Table: column selection id");
					assert.equal(aColumns[0].getMultiLabels()[0].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_column_selection_label_all_checkbox", "Table: column selection all checkbox id");
					assert.equal(aColumns[1].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_column_property_key", "Table: column property 'key' id");
					assert.equal(aColumns[2].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_column_property_icon", "Table: column property 'icon' id");
					assert.equal(aColumns[3].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_column_property_text", "Table: column property 'text' id");
					assert.equal(aColumns[4].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_column_property_url", "Table: column property 'url' id");
					assert.equal(aColumns[5].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_column_property_editable", "Table: column property 'editable' id");
					assert.equal(aColumns[6].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_column_property_int", "Table: column property 'int' id");
					assert.equal(aColumns[7].getId(), sEditorId + "_objectsWithPropertiesDefined_control_table_column_property_number", "Table: column property 'number' id");
					var oAddButton = aActions[1];
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							assert.equal(oField._oObjectDetailsPopover.getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover", "Object Details popover: id");
							var oObjectDetailsPage = oField._oObjectDetailsPopover.getContent()[0].getPages()[0];
							var oEditModeButton = oObjectDetailsPage.getHeaderContent()[0];
							assert.equal(oEditModeButton.getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_editmode_btn", "Object Details popover: editmode button id");
							var aActionsInObjectDetailsPageFooter = oObjectDetailsPage.getFooter().getContent();
							assert.equal(aActionsInObjectDetailsPageFooter[1].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_add_btn", "Object Details popover: add button id");
							assert.equal(aActionsInObjectDetailsPageFooter[2].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_update_btn", "Object Details popover: update button id");
							assert.equal(aActionsInObjectDetailsPageFooter[3].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_cancel_btn", "Object Details popover: cancel button id");
							assert.equal(aActionsInObjectDetailsPageFooter[4].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_close_btn", "Object Details popover: close button id");
							var oSimpleForm = oObjectDetailsPage.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var aContents = oSimpleForm.getContent();
							assert.equal(aContents[0].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_key_label", "Object Details popover: SimpleForm property 'key' label id");
							assert.equal(aContents[1].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_key_control", "Object Details popover: SimpleForm property 'key' control id");
							assert.equal(aContents[2].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_icon_label", "Object Details popover: SimpleForm property 'icon' label id");
							assert.equal(aContents[3].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_icon_control", "Object Details popover: SimpleForm property 'icon' control id");
							assert.equal(aContents[4].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_text_label", "Object Details popover: SimpleForm property 'text' label id");
							assert.equal(aContents[5].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_text_control", "Object Details popover: SimpleForm property 'text' control id");
							assert.equal(aContents[6].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_url_label", "Object Details popover: SimpleForm property 'url' label id");
							assert.equal(aContents[7].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_url_control", "Object Details popover: SimpleForm property 'url' control id");
							assert.equal(aContents[8].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_editable_label", "Object Details popover: SimpleForm property 'editable' label id");
							assert.equal(aContents[9].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_editable_control", "Object Details popover: SimpleForm property 'editable' control id");
							assert.equal(aContents[10].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_int_label", "Object Details popover: SimpleForm property 'int' label id");
							assert.equal(aContents[11].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_int_control", "Object Details popover: SimpleForm property 'int' control id");
							assert.equal(aContents[12].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_number_label", "Object Details popover: SimpleForm property 'number' label id");
							assert.equal(aContents[13].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_property_number_control", "Object Details popover: SimpleForm property 'number' control id");
							assert.ok(!aContents[14].getVisible(), "Object Details popover: SimpleForm textarea label not visible");
							assert.equal(aContents[15].getId(), sEditorId + "_objectsWithPropertiesDefined_control_objectdetails_popover_form_textarea", "Object Details popover: SimpleForm textarea control id");
							resolve();
						});
					};
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Settings", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("Basic", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsEnabled",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: []
			});

			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field 1: String Field");
					var oSettingsButton = oField._settingsButton;
					assert.equal(oSettingsButton.getId(), sEditorId + "_stringParameter_settings_btn", "Field 1: settings button id");
					oSettingsButton.firePress();
					oSettingsButton.focus();
					EditorQunitUtils.wait().then(function () {
						assert.equal(oSettingsButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						var oPopover = testInterface.oPopover;
						assert.equal(oPopover.getId(), sEditorId + "_stringParameter_settings_popover", "Settings: Popover id");
						var aHeaderContents = oPopover.getCustomHeader().getContent();
						assert.equal(aHeaderContents[0].getId(), sEditorId + "_stringParameter_settings_popover_segmented_btn", "Popver: segment button id");
						assert.equal(aHeaderContents[1].getId(), sEditorId + "_stringParameter_settings_popover_dynamicvalue_txt", "Popver: dynamicvalue text id");
						assert.equal(aHeaderContents[2].getId(), sEditorId + "_stringParameter_settings_popover_settings_txt", "Popver: settings text id");
						var oDynamicPanel = oPopover.getContent()[0];
						var aDynamicValueControls = oDynamicPanel.getItems()[0].getItems();
						assert.equal(aDynamicValueControls[0].getId(), sEditorId + "_stringParameter_settings_popover_dynamicvalue_label", "Popver: dynamicvalue label id");
						assert.equal(aDynamicValueControls[1].getId(), sEditorId + "_stringParameter_settings_popover_dynamicvalue_input", "Popver: dynamicvalue input id");
						assert.equal(oDynamicPanel.getItems()[1].getItems()[0].getId(), sEditorId + "_stringParameter_settings_popover_dynamicvalue_desc_txt", "Popver: dynamicvalue description text id");
						var oCurrentValue = oPopover.getContent()[1];
						assert.equal(oCurrentValue.getItems()[0].getId(), sEditorId + "_stringParameter_settings_popover_actualvalue_label", "Popver: dynamicvalue actualvalue label id");
						assert.equal(oCurrentValue.getItems()[1].getId(), sEditorId + "_stringParameter_settings_popover_actualvalue_input", "Popver: dynamicvalue actualvalue input id");
						var oSettingsPanel = oPopover.getContent()[2];
						var aAdminSettings = oSettingsPanel.getItems()[0].getItems();
						var aAdminVisibleControls = aAdminSettings[1].getItems();
						assert.equal(aAdminVisibleControls[0].getId(), sEditorId + "_stringParameter_settings_popover_adminvisible_label", "Popver: settings adminvisible label id");
						assert.equal(aAdminVisibleControls[1].getId(), sEditorId + "_stringParameter_settings_popover_adminvisible_checkbox", "Popver: settings adminvisible checkbox id");
						var aAdminEditableControls = aAdminSettings[2].getItems();
						assert.equal(aAdminEditableControls[0].getId(), sEditorId + "_stringParameter_settings_popover_admineditable_label", "Popver: settings admineditable label id");
						assert.equal(aAdminEditableControls[1].getId(), sEditorId + "_stringParameter_settings_popover_admineditable_checkbox", "Popver: settings admineditable checkbox id");
						var aAllowDynamicValuesControls = aAdminSettings[3].getItems();
						assert.equal(aAllowDynamicValuesControls[0].getId(), sEditorId + "_stringParameter_settings_popover_allowdynamicvalues_label", "Popver: settings allowdynamicvalues label id");
						assert.equal(aAllowDynamicValuesControls[1].getId(), sEditorId + "_stringParameter_settings_popover_allowdynamicvalues_checkbox", "Popver: settings allowdynamicvalues checkbox id");
						var aActions = oPopover.getFooter().getContent();
						assert.equal(aActions[0].getId(), sEditorId + "_stringParameter_settings_popover_reset_btn", "Popver: reset button id");
						assert.equal(aActions[2].getId(), sEditorId + "_stringParameter_settings_popover_ok_btn", "Popver: ok button id");
						assert.equal(aActions[3].getId(), sEditorId + "_stringParameter_settings_popover_cancel_btn", "Popver: cancel button id");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Value selection", function (assert) {
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithStaticList",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringWithStaticList": {
									"value": "key1"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringWithStaticList", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field 1: String Field");
					var oSettingsButton = oField._settingsButton;
					assert.equal(oSettingsButton.getId(), sEditorId + "_stringWithStaticList_settings_btn", "Field 1: settings button id");
					oSettingsButton.firePress();
					oSettingsButton.focus();
					EditorQunitUtils.wait().then(function () {
						assert.equal(oSettingsButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						var oPopover = testInterface.oPopover;
						var oSettingsPanel = oPopover.getContent()[2];
						var aAdminSettings = oSettingsPanel.getItems()[0].getItems();
						var aAllowDynamicValuesControls = aAdminSettings[4].getItems();
						assert.equal(aAllowDynamicValuesControls[0].getId(), sEditorId + "_stringWithStaticList_settings_popover_allowselectedvalues_label", "Popver: settings allowselectedvalues label id");
						assert.equal(aAllowDynamicValuesControls[1].getId(), sEditorId + "_stringWithStaticList_settings_popover_allowselectedvalues_all_btn", "Popver: settings allowselectedvalues all button id");
						var oScrollContainer = oSettingsPanel.getItems()[1];
						assert.equal(oScrollContainer.getId(), sEditorId + "_stringWithStaticList_settings_popover_scroll_container", "Popver: settings scroll container id");
						var oValueTable = oScrollContainer.getContent()[0];
						assert.equal(oValueTable.getId(), sEditorId + "_stringWithStaticList_settings_popover_pav_table", "Popver: settings value table id");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Translation popover", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("String field", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18ntrans/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/multiLanguage",
						"type": "List",
						"configuration": {
							"parameters": {
								"string1": {
									"value": "{{string1}}"
								}
							}
						}
					}
				},
				manifestChanges: []
			});

			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Label 1 English", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field 1: String Field");
					EditorQunitUtils.wait().then(function () {
						var oValueHelpIcon = oField.getAggregation("_field")._oValueHelpIcon;
						assert.equal(oValueHelpIcon.getId(), sEditorId + "_string1_control-vhi", "Field 1: value help icon id");
						assert.ok(oValueHelpIcon.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.equal(oValueHelpIcon.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon.firePress();
						oValueHelpIcon.focus();
						EditorQunitUtils.wait().then(function () {
							var oTranslationPopover = oField._oTranslationPopover;
							assert.equal(oTranslationPopover.getId(), sEditorId + "_string1_translation_popover", "Field 1: translation popover id");
							var aCurrentLanguageControls = oTranslationPopover.getCustomHeader().getItems()[2].getItems();
							assert.equal(aCurrentLanguageControls[0].getId(), sEditorId + "_string1_translation_popover_currentlanguage_description_label", "Translation popover: current language description label id");
							assert.equal(aCurrentLanguageControls[1].getId(), sEditorId + "_string1_translation_popover_currentlanguage_value_input", "Translation popover: current language value input id");
							var oValueList = oTranslationPopover.getContent()[0];
							assert.equal(oValueList.getId(), sEditorId + "_string1_translation_popover_value_list", "Translation popover: value list id");
							var aActions = oTranslationPopover.getFooter().getContent();
							assert.equal(aActions[1].getId(), sEditorId + "_string1_translation_popover_save_btn", "Translation popover: save button id");
							assert.equal(aActions[2].getId(), sEditorId + "_string1_translation_popover_cancel_btn", "Translation popover: cancel button id");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Object field - simple form", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18ntrans/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldWithPropertiesDefined",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithPropertiesDefined": {}
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
				},
				manifestChanges: []
			});

			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oField = this.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.wait().then(function () {
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
						var oSimpleForm = oField.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						var oFormField = oContents[5];
						assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
						assert.ok(oFormField._oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
						assert.ok(oFormField._oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
						assert.ok(oFormField._oValueHelpIcon.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
						assert.equal(oFormField._oValueHelpIcon.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
						assert.equal(oFormField._oValueHelpIcon.getId(), sEditorId + "_objectWithPropertiesDefined_control_form_property_text_control-vhi", "SimpleForm field 3: value help icon id");
						oFormField._oValueHelpIcon.firePress();
						oFormField._oValueHelpIcon.focus();
						EditorQunitUtils.wait().then(function () {
							var oTranslationPopover = oField._oTranslationPopover;
							assert.equal(oTranslationPopover.getId(), sEditorId + "_objectWithPropertiesDefined_control_translation_popover", "Field 1: translation popover id");
							var oValueList = oTranslationPopover.getContent()[0];
							assert.equal(oValueList.getId(), sEditorId + "_objectWithPropertiesDefined_control_translation_popover_value_list", "Translation popover: value list id");
							var aActions = oTranslationPopover.getFooter().getContent();
							assert.equal(aActions[1].getId(), sEditorId + "_objectWithPropertiesDefined_control_translation_popover_save_btn", "Translation popover: save button id");
							assert.equal(aActions[2].getId(), sEditorId + "_objectWithPropertiesDefined_control_translation_popover_reset_btn", "Translation popover: reset button id");
							assert.equal(aActions[3].getId(), sEditorId + "_objectWithPropertiesDefined_control_translation_popover_cancel_btn", "Translation popover: cancel button id");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Object field - table", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18ntrans/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldWithTranslation",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithPropertiesDefinedAndValueFromJsonList": {}
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
				},
				manifestChanges: []
			});

			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is a table");
					assert.equal(oTable.getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control", "Table: id ok");
					var aActions = oTable.getExtension()[0].getContent();
					var oAddButton = aActions[1];
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							assert.equal(oField._oObjectDetailsPopover.getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover", "Object Details popover: id");
							var oObjectDetailsPage = oField._oObjectDetailsPopover.getContent()[0].getPages()[0];
							var oEditModeButton = oObjectDetailsPage.getHeaderContent()[0];
							assert.equal(oEditModeButton.getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_editmode_btn", "Object Details popover: editmode button id");
							var aActionsInObjectDetailsPageFooter = oObjectDetailsPage.getFooter().getContent();
							assert.equal(aActionsInObjectDetailsPageFooter[1].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_add_btn", "Object Details popover: add button id");
							assert.equal(aActionsInObjectDetailsPageFooter[2].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_update_btn", "Object Details popover: update button id");
							assert.equal(aActionsInObjectDetailsPageFooter[3].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_cancel_btn", "Object Details popover: cancel button id");
							assert.equal(aActionsInObjectDetailsPageFooter[4].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_close_btn", "Object Details popover: close button id");
							var oSimpleForm = oObjectDetailsPage.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							var oFormField = oContents[5];
							assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
							assert.ok(oFormField._oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
							assert.ok(oFormField._oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
							assert.ok(oFormField._oValueHelpIcon.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
							assert.equal(oFormField._oValueHelpIcon.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
							assert.equal(oFormField._oValueHelpIcon.getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_form_property_text_control-vhi", "SimpleForm field 3: value help icon id");
							oFormField._oValueHelpIcon.firePress();
							oFormField._oValueHelpIcon.focus();
							EditorQunitUtils.wait().then(function () {
								var oTranslationListPage = oField._oObjectDetailsPopover.getContent()[0].getPages()[1];
								var oValueList = oTranslationListPage.getContent()[0];
								assert.equal(oValueList.getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_translation_page_value_list", "Object Details popover: translation value list id");
								var aActions = oTranslationListPage.getFooter().getContent();
								assert.equal(aActions[1].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_translation_page_save_btn", "Object Details popover: save button id");
								assert.equal(aActions[2].getId(), sEditorId + "_objectWithPropertiesDefinedAndValueFromJsonList_control_objectdetails_popover_translation_page_reset_btn", "Object Details popover: reset button id");
								resolve();
							});
						});
					};
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("ObjectList field - table", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18ntrans/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldsWithTranslations",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithPropertiesDefined1": {}
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
				},
				manifestChanges: []
			});

			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var sEditorId = this.oEditor.getId();
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is a table");
					assert.equal(oTable.getId(), sEditorId + "_objectWithPropertiesDefined1_control", "Table: id ok");
					var aActions = oTable.getExtension()[0].getContent();
					var oAddButton = aActions[1];
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							assert.equal(oField._oObjectDetailsPopover.getId(), sEditorId + "_objectWithPropertiesDefined1_control_objectdetails_popover", "Object Details popover: id");
							var oObjectDetailsPage = oField._oObjectDetailsPopover.getContent()[0].getPages()[0];
							var oEditModeButton = oObjectDetailsPage.getHeaderContent()[0];
							assert.equal(oEditModeButton.getId(), sEditorId + "_objectWithPropertiesDefined1_control_objectdetails_popover_editmode_btn", "Object Details popover: editmode button id");
							var aActionsInObjectDetailsPageFooter = oObjectDetailsPage.getFooter().getContent();
							assert.equal(aActionsInObjectDetailsPageFooter[1].getId(), sEditorId + "_objectWithPropertiesDefined1_control_objectdetails_popover_add_btn", "Object Details popover: add button id");
							assert.equal(aActionsInObjectDetailsPageFooter[2].getId(), sEditorId + "_objectWithPropertiesDefined1_control_objectdetails_popover_update_btn", "Object Details popover: update button id");
							assert.equal(aActionsInObjectDetailsPageFooter[3].getId(), sEditorId + "_objectWithPropertiesDefined1_control_objectdetails_popover_cancel_btn", "Object Details popover: cancel button id");
							assert.equal(aActionsInObjectDetailsPageFooter[4].getId(), sEditorId + "_objectWithPropertiesDefined1_control_objectdetails_popover_close_btn", "Object Details popover: close button id");
							var oSimpleForm = oObjectDetailsPage.getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							var oFormField = oContents[5];
							assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
							assert.ok(oFormField._oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
							assert.ok(oFormField._oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
							assert.ok(oFormField._oValueHelpIcon.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
							assert.equal(oFormField._oValueHelpIcon.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
							assert.equal(oFormField._oValueHelpIcon.getId(), sEditorId + "_objectWithPropertiesDefined1_control_objectdetails_popover_form_property_text_control-vhi", "SimpleForm field 3: value help icon id");
							oFormField._oValueHelpIcon.firePress();
							oFormField._oValueHelpIcon.focus();
							EditorQunitUtils.wait().then(function () {
								var oTranslationListPage = oField._oObjectDetailsPopover.getContent()[0].getPages()[1];
								var oValueList = oTranslationListPage.getContent()[0];
								assert.equal(oValueList.getId(), sEditorId + "_objectWithPropertiesDefined1_control_objectdetails_popover_translation_page_value_list", "Object Details popover: translation value list id");
								var aActions = oTranslationListPage.getFooter().getContent();
								assert.equal(aActions[1].getId(), sEditorId + "_objectWithPropertiesDefined1_control_objectdetails_popover_translation_page_save_btn", "Object Details popover: save button id");
								assert.equal(aActions[2].getId(), sEditorId + "_objectWithPropertiesDefined1_control_objectdetails_popover_translation_page_reset_btn", "Object Details popover: reset button id");
								resolve();
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
