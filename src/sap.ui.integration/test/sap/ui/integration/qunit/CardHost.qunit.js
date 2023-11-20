/* global QUnit*/

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core",
	"sap/ui/integration/Host"
], function (
	Card,
	Core,
	Host
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oContextsManifest = {
		"sap.app": {
			"id": "test2",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"userId": {
						"value": "{context>/sap.sample/user/id/value}"
					}
				}
			},
			"header": {
				"title": "{context>/sap.sample/user/name/value}",
				"subTitle": "{{parameters.userId}}"
			}
		}
	};

	QUnit.module("Context", {
		beforeEach: function () {
			var oSamples = {
				"sap.sample/user/id/value": 15,
				"sap.sample/user/name/value": "User name"
			};

			this.oSamples = oSamples;

			this.oHost = new Host();

			this.oHost.getContextValue = function (sPath) {
				var sResult = oSamples[sPath];
				if (sResult) {
					return Promise.resolve(sResult);
				} else {
					return Promise.reject(sPath + " was not found.");
				}
			};

			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources",
				manifest: oContextsManifest,
				host: this.oHost
			});
			this.oCard.setHost(this.oHost);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Context values", function (assert) {
		// Arrange
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachEvent("_ready", function () {
			var oHeader = oCard.getCardHeader(),
				sTitle = oHeader.getTitle(),
				sSubtitle = oHeader.getSubtitle();

			// Assert
			assert.strictEqual(sTitle, "User name", "User name parameter is parsed correctly.");
			assert.strictEqual(sSubtitle, "15", "User id parameter is parsed correctly.");
			done();
		});

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oHost = new Host();
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Context values", function (assert) {
		// Arrange
		var done = assert.async(),
			oHost = this.oHost,
			oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources",
				dataMode: "Active",
				manifest: {
					"sap.app": {
						"id": "test4",
						"type": "card"
					},
					"sap.card": {
						"type": "List",
						"data": {
							"request": {
								"url": "items.json"
							}
						},
						"header": {
							"title": "{context>/sap.sample/user/name/value}",
							"subTitle": "{{parameters.userId}}"
						},
						"content": {
							"data": {
								"path": "/"
							},
							"item": {
								"title": "{Name}"
							}
						}
					}
				},
				host: oHost
			}),
			iCounter = 0;

		oHost.attachCardInitialized(function (oEvent) {
			// Assert
			assert.ok(true, "cardInitialized is fired.");
			assert.strictEqual(oEvent.getParameter("card"), oCard, "The passed card is correct.");
			iCounter++;
		});

		oCard.attachEventOnce("_ready", function () {
			oCard.attachEventOnce("_ready", function () {
				// Assert
				assert.strictEqual(iCounter, 1, "The cardInitialized is fired only once even if refresh() is called.");
				done();
			});

			// Act
			oCard.refresh();
			oCard.startManifestProcessing();
			Core.applyChanges();
		});

		// Act
		oCard.startManifestProcessing();
		Core.applyChanges();
	});
});