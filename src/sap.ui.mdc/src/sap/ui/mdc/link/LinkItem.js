/*
 * ! ${copyright}
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
	 * @private
	 * @since 1.58.0
	 * @alias sap.ui.mdc.link.LinkItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var LinkItem = Element.extend("sap.ui.mdc.link.LinkItem", /** @lends sap.ui.mdc.link.LinkItem.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				key: {
					type: "string"
				},
				text: {
					type: "string"
				},
				description: {
					type: "string"
				},
				href: {
					type: "string"
				},
				/**
				 * Destination link for a navigation operation in internal format provided by FLP.
				 * @protected
				 */
				internalHref: {
					type: "string",
					defaultValue: null
				},
				target: {
					type: "string",
					defaultValue: "_self"
				},
				icon: {
					type: "string"
				},
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
