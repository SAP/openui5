var aLocales = [
	"ar_SA",
	"de_DE",
	"da_DK",
	"en_GB",
	"en_US",
	"es_MX",
	"es_ES",
	"fa_IR",
	"fr_FR",
	"ja_JP",
	"id_ID",
	"it_IT",
	"ro_RO",
	"ru_RU",
	"pt_BR",
	"hi_IN",
	"he_IL",
	"tr_TR",
	"nl_NL",
	"pl_PL",
	"ko_KR",
	"zh_SG",
	"zh_TW",
	"zh_CN"
];

var aRTLLocales = [
	"ar_SA",
	"fa_IR",
	"he_IL"
];

sap.m.ListItemBase.extend("LocaleListItem", {
	metadata: {
		properties: {
			locale: {type: "string"},
			text: {type: "string"}
		}
	},
	renderer: function(oRM, oControl) {
		var sLocale = oControl.getLocale(),
			sText = oControl.getText();
		oRM.write("<div ")
		oRM.writeControlData(oControl);
		oRM.write("style=\"display:flex;align-items:center;height:40px;\">")			
		oRM.write("<img title=\"" + sLocale + "\" src=\"flags/" + sLocale.substr(3) + ".png\" style=\"width:30px;margin:10px\" />");
		oRM.write("<span " );
		if (aRTLLocales.indexOf(sLocale) >= 0) {
			oRM.write("dir=\"rtl\"");
		}
		oRM.write(">");
		oRM.writeEscaped(sText);
		oRM.write("</span>")
		oRM.write("</div>");
	}
});

function indent(iDepth) {
	var sResult = "";
	for (var i = 0; i < iDepth; i++) {
		sResult += " ";
	}
	return sResult;
}
function formatValue(oValue, sResult) {
	switch(typeof oValue) {
		case "string":
			return "\"" + oValue + "\"";
			break;
		default:
			return oValue;
	}
}
function formatObject(oObject, bFormatted, iDepth, sResult) {
	var sName, oValue, bFirst = true;
	if (!iDepth) iDepth = 0;
	if (!sResult) sResult = "";
	if (Array.isArray(oObject)) {
		sResult += "[";
		for (var i = 0; i < oObject.length; i++) {
			oValue = oObject[i];
			if (bFirst) {
				bFirst = false;
			} else {
				sResult += "," + (bFormatted ? " " : "");
			}
			sResult += formatValue(oValue);
		}
		sResult += "]";
	} else {
		sResult += "{" + (bFormatted ? "\n" : "");
		for (sName in oObject) {
			oValue = oObject[sName];
			if (bFirst) {
				bFirst = false;
			} else {
				sResult += "," + (bFormatted ? "\n" : "");
			}
			if (bFormatted) sResult += indent(iDepth + 1);
			sResult += sName + ":" + (bFormatted ? " " : "");
			if (typeof oValue === "object") {
				sResult += formatObject(oValue, bFormatted, iDepth + 1);
			} else {
				sResult += formatValue(oValue);
			}
		}
		sResult += (bFormatted ? "\n" : "");
		if (bFormatted) sResult += indent(iDepth - 1);
		sResult += "}";
	}
	return sResult;
}


sap.ui.model.SimpleType.extend("Options", {
	parseValue: function(sValue) {
		var oFormatOptions = jQuery.sap.parseJS(sValue);
		return oFormatOptions;
	},
	formatValue: function(oValue) {
		return formatObject(oValue, true);
	},
	validateValue: function() {
		return true;
	}
})

sap.ui.model.CompositeType.extend("HashParams", {
	constructor : function(aParams) {
		sap.ui.model.CompositeType.apply(this, arguments);
		this.sName = "HashParams";
		this.aParams = aParams;
		this.bUseRawValues = true;
	},
	parseValue: function(sValue) {
		var aParts = sValue.substr(1).split("&"),
			oParams = {}, aParams;
		aParts.forEach(function(oParam) {
			var aSplit = oParam.split("="),
				sName = aSplit[0],
				vValue = aSplit[1];
			if (sName === "formatOptions") {
				vValue = jQuery.sap.parseJS(vValue);
			} 
			if (sName === "date" || sName === "todate") {
				vValue = new Date(parseFloat(vValue));
			}
			if (sName === "number") {
				vValue = parseFloat(vValue);
			} 
			oParams[sName] = vValue;
		})
		aParams = this.aParams.map(function(oParam) {
			return oParams[oParam.name] || oParam.default;
		})
		return aParams;
	},
	formatValue: function(aValue) {
		var aParams = [];
		this.aParams.forEach(function(oParam, iIndex) {
				var vValue = aValue[iIndex];
				if (oParam.name === "formatOptions") {
					vValue = formatObject(vValue);
				}
				if (oParam.name === "date" || oParam.name === "todate") {
					vValue = vValue.valueOf();
				} 
				if (!jQuery.sap.equal(vValue, oParam.default)) aParams.push(oParam.name + "=" + vValue);
			})
		return "#" + aParams.join("&");
	},
	validateValue: function() {
		return true;
	}
})

function bindHash(oModel, aHashParams) {
	aHashBindings = aHashParams.map(function(sParam) {
		return oModel.bindProperty("/" + sParam.name);
	})
	oHashBinding = new sap.ui.model.CompositeBinding(aHashBindings, true);
	oHashBinding.setType(new HashParams(aHashParams));
	oHashBinding.attachChange(function() {
		location.hash = oHashBinding.getExternalValue();
	});
	window.addEventListener("hashchange", function() {
		oHashBinding.setExternalValue(location.hash);
	});
	oHashBinding.setExternalValue(location.hash);
}