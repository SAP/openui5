sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/ValueState", "./ListItem", "./Icon", "sap/ui/webc/common/thirdparty/icons/navigation-right-arrow", "sap/ui/webc/common/thirdparty/icons/navigation-down-arrow", "./generated/i18n/i18n-defaults", "./generated/templates/TreeListItemTemplate.lit", "./generated/themes/TreeListItem.css"], function (_exports, _Integer, _Keys, _i18nBundle, _ValueState, _ListItem, _Icon, _navigationRightArrow, _navigationDownArrow, _i18nDefaults, _TreeListItemTemplate, _TreeListItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _Integer = _interopRequireDefault(_Integer);
  _ValueState = _interopRequireDefault(_ValueState);
  _ListItem = _interopRequireDefault(_ListItem);
  _Icon = _interopRequireDefault(_Icon);
  _TreeListItemTemplate = _interopRequireDefault(_TreeListItemTemplate);
  _TreeListItem = _interopRequireDefault(_TreeListItem);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-li-tree",
    languageAware: true,
    properties:
    /** @lends sap.ui.webcomponents.main.TreeListItem.prototype */
    {
      /**
       * Defines the indentation of the tree list item. Use level 1 for tree list items, representing top-level tree nodes.
       *
       * @type {Integer}
       * @public
       * @defaultValue 1
       */
      level: {
        type: _Integer.default,
        defaultValue: 1
      },

      /**
       * If set, an icon will be displayed before the text of the tree list item.
       *
       * @public
       * @type {string}
       * @defaultValue ""
       */
      icon: {
        type: String
      },

      /**
       * Defines whether the tree list item should display an expand/collapse button.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      showToggleButton: {
        type: Boolean
      },

      /**
       * Defines whether the tree list item will show a collapse or expand icon inside its toggle button.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      expanded: {
        type: Boolean
      },

      /**
       * @private
       * @since 1.1.0
       */
      indeterminate: {
        type: Boolean
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
       * Defines whether the toggle button is shown at the end, rather than at the beginning of the item
       *
       * @protected
       * @since 1.0.0-rc.8
       */
      _toggleButtonEnd: {
        type: Boolean
      },

      /**
       * Defines whether the item shows minimal details - only icon (no text or toggle button)
       *
       * @protected
       * @since 1.0.0-rc.8
       */
      _minimal: {
        type: Boolean
      },

      /**
       * @private
       * @since 1.0.0-rc.11
       */
      _setsize: {
        type: _Integer.default,
        defaultValue: 1,
        noAttribute: true
      },

      /**
       * @private
       * @since 1.0.0-rc.11
       */
      _posinset: {
        type: _Integer.default,
        defaultValue: 1,
        noAttribute: true
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.main.TreeListItem.prototype */
    {
      /**
       * Defines the text of the component.
       * <br><br>
       * <b>Note:</b> Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
       *
       * @type {Node[]}
       * @slot
       * @public
       */
      "default": {
        type: Node
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.TreeListItem.prototype */
    {
      /**
       * Fired when the user interacts with the expand/collapse button of the tree list item.
       * @event
       * @param {HTMLElement} item the toggled item.
       * @public
       */
      toggle: {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      },

      /**
       * Fired when the user drills down into the tree hierarchy by pressing the right arrow on the tree node.
       *
       * @event sap.ui.webcomponents.main.TreeListItem#step-in
       * @param {HTMLElement} item the item on which right arrow was pressed.
       * @public
       */
      "step-in": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      },

      /**
       * Fired when the user goes up the tree hierarchy by pressing the left arrow on the tree node.
       *
       * @event sap.ui.webcomponents.main.TreeListItem#step-out
       * @param {HTMLElement} item the item on which left arrow was pressed.
       * @public
       */
      "step-out": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      }
    }
  };
  /**
   * @class
   * The <code>ui5-li-tree</code> represents a node in a tree structure, shown as a <code>ui5-list</code>.
   * <br>
   * <i>Note:</i> Do not use <code>ui5-li-tree</code> directly in your apps. Use <code>ui5-tree-item</code> instead, as it can be nested inside a <code>ui5-tree</code>.
   * On the other hand, <code>ui5-li-tree</code> can only be slotted inside a <code>ui5-list</code>, being a list item. It may be useful if you want to build a custom tree component, for example.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-li-tree</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>title - Used to style the title of the tree list item</li>
   * <li>additionalText - Used to style the additionalText of the tree list item</li>
   * <li>icon - Used to style the icon of the tree list item</li>
   * </ul>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.TreeListItem
   * @extends ListItem
   * @tagname ui5-li-tree
   * @public
   * @since 1.0.0-rc.8
   */

  class TreeListItem extends _ListItem.default {
    static get template() {
      return _TreeListItemTemplate.default;
    }

    static get styles() {
      return [_ListItem.default.styles, _TreeListItem.default];
    }

    static get metadata() {
      return metadata;
    }

    static get dependencies() {
      return [..._ListItem.default.dependencies, _Icon.default];
    }

    onBeforeRendering() {
      this.actionable = false;
    }

    get classes() {
      const allClasses = super.classes;
      allClasses.main["ui5-li-root-tree"] = true;
      return allClasses;
    }

    get styles() {
      return {
        preContent: {
          "padding-left": `calc(var(--_ui5-tree-indent-step) * ${this.effectiveLevel})`
        }
      };
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

    get _showTitle() {
      return this.textContent.length && !this._minimal;
    }

    get _accInfo() {
      return {
        role: "treeitem",
        ariaExpanded: this.showToggleButton ? this.expanded : undefined,
        ariaLevel: this.level,
        posinset: this._posinset,
        setsize: this._setsize,
        ariaSelectedText: this.ariaSelectedText,
        listItemAriaLabel: TreeListItem.i18nBundle.getText(_i18nDefaults.TREE_ITEM_ARIA_LABEL)
      };
    }

    _toggleClick(event) {
      event.stopPropagation();
      this.fireEvent("toggle", {
        item: this
      });
    }

    _onkeydown(event) {
      super._onkeydown(event);

      if (this.showToggleButton && (0, _Keys.isRight)(event)) {
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

      if ((0, _Keys.isLeft)(event)) {
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
      return this.expanded ? TreeListItem.i18nBundle.getText(_i18nDefaults.TREE_ITEM_COLLAPSE_NODE) : TreeListItem.i18nBundle.getText(_i18nDefaults.TREE_ITEM_EXPAND_NODE);
    }

    static async onDefine() {
      [TreeListItem.i18nBundle] = await Promise.all([(0, _i18nBundle.getI18nBundle)("@ui5/webcomponents"), super.onDefine()]);
    }

  }

  TreeListItem.define();
  var _default = TreeListItem;
  _exports.default = _default;
});