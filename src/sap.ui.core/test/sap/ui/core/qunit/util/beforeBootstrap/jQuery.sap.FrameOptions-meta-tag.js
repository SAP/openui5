(function () {
	"use strict";

	var oMetadata = document.createElement('meta');
	oMetadata.setAttribute('name', 'sap.whitelistService');
	oMetadata.setAttribute('content', '/url/to/service/via/meta/tag');
	document.head.appendChild(oMetadata);

}());

