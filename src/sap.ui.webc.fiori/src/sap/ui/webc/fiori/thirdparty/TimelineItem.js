sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/main/thirdparty/Icon", "sap/ui/webc/main/thirdparty/Link", "./generated/templates/TimelineItemTemplate.lit", "./types/TimelineLayout", "./generated/themes/TimelineItem.css"], function (_exports, _UI5Element, _customElement, _event, _property, _LitRenderer, _Icon, _Link, _TimelineItemTemplate, _TimelineLayout, _TimelineItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _event = _interopRequireDefault(_event);
  _property = _interopRequireDefault(_property);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Icon = _interopRequireDefault(_Icon);
  _Link = _interopRequireDefault(_Link);
  _TimelineItemTemplate = _interopRequireDefault(_TimelineItemTemplate);
  _TimelineLayout = _interopRequireDefault(_TimelineLayout);
  _TimelineItem = _interopRequireDefault(_TimelineItem);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  // Styles

  const SHORT_LINE_WIDTH = "ShortLineWidth";
  const LARGE_LINE_WIDTH = "LargeLineWidth";
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * An entry posted on the timeline.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.TimelineItem
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-timeline-item
   * @implements sap.ui.webc.fiori.ITimelineItem
   * @public
   */
  let TimelineItem = class TimelineItem extends _UI5Element.default {
    /**
     * Determines the description of the <code>ui5-timeline-item</code>.
     *
     * @type {Node[]}
     * @name sap.ui.webc.fiori.TimelineItem.prototype.default
     * @slot
     * @public
     */
    constructor() {
      super();
    }
    onNamePress() {
      this.fireEvent("name-click", {});
    }
    /**
     * Focus the internal link.
     * @protected
     */
    focusLink() {
      this.shadowRoot.querySelector("[ui5-link]")?.focus();
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
  };
  __decorate([(0, _property.default)()], TimelineItem.prototype, "icon", void 0);
  __decorate([(0, _property.default)()], TimelineItem.prototype, "name", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TimelineItem.prototype, "nameClickable", void 0);
  __decorate([(0, _property.default)()], TimelineItem.prototype, "titleText", void 0);
  __decorate([(0, _property.default)()], TimelineItem.prototype, "subtitleText", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "-1",
    noAttribute: true
  })], TimelineItem.prototype, "_tabIndex", void 0);
  __decorate([(0, _property.default)({
    type: _TimelineLayout.default,
    defaultValue: _TimelineLayout.default.Vertical
  })], TimelineItem.prototype, "layout", void 0);
  __decorate([(0, _property.default)()], TimelineItem.prototype, "_lineWidth", void 0);
  TimelineItem = __decorate([(0, _customElement.default)({
    tag: "ui5-timeline-item",
    renderer: _LitRenderer.default,
    styles: _TimelineItem.default,
    template: _TimelineItemTemplate.default,
    dependencies: [_Icon.default, _Link.default]
  })
  /**
   * Fired when the item name is pressed either with a
   * click/tap or by using the Enter or Space key.
   * <br><br>
   * <b>Note:</b> The event will not be fired if the <code>name-clickable</code>
   * attribute is not set.
   *
   * @event sap.ui.webc.fiori.TimelineItem#name-click
   * @public
   */, (0, _event.default)("name-click")], TimelineItem);
  TimelineItem.define();
  var _default = TimelineItem;
  _exports.default = _default;
});