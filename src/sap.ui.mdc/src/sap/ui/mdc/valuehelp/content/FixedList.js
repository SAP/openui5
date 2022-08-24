/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/valuehelp/base/ListContent",
	"sap/ui/mdc/util/loadModules",
	"sap/ui/mdc/enum/ConditionValidated",
	"sap/ui/mdc/enum/SelectType",
	"sap/ui/model/ParseException"
], function(
	ListContent,
	loadModules,
	ConditionValidated,
	SelectType,
	ParseException
) {
	"use strict";

	/**
	 * Constructor for a new <code>FixedList</code> content.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Content for the {@link sap.ui.mdc.valuehelp.base.Container Container} element showing a list with fix values.
	 * @extends sap.ui.mdc.valuehelp.base.ListContent
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.95.0
	 * @experimental As of version 1.95
	 * @alias sap.ui.mdc.valuehelp.content.FixedList
	 */
	var FixedList = ListContent.extend("sap.ui.mdc.valuehelp.content.FixedList", /** @lends sap.ui.mdc.valuehelp.content.FixedList.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.valuehelp.ITypeaheadContent",
				"sap.ui.mdc.valuehelp.IDialogContent"
			],
			properties: {
				/**
				 * If set, the items of the list can be grouped
				 */
				 groupable: {
					type: "boolean",
					group: "Appearance",
					defaultValue : false
				},
				/**
				 * If set, the items of the list are filtered based on <code>filterValue</code>.
				 *
				 * If a type-ahead behavior for the connected field is wanted, this property must be set to <code>true</code>.
				 * For small lists all values are meant to be shown, independent of the typing in the connected field.
				 * In this case this property must be set to <code>false</code>.
				 *
				 * If not set, the list opens if the user clicks into the connected field.
				 */
				filterList: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
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
				 */
				items: {
					type: "sap.ui.mdc.field.ListFieldHelpItem",
					multiple: true,
					singularName : "item"
				}
			},
			defaultAggregation: "items",
			events: {

			}
		}
	});

	FixedList.prototype.init = function() {

		ListContent.prototype.init.apply(this, arguments);

		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	};

	FixedList.prototype.exit = function() {

		if (this._oManagedObjectModel) {
			this._oManagedObjectModel.destroy();
			delete this._oManagedObjectModel;
		}

		ListContent.prototype.exit.apply(this, arguments);
	};

	FixedList.prototype.getContent = function () {
		return this._retrievePromise("content", function () {
			return loadModules([
				"sap/m/List",
				"sap/m/DisplayListItem",
				"sap/m/library",
				"sap/ui/model/Filter",
				"sap/ui/model/Sorter",
				"sap/ui/model/base/ManagedObjectModel",
				"sap/base/strings/whitespaceReplacer"
			]).then(function (aModules) {
					var List = aModules[0];
					var DisplayListItem = aModules[1];
					var mLibrary = aModules[2];
					var Filter = aModules[3];
					var Sorter = aModules[4];
					var ManagedObjectModel = aModules[5];
					var whitespaceReplacer = aModules[6];

					this._oManagedObjectModel = new ManagedObjectModel(this);

					var oItemTemplate = new DisplayListItem(this.getId() + "-item", {
						type: mLibrary.ListType.Active,
						label: {path: "$help>text", formatter: whitespaceReplacer},
						value: {path: "$help>additionalText", formatter: whitespaceReplacer},
						valueTextDirection: "{$help>textDirection}"
					}).addStyleClass("sapMComboBoxNonInteractiveItem"); // to add focus outline to selected items

					var oFilter = new Filter({path: "text", test: _suggestFilter.bind(this), caseSensitive: true}); // caseSensitive at it is checked in filter-function

					// add sorter only if supported
					var oSorter;
					if (this.getGroupable()) {
						oSorter = new Sorter("groupKey", false, _suggestGrouping.bind(this));
					}

					var oList = new List(this.getId() + "-List", {
						width: "100%",
						showNoData: false,
						mode: mLibrary.ListMode.SingleSelectMaster,
						rememberSelections: false,
						items: {path: "$help>/items", template: oItemTemplate, filters: oFilter, sorter: oSorter, templateShareable: false},
						itemPress: _handleItemPress.bind(this) // as selected item can be pressed
					}).addStyleClass("sapMComboBoxBaseList").addStyleClass("sapMComboBoxList");

					oList.setModel(this._oManagedObjectModel, "$help");
//					oList.bindElement({ path: "/", model: "$help" });
					this.setAggregation("displayContent", oList, true); // to have in control tree

					return oList;
				}.bind(this));
		}.bind(this));
	};

	function _getList() {

		return this.getAggregation("displayContent");

	}

	function _handleItemPress(oEvent) {

		var oItem = oEvent.getParameter("listItem");
		var bSelected = oItem.getSelected();

		if (bSelected) {
			var oOriginalItem = _getOriginalItem.call(this, oItem);
			var vKey = _getKey.call(this, oOriginalItem);
//			this.fireRemoveConditions({conditions: this.getConditions()});
			_setConditions.call(this, vKey, oItem.getLabel());
//			this.fireAddConditions({conditions: this.getConditions()});
			this.fireSelect({type: SelectType.Set, conditions: this.getConditions()});
			this.fireConfirm();
		}

	}

	function _setConditions(vKey, sValue) {

		var oCondition = this._createCondition(vKey, sValue);
		this.setProperty("conditions", [oCondition], true);

		return oCondition;

	}

	function _suggestFilter(sText) {

		var bFilterList = this.getFilterList();

		return !bFilterList || _filterText.call(this, sText, this.getFilterValue());

	}

	function _filterText(sText, sFilterValue) {

		return !sFilterValue || (typeof sFilterValue === "string" && (this.getCaseSensitive() ? sText.startsWith(sFilterValue) : sText.toLowerCase().startsWith(sFilterValue.toLowerCase())));

	}

	function _updateFilter() {

		var oList = _getList.call(this);
		if (oList) {
			var oBinding = oList.getBinding("items");
			oBinding.update();
			oList.updateItems();
			oList.invalidate();
			_updateSelection.call(this); // to update selection
		}

	}

	function _suggestGrouping(oContext) {

		var vKey = oContext.getProperty('groupKey');
		var sText = oContext.getProperty('groupText');
		return {key: vKey, text: sText};

	}

	function _updateSelection() {

		var oList = _getList.call(this);
		if (oList) {
			var aConditions = this.getConditions();
			var vSelectedKey;
			var sFilterValue = this.getFilterValue();
			var bUseFirstMatch = this.getUseFirstMatch();
			var bFistFilterItemSelected = false;
//			var oOperator = this._getOperator();

			if (aConditions.length > 0 && (aConditions[0].validated === ConditionValidated.Validated || aConditions[0].operator === "EQ"/*oOperator.name*/)) {
				vSelectedKey = aConditions[0].values[0];
			}

			var aItems = oList.getItems();
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
					} else if (this.hasOwnProperty("_iNavigateIndex") && i === this._iNavigateIndex) { // TODO: better solution
						// let navigated item be selected
						oItem.setSelected(true);
					} else {
						oItem.setSelected(false);
					}
				}
			}
		}
	}

	// returns ListFieldHelp item for inner list item
	function _getOriginalItem(oItem) {

		var sPath = oItem.getBindingContextPath();
		return this._oManagedObjectModel.getProperty(sPath);

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

	FixedList.prototype.getItemForValue = function (oConfig) {

		return Promise.resolve().then(function() {
			if (oConfig.value === null || oConfig.value === undefined) {
				return null;
			} else if (!oConfig.value && oConfig.checkDescription) {
				return null; // no check for empty description
			}

			var aItems = this.getItems();
			var oItem;
			var i = 0;
			var vKey;
			var sText;

			for (i = 0; i < aItems.length; i++) {
				oItem = aItems[i];
				vKey = _getKey.call(this, oItem);
				sText = oItem.getText();
				if ((oConfig.checkKey && vKey === oConfig.parsedValue) || (oConfig.checkDescription && (sText === oConfig.value || vKey == oConfig.value))) {
					return {key: vKey, description: oItem.getText()};
				}
			}

			if (oConfig.checkKey && oConfig.value === "") {
				// empty key and no item with empty key
				return null;
			}

			if (this.getUseFirstMatch()) {
				for (i = 0; i < aItems.length; i++) {
					oItem = aItems[i];
					sText = oConfig.checkDescription ? oItem.getText() : oItem.getKey(); // don't use oConfig.checkKey as entered value non't neet to be a valid (complete) key
					if (_filterText.call(this, sText, oConfig.value)) {
						vKey = _getKey.call(this, oItem);
						return {key: vKey, description: oItem.getText()};
					}
				}
			}

			var sError = this._oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", [oConfig.value]);
			var Exception = oConfig.exception || ParseException;
			throw new Exception(sError);

		}.bind(this));

	};

	FixedList.prototype.isValidationSupported = function(oConfig) {
		return true;
	};

	FixedList.prototype.isSearchSupported = function () {
		return true;
	};

	FixedList.prototype._handleConditionsUpdate = function(oChanges) {
		_updateSelection.call(this);
	};

	FixedList.prototype._handleFilterValueUpdate = function(oChanges) {
		_updateFilter.call(this);
	};

	FixedList.prototype.removeFocus = function() {

		var oList = _getList.call(this);
		if (oList) {
			oList.removeStyleClass("sapMListFocus");
		}

	};

	FixedList.prototype.navigate = function(iStep) {

		var oList = _getList.call(this);

		if (!oList) {
			return; // TODO: should not happen? Create List?
		}

		oList.addStyleClass("sapMListFocus"); // to show focus outline on navigated item

		var oSelectedItem = oList.getSelectedItem();
		var aItems = oList.getItems();
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
					if (!aItems[i].isA("sap.m.GroupHeaderListItem") && _filterText.call(this, aItems[i].getLabel(), sFilterValue)) {
						iSelectedIndex = i;
						break;
					}
				}
			} else {
				for (i = aItems.length - 1; i >= 0; i--) {
					if (!aItems[i].isA("sap.m.GroupHeaderListItem") && _filterText.call(this, aItems[i].getLabel(), sFilterValue)) {
						iSelectedIndex = i;
						break;
					}
				}
			}
		} else if (oSelectedItem) {
			iSelectedIndex = oList.indexOfItem(oSelectedItem);
			iSelectedIndex = iSelectedIndex + iStep;
		} else if (iStep >= 0){
			iSelectedIndex = iStep - 1;
		} else {
			iSelectedIndex = iItems + iStep;
		}

		var bSearchForNext;
		if (iSelectedIndex < 0) {
			iSelectedIndex = 0;
			bSearchForNext = true;
			bLeaveFocus = true;
		} else if (iSelectedIndex >= iItems - 1) {
			iSelectedIndex = iItems - 1;
			bSearchForNext = false;
		} else {
			bSearchForNext = iStep >= 0;
		}

		while (aItems[iSelectedIndex] && aItems[iSelectedIndex].isA("sap.m.GroupHeaderListItem")) { // ignore group headers
			if (bSearchForNext) {
				iSelectedIndex++;
			} else {
				iSelectedIndex--;
			}
		}
		if (iSelectedIndex < 0 || iSelectedIndex > iItems - 1) {
			// find last not groupable item
			bSearchForNext = !bSearchForNext;
			bLeaveFocus = iSelectedIndex < 0;
			iSelectedIndex = iSelectedIndex < 0 ? 0 : iItems - 1;
			while (aItems[iSelectedIndex] && aItems[iSelectedIndex].isA("sap.m.GroupHeaderListItem")) { // ignore group headers
				if (bSearchForNext) {
					iSelectedIndex++;
				} else {
					iSelectedIndex--;
				}
			}
		}

		var oItem = aItems[iSelectedIndex];
		if (oItem) {
			var bUseFirstMatch = this.getUseFirstMatch(); // if item for first match is selected, navigate to it needs to fire the event
			if (oItem !== oSelectedItem || (bUseFirstMatch && !bLeaveFocus)) {
				var oOriginalItem = _getOriginalItem.call(this, oItem);
				var vKey = _getKey.call(this, oOriginalItem);
				var sDescription = oOriginalItem.getText();

				if (this.getParent().isOpen()) {
					oList.scrollToIndex(iSelectedIndex); // only possible if open
				} else {
					this._iNavigateIndex = iSelectedIndex; // TODO: better solution
				}

				// in case of a single value field trigger the focusin on the new selected item to update the screenreader invisible text
				if (this.getParent().isOpen()) {
					oItem.$().trigger("focusin");
				}

				oItem.setSelected(true);
				var oCondition = _setConditions.call(this, vKey, sDescription);
				this.fireNavigated({condition: oCondition, itemId: oItem.getId(), leaveFocus: false});
			} else if (bLeaveFocus) {
				this.fireNavigated({condition: undefined, itemId: undefined, leaveFocus: bLeaveFocus});
			}
		}

	};

	FixedList.prototype.onShow = function () { // TODO: name

		ListContent.prototype.onShow.apply(this, arguments);

		// scroll to selected item
		var oList = _getList.call(this);

		if (!oList) {
			return; // TODO: should not happen? Create List?
		}

		var oSelectedItem = oList.getSelectedItem();
		if (oSelectedItem) {
			var iSelectedIndex = oList.indexOfItem(oSelectedItem);
			oList.scrollToIndex(iSelectedIndex);
		}

		if (this.hasOwnProperty("_iNavigateIndex")) { // initialize after opening
			delete this._iNavigateIndex;
		}
	};

	FixedList.prototype.onHide = function () {

		this.removeFocus();

	};

	FixedList.prototype.getValueHelpIcon = function() {

		if (this.getUseAsValueHelp()) {
			return "sap-icon://slim-arrow-down";
		} else {
			return null;
		}

	};

	FixedList.prototype.getAriaAttributes = function(iMaxConditions) {

		return { // return default values, but needs to be implemented by specific content
			contentId: this.getId() + "-List", // as list might be created async, use fix ID
			ariaHasPopup: "listbox",
			roleDescription: null // no multi-selection
		};

	};

	FixedList.prototype.shouldOpenOnClick = function() {

		return !this.getFilterList(); // TODO: own property, maybe general at content?

	};

	FixedList.prototype.isFocusInHelp = function() {

		return false; // focus should stay in field, even if opened as valueHelp

	};

	FixedList.prototype._isSingleSelect = function (oEvent) {

		return true;

	};

	FixedList.prototype.shouldOpenOnNavigate = function() {

		return !ListContent.prototype._isSingleSelect.apply(this);

	};

	return FixedList;
});
