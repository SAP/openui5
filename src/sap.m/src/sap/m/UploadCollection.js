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
	"sap/ui/core/ValueState",
	"sap/m/CustomListItem",
	"sap/ui/core/ResizeHandler",
	"sap/ui/Device",
	"./UploadCollectionRenderer",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/ui/dom/jquery/selectText"
], function (
	Library, MobileLibrary, MessageBox, Dialog, Control, Icon, IconPool, Image, Text, Title, Button, List, StandardListItem,
	FileUploaderParameter, FileUploader, FileSizeFormat, OverflowToolbar, ToolbarSpacer, ObjectAttribute, UploadCollectionItem,
	UploadCollectionParameter, UploadCollectionToolbarPlaceholder, HTML, ValueState, CustomListItem, ResizeHandler, Device,
	UploadCollectionRenderer, jQuery, KeyCodes, Log) {
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
	 * @since 1.26.0
	 * @alias sap.m.UploadCollection
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UploadCollection = Control.extend("sap.m.UploadCollection", /** @lends sap.m.UploadCollection.prototype */ {
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
				 * Defines whether the upload process should be triggered as soon as a file is selected.<br>
				 * If <code>false</code>, no upload is triggered when a file is selected.
				 * @since 1.30.0
				 */
				instantUpload: {type: "boolean", group: "Behavior", defaultValue: true},
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
				 * Defines the selection mode of the control (e.g. None, SingleSelect, MultiSelect, SingleSelectLeft, SingleSelectMaster).
				 * Since the UploadCollection reacts like a list for attachments, the API is close to the ListBase Interface.
				 * sap.m.ListMode.Delete mode is not supported and will be automatically set to sap.m.ListMode.None.
				 * In addition, if instant upload is set to false the mode sap.m.ListMode.MultiSelect is not supported and will be automatically set to sap.m.ListMode.None.
				 *
				 * @since 1.34.0
				 */
				mode: {type: "sap.m.ListMode", group: "Behavior", defaultValue: "None"},
				/**
				 * Lets the user select multiple files from the same folder and then upload them.
				 * Internet Explorer 8 and 9 do not support this property.
				 * Please note that the various operating systems for mobile devices can react differently to the property so that fewer upload functions may be available in some cases.
				 *
				 * If multiple property is set to false, the control shows an error message if more than one file is chosen for drag & drop.
				 */
				multiple: {type: "boolean", group: "Behavior", defaultValue: false},
				/**
				 * Allows you to set your own text for the 'No data' description label.
				 * @since 1.46.0
				 */
				noDataDescription: {type: "string", group: "Appearance", defaultValue: null},
				/**
				 * Allows you to set your own text for the 'No data' text label.
				 */
				noDataText: {type: "string", group: "Appearance", defaultValue: null},
				/**
				 * Sets the title text in the toolbar of the list of attachments.
				 * To show as well the number of attachments in brackets like the default text does. The number of attachments could be retrieved via "getItems().length".
				 * If a new title is set, the default is deactivated.
				 * The default value is set to language-dependent "Attachments (n)".
				 * @since 1.30.0
				 */
				numberOfAttachmentsText: {type: "string", group: "Appearance", defaultValue: null},
				/**
				 * Allows the user to use the same name for a file when editing the file name. 'Same name' refers to an already existing file name in the list.
				 */
				sameFilenameAllowed: {type: "boolean", group: "Behavior", defaultValue: false},
				/**
				 * Specifies whether file icons are to be displayed or hidden.
				 * @since 1.60.0
				 */
				showIcons: {type: "boolean", defaultValue: true},
				/**
				 * Defines whether separators are shown between list items.
				 */
				showSeparators: {type: "sap.m.ListSeparators", group: "Appearance", defaultValue: "All"},
				/**
				 * If true, the button that is used to terminate the instant file upload gets visible.
				 * The button normally appears when a file is being uploaded.
				 * @since 1.42.0
				 */
				terminationEnabled: {type: "boolean", group: "Behavior", defaultValue: true},
				/**
				 * If true, the button used for uploading files is invisible.
				 * @since 1.42.0
				 */
				uploadButtonInvisible: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Enables the upload of a file.
				 */
				uploadEnabled: {type: "boolean", group: "Behavior", defaultValue: true},
				/**
				 * Specifies the URL where the uploaded files have to be stored.
				 */
				uploadUrl: {type: "string", group: "Data", defaultValue: "../../../upload"}
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * Specifies the info toolbar for filtering information. Sorting information will not be displayed.
				 * @since 1.44.0
				 */
				infoToolbar: {
					type: "sap.m.Toolbar",
					multiple: false,
					forwarding: {
						idSuffix: "-list",
						aggregation: "infoToolbar"
					}
				},
				/**
				 * Uploaded items.
				 */
				items: {type: "sap.m.UploadCollectionItem", multiple: true, singularName: "item", bindable: "bindable"},
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
				 * Defines the uploader to be used. If not defined, implicit private implementation is used.
				 * @since 1.60.0
				 */
				uploader: {
					type: "sap.m.CollectionUploader", multiple: false
				},
				/**
				 * Internal aggregation holding the list in controls tree.
				 * @since 1.34.0
				 */
				_list: {type: "sap.m.List", multiple: false, visibility: "hidden"},
				/**
				 * The icon is displayed in no data page.
				 * @since 1.46.0
				 */
				_noDataIcon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
				/**
				 * Internal aggregation to hold the drag and drop icon of indicator.
				 * @since 1.46.0
				 */
				_dragDropIcon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
				/**
				 * Internal aggregation to hold the drag and drop text of indicator.
				 * @since 1.46.0
				 */
				_dragDropText: {type: "sap.m.Text", multiple: false, visibility: "hidden"}
			},
			events: {
				/**
				 * The event is fired when files are selected in the FileUploader dialog.
				 * Applications can set parameters and headerParameters which will be dispatched to the embedded FileUploader control.
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
				 * The event is fired when an uploaded attachment is selected and the Delete button is pressed.
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
				 * The event is fired when the termination button is clicked while a file is being uploaded.
				 * @since 1.60.0
				 */
				beforeUploadTermination: {
					parameters: {
						/**
						 * The item whose upload is being teminated.
						 */
						item: {type: "sap.m.UploadCollectionItem"}
					},
					allowPreventDefault: true
				},
				/**
				 * The event is fired when edit button of an item is clicked and no other item is currently being edited.
				 * @since 1.60.0
				 */
				beforeItemEdited: {
					parameters: {
						/**
						 * The item that is going to be edited.
						 */
						item: {type: "sap.m.UploadCollectionItem"}
					},
					allowPreventDefault: true
				},
				/**
				 * The event is fired just after new item was added to the collection.
				 * @since 1.60.0
				 */
				afterItemAdded: {
					parameters: {
						/**
						 * The item that has just been added.
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
				 * The event is fired when the file name is changed.
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
				 * The event is fired when the file size of an uploaded file is exceeded (only if the maxFileSize property was provided by the application).
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
				 * The event is fired when the file type or the MIME type don't match the permitted types (only if the fileType property or the mimeType property are provided by the application).
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
				 * The event is fired as soon as the upload request is completed.
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
						 * response     : Response message which comes from the server. On the server side, this response has to be put within the 'body' tags of the response document of the iFrame.
						 * It can consist of a return code and an optional message. This does not work in cross-domain scenarios.
						 * reponse     : deprecated Since version 1.48.0. This parameter is deprecated, use parameter response instead.
						 * responseRaw : HTTP-Response which comes from the server. This property is not supported by Internet Explorer Versions lower than 9.
						 * status      : Status of the XHR request. This property is not supported by Internet Explorer 9 and lower.
						 * headers     : HTTP-Response-Headers which come from the server. Provided as a JSON-map, i.e. each header-field is reflected by a property in the header-object, with the property value reflecting the header-field's content.
						 * This property is not supported by Internet Explorer 9 and lower.
						 * Since 1.28.0.
						 * @since 1.28.0
						 */
						files: {type: "object[]"},
						/**
						 * The item whose upload has just been completed.
						 */
						item: {type: "sap.m.UploadCollectionItem"}
					}
				},
				/**
				 * The event is fired as soon as the upload request was terminated by the user.
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
				 * The event is fired before the actual upload starts. An event is fired per file. All the necessary header parameters should be set here.
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
						 * The item whose selection has changed. In <code>MultiSelect</code> mode, only the topmost selected item is returned.
						 * This parameter can be used for single-selection modes.
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

	var UploadState = Library.UploadState;

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

	UploadCollection.prototype.init = function () {
		UploadCollection.prototype._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._headerParamConst = {
			requestIdName: "requestId" + jQuery.now(),
			fileNameRequestIdName: "fileNameRequestId" + jQuery.now()
		};
		this._requestIdValue = 0;

		this._oList = new List(this.getId() + "-list", {
			selectionChange: [this._handleSelectionChange, this]
		});
		this.setAggregation("_list", this._oList, true);
		this._oList.addStyleClass("sapMUCList");
		this._oListEventDelegate = {
			onclick: function(oEvent) {
				this._handleClick(oEvent, null);
			}.bind(this)
		};
		this._oList.addDelegate(this._oListEventDelegate);

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

		this._oFormatDecimal = FileSizeFormat.getInstance({
			binaryFilesize: true,
			maxFractionDigits: 1,
			maxIntegerDigits: 3
		});

		this._iFileUploaderPH = null; // Index of the place holder for the File Uploader
		this._oListEventDelegate = null;
		this._oItemToUpdate = null;
		this._sReziseHandlerId = null;

		this._oUploader = null;
		this._oRenderManager = null;
		this._oEditModeItem = null;
		this._oItemToBeDeleted = null;
		this._mRequestIdToItemMap = {};
		this._mListItemIdToItemMap = {};
		this._mGroups = {};
	};

	/* =========================================================== */
	/* Redefinition of setter and getter methods                   */
	/* =========================================================== */

	UploadCollection.prototype.setFileType = function (aNewTypes) {
		var aTypes = (aNewTypes || []).map(function (s) {
			return s ? s.toLowerCase() : "";
		});
		if (JSON.stringify(this.getFileType()) !== JSON.stringify(aTypes)) {
			this.setProperty("fileType", aTypes, true);
			this._getFileUploader().setFileType(aTypes);
			this._checkRestrictions();
		}
		return this;
	};

	UploadCollection.prototype.setMaximumFilenameLength = function (iNewMax) {
		if (this.getMaximumFilenameLength() !== iNewMax) {
			this.setProperty("maximumFilenameLength", iNewMax, true);
			this._getFileUploader().setMaximumFilenameLength(iNewMax);
			this._checkRestrictions();
		}
		return this;
	};

	UploadCollection.prototype.setMaximumFileSize = function (iNewMax) {
		if (this.getMaximumFileSize() !== iNewMax) {
			this.setProperty("maximumFileSize", iNewMax, true);
			this._getFileUploader().setMaximumFileSize(iNewMax);
			this._checkRestrictions();
		}
		return this;
	};

	UploadCollection.prototype.setMimeType = function (aNewTypes) {
		var aTypes = (aNewTypes || []).map(function (s) {
			return s ? s.toLowerCase() : "";
		});
		if (JSON.stringify(this.getMimeType()) !== JSON.stringify(aTypes)) {
			this.setProperty("mimeType", aTypes, true);
			this._getFileUploader().setMimeType(aTypes);
			this._checkRestrictions();
		}
		return this;
	};

	UploadCollection.prototype.setMultiple = function (bMultiple) {
		if (this.getMultiple() !== bMultiple) {
			this.setProperty("multiple", bMultiple);
			this._getFileUploader().setMultiple(bMultiple);
		}
		return this;
	};

	UploadCollection.prototype.setShowSeparators = function (bShowSeparators) {
		if (this.getShowSeparators() !== bShowSeparators) {
			this.setProperty("showSeparators", bShowSeparators);
			this._oList.setShowSeparators(bShowSeparators);
		}
		return this;
	};

	UploadCollection.prototype.setTerminationEnabled = function (bEnabled) {
		if (this.getTerminationEnabled() !== bEnabled) {
			this.setProperty("terminationEnabled", bEnabled);
			this.getItems().forEach(function (oItem) {
				oItem._getTerminateButton().setVisible(bEnabled);
			});
		}
		return this;
	};

	UploadCollection.prototype.setUploadEnabled = function (bUploadEnabled) {
		if (this.getUploadEnabled() !== bUploadEnabled) {
			this.setProperty("uploadEnabled", bUploadEnabled);
			this._getFileUploader().setEnabled(bUploadEnabled);
		}
		return this;
	};

	UploadCollection.prototype.setUploadUrl = function (sUploadUrl) {
		if (this.getUploadUrl() !== sUploadUrl) {
			this.setProperty("uploadUrl", sUploadUrl);
			this._getFileUploader().setUploadUrl(sUploadUrl);
		}
		return this;
	};

	UploadCollection.prototype.setMode = function (sMode) {
		if (sMode === Library.ListMode.Delete) {
			this._oList.setMode(Library.ListMode.None);
			Log.info("sap.m.ListMode.Delete is not supported by UploadCollection. Value has been resetted to 'None'");
		} else if (sMode === Library.ListMode.MultiSelect && !this.getInstantUpload()) {
			this._oList.setMode(Library.ListMode.None);
			Log.info("sap.m.ListMode.MultiSelect is not supported by UploadCollection for Pending Upload. Value has been resetted to 'None'");
		} else {
			this._oList.setMode(sMode);
		}
		return this;
	};

	UploadCollection.prototype.getMode = function () {
		return this._oList.getMode();
	};

	UploadCollection.prototype.getToolbar = function () {
		var oFileUploader;
		if (!this._oHeaderToolbar) {
			oFileUploader = this._getFileUploader();
			this._oHeaderToolbar = this.getAggregation("toolbar");
			if (!this._oHeaderToolbar) {
				this._oHeaderToolbar = new OverflowToolbar(this.getId() + "-toolbar", {
					content: [this._oNumberOfAttachmentsTitle, new ToolbarSpacer(), oFileUploader]
				});
				this._iFileUploaderPH = 2;
			} else {
				this._iFileUploaderPH = this._getFileUploaderPlaceHolderPosition(this._oHeaderToolbar);
				if (this._oHeaderToolbar && this._iFileUploaderPH > -1) {
					this._setFileUploaderInToolbar(oFileUploader);
				} else {
					Log.info("A place holder of type 'sap.m.UploadCollectionPlaceholder' needs to be provided.");
				}
			}
		}

		return this._oHeaderToolbar;
	};

	UploadCollection.prototype.getNoDataText = function () {
		var sNoDataText = this.getProperty("noDataText");
		sNoDataText = sNoDataText || this._oRb.getText("UPLOADCOLLECTION_NO_DATA_TEXT");
		return sNoDataText;
	};

	UploadCollection.prototype.getNoDataDescription = function () {
		var sNoDataDescription = this.getProperty("noDataDescription");
		sNoDataDescription = sNoDataDescription || this._oRb.getText("UPLOADCOLLECTION_NO_DATA_DESCRIPTION");
		return sNoDataDescription;
	};

	UploadCollection.prototype.setUploadButtonInvisible = function (bUploadButtonInvisible) {
		if (this.getUploadButtonInvisible() === bUploadButtonInvisible) {
			return this;
		}
		this.setProperty("uploadButtonInvisible", bUploadButtonInvisible, true);
		this._getFileUploader().setVisible(!bUploadButtonInvisible);

		if (this._bDragDropEnabled) {
			this._unbindDragEnterLeave();
			this._bDragDropEnabled = false;
		} else {
			this._bindDragEnterLeave();
		}
		return this;
	};

	UploadCollection.prototype.setShowIcons = function (bShowIcons) {
		if (bShowIcons !== this.getShowIcons()) {
			this.getItems().forEach(function (oItem) {
				oItem._getIcon().setVisible(bShowIcons);
			});
			this.setProperty("showIcons", bShowIcons, false);
		}
		return this;
	};

	/**
	 * Provides access to the internally used request headers to allow adding them to the "Access-Control-Allow-Headers" header parameter if needed.
	 * @returns {string[]} An array of request header strings
	 * @since 1.50.0
	 * @public
	 */
	UploadCollection.prototype.getInternalRequestHeaderNames = function () {
		return [this._headerParamConst.fileNameRequestIdName, this._headerParamConst.requestIdName];
	};

	/* =========================================================== */
	/* API methods                                                 */
	/* =========================================================== */
	/**
	 * Starts the upload for all selected files.
	 * @public
	 * @since 1.30.0
	 */
	UploadCollection.prototype.upload = function () {
		this.getItems().forEach(function (oItem) {
			this._uploadItemIfGoodToGo(oItem);
		}.bind(this));
	};

	/**
	 * Returns an array containing the selected UploadCollectionItems.
	 * @returns {sap.m.UploadCollectionItem[]} Array of all selected items
	 * @public
	 * @since 1.34.0
	 */
	UploadCollection.prototype.getSelectedItems = function () {
		var aSelectedListItems = this._oList.getSelectedItems();
		return this._getUploadCollectionItemsByListItems(aSelectedListItems);
	};

	/**
	 * Retrieves the currently selected UploadCollectionItem.
	 * @returns {sap.m.UploadCollectionItem | null} The currently selected item or null
	 * @since 1.34.0
	 * @public
	 */
	UploadCollection.prototype.getSelectedItem = function () {
		var oSelectedListItem = this._oList.getSelectedItem();
		if (oSelectedListItem) {
			return this._getUploadCollectionItemByListItem(oSelectedListItem);
		}
		return null;
	};

	/**
	 * Sets an UploadCollectionItem to be selected by ID. In single selection mode, the method removes the previous selection.
	 * @param {string} sId The ID of the item whose selection is to be changed.
	 * @param {boolean} bSelect The selection state of the item. Default value is true.
	 * @returns {sap.m.UploadCollection} this to allow method chaining
	 * @since 1.34.0
	 * @public
	 */
	UploadCollection.prototype.setSelectedItemById = function (sId, bSelect) {
		this._oList.setSelectedItemById(sId + "-cli", bSelect);
		this._setSelectedForItems([this._getUploadCollectionItemById(sId)], bSelect);
		return this;
	};

	/**
	 * Selects or deselects the given list item.
	 * @param {sap.m.UploadCollectionItem} oUploadCollectionItem The item whose selection is to be changed. This parameter is mandatory.
	 * @param {boolean} bSelect The selection state of the item. Default value is true.
	 * @returns {sap.m.UploadCollection} this to allow method chaining
	 * @since 1.34.0
	 * @public
	 */
	UploadCollection.prototype.setSelectedItem = function (oUploadCollectionItem, bSelect) {
		return this.setSelectedItemById(oUploadCollectionItem.getId(), bSelect);
	};

	/**
	 * Select all items in "MultiSelection" mode.
	 * @returns {sap.m.UploadCollection} this to allow method changing
	 * @since 1.34.0
	 * @public
	 */
	UploadCollection.prototype.selectAll = function () {
		var aSelectedList = this._oList.selectAll();
		if (aSelectedList.getItems().length !== this.getItems().length) {
			Log.info("Internal 'List' and external 'UploadCollection' are not in sync.");
		}
		this._setSelectedForItems(this.getItems(), true);
		return this;
	};

	/**
	 * Downloads the given item.
	 * This function delegates to {@link sap.m.UploadCollectionItem#download oUploadCollectionItem.download}.
	 * @param {sap.m.UploadCollectionItem} oItem The item to download. This parameter is mandatory.
	 * @param {boolean} bAskForLocation Decides whether to ask for a location to download or not.
	 * @returns {boolean} True if the download has started successfully. False if the download couldn't be started.
	 * @since 1.36.0
	 * @public
	 */
	UploadCollection.prototype.downloadItem = function (oItem, bAskForLocation) {
		return this._getUploader().downloadItem(oItem, bAskForLocation);
	};

	/**
	 * Opens the FileUploader dialog. When an UploadCollectionItem is provided, this method can be used to update a file with a new version.
	 * In this case, the upload progress can be sequenced using the events: beforeUploadStarts, uploadComplete and uploadTerminated. For this use,
	 * multiple properties from the UploadCollection have to be set to false. If no UploadCollectionItem is provided, only the dialog opens
	 * and no further configuration of the UploadCollection is needed.
	 * @param {sap.m.UploadCollectionItem} oItem The item to update with a new version. This parameter is mandatory.
	 * @returns {sap.m.UploadCollection} this to allow method chaining
	 * @since 1.38.0
	 * @public
	 */
	UploadCollection.prototype.openFileDialog = function (oItem) {
		var oFU = this._getFileUploader();
		if (oFU) {
			if (oItem) {
				if (!oFU.getMultiple()) {
					this._oItemToUpdate = oItem;
					oFU.$().find("input[type=file]").trigger("click");
				} else {
					Log.warning("Version Upload cannot be used in multiple upload mode.");
				}
			} else {
				oFU.$().find("input[type=file]").trigger("click");
			}
		}
		return this;
	};

	/* =========================================================== */
	/* Lifecycle methods                                           */
	/* =========================================================== */

	UploadCollection.prototype.onBeforeRendering = function () {
		if (this._oListEventDelegate) {
			this._oList.removeEventDelegate(this._oListEventDelegate);
			this._oListEventDelegate = null;
		}
		this._deregisterSizeHandler();
		this._unbindDragEnterLeave();
		checkInstantUpload.bind(this)();

		this._setNumberOfAttachmentsTitle(this.getItems().length);
		this._oList.setHeaderToolbar(this.getToolbar());

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

	UploadCollection.prototype.onAfterRendering = function () {
		this._bindDragEnterLeave();
		this._registerSizeHandler();

		if (this._oEditModeItem) {
			var $oEditBox = this._oEditModeItem._getFileNameEdit().$("inner");
			if ($oEditBox) {
				if (!Device.os.ios) {
					$oEditBox.focus(function () {
						$oEditBox.selectText(0, $oEditBox.val().length);
					});
				}
				$oEditBox.focus();
			}
		}

		if (this.getInstantUpload()) {
			if (this._sFocusId) {
				// Set focus on line item after status = Edit
				this._setFocusToLineItem(this._sFocusId);
				this._sFocusId = null;
			} else if (this.sDeletedItemId) {
				// Set focus on line item after an item was deleted
				this._setFocusAfterDeletion();
			}
		} else if (this._sFocusId) {
			// Set focus after removal of file from upload list
			this._setFocusToLineItem(this._sFocusId);
			this._sFocusId = null;
		}
	};

	UploadCollection.prototype.exit = function () {
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
		if (this._oRenderManager) {
			this._oRenderManager.destroy();
		}

		this._deregisterSizeHandler();
	};

	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */

	UploadCollection.prototype._checkRestrictions = function () {
		this.getItems().forEach(function (oItem) {
			this._checkRestrictionsForItem(oItem);
		}.bind(this));
	};

	UploadCollection.prototype._checkRestrictionsForItem = function (oItem) {
		oItem._checkFileTypeRestriction(this.getFileType());
		oItem._checkFileNameLengthRestriction(this.getMaximumFilenameLength());
		oItem._checkFileSizeRestriction(this.getMaximumFileSize());
		oItem._checkMimeTypeRestriction(this.getMimeType());
	};

	/**
	 * @private
	 */
	UploadCollection.prototype._getUploader = function () {
		return this.getUploader() || this._getDefaultUploader();
	};

	/**
	 * @private
	 */
	UploadCollection.prototype._getDefaultUploader = function () {
		var that = this, aFile;
		if (!this._oUploader) {
			this._oUploader = {
				uploadItem: function (oItem) {
					if (oItem) {
						aFile = [oItem._getFileObject()];
						if (that._getFileUploader()._areFilesAllowed(aFile)) {
							that._getFileUploader()._sendFilesWithXHR(aFile);
						}
					}
				},
				downloadItem: function (oItem, bAskForLocation) {
					if (oItem) {
						return oItem.download(bAskForLocation);
					}
				},
				terminateItem: function (oItem) {
					if (oItem) {
						that._getFileUploader().abort(
							that._headerParamConst.fileNameRequestIdName,
							that._encodeToAscii(oItem.getFileName()) + oItem._requestIdName);
					}
				}
			};
		}

		return this._oUploader;
	};

	UploadCollection.prototype._uploadItemIfGoodToGo = function (oItem) {
		if (oItem.getUploadState() === UploadState.Ready && !oItem._isRestricted()) {
			this._refreshFileUploaderParams(oItem);
			this._getUploader().uploadItem(oItem);
			oItem.setUploadState(UploadState.Uploading);
		}
	};

	/**
	 * Binds the handlers for drag and drop events.
	 *
	 * @private
	 */
	UploadCollection.prototype._bindDragEnterLeave = function () {
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
	UploadCollection.prototype._unbindDragEnterLeave = function () {
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
	UploadCollection.prototype._onDragEnterUIArea = function (event) {
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
	UploadCollection.prototype._onDragOverUIArea = function (event) {
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
	UploadCollection.prototype._onDragLeaveUIArea = function (event) {
		if (this._oLastEnterUIArea === event.target) {
			this._$DragDropArea.addClass("sapMUCDragDropOverlayHide");
		}
	};

	/**
	 * Handler when file is dropped on UIArea.
	 * @param {jQuery.Event} event The jQuery event object
	 * @private
	 */
	UploadCollection.prototype._onDropOnUIArea = function (event) {
		this._$DragDropArea.addClass("sapMUCDragDropOverlayHide");
	};

	/**
	 * Handler when file is dragged in UploadCollection drop enabled area.
	 * @param {jQuery.Event} event The jQuery event object
	 * @private
	 */
	UploadCollection.prototype._onDragEnterUploadCollection = function (event) {
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
	UploadCollection.prototype._onDragOverUploadCollection = function (event) {
		event.preventDefault();
	};

	/**
	 * Handler when file is dragged away from UploadCollection drop enabled area.
	 * @param {jQuery.Event} event The jQuery event object
	 * @private
	 */
	UploadCollection.prototype._onDragLeaveUploadCollection = function (event) {
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
	UploadCollection.prototype._checkForFiles = function (event) {
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
	UploadCollection.prototype._isDragAndDropAllowed = function () {
		return this.getUploadEnabled() && !this.getUploadButtonInvisible();
	};

	/**
	 * Handler when file is dropped on UploadCollection drop enabled area.
	 * @param {jQuery.Event} event The jQuery event object
	 * @private
	 */
	UploadCollection.prototype._onDropOnUploadCollection = function (event) {
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
			if (!this._getFileUploader()._areFilesAllowed(aFiles)) {
				return;
			}

			this._getFileUploader().fireChange({
				files: aFiles
			});
		}
	};

	/**
	 * Hides the icon when the height of the drag enabled area is smaller than 10rem
	 * @private
	 */
	UploadCollection.prototype._adjustDragDropIcon = function () {
		// Icon is displayed when the drag enabled area more than 10rem(160px)
		if (this._$DragDropArea[0].offsetHeight < 160) {
			this.getAggregation("_dragDropIcon").$().hide();
		}
	};

	/**
	 * Registers the onResize and orientation handlers.
	 * @private
	 */
	UploadCollection.prototype._registerSizeHandler = function () {
		this._sReziseHandlerId = ResizeHandler.register(this, this._onResize.bind(this));
		Device.orientation.attachHandler(this._onResize, this);
	};

	/**
	 * Deregisters the onResize and orientation handlers.
	 * @private
	 */
	UploadCollection.prototype._deregisterSizeHandler = function () {
		Device.orientation.detachHandler(this._onResize, this);
		ResizeHandler.deregister(this._sReziseHandlerId);
	};

	/**
	 * Gives the position of the place holder for the FileUploader that every toolbar provided by the application must have.
	 * @param {sap.m.OverflowToolbar} oToolbar Toolbar where to find the placeholder
	 * @return {int} The position of the place holder or -1 if there's no placeholder.
	 * @private
	 */
	UploadCollection.prototype._getFileUploaderPlaceHolderPosition = function (oToolbar) {
		for (var i = 0; i < oToolbar.getContent().length; i++) {
			if (oToolbar.getContent()[i] instanceof UploadCollectionToolbarPlaceholder) {
				return i;
			}
		}
		return -1;
	};

	/**
	 * Inserts the given FileUploader object into the current Toolbar at the position of the placeholder.
	 * @param {sap.ui.unified.FileUploader} oFileUploader The FileUploader object to insert into the Toolbar
	 * @private
	 */
	UploadCollection.prototype._setFileUploaderInToolbar = function (oFileUploader) {
		this._oHeaderToolbar.getContent()[this._iFileUploaderPH].setVisible(false);
		this._oHeaderToolbar.insertContent(oFileUploader, this._iFileUploaderPH);
	};

	/**
	 * Selects press handler depending on listener
	 * @param {sap.ui.base.Event} event The event object of the press event
	 * @param {sap.m.UploadCollectionItem} oItem The item being processed
	 * @private
	 */
	UploadCollection.prototype._onItemPressed = function (event, oItem) {
		if (oItem.hasListeners("press")) {
			oItem.firePress();
		} else if (this.sErrorState !== "Error" && jQuery.trim(oItem.getProperty("url"))) {
			this._triggerLink(event);
		}
	};

	/**
	 * Access and initialization for title number of attachments. Sets internal value.
	 * @param {int} [iCount=0] Number of attachments
	 * @private
	 */
	UploadCollection.prototype._setNumberOfAttachmentsTitle = function (iCount) {
		var nItems = iCount || 0;
		var sText;
		// When a file is being updated to a new version, there is one more file on the server than in the list so this corrects that mismatch.
		if (this._oItemToUpdate) {
			nItems--;
		}
		sText = this.getNumberOfAttachmentsText() || this._oRb.getText("UPLOADCOLLECTION_ATTACHMENTS", [nItems]);
		if (!this._oNumberOfAttachmentsTitle) {
			this._oNumberOfAttachmentsTitle = new Title(this.getId() + "-numberOfAttachmentsTitle", {
				text: sText
			});
			this.addDependent(this._oNumberOfAttachmentsTitle);
		} else {
			this._oNumberOfAttachmentsTitle.setText(sText);
		}
	};

	/**
	 * Makes file upload button invisible.
	 * @param {boolean} bUploadButtonInvisible Defines whether the upload button is visible or not.
	 * @private
	 */
	UploadCollection.prototype._setFileUploaderVisibility = function (bUploadButtonInvisible) {
		var aToolbarElements = this.getToolbar().getContent();
		if (aToolbarElements) {
			var oPlaceHolder = aToolbarElements[this._iFileUploaderPH];
			if (oPlaceHolder instanceof FileUploader) {
				oPlaceHolder.setVisible(!bUploadButtonInvisible);
			}
		}
	};

	/* =========================================================== */
	/* Handle UploadCollection events                              */
	/* =========================================================== */
	/**
	 * Handling of the deletion of an uploaded file.
	 * @param {object} event Event of the deletion.
	 * @param {UploadCollectionItem} oItem Item to be deleted.
	 * @private
	 */
	UploadCollection.prototype._handleDelete = function (event, oItem) {
		var sCompact = "",
			sFileName,
			sMessageText;

		if (oItem.hasListeners("deletePress")) {
			oItem.fireDeletePress();
			return;
		}

		if (this.hasStyleClass("sapUiSizeCompact")) {
			sCompact = "sapUiSizeCompact";
		}

		if (this._oEditModeItem) {
			// In case there is a list item in edit mode, the edit mode has to be finished first.
			this._handleOk(event, this._oEditModeItem);
			// If there is an error, the deletion must not continue
			if (this._oEditModeItem._getContainsError()) {
				return;
			}
		}

		if (oItem.getEnableDelete()) {
			sFileName = oItem.getFileName();
			if (!sFileName) {
				sMessageText = this._oRb.getText("UPLOADCOLLECTION_DELETE_WITHOUT_FILENAME_TEXT");
			} else {
				sMessageText = this._oRb.getText("UPLOADCOLLECTION_DELETE_TEXT", sFileName);
			}
			this._oItemToBeDeleted = oItem;
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
	 * @param {sap.m.MessageBox.Action} sAction Action to be executed at closing the message box
	 * @private
	 */
	UploadCollection.prototype._onCloseMessageBoxDeleteItem = function (sAction) {
		if (sAction !== MessageBox.Action.OK) {
			return;
		}

		this.fireFileDeleted({
			documentId: this._oItemToBeDeleted.getDocumentId(),
			item: this._oItemToBeDeleted
		});
		this.removeItem(this._oItemToBeDeleted);
		this._oItemToBeDeleted = null;
	};

	/**
	 * Handling of termination of an uploading process
	 * @param {sap.ui.base.Event} event Event of the upload termination
	 * @param {sap.m.UploadCollectionItem} oItem Context of the upload termination
	 * @private
	 */
	UploadCollection.prototype._handleTerminateRequest = function (event, oItem) {
		var oFileList = new List({
				items: [
					new StandardListItem({
						title: oItem.getFileName(),
						icon: UploadCollectionItem._getIconFromFileName(oItem.getFileName())
					})
				]
			}),
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
						press: function () {
							oDialog.close();
						}
					})
				],
				afterClose: function () {
					oDialog.destroy();
				}
			});
		this.addDependent(oDialog);
		oDialog.open();

		function onPressOk() {
			if (oItem.getUploadState() === UploadState.Uploading) {
				if (this.fireBeforeUploadTermination({item: oItem})) {
					this._handleUploadTermination(oItem);
				}
			} else if (oItem.getUploadState() === UploadState.Complete) {
				this.fireFileDeleted({
					documentId: oItem.getDocumentId(),
					item: oItem
				});
				this.removeItem(oItem);
			}

			oDialog.close();
			this.invalidate();
		}
	};

	UploadCollection.prototype._handleUploadTermination = function (oItem) {
		this._getUploader().terminateItem(oItem);
	};

	/**
	 * Handling of event of the edit button
	 * @param {object} event Event of the edit button
	 * @param {object} oItem The Item in context of the edit button
	 * @private
	 */
	UploadCollection.prototype._handleEdit = function (event, oItem) {
		if (this._oEditModeItem) {
			this._handleOk(event, this._oEditModeItem);
		}
		if (!this._oEditModeItem) {
			if (this.fireBeforeItemEdited({item: oItem})) {
				this._oEditModeItem = oItem;
				this._oEditModeItem._setIsEdited(true);
			}
		}
	};

	/**
	 * Handling of 'click' of the list (items + header)
	 * @param {sap.ui.base.Event} event Event of the 'click'
	 * @param {UploadCollectionItem} oItem List item id/identifier where the click was triggered
	 * @private
	 */
	UploadCollection.prototype._handleClick = function (event, oItem) {
		var oTarget = sap.ui.getCore().byId(event.target.id),
			oRealTarget;

		if (!this._oEditModeItem) {
			return;
		}

		// The only non-action during editing is clicking sonewhere into edited item's Input
		if (!oTarget && event.target.parentElement && event.target.parentElement.parentElement) {
			oRealTarget = sap.ui.getCore().byId(event.target.parentElement.parentElement.id);
			if (oRealTarget === this._oEditModeItem._getFileNameEdit()) {
				return;
			}
		}

		// When an item is edited, clicking anywhere else than on the Input itself leads to confirming editing, with the exception of Cancel button
		if (oTarget === this._oEditModeItem._getCancelRenameButton()) {
			this._handleCancel(event, this._oEditModeItem);
		} else {
			this._handleOk(event, this._oEditModeItem);
		}
	};

	/**
	 * Handling of 'OK' of the list item.
	 * @param {object} event Event of the 'OK' activity.
	 * @param {UploadCollectionItem} oItem List item that is the ok subject.
	 * @private
	 */
	UploadCollection.prototype._handleOk = function (event, oItem) {
		var oEdit = oItem._getFileNameEdit(),
			sNewFileName, sNewFullName,
			sOrigFullFileName = oItem.getFileName(),
			oFile = UploadCollectionItem._splitFileName(sOrigFullFileName);

		// get new/changed file name and remove potential leading spaces
		sNewFileName = oEdit.getValue().trim();
		this._sFocusId = oItem.getId() + "-cli";

		if (!sNewFileName || sNewFileName.length === 0) {
			oItem._setContainsError(true);
			return;
		}

		if (oFile.name === sNewFileName) {
			oItem._setContainsError(false);
			oItem._setIsEdited(false);
			this._oEditModeItem = null;
			return;
		}

		sNewFullName = sNewFileName + "." + oFile.extension;
		if (this.getSameFilenameAllowed() || !this._checkDoubleFileName(sNewFullName)) {
			oItem._setContainsError(false);
			this._onEditItemOk.bind(this)(sNewFullName);
		} else {
			oItem._setContainsError(true);
		}
	};

	/**
	 * Handling of edit item
	 * @param {string} sNewFileName New file name
	 * @private
	 */
	UploadCollection.prototype._onEditItemOk = function (sNewFileName) {
		if (this._oEditModeItem) {
			this._oEditModeItem.setFileName(sNewFileName);
			this._oEditModeItem._setIsEdited(false);
			this.fireFileRenamed({
				// deprecated
				documentId: this._oEditModeItem.getDocumentId(),
				fileName: sNewFileName,
				// new
				item: this._oEditModeItem
			});
			this._oEditModeItem = null;
		}
	};

	/**
	 * Handling of canceled editing of an item.
	 *
	 * @param {object} event Event of the 'cancel' activity.
	 * @param {UploadCollectionItem} oItem List item to cancel editiong of.
	 * @private
	 */
	UploadCollection.prototype._handleCancel = function (event, oItem) {
		this._sFocusId = oItem.getId() + "-cli";
		this._oEditModeItem = null;
		oItem._setIsEdited(false);
	};

	/* =========================================================== */
	/* Handle FileUploader events                                  */
	/* =========================================================== */
	/**
	 * Handling of the Event change of the fileUploader
	 * @param {object} event Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onChange = function (event) {
		if (!event) {
			return;
		}
		var sRequestIdValue,
			oFiles = event.getParameter("files"),
			aFiles = [],
			iCountFiles = oFiles.length,
			i,
			oItem,
			sFileSizeFormatted,
			oAttr;

		// FileUploader fires the change event also if no file was selected by the user.
		// If so, do nothing.
		if (iCountFiles === 0) {
			return;
		}

		this.fireChange({
			// deprecated
			getParameter: function (sParameter) {
				return sParameter ? event.getParameter(sParameter) : null;
			},
			getParameters: function () {
				return event.getParameters();
			},
			mParameters: event.getParameters(),
			// new
			files: oFiles
		});

		// Need to explicitly copy the file list, FileUploader deliberately resets its form completely along with 'files' parameter
		// when it (mistakenly) thinks that all is done.
		for (i = 0; i < iCountFiles; i++) {
			aFiles.push(oFiles[i]);
		}

		aFiles.forEach(function (oFile) {
			oItem = new UploadCollectionItem({
				fileName: oFile.name
			});
			oItem._setFileObject(oFile);
			oItem.setUploadState(UploadState.Ready);
			oItem._percentUploaded = 0;

			// Request identification
			this._requestIdValue++;
			sRequestIdValue = this._requestIdValue.toString();
			oItem._requestIdName = sRequestIdValue;
			this._mRequestIdToItemMap[sRequestIdValue] = oItem;

			// Attributes
			sFileSizeFormatted = this._oFormatDecimal.format(oFile.size);
			oAttr = new ObjectAttribute({text: sFileSizeFormatted});
			oItem.insertAggregation("attributes", oAttr, true);

			this.fireAfterItemAdded({item: oItem});

			this.insertItem(oItem);
			if (this.getInstantUpload()) {
				this._uploadItemIfGoodToGo(oItem);
			}
		}.bind(this));
	};

	UploadCollection.prototype._refreshFileUploaderParams = function (oItem) {
		this._getFileUploader().removeAllAggregation("headerParameters", true);
		this._getFileUploader().removeAllAggregation("parameters", true);

		// Params
		this.getParameters().forEach(function (oParam) {
			this._getFileUploader().addParameter(new FileUploaderParameter({
				name: oParam.getName(),
				value: oParam.getValue()
			}));
		}.bind(this));

		// Header params
		this.getHeaderParameters().forEach(function (aHeadParam) {
			this._getFileUploader().addHeaderParameter(new FileUploaderParameter({
				name: aHeadParam.getName(),
				value: aHeadParam.getValue()
			}));
		}.bind(this));

		// Request identifier
		this._getFileUploader().addHeaderParameter(new FileUploaderParameter({
			name: this._headerParamConst.requestIdName,
			value: oItem._requestIdName
		}));
	};

	/**
	 * Handling of the Event filenameLengthExceed of the fileUploader
	 * @param {sap.ui.base.Event} event Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onFileNameLengthExceed = function (event) {
		var oFile = {name: event.getParameter("fileName")};
		var aFiles = [oFile];
		this.fireFilenameLengthExceed({
			// deprecated
			getParameter: function (sParameter) {
				if (sParameter) {
					return event.getParameter(sParameter);
				}
			},
			getParameters: function () {
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
	UploadCollection.prototype._onFileSizeExceed = function (event) {
		var oFile = {
			name: event.getParameter("fileName"),
			fileSize: event.getParameter("fileSize")
		};

		this.fireFileSizeExceed({
			// deprecated
			getParameter: function (sParameter) {
				if (sParameter) {
					return event.getParameter(sParameter);
				}
			},
			getParameters: function () {
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
	UploadCollection.prototype._onTypeMissmatch = function (event) {
		var oFile = {
			name: event.getParameter("fileName"),
			fileType: event.getParameter("fileType"),
			mimeType: event.getParameter("mimeType")
		};
		var aFiles = [oFile];
		this.fireTypeMissmatch({
			// deprecated
			getParameter: function (sParameter) {
				if (sParameter) {
					return event.getParameter(sParameter);
				}
			},
			getParameters: function () {
				return event.getParameters();
			},
			mParameters: event.getParameters(),
			// new
			files: aFiles
		});
	};

	/**
	 * Handling of the Event uploadTerminated of the fileUploader
	 * @param {sap.ui.base.Event} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadTerminated = function (oEvent) {
		var sRequestId = this._getRequestId(oEvent);
		var sFileName = oEvent.getParameter("fileName");

		var oItem = this._mRequestIdToItemMap[sRequestId];
		this.removeItem(oItem);

		this.fireUploadTerminated({
			fileName: sFileName,
			getHeaderParameter: this._getHeaderParameterWithinEvent.bind(oEvent)
		});
	};

	/**
	 * Handling of the Event uploadComplete of the fileUploader to forward the Event to the application
	 * @param {sap.ui.base.Event} oEvent Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadComplete = function (oEvent) {
		if (oEvent) {
			var sRequestId = this._getRequestId(oEvent),
				sUploadedFile = oEvent.getParameter("fileName"),
				bUploadSuccessful = checkRequestStatus();

			var oItem = this._mRequestIdToItemMap[sRequestId];
			oItem.setUploadState(bUploadSuccessful ? UploadState.Complete : UploadState.Error);
			oItem._percentUploaded = 100;

			this.fireUploadComplete({
				// deprecated
				getParameter: oEvent.getParameter,
				getParameters: oEvent.getParameters,
				mParameters: oEvent.getParameters(),
				// new Stuff
				files: [
					{
						fileName: oEvent.getParameter("fileName") || sUploadedFile,
						responseRaw: oEvent.getParameter("responseRaw"),
						reponse: oEvent.getParameter("response"), // deprecated oEvent property
						response: oEvent.getParameter("response"),
						status: oEvent.getParameter("status"),
						headers: oEvent.getParameter("headers")
					}
				],
				item: oItem
			});
		}
		this.invalidate();

		function checkRequestStatus() {
			var sRequestStatus = oEvent.getParameter("status").toString() || "200";
			return sRequestStatus[0] === "2" || sRequestStatus[0] === "3";
		}
	};

	/**
	 * Handling of the uploadProgress event of the fileUploader to forward the event to the application
	 * @param {sap.ui.base.Event} event Event of the fileUploader
	 * @private
	 */
	UploadCollection.prototype._onUploadProgress = function (event) {
		if (!event) {
			return;
		}

		var iPercentUploaded = Math.round(event.getParameter("loaded") / event.getParameter("total") * 100),
			sRequestId = this._getRequestId(event),
			oItem;

		oItem = this._mRequestIdToItemMap[sRequestId];
		oItem._setProgressInPercent(iPercentUploaded);
	};

	/**
	 * Get the Request ID from the header parameters of a fileUploader event
	 * @param {sap.ui.base.Event} event Event of the fileUploader
	 * @returns {string} Request ID
	 * @private
	 */
	UploadCollection.prototype._getRequestId = function (event) {
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

	UploadCollection.prototype._createFileUploader = function () {
		var sTooltip = this.getInstantUpload() ? this._oRb.getText("UPLOADCOLLECTION_UPLOAD") : this._oRb.getText("UPLOADCOLLECTION_ADD");
		return new FileUploader(this.getId() + "-1" + "-uploader", {
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
			uploadOnChange: this.getInstantUpload(),
			sameFilenameAllowed: true,
			uploadUrl: this.getUploadUrl(),
			useMultipart: false,
			sendXHR: true,
			change: [this._onChange, this],
			filenameLengthExceed: [this._onFileNameLengthExceed, this],
			fileSizeExceed: [this._onFileSizeExceed, this],
			typeMissmatch: [this._onTypeMissmatch, this],
			uploadAborted: [this._onUploadTerminated, this],
			uploadComplete: [this._onUploadComplete, this],
			uploadProgress: [this._onUploadProgress, this],
			uploadStart: [this._onUploadStart, this],
			visible: !this.getUploadButtonInvisible()
		});
	};

	/**
	 * Access and initialization of inner FileUploader.
	 * @returns {sap.ui.unified.FileUploader} Instance of the FileUploader
	 * @private
	 */
	UploadCollection.prototype._getFileUploader = function () {
		if (!this._oFileUploader) {
			this._oFileUploader = this._createFileUploader();
			this._oFileUploader.setParent(this, null, true);
		}
		return this._oFileUploader;
	};

	UploadCollection.prototype._getRenderManager = function () {
		if (!this._oRenderManager) {
			this._oRenderManager = sap.ui.getCore().createRenderManager();
		}
		return this._oRenderManager;
	};

	/**
	 * Creates the unique key for a file by concatenating the fileName with its requestId and puts it into the requestHeaders parameter of the FileUploader.
	 * It triggers the beforeUploadStarts oEvent for applications to add the header parameters for each file.
	 * @param {jQuery.Event} oEvent The jQuery Event object
	 * @private
	 */
	UploadCollection.prototype._onUploadStart = function (oEvent) {
		var oRequestHeaders,
			sRequestIdValue = this._getRequestId(oEvent),
			sFileName,
			oGetHeaderParameterResult = [],
			i;

		sFileName = oEvent.getParameter("fileName");
		oRequestHeaders = {
			name: this._headerParamConst.fileNameRequestIdName,
			value: this._encodeToAscii(sFileName) + sRequestIdValue
		};
		oEvent.getParameter("requestHeaders").push(oRequestHeaders);

		this.fireBeforeUploadStarts({
			fileName: sFileName,
			addHeaderParameter: addHeaderParameter,
			getHeaderParameter: getHeaderParameter.bind(this)
		});

		// ensure that the HeaderParameterValues are updated
		if (Array.isArray(oGetHeaderParameterResult)) {
			for (i = 0; i < oGetHeaderParameterResult.length; i++) {
				if (oEvent.getParameter("requestHeaders")[i].name === oGetHeaderParameterResult[i].getName()) {
					oEvent.getParameter("requestHeaders")[i].value = oGetHeaderParameterResult[i].getValue();
				}
			}
		} else if (oGetHeaderParameterResult instanceof UploadCollectionParameter) {
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
	 * Trigger of the link which will be executed when the icon or image was clicked
	 * @param {sap.ui.base.Event} event The SAPUI5 event object
	 * @private
	 */
	UploadCollection.prototype._triggerLink = function (event) {
		var iLine, aId;

		if (this._oEditModeItem) {
			//In case there is a list item in edit mode, the edit mode has to be finished first.
			this._handleOk(event, this._oEditModeItem);
			if (this.sErrorState === "Error") {
				//If there is an error, the link of the list item must not be triggered.
				return;
			}
			this._sFocusId = event.getParameter("id");
		}
		aId = event.oSource.getId().split("-");
		iLine = aId[aId.length - 2];
		MobileLibrary.URLHelper.redirect(this.getItems()[iLine].getProperty("url"), true);
	};

	// ================================================================================
	// Keyboard activities
	// ================================================================================
	/**
	 * Keyboard support: Handling of different key activities
	 * @param {sap.ui.base.Event} event The SAPUI5 event object
	 * @private
	 */
	UploadCollection.prototype.onkeydown = function (event) {
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
	// Helpers
	// ================================================================================
	/**
	 * Set the focus after the list item was deleted.
	 * @private
	 */
	UploadCollection.prototype._setFocusAfterDeletion = function () {
		var iLength = this.getItems().length;
		var sLineId;

		if (iLength === 0) {
			this._getFileUploader().focus();
		} else {
			var iLineNumber = this.sDeletedItemId.split("-").pop();

			// If the bottommost item has been deleted, its predecessor receives focus.
			// If any other item has been deleted, its successor receives focus.
			if (iLineNumber <= iLength - 1) {
				sLineId = this.sDeletedItemId + "-cli";
			} else {
				sLineId = this.getItems()[this.getItems().length - 1].sId + "-cli";
			}
			this._setFocusToLineItem(sLineId);
		}

		this.sDeletedItemId = null;
	};

	/**
	 * Set the focus to the list item.
	 * @param {string} sItemId ListItem which should get the focus
	 * @private
	 */
	UploadCollection.prototype._setFocusToLineItem = function (sItemId) {
		this.$(sItemId).focus();
	};

	/**
	 * Handle of keyboard activity ENTER.
	 * @param {sap.ui.base.Event} event The SAPUI5 event object
	 * @private
	 */
	UploadCollection.prototype._handleENTER = function (event) {
		var sTarget, sLinkId, oLink, iLine;
		if (this._oEditModeItem) {
			sTarget = event.target.id.split(this._oEditModeItem.getId()).pop();
		} else {
			sTarget = event.target.id.split("-").pop();
		}

		switch (sTarget) {
			case "-" + UploadCollectionItem.FILE_NAME_EDIT_ID + "-inner" :
			case "-okButton":
				this._handleOk(event, this._oEditModeItem);
				break;
			case "-cancelButton" :
				event.preventDefault();
				this._handleCancel(event, this._oEditModeItem);
				break;
			case "-ia_iconHL":
			case "-ia_imageHL":
				iLine = this._oEditModeItem.getId().split("-").pop();
				MobileLibrary.URLHelper.redirect(this.getItems()[iLine].getProperty("url"), true);
				break;
			case "ia_iconHL":
			case "ia_imageHL":
			case "cli":
				sLinkId = event.target.id.split(sTarget)[0] + "ta_filenameHL";
				oLink = sap.ui.getCore().byId(sLinkId);
				if (oLink.getEnabled()) {
					iLine = event.target.id.split("-")[2];
					MobileLibrary.URLHelper.redirect(this.getItems()[iLine].getProperty("url"), true);
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
	UploadCollection.prototype._handleDEL = function (event) {
		if (!this._oEditModeItem && this.getSelectedItem()) {
			this._handleDelete(event, this.getSelectedItem());
		}
	};

	/**
	 * Handle of keyboard activity ESC.
	 * @param {sap.ui.base.Event} oEvent The SAPUI5 oEvent object
	 * @private
	 */
	UploadCollection.prototype._handleESC = function (oEvent) {
		if (this._oEditModeItem) {
			this._sFocusId = this._oEditModeItem + "-cli";
			this._handleCancel(oEvent, this._oEditModeItem);
		}
	};

	/**
	 * Handle of keyboard activity F2.
	 * @param {sap.ui.base.Event} oEvent The SAPUI5 oEvent object
	 * @private
	 */
	UploadCollection.prototype._handleF2 = function (oEvent) {
		if (this._oEditModeItem) {
			this._handleOk(oEvent, this._oEditModeItem);
		} else if (this.getSelectedItem()) {
			this._handleEdit(oEvent, this.getSelectedItem());
		}
	};

	/**
	 * Determines if the fileName is already in usage.
	 * @param {string} sFileName inclusive file extension
	 * @returns {boolean} true for an already existing item with the same file name(independent of the path)
	 * @private
	 */
	UploadCollection.prototype._checkDoubleFileName = function (sFileName) {
		var aItems = this.getItems();
		if (aItems.length === 0 || !sFileName) {
			return false;
		}

		var iLength = aItems.length;
		sFileName = sFileName.trim();

		for (var i = 0; i < iLength; i++) {
			if (sFileName === aItems[i].getProperty("fileName")) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Helper function for better Event API. This reference points to the oEvent coming from the FileUploader
	 * @param {string} sHeaderParameterName Header parameter name (optional)
	 * @returns {UploadCollectionParameter | UploadCollectionParameter[] | null} Header parameter or null
	 * @private
	 */
	UploadCollection.prototype._getHeaderParameterWithinEvent = function (sHeaderParameterName) {
		var aUcpRequestHeaders = [],
			aRequestHeaders = this.getParameter("requestHeaders"),
			iParamCounter = aRequestHeaders.length,
			i;

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
	 * @param {string} sValue The input value that will be encoded
	 * @returns {string} The ASCII encoded string
	 * @private
	 */
	UploadCollection.prototype._encodeToAscii = function (sValue) {
		var sEncodedValue = "";
		for (var i = 0; i < sValue.length; i++) {
			sEncodedValue = sEncodedValue + sValue.charCodeAt(i);
		}
		return sEncodedValue;
	};

	/**
	 * Handles ResizeEvent of UploadCollection to align ObjectMarkers and FileName correctly
	 * @private
	 */
	UploadCollection.prototype._onResize = function () {
		// 	/* eslint-disable no-loop-func */
		this.getItems().forEach(function (oItem) {
			setTimeout(function () {
				this._truncateFileName();
			}.bind(oItem), UploadCollection._resizeTimeoutInterval);
		});
		/* eslint-enable no-loop-func */
	};

	/**
	 * Returns UploadCollectionItem based on the items aggregation
	 * @param {sap.m.ListItemBase} oListItem The list item used to find the UploadCollectionItem
	 * @returns {sap.m.UploadCollectionItem} The matching UploadCollectionItem
	 * @private
	 */
	UploadCollection.prototype._getUploadCollectionItemByListItem = function (oListItem) {
		var aAllItems = this.getItems();
		for (var i = 0; i < aAllItems.length; i++) {
			if (aAllItems[i].getId() === oListItem.getId().replace("-cli", "")) {
				return aAllItems[i];
			}
		}
		return null;
	};

	/**
	 * Returns UploadCollectionItem based on the items aggregation
	 * @param {string} sUploadCollectionItemId used for finding the UploadCollectionItem
	 * @returns {sap.m.UploadCollectionItem} The matching UploadCollectionItem
	 * @private
	 */
	UploadCollection.prototype._getUploadCollectionItemById = function (sUploadCollectionItemId) {
		var aAllItems = this.getItems();
		for (var i = 0; i < aAllItems.length; i++) {
			if (aAllItems[i].getId() === sUploadCollectionItemId) {
				return aAllItems[i];
			}
		}
		return null;
	};

	/**
	 * Returns an array of UploadCollection items based on the items aggregation
	 * @param {sap.m.ListItemBase[]} aListItems The list items used for finding the UploadCollectionItems
	 * @returns {sap.m.UploadCollectionItem[]} The matching UploadCollectionItems
	 * @private
	 */
	UploadCollection.prototype._getUploadCollectionItemsByListItems = function (aListItems) {
		var aUploadCollectionItems = [];
		var aLocalUploadCollectionItems = this.getItems();

		if (aListItems) {
			for (var i = 0; i < aListItems.length; i++) {
				for (var j = 0; j < aLocalUploadCollectionItems.length; j++) {
					if (aListItems[i].getId().replace("-cli", "") === aLocalUploadCollectionItems[j].getId()) {
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
	 * @param {sap.m.ListItemBase[]} aUploadCollectionItemsToUpdate The list items the selection state is to be set for
	 * @param {boolean} bSelected The new selection state
	 * @private
	 */
	UploadCollection.prototype._setSelectedForItems = function (aUploadCollectionItemsToUpdate, bSelected) {
		// Reset all 'selected' values in UploadCollectionItems
		if (this.getMode() !== Library.ListMode.MultiSelect && bSelected) {
			var aUploadCollectionItems = this.getItems();
			for (var j = 0; j < aUploadCollectionItems.length; j++) {
				aUploadCollectionItems[j].setSelected(false);
			}
		}
		for (var i = 0; i < aUploadCollectionItemsToUpdate.length; i++) {
			aUploadCollectionItemsToUpdate[i].setSelected(bSelected);
		}
	};

	/**
	 * Handles the firing of the selectionChange event and updates the items' selection states.
	 * @param {sap.ui.base.Event} event The SAPUI5 event object
	 * @private
	 */
	UploadCollection.prototype._handleSelectionChange = function (event) {
		var aListItems = event.getParameter("listItems"),
			oListItem = event.getParameter("listItem"),
			bSelected = event.getParameter("selected"),
			aUploadCollectionListItems = this._getUploadCollectionItemsByListItems(aListItems),
			oUploadCollectionItem = this._getUploadCollectionItemByListItem(oListItem);

		if (oUploadCollectionItem && oListItem && aUploadCollectionListItems) {
			this.fireSelectionChange({
				selectedItem: oUploadCollectionItem,
				selectedItems: aUploadCollectionListItems,
				selected: bSelected
			});
			oUploadCollectionItem.setSelected(oListItem.getSelected());
		}
	};

	UploadCollection.prototype._updateGroups = function (oObject, bAddition) {
		var oBinding = this.getBinding("items"),
			oBindingInfo = this.getBindingInfo("items"),
			oBindingContext, oGroup, fnGroupHeaderFactory, oGroupListItem;

		if (oBinding && oBinding.isGrouped()) {
			oBindingContext = oObject.getBindingContext(oBindingInfo.model);
			oGroup = oBinding.getGroup(oBindingContext);
			fnGroupHeaderFactory = oBindingInfo.groupHeaderFactory;
			if (bAddition) {
				if (!this._mGroups[oGroup.key]) {
					if (fnGroupHeaderFactory) {
						oGroupListItem = this._oList.addItemGroup(oGroup, fnGroupHeaderFactory(oGroup), true);
					} else {
						oGroupListItem = this._oList.addItemGroup(oGroup, null, true);
					}
					this._mGroups[oGroup.key] = {count: 1, listItem: oGroupListItem}; // Set up a new group
				} else {
					this._mGroups[oGroup.key].count++;
				}
			} else { // Removal
				if (this._mGroups[oGroup.key].count > 0) {
					this._mGroups[oGroup.key].count--;
					if (this._mGroups[oGroup.key].count === 0) { // Group is out of members, remove it
						this._mGroups[oGroup.key].listItem.destroy();
						delete this._mGroups[oGroup.key];
					}
				} else {
					delete this._mGroups[oGroup.key];
				}
			}
		}
	};

	UploadCollection.prototype._syncListItem = function (oObject, iIndex) {
		var oListItem;
		this._updateGroups(oObject, true);
		oListItem = oObject._getListItem();
		this._mListItemIdToItemMap[oListItem.getId()] = oObject;
		if (iIndex || iIndex === 0) {
			this._oList.insertAggregation("items", oListItem, iIndex, true);
		} else {
			this._oList.addAggregation("items", oListItem, true);
		}
		this._checkRestrictionsForItem(oObject);
	};

	UploadCollection.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		Control.prototype.addAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		if (sAggregationName === "items") {
			this._syncListItem(oObject);
		}
		this._refreshInnerListStyle();
	};

	UploadCollection.prototype.insertAggregation = function (sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		Control.prototype.insertAggregation.call(this, sAggregationName, oObject, iIndex, bSuppressInvalidate);
		if (sAggregationName === "items") {
			this._syncListItem(oObject, iIndex || 0);
		}
		this._refreshInnerListStyle();
	};

	UploadCollection.prototype.removeAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		var oListItem;
		Control.prototype.removeAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		if (sAggregationName === "items") {
			oListItem = oObject._getListItem();
			var oItem = this._oList.removeAggregation("items", oListItem, bSuppressInvalidate);
			oItem.destroy();
			this._updateGroups(oObject, false);
		}
		this._refreshInnerListStyle();
	};

	UploadCollection.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {
		if (sAggregationName === "items") {
			this._oList.destroyAggregation("items", bSuppressInvalidate);
		}
		Control.prototype.removeAllAggregation.call(this, sAggregationName, bSuppressInvalidate);
	};

	UploadCollection.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
		if (sAggregationName === "items") {
			this._oList.destroyAggregation("items", bSuppressInvalidate);
		}
		Control.prototype.destroyAggregation.call(this, sAggregationName, bSuppressInvalidate);
	};

	UploadCollection.prototype._refreshInnerListStyle = function () {
		var iMaxIndex = this._oList.length;
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

	return UploadCollection;
});