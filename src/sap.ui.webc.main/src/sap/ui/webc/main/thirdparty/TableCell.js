sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', './generated/templates/TableCellTemplate.lit', './generated/themes/TableCell.css'], function (UI5Element, litRender, TableCellTemplate_lit, TableCell_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-table-cell",
		slots:  {
			"default": {
				type: Node,
			},
		},
		properties:  {
			lastInRow: {
				type: Boolean,
			},
			popined: {
				type: Boolean,
			},
		},
		events:  {
		},
	};
	class TableCell extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return TableCell_css;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return TableCellTemplate_lit;
		}
	}
	TableCell.define();

	return TableCell;

});
