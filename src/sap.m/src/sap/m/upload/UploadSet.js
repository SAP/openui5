/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Control",
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
	"sap/m/upload/UploadSetRenderer",
	"sap/m/upload/UploaderHttpRequestMethod",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/m/library",
	"sap/m/upload/UploadSetToolbarPlaceholder",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessageSize",
	"sap/ui/core/Core"
], function (Control, KeyCodes, Log, deepEqual, MobileLibrary, Button, Dialog, List, MessageBox, OverflowToolbar,
			 StandardListItem, Text, ToolbarSpacer, FileUploader, UploadSetItem, Uploader, Renderer, UploaderHttpRequestMethod,
			DragDropInfo, DropInfo, Library, UploadSetToolbarPlaceholder, IllustratedMessage,IllustratedMessageType, IllustratedMessageSize, Core) {
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
				 * Defines custom text for the 'No data' text label.
				 */
				 dragDropText: {type: "string", defaultValue: null},
				 /**
				  * Defines custom text for the 'No data' description label.
				  */
				 dragDropDescription: {type: "string", defaultValue: null},
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
				uploadUrl: {type: "string", defaultValue: null},
				/**
				 * If set to true, the button used for uploading files become invisible.
				 * @since 1.99.0
				 */
				 uploadButtonInvisible: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Allows the user to use the same name for a file while editing the file name.
				 *'Same name' refers to an already existing file name in the list.
				 * @since 1.100.0
				 */
				 sameFilenameAllowed: {type: "boolean", group: "Behavior", defaultValue: false},
				 /**
				 * HTTP request method chosen for file upload.
				 * @since 1.90
				 */
				httpRequestMethod: {type: "sap.m.upload.UploaderHttpRequestMethod", defaultValue: UploaderHttpRequestMethod.Post},
				/**
				 * Lets the user select multiple files from the same folder and then upload them.
				 *
				 * If multiple property is set to false, the control shows an error message if more than one file is chosen for drag & drop.
				 */
				 multiple: {type: "boolean", group: "Behavior", defaultValue: false},
				 /**
				 * Defines the selection mode of the control (e.g. None, SingleSelect, MultiSelect, SingleSelectLeft, SingleSelectMaster).
				 * Since the UploadSet reacts like a list for attachments, the API is close to the ListBase Interface.
				 * sap.m.ListMode.Delete mode is not supported and will be automatically set to sap.m.ListMode.None.
				 * In addition, if instant upload is set to false the mode sap.m.ListMode.MultiSelect is not supported and will be automatically set to sap.m.ListMode.None.
				 * @since 1.100.0
				 */
				mode: {type: "sap.m.ListMode", group: "Behavior", defaultValue: Library.ListMode.MultiSelect},
				/**
				  * Enables CloudFile picker feature to upload files from cloud.
				  * @private
				  */
				 cloudFilePickerEnabled: {type: "boolean", group: "Behavior", defaultValue: false},
				/**
				  * Url of the FileShare OData V4 service supplied for CloudFile picker control.
				  * @private
				  */
				 cloudFilePickerServiceUrl: {type: "sap.ui.core.URI", group: "Data", defaultValue: ""},
				/**
				  * The text of the CloudFile picker button. The default text is "Upload from cloud" (translated to the respective language).
				  * @private
				  */
				 cloudFilePickerButtonText: {type: 'string', defaultValue: ""}
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
				uploader: {type: "sap.m.upload.Uploader", multiple: false},
				/**
			 	 * An illustrated message is displayed when no data is loaded or provided
				 * @private
				 */
				 _illustratedMessage: { type: "sap.m.IllustratedMessage", multiple: false, visibility: "hidden" }
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
				 * The event is triggered when the file name is changed.
				 * @since 1.100.0
				 */
				fileRenamed: {
					parameters: {
						/**
						 * The renamed UI element as an UploadSetItem.
						 */
						item: {type: "sap.m.upload.UploadSetItem"}
					}
				},
				/**
				 * This event is fired after the item is removed on click of ok button in confirmation dialog.
				 * @since 1.83
				 */
				afterItemRemoved: {
					parameters: {
						/**
						 * The item removed from the set of items to be uploaded.
						 */
						item: {type: "sap.m.upload.UploadSetItem"}
					}
				},
				/**
				 * This event is fired after item edit is confirmed.
				 * @since 1.83
				 */
				afterItemEdited: {
					parameters: {
						/**
						 * The item edited.
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
						item: {type: "sap.m.upload.UploadSetItem"},
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
				 * <li>Listeners can use the item parameter to remove the incomplete item that failed to meet the restriction</li>
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
				 * <li>Listeners can use the item parameter to remove the incomplete item that failed to meet the restriction</li>
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
		renderer: Renderer
	});

	var UploadState = MobileLibrary.UploadState;

	/* ================== */
	/* Lifecycle handling */
	/* ================== */

	UploadSet.prototype.init = function () {
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		this._oList = null;
		this._oEditedItem = null;
		this._oItemToBeDeleted = null;
		this._mListItemIdToItemMap = {};
		this._oUploadButton = null;
		this._oDragIndicator = false;
		this._bAttachEventListener = false;

		// Drag&drop
		this._$Body = null;
		this._$DragDropArea = null;
		this._oLastEnteredTarget = null;

		this._aGroupHeadersAdded = [];
		this._iFileUploaderPH = null;
		this._oItemToUpdate = null;
		var illustratedMessage = new IllustratedMessage({
				illustrationType: IllustratedMessageType.NoData,
				illustrationSize: IllustratedMessageSize.Auto,
				title: this.getNoDataText(),
				description: this.getNoDataDescription()
			});
		this.setAggregation("_illustratedMessage", illustratedMessage);
		this._cloudFilePickerControl = null;
	};

	UploadSet.prototype.exit = function () {
		if (this._oList) {
			this._oList.destroy();
			this._oList = null;
		}
		if (this._oToolbar) {
			this._oToolbar.destroy();
			this._oToolbar = null;
		}
		if (this._oFileUploader) {
			this._oFileUploader.destroy();
			this._oFileUploader = null;
		}
		if (this._oUploader) {
			this._oUploader.destroy();
			this._oUploader = null;
		}
	};

	/* ===================== */
	/* Overriden API methods */
	/* ===================== */

	UploadSet.prototype.onBeforeRendering = function (oEvent) {
		this._aGroupHeadersAdded = [];
		this._clearGroupHeaders();
		this._fillListWithUploadSetItems(this.getItems());
	};

	UploadSet.prototype.onAfterRendering = function () {
		var oInput;
		if (this._oEditedItem) {
			oInput = this._oEditedItem._getFileNameEdit().$("inner");
			if (oInput) {
				oInput.on("focus", function () {
					oInput.selectText(0, oInput.val().length);
				});
				oInput.trigger("focus");
			}
			if (this._oEditedItem && this._oEditedItem.getEditState()) {
				var oMarkerContainer = this._oEditedItem.getListItem().getDomRef().querySelector(".sapMUSObjectMarkerContainer");
				if (oMarkerContainer) {
					oMarkerContainer.setAttribute("style", "display: none");
				}
			}
		}
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
				if (!oItem.$("fileNameEdit").hasClass("sapMInputFocused")) {
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
					content: [this._oNumberOfAttachmentsTitle, new ToolbarSpacer(), this.getDefaultFileUploader(), this._getCloudFilePicker()]
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
				this._oToolbar.addContent(this._getCloudFilePicker());
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
		sNoDataDescription = sNoDataDescription || this._oRb.getText("UPLOADCOLLECTION_NO_DATA_DESCRIPTION");
		return sNoDataDescription;
	};

	UploadSet.prototype.getDragDropText = function () {
		var sDragDropText = this.getProperty("dragDropText");
		sDragDropText = sDragDropText || this._oRb.getText("IllustratedMessage_TITLE_UploadCollection");
		return sDragDropText;
	};

	UploadSet.prototype.getDragDropDescription = function () {
		var sDragDropDescription = this.getProperty("dragDropDescription");
		sDragDropDescription = sDragDropDescription || this._oRb.getText("IllustratedMessage_DESCRIPTION_UploadCollection");
		return sDragDropDescription;
	};

	UploadSet.prototype.setToolbar = function (oToolbar) {
		this.setAggregation("toolbar", oToolbar);
		this.getToolbar();

		return this;
	};

	UploadSet.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		Control.prototype.addAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		if (oObject && (sAggregationName === 'items' || sAggregationName === "incompleteItems")) {
			this._projectToNewListItem(oObject);
			this._refreshInnerListStyle();
		}
	};

	UploadSet.prototype.insertAggregation = function (sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		Control.prototype.insertAggregation.call(this, sAggregationName, oObject, iIndex, bSuppressInvalidate);
		if (oObject && (sAggregationName === 'items' || sAggregationName === 'incompleteItems')) {
			this._projectToNewListItem(oObject, iIndex || 0);
			this._refreshInnerListStyle();
		}
	};

	UploadSet.prototype.removeAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
        var oListItem,oItems;
        Control.prototype.removeAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
        if (sAggregationName === "items" || sAggregationName === "incompleteItems") {
			if (typeof oObject === 'number') { // "oObject" is the index now
				oItems = this.getItems();
				oListItem = oItems[oObject];
			} else if (typeof oObject === 'object') { // the object itself is given or has just been retrieved
				if (this.getList() && this.getList().getItems().length) {
					oListItem = oObject._getListItem();
				}
			}
            var oItem = this.getList().removeAggregation("items", oListItem, bSuppressInvalidate);
            if (oItem && oObject) {
                oItem.destroy();
				oObject.destroy();
            }
            this._refreshInnerListStyle();
        }
    };

	UploadSet.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {
		if (sAggregationName === "items") {
			this.getItems().forEach(function (oItem) {
				if (this._oList) {
					this._oList.removeAggregation("items", oItem._getListItem(), bSuppressInvalidate);
				}
			}.bind(this));
		} else if (sAggregationName === "incompleteItems") {
			this.getIncompleteItems().forEach(function (oItem) {
				if (this._oList) {
					this._oList.removeAggregation("items", oItem._getListItem(), bSuppressInvalidate);
				}
			}.bind(this));
		}
		Control.prototype.removeAllAggregation.call(this, sAggregationName, bSuppressInvalidate);
	};

	UploadSet.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
		if (sAggregationName === "items" || sAggregationName === "incompleteItems") {
			this.removeAllAggregation(sAggregationName, bSuppressInvalidate);
		}
		if (this._oList && this._oList.getItems().length === 0) {
			this._oList.destroyAggregation("items", bSuppressInvalidate);
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

	UploadSet.prototype.setUploadButtonInvisible = function (bUploadButtonInvisible) {
		if (this.getUploadButtonInvisible() === bUploadButtonInvisible) {
			return this;
		}
		this.setProperty("uploadButtonInvisible", bUploadButtonInvisible, true);
		this.getDefaultFileUploader().setVisible(!bUploadButtonInvisible);

		return this;
	};

	UploadSet.prototype.setUploadEnabled = function (bEnable) {
		if (bEnable !== this.getUploadEnabled()) {
			this.getDefaultFileUploader().setEnabled(bEnable); // TODO: This can go, FileUploader doesn't upload anymore
			this.setProperty("uploadEnabled", bEnable, false);
		}
		return this;
	};

	UploadSet.prototype.setMultiple = function (bMultiple) {
		if (this.getMultiple() !== bMultiple) {
			this.setProperty("multiple", bMultiple);
			this.getDefaultFileUploader().setMultiple(bMultiple);
		}
		return this;
	};

	UploadSet.prototype.setMode = function(sMode) {
		if (sMode === Library.ListMode.Delete) {
			this.setProperty("mode", Library.ListMode.None);
			Log.info("sap.m.ListMode.Delete is not supported by UploadSet. Value has been resetted to 'None'");
		} else if (sMode === Library.ListMode.MultiSelect && !this.getInstantUpload()) {
			this.setProperty("mode", Library.ListMode.None);
			Log.info("sap.m.ListMode.MultiSelect is not supported by UploadSet for Pending Upload. Value has been reset to 'None'");
		} else {
			this.setProperty("mode", sMode);
		}
		if (this._oList) {
			this._oList.setMode(this.getMode());
		}
		return this;
	};

	UploadSet.prototype._getIllustratedMessage = function () {
		var oAggregation = this.getAggregation("_illustratedMessage");
		if (oAggregation) {
			if (this._getDragIndicator()) {
				oAggregation.setIllustrationType(IllustratedMessageType.UploadCollection);
				oAggregation.setTitle(this.getDragDropText());
				oAggregation.setDescription(this.getDragDropDescription());
				oAggregation.removeAllAdditionalContent();
			} else {
				oAggregation.setIllustrationType(IllustratedMessageType.NoData);
				oAggregation.setTitle(this.getNoDataText());
				oAggregation.setDescription(this.getNoDataDescription());
				oAggregation.addAdditionalContent(this.getUploadButtonForIllustratedMessage());
			}
		}
		return oAggregation;
	};

	UploadSet.prototype.getUploadButtonForIllustratedMessage = function () {
		if (!this._oUploadButton) {
			this._oUploadButton = new Button({
				id: this.getId() + "-uploadButton",
				type: MobileLibrary.ButtonType.Standard,
				visible: this.getUploadEnabled(),
				text: this._oRb.getText("UPLOADCOLLECTION_UPLOAD"),
				ariaDescribedBy: this.getAggregation("_illustratedMessage").getId(),
				press: function () {
					var FileUploader = this.getDefaultFileUploader();
					FileUploader.$().find("input[type=file]").trigger("click");
				}.bind(this)
			});
		}

		return this._oUploadButton;
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
				headerToolbar: this.getToolbar(),
				dragDropConfig: [
					new DragDropInfo({
						dropPosition: "Between",
						sourceAggregation: "items",
						targetAggregation: "items",
						dragStart: [this._onDragStartItem, this],
						drop: [this._onDropItem, this]
					})
					,
					new DropInfo({
						dropEffect:"Move",
						dropPosition:"OnOrBetween",
						dragEnter: [this._onDragEnterFile, this],
						drop: [this._onDropFile, this]
					})
				],
				mode: this.getMode()
			});
			this._oList.addStyleClass("sapMUCList");
			this.addDependent(this._oList);
		}

		return this._oList;
	};

	UploadSet.prototype._onDragStartItem = function (oEvent) {
		this.fireItemDragStart(oEvent);
	};

	UploadSet.prototype._onDropItem = function (oEvent) {
		this.fireItemDrop(oEvent);
	};

	UploadSet.prototype._onDragEnterFile = function (oEvent) {
		var oDragSession = oEvent.getParameter("dragSession");
		var oDraggedControl = oDragSession.getDragControl();
		if (!this._bAttachEventListener) {
            window.addEventListener("focus", function() {
                this._oDragIndicator = false;
                this._getIllustratedMessage();
            }.bind(this), true);
            this._bAttachEventListener = true;
        }
		this._oDragIndicator = true;
        this._getIllustratedMessage();
		if (oDraggedControl) {
			oEvent.preventDefault();
		}
	};

	UploadSet.prototype._onDropFile = function (oEvent) {
		var oFiles;
		this._oDragIndicator = false;
		this._getIllustratedMessage();
		oEvent.preventDefault();
		if (this.getUploadEnabled()) {
			oFiles = oEvent.getParameter("browserEvent").dataTransfer.files;
			// Handling drag and drop of multiple files to upload with multiple property set
			if (oFiles && oFiles.length > 1 && !this.getMultiple()) {
				var sMessage = this._oRb.getText("UPLOADCOLLECTION_MULTIPLE_FALSE");
				Log.warning("Multiple files upload is retsricted for this multiple property set");
				MessageBox.error(sMessage);
				return;
			}
			this._processNewFileObjects(oFiles);
		}
	};

	UploadSet.prototype._getDragIndicator = function () {
		return this._oDragIndicator;
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
		var sTooltip = this._oRb.getText("UPLOADCOLLECTION_UPLOAD");
		if (!this._oFileUploader) {
			this._oFileUploader = new FileUploader(this.getId() + "-uploader", {
				buttonOnly: true,
				buttonText: sTooltip,
				tooltip: sTooltip,
				iconOnly: false,
				enabled: this.getUploadEnabled(),
				fileType: this.getFileTypes(),
				mimeType: this.getMediaTypes(),
				icon: "",
				iconFirst: false,
				multiple: this.getMultiple(),
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
				filenameLengthExceed: [this._fireFilenameLengthExceed, this],
				visible: !this.getUploadButtonInvisible()
			});
		}

		return this._oFileUploader;
	};

	/**
	 * Attaches all necessary handlers to the given uploader instance, so that the progress and status of the upload can be
	 * displayed and monitored.
	 * This is necessary in case when custom uploader is used.
	 * @param {sap.m.upload.Uploader} oUploader Instance of <code>sap.m.upload.Uploader</code> to which the default request handlers are attached.
	 * @public
	 */
	UploadSet.prototype.registerUploaderEvents = function (oUploader) {
		oUploader.attachUploadStarted(this._onUploadStarted.bind(this));
		oUploader.attachUploadProgressed(this._onUploadProgressed.bind(this));
		oUploader.attachUploadCompleted(this._onUploadCompleted.bind(this));
		oUploader.attachUploadAborted(this._onUploadAborted.bind(this));
	};

	/**
	 * Returns an array containing the selected UploadSetItems.
	 * @returns {sap.m.upload.UploadSetItem[]} Array of all selected items
	 * @public
	 * @since 1.100.0
	 */
	 UploadSet.prototype.getSelectedItems = function() {
		var aSelectedListItems = this._oList.getSelectedItems();
		return this._getUploadSetItemsByListItems(aSelectedListItems);
	};

	/**
	 * Retrieves the currently selected UploadSetItem.
	 * @returns {sap.m.upload.UploadSetItem | null} The currently selected item or <code>null</code>
	 * @public
	 * @since 1.100.0
	 */
	UploadSet.prototype.getSelectedItem = function() {
		var oSelectedListItem = this._oList.getSelectedItem();
		if (oSelectedListItem) {
			return this._getUploadSetItemsByListItems([oSelectedListItem]);
		}
		return null;
	};

	/**
	 * Sets an UploadSetItem to be selected by ID. In single selection mode, the method removes the previous selection.
	 * @param {string} id The ID of the item whose selection is to be changed.
	 * @param {boolean} [select=true] The selection state of the item.
	 * @returns {this} this to allow method chaining
	 * @public
	 * @since 1.100.0
	 */
	 UploadSet.prototype.setSelectedItemById = function(id, select) {
		this._oList.setSelectedItemById(id + "-listItem", select);
		this._setSelectedForItems([this._getUploadSetItemById(id)], select);
		return this;
	};

	/**
	 * Selects or deselects the given list item.
	 * @param {sap.m.upload.UploadSetItem} uploadSetItem The item whose selection is to be changed. This parameter is mandatory.
	 * @param {boolean} [select=true] The selection state of the item.
	 * @returns {this} this to allow method chaining
	 * @public
	 * @since 1.100.0
	 */
	 UploadSet.prototype.setSelectedItem = function(uploadSetItem, select) {
		return this.setSelectedItemById(uploadSetItem.getId(), select);
	};

	/**
	 * Select all items in "MultiSelection" mode.
	 * @returns {this} this to allow method chaining
	 * @public
	 * @since 1.100.0
	 */
	 UploadSet.prototype.selectAll = function() {
		var aSelectedList = this._oList.selectAll();
		if (aSelectedList.getItems().length !== this.getItems().length) {
			Log.info("Internal 'List' and external 'UploadSet' are not in sync.");
		}
		this._setSelectedForItems(this.getItems(), true);
		return this;
	};

	/**
	 * Opens the FileUploader dialog. When an UploadSetItem is provided, this method can be used to update a file with a new version.
	 * @param {sap.m.upload.UploadSetItem} item The UploadSetItem to update with a new version. This parameter is mandatory.
	 * @returns {this} this to allow method chaining
	 * @since 1.103.0
	 * @public
	 */
	 UploadSet.prototype.openFileDialog = function(item) {
		if (this._oFileUploader) {
			if (item) {
				if (!this._oFileUploader.getMultiple()) {
					this._oItemToUpdate = item;
					this._oFileUploader.$().find("input[type=file]").trigger("click");
				} else {
					Log.warning("Version Upload cannot be used in multiple upload mode");
				}
			} else {
				this._oFileUploader.$().find("input[type=file]").trigger("click");
			}
		}
		return this;
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
			"readyState": oResponseXHRParams.readyState,
			"status": oResponseXHRParams.status,
			"headers": oResponseXHRParams.headers
		};
		oItem.setProgress(100);
		if (this._oItemToUpdate && this.getInstantUpload()) {
			this.removeAggregation('items', this._oItemToUpdate, false);
		}
		this.insertItem(oItem, 0);
		oItem.setUploadState(UploadState.Complete);
		this._oItemToUpdate = null;
		this.fireUploadCompleted(oXhrParams);
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
			oFile = UploadSetItem._splitFileName(sOrigFullFileName),
			oSourceItem = UploadSetItem._findById(oItem.getId(), this._getAllItems());

		// get new/changed file name and remove potential leading spaces
		if (oEdit !== null) {
			sNewFileName = oEdit.getValue().trim();
		}
		oEdit.focus();

		if (!sNewFileName || sNewFileName.length === 0) {
			oItem._setContainsError(true);
			return;
		}

		if (oFile.name === sNewFileName) {
			this._removeErrorStateFromItem(this, oSourceItem);
			// nothing changed -> nothing to do!
			oItem._setInEditMode(false);
			this.fireAfterItemEdited({item: oItem});
			this._oEditedItem = null;
			return;
		}

		if (!this.getSameFilenameAllowed() && UploadSetItem._checkDoubleFileName(oEdit.getValue() + "." + oFile.extension, this._getAllItems())) {
			oEdit.setValueStateText(this._oRb.getText("UPLOAD_SET_FILE_NAME_EXISTS"));
			oEdit.setProperty("valueState", "Error", true);
			oEdit.setShowValueStateMessage(true);
		} else {
			sNewFullName = oFile.extension ? sNewFileName + "." + oFile.extension : sNewFileName;
			oItem.setFileName(sNewFullName);
			this._removeErrorStateFromItem(this, oSourceItem);
			oItem._setInEditMode(false);
			this.fireFileRenamed({item: oItem});
		}

		this._oEditedItem = null;
		this.invalidate();
	};

	/**
	 * Removes the error state from the list item. Used when the name of the file has been corrected.
	 * @private
	 * @param {object} oContext The UploadSet instance on which an attempt was made to save a new name of an existing List item.
	 * @param {sap.m.upload.UploadSetItem} oItem The List item on which the event was triggered.
	 */
	UploadSet.prototype._removeErrorStateFromItem = function(oContext, oItem) {
		oItem.errorState = null;
		oContext.sErrorState = null;
		oContext.editModeItem = null;
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
		this.fireAfterItemRemoved({item: this._oItemToBeDeleted});
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
		if (oEvent.target === this._$DragDropArea[0] && this.getUploadEnabled()) {
			this._$DragDropArea.addClass("sapMUCDropIndicator");
		}
	};

	UploadSet.prototype._onDragLeaveSet = function (oEvent) {
		if (oEvent.target === this._$DragDropArea[0] && this.getUploadEnabled()) {
			this._$DragDropArea.removeClass("sapMUCDropIndicator");
		}
	};

	UploadSet.prototype._onDragOverSet = function (oEvent) {
		oEvent.preventDefault();
	};

	UploadSet.prototype._onDropOnSet = function (oEvent) {
		var oFiles;

		oEvent.preventDefault();
		if (oEvent.target === this._$DragDropArea[0] && this.getUploadEnabled()) {
			this._$DragDropArea.removeClass("sapMUCDropIndicator");
			this._$DragDropArea.addClass("sapMUCDragDropOverlayHide");

			oFiles = oEvent.originalEvent.dataTransfer.files;
			this._processNewFileObjects(oFiles);
		}
	};

	UploadSet.prototype._onDragEnterBody = function (oEvent) {
		if (this.getUploadEnabled()) {
			this._oLastEnteredTarget = oEvent.target;
			this._$DragDropArea.removeClass("sapMUCDragDropOverlayHide");
		}
	};

	UploadSet.prototype._onDragLeaveBody = function (oEvent) {
		if (this._oLastEnteredTarget === oEvent.target && this.getUploadEnabled()) {
			this._$DragDropArea.addClass("sapMUCDragDropOverlayHide");
		}
	};

	UploadSet.prototype._onDragOverBody = function (oEvent) {
		oEvent.preventDefault();
		if (this.getUploadEnabled()) {
			this._$DragDropArea.removeClass("sapMUCDragDropOverlayHide");
		}
	};

	UploadSet.prototype._onDropOnBody = function (oEvent) {
		if (this.getUploadEnabled()) {
			this._$DragDropArea.addClass("sapMUCDragDropOverlayHide");
		}
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
				uploadState: UploadState.Ready
			});
			oItem._setFileObject(oFile);
			oItem.setFileName(oFile.name);//For handling curly braces in file name we have to use setter.Otherwise it will be treated as binding.

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
		if (oItem.sParentAggregationName === 'items') {
			// maps groups for each item if group configuration provided
			this._mapGroupForItem(oItem);
		}
		if (iIndex === 0) {
			this.getList().insertAggregation("items", oListItem, iIndex, true);
		} else {
			this.getList().addAggregation("items", oListItem, true);
		}
		this._checkRestrictionsForItem(oItem);
	};

	UploadSet.prototype._getImplicitUploader = function () {
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

	UploadSet.prototype._getActiveUploader = function () {
		return this.getUploader() || this._getImplicitUploader();
	};

	UploadSet.prototype._uploadItemIfGoodToGo = function (oItem) {
		if (oItem.getUploadState() === UploadState.Ready && !oItem._isRestricted()) {
			if (this.fireBeforeUploadStarts({item: oItem})) {
				var oHeaderFields = oItem.getHeaderFields().length ? oItem.getHeaderFields() : this.getHeaderFields();
				this._getActiveUploader().uploadItem(oItem, oHeaderFields);
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

	UploadSet.prototype._checkRestrictions = function () {
		// this will only check the restriction for the newly uploaded files
		// or files for which the upload is pending
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

		if (bMediaRestricted){
			this.fireMediaTypeMismatch({item: oItem});
		} else if (bFileRestricted){
			this.fireFileTypeMismatch({item: oItem});
		}
	};

	UploadSet.prototype._fireFileSizeExceed = function (oItem) {
		this.fireFileSizeExceeded({item: oItem});
	};

	UploadSet.prototype._fireFilenameLengthExceed = function (oItem) {
		this.fireFileNameLengthExceeded({item: oItem});
	};

	/**
	 * Sets the selected value for elements in given array to state of the given parameter. It also handles list specific rules
	 * @param {sap.m.ListItemBase[]} uploadSetItemsToUpdate The list items the selection state is to be set for
	 * @param {boolean} selected The new selection state
	 * @private
	 */
	 UploadSet.prototype._setSelectedForItems = function(uploadSetItemsToUpdate, selected) {
		//Reset all 'selected' values in UploadSetItems
		if (this.getMode() !== Library.ListMode.MultiSelect && selected) {
			var aUploadSetItems = this.getItems();
			for (var j = 0; j < aUploadSetItems.length; j++) {
				aUploadSetItems[j].setSelected(false);
			}
		}
		for (var i = 0; i < uploadSetItemsToUpdate.length; i++) {
			uploadSetItemsToUpdate[i].setSelected(selected);
		}
	};

	/**
	 * Returns UploadSetItem based on the items aggregation
	 * @param {string} uploadSetItemId used for finding the UploadSetItem
	 * @returns {sap.m.upload.UploadSetItem} The matching UploadSetItem
	 * @private
	 */
	 UploadSet.prototype._getUploadSetItemById = function(uploadSetItemId) {
		var aAllItems = this.getItems();
		for (var i = 0; i < aAllItems.length; i++) {
			if (aAllItems[i].getId() === uploadSetItemId) {
				return aAllItems[i];
			}
		}
		return null;
	};

	/**
	 * Returns an array of UploadSet items based on the items aggregation
	 * @param {sap.m.ListItemBase[]} listItems The list items used for finding the UploadSetItems
	 * @returns {sap.m.upload.UploadSetItem[]} The matching UploadSetItems
	 * @private
	 */
	 UploadSet.prototype._getUploadSetItemsByListItems = function(listItems) {
		var aUploadSetItems = [];
		var aLocalUploadSetItems = this.getItems();

		if (listItems) {
			for (var i = 0; i < listItems.length; i++) {
				for (var j = 0; j < aLocalUploadSetItems.length; j++) {
					if (listItems[i].getId() === aLocalUploadSetItems[j].getId() + "-listItem") {
						aUploadSetItems.push(aLocalUploadSetItems[j]);
						break;
					}
				}
			}
			return aUploadSetItems;
		}
		return null;
	};

	/**
	 * Destroy the items in the List.
	 * @private
	 */
	 UploadSet.prototype._clearGroupHeaders = function() {
		this.getList().getItems().forEach(function(oItem) {
			if (oItem.isGroupHeader()) {
				oItem.destroy(false);
			}
		});
	};

	/**
	 * Map group for item.
	 * @param {sap.m.upload.UploadSetItem} item The UploadSetItem to map group
	 * @private
	 */
	 UploadSet.prototype._mapGroupForItem = function(item) {
		var oItemsBinding = this.getBinding("items"),
			sModelName = this.getBindingInfo("items") ? this.getBindingInfo("items").oModel : undefined,
			fnGroupHeader = this.getBindingInfo("items") ? this.getBindingInfo("items").groupHeaderFactory : null;
		var fnGroup = function(oItem) {
			//Added sModelName to consider named model cases if empty default model is picked without checking model bind to items.
			return oItem.getBindingContext(sModelName) ? oItemsBinding.getGroup(oItem.getBindingContext(sModelName)) : null;
		};
		var fnGroupKey = function(item) {
			return fnGroup(item) && fnGroup(item).key;
		};

		if (oItemsBinding && oItemsBinding.isGrouped() && item) {
			if ( !this._aGroupHeadersAdded.some( function(group){ return group === fnGroupKey(item);} ) ) {
				if (fnGroupHeader) {
					this.getList().addItemGroup(fnGroup(item), fnGroupHeader(fnGroup(item)), true);
				} else if (fnGroup(item)) {
					this.getList().addItemGroup(fnGroup(item), null, true);
				}
				this._aGroupHeadersAdded.push(fnGroupKey(item));
			}
		}
	};

	/**
	 * Fills list with uploadSet items.
	 * @param {sap.m.upload.UploadSetItem[]} aItems The UploadSetItems the internal list is to be filled with
	 * @private
	 */
	UploadSet.prototype._fillListWithUploadSetItems = function (aItems){
		var that = this;
		aItems.forEach(function(item, index) {
			item._reset();
			that._projectToNewListItem(item, true);
			that._refreshInnerListStyle();
		});
	};

	/**
	 * Provides the position of the placeholder for the FileUploader, that every toolbar must have if it is provided by the application.
	 * @param {sap.m.OverflowToolbar} toolbar Toolbar where the placeholder can be found.
	 * @return {int} The position of the placeholder or -1 if there's no placeholder.
	 * @private
	 */
	 UploadSet.prototype._getFileUploaderPlaceHolderPosition = function(toolbar) {
		for (var i = 0; i < toolbar.getContent().length; i++) {
			if (toolbar.getContent()[i] instanceof UploadSetToolbarPlaceholder) {
				return i;
			}
		}
		return -1;
	};

	/**
	 * Inserts the given FileUploader object into the current Toolbar at the position of the placeholder.
	 * @param {sap.ui.unified.FileUploader} fileUploader The FileUploader object to insert into the Toolbar
	 * @private
	 */
	 UploadSet.prototype._setFileUploaderInToolbar = function(fileUploader) {
		this._oToolbar.getContent()[this._iFileUploaderPH].setVisible(false);
		this._oToolbar.insertContent(fileUploader, this._iFileUploaderPH);
	};

	/**
	 * Returns CloudFile picker button
	 * @return {sap.m.Button} CloudPicker button
	 * @private
	 */
	 UploadSet.prototype._getCloudFilePicker = function() {
		if (this.getCloudFilePickerEnabled()) {
			return new Button({
				text:  this.getCloudFilePickerButtonText() ? this.getCloudFilePickerButtonText() :  this._oRb.getText("UPLOAD_SET_DEFAULT_CFP_BUTTON_TEXT"),
				press: [this._invokeCloudFilePicker, this]
			});
		}
		return null;
	};

	/**
	 * Creates and invokes CloudFilePicker control instance
	 * @private
	 * @returns {Object} cloudFile picker instance
	 */
	 UploadSet.prototype._invokeCloudFilePicker = function() {
		 var oCloudFilePickerInstance = null;
		 if (this._cloudFilePickerControl) {
			oCloudFilePickerInstance = this._getCloudFilePickerInstance();
			oCloudFilePickerInstance.open();
		 } else {
			 // Dynamically load and cache CloudFilePicker control for first time
			 this._loadCloudFilePickerDependency()
			 .then(function(cloudFilePicker){
				this._cloudFilePickerControl = cloudFilePicker;
				oCloudFilePickerInstance = this._getCloudFilePickerInstance();
				oCloudFilePickerInstance.open();
			 }.bind(this))
			 .catch(function(error) {
				 Log.error(error);
			 });
		 }
		return oCloudFilePickerInstance;
	};

	/**
	 * Event handler for CloudFile picker selector
	 * @param {Object} oEvent CloudFile picker file selection DOM change event
	 * @private
	 */
	UploadSet.prototype._onCloudPickerFileChange = function(oEvent) {

		var mParameters = oEvent.getParameters();
		var aFiles = [];
		if (mParameters && mParameters.selectedFiles) {
			mParameters.selectedFiles.forEach(function (file) {
				aFiles.push(this._createFileFromCloudPickerFile(file));
			}.bind(this));
		}

		// invoking this method to handle file uploads
		this._processNewCloudPickerFileObjects(aFiles);
	};

	/**
	 * Creates file object that is to be uploaded from the CloudFilePicker file object
	 * @param {sap.suite.ui.commons.CloudFileInfo} oCloudFile CloudFilepicker file object
	 * @returns {Object} file metadata with file object and fileshare properties
	 * @private
	 */
	UploadSet.prototype._createFileFromCloudPickerFile = function(oCloudFile) {
		var parts = [new Blob([])];
		var oFileMetaData = {
			type: oCloudFile.getFileShareItemContentType(),
			size: oCloudFile.getFileShareItemContentSize(),
			webkitRelativePath: '',
			name: oCloudFile.getFileShareItemName()
		};
		var oFile = new File(parts, oCloudFile.getFileShareItemName(), oFileMetaData);
		return {
			file: oFile,
			fileShareProperties: oCloudFile.mProperties
		};
	};

	/**
	 * Maps the UploadSetItem with fileShare properties from the CloudFilePicker
	 * @param {sap.m.UploadSetItem} oItem UploadSetItem to be mapped
	 * @param {Object} oFileShareItem fileshare properties used for mapping
	 * @private
	 */
	UploadSet.prototype._mapFileShareItemToUploadSetItem = function(oItem, oFileShareItem) {
		oItem.setFileName(oFileShareItem.fileShareItemName);
		oItem.setUrl(oFileShareItem.fileShareItemContentLink);
	};

	/**
	 * Processing and uploading of file objects selected from the CloudFilePicker
	 * @param {Array} oFiles File metadata list containing file to be uploaded and fileshare properties used for mapping
	 * @private
	 */
	UploadSet.prototype._processNewCloudPickerFileObjects = function (oFiles) {
		var	oItem;

		oFiles.forEach(function (oFileMetaData) {
			var oFile = oFileMetaData.file,
			oFileShareProperties = oFileMetaData.fileShareProperties;
			oItem = new UploadSetItem({
				uploadState: UploadState.Ready
			});
			if (oFileShareProperties && oFileShareProperties !== null) {
				// invoked and each selected file to map the fileshare properties to uploadsetItem to be uploaded
				this._mapFileShareItemToUploadSetItem(oItem, oFileShareProperties);
			}
			oItem._setFileObject(oFile);
			oItem.setFileName(oFile.name);//For handling curly braces in file name we have to use setter.Otherwise it will be treated as binding.

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

	/**
	 * Dynamically require CloudFilePicker Control
	 * @returns {Promise} Promise that resolves on sucessful load of CloudFilePicker control
	 * @private
	 */
	UploadSet.prototype._loadCloudFilePickerDependency = function() {
		return new Promise(function (resolve, reject) {
			Core.loadLibrary("sap.suite.ui.commons", { async: true })
				.then(function() {
					sap.ui.require(["sap/suite/ui/commons/CloudFilePicker"], function(cloudFilePicker) {
						resolve(cloudFilePicker);
					}, function (error) {
						reject(error);
					});
				})
				.catch(function () {
					reject("CloudFilePicker Control not available.");
				});
		});
	};

	/**
	 * Creates CloudFilePicker Instance
	 * @returns {sap.suite.ui.commons.CloudFilePicker} CloudFilePicker instance
	 * @private
	 */
	UploadSet.prototype._getCloudFilePickerInstance = function() {
		return new this._cloudFilePickerControl({
			serviceUrl: this.getCloudFilePickerServiceUrl(),
			confirmButtonText: this._oRb.getText("SELECT_PICKER_TITLE_TEXT"),
			title: this._oRb.getText("SELECT_PICKER_TITLE_TEXT"),
			fileNameMandatory: true,
			enableDuplicateCheck:this.getSameFilenameAllowed(),
			select: this._onCloudPickerFileChange.bind(this)
		});
	};

	return UploadSet;
});