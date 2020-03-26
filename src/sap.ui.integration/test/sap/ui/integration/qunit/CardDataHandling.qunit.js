/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/cards/RequestDataProvider",
	"sap/ui/integration/cards/ServiceDataProvider",
	"sap/f/cards/Header",
	"sap/ui/integration/cards/BaseContent",
	"sap/ui/core/Core"
],
function (
	Card,
	RequestDataProvider,
	ServiceDataProvider,
	Header,
	BaseContent,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oManifest_CardCase1 = {
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
		"sap.card": {
			"type": "List"
		}
	};
	var oManifest_CardCase4 = {
		"sap.card": {
			"type": "List",
			"data": {
				"service": "UserRecent"
			}
		}
	};
	var oManifest_CardCase5 = {
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
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Some title",
				"subTitle": "Some subtitle"
			}
		}
	};
	var oManifest_HeaderCase3 = {
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
		"sap.card": {
			"type": "List",
			"header": {}
		}
	};
	var oManifest_ContentCase1 = {
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

	function testServiceOrRequestSection(sName, sTestTitle, oManifest, bShouldFail) {
		QUnit.test(sTestTitle, function (assert) {

			var sMessage = "Should set data when there is a data service.";

			this.bTriggerFailure = !!bShouldFail;
			var oExpectedData = this.oData;
			if (this.bTriggerFailure) {
				oExpectedData = {};
				sMessage = "Should NOT set data when the service fails.";
			}

			// Arrange
			var done = assert.async();
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oControlToTest = this.oCard;
				if (sName === "Header") {
					oControlToTest = this.oCard.getAggregation("_header");
				} else if (sName === "Content") {
					oControlToTest = this.oCard.getAggregation("_content");
				}

				// Assert
				assert.deepEqual(oControlToTest.getModel().getData(), oExpectedData, sMessage);

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});
	}

	function testNoDataSection(sName, sTestTitle, oManifest) {
		QUnit.test(sTestTitle, function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oControlToTest = this.oCard;
				if (sName === "Header") {
					oControlToTest = this.oCard.getAggregation("_header");
				} else if (sName === "Content") {
					oControlToTest = this.oCard.getAggregation("_content");
				}

				// Assert
				assert.notOk(oControlToTest.getModel(), "Should NOT set a model when there is no data section.");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});
	}

	function testStaticDataSection(sName, sTestTitle, oManifest) {
		QUnit.test(sTestTitle, function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

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
				assert.deepEqual(oControlToTest.getModel().getData(), oData["json"], "Should set correct data model.");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});
	}

	function testDataChanged(sName, sTestTitle, oManifest) {
		QUnit.test(sTestTitle, function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

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
				assert.deepEqual(oControlToTest.getModel().getData(), oNewData, "Should update data on data changed event.");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});
	}

	function testDataError(sName, sTestTitle, oManifest) {
		QUnit.test(sTestTitle, function (assert) {

			// Arrange
			var done = assert.async();
			this.bTriggerFailure = true;
			this._fnHandleErrorStub.restore();
			var fnCardFireEventSpy = sinon.spy(Card.prototype, "fireEvent");
			var fnHeaderFireEventSpy = sinon.spy(Header.prototype, "fireEvent");
			var fnContentFireEventSpy = sinon.spy(BaseContent.prototype, "fireEvent");

			Core.applyChanges();

			this.oCard.attachEvent("_ready", function () {

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

				done();
			});

			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});
	}

	function testDataReady(sName, sTestTitle, oManifest, bShouldFail) {
		QUnit.test(sTestTitle, function (assert) {

			// Arrange
			var done = assert.async();
			this.bTriggerFailure = !!bShouldFail;
			this._fnHandleErrorStub.restore();
			var fnHeaderFireEventSpy = sinon.spy(Header.prototype, "fireEvent");
			var fnContentFireEventSpy = sinon.spy(BaseContent.prototype, "fireEvent");

			Core.applyChanges();

			this.oCard.attachEvent("_ready", function () {

				var _fnSpy = fnHeaderFireEventSpy;
				if (sName === "Content") {
					_fnSpy = fnContentFireEventSpy;
				}

				// Assert
				assert.ok(_fnSpy.calledWith("_dataReady"), "Should fire _dataReady event when data is ready.");

				// Cleanup
				fnHeaderFireEventSpy.restore();
				fnContentFireEventSpy.restore();

				done();
			});

			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
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

	QUnit.test("Content and Header setting binding context path", function (assert) {

		// Arrange
		var done = assert.async();
		var fnHeaderFireEventSpy = sinon.spy(Header.prototype, "fireEvent");
		var fnContentFireEventSpy = sinon.spy(BaseContent.prototype, "fireEvent");
		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

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

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_CardCase5);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Content and Header overrides card level data", function (assert) {

		// Arrange
		var done = assert.async();
		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

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

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_CardCase_OverridingModel);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});
});