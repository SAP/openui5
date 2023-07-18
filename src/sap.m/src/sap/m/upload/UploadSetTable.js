/*!
 * ${copyright}
 */

// Provides control sap.m.upload.UploadSetTable.
sap.ui.define([
	"sap/m/Table",
	"sap/m/ToolbarSpacer",
	"sap/m/upload/UploadSetTableRenderer",
	"sap/ui/unified/FileUploader",
	"sap/m/upload/UploadSetToolbarPlaceholder",
	"sap/m/upload/UploaderHttpRequestMethod",
	"sap/m/OverflowToolbar",
	"sap/m/upload/UploadSetTableItem",
	"sap/base/util/deepEqual",
	"sap/base/Log",
	"sap/m/library",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageSize",
	"sap/m/upload/UploaderTableItem",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/ui/core/dnd/DragInfo",
	"sap/m/upload/FilePreviewDialog"
], function (Table, ToolbarSpacer, UploadSetTableRenderer, FileUploader,
    UploadSetToolbarPlaceholder, UploaderHttpRequestMethod, OverFlowToolbar, UploadSetTableItem, deepEqual, Log, Library, IllustratedMessageType,
	IllustratedMessage, IllustratedMessageSize, Uploader, DragDropInfo, DropInfo, DragInfo, FilePreviewDialog) {
    "use strict";

	/**
	 * Constructor for a new UploadSetTable.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given.
	 * @param {object} [mSettings] Initial settings for the new control.
	 * @class This control allows you to upload one or more files from your devices (desktop, tablet, or phone)
	 * and attach them to your application.<br>
	 * @extends sap.m.Table
	 * @author SAP SE
	 * @constructor
	 * @private
	 * @experimental
	 * @internal
	 * @alias sap.m.upload.UploadSetTable
	 */
	var UploadSetTable = Table.extend("sap.m.upload.UploadSetTable", {
		library: "sap.m",
		metadata: {
			properties: {
				/**
				 * Allowed file types for files to be uploaded.
				 * <br>If this property is not set, any file can be uploaded.
				 */
				fileTypes: {type: "string[]", defaultValue: null},
				/**
				 * Maximum length of names of files to be uploaded.
				 * <br>If set to <code>null</code> or <code>0</code>, any files can be uploaded,
				 * regardless of their names length.
				 */
				maxFileNameLength: {type: "int", defaultValue: null},
				/**
				 * Size limit in megabytes for files to be uploaded.
				 * <br>If set to <code>null</code> or <code>0</code>, files of any size can be uploaded.
				 */
				maxFileSize: {type: "float", defaultValue: null},
				/**
				 * Allowed media types for files to be uploaded.
				 * <br>If this property is not set, any file can be uploaded.
				 */
				mediaTypes: {type: "string[]", defaultValue: null},
				/**
				 * Defines custom text for the 'No data' text label.
				 */
				noDataText: {type: "string", defaultValue: null},
				/**
				 * Defines custom text for the 'No data' description label.
				 */
				noDataDescription: {type: "string", defaultValue: null},
				/**
				 * Defines custom text for the drag and drop text label.
				 */
				dragDropText: {type: "string", defaultValue: null},
				/**
				 * Defines custom text for the drag and drop description label.
				 */
				dragDropDescription: {type: "string", defaultValue: null},
				/**
				 * URL where the uploaded files will be stored.
				 */
				uploadUrl: {type: "string", defaultValue: null},
				/**
				 * HTTP request method chosen for file upload.
				 */
				httpRequestMethod: {type: "sap.m.upload.UploaderHttpRequestMethod", defaultValue: UploaderHttpRequestMethod.Post},
				/**
				 * Lets the user select multiple files from the same folder and then upload them.
				 *
				 * If multiple property is set to false, the control shows an error message if more than one file is chosen for drag & drop.
				 */
				multiple: {type: "boolean", group: "Behavior", defaultValue: false},
				/**
				 * If set to true, the button used for uploading files become invisible.
				 */
				uploadButtonInvisible: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Defines whether the upload process should be triggered as soon as the file is added.<br>
				 * If set to <code>false</code>, no upload is triggered when a file is added.
				 */
				instantUpload: {type: "boolean", defaultValue: true},
				/**
				 * Function callback invoked with dropped files, by the control to provide custom handling for drag and drop of files into the control area
				 */
				customDropFilesHandler: {type: "function", defaultValue: null},
				/**
				 * Defines whether the upload action is allowed.
				 */
				uploadEnabled: {type: "boolean", defaultValue: true}
			},
			aggregations: {
				headerToolbar : {
					type: "sap.m.OverflowToolbar",
					multiple: false
				},
				/**
				 * Defines the uploader to be used. If not specified, the default implementation is used.
				 */
				uploader: {type: "sap.m.upload.UploaderTableItem", multiple: false},
				/**
				 * Header fields to be included in the header section of an XHR request.
				 */
				headerFields: {type: "sap.ui.core.Item", multiple: true, singularName: "headerField"},
				/**
				 * Additional buttons for the file preview dialog footer.
				 */
				previewDialogAdditionalFooterButtons: {type: "sap.m.Button", multiple: true}
			},
			defaultAggregation : "items",
			events: {
				/**
				 * The event is triggered when the file name is changed.
				 */
				fileRenamed: {
					parameters: {
						/**
						 * The renamed UI element as an UploadSetTableItem.
						 */
						item: {type: "sap.m.upload.UploadSetTableItem"}
					}
				},
				/**
				 * This event is fired after the item is removed on click of ok button in confirmation dialog.
				 */
				afterItemRemoved: {
					parameters: {
						/**
						 * The item removed from the set of items to be uploaded.
						 */
						item: {type: "sap.m.upload.UploadSetTableItem"}
					}
				},
				/**
				 * This event is fired right before the upload process begins.
				 */
				beforeUploadStarts: {
					parameters: {
						/**
						 * The file whose upload is just about to start.
						 */
						item: {type: "sap.m.upload.UploadSetTableItem"}
					},
					allowPreventDefault: true
				},
				/**
				 * This event is fired right after the upload process is finished.
				 */
				uploadCompleted: {
					parameters: {
						/**
						 * The file whose upload has just been completed.
						 */
						item: {type: "sap.m.upload.UploadSetTableItem"},
						/**
						 * Response message which comes from the server.
						*
						* On the server side this response has to be put within the &quot;body&quot; tags of the response
						* document of the iFrame. It can consist of a return code and an optional message. This does not
						* work in cross-domain scenarios.
						*/
						response : {type : "string"},
						/**
						 * ReadyState of the XHR request.
						 *
						 * Required for receiving a <code>readyState</code> is to set the property <code>sendXHR</code>
						 * to true. This property is not supported by Internet Explorer 9.
						 */
						readyState : {type : "string"},
						/**
						* Status of the XHR request.
						*
						* Required for receiving a <code>status</code> is to set the property <code>sendXHR</code> to true.
						* This property is not supported by Internet Explorer 9.
						*/
						status : {type : "string"},
						/**
						* Http-Response which comes from the server.
						*
						* Required for receiving <code>responseXML</code> is to set the property <code>sendXHR</code> to true.
						*
						* This property is not supported by Internet Explorer 9.
						*/
						responseXML : {type : "string"},
						/**
						* Http-Response which comes from the server.
						*
						* Required for receiving <code>responseText</code> is to set the property <code>sendXHR</code> to true.
						*
						* This property is not supported by Internet Explorer 9.
						*/
						responseText : {type : "string"},
						/**
						* Http-Response-Headers which come from the server.
						*
						* Provided as a JSON-map, i.e. each header-field is reflected by a property in the <code>headers</code>
						* object, with the property value reflecting the header-field's content.
						*
						* Required for receiving <code>headers</code> is to set the property <code>sendXHR</code> to true.
						* This property is not supported by Internet Explorer 9.
						*/
						headers : {type : "object"}
					}
				},
				/**
				 * This event is fired in either of the following cases:
				 * <ul>
				 * <li>When a file that is selected to be uploaded fails to meet the file type restriction
				 * (<code>fileType</code> property).</li>
				 * <li>When the file type restriction changes, and the file to be uploaded fails to meet the new
				 * restriction.</li>
				 * </ul>
				 */
				fileTypeMismatch: {
					parameters: {
						/**
						 * The file that fails to meet the file type restriction specified in the
						 * <code>fileType</code> property.
						 */
						item: {type: "object"}
					}
				},
				/**
				 * This event is fired in either of the following cases:
				 * <ul>
				 * <li>When a file that is selected to be uploaded fails to meet the file name length restriction specified in the
				 * <code>maxFileNameLength</code> property.</li>
				 * <li>When the file name length restriction changes, and the file to be uploaded fails to meet the new
				 * restriction.</li>
				 * <li>Listeners can use the item parameter to remove the incomplete item that failed to meet the restriction</li>
				 * </ul>
				 */
				fileNameLengthExceeded: {
					parameters: {
						/**
						 * The file that fails to meet the file name length restriction specified in the
						 * <code>maxFileNameLength</code> property.
						 */
						item: {type: "object"}
					}
				},
				/**
				 * This event is fired in either of the following cases:
				 * <ul>
				 * <li>When a file that is selected to be uploaded fails to meet the file size restriction specified in the
				 * <code>maxFileSize</code> property.</li>
				 * <li>When the file size restriction changes, and the file to be uploaded fails to meet the new
				 * restriction.</li>
				 * <li>Listeners can use the item parameter to remove the incomplete item that failed to meet the restriction</li>
				 * </ul>
				 */
				fileSizeExceeded: {
					parameters: {
						/**
						 * The file that fails to meet the file size restriction specified in the
						 * <code>maxFileSize</code> property.
						 */
						item: {type: "object"}
					}
				},
				/**
				 * This event is fired in either of the following cases:
				 * <ul>
				 * <li>When a file that is selected to be uploaded fails to meet the media type restriction specified in the
				 * <code>mediaTypes</code> property.</li>
				 * <li>When the media type restriction changes, and the file to be uploaded fails to meet the new
				 * restriction.</li>
				 * </ul>
				 */
				mediaTypeMismatch: {
					parameters: {
						/**
						 * The file that fails to meet the media type restriction specified in the
						 * <code>mediaTypes</code> property.
						 */
						item: {type: "object"}
					}
				},
				/**
				 * This event is fired when a file that is selected to be uploaded and just before initiating the file upload process
				 * Use this event to set additional info dynamically specific for each item before upload process is initiated
				 */
				beforeInitiatingItemUpload: {
					parameters: {
						/**
						 * Items in ready state for upload process
						 */
						item: {type: "sap.m.upload.UploadSetTableItem"}
					}
				},
				/**
				 * This event is fired when the user starts dragging an uploaded item.
				 * @event
				 * @param {sap.ui.base.Event} oControlEvent
				 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
				 * @param {object} oControlEvent.getParameters
				 * @param {sap.ui.core.Element} oControlEvent.getParameters.target The target element that will be dragged
				 * @param {sap.ui.core.dnd.DragSession} oControlEvent.getParameters.dragSession The UI5 <code>dragSession</code> object that exists only during drag and drop
				 * @param {Event} oControlEvent.getParameters.browserEvent The underlying browser event
				 * @public
				 * @since 1.99
				 */
				itemDragStart: {
				},
				/**
				 * This event is fired when an uploaded item is dropped on the new list position.
				 * @event
				 * @param {sap.ui.base.Event} oControlEvent
				 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
				 * @param {object} oControlEvent.getParameters
				 * @param {sap.ui.core.dnd.DragSession} oControlEvent.getParameters.dragSession The UI5 <code>dragSession</code> object that exists only during drag and drop
				 * @param {sap.ui.core.Element} oControlEvent.getParameters.draggedControl The element being dragged
				 * @param {sap.ui.core.Element} oControlEvent.getParameters.droppedControl The element being dropped
				 * @param {sap.ui.core.dnd.RelativeDropPosition} oControlEvent.getParameters.dropPosition The calculated position of the drop action relative to the <code>droppedControl</code>.
				 * @param {Event} oControlEvent.getParameters.browserEvent The underlying browser event
				 * @public
				 * @since 1.99
				 */
				itemDrop: {
				}
			}
		},
		renderer: UploadSetTableRenderer
	});

	var UploadState = Library.UploadState;

	/* ================== */
	/* Lifecycle handling */
	/* ================== */

    UploadSetTable.prototype.init = function () {
        Table.prototype.init.call(this);
		this._setDragDropConfig();
        this._filesTobeUploaded = [];
		this._filePreviewDialogControl = null;
    };

	UploadSetTable.prototype.onBeforeRendering = function() {
		Table.prototype.onBeforeRendering.call(this);
		this._setIllustratedMessage();
	};

	UploadSetTable.prototype.onAfterRendering = function() {
		Table.prototype.onAfterRendering.call(this);
	};

	UploadSetTable.prototype.exit = function () {
		Table.prototype.exit.call(this);
		if (this._oToolbar) {
			this._oToolbar.destroy();
			this._oToolbar = null;
		}
		if (this._oFileUploader) {
			this._oFileUploader.destroy();
			this._oFileUploader = null;
		}
		if (this._illustratedMessage) {
			this._illustratedMessage.destroy();
			this._illustratedMessage = null;
		}
	};

    /* ===================== */
	/* Overriden API methods */
	/* ===================== */

    UploadSetTable.prototype.getHeaderToolbar = function () {
		if (!this._oToolbar) {
			this._oToolbar = this.getAggregation("headerToolbar");
			if (!this._oToolbar) {
				this._oToolbar = new OverFlowToolbar(this.getId() + "-toolbar", {
					content: [new ToolbarSpacer(), this.getDefaultFileUploader()]
				});
				this._iFileUploaderPH = 2;
				this.addDependent(this._oToolbar);
			} else {
				this._iFileUploaderPH = this._getFileUploaderPlaceHolderPosition(this._oToolbar);
				if (this._oToolbar && this._iFileUploaderPH > -1) {
					this._setFileUploaderInToolbar(this.getDefaultFileUploader());
				} else if (this._oToolbar) {
					// fallback position to add file uploader control if UploadSetToolbarPlaceHolder instance not found
					this._oToolbar.addContent(this.getDefaultFileUploader());
				}
			}
		}

		return this._oToolbar;
	};

	UploadSetTable.prototype.setFileTypes = function (aNewTypes) {
		var aTypes = aNewTypes || null;
		if (typeof aTypes === "string") {
			aTypes = aTypes.split(",");
		}
		aTypes = (aTypes || []).map(function (s) {
			return s ? s.toLowerCase() : "";
		});
		if (!deepEqual(this.getFileTypes(), aTypes)) {
			this.setProperty("fileTypes", aTypes, true);
			this.getDefaultFileUploader().setFileType(aTypes);
		}
		return this;
	};

	UploadSetTable.prototype.setMaxFileNameLength = function (iNewMax) {
		if (this.getMaxFileNameLength() !== iNewMax) {
			this.setProperty("maxFileNameLength", iNewMax, true);
			this.getDefaultFileUploader().setMaximumFilenameLength(iNewMax);
		}
		return this;
	};

	UploadSetTable.prototype.setMaxFileSize = function (iNewMax) {
		if (this.getMaxFileSize() !== iNewMax) {
			this.setProperty("maxFileSize", iNewMax, true);
			this.getDefaultFileUploader().setMaximumFileSize(iNewMax);
		}
		return this;
	};

	UploadSetTable.prototype.setMediaTypes = function (aNewTypes) {
		var aTypes = aNewTypes || null;
		if (typeof aTypes === "string") {
			aTypes = aTypes.split(",");
		}
		aTypes = (aTypes || []).map(function (s) {
			return s ? s.toLowerCase() : "";
		});
		if (!deepEqual(this.getMediaTypes(), aTypes)) {
			this.setProperty("mediaTypes", aTypes, true);
			this.getDefaultFileUploader().setMimeType(aTypes);
		}
		return this;
	};

	UploadSetTable.prototype.setUploadButtonInvisible = function (bUploadButtonInvisible) {
		if (bUploadButtonInvisible !== this.getUploadButtonInvisible()) {
			this._setFileUploaderVisibility(bUploadButtonInvisible);
			this.setProperty("uploadButtonInvisible", bUploadButtonInvisible, true);
		}
		return this;
	};

	UploadSetTable.prototype.setMultiple = function (bMultiple) {
		if (this.getMultiple() !== bMultiple) {
			this.setProperty("multiple", bMultiple);
			this.getDefaultFileUploader().setMultiple(bMultiple);
		}
		return this;
	};

	UploadSetTable.prototype.setUploadEnabled = function (bEnable) {
		if (bEnable !== this.getUploadEnabled()) {
			this.getDefaultFileUploader().setEnabled(bEnable);
			this.setProperty("uploadEnabled", bEnable, false);
		}
		return this;
	};

	/* ============== */
	/* Public methods */
	/* ============== */

	/**
	 * Returns an instance of the default <code>sap.ui.unified.FileUploader</code> used for adding files using
	 * the operating system's open file dialog, so that it can be customized, for example made invisible or assigned a different icon.
	 * @return {sap.ui.unified.FileUploader} Instance of the default <code>sap.ui.unified.FileUploader</code>.
	 * @public
	 */
    UploadSetTable.prototype.getDefaultFileUploader = function () {
		var sTooltip = "Upload";
		if (!this._oFileUploader) {
			this._oFileUploader = new FileUploader(this.getId() + "-uploader", {
				buttonOnly: true,
				buttonText: sTooltip,
				tooltip: sTooltip,
				iconOnly: false,
				enabled: this.getUploadEnabled(),
				icon: "",
				iconFirst: false,
				style: "Transparent",
				name: "uploadSetTableFileUploader",
				sameFilenameAllowed: true,
				fileType: this.getFileTypes(),
				mimeType: this.getMediaTypes(),
				maximumFilenameLength: this.getMaxFileNameLength(),
				maximumFileSize: this.getMaxFileSize(),
                multiple: this.getMultiple(),
				useMultipart: false,
				sendXHR: true,
				change: [this._onFileUploaderChange, this],
                typeMissmatch: [this._fireFileTypeMismatch, this],
				fileSizeExceed: [this._fireFileSizeExceed, this],
				filenameLengthExceed: [this._fireFilenameLengthExceed, this],
				visible: true
			});
		}

		return this._oFileUploader;
	};

	/**
	 * Returns sap icon based on mediaType and fileName passed
	 * @param {string} mediaType The list items the selection state is to be set for
	 * @param {string} fileName The new selection state
	 * @public
	 * @returns {string} sap icon.
	 */
	UploadSetTable.getIconForFileType = function (mediaType, fileName) {
        return UploadSetTableItem._getIconByMimeType(mediaType, fileName);
    };

	/**
	 * Returns sap icon based on mediaType and fileName passed
	 * @param {UploadSetTableItem[]} aItemsToDownload The list items the selection state is to be set for
	 * @param {boolean} bAskForLocation Whether to ask for a location where to download the file or not.
	 * @public
	 */
	UploadSetTable.prototype.downloadItems = function (aItemsToDownload) {
        if (aItemsToDownload && aItemsToDownload.length) {
			aItemsToDownload.forEach(function(oItem){
				// Check if items are instances of "sap.m.UploadSetTableItem"
				var isUploadSetTableItemInstance = oItem && oItem instanceof UploadSetTableItem ? true : false;
				var oParent = oItem && oItem.getParent ? oItem.getParent() : null;
				// Download files individually
				if (isUploadSetTableItemInstance && oParent === this) {
					this._getActiveUploader().download(oItem, [], true);
				} else {
					Log.warning("Download cannot proceed without a parent association.");
				}
			}.bind(this));
		}
    };

	/**
	 * Attaches all necessary handlers to the given uploader instance, so that the progress and status of the upload can be
	 * displayed and monitored.
	 * This is necessary in case when custom uploader is used.
	 * @param {sap.m.upload.UploaderTableItem} oUploader Instance of <code>sap.m.upload.UploaderTableItem</code> to which the default request handlers are attached.
	 * @public
	 */
	UploadSetTable.prototype.registerUploaderEvents = function (oUploader) {
		oUploader.attachUploadStarted(this._onUploadStarted.bind(this));
		oUploader.attachUploadCompleted(this._onUploadCompleted.bind(this));
	};

	/**
	 * Invokes fileselection handler and return the selected files through the callback function passed (selectedItemsCallback)
	 * @param {function} fnSelectedItemsCallback Callback funtion which is invoked and returned with selected items from the fileselectionhandler
	 * @public
	 */
	UploadSetTable.prototype.fileSelectionHandler = function(fnSelectedItemsCallback) {
		if (!(typeof fnSelectedItemsCallback === "function")) {
			Log.warning("Invalid Callback function passed.");
			return;
		}
		this._fnSelectedItemsCallback = fnSelectedItemsCallback;
		var oUploaderInstance = this.getDefaultFileUploader();
		if (oUploaderInstance && oUploaderInstance.oFileUpload && oUploaderInstance.oFileUpload.click) {
			oUploaderInstance.oFileUpload.click();
		}
	};

	/**
	 * Uploads each item passed by validting the pre conditions set for file and instant upload configured.
	 * @param {sap.m.upload.UploadSetTableItem[]} aItemTobeUploaded Array of items to be uploaded individually
	 * @public
	 */
	UploadSetTable.prototype.uploadItems = function(aItemTobeUploaded) {

		if (!this.getUploadEnabled()) {
			Log.warning("Upload is currently disabled for this upload set with Table.");
			return;
		}

		if (!Array.isArray(aItemTobeUploaded)) {
			return;
		}

		// only items of instance UploadSetTableItem are accepted.
		aItemTobeUploaded = aItemTobeUploaded.filter(function(item) {
			return item instanceof UploadSetTableItem;
		});

		aItemTobeUploaded.forEach(function(oItem) {
			if (this.getInstantUpload()) {
				this._uploadItemIfGoodToGo(oItem);
			}
		}.bind(this));
	};

	/**
	 * API to determine the Unit for file size in KB/MB/GB accepts file size
	 * @param {int} iFileSize fileSize to determine units
	 * @public
	 * @returns {sFileSizeWithUnit} file size in KB/MB/GB default unit is KB
	 */
	UploadSetTable.getFileSizeWithUnits = function(iFileSize) {
		var iKilobyte = 1024;
        var iMegabyte = iKilobyte * 1024;
        var iGigabyte = iMegabyte * 1024;
		if (typeof iFileSize === "number") {
			if (iFileSize < iMegabyte) {
				return (iFileSize / iKilobyte).toFixed(2) + " KB";
			  }  else if (iFileSize < iGigabyte) {
				return (iFileSize / iMegabyte).toFixed(2) + " MB";
			  } else {
				return (iFileSize / iGigabyte).toFixed(2) + " GB";
			  }
		}
		return iFileSize;
	};

	/**
	 * API to upload File via URL
	 * @param {string} sName file name to be set for the file to be uploaded.
	 * @param {sap.ui.core.Item[]} aHeaders addition headers to be set
	 * @public
	 */
	UploadSetTable.prototype.uploadItemViaUrl = function (sName, aHeaders) {
		var oFileObject = new File([new Blob([])], sName);
		// resetting custom callback
		this._fnSelectedItemsCallback = null;
		this._processSelectedFileObjects([oFileObject], aHeaders);
	};

	/**
	 * API to upload Item without file
	 * @param {sap.ui.core.Item[]} aHeaders addition headers to be set
	 * @public
	 */
	UploadSetTable.prototype.uploadItemWithoutFile = function (aHeaders) {
		var oFileObject = new File([new Blob([])], '-');
		this._fnSelectedItemsCallback = null;
		this._processSelectedFileObjects([oFileObject], aHeaders);
	};

	/* ============== */
	/* Private methods */
	/* ============== */

    UploadSetTable.prototype._setFileUploaderInToolbar = function(fileUploader) {
        this._oToolbar.getContent()[this._iFileUploaderPH].setVisible(false);
		this._oToolbar.insertContent(fileUploader, this._iFileUploaderPH);
	};

    UploadSetTable.prototype._getFileUploaderPlaceHolderPosition = function(toolbar) {
        for (var i = 0; i < toolbar.getContent().length; i++) {
            if (toolbar.getContent()[i] instanceof UploadSetToolbarPlaceholder) {
                return i;
			}
		}
		return -1;
	};

    UploadSetTable.prototype._onFileUploaderChange = function (oEvent) {
        var oFiles = oEvent.getParameter("files");
		if (oFiles && oFiles.length) {
			this._processSelectedFileObjects(oFiles);
		} else {
			// resetting the callback funtion if cancel clicked
			this._fnSelectedItemsCallback = null;
		}
    };

    UploadSetTable.prototype._processSelectedFileObjects = function (oFiles, aHeaders) {
        var aFiles = [];

		// Need to explicitly copy the file list, FileUploader deliberately resets its form completely
		// along with 'files' parameter when it (mistakenly) thinks that all is done.
		for (var i = 0; i < oFiles.length; i++) {
			aFiles.push(oFiles[i]);
		}

		var selectedFiles = [];
		aFiles.forEach(function (oFile) {
			var oItem = new UploadSetTableItem({
				uploadState: UploadState.Ready
			});
			oItem._setFileObject(oFile);
			oItem.setFileName(oFile.name);
			selectedFiles.push(oItem);

			if (aHeaders && aHeaders.length) {
				aHeaders.forEach(function(oHeader){
					oItem.addHeaderField(oHeader);
				});
			}

			this.fireBeforeInitiatingItemUpload({item: oItem});
			if (this.getInstantUpload() && !this._fnSelectedItemsCallback) {
				this._uploadItemIfGoodToGo(oItem);
			}
		}.bind(this));

		// fire the fncallback stored set through fileSelectionHandler invocation
		if (this._fnSelectedItemsCallback) {
			this._fnSelectedItemsCallback({selectedItems: selectedFiles});
			this._fnSelectedItemsCallback = null;
		}

    };

    UploadSetTable.prototype._fireFileTypeMismatch = function (oItem) {
        var aMediaTypes = this.getMediaTypes();
		var aFileTypes = this.getFileTypes();

		var sFileType = oItem.getParameter("fileType");
		var sMediaType = oItem.getParameter("mimeType");

		var bMediaRestricted = (!!aMediaTypes && (aMediaTypes.length > 0) && !!sMediaType && aMediaTypes.indexOf(sMediaType) === -1);
		var bFileRestricted = (!!aFileTypes && (aFileTypes.length > 0) && !!sFileType && aFileTypes.indexOf(sFileType) === -1);

        var oMismatchItem = {
            fileType: sFileType,
            mimeType: sMediaType
        };

		if (bMediaRestricted){
			this.fireMediaTypeMismatch({item: oMismatchItem});
		} else if (bFileRestricted){
			this.fireFileTypeMismatch({item: oMismatchItem});
		}
    };

    UploadSetTable.prototype._fireFilenameLengthExceed = function (oItem) {
        this.fireFileNameLengthExceeded({item: oItem});
    };

    UploadSetTable.prototype._fireFileSizeExceed = function (oItem) {
        this.fireFileSizeExceeded({item: oItem});
    };

	UploadSetTable.prototype._onUploadStarted = function (oEvent) {
		var oItem = oEvent.getParameter("item");
		oItem.setUploadState(UploadState.Uploading);
	};

	UploadSetTable.prototype._onUploadCompleted = function (oEvent) {
		var oItem = oEvent.getParameter("item"),
			oResponseXHRParams = oEvent.getParameter("responseXHR"),
			sResponse = null;

		if (oResponseXHRParams.responseXML) {
			sResponse = oResponseXHRParams.responseXML.documentElement.textContent;
		}
		var oXhrParams = {
			"item": oItem,
			"response": oResponseXHRParams.response,
			"responseXML": sResponse,
			"responseText": oResponseXHRParams.responseText,
			"readyState": oResponseXHRParams.readyState,
			"status": oResponseXHRParams.status,
			"headers": oResponseXHRParams.headers
		};
		oItem.setUploadState(UploadState.Complete);
		this.fireUploadCompleted(oXhrParams);
	};

	UploadSetTable.prototype._uploadItemIfGoodToGo = function (oItem) {
		if (oItem.getUploadState() === UploadState.Ready && !oItem._isRestricted()) {
			if (this.fireBeforeUploadStarts({item: oItem})) {
				var oHeaderFields = oItem.getHeaderFields().length ? oItem.getHeaderFields() : this.getHeaderFields();
				this._getActiveUploader().uploadItem(oItem, oHeaderFields);
			}
		}
	};

	UploadSetTable.prototype._getActiveUploader = function () {
		return this.getUploader() || this._getImplicitUploader();
	};

	UploadSetTable.prototype._getImplicitUploader = function () {
		if (!this._oUploader) {
			this._oUploader = new Uploader({
				httpRequestMethod : this.getHttpRequestMethod()
			});
			this._oUploader.setUploadUrl(this.getUploadUrl());
			this.registerUploaderEvents(this._oUploader);
			this.addDependent(this._oUploader);
		}

		return this._oUploader;
	};

	UploadSetTable.prototype._setIllustratedMessage = function () {
		if (!this._illustratedMessage) {
			this._illustratedMessage = new IllustratedMessage({
				illustrationType: IllustratedMessageType.UploadCollection,
				illustrationSize: IllustratedMessageSize.Spot,
				title: this.getNoDataText() ? this.getNoDataText() : "No Data Available",
				description: this.getNoDataDescription() ? this.getNoDataDescription() : "Drag and Drop files here to upload"
			});
		}

		this.setAggregation("_noColumnsMessage", this._illustratedMessage);
		this.setAggregation("noData", this._illustratedMessage);
	};

	UploadSetTable.prototype._setFileUploaderVisibility = function (bInvisible) {
		if (this._oFileUploader) {
			var buttonRef = this._oFileUploader.oBrowse && this._oFileUploader.oBrowse ? this._oFileUploader : null;
			if (buttonRef) {
				if (bInvisible) {
					buttonRef.addStyleClass("sapMUSTFileUploaderVisibility");
				} else {
					buttonRef.removeStyleClass("sapMUSTFileUploaderVisibility");
				}
			}
		}
	};

	UploadSetTable.prototype._setDragDropConfig = function () {
		var oDragDropConfig = new DragDropInfo({
			sourceAggregation: "items",
			targetAggregation: "items",
			dragStart: [this._onDragStartItem, this],
			drop: [this._onDropItem, this]
		});
		var oDropConfig = new DropInfo({
			targetAggregation: "",
			dropEffect:"Move",
			dropPosition:"OnOrBetween",
			dragEnter: [this._onDragEnterFile, this],
			drop: [this._onDropFile, this]
		});
		this.addDragDropConfig(oDragDropConfig);
		this.addDragDropConfig(oDropConfig);
	};

	UploadSetTable.prototype._onDragStartItem = function (oEvent) {
		this.fireItemDragStart(oEvent);
	};

	UploadSetTable.prototype._onDropItem = function (oEvent) {
		this.fireItemDrop(oEvent);
	};

	UploadSetTable.prototype._onDragEnterFile = function (oEvent) {
		var oDragSession = oEvent.getParameter("dragSession");
		var oDraggedControl = oDragSession.getDragControl();
		this._oDragIndicator = true;
		if (oDraggedControl) {
			oEvent.preventDefault();
		}
	};

	// Drag and drop of files implmentation subject to change depending on the thr UX feedback for folder upload scenarios and warning message display scenarios
	UploadSetTable.prototype._onDropFile = function (oEvent) {
		this._oDragIndicator = false;
		oEvent.preventDefault();
		if (this.getUploadEnabled()) {
			var aItems = oEvent.getParameter("browserEvent").dataTransfer.files;

			// handlding multiple property drag & drop scenarios
			if (aItems && aItems.length && aItems.length > 1 && !this.getMultiple()) {
				// logging the message currently will display message box with UX improvements feedback.
				Log.warning("Multiple files upload is retsricted for this multiple property set");
				return;
			}


			if (aItems && aItems.length) {
				var oFileUploaderInstance = this.getDefaultFileUploader();
						if (oFileUploaderInstance && oFileUploaderInstance._areFilesAllowed && oFileUploaderInstance._areFilesAllowed(aItems)) {
							var aFiles = [];

							// Need to explicitly copy the file list, FileUploader deliberately resets its form completely
							// along with 'files' parameter when it (mistakenly) thinks that all is done.
							for (var i = 0; i < aItems.length; i++) {
								aFiles.push(aItems[i]);
							}

							var selectedFiles = [];
							aFiles.forEach(function (oFile) {
								var oItem = new UploadSetTableItem({
									uploadState: UploadState.Ready
								});
								oItem._setFileObject(oFile);
								oItem.setFileName(oFile.name);
								selectedFiles.push(oItem);
								/* fire the beforeInitiatingUpload to support use case for non instant uploads,
								where additional item properties can be set by the consumer of the control */
								this.fireBeforeInitiatingItemUpload({item: oItem});
								if (this.getInstantUpload() && !this.getCustomDropFilesHandler()) {
									this._uploadItemIfGoodToGo(oItem);
								}
							}.bind(this));

							// fire the fncallback stored set through customDropFileHandler invocation
							// this would be use for the consumers to get the files dropped into the area and to have custom inputs taken for each file dropped.
							if (this.getCustomDropFilesHandler()) {
								this.getCustomDropFilesHandler()({selectedItems: selectedFiles});
							}
						}
			}
		}
	};

	/**
	* Opens preview of the item pressed.
	* @param {sap.m.upload.UploadSetTableItem} oItem item to be previewed.
	* @private
	*/
	UploadSetTable.prototype._openFilePreview = function (oItem) {
		var aitems = this.getPreviewDialogAdditionalFooterButtons();
		if (!this._filePreviewDialogControl) {
			this._filePreviewDialogControl = new FilePreviewDialog({
				previewItem: oItem,
				items: this.getItems(),
				additionalFooterButtons: this.getPreviewDialogAdditionalFooterButtons()
			});
			this.addDependent(this._filePreviewDialogControl);
			this._filePreviewDialogControl.open();
		} else {
			this._filePreviewDialogControl.setPreviewItem(oItem);
			this._filePreviewDialogControl.setItems(this.getItems());
			aitems.forEach((item) => this._filePreviewDialogControl.insertAddDiitionalFooterButton(item));
			this._filePreviewDialogControl.open();
		}
	};

    return UploadSetTable;
});