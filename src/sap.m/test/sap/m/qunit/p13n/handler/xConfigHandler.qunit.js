/* global QUnit*/
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Table",
	"sap/m/p13n/handler/xConfigHandler",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function (MDCControl, Table, xConfigHandler, FlexObjectFactory, JsControlTreeModifier) {
	"use strict";

	this.oControl = null;
	this.oPropertyBag = null;
	this.oUIChange = null;

	QUnit.module("API Tests", {
		beforeEach: function() {
			this.oControl = new Table("test-table");

			this.oPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: this.oControl
			};

			const oChangeProperties = {
				"changeType": "removeItem",
				"content": {
					// "key": "P5",
					// "value": false,
					// "targetAggregation": "items"
				},
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

		return Promise.resolve().then(() => {
			return oHandler.changeHandler.revertChange(this.oUIChange, this.oControl, this.oPropertyBag);
		})
		.then((result) => {
			assert.ok(typeof result === "undefined", "'revertChange' was called successfully");
		}).catch((error) => {
			assert.ok(typeof error === "undefined", "'revertChange' threw no errors");
			throw error;
		});
	});

});