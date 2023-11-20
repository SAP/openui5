sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/types/ValueState", "./ListItem", "./Icon", "./Avatar", "./types/WrappingType", "./generated/templates/StandardListItemTemplate.lit"], function (_exports, _customElement, _property, _slot, _ValueState, _ListItem, _Icon, _Avatar, _WrappingType, _StandardListItemTemplate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _ValueState = _interopRequireDefault(_ValueState);
  _ListItem = _interopRequireDefault(_ListItem);
  _Icon = _interopRequireDefault(_Icon);
  _Avatar = _interopRequireDefault(_Avatar);
  _WrappingType = _interopRequireDefault(_WrappingType);
  _StandardListItemTemplate = _interopRequireDefault(_StandardListItemTemplate);
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
   * The <code>ui5-li</code> represents the simplest type of item for a <code>ui5-list</code>.
   *
   * This is a list item,
   * providing the most common use cases such as <code>text</code>,
   * <code>image</code> and <code>icon</code>.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-li</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>title - Used to style the title of the list item</li>
   * <li>description - Used to style the description of the list item</li>
   * <li>additional-text - Used to style the additionalText of the list item</li>
   * <li>icon - Used to style the icon of the list item</li>
   * <li>native-li - Used to style the main li tag of the list item</li>
   * <li>content - Used to style the content area of the list item</li>
   * <li>detail-button - Used to style the button rendered when the list item is of type detail</li>
   * <li>delete-button - Used to style the button rendered when the list item is in delete mode</li>
   * <li>radio - Used to style the radio button rendered when the list item is in single selection mode</li>
   * <li>checkbox - Used to style the checkbox rendered when the list item is in multiple selection mode</li>
   * </ul>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.StandardListItem
   * @extends sap.ui.webc.main.ListItem
   * @tagname ui5-li
   * @implements sap.ui.webc.main.IListItem
   * @public
   */
  let StandardListItem = class StandardListItem extends _ListItem.default {
    onBeforeRendering() {
      super.onBeforeRendering();
      this.hasTitle = !!this.textContent;
      this._hasImageContent = this.hasImageContent;
    }
    get displayImage() {
      return !!this.image;
    }
    get displayIconBegin() {
      return !!(this.icon && !this.iconEnd);
    }
    get displayIconEnd() {
      return !!(this.icon && this.iconEnd);
    }
    get hasImageContent() {
      return !!this.imageContent.length;
    }
  };
  __decorate([(0, _property.default)()], StandardListItem.prototype, "description", void 0);
  __decorate([(0, _property.default)()], StandardListItem.prototype, "icon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], StandardListItem.prototype, "iconEnd", void 0);
  __decorate([(0, _property.default)()], StandardListItem.prototype, "image", void 0);
  __decorate([(0, _property.default)()], StandardListItem.prototype, "additionalText", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], StandardListItem.prototype, "additionalTextState", void 0);
  __decorate([(0, _property.default)()], StandardListItem.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    type: _WrappingType.default,
    defaultValue: _WrappingType.default.None
  })], StandardListItem.prototype, "wrappingType", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], StandardListItem.prototype, "hasTitle", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], StandardListItem.prototype, "_hasImageContent", void 0);
  __decorate([(0, _slot.default)()], StandardListItem.prototype, "imageContent", void 0);
  StandardListItem = __decorate([(0, _customElement.default)({
    tag: "ui5-li",
    template: _StandardListItemTemplate.default,
    dependencies: [..._ListItem.default.dependencies, _Icon.default, _Avatar.default]
  })], StandardListItem);
  StandardListItem.define();
  var _default = StandardListItem;
  _exports.default = _default;
});