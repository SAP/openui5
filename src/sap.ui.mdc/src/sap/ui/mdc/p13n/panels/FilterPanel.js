
/*!
* ${copyright}
*/
sap.ui.define([
	"sap/m/p13n/QueryPanel",
	"sap/m/VBox",
	"sap/m/Text",
	"sap/ui/layout/Grid",
	"sap/ui/layout/GridData",
	"sap/m/ComboBox",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/m/Label"
 ], function (QueryPanel, VBox, Text, Grid, GridData, ComboBox, coreLibrary, mLibrary, Label) {
	"use strict";

	//shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.ListKeyboardMode
	var ListKeyboardMode = mLibrary.ListKeyboardMode;

	/**
	 * Constructor for a new <code>FilterPanel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control can be used to customize personalization content for filtering
	 * for an associated control instance.
	 *
	 * @extends sap.m.p13n.QueryPanel
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @experimental Since 1.107.
	 * @since 1.107
	 * @alias sap.ui.mdc.p13n.panels.FilterPanel
	 */
	var FilterPanel = QueryPanel.extend("sap.ui.mdc.p13n.panels.FilterPanel", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * A factory function that will be called whenever the user selects a new entry from the <code>ComboBox</code>.
				 * The factory must return a single control instance of an input based control to provide custom filter capabilities.
				 * This control is then going to be added in the grid layout provided by the <code>QueryPanel</code>.
				 * Whenever the <code>FilterPanel#setP13nData</code> method will be called, the <code>active</code> can be used to update the
				 * current set of active factory controls.
				 *
				 * <b>Note:</b>: The Panel will not handle the lifecylce of the provided factory control instance, in case the row is going to be
				 * removed, the according consumer needs to decide about destroying or keeping the control instance. In addition, the <code>getIdForLabel</code>
				 * method can be used to return a focusable children control to provide the <code>labelFor</code> reference.
				 */
				itemFactory: {
					type: "function"
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	/**
	 * P13n <code>FilterItem</code> object type.
	 *
	 * @static
	 * @constant
	 * @typedef {object} sap.ui.mdc.p13n.panels.FilterItem
	 * @property {string} name The unique key of the item
	 * @property {string} label The label describing the personalization item
	 * @property {boolean} active Defines whether there is a visible grid shown in the panel for this key, also triggers the call of the <code>#itemFactory</code> function
	 *
	 * @public
	 */

	/**
	 * Sets the personalization state of the panel instance.
	 * @name sap.ui.mdc.p13n.panels.FilterPanel.prototype.setP13nData
	 * @public
	 * @function
	 *
	 * @param {sap.ui.mdc.p13n.panels.FilterItem[]} aP13nData An array containing the personalization state
	 * @returns {this} The FilterPanel instance
	 */

	FilterPanel.prototype.PRESENCE_ATTRIBUTE = "active";

	FilterPanel.prototype._createInnerListControl = function () {
		var oList = QueryPanel.prototype._createInnerListControl.apply(this, arguments);
		oList.setKeyboardMode(ListKeyboardMode.Edit);
		return oList;
	};

	FilterPanel.prototype._createQueryRowGrid = function(oItem) {

		var oRowContent = oItem.name ? this._createRowContainer(oItem.label, oItem.key) : this._createKeySelect(oItem.name);

		var aContent = [oRowContent];
		if (oItem.name) {
			aContent.push(this._createFactoryControl(oItem));
		}
		return new Grid({
			containerQuery: true,
			defaultSpan: "XL4 L4 M4 S4",
			content: aContent
		}).addStyleClass("sapUiTinyMargin");
	};

	FilterPanel.prototype._getPlaceholderText = function () {
		return this._getResourceText("p13n.FILTER_PLACEHOLDER");
	};

	FilterPanel.prototype._getRemoveButtonTooltipText = function () {
		return this._getResourceText("p13n.FILTER_REMOVEICONTOOLTIP");
	};

	FilterPanel.prototype._createKeySelect = function (sKey) {

		var oComboBox = new ComboBox({
			width: "100%",
			items: this._getAvailableItems(),
			placeholder: this._getPlaceholderText(),
			selectionChange: function(oEvt) {
				var oComboBox = oEvt.getSource();
				this._selectKey(oComboBox);
			}.bind(this),
			change: function(oEvt) {
				var oComboBox = oEvt.getSource();
				var newValue = oEvt.getParameter("newValue");
				oComboBox.setValueState( newValue && !oComboBox.getSelectedItem() ? ValueState.Error : ValueState.None);
				this._selectKey();
			}.bind(this)
		});


		return oComboBox;
	};

	FilterPanel.prototype._createRemoveButton = function (bVisible) {
		var oRemoveBtn = QueryPanel.prototype._createRemoveButton.apply(this, arguments);
		oRemoveBtn.setLayoutData(new GridData({
			span: "XL1 L1 M1 S1"
		}));
		return oRemoveBtn;
	};

	FilterPanel.prototype._createRowContainer = function(sText, sKey) {
		// var sKey = oSelect._key;
		var oLabel = new Label({text: sText, showColon: true});
		var oFieldBox = new VBox({
			items:[ oLabel.addStyleClass("sapUiTinyMarginTop").addStyleClass("sapUiTinyMarginBegin")]
		});
		oFieldBox._key = sKey;
		return oFieldBox;
	};

	FilterPanel.prototype._setLabelForOnBox = function(oFilterItem, oFieldBox) {
		oFieldBox.getItems()[0].setLabelFor(oFilterItem);
	};

	FilterPanel.prototype._selectKey = function(oComboBox) {
		var oQueryRowGrid, sKey;
		if (oComboBox) {
			this._oComboBox = oComboBox;
			oQueryRowGrid = oComboBox.getParent();
			sKey = oComboBox.getSelectedKey();
		} else if (this._oComboBox) {
			oComboBox = this._oComboBox;
			oQueryRowGrid = oComboBox.getParent();
			sKey = oComboBox.getSelectedKey();

			if (sKey) {
				QueryPanel.prototype._selectKey.call(this, oComboBox);

				var oSelect = oQueryRowGrid.getContent()[0];
				oQueryRowGrid.removeContent(oSelect);

				var sText = sKey ? oComboBox.getSelectedItem().getText() : "";

				var oFieldBox = this._createRowContainer(sText, sKey); //Create a container with a VBox and a label with some padding inside and insert it in the grid
				oQueryRowGrid.insertContent(oFieldBox,0);

				var oFilterItem = this._createFactoryControl({name: sKey}); //Create the actual filterable control and insert it in the grid
				this._setLabelForOnBox(oFilterItem, oFieldBox);

				oQueryRowGrid.insertContent(oFilterItem, 1);

			}

			//FIXME: Check why this workaround is necessary
			setTimeout(function(){
				if (this._oListControl && !this._oListControl.bIsDestroyed) {
					this._oListControl.setKeyboardMode(ListKeyboardMode.Edit);
				}
			}.bind(this), 20);

			delete this._oComboBox;
		}
	};

	/**
	 * @private
	 * Retrieve the factory control for a current row
	 * @param {sap.m.CustomListItem} oRow The list item
	 * @returns {sap.ui.core.Control} The factory control of the provided row
	 */
	FilterPanel.prototype._getFactoryControlForRow = function(oRow) {
	   return oRow.getContent()[0].getContent()[1];
	};

	FilterPanel.prototype._createFactoryControl = function(oItem) {
		var oField = this.getItemFactory().call(this, oItem);
		oField.setLayoutData(new GridData({
			span: "XL7 L7 M7 S7"
		}));
		return oField;
	};

	return FilterPanel;
});
