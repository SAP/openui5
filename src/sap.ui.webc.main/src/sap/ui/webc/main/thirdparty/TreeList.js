sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "./List"], function (_exports, _customElement, _List) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _List = _interopRequireDefault(_List);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  let TreeList = class TreeList extends _List.default {
    /*
     * @override
     */
    getItems(includeCollapsed = false) {
      const slottedItems = this.getSlottedNodes("items");
      const flatItems = [];
      flattenTree(slottedItems, flatItems, includeCollapsed);
      return flatItems;
    }
    getItemsForProcessing() {
      return this.getItems(true);
    }
  };
  TreeList = __decorate([(0, _customElement.default)("ui5-tree-list")], TreeList);
  /*
   * Converts a tree structure into a flat array
   *
   * @param {Array} treeItems
   * @param {Array} result
   * @param {Boolean} includeCollapsed
   */
  const flattenTree = (items, result, includeCollapsed = false) => {
    items.forEach(item => {
      result.push(item);
      if ((item.expanded || includeCollapsed) && item.items) {
        flattenTree(item.items, result, includeCollapsed);
      }
    });
  };
  TreeList.define();
  var _default = TreeList;
  _exports.default = _default;
});