sap.ui.define([
	"./testframe"
], function(main) {
	"use strict";

	var request = new XMLHttpRequest();
	request.open('HEAD', '/snippix');
	request.onreadystatechange = function() {
		if (this.readyState == this.DONE && this.status == 200) {
			document.getElementById("snippixButton").style.display = "block";
		}
	};
	request.send();

	function onChangeLayoutClick(oEvent) {
		var sLayout = oEvent.currentTarget.dataset.layout;
		if ( sLayout ) {
			main.setFrameLayout(sLayout);
		}
	}

	var aLayoutButtons = document.querySelectorAll("img.btn[data-layout]");
	for ( var i = 0; i < aLayoutButtons.length; i++) {
		aLayoutButtons[i].addEventListener("click", onChangeLayoutClick);
	}
	document.getElementById("snippixButton").addEventListener("click", function() {
		main.editInSnippix();
	});
	document.getElementById("jsunit").addEventListener("click", function() {
		main.redirectToTestrunner();
	});

});
