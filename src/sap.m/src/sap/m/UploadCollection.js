/*!
 * ${copyright}
 */
// Provides control sap.m.UploadCollection.
sap.ui.define(['jquery.sap.global', './MessageBox', './Dialog', './library', 'sap/ui/core/Control', 'sap/ui/unified/FileUploaderParameter', "sap/ui/unified/FileUploader", "./UploadCollectionItem", "./BusyIndicator", "./CustomListItem", "./Link", "./FlexItemData", "./HBox", "sap/ui/layout/HorizontalLayout", "./CustomListItemRenderer", "./LinkRenderer", "./TextRenderer", "./DialogRenderer", "./HBoxRenderer"],
	function(jQuery, MessageBox, Dialog, Library, Control, FileUploaderParamter, FileUploader, UploadCollectionItem, BusyIndicator, CustomListItem, Link, FlexItemData, HBox, HorizontalLayout) {
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
			 * Specifies a file size limit in megabytes that prevents the upload if at least one file exceeds the limit.
			 * This property is not supported by Internet Explorer 8 and 9.
			 */
			maximumFileSize : {type : "float", group : "Data", defaultValue : null},

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
			 * The event is triggered when files are selected. Applications can set parameters and headerParameters which will be dispatched to the embedded FileUploader control.
			 * Limitation: parameters and headerParameters are not supported by Internet Explorer 9.
			 */
			change : {
				parameters : {
					/**
					 * An unique Id of the attached document.
					 * This parameter is deprecated since version 1.28.0, use parameter files instead.
					 * @deprecated Since version 1.28.0. This parameter is deprecated, use parameter files instead.
					 */
					documentId : {type : "string"},
					/**
					 * A FileList of individually selected files from the underlying system. See www.w3.org for the FileList Interface definition.
					 * Limitation: Internet Explorer 9 supports only single file with property file.name.
					 * Since version 1.28.0.
					 */
					files : {type : "object[]"}
				}
			},

			/**
			 * The event is triggered when the Delete pushbutton is pressed.
			 */
			fileDeleted : {
				parameters : {
					/**
					 * An unique Id of the attached document.
					 * This parameter is deprecated since version 1.28.0, use parameter item instead.
					 * @deprecated Since version 1.28.0. This parameter is deprecated, use parameter item instead.
					 */
					documentId : {type : "string"},
					/**
					 * An item to be deleted from the collection.
					 * Since version 1.28.0.
					 */
					item : {type : "sap.m.UploadCollectionItem"}
				}
			},

			/**
			 * The event is triggered when the name of a chosen file is longer than the value specified with the maximumFilenameLength property (only if provided by the application).
			 */
			filenameLengthExceed : {
				parameters : {
					/**
					 * An unique Id of the attached document.
					 * This parameter is deprecated since version 1.28.0, use parameter files instead.
					 * @deprecated Since version 1.28.0. This parameter is deprecated, use parameter files instead.
					 */
					documentId : {type : "string"},
					/**
					 * A FileList of individually selected files from the underlying system.
					 * Limitation: Internet Explorer 9 supports only single file with property file.name.
					 * Since version 1.28.0.
					 */
					files : {type : "object[]"}
				}
			},

			/**
			 * The event is triggered when the file name is changed.
			 */
			fileRenamed : {
				parameters : {
					/**
					 * An unique Id of the attached document.
					 * This parameter is deprecated since version 1.28.0, use parameter item instead.
					 * @deprecated Since version 1.28.0. This parameter is deprecated, use parameter item instead.
					 */
					documentId : {type : "string"},
					/**
					 * The new file name.
					 * This parameter is deprecated since version 1.28.0, use parameter item instead.
					 * @deprecated Since version 1.28.0. This parameter is deprecated, use parameter item instead.
					 */
					fileName : {type : "string"},
					/**
					 * The renamed UI element as a UploadCollectionItem.
					 * Since version 1.28.0.
					 */
					item : {type : "sap.m.UploadCollectionItem"}
				}
			},

			/**
			 * The event is triggered when the file size of an uploaded file is exceeded (only if the maxFileSize property was provided by the application).
			 * This event is not supported by Internet Explorer 9.
			 */
			fileSizeExceed : {
				parameters : {
					/**
					 * An unique Id of the attached document.
					 * This parameter is deprecated since version 1.28.0, use parameter files instead.
					 * @deprecated Since version 1.28.0. This parameter is deprecated, use parameter files instead.
					 */
					documentId : {type : "string"},
					/**
					 * The size in MB of a file to be uploaded.
					 * This parameter is deprecated since version 1.28.0, use parameter files instead.
					 * @deprecated Since version 1.28.0. This parameter is deprecated, use parameter files instead.
					 */
					fileSize : {type : "string"},
					/**
					 * A FileList of individually selected files from the underlying system.
					 * Limitation: Internet Explorer 9 supports only single file with property file.name.
					 * Since version 1.28.0.
					 */
					files : {type : "object[]"}
				}
			},

			/**
			 * The event is triggered when the file type or the MIME type don't match the permitted types (only if the fileType property or the mimeType property are provided by the application).
			 */
			typeMissmatch : {
				parameters : {
					/**
					* An unique Id of the attached document.
					* This parameter is deprecated since version 1.28.0, use parameter files instead.
					* @deprecated Since version 1.28.0. Use parameter files instead.
					*/
					documentId : {type : "string"},
					/**
					* File type.
					* This parameter is deprecated since version 1.28.0, use parameter files instead.
					* @deprecated Since version 1.28.0. Use parameter files instead.
					*/
					fileType : {type : "string"},
					/**
					* MIME type.
					*This parameter is deprecated since version 1.28.0, use parameter files instead.
					* @deprecated Since version 1.28.0.  Use parameter files instead.
					*/
					mimeType : {type : "string"},
					/**
					* A FileList of individually selected files from the underlying system.
					* Limitation: Internet Explorer 9 supports only single file.
					* Since version 1.28.0.
					*/
					files : {type : "object[]"}
				}
			},

			/**
			 * The event is triggered as soon as the upload request is completed.
			 */
			uploadComplete : {
				parameters : {
					/**
					 * Ready state XHR. This property is deprecated since version 1.28.0., use parameter files instead.
					 * @deprecated Since version 1.28.0. This property is deprecated, use parameter files instead.
					 */
					readyStateXHR : {type : "string"},
					/**
					 * Response of the completed upload request. This property is deprecated since version 1.28.0., use parameter files instead.
					 * @deprecated Since version 1.28.0. This property is deprecated, use parameter files instead.
					 */
					response : {type : "string"},
					/**
					 * Status Code of the completed upload event. This property is deprecated since version 1.28.0., use parameter files instead.
					 * @deprecated Since version 1.28.0. This property is deprecated, use parameter files instead.
					 */
					status : {type : "string"},
					/**
					 * A list of uploaded files. Each entry contains the following members. 
					 * fileName	: The name of a file to be uploaded.
					 * response	: Response message which comes from the server. On the server side this response has to be put within the "body" tags of the response document of the iFrame. It can consist of a return code and an optional message. This does not work in cross-domain scenarios.
					 * responseRaw : HTTP-Response which comes from the server. This property is not supported by Internet Explorer Versions lower than 9.
					 * status	: Status of the XHR request. This property is not supported by Internet Explorer 9 and lower.
					 * headers : HTTP-Response-Headers which come from the server. Provided as a JSON-map, i.e. each header-field is reflected by a property in the header-object, with the property value reflecting the header-field's content. This property is not supported by Internet Explorer 9 and lower.
					 * Since version 1.28.0.
					 */
					files : {type : "object[]"}
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
		sap.m.UploadCollection.prototype._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._oList = new sap.m.List(this.getId() + "-list", {});
		this._oList.addStyleClass("sapMUCList");
		this._cAddItems = 0;
		this.aItems = [];
	};

	/* =========================================================== */
	/* redefinition of setters methods                             */
	/* =========================================================== */

	UploadCollection.prototype.setFileType = function(aFileTypes) {
		if (!aFileTypes) {
			 return this;
		}
		var cLength = aFileTypes.length;
		for (var i = 0; i < cLength; i++) {
			aFileTypes[i] = aFileTypes[i].toLowerCase();
		}
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
		var i, cAitems;

		if (this.aItems.length > 0) {
			cAitems = this.aItems.length;
			// collect items with the status "uploading"
			var aUploadingItems = [];
			for (i = 0; i < cAitems; i++) {
				if (this.aItems[i] && this.aItems[i]._status === UploadCollection._uploadingStatus && this.aItems[i]._percentUploaded !== 100) {
					aUploadingItems.push(this.aItems[i]);
				} else if (this.aItems[i] && this.aItems[i]._status !== UploadCollection._uploadingStatus && this.aItems[i]._percentUploaded === 100 && this.getItems().length === 0) {
					// Skip this rendering because of model refresh only
					aUploadingItems.push(this.aItems[i]);
				}
			}
			if (aUploadingItems.length === 0) {
				this.aItems = [];
				this.aItems = this.getItems();
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
		this._oList.setAggregation("headerToolbar", this.oHeaderToolbar, true); // note: suppress re-rendering;
		if (this.sDeletedItemId){
			jQuery(document.activeElement).blur();
		}
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
					if (!sap.ui.Device.os.ios) {
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
		if (this._oFileUploader) {
			this._oFileUploader.destroy();
			this._oFileUploader = null;
		}
		if (this.oHeaderToolbar) {
			this.oHeaderToolbar.destroy();
			this.oHeaderToolbar = null;
		}
		if (this.oNumberOfAttachmentsLabel) {
			this.oNumberOfAttachmentsLabel.destroy();
			this.oNumberOfAttachmentsLabel = null;
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
			oListItem,
			sButton,
			sValueStateText;

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
			if (this.sErrorState === "Error") {
				bEnabled = false;
			}
			oEditButton = new sap.m.Button({
				id : sItemId + "-editButton",
				icon : "sap-icon://edit",
				type : sap.m.ButtonType.Transparent,
				enabled : bEnabled,
				visible : oItem.getVisibleEdit(),
				press : [oItem, this._handleEdit, this]
			}).addStyleClass("sapMUCEditBtn");
		}

		if (sStatus === UploadCollection._displayStatus) {
			sButton = "deleteButton";
			oDeleteButton = this._createDeleteButton(sItemId, sButton, oItem, this.sErrorState);
			oDeleteButton.attachPress(function(oEvent) {
				sap.m.UploadCollection.prototype._handleDelete(oEvent, that);
			});
		}

		if (sStatus === UploadCollection._uploadingStatus && !(sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9)) {
			sButton = "terminateButton";
			oDeleteButton = this._createDeleteButton(sItemId, sButton, oItem, this.sErrorState);
			oDeleteButton.attachPress(function(oEvent) {
				sap.m.UploadCollection.prototype._handleTerminate(oEvent, that);
			});
		}

		oButtonsHL = new sap.ui.layout.HorizontalLayout(sItemId + "-ba_innerHL", {
			content : [oOkButton, oCancelButton, oEditButton, oDeleteButton]
		}).addStyleClass("sapMUCBtnHL");
		/* fallback for IE9 as it doesn't support flex; text truncation doesn't take place but at least the buttons are displayed correctly in full screen mode */
		if (sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9) {
			oButtonsHL.addStyleClass("sapMUCBtnNoFlex");
		}

		// /////////////////// ListItem Text Layout
		if (sStatus === UploadCollection._displayStatus || sStatus === UploadCollection._uploadingStatus) {
			bEnabled = true;
			if (this.sErrorState === "Error" || !jQuery.trim(oItem.getUrl())) {
				bEnabled = false;
			}
			oFileNameLabel = new sap.m.Link(sItemId + "-ta_filenameHL", {
				enabled : bEnabled,
				target : "_blank",
				press : function(oEvent) {
					sap.m.UploadCollection.prototype._triggerLink(oEvent, that);
				}
			}).addStyleClass("sapMUCFileName");
			oFileNameLabel.setModel(oItem.getModel());
			oFileNameLabel.setText(sFileNameLong);
		}

		if (sStatus === UploadCollection._displayStatus) {
			oUploadedDateLabel = new sap.m.Label(sItemId + "-ta_date");
			oUploadedDateLabel.setModel(oItem.getModel());
			oUploadedDateLabel.setText(oItem.getUploadedDate() + " " + oItem.getContributor());
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
				if (sFileName.length === 0) {
					sValueStateText = this._oRb.getText("UPLOADCOLLECTION_TYPE_FILENAME");
				} else {
					sValueStateText = this._oRb.getText("UPLOADCOLLECTION_EXISTS");
				}
			}

			// filename
			oFileNameEditBox = new sap.m.Input(sItemId + "-ta_editFileName", {
				type : sap.m.InputType.Text,
				fieldWidth: "76%",
				valueState : sValueState,
				valueStateText : sValueStateText,
				showValueStateMessage: bShowValueStateMessage,
				description: oFile.extension
			}).addStyleClass("sapMUCEditBox");
			oFileNameEditBox.setModel(oItem.getModel());
			oFileNameEditBox.setValue(sFileName);

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
			if (this.sErrorState === "Error" || !jQuery.trim(oItem.getProperty("url"))) {
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
			if (bDecorative === false) {
				oItemIcon.attachPress(function(oEvent) {
					sap.m.UploadCollection.prototype._triggerLink(oEvent, that);
				});
			}
		}

		if (sStatus === "Edit") {
			oButtonsHL.addStyleClass("sapMUCEditMode");
			} else {
				oButtonsHL.removeStyleClass("sapMUCEditMode");
			}
		
		oListItem = new sap.m.CustomListItem(sItemId + "-cli", {
			content : [oBusyIndicator, oItemIcon, oTextVL, oButtonsHL]
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
		var sFileName;
		var sMessageText;
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

		if (oContext.editModeItem) {
			//In case there is a list item in edit mode, the edit mode has to be finished first.
			sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, oContext.editModeItem, true);
			if (oContext.sErrorState === "Error") {
				//If there is an error, the deletion must not be triggered
				return this;
			}
		}

		if (!!aItems[index]) {
			// popup delete file
			sFileName =  aItems[index].getFileName();
			if (!sFileName) {
				sMessageText = this._oRb.getText("UPLOADCOLLECTION_DELETE_WITHOUT_FILENAME_TEXT");
			} else {
				sMessageText = this._oRb.getText("UPLOADCOLLECTION_DELETE_TEXT", sFileName);
			}
			oContext._oItemForDelete = aItems[index];
			sap.m.MessageBox.show(sMessageText, {
				title : this._oRb.getText("UPLOADCOLLECTION_DELETE_TITLE"),
				actions : [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				onClose : oContext._onCloseMessageBoxDeleteItem.bind(oContext),
				dialogId : "messageBoxDeleteFile",
				styleClass : sCompact
			});
		}
	};

	/**
	 * @description Handling of the termination of an uploading file
	 * @param {sap.m.MessageBox.Action} oAction
	 * @private
	 */
	UploadCollection.prototype._onCloseMessageBoxDeleteItem = function (oAction) {
		this._oItemForDelete._status = UploadCollection._toBeDeletedStatus;
		if (oAction === sap.m.MessageBox.Action.OK) {
			// fire event
			this.fireFileDeleted({
				// deprecated
				documentId : this._oItemForDelete.getDocumentId(),
				// new
				item : this._oItemForDelete
			});
			this._oItemForDelete._status = UploadCollection._toBeDeletedStatus;
		}
	};

	/**
	 * @description Handling of termination of an uploading process
	 * @param {object} oEvent Event of the upload termination
	 * @param {object} oContext Context of the upload termination
	 * @private
	 */
	UploadCollection.prototype._handleTerminate = function(oEvent, oContext) {
		var sCompact = "", aUploadedFiles, oFileList, oListItem, oDialog, i, j, sFileNameLong;
		if (jQuery.sap.byId(oContext.sId).hasClass("sapUiSizeCompact")) {
			sCompact = "sapUiSizeCompact";
		}
	  // popup terminate upload file
		aUploadedFiles = this._splitString2Array(oContext._getFileUploader().getProperty("value"), oContext);
		for (i = 0; i < aUploadedFiles.length; i++) {
			if (aUploadedFiles[i].length === 0) {
				aUploadedFiles.splice(i, 1);
			}
		}
		for (i = 0; i < oContext.aItems.length; i++) {
			sFileNameLong = oContext.aItems[i].getFileName();
			if (oContext.aItems[i]._status === UploadCollection._uploadingStatus && aUploadedFiles.indexOf(sFileNameLong)) {
				aUploadedFiles.push(sFileNameLong);
			}
		}
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
							if ( aUploadedFiles[i] === oContext.aItems[j].getFileName() && oContext.aItems[j]._status === UploadCollection._displayStatus) {
								oContext.fireFileDeleted({
									documentId : oContext.aItems[j].getDocumentId()
								});
								oContext.aItems[j]._status = UploadCollection._toBeDeletedStatus;
								break;
							} else if (aUploadedFiles[i] === oContext.aItems[j].getFileName() && oContext.aItems[j]._status === UploadCollection._uploadingStatus) {
								oContext.aItems[j]._status = UploadCollection._toBeDeletedStatus;
								oContext.aItems.splice(j, 1);
								oContext.removeItem(oContext.aItems[j]);
								break;
							}
						}
					}
					//call FileUploader terminate
					oContext._getFileUploader().abort();
					oContext.invalidate();
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
	UploadCollection.prototype._handleEdit = function(oEvent, oItem) {
		if (this.sErrorState !== "Error") {
			oItem._status = "Edit";
			this.editModeItem = oEvent.getSource().getId().split("-editButton")[0];
			this.invalidate();
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
						} else if (oEvent.target.id.lastIndexOf("ia_imageHL") < 0 && 
								oEvent.target.id.lastIndexOf("ia_iconHL") < 0 && 
								oEvent.target.id.lastIndexOf("deleteButton") < 0 && 
								oEvent.target.id.lastIndexOf("ta_editFileName") < 0) {
			if (oEvent.target.id.lastIndexOf("cli") > 0) {
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
		var sNewFileName;
		var iSourceLine = sSourceId.split("-").pop();
		var sOrigFullFileName = oContext.aItems[iSourceLine].getProperty("fileName");
		var oFile = UploadCollection.prototype._splitFilename(sOrigFullFileName);
		var oInput = sap.ui.getCore().byId(sSourceId + "-ta_editFileName");
		var sErrorStateBefore = oContext.aItems[iSourceLine].errorState;
		var sChangedNameBefore = oContext.aItems[iSourceLine].changedFileName;

		// get new/changed file name and remove possible leading spaces
		if (oEditbox !== null) {
			sNewFileName = oEditbox.value.replace(/^\s+/,"");
		}

		//prepare the Id of the UI element which will get the focus
		var aSrcIdElements = oEvent.srcControl ? oEvent.srcControl.getId().split("-") : oEvent.oSource.getId().split("-");
		aSrcIdElements = aSrcIdElements.slice(0, 3);
		oContext.sFocusId = aSrcIdElements.join("-") + "-cli";

		if (!!sNewFileName && (sNewFileName.length > 0)) {
			var iSourceLine = sSourceId.split("-").pop();
			oContext.aItems[iSourceLine]._status = UploadCollection._displayStatus;
			// get original file name
			var sOrigFullFileName = oContext.aItems[iSourceLine].getProperty("fileName");
			var oFile = UploadCollection.prototype._splitFilename(sOrigFullFileName);
			// in case there is a difference additional activities are necessary
			if (oFile.name !== sNewFileName) {
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
						if (sErrorStateBefore !== "Error" || sChangedNameBefore !== sNewFileName){
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
					oContext._oItemForRename = oContext.aItems[iSourceLine];
					oContext._onEditItemOk.bind(oContext)(sNewFileName + oFile.extension);
				}
			} else {
				oContext.sErrorState = null;
				oContext.aItems[iSourceLine].errorState = null;
				// nothing changed -> nothing to do!
				oContext.editModeItem = null;
				if (bTriggerRenderer) {
					oContext.invalidate();
				}
			}
		} else if (oEditbox !== null) {
			// no new file name provided
			oContext.aItems[iSourceLine]._status = "Edit";
			oContext.aItems[iSourceLine].errorState = "Error";
			oContext.aItems[iSourceLine].changedFileName = sNewFileName;
			oContext.sErrorState = "Error";
			if (sErrorStateBefore !== "Error" || sChangedNameBefore !== sNewFileName) {
				oContext.aItems[iSourceLine].invalidate();
			}
		}
	};

	/**
	 * @description Handling of edit item
	 * @private
	 */
	UploadCollection.prototype._onEditItemOk = function (sNewFileName) {
		if (this._oItemForRename) {
			this._oItemForRename.setFileName(sNewFileName);
			// fire event
			this.fireFileRenamed({
				// deprecated
				documentId : this._oItemForRename.getProperty("documentId"),
				fileName : sNewFileName,
				// new
				item : this._oItemForRename
			});
		}
		delete this._oItemForRename;
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
		oContext.sFocusId = oContext.editModeItem + "-cli";
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
			var sRequestValue, iCountFiles, i, sFileName;
			this._cAddItems = 0;
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
				// FileUploader fires the change event also if no file was selected by the user
				// If so, do nothing.
				if (iCountFiles === 0) {
					return;
				}
				this._oFileUploader.removeAllAggregation("headerParameters", true);
				this.removeAllAggregation("headerParameters", true);
			}
			this._oFileUploader.removeAllAggregation("parameters", true);
			this.removeAllAggregation("parameters", true);

			// IE9
			if (sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9) {
				var oFile = {
						name : oEvent.getParameter("newValue")
					};
				var oParameters = {
						files : [oFile]
					};
				this.fireChange({
					// deprecated
					getParameter : function(sParameter) {
						if (sParameter === "files") {
							return [oFile];
						}
					},
					getParameters : function() {
						return oParameters;
					},
					mParameters : oParameters,
					// new
					files : [oFile]
				});

			} else {
				this.fireChange({
					// deprecated
					getParameter : function(sParameter) {
						if (sParameter) {
							return oEvent.getParameter(sParameter);
						}
					},
					getParameters : function() {
						return oEvent.getParameters();
					},
					mParameters : oEvent.getParameters(),
					// new
					files : oEvent.getParameter("files")
				});
			}

			var aParametersAfter = this.getAggregation("parameters");
			// parameters
			if (aParametersAfter) {
				jQuery.each(aParametersAfter, function (iIndex, parameter) {
					var oParameter = new sap.ui.unified.FileUploaderParameter({
						name : parameter.getProperty("name"),
						value: parameter.getProperty("value")
					});
					that._oFileUploader.addParameter(oParameter);
				});
			}
			var oItem;
			if (sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9) {
				oItem = new sap.m.UploadCollectionItem();
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
				this._cAddItems++;
			} else {
				this._requestIdValue = this._requestIdValue + 1;
				sRequestValue = this._requestIdValue.toString();
				var aHeaderParametersAfter = this.getAggregation("headerParameters");
				for (i = 0; i < iCountFiles; i++) {
					oItem = new sap.m.UploadCollectionItem();
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
					this._cAddItems++;
				}
				//headerParameters
				if (aHeaderParametersAfter) {
					jQuery.each(aHeaderParametersAfter, function (iIndex, headerParameter) {
						that._oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
							name : headerParameter.getProperty("name"),
							value: headerParameter.getProperty("value")
						}));
					});
				}
				that._oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
					name : this._requestIdName,
					value: sRequestValue
				}));
			}
		}
	};

	/**
	 * @description Handling of the Event filenameLengthExceed of the fileUploader
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onFilenameLengthExceed = function(oEvent) {
		var oFile = {name: oEvent.getParameter("fileName")};
		var aFiles = [oFile];
		this.fireFilenameLengthExceed({
			// deprecated
			getParameter : function(sParameter) {
				if (sParameter) {
					return oEvent.getParameter(sParameter);
				}
			},
			getParameters : function() {
				return oEvent.getParameters();
			},
			mParameters : oEvent.getParameters(),
			// new
			files : aFiles
		});
	};

	/**
	 * @description Handling of the Event fileSizeExceed of the fileUploader
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onFileSizeExceed = function(oEvent){
		if (sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9) { // IE9
			var sFileName = oEvent.getParameter("newValue");
			var oFile = {
					name : sFileName
				};
			var oParameters = {
					newValue : sFileName,
					files : [oFile]
				};
			this.fireFileSizeExceed({
				// deprecated
				getParameter : function(sParameter) {
					if (sParameter === "files") {
						return [oFile];
					} else if (sParameter === "newValue") {
						return sFileName;
					}
				},
				getParameters : function() {
					return oParameters;
				},
				mParameters : oParameters,
				// new
				files : [oFile]
			});
		} else { // other browsers
			var oFile = {
					name: oEvent.getParameter("fileName"),
					fileSize: oEvent.getParameter("fileSize")};
			this.fireFileSizeExceed({
				// deprecated
				getParameter : function(sParameter) {
					if (sParameter) {
						return oEvent.getParameter(sParameter);
					}
				},
				getParameters : function() {
					return oEvent.getParameters();
				},
				mParameters : oEvent.getParameters(),
				// new
				files : [oFile]
			});
		}
	};

	/**
	 * @description Handling of the Event typeMissmatch of the fileUploader
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onTypeMissmatch = function(oEvent) {
		var oFile = {name: oEvent.getParameter("fileName"),
					fileType: oEvent.getParameter("fileType"),
					mimeType: oEvent.getParameter("mimeType")};
		var aFiles = [oFile];
		this.fireTypeMissmatch({
			// deprecated
			getParameter : function(sParameter) {
				if (sParameter) {
					return oEvent.getParameter(sParameter);
				}
			},
			getParameters : function() {
				return oEvent.getParameters();
			},
			mParameters : oEvent.getParameters(),
			// new
			files : aFiles
		});
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
			for (i = 0; i < cItems; i++) {
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
			var i, sRequestId, sUploadedFile, cItems, bUploadSuccessful = checkRequestStatus();
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
					if (this.aItems[i].getProperty("fileName") === sUploadedFile &&
							this.aItems[i]._status === UploadCollection._uploadingStatus &&
							bUploadSuccessful) {
						this.aItems[i]._percentUploaded = 100;
						this.aItems[i]._status = UploadCollection._displayStatus;
						break;
					} else if (this.aItems[i].getProperty("fileName") === sUploadedFile &&
							this.aItems[i]._status === UploadCollection._uploadingStatus) {
						this.aItems.splice(i, 1);
						break;
					}
				} else if (this.aItems[i].getProperty("fileName") === sUploadedFile &&
									this.aItems[i]._requestIdName === sRequestId &&
									this.aItems[i]._status === UploadCollection._uploadingStatus &&
									bUploadSuccessful) {
					this.aItems[i]._percentUploaded = 100;
					this.aItems[i]._status = UploadCollection._displayStatus;
					break;
				} else if (this.aItems[i].getProperty("fileName") === sUploadedFile &&
									this.aItems[i]._requestIdName === sRequestId &&
									this.aItems[i]._status === UploadCollection._uploadingStatus) {
					this.aItems.splice(i, 1);
					break;
				}
			}
			this.fireUploadComplete({
				// deprecated
				getParameter : oEvent.getParameter,
				getParameters : oEvent.getParameters,
				mParameters : oEvent.getParameters(),
				// new Stuff
				files : [{
					fileName : oEvent.getParameter("fileName"),
					responseRaw : oEvent.getParameter("responseRaw"),
					reponse : oEvent.getParameter("response"),
					status : oEvent.getParameter("status"),
					headers : oEvent.getParameter("headers")
				}]
			});
		}
		
		function checkRequestStatus () {
			var sRequestStatus = oEvent.getParameter("status").toString() || "200"; // In case of IE < 10 this will not work.
			if (sRequestStatus[0] === "2" || sRequestStatus[0] === "3") {
				return true;
			} else {
				return false;
			}
		}
	};

	/**
	 * @description Handling of the Event uploadProgress of the fileUploader to forward the Event to the application
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadProgress = function(oEvent) {
		if (oEvent) {
			var i, sUploadedFile, sPercentUploaded, iPercentUploaded, sRequestId, cItems;
			sUploadedFile = oEvent.getParameter("fileName");
			sRequestId = this._getRequestId(oEvent);
			iPercentUploaded = Math.round(oEvent.getParameter("loaded") / oEvent.getParameter("total") * 100);
			if (iPercentUploaded === 100) {
				iPercentUploaded = iPercentUploaded - 1;
			}
			sPercentUploaded = this._oRb.getText("UPLOADCOLLECTION_UPLOADING", [iPercentUploaded]);
			cItems = this.aItems.length;
			for (i = 0; i < cItems; i++) {
				if (this.aItems[i].getProperty("fileName") === sUploadedFile && this.aItems[i]._requestIdName == sRequestId && this.aItems[i]._status === UploadCollection._uploadingStatus) {
					sap.ui.getCore().byId(this.aItems[i].getId() + "-ta_progress").setText(sPercentUploaded);
					this.aItems[i]._percentUploaded = iPercentUploaded;
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
		var oHeaderParams;
		oHeaderParams = oEvent.getParameter("requestHeaders");
		if (!oHeaderParams) {
			return null;
		}
		for (var j = 0; j < oHeaderParams.length; j++) {
			if (oHeaderParams[j].name == this._requestIdName) {
				return oHeaderParams[j].value;
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
				uploadOnChange : true,
				sameFilenameAllowed : true,
				uploadUrl : this.getUploadUrl(),
				useMultipart : false,
				sendXHR : bSendXHR, // false for IE8, IE9
				change : function(oEvent) {
					that._onChange(oEvent);
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
			var sTooltip = this._oFileUploader.getTooltip();
			if (!sTooltip && !sap.ui.Device.browser.msie) {
				// in case the tooltip is NOT overwritten, the default tooltip should NOT be chosen!
				this._oFileUploader.setTooltip(" ");
			}
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
		if (jQuery.type(sFileExtension) === "string") {
			 sFileExtension = sFileExtension.toLowerCase();
		}

		switch (sFileExtension) {
			case '.bmp' :
			case '.jpg' :
			case '.jpeg' :
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
	 * @description Trigger of the link which will be executed when the icon or image was clicked
	 * @param {Object} oEvent when clicking or pressing of the icon or image
	 * @private
	 */
	UploadCollection.prototype._triggerLink = function(oEvent, oContext) {
		var iLine = null;
		var aId;

		if (oContext.editModeItem) {
			//In case there is a list item in edit mode, the edit mode has to be finished first.
			sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, oContext.editModeItem, true);
			if (oContext.sErrorState === "Error") {
				//If there is an error, the link of the list item must not be triggered.
				return this;
			}
			oContext.sFocusId = oEvent.getParameter("id");
		}
		aId = oEvent.oSource.getId().split("-");
		iLine = aId[aId.length - 2];
		sap.m.URLHelper.redirect(oContext.aItems[iLine].getProperty("url"), true);

	};

	// ================================================================================
	// Keyboard activities
	// ================================================================================
	/**
	 * @description Keyboard support: Handling of different key activities
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

		if (iLength === 0){
			var oFileUploader = jQuery.sap.byId(oContext._oFileUploader.sId);
			var oFocusObj = oFileUploader.find(":button");
			jQuery.sap.focus(oFocusObj);
		} else {
			var iLineNumber = DeletedItemId.split("-").pop();
			//Deleted item is not the last one of the list
			if ((iLength - 1) >= iLineNumber) {
				sLineId = DeletedItemId + "-cli";
			} else {
				sLineId = oContext.aItems.pop().sId + "-cli";
			}
			sap.m.UploadCollection.prototype._setFocus2LineItem(sLineId);
			this.sDeletedItemId = null;
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
		jQuery.sap.focus($oObj);
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
		var oLink;
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
			case "cli":
        //Display mode
        sLinkId = oEvent.target.id.split(sTarget)[0] + "ta_filenameHL";
        oLink = sap.ui.getCore().byId(sLinkId);
        if (oLink.getEnabled()) {
	        var iLine = oEvent.target.id.split("-")[2];
	        sap.m.URLHelper.redirect(oContext.aItems[iLine].getProperty("url"), true);
        }
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
			oContext.sFocusId = oContext.editModeItem + "-cli";
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

		if (oObj !== undefined) {
			if (oObj._status == UploadCollection._displayStatus) {
				//focus at list line (status = "display") and F2 pressed --> status = "Edit"
				o$Obj = jQuery.sap.byId(oEvent.target.id);
				var o$EditButton = o$Obj.find("[id$='-editButton']");
				var oEditButton = sap.ui.getCore().byId(o$EditButton[0].id);
				if (oEditButton.getEnabled()) {
					if (oContext.editModeItem){
						sap.m.UploadCollection.prototype._handleClick(oEvent, oContext, oContext.editModeItem);
					}
					if (oContext.sErrorState !== "Error") {
						oEditButton.firePress();
					}
				}
			} else {
				//focus at list line(status= "Edit") and F2 is pressed --> status = "display", changes will be saved and
				//if the focus is at any other object of the list item
				sap.m.UploadCollection.prototype._handleClick(oEvent, oContext, oContext.editModeItem);
			}
		} else {
			if (oEvent.target.id.search(oContext.editModeItem) === 0) {
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
		if (oContext.getMultiple() === true && !(sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9)) {
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
		if (aItems.length === 0 || !sFilename) {
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
		if (aNameSplit.length == 1) {
			oResult.extension = "";
			oResult.name = aNameSplit.pop();
			return oResult;
		}
		oResult.extension = "." + aNameSplit.pop();
		oResult.name = aNameSplit.join(".");
		return oResult;
	};

	return UploadCollection;

}, /* bExport= */ true);
