/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"sap/m/library",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/ui/core/Control",
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool",
	"sap/m/Image",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Button",
	"sap/m/List",
	"sap/m/BusyIndicator",
	"sap/m/StandardListItem",
	"sap/ui/unified/FileUploaderParameter",
	"sap/ui/unified/FileUploader",
	"sap/ui/core/format/FileSizeFormat",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/ObjectAttribute",
	"sap/m/UploadCollectionItem",
	"sap/m/UploadCollectionParameter",
	"sap/m/UploadCollectionToolbarPlaceholder",
	"sap/ui/core/HTML",
	"sap/m/CustomListItem",
	"sap/ui/core/ResizeHandler",
	"sap/ui/Device",
	"./UploadCollectionRenderer",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/ui/dom/jquery/selectText" // jQuery Plugin "selectText"
], function(
	Library,
	MobileLibrary,
	MessageBox,
	Dialog,
	Control,
	Icon,
	IconPool,
	Image,
	Text,
	Title,
	Button,
	List,
	BusyIndicator,
	StandardListItem,
	FileUploaderParameter,
	FileUploader,
	FileSizeFormat,
	OverflowToolbar,
	ToolbarSpacer,
	ObjectAttribute,
	UploadCollectionItem,
	UploadCollectionParameter,
	UploadCollectionToolbarPlaceholder,
	HTML,
	CustomListItem,
	ResizeHandler,
	Device,
	UploadCollectionRenderer,
	jQuery,
	KeyCodes,
	Log
) {
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
	 * <br> As of version 1.62, there is an {@link sap.m.upload.UploadSet} control available that is based on this control.
	 * {@link sap.m.upload.UploadSet} provides enhanced handling of headers and requests, unified behavior of instant
	 * and deferred uploads, as well as improved progress indication.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.26.0
	 * @alias sap.m.UploadCollection
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UploadCollection = Control.extend("sap.m.UploadCollection", /** @lends sap.m.UploadCollection.prototype */ {

		constructor: function(sId, mSettings) {
			// Delete 'instantUpload' before calling the super constructor to avoid unwanted error logs
			var bInstantUpload;
			if (mSettings && mSettings.instantUpload !== undefined ) {
			    if (mSettings.instantUpload === false){
                    bInstantUpload = mSettings.instantUpload;
                }
				delete mSettings.instantUpload;
			} else if (sId && sId.instantUpload !== undefined ) {
                if (sId.instantUpload === false){
                    bInstantUpload = sId.instantUpload;
                }
				delete sId.instantUpload;
			}
			if (mSettings && mSettings.mode === Library.ListMode.MultiSelect && bInstantUpload === false) {
				mSettings.mode = Library.ListMode.None;
				Log.info("sap.m.ListMode.MultiSelect is not supported by UploadCollection for Upload Pending scenario. Value has been resetted to 'None'");
			} else if (sId && sId.mode === Library.ListMode.MultiSelect && bInstantUpload === false) {
				sId.mode = Library.ListMode.None;
				Log.info("sap.m.ListMode.MultiSelect is not supported by UploadCollection for Upload Pending scenario. Value has been resetted to 'None'");
			}
			try {
				Control.apply(this, arguments);
				if (bInstantUpload === false) {
					this.bInstantUpload = bInstantUpload;
					this._oFormatDecimal = FileSizeFormat.getInstance({
						binaryFilesize: true,
						maxFractionDigits: 1,
						maxIntegerDigits: 4
					});
				}
			} catch (e) {
				this.destroy();
				throw e;
			}
		},

		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * Defines the allowed file types for the upload.
				 * The chosen files will be checked against an array of file types.
				 * If at least one file does not fit the file type requirements, the upload is prevented.  Example: ["jpg", "png", "bmp"].
				 */
				fileType: {type: "string[]", group: "Data", defaultValue: null},

				/**
				 * Specifies the maximum length of a file name.
				 * If the maximum file name length is exceeded, the corresponding event 'filenameLengthExceed' is triggered.
				 */
				maximumFilenameLength: {type: "int", group: "Data", defaultValue: null},

				/**
				 * Specifies a file size limit in megabytes that prevents the upload if at least one file exceeds the limit.
				 * This property is not supported by Internet Explorer 8 and 9.
				 */
				maximumFileSize: {type: "float", group: "Data", defaultValue: null},

				/**
				 * Defines the allowed MIME types of files to be uploaded.
				 * The chosen files will be checked against an array of MIME types.
				 * If at least one file does not fit the MIME type requirements, the upload is prevented.
				 * This property is not supported by Internet Explorer 8 and 9. Example: mimeType ["image/png", "image/jpeg"].
				 */
				mimeType: {type: "string[]", group: "Data", defaultValue: null},

				/**
				 * Lets the user select multiple files from the same folder and then upload them.
				 * Internet Explorer 8 and 9 do not support this property.
				 * Please note that the various operating systems for mobile devices can react differently to the property so that fewer upload functions may be available in some cases.
				 *
				 * If multiple property is set to false, the control shows an error message if more than one file is chosen for drag & drop.
				 */
				multiple: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Allows you to set your own text for the 'No data' text label.
				 */
				noDataText: {type: "string", group: "Appearance", defaultValue: null},

				/**
				 * Allows you to set your own text for the 'No data' description label.
				 * @since 1.46.0
				 */
				noDataDescription: {type: "string", group: "Appearance", defaultValue: null},

				/**
				 * Allows the user to use the same name for a file when editing the file name. 'Same name' refers to an already existing file name in the list.
				 */
				sameFilenameAllowed: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Defines whether separators are shown between list items.
				 */
				showSeparators: {
					type: "sap.m.ListSeparators",
					group: "Appearance",
					defaultValue: "All"
				},

				/**
				 * Enables the upload of a file.
				 */
				uploadEnabled: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Specifies the URL where the uploaded files have to be stored.
				 */
				uploadUrl: {type: "string", group: "Data", defaultValue: "../../../upload"},

				/**
				 * If false, no upload is triggered when a file is selected. In addition, if a file was selected, a new FileUploader instance is created to ensure that multiple files from multiple folders can be chosen.
				 * @since 1.30.0
				 */
				instantUpload: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Sets the title text in the toolbar of the list of attachments.
				 * To show as well the number of attachments in brackets like the default text does. The number of attachments could be retrieved via "getItems().length".
				 * If a new title is set, the default is deactivated.
				 * The default value is set to language-dependent "Attachments (n)".
				 * @since 1.30.0
				 */
				numberOfAttachmentsText: {type: "string", group: "Appearance", defaultValue: null},

				/**
				 * Defines the selection mode of the control (e.g. None, SingleSelect, MultiSelect, SingleSelectLeft, SingleSelectMaster).
				 * Since the UploadCollection reacts like a list for attachments, the API is close to the ListBase Interface.
				 * sap.m.ListMode.Delete mode is not supported and will be automatically set to sap.m.ListMode.None.
				 * In addition, if instant upload is set to false the mode sap.m.ListMode.MultiSelect is not supported and will be automatically set to sap.m.ListMode.None.
				 *
				 * @since 1.34.0
				 */
				mode: {type: "sap.m.ListMode", group: "Behavior", defaultValue: "None"},

				/**
				 * If true, the button used for uploading files is invisible.
				 * @since 1.42.0
				 */
				uploadButtonInvisible: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * If true, the button that is used to terminate the instant file upload gets visible.
				 * The button normally appears when a file is being uploaded.
				 * @since 1.42.0
				 */
				terminationEnabled: {type: "boolean", group: "Behavior", defaultValue: true}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Uploaded items.
				 */
				items: {
					type: "sap.m.UploadCollectionItem",
					multiple: true,
					singularName: "item",
					bindable: "bindable"
				},

				/**
				 * Specifies the header parameters for the FileUploader that are submitted only with XHR requests.
				 * Header parameters are not supported by Internet Explorer 8 and 9.
				 */
				headerParameters: {
					type: "sap.m.UploadCollectionParameter",
					multiple: true,
					singularName: "headerParameter"
				},

				/**
				 * Specifies the parameters for the FileUploader that are rendered as a hidden input field.
				 */
				parameters: {type: "sap.m.UploadCollectionParameter", multiple: true, singularName: "parameter"},

				/**
				 * Specifies the toolbar.
				 * @since 1.34.0
				 */
				toolbar: {type: "sap.m.OverflowToolbar", multiple: false},

				/**
				 * Specifies the info toolbar for filtering information. Sorting information will not displayed.
				 * @since 1.44.0
				 */
				infoToolbar: {type: "sap.m.Toolbar", multiple: false, forwarding: {idSuffix: "-list", aggregation: "infoToolbar"}},

				/**
				 * Internal aggregation to hold the list in controls tree.
				 * @since 1.34.0
				 */
				_list: {
					type: "sap.m.List",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * The icon is displayed in no data page
				 * @since 1.46.0
				 */
				_noDataIcon: {
					type: "sap.ui.core.Icon",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * Internal aggregation to hold the drag and drop icon of indicator.
				 * @since 1.46.0
				 */
				_dragDropIcon: {
					type: "sap.ui.core.Icon",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * Internal aggregation to hold the drag and drop text of indicator.
				 * @since 1.46.0
				 */
				_dragDropText: {
					type: "sap.m.Text",
					multiple: false,
					visibility: "hidden"
				}
			},

			events: {
				/**
				 * The event is triggered when files are selected in the FileUploader dialog. Applications can set parameters and headerParameters which will be dispatched to the embedded FileUploader control.
				 * Limitation: parameters and headerParameters are not supported by Internet Explorer 9.
				 */
				change: {
					parameters: {
						/**
						 * A unique Id of the attached document.
						 * This parameter is deprecated since 1.28.0. Use the <code>files</code> parameter instead.
						 * @deprecated Since 1.28.0. Use the <code>files</code> parameter instead.
						 */
						documentId: {type: "string"},
						/**
						 * A FileList of individually selected files from the underlying system. See www.w3.org for the FileList Interface definition.
						 * Limitation: Internet Explorer 9 supports only single file with property file.name.
						 * Since version 1.28.0.
						 * @since 1.28.0
						 */
						files: {type: "object[]"}
					}
				},

				/**
				 * The event is triggered when an uploaded attachment is selected and the Delete button is pressed.
				 */
				fileDeleted: {
					parameters: {
						/**
						 * A unique Id of the attached document.
						 * This parameter is deprecated since 1.28.0. Use the <code>item</code> parameter instead.
						 * @deprecated Since 1.28.0. Use the <code>item</code> parameter instead.
						 */
						documentId: {type: "string"},
						/**
						 * An item to be deleted from the collection.
						 * Since version 1.28.0.
						 * @since 1.28.0
						 */
						item: {type: "sap.m.UploadCollectionItem"}
					}
				},

				/**
				 * The event is triggered when the name of a chosen file is longer than the value specified with the maximumFilenameLength property (only if provided by the application).
				 */
				filenameLengthExceed: {
					parameters: {
						/**
						 * A unique Id of the attached document.
						 * This parameter is deprecated since 1.28.0. Use the <code>files</code> parameter instead.
						 * @deprecated Since 1.28.0. Use the <code>files</code> parameter instead.
						 */
						documentId: {type: "string"},
						/**
						 * A FileList of individually selected files from the underlying system.
						 * Limitation: Internet Explorer 9 supports only single file with property file.name.
						 * Since version 1.28.0.
						 * @since 1.28.0
						 */
						files: {type: "object[]"}
					}
				},

				/**
				 * The event is triggered when the file name is changed.
				 */
				fileRenamed: {
					parameters: {
						/**
						 * A unique Id of the attached document.
						 * This parameter is deprecated since 1.28.0. Use the <code>item</code> parameter instead.
						 * @deprecated Since 1.28.0. Use the <code>item</code> parameter instead.
						 */
						documentId: {type: "string"},

						/**
						 * The new file name.
						 * This parameter is deprecated since 1.28.0. Use the <code>item</code> parameter instead.
						 * @deprecated Since 1.28.0. Use the <code>item</code> parameter instead.
						 */
						fileName: {type: "string"},

						/**
						 * The renamed UI element as an UploadCollectionItem.
						 * Since 1.28.0.
						 * @since 1.28.0
						 */
						item: {type: "sap.m.UploadCollectionItem"}
					}
				},

				/**
				 * The event is triggered when the file size of an uploaded file is exceeded (only if the maxFileSize property was provided by the application).
				 * This event is not supported by Internet Explorer 9.
				 */
				fileSizeExceed: {
					parameters: {
						/**
						 * A unique Id of the attached document.
						 * This parameter is deprecated since 1.28.0. Use the <code>files</code> parameter instead.
						 * @deprecated Since 1.28.0. Use the <code>files</code> parameter instead.
						 */
						documentId: {type: "string"},

						/**
						 * The size in MB of a file to be uploaded.
						 * This parameter is deprecated since 1.28.0. Use the <code>files</code> parameter instead.
						 * @deprecated Since 1.28.0. Use the <code>files</code> parameter instead.
						 */
						fileSize: {type: "string"},

						/**
						 * A FileList of individually selected files from the underlying system.
						 * Limitation: Internet Explorer 9 supports only single file with property file.name.
						 * Since 1.28.0.
						 * @since 1.28.0
						 */
						files: {type: "object[]"}
					}
				},

				/**
				 * The event is triggered when the file type or the MIME type don't match the permitted types (only if the fileType property or the mimeType property are provided by the application).
				 */
				typeMissmatch: {
					parameters: {
						/**
						 * A unique Id of the attached document.
						 * This parameter is deprecated since 1.28.0. Use the <code>files</code> parameter instead.
						 * @deprecated Since 1.28.0. Use the <code>files</code> parameter instead.
						 */
						documentId: {type: "string"},

						/**
						 * File type.
						 * This parameter is deprecated since 1.28.0. Use the <code>files</code> parameter instead.
						 * @deprecated Since 1.28.0. Use the <code>files</code> parameter instead.
						 */
						fileType: {type: "string"},

						/**
						 * MIME type.
						 * This parameter is deprecated since 1.28.0. Use the <code>files</code> parameter instead.
						 * @deprecated Since 1.28.0. Use the <code>files</code> parameter instead.
						 */
						mimeType: {type: "string"},

						/**
						 * A FileList of individually selected files from the underlying system.
						 * Limitation: Internet Explorer 9 supports only single file.
						 * Since 1.28.0.
						 * @since 1.28.0
						 */
						files: {type: "object[]"}
					}
				},

				/**
				 * The event is triggered as soon as the upload request is completed.
				 */
				uploadComplete: {
					parameters: {
						/**
						 * Ready state XHR.
						 * This parameter is deprecated since 1.28.0. Use the <code>files</code> parameter instead.
						 * @deprecated Since 1.28.0. Use the <code>files</code> parameter instead.
						 */
						readyStateXHR: {type: "string"},

						/**
						 * Response of the completed upload request.
						 * This parameter is deprecated since 1.28.0. Use the <code>files</code> parameter instead.
						 * @deprecated Since 1.28.0. Use the <code>files</code> parameter instead.
						 */
						response: {type: "string"},

						/**
						 * Status Code of the completed upload event.
						 * This parameter is deprecated since 1.28.0. Use the <code>files</code> parameter instead.
						 * @deprecated Since 1.28.0. Use the <code>files</code> parameter instead.
						 */
						status: {type: "string"},

						/**
						 * A list of uploaded files. Each entry contains the following members.
						 * fileName     : The name of a file to be uploaded.
						 * response     : Response message which comes from the server. On the server side, this response has to be put within the 'body' tags of the response document of the iFrame. It can consist of a return code and an optional message. This does not work in cross-domain scenarios.
						 * reponse     : deprecated Since version 1.48.0. This parameter is deprecated, use parameter response instead.
						 * responseRaw : HTTP-Response which comes from the server. This property is not supported by Internet Explorer Versions lower than 9.
						 * status      : Status of the XHR request. This property is not supported by Internet Explorer 9 and lower.
						 * headers     : HTTP-Response-Headers which come from the server. Provided as a JSON-map, i.e. each header-field is reflected by a property in the header-object, with the property value reflecting the header-field's content. This property is not supported by Internet Explorer 9 and lower.
						 * Since 1.28.0.
						 * @since 1.28.0
						 */
						files: {type: "object[]"}
					}
				},

				/**
				 * The event is triggered as soon as the upload request was terminated by the user.
				 */
				uploadTerminated: {
					parameters: {
						/**
						 * Specifies the name of the file of which the upload is to be terminated.
						 */
						fileName: {type: "string"},

						/**
						 * This callback function returns the corresponding header parameter (type sap.m.UploadCollectionParameter) if available.
						 */
						getHeaderParameter: {
							type: "function",
							parameters: {
								/**
								 * The (optional) name of the header parameter. If no parameter is provided all header parameters are returned.
								 */
								headerParameterName: {type: "string"}
							}
						}
					}
				},

				/**
				 * The event is triggered before the actual upload starts. An event is fired per file. All the necessary header parameters should be set here.
				 */
				beforeUploadStarts: {
					parameters: {
						/**
						 * Specifies the name of the file to be uploaded.
						 */
						fileName: {type: "string"},

						/**
						 * Adds a header parameter to the file that will be uploaded.
						 */
						addHeaderParameter: {
							type: "function",
							parameters: {
								/**
								 * Specifies a header parameter that will be added
								 */
								headerParameter: {type: "sap.m.UploadCollectionParameter"}
							}
						},
						/**
						 * Returns the corresponding header parameter (type sap.m.UploadCollectionParameter) if available.
						 */
						getHeaderParameter: {
							type: "function",
							parameters: {
								/**
								 * The (optional) name of the header parameter. If no parameter is provided all header parameters are returned.
								 */
								headerParameterName: {type: "string"}
							}
						}
					}
				},

				/**
				 * Fires when selection is changed via user interaction inside the control.
				 * @since 1.36.0
				 */
				selectionChange: {
					parameters: {
						/**
						 * The item whose selection has changed. In <code>MultiSelect</code> mode, only the topmost selected item is returned. This parameter can be used for single-selection modes.
						 */
						selectedItem: {type: "sap.m.UploadCollectionItem"},

						/**
						 * Array of items whose selection has changed. This parameter can be used for <code>MultiSelect</code> mode.
						 */
						selectedItems: {type: "sap.m.UploadCollectionItem[]"},

						/**
						 * Indicates whether the <code>listItem</code> parameter is selected or not.
						 */
						selected: {type: "boolean"}
					}
				}
			}
		}
	});

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

	UploadCollection.prototype.init = function() {
		UploadCollection.prototype._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._headerParamConst = {
			requestIdName: "requestId" + jQuery.now(),
			fileNameRequestIdName: "fileNameRequestId" + jQuery.now()
		};
		this._requestIdValue = 0;
		this._iFUCounter = 0; // it is necessary to count FileUploader instances in case of 'instantUpload' = false

		this._oList = new List(this.getId() + "-list", {
			selectionChange: [this._handleSelectionChange, this]
		});
		this.setAggregation("_list", this._oList, true);
		this._oList.addStyleClass("sapMUCList");
		this.setAggregation("_noDataIcon", new Icon(this.getId() + "-no-data-icon", {
			src: "sap-icon://document",
			size: "6rem",
			noTabStop: true
		}), true);
		this.setAggregation("_dragDropIcon", new Icon(this.getId() + "-drag-drop-icon", {
			src: "sap-icon://upload-to-cloud",
			size: "4rem",
			noTabStop: true
		}), true);
		this.setAggregation("_dragDropText", new Text(this.getId() + "-drag-drop-text", {
			text: this._oRb.getText("UPLOADCOLLECTION_DRAG_FILE_INDICATOR")
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
			Log.info("As property instantUpload is false it is not allowed to change fileType at runtime.");
		} else {
			var cLength = aFileTypes.length;
			for (var i = 0; i < cLength; i++) {
				aFileTypes[i] = aFileTypes[i].toLowerCase();
			}

			if (this.getFileType() !== aFileTypes) {
				this.setProperty("fileType", aFileTypes, true);
				this._getFileUploader().setFileType(aFileTypes);
			}
		}
		return this;
	};

	UploadCollection.prototype.setMaximumFilenameLength = function(iMaximumFilenameLength) {
		if (!this.getInstantUpload()) {
			Log.info("As property instantUpload is false it is not allowed to change maximumFilenameLength at runtime.");
		} else if (this.getMaximumFilenameLength() !== iMaximumFilenameLength) {
			this.setProperty("maximumFilenameLength", iMaximumFilenameLength, true);
			this._getFileUploader().setMaximumFilenameLength(iMaximumFilenameLength);
		}
		return this;
	};

	UploadCollection.prototype.setMaximumFileSize = function(iMaximumFileSize) {
		if (!this.getInstantUpload()) {
			Log.info("As property instantUpload is false it is not allowed to change maximumFileSize at runtime.");
		} else if (this.getMaximumFileSize() !== iMaximumFileSize) {
			this.setProperty("maximumFileSize", iMaximumFileSize, true);
			this._getFileUploader().setMaximumFileSize(iMaximumFileSize);
		}
		return this;
	};

	UploadCollection.prototype.setMimeType = function(aMimeTypes) {
		if (!this.getInstantUpload()) {
			Log.info("As property instantUpload is false it is not allowed to change mimeType at runtime.");
		} else if (this.getMimeType() !== aMimeTypes) {
			this.setProperty("mimeType", aMimeTypes, true);
			this._getFileUploader().setMimeType(aMimeTypes);
		}
		return this;
	};

	UploadCollection.prototype.setMultiple = function(bMultiple) {
		if (!this.getInstantUpload()) {
			Log.info("As property instantUpload is false it is not allowed to change multiple at runtime.");
		} else if (this.getMultiple() !== bMultiple) {
			this.setProperty("multiple", bMultiple);
			this._getFileUploader().setMultiple(bMultiple);
		}
		return this;
	};

	UploadCollection.prototype.setShowSeparators = function(bShowSeparators) {
		if (this.getShowSeparators() !== bShowSeparators) {
			this.setProperty("showSeparators", bShowSeparators);
			this._oList.setShowSeparators(bShowSeparators);
		}
		return this;
	};

	UploadCollection.prototype.setUploadEnabled = function(bUploadEnabled) {
		if (!this.getInstantUpload()) {
			Log.info("As property instantUpload is false it is not allowed to change uploadEnabled at runtime.");
		} else if (this.getUploadEnabled() !== bUploadEnabled) {
			this.setProperty("uploadEnabled", bUploadEnabled);
			this._getFileUploader().setEnabled(bUploadEnabled);
		}
		return this;
	};

	UploadCollection.prototype.setUploadUrl = function(sUploadUrl) {
		if (!this.getInstantUpload()) {
			Log.info("As property instantUpload is false it is not allowed to change uploadUrl at runtime.");
		} else if (this.getUploadUrl() !== sUploadUrl) {
			this.setProperty("uploadUrl", sUploadUrl);
			this._getFileUploader().setUploadUrl(sUploadUrl);
		}
		return this;
	};

	UploadCollection.prototype.setInstantUpload = function() {
		Log.error("It is not supported to change the behavior at runtime.");
		return this;
	};

	UploadCollection.prototype.setMode = function(mode) {
		if (mode === Library.ListMode.Delete) {
			this._oList.setMode(Library.ListMode.None);
			Log.info("sap.m.ListMode.Delete is not supported by UploadCollection. Value has been resetted to 'None'");
		} else if (mode === Library.ListMode.MultiSelect && !this.getInstantUpload()) {
			this._oList.setMode(Library.ListMode.None);
			Log.info("sap.m.ListMode.MultiSelect is not supported by UploadCollection for Pending Upload. Value has been resetted to 'None'");
		} else {
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

	/**
	 * Provides access to the internally used request headers to allow adding them to the "Access-Control-Allow-Headers" header parameter if needed.
	 * @returns {string[]} An array of request header strings
	 * @since 1.50.0
	 * @public
	 */
	UploadCollection.prototype.getInternalRequestHeaderNames = function() {
		return [this._headerParamConst.fileNameRequestIdName, this._headerParamConst.requestIdName];
	};

	/* =========================================================== */
	/* API methods                                           */
	/* =========================================================== */
	/**
	 * Starts the upload for all selected files.
	 * @public
	 * @since 1.30.0
	 */
	UploadCollection.prototype.upload = function() {
		if (this.getInstantUpload()) {
			Log.error("Not a valid API call. 'instantUpload' should be set to 'false'.");
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
	 * Returns an array containing the selected UploadCollectionItems.
	 * @returns {sap.m.UploadCollectionItem[]} Array of all selected items
	 * @public
	 * @since 1.34.0
	 */
	UploadCollection.prototype.getSelectedItems = function() {
		var aSelectedListItems = this._oList.getSelectedItems();
		return this._getUploadCollectionItemsByListItems(aSelectedListItems);
	};

	/**
	 * Retrieves the currently selected UploadCollectionItem.
	 * @returns {sap.m.UploadCollectionItem | null} The currently selected item or null
	 * @since 1.34.0
	 * @public
	 */
	UploadCollection.prototype.getSelectedItem = function() {
		var oSelectedListItem = this._oList.getSelectedItem();
		if (oSelectedListItem) {
			return this._getUploadCollectionItemByListItem(oSelectedListItem);
		}
		return null;
	};

	/**
	 * Sets an UploadCollectionItem to be selected by ID. In single selection mode, the method removes the previous selection.
	 * @param {string} id The ID of the item whose selection is to be changed.
	 * @param {boolean} select The selection state of the item. Default value is true.
	 * @returns {sap.m.UploadCollection} this to allow method chaining
	 * @since 1.34.0
	 * @public
	 */
	UploadCollection.prototype.setSelectedItemById = function(id, select) {
		this._oList.setSelectedItemById(id + "-cli", select);
		this._setSelectedForItems([this._getUploadCollectionItemById(id)], select);
		return this;
	};

	/**
	 * Selects or deselects the given list item.
	 * @param {sap.m.UploadCollectionItem} uploadCollectionItem The item whose selection is to be changed. This parameter is mandatory.
	 * @param {boolean} select The selection state of the item. Default value is true.
	 * @returns {sap.m.UploadCollection} this to allow method chaining
	 * @since 1.34.0
	 * @public
	 */
	UploadCollection.prototype.setSelectedItem = function(uploadCollectionItem, select) {
		return this.setSelectedItemById(uploadCollectionItem.getId(), select);
	};

	/**
	 * Select all items in "MultiSelection" mode.
	 * @returns {sap.m.UploadCollection} this to allow method changing
	 * @since 1.34.0
	 * @public
	 */
	UploadCollection.prototype.selectAll = function() {
		var aSelectedList = this._oList.selectAll();
		if (aSelectedList.getItems().length !== this.getItems().length) {
			Log.info("Internal 'List' and external 'UploadCollection' are not in sync.");
		}
		this._setSelectedForItems(this.getItems(), true);
		return this;
	};

	/**
	 * Downloads the given item.
	 * This function delegates to {@link sap.m.UploadCollectionItem#download uploadCollectionItem.download}.
	 * @param {sap.m.UploadCollectionItem} uploadCollectionItem The item to download. This parameter is mandatory.
	 * @param {boolean} askForLocation Decides whether to ask for a location to download or not.
	 * @returns {boolean} True if the download has started successfully. False if the download couldn't be started.
	 * @since 1.36.0
	 * @public
	 */
	UploadCollection.prototype.downloadItem = function(uploadCollectionItem, askForLocation) {
		if (!this.getInstantUpload()) {
			Log.info("Download is not possible on Pending Upload mode");
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
	 * @returns {sap.m.UploadCollection} this to allow method chaining
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
					Log.warning("Version Upload cannot be used in multiple upload mode");
				}
			} else {
				this._oFileUploader.$().find("input[type=file]").trigger("click");
			}
		}
		return this;
	};

	UploadCollection.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
		var oFileFromDragDrop, iIndexOfFile, aItems;
		if (!this.getInstantUpload() && sAggregationName === "items" && vObject) {
			oFileFromDragDrop = vObject._internalFileIdWithinDragDropArray;
			// if the deleted file is from drag and drop, removes it from the drag and drop array
			if (oFileFromDragDrop) {
				iIndexOfFile = this._aFilesFromDragAndDropForPendingUpload.indexOf(oFileFromDragDrop);
				if (iIndexOfFile !== -1) {
					this._aFilesFromDragAndDropForPendingUpload.splice(iIndexOfFile, 1);
				}
			} else if (jQuery.isNumeric(vObject)) {
				aItems = this.getItems();
				this._aDeletedItemForPendingUpload.push(aItems[vObject]);
			} else {
				this._aDeletedItemForPendingUpload.push(vObject);
			}
		}

		return Control.prototype.removeAggregation.apply(this, arguments);
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
		return Control.prototype.removeAllAggregation.apply(this, arguments);
	};

	/* =========================================================== */
	/* Lifecycle methods                                           */
	/* =========================================================== */

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

		// enable/disable FileUploader according to error state
		if (this.sErrorState !== "Error") {
			if (this.getUploadEnabled() !== this._oFileUploader.getEnabled()) {
				this._oFileUploader.setEnabled(this.getUploadEnabled());
			}
		} else {
			this._oFileUploader.setEnabled(false);
		}

		if (this.sDeletedItemId) {
			jQuery(document.activeElement).blur();
		}

		// This function checks if instantUpload needs to be set. In case of the properties like fileType are set by the
		// model instead of the constructor, the setting happens later and is still valid. To support this as well, you
		// need to wait for modification until the first rendering.
		function checkInstantUpload() {
			if (this.bInstantUpload === false) {
				this.setProperty("instantUpload", this.bInstantUpload, true);
				delete this.bInstantUpload;
			}
		}
	};

	UploadCollection.prototype.onAfterRendering = function() {
		this._bindDragEnterLeave();

		if (this.getInstantUpload()) {
			if (this.aItems || (this.aItems === this.getItems())) {
				if (this.editModeItem) {
					var $oEditBox = jQuery(document.getElementById(this.editModeItem + "-ta_editFileName-inner"));
					if ($oEditBox) {
						var sId = this.editModeItem;
						if (!Device.os.ios) {
							$oEditBox.focus(function() {
								$oEditBox.selectText(0, $oEditBox.val().length);
							});
						}
						$oEditBox.focus();
						this._oListEventDelegate = {
							onclick: function(event) {
								this._handleClick(event, sId);
							}.bind(this)
						};
						this._oList.addDelegate(this._oListEventDelegate);
					}
				} else if (this.sFocusId) {
					//set focus on line item after status = Edit
					this._setFocusToLineItem(this.sFocusId);
					this.sFocusId = null;
				} else if (this.sDeletedItemId) {
					//set focus on line item after an item was deleted
					this._setFocusAfterDeletion();
				}
			}
		} else if (this.sFocusId) {
			//set focus after removal of file from upload list
			this._setFocusToLineItem(this.sFocusId);
			this.sFocusId = null;
		}
	};

	UploadCollection.prototype.exit = function() {
		var i, iPendingUploadsNumber, oItemToDestroy;
		// _unbindDragEnterLeave has to be called before setting $RootNode to null, because if $RootNode is null, the unbind will only partially be performed as it depends on $RootNode
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
	 * @param {jQuery.Event} event The jQuery event object
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
	 * @param {jQuery.Event} event The jQuery event object
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
	 * @param {jQuery.Event} event The jQuery event object
	 * @private
	 */
	UploadCollection.prototype._onDragLeaveUIArea = function(event) {
		if (this._oLastEnterUIArea === event.target) {
			this._$DragDropArea.addClass("sapMUCDragDropOverlayHide");
		}
	};

	/**
	 * Handler when file is dropped on UIArea.
	 * @param {jQuery.Event} event The jQuery event object
	 * @private
	 */
	UploadCollection.prototype._onDropOnUIArea = function(event) {
		this._$DragDropArea.addClass("sapMUCDragDropOverlayHide");
	};

	/**
	 * Handler when file is dragged in UploadCollection drop enabled area.
	 * @param {jQuery.Event} event The jQuery event object
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
	 * @param {jQuery.Event} event The jQuery event object
	 * @private
	 */
	UploadCollection.prototype._onDragOverUploadCollection = function(event) {
		event.preventDefault();
		event.originalEvent.dataTransfer.dropEffect = "copy";
	};

	/**
	 * Handler when file is dragged away from UploadCollection drop enabled area.
	 * @param {jQuery.Event} event The jQuery event object
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
	 * @param {jQuery.Event} event The jQuery event object.
	 * @returns {boolean} True if at least one file exists
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
	 * @param {jQuery.Event} event The jQuery event object
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
	 * @private
	 */
	UploadCollection.prototype._adjustDragDropIcon = function() {
		// Icon is displayed when the drag enabled area more than 10rem(160px)
		if (this._$DragDropArea[0].offsetHeight < 160) {
			this.getAggregation("_dragDropIcon").$().hide();
		}
	};

	/**
	 * Deregisters the onResize and orientation handlers.
	 * @private
	 */
	UploadCollection.prototype._deregisterSizeHandler = function() {
		Device.orientation.detachHandler(this._onResize, this);
		ResizeHandler.deregister(this._sReziseHandlerId);
	};

	/**
	 * Hides FileUploader instance after OverflowToolbar is rendered.
	 * @private
	 */
	UploadCollection.prototype._hideFileUploaders = function() {
		var iToolbarElements, i;
		if (!this.getInstantUpload()) {
			iToolbarElements = this._oHeaderToolbar.getContent().length;
			if (this._aFileUploadersForPendingUpload.length) {
				for (i = 0; i < iToolbarElements; i++) {
					// Only the newest instance of FileUploader is useful, which will be in the place holder position.
					// Other ones can be hidden.
					if (this._oHeaderToolbar.getContent()[i] instanceof FileUploader) {
						if (i === this._iFileUploaderPH && this._bFocusFileUploader) {
							this._oHeaderToolbar.getContent()[i].$().find("button").focus();
						} else {
							this._oHeaderToolbar.getContent()[i].$().hide();
						}
					}
				}
			}
		}
	};

	/**
	 * Truncates the file name maximum width based on markers' width.
	 * @private
	 * @param {sap.m.UploadCollectionItem} item The item to truncate the file name of
	 */
	UploadCollection.prototype._truncateFileName = function(item) {
		if (!item) {
			return;
		}

		if (item._status === "Edit") {
			item._oListItem.$().find(".sapMUCObjectMarkerContainer").attr("style", "display: none");
			return;
		}
		var iMarkersWidth = 0;
		var aMarkers = item.getMarkers();
		var sStyle;
		for (var i = 0; i < aMarkers.length; i++) {
			iMarkersWidth = iMarkersWidth + aMarkers[i].$().width() + UploadCollection._markerMargin;
		}
		if (iMarkersWidth > 0) {
			var $FileName = item._oFileNameLink.$();
			if ($FileName) {
				sStyle = "max-width: calc(100% - " + iMarkersWidth + "px)";
				if ($FileName.attr("style") !== sStyle) {
					$FileName.attr("style", sStyle);
				}
			}
		}
	};

	/**
	 * Creates or gets a Toolbar
	 * @param {int} count Number of items in the list
	 * @private
	 */
	UploadCollection.prototype._getListHeader = function(count) {
		var oFileUploader, i;
		this._setNumberOfAttachmentsTitle(count);
		if (!this._oHeaderToolbar) {
			if (!!this._oFileUploader && !this.getInstantUpload()) {
				this._oFileUploader.destroy();
			}
			oFileUploader = this._getFileUploader();
			this._oHeaderToolbar = this.getAggregation("toolbar");
			if (!this._oHeaderToolbar) {
				this._oHeaderToolbar = new OverflowToolbar(this.getId() + "-toolbar", {
					content: [this._oNumberOfAttachmentsTitle, new ToolbarSpacer(), oFileUploader]
				}).addEventDelegate({
					onAfterRendering: this._hideFileUploaders
				}, this);
				this._iFileUploaderPH = 2;
			} else {
				this._oHeaderToolbar.addEventDelegate({
					onAfterRendering: this._hideFileUploaders
				}, this);
				this._iFileUploaderPH = this._getFileUploaderPlaceHolderPosition(this._oHeaderToolbar);
				if (this._oHeaderToolbar && this._iFileUploaderPH > -1) {
					this._setFileUploaderInToolbar(oFileUploader);
				} else {
					Log.info("A place holder of type 'sap.m.UploadCollectionPlaceholder' needs to be provided.");
				}
			}
		} else if (!this.getInstantUpload()) {
			//create a new FU Instance only if the current FU instance has been used for selection of a file for the future upload.
			//If the method is called after an item has been deleted from the list there is no need to create a new FU instance.
			var iPendingUploadsNumber = this._aFileUploadersForPendingUpload.length;
			for (i = iPendingUploadsNumber - 1; i >= 0; i--) {
				if (this._aFileUploadersForPendingUpload[i].getId() === this._oFileUploader.getId()) {
					oFileUploader = this._getFileUploader();
					this._oHeaderToolbar.insertAggregation("content", oFileUploader, this._iFileUploaderPH, true);
					break;
				}
			}
		}
	};

	/**
	 * Gives the position of the place holder for the FileUploader that every toolbar provided by the application must have.
	 * @param {sap.m.OverflowToolbar} toolbar Toolbar where to find the placeholder
	 * @return {int} The position of the place holder or -1 if there's no placeholder.
	 * @private
	 */
	UploadCollection.prototype._getFileUploaderPlaceHolderPosition = function(toolbar) {
		for (var i = 0; i < toolbar.getContent().length; i++) {
			if (toolbar.getContent()[i] instanceof UploadCollectionToolbarPlaceholder) {
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
	UploadCollection.prototype._setFileUploaderInToolbar = function(fileUploader) {
		this._oHeaderToolbar.getContent()[this._iFileUploaderPH].setVisible(false);
		this._oHeaderToolbar.insertContent(fileUploader, this._iFileUploaderPH);
	};

	/**
	 * Map an item to the list item.
	 * @param {sap.m.UploadCollectionItem} item Base information to generate the list items
	 * @returns {sap.m.CustomListItem | null} List item which will be displayed
	 * @private
	 */
	UploadCollection.prototype._mapItemToListItem = function(item) {
		// If there is no item or an item is being updated, return null.
		if (!item || (this._oItemToUpdate && item.getId() === this._oItemToUpdate.getId())) {
			return null;
		}
		var sItemId,
			sStatus,
			sFileNameLong,
			oBusyIndicator,
			oListItem,
			sContainerId,
			$container,
			oContainer,
			oItemIcon;

		sItemId = item.getId();
		sStatus = item._status;
		sFileNameLong = item.getFileName();

		if (sStatus === UploadCollection._uploadingStatus) {
			oBusyIndicator = new BusyIndicator({
				id: sItemId + "-ia_indicator"
			});
			oBusyIndicator.addStyleClass("sapMUCloadingIcon");
		} else {
			oItemIcon = this._createIcon(item, sItemId, sFileNameLong);
		}

		sContainerId = sItemId + "-container";
		// UploadCollection has to destroy the container as sap.ui.core.HTML is preserved by default which leads to problems at rerendering
		$container = jQuery(document.getElementById(sContainerId));
		if ($container) {
			$container.remove();
			$container = null;
		}

		oContainer = new HTML({
			content: "<span id=" + sContainerId + " class='sapMUCTextButtonContainer'></span>",
			afterRendering: this._renderContent.bind(this, item, sContainerId)
		});
		oListItem = new CustomListItem(sItemId + "-cli", {
			content: [oBusyIndicator, oItemIcon, oContainer],
			selected: item.getSelected()
		});

		oListItem._oUploadCollectionItem = item;
		oListItem._status = sStatus;
		oListItem.addStyleClass("sapMUCItem");
		oListItem.setTooltip(item.getTooltip_Text());
		item._oListItem = oListItem;

		return oListItem;
	};

	/**
	 * Renders fileName, attributes, statuses and buttons(except for IE9) into the oContainer. Later it should be moved to the UploadCollectionItemRenderer.
	 * @param {sap.m.UploadCollectionItem} item Base information to generate the list items
	 * @param {string} containerId ID of the container where the content will be rendered to
	 * @private
	 */
	UploadCollection.prototype._renderContent = function(item, containerId) {
		var sItemId,
			i,
			iAttrCounter,
			iStatusesCounter,
			iMarkersCounter,
			sPercentUploaded,
			aAttributes,
			aStatuses,
			oRm,
			sStatus,
			aMarkers;

		sPercentUploaded = item._percentUploaded;
		aAttributes = item.getAllAttributes();
		aStatuses = item.getStatuses();
		aMarkers = item.getMarkers();
		sItemId = item.getId();
		iAttrCounter = aAttributes.length;
		iStatusesCounter = aStatuses.length;
		iMarkersCounter = aMarkers.length;
		sStatus = item._status;

		oRm = this._RenderManager;
		oRm.write("<div class=\"sapMUCTextContainer "); // text container for fileName, attributes and statuses
		if (sStatus === "Edit") {
			oRm.write("sapMUCEditMode ");
		}
		oRm.write("\" >");
		oRm.renderControl(this._getFileNameControl(item));
		// if status is uploading only the progress label is displayed under the Filename
		if (sStatus === UploadCollection._uploadingStatus) {
			oRm.renderControl(this._createProgressLabel(item, sPercentUploaded));
		} else {
			if (iMarkersCounter > 0) {
				oRm.write("<div class=\"sapMUCObjectMarkerContainer\">");// begin of markers container
				for (i = 0; i < iMarkersCounter; i++) {
					oRm.renderControl(aMarkers[i].addStyleClass("sapMUCObjectMarker"));
				}
				oRm.write("</div>");// end of markers container
			}
			if (iAttrCounter > 0) {
				oRm.write("<div class=\"sapMUCAttrContainer\" tabindex=\"0\">"); // begin of attributes container
				for (i = 0; i < iAttrCounter; i++) {
					aAttributes[i].addStyleClass("sapMUCAttr");
					oRm.renderControl(aAttributes[i]);
					if ((i + 1) < iAttrCounter) {
						oRm.write("<div class=\"sapMUCSeparator\">&nbsp&#x00B7&#160</div>"); // separator between attributes
					}
				}
				oRm.write("</div>"); // end of attributes container
			}
			if (iStatusesCounter > 0) {
				oRm.write("<div class=\"sapMUCStatusContainer\" tabindex=\"0\">"); // begin of statuses container
				for (i = 0; i < iStatusesCounter; i++) {
					aStatuses[i].detachBrowserEvent("hover");
					aStatuses[i].setTooltip(aStatuses[i].getTitle() +  ":" + aStatuses[i].getText());
					oRm.renderControl(aStatuses[i]);
					if ((i + 1) < iStatusesCounter) {
						oRm.write("<div class=\"sapMUCSeparator\">&nbsp&#x00B7&#160</div>"); // separator between statuses
					}
				}
				oRm.write("</div>"); // end of statuses container
			}
		}
		oRm.write("</div>"); // end of container for Filename, attributes and statuses
		this._renderButtons(oRm, item, sStatus, sItemId);
		oRm.flush(jQuery(document.getElementById(containerId))[0], true); // after removal to UploadCollectionItemRenderer delete this line
		this._truncateFileName(item);
		this._sReziseHandlerId = ResizeHandler.register(this, this._onResize.bind(this));
		Device.orientation.attachHandler(this._onResize, this);
	};

	/**
	 * Renders buttons of the item in scope.
	 * @param {object} oRm Render manager
	 * @param {sap.m.UploadCollectionItem} item Item in scope
	 * @param {string} status Internal status of the item in scope
	 * @param {string} itemId ID of the container where the content will be rendered to
	 * @private
	 */
	UploadCollection.prototype._renderButtons = function(oRm, item, status, itemId) {
		var aButtons, iButtonCounter;

		aButtons = this._getButtons(item, status, itemId);
		if (aButtons) {
			iButtonCounter = aButtons.length;
		}
		// render div container only if there is at least one button
		if (iButtonCounter > 0) {
			oRm.write("<div class=\"sapMUCButtonContainer\">"); //begin of div for buttons
			for (var i = 0; i < iButtonCounter; i++) {
				if ((i + 1) < iButtonCounter) { // if both buttons are displayed
					aButtons[i].addStyleClass("sapMUCFirstButton");
				}
				oRm.renderControl(aButtons[i]);
			}
			oRm.write("</div>"); // end of div for buttons
		}
	};

	/**
	 * Gets a file name which is an sap.m.Link in display mode and an sap.m.Input with a description (file extension) in edit mode
	 * @param {sap.m.UploadCollectionItem} item Base information to generate the list items
	 * @return {sap.m.Link | sap.m.Input} oFileName is a file name of sap.m.Link type in display mode and sap.m.Input type in edit mode
	 * @private
	 */
	UploadCollection.prototype._getFileNameControl = function(item) {
		var oFileName,
			oFile,
			sFileName,
			sFileNameLong,
			sItemId,
			sStatus,
			iMaxLength,
			sValueState,
			bShowValueStateMessage,
			oFileNameEditBox,
			sValueStateText;

		sFileNameLong = item.getFileName();
		sItemId = item.getId();
		sStatus = item._status;

		if (sStatus !== "Edit") {
			oFileName = item._getFileNameLink ? item._getFileNameLink() : item._getControl("sap.m.Link", {
				id: sItemId + "-ta_filenameHL",
				press: [item, this._onItemPressed, this]
			}, "FileNameLink");
			oFileName.setEnabled(this._getItemPressEnabled(item));
			oFileName.addStyleClass("sapMUCFileName");
			oFileName.setModel(item.getModel());
			oFileName.setText(sFileNameLong);
			item._oFileNameLink = oFileName;

			return oFileName;
		} else {
			oFile = UploadCollection._splitFilename(sFileNameLong);
			iMaxLength = this.getMaximumFilenameLength();
			sValueState = "None";
			bShowValueStateMessage = false;
			sFileName = oFile.name;

			if (item.errorState === "Error") {
				bShowValueStateMessage = true;
				sValueState = "Error";
				sFileName = item.changedFileName;
				if (sFileName.length === 0) {
					sValueStateText = this._oRb.getText("UPLOADCOLLECTION_TYPE_FILENAME");
				} else {
					sValueStateText = this._oRb.getText("UPLOADCOLLECTION_EXISTS");
				}
			}

			oFileNameEditBox = item._getFileNameEditBox ? item._getFileNameEditBox() : item._getControl("sap.m.Input", {
				id: sItemId + "-ta_editFileName",
				type: Library.InputType.Text
			}, "FileNameEditBox");
			oFileNameEditBox.addStyleClass("sapMUCEditBox");
			oFileNameEditBox.setModel(item.getModel());
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
	 * Checks if item can be pressed.
	 * @param {sap.m.UploadCollectionItem} item The item being processed
	 * @return {boolean} True if item press is enabled.
	 * @private
	 */
	UploadCollection.prototype._getItemPressEnabled = function(item) {
		return item._getPressEnabled() && this.sErrorState !== "Error";
	};

	/**
	 * Selects press handler depending on listener
	 * @param {sap.ui.base.Event} event The event object of the press event
	 * @param {sap.m.UploadCollectionItem} item The item being processed
	 * @private
	 */
	UploadCollection.prototype._onItemPressed = function(event, item) {
		if (item.hasListeners("press")) {
			item.firePress();
		} else if (this.sErrorState !== "Error" && jQuery.trim(item.getProperty("url"))) {
			this._triggerLink(event, item);
		}
	};

	/**
	 * Creates a label for upload progress
	 * @param {sap.m.UploadCollectionItem} item The item being processed
	 * @param {string} percentUploaded The percentage to be shown in the label
	 * @return {sap.m.Label} oProgressLabel
	 * @private
	 */
	UploadCollection.prototype._createProgressLabel = function(item, percentUploaded) {
		var oProgressLabel,
			sItemId = item.getId();

		oProgressLabel = item._getProgressLabel ? item._getProgressLabel() : item._getControl("sap.m.Label", {
			id: sItemId + "-ta_progress"
		}, "ProgressLabel").addStyleClass("sapMUCProgress");
		oProgressLabel.setText(this._oRb.getText("UPLOADCOLLECTION_UPLOADING", [percentUploaded]));

		return oProgressLabel;
	};

	/**
	 * Creates an icon or image
	 * @param {sap.m.UploadCollectionItem} item Base information to generate the list items
	 * @param {string} itemId The ID of the item being processed
	 * @param {string} longFileName The whole file name
	 * @return {sap.m.Image | sap.ui.core.Icon} oItemIcon
	 * @private
	 */
	UploadCollection.prototype._createIcon = function(item, itemId, longFileName) {
		var sThumbnailUrl, sThumbnail, oItemIcon, sStyleClass;

		sThumbnailUrl = item.getThumbnailUrl();
		if (sThumbnailUrl) {
			oItemIcon = IconPool.createControlByURI({
				id: itemId + "-ia_imageHL",
				src: this._getThumbnail(sThumbnailUrl, longFileName),
				decorative: false
			}, Image).addStyleClass("sapMUCItemImage sapMUCItemIcon");
			oItemIcon.setAlt(this._getAriaLabelForPicture(item)); //Set the alt property directly to avoid some additional logic in the icon's constructor
		} else {
			sThumbnail = this._getThumbnail(undefined, longFileName);
			oItemIcon = new Icon(itemId + "-ia_iconHL", {
				src: sThumbnail,
				decorative: false,
				useIconTooltip: false
			});
			oItemIcon.setAlt(this._getAriaLabelForPicture(item)); //Set the alt property directly to avoid some additional logic in the icon's constructor
			//Sets the right style class depending on the icon/placeholder status (clickable or not)
			if (this.sErrorState !== "Error" && jQuery.trim(item.getProperty("url"))) {
				sStyleClass = "sapMUCItemIcon";
			} else {
				sStyleClass = "sapMUCItemIconInactive";
			}
			if (sThumbnail === UploadCollection._placeholderCamera) {
				if (this.sErrorState !== "Error" && jQuery.trim(item.getProperty("url"))) {
					sStyleClass = sStyleClass + " sapMUCItemPlaceholder";
				} else {
					sStyleClass = sStyleClass + " sapMUCItemPlaceholderInactive";
				}
			}
			oItemIcon.addStyleClass(sStyleClass);
		}
		if (this._getItemPressEnabled(item)) {
			oItemIcon.attachPress(item, this._onItemPressed, this);
		}
		return oItemIcon;
	};

	/**
	 * Gets Edit and Delete Buttons
	 * @param {sap.m.UploadCollectionItem} item Base information to generate the list items
	 * @param {string} status The status of the item: edit, display, uploading
	 * @param {string} itemId The ID of the item being processed
	 * @return {sap.m.Button[]} An array containing the buttons which are to be shown
	 * @private
	 */
	UploadCollection.prototype._getButtons = function(item, status, itemId) {
		var aButtons, oOkButton, oCancelButton, sButton, oDeleteButton, bEnabled, oEditButton;

		aButtons = [];
		if (!this.getInstantUpload()) { // in case of pending upload we always have only "delete" button (no "edit" button)
			sButton = "deleteButton";
			oDeleteButton = this._createDeleteButton(itemId, sButton, item, this.sErrorState);
			aButtons.push(oDeleteButton);
			return aButtons;
		}

		if (status === "Edit") {

			oOkButton = item._getOkButton ? item._getOkButton() : item._getControl("sap.m.Button", {
				id: itemId + "-okButton",
				text: this._oRb.getText("UPLOADCOLLECTION_RENAMEBUTTON_TEXT"),
				type: Library.ButtonType.Transparent
			}, "OkButton").addStyleClass("sapMUCOkBtn");

			oCancelButton = item._getCancelButton ? item._getCancelButton() : item._getControl("sap.m.Button", {
				id: itemId + "-cancelButton",
				text: this._oRb.getText("UPLOADCOLLECTION_CANCELBUTTON_TEXT"),
				type: Library.ButtonType.Transparent
			}, "CancelButton").addStyleClass("sapMUCCancelBtn");

			aButtons.push(oOkButton);
			aButtons.push(oCancelButton);
		} else if (status === UploadCollection._uploadingStatus) {
			sButton = "terminateButton";
			oDeleteButton = this._createDeleteButton(itemId, sButton, item, this.sErrorState);
			aButtons.push(oDeleteButton);
		} else {
			bEnabled = item.getEnableEdit();
			if (this.sErrorState === "Error") {
				bEnabled = false;
			}

			if (item.getVisibleEdit()) { // if the Edit button is invisible we do not need to render it
				oEditButton = item._getEditButton ? item._getEditButton() : item._getControl("sap.m.Button", {
					id: itemId + "-editButton",
					icon: "sap-icon://edit",
					type: Library.ButtonType.Standard,
					tooltip: this._oRb.getText("UPLOADCOLLECTION_EDITBUTTON_TEXT"),
					press: [item, this._handleEdit, this]
				}, "EditButton").addStyleClass("sapMUCEditBtn");
				oEditButton.setEnabled(bEnabled);
				oEditButton.setVisible(item.getVisibleEdit());
				aButtons.push(oEditButton);
			}

			sButton = "deleteButton";
			if (item.getVisibleDelete()) { // if the Delete button is invisible we do not need to render it
				oDeleteButton = this._createDeleteButton(itemId, sButton, item, this.sErrorState);
				aButtons.push(oDeleteButton);
			}
		}
		return aButtons;
	};

	/**
	 * Creates a Delete button
	 * @param {string} [itemId] ID of the item
	 * @param {string} [buttonType]
	 *  if buttonType == "deleteButton" it is a Delete button for the already uploaded file
	 *  if buttonType == "terminateButton" it is a button to terminate the upload of the file being uploaded
	 * @param {sap.m.UploadCollectionItem} item Item in scope
	 * @param {string} errorState Internal error status
	 * @return {sap.m.Button} The delete button
	 * @private
	 */
	UploadCollection.prototype._createDeleteButton = function(itemId, buttonType, item, errorState) {
		var bEnabled, oDeleteButton, sGetterName, sTooltip, fnGetter, bVisible, fnPressHandler;

		bEnabled = item.getEnableDelete();
		if (errorState === "Error") {
			bEnabled = false;
		}
		if (buttonType === "deleteButton") {
			sGetterName = "DeleteButton";
			fnGetter = item._getDeleteButton;
			sTooltip = this._oRb.getText("UPLOADCOLLECTION_DELETEBUTTON_TEXT");
			bVisible = item.getVisibleDelete();
			fnPressHandler = [this, this._handleDelete, this];
		} else {
			sGetterName = "TerminateButton";
			fnGetter = item._getTerminateButton;
			sTooltip = this._oRb.getText("UPLOADCOLLECTION_TERMINATEBUTTON_TEXT");
			bVisible = this.getTerminationEnabled();
			fnPressHandler = [item, this._handleTerminate, this];
		}

		oDeleteButton = fnGetter ? fnGetter() : item._getControl("sap.m.Button", {
			id: itemId + "-" + buttonType,
			icon: "sap-icon://sys-cancel",
			type: Library.ButtonType.Standard,
			press: fnPressHandler
		}, sGetterName).addStyleClass("sapMUCDeleteBtn");
		oDeleteButton.setVisible(bVisible);
		oDeleteButton.setEnabled(bEnabled);
		oDeleteButton.setTooltip(sTooltip);

		return oDeleteButton;
	};

	/**
	 * Fill the list with items.
	 * @param {sap.m.UploadCollectionItem[]} items The UploadCollectionItems the internal list is to be filled with
	 * @private
	 */
	UploadCollection.prototype._fillList = function(items) {
		var that = this,
			iMaxIndex = items.length - 1,
			oItemsBinding = this.getBinding("items"),
			bGroupCreated = false,
			sGroupKey,
			sModelName = this.getBindingInfo("items") ? this.getBindingInfo("items").model : undefined,
			fnGroupHeader = this.getBindingInfo("items") ? this.getBindingInfo("items").groupHeaderFactory : null;
		var fnGroup = function(oItem) {
			//Added sModelName to consider named model cases if empty default model is picked without checking model bind to items.
			return oItem.getBindingContext(sModelName) ? oItemsBinding.getGroup(oItem.getBindingContext(sModelName)) : null;
		};
		var fnGroupKey = function(item) {
			return fnGroup(item) && fnGroup(item).key;
		};

		jQuery.each(items, function(index, item) {
			// grouping
			if (oItemsBinding && oItemsBinding.isGrouped() && item) {
				if (!bGroupCreated || sGroupKey !== fnGroupKey(item)) {
					if (fnGroupHeader) {
						that._oList.addItemGroup(fnGroup(item), fnGroupHeader(fnGroup(item)), true);
					} else if (fnGroup(item)) {
						that._oList.addItemGroup(fnGroup(item), null, true);
					}
					bGroupCreated = true;
					sGroupKey = fnGroupKey(item);
				}
			}
			if (!item._status || !item.getVisibleEdit()) {
				//Set default status value -> UploadCollection._displayStatus
				item._status = UploadCollection._displayStatus;
			} else if (that.getInstantUpload() && that._oItemForDelete &&
				that._oItemForDelete._status === UploadCollection._toBeDeletedStatus &&
				item.getDocumentId() === that._oItemForDelete.documentId) {
				return false;
			}
			if (!item._percentUploaded && item._status === UploadCollection._uploadingStatus) {
				//Set default percent uploaded
				item._percentUploaded = 0;
			}
			// Add a private property to the added item containing a reference
			// to the corresponding mapped item.
			var oListItem = that._mapItemToListItem(item);
			if (oListItem) {
				if (index === 0 && iMaxIndex === 0) {
					oListItem.addStyleClass("sapMUCListSingleItem");
				} else if (index === 0) {
					oListItem.addStyleClass("sapMUCListFirstItem");
				} else if (index === iMaxIndex) {
					oListItem.addStyleClass("sapMUCListLastItem");
				} else {
					oListItem.addStyleClass("sapMUCListItem");
				}

				// Add the mapped item to the list
				that._oList.addAggregation("items", oListItem, true); // note: suppress re-rendering

				// Handles item selected event.
				item.attachEvent("selected", that._handleItemSetSelected, that);
			}

			return true;
		});
	};

	/**
	 * Destroy the items in the List.
	 * @private
	 */
	UploadCollection.prototype._clearList = function() {
		if (this._oList) {
			this._oList.destroyAggregation("items", true);	// note: suppress re-rendering
		}
	};

	/**
	 * Access and initialization for title number of attachments. Sets internal value.
	 * @param {int} [count=0] Number of attachments
	 * @private
	 */
	UploadCollection.prototype._setNumberOfAttachmentsTitle = function(count) {
		var nItems = count || 0;
		var sText;
		// When a file is being updated to a new version, there is one more file on the server than in the list so this corrects that mismatch.
		if (this._oItemToUpdate) {
			nItems--;
		}
		if (this.getNumberOfAttachmentsText()) {
			sText = this.getNumberOfAttachmentsText();
		} else {
			sText = this._oRb.getText("UPLOADCOLLECTION_ATTACHMENTS", [nItems]);
		}
		if (!this._oNumberOfAttachmentsTitle) {
			this._oNumberOfAttachmentsTitle = new Title(this.getId() + "-numberOfAttachmentsTitle", {
				text: sText
			});
		} else {
			this._oNumberOfAttachmentsTitle.setText(sText);
		}
	};

	/**
	 * Makes file upload button invisible.
	 * @param {boolean} uploadButtonInvisible Defines whether the upload button is visible or not.
	 * @private
	 */
	UploadCollection.prototype._setFileUploaderVisibility = function(uploadButtonInvisible) {
		var aToolbarElements = this._oHeaderToolbar.getContent();

		if (aToolbarElements) {
			var oPlaceHolder = aToolbarElements[this._iFileUploaderPH];
			if (oPlaceHolder instanceof FileUploader) {
				oPlaceHolder.setVisible(!uploadButtonInvisible);
			}
		}
	};

	/* =========================================================== */
	/* Handle UploadCollection events                              */
	/* =========================================================== */
	/**
	 * Handling of the deletion of an uploaded file
	 * @param {object} event Event of the deletion
	 * @private
	 */
	UploadCollection.prototype._handleDelete = function(event) {
		var oParams = event.getParameters();
		var aItems = this.getItems();
		var sItemId = oParams.id.split("-deleteButton")[0];
		var oItemForDelete;
		var iIndex;
		var sCompact = "";
		var sFileName;
		var sMessageText;

		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].sId === sItemId) {
				iIndex = i;
				oItemForDelete = {
					documentId: aItems[i].getDocumentId(),
					_iLineNumber: iIndex
				};
				break;
			}
		}
		if (aItems[iIndex].hasListeners("deletePress")) {
			aItems[iIndex].fireDeletePress();
			return;
		}
		this.sDeletedItemId = sItemId;
		if (jQuery(document.getElementById(this.sId)).hasClass("sapUiSizeCompact")) {
			sCompact = "sapUiSizeCompact";
		}

		if (this.editModeItem) {
			//In case there is a list item in edit mode, the edit mode has to be finished first.
			this._handleOk(event, this.editModeItem, true);
			if (this.sErrorState === "Error") {
				//If there is an error, the deletion must not be triggered
				return;
			}
		}

		if (aItems[iIndex] && aItems[iIndex].getEnableDelete()) {
			// popup delete file
			sFileName = aItems[iIndex].getFileName();
			if (!sFileName) {
				sMessageText = this._oRb.getText("UPLOADCOLLECTION_DELETE_WITHOUT_FILENAME_TEXT");
			} else {
				sMessageText = this._oRb.getText("UPLOADCOLLECTION_DELETE_TEXT", sFileName);
			}
			this._oItemForDelete = oItemForDelete;
			MessageBox.show(sMessageText, {
				title: this._oRb.getText("UPLOADCOLLECTION_DELETE_TITLE"),
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				onClose: this._onCloseMessageBoxDeleteItem.bind(this),
				dialogId: "messageBoxDeleteFile",
				styleClass: sCompact
			});
		}
	};

	/**
	 * Handling of the termination of an uploading file
	 * @param {sap.m.MessageBox.Action} action Action to be executed at closing the message box
	 * @private
	 */
	UploadCollection.prototype._onCloseMessageBoxDeleteItem = function(action) {
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
		if (action === MessageBox.Action.OK) {
			this._oItemForDelete._status = UploadCollection._toBeDeletedStatus;
			if (this.getInstantUpload()) {
				// fire event
				this.fireFileDeleted({
					// deprecated
					documentId: this._oItemForDelete.documentId,
					// new
					item: oItemToBeDeleted
				});
				// do not save the item after the item is deleted in instant mode
				this._oItemForDelete = null;
			} else {
				if (this.aItems.length === 1) {
					if (!this.getUploadButtonInvisible()) {
						this.sFocusId = this._oFileUploader.$().find(":button")[0].id;
					}
				} else if (this._oItemForDelete._iLineNumber < this.aItems.length - 1) {
					this.sFocusId = this.aItems[this._oItemForDelete._iLineNumber + 1].getId() + "-cli";
				} else {
					this.sFocusId = this.aItems[0].getId() + "-cli";
				}
				this._aDeletedItemForPendingUpload.push(oItemToBeDeleted);
				this.aItems.splice(this._oItemForDelete._iLineNumber, 1);
				this.removeAggregation("items", oItemToBeDeleted, false);
			}
		}
	};

	/**
	 * Handling of termination of an uploading process
	 * @param {sap.ui.base.Event} event Event of the upload termination
	 * @param {sap.m.UploadCollectionItem} item Context of the upload termination
	 * @private
	 */
	UploadCollection.prototype._handleTerminate = function(event, item) {
		var oFileList, oDialog;
        oFileList = new List({
            items: [
                new StandardListItem({
                    icon: this._getIconFromFilename(item.getFileName())
                })
            ]
        });
        //For handling curly braces in file name we have to use setter.Otherwise it will be treated as binding.
        oFileList.getItems()[0].setTitle(item.getFileName());

		oDialog = new Dialog({
			id: this.getId() + "deleteDialog",
			title: this._oRb.getText("UPLOADCOLLECTION_TERMINATE_TITLE"),
			content: [
				new Text({
					text: this._oRb.getText("UPLOADCOLLECTION_TERMINATE_TEXT")
				}),
				oFileList
			],
			buttons: [
				new Button({
					text: this._oRb.getText("UPLOADCOLLECTION_OKBUTTON_TEXT"),
					press: [onPressOk, this]
				}),
				new Button({
					text: this._oRb.getText("UPLOADCOLLECTION_CANCELBUTTON_TEXT"),
					press: function() {
						oDialog.close();
					}
				})
			],
			afterClose: function() {
				oDialog.destroy();
			}
		}).open();

		function onPressOk() {
			var bAbort = false;
			// if the file is already loaded send a delete request to the application
			for (var i = 0; i < this.aItems.length; i++) {
				if (this.aItems[i]._status === UploadCollection._uploadingStatus &&
					this.aItems[i]._requestIdName === item._requestIdName) {
					this.aItems[i]._status = UploadCollection._toBeDeletedStatus;
					this._oItemForDelete = this.aItems[i];
					bAbort = true;
					break;
				} else if (item.getFileName() === this.aItems[i].getFileName() &&
					this.aItems[i]._status === UploadCollection._displayStatus) {
					this.aItems[i]._status = UploadCollection._toBeDeletedStatus;
					this._oItemForDelete = this.aItems[i];
					this.fireFileDeleted({
						documentId: this.aItems[i].getDocumentId(),
						item: this.aItems[i]
					});
					break;
				}
			}
			// call FileUploader if abort is possible. Otherwise fireDelete should be called.
			if (bAbort) {
				this._getFileUploader().abort(this._headerParamConst.fileNameRequestIdName, this._encodeToAscii(item.getFileName()) + this._oItemForDelete._requestIdName);
			}
			oDialog.close();
			this.invalidate();
		}
	};

	/**
	 * Handling of event of the edit button
	 * @param {object} event Event of the edit button
	 * @param {object} oItem The Item in context of the edit button
	 * @private
	 */
	UploadCollection.prototype._handleEdit = function(event, oItem) {
		var i,
			sItemId = oItem.getId(),
			cItems = this.aItems.length;
		if (this.editModeItem) {
			this._handleOk(event, this.editModeItem, false);
		}
		if (this.sErrorState !== "Error") {
			for (i = 0; i < cItems; i++) {
				if (this.aItems[i].getId() === sItemId) {
					this.aItems[i]._status = "Edit";
					break;
				}
			}
			oItem._status = "Edit";
			this.editModeItem = event.getSource().getId().split("-editButton")[0];
			this.invalidate();
		}
	};

	/**
	 * Handling of 'click' of the list (items + header)
	 * @param {sap.ui.base.Event} event Event of the 'click'
	 * @param {string} itemId List item id/identifier where the click was triggered
	 * @private
	 */
	UploadCollection.prototype._handleClick = function(event, itemId) {
		// If the target of the click event is an editButton, then this case has already been processed
		// in the _handleEdit (in particular, by executing the _handleOk function).
		// Therefore, only the remaining cases of click event targets are handled.
		var $Button = jQuery(event.target).closest("button");
		var sId = "";
		if ($Button.length) {
			sId = $Button.prop("id");
		}
		if (sId.lastIndexOf("editButton") === -1) {
			if (sId.lastIndexOf("cancelButton") !== -1) {
				this._handleCancel(event, itemId);
			} else if (event.target.id.lastIndexOf("ia_imageHL") < 0 && event.target.id.lastIndexOf("ia_iconHL") < 0 &&
				event.target.id.lastIndexOf("deleteButton") < 0 && event.target.id.lastIndexOf("ta_editFileName-inner") < 0) {
				if (event.target.id.lastIndexOf("cli") > 0) {
					this.sFocusId = event.target.id;
				}
				this._handleOk(event, itemId, true);
			}
		}
	};

	/**
	 * Handling of 'OK' of the list item (status = 'Edit')
	 * @param {object} event Event of the 'OK' activity
	 * @param {string} itemId List item ID
	 * @param {boolean} invalidate Switch for to trigger the renderer
	 * @private
	 */
	UploadCollection.prototype._handleOk = function(event, itemId, invalidate) {
		var oEditbox = document.getElementById(itemId + "-ta_editFileName-inner");
		var sNewFileName;
		var oSourceItem = UploadCollection._findById(itemId, this.aItems);
		var sOrigFullFileName = oSourceItem.getProperty("fileName");
		var oFile = UploadCollection._splitFilename(sOrigFullFileName);
		var oInput = sap.ui.getCore().byId(itemId + "-ta_editFileName");
		var sErrorStateBefore = oSourceItem.errorState;
		var sChangedNameBefore = oSourceItem.changedFileName;

		// get new/changed file name and remove potential leading spaces
		if (oEditbox !== null) {
			sNewFileName = oEditbox.value.replace(/^\s+/, "");
		}

		this.sFocusId = itemId + "-cli";

		if (!sNewFileName || sNewFileName.length === 0) {
			if (oEditbox !== null) {
				this._setErrorStateOnItem(this, oSourceItem, sNewFileName, sChangedNameBefore, sErrorStateBefore);
			}
			return;
		}

		oSourceItem._status = UploadCollection._displayStatus;

		if (oFile.name === sNewFileName) {
			this._removeErrorStateFromItem(this, oSourceItem);
			// nothing changed -> nothing to do!
			if (invalidate) {
				this.invalidate();
			}
			return;
		}

		// here we have to check possible double items if it's necessary
		if (this.getSameFilenameAllowed()) {
			this._removeErrorStateFromItem(this, oSourceItem);
			this._oItemForRename = oSourceItem;
			this._onEditItemOk.bind(this)(sNewFileName + oFile.extension);
			return;
		}

		// Check double file name
		if (UploadCollection._checkDoubleFileName(sNewFileName + oFile.extension, this.aItems)) {
			oInput.setProperty("valueState", "Error", true);
			this._setErrorStateOnItem(this, oSourceItem, sNewFileName, sChangedNameBefore, sErrorStateBefore);
		} else {
			oInput.setProperty("valueState", "None", true);
			oSourceItem.changedFileName = null;
			this._removeErrorStateFromItem(this, oSourceItem);
			if (invalidate) {
				this.invalidate();
			}
			this._oItemForRename = oSourceItem;
			this._onEditItemOk.bind(this)(sNewFileName + oFile.extension);
		}

	};

	/**
	 * Sets the error state on the list item. This is usually done after an attempt to save the file with empty name or with a duplicated name if the double names are not allowed.
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
		if (sErrorStateBefore !== "Error" || sChangedNameBefore !== sNewFileName) {
			oContext.invalidate();
		}
	};

	/**
	 * Removes the error state from the list item. Used when the name of the file has been corrected.
	 * @private
	 * @param {object} oContext The UploadCollection instance on which an attempt was made to save a new name of an existing List item.
	 * @param {sap.m.UploadCollectionItem} oItem The List item on which the event was triggered.
	 */
	UploadCollection.prototype._removeErrorStateFromItem = function(oContext, oItem) {
		oItem.errorState = null;
		oContext.sErrorState = null;
		oContext.editModeItem = null;
	};

	/**
	 * Handling of edit item
	 * @param {string} sNewFileName New file name
	 * @private
	 */
	UploadCollection.prototype._onEditItemOk = function(sNewFileName) {
		if (this._oItemForRename) {
			this._oItemForRename.setFileName(sNewFileName);
			// fire event
			this.fireFileRenamed({
				// deprecated
				documentId: this._oItemForRename.getProperty("documentId"),
				fileName: sNewFileName,
				// new
				item: this._oItemForRename
			});
		}
		delete this._oItemForRename;
	};

	/**
	 * Handling of 'cancel' of the list item (status = 'Edit')
	 * @param {object} event Event of the 'cancel' activity
	 * @param {string} itemId List item ID
	 * @private
	 */
	UploadCollection.prototype._handleCancel = function(event, itemId) {
		var oItem = UploadCollection._findById(itemId, this.aItems);
		oItem._status = UploadCollection._displayStatus;
		oItem.errorState = null;
		oItem.changedFileName = oItem._getFileNameEditBox().getValue();
		this.sFocusId = this.editModeItem + "-cli";
		this.sErrorState = null;
		this.editModeItem = null;
		this.invalidate();
	};

	/* =========================================================== */
	/* Handle FileUploader events                                  */
	/* =========================================================== */
	/**
	 * Handling of the Event change of the fileUploader
	 * @param {object} event Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onChange = function(event) {
		if (event) {
			var sRequestValue,
				iCountFiles = event.getParameter("files").length,
				i,
				oItem,
				sStatus,
				sFileSizeFormatted,
				oAttr;

			// FileUploader fires the change event also if no file was selected by the user
			// If so, do nothing.
			if (iCountFiles === 0) {
				return;
			}
			this._oFileUploader.removeAllAggregation("headerParameters", true);
			this.removeAllAggregation("headerParameters", true);
			this._oFileUploader.removeAllAggregation("parameters", true);
			this.removeAllAggregation("parameters", true);

			this.fireChange({
				// deprecated
				getParameter: function(sParameter) {
					if (sParameter) {
						return event.getParameter(sParameter);
					}
					return null;
				},
				getParameters: function() {
					return event.getParameters();
				},
				mParameters: event.getParameters(),
				// new
				files: event.getParameter("files")
			});

			var aParametersAfter = this.getAggregation("parameters");
			// parameters
			if (aParametersAfter) {
				jQuery.each(aParametersAfter, function(iIndex, parameter) {
					var oParameter = new FileUploaderParameter({
						name: parameter.getProperty("name"),
						value: parameter.getProperty("value")
					});
					this._oFileUploader.addParameter(oParameter);
				}.bind(this));
			}

			if (!this.getInstantUpload()) {
				this._bFocusFileUploader = true;
				sStatus = UploadCollection._pendingUploadStatus;
			} else {
				sStatus = UploadCollection._uploadingStatus;
			}

			this._requestIdValue++;
			sRequestValue = this._requestIdValue.toString();
			var aHeaderParametersAfter = this.getAggregation("headerParameters");
			if (!this.getInstantUpload()) {
				this._aFileUploadersForPendingUpload.push(this._oFileUploader);
			}
			for (i = 0; i < iCountFiles; i++) {
                oItem = new UploadCollectionItem();
                oItem.setFileName(event.getParameter("files")[i].name);
				// attach the File object to the UC item, so that
				// the item can be identified if it comes from drag and drop
				if (event.getParameter("fromDragDrop")) {
					oItem._internalFileIdWithinDragDropArray = event.getParameter("files")[i];
				}
				oItem._status = sStatus;
				oItem._internalFileIndexWithinFileUploader = i + 1;
				oItem._requestIdName = sRequestValue;
				if (!this.getInstantUpload()) {
					oItem.setAssociation("fileUploader", this._oFileUploader, true);
					sFileSizeFormatted = this._oFormatDecimal.format(event.getParameter("files")[i].size);
					oAttr = new ObjectAttribute({text: sFileSizeFormatted});
					oItem.insertAggregation("attributes", oAttr, true);
					this.insertItem(oItem);
				} else {
					oItem._percentUploaded = 0;
				}
				this.aItems.unshift(oItem);
			}
			//headerParameters
			if (aHeaderParametersAfter) {
				jQuery.each(aHeaderParametersAfter, function(iIndex, headerParameter) {
					this._oFileUploader.addHeaderParameter(new FileUploaderParameter({
						name: headerParameter.getProperty("name"),
						value: headerParameter.getProperty("value")
					}));
				}.bind(this));
			}
			this._oFileUploader.addHeaderParameter(new FileUploaderParameter({
				name: this._headerParamConst.requestIdName,
				value: sRequestValue
			}));
		}
	};

	/**
	 * Handling of the Event filenameLengthExceed of the fileUploader
	 * @param {sap.ui.base.Event} event Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onFilenameLengthExceed = function(event) {
		var oFile = {name: event.getParameter("fileName")};
		var aFiles = [oFile];
		this.fireFilenameLengthExceed({
			// deprecated
			getParameter: function(sParameter) {
				if (sParameter) {
					return event.getParameter(sParameter);
				}
			},
			getParameters: function() {
				return event.getParameters();
			},
			mParameters: event.getParameters(),
			// new
			files: aFiles
		});
	};

	/**
	 * Handling of the Event fileSizeExceed of the fileUploader
	 * @param {sap.ui.base.Event} event Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onFileSizeExceed = function(event) {
		var oFile = {
			name: event.getParameter("fileName"),
			fileSize: event.getParameter("fileSize")
		};

		this.fireFileSizeExceed({
			// deprecated
			getParameter: function(sParameter) {
				if (sParameter) {
					return event.getParameter(sParameter);
				}
			},
			getParameters: function() {
				return event.getParameters();
			},
			mParameters: event.getParameters(),
			// new
			files: [oFile]
		});
	};

	/**
	 * Handling of the Event typeMissmatch of the fileUploader
	 * @param {sap.ui.base.Event} event Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onTypeMissmatch = function(event) {
		var oFile = {
			name: event.getParameter("fileName"),
			fileType: event.getParameter("fileType"),
			mimeType: event.getParameter("mimeType")
		};
		var aFiles = [oFile];
		this.fireTypeMissmatch({
			// deprecated
			getParameter: function(sParameter) {
				if (sParameter) {
					return event.getParameter(sParameter);
				}
			},
			getParameters: function() {
				return event.getParameters();
			},
			mParameters: event.getParameters(),
			// new
			files: aFiles
		});
	};

	/**
	 * Handling of the Event uploadTerminated of the fileUploader
	 * @param {sap.ui.base.Event} event Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadTerminated = function(event) {
		var i;
		var sRequestId = this._getRequestId(event);
		var sFileName = event.getParameter("fileName");
		var cItems = this.aItems.length;
		for (i = 0; i < cItems; i++) {
			if (this.aItems[i] && this.aItems[i].getFileName() === sFileName
				&& this.aItems[i]._requestIdName === sRequestId
				&& (this.aItems[i]._status === UploadCollection._uploadingStatus || this.aItems[i]._status === UploadCollection._toBeDeletedStatus)) {
				if (this.getItems() && this.getItems()[i] === this.aItems[i]) {
					this.removeItem(i);
				}
				this.aItems.splice(i, 1);
				break;
			}
		}
		this.fireUploadTerminated({
			fileName: sFileName,
			getHeaderParameter: this._getHeaderParameterWithinEvent.bind(event)
		});
	};

	/**
	 * Handling of the Event uploadComplete of the fileUploader to forward the Event to the application
	 * @param {sap.ui.base.Event} event Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadComplete = function(event) {
		if (event) {
			var i,
				sRequestId = this._getRequestId(event),
				sUploadedFile = event.getParameter("fileName"),
				sUploaderId = event.getParameter("id"),
				cItems,
				oItemToDestroy,
				aInProgressStates,
				bUploadSuccessful = checkRequestStatus();

			cItems = this.aItems.length;
			aInProgressStates = [UploadCollection._uploadingStatus, UploadCollection._pendingUploadStatus];
			for (i = 0; i < cItems; i++) {
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
			for (i = 0; i < this._aFileUploadersForPendingUpload.length; i++) {
				if (this._aFileUploadersForPendingUpload[i].getId() === sUploaderId) {
					this._aFileUploadersForPendingUpload[i].clear();
					break;
				}
			}
			this.fireUploadComplete({
				// deprecated
				getParameter: event.getParameter,
				getParameters: event.getParameters,
				mParameters: event.getParameters(),
				// new Stuff
				files: [
					{
						fileName: event.getParameter("fileName") || sUploadedFile,
						responseRaw: event.getParameter("responseRaw"),
						reponse: event.getParameter("response"), // deprecated event property
						response: event.getParameter("response"),
						status: event.getParameter("status"),
						headers: event.getParameter("headers")
					}
				]
			});
		}
		this.invalidate();

		function checkRequestStatus() {
			var sRequestStatus = event.getParameter("status").toString() || "200";
			return sRequestStatus[0] === "2" || sRequestStatus[0] === "3";
		}
	};

	/**
	 * Handling of the uploadProgress event of the fileUploader to forward the event to the application
	 * @param {sap.ui.base.Event} event Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadProgress = function(event) {
		if (!event || !this.getInstantUpload()) {
			return;
		}

		var sUploadedFile = event.getParameter("fileName"),
			sPercentUploaded,
			iPercentUploaded = Math.round(event.getParameter("loaded") / event.getParameter("total") * 100),
			sRequestId = this._getRequestId(event),
			iItems = this.aItems.length,
			oProgressLabel,
			$busyIndicator,
			oItem;

		if (iPercentUploaded === 100) {
			sPercentUploaded = this._oRb.getText("UPLOADCOLLECTION_UPLOAD_COMPLETED");
		} else {
			sPercentUploaded = this._oRb.getText("UPLOADCOLLECTION_UPLOADING", [iPercentUploaded]);
		}

		for (var i = 0; i < iItems; i++) {
			oItem = this.aItems[i];
			if (oItem.getProperty("fileName") === sUploadedFile && oItem._requestIdName === sRequestId && oItem._status === UploadCollection._uploadingStatus) {
				oProgressLabel = oItem._getProgressLabel ? oItem._getProgressLabel() : oItem._getControl("sap.m.Label", {
					id: oItem.getId() + "-ta_progress"
				}, "ProgressLabel");

				//necessary for IE otherwise it comes to an error if onUploadProgress happens before the new item is added to the list
				if (oProgressLabel) {
					oProgressLabel.setText(sPercentUploaded);
					oItem._percentUploaded = iPercentUploaded;
					// add ARIA attribute for screen reader support

					$busyIndicator = jQuery(document.getElementById(oItem.getId() + "-ia_indicator"));
					if (iPercentUploaded === 100) {
						$busyIndicator.attr("aria-label", sPercentUploaded);
					} else {
						$busyIndicator.attr("aria-valuenow", iPercentUploaded);
					}
					break;
				}
			}
		}
	};

	/**
	 * Get the Request ID from the header parameters of a fileUploader event
	 * @param {sap.ui.base.Event} event Event of the fileUploader
	 * @returns {string} Request ID
	 * @private
	 */
	UploadCollection.prototype._getRequestId = function(event) {
		var oHeaderParams;
		oHeaderParams = event.getParameter("requestHeaders");
		if (!oHeaderParams) {
			return null;
		}
		for (var j = 0; j < oHeaderParams.length; j++) {
			if (oHeaderParams[j].name === this._headerParamConst.requestIdName) {
				return oHeaderParams[j].value;
			}
		}
		return null;
	};

	/**
	 * Access and initialization for the FileUploader
	 * @returns {sap.ui.unified.FileUploader} Instance of the FileUploader
	 * @private
	 */
	UploadCollection.prototype._getFileUploader = function() {
		var bUploadOnChange = this.getInstantUpload();
		if (!bUploadOnChange || !this._oFileUploader) { // In case of instantUpload = false always create a new FU instance. In case of instantUpload = true only create a new FU instance if no FU instance exists yet
			var sTooltip = this.getInstantUpload() ? this._oRb.getText("UPLOADCOLLECTION_UPLOAD") : this._oRb.getText("UPLOADCOLLECTION_ADD");
			this._iFUCounter = this._iFUCounter + 1; // counter for FileUploader instances
			this._oFileUploader = new FileUploader(this.getId() + "-" + this._iFUCounter + "-uploader", {
				buttonOnly: true,
				buttonText: sTooltip,
				tooltip: sTooltip,
				iconOnly: true,
				enabled: this.getUploadEnabled(),
				fileType: this.getFileType(),
				icon: "sap-icon://add",
				iconFirst: false,
				style: "Transparent",
				maximumFilenameLength: this.getMaximumFilenameLength(),
				maximumFileSize: this.getMaximumFileSize(),
				mimeType: this.getMimeType(),
				multiple: this.getMultiple(),
				name: "uploadCollection",
				uploadOnChange: bUploadOnChange,
				sameFilenameAllowed: true,
				uploadUrl: this.getUploadUrl(),
				useMultipart: false,
				sendXHR: true,
				change: [this._onChange, this],
				filenameLengthExceed: [this._onFilenameLengthExceed, this],
				fileSizeExceed: [this._onFileSizeExceed, this],
				typeMissmatch: [this._onTypeMissmatch, this],
				uploadAborted: [this._onUploadTerminated, this],
				uploadComplete: [this._onUploadComplete, this],
				uploadProgress: [this._onUploadProgress, this],
				uploadStart: [this._onUploadStart, this],
				visible: !this.getUploadButtonInvisible()
			});
		}
		return this._oFileUploader;
	};

	/**
	 * Creates the unique key for a file by concatenating the fileName with its requestId and puts it into the requestHeaders parameter of the FileUploader.
	 * It triggers the beforeUploadStarts event for applications to add the header parameters for each file.
	 * @param {jQuery.Event} event The jQuery Event object
	 * @private
	 */
	UploadCollection.prototype._onUploadStart = function(event) {
		var oRequestHeaders, i, sRequestIdValue, iParamCounter, sFileName, oGetHeaderParameterResult;
		this._iUploadStartCallCounter++;
		iParamCounter = event.getParameter("requestHeaders").length;
		for (i = 0; i < iParamCounter; i++) {
			if (event.getParameter("requestHeaders")[i].name === this._headerParamConst.requestIdName) {
				sRequestIdValue = event.getParameter("requestHeaders")[i].value;
				break;
			}
		}
		sFileName = event.getParameter("fileName");
		oRequestHeaders = {
			name: this._headerParamConst.fileNameRequestIdName,
			value: this._encodeToAscii(sFileName) + sRequestIdValue
		};
		event.getParameter("requestHeaders").push(oRequestHeaders);

		for (i = 0; i < this._aDeletedItemForPendingUpload.length; i++) {
			if (this._aDeletedItemForPendingUpload[i].getAssociation("fileUploader") === event.oSource.sId &&
				this._aDeletedItemForPendingUpload[i].getFileName() === sFileName &&
				this._aDeletedItemForPendingUpload[i]._internalFileIndexWithinFileUploader === this._iUploadStartCallCounter) {
				event.getSource().abort(this._headerParamConst.fileNameRequestIdName, this._encodeToAscii(sFileName) + sRequestIdValue);
				return;
			}
		}
		this.fireBeforeUploadStarts({
			fileName: sFileName,
			addHeaderParameter: addHeaderParameter,
			getHeaderParameter: getHeaderParameter.bind(this)
		});

		// ensure that the HeaderParameterValues are updated
		if (Array.isArray(oGetHeaderParameterResult)) {
			for (i = 0; i < oGetHeaderParameterResult.length; i++) {
				if (event.getParameter("requestHeaders")[i].name === oGetHeaderParameterResult[i].getName()) {
					event.getParameter("requestHeaders")[i].value = oGetHeaderParameterResult[i].getValue();
				}
			}
		} else if (oGetHeaderParameterResult instanceof UploadCollectionParameter) {
			for (i = 0; i < event.getParameter("requestHeaders").length; i++) {
				if (event.getParameter("requestHeaders")[i].name === oGetHeaderParameterResult.getName()) {
					event.getParameter("requestHeaders")[i].value = oGetHeaderParameterResult.getValue();
					break;
				}
			}
		}

		function addHeaderParameter(oUploadCollectionParameter) {
			var oRequestHeaders = {
				name: oUploadCollectionParameter.getName(),
				value: oUploadCollectionParameter.getValue()
			};
			event.getParameter("requestHeaders").push(oRequestHeaders);
		}

		function getHeaderParameter(sHeaderParameterName) {
			oGetHeaderParameterResult = this._getHeaderParameterWithinEvent.bind(event)(sHeaderParameterName);
			return oGetHeaderParameterResult;
		}
	};

	/**
	 * Determines the icon from the filename.
	 * @param {string} sFilename Name of the file including a file extension (e.g. .txt, .pdf, ...).
	 * @returns {string} Icon related to the file extension.
	 * @private
	 */
	UploadCollection.prototype._getIconFromFilename = function(sFilename) {
		var sFileExtension = UploadCollection._splitFilename(sFilename).extension;
		if (jQuery.type(sFileExtension) === "string") {
			sFileExtension = sFileExtension.toLowerCase();
		}

		switch (sFileExtension) {
			case ".bmp" :
			case ".jpg" :
			case ".jpeg" :
			case ".png" :
				return UploadCollection._placeholderCamera;  // if no image is provided a standard placeholder camera is displayed
			case ".csv" :
			case ".xls" :
			case ".xlsx" :
				return "sap-icon://excel-attachment";
			case ".doc" :
			case ".docx" :
			case ".odt" :
				return "sap-icon://doc-attachment";
			case ".pdf" :
				return "sap-icon://pdf-attachment";
			case ".ppt" :
			case ".pptx" :
				return "sap-icon://ppt-attachment";
			case ".txt" :
				return "sap-icon://document-text";
			default :
				return "sap-icon://document";
		}
	};

	/**
	 * Determines the thumbnail of an item.
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
	 * Trigger of the link which will be executed when the icon or image was clicked
	 * @param {sap.ui.base.Event} event The SAPUI5 event object
	 * @private
	 */
	UploadCollection.prototype._triggerLink = function(event, item) {
	if (this.editModeItem) {
		//In case there is a list item in edit mode, the edit mode has to be finished first.
		this._handleOk(event, this.editModeItem, true);
		 if (this.sErrorState === "Error") {
			//If there is an error, the link of the list item must not be triggered.
			return;
		}
		this.sFocusId = event.getParameter("id");
	}
	MobileLibrary.URLHelper.redirect(item.getProperty("url"),true);
	};

	// ================================================================================
	// Keyboard activities
	// ================================================================================
	/**
	 * Keyboard support: Handling of different key activities
	 * @param {sap.ui.base.Event} event The SAPUI5 event object
	 * @private
	 */
	UploadCollection.prototype.onkeydown = function(event) {
		switch (event.keyCode) {
			case KeyCodes.F2 :
				this._handleF2(event);
				break;
			case KeyCodes.ESCAPE :
				this._handleESC(event);
				break;
			case KeyCodes.DELETE :
				this._handleDEL(event);
				break;
			case KeyCodes.ENTER :
				this._handleENTER(event);
				break;
			default :
				return;
		}
		event.setMarked();
	};

	// ================================================================================
	// helpers
	// ================================================================================
	/**
	 * Set the focus after the list item was deleted.
	 * @private
	 */
	UploadCollection.prototype._setFocusAfterDeletion = function() {
		var iLength = this.aItems.length;
		var sLineId;

		if (iLength === 0) {
			this._oFileUploader.focus();
		} else {
			var iLineNumber = this.sDeletedItemId.split("-").pop();

			// If the bottommost item has been deleted, its predecessor receives focus.
			// If any other item has been deleted, its successor receives focus.
			if (iLineNumber <= iLength - 1) {
				sLineId = this.sDeletedItemId + "-cli";
			} else {
				sLineId = this.aItems[this.aItems.length - 1].sId + "-cli";
			}
			this._setFocusToLineItem(sLineId);
		}

		this.sDeletedItemId = null;
	};

	/**
	 * Set the focus to the list item.
	 * @param {string} itemId ListItem which should get the focus
	 * @private
	 */
	UploadCollection.prototype._setFocusToLineItem = function(itemId) {
		jQuery(document.getElementById(itemId)).focus();
	};

	/**
	 * Handle of keyboard activity ENTER.
	 * @param {sap.ui.base.Event} event The SAPUI5 event object
	 * @private
	 */
	UploadCollection.prototype._handleENTER = function(event) {
		var sTarget, sLinkId, oLink, iLine;
		if (this.editModeItem) {
			sTarget = event.target.id.split(this.editModeItem).pop();
		} else {
			sTarget = event.target.id.split("-").pop();
		}

		switch (sTarget) {
			case "-ta_editFileName-inner" :
			case "-okButton" :
				this._handleOk(event, this.editModeItem, true);
				break;
			case "-cancelButton" :
				event.preventDefault();
				this._handleCancel(event, this.editModeItem);
				break;
			case "-ia_iconHL" :
			case "-ia_imageHL" :
				//Edit mode
				iLine = this.editModeItem.split("-").pop();
				MobileLibrary.URLHelper.redirect(this.aItems[iLine].getProperty("url"), true);
				break;
			case "ia_iconHL" :
			case "ia_imageHL" :
			case "cli":
				//Display mode
				sLinkId = event.target.id.split(sTarget)[0] + "ta_filenameHL";
				oLink = sap.ui.getCore().byId(sLinkId);
				if (oLink.getEnabled()) {
					iLine = event.target.id.split("-")[2];
					MobileLibrary.URLHelper.redirect(this.aItems[iLine].getProperty("url"), true);
				}
				break;
			default:
				break;
		}
	};

	/**
	 * Handle of keyboard activity DEL.
	 * @param {sap.ui.base.Event} event The SAPUI5 event object
	 * @private
	 */
	UploadCollection.prototype._handleDEL = function(event) {
		if (!this.editModeItem) {
			// removing the -cli suffix to get the id of the UploadCollectionItem
			var sTarget = event.target.id.slice(0, -4),
				oItem = sap.ui.getCore().byId(sTarget),
				oDeleteButton = oItem && oItem._getDeleteButton && oItem._getDeleteButton();
			if (oDeleteButton) {
				oDeleteButton.firePress();
			}
		}
	};

	/**
	 * Handle of keyboard activity ESC.
	 * @param {sap.ui.base.Event} event The SAPUI5 event object
	 * @private
	 */
	UploadCollection.prototype._handleESC = function(event) {
		if (this.editModeItem) {
			this.sFocusId = this.editModeItem + "-cli";
			this.aItems[this.editModeItem.split("-").pop()]._status = UploadCollection._displayStatus;
			this._handleCancel(event, this.editModeItem);
		}
	};

	/**
	 * Handle of keyboard activity F2.
	 * @param {sap.ui.base.Event} event The SAPUI5 event object
	 * @private
	 */
	UploadCollection.prototype._handleF2 = function(event) {

		var oObj = sap.ui.getCore().byId(event.target.id);

		if (oObj !== undefined) {
			if (oObj._status === UploadCollection._displayStatus) {
				//focus at list line (status = "display") and F2 pressed --> status = "Edit"
				var o$Obj = jQuery(document.getElementById(event.target.id));
				var o$EditButton = o$Obj.find("[id$='-editButton']");
				var oEditButton = sap.ui.getCore().byId(o$EditButton[0].id);
				if (oEditButton.getEnabled()) {
					if (this.editModeItem) {
						this._handleClick(event, this.editModeItem);
					}
					if (this.sErrorState !== "Error") {
						oEditButton.firePress();
					}
				}
			} else {
				//focus at list line(status= "Edit") and F2 is pressed --> status = "display", changes will be saved and
				//if the focus is at any other object of the list item
				this._handleClick(event, this.editModeItem);
			}
		} else if (event.target.id.search(this.editModeItem) === 0) {
			//focus at Inputpield (status = "Edit"), F2 pressed --> status = "display" changes will be saved
			this._handleOk(event, this.editModeItem, true);
		}
	};

	/**
	 * Determines if the fileName is already in usage.
	 * @param {string} filename inclusive file extension
	 * @param {array} items Collection of uploaded files
	 * @returns {boolean} true for an already existing item with the same file name(independent of the path)
	 * @private
	 * @static
	 */
	UploadCollection._checkDoubleFileName = function(filename, items) {
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
	 * Split file name into name and extension.
	 * @param {string} filename Full file name inclusive the extension
	 * @returns {object} oResult Filename and Extension
	 * @deprecated UploadCollectionItem._splitFileName method should be used instead
	 * @private
	 * @static
	 */
	UploadCollection._splitFilename = function(filename) {
		var oResult = {};
		var aNameSplit = filename.split(".");
		if (aNameSplit.length === 1) {
			oResult.extension = "";
			oResult.name = aNameSplit.pop();
			return oResult;
		}
		oResult.extension = "." + aNameSplit.pop();
		oResult.name = aNameSplit.join(".");
		return oResult;
	};

	/**
	 * Getter of aria label for the icon or image.
	 * @param {sap.m.UploadCollectionItem} item An item of the list to which the text is to be retrieved
	 * @returns {string} sText Text of the icon (or image)
	 * @private
	 */
	UploadCollection.prototype._getAriaLabelForPicture = function(item) {
		var sText;
		// prerequisite: the items have field names or the app provides explicite texts for pictures
		sText = (item.getAriaLabelForPicture() || item.getFileName());
		return sText;
	};

	/**
	 * Helper function for better Event API. This reference points to the oEvent coming from the FileUploader
	 * @param {string} sHeaderParameterName Header parameter name (optional)
	 * @returns {UploadCollectionParameter | UploadCollectionParameter[] | null} Header parameter or null
	 * @private
	 */
	UploadCollection.prototype._getHeaderParameterWithinEvent = function(sHeaderParameterName) {
		var aUcpRequestHeaders = [];
		var aRequestHeaders = this.getParameter("requestHeaders");
		var iParamCounter = aRequestHeaders.length;
		var i;
		if (aRequestHeaders && sHeaderParameterName) {
			for (i = 0; i < iParamCounter; i++) {
				if (aRequestHeaders[i].name === sHeaderParameterName) {
					return new UploadCollectionParameter({
						name: aRequestHeaders[i].name,
						value: aRequestHeaders[i].value
					});
				}
			}
			return null;
		} else if (aRequestHeaders) {
			for (i = 0; i < iParamCounter; i++) {
				aUcpRequestHeaders.push(new UploadCollectionParameter({
					name: aRequestHeaders[i].name,
					value: aRequestHeaders[i].value
				}));
			}
			return aUcpRequestHeaders;
		}
	};

	/**
	 * Helper function for ASCII encoding within header parameters
	 * @param {string} value The input value that will be encoded
	 * @returns {string} The ASCII encoded string
	 * @private
	 */
	UploadCollection.prototype._encodeToAscii = function(value) {
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
	UploadCollection.prototype._onResize = function() {
		var aListItems = this._oList.getItems();

		for (var i = 0; i < aListItems.length; i++) {
			var oLastItem = aListItems[i];
			/* eslint-disable no-loop-func */
			setTimeout(function () {
				var fnMethod = this._truncateFileName.bind(this);
				if (typeof fnMethod === "string" || fnMethod instanceof String) {
					fnMethod = this[fnMethod];
				}
				fnMethod.apply(this, [oLastItem._oUploadCollectionItem] || []);
			}.bind(this), UploadCollection._resizeTimeoutInterval);
			/* eslint-enable no-loop-func */
		}
	};

	/**
	 * Returns UploadCollectionItem based on the items aggregation
	 * @param {sap.m.ListItemBase} listItem The list item used to find the UploadCollectionItem
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
	 * Returns UploadCollectionItem based on the items aggregation
	 * @param {string} uploadCollectionItemId used for finding the UploadCollectionItem
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
	 * Returns an array of UploadCollection items based on the items aggregation
	 * @param {sap.m.ListItemBase[]} listItems The list items used for finding the UploadCollectionItems
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
	 * Sets the selected value for elements in given array to state of the given parameter. Also handles List specific rules
	 * @param {sap.m.ListItemBase[]} uploadCollectionItemsToUpdate The list items the selection state is to be set for
	 * @param {boolean} selected The new selection state
	 * @private
	 */
	UploadCollection.prototype._setSelectedForItems = function(uploadCollectionItemsToUpdate, selected) {
		//Reset all 'selected' values in UploadCollectionItems
		if (this.getMode() !== Library.ListMode.MultiSelect && selected) {
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
	 * @param {sap.ui.base.Event} event The SAPUI5 event object
	 * @private
	 */
	UploadCollection.prototype._handleItemSetSelected = function(event) {
		var oItem = event.getSource();
		if (oItem instanceof UploadCollectionItem) {
			var oListItem = this._getListItemById(oItem.getId() + "-cli");
			if (oListItem) {
				oListItem.setSelected(oItem.getSelected());
			}
		}
	};

	/**
	 * Handles the firing of the selectionChange event and updates the items' selection states.
	 * @param {sap.ui.base.Event} event The SAPUI5 event object
	 * @private
	 */
	UploadCollection.prototype._handleSelectionChange = function(event) {
		var oListItem = event.getParameter("listItem");
		var bSelected = event.getParameter("selected");
		var aUploadCollectionListItems = this._getUploadCollectionItemsByListItems(event.getParameter("listItems"));
		var oUploadCollectionItem = this._getUploadCollectionItemByListItem(oListItem);
		if (oUploadCollectionItem && oListItem && aUploadCollectionListItems) {
			this.fireSelectionChange({
				selectedItem: oUploadCollectionItem,
				selectedItems: aUploadCollectionListItems,
				selected: bSelected
			});
			oUploadCollectionItem.setSelected(oListItem.getSelected());
		}
	};

	/**
	 * Retrieves the sap.m.ListItem from the internal sap.m.List based on the ID.
	 * @param {string} listItemId The item ID used for finding the UploadCollectionItem
	 * @returns {sap.m.UploadCollectionItem} The matching UploadCollectionItem
	 * @private
	 */
	UploadCollection.prototype._getListItemById = function(listItemId) {
		var aListItems = this._oList.getItems();
		return UploadCollection._findById(listItemId, aListItems);
	};

	/**
	 * Retrieves the sap.m.ListItem from the internal sap.m.List based on the ID
	 * @param {string} listItemId The item ID used for finding the UploadCollectionItem
	 * @param {sap.m.ListItemBase[]} listItems The array of list items to search in
	 * @returns {sap.m.UploadCollectionItem} The matching UploadCollectionItem or null if none is found
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
