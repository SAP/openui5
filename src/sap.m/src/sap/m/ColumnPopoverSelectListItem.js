/*
 * ! ${copyright}
 */
sap.ui.define([
	'./ColumnPopoverItem',
	'sap/m/ToggleButton',
	'sap/m/Button',
	'sap/m/StandardListItem',
	'sap/m/List'],
	function(
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
	 * The <code>ColumnPopoverSelectListItem</code> provides the capabilities to perform grouping, aggregation in ColumnHeaderPopover.
	 * @extends sap.m.ColumnPopoverItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @since 1.86
	 * @private
	 * @alias sap.m.ColumnPopoverSelectListItem
	 */
	var ColumnPopoverSelectListItem = ColumnPopoverItem.extend("sap.m.ColumnPopoverSelectListItem", /** @lends sap.m.ColumnPopoverSelectListItem.prototype */
	{
		library: "sap.m",
		metadata: {
			properties: {
				/**
				 * Label to be displayed as toolTip by the control
				 */
				label: {type: "string", group: "Misc", defaultValue: null},
				/**
				 * Actionitem button icon
				 */
				icon: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null}
			},
			events: {
				/**
				 * Action event
				 */
				action: {
					parameters: {
						/**
						 * action property
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

	ColumnPopoverSelectListItem.prototype._createButton = function(sId, oCHPopover) {
		var sText = this.getLabel(),
			aItems = this.getItems(),
			that = this;

		if (aItems.length > 1) {
			var oPopover = oCHPopover.getAggregation("_popover");
			var oList = new List();
			for (var i = 0; i < aItems.length; i++) {
				var oListItem = new StandardListItem({
					title: aItems[i].getText(),
					type: "Active"
				});
				oList.addItem(oListItem);
				oListItem.data("key", aItems[i].getKey());
			}

			oList.attachEvent("itemPress", function(oEvent) {
				// close the popover first to prevent focus lost
				oPopover.close();
				var oListItem = oEvent.getParameter("listItem");
				that.fireAction({
					property: oListItem.data("key")
				});
			});

			oList.setVisible(false);
			oPopover.addContent(oList);

			return new ToggleButton(sId, {
				icon: this.getIcon(),
				type: "Transparent",
				tooltip: sText,
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
				icon: this.getIcon(),
				type: "Transparent",
				tooltip: sText,
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
					that.fireAction({
						property: aItems[0] ? aItems[0].getKey() : null
					});
				}
			});
		}
	};
	return ColumnPopoverSelectListItem;
});