sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/Keys", "./Button", "./types/AvatarSize", "./types/AvatarGroupType", "./types/AvatarColorScheme", "./generated/i18n/i18n-defaults", "./generated/themes/AvatarGroup.css", "./generated/templates/AvatarGroupTemplate.lit"], function (_exports, _UI5Element, _LitRenderer, _ResizeHandler, _ItemNavigation, _i18nBundle, _customElement, _property, _slot, _event, _Keys, _Button, _AvatarSize, _AvatarGroupType, _AvatarColorScheme, _i18nDefaults, _AvatarGroup, _AvatarGroupTemplate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _ItemNavigation = _interopRequireDefault(_ItemNavigation);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _Button = _interopRequireDefault(_Button);
  _AvatarSize = _interopRequireDefault(_AvatarSize);
  _AvatarGroupType = _interopRequireDefault(_AvatarGroupType);
  _AvatarColorScheme = _interopRequireDefault(_AvatarColorScheme);
  _AvatarGroup = _interopRequireDefault(_AvatarGroup);
  _AvatarGroupTemplate = _interopRequireDefault(_AvatarGroupTemplate);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var AvatarGroup_1;

  // Styles

  // Template

  const OVERFLOW_BTN_CLASS = "ui5-avatar-group-overflow-btn";
  const AVATAR_GROUP_OVERFLOW_BTN_SELECTOR = `.${OVERFLOW_BTN_CLASS}`;
  // based on RTL/LTR a margin-left/right is set respectfully
  const offsets = {
    [_AvatarSize.default.XS]: {
      [_AvatarGroupType.default.Individual]: "0.0625rem",
      [_AvatarGroupType.default.Group]: "-0.75rem"
    },
    [_AvatarSize.default.S]: {
      [_AvatarGroupType.default.Individual]: "0.125rem",
      [_AvatarGroupType.default.Group]: "-1.25rem"
    },
    [_AvatarSize.default.M]: {
      [_AvatarGroupType.default.Individual]: "0.125rem",
      [_AvatarGroupType.default.Group]: "-1.625rem"
    },
    [_AvatarSize.default.L]: {
      [_AvatarGroupType.default.Individual]: "0.125rem",
      [_AvatarGroupType.default.Group]: " -2rem"
    },
    [_AvatarSize.default.XL]: {
      [_AvatarGroupType.default.Individual]: "0.25rem",
      [_AvatarGroupType.default.Group]: "-2.75rem"
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * Displays a group of avatars arranged horizontally. It is useful to visually
   * showcase a group of related avatars, such as, project team members or employees.
   *
   * The component allows you to display the avatars in different sizes,
   * depending on your use case.
   *
   * The <code>AvatarGroup</code> component has two group types:
   * <ul>
   * <li><code>Group</code> type: The avatars are displayed as partially overlapped on
   * top of each other and the entire group has one click/tap area.</li>
   * <li><code>Individual</code> type: The avatars are displayed side-by-side and each
   * avatar has its own click/tap area.</li>
   * </ul>
   *
   * <h3>Responsive Behavior</h3>
   *
   * When the available space is less than the width required to display all avatars,
   * an overflow visualization appears as a button placed at the end with the same shape
   * and size as the avatars. The visualization displays the number of avatars that have overflowed
   * and are not currently visible.
   *
   * <h3>Usage</h3>
   *
   * Use the <code>AvatarGroup</code> if:
   * <ul>
   * <li>You want to display a group of avatars.</li>
   * <li>You want to display several avatars which have something in common.</li>
   * </ul>
   *
   * Do not use the <code>AvatarGroup</code> if:
   * <ul>
   * <li>You want to display a single avatar.</li>
   * <li>You want to display a gallery for simple images.</li>
   * <li>You want to use it for other visual content than avatars.</li>
   * </ul>
   *
   * <h3>Keyboard Handling</h3>
   * The component provides advanced keyboard handling.
   * When focused, the user can use the following keyboard
   * shortcuts in order to perform a navigation:
   *
   * <br>
   * <code>type</code> Individual:
   * <br>
   * <ul>
   * <li>[TAB] - Move focus to the overflow button</li>
   * <li>[LEFT] - Navigate one avatar to the left</li>
   * <li>[RIGHT] - Navigate one avatar to the right</li>
   * <li>[HOME] - Navigate to the first avatar</li>
   * <li>[END] - Navigate to the last avatar</li>
   * <li>[SPACE],[ENTER],[RETURN] - Trigger <code>ui5-click</code> event</li>
   * </ul>
   * <br>
   * <code>type</code> Group:
   * <br>
   * <ul>
   * <li>[TAB] - Move focus to the next interactive element after the component</li>
   * <li>[SPACE],[ENTER],[RETURN] - Trigger <code>ui5-click</code> event</li>
   * </ul>
   * <br>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.AvatarGroup
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-avatar-group
   * @since 1.0.0-rc.11
   * @public
   */
  let AvatarGroup = AvatarGroup_1 = class AvatarGroup extends _UI5Element.default {
    constructor() {
      super();
      this._itemNavigation = new _ItemNavigation.default(this, {
        getItemsCallback: () => {
          return this._isGroup ? [] : this.items.slice(0, this._hiddenStartIndex);
        }
      });
      this._colorIndex = 0;
      this._hiddenItems = 0;
      this._onResizeHandler = this._onResize.bind(this);
    }
    static async onDefine() {
      AvatarGroup_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    /**
     * Returns an array containing the <code>ui5-avatar</code> instances that are currently not displayed due to lack of space.
     * @readonly
     * @type {HTMLElement[]}
     * @defaultValue []
     * @name sap.ui.webc.main.AvatarGroup.prototype.hiddenItems
     * @public
     */
    get hiddenItems() {
      return this.items.slice(this._hiddenStartIndex);
    }
    /**
     * Returns an array containing the <code>AvatarColorScheme</code> values that correspond to the avatars in the component.
     * @readonly
     * @type {sap.ui.webc.main.types.AvatarColorScheme[]}
     * @name sap.ui.webc.main.AvatarGroup.prototype.colorScheme
     * @defaultValue []
     * @public
     */
    get colorScheme() {
      return this.items.map(avatar => avatar._effectiveBackgroundColor);
    }
    get _customOverflowButton() {
      return this.overflowButton.length ? this.overflowButton[0] : undefined;
    }
    get _ariaLabelText() {
      const hiddenItemsCount = this.hiddenItems.length;
      const typeLabelKey = this._isGroup ? _i18nDefaults.AVATAR_GROUP_ARIA_LABEL_GROUP : _i18nDefaults.AVATAR_GROUP_ARIA_LABEL_INDIVIDUAL;
      // avatar type label
      let text = AvatarGroup_1.i18nBundle.getText(typeLabelKey);
      // add displayed-hidden avatars label
      text += ` ${AvatarGroup_1.i18nBundle.getText(_i18nDefaults.AVATAR_GROUP_DISPLAYED_HIDDEN_LABEL, this._itemsCount - hiddenItemsCount, hiddenItemsCount)}`;
      if (this._isGroup) {
        // the container role is "button", add the message for complete list activation
        text += ` ${AvatarGroup_1.i18nBundle.getText(_i18nDefaults.AVATAR_GROUP_SHOW_COMPLETE_LIST_LABEL)}`;
      } else {
        // the container role is "group", add the "how to navigate" message
        text += ` ${AvatarGroup_1.i18nBundle.getText(_i18nDefaults.AVATAR_GROUP_MOVE)}`;
      }
      return text;
    }
    get _overflowButtonAriaLabelText() {
      return this._isGroup ? undefined : AvatarGroup_1.i18nBundle.getText(_i18nDefaults.AVATAR_GROUP_SHOW_COMPLETE_LIST_LABEL);
    }
    get _containerAriaHasPopup() {
      return this._isGroup ? this._getAriaHasPopup() : undefined;
    }
    get _overflowButtonAccAttributes() {
      return {
        hasPopup: this._isGroup ? undefined : this._getAriaHasPopup()
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
      return this.type === _AvatarGroupType.default.Group;
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
    /**
     * Return the effective overflow button width
     * Differences are that when in "Group" type the button is offset and overlaps the avatars
     *
     * 1) In case of "Group", (LTR/RTL aware) button width is qual to second item offset left/right
     * 2) In case of "Individual" group type width is directly taken from button element
     * @private
     */
    get _overflowButtonEffectiveWidth() {
      const button = this._customOverflowButton ? this._customOverflowButton : this._overflowButton;
      // if in "Group" mode overflow button size is equal to the offset from second item
      if (!button) {
        return 0;
      }
      if (this._isGroup) {
        let item = this.items[1];
        const ltrEffectiveWidth = item.offsetLeft - this.offsetLeft;
        // in some cases when second avatar is overflowed the offset of the button is the right one
        if (!item || item.hidden) {
          item = button;
        }
        return this.effectiveDir === "rtl" ? this._getWidthToItem(item) : ltrEffectiveWidth;
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
          "ui5-avatar-group-overflow-btn-xl": this.firstAvatarSize === "XL"
        }
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
      _ResizeHandler.default.register(this, this._onResizeHandler);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._onResizeHandler);
    }
    _onResize() {
      this._overflowItems();
    }
    _onkeydown(e) {
      // when type is "Individual" the ui5-avatar and ui5-button both
      // fire "click" event when SPACE or ENTER are pressed and
      // AvatarGroup "click" is fired in their handlers (_onClick, _onUI5Click).
      if (this._isGroup) {
        if ((0, _Keys.isEnter)(e)) {
          this._fireGroupEvent(e.target);
        } else if ((0, _Keys.isSpace)(e)) {
          // prevent scrolling
          e.preventDefault();
        }
      }
    }
    _onkeyup(e) {
      if (!e.shiftKey && (0, _Keys.isSpace)(e) && this._isGroup) {
        this._fireGroupEvent(e.target);
        e.preventDefault();
      }
    }
    _fireGroupEvent(targetRef) {
      const isOverflowButtonClicked = targetRef.classList.contains(OVERFLOW_BTN_CLASS) || targetRef === this._customOverflowButton;
      this.fireEvent("click", {
        targetRef,
        overflowButtonClicked: isOverflowButtonClicked
      });
    }
    _onClick(e) {
      const target = e.target;
      // no matter the value of noConflict, the ui5-button and the group container (div) always fire a native click event
      const isButton = target.hasAttribute("ui5-button");
      e.stopPropagation();
      if (this._isGroup || isButton) {
        this._fireGroupEvent(target);
      }
    }
    _onUI5Click(e) {
      const target = e.target;
      // when noConflict=true only ui5-avatar will fire ui5-click event
      const isAvatar = target.hasAttribute("ui5-avatar");
      e.stopPropagation();
      if (isAvatar) {
        this._fireGroupEvent(target);
      }
    }
    /**
     * Modifies avatars to the needs of avatar group properties. Respects already set size and background color.
     * Set the margins (offsets) based on RTL/LTR.
     * @private
     */
    _prepareAvatars() {
      this._colorIndex = 0;
      this.items.forEach((avatar, index) => {
        const colorIndex = this._getNextBackgroundColor();
        avatar.interactive = !this._isGroup;
        if (!avatar.getAttribute("_color-scheme")) {
          // AvatarGroup respects colors set to ui5-avatar
          avatar.setAttribute("_color-scheme", _AvatarColorScheme.default[`Accent${colorIndex}`]);
        }
        // last avatar should not be offset as it breaks the container width and focus styles are no set correctly
        if (index !== this._itemsCount - 1 || this._customOverflowButton) {
          // based on RTL the browser automatically sets left or right margin to avatars
          avatar.style.marginInlineEnd = offsets[avatar._effectiveSize][this.type];
        }
      });
    }
    _onfocusin(e) {
      this._itemNavigation.setCurrentItem(e.target);
    }
    /**
     * Returns the total width to item excluding the item width
     * RTL/LTR aware
     * @private
     * @param {HTMLElement} item
     */
    _getWidthToItem(item) {
      const isRTL = this.effectiveDir === "rtl";
      const ltrWidthToItem = item.offsetLeft - this.offsetLeft;
      if (isRTL) {
        const itemOffsetParent = item.offsetParent;
        // in RTL the total width is equal to difference of the parent container width and
        // how much is the item offset to the left minus its offsetWidth
        if (!itemOffsetParent) {
          return 0;
        }
        return itemOffsetParent.offsetWidth - item.offsetLeft - item.offsetWidth;
      }
      return ltrWidthToItem;
    }
    /**
     * Overflows items that were not able to fit the container
     * @private
     */
    _overflowItems() {
      if (this.items.length < 2) {
        // no need to overflow avatars
        return;
      }
      let hiddenItems = 0;
      for (let index = 0; index < this._itemsCount; index++) {
        const item = this.items[index];
        // show item to determine if it will fit the new container size
        item.hidden = false;
        // container width to current item + item width (avatar)
        // used to determine whether the following items will fit the container or not
        let totalWidth = this._getWidthToItem(item) + item.offsetWidth;
        if (index !== this._itemsCount - 1 || this._customOverflowButton) {
          totalWidth += this._overflowButtonEffectiveWidth;
        }
        if (totalWidth > this.offsetWidth) {
          hiddenItems = this._itemsCount - index;
          break;
        }
      }
      // hide the items that did not fit the container size
      this._setHiddenItems(hiddenItems);
    }
    _getNextBackgroundColor() {
      // counter is to automatically assign background colors to avatars, `Accent10` is the highest color value
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
  };
  __decorate([(0, _property.default)({
    type: _AvatarGroupType.default,
    defaultValue: _AvatarGroupType.default.Group
  })], AvatarGroup.prototype, "type", void 0);
  __decorate([(0, _property.default)()], AvatarGroup.prototype, "ariaHaspopup", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true
  })], AvatarGroup.prototype, "_overflowButtonText", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], AvatarGroup.prototype, "items", void 0);
  __decorate([(0, _slot.default)()], AvatarGroup.prototype, "overflowButton", void 0);
  AvatarGroup = AvatarGroup_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-avatar-group",
    renderer: _LitRenderer.default,
    template: _AvatarGroupTemplate.default,
    styles: _AvatarGroup.default,
    dependencies: [_Button.default]
  })
  /**
  * Fired when the component is activated either with a
  * click/tap or by using the Enter or Space key.
  * @param {HTMLElement} targetRef The DOM ref of the clicked item.
  * @param {boolean} overflowButtonClicked indicates if the overflow button is clicked
  * @event sap.ui.webc.main.AvatarGroup#click
  * @public
  * @since 1.0.0-rc.11
  */, (0, _event.default)("click", {
    detail: {
      targetRef: {
        type: HTMLElement
      },
      overflowButtonClicked: {
        type: Boolean
      }
    }
  })
  /**
  * Fired when the count of visible <code>ui5-avatar</code> elements in the
  * component has changed
  * @event sap.ui.webc.main.AvatarGroup#overflow
  * @public
  * @since 1.0.0-rc.13
  */, (0, _event.default)("overflow")], AvatarGroup);
  AvatarGroup.define();
  var _default = AvatarGroup;
  _exports.default = _default;
});