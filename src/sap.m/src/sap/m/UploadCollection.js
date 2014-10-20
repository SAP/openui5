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
	
//			/**
//			 * If set to "true", the upload immediately starts after file selection. With the default setting, the upload needs to be explicitly triggered.
//			 */
//			uploadOnChange : {type : "boolean", group : "Behavior", defaultValue : true},
	
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
			 * Event is fired when file(s) selected.
			 */
			change : {
				parameters : {
	
					/**
					 * An unique Id of the attached document.
					 */
					documentId : {type : "string"}
				}
			}, 
	
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
					documentId : {type : "string"},
			
					/**
					 * The new file name
					 */
					fileName : {type : "string"}
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
		sap.m.UploadCollection.prototype._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._oList = new sap.m.List(this.getId() + "-list", {
		});
		this._oList.addStyleClass("sapMUCList");
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
		this._oList.aDelegates = []; 

		if (this.aItems || (this.aItems == this.getItems())) {
			var oEditBox = document.getElementById(this.editModeItem + "-ta_editFileName-inner");
			if (this.editModeItem && !!oEditBox) {
				var sId = this.editModeItem;
				oEditBox.focus();
				oEditBox.select();
				this._oList.addDelegate({
					onclick: function(oEvent) {
						sap.m.UploadCollection.prototype._handleClick(oEvent, that, sId);
					}
				});
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
			sStatus = oItem.status,
			sFileNameLong = oItem.getFileName(),
			that = this,
			bEnabled = true;
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
			oListItem;

		if (sStatus == "Uploading") {
			oBusyIndicator = new sap.m.BusyIndicator(sItemId + "-ia_indicator", {
				visible: true
			}).setSize('2.5rem').addStyleClass("sapMUCloadingIcon");
		}

		// /////////////////// ListItem Button Layout
		if (sStatus == "Edit") {
			oOkButton = new sap.m.Button({
				id : sItemId + "-okButton",
				text : "Ok",
				type : sap.m.ButtonType.Transparent
			}).addStyleClass("sapMUCOkBtn");
			
			oCancelButton = new sap.m.Button({
				id : sItemId + "-cancelButton",
				text : "Cancel",
				type : sap.m.ButtonType.Transparent
			}).addStyleClass("sapMUCCancelBtn");
		}

		if (sStatus == "Display") {
			bEnabled = oItem.getEnableEdit();
			if (this.sErrorState == "Error"){
				bEnabled = false;
			}
			oEditButton = new sap.m.Button({
				id : sItemId + "-editButton",
				icon : "sap-icon://edit",
				type : sap.m.ButtonType.Transparent,
				enabled : bEnabled,
				press : function(oEvent) {
					sap.m.UploadCollection.prototype._handleEdit(oEvent, that);
				}
			}).addStyleClass("sapMUCEditBtn");
		}

		if (sStatus == "Display" || sStatus == "Uploading") {
			bEnabled = oItem.getEnableDelete();
			if (this.sErrorState == "Error"){
				bEnabled = false;
			}
			oDeleteButton = new sap.m.Button({
				id : sItemId + "-deleteButton",
				icon : "sap-icon://sys-cancel",
				type : sap.m.ButtonType.Transparent,
				enabled : bEnabled,
				press : function(oEvent) {
					sap.m.UploadCollection.prototype._handleDelete(oEvent, that);
				}
			}).addStyleClass("sapMUCDeleteBtn");
		}

		oButtonsHL = new sap.ui.layout.HorizontalLayout(sItemId + "-ba_innerHL", {
			content : [oOkButton, oCancelButton, oEditButton, oDeleteButton],
			allowWrapping : false
		}).addStyleClass("sapMUCBtnHL");

		// /////////////////// ListItem Text Layout
		if (sStatus == "Display" || sStatus == "Uploading") {
			oFileNameLabel = new sap.m.Link(sItemId + "-ta_filenameHL", {
				text : sFileNameLong,
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
				// text : this._oRb.getText("UPLOADCOLLECTION_UPLOADING", [sProcent]),
			}).addStyleClass("sapMUCProgress");
//			if (sStatus == "Uploading") {
//				oFileNameLabel.addStyleClass("sapMUCInner")
//			}
		}

		if (sStatus == "Display" || sStatus == "Uploading") {
			oTextDescriptionHL = new sap.ui.layout.HorizontalLayout(sItemId + "-ta_descriptionHL", {
				content : [oUploadedDateLabel, oProgressLabel]
			}).addStyleClass("sapMUCDescriptionHL");
		}

		if (sStatus == "Edit") {
			var aFileName = sFileNameLong.split(".");
			var sExtension = "." + aFileName[1];
			var iMaxLength = that.getMaximumFilenameLength();
			var sValueState = "None";
			var bShowValueStateMessage = false;
			var sFileName = aFileName[0];

			// Extension
			oFileExtensionLabel = new sap.m.Text(sItemId + "-extension", {
				text : sExtension
			}).addStyleClass("sapMUCExtension");

			if (oItem.errorState == "Error") {
				bShowValueStateMessage = true;
				sValueState = "Error";
				sFileName = oItem.changedFileName;
			}
			
			// filename
			oFileNameEditBox = new sap.m.Input(sItemId + "-ta_editFileName", {
				type : sap.m.InputType.Text,
				valueState : sValueState,
				valueStateText : this._oRb.getText("UPLOADCOLLECTION_EXISTS"),
				showValueStateMessage: bShowValueStateMessage,
				value : sFileName
			}).addStyleClass("sapMUCEditBox");

			if ((iMaxLength - sExtension.length) > 0) {
				oFileNameEditBox.setProperty("maxLength", iMaxLength - sExtension.length, true);
			}

			oFileNameEditBox.setLayoutData(new sap.m.FlexItemData({
				growFactor : 1
			}));

			oInputExtensionHL = new sap.m.HBox(sItemId + "-ta_extensionHL", {
				items : [oFileNameEditBox, oFileExtensionLabel]
			}).addStyleClass("sapMUCEditHL");

		}

		oTextVL = new sap.ui.layout.VerticalLayout(sItemId + "-ta_textVL", {
			content : [oFileNameLabel, oInputExtensionHL, oTextDescriptionHL],
			allowWrapping : true
		});

		// /////////////////// ListItem Icon
		if (sStatus == "Display" || sStatus == "Edit") {
			sThumbnailUrl = oItem.getThumbnailUrl();
			if (sThumbnailUrl) {
				oItemIcon = new sap.m.Image(sItemId + "-ia_imageHL", {
					src : sap.m.UploadCollection.prototype._getThumbnail(sThumbnailUrl, sFileNameLong)
				}).addStyleClass("sapMUCItemImage");
				oTextVL.addStyleClass("sapMUCTextPadding");
			} else {
				oItemIcon = new sap.ui.core.Icon(sItemId + "-ia_iconHL", {
					src : sap.m.UploadCollection.prototype._getThumbnail(undefined, sFileNameLong)
				}).setSize('2.5rem').addStyleClass("sapMUCItemIcon");
			}
		}

		// /////////////////// ListItem Horizontal Layout
		oHL = new sap.ui.layout.HorizontalLayout(sItemId + "-ta_HL", {
			content : [
			oBusyIndicator, oItemIcon, oTextVL, oButtonsHL],
			allowWrapping : false
		}).addStyleClass("sapMUCItemHL");
		
		if (sStatus == "Edit") {
			oHL.addStyleClass("sapMUCEditMode");
		} else {
			oHL.removeStyleClass("sapMUCEditMode");
		}

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
		oListItem.status = sStatus;
		oListItem.addStyleClass("sapMUCListItem");
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

	/* =========================================================== */
	/* Handle UploadCollection events                              */
	/* =========================================================== */
	UploadCollection.prototype._handleDelete = function(oEvent, oContext) {
		var oParams = oEvent.getParameters();
		var aItems = oContext.getModel().oData.items;
		var sItemId = oParams.id.split("-deleteButton")[0];
		var index = sItemId.split("-").pop();
		var bCompact = false;

		// popup delete file
		sap.m.MessageBox.show(this._oRb.getText("UPLOADCOLLECTION_DELETE_TEXT", aItems[index].fileName), {
			title : this._oRb.getText("UPLOADCOLLECTION_DELETE_TITLE"),
			actions : [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
			onClose : function(oAction) {
				if (oAction === sap.m.MessageBox.Action.OK) {
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

	UploadCollection.prototype._handleEdit = function(oEvent, oContext) {
		if (!!oEvent.sId) {
			var oParams = oEvent.getParameters();
			var sId = oParams.id;
			var aId = sId.split("-");
			var iLength = aId.length;
			// get line
			var iSelectdRow = aId[iLength - 2];
			
			oContext.aItems[iSelectdRow].status = "Edit";
			oContext.editModeItem = oEvent.oSource.sId.split("-editButton")[0];

			// trigger re-rendering!
			oContext.invalidate();
		}
	};
	
	UploadCollection.prototype._handleClick = function(oEvent, oContext, sSourceId) {
		var aTargetId = oEvent.target.parentElement.id.split("-");
		var aTargetIdLength = aTargetId.length;
		var sTargetId = aTargetId[aTargetId.length - 2];

		var iSourceLine = sSourceId.split("-").pop();

		if ( aTargetId[aTargetIdLength - 1] != "ta_editFileName") {
				oContext.aItems[iSourceLine].status = "Display";
		}

		switch (sTargetId) {
			case 'editButton' :
				sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, sSourceId);
				break;
			case 'cancelButton' :
				sap.m.UploadCollection.prototype._handleCancel(oEvent, oContext, sSourceId);
				break;
			case 'deleteButton':
				break;
			default :
				if (aTargetId[aTargetIdLength - 1] == "ta_editFileName") {
					break;
				}
				sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, sSourceId);
				break;
		}
	};

	UploadCollection.prototype._handleOk = function(oEvent, oContext, sSourceId) {
		var bTriggerOk = true;
		
		var oEditbox = document.getElementById(sSourceId + "-ta_editFileName-inner");
		var sValue = oEditbox.value;
		// get new/changed file name
			sValue = sValue.trimLeft();

		if (sValue.length > 0) {
			var iSourceLine = sSourceId.split("-").pop();
			// get original file name
			var sOriginalValue = oContext.aItems[iSourceLine].getProperty("fileName").split(".")[0];
			// in case there is a difference additional activities are necessary
			if (sOriginalValue != sValue) {
				var sExtension = sap.ui.getCore().byId(sSourceId + "-extension").getProperty("text");
				// here we have to check possible double items if it's necessary
				if (!oContext.getSameFilenameAllowed()) {
					var oInput = sap.ui.getCore().byId(sSourceId + "-ta_editFileName");
					// Check double file name
					if (sap.m.UploadCollection.prototype._checkDoubleFileName(sValue + sExtension, oContext.aItems)) {
						var sErrorStateBefore = oContext.aItems[iSourceLine].errorState;
						var sChangedNameBefore = oContext.aItems[iSourceLine].changedFileName;
						oInput.setProperty("valueState", "Error", true);
						oContext.aItems[iSourceLine].status = "Edit";
						oContext.aItems[iSourceLine].errorState = "Error";
						oContext.aItems[iSourceLine].changedFileName = sValue;
						oContext.sErrorState = "Error";
						bTriggerOk = false;
						if (sErrorStateBefore != "Error" || sChangedNameBefore != sValue){
							oContext.invalidate();
						}
					} else {
						oInput.setValueState = "";
						oContext.aItems[iSourceLine].errorState = "None";
						oContext.aItems[iSourceLine].changedFileName = "";
						oContext.sErrorState = "";
						oContext.editModeItem = "";
						oContext.invalidate();
					}
				}
				if (bTriggerOk) {
					oContext.fireFileRenamed({
						documentId : oContext.aItems[iSourceLine].getProperty("documentId"),
						fileName : sValue + sExtension
					});
				}
			} else {
				// nothing changed -> nothing to do!
				oContext.editModeItem = "";
				oContext.invalidate();
			}
		}
	};

	UploadCollection.prototype._handleCancel = function(oEvent, oContext, sSourceId) {
		var iSourceLine = sSourceId.split("-").pop();
		
		oContext.aItems[iSourceLine].errorState = "None";
		oContext.aItems[iSourceLine].changedFileName = sap.ui.getCore().byId(sSourceId + "-ta_editFileName");
		oContext.sErrorState = "";
		oContext.editModeItem = "";
		oContext.invalidate();
	};

	/* =========================================================== */
	/* Handle FileUploader events                                  */
	/* =========================================================== */
	UploadCollection.prototype._onUploadChange = function(oEvent) {
		this.fireChange(oEvent);
	};
	UploadCollection.prototype._onUploadFileAllowed = function(oEvent) {
		// TODO not implemented
	};
	UploadCollection.prototype._onUploadFileDeleted = function(oEvent) {
		// TODO not implemented
	};
	UploadCollection.prototype._onUploadFileRenamed = function(oEvent) {
		// TODO not implemented
	};	
	UploadCollection.prototype._onUploadFileSizeExceed = function(oEvent){
		this.fireFileSizeExceed(oEvent);
		MessageToast.show(oEvent.getId());
	};
	UploadCollection.prototype._onUploadTypeMissmatch = function(oEvent) {
		this.fireTypeMissmatch(oEvent);
		MessageToast.show(oEvent.getId());
	};
	UploadCollection.prototype._onUploadAborted = function(oEvent) {
		// TODO not implemented
	};
	UploadCollection.prototype._onUploadComplete = function(oEvent) {
		this.fireUploadComplete(oEvent);
	};
	UploadCollection.prototype._onUploadProgress = function(oEvent) {
		// TODO not implemented
	};
	
	/**
	 * Access and initialization for the FileUploader
	 */
	UploadCollection.prototype._getFileUploader = function() {
	var that = this;
		if (!this._oFileUploader) {
			this._oFileUploader = new sap.ui.unified.FileUploader({
				buttonOnly : true,
				buttonText : " ",
				enabled : this.getUploadEnabled(),
				fileType : this.getFileType(),
				icon : "sap-icon://add",
				iconFirst : false,
				maximumFilenameLength : this.getMaximumFilenameLength(),
				maximumFileSize : this.getMaximumFileSize(),
				mimeType : this.getMimeType(),
				multiple : this.getMultiple(),
				name : "uploadCollection",
				sameFilenameAllowed : this.getSameFilenameAllowed(),
				uploadOnChange : true,
				uploadUrl : this.getUploadUrl(),
				sendXHR : true, // TODO check browser version (set true for all browser except IE8, IE9)
				change : function(oEvent) {
					UploadCollection.prototype._onUploadChange.apply(that, [oEvent]);
				},
				fileAllowed : function(oEvent) {
					UploadCollection.prototype._onUploadFileAllowed.apply(that, [oEvent]);
				},
				fileDeleted : function(oEvent) {
					UploadCollection.prototype._onUploadFileDeleted.apply(that, [oEvent]);
				},
				fileRenamed : function(oEvent) {
					UploadCollection.prototype._onUploadFileRenamed.apply(that, [oEvent]);
				},
				fileSizeExceed : function(oEvent) {
					UploadCollection.prototype._onUploadFileSizeExceed.apply(that, [oEvent]);
				},
				typeMissmatch : function(oEvent) {
					UploadCollection.prototype._onUploadTypeMissmatch.apply(that, [oEvent]);
				},
				uploadAborted : function(oEvent) { // only supported with property sendXHR set to true
					UploadCollection.prototype._onUploadAborted.apply(that, [oEvent]);
				},
				uploadComplete : function(oEvent) {
					UploadCollection.prototype._onUploadComplete.apply(that, [oEvent]);
				},
				uploadProgress : function(oEvent) { // only supported with property sendXHR set to true
					UploadCollection.prototype._onUploadProgress.apply(that, [oEvent]);
				}
			});
		}
		return this._oFileUploader;
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
	// Keyboard activities
	// ================================================================================
	/**
	 * handle the TAB key:
//	 * <ul>
//	 *   <li>Navigation Mode: jump to the next focusable control after the table</li>
//	 *   <li>Action Mode: focus next focusable control (wrap at the end)</li>
//	 * </ul>
	 * @private
	 */
	UploadCollection.prototype.onsaptabnext = function(oEvent) {
		
	};
	
	UploadCollection.prototype.onsaptabprevious = function(oEvent) {
		
	};
	
	UploadCollection.prototype.onsapup = function(oEvent) {
		sap.m.UploadCollection.prototype._handleArrowUpAndLeft(oEvent);
	};
	
	UploadCollection.prototype.onsapleft = function(oEvent) {
		sap.m.UploadCollection.prototype._handleArrowUpAndLeft(oEvent);
	};
	
	UploadCollection.prototype.onsapdown = function(oEvent) {
		sap.m.UploadCollection.prototype._handleArrowDownAndRight(oEvent);
	};
	
	UploadCollection.prototype.onsapright = function(oEvent) {
		sap.m.UploadCollection.prototype._handleArrowDownAndRight(oEvent);
	};
	
	UploadCollection.prototype.onkeydown = function(oEvent) {

		switch (oEvent.keyCode) {
			case jQuery.sap.KeyCodes.F2 :
				sap.m.UploadCollection.prototype._handleF2(oEvent, this);
				break;
			case jQuery.sap.KeyCodes.ESCAPE :
				sap.m.UploadCollection.prototype._handleESC(oEvent, this);
				break;
			case jQuery.sap.KeyCodes.DELETE :
				sap.m.UploadCollection.prototype._handleDEL(oEvent, this);
				break;
			default :
				return;
		}
	};
	
	// ================================================================================
	// helpers
	// ================================================================================
	/**
	 * handle of keyboard activity DEL.
	 * @param {Object} ListItem 
	 * @param {Object} Context
	 * @private
	 */
	UploadCollection.prototype._handleDEL = function(oEvent, oContext) {
		if (!oContext.editModeItem) {
			var o$Obj = jQuery.sap.byId(oEvent.target.id);
			var o$DeleteButton = o$Obj.find("[id$='-deleteButton']");
			var oDeleteButton = sap.ui.getCore().byId(o$DeleteButton[0].id);
			if (oDeleteButton.getEnabled()) {
				oDeleteButton.firePress();
			}
		}
	};
	
	/**
	 * handle of keyboard activity ESC.
	 * @param {Object} ListItem 
	 * @param {Object} Context
	 * @private
	 */
	UploadCollection.prototype._handleESC = function(oEvent, oContext) {
		if (oContext.editModeItem){
			oContext.aItems[oContext.editModeItem.split("__item0-__collection0-")[1]].status = "Display";
			sap.m.UploadCollection.prototype._handleCancel(oEvent, oContext, oContext.editModeItem);
		}
	};
	
	
	/**
	 * handle of keyboard activity F2.
	 * @param {Object} ListItem 
	 * @param {Object} Context
	 * @private
	 */
	UploadCollection.prototype._handleF2 = function(oEvent, oContext) {

		var oObj = sap.ui.getCore().byId(oEvent.target.id);
		var o$Obj = jQuery.sap.byId(oEvent.target.id);

		if (oObj != undefined) {
			if (oObj.status == "Display") {
				//focus at list line (status = "Display") and F2 pressed --> status = "Edit"
				var o$Obj = jQuery.sap.byId(oEvent.target.id);
				var o$EditButton = o$Obj.find("[id$='-editButton']");
				var oEditButton = sap.ui.getCore().byId(o$EditButton[0].id);
				if (oEditButton.getEnabled()) {
					if (!!oContext.editModeItem){
						sap.m.UploadCollection.prototype._handleClick(oEvent, oContext, oContext.editModeItem);
					}
					oEditButton.firePress();
			}
			} else if (oObj.status == "Edit") {
				//focus at list line(status= "Edit") and F2 is pressed --> status = "Display", changes will be saved
				sap.m.UploadCollection.prototype._handleClick(oEvent, oContext, oContext.editModeItem);
			} else if (oObj.status == undefined && oEvent.target.id.search(oContext.editModeItem) == 0) {
				//focus at any other object of the list item
				sap.m.UploadCollection.prototype._handleClick(oEvent, oContext, oContext.editModeItem);
			}
		} else {
			if (oEvent.target.id.search(oContext.editModeItem) == 0) {
				//focus at Inputpield (status = "Edit"), F2 pressed --> status = "Display" changes will be saved
				oContext.aItems[oContext.editModeItem.split("__item0-__collection0-")[1]].status = "Display";
				sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, oContext.editModeItem);
			}
		}
	};

	/**
	 * handle of keyboard activity Arrow Up and Arrow Left.
	 * @param {Object} ListItem 
	 * @private
	 */
	UploadCollection.prototype._handleArrowUpAndLeft = function(oEvent) {
			var oObj = jQuery.sap.byId(oEvent.target.id);
			if (oObj.hasClass("sapMUCListItem")) {
				oObj.prev().focus();
		}
	};

	/**
	 * handle of keyboard activity Arrow Down and Arrow RightLeft.
	 * @param {Object} ListItem 
	 * @private
	 */
	UploadCollection.prototype._handleArrowDownAndRight = function(oEvent) {
			var oObj = jQuery.sap.byId(oEvent.target.id);
			if (oObj.hasClass("sapMUCListItem")) {
				oObj.next().focus();
		}
	};

	/**
	 * Determines extension from the file name.
	 */
	UploadCollection.prototype._getExtensionFromFilename = function(sFilename) {
		var aSplit = sFilename.split(".");
		return aSplit[aSplit.length - 1]; // the last part of the file name is expected to be the file extension
	};

	/**
	 * Determines if the filename is already in usage.
	 * @param {string} sFilename inclusive file extension
	 * @param {array} aItems 
	 * @return {boolean} true for an already existing item with the same file name(independent of the path)
	 * @private
	 */
	UploadCollection.prototype._checkDoubleFileName = function(sFilename, aItems) {
		if (aItems.length == 0 || !sFilename) {
			return false;
		}

		var iLength = aItems.length;
		sFilename = sFilename.trimLeft();

		for (var i = 0; i < iLength; i++) {
			if (sFilename == aItems[i].getProperty("fileName")){
				return true;
			}
		}
		return false;
	};

	return UploadCollection;

}, /* bExport= */ true);
