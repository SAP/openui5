/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.UploadCollection.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/webc/main/library",
	"./thirdparty/UploadCollection"
], function(WebComponent, library, mainLibrary) {
	"use strict";

	var ListMode = mainLibrary.ListMode;

	/**
	 * Constructor for a new <code>UploadCollection</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> This component allows you to represent files before uploading them to a server, with the help of <code>sap.ui.webc.fiori.UploadCollectionItem</code>. It also allows you to show already uploaded files.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.UploadCollection
	 */
	var UploadCollection = WebComponent.extend("sap.ui.webc.fiori.UploadCollection", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-upload-collection-ui5",
			properties: {

				/**
				 * Defines the accessible aria name of the component.
				 */
				accessibleName: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * By default there will be drag and drop overlay shown over the <code>sap.ui.webc.fiori.UploadCollection</code> when files are dragged. If you don't intend to use drag and drop, set this property. <br>
				 * <br>
				 * <b>Note:</b> It is up to the application developer to add handler for <code>drop</code> event and handle it. <code>sap.ui.webc.fiori.UploadCollection</code> only displays an overlay.
				 */
				hideDragOverlay: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the mode of the <code>sap.ui.webc.fiori.UploadCollection</code>.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b>
				 * <ul>
				 *     <li><code>None</code></li>
				 *     <li><code>SingleSelect</code></li>
				 *     <li><code>MultiSelect</code></li>
				 *     <li><code>Delete</code></li>
				 * </ul>
				 */
				mode: {
					type: "sap.ui.webc.main.ListMode",
					defaultValue: ListMode.None
				},

				/**
				 * Allows you to set your own text for the 'No data' description.
				 */
				noDataDescription: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Allows you to set your own text for the 'No data' text.
				 */
				noDataText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the <code>sap.ui.webc.fiori.UploadCollection</code> header. <br>
				 * <br>
				 * <b>Note:</b> If <code>header</code> slot is provided, the labelling of the <code>UploadCollection</code> is a responsibility of the application developer. <code>accessibleName</code> should be used.
				 */
				header: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "header"
				},

				/**
				 * Defines the items of the <code>sap.ui.webc.fiori.UploadCollection</code>. <br>
				 * <b>Note:</b> Use <code>sap.ui.webc.fiori.UploadCollectionItem</code> for the intended design.
				 */
				items: {
					type: "sap.ui.webc.fiori.IUploadCollectionItem",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired when an element is dropped inside the drag and drop overlay. <br>
				 * <br>
				 * <b>Note:</b> The <code>drop</code> event is fired only when elements are dropped within the drag and drop overlay and ignored for the other parts of the <code>sap.ui.webc.fiori.UploadCollection</code>.
				 */
				drop: {
					parameters: {
						/**
						 * The <code>drop</code> event operation data.
						 */
						dataTransfer: {
							type: "DataTransfer"
						}
					}
				},

				/**
				 * Fired when the Delete button of any item is pressed. <br>
				 * <br>
				 * <b>Note:</b> A Delete button is displayed on each item, when the <code>sap.ui.webc.fiori.UploadCollection</code> <code>mode</code> property is set to <code>Delete</code>.
				 */
				itemDelete: {
					parameters: {
						/**
						 * The <code>sap.ui.webc.fiori.UploadCollectionItem</code> which was renamed.
						 */
						item: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired when selection is changed by user interaction in <code>SingleSelect</code> and <code>MultiSelect</code> modes.
				 */
				selectionChange: {
					parameters: {
						/**
						 * An array of the selected items.
						 */
						selectedItems: {
							type: "Array"
						}
					}
				}
			},
			designtime: "sap/ui/webc/fiori/designtime/UploadCollection.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return UploadCollection;
});