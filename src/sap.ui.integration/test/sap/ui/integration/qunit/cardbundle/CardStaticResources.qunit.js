/* global QUnit */

sap.ui.define(["sap/ui/integration/widgets/Card", "sap/ui/core/Core"
],
	function (
		Card,
		Core
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		QUnit.module("Card Static Resources", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Card static resources with base URL and manifest object", function (assert) {

			// Arrange
			var done = assert.async();
			var oManifest = {
				"sap.app": {
					"id": "my.test.card",
					"type": "card",
					"i18n": "i18n/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "{{appTitle}}",
						"icon": {
							"src": "./icons/edit.png"
						}
					}
				}
			};

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oHeader = this.oCard.getCardHeader();

				// Assert
				assert.equal(oHeader.getTitle(), "Card Bundle", "Should have loaded the i18n files and used them for translating the title.");
				assert.equal(oHeader._getAvatar().getSrc(), "test-resources/sap/ui/integration/qunit/cardbundle/bundle/icons/edit.png", "Should have set correct relative URL.");

				// Clean up
				done();
			}.bind(this));
			this.oCard.setManifest(oManifest);
			this.oCard.setBaseUrl("test-resources/sap/ui/integration/qunit/cardbundle/bundle/");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Card static resources with manifest URL", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oHeader = this.oCard.getCardHeader();

				// Assert
				assert.equal(oHeader.getTitle(), "Card Bundle", "Should have loaded the i18n files and used them for translating the title.");
				assert.equal(oHeader._getAvatar().getSrc(), "test-resources/sap/ui/integration/qunit/cardbundle/bundle/icons/edit.png", "Should have set correct relative URL.");

				// Clean up
				done();
			}.bind(this));
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/cardbundle/bundle/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});
	}
);
