sap.ui.define(["sap/ui/core/library", "sap/m/Title", "sap/base/util/uid", "sap/ui/thirdparty/jquery"], function(coreLibrary, Title, uid, jQuery) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function addTest(sText, oControl){
		var sId = uid();
		jQuery("body").append("<h3 class='subheader'>" + sText + "</h3><div id='" + sId + "' class='uiarea'></div><div role='separator' aria-orientation='horizontal' class='separator'></div>");
		oControl.placeAt(sId);
	}

	for (var level in TitleLevel) {
		var sText = " with " + (level == TitleLevel.Auto ? "unspecified semantic level" : "semantic level " + level);
		addTest("Title" + sText, new Title({
			text: "This is the title control" + sText,
			level: level
		}));
	}
});
