/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/core/util/MockServer",
	"./jsons/withDesigntime/temp/DataExtensionImpl"
], function (
	merge,
	x,
	Editor,
	Designtime,
	Host,
	sinon,
	ContextHost,
	Core,
	QUnitUtils,
	KeyCodes,
	ResourceBundle,
	MockServer,
	DataExtensionImpl
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/temp/";
	var iWaitTimeout = 1500;
	var oResponseData = {
		"Customers": [
			{"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1"},
			{"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2"},
			{"CustomerID": "c", "CompanyName": "C1 Company", "Country": "Country 3", "City": "City 3", "Address": "Address 3"},
			{"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4"}
		],
		"Customers_1_2": [
			{"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2"},
			{"CustomerID": "c", "CompanyName": "C Company", "Country": "Country 3", "City": "City 3", "Address": "Address 3"}
		],
		"Customers_CustomerID_b_startswith_": [
			{"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2"}
		],
		"Customers_startswith_": [
			{"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1"},
			{"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2"},
			{"CustomerID": "c", "CompanyName": "C1 Company", "Country": "Country 3", "City": "City 3", "Address": "Address 3"},
			{"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4"}
		],
		"Customers_startswith_c": [
			{"CustomerID": "c", "CompanyName": "C1 Company", "Country": "Country 3", "City": "City 3", "Address": "Address 3"},
			{"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4"}
		],
		"Employees": [
			{"EmployeeID": 1, "FirstName": "FirstName1", "LastName": "LastName1", "Country": "Country 1", "Title": "City 1", "HomePhone": "111111"},
			{"EmployeeID": 2, "FirstName": "FirstName2", "LastName": "LastName2", "Country": "Country 2", "Title": "City 2", "HomePhone": "222222"},
			{"EmployeeID": 3, "FirstName": "FirstName3", "LastName": "LastName3", "Country": "Country 3", "Title": "City 3", "HomePhone": "333333"},
			{"EmployeeID": 4, "FirstName": "FirstName4", "LastName": "LastName4", "Country": "Country 4", "Title": "City 4", "HomePhone": "444444"},
			{"EmployeeID": 5, "FirstName": "FirstName5", "LastName": "LastName5", "Country": "Country 5", "Title": "City 5", "HomePhone": "555555"},
			{"EmployeeID": 6, "FirstName": "FirstName6", "LastName": "LastName6", "Country": "Country 6", "Title": "City 6", "HomePhone": "666666"}
		],
		"Employees_endswith__endswith_": [
			{"EmployeeID": 1, "FirstName": "FirstName1", "LastName": "LastName1", "Country": "Country 1", "Title": "City 1", "HomePhone": "111111"},
			{"EmployeeID": 2, "FirstName": "FirstName2", "LastName": "LastName2", "Country": "Country 2", "Title": "City 2", "HomePhone": "222222"},
			{"EmployeeID": 3, "FirstName": "FirstName3", "LastName": "LastName3", "Country": "Country 3", "Title": "City 3", "HomePhone": "333333"},
			{"EmployeeID": 4, "FirstName": "FirstNamen", "LastName": "LastNamen", "Country": "Country 4", "Title": "City 4", "HomePhone": "444444"},
			{"EmployeeID": 5, "FirstName": "FirstName5", "LastName": "LastName5", "Country": "Country 5", "Title": "City 5", "HomePhone": "555555"},
			{"EmployeeID": 6, "FirstName": "FirstName6", "LastName": "LastName6", "Country": "Country 6", "Title": "City 6", "HomePhone": "666666"}
		],
		"Employees_endswith_n_endswith_n": [
			{"EmployeeID": 4, "FirstName": "FirstNamen", "LastName": "LastNamen", "Country": "Country 4", "Title": "City 4", "HomePhone": "444444"}
		],
		"Orders_a_1": [
			{"OrderID": 1, "OrderDate": "2021-02-11", "CustomerID": "a", "EmployeeID": 1}
		],
		"Orders_b_2": [
			{"OrderID": 2, "OrderDate": "2021-02-12", "CustomerID": "b", "EmployeeID": 2},
			{"OrderID": 3, "OrderDate": "2021-02-13", "CustomerID": "b", "EmployeeID": 2}
		],
		"Products_1": [
			{"ProductID": 1, "OrderID": 1, "UnitPrice": 32.4, "Quantity": 2, "Product": {"ProductID": 1, "ProductName": "Product A"}},
			{"ProductID": 2, "OrderID": 1, "UnitPrice": 11.5, "Quantity": 4, "Product": {"ProductID": 2, "ProductName": "Product B"}}
		],
		"Products_2": [
			{"ProductID": 3, "OrderID": 2, "UnitPrice": 12.3, "Quantity": 6, "Product": {"ProductID": 3, "ProductName": "Product C"}}
		]
	};
	var oManifestBasic = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"temp": {
			"designtime": "designtime/linkedDropdownList",
			"type": "List",
			"header": {},
			"configuration": {
				"parameters": {
					"Customer": {
						"value": ""
					},
					"Employee": {
						"value": ""
					},
					"Order": {
						"value": ""
					},
					"Product": {
						"value": ""
					},
					"CustomerWithTopAndSkipOption": {
						"value": ""
					}
				},
				"destinations": {
					"northwind": {
						"name": "Northwind"
					},
					"mock_request": {
						"name": "mock_request"
					}
				}
			}
		}
	};
	var oManifestForExtension = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"temp": {
			"extension": "DataExtensionImpl",
			"designtime": "designtime/extension",
			"type": "List",
			"header": {},
			"data": {
				"extension": {
					"method": "getData"
				},
				"path": "/values"
			},
			"configuration": {
				"parameters": {
					"DataGotFromExtensionRequest": {
						"value": ""
					},
					"DataGotFromEditorExtension": {
						"value": ""
					}
				},
				"destinations": {
					"northwind": {
						"name": "Northwind"
					},
					"mock_request": {
						"name": "mock_request"
					}
				}
			},
			"content": {
				"item": {
					"title": "{title}",
					"description": "Trainer: {trainer}",
					"info": {
						"value": "Location: {location}"
					}
				},
				"maxItems": 4
			}
		}
	};
	var oManifestForEditableDependence = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"temp": {
			"designtime": "designtime/filterBackendWithEditableDependence",
			"type": "List",
			"header": {},
			"configuration": {
				"parameters": {
					"boolean": {
						"value": false
					},
					"CustomerWithEditableDependent": {
						"value": ""
					},
					"CustomersWithEditableDependent": {
						"value": []
					},
					"CustomersInMultiInputWithEditableDependent": {
						"value": []
					}
				},
				"destinations": {
					"northwind": {
						"name": "Northwind"
					},
					"mock_request": {
						"name": "mock_request"
					}
				}
			}
		}
	};
	var oManifestForVisibleDependence = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"temp": {
			"designtime": "designtime/filterBackendWithVisibleDependence",
			"type": "List",
			"header": {},
			"configuration": {
				"parameters": {
					"boolean": {
						"value": false
					},
					"CustomerWithVisibleDependent": {
						"value": ""
					},
					"CustomersWithVisibleDependent": {
						"value": []
					},
					"CustomersInMultiInputWithVisibleDependent": {
						"value": []
					}
				},
				"destinations": {
					"northwind": {
						"name": "Northwind"
					},
					"mock_request": {
						"name": "mock_request"
					}
				}
			}
		}
	};

	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function getDefaultContextModel(oResourceBundle) {

		return {
			empty: {
				label: oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_VAL"),
				type: "string",
				description: oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_DESC"),
				placeholder: "",
				value: ""
			},
			"editor.internal": {
				label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_INTERNAL_VAL"),
				todayIso: {
					type: "string",
					label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
					description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_DESC"),
					tags: [],
					placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
					customize: ["format.dataTime"],
					value: "{{parameters.TODAY_ISO}}"
				},
				nowIso: {
					type: "string",
					label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
					description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_DESC"),
					tags: [],
					placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
					customize: ["dateFormatters"],
					value: "{{parameters.NOW_ISO}}"
				},
				currentLanguage: {
					type: "string",
					label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					tags: ["technical"],
					customize: ["languageFormatters"],
					placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					value: "{{parameters.LOCALE}}"
				}
			}
		};
	}

	QUnit.module("Create an editor based on old manifest without dt", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
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
		QUnit.test("1 string parameter", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"temp": {
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value",
									"label": "string Parameter",
									"type": "string"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "string Parameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "stringParameter Value", "Field: String Value");
					var oCurrentSettings = this.oEditor.getCurrentSettings();
					assert.equal(oCurrentSettings["/temp/configuration/parameters/stringParameter/value"], "stringParameter Value", "Field: manifestpath Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Create an editor based on json with designtime module", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
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
		QUnit.test("Empty Host Context", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oModel = this.oEditor.getModel("context");
					assert.ok(oModel !== null, "Editor has a context model");
					assert.deepEqual(oModel.getData(), getDefaultContextModel(this.oEditor._oResourceBundle), "Editor has a default context model");
					assert.equal(oModel.getProperty("/sap.workzone/currentUser/id"), undefined, "Editor context /sap.workzone/currentUser/id is undefned");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Context Host checks to access context data async", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ host: "contexthost", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oModel = this.oEditor.getModel("context");
					assert.ok(oModel !== null, "Editor has a context model");
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/label"), "Id of the Work Zone user", "Editor host context contains the user id label 'Id of the Work Zone'");
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/placeholder"), "Work Zone user id", "Editor host context contains the user id placeholder 'Work Zone user id'");
					var oBinding = oModel.bindProperty("/sap.workzone/currentUser/id/value");
					oBinding.attachChange(function () {
						assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/value"), "MyCurrentUserId", "Editor host context user id value is 'MyCurrentUserId'");
						resolve();
					});
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/value"), undefined, "Editor host context user id value is undefined");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("No configuration section (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/noconfig", "type": "List", "header": {} } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty configuration section (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/noconfig", "type": "List", "configuration": {} } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty parameters section (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/noconfig", "type": "List", "configuration": { "parameters": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination section (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/noconfig", "type": "List", "configuration": { "destination": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination and parameters section (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/noconfig", "type": "List", "configuration": { "destination": {}, "parameters": {} } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and no label (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"temp": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "stringParameter Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 hint below a group (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},
				"temp": {
					"designtime": "designtime/1hintbelowgroup",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringParameter": {
								"type": "string"
							}
						}
					}
				}
			}
		});
		return new Promise(function (resolve, reject) {
			this.oEditor.attachReady(function () {
				assert.ok(this.oEditor.isReady(), "Editor is ready");
				var oHint = this.oEditor.getAggregation("_formContent")[1];
				assert.ok(oHint.isA("sap.m.FormattedText"), "Hint: Form content contains a Hint");
				assert.equal(oHint.getHtmlText(), 'Please refer to the <a target="blank" href="https://www.sap.com" class="sapMLnk">documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a target="blank" href="https://www.sap.com" class="sapMLnk">two links</a>. good?', "Hint: Has html hint text");
				resolve();
			}.bind(this));
		}.bind(this));
		});

		QUnit.test("1 hint below an item (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},
				"temp": {
					"designtime": "designtime/1hintbelowgroup",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringParameter": {
								"type": "string"
							}
						}
					}
				}
			}
		});
		return new Promise(function (resolve, reject) {
			this.oEditor.attachReady(function () {
				assert.ok(this.oEditor.isReady(), "Editor is ready");
				var oHint = this.oEditor.getAggregation("_formContent")[4];
				assert.ok(oHint.isA("sap.m.FormattedText"), "Hint: Form content contains a Hint");
				assert.equal(oHint.getHtmlText(), 'Please refer to the <a target="blank" href="https://www.sap.com" class="sapMLnk">documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a target="blank" href="https://www.sap.com" class="sapMLnk">two links</a>. good?', "Hint: Has html hint text");
				resolve();
			}.bind(this));
		}.bind(this));
		});

		QUnit.test("1 string parameter with values and no label (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/1stringwithvalues", "type": "List", "configuration": { "parameters": { "stringParameterWithValues": { "type": "string" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					setTimeout(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
						assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Editor is ComboBox");
						var aItems = oField.getAggregation("_field").getItems();
						assert.equal(aItems.length, 3, "Field: Select items lenght is OK");
						assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
						assert.equal(aItems[0].getText(), "text1", "Field: Select item 0 Text is OK");
						assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
						assert.equal(aItems[1].getText(), "text2", "Field: Select item 1 Text is OK");
						assert.equal(aItems[2].getKey(), "key3", "Field: Select item 1 Key is OK");
						assert.equal(aItems[2].getText(), "text3", "Field: Select item 1 Text is OK");
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter with request values from json file", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"temp": {
						"designtime": "designtime/1stringWithRequestValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"1stringWithRequestValues": {
									"type": "string"
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
					setTimeout(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
						assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Editor is ComboBox");
						var aItems = oField.getAggregation("_field").getItems();
						assert.equal(aItems.length, 4, "Field: Select items lenght is OK");
						assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
						assert.equal(aItems[0].getText(), "text1req", "Field: Select item 0 Text is OK");
						assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
						assert.equal(aItems[1].getText(), "text2req", "Field: Select item 1 Text is OK");
						assert.equal(aItems[2].getKey(), "key3", "Field: Select item 2 Key is OK");
						assert.equal(aItems[2].getText(), "text3req", "Field: Select item 2 Text is OK");
						assert.equal(aItems[3].getKey(), "key4", "Field: Select item 3 Key is OK");
						assert.equal(aItems[3].getText(), "text4req", "Field: Select item 3 Text is OK");
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string array parameter with values (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"temp": {
						"designtime": "designtime/1stringarray",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringArrayParameter": {
									"value": ["key1"]
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
					setTimeout(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
						assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Editor is MultiComboBox");
						assert.equal(oField.getAggregation("_field").getItems().length, 5, "Field: MultiComboBox items lenght is OK");
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string array parameter with no values (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"temp": {
						"designtime": "designtime/1stringarraynovalues",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringArrayParameterNoValues": {},
								"stringArrayParameterNoValuesNotEditable": {}
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringArrayParameterNoValues", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editor is Input");
					assert.equal(oField.getAggregation("_field").getValue(), "", "Field: Input value is OK");
					oLabel = this.oEditor.getAggregation("_formContent")[3];
					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringArrayParameterNoValuesNotEditable", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editor is Input");
					assert.equal(oField.getAggregation("_field").getValue(), "", "Field: Input value is OK");
					assert.ok(!oField.getAggregation("_field").getEditable(), "Field: Input editable is OK");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string array parameter with request values from json file", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"temp": {
						"designtime": "designtime/1stringArrayWithRequestValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringArrayParameter": {
									"value": ["key1"]
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
					setTimeout(function () {
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
						assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Editor is MultiComboBox");
						assert.equal(oField.getAggregation("_field").getItems().length, 6, "Field: MultiComboBox items lenght is OK");
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"temp": {
						"designtime": "designtime/1stringlabel",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "StaticLabel Value"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "StaticLabel Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/icon", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					var oSelect = oField.getAggregation("_field").getAggregation("_control");
					setTimeout(function () {
						oSelect.setSelectedIndex(10);
						oSelect.open();
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with Not Allow File (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/iconWithNotAllowFile", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					var oSelect = oField.getAggregation("_field").getAggregation("_control");
					setTimeout(function () {
						assert.ok(oSelect.getItemByKey("").getEnabled(), "Icon: item none is enabled");
						assert.ok(!oSelect.getItemByKey("file").getEnabled(), "Icon: item file is disabled");
						assert.ok(!oSelect.getItemByKey("selected").getEnabled(), "Icon: item selected is disabled");
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with Not Allow None (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/iconWithNotAllowNone", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					var oSelect = oField.getAggregation("_field").getAggregation("_control");
					setTimeout(function () {
						assert.ok(!oSelect.getItemByKey("").getEnabled(), "Icon: item none is disabled");
						assert.ok(oSelect.getItemByKey("file").getEnabled(), "Icon: item file is enabled");
						assert.ok(!oSelect.getItemByKey("selected").getEnabled(), "Icon: item selected is disabled");
						resolve();
					}, 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and value trans (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"temp": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "{{STRINGPARAMETERVALUE}}"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "StringParameter Value Trans in i18n", "Field: Value from Translate change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and value trans in i18n format (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"temp": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "{i18n>STRINGPARAMETERVALUE}"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "StringParameter Value Trans in i18n", "Field: Value from Translate change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label trans (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"temp": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "StringLabelTrans Value"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "StringLabelTrans Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 integer parameter and no label no value (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/1integer", "type": "List", "configuration": { "parameters": { "integerParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "integerParameter", "Label: Has integerParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.equal(oField.getAggregation("_field").getValue(), "0", "Field: Value 0 since No Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 integer parameter and label with no value (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/1integerlabel", "type": "List", "configuration": { "parameters": { "integerParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "integerParameterLabel", "Label: Has integerParameter label from label");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.equal(oField.getAggregation("_field").getValue(), "0", "Field: Value 0 since No Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 number parameter and label with no value (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/1number", "type": "List", "configuration": { "parameters": { "numberParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "numberParameter", "Label: Has numberParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.NumberField"), "Field: Number Field");
					assert.equal(oField.getAggregation("_field").getValue(), "0", "Field: Value 0 since No Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 date parameter and label with no value (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/1date", "type": "List", "configuration": { "parameters": { "dateParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "dateParameter", "Label: Has dateParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
					assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
					//force rendering
					Core.applyChanges();
					//check the change event handling of the field
					oField.getAggregation("_field").setValue(new Date());
					// oField.getAggregation("_field").fireChange({ valid: true });
					// assert.equal(oField.getAggregation("_field").getBinding("value").getValue(), oField.getAggregation("_field").getValue(), "Field: Date Field binding raw value '" + oField.getAggregation("_field").getValue() + "' ");
					oField.getAggregation("_field").fireChange({ valid: false });
					assert.equal(oField.getAggregation("_field").getBinding("value").getValue(), "", "Field: Date Field binding raw value '' ");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 datetime parameter and label with no value (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/1datetime", "type": "List", "configuration": { "parameters": { "datetimeParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "datetimeParameter", "Label: Has datetimeParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
					assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
					//force rendering
					Core.applyChanges();
					//check the change event handling of the field
					oField.getAggregation("_field").setValue(new Date());
					// oField.getAggregation("_field").fireChange({ valid: true });
					// assert.equal(oField.getAggregation("_field").getBinding("value").getValue(), oField.getAggregation("_field").getValue().toISOString(), "Field: DateTime Field binding raw value '" + oField.getAggregation("_field").getDateValue().toISOString() + "' ");
					oField.getAggregation("_field").fireChange({ valid: false });
					assert.equal(oField.getAggregation("_field").getBinding("value").getValue(), "", "Field: DateTime Field binding raw value '' ");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 boolean parameter and label with no value (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/1boolean", "type": "List", "configuration": { "parameters": { "booleanParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "booleanParameter", "Label: Has booleanParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField.getAggregation("_field").getSelected() === false, "Field: No value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 destination (as json)", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel = this.oEditor.getAggregation("_formContent")[0];
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "dest1", "Label: Has dest1 label from destination settings name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Start the editor in admin mode", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setSection("temp");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/1stringlabel", "type": "List", "configuration": { "parameters": { "stringParameter": {} }, "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					var oPanel = this.oEditor.getAggregation("_formContent")[3];
					var oLabel1 = this.oEditor.getAggregation("_formContent")[4];
					var oField1 = this.oEditor.getAggregation("_formContent")[5];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.ok(oLabel1.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel1.getText(), "dest1", "Label: Has dest1 label from destination settings name");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Start the editor in content mode", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setMode("content");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/1stringlabel", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Start the editor in translation mode", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setMode("translation");

			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");

			this.oEditor.setLanguage("fr");

			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
                    assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains a Panel");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the NotEditable and NotVisible string parameters", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setMode("translation");

			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");

			this.oEditor.setLanguage("fr");

			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"temp": {
						"designtime": "designtime/stringsTransWithNotEditableOrNotVisible",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringNotEditableParameter": {
									"value": ""
								},
								"stringNotVisibleParameter": {
									"value": ""
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
                    assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains a Panel");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringNotEditableParameter", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getEditable(), "Field: String Field editable");

					assert.equal(this.oEditor.getAggregation("_formContent").length, 5, "Field: stringNotVisibleParameter Field not exist");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check Description", function (assert) {
			this.oEditor.setSection("temp");
			var oJson = { baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" }, "temp": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } };
			this.oEditor.setJson(oJson);
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					oField._descriptionIcon.onmouseover();
					var oDescriptionText = this.oEditor._getPopover().getContent()[0];
					assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
					assert.equal(oDescriptionText.getText(), "Description", "Text: Description OK");
					oField._descriptionIcon.onmouseout();
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Linked Dropdown list", {
		beforeEach: function () {
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: RegExp("/mock_request/Customers.*"),
					response: function (xhr) {
						var oValue = {};
						var sKey = "Customers";
						var aSplits = xhr.url.split("?");
						if (aSplits.length > 1) {
							var aParameters = aSplits[1].split("&");
							var sSkip = "_";
							var sTop = "_";
							aParameters.forEach(function (parameter) {
								if (parameter.startsWith("%24skip=")) {
									sSkip += parameter.substr(8);
								}
								if (parameter.startsWith("%24top=")) {
									sTop += parameter.substr(7);
								}
							});
							sKey = sKey + sSkip + sTop;
						}
						oValue = {"value": oResponseData[sKey]};
						xhr.respondJSON(200, null, oValue);
					}
				},
				{
					method: "GET",
					path: RegExp("/mock_request/Employees.*"),
					response: function (xhr) {
						xhr.respondJSON(200, null, {"value": oResponseData["Employees"]});
					}
				},
				{
					method: "GET",
					path: RegExp("/mock_request/Orders.*"),
					response: function (xhr) {
						var oValue = {};
						var sKey = "Orders";
						var aSplits = xhr.url.split("?");
						if (aSplits.length > 1) {
							var aParameters = aSplits[1].split("&");
							var sCustomerID = "_";
							var sEmployeeID = "_";
							aParameters.forEach(function (parameter) {
								var sValue = parameter.split("=")[1];
								sValue = sValue.replaceAll("(", "").replaceAll(")", "");
								var aConditions = sValue.split("'%20and%20");
								aConditions.forEach(function (condition) {
									if (condition.startsWith("CustomerID%20eq%20'")) {
										sCustomerID += condition.substr(19);
									}
									if (condition.startsWith("EmployeeID%20eq%20")) {
										sEmployeeID += condition.substr(18);
									}
								});
							});
							if (sCustomerID === "_" || sEmployeeID  === "_") {
								xhr.respondJSON(400, null, {"error":{"errorCode":400,"message":"Please select a cutomer and an employee first"}});
								return;
							}
							sKey = sKey + sCustomerID + sEmployeeID;
						}
						oValue = {"value": oResponseData[sKey]};
						xhr.respondJSON(200, null, oValue);
					}
				},
				{
					method: "GET",
					path: RegExp("/mock_request/Order_Details.*"),
					response: function (xhr) {
						var oValue = {};
						var sKey = "Products";
						var aSplits = xhr.url.split("?");
						if (aSplits.length > 1) {
							var aParameters = aSplits[1].split("&");
							var sOrderID = "_";
							aParameters.forEach(function (parameter) {
								var sValue = parameter.split("=")[1];
								if (sValue.startsWith("OrderID%20eq%20")) {
									sOrderID += sValue.substr(15);
								}
							});
							if (sOrderID  === "_") {
								xhr.respondJSON(400, null, {"error":{"errorCode":400,"message":"Please select an order first"}});
								return;
							}
							sKey = sKey + sOrderID;
						}
						oValue = {"value": oResponseData[sKey]};
						xhr.respondJSON(200, null, oValue);
					}
				}
			]);
			this.oMockServer.start();
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
			this.oMockServer.destroy();
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
		QUnit.test("Initalize", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oEditor.getAggregation("_formContent")[6];
					assert.equal(oOrderLabel.getText(), "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oEditor.getAggregation("_formContent")[7];
					var oProductField = this.oEditor.getAggregation("_formContent")[8];
					assert.equal(oProductLabel.getText(), "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oEditor.getAggregation("_formContent")[10];
					assert.equal(oCustomerLimitLabel.getText(), "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					setTimeout(function () {
						assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
						assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
						assert.equal(oOrderField.getAggregation("_field").getItems().length, 0, "Field: Order lenght is OK");
						oOrderField.getAggregation("_field").focus();
						// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
						oOrderField.onfocusin();
						var sMsgStripId = oOrderField.getAssociation("_messageStrip");
						var oMsgStrip = Core.byId(sMsgStripId);
						assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
						assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
						assert.equal(oMsgStrip.getText(), "400: Please select a cutomer and an employee first", "Order Error Text");
						assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
						oProductField.getAggregation("_field").focus();
						// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
						oProductField.onfocusin();
						assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
						assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
						assert.equal(oMsgStrip.getText(), "400: Please select an order first", "Product Error Text");
						assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
						resolve();
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Just select Customer, check Order and Product", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oEditor.getAggregation("_formContent")[6];
					assert.equal(oOrderLabel.getText(), "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oEditor.getAggregation("_formContent")[7];
					var oProductField = this.oEditor.getAggregation("_formContent")[8];
					assert.equal(oProductLabel.getText(), "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oEditor.getAggregation("_formContent")[10];
					assert.equal(oCustomerLimitLabel.getText(), "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					setTimeout(function () {
						var oComboBox = oCustomerField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 4, "Field: Customer lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						setTimeout(function () {
							assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
							assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
							assert.equal(oOrderField.getAggregation("_field").getItems().length, 0, "Field: Order lenght is OK");
							oOrderField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oOrderField.onfocusin();
							var sMsgStripId = oOrderField.getAssociation("_messageStrip");
							var oMsgStrip = Core.byId(sMsgStripId);
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select a cutomer and an employee first", "Order Error Text");
							assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oProductField.onfocusin();
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select an order first", "Product Error Text");
							assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Just select Employee, check Order and Product", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oEditor.getAggregation("_formContent")[6];
					assert.equal(oOrderLabel.getText(), "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oEditor.getAggregation("_formContent")[7];
					var oProductField = this.oEditor.getAggregation("_formContent")[8];
					assert.equal(oProductLabel.getText(), "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oEditor.getAggregation("_formContent")[10];
					assert.equal(oCustomerLimitLabel.getText(), "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					setTimeout(function () {
						var oComboBox = oEmployeeField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 6, "Field: Employee lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						setTimeout(function () {
							assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
							assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
							assert.equal(oOrderField.getAggregation("_field").getItems().length, 0, "Field: Order lenght is OK");
							oOrderField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oOrderField.onfocusin();
							var sMsgStripId = oOrderField.getAssociation("_messageStrip");
							var oMsgStrip = Core.byId(sMsgStripId);
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select a cutomer and an employee first", "Order Error Text");
							assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oProductField.onfocusin();
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select an order first", "Product Error Text");
							assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Select Customer and Employee, check Order", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oEditor.getAggregation("_formContent")[6];
					assert.equal(oOrderLabel.getText(), "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oEditor.getAggregation("_formContent")[7];
					var oProductField = this.oEditor.getAggregation("_formContent")[8];
					assert.equal(oProductLabel.getText(), "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oEditor.getAggregation("_formContent")[10];
					assert.equal(oCustomerLimitLabel.getText(), "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					setTimeout(function () {
						var oComboBox = oCustomerField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 4, "Field: Customer lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						oComboBox = oEmployeeField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 6, "Field: Employee lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						setTimeout(function () {
							assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
							assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
							assert.equal(oOrderField.getAggregation("_field").getItems().length, 1, "Field: Order lenght is OK");
							oOrderField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oOrderField.onfocusin();
							var sMsgStripId = oOrderField.getAssociation("_messageStrip");
							var oMsgStrip = Core.byId(sMsgStripId);
							var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oDefaultBundle.getText("EDITOR_VAL_TEXTREQ"), oMsgStrip.getText(), "Order Error Text : required");
							assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oProductField.onfocusin();
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select an order first", "Product Error Text");
							assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Select Customer, Employee and Oder, check Product 1", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oEditor.getAggregation("_formContent")[6];
					assert.equal(oOrderLabel.getText(), "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oEditor.getAggregation("_formContent")[7];
					var oProductField = this.oEditor.getAggregation("_formContent")[8];
					assert.equal(oProductLabel.getText(), "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oEditor.getAggregation("_formContent")[10];
					assert.equal(oCustomerLimitLabel.getText(), "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					setTimeout(function () {
						var oComboBox = oCustomerField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 4, "Field: Customer lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						oComboBox = oEmployeeField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 6, "Field: Employee lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						setTimeout(function () {
							oComboBox = oOrderField.getAggregation("_field");
							assert.equal(oComboBox.getItems().length, 1, "Field: Order lenght is OK");
							oComboBox.setSelectedIndex(0);
							oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
							setTimeout(function () {
								assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
								assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
								assert.equal(oOrderField.getAggregation("_field").getItems().length, 1, "Field: Order lenght is OK");
								oOrderField.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oOrderField.onfocusin();
								var sMsgStripId = oOrderField.getAssociation("_messageStrip");
								var oMsgStrip = Core.byId(sMsgStripId);
								assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
								assert.equal(oProductField.getAggregation("_field").getItems().length, 2, "Field: Product lenght is OK");
								oProductField.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oProductField.onfocusin();
								assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
								assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
								resolve();
							}, iWaitTimeout);
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Select Customer, Employee and Oder, check Product 2", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oEditor.getAggregation("_formContent")[6];
					assert.equal(oOrderLabel.getText(), "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oEditor.getAggregation("_formContent")[7];
					var oProductField = this.oEditor.getAggregation("_formContent")[8];
					assert.equal(oProductLabel.getText(), "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oEditor.getAggregation("_formContent")[10];
					assert.equal(oCustomerLimitLabel.getText(), "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					setTimeout(function () {
						var oComboBox = oCustomerField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 4, "Field: Customer lenght is OK");
						oComboBox.setSelectedIndex(1);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[1] });
						oComboBox = oEmployeeField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 6, "Field: Employee lenght is OK");
						oComboBox.setSelectedIndex(1);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[1] });
						setTimeout(function () {
							oComboBox = oOrderField.getAggregation("_field");
							assert.equal(oComboBox.getItems().length, 2, "Field: Order lenght is OK");
							oComboBox.setSelectedIndex(0);
							oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
							setTimeout(function () {
								assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
								assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
								assert.equal(oOrderField.getAggregation("_field").getItems().length, 2, "Field: Order lenght is OK");
								oOrderField.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oOrderField.onfocusin();
								var sMsgStripId = oOrderField.getAssociation("_messageStrip");
								var oMsgStrip = Core.byId(sMsgStripId);
								assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
								assert.equal(oProductField.getAggregation("_field").getItems().length, 1, "Field: Product lenght is OK");
								oProductField.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oProductField.onfocusin();
								assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
								assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
								resolve();
							}, iWaitTimeout);
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Get data from extension", {
		beforeEach: function () {
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: RegExp("/mock_request/Employees.*"),
					response: function (xhr) {
						xhr.respondJSON(200, null, {"value": oResponseData["Employees"]});
					}
				}
			]);
			this.oMockServer.start();
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
			this.oMockServer.destroy();
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
		QUnit.test("Check value items", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForExtension
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "DataGotFromExtensionRequest", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: DataGotFromExtensionRequest is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "DataGotFromEditorExtension", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: DataGotFromEditorExtension is ComboBox");

					setTimeout(function () {
						assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: DataGotFromExtensionRequest lenght is OK");
						assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 4, "Field: DataGotFromEditorExtension lenght is OK");
						resolve();
					}, 2 * iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Dependence", {
		beforeEach: function () {
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: RegExp("/mock_request/Customers.*"),
					response: function (xhr) {
						var oValue = {};
						var sKey = "Customers";
						var aSplits = xhr.url.split("?");
						if (aSplits.length > 1) {
							var aParameters = aSplits[1].split("&");
							var sConditionOperation = "_";
							var sConditionValue = "_";
							aParameters.forEach(function (parameter) {
								if (parameter.startsWith("%24filter=")) {
									parameter = parameter.substr(10);
									var aConditions = parameter.split(")%20and%20(");
									aConditions.forEach(function (condition) {
										if (condition.startsWith("startswith(CompanyName%2C'")) {
											sConditionOperation += "startswith";
											sConditionValue += condition.substring(26, condition.lastIndexOf("')"));
											sKey = sKey + sConditionOperation + sConditionValue;
										} else if (condition.startsWith("(CustomerID%20eq%20'")) {
											sConditionOperation += "CustomerID";
											sConditionValue += condition.slice(20, -1);
											sKey = sKey + sConditionOperation + sConditionValue;
										}
										sConditionOperation = "_";
										sConditionValue = "_";
									});
								} else if (parameter.startsWith("$filter=")) {
									parameter = parameter.substr(8);
									var aConditions = parameter.split(") and (");
									aConditions.forEach(function (condition) {
										if (condition.startsWith("startswith(CompanyName,'")) {
											sConditionOperation += "startswith";
											sConditionValue += condition.substring(24, condition.lastIndexOf("')"));
											sKey = sKey + sConditionOperation + sConditionValue;
										}
										sConditionOperation = "_";
										sConditionValue = "_";
									});
								}
							});
							oValue = {"value": oResponseData[sKey]};
						} else {
							oValue = {"value": []};
						}
						xhr.respondJSON(200, null, oValue);
					}
				}
			]);
			this.oMockServer.start();
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
			this.oMockServer.destroy();
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
		QUnit.test("Check the Editable dependece parameters", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForEditableDependence
			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oBooleanSwitch = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field");
					assert.ok(oBooleanSwitch.getState() === false, "Label: Boolean switch value");

					var oCustomerWithEditableDependentLabel = this.oEditor.getAggregation("_formContent")[3];
					var oCustomerWithEditableDependentField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomerWithEditableDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerWithEditableDependentLabel.getText(), "CustomerWithEditableDependent", "Label: Has static label text");
					assert.ok(oCustomerWithEditableDependentField.isA("sap.ui.integration.editor.fields.StringField"), "Field: Customer Editable String Field");
					var oCustomerWithEditableDependentComboBox = oCustomerWithEditableDependentField.getAggregation("_field");
					assert.ok(oCustomerWithEditableDependentComboBox.isA("sap.m.ComboBox"), "Field: Customer Editable is ComboBox");
					assert.ok(!oCustomerWithEditableDependentComboBox.getEditable(), "Field: Customer Editable is Not Editable");

					var oCustomersWithEditableDependentLabel = this.oEditor.getAggregation("_formContent")[5];
					var oCustomersWithEditableDependenteField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomersWithEditableDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersWithEditableDependentLabel.getText(), "CustomersWithEditableDependent", "Label: Has static label text");
					assert.ok(oCustomersWithEditableDependenteField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: Customers Editable List Field");
					var oCustomersWithEditableDependentMultiComboBox = oCustomersWithEditableDependenteField.getAggregation("_field");
					assert.ok(oCustomersWithEditableDependentMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers Editable is MultiComboBox");
					assert.ok(!oCustomersWithEditableDependentMultiComboBox.getEditable(), "Field: Customers Editable is Not Editable");

					var oCustomersInMultiInputWithEditableDependentLabel = this.oEditor.getAggregation("_formContent")[7];
					var oCustomersInMultiInputWithEditableDependenteField = this.oEditor.getAggregation("_formContent")[8];
					assert.ok(oCustomersInMultiInputWithEditableDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersInMultiInputWithEditableDependentLabel.getText(), "CustomersInMultiInputWithEditableDependent", "Label: Has static label text");
					assert.ok(oCustomersInMultiInputWithEditableDependenteField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: Customers Editable List Field");
					var oCustomersWithEditableDependentMultiInput = oCustomersInMultiInputWithEditableDependenteField.getAggregation("_field");
					assert.ok(oCustomersWithEditableDependentMultiInput.isA("sap.m.MultiInput"), "Field: Customers Editable is MultiInput");
					assert.ok(!oCustomersWithEditableDependentMultiInput.getEditable(), "Field: Customers Editable is Not Editable");
					setTimeout(function () {
						assert.equal(oCustomerWithEditableDependentComboBox.getItems().length, 4, "Field: Customer Editable data lenght is OK");
						assert.equal(oCustomersWithEditableDependentMultiComboBox.getItems().length, 5, "Field: Customers Editable data lenght is OK");

						oBooleanSwitch.setState(true);
						setTimeout(function () {
							assert.ok(oCustomerWithEditableDependentComboBox.getEditable(), "Field: Customer Editable is now Editable");
							assert.equal(oCustomerWithEditableDependentComboBox.getItems().length, 4, "Field: Customer Editable data lenght is OK");
							assert.ok(oCustomersWithEditableDependentMultiComboBox.getEditable(), "Field: Customers Editable is now Editable");
							assert.equal(oCustomersWithEditableDependentMultiComboBox.getItems().length, 5, "Field: Customers Editable data lenght is OK");
							assert.ok(oCustomersWithEditableDependentMultiInput.getEditable(), "Field: Customers Editable is now Editable");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the Visible dependece parameters", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForVisibleDependence
			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oBooleanSwitch = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field");
					assert.ok(oBooleanSwitch.getState() === false, "Label: Boolean switch value");

					var oCustomerWithVisibleDependentLabel = this.oEditor.getAggregation("_formContent")[3];
					var oCustomerWithVisibleDependentField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomerWithVisibleDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerWithVisibleDependentLabel.getText(), "CustomerWithVisibleDependent", "Label: Has static label text");
					assert.ok(oCustomerWithVisibleDependentField.isA("sap.ui.integration.editor.fields.StringField"), "Field: Customer Visible String Field");
					var oCustomerWithVisibleDependentComboBox = oCustomerWithVisibleDependentField.getAggregation("_field");
					assert.ok(oCustomerWithVisibleDependentComboBox.isA("sap.m.ComboBox"), "Field: Customer Visible is ComboBox");
					assert.ok(!oCustomerWithVisibleDependentComboBox.getVisible(), "Field: Customers Visible is Not Visible");

					var oCustomersWithVisibleDependentLabel = this.oEditor.getAggregation("_formContent")[5];
					var oCustomersWithVisibleDependentField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomersWithVisibleDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersWithVisibleDependentLabel.getText(), "CustomersWithVisibleDependent", "Label: Has static label text");
					assert.ok(oCustomersWithVisibleDependentField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: Customers Visible List Field");
					var oCustomersWithVisibleDependentMultiComboBox = oCustomersWithVisibleDependentField.getAggregation("_field");
					assert.ok(oCustomersWithVisibleDependentMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers Visible is MultiComboBox");
					assert.ok(!oCustomersWithVisibleDependentMultiComboBox.getVisible(), "Field: Customers Visible is Not Visible");

					var oCustomersMultiInputWithVisibleDependentLabel = this.oEditor.getAggregation("_formContent")[7];
					var oCustomersMultiInputWithVisibleDependentField = this.oEditor.getAggregation("_formContent")[8];
					assert.ok(oCustomersMultiInputWithVisibleDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersMultiInputWithVisibleDependentLabel.getText(), "CustomersInMultiInputWithVisibleDependent", "Label: Has static label text");
					assert.ok(oCustomersMultiInputWithVisibleDependentField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: Customers Visible List Field");
					var oCustomersWithVisibleDependentMultiInput = oCustomersMultiInputWithVisibleDependentField.getAggregation("_field");
					assert.ok(oCustomersWithVisibleDependentMultiInput.isA("sap.m.MultiInput"), "Field: Customers Visible is MultiInput");
					assert.ok(!oCustomersWithVisibleDependentMultiInput.getVisible(), "Field: Customers Visible is Not Visible");
					setTimeout(function () {
						assert.equal(oCustomerWithVisibleDependentComboBox.getItems().length, 4, "Field: Customer Visible data lenght is OK");
						assert.equal(oCustomersWithVisibleDependentMultiComboBox.getItems().length, 5, "Field: Customers Visible data lenght is OK");

						oBooleanSwitch.setState(true);
						setTimeout(function () {
							assert.ok(oCustomerWithVisibleDependentComboBox.getVisible(), "Field: Customer Visible is now Visible");
							assert.equal(oCustomerWithVisibleDependentComboBox.getItems().length, 4, "Field: Customer Visible data lenght is OK");
							assert.ok(oCustomersWithVisibleDependentMultiComboBox.getVisible(), "Field: Customers Visible is now Visible");
							assert.equal(oCustomersWithVisibleDependentMultiComboBox.getItems().length, 5, "Field: Customers Visible data lenght is OK");
							assert.ok(oCustomersWithVisibleDependentMultiInput.getVisible(), "Field: Customers Visible is now Editable");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
