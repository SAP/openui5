sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/types/CSSSize", "./generated/templates/ToolbarSpacerTemplate.lit", "./ToolbarItem", "./ToolbarRegistry"], function (_exports, _property, _customElement, _CSSSize, _ToolbarSpacerTemplate, _ToolbarItem, _ToolbarRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _property = _interopRequireDefault(_property);
  _customElement = _interopRequireDefault(_customElement);
  _CSSSize = _interopRequireDefault(_CSSSize);
  _ToolbarSpacerTemplate = _interopRequireDefault(_ToolbarSpacerTemplate);
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
   * The <code>ui5-toolbar-spacer</code> is an element, used for taking needed space for toolbar items to take 100% width.
   * It takes no space in calculating toolbar items width.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.ToolbarSpacer
   * @extends sap.ui.webc.main.ToolbarItem
   * @tagname ui5-toolbar-spacer
   * @abstract
   * @since 1.17.0
   * @implements sap.ui.webc.main.IToolbarItem
   * @public
   */
  let ToolbarSpacer = class ToolbarSpacer extends _ToolbarItem.default {
    get styles() {
      return this.width ? {
        width: this.width
      } : {
        flex: "auto"
      };
    }
    get ignoreSpace() {
      return this.width === "";
    }
    get hasFlexibleWidth() {
      return this.width === "";
    }
    static get toolbarTemplate() {
      return _ToolbarSpacerTemplate.default;
    }
    static get toolbarPopoverTemplate() {
      return _ToolbarSpacerTemplate.default;
    }
    get isInteractive() {
      return false;
    }
  };
  __decorate([(0, _property.default)({
    validator: _CSSSize.default
  })], ToolbarSpacer.prototype, "width", void 0);
  ToolbarSpacer = __decorate([(0, _customElement.default)({
    tag: "ui5-toolbar-spacer"
  })], ToolbarSpacer);
  (0, _ToolbarRegistry.registerToolbarItem)(ToolbarSpacer);
  ToolbarSpacer.define();
  var _default = ToolbarSpacer;
  _exports.default = _default;
});