sap.ui.define(['exports', './chunk-7ceb84db'], function (exports, __chunk_1) { 'use strict';

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-tree-item",
	  properties:
	  /** @lends sap.ui.webcomponents.main.TreeItem.prototype */
	  {
	    /**
	     * Defines the text of the tree item.
	     *
	     * @public
	     * @type {String}
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
	     * @type {String}
	     * @defaultValue ""
	     */
	    icon: {
	      type: String
	    }
	  },
	  slots:
	  /** @lends sap.ui.webcomponents.main.TreeItem.prototype */
	  {
	    /**
	     * Defines the items of this <code>ui5-tree-item</code>.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    "default": {
	      type: HTMLElement
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
	 * <code>import @ui5/webcomponents/dist/TreeItem.js";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.TreeItem
	 * @extends UI5Element
	 * @tagname ui5-tree-item
	 * @public
	 * @since 1.0.0-rc.8
	 */

	var TreeItem =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(TreeItem, _UI5Element);

	  function TreeItem() {
	    __chunk_1._classCallCheck(this, TreeItem);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(TreeItem).apply(this, arguments));
	  }

	  __chunk_1._createClass(TreeItem, [{
	    key: "toggle",

	    /**
	     * Call this method to manually switch the <code>expanded</code> state of a tree item.
	     *
	     * @public
	     */
	    value: function toggle() {
	      this.expanded = !this.expanded;
	    }
	  }, {
	    key: "items",
	    get: function get() {
	      return __chunk_1._toConsumableArray(this.children);
	    }
	  }, {
	    key: "requiresToggleButton",
	    get: function get() {
	      return this.hasChildren || this.items.length > 0;
	    }
	  }], [{
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }]);

	  return TreeItem;
	}(__chunk_1.UI5Element);

	TreeItem.define();

	exports.TreeItem = TreeItem;

});
//# sourceMappingURL=chunk-ef6db51f.js.map
