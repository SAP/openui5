/* global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/core/Element",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/core/date/UI5Date",
	"sap/ui/integration/formatters/IconFormatter",
	"qunit/designtime/EditorQunitUtils"
], function(
	Localization,
	merge,
	x,
	Element,
	Editor,
	CardEditor,
	Designtime,
	Host,
	nextUIUpdate,
	sinon,
	ContextHost,
	QUnitUtils,
	KeyCodes,
	ResourceBundle,
	UI5Date,
	IconFormatter,
	EditorQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	QUnit.module("Lazy loading", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("Check Loading animation on destination", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "configuration": { "destinations": { "dest1": { "name": "MyDestination" } } }, "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(oField.getAggregation("_field").getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(oField.getAggregation("_field").getBusy() === false, "Content of Form contains: Destination Field that is not busy anymore");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check default destination", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "configuration": { "destinations": { "dest1": { "name": "Northwind" } } }, "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var DestinationComboBox = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field that is ComboBox");
						assert.ok(DestinationComboBox.getBusy() === false, "Content of Form contains: Destination Field that is not busy anymore");
						assert.equal(DestinationComboBox.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field selectedItem: Key OK");
						assert.equal(DestinationComboBox.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field selectedItem: Text OK");
						var oItems = DestinationComboBox.getItems();
						assert.equal(oItems.length, 4, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Northwind", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Orders", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Portal", "Content of Form contains: Destination Field item 2 Key OK");
						assert.equal(oItems[3].getKey(), "Products", "Content of Form contains: Destination Field item 3 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Large number", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest(
				{
					"getDestinations": function () {
						return new Promise(function (resolve) {
							EditorQunitUtils.wait().then(function () {
								var items = [
									{
										"name": "Products"
									},
									{
										"name": "Orders"
									},
									{
										"name": "Portal"
									},
									{
										"name": "Northwind"
									}
								];
								for (var i = 1000; i > 0; i--) {
									items.push({name: i});
								}
								resolve(items);
							});
						});
					}
				}
			);
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("Check number of destinations", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "configuration": { "destinations": { "dest1": { "name": "Northwind" } } }, "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var DestinationComboBox = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field that is ComboBox");
						assert.ok(DestinationComboBox.getBusy() === false, "Content of Form contains: Destination Field that is not busy anymore");
						assert.equal(DestinationComboBox.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field selectedItem: Key OK");
						assert.equal(DestinationComboBox.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field selectedItem: Text OK");
						var oItems = DestinationComboBox.getItems();
						assert.equal(oItems.length, 1004, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Northwind", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Orders", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Portal", "Content of Form contains: Destination Field item 2 Key OK");
						assert.equal(oItems[3].getKey(), "Products", "Content of Form contains: Destination Field item 3 Key OK");
						for (var i = 1; i < 1001; i++) {
							assert.equal(oItems[(i + 3)].getKey(), i, "Content of Form contains: Destination Field item " + (i + 3) + " Key OK");
						}
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Filter destinations 1", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "configuration": { "destinations": { "dest1": { "name": "Northwind" } } }, "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var DestinationComboBox = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field that is ComboBox");
						assert.ok(DestinationComboBox.getBusy() === false, "Content of Form contains: Destination Field that is not busy anymore");
						assert.equal(DestinationComboBox.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field selectedItem: Key OK");
						assert.equal(DestinationComboBox.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field selectedItem: Text OK");
						assert.equal(DestinationComboBox.getVisibleItems().length, 0, "Content of Form contains: Destination Field visible items lengh OK");
						DestinationComboBox.focus();
						EditorQunitUtils.setInputValue(DestinationComboBox, "o");
						EditorQunitUtils.wait(2000).then(function () {
							assert.ok(DestinationComboBox._getSuggestionsPopover().isOpen(), "Content of Form contains: suggestion popover is open");
							assert.equal(DestinationComboBox.getVisibleItems().length, 1, "Field: Destination Field visible items lengh OK");
							assert.equal(DestinationComboBox.getVisibleItems()[0].getKey(), "Orders", "Field: Destination Field visible item 0 Key OK");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Filter destinations 2", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "configuration": { "destinations": { "dest1": { "name": "Northwind" } } }, "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var DestinationComboBox = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field that is ComboBox");
						assert.ok(DestinationComboBox.getBusy() === false, "Content of Form contains: Destination Field that is not busy anymore");
						assert.equal(DestinationComboBox.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field selectedItem: Key OK");
						assert.equal(DestinationComboBox.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field selectedItem: Text OK");
						assert.equal(DestinationComboBox.getVisibleItems().length, 0, "Content of Form contains: Destination Field visible items lengh OK");
						DestinationComboBox.focus();
						EditorQunitUtils.setInputValue(DestinationComboBox, "p");
						EditorQunitUtils.wait(2000).then(function () {
							assert.ok(DestinationComboBox._getSuggestionsPopover().isOpen(), "Content of Form contains: suggestion popover is open");
							assert.equal(DestinationComboBox.getVisibleItems().length, 2, "Field: Destination Field visible items lengh OK");
							assert.equal(DestinationComboBox.getVisibleItems()[0].getKey(), "Portal", "Field: Destination Field visible item 0 Key OK");
							assert.equal(DestinationComboBox.getVisibleItems()[1].getKey(), "Products", "Field: Destination Field visible item 1 Key OK");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Filter destinations 3", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "configuration": { "destinations": { "dest1": { "name": "Northwind" } } }, "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var DestinationComboBox = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field that is ComboBox");
						assert.ok(DestinationComboBox.getBusy() === false, "Content of Form contains: Destination Field that is not busy anymore");
						assert.equal(DestinationComboBox.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field selectedItem: Key OK");
						assert.equal(DestinationComboBox.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field selectedItem: Text OK");
						assert.equal(DestinationComboBox.getVisibleItems().length, 0, "Content of Form contains: Destination Field visible items lengh OK");
						DestinationComboBox.focus();
						EditorQunitUtils.setInputValue(DestinationComboBox, "1");
						EditorQunitUtils.wait(2000).then(function () {
							assert.ok(DestinationComboBox._getSuggestionsPopover().isOpen(), "Content of Form contains: suggestion popover is open");
							var aVisibleItems = DestinationComboBox.getVisibleItems();
							assert.equal(aVisibleItems.length, 112, "Content of Form contains: Destination Field visible items lengh OK");
							assert.equal(aVisibleItems[0].getKey(), "1", "Content of Form contains: Destination Field visible item 0 Key OK");
							assert.equal(aVisibleItems[1].getKey(), "10", "Content of Form contains: Destination Field visible item 1 Key OK");
							assert.equal(aVisibleItems[2].getKey(), "11", "Content of Form contains: Destination Field visible item 2 Key OK");
							assert.equal(aVisibleItems[3].getKey(), "12", "Content of Form contains: Destination Field visible item 3 Key OK");
							assert.equal(aVisibleItems[4].getKey(), "13", "Content of Form contains: Destination Field visible item 4 Key OK");
							assert.equal(aVisibleItems[5].getKey(), "14", "Content of Form contains: Destination Field visible item 5 Key OK");
							assert.equal(aVisibleItems[6].getKey(), "15", "Content of Form contains: Destination Field visible item 6 Key OK");
							assert.equal(aVisibleItems[7].getKey(), "16", "Content of Form contains: Destination Field visible item 7 Key OK");
							assert.equal(aVisibleItems[8].getKey(), "17", "Content of Form contains: Destination Field visible item 8 Key OK");
							assert.equal(aVisibleItems[9].getKey(), "18", "Content of Form contains: Destination Field visible item 9 Key OK");
							assert.equal(aVisibleItems[10].getKey(), "19", "Content of Form contains: Destination Field visible item 10 Key OK");
							for (var i = 0; i < 100; i++) {
								assert.equal(aVisibleItems[(i + 11)].getKey(), i + 100, "Content of Form contains: Destination Field item " + (i + 11) + " Key OK");
							}
							assert.equal(aVisibleItems[111].getKey(), "1000", "Content of Form contains: Destination Field visible item 111 Key OK");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Loading timeout", {
		beforeEach: function() {
			this.oEditor = EditorQunitUtils.beforeEachTest(
				{
					"getDestinations": function() {
						return new Promise(function(resove, reject) {
							EditorQunitUtils.wait(3000).then(function () {
								reject("Get destinations list timeout.");
							});
						});
					}
				}
			);
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function() {
		QUnit.test("Check destination is", function (assert) {
			this.oEditor.setJson({ baseUrl: sBaseUrl, host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "sap.card": { "configuration": { "destinations": { "dest1": { "name": "Northwind" } } }, "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(oField.getAggregation("_field").getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 6000ms
						assert.ok(oField.getAggregation("_field").getBusy() === false, "Content of Form contains: Destination Field that is not busy anymore");
						assert.equal(oField.getAggregation("_field").getItems().length, 0, "Content of Form contains: Destination Field items lengh OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Defined in DT", {
		beforeEach: function () {
			Localization.setLanguage("en");
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("Define destination in DT", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationInDT",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 5, "Editor: has 2 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var DestinationLabel1 = aFormContent[1];
					var DestinationComboBox1 = aFormContent[2].getAggregation("_field");
					var DestinationLabel2 = aFormContent[3];
					var DestinationComboBox2 = aFormContent[4].getAggregation("_field");
					assert.ok(DestinationLabel1.isA("sap.m.Label"), "Label1: Form content contains a Label");
					assert.equal(DestinationLabel1.getText(), "dest1 label defined in DT", "Label1: Has dest1 label from destination label property defined in DT");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox1.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					assert.ok(DestinationLabel2.isA("sap.m.Label"), "Label2: Form content contains a Label");
					assert.equal(DestinationLabel2.getText(), "dest2 label defined in manifest", "Label2: Has dest2 label from destination label property defined in manifest");
					assert.ok(!DestinationComboBox2.getEditable(), "Content of Form contains: Destination Field 2 is NOT editable");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox1.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 1 that is ComboBox");
						assert.ok(DestinationComboBox1.getBusy() === false, "Content of Form contains: Destination Field 1 that is not busy anymore");
						assert.equal(DestinationComboBox1.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Key OK");
						assert.equal(DestinationComboBox1.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Text OK");
						var oItems = DestinationComboBox1.getItems();
						assert.equal(oItems.length, 4, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Northwind", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Orders", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Portal", "Content of Form contains: Destination Field item 2 Key OK");
						assert.equal(oItems[3].getKey(), "Products", "Content of Form contains: Destination Field item 3 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("In content mode", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationInDT",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.ok(!aFormContent, "Editor: has no destinations");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("In translation mode", function (assert) {
			this.oEditor.setMode("translation");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationInDT",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 1, "Editor: has 1 item");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Define Destination Group in DT", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/customDestinationGroup",
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							},
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					var oGeneralPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oGeneralPanel.isA("sap.m.Panel"), "Panel: Form content contains a General Panel");
					assert.equal(oGeneralPanel.getHeaderText(), "General Settings", "General Panel: Header Text");
					var oLabel = aFormContent[1];
					var oField = aFormContent[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "string Parameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable(), "Field: Editable changed from admin change");

					var oDestinationPanel = aFormContent[3].getAggregation("_field");
					assert.ok(oDestinationPanel.isA("sap.m.Panel"), "Destinations Panel: Form content contains a Panel");
					assert.equal(oDestinationPanel.getHeaderText(), "Destinations group label defined in DT", "Destinations Panel: Header Text");
					assert.ok(!oDestinationPanel.getExpanded(), "Destinations Panel: not expanded");
					var DestinationLabel1 = aFormContent[4];
					var DestinationField1 = aFormContent[5];
					var DestinationComboBox1 = DestinationField1.getAggregation("_field");
					assert.ok(DestinationLabel1.isA("sap.m.Label"), "Label1: Form content contains a Label");
					assert.equal(DestinationLabel1.getText(), "dest1 label defined in DT", "Label1: Has dest1 label from destination label property defined in DT");
					assert.ok(DestinationField1.isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox1.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox1.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 1 that is ComboBox");
						assert.ok(DestinationComboBox1.getBusy() === false, "Content of Form contains: Destination Field 1 that is not busy anymore");
						assert.equal(DestinationComboBox1.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Key OK");
						assert.equal(DestinationComboBox1.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Text OK");
						var oItems = DestinationComboBox1.getItems();
						assert.equal(oItems.length, 4, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Northwind", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Orders", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Portal", "Content of Form contains: Destination Field item 2 Key OK");
						assert.equal(oItems[3].getKey(), "Products", "Content of Form contains: Destination Field item 3 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Position start", {
		beforeEach: function () {
			Localization.setLanguage("en");
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("In admin mode, no general group defined for parameters", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/DestinationGroupPositionStartWithNoGeneralGroup",
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								},
								"booleanParameter": {
									"value": false
								}
							},
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					var oDestinationPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oDestinationPanel.isA("sap.m.Panel"), "Panel: Form content contains Destination Panel");
					assert.equal(oDestinationPanel.getHeaderText(), "Destinations group label defined in DT", "Destination Panel: Header Text");
					assert.ok(!oDestinationPanel.getExpanded(), "Panel: not expanded");
					var DestinationLabel1 = aFormContent[1];
					var DestinationComboBox1 = aFormContent[2].getAggregation("_field");
					assert.ok(DestinationLabel1.isA("sap.m.Label"), "Label1: Form content contains a Label");
					assert.equal(DestinationLabel1.getText(), "dest1 label defined in DT", "Label1: Has dest1 label from destination label property defined in DT");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox1.getBusy() === true, "Content of Form contains: Destination Field that is busy");

					var oGeneralPanel = aFormContent[3].getAggregation("_field");
					assert.ok(oGeneralPanel.isA("sap.m.Panel"), "Panel: Form content contains General Panel");
					assert.equal(oGeneralPanel.getHeaderText(), "General Settings", "General Panel: Header Text");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[4];
					var oField1 = this.oEditor.getAggregation("_formContent")[5];
					assert.ok(oLabel1.isA("sap.m.Label"), "stringParameter Label: Form content 1 contains a Label");
					assert.equal(oLabel1.getText(), "string Parameter", "stringParameter Label: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "stringParameter Field: String Field");
					assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "stringParameter Field: String Value");
					var oCurrentSettings = this.oEditor.getCurrentSettings();
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/stringParameter/value"], "stringParameter Value", "stringParameter Field: manifestpath Value");
					var oLabel2 = this.oEditor.getAggregation("_formContent")[6];
					var oField2 = this.oEditor.getAggregation("_formContent")[7];
					assert.ok(oLabel2.isA("sap.m.Label"), "booleanParameter Label: Form content 2 contains a Label");
					assert.equal(oLabel2.getText(), "booleanParameter", "booleanParameter Label: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "booleanParameter Field: Boolean Field");
					assert.equal(oField2.getAggregation("_field").getSelected(), false, "booleanParameter Field: Value");
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/booleanParameter/value"], false, "booleanParameter Field: manifestpath Value");

					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox1.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 1 that is ComboBox");
						assert.ok(DestinationComboBox1.getBusy() === false, "Content of Form contains: Destination Field 1 that is not busy anymore");
						assert.equal(DestinationComboBox1.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Key OK");
						assert.equal(DestinationComboBox1.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Text OK");
						var oItems = DestinationComboBox1.getItems();
						assert.equal(oItems.length, 4, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Northwind", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Orders", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Portal", "Content of Form contains: Destination Field item 2 Key OK");
						assert.equal(oItems[3].getKey(), "Products", "Content of Form contains: Destination Field item 3 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("In admin mode, no general group defined for parameters 2", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/DestinationGroupPositionStartWithNoGeneralGroup2",
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								},
								"booleanParameter": {
									"value": false
								}
							},
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					var oDestinationPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oDestinationPanel.isA("sap.m.Panel"), "Panel: Form content contains Destination Panel");
					assert.equal(oDestinationPanel.getHeaderText(), "Destinations group label defined in DT", "Destination Panel: Header Text");
					assert.ok(!oDestinationPanel.getExpanded(), "Panel: not expanded");
					var DestinationLabel1 = aFormContent[1];
					var DestinationComboBox1 = aFormContent[2].getAggregation("_field");
					assert.ok(DestinationLabel1.isA("sap.m.Label"), "Label1: Form content contains a Label");
					assert.equal(DestinationLabel1.getText(), "dest1 label defined in DT", "Label1: Has dest1 label from destination label property defined in DT");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox1.getBusy() === true, "Content of Form contains: Destination Field that is busy");

					var oGeneralPanel = aFormContent[3].getAggregation("_field");
					assert.ok(oGeneralPanel.isA("sap.m.Panel"), "Panel: Form content contains General Panel");
					assert.equal(oGeneralPanel.getHeaderText(), "General Settings", "General Panel: Header Text");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[4];
					var oField1 = this.oEditor.getAggregation("_formContent")[5];
					assert.ok(oLabel1.isA("sap.m.Label"), "stringParameter Label: Form content 1 contains a Label");
					assert.equal(oLabel1.getText(), "string Parameter", "stringParameter Label: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "stringParameter Field: String Field");
					assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "stringParameter Field: String Value");
					var oCurrentSettings = this.oEditor.getCurrentSettings();
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/stringParameter/value"], "stringParameter Value", "stringParameter Field: manifestpath Value");
					var oGroupPanel = aFormContent[6].getAggregation("_field");
					assert.ok(oGroupPanel.isA("sap.m.Panel"), "Panel: Form content contains Group Panel");
					assert.equal(oGroupPanel.getHeaderText(), "Group", "Group Panel: Header Text");
					var oLabel2 = this.oEditor.getAggregation("_formContent")[7];
					var oField2 = this.oEditor.getAggregation("_formContent")[8];
					assert.ok(oLabel2.isA("sap.m.Label"), "booleanParameter Label: Form content 2 contains a Label");
					assert.equal(oLabel2.getText(), "booleanParameter", "booleanParameter Label: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "booleanParameter Field: Boolean Field");
					assert.equal(oField2.getAggregation("_field").getSelected(), false, "booleanParameter Field: Value");
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/booleanParameter/value"], false, "booleanParameter Field: manifestpath Value");

					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox1.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 1 that is ComboBox");
						assert.ok(DestinationComboBox1.getBusy() === false, "Content of Form contains: Destination Field 1 that is not busy anymore");
						assert.equal(DestinationComboBox1.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Key OK");
						assert.equal(DestinationComboBox1.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Text OK");
						var oItems = DestinationComboBox1.getItems();
						assert.equal(oItems.length, 4, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Northwind", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Orders", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Portal", "Content of Form contains: Destination Field item 2 Key OK");
						assert.equal(oItems[3].getKey(), "Products", "Content of Form contains: Destination Field item 3 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("In admin mode, general group defined for parameters", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/DestinationGroupPositionStartWithGeneralGroup",
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								},
								"booleanParameter": {
									"value": false
								}
							},
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					var oDestinationPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oDestinationPanel.isA("sap.m.Panel"), "Panel: Form content contains Destination Panel");
					assert.equal(oDestinationPanel.getHeaderText(), "Destinations group label defined in DT", "Destination Panel: Header Text");
					assert.ok(!oDestinationPanel.getExpanded(), "Panel: not expanded");
					var DestinationLabel1 = aFormContent[1];
					var DestinationComboBox1 = aFormContent[2].getAggregation("_field");
					assert.ok(DestinationLabel1.isA("sap.m.Label"), "Label1: Form content contains a Label");
					assert.equal(DestinationLabel1.getText(), "dest1 label defined in DT", "Label1: Has dest1 label from destination label property defined in DT");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox1.getBusy() === true, "Content of Form contains: Destination Field that is busy");

					var oGroupPanel = aFormContent[3].getAggregation("_field");
					assert.ok(oGroupPanel.isA("sap.m.Panel"), "Panel: Form content contains Group Panel");
					assert.equal(oGroupPanel.getHeaderText(), "Group", "Group Panel: Header Text");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[4];
					var oField1 = this.oEditor.getAggregation("_formContent")[5];
					assert.ok(oLabel1.isA("sap.m.Label"), "stringParameter Label: Form content 1 contains a Label");
					assert.equal(oLabel1.getText(), "string Parameter", "stringParameter Label: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "stringParameter Field: String Field");
					assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "stringParameter Field: String Value");
					var oCurrentSettings = this.oEditor.getCurrentSettings();
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/stringParameter/value"], "stringParameter Value", "stringParameter Field: manifestpath Value");
					var oLabel2 = this.oEditor.getAggregation("_formContent")[6];
					var oField2 = this.oEditor.getAggregation("_formContent")[7];
					assert.ok(oLabel2.isA("sap.m.Label"), "booleanParameter Label: Form content 2 contains a Label");
					assert.equal(oLabel2.getText(), "booleanParameter", "booleanParameter Label: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "booleanParameter Field: Boolean Field");
					assert.equal(oField2.getAggregation("_field").getSelected(), false, "booleanParameter Field: Value");
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/booleanParameter/value"], false, "booleanParameter Field: manifestpath Value");

					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox1.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 1 that is ComboBox");
						assert.ok(DestinationComboBox1.getBusy() === false, "Content of Form contains: Destination Field 1 that is not busy anymore");
						assert.equal(DestinationComboBox1.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Key OK");
						assert.equal(DestinationComboBox1.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Text OK");
						var oItems = DestinationComboBox1.getItems();
						assert.equal(oItems.length, 4, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Northwind", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Orders", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Portal", "Content of Form contains: Destination Field item 2 Key OK");
						assert.equal(oItems[3].getKey(), "Products", "Content of Form contains: Destination Field item 3 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("In admin mode, general group defined for parameters 2", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/DestinationGroupPositionStartWithGeneralGroup2",
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								},
								"booleanParameter": {
									"value": false
								}
							},
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					var oDestinationPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oDestinationPanel.isA("sap.m.Panel"), "Panel: Form content contains Destination Panel");
					assert.equal(oDestinationPanel.getHeaderText(), "Destinations group label defined in DT", "Destination Panel: Header Text");
					assert.ok(!oDestinationPanel.getExpanded(), "Panel: not expanded");
					var DestinationLabel1 = aFormContent[1];
					var DestinationComboBox1 = aFormContent[2].getAggregation("_field");
					assert.ok(DestinationLabel1.isA("sap.m.Label"), "Label1: Form content contains a Label");
					assert.equal(DestinationLabel1.getText(), "dest1 label defined in DT", "Label1: Has dest1 label from destination label property defined in DT");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox1.getBusy() === true, "Content of Form contains: Destination Field that is busy");

					var oGroupPanel = aFormContent[3].getAggregation("_field");
					assert.ok(oGroupPanel.isA("sap.m.Panel"), "Panel: Form content contains Group Panel");
					assert.equal(oGroupPanel.getHeaderText(), "Group", "Group Panel: Header Text");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[4];
					var oField1 = this.oEditor.getAggregation("_formContent")[5];
					assert.ok(oLabel1.isA("sap.m.Label"), "stringParameter Label: Form content 1 contains a Label");
					assert.equal(oLabel1.getText(), "string Parameter", "stringParameter Label: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "stringParameter Field: String Field");
					assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "stringParameter Field: String Value");
					var oCurrentSettings = this.oEditor.getCurrentSettings();
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/stringParameter/value"], "stringParameter Value", "stringParameter Field: manifestpath Value");
					var oGroupPanel2 = aFormContent[6].getAggregation("_field");
					assert.ok(oGroupPanel2.isA("sap.m.Panel"), "Panel: Form content contains Group Panel");
					assert.equal(oGroupPanel2.getHeaderText(), "Group 2", "Group Panel: Header Text");
					var oLabel2 = this.oEditor.getAggregation("_formContent")[7];
					var oField2 = this.oEditor.getAggregation("_formContent")[8];
					assert.ok(oLabel2.isA("sap.m.Label"), "booleanParameter Label: Form content 2 contains a Label");
					assert.equal(oLabel2.getText(), "booleanParameter", "booleanParameter Label: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "booleanParameter Field: Boolean Field");
					assert.equal(oField2.getAggregation("_field").getSelected(), false, "booleanParameter Field: Value");
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/booleanParameter/value"], false, "booleanParameter Field: manifestpath Value");

					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox1.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 1 that is ComboBox");
						assert.ok(DestinationComboBox1.getBusy() === false, "Content of Form contains: Destination Field 1 that is not busy anymore");
						assert.equal(DestinationComboBox1.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Key OK");
						assert.equal(DestinationComboBox1.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Text OK");
						var oItems = DestinationComboBox1.getItems();
						assert.equal(oItems.length, 4, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Northwind", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Orders", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Portal", "Content of Form contains: Destination Field item 2 Key OK");
						assert.equal(oItems[3].getKey(), "Products", "Content of Form contains: Destination Field item 3 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("In content mode, no general group defined for parameters", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/DestinationGroupPositionStartWithNoGeneralGroup",
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								},
								"booleanParameter": {
									"value": false
								}
							},
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					var oGeneralPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oGeneralPanel.isA("sap.m.Panel"), "Panel: Form content contains General Panel");
					assert.equal(oGeneralPanel.getHeaderText(), "General Settings", "General Panel: Header Text");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel1.isA("sap.m.Label"), "stringParameter Label: Form content 1 contains a Label");
					assert.equal(oLabel1.getText(), "string Parameter", "stringParameter Label: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "stringParameter Field: String Field");
					assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "stringParameter Field: String Value");
					var oCurrentSettings = this.oEditor.getCurrentSettings();
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/stringParameter/value"], "stringParameter Value", "stringParameter Field: manifestpath Value");
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel2.isA("sap.m.Label"), "booleanParameter Label: Form content 2 contains a Label");
					assert.equal(oLabel2.getText(), "booleanParameter", "booleanParameter Label: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "booleanParameter Field: Boolean Field");
					assert.equal(oField2.getAggregation("_field").getSelected(), false, "booleanParameter Field: Value");
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/booleanParameter/value"], false, "booleanParameter Field: manifestpath Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("In content mode, no general group defined for parameters 2", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/DestinationGroupPositionStartWithNoGeneralGroup2",
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								},
								"booleanParameter": {
									"value": false
								}
							},
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					var oGeneralPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oGeneralPanel.isA("sap.m.Panel"), "Panel: Form content contains General Panel");
					assert.equal(oGeneralPanel.getHeaderText(), "General Settings", "General Panel: Header Text");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel1.isA("sap.m.Label"), "stringParameter Label: Form content 1 contains a Label");
					assert.equal(oLabel1.getText(), "string Parameter", "stringParameter Label: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "stringParameter Field: String Field");
					assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "stringParameter Field: String Value");
					var oCurrentSettings = this.oEditor.getCurrentSettings();
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/stringParameter/value"], "stringParameter Value", "stringParameter Field: manifestpath Value");
					var oGroupPanel = aFormContent[3].getAggregation("_field");
					assert.ok(oGroupPanel.isA("sap.m.Panel"), "Panel: Form content contains Group Panel");
					assert.equal(oGroupPanel.getHeaderText(), "Group", "Group Panel: Header Text");
					var oLabel2 = this.oEditor.getAggregation("_formContent")[4];
					var oField2 = this.oEditor.getAggregation("_formContent")[5];
					assert.ok(oLabel2.isA("sap.m.Label"), "booleanParameter Label: Form content 2 contains a Label");
					assert.equal(oLabel2.getText(), "booleanParameter", "booleanParameter Label: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "booleanParameter Field: Boolean Field");
					assert.equal(oField2.getAggregation("_field").getSelected(), false, "booleanParameter Field: Value");
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/booleanParameter/value"], false, "booleanParameter Field: manifestpath Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("In content mode, general group defined for parameters", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/DestinationGroupPositionStartWithGeneralGroup",
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								},
								"booleanParameter": {
									"value": false
								}
							},
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					var oGroupPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oGroupPanel.isA("sap.m.Panel"), "Panel: Form content contains Group Panel");
					assert.equal(oGroupPanel.getHeaderText(), "Group", "Group Panel: Header Text");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel1.isA("sap.m.Label"), "stringParameter Label: Form content 1 contains a Label");
					assert.equal(oLabel1.getText(), "string Parameter", "stringParameter Label: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "stringParameter Field: String Field");
					assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "stringParameter Field: String Value");
					var oCurrentSettings = this.oEditor.getCurrentSettings();
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/stringParameter/value"], "stringParameter Value", "stringParameter Field: manifestpath Value");
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel2.isA("sap.m.Label"), "booleanParameter Label: Form content 2 contains a Label");
					assert.equal(oLabel2.getText(), "booleanParameter", "booleanParameter Label: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "booleanParameter Field: Boolean Field");
					assert.equal(oField2.getAggregation("_field").getSelected(), false, "booleanParameter Field: Value");
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/booleanParameter/value"], false, "booleanParameter Field: manifestpath Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("In content mode, general group defined for parameters 2", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/DestinationGroupPositionStartWithGeneralGroup2",
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								},
								"booleanParameter": {
									"value": false
								}
							},
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					var oGroupPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oGroupPanel.isA("sap.m.Panel"), "Panel: Form content contains Group Panel");
					assert.equal(oGroupPanel.getHeaderText(), "Group", "Group Panel: Header Text");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel1.isA("sap.m.Label"), "stringParameter Label: Form content 1 contains a Label");
					assert.equal(oLabel1.getText(), "string Parameter", "stringParameter Label: Has label text");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.StringField"), "stringParameter Field: String Field");
					assert.equal(oField1.getAggregation("_field").getValue(), "stringParameter Value", "stringParameter Field: String Value");
					var oCurrentSettings = this.oEditor.getCurrentSettings();
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/stringParameter/value"], "stringParameter Value", "stringParameter Field: manifestpath Value");
					var oGroupPanel2 = aFormContent[3].getAggregation("_field");
					assert.ok(oGroupPanel2.isA("sap.m.Panel"), "Panel: Form content contains Group Panel");
					assert.equal(oGroupPanel2.getHeaderText(), "Group 2", "Group Panel: Header Text");
					var oLabel2 = this.oEditor.getAggregation("_formContent")[4];
					var oField2 = this.oEditor.getAggregation("_formContent")[5];
					assert.ok(oLabel2.isA("sap.m.Label"), "booleanParameter Label: Form content 2 contains a Label");
					assert.equal(oLabel2.getText(), "booleanParameter", "booleanParameter Label: Has label text");
					assert.ok(oField2.isA("sap.ui.integration.editor.fields.BooleanField"), "booleanParameter Field: Boolean Field");
					assert.equal(oField2.getAggregation("_field").getSelected(), false, "booleanParameter Field: Value");
					assert.equal(oCurrentSettings["/sap.card/configuration/parameters/booleanParameter/value"], false, "booleanParameter Field: manifestpath Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("In translation mode, no general group defined for parameters", function (assert) {
			this.oEditor.setMode("translation");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/DestinationGroupPositionStartWithNoGeneralGroup",
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								},
								"booleanParameter": {
									"value": false
								}
							},
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 2, "Editor: has 2 item");
					var oPanel1 = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
					var oPanel2 = aFormContent[1].getAggregation("_field");
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panel");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("In translation mode, no general group defined for parameters 2", function (assert) {
			this.oEditor.setMode("translation");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/DestinationGroupPositionStartWithNoGeneralGroup2",
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								},
								"booleanParameter": {
									"value": false
								}
							},
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 3, "Editor: has 3 item");
					var oPanel1 = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
					var oPanel2 = aFormContent[1].getAggregation("_field");
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panel");
					var oPanel3 = aFormContent[2].getAggregation("_field");
					assert.ok(oPanel3.isA("sap.m.Panel"), "Panel: Form content contains 3 Panel");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("In translation mode, general group defined for parameters", function (assert) {
			this.oEditor.setMode("translation");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/DestinationGroupPositionStartWithGeneralGroup",
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								},
								"booleanParameter": {
									"value": false
								}
							},
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 2, "Editor: has 2 item");
					var oPanel1 = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
					var oPanel2 = aFormContent[1].getAggregation("_field");
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panel");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("In translation mode, general group defined for parameters 2", function (assert) {
			this.oEditor.setMode("translation");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/DestinationGroupPositionStartWithGeneralGroup2",
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								},
								"booleanParameter": {
									"value": false
								}
							},
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 3, "Editor: has 3 item");
					var oPanel1 = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains 1 Panel");
					var oPanel2 = aFormContent[1].getAggregation("_field");
					assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panel");
					var oPanel3 = aFormContent[2].getAggregation("_field");
					assert.ok(oPanel3.isA("sap.m.Panel"), "Panel: Form content contains 3 Panel");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Sorter", {
		beforeEach: function () {
			Localization.setLanguage("en");
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("Default", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationInDT",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 5, "Editor: has 2 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var DestinationLabel1 = aFormContent[1];
					var DestinationComboBox1 = aFormContent[2].getAggregation("_field");
					var DestinationLabel2 = aFormContent[3];
					var DestinationComboBox2 = aFormContent[4].getAggregation("_field");
					assert.ok(DestinationLabel1.isA("sap.m.Label"), "Label1: Form content contains a Label");
					assert.equal(DestinationLabel1.getText(), "dest1 label defined in DT", "Label1: Has dest1 label from destination label property defined in DT");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox1.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					assert.ok(DestinationLabel2.isA("sap.m.Label"), "Label2: Form content contains a Label");
					assert.equal(DestinationLabel2.getText(), "dest2 label defined in manifest", "Label2: Has dest2 label from destination label property defined in manifest");
					assert.ok(!DestinationComboBox2.getEditable(), "Content of Form contains: Destination Field 2 is NOT editable");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox1.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 1 that is ComboBox");
						assert.ok(DestinationComboBox1.getBusy() === false, "Content of Form contains: Destination Field 1 that is not busy anymore");
						assert.equal(DestinationComboBox1.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Key OK");
						assert.equal(DestinationComboBox1.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Text OK");
						var oItems = DestinationComboBox1.getItems();
						assert.equal(oItems.length, 4, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Northwind", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Orders", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Portal", "Content of Form contains: Destination Field item 2 Key OK");
						assert.equal(oItems[3].getKey(), "Products", "Content of Form contains: Destination Field item 3 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Descending", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationSorterAndFilter",
							"destinations": {
								"dest1": {
									"name": "Northwind"
								},
								"dest2": {
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								},
								"dest4": {
									"name": "Northwind"
								},
								"dest5": {
									"name": "Northwind"
								},
								"dest6": {
									"name": "Northwind"
								},
								"dest7": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 15, "Editor: has 7 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var DestinationLabel1 = aFormContent[1];
					var DestinationComboBox1 = aFormContent[2].getAggregation("_field");
					assert.ok(DestinationLabel1.isA("sap.m.Label"), "Label1: Form content contains a Label");
					assert.equal(DestinationLabel1.getText(), "dest1 with sorter", "Label1: Has dest1 label from destination label property defined in DT");
					assert.ok(this.oEditor.getAggregation("_formContent")[2].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox1.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox1.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 1 that is ComboBox");
						assert.ok(DestinationComboBox1.getBusy() === false, "Content of Form contains: Destination Field 1 that is not busy anymore");
						assert.equal(DestinationComboBox1.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Key OK");
						assert.equal(DestinationComboBox1.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field 1 selectedItem: Text OK");
						var oItems = DestinationComboBox1.getItems();
						assert.equal(oItems.length, 4, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Products", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Portal", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Orders", "Content of Form contains: Destination Field item 2 Key OK");
						assert.equal(oItems[3].getKey(), "Northwind", "Content of Form contains: Destination Field item 3 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Filter", {
		beforeEach: function () {
			Localization.setLanguage("en");
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("One filter", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationSorterAndFilter",
							"destinations": {
								"dest1": {
									"name": "Northwind"
								},
								"dest2": {
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								},
								"dest4": {
									"name": "Northwind"
								},
								"dest5": {
									"name": "Northwind"
								},
								"dest6": {
									"name": "Northwind"
								},
								"dest7": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 15, "Editor: has 7 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var DestinationLabel2 = aFormContent[3];
					var DestinationComboBox2 = aFormContent[4].getAggregation("_field");
					assert.ok(DestinationLabel2.isA("sap.m.Label"), "Label2: Form content contains a Label");
					assert.equal(DestinationLabel2.getText(), "dest2 with filter", "Label2: Has dest2 label");
					assert.ok(this.oEditor.getAggregation("_formContent")[4].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox2.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox2.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 2 that is ComboBox");
						assert.ok(DestinationComboBox2.getBusy() === false, "Content of Form contains: Destination Field 2 that is not busy anymore");
						assert.equal(DestinationComboBox2.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 2 selectedItem: Key OK");
						assert.equal(DestinationComboBox2.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field 2 selectedItem: Text OK");
						var oItems = DestinationComboBox2.getItems();
						assert.equal(oItems.length, 3, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Northwind", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Portal", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Products", "Content of Form contains: Destination Field item 2 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Two filters and And condition default", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationSorterAndFilter",
							"destinations": {
								"dest1": {
									"name": "Northwind"
								},
								"dest2": {
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								},
								"dest4": {
									"name": "Northwind"
								},
								"dest5": {
									"name": "Northwind"
								},
								"dest6": {
									"name": "Northwind"
								},
								"dest7": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 15, "Editor: has 7 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var DestinationLabel3 = aFormContent[5];
					var DestinationComboBox3 = aFormContent[6].getAggregation("_field");
					assert.ok(DestinationLabel3.isA("sap.m.Label"), "Label3: Form content contains a Label");
					assert.equal(DestinationLabel3.getText(), "dest3 with filters and And condition default", "Label3: Has dest3 label");
					assert.ok(this.oEditor.getAggregation("_formContent")[6].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox3.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox3.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 3 that is ComboBox");
						assert.ok(DestinationComboBox3.getBusy() === false, "Content of Form contains: Destination Field 3 that is not busy anymore");
						assert.equal(DestinationComboBox3.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 3 selectedItem: Key OK");
						assert.ok(!DestinationComboBox3.getSelectedItem(), "Content of Form contains: Destination Field 3 no selectedItem");
						var oItems = DestinationComboBox3.getItems();
						assert.equal(oItems.length, 3, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Orders", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Portal", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Products", "Content of Form contains: Destination Field item 2 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Two filters and And condition TRUE", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationSorterAndFilter",
							"destinations": {
								"dest1": {
									"name": "Northwind"
								},
								"dest2": {
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								},
								"dest4": {
									"name": "Northwind"
								},
								"dest5": {
									"name": "Northwind"
								},
								"dest6": {
									"name": "Northwind"
								},
								"dest7": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 15, "Editor: has 7 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var DestinationLabel4 = aFormContent[7];
					var DestinationComboBox4 = aFormContent[8].getAggregation("_field");
					assert.ok(DestinationLabel4.isA("sap.m.Label"), "Label4: Form content contains a Label");
					assert.equal(DestinationLabel4.getText(), "dest4 with filters and And condition TRUE", "Label4: Has dest4 label");
					assert.ok(this.oEditor.getAggregation("_formContent")[8].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox4.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox4.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 4 that is ComboBox");
						assert.ok(DestinationComboBox4.getBusy() === false, "Content of Form contains: Destination Field 4 that is not busy anymore");
						assert.equal(DestinationComboBox4.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 4 selectedItem: Key OK");
						assert.ok(!DestinationComboBox4.getSelectedItem(), "Content of Form contains: Destination Field 4 no selectedItem");
						var oItems = DestinationComboBox4.getItems();
						assert.equal(oItems.length, 1, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Products", "Content of Form contains: Destination Field item 0 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Two filters and And condition FALSE", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationSorterAndFilter",
							"destinations": {
								"dest1": {
									"name": "Northwind"
								},
								"dest2": {
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								},
								"dest4": {
									"name": "Northwind"
								},
								"dest5": {
									"name": "Northwind"
								},
								"dest6": {
									"name": "Northwind"
								},
								"dest7": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 15, "Editor: has 7 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var DestinationLabel5 = aFormContent[9];
					var DestinationComboBox5 = aFormContent[10].getAggregation("_field");
					assert.ok(DestinationLabel5.isA("sap.m.Label"), "Label5: Form content contains a Label");
					assert.equal(DestinationLabel5.getText(), "dest5 with filters and And condition FALSE", "Label5: Has dest5 label");
					assert.ok(this.oEditor.getAggregation("_formContent")[6].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox5.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox5.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 5 that is ComboBox");
						assert.ok(DestinationComboBox5.getBusy() === false, "Content of Form contains: Destination Field 5 that is not busy anymore");
						assert.equal(DestinationComboBox5.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 5 selectedItem: Key OK");
						assert.ok(!DestinationComboBox5.getSelectedItem(), "Content of Form contains: Destination Field 5 no selectedItem");
						var oItems = DestinationComboBox5.getItems();
						assert.equal(oItems.length, 3, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Orders", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Portal", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Products", "Content of Form contains: Destination Field item 2 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("One filter with sorters", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationSorterAndFilter",
							"destinations": {
								"dest1": {
									"name": "Northwind"
								},
								"dest2": {
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								},
								"dest4": {
									"name": "Northwind"
								},
								"dest5": {
									"name": "Northwind"
								},
								"dest6": {
									"name": "Northwind"
								},
								"dest7": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 15, "Editor: has 7 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var DestinationLabel6 = aFormContent[11];
					var DestinationComboBox6 = aFormContent[12].getAggregation("_field");
					assert.ok(DestinationLabel6.isA("sap.m.Label"), "Label6: Form content contains a Label");
					assert.equal(DestinationLabel6.getText(), "dest6 with sorters and filter", "Label6: Has dest6 label");
					assert.ok(this.oEditor.getAggregation("_formContent")[12].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox6.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox6.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 6 that is ComboBox");
						assert.ok(DestinationComboBox6.getBusy() === false, "Content of Form contains: Destination Field 6 that is not busy anymore");
						assert.equal(DestinationComboBox6.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 6 selectedItem: Key OK");
						assert.equal(DestinationComboBox6.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field 6 selectedItem: Text OK");
						var oItems = DestinationComboBox6.getItems();
						assert.equal(oItems.length, 3, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Products", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Portal", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Northwind", "Content of Form contains: Destination Field item 2 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Two filters with sorters", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationSorterAndFilter",
							"destinations": {
								"dest1": {
									"name": "Northwind"
								},
								"dest2": {
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								},
								"dest4": {
									"name": "Northwind"
								},
								"dest5": {
									"name": "Northwind"
								},
								"dest6": {
									"name": "Northwind"
								},
								"dest7": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 15, "Editor: has 7 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var DestinationLabel7 = aFormContent[13];
					var DestinationComboBox7 = aFormContent[14].getAggregation("_field");
					assert.ok(DestinationLabel7.isA("sap.m.Label"), "Label7: Form content contains a Label");
					assert.equal(DestinationLabel7.getText(), "dest7 with sorters and filters", "Label7: Has dest3 label");
					assert.ok(this.oEditor.getAggregation("_formContent")[14].isA("sap.ui.integration.editor.fields.DestinationField"), "Content of Form contains: Destination Field");
					assert.ok(DestinationComboBox7.getBusy() === true, "Content of Form contains: Destination Field that is busy");
					EditorQunitUtils.isDestinationReady(this.oEditor).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(DestinationComboBox7.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field 7 that is ComboBox");
						assert.ok(DestinationComboBox7.getBusy() === false, "Content of Form contains: Destination Field 7 that is not busy anymore");
						assert.equal(DestinationComboBox7.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field 7 selectedItem: Key OK");
						assert.ok(!DestinationComboBox7.getSelectedItem(), "Content of Form contains: Destination Field 7 no selectedItem");
						var oItems = DestinationComboBox7.getItems();
						assert.equal(oItems.length, 3, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Products", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Portal", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Orders", "Content of Form contains: Destination Field item 2 Key OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
