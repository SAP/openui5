/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.MediaGalleryItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"./thirdparty/MediaGalleryItem"
], function(WebComponent, library, EnabledPropagator) {
	"use strict";

	var MediaGalleryItemLayout = library.MediaGalleryItemLayout;

	/**
	 * Constructor for a new <code>MediaGalleryItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.fiori.MediaGalleryItem</code> web component represents the items displayed in the <code>sap.ui.webc.fiori.MediaGallery</code> web component. <br>
	 * <br>
	 * <b>Note:</b> <code>sap.ui.webc.fiori.MediaGalleryItem</code> is not supported when used outside of <code>sap.ui.webc.fiori.MediaGallery</code>. <br>
	 * <br>
	 *
	 *
	 * <h3>Keyboard Handling</h3> The <code>sap.ui.webc.fiori.MediaGallery</code> provides advanced keyboard handling. When focused, the user can use the following keyboard shortcuts in order to perform a navigation: <br>
	 *
	 * <ul>
	 *     <li>[SPACE/ENTER/RETURN] - Trigger <code>ui5-click</code> event</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.99.0
	 * @experimental Since 1.99.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.MediaGalleryItem
	 * @implements sap.ui.webc.fiori.IMediaGalleryItem
	 */
	var MediaGalleryItem = WebComponent.extend("sap.ui.webc.fiori.MediaGalleryItem", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-media-gallery-item-ui5",
			interfaces: [
				"sap.ui.webc.fiori.IMediaGalleryItem"
			],
			properties: {

				/**
				 * Defines whether the control is enabled. A disabled control can't be interacted with, and it is not in the tab chain.
				 */
				enabled: {
					type: "boolean",
					defaultValue: true,
					mapping: {
						type: "attribute",
						to: "disabled",
						formatter: "_mapEnabled"
					}
				},

				/**
				 * Determines the layout of the item container. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Square</code></li>
				 *     <li><code>Wide</code></li>
				 * </ul>
				 */
				layout: {
					type: "sap.ui.webc.fiori.MediaGalleryItemLayout",
					defaultValue: MediaGalleryItemLayout.Square
				},

				/**
				 * Defines the selected state of the component.
				 */
				selected: {
					type: "boolean",
					defaultValue: false
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Defines the content of the component.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * Defines the content of the thumbnail.
				 */
				thumbnail: {
					type: "sap.ui.core.Control",
					multiple: false,
					slot: "thumbnail"
				}
			}
		}
	});

	EnabledPropagator.call(MediaGalleryItem.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return MediaGalleryItem;
});