sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element"], function (_exports, _UI5Element) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-menu-item",
    properties:
    /** @lends sap.ui.webcomponents.main.MenuItem.prototype */
    {
      /**
       * Defines the text of the tree item.
       *
       * @type {String}
       * @defaultValue ""
       * @public
       */
      text: {
        type: String
      },

      /**
       * Defines the icon to be displayed as graphical element within the component.
       * The SAP-icons font provides numerous options.
       * <br><br>
       <b>* Example:</b>
       * See all the available icons in the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      icon: {
        type: String
      },

      /**
       * Defines whether a visual separator should be rendered before the item.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      startsSection: {
        type: Boolean
      },

      /**
       * Defines whether <code>ui5-menu-item</code> is in disabled state.
       * <br><br>
       * <b>Note:</b> A disabled <code>ui5-menu-item</code> is noninteractive.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disabled: {
        type: Boolean
      },

      /**
       * Indicates if the any of the element siblings have children items.
       * @type {boolean}
       * @private
       */
      _siblingsWithChildren: {
        type: Boolean,
        noAttribute: true
      },

      /**
       * Indicates if the any of the element siblings have icon.
       * @type {boolean}
       * @private
       */
      _siblingsWithIcon: {
        type: Boolean,
        noAttribute: true
      },

      /**
       * Stores Menu object with submenu items
       * @type {object}
       * @private
       */
      _subMenu: {
        type: Object
      },

      /**
       * Defines whether the submenu closing must be prevented
       * @type {boolean}
       * @private
       */
      _preventSubMenuClose: {
        type: Boolean,
        noAttribute: true
      }
    },
    managedSlots: true,
    slots:
    /** @lends sap.ui.webcomponents.main.MenuItem.prototype */
    {
      /**
       * Defines the items of this component.
       *
       * @type {sap.ui.webcomponents.main.IMenuItem[]}
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
   *
   * <code>ui5-menu-item</code> is the item to use inside a <code>ui5-menu</code>.
   * An arbitrary hierarchy structure can be represented by recursively nesting menu items.
   *
   * <h3>Usage</h3>
   *
   * <code>ui5-menu-item</code> is an abstract element, representing a node in a <code>ui5-menu</code>. The menu itself is rendered as a list,
   * and each <code>ui5-menu-item</code> is represented by a list item (<code>ui5-li</code>) in that list. Therefore, you should only use
   * <code>ui5-menu-item</code> directly in your apps. The <code>ui5-li</code> list item is internal for the list, and not intended for public use.
   *
   * For the <code>ui5-menu-item</code>
   * <h3>ES6 Module Import</h3>
   *
   * <code>import @ui5/webcomponents/dist/MenuItem.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.MenuItem
   * @extends UI5Element
   * @tagname ui5-menu-item
   * @implements sap.ui.webcomponents.main.IMenuItem
   * @since 1.3.0
   * @public
   */

  class MenuItem extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    get hasChildren() {
      return !!this.items.length;
    }

    get hasDummyIcon() {
      return this._siblingsWithIcon && !this.icon;
    }

    get subMenuOpened() {
      return !!Object.keys(this._subMenu).length;
    }

  }

  MenuItem.define();
  var _default = MenuItem;
  _exports.default = _default;
});