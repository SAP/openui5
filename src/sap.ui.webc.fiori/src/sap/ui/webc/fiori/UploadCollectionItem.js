/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.UploadCollectionItem.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"sap/ui/webc/main/library",
	"./thirdparty/UploadCollectionItem"
], function(WebComponent, library, mainLibrary) {
	"use strict";

	var UploadState = library.UploadState;
	var ListItemType = mainLibrary.ListItemType;

	/**
	 * Constructor for a new <code>UploadCollectionItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
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
				 * An object of strings that defines several additional accessibility attribute values for customization depending on the use case.
				 *
				 * It supports the following fields:
				 *
				 *
				 * <ul>
				 *     <li><code>ariaSetsize</code>: Defines the number of items in the current set of listitems or treeitems when not all items in the set are present in the DOM. The value of each <code>aria-setsize</code> is an integer reflecting number of items in the complete set. <b>Note: </b> If the size of the entire set is unknown, set <code>aria-setsize="-1"</code>. </li>
				 *     <li><code>ariaPosinset</code>: Defines an element's number or position in the current set of listitems or treeitems when not all items are present in the DOM. The value of each <code>aria-posinset</code> is an integer greater than or equal to 1, and less than or equal to the size of the set when that size is known. </li>
				 * </ul>
				 */
				accessibilityAttributes: {
					type: "object",
					defaultValue: {}
				},

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
				 * By default, the delete button will always be shown, regardless of the <code>sap.ui.webc.fiori.UploadCollection</code>'s property <code>mode</code>. Setting this property to <code>true</code> will hide the delete button.
				 */
				hideDeleteButton: {
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
				 * The navigated state of the list item. If set to <code>true</code>, a navigation indicator is displayed at the end of the list item.
				 */
				navigated: {
					type: "boolean"
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
				 * Defines the selected state of the <code>ListItem</code>.
				 */
				selected: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the visual indication and behavior of the list items. Available options are <code>Active</code> (by default), <code>Inactive</code>, <code>Detail</code> and <code>Navigation</code>. <br>
				 * <br>
				 * <b>Note:</b> When set to <code>Active</code> or <code>Navigation</code>, the item will provide visual response upon press and hover, while with type <code>Inactive</code> and <code>Detail</code> - will not.
				 */
				type: {
					type: "sap.ui.webc.main.ListItemType",
					defaultValue: ListItemType.Active
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
				 * Defines the delete button, displayed in "Delete" mode. <b>Note:</b> While the slot allows custom buttons, to match design guidelines, please use the <code>sap.ui.webc.main.Button</code> component. <b>Note:</b> When the slot is not present, a built-in delete button will be displayed.
				 */
				deleteButton: {
					type: "sap.ui.webc.main.IButton",
					multiple: false,
					slot: "deleteButton"
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
				 * Fired when the user clicks on the detail button when type is <code>Detail</code>.
				 */
				detailClick: {
					parameters: {}
				},

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

	/**
	 * Sets a new value for property {@link #setFile file}.
	 *
	 * Holds an instance of File associated with this item.
	 *
	 * When called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.
	 *
	 * @method
	 * @param {File} [oFile] New value for property <code>file</code>
	 * @public
	 * @name sap.ui.webc.fiori.UploadCollectionItem#setFile
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 */

	/**
	 * Gets current value of property {@link #getFile file}.
	 *
	 * Holds an instance of File associated with this item.
	 *
	 * @method
	 * @returns {File} Value of property <code>file</code>
	 * @public
	 * @name sap.ui.webc.fiori.UploadCollectionItem#getFile
	 */

	/* CUSTOM CODE END */

	return UploadCollectionItem;
});
