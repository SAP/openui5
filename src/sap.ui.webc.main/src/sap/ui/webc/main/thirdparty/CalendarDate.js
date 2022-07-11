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
    tag: "ui5-date",
    properties:
    /** @lends sap.ui.webcomponents.main.CalendarDate.prototype */
    {
      /**
       * The date formatted according to the <code>formatPattern</code> property of the <code>ui5-calendar</code> that hosts the component
       *
       * @type {string}
       * @public
       */
      value: {
        type: String
      }
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-date</code> component defines a calendar date to be used inside <code>ui5-calendar</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.CalendarDate
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-date
   * @implements sap.ui.webcomponents.main.ICalendarDate
   * @public
   */

  class CalendarDate extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

  }

  CalendarDate.define();
  var _default = CalendarDate;
  _exports.default = _default;
});