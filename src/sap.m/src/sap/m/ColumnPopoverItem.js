/*
 * ! ${copyright}
 */
sap.ui.define(['sap/ui/core/Element'], function(Element) {
	"use strict";

	/**
	 * Constructor for the element.
	 * @param {string} [sId] id for the new element.
	 * @param {string} [mSettings] initial settings for the new element.
	 *
	 * @class
	 * The <code>ColumnPopoverItem</code> is used for sorting, filter and grouping behaviours in ColumnHeaderPopover control.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @since 1.63
	 * @private
	 * @alias sap.m.ColumnPopoverItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnPopoverItem = Element.extend("sap.m.ColumnPopoverItem", /** @lends sap.m.ColumnPopoverItem.prototype */
		{
			metadata: {
				library: "sap.m",
				properties: {
					visible: {type: "boolean", group: "Misc", defaultValue: true}
				}
			}
		});
		ColumnPopoverItem.prototype._createButton = function() {
			throw new Error('Abstract function _create Button must be implemented in your Item (that extends this abstract object).');
		};
	return ColumnPopoverItem;
});