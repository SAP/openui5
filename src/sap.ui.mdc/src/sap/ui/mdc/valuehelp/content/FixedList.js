/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/mdc/valuehelp/base/ListContent",
	"sap/ui/mdc/util/loadModules",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/enums/ValueHelpSelectionType",
	"sap/ui/model/ParseException",
	"sap/base/util/deepEqual"
], (
	Library,
	ListContent,
	loadModules,
	ConditionValidated,
	OperatorName,
	ValueHelpSelectionType,
	ParseException,
	deepEqual
) => {
	"use strict";

	let FixedListItem;

	/**
	 * Constructor for a new <code>FixedList</code> content.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Content for the {@link sap.ui.mdc.valuehelp.base.Container Container} element showing a list with fixed values.
	 * @extends sap.ui.mdc.valuehelp.base.ListContent
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.95.0
	 * @alias sap.ui.mdc.valuehelp.content.FixedList
	 */
	const FixedList = ListContent.extend("sap.ui.mdc.valuehelp.content.FixedList", /** @lends sap.ui.mdc.valuehelp.content.FixedList.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.valuehelp.base.ITypeaheadContent", "sap.ui.mdc.valuehelp.base.IDialogContent"
			],
			properties: {
				/**
				 * If set, the items of the list can be grouped
				 */
				groupable: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				},
				/**
				 * If set, the items of the list are filtered based on <code>filterValue</code>.
				 *
				 * If a type-ahead behavior for the connected field is wanted, this property must be set to <code>true</code>.
				 * For small lists, all values are meant to be shown, independent of the typing in the connected field.
				 * In this case this property must be set to <code>false</code>.
				 *
				 * By default, if not set, the list opens if the user clicks into the connected field.
				 */
				filterList: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},
				/**
				 * If set, an item to clear the selection is added.
				 *
				 * This item is only available if the connected field can be cleared.
				 *
				 * @since 1.138
				 */
				emptyText: { // TODO: should this work together with FilterList? (In Select normally there is no filtering)
					type: "string",
					group: "Data",
					defaultValue: ""
				},
				/**
				 * If set, the connected field must not allow other values than the items of the <code>FixedList</code>. Free text must be avoided.
				 *
				 * @since 1.138
				 */
				restrictedToFixedValues: {
					type: "boolean",
					group: "Data",
					defaultValue: false
				}
			},
			aggregations: {
				/**
				 * Items of the value help.
				 *
				 * The <code>key</code> of the items is not shown in the list, but is used as a value of the connected field.
				 *
				 * If the <code>additionalText</code> for all the items is not used, the column will not be displayed.
				 *
				 * <b>Note:</b> Icons are currently not supported.
				 *
				 */
				items: {
					type: "sap.ui.mdc.valuehelp.content.FixedListItem",
					multiple: true,
					singularName: "item"
				},
				/**
				 * Item for empty value (no Conditions)
				 *
				 * @since 1.138
				 */
				_emptyItem: {
					type: "sap.ui.mdc.valuehelp.content.FixedListItem",
					multiple: false,
					visibility: "hidden"
				}
			},
			defaultAggregation: "items",
			events: {

			}
		}
	});

	FixedList.prototype.init = function() {

		ListContent.prototype.init.apply(this, arguments);

		this._oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

		this._iNavigateIndex = -1; // initially nothing is navigated

		this._oObserver.observe(this, {
			properties: ["emptyText"]
		});

	};

	FixedList.prototype.exit = function() {

		if (this._oManagedObjectModel) {
			this._oManagedObjectModel.destroy();
			delete this._oManagedObjectModel;
		}

		ListContent.prototype.exit.apply(this, arguments);
	};

	FixedList.prototype.getContent = function() {
		return this._retrievePromise("content", () => {
			return loadModules([
				"sap/m/List",
				"sap/m/DisplayListItem",
				"sap/m/library",
				"sap/ui/model/Filter",
				"sap/ui/model/Sorter",
				"sap/ui/model/base/ManagedObjectModel",
				"sap/base/strings/whitespaceReplacer",
				"sap/ui/mdc/valuehelp/content/FixedListItem"
			]).then((aModules) => {

				if (this.isDestroyStarted()) {
					return null;
				}

				const [List, DisplayListItem, mLibrary, Filter, Sorter, ManagedObjectModel, whitespaceReplacer, fFixedListItem] = aModules;
				FixedListItem = fFixedListItem; // make global

				this._oManagedObjectModel = new ManagedObjectModel(this);
				this._oManagedObjectModel._getObject = function (sPath, oContext, aNodeStack) {
					const oFixedList = this.getRootObject();
					const oConfig = oFixedList.getConfig();
					const bEmptyAllowed = oConfig.emptyAllowed;

					if (bEmptyAllowed && oFixedList.getEmptyText()) {
						if (oContext?.isA("sap.ui.model.Context")) {
							sPath = this.resolve(sPath, oContext);
						}

						if (sPath?.startsWith("/items")) { // Item list
							const aParts = sPath.split("/");
							const oEmptyItem = oFixedList.getAggregation("_emptyItem");
							const aItems = oFixedList.getItems();
							let oNode = aItems;
							oNode.unshift(oEmptyItem);
							aNodeStack?.push({path: "/", node: this._oObject}); // remember first node
							aNodeStack?.push({path: "items", node: oNode});

							if (aParts.length > 2) { // Item
								const iIndex = Number(aParts[2]);
								oNode = aItems[iIndex];
								aNodeStack?.push({path: aParts[2], node: oNode});

								if (aParts.length > 3) { // Property on Item
									const oProperty = oNode.getMetadata().getManagedProperty(aParts[3]);
									if (oProperty) {
										oNode = oProperty.get(oNode);
										aNodeStack?.push({path: aParts[3], node: oNode});
									}
								}
							}
							return oNode;
						}
					}

					return ManagedObjectModel.prototype._getObject.apply(this, arguments);
				};

				_setEmptyItem.call(this, this.getEmptyText());

				const oItemTemplate = new DisplayListItem(this.getId() + "-item", {
					type: mLibrary.ListType.Active,
					label: { path: "$help>text", formatter: whitespaceReplacer },
					value: { path: "$help>additionalText", formatter: whitespaceReplacer },
					valueTextDirection: "{$help>textDirection}"
				}).addStyleClass("sapMComboBoxNonInteractiveItem"); // to add focus outline to selected items

				const oFilter = new Filter({ path: "text", test: _suggestFilter.bind(this), caseSensitive: true }); // caseSensitive at it is checked in filter-function

				// add sorter only if supported
				let oSorter;
				if (this.getGroupable()) {
					oSorter = new Sorter("groupKey", false, _suggestGrouping.bind(this));
				}

				const oList = new List(this.getId() + "-List", {
					width: "100%",
					showNoData: false,
					mode: mLibrary.ListMode.SingleSelectMaster,
					rememberSelections: false,
					items: { path: "$help>/items", template: oItemTemplate, filters: oFilter, sorter: oSorter, templateShareable: false },
					itemPress: _handleItemPress.bind(this) // as selected item can be pressed
				}).addStyleClass("sapMComboBoxBaseList").addStyleClass("sapMComboBoxList");

				oList.applyAriaRole("listbox"); // needed if List of ComboBox or similar
				oList.setModel(this._oManagedObjectModel, "$help");
				//					oList.bindElement({ path: "/", model: "$help" });
				this.setAggregation("displayContent", oList, true); // to have in control tree
				_updateSelection.call(this);

				return oList;
			});
		});
	};

	FixedList.prototype._handleFirstMatchSuggest = function () {
		const bTypeahead = this.isTypeahead();
		const aItems = _getList.call(this)?.getItems();
		const sFilterValue = this.getFilterValue();
		const bUseFirstMatch = this.getUseFirstMatch();



		if (bTypeahead && bUseFirstMatch && aItems?.length && sFilterValue) {
			const oValueHelpDelegate = this.getValueHelpDelegate();
			const bCaseSensitive = oValueHelpDelegate.isFilteringCaseSensitive(this.getValueHelpInstance(), this);
			const oFirstMatchContext = oValueHelpDelegate.getFirstMatch(this.getValueHelpInstance(), this, {
				value: this.getFilterValue(),
				checkDescription: !!this.getDescriptionPath(),
				control: this.getControl(),
				caseSensitive: bCaseSensitive
			});

			if (oFirstMatchContext) {
				const oListItem = aItems.find((oItem) => oItem.getBindingContext("$help") === oFirstMatchContext);
				const oOriginalItem = _getOriginalItem.call(this, oListItem);
				const oCondition = this.createCondition(_getKey.call(this, oOriginalItem), _getText.call(this, oOriginalItem));
				const aRelevantContexts = this.getListBinding()?.getCurrentContexts();
				const iItems = aRelevantContexts?.length;
				this.fireTypeaheadSuggested({ condition: oCondition, filterValue: sFilterValue, itemId: oListItem?.getId(), items: iItems, caseSensitive: bCaseSensitive });
			}
		}
	};

	function _getList() {

		return this.getAggregation("displayContent");

	}

	function _handleItemPress(oEvent) {

		const oItem = oEvent.getParameter("listItem");
		const bSelected = oItem.getSelected();

		if (bSelected) {
			const oOriginalItem = _getOriginalItem.call(this, oItem);
			const vKey = _getKey.call(this, oOriginalItem);
			const vDescription = _getText.call(this, oOriginalItem);
			//			this.fireRemoveConditions({conditions: this.getConditions()});
			_setConditions.call(this, vKey, vDescription);
			//			this.fireAddConditions({conditions: this.getConditions()});
			this.fireSelect({ type: ValueHelpSelectionType.Set, conditions: this.getConditions() });
			this.fireConfirm();
		}

	}

	function _setConditions(vKey, sValue) {

		const oCondition = vKey === null ? null : this.createCondition(vKey, sValue);
		const aConditions = oCondition ? [oCondition] : [];
		const aOldConditions = this.getConditions();

		if (deepEqual(aConditions, aOldConditions)) {
			_updateSelection.call(this); // as selection might be changed
		} else {
			this.setProperty("conditions", aConditions, true);
		}

		return oCondition;

	}

	function _suggestFilter(sText) {

		const bFilterList = this.getFilterList();

		return !bFilterList || _filterText.call(this, sText, this.getFilterValue());

	}

	function _filterText(sText, sFilterValue) {

		return !sFilterValue || (typeof sFilterValue === "string" && (this.getCaseSensitive() ? sText.startsWith(sFilterValue) : sText.toLowerCase().startsWith(sFilterValue.toLowerCase())));

	}

	function _updateFilter() {

		const oList = _getList.call(this);
		const oListBinding = this.getListBinding();

		if (this._iNavigateIndex >= 0) { // initialize navigation
			this.setProperty("conditions", [], true);
			this._iNavigateIndex = -1;
			oList.setFakeFocus();
		}

		if (oList) {
			oListBinding.update();
			oList.updateItems();
			oList.invalidate();

			this._handleFirstMatchSuggest();

			_updateSelection.call(this); // to update selection
		}

	}

	function _suggestGrouping(oContext) {

		const vKey = oContext.getProperty('groupKey');
		const sText = oContext.getProperty('groupText');
		return { key: vKey, text: sText };

	}

	function _updateSelection() {

		const oList = _getList.call(this);
		if (oList) {
			const aConditions = this.getConditions();
			let vSelectedKey;
			let bFirstFilterItemSelected = false;
			const bIsOpen = this.getParent().isOpen();

			if (aConditions.length > 0 && (aConditions[0].validated === ConditionValidated.Validated || aConditions[0].operator === OperatorName.EQ /*oOperator.name*/ )) {
				vSelectedKey = aConditions[0].values[0];
			}

			const aListItems = oList.getItems();

			aListItems.forEach((oListItem, iIndex) => {
				if (oListItem.isA("sap.m.DisplayListItem")) { // check if it's not a group header
					const oOriginalItem = _getOriginalItem.call(this, oListItem);
					if ((aConditions.length > 0 && _getKey.call(this, oOriginalItem) === vSelectedKey) ||
						(aConditions.length === 0 && _getKey.call(this, oOriginalItem) === null)) {
						// conditions given -> use them to show selected items
						// no codition given -> use "not selected" - item
						oListItem.setSelected(true);
						if (bIsOpen && !oListItem.hasStyleClass("sapMLIBFocused")) { // to also update acc-descriptions
							oList.setFakeFocus(oListItem);
						}
					} else if (aConditions.length === 0 && this._iNavigateIndex < 0 && !bFirstFilterItemSelected && this._sHighlightId === oListItem.getId()) {
						oListItem.setSelected(true);
						bFirstFilterItemSelected = true;
					} else {
						oListItem.setSelected(false);
						if (bIsOpen && oListItem.hasStyleClass("sapMLIBFocused")) { // to also update acc-descriptions
							oList.setFakeFocus();
						}
					}
				}
			});
		}
	}

	// returns FixedList item for inner list item
	function _getOriginalItem(oItem) {

		return this._oManagedObjectModel.getProperty(oItem.getBindingContextPath());

	}

	function _getItemFromContext(oContext) {
		return this._oManagedObjectModel.getProperty(oContext.getPath());
	}

	function _getKey(oItem) {

		// as key could have internally another type - use initial value of binding
		// TODO: better logic?
		const oBinding = oItem.getBinding("key");
		if (oBinding) {
			return oBinding.getInternalValue();
		} else if (oItem === this.getAggregation("_emptyItem")) {
			return null; // as key is converted to String in key-property
		} else {
			return oItem.getKey();
		}

	}

	function _getText(oItem) {

		// as text could have internally another type - use initial value of binding
		// if Formatter used take formatted text (Bool case)
		// TODO: better logic?
		const oBinding = oItem.getBinding("text");
		if (oBinding && !oBinding.getFormatter()) {
			return oBinding.getInternalValue();
		} else {
			return oItem.getText();
		}

	}

	FixedList.prototype.getItemForValue = function(oConfig) {

		return this.getContent().then(() => {
			if ((oConfig.value == null || oConfig.value === undefined) && oConfig.parsedValue !== null) {
				return null;
			} else if (oConfig.parsedValue === null) {
				let vEmptyText = this.getEmptyText();
				if (vEmptyText && oConfig.emptyAllowed) {
					const oBinding = this.getBinding("emptyText");
					if (oBinding) {
						vEmptyText = oBinding.getInternalValue(); // internalValue if emptyText if bound. (because of different data type)
					}
					return { key: null, description: vEmptyText };
				} else {
					return null;
				}
			} else if (!oConfig.value && oConfig.checkDescription) {
				return null; // no check for empty description
			}

			const aItems = this.getItems();
			let oItem;
			let i = 0;
			let vKey;
			let vText;

			for (i = 0; i < aItems.length; i++) {
				oItem = aItems[i];
				vKey = _getKey.call(this, oItem);
				vText = _getText.call(this, oItem);
				if ((oConfig.checkKey && deepEqual(vKey, oConfig.parsedValue)) || (oConfig.checkDescription && (deepEqual(vText, oConfig.parsedDescription) || oItem.getText() === oConfig.value))) {
					return { key: vKey, description: vText };
				}
			}

			if (oConfig.checkKey && oConfig.value === "") {
				// empty key and no item with empty key
				return null;
			}

			if (this.getUseFirstMatch() && !oConfig.exactMatch) {
				const oContext = this.getValueHelpDelegate().getFirstMatch(this.getValueHelpInstance(), this, oConfig);
				if (oContext) {
					return this.getItemFromContext(oContext);
				}
			}

			const sError = this._oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", [oConfig.value]);
			const Exception = oConfig.exception || ParseException;
			throw new Exception(sError);

		});

	};

	FixedList.prototype.getItemFromContext = function(oBindingContext, oOptions) {
		const oOriginalItem = _getItemFromContext.call(this, oBindingContext);
		const vKey = _getKey.call(this, oOriginalItem);
		const vText = _getText.call(this, oOriginalItem);
		return { key: vKey, description: vText };
	};

	FixedList.prototype.isValidationSupported = function(oConfig) {
		return true;
	};

	FixedList.prototype.isSearchSupported = function() {
		return true;
	};

	FixedList.prototype.handleConditionsUpdate = function(oChanges) {
		if (this._iNavigateIndex >= 0 && !this._bConditionSetByNavigate) { // if conditions updated initialize navigation
			const aConditions = this.getConditions();
			const oList = _getList.call(this);
			const oItem = oList.getSelectedItem();
			const oOriginalItem = oItem && _getOriginalItem.call(this, oItem);
			if (aConditions.length !== 1 || !_getKey.call(this, oOriginalItem) === aConditions[0].values[0]) {
				this._iNavigateIndex = -1;
			}
		}

		_updateSelection.call(this); // no async handling needed here as 1. no multiple calls triggered in a direct chain and 2. no aria-issues, as List don't set aria-selected
	};

	FixedList.prototype.handleFilterValueUpdate = function(oChanges) {
		_updateFilter.call(this);
		ListContent.prototype.handleFilterValueUpdate.apply(this, arguments);
	};

	FixedList.prototype.removeVisualFocus = function() {

		const oList = _getList.call(this);
		oList?.removeStyleClass("sapMListFocus");

	};

	FixedList.prototype.setVisualFocus = function() {

		const oList = _getList.call(this);
		if (!oList?.hasStyleClass("sapMListFocus")) {
			oList?.addStyleClass("sapMListFocus");
		}

	};

	FixedList.prototype.navigate = function(iStep) {

		const oList = _getList.call(this);

		if (!oList) {
			return; // TODO: should not happen? Create List?
		}

		const aItems = oList.getItems();
		const iItems = aItems.length;
		const oSelectedItem = this._iNavigateIndex >= 0 ? aItems[this._iNavigateIndex] : oList.getSelectedItem();
		let iSelectedIndex = 0;
		const bFilterList = this.getFilterList();
		const sFilterValue = this.getFilterValue();
		let bLeaveFocus = false;
		const bIsOpen = this.getParent().isOpen();

		if (!bFilterList && !oSelectedItem) {
			// try to find item that matches Filter
			let i = 0;
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
		} else if (iStep >= 0) {
			iSelectedIndex = iStep - 1;
		} else {
			iSelectedIndex = iItems + iStep;
		}

		if (iStep === 9999) {
			iSelectedIndex = iItems - 1;
		}
		if (iStep === -9999) {
			iSelectedIndex = 0;
		}

		let bSearchForNext;
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

		const fSkipGroupHeader = function() {
			while (aItems[iSelectedIndex] && aItems[iSelectedIndex].isA("sap.m.GroupHeaderListItem")) { // ignore group headers
				if (bSearchForNext) {
					iSelectedIndex++;
				} else {
					iSelectedIndex--;
				}
			}
		};

		if (!bIsOpen || iStep === 0) { // if closed, ignore headers
			fSkipGroupHeader();
			if (iSelectedIndex < 0 || iSelectedIndex > iItems - 1) {
				// find last not groupable item
				bSearchForNext = !bSearchForNext;
				bLeaveFocus = iSelectedIndex < 0;
				iSelectedIndex = iSelectedIndex < 0 ? 0 : iItems - 1;
				fSkipGroupHeader();
			}
		}

		const oItem = aItems[iSelectedIndex];
		if (oItem) {
			const bUseFirstMatch = this.getUseFirstMatch(); // if item for first match is selected, navigate to it needs to fire the event
			if (oItem !== oSelectedItem || (bUseFirstMatch && !bLeaveFocus) || (this._iNavigateIndex !== iSelectedIndex && !bLeaveFocus)) { // new item or already selected or highlighted item is navigated (focus set on dropdown)
				let oOriginalItem, vKey, vDescription;

				this._iNavigateIndex = iSelectedIndex;

				if (bIsOpen) {
					oList.scrollToIndex(iSelectedIndex); // only possible if open
					// in case of a single value field fake the focus on the new selected item to update the screenreader invisible text
					oList.setFakeFocus(oItem);
				}

				if (oItem.isA("sap.m.GroupHeaderListItem")) {
					this._bConditionSetByNavigate = true;
					this.setProperty("conditions", [], true); // no condition navigated
					delete this._bConditionSetByNavigate;
					this.fireNavigated({ condition: undefined, itemId: oItem.getId(), leaveFocus: false });
				} else {
					oOriginalItem = _getOriginalItem.call(this, oItem);
					vKey = _getKey.call(this, oOriginalItem);
					vDescription = _getText.call(this, oOriginalItem);
					this._bConditionSetByNavigate = true;
					const oCondition = _setConditions.call(this, vKey, vDescription);
					delete this._bConditionSetByNavigate;
					const oValueHelpDelegate = this.getValueHelpDelegate();
					const bCaseSensitive = oValueHelpDelegate.isFilteringCaseSensitive(this.getValueHelpInstance(), this);
					this.fireNavigated({ condition: oCondition, itemId: oItem.getId(), leaveFocus: false, caseSensitive: bCaseSensitive });
				}
				if (bIsOpen) {
					this.setVisualFocus(); // to show focus outline on navigated item
					this.fireVisualFocusSet();
				}
			} else if (bLeaveFocus) {
				this._iNavigateIndex = -1; // initialize navigation but keep coditions to show last navigated one as selected
				this.fireNavigated({ condition: undefined, itemId: undefined, leaveFocus: bLeaveFocus });
			}
		}

	};

	FixedList.prototype.onShow = function(bInitial) {

		return ListContent.prototype.onShow.apply(this, arguments).then(() => {
			// scroll to selected item
			const oList = _getList.call(this);
			let sItemId;

			if (!oList) {
				return null; // TODO: should not happen? Create List?
			}

			const oSelectedItem = oList.getSelectedItem();
			if (oSelectedItem) {
				const iSelectedIndex = oList.indexOfItem(oSelectedItem);
				oList.scrollToIndex(iSelectedIndex);
				sItemId = oSelectedItem.getId();
			}

			const aRelevantContexts = this.getListBinding()?.getCurrentContexts();
			const iItems = aRelevantContexts?.length;

			return {itemId: sItemId, items: iItems};
		});

	};

	FixedList.prototype.onHide = function() {

		this.removeVisualFocus();
		const oList = _getList.call(this);
		oList?.setFakeFocus(); // to add it again if reopened

		this._iNavigateIndex = -1; // initialize after closing

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
			roleDescription: null, // no multi-selection
			valueHelpEnabled: false, // a dropdown on a popover is not seen as value help
			autocomplete: this.getUseFirstMatch() ? "both" : "none" // first match is used for autocomplete
		};

	};

	/**
	 * Determines if the value help should be opened when the user clicks into the connected control.
	 *
	 * @returns {boolean} If <code>true</code>, the value help should open when user clicks into the connected field control
	 * @deprecated As of version 1.137 with no replacement.
	 */
	FixedList.prototype.shouldOpenOnClick = function() {

		return this.getRestrictedToFixedValues();

	};

	FixedList.prototype.isFocusInHelp = function() {

		return false; // focus should stay in field, even if opened as valueHelp

	};

	FixedList.prototype.isSingleSelect = function(oEvent) {

		return true;

	};

	FixedList.prototype.isNavigationEnabled = function(iStep) {

		return this.getItems().length > 0; // always enabled if items

	};

	FixedList.prototype.onConnectionChange = function() {

		this._iNavigateIndex = -1; // initially nothing is navigated

	};

	FixedList.prototype.getListBinding = function() {
		const oList = _getList.call(this);
		return oList && oList.getBinding("items");
	};

	FixedList.prototype.getKeyPath = function () {
		return "key";
	};

	FixedList.prototype.getDescriptionPath = function () {
		return "text";
	};

	FixedList.prototype.setHighlightId = function (sItemId) {
		if (this._sHighlightId !== sItemId) {
			this._sHighlightId = sItemId;
			_updateSelection.call(this);
		}
	};

	FixedList.prototype.destroyItems = function () {
		const oList = _getList.call(this);
		oList?.destroyItems(); // directly destroy all internal items and it's bindings to prevent step-by-step removement from ManagedObjectModel
		return this.destroyAggregation("items");
	};

	FixedList.prototype.observeChanges = function(oChanges) {

		if (oChanges.name === "emptyText") {
			_setEmptyItem.call(this, oChanges.current);
			this._oManagedObjectModel?.checkUpdate(true, true);
			_updateSelection.call(this); // as items might be changed
		} else if (oChanges.name === "config" && (oChanges.current?.emptyAllowed !== oChanges.old?.emptyAllowed)) {
			this._oManagedObjectModel?.checkUpdate(true, true);
			_updateSelection.call(this); // as items might be changed
		}

		ListContent.prototype.observeChanges.apply(this, arguments);

	};

	FixedList.prototype.isRestrictedToFixedValues = function() {
		return this.getRestrictedToFixedValues();
	};

	function _setEmptyItem(sEmptyText) {

		if (sEmptyText && FixedListItem && this._oManagedObjectModel) {
			if (!this.getAggregation("_emptyItem")) {
				const oEmptyItem = new FixedListItem(this.getId() + "-emptyItem", {
					key: null,
					text: { path: "$help>/emptyText" }
				});
				this.setAggregation("_emptyItem", oEmptyItem, true); // to have in control tree
				oEmptyItem.setModel(this._oManagedObjectModel, "$help");
			}
		} else {
			this.destroyAggregation("_emptyItem", true);
		}

	}

	return FixedList;
});