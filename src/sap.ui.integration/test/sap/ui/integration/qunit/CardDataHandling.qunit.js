/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/DataProvider",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/util/ServiceDataProvider",
	"sap/ui/integration/cards/Header",
	"sap/ui/integration/cards/BaseContent",
	"sap/ui/integration/library",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
],
function(
	Card,
	DataProvider,
	RequestDataProvider,
	ServiceDataProvider,
	Header,
	BaseContent,
	library,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oManifest_CardCase1 = {
		"sap.app": {
			"id": "test.card.dataHandling.card1"
		},
		"sap.card": {
			"type": "List",
			"data": {
				"json": {
					"key": "value"
				}
			}
		}
	};
	var oManifest_CardCase2 = {
		"sap.app": {
			"id": "test.card.dataHandling.card2"
		},
		"sap.card": {
			"type": "List",
			"data": {
				"request": {
					"url": "some/relative/url"
				}
			}
		}
	};
	var oManifest_CardCase3 = {
		"sap.app": {
			"id": "test.card.dataHandling.card3"
		},
		"sap.card": {
			"type": "List"
		}
	};
	var oManifest_CardCase4 = {
		"sap.app": {
			"id": "test.card.dataHandling.card4"
		},
		"sap.card": {
			"type": "List",
			"data": {
				"service": "UserRecent"
			}
		}
	};
	var oManifest_CardCase5 = {
		"sap.app": {
			"id": "test.card.dataHandling.card5"
		},
		"sap.card": {
			"type": "List",
			"data": {
				"json": {
					"data": {
						"generalInfo": {
							"title": "Some title",
							"subtitle": "Some subtitle"
						},
						"someItems": [
							{
								"id": 1,
								"Name": "Test product"
							},
							{
								"id": 2,
								"Name": "Another product"
							}
						]
					}
				}
			},
			"header": {
				"data": {
					"path": "/data/generalInfo"
				},
				"title": "{title}",
				"subTitle": "{subtitle}"
			},
			"content": {
				"data": {
					"path": "/data/someItems"
				},
				"item": {
					"title": {
						"label": "Title",
						"value": "{Name}"
					}
				}
			}
		}
	};
	var oManifest_CardCase_OverridingModel = {
		"sap.app": {
			"id": "test.card.dataHandling.card6"
		},
		"sap.card": {
			"type": "List",
			"data": {
				"json": {
					"data": {
						"generalInfo": {
							"title": "Some title",
							"subtitle": "Some subtitle"
						},
						"someItems": [
							{
								"id": 1,
								"Name": "Test product"
							},
							{
								"id": 2,
								"Name": "Another product"
							}
						]
					}
				}
			},
			"header": {
				"data": {
					"json": {
						"information": {
							"title": "Something",
							"subtitle": "Something 2"
						}
					},
					"path": "/information"
				},
				"title": "{title}",
				"subTitle": "{subtitle}"
			},
			"content": {
				"data": {
					"json": {
						"items": [
							{
								"id": 3,
								"Name": "Product 1"
							},
							{
								"id": 4,
								"Name": "Product 2"
							}
						]
					},
					"path": "/items"
				},
				"item": {
					"title": {
						"label": "Title",
						"value": "{Name}"
					}
				}
			}
		}
	};
	var oManifest_HeaderCase1 = {
		"sap.app": {
			"id": "test.card.dataHandling.card7"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"data": {
					"service": "UserRecent"
				}
			}
		}
	};
	var oManifest_HeaderCase2 = {
		"sap.app": {
			"id": "test.card.dataHandling.card8"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Some title",
				"subTitle": "Some subtitle"
			}
		}
	};
	var oManifest_HeaderCase3 = {
		"sap.app": {
			"id": "test.card.dataHandling.card9"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"data": {
					"json": {
						"key": "value"
					}
				}
			}
		}
	};
	var oManifest_HeaderCase4 = {
		"sap.app": {
			"id": "test.card.dataHandling.card10"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"data": {
					"request": {
						"url": "some/relative/url"
					}
				}
			}
		}
	};
	var oManifest_HeaderCase5 = {
		"sap.app": {
			"id": "test.card.dataHandling.card11"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Header Title"
			}
		}
	};
	var oManifest_ContentCase1 = {
		"sap.app": {
			"id": "test.card.dataHandling.card12"
		},
		"sap.card": {
			"type": "List",
			"content": {
				"data": {
					"service": "UserRecent"
				},
				"item": {
					"title": {
						"value": "Gery"
					}
				}
			}
		}
	};
	var oManifest_ContentCase2 = {
		"sap.app": {
			"id": "test.card.dataHandling.card13"
		},
		"sap.card": {
			"type": "List",
			"content": {
				"item": {
					"title": {
						"label": "Title",
						"value": "{Name}"
					}
				}
			}
		}
	};
	var oManifest_ContentCase3 = {
		"sap.app": {
			"id": "test.card.dataHandling.card14"
		},
		"sap.card": {
			"type": "List",
			"content": {
				"data": {
					"json": {
						"key": "value"
					}
				},
				"item": {
					"title": {
						"label": "Title",
						"value": "{Name}"
					}
				}
			}
		}
	};
	var oManifest_ContentCase4 = {
		"sap.app": {
			"id": "test.card.dataHandling.card15"
		},
		"sap.card": {
			"type": "List",
			"content": {
				"data": {
					"request": {
						"url": "some/relative/url"
					}
				},
				"item": {
						"title": {
							"label": "Title",
							"value": "{Name}"
						}
					}
			}
		}
	};
	var oManifest_ContentCase5 = {
		"sap.app": {
			"id": "test.card.dataHandling.card16"
		},
		"sap.card": {
			"type": "List",
			"content": {
				"item": {
					"title": {
						"label": "Title",
						"value": "{Name}"
					}
				}
			}
		}
	};

	var oManifest_NamedDataSections = {
		"sap.app": {
			"id": "test.card.data.handling"
		},
		"sap.card": {
			"type": "List",
			"data": {
				"name": "testCard"
			},
			"header": {
				"data": {
					"name": "testHeader"
				},
				"title": "{testHeader>/title}",
				"subTitle": "{testCard>/subtitle}"
			},
			"content": {
				"data": {
					"name": "testContent",
					"path": "testContent>/items"
				},
				"item": {
					"title": "{testContent>name}"
				}
			}
		}
	};

	var oManifest_ModelSizeLimit = {
		"sap.card": {
			"type": "List",
			"configuration": {
				"modelSizeLimit": 2,
				"filters": {
					"shipper": {
						"type": "Select",
						"label": "Shipper",
						"item": {
							"template": {
								"key": "{name}",
								"title": "{name}"
							}
						},
						"data": {
							"json": [
								{ "name": "Name 1" },
								{ "name": "Name 2" },
								{ "name": "Name 3" },
								{ "name": "Name 4" },
								{ "name": "Name 5" },
								{ "name": "Name 6" },
								{ "name": "Name 7" },
								{ "name": "Name 8" },
								{ "name": "Name 9" },
								{ "name": "Name 10" }
							]
						}
					}
				}
			},
			"data": {
				"json": [
					{ "name": "Name 1" },
					{ "name": "Name 2" },
					{ "name": "Name 3" },
					{ "name": "Name 4" },
					{ "name": "Name 5" },
					{ "name": "Name 6" },
					{ "name": "Name 7" },
					{ "name": "Name 8" },
					{ "name": "Name 9" },
					{ "name": "Name 10" }
				]
			},
			"header": {
				"title": "Title"
			},
			"content": {
				"item": {
					"title": "{name}"
				}
			}
		}
	};

	function testServiceOrRequestSection(sName, sTestTitle, oManifest, bShouldFail) {
		QUnit.test(sTestTitle, async function (assert) {
			var sMessage = "Should set data when there is a data service.";

			this.bTriggerFailure = !!bShouldFail;
			var oExpectedData = this.oData;
			if (this.bTriggerFailure) {
				oExpectedData = {};
				sMessage = "Should NOT set data when the service fails.";
			}

			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oControlToTest = this.oCard;
			if (sName === "Header") {
				oControlToTest = this.oCard.getAggregation("_header");
			} else if (sName === "Content") {
				oControlToTest = this.oCard.getAggregation("_content");
			}

			// Assert
			assert.notOk(oControlToTest.isLoading(), 'control is not loading any more');
			assert.deepEqual(oControlToTest.getModel().getData(), oExpectedData, sMessage);
		});
	}

	function testNoDataSection(sName, sTestTitle, oManifest) {
		QUnit.test(sTestTitle, async function (assert) {
			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oControlToTest = this.oCard;
			if (sName === "Header") {
				oControlToTest = this.oCard.getAggregation("_header");
			} else if (sName === "Content") {
				oControlToTest = this.oCard.getAggregation("_content");
			}

			// Assert
			assert.notOk(oControlToTest.isLoading(), 'control is not loading any more');
			assert.notOk(oControlToTest.getModel().getData().length, "Should have empty model when there is no data section.");
		});
	}

	function testStaticDataSection(sName, sTestTitle, oManifest) {
		QUnit.test(sTestTitle, async function (assert) {
			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oControlToTest = this.oCard;
			var oData = oManifest["sap.card"]["data"];
			if (sName === "Header") {
				oControlToTest = this.oCard.getAggregation("_header");
				oData = oManifest["sap.card"]["header"]["data"];
			} else if (sName === "Content") {
				oControlToTest = this.oCard.getAggregation("_content");
				oData = oManifest["sap.card"]["content"]["data"];
			}

			// Assert
			assert.notOk(oControlToTest.isLoading(), 'control is not loading any more');
			assert.deepEqual(oControlToTest.getModel().getData(), oData["json"], "Should set correct data model.");
		});
	}

	function testDataChanged(sName, sTestTitle, oManifest) {
		QUnit.test(sTestTitle, async function (assert) {
			// Arrange
			var done = assert.async();

			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oControlToTest = this.oCard;
			if (sName === "Header") {
				oControlToTest = this.oCard.getAggregation("_header");
			} else if (sName === "Content") {
				oControlToTest = this.oCard.getAggregation("_content");
			}

			// Assert
			assert.deepEqual(oControlToTest.getModel().getData(), this.oData, "Should set data when there is a data service.");

			var oNewData = { test: "Test" };

			oControlToTest._oDataProvider.fireDataChanged({ data: oNewData });
			assert.notOk(oControlToTest.isLoading(), 'control is not loading any more');

			setTimeout(function () {
				assert.deepEqual(oControlToTest.getModel().getData(), oNewData, "Should update data on data changed event.");
				done();
			});
		});
	}

	function testDataError(sName, sTestTitle, oManifest) {
		QUnit.test(sTestTitle, async function (assert) {

			// Arrange
			this.bTriggerFailure = true;
			this._fnHandleErrorStub.restore();
			var fnCardFireEventSpy = sinon.spy(Card.prototype, "fireEvent");
			var fnHeaderFireEventSpy = sinon.spy(Header.prototype, "fireEvent");
			var fnContentFireEventSpy = sinon.spy(BaseContent.prototype, "fireEvent");

			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var _fnSpy = fnCardFireEventSpy;
			if (sName === "Header") {
				_fnSpy = fnHeaderFireEventSpy;
			} else if (sName === "Content") {
				_fnSpy = fnContentFireEventSpy;
			}

			// Assert
			assert.ok(_fnSpy.calledWith("_error"), "Should fire _error event when DataProvider fires an error.");

			// Cleanup
			fnCardFireEventSpy.restore();
			fnHeaderFireEventSpy.restore();
			fnContentFireEventSpy.restore();
		});
	}

	function testDataReady(sName, sTestTitle, oManifest, bShouldFail) {
		QUnit.test(sTestTitle, async function (assert) {
			// Arrange
			this.bTriggerFailure = !!bShouldFail;
			this._fnHandleErrorStub.restore();
			var fnHeaderFireEventSpy = sinon.spy(Header.prototype, "fireEvent");
			var fnContentFireEventSpy = sinon.spy(BaseContent.prototype, "fireEvent");

			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			var _fnSpy = fnHeaderFireEventSpy;
			if (sName === "Content") {
				_fnSpy = fnContentFireEventSpy;
			}

			// Assert
			assert.ok(_fnSpy.calledWith("_dataReady"), "Should fire _dataReady event when data is ready.");

			// Cleanup
			fnHeaderFireEventSpy.restore();
			fnContentFireEventSpy.restore();
		});
	}

	QUnit.module("Data Handling", {
		beforeEach: function () {
			var fnFake = function () {
				if (this.bTriggerFailure) {
					return Promise.reject("Some error message.");
				} else {
					return Promise.resolve(this.oData);
				}
			}.bind(this);

			this.bTriggerFailure = false;
			this.oCard = new Card();
			this.oData = {
				"key1": "value1",
				"key2": "value2"
			};
			this._fnRequestStub = sinon.stub(RequestDataProvider.prototype, "getData").callsFake(fnFake);
			this._fnServiceStub = sinon.stub(ServiceDataProvider.prototype, "getData").callsFake(fnFake);
			this._fnStub = sinon.stub(ServiceDataProvider.prototype, "createServiceInstances");
			this._fnHandleErrorStub = sinon.stub(Card.prototype, "_handleError");
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.oData = null;
			this._fnRequestStub.restore();
			this._fnServiceStub.restore();
			this._fnStub.restore();
			this._fnHandleErrorStub.restore();
			this.bTriggerFailure = false;
		}
	});

	// Consistency tests. Header, Card and Content data sections should work the same:

	// Card level data section testing
	testServiceOrRequestSection("Card", "Card with service - success", oManifest_CardCase4);
	testServiceOrRequestSection("Card", "Card with service - failure", oManifest_CardCase4, true);
	testServiceOrRequestSection("Card", "Card level data section with successful request", oManifest_CardCase2);
	testServiceOrRequestSection("Card", "Card level data section with failing request", oManifest_CardCase2, true);
	testStaticDataSection("Card", "Card level data section with static JSON", oManifest_CardCase1);
	testNoDataSection("Card", "Card with NO data section", oManifest_CardCase3);
	testDataChanged("Card", "Card DataProvider triggers data changed", oManifest_CardCase4);
	testDataError("Card", "Card DataProvider fires error", oManifest_CardCase4);

	// Header level data section testing
	testServiceOrRequestSection("Header", "Header with service - success", oManifest_HeaderCase1);
	testServiceOrRequestSection("Header", "Header with service - failure", oManifest_HeaderCase1, true);
	testServiceOrRequestSection("Header", "Header level data section with successful request", oManifest_HeaderCase4);
	testServiceOrRequestSection("Header", "Header level data section with failing request", oManifest_HeaderCase4, true);
	testStaticDataSection("Header", "Header level data section with static JSON", oManifest_HeaderCase3);
	testNoDataSection("Header", "Header with NO data section", oManifest_HeaderCase2);
	testDataChanged("Header", "Header DataProvider triggers data changed", oManifest_HeaderCase1);
	testDataError("Header", "Header DataProvider fires error", oManifest_HeaderCase1);
	testDataReady("Header", "Header _dataReady event", oManifest_HeaderCase1);
	testDataReady("Header", "Header _dataReady event on error", oManifest_HeaderCase1, true);
	testDataReady("Header", "Header _dataReady event when no data section", oManifest_HeaderCase5);

	// Content level data section testing
	testServiceOrRequestSection("Content", "Content with service - success", oManifest_ContentCase1);
	testServiceOrRequestSection("Content", "Content with service - failure", oManifest_ContentCase1, true);
	testServiceOrRequestSection("Content", "Content level data section with successful request", oManifest_ContentCase4);
	testServiceOrRequestSection("Content", "Content level data section with failing request", oManifest_ContentCase4, true);
	testStaticDataSection("Content", "Content level data section with static JSON", oManifest_ContentCase3);
	testNoDataSection("Content", "Content with NO data section", oManifest_ContentCase2);
	testDataChanged("Content", "Content DataProvider triggers data changed", oManifest_ContentCase1);
	testDataError("Content", "Content DataProvider fires error", oManifest_ContentCase1);
	testDataReady("Content", "Content _dataReady event", oManifest_ContentCase1);
	testDataReady("Content", "Content _dataReady event on error", oManifest_ContentCase1, true);
	testDataReady("Content", "Content _dataReady event when no data section", oManifest_ContentCase5);

	QUnit.test("Content and Header override card level data", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_CardCase_OverridingModel);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var sHeaderBindingContextPath = this.oCard.getAggregation("_header").getBindingContext().getPath();
		var sContentBindingContextPath = this.oCard.getAggregation("_content").getBindingContext().getPath();

		var oJSON = oManifest_CardCase_OverridingModel["sap.card"]["data"]["json"];
		var oHeaderJSON = oManifest_CardCase_OverridingModel["sap.card"]["header"]["data"]["json"];
		var oContentJSON = oManifest_CardCase_OverridingModel["sap.card"]["content"]["data"]["json"];
		var sHeaderTitle = this.oCard.getAggregation("_header").getTitle();
		var sItem1Title = this.oCard.getAggregation("_content").getAggregation("_content").getItems()[0].getTitle();
		var sItem2Title = this.oCard.getAggregation("_content").getAggregation("_content").getItems()[1].getTitle();

		// Assert
		assert.deepEqual(this.oCard.getModel().getData(), oJSON, "Should set correct data on card.");
		assert.deepEqual(this.oCard.getAggregation("_header").getModel().getData(), oHeaderJSON, "Should set correct data on header.");
		assert.deepEqual(this.oCard.getAggregation("_content").getModel().getData(), oContentJSON, "Should set correct data on content.");
		assert.equal(sHeaderBindingContextPath, "/information", "Should have correct binding context path for header.");
		assert.equal(sContentBindingContextPath, "/items", "Should have correct binding context path for content.");
		assert.equal(sHeaderTitle, "Something", "Should have correct header title.");
		assert.equal(sItem1Title, "Product 1", "Should have correct item 1 title.");
		assert.equal(sItem2Title, "Product 2", "Should have correct item 2 title.");
	});

	QUnit.module("Data path", {
		beforeEach: function () {
			this.oCard = new Card();
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Content and Header setting binding context path", async function (assert) {
		// Arrange
		var fnHeaderFireEventSpy = sinon.spy(Header.prototype, "fireEvent");
		var fnContentFireEventSpy = sinon.spy(BaseContent.prototype, "fireEvent");

		// Act
		this.oCard.setManifest(oManifest_CardCase5);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var sHeaderBindingContextPath = this.oCard.getAggregation("_header").getBindingContext().getPath();
		var sContentBindingContextPath = this.oCard.getAggregation("_content").getBindingContext().getPath();

		var oJSON = oManifest_CardCase5["sap.card"]["data"]["json"];
		var sHeaderTitle = this.oCard.getAggregation("_header").getTitle();
		var sItem1Title = this.oCard.getAggregation("_content").getAggregation("_content").getItems()[0].getTitle();
		var sItem2Title = this.oCard.getAggregation("_content").getAggregation("_content").getItems()[1].getTitle();

		// Assert
		assert.deepEqual(this.oCard.getModel().getData(), oJSON, "Should set correct data model.");
		assert.equal(sHeaderBindingContextPath, "/data/generalInfo", "Should have correct binding context path for header.");
		assert.equal(sContentBindingContextPath, "/data/someItems", "Should have correct binding context path for content.");
		assert.equal(sHeaderTitle, "Some title", "Should have correct header title.");
		assert.equal(sItem1Title, "Test product", "Should have correct item 1 title.");
		assert.equal(sItem2Title, "Another product", "Should have correct item 2 title.");
		assert.ok(fnHeaderFireEventSpy.calledWith("_dataReady"), "Header should fire _dataReady event");
		assert.ok(fnContentFireEventSpy.calledWith("_dataReady"), "Content should fire _dataReady event");

		// Cleanup
		fnHeaderFireEventSpy.restore();
		fnContentFireEventSpy.restore();
	});

	QUnit.test("Card setting data path with expression binding and parameter", async function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "test.card.dataHandling"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"parameters": {
						"test": {
							"value": true
						}
					}
				},
				"data": {
					"json": {
						"data": {
							"content": [{
								"title": "item 1"
							}]
						}
					},
					"path": "/data/{= ${parameters>/test/value} ? 'content' : 'wrong'}"
				},
				"header": {
					"title": "{[0]/title}"
				},
				"content": {
					"item": {
						"title": "{title}"
					}
				}
			}
		};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var sCardBindingContextPath = this.oCard.getBindingContext().getPath();
		var sContentBindingContextPath = this.oCard.getCardContent().getBindingContext().getPath();
		var sItem1Title = this.oCard.getAggregation("_content").getAggregation("_content").getItems()[0].getTitle();

		// Assert
		assert.strictEqual(sCardBindingContextPath, "/data/content", "Should have correct binding context path for card.");
		assert.strictEqual(sContentBindingContextPath, "/data/content", "Should have correct binding context path for content.");
		assert.strictEqual(sItem1Title, "item 1", "Should have correct item 1 title.");
	});

	QUnit.test("Content setting data path with expression binding and parameter", async function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "test.card.dataHandling"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"parameters": {
						"test": {
							"value": true
						}
					}
				},
				"data": {
					"json": {
						"data": {
							"content": [{
								"title": "item 1"
							}]
						}
					}
				},
				"header": {
					"title": "Title"
				},
				"content": {
					"data": {
						"path": "/data/{= ${parameters>/test/value} ? 'content' : 'wrong'}"
					},
					"item": {
						"title": "{title}"
					}
				}
			}
		};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var sContentBindingContextPath = this.oCard.getCardContent().getBindingContext().getPath();
		var sItem1Title = this.oCard.getAggregation("_content").getAggregation("_content").getItems()[0].getTitle();

		// Assert
		assert.strictEqual(sContentBindingContextPath, "/data/content", "Should have correct binding context path for content.");
		assert.strictEqual(sItem1Title, "item 1", "Should have correct item 1 title.");
	});

	QUnit.test("Header setting data path with expression binding and parameter", async function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "test.card.dataHandling"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"parameters": {
						"test": {
							"value": true
						}
					}
				},
				"data": {
					"json": {
						"data": {
							"header": {
								"title": "Some Title"
							}
						}
					}
				},
				"header": {
					"data": {
						"path": "/data/{= ${parameters>/test/value} ? 'header' : 'wrong'}"
					},
					"title": "{title}"
				},
				"content": {
					"item": {
						"title": "item 1"
					}
				}
			}
		};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var sHeaderBindingContextPath = this.oCard.getCardHeader().getBindingContext().getPath();
		var sHeaderTitle = this.oCard.getAggregation("_header").getTitle();

		// Assert
		assert.strictEqual(sHeaderBindingContextPath, "/data/header", "Should have correct binding context path for header.");
		assert.strictEqual(sHeaderTitle, "Some Title", "Should have correct header title.");
	});

	QUnit.test("Numeric Header setting data path with expression binding and parameter", async function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "test.card.dataHandling"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"parameters": {
						"test": {
							"value": true
						}
					}
				},
				"data": {
					"json": {
						"data": {
							"header": {
								"title": "Some Title"
							}
						}
					}
				},
				"header": {
					"type": "Numeric",
					"data": {
						"path": "/data/{= ${parameters>/test/value} ? 'header' : 'wrong'}"
					},
					"title": "{title}"
				},
				"content": {
					"item": {
						"title": "item 1"
					}
				}
			}
		};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var sHeaderBindingContextPath = this.oCard.getCardHeader().getBindingContext().getPath();
		var sHeaderTitle = this.oCard.getAggregation("_header").getTitle();

		// Assert
		assert.strictEqual(sHeaderBindingContextPath, "/data/header", "Should have correct binding context path for header.");
		assert.strictEqual(sHeaderTitle, "Some Title", "Should have correct header title.");
	});

	QUnit.module("Data request depending on expression binding", {
		beforeEach: function () {
			var fnFake = function () {
				return Promise.resolve(this.oData);
			}.bind(this);

			this.oCard = new Card();
			this.oData = {
				"key1": "value1",
				"key2": "value2"
			};
			this._fnFetchStub = sinon.stub(RequestDataProvider.prototype, "_fetch").callsFake(fnFake);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.oData = null;
			this._fnFetchStub.restore();
		}
	});

	QUnit.test("Data request on card level", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.dataHandling.dataRequestOnCardLevel"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"request": {
						"url": "someurl/{= 2 < 3 ? 'param1' : 'param2'}"
					}
				},
				"header": {
					"title": "{title}"
				},
				"content": {
					"item": {
						"title": "{title}"
					}
				}
			}
		});
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		const oRequestedURL = this._fnFetchStub.args[0][0].url;

		// Assert
		assert.strictEqual(oRequestedURL, "someurl/param1", "Expression binding in the 'url' should be resolved.");
	});

	QUnit.test("Data request on header level", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.dataHandling.dataRequestOnHeaderLevel"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"data": {
						"request": {
							"url": "someurl/{= 2 < 3 ? 'param1' : 'param2'}"
						}
					},
					"title": "{title}"
				},
				"content": {
					"item": {
						"title": "{title}"
					}
				}
			}
		});
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		const oRequestedURL = this._fnFetchStub.args[0][0].url;

		// Assert
		assert.strictEqual(oRequestedURL, "someurl/param1", "Expression binding in the 'url' should be resolved.");
	});

	QUnit.test("Data request on filter definition level", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.dataHandling.dataRequestOnFilterLevel"
			},
			"sap.card": {
				"configuration": {
					"filters": {
						"f": {
							"value": "value1",
							"item": {
								"path": "/value",
								"template": {
									"key": "{key1}",
									"title": "{key2}"
								}
							},
							"data": {
								"request": {
									"url": "someurl/?f={filters>/f/value}"
								}
							}
						}
					}
				}
			}
		});
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		const oRequestedURL = this._fnFetchStub.args[0][0].url;

		// Assert
		assert.strictEqual(oRequestedURL, "someurl/?f=value1", "Filter value in the 'url' should be resolved.");
	});

	QUnit.test("Data request on content level", async function (assert) {// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.dataHandling.dataRequestOnContentLevel"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "{title}"
				},
				"content": {
					"data": {
						"request": {
							"url": "someurl/{= 2 < 3 ? 'param1' : 'param2'}"
						}
					},
					"item": {
						"title": "{title}"
					}
				}
			}
		});
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		const oRequestedURL = this._fnFetchStub.args[0][0].url;

		// Assert
		assert.strictEqual(oRequestedURL, "someurl/param1", "Expression binding in the 'url' should be resolved.");
	});

	QUnit.module("Data request depending on filter", {
		beforeEach: function () {
			var fnFake = function () {
				return Promise.resolve(this.oData);
			}.bind(this);

			this.oCard = new Card();
			this.oData = {
				title: "Hello World"
			};
			this._fnFetchStub = sinon.stub(RequestDataProvider.prototype, "_fetch").callsFake(fnFake);
		},
		afterEach: function () {
			this.oCard.destroy();
			this._fnFetchStub.restore();
		}
	});

	QUnit.test("Data request with filter on card level", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.data.handling"
			},
			"sap.card": {
				"configuration": {
					"filters": {
						"f": {
							"value": "data",
							"items": [{
								"title": "Filter 1",
								"key": "data"
							}]
						}
					}
				},
				"type": "List",
				"data": {
					"request": {
						"url": "someurl/{filters>/f/value}"
					}
				},
				"header": {
					"title": "{/title}"
				},
				"content": {
					"item": {
						"title": "{/title}"
					}
				}
			}
		});

		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		const oRequestedURL = this._fnFetchStub.args[0][0].url;

		// Assert
		assert.strictEqual(oRequestedURL, "someurl/data", "Filter value in the url is properly resolved on card level");
	});

	QUnit.test("Data request with filter on header level", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.data.handling"
			},
			"sap.card": {
				"configuration": {
					"filters": {
						"f": {
							"value": "data",
							"items": [{
								"title": "Filter 1",
								"key": "data"
							}]
						}
					}
				},
				"type": "List",
				"header": {
					"data": {
						"request": {
							"url": "someurl/{filters>/f/value}"
						}
					},
					"title": "{/title}"
				},
				"content": {
					"item": {
						"title": "Hello World"
					}
				}
			}
		});
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		const oRequestedURL = this._fnFetchStub.args[0][0].url;

		// Assert
		assert.strictEqual(oRequestedURL, "someurl/data", "Filter value in the url is properly resolved on header level");
	});

	QUnit.test("Data request with filter on content level", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.data.handling"
			},
			"sap.card": {
				"configuration": {
					"filters": {
						"f": {
							"value": "data",
							"items": [{
								"title": "Filter 1",
								"key": "data"
							}]
						}
					}
				},
				"type": "List",
				"header": {
					"title": "Hello World"
				},
				"content": {
					"data": {
						"request": {
							"url": "someurl/{filters>/f/value}"
						}
					},
					"item": {
						"title": "Hello World"
					}
				}
			}
		});
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		const oRequestedURL = this._fnFetchStub.args[0][0].url;

		// Assert
		assert.strictEqual(oRequestedURL, "someurl/data", "Filter value in the url is properly resolved on header level");
	});

	QUnit.module("Named data sections", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Named data section creates model in the card", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_NamedDataSections);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.ok(this.oCard.getModel("testCard"), "Model on global card level is created");
		assert.ok(this.oCard.getModel("testHeader"), "Model on header level is created");
		assert.ok(this.oCard.getModel("testContent"), "Model on content level is created");
	});

	QUnit.test("Items are bound to named model", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_NamedDataSections);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var aItems,
			oHeader = this.oCard.getCardHeader();

		this.oCard.getModel("testCard").setData({
			"subtitle": "Card subtitle"
		});

		this.oCard.getModel("testHeader").setData({
			"title": "Header title"
		});

		this.oCard.getModel("testContent").setData({
			"items": [
				{"name": "Item 1"},
				{"name": "Item 2"}
			]
		});

		await nextUIUpdate();
		aItems = this.oCard.getCardContent().getInnerList().getItems();

		// Assert
		assert.strictEqual(oHeader.getTitle(), "Header title", "Title from header level is correct.");
		assert.strictEqual(oHeader.getSubtitle(), "Card subtitle", "Subtitle from card level is correct.");

		assert.strictEqual(aItems.length, 2, "List has 2 items.");
		assert.strictEqual(aItems[0].getTitle(), "Item 1", "First list item has correct title.");
	});

	QUnit.module("Data Handling when preview mode is 'Abstract'", {
		beforeEach: function () {
			this.getDataSpy = this.spy(DataProvider.prototype, "getData");
			this.oCard = new Card({
				previewMode: library.CardPreviewMode.Abstract,
				manifest: {
					"sap.app": {
						"id": "test.card.dataHandling.previewModeAbstract"
					},
					"sap.card": {
						"type": "List",
						"data": {
							"json": {
								"key": "value"
							}
						},
						"configuration": {
							"filters": {
								"filter1": {
									"data": {
										"json": {
											"key": "value"
										}
									}
								}
							}
						},
						"header": {
							"data": {
								"json": {
									"key": "value"
								}
							},
							"title": "{/key}"
						},
						"content": {
							"data": {
								"json": [{
									"key": "value"
								}]
							},
							"item": {
								"title": "{key}"
							}
						}
					}
				}
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("No data requests should be made in 'Abstract' preview mode", async function (assert) {
		await nextCardReadyEvent(this.oCard);

		assert.strictEqual(this.getDataSpy.callCount, 0, "There should be no 'getData' calls in 'Abstract' preview mode");
	});

	QUnit.module("Data Handling when preview mode is 'MockData'", {
		beforeEach: function () {
			this.oCard = new Card({
				previewMode: library.CardPreviewMode.MockData
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Data requests should be made as configured in 'mockData' sections", async function (assert) {
		var JSONDataSpy = this.spy(DataProvider.prototype, "getData");
		var requestDataSpy = this.spy(RequestDataProvider.prototype, "getData");
		var oManifest = {
			"sap.app": {
				"id": "test.card.dataHandling.previewModeMockData"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"filters": {
						"filter1": {
							"value": "Mocked filter 1",
							"item": {
								"template": {
									"key": "{filterKey}",
									"title": "{filterTitle}"
								}
							},
							"data": {
								"request": {
									"url": "thisRequestShouldNotBeMade"
								},
								"mockData": {
									"json": [{
										"filterKey": "mockedFilter1",
										"filterTitle": "Mocked filter 1"
									}]
								}
							}
						}
					}
				},
				"header": {
					"data": {
						"request": {
							"url": "thisRequestShouldNotBeMade"
						},
						"mockData": {
							"json": {
								"title": "Mocked card title"
							}
						}
					},
					"title": "{/title}"
				},
				"content": {
					"data": {
						"request": {
							"url": "thisRequestShouldNotBeMade"
						},
						"mockData": {
							"json": [{
								"title": "Mocked item title 1"
							}]
						}
					},
					"item": {
						"title": "{title}"
					}
				}
			}
		};

		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		assert.strictEqual(requestDataSpy.callCount, 0, "No data requests should be made");
		assert.strictEqual(JSONDataSpy.callCount, 3, "Data configured in 'mockData' sections should be loaded");
		assert.strictEqual(this.oCard.getCardHeader().getTitle(), oManifest["sap.card"].header.data.mockData.json.title, "Mock data should be loaded for sap.card/header");
		assert.strictEqual(this.oCard.getCardContent().getInnerList().getItems()[0].getTitle(), oManifest["sap.card"].content.data.mockData.json[0].title, "Mock data should be loaded for sap.card/content");
		assert.strictEqual(this.oCard.getAggregation("_filterBar")._getFilters()[0]._getSelect().getItems()[0].getText(), oManifest["sap.card"].configuration.filters.filter1.data.mockData.json[0].filterTitle, "Mock data should be loaded for sap.card/configuration/filters");
	});

	QUnit.test("If 'mockData' sections are missing, data should not be fetched", async function (assert) {
		var getDataSpy = this.spy(DataProvider.prototype, "getData");

		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.dataHandling.previewModeAbstract"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"json": {
						"key": "value"
					}
				},
				"configuration": {
					"filters": {
						"filter1": {
							"data": {
								"json": {
									"key": "value"
								}
							}
						}
					}
				},
				"header": {
					"data": {
						"json": {
							"key": "value"
						}
					},
					"title": "{/key}"
				},
				"content": {
					"data": {
						"json": [{
							"key": "value"
						}]
					},
					"item": {
						"title": "{key}"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		assert.strictEqual(getDataSpy.callCount, 0, "Data requests are not made");
	});

	QUnit.module("Request Model Configuration", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("model size limit", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_ModelSizeLimit);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var aItems = this.oCard.getCardContent().getInnerList().getItems(),
			oFilterBar = this.oCard.getAggregation("_filterBar"),
			oSelect = oFilterBar._getFilters()[0]._getSelect();

		// Assert
		assert.strictEqual(aItems.length, 2, "List has 2 items.");
		assert.strictEqual(oSelect.getItems().length, 2, "Select filter has 2 items.");
	});
});