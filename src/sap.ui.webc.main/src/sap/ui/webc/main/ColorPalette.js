/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ColorPalette.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/ColorPalette",
	"./thirdparty/features/ColorPaletteMoreColors"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>ColorPalette</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.ColorPalette</code> provides the users with a range of predefined colors. The colors are fixed and do not change with the theme.
	 *
	 * <h3>Usage</h3>
	 *
	 * The <code>sap.ui.webc.main.ColorPalette</code> is meant for users that need to select a color from a predefined set. To define the colors, use the <code>sap.ui.webc.main.ColorPaletteItem</code> component inside the default slot of the <code>sap.ui.webc.main.ColorPalette</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ColorPalette
	 */
	var ColorPalette = WebComponent.extend("sap.ui.webc.main.ColorPalette", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-color-palette-ui5",
			defaultAggregation: "colors",
			aggregations: {

				/**
				 * Defines the <code>sap.ui.webc.main.ColorPaletteItem</code> elements.
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
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ColorPalette;
});