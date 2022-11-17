/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/RequestDataProvider"
], function (
	Card,
	RequestDataProvider
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

	QUnit.test("Changing from Request to JSON data provider before request is complete should reset loading state", function (assert) {
		// Arrange
		var done = assert.async();
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

		this.oCard.attachEventOnce("manifestApplied", function () {
			// Assert
			assert.ok(this.oCard.isLoading(), "Card should be in loading state while request is pending");

			this.oCard.attachEventOnce("_ready", function () {
				// Assert
				assert.notOk(this.oCard.isLoading(), "Card shouldn't be in loading state from the previous loading provider");

				done();
			}.bind(this));

			// Act - change the manifest to use JSON data provider
			this.oCard.setManifest(oManifestWithJSONData);
		}.bind(this));

		this.oCard.setManifest(oManifestWithRequest);
	});
});