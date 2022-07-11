sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/types/ValueState"], function (_exports, _UI5Element, _ValueState) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _ValueState = _interopRequireDefault(_ValueState);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-tree-item",
    properties:
    /** @lends sap.ui.webcomponents.main.TreeItem.prototype */
    {
      /**
       * Defines the text of the tree item.
       *
       * @public
       * @type {string}
       * @defaultValue ""
       */
      text: {
        type: String
      },

      /**
       * Defines whether the tree node is expanded or collapsed. Only has visual effect for tree nodes with children.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      expanded: {
        type: Boolean
      },

      /**
      * Defines whether the selection of a tree node is displayed as partially selected.
      * <br><br>
      * <b>Note:</b> The indeterminate state can be set only programatically and can’t be achieved by user
      * interaction, meaning that the resulting visual state depends on the values of the <code>indeterminate</code>
      * and <code>selected</code> properties:
      * <ul>
      * <li> If a tree node has both <code>selected</code> and <code>indeterminate</code> set to <code>true</code>, it is displayed as partially selected.
      * <li> If a tree node has <code>selected</code> set to <code>true</code> and <code>indeterminate</code> set to <code>false</code>, it is displayed as selected.
      * <li> If a tree node has <code>selected</code> set to <code>false</code>, it is displayed as not selected regardless of the value of the <code>indeterminate</code> property.
      * </ul>
      * <br>
      * <b>Note:</b> This property takes effect only when the <code>ui5-tree</code> is in <code>MultiSelect</code> mode.
      * @type {boolean}
      * @defaultvalue false
      * @public
      * @since 1.1.0
      */
      indeterminate: {
        type: Boolean
      },

      /**
       * Defines whether the tree node has children, even if currently no other tree nodes are slotted inside.
       * <br>
       * <i>Note:</i> This property is useful for showing big tree structures where not all nodes are initially loaded due to performance reasons.
       * Set this to <code>true</code> for nodes you intend to load lazily, when the user clicks the expand button.
       * It is not necessary to set this property otherwise. If a tree item has children, the expand button will be displayed anyway.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      hasChildren: {
        type: Boolean
      },

      /**
       * Defines whether the tree node is selected by the user. Only has effect if the <code>ui5-tree</code> is in one of the
       * following modes: in <code>SingleSelect</code>, <code>SingleSelectBegin</code>, <code>SingleSelectEnd</code> and <code>MultiSelect</code>.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      selected: {
        type: Boolean
      },

      /**
       * If set, an icon will be displayed before the text, representing the tree item.
       *
       * @public
       * @type {string}
       * @defaultValue ""
       */
      icon: {
        type: String
      },

      /**
       * Defines the <code>additionalText</code>, displayed in the end of the tree item.
       * @type {string}
       * @public
       * @since 1.0.0-rc.15
       */
      additionalText: {
        type: String
      },

      /**
       * Defines the state of the <code>additionalText</code>.
       * <br>
       * Available options are: <code>"None"</code> (by default), <code>"Success"</code>, <code>"Warning"</code>, <code>"Information"</code> and <code>"Erorr"</code>.
       * @type {ValueState}
       * @defaultvalue "None"
       * @public
       * @since 1.0.0-rc.15
       */
      additionalTextState: {
        type: _ValueState.default,
        defaultValue: _ValueState.default.None
      },

      /**
       * Defines the tooltip of the component.
       * @type {string}
       * @defaultvalue ""
       * @private
       * @since 1.0.0-rc.15
       */
      title: {
        type: String
      }
    },
    managedSlots: true,
    slots:
    /** @lends sap.ui.webcomponents.main.TreeItem.prototype */
    {
      /**
       * Defines the items of this component.
       *
       * @type {sap.ui.webcomponents.main.ITreeItem[]}
       * @slot items
       * @public
       */
      "default": {
        propertyName: "items",
        type: HTMLElement,
        invalidateOnChildChange: true
      }
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * This is the item to use inside a <code>ui5-tree</code>.
   * You can represent an arbitrary tree structure by recursively nesting tree items.
   *
   * <h3>Usage</h3>
   * <code>ui5-tree-item</code> is an abstract element, representing a node in a <code>ui5-tree</code>. The tree itself is rendered as a list,
   * and each <code>ui5-tree-item</code> is represented by a list item(<code>ui5-li-tree</code>) in that list. Therefore, you should only use
   * <code>ui5-tree-item</code> directly in your apps. The <code>ui5-li-tree</code> list item is internal for the list, and not intended for public use.
   *
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents/dist/TreeItem.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.TreeItem
   * @extends UI5Element
   * @tagname ui5-tree-item
   * @public
   * @implements sap.ui.webcomponents.main.ITreeItem
   * @since 1.0.0-rc.8
   */

  class TreeItem extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    get requiresToggleButton() {
      return this.hasChildren || this.items.length > 0;
    }
    /**
     * Call this method to manually switch the <code>expanded</code> state of a tree item.
     * @public
     */


    toggle() {
      this.expanded = !this.expanded;
    }

  }

  TreeItem.define();
  var _default = TreeItem;
  _exports.default = _default;
});