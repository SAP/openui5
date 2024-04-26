/*!
 * ${copyright}
 */

// Provides control sap.m.upload.UploadSetwithTableItem.
sap.ui.define([
	"sap/m/ColumnListItem",
	"sap/ui/core/IconPool",
	"sap/m/upload/UploadSetwithTableItemRenderer",
	"sap/base/Log",
	"sap/ui/core/Lib"
], function (ColumnListItem, IconPool, UploadSetwithTableItemRenderer, Log, Library) {
    "use strict";

	/**
	 * Constructor for a new UploadSetwithTableItem.
	 *
	 * @param {string} [sId] Id for the new control, it is generated automatically if no ID is provided.
	 * @param {object} [mSettings] Initial settings for the new control.
	 * @class
	 * <code>sap.m.UploadSetwithTableItem</code> represents one item to be uploaded using the {@link sap.m.upload.UploadSetwithTable UploadSetwithTable} control. This control can be used with the cells aggregation to create rows for the {@link sap.m.upload.UploadSetwithTable UploadSetwithTable} control. The columns aggregation of the sap.m.upload.UploadSetwithTable should match with the cells aggregation.
	 *
	 * <b>Note:</b> This control should only be used within the {@link sap.m.upload.UploadSetwithTable UploadSetwithTable} control. The inherited counter property of sap.m.ListItemBase is not supported.
	 * @extends sap.m.ColumnListItem
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @deprecated as of version 1.124, replaced by {@link sap.m.upload.UploadItem}
	 * @version ${version}
	 * @alias sap.m.upload.UploadSetwithTableItem
	 */
    var UploadSetwithTableItem = ColumnListItem.extend("sap.m.upload.UploadSetwithTableItem", {
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
			},
			renderer: UploadSetwithTableItemRenderer
    });

	/* ================== */
	/* Lifecycle handling */
	/* ================== */

    UploadSetwithTableItem.prototype.init = function () {
        ColumnListItem.prototype.init.apply(this, arguments);
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

    UploadSetwithTableItem.prototype.onBeforeRendering = function () {
        ColumnListItem.prototype.onBeforeRendering.apply(this, arguments);
    };

	UploadSetwithTableItem.prototype.onAfterRendering = function() {
		ColumnListItem.prototype.onAfterRendering.call(this);
	};

	UploadSetwithTableItem.prototype.exit = function() {
		ColumnListItem.prototype.exit.call(this);
	};

	/* ===================== */
	/* Overriden API methods */
	/* ===================== */

	UploadSetwithTableItem.prototype.setFileName = function (sFileName) {
		if (this.getFileName() !== sFileName) {
			this.setProperty("fileName", sFileName, true);
			// File name related controls available no sooner than a parent is set
			if (this.getParent()) {
				this._checkNameLengthRestriction(this.getParent().getMaxFileNameLength());
				this._checkTypeRestriction(this.getParent().getFileTypes());
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
	UploadSetwithTableItem.prototype.getFileObject = function () {
		return this._oFileObject;
	};

	/**
	 * Previews pressed file.
	 * @public
	 */
	UploadSetwithTableItem.prototype.openPreview = function () {
		this.getParent()?._openFilePreview(this);
	};

	/**
	 * Downloads the item. Only possible when the item has a valid URL specified in the <code>url</code> property.
	 * @param {boolean} bAskForLocation Whether to ask for a location where to download the file or not.
	 * @public
	 * @returns {boolean} <code>true</code> if download is possible, <code>false</code> otherwise.
	 */
	UploadSetwithTableItem.prototype.download = function (bAskForLocation) {
		var oParent = this.getParent();
		if (!oParent) {
			Log.warning("Download cannot proceed without a parent association.");
			return false;
		}

		return oParent._getActiveUploader ? oParent._getActiveUploader().download(this, [], bAskForLocation) : false;
	};

	/**
	 * Validates if the item is restricted, to check if it is restricted for the file type, media type, maximum file name length and maximum file size limit.
	 *
	 * @public
	 * @returns {boolean} <code>true</code> if item is restricted, <code>false</code> otherwise.
	 *
	 */
	UploadSetwithTableItem.prototype.isRestricted = function () {
		return this._isRestricted();
	};

	/**
	 * Returns the details of the file selected from the CloudFilePicker control.
	 * @returns {sap.suite.ui.commons.CloudFileInfo} oCloudFileInfo Specifies the details of the file selected from the cloudFilePicker control.
	 * @public
	 */
	UploadSetwithTableItem.prototype.getCloudFileInfo = function() {
		return this._oCloudFileInfo;
	};

	/* =============== */
	/* Private methods */
	/* =============== */

	UploadSetwithTableItem._getIconByMimeType = function(sMimeType, fileName) {

		if (sMimeType) {
			return IconPool.getIconForMimeType(sMimeType);
		} else {
			return UploadSetwithTableItem._getIconByFileType(fileName);
		}
	};

	UploadSetwithTableItem._getIconByFileType = function (fileName) {
		var sFileExtension = UploadSetwithTableItem._splitFileName(fileName).extension;
		if (!sFileExtension) {
			return "sap-icon://document";
		}

		switch (sFileExtension.toLowerCase()) {
			case "bmp" :
			case "jpg" :
			case "jpeg" :
			case "png" :
				return UploadSetwithTableItem.IMAGE_FILE_ICON;
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

	UploadSetwithTableItem._splitFileName = function (sFileName, bWithDot) {
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

	UploadSetwithTableItem.prototype._setFileObject = function (oFileObject) {
		this._oFileObject = oFileObject;
		if (oFileObject) {
			this._fFileSize = oFileObject.size / UploadSetwithTableItem.MEGABYTE;
			this.setFileSize(oFileObject.size);
			this.setMediaType(oFileObject.type);
		} else {
			this._fFileSize = null;
			this.setMediaType(null);
		}
		if (this.getParent()) {
			this._checkSizeRestriction(this.getParent().getMaxFileSize());
			this._checkMediaTypeRestriction(this.getParent().getMediaTypes());
		}
	};

	/**
	 * Checks if and how compliance with the file name length restriction changed for this item.
	 * @param {int} iMaxLength Maximum length of file name.
	 * @private
	 */
	UploadSetwithTableItem.prototype._checkNameLengthRestriction = function (iMaxLength) {
		var bRestricted = (iMaxLength && !!this.getFileName() && this.getFileName().length > iMaxLength);
		if (bRestricted !== this._bNameLengthRestricted) {
			this._bNameLengthRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent().fireFileNameLengthExceeded({item: this});
			}
		}
	};

	/**
	 * Checks if and how compliance with the file size restriction changed for this item.
	 * @param {float} fMaxSize Maximum file size allowed in megabytes.
	 * @private
	 */
	UploadSetwithTableItem.prototype._checkSizeRestriction = function (fMaxSize) {
		var bRestricted = (fMaxSize && this._fFileSize > fMaxSize);
		if (bRestricted !== this._bSizeRestricted) {
			this._bSizeRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent().fireFileSizeExceeded({item: this});
			}
		}
	};

	/**
	 * Checks if and how compliance with the mime type restriction changed for this item.
	 * @param {string[]} aTypes List of allowed mime types.
	 * @private
	 */
	UploadSetwithTableItem.prototype._checkMediaTypeRestriction = function (aTypes) {
		var bRestricted = (!!aTypes && (aTypes.length > 0) && !!this.getMediaType() && aTypes.indexOf(this.getMediaType()) === -1);
		if (bRestricted !== this._bMediaTypeRestricted) {
			this._bMediaTypeRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent().fireMediaTypeMismatch({item: this});
			}
		}
	};

	/**
	 * Checks if and how compliance with the file type restriction changed for this item.
	 * @param {string[]} aTypes List of allowed file types.
	 * @private
	 */
	UploadSetwithTableItem.prototype._checkTypeRestriction = function (aTypes) {
		var oFile = UploadSetwithTableItem._splitFileName(this.getFileName()),
			bRestricted =
				(!!this.getFileName() && !!aTypes && (aTypes.length > 0)
					&& oFile.extension && aTypes.indexOf(oFile.extension.toLowerCase()) === -1);
		if (bRestricted !== this._bFileTypeRestricted) {
			this._bFileTypeRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent().fireFileTypeMismatch({item: this});
			}
		}
	};

	UploadSetwithTableItem.prototype._isRestricted = function () {
		return this._bFileTypeRestricted || this._bNameLengthRestricted || this._bSizeRestricted || this._bMediaTypeRestricted;
	};

	/**
	 * @param {suite.ui.commons.CloudFileInfo} oCloudFileInfo info the file selected from the CloudFilePicker control.
	 * @private
	 */
	UploadSetwithTableItem.prototype._setCloudFileInfo = function(oCloudFileInfo) {
		this._oCloudFileInfo = oCloudFileInfo;
	};

    UploadSetwithTableItem.IMAGE_FILE_ICON = "sap-icon://card";
	UploadSetwithTableItem.MEGABYTE = 1048576;

    return UploadSetwithTableItem;
});
