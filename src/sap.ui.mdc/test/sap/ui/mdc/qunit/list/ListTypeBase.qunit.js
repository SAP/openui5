/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/List",
	"sap/ui/mdc/list/ListTypeBase",
	"sap/ui/mdc/list/GridListType",
	"sap/ui/mdc/list/ListType",
	"sap/f/GridListItem",
	"sap/m/StandardListItem",
	"sap/m/VBox",
	"sap/m/Text",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(MDCList, ListTypeBase, GridListType, ListType, GridListItem, StandardListItem, VBox, Text, JSONModel, nextUIUpdate) {
	"use strict";

	let oJSONModel;

	function createTemplate() {
		return new GridListItem({
			content: [
				new VBox({
					items: [
						new Text({text: "{name}"})
					]
				})
			]
		});
	}

	async function createMDCList(mSettings) {
		mSettings = Object.assign({
			type: new GridListType(),
			delegate: {
				name: "sap/ui/mdc/ListDelegate",
				payload: {}
			},
			itemsPath: "/",
			itemTemplate: createTemplate(),
			models: oJSONModel
		}, mSettings);

		const oList = new MDCList(mSettings);
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();
		return oList;
	}

	function waitForInitialized(oList) {
		return oList.initialized().then(async function() {
			await nextUIUpdate();
			return oList;
		});
	}

	QUnit.module("API", {
		beforeEach: async function() {
			oJSONModel = new JSONModel([
				{id: 0, name: "name0"},
				{id: 1, name: "name1"}
			]);
			this.oType = new GridListType();
			this.oList = await createMDCList({type: this.oType});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
			oJSONModel.destroy();
		}
	});

	QUnit.test("#getList", function(assert) {
		assert.strictEqual(this.oType.getList(), this.oList, "getList returns the parent MDC List");

		const oDetachedType = new GridListType();
		assert.strictEqual(oDetachedType.getList(), null, "getList returns null when not attached");
		oDetachedType.destroy();
	});

	QUnit.test("#getInnerControl", function(assert) {
		assert.ok(this.oType.getInnerControl(), "getInnerControl returns the inner list");
		assert.ok(this.oType.getInnerControl().isA("sap.f.GridList"), "Inner list is a GridList");
		assert.strictEqual(this.oType.getInnerControl(), this.oList._oList, "getInnerControl matches _oList");
	});

	QUnit.test("#getListSettings", function(assert) {
		const mSettings = this.oType.getListSettings();

		assert.ok(mSettings, "getListSettings returns settings");
		assert.ok(mSettings.id, "Settings contain an id");
		assert.ok(mSettings.growing !== undefined, "Settings contain growing binding");
		assert.ok(mSettings.selectionChange, "Settings contain selectionChange handler");
		assert.ok(mSettings.itemPress, "Settings contain itemPress handler");
		assert.ok(mSettings.beforeOpenContextMenu, "Settings contain beforeOpenContextMenu handler");
		assert.ok(mSettings.headerToolbar, "Settings contain headerToolbar");
	});

	QUnit.test("#loadModules - abstract base rejects", function(assert) {
		const oBase = new (ListTypeBase.extend("test.TestType", {metadata: {}}))();
		return oBase.loadModules().then(function() {
			assert.ok(false, "Should not resolve");
		}, function() {
			assert.ok(true, "loadModules on abstract base rejects");
		}).finally(function() {
			oBase.destroy();
		});
	});

	QUnit.module("GridListType", {
		beforeEach: async function() {
			oJSONModel = new JSONModel([
				{id: 0, name: "name0"},
				{id: 1, name: "name1"}
			]);
			this.oType = new GridListType();
			this.oList = await createMDCList({type: this.oType});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
			oJSONModel.destroy();
		}
	});

	QUnit.test("Creates sap.f.GridList", function(assert) {
		assert.ok(this.oList._oList.isA("sap.f.GridList"), "Inner list is a GridList");
	});

	QUnit.test("loadModules resolves", function(assert) {
		return this.oType.loadModules().then(function() {
			assert.ok(true, "loadModules resolves");
		});
	});

	QUnit.test("setProperty returns the type for chaining and forwards to the inner list", function(assert) {
		assert.strictEqual(this.oType.setBoxMinWidth("20rem"), this.oType, "setBoxMinWidth returns the type");
		assert.strictEqual(this.oType.getBoxMinWidth(), "20rem", "boxMinWidth property is updated");
	});

	QUnit.module("ListType", {
		beforeEach: async function() {
			oJSONModel = new JSONModel([
				{id: 0, name: "name0"},
				{id: 1, name: "name1"}
			]);
			this.oType = new ListType();
			this.oList = await createMDCList({
				type: this.oType,
				itemTemplate: new StandardListItem({title: "{name}"})
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
			oJSONModel.destroy();
		}
	});

	QUnit.test("Creates sap.m.List", function(assert) {
		assert.ok(this.oList._oList.isA("sap.m.List"), "Inner list is a sap.m.List");
	});

	QUnit.test("loadModules resolves", function(assert) {
		return this.oType.loadModules().then(function() {
			assert.ok(true, "loadModules resolves");
		});
	});

});
