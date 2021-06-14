sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/types/Integer', './generated/templates/TableColumnTemplate.lit', './generated/themes/TableColumn.css'], function (UI5Element, litRender, Integer, TableColumnTemplate_lit, TableColumn_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);

	const metadata = {
		tag: "ui5-table-column",
		slots:  {
			"default": {
				type: Node,
			},
		},
		properties:  {
			minWidth: {
				type: Integer__default,
				defaultValue: Infinity,
			},
			popinText: {
				type: String,
			},
			demandPopin: {
				type: Boolean,
			},
			first: {
				type: Boolean,
			},
			last: {
				type: Boolean,
			},
			sticky: {
				type: Boolean,
			},
		},
	};
	class TableColumn extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return TableColumn_css;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return TableColumnTemplate_lit;
		}
	}
	TableColumn.define();

	return TableColumn;

});
