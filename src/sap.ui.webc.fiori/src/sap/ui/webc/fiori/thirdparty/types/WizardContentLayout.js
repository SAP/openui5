sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Enumeration for different content layouts of the <code>ui5-wizard</code>.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.WizardContentLayout
   */
  var WizardContentLayout;
  (function (WizardContentLayout) {
    /**
      * Display the content of the <code>ui5-wizard</code> as multiple steps in a scroll section.
     * @public
     * @type {MultipleSteps}
     */
    WizardContentLayout["MultipleSteps"] = "MultipleSteps";
    /**
      * Display the content of the <code>ui5-wizard</code> as single step.
     * @public
     * @type {SingleStep}
     */
    WizardContentLayout["SingleStep"] = "SingleStep";
  })(WizardContentLayout || (WizardContentLayout = {}));
  var _default = WizardContentLayout;
  _exports.default = _default;
});