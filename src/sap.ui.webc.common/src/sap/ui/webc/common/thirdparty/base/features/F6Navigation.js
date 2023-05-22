sap.ui.define(["exports", "../FeaturesRegistry", "../Keys", "../UI5Element", "../util/FocusableElements", "../util/getFastNavigationGroups", "../util/isElementClickable"], function (_exports, _FeaturesRegistry, _Keys, _UI5Element, _FocusableElements, _getFastNavigationGroups, _isElementClickable) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _getFastNavigationGroups = _interopRequireDefault(_getFastNavigationGroups);
  _isElementClickable = _interopRequireDefault(_isElementClickable);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  class F6Navigation {
    constructor() {
      this.selectedGroup = null;
      this.groups = [];
      this.keydownHandler = this._keydownHandler.bind(this);
      this.attachEventListeners();
    }
    attachEventListeners() {
      document.addEventListener("keydown", this.keydownHandler);
    }
    async groupElementToFocus(nextElement) {
      const nextElementDomRef = (0, _UI5Element.instanceOfUI5Element)(nextElement) ? nextElement.getDomRef() : nextElement;
      if (nextElementDomRef) {
        if ((0, _isElementClickable.default)(nextElementDomRef)) {
          return nextElementDomRef;
        }
        const elementToFocus = await (0, _FocusableElements.getFirstFocusableElement)(nextElementDomRef);
        if (elementToFocus) {
          return elementToFocus;
        }
      }
    }
    async findNextFocusableGroupElement(currentIndex) {
      let elementToFocus;
      /* eslint-disable no-await-in-loop */
      for (let index = 0; index < this.groups.length; index++) {
        let nextElement;
        if (currentIndex > -1) {
          if (currentIndex + 1 >= this.groups.length) {
            currentIndex = 0;
            nextElement = this.groups[currentIndex];
          } else {
            currentIndex += 1;
            nextElement = this.groups[currentIndex];
          }
        } else {
          currentIndex = 0;
          nextElement = this.groups[currentIndex];
        }
        elementToFocus = await this.groupElementToFocus(nextElement);
        if (elementToFocus) {
          break;
        }
      }
      /* eslint-enable no-await-in-loop */
      return elementToFocus;
    }
    async findPreviousFocusableGroupElement(currentIndex) {
      let elementToFocus;
      /* eslint-disable no-await-in-loop */
      for (let index = 0; index < this.groups.length; index++) {
        let nextElement;
        if (currentIndex > 0) {
          // Handle the situation where the first focusable element of two neighbor groups is the same
          // For example:
          // <ui5-flexible-column-layout>
          //     <ui5-list>
          //         <ui5-li>List Item</ui5-li>
          //     </ui5-list>
          // </ui5-flexible-column-layout>
          // Here for both FCL & List the firstFoccusableElement is the same (the ui5-li)
          const firstFocusable = await this.groupElementToFocus(this.groups[currentIndex - 1]);
          const shouldSkipParent = firstFocusable === (await this.groupElementToFocus(this.groups[currentIndex]));
          currentIndex = shouldSkipParent ? currentIndex - 2 : currentIndex - 1;
          if (currentIndex < 0) {
            currentIndex = this.groups.length - 1;
          }
          nextElement = this.groups[currentIndex];
        } else {
          currentIndex = this.groups.length - 1;
          nextElement = this.groups[currentIndex];
        }
        elementToFocus = await this.groupElementToFocus(nextElement);
        if (elementToFocus) {
          break;
        }
      }
      /* eslint-enable no-await-in-loop */
      return elementToFocus;
    }
    async _keydownHandler(event) {
      const forward = (0, _Keys.isF6Next)(event);
      const backward = (0, _Keys.isF6Previous)(event);
      if (!(forward || backward)) {
        return;
      }
      this.updateGroups();
      if (this.groups.length < 1) {
        return;
      }
      event.preventDefault();
      let elementToFocus;
      if (this.groups.length === 0) {
        elementToFocus = await this.groupElementToFocus(this.groups[0]);
        return elementToFocus?.focus();
      }
      let currentIndex = -1;
      if (this.selectedGroup) {
        currentIndex = this.groups.indexOf(this.selectedGroup);
      }
      if (forward) {
        elementToFocus = await this.findNextFocusableGroupElement(currentIndex);
      }
      if (backward) {
        elementToFocus = await this.findPreviousFocusableGroupElement(currentIndex);
      }
      elementToFocus?.focus();
    }
    removeEventListeners() {
      document.removeEventListener("keydown", this.keydownHandler);
    }
    updateGroups() {
      this.setSelectedGroup();
      this.groups = (0, _getFastNavigationGroups.default)(document.body);
    }
    setSelectedGroup(root = window.document) {
      const htmlElement = window.document.querySelector("html");
      let element = this.deepActive(root);
      while (element && element.getAttribute("data-sap-ui-fastnavgroup") !== "true" && element !== htmlElement) {
        element = element.parentElement ? element.parentNode : element.parentNode.host;
      }
      this.selectedGroup = element;
    }
    deepActive(root) {
      if (root.activeElement && root.activeElement.shadowRoot) {
        return this.deepActive(root.activeElement.shadowRoot);
      }
      return root.activeElement;
    }
    destroy() {
      this.removeEventListeners();
    }
    static init() {
      if (!this._instance) {
        this._instance = new F6Navigation();
      }
      return this._instance;
    }
  }
  (0, _FeaturesRegistry.registerFeature)("F6Navigation", F6Navigation);
  var _default = F6Navigation;
  _exports.default = _default;
});