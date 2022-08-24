/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ColorPaletteItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/ColorPaletteItem"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>ColorPaletteItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.ColorPaletteItem</code> component represents a color in the the <code>sap.ui.webc.main.ColorPalette</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ColorPaletteItem
	 * @implements sap.ui.webc.main.IColorPaletteItem
	 */
	var ColorPaletteItem = WebComponent.extend("sap.ui.webc.main.ColorPaletteItem", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-color-palette-item-ui5",
			interfaces: [
				"sap.ui.webc.main.IColorPaletteItem"
			],
			properties: {

				/**
				 * Defines the colour of the component. <br>
				 * <br>
				 * <b>Note:</b> The value should be a valid CSS color.
				 */
				value: {
					type: "sap.ui.core.CSSColor"
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ColorPaletteItem;
});