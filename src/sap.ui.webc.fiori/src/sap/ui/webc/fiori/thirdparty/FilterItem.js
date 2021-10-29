sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/main/thirdparty/ListItem', './generated/templates/FilterItemTemplate.lit', './generated/themes/FilterItem.css'], function (litRender, ListItem, FilterItemTemplate_lit, FilterItem_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ListItem__default = /*#__PURE__*/_interopDefaultLegacy(ListItem);

	const metadata = {
		tag: "ui5-filter-item",
		managedSlots: true,
		properties:  {
			text: {
				type: String,
			},
			additionalText: {
				type: String,
			},
		},
		slots:  {
			values: {
				type: HTMLElement,
			},
		},
		events:  {
		},
	};
	class FilterItem extends ListItem__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return [ListItem__default.styles, FilterItem_css];
		}
		static get template() {
			return FilterItemTemplate_lit;
		}
	}
	FilterItem.define();

	return FilterItem;

});
