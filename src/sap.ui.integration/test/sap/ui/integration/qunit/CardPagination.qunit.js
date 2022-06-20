/* global QUnit sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Host",
	"sap/ui/core/Core"
], function (
	Card,
	Host,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oManifestClientSide = {
		"sap.app": {
			"id": "test1"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Title"
			},
			"content": {
				"data": {
					"json": [
						{
							"Name": "Name 1"
						},
						{
							"Name": "Name 2"
						},
						{
							"Name": "Name 3"
						},
						{
							"Name": "Name 4"
						},
						{
							"Name": "Name 5"
						},
						{
							"Name": "Name 6"
						},
						{
							"Name": "Name 7"
						},
						{
							"Name": "Name 8"
						},
						{
							"Name": "Name 9"
						},
						{
							"Name": "Name 10"
						},
						{
							"Name": "Name 11"
						},
						{
							"Name": "Name 12"
						},
						{
							"Name": "Name 13"
						}
					]
				},
				"maxItems": 0,
				"item": {
					"title": "{Name}"
				}
			},
			"footer": {
				"paginator": {
					"pageSize": 4
				}
			}
		}
	};

	var oManifestServerSide = {
		"sap.app": {
			"id": "test2"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"top": {
						"value": 5,
						"type": "integer"
					}
				}
			},
			"data": {
				"request": {
					"url": "/fakeService/getProducts",
					"method": "GET",
					"parameters": {
						"$format": "json",
						"$count": true,
						"$skip": "{paginator>/skip}",
						"$top": "{parameters>/top/value}"
					}
				},
				"path": "/value"
			},
			"header": {
				"title": "Products",
				"subTitle": "In Stock Information",
				"icon": {
					"src": "sap-icon://product"
				},
				"status": {
					"text": {
						"format": {
							"translationKey": "i18n>CARD.COUNT_X_OF_Y",
							"parts": [
								"parameters>/visibleItems",
								"/@odata.count"
							]
						}
					}
				}
			},
			"content": {
				"item": {
					"title": "{ProductName}"
				}
			},
			"footer": {
				"paginator": {
					"totalCount": "{/@odata.count}",
					"pageSize": "{parameters>/top/value}"
				}
			}
		}
	};


	QUnit.module("List Card", { });

	QUnit.test("Pagination - client side", function (assert) {
		var done = assert.async();

		var oCard = new Card({
			manifest: oManifestClientSide,
			width: "400px",
			height: "600px"
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			var oPaginator = oCard.getAggregation("_footer").getAggregation("paginator"),
				oList = oCard.getCardContent().getInnerList();

			assert.ok(oPaginator, "paginator is created");
			assert.strictEqual(oPaginator.getPageNumber(), 0, "page number is correct");
			assert.strictEqual(oPaginator.getPageSize(), 4, "page size is correct");
			assert.strictEqual(oPaginator.getPageCount(), 4, "page count is correct");

			assert.strictEqual(oList.getItems().length, oPaginator.getPageSize(), "list items number is correct");

			oPaginator._next();
			Core.applyChanges();

			assert.strictEqual(oCard.getCardContent().getInnerList().getItems().length, oPaginator.getPageSize(), "list items number is correct");
			assert.strictEqual(oList.getItems()[0].getTitle(), "Name 5", "next page is shown");

			oCard.destroy();
			done();
		});
	});

	QUnit.test("Pagination - server side", function (assert) {
		var done = assert.async();

		var oServer = sinon.createFakeServer({
			autoRespond: true
		});
		oServer.respondImmediately = true;

		oServer.respondWith("GET", /fakeService\/getProducts/, function (oXhr) {
			var oUrl = new URL(decodeURIComponent(oXhr.url), window.location.href),
				iSkip = parseInt(oUrl.searchParams.get("$skip") || 0),
				iTop = parseInt(oUrl.searchParams.get("$top")),
				aDataItems = [],
				iTotalCount = 77,
				i;

			for (i = 0; i < 77; i++) {
				aDataItems.push({
					ProductName: "Name " + i
				});
			}

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({
				"value": aDataItems.splice(iSkip, iTop),
				"@odata.count": iTotalCount
			}));
		});

		var oCard = new Card({
			manifest: oManifestServerSide,
			width: "400px",
			height: "600px"
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		oCard.attachEventOnce("_ready", function () {
			Core.applyChanges();

			var oPaginator = oCard.getAggregation("_footer").getAggregation("paginator"),
				oList = oCard.getCardContent().getInnerList();

			assert.ok(oPaginator, "paginator is created");
			assert.strictEqual(oPaginator.getPageNumber(), 0, "page number is correct");
			assert.strictEqual(oPaginator.getPageSize(), 5, "page size is correct");
			assert.strictEqual(oPaginator.getPageCount(), 16, "page count is correct");

			assert.strictEqual(oList.getItems().length, oPaginator.getPageSize(), "list items number is correct");

			oCard.attachEventOnce("_contentDataChange", function () {
				Core.applyChanges();

				assert.strictEqual(oCard.getCardContent().getInnerList().getItems().length, oPaginator.getPageSize(), "list items number is correct");
				assert.strictEqual(oList.getItems()[0].getTitle(), "Name 5", "next page is shown");

				oServer.restore();
				oCard.destroy();
				done();
			});

			oPaginator._next();
		});
	});

	QUnit.test("Event stateChanged is fired", function (assert) {
		var done = assert.async(),
			oCard = new Card({
				manifest: oManifestClientSide
			}),
			oHost = new Host();

		assert.expect(2);

		oCard.setHost(oHost);

		oCard.attachEventOnce("_ready", function () {
			var oPaginator = oCard.getAggregation("_footer").getAggregation("paginator");

			oCard.attachEventOnce("stateChanged", function () {
				assert.ok(true, "stateChanged is called after page change");
			});

			oHost.attachEventOnce("cardStateChanged", function () {
				assert.ok(true, "cardStateChanged for host is called after page change");

				// Clean up
				oCard.destroy();
				oHost.destroy();
				done();
			});

			// Act
			oPaginator._next();
			Core.applyChanges();
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});
});