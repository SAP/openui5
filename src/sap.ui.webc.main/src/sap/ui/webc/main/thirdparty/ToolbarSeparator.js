sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "./generated/templates/ToolbarSeparatorTemplate.lit", "./generated/templates/ToolbarPopoverSeparatorTemplate.lit", "./ToolbarRegistry", "./ToolbarItem"], function (_exports, _customElement, _property, _ToolbarSeparatorTemplate, _ToolbarPopoverSeparatorTemplate, _ToolbarRegistry, _ToolbarItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _ToolbarSeparatorTemplate = _interopRequireDefault(_ToolbarSeparatorTemplate);
  _ToolbarPopoverSeparatorTemplate = _interopRequireDefault(_ToolbarPopoverSeparatorTemplate);
  _ToolbarItem = _interopRequireDefault(_ToolbarItem);
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
   * The <code>ui5-toolbar-separator</code> is an element, used for visual separation between two elements.
   * It takes no space in calculating toolbar items width.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.ToolbarSeparator
   * @extends sap.ui.webc.main.ToolbarItem
   * @tagname ui5-toolbar-separator
   * @since 1.17.0
   * @abstract
   * @implements sap.ui.webc.main.IToolbarItem
   * @public
   */
  let ToolbarSeparator = class ToolbarSeparator extends _ToolbarItem.default {
    static get toolbarTemplate() {
      return _ToolbarSeparatorTemplate.default;
    }
    static get toolbarPopoverTemplate() {
      return _ToolbarPopoverSeparatorTemplate.default;
    }
    get isSeparator() {
      return true;
    }
    get isInteractive() {
      return false;
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], ToolbarSeparator.prototype, "visible", void 0);
  ToolbarSeparator = __decorate([(0, _customElement.default)({
    tag: "ui5-toolbar-separator"
  })], ToolbarSeparator);
  (0, _ToolbarRegistry.registerToolbarItem)(ToolbarSeparator);
  ToolbarSeparator.define();
  var _default = ToolbarSeparator;
  _exports.default = _default;
});