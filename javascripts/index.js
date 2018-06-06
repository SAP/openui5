$(document).ready(function () {
	var sGermanyFlagInitialWidth = $("#ui5ConGermany").css("width"),
		sBangaloreInitialFlagWidth = $("#ui5ConBangalore").css("width"),
		iGermanyFlagInitialWidthPx = $("#ui5ConGermany").outerWidth(),
		iGermanyFlagInitialHeightPx = $("#ui5ConGermany").outerHeight(),
		iBangaloreInitialFlagWidthPx = $("#ui5ConBangalore").outerWidth(),
		iBangaloreInitialFlagHeightPx = $("#ui5ConBangalore").outerHeight();

	$("#ui5ConGermany").hover(function () {

		$("#ui5ConGermany").css("width", "100%");
		$("#ui5ConBangalore").css("width", "70%");

		var iGermanyFlagWidthPx = $("#ui5ConGermany").outerWidth(),
			iGermanyFlagHeightPx = $("#ui5ConGermany").outerHeight(),
			iBangaloreFlagWidthPx = $("#ui5ConBangalore").outerWidth(),
		iBangaloreFlagHeightPx = $("#ui5ConBangalore").outerHeight();

		$("#ui5ConGermany").css("left", (iGermanyFlagInitialWidthPx - iGermanyFlagWidthPx)/4 + "px")
			.css("top", (iGermanyFlagInitialHeightPx - iGermanyFlagHeightPx)/4 + "px");

		$("#ui5ConBangalore").css("right", (iBangaloreInitialFlagWidthPx - iBangaloreFlagWidthPx)/4 + "px")
			.css("bottom", (iBangaloreInitialFlagHeightPx - iBangaloreFlagHeightPx)/4 + "px");
	}).mouseleave(function () {
		$("#ui5ConGermany").css("width", sGermanyFlagInitialWidth)
			.css("left", 0)
			.css("top", 0);
		$("#ui5ConBangalore").css("width", sBangaloreInitialFlagWidth)
			.css("right", 0)
			.css("bottom", 0);
	});

	$("#ui5ConBangalore").hover(function () {
		$("#ui5ConBangalore").css("width", "100%");
		$("#ui5ConGermany").css("width", "70%");

		var iGermanyFlagWidthPx = $("#ui5ConGermany").outerWidth(),
			iGermanyFlagHeightPx = $("#ui5ConGermany").outerHeight(),
			iBangaloreFlagWidthPx = $("#ui5ConBangalore").outerWidth(),
			iBangaloreFlagHeightPx = $("#ui5ConBangalore").outerHeight();

		$("#ui5ConGermany").css("left", (iGermanyFlagInitialWidthPx - iGermanyFlagWidthPx)/4 + "px")
			.css("top", (iGermanyFlagInitialHeightPx - iGermanyFlagHeightPx)/4 + "px");

		$("#ui5ConBangalore").css("right", (iBangaloreInitialFlagWidthPx - iBangaloreFlagWidthPx)/4 + "px")
			.css("bottom", (iBangaloreInitialFlagHeightPx - iBangaloreFlagHeightPx)/4 + "px");

	}).mouseleave(function () {
		$("#ui5ConGermany").css("width", sGermanyFlagInitialWidth)
			.css("left", 0)
			.css("top", 0);
		$("#ui5ConBangalore").css("width", sBangaloreInitialFlagWidth)
			.css("right", 0)
			.css("bottom", 0);
	});

});


