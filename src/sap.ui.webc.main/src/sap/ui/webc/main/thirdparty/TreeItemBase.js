sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/CustomElementsScope", "./ListItem", "./Icon", "sap/ui/webc/common/thirdparty/icons/navigation-right-arrow", "sap/ui/webc/common/thirdparty/icons/navigation-down-arrow", "./generated/i18n/i18n-defaults", "./generated/templates/TreeItemBaseTemplate.lit", "./generated/themes/TreeItem.css", "./types/HasPopup"], function (_exports, _property, _customElement, _slot, _event, _Integer, _Keys, _i18nBundle, _ValueState, _CustomElementsScope, _ListItem, _Icon, _navigationRightArrow, _navigationDownArrow, _i18nDefaults, _TreeItemBaseTemplate, _TreeItem, _HasPopup) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _property = _interopRequireDefault(_property);
  _customElement = _interopRequireDefault(_customElement);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _Integer = _interopRequireDefault(_Integer);
  _ValueState = _interopRequireDefault(_ValueState);
  _ListItem = _interopRequireDefault(_ListItem);
  _Icon = _interopRequireDefault(_Icon);
  _TreeItemBaseTemplate = _interopRequireDefault(_TreeItemBaseTemplate);
  _TreeItem = _interopRequireDefault(_TreeItem);
  _HasPopup = _interopRequireDefault(_HasPopup);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var TreeItemBase_1;

  // Template

  // Styles

  /**
   * A class to serve as a foundation
   * for the <code>TreeItem</code> and <code>TreeItemCustom</code> classes.
   *
   * @abstract
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.TreeItemBase
   * @extends sap.ui.webc.main.ListItem
   * @public
   */
  let TreeItemBase = TreeItemBase_1 = class TreeItemBase extends _ListItem.default {
    onBeforeRendering() {
      this.actionable = false;
      this.showToggleButton = this.requiresToggleButton;
    }
    get classes() {
      const allClasses = super.classes;
      allClasses.main["ui5-li-root-tree"] = true;
      return allClasses;
    }
    get styles() {
      return {
        preContent: {
          "padding-inline-start": `calc(var(${(0, _CustomElementsScope.getScopedVarName)("--_ui5-tree-indent-step")}) * ${this.effectiveLevel})`
        }
      };
    }
    get requiresToggleButton() {
      return !this._fixed ? this.hasChildren || this.items.length > 0 : false;
    }
    get effectiveLevel() {
      return this.level - 1;
    }
    get hasParent() {
      return this.level > 1;
    }
    get _toggleIconName() {
      return this.expanded ? "navigation-down-arrow" : "navigation-right-arrow";
    }
    get _showToggleButtonBeginning() {
      return this.showToggleButton && !this._minimal && !this._toggleButtonEnd;
    }
    get _showToggleButtonEnd() {
      return this.showToggleButton && !this._minimal && this._toggleButtonEnd;
    }
    get _ariaLabel() {
      return this.accessibleRoleDescription ? undefined : TreeItemBase_1.i18nBundle.getText(_i18nDefaults.TREE_ITEM_ARIA_LABEL);
    }
    get _accInfo() {
      const accInfoSettings = {
        role: this._minimal ? "menuitemradio" : "treeitem",
        ariaExpanded: this.showToggleButton && !this._minimal ? this.expanded : undefined,
        ariaLevel: this._minimal ? undefined : this.level,
        posinset: this._posinset,
        setsize: this._setsize,
        ariaSelectedText: this.ariaSelectedText,
        listItemAriaLabel: !this.accessibleName ? this._ariaLabel : undefined,
        ariaOwns: this.expanded ? `${this._id}-subtree` : undefined,
        ariaHaspopup: this.ariaHaspopup || undefined,
        ariaChecked: false,
        ariaSelected: false
      };
      if (this._minimal) {
        accInfoSettings.ariaChecked = this.selected;
      } else {
        accInfoSettings.ariaSelected = this.selected;
      }
      return {
        ...super._accInfo,
        ...accInfoSettings
      };
    }
    /**
     * Used to duck-type TreeItem elements without using instanceof
     * @returns {boolean}
     * @protected
     */
    get isTreeItem() {
      return true;
    }
    /**
     * Call this method to manually switch the <code>expanded</code> state of a tree item.
     * @public
     * @method
     * @name sap.ui.webc.main.TreeItemBase#toggle
     */
    toggle() {
      this.expanded = !this.expanded;
    }
    _toggleClick(e) {
      e.stopPropagation();
      this.fireEvent("toggle", {
        item: this
      });
    }
    _onkeydown(e) {
      super._onkeydown(e);
      if (!this._fixed && this.showToggleButton && (0, _Keys.isRight)(e)) {
        if (!this.expanded) {
          this.fireEvent("toggle", {
            item: this
          });
        } else {
          this.fireEvent("step-in", {
            item: this
          });
        }
      }
      if (!this._fixed && (0, _Keys.isLeft)(e)) {
        if (this.expanded) {
          this.fireEvent("toggle", {
            item: this
          });
        } else if (this.hasParent) {
          this.fireEvent("step-out", {
            item: this
          });
        }
      }
    }
    get iconAccessibleName() {
      return this.expanded ? TreeItemBase_1.i18nBundle.getText(_i18nDefaults.TREE_ITEM_COLLAPSE_NODE) : TreeItemBase_1.i18nBundle.getText(_i18nDefaults.TREE_ITEM_EXPAND_NODE);
    }
    static async onDefine() {
      [TreeItemBase_1.i18nBundle] = await Promise.all([(0, _i18nBundle.getI18nBundle)("@ui5/webcomponents"), super.onDefine()]);
    }
  };
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 1
  })], TreeItemBase.prototype, "level", void 0);
  __decorate([(0, _property.default)()], TreeItemBase.prototype, "icon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TreeItemBase.prototype, "showToggleButton", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TreeItemBase.prototype, "expanded", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TreeItemBase.prototype, "indeterminate", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TreeItemBase.prototype, "hasChildren", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], TreeItemBase.prototype, "additionalTextState", void 0);
  __decorate([(0, _property.default)()], TreeItemBase.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TreeItemBase.prototype, "_toggleButtonEnd", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TreeItemBase.prototype, "_minimal", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 1,
    noAttribute: true
  })], TreeItemBase.prototype, "_setsize", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 1,
    noAttribute: true
  })], TreeItemBase.prototype, "_posinset", void 0);
  __decorate([(0, _property.default)({
    type: String,
    defaultValue: undefined,
    noAttribute: true
  })], TreeItemBase.prototype, "accessibleRoleDescription", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TreeItemBase.prototype, "_fixed", void 0);
  __decorate([(0, _property.default)({
    type: _HasPopup.default,
    noAttribute: true
  })], TreeItemBase.prototype, "ariaHaspopup", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], TreeItemBase.prototype, "items", void 0);
  TreeItemBase = TreeItemBase_1 = __decorate([(0, _customElement.default)({
    languageAware: true,
    template: _TreeItemBaseTemplate.default,
    styles: [_ListItem.default.styles, _TreeItem.default],
    dependencies: [..._ListItem.default.dependencies, _Icon.default]
  })
  /**
   * Fired when the user interacts with the expand/collapse button of the tree list item.
   * @event
   * @param {HTMLElement} item the toggled item.
   * @protected
   */, (0, _event.default)("toggle", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired when the user drills down into the tree hierarchy by pressing the right arrow on the tree node.
   *
   * @event sap.ui.webc.main.TreeItemBase#step-in
   * @param {HTMLElement} item the item on which right arrow was pressed.
   * @protected
   */, (0, _event.default)("step-in", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired when the user goes up the tree hierarchy by pressing the left arrow on the tree node.
   *
   * @event sap.ui.webc.main.TreeItemBase#step-out
   * @param {HTMLElement} item the item on which left arrow was pressed.
   * @protected
   */, (0, _event.default)("step-out", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })], TreeItemBase);
  var _default = TreeItemBase;
  _exports.default = _default;
});