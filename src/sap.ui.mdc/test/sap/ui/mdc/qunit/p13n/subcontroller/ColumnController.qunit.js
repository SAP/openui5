/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/p13n/subcontroller/ColumnController"
], function(
	ColumnController
) {
	"use strict";

	/**
	 * Builds a ColumnController instance with stubbed panel and adaptation control.
	 *
	 * @param {object} mConfig
	 * @param {object[]} mConfig.panelData Items the panel returns (array).
	 * @param {string[]} mConfig.propertyKeys The canonical propertyKeys order.
	 * @param {object} mConfig.properties Map of property key to PropertyInfo (with isActive).
	 * @param {boolean} [mConfig.propertyKeysMode=true] Whether the control reports propertyKeys mode.
	 * @returns {sap.ui.mdc.p13n.subcontroller.ColumnController} Controller under test.
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
					getProperty: function(sKey) {
						return mConfig.properties[sKey];
					}
				};
			}
		};

		const oController = Object.create(ColumnController.prototype);
		oController.getAdaptationControl = function() {
			return oControl;
		};
		oController._oPanel = {
			getP13nData: function() {
				return mConfig.panelData;
			}
		};
		return oController;
	}

	QUnit.module("getP13nData");

	QUnit.test("Injects inactive key at its propertyKeys position", function(assert) {
		const oController = createController({
			panelData: [{key: "A", name: "A"}, {key: "C", name: "C"}],
			propertyKeys: ["I", "A", "B", "C"],
			properties: {I: {isActive: false}, A: {isActive: true}, B: {isActive: true}, C: {isActive: true}}
		});

		assert.deepEqual(
			oController.getP13nData(),
			[{key: "I", name: "I"}, {key: "A", name: "A"}, {key: "C", name: "C"}],
			"Inactive key I injected at propertyKeys index 0; deselected active key B omitted"
		);
	});

	QUnit.test("Returns panel data unchanged when not in propertyKeys mode", function(assert) {
		const oController = createController({
			panelData: [{key: "A", name: "A"}, {key: "C", name: "C"}],
			propertyKeys: ["I", "A", "B", "C"],
			properties: {I: {isActive: false}, A: {isActive: true}, B: {isActive: true}, C: {isActive: true}},
			propertyKeysMode: false
		});

		assert.deepEqual(
			oController.getP13nData(),
			[{key: "A", name: "A"}, {key: "C", name: "C"}],
			"Aggregation mode: panel data returned unchanged"
		);
	});
});
