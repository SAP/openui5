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
	 * @alias sap.m.UploadCollection
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
			 * Allows set own text for No data label.
			 */
			noDataText : {type : "string", group : "Behavior", defaultValue : null},

			/**
			 * This property allows upload of more than one file with the same file name. A typical use case would be if the files have different paths.
			 */
			sameFilenameAllowed : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Defines whether separators are shown between list items.
			 */
			showSeparators : {type : "sap.m.ListSeparators", group : "Appearance", defaultValue : sap.m.ListSeparators.None},

			/**
			 * This property enables an upload of a file.
			 */
			uploadEnabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * The URL where the uploaded files have to be stored.
			 */
			uploadUrl : {type : "string", group : "Data", defaultValue : "../../../upload"}
		},
		defaultAggregation : "items",
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
	 * @description This file defines behavior for the control
	 * @private
	 */
	UploadCollection.prototype.init = function() {
		sap.ui.getCore().loadLibrary("sap.ui.layout");
		sap.m.UploadCollection.prototype._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._oList = new sap.m.List(this.getId() + "-list", {});
		this._oList.addStyleClass("sapMUCList");
	};

	/* =========================================================== */
	/* Lifecycle methods                                           */
	/* =========================================================== */
	/**
	 * @description Required adaptations before rendering.
	 * @private
	 */
	UploadCollection.prototype.onBeforeRendering = function() {
		var oNumberOfAttachmentsLabel = oNumberOfAttachmentsLabel || {};
		var sNoDataText = sNoDataText || this.getNoDataText();
		if (this.aItems) {
			for (var i = 0; i < this.getItems().length; i++) {
				this.getItems()[i]._status = this.aItems[i] ? this.aItems[i]._status : null;
				this.getItems()[i]._percentUploaded = this.aItems[i] ? this.aItems[i]._percentUploaded : null;
			}
		}
		this.aItems = this.getItems();
		oNumberOfAttachmentsLabel = this._getNumberOfAttachmentsLabel(this.aItems.length);
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

//		forward settings of the UploadCollection to the FileUploader
		//UploadUrl
		if (this.getUploadUrl() != this._oFileUploader.getUploadUrl()) {
			this._oFileUploader.setProperty("uploadUrl", this.getUploadUrl(), true);
		}
		//Enabled
		if (this.sErrorState != "Error") {
			if (this.getUploadEnabled() != this._oFileUploader.getEnabled()) {
				this._oFileUploader.setProperty("enabled", this.getUploadEnabled(), true);
			}
		} else {
			this._oFileUploader.setProperty("enabled", false, true);
		}
		//FileType
		if (this.getFileType() != this._oFileUploader.getFileType()) {
			this._oFileUploader.setProperty("fileType", this.getFileType(), true);
		}
		//MaximumFileNameLength
		if (this.getMaximumFilenameLength() != this._oFileUploader.getMaximumFilenameLength()) {
			this._oFileUploader.setProperty("maximumFilenameLength", this.getMaximumFilenameLength(), true);
		}
		//MaximumFileSize
		if (this.getMaximumFileSize() != this._oFileUploader.getMaximumFileSize()) {
			this._oFileUploader.setProperty("maximumFileSize", this.getMaximumFileSize(), true);
		}
		//MimeType
		if (this.getMimeType() != this._oFileUploader.getMimeType()) {
			this._oFileUploader.setProperty("mimeType", this.getMimeType(), true);
		}
		//Multiple
		if (this.getMultiple() != this._oFileUploader.getMultiple()) {
			this._oFileUploader.setProperty("multiple", this.getMultiple(), true);
		}
		//SameFilenameAllowed
		if (this.getSameFilenameAllowed() != this._oFileUploader.getSameFilenameAllowed()) {
			this._oFileUploader.setProperty("sameFilenameAllowed", this.getSameFilenameAllowed(), true);
		}

		//prepare the list with list items
		this._clearList();
		this._fillList(this.aItems);
		this._oList.setProperty("noDataText", sNoDataText, true);
		this._oList.setHeaderToolbar(this.oHeaderToolbar);
		this._oList.setProperty("showSeparators", this.getShowSeparators(), true);
	};

	/**
	 * @description Required adaptations after rendering.
	 * @private
	 */
	UploadCollection.prototype.onAfterRendering = function() {
		var that = this;
		this._oList.aDelegates = []; 

		if (this.aItems || (this.aItems == this.getItems())) {
			if (this.editModeItem) {
				var oEditBox = document.getElementById(this.editModeItem + "-ta_editFileName-inner");
				if (oEditBox) {
					var sId = this.editModeItem;
					oEditBox.focus();
					oEditBox.select();
					this._oList.addDelegate({
						onclick: function(oEvent) {
							sap.m.UploadCollection.prototype._handleClick(oEvent, that, sId);
						}
					});
				}
			} else {
				if (this.sFocusId) {
					//set focus on line item after status = Edit
					sap.m.UploadCollection.prototype._setFocus2LineItem(this.sFocusId);
					this.sFocusId = null;
				} else if (this.sDeletedItemId) {
					//set focus on line item after an item was deleted
					sap.m.UploadCollection.prototype._setFocusAfterDeletion(this.sDeletedItemId, that);
					this.sDeletedItemId = null;
				}
			}
		}
	};

	/**
	 * @description Cleans up before destruction.
	 * @private
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
	 * @description Map an item to the list item.
	 * @param {sap.ui.core.Item} oItem Base information to generate the list items
	 * @returns {sap.m.CustomListItem | null} oListItem List item which will be displayed
	 * @private
	 */
	UploadCollection.prototype._mapItemToListItem = function(oItem) {
		if (!oItem) {
			return null;
		}
		var sItemId = oItem.getId(),
			sProcentUploaded = oItem._percentUploaded,
			sStatus = oItem._status,
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
				text : this._oRb.getText("UPLOADCOLLECTION_OKBUTTON_TEXT"),
				type : sap.m.ButtonType.Transparent
			}).addStyleClass("sapMUCOkBtn");

			oCancelButton = new sap.m.Button({
				id : sItemId + "-cancelButton",
				text : this._oRb.getText("UPLOADCOLLECTION_CANCELBUTTON_TEXT"),
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
			var sButtonId = sItemId + "-deleteButton";
			if (sStatus == "Uploading") {
				sButtonId = sItemId + "-terminateButton";
			}
			bEnabled = oItem.getEnableDelete();
			if (this.sErrorState == "Error"){
				bEnabled = false;
			}
			oDeleteButton = new sap.m.Button({
				id : sButtonId,
				icon : "sap-icon://sys-cancel",
				type : sap.m.ButtonType.Transparent,
				enabled : bEnabled
//				press : function(oEvent) {
//					sap.m.UploadCollection.prototype._handleAbort(oEvent, that);
//				}
			}).addStyleClass("sapMUCDeleteBtn");
			if (sStatus == "Uploading") {
				oDeleteButton.attachPress(function(oEvent) {
					sap.m.UploadCollection.prototype._handleTerminate(oEvent, that);
				});
			} else {
				oDeleteButton.attachPress(function(oEvent) {
					sap.m.UploadCollection.prototype._handleDelete(oEvent, that);
				});
			}
		}

		oButtonsHL = new sap.ui.layout.HorizontalLayout(sItemId + "-ba_innerHL", {
			content : [oOkButton, oCancelButton, oEditButton, oDeleteButton],
			allowWrapping : false
		}).addStyleClass("sapMUCBtnHL");

		// /////////////////// ListItem Text Layout
		if (sStatus == "Display" || sStatus == "Uploading") {
			bEnabled = true;
			if (this.sErrorState == "Error") {
				bEnabled = false;
			}
			oFileNameLabel = new sap.m.Link(sItemId + "-ta_filenameHL", {
				text : sFileNameLong,
				enabled : bEnabled,
				href : oItem.getUrl()
			}).addStyleClass("sapMUCFileName");
		}

		if (sStatus == "Display") {
			oUploadedDateLabel = new sap.m.Label(sItemId + "-ta_date", {
				text : oItem.getUploadedDate() + " " + oItem.getContributor()
			});
		}

		if (sStatus == "Uploading") {
			oProgressLabel = new sap.m.Label(sItemId + "-ta_progress", {
				text : this._oRb.getText("UPLOADCOLLECTION_UPLOADING", [sProcentUploaded])
			}).addStyleClass("sapMUCProgress");
		}

		if (sStatus == "Display" || sStatus == "Uploading") {
			oTextDescriptionHL = new sap.ui.layout.HorizontalLayout(sItemId + "-ta_descriptionHL", {
				content : [oUploadedDateLabel, oProgressLabel]
			}).addStyleClass("sapMUCDescriptionHL");
		}

		if (sStatus == "Edit") {
			var oFile = UploadCollection.prototype._splitFilename(sFileNameLong);
			var iMaxLength = that.getMaximumFilenameLength();
			var sValueState = "None";
			var bShowValueStateMessage = false;
			var sFileName = oFile.name;

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
				value : sFileName,
				description: oFile.extension
			}).addStyleClass("sapMUCEditBox");

			if ((iMaxLength - oFile.extension.length) > 0) {
				oFileNameEditBox.setProperty("maxLength", iMaxLength - oFile.extension.length, true);
			}

			oFileNameEditBox.setLayoutData(new sap.m.FlexItemData({
				growFactor : 1
			}));

			oInputExtensionHL = new sap.m.HBox(sItemId + "-ta_extensionHL", {
				items : [oFileNameEditBox]
			}).addStyleClass("sapMUCEditHL");

		}

		oTextVL = new sap.ui.layout.VerticalLayout(sItemId + "-ta_textVL", {
			content : [oFileNameLabel, oInputExtensionHL, oTextDescriptionHL],
			allowWrapping : true
		}).addStyleClass("sapMUCText");

		// /////////////////// ListItem Icon
		if (sStatus == "Display" || sStatus == "Edit") {
			var bDecorative = false;
			if (this.sErrorState == "Error") {
				bDecorative = true;
			}
			sThumbnailUrl = oItem.getThumbnailUrl();
			if (sThumbnailUrl) {
				oItemIcon = new sap.m.Image(sItemId + "-ia_imageHL", {
					src : sap.m.UploadCollection.prototype._getThumbnail(sThumbnailUrl, sFileNameLong),
					decorative : bDecorative,
					press : function(oEvent) {
						sap.m.UploadCollection.prototype._triggerLink(oEvent);
					}
				}).addStyleClass("sapMUCItemImage");
			} else {
				oItemIcon = new sap.ui.core.Icon(sItemId + "-ia_iconHL", {
					src : sap.m.UploadCollection.prototype._getThumbnail(undefined, sFileNameLong),
					decorative : bDecorative,
					press : function(oEvent) {
						sap.m.UploadCollection.prototype._triggerLink(oEvent);
					}
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
		oListItem._status = sStatus;
		oListItem.addStyleClass("sapMUCItem");
		return oListItem;
	};

	/**
	 * @description Fill the list with items.
	 * @param {array} aItems An array with items type of sap.ui.core.Item.
	 * @private
	 */
	UploadCollection.prototype._fillList = function(aItems) {
		var that = this;
		var	iMaxIndex = aItems.length - 1;

		jQuery.each(aItems, function (iIndex, oItem) {
			if (!oItem._status) {
				//set default status value -> "Display"
				oItem._status = "Display";
			}
			if (!oItem._percentUploaded) {
				//set default percent uploaded
				oItem._percentUploaded = 0;
			}
			// add a private property to the added item containing a reference
			// to the corresponding mapped item
			var oListItem = that._mapItemToListItem(oItem);

			if (iIndex == 0 && iMaxIndex == 0){
				oListItem.addStyleClass("sapMUCListSingleItem");
			} else if (iIndex == 0) {
				oListItem.addStyleClass("sapMUCListFirstItem");
			} else if (iIndex == iMaxIndex) {
				oListItem.addStyleClass("sapMUCListLastItem");
			} else {
				oListItem.addStyleClass("sapMUCListItem");
			}

			// add the mapped item to the List
			that._oList.addAggregation("items", oListItem, true); // note: suppress re-rendering
		});
	};

	/**
	 * @description Destroy the items in the List.
	 * @private
	 */
	UploadCollection.prototype._clearList = function() {
		if (this._oList) {
			this._oList.destroyAggregation("items", true);	// note: suppress re-rendering
		}
	};

	/**
	 * @description Access and initialization for label number of attachments.
	 * @param {array} items Number of attachments
	 * @returns {object} label with the information about the number of attachments
	 * @private
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
	/**
	 * @description Handling of the deletion of an uploaded file
	 * @param {object} oEvent Event of the deletion
	 * @param {object} oContext Context of the deleted file
	 * @private
	 */
	UploadCollection.prototype._handleDelete = function(oEvent, oContext) {
		var oParams = oEvent.getParameters();
		var aItems = oContext.getAggregation("items");
		var sItemId = oParams.id.split("-deleteButton")[0];
		var index = null;
		var sCompact = "";
		oContext.sDeletedItemId = sItemId;
		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].sId == sItemId) { 
				index = i;
				break;
			}
		}
		if (jQuery.sap.byId(oContext.sId).hasClass("sapUiSizeCompact")) {
			sCompact = "sapUiSizeCompact";
		}

		// popup delete file
		sap.m.MessageBox.show(this._oRb.getText("UPLOADCOLLECTION_DELETE_TEXT", aItems[index].getFileName()), {
			title : this._oRb.getText("UPLOADCOLLECTION_DELETE_TITLE"),
			actions : [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
			onClose : function(oAction) {
				if (oAction === sap.m.MessageBox.Action.OK) {
					// fire event
					oContext.fireFileDeleted({
						documentId : aItems[index].getDocumentId()
					});
				}
			},
			dialogId : "messageBoxDeleteFile",
			styleClass : sCompact
		});
	};

	/**
	 * @description Handling of termination of an uploading process
	 * @param {object} oEvent Event of the upload termination
	 * @param {object} oContext Context of the upload termination
	 * @private
	 */
	UploadCollection.prototype._handleTerminate = function(oEvent, oContext) {
		var sCompact = "";
		if (jQuery.sap.byId(oContext.sId).hasClass("sapUiSizeCompact")) {
			sCompact = "sapUiSizeCompact";
		}

		// popup terminate upload file
		var aUploadedFiles = this._splitString2Array(oContext._getFileUploader().getProperty("value"), oContext);
		var oFileList = new sap.m.List({});

		aUploadedFiles.forEach(function(sItem) {
			var oListItem = new sap.m.StandardListItem({
				title : sItem,
				icon : oContext._getIconFromFilename(sItem)
			});
			oFileList.addAggregation("items", oListItem, true);
		});

		var oDialog = new sap.m.Dialog({
			title: this._oRb.getText("UPLOADCOLLECTION_TERMINATE_TITLE"),
			content: [
			new sap.m.Text({
				text: this._oRb.getText("UPLOADCOLLECTION_TERMINATE_TEXT")
			}),
				oFileList
			],
			buttons:[
			new sap.m.Button({
				text: this._oRb.getText("UPLOADCOLLECTION_OKBUTTON_TEXT"),
				press: function() {
					//call FileUploader terminate
					oContext._getFileUploader().abort();
					oDialog.close();
				}
			}),
			new sap.m.Button({
				text: this._oRb.getText("UPLOADCOLLECTION_CANCELBUTTON_TEXT"),
				press: function() {
					oDialog.close();
				}
			})
			],
			styleClass : sCompact
		});
		oDialog.open();
	};

	/**
	 * @description Handling of event of the edit button
	 * @param {object} oEvent Event of the edit button
	 * @param {object} oContext Context of the edit button
	 * @private
	 */
	UploadCollection.prototype._handleEdit = function(oEvent, oContext) {
		if (oEvent.sId) {
			var oParams = oEvent.getParameters();
			var sId = oParams.id;
			var aId = sId.split("-");
			var iLength = aId.length;
			// get line
			var iSelectdRow = aId[iLength - 2];

			oContext.aItems[iSelectdRow]._status = "Edit";
			oContext.editModeItem = oEvent.oSource.sId.split("-editButton")[0];

			// trigger re-rendering!
			oContext.invalidate();
		}
	};

	/**
	 * @description Handling of 'click' of the list (items + header)
	 * @param {object} oEvent Event of the 'click'
	 * @param {object} oContext Context of the list item where 'click' was triggered
	 * @param {string} sSourceId List item id/identifier were the click was triggered
	 * @private
	 */
	UploadCollection.prototype._handleClick = function(oEvent, oContext, sSourceId) {
		if (oEvent.target.id.lastIndexOf("editButton") > 0) {
			sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, sSourceId);
		} else if (oEvent.target.id.lastIndexOf("cancelButton") > 0) {
			sap.m.UploadCollection.prototype._handleCancel(oEvent, oContext, sSourceId);
		} else if (oEvent.target.id.lastIndexOf("ia_imageHL") < 0 
						&& oEvent.target.id.lastIndexOf("ia_iconHL") < 0
						&& oEvent.target.id.lastIndexOf("deleteButton") < 0
						&& oEvent.target.id.lastIndexOf("ta_editFileName") < 0)	{
			if (oEvent.target.id.lastIndexOf("ta_HL") > 0) {
				oContext.sFocusId = oEvent.target.id;
			}
			sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, sSourceId);
		}
	};

	/**
	 * @description Handling of 'ok' of the list item (status = 'Edit')
	 * @param {object} oEvent Event of the 'ok' activity
	 * @param {object} oContext Context of the list item where 'ok' was triggered
	 * @param {string} sSourceId List item id
	 * @private
	 */
	UploadCollection.prototype._handleOk = function(oEvent, oContext, sSourceId) {
		var bTriggerOk = true;
		var oEditbox = document.getElementById(sSourceId + "-ta_editFileName-inner");
		// get new/changed file name and remove possible leading spaces
		var sNewFileName = oEditbox.value.replace(/^\s+/,"");

		if (!oContext.sFocusId) {
			oContext.sFocusId = oContext.editModeItem + "-ta_HL";
		}

		if (sNewFileName.length > 0) {
			var iSourceLine = sSourceId.split("-").pop();
			oContext.aItems[iSourceLine]._status = "Display";
			// get original file name
			var sOrigFullFileName = oContext.aItems[iSourceLine].getProperty("fileName");
			var oFile = UploadCollection.prototype._splitFilename(sOrigFullFileName);
			// in case there is a difference additional activities are necessary
			if (oFile.name != sNewFileName) {
				// here we have to check possible double items if it's necessary
				if (!oContext.getSameFilenameAllowed()) {
					var oInput = sap.ui.getCore().byId(sSourceId + "-ta_editFileName");
					// Check double file name
					if (sap.m.UploadCollection.prototype._checkDoubleFileName(sNewFileName + oFile.extension, oContext.aItems)) {
						var sErrorStateBefore = oContext.aItems[iSourceLine].errorState;
						var sChangedNameBefore = oContext.aItems[iSourceLine].changedFileName;
						oInput.setProperty("valueState", "Error", true);
						oContext.aItems[iSourceLine]._status = "Edit";
						oContext.aItems[iSourceLine].errorState = "Error";
						oContext.aItems[iSourceLine].changedFileName = sNewFileName;
						oContext.sErrorState = "Error";
						bTriggerOk = false;
						if (sErrorStateBefore != "Error" || sChangedNameBefore != sNewFileName){
							oContext.invalidate();
						}
					} else {
						oInput.setValueState = "";
						oContext.aItems[iSourceLine].errorState = null;
						oContext.aItems[iSourceLine].changedFileName = null;
						oContext.sErrorState = null;
						oContext.editModeItem = null;
						oContext.invalidate();
					}
				}
				if (bTriggerOk) {
					oContext.fireFileRenamed({
						documentId : oContext.aItems[iSourceLine].getProperty("documentId"),
						fileName : sNewFileName + oFile.extension
					});
				}
			} else {
				// nothing changed -> nothing to do!
				oContext.editModeItem = null;
				oContext.invalidate();
			}
		}
	};

	/**
	 * @description Handling of 'cancel' of the list item (status = 'Edit')
	 * @param {object} oEvent Event of the 'cancel' activity
	 * @param {object} oContext Context of the list item where 'cancel' was triggered
	 * @param {string} sSourceId List item id
	 * @private
	 */
	UploadCollection.prototype._handleCancel = function(oEvent, oContext, sSourceId) {
		var iSourceLine = sSourceId.split("-").pop();
		oContext.aItems[iSourceLine]._status = "Display";
		oContext.aItems[iSourceLine].errorState = null;
		oContext.aItems[iSourceLine].changedFileName = sap.ui.getCore().byId(sSourceId + "-ta_editFileName").getProperty("value");
		oContext.sFocusId = oContext.editModeItem + "-ta_HL";
		oContext.sErrorState = null;
		oContext.editModeItem = null;
		oContext.invalidate();
	};

	/* =========================================================== */
	/* Handle FileUploader events                                  */
	/* =========================================================== */
	/**
	 * @description Handling of the Event change of the fileUploader
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onChange = function(oEvent) {
		if (oEvent) {
			var that = this;
			this._oFileUploader.removeAllHeaderParameters();
			this._oFileUploader.removeAllParameters();
			
			this.fireChange(oEvent);
			
			var aHeaderParametersAfter = this.getAggregation("headerParameters");
			var aParametersAfter = this.getAggregation("parameters");
			var aUploadedFiles = this._getUploadedFilesFromUploaderEvent(oEvent);
			for (var i = 0; i < aUploadedFiles.length; i++) {
				var oItem = new sap.m.UploadCollectionItem();
				oItem.setProperty("contributor", null);
				oItem.setDocumentId(null);
				oItem.setEnableDelete(true);
				oItem.setFileName(aUploadedFiles[i]);
				oItem.setMimeType(null);
				oItem._status = "Uploading";
				oItem._percentUploaded = 0;
				oItem.setThumbnailUrl(null);
				oItem.setUploadedDate(null);
				oItem.setUrl(null);
				this.aItems.unshift(oItem);
				this.insertItem(oItem);
			}
//headerParameters
			if (aHeaderParametersAfter) {
				jQuery.each(aHeaderParametersAfter, function (iIndex, headerParameter) {
					var oHeaderParameter = new sap.ui.unified.FileUploaderParameter({
						name : headerParameter.getProperty("name"),
						value: headerParameter.getProperty("value")
					});
					that._oFileUploader.addHeaderParameter(oHeaderParameter);
				});
			}
//parameters
			if (aParametersAfter) {
				jQuery.each(aParametersAfter, function (iIndex, parameter) {
					var oParameter = new sap.ui.unified.FileUploaderParameter({
						name : parameter.getProperty("name"),
						value: parameter.getProperty("value")
					});
					that._oFileUploader.addParameter(oParameter);
				});
			}
		}
	};

	/**
	 * @description Handling of the Event fileAllowed of the fileUploader
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onFileAllowed = function(oEvent) {
		// TODO not implemented
	};

	/**
	 * @description Handling of the Event fileDeleted of the fileUploader
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onFileDeleted = function(oEvent) {
		// TODO not implemented
	};

	/**
	 * @description Handling of the Event fileRenamed of the fileUploader
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onFilenameLengthExceed = function(oEvent){
		this.fireFilenameLengthExceed(oEvent);
	};

	/**
	 * @description Handling of the Event fileSizeExceed of the fileUploader
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onFileSizeExceed = function(oEvent){
		this.fireFileSizeExceed(oEvent);
	};

	/**
	 * @description Handling of the Event typeMissmatch of the fileUploader
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onTypeMissmatch = function(oEvent) {
		this.fireTypeMissmatch(oEvent);
	};

	/**
	 * @description Handling of the Event uploadTerminated of the fileUploader
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadTerminated = function(oEvent) {
		// TODO not implemented
	};

	/**
	 * @description Handling of the Event uploadComplete of the fileUploader to forward the Event to the application
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadComplete = function(oEvent) {
		if (oEvent) {
			for (var i = 0; i < this.aItems.length; i++) {
				if (this.aItems[i]._status === "Uploading") {
					this.aItems[i]._status = "Display";
				}
			}
		}
		this.fireUploadComplete(oEvent);
	};

	/**
	 * @description Handling of the Event uploadProgress of the fileUploader to forward the Event to the application
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadProgress = function(oEvent) {
		if (oEvent) {
			var aUploadedFiles = this._getUploadedFilesFromUploaderEvent(oEvent);
			var sProcentUploaded;
			var $ProcentUploaded;
			for (var i = 0; i < aUploadedFiles.length; i++) {
				sProcentUploaded = (Math.round(oEvent.getParameter("loaded") / oEvent.getParameter("total") * 100)).toString();
				sProcentUploaded = this._oRb.getText("UPLOADCOLLECTION_UPLOADING", [sProcentUploaded]);
				$ProcentUploaded = jQuery.sap.byId(this.aItems[i].getId() + "-ta_progress");
				$ProcentUploaded.text(sProcentUploaded);
			}
		}
	};

	/**
	 * @description Access and initialization for the FileUploader
	 * @returns {sap.ui.unified.FileUploader} Instance of the FileUploader
	 * @private
	 */
	UploadCollection.prototype._getFileUploader = function() {
	var that = this;
		if (!this._oFileUploader) {
			this._oFileUploader = new sap.ui.unified.FileUploader(this.getId() + "-uploader",{
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
				useMultipart : false,
				sendXHR : true, // TODO check browser version (set true for all browser except IE8, IE9)
				change : function(oEvent) {
					that._onChange(oEvent);
				},
				fileAllowed : function(oEvent) {
					that._onFileAllowed(oEvent);
				},
				fileDeleted : function(oEvent) {
					that._onFileDeleted(oEvent);
				},
				filenameLengthExceed : function(oEvent) {
					that._onFilenameLengthExceed(oEvent);
				},
				fileRenamed : function(oEvent) {
					that._onFileRenamed(oEvent);
				},
				fileSizeExceed : function(oEvent) {
					that._onFileSizeExceed(oEvent);
				},
				typeMissmatch : function(oEvent) {
					that._onTypeMissmatch(oEvent);
				},
				uploadAborted : function(oEvent) { // only supported with property sendXHR set to true
					that._onUploadTerminated(oEvent);
				},
				uploadComplete : function(oEvent) {
					that._onUploadComplete(oEvent);
				},
				uploadProgress : function(oEvent) { // only supported with property sendXHR set to true
					that._onUploadProgress(oEvent);
				}
			});
		}
		return this._oFileUploader;
	};

	/**
	 * @description Determines the icon from the filename.
	 * @param {string} sFilename Name of the file inclusive extension(e.g. .txt, .pdf, ...).
	 * @returns {string} Icon related to the file extension.
	 * @private
	 */
	UploadCollection.prototype._getIconFromFilename = function(sFilename) {
		var sFileExtension = this._splitFilename(sFilename).extension;

		switch (sFileExtension) {
			case '.bmp' :
			case '.jpg' :
			case '.png' :
				return 'sap-icon://attachment-photo';
			case '.csv' :
			case '.xls' :
			case '.xlsx' :
				return 'sap-icon://excel-attachment';
			case '.doc' :
			case '.docx' :
			case '.odt' :
				return 'sap-icon://doc-attachment';
			case '.pdf' :
				return 'sap-icon://pdf-attachment';
			case '.ppt' :
			case '.pptx' :
				return 'sap-icon://ppt-attachment';
			case '.txt' :
				return 'sap-icon://document-text';
			default :
				return 'sap-icon://document';
		}
	};

	/**
	 * @description Determines the thumbnail of an item.
	 * @param {string} sThumbnailUrl Url of the thumbnail-image of the UC list item
	 * @param {string} sFilename Name of the file to determine if there could be a thumbnail 
	 * @returns {string} ThumbnailUrl or icon
	 * @private
	 */
	UploadCollection.prototype._getThumbnail = function(sThumbnailUrl, sFilename) {
		if (sThumbnailUrl) {
			return sThumbnailUrl;
		} else {
			return this._getIconFromFilename(sFilename);
		}
	};

	/**
	 * @description Tigger of the link which will be executed when the icon/image was clicked
	 * @param {Object} oEvent of the click/press of the icon/image
	 * @private
	 */
	UploadCollection.prototype._triggerLink = function(oEvent) {
		var sLinkId = null;
		if (oEvent.oSource.sId.lastIndexOf("ia_iconHL") > 0) {
			sLinkId = oEvent.oSource.sId.split("-ia_iconHL")[0] + "-ta_filenameHL";
		} else {
			sLinkId = oEvent.oSource.sId.split("-ia_imageHL")[0] + "-ta_filenameHL";
		}
		sap.m.URLHelper.redirect(sap.ui.getCore().byId(sLinkId).getHref(), false);
	};

	// ================================================================================
	// Keyboard activities
	// ================================================================================
	/**
	 * @description Keyboard support: Handling of different key activity
	 * @param {Object} oEvent Event of the key activity
	 * @returns {void}
	 * @private
	 */
	UploadCollection.prototype.onkeydown = function(oEvent) {

		oEvent.setMarked();
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
			case jQuery.sap.KeyCodes.ENTER :
				sap.m.UploadCollection.prototype._handleENTER(oEvent, this);
				break;
			default :
				return;
		}
	};

	// ================================================================================
	// helpers
	// ================================================================================
	/**
	 * @description Set the focus after the list item was deleted.
	 * @param {Object} DeletedItemId ListItem id which was deleted
	 * @param {Object} oContext Context of the ListItem which was deleted
	 * @returns {void}
	 * @private
	 */
	UploadCollection.prototype._setFocusAfterDeletion = function(DeletedItemId, oContext) {
		if (!DeletedItemId) {
			return;
		}
		var iLength = oContext.aItems.length;
		var sLineId = null;

		if (iLength == 0){
			var oFileUploader = jQuery.sap.byId(oContext._oFileUploader.sId);
			var oFocusObj = oFileUploader.find(":button");
			jQuery.sap.focus(oFocusObj);
		} else {
			var iLineNumber = DeletedItemId.split("-").pop();
			//Deleted item is not the last one of the list
			if ((iLength - 1) >= iLineNumber) {
				sLineId = DeletedItemId + "-ta_HL";
			} else {
				sLineId = oContext.aItems.pop().sId + "-ta_HL";
			}
			sap.m.UploadCollection.prototype._setFocus2LineItem(sLineId);
		}
	};

	/**
	 * @description Set the focus to the list item.
	 * @param {string} sFocusId ListItem which should get the focus
	 * @returns {void}
	 * @private
	 */
	UploadCollection.prototype._setFocus2LineItem = function(sFocusId) {

		if (!sFocusId) {
			return;
		}
		var oObj = jQuery.sap.byId(sFocusId);
		var oListObj = oObj.parentsUntil("ul");
		var oFocusObj = oListObj.filter("li");
		oFocusObj.attr("tabIndex", -1);

		jQuery.sap.focus(oFocusObj);
	};

	/**
	 * @description Handle of keyboard activity ENTER.
	 * @param {Object} oEvent ListItem of the keyboard activity ENTER
	 * @param {Object} oContext Context of the keyboard activity ENTER
	 * @returns {void}
	 * @private
	 */
	UploadCollection.prototype._handleENTER = function (oEvent, oContext) {
		var sTarget = oEvent.target.id.split(oContext.editModeItem).pop();

		switch (sTarget) {
			case "-ta_editFileName-inner" :
			case "-okButton" :
				sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, oContext.editModeItem);
				break;
			case "-cancelButton" :
				sap.m.UploadCollection.prototype._handleCancel(oEvent, oContext, oContext.editModeItem);
				break;
			default :
				return;
		}
	};

	/**
	 * @description Handle of keyboard activity DEL.
	 * @param {Object} oEvent ListItem of the keyboard activity DEL
	 * @param {Object} oContext Context of the keyboard activity DEL
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
	 * @description Handle of keyboard activity ESC.
	 * @param {Object} oEvent ListItem of the keyboard activity ESC 
	 * @param {Object} oContext Context of the keyboard activity ESC
	 * @private
	 */
	UploadCollection.prototype._handleESC = function(oEvent, oContext) {
		if (oContext.editModeItem){
			oContext.sFocusId = oContext.editModeItem + "-ta_HL";
			oContext.aItems[oContext.editModeItem.split("__item0-__collection0-")[1]]._status = "Display";
			sap.m.UploadCollection.prototype._handleCancel(oEvent, oContext, oContext.editModeItem);
		}
	};

	/**
	 * @description Handle of keyboard activity F2.
	 * @param {Object} oEvent Event of the keyboard activity F2
	 * @param {Object} oContext Context of the keyboard activity F2
	 * @private
	 */
	UploadCollection.prototype._handleF2 = function(oEvent, oContext) {

		var oObj = sap.ui.getCore().byId(oEvent.target.id);
		var o$Obj = jQuery.sap.byId(oEvent.target.id);

		if (oObj != undefined) {
			if (oObj._status == "Display") {
				//focus at list line (status = "Display") and F2 pressed --> status = "Edit"
				o$Obj = jQuery.sap.byId(oEvent.target.id);
				var o$EditButton = o$Obj.find("[id$='-editButton']");
				var oEditButton = sap.ui.getCore().byId(o$EditButton[0].id);
				if (oEditButton.getEnabled()) {
					if (oContext.editModeItem){
						sap.m.UploadCollection.prototype._handleClick(oEvent, oContext, oContext.editModeItem);
					}
					oEditButton.firePress();
				}
			} else {
				//focus at list line(status= "Edit") and F2 is pressed --> status = "Display", changes will be saved and
				//if the focus is at any other object of the list item
				sap.m.UploadCollection.prototype._handleClick(oEvent, oContext, oContext.editModeItem);
			}
		} else {
			if (oEvent.target.id.search(oContext.editModeItem) == 0) {
				//focus at Inputpield (status = "Edit"), F2 pressed --> status = "Display" changes will be saved
				sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, oContext.editModeItem);
			}
		}
	};

	/**
	 * @description Determines the uploaded files from the FileUploader event.
	 * @param {object} oEvent Event which is triggered by the FileUploader
	 * @returns {array} aUploadedFiles A Collection of the uploaded files
	 * @private
	 */
	UploadCollection.prototype._getUploadedFilesFromUploaderEvent = function(oEvent) {
		var sUploadedFiles = oEvent.getSource().getProperty("value");
		return this._splitString2Array(sUploadedFiles, this);
	};

	/**
	 * @description Delivers an array of Filenames from a string of the FileUploader event.
	 * @param {string} sStringOfFilenames String of concatenated file names of the FileUploader
	 * @returns {array} aUploadedFiles A Collection of the uploaded files
	 * @private
	 */
	UploadCollection.prototype._splitString2Array = function(sStringOfFilenames, oContext) {
		if (oContext.getMultiple() == true && !(sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9)) {
			sStringOfFilenames = sStringOfFilenames.substring(1, sStringOfFilenames.length - 2);
		}
		//return object is an array!
		return sStringOfFilenames.split(/\" "/);
	};

	/**
	 * @description Determines if the filename is already in usage.
	 * @param {string} sFilename inclusive file extension
	 * @param {array} aItems Collection of uploaded files
	 * @returns {boolean} true for an already existing item with the same file name(independent of the path)
	 * @private
	 */
	UploadCollection.prototype._checkDoubleFileName = function(sFilename, aItems) {
		if (aItems.length == 0 || !sFilename) {
			return false;
		}

		var iLength = aItems.length;
		sFilename = sFilename.replace(/^\s+/,"");

		for (var i = 0; i < iLength; i++) {
			if (sFilename == aItems[i].getProperty("fileName")){
				return true;
			}
		}
		return false;
	};

	/**
	 * @description Split file name into name and extension.
	 * @param {string} sFilename Full file name inclusive the extension
	 * @returns {object} oResult Filename and Extension
	 * @private
	 */
	UploadCollection.prototype._splitFilename = function(sFilename) {
		var oResult = {};
		var aNameSplit = sFilename.split(".");
		oResult.extension = "." + aNameSplit.pop();
		oResult.name = aNameSplit.join(".");
		return oResult;
	};


	return UploadCollection;

}, /* bExport= */ true);
