sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/property", "./types/ToolbarItemOverflowBehavior"], function (_exports, _UI5Element, _property, _ToolbarItemOverflowBehavior) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _property = _interopRequireDefault(_property);
  _ToolbarItemOverflowBehavior = _interopRequireDefault(_ToolbarItemOverflowBehavior);
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
   *
   * The <code>ui5-tb-item</code> represents an abstract class for items,
   * used in the <code>ui5-toolbar</code>.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.ToolbarItem
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @public
   * @since 1.17.0
   */
  class ToolbarItem extends _UI5Element.default {
    /**
    * Defines if the width of the item should be ignored in calculating the whole width of the toolbar
    * @returns {boolean}
    * @protected
    */
    get ignoreSpace() {
      return false;
    }
    /**
     * Returns if the item contains text. Used to position the text properly inside the popover.
     * Aligned left if the item has text, default aligned otherwise.
     * @protected
     * @returns {boolean}
     */
    get containsText() {
      return false;
    }
    /**
     * Returns if the item is flexible. An item that is returning true for this property will make
     * the toolbar expand to fill the 100% width of its container.
     * @protected
     * @returns {Boolean}
     */
    get hasFlexibleWidth() {
      return false;
    }
    /**
     * Returns if the item is interactive.
     * This value is used to determinate if the toolbar should have its accessibility role and attributes set.
     * At least two interactive items are needed for the toolbar to have the role="toolbar" attribute set.
     * @protected
     * @returns {boolean}
     */
    get isInteractive() {
      return true;
    }
    /**
     * Returns if the item is separator.
     * @protected
     * @returns {boolean}
     */
    get isSeparator() {
      return false;
    }
    /**
     * Returns the template for the toolbar item.
     * @protected
     * @returns {TemplateFunction}
     */
    static get toolbarTemplate() {
      throw new Error("Template must be defined");
    }
    /**
     * Returns the template for the toolbar item popover.
     * @protected
     * @returns {TemplateFunction}
     */
    static get toolbarPopoverTemplate() {
      throw new Error("Popover template must be defined");
    }
    /**
     * Returns the events that the item is subscribed to.
     * @protected
     * @returns {Map}
     */
    get subscribedEvents() {
      return new Map();
    }
    get stableDomRef() {
      return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
    }
  }
  __decorate([(0, _property.default)({
    type: _ToolbarItemOverflowBehavior.default,
    defaultValue: _ToolbarItemOverflowBehavior.default.Default
  })], ToolbarItem.prototype, "overflowPriority", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ToolbarItem.prototype, "preventOverflowClosing", void 0);
  var _default = ToolbarItem;
  _exports.default = _default;
});