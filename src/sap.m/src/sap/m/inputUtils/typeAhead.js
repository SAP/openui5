/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/Device"], function (Device) {
	"use strict";

	var DEFAULT_TEXT_GETTER_NAME = "getText";

	/**
	 * Handles DOM update, text highlighting and input focusing of the selected item.
	 *
	 * @param sValue {string} Typed in value.
	 * @param oInput {sap.m.Input} Input to act upon.
	 * @param aItems {Array<T>} Items to pick from.
	 * @param vTextGetter {string|function} Name of method in oInput or a function which extracts the text.
	 * @returns {Array<T>} A sorted array of matching items. The first item is the one that's being highlighted.
	 */
	function handleTypeAhead(sValue, oInput, aItems, vTextGetter) {
		var sSelectedItemText,
			bDesktopPlatform = Device.system.desktop,
			aSelectedItems = _filterItems(sValue, aItems, vTextGetter);

		if (!Array.isArray(aSelectedItems) || !aSelectedItems.length) {
			return [];
		}

		aSelectedItems = _sortItems(sValue, aSelectedItems, vTextGetter); // It's important to sort the items with the best match
		// check for exact match
		const oExactMatch = aSelectedItems.find((oItem) => _exactMatchIgnoreCase(_extractTextsFromItem(oItem, vTextGetter)[0], sValue));

		if (oExactMatch) {
			// if there is an exact match, return it and skip the rest
			return [oExactMatch];
		}

		sSelectedItemText = _findBestTextMatch(_extractTextsFromItem(aSelectedItems[0], vTextGetter), sValue);

		if (!oInput.isComposingCharacter() && sSelectedItemText) {
			oInput.updateDomValue(sSelectedItemText);
		}

		if (bDesktopPlatform) {
			_selectTextIfFocused(oInput, sValue.length, oInput.getValue().length);
		} else {
			// timeout required for an Android and Windows Phone bug
			setTimeout(_selectTextIfFocused.bind(null, oInput, sValue.length, oInput.getValue().length), 0);
		}

		return aSelectedItems || [];
	}

	/**
	 * Selects part of the text in the input if the input is focused.
	 *
	 * @param oInput {sap.m.Input}
	 * @param iStart {int} From which character to start.
	 * @param iEnd {int} Which character to end with.
	 */
	function _selectTextIfFocused(oInput, iStart, iEnd) {
		if (document.activeElement === oInput.getFocusDomRef()) {
			oInput.selectText(iStart, iEnd);
		}
	}

	/**
	 * Filters items based on an input string.
	 * A custom getter string could be provided to support further scenarios. The default one is <code>getText</code>.
	 *
	 * @param sTextToFilter {string}
	 * @param aItems {Array<T>}
	 * @param vTextGetter {string|function}
	 * @returns {Array<T>}
	 * @private
	 */
	function _filterItems(sTextToFilter, aItems, vTextGetter) {
		sTextToFilter = sTextToFilter && sTextToFilter.toLowerCase();

		if (!Array.isArray(aItems)) {
			return [];
		}

		return aItems
			// Extracts texts from the items
			.map(function (oItem) {
				return [oItem, _extractTextsFromItem(oItem, vTextGetter)];
			})
			// Filters only the matching items by the serach term criteria.
			.filter(function (aItemMeta) {
				var oItem = aItemMeta[0],
					aItemTexts = aItemMeta[1];

				if (!oItem || oItem.isA("sap.ui.core.SeparatorItem") || oItem.isA("sap.m.GroupHeaderListItem") || (oItem.isA("sap.m.ColumnListItem") && !oItem.getVisible())) {
					return false;
				}

				return aItemTexts.some(function (sText) {
					return _startsWithIgnoreCase(sText, sTextToFilter);
				});
			})
			// Normalize the output result
			.map(function (aItemMeta) { return aItemMeta[0]; });
	}

	/**
	 * Sorts items based on the best match. The first item is most likely to be the selected one.
	 *
	 * Items could have multiple texts and the sorting criteria is:
	 * - item with text that matches exactly the input value has the highest priority
	 * - the matching text with lower index in the array gets a higher priority
	 * For example, if there's an array of texts: left: ["bar", "foo"], right: ["foo", "bar"] and the search is "fo",
	 * the order would be:
	 * 1. ["foo", "bar"]
	 * 2. ["bar", "foo"]
	 *
	 * @param sTextToFilter {string}
	 * @param aItems {Array<T>}
	 * @param vTextGetter {string|function}
	 * @returns {Array<T>}
	 * @private
	 */
	function _sortItems(sTextToFilter, aItems, vTextGetter) {
		return aItems
			.map(function (oItem) {
				return [oItem, _extractTextsFromItem(oItem, vTextGetter)];
			})
			.sort(function (aLeftItemMeta, aRightItemMeta) {
				var bLeft, bRight,
					aLeftTexts = aLeftItemMeta[1],
					aRightTexts = aRightItemMeta[1];

				for (var i = 0; i < aLeftTexts.length; i++) {
					bLeft = _startsWithIgnoreCase(aLeftTexts[i], sTextToFilter);
					bRight = _startsWithIgnoreCase(aRightTexts[i], sTextToFilter);

					if (bLeft && bRight) {
						return 0;
					} else if (_startsWithIgnoreCase(aLeftTexts[i], sTextToFilter)) {
						return -1;
					} else if (_startsWithIgnoreCase(aRightTexts[i], sTextToFilter)) {
						return 1;
					}
				}

				return 0;
			})
			// Normalize the output result
			.map(function (aItemMeta) { return aItemMeta[0]; });
	}

	/**
	 * Extracts a text from an object.
	 *
	 * @param oItem {Object}
	 * @param vTextGetter {string|function}
	 * @returns {Array<string>}
	 * @private
	 */
	function _extractTextsFromItem(oItem, vTextGetter) {
		var vTexts, fnGetter;

		switch (typeof vTextGetter) {
			case "function":
				vTexts = vTextGetter(oItem);
				break;
			case "string":
			case "undefined":
				fnGetter = oItem[vTextGetter || DEFAULT_TEXT_GETTER_NAME];
				vTexts = typeof fnGetter === "function" ? fnGetter.call(oItem) : "";
				break;
			default:
				vTexts = "";
				break;
		}

		return Array.isArray(vTexts) ? vTexts : [vTexts];
	}

	/**
	 * Checks if a text starts with a search term. Case insensitive.
	 *
	 * @param sTextToTest {string}
	 * @param sSearchTerm {string}
	 * @returns {boolean}
	 * @private
	 */
	function _startsWithIgnoreCase(sTextToTest, sSearchTerm) {
		if (!sTextToTest || !sSearchTerm) {
			return false;
		}

		return sTextToTest.toLowerCase().indexOf(sSearchTerm.toLowerCase()) === 0;
	}

	/**
	 *
	 * @param {string} sTextToTest
	 * @param {string} sSearchTerm
	 * @returns {boolean}
	 * @private
	 */
	function _exactMatchIgnoreCase(sTextToTest, sSearchTerm) {
		return sTextToTest?.toLowerCase() === sSearchTerm?.toLowerCase();
	}

	/**
	 * Returns the first/best match of a startsWith.
	 *
	 * @param aTexts {Array<string>}
	 * @param sSearch {string}
	 * @returns {string}
	 * @private
	 */
	function _findBestTextMatch(aTexts, sSearch) {
		if (!Array.isArray(aTexts)) {
			return "";
		}

		return aTexts.filter(function (sText) {
			return _startsWithIgnoreCase(sText, sSearch);
		})[0] || "";
	}

	return handleTypeAhead;
});