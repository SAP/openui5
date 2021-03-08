/* global QUnit */
sap.ui.define([
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/core/util/MockServer"
], function (
	CardEditor,
	Designtime,
	Host,
	sinon,
	ContextHost,
	MockServer
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/designtime/editor/cards/withDesigntime/";
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
			"i18n": "i18n/i18n.properties"
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
			"i18n": "i18n/i18n.properties"
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
			"i18n": "i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/filterBackendForStringArray",
			"type": "List",
			"header": {},
			"configuration": {
				"parameters": {
					"CustomersWithFilterParameter": {
						"value": []
					},
					"CustomersWithFilterInURL": {
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

	document.body.className = document.body.className + " sapUiSizeCompact ";

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

			this.oCardEditor = new CardEditor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";

				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oCardEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oCardEditor.destroy();
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
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomerLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomerLabel.getText() === "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oCardEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oCardEditor.getAggregation("_formContent")[4];
					assert.ok(oEmployeeLabel.getText() === "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oCardEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oCardEditor.getAggregation("_formContent")[6];
					assert.ok(oOrderLabel.getText() === "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oCardEditor.getAggregation("_formContent")[7];
					var oProductField = this.oCardEditor.getAggregation("_formContent")[8];
					assert.ok(oProductLabel.getText() === "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oCardEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oCardEditor.getAggregation("_formContent")[10];
					assert.ok(oCustomerLimitLabel.getText() === "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					setTimeout(function () {
						assert.ok(oCustomerField.getAggregation("_field").getItems().length === 4, "Field: Customer lenght is OK");
						assert.ok(oEmployeeField.getAggregation("_field").getItems().length === 6, "Field: Employee lenght is OK");
						assert.ok(oOrderField.getAggregation("_field").getItems().length === 0, "Field: Order lenght is OK");
						assert.ok(oProductField.getAggregation("_field").getItems().length === 0, "Field: Product lenght is OK");
						assert.ok(oCustomerLimitField.getAggregation("_field").getItems().length === 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
						resolve();
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Just select Customer, check Order and Product", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					var oCustomerLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomerLabel.getText() === "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oCardEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oCardEditor.getAggregation("_formContent")[4];
					assert.ok(oEmployeeLabel.getText() === "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oCardEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oCardEditor.getAggregation("_formContent")[6];
					assert.ok(oOrderLabel.getText() === "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oCardEditor.getAggregation("_formContent")[7];
					var oProductField = this.oCardEditor.getAggregation("_formContent")[8];
					assert.ok(oProductLabel.getText() === "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oCardEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oCardEditor.getAggregation("_formContent")[10];
					assert.ok(oCustomerLimitLabel.getText() === "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					setTimeout(function () {
						var oComboBox = oCustomerField.getAggregation("_field");
						assert.ok(oComboBox.getItems().length === 4, "Field: Customer lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						setTimeout(function () {
							assert.ok(oCustomerField.getAggregation("_field").getItems().length === 4, "Field: Customer lenght is OK");
							assert.ok(oEmployeeField.getAggregation("_field").getItems().length === 6, "Field: Employee lenght is OK");
							assert.ok(oOrderField.getAggregation("_field").getItems().length === 0, "Field: Order lenght is OK");
							assert.ok(oProductField.getAggregation("_field").getItems().length === 0, "Field: Product lenght is OK");
							assert.ok(oCustomerLimitField.getAggregation("_field").getItems().length === 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Just select Employee, check Order and Product", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomerLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomerLabel.getText() === "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oCardEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oCardEditor.getAggregation("_formContent")[4];
					assert.ok(oEmployeeLabel.getText() === "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oCardEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oCardEditor.getAggregation("_formContent")[6];
					assert.ok(oOrderLabel.getText() === "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oCardEditor.getAggregation("_formContent")[7];
					var oProductField = this.oCardEditor.getAggregation("_formContent")[8];
					assert.ok(oProductLabel.getText() === "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oCardEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oCardEditor.getAggregation("_formContent")[10];
					assert.ok(oCustomerLimitLabel.getText() === "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					setTimeout(function () {
						var oComboBox = oEmployeeField.getAggregation("_field");
						assert.ok(oComboBox.getItems().length === 6, "Field: Employee lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						setTimeout(function () {
							assert.ok(oCustomerField.getAggregation("_field").getItems().length === 4, "Field: Customer lenght is OK");
							assert.ok(oEmployeeField.getAggregation("_field").getItems().length === 6, "Field: Employee lenght is OK");
							assert.ok(oOrderField.getAggregation("_field").getItems().length === 0, "Field: Order lenght is OK");
							assert.ok(oProductField.getAggregation("_field").getItems().length === 0, "Field: Product lenght is OK");
							assert.ok(oCustomerLimitField.getAggregation("_field").getItems().length === 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Select Customer and Employee, check Oder", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomerLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomerLabel.getText() === "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oCardEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oCardEditor.getAggregation("_formContent")[4];
					assert.ok(oEmployeeLabel.getText() === "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oCardEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oCardEditor.getAggregation("_formContent")[6];
					assert.ok(oOrderLabel.getText() === "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oCardEditor.getAggregation("_formContent")[7];
					var oProductField = this.oCardEditor.getAggregation("_formContent")[8];
					assert.ok(oProductLabel.getText() === "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oCardEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oCardEditor.getAggregation("_formContent")[10];
					assert.ok(oCustomerLimitLabel.getText() === "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					setTimeout(function () {
						var oComboBox = oCustomerField.getAggregation("_field");
						assert.ok(oComboBox.getItems().length === 4, "Field: Customer lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						oComboBox = oEmployeeField.getAggregation("_field");
						assert.ok(oComboBox.getItems().length === 6, "Field: Employee lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						setTimeout(function () {
							assert.ok(oCustomerField.getAggregation("_field").getItems().length === 4, "Field: Customer lenght is OK");
							assert.ok(oEmployeeField.getAggregation("_field").getItems().length === 6, "Field: Employee lenght is OK");
							assert.ok(oOrderField.getAggregation("_field").getItems().length === 1, "Field: Order lenght is OK");
							assert.ok(oProductField.getAggregation("_field").getItems().length === 0, "Field: Product lenght is OK");
							assert.ok(oCustomerLimitField.getAggregation("_field").getItems().length === 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Select Customer, Employee and Oder, check Product 1", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomerLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomerLabel.getText() === "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oCardEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oCardEditor.getAggregation("_formContent")[4];
					assert.ok(oEmployeeLabel.getText() === "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oCardEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oCardEditor.getAggregation("_formContent")[6];
					assert.ok(oOrderLabel.getText() === "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oCardEditor.getAggregation("_formContent")[7];
					var oProductField = this.oCardEditor.getAggregation("_formContent")[8];
					assert.ok(oProductLabel.getText() === "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oCardEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oCardEditor.getAggregation("_formContent")[10];
					assert.ok(oCustomerLimitLabel.getText() === "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					setTimeout(function () {
						var oComboBox = oCustomerField.getAggregation("_field");
						assert.ok(oComboBox.getItems().length === 4, "Field: Customer lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						oComboBox = oEmployeeField.getAggregation("_field");
						assert.ok(oComboBox.getItems().length === 6, "Field: Employee lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						setTimeout(function () {
							oComboBox = oOrderField.getAggregation("_field");
							assert.ok(oComboBox.getItems().length === 1, "Field: Order lenght is OK");
							oComboBox.setSelectedIndex(0);
							oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
							setTimeout(function () {
								assert.ok(oCustomerField.getAggregation("_field").getItems().length === 4, "Field: Customer lenght is OK");
								assert.ok(oEmployeeField.getAggregation("_field").getItems().length === 6, "Field: Employee lenght is OK");
								assert.ok(oOrderField.getAggregation("_field").getItems().length === 1, "Field: Order lenght is OK");
								assert.ok(oProductField.getAggregation("_field").getItems().length === 2, "Field: Product lenght is OK");
								assert.ok(oCustomerLimitField.getAggregation("_field").getItems().length === 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
								resolve();
							}, iWaitTimeout);
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Select Customer, Employee and Oder, check Product 2", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomerLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomerLabel.getText() === "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oCardEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oCardEditor.getAggregation("_formContent")[4];
					assert.ok(oEmployeeLabel.getText() === "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oCardEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oCardEditor.getAggregation("_formContent")[6];
					assert.ok(oOrderLabel.getText() === "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oCardEditor.getAggregation("_formContent")[7];
					var oProductField = this.oCardEditor.getAggregation("_formContent")[8];
					assert.ok(oProductLabel.getText() === "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oCardEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oCardEditor.getAggregation("_formContent")[10];
					assert.ok(oCustomerLimitLabel.getText() === "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					setTimeout(function () {
						var oComboBox = oCustomerField.getAggregation("_field");
						assert.ok(oComboBox.getItems().length === 4, "Field: Customer lenght is OK");
						oComboBox.setSelectedIndex(1);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[1] });
						oComboBox = oEmployeeField.getAggregation("_field");
						assert.ok(oComboBox.getItems().length === 6, "Field: Employee lenght is OK");
						oComboBox.setSelectedIndex(1);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[1] });
						setTimeout(function () {
							oComboBox = oOrderField.getAggregation("_field");
							assert.ok(oComboBox.getItems().length === 2, "Field: Order lenght is OK");
							oComboBox.setSelectedIndex(0);
							oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
							setTimeout(function () {
								assert.ok(oCustomerField.getAggregation("_field").getItems().length === 4, "Field: Customer lenght is OK");
								assert.ok(oEmployeeField.getAggregation("_field").getItems().length === 6, "Field: Employee lenght is OK");
								assert.ok(oOrderField.getAggregation("_field").getItems().length === 2, "Field: Order lenght is OK");
								assert.ok(oProductField.getAggregation("_field").getItems().length === 1, "Field: Product lenght is OK");
								assert.ok(oCustomerLimitField.getAggregation("_field").getItems().length === 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
								resolve();
							}, iWaitTimeout);
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});
	});

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

			this.oCardEditor = new CardEditor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";

				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oCardEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oCardEditor.destroy();
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
		QUnit.test("Defined in Filter Parameter", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInComboBox
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomerLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomerLabel.getText() === "Customer with filter parameter", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					var oCustomerComoboBox = oCustomerField.getAggregation("_field");
					assert.ok(oCustomerComoboBox.isA("sap.m.ComboBox"), "Field: Customer is ComboBox");

					setTimeout(function () {
						assert.ok(oCustomerComoboBox.getItems().length === 4, "Field: Customer origin lenght is OK");
						oCustomerComoboBox.setValue("c");
						oCustomerField.onInput({
							"target": {
								"value": "c"
							},
							"srcControl": oCustomerComoboBox
						});
						setTimeout(function () {
							assert.ok(oCustomerComoboBox.getItems().length === 2, "Field: Customer lenght is OK");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in URL", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInComboBox
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomerLabel = this.oCardEditor.getAggregation("_formContent")[3];
					var oCustomerField = this.oCardEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomerLabel.getText() === "CustomerWithFilterInURL", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					var oCustomerComoboBox = oCustomerField.getAggregation("_field");
					assert.ok(oCustomerComoboBox.isA("sap.m.ComboBox"), "Field: Customer is ComboBox");

					setTimeout(function () {
						assert.ok(oCustomerComoboBox.getItems().length === 4, "Field: Customer origin lenght is OK");
						oCustomerComoboBox.setValue("c");
						oCustomerField.onInput({
							"target": {
								"value": "c"
							},
							"srcControl": oCustomerComoboBox
						});
						setTimeout(function () {
							assert.ok(oCustomerComoboBox.getItems().length === 2, "Field: Customer lenght is OK");
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

			this.oCardEditor = new CardEditor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";

				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oCardEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oCardEditor.destroy();
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
		QUnit.test("Defined in Filter Parameter", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiComboBox
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomersLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oCustomersField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomersLabel.getText() === "Customers with filter parameter", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.designtime.editor.fields.ListField"), "Field: List Field");
					var oCustomersComoboBox = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersComoboBox.isA("sap.m.MultiComboBox"), "Field: Customers is MultiComboBox");

					setTimeout(function () {
						assert.ok(oCustomersComoboBox.getItems().length === 5, "Field: Customers origin lenght is OK");
						oCustomersComoboBox.setValue("c");
						oCustomersField.onInput({
							"target": {
								"value": "c"
							},
							"srcControl": oCustomersComoboBox
						});
						setTimeout(function () {
							assert.ok(oCustomersComoboBox.getItems().length === 3, "Field: Customers lenght is OK");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in URL", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiComboBox
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomersLabel = this.oCardEditor.getAggregation("_formContent")[3];
					var oCustomersField = this.oCardEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomersLabel.getText() === "CustomersWithFilterInURL", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.designtime.editor.fields.ListField"), "Field: List Field");
					var oCustomersComoboBox = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersComoboBox.isA("sap.m.MultiComboBox"), "Field: Customers is MultiComboBox");

					setTimeout(function () {
						assert.ok(oCustomersComoboBox.getItems().length === 5, "Field: Customers origin lenght is OK");
						oCustomersComoboBox.setValue("c");
						oCustomersField.onInput({
							"target": {
								"value": "c"
							},
							"srcControl": oCustomersComoboBox
						});
						setTimeout(function () {
							assert.ok(oCustomersComoboBox.getItems().length === 3, "Field: Customers lenght is OK");
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
