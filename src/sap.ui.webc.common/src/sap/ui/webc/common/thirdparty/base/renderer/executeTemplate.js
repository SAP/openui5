sap.ui.define(["exports", "../CustomElementsScopeUtils"], function (_exports, _CustomElementsScopeUtils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * Runs a component's template with the component's current state, while also scoping HTML
   *
   * @param template - the template to execute
   * @param component - the component
   * @public
   * @returns {*}
   */
  const executeTemplate = (template, component) => {
    const tagsToScope = getTagsToScope(component);
    const scope = (0, _CustomElementsScopeUtils.getCustomElementsScopingSuffix)();
    return template(component, tagsToScope, scope);
  };
  /**
   * Returns all tags, used inside component's template subject to scoping.
   * @param component - the component
   * @returns {Array[]}
   * @private
   */


  const getTagsToScope = component => {
    const componentTag = component.constructor.getMetadata().getPureTag();
    const tagsToScope = component.constructor.getUniqueDependencies().map(dep => dep.getMetadata().getPureTag()).filter(_CustomElementsScopeUtils.shouldScopeCustomElement);

    if ((0, _CustomElementsScopeUtils.shouldScopeCustomElement)(componentTag)) {
      tagsToScope.push(componentTag);
    }

    return tagsToScope;
  };

  var _default = executeTemplate;
  _exports.default = _default;
});