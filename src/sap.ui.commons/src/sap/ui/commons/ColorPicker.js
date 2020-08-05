/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.ColorPicker.
sap.ui.define(['./library', 'sap/ui/unified/ColorPicker', "sap/base/Log"],
	function(library, UnifiedColorPicker, Log) {
	"use strict";



	/**
	 * Constructor for a new ColorPicker.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control gives the user the opportunity to choose a color. The color can be defined using HEX-, RGB- or HSV-values or a CSS colorname.
	 * @extends sap.ui.unified.ColorPicker
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated as of version 1.38, replaced by {@link sap.ui.unified.ColorPicker}
	 * @alias sap.ui.commons.ColorPicker
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColorPicker = UnifiedColorPicker.extend("sap.ui.commons.ColorPicker", /** @lends sap.ui.commons.ColorPicker.prototype */ {
		metadata : {
			deprecated : true,
			library : "sap.ui.commons"
		},
		renderer : "sap.ui.unified.ColorPickerRenderer"
	});

	try {
		sap.ui.getCore().loadLibrary("sap.ui.unified");
	} catch (e) {
		Log.error("The control 'sap.ui.commons.ColorPicker' needs library 'sap.ui.unified'.");
		throw (e);
	}

	return ColorPicker;

});
