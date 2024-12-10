/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/base/Log",
	"sap/ui/integration/Host",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/integration/cards/actions/CustomAction",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
],
function (
	Card,
	Log,
	Host,
	QUnitUtils,
	CustomAction,
	nextUIUpdate,
	nextCardReadyEvent
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
				"title": "Header sample"
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
	var oManifestExtensionPreventDefault = {
		"sap.app": {
			"id": "sap.ui.integration.test"
		},
		"sap.card": {
			"extension": "./testResources/extensions/ExtensionPreventDefault",
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

	QUnit.module("Actions sequence", {
		beforeEach: function () {
			this.oHost = new Host({
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
			this.spyCustomAction = this.spy(CustomAction.prototype, "execute");
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Actions sequence", async function (assert) {
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oHeader = this.oCard.getCardHeader(),
			oLogSpy = sinon.spy(Log, "error");

		//Act
		QUnitUtils.triggerEvent("tap", oHeader);

		//Assert
		assert.ok(oLogSpy.calledWith("Extension"), "Action called from extension");
		assert.ok(oLogSpy.calledWith("Card"), "Action called from card");
		assert.ok(oLogSpy.calledWith("Host"), "Action called from host");
		assert.strictEqual(oLogSpy.firstCall.args[0], "Extension", "Action first call was from the extension");
		assert.strictEqual(oLogSpy.secondCall.args[0], "Card", "Action second call was from the card");
		assert.strictEqual(oLogSpy.thirdCall.args[0], "Host", "Action third call was from the host");
		assert.ok(this.spyCustomAction.called, "The default action handler is executed.");

		//Cleanup
		oLogSpy.restore();
	});

	QUnit.module("Actions sequence extension prevents default", {
		beforeEach: function () {
			this.oHost = new Host({
				action: function (oEvent) {
					Log.error("Host");
				}
			});
			this.oCardHostPreventDefault = new Card({
				id: "card2",
				baseUrl: "test-resources/sap/ui/integration/qunit/",
				manifest: oManifestExtensionPreventDefault,
				host: this.oHost,
				action: function(oEvent) {
					Log.error("Card");
				}
			});
			this.spyCustomAction = this.spy(CustomAction.prototype, "execute");
		},
		afterEach: function () {
			this.oCardHostPreventDefault.destroy();
			this.oCardHostPreventDefault = null;
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Extension prevents default", async function (assert) {
		this.oCardHostPreventDefault.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCardHostPreventDefault);

		var oHeader = this.oCardHostPreventDefault.getCardHeader(),
			oLogSpy = sinon.spy(Log, "error");

		//Act
		QUnitUtils.triggerEvent("tap", oHeader);

		//Assert
		assert.ok(oLogSpy.calledWith("Extension"), "Action called from extension");
		assert.notOk(oLogSpy.calledWith("Card"), "Action not called from card");
		assert.notOk(oLogSpy.calledWith("Host"), "Action not called from host");
		assert.strictEqual(oLogSpy.firstCall.args[0], "Extension", "Action first call was from the extension");
		assert.strictEqual(oLogSpy.secondCall, null, "Action second call did not happen");
		assert.strictEqual(oLogSpy.thirdCall, null, "Action third call did not happen");
		assert.notOk(this.spyCustomAction.called, "The default action handler is not executed.");

		//Cleanup
		oLogSpy.restore();
	});

	QUnit.module("Actions sequence host prevents default", {
		beforeEach: function () {
			this.oHostPreventDefault = new Host({
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
			this.spyCustomAction = this.spy(CustomAction.prototype, "execute");
		},
		afterEach: function () {
			this.oCardHostPreventDefault.destroy();
			this.oCardHostPreventDefault = null;
			this.oHostPreventDefault.destroy();
			this.oHostPreventDefault = null;
		}
	});

	QUnit.test("Host prevents default", async function (assert) {
		this.oCardHostPreventDefault.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCardHostPreventDefault);

		var oHeader = this.oCardHostPreventDefault.getCardHeader(),
			oLogSpy = sinon.spy(Log, "error");

		//Act
		QUnitUtils.triggerEvent("tap", oHeader);

		//Assert
		assert.ok(oLogSpy.calledWith("Extension"), "Action called from extension");
		assert.ok(oLogSpy.calledWith("Card"), "Action called from card");
		assert.ok(oLogSpy.calledWith("Host"), "Action called from host");
		assert.strictEqual(oLogSpy.firstCall.args[0], "Extension", "Action first call was from the extension");
		assert.strictEqual(oLogSpy.secondCall.args[0], "Card", "Action second call was from the card");
		assert.strictEqual(oLogSpy.thirdCall.args[0], "Host", "Action third call was from the host");
		assert.notOk(this.spyCustomAction.called, "The default action handler is not executed.");

		//Cleanup
		oLogSpy.restore();
	});

	QUnit.module("Actions sequence card prevents default", {
		beforeEach: function () {
			this.oHost = new Host({
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
			this.spyCustomAction = this.spy(CustomAction.prototype, "execute");
		},
		afterEach: function () {
			this.oCardPreventDefault.destroy();
			this.oCardPreventDefault = null;
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Card prevents default", async function (assert) {
		this.oCardPreventDefault.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCardPreventDefault);

		var oHeader = this.oCardPreventDefault.getCardHeader(),
			oLogSpy = sinon.spy(Log, "error");

		//Act
		QUnitUtils.triggerEvent("tap", oHeader);

		//Assert
		assert.ok(oLogSpy.calledWith("Extension"), "Action called from extension");
		assert.ok(oLogSpy.calledWith("Card"), "Action called from card");
		assert.notOk(oLogSpy.calledWith("Host"), "Action not called from host");
		assert.strictEqual(oLogSpy.firstCall.args[0], "Extension", "Action first call was from the extension");
		assert.strictEqual(oLogSpy.secondCall.args[0], "Card", "Action second call was from the card");
		assert.strictEqual(oLogSpy.thirdCall, null, "Action not called third time");
		assert.notOk(this.spyCustomAction.called, "The default action handler is not executed.");

		//Cleanup
		oLogSpy.restore();
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

	QUnit.test("Action property 'text'", async function(assert) {
		// Arrange
		this.oHost.setActions([{
					type: 'Custom',
					text: 'Test text'
				}]);
		this.oCard.setHost(this.oHost);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oHeader = this.oCard.getCardHeader(),
			oToolbar = oHeader.getToolbar();

		// Assert
		assert.strictEqual(oToolbar.getAggregation("_actionsMenu").getItems()[0].getText(), "Test text", "The rendered action menu item text is the same as the host 'text' property");
	});

	QUnit.test("Action property 'tooltip'", async function(assert) {
		// Arrange
		this.oHost.setActions([{
			type: 'Custom',
			tooltip: 'Action button tooltip'
		}]);
		this.oCard.setHost(this.oHost);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oHeader = this.oCard.getCardHeader(),
			oToolbar = oHeader.getToolbar();

		// Assert
		assert.strictEqual(oToolbar.getAggregation("_actionsMenu").getItems()[0].getTooltip(), "Action button tooltip", "The rendered action button tooltip is the same as the host 'tooltip' property");
	});

	QUnit.test("Action property 'icon'", async function(assert) {
		// Arrange
		this.oHost.setActions([{
			type: 'Custom',
			icon: 'sap-icon://help'

		}]);
		this.oCard.setHost(this.oHost);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oHeader = this.oCard.getCardHeader(),
			oToolbar = oHeader.getToolbar();

		// Assert
		assert.strictEqual(oToolbar.getAggregation("_actionsMenu").getItems()[0].getIcon(), "sap-icon://help", "The rendered action button icon is the same as the host 'icon' property");
	});

	QUnit.test("Action property 'enabled' is true", async function(assert) {
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
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oHeader = this.oCard.getCardHeader(),
			oToolbar = oHeader.getToolbar();

		setTimeout(function () {
			oToolbar.getAggregation("_actionsMenu")._getVisualParent().getItems()[0].$().trigger("click");

			// Assert
			assert.ok(oSpyEnabled.called, "Host action is fired if host action is enabled.");
			done();
		});

		oToolbar.addEventDelegate({
			"onAfterRendering": function () {
				var oButton = oToolbar.getDomRef("overflowButton");

				// Act
				QUnitUtils.triggerEvent("tap", oButton);
			}
		});
	});

	QUnit.test("Action property 'enabled' is false", async function(assert) {
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
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oHeader = this.oCard.getCardHeader(),
			oToolbar = oHeader.getToolbar();

		setTimeout(function () {
			QUnitUtils.triggerEvent("tap", oToolbar.getAggregation("_actionsMenu").getItems()[0]);

			// Assert
			assert.notOk(oSpyDisabled.called, "Host action is not fired if host action is disabled.");
			done();
		});

		oToolbar.addEventDelegate({
			"onAfterRendering": function () {
				var oButton = oToolbar.getDomRef("overflowButton");

				// Act
				QUnitUtils.triggerEvent("tap", oButton);
			}
		});
	});

	QUnit.test("Action property 'visible'", async function(assert) {
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
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oHeader = this.oCard.getCardHeader(),
			oToolbar = oHeader.getToolbar();

		setTimeout(function () {
			// Assert
			assert.strictEqual(oToolbar.getAggregation("_actionsMenu").getItems()[0].getText(), "Visible", "If the host action property 'visible' is set to false the action button is rendered");
			assert.strictEqual(oToolbar.getAggregation("_actionsMenu").getItems()[1].getDomRef(), null, "If the host action property 'visible' is set to false the action button is not rendered");

			done();
		});

		oToolbar.addEventDelegate({
			"onAfterRendering": function () {
				var oButton = oToolbar.getDomRef("overflowButton");

				// Act
				QUnitUtils.triggerEvent("tap", oButton);
			}
		});
	});

	QUnit.test("Action property 'parameters'", async function (assert) {
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
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oHeader = this.oCard.getCardHeader(),
			oToolbar = oHeader.getToolbar();

		setTimeout(function () {
			// Assert
			oToolbar.getAggregation("_actionsMenu")._getVisualParent().getItems()[0].$().trigger("click");
			assert.ok(oWindowOpenStub.calledWith("https://www.sap.com"), "Action triggered with host 'url' parameter");

			//Cleanup
			oWindowOpenStub.restore();
			done();
		});

		oToolbar.addEventDelegate({
			"onAfterRendering": function () {
				var oButton = oToolbar.getDomRef("overflowButton");

				// Act
				QUnitUtils.triggerEvent("tap", oButton);
			}
		});
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

	QUnit.test("Empty header added for actions toolbar", async function(assert) {
		this.oHost.setActions([
			{
				type: 'Custom',
				text: 'Visible',
				visible: true
			}
		]);
		this.oCard.setHost(this.oHost);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oHeader = this.oCard.getCardHeader();

		assert.notOk(oHeader, "Empty header shouldn't be added only to hold the actions toolbar.");
	});

	QUnit.module("Actions for card with header", {
		beforeEach: function () {
			this.oHost = new Host();
			this.oCard = new Card({
				manifest: {
					"sap.app": {
						"id": "test4"
					},
					"sap.card": {
						"type": "List",
						"header": {
							"title": "Header Title"
						}
					}
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

	QUnit.test("Action property 'visible' is false", async function(assert) {
		// Arrange
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
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oHeader = this.oCard.getCardHeader();

		assert.ok(oHeader.getVisible(), "The header is still visible when all actions are not visible.");
	});

	QUnit.test("Actions toolbar button has aria-haspopup=menu", async function (assert) {
		// Arrange
		this.oHost.setActions([
			{
				type: 'Custom',
				text: 'Test'
			}
		]);
		this.oCard.setHost(this.oHost);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oToolbar = this.oCard.getCardHeader().getToolbar();

		assert.strictEqual(oToolbar.$("overflowButton").attr("aria-haspopup"), "menu", "The menu button has aria-haspopup=menu.");
	});

	QUnit.test("Actions toolbar support nested actions", async function (assert) {
		// Arrange
		const done = assert.async(),
			oStub = sinon.stub();

		this.oHost.setActions([{
			type: 'Custom',
			text: 'Test',
			actions: [{
				type: 'Custom',
				text: 'Nested Action',
				action: oStub
			}]
		}]);
		this.oCard.setHost(this.oHost);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oToolbar = this.oCard.getCardHeader().getToolbar(),
			oActionMenu = oToolbar.getAggregation("_actionsMenu");


		setTimeout(function () {
			// Act
			oActionMenu._getVisualParent().getItems()[0].$().trigger("click");
			oActionMenu._getVisualParent().getItems()[0].getSubmenu().getItems()[0].$().trigger("click");
			// Assert
			assert.ok(oStub.calledOnce, "Press event is fired on the nested item");
			done();
		}, 100);

		// Act
		oToolbar._getToolbar().$().trigger("tap");
		await nextUIUpdate();

		const oNestedItem = oActionMenu.getItems()[0].getItems()[0];

		assert.strictEqual(oNestedItem.getText(), "Nested Action", "Actions can be nested");

	});

	QUnit.test("Card is properly passed when function is used for visible/enabled property", async function (assert) {
		// Arrange
		this.oHost.setActions([
			{
				type: 'Custom',
				text: 'Visible',
				visible: function (oCard) {
					//Assert
					assert.ok(oCard, "Card is passed to the function");
					assert.strictEqual(oCard.getId(), this.oCard.getId(), "The proper card is passed to the function");
					return true;
				}.bind(this)
			},
			{
				type: 'Custom',
				text: 'Enabled',
				enabled: function (oCard) {
					//Assert
					assert.ok(oCard, "Card is passed to the function");
					assert.strictEqual(oCard.getId(), this.oCard.getId(), "The proper card is passed to the function");
					return true;
				}.bind(this)
			}
		]);
		this.oCard.setHost(this.oHost);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();
	});
});
