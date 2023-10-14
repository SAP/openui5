sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/getSharedResource"], function (_exports, _getSharedResource) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerToolbarItem = _exports.getRegisteredToolbarItem = _exports.getRegisteredStyles = _exports.getRegisteredStaticAreaStyles = _exports.getRegisteredDependencies = void 0;
  _getSharedResource = _interopRequireDefault(_getSharedResource);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const registry = (0, _getSharedResource.default)("ToolbarItem.registry", new Map());
  const registerToolbarItem = ElementClass => {
    registry.set(ElementClass.name, ElementClass);
  };
  _exports.registerToolbarItem = registerToolbarItem;
  const getRegisteredToolbarItem = name => {
    if (!registry.has(name)) {
      throw new Error(`No template found for ${name}`);
    }
    return registry.get(name);
  };
  _exports.getRegisteredToolbarItem = getRegisteredToolbarItem;
  const getRegisteredStyles = () => {
    return [...registry.values()].map(ElementClass => ElementClass.styles);
  };
  _exports.getRegisteredStyles = getRegisteredStyles;
  const getRegisteredStaticAreaStyles = () => {
    return [...registry.values()].map(ElementClass => ElementClass.staticAreaStyles);
  };
  _exports.getRegisteredStaticAreaStyles = getRegisteredStaticAreaStyles;
  const getRegisteredDependencies = () => {
    return [...registry.values()].map(ElementClass => ElementClass.dependencies).flat();
  };
  _exports.getRegisteredDependencies = getRegisteredDependencies;
});