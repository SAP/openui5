sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "./generated/templates/CustomListItemTemplate.lit", "./CustomListItem", "./types/ListItemType"], function (_exports, _customElement, _property, _LitRenderer, _CustomListItemTemplate, _CustomListItem, _ListItemType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _CustomListItemTemplate = _interopRequireDefault(_CustomListItemTemplate);
  _CustomListItem = _interopRequireDefault(_CustomListItem);
  _ListItemType = _interopRequireDefault(_ListItemType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  // Template

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The code>ui5-select-menu-option</code> component represents an option in the <code>ui5-select-menu</code>.
   *
   * <h3>Usage</h3>
   *
   * For the <code>ui5-select-menu-option</code>
   * <h3>ES6 Module Import</h3>
   *
   * <code>import @ui5/webcomponents/dist/SelectMenuOption.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.SelectMenuOption
   * @extends sap.ui.webc.base.UI5Element
   * @implements sap.ui.webc.main.ISelectMenuOption
   * @tagname ui5-select-menu-option
   * @public
   * @since 1.17.0
   */
  let SelectMenuOption = class SelectMenuOption extends _CustomListItem.default {
    /**
     * Defines the content of the component.
     * <br><br>
     *
     * @type {Node[]}
     * @name sap.ui.webc.main.SelectMenuOption.prototype.default
     * @slot
     * @public
     */
    /**
     * <b>Note:</b> The slot is inherited and not supported. If set, it won't take any effect.
     *
     * @name sap.ui.webc.main.SelectMenuOption.prototype.deleteButton
     * @type {Node[]}
     * @slot
     * @public
     * @deprecated
     */
    get _accInfo() {
      const accInfoSettings = {
        ariaSelected: this.selected
      };
      return {
        ...super._accInfo,
        ...accInfoSettings
      };
    }
  };
  __decorate([(0, _property.default)()], SelectMenuOption.prototype, "displayText", void 0);
  __decorate([(0, _property.default)()], SelectMenuOption.prototype, "value", void 0);
  __decorate([(0, _property.default)({
    type: _ListItemType.default,
    defaultValue: _ListItemType.default.Active
  })], SelectMenuOption.prototype, "type", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], SelectMenuOption.prototype, "accessibilityAttributes", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SelectMenuOption.prototype, "navigated", void 0);
  SelectMenuOption = __decorate([(0, _customElement.default)({
    tag: "ui5-select-menu-option",
    renderer: _LitRenderer.default,
    styles: _CustomListItem.default.styles,
    template: _CustomListItemTemplate.default,
    dependencies: []
  })], SelectMenuOption);
  SelectMenuOption.define();
  var _default = SelectMenuOption;
  _exports.default = _default;
});