/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../../../ContextHost",
	"sap/base/util/deepEqual",
	"sap/ui/core/Core"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	Core
) {
	"use strict";
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
	var _aCheckedLanguages = [
		{
			"key": "fr-CA",
			"description": "Français (Canada)"
		},
		{
			"key": "zh-CN",
			"description": "简体中文"
		},
		{
			"key": "zh-TW",
			"description": "繁體中文"
		}
	];
	var oManifestForObjectFieldsWithPropertiesDefined = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18ntrans/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectFieldsWithPropertiesDefined",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectWithPropertiesDefined1": {},
					"objectWithPropertiesDefined2": {},
					"objectWithPropertiesDefined3": {}
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
	var oValueOfObject1InAdminChange = {
		"_dt": {
			"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"icon": "sap-icon://add",
		"text": "{i18n>string1}",
		"url": "http://",
		"number": 0.5
	};
	var oValueOfObject2InAdminChange = {
		"_dt": {
			"_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"icon": "sap-icon://add",
		"text": "string2",
		"url": "http://",
		"number": 0.5
	};
	var oValueOfObject3InAdminChange = {
		"_dt": {
			"_uuid": "333771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"icon": "sap-icon://add",
		"text": "string3",
		"url": "http://",
		"number": 0.5
	};
	var _oAdminChangesOfObjectsWithPropertiesDefined = {
		"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": oValueOfObject1InAdminChange,
		"/sap.card/configuration/parameters/objectWithPropertiesDefined2/value": oValueOfObject2InAdminChange,
		"/sap.card/configuration/parameters/objectWithPropertiesDefined3/value": oValueOfObject3InAdminChange,
		":layer": 0,
		":multipleLanguage": true,
		":errors": false,
		"texts": {
			"en": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 EN Admin"
					}
				},
				"/sap.card/configuration/parameters/objectWithPropertiesDefined2/value": {
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 EN Admin"
					}
				},
				"/sap.card/configuration/parameters/objectWithPropertiesDefined3/value": {
					"333771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String3 EN Admin"
					}
				}
			},
			"fr": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 FR Admin"
					}
				}
			},
			"ru": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined2/value": {
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 RU Admin"
					}
				}
			},
			"zh-CN": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 简体 Admin"
					}
				},
				"/sap.card/configuration/parameters/objectWithPropertiesDefined3/value": {
					"333771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String3 简体 Admin"
					}
				}
			},
			"zh-TW": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined2/value": {
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 繁體 Admin"
					}
				},
				"/sap.card/configuration/parameters/objectWithPropertiesDefined3/value": {
					"333771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String3 繁體 Admin"
					}
				}
			}
		}
	};
	var _oExpectedValuesOfChangesFromAdmin = {
		"objectWithPropertiesDefined1": {
			"default": "String 1 English",
			"en": "String1 EN Admin",
			"en-US": "String 1 US English",
			"es-MX": "String 1 Spanish MX",
			"fr": "String1 FR Admin",
			"fr-FR": "String 1 French",
			"fr-CA": "String 1 French CA",
			"zh-CN": "String1 简体 Admin"
		},
		"objectWithPropertiesDefined2": {
			"default": "string2",
			"en": "String2 EN Admin",
			"ru": "String2 RU Admin",
			"zh-TW": "String2 繁體 Admin"
		},
		"objectWithPropertiesDefined3": {
			"default": "string3",
			"en": "String3 EN Admin",
			"zh-CN": "String3 简体 Admin",
			"zh-TW": "String3 繁體 Admin"
		}
	};

	function createEditor(sLanguage, oDesigntime) {
		sLanguage = sLanguage || "en";
		Core.getConfiguration().setLanguage(sLanguage);
		var oEditor = new Editor({
			designtime: oDesigntime
		});
		var oContent = document.getElementById("content");
		if (!oContent) {
			oContent = document.createElement("div");
			oContent.style.position = "absolute";
			oContent.style.top = "200px";
			oContent.style.background = "white";

			oContent.setAttribute("id", "content");
			document.body.appendChild(oContent);
			document.body.style.zIndex = 1000;
		}
		oEditor.placeAt(oContent);
		return oEditor;
	}
	function destroyEditor(oEditor) {
		oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}
	}

	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

	QUnit.module("content mode", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		_aCheckedLanguages.forEach(function(sLanguage) {
			var sLanguageKey = sLanguage.key;
			var sCaseTitle = "in " + sLanguageKey + " (" + sLanguage.description + ")";
			QUnit.test(sCaseTitle, function (assert) {
				var that = this;
				return new Promise(function (resolve, reject) {
					that.oEditor = createEditor(sLanguageKey);
					that.oEditor.setMode("content");
					that.oEditor.setAllowSettings(true);
					that.oEditor.setAllowDynamicValues(true);
					that.oEditor.setJson({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifestForObjectFieldsWithPropertiesDefined,
						manifestChanges: [_oAdminChangesOfObjectsWithPropertiesDefined]
					});
					that.oEditor.attachReady(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
						var oField1 = that.oEditor.getAggregation("_formContent")[2];
						var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
						var oField2 = that.oEditor.getAggregation("_formContent")[4];
						var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
						var oField3 = that.oEditor.getAggregation("_formContent")[6];
						wait().then(function () {
							assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
							assert.equal(oLabel1.getText(), "Object1 properties defined", "Label 1: Has label text");
							assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
							assert.ok(deepEqual(oField1._getCurrentProperty("value"), oValueOfObject1InAdminChange), "Field 1: DT Value from admin");
							var oSimpleForm1 = oField1.getAggregation("_field");
							assert.ok(oSimpleForm1.isA("sap.ui.layout.form.SimpleForm"), "Field 1: Control is SimpleForm");
							var oDeleteButton1 = oSimpleForm1.getToolbar().getContent()[2];
							assert.ok(oDeleteButton1.getVisible(), "SimpleForm 1: Delete button is visible");
							assert.ok(oDeleteButton1.getEnabled(), "SimpleForm 1: Delete button is enabled");
							var oContents1 = oSimpleForm1.getContent();
							var oFormLabel3 = oContents1[4];
							var oFormField3 = oContents1[5];
							assert.equal(oFormLabel3.getText(), "Text", "SimpleForm 1 label 3: Has label text");
							assert.ok(oFormLabel3.getVisible(), "SimpleForm 1 label 3: Visible");
							assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm 1 Field 3: Input Field");
							assert.ok(oFormField3.getVisible(), "SimpleForm 1 Field 3: Visible");
							assert.ok(oFormField3.getEditable(), "SimpleForm 1 Field 3: Editable");
							assert.equal(oFormField3.getValue(), "{i18n>string1}", "SimpleForm 1 field 3: Has value");
							assert.ok(oFormField3.getShowValueHelp(), "SimpleForm 1 field 3: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField3._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm 1 field 3: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm 1 field 3: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm 1 field 3: Input value help icon");
							assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm 1 field 3: Input value help icon src");
							oValueHelpIcon1.firePress();
							wait(1500).then(function () {
								var oTranslationPopover1 = oField1._oTranslationPopover;
								var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
								assert.ok(oSaveButton1.getVisible(), "oTranslationPopover 1 footer: save button visible");
								assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover 1 footer: save button disabled");
								var oResetButton1 = oTranslationPopover1.getFooter().getContent()[2];
								assert.ok(oResetButton1.getVisible(), "oTranslationPopover 1 footer: reset button visible");
								assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover 1 footer: reset button disabled");
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[3];
								assert.ok(oCancelButton1.getVisible(), "oTranslationPopover 1 footer: cancel button visible");
								assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover 1 footer: cancel button enabled");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 50, "oTranslationPopover 1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oExpectedValuesOfChangesFromAdmin["objectWithPropertiesDefined1"][sLanguage] || _oExpectedValuesOfChangesFromAdmin["objectWithPropertiesDefined1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover 1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								oCancelButton1.firePress();
								wait().then(function () {
									assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
									assert.equal(oLabel2.getText(), "Object2 properties defined", "Label 2: Has label text");
									assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
									assert.ok(deepEqual(oField2._getCurrentProperty("value"), oValueOfObject2InAdminChange), "Field 2: DT Value from admin");
									var oSimpleForm2 = oField2.getAggregation("_field");
									assert.ok(oSimpleForm2.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
									var oDeleteButton2 = oSimpleForm2.getToolbar().getContent()[2];
									assert.ok(oDeleteButton2.getVisible(), "SimpleForm 2: Delete button is visible");
									assert.ok(oDeleteButton2.getEnabled(), "SimpleForm 2: Delete button is enabled");
									var oContents2 = oSimpleForm2.getContent();
									var oFormLabel3 = oContents2[4];
									var oFormField3 = oContents2[5];
									assert.equal(oFormLabel3.getText(), "Text", "SimpleForm 2 label 3: Has label text");
									assert.ok(oFormLabel3.getVisible(), "SimpleForm 2 label 3: Visible");
									assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm 2 Field 3: Input Field");
									assert.ok(oFormField3.getVisible(), "SimpleForm 2 Field 3: Visible");
									assert.ok(oFormField3.getEditable(), "SimpleForm 2 Field 3: Editable");
									assert.equal(oFormField3.getValue(), "string2", "SimpleForm 2 field 3: Has value");
									assert.ok(oFormField3.getShowValueHelp(), "SimpleForm 2 field 3: ShowValueHelp true");
									var oValueHelpIcon2 = oFormField3._oValueHelpIcon;
									assert.ok(oValueHelpIcon2, "SimpleForm 2 field 3: Value help icon exist");
									assert.ok(oValueHelpIcon2.getVisible(), "SimpleForm 2 field 3: Value help icon visible");
									assert.ok(oValueHelpIcon2.isA("sap.ui.core.Icon"), "SimpleForm 2 field 3: Input value help icon");
									assert.equal(oValueHelpIcon2.getSrc(), "sap-icon://translate", "SimpleForm 2 field 3: Input value help icon src");
									oValueHelpIcon2.firePress();
									wait(1500).then(function () {
										var oTranslationPopover2 = oField2._oTranslationPopover;
										var oSaveButton2 = oTranslationPopover2.getFooter().getContent()[1];
										assert.ok(oSaveButton2.getVisible(), "oTranslationPopover 2 footer: save button visible");
										assert.ok(!oSaveButton2.getEnabled(), "oTranslationPopover 2 footer: save button disabled");
										var oResetButton2 = oTranslationPopover2.getFooter().getContent()[2];
										assert.ok(oResetButton2.getVisible(), "oTranslationPopover 2 footer: reset button visible");
										assert.ok(!oResetButton2.getEnabled(), "oTranslationPopover 2 footer: reset button disabled");
										var oCancelButton2 = oTranslationPopover2.getFooter().getContent()[3];
										assert.ok(oCancelButton2.getVisible(), "oTranslationPopover 2 footer: cancel button visible");
										assert.ok(oCancelButton2.getEnabled(), "oTranslationPopover 2 footer: cancel button enabled");
										var oLanguageItems2 = oTranslationPopover2.getContent()[0].getItems();
										assert.equal(oLanguageItems2.length, 50, "oTranslationPopover 2 Content: length");
										for (var i = 0; i < oLanguageItems2.length; i++) {
											var oCustomData = oLanguageItems2[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oExpectedValuesOfChangesFromAdmin["objectWithPropertiesDefined2"][sLanguage] || _oExpectedValuesOfChangesFromAdmin["objectWithPropertiesDefined2"]["default"];
												var sCurrentValue = oLanguageItems2[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover 2 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										oCancelButton2.firePress();
										wait().then(function () {
											assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
											assert.equal(oLabel3.getText(), "Object3 properties defined", "Label 3: Has label text");
											assert.ok(oField3.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
											assert.ok(deepEqual(oField3._getCurrentProperty("value"), oValueOfObject3InAdminChange), "Field 3: DT Value from admin");
											var oSimpleForm3 = oField3.getAggregation("_field");
											assert.ok(oSimpleForm3.isA("sap.ui.layout.form.SimpleForm"), "Field 3: Control is SimpleForm");
											var oDeleteButton3 = oSimpleForm3.getToolbar().getContent()[2];
											assert.ok(oDeleteButton3.getVisible(), "SimpleForm 3: Delete button is visible");
											assert.ok(oDeleteButton3.getEnabled(), "SimpleForm 3: Delete button is enabled");
											var oContents3 = oSimpleForm3.getContent();
											var oFormLabel3 = oContents3[4];
											var oFormField3 = oContents3[5];
											assert.equal(oFormLabel3.getText(), "Text", "SimpleForm 3 label 3: Has label text");
											assert.ok(oFormLabel3.getVisible(), "SimpleForm 3 label 3: Visible");
											assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm 3 Field 3: Input Field");
											assert.ok(oFormField3.getVisible(), "SimpleForm 3 Field 3: Visible");
											assert.ok(oFormField3.getEditable(), "SimpleForm 3 Field 3: Editable");
											assert.equal(oFormField3.getValue(), "string3", "SimpleForm 3 field 3: Has value");
											assert.ok(oFormField3.getShowValueHelp(), "SimpleForm 3 field 3: ShowValueHelp true");
											var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
											assert.ok(oValueHelpIcon3, "SimpleForm 3 field 3: Value help icon exist");
											assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm 3 field 3: Value help icon visible");
											assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm 3 field 3: Input value help icon");
											assert.equal(oValueHelpIcon3.getSrc(), "sap-icon://translate", "SimpleForm 3 field 3: Input value help icon src");
											oValueHelpIcon3.firePress();
											wait(1500).then(function () {
												var oTranslationPopover3 = oField3._oTranslationPopover;
												var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
												assert.ok(oSaveButton3.getVisible(), "oTranslationPopover 3 footer: save button visible");
												assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover 3 footer: save button disabled");
												var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
												assert.ok(oResetButton3.getVisible(), "oTranslationPopover 3 footer: reset button visible");
												assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover 3 footer: reset button disabled");
												var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
												assert.ok(oCancelButton3.getVisible(), "oTranslationPopover 3 footer: cancel button visible");
												assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover 3 footer: cancel button enabled");
												var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
												assert.equal(oLanguageItems3.length, 50, "oTranslationPopover 3 Content: length");
												for (var i = 0; i < oLanguageItems3.length; i++) {
													var oCustomData = oLanguageItems3[i].getCustomData();
													if (oCustomData && oCustomData.length > 0) {
														var sLanguage = oCustomData[0].getKey();
														var sExpectedValue = _oExpectedValuesOfChangesFromAdmin["objectWithPropertiesDefined3"][sLanguage] || _oExpectedValuesOfChangesFromAdmin["objectWithPropertiesDefined3"]["default"];
														var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
														assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover 3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
													}
												}
												destroyEditor(that.oEditor);
												resolve();
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
