/*!
 * ${copyright}
 */

// Provides control sap.ui.ux3.ExactArea.
sap.ui.define([
 'sap/ui/commons/Toolbar',
 'sap/ui/core/Control',
 './library',
 './ExactAreaRenderer',
 'sap/ui/core/Element'
],
	function(Toolbar, Control, library, ExactAreaRenderer, Element) {
	"use strict";



	/**
	 * Constructor for a new ExactArea.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Consists of two sections: A tool bar and a content area where arbitrary controls can be added.
	 * The ExactArea is intended to be used for the Exact design approach but alternatively also in a stand alone version.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @experimental Since version 1.6.
	 * API is not yet finished and might change completely
	 * @deprecated Since version 1.38.
	 * @alias sap.ui.ux3.ExactArea
	 */
	var ExactArea = Control.extend("sap.ui.ux3.ExactArea", /** @lends sap.ui.ux3.ExactArea.prototype */ { metadata : {

		deprecated: true,
		library : "sap.ui.ux3",
		properties : {

			/**
			 * Specifies whether the tool bar shall be visible
			 */
			toolbarVisible : {type : "boolean", group : "Appearance", defaultValue : true}
		},
		defaultAggregation : "content",
		aggregations : {

			/**
			 * Arbitrary child controls of the content area
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"},

			/**
			 * Tool bar items which shall be shown in the tool bar.
			 */
			toolbarItems : {type : "sap.ui.commons.ToolbarItem", multiple : true, singularName : "toolbarItem"}
		}
	}});



	//*************************************************************
	//Define a private element to enable titles in the toolbar
	//*************************************************************

	Element.extend("sap.ui.ux3.ExactAreaToolbarTitle", {

	  metadata: {
	    interfaces : ["sap.ui.commons.ToolbarItem"],
	    properties : {
	      text : {name : "text", type : "string", group : "Appearance", defaultValue : ''}
	    }
	  }

	});

	//*************************************************************


	return ExactArea;

});
