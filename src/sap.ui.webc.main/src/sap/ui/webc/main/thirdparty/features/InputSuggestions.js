sap.ui.define(['sap/ui/webc/common/thirdparty/base/FeaturesRegistry', 'sap/ui/webc/common/thirdparty/base/i18nBundle', '../List', '../ResponsivePopover', '../SuggestionItem', '../SuggestionGroupItem', '../Button', '../GroupHeaderListItem', '../SuggestionListItem', '../generated/i18n/i18n-defaults'], function (FeaturesRegistry, i18nBundle, List, ResponsivePopover, SuggestionItem, SuggestionGroupItem, Button, GroupHeaderListItem, SuggestionListItem, i18nDefaults) { 'use strict';

	class Suggestions {
		constructor(component, slotName, highlight, handleFocus) {
			this.component = component;
			this.slotName = slotName;
			this.handleFocus = handleFocus;
			this.highlight = highlight;
			this.fnOnSuggestionItemPress = this.onItemPress.bind(this);
			this.fnOnSuggestionItemFocus = this.onItemFocused.bind(this);
			this.fnOnSuggestionItemMouseOver = this.onItemMouseOver.bind(this);
			this.fnOnSuggestionItemMouseOut = this.onItemMouseOut.bind(this);
			this.selectedItemIndex = null;
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
			this.accInfo = {};
		}
		defaultSlotProperties(hightlightValue) {
			const inputSuggestionItems = this._getComponent().suggestionItems;
			const highlight = this.highlight && !!hightlightValue;
			const suggestions = [];
			inputSuggestionItems.map((suggestion, idx) => {
				const text = highlight ? this.getHighlightedText(suggestion, hightlightValue) : this.getRowText(suggestion);
				const description = highlight ? this.getHighlightedDesc(suggestion, hightlightValue) : this.getRowDesc(suggestion);
				return suggestions.push({
					text,
					description,
					image: suggestion.image || undefined,
					icon: suggestion.icon || undefined,
					type: suggestion.type || undefined,
					additionalText: suggestion.additionalText || undefined,
					additionalTextState: suggestion.additionalTextState,
					groupItem: suggestion.groupItem,
					key: idx,
				});
			});
			return suggestions;
		}
		onUp(event) {
			event.preventDefault();
			this._handleItemNavigation(false );
			return true;
		}
		onDown(event) {
			event.preventDefault();
			this._handleItemNavigation(true );
			return true;
		}
		onSpace(event) {
			if (this._isItemOnTarget()) {
				event.preventDefault();
				this.onItemSelected(null, true );
				return true;
			}
			return false;
		}
		onEnter(event) {
			if (this._isItemOnTarget()) {
				this.onItemSelected(null, true );
				return true;
			}
			return false;
		}
		onTab(event) {
			if (this._isItemOnTarget()) {
				this.onItemSelected(null, true);
				return true;
			}
			return false;
		}
		toggle(bToggle, { preventFocusRestore }) {
			const toggle = bToggle !== undefined ? bToggle : !this.isOpened();
			if (toggle) {
				this.open();
			} else {
				this.close(preventFocusRestore);
			}
		}
		async _isScrollable() {
			const sc = await this._getScrollContainer();
			return sc.offsetHeight < sc.scrollHeight;
		}
		async open() {
			this.responsivePopover = await this._respPopover();
			this._beforeOpen();
			if (this._getItems().length) {
				this.responsivePopover.showAt(this._getComponent());
			}
		}
		async close(preventFocusRestore = false) {
			this.responsivePopover = await this._respPopover();
			this.responsivePopover.close(false, false, preventFocusRestore);
		}
		updateSelectedItemPosition(pos) {
			this.selectedItemIndex = pos;
		}
		onItemFocused() {
			this._getComponent().onItemFocused();
		}
		onItemMouseOver(event) {
			this._getComponent().onItemMouseOver(event);
		}
		onItemMouseOut(event) {
			this._getComponent().onItemMouseOut(event);
		}
		onItemSelected(selectedItem, keyboardUsed) {
			const allItems = this._getItems();
			const item = selectedItem || allItems[this.selectedItemIndex];
			this.selectedItemIndex = allItems.indexOf(item);
			this.accInfo = {
				currentPos: this.selectedItemIndex + 1,
				listSize: allItems.length,
				itemText: item.textContent,
			};
			if (item.type === "Inactive") {
				return;
			}
			if (item.group) {
				return;
			}
			this._getComponent().onItemSelected(this._getRealItems()[this.selectedItemIndex], keyboardUsed);
			item.selected = false;
			this.close();
		}
		onItemPreviewed(item) {
			this._getComponent().onItemPreviewed(item);
		}
		onItemPress(oEvent) {
			this.onItemSelected(oEvent.detail.item, false );
		}
		_beforeOpen() {
			this._attachItemsListeners();
			this._attachPopupListeners();
		}
		async _attachItemsListeners() {
			const list = await this._getList();
			list.removeEventListener("ui5-item-press", this.fnOnSuggestionItemPress);
			list.addEventListener("ui5-item-press", this.fnOnSuggestionItemPress);
			list.removeEventListener("ui5-item-focused", this.fnOnSuggestionItemFocus);
			list.addEventListener("ui5-item-focused", this.fnOnSuggestionItemFocus);
			list.removeEventListener("mouseover", this.fnOnSuggestionItemMouseOver);
			list.addEventListener("mouseover", this.fnOnSuggestionItemMouseOver);
			list.removeEventListener("mouseout", this.fnOnSuggestionItemMouseOut);
			list.addEventListener("mouseout", this.fnOnSuggestionItemMouseOut);
		}
		_attachPopupListeners() {
			if (!this.handleFocus) {
				return;
			}
			if (!this.attachedAfterOpened) {
				this._respPopover.addEventListener("ui5-after-open", this._onOpen.bind(this));
				this.attachedAfterOpened = true;
			}
			if (!this.attachedAfterClose) {
				this._respPopover.addEventListener("ui5-after-close", this._onClose.bind(this));
				this.attachedAfterClose = true;
			}
		}
		_onOpen() {
			this._applyFocus();
			this._getComponent().onOpen();
		}
		_onClose() {
			this._getComponent().onClose();
		}
		_applyFocus() {
			if (this.selectedItemIndex) {
				this._getItems()[this.selectedItemIndex].focus();
			}
		}
		_isItemOnTarget() {
			return this.isOpened() && this.selectedItemIndex !== null;
		}
		isOpened() {
			return !!(this.responsivePopover && this.responsivePopover.opened);
		}
		_handleItemNavigation(forward) {
			if (!this._getItems().length) {
				return;
			}
			if (forward) {
				this._selectNextItem();
			} else {
				this._selectPreviousItem();
			}
		}
		_selectNextItem() {
			const itemsCount = this._getItems().length;
			const previousSelectedIdx = this.selectedItemIndex;
			if ((this.selectedItemIndex === null) || (++this.selectedItemIndex > itemsCount - 1)) {
				this.selectedItemIndex = 0;
			}
			this._moveItemSelection(previousSelectedIdx, this.selectedItemIndex);
		}
		_selectPreviousItem() {
			const itemsCount = this._getItems().length;
			const previousSelectedIdx = this.selectedItemIndex;
			if ((this.selectedItemIndex === null) || (--this.selectedItemIndex < 0)) {
				this.selectedItemIndex = itemsCount - 1;
			}
			this._moveItemSelection(previousSelectedIdx, this.selectedItemIndex);
		}
		_moveItemSelection(previousIdx, nextIdx) {
			const items = this._getItems();
			const currentItem = items[nextIdx];
			const previousItem = items[previousIdx];
			this.accInfo = {
				currentPos: nextIdx + 1,
				listSize: items.length,
				itemText: currentItem.textContent,
			};
			if (previousItem) {
				previousItem.selected = false;
			}
			if (currentItem) {
				currentItem.selected = true;
				if (this.handleFocus) {
					currentItem.focus();
				}
			}
			this.onItemPreviewed(currentItem);
			if (!this._isItemIntoView(currentItem)) {
				this._scrollItemIntoView(currentItem);
			}
		}
		_deselectItems() {
			const items = this._getItems();
			items.forEach(item => {
				item.selected = false;
			});
		}
		_isItemIntoView(item) {
			const rectItem = item.getDomRef().getBoundingClientRect();
			const rectInput = this._getComponent().getDomRef().getBoundingClientRect();
			const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
			return (rectItem.top + Suggestions.SCROLL_STEP <= windowHeight) && (rectItem.top >= rectInput.top);
		}
		async _scrollItemIntoView(item) {
			const pos = item.getDomRef().offsetTop;
			const scrollContainer = await this._getScrollContainer();
			scrollContainer.scrollTop = pos;
		}
		async _getScrollContainer() {
			if (!this._scrollContainer) {
				await this._respPopover();
				this._scrollContainer = this.responsivePopover.shadowRoot.querySelector(".ui5-popup-content");
			}
			return this._scrollContainer;
		}
		_getItems() {
			return [...this.responsivePopover.querySelector("[ui5-list]").children];
		}
		_getComponent() {
			return this.component;
		}
		async _getList() {
			this.responsivePopover = await this._respPopover();
			return this.responsivePopover.querySelector("[ui5-list]");
		}
		async _getListWidth() {
			const list = await this._getList();
			return list.offsetWidth;
		}
		_getRealItems() {
			return this._getComponent().getSlottedNodes(this.slotName);
		}
		async _respPopover() {
			if (this.responsivePopover) {
				return this.responsivePopover;
			}
			const staticAreaItem = await this._getComponent().getStaticAreaItemDomRef();
			this.responsivePopover = staticAreaItem.querySelector("[ui5-responsive-popover]");
			return this.responsivePopover;
		}
		get itemSelectionAnnounce() {
			const i18nBundle = this.i18nBundle,
				itemPositionText = i18nBundle.getText(i18nDefaults.LIST_ITEM_POSITION, [this.accInfo.currentPos], [this.accInfo.listSize]),
				itemSelectionText = i18nBundle.getText(i18nDefaults.LIST_ITEM_SELECTED);
			return `${itemPositionText} ${this.accInfo.itemText} ${itemSelectionText}`;
		}
		getRowText(suggestion) {
			return this.sanitizeText(suggestion.text || suggestion.textContent);
		}
		getRowDesc(suggestion) {
			if (suggestion.description) {
				return this.sanitizeText(suggestion.description);
			}
		}
		getHighlightedText(suggestion, input) {
			let text = suggestion.text || suggestion.textContent;
			text = this.sanitizeText(text);
			return this.hightlightInput(text, input);
		}
		getHighlightedDesc(suggestion, input) {
			let text = suggestion.description;
			text = this.sanitizeText(text);
			return this.hightlightInput(text, input);
		}
		hightlightInput(text, input) {
			if (!text) {
				return text;
			}
			const inputEscaped = input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const regEx = new RegExp(inputEscaped, "ig");
			return text.replace(regEx, match => `<b>${match}</b>`);
		}
		sanitizeText(text) {
			return text && text.replace("<", "&lt");
		}
		static get dependencies() {
			return [
				SuggestionItem,
				SuggestionGroupItem,
				ResponsivePopover,
				List,
				SuggestionListItem,
				GroupHeaderListItem,
				Button,
			];
		}
	}
	Suggestions.SCROLL_STEP = 60;
	FeaturesRegistry.registerFeature("InputSuggestions", Suggestions);

	return Suggestions;

});
