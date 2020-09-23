/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.Popover.
sap.ui.define([
	"./Popup",
	"./library",
	"./thirdparty/ui5-wc-bundles/Popover"
], function(Popup, library) {
	"use strict";

	var PopoverPlacementType = library.PopoverPlacementType;
	var PopoverHorizontalAlign = library.PopoverHorizontalAlign;
	var PopoverVerticalAlign = library.PopoverVerticalAlign;

	/**
	 * Constructor for a new <code>Popover</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.84
	 * @alias sap.ui.webcomponents.Popover
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Popover = Popup.extend("sap.ui.webcomponents.Popover", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-popover",
			properties: {

				headerText: {
					type: "string"
				},

				placementType: {
					type: "sap.ui.webcomponents.PopoverPlacementType",
					defaultValue: PopoverPlacementType.Right,
				},

				horizontalAlign: {
					type: "sap.ui.webcomponents.PopoverHorizontalAlign",
					defaultValue: PopoverHorizontalAlign.Center,
				},

				verticalAlign: {
					type: "sap.ui.webcomponents.PopoverVerticalAlign",
					defaultValue: PopoverVerticalAlign.Center,
				},

				modal: {
					type: "boolean"
				},

				noArrow: {
					type: "boolean"
				},

				allowTargetOverlap: {
					type: "boolean"
				},
			},
			methods: [
				"openBy",
				"close"
			]
		},
		openBy: function(oOpener, bPreventInitialFocus) {
			return this.__callPublicMethod("openBy", [oOpener.getDomRef(), bPreventInitialFocus]);
		}
	});

	return Popover;
});
