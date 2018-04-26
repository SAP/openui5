/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/m/CustomListItem",
	"./BoxRenderer"
], function (CustomListItem, BoxRenderer) {
	"use strict";

	/**
	 * Constructor for a new Box.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The Box is a clickable item and represents an entity or an object.
	 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.56
	 * @alias sap.tnt.Box
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Box = CustomListItem.extend("sap.tnt.Box", {
		metadata: {
			library: "sap.tnt",
			properties: {
				"type": {
					type: "sap.m.ListType",
					defaultValue: sap.m.ListType.Active  /* modify default, Boxes should always be clickable and have one large clicke area (except when with a footer toolbar) */
				}
			}
		},
		renderer: BoxRenderer
	});

	return Box;
});