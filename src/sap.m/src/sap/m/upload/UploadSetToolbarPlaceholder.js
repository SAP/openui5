/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Control"
], function(library, Control) {
	"use strict";

	/**
	 * Constructor for a new UploadSetToolbarPlaceholder.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Used to create a customizable toolbar for the UploadSet.
	 * A FileUploader instance is required in the toolbar and it is placed by the application.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.upload.UploadSetToolbarPlaceholder
	 */

	var UploadSetToolbarPlaceholder = Control.extend("sap.m.upload.UploadSetToolbarPlaceholder", {
		metadata: {
			library: "sap.m",
			properties: {}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {}
		}
	});

	return UploadSetToolbarPlaceholder;

});
