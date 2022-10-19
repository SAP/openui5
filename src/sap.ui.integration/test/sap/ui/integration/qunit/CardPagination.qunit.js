/* global QUnit sinon */

sap.ui.define([
	"sap/base/util/deepExtend",
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Host"
], function (
	deepExtend,
	Core,
	Card,
	Host
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oManifestClientSideWithStaticData = {
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

	var oManifestNoData = {
		"sap.app": {
			"id": "test.card.NoData"
		},
		"sap.card": {
			"type": "List",
			"header": {},
			"content": {
				"item": {
					"title": ""
				}
			},
			"footer": {
				"paginator": {
					"pageSize": 4
				}
			},
			"data": {
				"json": []
			}
		}
	};

	QUnit.module("Client-Side Pagination", {
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

			this.oServer.respondWith("GET", /fakeService\/getOrders/, function (oXhr) {
				var aDataItems = [],
					i;

				for (i = 0; i < 50; i++) {
					aDataItems.push({
						ShipName: "Name " + i
					});
				}

				oXhr.respond(200, {
					"Content-Type": "application/json"
				}, JSON.stringify({
					"value": aDataItems
				}));
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oServer.restore();
		}
	});

	QUnit.test("Pagination - client side with static data", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			var oPaginator = this.oCard.getCardFooter().getPaginator(),
				oList = this.oCard.getCardContent().getInnerList();

			assert.ok(oPaginator, "paginator is created");
			assert.strictEqual(oPaginator.getPageNumber(), 0, "page number is correct");
			assert.strictEqual(oPaginator.getPageSize(), 4, "page size is correct");
			assert.strictEqual(oPaginator.getPageCount(), 4, "page count is correct");

			assert.strictEqual(oList.getItems().length, oPaginator.getPageSize(), "list items number is correct");

			oPaginator.next();
			Core.applyChanges();

			assert.strictEqual(this.oCard.getCardContent().getInnerList().getItems().length, oPaginator.getPageSize(), "list items number is correct");
			assert.strictEqual(oList.getItems()[0].getTitle(), "Name 5", "next page is shown");

			done();
		}.bind(this));

		this.oCard.setManifest(oManifestClientSideWithStaticData);
	});

	QUnit.test("Event stateChanged is fired", function (assert) {
		var done = assert.async(),
			oHost = new Host();

		assert.expect(2);

		this.oCard.setHost(oHost);

		this.oCard.attachEventOnce("_ready", function () {
			var oPaginator = this.oCard.getCardFooter().getPaginator();

			this.oCard.attachEventOnce("stateChanged", function () {
				assert.ok(true, "stateChanged is called after page change");
			});

			oHost.attachEventOnce("cardStateChanged", function () {
				assert.ok(true, "cardStateChanged for host is called after page change");

				// Clean up
				this.oCard.setHost(null);
				oHost.destroy();
				done();
			}.bind(this));

			// Act
			oPaginator.next();
			Core.applyChanges();
		}.bind(this));

		this.oCard.setManifest(oManifestClientSideWithStaticData);
	});

	QUnit.test("Pagination - client side with dynamic data and filter", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			var oPaginator = this.oCard.getCardFooter().getPaginator(),
				oList = this.oCard.getCardContent().getInnerList(),
				oFilterBar = this.oCard.getAggregation("_filterBar"),
				oFilter = oFilterBar._getFilters()[0];

			// Act 1 - go to page 2
			oPaginator.next();

			// Assert 1 - is on page 2
			assert.strictEqual(oPaginator.getPageNumber(), 1, "page number is correct");
			assert.strictEqual(oList.getItems()[0].getTitle(), "Name 5", "next page is shown");

			oPaginator.attachEventOnce("animationComplete", function () {
				// Assert 2 - is back to page 1
				assert.strictEqual(oPaginator.getPageNumber(), 0, "Page number should have been reset to 0 after filter has changed");
				assert.strictEqual(oList.getItems()[0].getTitle(), "Name 0", "First page should be shown in the list");

				// Act 3 - go to page 2 again
				oPaginator.next();
				Core.applyChanges();

				// Assert 3 - is on page 2
				assert.strictEqual(oPaginator.getPageNumber(), 1, "page number is correct");
				assert.strictEqual(oList.getItems()[0].getTitle(), "Name 5", "next page is shown");

				done();
			});

			// Act 2 - change filter
			oFilter.getField().open();
			oFilter.getField().getItems()[1].$().trigger("tap");

		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"id": "test.clientSidePaginationWithDynamicDataAndFilter"
			},
			"sap.card": {
				"configuration": {
					"filters": {
						"shipper": {
							"value": "1",
							"type": "Select",
							"label": "Shipper",
							"items": [
								{
									"title": 1,
									"key": 1
								},
								{
									"title": 2,
									"key": 2
								}
							]
						}
					}
				},
				"data": {
					"request": {
						"url": "/fakeService/getOrders",
						"parameters": {
							"$filter": "Shipper/ShipperID eq {filters>/shipper/value}"
						}
					},
					"path": "/value/"
				},
				"type": "List",
				"header": {
					"title": "Client-Side Pagination with Dynamic Data"
				},
				"content": {
					"item": {
						"title": "{ShipName}"
					},
					"maxItems": 5
				},
				"footer": {
					"paginator": {
						"pageSize": 5
					}
				}
			}
		});
	});

	QUnit.module("Server-Side Pagination", {
		beforeEach: function () {
			this.oCard = new Card();
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			this.oServer = sinon.createFakeServer({
				autoRespond: true,
				respondImmediately: true
			});

			this.oServer.respondWith("GET", /fakeService\/getProducts/, function (oXhr) {
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
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oServer.restore();
		}
	});

	QUnit.test("Pagination - server side", function (assert) {
		var done = assert.async();
		var oCard = this.oCard;

		oCard.attachEventOnce("_ready", function () {
			Core.applyChanges();

			var oPaginator = oCard.getCardFooter().getPaginator(),
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

				oCard.destroy();
				done();
			});

			oPaginator.next();
		});

		oCard.setManifest(oManifestServerSide);
	});

	QUnit.test("Page is reset after data is refreshed", function (assert) {
		var done = assert.async();

		this.oCard.attachEventOnce("_ready", function () {
			Core.applyChanges();
			var oPaginator = this.oCard.getCardFooter().getPaginator();
			var oList = this.oCard.getCardContent().getInnerList();

			oPaginator.attachEventOnce("animationComplete", function () {
				assert.strictEqual(oPaginator.getPageNumber(), 1, "Page number should be 1");

				oPaginator.attachEventOnce("animationComplete", function () {
					Core.applyChanges();

					// Assert
					assert.strictEqual(oPaginator.getPageNumber(), 0, "Page number should have been reset to 0 after refreshData()");
					assert.strictEqual(oList.getItems()[0].getTitle(), "Name 0", "First page should be shown in the list");

					done();
				});

				// Act 2
				this.oCard.refreshData();
			}.bind(this));

			// Act 1
			oPaginator.next();
		}.bind(this));

		this.oCard.setManifest(oManifestServerSide);
	});

	QUnit.test("Page is reset after filter has changed", function (assert) {
		var done = assert.async();
		var oManifest = deepExtend({}, oManifestServerSide);

		oManifest["sap.card"].configuration.filters = {
			"categoryId": {
				"value": "1",
				"type": "Select",
				"label": "Category",
				"items": [
					{
						"title": 1,
						"key": 1
					},
					{
						"title": 2,
						"key": 2
					}
				]
			}
		};

		oManifest["sap.card"].data.request.parameters["$filter"] = "CategoryID eq {filters>/categoryId/value}";

		this.oCard.attachEventOnce("_ready", function () {
			Core.applyChanges();
			var oPaginator = this.oCard.getCardFooter().getPaginator();
			var oList = this.oCard.getCardContent().getInnerList();

			oPaginator.attachEventOnce("animationComplete", function () {
				assert.strictEqual(oPaginator.getPageNumber(), 1, "Page number should be 1");

				var oFilterBar = this.oCard.getAggregation("_filterBar");
				var oFilter = oFilterBar._getFilters()[0];

				oPaginator.attachEventOnce("animationComplete", function () {
					// Assert
					assert.strictEqual(oPaginator.getPageNumber(), 0, "Page number should have been reset to 0 after filter has changed");
					assert.strictEqual(oList.getItems()[0].getTitle(), "Name 0", "First page should be shown in the list");

					done();
				});

				// Act 2
				oFilter.getField().open();
				oFilter.getField().getItems()[1].$().trigger("tap");
			}.bind(this));

			// Act 1
			oPaginator.next();
		}.bind(this));

		this.oCard.setManifest(oManifest);
	});

	QUnit.module("Slice data", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Without data", function (assert) {

		// Arrange
		var done = assert.async();
		this.oCard.attachEventOnce("_ready", function () {
			Core.applyChanges();

			var oPaginator = this.oCard.getCardFooter().getPaginator();
			var oContent = this.oCard.getCardContent();

			// Assert
			oPaginator.next();
			assert.strictEqual(oContent.sliceData, undefined, "Slice data is not defined on the content when there is no data");

			done();
		}.bind(this));
		// Act
		this.oCard.setManifest(oManifestNoData);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});

	QUnit.test("With data", function (assert) {

		// Arrange
		var done = assert.async();
		this.oCard.attachEventOnce("_ready", function () {
			Core.applyChanges();

			var oPaginator = this.oCard.getCardFooter().getPaginator();
			var oContent = this.oCard.getCardContent();
			var oSliceDataSpy = this.spy(oContent, "sliceData");

			// Assert
			oPaginator.next();
			assert.strictEqual(typeof oContent.sliceData, "function", "Slice data is defined on the content when there is data");
			assert.ok(oSliceDataSpy.calledOnce, "Slice data is called on the content when there is data");

			done();
		}.bind(this));
		// Act
		this.oCard.setManifest(oManifestClientSideWithStaticData);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});
});