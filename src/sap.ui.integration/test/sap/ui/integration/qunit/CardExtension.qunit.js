/* global QUnit, sinon */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Extension"
], function (
	Log,
	Core,
	Card,
	Extension
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
			assert.strictEqual(oFilterBar.getItems().length, 1, "The filter bar has 1 filter");

			var oFilter = oFilterBar.getItems()[0];
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
			deferred = new jQuery.Deferred();

		this.stub(jQuery, "ajax").callsFake(function () {
			return deferred.promise();
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
			assert.ok(jQuery.ajax.calledWithMatch({ dataType: "xml" }), "request was made with the expected dataType");

			done();
			jQuery.ajax.restore();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		deferred.resolve(new DOMParser().parseFromString('<CitySet> <City Name="Paris"/> <City Name="Berlin" /> </CitySet>', "application/xml"));
	});

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

	QUnit.test("Initial actions", function (assert) {
		// arrange
		var done = assert.async(),
			oHeader,
			aActionButtons;

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			oHeader = this.oCard.getCardHeader();
			aActionButtons = oHeader.getToolbar().getAggregation("_actionSheet").getButtons();

			assert.strictEqual(aActionButtons.length, 1, "there is 1 action");
			assert.strictEqual(aActionButtons[0].getText(), "AutoOpen - SAP website - Extension", "action text is correct");

			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("setActions method", function (assert) {
		// arrange
		var done = assert.async(),
			oHeader,
			aActionButtons,
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

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			oHeader = this.oCard.getCardHeader();
			oToolbar = oHeader.getToolbar();

			// set new actions
			this.oCard.getAggregation("_extension").setActions(aNewActions);
			Core.applyChanges();

			assert.strictEqual(oToolbar, oHeader.getToolbar(), "The toolbar is kept the same");

			oToolbar = oHeader.getToolbar();
			aActionButtons = oToolbar.getAggregation("_actionSheet").getButtons();

			assert.strictEqual(aActionButtons.length, 2, "there are 2 actions");
			assert.strictEqual(aActionButtons[0].getText(), "Action 1", "action text is correct");
			assert.strictEqual(aActionButtons[1].getText(), "Action 2", "action text is correct");

			// set the new actions again
			this.oCard.getAggregation("_extension").setActions(aNewActions);

			assert.strictEqual(oToolbar, oHeader.getToolbar(), "the actions toolbar is not changed");

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

	QUnit.module("Life-cycle method onCardReady", {
		beforeEach: function () {
			this.fnOnCardReadyStub = sinon.stub(Extension.prototype, "onCardReady");

			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "test"
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
			this.fnOnCardReadyStub.restore();
		}
	});

	QUnit.test("Method onCardReady is called once on card initialization", function (assert) {
		// arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			assert.ok(this.fnOnCardReadyStub.calledOnce, "The onCardReady event is called once.");
			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Method resolveDestination inside onCardReady does not throw an error", function (assert) {
		// arrange
		var done = assert.async();

		this.fnOnCardReadyStub.callsFake(function () {
			this.oCard.resolveDestination("test");

			assert.ok(true, "There is no error when calling resolveDestination.");
			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.module("Use translations from inside the extension", {
		beforeEach: function () {
			this.fnOnCardReadyStub = sinon.stub(Extension.prototype, "onCardReady");

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
			this.fnOnCardReadyStub.restore();
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
});
