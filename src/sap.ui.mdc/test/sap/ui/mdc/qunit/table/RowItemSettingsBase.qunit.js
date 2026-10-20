/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/table/RowItemSettingsBase",
	"sap/ui/mdc/list/ItemSettings",
	"sap/ui/mdc/list/ItemActionItem",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/mdc/table/RowActionItem",
	"sap/ui/model/json/JSONModel"
], function(RowItemSettingsBase, ItemSettings, ItemActionItem, RowSettings, RowActionItem, JSONModel) {
	"use strict";

	QUnit.module("Base");

	QUnit.test("is abstract", function(assert) {
		assert.ok(RowItemSettingsBase.getMetadata().isAbstract(), "RowItemSettingsBase is abstract");
	});

	QUnit.test("shared properties with defaults", function(assert) {
		const oMetadata = RowItemSettingsBase.getMetadata();
		assert.strictEqual(oMetadata.getProperty("highlight").getDefaultValue(), "None", "highlight default");
		assert.strictEqual(oMetadata.getProperty("highlightText").getDefaultValue(), "", "highlightText default");
		assert.strictEqual(oMetadata.getProperty("navigated").getDefaultValue(), false, "navigated default");
	});

	QUnit.module("getAllSettings (via ItemSettings)", {
		afterEach: function() {
			this.oSettings?.destroy();
		}
	});

	QUnit.test("static values", function(assert) {
		this.oSettings = new ItemSettings({highlight: "Error", highlightText: "has error", navigated: true});
		assert.deepEqual(this.oSettings.getAllSettings(), {
			navigated: true,
			highlight: "Error",
			highlightText: "has error"
		}, "static values returned");
	});

	QUnit.test("bound values return binding infos", function(assert) {
		this.oSettings = new ItemSettings({highlight: "{/highlight}", navigated: "{/navigated}"});
		this.oSettings.setModel(new JSONModel({highlight: "Warning", navigated: true}));
		const mSettings = this.oSettings.getAllSettings();
		assert.ok(mSettings.highlight.parts, "highlight is a binding info");
		assert.ok(mSettings.navigated.parts, "navigated is a binding info");
		assert.strictEqual(mSettings.highlightText, "", "unbound highlightText is a static value");
	});

	QUnit.module("getAllActions / getEffectiveActionCount", {
		afterEach: function() {
			this.oSettings?.destroy();
		}
	});

	QUnit.test("ItemSettings: static actions, template keys exclude type", function(assert) {
		this.oSettings = new ItemSettings({
			itemActions: [new ItemActionItem({text: "A"}), new ItemActionItem({text: "B"})]
		});
		const mActions = this.oSettings.getAllActions();
		assert.strictEqual(mActions.items.length, 2, "static actions returned");
		assert.notOk(mActions.templateInfo, "no templateInfo for static actions");
		assert.strictEqual(this.oSettings.getEffectiveItemActionCount(), 2, "count derived from aggregation length");
	});

	QUnit.test("ItemSettings: bound actions produce templateInfo without type", function(assert) {
		this.oSettings = new ItemSettings({
			itemActions: {path: "/actions", template: new ItemActionItem({text: "{label}", icon: "{icon}"})}
		});
		this.oSettings.setModel(new JSONModel({actions: [{label: "X", icon: "sap-icon://add"}]}));
		const mActions = this.oSettings.getAllActions();
		assert.ok(mActions.items.template, "binding info with template returned");
		assert.deepEqual(Object.keys(mActions.templateInfo).sort(), ["icon", "text", "visible"], "templateInfo omits type");
		assert.strictEqual(this.oSettings.getEffectiveItemActionCount(), 1, "bound actions default count to 1");
	});

	QUnit.test("ItemSettings: explicit itemActionCount wins", function(assert) {
		this.oSettings = new ItemSettings({
			itemActionCount: 3,
			itemActions: [new ItemActionItem({text: "A"})]
		});
		assert.strictEqual(this.oSettings.getEffectiveItemActionCount(), 3, "explicit count returned");
	});

	QUnit.test("RowSettings: bound actions produce templateInfo including type", function(assert) {
		this.oSettings = new RowSettings({
			rowActions: {path: "/actions", template: new RowActionItem({text: "{label}"})}
		});
		this.oSettings.setModel(new JSONModel({actions: [{label: "X"}]}));
		const mActions = this.oSettings.getAllActions();
		assert.deepEqual(Object.keys(mActions.templateInfo).sort(), ["icon", "text", "type", "visible"], "templateInfo includes type");
		assert.strictEqual(this.oSettings.getEffectiveRowActionCount(), 1, "bound actions default count to 1");
	});

	QUnit.test("RowSettings: static actions use aggregation length", function(assert) {
		this.oSettings = new RowSettings({
			rowActions: [new RowActionItem(), new RowActionItem(), new RowActionItem()]
		});
		assert.strictEqual(this.oSettings.getEffectiveRowActionCount(), 3, "count derived from aggregation length");
	});
});
