sap.ui.define(['sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/main/thirdparty/types/Priority', 'sap/ui/webc/main/thirdparty/Button', 'sap/ui/webc/main/thirdparty/BusyIndicator', 'sap/ui/webc/main/thirdparty/Link', 'sap/ui/webc/main/thirdparty/Icon', 'sap/ui/webc/main/thirdparty/Popover', './NotificationListItemBase', './generated/i18n/i18n-defaults', './generated/templates/NotificationListItemTemplate.lit', './generated/themes/NotificationListItem.css'], function (Keys, i18nBundle, ResizeHandler, Device, Priority, Button, BusyIndicator, Link, Icon, Popover, NotificationListItemBase, i18nDefaults, NotificationListItemTemplate_lit, NotificationListItem_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var Priority__default = /*#__PURE__*/_interopDefaultLegacy(Priority);
	var Button__default = /*#__PURE__*/_interopDefaultLegacy(Button);
	var BusyIndicator__default = /*#__PURE__*/_interopDefaultLegacy(BusyIndicator);
	var Link__default = /*#__PURE__*/_interopDefaultLegacy(Link);
	var Icon__default = /*#__PURE__*/_interopDefaultLegacy(Icon);
	var Popover__default = /*#__PURE__*/_interopDefaultLegacy(Popover);

	const MAX_WRAP_HEIGHT = 32;
	const metadata = {
		tag: "ui5-li-notification",
		languageAware: true,
		managedSlots: true,
		properties:  {
			wrap: {
				type: Boolean,
			},
			_showMorePressed: {
				type: Boolean,
			},
			_showMore: {
				type: Boolean,
			},
		},
		slots:  {
			avatar: {
				type: HTMLElement,
			},
			footnotes: {
				type: HTMLElement,
				propertyName: "footnotes",
				individualSlots: true,
			},
			"default": {
				propertyName: "description",
				type: Node,
			},
		},
		events:  {
			_press: {},
		},
	};
	class NotificationListItem extends NotificationListItemBase {
		constructor() {
			super();
			this._headingOverflowHeight = 0;
			this._descOverflowHeight = 0;
			this.onResizeBind = this.onResize.bind(this);
		}
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return NotificationListItem_css;
		}
		static get template() {
			return NotificationListItemTemplate_lit;
		}
		static get dependencies() {
			return [
				Button__default,
				Icon__default,
				BusyIndicator__default,
				Link__default,
				Popover__default,
			];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents-fiori");
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this.onResizeBind);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this.onResizeBind);
		}
		get hasDesc() {
			return !!this.description.length;
		}
		get hasFootNotes() {
			return !!this.footnotes.length;
		}
		get showMoreText() {
			if (this._showMorePressed) {
				return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_SHOW_LESS);
			}
			return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_SHOW_MORE);
		}
		get overflowBtnAccessibleName() {
			return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_OVERLOW_BTN_TITLE);
		}
		get closeBtnAccessibleName() {
			return this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_CLOSE_BTN_TITLE);
		}
		get hideShowMore() {
			if (!this.wrap && this._showMore) {
				return undefined;
			}
			return true;
		}
		get descriptionDOM() {
			return this.shadowRoot.querySelector(".ui5-nli-description");
		}
		get headingDOM() {
			return this.shadowRoot.querySelector(".ui5-nli-heading");
		}
		get headingHeight() {
			return this.headingDOM.offsetHeight;
		}
		get descriptionHeight() {
			return this.descriptionDOM.offsetHeight;
		}
		get headingOverflows() {
			const heading = this.headingDOM;
			if (!heading) {
				return false;
			}
			if (Device.isIE()) {
				return heading.scrollHeight > MAX_WRAP_HEIGHT;
			}
			return heading.offsetHeight < heading.scrollHeight;
		}
		get descriptionOverflows() {
			const description = this.descriptionDOM;
			if (!description) {
				return false;
			}
			if (Device.isIE()) {
				return description.scrollHeight > MAX_WRAP_HEIGHT;
			}
			return description.offsetHeight < description.scrollHeight;
		}
		get footerItems() {
			return this.footnotes.map((el, idx, arr) => {
				return {
					slotName: el._individualSlot,
					showDivider: idx !== arr.length - 1,
				};
			});
		}
		get ariaLabelledBy() {
			const id = this._id;
			const ids = [];
			if (this.hasHeading) {
				ids.push(`${id}-heading`);
			}
			if (this.hasDesc) {
				ids.push(`${id}-description`);
			}
			if (this.hasFootNotes) {
				ids.push(`${id}-footer`);
			}
			ids.push(`${id}-invisibleText`);
			return ids.join(" ");
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
			const notifcationTxt = this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_TXT);
			const readTxt = this.read ? this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_READ) : this.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_UNREAD);
			const priorityText = this.priorityText;
			return `${notifcationTxt} ${readTxt} ${priorityText}`;
		}
		get classes() {
			return {
				content: {
					"ui5-nli-content--ie": Device.isIE(),
				},
			};
		}
		_onclick(event) {
			this.fireItemPress(event);
		}
		_onShowMoreClick(event) {
			event.preventDefault();
			this._showMorePressed = !this._showMorePressed;
		}
		_onkeydown(event) {
			super._onkeydown(event);
			if (Keys.isEnter(event)) {
				this.fireItemPress(event);
			}
		}
		_onkeyup(event) {
			super._onkeyup(event);
			const space = Keys.isSpace(event);
			if (space && event.isMarked === "link") {
				this._onShowMoreClick(event);
				return;
			}
			if (space) {
				this.fireItemPress(event);
			}
		}
		fireItemPress(event) {
			if (event.isMarked === "button" || event.isMarked === "link") {
				return;
			}
			this.fireEvent("_press", { item: this });
		}
		onResize() {
			if (this.wrap) {
				this._showMore = false;
				return;
			}
			const headingWouldOverflow = this.headingHeight > this._headingOverflowHeight;
			const descWouldOverflow = this.hasDesc && this.descriptionHeight > this._descOverflowHeight;
			const overflows = headingWouldOverflow || descWouldOverflow;
			if (this._showMorePressed && overflows) {
				this._showMore = true;
				return;
			}
			if (this.headingOverflows || this.descriptionOverflows) {
				this._headingOverflowHeight = this.headingHeight;
				this._descOverflowHeight = this.hasDesc ? this.descriptionHeight : 0;
				this._showMore = true;
				return;
			}
			this._showMore = false;
		}
	}
	NotificationListItem.define();

	return NotificationListItem;

});
