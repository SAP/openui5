/*!
 * ${copyright}
 */

// Provides control sap.ui.core.Item.
sap.ui.define(['./Element', './library'],
	function(Element, library) {
	"use strict";


	
	/**
	 * Constructor for a new Item.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A control base type.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.core.Item
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Item = Element.extend("sap.ui.core.Item", /** @lends sap.ui.core.Item.prototype */ { metadata : {
	
		library : "sap.ui.core",
		properties : {
	
			/**
			 * The text to be displayed for the item.
			 */
			text : {type : "string", group : "Misc", defaultValue : ""},
	
			/**
			 * Enabled items can be selected.
			 */
			enabled : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * Options are RTL and LTR. Alternatively, an item can inherit its text direction from its parent control.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Misc", defaultValue : sap.ui.core.TextDirection.Inherit},
	
			/**
			 * Can be used as input for subsequent actions.
			 */
			key : {type : "string", group : "Data", defaultValue : null}
		}
	}});
	
	

	return Item;

});
