sap.ui.define(['exports', './chunk-fd3246cd'], function (exports, __chunk_18) { 'use strict';

	var isNodeTabbable = function isNodeTabbable(node) {
	  if (!node) {
	    return false;
	  }

	  var nodeName = node.nodeName.toLowerCase();

	  if (node.hasAttribute("data-sap-no-tab-ref")) {
	    return false;
	  }

	  if (__chunk_18.isNodeHidden(node)) {
	    return false;
	  }

	  if (nodeName === "a" || /input|select|textarea|button|object/.test(nodeName)) {
	    return !node.disabled;
	  }

	  var tabIndex = node.getAttribute("tabindex");

	  if (tabIndex !== null && tabIndex !== undefined) {
	    return parseInt(tabIndex) >= 0;
	  }
	};

	var getTabbableElements = function getTabbableElements(node) {
	  return getTabbables(node.children);
	};

	var getLastTabbableElement = function getLastTabbableElement(node) {
	  var tabbables = getTabbables(node.children);
	  return tabbables.length ? tabbables[tabbables.length - 1] : null;
	};

	var getTabbables = function getTabbables(nodes, tabbables) {
	  var tabbablesNodes = tabbables || [];

	  if (!nodes) {
	    return tabbablesNodes;
	  }

	  Array.from(nodes).forEach(function (currentNode) {
	    if (currentNode.nodeType === Node.TEXT_NODE || currentNode.nodeType === Node.COMMENT_NODE) {
	      return;
	    }

	    if (currentNode.shadowRoot) {
	      // get the root node of the ShadowDom (1st none style tag)
	      var children = currentNode.shadowRoot.children;
	      currentNode = Array.from(children).find(function (node) {
	        return node.tagName !== "STYLE";
	      });
	    }

	    if (isNodeTabbable(currentNode)) {
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

	exports.getTabbableElements = getTabbableElements;
	exports.getLastTabbableElement = getLastTabbableElement;

});
//# sourceMappingURL=chunk-124ca1de.js.map
