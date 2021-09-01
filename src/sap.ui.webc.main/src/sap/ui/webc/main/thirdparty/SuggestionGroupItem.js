sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', './GroupHeaderListItem'], function (UI5Element, GroupHeaderListItem) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);

	const metadata = {
		tag: "ui5-suggestion-group-item",
		properties:  {
			text: {
				type: String,
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
				GroupHeaderListItem,
			];
		}
		get groupItem() {
			return true;
		}
	}
	SuggestionItem.define();

	return SuggestionItem;

});
