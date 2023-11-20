sap.ui.define(["exports", "sap/ui/webc/main/thirdparty/types/Priority", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/main/thirdparty/List", "sap/ui/webc/main/thirdparty/Button", "sap/ui/webc/main/thirdparty/BusyIndicator", "sap/ui/webc/main/thirdparty/Icon", "sap/ui/webc/main/thirdparty/Popover", "./NotificationListItemBase", "sap/ui/webc/common/thirdparty/icons/navigation-right-arrow", "sap/ui/webc/common/thirdparty/icons/overflow", "sap/ui/webc/common/thirdparty/icons/decline", "./generated/i18n/i18n-defaults", "./generated/templates/NotificationListGroupItemTemplate.lit", "./generated/themes/NotificationListGroupItem.css"], function (_exports, _Priority, _customElement, _property, _slot, _event, _List, _Button, _BusyIndicator, _Icon, _Popover, _NotificationListItemBase, _navigationRightArrow, _overflow, _decline, _i18nDefaults, _NotificationListGroupItemTemplate, _NotificationListGroupItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _Priority = _interopRequireDefault(_Priority);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _List = _interopRequireDefault(_List);
  _Button = _interopRequireDefault(_Button);
  _BusyIndicator = _interopRequireDefault(_BusyIndicator);
  _Icon = _interopRequireDefault(_Icon);
  _Popover = _interopRequireDefault(_Popover);
  _NotificationListItemBase = _interopRequireDefault(_NotificationListItemBase);
  _NotificationListGroupItemTemplate = _interopRequireDefault(_NotificationListGroupItemTemplate);
  _NotificationListGroupItem = _interopRequireDefault(_NotificationListGroupItem);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var NotificationListGroupItem_1;

  // Icons

  // Texts

  // Templates

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-li-notification-group</code> is a special type of list item,
   * that unlike others can group items within self, usually <code>ui5-li-notification</code> items.
   * <br>
   *
   * The component consists of:
   * <ul>
   * <li><code>Toggle</code> button to expand and collapse the group</li>
   * <li><code>Priority</code> icon to display the priority of the group</li>
   * <li><code>TitleText</code> to entitle the group</li>
   * <li>Custom actions - with the use of <code>ui5-notification-action</code></li>
   * <li>Items of the group</li>
   * </ul>
   *
   * <h3>Usage</h3>
   * The component can be used in a standard <code>ui5-list</code>.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-li-notification-group</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>title-text - Used to style the titleText of the notification list group item</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/NotificationListGroupItem.js";</code>
   * <br>
   * <code>import "@ui5/webcomponents/dist/NotificationAction.js";</code> (optional)
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.NotificationListGroupItem
   * @extends sap.ui.webc.fiori.NotificationListItemBase
   * @tagname ui5-li-notification-group
   * @since 1.0.0-rc.8
   * @appenddocs sap.ui.webc.fiori.NotificationAction
   * @implements sap.ui.webc.main.IListItem
   * @public
   */
  let NotificationListGroupItem = NotificationListGroupItem_1 = class NotificationListGroupItem extends _NotificationListItemBase.default {
    onBeforeRendering() {
      if (this.busy) {
        this.clearChildBusyIndicator();
      }
    }
    /**
     * Clears child items busy state to show a single busy over the entire group,
     * instead of multiple BusyIndicator instances
     */
    clearChildBusyIndicator() {
      this.items.forEach(item => {
        item.busy = false;
      });
    }
    get itemsCount() {
      return this.items.length;
    }
    get overflowBtnAccessibleName() {
      return NotificationListGroupItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_OVERLOW_BTN_TITLE);
    }
    get closeBtnAccessibleName() {
      return NotificationListGroupItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_GROUP_ITEM_CLOSE_BTN_TITLE);
    }
    get toggleBtnAccessibleName() {
      if (this.collapsed) {
        return NotificationListGroupItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_GROUP_ITEM_TOGGLE_BTN_EXPAND_TITLE);
      }
      return NotificationListGroupItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_GROUP_ITEM_TOGGLE_BTN_COLLAPSE_TITLE);
    }
    get priorityText() {
      if (this.priority === _Priority.default.High) {
        return NotificationListGroupItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_HIGH_PRIORITY_TXT);
      }
      if (this.priority === _Priority.default.Medium) {
        return NotificationListGroupItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_MEDIUM_PRIORITY_TXT);
      }
      if (this.priority === _Priority.default.Low) {
        return NotificationListGroupItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_LOW_PRIORITY_TXT);
      }
      return "";
    }
    get accInvisibleText() {
      return `${this.groupText} ${this.readText} ${this.priorityText} ${this.counterText}`;
    }
    get readText() {
      if (this.read) {
        return NotificationListGroupItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_READ);
      }
      return NotificationListGroupItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_ITEM_UNREAD);
    }
    get groupText() {
      return NotificationListGroupItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_GROUP_ITEM_TXT);
    }
    get counterText() {
      const text = NotificationListGroupItem_1.i18nFioriBundle.getText(_i18nDefaults.NOTIFICATION_LIST_GROUP_ITEM_COUNTER_TXT);
      return this.showCounter ? `${text} ${this.itemsCount}` : "";
    }
    get ariaLabelledBy() {
      const id = this._id;
      const ids = [];
      if (this.hasTitleText) {
        ids.push(`${id}-title-text`);
      }
      ids.push(`${id}-invisibleText`);
      return ids.join(" ");
    }
    get _ariaExpanded() {
      return !this.collapsed;
    }
    /**
     * Event handlers
     *
     */
    _onBtnToggleClick() {
      this.collapsed = !this.collapsed;
      this.fireEvent("toggle", {
        item: this
      });
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], NotificationListGroupItem.prototype, "collapsed", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], NotificationListGroupItem.prototype, "showCounter", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], NotificationListGroupItem.prototype, "items", void 0);
  NotificationListGroupItem = NotificationListGroupItem_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-li-notification-group",
    languageAware: true,
    styles: _NotificationListGroupItem.default,
    template: _NotificationListGroupItemTemplate.default,
    dependencies: [_List.default, _Button.default, _Icon.default, _BusyIndicator.default, _Popover.default]
  })
  /**
   * Fired when the <code>ui5-li-notification-group</code> is expanded/collapsed by user interaction.
   *
   * @public
   * @event sap.ui.webc.fiori.NotificationListGroupItem#toggle
   */, (0, _event.default)("toggle")], NotificationListGroupItem);
  NotificationListGroupItem.define();
  var _default = NotificationListGroupItem;
  _exports.default = _default;
});