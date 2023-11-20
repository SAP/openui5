sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/types/Integer", "./generated/templates/SegmentedButtonItemTemplate.lit", "./ToggleButton", "./types/ButtonDesign", "./Icon", "./generated/i18n/i18n-defaults"], function (_exports, _customElement, _property, _Integer, _SegmentedButtonItemTemplate, _ToggleButton, _ButtonDesign, _Icon, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _Integer = _interopRequireDefault(_Integer);
  _SegmentedButtonItemTemplate = _interopRequireDefault(_SegmentedButtonItemTemplate);
  _ToggleButton = _interopRequireDefault(_ToggleButton);
  _ButtonDesign = _interopRequireDefault(_ButtonDesign);
  _Icon = _interopRequireDefault(_Icon);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var SegmentedButtonItem_1;
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * Users can use the <code>ui5-segmented-button-item</code> as part of a <code>ui5-segmented-button</code>.
   * <br><br>
   * Clicking or tapping on a <code>ui5-segmented-button-item</code> changes its state to <code>pressed</code>.
   * The item returns to its initial state when the user clicks or taps on it again.
   * By applying additional custom CSS-styling classes, apps can give a different style to any
   * <code>ui5-segmented-button-item</code>.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/SegmentedButtonItem";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.SegmentedButtonItem
   * @extends sap.ui.webc.main.ToggleButton
   * @abstract
   * @tagname ui5-segmented-button-item
   * @implements sap.ui.webc.main.ISegmentedButtonItem
   * @public
   */
  let SegmentedButtonItem = SegmentedButtonItem_1 = class SegmentedButtonItem extends _ToggleButton.default {
    get ariaDescription() {
      return SegmentedButtonItem_1.i18nBundle.getText(_i18nDefaults.SEGMENTEDBUTTONITEM_ARIA_DESCRIPTION);
    }
  };
  __decorate([(0, _property.default)({
    type: _ButtonDesign.default,
    defaultValue: _ButtonDesign.default.Default
  })], SegmentedButtonItem.prototype, "design", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SegmentedButtonItem.prototype, "iconEnd", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SegmentedButtonItem.prototype, "submits", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 0
  })], SegmentedButtonItem.prototype, "posInSet", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 0
  })], SegmentedButtonItem.prototype, "sizeOfSet", void 0);
  SegmentedButtonItem = SegmentedButtonItem_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-segmented-button-item",
    template: _SegmentedButtonItemTemplate.default,
    dependencies: [_Icon.default]
  })], SegmentedButtonItem);
  SegmentedButtonItem.define();
  var _default = SegmentedButtonItem;
  _exports.default = _default;
});