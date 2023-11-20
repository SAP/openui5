sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/UI5Element"], function (_exports, _customElement, _property, _UI5Element) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _UI5Element = _interopRequireDefault(_UI5Element);
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
   * The <code>ui5-cb-item</code> represents the item for a <code>ui5-combobox</code>.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.ComboBoxItem
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-cb-item
   * @implements sap.ui.webc.main.IComboBoxItem
   * @public
   */
  let ComboBoxItem = class ComboBoxItem extends _UI5Element.default {
    /**
     * Used to avoid tag name checks
     * @protected
     */
    get isGroupItem() {
      return false;
    }
  };
  __decorate([(0, _property.default)()], ComboBoxItem.prototype, "text", void 0);
  __decorate([(0, _property.default)()], ComboBoxItem.prototype, "additionalText", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ComboBoxItem.prototype, "focused", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ComboBoxItem.prototype, "selected", void 0);
  ComboBoxItem = __decorate([(0, _customElement.default)("ui5-cb-item")], ComboBoxItem);
  ComboBoxItem.define();
  var _default = ComboBoxItem;
  _exports.default = _default;
});