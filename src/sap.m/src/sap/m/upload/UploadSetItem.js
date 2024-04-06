/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/library",
	"sap/ui/core/Element",
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool",
	"sap/ui/core/HTML",
	"sap/m/library",
	"sap/m/Button",
	"sap/m/CustomListItem",
	"sap/m/Image",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/ProgressIndicator",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/ui/core/Lib"
], function (Log, CoreLibrary, Element, Icon, IconPool, HTML,
			 MobileLibrary, Button, CustomListItem, Image, Input,
			 Label, Link, ProgressIndicator, VBox, HBox, CoreLib) {
	"use strict";

	var UploadType = MobileLibrary.UploadType;

	/**
	 * Constructor for a new UploadSetItem.
	 *
	 * @param {string} [sId] ID for the new control, will be generated automatically if no ID is provided.
	 * @param {object} [mSettings] Initial settings for the new control.
	 * @class Item that represents one file to be uploaded using the {@link sap.m.upload.UploadSet} control.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.63
	 * @alias sap.m.upload.UploadSetItem
	 */
	var UploadSetItem = Element.extend("sap.m.upload.UploadSetItem", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Enables or disables the remove button.
				 */
				enabledRemove: {type: "boolean", defaultValue: true},
				/**
				 * Enables or disables the edit button.
				 */
				enabledEdit: {type: "boolean", defaultValue: true},
				/**
				 * Specifies the name of the uploaded file.
				 */
				fileName: {type: "string", defaultValue: null},
				/**
				 * Specifies the MIME type of the file.
				 */
				mediaType: {type: "string", defaultValue: null},
				/**
				 * Specifies the URL where the thumbnail of the file is located. Can also be set to an SAPUI5 icon URL.
				 */
				thumbnailUrl: {type: "string", defaultValue: null},
				/**
				 * State of the item relevant to its upload process.
				 */
				uploadState: {type: "sap.m.UploadState", defaultValue: null},
				/**
				 * Specifies the URL where the file is located.
				 * <br>If the application doesn't provide a value for this property, the icon and
				 * the file name are not clickable in {@link sap.m.upload.UploadSet}.
				 */
				url: {type: "string", defaultValue: null},
				/**
				 * Shows or hides the remove button.
				 */
				visibleRemove: {type: "boolean", defaultValue: true},
				/**
				 * Shows or hides the edit button.
				 */
				visibleEdit: {type: "boolean", defaultValue: true},
				/**
				 * URL where the uploaded files will be stored. If empty, uploadUrl from the uploader is considered.
				 * @since 1.90
				 */
				uploadUrl: {type: "string", defaultValue: null},
				/**
				 * Defines the selected state of the UploadSetItem.
				 * @since 1.100.0
				 */
				 selected: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				}
			},
			defaultAggregation: "attributes",
			aggregations: {
				/**
				 * Attributes of the item.
				 */
				attributes: {
					type: "sap.m.ObjectAttribute",
					multiple: true,
					singularName: "attribute"
				},
				/**
				 * Markers of the item.
				 */
				markers: {
					type: "sap.m.ObjectMarker",
					multiple: true,
					singularName: "marker"
				},
				/**
				 * Statuses of the item.
				 */
				statuses: {
					type: "sap.m.ObjectStatus",
					multiple: true,
					singularName: "status"
				},
				/**
				 * Statuses of the item, but it would be appearing in the markers section
				 * @since 1.117
				 */
				markersAsStatus: {
					type: "sap.m.ObjectStatus",
					multiple: true,
					singularName: "markerAsStatus"
				},
				/**
				 * Header fields to be included in the header section of an XMLHttpRequest (XHR) request
				 * @since 1.90
				 */
				headerFields: {type: "sap.ui.core.Item", multiple: true, singularName: "headerField"}
			},
			events: {
				/**
				 * This event is fired when an open action is invoked on an item.
				 */
				openPressed: {
					 parameters: {
						/**
						* The item on which the open action has been invoked.
						*/
						item: {type: "sap.m.upload.UploadSetItem"}
					},
					allowPreventDefault: true
				},
				/**
				 * This event is fired when a remove action is invoked on an item.
				 */
				removePressed: {
					 parameters: {
						/**
						* The item on which the open action has been invoked.
						*/
						item: {type: "sap.m.upload.UploadSetItem"}
					},
					allowPreventDefault: true
				}
			}
		}
	});

	var UploadState = MobileLibrary.UploadState,
		FlexJustifyContent = MobileLibrary.FlexJustifyContent,
		ValueState = CoreLibrary.ValueState;

	var DynamicItemContent = HTML.extend("sap.m.upload.DynamicItemContent", {
		metadata: {
			library: "sap.m",
			associations: {
				item: {type: "sap.m.upload.UploadSetItem"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				var sItemId = oControl.getAssociation("item");
				var oItem = Element.getElementById(sItemId);
				oRm.openStart("div");
				oRm.class("sapMUCTextContainer");
				if (this._bInEditMode) {
					oRm.class("sapMUCEditMode");
				}
				oRm.attr("id", oControl.getId());
				oRm.openEnd();
				oRm.openStart("div").class("sapMUSTextInnerContainer").openEnd();
				oRm.renderControl(oItem._bInEditMode ? oItem._getFileNameEdit() : oItem._getFileNameLink());
				oItem._renderMarkers(oRm);
				oItem._renderMarkersAsStatus(oRm);
				oRm.close("div");

				oItem._renderAttributes(oRm);
				oItem._renderStatuses(oRm);
				oRm.close("div");
				oItem._renderButtons(oRm);
			}
		}
	});

	/* ========= */
	/* Constants */
	/* ========= */

	UploadSetItem.MEGABYTE = 1048576;
	UploadSetItem.IMAGE_FILE_ICON = "sap-icon://card";

	/* ================== */
	/* Lifecycle handling */
	/* ================== */

	UploadSetItem.prototype.init = function () {
		this._oRb = CoreLib.getResourceBundleFor("sap.m");

		// Inner controls
		this._oListItem = null;
		this._oIcon = null;
		this._oFileNameLink = null;
		this._oFileNameEdit = null;
		this._oDynamicContent = null;

		// Buttons
		this._oRestartButton = null;
		this._oEditButton = null;
		this._oDeleteButton = null;
		this._oTerminateButton = null;
		this._oConfirmRenameButton = null;
		this._oCancelRenameButton = null;

		// State & progress
		this._oProgressBox = null;
		this._oProgressIndicator = null;
		this._oStateLabel = null;
		this._oProgressLabel = null;

		this._oFileObject = null;
		this._fFileSize = null;
		this._bInEditMode = false;
		this._bContainsError = false;

		// Restriction flags
		this._bFileTypeRestricted = false;
		this._bNameLengthRestricted = false;
		this._bSizeRestricted = false;
		this._bMediaTypeRestricted = false;

		//Deafult upload type
		this._sUploadType = UploadType.Native;
	};

	/* ===================== */
	/* Overriden API methods */
	/* ===================== */

	UploadSetItem.prototype.setFileName = function (sFileName) {
		var oFile;
		if (this.getFileName() !== sFileName) {
			this.setProperty("fileName", sFileName, true);
			// File name related controls available no sooner than a parent is set
			if (this.getParent()) {
				this._getFileNameLink().setText(sFileName);
				oFile = UploadSetItem._splitFileName(sFileName);
				this._getFileNameEdit().setValue(oFile.name);
				this._checkNameLengthRestriction(this.getParent().getMaxFileNameLength());
				this._checkTypeRestriction(this.getParent().getFileTypes());
			}
		}

		return this;
	};

	UploadSetItem.prototype.setUploadState = function (sUploadState) {
		var oIndy = this._getProgressIndicator(),
			oState = this._getStateLabel(),
			bIncomplete = (sUploadState !== UploadState.Complete),
			bUploading = (sUploadState === UploadState.Uploading);

		this.setProperty("uploadState", sUploadState, true);

		oIndy.setVisible(bIncomplete);
		oState.setVisible(bIncomplete);
		this._getProgressLabel().setVisible(bIncomplete);

		switch (sUploadState) {
			case UploadState.Complete:
				oIndy.setState(ValueState.None);
				oState.setText("");
				break;
			case UploadState.Error:
				oIndy.setState(ValueState.Error);
				oState.setText(this._oRb.getText("UPLOAD_SET_ITEM_ERROR_STATE"));
				break;
			case UploadState.Ready:
				oIndy.setState(ValueState.None);
				oState.setText(this._oRb.getText("UPLOAD_SET_ITEM_READY_STATE"));
				break;
			case UploadState.Uploading:
				oIndy.setState(ValueState.Information);
				oState.setText(this._oRb.getText("UPLOAD_SET_ITEM_UPLOADING_STATE"));
				break;
		}

		if (this.getParent()) {
			this._getRestartButton().setVisible(sUploadState === UploadState.Error);
			if (this.getVisibleEdit()) {
				this._getEditButton().setVisible(!bUploading);
			}
			if (this.getVisibleRemove()) {
				this._getDeleteButton().setVisible(!bUploading);
			}
			this._getTerminateButton().setVisible(this.getParent().getTerminationEnabled() && bUploading);
		}

		return this;
	};

	UploadSetItem.prototype.setEnabledRemove = function (bEnable) {
		if (this.getEnabledRemove() !== bEnable) {
			this.setProperty("enabledRemove", bEnable, true);
			if (this.getParent()) {
				this._getDeleteButton().setEnabled(bEnable);
			}
		}
		return this;
	};

	UploadSetItem.prototype.setVisibleRemove = function (bVisible) {
		if (this.getVisibleRemove() !== bVisible) {
			this.setProperty("visibleRemove", bVisible, true);
			if (this.getParent()) {
				this._getDeleteButton().setVisible(bVisible);
			}
		}
		return this;
	};

	UploadSetItem.prototype.setEnabledEdit = function (bEnable) {
		if (this.getEnabledEdit() !== bEnable) {
			this.setProperty("enabledEdit", bEnable, true);
			if (this.getParent()) {
				this._getEditButton().setEnabled(bEnable);
				if (!bEnable) {
					this.getParent().handleItemGetDisabled(this);
				}
			}
		}
		return this;
	};

	UploadSetItem.prototype.setVisibleEdit = function (bVisible) {
		if (this.getVisibleEdit() !== bVisible) {
			this.setProperty("visibleEdit", bVisible, true);
			if (this.getParent()) {
				this._getEditButton().setVisible(bVisible);
				if (!bVisible) {
					this.getParent().handleItemGetDisabled(this);
				}
			}
		}
		return this;
	};

	UploadSetItem.prototype.setThumbnailUrl = function(sUrl) {
		if (this.getThumbnailUrl() != sUrl) {
			this.setProperty("thumbnailUrl", sUrl, true);
			// Below we handle change of icon case for existing uploadSetItem.For creation of uploadSetItem icon is created using _getIcon method.
			if (this._oListItem && sUrl) {
				for (var i = 0; i < this._oListItem.getContent().length; i++) {
					var oItem = this._oListItem.getContent()[i];
					if (oItem && oItem.isA(["sap.ui.core.Icon", "sap.m.Image"])) {
						this._oListItem.removeContent(oItem);
						if (this._oIcon) {
							this._oIcon.destroy();
							this._oIcon = null;
						}
						this._oIcon = IconPool.createControlByURI({
							id: this.getId() + "-thumbnail",
							src: sUrl,
							decorative: false
						}, Image);
						this._oIcon.addStyleClass("sapMUCItemImage sapMUCItemIcon");
						this._oListItem.insertContent(this._oIcon, 0);
					}
				}
			}
		}
		return this;
	};

	UploadSetItem.prototype.setSelected = function(selected) {
		if (this.getSelected() !== selected) {
			this.setProperty("selected", selected, true);
			this.fireEvent("selected");
		}
		return this;
	};

	/* ============== */
	/* Public methods */
	/* ============== */

	/**
	 * Returns file object.
	 *
	 * @public
	 * @returns {File|Blob} File object.
	 *
	 */
	UploadSetItem.prototype.getFileObject = function () {
		return this._oFileObject;
	};

	/**
	 * Returns list item.
	 *
	 * @public
	 * @returns {sap.m.CustomListItem} List item.
	 *
	 */
	UploadSetItem.prototype.getListItem = function () {
		return this._getListItem();
	};

	/**
	 * Set current progress.
	 * @param {int} iProgress Current progress.
	 *
	 * @public
	 * @returns {this} Returns instance for chaining.
	 *
	 */
	UploadSetItem.prototype.setProgress = function (iProgress) {
		var $busyIndicator;

		this._getProgressLabel().setText(iProgress + "%");

		$busyIndicator = this.$("-busyIndicator");
		if (iProgress === 100) {
			$busyIndicator.attr("aria-label", this._oRb.getText("UPLOAD_SET_UPLOAD_COMPLETED"));
		} else {
			$busyIndicator.attr("aria-valuenow", iProgress);
		}

		this._getProgressIndicator().setPercentValue(iProgress);

		return this;
	};

	/**
	 * Downloads the item. Only possible when the item has a valid URL specified in the <code>url</code> property.
	 * @param {boolean} bAskForLocation Whether to ask for a location where to download the file or not.
	 * @public
	 * @returns {boolean} <code>true</code> if download is possible, <code>false</code> otherwise.
	 */
	UploadSetItem.prototype.download = function (bAskForLocation) {
		var oParent = this.getParent();
		if (!oParent) {
			Log.warning("Download cannot proceed without a parent association.");
			return false;
		}

		return oParent._getActiveUploader().downloadItem(this, [], bAskForLocation);
	};

	/**
	 * Validates if the item is restricted, which means that it is restricted for the file type, media type, maximum file name length and maximum file size limit.
	 *
	 * @public
	 * @since 1.98
	 * @returns {boolean} <code>true</code> if item is restricted, <code>false</code> otherwise.
	 *
	 */
	 UploadSetItem.prototype.isRestricted = function () {
		return this._isRestricted();
	};

	/**
	 * Returns edit state of the item.
	 *
	 * @public
	 * @since 1.104.0
	 * @returns {boolean} edit state of uploadSetItem
	 *
	 */
	UploadSetItem.prototype.getEditState = function () {
		return this._bInEditMode;
	};

	/**
	 * Returns the upload type of the item
	 * The method by default returns Native
	 * It is recommended to use this method, when the user has uploded the instance
	 *
	 * @public
	 * @since 1.117.0
	 * @returns {sap.m.UploadType} edit state of uploadSetItem
	 *
	 */
	UploadSetItem.prototype.getUploadType = function () {
		return this._sUploadType;
	};

	/* ============== */
	/* Event handlers */
	/* ============== */

	UploadSetItem.prototype._handleFileNamePressed = function (oEvent) {
		oEvent.preventDefault(); // preventing default href opening via link press and delegating the handling to press event logic.
		if (this.fireOpenPressed({item: this})) {
			MobileLibrary.URLHelper.redirect(this.getUrl(), true);
		}
	};

	/* =============== */
	/* Private methods */
	/* =============== */

	UploadSetItem.prototype._getListItem = function () {
		if (!this._oListItem) {
			this._oListItem = new CustomListItem(this.getId() + "-listItem", {
				content: [
					this._getIcon(),
					this._getDynamicContent(),
					this._getProgressBox()
				],
				selected: this.getSelected() // mapping UploadSetItem's property selected to customList item selected.
			});
			this._oListItem.addStyleClass("sapMUCItem");
			this._oListItem.setTooltip(this.getTooltip_Text());
		}

		return this._oListItem;
	};

	UploadSetItem.prototype._setFileObject = function (oFileObject) {
		this._oFileObject = oFileObject;
		if (oFileObject) {
			this._fFileSize = oFileObject.size / UploadSetItem.MEGABYTE;
			this.setMediaType(oFileObject.type);
		} else {
			this._fFileSize = null;
			this.setMediaType(null);
		}
		if (this.getParent()) {
			this._checkSizeRestriction(this.getParent().getMaxFileSize());
			this._checkMediaTypeRestriction(this.getParent().getMediaTypes());
		}
	};

	UploadSetItem.prototype._getIcon = function () {
		if (!this._oIcon) {
			if (this.getThumbnailUrl()) {
				this._oIcon = IconPool.createControlByURI({
					id: this.getId() + "-thumbnail",
					src: this.getThumbnailUrl(),
					decorative: false
				}, Image);
				this._oIcon.addStyleClass("sapMUCItemImage sapMUCItemIcon");
			} else {
				this._oIcon = new Icon(this.getId() + "-icon", {
					src: this._getIconByMimeType(this.getMediaType()),
					decorative: false,
					useIconTooltip: false
				});
				this._oIcon.addStyleClass("sapMUCItemIcon");
			}
			this.addDependent(this._oIcon);
		}

		return this._oIcon;
	};

	UploadSetItem.prototype._getIconByMimeType = function(sMimeType) {

		var mimeTypeForImages = ["image/png", "image/tiff", "image/bmp", "image/jpeg", "image/gif"];

		if (sMimeType) {
			if (mimeTypeForImages.indexOf(sMimeType) === -1) {
				return IconPool.getIconForMimeType(sMimeType);
			}
			return this._getIconByFileType();
		} else {
			return this._getIconByFileType();
		}
	};

	UploadSetItem.prototype._getIconByFileType = function () {
		var sFileExtension = UploadSetItem._splitFileName(this.getFileName()).extension;
		if (!sFileExtension) {
			return "sap-icon://document";
		}

		switch (sFileExtension.toLowerCase()) {
			case "bmp" :
			case "jpg" :
			case "jpeg" :
			case "png" :
				return UploadSetItem.IMAGE_FILE_ICON;
			case "csv" :
			case "xls" :
			case "xlsx" :
				return "sap-icon://excel-attachment";
			case "doc" :
			case "docx" :
			case "odt" :
				return "sap-icon://doc-attachment";
			case "pdf" :
				return "sap-icon://pdf-attachment";
			case "ppt" :
			case "pptx" :
				return "sap-icon://ppt-attachment";
			case "txt" :
				return "sap-icon://document-text";
			default :
				return "sap-icon://document";
		}
	};

	UploadSetItem.prototype._getFileNameLink = function () {
		if (!this._oFileNameLink) {
			this._oFileNameLink = new Link({
				id: this.getId() + "-fileNameLink",
				press: [this, this._handleFileNamePressed, this],
				wrapping: true,
				href: this.getUrl()
			});
			this._oFileNameLink.setText(this.getFileName());//For handling curly braces in file name we have to use setter.Otherwise it will be treated as binding.
			this._oFileNameLink.addStyleClass("sapMUCFileName");
			this._oFileNameLink.addStyleClass("sapMUSFileName");
			this.addDependent(this._oFileNameLink);
		}
		this._oFileNameLink.setEnabled(!!this.getUrl());

		return this._oFileNameLink;
	};

	UploadSetItem.prototype._getDynamicContent = function () {
		if (!this._oDynamicContent) {
			this._oDynamicContent = new DynamicItemContent({item: this});
			this.addDependent(this._oDynamicContent);
		}

		return this._oDynamicContent;
	};

	UploadSetItem.prototype._getRestartButton = function () {
		var oParent = this.getParent();
		if (!this._oRestartButton) {
			this._oRestartButton = new Button({
				id: this.getId() + "-restartButton",
				icon: "sap-icon://refresh",
				type: MobileLibrary.ButtonType.Standard,
				visible: this.getUploadState() === UploadState.Error,
				tooltip: this._oRb.getText("UPLOAD_SET_RESTART_BUTTON_TEXT"),
				press: [this, oParent._handleItemRestart, oParent]
			});
			this.addDependent(this._oRestartButton);
		}

		return this._oRestartButton;
	};

	UploadSetItem.prototype._getEditButton = function () {
		var oParent = this.getParent();
		if (!this._oEditButton) {
			this._oEditButton = new Button({
				id: this.getId() + "-editButton",
				icon: "sap-icon://edit",
				type: MobileLibrary.ButtonType.Standard,
				enabled: this.getEnabledEdit(),
				visible: this.getVisibleEdit(),
				tooltip: this._oRb.getText("UPLOAD_SET_EDIT_BUTTON_TEXT"),
				press: [this, oParent._handleItemEdit, oParent]
			});
			this._oEditButton.addStyleClass("sapMUCEditBtn");
			this.addDependent(this._oEditButton);
		}

		return this._oEditButton;
	};

	UploadSetItem.prototype._getFileNameEdit = function () {
		var oSplit;

		if (!this._oFileNameEdit) {
			oSplit = UploadSetItem._splitFileName(this.getFileName());
			this._oFileNameEdit = new Input({
				id: this.getId() + "-fileNameEdit",
				type: MobileLibrary.InputType.Text
			});
			this._oFileNameEdit.addStyleClass("sapMUCEditBox");
			this._oFileNameEdit.setFieldWidth("75%");
			this._oFileNameEdit.setDescription(oSplit.extension);
			this.addDependent(this._oFileNameEdit);
		}

		return this._oFileNameEdit;
	};

	/**
	 * Determines if the fileName is already in usage.
	 * @param {string} filename inclusive file extension
	 * @param {array} items Collection of uploaded files
	 * @returns {boolean} true for an already existing item with the same file name(independent of the path)
	 * @private
	 * @static
	 */
	UploadSetItem._checkDoubleFileName = function(filename, items) {
		if (items.length === 0 || !filename) {
			return false;
		}

		var iLength = items.length;
		filename = filename.replace(/^\s+/, "");

		for (var i = 0; i < iLength; i++) {
			if (filename === items[i].getProperty("fileName")) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Retrieves the sap.m.ListItem from the internal sap.m.List based on the ID
	 * @param {string} listItemId The item ID used for finding the UploadSetItem
	 * @param {sap.m.ListItemBase[]} listItems The array of list items to search in
	 * @returns {sap.m.upload.UploadSetItem|null} The matching UploadSetItem or null if none is found
	 * @private
	 */
	UploadSetItem._findById = function(listItemId, listItems) {
		for (var i = 0; i < listItems.length; i++) {
			if (listItems[i].getId() === listItemId) {
				return listItems[i];
			}
		}
		return null;
    };

	UploadSetItem.prototype._setInEditMode = function (bInEditMode) {
		if (bInEditMode && !this._bInEditMode) {
			var oSplit = UploadSetItem._splitFileName(this.getFileName()),
				iMaxLength = this.getParent().getMaxFileNameLength(),
				iFileExtensionLength = oSplit.extension ? oSplit.extension.length + 1 : 0;
			iMaxLength = iMaxLength ? iMaxLength : 0;
			var iNameMaxLength = iMaxLength - iFileExtensionLength;
			iNameMaxLength = iNameMaxLength < 0 ? 0 : iNameMaxLength;
			this._getFileNameEdit().setProperty("maxLength", iNameMaxLength, true);
			this._getFileNameEdit().setValue(oSplit.name);
		}
		this._bInEditMode = bInEditMode;
		this._setContainsError(false);
		this._getFileNameEdit().setShowValueStateMessage(false);
		this._getFileNameEdit().setProperty("valueState", "None", true);
		this.invalidate();
	};

	UploadSetItem.prototype._getContainsError = function () {
		return this._bContainsError;
	};

	/**
	 * Sets the upload type
	 *@param {string} sType indicates the type of the upload
	 * @private
	 * @since 1.117
	 *
	 */
	UploadSetItem.prototype._setUploadType = function (sType) {
		this._sUploadType = sType;
	};

	UploadSetItem.prototype._setContainsError = function (bContainsError) {
		this._bContainsError = bContainsError;
	};

	UploadSetItem._splitFileName = function (sFileName, bWithDot) {
		var oResult = {};
		var oRegex = /(?:\.([^.]+))?$/;
		var aFileExtension = oRegex.exec(sFileName);
		if (!aFileExtension[0]) {
			aFileExtension[0] = "";
			oResult.name = sFileName;
		} else {
			oResult.name = sFileName ? sFileName.slice(0, sFileName.indexOf(aFileExtension[0])) : "";
		}
		if (bWithDot) {
			oResult.extension = aFileExtension[0];
		} else {
			oResult.extension = aFileExtension[1];
		}
		return oResult;
	};

	UploadSetItem.prototype._getDeleteButton = function () {
		var oParent = this.getParent();
		if (!this._oDeleteButton) {
			this._oDeleteButton = new Button({
				id: this.getId() + "-deleteButton",
				icon: "sap-icon://decline",
				type: MobileLibrary.ButtonType.Standard,
				enabled: this.getEnabledRemove(),
				visible: this.getVisibleRemove(),
				tooltip: this._oRb.getText("UPLOAD_SET_DELETE_BUTTON_TEXT"),
				press: [this, oParent._handleItemDelete, oParent]
			});
			this._oDeleteButton.addStyleClass("sapMUCDeleteBtn");
			this.addDependent(this._oDeleteButton);
		}

		return this._oDeleteButton;
	};

	UploadSetItem.prototype._getTerminateButton = function () {
		var oParent = this.getParent();
		if (!this._oTerminateButton) {
			this._oTerminateButton = new Button({
				id: this.getId() + "-terminateButton",
				icon: "sap-icon://stop",
				type: MobileLibrary.ButtonType.Standard,
				visible: oParent.getTerminationEnabled() && this.getUploadState() === UploadState.Uploading,
				tooltip: this._oRb.getText("UPLOAD_SET_TERMINATE_BUTTON_TEXT"),
				press: [this, oParent._handleTerminateRequest, oParent]
			});
			this._oTerminateButton.addStyleClass("sapMUCDeleteBtn");
			this.addDependent(this._oTerminateButton);
		}

		return this._oTerminateButton;
	};

	UploadSetItem.prototype._getConfirmRenameButton = function () {
		var oParent = this.getParent();
		if (!this._oConfirmRenameButton) {
			this._oConfirmRenameButton = new Button({
				id: this.getId() + "-okButton",
				text: this._oRb.getText("UPLOAD_SET_RENAME_BUTTON_TEXT"),
				type: MobileLibrary.ButtonType.Transparent,
				press: [this, oParent._handleItemEditConfirmation, oParent]
			});
			this._oConfirmRenameButton.addStyleClass("sapMUCOkBtn");
			this.addDependent(this._oConfirmRenameButton);
		}

		return this._oConfirmRenameButton;
	};

	UploadSetItem.prototype._getCancelRenameButton = function () {
		var oParent = this.getParent();
		if (!this._oCancelRenameButton) {
			this._oCancelRenameButton = new Button({
				id: this.getId() + "-cancelButton",
				text: this._oRb.getText("UPLOAD_SET_CANCEL_BUTTON_TEXT"),
				type: MobileLibrary.ButtonType.Transparent,
				press: [this, oParent._handleItemEditCancelation, oParent]
			});
			this._oCancelRenameButton.addStyleClass("sapMUCCancelBtn");
			this.addDependent(this._oCancelRenameButton);
		}

		return this._oCancelRenameButton;
	};

	UploadSetItem.prototype._getProgressBox = function () {
		if (!this._oProgressBox) {
			this._oProgressBox = new VBox({
				id: this.getId() + "-progressBox",
				items: [
					this._getProgressIndicator(),
					new HBox({
						justifyContent: FlexJustifyContent.SpaceBetween,
						items: [
							this._getStateLabel(),
							this._getProgressLabel()
						]
					})
				],
				width: "20%"
			});
			this._oProgressBox.addStyleClass("sapMUSProgressBox");
			this.addDependent(this._oProgressBox);
		}
		if (this._oProgressBox) {
			this._oProgressBox.setVisible(this.getUploadState() !== UploadState.Complete);
		}
		return this._oProgressBox;
	};

	UploadSetItem.prototype._getProgressIndicator = function () {
		if (!this._oProgressIndicator) {
			this._oProgressIndicator = new ProgressIndicator({
				id: this.getId() + "-progressIndicator",
				percentValue: 0,
				state: ValueState.Information,
				visible: this.getUploadState() !== UploadState.Complete
			});
			this._oProgressIndicator.addStyleClass("sapMUSProgressIndicator");
		}

		return this._oProgressIndicator;
	};

	UploadSetItem.prototype._getStateLabel = function () {
		if (!this._oStateLabel) {
			this._oStateLabel = new Label({
				id: this.getId() + "-stateLabel",
				text: "Uploading", // TODO: All states and localization
				visible: this.getUploadState() !== UploadState.Complete
			});
		}

		return this._oStateLabel;
	};

	UploadSetItem.prototype._getProgressLabel = function () {
		if (!this._oProgressLabel) {
			this._oProgressLabel = new Label({
				id: this.getId() + "-progressLabel",
				visible: this.getUploadState() !== UploadState.Complete
			});
			// this._oProgressLabel.addStyleClass("sapMUCProgress");
			this.setProgress(0);
			this.addDependent(this._oProgressLabel);
		}

		return this._oProgressLabel;
	};

	UploadSetItem.prototype._renderAttributes = function (oRm) {
		if (this.getAttributes().length === 0) {
			return;
		}
		var bFirstVisible = false;
		oRm.openStart("div").class("sapMUCAttrContainer").openEnd();
		this.getAttributes().forEach(function (oAttribute, iIndex) {
			if (bFirstVisible && oAttribute.getVisible()) {
				oRm.openStart("div").class("sapMUCSeparator").openEnd();
				oRm.text("\u00a0\u00B7\u00a0").close("div");
			}
			bFirstVisible = bFirstVisible || oAttribute.getVisible();
			oRm.renderControl(oAttribute.addStyleClass("sapMUCAttr"));
		});
		oRm.close("div");
	};

	UploadSetItem.prototype._renderMarkers = function (oRm) {
		if (this.getMarkers().length > 0) {
			oRm.openStart("div").class("sapMUSObjectMarkerContainer").openEnd();
			this.getMarkers().forEach(function (oMarker) {
				oRm.renderControl(oMarker.addStyleClass("sapMUCObjectMarker"));
			});
			oRm.close("div");
		}
	};

	UploadSetItem.prototype._renderMarkersAsStatus = function (oRm) {
		if (this.getMarkersAsStatus().length > 0) {
			oRm.openStart("div").class("sapMUSObjectMarkersAsStatusContainer").openEnd();
			this.getMarkersAsStatus().forEach(function (oStatus) {
				oRm.renderControl(oStatus.addStyleClass("sapMUCObjectMarkersAsStatus"));
			});
			oRm.close("div");
		}
	};

	UploadSetItem.prototype._renderStatuses = function (oRm) {
		if (this.getStatuses().length === 0) {
			return;
		}
		var bFirstVisible = false;
		oRm.openStart("div").class("sapMUCStatusContainer").openEnd();
		this.getStatuses().forEach(function (oStatus, iIndex) {
			if (bFirstVisible && oStatus.getVisible()) {
				oRm.openStart("div").class("sapMUCSeparator").openEnd();
				oRm.text("\u00a0\u00B7\u00a0").close("div");
			}
			bFirstVisible = bFirstVisible || oStatus.getVisible();
			oRm.renderControl(oStatus);
		});
		oRm.close("div");
	};

	UploadSetItem.prototype._renderStateAndProgress = function (oRm) {
		oRm.renderControl(this._getProgressBox());
	};

	UploadSetItem.prototype._renderButtons = function (oRm) {
		var aButtonsToRender;

		if (this._bInEditMode) {
			aButtonsToRender = [
				this._getConfirmRenameButton(),
				this._getCancelRenameButton()
			];
		} else {
			aButtonsToRender = [
				this._getRestartButton(),
				this._getEditButton(),
				this._getDeleteButton(),
				this._getTerminateButton()
			];
		}

		// Render div container only if there is at least one button
		if (aButtonsToRender.length > 0) {
			oRm.openStart("div").class("sapMUSButtonContainer").openEnd();
			aButtonsToRender.forEach(function (oBtn, iIndex) {
				if (iIndex < (aButtonsToRender.length)) {
					oBtn.addStyleClass("sapMUCFirstButton");
				}
				oRm.renderControl(oBtn);
			});
			oRm.close("div");
		}
	};

	/**
	 * Checks if and how compliance with the file type restriction changed for this item.
	 * @param {string[]} aTypes List of allowed file types.
	 * @private
	 */
	UploadSetItem.prototype._checkTypeRestriction = function (aTypes) {
		var oFile = UploadSetItem._splitFileName(this.getFileName()),
			bRestricted =
				(!!this.getFileName() && !!aTypes && (aTypes.length > 0)
					&& oFile.extension && aTypes.indexOf(oFile.extension.toLowerCase()) === -1);
		if (bRestricted !== this._bFileTypeRestricted) {
			this._bFileTypeRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent().fireFileTypeMismatch({item: this});
			}
		}
	};

	/**
	 * Checks if and how compliance with the file name length restriction changed for this item.
	 * @param {int} iMaxLength Maximum length of file name.
	 * @private
	 */
	UploadSetItem.prototype._checkNameLengthRestriction = function (iMaxLength) {
		var bRestricted = (iMaxLength && !!this.getFileName() && this.getFileName().length > iMaxLength);
		if (bRestricted !== this._bNameLengthRestricted) {
			this._bNameLengthRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent().fireFileNameLengthExceeded({item: this});
			}
		}
	};

	/**
	 * Checks if and how compliance with the file size restriction changed for this item.
	 * @param {float} fMaxSize Maximum file size allowed in megabytes.
	 * @private
	 */
	UploadSetItem.prototype._checkSizeRestriction = function (fMaxSize) {
		var bRestricted = (fMaxSize && this._fFileSize > fMaxSize);
		if (bRestricted !== this._bSizeRestricted) {
			this._bSizeRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent().fireFileSizeExceeded({item: this});
			}
		}
	};

	/**
	 * Checks if and how compliance with the mime type restriction changed for this item.
	 * @param {string[]} aTypes List of allowed mime types.
	 * @private
	 */
	UploadSetItem.prototype._checkMediaTypeRestriction = function (aTypes) {
		var bRestricted = (!!aTypes && (aTypes.length > 0) && !!this.getMediaType() && aTypes.indexOf(this.getMediaType()) === -1);
		if (bRestricted !== this._bMediaTypeRestricted) {
			this._bMediaTypeRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent().fireMediaTypeMismatch({item: this});
			}
		}
	};

	UploadSetItem.prototype._isRestricted = function () {
		return this._bFileTypeRestricted || this._bNameLengthRestricted || this._bSizeRestricted || this._bMediaTypeRestricted;
	};

	UploadSetItem.prototype.exit = function() {
		if (this._oProgressIndicator) {
			this._oProgressIndicator.destroy();
			this._oProgressIndicator = null;
		}
		if (this._oStateLabel) {
			this._oStateLabel.destroy();
			this._oStateLabel = null;
		}
		if (this._oProgressBox) {
			this._oProgressBox.destroy();
			this._oProgressBox = null;
		}
		if (this._oListItem) {
			this._oListItem.destroy();
			this._oListItem = null;
		}
		if (this._oIcon) {
			this._oIcon.destroy();
			this._oIcon = null;
		}
		if (this._oDynamicContent) {
			this._oDynamicContent.destroy();
			this._oDynamicContent = null;
		}
	};

	/**
	 * Resets item flags to initial state, that can be used to recreate the item
	 * @private
	 */
	UploadSetItem.prototype._reset = function() {
		if (this._oListItem) {
			this._oListItem.destroy();
			this._oListItem = null;
		}
		this._oListItem = null;
		if (this._oIcon) {
			this.removeDependent(this._oIcon);
			this._oIcon.destroy();
			this._oIcon = null;
		}
		if (this._oFileNameLink) {
			this.removeDependent(this._oFileNameLink);
			this._oFileNameLink.destroy();
			this._oFileNameLink = null;
		}
		if (this._oProgressBox) {
			this._oProgressBox.destroy();
			this.removeDependent(this._oProgressBox);
			this._oProgressBox = null;
		}
		if (this._oProgressIndicator) {
			this._oProgressIndicator.destroy();
			this.removeDependent(this._oProgressIndicator);
			this._oProgressIndicator = null;
		}
		if (this._oStateLabel) {
			this._oStateLabel.destroy();
			this.removeDependent(this._oStateLabel);
			this._oStateLabel = null;
		}
		if (this._oProgressLabel) {
			this._oProgressLabel.destroy();
			this.removeDependent(this._oProgressLabel);
			this._oProgressLabel = null;
		}
		if (this._oDynamicContent) {
			this._oDynamicContent.destroy();
			this._oDynamicContent = null;
		}
	};

	return UploadSetItem;
});
