/*!
 * ${copyright}
 */

// Provides control sap.m.upload.UploadSetTableItem.
sap.ui.define([
	"sap/m/ColumnListItem",
	"sap/ui/core/IconPool",
	"sap/m/upload/UploadSetTableItemRenderer",
	"sap/base/Log",
	"sap/ui/core/Core"
], function (ColumnListItem, IconPool, UploadSetTableItemRenderer, Log, Core) {
    "use strict";

	/**
	 * Constructor for a new UploadSetTableItem.
	 *
	 * @param {string} [sId] ID for the new control, will be generated automatically if no ID is provided.
	 * @param {object} [mSettings] Initial settings for the new control.
	 * @class ColumnListItem that represents one item to be uploaded using the {@link sap.m.upload.UploadSetTable} control.
	 * @extends sap.m.ColumnListItem
	 * @author SAP SE
	 * @constructor
	 * @private
	 * @experimental
	 * @internal
	 * @alias sap.m.upload.UploadSetTableItem
	 */
    var UploadSetTableItem = ColumnListItem.extend("sap.m.upload.UploadSetTableItem", {
		metadata: {
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
				 * URL where the uploaded files will be stored. If empty, uploadUrl from the uploader is considered.
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

		render: UploadSetTableItemRenderer,
		renderer: UploadSetTableItemRenderer
	});

	/* ================== */
	/* Lifecycle handling */
	/* ================== */

    UploadSetTableItem.prototype.init = function () {
        ColumnListItem.prototype.init.apply(this, arguments);
		this._oFileObject = null;
		this._fFileSize = null;
		// Restriction flags
		this._bFileTypeRestricted = false;
		this._bNameLengthRestricted = false;
		this._bSizeRestricted = false;
		this._bMediaTypeRestricted = false;
		this._oRb = Core.getLibraryResourceBundle("sap.m");
    };

    UploadSetTableItem.prototype.onBeforeRendering = function () {
        ColumnListItem.prototype.onBeforeRendering.apply(this, arguments);
    };

	UploadSetTableItem.prototype.onAfterRendering = function() {
		ColumnListItem.prototype.onAfterRendering.call(this);
	};

	UploadSetTableItem.prototype.exit = function() {
		ColumnListItem.prototype.exit.call(this);
	};

	/* ===================== */
	/* Overriden API methods */
	/* ===================== */

	UploadSetTableItem.prototype.setFileName = function (sFileName) {
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
	UploadSetTableItem.prototype.getFileObject = function () {
		return this._oFileObject;
	};

	/**
	 * Previews pressed file.
	 * @public
	 */
	UploadSetTableItem.prototype.openPreview = function () {
		this.getParent()?._openFilePreview(this);
	};

	/**
	 * Downloads the item. Only possible when the item has a valid URL specified in the <code>url</code> property.
	 * @param {boolean} bAskForLocation Whether to ask for a location where to download the file or not.
	 * @public
	 * @returns {boolean} <code>true</code> if download is possible, <code>false</code> otherwise.
	 */
	UploadSetTableItem.prototype.download = function (bAskForLocation) {
		var oParent = this.getParent();
		if (!oParent) {
			Log.warning("Download cannot proceed without a parent association.");
			return false;
		}

		return oParent._getActiveUploader ? oParent._getActiveUploader().download(this, [], bAskForLocation) : false;
	};

	/**
	 * Validates if the item is restricted, which means that it is restricted for the file type, media type, maximum file name length and maximum file size limit.
	 *
	 * @public
	 * @returns {boolean} <code>true</code> if item is restricted, <code>false</code> otherwise.
	 *
	 */
	UploadSetTableItem.prototype.isRestricted = function () {
		return this._isRestricted();
	};

	/* =============== */
	/* Private methods */
	/* =============== */

	UploadSetTableItem._getIconByMimeType = function(sMimeType, fileName) {

		var mimeTypeForImages = ["image/png", "image/tiff", "image/bmp", "image/jpeg", "image/gif"];

		if (sMimeType) {
			if (mimeTypeForImages.indexOf(sMimeType) === -1) {
				return IconPool.getIconForMimeType(sMimeType);
			}
			return UploadSetTableItem._getIconByFileType(fileName);
		} else {
			return UploadSetTableItem._getIconByFileType(fileName);
		}
	};

	UploadSetTableItem._getIconByFileType = function (fileName) {
		var sFileExtension = UploadSetTableItem._splitFileName(fileName).extension;
		if (!sFileExtension) {
			return "sap-icon://document";
		}

		switch (sFileExtension.toLowerCase()) {
			case "bmp" :
			case "jpg" :
			case "jpeg" :
			case "png" :
				return UploadSetTableItem.IMAGE_FILE_ICON;
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

	UploadSetTableItem._splitFileName = function (sFileName, bWithDot) {
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

	UploadSetTableItem.prototype._setFileObject = function (oFileObject) {
		this._oFileObject = oFileObject;
		if (oFileObject) {
			this._fFileSize = oFileObject.size / UploadSetTableItem.MEGABYTE;
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
	UploadSetTableItem.prototype._checkNameLengthRestriction = function (iMaxLength) {
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
	UploadSetTableItem.prototype._checkSizeRestriction = function (fMaxSize) {
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
	UploadSetTableItem.prototype._checkMediaTypeRestriction = function (aTypes) {
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
	UploadSetTableItem.prototype._checkTypeRestriction = function (aTypes) {
		var oFile = UploadSetTableItem._splitFileName(this.getFileName()),
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

	UploadSetTableItem.prototype._isRestricted = function () {
		return this._bFileTypeRestricted || this._bNameLengthRestricted || this._bSizeRestricted || this._bMediaTypeRestricted;
	};

    UploadSetTableItem.IMAGE_FILE_ICON = "sap-icon://card";
	UploadSetTableItem.MEGABYTE = 1048576;

    return UploadSetTableItem;
});
