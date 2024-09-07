/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Element",
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
	"sap/m/upload/UploadSetToolbarPlaceholder",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessageSize",
	"sap/ui/core/InvisibleText",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/MenuButton",
	"sap/ui/core/Lib"
], function(Control, Element, KeyCodes, Log, deepEqual, MobileLibrary, Button, Dialog, List, MessageBox, OverflowToolbar, StandardListItem, Text, ToolbarSpacer, FileUploader, UploadSetItem, Uploader, Renderer, UploaderHttpRequestMethod, DragDropInfo, DropInfo, UploadSetToolbarPlaceholder, IllustratedMessage, IllustratedMessageType, IllustratedMessageSize, InvisibleText, Menu, MenuItem, MenuButton, CoreLib) {
	"use strict";

	var UploadType = MobileLibrary.UploadType;
	var MenuButtonMode = MobileLibrary.MenuButtonMode;

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
				 * @deprecated Since version 1.121. Use illustratedMessage instead.
				 */
				noDataText: { type: "string", defaultValue: null, deprecated: true },
				/**
				 * Defines custom text for the 'No data' description label.
				 * @deprecated Since version 1.121. Use illustratedMessage instead.
				 */
				noDataDescription: { type: "string", defaultValue: null, deprecated: true },
				/**
				 * Determines which illustration type is displayed when the control holds no data.
				 * @deprecated Since version 1.121. Use illustratedMessage instead.
				 * @since 1.117
				 */
				noDataIllustrationType: { type: "sap.m.IllustratedMessageType", group: "Appearance", defaultValue: IllustratedMessageType.NoData, deprecated: true },
				/**
				 * Defines custom text for the drag and drop text label.
				 */
				dragDropText: {type: "string", defaultValue: null},
				/**
				 * Defines custom text for the drag and drop description label.
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
				mode: {type: "sap.m.ListMode", group: "Behavior", defaultValue: MobileLibrary.ListMode.MultiSelect},
				/**
				  * Enables CloudFile picker feature to upload files from cloud.
				  * @experimental Since 1.106.
				  */
				 cloudFilePickerEnabled: {type: "boolean", group: "Behavior", defaultValue: false},
				/**
				  * Url of the FileShare OData V4 service supplied for CloudFile picker control.
				  * @experimental Since 1.106.
				  */
				 cloudFilePickerServiceUrl: {type: "sap.ui.core.URI", group: "Data", defaultValue: ""},
				/**
				  * The text of the CloudFile picker button. The default text is "Upload from cloud" (translated to the respective language).
				  * @experimental Since 1.106.
				  */
				 cloudFilePickerButtonText: {type: 'string', defaultValue: ""},
				 /**
				  * Lets the user upload entire files from directories and sub directories.
				  * @since 1.107
				  */
				 directory: {type: "boolean", group: "Behavior", defaultValue: false}
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * Items representing files that have already been uploaded.
				 */
				items: {type: "sap.m.upload.UploadSetItem", defaultClass: UploadSetItem, multiple: true, singularName: "item"},
				/**
				 * Items representing files yet to be uploaded.
				 */
				incompleteItems: {type: "sap.m.upload.UploadSetItem", defaultClass: UploadSetItem, multiple: true, singularName: "incompleteItem"},
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
				 * @since 1.121
				 */
				illustratedMessage: { type: "sap.m.IllustratedMessage", multiple: false }
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
						readyState : {type : "int"},

						/**
					 	* Status of the XHR request.
					 	*
					 	* Required for receiving a <code>status</code> is to set the property <code>sendXHR</code> to true.
					 	* This property is not supported by Internet Explorer 9.
					 	*/
						status : {type : "int"},
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
						item: {type: "sap.m.upload.UploadSetItem"},

						/**
						 * The size of a file in MB, that fails to meet the file size restriction specified in the <code>maxFileSize</code> property.
						 * @since 1.128.0
						 */
						fileSize: {type: "float"}
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
		this._oRb = CoreLib.getResourceBundleFor("sap.m");

		this._oList = null;
		this._oEditedItem = null;
		this._oItemToBeDeleted = null;
		this._mListItemIdToItemMap = {};
		this._oUploadButton = null;
		this._oDragIndicator = false;
		this._initialIllustrationClone = true;

		// Drag&drop
		this._$Body = null;
		this._$DragDropArea = null;
		this._oLastEnteredTarget = null;

		this._aGroupHeadersAdded = [];
		this._iFileUploaderPH = null;
		this._oItemToUpdate = null;
		//Setting invisible text
		this._oInvisibleText = new InvisibleText();
		this._oInvisibleText.toStatic();
		this._oIllustratedMessage = this.getAggregation("illustratedMessage");
		if (!this._oIllustratedMessage) {
			this._oIllustratedMessage = new IllustratedMessage({
				illustrationType: IllustratedMessageType.NoData,
				illustrationSize: IllustratedMessageSize.Auto,
				title: this._oRb.getText("UPLOAD_SET_NO_DATA_TEXT"),
				description: this.getUploadEnabled() ? this._oRb.getText("UPLOADCOLLECTION_NO_DATA_DESCRIPTION") : " "
			});
		}
		this._oIllustratedMessage.addIllustrationAriaLabelledBy(this._oInvisibleText.getId());
		this.setAggregation("illustratedMessage", this._oIllustratedMessage);
		this._oInvisibleText.setText(this._oRb.getText("UPLOAD_SET_ILLUSTRATED_MESSAGE"));
		this._cloudFilePickerControl = null;
		this._oListEventDelegate = null;
		this.addDependent(this._oInvisibleText);
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
		if (this._oIllustratedMessage) {
			this._oIllustratedMessage.destroy();
			this._oIllustratedMessage = null;
		}
		if (this._oIllustratedMessageClone) {
			this._oIllustratedMessageClone.destroy();
			this._oIllustratedMessageClone = null;
		}
	};

	/* ===================== */
	/* Overriden API methods */
	/* ===================== */

	UploadSet.prototype.onBeforeRendering = function (oEvent) {
		if (this._oListEventDelegate) {
			this._oList.removeEventDelegate(this._oListEventDelegate);
			this._oListEventDelegate = null;
		}
		this._aGroupHeadersAdded = [];
		this._clearGroupHeaders();
		this._fillListWithUploadSetItems(this.getItems());
		if (this._initialIllustrationClone) {
			this._oIllustratedMessageClone = this.getAggregation("illustratedMessage").clone();
			this._initialIllustrationClone = false;
		}
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
				var oMarkerContainerDomRef =  this._oEditedItem.getListItem() ? this._oEditedItem.getListItem().getDomRef() : null;
				var oMarkerContainer = oMarkerContainerDomRef ? oMarkerContainerDomRef.querySelector(".sapMUSObjectMarkerContainer") : null;
				if (oMarkerContainer) {
					oMarkerContainer.setAttribute("style", "display: none");
				}
			}
		}
		this._oListEventDelegate = {
			onclick: function(event) {
				this._handleClick(event, this._oEditedItem);
			}.bind(this)
		};
		this._oList.addDelegate(this._oListEventDelegate);
		var aList = this.getList();
		if (this._bItemRemoved) {
			this._bItemRemoved = false;
			var aListItems = aList.getItems();
			if (aListItems.length > 0) {
				aListItems[0].focus();
			} else {
				aList.getDomRef().querySelector(".sapMUCNoDataPage").focus();
			}
		}
		var oNoDataDom = aList?.getDomRef()?.querySelector(".sapMUCNoDataPage");
		var iCurrentHeight = oNoDataDom?.offsetHeight;
		if (iCurrentHeight){
			oNoDataDom.style.height = iCurrentHeight + "px";
		}

		if (this.getCloudFilePickerEnabled()) {
			this._oFileUploader.addStyleClass("sapMUSTFileUploaderVisibility");
		}
	};

	/**
	 * Handling of 'click' of the list (items + header)
	 * @param {sap.ui.base.Event} oEvent Event of the 'click'
	 * @param {Object} item List item
	 * @private
	 */
	UploadSet.prototype._handleClick = function (oEvent, item) {
		var $Button = oEvent.target.closest("button");
		var sId = "";
		if ($Button) {
			sId = $Button.id;
		}
		if (sId.lastIndexOf("editButton") === -1) {
			if (sId.lastIndexOf("cancelButton") !== -1) {
				if (item) {
					this._handleItemEditCancelation(oEvent, item);
				}
			} else if (oEvent.target.id.lastIndexOf("thumbnail") < 0 && oEvent.target.id.lastIndexOf("icon") < 0 &&
				oEvent.target.id.lastIndexOf("deleteButton") < 0 && oEvent.target.id.lastIndexOf("fileNameEdit-inner") < 0) {
				if (item) {
					this._handleItemEditConfirmation(oEvent, item);
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
			oListItem = Element.getElementById(oEvent.target.id);
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
				}
				break;
			default:
				return;
		}
	};

	UploadSet.prototype.getToolbar = function () {
		if (!this._oToolbar) {
			var oUploader = this.getCloudFilePickerEnabled() ? this._getCloudFilePicker() : this.getDefaultFileUploader();
			this._oToolbar = this.getAggregation("toolbar");
			if (!this._oToolbar) {
				this._oToolbar = new OverflowToolbar(this.getId() + "-toolbar", {
					content: [this._oNumberOfAttachmentsTitle, new ToolbarSpacer(), oUploader]
				});
				this._iFileUploaderPH = 2;
				this.addDependent(this._oToolbar);
			} else {
				this._iFileUploaderPH = this._getFileUploaderPlaceHolderPosition(this._oToolbar);
				if (this._oToolbar && this._iFileUploaderPH > -1) {
					this._setFileUploaderInToolbar(oUploader);
				} else if (this._oToolbar) {
					// fallback position to add file uploader control if UploadSetToolbarPlaceHolder instance not found
					this._oToolbar.addContent(oUploader);
				}
			}
			if (this.getCloudFilePickerEnabled()) {
				this._oToolbar.addContent(this.getDefaultFileUploader());
			}
		}

		return this._oToolbar;
	};


	UploadSet.prototype._openFileUploaderPicker = function () {
		this._oFileUploader.oFileUpload.click();
	};

	UploadSet.prototype._openCloudFilePicker = function () {
		this._invokeCloudFilePicker();
	};

	UploadSet.prototype._itemSelectedCallback = function (oEvent) {
		var oItem = oEvent.getParameter("item");
		// eslint-disable-next-line default-case
		switch (oItem.getText()) {
			case this.getCloudFilePickerButtonText() ? this.getCloudFilePickerButtonText() : this._oRb.getText("UPLOAD_SET_DEFAULT_CFP_BUTTON_TEXT"):
				this._oMenuButton
					.detachEvent("defaultAction", this._openFileUploaderPicker.bind(this))
					.attachEvent("defaultAction", this._openCloudFilePicker.bind(this));

				this._openCloudFilePicker();
				this._oMenuButton.setText(oItem.getText());
				break;
			case this._oRb.getText("UPLOAD_SET_DEFAULT_LFP_BUTTON_TEXT"):
				this._oMenuButton
					.detachEvent("defaultAction", this._openCloudFilePicker.bind(this))
					.attachEvent("defaultAction", this._openFileUploaderPicker.bind(this));

				this._openFileUploaderPicker();
				this._oMenuButton.setText(oItem.getText());
				break;
		}
	};

	// Functions returns sNoDataText which is combination of Title and Description from the IllustratedMessage
	UploadSet.prototype._setListNoDataText = function (sText, bIsDescription) {
		var sNoDataText = "";
		var oIllustratedMessage = this.getAggregation("illustratedMessage");
		if (!sText) {
			sNoDataText = oIllustratedMessage.getTitle() + " " + this.getUploadEnabled() ? oIllustratedMessage.getDescription() : " ";
		} else if (sText) {
			if (bIsDescription) {
				sNoDataText = oIllustratedMessage.getTitle() + " " + sText;
			} else {
				sNoDataText = sText + " " + this.getUploadEnabled() ? oIllustratedMessage.getDescription() : " ";
			}
		}
		return sNoDataText;
	};

	UploadSet.prototype.getNoDataText = function () {
		var sNoDataText = this.getProperty("noDataText");
		sNoDataText = sNoDataText || this._oRb.getText("UPLOAD_SET_NO_DATA_TEXT");
		if (this._oList) {
			this._oList.setNoDataText(this._setListNoDataText(sNoDataText));
		}
		return sNoDataText;
	};

	UploadSet.prototype.getNoDataDescription = function () {
		var sNoDataDescription = this.getProperty("noDataDescription");
		sNoDataDescription = sNoDataDescription || this._oRb.getText("UPLOADCOLLECTION_NO_DATA_DESCRIPTION");
		if (this._oList) {
			this._oList.setNoDataText(this._setListNoDataText(sNoDataDescription, true));
		}
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
					// listItem should not be created if destruction started.
					oListItem = oObject.isDestroyStarted() ? oObject : oObject._getListItem();
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
			this.getDefaultFileUploader().setFileType(aTypes);
			this._checkRestrictions();
		}
		return this;
	};

	UploadSet.prototype.setMaxFileNameLength = function (iNewMax) {
		if (this.getMaxFileNameLength() !== iNewMax) {
			this.setProperty("maxFileNameLength", iNewMax, true);
			this.getDefaultFileUploader().setMaximumFilenameLength(iNewMax);
			this._checkRestrictions();
		}
		return this;
	};

	UploadSet.prototype.setMaxFileSize = function (iNewMax) {
		if (this.getMaxFileSize() !== iNewMax) {
			this.setProperty("maxFileSize", iNewMax, true);
			this.getDefaultFileUploader().setMaximumFileSize(iNewMax);
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
			this.getDefaultFileUploader().setMimeType(aTypes);
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
		if (bUploadButtonInvisible !== this.getUploadButtonInvisible()) {
			var bVisible = !bUploadButtonInvisible;
			this.getDefaultFileUploader().setVisible(bVisible);
			if (this._oUploadButton) {
				this._oUploadButton.setVisible(bVisible);
			}
			this.setProperty("uploadButtonInvisible", bUploadButtonInvisible, true);
		}
		return this;
	};

	UploadSet.prototype.setUploadEnabled = function (bEnable) {
		if (bEnable !== this.getUploadEnabled()) {
			this.getDefaultFileUploader().setEnabled(bEnable); // TODO: This can go, FileUploader doesn't upload anymore
			if (this._oUploadButton) {
				this._oUploadButton.setEnabled(bEnable);
			}
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

	UploadSet.prototype.setDirectory = function (bDirectory) {
		if (this.getDirectory() !== bDirectory) {
			this.setProperty("directory", bDirectory);
			this.getDefaultFileUploader().setDirectory(bDirectory);
			if (bDirectory) {
				this.setProperty("multiple", false); // disable multiple files selection when directory selection is enabled.
			}
		}
		return this;
	};

	UploadSet.prototype.setMode = function(sMode) {
		if (sMode === MobileLibrary.ListMode.Delete) {
			this.setProperty("mode", MobileLibrary.ListMode.None);
			Log.info("sap.m.ListMode.Delete is not supported by UploadSet. Value has been resetted to 'None'");
		} else if (sMode === MobileLibrary.ListMode.MultiSelect && !this.getInstantUpload()) {
			this.setProperty("mode", MobileLibrary.ListMode.None);
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
		var oAggregation = this.getAggregation("illustratedMessage");
		// Invoke rendering of illustrated message only when the list is empty else no scope of illustrated message.
		if (oAggregation && this._oList && this._oList.getItems && !this._oList.getItems().length) {
			if (this._getDragIndicator()) {
				oAggregation.setIllustrationType(IllustratedMessageType.UploadCollection);
				oAggregation.setTitle(this.getDragDropText());
				oAggregation.setDescription(this.getUploadEnabled() ? this.getDragDropDescription() : " ");
				oAggregation.removeAllAdditionalContent();
			} else {
				oAggregation.setIllustrationType(this._oIllustratedMessageClone.getIllustrationType());
				if (this._oIllustratedMessageClone.getTitle()) {
					oAggregation.setTitle(this._oIllustratedMessageClone.getTitle());
				} else {
					oAggregation.setTitle(this._oRb.getText("UPLOAD_SET_NO_DATA_TEXT"));
				}
				if (this._oIllustratedMessageClone.getDescription()) {
					oAggregation.setDescription(this.getUploadEnabled() ? this._oIllustratedMessageClone.getDescription() : " ");
				} else {
					oAggregation.setDescription(this.getUploadEnabled() ? this._oRb.getText("UPLOADCOLLECTION_NO_DATA_DESCRIPTION") : " ");
				}
				if (this._oIllustratedMessageClone.getAdditionalContent().length) {
					oAggregation.removeAllAdditionalContent();
					oAggregation.addAdditionalContent(new Button(this._oIllustratedMessageClone.getAdditionalContent()[0].mProperties));
				} else {
					oAggregation.addAdditionalContent(this.getUploadButtonForIllustratedMessage());
				}
			}
		}
		return oAggregation;
	};

	UploadSet.prototype.getUploadButtonForIllustratedMessage = function () {
		if (!this._oUploadButton) {
			var oAccIds = this.getAggregation("illustratedMessage").getAccessibilityReferences();
			var sTitleId = oAccIds.title;
			var sDescriptionId = oAccIds.description;
			this._oUploadButton = new Button({
				id: this.getId() + "-uploadButton",
				type: MobileLibrary.ButtonType.Standard,
				enabled: this.getUploadEnabled(),
				visible: !this.getUploadButtonInvisible(),
				text: this._oRb.getText("UPLOADCOLLECTION_UPLOAD"),
				ariaDescribedBy: [sTitleId,sDescriptionId],
				press: function () {
					var FileUploader = this.getDefaultFileUploader();
					FileUploader.$().find("input[type=file]").trigger("click");
				}.bind(this)
			});
		}

		return this._oUploadButton;
	};

	UploadSet.prototype.setUploadUrl = function (sUploadUrl) {
		this.setProperty("uploadUrl", sUploadUrl);
		if (this._oUploader) {
			this._oUploader.setUploadUrl(sUploadUrl);
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
				mode: this.getMode(),
				noDataText: this._setListNoDataText()
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
		this._oDragIndicator = true;
	this._getIllustratedMessage();
		if (oDraggedControl) {
			oEvent.preventDefault();
		}
	};

	UploadSet.prototype._onDropFile = function (oEvent) {
		this._oDragIndicator = false;
		this._getIllustratedMessage();
		oEvent.preventDefault();
		if (!this.getUploadEnabled()) {
			return;
		}
		var oItems = oEvent.getParameter("browserEvent").dataTransfer.items;
		oItems = Array.from(oItems);

		// Filtering out only webkitentries (files/folders system entries) by excluding non file / directory types.
		oItems = oItems.filter(function(item){
			return item.webkitGetAsEntry() ? true : false;
		});
		var aEntryTypes = oItems.map(function (oEntry) {
			var oWebKitEntry = oEntry.webkitGetAsEntry();
			return {
				entryType: oWebKitEntry && oWebKitEntry.isFile ? 'File' : 'Directory'
			};
		});
		// handlding multiple property drag & drop scenarios
		if (oItems && oItems.length > 1 && !this.getMultiple() && !this.getDirectory()) {
			// Handling drag and drop of multiple files to upload with multiple property set
			var sMessage = this._oRb.getText("UPLOADCOLLECTION_MULTIPLE_FALSE");
			Log.warning("Multiple files upload is retsricted for this multiple property set");
			MessageBox.error(sMessage);
			return;
		} else if (oItems && oItems.length > 1 && this.getMultiple() && !isFileOrFolderEntry('File', aEntryTypes)) {
			var sMessageDropFilesOnly = this._oRb.getText("UPLOAD_SET_DIRECTORY_FALSE");
			Log.warning("Multiple files upload is retsricted, drag & drop only files");
			MessageBox.error(sMessageDropFilesOnly);
			return;
		}

		// handling directory property drag & drop scenarios
		if (oItems && oItems.length && !this.getDirectory() && isFileOrFolderEntry('Directory', aEntryTypes)) {
			var sMessageDirectory = this._oRb.getText("UPLOAD_SET_DIRECTORY_FALSE");
			Log.warning("Directory of files upload is retsricted for this directory property set");
			MessageBox.error(sMessageDirectory);
			return;
		} else if (oItems && oItems.length && this.getDirectory() && !isFileOrFolderEntry('Directory', aEntryTypes)) {
			var sMessageDragDropDirectory = this._oRb.getText("UPLOAD_SET_DROP_DIRECTORY");
			Log.warning("Directory of files upload is retsricted, drag & drop only directories here.");
			MessageBox.error(sMessageDragDropDirectory);
			return;
		}
		if (oItems && oItems.length) {
			this._getFilesFromDataTransferItems(oItems).then(function (oFiles) {
				if (oFiles && oFiles.length) {
					this._processNewFileObjects(oFiles);
				}
			}.bind(this));
		}

		function isFileOrFolderEntry(sType, aEntries) {
			return aEntries.every(function (oEntry) {
				return oEntry.entryType === sType;
			});
		}
	};

	UploadSet.prototype._getFilesFromDataTransferItems = function (dataTransferItems) {
		var aFiles = [];
		return new Promise(function (resolve, reject) {
			var aEntriesPromises = [];
			for (var i = 0; i < dataTransferItems.length; i++) {
				aEntriesPromises.push(traverseFileTreePromise(dataTransferItems[i].webkitGetAsEntry()));
			}
			Promise.all(aEntriesPromises)
				.then(function (entries) {
					resolve(aFiles);
				}, function(err) {
					reject(err);
				});
		});

		function traverseFileTreePromise(item) {
			return new Promise(function (resolve, reject) {
				if (item.isFile) {
					item.file(function (oFile) {
						aFiles.push(oFile);
						resolve(oFile);
					}, function(err){
						reject(err);
					});
				} else if (item.isDirectory) {
					var dirReader = item.createReader();
					dirReader.readEntries(function (entries) {
						var aEntriesPromises = [];
						for (var i = 0; i < entries.length; i++) {
							aEntriesPromises.push(traverseFileTreePromise(entries[i]));
						}
						resolve(Promise.all(aEntriesPromises));
					});
				}
			});
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
				maximumFilenameLength: this.getMaxFileNameLength(),
				maximumFileSize: this.getMaxFileSize(),
				icon: "",
				iconFirst: false,
				multiple: this.getDirectory() ? false : this.getMultiple(),
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
				visible: !this.getUploadButtonInvisible(),
				directory: this.getDirectory()
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
		if (!this.isBound('items')){
			this.insertItem(oItem, 0);
		}
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
			this._oEditedItem = UploadSetItem._findById(this._oEditedItem.getId(), this._getAllItems());
			this._handleItemEditConfirmation(oEvent, this._oEditedItem);
		}
		// If editing of current item could not be finished then editing of another item cannot start
		if (!this._oEditedItem) {
			if (this.fireBeforeItemEdited({item: oItem})) {
				this._oEditedItem = UploadSetItem._findById(oItem.getId(), this._getAllItems());
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
	 * @param {sap.m.upload.UploadSetItem} oItem Item whose editing is to be confirmed.
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
			oEdit.setValueStateText(this._oRb.getText("UPLOAD_SET_TYPE_FILE_NAME"));
			oEdit.setProperty("valueState", "Error", true);
			oEdit.setShowValueStateMessage(true);
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
		if (!this.getSameFilenameAllowed() && UploadSetItem._checkDoubleFileName(sNewFileName + "." + oFile.extension, this._getAllItems())) {
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
	 * @param {sap.m.upload.UploadSetItem} oItem Item whose editing is to be canceled.
	 * @private
	 */
	UploadSet.prototype._handleItemEditCancelation = function (oEvent, oItem) {
		oItem._setContainsError(false);
		oItem._setInEditMode(false);
		this._oEditedItem = null;
	};

	UploadSet.prototype.handleItemGetDisabled = function (oItem) {
		if (!this._oEditedItem || this._oEditedItem.getId() !== oItem.getId()) {
			return;
		}
		this._handleItemEditCancelation(null, oItem);
	};

	UploadSet.prototype._handleItemDelete = function (oEvent, oItem) {
		var sMessageText;

		if (this._oEditedItem) {
			this._oEditedItem = UploadSetItem._findById(this._oEditedItem.getId(), this._getAllItems());
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
		this._oItemToBeDeleted = UploadSetItem._findById(oItem.getId(), this._getAllItems());
		MessageBox.warning(sMessageText, {
			id: this.getId() + "-deleteDialog",
			title: this._oRb.getText("UPLOAD_SET_DELETE_TITLE"),
			actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
			onClose: this._handleClosedDeleteDialog.bind(this),
			dialogId: "messageBoxDeleteFile",
			styleClass: this.hasStyleClass("sapUiSizeCompact") ? "sapUiSizeCompact" : "",
			emphasizedAction: MessageBox.Action.DELETE
		});
	};

	UploadSet.prototype._handleClosedDeleteDialog = function (sAction) {
		if (sAction !== MessageBox.Action.DELETE) {
			return;
		}
		if (!this.isBound("items")){
			this.removeItem(this._oItemToBeDeleted);
			this.removeIncompleteItem(this._oItemToBeDeleted);
		}
		this.fireAfterItemRemoved({item: this._oItemToBeDeleted});
		this._oItemToBeDeleted = null;
		this._bItemRemoved = true;
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
						type: MobileLibrary.ButtonType.Emphasized,
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
		oItem.attachEvent("selected", this._handleItemSetSelected, this); // capturing selected event to set selected status to CustomListItem
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

		var parts = [new Blob([])];
			var oFileMetaData = {
				type: oItem.getParameter('fileType'),
				webkitRelativePath: '',
				name: oItem.getParameter('fileName')
			};
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
		var oSendItem = new UploadSetItem();
		oSendItem.setFileName(oItem.getParameter('fileName'));
		this.fireFileSizeExceeded({item: oSendItem, fileSize: oItem.getParameter("fileSize") });
	};

	UploadSet.prototype._fireFilenameLengthExceed = function (oItem) {
		var oSendItem = new UploadSetItem();
		oSendItem.setFileName(oItem.getParameter('fileName'));
		this.fireFileNameLengthExceeded({item: oSendItem});
	};

	/**
	 * Sets the selected value for elements in given array to state of the given parameter. It also handles list specific rules
	 * @param {sap.m.ListItemBase[]} uploadSetItemsToUpdate The list items the selection state is to be set for
	 * @param {boolean} selected The new selection state
	 * @private
	 */
	 UploadSet.prototype._setSelectedForItems = function(uploadSetItemsToUpdate, selected) {
		//Reset all 'selected' values in UploadSetItems
		if (this.getMode() !== MobileLibrary.ListMode.MultiSelect && selected) {
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
			sModelName = this.getBindingInfo("items") ? this.getBindingInfo("items").model : undefined,
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
			// resetting the state of the item from edit state.
			if (item && !item.getVisibleEdit() && (that._oEditedItem && that._oEditedItem.getId() === item.getId()) ) {
				item._setInEditMode(false);
			}
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
	 * Returns CloudFile picker menu button
	 * @return {sap.m.MenuButton} CloudPicker & LocalFileUpload Menu button
	 * @private
	 */
	UploadSet.prototype._getCloudFilePicker = function () {
		if (this.getCloudFilePickerEnabled()) {
			this._oMenuButton = new MenuButton({
				text: this._oRb.getText("UPLOAD_SET_DEFAULT_LFP_BUTTON_TEXT"),
				buttonMode: MenuButtonMode.Split,
				menu: this._getMenuButtonItems(),
				defaultAction: this._openFileUploaderPicker.bind(this)
			});
			return this._oMenuButton;
		}
		return null;
	};

	UploadSet.prototype._getMenuButtonItems = function () {
		return new Menu({
			items: [
				new MenuItem({ text: this._oRb.getText("UPLOAD_SET_DEFAULT_LFP_BUTTON_TEXT") }),
				new MenuItem({ text: this.getCloudFilePickerButtonText() ? this.getCloudFilePickerButtonText() : this._oRb.getText("UPLOAD_SET_DEFAULT_CFP_BUTTON_TEXT") })
			],
			itemSelected: this._itemSelectedCallback.bind(this)
		});
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
			oItem._setUploadType(UploadType.Cloud);
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
			CoreLib.load("sap.suite.ui.commons")
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

	// Using UploadSet's dragleave abstract method with custom implementation to capture UploadSet dragleave event
	UploadSet.prototype.ondragleave = function (oEvent) {
		var oDragSession = oEvent.dragSession;
		// condition to reset the illustrated message to default message from drag & drop message on leaving the drop area.
		// getDropControl returns the valid drop target underneath the drop control, if no dropcontrol available UploadSet control to reset the illustrated message
		if (!oDragSession || !oDragSession.getDropControl() || (oDragSession && !oEvent.relatedTarget)) {
			this._oDragIndicator = false;
	  this._getIllustratedMessage();
		}
	};

	/**
	 * Handles the selected event of UploadSetItem.
	 * Used to synchronize the internal list with the given item. The ListItem has to be set to selected value too.
	 * Otherwise the internal sap.m.List and the UploadSetItem aggregation are not in sync.
	 * @param {sap.ui.base.Event} event The SAPUI5 event object
	 * @private
	 */
	UploadSet.prototype._handleItemSetSelected = function(event) {
		var oItem = event.getSource();
		if (oItem instanceof UploadSetItem) {
			var oListItem = this._getListItemById(oItem.getId() + "-listItem");
			if (oListItem) {
				oListItem.setSelected(oItem.getSelected());
			}
		}
	};

	/**
	 * Returns a CustomListItem instance rendered in the list using the id.
	 * @param {string} sID id of the Custom List item to be queried.
	 * @returns {sap.m.CustomListItem} The matching CustomList Item.
	 * @private
	 */
	UploadSet.prototype._getListItemById = function(sID) {
		const aListItems = this.getList()?.getItems();
		if (aListItems && aListItems.length && sID) {
			return aListItems.find((oListItem) => oListItem?.getId() === sID);
		}
		return null;
	};

	return UploadSet;
});