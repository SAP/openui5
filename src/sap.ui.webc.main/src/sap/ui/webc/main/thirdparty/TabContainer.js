sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/common/thirdparty/base/animations/slideDown", "sap/ui/webc/common/thirdparty/base/animations/slideUp", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/types/AnimationMode", "sap/ui/webc/common/thirdparty/base/config/AnimationMode", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/MediaRange", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/CustomElementsScope", "sap/ui/webc/common/thirdparty/icons/slim-arrow-up", "sap/ui/webc/common/thirdparty/icons/slim-arrow-down", "./generated/i18n/i18n-defaults", "./Button", "./Icon", "./List", "./ResponsivePopover", "./types/TabContainerTabsPlacement", "./types/SemanticColor", "./types/TabContainerBackgroundDesign", "./types/TabLayout", "./types/TabsOverflowMode", "./generated/templates/TabContainerTemplate.lit", "./generated/templates/TabContainerPopoverTemplate.lit", "./generated/themes/TabContainer.css", "./generated/themes/ResponsivePopoverCommon.css"], function (_exports, _UI5Element, _customElement, _event, _property, _slot, _LitRenderer, _ResizeHandler, _Render, _slideDown, _slideUp, _Integer, _AnimationMode, _AnimationMode2, _ItemNavigation, _Keys, _MediaRange, _i18nBundle, _CustomElementsScope, _slimArrowUp, _slimArrowDown, _i18nDefaults, _Button, _Icon, _List, _ResponsivePopover, _TabContainerTabsPlacement, _SemanticColor, _TabContainerBackgroundDesign, _TabLayout, _TabsOverflowMode, _TabContainerTemplate, _TabContainerPopoverTemplate, _TabContainer, _ResponsivePopoverCommon) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _event = _interopRequireDefault(_event);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _slideDown = _interopRequireDefault(_slideDown);
  _slideUp = _interopRequireDefault(_slideUp);
  _Integer = _interopRequireDefault(_Integer);
  _AnimationMode = _interopRequireDefault(_AnimationMode);
  _ItemNavigation = _interopRequireDefault(_ItemNavigation);
  _MediaRange = _interopRequireDefault(_MediaRange);
  _Button = _interopRequireDefault(_Button);
  _Icon = _interopRequireDefault(_Icon);
  _List = _interopRequireDefault(_List);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _TabContainerTabsPlacement = _interopRequireDefault(_TabContainerTabsPlacement);
  _SemanticColor = _interopRequireDefault(_SemanticColor);
  _TabContainerBackgroundDesign = _interopRequireDefault(_TabContainerBackgroundDesign);
  _TabLayout = _interopRequireDefault(_TabLayout);
  _TabsOverflowMode = _interopRequireDefault(_TabsOverflowMode);
  _TabContainerTemplate = _interopRequireDefault(_TabContainerTemplate);
  _TabContainerPopoverTemplate = _interopRequireDefault(_TabContainerPopoverTemplate);
  _TabContainer = _interopRequireDefault(_TabContainer);
  _ResponsivePopoverCommon = _interopRequireDefault(_ResponsivePopoverCommon);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var TabContainer_1;

  // Templates

  // Styles

  const tabStyles = [];
  const staticAreaTabStyles = [];
  const PAGE_UP_DOWN_SIZE = 5;
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-tabcontainer</code> represents a collection of tabs with associated content.
   * Navigation through the tabs changes the content display of the currently active content area.
   * A tab can be labeled with text only, or icons with text.
   *
   * <h3>Structure</h3>
   *
   * The <code>ui5-tabcontainer</code> can hold two types of entities:
   * <ul>
   * <li><code>ui5-tab</code> - contains all the information on an item (text and icon)</li>
   * <li><code>ui5-tab-separator</code> - used to separate tabs with a line</li>
   * </ul>
   *
   * <h3>Hierarchies</h3>
   * Multiple sub tabs could be placed underneath one main tab. Nesting allows deeper hierarchies with indentations
   * to indicate the level of each nested tab. When a tab has both sub tabs and own content its click area is split
   * to allow the user to display the content or alternatively to expand / collapse the list of sub tabs.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-tabcontainer</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>content - Used to style the content of the component</li>
   * </ul>
   *
   * <h3>Keyboard Handling</h3>
   *
   * <h4>Fast Navigation</h4>
   * This component provides a build in fast navigation group which can be used via <code>F6 / Shift + F6</code> or <code> Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up</code>.
   * In order to use this functionality, you need to import the following module:
   * <code>import "@ui5/webcomponents-base/dist/features/F6Navigation.js"</code>
   * <br><br>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/TabContainer";</code>
   * <br>
   * <code>import "@ui5/webcomponents/dist/Tab";</code> (for <code>ui5-tab</code>)
   * <br>
   * <code>import "@ui5/webcomponents/dist/TabSeparator";</code> (for <code>ui5-tab-separator</code>)
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.TabContainer
   * @extends sap.ui.webc.base.UI5Element
   * @appenddocs sap.ui.webc.main.Tab sap.ui.webc.main.TabSeparator
   * @tagname ui5-tabcontainer
   * @public
   */
  let TabContainer = TabContainer_1 = class TabContainer extends _UI5Element.default {
    static registerTabStyles(styles) {
      tabStyles.push(styles);
    }
    static registerStaticAreaTabStyles(styles) {
      staticAreaTabStyles.push(styles);
    }
    constructor() {
      super();
      this._handleResizeBound = this._handleResize.bind(this);
      // Init ItemNavigation
      this._itemNavigation = new _ItemNavigation.default(this, {
        getItemsCallback: () => this._getFocusableRefs(),
        skipItemsSize: PAGE_UP_DOWN_SIZE
      });
    }
    onBeforeRendering() {
      this._allItemsAndSubItems = this._getAllSubItems(this.items);
      if (!this._allItemsAndSubItems.length) {
        return;
      }
      // update selected tab
      const selectedTabs = this._allItemsAndSubItems.filter(tab => tab.selected);
      if (selectedTabs.length) {
        this._selectedTab._selected = false;
        this._selectedTab = selectedTabs[0];
      } else {
        this._selectedTab = this._allItemsAndSubItems[0];
        this._selectedTab._selected = true;
      }
      this._setItemsPrivateProperties(this.items);
      if (!this._animationRunning) {
        this._contentCollapsed = this.collapsed;
      }
      if (this.showOverflow) {
        console.warn(`The "show-overflow" property is deprecated and will be removed in a future release.`); // eslint-disable-line
      }
    }

    onAfterRendering() {
      if (!this.items.length) {
        return;
      }
      this._setItemsForStrip();
      if (!this.shadowRoot.contains(document.activeElement)) {
        const focusStart = this._getRootTab(this._selectedTab);
        this._itemNavigation.setCurrentItem(focusStart);
      }
    }
    onEnterDOM() {
      _ResizeHandler.default.register(this._getHeader(), this._handleResizeBound);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this._getHeader(), this._handleResizeBound);
    }
    _handleResize() {
      if (this.responsivePopover && this.responsivePopover.opened) {
        this.responsivePopover.close();
      }
      this._width = this.offsetWidth;
      this._updateMediaRange(this._width);
    }
    _updateMediaRange(width) {
      this.mediaRange = _MediaRange.default.getCurrentRange(_MediaRange.default.RANGESETS.RANGE_4STEPS, width);
    }
    _setItemsPrivateProperties(items) {
      // set real dom ref to all items, then return only the tabs for further processing
      const allTabs = items.filter(item => {
        item._getElementInStrip = () => this.getDomRef().querySelector(`#${item._id}`);
        return !item.isSeparator;
      });
      allTabs.forEach((tab, index, arr) => {
        tab._isInline = this.tabLayout === _TabLayout.default.Inline;
        tab._mixedMode = this.mixedMode;
        tab._posinset = index + 1;
        tab._setsize = arr.length;
        tab._realTab = this._selectedTab;
        tab._isTopLevelTab = items.some(i => i === tab);
        walk(items, _tab => {
          _tab._realTab = tab._realTab;
        });
      });
    }
    _onHeaderFocusin(e) {
      const tab = getTab(e.target);
      if (tab) {
        this._itemNavigation.setCurrentItem(tab._realTab);
      }
    }
    async _onTabStripClick(e) {
      const tab = getTab(e.target);
      if (!tab || tab._realTab.disabled) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      if (e.target.hasAttribute("ui5-button")) {
        this._onTabExpandButtonClick(e);
        return;
      }
      if (!tab._realTab._hasOwnContent && tab._realTab.tabs.length) {
        this._overflowItems = tab._realTab.subTabs;
        this._addStyleIndent(this._overflowItems);
        this.responsivePopover = await this._respPopover();
        if (this.responsivePopover.opened) {
          this.responsivePopover.close();
        } else {
          this._setPopoverInitialFocus();
        }
        this.responsivePopover.showAt(tab._realTab.getTabInStripDomRef());
        return;
      }
      this._onHeaderItemSelect(tab);
    }
    async _onTabExpandButtonClick(e) {
      e.stopPropagation();
      e.preventDefault();
      let button = e.target;
      let tabInstance = button.tab;
      if (tabInstance) {
        tabInstance.focus();
      }
      if (e.type === "keydown" && !e.target._realTab.isSingleClickArea) {
        button = e.target.querySelectorAll(".ui5-tab-expand-button")[0];
        tabInstance = e.target._realTab;
      }
      // if clicked between the expand button and the tab
      if (!tabInstance) {
        this._onHeaderItemSelect(button.parentElement);
        return;
      }
      this._overflowItems = tabInstance.subTabs;
      this._addStyleIndent(this._overflowItems);
      this.responsivePopover = await this._respPopover();
      if (this.responsivePopover.isOpen()) {
        this.responsivePopover.close();
      } else {
        this._setPopoverInitialFocus();
      }
      this.responsivePopover.showAt(button);
    }
    _setPopoverInitialFocus() {
      const selectedTabInOverflow = this._getSelectedTabInOverflow();
      const tab = selectedTabInOverflow || this._getFirstFocusableItemInOverflow();
      this.responsivePopover.initialFocus = `${tab._realTab._id}-li`;
    }
    _getSelectedTabInOverflow() {
      return this.responsivePopover.content[0].items.find(item => {
        return item._realTab && item._realTab.selected;
      });
    }
    _getFirstFocusableItemInOverflow() {
      return this.responsivePopover.content[0].items.find(item => item.classList.contains("ui5-tab-overflow-item"));
    }
    _onTabStripKeyDown(e) {
      const tab = getTab(e.target);
      if (!tab || tab._realTab.disabled) {
        return;
      }
      if ((0, _Keys.isEnter)(e)) {
        if (tab._realTab.isSingleClickArea) {
          this._onTabStripClick(e);
        } else {
          this._onHeaderItemSelect(tab);
        }
      }
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault(); // prevent scrolling
      }

      if ((0, _Keys.isDown)(e) || (0, _Keys.isUp)(e)) {
        if (tab._realTab.requiresExpandButton) {
          this._onTabExpandButtonClick(e);
        }
        if (tab._realTab.isSingleClickArea) {
          this._onTabStripClick(e);
        }
      }
    }
    _onTabStripKeyUp(e) {
      const tab = getTab(e.target);
      if (!tab || tab._realTab.disabled) {
        return;
      }
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
        if (tab._realTab.isSingleClickArea) {
          this._onTabStripClick(e);
        } else {
          this._onHeaderItemSelect(tab);
        }
      }
    }
    _onHeaderItemSelect(tab) {
      if (!tab.hasAttribute("disabled")) {
        this._onItemSelect(tab.id);
      }
    }
    async _onOverflowListItemClick(e) {
      e.preventDefault(); // cancel the item selection
      this._onItemSelect(e.detail.item.id.slice(0, -3)); // strip "-li" from end of id
      this.responsivePopover.close();
      await (0, _Render.renderFinished)();
      const selectedTopLevel = this._getRootTab(this._selectedTab);
      selectedTopLevel.getTabInStripDomRef().focus();
    }
    /**
     * Returns all slotted tabs and their subTabs in a flattened array.
     * The order of tabs is depth-first. For example, given the following slotted elements:
     * <pre><code>
     * 	&lt;ui5-tabcontainer&gt;
     * 		&lt;ui5-tab id="First" text="First"&gt;
     * 			...
     * 			&lt;ui5-tab slot="subTabs" id="Nested" text="Nested"&gt;...&lt;/ui5-tab&gt;
     * 		&lt;/ui5-tab&gt;
     * 		&lt;ui5-tab id="Second" text="Second"&gt;...&lt;/ui5-tab&gt;
     * 		&lt;ui5-tab-separator id="sep"&gt;&lt;/ui5-tab-separator&gt;
     * 		&lt;ui5-tab id="Third" text="Third"&gt;...&lt;/ui5-tab&gt;
     * 	&lt;/ui5-tabcontainer&gt;
     * </code></pre>
     * Calling <code>allItems</code> on this TabContainer will return the instances in the following order:
     * <code>[ ui5-tab#First, ui5-tab#Nested, ui5-tab#Second, ui5-tab-separator#sep, ui5-tab#Third ]</code>
     * @public
     * @readonly
     * @name sap.ui.webc.main.TabContainer.prototype.allItems
     * @returns {sap.ui.webc.main.ITab[]}
     */
    get allItems() {
      return this._getAllSubItems(this.items);
    }
    _getAllSubItems(items, result = [], level = 1) {
      items.forEach(item => {
        if (item.hasAttribute("ui5-tab") || item.hasAttribute("ui5-tab-separator")) {
          item._level = level;
          result.push(item);
          if (item.subTabs) {
            this._getAllSubItems(item.subTabs, result, level + 1);
          }
        }
      });
      return result;
    }
    _onItemSelect(selectedTabId) {
      const previousTab = this._selectedTab;
      const selectedTabIndex = this._allItemsAndSubItems.findIndex(item => item.__id === selectedTabId);
      const selectedTab = this._allItemsAndSubItems[selectedTabIndex];
      const selectionSuccessful = this.selectTab(selectedTab, selectedTabIndex);
      if (!selectionSuccessful) {
        return;
      }
      // update selected property on all items
      this._allItemsAndSubItems.forEach((item, index) => {
        const selected = selectedTabIndex === index;
        item.selected = selected;
        if (item._selected) {
          item._selected = false;
        }
      });
      if (this.fixed) {
        return;
      }
      if (!this.shouldAnimate) {
        this.toggle(selectedTab, previousTab);
      } else {
        this.toggleAnimated(selectedTab, previousTab);
      }
    }
    async toggleAnimated(selectedTab, previousTab) {
      const content = this.shadowRoot.querySelector(".ui5-tc__content");
      let animationPromise = null;
      this._animationRunning = true;
      if (selectedTab === previousTab) {
        // click on already selected tab - animate both directions
        this.collapsed = !this.collapsed;
        animationPromise = this.collapsed ? this.slideContentUp(content) : this.slideContentDown(content);
      } else {
        // click on new tab - animate if the content is currently collapsed
        animationPromise = this.collapsed ? this.slideContentDown(content) : Promise.resolve();
        this.collapsed = false;
      }
      await animationPromise;
      this._contentCollapsed = this.collapsed;
      this._animationRunning = false;
    }
    toggle(selectedTab, previousTab) {
      if (selectedTab === previousTab) {
        this.collapsed = !this.collapsed;
      } else {
        this.collapsed = false;
      }
    }
    /**
     * Fires the <code>tab-select</code> event and changes the internal reference for the currently selected tab.
     * If the event is prevented, the current tab is not changed.
     * @private
     *
     * @param {sap.ui.webc.main.ITab} selectedTab selected tab instance
     * @param {number} selectedTabIndex selected tab index for an array containing all tabs and sub tabs. <b>Note:</b> Use the method <code>allTabs</code> to get this array.
     * @returns {boolean} true if the tab selection is successful, false if it was prevented
     */
    selectTab(selectedTab, selectedTabIndex) {
      if (!this.fireEvent("tab-select", {
        tab: selectedTab,
        tabIndex: selectedTabIndex
      }, true)) {
        return false;
      }
      // select the tab
      this._selectedTab = selectedTab;
      return true;
    }
    slideContentDown(element) {
      return (0, _slideDown.default)(element).promise();
    }
    slideContentUp(element) {
      return (0, _slideUp.default)(element).promise();
    }
    async _onOverflowClick(e) {
      if (e.target.classList.contains("ui5-tc__overflow")) {
        // the empty area in the overflow was clicked
        return;
      }
      const overflow = e.currentTarget;
      const isEndOverflow = overflow.classList.contains("ui5-tc__overflow--end");
      const overflowAttr = isEndOverflow ? "end-overflow" : "start-overflow";
      this._overflowItems = this.items.filter(item => {
        const stripRef = item.getTabInStripDomRef();
        return stripRef && stripRef.hasAttribute(overflowAttr);
      });
      this._addStyleIndent(this._overflowItems);
      let opener;
      if (isEndOverflow) {
        opener = this.overflowButton[0] || this._getEndOverflowBtnDOM();
      } else {
        opener = this.startOverflowButton[0] || this._getStartOverflowBtnDOM();
      }
      this.responsivePopover = await this._respPopover();
      if (this.responsivePopover.opened) {
        this.responsivePopover.close();
      } else {
        this._setPopoverInitialFocus();
        this.responsivePopover.showAt(opener);
      }
    }
    _addStyleIndent(tabs) {
      const extraIndent = this._getAllSubItems(tabs).filter(tab => !tab.isSeparator).some(tab => tab.design !== _SemanticColor.default.Default && tab.design !== _SemanticColor.default.Neutral);
      walk(tabs, tab => {
        let level = tab._level - 1;
        if (tab.isSeparator) {
          level += 1;
        }
        tab._style = {
          [(0, _CustomElementsScope.getScopedVarName)("--_ui5-tab-indentation-level")]: level,
          [(0, _CustomElementsScope.getScopedVarName)("--_ui5-tab-extra-indent")]: extraIndent ? 1 : null
        };
      });
    }
    async _onOverflowKeyDown(e) {
      const overflow = e.currentTarget;
      const isEndOverflow = overflow.classList.contains("ui5-tc__overflow--end");
      const isStartOverflow = overflow.classList.contains("ui5-tc__overflow--start");
      if ((0, _Keys.isDown)(e) || isStartOverflow && (0, _Keys.isLeft)(e) || isEndOverflow && (0, _Keys.isRight)(e)) {
        e.stopPropagation();
        e.preventDefault();
        await this._onOverflowClick(e);
      }
    }
    _setItemsForStrip() {
      const tabStrip = this._getTabStrip();
      let allItemsWidth = 0;
      if (!this._selectedTab) {
        return;
      }
      const itemsDomRefs = this.items.map(item => item.getTabInStripDomRef());
      // make sure the overflows are hidden
      this._getStartOverflow().setAttribute("hidden", "");
      this._getEndOverflow().setAttribute("hidden", "");
      // show all tabs
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
        return;
      }
      if (this.isModeStartAndEnd) {
        this._updateStartAndEndOverflow(itemsDomRefs);
        this._updateOverflowCounters();
      } else {
        this._updateEndOverflow(itemsDomRefs);
      }
    }
    _getRootTab(tab) {
      while (tab.hasAttribute("ui5-tab")) {
        if (tab.parentElement.hasAttribute("ui5-tabcontainer")) {
          break;
        }
        tab = tab.parentElement;
      }
      return tab;
    }
    _updateEndOverflow(itemsDomRefs) {
      // show end overflow
      this._getEndOverflow().removeAttribute("hidden");
      const selectedTab = this._getRootTab(this._selectedTab);
      const selectedTabDomRef = selectedTab.getTabInStripDomRef();
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
      const selectedTab = this._getRootTab(this._selectedTab);
      const selectedTabDomRef = selectedTab.getTabInStripDomRef();
      const selectedItemIndexAndWidth = this._getSelectedItemIndexAndWidth(itemsDomRefs, selectedTabDomRef);
      const hasStartOverflow = this._hasStartOverflow(containerWidth, itemsDomRefs, selectedItemIndexAndWidth);
      const hasEndOverflow = this._hasEndOverflow(containerWidth, itemsDomRefs, selectedItemIndexAndWidth);
      let firstVisible;
      let lastVisible;
      // has "end", but no "start" overflow
      if (!hasStartOverflow) {
        // show "end" overflow
        this._getEndOverflow().removeAttribute("hidden");
        // width is changed
        containerWidth = this._getTabStrip().offsetWidth;
        lastVisible = this._findLastVisibleItem(itemsDomRefs, containerWidth, selectedItemIndexAndWidth.width);
        for (let i = lastVisible + 1; i < itemsDomRefs.length; i++) {
          itemsDomRefs[i].setAttribute("hidden", "");
          itemsDomRefs[i].setAttribute("end-overflow", "");
        }
        return;
      }
      // has "start", but no "end" overflow
      if (!hasEndOverflow) {
        // show "start" overflow
        this._getStartOverflow().removeAttribute("hidden");
        // width is changed
        containerWidth = this._getTabStrip().offsetWidth;
        firstVisible = this._findFirstVisibleItem(itemsDomRefs, containerWidth, selectedItemIndexAndWidth.width);
        for (let i = firstVisible - 1; i >= 0; i--) {
          itemsDomRefs[i].setAttribute("hidden", "");
          itemsDomRefs[i].setAttribute("start-overflow", "");
        }
        return;
      }
      // show "start" overflow
      this._getStartOverflow().removeAttribute("hidden");
      // show "end" overflow
      this._getEndOverflow().removeAttribute("hidden");
      // width is changed
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
      // if there is no "start" overflow, it has "end" overflow
      // check it again with the "end" overflow
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
      // if there is no "end" overflow, it has "start" overflow
      // check it again with the "start" overflow
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
      // if previous item is a separator - remove it
      if (selectedSeparator) {
        itemsDomRefs.splice(index - 1, 1);
        index--;
      }
      return {
        index,
        width
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
    _findLastVisibleItem(itemsDomRefs, containerWidth, selectedItemWidth, startIndex = 0) {
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
      // if prev item is separator - hide it
      const prevItem = itemsDomRefs[index - 1];
      if (prevItem && prevItem.isSeparator) {
        lastVisibleIndex -= 1;
      }
      return lastVisibleIndex;
    }
    get isModeStartAndEnd() {
      return this.tabsOverflowMode === _TabsOverflowMode.default.StartAndEnd;
    }
    _updateOverflowCounters() {
      let startOverflowItemsCount = 0;
      let endOverflowItemsCount = 0;
      this._getTabs().map(tab => tab.getTabInStripDomRef()).forEach(tab => {
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
    _getFocusableRefs() {
      if (!this.getDomRef()) {
        return [];
      }
      const focusableRefs = [];
      if (!this._getStartOverflow().hasAttribute("hidden")) {
        focusableRefs.push(this.startOverflowButton[0] || this._getStartOverflowBtnDOM());
      }
      this._getTabs().forEach(tab => {
        const ref = tab.getTabInStripDomRef();
        const focusable = ref && !ref.hasAttribute("hidden");
        if (focusable) {
          focusableRefs.push(tab);
        }
      });
      if (!this._getEndOverflow().hasAttribute("hidden")) {
        focusableRefs.push(this.overflowButton[0] || this._getEndOverflowBtnDOM());
      }
      return focusableRefs;
    }
    _getHeader() {
      return this.shadowRoot.querySelector(`#${this._id}-header`);
    }
    _getTabs() {
      return this.items.filter(item => !item.isSeparator);
    }
    get hasSubTabs() {
      const tabs = this._getTabs();
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].subTabs.length > 0) {
          return true;
        }
      }
      return false;
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
    _getStartOverflowBtnDOM() {
      return this._getStartOverflow().querySelector("[ui5-button]");
    }
    _getEndOverflowBtnDOM() {
      return this._getEndOverflow().querySelector("[ui5-button]");
    }
    async _respPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector(`#${this._id}-overflowMenu`);
    }
    async _closeRespPopover() {
      this.responsivePopover = await this._respPopover();
      this.responsivePopover.close();
    }
    get classes() {
      return {
        root: {
          "ui5-tc-root": true,
          "ui5-tc--textOnly": this.textOnly,
          "ui5-tc--withAdditionalText": this.withAdditionalText,
          "ui5-tc--standardTabLayout": this.standardTabLayout
        },
        header: {
          "ui5-tc__header": true
        },
        tabStrip: {
          "ui5-tc__tabStrip": true
        },
        separator: {
          "ui5-tc__separator": true
        },
        content: {
          "ui5-tc__content": true,
          "ui5-tc__content--collapsed": this._contentCollapsed
        }
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
      return this.tabLayout === _TabLayout.default.Standard;
    }
    get previousIconACCName() {
      return TabContainer_1.i18nBundle.getText(_i18nDefaults.TABCONTAINER_PREVIOUS_ICON_ACC_NAME);
    }
    get nextIconACCName() {
      return TabContainer_1.i18nBundle.getText(_i18nDefaults.TABCONTAINER_NEXT_ICON_ACC_NAME);
    }
    get overflowMenuTitle() {
      return TabContainer_1.i18nBundle.getText(_i18nDefaults.TABCONTAINER_OVERFLOW_MENU_TITLE);
    }
    get tabsAtTheBottom() {
      return this.tabsPlacement === _TabContainerTabsPlacement.default.Bottom;
    }
    get overflowMenuIcon() {
      return this.tabsAtTheBottom ? "slim-arrow-up" : "slim-arrow-down";
    }
    get overflowButtonText() {
      return TabContainer_1.i18nBundle.getText(_i18nDefaults.TABCONTAINER_END_OVERFLOW);
    }
    get popoverCancelButtonText() {
      return TabContainer_1.i18nBundle.getText(_i18nDefaults.TABCONTAINER_POPOVER_CANCEL_BUTTON);
    }
    get accInvisibleText() {
      return TabContainer_1.i18nBundle.getText(_i18nDefaults.TABCONTAINER_SUBTABS_DESCRIPTION);
    }
    get tablistAriaDescribedById() {
      return this.hasSubTabs ? `${this._id}-invisibleText` : undefined;
    }
    get shouldAnimate() {
      return (0, _AnimationMode2.getAnimationMode)() !== _AnimationMode.default.None;
    }
    static async onDefine() {
      TabContainer_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], TabContainer.prototype, "fixed", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TabContainer.prototype, "collapsed", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TabContainer.prototype, "showOverflow", void 0);
  __decorate([(0, _property.default)({
    type: _TabLayout.default,
    defaultValue: _TabLayout.default.Standard
  })], TabContainer.prototype, "tabLayout", void 0);
  __decorate([(0, _property.default)({
    type: _TabsOverflowMode.default,
    defaultValue: _TabsOverflowMode.default.End
  })], TabContainer.prototype, "tabsOverflowMode", void 0);
  __decorate([(0, _property.default)({
    type: _TabContainerBackgroundDesign.default,
    defaultValue: _TabContainerBackgroundDesign.default.Solid
  })], TabContainer.prototype, "headerBackgroundDesign", void 0);
  __decorate([(0, _property.default)({
    type: _TabContainerBackgroundDesign.default,
    defaultValue: _TabContainerBackgroundDesign.default.Solid
  })], TabContainer.prototype, "contentBackgroundDesign", void 0);
  __decorate([(0, _property.default)({
    type: _TabContainerTabsPlacement.default,
    defaultValue: _TabContainerTabsPlacement.default.Top
  })], TabContainer.prototype, "tabsPlacement", void 0);
  __decorate([(0, _property.default)()], TabContainer.prototype, "mediaRange", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], TabContainer.prototype, "_selectedTab", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], TabContainer.prototype, "_animationRunning", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], TabContainer.prototype, "_contentCollapsed", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true,
    defaultValue: "0"
  })], TabContainer.prototype, "_startOverflowText", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true,
    defaultValue: "More"
  })], TabContainer.prototype, "_endOverflowText", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], TabContainer.prototype, "_overflowItems", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    noAttribute: true
  })], TabContainer.prototype, "_width", void 0);
  __decorate([(0, _slot.default)({
    "default": true,
    type: HTMLElement,
    individualSlots: true,
    invalidateOnChildChange: {
      properties: true,
      slots: false
    }
  })], TabContainer.prototype, "items", void 0);
  __decorate([(0, _slot.default)()], TabContainer.prototype, "overflowButton", void 0);
  __decorate([(0, _slot.default)()], TabContainer.prototype, "startOverflowButton", void 0);
  TabContainer = TabContainer_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-tabcontainer",
    languageAware: true,
    fastNavigation: true,
    styles: [tabStyles, _TabContainer.default],
    staticAreaStyles: [_ResponsivePopoverCommon.default, staticAreaTabStyles],
    renderer: _LitRenderer.default,
    template: _TabContainerTemplate.default,
    staticAreaTemplate: _TabContainerPopoverTemplate.default,
    dependencies: [_Button.default, _Icon.default, _List.default, _ResponsivePopover.default]
  })
  /**
   * Fired when a tab is selected.
   *
   * @event sap.ui.webc.main.TabContainer#tab-select
   * @param {HTMLElement} tab The selected <code>tab</code>.
   * @param {Integer} tabIndex The selected <code>tab</code> index in the flattened array of all tabs and their subTabs, provided by the <code>allItems</code> getter.
   * @public
   * @allowPreventDefault
   */, (0, _event.default)("tab-select", {
    detail: {
      tab: {
        type: HTMLElement
      },
      tabIndex: {
        type: Number
      }
    }
  })], TabContainer);
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
  const walk = (tabs, callback) => {
    [...tabs].forEach(tab => {
      callback(tab);
      if (tab.subTabs) {
        walk(tab.subTabs, callback);
      }
    });
  };
  TabContainer.define();
  var _default = TabContainer;
  _exports.default = _default;
});