/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/Host",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function (
	library,
	RequestDataProvider,
	Host,
	Card,
	qutils,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var CardActionType = library.CardActionType;

	function fakeRespond(oXhr) {
		oXhr.respond(
			200,
			{
				"Content-Type": "application/json"
			},
			"{}"
		);
	}

	QUnit.module("Submit action in Adaptive Content", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oServer = sinon.createFakeServer({
				autoRespond: true,
				respondImmediately: true
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.oServer.restore();
		},
		_pressSubmitButton: function () {
			var oButton = Array.from(this.oCard.getDomRef().querySelectorAll("ui5-button"))
				.find(function (el) {
					return el.textContent === "Send to backend";
				});

			qutils.triggerMouseEvent(oButton, "click");
		}
	});

	QUnit.test("Triggering submit request from Adaptive Content", async function (assert) {
		var done = assert.async();

		this.oServer.respondWith("POST", /test-resources\/sap\/ui\/integration\/qunit\/fake-api$/, function (oXhr) {
			// Assert
			assert.ok(true, "POST request should be send when submit button is pressed");
			fakeRespond(oXhr);
			done();
		});

		this.oCard.setManifest({
			"sap.app": {
				"id": "test.adaptive.submit.action",
				"type": "card"
			},
			"sap.card": {
				"configuration": {
					"actionHandlers": {
						"submit": {
							"url": "test-resources/sap/ui/integration/qunit/fake-api",
							"method": "POST"
						}
					}
				},
				"type": "AdaptiveCard",
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"body": [{
						"type": "Input.Text",
						"id": "EmailVal"
					}],
					"actions": [{
						"type": "Action.Submit",
						"title": "Send to backend"
					}]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Act
		this._pressSubmitButton();
	});

	QUnit.test("Data request with custom payload with bindings to 'form' model", async function (assert) {
		var done = assert.async();

		this.oServer.respondWith("POST", /test-resources\/sap\/ui\/integration\/qunit\/fake-api$/, function (oXhr) {
			// Assert
			assert.deepEqual(
				JSON.parse(oXhr.requestBody),
				{
					user: {
						name: "First name: Donna, last name: Moore"
					}
				},
				"Bindings in custom payload should be resolved prior submit request"
			);
			fakeRespond(oXhr);
			done();
		});

		this.oCard.setManifest({
			"sap.app": {
				"id": "test.adaptive.submit.action.payload",
				"type": "card"
			},
			"sap.card": {
				"type": "AdaptiveCard",
				"configuration": {
					"actionHandlers": {
						"submit": {
							"url": "./test-resources/sap/ui/integration/qunit/fake-api",
							"method": "POST",
							"headers": {
								"Content-Type": "application/json"
							},
							"parameters": {
								"user": {
									"name": "First name: {form>/firstName}, last name: {form>/lastName}"
								}
							}
						}
					}
				},
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"body": [{
						"type": "Input.Text",
						"id": "firstName",
						"value": "Donna"
					},
					{
						"type": "Input.Text",
						"id": "lastName",
						"value": "Moore"
					}],
					"actions": [{
						"type": "Action.Submit",
						"title": "Send to backend"
					}]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Act
		this._pressSubmitButton();
	});

	QUnit.module("Submit action payload", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Default payload", async function (assert) {
		var oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
			oDefaultPayload = {
				someKey: "someValue"
			};

		this.oCard.getModel("form").setData(oDefaultPayload);
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.adaptive.submit.action.payload",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"actionHandlers": {
						"submit": {
							"url": "./some-fake-api"
						}
					}
				},
				"content": {
					"item": {}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		// Act
		this.oCard.getCardContent().getActions().fireAction(
			this.oCard.getCardContent(),
			CardActionType.Submit
		);

		// Assert
		assert.deepEqual(oStubRequest.thisValues[0].getSettings().request.parameters, oDefaultPayload, "Default payload is correct");
	});

	QUnit.test("Custom payload (specified in 'configuration/actionHandlers')", async function (assert) {
		var oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
			oDefaultPayload = {
				someKey: "someValue"
			},
			oCustomPayload = {
				user: {
					name: "DonnaMoore"
				}
			};

		this.oCard.getModel("form").setData(oDefaultPayload);
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.adaptive.submit.action.payload",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"actionHandlers": {
						"submit": {
							"url": "./some-fake-api",
							"parameters": oCustomPayload
						}
					}
				},
				"content": {
					"item": {}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		// Act
		this.oCard.getCardContent().getActions().fireAction(
			this.oCard.getCardContent(),
			CardActionType.Submit
		);

		// Assert
		assert.deepEqual(oStubRequest.thisValues[0].getSettings().request.parameters, oCustomPayload, "Custom payload should override the default");
	});

	QUnit.test("Undefined values in data request", async function (assert) {
		var oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
			oDefaultPayload = {
				userName: "DonnaMoore",
				email: undefined
			},
			oCustomPayload = {
				user: {
					name: "{form>/userName}",
					email: "{form>/email}"
				}
			},
			oExpectedPayload = {
				user: {
					name: "DonnaMoore",
					email: null
				}
			};

		this.oCard.getModel("form").setData(oDefaultPayload);
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.adaptive.submit.action.payload",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"actionHandlers": {
						"submit": {
							"url": "./some-fake-api",
							"parameters": oCustomPayload
						}
					}
				},
				"content": {
					"item": {}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		// Act
		this.oCard.getCardContent().getActions().fireAction(
			this.oCard.getCardContent(),
			CardActionType.Submit
		);

		var oDataProviderSettings = oStubRequest.thisValues[0].getSettings();

		// Assert
		assert.ok(oDataProviderSettings.request.parameters.user.hasOwnProperty("email"), "Key with 'undefined' value should be part of the payload");
		assert.deepEqual(oDataProviderSettings.request.parameters, oExpectedPayload, "Undefined values should be turned to 'null'");
	});

	QUnit.test("Binding in action handler", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.adaptive.submit.action.payload",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"parameters": {
						"submitUrl": {
							"value": "some/fake/api"
						}
					},
					"actionHandlers": {
						"submit": {
							"url": "{parameters>/submitUrl/value}",
							"parameters": {
								"user": "Donna Moore"
							}
						}
					}
				},
				"content": {
					"item": {}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		// Arrange
		var oDataProviderStub = this.stub(RequestDataProvider.prototype, "getData").resolves("Success");

		// Act
		this.oCard.getCardContent().getActions().fireAction(
			this.oCard.getCardContent(),
			CardActionType.Submit
		);

		// Assert
		assert.strictEqual(
			oDataProviderStub.thisValues[0].getSettings().request.url,
			"some/fake/api",
			"Binding should be resolved"
		);
	});

	QUnit.test("Binding in action handler parameters", async function (assert) {
		this.oCard.getModel("form").setData({
			userName: "DonnaMoore"
		});
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.adaptive.submit.action.payload",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"actionHandlers": {
						"submit": {
							"url": "some-fake-api",
							"parameters": {
								"user": {
									"name": "My name is {form>/userName}"
								}
							}
						}
					}
				},
				"content": {
					"item": {}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		// Arrange
		var oDataProviderStub = this.stub(RequestDataProvider.prototype, "getData").resolves("Success");

		// Act
		this.oCard.getCardContent().getActions().fireAction(
			this.oCard.getCardContent(),
			CardActionType.Submit
		);

		// Assert
		assert.strictEqual(
			oDataProviderStub.thisValues[0].getSettings().request.parameters.user.name,
			"My name is DonnaMoore",
			"Binding should be resolved"
		);
	});

	QUnit.test("Expression binding in action handler parameters", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.adaptive.submit.action.payload",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"actionHandlers": {
						"submit": {
							"url": "some-fake-api",
							"parameters": {
								"user": {
									"name": "The winner is {= 1 > 2 ? 'first player' : 'second player'}"
								}
							}
						}
					}
				},
				"content": {
					"item": {}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		// Arrange
		var oDataProviderStub = this.stub(RequestDataProvider.prototype, "getData").resolves("Success");

		// Act
		this.oCard.getCardContent().getActions().fireAction(
			this.oCard.getCardContent(),
			CardActionType.Submit
		);

		// Assert
		assert.strictEqual(
			oDataProviderStub.thisValues[0].getSettings().request.parameters.user.name,
			"The winner is second player",
			"Binding should be resolved"
		);
	});

	QUnit.test("Parameters in submit action event", async function (assert) {
		const done = assert.async();
		const oCard = this.oCard;
		const oHost = new Host();

		assert.expect(6);

		oCard.setHost(oHost);
		oCard.setManifest({
			"sap.app": {
				"id": "test.adaptive.submit.action.event.parameters",
				"type": "card"
			},
			"sap.card": {
				"extension": "./extensions/ExtensionSample",
				"type": "Object",
				"data": {
					"json": {
						"initialSelection": "reason1",
						"reasons": [
							{
								"id": "reason1",
								"title": "Reason 1"
							},
							{
								"id": "reason2",
								"title": "Reason 2"
							}
						]
					}
				},
				"header": {
					"title": "PR255 - MacBook Purchase"
				},
				"content": {
					"groups": [
						{
							"alignment": "Stretch",
							"items": [
								{
									"id": "myReason",
									"label": "Reason",
									"type": "ComboBox",
									"selectedKey": "{/initialSelection}",
									"item": {
										"path": "/reasons",
										"template": {
											"key": "{id}",
											"title": "{title}"
										}
									}
								}
							]
						}
					]
				},
				"footer": {
					"actionsStrip": [
						{
							"text": "Submit",
							"actions": [
								{
									"type": "Submit",
									"parameters": {
										"param1": "static",
										"param2": "{form>/myReason/key}",
										"param3": "{= ${form>/myReason/key} === 'reason1'}"
									}
								}
							]
						}
					]
				}
			}
		});

		const fnValidate = (oEvent) => {
			const mFormData = oEvent.getParameter("formData");
			const mParameters = oEvent.getParameter("parameters");

			const mExpectedData = {
					"myReason": {
						"key": "reason1",
						"value": "Reason 1"
					}
				};
			const mExpectedParameters = {
					"param1": "static",
					"param2": "reason1",
					"param3": true,
					"data": mExpectedData // deprecated since 1.129
				};

			assert.deepEqual(mFormData, mExpectedData, "Data is properly passed to action handler.");
			assert.deepEqual(mParameters, mExpectedParameters, "Processed parameter from form data is correct.");
		};

		await nextCardReadyEvent(this.oCard);

		// Assert
		oCard.attachAction(fnValidate);

		const oExtension = oCard.getAggregation("_extension");
		oExtension.attachAction(fnValidate);

		oHost.attachAction((oEvent) => {
			fnValidate(oEvent);

			oHost.destroy();
			done();
		});

		// Act
		const oButton = oCard.getCardFooter().getActionsStrip().getAggregation("_toolbar").getContent()[1];
		oButton.firePress();
	});

});
