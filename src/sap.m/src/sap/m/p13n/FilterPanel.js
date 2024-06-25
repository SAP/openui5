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
	"sap/m/Label",
	"sap/ui/core/Lib"
], (
	QueryPanel,
	VBox,
	Text,
	Grid,
	GridData,
	ComboBox,
	coreLibrary,
	mLibrary,
	Label,
	Library
) => {
	"use strict";

	//shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.ListKeyboardMode
	const ListKeyboardMode = mLibrary.ListKeyboardMode;

	// shortcut for sap.m.FlexJustifyContent
	const FlexJustifyContent = mLibrary.FlexJustifyContent;

	// shortcut for sap.m.WrappingType
	const WrappingType = mLibrary.WrappingType;

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
	 * @private
	 * @since 1.121
	 * @alias sap.m.p13n.FilterPanel
	 */
	const FilterPanel = QueryPanel.extend("sap.m.p13n.FilterPanel", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * A factory function that is called whenever the user selects a new entry from the <code>ComboBox</code>.
				 * The factory must return a single control instance of an input-based control to provide custom filter capabilities.
				 * This control is then going to be added in the grid layout provided by the <code>QueryPanel</code>.
				 * Whenever the <code>FilterPanel#setP13nData</code> method is called, <code>active</code> can be used to update the
				 * current set of active factory controls.
				 *
				 * <b>Note:</b>: The panel does not handle the lifecylce of the provided factory control instance, if the row is removed. The consumer needs to decide about destroying or keeping the control instance.
				 * In addition, the <code>getIdForLabel</code> method can be used to return a focusable child control to provide the <code>labelFor</code> reference.
				 */
				itemFactory: {
					type: "function"
				},
				/**
				 * A short text describing the panel.
				 * <b>Note:</b> This text will only be displayed if the panel is being used in a <code>sap.m.p13n.Popup</code>.
				 */
				title: {
					type: "string",
					defaultValue: Library.getResourceBundleFor("sap.m").getText("p13n.DEFAULT_TITLE_FILTER")
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	/**
	 * Personalization <code>FilterItem</code> object type.
	 *
	 * @static
	 * @constant
	 * @typedef {object} sap.m.p13n.FilterItem
	 * @property {string} name The unique key of the item
	 * @property {string} label The label describing the personalization item
	 * @property {boolean} active Defines whether there is a visible grid shown in the panel for this key, also triggers the call of the <code>#itemFactory</code> function
	 * @property {object[]} [conditions] The conditions that are optionally used for persisted when using the <code>FilterPanel</code> within a <code>FilterController</code>
	 *
	 * @private
	 */

	/**
	 * Sets the personalization state of the panel instance.
	 *
	 * @name sap.m.p13n.FilterPanel.prototype.setP13nData
	 * @function
	 * @param {sap.m.p13n.FilterItem[]} aP13nData An array containing the personalization state
	 * @returns {this} The FilterPanel instance
	 */

	FilterPanel.prototype.PRESENCE_ATTRIBUTE = "active";

	FilterPanel.prototype._createInnerListControl = function() {
		const oList = QueryPanel.prototype._createInnerListControl.apply(this, arguments);
		return oList;
	};

	FilterPanel.prototype._createQueryRowGrid = function(oItem) {

		const oRowContent = oItem.name ? this._createRowContainer(oItem.label, oItem.key) : this._createKeySelect(oItem.name);

		const aContent = [oRowContent];
		if (oItem.name) {
			const oFilterItem = this._createFactoryControl(oItem);
			aContent.push(oFilterItem);
			this._setLabelForOnBox(oFilterItem, oRowContent);
		}
		return new Grid({
			containerQuery: true,
			defaultSpan: "XL4 L4 M4 S4",
			content: aContent
		}).addStyleClass("sapUiTinyMargin");
	};

	FilterPanel.prototype._getPlaceholderText = function() {
		return this._getResourceText("p13n.FILTER_PLACEHOLDER");
	};

	FilterPanel.prototype._getRemoveButtonTooltipText = function() {
		return this._getResourceText("p13n.FILTER_REMOVEICONTOOLTIP");
	};

	FilterPanel.prototype._getRemoveButtonAnnouncementText = function() {
		return this._getResourceText("p13n.FILTER_REMOVEICONANNOUNCE");
	};

	FilterPanel.prototype._createKeySelect = function(sKey) {

		const oComboBox = new ComboBox({
			width: "100%",
			items: this._getAvailableItems(),
			placeholder: this._getPlaceholderText(),
			selectionChange: (oEvt) => {
				const oComboBox = oEvt.getSource();
				this._selectKey(oComboBox);
			},
			change: (oEvt) => {
				const oComboBox = oEvt.getSource();
				const newValue = oEvt.getParameter("newValue");
				oComboBox.setValueState(newValue && !oComboBox.getSelectedItem() ? ValueState.Error : ValueState.None);
				this._selectKey();
			}
		});

		oComboBox.setLayoutData(new GridData({
			span: "XL4 L4 M4 S11"
		}));

		return oComboBox;
	};

	FilterPanel.prototype._createRemoveButton = function(bVisible) {
		const oRemoveBtn = QueryPanel.prototype._createRemoveButton.apply(this, arguments);
		oRemoveBtn.setJustifyContent(FlexJustifyContent.Start); //avoid remove button overlapping with input field
		oRemoveBtn.setLayoutData(new GridData({
			span: "XL1 L1 M1 S1"
		}));
		return oRemoveBtn;
	};

	FilterPanel.prototype._createRowContainer = (sText, sKey) => {
		// var sKey = oSelect._key;
		const oLabel = new Label({
			text: sText,
			showColon: true,
			wrapping: true,
			wrappingType: WrappingType.Hyphenated
		});
		const oFieldBox = new VBox({
			items: [oLabel.addStyleClass("sapUiTinyMarginBegin")]
		});
		oFieldBox._key = sKey;
		return oFieldBox;
	};

	FilterPanel.prototype._setLabelForOnBox = (oFilterItem, oFieldBox) => {
		oFieldBox.getItems()[0].setLabelFor(oFilterItem);
	};

	FilterPanel.prototype._selectKey = function(oComboBox) {
		let oQueryRowGrid, sKey;
		if (oComboBox) {
			this._oComboBox = oComboBox;
			oQueryRowGrid = oComboBox.getParent();
			sKey = oComboBox.getSelectedKey();
		} else if (this._oComboBox) {
			oComboBox = this._oComboBox;
			oQueryRowGrid = oComboBox.getParent();
			sKey = oComboBox.getSelectedKey();
			let oFilterItem;

			if (sKey) {
				QueryPanel.prototype._selectKey.call(this, oComboBox);

				const oSelect = oQueryRowGrid.getContent()[0];
				oQueryRowGrid.removeContent(oSelect);

				const sText = sKey ? oComboBox.getSelectedItem().getText() : "";

				const oFieldBox = this._createRowContainer(sText, sKey); //Create a container with a VBox and a label with some padding inside and insert it in the grid
				oQueryRowGrid.insertContent(oFieldBox, 0);

				oFilterItem = this._createFactoryControl({
					name: sKey
				}); //Create the actual filterable control and insert it in the grid
				this._setLabelForOnBox(oFilterItem, oFieldBox);

				oQueryRowGrid.insertContent(oFilterItem, 1);

			}

			//FIXME: Check why this workaround is necessary
			setTimeout(() => {
				if (this._oListControl && !this._oListControl.bIsDestroyed) {
					this._oListControl.setKeyboardMode(ListKeyboardMode.Edit);
				}

                                // Note: the control in mdc is wrapped in a filter group layout, hence it needs to be checked if the item is in mdc context to
                                // properly set the focus. In comp and freestyle, the item itself is the filterable control
				const oControlForFocus = oFilterItem?.getMetadata().getName().includes("sap.ui.mdc") ? oFilterItem.getItems()?.[0] : oFilterItem;
				oControlForFocus?.focus();
			}, 20);

			delete this._oComboBox;
		}
	};

	/**
	 * @private
	 * Retrieve the factory control for a current row
	 * @param {sap.m.CustomListItem} oRow The list item
	 * @returns {sap.ui.core.Control} The factory control of the provided row
	 */
	FilterPanel.prototype._getFactoryControlForRow = (oRow) => {
		return oRow.getContent()[0].getContent()[1];
	};

	FilterPanel.prototype._createFactoryControl = function(oItem) {
		const oField = this.getItemFactory().call(this, oItem);
		oField.setLayoutData(new GridData({
			span: "XL7 L7 M7 S7"
		}));

		let iModelIndex;
		this._getP13nModel().getProperty("/items").forEach((oP13nItem, index) => {
			if (oP13nItem.key == oItem.name) {
				iModelIndex = index;
			}
		});
		const oBindingContext = this._getP13nModel().createBindingContext(`/items/${iModelIndex}/`);
		oField.setBindingContext(oBindingContext, this.P13N_MODEL);

		return oField;
	};

	FilterPanel.prototype._updatePresence = function(sKey, bAdd, iNewIndex) {
		QueryPanel.prototype._updatePresence.apply(this, arguments);

		if (!bAdd) {
			const oRelevant = this._getP13nModel().getProperty("/items").find((oItem) => {
				return oItem.name === sKey;
			});
			oRelevant.conditions = [{
				operator: "Contains",
				conditions: []
			}];
		}
	};

	return FilterPanel;
});