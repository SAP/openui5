/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap-ui-integration-card-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/core/util/MockServer",
	"./cards/DataExtensionImpl",
	"./testLib/SharedExtension"
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
	Card,
	QUnitUtils,
	KeyCodes,
	ResourceBundle,
	MockServer,
	DataExtensionImpl,
	SharedExtension
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/designtime/editor/cards/";

	var iWaitTimeout = 1000;
	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || iWaitTimeout);
		});
	}
	function createEditor(sLanguage, oDesigntime) {
		sLanguage = sLanguage || "en";
		Core.getConfiguration().setLanguage(sLanguage);
		var oCardEditor = new CardEditor({
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
		oCardEditor.placeAt(oContent);
		return oCardEditor;
	}
	function destroyEditor(oCardEditor) {
		oCardEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}

	}
	function getDefaultContextModel(oResourceBundle) {
		return {
			empty: {
				label: oResourceBundle.getText("CARDEDITOR_CONTEXT_EMPTY_VAL"),
				type: "string",
				description: oResourceBundle.getText("CARDEDITOR_CONTEXT_EMPTY_DESC"),
				placeholder: "",
				value: ""
			},
			"card.internal": {
				label: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_INTERNAL_VAL"),
				todayIso: {
					type: "string",
					label: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_TODAY_VAL"),
					description: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_TODAY_DESC"),
					tags: [],
					placeholder: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_TODAY_VAL"),
					customize: ["format.dataTime"],
					value: "{{parameters.TODAY_ISO}}"
				},
				nowIso: {
					type: "string",
					label: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_NOW_VAL"),
					description: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_NOW_DESC"),
					tags: [],
					placeholder: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_NOW_VAL"),
					customize: ["dateFormatters"],
					value: "{{parameters.NOW_ISO}}"
				},
				currentLanguage: {
					type: "string",
					label: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_LANG_VAL"),
					description: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_LANG_VAL"),
					tags: ["technical"],
					customize: ["languageFormatters"],
					placeholder: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_LANG_VAL"),
					value: "{{parameters.LOCALE}}"
				}
			}
		};
	}
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

	var oManifestForSharedExtension = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "i18n/i18n.properties"
		},
		"sap.ui5": {
			"dependencies": {
				"libs": {
					"sap/ui/integration/cardeditor/test/testLib": {}
				}
			}
		},
		"sap.card": {
			"extension": "module:sap/ui/integration/cardeditor/test/testLib/SharedExtension",
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

	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	QUnit.module("Create an editor based on a card instance", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oCardEditor = new CardEditor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oCardEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oCardEditor.destroy();
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
		QUnit.test("Create a CardEditor with an existing Card instance", function (assert) {
			var oCard1 = new Card({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			var oCard2 = new Card("card2", { baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			this.oCardEditor.setCard(oCard1);
			this.oCardEditor.setCard(oCard1);
			this.oCardEditor.setCard(oCard2);
			this.oCardEditor.setCard("card2");
			assert.equal(this.oCardEditor.getCard(), "card2", "Card is set correctly");

			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check Description", function (assert) {
			var oCard = new Card({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			this.oCardEditor.setCard(oCard);
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					oField._descriptionIcon.onmouseover();
					var oDescriptionText = this.oCardEditor._getPopover().getContent()[0];
					assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
					assert.equal(oDescriptionText.getText(), "Description", "Text: Description OK");
					oField._descriptionIcon.onmouseout();
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check if the resource bundles both in the user's card and card editor are loaded.", function (assert) {
			var oCard = new Card({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			this.oCardEditor.setCard(oCard);
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oField = this.oCardEditor.getAggregation("_formContent")[2];
					var oGeneralPanel = this.oCardEditor.getAggregation("_formContent")[0];
					assert.equal(oGeneralPanel.getHeaderText(), "General Settings", "The header text of General group is correct, the resource bundle in the card editor is loaded correctly.");
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has translated label text, the resource bundle in the user's card is loaded.");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					oField._descriptionIcon.onmouseover();
					var oDescriptionText = this.oCardEditor._getPopover().getContent()[0];
					assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
					assert.equal(oDescriptionText.getText(), "Description", "Text: Description OK");
					oField._descriptionIcon.onmouseout();
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Get data via extension", {
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
					assert.equal(oCustomerLabel.getText(), "DataGotFromExtensionRequest", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: DataGotFromExtensionRequest is ComboBox");

					var oEmployeeLabel = this.oCardEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oCardEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "DataGotFromCardExtension", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: DataGotFromCardExtension is ComboBox");

					wait(2 * iWaitTimeout).then(function () {
						assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: DataGotFromExtensionRequest lenght is OK");
						assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 4, "Field: DataGotFromCardExtension lenght is OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Get data via shared extension", {
		beforeEach: function () {
			// Simulate library location for the shared extension
			sap.ui.loader.config({
				paths: {
					"sap/ui/integration/cardeditor/test/testLib": "test-resources/sap/ui/integration/qunit/designtime/editor/testLib"
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
				manifest: oManifestForSharedExtension
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var oCustomerLabel = this.oCardEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oCardEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "DataGotFromExtensionRequest", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: DataGotFromExtensionRequest is ComboBox");

					var oEmployeeLabel = this.oCardEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oCardEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "DataGotFromCardExtension", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: DataGotFromCardExtension is ComboBox");

					wait(2 * iWaitTimeout).then(function () {
						assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: DataGotFromExtensionRequest lenght is OK");
						assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 4, "Field: DataGotFromCardExtension lenght is OK");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Validation via extension - List(string[])", {
		beforeEach: function () {
			this.oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"stringArrayParameter": {
								"value": []
							}
						},
						"destinations": {
							"mock_request": {
								"name": "mock_request"
							}
						}
					}
				}
			};
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: "/mock_request/checkValidation",
					response: function (xhr) {
						xhr.respondJSON(200, null, {
							"values": {
								"checkEditable": false,
								"minLength": 2,
								"maxLength": 4,
								"valueRange": ["key1", "key3", "key6"]
							}
						});
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
		QUnit.test("boolean check", function (assert) {
			return new Promise(function (resolve, reject) {
				var oManifest = {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18nvalidation/i18n.properties"
					},
					"sap.card": {
						"extension": "DataExtensionImpl",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringArrayParameter": {
									"value": []
								}
							},
							"destinations": {
								"mock_request": {
									"name": "mock_request"
								}
							}
						}
					}
				};
				this.oCardEditor = createEditor("en", {
					"form": {
						"items": {
							"stringArrayParameter": {
								"manifestpath": "/sap.card/configuration/parameters/stringArrayParameter/value",
								"description": "String Array",
								"type": "string[]",
								"values": {
									"data": {
										"json": [
											{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
											{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
											{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" },
											{ "text": "text4", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-in" },
											{ "text": "text5", "key": "key5", "additionalText": "addtext5", "icon": "sap-icon://zoom-in" },
											{ "text": "text6", "key": "key6", "additionalText": "addtext6", "icon": "sap-icon://zoom-in" }
										],
										"path": "/"
									},
									"item": {
										"text": "{text}",
										"key": "{key}",
										"additionalText": "{additionalText}",
										"icon": "{icon}"
									}
								},
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"extension": {
													"method": "checkValidation"
												},
												"path": "/values/checkEditable"
											}
										}).then(function (editable){
											if (editable === false) {
												context["control"].setEditable(false);
											}
											return editable;
										});
									},
									"message": "The parameter is not allowed to edit"
								}]
							}
						}
					}
				});
				this.oCardEditor.setMode("admin");
				this.oCardEditor.setAllowSettings(true);
				this.oCardEditor.setAllowDynamicValues(true);
				this.oCardEditor.setCard({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					return new Promise(function (resolve) {
						wait(100).then(function () {
							var oField1 = this.oCardEditor.getAggregation("_formContent")[0].getAggregation("content")[1];
							oField1._settingsButton.focus();
							var oMultiComboBox = oField1.getAggregation("_field");
							wait(iWaitTimeout).then(function () {
								oMultiComboBox.focus();
								var sMsgStripId = oField1.getAssociation("_messageStrip");
								var oMsgStrip = Core.byId(sMsgStripId);
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oMsgStrip.getText(), "The parameter is not allowed to edit", "Message text correct");
								assert.ok(!oMultiComboBox.getEditable(), "Editable is false");
								resolve();
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Validation via extension - Boolean", {
		beforeEach: function () {
			this.oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"boolean": {
								"value": false
							}
						},
						"destinations": {
							"mock_request": {
								"name": "mock_request"
							}
						}
					}
				}
			};
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: "/mock_request/checkValidation",
					response: function (xhr) {
						xhr.respondJSON(200, null, {
							"values": {
								"checkEditable": false
							}
						});
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
		QUnit.test("checkbox", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"extension": "DataExtensionImpl",
					"type": "List",
					"configuration": {
						"parameters": {
							"boolean": {
								"value": false
							}
						},
						"destinations": {
							"mock_request": {
								"name": "mock_request"
							}
						}
					}
				}
			};
			return new Promise(function (resolve, reject) {
				this.oCardEditor = createEditor("en", {
					"form": {
						"items": {
							"boolean": {
								"manifestpath": "/sap.card/configuration/parameters/boolean/value",
								"type": "boolean",
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"extension": {
													"method": "checkValidation"
												},
												"path": "/values/checkEditable"
											}
										}).then(function (editable){
											if (editable === false && value === true) {
												context["control"].setSelected(false);
												return false;
											}
											return true;
										});
									},
									"message": "Do not have right to request data, unselected it"
								}]
							}
						}
					}
				});
				this.oCardEditor.setMode("admin");
				this.oCardEditor.setAllowSettings(true);
				this.oCardEditor.setAllowDynamicValues(true);
				this.oCardEditor.setCard({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					return new Promise(function (resolve) {
						wait(iWaitTimeout).then(function () {
							var oField1 = this.oCardEditor.getAggregation("_formContent")[0].getAggregation("content")[1];
							var oCheckBox = oField1.getAggregation("_field");
							assert.ok(!oCheckBox.getSelected(), "Selected is false");
							oCheckBox.setSelected(true);
							wait(iWaitTimeout).then(function () {
								assert.ok(!oCheckBox.getSelected(), "Selected is false");
								resolve();
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("switch", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"extension": "DataExtensionImpl",
					"type": "List",
					"configuration": {
						"parameters": {
							"boolean": {
								"value": false
							}
						},
						"destinations": {
							"mock_request": {
								"name": "mock_request"
							}
						}
					}
				}
			};
			return new Promise(function (resolve, reject) {
				this.oCardEditor = createEditor("en", {
					"form": {
						"items": {
							"boolean": {
								"manifestpath": "/sap.card/configuration/parameters/boolean/value",
								"type": "boolean",
								"visualization": {
									"type": "sap/m/Switch",
									"settings": {
										"busy": "{currentSettings>_loading}",
										"state": "{currentSettings>value}",
										"customTextOn": "Yes",
										"customTextOff": "No",
										"enabled": "{currentSettings>editable}"
									}
								},
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"extension": {
													"method": "checkValidation"
												},
												"path": "/values/checkEditable"
											}
										}).then(function (editable){
											if (editable === false && value === true) {
												context["control"].setState(false);
												return false;
											}
											return true;
										});
									},
									"message": "Do not have right to request data, unselected it"
								}]
							}
						}
					}
				});
				this.oCardEditor.setMode("admin");
				this.oCardEditor.setAllowSettings(true);
				this.oCardEditor.setAllowDynamicValues(true);
				this.oCardEditor.setCard({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					return new Promise(function (resolve) {
						wait(iWaitTimeout).then(function () {
							var oField1 = this.oCardEditor.getAggregation("_formContent")[0].getAggregation("content")[1];
							var oSwitch = oField1.getAggregation("_field");
							assert.ok(!oSwitch.getState(), "State is false");
							oSwitch.setState(true);
							wait(iWaitTimeout).then(function () {
								assert.ok(!oSwitch.getState(), "State is false");
								resolve();
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Card Context", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oCardEditor = new CardEditor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oCardEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oCardEditor.destroy();
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

			this.oCardEditor.setCard({ host: "host", manifest: { "sap.app": { "id": "test.sample", "i18n": "i18n/i18n.properties" }, "sap.card": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					var oModel = this.oCardEditor.getModel("context");
					assert.ok(oModel !== null, "Card Editor has a context model");
					assert.deepEqual(oModel.getData(), getDefaultContextModel(this.oCardEditor._oResourceBundle), "Card Editor has a default context model");
					assert.equal(oModel.getProperty("/sap.workzone/currentUser/id"), undefined, "Card Editor context /sap.workzone/currentUser/id is undefned");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Context Host checks to access context data async", function (assert) {
			this.oCardEditor.setCard({ host: "contexthost", manifest: { "sap.app": { "id": "test.sample", "i18n": "i18n/i18n.properties" }, "sap.card": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					var oModel = this.oCardEditor.getModel("context");
					assert.ok(oModel !== null, "Card Editor has a context model");
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/label"), "Id of the Work Zone user", "Card Editor host context contains the user id label 'Id of the Work Zone'");
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/placeholder"), "Work Zone user id", "Card Editor host context contains the user id placeholder 'Work Zone user id'");
					var oBinding = oModel.bindProperty("/sap.workzone/currentUser/id/value");
					oBinding.attachChange(function () {
						assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/value"), "MyCurrentUserId", "Card Editor host context user id value is 'MyCurrentUserId'");
						resolve();
					});
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/value"), undefined, "Card Editor host context user id value is undefined");
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Card Preview Mode", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oCardEditor = new CardEditor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oCardEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oCardEditor.destroy();
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
		QUnit.test("Live and abstract (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18n/i18n.properties",
						"type": "card",
						"title": "Test Card for Parameters",
						"subTitle": "Test Card for Parameters"
					},
					"sap.card": {
						"designtime": "designtime/previewLiveAbstract",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.ok(modeToggleButton.getDomRef(), "Preview mode button: Button is OK");
							assert.equal(modeToggleButton.getIcon(), "sap-icon://media-pause", "Preview mode button: Icon is OK");
							assert.ok(modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.equal(modeToggleButton.getTooltip(), "Sample Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Abstract and live (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/previewAbstractLive",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.ok(modeToggleButton.getDomRef(), "Preview mode button: Button is OK");
							assert.equal(modeToggleButton.getIcon(), "sap-icon://media-play", "Preview mode button: Icon is OK");
							assert.ok(!modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.equal(modeToggleButton.getTooltip(), "Live Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("None(as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/previewNone",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					setTimeout(function () {
						var cardPreview = this.oCardEditor.getAggregation("_preview");
						var card = cardPreview._getCardPreview();
						assert.equal(card, null, "Preview mode card is OK");
						resolve();
					}.bind(this), 500);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Live and own image (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/previewLiveOwnImage",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.ok(modeToggleButton.getDomRef(), "Preview mode button: Button is OK");
							assert.equal(modeToggleButton.getIcon(), "sap-icon://media-pause", "Preview mode button: Icon is OK");
							assert.ok(modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.equal(modeToggleButton.getTooltip(), "Sample Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Own image and live (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/previewOwnImageLive",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							var image = card.getAggregation("items")[0];
							assert.ok(image.getSrc().endsWith("./img/preview.png"), "Preview mode image: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.ok(modeToggleButton.getDomRef(), "Preview mode button: Button is OK");
							assert.equal(modeToggleButton.getIcon(), "sap-icon://media-play", "Preview mode button: Icon is OK");
							assert.ok(!modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.equal(modeToggleButton.getTooltip(), "Live Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Live (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/previewLive",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.equal(modeToggleButton.getDomRef(), null, "Preview mode button: Button is OK");
							assert.equal(modeToggleButton.getIcon(), "sap-icon://media-pause", "Preview mode button: Icon is OK");
							assert.ok(modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.equal(modeToggleButton.getTooltip(), "Sample Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Abstract (as json)", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/previewAbstract",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.equal(modeToggleButton.getDomRef(), null, "Preview mode button: Button is OK");
							assert.equal(modeToggleButton.getIcon(), "sap-icon://media-play", "Preview mode button: Icon is OK");
							assert.ok(!modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.equal(modeToggleButton.getTooltip(), "Live Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Not scaled (as json)", function (assert) {
			this.oCardEditor.setCard({ baseUrl: sBaseUrl, manifest: { "sap.app": { "id": "test.sample", "i18n": "i18n/i18n.properties" }, "sap.card": { "designtime": "designtime/previewNoScale", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } } } });
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var card = cardPreview._getCardPreview();
							assert.ok(card, "Preview mode card: OK");
							assert.ok(card.mCustomStyleClassMap.sapUiIntegrationDTPreviewNoScale, "Preview mode no scale: OK");
							var modeToggleButton = cardPreview._getModeToggleButton();
							assert.ok(modeToggleButton.getDomRef(), "Preview mode button: Button is OK");
							assert.equal(modeToggleButton.getIcon(), "sap-icon://media-play", "Preview mode button: Icon is OK");
							assert.ok(!modeToggleButton.getPressed(), "Preview mode button: Pressed is OK");
							assert.equal(modeToggleButton.getTooltip(), "Live Preview", "Preview mode button: Tooltip is OK");
							resolve();
						}
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Card Preview Position", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oCardEditor = new CardEditor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oCardEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oCardEditor.destroy();
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
		QUnit.test("Default position", function (assert) {
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18n/i18n.properties",
						"type": "card",
						"title": "Test Card for Parameters",
						"subTitle": "Test Card for Parameters"
					},
					"sap.card": {
						"designtime": "designtime/previewLiveAbstract",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var oEditorDom = this.oCardEditor.getDomRef();
							assert.equal(oEditorDom.children.length, 2, "Editor children length: OK");
							assert.equal(oEditorDom.children[1].id, cardPreview.getId(), "Preview Position: OK");
							resolve();
						}.bind(this)
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Position: top", function (assert) {
			this.oCardEditor.setPreviewPosition("top");
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18n/i18n.properties",
						"type": "card",
						"title": "Test Card for Parameters",
						"subTitle": "Test Card for Parameters"
					},
					"sap.card": {
						"designtime": "designtime/previewLiveAbstract",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var oEditorDom = this.oCardEditor.getDomRef();
							assert.equal(oEditorDom.children.length, 2, "Editor children length: OK");
							assert.equal(oEditorDom.children[0].id, cardPreview.getId(), "Preview Position: OK");
							assert.ok(oEditorDom.children[0].classList.contains("sapUiIntegrationDTPreviewMarginForAlignTopAndBottom"), "Preview style class: margin OK");
							resolve();
						}.bind(this)
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Position: bottom", function (assert) {
			this.oCardEditor.setPreviewPosition("bottom");
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18n/i18n.properties",
						"type": "card",
						"title": "Test Card for Parameters",
						"subTitle": "Test Card for Parameters"
					},
					"sap.card": {
						"designtime": "designtime/previewLiveAbstract",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var oEditorDom = this.oCardEditor.getDomRef();
							assert.equal(oEditorDom.children.length, 2, "Editor children length: OK");
							assert.equal(oEditorDom.children[1].id, cardPreview.getId(), "Preview Position: OK");
							assert.ok(oEditorDom.children[1].classList.contains("sapUiIntegrationDTPreviewMarginForAlignTopAndBottom"), "Preview style class: margin OK");
							resolve();
						}.bind(this)
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Position: left", function (assert) {
			this.oCardEditor.setPreviewPosition("left");
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18n/i18n.properties",
						"type": "card",
						"title": "Test Card for Parameters",
						"subTitle": "Test Card for Parameters"
					},
					"sap.card": {
						"designtime": "designtime/previewLiveAbstract",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var oEditorDom = this.oCardEditor.getDomRef();
							assert.equal(oEditorDom.children.length, 2, "Editor children length: OK");
							assert.equal(oEditorDom.children[0].id, cardPreview.getId(), "Preview Position: OK");
							resolve();
						}.bind(this)
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Position: right", function (assert) {
			this.oCardEditor.setPreviewPosition("right");
			this.oCardEditor.setCard({
				baseUrl: sBaseUrl,
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18n/i18n.properties",
						"type": "card",
						"title": "Test Card for Parameters",
						"subTitle": "Test Card for Parameters"
					},
					"sap.card": {
						"designtime": "designtime/previewLiveAbstract",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					var cardPreview = this.oCardEditor.getAggregation("_preview");
					cardPreview.addEventDelegate({
						onAfterRendering: function () {
							var oEditorDom = this.oCardEditor.getDomRef();
							assert.equal(oEditorDom.children.length, 2, "Editor children length: OK");
							assert.equal(oEditorDom.children[1].id, cardPreview.getId(), "Preview Position: OK");
							resolve();
						}.bind(this)
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
