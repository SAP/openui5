sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/Keys", "./generated/templates/IconTemplate.lit", "./generated/themes/Icon.css"], function (_exports, _UI5Element, _LitRenderer, _Icons, _i18nBundle, _Keys, _IconTemplate, _Icon) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _IconTemplate = _interopRequireDefault(_IconTemplate);
  _Icon = _interopRequireDefault(_Icon);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Styles
  const ICON_NOT_FOUND = "ICON_NOT_FOUND";
  const PRESENTATION_ROLE = "presentation";
  /**
   * @public
   */

  const metadata = {
    tag: "ui5-icon",
    languageAware: true,
    themeAware: true,
    properties:
    /** @lends sap.ui.webcomponents.main.Icon.prototype */
    {
      /**
       * Defines if the icon is interactive (focusable and pressable)
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.0.0-rc.8
       */
      interactive: {
        type: Boolean
      },

      /**
       * Defines the unique identifier (icon name) of the component.
       * <br>
       *
       * To browse all available icons, see the
       * <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">SAP Icons</ui5-link>,
       * <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons-TNT" class="api-table-content-cell-link">SAP Fiori Tools</ui5-link> and
       * <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">SAP Business Suite</ui5-link> collections.
       * <br>
       *
       * Example:
       * <br>
       * <code>name='add'</code>, <code>name='delete'</code>, <code>name='employee'</code>.
       * <br><br>
       *
       * <b>Note:</b> To use the SAP Fiori Tools icons,
       * you need to set the <code>tnt</code> prefix in front of the icon's name.
       * <br>
       *
       * Example:
       * <br>
       * <code>name='tnt/antenna'</code>, <code>name='tnt/actor'</code>, <code>name='tnt/api'</code>.
       * <br><br>
       *
       * <b>Note:</b> To use the SAP Business Suite icons,
       * you need to set the <code>business-suite</code> prefix in front of the icon's name.
       * <br>
       *
       * Example:
       * <br>
       * <code>name='business-suite/3d'</code>, <code>name='business-suite/1x2-grid-layout'</code>, <code>name='business-suite/4x4-grid-layout'</code>.
       * @type {string}
       * @defaultvalue ""
       * @public
      */
      name: {
        type: String
      },

      /**
       * Defines the text alternative of the component.
       * If not provided a default text alternative will be set, if present.
       * <br><br>
       * <b>Note:</b> Every icon should have a text alternative in order to
       * calculate its accessible name.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      accessibleName: {
        type: String
      },

      /**
       * Defines whether the component should have a tooltip.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      showTooltip: {
        type: Boolean
      },

      /**
       * Defines the accessibility role of the component.
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.1.0
       */
      accessibleRole: {
        type: String
      },

      /**
       * Defines the aria hidden state of the component.
       * Note: If the role is presentation the default value of aria-hidden will be true.
       * @private
       * @since 1.0.0-rc.15
       */
      ariaHidden: {
        type: String
      },

      /**
       * @private
       */
      pathData: {
        type: String,
        noAttribute: true
      },

      /**
       * @private
       */
      accData: {
        type: Object,
        noAttribute: true
      },

      /**
       * @private
       */
      focused: {
        type: Boolean
      },

      /**
      * @private
      */
      invalid: {
        type: Boolean
      },

      /**
       * @private
       */
      effectiveAccessibleName: {
        type: String,
        defaultValue: undefined,
        noAttribute: true
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.Icon.prototype */
    {
      /**
       * Fired on mouseup, space and enter if icon is interactive
       * @private
       * @since 1.0.0-rc.8
       */
      click: {}
    }
  };
  /**
   * @class
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-icon</code> component represents an SVG icon.
   * There are two main scenarios how the <code>ui5-icon</code> component is used:
   * as a purely decorative element, <br>
   * or as an interactive element that can be focused and clicked.
   *
   * <h3>Usage</h3>
   *
   * 1. <b>Get familiar with the icons collections.</b>
   * <br>
   * Before displaying an icon, you need to explore the icons collections to find and import the desired icon.
   * <br>
   * Currently there are 3 icons collection, available as 3 npm packages:
   * <br>
   *
   * <ul>
   * <li>
   * <ui5-link target="_blank" href="https://www.npmjs.com/package/@ui5/webcomponents-icons" class="api-table-content-cell-link">@ui5/webcomponents-icons</ui5-link> represents the "SAP-icons" collection and includes the following
   * <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons" class="api-table-content-cell-link">icons</ui5-link>.
   * </li>
   * <li>
   * <ui5-link target="_blank" href="https://www.npmjs.com/package/@ui5/webcomponents-icons-tnt" class="api-table-content-cell-link">@ui5/webcomponents-icons-tnt</ui5-link> represents the "tnt" collection and includes the following
   * <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons-TNT" class="api-table-content-cell-link">icons</ui5-link>.
   * </li>
   * <li>
   * <ui5-link target="_blank" href="https://www.npmjs.com/package/@ui5/webcomponents-icons-business-suite" class="api-table-content-cell-link">@ui5/webcomponents-icons-icons-business-suite</ui5-link> represents the "business-suite" collection and includes the following
   * <ui5-link target="_blank" href="https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/BusinessSuiteInAppSymbols" class="api-table-content-cell-link">icons</ui5-link>.
   * </li>
   * </ul>
   *
   * 2. <b>After exploring the icons collections, add one or more of the packages as dependencies to your project.</b>
   * <br>
   * <code>npm i @ui5/webcomponents-icons</code><br>
   * <code>npm i @ui5/webcomponents-icons-tnt</code><br>
   * <code>npm i @ui5/webcomponents-icons-business-suite</code>
   * <br><br>
   *
   * 3. <b>Then, import the desired icon</b>.
   * <br>
   * <code>import "@ui5/{package_name}/dist/{icon_name}.js";</code>
   * <br><br>
   *
   * <b>For Example</b>:
   * <br>
   *
   * For the standard "SAP-icons" icon collection, import an icon from the <code>@ui5/webcomponents-icons</code> package:
   * <br>
   * <code>import "@ui5/webcomponents-icons/dist/employee.js";</code>
   * <br><br>
   *
   * For the "tnt" (SAP Fiori Tools) icon collection, import an icon from the <code>@ui5/webcomponents-icons-tnt</code> package:
   * <br>
   * <code>import "@ui5/webcomponents-icons-tnt/dist/antenna.js";</code>
   * <br><br>
   *
   * For the "business-suite" (SAP Business Suite) icon collection, import an icon from the <code>@ui5/webcomponents-icons-business-suite</code> package:
   * <br>
   * <code>import "@ui5/webcomponents-icons-business-suite/dist/ab-testing.js";</code>
   * <br><br>
   *
   * 4. <b>Display the icon using the <code>ui5-icon</code> web component.</b><br>
   * Set the icon collection ("SAP-icons", "tnt" or "business-suite" - "SAP-icons" is the default icon collection and can be skipped)<br>
   * and the icon name to the <code>name</code> property.
   * <br><br>
   *
   * <code>&lt;ui5-icon name="employee">&lt;/ui5-icon></code><br>
   * <code>&lt;ui5-icon name="tnt/antenna">&lt;/ui5-icon></code><br>
   * <code>&lt;ui5-icon name="business-suite/ab-testing">&lt;/ui5-icon></code>
   *
   * <h3>Keyboard Handling</h3>
   *
   * <ul>
   * <li>[SPACE, ENTER, RETURN] - Fires the <code>click</code> event if the <code>interactive</code> property is set to true.</li>
   * <li>[SHIFT] - If [SPACE] or [ENTER],[RETURN] is pressed, pressing [SHIFT] releases the ui5-icon without triggering the click event.</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Icon.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.Icon
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-icon
   * @implements sap.ui.webcomponents.main.IIcon
   * @public
   */

  class Icon extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _IconTemplate.default;
    }

    static get styles() {
      return _Icon.default;
    }

    _onFocusInHandler(event) {
      if (this.interactive) {
        this.focused = true;
      }
    }

    _onFocusOutHandler(event) {
      this.focused = false;
    }

    _onkeydown(event) {
      if (!this.interactive) {
        return;
      }

      if ((0, _Keys.isEnter)(event)) {
        this.fireEvent("click");
      }

      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault(); // prevent scrolling
      }
    }

    _onkeyup(event) {
      if (this.interactive && (0, _Keys.isSpace)(event)) {
        this.fireEvent("click");
      }
    }

    _onClickHandler(event) {
      // prevent the native event and fire custom event to ensure the noConfict "ui5-click" is fired
      event.stopPropagation();
      this.fireEvent("click");
    }
    /**
    * Enforce "ltr" direction, based on the icons collection metadata.
    */


    get _dir() {
      return this.ltr ? "ltr" : undefined;
    }

    get effectiveAriaHidden() {
      if (this.ariaHidden === "") {
        if (this.isDecorative) {
          return true;
        }

        return;
      }

      return this.ariaHidden;
    }

    get tabIndex() {
      return this.interactive ? "0" : undefined;
    }

    get isDecorative() {
      return this.effectiveAccessibleRole === PRESENTATION_ROLE;
    }

    get effectiveAccessibleRole() {
      if (this.accessibleRole) {
        return this.accessibleRole;
      }

      if (this.interactive) {
        return "button";
      }

      return this.effectiveAccessibleName ? "img" : PRESENTATION_ROLE;
    }

    async onBeforeRendering() {
      const name = this.name;

      if (!name) {
        /* eslint-disable-next-line */
        return console.warn("Icon name property is required", this);
      }

      let iconData = (0, _Icons.getIconDataSync)(name);

      if (!iconData) {
        iconData = await (0, _Icons.getIconData)(name);
      }

      if (iconData === ICON_NOT_FOUND) {
        this.invalid = true;
        /* eslint-disable-next-line */

        return console.warn(`Required icon is not registered. You can either import the icon as a module in order to use it e.g. "@ui5/webcomponents-icons/dist/${name.replace("sap-icon://", "")}.js", or setup a JSON build step and import "@ui5/webcomponents-icons/dist/AllIcons.js".`);
      }

      if (!iconData) {
        this.invalid = true;
        /* eslint-disable-next-line */

        return console.warn(`Required icon is not registered. Invalid icon name: ${this.name}`);
      } // in case a new valid name is set, show the icon


      this.invalid = false;
      this.pathData = iconData.pathData;
      this.accData = iconData.accData;
      this.ltr = iconData.ltr;
      this.packageName = iconData.packageName;
      this._onclick = this.interactive ? this._onClickHandler.bind(this) : undefined;
      this._onfocusout = this.interactive ? this._onFocusOutHandler.bind(this) : undefined;
      this._onfocusin = this.interactive ? this._onFocusInHandler.bind(this) : undefined;

      if (this.accessibleName) {
        this.effectiveAccessibleName = this.accessibleName;
      } else if (this.accData) {
        const i18nBundle = await (0, _i18nBundle.getI18nBundle)(this.packageName);
        this.effectiveAccessibleName = i18nBundle.getText(this.accData) || undefined;
      }
    }

    get hasIconTooltip() {
      return this.showTooltip && this.effectiveAccessibleName;
    }

  }

  Icon.define();
  var _default = Icon;
  _exports.default = _default;
});