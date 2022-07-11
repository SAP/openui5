sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/MediaRange", "./types/PageBackgroundDesign", "./generated/templates/PageTemplate.lit", "./generated/themes/Page.css"], function (_exports, _UI5Element, _LitRenderer, _ResizeHandler, _MediaRange, _PageBackgroundDesign, _PageTemplate, _Page) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _MediaRange = _interopRequireDefault(_MediaRange);
  _PageBackgroundDesign = _interopRequireDefault(_PageBackgroundDesign);
  _PageTemplate = _interopRequireDefault(_PageTemplate);
  _Page = _interopRequireDefault(_Page);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-page",
    managedSlots: true,
    languageAware: true,
    properties:
    /** @lends sap.ui.webcomponents.fiori.Page.prototype */
    {
      /**
       * Defines the background color of the <code>ui5-page</code>.
       * <br><br>
       * <b>Note:</b> When a ui5-list is placed inside the page, we recommend using “List” to ensure better color contrast.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>Solid</code></li> (default)
       * <li><code>Transparent</code></li>
       * <li><code>List</code></li>
       * </ul>
       * @type {PageBackgroundDesign}
       * @defaultvalue "Solid"
       * @public
       */
      backgroundDesign: {
        type: String,
        defaultValue: _PageBackgroundDesign.default.Solid
      },

      /**
       * Disables vertical scrolling of page content.
       * If set to true, there will be no vertical scrolling at all.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disableScrolling: {
        type: Boolean
      },

      /**
       * Defines if the footer should float over the content.
       * <br><br>
       * <b>Note:</b> When set to true the footer floats over the content with a slight offset from the bottom, otherwise it is fixed at the very bottom of the page.
       * @type {boolean}
       * @defaultvalue true
       * @public
       */
      floatingFooter: {
        type: Boolean
      },

      /**
       * Defines the footer visibility.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      hideFooter: {
        type: Boolean
      },

      /**
       * Defines the current media query size.
       *
       * @type {string}
       * @private
       * @since 1.0.0-rc.15
       */
      mediaRange: {
        type: String
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.fiori.Page.prototype */
    {
      /**
       * Defines the header HTML Element.
       *
       * @type {sap.ui.webcomponents.fiori.IBar}
       * @slot
       * @public
       */
      header: {
        type: HTMLElement
      },

      /**
       * Defines the content HTML Element.
       *
       * @type {HTMLElement[]}
       * @slot content
       * @public
       */
      "default": {
        propertyName: "content",
        type: HTMLElement
      },

      /**
       * Defines the footer HTML Element.
       *
       * @type {sap.ui.webcomponents.fiori.IBar}
       * @slot
       * @public
       */
      footer: {
        type: HTMLElement
      }
    },
    events:
    /** @lends sap.ui.webcomponents.fiori.Page.prototype */
    {}
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-page</code> is a container component that holds one whole screen of an application.
   * The page has three distinct areas that can hold content - a header, content area and a footer.
   * <h3>Structure</h3>
   * <h4>Header</h4>
   * The top most area of the page is occupied by the header. The standard header includes a navigation button and a title.
   * <h4>Content</h4>
   * The content occupies the main part of the page. Only the content area is scrollable by default.
   * This can be prevented by setting  <code>enableScrolling</code> to <code>false</code>.
   * <h4>Footer</h4>
   * The footer is optional and occupies the fixed bottom part of the page. Alternatively, the footer can be floating above the bottom part of the content.
   * This is enabled with the <code>floatingFooter</code> property.
   *
   * <b>Note:</b> <code>ui5-page</code> occipues the whole available space of its parent. In order to achieve the intended design you have to make sure
   * that there is enough space for the <code>ui5-page</code> to be rendered.
   *
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents-fiori/dist/Page.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.Page
   * @extends UI5Element
   * @tagname ui5-page
   * @since 1.0.0-rc.12
   * @public
   */

  class Page extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get styles() {
      return _Page.default;
    }

    static get template() {
      return _PageTemplate.default;
    }

    constructor() {
      super();
      this._updateMediaRange = this.updateMediaRange.bind(this);
    }

    onEnterDOM() {
      _ResizeHandler.default.register(this, this._updateMediaRange);
    }

    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._updateMediaRange);
    }

    updateMediaRange() {
      this.mediaRange = _MediaRange.default.getCurrentRange(_MediaRange.default.RANGESETS.RANGE_4STEPS, this.getDomRef().offsetWidth);
    }

    get _contentBottom() {
      return !this.floatingFooter && !this.hideFooter ? "2.75rem" : "0";
    }

    get _contentPaddingBottom() {
      return this.floatingFooter && !this.hideFooter ? "3.5rem" : "0";
    }

    get _contentTop() {
      return this.header.length ? "2.75rem" : "0rem";
    }

    get styles() {
      return {
        content: {
          "padding-bottom": this.footer.length && this._contentPaddingBottom,
          "bottom": this.footer.length && this._contentBottom,
          "top": this._contentTop
        },
        footer: {}
      };
    }

  }

  Page.define();
  var _default = Page;
  _exports.default = _default;
});