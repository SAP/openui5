sap.ui.define(['sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/main/thirdparty/Dialog', 'sap/ui/webc/main/thirdparty/Button', 'sap/ui/webc/main/thirdparty/Label', 'sap/ui/webc/main/thirdparty/GroupHeaderListItem', 'sap/ui/webc/main/thirdparty/List', 'sap/ui/webc/main/thirdparty/StandardListItem', 'sap/ui/webc/main/thirdparty/Title', 'sap/ui/webc/main/thirdparty/SegmentedButton', 'sap/ui/webc/main/thirdparty/SegmentedButtonItem', './Bar', './types/ViewSettingsDialogMode', 'sap/ui/webc/common/thirdparty/icons/sort', 'sap/ui/webc/common/thirdparty/icons/filter', 'sap/ui/webc/common/thirdparty/icons/nav-back', './generated/i18n/i18n-defaults', './generated/templates/ViewSettingsDialogTemplate.lit', './generated/themes/ViewSettingsDialog.css'], function (i18nBundle, Device, litRender, UI5Element, Dialog, Button, Label, GroupHeaderListItem, List, StandardListItem, Title, SegmentedButton, SegmentedButtonItem, Bar, ViewSettingsDialogMode, sort, filter, navBack, i18nDefaults, ViewSettingsDialogTemplate_lit, ViewSettingsDialog_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var Dialog__default = /*#__PURE__*/_interopDefaultLegacy(Dialog);
	var Button__default = /*#__PURE__*/_interopDefaultLegacy(Button);
	var Label__default = /*#__PURE__*/_interopDefaultLegacy(Label);
	var GroupHeaderListItem__default = /*#__PURE__*/_interopDefaultLegacy(GroupHeaderListItem);
	var List__default = /*#__PURE__*/_interopDefaultLegacy(List);
	var StandardListItem__default = /*#__PURE__*/_interopDefaultLegacy(StandardListItem);
	var Title__default = /*#__PURE__*/_interopDefaultLegacy(Title);
	var SegmentedButton__default = /*#__PURE__*/_interopDefaultLegacy(SegmentedButton);
	var SegmentedButtonItem__default = /*#__PURE__*/_interopDefaultLegacy(SegmentedButtonItem);

	const metadata = {
		tag: "ui5-view-settings-dialog",
		managedSlots: true,
		properties:  {
			 sortDescending: {
				type: Boolean,
			},
			 _recentlyFocused: {
				type: Object,
			},
			 _initialSettings: {
				type: Object,
			},
			 _confirmedSettings: {
				type: Object,
			},
			 _currentSettings: {
				type: Object,
			},
			_currentMode: {
				type: ViewSettingsDialogMode,
				defaultValue: ViewSettingsDialogMode.Sort,
			},
			_filterStepTwo: {
				type: Boolean,
				noAttribute: true,
			},
		},
		slots:  {
			 sortItems: {
				type: HTMLElement,
			},
			filterItems: {
				type: HTMLElement,
			},
		},
		events:  {
			confirm: {
				detail: {
					sortOrder: { type: String },
					sortBy: { type: String },
					sortByItem: { type: HTMLElement },
					sortDescending: { type: Boolean },
					filters: { type: Array },
				},
			},
			cancel: {
				detail: {
					sortOrder: { type: String },
					sortBy: { type: String },
					sortByItem: { type: HTMLElement },
					sortDescending: { type: Boolean },
					filters: { type: Array },
				},
			},
		},
	};
	class ViewSettingsDialog extends UI5Element__default {
		constructor() {
			super();
			this._currentSettings = {
				sortOrder: [],
				sortBy: [],
				filters: [],
			};
		}
		onBeforeRendering() {
			if (this._currentSettings.filters && this._currentSettings.filters.length) {
				this._setAdditionalTexts();
			}
			if (!this.shouldBuildSort && this.shouldBuildFilter) {
				this._currentMode = ViewSettingsDialogMode.Filter;
			}
		}
		_setAdditionalTexts() {
			this.filterItems.forEach((filter, index) => {
				let selectedCount = 0;
				for (let i = 0; i < filter.values.length; i++) {
					if (this._currentSettings.filters[index].filterOptions[i].selected) {
						selectedCount++;
					}
				}
				filter.additionalText = !selectedCount ? "" : selectedCount;
			});
		}
		static get render() {
			return litRender__default;
		}
		static get metadata() {
			return metadata;
		}
		static get dependencies() {
			return [
				Bar,
				Button__default,
				Title__default,
				Dialog__default,
				Label__default,
				List__default,
				StandardListItem__default,
				GroupHeaderListItem__default,
				SegmentedButton__default,
				SegmentedButtonItem__default,
			];
		}
		static get template() {
			return ViewSettingsDialogTemplate_lit;
		}
		static get styles() {
			return ViewSettingsDialog_css;
		}
		static async onDefine() {
			ViewSettingsDialog.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents-fiori");
		}
		get _selectedFilter() {
			for (let i = 0; i < this._currentSettings.filters.length; i++) {
				if (this._currentSettings.filters[i].selected) {
					return this._currentSettings.filters[i];
				}
			}
			return "";
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
			return `${ViewSettingsDialog.i18nBundle.getText(i18nDefaults.VSD_FILTER_BY)}: ${this._selectedFilter.text}`;
		}
		get _dialogTitle() {
			return ViewSettingsDialog.i18nBundle.getText(i18nDefaults.VSD_DIALOG_TITLE_SORT);
		}
		get _okButtonLabel() {
			return ViewSettingsDialog.i18nBundle.getText(i18nDefaults.VSD_SUBMIT_BUTTON);
		}
		get _cancelButtonLabel() {
			return ViewSettingsDialog.i18nBundle.getText(i18nDefaults.VSD_CANCEL_BUTTON);
		}
		get _resetButtonLabel() {
			return ViewSettingsDialog.i18nBundle.getText(i18nDefaults.VSD_RESET_BUTTON);
		}
		get _ascendingLabel() {
			return ViewSettingsDialog.i18nBundle.getText(i18nDefaults.VSD_ORDER_ASCENDING);
		}
		get _descendingLabel() {
			return ViewSettingsDialog.i18nBundle.getText(i18nDefaults.VSD_ORDER_DESCENDING);
		}
		get _sortOrderLabel() {
			return ViewSettingsDialog.i18nBundle.getText(i18nDefaults.VSD_SORT_ORDER);
		}
		get _filterByLabel() {
			return ViewSettingsDialog.i18nBundle.getText(i18nDefaults.VSD_FILTER_BY);
		}
		get _sortByLabel() {
			return ViewSettingsDialog.i18nBundle.getText(i18nDefaults.VSD_SORT_BY);
		}
		get _isPhone() {
			return Device.isPhone();
		}
		get _sortAscending() {
			return !this.sortDescending;
		}
		get _title() {
			return this.showBackButton
				? this._filterByTitle
				: this._dialogTitle;
		}
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
								selected: optionValue.selected,
							};
						}),
					};
				}),
			};
		}
		get initSortByItems() {
			return this.sortItems.map((item, index) => {
				return {
					text: item.text,
					selected: item.selected,
					index,
				};
			});
		}
		get initSortOrderItems() {
			return [
				{
					text: this._ascendingLabel,
					selected: !this.sortDescending,
				},
				{
					text: this._descendingLabel,
					selected: this.sortDescending,
				},
			];
		}
		get expandContent() {
			return this._filterStepTwo || !this.hasPagination;
		}
		get isModeSort() {
			return this._currentMode === ViewSettingsDialogMode.Sort;
		}
		get isModeFilter() {
			return this._currentMode === ViewSettingsDialogMode.Filter;
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
		show() {
			if (!this._dialog) {
				this._sortOrder = this._sortOrderListDomRef;
				this._sortBy = this._sortByList;
				this._initialSettings = this._settings;
				this._currentSettings = this._settings;
				this._confirmedSettings = this._settings;
				this._dialog = this._dialogDomRef;
			} else {
				this._restoreSettings(this._confirmedSettings);
			}
			this._dialog.show(true);
			this._dialog.querySelector("[ui5-list]").focusFirstItem();
		}
		_handleModeChange(event) {
			this._currentMode = ViewSettingsDialogMode[event.detail.selectedItem.getAttribute("mode")];
		}
		_handleFilterValueItemClick(event) {
			this._currentSettings.filters = this._currentSettings.filters.map(filter => {
				if (filter.selected) {
					filter.filterOptions.forEach(option => {
						if (option.text === event.detail.item.innerText) {
							option.selected = !option.selected;
						}
					});
				}
				return filter;
			});
			this._currentSettings = JSON.parse(JSON.stringify(this._currentSettings));
		}
		_navigateToFilters(event) {
			this._filterStepTwo = false;
		}
		_changeCurrentFilter(event) {
			this._filterStepTwo = true;
			this._currentSettings.filters = this._currentSettings.filters.map(filter => {
				filter.selected = filter.text === event.detail.item.innerText;
				return filter;
			});
		}
		close() {
			this._dialog && this._dialog.close();
		}
		_focusRecentlyUsedControl() {
			if (!this._recentlyFocused || !Object.keys(this._recentlyFocused).length) {
				return;
			}
			const recentlyFocusedSelectedItems = this._recentlyFocused.getSelectedItems(),
				  recentlyFocusedItems = this._recentlyFocused.items,
				  slottedNodesExist = recentlyFocusedItems[1] && recentlyFocusedItems[1].assignedNodes && recentlyFocusedItems[1].assignedNodes().length;
			if (recentlyFocusedSelectedItems.length) {
				recentlyFocusedSelectedItems[0].focus();
			} else if (slottedNodesExist) {
				this._recentlyFocused.focusItem(recentlyFocusedItems[1].assignedNodes()[0]);
			}
		}
		_confirmSettings() {
			this.close();
			this._confirmedSettings = this._currentSettings;
			this.fireEvent("confirm", this.eventsParams);
		}
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
				filters: this.selectedFilters,
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
		_restoreConfirmedOnEscape(evt) {
			if (evt.detail.escPressed) {
				this._cancelSettings();
				this._currentMode = "Sort";
				this._filterStepTwo = false;
			}
		}
		_resetSettings() {
			this._restoreSettings(this._initialSettings);
			this._filterStepTwo = false;
			this._recentlyFocused = this._sortOrder;
			this._focusRecentlyUsedControl();
		}
		_restoreSettings(settings) {
			this._currentSettings = JSON.parse(JSON.stringify(settings));
		}
		_onSortOrderChange(event) {
			this._recentlyFocused = this._sortOrder;
			this._currentSettings.sortOrder = this.initSortOrderItems.map(item => {
				item.selected = item.text === event.detail.item.innerText;
				return item;
			});
			this._currentSettings = JSON.parse(JSON.stringify(this._currentSettings));
		}
		 _onSortByChange(event) {
			const selectedItemIndex = Number(event.detail.item.getAttribute("data-ui5-external-action-item-index"));
			this._recentlyFocused = this._sortBy;
			this._currentSettings.sortBy = this.initSortByItems.map((item, index) => {
				item.selected = index === selectedItemIndex;
				return item;
			});
			this._currentSettings = JSON.parse(JSON.stringify(this._currentSettings));
		}
	}
	ViewSettingsDialog.define();

	return ViewSettingsDialog;

});
