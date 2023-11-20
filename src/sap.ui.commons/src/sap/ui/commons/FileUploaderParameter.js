/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.FileUploaderParameter.
sap.ui.define(['sap/base/Log', './library', 'sap/ui/unified/FileUploaderParameter'],
	function(Log, library, UnifiedFileUploaderParameter) {
	"use strict";

	/**
	 * Constructor for a new FileUploaderParameter.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Represents a parameter for the FileUploader which is rendered as a hidden inputfield.
	 * @extends sap.ui.unified.FileUploaderParameter
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.21.0.
	 * Please use the element sap.ui.unified.FileUploaderParameter of the library sap.ui.unified instead.
	 * @alias sap.ui.commons.FileUploaderParameter
	 */
	var FileUploaderParameter = UnifiedFileUploaderParameter.extend("sap.ui.commons.FileUploaderParameter", /** @lends sap.ui.commons.FileUploaderParameter.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.commons"
	}});

	try {
		sap.ui.getCore().loadLibrary("sap.ui.unified");
	} catch (e) {
		Log.error("The element 'sap.ui.commons.FileUploaderParameter' needs library 'sap.ui.unified'.");
		throw (e);
	}

	return FileUploaderParameter;

});
