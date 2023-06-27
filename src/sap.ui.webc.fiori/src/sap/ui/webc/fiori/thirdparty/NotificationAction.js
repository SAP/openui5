sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/main/thirdparty/types/ButtonDesign", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event"], function (_exports, _UI5Element, _ButtonDesign, _customElement, _property, _event) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _ButtonDesign = _interopRequireDefault(_ButtonDesign);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  /**
   * @class
   * The <code>ui5-notification-action</code> represents an abstract action,
   * used in the <code>ui5-li-notification</code> and the <code>ui5-li-notification-group</code> items.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.NotificationAction
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-notification-action
   * @implements sap.ui.webc.fiori.INotificationAction
   * @public
   */
  let NotificationAction = class NotificationAction extends _UI5Element.default {
    /**
     * Fires a custom event "click".
     * <b>Note:</b> Called by NotificationListItem and NotificationListGroupItem components.
     *
     * @param { MouseEvent } e
     * @protected
     * @returns { boolean } false, if the event was cancelled (preventDefault called), true otherwise
     */
    fireClickEvent(e) {
      return this.fireEvent("click", {
        targetRef: e.target
      }, true);
    }
  };
  __decorate([(0, _property.default)()], NotificationAction.prototype, "text", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], NotificationAction.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: _ButtonDesign.default,
    defaultValue: _ButtonDesign.default.Transparent
  })], NotificationAction.prototype, "design", void 0);
  __decorate([(0, _property.default)()], NotificationAction.prototype, "icon", void 0);
  NotificationAction = __decorate([(0, _customElement.default)("ui5-notification-action")
  /**
   * Fired, when the action is pressed.
   *
   * @event sap.ui.webc.fiori.NotificationAction#click
   * @param {HTMLElement} targetRef DOM ref of the clicked element
   * @public
   */, (0, _event.default)("click", {
    detail: {
      targetRef: {
        type: HTMLElement
      }
    }
  })], NotificationAction);
  NotificationAction.define();
  var _default = NotificationAction;
  _exports.default = _default;
});