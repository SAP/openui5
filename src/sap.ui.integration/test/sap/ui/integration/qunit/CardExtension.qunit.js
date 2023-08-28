/* global QUnit, sinon */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Extension",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustrationPool"
], function(
	Log,
	Core,
	Card,
	Extension,
	IllustratedMessageType,
	IllustrationPool
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

	QUnit.test("Initialization", function (assert) {
		// arrange
		var done = assert.async();
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

		this.oCard.attachEvent("_ready", function () {
			// assert
			assert.ok(this.oCard.getAggregation("_extension"), "The extension is created successfully.");
			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Changing manifest from one with extension to one without extension", function (assert) {
		// arrange
		var done = assert.async(),
			oManifest1 = {
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

		this.oCard.attachEventOnce("_ready", function () {
			this.oCard.attachEventOnce("_ready", function () {
				assert.notOk(!!this.oCard.getAggregation("_extension"), "The extension should be destroyed.");
				done();
			}.bind(this));

			// act 2
			this.oCard.setManifest(oManifest2);
		}.bind(this));

		// act 1
		this.oCard.setManifest(oManifest1);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Extension providing data on card level", function (assert) {
		// arrange
		var done = assert.async();
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

		this.oCard.attachEvent("_ready", function () {
			var aItems = this.oCard.getCardContent().getInnerList().getItems();

			// assert
			assert.ok(aItems.length, "The data request on card level is successful.");
			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Extension providing data on header level", function (assert) {
		// arrange
		var done = assert.async();
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

		this.oCard.attachEvent("_ready", function () {
			// assert
			assert.ok(this.oCard.getCardHeader().getTitle(), "The data request on header level is successful.");
			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Extension providing data on content level", function (assert) {
		// arrange
		var done = assert.async();
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

		this.oCard.attachEvent("_ready", function () {
			var aItems = this.oCard.getCardContent().getInnerList().getItems();

			// assert
			assert.ok(aItems.length, "The data request on content level is successful.");
			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Extension providing data for a Filter", function (assert) {
		// arrange
		var done = assert.async();
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

		this.oCard.attachEvent("_ready", function () {
			var oFilterBar = this.oCard.getAggregation("_filterBar");
			assert.strictEqual(oFilterBar._getFilters().length, 1, "The filter bar has 1 filter");

			var oFilter = oFilterBar._getFilters()[0];
			assert.strictEqual(oFilter._getSelect().getSelectedKey(), "hi", "property binding works");

			assert.strictEqual(oFilter._getSelect().getItems()[2].getKey(), "lo", "option has the expected key");

			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Extension making request with custom dataType", function (assert) {
		// arrange
		var done = assert.async(),
			oServer = sinon.createFakeServer({
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

		this.oCard.attachEvent("_ready", function () {
			var aItems = this.oCard.getCardContent().getInnerList().getItems();

			// assert
			assert.ok(aItems.length, "The data request is successful.");

			oServer.restore();
			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
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

	QUnit.test("Formatting the title", function (assert) {
		// arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oFirstItem = this.oCard.getCardContent().getInnerList().getItems()[0];

			// assert
			assert.strictEqual(oFirstItem.getTitle(), "BERLIN", "The formatter successfully transformed the title to upper case characters.");
			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("setFormatters method", function (assert) {
		// arrange
		var oErrorSpy = this.spy(Log, "error"),
			done = assert.async();

		this.oCard.attachEvent("_ready", function () {

			this.oCard.getAggregation("_extension").setFormatters({
				toUpperCase: function (sValue) {
					return sValue.toUpperCase() + " New";
				}
			});

			assert.ok(oErrorSpy.called, "An error is logged");

			oErrorSpy.restore();
			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Formatters are local to card instance", function (assert) {
		// arrange
		var done = assert.async(),
			oCard2 = new Card({
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

		this.oCard.attachEventOnce("_ready", function () {
			var oBindingNamespaces = this.oCard.getBindingNamespaces();

			oCard2.attachEventOnce("_ready", function () {
				// assert
				assert.notDeepEqual(oBindingNamespaces, oCard2.getBindingNamespaces(), "Namespaces contain different functions for both cards");
				assert.deepEqual(this.oCard.getBindingNamespaces(), oBindingNamespaces, "Namespace of the first card remains unchanged");

				done();
			}.bind(this));

			// act 2
			oCard2.placeAt(DOM_RENDER_LOCATION);
		}.bind(this));

		// act 1
		this.oCard.placeAt(DOM_RENDER_LOCATION);
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

	QUnit.test("Method onCardReady is called once on card initialization", function (assert) {
		// arrange
		var done = assert.async();
		var onCardReadyStub = this.stub(Extension.prototype, "onCardReady");

		this.oCard.attachEvent("_ready", function () {
			assert.ok(onCardReadyStub.calledOnce, "The onCardReady event is called once.");
			done();
		});
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

	QUnit.test("Method loadDependencies is called once on card initialization", function (assert) {
		// arrange
		var done = assert.async();
		var loadDependenciesStub = this.stub(Extension.prototype, "loadDependencies");

		this.oCard.attachEvent("_ready", function () {
			// assert
			assert.ok(loadDependenciesStub.calledOnce, "'loadDependencies' is called once.");
			done();
		});
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

	QUnit.test("validation method", function (assert) {
		// arrange
		var done = assert.async();
		var bValid = false;

		this.oCard.attachEvent("_ready", function () {

			bValid = this.oCard.getAggregation("_extension").validateEmail("Text");
			assert.strictEqual(bValid, false, "E-mail is not valid");

			bValid = this.oCard.getAggregation("_extension").validateEmail("my@mail.com");
			assert.strictEqual(bValid, true, "E-mail is valid");

			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("No data IllustratedMessage set by extension binding", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEventOnce("_ready", function () {
			Core.applyChanges();
			var oMessage = this.oCard.getCardContent().getAggregation("_blockingMessage");

			// Assert
			assert.strictEqual(oMessage.getIllustrationType(), IllustratedMessageType.SimpleError, "The no data message type set by expression binding is correct");
			assert.strictEqual(oMessage.getDescription(), "Test", "The no data message description set by expression binding is correct");
			assert.strictEqual(oMessage.getTitle(), "No Data", "The no data message title set by expression binding is correct");
			assert.strictEqual(oMessage.getIllustrationSize(), "Auto", "The no data message size set by expression binding is correct");

			// Clean up
			done();
		}.bind(this));

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
	});

	QUnit.test("No data IllustratedMessage set by extension binding with 'tnt' set", function (assert) {
		// Arrange
		var done = assert.async();


		var oTntSet = {
			setFamily: "tnt",
			setURI: sap.ui.require.toUrl("sap/tnt/themes/base/illustrations")
		};

		// register tnt illustration set
		IllustrationPool.registerIllustrationSet(oTntSet, false);

		this.oCard.attachEventOnce("_ready", function () {
			Core.applyChanges();
			var oMessage = this.oCard.getCardContent().getAggregation("_blockingMessage");

			// Assert
			assert.strictEqual(oMessage.getIllustrationType(), "tnt-Tools", "The no data message type set by expression binding is correct");
			assert.strictEqual(oMessage.getDescription(), "Test", "The no data message description set by expression binding is correct");
			assert.strictEqual(oMessage.getTitle(), "No Data", "The no data message title set by expression binding is correct");
			assert.strictEqual(oMessage.getIllustrationSize(), "Auto", "The no data message size set by expression binding is correct");

			// Clean up
			done();
		}.bind(this));

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
	});
});
