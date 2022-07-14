/* global QUnit */
sap.ui.define([
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/core/Core",
	"sap/ui/core/util/MockServer",
	"./jsons/withDesigntime/sap.card/DataExtensionImpl",
	"./testLib/SharedExtension"
], function (
	Editor,
	Designtime,
	Host,
	sinon,
	ContextHost,
	Core,
	MockServer,
	DataExtensionImpl,
	SharedExtension
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
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
	var oManifestForExtension = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
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
	var oManifestForSharedExtension = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.ui5": {
			"dependencies": {
			  "libs": {
				"sap/ui/integration/editor/test/testLib": {}
			  }
			}
		},
		"sap.card": {
			"extension": "module:sap/ui/integration/editor/test/testLib/SharedExtension",
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
						var sMsgStripId = oOrderField.getAssociation("_messageStrip");
						var oMsgStrip = Core.byId(sMsgStripId);
						assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
						assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
						assert.equal(oMsgStrip.getText(), "400: Please select a cutomer and an employee first", "Order Error Text");
						assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
						oProductField.getAggregation("_field").focus();
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
							var sMsgStripId = oOrderField.getAssociation("_messageStrip");
							var oMsgStrip = Core.byId(sMsgStripId);
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select a cutomer and an employee first", "Order Error Text");
							assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
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
							var sMsgStripId = oOrderField.getAssociation("_messageStrip");
							var oMsgStrip = Core.byId(sMsgStripId);
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select a cutomer and an employee first", "Order Error Text");
							assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
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
							var sMsgStripId = oOrderField.getAssociation("_messageStrip");
							var oMsgStrip = Core.byId(sMsgStripId);
							var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oDefaultBundle.getText("EDITOR_VAL_TEXTREQ"), oMsgStrip.getText(), "Order Error Text : required");
							assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
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
								var sMsgStripId = oOrderField.getAssociation("_messageStrip");
								var oMsgStrip = Core.byId(sMsgStripId);
								assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
								assert.equal(oProductField.getAggregation("_field").getItems().length, 2, "Field: Product lenght is OK");
								oProductField.getAggregation("_field").focus();
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
								var sMsgStripId = oOrderField.getAssociation("_messageStrip");
								var oMsgStrip = Core.byId(sMsgStripId);
								assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
								assert.equal(oProductField.getAggregation("_field").getItems().length, 1, "Field: Product lenght is OK");
								oProductField.getAggregation("_field").focus();
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

	QUnit.module("Get data from shared extension", {
		beforeEach: function () {
			// Simulate library location for the shared extension
			sap.ui.loader.config({
				paths: {
					"sap/ui/integration/editor/test/testLib": "test-resources/sap/ui/integration/qunit/editor/testLib"
				}
			});
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
		QUnit.test("Check value items from shared extension", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForSharedExtension
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
							assert.ok(oCustomersWithVisibleDependentMultiInput.getEditable(), "Field: Customers Visible is now Editable");
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
