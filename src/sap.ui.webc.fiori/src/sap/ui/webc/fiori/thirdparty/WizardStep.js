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
    tag: "ui5-wizard-step",
    properties:
    /** @lends sap.ui.webcomponents.fiori.WizardStep.prototype */
    {
      /**
       * Defines the <code>titleText</code> of the step.
       * <br><br>
       *
       * <b>Note:</b> The text is displayed in the <code>ui5-wizard</code> navigation header.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.0.0-rc.15
       */
      titleText: {
        type: String
      },

      /**
       * Defines the <code>subtitleText</code> of the step.
       * <br><br>
       *
       * <b>Note:</b> the text is displayed in the <code>ui5-wizard</code> navigation header.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.0.0-rc.15
       */
      subtitleText: {
        type: String
      },

      /**
       * Defines the <code>icon</code> of the step.
       * <br><br>
       *
       * <b>Note:</b> The icon is displayed in the <code>ui5-wizard</code> navigation header.
       * <br><br>
       *
       * The SAP-icons font provides numerous options.
       * See all the available icons in the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      icon: {
        type: String
      },

      /**
       * Defines if the step is <code>disabled</code>. When disabled the step is displayed,
       * but the user can't select the step by clicking or navigate to it with scrolling.
       * <br><br>
       *
       * <b>Note:</b> Step can't be <code>selected</code> and <code>disabled</code> at the same time.
       * In this case the <code>selected</code> property would take precedence.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disabled: {
        type: Boolean
      },

      /**
       * Defines the step's <code>selected</code> state - the step that is currently active.
       * <br><br>
       *
       * <b>Note:</b> Step can't be <code>selected</code> and <code>disabled</code> at the same time.
       * In this case the <code>selected</code> property would take precedence.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      selected: {
        type: Boolean
      },

      /**
       * When <code>branching</code> is enabled a dashed line would be displayed after the step,
       * meant to indicate that the next step is not yet known and depends on user choice in the current step.
       * <br><br>
       *
       * <b>Note:</b> It is recommended to use <code>branching</code> on the last known step
       * and later add new steps when it becomes clear how the wizard flow should continue.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      branching: {
        type: Boolean
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.fiori.WizardStep.prototype */
    {
      /**
       * Defines the step content.
       * @type {Node[]}
       * @slot
       * @public
       */
      "default": {
        type: Node
      }
    },
    events:
    /** @lends sap.ui.webcomponents.fiori.WizardStep.prototype */
    {}
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * A component that represents a logical step as part of the <code>ui5-wizard</code>.
   * It is meant to aggregate arbitrary HTML elements that form the content of a single step.
   *
   * <h3>Structure</h3>
   * <ul>
   * <li>Each wizard step has arbitrary content.</li>
   * <li>Each wizard step might have texts - defined by the <code>titleText</code> and <code>subtitleText</code> properties.</li>
   * <li>Each wizard step might have an icon - defined by the <code>icon</code> property.</li>
   * <li>Each wizard step might display a number in place of the <code>icon</code>, when it's missing.</li>
   * </ul>
   *
   * <h3>Usage</h3>
   * The <code>ui5-wizard-step</code> component should be used only as slot of the <code>ui5-wizard</code> component
   * and should not be used standalone.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.WizardStep
   * @extends UI5Element
   * @tagname ui5-wizard-step
   * @since 1.0.0-rc.10
   * @implements sap.ui.webcomponents.fiori.IWizardStep
   * @public
   */

  class WizardStep extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

  }

  WizardStep.define();
  var _default = WizardStep;
  _exports.default = _default;
});