sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/Render', 'sap/ui/webc/common/thirdparty/base/util/TabbableElements', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/types/NavigationMode', 'sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/util/debounce', 'sap/ui/webc/common/thirdparty/base/util/isElementInView', './types/ListMode', './types/ListGrowingMode', './types/ListSeparators', './BusyIndicator', './generated/templates/ListTemplate.lit', './generated/themes/List.css', './generated/themes/BrowserScrollbar.css', './generated/i18n/i18n-defaults'], function (UI5Element, litRender, ResizeHandler, ItemNavigation, Render, TabbableElements, Keys, Integer, NavigationMode, AriaLabelHelper, i18nBundle, debounce, isElementInView, ListMode, ListGrowingMode, ListSeparators, BusyIndicator, ListTemplate_lit, List_css, BrowserScrollbar_css, i18nDefaults) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var ItemNavigation__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigation);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var NavigationMode__default = /*#__PURE__*/_interopDefaultLegacy(NavigationMode);
	var debounce__default = /*#__PURE__*/_interopDefaultLegacy(debounce);
	var isElementInView__default = /*#__PURE__*/_interopDefaultLegacy(isElementInView);

	const INFINITE_SCROLL_DEBOUNCE_RATE = 250;
	const PAGE_UP_DOWN_SIZE = 10;
	const metadata = {
		tag: "ui5-list",
		managedSlots: true,
		fastNavigation: true,
		slots:  {
			header: {
				type: HTMLElement,
			},
			"default": {
				propertyName: "items",
				type: HTMLElement,
			},
		},
		properties:  {
			headerText: {
				type: String,
			},
			footerText: {
				type: String,
			},
			indent: {
				type: Boolean,
			},
			mode: {
				type: ListMode,
				defaultValue: ListMode.None,
			},
			noDataText: {
				type: String,
			},
			separators: {
				type: ListSeparators,
				defaultValue: ListSeparators.All,
			},
			growing: {
				type: ListGrowingMode,
				defaultValue: ListGrowingMode.None,
			},
			busy: {
				type: Boolean,
			},
			busyDelay: {
				type: Integer__default,
				defaultValue: 1000,
			},
			accessibleName: {
				type: String,
			},
			accessibleNameRef: {
				type: String,
				defaultValue: "",
			},
			accessibleRole: {
				type: String,
				defaultValue: "list",
			},
			_inViewport: {
				type: Boolean,
			},
			_loadMoreActive: {
				type: Boolean,
			},
		},
		events:  {
			"item-click": {
				detail: {
					item: { type: HTMLElement },
				},
			},
			"item-close": {
				detail: {
					item: { type: HTMLElement },
				},
			},
			"item-toggle": {
				detail: {
					item: { type: HTMLElement },
				},
			},
			"item-delete": {
				detail: {
					item: { type: HTMLElement },
				},
			},
			"selection-change": {
				detail: {
					selectedItems: { type: Array },
					previouslySelectedItems: { type: Array },
					selectionComponentPressed: { type: Boolean },
				},
			},
			"load-more": {},
		},
	};
	class List extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return ListTemplate_lit;
		}
		static get styles() {
			return [BrowserScrollbar_css, List_css];
		}
		static async onDefine() {
			List.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		static get dependencies() {
			return [BusyIndicator];
		}
		constructor() {
			super();
			this.initItemNavigation();
			this._previouslyFocusedItem = null;
			this._forwardingFocus = false;
			this._previouslySelectedItem = null;
			this.resizeListenerAttached = false;
			this.listEndObserved = false;
			this.addEventListener("ui5-_press", this.onItemPress.bind(this));
			this.addEventListener("ui5-close", this.onItemClose.bind(this));
			this.addEventListener("ui5-toggle", this.onItemToggle.bind(this));
			this.addEventListener("ui5-_focused", this.onItemFocused.bind(this));
			this.addEventListener("ui5-_forward-after", this.onForwardAfter.bind(this));
			this.addEventListener("ui5-_forward-before", this.onForwardBefore.bind(this));
			this.addEventListener("ui5-_selection-requested", this.onSelectionRequested.bind(this));
			this.addEventListener("ui5-_focus-requested", this.focusUploadCollectionItem.bind(this));
			this._handleResize = this.checkListInViewport.bind(this);
			this.initialIntersection = true;
		}
		onExitDOM() {
			this.unobserveListEnd();
			this.resizeListenerAttached = false;
			ResizeHandler__default.deregister(this.getDomRef(), this._handleResize);
		}
		onBeforeRendering() {
			this.prepareListItems();
		}
		onAfterRendering() {
			if (this.growsOnScroll) {
				this.observeListEnd();
			} else if (this.listEndObserved) {
				this.unobserveListEnd();
			}
			if (this.grows) {
				this.checkListInViewport();
				this.attachForResize();
			}
		}
		attachForResize() {
			if (!this.resizeListenerAttached) {
				this.resizeListenerAttached = true;
				ResizeHandler__default.register(this.getDomRef(), this._handleResize);
			}
		}
		get shouldRenderH1() {
			return !this.header.length && this.headerText;
		}
		get headerID() {
			return `${this._id}-header`;
		}
		get modeLabelID() {
			return `${this._id}-modeLabel`;
		}
		get listEndDOM() {
			return this.shadowRoot.querySelector(".ui5-list-end-marker");
		}
		get hasData() {
			return this.getSlottedNodes("items").length !== 0;
		}
		get showNoDataText() {
			return !this.hasData && this.noDataText;
		}
		get isDelete() {
			return this.mode === ListMode.Delete;
		}
		get isSingleSelect() {
			return [
				ListMode.SingleSelect,
				ListMode.SingleSelectBegin,
				ListMode.SingleSelectEnd,
				ListMode.SingleSelectAuto,
			].includes(this.mode);
		}
		get isMultiSelect() {
			return this.mode === ListMode.MultiSelect;
		}
		get ariaLabelledBy() {
			if (this.accessibleNameRef || this.accessibleName) {
				return undefined;
			}
			const ids = [];
			if (this.isMultiSelect || this.isSingleSelect || this.isDelete) {
				ids.push(this.modeLabelID);
			}
			if (this.shouldRenderH1) {
				ids.push(this.headerID);
			}
			return ids.length ? ids.join(" ") : undefined;
		}
		get ariaLabelTxt() {
			return AriaLabelHelper.getEffectiveAriaLabelText(this);
		}
		get ariaLabelModeText() {
			if (this.isMultiSelect) {
				return List.i18nBundle.getText(i18nDefaults.ARIA_LABEL_LIST_MULTISELECTABLE);
			}
			if (this.isSingleSelect) {
				return List.i18nBundle.getText(i18nDefaults.ARIA_LABEL_LIST_SELECTABLE);
			}
			if (this.isDelete) {
				return List.i18nBundle.getText(i18nDefaults.ARIA_LABEL_LIST_DELETABLE);
			}
			return undefined;
		}
		get grows() {
			return this.growing !== ListGrowingMode.None;
		}
		get growsOnScroll() {
			return this.growing === ListGrowingMode.Scroll;
		}
		get growsWithButton() {
			return this.growing === ListGrowingMode.Button;
		}
		get _growingButtonText() {
			return List.i18nBundle.getText(i18nDefaults.LOAD_MORE_TEXT);
		}
		get busyIndPosition() {
			if (!this.grows) {
				return "absolute";
			}
			return this._inViewport ? "absolute" : "sticky";
		}
		get styles() {
			return {
				busyInd: {
					position: this.busyIndPosition,
				},
			};
		}
		initItemNavigation() {
			this._itemNavigation = new ItemNavigation__default(this, {
				skipItemsSize: PAGE_UP_DOWN_SIZE,
				navigationMode: NavigationMode__default.Vertical,
				getItemsCallback: () => this.getEnabledItems(),
			});
		}
		prepareListItems() {
			const slottedItems = this.getSlottedNodes("items");
			slottedItems.forEach((item, key) => {
				const isLastChild = key === slottedItems.length - 1;
				const showBottomBorder = this.separators === ListSeparators.All
					|| (this.separators === ListSeparators.Inner && !isLastChild);
				item._mode = this.mode;
				item.hasBorder = showBottomBorder;
			});
			this._previouslySelectedItem = null;
		}
		async observeListEnd() {
			if (!this.listEndObserved) {
				await Render.renderFinished();
				this.getIntersectionObserver().observe(this.listEndDOM);
				this.listEndObserved = true;
			}
		}
		unobserveListEnd() {
			if (this.growingIntersectionObserver) {
				this.growingIntersectionObserver.disconnect();
				this.growingIntersectionObserver = null;
				this.listEndObserved = false;
			}
		}
		onInteresection(entries) {
			if (this.initialIntersection) {
				this.initialIntersection = false;
				return;
			}
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					debounce__default(this.loadMore.bind(this), INFINITE_SCROLL_DEBOUNCE_RATE);
				}
			});
		}
		onSelectionRequested(event) {
			const previouslySelectedItems = this.getSelectedItems();
			let selectionChange = false;
			this._selectionRequested = true;
			if (this[`handle${this.mode}`]) {
				selectionChange = this[`handle${this.mode}`](event.detail.item, event.detail.selected);
			}
			if (selectionChange) {
				this.fireEvent("selection-change", {
					selectedItems: this.getSelectedItems(),
					previouslySelectedItems,
					selectionComponentPressed: event.detail.selectionComponentPressed,
					key: event.detail.key,
				});
			}
		}
		handleSingleSelect(item) {
			if (item.selected) {
				return false;
			}
			this.deselectSelectedItems();
			item.selected = true;
			return true;
		}
		handleSingleSelectBegin(item) {
			return this.handleSingleSelect(item);
		}
		handleSingleSelectEnd(item) {
			return this.handleSingleSelect(item);
		}
		handleSingleSelectAuto(item) {
			return this.handleSingleSelect(item);
		}
		handleMultiSelect(item, selected) {
			item.selected = selected;
			return true;
		}
		handleDelete(item) {
			this.fireEvent("item-delete", { item });
		}
		deselectSelectedItems() {
			this.getSelectedItems().forEach(item => { item.selected = false; });
		}
		getSelectedItems() {
			return this.getSlottedNodes("items").filter(item => item.selected);
		}
		getEnabledItems() {
			return this.getSlottedNodes("items").filter(item => !item.disabled);
		}
		_onkeydown(event) {
			if (Keys.isTabNext(event)) {
				this._handleTabNext(event);
			}
		}
		_onLoadMoreKeydown(event) {
			if (Keys.isSpace(event)) {
				event.preventDefault();
				this._loadMoreActive = true;
			}
			if (Keys.isEnter(event)) {
				this._onLoadMoreClick();
				this._loadMoreActive = true;
			}
			if (Keys.isTabNext(event)) {
				this.focusAfterElement();
			}
			if (Keys.isTabPrevious(event)) {
				if (this.getPreviouslyFocusedItem()) {
					this.focusPreviouslyFocusedItem();
				} else {
					this.focusFirstItem();
				}
				event.preventDefault();
			}
		}
		_onLoadMoreKeyup(event) {
			if (Keys.isSpace(event)) {
				this._onLoadMoreClick();
			}
			this._loadMoreActive = false;
		}
		_onLoadMoreMousedown() {
			this._loadMoreActive = true;
		}
		_onLoadMoreMouseup() {
			this._loadMoreActive = false;
		}
		_onLoadMoreClick() {
			this.loadMore();
		}
		checkListInViewport() {
			this._inViewport = isElementInView__default(this.getDomRef());
		}
		loadMore() {
			this.fireEvent("load-more");
		}
		_handleTabNext(event) {
			let lastTabbableEl;
			const target = this.getNormalizedTarget(event.target);
			if (this.headerToolbar) {
				lastTabbableEl = this.getHeaderToolbarLastTabbableElement();
			}
			if (!lastTabbableEl) {
				return;
			}
			if (lastTabbableEl === target) {
				if (this.getFirstItem(x => x.selected && !x.disabled)) {
					this.focusFirstSelectedItem();
				} else if (this.getPreviouslyFocusedItem()) {
					this.focusPreviouslyFocusedItem();
				} else {
					this.focusFirstItem();
				}
				event.stopImmediatePropagation();
				event.preventDefault();
			}
		}
		_onfocusin(event) {
			const target = this.getNormalizedTarget(event.target);
			if (!this.isForwardElement(target)) {
				event.stopImmediatePropagation();
				return;
			}
			if (!this.getPreviouslyFocusedItem()) {
				if (this.growsWithButton && this.isForwardAfterElement(target)) {
					this.focusGrowingButton();
				} else {
					this.focusFirstItem();
				}
				event.stopImmediatePropagation();
				return;
			}
			if (!this.getForwardingFocus()) {
				if (this.growsWithButton && this.isForwardAfterElement(target)) {
					this.focusGrowingButton();
					event.stopImmediatePropagation();
					return;
				}
				this.focusPreviouslyFocusedItem();
				event.stopImmediatePropagation();
			}
			this.setForwardingFocus(false);
		}
		isForwardElement(node) {
			const nodeId = node.id;
			const beforeElement = this.getBeforeElement();
			if (this._id === nodeId || (beforeElement && beforeElement.id === nodeId)) {
				return true;
			}
			return this.isForwardAfterElement(node);
		}
		isForwardAfterElement(node) {
			const nodeId = node.id;
			const afterElement = this.getAfterElement();
			return afterElement && afterElement.id === nodeId;
		}
		onItemFocused(event) {
			const target = event.target;
			this._itemNavigation.setCurrentItem(target);
			this.fireEvent("item-focused", { item: target });
			if (this.mode === ListMode.SingleSelectAuto) {
				this.onSelectionRequested({
					detail: {
						item: target,
						selectionComponentPressed: false,
						selected: true,
						key: event.detail.key,
					},
				});
			}
		}
		onItemPress(event) {
			const pressedItem = event.detail.item;
			if (!this.fireEvent("item-click", { item: pressedItem }, true)) {
				return;
			}
			if (!this._selectionRequested && this.mode !== ListMode.Delete) {
				this._selectionRequested = true;
				this.onSelectionRequested({
					detail: {
						item: pressedItem,
						selectionComponentPressed: false,
						selected: !pressedItem.selected,
						key: event.detail.key,
					},
				});
			}
			this._selectionRequested = false;
		}
		onItemClose(event) {
			this.fireEvent("item-close", { item: event.detail.item });
		}
		onItemToggle(event) {
			this.fireEvent("item-toggle", { item: event.detail.item });
		}
		onForwardBefore(event) {
			this.setPreviouslyFocusedItem(event.target);
			this.focusBeforeElement();
			event.stopImmediatePropagation();
		}
		onForwardAfter(event) {
			this.setPreviouslyFocusedItem(event.target);
			if (!this.growsWithButton) {
				this.focusAfterElement();
			} else {
				this.focusGrowingButton();
				event.preventDefault();
			}
		}
		focusBeforeElement() {
			this.setForwardingFocus(true);
			this.getBeforeElement().focus();
		}
		focusAfterElement() {
			this.setForwardingFocus(true);
			this.getAfterElement().focus();
		}
		focusGrowingButton() {
			const growingBtn = this.getGrowingButton();
			if (growingBtn) {
				growingBtn.focus();
			}
		}
		getGrowingButton() {
			return this.shadowRoot.querySelector(`#${this._id}-growing-btn`);
		}
		focusFirstItem() {
			const firstItem = this.getFirstItem(x => !x.disabled);
			if (firstItem) {
				firstItem.focus();
			}
		}
		focusPreviouslyFocusedItem() {
			const previouslyFocusedItem = this.getPreviouslyFocusedItem();
			if (previouslyFocusedItem) {
				previouslyFocusedItem.focus();
			}
		}
		focusFirstSelectedItem() {
			const firstSelectedItem = this.getFirstItem(x => x.selected && !x.disabled);
			if (firstSelectedItem) {
				firstSelectedItem.focus();
			}
		}
		focusItem(item) {
			this._itemNavigation.setCurrentItem(item);
			item.focus();
		}
		focusUploadCollectionItem(event) {
			setTimeout(() => {
				this.setPreviouslyFocusedItem(event.target);
				this.focusPreviouslyFocusedItem();
			}, 0);
		}
		setForwardingFocus(forwardingFocus) {
			this._forwardingFocus = forwardingFocus;
		}
		getForwardingFocus() {
			return this._forwardingFocus;
		}
		setPreviouslyFocusedItem(item) {
			this._previouslyFocusedItem = item;
		}
		getPreviouslyFocusedItem() {
			return this._previouslyFocusedItem;
		}
		getFirstItem(filter) {
			const slottedItems = this.getSlottedNodes("items");
			let firstItem = null;
			if (!filter) {
				return !!slottedItems.length && slottedItems[0];
			}
			for (let i = 0; i < slottedItems.length; i++) {
				if (filter(slottedItems[i])) {
					firstItem = slottedItems[i];
					break;
				}
			}
			return firstItem;
		}
		getAfterElement() {
			if (!this._afterElement) {
				this._afterElement = this.shadowRoot.querySelector(`#${this._id}-after`);
			}
			return this._afterElement;
		}
		getBeforeElement() {
			if (!this._beforeElement) {
				this._beforeElement = this.shadowRoot.querySelector(`#${this._id}-before`);
			}
			return this._beforeElement;
		}
		getHeaderToolbarLastTabbableElement() {
			return TabbableElements.getLastTabbableElement(this.headerToolbar.getDomRef()) || this.headerToolbar.getDomRef();
		}
		getNormalizedTarget(target) {
			let focused = target;
			if (target.shadowRoot && target.shadowRoot.activeElement) {
				focused = target.shadowRoot.activeElement;
			}
			return focused;
		}
		getIntersectionObserver() {
			if (!this.growingIntersectionObserver) {
				this.growingIntersectionObserver = new IntersectionObserver(this.onInteresection.bind(this), {
					root: null,
					rootMargin: "0px",
					threshold: 1.0,
				});
			}
			return this.growingIntersectionObserver;
		}
	}
	List.define();

	return List;

});
