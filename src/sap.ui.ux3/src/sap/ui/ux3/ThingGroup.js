/*!
 * ${copyright}
 */

// Provides control sap.ui.ux3.ThingGroup.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element', './library'],
	function(jQuery, Element, library) {
	"use strict";


	
	/**
	 * Constructor for a new ThingGroup.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Thing Group Area
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.ux3.ThingGroup
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ThingGroup = Element.extend("sap.ui.ux3.ThingGroup", /** @lends sap.ui.ux3.ThingGroup.prototype */ { metadata : {
	
		library : "sap.ui.ux3",
		properties : {
	
			/**
			 * Title of Group
			 */
			title : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * If Group is used in a column layout the groups spans the all columns if set to true.
			 */
			colspan : {type : "boolean", group : "Misc", defaultValue : false}
		},
		defaultAggregation : "content",
		aggregations : {
	
			/**
			 * Content of Group
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}, 
	
			/**
			 * Actions of the groups content
			 */
			actions : {type : "sap.ui.ux3.ThingGroup", multiple : true, singularName : "action"}
		}
	}});
	
	///**
	// * This file defines behavior for the control,
	// */
	//sap.ui.ux3.ThingContent.prototype.init = function(){
	//   // do something for initialization...
	//};

	return ThingGroup;

}, /* bExport= */ true);
