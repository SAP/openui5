/*!
 * ${copyright}
 */

// Provides control sap.m.DisplayListItem.
sap.ui.define(['jquery.sap.global', './ListItemBase', './library'],
	function(jQuery, ListItemBase, library) {
	"use strict";


	/**
	 * Constructor for a new DisplayListItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The display list item consists of a label and a value.
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.DisplayListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DisplayListItem = ListItemBase.extend("sap.m.DisplayListItem", /** @lends sap.m.DisplayListItem.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * List item label
			 */
			label : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * List item value
			 */
			value : {type : "string", group : "Data", defaultValue : null},

			/**
			 * This property specifies the value text directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			valueTextDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit}
		}
	}});

	return DisplayListItem;

}, /* bExport= */ true);
