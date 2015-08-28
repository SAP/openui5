/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.ResponsiveFlowLayoutData.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/LayoutData', './library'],
	function(jQuery, LayoutData, library) {
	"use strict";



	/**
	 * Constructor for a new ResponsiveFlowLayoutData.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This is a LayoutData element that can be added to a control if this control is used within a ResponsiveFlowLayout.
	 * @extends sap.ui.core.LayoutData
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @alias sap.ui.layout.ResponsiveFlowLayoutData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ResponsiveFlowLayoutData = LayoutData.extend("sap.ui.layout.ResponsiveFlowLayoutData", /** @lends sap.ui.layout.ResponsiveFlowLayoutData.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * Defines the minimal size in px of an ResponsiveFlowLayout element. The element will be shrunk down to this value.
			 */
			minWidth : {type : "int", group : "Misc", defaultValue : 100},

			/**
			 * Defines the weight of the element, that influences the resulting width. If there are several elements within a row of the ResponsiveFlowLayout, each element could have another weight. The bigger the weight of a single element, the wider it will be stretched, i.e. a bigger weight results in a larger width.
			 */
			weight : {type : "int", group : "Misc", defaultValue : 1},

			/**
			 * If this property is set, the control in which the LayoutData is added, will always cause a line break within the ResponsiveFlowLayout.
			 */
			linebreak : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Prevents any margin of the element if set to false.
			 */
			margin : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Shows if an element can be wrapped into a new row. If this value is set to false, the min-width will be set to 0 and the wrapping is up to the previous element.
			 */
			linebreakable : {type : "boolean", group : "Misc", defaultValue : true}
		}
	}});

	ResponsiveFlowLayoutData.MIN_WIDTH = 100;
	ResponsiveFlowLayoutData.WEIGHT = 1;
	ResponsiveFlowLayoutData.LINEBREAK = false;
	ResponsiveFlowLayoutData.MARGIN = true;
	ResponsiveFlowLayoutData.LINEBREAKABLE = true;

	ResponsiveFlowLayoutData.prototype.setWeight = function(iWeight) {
		if (iWeight >= 1) {
			this.setProperty("weight", iWeight);
		} else {
			jQuery.sap.log.warning("Values smaller than 1 are invalid. Default value '1' is used instead", this);
			this.setProperty("weight", ResponsiveFlowLayoutData.WEIGHT);
		}

		return this;
	};

	ResponsiveFlowLayoutData.prototype.setLinebreak = function(bLinebreak) {
		// if the element should not be line-breakable and a forced linebreak should
		// be set
		if (this.getLinebreakable() == false && bLinebreak) {
			jQuery.sap.log.warning("Setting 'linebreak' AND 'linebreakable' doesn't make any sense. Please set either 'linebreak' or 'linebreakable'", this);
		} else {
			this.setProperty("linebreak", bLinebreak);
		}
	};

	ResponsiveFlowLayoutData.prototype.setLinebreakable = function(bLinebreakable) {
		// if the element has a forced line break and the element should be set to
		// not line-breakable
		if (this.getLinebreak() === true && bLinebreakable === false) {
			jQuery.sap.log.warning("Setting 'linebreak' AND 'linebreakable' doesn't make any sense. Please set either 'linebreak' or 'linebreakable'", this);
		} else {
			this.setProperty("linebreakable", bLinebreakable);
			// this.setMinWidth(0);
		}
	};

	return ResponsiveFlowLayoutData;

}, /* bExport= */ true);
