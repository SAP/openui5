/*!
 * ${copyright}
 */

// Provides Element sap.m.upload.UploadItemConfiguration.
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
	 * <code>sap.m.UploadItemConfiguration</code> represents the configuration for the items in the {@link sap.m.plugins.UploadSetwithTable UploadSetwithTable} plugin.
	 * <br>The configuration template represents the paths in the model to the file name, mediaType, url, uploadUrl, previewable, and file size properties in reference to the {@link sap.m.upload.UploadItem UploadItem}. This is essential for the plugin in understanding the structure of the model data bound to continue with operations.
	 * <br><b>Note:</b> Configuration is mandatory for the plugin to offer the features such as file preview, download, rename etc. The element must be used only within the {@link sap.m.plugins.UploadSetwithTable UploadSetwithTable} plugin.
	 *
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @constructor
	 * @experimental Since 1.124
	 * @public
	 * @since 1.124
	 * @version ${version}
	 * @alias sap.m.upload.UploadItemConfiguration
	 */
    const UploadItemConfiguration = Element.extend("sap.m.upload.UploadItemConfiguration", {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Specifies the path in the model to the file name
					 */
					fileNamePath: {type: "string", defaultValue: null},
					/**
					 * Specifies the path in the model to the file mediaType.
					 */
					mediaTypePath: {type: "string", defaultValue: null},
					/**
					 * Specifies the path in the model to the file URL. It is used to download/access the file.
					 */
					urlPath: {type: "string", defaultValue: null},
					/**
					 * Specifies the path in the model for upload URL. Used to upload the file.
					 */
					uploadUrlPath: {type: "string", defaultValue: null},
					/**
					 * Specifies the path in the model to determine if the file uploaded can be previewed.
					 */
					previewablePath: {type: "string", defaultValue: null},
					/**
					 * Specifies path in the model to the file size.
					 */
					fileSizePath: {type: "string", defaultValue: null},
					/**
					 * Specifies the path in the model to confirm if the file is from a trusted source.
					 * This is used to determine if the file is uploaded from a trusted source.
					 * If the file is uploaded from a trusted source, the file can be previewed.
					 * Set this property to the path in the model that determines if the file is uploaded from a trusted source.
					 * @since 1.125
					 */
					isTrustedSourcePath: {type: "string", defaultValue: null}
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

	/**
	 * Validates the configuration of the isTrustedSource path value.
	 * @param {sap.ui.model.Context} oBindingContext context of the item
	 * @returns {boolean} true if the isTrustedSource is valid, false otherwise.
	 * @private
	 */
	UploadItemConfiguration.prototype._isTrustedSourcePathValidator = function (oBindingContext) {
		const sPath = this.getIsTrustedSourcePath();
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
		Log.error(`Invalid isTrustedSource value at ${oBindingContext.getPath()}. Expected Boolean.`);
		return false;
	};

    return UploadItemConfiguration;
});
