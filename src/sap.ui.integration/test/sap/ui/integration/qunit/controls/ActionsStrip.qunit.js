/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/controls/ActionsStrip",
	"sap/ui/integration/widgets/Card"
], function (
	Core,
	ActionsStrip,
	Card
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Initialization of buttons", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("No buttons defined", function (assert) {
		// Arrange
		var oActionsStrip = ActionsStrip.create(this.oCard, null);

		// Assert
		assert.notOk(oActionsStrip, "ActionsStrip is not created.");
	});

	QUnit.test("2 buttons defined", function (assert) {
		// Arrange
		var oActionsStrip = ActionsStrip.create(this.oCard, [
			{ text: "Text1" },
			{ text: "Text2" }
		]);

		// Assert
		assert.strictEqual(oActionsStrip._getToolbar().getContent().length, 3, "There should be 3 items added to the toolbar (including ToolbarSpacer)");
		assert.ok(oActionsStrip._getToolbar().getContent()[0].isA("sap.m.ToolbarSpacer"), "First item should be ToolbarSpacer");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.test("Explicitly added ToolbarSpacer", function (assert) {
		// Arrange
		var oActionsStrip = ActionsStrip.create(this.oCard, [
			{ text: "Text1" },
			{ text: "Text2", type: "ToolbarSpacer" }
		]);

		// Assert
		assert.strictEqual(oActionsStrip._getToolbar().getContent().length, 2, "There should be 2 items added to the toolbar");
		assert.ok(oActionsStrip._getToolbar().getContent()[1].isA("sap.m.ToolbarSpacer"), "Second item should be ToolbarSpacer");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.test("type=Button", function (assert) {
		// Arrange
		var oActionsStrip = ActionsStrip.create(this.oCard, [
			{ text: "Text1" },
			{ text: "Text2", type: "Button" }
		]);

		// Assert
		assert.ok(oActionsStrip._getToolbar().getContent()[1].isA("sap.m.Button"), "If no 'type' is specified, an sap.m.Button should be created");
		assert.ok(oActionsStrip._getToolbar().getContent()[2].isA("sap.m.Button"), "If 'type' is set to 'Button', an sap.m.Button should be created");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Card action is fired when button is pressed", function (assert) {
		// Arrange
		var oActionsStrip = ActionsStrip.create(this.oCard, [
			{
				text: "Text1",
				actions: [{
					type: "Custom"
				}]
			}
		]);
		oActionsStrip.placeAt(DOM_RENDER_LOCATION);
		oActionsStrip.enableItems();

		Core.applyChanges();
		this.oCard.attachAction(function (oEvent) {
			// Assert
			assert.ok(true, "Card action should be fired when button is pressed");

			// Clean up
			oActionsStrip.destroy();
		});

		// Act
		oActionsStrip._getToolbar().getContent()[1].$().trigger("tap");
	});

	QUnit.module("Enabled state", {
		beforeEach: function () {
			this.oCard = new Card({
				manifest: "test-resources/sap/ui/integration/qunit/testResources/card.footer.actions.manifest.json"
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Actions are disabled when some loading placeholder is active", function (assert) {
		// Arrange
		var done = assert.async(2);

		this.oCard.attachEvent("_footerReady", function () {
			var oFooter = this.oCard.getAggregation("_footer"),
				aItems = oFooter.getActionsStrip()._getToolbar().getContent();

			aItems.forEach(function (oItem) {
				if (oItem.getEnabled) {
					assert.notOk(oItem.getEnabled(), "Action is initially disabled");
				}
			});

			done();
		}.bind(this));

		this.oCard.attachEvent("_ready", function () {
			var oFooter = this.oCard.getAggregation("_footer"),
				aItems = oFooter.getActionsStrip()._getToolbar().getContent();

			assert.notOk(aItems[1].getEnabled(), "Enabled value is correct");
			assert.ok(aItems[2].getEnabled(), "Enabled value is correct");
			assert.ok(aItems[3].getEnabled(), "Enabled value is correct");
			assert.notOk(aItems[4].getEnabled(), "Enabled value is correct");

			this.oCard.showLoadingPlaceholders();
			Core.applyChanges();
			aItems.forEach(function (oItem) {
				if (oItem.getEnabled) {
					assert.notOk(oItem.getEnabled(), "Action is initially disabled");
				}
			});

			this.oCard.hideLoadingPlaceholders();
			Core.applyChanges();
			assert.notOk(aItems[1].getEnabled(), "Enabled value is correct");
			assert.ok(aItems[2].getEnabled(), "Enabled value is correct");
			assert.ok(aItems[3].getEnabled(), "Enabled value is correct");
			assert.notOk(aItems[4].getEnabled(), "Enabled value is correct");

			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});
});