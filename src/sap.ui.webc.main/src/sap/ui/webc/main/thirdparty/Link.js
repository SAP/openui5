sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./types/LinkDesign", "./types/WrappingType", "./generated/templates/LinkTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/Link.css"], function (_exports, _UI5Element, _LitRenderer, _Keys, _AriaLabelHelper, _i18nBundle, _LinkDesign, _WrappingType, _LinkTemplate, _i18nDefaults, _Link) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _LinkDesign = _interopRequireDefault(_LinkDesign);
  _WrappingType = _interopRequireDefault(_WrappingType);
  _LinkTemplate = _interopRequireDefault(_LinkTemplate);
  _Link = _interopRequireDefault(_Link);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-link",
    languageAware: true,
    properties:
    /** @lends sap.ui.webcomponents.main.Link.prototype */
    {
      /**
       * Defines whether the component is disabled.
       * <br><br>
       * <b>Note:</b> When disabled, the click event cannot be triggered by the user.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disabled: {
        type: Boolean
      },

      /**
       * Defines the component href.
       * <br><br>
       * <b>Note:</b> Standard hyperlink behavior is supported.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      href: {
        type: String
      },

      /**
       * Defines the component target.
       * <br><br>
       * <b>Notes:</b>
       *
       * <ul>
       * <li><code>_self</code></li>
       * <li><code>_top</code></li>
       * <li><code>_blank</code></li>
       * <li><code>_parent</code></li>
       * <li><code>_search</code></li>
       * </ul>
       *
       * <b>This property must only be used when the <code>href</code> property is set.</b>
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      target: {
        type: String
      },

      /**
       * Defines the component design.
       * <br><br>
       * <b>Note:</b> Avaialble options are <code>Default</code>, <code>Subtle</code>, and <code>Emphasized</code>.
       *
       * @type {LinkDesign}
       * @defaultvalue "Default"
       * @public
       */
      design: {
        type: _LinkDesign.default,
        defaultValue: _LinkDesign.default.Default
      },

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
       * Defines the accessible aria name of the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.2.0
       */
      accessibleName: {
        type: String
      },

      /**
       * Receives id(or many ids) of the elements that label the input
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.0.0-rc.15
       */
      accessibleNameRef: {
        type: String
      },

      /**
       * Defines the ARIA role of the component.
       * @defaultvalue ""
       * @private
       * @since 1.0.0-rc.15
       */
      accessibleRole: {
        type: String
      },

      /**
       * An object of strings that defines several additional accessibility attribute values
       * for customization depending on the use case.
       *
       * It supports the following fields:
       *
       * <ul>
       * 		<li><code>expanded</code>: Indicates whether the anchor element, or another grouping element it controls, is currently expanded or collapsed. Accepts the following string values:
       *			<ul>
       *				<li><code>true</code></li>
       *				<li><code>false</code></li>
       *			</ul>
       * 		</li>
       * 		<li><code>hasPopup</code>: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the anchor element. Accepts the following string values:
       * 			<ul>
       *				<li><code>Dialog</code></li>
       *				<li><code>Grid</code></li>
       *				<li><code>ListBox</code></li>
       *				<li><code>Menu</code></li>
       *				<li><code>Tree</code></li>
       * 			</ul>
       * 		</li>
       * </ul>
       * @type {object}
       * @public
       * @since 1.1.0
       */
      accessibilityAttributes: {
        type: Object
      },
      _rel: {
        type: String,
        noAttribute: true
      },
      _tabIndex: {
        type: String,
        noAttribute: true
      },

      /**
       * Indicates if the element is on focus.
       * @private
       */
      focused: {
        type: Boolean
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.main.Link.prototype */
    {
      /**
       * Defines the text of the component.
       * <br><b>Note:</b> Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
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
    /** @lends sap.ui.webcomponents.main.Link.prototype */
    {
      /**
       * Fired when the component is triggered either with a mouse/tap
       * or by using the Enter key.
       *
       * @event
       * @public
       * @allowPreventDefault
       * @param {Boolean} altKey Returns whether the "ALT" key was pressed when the event was triggered.
       * @param {Boolean} ctrlKey Returns whether the "CTRL" key was pressed when the event was triggered.
       * @param {Boolean} metaKey Returns whether the "META" key was pressed when the event was triggered.
       * @param {Boolean} shiftKey Returns whether the "SHIFT" key was pressed when the event was triggered.
       */
      click: {
        detail: {
          altKey: {
            type: Boolean
          },
          ctrlKey: {
            type: Boolean
          },
          metaKey: {
            type: Boolean
          },
          shiftKey: {
            type: Boolean
          }
        }
      }
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-link</code> is a hyperlink component that is used to navigate to other
   * apps and web pages, or to trigger actions.
   * It is a clickable text element, visualized in such a way that it stands out
   * from the standard text.
   * On hover, it changes its style to an underlined text to provide additional feedback to the user.
   *
   *
   * <h3>Usage</h3>
   *
   * You can set the <code>ui5-link</code> to be enabled or disabled.
   * <br><br>
   * To create a visual hierarchy in large lists of links, you can set the less important links as
   * <code>Subtle</code> or the more important ones as <code>Emphasized</code>,
   * by using the <code>design</code> property.
   * <br><br>
   * If the <code>href</code> property is set, the link behaves as the HTML
   * anchor tag (<code>&lt;a&gt;&lt;a&#47;&gt;</code>) and opens the specified URL in the given target frame (<code>target</code> property).
   * To specify where the linked content is opened, you can use the <code>target</code> property.
   *
   * <h3>Responsive behavior</h3>
   *
   * If there is not enough space, the text of the <code>ui5-link</code> becomes truncated.
   * If the <code>wrappingType</code> property is set to <code>"Normal"</code>, the text is displayed
   * on several lines instead of being truncated.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Link";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.Link
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-link
   * @public
   */

  class Link extends _UI5Element.default {
    constructor() {
      super();
      this._dummyAnchor = document.createElement("a");
    }

    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _LinkTemplate.default;
    }

    static get styles() {
      return _Link.default;
    }

    onBeforeRendering() {
      const needsNoReferrer = this.target !== "_self" && this.href && this._isCrossOrigin();

      this._rel = needsNoReferrer ? "noreferrer noopener" : undefined;
    }

    _isCrossOrigin() {
      const loc = window.location;
      this._dummyAnchor.href = this.href;
      return !(this._dummyAnchor.hostname === loc.hostname && this._dummyAnchor.port === loc.port && this._dummyAnchor.protocol === loc.protocol);
    }

    get tabIndex() {
      if (this._tabIndex) {
        return this._tabIndex;
      }

      return this.disabled || !this.textContent.length ? "-1" : "0";
    }

    get ariaLabelText() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }

    get hasLinkType() {
      return this.design !== _LinkDesign.default.Default;
    }

    static typeTextMappings() {
      return {
        "Subtle": _i18nDefaults.LINK_SUBTLE,
        "Emphasized": _i18nDefaults.LINK_EMPHASIZED
      };
    }

    get linkTypeText() {
      return Link.i18nBundle.getText(Link.typeTextMappings()[this.design]);
    }

    get parsedRef() {
      return this.href && this.href.length > 0 ? this.href : undefined;
    }

    get effectiveAccRole() {
      return this.accessibleRole || "link";
    }

    static async onDefine() {
      Link.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

    _onclick(event) {
      const {
        altKey,
        ctrlKey,
        metaKey,
        shiftKey
      } = event;
      event.isMarked = "link";
      const executeEvent = this.fireEvent("click", {
        altKey,
        ctrlKey,
        metaKey,
        shiftKey
      }, true);

      if (!executeEvent) {
        event.preventDefault();
      }
    }

    _onfocusin(event) {
      event.isMarked = "link";
      this.focused = true;
    }

    _onfocusout(event) {
      this.focused = false;
    }

    _onkeydown(event) {
      if ((0, _Keys.isEnter)(event)) {
        this._onclick(event);
      } else if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
      }

      event.isMarked = "link";
    }

    _onkeyup(event) {
      if (!(0, _Keys.isSpace)(event)) {
        event.isMarked = "link";
        return;
      }

      this._onclick(event);

      if (this.href && !event.defaultPrevented) {
        const customEvent = new MouseEvent("click");
        this.getDomRef().dispatchEvent(customEvent);
      }
    }

  }

  Link.define();
  var _default = Link;
  _exports.default = _default;
});