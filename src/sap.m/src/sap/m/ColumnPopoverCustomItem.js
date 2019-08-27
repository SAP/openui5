/*
 * ! ${copyright}
 */
sap.ui.define(['./ColumnPopoverItem'], function(ColumnPopoverItem) {
	"use strict";

	/**
	 * Constructor for the element.
	 *
	 * @param {string} [sId] id for the new element.
	 * @param {string} [mSettings] initial settings for the new element.
	 *
	 * @class
	 * The <code>ColumnPopoverCustomItem</code> provides the capabilities to perform custom behaviour in ColumnHeaderPopover.
	 * @extends sap.m.ColumnPopoverItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @since 1.63
	 * @private
	 * @alias sap.m.ColumnPopoverCustomItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnPopoverCustomItem = ColumnPopoverItem.extend("sap.m.ColumnPopoverCustomItem", /** @lends sap.m.ColumnPopoverCustomItem.prototype */
	{
		library : "sap.m",
		metadata : {
			properties: {
				/**
				 * Customitem button icon
				 */
				icon    : { type : "sap.ui.core.URI", group : "Misc", defaultValue : null },
				/**
				 * Customitem button text
				 */
				text    : { type : "string", group : "Misc", defaultValue : null }
			},
			aggregations: {
				/**
				 * Note that the content created inside ColumnPopoverCustomItem can not be used more than once.
				 */
				content: { type: "sap.ui.core.Control", multiple: false, singularName: "content" }
			},
			events : {
				/**
				 * beforeShowContent event
				 */
				beforeShowContent: {}
			}
		}

	});

	return ColumnPopoverCustomItem;
});