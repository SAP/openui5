(function() {
	if (window.parent === window && !/(?:\?|&)sap-ui-xx-standalone(?:=(?:true|x|X))?(?:&|$)/.test(window.location.search)) {
		var url = document.location.href.replace("/docs/", "/#docs/");
		window.location.replace(url);
	}
}());