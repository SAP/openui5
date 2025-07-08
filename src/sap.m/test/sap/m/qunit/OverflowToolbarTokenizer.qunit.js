/*global QUnit */

sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Tokenizer",
	"sap/m/OverflowToolbarTokenizer",
	"sap/m/Token",
	"sap/m/Title",
	"sap/ui/core/Icon",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/OverflowToolbar",
	"sap/m/Text",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/MultiInput",
	"sap/ui/base/Event",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery"
], function(
	nextUIUpdate,
	Element,
	Library1,
	qutils,
	createAndAppendDiv,
	Tokenizer,
	OverflowToolbarTokenizer,
	Token,
	Title,
	Icon,
	ToolbarSpacer,
	Button,
	OverflowToolbar,
	Text,
	Dialog,
	Label,
	MultiInput,
	Event,
	Device,
	KeyCodes,
	Library,
	JSONModel,
	jQuery
) {
	"use strict";

	createAndAppendDiv("content");

	QUnit.module("Initialization", {
		beforeEach: function() {
			this.oOTBTokenizer = new OverflowToolbarTokenizer({
				labelText: "Test Label"
			});
		},
		afterEach: function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;
		}
	});

	QUnit.test("Control is instantiated", function(assert) {
		assert.ok(this.oOTBTokenizer, "OverflowToolbarTokenizer created");
		assert.strictEqual(this.oOTBTokenizer.getLabelText(), "Test Label", "Label text set correctly on initialization");
	});

	QUnit.test("No tokens initially", function(assert) {
		assert.strictEqual(this.oOTBTokenizer.getTokens().length, 0, "Initially there are no tokens");
	});

	QUnit.module("Basic Token Handling", {
		beforeEach: function() {
			this.oOTBTokenizer = new OverflowToolbarTokenizer().placeAt("content");
		},
		afterEach: function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;
		}
	});

	QUnit.test("Add tokens", async function(assert) {
		var done = assert.async();
		this.oOTBTokenizer.addToken(new Token({ text: "Token A" }));
		this.oOTBTokenizer.addToken(new Token({ text: "Token B" }));

		await nextUIUpdate();
		assert.strictEqual(this.oOTBTokenizer.getTokens().length, 2, "Tokens successfully added");
		done();
	});

	QUnit.test("Remove a token", async function(assert) {
		var done = assert.async();
		var oToken = new Token({ text: "Token to Remove" });
		this.oOTBTokenizer.addToken(oToken);

		await nextUIUpdate();
		assert.strictEqual(this.oOTBTokenizer.getTokens().length, 1, "One token added");

		this.oOTBTokenizer.removeToken(oToken);
		await nextUIUpdate();

		assert.strictEqual(this.oOTBTokenizer.getTokens().length, 0, "Token successfully removed");
		done();
	});

	QUnit.test("Firing tokenDelete event", async function(assert) {
		const oTokenDeleteSpy = this.spy(this.oOTBTokenizer, "fireTokenDelete");
		const oToken = new Token({ text: "Token to Remove" });

		const oEvent = {
			getParameter: function () {
				return this.oOTBTokenizer._getTokensList().getItems()[0];
			}.bind(this)
		};

		this.oOTBTokenizer.addToken(oToken);
		await nextUIUpdate();

		this.oOTBTokenizer._handleNMoreIndicatorPress();
		await nextUIUpdate();

		this.oOTBTokenizer._handleListItemDelete(oEvent);
		await nextUIUpdate();


		assert.ok(oTokenDeleteSpy.called, "Token Delete event should be called");
	});

	QUnit.module("Label Behavior", {
		beforeEach: function() {
			this.oOTBTokenizer = new OverflowToolbarTokenizer({
				labelText: "Some Label"
			}).placeAt("content");
		},
		afterEach: function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;
		}
	});

	QUnit.test("Change labelText property", async function(assert) {
		this.oOTBTokenizer.setLabelText("New Label");

		await nextUIUpdate();

		assert.strictEqual(this.oOTBTokenizer.getLabelText(), "New Label", "Label text property successfully changed");
	});

	QUnit.module("Forced Narrow Mode", {
		beforeEach: async function() {
			this.oOTBTokenizer = new OverflowToolbarTokenizer({
				labelText: "Some Label",
				width: "35%",
				tokens: [
					new Token({text: "Token 1", key: "0001"}),
					new Token({text: "Token 2", key: "0002"}),
					new Token({text: "Token 3", key: "0003"}),
					new Token({text: "Token 4 - long text example", key: "0004"}),
					new Token({text: "Token 5", key: "0005"}),
					new Token({text: "Token 6", key: "0006"}),
					new Token({text: "Token 7", key: "0007"}),
					new Token({text: "Token 8", key: "0008"}),
					new Token({text: "Token 9 - long text example 2", key: "0009"}),
					new Token({text: "Token 10", key: "0010"})
				]
			});

			this.oOTBTokenizer = new OverflowToolbarTokenizer();
			this.overflowToolbarWithTokenizer = new OverflowToolbar("overflow-toolbar", {
				width: '100%',
				ariaHasPopup: "dialog",
				tooltip : "This is a bar with tokenizer",
				content : [
				new Button({
						text : "Filter",
						type : "Default"
					}),
					this.oOTBTokenizer,
					new Title({text: "Title with Icon", level: "H1"}),
					new Icon({src : "sap-icon://collaborate"}),
					new ToolbarSpacer(),
					new Text({text: "Just a Simple Text"}),
					new Button({
						text : "Accept",
						type: "Accept"
					})
				]
			});

			this.overflowToolbarWithTokenizer.placeAt("content");
			await nextUIUpdate();

		},
		afterEach: function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;

			this.overflowToolbarWithTokenizer.destroy();
			this.overflowToolbarWithTokenizer = null;
		}
	});

	QUnit.test("Set overflow render mode", async function(assert) {
		this.oOTBTokenizer.setOverflowMode(true);
		await nextUIUpdate();

		assert.ok(this.oOTBTokenizer.getRenderMode(), "Overflow", "Overflow render mode is set");

		this.oOTBTokenizer.setOverflowMode(false);
		await nextUIUpdate();

		assert.ok(this.oOTBTokenizer.getRenderMode(false), "Narrow", "Overflow render mode is disabled");
	});

	QUnit.module("Keyboard and Focus Handling", {
		beforeEach: async function() {
			this.oButton = new Button({
				text : "Filter",
				type : "Default"
			});
			this.oOTBTokenizer = new OverflowToolbarTokenizer({
				labelText: "Some Label",
				width: "35%",
				tokens: [
					new Token({text: "Token 1", key: "0001"}),
					new Token({text: "Token 2", key: "0002"}),
					new Token({text: "Token 3", key: "0003"}),
					new Token({text: "Token 4 - long text example", key: "0004"}),
					new Token({text: "Token 5", key: "0005"}),
					new Token({text: "Token 6", key: "0006"}),
					new Token({text: "Token 7", key: "0007"}),
					new Token({text: "Token 8", key: "0008"}),
					new Token({text: "Token 9 - long text example 2", key: "0009"}),
					new Token({text: "Token 10", key: "0010"})
				]
			});

			this.oOverflowToolbarWithTokenizer = new OverflowToolbar("overflow-toolbar", {
				width: '100%',
				ariaHasPopup: "dialog",
				tooltip : "This is a bar with tokenizer",
				content : [
					this.oButton,
					this.oOTBTokenizer,
					new Title({text: "Title with Icon", level: "H1"}),
					new Icon({src : "sap-icon://collaborate"}),
					new ToolbarSpacer(),
					new Text({text: "Just a Simple Text"}),
					new Button({
						text : "Accept",
						type: "Accept"
					})
				]
			});

			this.oOverflowToolbarWithTokenizer.placeAt("content");
			await nextUIUpdate();

	},
	afterEach: function() {
		this.oOTBTokenizer.destroy();
		this.oOTBTokenizer = null;

		this.oOverflowToolbarWithTokenizer.destroy();
		this.oOverflowToolbarWithTokenizer = null;
	}
	});

	QUnit.test("First token should have tabindex=0", async function(assert) {
		const oFirstToken = this.oOTBTokenizer.getTokens()[0];
		const oMockEvent = { srcControl: oFirstToken };

		await nextUIUpdate();

		this.oOTBTokenizer.onfocusin(oMockEvent);
		assert.strictEqual(oFirstToken.getDomRef().getAttribute("tabindex"), "0", "The first token has tabindex 0 on focusin");
	});

	QUnit.module("Switching between narrow and overflow modes", {
		beforeEach: function() {
			this.oOTBTokenizer = new sap.m.OverflowToolbarTokenizer({
				labelText: "Mode Test",
				tokens: [
					new sap.m.Token({ text: "Sample Token 1" }),
					new sap.m.Token({ text: "Sample Token 2" })
				]
			}).placeAt("content");
		},
		afterEach: async function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;
			await nextUIUpdate();
		}
	});

	QUnit.test("Set renderMode from Narrow to Overflow and back", async function(assert) {
		assert.strictEqual(
			this.oOTBTokenizer.getRenderMode(),
			"Narrow",
			"Default render mode is Narrow"
		);

		this.oOTBTokenizer.setProperty("renderMode", "Overflow");
		await nextUIUpdate();
		assert.strictEqual(
			this.oOTBTokenizer.getRenderMode(),
			"Overflow",
			"Render mode is changed to Overflow"
		);

		this.oOTBTokenizer.setProperty("renderMode", "Narrow");
		await nextUIUpdate();
		assert.strictEqual(
			this.oOTBTokenizer.getRenderMode(),
			"Narrow",
			"Render mode is switched back to Narrow"
		);
	});

	QUnit.module("Private API for Label Aggregation", {
		beforeEach: function() {
			this.oOTBTokenizer = new sap.m.OverflowToolbarTokenizer({labelText: "Initial Label"});
			this.oOTBTokenizer.placeAt("content");
		},
		afterEach: async function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;
			await nextUIUpdate();
		}
	});

	QUnit.test("Change labelText repeatedly", async function(assert) {
		assert.strictEqual(
			this.oOTBTokenizer.getLabelText(),
			"Initial Label",
			"Label text is initially set"
		);

		this.oOTBTokenizer.setLabelText("Another Label");
		await nextUIUpdate();
		assert.strictEqual(
			this.oOTBTokenizer.getLabelText(),
			"Another Label",
			"Label text updated the first time"
		);

		this.oOTBTokenizer.setLabelText("Final Label");
		await nextUIUpdate();
		assert.strictEqual(
			this.oOTBTokenizer.getLabelText(),
			"Final Label",
			"Label text successfully updated a second time"
		);
	});

	QUnit.test("Aggregation 'label' is created only when labelText is set", async function(assert) {
		assert.equal(this.oOTBTokenizer.getAggregation("label"), null, "No 'label' aggregation initially");

		this.oOTBTokenizer.setLabelText("New Label");
		await nextUIUpdate();
		assert.ok(this.oOTBTokenizer.getAggregation("label"), "'label' aggregation created after labelText is set");
		assert.equal(this.oOTBTokenizer.getAggregation("label").getText(), "New Label", "Label text matches property");

		this.oOTBTokenizer.setLabelText("");
		await nextUIUpdate();
		assert.notOk(this.oOTBTokenizer.getAggregation("label"), "When the 'labelText' property is emptied, the label aggregation is removed");
	});

	QUnit.test("Aggregation 'label' updates text if labelText is changed repeatedly", async function(assert) {
		this.oOTBTokenizer.setLabelText("Initial Label");
		await nextUIUpdate();

		const oLabel = this.oOTBTokenizer.getAggregation("label");
		assert.ok(oLabel, "Label is created");
		assert.equal(oLabel.getText(), "Initial Label", "Label text is correct initially");

		// Update labelText property
		this.oOTBTokenizer.setLabelText("Updated Label");
		await nextUIUpdate();
		assert.equal(oLabel.getText(), "Updated Label", "Label text is updated");
	});

	QUnit.module("Private API for moreItemsButton Aggregation", {
		beforeEach: function() {
			this.oOTBTokenizer = new sap.m.OverflowToolbarTokenizer({
				labelText: "Test Label"
			});
			this.oOTBTokenizer.placeAt("content");
		},
		afterEach: async function() {
			this.oOTBTokenizer.destroy();
			this.oOTBTokenizer = null;
			await nextUIUpdate();
		}
	});

	QUnit.test("Aggregation 'moreItemsButton' is created initially as a private aggregation", async function(assert) {
		assert.strictEqual(this.oOTBTokenizer.getAggregation("moreItemsButton"), null, "moreItemsButton aggregation is null initially");

		this.oOTBTokenizer.setProperty("labelText", "This will become the button text");
		await nextUIUpdate();
		this.oOTBTokenizer.setProperty("renderMode", "Overflow");
		await nextUIUpdate();

		const oButton = this.oOTBTokenizer.getAggregation("moreItemsButton");

		assert.ok(oButton, "'moreItemsButton' is created in Overflow render mode");
		assert.ok(oButton.isA("sap.m.Button"), "Aggregation is indeed a sap.m.Button");
		assert.strictEqual(oButton.getText(), "This will become the button text", "The button text matches the labelText property");
	});

	QUnit.test("Update labelText changes 'moreItemsButton' text in Overflow mode", async function(assert) {
		this.oOTBTokenizer.setProperty("labelText", "Button text");
		await nextUIUpdate();
		this.oOTBTokenizer.setProperty("renderMode", "Overflow");
		await nextUIUpdate();

		const oButton = this.oOTBTokenizer.getAggregation("moreItemsButton");
		assert.ok(oButton, "Button has been created");

		const sInitialLabel = this.oOTBTokenizer.getLabelText();
		assert.strictEqual(oButton.getText(), sInitialLabel, "Button text matches the initial label text");

		this.oOTBTokenizer.setLabelText("Changed button text");
		await nextUIUpdate();

		assert.strictEqual(oButton.getText(), "Changed button text", "Button text updated when label changes");
	});

	QUnit.test("Removing the labelText does not break 'moreItemsButton' in Overflow mode", async function(assert) {
		this.oOTBTokenizer.setProperty("renderMode", "Overflow");
		await nextUIUpdate();

		const oButton = this.oOTBTokenizer.getAggregation("moreItemsButton");

		this.oOTBTokenizer.setLabelText("");
		await nextUIUpdate();

		assert.strictEqual(oButton.getText(), "", "Button text is cleared if label text is empty");
	});
});
