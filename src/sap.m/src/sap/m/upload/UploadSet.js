/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Icon",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/m/library",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/MessageBox",
	"sap/m/OverflowToolbar",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/m/ToolbarSpacer",
	"sap/ui/unified/FileUploader",
	"sap/m/upload/UploadSetItem",
	"sap/m/upload/Uploader",
	"sap/m/upload/UploadSetRenderer"
], function (Control, Icon, KeyCodes, Log, deepEqual, MobileLibrary, Button, Dialog, List, MessageBox, OverflowToolbar,
			 StandardListItem, Text, ToolbarSpacer, FileUploader, UploadSetItem, Uploader, Renderer) {
	"use strict";

	/**
	 * Constructor for a new UploadSet.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given.
	 * @param {object} [mSettings] Initial settings for the new control.
	 * @class This control allows you to upload one or more files from your devices (desktop, tablet, or phone)
	 * and attach them to your application.<br>
	 * This control builds on the {@link sap.m.UploadCollection} control, providing better handling of headers
	 * and requests, unified behavior of instant and deferred uploads, as well as improved progress indication.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.63
	 * @alias sap.m.upload.UploadSet
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel.
	 */
	var UploadSet = Control.extend("sap.m.upload.UploadSet", {
		metadata: {
			library: "sap.m",
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
				 * Defines whether the upload process should be triggered as soon as the file is added.<br>
				 * If set to <code>false</code>, no upload is triggered when a file is added.
				 */
				instantUpload: {type: "boolean", defaultValue: true},
				/**
				 * Defines whether file icons should be displayed.
				 */
				showIcons: {type: "boolean", defaultValue: true},
				/**
				 * Defines whether it is allowed to terminate the upload process.
				 */
				terminationEnabled: {type: "boolean", defaultValue: true},
				/**
				 * Defines whether the upload action is allowed.
				 */
				uploadEnabled: {type: "boolean", defaultValue: true},
				/**
				 * URL where the uploaded files will be stored.
				 */
				uploadUrl: {type: "string", defaultValue: null}
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * Items representing files that have already been uploaded.
				 */
				items: {type: "sap.m.upload.UploadSetItem", multiple: true, singularName: "item"},
				/**
				 * Items representing files yet to be uploaded.
				 */
				incompleteItems: {type: "sap.m.upload.UploadSetItem", multiple: true, singularName: "incompleteItem"},
				/**
				 * Header fields to be included in the header section of an XHR request.
				 */
				headerFields: {type: "sap.ui.core.Item", multiple: true, singularName: "headerField"},
				/**
				 * Main toolbar of the <code>UploadSet</code> control.
				 */
				toolbar: {type: "sap.m.OverflowToolbar", multiple: false},
				/**
				 * Defines the uploader to be used. If not specified, the default implementation is used.
				 */
				uploader: {type: "sap.m.upload.Uploader", multiple: false}
			},
			events: {
				/**
				 * This event is fired when a new file is added to the set of items to be uploaded.
				 */
				afterItemAdded: {
					parameters: {
						/**
						 * The file that has just been added.
						 */
						item: {type: "sap.m.upload.UploadSetItem"}
					}
				},
				/**
				 * This event is fired just before a new file is added to the set of items to be uploaded.
				 */
				beforeItemAdded: {
					parameters: {
						/**
						 * The file to be added to the set of items to be uploaded.
						 */
						item: {type: "sap.m.upload.UploadSetItem"}
					},
					allowPreventDefault: true
				},
				/**
				 * This event is fired just before the confirmation dialog for 'Remove' action is displayed.
				 */
				beforeItemRemoved: {
					parameters: {
						/**
						 * The item to be removed from the set of items to be uploaded.
						 */
						item: {type: "sap.m.upload.UploadSetItem"}
					},
					allowPreventDefault: true
				},
				/**
				 * This event is fired when the edit button is clicked for an item and no other item is being edited
				 * at the same time.
				 * <br>If there is another item that has unsaved changes, the editing of the clicked item cannot be started.
				 */
				beforeItemEdited: {
					parameters: {
						/**
						 * The item to be edited.
						 */
						item: {type: "sap.m.upload.UploadSetItem"}
					},
					allowPreventDefault: true
				},
				/**
				 * This event is fired right before the upload process begins.
				 */
				beforeUploadStarts: {
					parameters: {
						/**
						 * The file whose upload is just about to start.
						 */
						item: {type: "sap.m.upload.UploadSetItem"}
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
						item: {type: "sap.m.upload.UploadSetItem"}
					}
				},
				/**
				 * This event is fired right before the upload is terminated.
				 */
				beforeUploadTermination: {
					parameters: {
						/**
						 * The file whose upload is about to be terminated.
						 */
						item: {type: "sap.m.upload.UploadSetItem"}
					},
					allowPreventDefault: true
				},
				/**
				 * This event is fired right after the upload is terminated.
				 */
				uploadTerminated: {
					parameters: {
						/**
						 * The file whose upload has just been terminated.
						 */
						item: {type: "sap.m.upload.UploadSetItem"}
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
						item: {type: "sap.m.upload.UploadSetItem"}
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
						item: {type: "sap.m.upload.UploadSetItem"}
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
						item: {type: "sap.m.upload.UploadSetItem"}
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
						item: {type: "sap.m.upload.UploadSetItem"}
					}
				},
				/**
				 * This event is fired simultaneously with the respective event in the inner {@link sap.m.List} control.
				 */
				selectionChanged: {
					parameters: {
						/**
						 * Items whose selection status has just been changed.
						 */
						items: {type: "sap.m.upload.UploadSetItem[]"}
					}
				}
			}
		}
	});

	var UploadState = MobileLibrary.UploadState;

	/* ================== */
	/* Lifecycle handling */
	/* ================== */

	UploadSet.prototype.init = function () {
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		this._oList = null;
		this._oNoDataIcon = new Icon(this.getId() + "-no-data-icon", {
			src: "sap-icon://document",
			size: "6rem",
			noTabStop: true
		});
		this._oEditedItem = null;
		this._oItemToBeDeleted = null;
		this._mListItemIdToItemMap = {};

		// Drag&drop
		this._$Body = null;
		this._$DragDropArea = null;
		this._oLastEnteredTarget = null;
	};

	UploadSet.prototype.exit = function () {
		this._unbindDragAndDrop();
		this._oNoDataIcon.destroy();
		this._oNoDataIcon = null;
	};

	/* ===================== */
	/* Overriden API methods */
	/* ===================== */

	UploadSet.prototype.onBeforeRendering = function () {
		this._unbindDragAndDrop();
	};

	UploadSet.prototype.onAfterRendering = function () {
		var oInput;
		if (this._oEditedItem) {
			oInput = this._oEditedItem._getFileNameEdit().$("inner");
			if (oInput) {
				oInput.focus(function () {
					oInput.selectText(0, oInput.val().length);
				});
				oInput.focus();
			}
		}

		this._bindDragAndDrop();
	};

	UploadSet.prototype.onkeydown = function (oEvent) {
		var oListItem,
			oItem;

		// Check the case when focus is inside an edited item
		if (this._oEditedItem && this._oEditedItem._getFileNameEdit().$("inner")[0] === oEvent.target) {
			oItem = this._oEditedItem;
		} else if (oEvent.target) {
			oListItem = sap.ui.getCore().byId(oEvent.target.id);
			if (oListItem) {
				oItem = this._mListItemIdToItemMap[oListItem.getId()];
			}
		}

		// No item no fun
		if (!oItem) {
			return;
		}

		switch (oEvent.keyCode) {
			case KeyCodes.F2:
				if (oItem._bInEditMode) {
					this._handleItemEditConfirmation(oEvent, oItem);
				} else {
					this._handleItemEdit(oEvent, oItem);
				}
				break;
			case KeyCodes.ESCAPE:
				this._handleItemEditCancelation(oEvent, oItem);
				break;
			case KeyCodes.DELETE:
				if (!oItem.$("fileNameEdit").hasClass("sapMInputFocused") && oItem.getEnabledRemove() && oItem.getVisibleRemove()) {
					this._handleItemDelete(oEvent, oItem);
				}
				break;
			case KeyCodes.ENTER:
				if (oItem === this._oEditedItem) {
					this._handleItemEditConfirmation(oEvent, oItem);
				} else {
					oItem._handleFileNamePressed();
				}
				break;
			default:
				return;
		}
	};

	UploadSet.prototype.getToolbar = function () {
		if (!this._oToolbar) {
			this._oToolbar = this.getAggregation("toolbar");
			if (!this._oToolbar) {
				this._oToolbar = new OverflowToolbar(this.getId() + "-toolbar", {
					content: [this._oNumberOfAttachmentsTitle, new ToolbarSpacer(), this.getDefaultFileUploader()]
				});
				this.addDependent(this._oToolbar);
			} else {
				this._oToolbar.addContent(this.getDefaultFileUploader());
			}
		}

		return this._oToolbar;
	};

	UploadSet.prototype.getNoDataText = function () {
		var sNoDataText = this.getProperty("noDataText");
		sNoDataText = sNoDataText || this._oRb.getText("UPLOAD_SET_NO_DATA_TEXT");
		return sNoDataText;
	};

	UploadSet.prototype.getNoDataDescription = function () {
		var sNoDataDescription = this.getProperty("noDataDescription");
		sNoDataDescription = sNoDataDescription || this._oRb.getText("UPLOAD_SET_NO_DATA_DESCRIPTION");
		return sNoDataDescription;
	};

	UploadSet.prototype.setToolbar = function (oToolbar) {
		this.setAggregation("toolbar", oToolbar);
		this.getToolbar();

		return this;
	};

	UploadSet.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		Control.prototype.addAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		if (oObject && (sAggregationName === "items" || sAggregationName === "incompleteItems")) {
			this._projectToNewListItem(oObject);
			this._refreshInnerListStyle();
		}
	};

	UploadSet.prototype.insertAggregation = function (sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		Control.prototype.insertAggregation.call(this, sAggregationName, oObject, iIndex, bSuppressInvalidate);
		if (oObject && (sAggregationName === "items" || sAggregationName === "incompleteItems")) {
			this._projectToNewListItem(oObject, iIndex || 0);
			this._refreshInnerListStyle();
		}
	};

	UploadSet.prototype.removeAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		var oListItem;
		Control.prototype.removeAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		if (oObject && (sAggregationName === "items" || sAggregationName === "incompleteItems")) {
			oListItem = oObject._getListItem();
			var oItem = this.getList().removeAggregation("items", oListItem, bSuppressInvalidate);
			if (oItem) {
				oItem.destroy();
			}
			this._refreshInnerListStyle();
		}
	};

	UploadSet.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {
		if (sAggregationName === "items") {
			this.getItems().forEach(function (oItem) {
				this.getList().removeAggregation("items", oItem._getListItem(), bSuppressInvalidate);
			}.bind(this));
		} else if (sAggregationName === "incompleteItems") {
			this.getIncompleteItems().forEach(function (oItem) {
				this.getList().removeAggregation("items", oItem._getListItem(), bSuppressInvalidate);
			}.bind(this));
		}
		Control.prototype.removeAllAggregation.call(this, sAggregationName, bSuppressInvalidate);
	};

	UploadSet.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
		if (sAggregationName === "items" || sAggregationName === "incompleteItems") {
			this.removeAllAggregation(sAggregationName, bSuppressInvalidate);
		}
		if (this.getList().getItems().length === 0) {
			this.getList().destroyAggregation("items", bSuppressInvalidate);
		}
		Control.prototype.destroyAggregation.call(this, sAggregationName, bSuppressInvalidate);
	};

	UploadSet.prototype.setFileTypes = function (aNewTypes) {
		var aTypes = aNewTypes || null;
		if (typeof aTypes === "string") {
			aTypes = aTypes.split(",");
		}
		aTypes = (aTypes || []).map(function (s) {
			return s ? s.toLowerCase() : "";
		});
		if (!deepEqual(this.getFileTypes(), aTypes)) {
			this.setProperty("fileTypes", aTypes, true);
			this._checkRestrictions();
		}
		return this;
	};

	UploadSet.prototype.setMaxFileNameLength = function (iNewMax) {
		if (this.getMaxFileNameLength() !== iNewMax) {
			this.setProperty("maxFileNameLength", iNewMax, true);
			this._checkRestrictions();
		}
		return this;
	};

	UploadSet.prototype.setMaxFileSize = function (iNewMax) {
		if (this.getMaxFileSize() !== iNewMax) {
			this.setProperty("maxFileSize", iNewMax, true);
			this._checkRestrictions();
		}
		return this;
	};

	UploadSet.prototype.setMediaTypes = function (aNewTypes) {
		var aTypes = aNewTypes || null;
		if (typeof aTypes === "string") {
			aTypes = aTypes.split(",");
		}
		aTypes = (aTypes || []).map(function (s) {
			return s ? s.toLowerCase() : "";
		});
		if (!deepEqual(this.getMediaTypes(), aTypes)) {
			this.setProperty("mediaTypes", aTypes, true);
			this._checkRestrictions();
		}
		return this;
	};

	UploadSet.prototype.setShowIcons = function (bShow) {
		if (bShow !== this.getShowIcons()) {
			this._getAllItems().forEach(function (oItem) {
				oItem._getIcon().setVisible(bShow);
			});
			this.setProperty("showIcons", bShow, false);
		}
		return this;
	};

	UploadSet.prototype.setTerminationEnabled = function (bEnable) {
		if (bEnable !== this.getTerminationEnabled()) {
			this._getAllItems().forEach(function (oItem) {
				if (oItem.getUploadState() === UploadState.Uploading) {
					oItem._getTerminateButton().setVisible(bEnable);
				}
			});
			this.setProperty("terminationEnabled", bEnable, false);
		}
		return this;
	};

	UploadSet.prototype.setUploadEnabled = function (bEnable) {
		if (bEnable !== this.getUploadEnabled()) {
			this.getDefaultFileUploader().setEnabled(bEnable); // TODO: This can go, FileUploader doesn't upload anymore
			this.setProperty("uploadEnabled", bEnable, false);
		}
		return this;
	};

	/* ============== */
	/* Public methods */
	/* ============== */

	/**
	 * Provides access to the instance of the inner {@link sap.m.List} control, so that it can be customized.
	 * @return {sap.m.List} The inner {@link sap.m.List} control.
	 * @public
	 */
	UploadSet.prototype.getList = function () {
		if (!this._oList) {
			this._oList = new List(this.getId() + "-list", {
				selectionChange: [this._handleSelectionChange, this],
				headerToolbar: this.getToolbar()
			});
			this._oList.addStyleClass("sapMUCList");
			this.addDependent(this._oList);
		}

		return this._oList;
	};

	/**
	 * Starts uploading all files that comply with the restrictions defined in the <code>fileTypes</code>,
	 * <code>maxFileNameLength</code>, <code>maxFileSize</code>, and <code>mediaTypes</code> properties.
	 * <br>This method works only when the <code>uploadEnabled</code> property is set to <code>true</code>.
	 * @public
	 */
	UploadSet.prototype.upload = function () {
		if (!this.getUploadEnabled()) {
			Log.warning("Upload is currently disabled for this upload set.");
			return;
		}

		this.getIncompleteItems().forEach(function (oItem) {
			this._uploadItemIfGoodToGo(oItem);
		}.bind(this));
	};

	/**
	 * Starts uploading the file if it complies with the restrictions defined in the <code>fileTypes</code>,
	 * <code>maxFileNameLength</code>, <code>maxFileSize</code>, and <code>mediaTypes</code>
	 * properties.
	 * <br>This method works only when the <code>uploadEnabled</code> property is set to <code>true</code>.
	 * @param {object} oItem File to upload.
	 * @public
	 */
	UploadSet.prototype.uploadItem = function (oItem) {
		this._uploadItemIfGoodToGo(oItem);
	};

	/**
	 * Returns an instance of the default <code>sap.ui.unified.FileUploader</code> used for adding files using
	 * the operating system's open file dialog, so that it can be customized, for example made invisible or assigned a different icon.
	 * @return {sap.ui.unified.FileUploader} Instance of the default <code>sap.ui.unified.FileUploader</code>.
	 * @public
	 */
	UploadSet.prototype.getDefaultFileUploader = function () {
		var sTooltip;
		if (!this._oFileUploader) {
			this._oFileUploader = new FileUploader(this.getId() + "-uploader", {
				buttonOnly: true,
				buttonText: sTooltip,
				tooltip: sTooltip,
				iconOnly: true,
				enabled: this.getUploadEnabled(),
				icon: "sap-icon://add",
				fileType: this.getFileTypes(),
				mimeType: this.getMediaTypes(),
				iconFirst: false,
				multiple: true,
				style: "Transparent",
				name: "uploadSetFileUploader",
				sameFilenameAllowed: true,
				useMultipart: false,
				sendXHR: true,
				change: [this._onFileUploaderChange, this],
				uploadStart: [this._onUploadStarted, this],
				uploadProgress: [this._onUploadProgressed, this],
				uploadComplete: [this._onUploadCompleted, this],
				uploadAborted: [this._onUploadAborted, this],
				typeMissmatch: [this._fireFileTypeMismatch, this],
				fileSizeExceed: [this._fireFileSizeExceed, this],
				filenameLengthExceed: [this._fireFilenameLengthExceed, this]
			});
		}

		return this._oFileUploader;
	};

	/**
	 * Attaches all necessary handlers to the given uploader instance, so that the progress and status of the upload can be
	 * displayed and monitored.
	 * @param {sap.m.upload.Uploader} oUploader Instance of <code>sap.m.upload.Uploader</code> to which the default request handlers are attached.
	 * @public
	 */
	UploadSet.prototype.registerUploaderEvents = function (oUploader) {
		oUploader.attachUploadStarted(this._onUploadStarted.bind(this));
		oUploader.attachUploadProgressed(this._onUploadProgressed.bind(this));
		oUploader.attachUploadCompleted(this._onUploadCompleted.bind(this));
		oUploader.attachUploadAborted(this._onUploadAborted.bind(this));
	};

	/* ============== */
	/* Event handlers */
	/* ============== */

	UploadSet.prototype._onFileUploaderChange = function (oEvent) {
		var oFiles = oEvent.getParameter("files");
		this._processNewFileObjects(oFiles);
	};

	UploadSet.prototype._onUploadStarted = function (oEvent) {
		var oItem = oEvent.getParameter("item");
		oItem.setUploadState(UploadState.Uploading);
	};

	UploadSet.prototype._onUploadProgressed = function (oEvent) {
		var oItem = oEvent.getParameter("item"),
			iPercentUploaded = Math.round(oEvent.getParameter("loaded") / oEvent.getParameter("total") * 100);
		oItem.setProgress(iPercentUploaded);
	};

	UploadSet.prototype._onUploadCompleted = function (oEvent) {
		var oItem = oEvent.getParameter("item");
		oItem.setProgress(100);
		oItem.setUploadState(UploadState.Complete);
		this.fireUploadCompleted({item: oItem});
	};

	UploadSet.prototype._onUploadAborted = function (oEvent) {
		var oItem = oEvent.getParameter("item");
		oItem.setUploadState(UploadState.Error);
		this.fireUploadTerminated({item: oItem});
	};

	UploadSet.prototype._handleItemEdit = function (oEvent, oItem) {
		if (this._oEditedItem) {
			this._handleItemEditConfirmation(oEvent, this._oEditedItem);
		}
		// If editing of current item could not be finished then editing of another item cannot start
		if (!this._oEditedItem) {
			if (this.fireBeforeItemEdited({item: oItem})) {
				this._oEditedItem = oItem;
				this._oEditedItem._setInEditMode(true);
			}
		}
	};

	UploadSet.prototype._handleItemRestart = function (oEvent, oItem) {
		oItem.setUploadState(UploadState.Ready);
		this._uploadItemIfGoodToGo(oItem);
	};

	/**
	 * Edited item confirmation handling.
	 * @param {object} oEvent Event instance.
	 * @param {UploadSetItem} oItem Item whose editing is to be confirmed.
	 * @private
	 */
	UploadSet.prototype._handleItemEditConfirmation = function (oEvent, oItem) {
		var oEdit = oItem._getFileNameEdit(),
			sNewFileName, sNewFullName,
			sOrigFullFileName = oItem.getFileName(),
			oFile = UploadSetItem._splitFileName(sOrigFullFileName);

		sNewFileName = oEdit.getValue().trim();
		if (!sNewFileName || sNewFileName.length === 0) {
			oItem._setContainsError(true);
			return;
		}

		if (oFile.name !== sNewFileName) {
			sNewFullName = sNewFileName + "." + oFile.extension;
			oItem.setFileName(sNewFullName);
		}
		oItem._setContainsError(false);
		oItem._setInEditMode(false);
		this._oEditedItem = null;
	};

	/**
	 * Edited item cancelation handling.
	 *
	 * @param {object} oEvent Event instance.
	 * @param {UploadSetItem} oItem Item whose editing is to be canceled.
	 * @private
	 */
	UploadSet.prototype._handleItemEditCancelation = function (oEvent, oItem) {
		oItem._setContainsError(false);
		oItem._setInEditMode(false);
		this._oEditedItem = null;
	};

	UploadSet.prototype._handleItemDelete = function (oEvent, oItem) {
		var sMessageText;

		if (this._oEditedItem) {
			this._handleItemEditConfirmation(oEvent, this._oEditedItem);
			// If editing could not be finished then delete action cannot continue
			if (this._oEditedItem) {
				return;
			}
		}

		if (!oItem.fireRemovePressed({item: oItem})) {
			return;
		}

		if (!this.fireBeforeItemRemoved({item: oItem})) {
			return;
		}

		if (!oItem.getFileName()) {
			sMessageText = this._oRb.getText("UPLOAD_SET_DELETE_WITHOUT_FILE_NAME_TEXT");
		} else {
			sMessageText = this._oRb.getText("UPLOAD_SET_DELETE_TEXT", oItem.getFileName());
		}
		this._oItemToBeDeleted = oItem;
		MessageBox.show(sMessageText, {
			id: this.getId() + "-deleteDialog",
			title: this._oRb.getText("UPLOAD_SET_DELETE_TITLE"),
			actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
			onClose: this._handleClosedDeleteDialog.bind(this),
			dialogId: "messageBoxDeleteFile",
			styleClass: this.hasStyleClass("sapUiSizeCompact") ? "sapUiSizeCompact" : ""
		});
	};

	UploadSet.prototype._handleClosedDeleteDialog = function (sAction) {
		if (sAction !== MessageBox.Action.OK) {
			return;
		}
		this.removeItem(this._oItemToBeDeleted);
		this.removeIncompleteItem(this._oItemToBeDeleted);
		this._oItemToBeDeleted = null;
	};

	UploadSet.prototype._handleTerminateRequest = function (event, oItem) {
		var oFileList = new List({
				items: [
					new StandardListItem({
						title: oItem.getFileName(),
						icon: oItem._getIcon().getSrc()
					})
				]
			}),
			oDialog = new Dialog({
				id: this.getId() + "-teminateDialog",
				title: this._oRb.getText("UPLOAD_SET_TERMINATE_TITLE"),
				content: [
					new Text({
						text: this._oRb.getText("UPLOAD_SET_TERMINATE_TEXT")
					}),
					oFileList
				],
				buttons: [
					new Button({
						text: this._oRb.getText("UPLOAD_SET_OKBUTTON_TEXT"),
						press: [onPressOk, this]
					}),
					new Button({
						text: this._oRb.getText("UPLOAD_SET_CANCEL_BUTTON_TEXT"),
						press: function () {
							oDialog.close();
						}
					})
				],
				afterClose: function () {
					oDialog.destroy();
				}
			});
		oDialog.open();

		function onPressOk() {
			if (oItem.getUploadState() === UploadState.Uploading) {
				if (this.fireBeforeUploadTermination({item: oItem})) {
					this._handleUploadTermination(oItem);
				}
			} else if (oItem.getUploadState() === UploadState.Complete) {
				this.removeItem(oItem);
			}

			oDialog.close();
			this.invalidate();
		}
	};

	UploadSet.prototype._handleUploadTermination = function (oItem) {
		this._getActiveUploader().terminateItem(oItem);
	};

	UploadSet.prototype._handleSelectionChange = function (oEvent) {
		var aListItems = oEvent.getParameter("listItems"),
			aItems = [];
		aListItems.forEach(function (oListItem) {
			aItems.push(this._mListItemIdToItemMap[oListItem.getId()]);
		}.bind(this));
		this.fireSelectionChanged({items: aItems});
	};

	UploadSet.prototype._onDragEnterSet = function (oEvent) {
		if (oEvent.target === this._$DragDropArea[0]) {
			this._$DragDropArea.addClass("sapMUCDropIndicator");
		}
	};

	UploadSet.prototype._onDragLeaveSet = function (oEvent) {
		if (oEvent.target === this._$DragDropArea[0]) {
			this._$DragDropArea.removeClass("sapMUCDropIndicator");
		}
	};

	UploadSet.prototype._onDragOverSet = function (oEvent) {
		oEvent.preventDefault();
	};

	UploadSet.prototype._onDropOnSet = function (oEvent) {
		var oFiles;

		oEvent.preventDefault();
		if (oEvent.target === this._$DragDropArea[0]) {
			this._$DragDropArea.removeClass("sapMUCDropIndicator");
			this._$DragDropArea.addClass("sapMUCDragDropOverlayHide");

			oFiles = oEvent.originalEvent.dataTransfer.files;
			this._processNewFileObjects(oFiles);
		}
	};

	UploadSet.prototype._onDragEnterBody = function (oEvent) {
		this._oLastEnteredTarget = oEvent.target;
		this._$DragDropArea.removeClass("sapMUCDragDropOverlayHide");
	};

	UploadSet.prototype._onDragLeaveBody = function (oEvent) {
		if (this._oLastEnteredTarget === oEvent.target) {
			this._$DragDropArea.addClass("sapMUCDragDropOverlayHide");
		}
	};

	UploadSet.prototype._onDragOverBody = function (oEvent) {
		oEvent.preventDefault();
		this._$DragDropArea.removeClass("sapMUCDragDropOverlayHide");
	};

	UploadSet.prototype._onDropOnBody = function (oEvent) {
		this._$DragDropArea.addClass("sapMUCDragDropOverlayHide");
	};

	/* =============== */
	/* Private methods */
	/* =============== */

	UploadSet.prototype._getAllItems = function () {
		return this.getItems().concat(this.getIncompleteItems());
	};

	UploadSet.prototype._refreshInnerListStyle = function () {
		var iMaxIndex = this.getList().length - 1;
		this._oList.getItems().forEach(function (oListItem, iIndex) {
			oListItem.removeStyleClass("sapMUCListSingleItem")
				.removeStyleClass("sapMUCListFirstItem")
				.removeStyleClass("sapMUCListLastItem")
				.removeStyleClass("sapMUCListItem");

			if (iIndex === 0 && iMaxIndex === 0) {
				oListItem.addStyleClass("sapMUCListSingleItem");
			} else if (iIndex === 0) {
				oListItem.addStyleClass("sapMUCListFirstItem");
			} else if (iIndex === iMaxIndex) {
				oListItem.addStyleClass("sapMUCListLastItem");
			} else {
				oListItem.addStyleClass("sapMUCListItem");
			}
		});
	};

	UploadSet.prototype._processNewFileObjects = function (oFiles) {
		var aFiles = [],
			oItem;

		// Need to explicitly copy the file list, FileUploader deliberately resets its form completely
		// along with 'files' parameter when it (mistakenly) thinks that all is done.
		for (var i = 0; i < oFiles.length; i++) {
			aFiles.push(oFiles[i]);
		}

		aFiles.forEach(function (oFile) {
			oItem = new UploadSetItem({
				fileName: oFile.name,
				uploadState: UploadState.Ready
			});
			oItem._setFileObject(oFile);

			if (!this.fireBeforeItemAdded({item: oItem})) {
				return;
			}
			this.insertIncompleteItem(oItem);
			this.fireAfterItemAdded({item: oItem});

			if (this.getInstantUpload()) {
				this._uploadItemIfGoodToGo(oItem);
			}
		}.bind(this));
	};

	UploadSet.prototype._projectToNewListItem = function (oItem, iIndex) {
		var oListItem = oItem._getListItem();
		this._mListItemIdToItemMap[oListItem.getId()] = oItem; // TODO: Probably unnecessary
		if (iIndex || iIndex === 0) {
			this.getList().insertAggregation("items", oListItem, iIndex, true);
		} else {
			this.getList().addAggregation("items", oListItem, true);
		}
		this._checkRestrictionsForItem(oItem);
	};

	UploadSet.prototype._getImplicitUploader = function () {
		if (!this._oUploader) {
			this._oUploader = new Uploader();
			this._oUploader.setUploadUrl(this.getUploadUrl());
			this.registerUploaderEvents(this._oUploader);
			this.addDependent(this._oUploader);
		}

		return this._oUploader;
	};

	UploadSet.prototype._getActiveUploader = function () {
		return this.getUploader() || this._getImplicitUploader();
	};

	UploadSet.prototype._uploadItemIfGoodToGo = function (oItem) {
		if (oItem.getUploadState() === UploadState.Ready && !oItem._isRestricted()) {
			if (this.fireBeforeUploadStarts({item: oItem})) {
				this._getActiveUploader().uploadItem(oItem, this.getHeaderFields());
			}
		}
	};

	UploadSet.prototype._getDragDropHandlers = function () {
		if (!this._oDragDropHandlers) {
			this._oDragDropHandlers = {
				body: {
					"dragenter": this._onDragEnterBody.bind(this),
					"dragleave": this._onDragLeaveBody.bind(this),
					"dragover": this._onDragOverBody.bind(this),
					"drop": this._onDropOnBody.bind(this)
				},
				set: {
					"dragenter": this._onDragEnterSet.bind(this),
					"dragleave": this._onDragLeaveSet.bind(this),
					"dragover": this._onDragOverSet.bind(this),
					"drop": this._onDropOnSet.bind(this)
				}
			};
		}

		return this._oDragDropHandlers;
	};

	UploadSet.prototype._bindDragAndDrop = function () {
		this._$Body = jQuery(document.body);
		Object.keys(this._getDragDropHandlers().body).forEach(function (sEvent) {
			this._$Body.on(sEvent, this._getDragDropHandlers().body[sEvent]);
		}.bind(this));
		this._$DragDropArea = this.$("drag-drop-area");
		Object.keys(this._getDragDropHandlers().set).forEach(function (sEvent) {
			this.$().on(sEvent, this._getDragDropHandlers().set[sEvent]);
		}.bind(this));
	};

	UploadSet.prototype._unbindDragAndDrop = function () {
		if (this._$Body) {
			Object.keys(this._getDragDropHandlers().body).forEach(function (sEvent) {
				this._$Body.off(sEvent, this._getDragDropHandlers().body[sEvent]);
			}.bind(this));
		}
		Object.keys(this._getDragDropHandlers().set).forEach(function (sEvent) {
			this.$().off(sEvent, this._getDragDropHandlers().set[sEvent]);
		}.bind(this));
	};

	UploadSet.prototype._checkRestrictions = function () {
		this.getItems().forEach(function (oItem) {
			this._checkRestrictionsForItem(oItem);
		}.bind(this));
		this.getIncompleteItems().forEach(function (oItem) {
			this._checkRestrictionsForItem(oItem);
		}.bind(this));
	};

	UploadSet.prototype._checkRestrictionsForItem = function (oItem) {
		oItem._checkTypeRestriction(this.getFileTypes());
		oItem._checkNameLengthRestriction(this.getMaxFileNameLength());
		oItem._checkSizeRestriction(this.getMaxFileSize());
		oItem._checkMediaTypeRestriction(this.getMediaTypes());
	};

	UploadSet.prototype._fireFileTypeMismatch = function (oItem) {
		var aMediaTypes = this.getMediaTypes();
		var aFileTypes = this.getFileTypes();

		var sFileType = oItem.getParameter("fileType");
		var sMediaType = oItem.getParameter("mimeType");

		var bMediaRestricted = (!!aMediaTypes && (aMediaTypes.length > 0) && !!sMediaType && aMediaTypes.indexOf(sMediaType) === -1);
		var bFileRestricted = (!!aFileTypes && (aFileTypes.length > 0) && !!sFileType && aFileTypes.indexOf(sFileType) === -1);

		/*global Blob*/
		var parts = [new Blob([])];
			var oFileMetaData = {
				type: oItem.getParameter('fileType'),
				webkitRelativePath: '',
				name: oItem.getParameter('fileName')
			};
		/*global File*/
		var oFileObject = new File(parts, oItem.getParameter('fileName'), oFileMetaData);
		var oMismatchItem = new UploadSetItem();
		oMismatchItem._setFileObject(oFileObject);
		oMismatchItem.setFileName(oFileObject.name);

		if (bMediaRestricted){
			this.fireMediaTypeMismatch({item: oMismatchItem});
		} else if (bFileRestricted){
			this.fireFileTypeMismatch({item: oMismatchItem});
		}
	};

	UploadSet.prototype._fireFileSizeExceed = function (oItem) {
		this.fireFileSizeExceeded({item: oItem});
	};

	UploadSet.prototype._fireFilenameLengthExceed = function (oItem) {
		this.fireFileNameLengthExceeded({item: oItem});
	};

	return UploadSet;
});
