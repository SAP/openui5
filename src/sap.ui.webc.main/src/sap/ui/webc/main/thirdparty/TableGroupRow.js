sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', './CheckBox', './generated/templates/TableGroupRowTemplate.lit', './types/TableMode', './generated/i18n/i18n-defaults', './generated/themes/TableGroupRow.css'], function (UI5Element, litRender, i18nBundle, CheckBox, TableGroupRowTemplate_lit, TableMode, i18nDefaults, TableGroupRow_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-table-group-row",
		slots:  {
			"default": {
				type: Node,
			},
		},
		properties:  {
			mode: {
				type: TableMode,
				defaultValue: TableMode.None,
			},
			_columnsInfo: {
				type: Object,
				multiple: true,
			},
			_tabIndex: {
				type: String,
				defaultValue: "-1",
			},
			_busy: {
				type: Boolean,
			},
			_ariaPosition: {
				type: String,
				defaultValue: "",
				noAttribute: true,
			},
		},
		events:  {
			_focused: {},
		},
	};
	class TableGroupRow extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return TableGroupRow_css;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return TableGroupRowTemplate_lit;
		}
		static get dependencies() {
			return [
				CheckBox,
			];
		}
		constructor() {
			super();
		}
		get colSpan() {
			return this._colSpan;
		}
		get ariaLabelText() {
			return `${TableGroupRow.i18nBundle.getText(i18nDefaults.TABLE_GROUP_ROW_ARIA_LABEL)} ${this.innerText}. ${this._ariaPosition}`;
		}
		visibleColCount() {
			let count = this._columnsInfo.reduce((acc, column) => {
				return column.visible ? ++acc : acc;
			}, 0);
			if (this.mode === TableMode.MultiSelect) {
				count++;
			}
			return count;
		}
		onBeforeRendering() {
			if (!this._columnsInfo || this._columnsInfo.length === 0) {
				return;
			}
			this._colSpan = this.visibleColCount();
		}
		_onfocusin(event) {
			this.fireEvent("_focused", event);
		}
		static async onDefine() {
			TableGroupRow.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
	}
	TableGroupRow.define();

	return TableGroupRow;

});
