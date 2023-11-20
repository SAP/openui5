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
   * The <code>ui5-mcb-group-item</code> is type of suggestion item,
   * that can be used to split the <code>ui5-multi-combobox</code> suggestions into groups.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.MultiComboBoxGroupItem
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-mcb-group-item
   * @public
   * @implements sap.ui.webc.main.IMultiComboBoxItem
   * @since 1.4.0
   */
  let MultiComboBoxGroupItem = class MultiComboBoxGroupItem extends _UI5Element.default {
    /**
     * Used to avoid tag name checks
     * @protected
     */
    get isGroupItem() {
      return true;
    }
    get selected() {
      return false;
    }
    get stableDomRef() {
      return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
    }
  };
  __decorate([(0, _property.default)()], MultiComboBoxGroupItem.prototype, "text", void 0);
  MultiComboBoxGroupItem = __decorate([(0, _customElement.default)("ui5-mcb-group-item")], MultiComboBoxGroupItem);
  MultiComboBoxGroupItem.define();
  var _default = MultiComboBoxGroupItem;
  _exports.default = _default;
});