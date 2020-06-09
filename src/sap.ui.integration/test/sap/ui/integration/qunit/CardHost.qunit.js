/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core",
	"sap/base/Log",
	"sap/ui/integration/Host",
	"sap/ui/qunit/QUnitUtils"
],
	function (
		Card,
		Core,
		Log,
		Host,
		QUnitUtils
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		var oManifest_1 = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"myDestination": {
							"name": "Destination1"
						}
					}
				},
				"header": {
					"title": "Destinations sample",
					"actions": [
						{
							"type": "Navigation"
						}
					]
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

		var oManifest_2 = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Header sample",
					"actions": [
						{
							"type": "Navigation"
						}
					]
				}
			}
		};

		QUnit.module("Destinations", {
			beforeEach: function () {
				this.oHost = new Host({
					resolveDestination: function(sDestinationName) {
						switch (sDestinationName) {
							case "Destination1":
								return "test-resources/sap/ui/integration/qunit/manifests/";
							default:
								Log.error("Unknown destination.");
							break;
						}
					}
				});

				this.oCard = new Card({
					"manifest": oManifest_1,
					"host": this.oHost
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

		QUnit.test("Resolve destination in data request", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				var aItems = this.oCard.getCardContent().getInnerList().getItems();

				// Assert
				assert.ok(aItems.length, "The data request is successful.");

				done();
			}.bind(this));

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Resolve destination in list icons", function (assert) {

			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				var aItems = this.oCard.getCardContent().getInnerList().getItems(),
					sFirstItemIcon = aItems[0].getIcon(),
					sExpectedIcon = "test-resources/sap/ui/integration/qunit/manifests/Image1.png";

				// Assert
				assert.strictEqual(sFirstItemIcon, sExpectedIcon, "The icon path is correct.");

				done();
			}.bind(this));

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});


		QUnit.module("Actions toolbar", {
			beforeEach: function () {
				this.oHost = new Host({
					actions: [
						{
							type: 'Custom',
							text: 'Test'
						}
					]
				});

				this.oCard = new Card({
					"manifest": oManifest_2,
					"host": this.oHost
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

		QUnit.test("Click on actions toolbar", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				var oHeader = this.oCard.getCardHeader(),
					fnHeaderPressStub = sinon.stub(),
					oToolbar = oHeader.getToolbar();

				oHeader.attachEvent("press", function () {
					fnHeaderPressStub();
				});

				oToolbar.addEventDelegate({
					"onAfterRendering": function () {
						var oButton = oToolbar.getDomRef("overflowButton");

						// Act
						QUnitUtils.triggerEvent("tap", oButton);
						Core.applyChanges();

						oToolbar._oActionSheet.attachEvent("afterOpen", function () {
							// Assert
							assert.ok(oToolbar._oActionSheet.isOpen(), "Action sheet is opened after overflow button is pressed.");
							assert.ok(fnHeaderPressStub.notCalled, "Header press is not triggered.");
							done();
						});
					}
				});
			}.bind(this));

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});
	}
);
