/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card"
], function (
	Card
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
				"id": "test1"
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
				"id": "test1"
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
				"id": "test1"
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
				"id": "test1"
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
				"id": "test1"
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

});
