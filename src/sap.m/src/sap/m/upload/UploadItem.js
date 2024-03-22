/*!
 * ${copyright}
 */

// Provides Element sap.m.upload.UploadItem.
sap.ui.define([
	"sap/ui/core/IconPool",
	"sap/base/Log",
	"sap/ui/core/Lib",
	"sap/ui/core/Element"
], function (IconPool, Log, Library, Element) {
    "use strict";

	/**
	 * Constructor for a new UploadItem.
	 *
	 * @param {string} [sId] Id for the new control, it is generated automatically if no ID is provided.
	 * @param {object} [mSettings] Initial settings for the new control.
	 * @class
	 * <code>sap.m.upload.UploadItem</code> represents one item to be uploaded using the {@link sap.m.plugins.UploadSetwithTable UploadSetwithTable}
	 *
	 * <b>Note:</b> This Element should only be used within the {@link sap.m.plugins.UploadSetwithTable UploadSetwithTable} control.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @constructor
	 * @private
	 * @version ${version}
	 * @alias sap.m.upload.UploadItem
	 */
    var UploadItem = Element.extend("sap.m.upload.UploadItem", {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Specifies the name of the uploaded file.
					 */
					fileName: {type: "string", defaultValue: null},
					/**
					 * Specifies the MIME type of the file.
					 */
					mediaType: {type: "string", defaultValue: null},
					/**
					 * Specifies the URL where the file is located.
					 */
					url: {type: "string", defaultValue: null},
					/**
					 * URL where the uploaded files are stored. If empty, uploadUrl from the uploader is considered.
					 */
					uploadUrl: {type: "string", defaultValue: null},
					/**
					 * State of the item relevant to its upload process.
					 */
					uploadState: {type: "sap.m.UploadState", defaultValue: null},
					/**
					 * Specifies whether the item can be previewed.
					 */
					previewable: {type: "boolean", defaultValue: true},
					/**
					 * Specifies file size of the item in bytes.
					 */
					fileSize: {type: "float", defaultValue: 0}
				},
				aggregations: {
					/**
					 * Header fields to be included in the header section of an XMLHttpRequest (XHR) request
					 */
					headerFields: {type: "sap.ui.core.Item", multiple: true, singularName: "headerField"}
				}
			}
    });

	/* ================== */
	/* Lifecycle handling */
	/* ================== */

    UploadItem.prototype.init = function () {
		this._oFileObject = null;
		this._fFileSize = null;
		// Restriction flags
		this._bFileTypeRestricted = false;
		this._bNameLengthRestricted = false;
		this._bSizeRestricted = false;
		this._bMediaTypeRestricted = false;
		this._oRb = Library.getResourceBundleFor("sap.m");
		this._oCloudFileInfo = null;
    };

	/* ===================== */
	/* Overriden API methods */
	/* ===================== */

	UploadItem.prototype.setFileName = function (sFileName) {
		if (this.getFileName() !== sFileName) {
			this.setProperty("fileName", sFileName);
			// File name related controls available no sooner than a parent is set
			if (this.getParent() && this.getParent().getMaxFileNameLength && this.getParent().getFileTypes) {
				this._checkNameLengthRestriction(this.getParent()?.getMaxFileNameLength());
				this._checkTypeRestriction(this.getParent()?.getFileTypes());
			}
		}

		return this;
	};

	/* ============== */
	/* Public methods */
	/* ============== */

	/**
	 * Returns file object.
	 *
	 * @public
	 * @returns {File|Blob} File object.
	 *
	 */
	UploadItem.prototype.getFileObject = function () {
		return this._oFileObject;
	};

	/**
	 * Downloads the item. Only possible when the item has a valid URL specified in the <code>url</code> property.
	 * @param {boolean} bAskForLocation Whether to ask for a location where to download the file or not.
	 * @public
	 * @returns {boolean} <code>true</code> if download is possible, <code>false</code> otherwise.
	 */
	UploadItem.prototype.download = function (bAskForLocation) {
		var oParent = this.getParent();
		if (!oParent) {
			Log.warning("Download cannot proceed without a parent association.");
			return false;
		}

		return oParent?._initiateFileDownload(this, bAskForLocation);
	};

	/**
	 * Validates if the item is restricted, to check if it is restricted for the file type, media type, maximum file name length and maximum file size limit.
	 *
	 * @public
	 * @returns {boolean} <code>true</code> if item is restricted, <code>false</code> otherwise.
	 *
	 */
	UploadItem.prototype.isRestricted = function () {
		return this._isRestricted();
	};

	/**
	 * Returns the details of the file selected from the CloudFilePicker control.
	 * @returns {sap.suite.ui.commons.CloudFileInfo} oCloudFileInfo Specifies the details of the file selected from the cloudFilePicker control.
	 * @public
	 */
	UploadItem.prototype.getCloudFileInfo = function() {
		return this._oCloudFileInfo;
	};

	/* =============== */
	/* Private methods */
	/* =============== */

	UploadItem._getIconByMimeType = function(sMimeType, fileName) {

		if (sMimeType) {
			return IconPool.getIconForMimeType(sMimeType);
		} else {
			return UploadItem._getIconByFileType(fileName);
		}
	};

	UploadItem._getIconByFileType = function (fileName) {
		var sFileExtension = UploadItem._splitFileName(fileName).extension;
		if (!sFileExtension) {
			return "sap-icon://document";
		}

		switch (sFileExtension.toLowerCase()) {
			case "bmp" :
			case "jpg" :
			case "jpeg" :
			case "png" :
				return UploadItem.IMAGE_FILE_ICON;
			case "csv" :
			case "xls" :
			case "xlsx" :
				return "sap-icon://excel-attachment";
			case "doc" :
			case "docx" :
			case "odt" :
				return "sap-icon://doc-attachment";
			case "pdf" :
				return "sap-icon://pdf-attachment";
			case "ppt" :
			case "pptx" :
				return "sap-icon://ppt-attachment";
			case "txt" :
				return "sap-icon://document-text";
			default :
				return "sap-icon://document";
		}
	};

	UploadItem._splitFileName = function (sFileName, bWithDot) {
		var oResult = {};
		var oRegex = /(?:\.([^.]+))?$/;
		var aFileExtension = oRegex.exec(sFileName);
		if (!aFileExtension[0]) {
			aFileExtension[0] = "";
			oResult.name = sFileName;
		} else {
			oResult.name = sFileName ? sFileName.slice(0, sFileName.indexOf(aFileExtension[0])) : "";
		}
		if (bWithDot) {
			oResult.extension = aFileExtension[0];
		} else {
			oResult.extension = aFileExtension[1];
		}
		return oResult;
	};

	UploadItem.prototype._setFileObject = function (oFileObject) {
		this._oFileObject = oFileObject;
		if (oFileObject) {
			this._fFileSize = oFileObject.size / UploadItem.MEGABYTE;
			this.setFileSize(oFileObject.size);
			this.setMediaType(oFileObject.type);
		} else {
			this._fFileSize = null;
			this.setMediaType(null);
		}
		if (this.getParent()) {
			this._checkSizeRestriction(this.getParent()?.getMaxFileSize());
			this._checkMediaTypeRestriction(this.getParent()?.getMediaTypes());
		}
	};

	/**
	 * Checks if and how compliance with the file name length restriction changed for this item.
	 * @param {int} iMaxLength Maximum length of file name.
	 * @private
	 */
	UploadItem.prototype._checkNameLengthRestriction = function (iMaxLength) {
		var bRestricted = (iMaxLength && !!this.getFileName() && this.getFileName().length > iMaxLength);
		if (bRestricted !== this._bNameLengthRestricted) {
			this._bNameLengthRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent()?.fireFileNameLengthExceeded({item: this});
			}
		}
	};

	/**
	 * Checks if and how compliance with the file size restriction changed for this item.
	 * @param {float} fMaxSize Maximum file size allowed in megabytes.
	 * @private
	 */
	UploadItem.prototype._checkSizeRestriction = function (fMaxSize) {
		var bRestricted = (fMaxSize && this._fFileSize > fMaxSize);
		if (bRestricted !== this._bSizeRestricted) {
			this._bSizeRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent()?.fireFileSizeExceeded({item: this});
			}
		}
	};

	/**
	 * Checks if and how compliance with the mime type restriction changed for this item.
	 * @param {string[]} aTypes List of allowed mime types.
	 * @private
	 */
	UploadItem.prototype._checkMediaTypeRestriction = function (aTypes) {
		var bRestricted = (!!aTypes && (aTypes.length > 0) && !!this.getMediaType() && aTypes.indexOf(this.getMediaType()) === -1);
		if (bRestricted !== this._bMediaTypeRestricted) {
			this._bMediaTypeRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent()?.fireMediaTypeMismatch({item: this});
			}
		}
	};

	/**
	 * Checks if and how compliance with the file type restriction changed for this item.
	 * @param {string[]} aTypes List of allowed file types.
	 * @private
	 */
	UploadItem.prototype._checkTypeRestriction = function (aTypes) {
		var oFile = UploadItem._splitFileName(this.getFileName()),
			bRestricted =
				(!!this.getFileName() && !!aTypes && (aTypes.length > 0)
					&& oFile.extension && aTypes.indexOf(oFile.extension.toLowerCase()) === -1);
		if (bRestricted !== this._bFileTypeRestricted) {
			this._bFileTypeRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent()?.fireFileTypeMismatch({item: this});
			}
		}
	};

	UploadItem.prototype._isRestricted = function () {
		return this._bFileTypeRestricted || this._bNameLengthRestricted || this._bSizeRestricted || this._bMediaTypeRestricted;
	};

	/**
	 * @param {suite.ui.commons.CloudFileInfo} oCloudFileInfo info the file selected from the CloudFilePicker control.
	 * @private
	 */
	UploadItem.prototype._setCloudFileInfo = function(oCloudFileInfo) {
		this._oCloudFileInfo = oCloudFileInfo;
	};

    UploadItem.IMAGE_FILE_ICON = "sap-icon://card";
	UploadItem.MEGABYTE = 1048576;

    return UploadItem;
});
