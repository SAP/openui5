/*!
* ${copyright}
*/

sap.ui.define([
	"sap/m/ComboBox",
	"sap/m/ComboBoxRenderer"
], function (
	MComboBox,
	MComboBoxRenderer
) {
	"use strict";

	/**
	 * Constructor for a new ComboBox.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.m.ComboBox
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.controls.ComboBox
	 */
	var ComboBox = MComboBox.extend("sap.ui.integration.controls.ComboBox", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				customSelectedIndex: {
					type: "int",
					defaultValue: -1
				}
			}
		},
		renderer: MComboBoxRenderer
	});

	return ComboBox;
});