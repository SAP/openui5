/*!
 * ${copyright}
 */

// Provides control sap.m.upload.UploadSetwithTable.
sap.ui.define([
	"sap/m/Table",
	"sap/m/ToolbarSpacer",
	"sap/m/upload/UploadSetwithTableRenderer",
	"sap/ui/core/Lib",
	"sap/ui/unified/FileUploader",
	"sap/m/upload/UploaderHttpRequestMethod",
	"sap/m/OverflowToolbar",
	"sap/m/upload/UploadSetwithTableItem",
	"sap/base/util/deepEqual",
	"sap/base/Log",
	"sap/m/library",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageSize",
	"sap/m/upload/UploaderTableItem",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/m/upload/FilePreviewDialog",
	"sap/ui/base/Event",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/MessageBox",
	"sap/m/Button",
	"sap/ui/fl/variants/VariantManagement",
	"sap/m/upload/p13n/PersManager",
	"sap/m/upload/p13n/mediator/ColumnsMediator",
	"sap/m/upload/p13n/mediator/SortMediator",
	"sap/m/upload/p13n/mediator/GroupMediator",
	"sap/m/upload/p13n/mediator/FilterMediator",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Element",
	"sap/m/MenuButton",
	"sap/m/MenuItem",
	"sap/m/Menu"
], function(Table, ToolbarSpacer, UploadSetwithTableRenderer, Library1, FileUploader, UploaderHttpRequestMethod, OverFlowToolbar, UploadSetwithTableItem, deepEqual, Log, Library, IllustratedMessageType, IllustratedMessage, IllustratedMessageSize, Uploader, DragDropInfo, DropInfo, FilePreviewDialog, EventBase, Dialog, Label, Input, MessageBox, Button, VariantManagement, PersManager, ColumnsMediator, SortMediator, GroupMediator, FilterMediator, View, Element, MenuButton, MenuItem, Menu) {
	"use strict";

	var MenuButtonMode = Library.MenuButtonMode;

	/**
	 * Constructor for a new UploadSetwithTable.
	 *
	 * @param {string} [sId] Id for the new control, it is generated automatically if no id is provided.
	 * @param {object} [mSettings] Initial settings for the new control.
	 * @class This control allows you to upload one or more files from your device, such as desktop, tablet or phone, and attach them to your application in a responsive tabular manner.<br>
	 * This control builds on the {@link sap.m.upload.UploadSet UploadSet} control. Provides flexibility to tailor the design of the table including columns, cells and the content to suit specific requirements.
	 *
	 * To render the <code> sap.m.upload.UploadSetwithTable </code>control properly, the order of the columns aggregation should match the order of the cells aggregation (sap.m.upload.UploadSetwithTableItem).
	 *
	 * <b>Note:</b> Control recommends to use <code> sap.m.upload.Column </code> with the columns aggregation. <code>sap.m.upload.Column</code> control is built on <code> sap.m.Column </code> ({@link sap.m.Column Column}) control and provides ability to define personalization specific properties for column and is essential to setup personalization for the <code>sap.m.upload.UploadSetwithTable</code> control.
	 * @extends sap.m.Table
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @deprecated as of version 1.124, replaced by {@link sap.m.plugins.UploadSetwithTable}
	 * @version ${version}
	 * @alias sap.m.upload.UploadSetwithTable
	 */
	var UploadSetwithTable = Table.extend("sap.m.upload.UploadSetwithTable", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * File types that are allowed to be uploaded.
				 * <br>If this property is not set, any file can be uploaded.
				 */
				fileTypes: {type: "string[]", defaultValue: null},
				/**
				 * Defined maximum length for a name of files that are to be uploaded.
				 * <br>If set to <code>null</code> or <code>0</code>, any file can be uploaded regardless length of its name.
				 */
				maxFileNameLength: {type: "int", defaultValue: null},
				/**
				 * Defined size limit in megabytes for files that are to be uploaded.
				 * <br>If set to <code>null</code> or <code>0</code>, files of any size can be uploaded.
				 */
				maxFileSize: {type: "float", defaultValue: null},
				/**
				 * Media types of files that are allowed to be uploaded.
				 * <br>If this property is not set, any file can be uploaded.
				 */
				mediaTypes: {type: "string[]", defaultValue: null},
				/**
				 * Custom text can be defined for the 'No data' text label. Customisation of text can be done for the empty state of the control.
				 */
				noDataText: {type: "string", defaultValue: "No documents available" },
				/**
				 * Custom text can be defined for the 'No data' text description. Customisation of text can be done for the empty state of the control.
				 */
				noDataDescription: {type: "string", defaultValue: "Drag and drop files here to upload" },
				/**
				 * Url where the uploaded files are stored.
				 */
				uploadUrl: {type: "string", defaultValue: null},
				/**
				 * HTTP request method chosen for file upload.
				 */
				httpRequestMethod: {type: "sap.m.upload.UploaderHttpRequestMethod", defaultValue: UploaderHttpRequestMethod.Post},
				/**
				 * Lets the user select multiple files from the same folder and then upload them.
				 *
				 * If multiple property is set to false, the control shows an error message if more than one file is chosen for drag & drop.
				 */
				multiple: {type: "boolean", group: "Behavior", defaultValue: false},
				/**
				 * If set to true, the button used for uploading files becomes invisible.
				 */
				uploadButtonInvisible: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Defines whether the upload action is allowed.
				 */
				uploadEnabled: {type: "boolean", defaultValue: true},
				/** Callback function to perform additional validations or configurations for the item queued up for upload and to finally trigger the upload.
				 * @callback sap.m.upload.UploadSetwithTable.itemValidationHandler
				 * @param {sap.m.upload.UploadSetwithTable.ItemInfo} oItemInfo The info of the item queued for upload.
				 * @returns {Promise<sap.m.upload.UploadSetwithTableItem>} oPromise, once resolved the UploadSetWithTable control initiates the upload.
				 * @public
				 * @deprecated as of version 1.124, replaced by {@link sap.m.plugins.UploadSetwithTable.itemValidationHandler}
				**/

				/**
				 * @typedef {object} sap.m.upload.UploadSetwithTable.ItemInfo
				 * @description Item info object sent as paramter to {@link sap.m.upload.UploadSetwithTable.itemValidationHandler itemValidationHandler callback}
				 * @property {sap.m.upload.UploadSetwithTableItem} oItem Current item queued for upload.
				 * @property {number} iTotalItemsForUpload Total count of items queued for upload.
				 * @property {sap.m.upload.UploadSetwithTable} oSource Source on which the callback was invoked.
				 * @public
				 * @deprecated as of version 1.124, replaced by {@link sap.m.plugins.UploadSetwithTable.ItemInfo}
				**/

				/**
				 * Defines a {@link sap.m.upload.UploadSetwithTable.itemValidationHandler callback function} that is invoked when each UploadSetwithTableItem is queued up for upload.
				 * This callback is invoked with {@link sap.m.upload.UploadSetwithTable.ItemInfo parameters} and the callback is expected to return a promise to the control. Once the promise is resolved, the control initiates the upload process.
				 * Configure this property only when any additional configuration or validations are to be performed before the upload of each item.
				 * The upload process is triggered manually by resolving the promise returned to the control.
				**/
				itemValidationHandler: {type: "function", defaultValue: null},
				/**
				 * Lets the user upload entire files from directories and sub directories.
				*/
				 directory: {type: "boolean", group: "Behavior", defaultValue: false},
				/**
				 * Determines which illustration type is displayed when the control holds no data.
				 */
				noDataIllustrationType: {type: "sap.m.IllustratedMessageType", group: "Appearance", defaultValue: IllustratedMessageType.UploadCollection},
				/**
				 * If set to true, the variant management gets enabled.
				 */
				enableVariantManagement: {type: "boolean", defaultValue: false},
				/**
				  * Enables CloudFile picker feature to upload files from cloud.
				  * @experimental Since 1.120
				  */
				cloudFilePickerEnabled: { type: "boolean", group: "Behavior", defaultValue: false },
				/**
				  * Url of the FileShare OData V4 service supplied for CloudFile picker control.
				  * @experimental Since 1.120.
				  */
				cloudFilePickerServiceUrl: { type: "sap.ui.core.URI", group: "Data", defaultValue: "" },
				/**
				  * The text of the CloudFile picker button. The default text is "Upload from cloud" (translated to the respective language).
				  * @experimental Since 1.120.
				  */
				cloudFilePickerButtonText: { type: 'string', defaultValue: "" }
			},
				aggregations: {
				/**
				 * Defines the uploader to be used. If not specified, the default implementation is used.
				 */
				uploader: {type: "sap.m.upload.UploaderTableItem", multiple: false},
				/**
				 * Header fields to be included in the header section of an XHR request.
				 */
				headerFields: {type: "sap.ui.core.Item", multiple: true, singularName: "headerField"}
			},
			associations: {
				/**
				 * Dialog with a carousel to preview files uploaded.
				 * <br>If it is not defined, the control creates and uses the instance of {@link sap.m.upload.FilePreviewDialog FilePreviewDialog}.
				 */
				previewDialog: {type: "sap.m.upload.FilePreviewDialog", multiple: false}
			},
			events: {
				/**
				 * The event is triggered when the file name is changed.
				 */
				itemRenamed: {
					parameters: {
						/**
						 * The renamed UI element is of UploadSetwithTableItem type.
						 */
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
					}
				},
				/**
				 * This event is fired right before the upload process begins.
				 */
				beforeUploadStarts: {
					parameters: {
						/**
						 * The file whose upload is just about to start.
						 */
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
					},
					allowPreventDefault: true
				},
				/**
				 * This event is fired right after the upload process is finished.
				 * <br>Based on the backend response of the application, listeners can use the parameters to determine if the upload was successful or if it failed.
				 */
				uploadCompleted: {
					parameters: {
						/**
						 * The file whose upload has just been completed.
						 */
						item: {type: "sap.m.upload.UploadSetwithTableItem"},
						/**
						 * Response message that comes from the server.
						*
						* On the server side this response has to be put within the &quot;body&quot; tags of the response
						* document of the iFrame. It can consist of a return code and an optional message. This does not
						* work in cross-domain scenarios.
						*/
						response : {type : "string"},
						/**
						 * ReadyState of the XHR request.
						 *
						 * Required for receiving a <code>readyState</code> is to set the property <code>sendXHR</code>
						 * to true. This property is not supported by Internet Explorer 9.
						 */
						readyState : {type : "string"},
						/**
						* Status of the XHR request.
						*
						* Required for receiving a <code>status</code> is to set the property <code>sendXHR</code> to true.
						* This property is not supported by Internet Explorer 9.
						*/
						status : {type : "string"},
						/**
						* Http-Response which comes from the server.
						*
						* Required for receiving <code>responseXML</code> is to set the property <code>sendXHR</code> to true.
						*
						* This property is not supported by Internet Explorer 9.
						*/
						responseXML : {type : "string"},
						/**
						* Http-Response which comes from the server.
						*
						* Required for receiving <code>responseText</code> is to set the property <code>sendXHR</code> to true.
						*
						* This property is not supported by Internet Explorer 9.
						*/
						responseText : {type : "string"},
						/**
						* Http-Response-Headers which come from the server.
						*
						* Provided as a JSON-map, i.e. each header-field is reflected by a property in the <code>headers</code>
						* object, with the property value reflecting the header-field's content.
						*
						* Required for receiving <code>headers</code> is to set the property <code>sendXHR</code> to true.
						* This property is not supported by Internet Explorer 9.
						*/
						headers : {type : "object"}
					}
				},
				/**
				 * This event is fired in either of the following cases:
				 * <ul>
				 * <li>When a file that is selected to be uploaded fails to meet the file type restriction
				 * (<code>fileType</code> property).</li>
				 * <li>When the file type restriction changes, and the file to be uploaded fails to meet the new
				 * restriction.</li>
				 * </ul>
				 */
				fileTypeMismatch: {
					parameters: {
						/**
						 * The file that fails to meet the file type restriction specified in the
						 * <code>fileType</code> property.
						 */
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
					}
				},
				/**
				 * This event is fired in either of the following cases:
				 * <ul>
				 * <li>When a file that is selected to be uploaded fails to meet the file name length restriction specified in the
				 * <code>maxFileNameLength</code> property.</li>
				 * <li>When the file name length restriction changes, and the file to be uploaded fails to meet the new
				 * restriction.</li>
				 * </ul>
				 */
				fileNameLengthExceeded: {
					parameters: {
						/**
						 * The file that fails to meet the file name length restriction specified in the
						 * <code>maxFileNameLength</code> property.
						 */
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
					}
				},
				/**
				 * This event is fired in either of the following cases:
				 * <ul>
				 * <li>When a file that is selected to be uploaded fails to meet the file size restriction specified in the
				 * <code>maxFileSize</code> property.</li>
				 * <li>When the file size restriction changes, and the file to be uploaded fails to meet the new
				 * restriction.</li>
				 * </ul>
				 */
				fileSizeExceeded: {
					parameters: {
						/**
						 * The file that fails to meet the file size restriction specified in the
						 * <code>maxFileSize</code> property.
						 */
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
					}
				},
				/**
				 * This event is fired in either of the following cases:
				 * <ul>
				 * <li>When a file that is selected to be uploaded fails to meet the media type restriction specified in the
				 * <code>mediaTypes</code> property.</li>
				 * <li>When the media type restriction changes, and the file to be uploaded fails to meet the new
				 * restriction.</li>
				 * </ul>
				 */
				mediaTypeMismatch: {
					parameters: {
						/**
						 * The file that fails to meet the media type restriction specified in the
						 * <code>mediaTypes</code> property.
						 */
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
					}
				},
				/**
				 * This event is fired just before initiating the file upload process when a file is selected to be uploaded.
				 * Use this event to set additional info dynamically, specific for each item before upload process is initiated.
				 */
				beforeInitiatingItemUpload: {
					parameters: {
						/**
						 * Items in ready state for upload process
						 */
						item: {type: "sap.m.upload.UploadSetwithTableItem"}
					}
				},
				/**
				 * This event is fired when the user starts dragging an uploaded item.
				 * @event
				 * @param {sap.ui.base.Event} oControlEvent
				 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
				 * @param {object} oControlEvent.getParameters
				 * @param {sap.ui.core.Element} oControlEvent.getParameters.target The target element that is dragged
				 * @param {sap.ui.core.dnd.DragSession} oControlEvent.getParameters.dragSession The UI5 <code>dragSession</code> object that exists only during drag and drop
				 * @param {Event} oControlEvent.getParameters.browserEvent The underlying browser event
				 * @public
				 */
				itemDragStart: {
				},
				/**
				 * This event is fired when an uploaded item is dropped on the new table row position.
				 * @event
				 * @param {sap.ui.base.Event} oControlEvent
				 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
				 * @param {object} oControlEvent.getParameters
				 * @param {sap.ui.core.dnd.DragSession} oControlEvent.getParameters.dragSession The UI5 <code>dragSession</code> object that exists only during drag and drop
				 * @param {sap.ui.core.Element} oControlEvent.getParameters.draggedControl The element being dragged
				 * @param {sap.ui.core.Element} oControlEvent.getParameters.droppedControl The element being dropped
				 * @param {sap.ui.core.dnd.RelativeDropPosition} oControlEvent.getParameters.dropPosition The calculated position of the drop action relative to the <code>droppedControl</code>.
				 * @param {Event} oControlEvent.getParameters.browserEvent The underlying browser event
				 * @public
				 */
				itemDrop: {
				}
			}
		},
		renderer: UploadSetwithTableRenderer
	});

	var UploadState = Library.UploadState;
	var UploadSetwithTableActionPlaceHolder = Library.UploadSetwithTableActionPlaceHolder;

	/* ================== */
	/* Lifecycle handling */
	/* ================== */

    UploadSetwithTable.prototype.init = function () {
		Table.prototype.init.call(this);
		this._setDragDropConfig();
		this._filesTobeUploaded = [];
		this._filePreviewDialogControl = null;
		this._oRb = Library1.getResourceBundleFor("sap.m");
		this._bPersoRegistered = false;
		this._setIllustratedMessage();
	};

	UploadSetwithTable.prototype.onBeforeRendering = function() {
		Table.prototype.onBeforeRendering.call(this);
	};

	UploadSetwithTable.prototype.onAfterRendering = function() {
		Table.prototype.onAfterRendering.call(this);
		if (!this._bPersoRegistered){
			PersManager.getInstance().register(this, { mediators: {
				columns: new ColumnsMediator({control: this, targetAggregation: "columns", p13nMetadataTarget: "columns"}),
				sort: new SortMediator({control: this, targetAggregation: "sortConditions", p13nMetadataTarget: "sort"}),
				group: new GroupMediator({control: this, targetAggregation: "groupConditions", p13nMetadataTarget: "group"}),
				filter: new FilterMediator({control: this, targetAggregation: "filterConditions", p13nMetadataTarget: "filter"})
			}});
			this._bPersoRegistered = true;
		}
		if (this.getCloudFilePickerEnabled()) {
			this._oFileUploader.addStyleClass("sapMUSTFileUploaderVisibility");
		}
	};

	UploadSetwithTable.prototype.exit = function () {
		Table.prototype.exit.call(this);
		if (this._oToolbar) {
			this._oToolbar.destroy();
			this._oToolbar = null;
		}
		if (this._oFileUploader) {
			this._oFileUploader.destroy();
			this._oFileUploader = null;
		}
		if (this._illustratedMessage) {
			this._illustratedMessage.destroy();
			this._illustratedMessage = null;
		}
		this._bPersoRegistered = false;
		PersManager.getInstance().deregister(this);
	};

	/* ====================== */
	/* Overridden API methods */
	/* ====================== */

    UploadSetwithTable.prototype.getHeaderToolbar = function () {
		if (!this._oToolbar) {
			this._oToolbar = this.getAggregation("headerToolbar");

			var oUploaderButton = this.getCloudFilePickerEnabled() && !this.getUploadButtonInvisible() ? this._getCloudFilePickerMenu() : this.getDefaultFileUploader();
			var oCloudFilPickerButton = this.getCloudFilePickerEnabled() && this.getUploadButtonInvisible() ? this._getCloudFilePickerButton() : null;
			var oPersonalizationSettingsButton = this.getEnableVariantManagement() ? this._getPersonalizationControl() : null;

			if (!this._oToolbar) {
				const aToolbarContent = [new ToolbarSpacer(), oUploaderButton, oCloudFilPickerButton , oPersonalizationSettingsButton];
				if (this.getEnableVariantManagement()) {
					aToolbarContent.unshift(this._getVariantManagementControl());
				}
				this._oToolbar = new OverFlowToolbar(this.getId() + "-toolbar", {
					content: aToolbarContent
				});
				this.addDependent(this._oToolbar);
			} else {
				const iFileUploaderPH = this._getPlaceholderPosition(this._oToolbar, UploadSetwithTableActionPlaceHolder.UploadButtonPlaceholder);
				if (this._oToolbar && iFileUploaderPH > -1) {
					this._setControlInToolbar(iFileUploaderPH, oUploaderButton);
				} else if (this._oToolbar) {
					// fallback position to add file uploader control if UploadSetwithTableActionPlaceHolder.UploadButtonPlaceholder instance not found
					this._oToolbar.addContent(oUploaderButton);
				}

				const iCloudFilePickerPH = this._getPlaceholderPosition(this._oToolbar, UploadSetwithTableActionPlaceHolder.CloudFilePickerButtonPlaceholder);
				if (this._oToolbar && iCloudFilePickerPH > -1) {
					this._setControlInToolbar(iCloudFilePickerPH, oCloudFilPickerButton);
				} else if (this._oToolbar) {
					// fallback position to add cloud file picker control if UploadSetwithTableActionPlaceHolder.CloudFilePickerButtonPlaceholder instance not found
					this._oToolbar.addContent(oCloudFilPickerButton);
				}

				const iPersonalizationPH = this._getPlaceholderPosition(this._oToolbar, UploadSetwithTableActionPlaceHolder.PersonalizationSettingsPlaceholder);
				if (this._oToolbar && iPersonalizationPH > -1) {
					this._setControlInToolbar(iPersonalizationPH, this._getPersonalizationControl());
				} else if (this._oToolbar) {
					// fallback position to add file uploader control if UploadSetwithTableActionPlaceHolder.PersonalizationSettingsPlaceholder instance not found
					// add personalization settings button only if variant management is enabled and placeholder not provided by default.
					if (this.getEnableVariantManagement()) {
						this._oToolbar.addContent(this._getPersonalizationControl());
					}
				}

				if (this.getEnableVariantManagement()) {
					const iVmPH = this._getPlaceholderPosition(this._oToolbar, UploadSetwithTableActionPlaceHolder.VariantManagementPlaceholder);
					if (iVmPH > -1) {
						this._setControlInToolbar(iVmPH, this._getVariantManagementControl());
					} else {
						this._oToolbar.insertContent(this._getVariantManagementControl(), 0);
					}
				}
			}
			// Rendering the upload button on the toolbar which is required to maintain the FUEL instance in case we hide it and reuse it for cloudfilepicker menu.
			if (this.getCloudFilePickerEnabled()) {
				this._oToolbar.addContent(this.getDefaultFileUploader());
			}
		}
		return this._oToolbar;
	};

	/**
	 * Returns the button that is used to open p13n dialog.
	 * @private
	 * @returns {sap.m.Button} button.
	 */
	UploadSetwithTable.prototype._getPersonalizationControl = function () {
		return new Button({
			icon: "sap-icon://action-settings",
			press: function () {
				PersManager.getInstance().show(this, ["columns", "sort", "group", "filter"]);
			}.bind(this)
		});
	};

	/**
	 * Returns variant management control.
	 * @private
	 * @returns {sap.ui.fl.variants.VariantManagement} control.
	 */
	UploadSetwithTable.prototype._getVariantManagementControl = function () {
		if (!this._oVariantManagement) {
			this._oVariantManagement = new VariantManagement({
				"id": this.getId() + "-variantManagement",
				"for": [
					this//container
				 ]
			});
		}
		return this._oVariantManagement;
	};

	UploadSetwithTable.prototype.getView = function () {
		return this.getControlOfType(this, View);
	};

	UploadSetwithTable.prototype.getControlOfType = function (oControl, oType) {
		if (oControl instanceof oType) {
			return oControl;
		}
		if (oControl && typeof oControl[false]) {
			return this.getControlOfType(oControl.getParent(), oType);
		}
		return undefined;
	};

	/**
	 * Collects and return p13n metadata from UploadSetwithTable column for p13n dialog panels.
	 * @private
	 * @returns {object} object with data for p13n panels.
	 */
	UploadSetwithTable.prototype._getP13nMetadata = function () {
		if (!this._p13nMetadata) {
			const oView = this.getView(),
				aInitMetadata = this.getColumns().map(function(entry) {
				return {
					key: oView ? oView.getLocalId(entry.getId()) : entry.getId(),
					label: entry.getColumnPersonalizationText(),
					path: entry.getPath(),
					visible: entry.getVisible(),
					sortable: entry.getSortable(),
					groupable: entry.getGroupable(),
					filterable: entry.getFilterable()
				};
			});
			this._p13nMetadata = {columns: [], sort: [], group: [], filter: []};
			aInitMetadata.forEach((entry) => {
				this._p13nMetadata.columns.push({key: entry.key, label: entry.label});
				if (entry.sortable && entry.path) {
					this._p13nMetadata.sort.push({key: entry.key, label: entry.label, path: entry.path});
				}
				if (entry.groupable && entry.path) {
					this._p13nMetadata.group.push({key: entry.key, label: entry.label, path: entry.path});
				}
				if (entry.filterable && entry.path) {
					this._p13nMetadata.filter.push({key: entry.key, label: entry.label, path: entry.path});
				}
			});
		}
		return this._p13nMetadata;
	};

	UploadSetwithTable.prototype.setFileTypes = function (aNewTypes) {
		var aTypes = aNewTypes || null;
		if (typeof aTypes === "string") {
			aTypes = aTypes.split(",");
		}
		aTypes = (aTypes || []).map(function (s) {
			return s ? s.toLowerCase() : "";
		});
		if (!deepEqual(this.getFileTypes(), aTypes)) {
			this.setProperty("fileTypes", aTypes, true);
			this.getDefaultFileUploader().setFileType(aTypes);
		}
		return this;
	};

	UploadSetwithTable.prototype.setMaxFileNameLength = function (iNewMax) {
		if (this.getMaxFileNameLength() !== iNewMax) {
			this.setProperty("maxFileNameLength", iNewMax, true);
			this.getDefaultFileUploader().setMaximumFilenameLength(iNewMax);
		}
		return this;
	};

	UploadSetwithTable.prototype.setMaxFileSize = function (iNewMax) {
		if (this.getMaxFileSize() !== iNewMax) {
			this.setProperty("maxFileSize", iNewMax, true);
			this.getDefaultFileUploader().setMaximumFileSize(iNewMax);
		}
		return this;
	};

	UploadSetwithTable.prototype.setMediaTypes = function (aNewTypes) {
		var aTypes = aNewTypes || null;
		if (typeof aTypes === "string") {
			aTypes = aTypes.split(",");
		}
		aTypes = (aTypes || []).map(function (s) {
			return s ? s.toLowerCase() : "";
		});
		if (!deepEqual(this.getMediaTypes(), aTypes)) {
			this.setProperty("mediaTypes", aTypes, true);
			this.getDefaultFileUploader().setMimeType(aTypes);
		}
		return this;
	};

	UploadSetwithTable.prototype.setUploadButtonInvisible = function (bUploadButtonInvisible) {
		if (bUploadButtonInvisible !== this.getUploadButtonInvisible()) {
			var bVisible = !bUploadButtonInvisible;
			this.getDefaultFileUploader().setVisible(bVisible);
			this.setProperty("uploadButtonInvisible", bUploadButtonInvisible, true);
		}
		return this;
	};

	UploadSetwithTable.prototype.setMultiple = function (bMultiple) {
		if (this.getMultiple() !== bMultiple) {
			this.setProperty("multiple", bMultiple);
			this.getDefaultFileUploader().setMultiple(bMultiple);
		}
		return this;
	};

	UploadSetwithTable.prototype.setUploadEnabled = function (bEnable) {
		if (bEnable !== this.getUploadEnabled()) {
			this.getDefaultFileUploader().setEnabled(bEnable);
			this.setProperty("uploadEnabled", bEnable, false);
		}
		return this;
	};

	UploadSetwithTable.prototype.setDirectory = function (bDirectory) {
		if (this.getDirectory() !== bDirectory) {
			this.setProperty("directory", bDirectory);
			this.getDefaultFileUploader().setDirectory(bDirectory);
			if (bDirectory) {
				this.setProperty("multiple", false); // disable multiple files selection when directory selection is enabled.
			}
		}
		return this;
	};

	UploadSetwithTable.prototype.setNoDataIllustrationType = function (setIllustrationType) {
		if (this.getNoDataIllustrationType() !== setIllustrationType) {
			this.setProperty("noDataIllustrationType", setIllustrationType);
			if (this._illustratedMessage) {
				this._illustratedMessage.setIllustrationType(this.getNoDataIllustrationType());
			}
		}
		return this;
	};

	UploadSetwithTable.prototype.setNoDataText = function(sNoDataTxt) {
		if (this.getNoData() !== sNoDataTxt) {
			this.setProperty("noDataText", sNoDataTxt);
			if (this._illustratedMessage) {
				this._illustratedMessage.setTitle(this.getNoDataText());
			}
		}
		return this;
	};

	UploadSetwithTable.prototype.setNoDataDescription = function(sNoDataDescription) {
		if (this.getNoDataDescription() !== sNoDataDescription) {
			this.setProperty("noDataDescription", sNoDataDescription);
			if (this._illustratedMessage) {
				this._illustratedMessage.setDescription(this.getNoDataDescription());
			}
		}
		return this;
	};

	/* ============== */
	/* Public methods */
	/* ============== */

	/**
	 * Returns an instance of the default <code>sap.ui.unified.FileUploader</code> icon/button, used for adding files
	 * from the open file dialog of the operating system. It can be customized, for example made invisible or assigned a different icon.
	 * @return {sap.ui.unified.FileUploader} Instance of the default <code>sap.ui.unified.FileUploader</code>.
	 * @public
	 */
    UploadSetwithTable.prototype.getDefaultFileUploader = function () {
		var sTooltip = "Upload";
		if (!this._oFileUploader) {
			this._oFileUploader = new FileUploader(this.getId() + "-uploader", {
				buttonOnly: true,
				buttonText: sTooltip,
				tooltip: sTooltip,
				iconOnly: false,
				enabled: this.getUploadEnabled(),
				icon: "",
				iconFirst: false,
				style: "Transparent",
				name: "UploadSetwithTableFileUploader",
				sameFilenameAllowed: true,
				fileType: this.getFileTypes(),
				mimeType: this.getMediaTypes(),
				maximumFilenameLength: this.getMaxFileNameLength(),
				maximumFileSize: this.getMaxFileSize(),
                multiple: this.getDirectory() ? false : this.getMultiple(),
				useMultipart: false,
				sendXHR: true,
				change: [this._onFileUploaderChange, this],
                typeMissmatch: [this._fireFileTypeMismatch, this],
				fileSizeExceed: [this._fireFileSizeExceed, this],
				filenameLengthExceed: [this._fireFilenameLengthExceed, this],
				visible: !this.getUploadButtonInvisible(),
				directory: this.getDirectory()
			});
		}

		return this._oFileUploader;
	};

	/**
	 * Returns sap icon based on the passed mediaType and filename
	 * @param {string} mediaType The media type of the selected file
	 * @param {string} fileName The name of the selected file
	 * @public
	 * @returns {string} sap icon.
	 */
	UploadSetwithTable.getIconForFileType = function (mediaType, fileName) {
        return UploadSetwithTableItem._getIconByMimeType(mediaType, fileName);
    };

	/**
	 * Attaches all necessary handlers to the given uploader instance, so that the progress and status of the upload can be
	 * displayed and monitored.
	 * This is necessary in case when custom uploader is used.
	 * @param {sap.m.upload.UploaderTableItem} oUploader Instance of <code>sap.m.upload.UploaderTableItem</code> to which the default request handlers are attached.
	 * @public
	 */
	UploadSetwithTable.prototype.registerUploaderEvents = function (oUploader) {
		oUploader.attachUploadStarted(this._onUploadStarted.bind(this));
		oUploader.attachUploadCompleted(this._onUploadCompleted.bind(this));
	};

	/**
	 * Invokes native files selection handler.
	 * @public
	 */
	UploadSetwithTable.prototype.fileSelectionHandler = function() {
		var oUploaderInstance = this.getDefaultFileUploader();
		if (oUploaderInstance && oUploaderInstance.oFileUpload && oUploaderInstance.oFileUpload.click) {
			oUploaderInstance.oFileUpload.click();
		}
	};

	/**
	 * API to determine the unit for file size in KB/MB/GB.
	 * API recommended for file size formatting purpose.
	 * @param {int} iFileSize fileSize to determine units
	 * @public
	 * @returns {string} sFileSizeWithUnit file size in KB/MB/GB default unit is KB
	 */
	UploadSetwithTable.getFileSizeWithUnits = function(iFileSize) {
		var iKilobyte = 1024;
        var iMegabyte = iKilobyte * 1024;
        var iGigabyte = iMegabyte * 1024;
		if (typeof iFileSize === "number") {
			if (iFileSize < iMegabyte) {
				return (iFileSize / iKilobyte).toFixed(2) + " KB";
			  }  else if (iFileSize < iGigabyte) {
				return (iFileSize / iMegabyte).toFixed(2) + " MB";
			  } else {
				return (iFileSize / iGigabyte).toFixed(2) + " GB";
			  }
		}
		return iFileSize;
	};

	/**
	 * API to upload file using URL
	 * @param {string} sName file name to be set for the file that is to be uploaded.
	 * @param {string} sUrl Url for the file.
	 * @param {Promise} oPromise Promise when resolved, the control initiates the upload process.
	 * @returns {UploadSetwithTableItem} oItem, UploadSetwithTableItem instance created with the file object.
	 * @public
	 */
	UploadSetwithTable.prototype.uploadItemViaUrl = function (sName, sUrl, oPromise) {
		var oFileObject = new File([new Blob([])], sName);

		var oItem = new UploadSetwithTableItem({
			uploadState: UploadState.Ready
		});
		oItem._setFileObject(oFileObject);
		oItem.setFileName(oFileObject.name);
		oItem.setUrl(sUrl);

		oPromise
		.then(() => this._initateItemUpload(oItem).bind(this))
		.catch(() => oItem.destroy()); // cancelling the upload.

		return oItem;
	};

	/**
	 * API to upload Item without file
	 * @param {Promise} oPromise Promise when resolved, control initiates the upload process.
	 * @return {UploadSetwithTableItem} oItem, UploadSetwithTableItem instance created with the file object.
	 * @public
	 */
	UploadSetwithTable.prototype.uploadItemWithoutFile = function (oPromise) {
		var oFileObject = new File([new Blob([])], '-');
		var oItem = new UploadSetwithTableItem({
			uploadState: UploadState.Ready
		});
		oItem._setFileObject(oFileObject);
		oItem.setFileName(oFileObject.name);

		oPromise
		.then(() => this._initateItemUpload(oItem))
		.catch(() => oItem.destroy()); // cancelling the upload.

		return oItem;
	};

	/**
	 * API to rename the document of an item.
	 * @param {sap.m.upload.UploadSetwithTableItem} oItem target item.
	 * @public
	 */
	UploadSetwithTable.prototype.renameItem = function (oItem) {
		if (oItem && oItem instanceof UploadSetwithTableItem) {
			const oDialog = this._getFileRenameDialog(oItem);
			oDialog.open();
		}
	};

	/* ============== */
	/* Private methods */
	/* ============== */

	UploadSetwithTable.prototype._setControlInToolbar = function(iIndex, control) {
		this._oToolbar.getContent()[iIndex].setVisible(false);
		this._oToolbar.insertContent(control, iIndex);
	};

	UploadSetwithTable.prototype._getPlaceholderPosition = function(toolbar, placeholderType) {
		for (var i = 0; i < toolbar.getContent().length; i++) {
			if (toolbar.getContent()[i].isA("sap.m.upload.ActionsPlaceholder") && toolbar.getContent()[i].getPlaceholderFor() === placeholderType) {
				return i;
			}
		}
		return -1;
	};

    UploadSetwithTable.prototype._onFileUploaderChange = function (oEvent) {
        var oFiles = oEvent.getParameter("files");

		if (oFiles && oFiles.length) {
			var aSelectedItems = this.getSelectedItems();
			var oSelectedItem = aSelectedItems && aSelectedItems.length == 1 ? aSelectedItems[0] : null;
			var bEmptyFileSelected = oSelectedItem ? oSelectedItem && oSelectedItem.getFileName && oSelectedItem.getFileName() === "-" : false;

			// update existing file after upload
			if (bEmptyFileSelected) {
				this._oItemToUpdate = oFiles[0];
			}
			this._processSelectedFileObjects(oFiles);
		}
	};

	UploadSetwithTable.prototype._processSelectedFileObjects = function (oFiles) {
		var aFiles = [];

		// Need to explicitly copy the file list, FileUploader deliberately resets its form completely
		// along with 'files' parameter when it (mistakenly) thinks that all is done.
		for (var i = 0; i < oFiles.length; i++) {
			aFiles.push(oFiles[i]);
		}

		aFiles.forEach((oFile) => {
			var oItem = new UploadSetwithTableItem({
				uploadState: UploadState.Ready
			});
			oItem.setParent(this); // setting the parent as UploadSetwithTable for file validations
			oItem._setFileObject(oFile);
			oItem.setFileName(oFile.name);


			if (this.getItemValidationHandler() && typeof this.getItemValidationHandler() === "function" ) {

				const oItemInfo = {
					oItem: oItem,
					iTotalItemsForUpload: aFiles.length,
					oSource: this
				};

				var oPromise = this.getItemValidationHandler()(oItemInfo);
				if (oPromise && oPromise instanceof Promise) {
					oPromise
					.then((item) => {
						if (item instanceof UploadSetwithTableItem) {
							this._initateItemUpload(item);
						}
					})
					.catch((item) => {
						// Reset variable to avoid update if upload rejected.
						if (item && this._oItemToUpdate && item instanceof UploadSetwithTableItem && item.getId() === this._oItemToUpdate.getId()) {
							this._oItemToUpdate = null;
						}
					});
				} else {
					oItem.destroy();
					// if promise is not returned to the ItemValidation hook log error and destroy the item
					Log.error("Invalid usage, missing Promise: ItemValidationHandler callback expects Promise to be returned.");
				}
			} else {
				/* if no validation handler is provided control continues with normal upload else waits for the application to manually
				trigger the upload by resolving the promise */
				this._initateItemUpload(oItem);
			}
		});
	};

	UploadSetwithTable.prototype._initateItemUpload = function(oItem) {
		this.fireBeforeInitiatingItemUpload({item: oItem});
		if (this._oItemToUpdate) {
			// Registering item to be update with selected file contents post successful upload.
			this._oItemToUpdate = oItem;
		}
		this._uploadItemIfGoodToGo(oItem);
	};

    UploadSetwithTable.prototype._fireFileTypeMismatch = function (oItem) {
        var aMediaTypes = this.getMediaTypes();
		var aFileTypes = this.getFileTypes();

		var sFileType = oItem.getParameter("fileType");
		var sMediaType = oItem.getParameter("mimeType");

		var bMediaRestricted = (!!aMediaTypes && (aMediaTypes.length > 0) && !!sMediaType && aMediaTypes.indexOf(sMediaType) === -1);
		var bFileRestricted = (!!aFileTypes && (aFileTypes.length > 0) && !!sFileType && aFileTypes.indexOf(sFileType) === -1);

		var parts = [new Blob([])];

		var oFileMetaData = {
			type: oItem.getParameter('fileType'),
			webkitRelativePath: '',
			name: oItem.getParameter('fileName')
		};
		var oFileObject = new File(parts, oItem.getParameter('fileName'), oFileMetaData);
		var oMismatchItem = new UploadSetwithTableItem();
		oMismatchItem._setFileObject(oFileObject);
		oMismatchItem.setFileName(oFileObject.name);

		if (bMediaRestricted){
			this.fireMediaTypeMismatch({item: oMismatchItem});
		} else if (bFileRestricted){
			this.fireFileTypeMismatch({item: oMismatchItem});
		}
    };

    UploadSetwithTable.prototype._fireFilenameLengthExceed = function (oItem) {
		var oTargetItem = new UploadSetwithTableItem();
		oTargetItem.setFileName(oItem.getParameter('fileName'));
        this.fireFileNameLengthExceeded({item: oTargetItem});
    };

    UploadSetwithTable.prototype._fireFileSizeExceed = function (oItem) {
		var oTargetItem = new UploadSetwithTableItem();
		oTargetItem.setFileName(oItem.getParameter('fileName'));
        this.fireFileSizeExceeded({item: oTargetItem});
    };

	UploadSetwithTable.prototype._onUploadStarted = function (oEvent) {
		var oItem = oEvent.getParameter("item");
		oItem.setUploadState(UploadState.Uploading);
	};

	UploadSetwithTable.prototype._onUploadCompleted = function (oEvent) {
		var oItem = oEvent.getParameter("item"),
			oResponseXHRParams = oEvent.getParameter("responseXHR"),
			sResponse = null;

		if (oResponseXHRParams.responseXML) {
			sResponse = oResponseXHRParams.responseXML.documentElement.textContent;
		}
		var oXhrParams = {
			"item": oItem,
			"response": oResponseXHRParams.response,
			"responseXML": sResponse,
			"responseText": oResponseXHRParams.responseText,
			"readyState": oResponseXHRParams.readyState,
			"status": oResponseXHRParams.status,
			"headers": oResponseXHRParams.headers
		};
		if (this._oItemToUpdate) {
			this._oItemToUpdate.setFileName(oItem.getFileName());
			this._oItemToUpdate._setFileObject(oItem.getFileObject());
			this._oItemToUpdate = null;
		}
		oItem.setUploadState(UploadState.Complete);
		this.fireUploadCompleted(oXhrParams);
	};

	UploadSetwithTable.prototype._uploadItemIfGoodToGo = function (oItem) {
		if (oItem.getUploadState() === UploadState.Ready && !oItem._isRestricted()) {
			if (this.fireBeforeUploadStarts({item: oItem})) {
				const aHeaderFields = this.getHeaderFields()?.length ? this.getHeaderFields() : [];
				const aItemHeaderFields = oItem.getHeaderFields()?.length ? oItem.getHeaderFields() : [];
				const oHeaderFields = [...aHeaderFields, ...aItemHeaderFields]; //Merging headers for request.
				this._getActiveUploader().uploadItem(oItem, oHeaderFields);
			}
		}
	};

	UploadSetwithTable.prototype._getActiveUploader = function () {
		return this.getUploader() || this._getImplicitUploader();
	};

	UploadSetwithTable.prototype._getImplicitUploader = function () {
		if (!this._oUploader) {
			this._oUploader = new Uploader({
				httpRequestMethod : this.getHttpRequestMethod()
			});
			this._oUploader.setUploadUrl(this.getUploadUrl());
			this.registerUploaderEvents(this._oUploader);
			this.addDependent(this._oUploader);
		}

		return this._oUploader;
	};

	UploadSetwithTable.prototype._setIllustratedMessage = function () {
		if (!this._illustratedMessage) {
			this._illustratedMessage = new IllustratedMessage({
				illustrationType: this.getNoDataIllustrationType(),
				illustrationSize: IllustratedMessageSize.Spot,
				title: this.getNoDataText() ? this.getNoDataText() : this._oRb.getText("UPLOADSET_WITH_TABLE_NO_DATA_TEXT"),
				description: this.getNoDataDescription() ? this.getNoDataDescription() : this._oRb.getText("UPLOADSET_WITH_TABLE_NO_DATA_DESCRIPTION")
			});
		}

		this.setAggregation("_noColumnsMessage", this._illustratedMessage);
		this.setAggregation("noData", this._illustratedMessage);
	};

	UploadSetwithTable.prototype._setDragDropConfig = function () {
		var oDragDropConfig = new DragDropInfo({
			sourceAggregation: "items",
			targetAggregation: "items",
			dragStart: [this._onDragStartItem, this],
			drop: [this._onDropItem, this]
		});
		var oDropConfig = new DropInfo({
			dropEffect:"Move",
			dropPosition:"OnOrBetween",
			dragEnter: [this._onDragEnterFile, this],
			drop: [this._onDropFile, this]
		});
		this.addDragDropConfig(oDragDropConfig);
		this.addDragDropConfig(oDropConfig);
	};

	UploadSetwithTable.prototype._onDragStartItem = function (oEvent) {
		this.fireItemDragStart(oEvent);
	};

	UploadSetwithTable.prototype._onDropItem = function (oEvent) {
		this.fireItemDrop(oEvent);
	};

	UploadSetwithTable.prototype._onDragEnterFile = function (oEvent) {
		var oDragSession = oEvent.getParameter("dragSession");
		var oDraggedControl = oDragSession.getDragControl();
		if (oDraggedControl) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Drag and drop of files implmentation subject to change depending on the thr UX feedback for folder upload scenarios and warning message display scenarios
	 * @param {sap.ui.base.Event} oEvent Drop Event when file is dropped on the Table.
	 * @private
	 */
	UploadSetwithTable.prototype._onDropFile = function (oEvent) {
		oEvent.preventDefault();
		if (!this.getUploadEnabled()) {
			Log.error("Upload is not enabled, to continue uploading with drag and drop of files enable property 'UploadEnabled' ");
			return;
		}
		let oItems = oEvent.getParameter("browserEvent").dataTransfer.items;
		oItems = Array.from(oItems);

		// Filtering out only webkitentries (files/folders system entries) by excluding non file / directory types.
		oItems = oItems.filter(function(item){
			return item.webkitGetAsEntry() ? true : false;
		});
		const aEntryTypes = oItems.map(function (oEntry) {
			const oWebKitEntry = oEntry.webkitGetAsEntry();
			return {
				entryType: oWebKitEntry && oWebKitEntry.isFile ? 'File' : 'Directory'
			};
		});
		// handlding multiple property drag & drop scenarios
		if (oItems && oItems.length > 1 && !this.getMultiple() && !this.getDirectory()) {
			// Handling drag and drop of multiple files to upload with multiple property set
			const sMessage = this._oRb.getText("UPLOADSET_WITH_TABLE_MULTIPLE_RESTRICTED");
			Log.warning("Multiple files upload is retsricted for this multiple property set");
			MessageBox.error(sMessage);
			return;
		} else if (oItems && oItems.length > 1 && this.getMultiple() && !isFileOrFolderEntry('File', aEntryTypes)) {
			const sMessageDropFilesOnly = this._oRb.getText("UPLOADSET_WITH_TABLE_DIRECTORY_RESTRICTED");
			Log.warning("Multiple files upload is retsricted, drag & drop only files");
			MessageBox.error(sMessageDropFilesOnly);
			return;
		}

		// handling directory property drag & drop scenarios
		if (oItems && oItems.length && !this.getDirectory() && isFileOrFolderEntry('Directory', aEntryTypes)) {
			const sMessageDirectory = this._oRb.getText("UPLOADSET_WITH_TABLE_DIRECTORY_RESTRICTED");
			Log.warning("Directory of files upload is retsricted for this directory property set");
			MessageBox.error(sMessageDirectory);
			return;
		} else if (oItems && oItems.length && this.getDirectory() && !isFileOrFolderEntry('Directory', aEntryTypes)) {
			const sMessageDragDropDirectory = this._oRb.getText("UPLOADSET_WITH_TABLE_DROP_DIRECTORY_ALLOWED");
			Log.warning("Directory of files upload is retsricted, drag & drop only directories here.");
			MessageBox.error(sMessageDragDropDirectory);
			return;
		}
		if (oItems && oItems.length) {
			this._getFilesFromDataTransferItems(oItems).then( (oFiles) => {
				if (oFiles && oFiles.length) {
					this._processSelectedFileObjects(oFiles);
				}
			});
		}

		function isFileOrFolderEntry(sType, aEntries) {
			return aEntries.every(function (oEntry) {
				return oEntry.entryType === sType;
			});
		}
	};
	/**
	 * Method to extract files from dataTransfer items contianing files / directory of files.
	 * @param {Object} dataTransferItems, DataTransfer items extracted from browserEvent for drop.
	 * @returns {Promise} oPromise, Promise on resolved returns list of files dropped for upload.
	 * @private
	 */
	UploadSetwithTable.prototype._getFilesFromDataTransferItems = function (dataTransferItems) {
		const aFiles = [];
		return new Promise((resolve, reject) => {
			const aEntriesPromises = [];
			for (let i = 0; i < dataTransferItems.length; i++) {
				aEntriesPromises.push(traverseFileTreePromise(dataTransferItems[i]?.webkitGetAsEntry()));
			}
			Promise.all(aEntriesPromises)
				.then( (entries) => {
					resolve(aFiles);
				}, (err) => {
					reject(err);
				});
		});

		function traverseFileTreePromise(item) {
			return new Promise((resolve, reject) => {
				if (item.isFile) {
					item.file((oFile) => {
						aFiles.push(oFile);
						resolve(oFile);
					}, (err) => {
						reject(err);
					});
				} else if (item.isDirectory) {
					const dirReader = item.createReader();
					dirReader.readEntries(function (entries) {
						const aEntriesPromises = [];
						for (let i = 0; i < entries.length; i++) {
							aEntriesPromises.push(traverseFileTreePromise(entries[i]));
						}
						resolve(Promise.all(aEntriesPromises));
					});
				}
			});
		}
	};

	/**
	* Opens preview of the item pressed.
	* @param {sap.m.upload.UploadSetwithTableItem} oItem item to be previewed.
	* @private
	*/
	UploadSetwithTable.prototype._openFilePreview = function (oItem) {
		if (!this.getPreviewDialog()) {
			const oAssociatedPreviewDialog = new FilePreviewDialog();
			this.setPreviewDialog(oAssociatedPreviewDialog);
		}
		this._filePreviewDialogControl = Element.getElementById(this.getPreviewDialog());

		if (this._filePreviewDialogControl) {
			this._filePreviewDialogControl._previewItem = oItem;
			this._filePreviewDialogControl._items = this.getItems();
			this._filePreviewDialogControl._open();
		}
	};

	/**
	* Internal API return the dialog for document rename.
	* @param {sap.m.upload.UploadSetwithTableItem} oItem item to be renamed.
	* @private
	* @returns {sap.m.Dialog} oDialog, created dialog instance
	*/
	UploadSetwithTable.prototype._getFileRenameDialog = function(oItem) {
		const oSplit = UploadSetwithTableItem._splitFileName(oItem.getFileName());
		let iMaxLength = this.getMaxFileNameLength();
		const iFileExtensionLength = oSplit.extension ? oSplit.extension.length + 1 : 0;
			iMaxLength = iMaxLength ? iMaxLength : 0;
		let iNameMaxLength = iMaxLength - iFileExtensionLength;
		    iNameMaxLength = iNameMaxLength < 0 ? 0 : iNameMaxLength;

		// Input field
		const oInput = new Input({
			type: Library.InputType.Text,
			value: oSplit.name,
			width: "90%",
			maxLength: iNameMaxLength,
			liveChange: [this._handleItemNameValidation, this]
		});
		oInput.addStyleClass("sapUiTinyMarginTop");
		oInput.addStyleClass("sapUiSmallMarginBegin");
		// Label for Input
		const oLabel = new Label({
			text: this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_INPUT_LABEL"),
			labelFor: oInput.getId()
		});
		oLabel.addStyleClass("sapUiSmallMarginTop");
		oLabel.addStyleClass("sapUiSmallMarginBegin");
		oLabel.addStyleClass("sapUiSmallMarginEnd");
		// Dialog creation
		var oDialog = new Dialog({
			title: this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_DIALOG_TEXT"),
			contentWidth: "22.5rem",
			contentHeight: "12rem",
			content: [oLabel,oInput],
			beginButton: new Button({
				type: Library.ButtonType.Emphasized,
				text: this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_APPLY_BUTTON_TEXT"),
				press: this._handleItemRenameConfirmation.bind(this),
				enabled: oInput.getValueState() !== "Error"
			}),
			endButton: new Button({
				text: this._oRb.getText("UPLOADSET_WITH_TABLE_CANCELBUTTON_TEXT"),
				press: this._handleItemRenameCancel.bind(this)
			}),
			customData: {
				key: "item",
				value: oItem
			},
			afterClose: function () {
				oDialog.destroy();
			}
		});

		return oDialog;
	};

	/**
	* Handler for item rename cancel operation.
	* @param {object} oEvent cancel button click event.
	* @private
	*/
	UploadSetwithTable.prototype._handleItemRenameCancel = function(oEvent) {
		const oDialog = oEvent.getSource().getParent();
		const oInput = oDialog.getContent()[1];
		const oItem = oDialog && oDialog.data ? oDialog.data().item : null;
		const oSplit = UploadSetwithTableItem._splitFileName(oItem.getFileName());
		// Check if there are changes made to the existing file name.
		if (oItem && oInput && oSplit.name !== oInput.getValue()) {
			MessageBox.warning(this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_DISCARD_POPUP_CHANGES_TEXT"), {
				actions: [this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_SAVE_BUTTON_TEXT"), this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_DISCARD_CHANGES_BUTTON_TEXT")],
				emphasizedAction: this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_SAVE_BUTTON_TEXT"),
				onClose: (sAction) => {
					if (sAction !== this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_SAVE_BUTTON_TEXT")) {
						oDialog.close();
					} else {
						// fire beginbutton event to save the filename
						var oBeginButton = oDialog.getBeginButton();
						var oEvent = new EventBase("click", oBeginButton);
						oBeginButton.firePress(oEvent);
					}
				}
			});
		} else {
			oDialog.close();
		}
	};

	/**
	* Handler for item rename confirm operation.
	* @param {object} oEvent confirm button click event.
	* @private
	*/
	UploadSetwithTable.prototype._handleItemRenameConfirmation = function(oEvent) {
		const oDialog = oEvent.getSource().getParent();
		const oInput = oDialog.getContent()[1];
		if (oInput && oInput.getValueState() === "Error") {
			oInput.focus(oInput);
			oInput.setShowValueStateMessage(true);
			return;
		}
		const oItem = oDialog && oDialog.data ? oDialog.data().item : null;
		const oSplit = UploadSetwithTableItem._splitFileName(oItem.getFileName());
		// update only if there is change
		if (oItem && oSplit.name !== oInput.getValue()) {
			if (oSplit && oSplit.extension) {
				oItem.setFileName(oInput.getValue() + "." + oSplit.extension);
			} else {
				oItem.setFileName(oInput.getValue());
			}
			oDialog.close();
			this.fireItemRenamed({item: oItem});
		} else {
			oDialog.close();
		}
	};

	/**
	* Handler for file name validation.
	* @param {object} oEvent Input keyevent.
	* @private
	*/
	UploadSetwithTable.prototype._handleItemNameValidation = function(oEvent) {
		const oInput = oEvent.getSource();
		let sValue = oInput.getValue();
		sValue = sValue.trim();

		// empty file validation
		if (sValue === "") {
			oInput.setProperty("valueState", "Error", true);
			oInput.setValueStateText(this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_EMPTY_NAME_VALIDATION_ERROR_MESSAGE"));
			oInput.setShowValueStateMessage(true);
			return;
		}

		const oCharacterRegex = new RegExp(/[@#$]/);
		if (oCharacterRegex.test(sValue)) {
			oInput.setShowValueStateMessage(true);
			oInput.setProperty("valueState", "Error", true);
			oInput.setValueStateText(this._oRb.getText("UPLOADSET_WITH_TABLE_DOCUMENT_RENAME_SPLC_VALIDATION_ERROR_MESSAGE", '@#$'));
		} else {
			oInput.setShowValueStateMessage(false);
			oInput.setProperty("valueState", "None", true);
		}
	};

	/**
	 * Returns CloudFile picker menu button
	 * @return {sap.m.MenuButton} CloudPicker & LocalFileUpload Menu button
	 * @private
	 */
	UploadSetwithTable.prototype._getCloudFilePickerMenu = function () {
		this._oMenuButton = new MenuButton({
			text: this._oRb.getText("UPLOAD_SET_DEFAULT_LFP_BUTTON_TEXT"),
			buttonMode: MenuButtonMode.Split,
			menu: this._getMenuButtonItems(),
			defaultAction: this.fileSelectionHandler.bind(this)
		});
		return this._oMenuButton;
	};

	/**
	 * Returns Cloud File picker button
	 * @return {sap.m.Button} Cloudfile Picker button
	 * @private
	 */
	UploadSetwithTable.prototype._getCloudFilePickerButton = function () {
		this._oCloudFilePickerButton = new Button({
			text: this.getCloudFilePickerButtonText() ? this.getCloudFilePickerButtonText() : this._oRb.getText("UPLOAD_SET_DEFAULT_CFP_BUTTON_TEXT"),
			press: this._invokeCloudFilePicker.bind(this)
		});
		return this._oCloudFilePickerButton;
	};

	UploadSetwithTable.prototype._itemSelectedCallback = function (oEvent) {
		var oItem = oEvent.getParameter("item");
		// eslint-disable-next-line default-case
		switch (oItem.getText()) {
			case this.getCloudFilePickerButtonText() ? this.getCloudFilePickerButtonText() : this._oRb.getText("UPLOAD_SET_DEFAULT_CFP_BUTTON_TEXT"):
				this._oMenuButton
					.detachEvent("defaultAction", this.fileSelectionHandler.bind(this))
					.attachEvent("defaultAction", this._invokeCloudFilePicker.bind(this));

				this._invokeCloudFilePicker();
				this._oMenuButton.setText(oItem.getText());
				break;
			case this._oRb.getText("UPLOAD_SET_DEFAULT_LFP_BUTTON_TEXT"):
				this._oMenuButton
					.detachEvent("defaultAction", this._invokeCloudFilePicker.bind(this))
					.attachEvent("defaultAction", this.fileSelectionHandler.bind(this));

				this.fileSelectionHandler();
				this._oMenuButton.setText(oItem.getText());
				break;
		}
	};

	UploadSetwithTable.prototype._getMenuButtonItems = function () {
		return new Menu({
			items: [
				new MenuItem({ text: this._oRb.getText("UPLOAD_SET_DEFAULT_LFP_BUTTON_TEXT") }),
				new MenuItem({ text: this.getCloudFilePickerButtonText() ? this.getCloudFilePickerButtonText() : this._oRb.getText("UPLOAD_SET_DEFAULT_CFP_BUTTON_TEXT") })
			],
			itemSelected: this._itemSelectedCallback.bind(this)
		});
	};

	/**
	 * Creates and invokes CloudFilePicker control instance
	 * @private
	 * @returns {Object} cloudFile picker instance
	 */
	UploadSetwithTable.prototype._invokeCloudFilePicker = function () {
		var oCloudFilePickerInstance = null;
		if (this._cloudFilePickerControl) {
			oCloudFilePickerInstance = this._getCloudFilePickerInstance();
			oCloudFilePickerInstance.open();
		} else {
			// Dynamically load and cache CloudFilePicker control for first time
			this._loadCloudFilePickerDependency()
				.then( (cloudFilePicker) => {
					this._cloudFilePickerControl = cloudFilePicker;
					oCloudFilePickerInstance = this._getCloudFilePickerInstance();
					oCloudFilePickerInstance.open();
				})
				.catch((error) => {
					Log.error(error);
				});
		}
		return oCloudFilePickerInstance;
	};

	/**
	 * Event handler for CloudFile picker selector
	 * @param {Object} oEvent CloudFile picker file selection DOM change event
	 * @private
	 */
	UploadSetwithTable.prototype._onCloudPickerFileChange = function (oEvent) {

		var mParameters = oEvent.getParameters();
		var aFiles = [];
		if (mParameters && mParameters.selectedFiles) {
			mParameters.selectedFiles.forEach( (file) => {
				aFiles.push(this._createFileFromCloudPickerFile(file));
			});
		}

		// invoking this method to handle file uploads
		this._processNewCloudPickerFileObjects(aFiles);
	};

	/**
	 * Creates file object that is to be uploaded from the CloudFilePicker file object
	 * @param {sap.suite.ui.commons.CloudFileInfo} oCloudFile CloudFilepicker file object
	 * @returns {Object} file metadata with file object and fileshare properties
	 * @private
	 */
	UploadSetwithTable.prototype._createFileFromCloudPickerFile = function (oCloudFile) {
		var parts = [new Blob([])];
		var oFileMetaData = {
			type: oCloudFile.getFileShareItemContentType(),
			size: oCloudFile.getFileShareItemContentSize(),
			webkitRelativePath: '',
			name: oCloudFile.getFileShareItemName()
		};
		var oFile = new File(parts, oCloudFile.getFileShareItemName(), oFileMetaData);
		return {
			file: oFile,
			fileShareProperties: oCloudFile.mProperties
		};
	};

	/**
	 * Processing and uploading of file objects selected from the CloudFilePicker
	 * @param {Array} oFiles File metadata list containing file to be uploaded and fileshare properties used for mapping
	 * @private
	 */
	UploadSetwithTable.prototype._processNewCloudPickerFileObjects = function (oFiles) {

		oFiles.forEach( (oFileMetaData) => {
			var oFile = oFileMetaData.file;
			// set the fileshareProperties for the new file created.
			const oFileShareProperties = oFileMetaData.fileShareProperties;

			var oItem = new UploadSetwithTableItem({
				uploadState: UploadState.Ready
			});
			oItem._setFileObject(oFile);
			oItem.setFileName(oFile.name);

			// Set the file share properties if its cloud picker selected file. So that the info is avilable on the item getCloudFileInfo API.
			if (oFile && oFileShareProperties) {
				oItem._setCloudFileInfo(oFileShareProperties);
			}


			if (this.getItemValidationHandler() && typeof this.getItemValidationHandler() === "function" ) {

				const oItemInfo = {
					oItem: oItem,
					iTotalItemsForUpload: oFiles.length,
					oSource: this
				};

				var oPromise = this.getItemValidationHandler()(oItemInfo);
				if (oPromise && oPromise instanceof Promise) {
					oPromise
					.then((item) => {
						if (item instanceof UploadSetwithTableItem) {
							this._initateItemUpload(item);
						}
					})
					.catch((item) => {
						// Reset variable to avoid update if upload rejected.
						if (item && this._oItemToUpdate && item instanceof UploadSetwithTableItem && item.getId() === this._oItemToUpdate.getId()) {
							this._oItemToUpdate = null;
						}
					});
				} else {
					oItem.destroy();
					// if promise is not returned to the ItemValidation hook log error and destroy the item
					Log.error("Invalid usage, missing Promise: ItemValidationHandler callback expects Promise to be returned.");
				}
			} else {
				/* if no validation handler is provided control continues with normal upload else waits for the application to manually
				trigger the upload by resolving the promise */
				this._initateItemUpload(oItem);
			}
		});
	};

	/**
	 * Dynamically require CloudFilePicker Control
	 * @returns {Promise} Promise that resolves on sucessful load of CloudFilePicker control
	 * @private
	 */
	UploadSetwithTable.prototype._loadCloudFilePickerDependency = function () {
		return new Promise( (resolve, reject) => {
			Library1.load("sap.suite.ui.commons")
				.then(function (data) {
					sap.ui.require(["sap/suite/ui/commons/CloudFilePicker"], function (cloudFilePicker) {
						resolve(cloudFilePicker);
					}, function (error) {
						reject(error);
					});
				})
				.catch(function () {
					reject("CloudFilePicker Control not available.");
				});
		});
	};

	/**
	 * Creates CloudFilePicker Instance
	 * @returns {sap.suite.ui.commons.CloudFilePicker} CloudFilePicker instance
	 * @private
	 */
	UploadSetwithTable.prototype._getCloudFilePickerInstance = function () {
		return new this._cloudFilePickerControl({
			serviceUrl: this.getCloudFilePickerServiceUrl(),
			confirmButtonText: this._oRb.getText("SELECT_PICKER_TITLE_TEXT"),
			title: this._oRb.getText("SELECT_PICKER_TITLE_TEXT"),
			fileNameMandatory: true,
			select: this._onCloudPickerFileChange.bind(this)
		});
	};

    return UploadSetwithTable;
});