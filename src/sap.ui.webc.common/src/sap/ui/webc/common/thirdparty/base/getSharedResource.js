sap.ui.define(["exports", "./util/getSingletonElementInstance"], function (_exports, _getSingletonElementInstance) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _getSingletonElementInstance = _interopRequireDefault(_getSingletonElementInstance);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const getMetaDomEl = () => {
    const el = document.createElement("meta");
    el.setAttribute("name", "ui5-shared-resources");
    el.setAttribute("content", ""); // attribute "content" should be present when "name" is set.
    return el;
  };
  const getSharedResourcesInstance = () => {
    if (typeof document === "undefined") {
      return null;
    }
    return (0, _getSingletonElementInstance.default)(`meta[name="ui5-shared-resources"]`, document.head, getMetaDomEl);
  };
  /**
   * Use this method to initialize/get resources that you would like to be shared among UI5 Web Components runtime instances.
   * The data will be accessed via a singleton "ui5-shared-resources" HTML element in the "body" element of the page.
   *
   * @public
   * @param namespace Unique ID of the resource, may contain "." to denote hierarchy
   * @param initialValue Object or primitive that will be used as an initial value if the resource does not exist
   * @returns {*}
   */
  const getSharedResource = (namespace, initialValue) => {
    const parts = namespace.split(".");
    let current = getSharedResourcesInstance();
    if (!current) {
      return initialValue;
    }
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const lastPart = i === parts.length - 1;
      if (!Object.prototype.hasOwnProperty.call(current, part)) {
        current[part] = lastPart ? initialValue : {};
      }
      current = current[part];
    }
    return current;
  };
  var _default = getSharedResource;
  _exports.default = _default;
});