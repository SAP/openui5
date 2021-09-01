sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Keys', './generated/i18n/i18n-defaults', './generated/templates/AvatarGroupTemplate.lit', './generated/themes/AvatarGroup.css', './Button', './types/AvatarSize', './types/AvatarGroupType', './types/AvatarColorScheme'], function (UI5Element, litRender, ResizeHandler, ItemNavigation, i18nBundle, Keys, i18nDefaults, AvatarGroupTemplate_lit, AvatarGroup_css, Button, AvatarSize, AvatarGroupType, AvatarColorScheme) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var ItemNavigation__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigation);

	const OVERFLOW_BTN_CLASS = "ui5-avatar-group-overflow-btn";
	const AVATAR_GROUP_OVERFLOW_BTN_SELECTOR = `.${OVERFLOW_BTN_CLASS}`;
	const offsets = {
		[AvatarSize.XS]: {
			[AvatarGroupType.Individual]: "0.0625rem",
			[AvatarGroupType.Group]: "-0.75rem",
		},
		[AvatarSize.S]: {
			[AvatarGroupType.Individual]: "0.125rem",
			[AvatarGroupType.Group]: "-1.25rem",
		},
		[AvatarSize.M]: {
			[AvatarGroupType.Individual]: "0.125rem",
			[AvatarGroupType.Group]: "-1.625rem",
		},
		[AvatarSize.L]: {
			[AvatarGroupType.Individual]: "0.125rem",
			[AvatarGroupType.Group]: " -2rem",
		},
		[AvatarSize.XL]: {
			[AvatarGroupType.Individual]: "0.25rem",
			[AvatarGroupType.Group]: "-2.75rem",
		},
	};
	const metadata = {
		tag: "ui5-avatar-group",
		managedSlots: true,
		properties:   {
			type: {
				type: String,
				defaultValue: AvatarGroupType.Group,
			},
			ariaHaspopup: {
				type: String,
			},
			_overflowButtonText: {
				type: String,
				noAttribute: true,
			},
		},
		slots:  {
			"default": {
				type: HTMLElement,
				propertyName: "items",
			},
			 overflowButton: {
				type: HTMLElement,
			},
		},
		events:  {
			click: {
				detail: {
					targetRef: { type: HTMLElement },
					overflowButtonClicked: { type: Boolean },
				},
			},
			overflow: {},
		},
	};
	class AvatarGroup extends UI5Element__default {
		constructor() {
			super();
			this._itemNavigation = new ItemNavigation__default(this, {
				getItemsCallback: () => {
					return this._isGroup ? [] : this.items.slice(0, this._hiddenStartIndex);
				},
			});
			this._colorIndex = 0;
			this._hiddenItems = 0;
			this._onResizeHandler = this._onResize.bind(this);
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return AvatarGroupTemplate_lit;
		}
		static get styles() {
			return AvatarGroup_css;
		}
		static get dependencies() {
			return [
				Button,
			];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		get hiddenItems() {
			return this.items.slice(this._hiddenStartIndex);
		}
		get colorScheme() {
			return this.items.map(avatar => avatar._effectiveBackgroundColor);
		}
		get _customOverflowButton() {
			return this.overflowButton.length ? this.overflowButton[0] : undefined;
		}
		get _ariaLabelText() {
			const hiddenItemsCount = this.hiddenItems.length;
			const typeLabelKey = this._isGroup ? i18nDefaults.AVATAR_GROUP_ARIA_LABEL_GROUP : i18nDefaults.AVATAR_GROUP_ARIA_LABEL_INDIVIDUAL;
			let text = this.i18nBundle.getText(typeLabelKey);
			text += ` ${this.i18nBundle.getText(i18nDefaults.AVATAR_GROUP_DISPLAYED_HIDDEN_LABEL, [this._itemsCount - hiddenItemsCount], [hiddenItemsCount])}`;
			if (this._isGroup) {
				text += ` ${this.i18nBundle.getText(i18nDefaults.AVATAR_GROUP_SHOW_COMPLETE_LIST_LABEL)}`;
			} else {
				text += ` ${this.i18nBundle.getText(i18nDefaults.AVATAR_GROUP_MOVE)}`;
			}
			return text;
		}
		get _overflowButtonAriaLabelText() {
			return this._isGroup ? undefined : this.i18nBundle.getText(i18nDefaults.AVATAR_GROUP_SHOW_COMPLETE_LIST_LABEL);
		}
		get _containerAriaHasPopup() {
			return this._isGroup ? this._getAriaHasPopup() : undefined;
		}
		get _overflowButtonAccInfo() {
			return {
				ariaHaspopup: this._isGroup ? undefined : this._getAriaHasPopup(),
			};
		}
		get _role() {
			return this._isGroup ? "button" : "group";
		}
		get _hiddenStartIndex() {
			return this._itemsCount - this._hiddenItems;
		}
		get _overflowBtnHidden() {
			return this._hiddenItems === 0;
		}
		get _isGroup() {
			return this.type === AvatarGroupType.Group;
		}
		get _itemsCount() {
			return this.items.length;
		}
		get _groupTabIndex() {
			return this._isGroup ? "0" : "-1";
		}
		get _overflowButton() {
			return this.shadowRoot.querySelector(AVATAR_GROUP_OVERFLOW_BTN_SELECTOR);
		}
		get _overflowButtonEffectiveWidth() {
			const button = this._customOverflowButton ? this._customOverflowButton : this._overflowButton;
			if (this._isGroup) {
				let item = this.items[1];
				if (!item || item.hidden) {
					item = button;
				}
				return this.effectiveDir === "rtl" ? this._getWidthToItem(item) : item.offsetLeft;
			}
			return button.offsetWidth;
		}
		get firstAvatarSize() {
			return this.items[0].size;
		}
		get classes() {
			return {
				overflowButton: {
					"ui5-avatar-group-overflow-btn": true,
					"ui5-avatar-group-overflow-btn-xs": this.firstAvatarSize === "XS",
					"ui5-avatar-group-overflow-btn-s": this.firstAvatarSize === "S",
					"ui5-avatar-group-overflow-btn-m": this.firstAvatarSize === "M",
					"ui5-avatar-group-overflow-btn-l": this.firstAvatarSize === "L",
					"ui5-avatar-group-overflow-btn-xl": this.firstAvatarSize === "XL",
				},
			};
		}
		onAfterRendering() {
			this._overflowItems();
		}
		onBeforeRendering() {
			if (this._customOverflowButton) {
				this._customOverflowButton.nonInteractive = this._isGroup;
			}
			this._prepareAvatars();
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._onResizeHandler);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this._onResizeHandler);
		}
		_onResize() {
			this._overflowItems();
		}
		_onkeydown(event) {
			if (this._isGroup) {
				if (Keys.isEnter(event)) {
					this._fireGroupEvent(event.target);
				} else if (Keys.isSpace(event)) {
					event.preventDefault();
				}
			}
		}
		_onkeyup(event) {
			if (!event.shiftKey && Keys.isSpace(event) && this._isGroup) {
				this._fireGroupEvent(event.target);
				event.preventDefault();
			}
		}
		_fireGroupEvent(targetRef) {
			const isOverflowButtonClicked = targetRef.classList.contains(OVERFLOW_BTN_CLASS) || targetRef === this._customOverflowButton;
			this.fireEvent("click", {
				targetRef,
				overflowButtonClicked: isOverflowButtonClicked,
			});
		}
		_onClick(event) {
			const isButton = event.target.hasAttribute("ui5-button");
			event.stopPropagation();
			if (this._isGroup || isButton) {
				this._fireGroupEvent(event.target);
			}
		}
		_onUI5Click(event) {
			const isAvatar = event.target.hasAttribute("ui5-avatar");
			event.stopPropagation();
			if (isAvatar) {
				this._fireGroupEvent(event.target);
			}
		}
		_prepareAvatars() {
			const RTL = this.effectiveDir === "rtl";
			this._colorIndex = 0;
			this.items.forEach((avatar, index) => {
				const colorIndex = this._getNextBackgroundColor();
				avatar.interactive = !this._isGroup;
				if (!avatar.getAttribute("_color-scheme")) {
					avatar.setAttribute("_color-scheme", AvatarColorScheme[`Accent${colorIndex}`]);
				}
				if (index !== this._itemsCount - 1 || this._customOverflowButton) {
					avatar.style[`margin-${RTL ? "left" : "right"}`] = offsets[avatar._effectiveSize][this.type];
				}
			});
		}
		_onfocusin(event) {
			const target = event.target;
			this._itemNavigation.setCurrentItem(target);
		}
		_getWidthToItem(item) {
			const isRTL = this.effectiveDir === "rtl";
			if (isRTL) {
				return item.offsetParent.offsetWidth - item.offsetLeft - item.offsetWidth;
			}
			return item.offsetLeft;
		}
		_overflowItems() {
			if (this.items.length < 2) {
				return;
			}
			let hiddenItems = 0;
			for (let index = 0; index < this._itemsCount; index++) {
				const item = this.items[index];
				item.hidden = false;
				let totalWidth = this._getWidthToItem(item) + item.offsetWidth;
				if (index !== this._itemsCount - 1 || this._customOverflowButton) {
					totalWidth += this._overflowButtonEffectiveWidth;
				}
				if (totalWidth > this.offsetWidth) {
					hiddenItems = this._itemsCount - index;
					break;
				}
			}
			this._setHiddenItems(hiddenItems);
		}
		_getNextBackgroundColor() {
			if (++this._colorIndex > 10) {
				this._colorIndex = 1;
			}
			return this._colorIndex;
		}
		_setHiddenItems(hiddenItems) {
			const shouldFireEvent = this._hiddenItems !== hiddenItems;
			this._hiddenItems = hiddenItems;
			this.items.forEach((item, index) => {
				item.hidden = index >= this._hiddenStartIndex;
			});
			this._overflowButtonText = `+${hiddenItems > 99 ? 99 : hiddenItems}`;
			if (shouldFireEvent) {
				this.fireEvent("overflow");
			}
		}
		_getAriaHasPopup() {
			if (this.ariaHaspopup === "") {
				return;
			}
			return this.ariaHaspopup;
		}
	}
	AvatarGroup.define();

	return AvatarGroup;

});
