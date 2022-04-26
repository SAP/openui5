/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.UploadCollectionItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/UploadCollectionItem"
], function(WebComponent, library) {
	"use strict";

	var UploadState = library.UploadState;

	/**
	 * Constructor for a new <code>UploadCollectionItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> A component to be used within the <code>sap.ui.webc.fiori.UploadCollection</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.UploadCollectionItem
	 * @implements sap.ui.webc.fiori.IUploadCollectionItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UploadCollectionItem = WebComponent.extend("sap.ui.webc.fiori.UploadCollectionItem", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-upload-collection-item-ui5",
			interfaces: [
				"sap.ui.webc.fiori.IUploadCollectionItem"
			],
			properties: {

				/**
				 * Disables the delete button.
				 */
				disableDeleteButton: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Holds an instance of <code>File</code> associated with this item.
				 */
				file: {
					type: "object",
					defaultValue: null
				},

				/**
				 * The name of the file.
				 */
				fileName: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * If set to <code>true</code> the file name will be clickable and it will fire <code>file-name-click</code> event upon click.
				 */
				fileNameClickable: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Hides the retry button when <code>uploadState</code> property is <code>Error</code>.
				 */
				hideRetryButton: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Hides the terminate button when <code>uploadState</code> property is <code>Uploading</code>.
				 */
				hideTerminateButton: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * The upload progress in percentage. <br>
				 * <br>
				 * <b>Note:</b> Expected values are in the interval [0, 100].
				 */
				progress: {
					type: "int",
					defaultValue: 0
				},

				/**
				 * If set to <code>Uploading</code> or <code>Error</code>, a progress indicator showing the <code>progress</code> is displayed. Also if set to <code>Error</code>, a refresh button is shown. When this icon is pressed <code>retry</code> event is fired. If set to <code>Uploading</code>, a terminate button is shown. When this icon is pressed <code>terminate</code> event is fired.
				 */
				uploadState: {
					type: "sap.ui.webc.fiori.UploadState",
					defaultValue: UploadState.Ready
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Hold the description of the <code>sap.ui.webc.fiori.UploadCollectionItem</code>. Will be shown below the file name.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * A thumbnail, which will be shown in the beginning of the <code>sap.ui.webc.fiori.UploadCollectionItem</code>. <br>
				 * <br>
				 * <b>Note:</b> Use <code>sap.ui.webc.main.Icon</code> or <code>img</code> for the intended design.
				 */
				thumbnail: {
					type: "sap.ui.core.Control",
					multiple: false,
					slot: "thumbnail"
				}
			},
			events: {

				/**
				 * Fired when the file name is clicked. <br>
				 * <br>
				 * <b>Note:</b> This event is only available when <code>fileNameClickable</code> property is <code>true</code>.
				 */
				fileNameClick: {
					parameters: {}
				},

				/**
				 * Fired when the <code>fileName</code> property gets changed. <br>
				 * <br>
				 * <b>Note:</b> An edit button is displayed on each item, when the <code>sap.ui.webc.fiori.UploadCollectionItem</code> <code>type</code> property is set to <code>Detail</code>.
				 */
				rename: {
					parameters: {}
				},

				/**
				 * Fired when the retry button is pressed. <br>
				 * <br>
				 * <b>Note:</b> Retry button is displayed when <code>uploadState</code> property is set to <code>Error</code>.
				 */
				retry: {
					parameters: {}
				},

				/**
				 * Fired when the terminate button is pressed. <br>
				 * <br>
				 * <b>Note:</b> Terminate button is displayed when <code>uploadState</code> property is set to <code>Uploading</code>.
				 */
				terminate: {
					parameters: {}
				}
			},
			designtime: "sap/ui/webc/fiori/designtime/UploadCollectionItem.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return UploadCollectionItem;
});