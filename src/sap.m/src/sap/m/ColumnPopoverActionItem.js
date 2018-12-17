/*
 * ! ${copyright}
 */
sap.ui.define(['./ColumnPopoverItem'], function(ColumnPopoverItem) {
	"use strict";

	/**
	 * Constructor for the element.
	 * @param {string} [sId] id for the new element.
	 * @param {string} [mSettings] initial settings for the new element.
	 *
	 * @class
	 * The <code>ColumnPopoverActionItem</code> provides the capabilities to perform sorting, filter and grouping in ColumnHeaderPopover.
	 * @extends sap.m.ColumnPopoverItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @since 1.63
	 * @private
	 * @alias sap.m.ColumnPopoverActionItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnPopoverActionItem = ColumnPopoverItem.extend("sap.m.ColumnPopoverActionItem", /** @lends sap.m.ColumnPopoverActionItem.prototype */
	{
		library : "sap.m",
		metadata : {
			properties: {
				/**
				 * Actionitem button icon
				 */
				icon    : { type : "sap.ui.core.URI", group : "Misc", defaultValue : null },
				/**
				 * Actionitem button text
				 */
				text    : { type : "string", group : "Misc", defaultValue : null}
			},
			events : {
				/**
				 * Press event
				 */
				press: {}
			}
		}

	});

	return ColumnPopoverActionItem;
});