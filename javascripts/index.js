/*$(document).ready(function() {
	var oImage = $("#ui5ConSticker");
	$(".map-areas area").mouseenter(function() {
		var iId = $(".map-areas area").index(this);
			iId === 0 ? oImage.attr("src", "../openui5/images/UI5con_germany.png") : oImage.attr("src", "../openui5/images/UI5con_bangalore.png");
	}).mouseleave(function () {
		oImage.attr("src", "../openui5/images/UI5con_world.png");
	});
});