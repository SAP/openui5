/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ToolbarSpacer.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"sap/ui/core/library",
	"./thirdparty/ToolbarSpacer"
], function(WebComponent, library, coreLibrary) {
	"use strict";

	var CSSSize = coreLibrary.CSSSize;

	/**
	 * Constructor for a new <code>ToolbarSpacer</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.ToolbarSpacer</code> is an element, used for taking needed space for toolbar items to take 100% width. It takes no space in calculating toolbar items width.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.120.0
	 * @experimental Since 1.120.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ToolbarSpacer
	 * @implements sap.ui.webc.main.IToolbarItem
	 */
	var ToolbarSpacer = WebComponent.extend("sap.ui.webc.main.ToolbarSpacer", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-toolbar-spacer-ui5",
			interfaces: [
				"sap.ui.webc.main.IToolbarItem"
			],
			properties: {

				/**
				 * Defines the width of the spacer. <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> all CSS sizes are supported - 'percentage', 'px', 'rem', 'auto', etc.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: CSSSize.undefined
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ToolbarSpacer;
});
