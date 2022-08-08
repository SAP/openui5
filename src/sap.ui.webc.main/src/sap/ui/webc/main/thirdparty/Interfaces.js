sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.ITreeItem = _exports.IToken = _exports.ITableRow = _exports.ITableColumn = _exports.ITableCell = _exports.ITab = _exports.ISelectOption = _exports.ISegmentedButtonItem = _exports.IMultiComboBoxItem = _exports.IMenuItem = _exports.IListItem = _exports.IInputSuggestionItem = _exports.IInput = _exports.IIcon = _exports.IComboBoxItem = _exports.IColorPaletteItem = _exports.ICalendarDate = _exports.IButton = _exports.IBreadcrumbsItem = _exports.IAvatar = void 0;

  /**
   * Interface for components that represent an avatar and may be slotted in numerous higher-order components such as <code>ui5-avatar-group</code>
   *
   * @name sap.ui.webcomponents.main.IAvatar
   * @interface
   * @public
   */
  const IAvatar = "sap.ui.webcomponents.main.IAvatar";
  /**
   * Interface for components that may be slotted inside <code>ui5-breadcrumbs</code> as options
   *
   * @name sap.ui.webcomponents.main.IBreadcrumbsItem
   * @interface
   * @public
   */

  _exports.IAvatar = IAvatar;
  const IBreadcrumbsItem = "sap.ui.webcomponents.main.IBreadcrumbsItem";
  /**
   * Interface for components that may be used as a button inside numerous higher-order components
   *
   * @name sap.ui.webcomponents.main.IButton
   * @interface
   * @public
   */

  _exports.IBreadcrumbsItem = IBreadcrumbsItem;
  const IButton = "sap.ui.webcomponents.main.IButton";
  /**
   * Interface for components that may be used as dates inside <code>ui5-calendar</code>
   *
   * @name sap.ui.webcomponents.main.ICalendarDate
   * @interface
   * @public
   */

  _exports.IButton = IButton;
  const ICalendarDate = "sap.ui.webcomponents.main.ICalendarDate";
  /**
   * Interface for components that may be slotted inside a <code>ui5-combobox</code>
   *
   * @name sap.ui.webcomponents.main.IComboBoxItem
   * @interface
   * @public
   */

  _exports.ICalendarDate = ICalendarDate;
  const IComboBoxItem = "sap.ui.webcomponents.main.IComboBoxItem";
  /**
   * Interface for components that may be used inside a <code>ui5-color-palette</code> or <code>ui5-color-palette-popover</code>
   *
   * @name sap.ui.webcomponents.main.IColorPaletteItem
   * @interface
   * @public
   */

  _exports.IComboBoxItem = IComboBoxItem;
  const IColorPaletteItem = "sap.ui.webcomponents.main.IColorPaletteItem";
  /**
   * Interface for components that represent an icon, usable in numerous higher-order components
   *
   * @name sap.ui.webcomponents.main.IIcon
   * @interface
   * @public
   */

  _exports.IColorPaletteItem = IColorPaletteItem;
  const IIcon = "sap.ui.webcomponents.main.IIcon";
  /**
   * Interface for components that represent an input, usable in numerous higher-order components
   *
   * @name sap.ui.webcomponents.main.IInput
   * @interface
   * @public
   */

  _exports.IIcon = IIcon;
  const IInput = "sap.ui.webcomponents.main.IInput";
  /**
   * Interface for components that represent a suggestion item, usable in <code>ui5-input</code>
   *
   * @name sap.ui.webcomponents.main.IInputSuggestionItem
   * @interface
   * @public
   */

  _exports.IInput = IInput;
  const IInputSuggestionItem = "sap.ui.webcomponents.main.IInputSuggestionItem";
  /**
   * Interface for components that may be slotted inside a <code>ui5-list</code> as items
   *
   * @name sap.ui.webcomponents.main.IListItem
   * @interface
   * @public
   */

  _exports.IInputSuggestionItem = IInputSuggestionItem;
  const IListItem = "sap.ui.webcomponents.main.IListItem";
  /**
   * Interface for components that may be slotted inside <code>ui5-menu</code> as items
   *
   * @name sap.ui.webcomponents.main.IMenuItem
   * @interface
   * @public
   */

  _exports.IListItem = IListItem;
  const IMenuItem = "sap.ui.webcomponents.main.IMenuItem";
  /**
   * Interface for components that may be slotted inside a <code>ui5-multi-combobox</code> as items
   *
   * @name sap.ui.webcomponents.main.IMultiComboBoxItem
   * @interface
   * @public
   */

  _exports.IMenuItem = IMenuItem;
  const IMultiComboBoxItem = "sap.ui.webcomponents.main.IMultiComboBoxItem";
  /**
   * Interface for components that may be slotted inside <code>ui5-segmented-button</code> as items
   *
   * @name sap.ui.webcomponents.main.ISegmentedButtonItem
   * @interface
   * @public
   */

  _exports.IMultiComboBoxItem = IMultiComboBoxItem;
  const ISegmentedButtonItem = "sap.ui.webcomponents.main.ISegmentedButtonItem";
  /**
   * Interface for components that may be slotted inside <code>ui5-select</code> as options
   *
   * @name sap.ui.webcomponents.main.ISelectOption
   * @interface
   * @public
   */

  _exports.ISegmentedButtonItem = ISegmentedButtonItem;
  const ISelectOption = "sap.ui.webcomponents.main.ISelectOption";
  /**
   * Interface for components that may be slotted inside <code>ui5-tabcontainer</code>
   *
   * @name sap.ui.webcomponents.main.ITab
   * @interface
   * @public
   */

  _exports.ISelectOption = ISelectOption;
  const ITab = "sap.ui.webcomponents.main.ITab";
  /**
   * Interface for components that may be slotted inside a <code>ui5-table</code> as rows
   *
   * @name sap.ui.webcomponents.main.ITableRow
   * @interface
   * @public
   */

  _exports.ITab = ITab;
  const ITableRow = "sap.ui.webcomponents.main.ITableRow";
  /**
   * Interface for components that may be slotted inside a <code>ui5-table</code> as columns
   *
   * @name sap.ui.webcomponents.main.ITableColumn
   * @interface
   * @public
   */

  _exports.ITableRow = ITableRow;
  const ITableColumn = "sap.ui.webcomponents.main.ITableColumn";
  /**
   * Interface for components that may be slotted inside a <code>ui5-table-row</code> as cells
   *
   * @name sap.ui.webcomponents.main.ITableCell
   * @interface
   * @public
   */

  _exports.ITableColumn = ITableColumn;
  const ITableCell = "sap.ui.webcomponents.main.ITableCell";
  /**
   * Interface for components that represent a token and are usable in components such as <code>ui5-multi-input</code>
   *
   * @name sap.ui.webcomponents.main.IToken
   * @interface
   * @public
   */

  _exports.ITableCell = ITableCell;
  const IToken = "sap.ui.webcomponents.main.IToken";
  /**
   * Interface for tree items for the purpose of <code>ui5-tree</code>
   *
   * @name sap.ui.webcomponents.main.ITreeItem
   * @interface
   * @public
   */

  _exports.IToken = IToken;
  const ITreeItem = "sap.ui.webcomponents.main.ITreeItem";
  _exports.ITreeItem = ITreeItem;
});