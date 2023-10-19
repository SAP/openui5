sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/types/NavigationMode", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/util/getNormalizedTarget", "sap/ui/webc/common/thirdparty/base/util/getActiveElement", "sap/ui/webc/common/thirdparty/base/util/TabbableElements", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/util/debounce", "sap/ui/webc/common/thirdparty/base/util/isElementInView", "./types/TableGrowingMode", "./BusyIndicator", "./types/TableMode", "./CheckBox", "./generated/i18n/i18n-defaults", "./generated/templates/TableTemplate.lit", "./generated/themes/Table.css"], function (_exports, _UI5Element, _customElement, _property, _event, _slot, _LitRenderer, _ResizeHandler, _ItemNavigation, _Integer, _NavigationMode, _Keys, _getNormalizedTarget, _getActiveElement, _TabbableElements, _AriaLabelHelper, _i18nBundle, _debounce, _isElementInView, _TableGrowingMode, _BusyIndicator, _TableMode, _CheckBox, _i18nDefaults, _TableTemplate, _Table) {
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
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _ItemNavigation = _interopRequireDefault(_ItemNavigation);
  _Integer = _interopRequireDefault(_Integer);
  _NavigationMode = _interopRequireDefault(_NavigationMode);
  _getNormalizedTarget = _interopRequireDefault(_getNormalizedTarget);
  _getActiveElement = _interopRequireDefault(_getActiveElement);
  _debounce = _interopRequireDefault(_debounce);
  _isElementInView = _interopRequireDefault(_isElementInView);
  _TableGrowingMode = _interopRequireDefault(_TableGrowingMode);
  _BusyIndicator = _interopRequireDefault(_BusyIndicator);
  _TableMode = _interopRequireDefault(_TableMode);
  _CheckBox = _interopRequireDefault(_CheckBox);
  _TableTemplate = _interopRequireDefault(_TableTemplate);
  _Table = _interopRequireDefault(_Table);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Table_1;

  // Ensure the dependency as it is being used in the renderer
  // Texts
  // Template
  // Styles
  const GROWING_WITH_SCROLL_DEBOUNCE_RATE = 250; // ms
  const PAGE_UP_DOWN_SIZE = 20;
  var TableFocusTargetElement;
  (function (TableFocusTargetElement) {
    TableFocusTargetElement["Row"] = "tableRow";
    TableFocusTargetElement["GroupRow"] = "tableGroupRow";
    TableFocusTargetElement["ColumnHeader"] = "columnHeader";
    TableFocusTargetElement["MoreButton"] = "moreButton";
  })(TableFocusTargetElement || (TableFocusTargetElement = {}));
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-table</code> component provides a set of sophisticated and convenient functions for responsive table design.
   * It provides a comprehensive set of features for displaying and dealing with vast amounts of data.
   * <br><br>
   * To render the <code>Table</code> properly, the order of the <code>columns</code> should match with the
   * order of the item <code>cells</code> in the <code>rows</code>.
   * <br><br>
   * Desktop and tablet devices are supported.
   * On tablets, special consideration should be given to the number of visible columns
   * and rows due to the limited performance of some devices.
   *
   * <h3>Selection</h3>
   * To benefit from the selection mechanism of <code>ui5-table</code> component, you can use the available selection modes:
   * <code>SingleSelect</code> and <code>MultiSelect</code>.
   * <br>
   * In additition to the used mode, you can also specify the <code>ui5-table-row</code> type choosing between
   * <code>Active</code> or <code>Inactive</code>.
   * <br><br>
   * In <code>SingleSelect</code> mode, you can select both an <code>Active</code> and <code>Inactive</code> row via mouse or
   * by pressing the <code>Space</code> or <code>Enter</code> keys.
   * <br>
   * In <code>MultiSelect</code> mode, you can select both an <code>Active</code> and <code>Inactive</code> row by pressing the
   * <code>Space</code> key when a row is on focus or via mouse click over the selection checkbox of the row.
   * In order to select all the available rows at once, you can use the selection checkbox presented in the table's header.
   * <br><br>
   * <b>Note:</b> Currently, when a column is shown as a pop-in, the visual indication for selection is not presented over it.
   *
   * <h3>Keyboard Handling</h3>
   *
   * <h4>Fast Navigation</h4>
   * This component provides a build in fast navigation group which can be used via <code>F6 / Shift + F6</code> or <code> Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up</code>.
   * In order to use this functionality, you need to import the following module:
   * <code>import "@ui5/webcomponents-base/dist/features/F6Navigation.js"</code>
   * <br><br>
   * Furthermore, you can interact with <code>ui5-table</code> via the following keys.
   * <br>
   *
   * <ul>
   * <li>[F7] - If focus is on an interactive control inside an item, moves focus to the corresponding item.</li>
   * <li>[CTRL]+[A] - Selects all items, if MultiSelect mode is enabled.</li>
   * <li>[HOME]/[END] - Focuses the first/last item.</li>
   * <li>[PAGEUP]/[PAGEDOWN] - Moves focus up/down by page size (20 items by default).</li>
   * <li>[ALT]+[DOWN]/[UP] - Switches focus between header, last focused item, and More button (if applies) in either direction.</li>
   * <li>[SHIFT]+[DOWN]/[UP] - Selects the next/previous item in a MultiSelect table, if the current item is selected (Range selection). Otherwise, deselects them (Range deselection).</li>
   * <li>[SHIFT]+[HOME]/[END] - Range selection to the first/last item of the List.</li>
   * <li>[CTRL]+[HOME]/[END] - Same behavior as HOME & END.</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Table.js";</code>
   * <br>
   * <code>import "@ui5/webcomponents/dist/TableColumn.js";</code> (for <code>ui5-table-column</code>)
   * <br>
   * <code>import "@ui5/webcomponents/dist/TableRow.js";</code> (for <code>ui5-table-row</code>)
   * <br>
   * <code>import "@ui5/webcomponents/dist/TableCell.js";</code> (for <code>ui5-table-cell</code>)
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Table
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-table
   * @appenddocs sap.ui.webc.main.TableColumn sap.ui.webc.main.TableRow sap.ui.webc.main.TableGroupRow sap.ui.webc.main.TableCell
   * @public
   */
  let Table = Table_1 = class Table extends _UI5Element.default {
    static async onDefine() {
      Table_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    constructor() {
      super();
      this.visibleColumns = []; // template loop should always have a defined array
      // The ItemNavigation requires each item to 1) have a "_tabIndex" property and 2) be either a UI5Element, or have an id property (to find it in the component's shadow DOM by)
      this._columnHeader = {
        id: `${this._id}-columnHeader`,
        _tabIndex: "0"
      };
      this._itemNavigation = new _ItemNavigation.default(this, {
        navigationMode: _NavigationMode.default.Vertical,
        affectedPropertiesNames: ["_columnHeader"],
        getItemsCallback: () => [this._columnHeader, ...this.rows],
        skipItemsSize: PAGE_UP_DOWN_SIZE
      });
      this._handleResize = this.popinContent.bind(this);
      this.fnOnRowFocused = this.onRowFocused.bind(this);
      this.fnHandleF7 = this._handleF7.bind(this);
      this.tableEndObserved = false;
      // Stores the last focused element within the table.
      this.lastFocusedElement = null;
      // Indicates whether the table is forwarding focus before or after the current table row.
      this._forwardingFocus = false;
      // Stores the last focused nested element index (within a table row) for F7 navigation.
      this._prevNestedElementIndex = 0;
    }
    onBeforeRendering() {
      const columnSettings = this.getColumnPropagationSettings();
      const columnSettingsString = JSON.stringify(columnSettings);
      const rowsCount = this.rows.length + 1;
      const selectedRows = this.selectedRows;
      this.rows.forEach((row, index) => {
        if (row._columnsInfoString !== columnSettingsString) {
          row._columnsInfo = columnSettings;
          row._columnsInfoString = JSON.stringify(row._columnsInfo);
        }
        row._ariaPosition = Table_1.i18nBundle.getText(_i18nDefaults.TABLE_ROW_POSITION, index + 2, rowsCount);
        row._busy = this.busy;
        row.removeEventListener("ui5-_focused", this.fnOnRowFocused);
        row.addEventListener("ui5-_focused", this.fnOnRowFocused);
        row.removeEventListener("ui5-f7-pressed", this.fnHandleF7);
        row.addEventListener("ui5-f7-pressed", this.fnHandleF7);
        row.mode = this.mode;
      });
      this.visibleColumns = this.columns.filter((column, index) => {
        return !this._hiddenColumns[index];
      });
      this._noDataDisplayed = !this.rows.length && !this.hideNoData;
      this.visibleColumnsCount = this.visibleColumns.length;
      if (this.isMultiSelect) {
        // we have to count the selection column as well
        this.visibleColumnsCount += 1;
      }
      this._allRowsSelected = selectedRows.length === this.rows.length;
      this._prevFocusedRow = this._prevFocusedRow || this.rows[0];
    }
    onAfterRendering() {
      if (this.growsOnScroll) {
        this.observeTableEnd();
      }
      this.checkTableInViewport();
    }
    onEnterDOM() {
      this.growingIntersectionObserver = this.getIntersectionObserver();
      _ResizeHandler.default.register(this.getDomRef(), this._handleResize);
      this._itemNavigation.setCurrentItem(this.rows.length ? this.rows[0] : this._columnHeader);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this.getDomRef(), this._handleResize);
      this.growingIntersectionObserver.disconnect();
      this.growingIntersectionObserver = null;
      this.tableEndObserved = false;
    }
    _onkeydown(e) {
      if ((0, _Keys.isTabNext)(e) || (0, _Keys.isTabPrevious)(e)) {
        this._handleTab(e);
      }
      if ((0, _Keys.isCtrlA)(e)) {
        e.preventDefault();
        this.isMultiSelect && this._selectAll();
      }
      if ((0, _Keys.isUpAlt)(e) || (0, _Keys.isDownAlt)(e)) {
        this._handleArrowAlt(e);
      }
      if (((0, _Keys.isUpShift)(e) || (0, _Keys.isDownShift)(e)) && this.isMultiSelect) {
        this._handleArrowNav(e);
      }
      if ((0, _Keys.isHomeCtrl)(e)) {
        e.preventDefault();
        this._itemNavigation._handleHome();
        this._itemNavigation._applyTabIndex();
        this._itemNavigation._focusCurrentItem();
      }
      if ((0, _Keys.isEndCtrl)(e)) {
        e.preventDefault();
        this._itemNavigation._handleEnd();
        this._itemNavigation._applyTabIndex();
        this._itemNavigation._focusCurrentItem();
      }
      if (((0, _Keys.isHomeShift)(e) || (0, _Keys.isEndShift)(e)) && this.isMultiSelect) {
        this._handleHomeEndSelection(e);
      }
    }
    _handleTab(e) {
      const isNext = (0, _Keys.isTabNext)(e);
      const target = (0, _getNormalizedTarget.default)(e.target);
      const targetType = this.getFocusedElementType(e.target);
      if (this.columnHeaderTabbables.includes(target)) {
        if (isNext && this.columnHeaderLastElement === target) {
          return this._focusNextElement();
        }
        return;
      }
      if (isNext && targetType === TableFocusTargetElement.ColumnHeader && !this.columnHeaderTabbables.length) {
        return this._focusNextElement();
      }
      if (targetType === TableFocusTargetElement.Row || !targetType) {
        return;
      }
      switch (targetType) {
        case TableFocusTargetElement.GroupRow:
          return isNext ? this._focusNextElement() : this._focusForwardElement(false);
        case TableFocusTargetElement.ColumnHeader:
          return !isNext && this._focusForwardElement(false);
        case TableFocusTargetElement.MoreButton:
          if (isNext) {
            this._focusForwardElement(true);
          } else {
            e.preventDefault();
            this.currentElement?.focus();
          }
      }
    }
    _focusNextElement() {
      if (!this.growsWithButton) {
        this._focusForwardElement(true);
      } else {
        this.morеBtn.focus();
      }
    }
    _handleArrowNav(e) {
      const isRowFocused = this.currentElement.localName === "tr";
      if (!isRowFocused) {
        return;
      }
      const previouslySelectedRows = this.selectedRows;
      const currentItem = this.currentItem;
      const currentItemIdx = this.currentItemIdx;
      const prevItemIdx = currentItemIdx - 1;
      const nextItemIdx = currentItemIdx + 1;
      const prevItem = this.rows[prevItemIdx];
      const nextItem = this.rows[nextItemIdx];
      const wasSelected = !!currentItem.selected;
      if ((0, _Keys.isUpShift)(e) && !prevItem || (0, _Keys.isDownShift)(e) && !nextItem) {
        return;
      }
      if ((0, _Keys.isUpShift)(e)) {
        currentItem.selected = currentItem.selected && !prevItem.selected;
        prevItem.selected = currentItem.selected || wasSelected && !currentItem.selected;
        prevItem.focus();
      }
      if ((0, _Keys.isDownShift)(e)) {
        currentItem.selected = currentItem.selected && !nextItem.selected;
        nextItem.selected = currentItem.selected || wasSelected && !currentItem.selected;
        nextItem.focus();
      }
      const selectedRows = this.selectedRows;
      this.fireEvent("selection-change", {
        selectedRows,
        previouslySelectedRows
      });
    }
    _handleHomeEndSelection(e) {
      const isRowFocused = this.currentElement.localName === "tr";
      if (!isRowFocused) {
        return;
      }
      const rows = this.rows;
      const previouslySelectedRows = this.selectedRows;
      const currentItemIdx = this.currentItemIdx;
      if ((0, _Keys.isHomeShift)(e)) {
        rows.slice(0, currentItemIdx + 1).forEach(item => {
          item.selected = true;
        });
        rows[0].focus();
      }
      if ((0, _Keys.isEndShift)(e)) {
        rows.slice(currentItemIdx).forEach(item => {
          item.selected = true;
        });
        rows[rows.length - 1].focus();
      }
      const selectedRows = this.selectedRows;
      this.fireEvent("selection-change", {
        selectedRows,
        previouslySelectedRows
      });
    }
    /**
     * Handles Alt + Up/Down.
     * Switches focus between column header, last focused item, and "More" button (if applicable).
     * @private
     * @param { KeyboardEvent } e
     */
    _handleArrowAlt(e) {
      const shouldMoveUp = (0, _Keys.isUpAlt)(e);
      const target = e.target;
      const focusedElementType = this.getFocusedElementType(target);
      if (shouldMoveUp) {
        switch (focusedElementType) {
          case TableFocusTargetElement.Row:
          case TableFocusTargetElement.GroupRow:
            this._prevFocusedRow = target;
            return this._onColumnHeaderClick(e);
          case TableFocusTargetElement.ColumnHeader:
            return this.morеBtn ? this.morеBtn.focus() : this._prevFocusedRow?.focus();
          case TableFocusTargetElement.MoreButton:
            return this._prevFocusedRow ? this._prevFocusedRow.focus() : this._onColumnHeaderClick(e);
        }
      } else {
        switch (focusedElementType) {
          case TableFocusTargetElement.Row:
          case TableFocusTargetElement.GroupRow:
            this._prevFocusedRow = target;
            return this.morеBtn ? this.morеBtn.focus() : this._onColumnHeaderClick(e);
          case TableFocusTargetElement.ColumnHeader:
            if (this._prevFocusedRow) {
              this._prevFocusedRow.focus();
            } else if (this.morеBtn) {
              this.morеBtn.focus();
            }
            return;
          case TableFocusTargetElement.MoreButton:
            return this._onColumnHeaderClick(e);
        }
      }
    }
    /**
     * Determines the type of the currently focused element.
     * @private
     * @param {object} element The DOM element
     * @returns {("columnHeader"|"tableRow"|"tableGroupRow"|"moreButton")} A string identifier
     */
    getFocusedElementType(element) {
      if (element === this.columnHeader) {
        return TableFocusTargetElement.ColumnHeader;
      }
      if (element === this.morеBtn) {
        return TableFocusTargetElement.MoreButton;
      }
      if (this.rows.includes(element)) {
        const isGroupRow = element.hasAttribute("ui5-table-group-row");
        return isGroupRow ? TableFocusTargetElement.GroupRow : TableFocusTargetElement.Row;
      }
    }
    /**
     * Toggles focus between the table row's root and the last focused nested element.
     * @private
     * @param { CustomEvent } e "ui5-f7-pressed"
     */
    _handleF7(e) {
      const row = e.detail.row;
      row._tabbables = (0, _TabbableElements.getTabbableElements)(row);
      const activeElement = (0, _getActiveElement.default)();
      const lastFocusedElement = row._tabbables[this._prevNestedElementIndex] || row._tabbables[0];
      const targetIndex = row._tabbables.indexOf(activeElement);
      if (!row._tabbables.length) {
        return;
      }
      if (activeElement === row.root) {
        lastFocusedElement.focus();
      } else if (targetIndex > -1) {
        this._prevNestedElementIndex = targetIndex;
        row.root.focus();
      }
    }
    _onfocusin(e) {
      const target = (0, _getNormalizedTarget.default)(e.target);
      if (!this._isForwardElement(target)) {
        this.lastFocusedElement = target;
        return;
      }
      if (!this._forwardingFocus) {
        if (this.lastFocusedElement) {
          this.lastFocusedElement.focus();
        } else {
          this.currentElement.focus();
        }
        e.stopImmediatePropagation();
      }
      this._forwardingFocus = false;
    }
    _onForwardBefore(e) {
      this.lastFocusedElement = e.detail.target;
      this._focusForwardElement(false);
      e.stopImmediatePropagation();
    }
    _onForwardAfter(e) {
      this.lastFocusedElement = e.detail.target;
      if (!this.growsWithButton) {
        this._focusForwardElement(true);
      } else {
        this.morеBtn.focus();
      }
    }
    _focusForwardElement(isAfter) {
      this._forwardingFocus = true;
      this.shadowRoot.querySelector(`#${this._id}-${isAfter ? "after" : "before"}`).focus();
    }
    _isForwardElement(element) {
      const elementId = element.id;
      const afterElement = this._getForwardElement(true);
      const beforeElement = this._getForwardElement(false);
      if (this._id === elementId || beforeElement && beforeElement.id === elementId) {
        return true;
      }
      return !!(afterElement && afterElement.id === elementId);
    }
    _getForwardElement(isAfter) {
      if (isAfter) {
        return this._getAfterForwardElement();
      }
      return this._getBeforeForwardElement();
    }
    _getAfterForwardElement() {
      if (!this._afterElement) {
        this._afterElement = this.shadowRoot.querySelector(`#${this._id}-after`);
      }
      return this._afterElement;
    }
    _getBeforeForwardElement() {
      if (!this._beforeElement) {
        this._beforeElement = this.shadowRoot.querySelector(`#${this._id}-before`);
      }
      return this._beforeElement;
    }
    onRowFocused(e) {
      this._itemNavigation.setCurrentItem(e.target);
    }
    _onColumnHeaderFocused() {
      this._itemNavigation.setCurrentItem(this._columnHeader);
    }
    _onColumnHeaderClick(e) {
      if (!e.target) {
        this.columnHeader.focus();
      }
      const target = (0, _getNormalizedTarget.default)(e.target);
      const isNestedElement = this.columnHeaderTabbables.includes(target);
      if (!isNestedElement) {
        this.columnHeader.focus();
      }
    }
    _onColumnHeaderKeydown(e) {
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
        this.isMultiSelect && this._selectAll();
      }
    }
    _onLoadMoreKeydown(e) {
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
        this._loadMoreActive = true;
      }
      if ((0, _Keys.isEnter)(e)) {
        this._onLoadMoreClick();
        this._loadMoreActive = true;
      }
    }
    _onLoadMoreKeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this._onLoadMoreClick();
      }
      this._loadMoreActive = false;
    }
    _onLoadMoreClick() {
      this.fireEvent("load-more");
    }
    observeTableEnd() {
      if (!this.tableEndObserved) {
        this.getIntersectionObserver().observe(this.tableEndDOM);
        this.tableEndObserved = true;
      }
    }
    onInteresection(entries) {
      if (entries.some(entry => entry.isIntersecting)) {
        (0, _debounce.default)(this.loadMore.bind(this), GROWING_WITH_SCROLL_DEBOUNCE_RATE);
      }
    }
    loadMore() {
      this.fireEvent("load-more");
    }
    _handleSingleSelect(e) {
      const row = this.getRowParent(e.target);
      if (!row) {
        return;
      }
      if (!row.selected) {
        const previouslySelectedRows = this.selectedRows;
        this.rows.forEach(item => {
          if (item.selected) {
            item.selected = false;
          }
        });
        row.selected = true;
        this.fireEvent("selection-change", {
          selectedRows: [row],
          previouslySelectedRows
        });
      }
    }
    _handleMultiSelect(e) {
      const row = this.getRowParent(e.target);
      const previouslySelectedRows = this.selectedRows;
      if (!row) {
        return;
      }
      row.selected = !row.selected;
      const selectedRows = this.selectedRows;
      if (selectedRows.length === this.rows.length) {
        this._allRowsSelected = true;
      } else {
        this._allRowsSelected = false;
      }
      this.fireEvent("selection-change", {
        selectedRows,
        previouslySelectedRows
      });
    }
    _handleSelect(e) {
      if (this.isSingleSelect) {
        this._handleSingleSelect(e);
        return;
      }
      if (this.isMultiSelect) {
        this._handleMultiSelect(e);
      }
    }
    _selectAll() {
      const bAllSelected = !this._allRowsSelected;
      const previouslySelectedRows = this.rows.filter(row => row.selected);
      this._allRowsSelected = bAllSelected;
      this.rows.forEach(row => {
        row.selected = bAllSelected;
      });
      const selectedRows = bAllSelected ? this.rows : [];
      this.fireEvent("selection-change", {
        selectedRows,
        previouslySelectedRows
      });
    }
    getRowParent(child) {
      if (child.hasAttribute("ui5-table-row")) {
        return child;
      }
      const parent = child.parentElement;
      if (!parent) {
        return;
      }
      if (parent.hasAttribute("ui5-table-row")) {
        return parent;
      }
      return this.getRowParent(parent);
    }
    get columnHeader() {
      const domRef = this.getDomRef();
      return domRef ? domRef.querySelector(`#${this._id}-columnHeader`) : null;
    }
    get morеBtn() {
      const domRef = this.getDomRef();
      if (this.growsWithButton && domRef) {
        return domRef.querySelector(`#${this._id}-growingButton`);
      }
      return null;
    }
    handleResize() {
      this.checkTableInViewport();
      this.popinContent();
    }
    checkTableInViewport() {
      this._inViewport = (0, _isElementInView.default)(this.getDomRef());
    }
    popinContent() {
      const clientRect = this.getDomRef().getBoundingClientRect();
      const tableWidth = clientRect.width;
      const hiddenColumns = [];
      const visibleColumnsIndexes = [];
      // store the hidden columns
      this.columns.forEach((column, index) => {
        if (tableWidth < column.minWidth && column.minWidth !== Infinity) {
          hiddenColumns[index] = {
            index,
            popinText: column.popinText,
            demandPopin: column.demandPopin
          };
        } else {
          visibleColumnsIndexes.push(index);
        }
      });
      if (visibleColumnsIndexes.length) {
        if (!this.isMultiSelect) {
          this.columns[visibleColumnsIndexes[0]].first = true;
        }
        this.columns[visibleColumnsIndexes[visibleColumnsIndexes.length - 1]].last = true;
      }
      const hiddenColumnsChange = this._hiddenColumns.length !== hiddenColumns.length || this._hiddenColumns.some((column, index) => column !== hiddenColumns[index]);
      // invalidate only if hidden columns count has changed
      if (hiddenColumnsChange) {
        this._hiddenColumns = hiddenColumns;
        if (hiddenColumns.length) {
          this.fireEvent("popin-change", {
            poppedColumns: this._hiddenColumns
          });
        }
      }
    }
    /**
     * Gets settings to be propagated from columns to rows.
     *
     * @returns { array }
     * @memberof Table
     */
    getColumnPropagationSettings() {
      return this.columns.map((column, index) => {
        return {
          index,
          minWidth: column.minWidth,
          demandPopin: column.demandPopin,
          text: column.textContent,
          popinText: column.popinText,
          popinDisplay: column.popinDisplay,
          visible: !this._hiddenColumns[index]
        };
      }, this);
    }
    getIntersectionObserver() {
      if (!this.growingIntersectionObserver) {
        this.growingIntersectionObserver = new IntersectionObserver(this.onInteresection.bind(this), {
          root: document,
          rootMargin: "0px",
          threshold: 1.0
        });
      }
      return this.growingIntersectionObserver;
    }
    get styles() {
      return {
        busy: {
          position: this.busyIndPosition
        }
      };
    }
    get growsWithButton() {
      return this.growing === _TableGrowingMode.default.Button;
    }
    get growsOnScroll() {
      return this.growing === _TableGrowingMode.default.Scroll;
    }
    get _growingButtonText() {
      return this.growingButtonText || Table_1.i18nBundle.getText(_i18nDefaults.LOAD_MORE_TEXT);
    }
    get ariaLabelText() {
      const rowsCount = this.rows.length + 1;
      const headerRowText = Table_1.i18nBundle.getText(_i18nDefaults.TABLE_HEADER_ROW_INFORMATION, rowsCount);
      const columnsTitle = this.columns.map(column => {
        return column.textContent.trim();
      }).join(" ");
      return `${headerRowText} ${columnsTitle}`;
    }
    get tableAriaLabelText() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }
    get ariaLabelSelectAllText() {
      return Table_1.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_SELECT_ALL_CHECKBOX);
    }
    get loadMoreAriaLabelledBy() {
      if (this.moreDataText) {
        return `${this._id}-growingButton-text ${this._id}-growingButton-subtext`;
      }
      return `${this._id}-growingButton-text`;
    }
    get tableEndDOM() {
      return this.shadowRoot.querySelector(".ui5-table-end-marker");
    }
    get busyIndPosition() {
      return this._inViewport ? "absolute" : "sticky";
    }
    get isMultiSelect() {
      return this.mode === _TableMode.default.MultiSelect;
    }
    get isSingleSelect() {
      return this.mode === _TableMode.default.SingleSelect;
    }
    get selectedRows() {
      return this.rows.filter(row => row.selected);
    }
    get currentItemIdx() {
      return this.rows.indexOf(this.currentItem);
    }
    get currentItem() {
      return this.getRootNode().activeElement;
    }
    get currentElement() {
      return this._itemNavigation._getCurrentItem();
    }
    get columnHeaderTabbables() {
      return this.columnHeader ? (0, _TabbableElements.getTabbableElements)(this.columnHeader) : [];
    }
    get columnHeaderLastElement() {
      return this.columnHeader && (0, _TabbableElements.getLastTabbableElement)(this.columnHeader);
    }
  };
  __decorate([(0, _property.default)()], Table.prototype, "noDataText", void 0);
  __decorate([(0, _property.default)()], Table.prototype, "growingButtonText", void 0);
  __decorate([(0, _property.default)()], Table.prototype, "growingButtonSubtext", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Table.prototype, "hideNoData", void 0);
  __decorate([(0, _property.default)({
    type: _TableGrowingMode.default,
    defaultValue: _TableGrowingMode.default.None
  })], Table.prototype, "growing", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Table.prototype, "busy", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 1000
  })], Table.prototype, "busyDelay", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Table.prototype, "stickyColumnHeader", void 0);
  __decorate([(0, _property.default)({
    type: _TableMode.default,
    defaultValue: _TableMode.default.None
  })], Table.prototype, "mode", void 0);
  __decorate([(0, _property.default)({
    defaultValue: undefined
  })], Table.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    defaultValue: ""
  })], Table.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], Table.prototype, "_hiddenColumns", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Table.prototype, "_noDataDisplayed", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Table.prototype, "_loadMoreActive", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], Table.prototype, "_columnHeader", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Table.prototype, "_inViewport", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Table.prototype, "_allRowsSelected", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true,
    individualSlots: true,
    invalidateOnChildChange: true
  })], Table.prototype, "rows", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    individualSlots: true,
    invalidateOnChildChange: {
      properties: true,
      slots: false
    }
  })], Table.prototype, "columns", void 0);
  Table = Table_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-table",
    fastNavigation: true,
    styles: _Table.default,
    renderer: _LitRenderer.default,
    template: _TableTemplate.default,
    dependencies: [_BusyIndicator.default, _CheckBox.default]
  })
  /** Fired when a row in <code>Active</code> mode is clicked or <code>Enter</code> key is pressed.
  *
  * @event sap.ui.webc.main.Table#row-click
  * @param {HTMLElement} row the activated row.
  * @public
  */, (0, _event.default)("row-click", {
    detail: {
      row: {
        type: HTMLElement
      }
    }
  })
  /**
  * Fired when <code>ui5-table-column</code> is shown as a pop-in instead of hiding it.
  *
  * @event sap.ui.webc.main.Table#popin-change
  * @param {Array} poppedColumns popped-in columns.
  * @since 1.0.0-rc.6
  * @public
  */, (0, _event.default)("popin-change", {
    detail: {
      poppedColumns: {
        type: Array
      }
    }
  })
  /**
  * Fired when the user presses the <code>More</code> button or scrolls to the table's end.
  * <br><br>
  *
  * <b>Note:</b> The event will be fired if <code>growing</code> is set to <code>Button</code> or <code>Scroll</code>.
  * @event sap.ui.webc.main.Table#load-more
  * @public
  * @since 1.0.0-rc.11
  */, (0, _event.default)("load-more")
  /**
  * Fired when selection is changed by user interaction
  * in <code>SingleSelect</code> and <code>MultiSelect</code> modes.
  *
  * @event sap.ui.webc.main.Table#selection-change
  * @param {Array} selectedRows An array of the selected rows.
  * @param {Array} previouslySelectedRows An array of the previously selected rows.
  * @public
  * @since 1.0.0-rc.15
  */, (0, _event.default)("selection-change", {
    detail: {
      selectedRows: {
        type: Array
      },
      previouslySelectedRows: {
        type: Array
      }
    }
  })], Table);
  Table.define();
  var _default = Table;
  _exports.default = _default;
});