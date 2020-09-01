sap.ui.define(['exports'], function (exports) { 'use strict';

	var findNodeOwner = function findNodeOwner(node) {
	  if (!(node instanceof HTMLElement)) {
	    throw new Error("Argument node should be of type HTMLElement");
	  }

	  var ownerTypes = [HTMLHtmlElement, HTMLIFrameElement];
	  var currentShadowRootFlag = true;
	  var currentCustomElementFlag = true;

	  while (node) {
	    if (node.toString() === "[object ShadowRoot]") {
	      // Web Component
	      // or the shadow root of web component with attached shadow root
	      if (currentShadowRootFlag) {
	        currentShadowRootFlag = false;
	      }

	      if (!currentCustomElementFlag && !currentShadowRootFlag) {
	        return node;
	      }
	    } else if (node.tagName && node.tagName.indexOf("-") > -1) {
	      if (currentCustomElementFlag) {
	        currentCustomElementFlag = false;
	      } else {
	        return node;
	      }
	    } else if (ownerTypes.indexOf(node.constructor) > -1) {
	      // Document or Iframe reached
	      return node;
	    }

	    node = node.parentNode || node.host;
	  }
	};

	var getEffectiveAriaLabelText = function getEffectiveAriaLabelText(el) {
	  if (!el.ariaLabelledby) {
	    if (el.ariaLabel) {
	      return el.ariaLabel;
	    }

	    return undefined;
	  }

	  var ids = el.ariaLabelledby.split(" ");
	  var owner = findNodeOwner(el);
	  var result = "";
	  ids.forEach(function (elementId, index) {
	    var element = owner.querySelector("[id='".concat(elementId, "']"));
	    result += "".concat(element ? element.textContent : "");

	    if (index < ids.length - 1) {
	      result += " ";
	    }
	  });
	  return result;
	};

	exports.getEffectiveAriaLabelText = getEffectiveAriaLabelText;

});
//# sourceMappingURL=chunk-2e860beb.js.map
