sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/main/thirdparty/Icon", "./generated/templates/WizardTabTemplate.lit", "./generated/themes/WizardTab.css"], function (_exports, _UI5Element, _LitRenderer, _Keys, _Icon, _WizardTabTemplate, _WizardTab) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Icon = _interopRequireDefault(_Icon);
  _WizardTabTemplate = _interopRequireDefault(_WizardTabTemplate);
  _WizardTab = _interopRequireDefault(_WizardTab);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const metadata = {
    tag: "ui5-wizard-tab",
    properties: /** @lends sap.ui.webcomponents.fiori.WizardTab.prototype */{
      /**
       * Defines the <code>icon</code> of the step.
       * @type {string}
       * @defaultvalue ""
       * @private
       */
      icon: {
        type: String
      },
      /**
       * Defines the <code>titleText</code> of the step.
       * @type {string}
       * @defaultvalue ""
       * @private
       * @since 1.0.0-rc.15
       */
      titleText: {
        type: String
      },
      /**
       * Defines the <code>subtitleText</code> of the step.
       * @type {string}
       * @defaultvalue ""
       * @private
       * @since 1.0.0-rc.15
       */
      subtitleText: {
        type: String
      },
      /**
       * Defines the number that will be displayed in place of the <code>icon</code>, when it's missing.
       * @type {string}
       * @defaultvalue ""
       * @private
       */
      number: {
        type: String
      },
      /**
       * Defines if the step is <code>disabled</code> - the step is not responding to user interaction.
       * @type {boolean}
       * @defaultvalue false
       * @private
       */
      disabled: {
        type: Boolean
      },
      /**
       * Defines if the step is <selected>selected</code>.
       * <br><br>
       *
       * @type {boolean}
       * @defaultvalue false
       * @private
       */
      selected: {
        type: Boolean
      },
      /**
       * Defines if the step's separator is hidden or not.
       * @type {boolean}
       * @defaultvalue false
       * @private
       */
      hideSeparator: {
        type: Boolean
      },
      /**
       * Defines if the step's separator is active or not.
       * @type {boolean}
       * @defaultvalue false
       * @private
       */
      activeSeparator: {
        type: Boolean
      },
      /**
       * Defines if the step's separator is dashed or not.
       * @type {boolean}
       * @defaultvalue false
       * @private
       */
      branchingSeparator: {
        type: Boolean
      },
      /**
       * Defines the tabindex of the step.
       * @type {string}
       * @defaultvalue -1
       * @private
       */
      _tabIndex: {
        type: String,
        defaultValue: "-1"
      },
      _wizardTabAccInfo: {
        type: Object
      }
    },
    slots: /** @lends sap.ui.webcomponents.fiori.WizardTab.prototype */{},
    events: /** @lends sap.ui.webcomponents.fiori.WizardTab.prototype */{
      /**
       * Fired when clicking on none disabled step.
       *
       * @event sap.ui.webcomponents.fiori.WizardTab#selection-change-requested
       * @private
       */
      "selection-change-requested": {}
    }
  };

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * Private component, used internally by the <code>ui5-wizard</code>
   * to represent a "step" in the navigation header of the <code>ui5-wizard</code>.
   *
   * <h3>Usage</h3>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/WizardTab.js";</code> (imported with <ui5-wizard>)
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.WizardTab
   * @extends UI5Element
   * @tagname ui5-wizard-tab
   * @private
   */
  class WizardTab extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get styles() {
      return _WizardTab.default;
    }
    static get template() {
      return _WizardTabTemplate.default;
    }
    static get dependencies() {
      return [_Icon.default];
    }
    _onclick() {
      if (!this.disabled) {
        this.fireEvent("selection-change-requested");
      }
    }
    _onkeyup(event) {
      if (this.disabled) {
        return;
      }
      if (((0, _Keys.isSpace)(event) || (0, _Keys.isEnter)(event)) && !(0, _Keys.isSpaceShift)(event)) {
        event.preventDefault();
        this.fireEvent("selection-change-requested");
      }
    }
    _onfocusin() {
      this.fireEvent("focused");
    }
    get tabIndex() {
      return this._tabIndex;
    }
    get hasTexts() {
      return this.titleText || this.subtitleText;
    }
    get accInfo() {
      return {
        "ariaSetsize": this._wizardTabAccInfo && this._wizardTabAccInfo.ariaSetsize,
        "ariaPosinset": this._wizardTabAccInfo && this._wizardTabAccInfo.ariaPosinset,
        "ariaLabel": this._wizardTabAccInfo && this._wizardTabAccInfo.ariaLabel,
        "ariaCurrent": this.selected ? "true" : undefined,
        "ariaDisabled": this.disabled ? "true" : undefined
      };
    }
  }
  WizardTab.define();
  var _default = WizardTab;
  _exports.default = _default;
});