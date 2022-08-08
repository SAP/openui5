sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/types/NavigationMode", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/util/getNormalizedTarget", "sap/ui/webc/common/thirdparty/base/util/getActiveElement", "sap/ui/webc/common/thirdparty/base/util/TabbableElements", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/util/debounce", "sap/ui/webc/common/thirdparty/base/util/isElementInView", "./types/TableGrowingMode", "./BusyIndicator", "./types/TableMode", "./CheckBox", "./generated/i18n/i18n-defaults", "./generated/templates/TableTemplate.lit", "./generated/themes/Table.css"], function (_exports, _UI5Element, _LitRenderer, _ResizeHandler, _ItemNavigation, _Integer, _NavigationMode, _Keys, _getNormalizedTarget, _getActiveElement, _TabbableElements, _AriaLabelHelper, _i18nBundle, _debounce, _isElementInView, _TableGrowingMode, _BusyIndicator, _TableMode, _CheckBox, _i18nDefaults, _TableTemplate, _Table) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
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

  // Ensure the dependency as it is being used in the renderer
  // Texts
  // Template
  // Styles
  const GROWING_WITH_SCROLL_DEBOUNCE_RATE = 250; // ms

  const PAGE_UP_DOWN_SIZE = 20;
  /**
   * @public
   */

  const metadata = {
    tag: "ui5-table",
    managedSlots: true,
    fastNavigation: true,
    slots:
    /** @lends sap.ui.webcomponents.main.Table.prototype */
    {
      /**
       * Defines the component rows.
       * <br><br>
       * <b>Note:</b> Use <code>ui5-table-row</code> for the intended design.
       *
       * @type {sap.ui.webcomponents.main.ITableRow[]}
       * @slot rows
       * @public
       */
      "default": {
        propertyName: "rows",
        type: HTMLElement,
        individualSlots: true,
        invalidateOnChildChange: true
      },

      /**
       * Defines the configuration for the columns of the component.
       * <br><br>
       * <b>Note:</b> Use <code>ui5-table-column</code> for the intended design.
       *
       * @type {sap.ui.webcomponents.main.ITableColumn[]}
       * @slot
       * @public
       */
      columns: {
        type: HTMLElement,
        individualSlots: true,
        invalidateOnChildChange: {
          properties: true,
          slots: false
        }
      }
    },
    properties:
    /** @lends sap.ui.webcomponents.main.Table.prototype */
    {
      /**
       * Defines the text that will be displayed when there is no data and <code>hideNoData</code> is not present.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      noDataText: {
        type: String
      },

      /**
       * Defines the text that will be displayed inside the growing button at the bottom of the table,
       * meant for loading more rows upon press.
       *
       * <br><br>
       * <b>Note:</b> If not specified a built-in text will be displayed.
       * <br>
       * <b>Note:</b> This property takes effect if <code>growing</code> is set to <code>Button</code>.
       *
       * @type {string}
       * @defaultvalue ""
       * @since 1.0.0-rc.15
       * @public
       */
      growingButtonText: {
        type: String
      },

      /**
       * Defines the subtext that will be displayed under the <code>growingButtonText</code>.
       *
       * <br><br>
       * <b>Note:</b> This property takes effect if <code>growing</code> is set to <code>Button</code>.
       *
       * @type {string}
       * @defaultvalue ""
       * @since 1.0.0-rc.15
       * @public
       */
      growingButtonSubtext: {
        type: String
      },

      /**
       * Defines if the value of <code>noDataText</code> will be diplayed when there is no rows present in the table.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.0.0-rc.15
       */
      hideNoData: {
        type: Boolean
      },

      /**
       * Defines whether the table will have growing capability either by pressing a <code>More</code> button,
       * or via user scroll. In both cases <code>load-more</code> event is fired.
       * <br><br>
       *
       * Available options:
       * <br><br>
       * <code>Button</code> - Shows a <code>More</code> button at the bottom of the table, pressing of which triggers the <code>load-more</code> event.
       * <br>
       * <code>Scroll</code> - The <code>load-more</code> event is triggered when the user scrolls to the bottom of the table;
       * <br>
       * <code>None</code> (default) - The growing is off.
       * <br><br>
       *
       * <b>Restrictions:</b> <code>growing="Scroll"</code> is not supported for Internet Explorer,
       * and the component will fallback to <code>growing="Button"</code>.
       * @type {TableGrowingMode}
       * @defaultvalue "None"
       * @since 1.0.0-rc.12
       * @public
       */
      growing: {
        type: _TableGrowingMode.default,
        defaultValue: _TableGrowingMode.default.None
      },

      /**
       * Defines if the table is in busy state.
       * <b>
       *
       * In this state the component's opacity is reduced
       * and busy indicator is displayed at the bottom of the table.
       * @type {boolean}
       * @defaultvalue false
       * @since 1.0.0-rc.12
       * @public
      */
      busy: {
        type: Boolean
      },

      /**
       * Defines the delay in milliseconds, after which the busy indicator will show up for this component.
       *
       * @type {Integer}
       * @defaultValue 1000
       * @public
       */
      busyDelay: {
        type: _Integer.default,
        defaultValue: 1000
      },

      /**
       * Determines whether the column headers remain fixed at the top of the page during
       * vertical scrolling as long as the Web Component is in the viewport.
       * <br><br>
       * <b>Restrictions:</b>
       * <ul>
       * <li>Browsers that do not support this feature:
       * <ul>
       * <li>Internet Explorer</li>
       * <li>Microsoft Edge lower than version 41 (EdgeHTML 16)</li>
       * <li>Mozilla Firefox lower than version 59</li>
       * </ul>
       * </li>
       * <li>Scrolling behavior:
       * <ul>
       * <li>If the Web Component is placed in layout containers that have the <code>overflow: hidden</code>
       * or <code>overflow: auto</code> style definition, this can
       * prevent the sticky elements of the Web Component from becoming fixed at the top of the viewport.</li>
       * </ul>
       * </li>
       * </ul>
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      stickyColumnHeader: {
        type: Boolean
      },

      /**
       * Defines the mode of the component.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>MultiSelect</code></li>
       * <li><code>SingleSelect</code></li>
       * <li><code>None</code></li>
       * <ul>
       * @type {TableMode}
       * @defaultvalue "None"
       * @since 1.0.0-rc.15
       * @public
       */
      mode: {
        type: _TableMode.default,
        defaultValue: _TableMode.default.None
      },

      /**
       * Defines the accessible aria name of the component.
       *
       * @type {string}
       * @defaultvalue: ""
       * @public
       * @since 1.3.0
       */
      accessibleName: {
        type: String,
        defaultValue: undefined
      },

      /**
       * Receives id(or many ids) of the elements that label the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.3.0
       */
      accessibleNameRef: {
        type: String,
        defaultValue: ""
      },
      _hiddenColumns: {
        type: Object,
        multiple: true
      },
      _noDataDisplayed: {
        type: Boolean
      },

      /**
       * Defines the active state of the <code>More</code> button.
       * @private
       */
      _loadMoreActive: {
        type: Boolean
      },

      /**
       * Used to represent the table column header for the purpose of the item navigation as it does not work with DOM objects directly
       * @private
       */
      _columnHeader: {
        type: Object
      },

      /**
       * Defines if the entire table is in view port.
       * @private
       */
      _inViewport: {
        type: Boolean
      },

      /**
       * Defines whether all rows are selected or not when table is in MultiSelect mode.
       * @type {boolean}
       * @defaultvalue false
       * @since 1.0.0-rc.15
       * @private
       */
      _allRowsSelected: {
        type: Boolean
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.Table.prototype */
    {
      /**
       * Fired when a row in <code>Active</code> mode is clicked or <code>Enter</code> key is pressed.
       *
       * @event sap.ui.webcomponents.main.Table#row-click
       * @param {HTMLElement} row the activated row.
       * @public
       */
      "row-click": {
        detail: {
          row: {
            type: HTMLElement
          }
        }
      },

      /**
       * Fired when <code>ui5-table-column</code> is shown as a pop-in instead of hiding it.
       *
       * @event sap.ui.webcomponents.main.Table#popin-change
       * @param {Array} poppedColumns popped-in columns.
       * @since 1.0.0-rc.6
       * @public
       */
      "popin-change": {
        detail: {
          poppedColumns: {}
        }
      },

      /**
       * Fired when the user presses the <code>More</code> button or scrolls to the table's end.
       * <br><br>
       *
       * <b>Note:</b> The event will be fired if <code>growing</code> is set to <code>Button</code> or <code>Scroll</code>.
       * @event sap.ui.webcomponents.main.Table#load-more
       * @public
       * @since 1.0.0-rc.11
       */
      "load-more": {},

      /**
       * Fired when selection is changed by user interaction
       * in <code>SingleSelect</code> and <code>MultiSelect</code> modes.
       *
       * @event sap.ui.webcomponents.main.Table#selection-change
       * @param {Array} selectedRows An array of the selected rows.
       * @param {Array} previouslySelectedRows An array of the previously selected rows.
       * @public
       * @since 1.0.0-rc.15
       */
      "selection-change": {
        detail: {
          selectedRows: {
            type: Array
          },
          previouslySelectedRows: {
            type: Array
          }
        }
      }
    }
  };
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
   * @alias sap.ui.webcomponents.main.Table
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-table
   * @appenddocs TableColumn TableRow TableGroupRow TableCell
   * @public
   */

  class Table extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get styles() {
      return _Table.default;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _TableTemplate.default;
    }

    static get dependencies() {
      return [_BusyIndicator.default, _CheckBox.default];
    }

    static async onDefine() {
      Table.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

    constructor() {
      super(); // The ItemNavigation requires each item to 1) have a "_tabIndex" property and 2) be either a UI5Element, or have an id property (to find it in the component's shadow DOM by)

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
      this.fnOnRowFocused = this.onRowFocused.bind(this);
      this._handleResize = this.popinContent.bind(this);
      this.fnHandleF7 = this._handleF7.bind(this);
      this.tableEndObserved = false;
      this.addEventListener("ui5-selection-requested", this._handleSelect.bind(this));
      this.addEventListener("ui5-_forward-after", this._onForwardAfter.bind(this));
      this.addEventListener("ui5-_forward-before", this._onForwardBefore.bind(this)); // Stores the last focused element within the table.

      this.lastFocusedElement = null; // Indicates whether the table is forwarding focus before or after the current table row.

      this._forwardingFocus = false; // Stores the last focused nested element index (within a table row) for F7 navigation.

      this._prevNestedElementIndex = 0;
    }

    onBeforeRendering() {
      const columnSettings = this.getColumnPropagationSettings();
      const columnSettingsString = JSON.stringify(columnSettings);
      const rowsCount = this.rows.length;
      const selectedRows = this.selectedRows;
      this.rows.forEach((row, index) => {
        if (row._columnsInfoString !== columnSettingsString) {
          row._columnsInfo = columnSettings;
          row._columnsInfoString = JSON.stringify(row._columnsInfo);
        }

        row._ariaPosition = Table.i18nBundle.getText(_i18nDefaults.TABLE_ROW_POSITION, index + 1, rowsCount);
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

    _onkeydown(event) {
      if ((0, _Keys.isTabNext)(event) || (0, _Keys.isTabPrevious)(event)) {
        this._handleTab(event);
      }

      if ((0, _Keys.isCtrlA)(event)) {
        event.preventDefault();
        this.isMultiSelect && this._selectAll(event);
      }

      if ((0, _Keys.isUpAlt)(event) || (0, _Keys.isDownAlt)(event)) {
        this._handleArrowAlt(event);
      }

      if (((0, _Keys.isUpShift)(event) || (0, _Keys.isDownShift)(event)) && this.isMultiSelect) {
        this._handleArrowNav(event);
      }

      if ((0, _Keys.isHomeCtrl)(event)) {
        event.preventDefault();

        this._itemNavigation._handleHome(event);

        this._itemNavigation._applyTabIndex();

        this._itemNavigation._focusCurrentItem();
      }

      if ((0, _Keys.isEndCtrl)(event)) {
        event.preventDefault();

        this._itemNavigation._handleEnd(event);

        this._itemNavigation._applyTabIndex();

        this._itemNavigation._focusCurrentItem();
      }

      if (((0, _Keys.isHomeShift)(event) || (0, _Keys.isEndShift)(event)) && this.isMultiSelect) {
        this._handleHomeEndSelection(event);
      }
    }

    _handleTab(event) {
      const isNext = (0, _Keys.isTabNext)(event);
      const target = (0, _getNormalizedTarget.default)(event.target);
      const targetType = this.getFocusedElementType(event.target);

      if (this.columnHeaderTabbables.includes(target)) {
        if (isNext && this.columnHeaderLastElement === target) {
          return this._focusNextElement(event);
        }

        return;
      }

      if (isNext && targetType === "columnHeader" && !this.columnHeaderTabbables.length) {
        return this._focusNextElement(event);
      }

      if (targetType === "tableRow" || !targetType) {
        return;
      }

      switch (targetType) {
        case "tableGroupRow":
          return isNext ? this._focusNextElement(event) : this._focusForwardElement(event, false);

        case "columnHeader":
          return !isNext && this._focusForwardElement(event, false);

        case "moreButton":
          if (isNext) {
            this._focusForwardElement(event, true);
          } else {
            event.preventDefault();
            this.currentElement.focus();
          }

      }
    }

    _focusNextElement(event) {
      if (!this.growsWithButton) {
        this._focusForwardElement(event, true);
      } else {
        this.morеBtn.focus();
      }
    }

    _handleArrowNav(event) {
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
      const wasSelected = currentItem.selected;

      if ((0, _Keys.isUpShift)(event) && !prevItem || (0, _Keys.isDownShift)(event) && !nextItem) {
        return;
      }

      if ((0, _Keys.isUpShift)(event)) {
        currentItem.selected = currentItem.selected && !prevItem.selected;
        prevItem.selected = currentItem.selected || wasSelected && !currentItem.selected;
        prevItem.focus();
      }

      if ((0, _Keys.isDownShift)(event)) {
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

    _handleHomeEndSelection(event) {
      const isRowFocused = this.currentElement.localName === "tr";

      if (!isRowFocused) {
        return;
      }

      const rows = this.rows;
      const previouslySelectedRows = this.selectedRows;
      const currentItemIdx = this.currentItemIdx;

      if ((0, _Keys.isHomeShift)(event)) {
        rows.slice(0, currentItemIdx + 1).forEach(item => {
          item.selected = true;
        });
        rows[0].focus();
      }

      if ((0, _Keys.isEndShift)(event)) {
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
     * @param {CustomEvent} event
     */


    _handleArrowAlt(event) {
      const shouldMoveUp = (0, _Keys.isUpAlt)(event);
      const focusedElementType = this.getFocusedElementType(event.target);

      if (shouldMoveUp) {
        switch (focusedElementType) {
          case "tableRow":
          case "tableGroupRow":
            this._prevFocusedRow = event.target;
            return this._onColumnHeaderClick(event);

          case "columnHeader":
            return this.morеBtn ? this.morеBtn.focus() : this._prevFocusedRow.focus();

          case "moreButton":
            return this._prevFocusedRow ? this._prevFocusedRow.focus() : this._onColumnHeaderClick(event);
        }
      } else {
        switch (focusedElementType) {
          case "tableRow":
          case "tableGroupRow":
            this._prevFocusedRow = event.target;
            return this.morеBtn ? this.morеBtn.focus() : this._onColumnHeaderClick(event);

          case "columnHeader":
            if (this._prevFocusedRow) {
              this._prevFocusedRow.focus();
            } else if (this.morеBtn) {
              this.morеBtn.focus();
            }

            return;

          case "moreButton":
            return this._onColumnHeaderClick(event);
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
        return "columnHeader";
      }

      if (element === this.morеBtn) {
        return "moreButton";
      }

      if (this.rows.includes(element)) {
        const isGroupRow = element.hasAttribute("ui5-table-group-row");
        return isGroupRow ? "tableGroupRow" : "tableRow";
      }
    }
    /**
     * Toggles focus between the table row's root and the last focused nested element.
     * @private
     * @param {CustomEvent} event "ui5-f7-pressed"
     */


    _handleF7(event) {
      const row = event.detail.row;
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

    _onfocusin(event) {
      const target = (0, _getNormalizedTarget.default)(event.target);

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

        event.stopImmediatePropagation();
      }

      this._forwardingFocus = false;
    }

    _onForwardBefore(event) {
      this.lastFocusedElement = event.detail.target;

      this._focusForwardElement(event, false);

      event.stopImmediatePropagation();
    }

    _onForwardAfter(event) {
      this.lastFocusedElement = event.detail.target;

      if (!this.growsWithButton) {
        this._focusForwardElement(event, true);
      } else {
        this.morеBtn.focus();
      }
    }

    _focusForwardElement(event, isAfter) {
      this._forwardingFocus = true;
      this.shadowRoot.querySelector(`#${this._id}-${isAfter ? "after" : "before"}`).focus();
    }

    _isForwardElement(node) {
      const nodeId = node.id;

      const afterElement = this._getForwardElement(true);

      const beforeElement = this._getForwardElement(false);

      if (this._id === nodeId || beforeElement && beforeElement.id === nodeId) {
        return true;
      }

      return afterElement && afterElement.id === nodeId;
    }

    _getForwardElement(isAfter) {
      const dir = isAfter ? "after" : "before";

      if (!this[`_${dir}Element`]) {
        this[`_${dir}Element`] = this.shadowRoot.querySelector(`#${this._id}-${dir}`);
      }

      return this[`_${dir}Element`];
    }

    onRowFocused(event) {
      this._itemNavigation.setCurrentItem(event.target);
    }

    _onColumnHeaderFocused(event) {
      this._itemNavigation.setCurrentItem(this._columnHeader);
    }

    _onColumnHeaderClick(event) {
      if (!event.target) {
        this.columnHeader.focus();
      }

      const target = (0, _getNormalizedTarget.default)(event.target);
      const isNestedElement = this.columnHeaderTabbables.includes(target);

      if (!isNestedElement) {
        this.columnHeader.focus();
      }
    }

    _onColumnHeaderKeydown(event) {
      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
        this.isMultiSelect && this._selectAll();
      }
    }

    _onLoadMoreKeydown(event) {
      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
        this._loadMoreActive = true;
      }

      if ((0, _Keys.isEnter)(event)) {
        this._onLoadMoreClick();

        this._loadMoreActive = true;
      }
    }

    _onLoadMoreKeyup(event) {
      if ((0, _Keys.isSpace)(event)) {
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

    _handleSingleSelect(event) {
      const row = this.getRowParent(event.target);

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

    _handleMultiSelect(event) {
      const row = this.getRowParent(event.target);
      const previouslySelectedRows = this.selectedRows;
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

    _handleSelect(event) {
      this[`_handle${this.mode}`](event);
    }

    _selectAll(event) {
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
      const parent = child.parentElement;

      if (child.hasAttribute("ui5-table-row")) {
        return child;
      }

      if (parent && parent.hasAttribute("ui5-table-row")) {
        return parent;
      }

      this.getRowParent(parent);
    }

    get columnHeader() {
      return this.getDomRef() && this.getDomRef().querySelector(`#${this._id}-columnHeader`);
    }

    get morеBtn() {
      return this.growsWithButton && this.getDomRef() && this.getDomRef().querySelector(`#${this._id}-growingButton`);
    }

    handleResize(event) {
      this.checkTableInViewport();
      this.popinContent(event);
    }

    checkTableInViewport() {
      this._inViewport = (0, _isElementInView.default)(this.getDomRef());
    }

    popinContent(_event) {
      const clientRect = this.getDomRef().getBoundingClientRect();
      const tableWidth = clientRect.width;
      const hiddenColumns = [];
      const visibleColumnsIndexes = []; // store the hidden columns

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
      } // invalidate only if hidden columns count has changed


      if (this._hiddenColumns.length !== hiddenColumns.length) {
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
     * @returns {object}
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
      return this.growingButtonText || Table.i18nBundle.getText(_i18nDefaults.LOAD_MORE_TEXT);
    }

    get ariaLabelText() {
      const headerRowText = Table.i18nBundle.getText(_i18nDefaults.TABLE_HEADER_ROW_TEXT);
      const columnsTitle = this.columns.map(column => {
        return column.textContent.trim();
      }).join(" ");
      return `${headerRowText} ${columnsTitle}`;
    }

    get tableAriaLabelText() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }

    get ariaLabelSelectAllText() {
      return Table.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_SELECT_ALL_CHECKBOX);
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
      return this.mode === "MultiSelect";
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
      return (0, _TabbableElements.getTabbableElements)(this.columnHeader);
    }

    get columnHeaderLastElement() {
      return (0, _TabbableElements.getLastTabbableElement)(this.columnHeader);
    }

  }

  Table.define();
  var _default = Table;
  _exports.default = _default;
});