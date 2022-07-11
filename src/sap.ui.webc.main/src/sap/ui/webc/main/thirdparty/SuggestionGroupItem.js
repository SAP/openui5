sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "./GroupHeaderListItem"], function (_exports, _UI5Element, _GroupHeaderListItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _GroupHeaderListItem = _interopRequireDefault(_GroupHeaderListItem);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-suggestion-group-item",
    properties:
    /** @lends sap.ui.webcomponents.main.SuggestionGroupItem.prototype */
    {
      /**
       * Defines the text of the <code>ui5-suggestion-group-item</code>.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      text: {
        type: String
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.main.SuggestionGroupItem.prototype */
    {},
    events:
    /** @lends sap.ui.webcomponents.main.SuggestionGroupItem.prototype */
    {}
  };
  /**
   * @class
   * The <code>ui5-suggestion-group-item</code> is type of suggestion item,
   * that can be used to split the <code>ui5-input</code> suggestions into groups.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.SuggestionGroupItem
   * @extends UI5Element
   * @tagname ui5-suggestion-group-item
   * @implements sap.ui.webcomponents.main.IInputSuggestionItem
   * @public
   * @since 1.0.0-rc.15
   */

  class SuggestionItem extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get dependencies() {
      return [_GroupHeaderListItem.default];
    }
    /**
     * Indicates the "grouping" nature of the component
     * to avoid tag name checks tag name to diferenciate from the standard suggestion item.
     * @protected
     */


    get groupItem() {
      return true;
    }

  }

  SuggestionItem.define();
  var _default = SuggestionItem;
  _exports.default = _default;
});