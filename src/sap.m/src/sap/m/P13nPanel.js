/*!
 * ${copyright}
 */

// Provides control sap.m.P13nPanel.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";


	
	/**
	 * Constructor for a new P13nPanel.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * tbd
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.m.P13nPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nPanel = Control.extend("sap.m.P13nPanel", /** @lends sap.m.P13nPanel.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
			/**
			 * Title text appears in the panel
			 */
			title : {type : "string", group : "Appearance", defaultValue : null},
	
			/**
			 * tbd
			 */
			type : {type : "sap.m.P13nPanelType", group : "Misc", defaultValue : null},

			/**
			 * makes the vertical Scrolling on the P13nDialog enabled when the panel is shown 
			 */
			verticalScrolling : {type : "boolean", group : "Misc", defaultValue : true}
		},
		defaultAggregation : "items",
		aggregations : {
	
			/**
			 * tbd
			 */
			items : {type : "sap.m.P13nItem", multiple : true, singularName : "item", bindable : "bindable"}
		}
	}});
	
	///**
	// * This file defines behavior for the control,
	// */
	//sap.m.P13nPanel.prototype.init = function(){
	//   // do something for initialization...
	//};
	

	return P13nPanel;

}, /* bExport= */ true);
