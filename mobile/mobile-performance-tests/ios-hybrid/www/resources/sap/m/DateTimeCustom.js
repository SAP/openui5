/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

(function($) {

	var oCore = sap.ui.getCore(),
		oLocale = sap.m.getLocale(),
		sLanguage = oLocale.getLanguage(),
		oLocaleData = sap.m.getLocaleData(),
		oResourceBundle = oCore.getLibraryResourceBundle("sap.m"),
		_ = function(sText) {
			return oResourceBundle.getText("MOBISCROLL_" + sText);
		},
		sOS = "",
		sJsPath = "sap.ui.thirdparty.mobiscroll.js.",
		sCssPath = $.sap.getModulePath("sap.ui.thirdparty.mobiscroll", "/css/"),
		oDefaults = {
			theme : "",
			mode : "scroller",
			display : "modal",
			endYear : new Date().getFullYear() + 10,
			lang : sLanguage
		},
		oi18n = {
			setText : _("SET"),
			cancelText : _("CANCEL"),
			monthText : _("MONTH"),
			dayText : _("DAY"),
			yearText : _("YEAR"),
			hourText : _("HOURS"),
			minuteText : _("MINUTES"),
			secText : _("SECONDS"),
			nowText : _("NOW"),
			dayNames : oLocaleData.getDays("wide"),
			dayNamesShort : oLocaleData.getDays("abbreviated"),
			monthNames : oLocaleData.getMonths("wide"),
			monthNamesShort : oLocaleData.getMonths("abbreviated")
		};

	// check os then do the required settings
	if ($.os.ios) {
		sOS = "ios";
		oDefaults.display = "bubble";
	} else if ($.os.android) {
		sOS = "android-ics";
	}

	// inject resources
	$.sap.includeStyleSheet(sCssPath + "mobiscroll-core.css");
	$.sap.require(sJsPath + "mobiscroll-core");
	$.sap.require(sJsPath + "mobiscroll-datetime");
	if (sOS) {
		oDefaults.theme = ($.os.android) ? sOS + " light" : sOS;
		$.sap.includeStyleSheet(sCssPath + "mobiscroll-" + sOS + ".css");
		$.sap.require(sJsPath + "mobiscroll-" + sOS);
	}

	$.scroller.i18n[sLanguage] = $.extend(oi18n);
	$.scroller.setDefaults(oDefaults);

})(jQuery);