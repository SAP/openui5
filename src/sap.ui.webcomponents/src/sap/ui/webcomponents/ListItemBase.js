/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.ListItemBase.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent"
], function(WebComponent) {
	"use strict";

	/**
	 * Constructor for a new <code>ListItemBase</code>.
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
	 * @alias sap.ui.webcomponents.ListItemBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ListItemBase = WebComponent.extend("sap.ui.webcomponents.ListItemBase", {
		metadata: {
			abstract: true,
			library: "sap.ui.webcomponents",
			properties: {

				selected: {
					type: "boolean",
				}
			}
		}
	});

	return ListItemBase;
});
