/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ColorPalettePopover.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/ColorPalettePopover",
	"./thirdparty/features/ColorPaletteMoreColors"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>ColorPalettePopover</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> Represents a predefined range of colors for easier selection.
	 *
	 * Overview The ColorPalettePopover provides the users with a slot to predefine colors.
	 *
	 * You can customize them with the use of the colors property. You can specify a defaultColor and display a "Default color" button for the user to choose directly. You can display a "More colors..." button that opens an additional color picker for the user to choose specific colors that are not present in the predefined range.
	 *
	 * <h3>Usage</h3>
	 *
	 * The palette is intended for users, who don't want to check and remember the different values of the colors and spend large amount of time to configure the right color through the color picker.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.97.0
	 * @experimental Since 1.97.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ColorPalettePopover
	 */
	var ColorPalettePopover = WebComponent.extend("sap.ui.webc.main.ColorPalettePopover", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-color-palette-popover-ui5",
			properties: {

				/**
				 * Defines the default color of the component. <b>Note:</b> The default color should be a part of the ColorPalette colors</code>
				 */
				defaultColor: {
					type: "sap.ui.core.CSSColor"
				},

				/**
				 * Defines whether the user can choose the default color from a button.
				 */
				showDefaultColor: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether the user can choose a custom color from a component. <b>Note:</b> In order to use this property you need to import the following module: <code>"@ui5/webcomponents/dist/features/ColorPaletteMoreColors.js"</code>
				 */
				showMoreColors: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether the user can see the last used colors in the bottom of the component
				 */
				showRecentColors: {
					type: "boolean",
					defaultValue: false
				}
			},
			defaultAggregation: "colors",
			aggregations: {

				/**
				 * Defines the content of the component.
				 */
				colors: {
					type: "sap.ui.webc.main.IColorPaletteItem",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired when the user selects a color.
				 */
				itemClick: {
					parameters: {
						/**
						 * the selected color
						 */
						color: {
							type: "string"
						}
					}
				}
			},
			methods: ["openPopover", "showAt"]
		}
	});

	/**
	 * Shows the ColorPalettePopover. <b>Note:</b> The method is deprecated and will be removed in future, use <code>showAt</code> instead.
	 * @param {HTMLElement} opener the element that the popover is shown at
	 * @public
	 * @name sap.ui.webc.main.ColorPalettePopover#openPopover
	 * @function
	 */

	/**
	 * Shows the ColorPalettePopover.
	 * @param {HTMLElement} opener the element that the popover is shown at
	 * @public
	 * @name sap.ui.webc.main.ColorPalettePopover#showAt
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ColorPalettePopover;
});