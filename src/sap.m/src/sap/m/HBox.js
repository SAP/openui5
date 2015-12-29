/*!
 * ${copyright}
 */

// Provides control sap.m.HBox.
sap.ui.define(['jquery.sap.global', './FlexBox', './library'],
	function(jQuery, FlexBox, library) {
	"use strict";



	/**
	 * Constructor for a new HBox.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The HBox control builds the container for a horizontal flexible box layout. HBox is a convenience control as it is just a specialized FlexBox control.
	 *
	 * Browser support:
	 * This control is not supported in Internet Explorer 9!
	 * @extends sap.m.FlexBox
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.HBox
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var HBox = FlexBox.extend("sap.m.HBox", /** @lends sap.m.HBox.prototype */ { metadata : {

		library : "sap.m"
	}});



	return HBox;

}, /* bExport= */ true);
