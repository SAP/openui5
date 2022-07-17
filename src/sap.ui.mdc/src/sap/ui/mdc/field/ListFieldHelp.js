/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/field/FieldHelpBase',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/mdc/library'
], function(
		FieldHelpBase,
		Condition,
		ConditionValidated,
		FormatException,
		ParseException,
		ManagedObjectModel,
		ManagedObjectObserver,
		library) {
	"use strict";

	var List;
	var DisplayListItem;
	var mLibrary;
	var Filter;
	var Sorter;

	/**
	 * Constructor for a new <code>ListFieldHelp</code>.
	 *
	 * This field help supports only single selection.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class A field help used in the <code>FieldHelp</code> association of controls based on {@link sap.ui.mdc.field.FieldBase FieldBase} that shows a list of items.
	 * @extends sap.ui.mdc.field.FieldHelpBase
	 * @version ${version}
	 * @constructor
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.54.0
	 * @alias sap.ui.mdc.field.ListFieldHelp
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ListFieldHelp = FieldHelpBase.extend("sap.ui.mdc.field.ListFieldHelp", /** @lends sap.ui.mdc.field.ListFieldHelp.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * If set, the items of the list are filtered based on <code>filterValue</code>.
				 *
				 * If a type-ahead behavior for the connected field is wanted, this property must be set to <code>true</code>.
				 * For small lists all values are meant to be shown, independent of the typing in the connected field.
				 * In this case this property must be set to <code>false</code>.
				 *
				 * If not set, the list opens if the user clicks into the connected field.
				 *
				 * @since 1.81.0
				 */
				filterList: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},

				/**
				 * If set, <code>getKeyForText</code> returns the first item that matches the text.
				 *
				 * This is the case if the text of the item starts with the text entered.
				 *
				 * @since 1.81.0
				 */
				useFirstMatch: { // TODO: put into FieldHelpBase and implement for all FieldHelps
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				}
			},
			aggregations: {
				/**
				 * Items of the field help.
				 *
				 * The <code>key</code> of the items is not shown in the list, but is used as a value of the connected field.
				 *
				 * If the <code>additionalText</code> for all the items is not used, the column will not be displayed.
				 *
				 * <b>Note:</b> At the moment, icons are not supported.
				 *
				 * <b>Note:</b> If {@link sap.ui.mdc.field.ListFieldHelpItem ListFieldHelpItem} elements are used as items, the items are grouped and sorted
				 * by the value provided in the <code>groupKey</code> property of the item.
				 * The value provided in the <code>groupText</code> property will be shown as group header.
				 */
				items: {
					type: "sap.ui.core.ListItem",
					multiple: true,
					singularName : "item"
				}
			},
			defaultAggregation: "items"
		}
	});

	// private function to initialize globals for qUnit tests
	ListFieldHelp._init = function() {

		FieldHelpBase._init.apply(this, arguments);

		List = undefined;
		DisplayListItem = undefined;
		mLibrary = undefined;
		Filter = undefined;

	};

	ListFieldHelp.prototype.init = function() {

		FieldHelpBase.prototype.init.apply(this, arguments);

		this._oManagedObjectModel = new ManagedObjectModel(this);

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["filterValue", "conditions"],
			aggregations: ["items"],
			bindings: ["items"]
		});

		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	};

	ListFieldHelp.prototype.exit = function() {

		FieldHelpBase.prototype.exit.apply(this, arguments);

		this._oManagedObjectModel.destroy();
		delete this._oManagedObjectModel;

		this._oObserver.disconnect();
		this._oObserver = undefined;

		if (this._iDataUpdateTimer) {
			clearTimeout(this._iDataUpdateTimer);
			this._iDataUpdateTimer = null;
		}

	};

	ListFieldHelp.prototype._createPopover = function() {

		var oPopover = FieldHelpBase.prototype._createPopover.apply(this, arguments);

		if ((!List || !DisplayListItem || !mLibrary) && !this._bListRequested) {
			List = sap.ui.require("sap/m/List");
			DisplayListItem = sap.ui.require("sap/m/DisplayListItem");
			mLibrary = sap.ui.require("sap/m/library");
			Filter = sap.ui.require("sap/ui/model/Filter");
			Sorter = sap.ui.require("sap/ui/model/Sorter");
			if (!List || !DisplayListItem || !mLibrary) {
				sap.ui.require(["sap/m/List", "sap/m/DisplayListItem", "sap/m/library", "sap/ui/model/Filter", "sap/ui/model/Sorter"], _ListLoaded.bind(this));
				this._bListRequested = true;
			}
		}

		if (oPopover) { // empty if loaded async
			_createList.call(this);
		}

		return oPopover;

	};

	function _createList() {

		if (!this._oList && List && DisplayListItem && mLibrary && !this._bListRequested) {
			var oBindingInfo = this.getBindingInfo("items");

			this._oList = new List(this.getId() + "-List", {
				width: "100%",
				showNoData: false,
				mode: mLibrary.ListMode.SingleSelectMaster,
				rememberSelections: false,
				itemPress: _handleItemPress.bind(this) // as selected item can be pressed
			}).addStyleClass("sapMComboBoxBaseList").addStyleClass("sapMComboBoxList");

			this._oList.setModel(this._oManagedObjectModel, "$field");
			this._oList.bindElement({ path: "/", model: "$field" });
			_bindList.call(this, oBindingInfo);

			this._setContent(this._oList);

			if (this._bNavigate) {
				this._bNavigate = false;
				this.navigate(this._iStep);
				this._iStep = null;
			}
		}

	}

	function _bindList(oBindingInfo) {

		if (this._oList) {
			this._oList.unbindAggregation("items"); // unbind first to destroy old template and items.

			var oItemTemplate = new DisplayListItem(this.getId() + "-item", {
				type: mLibrary.ListType.Active,
				label: "{$field>text}",
				value: "{$field>additionalText}",
				valueTextDirection: "{$field>textDirection}"
			}).addStyleClass("sapMComboBoxNonInteractiveItem"); // to add focus outline to selected items

			var oFilter = new Filter("text", _suggestFilter.bind(this));

			// add sorter only if supported
			var bUseSorter = false;
			if (oBindingInfo && oBindingInfo.template && oBindingInfo.template.isA("sap.ui.mdc.field.ListFieldHelpItem")) {
				bUseSorter = true;
			} else {
				var aItems = this.getItems();
				if (aItems.length > 0 && aItems[0].isA("sap.ui.mdc.field.ListFieldHelpItem")) {
					bUseSorter = true;
				}
			}

			var oSorter = bUseSorter && new Sorter("groupKey", false, _suggestGrouping.bind(this));

			this._oList.bindAggregation("items", {path: "$field>items", template: oItemTemplate, filters: oFilter, sorter: oSorter, templateShareable: false});

			_updateSelection.call(this);
		}

	}

	function _ListLoaded(fnList, fnDisplayListItem, fnLibrary, fnFilter, fnSorter) {

		List = fnList;
		DisplayListItem = fnDisplayListItem;
		mLibrary = fnLibrary;
		Filter = fnFilter;
		Sorter = fnSorter;
		this._bListRequested = false;

		if (!this._bIsBeingDestroyed) {
			_createList.call(this);
		}

	}

	ListFieldHelp.prototype.open = function(bSuggestion) {

		FieldHelpBase.prototype.open.apply(this, arguments);

		var oPopover = this._getPopover();
		var oControl = this._getControlForSuggestion();
		if (oPopover && oControl) {
			// make popver not smaller than Field
			var sWidth = (oControl.$().outerWidth() / parseFloat(mLibrary.BaseFontSize)) + "rem"; // same logic as in ComboBox
			oPopover.setContentMinWidth(sWidth);
		}

	};

	ListFieldHelp.prototype._handleAfterClose = function(oEvent) {

		if (this._bUpdateFilterAfterClose) {
			this._bUpdateFilterAfterClose = false;
			_updateFilter.call(this);
		}
		this._oList.removeStyleClass("sapMListFocus");

		FieldHelpBase.prototype._handleAfterClose.apply(this, arguments);

	};

	function _observeChanges(oChanges) {

		if (oChanges.object === this) {
			// it's the FieldHelp
			if (oChanges.name === "items") {
				if (oChanges.type === "binding") {
					if (oChanges.mutation === "prepare") {
						_bindList.call(this, oChanges.bindingInfo);
					}
				} else {
					if (oChanges.mutation === "insert") {
						this._oObserver.observe(oChanges.child, {properties: true});
					} else {
						this._oObserver.unobserve(oChanges.child);
					}
					_fireDataUpdate.call(this);
				}
			}

			if (oChanges.name === "conditions") {
				if (!this._bConditionUpdate) {
					_updateSelection.call(this);
				}
			}

			if (oChanges.name === "filterValue") {
				if (this._oList) {
					if (this._bClosing) {
						this._bUpdateFilterAfterClose = true;
					} else {
						_updateFilter.call(this);
					}
				}
			}
		} else {
			// must be an item
			_fireDataUpdate.call(this);
		}

	}

	function _fireDataUpdate() {

		if (!this._iDataUpdateTimer) {
			this._iDataUpdateTimer = setTimeout(function () {
				// on multiple changes (dummy row, static text...) perform only one update
				this._iDataUpdateTimer = null;
				this.fireDataUpdate();
			}.bind(this), 0);
		}

	}

	ListFieldHelp.prototype.openByTyping = function() {

		return true;

	};

	ListFieldHelp.prototype.openByClick = function() {

		return !this.getFilterList();

	};

	ListFieldHelp.prototype.getValueHelpEnabled = function() {

		return false;

	};

	ListFieldHelp.prototype.removeFocus = function() {

		if (this._oList) {
			this._oList.removeStyleClass("sapMListFocus");
		}

	};

	ListFieldHelp.prototype.navigate = function(iStep) {

		var oPopover = this._getPopover();

		if (!oPopover || !this._oList) {
			// Popover or List not loaded right now
			this._bNavigate = true;
			this._iStep = iStep;
			return;
		}

		this._oList.addStyleClass("sapMListFocus"); // to show focus outline on navigated item
		var oSelectedItem = this._oList.getSelectedItem();
		var aItems = this._oList.getItems();
		var iItems = aItems.length;
		var iSelectedIndex = 0;
		var bFilterList = this.getFilterList();
		var sFilterValue = this.getFilterValue();
		var bLeaveFocus = false;

		if (!bFilterList && !oSelectedItem) {
			// try to find item that matches Filter
			var i = 0;
			if (iStep >= 0) {
				for (i = 0; i < aItems.length; i++) {
					if (aItems[i].getLabel && _filterText.call(this, aItems[i].getLabel(), sFilterValue)) {
						iSelectedIndex = i;
						break;
					}
				}
			} else {
				for (i = aItems.length - 1; i >= 0; i--) {
					if (aItems[i].getLabel && _filterText.call(this, aItems[i].getLabel(), sFilterValue)) {
						iSelectedIndex = i;
						break;
					}
				}
			}
		} else if (oSelectedItem) {
			iSelectedIndex = this._oList.indexOfItem(oSelectedItem);
			iSelectedIndex = iSelectedIndex + iStep;
		} else if (iStep >= 0){
			iSelectedIndex = iStep - 1;
		} else {
			iSelectedIndex = iItems + iStep;
		}

		var bSeachForNext;
		if (iSelectedIndex < 0) {
			iSelectedIndex = 0;
			bSeachForNext = true;
			bLeaveFocus = true;
		} else if (iSelectedIndex >= iItems - 1) {
			iSelectedIndex = iItems - 1;
			bSeachForNext = false;
		} else {
			bSeachForNext = iStep >= 0;
		}

		while (aItems[iSelectedIndex] && aItems[iSelectedIndex].isA("sap.m.GroupHeaderListItem")) { // ignore group headers
			if (bSeachForNext) {
				iSelectedIndex++;
			} else {
				iSelectedIndex--;
			}
		}

		var oItem = aItems[iSelectedIndex];
		if (oItem) {
			if (oItem !== oSelectedItem) {
				var oOriginalItem = _getOriginalItem.call(this, oItem);
				var vKey = _getKey.call(this, oOriginalItem);
				oItem.setSelected(true);
				var oCondition = _setConditions.call(this, vKey, oItem.getLabel());

				if (!oPopover.isOpen()) {
					this.open();
				}

				this._oList.scrollToIndex(iSelectedIndex);

				this.fireNavigate({key: vKey, value: oItem.getLabel(), condition: oCondition, itemId: oItem.getId(), leaveFocus: false});
			} else if (bLeaveFocus) {
				this.fireNavigate({key: undefined, value: undefined, condition: undefined, itemId: undefined, leaveFocus: bLeaveFocus});
			}
		}

	};

	ListFieldHelp.prototype._getTextOrKey = function(vValue, bKey, oBindingContext, oInParameters, oOutParameters, bNoRequest, oConditionModel, sConditionModelName, vParsedValue, bKeyAndDescription) {

		if (vValue === null || vValue === undefined) {
			return null;
		} else if (!vValue && !bKey) {
			return null;
		}

		var aItems = this.getItems();
		var oItem;
		var i = 0;

		for (i = 0; i < aItems.length; i++) {
			oItem = aItems[i];
			if (bKeyAndDescription) {
				if (_getKey.call(this, oItem) === vParsedValue || oItem.getText() === vValue) {
					return {key: _getKey.call(this, oItem), description: oItem.getText()};
				}
			} else if (bKey) {
				if (_getKey.call(this, oItem) === vValue) {
					return oItem.getText();
				}
			} else if (oItem.getText() === vValue) {
				return _getKey.call(this, oItem);
			}
		}

		if (bKey && vValue === "") {
			// empty key and no item with empty key
			return null;
		}

		if ((!bKey || bKeyAndDescription) && this.getUseFirstMatch()) {
			for (i = 0; i < aItems.length; i++) {
				oItem = aItems[i];
				var sText = oItem.getText();
				if (_filterText.call(this, sText, vValue)) {
					return {key: _getKey.call(this, oItem), description: sText};
				}
			}
		}

		var sError = this._oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", [vValue]);
		if (bKey && !bKeyAndDescription) {
			throw new FormatException(sError);
		} else {
			throw new ParseException(sError);

		}

	};

	function _handleItemPress(oEvent) {
		var oItem = oEvent.getParameter("listItem");
		var bSelected = oItem.getSelected();

		if (bSelected) {
			var oOriginalItem = _getOriginalItem.call(this, oItem);
			var vKey = _getKey.call(this, oOriginalItem);
			_setConditions.call(this, vKey, oItem.getLabel());
			this.close();
			this.fireSelect({conditions: this.getConditions(), add: true, close: true});
		}
	}

	// returns ListFieldHelp item for inner list item
	function _getOriginalItem(oItem) {

		var sPath = oItem.getBindingContextPath();
		return this._oManagedObjectModel.getProperty(sPath);

	}

	function _updateFilter() {

		var oBinding = this._oList.getBinding("items");
		oBinding.update();
		this._oList.updateItems();
		this._oList.invalidate();
		_updateSelection.call(this); // to update selection

	}

	function _suggestFilter(sText) {

		var bFilterList = this.getFilterList();

		return !bFilterList || _filterText.call(this, sText, this.getFilterValue());

	}

	function _filterText(sText, sFilterValue) {

		return !sFilterValue || (typeof sFilterValue === "string" && sText.toLowerCase().startsWith(sFilterValue.toLowerCase()));

	}

	function _suggestGrouping(oContext) {

		var vKey = oContext.getProperty('groupKey');
		var sText = oContext.getProperty('groupText');
		return {key: vKey, text: sText};

	}

	function _updateSelection() {

		if (this._oList) {
			var aConditions = this.getConditions();
			var vSelectedKey;
			var sFilterValue = this.getFilterValue();
			var bUseFirstMatch = this.getUseFirstMatch();
			var bFistFilterItemSelected = false;
			var oOperator = this._getOperator();

			if (aConditions.length > 0 && (aConditions[0].validated === ConditionValidated.Validated || aConditions[0].operator === oOperator.name)) {
				vSelectedKey = aConditions[0].values[0];
			}

			var aItems = this._oList.getItems();
			for (var i = 0; i < aItems.length; i++) {
				var oItem = aItems[i];
				if (oItem.isA("sap.m.DisplayListItem")) { // not for group headers
					var oOriginalItem = _getOriginalItem.call(this, oItem);
					if (aConditions.length > 0 && _getKey.call(this, oOriginalItem) === vSelectedKey) {
						// conditions given -> use them to show selected items
						oItem.setSelected(true);
					} else if (aConditions.length === 0 && bUseFirstMatch && sFilterValue && !bFistFilterItemSelected && _filterText.call(this, oItem.getLabel(), sFilterValue)) {
						// filter value used -> show first match as selected
						oItem.setSelected(true);
						bFistFilterItemSelected = true;
					} else {
						oItem.setSelected(false);
					}
				}
			}
		}

	}

	function _getKey(oItem) {

		// as key could have internally another type - use initial value of binding
		// TODO: better logic?
		var oBinding = oItem.getBinding("key");
		if (oBinding) {
			return oBinding.getInternalValue();
		} else {
			return oItem.getKey();
		}

	}

	function _setConditions(vKey, sValue) {

		this._bConditionUpdate = true;

		var oCondition = this._createCondition(vKey, sValue);
		this.setProperty("conditions", [oCondition], true);

		this._bConditionUpdate = false;

		return oCondition;

	}

	return ListFieldHelp;

});
