sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/main/thirdparty/Icon", "sap/ui/webc/main/thirdparty/Link", "./generated/templates/TimelineItemTemplate.lit", "./types/TimelineLayout", "./generated/themes/TimelineItem.css"], function (_exports, _UI5Element, _LitRenderer, _Icon, _Link, _TimelineItemTemplate, _TimelineLayout, _TimelineItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Icon = _interopRequireDefault(_Icon);
  _Link = _interopRequireDefault(_Link);
  _TimelineItemTemplate = _interopRequireDefault(_TimelineItemTemplate);
  _TimelineLayout = _interopRequireDefault(_TimelineLayout);
  _TimelineItem = _interopRequireDefault(_TimelineItem);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Styles
  const SHORT_LINE_WIDTH = "ShortLineWidth";
  const LARGE_LINE_WIDTH = "LargeLineWidth";
  /**
   * @public
   */

  const metadata = {
    tag: "ui5-timeline-item",
    slots:
    /** @lends sap.ui.webcomponents.fiori.TimelineItem.prototype */
    {
      /**
       * Determines the description of the <code>ui5-timeline-item</code>.
       *
       * @type {Node[]}
       * @slot
       * @public
       */
      "default": {
        type: Node
      }
    },
    properties:
    /** @lends sap.ui.webcomponents.fiori.TimelineItem.prototype */
    {
      /**
       * Defines the icon to be displayed as graphical element within the <code>ui5-timeline-item</code>.
       * SAP-icons font provides numerous options.
       * <br><br>
       *
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
       * Defines the name of the item, displayed before the <code>title-text</code>.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      name: {
        type: String
      },

      /**
       * Defines if the <code>name</code> is clickable.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      nameClickable: {
        type: Boolean
      },

      /**
       * Defines the title text of the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      titleText: {
        type: String
      },

      /**
       * Defines the subtitle text of the component.
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      subtitleText: {
        type: String
      },
      _tabIndex: {
        type: String,
        defaultValue: "-1",
        noAttribute: true
      },

      /**
       * Defines the items orientation.
       *
       * @type {TimelineLayout}
       * @defaultvalue "Vertical"
       * @private
       */
      layout: {
        type: _TimelineLayout.default,
        defaultvalue: _TimelineLayout.default.Vertical
      },

      /**
       * Defines the indicator line width.
       *
       * @type {string}
       * @private
       */
      _lineWidth: {
        type: String
      }
    },
    events:
    /** @lends sap.ui.webcomponents.fiori.TimelineItem.prototype */
    {
      /**
       * Fired when the item name is pressed either with a
       * click/tap or by using the Enter or Space key.
       * <br><br>
       * <b>Note:</b> The event will not be fired if the <code>name-clickable</code>
       * attribute is not set.
       *
       * @event sap.ui.webcomponents.fiori.TimelineItem#name-click
       * @public
       */
      "name-click": {}
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * An entry posted on the timeline.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.TimelineItem
   * @extends UI5Element
   * @tagname ui5-timeline-item
   * @implements sap.ui.webcomponents.fiori.ITimelineItem
   * @public
   */

  class TimelineItem extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _TimelineItemTemplate.default;
    }

    static get styles() {
      return _TimelineItem.default;
    }

    constructor() {
      super();
    }

    onNamePress() {
      this.fireEvent("name-click", {});
    }

    static get dependencies() {
      return [_Icon.default, _Link.default];
    }

    get classes() {
      return {
        indicator: {
          "ui5-tli-indicator": true,
          "ui5-tli-indicator-short-line": this._lineWidth === SHORT_LINE_WIDTH,
          "ui5-tli-indicator-large-line": this._lineWidth === LARGE_LINE_WIDTH
        },
        bubbleArrowPosition: {
          "ui5-tli-bubble-arrow": true,
          "ui5-tli-bubble-arrow--left": this.layout === _TimelineLayout.default.Vertical,
          "ui5-tli-bubble-arrow--top": this.layout === _TimelineLayout.default.Horizontal
        }
      };
    }

  }

  TimelineItem.define();
  var _default = TimelineItem;
  _exports.default = _default;
});