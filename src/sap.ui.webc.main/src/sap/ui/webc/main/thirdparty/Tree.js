sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "./TreeItem", "./TreeItemCustom", "./TreeList", "./types/ListMode", "./generated/templates/TreeTemplate.lit", "./generated/themes/Tree.css"], function (_exports, _UI5Element, _customElement, _property, _slot, _event, _LitRenderer, _AriaLabelHelper, _TreeItem, _TreeItemCustom, _TreeList, _ListMode, _TreeTemplate, _Tree) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _TreeItem = _interopRequireDefault(_TreeItem);
  _TreeItemCustom = _interopRequireDefault(_TreeItemCustom);
  _TreeList = _interopRequireDefault(_TreeList);
  _ListMode = _interopRequireDefault(_ListMode);
  _TreeTemplate = _interopRequireDefault(_TreeTemplate);
  _Tree = _interopRequireDefault(_Tree);
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
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-tree</code> component provides a tree structure for displaying data in a hierarchy.
   *
   * <h3>Usage</h3>
   *
   * <h4>When to use:</h4>
   * <ul>
   * <li>To display hierarchically structured items.</li>
   * <li>To select one or more items out of a set of hierarchically structured items.</li>
   * </ul>
   *
   * <h4>When not to use:</h4>
   * <ul>
   * <li>To display items not hierarchically strcutured. In this case, use the List component.</li>
   * <li>To select one item from a very small number of non-hierarchical items. Select or ComboBox might be more appropriate.</li>
   * <li>The hierarchy turns out to have only two levels. In this case, use List with group items.</li>
   * </ul>
   *
   * <h3>Keyboard Handling</h3>
   *
   * The <code>ui5-tree</code> provides advanced keyboard handling.
   * The user can use the following keyboard shortcuts in order to navigate trough the tree:
   * <ul>
   * <li>[UP/DOWN] - Navigates up and down the tree items that are currently visible.</li>
   * <li>[RIGHT] - Drills down the tree by expanding the tree nodes.</li>
   * <li>[LEFT] - Goes up the tree and collapses the tree nodes.</li>
   * </ul>
   * <br>
   *
   * The user can use the following keyboard shortcuts to perform selection,
   * when the <code>mode</code> property is in use:
   * <ul>
   * <li>[SPACE] - Selects the currently focused item upon keyup.</li>
   * <li>[ENTER]  - Selects the currently focused item upon keydown.</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents/dist/Tree.js";</code>
   * <br>
   * <code>import "@ui5/webcomponents/dist/TreeItem.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Tree
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-tree
   * @appenddocs sap.ui.webc.main.TreeItem sap.ui.webc.main.TreeItemCustom
   * @public
   * @since 1.0.0-rc.8
   */
  let Tree = class Tree extends _UI5Element.default {
    onBeforeRendering() {
      this._prepareTreeItems();
    }
    onAfterRendering() {
      // Note: this is a workaround for the problem that the list cannot invalidate itself when its only physical child is a slot (and the list items are inside the slot)
      // This code should be removed once a framework-level fix is implemented
      this.shadowRoot.querySelector("[ui5-tree-list]").onBeforeRendering();
    }
    get list() {
      return this.getDomRef();
    }
    get _role() {
      return this._minimal ? "menubar" : "tree";
    }
    get _label() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }
    get _hasHeader() {
      return !!this.header.length;
    }
    _onListItemStepIn(e) {
      const treeItem = e.detail.item;
      if (treeItem.items.length > 0) {
        const firstChild = treeItem.items[0];
        const firstChildListItem = this._getListItemForTreeItem(firstChild);
        firstChildListItem && this.list.focusItem(firstChildListItem);
      }
    }
    _onListItemStepOut(e) {
      const treeItem = e.detail.item;
      if (treeItem.parentElement !== this) {
        const parent = treeItem.parentElement;
        const parentListItem = this._getListItemForTreeItem(parent);
        parentListItem && this.list.focusItem(parentListItem);
      }
    }
    _onListItemToggle(e) {
      const treeItem = e.detail.item;
      const defaultPrevented = !this.fireEvent("item-toggle", {
        item: treeItem
      }, true);
      if (!defaultPrevented) {
        treeItem.toggle();
      }
    }
    _onListItemClick(e) {
      const treeItem = e.detail.item;
      if (!this.fireEvent("item-click", {
        item: treeItem
      }, true)) {
        e.preventDefault();
      }
    }
    _onListItemDelete(e) {
      const treeItem = e.detail.item;
      this.fireEvent("item-delete", {
        item: treeItem
      });
    }
    _onListItemMouseOver(e) {
      const target = e.target;
      if (this._isInstanceOfTreeItemBase(target)) {
        this.fireEvent("item-mouseover", {
          item: target
        });
      }
    }
    _onListItemMouseOut(e) {
      const target = e.target;
      if (this._isInstanceOfTreeItemBase(target)) {
        this.fireEvent("item-mouseout", {
          item: target
        });
      }
    }
    _onListSelectionChange(e) {
      const previouslySelectedItems = e.detail.previouslySelectedItems;
      const selectedItems = e.detail.selectedItems;
      const targetItem = e.detail.targetItem;
      previouslySelectedItems.forEach(item => {
        item.selected = false;
      });
      selectedItems.forEach(item => {
        item.selected = true;
      });
      this.fireEvent("selection-change", {
        previouslySelectedItems,
        selectedItems,
        targetItem
      });
    }
    _prepareTreeItems() {
      // set level to tree items
      this.walk((item, level, index) => {
        const parent = item.parentNode;
        const ariaSetSize = parent && parent.children.length || this.items.length;
        item.setAttribute("level", level.toString());
        item._toggleButtonEnd = this._toggleButtonEnd;
        item._minimal = this._minimal;
        item._setsize = ariaSetSize;
        item._posinset = index + 1;
      });
    }
    /**
     * Returns the corresponding list item for a given tree item
     *
     * @param item The tree item
     * @protected
     */
    _getListItemForTreeItem(item) {
      return this.getItems().find(listItem => listItem === item);
    }
    /**
     * Returns the a flat array of all tree items
     * @protected
     * @returns {Array}
     */
    getItems() {
      return this.list.getItems();
    }
    /**
     * Focus a tree item by its index in the flat array of all tree items
     * @protected
     * @param index
     */
    focusItemByIndex(index) {
      const item = this.getItems()[index];
      item && this.list.focusItem(item);
    }
    /**
     * Perform Depth-First-Search walk on the tree and run a callback on each node
     *
     * @public
     * @param {function} callback function to execute on each node of the tree with 3 arguments: the node, the level and the index
     */
    walk(callback) {
      walkTree(this, 1, callback);
    }
    _isInstanceOfTreeItemBase(object) {
      return "isTreeItem" in object;
    }
  };
  __decorate([(0, _property.default)({
    type: _ListMode.default,
    defaultValue: _ListMode.default.None
  })], Tree.prototype, "mode", void 0);
  __decorate([(0, _property.default)()], Tree.prototype, "noDataText", void 0);
  __decorate([(0, _property.default)()], Tree.prototype, "headerText", void 0);
  __decorate([(0, _property.default)()], Tree.prototype, "footerText", void 0);
  __decorate([(0, _property.default)()], Tree.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)()], Tree.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    defaultValue: undefined,
    noAttribute: true
  })], Tree.prototype, "accessibleRoleDescription", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Tree.prototype, "_toggleButtonEnd", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Tree.prototype, "_minimal", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    invalidateOnChildChange: true,
    "default": true
  })], Tree.prototype, "items", void 0);
  __decorate([(0, _slot.default)()], Tree.prototype, "header", void 0);
  Tree = __decorate([(0, _customElement.default)({
    tag: "ui5-tree",
    renderer: _LitRenderer.default,
    styles: _Tree.default,
    template: _TreeTemplate.default,
    dependencies: [_TreeList.default, _TreeItem.default, _TreeItemCustom.default]
  })
  /**
   * Fired when a tree item is expanded or collapsed.
   * <i>Note:</i> You can call <code>preventDefault()</code> on the event object to suppress the event, if needed.
   * This may be handy for example if you want to dynamically load tree items upon the user expanding a node.
   * Even if you prevented the event's default behavior, you can always manually call <code>toggle()</code> on a tree item.
   *
   * @event sap.ui.webc.main.Tree#item-toggle
   * @param {HTMLElement} item the toggled item.
   * @allowPreventDefault
   * @public
   */, (0, _event.default)("item-toggle", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired when the mouse cursor enters the tree item borders.
   * @event sap.ui.webc.main.Tree#item-mouseover
   * @param {HTMLElement} item the hovered item.
   * @since 1.0.0-rc.16
   * @public
   */, (0, _event.default)("item-mouseover", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired when the mouse cursor leaves the tree item borders.
   * @event sap.ui.webc.main.Tree#item-mouseout
   * @param {HTMLElement} item the hovered item.
   * @since 1.0.0-rc.16
   * @public
   */, (0, _event.default)("item-mouseout", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired when a tree item is activated.
   *
   * @event sap.ui.webc.main.Tree#item-click
   * @allowPreventDefault
   * @param {HTMLElement} item The clicked item.
   * @public
   */, (0, _event.default)("item-click", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired when the Delete button of any tree item is pressed.
   * <br><br>
   * <b>Note:</b> A Delete button is displayed on each item,
   * when the component <code>mode</code> property is set to <code>Delete</code>.
   *
   * @event sap.ui.webc.main.Tree#item-delete
   * @param {HTMLElement} item the deleted item.
   * @public
   */, (0, _event.default)("item-delete", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired when selection is changed by user interaction
   * in <code>SingleSelect</code>, <code>SingleSelectBegin</code>, <code>SingleSelectEnd</code> and <code>MultiSelect</code> modes.
   *
   * @event sap.ui.webc.main.Tree#selection-change
   * @param {Array} selectedItems An array of the selected items.
   * @param {Array} previouslySelectedItems An array of the previously selected items.
   * @param {HTMLElement} targetItem The item triggering the event.
   * @public
   */, (0, _event.default)("selection-change", {
    detail: {
      selectedItems: {
        type: Array
      },
      previouslySelectedItems: {
        type: Array
      },
      targetItem: {
        type: HTMLElement
      }
    }
  })], Tree);
  const walkTree = (el, level, callback) => {
    el.items.forEach((item, index) => {
      callback(item, level, index);
      if (item.items.length > 0) {
        walkTree(item, level + 1, callback);
      }
    });
  };
  Tree.define();
  var _default = Tree;
  _exports.default = _default;
});