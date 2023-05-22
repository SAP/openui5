sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/types/ValueState", "./SuggestionListItem", "./types/ListItemType"], function (_exports, _UI5Element, _customElement, _property, _ValueState, _SuggestionListItem, _ListItemType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _ValueState = _interopRequireDefault(_ValueState);
  _SuggestionListItem = _interopRequireDefault(_SuggestionListItem);
  _ListItemType = _interopRequireDefault(_ListItemType);
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
   * The <code>ui5-suggestion-item</code> represents the suggestion item of the <code>ui5-input</code>.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.SuggestionItem
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-suggestion-item
   * @implements sap.ui.webc.main.IInputSuggestionItem
   * @public
   */
  let SuggestionItem = class SuggestionItem extends _UI5Element.default {
    get groupItem() {
      return false;
    }
  };
  __decorate([(0, _property.default)()], SuggestionItem.prototype, "text", void 0);
  __decorate([(0, _property.default)({
    type: _ListItemType.default,
    defaultValue: _ListItemType.default.Active
  })], SuggestionItem.prototype, "type", void 0);
  __decorate([(0, _property.default)()], SuggestionItem.prototype, "description", void 0);
  __decorate([(0, _property.default)()], SuggestionItem.prototype, "icon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SuggestionItem.prototype, "iconEnd", void 0);
  __decorate([(0, _property.default)()], SuggestionItem.prototype, "image", void 0);
  __decorate([(0, _property.default)()], SuggestionItem.prototype, "additionalText", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], SuggestionItem.prototype, "additionalTextState", void 0);
  SuggestionItem = __decorate([(0, _customElement.default)({
    tag: "ui5-suggestion-item",
    dependencies: [_SuggestionListItem.default]
  })], SuggestionItem);
  SuggestionItem.define();
  var _default = SuggestionItem;
  _exports.default = _default;
});