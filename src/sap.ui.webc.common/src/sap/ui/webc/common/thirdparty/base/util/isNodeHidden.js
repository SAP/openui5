sap.ui.define(function () { 'use strict';

	const isNodeHidden = node => {
		if (node.nodeName === "SLOT") {
			return false;
		}
		return (node.offsetWidth <= 0 && node.offsetHeight <= 0) || node.style.visibility === "hidden";
	};

	return isNodeHidden;

});
