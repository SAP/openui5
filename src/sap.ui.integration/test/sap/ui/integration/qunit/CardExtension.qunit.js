/* global QUnit, sinon */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Extension",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function (
	Log,
	Card,
	Extension,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Extension Instantiated by a Card", {
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

	QUnit.test("Initialization", async function (assert) {
		// arrange
		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"data": {
					"extension": {
						"method": "getData"
					}
				},
				"content": {
					"item": {
						"title": "{Name}"
					}
				}
			}
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// assert
		assert.ok(this.oCard.getAggregation("_extension"), "The extension is created successfully.");
	});

	QUnit.test("Changing manifest from one with extension to one without extension", async function (assert) {
		// arrange
		var oManifest1 = {
				"sap.app": {
					"id": "sap.ui.integration.test"
				},
				"sap.card": {
					"type": "List",
					"extension": "./extensions/Extension1",
					"data": {
						"extension": {
							"method": "getData"
						}
					},
					"content": {
						"item": {
							"title": "{Name}"
						}
					}
				}
			},
			oManifest2 = {
				"sap.app": {
					"id": "sap.ui.integration.test"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": []
					},
					"content": {
						"item": {
							"title": "{Name}"
						}
					}
				}
			};

		// act
		this.oCard.setManifest(oManifest1);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// act
		this.oCard.setManifest(oManifest2);

		await nextCardReadyEvent(this.oCard);

		assert.notOk(!!this.oCard.getAggregation("_extension"), "The extension should be destroyed.");
	});

	QUnit.test("Extension providing data on card level", async function (assert) {
		// arrange
		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"data": {
					"extension": {
						"method": "getData"
					}
				},
				"content": {
					"item": {
						"title": "{city}"
					}
				}
			}
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var aItems = this.oCard.getCardContent().getInnerList().getItems();

		// assert
		assert.ok(aItems.length, "The data request on card level is successful.");
	});

	QUnit.test("Extension providing data on header level", async function (assert) {
		// arrange
		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"header": {
					"data": {
						"extension": {
							"method": "getDataForHeader"
						}
					},
					"title": "{title}"
				}
			}
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// assert
		assert.ok(this.oCard.getCardHeader().getTitle(), "The data request on header level is successful.");
	});

	QUnit.test("Extension providing data on content level", async function (assert) {
		// arrange
		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"content": {
					"data": {
						"extension": {
							"method": "getDataForContent"
						}
					},
					"item": {
						"title": "{city}"
					}
				}
			}
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var aItems = this.oCard.getCardContent().getInnerList().getItems();

		// assert
		assert.ok(aItems.length, "The data request on content level is successful.");
	});

	QUnit.test("Extension providing data for a Filter", async function (assert) {
		// arrange
		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"configuration": {
					"filters": {
						"populationDensity": {
							"value": "hi",
							"item": {
								"template": {
									"key": "{key}",
									"title": "{title}"
								}
							},
							"data": {
								"extension": {
									"method": "getDataForFilter"
								}
							}
						}
					}
				},
				"type": "List",
				"extension": "./extensions/Extension1",
				"data": {
					"extension": {
						"method": "getData"
					}
				},
				"content": {
					"item": {
						"title": "{city}"
					}
				}
			}
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oFilterBar = this.oCard.getAggregation("_filterBar");
		assert.strictEqual(oFilterBar._getFilters().length, 1, "The filter bar has 1 filter");

		var oFilter = oFilterBar._getFilters()[0];

		assert.strictEqual(oFilter._getSelect().getSelectedKey(), "hi", "property binding works");
		assert.strictEqual(oFilter._getSelect().getItems()[2].getKey(), "lo", "option has the expected key");
	});

	QUnit.test("Extension making request with custom dataType", async function (assert) {
		// arrange
		var oServer = sinon.createFakeServer({
				autoRespond: true
			});

		oServer.respondImmediately = true;

		oServer.respondWith(/.*\/some\/url/, function (oXhr) {
			oXhr.respond(
				200,
				{
					"Content-Type": "application/xml"
				},
				'<CitySet> <City Name="Paris"/> <City Name="Berlin" /> </CitySet>'
			);
		});

		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"content": {
					"data": {
						"extension": {
							"method": "requestWithCustomDataType"
						}
					},
					"item": {
						"title": "{city}"
					}
				}
			}
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var aItems = this.oCard.getCardContent().getInnerList().getItems();

		// assert
		assert.ok(aItems.length, "The data request is successful.");

		oServer.restore();

	});

	QUnit.test("Extension making card request for filters", async function (assert) {
		// arrange
		var oServer = sinon.createFakeServer({
				autoRespond: true
			});

		oServer.respondImmediately = true;

		oServer.respondWith(/.*\/filter\/url/, function (oXhr) {
			oXhr.respond(
				200,
				[{ key: "hi", value: "High" },
				{ key: "mi", value: "Middle" },
				{ key: "lo", value: "Low" }]
			);
		});

		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"configuration": {
					"filters": {
						"populationDensity": {
							"value": "hi",
							"item": {
								"template": {
									"key": "{key}",
									"title": "{title}"
								}
							},
							"data": {
								"extension": {
									"method": "requestFilterData"
								}
							}
						}
					}
				},
				"content": {
					"data": {
						"extension": {
							"method": "getDataForContent"
						}
					},
					"item": {
						"title": "{city}"
					}
				}
			  }
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var aItems = this.oCard.getCardContent().getInnerList().getItems();
		await nextUIUpdate();

		// assert
		assert.ok(aItems.length, "The data request is successful.");

		oServer.restore();

	});

	/**
	 * @deprecated Since version 1.85
	 */
	QUnit.module("Actions - Legacy", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "test"
					},
					"sap.card": {
						"type": "List",
						"header": {
							"title": "Title",
							"subTitle": "Sub Title"
						},
						"extension": "./extensions/ExtensionLegacy"
					}
				}
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Initial actions", async function (assert) {
		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getCardHeader();
		const aActionMenuItems = oHeader.getToolbar().getAggregation("_actionsMenu").getItems();

		assert.strictEqual(aActionMenuItems.length, 1, "there is 1 action");
		assert.strictEqual(aActionMenuItems[0].getText(), "AutoOpen - SAP website - Extension", "action text is correct");
	});

	QUnit.test("setActions method", async function (assert) {
		// arrange
		var oHeader,
			aActionMenuItems,
			oToolbar,
			aNewActions = [
				{
					type: 'Navigation',
					url: "http://www.sap.com",
					target: "_blank",
					text: 'Action 1'
				},
				{
					type: 'Navigation',
					url: "http://www.sap.com",
					target: "_blank",
					text: 'Action 2'
				}
			];

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		oHeader = this.oCard.getCardHeader();
		oToolbar = oHeader.getToolbar();

		// set new actions
		this.oCard.getAggregation("_extension").setActions(aNewActions);
		await nextUIUpdate();

		assert.strictEqual(oToolbar, oHeader.getToolbar(), "The toolbar is kept the same");

		oToolbar = oHeader.getToolbar();
		aActionMenuItems = oToolbar.getAggregation("_actionsMenu").getItems();

		assert.strictEqual(aActionMenuItems.length, 2, "there are 2 actions");
		assert.strictEqual(aActionMenuItems[0].getText(), "Action 1", "action text is correct");
		assert.strictEqual(aActionMenuItems[1].getText(), "Action 2", "action text is correct");

		// set the new actions again
		this.oCard.getAggregation("_extension").setActions(aNewActions);

		assert.strictEqual(oToolbar, oHeader.getToolbar(), "the actions toolbar is not changed");
	});

	QUnit.module("Custom Formatters", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "sap.ui.integration.test"
					},
					"sap.card": {
						"type": "List",
						"extension": "./extensions/Extension1",
						"data": {
							"extension": {
								"method": "getData"
							}
						},
						"content": {
							"item": {
								"title": "{= extension.formatters.toUpperCase(${city}) }"
							}
						}
					}
				}
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Formatting the title", async function (assert) {
		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oFirstItem = this.oCard.getCardContent().getInnerList().getItems()[0];

		// assert
		assert.strictEqual(oFirstItem.getTitle(), "BERLIN", "The formatter successfully transformed the title to upper case characters.");
	});

	QUnit.test("setFormatters method", async function (assert) {
		// arrange
		var oErrorSpy = sinon.spy(Log, "error");

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		this.oCard.getAggregation("_extension").setFormatters({
			toUpperCase: function (sValue) {
				return sValue.toUpperCase() + " New";
			}
		});

		// assert
		assert.ok(oErrorSpy.called, "An error is logged");

		oErrorSpy.restore();
	});

	QUnit.test("Formatters are local to card instance", async function (assert) {
		// arrange
		var oCard2 = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "sap.ui.integration.test.card2"
					},
					"sap.card": {
						"type": "List",
						"extension": "./extensions/Extension2",
						"content": {
							"item": {
								"title": "{= extension.formatters.toUpperCase2(${city}) }"
							}
						}
					}
				}
			});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// act
		oCard2.placeAt(DOM_RENDER_LOCATION);
		var oBindingNamespaces = this.oCard.getBindingNamespaces();

		await nextCardReadyEvent(oCard2);

		// assert
		assert.notDeepEqual(oBindingNamespaces, oCard2.getBindingNamespaces(), "Namespaces contain different functions for both cards");
		assert.deepEqual(this.oCard.getBindingNamespaces(), oBindingNamespaces, "Namespace of the first card remains unchanged");

		// clean up
		oCard2.destroy();
	});

	QUnit.module("Extension Lifecycle", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "test"
					},
					"sap.card": {
						"type": "List",
						"extension": "./extensions/ExtensionSample",
						"content": {
							"item": {}
						}
					}
				}
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Method onCardReady is called once on card initialization", async function (assert) {
		// arrange
		var onCardReadyStub = this.stub(Extension.prototype, "onCardReady");

		await nextCardReadyEvent(this.oCard);

		assert.ok(onCardReadyStub.calledOnce, "The onCardReady event is called once.");
	});

	QUnit.test("Method resolveDestination inside onCardReady does not throw an error", function (assert) {
		// arrange
		var done = assert.async();
		var onCardReadyStub = this.stub(Extension.prototype, "onCardReady");

		onCardReadyStub.callsFake(function () {
			this.oCard.resolveDestination("test");

			assert.ok(true, "There is no error when calling resolveDestination.");
			done();
		}.bind(this));
	});

	QUnit.test("Method loadDependencies is called once on card initialization", async function (assert) {
		// arrange
		var loadDependenciesStub = this.stub(Extension.prototype, "loadDependencies");

		await nextCardReadyEvent(this.oCard);

		// assert
		assert.ok(loadDependenciesStub.calledOnce, "'loadDependencies' is called once.");
	});

	QUnit.module("Use translations from inside the extension", {
		beforeEach: function () {
			this.fnOnCardReadyStub = this.stub(Extension.prototype, "onCardReady");

			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "test",
						"i18n": "cardWithTranslationsCustomCounter/i18n/i18n.properties"
					},
					"sap.card": {
						"type": "List",
						"extension": "./extensions/ExtensionSample"
					}
				}
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Call getTranslatedText in onCardReady", function (assert) {
		// arrange
		var done = assert.async();

		this.fnOnCardReadyStub.callsFake(function () {
			assert.strictEqual(this.oCard.getTranslatedText("SUBTITLE"), "Some subtitle", "The translation for SUBTITLE is correct.");
			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.module("Validation", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "sap.ui.integration.test"
					},
					"sap.card": {
						"type": "Object",
						"extension": "./extensions/Extension1",
						"data": {
							"extension": {
								"method": "getData"
							}
						},
						"content": {
							"groups": [{
								"items": [{
									"id": "e-mail",
									"label": "E-mail",
									"type": "TextArea",
									"rows": 1,
									"placeholder": "e-mail",
									"validations": [{
											"required": true
										},
										{
											"validate": "extension.validateEmail",
											"message": "You should enter valid e-mail.",
											"type": "Warning"
										}
									]
								}]
							}]
						}
					}
				}
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("validation method", async function (assert) {
		// arrange
		var bValid = false;

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		bValid = this.oCard.getAggregation("_extension").validateEmail("Text");
		assert.strictEqual(bValid, false, "E-mail is not valid");

		bValid = this.oCard.getAggregation("_extension").validateEmail("my@mail.com");
		assert.strictEqual(bValid, true, "E-mail is valid");
	});

	QUnit.test("No data IllustratedMessage set by extension binding", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.NoData"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"data": {
					"extension": {
						"method": "loadData"
					}
				},
				"configuration": {
					"messages": {
						"noData": {
							"type": "{/IMType}",
							"title": "{/IMTitle}",
							"description": "{/IMDescription}",
							"size": "{/IMSize}"
						}
					}
				},
				"header": {},
				"content": {
					"data": {
						"path": "/items"
					},
					"item": {
						"title": "{title}"
					},
					"maxItems": "{maxItems}"
				}
			}
		});
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oMessage = this.oCard.getCardContent().getAggregation("_blockingMessage");

		// Assert
		assert.strictEqual(oMessage.getIllustrationType(), sap.m.IllustratedMessageType.SimpleError, "The no data message type set by expression binding is correct");
		assert.strictEqual(oMessage.getDescription(), "Test", "The no data message description set by expression binding is correct");
		assert.strictEqual(oMessage.getTitle(), "No Data", "The no data message title set by expression binding is correct");
		assert.strictEqual(oMessage.getIllustrationSize(), "Auto", "The no data message size set by expression binding is correct");
	});

	QUnit.test("No data IllustratedMessage set by extension binding with 'tnt' set", async function (assert) {
		// Arrange
		var oTntSet = {
			setFamily: "tnt",
			setURI: sap.ui.require.toUrl("sap/tnt/themes/base/illustrations")
		};

		// register tnt illustration set
		sap.m.IllustrationPool.registerIllustrationSet(oTntSet, false);

		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.NoData"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"data": {
					"extension": {
						"method": "loadData"
					}
				},
				"configuration": {
					"messages": {
						"noData": {
							"type": "{/IMTntType}",
							"title": "{/IMTitle}",
							"description": "{/IMDescription}",
							"size": "{/IMSize}"
						}
					}
				},
				"header": {},
				"content": {
					"data": {
						"path": "/items"
					},
					"item": {
						"title": "{title}"
					},
					"maxItems": "{maxItems}"
				}
			}

		});
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oMessage = this.oCard.getCardContent().getAggregation("_blockingMessage");

		// Assert
		assert.strictEqual(oMessage.getIllustrationType(), "tnt-Tools", "The no data message type set by expression binding is correct");
		assert.strictEqual(oMessage.getDescription(), "Test", "The no data message description set by expression binding is correct");
		assert.strictEqual(oMessage.getTitle(), "No Data", "The no data message title set by expression binding is correct");
		assert.strictEqual(oMessage.getIllustrationSize(), "Auto", "The no data message size set by expression binding is correct");
	});
});
