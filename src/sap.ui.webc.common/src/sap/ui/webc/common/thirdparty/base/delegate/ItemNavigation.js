sap.ui.define(['../Keys', '../util/getActiveElement', '../types/NavigationMode', '../types/ItemNavigationBehavior'], function (Keys, getActiveElement, NavigationMode, ItemNavigationBehavior) { 'use strict';

	class ItemNavigation {
		constructor(rootWebComponent, options = {}) {
			this._setRootComponent(rootWebComponent);
			this._initOptions(options);
		}
		_setRootComponent(rootWebComponent) {
			if (!rootWebComponent.isUI5Element) {
				throw new Error("The root web component must be a UI5 Element instance");
			}
			this.rootWebComponent = rootWebComponent;
			this.rootWebComponent.addEventListener("keydown", this._onkeydown.bind(this));
			this.rootWebComponent._onComponentStateFinalized = () => {
				this._init();
			};
		}
		_initOptions(options) {
			if (typeof options.getItemsCallback !== "function") {
				throw new Error("getItemsCallback is required");
			}
			this._getItems = options.getItemsCallback;
			this._currentIndex = options.currentIndex || 0;
			this._rowSize = options.rowSize || 1;
			this._behavior = options.behavior || ItemNavigationBehavior.Static;
			this._navigationMode = options.navigationMode || NavigationMode.Auto;
			this._affectedPropertiesNames = options.affectedPropertiesNames || [];
			this._skipItemsSize = options.skipItemsSize || null;
		}
		setCurrentItem(current) {
			const currentItemIndex = this._getItems().indexOf(current);
			if (currentItemIndex === -1) {
				console.warn(`The provided item is not managed by ItemNavigation`, current);
				return;
			}
			this._currentIndex = currentItemIndex;
			this._applyTabIndex();
		}
		setRowSize(newRowSize) {
			this._rowSize = newRowSize;
		}
		_init() {
			this._getItems().forEach((item, idx) => {
				item._tabIndex = (idx === this._currentIndex) ? "0" : "-1";
			});
		}
		_onkeydown(event) {
			if (!this._canNavigate()) {
				return;
			}
			const horizontalNavigationOn = this._navigationMode === NavigationMode.Horizontal || this._navigationMode === NavigationMode.Auto;
			const verticalNavigationOn = this._navigationMode === NavigationMode.Vertical || this._navigationMode === NavigationMode.Auto;
			const isRTL = this.rootWebComponent.effectiveDir === "rtl";
			if (isRTL && Keys.isLeft(event) && horizontalNavigationOn) {
				this._handleRight();
			} else if (isRTL && Keys.isRight(event) && horizontalNavigationOn) {
				this._handleLeft();
			} else if (Keys.isLeft(event) && horizontalNavigationOn) {
				this._handleLeft();
			} else if (Keys.isRight(event) && horizontalNavigationOn) {
				this._handleRight();
			} else if (Keys.isUp(event) && verticalNavigationOn) {
				this._handleUp();
			} else if (Keys.isDown(event) && verticalNavigationOn) {
				this._handleDown();
			} else if (Keys.isHome(event)) {
				this._handleHome();
			} else if (Keys.isEnd(event)) {
				this._handleEnd();
			} else if (Keys.isPageUp(event)) {
				this._handlePageUp();
			} else if (Keys.isPageDown(event)) {
				this._handlePageDown();
			} else {
				return;
			}
			event.preventDefault();
			this._applyTabIndex();
			this._focusCurrentItem();
		}
		_handleUp() {
			const itemsLength = this._getItems().length;
			if (this._currentIndex - this._rowSize >= 0) {
				this._currentIndex -= this._rowSize;
				return;
			}
			if (this._behavior === ItemNavigationBehavior.Cyclic) {
				const firstItemInThisColumnIndex = this._currentIndex % this._rowSize;
				const firstItemInPreviousColumnIndex = firstItemInThisColumnIndex === 0 ? this._rowSize - 1 : firstItemInThisColumnIndex - 1;
				const rows = Math.ceil(itemsLength / this._rowSize);
				let lastItemInPreviousColumnIndex = firstItemInPreviousColumnIndex + (rows - 1) * this._rowSize;
				if (lastItemInPreviousColumnIndex > itemsLength - 1) {
					lastItemInPreviousColumnIndex -= this._rowSize;
				}
				this._currentIndex = lastItemInPreviousColumnIndex;
			} else {
				this._currentIndex = 0;
			}
		}
		_handleDown() {
			const itemsLength = this._getItems().length;
			if (this._currentIndex + this._rowSize < itemsLength) {
				this._currentIndex += this._rowSize;
				return;
			}
			if (this._behavior === ItemNavigationBehavior.Cyclic) {
				const firstItemInThisColumnIndex = this._currentIndex % this._rowSize;
				const firstItemInNextColumnIndex = (firstItemInThisColumnIndex + 1) % this._rowSize;
				this._currentIndex = firstItemInNextColumnIndex;
			} else {
				this._currentIndex = itemsLength - 1;
			}
		}
		_handleLeft() {
			const itemsLength = this._getItems().length;
			if (this._currentIndex > 0) {
				this._currentIndex -= 1;
				return;
			}
			if (this._behavior === ItemNavigationBehavior.Cyclic) {
				this._currentIndex = itemsLength - 1;
			}
		}
		_handleRight() {
			const itemsLength = this._getItems().length;
			if (this._currentIndex < itemsLength - 1) {
				this._currentIndex += 1;
				return;
			}
			if (this._behavior === ItemNavigationBehavior.Cyclic) {
				this._currentIndex = 0;
			}
		}
		_handleHome() {
			const homeEndRange = this._rowSize > 1 ? this._rowSize : this._getItems().length;
			this._currentIndex -= this._currentIndex % homeEndRange;
		}
		_handleEnd() {
			const homeEndRange = this._rowSize > 1 ? this._rowSize : this._getItems().length;
			this._currentIndex += (homeEndRange - 1 - this._currentIndex % homeEndRange);
		}
		_handlePageUp() {
			if (this._rowSize > 1) {
				return;
			}
			this._handlePageUpFlat();
		}
		_handlePageDown() {
			if (this._rowSize > 1) {
				return;
			}
			this._handlePageDownFlat();
		}
		_handlePageUpFlat() {
			if (this._skipItemsSize === null) {
				this._currentIndex -= this._currentIndex;
			}
			if (this._currentIndex + 1 > this._skipItemsSize) {
				this._currentIndex -= this._skipItemsSize;
			} else {
				this._currentIndex -= this._currentIndex;
			}
		}
		_handlePageDownFlat() {
			if (this._skipItemsSize === null) {
				this._currentIndex = this._getItems().length - 1;
			}
			const currentToEndRange = this._getItems().length - this._currentIndex - 1;
			if (currentToEndRange > this._skipItemsSize) {
				this._currentIndex += this._skipItemsSize;
			} else {
				this._currentIndex = this._getItems().length - 1;
			}
		}
		_applyTabIndex() {
			const items = this._getItems();
			for (let i = 0; i < items.length; i++) {
				items[i]._tabIndex = i === this._currentIndex ? "0" : "-1";
			}
			this._affectedPropertiesNames.forEach(propName => {
				const prop = this.rootWebComponent[propName];
				this.rootWebComponent[propName] = Array.isArray(prop) ? [...prop] : { ...prop };
			});
		}
		_focusCurrentItem() {
			const currentItem = this._getCurrentItem();
			if (currentItem) {
				currentItem.focus();
			}
		}
		_canNavigate() {
			const currentItem = this._getCurrentItem();
			const activeElement = getActiveElement();
			return currentItem && currentItem === activeElement;
		}
		_getCurrentItem() {
			const items = this._getItems();
			if (!items.length) {
				return null;
			}
			while (this._currentIndex >= items.length) {
				this._currentIndex -= this._rowSize;
			}
			if (this._currentIndex < 0) {
				this._currentIndex = 0;
			}
			const currentItem = items[this._currentIndex];
			if (!currentItem) {
				return;
			}
			if (currentItem.isUI5Element) {
				return currentItem.getFocusDomRef();
			}
			if (!this.rootWebComponent.getDomRef()) {
				return;
			}
			return this.rootWebComponent.getDomRef().querySelector(`#${currentItem.id}`);
		}
	}

	return ItemNavigation;

});
