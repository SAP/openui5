sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "./ListItem", "./generated/templates/CustomListItemTemplate.lit", "./generated/themes/CustomListItem.css"], function (_exports, _Keys, _customElement, _property, _ListItem, _CustomListItemTemplate, _CustomListItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _ListItem = _interopRequireDefault(_ListItem);
  _CustomListItemTemplate = _interopRequireDefault(_CustomListItemTemplate);
  _CustomListItem = _interopRequireDefault(_CustomListItem);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  // Styles

  /**
   * @class
   *
   * A component to be used as custom list item within the <code>ui5-list</code>
   * the same way as the standard <code>ui5-li</code>.
   *
   * The component accepts arbitrary HTML content to allow full customization.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-li-custom</code> exposes the following CSS Shadow Parts:
   * <ul>
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
   * @alias sap.ui.webc.main.CustomListItem
   * @extends sap.ui.webc.main.ListItem
   * @tagname ui5-li-custom
   * @implements sap.ui.webc.main.IListItem
   * @public
   */
  let CustomListItem = class CustomListItem extends _ListItem.default {
    /**
     * Defines the content of the component.
     * @type {Node[]}
     * @name sap.ui.webc.main.CustomListItem.prototype.default
     * @slot
     * @public
     */
    _onkeydown(e) {
      const isTab = (0, _Keys.isTabNext)(e) || (0, _Keys.isTabPrevious)(e);
      if (!isTab && !this.focused) {
        return;
      }
      super._onkeydown(e);
    }
    _onkeyup(e) {
      const isTab = (0, _Keys.isTabNext)(e) || (0, _Keys.isTabPrevious)(e);
      if (!isTab && !this.focused) {
        return;
      }
      super._onkeyup(e);
    }
    get classes() {
      const result = super.classes;
      result.main["ui5-custom-li-root"] = true;
      return result;
    }
  };
  __decorate([(0, _property.default)()], CustomListItem.prototype, "accessibleName", void 0);
  CustomListItem = __decorate([(0, _customElement.default)({
    tag: "ui5-li-custom",
    template: _CustomListItemTemplate.default,
    styles: [_ListItem.default.styles, _CustomListItem.default]
  })], CustomListItem);
  CustomListItem.define();
  var _default = CustomListItem;
  _exports.default = _default;
});