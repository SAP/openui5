sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.shouldIgnoreCustomElement = _exports.ignoreCustomElements = void 0;
  /**
   * The tag prefixes to be ignored.
   */
  const tagPrefixes = [];
  /**
   * Ignores all custom HTML elements with a given tag prefix to improve the rendering performance of the UI5 Web Components.
   * <br>
   *
   * <b>When used:</b> the UI5 Web Components framework treats all custom HTML elements,
   * starting with the given prefix as if they are standard HTML elements, such as: `div`, `span`, etc, without additional processing.
   * <br>
   *
   * <b>When not used:</b> the framework waits for the slotted children to be defined and registered first,
   * because the state or visual appearance of the parent may rely on the slotted elements/children.
   *
   * <b>Note:</b> We recommend using `ignoreCustomElements` when slotting custom HTML elements (with only semantic purpose)
   * inside UI5 Web Components, to improve the time to render.
   *
   * @public
   * @since 1.14.0
   * @param { string } tagPrefix
   */
  const ignoreCustomElements = tagPrefix => {
    if (typeof tagPrefix !== "string" || !tagPrefix.length) {
      throw new Error("Only string characters for a tag prefix.");
    }
    tagPrefixes.push(tagPrefix);
  };
  /**
   * Determines whether custom elements with the given tag should be ignored.
   *
   * @private
   * @param { string } tag
   */
  _exports.ignoreCustomElements = ignoreCustomElements;
  const shouldIgnoreCustomElement = tag => {
    return tagPrefixes.some(pref => tag.startsWith(pref));
  };
  _exports.shouldIgnoreCustomElement = shouldIgnoreCustomElement;
});