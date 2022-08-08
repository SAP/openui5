sap.ui.define(["exports", "../FeaturesRegistry", "../Keys", "../util/FocusableElements"], function (_exports, _FeaturesRegistry, _Keys, _FocusableElements) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class F6Navigation {
    init() {
      this.keydownHandler = this._keydownHandler.bind(this);
      this.attachEventListeners();
      this.selectedGroup = null;
      this.groups = [];
    }

    attachEventListeners() {
      document.addEventListener("keydown", this.keydownHandler);
    }

    async _keydownHandler(event) {
      if ((0, _Keys.isF6Next)(event)) {
        this.updateGroups();

        if (this.groups.length < 1) {
          return;
        }

        event.preventDefault();
        const nextIndex = this.groups.indexOf(this.selectedGroup);
        let nextElement = null;

        if (nextIndex > -1) {
          if (nextIndex + 1 >= this.groups.length) {
            nextElement = this.groups[0];
          } else {
            nextElement = this.groups[nextIndex + 1];
          }
        } else {
          nextElement = this.groups[0];
        }

        const elementToFocus = await (0, _FocusableElements.getFirstFocusableElement)(nextElement.isUI5Element ? nextElement.getDomRef() : nextElement, true);
        elementToFocus.focus();
      }

      if ((0, _Keys.isF6Previous)(event)) {
        this.updateGroups();

        if (this.groups.length < 1) {
          return;
        }

        event.preventDefault();
        const nextIndex = this.groups.indexOf(this.selectedGroup);
        let nextElement = null;

        if (nextIndex > -1) {
          if (nextIndex - 1 < 0) {
            nextElement = this.groups[this.groups.length - 1];
          } else {
            // Handle the situation where the first focusable element of two neighbor groups is the same
            // For example:
            // <ui5-flexible-column-layout>
            //     <ui5-list>
            //         <ui5-li>List Item</ui5-li>
            //     </ui5-list>
            // </ui5-flexible-column-layout>
            // Here for both FCL & List the firstFoccusableElement is the same (the ui5-li)
            const firstFocusable = await (0, _FocusableElements.getFirstFocusableElement)(this.groups[nextIndex - 1], true);
            const shouldSkipParent = firstFocusable === (await (0, _FocusableElements.getFirstFocusableElement)(this.groups[nextIndex], true));
            nextElement = this.groups[shouldSkipParent ? nextIndex - 2 : nextIndex - 1];
          }
        } else {
          nextElement = this.groups[this.groups.length - 1];
        }

        const elementToFocus = await (0, _FocusableElements.getFirstFocusableElement)(nextElement.isUI5Element ? nextElement.getDomRef() : nextElement, true);
        elementToFocus.focus();
      }
    }

    removeEventListeners() {
      document.removeEventListener("keydown", this.keydownHandler);
    }

    updateGroups() {
      this.setSelectedGroup(document.activeElement);
      this.setGroups();
    }

    setGroups() {
      this.groups = Array.from(document.querySelectorAll("[data-sap-ui-fastnavgroup='true']")).filter(group => group.clientWidth && window.getComputedStyle(group).visibility !== "hidden");
    }

    setSelectedGroup(element) {
      while (element && element.getAttribute("data-sap-ui-fastnavgroup") !== "true" && element !== document.querySelector("html")) {
        element = element.parentElement ? element.parentNode : element.parentNode.host;
      }

      this.selectedGroup = element;
    }

    destroy() {
      this.removeEventListeners();
    }

  }

  const F6HelperInstance = new F6Navigation();
  (0, _FeaturesRegistry.registerFeature)("F6Navigation", F6HelperInstance);
  var _default = F6Navigation;
  _exports.default = _default;
});