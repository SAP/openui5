/* global QUnit, sinon*/
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Table",
	"sap/m/p13n/handler/xConfigHandler",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/m/p13n/modules/xConfigAPI",
	"sap/ui/core/CustomData"
], function (MDCControl, Table, xConfigHandler, FlexObjectFactory, JsControlTreeModifier, xConfigAPI, CustomData) {
	"use strict";

	this.oControl = null;
	this.oPropertyBag = null;
	this.oUIChange = null;

	QUnit.module("API Tests", {
		createChangeObject: function(mChangeConfig) {
			mChangeConfig = mChangeConfig || {};
			const oChangeProperties = {
				...mChangeConfig,
				"variantReference": "__management0",
				"developerMode": false,
				"layer": "USER",
				"reference": "sap.m.sample.p13n.EngineMultipleController",
				"selector": {
					"id": this.oControl.getId(),
					"idIsLocal": false
				}
			};

			this.oUIChange = FlexObjectFactory.createUIChange(oChangeProperties);
		},
		beforeEach: function() {
			this.oControl = new Table("test-table");

			this.oPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: this.oControl
			};

			this.createChangeObject({
				changeType: "removeItem"
			});
		},
		afterEach: function() {
			this.oControl.destroy();
			this.oUIChange.destroy();
			this.oPropertyBag = null;
		}
	});

	QUnit.test("Check #createHandler", function (assert) {

		const handler = xConfigHandler.createHandler({
			aggregationBased: true,
			property: "visible",
			operation: "add"
		});

		assert.ok(typeof handler.changeHandler.applyChange === "function", "'applyChange' function exists");
		assert.ok(typeof handler.changeHandler.completeChangeContent === "function", "'completeChangeContent' function exists");
		assert.ok(typeof handler.changeHandler.revertChange === "function", "'revertChange' function exists");
	});

	QUnit.test("Check #createHandler 'applyChange' for 'add'", function (assert) {
		const oHandler = xConfigHandler.createHandler({
			aggregationBased: true,
			property: "visible",
			operation: "add"
		});

		return Promise.resolve().then(() => {
			return oHandler.changeHandler.applyChange(this.oUIChange, this.oControl, this.oPropertyBag);
		})
		.then((result) => {
			assert.ok(typeof result === "undefined", "'applyChange' was called successfully");
		}).catch((error) => {
			assert.ok(typeof error === "undefined", "'applyChange' threw no errors");
		});
	});

	QUnit.test("Check #createHandler 'applyChange' for 'remove'", function (assert) {
		const oHandler = xConfigHandler.createHandler({
			aggregationBased: true,
			property: "visible",
			operation: "add"
		});

		return Promise.resolve().then(() => {
			return oHandler.changeHandler.applyChange(this.oUIChange, this.oControl, this.oPropertyBag);
		})
		.then((result) => {
			assert.ok(typeof result === "undefined", "'applyChange' was called successfully");
		}).catch((error) => {
			assert.ok(typeof error === "undefined", "'applyChange' threw no errors");
		});
	});

	QUnit.test("Check #createHandler 'completeChangeContent'", function (assert) {
		const oHandler = xConfigHandler.createHandler({
			aggregationBased: true,
			property: "visible",
			operation: "add"
		});

		return Promise.resolve().then(() => {
			return oHandler.changeHandler.completeChangeContent(this.oUIChange, {}, this.oPropertyBag);
		})
		.then((result) => {
			assert.ok(typeof result === "undefined", "'completeChangeContent' was called successfully");
		}).catch((error) => {
			assert.ok(typeof error === "undefined", "'completeChangeContent' threw no errors");
		});
	});

	QUnit.test("Check #createHandler 'revertChange'", function (assert) {
		const oHandler = xConfigHandler.createHandler({
			aggregationBased: true,
			property: "visible",
			operation: "add"
		});

		this.oUIChange.setRevertData({
			key: "string"
		});

		return oHandler.changeHandler.revertChange(this.oUIChange, this.oControl, this.oPropertyBag)
		.then((result) => {
			assert.ok(typeof result === "undefined", "'revertChange' was called successfully");
		}).catch((error) => {
			assert.ok(typeof error === "undefined", "'revertChange' threw no errors");
			throw error;
		});
	});

	QUnit.test("Check that 'revertChange' reverts the change operation (add -> remove)", function (assert) {

		const oHandler = xConfigHandler.createHandler({
			aggregationBased: true,
			property: "visible",
			operation: "add"
		});

		this.createChangeObject({
			changeType: "addItem"
		});

		this.oUIChange.setRevertData({
			key: "string"
		});

		const xConfigSpy = sinon.spy(xConfigAPI, "enhanceConfig");

		return oHandler.changeHandler.revertChange(this.oUIChange, this.oControl, this.oPropertyBag)
		.then((result) => {
			//args provides an array, the first array includes two parameters -> 0 is the control instance, 1 the config called for xConfigAPI
			const revertOperation = xConfigSpy.args[0][1].operation;
			assert.equal(revertOperation, "remove", "The 'add' reverted results in a remove");
			xConfigAPI.enhanceConfig.restore();
		});
	});

	QUnit.test("Check that 'revertChange' reverts the change operation (remove -> add)", function (assert) {

		const oHandler = xConfigHandler.createHandler({
			aggregationBased: true,
			property: "visible",
			operation: "remove"
		});

		this.createChangeObject({
			changeType: "removeItem"
		});

		this.oUIChange.setRevertData({
			key: "string"
		});

		const xConfigSpy = sinon.spy(xConfigAPI, "enhanceConfig");

		return oHandler.changeHandler.revertChange(this.oUIChange, this.oControl, this.oPropertyBag)
		.then((result) => {
			//args provides an array, the first array includes two parameters -> 0 is the control instance, 1 the config called for xConfigAPI
			const revertOperation = xConfigSpy.args[0][1].operation;
			assert.equal(revertOperation, "add", "The 'remove' reverted results in a add");
			xConfigAPI.enhanceConfig.restore();
		});
	});

	QUnit.test("Check correct revert object creation (no existing state, item based change)", function (assert) {

		const oHandler = xConfigHandler.createHandler({
			aggregationBased: true,
			property: "visible",
			operation: "add"
		});

		this.createChangeObject({
			changeType: "addItem",
			content: {
				key: "string"
			}
		});

		return oHandler.changeHandler.applyChange(this.oUIChange, this.oControl, this.oPropertyBag)
		.then((result) => {
			const oRevertData = this.oUIChange.getRevertData();

			assert.equal(oRevertData.key, "string", "The revert data key was created correctly");
			assert.equal(oRevertData.index, -1, "The revert data index was created correctly");
		});
	});

	QUnit.test("Check correct revert object creation (no existing state, non item related change)", function (assert) {

		const oHandler = xConfigHandler.createHandler({
			aggregationBased: true,
			property: "visible",
			operation: "add"
		});

		this.createChangeObject({
			changeType: "unknownChangeType",
			content: {
				key: "string"
			}
		});

		return oHandler.changeHandler.applyChange(this.oUIChange, this.oControl, this.oPropertyBag)
		.then((result) => {
			const oRevertData = this.oUIChange.getRevertData();

			assert.equal(oRevertData.key, "string", "The revert data key was created correctly");
			assert.equal(oRevertData.index, undefined, "The revert data index was created correctly");
		});
	});

});