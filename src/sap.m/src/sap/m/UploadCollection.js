/*!
 * ${copyright}
 */
// Provides control sap.m.UploadCollection.
sap.ui.define(["jquery.sap.global", "./MessageBox", "./Dialog", "./library", "sap/ui/core/Control", "sap/ui/core/Icon", "sap/m/Text", "sap/m/List", "sap/ui/unified/FileUploaderParameter", "sap/ui/unified/FileUploader", "sap/ui/core/format/FileSizeFormat", "sap/m/Link", "sap/m/OverflowToolbar", "./ObjectAttribute", "./ObjectStatus", "./UploadCollectionItem", "sap/ui/core/HTML", "./BusyIndicator", "./CustomListItem", "sap/ui/core/ResizeHandler", "sap/ui/Device", "./CustomListItemRenderer", "sap/ui/core/HTMLRenderer", "./LinkRenderer", "./ObjectAttributeRenderer", "./ObjectStatusRenderer", "./ObjectMarkerRenderer", "./TextRenderer", "./DialogRenderer"],
	function(jQuery, MessageBox, Dialog, Library, Control, Icon, Text, List, FileUploaderParameter, FileUploader, FileSizeFormat, Link, OverflowToolbar, ObjectAttribute, ObjectStatus, UploadCollectionItem, HTML, BusyIndicator, CustomListItem, ResizeHandler, Device) {
	"use strict";

	/**
	 * Constructor for a new UploadCollection.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control allows you to upload single or multiple files from your devices (desktop, tablet or phone) and attach them to the application.
	 *
	 * The consuming application needs to take into account that the consistency checks of the model during the upload of the file need to be performed, for example, if the user is editing or deleting a file.
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
	var UploadCollection = Control.extend("sap.m.UploadCollection", /** @lends sap.m.UploadCollection.prototype */ {

		constructor : function(sId, mSettings) {
			// Delete 'instantUpload' before calling the super constructor to avoid unwanted error logs
			var bInstantUpload;
			if (mSettings && mSettings.instantUpload === false) {
				bInstantUpload = mSettings.instantUpload;
				delete mSettings.instantUpload;
			} else if (sId && sId.instantUpload === false) {
				bInstantUpload = sId.instantUpload;
				delete sId.instantUpload;
			}
			if (mSettings && mSettings.mode === sap.m.ListMode.MultiSelect && bInstantUpload === false){
				mSettings.mode = sap.m.ListMode.None;
				jQuery.sap.log.info("sap.m.ListMode.MultiSelect is not supported by UploadCollection for Upload Pending scenario. Value has been resetted to 'None'");
			}else if (sId && sId.mode === sap.m.ListMode.MultiSelect && bInstantUpload === false){
				sId.mode = sap.m.ListMode.None;
				jQuery.sap.log.info("sap.m.ListMode.MultiSelect is not supported by UploadCollection for Upload Pending scenario. Value has been resetted to 'None'");
			}
			try {
				Control.apply(this, arguments);
				if (bInstantUpload === false) {
					this.bInstantUpload = bInstantUpload;
					this._oFormatDecimal = FileSizeFormat.getInstance({binaryFilesize: false, maxFractionDigits: 1, maxIntegerDigits: 3});
				}
			} catch (e) {
				this.destroy();
				throw e;
			}
		},

		metadata : {

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
			 * Lets the user select multiple files from the same folder and then upload them.
			 * Internet Explorer 8 and 9 do not support this property.
			 * Please note that the various operating systems for mobile devices can react differently to the property so that fewer upload functions may be available in some cases.
			 *
			 * If multiple property is set to false, the control shows an error message if more than one file is chosen for drag & drop.
			 */
			multiple : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Allows you to set your own text for the 'No data' text label.
			 */
			noDataText : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Allows you to set your own text for the 'No data' description label.
			 * @since 1.46.0
			 */
			noDataDescription : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Allows the user to use the same name for a file when editing the file name. 'Same name' refers to an already existing file name in the list.
			 */
			sameFilenameAllowed : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Defines whether separators are shown between list items.
			 */
			showSeparators : {type : "sap.m.ListSeparators", group : "Appearance", defaultValue : sap.m.ListSeparators.All},

			/**
			 * Enables the upload of a file.
			 */
			uploadEnabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Specifies the URL where the uploaded files have to be stored.
			 */
			uploadUrl : {type : "string", group : "Data", defaultValue : "../../../upload"},

			/**
			 * If false, no upload is triggered when a file is selected. In addition, if a file was selected, a new FileUploader instance is created to ensure that multiple files from multiple folders can be chosen.
			 * @since 1.30
			 */
			instantUpload : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Sets the title text in the toolbar of the list of attachments.
			 * To show as well the number of attachments in brackets like the default text does. The number of attachments could be retrieved via "getItems().length".
			 * If a new title is set, the default is deactivated.
			 * The default value is set to language-dependent "Attachments (n)".
			 * @since 1.30
			 */
			numberOfAttachmentsText : {type : "string" , group : "Appearance", defaultValue : null},

			/**
			 * Defines the selection mode of the control (e.g. None, SingleSelect, MultiSelect, SingleSelectLeft, SingleSelectMaster).
			 * Since the UploadCollection reacts like a list for attachments, the API is close to the ListBase Interface.
			 * sap.m.ListMode.Delete mode is not supported and will be automatically set to sap.m.ListMode.None.
			 * In addition, if instant upload is set to false the mode sap.m.ListMode.MultiSelect is not supported and will be automatically set to sap.m.ListMode.None.
			 *
			 * @since 1.34
			 */
			mode: {type : "sap.m.ListMode", group : "Behavior", defaultValue : "None"},

			/**
			 * If true, the button used for uploading files is invisible.
			 * @since 1.42.0
			 */
			uploadButtonInvisible : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * If true, the button that is used to terminate the instant file upload gets visible.
			 * The button normally appears when a file is being uploaded.
			 * @since 1.42.0
			 */
			terminationEnabled : {type : "boolean", group : "Behavior", defaultValue : true}
		},
		defaultAggregation : "items",
		aggregations : {

			/**
			 * Uploaded items.
			 */
			items : {type : "sap.m.UploadCollectionItem", multiple : true, singularName : "item", bindable : "bindable"},

			/**
			 * Specifies the header parameters for the FileUploader that are submitted only with XHR requests.
			 * Header parameters are not supported by Internet Explorer 8 and 9.
			 */
			headerParameters : {type : "sap.m.UploadCollectionParameter", multiple : true, singularName : "headerParameter"},

			/**
			 * Specifies the parameters for the FileUploader that are rendered as a hidden input field.
			 */
			parameters : {type : "sap.m.UploadCollectionParameter", multiple : true, singularName : "parameter"},

			/**
			 * Specifies the toolbar.
			 * @since 1.34
			 */
			toolbar : {type: "sap.m.OverflowToolbar", multiple : false},

			/**
			 * Specifies the info toolbar for filtering information. Sorting information will not displayed.
			 * @since 1.44
			 */
			infoToolbar : {type: "sap.m.Toolbar", multiple : false},

			/**
			 * Internal aggregation to hold the list in controls tree.
			 * @since 1.34
			 */
			_list : {
				type : "sap.m.List",
				multiple : false,
				visibility : "hidden"
			},

			/**
			 * The icon is displayed in no data page
			 * @since 1.46.0
			 */
			_noDataIcon : {
				type : "sap.ui.core.Icon",
				multiple : false,
				visibility : "hidden"
			},

			/**
			 * Internal aggregation to hold the drag and drop icon of indicator.
			 * @since 1.46.0
			 */
			_dragDropIcon : {
				type : "sap.ui.core.Icon",
				multiple : false,
				visibility : "hidden"
			},

			/**
			 * Internal aggregation to hold the drag and drop text of indicator.
			 * @since 1.46.0
			 */
			_dragDropText : {
				type : "sap.m.Text",
				multiple: false,
				visibility : "hidden"
			}
		},

		events : {
			/**
			 * The event is triggered when files are selected in the FileUploader dialog. Applications can set parameters and headerParameters which will be dispatched to the embedded FileUploader control.
			 * Limitation: parameters and headerParameters are not supported by Internet Explorer 9.
			 */
			change : {
				parameters : {
					/**
					 * A unique Id of the attached document.
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
			 * The event is triggered when an uploaded attachment is selected and the Delete button is pressed.
			 */
			fileDeleted : {
				parameters : {
					/**
					 * A unique Id of the attached document.
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
					* A unique Id of the attached document.
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
					 * A unique Id of the attached document.
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
					 * The renamed UI element as an UploadCollectionItem.
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
					 * A unique Id of the attached document.
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
					* A unique Id of the attached document.
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
					 * Ready state XHR. This parameter is deprecated since version 1.28.0., use parameter files instead.
					 * @deprecated Since version 1.28.0. This parameter is deprecated, use parameter files instead.
					 */
					readyStateXHR : {type : "string"},
					/**
					 * Response of the completed upload request. This parameter is deprecated since version 1.28.0., use parameter files instead.
					 * @deprecated Since version 1.28.0. This parameter is deprecated, use parameter files instead.
					 */
					response : {type : "string"},
					/**
					 * Status Code of the completed upload event. This parameter is deprecated since version 1.28.0., use parameter files instead.
					 * @deprecated Since version 1.28.0. This parameter is deprecated, use parameter files instead.
					 */
					status : {type : "string"},
					/**
					 * A list of uploaded files. Each entry contains the following members.
					 * fileName	: The name of a file to be uploaded.
					 * response	: Response message which comes from the server. On the server side, this response has to be put within the 'body' tags of the response document of the iFrame. It can consist of a return code and an optional message. This does not work in cross-domain scenarios.
					 * reponse	: deprecated Since version 1.48.0. This parameter is deprecated, use parameter response instead.
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
			 */
			uploadTerminated : {
				parameters: {
					/**
					 * Specifies the name of the file of which the upload is to be terminated.
					 */
					fileName: {type : "string"},
					/**
					 * This callback function returns the corresponding header parameter (type sap.m.UploadCollectionParameter) if available.
					 */
					getHeaderParameter: {type : "function",
						parameters: {
							/**
							 * The (optional) name of the header parameter. If no parameter is provided all header parameters are returned.
							 */
							headerParameterName: {type : "string"}
						}
					}
				}
			},

			/**
			 * The event is triggered before the actual upload starts. An event is fired per file. All the necessary header parameters should be set here.
			 */
			beforeUploadStarts : {
				parameters: {
					/**
					 * Specifies the name of the file to be uploaded.
					 */
					fileName: {type : "string"},
					/**
					 * Adds a header parameter to the file that will be uploaded.
					 */
					addHeaderParameter: {type : "function",
						parameters: {
							/**
							 * Specifies a header parameter that will be added
							 */
							headerParameter: {type : "sap.m.UploadCollectionParameter"}
						}
					},
					/**
					 * Returns the corresponding header parameter (type sap.m.UploadCollectionParameter) if available.
					 */
					getHeaderParameter: {type : "function",
						parameters: {
							/**
							 * The (optional) name of the header parameter. If no parameter is provided all header parameters are returned.
							 */
							headerParameterName: {type : "string"}
						}
					}
				}
			},

			/**
			 * Fires when selection is changed via user interaction inside the control.
			 * @since 1.36.0
			 */
			selectionChange : {
				parameters : {
					/**
					 * The item whose selection has changed. In <code>MultiSelect</code> mode, only the selected item upmost is returned. This parameter can be used for single-selection modes.
					 */
					selectedItem : {type : "sap.m.UploadCollectionItem"},

					/**
					 * Array of items whose selection has changed. This parameter can be used for <code>MultiSelect</code> mode.
					 */
					selectedItems : {type : "sap.m.UploadCollectionItem[]"},

					/**
					 * Indicates whether the <code>listItem</code> parameter is selected or not.
					 */
					selected : {type : "boolean"}
				}
			}
		}
	}});

	UploadCollection._uploadingStatus = "uploading";
	UploadCollection._displayStatus = "display";
	UploadCollection._toBeDeletedStatus = "toBeDeleted";
	UploadCollection._pendingUploadStatus = "pendingUploadStatus"; // UploadCollectionItem has this status only if UploadCollection is used with the property 'instantUpload' = false
	UploadCollection._placeholderCamera = "sap-icon://card";
	UploadCollection._markerMargin = 8; // the left margin for each marker in px

	if (Device.system.phone) {
		UploadCollection._resizeTimeoutInterval = 500; // the time interval after the resize is applied for phones (in msec)
	} else {
		UploadCollection._resizeTimeoutInterval = 100; // the time interval after the resize is applied for other devices (in msec)
	}

	/**
	 * @description This file defines behavior for the control
	 * @private
	 */
	UploadCollection.prototype.init = function() {
		UploadCollection.prototype._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._headerParamConst = {
			requestIdName : "requestId" + jQuery.now(),
			fileNameRequestIdName : "fileNameRequestId" + jQuery.now()
		};
		this._requestIdValue = 0;
		this._iFUCounter = 0; // it is necessary to count FileUploader instances in case of 'instantUpload' = false

		this._oList = new List(this.getId() + "-list", {
			selectionChange : [this._handleSelectionChange, this]
		});
		this.setAggregation("_list", this._oList, true);
		this._oList.addStyleClass("sapMUCList");
		this.setAggregation("_noDataIcon", new Icon(this.getId() + "-no-data-icon", {
			src : "sap-icon://document",
			size : "6rem",
			noTabStop : true
		}), true);
		this.setAggregation("_dragDropIcon", new Icon(this.getId() + "-drag-drop-icon", {
			src : "sap-icon://upload-to-cloud",
			size : "4rem",
			noTabStop : true
		}), true);
		this.setAggregation("_dragDropText", new Text(this.getId() + "-drag-drop-text", {
			text : this._oRb.getText("UPLOADCOLLECTION_DRAG_FILE_INDICATOR")
		}), true);

		this._iUploadStartCallCounter = 0;
		this.aItems = [];
		this._aDeletedItemForPendingUpload = [];
		this._aFileUploadersForPendingUpload = [];
		this._aFilesFromDragAndDropForPendingUpload = [];
		this._iFileUploaderPH = null; // Index of the place holder for the File Uploader
		this._oListEventDelegate = null;
		this._oItemToUpdate = null;
		this._sReziseHandlerId = null;
	};

	/* =========================================================== */
	/* Redefinition of setter and getter methods                   */
	/* =========================================================== */

	UploadCollection.prototype.setFileType = function(aFileTypes) {
		if (!aFileTypes) {
			 return this;
		}
		if (!this.getInstantUpload()) {
			jQuery.sap.log.info("As property instantUpload is false it is not allowed to change fileType at runtime.");
		} else {
			var cLength = aFileTypes.length;
			for (var i = 0; i < cLength; i++) {
				aFileTypes[i] = aFileTypes[i].toLowerCase();
			}
			this.setProperty("fileType", aFileTypes);
			if (this._getFileUploader().getFileType() !== aFileTypes) {
				this._getFileUploader().setFileType(aFileTypes);
			}
		}
		return this;
	};

	UploadCollection.prototype.setMaximumFilenameLength = function(iMaximumFilenameLength) {
		if (!this.getInstantUpload()) {
			jQuery.sap.log.info("As property instantUpload is false it is not allowed to change maximumFilenameLength at runtime.");
		} else {
			this.setProperty("maximumFilenameLength", iMaximumFilenameLength, true);
			if (this._getFileUploader().getMaximumFilenameLength() !== iMaximumFilenameLength) {
				this._getFileUploader().setMaximumFilenameLength(iMaximumFilenameLength);
			}
		}
		return this;
	};

	UploadCollection.prototype.setMaximumFileSize = function(iMaximumFileSize) {
		if (!this.getInstantUpload()) {
			jQuery.sap.log.info("As property instantUpload is false it is not allowed to change maximumFileSize at runtime.");
		} else {
			this.setProperty("maximumFileSize", iMaximumFileSize, true);
			if (this._getFileUploader().getMaximumFileSize() !== iMaximumFileSize) {
				this._getFileUploader().setMaximumFileSize(iMaximumFileSize);
			}
		}
		return this;
	};

	UploadCollection.prototype.setMimeType = function(aMimeTypes) {
		if (!this.getInstantUpload()) {
			jQuery.sap.log.info("As property instantUpload is false it is not allowed to change mimeType at runtime.");
		} else {
			this.setProperty("mimeType", aMimeTypes);
			if (this._getFileUploader().getMimeType() !== aMimeTypes) {
				this._getFileUploader().setMimeType(aMimeTypes);
			}
			return this;
		}
	};

	UploadCollection.prototype.setMultiple = function(bMultiple) {
		if (!this.getInstantUpload()) {
			jQuery.sap.log.info("As property instantUpload is false it is not allowed to change multiple at runtime.");
		} else {
			this.setProperty("multiple", bMultiple);
			if (this._getFileUploader().getMultiple() !== bMultiple) {
				this._getFileUploader().setMultiple(bMultiple);
			}
			return this;
		}
	};

	UploadCollection.prototype.setShowSeparators = function(bShowSeparators) {
		this.setProperty("showSeparators", bShowSeparators);
		if (this._oList.getShowSeparators() !== bShowSeparators) {
			this._oList.setShowSeparators(bShowSeparators);
		}
		return this;
	};

	UploadCollection.prototype.setUploadEnabled = function(bUploadEnabled) {
		if (!this.getInstantUpload()) {
			jQuery.sap.log.info("As property instantUpload is false it is not allowed to change uploadEnabled at runtime.");
		} else {
			this.setProperty("uploadEnabled", bUploadEnabled);
			if (this._getFileUploader().getEnabled() !== bUploadEnabled) {
				this._getFileUploader().setEnabled(bUploadEnabled);
			}
		}
		return this;
	};

	UploadCollection.prototype.setUploadUrl = function(sUploadUrl) {
		if (!this.getInstantUpload()) {
			jQuery.sap.log.info("As property instantUpload is false it is not allowed to change uploadUrl at runtime.");
		} else {
			this.setProperty("uploadUrl", sUploadUrl);
			if (this._getFileUploader().getUploadUrl() !== sUploadUrl) {
				this._getFileUploader().setUploadUrl(sUploadUrl);
			}
		}
		return this;
	};

	UploadCollection.prototype.setInstantUpload = function() {
		jQuery.sap.log.error("It is not supported to change the behavior at runtime.");
		return this;
	};

	UploadCollection.prototype.setMode = function(mode) {
		if (mode === sap.m.ListMode.Delete) {
			this._oList.setMode(sap.m.ListMode.None);
			jQuery.sap.log.info("sap.m.ListMode.Delete is not supported by UploadCollection. Value has been resetted to 'None'");
		}else if (mode === sap.m.ListMode.MultiSelect && !this.getInstantUpload()) {
			this._oList.setMode(sap.m.ListMode.None);
			jQuery.sap.log.info("sap.m.ListMode.MultiSelect is not supported by UploadCollection for Pending Upload. Value has been resetted to 'None'");
		}else {
			this._oList.setMode(mode);
		}
		return this;
	};

	UploadCollection.prototype.getMode = function() {
		return this._oList.getMode();
	};

	UploadCollection.prototype.getToolbar = function() {
		return this._oHeaderToolbar;
	};

	UploadCollection.prototype.getInfoToolbar = function() {
		return this._oList.getAggregation("infoToolbar");
	};

	UploadCollection.prototype.getNoDataText = function() {
		var sNoDataText = this.getProperty("noDataText");
		sNoDataText = sNoDataText || this._oRb.getText("UPLOADCOLLECTION_NO_DATA_TEXT");
		return sNoDataText;
	};

	UploadCollection.prototype.getNoDataDescription = function() {
		var sNoDataDescription = this.getProperty("noDataDescription");
		sNoDataDescription = sNoDataDescription || this._oRb.getText("UPLOADCOLLECTION_NO_DATA_DESCRIPTION");
		return sNoDataDescription;
	};

	UploadCollection.prototype.setInfoToolbar = function(infoToolbar) {
		if (this.getInfoToolbar() !== infoToolbar) {
			this._oList.setAggregation("infoToolbar", infoToolbar, false);
		}
	};

	UploadCollection.prototype.setUploadButtonInvisible = function(uploadButtonInvisible) {
		if (this.getUploadButtonInvisible() === uploadButtonInvisible) {
			return this;
		}
		this.setProperty("uploadButtonInvisible", uploadButtonInvisible, true);
		if (this.getInstantUpload()) {
			this._getFileUploader().setVisible(!uploadButtonInvisible);
		} else {
			this._setFileUploaderVisibility(uploadButtonInvisible);
		}

		if (this._bDragDropEnabled) {
			this._unbindDragEnterLeave();
			this._bDragDropEnabled = false;
		} else {
			this._bindDragEnterLeave();
		}
		return this;
	};

	/* =========================================================== */
	/* API methods                                           */
	/* =========================================================== */
	/**
	 * @description Starts the upload for all selected files.
	 * @type {void}
	 * @public
	 * @since 1.30
	 */
	UploadCollection.prototype.upload = function() {
		if (this.getInstantUpload()) {
			jQuery.sap.log.error("Not a valid API call. 'instantUpload' should be set to 'false'.");
		}
		var iFileUploadersCounter = this._aFileUploadersForPendingUpload.length;
		// upload files that are selected through popup
		for (var i = 0; i < iFileUploadersCounter; i++) {
			this._iUploadStartCallCounter = 0;
			// if the FU comes from drag and drop (without files), ignore it
			if (this._aFileUploadersForPendingUpload[i].getValue()) {
				this._aFileUploadersForPendingUpload[i].upload();
			}
		}
		// upload files that are pushed through drag and drop
		if (this._aFilesFromDragAndDropForPendingUpload.length > 0) {
			// upload the files that are saved in the array
			this._oFileUploader._sendFilesFromDragAndDrop(this._aFilesFromDragAndDropForPendingUpload);
			// clean up the array
			this._aFilesFromDragAndDropForPendingUpload = [];
		}
	};

	/**
	 * @description Returns an array containing the selected UploadCollectionItems.
	 * @returns {sap.m.UploadCollectionItem[]} array with selected items
	 * @public
	 * @since 1.34
	 */
	UploadCollection.prototype.getSelectedItems = function() {
		var aSelectedListItems = this._oList.getSelectedItems();
		return this._getUploadCollectionItemsByListItems(aSelectedListItems);
	};

	/**
	 * @description Returns selected UploadCollectionItem.
	 * @returns {sap.m.UploadCollectionItem} selected item
	 * @since 1.34
	 * @public
	 */
	UploadCollection.prototype.getSelectedItem = function() {
		var oSelectedListItem = this._oList.getSelectedItem();
		if (oSelectedListItem) {
			return this._getUploadCollectionItemByListItem(oSelectedListItem);
		}
	};

	/**
	 * @description Sets an UploadCollectionItem to be selected by id. In single mode, the method removes the previous selection.
	 * @param {string} id The id of the item whose selection to be changed.
	 * @param {boolean} select Sets selected status of the item. Default value is true.
	 * @returns {sap.m.UploadCollection} The current UploadCollection
	 * @since 1.34
	 * @public
	 */
	UploadCollection.prototype.setSelectedItemById = function(id, select) {
		this._oList.setSelectedItemById(id + "-cli", select);
		this._setSelectedForItems([this._getUploadCollectionItemById(id)], select);
		return this;
	};

	/**
	 * @description Selects or deselects the given list item.
	 * @param {sap.m.UploadCollectionItem} uploadCollectionItem The item whose selection to be changed. This parameter is mandatory.
	 * @param {boolean} select Sets selected status of the item. Default value is true.
	 * @returns {sap.m.UploadCollection} The current UploadCollection
	 * @since 1.34
	 * @public
	 */
	UploadCollection.prototype.setSelectedItem = function(uploadCollectionItem, select) {
		this.setSelectedItemById(uploadCollectionItem.getId(), select);
		return this;
	};

	/**
	 * @description Select all items in "MultiSelection" mode.
	 * @returns {sap.m.UploadCollection} The current UploadCollection
	 * @since 1.34
	 * @public
	 */
	UploadCollection.prototype.selectAll = function() {
		var aSelectedList = this._oList.selectAll();
		if (aSelectedList.getItems().length !== this.getItems().length) {
			jQuery.sap.log.info("Internal 'List' and external 'UploadCollection' are not in sync.");
		}
		this._setSelectedForItems(this.getItems(), true);
		return this;
	};

	/**
	 * Downloads the given item.
	 * This function delegates to {sap.m.UploadCollectionItem.download}.
	 * @param {sap.m.UploadCollectionItem} uploadCollectionItem The item to download. This parameter is mandatory.
	 * @param {boolean} askForLocation Decides whether to ask for a location to download or not.
	 * @returns {boolean} True if the download has started successfully. False if the download couldn't be started.
	 * @since 1.36.0
	 * @public
	 */
	UploadCollection.prototype.downloadItem = function(uploadCollectionItem, askForLocation) {
		if (!this.getInstantUpload()) {
			jQuery.sap.log.info("Download is not possible on Pending Upload mode");
			return false;
		} else {
			return uploadCollectionItem.download(askForLocation);
		}
	};

	/**
	 * Opens the FileUploader dialog. When an UploadCollectionItem is provided, this method can be used to update a file with a new version.
	 * In this case, the upload progress can be sequenced using the events: beforeUploadStarts, uploadComplete and uploadTerminated. For this use,
	 * multiple properties from the UploadCollection have to be set to false. If no UploadCollectionItem is provided, only the dialog opens
	 * and no further configuration of the UploadCollection is needed.
	 * @param {sap.m.UploadCollectionItem} item The item to update with a new version. This parameter is mandatory.
	 * @returns {sap.m.UploadCollection} To ensure method chaining, return the UploadCollection.
	 * @since 1.38.0
	 * @public
	 */
	UploadCollection.prototype.openFileDialog = function(item) {
		if (this._oFileUploader) {
			if (item) {
				if (!this._oFileUploader.getMultiple()) {
					this._oItemToUpdate = item;
					this._oFileUploader.$().find("input[type=file]").trigger("click");
				} else {
					jQuery.sap.log.warning("Version Upload cannot be used in multiple upload mode");
				}
			} else {
				this._oFileUploader.$().find("input[type=file]").trigger("click");
			}
		}
		return this;
	};

	UploadCollection.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
		var oFileFromDragDrop, iIndexOfFile;
		if (!this.getInstantUpload() && sAggregationName === "items" && vObject) {
			oFileFromDragDrop = vObject._internalFileIdWithinDragDropArray;
			// if the deleted file is from drag and drop, removes it from the drag and drop array
			if (oFileFromDragDrop) {
				iIndexOfFile = this._aFilesFromDragAndDropForPendingUpload.indexOf(oFileFromDragDrop);
				if (iIndexOfFile !== -1) {
					this._aFilesFromDragAndDropForPendingUpload.splice(iIndexOfFile, 1);
				}
			} else {
				this._aDeletedItemForPendingUpload.push(vObject);
			}
		}
		if (Control.prototype.removeAggregation) {
			return Control.prototype.removeAggregation.apply(this, arguments);
		}
	};

	UploadCollection.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
		if (!this.getInstantUpload() && sAggregationName === "items") {
			if (this._aFileUploadersForPendingUpload) {
				for (var i = 0; i < this._aFileUploadersForPendingUpload.length; i++) {
					this._aFileUploadersForPendingUpload[i].destroy();
					this._aFileUploadersForPendingUpload[i] = null;
				}
				this._aFileUploadersForPendingUpload = [];
			}
		}
		if (Control.prototype.removeAllAggregation) {
			return Control.prototype.removeAllAggregation.apply(this, arguments);
		}
	};

	/* =========================================================== */
	/* Lifecycle methods                                           */
	/* =========================================================== */
	/**
	 * @description Required adaptations before rendering.
	 * @private
	 */
	UploadCollection.prototype.onBeforeRendering = function() {
		this._RenderManager = this._RenderManager || sap.ui.getCore().createRenderManager();
		var i, cAitems;
		if (this._oListEventDelegate) {
			this._oList.removeEventDelegate(this._oListEventDelegate);
			this._oListEventDelegate = null;
		}
		this._deregisterSizeHandler();
		this._unbindDragEnterLeave();
		checkInstantUpload.bind(this)();
		if (!this.getInstantUpload()) {
			this.aItems = this.getItems();
			this._getListHeader(this.aItems.length);
			this._clearList();
			this._fillList(this.aItems);
			this._oList.setHeaderToolbar(this._oHeaderToolbar);
			return;
		}
		if (this.aItems.length > 0) {
			cAitems = this.aItems.length;
			// collect items with the status "uploading"
			var aUploadingItems = [];
			for (i = 0; i < cAitems; i++) {
				if (this.aItems[i] && this.aItems[i]._status === UploadCollection._uploadingStatus) {
					aUploadingItems.push(this.aItems[i]);
				} else if (this.aItems[i] && this.aItems[i]._status !== UploadCollection._uploadingStatus && this.aItems[i]._percentUploaded === 100 && this.getItems().length === 0) {
					// Skip this rendering because of model refresh only
					aUploadingItems.push(this.aItems[i]);
				}
			}
			if (aUploadingItems.length !== 0) {
				this.aItems = [];
				this.aItems = this.getItems();
				this.aItems = aUploadingItems.concat(this.aItems);
			} else {
				this.aItems = this.getItems();
			}
		} else {
			// this.aItems is empty
			this.aItems = this.getItems();
		}
		//prepare the list with list items
		this._getListHeader(this.aItems.length);
		this._clearList();
		this._fillList(this.aItems);
		this._oList.setAggregation("headerToolbar", this._oHeaderToolbar, true); // note: suppress re-rendering
		// FileUploader does not support parallel uploads in IE9
		if ((Device.browser.msie && Device.browser.version <= 9) && this.aItems.length > 0 && this.aItems[0]._status === UploadCollection._uploadingStatus) {
			this._oFileUploader.setEnabled(false);
		} else {
			// enable/disable FileUploader according to error state
			if (this.sErrorState !== "Error") {
				if (this.getUploadEnabled() !== this._oFileUploader.getEnabled()) {
					this._oFileUploader.setEnabled(this.getUploadEnabled());
				}
			} else {
				this._oFileUploader.setEnabled(false);
			}
		}
		if (this.sDeletedItemId){
			jQuery(document.activeElement).blur();
		}

		// This function checks if instantUpload needs to be set. In case of the properties like fileType are set by the
		// model instead of the constructor, the setting happens later and is still valid. To support this as well, you
		// need to wait for modification until the first rendering.
		function checkInstantUpload () {
			if (this.bInstantUpload === false) {
				this.setProperty("instantUpload", this.bInstantUpload, true);
				delete this.bInstantUpload;
			}
		}
	};

	/**
	 * @description Required adaptations after rendering.
	 * @private
	 */
	UploadCollection.prototype.onAfterRendering = function() {
		this._bindDragEnterLeave();
		var that = this;
		if (this.getInstantUpload()) {
			if (this.aItems || (this.aItems === this.getItems())) {
				if (this.editModeItem) {
					var $oEditBox = jQuery.sap.byId(this.editModeItem + "-ta_editFileName-inner");
					if ($oEditBox) {
						var sId = this.editModeItem;
						if (!Device.os.ios) {
							$oEditBox.focus(function() {
								$oEditBox.selectText(0, $oEditBox.val().length);
							});
						}
						$oEditBox.focus();
						this._oListEventDelegate = {
							onclick: function(oEvent) {
								sap.m.UploadCollection.prototype._handleClick(oEvent, that, sId);
							}
						};
						this._oList.addDelegate(this._oListEventDelegate);
					}
				} else if (this.sFocusId) {
					//set focus on line item after status = Edit
					sap.m.UploadCollection.prototype._setFocus2LineItem(this.sFocusId);
					this.sFocusId = null;
				} else if (this.sDeletedItemId) {
					//set focus on line item after an item was deleted
					sap.m.UploadCollection.prototype._setFocusAfterDeletion(this.sDeletedItemId, that);
				}
			}
		} else {
			if (this.sFocusId) {
				//set focus after removal of file from upload list
				sap.m.UploadCollection.prototype._setFocus2LineItem(this.sFocusId);
				this.sFocusId = null;
			}
		}
	};

	/**
	 * @description Cleans up before destruction.
	 * @private
	 */
	UploadCollection.prototype.exit = function() {
		var i, iPendingUploadsNumber, oItemToDestroy;
		/* _unbindDragEnterLeave has to be called before setting $RootNode to null, because if $RootNode is null, the
			unbind will only partially be performed as it depends on $RootNode */
		this._unbindDragEnterLeave();
		if (this._$RootNode) {
			this._$RootNode = null;
		}
		if (this._oFileUploader) {
			this._oFileUploader.destroy();
			this._oFileUploader = null;
		}
		if (this._oHeaderToolbar) {
			this._oHeaderToolbar.destroy();
			this._oHeaderToolbar = null;
		}
		if (this._oNumberOfAttachmentsTitle) {
			this._oNumberOfAttachmentsTitle.destroy();
			this._oNumberOfAttachmentsTitle = null;
		}
		if (this._RenderManager) {
			this._RenderManager.destroy();
		}
		if (this._aFileUploadersForPendingUpload) {
			iPendingUploadsNumber = this._aFileUploadersForPendingUpload.length;
			for (i = 0; i < iPendingUploadsNumber; i++) {
				this._aFileUploadersForPendingUpload[i].destroy();
				this._aFileUploadersForPendingUpload[i] = null;
			}
			this._aFileUploadersForPendingUpload = null;
		}
		// destroy items with status "uploading" because they are not destroyed with "items" aggregation
		for (i = 0; i < this.aItems.length; i++) {
			if (this.aItems[i]._status === UploadCollection._uploadingStatus) {
				oItemToDestroy = this.aItems.splice(i, 1)[0];
				if (oItemToDestroy.destroy) {
					oItemToDestroy.destroy();
				}
			}
		}
		this._deregisterSizeHandler();
	};

	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */

	/**
	 * Binds the handlers for drag and drop events.
	 *
	 * @private
	 */
	UploadCollection.prototype._bindDragEnterLeave = function() {
		this._bDragDropEnabled = this._isDragAndDropAllowed();
		if (!this._bDragDropEnabled) {
			return;
		}

		// handlers need to be saved intermediately in order to unbind successfully
		if (!this._oDragDropHandler) {
			this._oDragDropHandler = {
				dragEnterUIArea: this._onDragEnterUIArea.bind(this),
				dragLeaveUIArea: this._onDragLeaveUIArea.bind(this),
				dragOverUIArea: this._onDragOverUIArea.bind(this),
				dropOnUIArea: this._onDropOnUIArea.bind(this),
				dragEnterUploadCollection: this._onDragEnterUploadCollection.bind(this),
				dragLeaveUploadCollection: this._onDragLeaveUploadCollection.bind(this),
				dragOverUploadCollection: this._onDragOverUploadCollection.bind(this),
				dropOnUploadCollection: this._onDropOnUploadCollection.bind(this)
			};
		}

		// bind events on body element
		this._$RootNode = jQuery(document.body);
		this._$RootNode.bind("dragenter", this._oDragDropHandler.dragEnterUIArea);
		this._$RootNode.bind("dragleave", this._oDragDropHandler.dragLeaveUIArea);
		this._$RootNode.bind("dragover", this._oDragDropHandler.dragOverUIArea);
		this._$RootNode.bind("drop", this._oDragDropHandler.dropOnUIArea);

		// bind events on UploadCollection
		this._$DragDropArea = this.$("drag-drop-area");
		this.$().bind("dragenter", this._oDragDropHandler.dragEnterUploadCollection);
		this.$().bind("dragleave", this._oDragDropHandler.dragLeaveUploadCollection);
		this.$().bind("dragover", this._oDragDropHandler.dragOverUploadCollection);
		this.$().bind("drop", this._oDragDropHandler.dropOnUploadCollection);
	};

	/**
	 * Unbinds the handlers for drag and drop events.
	 *
	 * @private
	 */
	UploadCollection.prototype._unbindDragEnterLeave = function() {
		if (!this._bDragDropEnabled && !this._oDragDropHandler) {
			return;
		}
		if (this._$RootNode) {
			this._$RootNode.unbind("dragenter", this._oDragDropHandler.dragEnterUIArea);
			this._$RootNode.unbind("dragleave", this._oDragDropHandler.dragLeaveUIArea);
			this._$RootNode.unbind("dragover", this._oDragDropHandler.dragOverUIArea);
			this._$RootNode.unbind("drop", this._oDragDropHandler.dropOnUIArea);
		}
		this.$().unbind("dragenter", this._oDragDropHandler.dragEnterUploadCollection);
		this.$().unbind("dragleave", this._oDragDropHandler.dragLeaveUploadCollection);
		this.$().unbind("dragover", this._oDragDropHandler.dragOverUploadCollection);
		this.$().unbind("drop", this._oDragDropHandler.dropOnUploadCollection);
	};

	/**
	 * Handler when file is dragged in UIArea.
	 * @param {jQuery.Event} event which was fired
	 * @private
	 */
	UploadCollection.prototype._onDragEnterUIArea = function(event) {
		if (!this._checkForFiles(event)) {
			return;
		}
		this._oLastEnterUIArea = event.target;
		this._$DragDropArea.removeClass("sapMUCDragDropOverlayHide");
		this._adjustDragDropIcon();
	};

	/**
	 * Handler when file is dragged over UIArea.
	 * @param {jQuery.Event} event which was fired
	 * @private
	 */
	UploadCollection.prototype._onDragOverUIArea = function(event) {
		event.preventDefault();
		if (!this._checkForFiles(event)) {
			return;
		}
		this._$DragDropArea.removeClass("sapMUCDragDropOverlayHide");
	};

	/**
	 * Handler when file is dragged away from UIArea.
	 * @param {jQuery.Event} event which was fired
	 * @private
	 */
	UploadCollection.prototype._onDragLeaveUIArea = function(event) {
		if (this._oLastEnterUIArea === event.target) {
			this._$DragDropArea.addClass("sapMUCDragDropOverlayHide");
		}
	};

	/**
	 * Handler when file is dropped on UIArea.
	 * @param {jQuery.Event} event which was fired
	 * @private
	 */
	UploadCollection.prototype._onDropOnUIArea = function(event) {
		this._$DragDropArea.addClass("sapMUCDragDropOverlayHide");
	};

	/**
	 * Handler when file is dragged in UploadCollection drop enabled area.
	 * @param {jQuery.Event} event which was fired
	 * @private
	 */
	UploadCollection.prototype._onDragEnterUploadCollection = function(event) {
		if (!this._checkForFiles(event)) {
			return;
		}
		if (event.target === this._$DragDropArea[0]) {
			this._$DragDropArea.addClass("sapMUCDropIndicator");
			this._adjustDragDropIcon();
			this.getAggregation("_dragDropText").setText(this._oRb.getText("UPLOADCOLLECTION_DROP_FILE_INDICATOR"));
		}
	};

	/**
	 * Handler when file is dragged over UploadCollection drop enabled area.
	 * @param {jQuery.Event} event which was fired
	 * @private
	 */
	UploadCollection.prototype._onDragOverUploadCollection = function(event) {
		event.preventDefault();
	};

	/**
	 * Handler when file is dragged away from UploadCollection drop enabled area.
	 * @param {jQuery.Event} event which was fired
	 * @private
	 */
	UploadCollection.prototype._onDragLeaveUploadCollection = function(event) {
		if (event.target === this._$DragDropArea[0]) {
			this._$DragDropArea.removeClass("sapMUCDropIndicator");
			this.getAggregation("_dragDropText").setText(this._oRb.getText("UPLOADCOLLECTION_DRAG_FILE_INDICATOR"));
		}
	};

	/**
	 * Checks if at least one element in the data that are to be transferred while dragging is a File.
	 * @param event
	 * @returns {boolean}
	 * @private
	 */
	UploadCollection.prototype._checkForFiles = function(event) {
		var aTypes = event.originalEvent.dataTransfer.types;
		if (aTypes) {
			for (var i = 0; i < aTypes.length; i++) {
				if (aTypes[i] === "Files") {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * Checks if Drag and Drop is allowed.
	 * @returns {boolean} True if Drag and Drop is supported based on the running use cases.
	 * @private
	 */
	UploadCollection.prototype._isDragAndDropAllowed = function() {
		return this.getUploadEnabled() && !this.getUploadButtonInvisible();
	};

	/**
	 * Handler when file is dropped on UploadCollection drop enabled area.
	 * @param {jQuery.Event} event which was fired
	 * @private
	 */
	UploadCollection.prototype._onDropOnUploadCollection = function(event) {
		if (!this._checkForFiles(event)) {
			// In Firefox the drop event leads to the opening of an invalid URL. Therefore we need to prevent this behaviour
			event.preventDefault();
			return;
		}
		if (event.target === this._$DragDropArea[0]) {
			event.preventDefault();
			this._$DragDropArea.removeClass("sapMUCDropIndicator");
			this._$DragDropArea.addClass("sapMUCDragDropOverlayHide");
			this.getAggregation("_dragDropText").setText(this._oRb.getText("UPLOADCOLLECTION_DRAG_FILE_INDICATOR"));
			var aFiles = event.originalEvent.dataTransfer.files;
			// multiple files are not allowed to drop when multiple is false
			if (aFiles.length > 1 && !this.getMultiple()) {
				var sMessage = this._oRb.getText("UPLOADCOLLECTION_MULTIPLE_FALSE");
				MessageBox.error(sMessage);
				return;
			}
			// files are not allowed to drop if they do not comply the FileUploader's restrictions
			if (!this._oFileUploader._areFilesAllowed(aFiles)) {
				return;
			}
			if (!this.getInstantUpload()) {
				for (var i = 0; i < aFiles.length; i++) {
					this._oFileUploader.fireChange({
						files: [aFiles[i]],
						fromDragDrop: true
					});
					this._aFilesFromDragAndDropForPendingUpload.push(aFiles[i]);
				}
			} else {
				// fire the _onchange event so that the UC item could be created
				this._oFileUploader.fireChange({
					files: aFiles
				});
				this._oFileUploader._sendFilesFromDragAndDrop(aFiles);
			}
		}
	};

	/**
	 * Hides the icon when the height of the drag enabled area is smaller than 10rem
	 *
	 * @private
	 */
	UploadCollection.prototype._adjustDragDropIcon = function() {
		// Icon is displayed when the drag enabled area more than 10rem(160px)
		if (this._$DragDropArea[0].offsetHeight < 160) {
			this.getAggregation("_dragDropIcon").$().hide();
		}
	};

	/**
	 * unregister the onResize and orientation handlers.
	 *
	 * @private
	 */
	UploadCollection.prototype._deregisterSizeHandler = function() {
		Device.orientation.detachHandler(this._onResize, this);
		ResizeHandler.deregister(this._sReziseHandlerId);
	};

	/**
	 * @description Hides FileUploader instance after OverflowToolbar is rendered.
	 * @private
	 */
	UploadCollection.prototype._hideFileUploaders = function () {
		var iToolbarElements, i;
		if (!this.getInstantUpload()) {
			iToolbarElements = this._oHeaderToolbar.getContent().length;
			if (this._aFileUploadersForPendingUpload.length) {
				for (i = 0; i < iToolbarElements; i++) {
					// Only the newest instance of FileUploader is useful, which will be in the place holder position.
					// Other ones can be hidden.
					if (this._oHeaderToolbar.getContent()[i] instanceof sap.ui.unified.FileUploader) {
						if (i === this._iFileUploaderPH && this._bFocusFileUploader) {
							this._oHeaderToolbar.getContent()[i].$().find("button").focus();
						} else {
							this._oHeaderToolbar.getContent()[i].$().hide();
						}
					}
				}
			}
			return;
		}
	};

	/**
	 * @description truncate the file name maximum width based on markers' width.
	 * @private
	 */
	UploadCollection.prototype._truncateFileName = function(oItem) {
		if (!oItem) {
			return;
		}

		if (oItem._status === "Edit") {
			var sItemId = oItem.getId() + "-cli";
			this.$().find("#" + sItemId).find(".sapMUCObjectMarkerContainer").attr("style", "display: none");// the markers are not displayed in edit mode
			return;
		}
		var iMarkersWidth = 0;
		var aMarkers = oItem.getMarkers();
		var sStyle;
		for (var i = 0; i < aMarkers.length; i++) {
			iMarkersWidth = iMarkersWidth + aMarkers[i].$().width() + UploadCollection._markerMargin;
		}
		if (iMarkersWidth > 0) {
			var $FileName = this.$().find("#" + oItem.getId() + "-ta_filenameHL");
			if ($FileName) {
				sStyle = "max-width: calc(100% - " + iMarkersWidth + "px)";
				if ($FileName.attr("style") !== sStyle) {
					$FileName.attr("style", sStyle);
				}
			}
		}
	};

	/**
	 * @description Creates or gets a Toolbar
	 * @param {int} iItemNumber Number of items in the list
	 * @private
	 */
	UploadCollection.prototype._getListHeader = function(iItemNumber) {
		var oFileUploader, i;
		this._setNumberOfAttachmentsTitle(iItemNumber);
		if (!this._oHeaderToolbar) {
			if (!!this._oFileUploader && !this.getInstantUpload()) {
				this._oFileUploader.destroy();
			}
			oFileUploader = this._getFileUploader();
			this._oHeaderToolbar = this.getAggregation("toolbar");
			if (!this._oHeaderToolbar){
				this._oHeaderToolbar = new sap.m.OverflowToolbar(this.getId() + "-toolbar", {
					content : [this._oNumberOfAttachmentsTitle, new sap.m.ToolbarSpacer(), oFileUploader]
				}).addEventDelegate({
					onAfterRendering : this._hideFileUploaders
				}, this);
				this._iFileUploaderPH = 2;
			} else {
				this._oHeaderToolbar.addEventDelegate({
					onAfterRendering : this._hideFileUploaders
				}, this);
				this._iFileUploaderPH = this._getFileUploaderPlaceHolderPosition(this._oHeaderToolbar);
				if (this._oHeaderToolbar && this._iFileUploaderPH > -1) {
					this._setFileUploaderInToolbar(oFileUploader);
				} else {
					jQuery.sap.log.info("A place holder of type 'sap.m.UploadCollectionPlaceholder' needs to be provided.");
				}
			}
		} else if (!this.getInstantUpload()) {
			//create a new FU Instance only if the current FU instance has been used for selection of a file for the future upload.
			//If the method is called after an item has been deleted from the list there is no need to create a new FU instance.
			var iPendingUploadsNumber = this._aFileUploadersForPendingUpload.length;
			for (i = iPendingUploadsNumber - 1; i >= 0; i--) {
				if (this._aFileUploadersForPendingUpload[i].getId() == this._oFileUploader.getId()) {
					oFileUploader = this._getFileUploader();
					this._oHeaderToolbar.insertAggregation("content", oFileUploader, this._iFileUploaderPH, true);
					break;
				}
			}
		}
	};

	/**
	 * @description Gives the position of the place holder for the FileUploader that every toolbar provided
	 * by the application must have
	 * @param {sap.m.OverflowToolbar} oToolbar Toolbar where to find the place holder
	 * @return {int} The position of the place holder or -1 if there's no place holder.
	 * @private
	 */
	UploadCollection.prototype._getFileUploaderPlaceHolderPosition = function(oToolbar){
		for (var i = 0; i < oToolbar.getContent().length; i++) {
			if (oToolbar.getContent()[i] instanceof sap.m.UploadCollectionToolbarPlaceholder){
				return i;
			}
		}
		return -1;
	};

	/**
	 * @description Sets the given FileUploader object in to the current Toolbar on the position where the place holder is
	 * @param {sap.ui.unified.FileUploader} oFileUploader The FileUploader object to set in the Toolbar
	 * @private
	 */
	UploadCollection.prototype._setFileUploaderInToolbar = function(oFileUploader){
		this._oHeaderToolbar.getContent()[this._iFileUploaderPH].setVisible(false);
		this._oHeaderToolbar.insertContent(oFileUploader, this._iFileUploaderPH);
	};

	/**
	 * @description Map an item to the list item.
	 * @param {sap.m.UploadCollectionItem} oItem Base information to generate the list items
	 * @returns {sap.m.CustomListItem | null} oListItem List item which will be displayed
	 * @private
	 */
	UploadCollection.prototype._mapItemToListItem = function(oItem) {
		// If there is no item or an item is being updated, return null.
		if (!oItem || (this._oItemToUpdate && oItem.getId() === this._oItemToUpdate.getId())) {
			return null;
		}
		var sItemId, sStatus, sFileNameLong, oBusyIndicator, oListItem, sContainerId, $container, oContainer, oItemIcon, that = this;

		sItemId = oItem.getId();
		sStatus = oItem._status;
		sFileNameLong = oItem.getFileName();

		if (sStatus === UploadCollection._uploadingStatus) {
			oBusyIndicator = oItem._getBusyIndicator ? oItem._getBusyIndicator() : oItem._getControl("sap.m.BusyIndicator", {
				id: sItemId + "-ia_indicator"
			}, "BusyIndicator").addStyleClass("sapMUCloadingIcon");
		} else {
			oItemIcon = this._createIcon(oItem, sItemId, sFileNameLong, that);
		}

		sContainerId = sItemId + "-container";
		// UploadCollection has to destroy the container as sap.ui.core.HTML is preserved by default which leads to problems at rerendering
		$container = jQuery.sap.byId(sContainerId);
		if (!!$container) {
			$container.remove();
			$container = null;
		}

		oContainer = new sap.ui.core.HTML({content : // a container for a text container and a button container
				"<span id=" + sContainerId + " class= sapMUCTextButtonContainer> </span>",
				afterRendering : function() {
					that._renderContent(oItem, sContainerId, that);
				}
		});
		oListItem = new sap.m.CustomListItem(sItemId + "-cli", {
			content : [oBusyIndicator, oItemIcon, oContainer],
			selected : oItem.getSelected()
		});

		oListItem._oUploadCollectionItem = oItem;
		oListItem._status = sStatus;
		oListItem.addStyleClass("sapMUCItem");
		return oListItem;
	};


	/**
	 * @description Renders fileName, attributes, statuses and buttons(except for IE9) into the oContainer. Later it should be moved to the UploadCollectionItemRenderer.
	 * @param {sap.ui.core.Item} oItem Base information to generate the list items
	 * @param {string} sContainerId ID of the container where the content will be rendered to
	 * @param {object} that Context
	 * @private
	 */
	UploadCollection.prototype._renderContent = function(oItem, sContainerId, that) {
		var sItemId, i, iAttrCounter, iStatusesCounter, iMarkersCounter, sPercentUploaded, aAttributes, aStatuses, oRm, sStatus, aMarkers;

		sPercentUploaded = oItem._percentUploaded;
		aAttributes = oItem.getAllAttributes();
		aStatuses = oItem.getStatuses();
		aMarkers = oItem.getMarkers();
		sItemId = oItem.getId();
		iAttrCounter = aAttributes.length;
		iStatusesCounter = aStatuses.length;
		iMarkersCounter = aMarkers.length;
		sStatus = oItem._status;

		oRm = that._RenderManager;
		oRm.write('<div class="sapMUCTextContainer '); // text container for fileName, attributes and statuses
		if (sStatus === "Edit") {
			oRm.write('sapMUCEditMode ');
		}
		oRm.write('" >');
		oRm.renderControl(this._getFileNameControl(oItem, that));
		// if status is uploading only the progress label is displayed under the Filename
		if (sStatus === UploadCollection._uploadingStatus && !(Device.browser.msie && Device.browser.version <= 9)) {
			oRm.renderControl(this._createProgressLabel(oItem, sPercentUploaded));
		} else {
			if (iMarkersCounter > 0) {
				oRm.write('<div class="sapMUCObjectMarkerContainer">');// begin of markers container
				for (i = 0; i < iMarkersCounter; i++ ) {
					oRm.renderControl(aMarkers[i].addStyleClass("sapMUCObjectMarker"));
				}
				oRm.write('</div>');// end of markers container
			}
			if (iAttrCounter > 0) {
				oRm.write('<div class="sapMUCAttrContainer">'); // begin of attributes container
				for (i = 0; i < iAttrCounter; i++ ) {
					aAttributes[i].addStyleClass("sapMUCAttr");
					oRm.renderControl(aAttributes[i]);
					if ((i + 1) < iAttrCounter) {
						oRm.write('<div class="sapMUCSeparator">&nbsp&#x00B7&#160</div>'); // separator between attributes
					}
				}
				oRm.write('</div>'); // end of attributes container
			}
			if (iStatusesCounter > 0) {
				oRm.write('<div class="sapMUCStatusContainer">'); // begin of statuses container
				for (i = 0; i < iStatusesCounter; i++ ) {
					aStatuses[i].detachBrowserEvent("hover");
					oRm.renderControl(aStatuses[i]);
					if ((i + 1) < iStatusesCounter){
						oRm.write('<div class="sapMUCSeparator">&nbsp&#x00B7&#160</div>'); // separator between statuses
					}
				}
				oRm.write('</div>'); // end of statuses container
			}
		}
		oRm.write('</div>'); // end of container for Filename, attributes and statuses
		this._renderButtons(oRm, oItem, sStatus, sItemId, that);
		oRm.flush(jQuery.sap.byId(sContainerId)[0], true); // after removal to UploadCollectionItemRenderer delete this line
		this._truncateFileName(oItem);
		this._sReziseHandlerId = ResizeHandler.register(this, this._onResize.bind(this));
		Device.orientation.attachHandler(this._onResize, this);
	};

	/**
	 * @description Renders buttons of the item in scope.
	 * @param {object} oRm Render manager
	 * @param {sap.ui.core.Item} oItem Item in scope
	 * @param {string} sStatus Internal status of the item in scope
	 * @param {string} sItemId ID of the container where the content will be rendered to
	 * @param {object} that Context
	 * @private
	 */
	UploadCollection.prototype._renderButtons = function(oRm, oItem, sStatus, sItemId, that) {
		var aButtons, iButtonCounter;

		aButtons = this._getButtons(oItem, sStatus, sItemId, that);
		if (!!aButtons) { // is necessary for IE9
			iButtonCounter = aButtons.length;
		}
		// render div container only if there is at least one button
		if (iButtonCounter > 0) {
			oRm.write('<div class="sapMUCButtonContainer">'); //begin of div for buttons
			for (var i = 0; i < iButtonCounter; i++ ) {
				if ((i + 1) < iButtonCounter) { // if both buttons are displayed
					aButtons[i].addStyleClass("sapMUCFirstButton");
				}
				oRm.renderControl(aButtons[i]);
			}
			oRm.write('</div>'); // end of div for buttons
		}
	};

	/**
	 * @description Gets a file name which is an sap.m.Link in display mode and an sap.m.Input with a description (file extension) in edit mode
	 * @param {sap.ui.core.Item} oItem Base information to generate the list items
	 * @param {object} that Context
	 * @return {sap.m.Link | sap.m.Input} oFileName is a file name of sap.m.Link type in display mode and sap.m.Input type in edit mode
	 * @private
	 */
	UploadCollection.prototype._getFileNameControl = function(oItem, that) {
		var bEnabled, oFileName, oFile, sFileName, sFileNameLong, sItemId, sStatus, iMaxLength, sValueState, bShowValueStateMessage, oFileNameEditBox, sValueStateText;

		sFileNameLong = oItem.getFileName();
		sItemId = oItem.getId();
		sStatus = oItem._status;

		if (sStatus !== "Edit") {
			bEnabled = true;
			if (this.sErrorState === "Error" || !jQuery.trim(oItem.getUrl())) {
				bEnabled = false;
			}

			oFileName = oItem._getFileNameLink ? oItem._getFileNameLink() : oItem._getControl("sap.m.Link", {
				id: sItemId + "-ta_filenameHL",
				press: [that, this._triggerLink, this]
			}, "FileNameLink");
			oFileName.setEnabled(bEnabled);
			oFileName.addStyleClass("sapMUCFileName");
			oFileName.setModel(oItem.getModel());
			oFileName.setText(sFileNameLong);
			return oFileName;
		} else {
			oFile = that._splitFilename(sFileNameLong);
			iMaxLength = that.getMaximumFilenameLength();
			sValueState = "None";
			bShowValueStateMessage = false;
			sFileName = oFile.name;

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

			oFileNameEditBox = oItem._getFileNameEditBox ? oItem._getFileNameEditBox() : oItem._getControl("sap.m.Input", {
				id: sItemId + "-ta_editFileName",
				type: sap.m.InputType.Text
			}, "FileNameEditBox");
			oFileNameEditBox.addStyleClass("sapMUCEditBox");
			oFileNameEditBox.setModel(oItem.getModel());
			oFileNameEditBox.setValue(sFileName);
			oFileNameEditBox.setValueState(sValueState);
			oFileNameEditBox.setFieldWidth("75%");
			oFileNameEditBox.setValueStateText(sValueStateText);
			oFileNameEditBox.setDescription(oFile.extension);
			oFileNameEditBox.setShowValueStateMessage(bShowValueStateMessage);

			if ((iMaxLength - oFile.extension.length) > 0) {
				oFileNameEditBox.setProperty("maxLength", iMaxLength - oFile.extension.length, true);
			}
			return oFileNameEditBox;
		}
	};

	/**
	 * @description Creates a label for upload progress
	 * @param {string} sItemId ID of the item being processed
	 * @param {string} sPercentUploaded per cent having been uploaded
	 * @return {sap.m.Label} oProgressLabel
	 * @private
	 */
	UploadCollection.prototype._createProgressLabel = function(oItem, sPercentUploaded) {
		var oProgressLabel,
			sItemId = oItem.getId();

		oProgressLabel = oItem._getProgressLabel ? oItem._getProgressLabel() : oItem._getControl("sap.m.Label", {
			id: sItemId + "-ta_progress"
		}, "ProgressLabel").addStyleClass("sapMUCProgress");
		oProgressLabel.setText(this._oRb.getText("UPLOADCOLLECTION_UPLOADING", [sPercentUploaded]));

		return oProgressLabel;
	};

	/**
	 * @description Creates an icon or image
	 * @param {sap.ui.core.Item} oItem Base information to generate the list items
	 * @param {string} sItemId ID of the item being processed
	 * @param {string} sFileNameLong file name
	 * @param {object} that Context
	 * @return {sap.m.Image | sap.ui.core.Icon} oItemIcon
	 * @private
	 */
	UploadCollection.prototype._createIcon = function(oItem, sItemId, sFileNameLong, that) {
		var sThumbnailUrl, sThumbnail, oItemIcon;

		sThumbnailUrl = oItem.getThumbnailUrl();
		if (sThumbnailUrl) {
			oItemIcon = new sap.m.Image(sItemId + "-ia_imageHL", {
				src : sap.m.UploadCollection.prototype._getThumbnail(sThumbnailUrl, sFileNameLong),
				decorative : false,
				alt: this._getAriaLabelForPicture(oItem)
			}).addStyleClass("sapMUCItemImage");
		} else {
			sThumbnail = sap.m.UploadCollection.prototype._getThumbnail(undefined, sFileNameLong);
			var sStyleClass;
			oItemIcon = new sap.ui.core.Icon(sItemId + "-ia_iconHL", {
				src : sThumbnail,
				decorative : false,
				useIconTooltip : false,
				alt: this._getAriaLabelForPicture(oItem)
			});
			//Sets the right style class depending on the icon/placeholder status (clickable or not)
			if (this.sErrorState !== "Error" && jQuery.trim(oItem.getProperty("url"))) {
				sStyleClass = "sapMUCItemIcon";
			} else {
				sStyleClass = "sapMUCItemIconInactive";
			}
			if (sThumbnail === UploadCollection._placeholderCamera) {
				if (this.sErrorState !== "Error" && jQuery.trim(oItem.getProperty("url"))) {
					sStyleClass = sStyleClass + " sapMUCItemPlaceholder";
				} else {
					sStyleClass = sStyleClass + " sapMUCItemPlaceholderInactive";
				}
			}
			oItemIcon.addStyleClass(sStyleClass);
		}
		if (this.sErrorState !== "Error" && jQuery.trim(oItem.getProperty("url"))) {
			oItemIcon.attachPress(function(oEvent) {
				sap.m.UploadCollection.prototype._triggerLink(oEvent, that);
			});
		}
		return oItemIcon;
	};

	/**
	 * @description Gets Edit and Delete Buttons
	 * @param {sap.ui.core.Item} oItem Base information to generate the list items
	 * @param {string} sStatus status of the item: edit, display, uploading
	 * @param {string} sItemId ID of the item being processed
	 * @param {object} that Context
	 * @return {array} aButtons an Array with buttons
	 * @private
	 */
	UploadCollection.prototype._getButtons = function(oItem, sStatus, sItemId, that) {
		var aButtons, oOkButton, oCancelButton, sButton, oDeleteButton, bEnabled, oEditButton;

		aButtons = [];
		if (!this.getInstantUpload()) { // in case of pending upload we always have only "delete" button (no "edit" button)
			sButton = "deleteButton";
			oDeleteButton = this._createDeleteButton(sItemId, sButton, oItem, this.sErrorState, that);
			aButtons.push(oDeleteButton);
			return aButtons;
		}
		if (sStatus === "Edit") {

			oOkButton = oItem._getOkButton ? oItem._getOkButton() : oItem._getControl("sap.m.Button", {
				id : sItemId + "-okButton",
				text : this._oRb.getText("UPLOADCOLLECTION_RENAMEBUTTON_TEXT"),
				type : Library.ButtonType.Transparent
			}, "OkButton").addStyleClass("sapMUCOkBtn");

			oCancelButton = oItem._getCancelButton ? oItem._getCancelButton() : oItem._getControl("sap.m.Button", {
				id : sItemId + "-cancelButton",
				text : this._oRb.getText("UPLOADCOLLECTION_CANCELBUTTON_TEXT"),
				type : Library.ButtonType.Transparent
			}, "CancelButton").addStyleClass("sapMUCCancelBtn");

			aButtons.push(oOkButton);
			aButtons.push(oCancelButton);
			return aButtons;
		} else if (sStatus === UploadCollection._uploadingStatus && !(Device.browser.msie && Device.browser.version <= 9)) {
			sButton = "terminateButton";
			oDeleteButton = this._createDeleteButton(sItemId, sButton, oItem, this.sErrorState, that);
			aButtons.push(oDeleteButton);
			return aButtons;
		} else {
			bEnabled = oItem.getEnableEdit();
			if (this.sErrorState === "Error"){
				bEnabled = false;
			}

			if (oItem.getVisibleEdit()) { // if the Edit button is invisible we do not need to render it
				oEditButton = oItem._getEditButton ? oItem._getEditButton() : oItem._getControl("sap.m.Button", {
					id : sItemId + "-editButton",
					icon : "sap-icon://edit",
					type : Library.ButtonType.Standard,
					tooltip : this._oRb.getText("UPLOADCOLLECTION_EDITBUTTON_TEXT"),
					press : [oItem, this._handleEdit, this]
				}, "EditButton").addStyleClass("sapMUCEditBtn");
				oEditButton.setEnabled(bEnabled);
				oEditButton.setVisible(oItem.getVisibleEdit());
				aButtons.push(oEditButton);
			}

			sButton = "deleteButton";
			if (oItem.getVisibleDelete()) { // if the Delete button is invisible we do not need to render it
				oDeleteButton = this._createDeleteButton(sItemId, sButton, oItem, this.sErrorState, that);
				aButtons.push(oDeleteButton);
			}

			return aButtons;
		}
	};

	/**
	 * @description Creates a Delete button
	 * @param {string} [sItemId] Id of the oItem
	 * @param {string} [sButton]
	 *  if sButton == "deleteButton" it is a Delete button for the already uploaded file
	 *  if sButton == "terminateButton" it is a button to terminate the upload of the file being uploaded
	 * @param {sap.m.UploadCollectionItem} oItem Item in scope
	 * @param {string} sErrorState Internal error status
	 * @param {object} that Context
	 * @return {sap.m.Button} oDeleteButton
	 * @private
	 */
	UploadCollection.prototype._createDeleteButton = function(sItemId, sButton, oItem, sErrorState, that) {
		var bEnabled, oDeleteButton, sGetterName, sTooltip, fnGetter, bVisible, fnPressHandler;

		bEnabled = oItem.getEnableDelete();
		if (sErrorState === "Error"){
			bEnabled = false;
		}

		if (sButton === "deleteButton") {
			sGetterName = "DeleteButton";
			fnGetter = oItem._getDeleteButton;
			sTooltip = this._oRb.getText("UPLOADCOLLECTION_DELETEBUTTON_TEXT");
			bVisible = oItem.getVisibleDelete();
			fnPressHandler = [that, this._handleDelete, this];
		} else {
			sGetterName = "TerminateButton";
			fnGetter = oItem._getTerminateButton;
			sTooltip = this._oRb.getText("UPLOADCOLLECTION_TERMINATEBUTTON_TEXT");
			bVisible = this.getTerminationEnabled();
			fnPressHandler = [oItem, this._handleTerminate, this];
		}

		oDeleteButton = fnGetter ? fnGetter() : oItem._getControl("sap.m.Button", {
			id : sItemId + "-" + sButton,
			icon : "sap-icon://sys-cancel",
			type : Library.ButtonType.Standard,
			press : fnPressHandler
		}, sGetterName).addStyleClass("sapMUCDeleteBtn");
		oDeleteButton.setVisible(bVisible);
		oDeleteButton.setEnabled(bEnabled);
		oDeleteButton.setTooltip(sTooltip);

		return oDeleteButton;
	};

	/**
	 * @description Fill the list with items.
	 * @param {array} aItems An array with items of type of sap.ui.core.Item.
	 * @private
	 */
	UploadCollection.prototype._fillList = function(aItems) {
		var that = this,
			iMaxIndex = aItems.length - 1,
			oItemsBinding = this.getBinding("items"),
			bGroupCreated = false,
			sGroupKey,
			fnGroupHeader = this.getBindingInfo("items") ? this.getBindingInfo("items").groupHeaderFactory : null;
		var fnGroup = function(oItem) {
			return oItem.getBindingContext() ? oItemsBinding.getGroup(oItem.getBindingContext()) : null;
		};
		var fnGroupKey = function(oItem) {
			return fnGroup(oItem) && fnGroup(oItem).key;
		};

		jQuery.each(aItems, function (iIndex, oItem) {
			// grouping
			if (oItemsBinding && oItemsBinding.isGrouped() && oItem) {
				if (!bGroupCreated || sGroupKey !== fnGroupKey(oItem)) {
					if (fnGroupHeader) {
						that._oList.addItemGroup(fnGroup(oItem), fnGroupHeader(fnGroup(oItem)), true);
					} else if (fnGroup(oItem)) {
						that._oList.addItemGroup(fnGroup(oItem), null, true);
					}
					bGroupCreated = true;
					sGroupKey = fnGroupKey(oItem);
				}
			}
			if (!oItem._status) {
				//Set default status value -> UploadCollection._displayStatus
				oItem._status = UploadCollection._displayStatus;
			} else if (that.getInstantUpload() && that._oItemForDelete &&
								 that._oItemForDelete._status === UploadCollection._toBeDeletedStatus &&
								 oItem.getDocumentId() === that._oItemForDelete.documentId) {
				return false;
			}
			if (!oItem._percentUploaded && oItem._status === UploadCollection._uploadingStatus) {
				//Set default percent uploaded
				oItem._percentUploaded = 0;
			}
			// Add a private property to the added item containing a reference
			// to the corresponding mapped item.
			var oListItem = that._mapItemToListItem(oItem);
			if (oListItem) {
				if (iIndex === 0 && iMaxIndex === 0){
					oListItem.addStyleClass("sapMUCListSingleItem");
				} else if (iIndex === 0) {
					oListItem.addStyleClass("sapMUCListFirstItem");
				} else if (iIndex === iMaxIndex) {
					oListItem.addStyleClass("sapMUCListLastItem");
				} else {
					oListItem.addStyleClass("sapMUCListItem");
				}

				// Add the mapped item to the list
				that._oList.addAggregation("items", oListItem, true); // note: suppress re-rendering

				// Handles item selected event.
				oItem.attachEvent("selected", that._handleItemSetSelected, that);
			}
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
	 * @description Access and initialization for title number of attachments. Sets internal value.
	 * @param {array} items Number of attachments
	 * @private
	 */
	UploadCollection.prototype._setNumberOfAttachmentsTitle = function(items) {
		var nItems = items || 0;
		var sText;
		// When a file is being updated to a new version, there is one file more on the server than in the list so this corrects that mismatch.
		if (this._oItemToUpdate) {
			nItems--;
		}
		if (this.getNumberOfAttachmentsText()) {
			sText = this.getNumberOfAttachmentsText();
		} else {
			sText = this._oRb.getText("UPLOADCOLLECTION_ATTACHMENTS", [nItems]);
		}
		if (!this._oNumberOfAttachmentsTitle) {
			this._oNumberOfAttachmentsTitle = new sap.m.Title(this.getId() + "-numberOfAttachmentsTitle", {
				text : sText
			});
		} else {
			this._oNumberOfAttachmentsTitle.setText(sText);
		}
	};

	/**
	 * @description Makes file upload button invisible.
	 * @param {boolean} uploadButtonInvisible Defines whether the upload button is visible or not.
	 * @private
	 */
	UploadCollection.prototype._setFileUploaderVisibility = function(uploadButtonInvisible) {
		var aToolbarElements = this._oHeaderToolbar.getContent();

		if (aToolbarElements) {
			var oPlaceHolder = aToolbarElements[this._iFileUploaderPH];
			if (oPlaceHolder instanceof sap.ui.unified.FileUploader) {
				oPlaceHolder.setVisible(!uploadButtonInvisible);
			}
		}
	};

	/* =========================================================== */
	/* Handle UploadCollection events                              */
	/* =========================================================== */
	/**
	 * @description Handling of the deletion of an uploaded file
	 * @param {object} oEvent Event of the deletion
	 * @param {object} oContext Context of the deleted file
	 * @returns {void}
	 * @private
	 */
	UploadCollection.prototype._handleDelete = function(oEvent, oContext) {
		var oParams = oEvent.getParameters();
		var aItems = oContext.getItems();
		var sItemId = oParams.id.split("-deleteButton")[0];
		var oItemForDelete;
		var iIndex;
		var sCompact = "";
		var sFileName;
		var sMessageText;
		oContext.sDeletedItemId = sItemId;
		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].sId === sItemId) {
				iIndex = i;
				oItemForDelete = {
					documentId : aItems[i].getDocumentId(),
					_iLineNumber : iIndex
				};
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

		if (aItems[iIndex] && aItems[iIndex].getEnableDelete()) {
			// popup delete file
			sFileName =  aItems[iIndex].getFileName();
			if (!sFileName) {
				sMessageText = this._oRb.getText("UPLOADCOLLECTION_DELETE_WITHOUT_FILENAME_TEXT");
			} else {
				sMessageText = this._oRb.getText("UPLOADCOLLECTION_DELETE_TEXT", sFileName);
			}
			oContext._oItemForDelete = oItemForDelete;
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
	 * @param {sap.m.MessageBox.Action} oAction Action to be executed at closing the message box
	 * @private
	 */
	UploadCollection.prototype._onCloseMessageBoxDeleteItem = function (oAction) {
		var aItems = this.getItems();
		var oItemToBeDeleted;
		if (this.getInstantUpload()) {
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getDocumentId() === this._oItemForDelete.documentId) {
					oItemToBeDeleted = aItems[i];
				}
			}
		} else {
			oItemToBeDeleted = aItems[this._oItemForDelete._iLineNumber];
		}
		if (oAction === sap.m.MessageBox.Action.OK) {
			this._oItemForDelete._status = UploadCollection._toBeDeletedStatus;
			if (this.getInstantUpload()) {
				// fire event
				this.fireFileDeleted({
					// deprecated
					documentId : this._oItemForDelete.documentId,
					// new
					item : oItemToBeDeleted
				});
				// do not save the item after the item is deleted in instant mode
				this._oItemForDelete = null;
			} else {
				if (this.aItems.length === 1) {
					this.sFocusId = this._oFileUploader.$().find(":button")[0].id;
				} else {
					if (this._oItemForDelete._iLineNumber < this.aItems.length - 1) {
						this.sFocusId = this.aItems[this._oItemForDelete._iLineNumber + 1].getId() + "-cli";
					} else {
						this.sFocusId = this.aItems[0].getId() + "-cli";
					}
				}
				this._aDeletedItemForPendingUpload.push(oItemToBeDeleted);
				this.aItems.splice(this._oItemForDelete._iLineNumber, 1);
				this.removeAggregation("items", oItemToBeDeleted, false);
			}
		}
	};

	/**
	 * Handling of termination of an uploading process
	 * @param {sap.ui.base.Event} oEvent Event of the upload termination
	 * @param {sap.m.UploadCollectionItem} oItem Context of the upload termination
	 * @private
	 */
	UploadCollection.prototype._handleTerminate = function(oEvent, oItem) {
		var oFileList, oDialog;
		oFileList = new sap.m.List({
			items : [
				new sap.m.StandardListItem({
					title : oItem.getFileName(),
					icon : this._getIconFromFilename(oItem.getFileName())
			})]
		});

		oDialog = new sap.m.Dialog({
			id : this.getId() + "deleteDialog",
			title: this._oRb.getText("UPLOADCOLLECTION_TERMINATE_TITLE"),
			content : [
				new sap.m.Text({
					text : this._oRb.getText("UPLOADCOLLECTION_TERMINATE_TEXT")
				}), oFileList],
			buttons:[ new sap.m.Button({
				text: this._oRb.getText("UPLOADCOLLECTION_OKBUTTON_TEXT"),
				press: [onPressOk, this]
			}), new sap.m.Button({
						text: this._oRb.getText("UPLOADCOLLECTION_CANCELBUTTON_TEXT"),
						press: function() {
							oDialog.close();
						}
			})],
			afterClose: function() {
				oDialog.destroy();
			}
		}).open();

		function onPressOk () {
			var bAbort = false;
			// if the file is already loaded send a delete request to the application
			for (var i = 0; i < this.aItems.length; i++) {
				if (this.aItems[i]._status === UploadCollection._uploadingStatus &&
						this.aItems[i]._requestIdName === oItem._requestIdName) {
					this.aItems[i]._status = UploadCollection._toBeDeletedStatus;
					this._oItemForDelete = this.aItems[i];
					bAbort = true;
					break;
				} else if (oItem.getFileName() === this.aItems[i].getFileName() &&
									 this.aItems[i]._status === UploadCollection._displayStatus) {
					this.aItems[i]._status = UploadCollection._toBeDeletedStatus;
					this._oItemForDelete = this.aItems[i];
					this.fireFileDeleted({
						documentId : this.aItems[i].getDocumentId(),
						item : this.aItems[i]
					});
					break;
				}
			}
			// call FileUploader if abort is possible. Otherwise fireDelete should be called.
			if (bAbort) {
				this._getFileUploader().abort(this._headerParamConst.fileNameRequestIdName, this._encodeToAscii(oItem.getFileName()) + this.aItems[i]._requestIdName);
			}
			oDialog.close();
			this.invalidate();
		}
	};

	/**
	 * @description Handling of event of the edit button
	 * @param {object} oEvent Event of the edit button
	 * @param {object} oItem The Item in context of the edit button
	 * @private
	 */
	UploadCollection.prototype._handleEdit = function(oEvent, oItem) {
		var i,
			sItemId = oItem.getId(),
			cItems = this.aItems.length;
			if (this.editModeItem) {
				sap.m.UploadCollection.prototype._handleOk(oEvent, this, this.editModeItem, false);
			}
		if (this.sErrorState !== "Error") {
			for (i = 0; i < cItems; i++) {
				if (this.aItems[i].getId() === sItemId) {
					this.aItems[i]._status = "Edit";
					break;
				}
			}
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
		// if the target of the click event is an editButton, than this case has already been processed
		// in the _handleEdit (in particular, by executing the _handleOk function).
		// Therefore only the remaining cases of click event targets are handled.
		if (oEvent.target.id.lastIndexOf("editButton") < 0) {
			if (oEvent.target.id.lastIndexOf("cancelButton") > 0) {
				sap.m.UploadCollection.prototype._handleCancel(oEvent, oContext, sSourceId);
			} else if (oEvent.target.id.lastIndexOf("ia_imageHL") < 0 &&
								 oEvent.target.id.lastIndexOf("ia_iconHL") < 0 &&
								 oEvent.target.id.lastIndexOf("deleteButton") < 0 &&
								 oEvent.target.id.lastIndexOf("ta_editFileName-inner") < 0) {
				if (oEvent.target.id.lastIndexOf("cli") > 0) {
					oContext.sFocusId = oEvent.target.id;
				}
				sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, sSourceId, true);
			}
		}
	};

	/**
	 * @description Handling of 'OK' of the list item (status = 'Edit')
	 * @param {object} oEvent Event of the 'OK' activity
	 * @param {object} oContext Context of the list item where 'ok' was triggered
	 * @param {string} sSourceId List item ID
	 * @param {boolean} bTriggerRenderer Switch for to trigger the renderer
	 * @private
	 */
	UploadCollection.prototype._handleOk = function(oEvent, oContext, sSourceId, bTriggerRenderer) {
		var oEditbox = document.getElementById(sSourceId + "-ta_editFileName-inner");
		var sNewFileName;
		var oSourceItem = UploadCollection._findById(sSourceId, oContext.aItems);
		var sOrigFullFileName = oSourceItem.getProperty("fileName");
		var oFile = UploadCollection.prototype._splitFilename(sOrigFullFileName);
		var oInput = sap.ui.getCore().byId(sSourceId + "-ta_editFileName");
		var sErrorStateBefore = oSourceItem.errorState;
		var sChangedNameBefore = oSourceItem.changedFileName;

		// get new/changed file name and remove potential leading spaces
		if (oEditbox !== null) {
			sNewFileName = oEditbox.value.replace(/^\s+/,"");
		}

		oContext.sFocusId = sSourceId + "-cli";

		if (!sNewFileName || sNewFileName.length === 0) {
			if (oEditbox !== null) {
				this._setErrorStateOnItem(oContext, oSourceItem, sNewFileName, sChangedNameBefore, sErrorStateBefore);
			}
			return;
		}

		oSourceItem._status = UploadCollection._displayStatus;

		if (oFile.name === sNewFileName) {
			this._removeErrorStateFromItem(oContext, oSourceItem);
			// nothing changed -> nothing to do!
			if (bTriggerRenderer) {
				oContext.invalidate();
			}
			return;
		}

		// here we have to check possible double items if it's necessary
		if (oContext.getSameFilenameAllowed()) {
			this._removeErrorStateFromItem(oContext, oSourceItem);
			oContext._oItemForRename = oSourceItem;
			oContext._onEditItemOk.bind(oContext)(sNewFileName + oFile.extension);
			return;
		}

		// Check double file name
		if (sap.m.UploadCollection.prototype._checkDoubleFileName(sNewFileName + oFile.extension, oContext.aItems)) {
			oInput.setProperty("valueState", "Error", true);
			this._setErrorStateOnItem(oContext, oSourceItem, sNewFileName, sChangedNameBefore, sErrorStateBefore);
		} else {
			oInput.setProperty("valueState", "None", true);
			oSourceItem.changedFileName = null;
			this._removeErrorStateFromItem(oContext, oSourceItem);
			if (bTriggerRenderer) {
				oContext.invalidate();
			}
			oContext._oItemForRename = oSourceItem;
			oContext._onEditItemOk.bind(oContext)(sNewFileName + oFile.extension);
		}

	};

	/**
	 * @description Sets the error state on the list item. This is usually done after an attempt to save the file with empty name or with a duplicated name if the double names are not allowed.
	 * @param {object} oContext The UploadCollection instance on which an attempt was made to save a new name of an existing List item.
	 * @param {object} oSourceItem The List item on which the event was triggered.
	 * @param {string} sNewFileName The new file name for the List item.
	 * @param {string} sChangedNameBefore The file name for the List item before the attempt to save the new name.
	 * @param {string} sErrorStateBefore The error state of the List item before the attempt to save the new name.
	 * @private
	 */
	UploadCollection.prototype._setErrorStateOnItem = function(oContext, oSourceItem, sNewFileName, sChangedNameBefore, sErrorStateBefore) {
		oSourceItem._status = "Edit";
		oSourceItem.errorState = "Error";
		oContext.sErrorState = "Error";
		oSourceItem.changedFileName = sNewFileName;
		if (sErrorStateBefore !== "Error" || sChangedNameBefore !== sNewFileName){
			oContext.invalidate();
		}
	};

	/**
	 * @description Removes the error state from the list item. Used when the name of the file has been corrected.
	 * @private
	 * @param {object} oContext The UploadCollection instance on which an attempt was made to save a new name of an existing List item.
	 * @param {string} oSourceItem The List item on which the event was triggered.
	 */
	UploadCollection.prototype._removeErrorStateFromItem = function(oContext, oSourceItem) {
		oSourceItem.errorState = null;
		oContext.sErrorState = null;
		oContext.editModeItem = null;
	};

	/**
	 * @description Handling of edit item
	 * @param {string} sNewFileName New file name
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
		var oSourceItem = UploadCollection._findById(sSourceId, oContext.aItems);
		oSourceItem._status = UploadCollection._displayStatus;
		oSourceItem.errorState = null;
		oSourceItem.changedFileName = sap.ui.getCore().byId(sSourceId + "-ta_editFileName").getProperty("value");
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
			var sRequestValue, iCountFiles, i, sFileName, oItem, sStatus, sFileSizeFormated, oAttr;
			if (Device.browser.msie && Device.browser.version <= 9) {
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
			if (Device.browser.msie && Device.browser.version <= 9) {
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

			if (!this.getInstantUpload()) {
				this._bFocusFileUploader = true;
				sStatus = UploadCollection._pendingUploadStatus;
			} else {
				sStatus = UploadCollection._uploadingStatus;
			}
			if (Device.browser.msie && Device.browser.version <= 9) {
				oItem = new sap.m.UploadCollectionItem({
					fileName: sFileName
				});
				oItem._status = sStatus;
				oItem._internalFileIndexWithinFileUploader = 1;
				if (!this.getInstantUpload()) {
					oItem.setAssociation("fileUploader",this._oFileUploader, true);
					this.insertItem(oItem);
					this._aFileUploadersForPendingUpload.push(this._oFileUploader);
				} else {
					oItem._percentUploaded = 0;
				}
				this.aItems.unshift(oItem);
			} else {
				this._requestIdValue = this._requestIdValue + 1;
				sRequestValue = this._requestIdValue.toString();
				var aHeaderParametersAfter = this.getAggregation("headerParameters");
				if (!this.getInstantUpload()) {
					this._aFileUploadersForPendingUpload.push(this._oFileUploader);
				}
				for (i = 0; i < iCountFiles; i++) {
					oItem = new Library.UploadCollectionItem({
						fileName: oEvent.getParameter("files")[i].name
					});
					// attach the File object to the UC item, so that
					// the item can be identified if it comes from drag and drop
					if (oEvent.getParameter("fromDragDrop")) {
						oItem._internalFileIdWithinDragDropArray = oEvent.getParameter("files")[i];
					}
					oItem._status = sStatus;
					oItem._internalFileIndexWithinFileUploader = i + 1;
					oItem._requestIdName = sRequestValue;
					if (!this.getInstantUpload()) {
						oItem.setAssociation("fileUploader",this._oFileUploader, true);
						sFileSizeFormated =  this._oFormatDecimal.format(oEvent.getParameter("files")[i].size);
						oAttr = new ObjectAttribute({text: sFileSizeFormated});
						oItem.insertAggregation("attributes", oAttr, true);
						this.insertItem(oItem);
					} else {
						oItem._percentUploaded = 0;
					}
					this.aItems.unshift(oItem);
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
					name : this._headerParamConst.requestIdName,
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
		var oFile;
		if (Device.browser.msie && Device.browser.version <= 9) { // IE9
			var sFileName = oEvent.getParameter("newValue");
			oFile = {
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
			oFile = {
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
		var i;
		var sRequestId = this._getRequestId(oEvent);
		var sFileName = oEvent.getParameter("fileName");
		var cItems = this.aItems.length;
		for (i = 0; i < cItems ; i++) {
			if (this.aItems[i] && this.aItems[i].getFileName() === sFileName
					&& this.aItems[i]._requestIdName === sRequestId
					&& (this.aItems[i]._status === UploadCollection._uploadingStatus || this.aItems[i]._status === UploadCollection._toBeDeletedStatus)) {
				this.aItems.splice(i, 1);
				this.removeItem(i);
				break;
			}
		}
		this.fireUploadTerminated({
			fileName: sFileName,
			getHeaderParameter: this._getHeaderParameterWithinEvent.bind(oEvent)
		});
	};

	/**
	 * @description Handling of the Event uploadComplete of the fileUploader to forward the Event to the application
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadComplete = function(oEvent) {
		if (oEvent) {
			var i, sRequestId, sUploadedFile, cItems, oItemToDestroy, aInProgressStates,
			bUploadSuccessful = checkRequestStatus();
			sRequestId = this._getRequestId(oEvent);
			sUploadedFile = oEvent.getParameter("fileName");

			// at the moment parameter fileName is not set in IE9
			if (!sUploadedFile) {
				var aUploadedFile = (oEvent.getSource().getProperty("value")).split(/\" "/);
				sUploadedFile = aUploadedFile[0];
			}
			cItems = this.aItems.length;
			aInProgressStates = [UploadCollection._uploadingStatus, UploadCollection._pendingUploadStatus];
			for (i = 0; i < cItems; i++) {
				// sRequestId should be null only in case of IE9 because FileUploader does not support header parameters for it
				if ((!sRequestId || this.aItems[i]._requestIdName === sRequestId) &&
					this.aItems[i].getProperty("fileName") === sUploadedFile &&
					(aInProgressStates.indexOf(this.aItems[i]._status) >= 0)) {
					if (bUploadSuccessful && this.aItems[i]._status !== UploadCollection._pendingUploadStatus) {
						this.aItems[i]._percentUploaded = 100;
						this.aItems[i]._status = UploadCollection._displayStatus;
					}
					oItemToDestroy = this.aItems.splice(i, 1)[0];
					if (oItemToDestroy.destroy) {
						oItemToDestroy.destroy();
					}
					this._oItemToUpdate = null;
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
					fileName : oEvent.getParameter("fileName") || sUploadedFile,
					responseRaw : oEvent.getParameter("responseRaw"),
					reponse : oEvent.getParameter("response"), // deprecated event property
					response : oEvent.getParameter("response"),
					status : oEvent.getParameter("status"),
					headers : oEvent.getParameter("headers")
				}]
			});
		}
		this.invalidate();

		function checkRequestStatus () {
			var sRequestStatus = oEvent.getParameter("status").toString() || "200"; // In case of IE version < 10, this function will not work.
			if (sRequestStatus[0] === "2" || sRequestStatus[0] === "3") {
				return true;
			} else {
				return false;
			}
		}
	};

	/**
	 * @description Handling of the uploadProgress event of the fileUploader to forward the event to the application
	 * @param {object} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadProgress = function(oEvent) {
		if (oEvent) {
			var i, sUploadedFile, sPercentUploaded, iPercentUploaded, sRequestId, cItems, oProgressLabel, $busyIndicator, oItem;
			sUploadedFile = oEvent.getParameter("fileName");
			sRequestId = this._getRequestId(oEvent);
			iPercentUploaded = Math.round(oEvent.getParameter("loaded") / oEvent.getParameter("total") * 100);
			if (iPercentUploaded === 100) {
				sPercentUploaded = this._oRb.getText("UPLOADCOLLECTION_UPLOAD_COMPLETED");
			} else {
				sPercentUploaded = this._oRb.getText("UPLOADCOLLECTION_UPLOADING", [iPercentUploaded]);
			}
			cItems = this.aItems.length;
			for (i = 0; i < cItems; i++) {
				oItem = this.aItems[i];
				if (oItem.getProperty("fileName") === sUploadedFile && oItem._requestIdName == sRequestId && oItem._status === UploadCollection._uploadingStatus) {
					oProgressLabel = oItem._getProgressLabel ? oItem._getProgressLabel() : oItem._getControl("sap.m.Label", {
						id: oItem.getId() + "-ta_progress"
					}, "ProgressLabel");
					//necessary for IE otherwise it comes to an error if onUploadProgress happens before the new item is added to the list
					if (!!oProgressLabel) {
						oProgressLabel.setText(sPercentUploaded);
						oItem._percentUploaded = iPercentUploaded;
						// add ARIA attribute for screen reader support

						$busyIndicator = jQuery.sap.byId(oItem.getId() + "-ia_indicator");
						if (iPercentUploaded === 100) {
							$busyIndicator.attr("aria-label", sPercentUploaded);
						} else {
							$busyIndicator.attr("aria-valuenow", iPercentUploaded);
						}
						break;
					}
				}
			}
		}
	};

	/**
	 * @description Get the Request ID from the header parameters of a fileUploader event
	 * @param {object} oEvent Event of the fileUploader
	 * @returns {string} Request ID
	 * @private
	 */
	UploadCollection.prototype._getRequestId = function(oEvent) {
		var oHeaderParams;
		oHeaderParams = oEvent.getParameter("requestHeaders");
		if (!oHeaderParams) {
			return null;
		}
		for (var j = 0; j < oHeaderParams.length; j++) {
			if (oHeaderParams[j].name === this._headerParamConst.requestIdName) {
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
		var that = this, bUploadOnChange = this.getInstantUpload();
		if (!bUploadOnChange || !this._oFileUploader) { // In case of instantUpload = false always create a new FU instance. In case of instantUpload = true only create a new FU instance if no FU instance exists yet
			var bSendXHR = (Device.browser.msie && Device.browser.version <= 9) ? false : true;
			this._iFUCounter = this._iFUCounter + 1; // counter for FileUploader instances
			this._oFileUploader = new sap.ui.unified.FileUploader(this.getId() + "-" + this._iFUCounter + "-uploader",{
				buttonOnly : true,
				buttonText: " ", // Suppresses title of the button in FileUploader
				tooltip: this.getInstantUpload() ? this._oRb.getText("UPLOADCOLLECTION_UPLOAD") : this._oRb.getText("UPLOADCOLLECTION_ADD"),
				iconOnly : true,
				enabled : this.getUploadEnabled(),
				fileType : this.getFileType(),
				icon : "sap-icon://add",
				iconFirst : false,
				style : "Transparent",
				maximumFilenameLength : this.getMaximumFilenameLength(),
				maximumFileSize : this.getMaximumFileSize(),
				mimeType : this.getMimeType(),
				multiple : this.getMultiple(),
				name : "uploadCollection",
				uploadOnChange : bUploadOnChange,
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
					if (that.getInstantUpload()) {
						that._onUploadProgress(oEvent);
					}
				},
				uploadStart : function(oEvent) {
					that._onUploadStart(oEvent);
				},
				visible: !this.getUploadButtonInvisible()
			});
		}
		return this._oFileUploader;
	};

	/**
	 * @description Creates the unique key for a file by concatenating the fileName with its requestId and puts it into the requestHeaders parameter of the FileUploader.
	 * It triggers the beforeUploadStarts event for applications to add the header parameters for each file.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	UploadCollection.prototype._onUploadStart = function(oEvent) {
		var oRequestHeaders = {}, i, sRequestIdValue, iParamCounter, sFileName, oGetHeaderParameterResult;
		this._iUploadStartCallCounter++;
		iParamCounter = oEvent.getParameter("requestHeaders").length;
		for (i = 0; i < iParamCounter; i++ ) {
			if (oEvent.getParameter("requestHeaders")[i].name === this._headerParamConst.requestIdName) {
				sRequestIdValue = oEvent.getParameter("requestHeaders")[i].value;
				break;
			}
		}
		sFileName = oEvent.getParameter("fileName");
		oRequestHeaders = {
			name: this._headerParamConst.fileNameRequestIdName,
			value: this._encodeToAscii(sFileName) + sRequestIdValue
		};
		oEvent.getParameter("requestHeaders").push(oRequestHeaders);

		for ( i = 0; i < this._aDeletedItemForPendingUpload.length; i++ ) {
			if (this._aDeletedItemForPendingUpload[i].getAssociation("fileUploader") === oEvent.oSource.sId &&
					this._aDeletedItemForPendingUpload[i].getFileName() === sFileName &&
					this._aDeletedItemForPendingUpload[i]._internalFileIndexWithinFileUploader === this._iUploadStartCallCounter){
				oEvent.getSource().abort(this._headerParamConst.fileNameRequestIdName, this._encodeToAscii(sFileName) + sRequestIdValue);
				return;
			}
		}
		this.fireBeforeUploadStarts({
			fileName: sFileName,
			addHeaderParameter: addHeaderParameter,
			getHeaderParameter: getHeaderParameter.bind(this)
		});

		// ensure that the HeaderParameterValues are updated
		if (jQuery.isArray(oGetHeaderParameterResult)) {
			for (i = 0; i < oGetHeaderParameterResult.length; i++) {
				if (oEvent.getParameter("requestHeaders")[i].name === oGetHeaderParameterResult[i].getName()) {
					oEvent.getParameter("requestHeaders")[i].value = oGetHeaderParameterResult[i].getValue();
				}
			}
		} else if (oGetHeaderParameterResult instanceof sap.m.UploadCollectionParameter) {
			for (i = 0; i < oEvent.getParameter("requestHeaders").length; i++) {
				if (oEvent.getParameter("requestHeaders")[i].name === oGetHeaderParameterResult.getName()) {
					oEvent.getParameter("requestHeaders")[i].value = oGetHeaderParameterResult.getValue();
					break;
				}
			}
		}

		function addHeaderParameter(oUploadCollectionParameter) {
			var oRequestHeaders = {
				name: oUploadCollectionParameter.getName(),
				value: oUploadCollectionParameter.getValue()
			};
			oEvent.getParameter("requestHeaders").push(oRequestHeaders);
		}

		function getHeaderParameter(sHeaderParameterName) {
			oGetHeaderParameterResult = this._getHeaderParameterWithinEvent.bind(oEvent)(sHeaderParameterName);
			return oGetHeaderParameterResult;
		}
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
				return UploadCollection._placeholderCamera;  // if no image is provided a standard placeholder camera is displayed
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
	 * @param {object} oEvent when clicking or pressing of the icon or image
	 * @param {object} oContext Context of the link
	 * @returns {void}
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
		jQuery.sap.byId(sFocusId).focus();
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
					iLine = oEvent.target.id.split("-")[2];
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

		if (oObj !== undefined) {
			if (oObj._status === UploadCollection._displayStatus) {
				//focus at list line (status = "display") and F2 pressed --> status = "Edit"
				var o$Obj = jQuery.sap.byId(oEvent.target.id);
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
		} else if (oEvent.target.id.search(oContext.editModeItem) === 0) {
			//focus at Inputpield (status = "Edit"), F2 pressed --> status = "display" changes will be saved
			sap.m.UploadCollection.prototype._handleOk(oEvent, oContext, oContext.editModeItem, true);
		}
	};

	/**
	 * @description Delivers an array of Filenames from a string of the FileUploader event.
	 * @param {string} sFilenames
	 * @returns {array} Array of files which are selected to be uploaded.
	 * @private
	 */
	UploadCollection.prototype._getFileNames = function(sFilenames) {
		if (this.getMultiple() && !(Device.browser.msie && Device.browser.version <= 9)) {
			return sFilenames.substring(1, sFilenames.length - 2).split(/\" "/);
		} else {
			return sFilenames.split(/\" "/);
		}
	};

	/**
	 * @description Determines if the fileName is already in usage.
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
			if (sFilename === aItems[i].getProperty("fileName")){
				return true;
			}
		}
		return false;
	};

	/**
	 * @description Split file name into name and extension.
	 * @param {string} sFilename Full file name inclusive the extension
	 * @returns {object} oResult Filename and Extension
	 * @deprecated UploadCollectionItem._splitFileName method should be used instead
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

	/**
	 * @description Getter of aria label for the icon or image.
	 * @param {object} oItem An item of the list to which the text is to be retrieved
	 * @returns {string} sText Text of the icon (or image)
	 * @private
	 */
	UploadCollection.prototype._getAriaLabelForPicture = function(oItem) {
		var sText;
		// prerequisite: the items have field names or the app provides explicite texts for pictures
		sText = (oItem.getAriaLabelForPicture() || oItem.getFileName());
		return sText;
	};

	/**
	 * @description Helper function for better Event API. This reference points to the oEvent comming from the FileUploader
	 * @param {string} sHeaderParameterName Header parameter name (optional)
	 * @returns {UploadCollectionParameter} || {UploadCollectionParameter[]}
	 * @private
	 */
	UploadCollection.prototype._getHeaderParameterWithinEvent = function (sHeaderParameterName) {
		var aUcpRequestHeaders = [];
		var aRequestHeaders = this.getParameter("requestHeaders");
		var iParamCounter = aRequestHeaders.length;
		var i;
		if (aRequestHeaders && sHeaderParameterName) {
			for (i = 0; i < iParamCounter; i++ ) {
				if (aRequestHeaders[i].name === sHeaderParameterName) {
					return new sap.m.UploadCollectionParameter({
						name: aRequestHeaders[i].name,
						value: aRequestHeaders[i].value
					});
				}
			}
		} else {
			if (aRequestHeaders) {
				for (i = 0; i < iParamCounter; i++) {
					aUcpRequestHeaders.push(new sap.m.UploadCollectionParameter({
						name: aRequestHeaders[i].name,
						value: aRequestHeaders[i].value
					}));
				}
			}
			return aUcpRequestHeaders;
		}
	};

	/**
	 * @description Helper function for ASCII encoding within header parameters
	 * @param {string}
	 * @returns {string}
	 * @private
	 */
	UploadCollection.prototype._encodeToAscii = function (value) {
		var sEncodedValue = "";
		for (var i = 0; i < value.length; i++) {
			sEncodedValue = sEncodedValue + value.charCodeAt(i);
		}
		return sEncodedValue;
	};

	/**
	 * Handles ResizeEvent of UploadCollection to align ObjectMarkers and FileName correctly
	 * @private
	 */
	UploadCollection.prototype._onResize = function () {
		var aListItems = this._oList.getItems();
		for (var i = 0; i < aListItems.length; i++) {
			jQuery.sap.delayedCall(UploadCollection._resizeTimeoutInterval, this, this._truncateFileName.bind(this), [aListItems[i]._oUploadCollectionItem]);
		}
	};

	/**
	 * @description Returns UploadCollectionItem based on the items aggregation
	 * @param {sap.m.ListItemBase} listItem used to find the UploadCollectionItem
	 * @returns {sap.m.UploadCollectionItem} The matching UploadCollectionItem
	 * @private
	 */
	UploadCollection.prototype._getUploadCollectionItemByListItem = function(listItem) {
		var aAllItems = this.getItems();
		for (var i = 0; i < aAllItems.length; i++) {
			if (aAllItems[i].getId() === listItem.getId().replace("-cli", "")) {
				return aAllItems[i];
			}
		}
		return null;
	};

	/**
	 * @description Returns UploadCollectionItem based on the items aggregation
	 * @param {string} uploadCollectionItemId used to find the UploadCollectionItem
	 * @returns {sap.m.UploadCollectionItem} The matching UploadCollectionItem
	 * @private
	 */
	UploadCollection.prototype._getUploadCollectionItemById = function(uploadCollectionItemId) {
		var aAllItems = this.getItems();
		for (var i = 0; i < aAllItems.length; i++) {
			if (aAllItems[i].getId() === uploadCollectionItemId) {
				return aAllItems[i];
			}
		}
		return null;
	};

	/**
	 * @description Returns an array of UploadCollection items based on the items aggregation
	 * @param {sap.m.ListItemBase[]} listItems used to find the UploadCollectionItems
	 * @returns {sap.m.UploadCollectionItem[]} The matching UploadCollectionItems
	 * @private
	 */
	UploadCollection.prototype._getUploadCollectionItemsByListItems = function(listItems) {
		var aUploadCollectionItems = [];
		var aLocalUploadCollectionItems = this.getItems();

		if (listItems) {
			for (var i = 0; i < listItems.length; i++) {
				for (var j = 0; j < aLocalUploadCollectionItems.length; j++) {
					if (listItems[i].getId().replace("-cli", "") === aLocalUploadCollectionItems[j].getId()) {
						aUploadCollectionItems.push(aLocalUploadCollectionItems[j]);
						break;
					}
				}
			}
			return aUploadCollectionItems;
		}
		return null;
	};

	/**
	 * @description Sets the selected value for elements in given array to state of given bSelected. Also handles List specific rules
	 * @param {sap.m.ListItemBase[]} uploadCollectionItemsToUpdate to set selected value for
	 * @param {boolean} selected value to set items to
	 * @private
	 */
	UploadCollection.prototype._setSelectedForItems = function(uploadCollectionItemsToUpdate, selected) {
		//Reset all 'selected' values in UploadCollectionItems
		if (this.getMode() !== sap.m.ListMode.MultiSelect && selected) {
			var aUploadCollectionItems = this.getItems();
			for (var j = 0; j < aUploadCollectionItems.length; j++) {
				aUploadCollectionItems[j].setSelected(false);
			}
		}
		for (var i = 0; i < uploadCollectionItemsToUpdate.length; i++) {
			uploadCollectionItemsToUpdate[i].setSelected(selected);
		}
	};

	/**
	 * Handles the selected event of UploadCollectionItem.
	 * Used to synchronize the internal list with the given item. The ListItem has to be set to selected value too.
	 * Otherwise the internal sap.m.List and the UploadCollectionItem aggregation are not in sync.
	 * @param {object} oEvent Event for a selected item
	 * @private
	 */
	UploadCollection.prototype._handleItemSetSelected = function(oEvent) {
		var oItem = oEvent.getSource();
		if (oItem instanceof sap.m.UploadCollectionItem) {
			var oListItem = this._getListItemById(oItem.getId() + "-cli");
			if (oListItem) {
				oListItem.setSelected(oItem.getSelected());
			}
		}
	};

	UploadCollection.prototype._handleSelectionChange = function(oEvent){
		var oListItem = oEvent.getParameter("listItem");
		var bSelected = oEvent.getParameter("selected");
		var aUploadCollectionListItems = this._getUploadCollectionItemsByListItems(oEvent.getParameter("listItems"));
		var oUploadCollectionItem = this._getUploadCollectionItemByListItem(oListItem);
		if (oUploadCollectionItem && oListItem && aUploadCollectionListItems) {
			this.fireSelectionChange({
				selectedItem : oUploadCollectionItem,
				selectedItems : aUploadCollectionListItems,
				selected : bSelected
			});
			oUploadCollectionItem.setSelected(oListItem.getSelected());
		}
	};

	/**
	 * @description Returns the sap.m.ListItem from the internal sap.m.List based on the id
	 * @param {string} listItemId used to find the UploadCollectionItems
	 * @returns {sap.m.ListItemBase} The matching UploadCollectionItems
	 * @private
	 */
	UploadCollection.prototype._getListItemById = function(listItemId) {
		var aListItems = this._oList.getItems();
		return UploadCollection._findById(listItemId, aListItems);
	};

	/**
	 * @description Returns the sap.m.ListItem from the internal sap.m.List based on the id
	 * @param {string} listItemId used to find the UploadCollectionItems
	 * @param {array} listItems the array to search into
	 * @returns {sap.m.ListItemBase} The matching UploadCollectionItems
	 * @private
	 */
	UploadCollection._findById = function(listItemId, listItems) {
		for (var i = 0; i < listItems.length; i++) {
			if (listItems[i].getId() === listItemId) {
				return listItems[i];
			}
		}
		return null;
	};

	return UploadCollection;

});
