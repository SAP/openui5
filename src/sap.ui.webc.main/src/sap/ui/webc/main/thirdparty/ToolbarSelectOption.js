sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/property"], function (_exports, _UI5Element, _customElement, _slot, _property) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _slot = _interopRequireDefault(_slot);
  _property = _interopRequireDefault(_property);
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
   *
   * The <code>ui5-toolbar-select-option</code> component defines the content of an option in the <code>ui5-toolbar-select</code>.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.ToolbarSelectOption
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-toolbar-select-option
   * @implements sap.ui.webc.main.IToolbarSelectOption
   * @public
   * @since 1.17.0
   */
  let ToolbarSelectOption = class ToolbarSelectOption extends _UI5Element.default {};
  __decorate([(0, _property.default)({
    type: Boolean
  })], ToolbarSelectOption.prototype, "selected", void 0);
  __decorate([(0, _slot.default)({
    type: Node,
    "default": true,
    invalidateOnChildChange: true
  })], ToolbarSelectOption.prototype, "text", void 0);
  ToolbarSelectOption = __decorate([(0, _customElement.default)("ui5-toolbar-select-option")], ToolbarSelectOption);
  ToolbarSelectOption.define();
  var _default = ToolbarSelectOption;
  _exports.default = _default;
});