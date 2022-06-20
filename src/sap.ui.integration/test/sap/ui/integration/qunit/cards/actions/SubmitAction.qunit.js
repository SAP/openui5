/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/QUnitUtils"
], function (
	library,
	RequestDataProvider,
	Card,
	qutils
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

	QUnit.test("Triggering submit request from Adaptive Content", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			// Act
			this._pressSubmitButton();
		}.bind(this));

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
	});

	QUnit.test("Data request with custom payload with bindings to 'form' model", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			// Act
			this._pressSubmitButton();
		}.bind(this));

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
	});

	QUnit.module("Submit action payload", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Default payload", function (assert) {
		var done = assert.async(),
			oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
			oDefaultPayload = {
				someKey: "someValue"
			};

		this.oCard.getModel("form").setData(oDefaultPayload);

		this.oCard.attachEvent("_ready", function () {
			// Act
			this.oCard.getCardContent().getActions().fireAction(
				this.oCard.getCardContent(),
				CardActionType.Submit
			);

			// Assert
			assert.deepEqual(oStubRequest.thisValues[0].getSettings().request.parameters, oDefaultPayload, "Default payload is correct");
			done();
		}.bind(this));

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
	});

	QUnit.test("Custom payload (specified in 'configuration/actionHandlers')", function (assert) {
		var done = assert.async(),
			oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
			oDefaultPayload = {
				someKey: "someValue"
			},
			oCustomPayload = {
				user: {
					name: "DonnaMoore"
				}
			};

		this.oCard.getModel("form").setData(oDefaultPayload);

		this.oCard.attachEvent("_ready", function () {
			// Act
			this.oCard.getCardContent().getActions().fireAction(
				this.oCard.getCardContent(),
				CardActionType.Submit
			);

			// Assert
			assert.deepEqual(oStubRequest.thisValues[0].getSettings().request.parameters, oCustomPayload, "Custom payload should override the default");
			done();
		}.bind(this));

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
	});

	QUnit.test("Undefined values in data request", function (assert) {
		var done = assert.async(),
			oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
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

		this.oCard.attachEvent("_ready", function () {
			// Act
			this.oCard.getCardContent().getActions().fireAction(
				this.oCard.getCardContent(),
				CardActionType.Submit
			);

			var oDataProviderSettings = oStubRequest.thisValues[0].getSettings();

			// Assert
			assert.ok(oDataProviderSettings.request.parameters.user.hasOwnProperty("email"), "Key with 'undefined' value should be part of the payload");
			assert.deepEqual(oDataProviderSettings.request.parameters, oExpectedPayload, "Undefined values should be turned to 'null'");
			done();
		}.bind(this));

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
	});

	QUnit.test("Binding in action handler parameters", function (assert) {
		var done = assert.async();

		this.oCard.getModel("form").setData({
			userName: "DonnaMoore"
		});

		this.oCard.attachEvent("_ready", function () {
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

			done();
		}.bind(this));

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
	});

	QUnit.test("Expression binding in action handler parameters", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
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

			done();
		}.bind(this));

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
	});

});
