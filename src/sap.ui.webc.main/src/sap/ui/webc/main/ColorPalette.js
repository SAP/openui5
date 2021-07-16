/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ColorPalette.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/ColorPalette"
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
	 * <h3>Overview</h3> The ColorPalette provides the users with a range of predefined colors. The colors are fixed and do not change with the theme. You can set them by using the ColorPaletteItem items as slots.
	 *
	 * <h3>Usage</h3> The Colorpalette is intended for users that needs to select a color from a predefined set of colors. To allow users select any color from a color picker, enable the <code>show-more-colors</code> property. And, to display the most recent color selection, enable the <code>show-recent-colors</code> property.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ColorPalette
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColorPalette = WebComponent.extend("sap.ui.webc.main.ColorPalette", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-color-palette-ui5",
			properties: {

				/**
				 * Defines whether the user can choose a custom color from a color picker <b>Note:</b> In order to use this property you need to import the following module: <code>"@ui5/webcomponents/dist/features/ColorPaletteMoreColors.js"</code>
				 */
				showMoreColors: {
					type: "boolean"
				},

				/**
				 * Defines whether the user can see the last used colors in the bottom of the component
				 */
				showRecentColors: {
					type: "boolean"
				},

				/**
				 * The selected color.
				 */
				value: {
					type: "sap.ui.core.CSSColor"
				}
			},
			defaultAggregation: "colors",
			aggregations: {

				/**
				 * Defines the <code>sap.ui.webc.main.ColorPaletteItem</code> items.
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
				change: {
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

	return ColorPalette;
});