sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "./types/TitleLevel", "./types/WrappingType", "./generated/templates/TitleTemplate.lit", "./generated/themes/Title.css"], function (_exports, _UI5Element, _LitRenderer, _TitleLevel, _WrappingType, _TitleTemplate, _Title) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _TitleLevel = _interopRequireDefault(_TitleLevel);
  _WrappingType = _interopRequireDefault(_WrappingType);
  _TitleTemplate = _interopRequireDefault(_TitleTemplate);
  _Title = _interopRequireDefault(_Title);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-title",
    properties:
    /** @lends sap.ui.webcomponents.main.Title.prototype */
    {
      /**
       * Defines how the text of a component will be displayed when there is not enough space.
       * Available options are:
       * <ul>
       * <li><code>None</code> - The text will be truncated with an ellipsis.</li>
       * <li><code>Normal</code> - The text will wrap. The words will not be broken based on hyphenation.</li>
       * </ul>
       *
       * @type {WrappingType}
       * @defaultvalue "None"
       * @public
       */
      wrappingType: {
        type: _WrappingType.default,
        defaultValue: _WrappingType.default.None
      },

      /**
       * Defines the component level.
       * Available options are: <code>"H6"</code> to <code>"H1"</code>.
       *
       * @type {TitleLevel}
       * @defaultvalue "H2"
       * @public
      */
      level: {
        type: _TitleLevel.default,
        defaultValue: _TitleLevel.default.H2
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.main.Title.prototype */
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
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-title</code> component is used to display titles inside a page.
   * It is a simple, large-sized text with explicit header/title semantics.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Title";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.Title
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-title
   * @public
   */

  class Title extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _TitleTemplate.default;
    }

    static get styles() {
      return _Title.default;
    }

    get normalizedLevel() {
      return this.level.toLowerCase();
    }

    get h1() {
      return this.normalizedLevel === "h1";
    }

    get h2() {
      return this.normalizedLevel === "h2";
    }

    get h3() {
      return this.normalizedLevel === "h3";
    }

    get h4() {
      return this.normalizedLevel === "h4";
    }

    get h5() {
      return this.normalizedLevel === "h5";
    }

    get h6() {
      return this.normalizedLevel === "h6";
    }

  }

  Title.define();
  var _default = Title;
  _exports.default = _default;
});