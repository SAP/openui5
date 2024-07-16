function selectParentPage(url) {
	location.href = url;
}
function selectChildPage(url) {
	document.getElementById("currentChild").innerHTML = url;
	if (url == "sameorigin_denied.html" || url == "allowlistservice_allowed.html" ||
		url == "allowlistservice_denied.html" || url == "allowlistservice_inactive.html" ||
		url == "allowlistservice_metatag_allowed.html" || url == "allowlistservice_metatag_denied.html") {
		url = location.protocol + "//" + location.hostname.substr(0,location.hostname.indexOf(".")) + ":" +
			location.port + location.pathname.substr(0,location.pathname.lastIndexOf("/") + 1) + url;
	}
	document.getElementById("iframe").src = url;
}