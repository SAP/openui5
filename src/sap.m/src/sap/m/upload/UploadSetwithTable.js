/*!
 * ${copyright}
 */

// Provides control sap.m.upload.UploadSetwithTable.
sap.ui.define([
	"sap/m/Table",
	"sap/m/ToolbarSpacer",
	"sap/m/upload/UploadSetwithTableRenderer",
	"sap/ui/unified/FileUploader",
	"sap/m/upload/UploadSetToolbarPlaceholder",
	"sap/m/upload/UploaderHttpRequestMethod",
	"sap/m/OverflowToolbar",
	"sap/m/upload/UploadSetwithTableItem",
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
	"sap/m/upload/FilePreviewDialog",
	"sap/ui/base/Event",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/MessageBox",
	"sap/m/Button",
	"sap/ui/base/Event",
	"sap/ui/core/Core",
	"sap/ui/core/Element"
], function (Table, ToolbarSpacer, UploadSetwithTableRenderer, FileUploader,
    UploadSetToolbarPlaceholder, UploaderHttpRequestMethod, OverFlowToolbar, UploadSetwithTableItem, deepEqual, Log, Library, IllustratedMessageType,
	IllustratedMessage, IllustratedMessageSize, Uploader, DragDropInfo, DropInfo, DragInfo, FilePreviewDialog, Event, Dialog, Label, Input, MessageBox, Button, EventBase, Core, Element) {
    "use strict";

	/**
	 * Constructor for a new UploadSetwithTable.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given.
	 * @param {object} [mSettings] Initial settings for the new control.
	 * @class This control allows you to upload one or more files from your device, such as desktop, tablet or phone, and attach them to your application in a responsive tabular manner.<br>
	 * This control builds on the {@link sap.m.upload.UploadSet UploadSet} control. Provides flexibility to tailor the design of the table including columns, cells and the content to suit specific requirements.
	 * @extends sap.m.Table
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @experimental since 1.120
	 * @since 1.120
	 * @version ${version}
	 * @alias sap.m.upload.UploadSetwithTable
	 */
	var UploadSetwithTable = Table.extend("sap.m.upload.UploadSetwithTable", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * File types that are allowed to be uploaded.
				 * <br>If this property is not set, any file can be uploaded.
				 */
				fileTypes: {type: "string[]", defaultValue: null},
				/**
				 * Defined maximum length for a name of files that are to be uploaded.
				 * <br>If set to <code>null</code> or <code>0</code>, any file can be uploaded regardless length of its name.
				 */
				maxFileNameLength: {type: "int", defaultValue: null},
				/**
				 * Defined size limit in megabytes for files that are to be uploaded.
				 * <br>If set to <code>null</code> or <code>0</code>, files of any size can be uploaded.
				 */
				maxFileSize: {type: "float", defaultValue: null},
				/**
				 * Media types of files that are allowed to be uploaded.
				 * <br>If this property is not set, any file can be uploaded.
				 */
				mediaTypes: {type: "string[]", defaultValue: null},
				/**
				 * Custom text can be defined for the 'No data' text label. Customisation of text can be done for the empty state of the control.
				 */
				noDataText: {type: "string", defaultValue: "No documents available" },
				/**
				 * Custom text can be defined for the 'No data' text description. Customisation of text can be done for the empty state of the control.
				 */
				noDataDescription: {type: "string", defaultValue: "Drag and drop files here to upload" },
				/**
				 * Url where the uploaded files are stored.
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
				 * If set to true, the button used for uploading files becomes invisible.
				 */
				uploadButtonInvisible: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Defines whether the upload action is allowed.
				 */
				uploadEnabled: {type: "boolean", defaultValue: true},
				/** Callback function to perform additional validations or configurations for the item queued up for upload and to finally trigger the upload.
				 * @callback sap.m.upload.UploadSetwithTable.itemValidationHandler
				 * @param {sap.m.upload.UploadSetwithTable.ItemInfo} oItemInfo The info of the item queued for upload.
				 * @returns {Promise<sap.m.upload.UploadSetwithTableItem>} oPromise, once resolved the UploadSetWithTable control initiates the upload.
				 * @public
				**/

				/**
				 * @typedef {object} sap.m.upload.UploadSetwithTable.ItemInfo
				 * @description Item info object sent as paramter to {@link sap.m.upload.UploadSetwithTable.itemValidationHandler itemValidationHandler callback}
				 * @property {sap.m.upload.UploadSetwithTableItem} oItem Current item queued for upload.
				 * @property {number} iTotalItemsForUpload Total count of items queued for upload.
				 * @property {sap.m.upload.UploadSetwithTable} oSource Source on which the callback was invoked.
				 * @public
				**/

				/**
				 * Defines a {@link sap.m.upload.UploadSetwithTable.itemValidationHandler callback function} that is invoked when each UploadSetwithTableItem is queued up for upload.
				 * This callback is invoked with {@link sap.m.upload.UploadSetwithTable.ItemInfo parameters} and the callback is expected to return a promise to the control. Once the promise is resolved, the control initiates the upload process.
				 * Configure this property only when any additional configuration or validations are to be performed before the upload of each item.
				 * The upload process is triggered manually by resolving the promise returned to the control.
				**/
				itemValidationHandler: {type: "function", defaultValue: null},
				/**
				 * Lets the user upload entire files from directories and sub directories.
				*/
				 directory: {type: "boolean", group: "Behavior", defaultValue: false},
				/**
				 * Determines which illustration type is displayed when the control holds no data.
				 */
				noDataIllustrationType: {type: "sap.m.IllustratedMessageType", group: "Appearance", defaultValue: IllustratedMessageType.UploadCollection}
            },
            aggregations: {
				/**
				 * Defines the uploader to be used. If not specified, the default implementation is used.
				 */
				uploader: {type: "sap.m.upload.UploaderTableItem", multiple: false},
				/**
				 * Header fields to be included in the header section of an XHR request.
				 */
				headerFields: {type: "sap.ui.core.Item", multiple: true, singularName: "headerField"},
				/**
				 * Additional buttons can be added to the footer of file preview dialog
				 */
				additionalFooterButtons: {type: "sap.m.Button", multiple: true}
			},
			associations: {
				/**
				 * Dialog with a carousel to preview files uploaded.
				 * <br>If it is not defined, the control creates and uses the instance of {@link sap.m.upload.FilePreviewDialog FilePreviewDialog}.
				 */
				previewDialog: {type: "sap.m.upload.FilePreviewDialog", multiple: false}
			},
			events: {
				/**
				 * The event is triggered when the file name is changed.
				 */
				itemRenamed: {
					parameters: {
						/**
						 * The renamed UI element is of UploadSetwithTableItem type.
						 */
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
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
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
					},
					allowPreventDefault: true
				},
				/**
				 * This event is fired right after the upload process is finished.
				 * <br>Based on the backend response of the application, listeners can use the parameters to determine if the upload was successful or if it failed.
				 */
				uploadCompleted: {
					parameters: {
						/**
						 * The file whose upload has just been completed.
						 */
						item: {type: "sap.m.upload.UploadSetwithTableItem"},
						/**
						 * Response message that comes from the server.
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
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
					}
				},
				/**
				 * This event is fired in either of the following cases:
				 * <ul>
				 * <li>When a file that is selected to be uploaded fails to meet the file name length restriction specified in the
				 * <code>maxFileNameLength</code> property.</li>
				 * <li>When the file name length restriction changes, and the file to be uploaded fails to meet the new
				 * restriction.</li>
				 * </ul>
				 */
				fileNameLengthExceeded: {
					parameters: {
						/**
						 * The file that fails to meet the file name length restriction specified in the
						 * <code>maxFileNameLength</code> property.
						 */
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
					}
				},
				/**
				 * This event is fired in either of the following cases:
				 * <ul>
				 * <li>When a file that is selected to be uploaded fails to meet the file size restriction specified in the
				 * <code>maxFileSize</code> property.</li>
				 * <li>When the file size restriction changes, and the file to be uploaded fails to meet the new
				 * restriction.</li>
				 * </ul>
				 */
				fileSizeExceeded: {
					parameters: {
						/**
						 * The file that fails to meet the file size restriction specified in the
						 * <code>maxFileSize</code> property.
						 */
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
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
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
					}
				},
				/**
				 * This event is fired just before initiating the file upload process when a file is selected to be uploaded.
				 * Use this event to set additional info dynamically, specific for each item before upload process is initiated.
				 */
				beforeInitiatingItemUpload: {
					parameters: {
						/**
						 * Items in ready state for upload process
						 */
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
					}
				},
				/**
				 * This event is fired when the user starts dragging an uploaded item.
				 * @event
				 * @param {sap.ui.base.Event} oControlEvent
				 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
				 * @param {object} oControlEvent.getParameters
				 * @param {sap.ui.core.Element} oControlEvent.getParameters.target The target element that is dragged
				 * @param {sap.ui.core.dnd.DragSession} oControlEvent.getParameters.dragSession The UI5 <code>dragSession</code> object that exists only during drag and drop
				 * @param {Event} oControlEvent.getParameters.browserEvent The underlying browser event
				 * @public
				 */
				itemDragStart: {
				},
				/**
				 * This event is fired when an uploaded item is dropped on the new table row position.
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
				 */
				itemDrop: {
				}
			}
		},
		renderer: UploadSetwithTableRenderer
	});

	var UploadState = Library.UploadState;

	/* ================== */
	/* Lifecycle handling */
	/* ================== */

    UploadSetwithTable.prototype.init = function () {
        Table.prototype.init.call(this);
		this._setDragDropConfig();
        this._filesTobeUploaded = [];
		this._filePreviewDialogControl = null;
		this._oRb = Core.getLibraryResourceBundle("sap.m");
    };

	UploadSetwithTable.prototype.onBeforeRendering = function() {
		Table.prototype.onBeforeRendering.call(this);
		this._setIllustratedMessage();
	};

	UploadSetwithTable.prototype.onAfterRendering = function() {
		Table.prototype.onAfterRendering.call(this);
	};

	UploadSetwithTable.prototype.exit = function () {
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

    UploadSetwithTable.prototype.getHeaderToolbar = function () {
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

	UploadSetwithTable.prototype.setFileTypes = function (aNewTypes) {
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

	UploadSetwithTable.prototype.setMaxFileNameLength = function (iNewMax) {
		if (this.getMaxFileNameLength() !== iNewMax) {
			this.setProperty("maxFileNameLength", iNewMax, true);
			this.getDefaultFileUploader().setMaximumFilenameLength(iNewMax);
		}
		return this;
	};

	UploadSetwithTable.prototype.setMaxFileSize = function (iNewMax) {
		if (this.getMaxFileSize() !== iNewMax) {
			this.setProperty("maxFileSize", iNewMax, true);
			this.getDefaultFileUploader().setMaximumFileSize(iNewMax);
		}
		return this;
	};

	UploadSetwithTable.prototype.setMediaTypes = function (aNewTypes) {
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

	UploadSetwithTable.prototype.setUploadButtonInvisible = function (bUploadButtonInvisible) {
		if (bUploadButtonInvisible !== this.getUploadButtonInvisible()) {
			var bVisible = !bUploadButtonInvisible;
			this.getDefaultFileUploader().setVisible(bVisible);
			this.setProperty("uploadButtonInvisible", bUploadButtonInvisible, true);
		}
		return this;
	};

	UploadSetwithTable.prototype.setMultiple = function (bMultiple) {
		if (this.getMultiple() !== bMultiple) {
			this.setProperty("multiple", bMultiple);
			this.getDefaultFileUploader().setMultiple(bMultiple);
		}
		return this;
	};

	UploadSetwithTable.prototype.setUploadEnabled = function (bEnable) {
		if (bEnable !== this.getUploadEnabled()) {
			this.getDefaultFileUploader().setEnabled(bEnable);
			this.setProperty("uploadEnabled", bEnable, false);
		}
		return this;
	};

	UploadSetwithTable.prototype.setDirectory = function (bDirectory) {
		if (this.getDirectory() !== bDirectory) {
			this.setProperty("directory", bDirectory);
			this.getDefaultFileUploader().setDirectory(bDirectory);
			if (bDirectory) {
				this.setProperty("multiple", false); // disable multiple files selection when directory selection is enabled.
			}
		}
		return this;
	};

	/* ============== */
	/* Public methods */
	/* ============== */

	/**
	 * Returns an instance of the default <code>sap.ui.unified.FileUploader</code> icon/button, used for adding files
	 * from the open file dialog of the operating system. It can be customized, for example made invisible or assigned a different icon.
	 * @return {sap.ui.unified.FileUploader} Instance of the default <code>sap.ui.unified.FileUploader</code>.
	 * @public
	 */
    UploadSetwithTable.prototype.getDefaultFileUploader = function () {
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
				name: "UploadSetwithTableFileUploader",
				sameFilenameAllowed: true,
				fileType: this.getFileTypes(),
				mimeType: this.getMediaTypes(),
				maximumFilenameLength: this.getMaxFileNameLength(),
				maximumFileSize: this.getMaxFileSize(),
                multiple: this.getDirectory() ? false : this.getMultiple(),
				useMultipart: false,
				sendXHR: true,
				change: [this._onFileUploaderChange, this],
                typeMissmatch: [this._fireFileTypeMismatch, this],
				fileSizeExceed: [this._fireFileSizeExceed, this],
				filenameLengthExceed: [this._fireFilenameLengthExceed, this],
				visible: true,
				directory: this.getDirectory()
			});
		}

		return this._oFileUploader;
	};

	/**
	 * Returns sap icon based on the passed mediaType and filename
	 * @param {string} mediaType The media type of the selected file
	 * @param {string} fileName The name of the selected file
	 * @public
	 * @returns {string} sap icon.
	 */
	UploadSetwithTable.getIconForFileType = function (mediaType, fileName) {
        return UploadSetwithTableItem._getIconByMimeType(mediaType, fileName);
    };

	/**
	 * Attaches all necessary handlers to the given uploader instance, so that the progress and status of the upload can be
	 * displayed and monitored.
	 * This is necessary in case when custom uploader is used.
	 * @param {sap.m.upload.UploaderTableItem} oUploader Instance of <code>sap.m.upload.UploaderTableItem</code> to which the default request handlers are attached.
	 * @public
	 */
	UploadSetwithTable.prototype.registerUploaderEvents = function (oUploader) {
		oUploader.attachUploadStarted(this._onUploadStarted.bind(this));
		oUploader.attachUploadCompleted(this._onUploadCompleted.bind(this));
	};

	/**
	 * Invokes native files selection handler.
	 * @public
	 */
	UploadSetwithTable.prototype.fileSelectionHandler = function() {
		var oUploaderInstance = this.getDefaultFileUploader();
		if (oUploaderInstance && oUploaderInstance.oFileUpload && oUploaderInstance.oFileUpload.click) {
			oUploaderInstance.oFileUpload.click();
		}
	};

	/**
	 * API to determine the unit for file size in KB/MB/GB.
	 * API recommended for file size formatting purpose.
	 * @param {int} iFileSize fileSize to determine units
	 * @public
	 * @returns {string} sFileSizeWithUnit file size in KB/MB/GB default unit is KB
	 */
	UploadSetwithTable.getFileSizeWithUnits = function(iFileSize) {
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
	 * API to upload file using URL
	 * @param {string} sName file name to be set for the file that is to be uploaded.
	 * @param {string} sUrl Url for the file.
	 * @param {Promise} oPromise Promise when resolved, the control initiates the upload process.
	 * @returns {UploadSetwithTableItem} oItem, UploadSetwithTableItem instance created with the file object.
	 * @public
	 */
	UploadSetwithTable.prototype.uploadItemViaUrl = function (sName, sUrl, oPromise) {
		var oFileObject = new File([new Blob([])], sName);

		var oItem = new UploadSetwithTableItem({
			uploadState: UploadState.Ready
		});
		oItem._setFileObject(oFileObject);
		oItem.setFileName(oFileObject.name);
		oItem.setUrl(sUrl);

		oPromise
		.then(() => this._initateItemUpload(oItem).bind(this))
		.catch(() => oItem.destroy()); // cancelling the upload.

		return oItem;
	};

	/**
	 * API to upload Item without file
	 * @param {Promise} oPromise Promise when resolved, control initiates the upload process.
	 * @return {UploadSetwithTableItem} oItem, UploadSetwithTableItem instance created with the file object.
	 * @public
	 */
	UploadSetwithTable.prototype.uploadItemWithoutFile = function (oPromise) {
		var oFileObject = new File([new Blob([])], '-');
		var oItem = new UploadSetwithTableItem({
			uploadState: UploadState.Ready
		});
		oItem._setFileObject(oFileObject);
		oItem.setFileName(oFileObject.name);

		oPromise
		.then(() => this._initateItemUpload(oItem))
		.catch(() => oItem.destroy()); // cancelling the upload.

		return oItem;
	};

	/**
	 * API to rename the document of an item.
	 * @param {sap.m.upload.UploadSetwithTableItem} oItem target item.
	 * @public
	 */
	UploadSetwithTable.prototype.renameItem = function (oItem) {
		if (oItem && oItem instanceof UploadSetwithTableItem) {
			const oDialog = this._getFileRenameDialog(oItem);
			oDialog.open();
		}
	};

	/* ============== */
	/* Private methods */
	/* ============== */

    UploadSetwithTable.prototype._setFileUploaderInToolbar = function(fileUploader) {
        this._oToolbar.getContent()[this._iFileUploaderPH].setVisible(false);
		this._oToolbar.insertContent(fileUploader, this._iFileUploaderPH);
	};

    UploadSetwithTable.prototype._getFileUploaderPlaceHolderPosition = function(toolbar) {
        for (var i = 0; i < toolbar.getContent().length; i++) {
            if (toolbar.getContent()[i] instanceof UploadSetToolbarPlaceholder) {
                return i;
			}
		}
		return -1;
	};

    UploadSetwithTable.prototype._onFileUploaderChange = function (oEvent) {
        var oFiles = oEvent.getParameter("files");

		if (oFiles && oFiles.length) {
			var aSelectedItems = this.getSelectedItems();
			var oSelectedItem = aSelectedItems && aSelectedItems.length == 1 ? aSelectedItems[0] : null;
			var bEmptyFileSelected = oSelectedItem ? oSelectedItem && oSelectedItem.getFileName && oSelectedItem.getFileName() === "-" : false;

			// update existing file after upload
			if (bEmptyFileSelected) {
				this._oItemToUpdate = oFiles[0];
			}
			this._processSelectedFileObjects(oFiles);
		}
    };

    UploadSetwithTable.prototype._processSelectedFileObjects = function (oFiles) {
		var aFiles = [];

		// Need to explicitly copy the file list, FileUploader deliberately resets its form completely
		// along with 'files' parameter when it (mistakenly) thinks that all is done.
		for (var i = 0; i < oFiles.length; i++) {
			aFiles.push(oFiles[i]);
		}

		aFiles.forEach((oFile) => {
			var oItem = new UploadSetwithTableItem({
				uploadState: UploadState.Ready
			});
			oItem._setFileObject(oFile);
			oItem.setFileName(oFile.name);


			if (this.getItemValidationHandler() && typeof this.getItemValidationHandler() === "function" ) {

				const oItemInfo = {
					oItem: oItem,
					iTotalItemsForUpload: aFiles.length,
					oSource: this
				};

				var oPromise = this.getItemValidationHandler()(oItemInfo);
				if (oPromise && oPromise instanceof Promise) {
					oPromise
					.then((item) => {
						if (item instanceof UploadSetwithTableItem) {
							this._initateItemUpload(item);
						}
					})
					.catch((item) => {
						// Reset variable to avoid update if upload rejected.
						if (item && this._oItemToUpdate && item instanceof UploadSetwithTableItem && item.getId() === this._oItemToUpdate.getId()) {
							this._oItemToUpdate = null;
						}
					});
				} else {
					oItem.destroy();
					// if promise is not returned to the ItemValidation hook log error and destroy the item
					Log.error("Invalid usage, missing Promise: ItemValidationHandler callback expects Promise to be returned.");
				}
			} else {
				/* if no validation handler is provided control continues with normal upload else waits for the application to manually
				trigger the upload by resolving the promise */
				this._initateItemUpload(oItem);
			}
		});
	};

	UploadSetwithTable.prototype._initateItemUpload = function(oItem) {
		this.fireBeforeInitiatingItemUpload({item: oItem});
		if (this._oItemToUpdate) {
			// Registering item to be update with selected file contents post successful upload.
			this._oItemToUpdate = oItem;
		}
		this._uploadItemIfGoodToGo(oItem);
	};

    UploadSetwithTable.prototype._fireFileTypeMismatch = function (oItem) {
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

    UploadSetwithTable.prototype._fireFilenameLengthExceed = function (oItem) {
        this.fireFileNameLengthExceeded({item: oItem});
    };

    UploadSetwithTable.prototype._fireFileSizeExceed = function (oItem) {
        this.fireFileSizeExceeded({item: oItem});
    };

	UploadSetwithTable.prototype._onUploadStarted = function (oEvent) {
		var oItem = oEvent.getParameter("item");
		oItem.setUploadState(UploadState.Uploading);
	};

	UploadSetwithTable.prototype._onUploadCompleted = function (oEvent) {
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
		if (this._oItemToUpdate) {
			this._oItemToUpdate.setFileName(oItem.getFileName());
			this._oItemToUpdate._setFileObject(oItem.getFileObject());
			this._oItemToUpdate = null;
		}
		oItem.setUploadState(UploadState.Complete);
		this.fireUploadCompleted(oXhrParams);
	};

	UploadSetwithTable.prototype._uploadItemIfGoodToGo = function (oItem) {
		if (oItem.getUploadState() === UploadState.Ready && !oItem._isRestricted()) {
			if (this.fireBeforeUploadStarts({item: oItem})) {
				const aHeaderFields = this.getHeaderFields()?.length ? this.getHeaderFields() : [];
				const aItemHeaderFields = oItem.getHeaderFields()?.length ? oItem.getHeaderFields() : [];
				const oHeaderFields = [...aHeaderFields, ...aItemHeaderFields]; //Merging headers for request.
				this._getActiveUploader().uploadItem(oItem, oHeaderFields);
			}
		}
	};

	UploadSetwithTable.prototype._getActiveUploader = function () {
		return this.getUploader() || this._getImplicitUploader();
	};

	UploadSetwithTable.prototype._getImplicitUploader = function () {
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

	UploadSetwithTable.prototype._setIllustratedMessage = function () {
		if (!this._illustratedMessage) {
			this._illustratedMessage = new IllustratedMessage({
				illustrationType: this.getNoDataIllustrationType(),
				illustrationSize: IllustratedMessageSize.Spot,
				title: this.getNoDataText() ? this.getNoDataText() : this._oRb.getText("UPLOADSET_WITH_TABLE_NO_DATA_TEXT"),
				description: this.getNoDataDescription() ? this.getNoDataDescription() : this._oRb.getText("UPLOADSET_WITH_TABLE_NO_DATA_DESCRIPTION")
			});
		}

		this.setAggregation("_noColumnsMessage", this._illustratedMessage);
		this.setAggregation("noData", this._illustratedMessage);
	};

	UploadSetwithTable.prototype._setDragDropConfig = function () {
		var oDragDropConfig = new DragDropInfo({
			sourceAggregation: "items",
			targetAggregation: "items",
			dragStart: [this._onDragStartItem, this],
			drop: [this._onDropItem, this]
		});
		var oDropConfig = new DropInfo({
			dropEffect:"Move",
			dropPosition:"OnOrBetween",
			dragEnter: [this._onDragEnterFile, this],
			drop: [this._onDropFile, this]
		});
		this.addDragDropConfig(oDragDropConfig);
		this.addDragDropConfig(oDropConfig);
	};

	UploadSetwithTable.prototype._onDragStartItem = function (oEvent) {
		this.fireItemDragStart(oEvent);
	};

	UploadSetwithTable.prototype._onDropItem = function (oEvent) {
		this.fireItemDrop(oEvent);
	};

	UploadSetwithTable.prototype._onDragEnterFile = function (oEvent) {
		var oDragSession = oEvent.getParameter("dragSession");
		var oDraggedControl = oDragSession.getDragControl();
		if (oDraggedControl) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Drag and drop of files implmentation subject to change depending on the thr UX feedback for folder upload scenarios and warning message display scenarios
	 * @param {sap.ui.base.Event} oEvent Drop Event when file is dropped on the Table.
	 * @private
	 */
	UploadSetwithTable.prototype._onDropFile = function (oEvent) {
		oEvent.preventDefault();
		if (!this.getUploadEnabled()) {
			Log.error("Upload is not enabled, to continue uploading with drag and drop of files enable property 'UploadEnabled' ");
			return;
		}
		let oItems = oEvent.getParameter("browserEvent").dataTransfer.items;
		oItems = Array.from(oItems);

		// Filtering out only webkitentries (files/folders system entries) by excluding non file / directory types.
		oItems = oItems.filter(function(item){
			return item.webkitGetAsEntry() ? true : false;
		});
		const aEntryTypes = oItems.map(function (oEntry) {
			const oWebKitEntry = oEntry.webkitGetAsEntry();
			return {
				entryType: oWebKitEntry && oWebKitEntry.isFile ? 'File' : 'Directory'
			};
		});
		// handlding multiple property drag & drop scenarios
		if (oItems && oItems.length > 1 && !this.getMultiple() && !this.getDirectory()) {
			// Handling drag and drop of multiple files to upload with multiple property set
			const sMessage = this._oRb.getText("UPLOADSET_WITH_TABLE_MULTIPLE_RESTRICTED");
			Log.warning("Multiple files upload is retsricted for this multiple property set");
			MessageBox.error(sMessage);
			return;
		} else if (oItems && oItems.length > 1 && this.getMultiple() && !isFileOrFolderEntry('File', aEntryTypes)) {
			const sMessageDropFilesOnly = this._oRb.getText("UPLOADSET_WITH_TABLE_DIRECTORY_RESTRICTED");
			Log.warning("Multiple files upload is retsricted, drag & drop only files");
			MessageBox.error(sMessageDropFilesOnly);
			return;
		}

		// handling directory property drag & drop scenarios
		if (oItems && oItems.length && !this.getDirectory() && isFileOrFolderEntry('Directory', aEntryTypes)) {
			const sMessageDirectory = this._oRb.getText("UPLOADSET_WITH_TABLE_DIRECTORY_RESTRICTED");
			Log.warning("Directory of files upload is retsricted for this directory property set");
			MessageBox.error(sMessageDirectory);
			return;
		} else if (oItems && oItems.length && this.getDirectory() && !isFileOrFolderEntry('Directory', aEntryTypes)) {
			const sMessageDragDropDirectory = this._oRb.getText("UPLOADSET_WITH_TABLE_DROP_DIRECTORY_ALLOWED");
			Log.warning("Directory of files upload is retsricted, drag & drop only directories here.");
			MessageBox.error(sMessageDragDropDirectory);
			return;
		}
		if (oItems && oItems.length) {
			this._getFilesFromDataTransferItems(oItems).then( (oFiles) => {
				if (oFiles && oFiles.length) {
					this._processSelectedFileObjects(oFiles);
				}
			});
		}

		function isFileOrFolderEntry(sType, aEntries) {
			return aEntries.every(function (oEntry) {
				return oEntry.entryType === sType;
			});
		}
	};
	/**
	 * Method to extract files from dataTransfer items contianing files / directory of files.
	 * @param {Object} dataTransferItems, DataTransfer items extracted from browserEvent for drop.
	 * @returns {Promise} oPromise, Promise on resolved returns list of files dropped for upload.
	 * @private
	 */
	UploadSetwithTable.prototype._getFilesFromDataTransferItems = function (dataTransferItems) {
		const aFiles = [];
		return new Promise((resolve, reject) => {
			const aEntriesPromises = [];
			for (let i = 0; i < dataTransferItems.length; i++) {
				aEntriesPromises.push(traverseFileTreePromise(dataTransferItems[i]?.webkitGetAsEntry()));
			}
			Promise.all(aEntriesPromises)
				.then( (entries) => {
					resolve(aFiles);
				}, (err) => {
					reject(err);
				});
		});

		function traverseFileTreePromise(item) {
			return new Promise((resolve, reject) => {
				if (item.isFile) {
					item.file((oFile) => {
						aFiles.push(oFile);
						resolve(oFile);
					}, (err) => {
						reject(err);
					});
				} else if (item.isDirectory) {
					const dirReader = item.createReader();
					dirReader.readEntries(function (entries) {
						const aEntriesPromises = [];
						for (let i = 0; i < entries.length; i++) {
							aEntriesPromises.push(traverseFileTreePromise(entries[i]));
						}
						resolve(Promise.all(aEntriesPromises));
					});
				}
			});
		}
	};

	/**
	* Opens preview of the item pressed.
	* @param {sap.m.upload.UploadSetwithTableItem} oItem item to be previewed.
	* @private
	*/
	UploadSetwithTable.prototype._openFilePreview = function (oItem) {
		if (!this.getPreviewDialog()) {
			const oAssociatedPreviewDialog = new FilePreviewDialog();
			this.setPreviewDialog(oAssociatedPreviewDialog);
		}
		this._filePreviewDialogControl = Element.getElementById(this.getPreviewDialog());
		// var aitems = this.getAdditionalFooterButtons();
		if (this._filePreviewDialogControl) {
			this._filePreviewDialogControl._previewItem = oItem;
			this._filePreviewDialogControl._items = this.getItems();
			this._filePreviewDialogControl._open();
		}
	};

	/**
	* Internal API return the dialog for document rename.
	* @param {sap.m.upload.UploadSetwithTableItem} oItem item to be renamed.
	* @private
	* @returns {sap.m.Dialog} oDialog, created dialog instance
	*/
	UploadSetwithTable.prototype._getFileRenameDialog = function(oItem) {
		const oSplit = UploadSetwithTableItem._splitFileName(oItem.getFileName());
		let iMaxLength = this.getMaxFileNameLength();
		const iFileExtensionLength = oSplit.extension ? oSplit.extension.length + 1 : 0;
			iMaxLength = iMaxLength ? iMaxLength : 0;
		let iNameMaxLength = iMaxLength - iFileExtensionLength;
		    iNameMaxLength = iNameMaxLength < 0 ? 0 : iNameMaxLength;

		// Input field
		const oInput = new Input({
			type: Library.InputType.Text,
			value: oSplit.name,
			width: "90%",
			maxLength: iNameMaxLength,
			liveChange: [this._handleItemNameValidation, this]
		});
		oInput.addStyleClass("sapUiTinyMarginTop");
		oInput.addStyleClass("sapUiSmallMarginBegin");
		// Label for Input
		const oLabel = new Label({
			text: this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_INPUT_LABEL"),
			labelFor: oInput.getId()
		});
		oLabel.addStyleClass("sapUiSmallMarginTop");
		oLabel.addStyleClass("sapUiSmallMarginBegin");
		oLabel.addStyleClass("sapUiSmallMarginEnd");
		// Dialog creation
		var oDialog = new Dialog({
			title: this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_DIALOG_TEXT"),
			contentWidth: "22.5rem",
			contentHeight: "12rem",
			content: [oLabel,oInput],
			beginButton: new Button({
				type: Library.ButtonType.Emphasized,
				text: this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_APPLY_BUTTON_TEXT"),
				press: this._handleItemRenameConfirmation.bind(this),
				enabled: oInput.getValueState() !== "Error"
			}),
			endButton: new Button({
				text: this._oRb.getText("UPLOADSET_WITH_TABLE_CANCELBUTTON_TEXT"),
				press: this._handleItemRenameCancel.bind(this)
			}),
			customData: {
				key: "item",
				value: oItem
			},
			afterClose: function () {
				oDialog.destroy();
			}
		});

		return oDialog;
	};

	/**
	* Handler for item rename cancel operation.
	* @param {object} oEvent cancel button click event.
	* @private
	*/
	UploadSetwithTable.prototype._handleItemRenameCancel = function(oEvent) {
		const oDialog = oEvent.getSource().getParent();
		const oInput = oDialog.getContent()[1];
		const oItem = oDialog && oDialog.data ? oDialog.data().item : null;
		const oSplit = UploadSetwithTableItem._splitFileName(oItem.getFileName());
		// Check if there are changes made to the existing file name.
		if (oItem && oInput && oSplit.name !== oInput.getValue()) {
			MessageBox.warning(this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_DISCARD_POPUP_CHANGES_TEXT"), {
				actions: [this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_SAVE_BUTTON_TEXT"), this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_DISCARD_CHANGES_BUTTON_TEXT")],
				emphasizedAction: this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_SAVE_BUTTON_TEXT"),
				onClose: (sAction) => {
					if (sAction !== this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_SAVE_BUTTON_TEXT")) {
						oDialog.close();
					} else {
						// fire beginbutton event to save the filename
						var oBeginButton = oDialog.getBeginButton();
						var oEvent = new EventBase("click", oBeginButton);
						oBeginButton.firePress(oEvent);
					}
				}
			});
		} else {
			oDialog.close();
		}
	};

	/**
	* Handler for item rename confirm operation.
	* @param {object} oEvent confirm button click event.
	* @private
	*/
	UploadSetwithTable.prototype._handleItemRenameConfirmation = function(oEvent) {
		const oDialog = oEvent.getSource().getParent();
		const oInput = oDialog.getContent()[1];
		if (oInput && oInput.getValueState() === "Error") {
			oInput.focus(oInput);
			oInput.setShowValueStateMessage(true);
			return;
		}
		const oItem = oDialog && oDialog.data ? oDialog.data().item : null;
		const oSplit = UploadSetwithTableItem._splitFileName(oItem.getFileName());
		// update only if there is change
		if (oItem && oSplit.name !== oInput.getValue()) {
			if (oSplit && oSplit.extension) {
				oItem.setFileName(oInput.getValue() + "." + oSplit.extension);
			} else {
				oItem.setFileName(oInput.getValue());
			}
			oDialog.close();
			this.fireItemRenamed({item: oItem});
		} else {
			oDialog.close();
		}
	};

	/**
	* Handler for file name validation.
	* @param {object} oEvent Input keyevent.
	* @private
	*/
	UploadSetwithTable.prototype._handleItemNameValidation = function(oEvent) {
		const oInput = oEvent.getSource();
		let sValue = oInput.getValue();
		sValue = sValue.trim();

		// empty file validation
		if (sValue === "") {
			oInput.setProperty("valueState", "Error", true);
			oInput.setValueStateText(this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_EMPTY_NAME_VALIDATION_ERROR_MESSAGE"));
			oInput.setShowValueStateMessage(true);
			return;
		}

		const oCharacterRegex = new RegExp(/[@#$]/);
		if (oCharacterRegex.test(sValue)) {
			oInput.setShowValueStateMessage(true);
			oInput.setProperty("valueState", "Error", true);
			oInput.setValueStateText(this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_SPLC_VALIDATION_ERROR_MESSAGE", '@#$'));
		} else {
			oInput.setShowValueStateMessage(false);
			oInput.setProperty("valueState", "None", true);
		}
	};

    return UploadSetwithTable;
});