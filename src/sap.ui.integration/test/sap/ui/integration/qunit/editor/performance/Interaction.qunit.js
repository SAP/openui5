/* global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4",
	"../ContextHost",
	"sap/ui/core/util/MockServer",
	"../jsons/withDesigntime/sap.card/DataExtensionImpl",
	"../testLib/SharedExtension",
	"qunit/designtime/EditorQunitUtils",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone"
], function(
	Localization,
	Element,
	Library,
	Editor,
	Designtime,
	Host,
	nextUIUpdate,
	sinon,
	ContextHost,
	MockServer,
	DataExtensionImpl,
	SharedExtension,
	EditorQunitUtils,
	deepEqual,
	deepClone
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
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
		"sap.card": {
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

	var oManifestForFilterBackendInComboBox = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
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
		"sap.card": {
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
		"sap.card": {
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

	function cleanUUID(oValue) {
		var oClonedValue = deepClone(oValue, 500);
		if (typeof oClonedValue === "string") {
			oClonedValue = JSON.parse(oClonedValue);
		}
		if (Array.isArray(oClonedValue)) {
			oClonedValue.forEach(function(oResult) {
				if (oResult._dt) {
					delete oResult._dt._uuid;
				}
				if (deepEqual(oResult._dt, {})) {
					delete oResult._dt;
				}
			});
		} else if (typeof oClonedValue === "object") {
			if (oClonedValue._dt) {
				delete oClonedValue._dt._uuid;
			}
			if (deepEqual(oClonedValue._dt, {})) {
				delete oClonedValue._dt;
			}
		}
		return oClonedValue;
	}

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	QUnit.module("Values via online request (Mock)", {
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
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox, this.oMockServer);
		}
	}, function () {
		QUnit.test("Initalize", function (assert) {
			var start = new Date();
			var time = 0;
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + time + "ms OK");
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
					EditorQunitUtils.isReady(this.oEditor).then(async function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + time + "ms OK");
						assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
						assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
						assert.equal(oOrderField.getAggregation("_field").getItems().length, 0, "Field: Order lenght is OK");
						oOrderField.getAggregation("_field").focus();
						// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
						oOrderField.onfocusin();
						await nextUIUpdate();
						var sMsgStripId = oOrderField.getAssociation("_messageStrip");
						var oMsgStrip = Element.getElementById(sMsgStripId);
						assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
						assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
						assert.equal(oMsgStrip.getText(), "400: Please select a cutomer and an employee first", "Order Error Text");
						assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
						oProductField.getAggregation("_field").focus();
						// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
						oProductField.onfocusin();
						await nextUIUpdate();
						assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
						assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
						assert.equal(oMsgStrip.getText(), "400: Please select an order first", "Product Error Text");
						assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Just select Customer, check Order and Product", function (assert) {
			var start = new Date();
			var time = 0;
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + time + "ms OK");
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
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
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + time + "ms OK");
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oComboBox = oCustomerField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 4, "Field: Customer lenght is OK");
						var oOrderModel = oOrderField.getModel();
						oOrderModel.attachPropertyChange(async function (){
							await nextUIUpdate();
							time = new Date().getTime() - start.getTime();
							assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Data Request " + time + "ms OK");
							assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
							assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
							assert.equal(oOrderField.getAggregation("_field").getItems().length, 0, "Field: Order lenght is OK");
							oOrderField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oOrderField.onfocusin();
							await nextUIUpdate();
							var sMsgStripId = oOrderField.getAssociation("_messageStrip");
							var oMsgStrip = Element.getElementById(sMsgStripId);
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select a cutomer and an employee first", "Order Error Text");
							assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oProductField.onfocusin();
							await nextUIUpdate();
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select an order first", "Product Error Text");
							assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						});
						start = new Date();
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Just select Employee, check Order and Product", function (assert) {
			var start = new Date();
			var time = 0;
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + time + "ms OK");
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
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
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + time + "ms OK");
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oComboBox = oEmployeeField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 6, "Field: Employee lenght is OK");
						var oOrderModel = oOrderField.getModel();
						oOrderModel.attachPropertyChange(async function (){
							await nextUIUpdate();
							time = new Date().getTime() - start.getTime();
							assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Data Request " + time + "ms OK");
							assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
							assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
							assert.equal(oOrderField.getAggregation("_field").getItems().length, 0, "Field: Order lenght is OK");
							oOrderField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oOrderField.onfocusin();
							await nextUIUpdate();
							var sMsgStripId = oOrderField.getAssociation("_messageStrip");
							var oMsgStrip = Element.getElementById(sMsgStripId);
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select a cutomer and an employee first", "Order Error Text");
							assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oProductField.onfocusin();
							await nextUIUpdate();
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select an order first", "Product Error Text");
							assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						});
						start = new Date();
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Select Customer and Employee, check Order", function (assert) {
			var start = new Date();
			var time = 0;
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + time + "ms OK");
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
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
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + time + "ms OK");
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oCustomerComboBox = oCustomerField.getAggregation("_field");
						assert.equal(oCustomerComboBox.getItems().length, 4, "Field: Customer lenght is OK");
						var oOrderModel = oOrderField.getModel();
						oOrderModel.attachEventOnce("propertyChange", async function (){
							var end = new Date();
							time = end.getTime() - start.getTime();
							assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Data Request " + time + "ms OK");
							await nextUIUpdate();
							var uiChangetime = new Date().getTime() - end.getTime();
							assert.ok(uiChangetime < EditorQunitUtils.performance.interaction, "Performance - UI Change " + uiChangetime + "ms OK");
							assert.equal(oCustomerComboBox.getItems().length, 4, "Field: Customer lenght is OK");
							var oEmployeeComboBox = oEmployeeField.getAggregation("_field");
							assert.equal(oEmployeeComboBox.getItems().length, 6, "Field: Employee lenght is OK");
							assert.equal(oOrderField.getAggregation("_field").getItems().length, 0, "Field: Order lenght is OK");
							oOrderField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oOrderField.onfocusin();
							await nextUIUpdate();
							var sMsgStripId = oOrderField.getAssociation("_messageStrip");
							var oMsgStrip = Element.getElementById(sMsgStripId);
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select a cutomer and an employee first", "Order Error Text");
							assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oProductField.onfocusin();
							await nextUIUpdate();
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select an order first", "Product Error Text");
							assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							var newStart;
							oOrderModel.attachEventOnce("propertyChange", async function (){
								end = new Date();
								time = end.getTime() - newStart.getTime();
								assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Data Request " + time + "ms OK");
								await nextUIUpdate();
								var uiChangetime = new Date().getTime() - end.getTime();
								assert.ok(uiChangetime < EditorQunitUtils.performance.interaction, "Performance - UI Change " + uiChangetime + "ms OK");
								assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
								assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
								assert.equal(oOrderField.getAggregation("_field").getItems().length, 1, "Field: Order lenght is OK");
								oOrderField.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oOrderField.onfocusin();
								await nextUIUpdate();
								var sMsgStripId = oOrderField.getAssociation("_messageStrip");
								var oMsgStrip = Element.getElementById(sMsgStripId);
								var oDefaultBundle = Library.getResourceBundleFor("sap.ui.integration");
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oDefaultBundle.getText("EDITOR_VAL_TEXTREQ"), oMsgStrip.getText(), "Order Error Text : required");
								assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
								oProductField.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oProductField.onfocusin();
								await nextUIUpdate();
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oMsgStrip.getText(), "400: Please select an order first", "Product Error Text");
								assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
								resolve();
							});
							newStart = new Date();
							oEmployeeComboBox.setSelectedIndex(0);
							oEmployeeComboBox.fireChange({ selectedItem: oEmployeeComboBox.getItems()[0] });
						});
						start = new Date();
						oCustomerComboBox.setSelectedIndex(0);
						oCustomerComboBox.fireChange({ selectedItem: oCustomerComboBox.getItems()[0] });
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Filter in Backend by input", {
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
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox, this.oMockServer);
		}
	}, function () {
		QUnit.test("String (ComboBox)", function (assert) {
			var start = new Date();
			var time = 0;
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInComboBox
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + time + "ms OK");
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer with filter parameter", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					var oCustomerComoboBox = oCustomerField.getAggregation("_field");
					assert.ok(oCustomerComoboBox.isA("sap.m.ComboBox"), "Field: Customer is ComboBox");

					EditorQunitUtils.isReady(this.oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + time + "ms OK");
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oCustomerComoboBox.getItems().length, 4, "Field: Customer origin lenght is OK");
						var oModel = oCustomerComoboBox.getModel();
						oModel.attachPropertyChange(async function () {
							await nextUIUpdate();
							time = new Date().getTime() - start.getTime();
							assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Data Request " + time + "ms OK");
							assert.equal(oCustomerComoboBox.getItems().length, 2, "Field: Customer lenght is OK");
							resolve();
						});
						start = new Date();
						oCustomerComoboBox.focus();
						EditorQunitUtils.setInputValue(oCustomerComoboBox, "c");
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("String Array (MultiComboBox", function (assert) {
			var start = new Date();
			var time = 0;
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiComboBox
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + time + "ms OK");
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "Customers with filter parameter", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomersMultiComboBox = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers is MultiComboBox");

					EditorQunitUtils.isReady(this.oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + time + "ms OK");
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oCustomersMultiComboBox.getItems().length, 5, "Field: Customers origin lenght is OK");
						var oModel = oCustomersMultiComboBox.getModel();
						oModel.attachPropertyChange(async function () {
							await nextUIUpdate();
							time = new Date().getTime() - start.getTime();
							assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Data Request " + time + "ms OK");
							assert.equal(oCustomersMultiComboBox.getItems().length, 3, "Field: Customers lenght is OK");
							resolve();
						});
						start = new Date();
						oCustomersMultiComboBox.focus();
						EditorQunitUtils.setInputValue(oCustomersMultiComboBox, "c");
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("String Array (MultiInput)", function (assert) {
			var start = new Date();
			var time = 0;
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiInput
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + time + "ms OK");
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "Customers with filter parameter", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomersMultiInput = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiInput.isA("sap.m.MultiInput"), "Field: Customers is MultiInput");

					EditorQunitUtils.isReady(this.oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + time + "ms OK");
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oModel = oCustomersMultiInput.getModel();
						assert.deepEqual(oModel.getData(), {},  "Field: Customers ori lenght is OK");
						oModel.attachPropertyChange(async function () {
							await nextUIUpdate();
							time = new Date().getTime() - start.getTime();
							assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Data Request " + time + "ms OK");
							assert.equal(oModel.getData().value.length, 2,  "Field: Customers lenght is OK");
							resolve();
						});
						start = new Date();
						oCustomersMultiInput.focus();
						EditorQunitUtils.setInputValue(oCustomersMultiInput, "c");
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Popovers", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("Settings", function (assert) {
			var start = new Date();
			var time = 0;
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
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
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + time + "ms OK");
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready " + time + "ms OK");
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						//settings button
						var oButton = oField._settingsButton;
						assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
						oField.attachEventOnce("settingsPanelOpened", async function () {
							await nextUIUpdate();
							time = new Date().getTime() - start.getTime();
							assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Settings Panel opened " + time + "ms OK");
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
							//popup is opened
							assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
							var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
							var testInterface = settingsClass._private();
							assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
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
							assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 4, "Settings: Settings Panel has 4 items");
							var oItem = testInterface.getMenuItems()[3].getItems()[2];
							testInterface.getMenu().fireItemSelected({ item: oItem });
							testInterface.oPopover.getFooter().getContent()[2].firePress();
							EditorQunitUtils.wait().then(function () {
								//this is delayed not to give time to show the tokenizer
								assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
								resolve();
							});
						});
						start = new Date();
						oButton.firePress();
						oButton.focus();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Translation Popover - String", function (assert) {
			var that = this;
			var _oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18ntrans/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/multiLanguageForChange",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "String 2"
							},
							"string3": {
								"value": "String 3"
							},
							"string4": {
								"value": "{i18n>string4}"
							}
						}
					}
				}
			};
			var _oAdminChanges = {
				"/sap.card/configuration/parameters/string2/value": "String2 Value Admin",
				":layer": 0,
				":errors": false,
				"texts": {
					"en": {
						"/sap.card/configuration/parameters/string1/value": "String1 EN Admin",
						"/sap.card/configuration/parameters/string3/value": "String3 EN Admin"
					},
					"fr": {
						"/sap.card/configuration/parameters/string1/value": "String1 FR Admin",
						"/sap.card/configuration/parameters/string4/value": "String4 FR Admin"
					},
					"ru": {
						"/sap.card/configuration/parameters/string1/value": "String1 RU Admin",
						"/sap.card/configuration/parameters/string3/value": "String3 RU Admin"
					},
					"zh-CN": {
						"/sap.card/configuration/parameters/string1/value": "String1 简体 Admin",
						"/sap.card/configuration/parameters/string4/value": "String4 简体 Admin"
					},
					"zh-TW": {
						"/sap.card/configuration/parameters/string3/value": "String3 繁體 Admin"
					}
				}
			};
			var _oExpectedValues = {
				"string1": {
					"default_in_en": "String 1 English",
					"en": "String1 EN Admin",
					"en-GB": "String 1 English",
					"es-MX": "String 1 Spanish MX",
					"fr": "String1 FR Admin",
					"fr-CA": "String 1 French CA",
					"fr-FR": "String 1 French",
					"ru": "String1 RU Admin",
					"zh-CN": "String1 简体 Admin"
				},
				"string3": {
					"default_in_en": "String 3",
					"en": "String3 EN Admin",
					"ru": "String3 RU Admin",
					"zh-TW": "String3 繁體 Admin"
				},
				"string4": {
					"default_in_en": "String 4 English",
					"en": "String 4 English",
					"en-GB": "String 4 English",
					"fr": "String4 FR Admin",
					"fr-CA": "String 4 French CA",
					"fr-FR": "String 4 French",
					"zh-CN": "String4 简体 Admin"
				}
			};
			return new Promise(function (resolve, reject) {
				var start = new Date();
				var time = 0;
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setMode("admin");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifest,
					manifestChanges: [_oAdminChanges]
				});
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + time + "ms OK");
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
					var oField2 = that.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
					var oField3 = that.oEditor.getAggregation("_formContent")[6];
					var oLabel4 = that.oEditor.getAggregation("_formContent")[7];
					var oField4 = that.oEditor.getAggregation("_formContent")[8];
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready : " + time + "ms OK");
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1.getAggregation("_field").getValue(), _oExpectedValues["string1"]["en"], "oField1: String1 Value");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2.getAggregation("_field").getValue(), "String2 Value Admin", "oField2: String2 Value Admin");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Input"), "oField2: Input control");
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3.getAggregation("_field").getValue(), _oExpectedValues["string3"]["en"], "oField3: String3 Value");
						assert.ok(oField3.getAggregation("_field").isA("sap.m.Input"), "oField3: Input control");
						assert.equal(oLabel4.getText(), "Label 4 English", "Label4: Label 4 English");
						assert.equal(oField4.getAggregation("_field").getValue(), _oExpectedValues["string4"]["en"], "oField4: String4 Value");
						assert.ok(oField4.getAggregation("_field").isA("sap.m.Input"), "oField4: Input control");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
						oField1.attachEventOnce("translationPopoverOpened", function () {
							time = new Date().getTime() - start.getTime();
							assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Translation popover opened : " + time + "ms OK");
							var oTranslationPopover1 = oField1._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
							assert.equal(aHeaderItems1[2].getItems()[1].getValue(), _oExpectedValues["string1"]["en"], "oTranslationPopover1 Header: String1 Value");
							assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
							assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
							for (var i = 0; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
							}
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							oCancelButton1.firePress();

							var oValueHelpIcon2 = oField2.getAggregation("_field").getAggregation("_endIcon");
							assert.equal(oValueHelpIcon2, null, "oField2: No Input value help icon");

							var oValueHelpIcon3 = oField3.getAggregation("_field")._oValueHelpIcon;
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "oField3: Input value help icon");
							assert.equal(oValueHelpIcon3.getSrc(), "sap-icon://translate", "oField3: Input value help icon src");
							oField3.attachEventOnce("translationPopoverOpened", function () {
								time = new Date().getTime() - start.getTime();
								assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Translation popover opened : " + time + "ms OK");
								var oTranslationPopover3 = oField3._oTranslationPopover;
								var aHeaderItems3 = oTranslationPopover3.getCustomHeader().getItems();
								assert.equal(aHeaderItems3[2].getItems()[1].getValue(), _oExpectedValues["string3"]["en"], "oTranslationPopover3 Header: String3 Value");
								assert.ok(aHeaderItems3[2].getItems()[1].getEditable() === false, "oTranslationPopover3 Header: Editable false");
								assert.ok(oTranslationPopover3.getContent()[0].isA("sap.m.List"), "oTranslationPopover3 Content: List");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.equal(oLanguageItems3.length, 48, "oTranslationPopover3 Content: length");
								for (var i = 1; i < oLanguageItems3.length; i++) {
									var sLanguage = oLanguageItems3[i].getCustomData()[0].getKey();
									var sExpectedValue = _oExpectedValues["string3"][sLanguage] || _oExpectedValues["string3"]["default_in_en"];
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								}
								var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[2];
								oCancelButton3.firePress();

								var oValueHelpIcon4 = oField4.getAggregation("_field")._oValueHelpIcon;
								assert.ok(oValueHelpIcon4.isA("sap.ui.core.Icon"), "oField4: Input value help icon");
								assert.equal(oValueHelpIcon4.getSrc(), "sap-icon://translate", "oField4: Input value help icon src");
								oField4.attachEventOnce("translationPopoverOpened", function () {
									time = new Date().getTime() - start.getTime();
									assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Translation popover opened : " + time + "ms OK");
									var oTranslationPopover4 = oField4._oTranslationPopover;
									var aHeaderItems4 = oTranslationPopover4.getCustomHeader().getItems();
									assert.equal(aHeaderItems4[2].getItems()[1].getValue(), _oExpectedValues["string4"]["en"], "oTranslationPopover4 Header: String4 Value");
									assert.ok(aHeaderItems4[2].getItems()[1].getEditable() === false, "oTranslationPopover4 Header: Editable false");
									assert.ok(oTranslationPopover4.getContent()[0].isA("sap.m.List"), "oTranslationPopover4 Content: List");
									var oLanguageItems4 = oTranslationPopover4.getContent()[0].getItems();
									assert.equal(oLanguageItems4.length, 48, "oTranslationPopover4 Content: length");
									for (var i = 1; i < oLanguageItems4.length; i++) {
										var sLanguage = oLanguageItems4[i].getCustomData()[0].getKey();
										var sExpectedValue = _oExpectedValues["string4"][sLanguage] || _oExpectedValues["string4"]["default_in_en"];
										var sCurrentValue = oLanguageItems4[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover4 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
									var oCancelButton4 = oTranslationPopover4.getFooter().getContent()[2];
									oCancelButton4.firePress();
									resolve();
								});
								start = new Date();
								oValueHelpIcon4.firePress();
								oValueHelpIcon4.focus();
							});
							start = new Date();
							oValueHelpIcon3.firePress();
							oValueHelpIcon3.focus();
						});
						start = new Date();
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
					});
				});
			});
		});

		QUnit.test("Translation Popover - Object (Simple Form)", function (assert) {
			var oManifestForObjectFieldWithPropertiesDefinedWithTranslation = {
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
			};
			var _oOriginExpectedValues = {
				"string1": {
					"default": "String 1 English",
					"en": "String 1 English",
					"en-US": "String 1 US English",
					"es-MX": "String 1 Spanish MX",
					"fr": "String 1 French",
					"fr-FR": "String 1 French",
					"fr-CA": "String 1 French CA"
				},
				"string2": {
					"default": "String 2 English",
					"en": "String 2 English",
					"en-US": "String 2 US English",
					"es-MX": "String 2 Spanish MX",
					"fr": "String 2 French",
					"fr-FR": "String 2 French",
					"fr-CA": "String 2 French CA"
				},
				"string3": {
					"default": "String 3 English",
					"en": "String 3 English",
					"en-US": "String 3 US English",
					"es": "String 3 Spanish",
					"es-MX": "String 3 Spanish",
					"fr": "String 3 French",
					"fr-FR": "String 3 French",
					"fr-CA": "String 3 French CA"
				},
				"string4": {
					"default": "String 4 English",
					"en": "String 4 English",
					"en-US": "String 4 US English",
					"fr": "String 4 French",
					"fr-FR": "String 1 French",
					"fr-CA": "String 4 French CA"
				}
			};
			var start = new Date();
			var time = 0;
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithPropertiesDefinedWithTranslation
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					time = new Date().getTime() - start.getTime();
					assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Field Ready " + time + "ms OK");
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						time = new Date().getTime() - start.getTime();
						assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Ready : " + time + "ms OK");
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oLabel1.isA("sap.m.Label"), "Label 2: Form content contains a Label");
						assert.equal(oLabel1.getText(), "Object properties defined", "Label 2: Has label text");
						assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
						assert.ok(!oField1._getCurrentProperty("value"), "Field 2: Value");
						var oSimpleForm = oField1.getAggregation("_field");
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 16, "SimpleForm: length");
						var oTextArea = oContents[15];
						assert.equal(oTextArea.getValue(), '', "SimpleForm field textArea: Has No value");
						var oFormLabel1 = oContents[0];
						var oFormField1 = oContents[1];
						assert.equal(oFormLabel1.getText(), "Key", "SimpleForm label 1: Has label text");
						assert.ok(oFormLabel1.getVisible(), "SimpleForm label 1: Visible");
						assert.ok(oFormField1.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
						assert.ok(oFormField1.getVisible(), "SimpleForm Field 1: Visible");
						assert.ok(oFormField1.getEditable(), "SimpleForm Field 1: Editable");
						assert.equal(oFormField1.getValue(), "", "SimpleForm field 1: Has No value");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("string value 1");
						oFormField1.fireChange({ value: "string value 1"});
						assert.equal(oFormField1.getValue(), "string value 1", "SimpleForm field 1: Has new value");
						assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "string value 1"}), "Field 1: DT Value updated");
						assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
						assert.ok(!oFormField1._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
						oFormField1.setValue("{{string1}}");
						oFormField1.fireChange({ value: "{{string1}}"});
						EditorQunitUtils.wait().then(function () {
							assert.equal(oFormField1.getValue(), "{i18n>string1}", "SimpleForm field 1: Has new value");
							assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string1}"}), "Field 1: DT Value updated");
							assert.ok(oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
							assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
							oField1.attachEventOnce("translationPopoverOpened", function () {
								time = new Date().getTime() - start.getTime();
								assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Translation popover opened : " + time + "ms OK");
								var oTranslationPopover1 = oField1._oTranslationPopover;
								var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
								assert.ok(oSaveButton1.getVisible(), "oTranslationPopover1 footer: save button visible");
								assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 footer: save button disabled");
								var oResetButton1 = oTranslationPopover1.getFooter().getContent()[2];
								assert.ok(oResetButton1.getVisible(), "oTranslationPopover1 footer: reset button visible");
								assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover1 footer: reset button disabled");
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[3];
								assert.ok(oCancelButton1.getVisible(), "oTranslationPopover1 footer: cancel button visible");
								assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 footer: cancel button enabled");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
										assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
									}
								}
								oCancelButton1.firePress();
								oFormField1.setValue("{{string2}}");
								oFormField1.fireChange({ value: "{{string2}}"});
								EditorQunitUtils.wait().then(function () {
									assert.equal(oFormField1.getValue(), "{i18n>string2}", "SimpleForm field 1: Has new value");
									assert.ok(deepEqual(cleanUUID(oField1._getCurrentProperty("value")), {"key": "{i18n>string2}"}), "Field 1: DT Value updated");
									assert.ok(oFormField1.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
									var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
									assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
									assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
									assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
									assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
									oField1.attachEventOnce("translationPopoverOpened", function () {
										time = new Date().getTime() - start.getTime();
										assert.ok(time < EditorQunitUtils.performance.complexInteraction, "Performance - Translation popover opened : " + time + "ms OK");
										var oTranslationPopover1 = oField1._oTranslationPopover;
										var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
										assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string2"][sLanguage] || _oOriginExpectedValues["string2"]["default"];
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
												assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
											}
										}
										resolve();
									});
									start = new Date();
									oValueHelpIcon1.firePress();
									oValueHelpIcon1.focus();
								});
							});
							start = new Date();
							oValueHelpIcon1.firePress();
							oValueHelpIcon1.focus();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
