sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/MarkedEvents", "sap/ui/webc/main/thirdparty/types/Priority", "sap/ui/webc/main/thirdparty/Button", "sap/ui/webc/main/thirdparty/BusyIndicator", "sap/ui/webc/main/thirdparty/Link", "sap/ui/webc/main/thirdparty/Icon", "sap/ui/webc/main/thirdparty/Popover", "sap/ui/webc/main/thirdparty/types/WrappingType", "./NotificationListItemBase", "sap/ui/webc/common/thirdparty/icons/overflow", "sap/ui/webc/common/thirdparty/icons/decline", "./generated/i18n/i18n-defaults", "./generated/templates/NotificationListItemTemplate.lit", "./generated/themes/NotificationListItem.css"], function (_exports, _Keys, _customElement, _property, _slot, _event, _ResizeHandler, _MarkedEvents, _Priority, _Button, _BusyIndicator, _Link, _Icon, _Popover, _WrappingType, _NotificationListItemBase, _overflow, _decline, _i18nDefaults, _NotificationListItemTemplate, _NotificationListItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _Priority = _interopRequireDefault(_Priority);
  _Button = _interopRequireDefault(_Button);
  _BusyIndicator = _interopRequireDefault(_BusyIndicator);
  _Link = _interopRequireDefault(_Link);
  _Icon = _interopRequireDefault(_Icon);
  _Popover = _interopRequireDefault(_Popover);
  _WrappingType = _interopRequireDefault(_WrappingType);
  _NotificationListItemBase = _interopRequireDefault(_NotificationListItemBase);
  _NotificationListItemTemplate = _interopRequireDefault(_NotificationListItemTemplate);
  _NotificationListItem = _interopRequireDefault(_NotificationListItem);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var NotificationListItem_1;

  // Icons

  // Texts

  // Templates

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-li-notification</code> is a type of list item, meant to display notifications.
   * <br>
   *
   * The component has a rich set of various properties that allows the user to set <code>avatar</code>, <code>titleText</code>, descriptive <code>content</code>
   * and <code>footnotes</code> to fully describe a notification.
   * <br>
   *
   * The user can:
   * <ul>
   * <li>display a <code>Close</code> button</li>
   * <li>can control whether the <code>titleText</code> and <code>description</code> should wrap or truncate
   * and display a <code>ShowMore</code> button to switch between less and more information</li>
   * <li>add custom actions by using the <code>ui5-notification-action</code> component</li>
   * </ul>
   *
   * <h3>Usage</h3>
   * The component can be used in a standard <code>ui5-list</code>.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-li-notification</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>title-text - Used to style the titleText of the notification list item</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/NotificationListItem.js";</code>
   * <br>
   * <code>import "@ui5/webcomponents/dist/NotificationAction.js";</code> (optional)
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.NotificationListItem
   * @extends sap.ui.webc.fiori.NotificationListItemBase
   * @tagname ui5-li-notification
   * @appenddocs sap.ui.webc.fiori.NotificationAction
   * @since 1.0.0-rc.8
   * @implements sap.ui.webc.fiori.INotificationListItem, sap.ui.webc.main.IListItem
   * @public
   */
  let NotificationListItem = NotificationListItem_1 = class NotificationListItem extends _NotificationListItemBase.default {
    constructor() {
      super();
      // the titleText overflow height
      this._titleTextOverflowHeight = 0;
      // the description overflow height
      this._descOverflowHeight = 0;
      // the resize handler
      this._onResizeBound = this.onResize.bind(this);
    }
    onEnterDOM() {
      _ResizeHandler.default.register(this, this._onResizeBound);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._onResizeBound);
    }
    get hasDesc() {
      return !!this.description.length;
    }
    get hasFootNotes() {
      return !!this.footnotes.length;
    }
    get showMoreText() {
      if (this._showMorePressed) {
        return NotificationListItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_SHOW_LESS);
      }
      return NotificationListItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_SHOW_MORE);
    }
    get overflowBtnAccessibleName() {
      return NotificationListItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_OVERLOW_BTN_TITLE);
    }
    get closeBtnAccessibleName() {
      return NotificationListItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_CLOSE_BTN_TITLE);
    }
    get hideShowMore() {
      if (this.wrappingType === _WrappingType.default.None && this._showMore) {
        return undefined;
      }
      return true;
    }
    get descriptionDOM() {
      return this.shadowRoot.querySelector(".ui5-nli-description");
    }
    get titleTextDOM() {
      return this.shadowRoot.querySelector(".ui5-nli-title-text");
    }
    get titleTextHeight() {
      return this.titleTextDOM.offsetHeight;
    }
    get descriptionHeight() {
      return this.descriptionDOM.offsetHeight;
    }
    get titleTextOverflows() {
      const titleText = this.titleTextDOM;
      if (!titleText) {
        return false;
      }
      return titleText.offsetHeight < titleText.scrollHeight;
    }
    get descriptionOverflows() {
      const description = this.descriptionDOM;
      if (!description) {
        return false;
      }
      return description.offsetHeight < description.scrollHeight;
    }
    get footerItems() {
      return this.footnotes.map((el, idx, arr) => {
        return {
          slotName: el._individualSlot,
          showDivider: idx !== arr.length - 1
        };
      });
    }
    get ariaLabelledBy() {
      const id = this._id;
      const ids = [];
      if (this.hasTitleText) {
        ids.push(`${id}-title-text`);
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
      if (this.priority === _Priority.default.High) {
        return NotificationListItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_HIGH_PRIORITY_TXT);
      }
      if (this.priority === _Priority.default.Medium) {
        return NotificationListItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_MEDIUM_PRIORITY_TXT);
      }
      if (this.priority === _Priority.default.Low) {
        return NotificationListItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_LOW_PRIORITY_TXT);
      }
      return "";
    }
    get accInvisibleText() {
      const notificationText = NotificationListItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_TXT);
      const readText = this.read ? NotificationListItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_READ) : NotificationListItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_UNREAD);
      const priorityText = this.priorityText;
      return `${notificationText} ${readText} ${priorityText}`;
    }
    /**
     * Event handlers
     */
    _onclick(e) {
      this.fireItemPress(e);
    }
    _onShowMoreClick(e) {
      e.preventDefault();
      this._showMorePressed = !this._showMorePressed;
    }
    _onkeydown(e) {
      super._onkeydown(e);
      if ((0, _Keys.isEnter)(e)) {
        this.fireItemPress(e);
      }
    }
    _onkeyup(e) {
      super._onkeyup(e);
      const space = (0, _Keys.isSpace)(e);
      if (space && (0, _MarkedEvents.getEventMark)(e) === "link") {
        this._onShowMoreClick(e);
        return;
      }
      if (space) {
        this.fireItemPress(e);
      }
    }
    /**
     * Private
     */
    fireItemPress(e) {
      if ((0, _MarkedEvents.getEventMark)(e) === "button" || (0, _MarkedEvents.getEventMark)(e) === "link") {
        return;
      }
      this.fireEvent("_press", {
        item: this
      });
    }
    onResize() {
      if (this.wrappingType === _WrappingType.default.Normal) {
        this._showMore = false;
        return;
      }
      const titleTextWouldOverflow = this.titleTextHeight > this._titleTextOverflowHeight;
      const descWouldOverflow = this.hasDesc && this.descriptionHeight > this._descOverflowHeight;
      const overflows = titleTextWouldOverflow || descWouldOverflow;
      if (this._showMorePressed && overflows) {
        this._showMore = true;
        return;
      }
      if (this.titleTextOverflows || this.descriptionOverflows) {
        this._titleTextOverflowHeight = this.titleTextHeight;
        this._descOverflowHeight = this.hasDesc ? this.descriptionHeight : 0;
        this._showMore = true;
        return;
      }
      this._showMore = false;
    }
  };
  __decorate([(0, _property.default)({
    type: _WrappingType.default,
    defaultValue: _WrappingType.default.None
  })], NotificationListItem.prototype, "wrappingType", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], NotificationListItem.prototype, "_showMorePressed", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], NotificationListItem.prototype, "_showMore", void 0);
  __decorate([(0, _slot.default)()], NotificationListItem.prototype, "avatar", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    individualSlots: true
  })], NotificationListItem.prototype, "footnotes", void 0);
  __decorate([(0, _slot.default)({
    type: Node,
    "default": true
  })], NotificationListItem.prototype, "description", void 0);
  NotificationListItem = NotificationListItem_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-li-notification",
    languageAware: true,
    styles: _NotificationListItem.default,
    template: _NotificationListItemTemplate.default,
    dependencies: [_Button.default, _Icon.default, _BusyIndicator.default, _Link.default, _Popover.default]
  }), (0, _event.default)("_press")], NotificationListItem);
  NotificationListItem.define();
  var _default = NotificationListItem;
  _exports.default = _default;
});