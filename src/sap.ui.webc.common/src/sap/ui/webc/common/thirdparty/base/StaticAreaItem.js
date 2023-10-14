sap.ui.define(["exports", "./StaticArea", "./updateShadowRoot", "./Render", "./util/getEffectiveContentDensity", "./CustomElementsScopeUtils", "./locale/getEffectiveDir"], function (_exports, _StaticArea, _updateShadowRoot, _Render, _getEffectiveContentDensity, _CustomElementsScopeUtils, _getEffectiveDir) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _updateShadowRoot = _interopRequireDefault(_updateShadowRoot);
  _getEffectiveContentDensity = _interopRequireDefault(_getEffectiveContentDensity);
  _getEffectiveDir = _interopRequireDefault(_getEffectiveDir);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const pureTagName = "ui5-static-area-item";
  const popupIntegrationAttr = "data-sap-ui-integration-popup-content";
  /**
   *
   * @class
   * @author SAP SE
   * @private
   */
  class StaticAreaItem extends HTMLElement {
    constructor() {
      super();
      this._rendered = false;
      this.attachShadow({
        mode: "open"
      });
    }
    /**
     * @param {UI5Element} ownerElement the UI5Element instance that owns this static area item
     */
    setOwnerElement(ownerElement) {
      this.ownerElement = ownerElement;
      this.classList.add(this.ownerElement._id); // used for getting the popover in the tests
      if (this.ownerElement.hasAttribute("data-ui5-static-stable")) {
        this.setAttribute("data-ui5-stable", this.ownerElement.getAttribute("data-ui5-static-stable")); // stable selector
      }
    }
    /**
     * Updates the shadow root of the static area item with the latest state, if rendered
     */
    update() {
      if (this._rendered) {
        this.updateAdditionalProperties();
        (0, _updateShadowRoot.default)(this.ownerElement, true);
      }
    }
    updateAdditionalProperties() {
      this._updateAdditionalAttrs();
      this._updateContentDensity();
      this._updateDirection();
    }
    /**
     * Sets the correct content density based on the owner element's state
     * @private
     */
    _updateContentDensity() {
      if ((0, _getEffectiveContentDensity.default)(this.ownerElement) === "compact") {
        this.classList.add("sapUiSizeCompact");
        this.classList.add("ui5-content-density-compact");
      } else {
        this.classList.remove("sapUiSizeCompact");
        this.classList.remove("ui5-content-density-compact");
      }
    }
    _updateDirection() {
      if (this.ownerElement) {
        const dir = (0, _getEffectiveDir.default)(this.ownerElement);
        if (dir) {
          this.setAttribute("dir", dir);
        } else {
          this.removeAttribute("dir");
        }
      }
    }
    _updateAdditionalAttrs() {
      this.setAttribute(pureTagName, "");
      this.setAttribute(popupIntegrationAttr, "");
    }
    /**
     * @protected
     * Returns reference to the DOM element where the current fragment is added.
     */
    async getDomRef() {
      this.updateAdditionalProperties();
      if (!this._rendered) {
        this._rendered = true;
        (0, _updateShadowRoot.default)(this.ownerElement, true);
      }
      await (0, _Render.renderFinished)(); // Wait for the content of the ui5-static-area-item to be rendered
      return this.shadowRoot;
    }
    static getTag() {
      const suffix = (0, _CustomElementsScopeUtils.getEffectiveScopingSuffixForTag)(pureTagName);
      if (!suffix) {
        return pureTagName;
      }
      return `${pureTagName}-${suffix}`;
    }
    static createInstance() {
      if (!customElements.get(StaticAreaItem.getTag())) {
        customElements.define(StaticAreaItem.getTag(), StaticAreaItem);
      }
      return document.createElement(this.getTag());
    }
  }
  var _default = StaticAreaItem;
  _exports.default = _default;
});