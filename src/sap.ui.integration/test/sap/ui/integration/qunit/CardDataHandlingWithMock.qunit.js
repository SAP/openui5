/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"./testResources/localService/SEPMRA_PROD_MAN/mockServer",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
],
function (
	Card,
	ProductsMockServer,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oManifest_Batch = {
		"sap.app": {
			"id": "test.card.data.handling.batch"
		},
		"sap.card": {
			"data": {
				"request": {
					"url": "/SEPMRA_PROD_MAN/$batch",
					"method": "POST",
					"batch": {
						"supplier": {
							"method": "GET",
							"url": "SEPMRA_C_PD_Supplier('100000038')",
							"headers": {
								"Accept": "application/json"
							}
						},
						"products": {
							"method": "GET",
							"url": "SEPMRA_C_PD_Product?$top=2&$filter=Supplier eq '100000038'",
							"headers": {
								"Accept": "application/json"
							}
						}
					}
				}
			},
			"type": "List",
			"header": {
				"data": {
					"path": "/supplier/d"
				},
				"title": "{CompanyName}"
			},
			"content": {
				"data": {
					"path": "/products/d/results"
				},
				"item": {
					"title": "{Name}"
				}
			}
		}
	};

	var oManifest_BatchError = {
		"sap.app": {
			"id": "test.card.data.handling.batchError"
		},
		"sap.card": {
			"data": {
				"request": {
					"url": "/SEPMRA_PROD_MAN/$batch",
					"method": "POST",
					"batch": {
						"supplier": {
							"method": "GET",
							"url": "NotFound"
						},
						"products": {
							"method": "GET",
							"url": "SEPMRA_C_PD_Product?$top=2&$filter=Supplier eq '100000038'",
							"headers": {
								"Accept": "application/json"
							}
						}
					}
				}
			},
			"type": "List"
		}
	};

	QUnit.module("Using mock server", {
		beforeEach: function () {
			this.oCard = new Card();
			this.oMockServer = ProductsMockServer.init();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oMockServer.stop();
			this.oMockServer.destroy();
		}
	});

	QUnit.test("Batch request", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_Batch);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const aItems = this.oCard.getCardContent().getInnerList().getItems();
		const oHeader = this.oCard.getCardHeader();

		// Assert
		assert.strictEqual(oHeader.getTitle(), "Bionic Research Lab", "Title from header level is correct.");
		assert.strictEqual(aItems.length, 2, "List has 2 items.");
		assert.strictEqual(aItems[0].getTitle(), "Hurricane GX/LN", "First list item has correct title.");
	});

	QUnit.test("Simulate error", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_error", function (oEvent) {
			var sMessage = oEvent.getParameter("message");

			assert.ok(sMessage.indexOf("404 Not Found") > 0, "Error is fired when part of batch request fails.");
			done();
		});

		// Act
		this.oCard.setManifest(oManifest_BatchError);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

});