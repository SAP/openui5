sap.ui.define([], function() {
	"use strict";

	return function LoadingIndicator(sCaption, sAdditionalText) {
		var loading = document.createElement("div");
		loading.innerText = sCaption || "Discovering and loading all libraries and controls... this will take a while... ";
		loading.style.margin = "16px";
		var loadingNow = document.createElement("span");
		loading.appendChild(loadingNow);
		document.body.insertBefore(loading, document.body.firstChild);

		if (sAdditionalText) {
			var br = document.createElement("br");
			loading.appendChild(br);
			br = document.createElement("br");
			loading.appendChild(br);
			var additionalText = document.createElement("span");
			additionalText.innerText = sAdditionalText;
			loading.appendChild(additionalText);
		}

		this.update = function(sText) {
			loadingNow.innerText = sText;
		};

		this.hide = function() {
			loading.style.display = "none";
		};
	};

});
