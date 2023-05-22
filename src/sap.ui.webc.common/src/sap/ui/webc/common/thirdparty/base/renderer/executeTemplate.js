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
   */
  const executeTemplate = (template, component) => {
    const tagsToScope = getTagsToScope(component);
    const scope = (0, _CustomElementsScopeUtils.getCustomElementsScopingSuffix)();
    return template.call(component, component, tagsToScope, scope);
  };
  /**
   * Returns all tags, used inside component's template subject to scoping.
   * @param component - the component
   * @returns {Array[]}
   * @private
   */
  const getTagsToScope = component => {
    const ctor = component.constructor;
    const componentTag = ctor.getMetadata().getPureTag();
    const tagsToScope = ctor.getUniqueDependencies().map(dep => dep.getMetadata().getPureTag()).filter(_CustomElementsScopeUtils.shouldScopeCustomElement);
    if ((0, _CustomElementsScopeUtils.shouldScopeCustomElement)(componentTag)) {
      tagsToScope.push(componentTag);
    }
    return tagsToScope;
  };
  var _default = executeTemplate;
  _exports.default = _default;
});