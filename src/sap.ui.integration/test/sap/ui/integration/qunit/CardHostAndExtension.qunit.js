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
			"id": "sap.ui.integration.test"
		},
		"sap.card": {
			"extension": "./testResources/extensions/ExtensionSample",
			"type": "List",
			"header": {
				"title": "Header sample",
				"actions": [
					{
						"type": "Custom"
					}
				]
			}
		}
	};
	var oManifestPropertiesTest = {
		"sap.app": {
			"id": "test2"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Header sample",
				"actions": [
					{
						"type": "Custom"
					},
					{
						"type": "Navigation"
					}
				]
			}
		}
	};
	var oManifestNoHeaderTest = {
		"sap.app": {
			"id": "test3"
		},
		"sap.card": {
			"type": "List"
		}
	};

	QUnit.module("Actions sequence", {
		beforeEach: function () {
			this.oHost = new Host({
				actions: [{
						type: 'Custom',
						text: 'Text'
					}
				],
				action: function (oEvent) {
					Log.error("Host");
				}
			});
			this.oCard = new Card({
				id: "card1",
				baseUrl: "test-resources/sap/ui/integration/qunit/",
				manifest: oManifest,
				host: this.oHost,
				action: function(oEvent) {
					Log.error("Card");
				}
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Actions sequence", function (assert) {
		//Arrange
		var done = assert.async();
		this.oCard.attachEvent("_ready", function () {
			var oHeader = this.oCard.getCardHeader(),
				oLogSpy = sinon.spy(Log, "error");

			//Act
			QUnitUtils.triggerEvent("tap", oHeader);

			//Assert
			assert.ok(oLogSpy.calledWith("Card"), "Action called from card");
			assert.ok(oLogSpy.calledWith("Host"), "Action called from host");
			assert.ok(oLogSpy.calledWith("Extension"), "Action called from extension");
			assert.strictEqual(oLogSpy.firstCall.args[0], "Card", "Action first call was from the card");
			assert.strictEqual(oLogSpy.secondCall.args[0], "Host", "Action second call was from the host");
			assert.strictEqual(oLogSpy.thirdCall.args[0], "Extension", "Action third call was from the extension");

			//Cleanup
			oLogSpy.restore();
			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});

	QUnit.module("Actions sequence host prevents default", {
		beforeEach: function () {
			this.oHostPreventDefault = new Host({
				actions: [{
						type: 'Custom',
						text: 'Text'
					}
				],
				action: function (oEvent) {
					Log.error("Host");
					oEvent.preventDefault();
				}
			});
			this.oCardHostPreventDefault = new Card({
				id: "card2",
				baseUrl: "test-resources/sap/ui/integration/qunit/",
				manifest: oManifest,
				host: this.oHostPreventDefault,
				action: function(oEvent) {
					Log.error("Card");
				}
			});
		},
		afterEach: function () {
			this.oCardHostPreventDefault.destroy();
			this.oCardHostPreventDefault = null;
			this.oHostPreventDefault.destroy();
			this.oHostPreventDefault = null;
		}
	});

	QUnit.test("Host prevents default", function (assert) {
		//Arrange
		var done = assert.async();
		this.oCardHostPreventDefault.attachEvent("_ready", function () {
			var oHeader = this.oCardHostPreventDefault.getCardHeader(),
				oLogSpy = sinon.spy(Log, "error");

			//Act
			QUnitUtils.triggerEvent("tap", oHeader);

			//Assert
			assert.ok(oLogSpy.calledWith("Card"), "Action called from card");
			assert.ok(oLogSpy.calledWith("Host"), "Action called from host");
			assert.notOk(oLogSpy.calledWith("Extension"), "Action not called from extension");
			assert.strictEqual(oLogSpy.firstCall.args[0], "Card", "Action first call was from the card");
			assert.strictEqual(oLogSpy.secondCall.args[0], "Host", "Action second call was from the host");
			assert.strictEqual(oLogSpy.thirdCall, null, "Action not called third time");

			//Cleanup
			oLogSpy.restore();
			done();
		}.bind(this));

		this.oCardHostPreventDefault.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});

	QUnit.module("Actions sequence card prevents default", {
		beforeEach: function () {
			this.oHost = new Host({
				actions: [{
						type: 'Custom',
						text: 'Text'
					}
				],
				action: function (oEvent) {
					Log.error("Host");
				}
			});
			this.oCardPreventDefault = new Card({
				id: "card3",
				baseUrl: "test-resources/sap/ui/integration/qunit/",
				manifest: oManifest,
				host: this.oHost,
				action: function(oEvent) {
					Log.error("Card");
					oEvent.preventDefault();
				}
			});
		},
		afterEach: function () {
			this.oCardPreventDefault.destroy();
			this.oCardPreventDefault = null;
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Card prevents default", function (assert) {
		//Arrange
		var done = assert.async();
		this.oCardPreventDefault.attachEvent("_ready", function () {
			var oHeader = this.oCardPreventDefault.getCardHeader(),
				oLogSpy = sinon.spy(Log, "error");

			//Act
			QUnitUtils.triggerEvent("tap", oHeader);

			//Assert
			assert.ok(oLogSpy.calledWith("Card"), "Action called from card");
			assert.notOk(oLogSpy.calledWith("Host"), "Action not called from host");
			assert.notOk(oLogSpy.calledWith("Extension"), "Action not called from extension");
			assert.strictEqual(oLogSpy.firstCall.args[0], "Card", "Action first call was from the card");
			assert.strictEqual(oLogSpy.secondCall, null, "Action not called second time");

			//Cleanup
			oLogSpy.restore();
			done();
		}.bind(this));

		this.oCardPreventDefault.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});

	QUnit.module("CardMenuAction properties", {
		beforeEach: function () {
			this.oHost = new Host();
			this.oCard = new Card({
				manifest: oManifestPropertiesTest
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Action property 'text'", function(assert) {
		// Arrange
		var done = assert.async();
		this.oHost.setActions([{
					type: 'Custom',
					text: 'Test text'
				}]);
		this.oCard.setHost(this.oHost);

		this.oCard.attachEvent("_ready", function () {
			var oHeader = this.oCard.getCardHeader(),
				oToolbar = oHeader.getToolbar();

			Core.applyChanges();

			// Assert
			assert.strictEqual(oToolbar.getAggregation("_actionSheet").getButtons()[0].getText(), "Test text", "The rendered action button text is the same as the host 'text' property");
			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Action property 'buttonType'", function(assert) {
		// Arrange
		var done = assert.async();

		this.oHost.setActions([{
			type: 'Custom',
			buttonType: 'Accept'
		}]);
		this.oCard.setHost(this.oHost);

		this.oCard.attachEvent("_ready", function () {
			var oHeader = this.oCard.getCardHeader(),
				oToolbar = oHeader.getToolbar();

			Core.applyChanges();

			// Assert
			assert.strictEqual(oToolbar.getAggregation("_actionSheet").getButtons()[0].getType(), "Accept", "The rendered action button type is the same as the host 'buttonType' property");
			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Action property 'tooltip'", function(assert) {
		// Arrange
		var done = assert.async();
		this.oHost.setActions([{
			type: 'Custom',
			tooltip: 'Action button tooltip'
		}]);
		this.oCard.setHost(this.oHost);

		this.oCard.attachEvent("_ready", function () {
			var oHeader = this.oCard.getCardHeader(),
				oToolbar = oHeader.getToolbar();

			Core.applyChanges();

			// Assert
			assert.strictEqual(oToolbar.getAggregation("_actionSheet").getButtons()[0].getTooltip(), "Action button tooltip", "The rendered action button tooltip is the same as the host 'tooltip' property");
			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Action property 'icon'", function(assert) {
		// Arrange
		var done = assert.async();
		this.oHost.setActions([{
			type: 'Custom',
			icon: 'sap-icon://help'

		}]);
		this.oCard.setHost(this.oHost);

		this.oCard.attachEvent("_ready", function () {
			var oHeader = this.oCard.getCardHeader(),
				oToolbar = oHeader.getToolbar();

			Core.applyChanges();

			// Assert
			assert.strictEqual(oToolbar.getAggregation("_actionSheet").getButtons()[0].getIcon(), "sap-icon://help", "The rendered action button icon is the same as the host 'icon' property");
			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});


	QUnit.test("Action property 'enabled' is true", function(assert) {
		// Arrange
		var done = assert.async(),
			oSpyEnabled = sinon.spy();

		this.oHost.setActions([
			{
				type: 'Custom',
				text: 'Test text',
				enabled: true,
				action: function (oCard) {
					oSpyEnabled();
				}
			}
		]);
		this.oCard.setHost(this.oHost);

		this.oCard.attachEvent("_ready", function () {
			var oHeader = this.oCard.getCardHeader(),
				oToolbar = oHeader.getToolbar();
			oToolbar.addEventDelegate({
				"onAfterRendering": function () {
					var oButton = oToolbar.getDomRef("overflowButton");
					// Act
					QUnitUtils.triggerEvent("tap", oButton);
					Core.applyChanges();

					oToolbar.getAggregation("_actionSheet").attachEvent("afterOpen", function () {

						QUnitUtils.triggerEvent("tap", oToolbar.getAggregation("_actionSheet").getButtons()[0]);
						// Assert
						assert.ok(oSpyEnabled.called, "Host action is fired if host action is enabled.");
						done();
					});
				}
			});
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Action property 'enabled' is false", function(assert) {
		// Arrange
		var done = assert.async(),
			oSpyDisabled = sinon.spy();

		this.oHost.setActions([
			{
				type: 'Custom',
				text: 'Disabled',
				enabled: false,
				action: function (oCard) {
					oSpyDisabled();
				}
			}
		]);
		this.oCard.setHost(this.oHost);

		this.oCard.attachEvent("_ready", function () {
			var oHeader = this.oCard.getCardHeader(),
				oToolbar = oHeader.getToolbar();
			oToolbar.addEventDelegate({
				"onAfterRendering": function () {
					var oButton = oToolbar.getDomRef("overflowButton");
					// Act
					QUnitUtils.triggerEvent("tap", oButton);
					Core.applyChanges();

					oToolbar.getAggregation("_actionSheet").attachEvent("afterOpen", function () {

						QUnitUtils.triggerEvent("tap", oToolbar.getAggregation("_actionSheet").getButtons()[0]);

						// Assert
						assert.notOk(oSpyDisabled.called, "Host action is not fired if host action is disabled.");
						done();
					});
				}
			});
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Action property 'visible'", function(assert) {
		// Arrange
		var done = assert.async();

		this.oHost.setActions([
			{
				type: 'Custom',
				text: 'Visible',
				visible: true
			},
			{
				type: 'Custom',
				text: 'Invisible',
				visible: false
			}
		]);
		this.oCard.setHost(this.oHost);

		this.oCard.attachEvent("_ready", function () {
			var oHeader = this.oCard.getCardHeader(),
				oToolbar = oHeader.getToolbar();
			oToolbar.addEventDelegate({
				"onAfterRendering": function () {
					var oButton = oToolbar.getDomRef("overflowButton");

					// Act
					QUnitUtils.triggerEvent("tap", oButton);
					Core.applyChanges();

					oToolbar.getAggregation("_actionSheet").attachEvent("afterOpen", function () {

						// Assert
						assert.strictEqual(oToolbar.getAggregation("_actionSheet").getButtons()[0].getText(), "Visible", "If the host action property 'visible' is set to false the action button is rendered");
						assert.strictEqual(oToolbar.getAggregation("_actionSheet").getButtons()[1].getDomRef(), null, "If the host action property 'visible' is set to false the action button is not rendered");

						done();
					});
				}
			});
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Action property 'parameters'", function(assert) {
		// Arrange
		var done = assert.async(),
			oWindowOpenStub = sinon.stub(window, 'open');

		this.oHost.setActions([{

			type: 'Navigation',
			text: "Test",
			parameters: {
				url: "https://www.sap.com"
			}
		}]);
		this.oCard.setHost(this.oHost);

		this.oCard.attachEvent("_ready", function () {
			var oHeader = this.oCard.getCardHeader(),
				oToolbar = oHeader.getToolbar();
			oToolbar.addEventDelegate({
				"onAfterRendering": function () {
					var oButton = oToolbar.getDomRef("overflowButton");
					// Act
					QUnitUtils.triggerEvent("tap", oButton);
					Core.applyChanges();

					oToolbar.getAggregation("_actionSheet").attachEvent("afterOpen", function () {

						// Assert
						QUnitUtils.triggerEvent("tap", oToolbar.getAggregation("_actionSheet").getButtons()[0]);
						assert.ok(oWindowOpenStub.calledWith("https://www.sap.com"), "Action triggered with host 'url' parameter");

						//Cleanup
						oWindowOpenStub.restore();
						done();
					});
				}
			});
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});

	QUnit.module("Actions for card with no header", {
		beforeEach: function () {
			this.oHost = new Host();
			this.oCard = new Card({
				manifest: oManifestNoHeaderTest
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Header added for actions toolbar", function(assert) {
		// Arrange
		var done = assert.async();

		this.oHost.setActions([
			{
				type: 'Custom',
				text: 'Visible',
				visible: true
			}
		]);
		this.oCard.setHost(this.oHost);

		this.oCard.attachEvent("_ready", function () {
			var oHeader = this.oCard.getCardHeader();

			assert.ok(oHeader, "There is a header added to hold the actions toolbar.");

			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Action property 'visible' is false", function(assert) {
		// Arrange
		var done = assert.async();

		this.oHost.setActions([
			{
				type: 'Custom',
				text: 'Invisible 1',
				visible: function () {
					return Promise.resolve(false);
				}
			},
			{
				type: 'Custom',
				text: 'Invisible 2',
				visible: function () {
					return Promise.resolve(false);
				}
			}
		]);
		this.oCard.setHost(this.oHost);

		this.oCard.attachEvent("_ready", function () {
			var oHeader = this.oCard.getCardHeader();
			Core.applyChanges();

			assert.notOk(oHeader.getVisible(), "The header is not visible when all actions are not visible.");

			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Actions toolbar button has aria-haspopup=menu", function(assert) {
		// Arrange
		var done = assert.async();

		this.oHost.setActions([
			{
				type: 'Custom',
				text: 'Test'
			}
		]);
		this.oCard.setHost(this.oHost);

		this.oCard.attachEvent("_ready", function () {
			var oToolbar = this.oCard.getCardHeader().getToolbar();
			Core.applyChanges();

			assert.strictEqual(oToolbar.$("overflowButton").attr("aria-haspopup"), "menu", "The menu button has aria-haspopup=menu.");

			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});
});
