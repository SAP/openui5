sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/MarkedEvents", "sap/ui/webc/main/thirdparty/ListItemBase", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/main/thirdparty/types/Priority", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/icons/message-success", "sap/ui/webc/common/thirdparty/icons/message-error", "sap/ui/webc/common/thirdparty/icons/message-warning", "sap/ui/webc/common/thirdparty/icons/overflow", "./generated/templates/NotificationOverflowActionsPopoverTemplate.lit", "./generated/themes/NotificationOverflowActionsPopover.css"], function (_exports, _customElement, _Keys, _property, _slot, _event, _i18nBundle, _MarkedEvents, _ListItemBase, _Integer, _Priority, _decline, _messageSuccess, _messageError, _messageWarning, _overflow, _NotificationOverflowActionsPopoverTemplate, _NotificationOverflowActionsPopover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _ListItemBase = _interopRequireDefault(_ListItemBase);
  _Integer = _interopRequireDefault(_Integer);
  _Priority = _interopRequireDefault(_Priority);
  _NotificationOverflowActionsPopoverTemplate = _interopRequireDefault(_NotificationOverflowActionsPopoverTemplate);
  _NotificationOverflowActionsPopover = _interopRequireDefault(_NotificationOverflowActionsPopover);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var NotificationListItemBase_1;

  // Icons

  // Templates

  // Styles

  /**
   * Defines the icons corresponding to the notification's priority.
   */
  const ICON_PER_PRIORITY = {
    [_Priority.default.High]: "message-error",
    [_Priority.default.Medium]: "message-warning",
    [_Priority.default.Low]: "message-success",
    [_Priority.default.None]: ""
  };
  /**
   * @class
   *
   * The base class of the <code>NotificationListItem</code> and <code>NotificationListGroupItem</code>.
   *
   * @abstract
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.NotificationListItemBase
   * @extends sap.ui.webc.main.ListItemBase
   * @since 1.0.0-rc.8
   * @public
   */
  /**
   * Fired when the <code>Close</code> button is pressed.
   *
   * @event sap.ui.webc.fiori.NotificationListItemBase#close
   * @param {HTMLElement} item the closed item.
   * @public
   */
  let NotificationListItemBase = NotificationListItemBase_1 = class NotificationListItemBase extends _ListItemBase.default {
    get hasTitleText() {
      return !!this.titleText.length;
    }
    get hasPriority() {
      return this.priority !== _Priority.default.None;
    }
    get priorityIcon() {
      return ICON_PER_PRIORITY[this.priority];
    }
    get overflowButtonDOM() {
      return this.shadowRoot.querySelector(".ui5-nli-overflow-btn");
    }
    get showOverflow() {
      return !!this.overflowActions.length;
    }
    get overflowActions() {
      if (this.actions.length <= 1) {
        return [];
      }
      return this.actionsInfo;
    }
    get standardActions() {
      if (this.actions.length > 1) {
        return [];
      }
      return this.actionsInfo;
    }
    get actionsInfo() {
      return this.actions.map(action => {
        return {
          icon: action.icon,
          text: action.text,
          press: this._onCustomActionClick.bind(this),
          refItemid: action._id,
          disabled: action.disabled ? true : undefined,
          design: action.design
        };
      });
    }
    /**
     * Event handlers
     */
    _onBtnCloseClick() {
      this.fireEvent("close", {
        item: this
      });
    }
    _onBtnOverflowClick() {
      this.openOverflow();
    }
    _onCustomActionClick(e) {
      const refItemId = e.target.getAttribute("data-ui5-external-action-item-id");
      if (refItemId) {
        this.getActionByID(refItemId).fireClickEvent(e);
        this.closeOverflow();
      }
    }
    _onkeydown(e) {
      super._onkeydown(e);
      if ((0, _MarkedEvents.getEventMark)(e) === "button") {
        return;
      }
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
      }
    }
    getActionByID(id) {
      return this.actions.find(action => action._id === id);
    }
    async openOverflow() {
      const overflowPopover = await this.getOverflowPopover();
      overflowPopover.showAt(this.overflowButtonDOM);
    }
    async closeOverflow() {
      const overflowPopover = await this.getOverflowPopover();
      overflowPopover.close();
    }
    async getOverflowPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector(".ui5-notification-overflow-popover");
    }
    static async onDefine() {
      NotificationListItemBase_1.i18nFioriBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }
  };
  __decorate([(0, _property.default)()], NotificationListItemBase.prototype, "titleText", void 0);
  __decorate([(0, _property.default)({
    type: _Priority.default,
    defaultValue: _Priority.default.None
  })], NotificationListItemBase.prototype, "priority", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], NotificationListItemBase.prototype, "showClose", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], NotificationListItemBase.prototype, "read", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], NotificationListItemBase.prototype, "busy", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 1000
  })], NotificationListItemBase.prototype, "busyDelay", void 0);
  __decorate([(0, _slot.default)()], NotificationListItemBase.prototype, "actions", void 0);
  NotificationListItemBase = NotificationListItemBase_1 = __decorate([(0, _event.default)("close", {
    detail: {
      item: HTMLElement
    }
  }), (0, _customElement.default)({
    staticAreaStyles: _NotificationOverflowActionsPopover.default,
    staticAreaTemplate: _NotificationOverflowActionsPopoverTemplate.default
  })], NotificationListItemBase);
  var _default = NotificationListItemBase;
  _exports.default = _default;
});