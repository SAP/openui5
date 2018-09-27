window.onerror = function() {
	"use strict";
	console.log("ok"); // eslint-disable-line no-console
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
	// read access to property
	oComputedStyle.width;
	// read access via function call
	oComputedStyle.getPropertyValue('width');
};