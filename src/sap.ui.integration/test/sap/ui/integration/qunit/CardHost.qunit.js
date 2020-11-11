/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/ActionDefinition",
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core",
	"sap/ui/integration/Host",
	"sap/ui/qunit/QUnitUtils"
], function (
	ActionDefinition,
	Card,
	Core,
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
				"actions": [{
					"type": "Navigation"
				}]
			}
		}
	};

	var oContextsManifest = {
		"sap.app": {
			"id": "test2"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"userId": {
						"value": "{context>/sap.sample/user/id/value}"
					}
				}
			},
			"header": {
				"title": "{context>/sap.sample/user/name/value}",
				"subTitle": "{{parameters.userId}}"
			}
		}
	};

	QUnit.module("Actions toolbar", {
		beforeEach: function () {
			this.oHost = new Host({
				actions: [{
					type: 'Custom',
					text: 'Host action'
				}]
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

					oToolbar.getAggregation("_actionSheet").attachEvent("afterOpen", function () {
						// Assert
						assert.ok(oToolbar.getAggregation("_actionSheet").isOpen(), "Action sheet is opened after overflow button is pressed.");
						assert.ok(fnHeaderPressStub.notCalled, "Header press is not triggered.");
						done();
					});

					// Act
					QUnitUtils.triggerEvent("tap", oButton);
					Core.applyChanges();
				}
			});
		}.bind(this));

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});

	QUnit.test("Remove action item from card by index", function (assert) {
		// Arrange
		var done = assert.async(),
			oAI = new ActionDefinition({
				text: "Card action item"
			});

		this.oCard.attachEvent("_ready", function () {
			var oToolbar = this.oCard.getCardHeader().getToolbar(),
				oActionSheet = oToolbar.getAggregation("_actionSheet");
			Core.applyChanges();
			assert.strictEqual(oActionSheet.getButtons()[0].getText(), "Card action item", "First button in the menu is the one added by the card");
			assert.strictEqual(oActionSheet.getButtons()[1].getText(), "Host action", "Second button in the menu is the one added by the host");

			// Act
			this.oCard.removeActionDefinition(0);

			assert.strictEqual(oActionSheet.getButtons()[0].getText(), "Host action", "Action added from the host is still there");

			done();
		}.bind(this));

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
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

					oToolbar.getAggregation("_actionSheet").attachEvent("afterOpen", function () {
						// Assert
						assert.ok(oToolbar.getAggregation("_actionSheet").isOpen(), "Action sheet is opened after overflow button is pressed.");
						assert.ok(fnHeaderPressStub.notCalled, "Header press is not triggered.");
						done();
					});

					// Act
					QUnitUtils.triggerEvent("tap", oButton);
					Core.applyChanges();
				}
			});
		}.bind(this));

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});

	QUnit.module("Context", {
		beforeEach: function () {
			var oSamples = {
				"sap.sample/user/id/value": 15,
				"sap.sample/user/name/value": "User name"
			};

			this.oSamples = oSamples;

			this.oHost = new Host();

			this.oHost.getContextValue = function (sPath) {
				var sResult = oSamples[sPath];
				if (sResult) {
					return Promise.resolve(sResult);
				} else {
					return Promise.reject(sPath + " was not found.");
				}
			};

			this.oCard = new Card({
				"manifest": oContextsManifest,
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
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachEvent("_ready", function () {
			var oHeader = oCard.getCardHeader(),
				sTitle = oHeader.getTitle(),
				sSubtitle = oHeader.getSubtitle();

			// Assert
			assert.strictEqual(sTitle, "User name", "User name parameter is parsed correctly.");
			assert.strictEqual(sSubtitle, "15", "User id parameter is parsed correctly.");
			done();
		});

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});
});