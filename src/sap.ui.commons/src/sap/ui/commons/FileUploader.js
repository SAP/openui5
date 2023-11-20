/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.FileUploader.
sap.ui.define([
    'sap/base/Log',
    './library',
    'sap/ui/unified/FileUploader',
    './FileUploaderRenderer',
    'sap/ui/core/Core' // sap.ui.getCore()
],
	function(Log, library, UnifiedFileUploader, FileUploaderRenderer, Core) {
	"use strict";

	/**
	 * Constructor for a new FileUploader.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The framework generates an input field and a button with text "Browse ...". The API supports features such as on change uploads (the upload starts immediately after a file has been selected), file uploads with explicit calls, adjustable control sizes, text display after uploads, or tooltips containing complete file paths.
	 * @extends sap.ui.unified.FileUploader
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.21.0.
	 * Please use the control sap.ui.unified.FileUploader of the library sap.ui.unified instead.
	 * @alias sap.ui.commons.FileUploader
	 */
	var FileUploader = UnifiedFileUploader.extend("sap.ui.commons.FileUploader", /** @lends sap.ui.commons.FileUploader.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.commons"
	}});

	try {
		sap.ui.getCore().loadLibrary("sap.ui.unified");
	} catch (e) {
		Log.error("The control 'sap.ui.commons.FileUploader' needs library 'sap.ui.unified'.");
		throw (e);
	}

	return FileUploader;

});
