/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.MediaGallery.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/MediaGallery"
], function(WebComponent, library) {
	"use strict";

	var MediaGalleryLayout = library.MediaGalleryLayout;
	var MediaGalleryMenuHorizontalAlign = library.MediaGalleryMenuHorizontalAlign;
	var MediaGalleryMenuVerticalAlign = library.MediaGalleryMenuVerticalAlign;

	/**
	 * Constructor for a new <code>MediaGallery</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.fiori.MediaGallery</code> component allows the user to browse through multimedia items. Currently, the supported items are images and videos. The items should be defined using the <code>sap.ui.webc.fiori.MediaGalleryItem</code> component.
	 *
	 * The items are initially displayed as thumbnails. When the user selects a thumbnail, the corresponding item is displayed in larger size. <br>
	 * The component is responsive by default and adjusts the position of the menu with respect to viewport size, but the application is able to further customize the layout via the provided API.
	 *
	 * <h3>Keyboard Handling</h3> The <code>sap.ui.webc.fiori.MediaGallery</code> provides advanced keyboard handling. <br>
	 * When the thumbnails menu is focused the following keyboard shortcuts allow the user to navigate through the thumbnail items: <br>
	 *
	 *
	 *
	 * <ul>
	 *     <li>[UP/DOWN] - Navigates up and down the items</li>
	 *     <li>[HOME] - Navigates to first item</li>
	 *     <li>[END] - Navigates to the last item</li>
	 *     <li>[SPACE/ENTER] - Select an item
	 * </ul> <br>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.99.0
	 * @experimental Since 1.99.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.MediaGallery
	 */
	var MediaGallery = WebComponent.extend("sap.ui.webc.fiori.MediaGallery", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-media-gallery-ui5",
			properties: {

				/**
				 * If enabled, a <code>display-area-click</code> event is fired when the user clicks or taps on the display area. <br>
				 * The display area is the central area that contains the enlarged content of the currently selected item.
				 */
				interactiveDisplayArea: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Determines the layout of the component. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Auto</code></li>
				 *     <li><code>Vertical</code></li>
				 *     <li><code>Horizontal</code></li>
				 * </ul>
				 */
				layout: {
					type: "sap.ui.webc.fiori.MediaGalleryLayout",
					defaultValue: MediaGalleryLayout.Auto
				},

				/**
				 * Determines the horizontal alignment of the thumbnails menu vs. the central display area. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Left</code></li>
				 *     <li><code>Right</code></li>
				 * </ul>
				 */
				menuHorizontalAlign: {
					type: "sap.ui.webc.fiori.MediaGalleryMenuHorizontalAlign",
					defaultValue: MediaGalleryMenuHorizontalAlign.Left
				},

				/**
				 * Determines the vertical alignment of the thumbnails menu vs. the central display area. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Top</code></li>
				 *     <li><code>Bottom</code></li>
				 * </ul>
				 */
				menuVerticalAlign: {
					type: "sap.ui.webc.fiori.MediaGalleryMenuVerticalAlign",
					defaultValue: MediaGalleryMenuVerticalAlign.Bottom
				},

				/**
				 * If set to <code>true</code>, all thumbnails are rendered in a scrollable container. If <code>false</code>, only up to five thumbnails are rendered, followed by an overflow button that shows the count of the remaining thumbnails.
				 */
				showAllThumbnails: {
					type: "boolean",
					defaultValue: false
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the component items.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> Only one selected item is allowed.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> Use the <code>sap.ui.webc.fiori.MediaGalleryItem</code> component to define the desired items.
				 */
				items: {
					type: "sap.ui.webc.fiori.IMediaGalleryItem",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired when the display area is clicked.<br>
				 * The display area is the central area that contains the enlarged content of the currently selected item.
				 */
				displayAreaClick: {
					parameters: {}
				},

				/**
				 * Fired when the thumbnails overflow button is clicked.
				 */
				overflowClick: {
					parameters: {}
				},

				/**
				 * Fired when selection is changed by user interaction.
				 */
				selectionChange: {
					parameters: {
						/**
						 * the selected item.
						 */
						item: {
							type: "HTMLElement"
						}
					}
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return MediaGallery;
});