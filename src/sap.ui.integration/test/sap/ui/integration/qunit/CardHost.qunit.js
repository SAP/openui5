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

		var oManifest = {
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
					"manifest": oManifest,
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
