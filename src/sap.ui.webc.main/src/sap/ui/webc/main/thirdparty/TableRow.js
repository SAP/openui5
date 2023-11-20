sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/util/getActiveElement", "sap/ui/webc/common/thirdparty/base/util/TabbableElements", "sap/ui/webc/common/thirdparty/base/MarkedEvents", "./CheckBox", "./types/TableMode", "./types/TableRowType", "./types/TableColumnPopinDisplay", "./generated/templates/TableRowTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/TableRow.css"], function (_exports, _UI5Element, _customElement, _property, _event, _slot, _i18nBundle, _LitRenderer, _Keys, _getActiveElement, _TabbableElements, _MarkedEvents, _CheckBox, _TableMode, _TableRowType, _TableColumnPopinDisplay, _TableRowTemplate, _i18nDefaults, _TableRow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _slot = _interopRequireDefault(_slot);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _getActiveElement = _interopRequireDefault(_getActiveElement);
  _CheckBox = _interopRequireDefault(_CheckBox);
  _TableMode = _interopRequireDefault(_TableMode);
  _TableRowType = _interopRequireDefault(_TableRowType);
  _TableColumnPopinDisplay = _interopRequireDefault(_TableColumnPopinDisplay);
  _TableRowTemplate = _interopRequireDefault(_TableRowTemplate);
  _TableRow = _interopRequireDefault(_TableRow);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var TableRow_1;

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-table-row</code> component represents a row in the <code>ui5-table</code>.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-table-row</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>row - Used to style the native <code>tr</code> element</li>
   * <li>popin-row - Used to style the <code>tr</code> element when a row pops in</li>
   * </ul>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.TableRow
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-table-row
   * @implements sap.ui.webc.main.ITableRow
   * @public
   */
  let TableRow = TableRow_1 = class TableRow extends _UI5Element.default {
    constructor() {
      super();
      this.visibleCells = [];
      this.popinCells = [];
      // Properties, set and handled by the Table
      this._tabbables = [];
      this._columnsInfoString = "";
      const handleToushStartEvent = () => {
        this.activate();
      };
      this._ontouchstart = {
        handleEvent: handleToushStartEvent,
        passive: true
      };
    }
    _onmouseup() {
      this.deactivate();
    }
    _onkeydown(e) {
      const activeElement = (0, _getActiveElement.default)();
      const itemActive = this.type === _TableRowType.default.Active;
      const isSingleSelect = this.isSingleSelect;
      const itemSelectable = isSingleSelect || this.isMultiSelect;
      const isRowFocused = this._activeElementHasAttribute("ui5-table-row");
      const target = e.target;
      const checkboxPressed = target.classList.contains("ui5-multi-select-checkbox");
      const rowElements = Array.from(this.shadowRoot.querySelectorAll("tr") || []);
      const elements = rowElements.map(_TabbableElements.getLastTabbableElement);
      const lastFocusableElement = elements.pop();
      if ((0, _Keys.isTabNext)(e) && activeElement === (lastFocusableElement || this.root)) {
        this.fireEvent("_forward-after", {
          target: activeElement
        });
      }
      if ((0, _Keys.isTabPrevious)(e) && activeElement === this.root) {
        this.fireEvent("_forward-before", {
          target: activeElement
        });
      }
      if ((0, _Keys.isSpace)(e) && target.tagName.toLowerCase() === "tr") {
        e.preventDefault();
      }
      if (isRowFocused && !checkboxPressed) {
        if ((0, _Keys.isSpace)(e) && itemSelectable || (0, _Keys.isEnter)(e) && isSingleSelect) {
          this.fireEvent("selection-requested", {
            row: this
          });
        }
        if ((0, _Keys.isEnter)(e) && itemActive) {
          this.fireEvent("row-click", {
            row: this
          });
          if (!isSingleSelect) {
            this.activate();
          }
        }
      }
      if ((0, _Keys.isF7)(e)) {
        e.preventDefault();
        this.fireEvent("f7-pressed", {
          row: this
        });
      }
    }
    _onkeyup(e) {
      if ((0, _Keys.isSpace)(e) || (0, _Keys.isEnter)(e)) {
        this.deactivate();
      }
    }
    _ontouchend() {
      this.deactivate();
    }
    _onfocusout() {
      this.deactivate();
    }
    _onfocusin(e, forceSelfFocus = false) {
      if (forceSelfFocus || this._activeElementHasAttribute("ui5-table-cell")) {
        this.root.focus();
        this.activate();
      }
      this.fireEvent("_focused");
    }
    _onrowclick(e) {
      const checkboxPressed = e.target.classList.contains("ui5-multi-select-checkbox");
      // If the user tab over a button on IOS device, the document.activeElement
      // is the ui5-table-row. The check below ensure that, if a button within the row is pressed,
      // the row will not be selected.
      if ((0, _MarkedEvents.getEventMark)(e) === "button") {
        return;
      }
      const activeElement = this.getRootNode().activeElement;
      if (!this.contains(activeElement)) {
        // If the user clickes on non-focusable element within the ui5-table-cell,
        // the focus goes to the body, se we have to bring it back to the row.
        // If the user clicks on input, button or similar clickable element,
        // the focus remains on that element.
        this._onfocusin(e, true /* force row focus */);
        this.deactivate();
      }
      if (this._activeElementHasAttribute("ui5-table-row")) {
        if (this.isSingleSelect) {
          this._handleSelection();
        }
        if (this.type === _TableRowType.default.Active && !checkboxPressed) {
          this.fireEvent("row-click", {
            row: this
          });
        }
      }
    }
    _handleSelection() {
      this.fireEvent("selection-requested", {
        row: this
      });
    }
    _activeElementHasAttribute(attr) {
      return this.getRootNode().activeElement.hasAttribute(attr);
    }
    get _ariaCurrent() {
      return this.navigated ? true : undefined;
    }
    activate() {
      if (this.type === _TableRowType.default.Active) {
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
        const popinDisplay = info.popinDisplay === _TableColumnPopinDisplay.default.Inline;
        if (!cell) {
          return;
        }
        if (info.visible) {
          this.visibleCells.push(cell);
          cell.popined = false;
          cell._popinedInline = false;
        } else if (info.demandPopin) {
          const popinHeaderClass = this.popinCells.length === 0 ? "popin-header" : "";
          this.popinCells.push({
            cell,
            popinText: info.popinText,
            classes: `ui5-table-popin-row ${allColumnsPoppedInClass} ${popinHeaderClass}`,
            popinDisplayInline: popinDisplay
          });
          cell.popined = true;
          if (info.popinDisplay === _TableColumnPopinDisplay.default.Inline) {
            cell._popinedInline = true;
          }
        } else {
          cell.popined = false;
          cell._popinedInline = false;
        }
      });
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
      const isSelected = this.selected ? TableRow_1.i18nBundle.getText(_i18nDefaults.LIST_ITEM_SELECTED) : TableRow_1.i18nBundle.getText(_i18nDefaults.LIST_ITEM_NOT_SELECTED);
      const isRowSelectable = this.isSingleSelect || this.isMultiSelect;
      const ariaLabel = this.cells.map((cell, index) => {
        const columText = this.getColumnTextByIdx(index);
        const cellText = cell.cellContent.length ? this.getCellText(cell) : cell.ariaLabelEmptyCellText;
        return `${columText} ${cellText}`;
      }).join(" ");
      if (isRowSelectable) {
        return `${ariaLabel}. ${this._ariaPosition}. ${isSelected}`;
      }
      return `${ariaLabel}. ${this._ariaPosition}`;
    }
    get ariaLabelRowSelection() {
      return TableRow_1.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_ROW_SELECTION);
    }
    get isSingleSelect() {
      return this.mode === _TableMode.default.SingleSelect;
    }
    get isMultiSelect() {
      return this.mode === _TableMode.default.MultiSelect;
    }
    get root() {
      return this.shadowRoot.querySelector(".ui5-table-row-root");
    }
    getCellText(cell) {
      const cellTextContent = cell.textContent;
      return cellTextContent ? this.getNormilzedTextContent(cellTextContent) : "";
    }
    getColumnTextByIdx(index) {
      const columnInfo = this._columnsInfo[index];
      if (!columnInfo) {
        return "";
      }
      return columnInfo.text ? this.getNormilzedTextContent(columnInfo.text) : "";
    }
    getNormilzedTextContent(textContent) {
      return textContent.replace(/[\n\r\t]/g, "").trim();
    }
    static async onDefine() {
      TableRow_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)({
    type: _TableRowType.default,
    defaultValue: _TableRowType.default.Inactive
  })], TableRow.prototype, "type", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TableRow.prototype, "selected", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TableRow.prototype, "navigated", void 0);
  __decorate([(0, _property.default)({
    type: _TableMode.default,
    defaultValue: _TableMode.default.None
  })], TableRow.prototype, "mode", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TableRow.prototype, "active", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], TableRow.prototype, "_columnsInfo", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "-1"
  })], TableRow.prototype, "_tabIndex", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TableRow.prototype, "_busy", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "",
    noAttribute: true
  })], TableRow.prototype, "_ariaPosition", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true,
    individualSlots: true
  })], TableRow.prototype, "cells", void 0);
  TableRow = TableRow_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-table-row",
    styles: _TableRow.default,
    renderer: _LitRenderer.default,
    template: _TableRowTemplate.default,
    dependencies: [_CheckBox.default]
  })
  /**
   * Fired when a row in <code>Active</code> mode is clicked or <code>Enter</code> key is pressed.
   *
   * @event sap.ui.webc.main.TableRow#row-click
   * @since 1.0.0-rc.15
   * @private
   */, (0, _event.default)("row-click"), (0, _event.default)("_focused")
  /**
   * Fired on selection change of an active row.
   *
   * @event sap.ui.webc.main.TableRow#selection-requested
   * @since 1.0.0-rc.15
   * @private
   */, (0, _event.default)("selection-requested")
  /**
   * Fired when F7 is pressed.
   *
   * @event sap.ui.webc.main.TableRow#f7-pressed
   * @since 1.2.0
   * @private
   */, (0, _event.default)("f7-pressed")], TableRow);
  TableRow.define();
  var _default = TableRow;
  _exports.default = _default;
});