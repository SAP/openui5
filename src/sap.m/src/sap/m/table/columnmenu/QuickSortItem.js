/*!
 * ${copyright}
 */

sap.ui.define([
	"./QuickActionItem",
	"./QuickAction",
	"sap/m/HBox",
	"sap/m/ToggleButton",
	"sap/ui/core/library"
], function (
	QuickActionItem,
	QuickAction,
	HBox,
	ToggleButton,
	library
) {
	"use strict";

	var SortOrder = library.SortOrder;

	/**
	 * Constructor for a new QuickSortItem.
	 *
	 * @param {string} [sId] ID for the new QuickSortItem, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new QuickSortItem
	 *
	 * @class
	 * This element serves as a quick sort item.
	 * It can be used to specify control- and application specific quick sort items.
	 *
	 * @extends sap.m.table.columnmenu.QuickActionItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.columnmenu.QuickSortItem
	 */
	var QuickSortItem = QuickActionItem.extend("sap.m.table.columnmenu.QuickSortItem", {
		metadata: {
			library: "sap.m",
			properties: {
				sortOrder: { type: "sap.ui.core.SortOrder", defaultValue: library.SortOrder.None }
			},
			aggregations: {
				quickAction: { type: "sap.m.table.columnmenu.QuickAction", multiple: false, visibility: "hidden" }
			}
		}
	});

	QuickSortItem.prototype._getAction = function() {
		var oQuickAction = this.getAggregation("quickAction");
		var sLabel = this._getLabel(this.getParent().getItems().length);

		if (oQuickAction) {
			oQuickAction.setLabel(sLabel);
		} else {
			oQuickAction = new QuickAction({
				label: sLabel,
				content: [this._createContent()]
			});
		}

		this.setAggregation("quickAction", oQuickAction, true);
		return oQuickAction;
	};

	QuickSortItem.prototype._getLabel = function(iLength) {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		if (iLength === 1) {
			return oBundle.getText("table.COLUMNMENU_QUICK_SORT");
		} else {
			return oBundle.getText("table.COLUMNMENU_SORT_BY", this.getLabel());
		}
	};

	QuickSortItem.prototype._createContent = function() {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		return [
			new ToggleButton({
				text: oBundle.getText("table.COLUMNMENU_SORT_ASCENDING"),
				pressed: this.getSortOrder() === SortOrder.Ascending,
				press: [{item: this, sortOrder: SortOrder.Ascending}, this._onSortChange, this]
			}),
			new ToggleButton({
				text: oBundle.getText("table.COLUMNMENU_SORT_DESCENDING"),
				pressed: this.getSortOrder() === SortOrder.Descending,
				press: [{item: this, sortOrder: SortOrder.Descending}, this._onSortChange, this]
			})
		];
	};

	QuickSortItem.prototype._onSortChange = function (oEvent, mSortInfo) {
		if (oEvent.getParameters().pressed) {
			var sButtonId = oEvent.getSource().sId;
			oEvent.getSource().getParent().getContent().forEach(function(oButton) {
				if (oButton.sId != sButtonId) {
					oButton.setPressed(false);
				}
			});
		}

		mSortInfo.item.setProperty("sortOrder", oEvent.getParameters().pressed ? mSortInfo.sortOrder : SortOrder.None, true);
		this.getParent().onChange(mSortInfo.item);
	};

	return QuickSortItem;
});