/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new LinkItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class A <code>LinkItem</code> control is used in the {@link sap.ui.mdc.Link} control to provide a navigation target.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.58.0
	 * @alias sap.ui.mdc.link.LinkItem
	 */
	const LinkItem = Element.extend("sap.ui.mdc.link.LinkItem", /** @lends sap.ui.mdc.link.LinkItem.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Unique key of the <code>LinkItem</code> that is used for personalization.
				 */
				key: {
					type: "string"
				},
				/**
				 * Text of the <code>Link</code> that is displayed.
				 */
				text: {
					type: "string"
				},
				/**
				 * Defines the additional text of the item.
				 */
				description: {
					type: "string"
				},
				/**
				 * Destination link for a navigation operation in external format (used when opening in new tab).
				 */
				href: {
					type: "string"
				},
				/**
				 * Destination link for a navigation operation in internal format provided by the SAP Fiori launchpad (used when navigation happens
				 * programmatically).
				 */
				internalHref: {
					type: "string",
					defaultValue: null
				},
				/**
				 * Determines the target of the <code>Link</code> and has to be used as the <code>target</code> of an html anchor.
				 */
				target: {
					type: "string",
					defaultValue: "_self"
				},
				/**
				 * Defines the icon of the item.
				 */
				icon: {
					type: "string"
				},
				/**
				 * Determines the initial visibility of the <code>LinkItem</code>. If set to <code>true</code>, the item will appear on the <code>Popover</code>
				 * without any personalization.
				 */
				initiallyVisible: {
					type: "boolean",
					defaultValue: false
				}
			// ER: LinkItem should not have the visible property.
			// The visibility should be modified either via default logic defined by UX like
			// * show only less 10 links
			// * show always initiallyVisible links and other do not show
			// or wia personalization. So the application should not be able to manipulate the
			// visibility in breakout.
			// visible: {
			// 	type: "boolean",
			// 	defaultValue: true
			// }
			}
		}
	});

	return LinkItem;

});
