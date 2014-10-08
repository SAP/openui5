/*!
 * ${copyright}
 */

// Provides control sap.m.InputListItem.
sap.ui.define(['jquery.sap.global', './ListItemBase', './library'],
	function(jQuery, ListItemBase, library) {
	"use strict";


	
	/**
	 * Constructor for a new InputListItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * List item should be used for a label and an input field.
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.m.InputListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var InputListItem = ListItemBase.extend("sap.m.InputListItem", /** @lends sap.m.InputListItem.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Label of the list item
			 */
			label : {type : "string", group : "Misc", defaultValue : null}
		},
		defaultAggregation : "content",
		aggregations : {
	
			/**
			 * Content controls can be added
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content", bindable : "bindable"}
		}
	}});
	
	

	return InputListItem;

}, /* bExport= */ true);
