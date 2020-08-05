/*
 * ! ${copyright}
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

	/**
	 * Constructor for a new <code>ListFieldHelp</code>.
	 *
	 * This field help supports only single selection.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class A field help used in the <code>FieldHelp</code> association in <code>FieldBase</code> controls that shows a list of items.
	 * @extends sap.ui.mdc.field.FieldHelpBase
	 * @version ${version}
	 * @constructor
	 * @private
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
			aggregations: ["items"]
		});

		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	};

	ListFieldHelp.prototype.exit = function() {

		FieldHelpBase.prototype.exit.apply(this, arguments);

		this._oManagedObjectModel.destroy();
		delete this._oManagedObjectModel;

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

	ListFieldHelp.prototype._createPopover = function() {

		var oPopover = FieldHelpBase.prototype._createPopover.apply(this, arguments);

		if ((!List || !DisplayListItem || !mLibrary) && !this._bListRequested) {
			List = sap.ui.require("sap/m/List");
			DisplayListItem = sap.ui.require("sap/m/DisplayListItem");
			mLibrary = sap.ui.require("sap/m/library");
			Filter = sap.ui.require("sap/ui/model/Filter");
			if (!List || !DisplayListItem || !mLibrary) {
				sap.ui.require(["sap/m/List", "sap/m/DisplayListItem", "sap/m/library", "sap/ui/model/Filter"], _ListLoaded.bind(this));
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
			var oItemTemplate = new DisplayListItem(this.getId() + "-item", {
				type: mLibrary.ListType.Active,
				label: "{$field>text}",
				value: "{$field>additionalText}"
			});

			var oFilter = new Filter("text", _suggestFilter.bind(this));

			this._oList = new List(this.getId() + "-List", {
				width: "100%",
				showNoData: false,
				mode: mLibrary.ListMode.SingleSelectMaster,
				rememberSelections: false,
				items: {path: "$field>items", template: oItemTemplate, filters: oFilter},
				itemPress: _handleItemPress.bind(this) // as selected item can be pressed
			});

			this._oList.setModel(this._oManagedObjectModel, "$field");
			this._oList.bindElement({ path: "/", model: "$field" });
			_updateSelection.call(this);

			this._setContent(this._oList);

			if (this._bNavigate) {
				this._bNavigate = false;
				this.navigate(this._iStep);
				this._iStep = null;
			}
		}

	}

	function _ListLoaded(fnList, fnDisplayListItem, fnLibrary, fnFilter) {

		List = fnList;
		DisplayListItem = fnDisplayListItem;
		mLibrary = fnLibrary;
		Filter = fnFilter;
		this._bListRequested = false;

		if (!this._bIsBeingDestroyed) {
			_createList.call(this);
		}

	}

	ListFieldHelp.prototype.open = function(bSuggestion) {

		return FieldHelpBase.prototype.open.apply(this, arguments);

	};

	ListFieldHelp.prototype._handleAfterClose = function(oEvent) {

		if (this._bUpdateFilterAfterClose) {
			this._bUpdateFilterAfterClose = false;
			_updateFilter.call(this);
		}

		FieldHelpBase.prototype._handleAfterClose.apply(this, arguments);

	};

	function _observeChanges(oChanges) {

		if (oChanges.object === this) {
			// it's the FieldHelp
			if (oChanges.name === "items") {
				if (oChanges.mutation === "insert") {
					this._oObserver.observe(oChanges.child, {properties: true});
				} else {
					this._oObserver.unobserve(oChanges.child);
				}
				this.fireDataUpdate();
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
			this.fireDataUpdate();
		}

	}

	ListFieldHelp.prototype.openByTyping = function() {

		return true;

	};

	ListFieldHelp.prototype.openByClick = function() {

		return !this.getFilterList();

	};

	ListFieldHelp.prototype.navigate = function(iStep) {

		var oPopover = this._getPopover();

		if (!oPopover || !this._oList) {
			// Popover or List not loaded right now
			this._bNavigate = true;
			this._iStep = iStep;
			return;
		}

		var oSelectedItem = this._oList.getSelectedItem();
		var aItems = this._oList.getItems();
		var iItems = aItems.length;
		var iSelectedIndex = 0;
		var bFilterList = this.getFilterList();
		var sFilterValue = this.getFilterValue();

		if (!bFilterList && !oSelectedItem) {
			// try to find item that matches Filter
			var i = 0;
			if (iStep >= 0) {
				for (i = 0; i < aItems.length; i++) {
					if (_filterText.call(this, aItems[i].getLabel(), sFilterValue)) {
						iSelectedIndex = i;
						break;
					}
				}
			} else {
				for (i = aItems.length - 1; i >= 0; i--) {
					if (_filterText.call(this, aItems[i].getLabel(), sFilterValue)) {
						iSelectedIndex = i;
						break;
					}
				}
			}
		} else if (oSelectedItem) {
			iSelectedIndex = this._oList.indexOfItem(oSelectedItem);
			iSelectedIndex = iSelectedIndex + iStep;
			if (iSelectedIndex < 0) {
				iSelectedIndex = 0;
			} else if (iSelectedIndex >= iItems - 1) {
				iSelectedIndex = iItems - 1;
			}
		} else if (iStep >= 0){
			iSelectedIndex = iStep - 1;
		} else {
			iSelectedIndex = iItems + iStep;
		}

		var oItem = aItems[iSelectedIndex];
		if (oItem && oItem !== oSelectedItem) {
			var oOriginalItem = _getOriginalItem.call(this, oItem);
			var vKey = _getKey.call(this, oOriginalItem);
			oItem.setSelected(true);
			var oCondition = _setConditions.call(this, vKey, oItem.getLabel());

			if (!oPopover.isOpen()) {
				this.open();
			}

			this._oList.scrollToIndex(iSelectedIndex);

			this.fireNavigate({key: vKey, value: oItem.getLabel(), condition: oCondition, itemId: oItem.getId()});
		}

	};

	ListFieldHelp.prototype._getTextOrKey = function(vValue, bKey, oBindingContext, oInParameters, oOutParameters, bNoRequest) {

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
			if (bKey) {
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

		if (!bKey && this.getUseFirstMatch()) {
			for (i = 0; i < aItems.length; i++) {
				oItem = aItems[i];
				var sText = oItem.getText();
				if (_filterText.call(this, sText, vValue)) {
					return {key: _getKey.call(this, oItem), description: sText};
				}
			}
		}

		var sError = this._oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", [vValue]);
		if (bKey) {
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

	function _updateSelection() {

		if (this._oList) {
			var aConditions = this.getConditions();
			var vSelectedKey;
			var sFilterValue = this.getFilterValue();
			var bUseFirstMatch = this.getUseFirstMatch();
			var bFistFilterItemSelected = false;

			if (aConditions.length > 0 && (aConditions[0].validated === ConditionValidated.Validated || aConditions[0].operator === "EQ")) {
				vSelectedKey = aConditions[0].values[0];
			}

			var aItems = this._oList.getItems();
			for (var i = 0; i < aItems.length; i++) {
				var oItem = aItems[i];
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

		var oCondition = Condition.createItemCondition(vKey, sValue);
		oCondition.validated = ConditionValidated.Validated; // validated even if no description (e.g. display value mode)
		this.setProperty("conditions", [oCondition], true);

		this._bConditionUpdate = false;

		return oCondition;

	}

	return ListFieldHelp;

});
