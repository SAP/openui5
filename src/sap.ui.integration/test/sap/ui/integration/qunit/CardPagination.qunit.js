/* global QUnit sinon */

sap.ui.define([
	"sap/base/util/deepExtend",
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Host",
	"sap/ui/integration/cards/BaseListContent",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function (
	deepExtend,
	Core,
	Card,
	Host,
	BaseListContent,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	function _nextCardContentDataChangedEvent(oCard) {
		return new Promise((resolve) => {
			oCard.attachEventOnce("_contentDataChange", resolve);
		});
	}

	function _nextPaginatorAnimationComplete(oPaginator) {
		return new Promise((resolve) => {
			oPaginator.attachEventOnce("animationComplete", resolve);
		});
	}

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
					"pageSize": 4,
					"visible": false
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

	var oManifestServerSideNoBindings = {
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
						"$skip": 2,
						"$top": 5
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

	var oManifestWithError = {
		"sap.app": {
			"id": "test.card.NoData"
		},
		"sap.card": {
			"type": "List2",
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
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
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

	QUnit.test("Pagination - client side with static data", async function (assert) {
		this.oCard.setManifest(oManifestClientSideWithStaticData);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oPaginator = this.oCard.getCardFooter().getPaginator(),
			oList = this.oCard.getCardContent().getInnerList(),
			oPaginatorModel = this.oCard.getModel("paginator");

		assert.ok(oPaginator, "paginator is created");
		assert.strictEqual(oPaginator.getPageNumber(), 0, "page number is correct");
		assert.strictEqual(oPaginator.getPageSize(), 4, "page size is correct");
		assert.strictEqual(oList.getItems().length, oPaginator.getPageSize(), "list items number is correct");
		assert.strictEqual(oPaginator.getPageCount(), 4, "page count is correct");
		assert.strictEqual(oPaginatorModel.getProperty("/skip"), 0, "initial value of '/skip' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/pageIndex"), 0, "initial value of '/pageIndex' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/size"), 4, "initial value of '/size' should be correct");

		// Act
		oPaginator.next();
		await nextUIUpdate();

		assert.strictEqual(this.oCard.getCardContent().getInnerList().getItems().length, oPaginator.getPageSize(), "list items number is correct");
		assert.strictEqual(oList.getItems()[0].getTitle(), "Name 5", "next page is shown");
		assert.strictEqual(oPaginatorModel.getProperty("/skip"), 4, "value of '/skip' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/pageIndex"), 1, "value of '/pageIndex' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/size"), 4, "value of '/size' should be correct");
	});

	QUnit.test("Paginator visibility", async function (assert) {
		this.oCard.setManifest(oManifestClientSideWithStaticData);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oPaginator = this.oCard.getCardFooter().getPaginator();

		assert.strictEqual(oPaginator.getVisible(), false, "paginator is not visible");
	});

	QUnit.test("Event stateChanged is fired", async function (assert) {
		var done = assert.async(),
			oHost = new Host();

		assert.expect(2);

		this.oCard.setHost(oHost);
		this.oCard.setManifest(oManifestClientSideWithStaticData);

		await nextCardReadyEvent(this.oCard);

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

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oPaginator = this.oCard.getCardFooter().getPaginator(),
			oList = this.oCard.getCardContent().getInnerList(),
			oFilterBar = this.oCard.getAggregation("_filterBar"),
			oFilter = oFilterBar._getFilters()[0];

		// Act - go to page 2
		oPaginator.next();

		// Assert - is on page 2
		assert.strictEqual(oPaginator.getPageNumber(), 1, "page number is correct");
		assert.strictEqual(oList.getItems()[0].getTitle(), "Name 5", "next page is shown");

		// Act - change filter
		oFilter.getField().open();
		oFilter.getField().getItems()[1].$().trigger("tap");

		await _nextPaginatorAnimationComplete(oPaginator);

		// Assert - is back to page 1
		assert.strictEqual(oPaginator.getPageNumber(), 0, "Page number should have been reset to 0 after filter has changed");
		assert.strictEqual(oList.getItems()[0].getTitle(), "Name 0", "First page should be shown in the list");

		// Act - go to page 2 again
		oPaginator.next();
		await nextUIUpdate();

		// Assert - is on page 2
		assert.strictEqual(oPaginator.getPageNumber(), 1, "page number is correct");
		assert.strictEqual(oList.getItems()[0].getTitle(), "Name 5", "next page is shown");
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

	QUnit.test("Pagination - server side", async function (assert) {
		this.oCard.setManifest(oManifestServerSide);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oPaginator = this.oCard.getCardFooter().getPaginator(),
			oList = this.oCard.getCardContent().getInnerList(),
			oPaginatorModel = this.oCard.getModel("paginator");

		assert.ok(oPaginator, "paginator is created");
		assert.strictEqual(oPaginator.getPageNumber(), 0, "page number is correct");
		assert.strictEqual(oPaginator.getPageSize(), 5, "page size is correct");
		assert.strictEqual(oPaginator.getPageCount(), 16, "page count is correct");
		assert.strictEqual(oList.getItems().length, oPaginator.getPageSize(), "list items number is correct");
		assert.strictEqual(oPaginatorModel.getProperty("/skip"), 0, "initial value of '/skip' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/pageIndex"), 0, "initial value of '/pageIndex' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/size"), 5, "initial value of '/size' should be correct");

		// Act
		oPaginator.next();

		await _nextCardContentDataChangedEvent(this.oCard);
		await nextUIUpdate();

		assert.strictEqual(this.oCard.getCardContent().getInnerList().getItems().length, oPaginator.getPageSize(), "list items number is correct");
		assert.strictEqual(oList.getItems()[0].getTitle(), "Name 5", "next page is shown");
		assert.strictEqual(oPaginatorModel.getProperty("/skip"), 5, "value of '/skip' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/pageIndex"), 1, "value of '/pageIndex' should be correct");
		assert.strictEqual(oPaginatorModel.getProperty("/size"), 5, "value of '/size' should be correct");
	});

	QUnit.test("Pagination - server side without bindings", async function (assert) {
		this.oCard.setManifest(oManifestServerSideNoBindings);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oPaginator = this.oCard.getCardFooter().getPaginator(),
			oList = this.oCard.getCardContent().getInnerList();

		assert.ok(oPaginator, "paginator is created");
		assert.strictEqual(oPaginator.getPageNumber(), 0, "page number is correct");
		assert.strictEqual(oPaginator.getPageSize(), 5, "page size is correct");
		assert.strictEqual(oPaginator.getPageCount(), 16, "page count is correct");

		assert.strictEqual(oList.getItems().length, oPaginator.getPageSize(), "list items number is correct");

		oPaginator.next();

		await _nextCardContentDataChangedEvent(this.oCard);
		await nextUIUpdate();

		assert.strictEqual(this.oCard.getCardContent().getInnerList().getItems().length, oPaginator.getPageSize(), "list items number is correct");
		assert.strictEqual(oList.getItems()[0].getTitle(), "Name 2", "same page is shown");
	});

	QUnit.test("Page is reset after data is refreshed", async function (assert) {
		this.oCard.setManifest(oManifestServerSide);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oPaginator = this.oCard.getCardFooter().getPaginator();
		var oList = this.oCard.getCardContent().getInnerList();

		// Act 1
		oPaginator.next();

		await _nextPaginatorAnimationComplete(oPaginator);

		assert.strictEqual(oPaginator.getPageNumber(), 1, "Page number should be 1");

		// Act
		this.oCard.refreshData();

		await _nextPaginatorAnimationComplete(oPaginator);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oPaginator.getPageNumber(), 0, "Page number should have been reset to 0 after refreshData()");
		assert.strictEqual(oList.getItems()[0].getTitle(), "Name 0", "First page should be shown in the list");
	});

	QUnit.test("Page is reset after filter has changed", async function (assert) {
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

		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oPaginator = this.oCard.getCardFooter().getPaginator();
		var oList = this.oCard.getCardContent().getInnerList();

		// Act
		oPaginator.next();

		await _nextPaginatorAnimationComplete(oPaginator);

		assert.strictEqual(oPaginator.getPageNumber(), 1, "Page number should be 1");

		var oFilterBar = this.oCard.getAggregation("_filterBar");
		var oFilter = oFilterBar._getFilters()[0];

		// Act
		oFilter.getField().open();
		oFilter.getField().getItems()[1].$().trigger("tap");

		await _nextPaginatorAnimationComplete(oPaginator);

		// Assert
		assert.strictEqual(oPaginator.getPageNumber(), 0, "Page number should have been reset to 0 after filter has changed");
		assert.strictEqual(oList.getItems()[0].getTitle(), "Name 0", "First page should be shown in the list");
	});

	QUnit.module("Slice data", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("When error message is displayed", async function (assert) {
		// Arrange
		this.oCard.setManifest(oManifestWithError);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oPaginator = this.oCard.getCardFooter().getPaginator();
		var oContent = this.oCard.getCardContent();

		// Act
		oPaginator.next();

		// Assert
		assert.strictEqual(oContent.sliceData, undefined, "Slice data is not defined on the content when there is error");
	});

	QUnit.test("With data", async function (assert) {
		// Arrange
		this.oCard.setManifest(oManifestClientSideWithStaticData);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oPaginator = this.oCard.getCardFooter().getPaginator();
		var oContent = this.oCard.getCardContent();
		var oSliceDataSpy = this.spy(oContent, "sliceData");

		// Act
		oPaginator.next();

		// Assert
		assert.strictEqual(typeof oContent.sliceData, "function", "Slice data is defined on the content when there is data");
		assert.ok(oSliceDataSpy.calledOnce, "Slice data is called on the content when there is data");
	});

	QUnit.test("No items", async function (assert) {
		// Arrange
		var oBaseListContentSpy = this.spy(BaseListContent.prototype, "getDataLength");

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "card.pagination.no.data.list.card"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"json": {
						"parameters": {
							"$format": "json",
							"$top": 0
						}
					},
					"path": "/value"
				},
				"header": {
					"title": "Products",
					"subTitle": "In Stock Information"
				},
				"content": {
					"item": {
						"title": "{ProductName}",
						"description": "{UnitsInStock} units in stock",
						"highlight": "{= ${Discontinued} ? 'Error' : 'Success'}"
					}
				},
				"footer": {
					"paginator": {
						"pageSize": 5
					}
				}
			}
		});

		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oPaginator = this.oCard.getCardFooter().getPaginator();

		assert.strictEqual(oBaseListContentSpy.callCount, 0, "The getDataLength method is not called" );
		assert.notOk(oPaginator.$().find(".sapMCrslBulleted span").length, "dots are not rendered");
		assert.notOk(oPaginator.getDomRef(), "paginator is not rendered when there are no items");

		var $numericIndicator = oPaginator.$().find(".sapMCrslNumeric span");
		assert.notOk($numericIndicator.length, "numeric indicator is not rendered");
	});
});