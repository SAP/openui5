sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "./TreeItem", "./List", "./TreeListItem", "./types/ListMode", "./generated/templates/TreeTemplate.lit", "./generated/themes/Tree.css"], function (_exports, _UI5Element, _LitRenderer, _TreeItem, _List, _TreeListItem, _ListMode, _TreeTemplate, _Tree) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _TreeItem = _interopRequireDefault(_TreeItem);
  _List = _interopRequireDefault(_List);
  _TreeListItem = _interopRequireDefault(_TreeListItem);
  _ListMode = _interopRequireDefault(_ListMode);
  _TreeTemplate = _interopRequireDefault(_TreeTemplate);
  _Tree = _interopRequireDefault(_Tree);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-tree",
    properties:
    /** @lends sap.ui.webcomponents.main.Tree.prototype */
    {
      /**
       * Defines the mode of the component. Since the tree uses a <code>ui5-list</code> to display its structure,
       * the tree modes are exactly the same as the list modes, and are all applicable.
       *
       * <br><br>
       * <b>Note:</b>
       *
       * <ul>
       * <li><code>None</code></li>
       * <li><code>SingleSelect</code></li>
       * <li><code>SingleSelectBegin</code></li>
       * <li><code>SingleSelectEnd</code></li>
       * <li><code>MultiSelect</code></li>
       * <li><code>Delete</code></li>
       * </ul>
       *
       * @public
       * @type {ListMode}
       * @defaultValue "None"
       */
      mode: {
        type: _ListMode.default,
        defaultValue: _ListMode.default.None
      },

      /**
       * Defines the text that is displayed when the component contains no items.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      noDataText: {
        type: String
      },

      /**
       * Defines the component header text.
       * <br><br>
       * <b>Note:</b> If the <code>header</code> slot is set, this property is ignored.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      headerText: {
        type: String
      },

      /**
       * Defines the component footer text.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      footerText: {
        type: String
      },

      /**
       * An array, containing a flat structure of list items to render
       *
       * @private
       */
      _listItems: {
        type: Object,
        multiple: true
      },

      /**
       * Shows the toggle button at the end, rather than at the beginning of the items
       *
       * @protected
       * @since 1.0.0-rc.8
       */
      _toggleButtonEnd: {
        type: Boolean
      },

      /**
       * Represents the tree in a very minimal state - icons only with no text and no toggle buttons
       *
       * @protected
       * @since 1.0.0-rc.8
       */
      _minimal: {
        type: Boolean
      }
    },
    managedSlots: true,
    slots:
    /** @lends sap.ui.webcomponents.main.Tree.prototype */
    {
      /**
       * Defines the items of the component. Tree items may have other tree items as children.
       * <br><br>
       * <b>Note:</b> Use <code>ui5-tree-item</code> for the intended design.
       *
       * @type {sap.ui.webcomponents.main.ITreeItem[]}
       * @slot items
       * @public
       */
      "default": {
        type: HTMLElement,
        propertyName: "items",
        invalidateOnChildChange: true
      },

      /**
       * Defines the component header.
       * <br><br>
       * <b>Note:</b> When the <code>header</code> slot is set, the
       * <code>headerText</code> property is ignored.
       *
       * @type {HTMLElement[]}
       * @slot
       * @public
       */
      header: {
        type: HTMLElement
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.Tree.prototype */
    {
      /**
       * Fired when a tree item is expanded or collapsed.
       * <i>Note:</i> You can call <code>preventDefault()</code> on the event object to suppress the event, if needed.
       * This may be handy for example if you want to dynamically load tree items upon the user expanding a node.
       * Even if you prevented the event's default behavior, you can always manually call <code>toggle()</code> on a tree item.
       *
       * @event sap.ui.webcomponents.main.Tree#item-toggle
       * @param {HTMLElement} item the toggled item.
       * @allowPreventDefault
       * @public
       */
      "item-toggle": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      },

      /**
       * Fired when the mouse cursor enters the tree item borders.
       * @event sap.ui.webcomponents.main.Tree#item-mouseover
       * @param {HTMLElement} item the hovered item.
       * @since 1.0.0-rc.16
       * @public
       */
      "item-mouseover": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      },

      /**
       * Fired when the mouse cursor leaves the tree item borders.
       * @event sap.ui.webcomponents.main.Tree#item-mouseout
       * @param {HTMLElement} item the hovered item.
       * @since 1.0.0-rc.16
       * @public
       */
      "item-mouseout": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      },

      /**
       * Fired when a tree item is activated.
       *
       * @event sap.ui.webcomponents.main.Tree#item-click
       * @allowPreventDefault
       * @param {HTMLElement} item The clicked item.
       * @public
       */
      "item-click": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      },

      /**
       * Fired when the Delete button of any tree item is pressed.
       * <br><br>
       * <b>Note:</b> A Delete button is displayed on each item,
       * when the component <code>mode</code> property is set to <code>Delete</code>.
       *
       * @event sap.ui.webcomponents.main.Tree#item-delete
       * @param {HTMLElement} item the deleted item.
       * @public
       */
      "item-delete": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      },

      /**
       * Fired when selection is changed by user interaction
       * in <code>SingleSelect</code>, <code>SingleSelectBegin</code>, <code>SingleSelectEnd</code> and <code>MultiSelect</code> modes.
       *
       * @event sap.ui.webcomponents.main.Tree#selection-change
       * @param {Array} selectedItems An array of the selected items.
       * @param {Array} previouslySelectedItems An array of the previously selected items.
       * @public
       */
      "selection-change": {
        detail: {
          selectedItems: {
            type: Array
          },
          previouslySelectedItems: {
            type: Array
          }
        }
      }
    }
  };
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
   * @alias sap.ui.webcomponents.main.Tree
   * @extends UI5Element
   * @tagname ui5-tree
   * @appenddocs TreeItem
   * @public
   * @since 1.0.0-rc.8
   */

  class Tree extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get styles() {
      return _Tree.default;
    }

    static get template() {
      return _TreeTemplate.default;
    }

    static get dependencies() {
      return [_List.default, _TreeListItem.default, _TreeItem.default];
    }

    onBeforeRendering() {
      this._listItems = [];
      buildTree(this, 1, this._listItems);
    }

    get list() {
      return this.getDomRef();
    }

    get _role() {
      return "tree";
    }

    _onListItemStepIn(event) {
      const listItem = event.detail.item;
      const treeItem = listItem.treeItem;

      if (treeItem.items.length > 0) {
        const firstChild = treeItem.items[0];
        const firstChildListItem = this.list.getSlottedNodes("items").find(li => li.treeItem === firstChild);
        firstChildListItem && this.list.focusItem(firstChildListItem);
      }
    }

    _onListItemStepOut(event) {
      const listItem = event.detail.item;
      const treeItem = listItem.treeItem;

      if (treeItem.parentElement !== this) {
        const parent = treeItem.parentElement;
        const parentListItem = this.list.getSlottedNodes("items").find(li => li.treeItem === parent);
        parentListItem && this.list.focusItem(parentListItem);
      }
    }

    _onListItemToggle(event) {
      const listItem = event.detail.item;
      const treeItem = listItem.treeItem;
      const defaultPrevented = !this.fireEvent("item-toggle", {
        item: treeItem
      }, true);

      if (!defaultPrevented) {
        treeItem.toggle();
      }
    }

    _onListItemClick(event) {
      const listItem = event.detail.item;
      const treeItem = listItem.treeItem;

      if (!this.fireEvent("item-click", {
        item: treeItem
      }, true)) {
        event.preventDefault();
      }
    }

    _onListItemDelete(event) {
      const listItem = event.detail.item;
      const treeItem = listItem.treeItem;
      this.fireEvent("item-delete", {
        item: treeItem
      });
    }

    _onListItemMouseOver(event) {
      const treeItem = event.target.treeItem;
      this.fireEvent("item-mouseover", {
        item: treeItem
      });
    }

    _onListItemMouseOut(event) {
      const treeItem = event.target.treeItem;
      this.fireEvent("item-mouseout", {
        item: treeItem
      });
    }

    _onListSelectionChange(event) {
      const previouslySelectedItems = event.detail.previouslySelectedItems.map(item => item.treeItem);
      const selectedItems = event.detail.selectedItems.map(item => item.treeItem);
      previouslySelectedItems.forEach(item => {
        item.selected = false;
      });
      selectedItems.forEach(item => {
        item.selected = true;
      });
      this.fireEvent("selection-change", {
        previouslySelectedItems,
        selectedItems
      });
    }
    /**
     * Returns the corresponding list item for a given tree item
     *
     * @param item The tree item
     * @protected
     */


    _getListItemForTreeItem(item) {
      return this.list.items.find(listItem => listItem.treeItem === item);
    }
    /**
     * Perform Depth-First-Search walk on the tree and run a callback on each node
     *
     * @public
     * @param {function} callback function to execute on each node of the tree with 2 arguments: the node and the level
     */


    walk(callback) {
      walkTree(this, 1, callback);
    }

  }

  const walkTree = (el, level, callback) => {
    el.items.forEach(item => {
      callback(item, level);

      if (item.items.length > 0) {
        walkTree(item, level + 1, callback);
      }
    });
  };

  const buildTree = (el, level, result) => {
    el.items.forEach((item, index) => {
      const listItem = {
        treeItem: item,
        size: el.items.length,
        posinset: index + 1,
        level
      };
      result.push(listItem);

      if (item.expanded && item.items.length > 0) {
        buildTree(item, level + 1, result);
      }
    });
  };

  Tree.define();
  var _default = Tree;
  _exports.default = _default;
});