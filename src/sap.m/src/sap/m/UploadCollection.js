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
			 * Defines the allowed file types for the upload.
			 * The chosen files will be checked against an array of file types.
			 * If at least one file does not fit the file type requirements, the upload is prevented.  Example: ["jpg", "png", "bmp"].
			 */
			fileType : {type : "string[]", group : "Data", defaultValue : null},

			/**
			 * Specifies the maximum length of a file name.
			 * If the maximum file name length is exceeded, the corresponding event 'filenameLengthExceed' is triggered.
			 */
			maximumFilenameLength : {type : "int", group : "Data", defaultValue : null},

			/**
			 * Specifies a file size limit in bytes that prevents the upload if at least one file exceeds the limit.
			 * This property is not supported by Internet Explorer 8 and 9.
			 */
			maximumFileSize : {type : "int", group : "Data", defaultValue : null},

			/**
			 * Defines the allowed MIME types of files to be uploaded.
			 * The chosen files will be checked against an array of MIME types.
			 * If at least one file does not fit the MIME type requirements, the upload is prevented.
			 * This property is not supported by Internet Explorer 8 and 9. Example: mimeType ["image/png", "image/jpeg"].
			 */
			mimeType : {type : "string[]", group : "Data", defaultValue : null},

			/**
			 * Allows multiple files to be chosen and uploaded from the same folder.
			 * This property is not supported by Internet Explorer 8 and 9.
			 */
			multiple : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Allows you to set your own text for the 'No data' label.
			 */
			noDataText : {type : "string", group : "Behavior", defaultValue : null},

			/**
			 * Allows the user to assign the same name when editing the file name.  “Same” refers to the existence in the list of a file with the same name.
			 */
			sameFilenameAllowed : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Defines whether separators are shown between list items.
			 */
			showSeparators : {type : "sap.m.ListSeparators", group : "Appearance", defaultValue : sap.m.ListSeparators.None},

			/**
			 * Enables the upload of a file.
			 */
			uploadEnabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Specifies the URL where the uploaded files have to be stored.
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
			 * Specifies the header parameters for the FileUploader that are submitted only with XHR requests.
			 * Header parameters are not supported by Internet Explorer 8 and 9.
			 */
			headerParameters : {type : "sap.m.UploadCollectionParameter", multiple : true, singularName : "headerParameter"},

			/**
			 * Specifies the parameters for the FileUploader that are rendered as a hidden input field.
			 */
			parameters : {type : "sap.m.UploadCollectionParameter", multiple : true, singularName : "parameter"}
		},
		events : {

			/**
			 * The event is triggered when files are selected.
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
			 * The event is triggered when a fileDeleted event occurs, typically by choosing the Delete pushbutton.
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
			 * The event is triggered when the name of a chosen file is longer than the value specified with the maximumFilenameLength property (only if provided by the application).
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
			 * The event is triggered when the file name is changed.
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
			 * The event is triggered when the file size of an uploaded file is  exceeded (only if the maxFileSize property was provided by the application).
			 * This event is not supported by Internet Explorer 8 and 9.
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
			 * The event is triggered when the file type or the MIME type don't match the permitted types (only if the fileType property or the mimeType property are provided by the application).
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
					 * MIME type.
					 */
					mimeType : {type : "string"}
				}
			},

			/**
			 * The event is triggered as soon as the upload request is completed.
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
			},

			/**
			 * The event is triggered as soon as the upload request was terminated by the user.
			 * @since 1.26.2
			 */
			uploadTerminated : {}
		}
	}});



	UploadCollection._uploadingStatus = "uploading";
	UploadCollection._displayStatus = "display";
	UploadCollection._toBeDeletedStatus = "toBeDeleted";
	UploadCollection.prototype._requestIdName = "requestId";
	UploadCollection.prototype._requestIdValue = 0;

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
	/* redefinition of setters methods                             */
	/* =========================================================== */

	UploadCollection.prototype.setFileType = function(aFileTypes) {
		this.setProperty("fileType", aFileTypes);
		if (this._getFileUploader().getFileType() !== aFileTypes) {
			this._getFileUploader().setFileType(aFileTypes);
		}
		return this;
	};

	UploadCollection.prototype.setMaximumFilenameLength = function(iMaximumFilenameLength) {
		this.setProperty("maximumFilenameLength", iMaximumFilenameLength);
		if (this._getFileUploader().getMaximumFilenameLength() !== iMaximumFilenameLength) {
			this._getFileUploader().setMaximumFilenameLength(iMaximumFilenameLength);
		}
		return this;
	};

	UploadCollection.prototype.setMaximumFileSize = function(iMaximumFileSize) {
		this.setProperty("maximumFileSize", iMaximumFileSize);
		if (this._getFileUploader().getMaximumFileSize() !== iMaximumFileSize) {
			this._getFileUploader().setMaximumFileSize(iMaximumFileSize);
		}
		return this;
	};

	UploadCollection.prototype.setMimeType = function(aMimeTypes) {
		this.setProperty("mimeType", aMimeTypes);
		if (this._getFileUploader().getMimeType() !== aMimeTypes) {
			this._getFileUploader().setMimeType(aMimeTypes);
		}
		return this;
	};

	UploadCollection.prototype.setMultiple = function(bMultiple) {
		this.setProperty("multiple", bMultiple);
		if (this._getFileUploader().getMultiple() !== bMultiple) {
			this._getFileUploader().setMultiple(bMultiple);
		}
		return this;
	};

	UploadCollection.prototype.setNoDataText = function(sNoDataText) {
		this.setProperty("noDataText", sNoDataText);
		if (this._oList.getNoDataText() !== sNoDataText) {
			this._oList.setNoDataText(sNoDataText);
		}
		return this;
	};

	UploadCollection.prototype.setSameFilenameAllowed = function(bSameFilenameAllowed) {
		this.setProperty("sameFilenameAllowed", bSameFilenameAllowed);
		if (this._getFileUploader().getSameFilenameAllowed() !== bSameFilenameAllowed) {
			this._getFileUploader().setSameFilenameAllowed(bSameFilenameAllowed);
		}
		return this;
	};

	UploadCollection.prototype.setShowSeparators = function(bShowSeparators) {
		this.setProperty("showSeparators", bShowSeparators);
		if (this._oList.getShowSeparators() !== bShowSeparators) {
			this._oList.setShowSeparators(bShowSeparators);
		}
		return this;
	};

	UploadCollection.prototype.setUploadEnabled = function(bUploadEnabled) {
		this.setProperty("uploadEnabled", bUploadEnabled);
		if (this._getFileUploader().getEnabled() !== bUploadEnabled) {
			this._getFileUploader().setEnabled(bUploadEnabled);
		}
		return this;
	};

	UploadCollection.prototype.setUploadUrl = function(sUploadUrl) {
		this.setProperty("uploadUrl", sUploadUrl);
		if (this._getFileUploader().getUploadUrl() !== sUploadUrl) {
			this._getFileUploader().setUploadUrl(sUploadUrl);
		}
		return this;
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
		var i, j, bItemToBeDeleted;

		if (this.aItems && this.aItems.length > 0) {
			var cAitems = this.aItems.length;
			// collect items with the status "uploading"
			var aUploadingItems = [];
			for (i = 0; i < cAitems; i++) {
				if (this.aItems[i]._status === UploadCollection._uploadingStatus) {
					aUploadingItems.push(this.aItems[i]);
				}
				// check if there is an item which should have been deleted
				if (this.aItems[i]._status === UploadCollection._toBeDeletedStatus) {
					bItemToBeDeleted = true;
				}
			}
			i = 0;
			if (aUploadingItems.length > 0) {
				var cItems = this.getItems().length;
				for (i = 0; i < cItems; i++) {
					if (aUploadingItems.length === 0 ) {
							break;
					}
					j = 0;
					for (j = 0; j < aUploadingItems.length; j++) {
						if (this.getItems()[i].getProperty("fileName") === aUploadingItems[j].getProperty("fileName") &&
								this.getItems()[i]._requestIdName === aUploadingItems[j]._requestIdName ) {
							aUploadingItems.splice(j,1);
							break;
						}
					}
				}
			}
			if (this.getItems() && this.getItems().length > 0 ) {
				this.aItems.length = 0;
				this.aItems = this.getItems();
				for (i = 0; i < aUploadingItems.length; i++ ) {
					this.aItems.unshift(aUploadingItems[i]);
				}
			} else {
				// aItems is not empty but getItems() = []
				if (bItemToBeDeleted == true) {
					for (i = 0; i < cAitems; i++) {
						if (this.aItems[i]._status === UploadCollection._toBeDeletedStatus) {
							this.aItems.splice(i,1);
						}
					}
				}
			}
		} else {
			// this.aItems is empty
			this.aItems = this.getItems();
		}

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

		// FileUploader does not support parallel uploads in IE9
		if ((sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9) && this.aItems.length > 0 && this.aItems[0]._status === UploadCollection._uploadingStatus) {
			this._oFileUploader.setEnabled(false);
		} else {
			// enable/disable FileUploader according to error state
			if (this.sErrorState !== "Error") {
				if (this.getUploadEnabled() != this._oFileUploader.getEnabled()) {
					this._oFileUploader.setEnabled(this.getUploadEnabled());
				}
			} else {
			this._oFileUploader.setEnabled(false);
			}
		}

		//prepare the list with list items
		this._clearList();
		this._fillList(this.aItems);
		this._oList.setHeaderToolbar(this.oHeaderToolbar);
	};

	/**
	 * @description Required adaptations after rendering.
	 * @private
	 */
	UploadCollection.prototype.onAfterRendering = function() {
		var that = this;
		for (var i = 0; i < this._oList.aDelegates.length; i++) {
			if (this._oList.aDelegates[i]._sId && this._oList.aDelegates[i]._sId === "UploadCollection") {
				this._oList.aDelegates.splice(i, 1);
			}
		}

		if (this.aItems || (this.aItems === this.getItems())) {
			if (this.editModeItem) {
				var $oEditBox = jQuery.sap.byId(this.editModeItem + "-ta_editFileName-inner");
				if ($oEditBox) {
					var sId = this.editModeItem;
					if (!(sap.ui.Device.os.ios && (sap.ui.Device.browser.chrome || sap.ui.Device.browser.safari))) {
						$oEditBox.focus(function() {
							$oEditBox.selectText(0, $oEditBox.val().length);
						});
					}
					$oEditBox.focus();
					this._oList.addDelegate({
						onclick: function(oEvent) {
							sap.m.UploadCollection.prototype._handleClick(oEvent, that, sId);
						}
					});
					this._oList.aDelegates[this._oList.aDelegates.length - 1]._sId = "UploadCollection";
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

		if (sStatus === UploadCollection._uploadingStatus) {
			oBusyIndicator = new sap.m.BusyIndicator(sItemId + "-ia_indicator", {
				visible: true
			}).setSize("2.5rem").addStyleClass("sapMUCloadingIcon");
		}

		/////////////////// ListItem Button Layout
		if (sStatus === "Edit") {
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

		if (sStatus === UploadCollection._displayStatus) {
			bEnabled = oItem.getEnableEdit();
			if (this.sErrorState === "Error"){
				bEnabled = false;
			}
			oEditButton = new sap.m.Button({
				id : sItemId + "-editButton",
				icon : "sap-icon://edit",
				type : sap.m.ButtonType.Transparent,
				enabled : bEnabled,
				visible : oItem.getVisibleEdit(),
				press : function(oEvent) {
					sap.m.UploadCollection.prototype._handleEdit(oEvent, that);
				}
			}).addStyleClass("sapMUCEditBtn");
		}

		if (sStatus === UploadCollection._displayStatus) {
			var sButton = "deleteButton";
			var oDeleteButton = this._createDeleteButton(sItemId, sButton, oItem, this.sErrorState);
			oDeleteButton.attachPress(function(oEvent) {
				sap.m.UploadCollection.prototype._handleDelete(oEvent, that);
			});
		}

		if (sStatus === UploadCollection._uploadingStatus && !(sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9)) {
			var sButton = "terminateButton";
			var oDeleteButton = this._createDeleteButton(sItemId, sButton, oItem, this.sErrorState);
			oDeleteButton.attachPress(function(oEvent) {
				sap.m.UploadCollection.prototype._handleTerminate(oEvent, that);
			});
		}

		oButtonsHL = new sap.ui.layout.HorizontalLayout(sItemId + "-ba_innerHL", {
			content : [oOkButton, oCancelButton, oEditButton, oDeleteButton],
			allowWrapping : false
		}).addStyleClass("sapMUCBtnHL");

		// /////////////////// ListItem Text Layout
		if (sStatus === UploadCollection._displayStatus || sStatus === UploadCollection._uploadingStatus) {
			bEnabled = true;
			if (this.sErrorState === "Error") {
				bEnabled = false;
			}
			oFileNameLabel = new sap.m.Link(sItemId + "-ta_filenameHL", {
				text : sFileNameLong,
				enabled : bEnabled,
				target : "_blank",
				href : oItem.getUrl()
			}).addStyleClass("sapMUCFileName");
		}

		if (sStatus === UploadCollection._displayStatus) {
			oUploadedDateLabel = new sap.m.Label(sItemId + "-ta_date", {
				text : oItem.getUploadedDate() + " " + oItem.getContributor()
			});
		}

		if (sStatus === UploadCollection._uploadingStatus && !(sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9)) {
			oProgressLabel = new sap.m.Label(sItemId + "-ta_progress", {
				text : this._oRb.getText("UPLOADCOLLECTION_UPLOADING", [sProcentUploaded])
			}).addStyleClass("sapMUCProgress");
		}

		if (sStatus === UploadCollection._displayStatus || sStatus === UploadCollection._uploadingStatus) {
			oTextDescriptionHL = new sap.ui.layout.HorizontalLayout(sItemId + "-ta_descriptionHL", {
				content : [oUploadedDateLabel, oProgressLabel]
			}).addStyleClass("sapMUCDescriptionHL");
		}

		if (sStatus === "Edit") {
			var oFile = UploadCollection.prototype._splitFilename(sFileNameLong);
			var iMaxLength = that.getMaximumFilenameLength();
			var sValueState = "None";
			var bShowValueStateMessage = false;
			var sFileName = oFile.name;

			if (oItem.errorState === "Error") {
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
			content : [oFileNameLabel, oInputExtensionHL, oTextDescriptionHL]
		}).addStyleClass("sapMUCText");

		// /////////////////// ListItem Icon
		if (sStatus === UploadCollection._displayStatus || sStatus === "Edit") {
			var bDecorative = false;
			if (this.sErrorState === "Error" || oItem.getProperty("url") == false) {
				bDecorative = true;
			}
			sThumbnailUrl = oItem.getThumbnailUrl();
			if (sThumbnailUrl) {
				oItemIcon = new sap.m.Image(sItemId + "-ia_imageHL", {
					src : sap.m.UploadCollection.prototype._getThumbnail(sThumbnailUrl, sFileNameLong),
					decorative : bDecorative
				}).addStyleClass("sapMUCItemImage");
			} else {
				oItemIcon = new sap.ui.core.Icon(sItemId + "-ia_iconHL", {
					src : sap.m.UploadCollection.prototype._getThumbnail(undefined, sFileNameLong),
					decorative : bDecorative
				}).setSize('2.5rem').addStyleClass("sapMUCItemIcon");
			}
			if (bDecorative == false) {
				oItemIcon.attachPress(function(oEvent) {
					sap.m.UploadCollection.prototype._triggerLink(oEvent, that);
				});
			}
		}

		// /////////////////// ListItem Horizontal Layout
		oHL = new sap.ui.layout.HorizontalLayout(sItemId + "-ta_HL", {
			content : [
			oBusyIndicator, oItemIcon, oTextVL, oButtonsHL],
			allowWrapping : false
		}).addStyleClass("sapMUCItemHL");

		if (sStatus === "Edit") {
			oHL.addStyleClass("sapMUCEditMode");
		} else {
			oHL.removeStyleClass("sapMUCEditMode");
		}

		///////////////////// ListItem Template Definition
		oListItem = new sap.m.CustomListItem({
			content : [oHL]
		});

		///////////////////// Add properties to the ListItem
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
	 * @description creates a delete button
	 * @param {string} [sItemId] Id of the oItem
	 * @param {string} [sButton]
	 *  if sButton == "deleteButton" it is a delete button for the already uploaded file
	 *  if sButton == "terminateButton" it is a button to terminate the upload of the file being uploaded
	 * @param {Object} [oItem]
	 * @param {string} [sErrorState]
	 */
	UploadCollection.prototype._createDeleteButton = function(sItemId, sButton, oItem, sErrorState) {
		var bEnabled = oItem.getEnableDelete();
		if (this.sErrorState === "Error"){
			bEnabled = false;
		}
		var oDeleteButton = new sap.m.Button({
			id : sItemId + "-" + sButton,
			icon : "sap-icon://sys-cancel",
			type : sap.m.ButtonType.Transparent,
			enabled : bEnabled,
			visible : oItem.getVisibleDelete()
		}).addStyleClass("sapMUCDeleteBtn");
		return oDeleteButton;
	};

	/**
	 * @description Fill the list with items.
	 * @param {array} aItems An array with items type of sap.ui.core.Item.
	 * @private
	 */
	UploadCollection.prototype._fillList = function(aItems) {
		var that = this;
		var iMaxIndex = aItems.length - 1;

		jQuery.each(aItems, function (iIndex, oItem) {
			if (!oItem._status) {
				//set default status value -> UploadCollection._displayStatus
				oItem._status = UploadCollection._displayStatus;
			}
			if (!oItem._percentUploaded && oItem._status === UploadCollection._uploadingStatus) {
				//set default percent uploaded
				oItem._percentUploaded = 0;
			}
			// add a private property to the added item containing a reference
			// to the corresponding mapped item
			var oListItem = that._mapItemToListItem(oItem);

			if (iIndex === 0 && iMaxIndex === 0){
				oListItem.addStyleClass("sapMUCListSingleItem");
			} else if (iIndex === 0) {
				oListItem.addStyleClass("sapMUCListFirstItem");
			} else if (iIndex === iMaxIndex) {
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
			if (aItems[i].sId === sItemId) {
				index = i;
				break;
			}
		}
		if (jQuery.sap.byId(oContext.sId).hasClass("sapUiSizeCompact")) {
			sCompact = "sapUiSizeCompact";
		}

		if (!!aItems[index]) {
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
						aItems[index]._status = UploadCollection._toBeDeletedStatus;
					}
				},
				dialogId : "messageBoxDeleteFile",
				styleClass : sCompact
			});
		}
	};

	/**
	 * @description Handling of termination of an uploading process
	 * @param {object} oEvent Event of the upload termination
	 * @param {object} oContext Context of the upload termination
	 * @private
	 */
	UploadCollection.prototype._handleTerminate = function(oEvent, oContext) {
		var sCompact = "", aUploadedFiles, oFileList, oListItem, oDialog, i, j;
		if (jQuery.sap.byId(oContext.sId).hasClass("sapUiSizeCompact")) {
			sCompact = "sapUiSizeCompact";
		}
	// popup terminate upload file
		aUploadedFiles = this._splitString2Array(oContext._getFileUploader().getProperty("value"), oContext);
		oFileList = new sap.m.List({});

		aUploadedFiles.forEach(function(sItem) {
			oListItem = new sap.m.StandardListItem({
				title : sItem,
				icon : oContext._getIconFromFilename(sItem)
			});
			oFileList.addAggregation("items", oListItem, true);
		});

		oDialog = new sap.m.Dialog({
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
					// if the file is already loaded send a delete request to the application
					aUploadedFiles = oContext._splitString2Array(oContext._getFileUploader().getProperty("value"), oContext);
					for (i = 0; i < aUploadedFiles.length; i++) {
						for (j = 0; j < oContext.aItems.length; j++) {
							if ( aUploadedFiles[i] === oContext.aItems[j].getProperty("fileName") && oContext.aItems[j]._status === UploadCollection._displayStatus) {
								oContext.fireFileDeleted({
									documentId : oContext.aItems[j].getDocumentId()
								});
								oContext.aItems[j]._status = UploadCollection._toBeDeletedStatus;
								break;
							}
						}
					}
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
			sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, sSourceId, false);
		} else if (oEvent.target.id.lastIndexOf("cancelButton") > 0) {
			sap.m.UploadCollection.prototype._handleCancel(oEvent, oContext, sSourceId);
		} else if (oEvent.target.id.lastIndexOf("ia_imageHL") < 0
						&& oEvent.target.id.lastIndexOf("ia_iconHL") < 0
						&& oEvent.target.id.lastIndexOf("deleteButton") < 0
						&& oEvent.target.id.lastIndexOf("ta_editFileName") < 0)	{
			if (oEvent.target.id.lastIndexOf("ta_HL") > 0) {
				oContext.sFocusId = oEvent.target.id;
			}
			sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, sSourceId, true);
		}
	};

	/**
	 * @description Handling of 'ok' of the list item (status = 'Edit')
	 * @param {object} oEvent Event of the 'ok' activity
	 * @param {object} oContext Context of the list item where 'ok' was triggered
	 * @param {string} sSourceId List item id
	 * @private
	 */
	UploadCollection.prototype._handleOk = function(oEvent, oContext, sSourceId, bTriggerRenderer) {
		var bTriggerOk = true;
		var oEditbox = document.getElementById(sSourceId + "-ta_editFileName-inner");
		// get new/changed file name and remove possible leading spaces
		var sNewFileName = oEditbox.value.replace(/^\s+/,"");

		if (!oContext.sFocusId) {
			oContext.sFocusId = oContext.editModeItem + "-ta_HL";
		}

		if (sNewFileName.length > 0) {
			var iSourceLine = sSourceId.split("-").pop();
			oContext.aItems[iSourceLine]._status = UploadCollection._displayStatus;
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
						if (bTriggerRenderer) {
							oContext.invalidate();
						}
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
				if (bTriggerRenderer) {
					oContext.invalidate();
				}
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
		oContext.aItems[iSourceLine]._status = UploadCollection._displayStatus;
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
			var oHeaderParameter, sRequestValue, iCountFiles, i, sFileName;
			if (sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9) {
				// FileUploader does not support files parameter for IE9 for the time being
				var sNewValue = oEvent.getParameter("newValue");
				if (!sNewValue) {
					return;
				}
				sFileName = sNewValue.split(/\" "/)[0];
				//sometimes onChange is called if no data was selected
				if ( sFileName.length === 0 ) {
					return;
				}
			} else {
				iCountFiles = oEvent.getParameter("files").length;
				//sometimes onChange is called if no data was selected
				if (iCountFiles === 0) {
					return;
				}
				this._oFileUploader.removeAllHeaderParameters();
				this.removeAllHeaderParameters();
			}
			this._oFileUploader.removeAllParameters();
			this.removeAllParameters();

			this.fireChange(oEvent);

			var aParametersAfter = this.getAggregation("parameters");
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
			if (sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9) {
				var oItem = new sap.m.UploadCollectionItem();
				oItem.setProperty("contributor", null);
				oItem.setDocumentId(null);
				oItem.setEnableDelete(true);
				oItem.setFileName(sFileName);
				oItem.setMimeType(null);
				oItem._status = UploadCollection._uploadingStatus;
				oItem._percentUploaded = 0;
				oItem.setThumbnailUrl(null);
				oItem.setUploadedDate(null);
				oItem.setUrl(null);
				this.aItems.unshift(oItem);
				this.insertItem(oItem);
			} else {
				this._requestIdValue = this._requestIdValue + 1;
				sRequestValue = this._requestIdValue.toString();
				var aHeaderParametersAfter = this.getAggregation("headerParameters");
				for (i = 0; i < iCountFiles; i++) {
					var oItem = new sap.m.UploadCollectionItem();
					oItem.setProperty("contributor", null);
					oItem.setDocumentId(null);
					oItem.setEnableDelete(true);
					oItem.setFileName(oEvent.getParameter("files")[i].name);
					oItem.setMimeType(null);
					oItem._status = UploadCollection._uploadingStatus;
					oItem._percentUploaded = 0;
					oItem.setThumbnailUrl(null);
					oItem.setUploadedDate(null);
					oItem.setUrl(null);
					oItem._requestIdName = sRequestValue;
					oItem.fileSize = oEvent.getParameter("files")[i].size;
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
				oHeaderParameter = new sap.ui.unified.FileUploaderParameter({
					name : this._requestIdName,
					value: sRequestValue
				});
				that._oFileUploader.addHeaderParameter(oHeaderParameter);
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
		if ( oEvent) {
			var i;
			var sRequestId = this._getRequestId(oEvent);
			var sFileName = oEvent.getParameter("fileName");
			var cItems = this.aItems.length;
			for (i = 0; i < cItems ; i++) {
				if (this.aItems[i] === sFileName && this.aItems[i]._requestIdName === sRequestId && this.aItems[i]._status === UploadCollection._uploadingStatus) {
					this.aItems.splice(i, 1);
					this.removeItem(i);
					break;
				}
			}
			this.fireUploadTerminated();
		}
	};

	/**
	 * @description Handling of the Event uploadComplete of the fileUploader to forward the Event to the application
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadComplete = function(oEvent) {
		if (oEvent) {
			var i, sRequestId, sUploadedFile, cItems;
			sRequestId = this._getRequestId(oEvent);
			sUploadedFile = oEvent.getParameter("fileName");
			// at the moment parameter fileName is not set in IE9
			if (!sUploadedFile) {
				var aUploadedFile = (oEvent.getSource().getProperty("value")).split(/\" "/);
				sUploadedFile = aUploadedFile[0];
			}
			cItems = this.aItems.length;
			for (i = 0; i < cItems; i++) {
			// sRequestId should be null only in case of IE9 because FileUploader does not support header parameters for it
				if (!sRequestId) {
					if (this.aItems[i].getProperty("fileName") === sUploadedFile
							&& this.aItems[i]._status === UploadCollection._uploadingStatus) {
						this.aItems[i]._status = UploadCollection._displayStatus;
						break;
					}
				} else if (this.aItems[i].getProperty("fileName") === sUploadedFile
						&& this.aItems[i]._requestIdName === sRequestId
						&& this.aItems[i]._status === UploadCollection._uploadingStatus) {
					this.aItems[i]._status = UploadCollection._displayStatus;
					break;
				}
			}
			this.fireUploadComplete(oEvent);
		}
	};

	/**
	 * @description Handling of the Event uploadProgress of the fileUploader to forward the Event to the application
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadProgress = function(oEvent) {
		if (oEvent) {
			var i, sUploadedFile, sPercentUploaded, nPercentUploaded, $PercentUploaded, sRequestId, cItems;
			sUploadedFile = oEvent.getParameter("fileName");
			sRequestId = this._getRequestId(oEvent);
			nPercentUploaded = Math.round(oEvent.getParameter("loaded") / oEvent.getParameter("total") * 100);
			sPercentUploaded = nPercentUploaded.toString();
			sPercentUploaded = this._oRb.getText("UPLOADCOLLECTION_UPLOADING", [sPercentUploaded]);
			cItems = this.aItems.length;
			for (i = 0; i < cItems; i++) {
				if (this.aItems[i].getProperty("fileName") === sUploadedFile && this.aItems[i]._requestIdName == sRequestId && this.aItems[i]._status === UploadCollection._uploadingStatus) {
					$PercentUploaded = jQuery.sap.byId(this.aItems[i].getId() + "-ta_progress");
					$PercentUploaded.text(sPercentUploaded);
					this.aItems[i]._percentUploaded = nPercentUploaded;
					break;
				}
			}
		}
	};

	/**
	 * @description Get the Request ID from the header Parameters of a fileUploader event
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._getRequestId = function(oEvent) {
		var oHeaderParams, sHeader, sValue;
		oHeaderParams = oEvent.getParameter("requestHeaders");
		if (!oHeaderParams) {
			return null;
		}
		for (var j = 0; j < oHeaderParams.length; j++) {
			sHeader = oHeaderParams[j].name;
			if (sHeader == this._requestIdName) {
				sValue = oHeaderParams[j].value;
			}
		}
		return sValue;
	};

	/**
	 * @description Access and initialization for the FileUploader
	 * @returns {sap.ui.unified.FileUploader} Instance of the FileUploader
	 * @private
	 */
	UploadCollection.prototype._getFileUploader = function() {
	var that = this;
		if (!this._oFileUploader) {
			var bSendXHR = (sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9) ? false : true;
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
				sendXHR : bSendXHR, // false for IE8, IE9
				change : function(oEvent) {
					that._onChange(oEvent);
				},
				fileAllowed : function(oEvent) {
					that._onFileAllowed(oEvent);
				},
				filenameLengthExceed : function(oEvent) {
					that._onFilenameLengthExceed(oEvent);
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
	UploadCollection.prototype._triggerLink = function(oEvent, oContext) {
		var sLinkId = null;
		var iLine;
		var sId = oEvent.getParameter("id");

		if (oContext.editModeItem) {
			iLine = oContext.editModeItem.split("-").pop();
			sap.m.URLHelper.redirect(oContext.aItems[iLine].getProperty("url"), true);
			return;
		} else {
			sLinkId = sId.split(sId.split("-").pop())[0] + "ta_filenameHL";
			sap.m.URLHelper.redirect(sap.ui.getCore().byId(sLinkId).getHref(), true);
		}
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
		oEvent.setMarked();
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
		var $oObj = jQuery.sap.byId(sFocusId);
		var $oListObj = $oObj.parentsUntil("ul");
		var $oFocusObj = $oListObj.filter("li");
		$oFocusObj.attr("tabIndex", -1);

		jQuery.sap.focus($oFocusObj);
	};

	/**
	 * @description Handle of keyboard activity ENTER.
	 * @param {Object} oEvent ListItem of the keyboard activity ENTER
	 * @param {Object} oContext Context of the keyboard activity ENTER
	 * @returns {void}
	 * @private
	 */
	UploadCollection.prototype._handleENTER = function (oEvent, oContext) {
		var sTarget;
		var sLinkId;
		if (oContext.editModeItem) {
			sTarget = oEvent.target.id.split(oContext.editModeItem).pop();
		} else {
			sTarget = oEvent.target.id.split("-").pop();
		}

		switch (sTarget) {
			case "-ta_editFileName-inner" :
			case "-okButton" :
				sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, oContext.editModeItem, true);
				break;
			case "-cancelButton" :
				oEvent.preventDefault();
				sap.m.UploadCollection.prototype._handleCancel(oEvent, oContext, oContext.editModeItem);
				break;
			case "-ia_iconHL" :
			case "-ia_imageHL" :
				//Edit mode
				var iLine = oContext.editModeItem.split("-").pop();
				sap.m.URLHelper.redirect(oContext.aItems[iLine].getProperty("url"), true);
				break;
			case "ia_iconHL" :
			case "ia_imageHL" :
				//Display mode
				sLinkId = oEvent.target.id.split(sTarget)[0] + "ta_filenameHL";
				sap.m.URLHelper.redirect(sap.ui.getCore().byId(sLinkId).getHref(), true);
				break;
			default :
				if (sTarget.substring(0,6) == "__item") {
					var sListItemId = jQuery.sap.byId(sTarget).find("[id$='ta_HL']")[0].id;
					sLinkId = sListItemId.split("ta_HL")[0] + "ta_filenameHL";
					sap.m.URLHelper.redirect(sap.ui.getCore().byId(sLinkId).getHref(), true);
					break;
				}
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
			oDeleteButton.firePress();
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
			oContext.aItems[oContext.editModeItem.split("-").pop()]._status = UploadCollection._displayStatus;
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
			if (oObj._status == UploadCollection._displayStatus) {
				//focus at list line (status = "display") and F2 pressed --> status = "Edit"
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
				//focus at list line(status= "Edit") and F2 is pressed --> status = "display", changes will be saved and
				//if the focus is at any other object of the list item
				sap.m.UploadCollection.prototype._handleClick(oEvent, oContext, oContext.editModeItem);
			}
		} else {
			if (oEvent.target.id.search(oContext.editModeItem) == 0) {
				//focus at Inputpield (status = "Edit"), F2 pressed --> status = "display" changes will be saved
				sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, oContext.editModeItem, true);
			}
		}
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
