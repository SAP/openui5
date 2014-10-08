/*!
 * ${copyright}
 */

// Provides control sap.m.UploadCollection.
sap.ui.define(['jquery.sap.global', './MessageBox', './MessageToast', './library', 'sap/ui/core/Control', 'sap/ui/unified/library'],
	function(jQuery, MessageBox, MessageToast, library, Control, library1) {
	"use strict";


	
	/**
	 * Constructor for a new UploadCollection.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control allows users to upload single or multiple files from their device (desktop PC, tablet or phone) and attach them into the application.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.26
	 * @name sap.m.UploadCollection
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UploadCollection = Control.extend("sap.m.UploadCollection", /** @lends sap.m.UploadCollection.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * The chosen files will be checked against an array of file types. If at least one file does not fit the file type restriction the upload is prevented.
			 * Example: ["jpg", "png", "bmp"].
			 */
			fileType : {type : "string[]", group : "Data", defaultValue : null},
	
			/**
			 * The maximum length of a file name. If the maximum file name length is exceeded, the corresponding event 'filenameLengthExceed' is fired.
			 */
			maximumFilenameLength : {type : "int", group : "Data", defaultValue : null},
	
			/**
			 * A file size limit in bytes which prevents the upload if at least one file exceeds it. This property is not supported by Internet Explorer 8 and 9.
			 */
			maximumFileSize : {type : "int", group : "Data", defaultValue : null},
	
			/**
			 * The chosen files will be checked against an array of mime types. If at least one file does not fit the mime type restriction, the upload is prevented. This property is not supported by Internet Explorer 8 and 9.
			 * Example: mimeType ["image/png", "image/jpeg"].
			 */
			mimeType : {type : "string[]", group : "Data", defaultValue : null},
	
			/**
			 * Allows multiple files to be chosen and uploaded from the same folder. This property is not supported by Internet Explorer 8 and 9.
			 */
			multiple : {type : "boolean", group : "Behavior", defaultValue : false},
	
			/**
			 * This property allowes upload of more than one file with the same file name. A typical use case would be if the files have different paths.
			 */
			sameFilenameAllowed : {type : "boolean", group : "Behavior", defaultValue : false},
	
			/**
			 * This property enables an upload of a file.
			 */
			uploadEnabled : {type : "boolean", group : "Behavior", defaultValue : true},
	
			/**
			 * If set to "true", the upload immediately starts after file selection. With the default setting, the upload needs to be explicitly triggered.
			 */
			uploadOnChange : {type : "boolean", group : "Behavior", defaultValue : true},
	
			/**
			 * The URL where the uploaded files have to be stored.
			 */
			uploadUrl : {type : "string", group : "Data", defaultValue : "../../../upload"}
		},
		aggregations : {
	
			/**
			 * Uploaded items.
			 */
			items : {type : "sap.m.UploadCollectionItem", multiple : true, singularName : "item"}, 
	
			/**
			 * The header parameters for the FileUploader which are only submitted with XHR requests. Header parameters are not supported by Internet Explorer 8 and 9.
			 */
			headerParameters : {type : "sap.m.UploadCollectionParameter", multiple : true, singularName : "headerParameter"}, 
	
			/**
			 * The parameters for the FileUploader which are rendered as a hidden input field.
			 */
			parameters : {type : "sap.m.UploadCollectionParameter", multiple : true, singularName : "parameter"}
		},
		events : {
	
			/**
			 * Event is fired when a file delete event occurs - typically by clicking at the delete icon.
			 */
			fileDeleted : {
				parameters : {
	
					/**
					 * An unique Id of the attached document.
					 */
					documentId : {type : "string"}
				}
			}, 
	
			/**
			 * Event is fired when the filename of a chosen file is longer than the value specified with the maximumFilenameLength property (only if provided by the application).
			 */
			filenameLengthExceed : {
				parameters : {
	
					/**
					 * An unique Id of the attached document.
					 */
					documentId : {type : "string"}
				}
			}, 
	
			/**
			 * Event is fired when the file name was changed.
			 */
			fileRenamed : {
				parameters : {
	
					/**
					 * An unique Id of the attached document.
					 */
					documentId : {type : "string"}
				}
			}, 
	
			/**
			 * Event is fired when the file size of an uploaded file was exceed (only in case if property maxFileSize was provided by the application). This event is not supported by Internet Explorer 8 and 9.
			 */
			fileSizeExceed : {
				parameters : {
	
					/**
					 * An unique Id of the attached document.
					 */
					documentId : {type : "string"}, 
	
					/**
					 * The size in MB of a file to be uploaded.
					 */
					fileSize : {type : "string"}
				}
			}, 
	
			/**
			 * Event is fired when the file type or the MIME type don't match the allowed types (only in case if property property fileType, resp. mimeType were provided by the application).
			 */
			typeMissmatch : {
				parameters : {
	
					/**
					 * An unique Id of the attached document.
					 */
					documentId : {type : "string"}, 
	
					/**
					 * File type.
					 */
					fileType : {type : "string"}, 
	
					/**
					 * Mime type.
					 */
					mimeType : {type : "string"}
				}
			}, 
	
			/**
			 * Event is fired as soon as the upload request is completed (either successful or unsuccessful).
			 */
			uploadComplete : {
				parameters : {
	
					/**
					 * Ready state XHR.
					 */
					readyStateXHR : {type : "string"}, 
	
					/**
					 * Response.
					 */
					response : {type : "string"}, 
	
					/**
					 * Status.
					 */
					status : {type : "string"}
				}
			}
		}
	}});
	
	/*!
	 * (c) Copyright 2009-2014 SAP SE. All rights reserved
	 */
	/**
	 * This file defines behavior for the control
	 */
	
	UploadCollection.prototype.init = function() {
		sap.ui.getCore().loadLibrary("sap.ui.layout");
		UploadCollection.prototype._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._oList = new sap.m.List(this.getId() + "-list", {
		});
	};
	
	/* =========================================================== */
	/* Lifecycle methods                                           */
	/* =========================================================== */
	/**
	 * Required adaptations before rendering.
	 *
	 * @private
	 * @name sap.m.UploadCollection#onBeforeRendering
	 * @function
	 */
	UploadCollection.prototype.onBeforeRendering = function() {
		if (!this.aItems || (this.aItems !== this.getItems())) {
			this.aItems = this.getItems();
			var oNumberOfAttachmentsLabel = this._getNumberOfAttachmentsLabel(this.aItems.length);
			if (!this.oHeaderToolbar) {
				this.oHeaderToolbar = new sap.m.Toolbar(this.getId() + "-toolbar", {
					content : [oNumberOfAttachmentsLabel, new sap.m.ToolbarSpacer(), this._getFileUploader()]
				});
			} else {
				var oToolbarContent = this.oHeaderToolbar.getContent();
				oToolbarContent[0] = oNumberOfAttachmentsLabel;
				this.oHeaderToolbar.content = oToolbarContent;
			}
			this.oHeaderToolbar.addStyleClass("sapMUCListHeader");
		}
		this._clearList();
		this._fillList(this.aItems);
		this._oList.setHeaderToolbar(this.oHeaderToolbar);
	};
	
	/**
	 * Required adaptations after rendering.
	 *
	 * @private
	 * @name sap.m.UploadCollection#onAfterRendering
	 * @function
	 */
	UploadCollection.prototype.onAfterRendering = function() {
		
		var that = this;
		
		function handleFocusOut(oEvent) {
			that._onFocusOut(oEvent, that);
		}
		
		if (this.aItems || (this.aItems == this.getItems())) {
			var i;
			var iLength = this.aItems.length;
			for (i = 0; i < iLength; i++) {
				var sId = this.aItems[i].sId;
				if (this.aItems[i].status == "Edit") {
					var sFileNameId = sId + "-ta_editFileName-inner";
					var oObj = document.getElementById(sFileNameId);
					oObj.focus();
					oObj.select();
					oObj.addEventListener("focusout", handleFocusOut);
				}
			}
		}
	};
	
	UploadCollection.prototype._onFocusOut = function(oEvent, oContext) {
		var i;
	
		// change the status
		var iLength = oContext.aItems.length;
		for (i = 0; i < iLength; i++) {
			if (oContext.aItems[i].status == "Edit") {
				oContext.aItems[i].status = "Display";
	
				// trigger re-rendering!
				oContext.invalidate();
			}
		}
	};
	
	/**
	 * Cleans up before destruction.
	 * 
	 * @private
	 * @name sap.m.UploadCollection#exit
	 * @function
	 */
	UploadCollection.prototype.exit = function() {
		if (this._oList) {
			this._oList.destroy();
			this._oList = null;
		}
	};
	
	
	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */
	/**
	 * Map an item to the list item.
	 * 
	 * @param {sap.ui.core.Item}
	 *          oItem
	 * @returns {sap.m.CustomListItem | null}
	 * @private
	 * @name sap.m.UploadCollection#_mapItemToListItem
	 * @function
	 */
	UploadCollection.prototype._mapItemToListItem = function(oItem) {
		if (!oItem) {
			return null;
		}
		var sItemId = oItem.getId(),
			sStatus = oItem.status;
		var oBusyIndicator,
			oOkButton,
			oCancelButton,
			oEditButton,
			oDeleteButton,
			oFileNameLabel,
			oUploadedDateLabel,
			oProgressLabel,
			oTextDescriptionHL,
			oFileNameEditBox,
			oFileExtensionLabel,
			oItemIcon,
			sThumbnailUrl,
			oButtonsHL,
			oInputExtensionHL,
			oTextVL,
			oHL,
			oListItem,
			that = this;
	
		if (sStatus == "Uploading") {
			oBusyIndicator = new sap.m.BusyIndicator(sItemId + "-ia_indicator", {
				visible: true
			}).addStyleClass("sapMUCloadingIcon");
		}
	
		// /////////////////// ListItem Button Layout
		if (sStatus == "Edit") {
			oOkButton = new sap.m.Button({
				id : sItemId + "-okButton",
				text : "Ok",
				type : sap.m.ButtonType.Transparent,
				press : function(oEvent) {
					UploadCollection.prototype._onOk(oEvent, that);
				}
			}).addStyleClass("sapMUCOkBtn");
		}
	
		if (sStatus == "Edit") {
			oCancelButton = new sap.m.Button({
				id : sItemId + "-cancelButton",
				text : "Cancel",
				type : sap.m.ButtonType.Transparent
			}).addStyleClass("sapMUCCancelBtn");
		}
	
		if (sStatus == "Display") {
			oEditButton = new sap.m.Button({
				id : sItemId + "-editButton",
				icon : "sap-icon://edit",
				type : sap.m.ButtonType.Transparent,
				press : function(oEvent) {
					UploadCollection.prototype._onEdit(oEvent, that);
				}
			}).addStyleClass("sapMUCEditBtn");
		}
	
		if (sStatus == "Display" || sStatus == "Uploading") {
			oDeleteButton = new sap.m.Button({
				id : sItemId + "-deleteButton",
				icon : "sap-icon://sys-cancel",
				type : sap.m.ButtonType.Transparent,
				press : function(oEvent) {
					UploadCollection.prototype._onDelete(oEvent, that);
				}
			}).addStyleClass("sapMUCDeleteBtn");
		}
	
		oButtonsHL = new sap.ui.layout.HorizontalLayout(sItemId + "-ba_innerHL", {
			content : [oOkButton, oCancelButton, oEditButton, oDeleteButton],
			allowWrapping : false
		}).addStyleClass("sapMUCBtnHL");
	
		// if (bUploaded) {
		// this._oButtonsHL.addStyleClass("sapMFUBtnLoadedHL");
		// }
	
		// /////////////////// ListItem Text Layout
		if (sStatus == "Display" || sStatus == "Uploading") {
			oFileNameLabel = new sap.m.Link(sItemId + "-ta_filenameHL", {
				text : oItem.getFileName(),
				href : oItem.getUrl()
			}).addStyleClass("sapMUCFileName");
	
			if (sStatus == "Uploading"){
				oFileNameLabel.addStyleClass("sapMUCInner");
			}
		}
	
		if (sStatus == "Display") {
			oUploadedDateLabel = new sap.m.Label(sItemId + "-ta_date", {
				text : oItem.getUploadedDate() + " " + oItem.getContributor()
			});
		}
	
		if (sStatus == "Uploading") {
			oProgressLabel = new sap.m.Label(sItemId + "-ta_progress", {
				// var sProcent = "50%";
				text: "Placeholder for test"
				// text : this._oRb.getText("UPLOADCOLLECTION_UPLOADING", [sProcent]),
			}).addStyleClass("sapMUCProgress");
	//		if (sStatus == "Uploading") {
	//			oFileNameLabel.addStyleClass("sapMUCInner")
	//		}
		}
	
		if (sStatus == "Display" || sStatus == "Uploading") {
			oTextDescriptionHL = new sap.ui.layout.HorizontalLayout(sItemId + "-ta_descriptionHL", {
				content : [oUploadedDateLabel, oProgressLabel]
			}).addStyleClass("sapMUCDescriptionHL");
		}
	
		if (sStatus == "Edit") {
			oFileNameEditBox = new sap.m.Input(sItemId + "-ta_editFileName", {
				type : sap.m.InputType.Text,
				value : UploadCollection.prototype._getFileNameWithoutExtension(oItem.getFileName())
			}).addStyleClass("sapMUCEditBox");
	
			oFileNameEditBox.setLayoutData(new sap.m.FlexItemData({
				growFactor : 1
			}));
	
			oFileNameEditBox.attachChange(this._nameChanged, this);
		}
	
		if (sStatus == "Edit") {
			oFileExtensionLabel = new sap.m.Text(sItemId + "-extension", {
				text : "." + UploadCollection.prototype._getExtensionFromFilename(oItem.getFileName())
			}).addStyleClass("sapMUCExtension");
		}
	
		if (sStatus == "Edit") {
			oInputExtensionHL = new sap.m.HBox(sItemId + "-ta_extensionHL", {
				items : [oFileNameEditBox, oFileExtensionLabel]
			}).addStyleClass("sapMUCEditHL");
		}
	
		oTextVL = new sap.ui.layout.VerticalLayout(sItemId + "-ta_textVL", {
	//		content : [jQuery.proxy(this._determineIcon, this), oFileNameLabel, oInputExtensionHL, oTextDescriptionHL],
			content : [oFileNameLabel, oInputExtensionHL, oTextDescriptionHL],
			allowWrapping : true
		});
	
		// /////////////////// ListItem Icon
		if (sStatus == "Display" || sStatus == "Edit") {
			sThumbnailUrl = oItem.getThumbnailUrl();
			if (sThumbnailUrl) {
				oItemIcon = new sap.m.Image(sItemId + "-ia_imageHL", {
					src : UploadCollection.prototype._getThumbnail(sThumbnailUrl, oItem.getFileName())
				}).addStyleClass("sapMUCItemImage");
				oTextVL.addStyleClass("sapMUCTextPadding");
			} else {
				oItemIcon = new sap.ui.core.Icon(sItemId + "-ia_iconHL", {
					src : UploadCollection.prototype._getThumbnail(undefined, oItem.getFileName())
				}).addStyleClass("sapMUCItemIcon");
			}
		}
	
		// /////////////////// ListItem Horizontal Layout
		oHL = new sap.ui.layout.HorizontalLayout(sItemId + "-ta_HL", {
			content : [
			oBusyIndicator, oItemIcon, oTextVL, oButtonsHL],
			allowWrapping : false
		}).addStyleClass("sapMUCItemHL");
	
		// /////////////////// ListItem Template Definition
		oListItem = new sap.m.CustomListItem({
			content : [oHL]
		});
	
		// /////////////////// Add properties to the ListItem
		for ( var sPropertyName in oItem.mProperties) {
			if (oItem.mProperties.hasOwnProperty(sPropertyName)) {
				oListItem.mProperties[sPropertyName] = oItem.mProperties[sPropertyName];
			}
		}
	
		return oListItem;
	};
	
	/**
	 * Fill the list of items.
	 *
	 * @param {array} aItems An array with items type of sap.ui.core.Item.
	 * @private
	 * @name sap.m.UploadCollection#_fillList
	 * @function
	 */
	UploadCollection.prototype._fillList = function(aItems) {
		var that = this;
		var	iMaxIndex = aItems.length - 1;
	
		jQuery.each(aItems, function (iIndex, oItem) {
			if (!oItem.status) {
				//set default status value -> "Display"
				oItem.status = "Display";
			}
			// add a private property to the added item containing a reference
			// to the corresponding mapped item
			var oListItem = that._mapItemToListItem(oItem);
	
			if (iIndex == 0 && iMaxIndex == 0){
				oListItem.addStyleClass("sapMUCListSingleItem");
				jQuery.sap.log.debug("List item " + iIndex);
			} else if (iIndex == 0) {
				oListItem.addStyleClass("sapMUCListFirstItem");
				jQuery.sap.log.debug("List item " + iIndex);
			} else if (iIndex == iMaxIndex) {
				oListItem.addStyleClass("sapMUCListLastItem");
				jQuery.sap.log.debug("List item " + iIndex);
			} else {
				oListItem.addStyleClass("sapMUCListItem");
				jQuery.sap.log.debug("List item " + iIndex);
			}
	
			// add the mapped item to the List
			that._oList.addAggregation("items", oListItem, true); // note: suppress re-rendering
		});
	};
	
	/**
	 * Destroy the items in the List.
	 *
	 * @private
	 * @name sap.m.UploadCollection#_clearList
	 * @function
	 */
	UploadCollection.prototype._clearList = function() {
		if (this._oList) {
			this._oList.destroyAggregation("items", true);	// note: suppress re-rendering
		}
	};
	
	/**
	 * Access and initialization for label number of attachments.
	 *
	 * @private
	 * @name sap.m.UploadCollection#_getNumberOfAttachmentsLabel
	 * @function
	 */
	UploadCollection.prototype._getNumberOfAttachmentsLabel = function(items) {
		var nItems = items || 0;
		if (!this.oNumberOfAttachmentsLabel) {
			this.oNumberOfAttachmentsLabel = new sap.m.Label(this.getId() + "-numberOfAttachmentsLabel", {
				design : sap.m.LabelDesign.Standard,
				text : this._oRb.getText("UPLOADCOLLECTION_ATTACHMENTS", [nItems])
			});
		} else {
			this.oNumberOfAttachmentsLabel.setText(this._oRb.getText("UPLOADCOLLECTION_ATTACHMENTS", [nItems]));
		}
		return this.oNumberOfAttachmentsLabel;
	};
	
	//sap.m.UploadCollection.prototype._nameChanged = function(oEvent) {
	//	alert("Changed!");
	//};
	//sap.m.UploadCollection.prototype._handleDelete = function(oEvent) {
	//	alert("Deletion triggered!");
	//};
	
	/* =========================================================== */
	/* Handle UploadCollection events                              */
	/* =========================================================== */
	UploadCollection.prototype._onDelete = function(oEvent, oContext) {
		var oParams = oEvent.getParameters();
		var aItems = oContext.getModel().oData.items;
		var sItemId = oParams.id.split("-deleteButton")[0];
		var index = sItemId.split("-").pop();
		var bCompact = false;
	
		// popup delete file
		MessageBox.show(this._oRb.getText("UPLOADCOLLECTION_DELETE_TEXT", aItems[index].fileName), {
			title : this._oRb.getText("UPLOADCOLLECTION_DELETE_TITLE"),
			actions : [MessageBox.Action.OK, MessageBox.Action.CANCEL],
			onClose : function(oAction) {
				if (oAction === MessageBox.Action.OK) {
					// fire event
					oContext.fireFileDeleted({
						documentId : aItems[index].documentId
					});
				}
			},
			dialogId : "messageBoxDeleteFile",
			styleClass : bCompact ? "sapUiSizeCompact" : "" // TODO
		});
	};
	
	UploadCollection.prototype._onEdit = function(oEvent, oContext) {
		var i;
		var oParams = oEvent.getParameters();
		var sId = oParams.id;
	
		// get line id
		sId = sId.split("-editButton")[0];
	
		// change the status
		var iLength = oContext.aItems.length;
		for (i = 0; i < iLength; i++) {
			if (sId == oContext.aItems[i].sId) {
				oContext.aItems[i].status = "Edit";
	
				// trigger re-rendering!
				oContext.invalidate();
				continue;
			}
			if (oContext.aItems[i].status == "Edit") {
				oContext.aItems[i].status = "Display";
			}
		}
	};
	
	UploadCollection.prototype._onOk = function(oEvent, oContext) {
		var i;
		var oParams = oEvent.getParameters();
		var sId = oParams.id;
	
		// get line id
		sId = sId.split("-okButton")[0];
	
		// change the status
		var iLength = oContext.aItems.length;
		for (i = 0; i < iLength; i++) {
			if (sId == oContext.aItems[i].sId) {
				oContext.aItems[i].status = "Display";
	
				// trigger re-rendering!
				oContext.invalidate();
	
				break;
			}
		}
	};
	
	/* =========================================================== */
	/* Handle FileUploader events                                  */
	/* =========================================================== */
	UploadCollection.prototype._onUploadAborted = function(oEvent) {
		// TODO not implemented, call abort in FileUploader
	};
	
	UploadCollection.prototype._onUploadChange = function(oEvent) {
		// nothing to do
	};
	
	UploadCollection.prototype._onUploadComplete = function(oEvent) {
		this.fireUploadComplete(oEvent);
	};
	
	UploadCollection.prototype._onUploadFileAllowed = function(oEvent) {
		// nothing to do
	};
	
	UploadCollection.prototype._onUploadFileSizeExceed = function(oEvent){
		this.fireFileSizeExceed(oEvent);
		MessageToast.show(oEvent.getId());
	};
	UploadCollection.prototype._onUploadProgress = function(oEvent) {
		// TODO not implemented
	};
	
	UploadCollection.prototype._onUploadTypeMissmatch = function(oEvent) {
		this.fireTypeMissmatch(oEvent);
		MessageToast.show(oEvent.getId());
	};
	
	
	/**
	 * Access and initialization for the FileUploader
	 */
	UploadCollection.prototype._getFileUploader = function() {
	var that = this;
		if (!this._oFileUploader) {
			this._oFileUploader = new sap.ui.unified.FileUploader({
				buttonText : "Upload",
				enabled : this.getUploadEnabled(),
				fileType : this.getFileType(),
				maximumFilenameLength : this.getMaximumFilenameLength(),
				maximumFileSize : this.getMaximumFileSize(),
				mimeType : this.getMimeType(),
				multiple : this.getMultiple(),
				name : "uploadCollection",
				sameFilenameAllowed : this.getSameFilenameAllowed(),
				uploadOnChange : this.getUploadOnChange(),
				uploadUrl : this.getUploadUrl(),
				buttonOnly : true,
				sendXHR : true, // TODO check browser version (set true for all browser except IE8, IE9)
				uploadAborted : function(oEvent) { // only supported with property sendXHR set to true
					UploadCollection.prototype._onUploadAborted.apply(that, [oEvent]);
				},
				change : function(oEvent) {
					UploadCollection.prototype._onUploadChange.apply(that, [oEvent]);
				},
				uploadComplete : function(oEvent) {
					UploadCollection.prototype._onUploadComplete.apply(that, [oEvent]);
				},
				fileAllowed : function(oEvent) {
					UploadCollection.prototype._onUploadFileAllowed.apply(that, [oEvent]);
				},
				fileSizeExceed : function(oEvent) {
					UploadCollection.prototype._onUploadFileSizeExceed.apply(that, [oEvent]);
				},
				uploadProgress : function(oEvent) { // only supported with property sendXHR set to true
					UploadCollection.prototype._onUploadProgress.apply(that, [oEvent]);
				},
				typeMissmatch : function(oEvent) {
					UploadCollection.prototype._onUploadTypeMissmatch.apply(that, [oEvent]);
				}
			});
		}
		return this._oFileUploader;
	};
	
	/**
	 * Determines file mime type from the file extension. this is by no means an exhaustive list of mime types but these are the most common ones if a match is not found, the generic
	 * application/octet-stream is returned.
	 *
	 * @param sFilename
	 * @return {String}
	 * @private
	 */
	UploadCollection.prototype._getMimeTypeFromFilename = function(sFilename) {
		var sFileExtension = this._getExtensionFromFilename(sFilename);
	
		switch (sFileExtension) {
			case 'avi' :
				return 'video/avi';
			case 'bmp' :
				return 'image/bmp';
			case 'csv' :
				return 'text/csv';
			case 'doc' :
				return 'application/msword';
			case 'docm' : // Office Word 2007 macro-enabled document
				return 'application/vnd.ms-word.document.macroEnabled.12';
			case 'docx' : // Microsoft Office Word 2007 document
				return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
			case 'dotm' : // Office Word 2007 macro-enabled document template
				return 'application/vnd.ms-word.template.macroEnabled.12';
			case 'dotx' : // Office Word 2007 template
				return 'application/vnd.openxmlformats-officedocument.wordprocessingml.template';
			case 'gif' :
				return 'image/gif';
			case 'gzip' :
				return 'application/gzip';
			case 'html' :
				return 'text/html';
			case 'jpeg' :
			case 'jpg' :
				return 'image/jpeg';
			case 'mp3' :
				return 'audio/mpeg3';
			case 'mp4' :
				return 'video/mp4';
			case 'mpeg' :
				return 'video/mpeg';
			case 'msg' : // Outlook mail message
				return 'application/vnd.ms-outlook';
			case 'one' : // Microsoft Office OneNote 2007 section
			case 'onepkg' : // Office OneNote 2007 package'
			case 'onetmp' : // Office OneNote 2007 temporary file
			case 'onetoc2' : // Office OneNote 2007 TOC
				return 'application/msonenote';
			case 'pdf' :
				return 'application/pdf';
			case 'pjpeg' :
				return 'image/pjpeg';
			case 'png' :
				return 'image/png';
			case 'potm' : // Office PowerPoint 2007 macro-enabled presentation template
				return 'application/vnd.ms-powerpoint.template.macroEnabled.12';
			case 'potx' :
				return 'application/vnd.openxmlformats-officedocument.presentationml.template';
			case 'ppam' : // Office PowerPoint 2007 add-in
				return 'application/vnd.ms-powerpoint.addin.macroEnabled.12';
			case 'ppsm' : // Office PowerPoint 2007 macro-enabled slide show
				return 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12';
			case 'ppsx' : // Office PowerPoint 2007 slide show
				return 'application/vnd.openxmlformats-officedocument.presentationml.slideshow';
			case 'ppt' :
				return 'application/vnd.ms-powerpoint';
			case 'pptm' : // Office PowerPoint 2007 macro-enabled presentation
				return 'application/vnd.ms-powerpoint.presentation.macroEnabled.12';
			case 'pptx' :
				return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
			case 'sldm' : // Office PowerPoint 2007 macro-enabled slide
				return 'application/vnd.ms-powerpoint.slide.macroEnabled.12';
			case 'sldx' : // Office PowerPoint 2007 slide
				return 'application/vnd.openxmlformats-officedocument.presentationml.slide';
			case 'thmx' : // 2007 Office system release theme
				return 'application/vnd.ms-officetheme';
			case 'tif' :
			case 'tiff' :
				return 'image/tiff';
			case 'txt' :
				return 'text/plain';
			case 'wmv' :
				return 'audio/x-ms-wmv';
			case 'xhtml' :
				return 'application/xhtml+xml';
			case 'xlam' : // Office Excel 2007 add-in
				return 'application/vnd.ms-excel.addin.macroEnabled.12';
			case 'xls' :
				return 'application/vnd.ms-excel';
			case 'xlsb' : // Office Excel 2007 binary workbook
				return 'application/vnd.ms-excel.sheet.binary.macroEnabled.12';
			case 'xlsm' : // Office Excel 2007 macro-enabled workbook
				return 'application/vnd.ms-excel.sheet.macroEnabled.12';
			case 'xlsx' : // Microsoft Office Excel 2007 workbook
				return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
			case 'xltm' : // Office Excel 2007 macro-enabled workbook template
				return 'application/vnd.ms-excel.template.macroEnabled.12';
			case 'xltx' : // Office Excel 2007 template
				return 'application/vnd.openxmlformats-officedocument.spreadsheetml.template';
			case 'xml' :
				return 'text/xml';
			case 'zip' :
				return 'application/zip';
			default :
				return 'application/octet-stream';
		}
	};
	
	/**
	 * Determines the icon from the filename.
	 * 
	 * @param sFilename
	 * @return {String}
	 * @private
	 */
	UploadCollection.prototype._getIconFromFilename = function(sFilename) {
		var sFileExtension = this._getExtensionFromFilename(sFilename);
	
		switch (sFileExtension) {
			case 'bmp' :
			case 'jpg' :
			case 'png' :
				return 'sap-icon://attachment-photo';
			case 'csv' :
			case 'xls' :
			case 'xlsx' :
				return 'sap-icon://excel-attachment';
			case 'doc' :
			case 'docx' :
			case 'odt' :
				return 'sap-icon://doc-attachment';
			case 'pdf' :
				return 'sap-icon://pdf-attachment';
			case 'ppt' :
			case 'pptx' :
				return 'sap-icon://ppt-attachment';
			case 'txt' :
				return 'sap-icon://document-text';
			default :
				return 'sap-icon://document';
		}
	};
	
	/**
	 * Determines the thumbnail of an item.
	 *
	 * @param sThumbnailUrl
	 * @param sFilename
	 * @return {String}
	 * @private
	 */
	UploadCollection.prototype._getThumbnail = function(sThumbnailUrl, sFilename) {
		if (sThumbnailUrl) {
			return sThumbnailUrl;
		} else {
			return this._getIconFromFilename(sFilename);
		}
	};
	
	// ================================================================================
	// helpers
	// ================================================================================
	/**
	 * Determines extension from the file name.
	 */
	UploadCollection.prototype._getExtensionFromFilename = function(sFilename) {
		var aSplit = sFilename.split(".");
		return aSplit[aSplit.length - 1]; // the last part of the file name is expected to be the file extension
	};
	
	/**
	 * Determines name of the file without extension from filename.
	 */
	UploadCollection.prototype._getFileNameWithoutExtension = function(sFilename) {
		var aSplit = sFilename.split(".");
		return aSplit[0]; // the first part of the 'complete' file name is expected to be the name of the file
	};

	return UploadCollection;

}, /* bExport= */ true);
