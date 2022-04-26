/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new PanelItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for <code>items</code> aggregation in <code>Panel</code> control.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.54.0
	 * @alias sap.ui.mdc.link.PanelItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PanelItem = Element.extend("sap.ui.mdc.link.PanelItem", /** @lends sap.ui.mdc.link.PanelItem.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/link/PanelItem.designtime",
			properties: {
				/**
				 * Defines text of the item.
				 */
				text: {
					type: "string"
				},
				/**
				 * Defines additional text of the item.
				 */
				description: {
					type: "string"
				},
				/**
				 * Defines href of the item.
				 */
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
				/**
				 * Defines target of the item.
				 */
				target: {
					type: "string",
					defaultValue: undefined
				},
				/**
				 * Defines icon of the item.
				 */
				icon: {
					type: "string"
				},
				/**
				 * Defines visibility of the item.
				 */
				visible: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Describes whether the visibility is changed by end user or not.
				 * @since 1.60.0
				 */
				visibleChangedByUser: {
					type: "boolean"
				}
				// /**
				//  * TODO: workaround due to disabled 'Reset' button in SelectionDialog
				//  * @since 1.60.0
				//  */
				// visibleChangedChangeHandler: {
				// 	type: "boolean",
				// 	defaultValue: false
				// },
				// /**
				//  * TODO: workaround due to disabled 'Reset' button in SelectionDialog
				//  * @since 1.60.0
				//  */
				// visibleInitial: {
				// 	type: "boolean"
				// }
			// },
			// /**
			//  * Defines press handler of a link.
			//  */
			// press: {
			// 	type: "object",
			// 	defaultValue: null
			// }
			}
		}
	});

	PanelItem.prototype.getJson = function() {
		return {
			id: this.getId(),
			text: this.getText(),
			description: this.getDescription(),
			href: this.getHref(),
			internalHref: this.getInternalHref(),
			icon: this.getIcon(),
			target: this.getTarget(),
			visible: this.getVisible(),
			visibleChangedByUser: this.getVisibleChangedByUser()
			// visibleChangedChangeHandler: this.getVisibleChangedChangeHandler(),
			// visibleInitial: this.getVisibleInitial()
		};
	};
	return PanelItem;

});
