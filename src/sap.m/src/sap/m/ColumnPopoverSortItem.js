/*
 * ! ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Core',
	'./ColumnPopoverItem',
	'sap/m/ToggleButton',
	'sap/m/Button',
	'sap/m/StandardListItem',
	'sap/m/List'],
	function(
		Core,
		ColumnPopoverItem,
		ToggleButton,
		Button,
		StandardListItem,
		List) {
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
		library: "sap.m",
		metadata: {
			properties: {
				/**
				 * check it later with Ux - it is not used now.
				 */
				label: {type: "string", group: "Misc", defaultValue: null}
				},
			events: {
				/**
				 * Sort event
				 */
				sort: {
					parameters: {
						/**
						 * sort property
						 */
						property: {type: "string"}
					}
				}
			},
			aggregations: {
				items: {type: "sap.ui.core.Item", multiple: true, singularName: "item", bindable: true}
			}
		}
	});

	ColumnPopoverSortItem.prototype._createButton = function(sId, oCHPopover) {
		var oBundle = Core.getLibraryResourceBundle("sap.m"),
			sSortText = oBundle.getText("COLUMNHEADERPOPOVER_SORT_BUTTON"),
			aSortItems = this.getItems(),
			that = this;

		if (aSortItems.length > 1) {
			var oPopover = oCHPopover.getAggregation("_popover");
			var oList = new List();
			for (var i = 0; i < aSortItems.length; i++) {
				var oListItem = new StandardListItem({
					title: aSortItems[i].getText(),
					type: "Active"
				});
				oList.addItem(oListItem);
				oListItem.data("key", aSortItems[i].getKey());
			}

			oList.attachEvent("itemPress", function(oEvent) {
				// close the popover first to prevent focus lost
				oPopover.close();
				var oListItem = oEvent.getParameter("listItem");
				that.fireSort({
					property: oListItem.data("key")
				});
			});

			oList.setVisible(false);
			oPopover.addContent(oList);

			return new ToggleButton(sId, {
				icon: "sap-icon://sort",
				type: "Transparent",
				tooltip: sSortText,
				visible: this.getVisible(),

				press: function() {
					// between two custom items
					if (oCHPopover._oShownCustomContent) {
						oCHPopover._oShownCustomContent.setVisible(false);
					}
					if (this.getPressed()) {
						// set other buttons unpressed
						oCHPopover._cleanSelection(this);
						if (oList) {
							oList.setVisible(true);
							oCHPopover._oShownCustomContent = oList;
						}
					} else if (oList) {
						oList.setVisible(false);
						oCHPopover._oShownCustomContent = null;
					}
				}
			});
		} else {
			return new Button(sId, {
				icon: "sap-icon://sort",
				type: "Transparent",
				tooltip: sSortText,
				visible: this.getVisible(),
				press: function() {
					var oPopover = oCHPopover.getAggregation("_popover");
					if (oCHPopover._oShownCustomContent) {
						oCHPopover._oShownCustomContent.setVisible(false);
						oCHPopover._oShownCustomContent = null;
						// set other buttons unpressed
						oCHPopover._cleanSelection(this);
					}
					// close the popover first to prevent focus lost
					oPopover.close();
					// fire sort event
					that.fireSort({
						property: aSortItems[0] ? aSortItems[0].getKey() : null
					});
				}
			});
		}
	};
	return ColumnPopoverSortItem;
});