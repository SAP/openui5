/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.SelectMenu.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"./thirdparty/SelectMenu"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>SelectMenu</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.SelectMenu</code> is meant to be used together with the <code>sap.ui.webc.main.Select</code> component as alternative to define the select's dropdown. It acts as a popover on desktop and tablet, and as a Dialog on phone. <br>
	 * </br> The component gives the possibility to the user to customize the <code>sap.ui.webc.main.Select</code>'s dropdown by slotting custom options and adding custom styles.
	 *
	 * <h3>Usage</h3>
	 *
	 * To use <code>sap.ui.webc.main.Select</code> with a <code>sap.ui.webc.main.SelectMenu</code>, you need to set the <code>sap.ui.webc.main.Select</code> <code>menu</code> property to reference <code>sap.ui.webc.main.SelectMenu</code> either by ID or DOM reference. <br>
	 * </br>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.120.0
	 * @experimental Since 1.120.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.SelectMenu
	 */
	var SelectMenu = WebComponent.extend("sap.ui.webc.main.SelectMenu", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-select-menu-ui5",
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Defines the options of the component.
				 */
				content: {
					type: "sap.ui.webc.main.ISelectMenuOption",
					multiple: true
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return SelectMenu;
});
