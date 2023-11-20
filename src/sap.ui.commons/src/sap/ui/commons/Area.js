/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.Area.
sap.ui.define(['sap/ui/thirdparty/jquery', './library', 'sap/ui/core/Element', 'sap/ui/dom/jquery/control'  /* jQuery Plugin "control" */],
	function(jQuery, library, Element) {
	"use strict";



	/**
	 * Constructor for a new Area.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Used for defining areas in an image map. At runtime, the user can trigger an action, or start a URL, from the single image areas.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38.
	 * @alias sap.ui.commons.Area
	 */
	var Area = Element.extend("sap.ui.commons.Area", /** @lends sap.ui.commons.Area.prototype */ { metadata : {

		library : "sap.ui.commons",
		deprecated: true,
		properties : {

			/**
			 * The value is a string and can be 'rect' for rectangle, 'poly' for poligon, 'circle', or default.
			 */
			shape : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Coordinates of the area
			 */
			coords : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Hyper link that is executed when the area is clicked
			 */
			href : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

			/**
			 * Alternative text that is displayed in the case the image is not available
			 */
			alt : {type : "string", group : "Misc", defaultValue : null}
		}
	}});

	/**
	 * Function is called when Link is clicked.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Area.prototype.onclick = function(oEvent) {

		// The Element or Control that initiated the event. For example the id of the area if image map is defined for the current image.
		// jQuery Plugin "control"
		var oEventSource = jQuery(oEvent.target).control(0);

	    // Fire event on Image Map
		this.getParent().firePress({areaId: oEventSource.getId()});
	};

	return Area;

});
