/* global QUnit */

sap.ui.define(["sap/ui/integration/widgets/Card", "sap/ui/core/Core"
],
	function (
		Card,
		Core
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		QUnit.module("Card Static Resources with base URL and manifest object", {
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

		QUnit.test("Header translation and icon", function (assert) {

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

		QUnit.test("Header icon with binding", function (assert) {
			// Arrange
			var done = assert.async(),
				sBaseUrl = "test-resources/sap/ui/integration/qunit/cardbundle/bundle/",
				oManifest = {
					"sap.app": {
						"id": "my.test.card.icon.with.binding",
						"type": "card"
					},
					"sap.card": {
						"type": "List",
						"header": {
							"data": {
								"json": {
									"iconSrc": "./test-src"
								}
							},
							"icon": {
								"src": "{/iconSrc}"
							}
						}
					}
				};

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				var oHeader = this.oCard.getAggregation("_header");
				assert.strictEqual(oHeader.getAggregation("_avatar").getSrc(), sBaseUrl + "test-src", "Card header avatar src is correct.");
				done();
			}.bind(this));

			// Arrange
			this.oCard.setManifest(oManifest);
			this.oCard.setBaseUrl(sBaseUrl);
			Core.applyChanges();
		});

		QUnit.test("ListContent item icon", function (assert) {

			// Arrange
			var done = assert.async();
			var oManifest = {
				"sap.app": {
					"id": "my.test.card.list",
					"type": "card",
					"i18n": "i18n/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "{{appTitle}}"
					},
					"content": {
						"data": {
							"json": [
								{
									"Icon": "./icons/edit.png"
								}
							]
						},
						"item": {
							"icon": {
								"src": "{Icon}"
							}
						}
					}
				}
			};

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oListItem = this.oCard.getCardContent().getAggregation("_content").getItems()[0];

				// Assert
				assert.equal(oListItem.getIcon(), "test-resources/sap/ui/integration/qunit/cardbundle/bundle/icons/edit.png", "Should have set correct relative URL.");

				// Clean up
				done();
			}.bind(this));
			this.oCard.setManifest(oManifest);
			this.oCard.setBaseUrl("test-resources/sap/ui/integration/qunit/cardbundle/bundle/");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("TableContent item icon", function (assert) {

			// Arrange
			var done = assert.async();
			var oManifest = {
				"sap.app": {
					"id": "my.test.card.table",
					"type": "card",
					"i18n": "i18n/i18n.properties"
				},
				"sap.card": {
					"type": "Table",
					"header": {
						"title": "{{appTitle}}"
					},
					"content": {
						"data": {
							"json": [
								{
									"Title": "Elena Petrova",
									"Position": "Sales Consultant",
									"Icon": "./icons/edit.png"
								},
								{
									"Title": "John Miller",
									"Position": "Sales Consultant",
									"Icon": "./icons/edit.png"
								},
								{
									"Title": "Julie Armstrong",
									"Position": "Manager",
									"Icon": "./icons/edit.png"
								}
							]
						},
						"row": {
							"columns": [
								{
									"title": "Image",
									"width": "18%",
									"icon": {
										"src": "{Icon}"
									}
								},
								{
									"title": "Name",
									"value": "{Title}"
								},
								{
									"title": "Position",
									"value": "{Position}"
								}
							]
						}
					}
				}
			};

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getCells()[0];

				// Assert
				assert.equal(oAvatar.getSrc(), "test-resources/sap/ui/integration/qunit/cardbundle/bundle/icons/edit.png", "Should have set correct relative URL.");

				// Clean up
				done();
			}.bind(this));
			this.oCard.setManifest(oManifest);
			this.oCard.setBaseUrl("test-resources/sap/ui/integration/qunit/cardbundle/bundle/");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("ObjectContent item icon", function (assert) {

			// Arrange
			var done = assert.async();
			var oManifest = {
				"sap.app": {
					"id": "my.test.card.object",
					"type": "card",
					"i18n": "i18n/i18n.properties"
				},
				"sap.card": {
					"type": "Object",
					"header": {
						"title": "{{appTitle}}"
					},
					"content": {
						"data": {
							"json": {
								"firstName": "Dona",
								"lastName": "Moore",
								"photo": "./icons/edit.png"
							}
						},
						"groups": [
							{
								"title": "Organizational Details",
								"items": [
									{
										"label": "Direct Manager",
										"value": "{firstName} {lastName}",
										"icon": {
											"src": "{photo}"
										}
									}
								]
							}
						]
					}
				}
			};

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oAvatar = this.oCard.getCardContent().getAggregation("_content").getContent()[0].getItems()[1].getItems()[0];

				// Assert
				assert.equal(oAvatar.getSrc(), "test-resources/sap/ui/integration/qunit/cardbundle/bundle/icons/edit.png", "Should have set correct relative URL.");

				// Clean up
				done();
			}.bind(this));
			this.oCard.setManifest(oManifest);
			this.oCard.setBaseUrl("test-resources/sap/ui/integration/qunit/cardbundle/bundle/");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("ListContent item icon with protocol-relative url" , function (assert) {

			// Arrange
			var done = assert.async();
			var oManifest = {
				"sap.app": {
					"id": "my.test.card.list",
					"type": "card",
					"i18n": "i18n/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"content": {
						"data": {
							"json": [
								{
									"Icon": "//icons/edit.png"
								}
							]
						},
						"item": {
							"icon": {
								"src": "{Icon}"
							}
						}
					}
				}
			};

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oListItem = this.oCard.getCardContent().getAggregation("_content").getItems()[0];

				// Assert
				assert.equal(oListItem.getIcon(), "//icons/edit.png", "Should NOT format protocol-relative URL.");

				// Clean up
				done();
			}.bind(this));
			this.oCard.setManifest(oManifest);
			this.oCard.setBaseUrl("test-resources/sap/ui/integration/qunit/cardbundle/bundle/");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Card Static Resources with manifest URL", {
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

		QUnit.test("Header translation and icon", function (assert) {

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

		QUnit.test("ListContent item icon", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oListItem = this.oCard.getCardContent().getAggregation("_content").getItems()[0];

				// Assert
				assert.equal(oListItem.getIcon(), "test-resources/sap/ui/integration/qunit/cardbundle/bundle/icons/edit.png", "Should have set correct relative URL.");

				// Clean up
				done();
			}.bind(this));
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/cardbundle/bundle/listmanifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("TableContent item icon", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getCells()[0];

				// Assert
				assert.equal(oAvatar.getSrc(), "test-resources/sap/ui/integration/qunit/cardbundle/bundle/icons/edit.png", "Should have set correct relative URL.");

				// Clean up
				done();
			}.bind(this));
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/cardbundle/bundle/tablemanifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("ObjectContent item icon", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oAvatar = this.oCard.getCardContent().getAggregation("_content").getContent()[0].getItems()[1].getItems()[0];

				// Assert
				assert.equal(oAvatar.getSrc(), "test-resources/sap/ui/integration/qunit/cardbundle/bundle/icons/edit.png", "Should have set correct relative URL.");

				// Clean up
				done();
			}.bind(this));
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/cardbundle/bundle/objectmanifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("ListContent header icon with protocol-relative url", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oAvatar = this.oCard.getCardHeader().getAggregation("_avatar");

				// Assert
				assert.equal(oAvatar.getSrc(), "//icons/edit.png", "Should NOT format protocol-relative URL.");

				// Clean up
				done();
			}.bind(this));
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/cardbundle/bundle/listmanifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});
	}
);
