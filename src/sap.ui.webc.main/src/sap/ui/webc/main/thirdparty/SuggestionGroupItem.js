sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "./GroupHeaderListItem"], function (_exports, _UI5Element, _property, _customElement, _GroupHeaderListItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _property = _interopRequireDefault(_property);
  _customElement = _interopRequireDefault(_customElement);
  _GroupHeaderListItem = _interopRequireDefault(_GroupHeaderListItem);
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
   * The <code>ui5-suggestion-group-item</code> is type of suggestion item,
   * that can be used to split the <code>ui5-input</code> suggestions into groups.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.SuggestionGroupItem
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-suggestion-group-item
   * @implements sap.ui.webc.main.IInputSuggestionItem
   * @public
   * @since 1.0.0-rc.15
   */
  let SuggestionGroupItem = class SuggestionGroupItem extends _UI5Element.default {
    /**
     * Indicates the "grouping" nature of the component
     * to avoid tag name checks tag name to diferenciate from the standard suggestion item.
     * @protected
     */
    get groupItem() {
      return true;
    }
  };
  __decorate([(0, _property.default)()], SuggestionGroupItem.prototype, "text", void 0);
  SuggestionGroupItem = __decorate([(0, _customElement.default)({
    tag: "ui5-suggestion-group-item",
    dependencies: [_GroupHeaderListItem.default]
  })], SuggestionGroupItem);
  SuggestionGroupItem.define();
  var _default = SuggestionGroupItem;
  _exports.default = _default;
});