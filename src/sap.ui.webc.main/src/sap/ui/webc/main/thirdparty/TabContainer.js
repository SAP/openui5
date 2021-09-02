sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/delegate/ScrollEnablement', 'sap/ui/webc/common/thirdparty/base/animations/slideDown', 'sap/ui/webc/common/thirdparty/base/animations/slideUp', 'sap/ui/webc/common/thirdparty/base/types/AnimationMode', 'sap/ui/webc/common/thirdparty/base/config/AnimationMode', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/MediaRange', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-up', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-down', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-left', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-right', './generated/i18n/i18n-defaults', './Button', './Icon', './List', './ResponsivePopover', './types/TabContainerTabsPlacement', './generated/templates/TabContainerTemplate.lit', './generated/templates/TabContainerPopoverTemplate.lit', './generated/themes/TabContainer.css', './generated/themes/ResponsivePopoverCommon.css', './types/TabLayout'], function (UI5Element, litRender, ResizeHandler, ScrollEnablement, slideDown, slideUp, AnimationMode$1, AnimationMode, ItemNavigation, Keys, MediaRange, i18nBundle, slimArrowUp, slimArrowDown, slimArrowLeft, slimArrowRight, i18nDefaults, Button, Icon, List, ResponsivePopover, TabContainerTabsPlacement, TabContainerTemplate_lit, TabContainerPopoverTemplate_lit, TabContainer_css, ResponsivePopoverCommon_css, TabLayout) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var ScrollEnablement__default = /*#__PURE__*/_interopDefaultLegacy(ScrollEnablement);
	var slideDown__default = /*#__PURE__*/_interopDefaultLegacy(slideDown);
	var slideUp__default = /*#__PURE__*/_interopDefaultLegacy(slideUp);
	var AnimationMode__default = /*#__PURE__*/_interopDefaultLegacy(AnimationMode$1);
	var ItemNavigation__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigation);
	var MediaRange__default = /*#__PURE__*/_interopDefaultLegacy(MediaRange);

	const SCROLL_STEP = 128;
	const tabStyles = [];
	const staticAreaTabStyles = [];
	const metadata = {
		tag: "ui5-tabcontainer",
		languageAware: true,
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "items",
				type: HTMLElement,
				individualSlots: true,
				invalidateOnChildChange: {
					properties: true,
					slots: false,
				},
			},
			overflowButton: {
				type: HTMLElement,
			},
		},
		properties:  {
			fixed: {
				type: Boolean,
			},
			collapsed: {
				type: Boolean,
			},
			tabsPlacement: {
				type: TabContainerTabsPlacement,
				defaultValue: TabContainerTabsPlacement.Top,
			},
			showOverflow: {
				type: Boolean,
			},
			tabLayout: {
				type: String,
				defaultValue: TabLayout.Standard,
			},
			mediaRange: {
				type: String,
			},
			_selectedTab: {
				type: Object,
			},
			_scrollable: {
				type: Boolean,
				noAttribute: true,
			},
			_scrollableBack: {
				type: Boolean,
				noAttribute: true,
			},
			_scrollableForward: {
				type: Boolean,
				noAttribute: true,
			},
			_animationRunning: {
				type: Boolean,
				noAttribute: true,
			},
			_contentCollapsed: {
				type: Boolean,
				noAttribute: true,
			},
		},
		events:  {
			"tab-select": {
				detail: {
					tab: { type: HTMLElement },
					tabIndex: { type: Number },
				},
			},
		},
	};
	class TabContainer extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return [tabStyles, TabContainer_css];
		}
		static get staticAreaStyles() {
			return [ResponsivePopoverCommon_css, staticAreaTabStyles];
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return TabContainerTemplate_lit;
		}
		static get staticAreaTemplate() {
			return TabContainerPopoverTemplate_lit;
		}
		static registerTabStyles(styles) {
			tabStyles.push(styles);
		}
		static registerStaticAreaTabStyles(styles) {
			staticAreaTabStyles.push(styles);
		}
		constructor() {
			super();
			this._handleResize = this._handleResize.bind(this);
			this._scrollEnablement = new ScrollEnablement__default(this);
			this._scrollEnablement.attachEvent("scroll", this._updateScrolling.bind(this));
			this._itemNavigation = new ItemNavigation__default(this, {
				getItemsCallback: () => this._getTabs(),
			});
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		onBeforeRendering() {
			this.items.filter(item => !item.isSeparator).forEach((item, index, arr) => {
				item._isInline = this.tabLayout === TabLayout.Inline;
				item._mixedMode = this.mixedMode;
				item._posinset = index + 1;
				item._setsize = arr.length;
				item._getTabContainerHeaderItemCallback = _ => {
					return this.getDomRef().querySelector(`#${item._id}`);
				};
				item._itemSelectCallback = this._onItemSelect.bind(this);
			});
			if (!this._animationRunning) {
				this._contentCollapsed = this.collapsed;
			}
		}
		onAfterRendering() {
			this._scrollEnablement.scrollContainer = this._getHeaderScrollContainer();
			this._updateScrolling();
		}
		onEnterDOM() {
			ResizeHandler__default.register(this._getHeader(), this._handleResize);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this._getHeader(), this._handleResize);
		}
		_onTablistFocusin(event) {
			const target = event.target;
			if (!this._scrollable || !target.classList.contains("ui5-tab-strip-item")) {
				return;
			}
			const headerScrollContainer = this._getHeaderScrollContainer();
			const leftArrowWidth = this.shadowRoot.querySelector(".ui5-tc__headerArrowLeft").offsetWidth;
			const rightArrowWidth = this.shadowRoot.querySelector(".ui5-tc__headerArrowRight").offsetWidth;
			if (this._scrollableBack && (target.offsetLeft - leftArrowWidth < headerScrollContainer.scrollLeft)) {
				this._scrollEnablement.move(target.offsetLeft - leftArrowWidth - headerScrollContainer.scrollLeft, 0, true);
				this._updateScrolling();
			} else if (this._scrollableForward && (target.offsetLeft + target.offsetWidth > headerScrollContainer.scrollLeft + headerScrollContainer.offsetWidth - rightArrowWidth)) {
				this._scrollEnablement.move(target.offsetLeft + target.offsetWidth - headerScrollContainer.scrollLeft - headerScrollContainer.offsetWidth + rightArrowWidth, 0, true);
				this._updateScrolling();
			}
		}
		_onHeaderClick(event) {
			const tab = getTab(event.target);
			if (!tab) {
				return;
			}
			this._onHeaderItemSelect(tab);
		}
		_onHeaderKeyDown(event) {
			const tab = getTab(event.target);
			if (!tab) {
				return;
			}
			if (Keys.isEnter(event)) {
				this._onHeaderItemSelect(tab);
			}
			if (Keys.isSpace(event)) {
				event.preventDefault();
			}
		}
		_onHeaderKeyUp(event) {
			const tab = getTab(event.target);
			if (!tab) {
				return;
			}
			if (Keys.isSpace(event)) {
				this._onHeaderItemSelect(tab);
			}
		}
		_onHeaderItemSelect(tab) {
			if (!tab.hasAttribute("disabled")) {
				this._onItemSelect(tab);
			}
		}
		_onOverflowListItemSelect(event) {
			this._onItemSelect(event.detail.item);
			this.responsivePopover.close();
			this.shadowRoot.querySelector(`#${event.detail.item.id}`).focus();
		}
		_onItemSelect(target) {
			const selectedIndex = findIndex(this.items, item => item._id === target.id);
			const selectedTabIndex = findIndex(this._getTabs(), item => item._id === target.id);
			const selectedTab = this.items[selectedIndex];
			this.items.forEach((item, index) => {
				if (!item.isSeparator) {
					const selected = selectedIndex === index;
					item.selected = selected;
					if (selected) {
						this._itemNavigation.setCurrentItem(item);
					}
				}
			}, this);
			if (this.fixed) {
				this.selectTab(selectedTab, selectedTabIndex);
				return;
			}
			if (!this.animate) {
				this.toggle(selectedTab);
				this.selectTab(selectedTab, selectedTabIndex);
				return;
			}
			this.toggleAnimated(selectedTab);
			this.selectTab(selectedTab, selectedTabIndex);
		}
		async toggleAnimated(selectedTab) {
			const content = this.shadowRoot.querySelector(".ui5-tc__content");
			let animationPromise = null;
			this._animationRunning = true;
			if (selectedTab === this._selectedTab) {
				this.collapsed = !this.collapsed;
				animationPromise = this.collapsed ? this.slideContentUp(content) : this.slideContentDown(content);
			} else {
				animationPromise = this.collapsed ? this.slideContentDown(content) : Promise.resolve();
				this.collapsed = false;
			}
			await animationPromise;
			this._contentCollapsed = this.collapsed;
			this._animationRunning = false;
		}
		toggle(selectedTab) {
			if (selectedTab === this._selectedTab) {
				this.collapsed = !this.collapsed;
			} else {
				this.collapsed = false;
			}
		}
		selectTab(selectedTab, selectedTabIndex) {
			this._selectedTab = selectedTab;
			this.fireEvent("tab-select", {
				tab: selectedTab,
				tabIndex: selectedTabIndex,
			});
		}
		slideContentDown(element) {
			return slideDown__default({ element }).promise();
		}
		slideContentUp(element) {
			return slideUp__default({ element }).promise();
		}
		async _onOverflowButtonClick(event) {
			const button = this.overflowButton[0] || this.getDomRef().querySelector(".ui-tc__overflowButton > ui5-button");
			if (event.target !== button) {
				return;
			}
			this.responsivePopover = await this._respPopover();
			if (this.responsivePopover.opened) {
				this.responsivePopover.close();
			} else {
				this.responsivePopover.showAt(button);
			}
		}
		_onHeaderBackArrowClick() {
			this._scrollEnablement.move(-SCROLL_STEP, 0).promise()
				.then(_ => this._updateScrolling());
		}
		_onHeaderForwardArrowClick() {
			this._scrollEnablement.move(SCROLL_STEP, 0).promise()
				.then(_ => this._updateScrolling());
		}
		_handleResize() {
			this._updateScrolling();
			this._updateMediaRange();
		}
		async _closeRespPopover() {
			this.responsivePopover = await this._respPopover();
			this.responsivePopover.close();
		}
		_updateScrolling() {
			const headerScrollContainer = this._getHeaderScrollContainer();
			this._scrollable = headerScrollContainer.offsetWidth < headerScrollContainer.scrollWidth;
			this._scrollableBack = headerScrollContainer.scrollLeft > 0;
			this._scrollableForward = Math.ceil(headerScrollContainer.scrollLeft) < headerScrollContainer.scrollWidth - headerScrollContainer.offsetWidth;
			if (!this._scrollable) {
				this._closeRespPopover();
			}
		}
		_updateMediaRange() {
			this.mediaRange = MediaRange__default.getCurrentRange(MediaRange__default.RANGESETS.RANGE_4STEPS, this.getDomRef().offsetWidth);
		}
		_getHeader() {
			return this.shadowRoot.querySelector(`#${this._id}-header`);
		}
		_getTabs() {
			return this.items.filter(item => !item.isSeparator);
		}
		_getHeaderScrollContainer() {
			return this.shadowRoot.querySelector(`#${this._id}-headerScrollContainer`);
		}
		async _respPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector(`#${this._id}-overflowMenu`);
		}
		get shouldShowOverflow() {
			return this.showOverflow && this._scrollable;
		}
		get classes() {
			return {
				root: {
					"ui5-tc-root": true,
					"ui5-tc--textOnly": this.textOnly,
				},
				header: {
					"ui5-tc__header": true,
					"ui5-tc__header--scrollable": this._scrollable,
				},
				headerInnerContainer: {
					"ui5-tc__headerInnerContainer": true,
				},
				headerScrollContainer: {
					"ui-tc__headerScrollContainer": true,
				},
				headerList: {
					"ui5-tc__headerList": true,
				},
				separator: {
					"ui5-tc__separator": true,
				},
				headerBackArrow: {
					"ui5-tc__headerArrow": true,
					"ui5-tc__headerArrowLeft": true,
					"ui5-tc__headerArrow--visible": this._scrollableBack,
				},
				headerForwardArrow: {
					"ui5-tc__headerArrow": true,
					"ui5-tc__headerArrowRight": true,
					"ui5-tc__headerArrow--visible": this._scrollableForward,
				},
				content: {
					"ui5-tc__content": true,
					"ui5-tc__content--collapsed": this._contentCollapsed,
				},
			};
		}
		get mixedMode() {
			return this.items.some(item => item.icon) && this.items.some(item => item.text);
		}
		get textOnly() {
			return this.items.every(item => !item.icon);
		}
		get previousIconACCName() {
			return this.i18nBundle.getText(i18nDefaults.TABCONTAINER_PREVIOUS_ICON_ACC_NAME);
		}
		get nextIconACCName() {
			return this.i18nBundle.getText(i18nDefaults.TABCONTAINER_NEXT_ICON_ACC_NAME);
		}
		get overflowMenuTitle() {
			return this.i18nBundle.getText(i18nDefaults.TABCONTAINER_OVERFLOW_MENU_TITLE);
		}
		get tabsAtTheBottom() {
			return this.tabsPlacement === TabContainerTabsPlacement.Bottom;
		}
		get overflowMenuIcon() {
			return this.tabsAtTheBottom ? "slim-arrow-up" : "slim-arrow-down";
		}
		get animate() {
			return AnimationMode.getAnimationMode() !== AnimationMode__default.None;
		}
		static get dependencies() {
			return [
				Button,
				Icon,
				List,
				ResponsivePopover,
			];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
	}
	const isTabLi = el => el.localName === "li" && el.getAttribute("role") === "tab";
	const getTab = el => {
		while (el) {
			if (isTabLi(el)) {
				return el;
			}
			el = el.parentElement;
		}
		return false;
	};
	const findIndex = (arr, predicate) => {
		for (let i = 0; i < arr.length; i++) {
			const result = predicate(arr[i]);
			if (result) {
				return i;
			}
		}
		return -1;
	};
	TabContainer.define();

	return TabContainer;

});
