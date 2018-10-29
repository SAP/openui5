/*!
 * ${copyright}
 */

// Provides control sap.m.UploadCollectionItem.
sap.ui.define([
	"./library",
	"sap/ui/core/Element",
	"sap/m/ObjectAttribute",
	"sap/m/Label",
	"sap/m/CustomListItem",
	"sap/m/BusyIndicator",
	"sap/m/Image",
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/Input",
	"sap/ui/core/util/File",
	"sap/ui/core/HTML",
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool",
	"sap/ui/core/ValueState",
	"sap/ui/Device",
	"sap/base/Log",
	"sap/base/util/ObjectPath",
	"sap/ui/thirdparty/jquery"
], function (Library, Element, ObjectAttribute, Label, CustomListItem, BusyIndicator, Image, Button, Link, Input,
			 FileUtil, HTML, Icon, IconPool, ValueState, Device, Log, ObjectPath, jQuery) {
	"use strict";

	/**
	 * Constructor for a new UploadCollectionItem
	 *
	 * @param {string} [sId] ID for the new control, will be generated automatically if no ID is provided.
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Defines a structure of the element of the 'items' aggregation.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.26.0
	 * @alias sap.m.UploadCollectionItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UploadCollectionItem = Element.extend("sap.m.UploadCollectionItem", /** @lends sap.m.UploadCollectionItem.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Aria label for the icon (or for the image).
				 * @since 1.30.0
				 */
				ariaLabelForPicture: {type: "string", group: "Accessibility", defaultValue: null},
				/**
				 * Specifies the name of the user who uploaded the file.
				 * @deprecated since version 1.30. This property is deprecated; use the aggregation attributes instead.
				 * However, if the property is filled, it is displayed as an attribute. To make sure the title does not appear twice, do not use the property.
				 */
				contributor: {type: "string", group: "Data", defaultValue: null},
				/**
				 * Specifies a unique identifier of the file (created by the application).
				 */
				documentId: {type: "string", group: "Misc", defaultValue: null},
				/**
				 * Enables/Disables the Delete button.
				 * If the value is true, the Delete button is enabled and the delete function can be used.
				 * If the value is false, the delete function is not available.
				 */
				enableDelete: {type: "boolean", group: "Behavior", defaultValue: true},
				/**
				 * Enables/Disables the Edit button.
				 * If the value is true, the Edit button is enabled and the edit function can be used.
				 * If the value is false, the edit function is not available.
				 */
				enableEdit: {type: "boolean", group: "Behavior", defaultValue: true},
				/**
				 * Specifies the name of the uploaded file.
				 */
				fileName: {type: "string", group: "Misc", defaultValue: null},
				/**
				 * Specifies the size of the uploaded file (in megabytes).
				 * @deprecated since version 1.30. This property is deprecated; use the aggregation attributes instead.
				 */
				fileSize: {type: "float", group: "Misc", defaultValue: null},
				/**
				 * Specifies the MIME type of the file.
				 */
				mimeType: {type: "string", group: "Misc", defaultValue: null},
				/**
				 * Defines the selected state of the UploadCollectionItem.
				 * @since 1.34.0
				 */
				selected: {type: "boolean", group: "Behavior", defaultValue: false},
				/**
				 * Specifies the URL where the thumbnail of the file is located. This can also be an SAPUI5 icon URL.
				 */
				thumbnailUrl: {type: "string", group: "Misc", defaultValue: null},
				/**
				 * Specifies the date on which the file was uploaded.
				 * The application has to define the date format.
				 * @deprecated since version 1.30. This property is deprecated; use the aggregation attributes instead.
				 */
				uploadedDate: {type: "string", group: "Misc", defaultValue: null},
				/**
				 * State of the item with regard to its upload process.
				 * @since 1.60.0
				 */
				uploadState: {type: "sap.m.UploadState", defaultValue: null},
				/**
				 * Specifies the URL where the file is located.
				 * If the application doesn't provide a value for this property, the icon and the file name of the UploadCollectionItem are not clickable.
				 */
				url: {type: "string", group: "Misc", defaultValue: null},
				/**
				 * Show/Hide the Delete button.
				 * If the value is true, the Delete button is visible.
				 * If the value is false, the Delete button is not visible.
				 */
				visibleDelete: {type: "boolean", group: "Behavior", defaultValue: true},
				/**
				 * Show/Hide the Edit button.
				 * If the value is true, the Edit button is visible.
				 * If the value is false, the Edit button is not visible.
				 */
				visibleEdit: {type: "boolean", group: "Behavior", defaultValue: true}
			},
			defaultAggregation: "attributes",
			aggregations: {
				/**
				 * Attributes of an uploaded item, for example, 'Uploaded By', 'Uploaded On', 'File Size'
				 * attributes are displayed after an item has been uploaded.
				 * Additionally, the Active property of sap.m.ObjectAttribute is supported.<br>
				 * Note that if one of the deprecated properties contributor, fileSize or UploadedDate is filled in addition to this attribute, two attributes with the same title
				 * are displayed as these properties get displayed as an attribute.
				 * Example: An application passes the property ‘contributor’ with the value ‘A’ and the aggregation attributes ‘contributor’: ‘B’. As a result, the attributes
				 * ‘contributor’:’A’ and ‘contributor’:’B’ are displayed. To make sure the title does not appear twice, check if one of the properties is filled.
				 * @since 1.30.0
				 */
				attributes: {type: "sap.m.ObjectAttribute", multiple: true, bindable: "bindable"},
				/**
				 * Hidden aggregation for the attributes created from the deprecated properties uploadedDate, contributor and fileSize
				 * @since 1.30.0
				 */
				_propertyAttributes: {type: "sap.m.ObjectAttribute", multiple: true, visibility: "hidden"},
				/**
				 * Statuses of an uploaded item
				 * Statuses will be displayed after an item has been uploaded
				 * @since 1.30.0
				 */
				statuses: {type: "sap.m.ObjectStatus", multiple: true, bindable: "bindable"},
				/**
				 * Markers of an uploaded item
				 * Markers will be displayed after an item has been uploaded
				 * But not in Edit mode
				 * @since 1.40.0
				 */
				markers: {type: "sap.m.ObjectMarker", multiple: true, bindable: "bindable"}
			},
			associations: {
				/**
				 * ID of the FileUploader instance
				 * @since 1.30.0
				 */
				fileUploader: {type: "sap.ui.unified.FileUploader", multiple: false}
			},
			events: {
				/**
				 * This event is triggered when the user presses the filename link.
				 * If this event is provided, it overwrites the default behavior of opening the file.
				 *
				 * @since 1.50.0
				 */
				press: {},
				/**
				 * When a deletePress event handler is attached to the item and the user presses the delete button, this event is triggered.
				 * If this event is triggered, it overwrites the default delete behavior of UploadCollection and the fileDeleted event of UploadCollection is not triggered.
				 *
				 * @since 1.50.0
				 */
				deletePress: {}
			}
		}
	});

	UploadCollectionItem.CARD_ICON = "sap-icon://card";
	UploadCollectionItem.MARKER_MARGIN = 8;
	UploadCollectionItem.FILE_NAME_EDIT_ID = "ta_editFileName";
	UploadCollectionItem.MEGABYTE = 1048576;

	var UploadState = Library.UploadState;

	UploadCollectionItem.prototype.init = function () {
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._mDeprecatedProperties = {};
		this._oFile = null; // File object associate dwith this item
		this._requestIdName = null; // ID of a request that is uploading the file

		// Inner controls
		this._oListItem = null;
		this._oIcon = null;
		this._oProgressLabel = null;
		this._oBusyIndicator = null;

		// Edit mode flags
		this._bIsEdited = false;
		this._bContainsError = false;

		// Restrictions
		this._bFileTypeRestricted = false;
		this._bFileNameLengthRestricted = false;
		this._bFileSizeRestricted = false;
		this._bMimeTypeRestricted = false;

		// Buttons
		this._oEditButton = null;
		this._oDeleteButton = null;
		this._oTerminateButton = null;
		this._oConfirmRenameButton = null;
		this._oCancelRenameButton = null;
	};

	UploadCollectionItem.prototype._setFileObject = function (oFile) {
		this._oFile = oFile;
		if (oFile) {
			this.setFileSize(oFile.size / UploadCollectionItem.MEGABYTE);
			this.setMimeType(oFile.type);
		}
	};

	UploadCollectionItem.prototype._getFileObject = function () {
		return this._oFile;
	};

	UploadCollectionItem.prototype._getListItem = function () {
		var sListItemId,
			oBusyIndicator, oItemIcon,
			sContainerId, oContainer;

		if (!this._oListItem) {
			sListItemId = this.getId() + "-cli";

			if (this.getUploadState() === UploadState.Uploading) {
				oBusyIndicator = this._getBusyIndicator();
			} else {
				oItemIcon = this._getIcon();
			}

			sContainerId = this.getId() + "-container";
			oContainer = new HTML({
				content: "<span id=" + sContainerId + " class='sapMUCTextButtonContainer'></span>",
				afterRendering: this._renderContent.bind(this)
			});

			this._oListItem = new CustomListItem(sListItemId, {
				content: [oBusyIndicator, oItemIcon, oContainer],
				selected: this.getSelected()
			});
			this._oListItem.addStyleClass("sapMUCItem");
			this._oListItem.setTooltip(this.getTooltip_Text());

			this.attachEvent("selected", this._handleItemSetSelected, this);
		}

		return this._oListItem;
	};

	UploadCollectionItem.prototype._handleItemSetSelected = function () {
		this._getListItem().setSelected(this.getSelected());
	};

	UploadCollectionItem.prototype._getProgressLabel = function () {
		if (!this._oProgressLabel) {
			this._oProgressLabel = new Label({
				id: this.getId() + "-ta_progress"
			});
			this._oProgressLabel.addStyleClass("sapMUCProgress");
			this.addDependent(this._oProgressLabel);
			this._setProgressInPercent(0);
		}

		return this._oProgressLabel;
	};

	UploadCollectionItem.prototype._getBusyIndicator = function () {
		if (!this._oBusyIndicator) {
			this._oBusyIndicator = new BusyIndicator({
				id: this.getId() + "-ia_indicator"
			});
			this._oBusyIndicator.addStyleClass("sapMUCloadingIcon");
			this.addDependent(this._oBusyIndicator);
		}

		return this._oBusyIndicator;
	};

	UploadCollectionItem.prototype._setProgressInPercent = function (iProgress) {
		var $busyIndicator;

		this._getProgressLabel().setText(this._oRb.getText("UPLOADCOLLECTION_UPLOADING", [iProgress]));
		$busyIndicator = this.$("-ia_indicator");
		if (iProgress === 100) {
			$busyIndicator.attr("aria-label", this._oRb.getText("UPLOADCOLLECTION_UPLOAD_COMPLETED"));
		} else {
			$busyIndicator.attr("aria-valuenow", iProgress);
		}
	};

	UploadCollectionItem.prototype._getEditButton = function () {
		var oParent = this.getParent();
		if (!this._oEditButton) {
			this._oEditButton = new Button({
				id: this.getId() + "-editButton",
				icon: "sap-icon://edit",
				type: Library.ButtonType.Standard,
				enabled: this.getEnableEdit(),
				visible: this.getVisibleEdit(),
				tooltip: this._oRb.getText("UPLOADCOLLECTION_EDITBUTTON_TEXT"),
				press: [this, oParent._handleEdit, oParent]
			});
			this._oEditButton.addStyleClass("sapMUCEditBtn");
			this.addDependent(this._oEditButton);
		}

		return this._oEditButton;
	};

	UploadCollectionItem.prototype._getDeleteButton = function () {
		var oParent = this.getParent();
		if (!this._oDeleteButton) {
			this._oDeleteButton = new Button({
				id: this.getId() + "-deleteButton",
				icon: "sap-icon://sys-cancel",
				type: Library.ButtonType.Standard,
				enabled: this.getEnableDelete(),
				visible: this.getVisibleDelete(),
				tooltip: this._oRb.getText("UPLOADCOLLECTION_DELETEBUTTON_TEXT"),
				press: [this, oParent._handleDelete, oParent]
			});
			this._oDeleteButton.addStyleClass("sapMUCDeleteBtn");
			this.addDependent(this._oDeleteButton);
		}

		return this._oDeleteButton;
	};

	UploadCollectionItem.prototype._getTerminateButton = function () {
		var oParent = this.getParent();
		if (!this._oTerminateButton) {
			this._oTerminateButton = new Button({
				id: this.getId() + "-terminateButton",
				icon: "sap-icon://sys-cancel",
				type: Library.ButtonType.Standard,
				visible: oParent.getTerminationEnabled(),
				tooltip: this._oRb.getText("UPLOADCOLLECTION_TERMINATEBUTTON_TEXT"),
				press: [this, oParent._handleTerminateRequest, oParent]
			});
			this._oTerminateButton.addStyleClass("sapMUCDeleteBtn");
			this.addDependent(this._oTerminateButton);
		}

		return this._oTerminateButton;
	};

	UploadCollectionItem.prototype._getConfirmRenameButton = function () {
		var oParent = this.getParent();
		if (!this._oConfirmRenameButton) {
			this._oConfirmRenameButton = new Button({
				id: this.getId() + "-okButton",
				text: this._oRb.getText("UPLOADCOLLECTION_RENAMEBUTTON_TEXT"),
				type: Library.ButtonType.Transparent,
				press: [this, oParent._handleOk, oParent]
			});
			this._oConfirmRenameButton.addStyleClass("sapMUCOkBtn");
			this.addDependent(this._oConfirmRenameButton);
		}

		return this._oConfirmRenameButton;
	};

	UploadCollectionItem.prototype._getCancelRenameButton = function () {
		var oParent = this.getParent();
		if (!this._oCancelRenameButton) {
			this._oCancelRenameButton = new Button({
				id: this.getId() + "-cancelButton",
				text: this._oRb.getText("UPLOADCOLLECTION_CANCELBUTTON_TEXT"),
				type: Library.ButtonType.Transparent,
				press: [this, oParent._handleCancel, oParent]
			});
			this._oCancelRenameButton.addStyleClass("sapMUCCancelBtn");
			this.addDependent(this._oCancelRenameButton);
		}

		return this._oCancelRenameButton;
	};

	UploadCollectionItem.prototype._renderButtons = function (oRm) {
		var aButtons = this._getButtons(),
			iButtonCounter = aButtons.length;

		// Render div container only if there is at least one button
		if (iButtonCounter > 0) {
			oRm.write("<div class=\"sapMUCButtonContainer\">");
			for (var i = 0; i < iButtonCounter; i++) {
				if ((i + 1) < iButtonCounter) { // If both buttons are displayed
					aButtons[i].addStyleClass("sapMUCFirstButton");
				}
				oRm.renderControl(aButtons[i]);
			}
			oRm.write("</div>");
		}
	};

	UploadCollectionItem.prototype._renderContent = function () {
		var oRm = this.getParent()._getRenderManager(),
			sContainerId = this.getId() + "-container",
			aAttributes = this.getAllAttributes(),
			aStatuses = this.getStatuses(),
			aMarkers = this.getMarkers(),
			iAttrCounter = aAttributes.length,
			iStatusesCounter = aStatuses.length,
			iMarkersCounter = aMarkers.length,
			i;

		oRm.write("<div class=\"sapMUCTextContainer ");
		if (this._bIsEdited) {
			oRm.write("sapMUCEditMode ");
		}
		oRm.write("\" >");
		oRm.renderControl(this._bIsEdited ? this._getFileNameEdit() : this._getFileNameLink());
		// If status is uploading only the progress label is displayed under the Filename
		if (this.getUploadState() === UploadState.Uploading) {
			oRm.renderControl(this._getProgressLabel());
		} else {
			if (iMarkersCounter > 0) {
				oRm.write("<div class=\"sapMUCObjectMarkerContainer\">");
				for (i = 0; i < iMarkersCounter; i++) {
					oRm.renderControl(aMarkers[i].addStyleClass("sapMUCObjectMarker"));
				}
				oRm.write("</div>");
			}
			if (iAttrCounter > 0) {
				oRm.write("<div class=\"sapMUCAttrContainer\">");
				for (i = 0; i < iAttrCounter; i++) {
					aAttributes[i].addStyleClass("sapMUCAttr");
					oRm.renderControl(aAttributes[i]);
					if ((i + 1) < iAttrCounter) {
						oRm.write("<div class=\"sapMUCSeparator\">&nbsp&#x00B7&#160</div>");
					}
				}
				oRm.write("</div>");
			}
			if (iStatusesCounter > 0) {
				oRm.write("<div class=\"sapMUCStatusContainer\">");
				for (i = 0; i < iStatusesCounter; i++) {
					aStatuses[i].detachBrowserEvent("hover");
					oRm.renderControl(aStatuses[i]);
					if ((i + 1) < iStatusesCounter) {
						oRm.write("<div class=\"sapMUCSeparator\">&nbsp&#x00B7&#160</div>");
					}
				}
				oRm.write("</div>");
			}
		}

		oRm.write("</div>");
		this._renderButtons(oRm);
		oRm.flush(document.getElementById(sContainerId), true, false);
		this._truncateFileName();
	};

	UploadCollectionItem.prototype._truncateFileName = function () {
		// Markers are not displayed in edit mode
		if (this._bIsEdited) {
			this.$("cli").find(".sapMUCObjectMarkerContainer").attr("style", "display: none");
			return;
		}
		var iMarkersWidth = 0;
		var aMarkers = this.getMarkers();
		var sStyle;
		for (var i = 0; i < aMarkers.length; i++) {
			iMarkersWidth = iMarkersWidth + aMarkers[i].$().width() + UploadCollectionItem.MARKER_MARGIN;
		}
		if (iMarkersWidth > 0) {
			var $FileName = this.$().find("#" + this.getId() + "-ta_filenameHL");
			if ($FileName) {
				sStyle = "max-width: calc(100% - " + iMarkersWidth + "px)";
				if ($FileName.attr("style") !== sStyle) {
					$FileName.attr("style", sStyle);
				}
			}
		}
	};

	UploadCollectionItem.prototype._getFileNameLink = function () {
		var oParent = this.getParent();
		if (!this._oFileNameLink) {
			this._oFileNameLink = new Link({
				id: this.getId() + "-ta_filenameHL",
				press: [this, oParent._onItemPressed, oParent]
			});
			this._oFileNameLink.setEnabled(this._getPressEnabled() && !this._bContainsError);
			this._oFileNameLink.addStyleClass("sapMUCFileName");
			this._oFileNameLink.setModel(this.getModel());
			this._oFileNameLink.setText(this.getFileName());
			this.addDependent(this._oFileNameLink);
		}

		return this._oFileNameLink;
	};

	UploadCollectionItem.prototype._setIsEdited = function (bIsEdited) {
		this._bIsEdited = bIsEdited;
		this._setContainsError(false);
		this.invalidate();
	};

	UploadCollectionItem.prototype._getContainsError = function () {
		return this._bContainsError;
	};

	UploadCollectionItem.prototype._setContainsError = function (bContainsError) {
		this._bContainsError = bContainsError;
		this._updateFileNameEdit();
	};

	UploadCollectionItem.prototype._updateFileNameEdit = function () {
		if (!this._bIsEdited) {
			var oFile = UploadCollectionItem._splitFileName(this.getFileName());
			this._oFileNameEdit.setValue(oFile.name);
		}
		if (this._bContainsError) {
			this._oFileNameEdit.setValueState(ValueState.Error);
			this._oFileNameEdit.setValueStateText("");
			this._oFileNameEdit.setShowValueStateMessage(false);
		} else {
			this._oFileNameEdit.setValueState(ValueState.None);
			if (this._oFileNameEdit.getValue().length === 0) {
				this._oFileNameEdit.setValueStateText(this._oRb.getText("UPLOADCOLLECTION_TYPE_FILENAME"));
			} else {
				this._oFileNameEdit.setValueStateText(this._oRb.getText("UPLOADCOLLECTION_EXISTS"));
			}
			this._oFileNameEdit.setShowValueStateMessage(true);
		}
	};

	UploadCollectionItem.prototype._getFileNameEdit = function () {
		var oParent = this.getParent(),
			oFile,
			iMaxLength;

		if (!this._oFileNameEdit) {
			oFile = UploadCollectionItem._splitFileName(this.getFileName());
			iMaxLength = oParent.getMaximumFilenameLength();

			this._oFileNameEdit = new Input({
				id: this.getId() + "-" + UploadCollectionItem.FILE_NAME_EDIT_ID,
				type: Library.InputType.Text
			});
			this._oFileNameEdit.addStyleClass("sapMUCEditBox");
			this._oFileNameEdit.setModel(this.getModel());
			this._oFileNameEdit.setFieldWidth("75%");
			this._oFileNameEdit.setDescription(oFile.extension);
			if (oFile.extension && (iMaxLength - oFile.extension.length) > 0) {
				this._oFileNameEdit.setProperty("maxLength", iMaxLength - oFile.extension.length, true);
			}
			this._updateFileNameEdit();
			this.addDependent(this._oFileNameEdit);
		}

		return this._oFileNameEdit;
	};

	/**
	 * Checks if and how the file type restriction changed for this item.
	 * @param {String[]} aTypes List of allowed file types.
	 * @private
	 */
	UploadCollectionItem.prototype._checkFileTypeRestriction = function (aTypes) {
		var oFile = UploadCollectionItem._splitFileName(this.getFileName()),
			bRestricted = (!!this.getFileName() && !!aTypes && (aTypes.length > 0)
				&& oFile.extension && aTypes.indexOf(oFile.extension.toLowerCase()) === -1);
		if (bRestricted !== this._bFileTypeRestricted) {
			this._bFileTypeRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent().fireTypeMissmatch({
					fileType: oFile.extension,
					mimeType: this.getMimeType(),
					files: [this._getFileObject()]
				});
			}
		}
	};

	/**
	 * Checks if and how the file name length restriction changed for this item.
	 * @param {int} iMaxLength Maximum length of file name.
	 * @private
	 */
	UploadCollectionItem.prototype._checkFileNameLengthRestriction = function (iMaxLength) {
		var bRestricted = (iMaxLength && !!this.getFileName() && this.getFileName().length > iMaxLength);
		if (bRestricted !== this._bFileNameLengthRestricted) {
			this._bFileNameLengthRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent().fireFilenameLengthExceed({
					files: [this._getFileObject()]
				});
			}
		}
	};

	/**
	 * Checks if and how the file size restriction changed for this item.
	 * @param {int} iMaxSize Maximum file size allowed in megabytes.
	 * @private
	 */
	UploadCollectionItem.prototype._checkFileSizeRestriction = function (iMaxSize) {
		var bRestricted = (iMaxSize && this.getFileSize() > iMaxSize);
		if (bRestricted !== this._bFileSizeRestricted) {
			this._bFileSizeRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent().fireFileSizeExceed({
					files: [this._getFileObject()]
				});
			}
		}
	};

	/**
	 * Checks if and how the mime type restriction changed for this item.
	 * @param {String[]} aTypes List of allowed mime types.
	 * @private
	 */
	UploadCollectionItem.prototype._checkMimeTypeRestriction = function (aTypes) {
		var oFile = UploadCollectionItem._splitFileName(this.getFileName()),
			bRestricted = (!!aTypes && (aTypes.length > 0) && this.getMimeType() && aTypes.indexOf(this.getMimeType()) === -1);
		if (bRestricted !== this._bMimeTypeRestricted) {
			this._bMimeTypeRestricted = bRestricted;
			this.invalidate();
			if (bRestricted && this.getParent()) {
				this.getParent().fireTypeMissmatch({
					fileType: oFile.extension,
					mimeType: this.getMimeType(),
					files: [this._getFileObject()]
				});
			}
		}
	};

	/**
	 * Checks actual restriction state of the item.
	 * @returns {boolean} True if restricted in any way, false otherwise.
	 * @private
	 */
	UploadCollectionItem.prototype._isRestricted = function () {
		return this._bFileTypeRestricted || this._bFileNameLengthRestricted || this._bFileSizeRestricted || this._bMimeTypeRestricted;
	};

	/* =================================== */
	/* Redefined setter and getter methods */
	/* =================================== */

	UploadCollectionItem.prototype.setUrl = function (sUrl) {
		if (this.getUrl() !== sUrl) {
			this.setProperty("url", sUrl, true);
			if (this.getParent()) {
				this._getFileNameLink().setEnabled(this._getPressEnabled() && !this._bContainsError);
			}
		}
		return this;
	};

	UploadCollectionItem.prototype.setEnableDelete = function (bEnable) {
		if (this.getEnableDelete() !== bEnable) {
			this.setProperty("enableDelete", bEnable, true);
			if (this.getParent()) {
				this._getDeleteButton().setEnabled(bEnable);
			}
		}
		return this;
	};

	UploadCollectionItem.prototype.setVisibleDelete = function (bVisible) {
		if (this.getVisibleDelete() !== bVisible) {
			this.setProperty("visibleDelete", bVisible, true);
			if (this.getParent()) {
				this._getDeleteButton().setVisible(bVisible);
			}
		}
		return this;
	};

	UploadCollectionItem.prototype.setEnableEdit = function (bEnable) {
		if (this.getEnableEdit() !== bEnable) {
			this.setProperty("enableEdit", bEnable, true);
			if (this.getParent()) {
				this._getEditButton().setEnabled(bEnable);
			}
		}
		return this;
	};

	UploadCollectionItem.prototype.setVisibleEdit = function (bVisible) {
		if (this.getVisibleEdit() !== bVisible) {
			this.setProperty("visibleEdit", bVisible, true);
			if (this.getParent()) {
				this._getEditButton().setVisible(bVisible);
			}
		}
		return this;
	};

	UploadCollectionItem.prototype.setContributor = function (sContributor) {
		if (this.getContributor() !== sContributor) {
			this.setProperty("contributor", sContributor, true);
			this._updateDeprecatedProperties();
		}
		return this;
	};

	UploadCollectionItem.prototype.setUploadedDate = function (sUploadedDate) {
		if (this.getUploadedDate() !== sUploadedDate) {
			this.setProperty("uploadedDate", sUploadedDate, true);
			this._updateDeprecatedProperties();
		}
		return this;
	};

	UploadCollectionItem.prototype.setFileSize = function (sFileSize) {
		if (this.getFileSize() !== sFileSize) {
			this.setProperty("fileSize", sFileSize, true);
			this._updateDeprecatedProperties();
			if (this.getParent()) {
				this._checkFileSizeRestriction(this.getParent().getMaximumFileSize());
			}
		}
		return this;
	};

	UploadCollectionItem.prototype.setSelected = function (bSelected) {
		if (this.getSelected() !== bSelected) {
			this.setProperty("selected", bSelected, true);
			this.fireEvent("selected");
		}
		return this;
	};

	UploadCollectionItem.prototype.setFileName = function (sFileName) {
		var oFile;
		if (this.getFileName() !== sFileName) {
			this.setProperty("fileName", sFileName, true);
			// File name related controls available no sooner than after parent is set
			if (this.getParent()) {
				this._getFileNameLink().setText(sFileName);
				oFile = UploadCollectionItem._splitFileName(sFileName);
				this._getFileNameEdit().setValue(oFile.name);
				this._checkFileNameLengthRestriction(this.getParent().getMaximumFilenameLength());
				this._checkFileTypeRestriction(this.getParent().getFileType());
			}
		}
		return this;
	};

	UploadCollectionItem.prototype.setMimeType = function (sMimeType) {
		if (this.getMimeType() !== sMimeType) {
			this.setProperty("mimeType", sMimeType, true);
			if (this.getParent()) {
				this._checkMimeTypeRestriction(this.getParent().getMimeType());
			}
		}
		return this;
	};

	/**
	 * Downloads the item.
	 * The sap.ui.core.util.File method is used here. For further details on this method, see {sap.ui.core.util.File.save}.
	 * @param {boolean} bAskForLocation Decides whether to ask for a location to download or not.
	 * @since 1.36.0
	 * @public
	 * @returns {boolean} <code>true</code> if download is possible, otherwise <code>false</code>
	 */
	UploadCollectionItem.prototype.download = function (bAskForLocation) {
		// File.save doesn't work in Safari but URLHelper.redirect does work.
		// So, this overwrites the value of askForLocation in order to make it work.
		if (Device.browser.name === "sf") {
			bAskForLocation = false;
		}

		// If there isn't URL, download is not possible
		if (!this.getUrl()) {
			Log.warning("Item to be downloaded does not have a URL.");
			return false;
		} else if (bAskForLocation) {
			var oBlob = null;
			var oXhr = new window.XMLHttpRequest();
			oXhr.open("GET", this.getUrl());
			oXhr.responseType = "blob";// force the HTTP response, response-type header to be blob
			oXhr.onload = function () {
				var sFileName = this.getFileName();
				var oFileNameAndExtension = UploadCollectionItem._splitFileName(sFileName, false);
				var sFileExtension = oFileNameAndExtension.extension;
				sFileName = oFileNameAndExtension.name;
				oBlob = oXhr.response; // oXhr.response is now a blob object
				FileUtil.save(oBlob, sFileName, sFileExtension, this.getMimeType(), "utf-8");
			}.bind(this);
			oXhr.send();
			return true;
		} else {
			Library.URLHelper.redirect(this.getUrl(), true);
			return true;
		}
	};

	/**
	 * Split file name into name and extension.
	 * @param {string} sFileName Full file name inclusive the extension
	 * @param {boolean} bWithDot True if the extension should be returned starting with a dot (ie: '.jpg'). False for no dot. If not value is provided, the extension name is given without dot
	 * @returns {object} oResult Filename and Extension
	 * @private
	 */
	UploadCollectionItem._splitFileName = function (sFileName, bWithDot) {
		var oResult = {};
		var oRegex = /(?:\.([^.]+))?$/;
		var aFileExtension = oRegex.exec(sFileName);
		oResult.name = sFileName.slice(0, sFileName.indexOf(aFileExtension[0]));
		if (bWithDot) {
			oResult.extension = aFileExtension[0];
		} else {
			oResult.extension = aFileExtension[1];
		}
		return oResult;
	};

	/**
	 * Update deprecated properties aggregation
	 * @private
	 * @since 1.30.0
	 */
	UploadCollectionItem.prototype._updateDeprecatedProperties = function () {
		var aProperties = ["uploadedDate", "contributor", "fileSize"];
		this.removeAllAggregation("_propertyAttributes", true);
		jQuery.each(aProperties, function (i, sName) {
			var sValue = this.getProperty(sName),
				oAttribute = this._mDeprecatedProperties[sName];
			if (jQuery.type(sValue) === "number" && !!sValue || !!sValue) {
				if (!oAttribute) {
					oAttribute = new ObjectAttribute({
						active: false
					});
					this._mDeprecatedProperties[sName] = oAttribute;
					this.addAggregation("_propertyAttributes", oAttribute, true);
					oAttribute.setText(sValue);
				} else {
					oAttribute.setText(sValue);
					this.addAggregation("_propertyAttributes", oAttribute, true);
				}
			} else if (oAttribute) {
				oAttribute.destroy();
				delete this._mDeprecatedProperties[sName];
			}
		}.bind(this));
		this.invalidate();
	};

	/**
	 * Return all attributes, the deprecated property attributes and the aggregated attributes in one array.
	 * @private
	 * @since 1.30.0
	 * @returns {sap.m.ObjectAttribute[]} Mapped properties
	 */
	UploadCollectionItem.prototype.getAllAttributes = function () {
		return this.getAggregation("_propertyAttributes", []).concat(this.getAttributes());
	};

	/**
	 * Checks if item can be pressed.
	 * @return {boolean} True if item press is enabled.
	 * @private
	 */
	UploadCollectionItem.prototype._getPressEnabled = function () {
		return this.hasListeners("press") || !!jQuery.trim(this.getUrl());
	};

	/**
	 * Determines the thumbnail of an item.
	 * @param {string} sThumbnailUrl Url of the thumbnail-image of the UC list item
	 * @param {string} sFileName Name of the file to determine if there could be a thumbnail
	 * @returns {string} ThumbnailUrl or icon
	 * @private
	 */
	UploadCollectionItem._getThumbnail = function (sThumbnailUrl, sFileName) {
		if (sThumbnailUrl) {
			return sThumbnailUrl;
		} else {
			return UploadCollectionItem._getIconFromFileName(sFileName);
		}
	};

	UploadCollectionItem._getIconFromFileName = function (sFileName) {
		var sFileExtension = this._splitFileName(sFileName).extension;
		if (jQuery.type(sFileExtension) === "string") {
			sFileExtension = sFileExtension.toLowerCase();
		}

		switch (sFileExtension) {
			case "bmp" :
			case "jpg" :
			case "jpeg" :
			case "png" :
				return UploadCollectionItem.CARD_ICON;
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

	UploadCollectionItem.prototype._getAriaLabelForPicture = function () {
		// Prerequisite: the items have field names or the app provides explicit texts for pictures
		return this.getAriaLabelForPicture() || this.getFileName();
	};

	UploadCollectionItem.prototype._getIcon = function () {
		var oParent = this.getParent(),
			sThumbnailUrl, sThumbnail, sStyleClass;

		if (!this._oIcon) {
			sThumbnailUrl = this.getThumbnailUrl();
			if (sThumbnailUrl) {
				this._oIcon = IconPool.createControlByURI({
					id: this.getId() + "-ia_imageHL",
					src: UploadCollectionItem._getThumbnail(sThumbnailUrl, this.getFileName()),
					decorative: false
				}, Image).addStyleClass("sapMUCItemImage sapMUCItemIcon");
				this._oIcon.setAlt(this._getAriaLabelForPicture()); //Set the alt property directly to avoid some additional logic in the icon's constructor
			} else {
				sThumbnail = UploadCollectionItem._getThumbnail(undefined, this.getFileName());
				this._oIcon = new Icon(this.getId() + "-ia_iconHL", {
					src: sThumbnail,
					decorative: false,
					useIconTooltip: false
				});
				this._oIcon.setAlt(this._getAriaLabelForPicture()); //Set the alt property directly to avoid some additional logic in the icon's constructor
				//Sets the right style class depending on the icon/placeholder status (clickable or not)
				if (!this._bContainsError && jQuery.trim(this.getUrl())) {
					sStyleClass = "sapMUCItemIcon";
				} else {
					sStyleClass = "sapMUCItemIconInactive";
				}
				if (sThumbnail === UploadCollectionItem.CARD_ICON) {
					if (!this._bContainsError && jQuery.trim(this.getUrl())) {
						sStyleClass = sStyleClass + " sapMUCItemPlaceholder";
					} else {
						sStyleClass = sStyleClass + " sapMUCItemPlaceholderInactive";
					}
				}
				this._oIcon.addStyleClass(sStyleClass);
			}
			if (this._getPressEnabled() && !this._bContainsError) {
				this._oIcon.attachPress(this, oParent._onItemPressed, oParent);
			}
		}

		return this._oIcon;
	};

	UploadCollectionItem.prototype._getButtons = function () {
		var aButtons = [];

		if (this._bIsEdited) {
			aButtons.push(this._getConfirmRenameButton());
			aButtons.push(this._getCancelRenameButton());
		} else if (this.getUploadState() === UploadState.Pending) {
			aButtons.push(this._getDeleteButton());
		} else if (this.getUploadState() === UploadState.Uploading) {
			aButtons.push(this._getTerminateButton());
		} else {
			if (this.getVisibleEdit()) {
				aButtons.push(this._getEditButton());
			}
			if (this.getVisibleDelete()) {
				aButtons.push(this._getDeleteButton());
			}
		}
		return aButtons;
	};

	return UploadCollectionItem;
});