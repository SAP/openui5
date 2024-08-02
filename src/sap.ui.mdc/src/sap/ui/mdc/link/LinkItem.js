/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
], (Element) => {
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
	const LinkItem = Element.extend("sap.ui.mdc.link.LinkItem", /** @lends sap.ui.mdc.link.LinkItem.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Unique key of the <code>LinkItem</code> that is used for personalization.
				 */
				key: {
					type: "string",
					defaultValue: undefined
				},
				/**
				 * Text of the <code>Link</code> that is displayed.
				 */
				text: {
					type: "string",
					defaultValue: null
				},
				/**
				 * Defines the additional text of the item.
				 */
				description: {
					type: "string",
					defaultValue: undefined
				},
				/**
				 * Destination link for a navigation operation in external format (used when opening in new tab) using the <code>hrefForExternal</code> method of the CrossApplicationNavigation service.
				 */
				href: {
					type: "string",
					defaultValue: null
				},
				/**
				 * Destination link for a navigation operation in internal format provided by the SAP Fiori launchpad (used when navigation happens
				 * programmatically). Only for internal use
				 * @protected
				 */
				internalHref: {
					type: "string",
					defaultValue: null
				},
				/**
				 * Determines the target of the <code>Link</code> and has to be used as the <code>target</code> of an html anchor.
				 * The standard values for the <code>target</code> property are: _self, _top, _blank, _parent, _search. Alternatively, a frame name
				 * can be entered. This property is only used if the <code>href</code> property is set.
				 */
				target: {
					type: "string",
					defaultValue: "_self"
				},
				/**
				 * Defines the icon of the item.
				 */
				icon: {
					type: "sap.ui.core.URI"
				},
				/**
				 * Determines the initial visibility of the <code>LinkItem</code>. If set to <code>true</code>, the item will appear on the <code>Popover</code>
				 * without any personalization.
				 */
				initiallyVisible: {
					type: "boolean",
					defaultValue: false
				},
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
				/**
				 * Callback for <code>press</code> event.
				 * @private
				 * @since 1.122.0
				 * @ui5-restricted sap.ui.comp
				 */
				press: {
					type: "object",
					defaultValue: null
				}
			}
		}
	});

	return LinkItem;

});