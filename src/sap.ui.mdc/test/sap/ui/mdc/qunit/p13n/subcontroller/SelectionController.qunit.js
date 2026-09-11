/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/p13n/subcontroller/SelectionController"
], function(
	MDCSelectionController
) {
	"use strict";

	/**
	 * Builds a bare MDCSelectionController instance with only the collaborators
	 * that injectInactivePropertyKeys needs.
	 *
	 * @param {object} mConfig
	 * @param {string[]} mConfig.propertyKeys The canonical propertyKeys order.
	 * @param {object} mConfig.properties Map of property key to PropertyInfo (with isActive).
	 * @param {boolean} [mConfig.propertyKeysMode=true] Whether the control reports propertyKeys mode.
	 * @returns {sap.ui.mdc.p13n.subcontroller.SelectionController} Minimal controller under test.
	 */
	function createController(mConfig) {
		const oControl = {
			isInPropertyKeysMode: function() {
				return mConfig.propertyKeysMode !== false;
			},
			getPropertyKeys: function() {
				return mConfig.propertyKeys;
			},
			getPropertyHelper: function() {
				return {
					getProperty: function(sKey, bIncludeInactive) {
						const oProp = mConfig.properties[sKey];
						if (oProp && oProp.isActive === false && !bIncludeInactive) {
							return null;
						}
						return oProp;
					}
				};
			}
		};

		const oController = Object.create(MDCSelectionController.prototype);
		oController.getAdaptationControl = function() {
			return oControl;
		};
		return oController;
	}

	QUnit.module("injectInactivePropertyKeys");

	QUnit.test("Inserts inactive key at its propertyKeys position (index 0)", function(assert) {
		// propertyKeys = [I(inactive), A, B, C]; user hides B -> panel returned [A, C]
		const oController = createController({
			propertyKeys: ["I", "A", "B", "C"],
			properties: {I: {isActive: false}, A: {isActive: true}, B: {isActive: true}, C: {isActive: true}}
		});

		assert.deepEqual(
			oController.injectInactivePropertyKeys([{key: "A", name: "A"}, {key: "C", name: "C"}]),
			[{key: "I", name: "I"}, {key: "A", name: "A"}, {key: "C", name: "C"}],
			"Inactive key I inserted at propertyKeys index 0; deselected active key B omitted"
		);
	});

	QUnit.test("Inserts inactive key in the middle", function(assert) {
		// propertyKeys = [A, I(inactive), B]; panel returned [A, B]
		const oController = createController({
			propertyKeys: ["A", "I", "B"],
			properties: {A: {isActive: true}, I: {isActive: false}, B: {isActive: true}}
		});

		assert.deepEqual(
			oController.injectInactivePropertyKeys([{key: "A", name: "A"}, {key: "B", name: "B"}]),
			[{key: "A", name: "A"}, {key: "I", name: "I"}, {key: "B", name: "B"}],
			"Inactive key I inserted between A and B"
		);
	});

	QUnit.test("Inserts multiple inactive keys at their positions", function(assert) {
		// propertyKeys = [I1(inactive), A, I2(inactive), B]; panel returned [A, B]
		const oController = createController({
			propertyKeys: ["I1", "A", "I2", "B"],
			properties: {I1: {isActive: false}, A: {isActive: true}, I2: {isActive: false}, B: {isActive: true}}
		});

		assert.deepEqual(
			oController.injectInactivePropertyKeys([{key: "A", name: "A"}, {key: "B", name: "B"}]),
			[{key: "I1", name: "I1"}, {key: "A", name: "A"}, {key: "I2", name: "I2"}, {key: "B", name: "B"}],
			"Both inactive keys inserted at their propertyKeys slots"
		);
	});

	QUnit.test("Returns input unchanged when not in propertyKeys mode", function(assert) {
		const oController = createController({
			propertyKeys: ["I", "A", "B", "C"],
			properties: {I: {isActive: false}, A: {isActive: true}, B: {isActive: true}, C: {isActive: true}},
			propertyKeysMode: false
		});

		const aInput = [{key: "A", name: "A"}, {key: "C", name: "C"}];
		assert.strictEqual(
			oController.injectInactivePropertyKeys(aInput),
			aInput,
			"Aggregation mode: same array reference returned unchanged"
		);
	});

	QUnit.test("Returns input unchanged when no inactive keys exist", function(assert) {
		const oController = createController({
			propertyKeys: ["A", "B"],
			properties: {A: {isActive: true}, B: {isActive: true}}
		});

		const aInput = [{key: "A", name: "A"}, {key: "B", name: "B"}];
		assert.deepEqual(
			oController.injectInactivePropertyKeys(aInput),
			[{key: "A", name: "A"}, {key: "B", name: "B"}],
			"No inactive keys; data returned as-is"
		);
	});

	QUnit.test("Returns input unchanged when input is not an array", function(assert) {
		const oController = createController({
			propertyKeys: ["I", "A"],
			properties: {I: {isActive: false}, A: {isActive: true}}
		});

		const oInput = {items: [{key: "A", name: "A"}]};
		assert.strictEqual(
			oController.injectInactivePropertyKeys(oInput),
			oInput,
			"Non-array input returned as-is (no-op guard)"
		);
	});
});
