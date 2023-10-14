sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/customElement"], function (_exports, _UI5Element, _property, _event, _customElement) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _customElement = _interopRequireDefault(_customElement);
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
   * The <code>ui5-shellbar-item</code> represents a custom item, that
   * might be added to the <code>ui5-shellbar</code>.
   * <br><br>
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents-fiori/dist/ShellBarItem";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.ShellBarItem
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-shellbar-item
   * @implements sap.ui.webc.fiori.IShellBarItem
   * @public
   */
  let ShellBarItem = class ShellBarItem extends _UI5Element.default {
    get stableDomRef() {
      return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
    }
    fireClickEvent(e) {
      return this.fireEvent("click", {
        targetRef: e.target
      }, true);
    }
  };
  __decorate([(0, _property.default)()], ShellBarItem.prototype, "icon", void 0);
  __decorate([(0, _property.default)()], ShellBarItem.prototype, "text", void 0);
  __decorate([(0, _property.default)()], ShellBarItem.prototype, "count", void 0);
  ShellBarItem = __decorate([(0, _customElement.default)("ui5-shellbar-item")
  /**
   * Fired, when the item is pressed.
   *
   * @event sap.ui.webc.fiori.ShellBarItem#click
   * @allowPreventDefault
   * @param {HTMLElement} targetRef DOM ref of the clicked element
   * @public
   */, (0, _event.default)("click", {
    detail: {
      targetRef: {
        type: HTMLElement
      }
    }
  })], ShellBarItem);
  ShellBarItem.define();
  var _default = ShellBarItem;
  _exports.default = _default;
});