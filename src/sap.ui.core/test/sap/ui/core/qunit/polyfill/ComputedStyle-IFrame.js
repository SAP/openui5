window.onerror = function() {
	"use strict";
	console.log("ok");
	if (parent.onerror) {
		// Forward the call to the parent frame
		return parent.onerror.apply(parent, arguments);
	} else {
		return false;
	}
};

window.onload = function() {
	"use strict";
	var oComputedStyle = window.getComputedStyle(document.body);
	var sTestProperty = oComputedStyle.width;
	var sTestFunction = oComputedStyle.getPropertyValue('width');
};