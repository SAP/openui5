/* global QUnit */

sap.ui.define([
		"sap/ui/integration/widgets/Card",
		"sap/ui/core/Core",
		"sap/base/Log",
		'sap/ui/integration/Host'
	],
	function (
		Card,
		Core,
		Log,
		Host
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		var sResourcePath = "qunit/testResources/cardWithDestinations/",
			sImagesResourcePath = "qunit/testResources/images/",
			sBaseUrl = "test-resources/sap/ui/integration/";

		var oManifest_Valid = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"contentDestination": {
							"name": "contentDestination"
						},
						"headerDestination": {
							"name": "headerDestination"
						},
						"imageDestination": {
							"name": "imageDestination"
						}
					}
				},
				"header": {
					"title": "{title}",
					"data": {
						"request": {
							"url": "{{destinations.headerDestination}}/header.json"
						}
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "{{destinations.contentDestination}}/items.json"
						}
					},
					"item": {
						"title": "{Name}",
						"icon": {
							"src": "{{destinations.imageDestination}}/{Image}"
						}
					}
				}
			}
		};

		var oManifest_Invalid_Destinations = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "{title}",
					"data": {
						"request": {
							"url": "{{destinations.asyncDestination}}/header.json"
						}
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "{{destinations.myDestination}}/items.json"
						}
					},
					"item": {
						"title": "{Name}",
						"icon": {
							"src": "{{destinations.myDestination}}/{Image}"
						}
					}
				}
			}
		};

		var oManifest_Mixed_Valid_Invalid_Destinations = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"contentDestination": {
							"name": "contentDestination"
						},
						"headerDestination": {
							"name": "headerDestination"
						}
					}
				},
				"header": {
					"title": "{title}",
					"data": {
						"request": {
							"url": "{{destinations.headerDestination}}/header.json"
						}
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "{{destinations.contentDestination}}/items.json"
						}
					},
					"item": {
						"title": "{Name}",
						"icon": {
							"src": "{{destinations.invalidDestination}}/{Image}"
						}
					}
				}
			}
		};

		var oManifest_DefaultUrl = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"test1": {
							"name": "Test1Name",
							"defaultUrl": "test1/url"
						},
						"test2": {
							"defaultUrl": "test2/url"
						},
						"test3": { }
					}
				}
			}
		};

		function checkValidDestinations(assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				var aItems = this.oCard.getCardContent().getInnerList().getItems(),
					sFirstItemIcon = aItems[0].getIcon(),
					sExpectedIcon = sBaseUrl + "qunit/testResources/images/Woman_avatar_01.png";

				// Assert
				assert.ok(aItems.length, "The data request is successful.");
				assert.strictEqual(this.oCard.getCardHeader().getTitle(), "Card Title", "header destination is resolved successfully");
				assert.strictEqual(sFirstItemIcon, sExpectedIcon, "The icon path is correct.");

				done();
			}.bind(this));

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		}

		function checkInvalidDestinations(assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {

				// Assert
				assert.notOk(this.oCard.getCardContent().getInnerList, "The data request is unsuccessful.");

				assert.notOk(this.oCard.getCardHeader().getTitle(), "async destination is not resolved successfully");

				done();
			}.bind(this));

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		}

		function checkValidResolveDestinationMethod(assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				this.oCard.resolveDestination("contentDestination").then(function (destination) {
					assert.strictEqual(destination, sResourcePath, "destination is resolved successfully");
					done();
				});
			}.bind(this));

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		}

		function checkInvalidResolveDestinationMethod(assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				this.oCard.resolveDestination("contentDestination").catch(function (destination) {
					assert.step("destination is not resolved");

					done();
				});
			}.bind(this));

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		}

		QUnit.module("Destinations", {
			beforeEach: function () {
				this.oHost = new Host({
					resolveDestination: function(sDestinationName) {
						switch (sDestinationName) {
							case "contentDestination":
							case "headerDestination":
								return sResourcePath;
							case "imageDestination":
								return sImagesResourcePath;
							default:
								Log.error("Unknown destination.");
								break;
						}
					}
				});

				this.oCard = new Card({
					"manifest": oManifest_Valid,
					"host": this.oHost,
					"baseUrl": sBaseUrl
				});
				this.oCard.setHost(this.oHost);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oHost.destroy();
				this.oHost = null;
			}
		});

		QUnit.test("Resolve destinations", function (assert) {
			checkValidDestinations.call(this, assert);
		});

		QUnit.test("Card.resolveDestination method", function (assert) {
			checkValidResolveDestinationMethod.call(this, assert);
		});

		QUnit.module("Async Destinations", {
			beforeEach: function () {
				this.oHost = new Host({
					resolveDestination: function(sDestinationName) {
						switch (sDestinationName) {
							case "contentDestination":
							case "headerDestination":
								return new Promise(function (resolve) {
									setTimeout(function () {
										resolve(sResourcePath);
									}, 10);
								});
							case "imageDestination":
								return sImagesResourcePath;
							default:
								Log.error("Unknown destination.");
								break;
						}
					}
				});

				this.oCard = new Card({
					"manifest": oManifest_Valid,
					"host": this.oHost,
					"baseUrl": sBaseUrl
				});
				this.oCard.setHost(this.oHost);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oHost.destroy();
				this.oHost = null;
			}
		});

		QUnit.test("Resolve destinations", function (assert) {
			checkValidDestinations.call(this, assert);
		});

		QUnit.test("Card.resolveDestination method", function (assert) {
			checkValidResolveDestinationMethod.call(this, assert);
		});

		QUnit.module("Invalid Destinations", {
			beforeEach: function () {
				this.oHost = new Host({
					resolveDestination: function(sDestinationName) {
						// do nothing
					}
				});

				this.oCard = new Card({
					"manifest": oManifest_Invalid_Destinations,
					"host": this.oHost,
					"baseUrl": sBaseUrl
				});
				this.oCard.setHost(this.oHost);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oHost.destroy();
				this.oHost = null;
			}
		});

		QUnit.test("Resolve destinations", function (assert) {
			checkInvalidDestinations.call(this, assert);
		});

		QUnit.test("Card.resolveDestination method", function (assert) {
			checkInvalidResolveDestinationMethod.call(this, assert);
		});

		QUnit.module("Mixed Valid and Invalid Destinations", {
			beforeEach: function () {
				this.oHost = new Host({
					resolveDestination: function(sDestinationName) {
						switch (sDestinationName) {
							case "contentDestination":
							case "headerDestination":
								return sResourcePath;
							default:
								Log.error("Unknown destination.");
								break;
						}
					}
				});

				this.oCard = new Card({
					"manifest": oManifest_Mixed_Valid_Invalid_Destinations,
					"host": this.oHost,
					"baseUrl": sBaseUrl
				});
				this.oCard.setHost(this.oHost);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oHost.destroy();
				this.oHost = null;
			}
		});

		QUnit.test("Resolve destinations", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				var aItems = this.oCard.getCardContent().getInnerList().getItems(),
					sFirstItemIcon = aItems[0].getIcon();

				// Assert
				assert.ok(aItems.length, "The data request is successful.");

				assert.strictEqual(this.oCard.getCardHeader().getTitle(), "Card Title", "header destination is resolved successfully");

				// Assert
				assert.notOk(sFirstItemIcon, "The icon path is not resolved.");

				done();
			}.bind(this));

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.module("No Host", {
			beforeEach: function () {

				this.oCard = new Card({
					"manifest": oManifest_Valid,
					"baseUrl": sBaseUrl
				});
				this.oCard.setHost(this.oHost);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Resolve destinations", function (assert) {
			checkInvalidDestinations.call(this, assert);
		});

		QUnit.test("Card.resolveDestination method", function (assert) {
			checkInvalidResolveDestinationMethod.call(this, assert);
		});

		QUnit.module("Default Url", {
			beforeEach: function () {
				this.oCard = new Card({
					"manifest": oManifest_DefaultUrl,
					"host": this.oHost,
					"baseUrl": sBaseUrl
				});
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Resolve destinations to default url", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard,
				oHost = new Host({
					resolveDestination: function() {
						return null;
					}
				});

			this.oCard.setHost(oHost);

			this.oCard.attachEvent("_ready", function () {
				var pTest1 = oCard.resolveDestination("test1"),
					pTest2 = oCard.resolveDestination("test2");

				Promise.all([pTest1, pTest2])
					.then(function (aResult) {
						assert.strictEqual(aResult[0], "test1/url", "Default url for test1 is correct.");
						assert.strictEqual(aResult[1], "test2/url", "Default url for test1 is correct.");

						done();
					});
			});

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Resolves default url without host", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard;

			this.oCard.attachEvent("_ready", function () {
				oCard.resolveDestination("test1").then(function (sUrl) {
					assert.strictEqual(sUrl, "test1/url", "Default url for test1 is correct.");
					done();
				});
			});

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Missing default url and name", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard;

			this.oCard.attachEvent("_ready", function () {
				oCard.resolveDestination("test3").catch(function () {
					assert.ok(true, "Fails to resolve destination without name or defaultUrl.");
					done();
				});
			});

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});
	}
);
