sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/types/ValueState', './SuggestionListItem', './types/ListItemType'], function (UI5Element, ValueState, SuggestionListItem, ListItemType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);

	const metadata = {
		tag: "ui5-suggestion-item",
		properties:  {
			text: {
				type: String,
			},
			type: {
				type: ListItemType,
				defaultValue: ListItemType.Active,
			},
			description: {
				type: String,
			},
			icon: {
				type: String,
			},
			iconEnd: {
				type: Boolean,
			},
			image: {
				type: String,
			},
			additionalText: {
				type: String,
			},
			additionalTextState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
		},
		slots:  {
		},
		events:  {
		},
	};
	class SuggestionItem extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get dependencies() {
			return [
				SuggestionListItem,
			];
		}
	}
	SuggestionItem.define();

	return SuggestionItem;

});
