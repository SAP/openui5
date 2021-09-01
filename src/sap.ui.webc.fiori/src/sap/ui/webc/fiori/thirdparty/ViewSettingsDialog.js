sap.ui.define(['sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/main/thirdparty/Dialog', 'sap/ui/webc/main/thirdparty/Button', 'sap/ui/webc/main/thirdparty/GroupHeaderListItem', 'sap/ui/webc/main/thirdparty/List', 'sap/ui/webc/main/thirdparty/StandardListItem', './Bar', './generated/i18n/i18n-defaults', './generated/templates/ViewSettingsDialogTemplate.lit', './generated/themes/ViewSettingsDialog.css'], function (i18nBundle, Device, litRender, UI5Element, Dialog, Button, GroupHeaderListItem, List, StandardListItem, Bar, i18nDefaults, ViewSettingsDialogTemplate_lit, ViewSettingsDialog_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var Dialog__default = /*#__PURE__*/_interopDefaultLegacy(Dialog);
	var Button__default = /*#__PURE__*/_interopDefaultLegacy(Button);
	var GroupHeaderListItem__default = /*#__PURE__*/_interopDefaultLegacy(GroupHeaderListItem);
	var List__default = /*#__PURE__*/_interopDefaultLegacy(List);
	var StandardListItem__default = /*#__PURE__*/_interopDefaultLegacy(StandardListItem);

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
		},
		slots:  {
			 "sortItems": {
				type: HTMLElement,
			},
		},
		events:  {
			confirm: {
				detail: {
					sortOrder: { type: String },
					sortBy: { type: String },
				},
			},
			cancel: {
				detail: {
					sortOrder: { type: String },
					sortBy: { type: String },
				},
			},
		},
	};
	class ViewSettingsDialog extends UI5Element__default {
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents-fiori");
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
				Dialog__default,
				List__default,
				StandardListItem__default,
				GroupHeaderListItem__default,
			];
		}
		static get template() {
			return ViewSettingsDialogTemplate_lit;
		}
		static get styles() {
			return ViewSettingsDialog_css;
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents-fiori");
		}
		get _dialogTitle() {
			return this.i18nBundle.getText(i18nDefaults.VSD_DIALOG_TITLE_SORT);
		}
		get _okButtonLabel() {
			return this.i18nBundle.getText(i18nDefaults.VSD_SUBMIT_BUTTON);
		}
		get _cancelButtonLabel() {
			return this.i18nBundle.getText(i18nDefaults.VSD_CANCEL_BUTTON);
		}
		get _resetButtonLabel() {
			return this.i18nBundle.getText(i18nDefaults.VSD_RESET_BUTTON);
		}
		get _ascendingLabel() {
			return this.i18nBundle.getText(i18nDefaults.VSD_ORDER_ASCENDING);
		}
		get _descendingLabel() {
			return this.i18nBundle.getText(i18nDefaults.VSD_ORDER_DESCENDING);
		}
		get _sortOrderLabel() {
			return this.i18nBundle.getText(i18nDefaults.VSD_SORT_ORDER);
		}
		get _sortByLabel() {
			return this.i18nBundle.getText(i18nDefaults.VSD_SORT_BY);
		}
		get _isPhone() {
			return Device.isPhone();
		}
		get _sortAscending() {
			return !this.sortDescending;
		}
		get _disableResetButton() {
			return this._dialog && JSON.stringify(this._currentSettings) === JSON.stringify(this._initialSettings);
		}
		get _settings() {
			const settings = {},
				  sortOrderSelected = this._sortOrder.getSelectedItems(),
				  sortBySelected = this._sortBy.getSelectedItems();
			settings.sortOrder = sortOrderSelected.length ? sortOrderSelected[0] : undefined;
			settings.sortBy = sortBySelected.length ? sortBySelected[0] : undefined;
			return settings;
		}
		show() {
			if (!this._dialog) {
				this._sortOrder = this.shadowRoot.querySelector("[ui5-list][sort-order]");
				this._sortBy = this.shadowRoot.querySelector("[ui5-list][sort-by]");
				this._initialSettings = this._settings;
				this._currentSettings = this._initialSettings;
				this._confirmedSettings = this._initialSettings;
				this._dialog = this.shadowRoot.querySelector("[ui5-dialog]");
			} else {
				this._restoreSettings(this._confirmedSettings);
			}
			this._dialog.show();
		}
		close() {
			this._dialog && this._dialog.close();
		}
		_focusRecentlyUsedControl() {
			if (!Object.keys(this._recentlyFocused).length) {
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
			this._confirmedSettings = this._currentSettings;
			this.fireEvent("confirm", {
				sortOrder: this._confirmedSettings.sortOrder && this._confirmedSettings.sortOrder.innerText,
				sortBy: this._confirmedSettings.sortBy ? this._confirmedSettings.sortBy.innerText : "",
			});
			this.close();
		}
		_cancelSettings() {
			this._restoreSettings(this._confirmedSettings);
			this.fireEvent("cancel", {
				sortOrder: this._confirmedSettings.sortOrder && this._confirmedSettings.sortOrder.innerText,
				sortBy: this._confirmedSettings.sortBy ? this._confirmedSettings.sortBy.innerText : "",
			});
			this.close();
		}
		_restoreConfirmedOnEscape(evt) {
			if (evt.detail.escPressed) {
				this._cancelSettings();
			}
		}
		_resetSettings() {
			this._restoreSettings(this._initialSettings);
			this._recentlyFocused = this._sortOrder;
			this._focusRecentlyUsedControl();
		}
		_restoreSettings(settings) {
			const sortOrderSelected = settings.sortOrder && settings.sortOrder.innerText,
				  sortBySelected = settings.sortBy && settings.sortBy.innerText;
			this._sortOrder.items.forEach(item => { item.selected = sortOrderSelected === item.innerText; });
			this._sortBy.items[1].assignedNodes().forEach(item => { item.selected = sortBySelected === item.innerText; });
			this._currentSettings = settings;
		}
		_onSortOrderChange() {
			this._recentlyFocused = this._sortOrder;
			this._currentSettings = this._settings;
		}
		 _onSortByChange() {
			this._recentlyFocused = this._sortBy;
			this._currentSettings = this._settings;
		}
	}
	ViewSettingsDialog.define();

	return ViewSettingsDialog;

});
