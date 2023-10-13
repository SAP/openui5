sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/types/CSSSize", "./Button", "./types/ButtonDesign", "./ToolbarItem", "./generated/templates/ToolbarButtonTemplate.lit", "./generated/templates/ToolbarPopoverButtonTemplate.lit", "./generated/themes/ToolbarButtonPopover.css", "./ToolbarRegistry"], function (_exports, _customElement, _property, _event, _CSSSize, _Button, _ButtonDesign, _ToolbarItem, _ToolbarButtonTemplate, _ToolbarPopoverButtonTemplate, _ToolbarButtonPopover, _ToolbarRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _CSSSize = _interopRequireDefault(_CSSSize);
  _Button = _interopRequireDefault(_Button);
  _ButtonDesign = _interopRequireDefault(_ButtonDesign);
  _ToolbarItem = _interopRequireDefault(_ToolbarItem);
  _ToolbarButtonTemplate = _interopRequireDefault(_ToolbarButtonTemplate);
  _ToolbarPopoverButtonTemplate = _interopRequireDefault(_ToolbarPopoverButtonTemplate);
  _ToolbarButtonPopover = _interopRequireDefault(_ToolbarButtonPopover);
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
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-toolbar-button</code> represents an abstract action,
   * used in the <code>ui5-toolbar</code>.
   *
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents/dist/ToolbarButton";</code>
   *
   * @constructor
   * @abstract
   * @author SAP SE
   * @alias sap.ui.webc.main.ToolbarButton
   * @extends sap.ui.webc.main.ToolbarItem
   * @tagname ui5-toolbar-button
   * @public
   * @implements sap.ui.webc.main.IToolbarItem
   * @since 1.17.0
   */
  let ToolbarButton = class ToolbarButton extends _ToolbarItem.default {
    static get staticAreaStyles() {
      return _ToolbarButtonPopover.default;
    }
    get styles() {
      return {
        width: this.width,
        display: this.hidden ? "none" : "inline-block"
      };
    }
    get containsText() {
      return true;
    }
    static get toolbarTemplate() {
      return _ToolbarButtonTemplate.default;
    }
    static get toolbarPopoverTemplate() {
      return _ToolbarPopoverButtonTemplate.default;
    }
    get subscribedEvents() {
      const map = new Map();
      map.set("click", {
        preventClosing: false
      });
      return map;
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], ToolbarButton.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: _ButtonDesign.default,
    defaultValue: _ButtonDesign.default.Default
  })], ToolbarButton.prototype, "design", void 0);
  __decorate([(0, _property.default)()], ToolbarButton.prototype, "icon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ToolbarButton.prototype, "iconEnd", void 0);
  __decorate([(0, _property.default)()], ToolbarButton.prototype, "tooltip", void 0);
  __decorate([(0, _property.default)({
    defaultValue: undefined
  })], ToolbarButton.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    defaultValue: ""
  })], ToolbarButton.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], ToolbarButton.prototype, "accessibilityAttributes", void 0);
  __decorate([(0, _property.default)()], ToolbarButton.prototype, "text", void 0);
  __decorate([(0, _property.default)({
    validator: _CSSSize.default
  })], ToolbarButton.prototype, "width", void 0);
  ToolbarButton = __decorate([(0, _customElement.default)({
    tag: "ui5-toolbar-button",
    dependencies: [_Button.default]
  })
  /**
   * Fired when the component is activated either with a
   * mouse/tap or by using the Enter or Space key.
   * <br><br>
   * <b>Note:</b> The event will not be fired if the <code>disabled</code>
   * property is set to <code>true</code>.
   *
   * @event sap.ui.webc.main.ToolbarButton#click
   * @public
   */, (0, _event.default)("click")], ToolbarButton);
  (0, _ToolbarRegistry.registerToolbarItem)(ToolbarButton);
  ToolbarButton.define();
  var _default = ToolbarButton;
  _exports.default = _default;
});