sap.ui.define([], function() {
	"use strict";

	return function LoadingIndicator(sCaption) {
		var loading = document.createElement("div");
		loading.innerText = sCaption || "Discovering and loading all libraries and controls... this will take a while... ";
		loading.style.margin = "16px";
		var loadingNow = document.createElement("span");
		loading.appendChild(loadingNow);
		document.body.insertBefore(loading, document.body.firstChild);

		this.update = function(sText) {
			loadingNow.innerText = sText;
		};

		this.hide = function() {
			loading.style.display = "none";
		};
	};

});
