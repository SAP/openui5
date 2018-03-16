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

			//ensure keys which contain non-word characters [A-Za-z0-9_] are double quoted
			if (!/^\w+$/.test(sName)) {
				sName = "\"" + sName + "\"";
			}

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

function validateFormatOptions(oOptions, oSupportedOptions) {
	var oOption, vValue, bError;
	for (var sName in oOptions) {
		oOption = oSupportedOptions[sName];
		if (!oOption) {
			return "Unknown format option \"" + sName + "\"";
		}
		vValue = oOptions[sName];
		bError = false;
		switch (oOption.type) {
			case "enum": 
				bError = (typeof vValue !== "string") || oOption.values.indexOf(vValue) === -1
				break;
			case "int": 
				bError = (typeof vValue !== "number") || Math.floor(vValue) !== vValue || (oOption.min !== undefined && vValue < oOption.min);
				break;
			case "float": 
				bError = (typeof vValue !== "number") || (oOption.hasOwnProperty("min") && vValue < oOption.min);
				break;
			case "string": 
				bError = (typeof vValue !== "string") || (oOption.regex && !oOption.regex.test(vValue));
				break;
			case "boolean": 
				bError = vValue !== true && vValue !== false;
				break;
		}
		if (bError) {
			return "Invalid value \"" + vValue + "\" for format option \"" + sName + "\". " + oOption.help;
		}
	}
}

sap.ui.model.SimpleType.extend("Options", {
	constructor: function(oSupportedOptions) {
		sap.ui.model.SimpleType.apply(this, arguments);
		this.sName = "Options";
		this.oSupportedOptions = oSupportedOptions;
	},
	parseValue: function(sValue) {
		var oFormatOptions;
		try {
			oFormatOptions = jQuery.sap.parseJS(sValue);
		} catch(e) {
			throw new sap.ui.model.ParseException("Could not parse format options: " + e.message);
		}
		return oFormatOptions;
	},
	formatValue: function(oValue) {
		return formatObject(oValue, true);
	},
	validateValue: function(oOptions) {
		var sError = validateFormatOptions(oOptions, this.oSupportedOptions);
		if (sError) {
			throw new sap.ui.model.ValidateException(sError);
		}
		return true;
	}
})

sap.ui.model.CompositeType.extend("HashParams", {
	constructor: function(aParams, oSupportedOptions) {
		sap.ui.model.CompositeType.apply(this, arguments);
		this.sName = "HashParams";
		this.aParams = aParams;
		this.oSupportedOptions = oSupportedOptions;
		this.bUseRawValues = true;
	},
	parseValue: function(sValue) {
		var aParts = sValue.substr(1).split("&"), 
			oParams = {}, aParams;
		aParts.forEach(function(oParam) {
			var aSplit = oParam.split("="),
				sName = aSplit[0],
				vValue = decodeURIComponent(aSplit[1]);
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
			if (!jQuery.sap.equal(vValue, oParam.default)) aParams.push(oParam.name + "=" + encodeURIComponent(vValue));
		})
		return "#" + aParams.join("&");
	},
	validateValue: function(aValue) {
		var sError;
		this.aParams.forEach(function(oParam, iIndex) {
			var vValue = aValue[iIndex];
			if (oParam.name === "formatOptions") {
				sError = validateFormatOptions(vValue, this.oSupportedOptions);
			}
		});
		if (sError) {
			throw new sap.ui.model.ValidateException(sError);
		} 
		return true;
	}
})

function bindHash(oModel, aHashParam, oSupportedOptions) {
	aHashBindings = aHashParams.map(function(sParam) {
		return oModel.bindProperty("/" + sParam.name);
	})
	oHashBinding = new sap.ui.model.CompositeBinding(aHashBindings, true);
	oHashBinding.setType(new HashParams(aHashParams, oSupportedOptions));
	oHashBinding.attachChange(function() {
		location.hash = oHashBinding.getExternalValue();
	});
	window.addEventListener("hashchange", function() {
		try {
			oHashBinding.setExternalValue(location.hash);
		} catch(e) {
			showError("Parse Error", "Could not parse hash: " + e.message);
		}
	});
	try {
		oHashBinding.setExternalValue(location.hash);
	} catch (e) {
		showError("Parse Error", "Could not parse hash: " + e.message);
	}
}

function showError(sTitle, sMessage) {
	var dialog = new sap.m.Dialog({
		title: sTitle,
		type: 'Message',
		state: 'Error',
		content: new sap.m.Text({
			text: sMessage
		}),
		beginButton: new sap.m.Button({
			text: 'OK',
			press: function () {
				dialog.close();
			}
		}),
		afterClose: function() {
			dialog.destroy();
		}
	});
	dialog.open();
}