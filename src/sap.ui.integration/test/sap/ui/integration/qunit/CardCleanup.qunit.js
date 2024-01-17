/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/library",
	"sap/ui/integration/cards/BaseListContent",
	"qunit/testResources/nextCardReadyEvent",
	"qunit/testResources/nextCardManifestAppliedEvent"
], function (
	Card,
	RequestDataProvider,
	library,
	BaseListContent,
	nextCardReadyEvent,
	nextCardManifestAppliedEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Card cleanup", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Changing from Request to JSON data provider before request is complete should reset loading state", async function (assert) {
		// Arrange
		this.stub(RequestDataProvider.prototype, "getData").returns(new Promise(function () {}));
		var oManifestWithRequest = {
			"sap.app": {
				"id": "test.card.cleanup.loadingProvider"
			},
			"sap.card": {
				"data": {
					"request": {
						"url": "items.json"
					}
				},
				"type": "List",
				"header": {
					"title": "Available Trainings"
				},
				"content": {
					"item": {
						"title": "{title}"
					}
				}
			}
		};
		var oManifestWithJSONData = {
			"sap.app": {
				"id": "test.card.cleanup.loadingProvider"
			},
			"sap.card": {
				"data": {
					"json": []
				},
				"type": "List",
				"header": {
					"title": "Available Trainings"
				},
				"content": {
					"item": {
						"title": "{title}"
					}
				}
			}
		};

		this.oCard.setManifest(oManifestWithRequest);

		await nextCardManifestAppliedEvent(this.oCard);

		// Act - change the manifest to use JSON data provider
		this.oCard.setManifest(oManifestWithJSONData);

		// Assert
		assert.ok(this.oCard.isLoading(), "Card should be in loading state while request is pending");

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.notOk(this.oCard.isLoading(), "Card shouldn't be in loading state from the previous loading provider");
	});

	QUnit.module("Cleanup of internal models", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Default model", async function (assert) {
		assert.expect(3);
		assert.deepEqual(this.oCard.getModel().getData(), {}, "The default model should be empty");

		// Act 1
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.cleanup.defaultModel"
			},
			"sap.card": {
				"data": {
					"json": [{
						"title": "item 1"
					}]
				},
				"type": "List",
				"header": {
					"title": "Available Trainings"
				},
				"content": {
					"item": {
						"title": "{title}"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.notDeepEqual(this.oCard.getModel().getData(), {}, "The default model should be populated with data");

		// Act 2
		this.oCard.setPreviewMode(library.CardPreviewMode.Abstract);

		await nextCardReadyEvent(this.oCard);

		// Assert 2
		assert.deepEqual(this.oCard.getModel().getData(), {}, "The default model should be empty");
	});

	QUnit.test("Old default model shouldn't trigger onDataChanged of new content", async function (assert) {
		var done = assert.async();
		var oData1 = [{
			"title": "item 1"
		}];
		var oData2 = [{
			"title": "item 2"
		}];

		this.stub(RequestDataProvider.prototype, "getData")
			.onFirstCall().callsFake(function () {
				return new Promise(function (resolve, reject) {
					setTimeout(function () {
						resolve(oData1);
					}, 100);
				});
			})
			.onSecondCall().callsFake(function () {
				return new Promise(function (resolve, reject) {
					setTimeout(function () {
						resolve(oData2);
					}, 100);
				});
			});

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.cleanup.defaultModel1"
			},
			"sap.card": {
				"data": {
					"request": {
						"url": "some/url"
					}
				},
				"type": "List",
				"header": {
					"title": "Available Trainings"
				},
				"content": {
					"item": {
						"title": "{title}"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.deepEqual(this.oCard.getModel().getData(), oData1, "The default model should be populated with data");

		// Arrange
		this.stub(BaseListContent.prototype, "onDataChanged").callsFake(function () {
			assert.deepEqual(this.getModel().getData(), oData2, "New content should receive onDataChanged event with new data");

			done();
		});

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.cleanup.defaultModel2"
			},
			"sap.card": {
				"data": {
					"request": {
						"url": "some/url"
					}
				},
				"type": "List",
				"header": {
					"title": "Available Trainings"
				},
				"content": {
					"item": {
						"title": "{title}"
					}
				}
			}
		});
	});

});