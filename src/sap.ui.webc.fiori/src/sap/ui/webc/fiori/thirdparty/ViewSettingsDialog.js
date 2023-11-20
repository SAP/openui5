sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/main/thirdparty/Dialog", "sap/ui/webc/main/thirdparty/Button", "sap/ui/webc/main/thirdparty/Label", "sap/ui/webc/main/thirdparty/GroupHeaderListItem", "sap/ui/webc/main/thirdparty/List", "sap/ui/webc/main/thirdparty/StandardListItem", "sap/ui/webc/main/thirdparty/Title", "sap/ui/webc/main/thirdparty/SegmentedButton", "sap/ui/webc/main/thirdparty/SegmentedButtonItem", "./Bar", "./types/ViewSettingsDialogMode", "sap/ui/webc/common/thirdparty/icons/sort", "sap/ui/webc/common/thirdparty/icons/filter", "sap/ui/webc/common/thirdparty/icons/nav-back", "./generated/i18n/i18n-defaults", "./generated/templates/ViewSettingsDialogTemplate.lit", "./generated/themes/ViewSettingsDialog.css"], function (_exports, _property, _slot, _customElement, _event, _i18nBundle, _Device, _LitRenderer, _UI5Element, _Dialog, _Button, _Label, _GroupHeaderListItem, _List, _StandardListItem, _Title, _SegmentedButton, _SegmentedButtonItem, _Bar, _ViewSettingsDialogMode, _sort, _filter, _navBack, _i18nDefaults, _ViewSettingsDialogTemplate, _ViewSettingsDialog) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _customElement = _interopRequireDefault(_customElement);
  _event = _interopRequireDefault(_event);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _UI5Element = _interopRequireDefault(_UI5Element);
  _Dialog = _interopRequireDefault(_Dialog);
  _Button = _interopRequireDefault(_Button);
  _Label = _interopRequireDefault(_Label);
  _GroupHeaderListItem = _interopRequireDefault(_GroupHeaderListItem);
  _List = _interopRequireDefault(_List);
  _StandardListItem = _interopRequireDefault(_StandardListItem);
  _Title = _interopRequireDefault(_Title);
  _SegmentedButton = _interopRequireDefault(_SegmentedButton);
  _SegmentedButtonItem = _interopRequireDefault(_SegmentedButtonItem);
  _Bar = _interopRequireDefault(_Bar);
  _ViewSettingsDialogMode = _interopRequireDefault(_ViewSettingsDialogMode);
  _ViewSettingsDialogTemplate = _interopRequireDefault(_ViewSettingsDialogTemplate);
  _ViewSettingsDialog = _interopRequireDefault(_ViewSettingsDialog);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var ViewSettingsDialog_1;

  // Template

  // Styles

  /**
   * @class
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-view-settings-dialog</code> component helps the user to sort data within a list or a table.
   * It consists of several lists like <code>Sort order</code> which is built-in and <code>Sort By</code> and <code>Filter By</code> lists,
   * for which you must be provide items(<code>ui5-sort-item</code> & <code>ui5-filter-item</code> respectively)
   * These options can be used to create sorters for a table.
   *
   * The <code>ui5-view-settings-dialog</code> interrupts the current application processing as it is the only focused UI element and
   * the main screen is dimmed/blocked.
   * The <code>ui5-view-settings-dialog</code> is modal, which means that user action is required before returning to the parent window is possible.
   *
   * <h3>Structure</h3>
   * A <code>ui5-view-settings-dialog</code> consists of a header, content, and a footer for action buttons.
   * The <code>ui5-view-settings-dialog</code> is usually displayed at the center of the screen.
   *
   * <h3>Responsive Behavior</h3>
   * <code>ui5-view-settings-dialog</code> stretches on full screen on phones.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents-fiori/dist/ViewSettingsDialog";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.ViewSettingsDialog
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-view-settings-dialog
   * @appenddocs sap.ui.webc.fiori.SortItem sap.ui.webc.fiori.FilterItem sap.ui.webc.fiori.FilterItemOption
   * @since 1.0.0-rc.16
   * @public
   */
  let ViewSettingsDialog = ViewSettingsDialog_1 = class ViewSettingsDialog extends _UI5Element.default {
    constructor() {
      super();
      this._currentSettings = {
        sortOrder: [],
        sortBy: [],
        filters: []
      };
    }
    onBeforeRendering() {
      if (this._currentSettings.filters && this._currentSettings.filters.length) {
        this._setAdditionalTexts();
      }
      if (!this.shouldBuildSort && this.shouldBuildFilter) {
        this._currentMode = _ViewSettingsDialogMode.default.Filter;
      }
    }
    _setAdditionalTexts() {
      // Add the additional text to the filter options
      this.filterItems.forEach((filter, index) => {
        let selectedCount = 0;
        for (let i = 0; i < filter.values.length; i++) {
          if (this._currentSettings.filters[index].filterOptions[i].selected) {
            selectedCount++;
          }
        }
        filter.additionalText = !selectedCount ? "" : `${selectedCount}`;
      });
    }
    static async onDefine() {
      ViewSettingsDialog_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }
    get _selectedFilter() {
      for (let i = 0; i < this._currentSettings.filters.length; i++) {
        if (this._currentSettings.filters[i].selected) {
          return this._currentSettings.filters[i];
        }
      }
    }
    get shouldBuildSort() {
      return !!this.sortItems.length;
    }
    get shouldBuildFilter() {
      return !!this.filterItems.length;
    }
    get hasPagination() {
      return this.shouldBuildSort && this.shouldBuildFilter;
    }
    get _filterByTitle() {
      const selectedFilterText = this._selectedFilter ? this._selectedFilter.text : "";
      return `${ViewSettingsDialog_1.i18nBundle.getText(_i18nDefaults.VSD_FILTER_BY)}: ${selectedFilterText}`;
    }
    get _dialogTitle() {
      return ViewSettingsDialog_1.i18nBundle.getText(_i18nDefaults.VSD_DIALOG_TITLE_SORT);
    }
    get _okButtonLabel() {
      return ViewSettingsDialog_1.i18nBundle.getText(_i18nDefaults.VSD_SUBMIT_BUTTON);
    }
    get _cancelButtonLabel() {
      return ViewSettingsDialog_1.i18nBundle.getText(_i18nDefaults.VSD_CANCEL_BUTTON);
    }
    get _resetButtonLabel() {
      return ViewSettingsDialog_1.i18nBundle.getText(_i18nDefaults.VSD_RESET_BUTTON);
    }
    get _ascendingLabel() {
      return ViewSettingsDialog_1.i18nBundle.getText(_i18nDefaults.VSD_ORDER_ASCENDING);
    }
    get _descendingLabel() {
      return ViewSettingsDialog_1.i18nBundle.getText(_i18nDefaults.VSD_ORDER_DESCENDING);
    }
    get _sortOrderLabel() {
      return ViewSettingsDialog_1.i18nBundle.getText(_i18nDefaults.VSD_SORT_ORDER);
    }
    get _filterByLabel() {
      return ViewSettingsDialog_1.i18nBundle.getText(_i18nDefaults.VSD_FILTER_BY);
    }
    get _sortByLabel() {
      return ViewSettingsDialog_1.i18nBundle.getText(_i18nDefaults.VSD_SORT_BY);
    }
    get _isPhone() {
      return (0, _Device.isPhone)();
    }
    get _sortAscending() {
      return !this.sortDescending;
    }
    get _title() {
      return this.showBackButton ? this._filterByTitle : this._dialogTitle;
    }
    /**
     * Determines disabled state of the <code>Reset</code> button.
     */
    get _disableResetButton() {
      return this._dialog && this._sortSetttingsAreInitial && this._filteresAreInitial;
    }
    get _sortSetttingsAreInitial() {
      let settingsAreInitial = true;
      ["sortBy", "sortOrder"].forEach(sortList => {
        this._currentSettings[sortList].forEach((item, index) => {
          if (item.selected !== this._initialSettings[sortList][index].selected) {
            settingsAreInitial = false;
          }
        });
      });
      return settingsAreInitial;
    }
    get _filteresAreInitial() {
      let filtersAreInitial = true;
      this._currentSettings.filters.forEach((filter, index) => {
        for (let i = 0; i < filter.filterOptions.length; i++) {
          if (filter.filterOptions[i].selected !== this._initialSettings.filters[index].filterOptions[i].selected) {
            filtersAreInitial = false;
          }
        }
      });
      return filtersAreInitial;
    }
    /**
     * Returns the current settings (current state of all lists).
     */
    get _settings() {
      return {
        sortOrder: JSON.parse(JSON.stringify(this.initSortOrderItems)),
        sortBy: JSON.parse(JSON.stringify(this.initSortByItems)),
        filters: this.filterItems.map(item => {
          return {
            text: item.text,
            selected: false,
            filterOptions: item.values.map(optionValue => {
              return {
                text: optionValue.text,
                selected: optionValue.selected
              };
            })
          };
        })
      };
    }
    get initSortByItems() {
      return this.sortItems.map((item, index) => {
        return {
          text: item.text,
          selected: item.selected,
          index
        };
      });
    }
    get initSortOrderItems() {
      return [{
        text: this._ascendingLabel,
        selected: !this.sortDescending
      }, {
        text: this._descendingLabel,
        selected: this.sortDescending
      }];
    }
    get expandContent() {
      return this._filterStepTwo || !this.hasPagination;
    }
    get isModeSort() {
      return this._currentMode === _ViewSettingsDialogMode.default.Sort;
    }
    get isModeFilter() {
      return this._currentMode === _ViewSettingsDialogMode.default.Filter;
    }
    get showBackButton() {
      return this.isModeFilter && this._filterStepTwo;
    }
    get _sortOrderListDomRef() {
      return this.shadowRoot.querySelector("[ui5-list][sort-order]");
    }
    get _sortByList() {
      return this.shadowRoot.querySelector("[ui5-list][sort-by]");
    }
    get _dialogDomRef() {
      return this.shadowRoot.querySelector("[ui5-dialog]");
    }
    /**
     * Shows the dialog.
     * @public
     * @method
     * @name sap.ui.webc.fiori.ViewSettingsDialog#show
     */
    show() {
      if (!this._dialog) {
        this._sortOrder = this._sortOrderListDomRef;
        this._sortBy = this._sortByList;
        // Sorting
        this._initialSettings = this._settings;
        this._currentSettings = this._settings;
        this._confirmedSettings = this._settings;
        this._dialog = this._dialogDomRef;
      } else {
        this._restoreSettings(this._confirmedSettings);
      }
      this.fireEvent("before-open", {}, true, false);
      this._dialog.show(true);
      this._dialog.querySelector("[ui5-list]")?.focusFirstItem();
    }
    _handleModeChange(e) {
      const mode = e.detail.selectedItem.getAttribute("mode");
      this._currentMode = _ViewSettingsDialogMode.default[mode];
    }
    _handleFilterValueItemClick(e) {
      // Update the component state
      this._currentSettings.filters = this._currentSettings.filters.map(filter => {
        if (filter.selected) {
          filter.filterOptions.forEach(option => {
            if (option.text === e.detail.item.innerText) {
              option.selected = !option.selected;
            }
          });
        }
        return filter;
      });
      this._currentSettings = JSON.parse(JSON.stringify(this._currentSettings));
    }
    _navigateToFilters() {
      this._filterStepTwo = false;
    }
    _changeCurrentFilter(e) {
      this._filterStepTwo = true;
      this._currentSettings.filters = this._currentSettings.filters.map(filter => {
        filter.selected = filter.text === e.detail.item.innerText;
        return filter;
      });
    }
    /**
     * Closes the dialog.
     */
    close() {
      this._dialog && this._dialog.close();
    }
    /**
     * Sets focus on recently used control within the dialog.
     */
    _focusRecentlyUsedControl() {
      if (!this._recentlyFocused || !Object.keys(this._recentlyFocused).length) {
        return;
      }
      const recentlyFocusedSelectedItems = this._recentlyFocused.getSelectedItems();
      if (recentlyFocusedSelectedItems.length) {
        recentlyFocusedSelectedItems[0].focus();
      }
    }
    /**
     * Stores current settings as confirmed and fires <code>confirm</code> event.
     */
    _confirmSettings() {
      this.close();
      this._confirmedSettings = this._currentSettings;
      this.fireEvent("confirm", this.eventsParams);
    }
    /**
     * Sets current settings to recently confirmed ones and fires <code>cancel</code> event.
     */
    _cancelSettings() {
      this._restoreSettings(this._confirmedSettings);
      this.fireEvent("cancel", this.eventsParams);
      this.close();
    }
    get eventsParams() {
      const _currentSortOrderSelected = this._currentSettings.sortOrder.filter(item => item.selected)[0],
        _currentSortBySelected = this._currentSettings.sortBy.filter(item => item.selected)[0],
        sortOrder = _currentSortOrderSelected && _currentSortOrderSelected.text,
        sortDescending = !this._currentSettings.sortOrder[0].selected,
        sortBy = _currentSortBySelected && _currentSortBySelected.text,
        sortByElementIndex = _currentSortBySelected && _currentSortBySelected.index,
        sortByItem = this.sortItems[sortByElementIndex];
      return {
        sortOrder,
        sortDescending,
        sortBy,
        sortByItem,
        filters: this.selectedFilters
      };
    }
    get selectedFilters() {
      const result = [];
      this._currentSettings.filters.forEach(filter => {
        const selectedOptions = [];
        filter.filterOptions.forEach(option => {
          if (option.selected) {
            selectedOptions.push(option.text);
          }
        });
        if (selectedOptions.length) {
          result.push({});
          result[result.length - 1][filter.text] = selectedOptions;
        }
      });
      return result;
    }
    /**
     * If the dialog is closed by [ESC] key, do the same as if the <code>Cancel</code> button is pressed.
     *
     * @param {event} evt
     */
    _restoreConfirmedOnEscape(evt) {
      if (evt.detail.escPressed) {
        this._cancelSettings();
        this._currentMode = _ViewSettingsDialogMode.default.Sort;
        this._filterStepTwo = false;
      }
    }
    /**
     * Resets the control settings to their initial state.
     */
    _resetSettings() {
      this._restoreSettings(this._initialSettings);
      this._recentlyFocused = this._sortOrder;
      this._focusRecentlyUsedControl();
    }
    /**
     * Sets current settings to ones passed as <code>settings</code> argument.
     *
     * @param {Object} settings
     */
    _restoreSettings(settings) {
      this._currentSettings = JSON.parse(JSON.stringify(settings));
      this._currentMode = _ViewSettingsDialogMode.default.Sort;
      this._filterStepTwo = false;
    }
    /**
     * Stores <code>Sort Order</code> list as recently used control and its selected item in current state.
     */
    _onSortOrderChange(e) {
      this._recentlyFocused = this._sortOrder;
      this._currentSettings.sortOrder = this.initSortOrderItems.map(item => {
        item.selected = item.text === e.detail.item.innerText;
        return item;
      });
      // Invalidate
      this._currentSettings = JSON.parse(JSON.stringify(this._currentSettings));
    }
    /**
     * Stores <code>Sort By</code> list as recently used control and its selected item in current state.
     */
    _onSortByChange(e) {
      const selectedItemIndex = Number(e.detail.item.getAttribute("data-ui5-external-action-item-index"));
      this._recentlyFocused = this._sortBy;
      this._currentSettings.sortBy = this.initSortByItems.map((item, index) => {
        item.selected = index === selectedItemIndex;
        return item;
      });
      // Invalidate
      this._currentSettings = JSON.parse(JSON.stringify(this._currentSettings));
    }
    /**
     * Sets a JavaScript object, as settings to the <code>ui5-view-settings-dialog</code>.
     * This method can be used after the dialog is initially open, as the dialog needs
     * to set its initial settings.<br>
     * The <code>ui5-view-settings-dialog</code> throws an event called "before-open",
     * which can be used as a trigger point.<br>
     * The object should have the following format:<br>
     * <pre>
     * {
     *	sortOrder: "Ascending",
     *	sortBy: "Name",
     *	filters: [
     *		{"Filter 1": ["Some filter 1", "Some filter 2"]},
     *		{"Filter 2": ["Some filter 4"]},
     *	]
     * }
     * </pre>
     * @param {Object} settings - predefined settings.
     * @param {string} settings.sortOrder - sort order
     * @param {string} settings.sortBy - sort by
     * @param {Array.<Object>} settings.filters - filters
     * @public
     * @method
     * @name sap.ui.webc.fiori.ViewSettingsDialog#setConfirmedSettings
     */
    setConfirmedSettings(settings) {
      if (settings && this._dialog && !this._dialog.isOpen()) {
        const tempSettings = JSON.parse(JSON.stringify(this._confirmedSettings));
        if (settings.sortOrder) {
          for (let i = 0; i < tempSettings.sortOrder.length; i++) {
            if (tempSettings.sortOrder[i].text === settings.sortOrder) {
              tempSettings.sortOrder[i].selected = true;
            } else {
              tempSettings.sortOrder[i].selected = false;
            }
          }
        }
        if (settings.sortBy) {
          for (let i = 0; i < tempSettings.sortBy.length; i++) {
            if (tempSettings.sortBy[i].text === settings.sortBy) {
              tempSettings.sortBy[i].selected = true;
            } else {
              tempSettings.sortBy[i].selected = false;
            }
          }
        }
        if (settings.filters) {
          const inputFilters = {};
          for (let i = 0; i < settings.filters.length; i++) {
            inputFilters[Object.keys(settings.filters[i])[0]] = settings.filters[i][Object.keys(settings.filters[i])[0]];
          }
          for (let i = 0; i < tempSettings.filters.length; i++) {
            for (let j = 0; j < tempSettings.filters[i].filterOptions.length; j++) {
              if (inputFilters[tempSettings.filters[i].text] && inputFilters[tempSettings.filters[i].text].indexOf(tempSettings.filters[i].filterOptions[j].text) > -1) {
                tempSettings.filters[i].filterOptions[j].selected = true;
              } else {
                tempSettings.filters[i].filterOptions[j].selected = false;
              }
            }
          }
        }
        this._confirmedSettings = JSON.parse(JSON.stringify(tempSettings));
      }
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], ViewSettingsDialog.prototype, "sortDescending", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], ViewSettingsDialog.prototype, "_recentlyFocused", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], ViewSettingsDialog.prototype, "_initialSettings", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], ViewSettingsDialog.prototype, "_confirmedSettings", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], ViewSettingsDialog.prototype, "_currentSettings", void 0);
  __decorate([(0, _property.default)({
    type: _ViewSettingsDialogMode.default,
    defaultValue: _ViewSettingsDialogMode.default.Sort
  })], ViewSettingsDialog.prototype, "_currentMode", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], ViewSettingsDialog.prototype, "_filterStepTwo", void 0);
  __decorate([(0, _slot.default)()], ViewSettingsDialog.prototype, "sortItems", void 0);
  __decorate([(0, _slot.default)()], ViewSettingsDialog.prototype, "filterItems", void 0);
  ViewSettingsDialog = ViewSettingsDialog_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-view-settings-dialog",
    renderer: _LitRenderer.default,
    styles: _ViewSettingsDialog.default,
    template: _ViewSettingsDialogTemplate.default,
    dependencies: [_Bar.default, _Button.default, _Title.default, _Dialog.default, _Label.default, _List.default, _StandardListItem.default, _GroupHeaderListItem.default, _SegmentedButton.default, _SegmentedButtonItem.default]
  })
  /**
   * Fired when confirmation button is activated.
   *
   * @event sap.ui.webc.fiori.ViewSettingsDialog#confirm
   * @param {String} sortOrder The current sort order selected.
   * @param {String} sortBy The currently selected <code>ui5-sort-item</code> text attribute.
   * @param {HTMLElement} sortByItem The currently selected <code>ui5-sort-item</code>.
   * @param {Boolean} sortDescending The selected sort order (true = descending, false = ascending).
   * @param {Array} filters The selected filters items.
   * @public
   */, (0, _event.default)("confirm", {
    detail: {
      sortOrder: {
        type: String
      },
      sortBy: {
        type: String
      },
      sortByItem: {
        type: HTMLElement
      },
      sortDescending: {
        type: Boolean
      },
      filters: {
        type: Array
      }
    }
  })
  /**
   * Fired when cancel button is activated.
   *
   * @event sap.ui.webc.fiori.ViewSettingsDialog#cancel
   * @param {String} sortOrder The current sort order selected.
   * @param {String} sortBy The currently selected <code>ui5-sort-item</code> text attribute.
   * @param {HTMLElement} sortByItem The currently selected <code>ui5-sort-item</code>.
   * @param {Boolean} sortDescending The selected sort order (true = descending, false = ascending).
   * @param {Array} filters The selected filters items.
   * @public
   */, (0, _event.default)("cancel", {
    detail: {
      sortOrder: {
        type: String
      },
      sortBy: {
        type: String
      },
      sortByItem: {
        type: HTMLElement
      },
      sortDescending: {
        type: Boolean
      },
      filters: {
        type: Array
      }
    }
  })
  /**
   * Fired before the component is opened. <b>This event does not bubble.</b>
   *
   * @public
   * @event sap.ui.webc.fiori.ViewSettingsDialog#before-open
   */, (0, _event.default)("before-open")], ViewSettingsDialog);
  ViewSettingsDialog.define();
  var _default = ViewSettingsDialog;
  _exports.default = _default;
});