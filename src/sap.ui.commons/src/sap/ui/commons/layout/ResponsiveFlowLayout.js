/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.layout.ResponsiveFlowLayout.
sap.ui.define([
 'jquery.sap.global',
 'sap/ui/commons/library',
 'sap/ui/layout/ResponsiveFlowLayout',
 "./ResponsiveFlowLayoutRenderer"
],
	function(jQuery, library, ResponsiveFlowLayout1, ResponsiveFlowLayoutRenderer) {
	"use strict";



	/**
	 * Constructor for a new layout/ResponsiveFlowLayout.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This is a layout where several controls can be added. These controls are blown up to fit a whole line. If the window resizes the controls are moved between the lines and resized again.
	 * @extends sap.ui.layout.ResponsiveFlowLayout
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.9.1
	 * @deprecated Since version 1.16.0.
	 * moved to sap.ui.layout library. Please use this one.
	 * @alias sap.ui.commons.layout.ResponsiveFlowLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ResponsiveFlowLayout = ResponsiveFlowLayout1.extend("sap.ui.commons.layout.ResponsiveFlowLayout", /** @lends sap.ui.commons.layout.ResponsiveFlowLayout.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.commons"
	}});



	return ResponsiveFlowLayout;

}, /* bExport= */ true);
