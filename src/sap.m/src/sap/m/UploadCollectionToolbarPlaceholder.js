/*!
 * ${copyright}
 */
// Provides sap.m.UploadCollectionToolbarPlaceholder.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";

	/**
	 * Constructor for a new UploadCollectionToolbarPlaceholder.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control needs to be used when you would like to create a customizable toolbar for the UploadCollection. Always a FileUploader instance is
	 * required in the toolbar, the FileUploader will be placed in the position defined by the application.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34
	 * @alias sap.m.UploadCollectionToolbarPlaceholder
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var UploadCollectionToolbarPlaceholder = Control.extend("sap.m.UploadCollectionToolbarPlaceholder", { metadata : {
		library : "sap.m",
		properties : {}
	}});

	return UploadCollectionToolbarPlaceholder;

}, /* bExport= */ true);
