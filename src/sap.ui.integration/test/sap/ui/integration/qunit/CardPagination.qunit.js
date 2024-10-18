/* global QUnit, sinon */

sap.ui.define([
	"sap/base/util/deepExtend",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Host",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"qunit/testResources/nextCardDataReadyEvent",
	"qunit/testResources/nextCardManifestAppliedEvent",
	"sap/base/util/Deferred"
], function (
	deepExtend,
	Card,
	Host,
	nextUIUpdate,
	nextCardReadyEvent,
	nextCardDataReadyEvent,
	nextCardManifestAppliedEvent,
	Deferred
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

	function _nextScrollEvent(oCard) {
		return new Promise((resolve) => {
			oCard.getDomRef("contentSection").addEventListener("scroll", resolve, { once: true });
		});
	}

	async function openPaginationCard(oCard) {
		oCard.getCardFooter().getAggregation("_showMore").$().trigger("tap");
		const oDialog = oCard.getDependents()[0];
		const oPaginationCard = oDialog.getContent()[0];

		const afterOpenDeferred = new Deferred();
		oDialog.attachEventOnce("afterOpen", afterOpenDeferred.resolve);

		await Promise.all([afterOpenDeferred.promise, nextCardReadyEvent(oPaginationCard)]);

		return oPaginationCard;
	}

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

	var oManifestClientSideSinglePage = {
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
						}
					]
				},
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
				"title": "Products"
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

	var oManifestServerSideSinglePage = {
		"sap.app": {
			"id": "test5"
		},
		"sap.card": {
			"type": "List",
			"data": {
				"request": {
					"url": "/fakeService/getProducts",
					"method": "GET",
					"parameters": {
						"$format": "json",
						"$skip": "{paginator>/skip}",
						"$top": 5
					}
				},
				"path": "/value"
			},
			"header": {
				"title": "Products"
			},
			"content": {
				"item": {
					"title": "{ProductName}"
				}
			},
			"footer": {
				"paginator": {
					"totalCount": 5,
					"pageSize": 5
				}
			}
		}
	};

	QUnit.module("'Show More' rendering", {
		beforeEach: async function () {
			this.oCard = new Card({
				manifest: oManifestClientSideWithStaticData
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("'Show More' is displayed the main card", function (assert) {
		assert.ok(this.oCard.getCardFooter().getAggregation("_showMore").getDomRef(), "'Show More' is rendered");
	});

	QUnit.test("'Close' is displayed in the paginated card", async function (assert) {
		// Arrange & Act
		const oPaginatedCard = await openPaginationCard(this.oCard);

		await nextUIUpdate();

		// Assert
		assert.ok(oPaginatedCard.getCardFooter().getAggregation("_closeButton").getDomRef(), "'Close' is rendered");
	});

	QUnit.module("Client-Side Pagination", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			this.oServer = sinon.createFakeServer({
				autoRespond: true,
				respondImmediately: true
			});

			this.oServer.respondWith("GET", /fakeService\/getOrders/, function (oXhr) {
				const aDataItems = [];
				const filter = new URL(oXhr.url, window.location.origin).searchParams.get("$filter") || "";

				for (let i = 0; i < 50; i++) {
					aDataItems.push({
						ShipName: "Name " + i + filter
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

	QUnit.test("Pagination - client side with static data", async function (assert) {
		this.oCard.setManifest(oManifestClientSideWithStaticData);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oPaginator = this.oCard._oPaginator,
			oList = this.oCard.getCardContent().getInnerList(),
			oPaginatorModel = this.oCard.getModel("paginator");

		assert.ok(oPaginator, "paginator is created");
		assert.strictEqual(oPaginator._iPageNumber, 0, "page number is correct");
		assert.strictEqual(oPaginator.getPageSize(), 4, "page size is correct");
		assert.strictEqual(oList.getItems().length, oPaginator.getPageSize(), "list items number is correct");
		assert.strictEqual(oPaginatorModel.getProperty("/skip"), 0, "initial value of '/skip' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/pageIndex"), 0, "initial value of '/pageIndex' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/size"), 4, "initial value of '/size' should be correct");

		// Act
		const oPaginatedCard = await openPaginationCard(this.oCard);
		await nextUIUpdate();
		const oPaginatedCardPaginator = oPaginatedCard._oPaginator;
		const oPaginatedCardList = oPaginatedCard.getCardContent().getInnerList();

		assert.ok(oPaginatedCardPaginator, "paginator is created");
		assert.strictEqual(oPaginatedCardPaginator._iPageNumber, 0, "page number is correct");
		assert.strictEqual(oPaginatedCardPaginator.getPageSize(), 4, "page size is correct");
		assert.strictEqual(oPaginatedCardPaginator._iPageCount, 4, "page count is correct");
		assert.strictEqual(oPaginatedCardList.getItems().length, 13, "all list items should be created");
		assert.strictEqual(oPaginatorModel.getProperty("/skip"), 0, "initial value of '/skip' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/pageIndex"), 0, "initial value of '/pageIndex' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/size"), 4, "initial value of '/size' should be correct");
	});

	QUnit.test("Pagination - client side with single page", async function (assert) {
		this.oCard.setManifest(oManifestClientSideSinglePage);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		assert.notOk(this.oCard.getCardFooter().getAggregation("_showMore").getDomRef(), "'Show More' is not rendered when single page");
	});

	QUnit.test("Pagination - client side with no data", async function (assert) {
		this.oCard.setManifest({
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
						"json": []
					},
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
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		assert.notOk(this.oCard.getCardFooter().getAggregation("_showMore").getDomRef(), "'Show More' is not rendered when there is no data");
	});

	QUnit.test("Event stateChanged is fired", async function (assert) {
		const done = assert.async(),
			oHost = new Host();

		assert.expect(2);

		this.oCard.setHost(oHost);
		this.oCard.setManifest(oManifestClientSideWithStaticData);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		this.oCard.attachEventOnce("stateChanged", function () {
			assert.ok(true, "stateChanged is called after page change");
		});

		oHost.attachEventOnce("cardStateChanged", function () {
			assert.ok(true, "cardStateChanged for host is called after page change");

			// Clean up
			oHost.destroy();
			done();
		});

		// Act
		openPaginationCard(this.oCard);
	});

	QUnit.test("Pagination - client side with dynamic data and filter", async function (assert) {
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
							"$filter": "ShipperID eq {filters>/shipper/value}"
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
					}
				},
				"footer": {
					"paginator": {
						"pageSize": 5
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oPaginationCard = await openPaginationCard(this.oCard);
		await nextUIUpdate();
		const oFilterBar = oPaginationCard.getAggregation("_filterBar"),
			oFilter = oFilterBar._getFilters()[0];
		let oList = oPaginationCard.getCardContent().getInnerList();

		// Assert
		assert.strictEqual(oList.getItems()[0].getTitle(), "Name 0ShipperID eq 1", "First page should be shown in the list");

		// Act - change filter
		oFilter.getField().open();
		oFilter.getField().getItems()[1].$().trigger("tap");

		await nextCardDataReadyEvent(oPaginationCard);
		await nextUIUpdate();
		oList = oPaginationCard.getCardContent().getInnerList();

		// Assert
		assert.strictEqual(oList.getItems()[0].getTitle(), "Name 0ShipperID eq 2", "First page should be shown in the list");
	});

	QUnit.test("Pagination - client side with maxItems set", async function (assert) {
		const iMaxItems = 2;
		const oManifest = deepExtend({}, oManifestClientSideWithStaticData);
		deepExtend(oManifest, {
			"sap.card": {
				"content": {
					"maxItems": iMaxItems
				}
			}
		});

		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oPaginator = this.oCard._oPaginator,
			oList = this.oCard.getCardContent().getInnerList(),
			oPaginatorModel = this.oCard.getModel("paginator");

		assert.ok(oPaginator, "paginator is created");
		assert.strictEqual(oList.getItems().length, iMaxItems, "list items number is correct");

		// Act
		const oPaginatedCard = await openPaginationCard(this.oCard);
		await nextUIUpdate();
		const oPaginatedCardPaginator = oPaginatedCard._oPaginator;
		const oPaginatedCardList = oPaginatedCard.getCardContent().getInnerList();

		assert.ok(oPaginatedCardPaginator, "paginator is created");
		assert.strictEqual(oPaginatedCardPaginator._iPageNumber, 0, "page number is correct");
		assert.strictEqual(oPaginatedCardPaginator.getPageSize(), 4, "page size is correct");
		assert.strictEqual(oPaginatedCardPaginator._iPageCount, 4, "page count is correct");
		assert.strictEqual(oPaginatedCardList.getItems().length, 13, "all list items should be created");
		assert.strictEqual(oPaginatorModel.getProperty("/skip"), 0, "initial value of '/skip' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/pageIndex"), 0, "initial value of '/pageIndex' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/size"), 4, "initial value of '/size' should be correct");
	});

	QUnit.module("Server-Side Pagination", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			this.oServer = sinon.createFakeServer({
				autoRespond: true,
				respondImmediately: true
			});

			this.oServer.respondWith("GET", /fakeService\/getProducts/, function (oXhr) {
				const oUrl = new URL(decodeURIComponent(oXhr.url), window.location.href),
					iSkip = parseInt(oUrl.searchParams.get("$skip") || 0),
					iTop = parseInt(oUrl.searchParams.get("$top")),
					aDataItems = [],
					iTotalCount = 77;

				for (let i = 0; i < iTotalCount; i++) {
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

			this.oServer.respondWith("GET", /fakeService\/getProductsNoData/, function (oXhr) {
				oXhr.respond(200, {
					"Content-Type": "application/json"
				}, JSON.stringify({
					"value": [],
					"@odata.count": 0
				}));
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oServer.restore();
		}
	});

	QUnit.test("Pagination - server side", async function (assert) {
		this.oCard.setManifest(oManifestServerSide);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oPaginator = this.oCard._oPaginator,
			oList = this.oCard.getCardContent().getInnerList(),
			oPaginatorModel = this.oCard.getModel("paginator");

		assert.ok(oPaginator, "paginator is created");
		assert.strictEqual(oPaginator._iPageNumber, 0, "page number is correct");
		assert.strictEqual(oPaginator.getPageSize(), 5, "page size is correct");
		assert.strictEqual(oList.getItems().length, oPaginator.getPageSize(), "list items number is correct");
		assert.strictEqual(oPaginatorModel.getProperty("/skip"), 0, "initial value of '/skip' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/pageIndex"), 0, "initial value of '/pageIndex' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/size"), 5, "initial value of '/size' should be correct");

		// Act
		const oPaginatedCard = await openPaginationCard(this.oCard);
		await nextUIUpdate();
		const oPaginatedCardPaginator = oPaginatedCard._oPaginator;
		const oPaginatedCardList = oPaginatedCard.getCardContent().getInnerList();

		assert.ok(oPaginatedCardPaginator, "paginator is created");
		assert.strictEqual(oPaginatedCardPaginator.getPageSize(), 5, "page size is correct");
		assert.strictEqual(oPaginatedCardPaginator._iPageCount, 16, "page count is correct");
		assert.ok(oPaginatedCardList.getItems().length > oPaginator.getPageSize(), "More list items should be displayed in the pagination card");
		assert.strictEqual(oPaginatorModel.getProperty("/skip"), 0, "initial value of '/skip' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/pageIndex"), 0, "initial value of '/pageIndex' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/size"), 5, "initial value of '/size' should be correct");
	});

	QUnit.test("Pagination - server side with single page", async function (assert) {
		this.oCard.setManifest(oManifestServerSideSinglePage);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		assert.notOk(this.oCard.getCardFooter().getAggregation("_showMore").getDomRef(), "'Show More' is not rendered when single page");
	});

	QUnit.test("Pagination - server side with no data", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test5"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"request": {
						"url": "/fakeService/getProductsNoData",
						"method": "GET"
					}
				},
				"header": {
					"title": "Products"
				},
				"content": {
					"item": {
						"title": "{ProductName}"
					}
				},
				"footer": {
					"paginator": {
						"totalCount": 5,
						"pageSize": 5
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		assert.notOk(this.oCard.getCardFooter().getAggregation("_showMore").getDomRef(), "'Show More' is not rendered when single page");
	});

	QUnit.test("Pagination - server side without bindings", async function (assert) {
		this.oCard.setManifest({
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
							"$top": "{paginator>/size}"
						}
					},
					"path": "/value"
				},
				"header": {
					"title": "Products"
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
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oPaginator = this.oCard._oPaginator,
			oList = this.oCard.getCardContent().getInnerList();

		assert.ok(oPaginator, "paginator is created");
		assert.strictEqual(oPaginator._iPageNumber, 0, "page number is correct");
		assert.strictEqual(oPaginator.getPageSize(), 5, "page size is correct");
		assert.strictEqual(oList.getItems().length, oPaginator.getPageSize(), "list items number is correct");

		// Act
		const oPaginatedCard = await openPaginationCard(this.oCard);
		const oPaginatedCardPaginator = oPaginatedCard._oPaginator;
		const oPaginatedCardList = oPaginatedCard.getCardContent().getInnerList();

		await nextUIUpdate();

		assert.strictEqual(oPaginatedCardPaginator.getPageCount(), 16, "page count is correct");
		assert.ok(oPaginatedCardList.getItems().length >= oPaginator.getPageSize(), "list items number is correct - same or larger then the page size");
		assert.strictEqual(oPaginatedCardList.getItems()[0].getTitle(), "Name 0", "same page is shown");
	});

	QUnit.test("Page is reset after data is refreshed", async function (assert) {
		let firstPageRequestCount = 0;

		this.oServer.respondWith("GET", /fakeService\/getProductsWithDataRefresh/, function (oXhr) {
			const oUrl = new URL(decodeURIComponent(oXhr.url), window.location.href),
				iSkip = parseInt(oUrl.searchParams.get("$skip")) || 0,
				iTop = parseInt(oUrl.searchParams.get("$top")),
				aDataItems = [],
				iTotalCount = 77;

			if (iSkip === 0) {
				firstPageRequestCount++;
			}

			for (let i = 0; i < 77; i++) {
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

		const oManifest = deepExtend({}, oManifestServerSide);

		oManifest["sap.card"].data.request.url = "/fakeService/getProductsWithDataRefresh";

		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();
		firstPageRequestCount = 0;
		const oPaginatedCard = await openPaginationCard(this.oCard);

		// Assert
		assert.strictEqual(firstPageRequestCount, 1, "First page should be requested once");

		// Act
		oPaginatedCard.refreshData();
		await nextCardDataReadyEvent(oPaginatedCard);

		// Assert
		assert.strictEqual(firstPageRequestCount, 2, "First page should be requested again after data refresh");
	});

	QUnit.test("Page is reset after filter has changed", async function (assert) {
		let firstFilterFirstPageRequested = false;
		let secondFilterFirstPageRequested = false;

		this.oServer.respondWith("GET", /fakeService\/getProductsWithFilter/, function (oXhr) {
			const oUrl = new URL(decodeURIComponent(oXhr.url), window.location.href),
				iSkip = parseInt(oUrl.searchParams.get("$skip") || 0),
				iTop = parseInt(oUrl.searchParams.get("$top")),
				sFilter = oUrl.searchParams.get("$filter"),
				aDataItems = [],
				iTotalCount = 77;

			if (sFilter === "1" && iSkip === 0) {
				firstFilterFirstPageRequested = true;
			}

			if (sFilter === "2" && iSkip === 0) {
				secondFilterFirstPageRequested = true;
			}

			for (let i = 0; i < 77; i++) {
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

		const oManifest = deepExtend({}, oManifestServerSide);

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

		oManifest["sap.card"].data = {
			"request": {
				"url": "/fakeService/getProductsWithFilter",
				"method": "GET",
				"parameters": {
					"$format": "json",
					"$count": true,
					"$skip": "{paginator>/skip}",
					"$top": "{parameters>/top/value}",
					"$filter": "{filters>/categoryId/value}"
				}
			},
			"path": "/value"
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();
		firstFilterFirstPageRequested = false;
		const oPaginatedCard = await openPaginationCard(this.oCard);

		// Assert
		assert.ok(firstFilterFirstPageRequested, "First page should be requested for the first filter");

		const oFilterBar = oPaginatedCard.getAggregation("_filterBar");
		const oFilter = oFilterBar._getFilters()[0];

		// Act
		oFilter.getField().open();
		oFilter.getField().getItems()[1].$().trigger("tap");
		await nextCardDataReadyEvent(oPaginatedCard);

		// Assert
		assert.ok(secondFilterFirstPageRequested, "First page should be requested for the second filter");
	});

	QUnit.test("Initial load of data", async function (assert) {
		const done = assert.async();
		this.oCard.setManifest(oManifestServerSide);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Act
		this.oCard.getCardFooter().getAggregation("_showMore").$().trigger("tap");
		const oDialog = this.oCard.getDependents()[0];
		const oPaginationCard = oDialog.getContent()[0];
		await nextCardManifestAppliedEvent(oPaginationCard);
		const oLoadMoreSpy = this.spy(oPaginationCard._oPaginator, "_loadMore");

		oPaginationCard.attachEventOnce("_ready", () => {
			assert.ok(oLoadMoreSpy.callCount >= 1, "At least 1 more page should be loaded before _ready event of the card is fired");
			done();
		});
	});

	QUnit.test("Pagination - server side with maxItems", async function (assert) {
		const iMaxItems = 2;
		const oManifest = deepExtend({}, oManifestServerSide);
		deepExtend(oManifest, {
			"sap.card": {
				"content": {
					"maxItems": iMaxItems
				}
			}
		});

		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oPaginator = this.oCard._oPaginator,
			oList = this.oCard.getCardContent().getInnerList(),
			oPaginatorModel = this.oCard.getModel("paginator");

		assert.ok(oPaginator, "paginator is created");
		assert.strictEqual(oList.getItems().length, iMaxItems, "list items number is correct");

		// Act
		const oPaginatedCard = await openPaginationCard(this.oCard);
		await nextUIUpdate();
		const oPaginatedCardPaginator = oPaginatedCard._oPaginator;
		const oPaginatedCardList = oPaginatedCard.getCardContent().getInnerList();

		assert.ok(oPaginatedCardPaginator, "paginator is created");
		assert.strictEqual(oPaginatedCardPaginator.getPageSize(), 5, "page size is correct");
		assert.strictEqual(oPaginatedCardPaginator._iPageCount, 16, "page count is correct");
		assert.ok(oPaginatedCardList.getItems().length > oPaginator.getPageSize(), "More list items should be displayed in the pagination card");
		assert.strictEqual(oPaginatorModel.getProperty("/skip"), 0, "initial value of '/skip' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/pageIndex"), 0, "initial value of '/pageIndex' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/size"), 5, "initial value of '/size' should be correct");
	});

	QUnit.module("Busy indicator", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			this.oServer = sinon.createFakeServer({
				autoRespond: true
			});

			this.oServer.respondWith("GET", /fakeService\/getProducts/, function (oXhr) {
				const oUrl = new URL(decodeURIComponent(oXhr.url), window.location.href),
					iSkip = parseInt(oUrl.searchParams.get("$skip") || 0),
					iTop = parseInt(oUrl.searchParams.get("$top")),
					aDataItems = [],
					iTotalCount = 77;

				for (let i = 0; i < iTotalCount; i++) {
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

	QUnit.test("Loading placeholders in main card", async function (assert) {
		// Arrange
		const oManifest = deepExtend({}, oManifestServerSide);
		delete oManifest["sap.card"].data;
		oManifest["sap.card"].content.data = {
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
		};

		// Act
		this.oCard.setManifest(oManifest);
		this.oServer.autoRespond = false;
		await nextCardManifestAppliedEvent(this.oCard);
		await nextUIUpdate();
		const oLoadingPlaceholder = this.oCard.getCardContent().getAggregation("_loadingPlaceholder");

		// Assert
		assert.ok(oLoadingPlaceholder.getDomRef(), "Loading placeholder is rendered in the main card");
		assert.strictEqual(oLoadingPlaceholder.getMinItems(), 5, "Loading placeholder items count is correct");

		// Clean up
		this.oServer.autoRespond = true;
	});

	QUnit.test("Busy indicator", async function (assert) {
		this.oCard.setManifest(oManifestServerSide);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Act - open pagination card
		const oPaginatedCard = await openPaginationCard(this.oCard);
		const oPaginatedCardPaginator = oPaginatedCard._oPaginator;
		await nextUIUpdate();

		// Assert
		assert.notOk(oPaginatedCardPaginator.isLoadingMore(), "'isLoadingMore' is false after initial load has completed");
		assert.ok(oPaginatedCard.getDomRef("contentSection").scrollHeight > oPaginatedCard.getDomRef("contentSection").clientHeight, "There is scrollbar");

		// Act - scroll to the bottom of paginated card
		oPaginatedCard.getDomRef("contentSection").scrollTo(0, 1000);
		await _nextScrollEvent(oPaginatedCard);
		await nextUIUpdate();

		// Assert
		assert.ok(oPaginatedCardPaginator._oBusyIndicator.getDomRef(), "Busy indicator is rendered while loading more");
		assert.ok(oPaginatedCardPaginator.isLoadingMore(), "'isLoadingMore' is true while loading more");

		// Act - respond to the request for the next page
		await nextCardDataReadyEvent(oPaginatedCard);
		await nextUIUpdate();

		// Assert
		assert.notOk(oPaginatedCardPaginator._oBusyIndicator.getDomRef(), "Busy indicator is not rendered after loading more has completed");
		assert.notOk(oPaginatedCardPaginator.isLoadingMore(), "'isLoadingMore' is false after loading more has completed");
	});
});