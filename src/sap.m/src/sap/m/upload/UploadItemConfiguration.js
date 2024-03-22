/*!
 * ${copyright}
 */

// Provides control sap.m.upload.UploadSetwithTableItem.
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Element"
], function (Log, Element) {
    "use strict";

	/**
	 * Constructor for a new UploadItemConfiguration.
	 *
	 * @param {string} [sId] Id for the new Element, it is generated automatically if no ID is provided.
	 * @param {object} [mSettings] Initial settings for the new Element.
	 * @class
	 * <code>sap.m.UploadItemConfiguration</code> represents the configuration for the items in the {@link sap.m.plugins.UploadSetwithTable UploadSetwithTable} Plugin.
	 * The confguration template represents the paths in the model to the file name, mediaType, url, uploadUrl, previewable and file size properties of the {@link sap.m.upload.UploadItem UploadItem}
	 * which is essesntial to the plugin in understanding the structure of the model data bound and continue with the operations.
	 *
	 * <b>Note:</b> Configuration is mandatory for the plugin to offer the features like File preview, download, rename etc.
	 * <b>Note:</b> This Element should only be used within the {@link sap.m.plugins.UploadSetwithTable UploadSetwithTable} Plugin.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @constructor
	 * @private
	 * @version ${version}
	 * @alias sap.m.upload.UploadItemConfiguration
	 */
    const UploadItemConfiguration = Element.extend("sap.m.upload.UploadItemConfiguration", {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * model name if defined and bound to the table bindings items/rows
					*/
					modelName: {type: "string", defaultValue: null},
					/**
					 * specifies the path in the model to the file name.
					 */
					fileNamePath: {type: "string", defaultValue: null},
					/**
					 * Specifies the path in the model to the file mediaType.
					 */
					mediaTypePath: {type: "string", defaultValue: null},
					/**
					 * Specifies the path in the model to the file url. Used to download/access the file.
					 */
					urlPath: {type: "string", defaultValue: null},
					/**
					 * Specifies the path in the model for upload url. used to upload the file.
					 */
					uploadUrlPath: {type: "string", defaultValue: null},
					/**
					 * Specifies the path in the model to determine if the file uploaded can be previewed.
					 */
					previewablePath: {type: "string", defaultValue: null},
					/**
					 * Specifies file size of the item in bytes.
					 */
					fileSizePath: {type: "string", defaultValue: null}
				}
			}
    });

	/**
	 * Validates the configuration of the file name path value.
	 * @param {sap.ui.model.Context} oBindingContext context of the item
	 * @returns {boolean} true if the file name is valid, false otherwise.
	 * @private
	 */
	UploadItemConfiguration.prototype._fileNameValidator = function (oBindingContext) {
		const sPath = this.getFileNamePath();
		if (!sPath) {
			return false;
		}
		const value = oBindingContext?.getProperty(sPath);

		if (typeof value === "string") {
			return true;
		}
		Log.error(`Invalid file name value at ${oBindingContext.getPath()}. Expected string.`);
		return false;
	};

	/**
	 * Validates the configuration of the media type path value.
	 * @param {sap.ui.model.Context} oBindingContext context of the item
	 * @returns {boolean} true if the media type is valid, false otherwise.
	 * @private
	 */
	UploadItemConfiguration.prototype._mediaTypeValidator = function (oBindingContext) {
		const sPath = this.getMediaTypePath();
		if (!sPath) {
			return false;
		}
		const value = oBindingContext?.getProperty(sPath);
		if (typeof value === "string") {
			return true;
		}
		Log.error(`Invalid media type value at ${oBindingContext.getPath()}. Expected string.`);
		return false;
	};

	/**
	 * Validates the configuration of the url path value.
	 * @param {sap.ui.model.Context} oBindingContext context of the item
	 * @returns {boolean} true if the url is valid, false otherwise.
	 * @private
	 */
	UploadItemConfiguration.prototype._urlValidator = function (oBindingContext) {
		const sPath = this.getUrlPath();
		if (!sPath) {
			return false;
		}
		const value = oBindingContext?.getProperty(sPath);
		if (typeof value === "string") {
			return true;
		}
		Log.error(`Invalid url value at ${oBindingContext.getPath()}. Expected string.`);
		return false;
	};

	/**
	 * Validates the configuration of the upload url path value.
	 * @param {sap.ui.model.Context} oBindingContext context of the item
	 * @returns {boolean} true if the upload url is valid, false otherwise.
	 * @private
	 */
	UploadItemConfiguration.prototype._uploadUrlValidator = function (oBindingContext) {
		const sPath = this.getUploadUrlPath();
		if (!sPath) {
			return false;
		}
		const value = oBindingContext?.getProperty(sPath);
		if (typeof value === "string") {
			return true;
		}
		Log.error(`Invalid upload URL value at ${oBindingContext.getPath()}. Expected string.`);
		return false;

	};

	/**
	 * Validates the configuration of the previewable path value.
	 * @param {sap.ui.model.Context} oBindingContext context of the item
	 * @returns {boolean} true if the previewable is valid, false otherwise.
	 * @private
	 */
	UploadItemConfiguration.prototype._previewableValidator = function (oBindingContext) {
		const sPath = this.getPreviewablePath();
		if (!sPath) {
			return false;
		}
		const value = oBindingContext?.getProperty(sPath);
		if (typeof value === "boolean") {
			return true;
		} else if (typeof value === "string") {
			if (value.toLowerCase() === "true" || value.toLowerCase() === "false") {
				return true;
			}
		}
		Log.error(`Invalid previewable value at ${oBindingContext.getPath()}. Expected string.`);
		return false;
	};

	/**
	 * Validates the configuration of the file size path value.
	 * @param {sap.ui.model.Context} oBindingContext context of the item
	 * @returns {boolean} true if the file size is valid, false otherwise.
	 * @private
	 */
	UploadItemConfiguration.prototype._fileSizeValidator = function (oBindingContext) {
		const sPath = this.getFileSizePath();
		if (!sPath) {
			return false;
		}
		const value = oBindingContext?.getProperty(sPath);
		if (typeof value === "number") {
			return true;
		} else if (typeof value === "string") {
			const sValue = parseFloat(value);
			if (!isNaN(sValue)) {
				return false;
			}
		}
		Log.error(`Invalid file Size value at ${oBindingContext.getPath()}. Expected number.`);
		return false;
	};

    return UploadItemConfiguration;
});
