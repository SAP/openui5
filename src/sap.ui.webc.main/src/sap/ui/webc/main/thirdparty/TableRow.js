sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/util/getActiveElement', 'sap/ui/webc/common/thirdparty/base/util/TabbableElements', './CheckBox', './types/TableMode', './types/TableRowType', './generated/templates/TableRowTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/TableRow.css'], function (UI5Element, i18nBundle, litRender, Keys, getActiveElement, TabbableElements, CheckBox, TableMode, TableRowType, TableRowTemplate_lit, i18nDefaults, TableRow_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var getActiveElement__default = /*#__PURE__*/_interopDefaultLegacy(getActiveElement);

	const metadata = {
		tag: "ui5-table-row",
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "cells",
				type: HTMLElement,
				individualSlots: true,
			},
		},
		properties:  {
			mode: {
				type: TableMode,
				defaultValue: TableMode.None,
			},
			type: {
				type: TableRowType,
				defaultValue: TableRowType.Inactive,
			},
			selected: {
				type: Boolean,
			},
			active: {
				type: Boolean,
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
			"row-click": {},
			_focused: {},
			"selection-requested": {},
			"f7-pressed": {},
		},
	};
	class TableRow extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return TableRow_css;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return TableRowTemplate_lit;
		}
		static get dependencies() {
			return [CheckBox];
		}
		constructor() {
			super();
			this._ontouchstart = {
				handleEvent(event) {
					this.activate();
				},
				passive: true,
			};
		}
		_onmouseup() {
			this.deactivate();
		}
		_onkeydown(event) {
			const activeElement = getActiveElement__default();
			const itemActive = this.type === TableRowType.Active;
			const isSingleSelect = this.isSingleSelect;
			const itemSelectable = isSingleSelect || this.isMultiSelect;
			const isRowFocused = this._activeElementHasAttribute("ui5-table-row");
			const checkboxPressed = event.target.classList.contains("ui5-multi-select-checkbox");
			if (Keys.isTabNext(event) && activeElement === (TabbableElements.getLastTabbableElement(this) || this.root)) {
				this.fireEvent("_forward-after", { target: activeElement });
			}
			if (Keys.isTabPrevious(event) && activeElement === this.root) {
				this.fireEvent("_forward-before", { target: activeElement });
			}
			if (Keys.isSpace(event) && event.target.tagName.toLowerCase() === "tr") {
				event.preventDefault();
			}
			if (isRowFocused && !checkboxPressed) {
				if ((Keys.isSpace(event) && itemSelectable) || (Keys.isEnter(event) && isSingleSelect)) {
					this.fireEvent("selection-requested", { row: this });
				}
				if (Keys.isEnter(event) && itemActive) {
					this.fireEvent("row-click", { row: this });
					if (!isSingleSelect) {
						this.activate();
					}
				}
			}
			if (Keys.isF7(event)) {
				event.preventDefault();
				this.fireEvent("f7-pressed", { row: this });
			}
		}
		_onkeyup(event) {
			if (Keys.isSpace(event) || Keys.isEnter(event)) {
				this.deactivate();
			}
		}
		_ontouchend() {
			this.deactivate();
		}
		_onfocusout() {
			this.deactivate();
		}
		_onfocusin(event, forceSelfFocus = false) {
			if (forceSelfFocus || this._activeElementHasAttribute("ui5-table-cell")) {
				this.root.focus();
				this.activate();
			}
			this.fireEvent("_focused", event);
		}
		_onrowclick(event) {
			const checkboxPressed = event.target.classList.contains("ui5-multi-select-checkbox");
			if (event.isMarked === "button") {
				return;
			}
			if (!this.contains(this.getRootNode().activeElement)) {
				this._onfocusin(event, true );
				this.deactivate();
			}
			if (this._activeElementHasAttribute("ui5-table-row")) {
				if (this.isSingleSelect) {
					this._handleSelection();
				}
				if (this.type === TableRowType.Active && !checkboxPressed) {
					this.fireEvent("row-click", { row: this });
				}
			}
		}
		_handleSelection() {
			this.fireEvent("selection-requested", { row: this });
		}
		_activeElementHasAttribute(attr) {
			return this.getRootNode().activeElement.hasAttribute(attr);
		}
		activate() {
			if (this.type === TableRowType.Active) {
				this.active = true;
			}
		}
		deactivate() {
			if (this.active) {
				this.active = false;
			}
		}
		get shouldPopin() {
			return this._columnsInfo.filter(el => {
				return el.demandPopin || !el.visible;
			}).length;
		}
		get allColumnsPoppedIn() {
			return this._columnsInfo.every(el => el.demandPopin && !el.visible);
		}
		onBeforeRendering() {
			if (!this.shouldPopin) {
				return;
			}
			this.visibleCells = [];
			this.popinCells = [];
			if (this.cells.length === 0) {
				return;
			}
			const allColumnsPoppedInClass = this.allColumnsPoppedIn ? "all-columns-popped-in" : "";
			this._columnsInfo.forEach((info, index) => {
				const cell = this.cells[index];
				if (!cell) {
					return;
				}
				if (info.visible) {
					this.visibleCells.push(cell);
					cell.popined = false;
				} else if (info.demandPopin) {
					const popinHeaderClass = this.popinCells.length === 0 ? "popin-header" : "";
					this.popinCells.push({
						cell,
						popinText: info.popinText,
						classes: `ui5-table-popin-row ${allColumnsPoppedInClass} ${popinHeaderClass}`,
					});
					cell.popined = true;
				} else {
					cell.popined = false;
				}
			}, this);
			const lastVisibleCell = this.visibleCells[this.visibleCells.length - 1];
			if (lastVisibleCell) {
				lastVisibleCell.lastInRow = true;
			}
		}
		get visibleCellsCount() {
			let visibleCellsCount = this.visibleCells.length;
			if (this.isMultiSelect) {
				visibleCellsCount += 1;
			}
			return visibleCellsCount;
		}
		get ariaLabelText() {
			const ariaLabel = this.cells.map((cell, index) => {
				const columText = this.getColumnTextByIdx(index);
				const cellText = this.getCellText(cell);
				return `${columText} ${cellText}`;
			}).join(" ");
			return `${ariaLabel}. ${this._ariaPosition}`;
		}
		get ariaLabelRowSelection() {
			return TableRow.i18nBundle.getText(i18nDefaults.ARIA_LABEL_ROW_SELECTION);
		}
		get isSingleSelect() {
			return this.mode === "SingleSelect";
		}
		get isMultiSelect() {
			return this.mode === "MultiSelect";
		}
		get root() {
			return this.shadowRoot.querySelector(".ui5-table-row-root");
		}
		getCellText(cell) {
			return this.getNormilzedTextContent(cell.textContent);
		}
		getColumnTextByIdx(index) {
			const columnInfo = this._columnsInfo[index];
			if (!columnInfo) {
				return "";
			}
			return this.getNormilzedTextContent(columnInfo.text);
		}
		getNormilzedTextContent(textContent) {
			return textContent.replace(/[\n\r\t]/g, "").trim();
		}
		static async onDefine() {
			TableRow.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
	}
	TableRow.define();

	return TableRow;

});
