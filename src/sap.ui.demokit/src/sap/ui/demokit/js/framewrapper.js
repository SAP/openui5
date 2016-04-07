(function() {
	if (window.parent === window) {
		var url = document.location.href.replace("/docs/", "/#docs/");
		window.location.replace(url);
	}
}());