/*
 * ! ${copyright}
 */
sap.ui.define([
	"./QueryPanel", "sap/m/Text", "sap/m/SegmentedButton", "sap/m/SegmentedButtonItem", "sap/ui/layout/Grid", "sap/ui/layout/GridData"
], function (QueryPanel, Text, SegmentedButton, SegmentedButtonItem, Grid, GridData) {
	"use strict";

	/**
	 * Constructor for a new <code>SortPanel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control can be used to customize personalization content for sorting
	 * for an associated control instance.
	 *
	 * @extends sap.m.p13n.QueryPanel
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @experimental Since 1.96.
	 * @since 1.96
	 * @alias sap.m.p13n.SortPanel
	 */

	var SortPanel = QueryPanel.extend("sap.m.p13n.SortPanel", {
		metadata: {
			library: "sap.m"
		},
		renderer: {
			apiVersion: 2
		}
	});

	SortPanel.prototype.PRESENCE_ATTRIBUTE = "sorted";
	SortPanel.prototype.CHANGE_REASON_SORTORDER = "sortorder";

	/**
	 * P13n <code>SortItem</code> object type.
	 *
	 * @type {sap.m.p13n.SortItem}
	 * @static
	 * @constant
	 * @typedef {object} sap.m.p13n.SortItem
	 * @property {string} name The unique key of the item
	 * @property {string} label The label describing the personalization item
	 * @property {boolean} sorted Defines the sorting state of the personalization item
	 * @property {boolean} descending Defines the descending state of the personalization item
	 *
	 * @public
	 */

	/**
	 * Sets the personalization state of the panel instance.
	 * @name sap.m.p13n.SortPanel.setP13nData
	 * @public
	 * @function
	 *
	 * @param {sap.m.p13n.SortItem} aP13nData An array containing the personalization state
	 * @returns {sap.m.p13n.SortPanel} The SortPanel instance
	 *
	 */

	SortPanel.prototype._createRemoveButton = function () {
		var oRemvoeBtn = QueryPanel.prototype._createRemoveButton.apply(this, arguments);
		oRemvoeBtn.setLayoutData(new GridData({
			span: "XL3 L3 M3 S4"//on "S" the Asc/Desc text is invisible, we need to increase the size the
		}));
		return oRemvoeBtn;
	};

	SortPanel.prototype._createOrderSwitch = function (sKey, bDesc) {
		var oSortOrderSwitch = new SegmentedButton({
			enabled: sKey ? true : false,
			layoutData: new GridData({
				span: "XL2 L2 M2 S4" //on "S" the Asc/Desc text is invisible, we need to increase the size then
			}),
			items: [
				new SegmentedButtonItem({
					key: "asc",
					icon: "sap-icon://sort-ascending"
				}),
				new SegmentedButtonItem({
					key: "desc",
					icon: "sap-icon://sort-descending"
				})
			],
			select: function (oEvt) {
				var sSortOrder = oEvt.getParameter("key");
				var oText = oEvt.getSource().getParent().getContent()[2];
				oText.setText(this._getSortOrderText(sSortOrder === "desc"));
				var sKey = oEvt.oSource.getParent().getContent()[0].getSelectedItem().getKey();

				this._changeOrder(sKey, sSortOrder == "desc");
			}.bind(this)
		});

		oSortOrderSwitch.setSelectedItem(bDesc ? oSortOrderSwitch.getItems()[1] : oSortOrderSwitch.getItems()[0]);

		return oSortOrderSwitch;
	};

	SortPanel.prototype._createSortOrderText = function (sKey, bDesc) {
		return new Text({
			layoutData: new GridData({
				span: "XL3 L3 M3 S3",
				visibleS: false
			}),
			text: this._getSortOrderText(bDesc)
		}).addStyleClass("sapUiTinyMarginTop");
	};

	SortPanel.prototype._createQueryRowGrid = function(oItem) {
		//Enhance row with sort specific controls (Segmented Button + sort order text)
		var oSelect = this._createKeySelect(oItem.name);
		var oSortOrderSwitch = this._createOrderSwitch(oItem.name, oItem.descending);
		var oSortOrderText = this._createSortOrderText(oItem.name, oItem.descending);

		return new Grid({
			containerQuery: true,
			defaultSpan: "XL4 L4 M4 S4",
			content: [
				oSelect,
				oSortOrderSwitch,
				oSortOrderText
			]
		}).addStyleClass("sapUiTinyMargin");
	};

	SortPanel.prototype._getPlaceholderText = function () {
		return this._getResourceText("p13n.SORT_PLACEHOLDER");
	};

	SortPanel.prototype._getRemoveButtonTooltipText = function () {
		return this._getResourceText("p13n.SORT_REMOVEICONTOOLTIP");
	};

	SortPanel.prototype._selectKey = function(oComboBox) {
		QueryPanel.prototype._selectKey.apply(this, arguments);

		//Enable SegmentedButton
		var oListItem = oComboBox.getParent().getParent();
		var sNewKey = oComboBox.getSelectedKey();
		var aContent = oListItem.getContent()[0].getContent();
		aContent[1].setEnabled(!!sNewKey);

		//keep existing 'sortorder' selection
		var bDescending = aContent[1].getSelectedKey() === "desc";
		this._changeOrder(sNewKey, bDescending);
	};

	SortPanel.prototype._getSortOrderText = function(bDesc) {
		return bDesc ? this._getResourceText("p13n.SORT_DESCENDING") : this._getResourceText("p13n.SORT_ASCENDING");
	};

	SortPanel.prototype._changeOrder = function (sKey, bDesc) {
		var aItems = this._getP13nModel().getProperty("/items").filter(function (oItem) {
			return oItem.name === sKey;
		});

		if (aItems.length > 0) {
			aItems[0].descending = bDesc;

			this.fireChange({
				reason: this.CHANGE_REASON_SORTORDER,
				item: aItems[0]
			});
		}
	};

	return SortPanel;

});