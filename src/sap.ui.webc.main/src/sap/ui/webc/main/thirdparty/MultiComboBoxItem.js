sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "./ComboBoxItem"], function (_exports, _customElement, _property, _ComboBoxItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _ComboBoxItem = _interopRequireDefault(_ComboBoxItem);
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
   * The <code>ui5-mcb-item</code> represents the item for a <code>ui5-multi-combobox</code>.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.MultiComboBoxItem
   * @extends sap.ui.webc.main.ComboBoxItem
   * @abstract
   * @tagname ui5-mcb-item
   * @implements sap.ui.webc.main.IMultiComboBoxItem
   * @public
   */
  let MultiComboBoxItem = class MultiComboBoxItem extends _ComboBoxItem.default {
    get stableDomRef() {
      return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], MultiComboBoxItem.prototype, "selected", void 0);
  MultiComboBoxItem = __decorate([(0, _customElement.default)("ui5-mcb-item")], MultiComboBoxItem);
  MultiComboBoxItem.define();
  var _default = MultiComboBoxItem;
  _exports.default = _default;
});