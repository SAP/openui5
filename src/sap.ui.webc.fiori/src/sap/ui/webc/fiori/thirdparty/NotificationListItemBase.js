sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/main/thirdparty/ListItemBase", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/main/thirdparty/types/Priority", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/icons/message-success", "sap/ui/webc/common/thirdparty/icons/message-error", "sap/ui/webc/common/thirdparty/icons/message-warning", "sap/ui/webc/common/thirdparty/icons/overflow", "./generated/templates/NotificationOverflowActionsPopoverTemplate.lit", "./generated/themes/NotificationOverflowActionsPopover.css"], function (_exports, _Keys, _i18nBundle, _ListItemBase, _Integer, _Priority, _decline, _messageSuccess, _messageError, _messageWarning, _overflow, _NotificationOverflowActionsPopoverTemplate, _NotificationOverflowActionsPopover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _ListItemBase = _interopRequireDefault(_ListItemBase);
  _Integer = _interopRequireDefault(_Integer);
  _Priority = _interopRequireDefault(_Priority);
  _NotificationOverflowActionsPopoverTemplate = _interopRequireDefault(_NotificationOverflowActionsPopoverTemplate);
  _NotificationOverflowActionsPopover = _interopRequireDefault(_NotificationOverflowActionsPopover);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Icons
  // Templates
  // Styles

  /**
   * @public
   */
  const metadata = {
    managedSlots: true,
    properties:
    /** @lends sap.ui.webcomponents.fiori.NotificationListItemBase.prototype */
    {
      /**
       * Defines the <code>titleText</code> of the item.
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      titleText: {
        type: String
      },

      /**
       * Defines the <code>priority</code> of the item.
       * Available options are:
       * <ul>
       * <li><code>None</code></li>
       * <li><code>Low</code></li>
       * <li><code>Medium</code></li>
       * <li><code>High</code></li>
       * </ul>
       * @type {Priority}
       * @defaultvalue "None"
       * @public
       */
      priority: {
        type: _Priority.default,
        defaultValue: _Priority.default.None
      },

      /**
       * Defines if the <code>close</code> button would be displayed.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      showClose: {
        type: Boolean
      },

      /**
       * Defines if the <code>notification</code> is new or has been already read.
       * <br><br>
       * <b>Note:</b> if set to <code>false</code> the <code>titleText</code> has bold font,
       * if set to true - it has a normal font.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      read: {
        type: Boolean
      },

      /**
       * Defines if a busy indicator would be displayed over the item.
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.0.0-rc.8
       */
      busy: {
        type: Boolean
      },

      /**
       * Defines the delay in milliseconds, after which the busy indicator will show up for this component.
       *
       * @type {Integer}
       * @defaultValue 1000
       * @public
       */
      busyDelay: {
        type: _Integer.default,
        defaultValue: 1000
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.fiori.NotificationListItemBase.prototype */
    {
      /**
       * Defines the actions, displayed in the top-right area.
       * <br><br>
       * <b>Note:</b> use the <code>ui5-notification-action</code> component.
       *
       * @type {sap.ui.webcomponents.fiori.INotificationAction[]}
       * @slot
       * @public
       */
      actions: {
        type: HTMLElement
      }
    },
    events:
    /** @lends sap.ui.webcomponents.fiori.NotificationListItemBase.prototype */
    {
      /**
       * Fired when the <code>Close</code> button is pressed.
       *
       * @event
       * @public
       */
      close: {}
    }
  };
  /**
   * @class
   *
   * The base class of the <code>NotificationListItem</code> and <code>NotificationListGroupItem</code>.
   *
   * @abstract
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.NotificationListItemBase
   * @extends ListItemBase
   * @tagname ui5-li-notification-group
   * @since 1.0.0-rc.8
   * @appenddocs NotificationAction
   * @public
   */

  class NotificationListItemBase extends _ListItemBase.default {
    static get metadata() {
      return metadata;
    }

    static get staticAreaTemplate() {
      return _NotificationOverflowActionsPopoverTemplate.default;
    }

    static get staticAreaStyles() {
      return _NotificationOverflowActionsPopover.default;
    }

    static priorityIconsMappings() {
      return {
        "High": "message-error",
        "Medium": "message-warning",
        "Low": "message-success"
      };
    }

    get hasTitleText() {
      return !!this.titleText.length;
    }

    get hasPriority() {
      return this.priority !== _Priority.default.None;
    }

    get priorityIcon() {
      return NotificationListItemBase.priorityIconsMappings()[this.priority];
    }

    get overflowButtonDOM() {
      return this.shadowRoot.querySelector(".ui5-nli-overflow-btn");
    }

    get showOverflow() {
      return !!this.overflowActions.length;
    }

    get overflowActions() {
      if (this.actions.length <= 1) {
        return [];
      }

      return this.actionsInfo;
    }

    get standardActions() {
      if (this.actions.length > 1) {
        return [];
      }

      return this.actionsInfo;
    }

    get actionsInfo() {
      return this.actions.map(action => {
        return {
          icon: action.icon,
          text: action.text,
          press: this._onCustomActionClick.bind(this),
          refItemid: action._id,
          disabled: action.disabled ? true : undefined,
          design: action.design
        };
      });
    }
    /**
     * Event handlers
     */


    _onBtnCloseClick() {
      this.fireEvent("close", {
        item: this
      });
    }

    _onBtnOverflowClick() {
      this.openOverflow();
    }

    _onCustomActionClick(event) {
      const refItemId = event.target.getAttribute("data-ui5-external-action-item-id");

      if (refItemId) {
        this.getActionByID(refItemId).fireEvent("click", {
          targetRef: event.target
        }, true);
        this.closeOverflow();
      }
    }

    _onkeydown(event) {
      super._onkeydown(event);

      if (event.isMarked === "button") {
        return;
      }

      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
      }
    }

    getActionByID(id) {
      return this.actions.find(action => action._id === id);
    }

    async openOverflow() {
      const overflowPopover = await this.getOverflowPopover();
      overflowPopover.showAt(this.overflowButtonDOM);
    }

    async closeOverflow() {
      const overflowPopover = await this.getOverflowPopover();
      overflowPopover.close();
    }

    async getOverflowPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector(".ui5-notification-overflow-popover");
    }

    static async onDefine() {
      NotificationListItemBase.i18nFioriBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }

  }

  var _default = NotificationListItemBase;
  _exports.default = _default;
});