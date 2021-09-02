sap.ui.define(['sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/main/thirdparty/types/Priority', 'sap/ui/webc/main/thirdparty/List', 'sap/ui/webc/main/thirdparty/Button', 'sap/ui/webc/main/thirdparty/BusyIndicator', 'sap/ui/webc/main/thirdparty/Icon', 'sap/ui/webc/main/thirdparty/Popover', './NotificationListItemBase', './generated/i18n/i18n-defaults', './generated/templates/NotificationListGroupItemTemplate.lit', './generated/themes/NotificationListGroupItem.css'], function (i18nBundle, Priority, List, Button, BusyIndicator, Icon, Popover, NotificationListItemBase, i18nDefaults, NotificationListGroupItemTemplate_lit, NotificationListGroupItem_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var Priority__default = /*#__PURE__*/_interopDefaultLegacy(Priority);
	var List__default = /*#__PURE__*/_interopDefaultLegacy(List);
	var Button__default = /*#__PURE__*/_interopDefaultLegacy(Button);
	var BusyIndicator__default = /*#__PURE__*/_interopDefaultLegacy(BusyIndicator);
	var Icon__default = /*#__PURE__*/_interopDefaultLegacy(Icon);
	var Popover__default = /*#__PURE__*/_interopDefaultLegacy(Popover);

	const metadata = {
		tag: "ui5-li-notification-group",
		languageAware: true,
		managedSlots: true,
		properties:  {
			collapsed: {
				type: Boolean,
			},
			showCounter: {
				type: Boolean,
			},
		},
		slots:  {
			"default": {
				propertyName: "items",
				type: HTMLElement,
			},
		},
		events:  {
			toggle: {},
		},
	};
	class NotificationListGroupItem extends NotificationListItemBase {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return NotificationListGroupItem_css;
		}
		static get template() {
			return NotificationListGroupItemTemplate_lit;
		}
		onBeforeRendering() {
			if (this.busy) {
				this.clearChildBusyIndicator();
			}
		}
		clearChildBusyIndicator() {
			this.items.forEach(item => {
				item.busy = false;
			});
		}
		static get dependencies() {
			return [
				List__default,
				Button__default,
				Icon__default,
				BusyIndicator__default,
				Popover__default,
			];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents-fiori");
		}
		get itemsCount() {
			return this.items.length;
		}
		get overflowBtnAccessibleName() {
			return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_OVERLOW_BTN_TITLE);
		}
		get closeBtnAccessibleName() {
			return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_GROUP_ITEM_CLOSE_BTN_TITLE);
		}
		get toggleBtnAccessibleName() {
			if (this.collapsed) {
				return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_GROUP_ITEM_TOGGLE_BTN_EXPAND_TITLE);
			}
			return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_GROUP_ITEM_TOGGLE_BTN_COLLAPSE_TITLE);
		}
		get priorityText() {
			if (this.priority === Priority__default.High) {
				return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_HIGH_PRIORITY_TXT);
			}
			if (this.priority === Priority__default.Medium) {
				return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_MEDIUM_PRIORITY_TXT);
			}
			if (this.priority === Priority__default.Low) {
				return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_LOW_PRIORITY_TXT);
			}
			return "";
		}
		get accInvisibleText() {
			return `${this.groupText} ${this.readText} ${this.priorityText} ${this.counterText}`;
		}
		get readText() {
			if (this.read) {
				return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_READ);
			}
			return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_UNREAD);
		}
		get groupText() {
			return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_GROUP_ITEM_TXT);
		}
		get counterText() {
			const text = this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_GROUP_ITEM_COUNTER_TXT);
			return this.showCounter ? `${text} ${this.itemsCount}` : "";
		}
		get ariaLabelledBy() {
			const id = this._id;
			const ids = [];
			if (this.hasTitleText) {
				ids.push(`${id}-title-text`);
			}
			ids.push(`${id}-invisibleText`);
			return ids.join(" ");
		}
		get ariaExpanded() {
			return !this.collapsed;
		}
		_onBtnToggleClick() {
			this.collapsed = !this.collapsed;
			this.fireEvent("toggle", { item: this });
		}
	}
	NotificationListGroupItem.define();

	return NotificationListGroupItem;

});
