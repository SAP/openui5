sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/slot", "./StandardListItem", "./generated/templates/SuggestionListItemTemplate.lit"], function (_exports, _customElement, _slot, _StandardListItem, _SuggestionListItemTemplate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _slot = _interopRequireDefault(_slot);
  _StandardListItem = _interopRequireDefault(_StandardListItem);
  _SuggestionListItemTemplate = _interopRequireDefault(_SuggestionListItemTemplate);
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
   * The <code>ui5-li-suggestion-item</code> represents the suggestion item in the <code>ui5-input</code>
   * suggestion popover.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-li-suggestion-item</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>title - Used to style the title of the suggestion list item</li>
   * <li>description - Used to style the description of the suggestion list item</li>
   * <li>info - Used to style the info of the suggestion list item</li>
   * </ul>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.SuggestionListItem
   * @extends sap.ui.webc.main.StandardListItem
   * @tagname ui5-li-suggestion-item
   */
  let SuggestionListItem = class SuggestionListItem extends _StandardListItem.default {
    onBeforeRendering() {
      super.onBeforeRendering();
      this.hasTitle = !!this.titleText.length;
    }
    get effectiveTitle() {
      return this.titleText.filter(node => node.nodeType !== Node.COMMENT_NODE).map(el => el.textContent).join("");
    }
    get hasDescription() {
      return this.richDescription.length || this.description;
    }
    get groupItem() {
      return false;
    }
  };
  __decorate([(0, _slot.default)({
    type: HTMLElement
  })], SuggestionListItem.prototype, "richDescription", void 0);
  __decorate([(0, _slot.default)({
    type: Node,
    "default": true
  })], SuggestionListItem.prototype, "titleText", void 0);
  SuggestionListItem = __decorate([(0, _customElement.default)({
    tag: "ui5-li-suggestion-item",
    template: _SuggestionListItemTemplate.default
  })], SuggestionListItem);
  SuggestionListItem.define();
  var _default = SuggestionListItem;
  _exports.default = _default;
});