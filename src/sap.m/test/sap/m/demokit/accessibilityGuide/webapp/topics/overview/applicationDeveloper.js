var sPathToDemoKitLocal = "../../../../../../../../documentation.html#";
var sPathToDemoKit = "../../../../../../../../../#";

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
	document.getElementById("linkToAccessibilityAppDeveloper").href = sPathToDemoKitLocal + "/topic/03b914b46e624b138a6fb1b7cf2049ae";
} else {
	document.getElementById("linkToAccessibilityAppDeveloper").href = sPathToDemoKit + "/topic/03b914b46e624b138a6fb1b7cf2049ae";
}