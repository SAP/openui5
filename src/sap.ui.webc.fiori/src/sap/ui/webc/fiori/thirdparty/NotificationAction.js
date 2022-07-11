sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/main/thirdparty/types/ButtonDesign"], function (_exports, _UI5Element, _ButtonDesign) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _ButtonDesign = _interopRequireDefault(_ButtonDesign);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-notification-action",
    properties:
    /** @lends sap.ui.webcomponents.fiori.NotificationAction.prototype */
    {
      /**
       * Defines the text of the <code>ui5-notification-action</code>.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      text: {
        type: String
      },

      /**
       * Defines if the action is disabled.
       * <br><br>
       * <b>Note:</b> a disabled action can't be pressed or focused, and it is not in the tab chain.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disabled: {
        type: Boolean
      },

      /**
       * Defines the action design.
       *
       * <br><br>
       * <b>Note:</b>
       * <ul>
       * <li><code>Default</code></li>
       * <li><code>Emphasized</code></li>
       * <li><code>Positive</code></li>
       * <li><code>Negative</code></li>
       * <li><code>Transparent</code></li>
       * </ul>
       *
       * @type {ButtonDesign}
       * @defaultvalue "Transparent"
       * @public
       */
      design: {
        type: _ButtonDesign.default,
        defaultValue: _ButtonDesign.default.Transparent
      },

      /**
       * Defines the <code>icon</code> source URI.
       * <br><br>
       * <b>Note:</b>
       * SAP-icons font provides numerous built-in icons. To find all the available icons, see the
       * <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      icon: {
        type: String
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.fiori.NotificationAction.prototype */
    {},
    events:
    /** @lends sap.ui.webcomponents.fiori.NotificationAction.prototype */
    {
      click: {}
    }
  };
  /**
   * @class
   * The <code>ui5-notification-action</code> represents an abstract action,
   * used in the <code>ui5-li-notification</code> and the <code>ui5-li-notification-group</code> items.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.NotificationAction
   * @extends UI5Element
   * @tagname ui5-notification-action
   * @implements sap.ui.webcomponents.fiori.INotificationAction
   * @public
   */

  class NotificationAction extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

  }

  NotificationAction.define();
  var _default = NotificationAction;
  _exports.default = _default;
});