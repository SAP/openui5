/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Extension"
], function (
	Card,
	Extension
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Extension Instantiated by a Card", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/"
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
			assert.ok(this.oCard._oExtension, "The extension is created successfully.");
			done();
		}.bind(this));

		// act
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

	QUnit.module("Custom Formatters", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/"
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
						"title": "{= extension.formatters.toUpperCase(${city}) }"
					}
				}
			}
		});

		this.oCard.attachEvent("_ready", function () {
			var oFirstItem = this.oCard.getCardContent().getInnerList().getItems()[0];

			// assert
			assert.strictEqual(oFirstItem.getTitle(), "BERLIN", "The formatter successfully transformed the title to upper case characters.");
			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.module("Life-cycle method onCardReady", {
		beforeEach: function () {
			this.fnOnCardReadyStub = sinon.stub(Extension.prototype, "onCardReady");

			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/",
				manifest: {
					"sap.app": {
						"id": "test"
					},
					"sap.card": {
						"type": "List",
						"extension": "./extensions/Extension1"
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

		this.fnOnCardReadyStub.callsFake(function (oCard) {
			oCard.resolveDestination("test");

			assert.ok(true, "There is no error when calling resolveDestination.");
			done();
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.module("Use translations from inside the extension", {
		beforeEach: function () {
			this.fnOnCardReadyStub = sinon.stub(Extension.prototype, "onCardReady");

			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/",
				manifest: {
					"sap.app": {
						"id": "test",
						"i18n": "manifests/translation/i18n/i18n.properties"
					},
					"sap.card": {
						"type": "List",
						"extension": "./extensions/Extension1"
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

		this.fnOnCardReadyStub.callsFake(function (oCard) {
			assert.strictEqual(oCard.getTranslatedText("SUBTITLE"), "Some subtitle", "The translation for SUBTITLE is correct.");
			done();
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});
});
