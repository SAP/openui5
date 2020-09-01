sap.ui.define(['exports'], function (exports) { 'use strict';

	var isNodeHidden = function isNodeHidden(node) {
	  if (node.nodeName === "SLOT") {
	    return false;
	  }

	  return node.offsetWidth <= 0 && node.offsetHeight <= 0 || node.style.visibility === "hidden";
	};

	exports.isNodeHidden = isNodeHidden;

});
//# sourceMappingURL=chunk-fd3246cd.js.map
