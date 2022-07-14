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
	var oManifestForFilterBackendInComboBox = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"temp": {
			"designtime": "designtime/filterBackendForString",
			"type": "List",
			"header": {},
			"configuration": {
				"parameters": {
					"CustomerWithFilterParameter": {
						"value": ""
					},
					"CustomerWithFilterInURL": {
						"value": ""
					},
					"CustomerWithNotEditable": {
						"value": ""
					},
					"CustomerWithNotVisible": {
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
	var oManifestForFilterBackendInMultiComboBox = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"temp": {
			"designtime": "designtime/filterBackendForStringArrayInMultiComboBox",
			"type": "List",
			"header": {},
			"configuration": {
				"parameters": {
					"CustomersWithFilterParameter": {
						"value": []
					},
					"CustomersWithFilterInURL": {
						"value": []
					},
					"CustomersWithNotEditable": {
						"value": ""
					},
					"CustomersWithNotVisible": {
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
	var oManifestForFilterBackendInMultiInput = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"temp": {
			"designtime": "designtime/filterBackendForStringArrayInMultiInput",
			"type": "List",
			"header": {},
			"configuration": {
				"parameters": {
					"CustomersWithFilterParameter": {
						"value": []
					},
					"CustomersWithFilterInURL": {
						"value": []
					},
					"CustomersWithNotEditable": {
						"value": ""
					},
					"CustomersWithNotVisible": {
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

	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	QUnit.module("Filter in Backend by input for string (ComboBox)", {
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
				},
				{
					method: "GET",
					path: RegExp("/mock_request/Employees.*"),
					response: function (xhr) {
						var oValue = {};
						var sKey = "Employees";
						var aSplits = xhr.url.split("?");
						if (aSplits.length > 1) {
							var aParameters = aSplits[1].split("&");
							var sConditionOperation = "_";
							var sConditionValue = "_";
							aParameters.forEach(function (parameter) {
								if (parameter.startsWith("%24filter=")) {
									parameter = parameter.substr(10);
									var aConditions = parameter.split(")%20or%20");
									aConditions.forEach(function (condition) {
										if (condition.startsWith("endswith(FirstName%2C'")) {
											sConditionOperation += "endswith";
											sConditionValue += condition.slice(22, -1);
											sKey = sKey + sConditionOperation + sConditionValue;
										} else if (condition.startsWith("endswith(LastName%2C'")) {
											sConditionOperation += "endswith";
											sConditionValue += condition.substring(21, condition.lastIndexOf("')"));
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
		QUnit.test("Check the setting button", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInComboBox
			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer with filter parameter", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					var oCustomerComoboBox = oCustomerField.getAggregation("_field");
					assert.ok(oCustomerComoboBox.isA("sap.m.ComboBox"), "Field: Customer is ComboBox");
					//settings button
					var oButton = oCustomerField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.equal(oCustomerField._oSettingsPanel._oOpener, oCustomerField, "Settings: Has correct owner");
						var settingsClass = oCustomerField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oCustomerField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						testInterface.oSegmentedButton.getItems()[0].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel is not visible after dynamic button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel is visible after dynamic button press");
						testInterface.oDynamicValueField.fireValueHelpRequest();
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 5, "Settings: Settings Panel has 5 items");
						var oItem = testInterface.getMenuItems()[3].getItems()[2];
						testInterface.getMenu().fireItemSelected({ item: oItem });
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the NotEditable and NotVisible parameter", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInComboBox
			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomerNotEditableLabel = this.oEditor.getAggregation("_formContent")[5];
					var oCustomerNotEditableField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomerNotEditableLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerNotEditableLabel.getText(), "CustomerWithNotEditable", "Label: Has static label text");
					assert.ok(oCustomerNotEditableField.isA("sap.ui.integration.editor.fields.StringField"), "Field: Customer NotEditable String Field");
					var oCustomerComboBox = oCustomerNotEditableField.getAggregation("_field");
					assert.ok(oCustomerComboBox.isA("sap.m.ComboBox"), "Field: Customer NotEditable is ComboBox");
					assert.ok(!oCustomerComboBox.getEditable(), "Field: Customer NotEditable is Not Editable");
					var oNextField = this.oEditor.getAggregation("_formContent")[7];
					assert.ok(oNextField.isA("sap.m.Panel"), "Field: Customer NotVisible is not visible");
					setTimeout(function () {
						assert.equal(oCustomerComboBox.getItems().length, 4, "Field: Customer NotEditable data lenght is OK");
						resolve();
					}, 2000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in Filter Parameter", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInComboBox
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer with filter parameter", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					var oCustomerComoboBox = oCustomerField.getAggregation("_field");
					assert.ok(oCustomerComoboBox.isA("sap.m.ComboBox"), "Field: Customer is ComboBox");

					setTimeout(function () {
						assert.equal(oCustomerComoboBox.getItems().length, 4, "Field: Customer origin lenght is OK");
						oCustomerComoboBox.setValue("c");
						oCustomerField.onInput({
							"target": {
								"value": "c"
							},
							"srcControl": oCustomerComoboBox
						});
						setTimeout(function () {
							assert.equal(oCustomerComoboBox.getItems().length, 2, "Field: Customer lenght is OK");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in URL", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInComboBox
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[3];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "CustomerWithFilterInURL", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					var oCustomerComoboBox = oCustomerField.getAggregation("_field");
					assert.ok(oCustomerComoboBox.isA("sap.m.ComboBox"), "Field: Customer is ComboBox");

					setTimeout(function () {
						assert.equal(oCustomerComoboBox.getItems().length, 4, "Field: Customer origin lenght is OK");
						oCustomerComoboBox.setValue("c");
						oCustomerField.onInput({
							"target": {
								"value": "c"
							},
							"srcControl": oCustomerComoboBox
						});
						setTimeout(function () {
							assert.equal(oCustomerComoboBox.getItems().length, 2, "Field: Customer lenght is OK");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Filter in Backend by input for string[] (MultiComboBox)", {
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
				},
				{
					method: "GET",
					path: RegExp("/mock_request/Employees.*"),
					response: function (xhr) {
						var oValue = {};
						var sKey = "Employees";
						var aSplits = xhr.url.split("?");
						if (aSplits.length > 1) {
							var aParameters = aSplits[1].split("&");
							var sConditionOperation = "_";
							var sConditionValue = "_";
							aParameters.forEach(function (parameter) {
								if (parameter.startsWith("%24filter=")) {
									parameter = parameter.substr(10);
									var aConditions = parameter.split(")%20or%20");
									aConditions.forEach(function (condition) {
										if (condition.startsWith("endswith(FirstName%2C'")) {
											sConditionOperation += "endswith";
											sConditionValue += condition.slice(22, -1);
											sKey = sKey + sConditionOperation + sConditionValue;
										} else if (condition.startsWith("endswith(LastName%2C'")) {
											sConditionOperation += "endswith";
											sConditionValue += condition.substring(21, condition.lastIndexOf("')"));
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
		QUnit.test("Check the setting button", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiComboBox

			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "Customers with filter parameter", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomerComoboBox = oCustomersField.getAggregation("_field");
					assert.ok(oCustomerComoboBox.isA("sap.m.MultiComboBox"), "Field: Customers is MultiComboBox");
					//settings button
					var oButton = oCustomersField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oCustomersField._oSettingsPanel._oOpener, oCustomersField, "Settings: Has correct owner");
						var settingsClass = oCustomersField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oCustomersField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						testInterface.oSegmentedButton.getItems()[0].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel is not visible after dynamic button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel is visible after dynamic button press");
						testInterface.oDynamicValueField.fireValueHelpRequest();
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 5, "Settings: Settings Panel has 5 items");
						var oItem = testInterface.getMenuItems()[3].getItems()[2];
						testInterface.getMenu().fireItemSelected({ item: oItem });
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the NotEditable and NotVisible parameter", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiComboBox
			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomersNotEditableLabel = this.oEditor.getAggregation("_formContent")[5];
					var oCustomersNotEditableField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomersNotEditableLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersNotEditableLabel.getText(), "CustomersWithNotEditable", "Label: Has static label text");
					assert.ok(oCustomersNotEditableField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: Customers NotEditable List Field");
					var oCustomersMultiComboBox = oCustomersNotEditableField.getAggregation("_field");
					assert.ok(oCustomersMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers NotEditable is MultiComboBox");
					assert.ok(!oCustomersMultiComboBox.getEditable(), "Field: Customers NotEditable is Not Editable");
					var oNextField = this.oEditor.getAggregation("_formContent")[7];
					assert.ok(oNextField.isA("sap.m.Panel"), "Field: Customers NotVisible is not visible");
					setTimeout(function () {
						assert.equal(oCustomersMultiComboBox.getItems().length, 5, "Field: Customers NotEditable data lenght is OK");
					resolve();
					}, 2000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in Filter Parameter", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiComboBox
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "Customers with filter parameter", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomersMultiComboBox = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers is MultiComboBox");

					setTimeout(function () {
						assert.equal(oCustomersMultiComboBox.getItems().length, 5, "Field: Customers origin lenght is OK");
						oCustomersMultiComboBox.setValue("c");
						oCustomersField.onInputForMultiComboBox({
							"target": {
								"value": "c"
							},
							"srcControl": oCustomersMultiComboBox
						});
						setTimeout(function () {
							assert.equal(oCustomersMultiComboBox.getItems().length, 3, "Field: Customers lenght is OK");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in URL", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiComboBox
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[3];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "CustomersWithFilterInURL", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomersMultiComboBox = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers is MultiComboBox");

					setTimeout(function () {
						assert.equal(oCustomersMultiComboBox.getItems().length, 5, "Field: Customers origin lenght is OK");
						oCustomersMultiComboBox.setValue("c");
						oCustomersField.onInputForMultiComboBox({
							"target": {
								"value": "c"
							},
							"srcControl": oCustomersMultiComboBox
						});
						setTimeout(function () {
							assert.equal(oCustomersMultiComboBox.getItems().length, 3, "Field: Customers lenght is OK");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Filter in Backend by input for string[] (MultiInput)", {
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
				},
				{
					method: "GET",
					path: RegExp("/mock_request/Employees.*"),
					response: function (xhr) {
						var oValue = {};
						var sKey = "Employees";
						var aSplits = xhr.url.split("?");
						if (aSplits.length > 1) {
							var aParameters = aSplits[1].split("&");
							var sConditionOperation = "_";
							var sConditionValue = "_";
							aParameters.forEach(function (parameter) {
								if (parameter.startsWith("%24filter=")) {
									parameter = parameter.substr(10);
									var aConditions = parameter.split(")%20or%20");
									aConditions.forEach(function (condition) {
										if (condition.startsWith("endswith(FirstName%2C'")) {
											sConditionOperation += "endswith";
											sConditionValue += condition.slice(22, -1);
											sKey = sKey + sConditionOperation + sConditionValue;
										} else if (condition.startsWith("endswith(LastName%2C'")) {
											sConditionOperation += "endswith";
											sConditionValue += condition.substring(21, condition.lastIndexOf("')"));
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
		QUnit.test("Check the setting button", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiInput

			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "Customers with filter parameter", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomersMultiInput = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiInput.isA("sap.m.MultiInput"), "Field: Customers is MultiInput");
					//settings button
					var oButton = oCustomersField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oCustomersField._oSettingsPanel._oOpener, oCustomersField, "Settings: Has correct owner");
						var settingsClass = oCustomersField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oCustomersField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						testInterface.oSegmentedButton.getItems()[0].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel is not visible after dynamic button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel is visible after dynamic button press");
						testInterface.oDynamicValueField.fireValueHelpRequest();
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 5, "Settings: Settings Panel has 5 items");
						var oItem = testInterface.getMenuItems()[3].getItems()[2];
						testInterface.getMenu().fireItemSelected({ item: oItem });
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the NotEditable and NotVisible parameter", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiInput
			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomersNotEditableLabel = this.oEditor.getAggregation("_formContent")[5];
					var oCustomersNotEditableField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomersNotEditableLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersNotEditableLabel.getText(), "CustomersWithNotEditable", "Label: Has static label text");
					assert.ok(oCustomersNotEditableField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: Customers NotEditable List Field");
					var oCustomersMultiInput = oCustomersNotEditableField.getAggregation("_field");
					assert.ok(oCustomersMultiInput.isA("sap.m.MultiInput"), "Field: Customers NotEditable is MultiInput");
					assert.ok(!oCustomersMultiInput.getEditable(), "Field: Customers NotEditable is Not Editable");
					var oNextField = this.oEditor.getAggregation("_formContent")[7];
					assert.ok(oNextField.isA("sap.m.Panel"), "Field: Customers NotVisible is not visible");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in Filter Parameter", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiInput
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "Customers with filter parameter", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomersMultiInput = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiInput.isA("sap.m.MultiInput"), "Field: Customers is MultiInput");

					setTimeout(function () {
						oCustomersMultiInput.setValue("c");
						oCustomersMultiInput._openSuggestionsPopover();
						var oFakeEvent = {
							isMarked: function(){},
							setMarked:function(){},
							"target": {
								"value": "c"
							},
							"srcControl": oCustomersMultiInput
						};
						oCustomersField.onInputForMultiInput(oFakeEvent);
						setTimeout(function () {
							assert.equal(oCustomersMultiInput._getSuggestionsList().getItems().length, 3, "Field: Customers lenght is OK");
							resolve();
						}, 2 * iWaitTimeout);
					}, 2 * iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in URL", function (assert) {
			this.oEditor.setSection("temp");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiInput
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[3];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "CustomersWithFilterInURL", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomersMultiInput = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiInput.isA("sap.m.MultiInput"), "Field: Customers is MultiInput");

					setTimeout(function () {
						oCustomersMultiInput.setValue("c");
						oCustomersMultiInput._openSuggestionsPopover();
						var oFakeEvent = {
							isMarked: function(){},
							setMarked:function(){},
							"target": {
								"value": "c"
							},
							"srcControl": oCustomersMultiInput
						};
						oCustomersField.onInputForMultiInput(oFakeEvent);
						setTimeout(function () {
							assert.equal(oCustomersMultiInput._getSuggestionsList().getItems().length, 3, "Field: Customers lenght is OK");
							resolve();
						}, 2 * iWaitTimeout);
					}, 2 * iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
