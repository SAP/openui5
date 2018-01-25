/*!
 * ${copyright}
 */

// Provides control sap.m.VBox.
sap.ui.define(['./FlexBox', './library', "./VBoxRenderer"],
	function(FlexBox, library, VBoxRenderer) {
	"use strict";

	/**
	 * Constructor for a new VBox.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The VBox control builds the container for a vertical flexible box layout. VBox is a convenience control, as it is just a specialized FlexBox control.<br>
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
	 * @alias sap.m.VBox
	 * @see https://www.w3.org/TR/css-flexbox-1/
	 * @see https://www.w3.org/TR/css-flexbox-1/#propdef-justify-content
	 * @see https://www.w3.org/TR/css-flexbox-1/#propdef-flex-direction
	 * @see https://www.w3schools.com/css/css3_flexbox.asp#flex-direction
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var VBox = FlexBox.extend("sap.m.VBox", /** @lends sap.m.VBox.prototype */ { metadata : {

		library : "sap.m",
		designtime: "sap/m/designtime/VBox.designtime"
	}});

	return VBox;

});
