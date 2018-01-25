/*!
 * ${copyright}
 */

// Provides control sap.m.HBox.
sap.ui.define(['./FlexBox', './library', './HBoxRenderer'],
	function(FlexBox, library, HBoxRenderer) {
	"use strict";



	/**
	 * Constructor for a new HBox.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The HBox control builds the container for a horizontal flexible box layout. HBox is a convenience control, as it is just a specialized FlexBox control.<br>
	 * <br>
	 * <b>Note:</b> Be sure to check the <code>renderType</code> setting to avoid issues due to browser inconsistencies.
	 *
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

		library : "sap.m",
		designtime: "sap/m/designtime/HBox.designtime"
	}});



	return HBox;

});
