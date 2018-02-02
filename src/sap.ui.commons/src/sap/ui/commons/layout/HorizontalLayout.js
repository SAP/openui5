/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.layout.HorizontalLayout.
sap.ui.define([
 'jquery.sap.global',
 'sap/ui/commons/library',
 'sap/ui/layout/HorizontalLayout',
 "./HorizontalLayoutRenderer"
],
	function(jQuery, library, HorizontalLayout1, HorizontalLayoutRenderer) {
	"use strict";



	/**
	 * Constructor for a new layout/HorizontalLayout.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A layout that provides support for horizontal alignment of controls
	 * @extends sap.ui.layout.HorizontalLayout
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.ui.layout.HorizontalLayout</code> control.
	 * @alias sap.ui.commons.layout.HorizontalLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var HorizontalLayout = HorizontalLayout1.extend("sap.ui.commons.layout.HorizontalLayout", /** @lends sap.ui.commons.layout.HorizontalLayout.prototype */ { metadata : {

		library : "sap.ui.commons"
	}});



	return HorizontalLayout;

}, /* bExport= */ true);
