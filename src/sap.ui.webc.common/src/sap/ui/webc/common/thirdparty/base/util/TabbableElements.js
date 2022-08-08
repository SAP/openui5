sap.ui.define(["exports", "./isNodeTabbable"], function (_exports, _isNodeTabbable) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getTabbableElements = _exports.getLastTabbableElement = void 0;
  _isNodeTabbable = _interopRequireDefault(_isNodeTabbable);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  const getTabbableElements = node => {
    return getTabbables(node.children);
  };

  _exports.getTabbableElements = getTabbableElements;

  const getLastTabbableElement = node => {
    const tabbables = getTabbables(node.children);
    return tabbables.length ? tabbables[tabbables.length - 1] : null;
  };

  _exports.getLastTabbableElement = getLastTabbableElement;

  const getTabbables = (nodes, tabbables) => {
    const tabbablesNodes = tabbables || [];

    if (!nodes) {
      return tabbablesNodes;
    }

    Array.from(nodes).forEach(currentNode => {
      if (currentNode.nodeType === Node.TEXT_NODE || currentNode.nodeType === Node.COMMENT_NODE || currentNode.hasAttribute("data-sap-no-tab-ref")) {
        return;
      }

      if (currentNode.shadowRoot) {
        // get the root node of the ShadowDom (1st none style tag)
        const children = currentNode.shadowRoot.children;
        currentNode = Array.from(children).find(node => node.tagName !== "STYLE");
      }

      if (!currentNode) {
        return;
      }

      if ((0, _isNodeTabbable.default)(currentNode)) {
        tabbablesNodes.push(currentNode);
      }

      if (currentNode.tagName === "SLOT") {
        getTabbables(currentNode.assignedNodes(), tabbablesNodes);
      } else {
        getTabbables(currentNode.children, tabbablesNodes);
      }
    });
    return tabbablesNodes;
  };
});