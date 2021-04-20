/* global QUnit */
sap.ui.define([
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/core/Core",
	"sap/ui/core/util/MockServer",
	"./cards/withDesigntime/DataExtensionImpl"
], function (
	CardEditor,
	Designtime,
	Host,
	sinon,
	ContextHost,
	Core,
	MockServer,
	DataExtensionImpl
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
	var oManifestForExtension = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "i18n/i18n.properties"
		},
		"sap.card": {
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
					"DataGotFromCardExtension": {
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
			"i18n": "i18n/i18n.properties"
		},
		"sap.card": {
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
			"i18n": "i18n/i18n.properties"
		},
		"sap.card": {
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
						oOrderField.getAggregation("_field").focus();
						var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
						assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
						assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
						assert.ok(oMsgStrip.getText() === "400: Please select a cutomer and an employee first", "Order Error Text");
						assert.ok(oProductField.getAggregation("_field").getItems().length === 0, "Field: Product lenght is OK");
						oProductField.getAggregation("_field").focus();
						assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
						assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
						assert.ok(oMsgStrip.getText() === "400: Please select an order first", "Product Error Text");
						assert.ok(oCustomerLimitField.getAggregation("_field").getItems().length === 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
						resolve();
					}.bind(this), iWaitTimeout);
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
							oOrderField.getAggregation("_field").focus();
							var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
							assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
							assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
							assert.ok(oMsgStrip.getText() === "400: Please select a cutomer and an employee first", "Order Error Text");
							assert.ok(oProductField.getAggregation("_field").getItems().length === 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
							assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
							assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
							assert.ok(oMsgStrip.getText() === "400: Please select an order first", "Product Error Text");
							assert.ok(oCustomerLimitField.getAggregation("_field").getItems().length === 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						}.bind(this), iWaitTimeout);
					}.bind(this), iWaitTimeout);
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
							oOrderField.getAggregation("_field").focus();
							var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
							assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
							assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
							assert.ok(oMsgStrip.getText() === "400: Please select a cutomer and an employee first", "Order Error Text");
							assert.ok(oProductField.getAggregation("_field").getItems().length === 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
							assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
							assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
							assert.ok(oMsgStrip.getText() === "400: Please select an order first", "Product Error Text");
							assert.ok(oCustomerLimitField.getAggregation("_field").getItems().length === 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						}.bind(this), iWaitTimeout);
					}.bind(this), iWaitTimeout);
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
							oOrderField.getAggregation("_field").focus();
							var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
							var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
							assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
							assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
							assert.ok(oDefaultBundle.getText("CARDEDITOR_VAL_TEXTREQ") === oMsgStrip.getText(), "Order Error Text : required");
							assert.ok(oProductField.getAggregation("_field").getItems().length === 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
							assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
							assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
							assert.ok(oMsgStrip.getText() === "400: Please select an order first", "Product Error Text");
							assert.ok(oCustomerLimitField.getAggregation("_field").getItems().length === 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						}.bind(this), iWaitTimeout);
					}.bind(this), iWaitTimeout);
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
								oOrderField.getAggregation("_field").focus();
								var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
								assert.ok(oMsgStrip.getDomRef().style.opacity === "0", "Message strip not visible");
								assert.ok(oProductField.getAggregation("_field").getItems().length === 2, "Field: Product lenght is OK");
								oProductField.getAggregation("_field").focus();
								assert.ok(oMsgStrip.getDomRef().style.opacity === "0", "Message strip not visible");
								assert.ok(oCustomerLimitField.getAggregation("_field").getItems().length === 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
								resolve();
							}.bind(this), iWaitTimeout);
						}.bind(this), iWaitTimeout);
					}.bind(this), iWaitTimeout);
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
								oOrderField.getAggregation("_field").focus();
								var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
								assert.ok(oMsgStrip.getDomRef().style.opacity === "0", "Message strip not visible");
								assert.ok(oProductField.getAggregation("_field").getItems().length === 1, "Field: Product lenght is OK");
								oProductField.getAggregation("_field").focus();
								assert.ok(oMsgStrip.getDomRef().style.opacity === "0", "Message strip not visible");
								assert.ok(oCustomerLimitField.getAggregation("_field").getItems().length === 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
								resolve();
							}.bind(this), iWaitTimeout);
						}.bind(this), iWaitTimeout);
					}.bind(this), iWaitTimeout);
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
		QUnit.test("Check the setting button", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInComboBox
			});
			this.oCardEditor.setAllowSettings(true);
			this.oCardEditor.setAllowDynamicValues(true);
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
					//settings button
					var oButton = oCustomerField.getAggregation("_settingsButton");
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						//popup is opened
						assert.ok(oCustomerField._oSettingsPanel._oOpener === oCustomerField, "Settings: Has correct owner");
						var settingsClass = oCustomerField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.ok(testInterface.oCurrentInstance === oCustomerField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.ResponsivePopover"), "Settings: Has a Popover instance");
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
						assert.ok(testInterface.oSettingsPanel.getItems().length === 4, "Settings: Settings Panel has 4 items");
						var oItem = testInterface.getMenuItems()[3].getItems()[2];
						testInterface.getMenu().fireItemSelected({ item: oItem });
						testInterface.oPopover.getBeginButton().firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.ok(oButton.getIcon() === "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the NotEditable and NotVisible parameter", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInComboBox
			});
			this.oCardEditor.setAllowSettings(true);
			this.oCardEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomerNotEditableLabel = this.oCardEditor.getAggregation("_formContent")[5];
					var oCustomerNotEditableField = this.oCardEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomerNotEditableLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomerNotEditableLabel.getText() === "CustomerWithNotEditable", "Label: Has static label text");
					assert.ok(oCustomerNotEditableField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: Customer NotEditable String Field");
					var oCustomerComboBox = oCustomerNotEditableField.getAggregation("_field");
					assert.ok(oCustomerComboBox.isA("sap.m.ComboBox"), "Field: Customer NotEditable is ComboBox");
					assert.ok(!oCustomerComboBox.getEditable(), "Field: Customer NotEditable is Not Editable");
					var oNextField = this.oCardEditor.getAggregation("_formContent")[7];
					assert.ok(oNextField.isA("sap.m.Panel"), "Field: Customer NotVisible is not visible");
					setTimeout(function () {
						assert.ok(oCustomerComboBox.getItems().length === 4, "Field: Customer NotEditable data lenght is OK");
						resolve();
					}, 2000);
				}.bind(this));
			}.bind(this));
		});

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
		QUnit.test("Check the setting button", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiComboBox

			});
			this.oCardEditor.setAllowSettings(true);
			this.oCardEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomersLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oCustomersField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomersLabel.getText() === "Customers with filter parameter", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.designtime.editor.fields.ListField"), "Field: List Field");
					var oCustomerComoboBox = oCustomersField.getAggregation("_field");
					assert.ok(oCustomerComoboBox.isA("sap.m.MultiComboBox"), "Field: Customers is MultiComboBox");
					//settings button
					var oButton = oCustomersField.getAggregation("_settingsButton");
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					assert.ok(oButton.getIcon() === "sap-icon://enter-more", "Settings: Shows enter-more Icon");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
						//popup is opened
						assert.ok(oCustomersField._oSettingsPanel._oOpener === oCustomersField, "Settings: Has correct owner");
						var settingsClass = oCustomersField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.ok(testInterface.oCurrentInstance === oCustomersField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.ResponsivePopover"), "Settings: Has a Popover instance");
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
						assert.ok(testInterface.oSettingsPanel.getItems().length === 4, "Settings: Settings Panel has 4 items");
						var oItem = testInterface.getMenuItems()[3].getItems()[2];
						testInterface.getMenu().fireItemSelected({ item: oItem });
						testInterface.oPopover.getBeginButton().firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.ok(oButton.getIcon() === "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the NotEditable and NotVisible parameter", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiComboBox
			});
			this.oCardEditor.setAllowSettings(true);
			this.oCardEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomersNotEditableLabel = this.oCardEditor.getAggregation("_formContent")[5];
					var oCustomersNotEditableField = this.oCardEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomersNotEditableLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomersNotEditableLabel.getText() === "CustomersWithNotEditable", "Label: Has static label text");
					assert.ok(oCustomersNotEditableField.isA("sap.ui.integration.designtime.editor.fields.ListField"), "Field: Customers NotEditable List Field");
					var oCustomersMultiComboBox = oCustomersNotEditableField.getAggregation("_field");
					assert.ok(oCustomersMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers NotEditable is MultiComboBox");
					assert.ok(!oCustomersMultiComboBox.getEditable(), "Field: Customers NotEditable is Not Editable");
					var oNextField = this.oCardEditor.getAggregation("_formContent")[7];
					assert.ok(oNextField.isA("sap.m.Panel"), "Field: Customers NotVisible is not visible");
					setTimeout(function () {
						assert.ok(oCustomersMultiComboBox.getItems().length === 5, "Field: Customers NotEditable data lenght is OK");
						resolve();
					}, 2000);
				}.bind(this));
			}.bind(this));
		});

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
					var oCustomersMultiComboBox = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers is MultiComboBox");

					setTimeout(function () {
						assert.ok(oCustomersMultiComboBox.getItems().length === 5, "Field: Customers origin lenght is OK");
						oCustomersMultiComboBox.setValue("c");
						oCustomersField.onInput({
							"target": {
								"value": "c"
							},
							"srcControl": oCustomersMultiComboBox
						});
						setTimeout(function () {
							assert.ok(oCustomersMultiComboBox.getItems().length === 3, "Field: Customers lenght is OK");
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
					var oCustomersMultiComboBox = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers is MultiComboBox");

					setTimeout(function () {
						assert.ok(oCustomersMultiComboBox.getItems().length === 5, "Field: Customers origin lenght is OK");
						oCustomersMultiComboBox.setValue("c");
						oCustomersField.onInput({
							"target": {
								"value": "c"
							},
							"srcControl": oCustomersMultiComboBox
						});
						setTimeout(function () {
							assert.ok(oCustomersMultiComboBox.getItems().length === 3, "Field: Customers lenght is OK");
							resolve();
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
		QUnit.test("Check value items", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForExtension
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomerLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomerLabel.getText() === "DataGotFromExtensionRequest", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: DataGotFromExtensionRequest is ComboBox");

					var oEmployeeLabel = this.oCardEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oCardEditor.getAggregation("_formContent")[4];
					assert.ok(oEmployeeLabel.getText() === "DataGotFromCardExtension", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: DataGotFromCardExtension is ComboBox");

					setTimeout(function () {
						assert.ok(oCustomerField.getAggregation("_field").getItems().length === 4, "Field: DataGotFromExtensionRequest lenght is OK");
						assert.ok(oEmployeeField.getAggregation("_field").getItems().length === 4, "Field: DataGotFromCardExtension lenght is OK");
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
		QUnit.test("Check the Editable dependece parameters", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForEditableDependence
			});
			this.oCardEditor.setAllowSettings(true);
			this.oCardEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oBooleanSwitch = this.oCardEditor.getAggregation("_formContent")[2].getAggregation("_field");
					assert.ok(oBooleanSwitch.getState() === false, "Label: Boolean switch value");

					var oCustomerWithEditableDependentLabel = this.oCardEditor.getAggregation("_formContent")[3];
					var oCustomerWithEditableDependentField = this.oCardEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomerWithEditableDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomerWithEditableDependentLabel.getText() === "CustomerWithEditableDependent", "Label: Has static label text");
					assert.ok(oCustomerWithEditableDependentField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: Customer Editable String Field");
					var oCustomerWithEditableDependentComboBox = oCustomerWithEditableDependentField.getAggregation("_field");
					assert.ok(oCustomerWithEditableDependentComboBox.isA("sap.m.ComboBox"), "Field: Customer Editable is ComboBox");
					assert.ok(!oCustomerWithEditableDependentComboBox.getEditable(), "Field: Customer Editable is Not Editable");

					var oCustomersWithEditableDependentLabel = this.oCardEditor.getAggregation("_formContent")[5];
					var oCustomersWithEditableDependenteField = this.oCardEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomersWithEditableDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomersWithEditableDependentLabel.getText() === "CustomersWithEditableDependent", "Label: Has static label text");
					assert.ok(oCustomersWithEditableDependenteField.isA("sap.ui.integration.designtime.editor.fields.ListField"), "Field: Customers Editable List Field");
					var oCustomersWithEditableDependentMultiComboBox = oCustomersWithEditableDependenteField.getAggregation("_field");
					assert.ok(oCustomersWithEditableDependentMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers Editable is MultiComboBox");
					assert.ok(!oCustomersWithEditableDependentMultiComboBox.getEditable(), "Field: Customers Editable is Not Editable");

					setTimeout(function () {
						assert.ok(oCustomerWithEditableDependentComboBox.getItems().length === 4, "Field: Customer Editable data lenght is OK");
						assert.ok(oCustomersWithEditableDependentMultiComboBox.getItems().length === 5, "Field: Customers Editable data lenght is OK");

						oBooleanSwitch.setState(true);
						setTimeout(function () {
							assert.ok(oCustomerWithEditableDependentComboBox.getEditable(), "Field: Customer Editable is now Editable");
							assert.ok(oCustomerWithEditableDependentComboBox.getItems().length === 4, "Field: Customer Editable data lenght is OK");
							assert.ok(oCustomersWithEditableDependentMultiComboBox.getEditable(), "Field: Customers Editable is now Editable");
							assert.ok(oCustomersWithEditableDependentMultiComboBox.getItems().length === 5, "Field: Customers Editable data lenght is OK");
							resolve();
						}, iWaitTimeout);
					}, iWaitTimeout);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the Visible dependece parameters", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForVisibleDependence
			});
			this.oCardEditor.setAllowSettings(true);
			this.oCardEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oBooleanSwitch = this.oCardEditor.getAggregation("_formContent")[2].getAggregation("_field");
					assert.ok(oBooleanSwitch.getState() === false, "Label: Boolean switch value");

					var oCustomerWithVisibleDependentLabel = this.oCardEditor.getAggregation("_formContent")[3];
					var oCustomerWithVisibleDependentField = this.oCardEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomerWithVisibleDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomerWithVisibleDependentLabel.getText() === "CustomerWithVisibleDependent", "Label: Has static label text");
					assert.ok(oCustomerWithVisibleDependentField.isA("sap.ui.integration.designtime.editor.fields.StringField"), "Field: Customer Visible String Field");
					var oCustomerWithVisibleDependentComboBox = oCustomerWithVisibleDependentField.getAggregation("_field");
					assert.ok(oCustomerWithVisibleDependentComboBox.isA("sap.m.ComboBox"), "Field: Customer Visible is ComboBox");
					assert.ok(!oCustomerWithVisibleDependentComboBox.getVisible(), "Field: Customers Visible is Not Visible");

					var oCustomersWithVisibleDependentLabel = this.oCardEditor.getAggregation("_formContent")[5];
					var oCustomersWithVisibleDependentField = this.oCardEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomersWithVisibleDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oCustomersWithVisibleDependentLabel.getText() === "CustomersWithVisibleDependent", "Label: Has static label text");
					assert.ok(oCustomersWithVisibleDependentField.isA("sap.ui.integration.designtime.editor.fields.ListField"), "Field: Customers Visible List Field");
					var oCustomersWithVisibleDependentMultiComboBox = oCustomersWithVisibleDependentField.getAggregation("_field");
					assert.ok(oCustomersWithVisibleDependentMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers Visible is MultiComboBox");
					assert.ok(!oCustomersWithVisibleDependentMultiComboBox.getVisible(), "Field: Customers Visible is Not Visible");
					setTimeout(function () {
						assert.ok(oCustomerWithVisibleDependentComboBox.getItems().length === 4, "Field: Customer Visible data lenght is OK");
						assert.ok(oCustomersWithVisibleDependentMultiComboBox.getItems().length === 5, "Field: Customers Visible data lenght is OK");

						oBooleanSwitch.setState(true);
						setTimeout(function () {
							assert.ok(oCustomerWithVisibleDependentComboBox.getVisible(), "Field: Customer Visible is now Visible");
							assert.ok(oCustomerWithVisibleDependentComboBox.getItems().length === 4, "Field: Customer Visible data lenght is OK");
							assert.ok(oCustomersWithVisibleDependentMultiComboBox.getVisible(), "Field: Customers Visible is now Visible");
							assert.ok(oCustomersWithVisibleDependentMultiComboBox.getItems().length === 5, "Field: Customers Visible data lenght is OK");
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
