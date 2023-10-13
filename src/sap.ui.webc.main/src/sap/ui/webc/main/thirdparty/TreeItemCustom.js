sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "./TreeItemBase", "./generated/templates/TreeItemCustomTemplate.lit", "./generated/themes/TreeItem.css"], function (_exports, _customElement, _property, _slot, _TreeItemBase, _TreeItemCustomTemplate, _TreeItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _TreeItemBase = _interopRequireDefault(_TreeItemBase);
  _TreeItemCustomTemplate = _interopRequireDefault(_TreeItemCustomTemplate);
  _TreeItem = _interopRequireDefault(_TreeItem);
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
   * The <code>ui5-tree-item-custom</code> represents a node in a tree structure, shown as a <code>ui5-list</code>.
   * <br>
   * This is the item to use inside a <code>ui5-tree</code>.
   * You can represent an arbitrary tree structure by recursively nesting tree items.
   *
   * You can use this item to put any custom content inside the tree item.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-tree-item-custom</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>title - Used to style the title of the tree list item</li>
   * <li>additionalText - Used to style the additionalText of the tree list item</li>
   * <li>icon - Used to style the icon of the tree list item</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents/dist/TreeItemCustom.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.TreeItemCustom
   * @extends sap.ui.webc.main.TreeItemBase
   * @tagname ui5-tree-item-custom
   * @public
   * @implements sap.ui.webc.main.ITreeItem
   * @since 1.9.2
   */
  let TreeItemCustom = class TreeItemCustom extends _TreeItemBase.default {
    /**
     * @override
     */
    get placeSelectionElementBefore() {
      return !this.hideSelectionElement && super.placeSelectionElementBefore;
    }
    /**
     * @override
     */
    get placeSelectionElementAfter() {
      return !this.hideSelectionElement && super.placeSelectionElementAfter;
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], TreeItemCustom.prototype, "hideSelectionElement", void 0);
  __decorate([(0, _slot.default)()], TreeItemCustom.prototype, "content", void 0);
  TreeItemCustom = __decorate([(0, _customElement.default)({
    tag: "ui5-tree-item-custom",
    template: _TreeItemCustomTemplate.default,
    styles: [_TreeItemBase.default.styles, _TreeItem.default]
  })], TreeItemCustom);
  TreeItemCustom.define();
  var _default = TreeItemCustom;
  _exports.default = _default;
});