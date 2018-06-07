$(document).ready(function () {
	var sGermanyFlagInitialWidth = $("#ui5ConGermany").css("width"),
		sBangaloreInitialFlagWidth = $("#ui5ConBangalore").css("width"),
		iGermanyFlagInitialWidthPx = $("#ui5ConGermany").outerWidth(),
		iGermanyFlagInitialHeightPx = $("#ui5ConGermany").outerHeight(),
		iBangaloreInitialFlagWidthPx = $("#ui5ConBangalore").outerWidth(),
		iBangaloreInitialFlagHeightPx = $("#ui5ConBangalore").outerHeight();

	$("#ui5ConGermany").hover(function () {
		_flagAnimate ("germany");
	}).mouseleave(function () {
		_flagReset();
	});

	$("#ui5ConBangalore").hover(function () {
		_flagAnimate ("bangalore");
	}).mouseleave(function () {
		_flagReset();
	});

	_flagAnimate = function (sFlag) {

		if (sFlag === "germany") {
			$("#ui5ConGermany").css("width", "100%");
			$("#ui5ConBangalore").css("width", "70%");
		} else {
			$("#ui5ConGermany").css("width", "70%");
			$("#ui5ConBangalore").css("width", "100%");
		}
		var iGermanyFlagWidthPx = $("#ui5ConGermany").outerWidth(),
			iGermanyFlagHeightPx = $("#ui5ConGermany").outerHeight(),
			iBangaloreFlagWidthPx = $("#ui5ConBangalore").outerWidth(),
			iBangaloreFlagHeightPx = $("#ui5ConBangalore").outerHeight();

		$("#ui5ConGermany").css("left", (iGermanyFlagInitialWidthPx - iGermanyFlagWidthPx)/4 + "px")
			.css("top", (iGermanyFlagInitialHeightPx - iGermanyFlagHeightPx)/4 + "px");

		$("#ui5ConBangalore").css("right", (iBangaloreInitialFlagWidthPx - iBangaloreFlagWidthPx)/4 + "px")
			.css("bottom", (iBangaloreInitialFlagHeightPx - iBangaloreFlagHeightPx)/4 + "px");
	}

	_flagReset = function () {
		$("#ui5ConGermany").css("width", sGermanyFlagInitialWidth)
			.css("left", 0)
			.css("top", 0);
		$("#ui5ConBangalore").css("width", sBangaloreInitialFlagWidth)
			.css("right", 0)
			.css("bottom", 0);
	}

});


