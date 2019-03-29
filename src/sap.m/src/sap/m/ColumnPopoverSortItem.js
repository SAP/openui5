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
	 * The <code>ColumnPopoverSortItem</code> provides the capabilities to perform sorting in ColumnHeaderPopover.
	 * @extends sap.m.ColumnPopoverItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @since 1.66
	 * @private
	 * @alias sap.m.ColumnPopoverSortItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnPopoverSortItem = ColumnPopoverItem.extend("sap.m.ColumnPopoverSortItem", /** @lends sap.m.ColumnPopoverSortItem.prototype */
	{
		library : "sap.m",
		metadata : {
			properties: {
				/**
				 * the property that the sort function performed
				 */
				label: { type : "string", group : "Misc", defaultValue : null}
			},
			events : {
				/**
				 * Sort event
				 */
				sort: {
					parameters : {

						/**
						 * sort property
						 */
						property: {type: "string"}

					}
				}
			},
			aggregations: {
				sortChildren: { type: "sap.ui.core.Item", multiple: true, singularName: "sortChild", bindable: true }
			}
		}

	});

	return ColumnPopoverSortItem;
});