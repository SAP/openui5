sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/animations/slideDown', 'sap/ui/webc/common/thirdparty/base/animations/slideUp', 'sap/ui/webc/common/thirdparty/base/types/AnimationMode', 'sap/ui/webc/common/thirdparty/base/config/AnimationMode', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/MediaRange', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-up', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-down', './generated/i18n/i18n-defaults', './Button', './Icon', './List', './ResponsivePopover', './types/TabContainerTabsPlacement', './generated/templates/TabContainerTemplate.lit', './generated/templates/TabContainerPopoverTemplate.lit', './generated/themes/TabContainer.css', './generated/themes/ResponsivePopoverCommon.css', './types/TabLayout', './types/TabsOverflowMode'], function (UI5Element, litRender, ResizeHandler, slideDown, slideUp, AnimationMode$1, AnimationMode, ItemNavigation, Keys, MediaRange, i18nBundle, slimArrowUp, slimArrowDown, i18nDefaults, Button, Icon, List, ResponsivePopover, TabContainerTabsPlacement, TabContainerTemplate_lit, TabContainerPopoverTemplate_lit, TabContainer_css, ResponsivePopoverCommon_css, TabLayout, TabsOverflowMode) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var slideDown__default = /*#__PURE__*/_interopDefaultLegacy(slideDown);
	var slideUp__default = /*#__PURE__*/_interopDefaultLegacy(slideUp);
	var AnimationMode__default = /*#__PURE__*/_interopDefaultLegacy(AnimationMode$1);
	var ItemNavigation__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigation);
	var MediaRange__default = /*#__PURE__*/_interopDefaultLegacy(MediaRange);

	const tabStyles = [];
	const staticAreaTabStyles = [];
	const metadata = {
		tag: "ui5-tabcontainer",
		languageAware: true,
		managedSlots: true,
		fastNavigation: true,
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
			startOverflowButton: {
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
			tabsOverflowMode: {
				type: TabsOverflowMode,
				defaultValue: TabsOverflowMode.End,
			},
			mediaRange: {
				type: String,
			},
			_selectedTab: {
				type: Object,
			},
			_animationRunning: {
				type: Boolean,
				noAttribute: true,
			},
			_contentCollapsed: {
				type: Boolean,
				noAttribute: true,
			},
			_startOverflowText: {
				type: String,
				noAttribute: true,
			},
			_endOverflowText: {
				type: String,
				noAttribute: true,
				defaultValue: "More",
			},
			_startOverflowItems: {
				type: Object,
				multiple: true,
			},
			_endOverflowItems: {
				type: Object,
				multiple: true,
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
			this._itemNavigation = new ItemNavigation__default(this, {
				getItemsCallback: () => this._getFocusableTabs(),
			});
		}
		onBeforeRendering() {
			const tabs = this._getTabs();
			if (tabs.length) {
				const selectedTabs = tabs.filter(tab => tab.selected);
				if (selectedTabs.length) {
					this._selectedTab = selectedTabs[0];
				} else {
					this._selectedTab = tabs[0];
					this._selectedTab._selected = true;
				}
			}
			this.items.filter(item => !item.isSeparator).forEach((item, index, arr) => {
				item._isInline = this.tabLayout === TabLayout.Inline;
				item._mixedMode = this.mixedMode;
				item._posinset = index + 1;
				item._setsize = arr.length;
				item._getTabContainerHeaderItemCallback = _ => {
					return this.getDomRef().querySelector(`#${item._id}`);
				};
				item._itemSelectCallback = this._onItemSelect.bind(this);
				item._getRealDomRef = () => this.getDomRef().querySelector(`*[data-ui5-stable=${item.stableDomRef}]`);
			});
			if (!this._animationRunning) {
				this._contentCollapsed = this.collapsed;
			}
			if (this.showOverflow) {
				console.warn(`The "show-overflow" property is deprecated and will be removed in a future release.`);
			}
		}
		onAfterRendering() {
			this.items.forEach(item => {
				item._getTabInStripDomRef = this.getDomRef().querySelector(`*[data-ui5-stable="${item.stableDomRef}"]`);
			});
		}
		onEnterDOM() {
			ResizeHandler__default.register(this._getHeader(), this._handleResize);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this._getHeader(), this._handleResize);
		}
		_onTabStripClick(event) {
			const tab = getTab(event.target);
			if (!tab) {
				return;
			}
			this._onHeaderItemSelect(tab);
		}
		_onTabStripKeyDown(event) {
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
		_onTabStripKeyUp(event) {
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
				if (!this.isModeStartAndEnd) {
					this._setItemsForStrip();
				}
			}
		}
		_onOverflowListItemClick(event) {
			event.preventDefault();
			const { item } = event.detail;
			this._onItemSelect(item);
			this.responsivePopover.close();
			this._setItemsForStrip();
			this.shadowRoot.querySelector(`#${item.id}`).focus();
		}
		_onItemSelect(target) {
			const selectedIndex = findIndex(this.items, item => item._id === target.id);
			const selectedTabIndex = findIndex(this._getTabs(), item => item._id === target.id);
			const selectedTab = this.items[selectedIndex];
			this.items
				.forEach((item, index) => {
					const selected = selectedIndex === index;
					item.selected = selected;
					if (item._selected) {
						item._selected = false;
					}
				});
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
		async _onOverflowClick(event) {
			if (event.target.classList.contains("ui5-tc__overflow")) {
				return;
			}
			const overflow = event.currentTarget;
			const isEndOverflow = overflow.classList.contains("ui5-tc__overflow--end");
			const isStartOverflow = overflow.classList.contains("ui5-tc__overflow--start");
			const items = [];
			const overflowAttr = isEndOverflow ? "end-overflow" : "start-overflow";
			this._startOverflowItems = [];
			this._endOverflowItems = [];
			this.items.forEach(item => {
				if (item.getTabInStripDomRef() && item.getTabInStripDomRef().hasAttribute(overflowAttr)) {
					items.push(item);
				}
			});
			let button;
			if (isEndOverflow) {
				button = this.overflowButton[0] || overflow.querySelector("[ui5-button]");
				this._endOverflowItems = items;
			}
			if (isStartOverflow) {
				button = this.startOverflowButton[0] || overflow.querySelector("[ui5-button]");
				this._startOverflowItems = items;
			}
			this.responsivePopover = await this._respPopover();
			if (this.responsivePopover.opened) {
				this.responsivePopover.close();
			} else {
				this.responsivePopover.initialFocus = this.responsivePopover.content[0].items.filter(item => item.classList.contains("ui5-tab-overflow-item"))[0].id;
				this.responsivePopover.showAt(button);
			}
		}
		async _onOverflowKeyDown(event) {
			const isEndOverflow = event.currentTarget.classList.contains("ui5-tc__overflow--end");
			const isStartOverflow = event.currentTarget.classList.contains("ui5-tc__overflow--start");
			switch (true) {
			case Keys.isDown(event):
			case isStartOverflow && Keys.isLeft(event):
			case isEndOverflow && Keys.isRight(event):
				await this._onOverflowClick(event);
			}
		}
		_handleResize() {
			if (this.responsivePopover && this.responsivePopover.opened) {
				this.responsivePopover.close();
			}
			this._updateMediaRange();
			this._setItemsForStrip();
		}
		_setItemsForStrip() {
			const tabStrip = this._getTabStrip();
			let allItemsWidth = 0;
			if (!this._selectedTab) {
				return;
			}
			const itemsDomRefs = this.items.map(item => item.getTabInStripDomRef());
			this._getStartOverflow().setAttribute("hidden", "");
			this._getEndOverflow().setAttribute("hidden", "");
			for (let i = 0; i < itemsDomRefs.length; i++) {
				itemsDomRefs[i].removeAttribute("hidden");
				itemsDomRefs[i].removeAttribute("start-overflow");
				itemsDomRefs[i].removeAttribute("end-overflow");
			}
			itemsDomRefs.forEach(item => {
				allItemsWidth += this._getItemWidth(item);
			});
			const hasOverflow = tabStrip.offsetWidth < allItemsWidth;
			if (!hasOverflow) {
				this._closeRespPopover();
				return;
			}
			if (this.isModeStartAndEnd) {
				this._updateStartAndEndOverflow(itemsDomRefs);
				this._updateOverflowCounters();
			} else {
				this._updateEndOverflow(itemsDomRefs);
			}
			this._itemNavigation._init();
			this._itemNavigation.setCurrentItem(this._selectedTab);
		}
		_updateEndOverflow(itemsDomRefs) {
			this._getEndOverflow().removeAttribute("hidden");
			const selectedTabDomRef = this._selectedTab.getTabInStripDomRef();
			const containerWidth = this._getTabStrip().offsetWidth;
			const selectedItemIndexAndWidth = this._getSelectedItemIndexAndWidth(itemsDomRefs, selectedTabDomRef);
			const lastVisibleTabIndex = this._findLastVisibleItem(itemsDomRefs, containerWidth, selectedItemIndexAndWidth.width);
			for (let i = lastVisibleTabIndex + 1; i < itemsDomRefs.length; i++) {
				itemsDomRefs[i].setAttribute("hidden", "");
				itemsDomRefs[i].setAttribute("end-overflow", "");
			}
			this._endOverflowText = this.overflowButtonText;
		}
		_updateStartAndEndOverflow(itemsDomRefs) {
			let containerWidth = this._getTabStrip().offsetWidth;
			const selectedTabDomRef = this._selectedTab.getTabInStripDomRef();
			const selectedItemIndexAndWidth = this._getSelectedItemIndexAndWidth(itemsDomRefs, selectedTabDomRef);
			const hasStartOverflow = this._hasStartOverflow(containerWidth, itemsDomRefs, selectedItemIndexAndWidth);
			const hasEndOverflow = this._hasEndOverflow(containerWidth, itemsDomRefs, selectedItemIndexAndWidth);
			let firstVisible;
			let lastVisible;
			if (!hasStartOverflow) {
				this._getEndOverflow().removeAttribute("hidden");
				containerWidth = this._getTabStrip().offsetWidth;
				lastVisible = this._findLastVisibleItem(itemsDomRefs, containerWidth, selectedItemIndexAndWidth.width);
				for (let i = lastVisible + 1; i < itemsDomRefs.length; i++) {
					itemsDomRefs[i].setAttribute("hidden", "");
					itemsDomRefs[i].setAttribute("end-overflow", "");
				}
				return;
			}
			if (!hasEndOverflow) {
				this._getStartOverflow().removeAttribute("hidden");
				containerWidth = this._getTabStrip().offsetWidth;
				firstVisible = this._findFirstVisibleItem(itemsDomRefs, containerWidth, selectedItemIndexAndWidth.width);
				for (let i = firstVisible - 1; i >= 0; i--) {
					itemsDomRefs[i].setAttribute("hidden", "");
					itemsDomRefs[i].setAttribute("start-overflow", "");
				}
				return;
			}
			this._getStartOverflow().removeAttribute("hidden");
			this._getEndOverflow().removeAttribute("hidden");
			containerWidth = this._getTabStrip().offsetWidth;
			firstVisible = this._findFirstVisibleItem(itemsDomRefs, containerWidth, selectedItemIndexAndWidth.width, selectedItemIndexAndWidth.index - 1);
			lastVisible = this._findLastVisibleItem(itemsDomRefs, containerWidth, selectedItemIndexAndWidth.width, firstVisible);
			for (let i = firstVisible - 1; i >= 0; i--) {
				itemsDomRefs[i].setAttribute("hidden", "");
				itemsDomRefs[i].setAttribute("start-overflow", "");
			}
			for (let i = lastVisible + 1; i < itemsDomRefs.length; i++) {
				itemsDomRefs[i].setAttribute("hidden", "");
				itemsDomRefs[i].setAttribute("end-overflow", "");
			}
		}
		_hasStartOverflow(containerWidth, itemsDomRefs, selectedItemIndexAndWidth) {
			if (selectedItemIndexAndWidth.index === 0) {
				return false;
			}
			let leftItemsWidth = 0;
			for (let i = selectedItemIndexAndWidth.index - 1; i >= 0; i--) {
				leftItemsWidth += this._getItemWidth(itemsDomRefs[i]);
			}
			let hasStartOverflow = containerWidth < leftItemsWidth + selectedItemIndexAndWidth.width;
			if (!hasStartOverflow) {
				this._getEndOverflow().removeAttribute("hidden");
				containerWidth = this._getTabStrip().offsetWidth;
				hasStartOverflow = containerWidth < leftItemsWidth + selectedItemIndexAndWidth.width;
				this._getEndOverflow().setAttribute("hidden", "");
			}
			return hasStartOverflow;
		}
		_hasEndOverflow(containerWidth, itemsDomRefs, selectedItemIndexAndWidth) {
			if (selectedItemIndexAndWidth.index >= itemsDomRefs.length) {
				return false;
			}
			let rightItemsWidth = 0;
			for (let i = selectedItemIndexAndWidth.index; i < itemsDomRefs.length; i++) {
				rightItemsWidth += this._getItemWidth(itemsDomRefs[i]);
			}
			let hasEndOverflow = containerWidth < rightItemsWidth + selectedItemIndexAndWidth.width;
			if (!hasEndOverflow) {
				this._getStartOverflow().removeAttribute("hidden");
				containerWidth = this._getTabStrip().offsetWidth;
				hasEndOverflow = containerWidth < rightItemsWidth + selectedItemIndexAndWidth.width;
				this._getStartOverflow().setAttribute("hidden", "");
			}
			return hasEndOverflow;
		}
		_getItemWidth(itemDomRef) {
			const styles = window.getComputedStyle(itemDomRef);
			const margins = Number.parseInt(styles.marginLeft) + Number.parseInt(styles.marginRight);
			return itemDomRef.offsetWidth + margins;
		}
		_getSelectedItemIndexAndWidth(itemsDomRefs, selectedTabDomRef) {
			let index = itemsDomRefs.indexOf(selectedTabDomRef);
			let width = selectedTabDomRef.offsetWidth;
			let selectedSeparator;
			if (itemsDomRefs[index - 1] && itemsDomRefs[index - 1].isSeparator) {
				selectedSeparator = itemsDomRefs[index - 1];
				width += this._getItemWidth(selectedSeparator);
			}
			itemsDomRefs.splice(index, 1);
			if (selectedSeparator) {
				itemsDomRefs.splice(index - 1, 1);
				index--;
			}
			return {
				index,
				width,
			};
		}
		_findFirstVisibleItem(itemsDomRefs, containerWidth, selectedItemWidth, startIndex) {
			if (startIndex === undefined) {
				startIndex = itemsDomRefs.length - 1;
			}
			let lastVisible = startIndex + 1;
			for (let index = startIndex; index >= 0; index--) {
				const itemWidth = this._getItemWidth(itemsDomRefs[index]);
				if (containerWidth < selectedItemWidth + itemWidth) {
					break;
				}
				selectedItemWidth += itemWidth;
				lastVisible = index;
			}
			return lastVisible;
		}
		_findLastVisibleItem(itemsDomRefs, containerWidth, selectedItemWidth, startIndex) {
			startIndex = startIndex || 0;
			let lastVisibleIndex = startIndex - 1;
			let index = startIndex;
			for (; index < itemsDomRefs.length; index++) {
				const itemWidth = this._getItemWidth(itemsDomRefs[index]);
				if (containerWidth < selectedItemWidth + itemWidth) {
					break;
				}
				selectedItemWidth += itemWidth;
				lastVisibleIndex = index;
			}
			const prevItem = itemsDomRefs[index - 1];
			if (prevItem && prevItem.isSeparator) {
				lastVisibleIndex -= 1;
			}
			return lastVisibleIndex;
		}
		get isModeStartAndEnd() {
			return this.tabsOverflowMode === TabsOverflowMode.StartAndEnd;
		}
		_updateOverflowCounters() {
			let startOverflowItemsCount = 0;
			let endOverflowItemsCount = 0;
			this._getTabs()
				.map(tab => tab.getTabInStripDomRef())
				.forEach(tab => {
					if (tab.hasAttribute("start-overflow")) {
						startOverflowItemsCount++;
					}
					if (tab.hasAttribute("end-overflow")) {
						endOverflowItemsCount++;
					}
				});
			this._startOverflowText = `+${startOverflowItemsCount}`;
			this._endOverflowText = `+${endOverflowItemsCount}`;
		}
		async _closeRespPopover() {
			this.responsivePopover = await this._respPopover();
			this.responsivePopover.close();
		}
		_getFocusableTabs() {
			if (!this.getDomRef()) {
				return [];
			}
			const focusableTabs = [];
			if (!this._getStartOverflow().hasAttribute("hidden")) {
				focusableTabs.push(this._getStartOverflow().querySelector("[ui5-button]"));
			}
			this._getTabs().forEach(tab => {
				if (tab.getTabInStripDomRef() && !tab.getTabInStripDomRef().hasAttribute("hidden")) {
					focusableTabs.push(tab);
				}
			});
			if (!this._getEndOverflow().hasAttribute("hidden")) {
				focusableTabs.push(this._getEndOverflow().querySelector("[ui5-button]"));
			}
			return focusableTabs;
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
		_getTabStrip() {
			return this.shadowRoot.querySelector(`#${this._id}-tabStrip`);
		}
		_getStartOverflow() {
			return this.shadowRoot.querySelector(".ui5-tc__overflow--start");
		}
		_getEndOverflow() {
			return this.shadowRoot.querySelector(".ui5-tc__overflow--end");
		}
		async _respPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector(`#${this._id}-overflowMenu`);
		}
		get classes() {
			return {
				root: {
					"ui5-tc-root": true,
					"ui5-tc--textOnly": this.textOnly,
					"ui5-tc--withAdditionalText": this.withAdditionalText,
					"ui5-tc--standardTabLayout": this.standardTabLayout,
				},
				header: {
					"ui5-tc__header": true,
				},
				tabStrip: {
					"ui5-tc__tabStrip": true,
				},
				separator: {
					"ui5-tc__separator": true,
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
		get withAdditionalText() {
			return this.items.some(item => !!item.additionalText);
		}
		get standardTabLayout() {
			return this.tabLayout === TabLayout.Standard;
		}
		get previousIconACCName() {
			return TabContainer.i18nBundle.getText(i18nDefaults.TABCONTAINER_PREVIOUS_ICON_ACC_NAME);
		}
		get nextIconACCName() {
			return TabContainer.i18nBundle.getText(i18nDefaults.TABCONTAINER_NEXT_ICON_ACC_NAME);
		}
		get overflowMenuTitle() {
			return TabContainer.i18nBundle.getText(i18nDefaults.TABCONTAINER_OVERFLOW_MENU_TITLE);
		}
		get tabsAtTheBottom() {
			return this.tabsPlacement === TabContainerTabsPlacement.Bottom;
		}
		get overflowMenuIcon() {
			return this.tabsAtTheBottom ? "slim-arrow-up" : "slim-arrow-down";
		}
		get overflowButtonText() {
			return TabContainer.i18nBundle.getText(i18nDefaults.TABCONTAINER_END_OVERFLOW);
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
			TabContainer.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
	}
	const isTabDiv = el => el.localName === "div" && el.getAttribute("role") === "tab";
	const getTab = el => {
		while (el) {
			if (isTabDiv(el)) {
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
