sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/types/ValueState", "./SuggestionListItem", "./types/ListItemType"], function (_exports, _UI5Element, _ValueState, _SuggestionListItem, _ListItemType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _ValueState = _interopRequireDefault(_ValueState);
  _SuggestionListItem = _interopRequireDefault(_SuggestionListItem);
  _ListItemType = _interopRequireDefault(_ListItemType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-suggestion-item",
    properties:
    /** @lends sap.ui.webcomponents.main.SuggestionItem.prototype */
    {
      /**
       * Defines the text of the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      text: {
        type: String
      },

      /**
       * Defines the visual indication and behavior of the item.
       * Available options are <code>Active</code> (by default), <code>Inactive</code> and <code>Detail</code>.
       * <br><br>
       * <b>Note:</b> When set to <code>Active</code>, the item will provide visual response upon press and hover,
       * while when <code>Inactive</code> or <code>Detail</code> - will not.
       *
       * @type {ListItemType}
       * @defaultvalue "Active"
       * @public
       * @since 1.0.0-rc.8
      */
      type: {
        type: _ListItemType.default,
        defaultValue: _ListItemType.default.Active
      },

      /**
       * Defines the description displayed right under the item text, if such is present.
       * @type {string}
       * @defaultvalue: ""
       * @public
       */
      description: {
        type: String
      },

      /**
       * Defines the <code>icon</code> source URI.
       * <br><br>
       * <b>Note:</b>
       * SAP-icons font provides numerous built-in icons. To find all the available icons, see the
       * <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
       *
       * @type {string}
       * @public
       */
      icon: {
        type: String
      },

      /**
       * Defines whether the <code>icon</code> should be displayed in the beginning of the item or in the end.
       * <br><br>
       * <b>Note:</b> If <code>image</code> is set, the <code>icon</code> would be displayed after the <code>image</code>.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      iconEnd: {
        type: Boolean
      },

      /**
       * Defines the <code>image</code> source URI.
       * <br><br>
       * <b>Note:</b> The <code>image</code> would be displayed in the beginning of the item.
       *
       * @type {string}
       * @public
       */
      image: {
        type: String
      },

      /**
       * Defines the <code>additionalText</code>, displayed in the end of the item.
       * @type {string}
       * @since 1.0.0-rc.15
       * @public
       */
      additionalText: {
        type: String
      },

      /**
       * Defines the state of the <code>additionalText</code>.
       * <br><br>
       * Available options are: <code>"None"</code> (by default), <code>"Success"</code>, <code>"Information"</code>, <code>"Warning"</code> and <code>"Erorr"</code>.
       * @type {ValueState}
       * @defaultvalue "None"
       * @since 1.0.0-rc.15
       * @public
       */
      additionalTextState: {
        type: _ValueState.default,
        defaultValue: _ValueState.default.None
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.main.SuggestionItem.prototype */
    {},
    events:
    /** @lends sap.ui.webcomponents.main.SuggestionItem.prototype */
    {}
  };
  /**
   * @class
   * The <code>ui5-suggestion-item</code> represents the suggestion item of the <code>ui5-input</code>.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.SuggestionItem
   * @extends UI5Element
   * @tagname ui5-suggestion-item
   * @implements sap.ui.webcomponents.main.IInputSuggestionItem
   * @public
   */

  class SuggestionItem extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get dependencies() {
      return [_SuggestionListItem.default];
    }

  }

  SuggestionItem.define();
  var _default = SuggestionItem;
  _exports.default = _default;
});