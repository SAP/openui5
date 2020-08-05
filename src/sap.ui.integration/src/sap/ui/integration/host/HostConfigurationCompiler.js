/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/less",
	"sap/base/Log",
	"jquery.sap.global"
], function (
	Less,
	Log,
	jQuery
) {
	"use strict";
	//Parameter definitions
	//TODO: How to do this async?
	var parameterMaps = jQuery.sap.loadResource("sap/ui/integration/host/HostConfigurationMap.json", {
			dataType: "json"
		}),
		lessFile = jQuery.sap.loadResource("sap/ui/integration/host/HostConfiguration.less", {
			dataType: "text"
		});

	/**
	 * Loads a resource of a given type async and returns a promise
	 * @param {string} sUrl the URL to load
	 * @param {string} sType the expected type of response "json" or "text"
	 * @retunrs {Promise}
	 * @private
	 */
	function loadResource(sUrl, sType) {
		return new Promise(function (resolve, reject) {
			jQuery.ajax({
				url: sUrl,
				async: true,
				dataType: sType,
				success: function (oJson) {
					resolve(oJson);
				},
				error: function () {
					reject();
				}
			});
		});
	}

	function _getObject(oNode, sPath) {
		if (!sPath) {
			return oNode;
		}
		var aParts = sPath.split("/"),
			iIndex = 0;
		if (!aParts[0]) {
			// absolute path starting with slash
			oNode = oNode;
			iIndex++;
		}
		while (oNode && aParts[iIndex]) {
			oNode = oNode[aParts[iIndex]];
			iIndex++;
		}
		return oNode;
	}

	function generateCSSText(oConfig, sClassName) {
		var oMap = parameterMaps.less,
			aParameters = [];
		for (var n in oMap) {
			var oMapItem = oMap[n],
				vValue = _getObject(oConfig, oMapItem.path),
				sUnit = oMapItem.unit;
			if (vValue) {
				aParameters.push(n + ":" + vValue + (sUnit ? sUnit : ""));
			} else {
				//TODO: Adding a comment as value is only a workaround. Is there a way to erase properties that have no value or do we need a postprocessing for that?
				aParameters.push(n + ": /*null*/");
			}
		}

		//replace the #hostConfigName placeholder of the less with the classname
		var resultFile = lessFile.replace(/\#hostConfigName/g, "." + sClassName);
		//add the above generated parameters
		resultFile = resultFile.replace(/\/\* HOSTCONFIG PARAMETERS \*\//, aParameters.join(";\n") + ";");
		var oParser = new Less.Parser(),
			sStyle = "";
		oParser.parse(resultFile, function (oError, oRoot) {
			try {
				sStyle = oRoot.toCSS();
			} catch (ex) {
				sStyle = " ";
			}
		});
		return sStyle;
	}

	function generateJSONSettings(oConfig, sName) {
		function getValue(oConfig, vValue) {
			var oResult = null;
			if (vValue.path) {
				oResult = _getObject(oConfig, vValue.path);
				if (vValue.unit) {
					vValue.unit = oResult + vValue.unit;
				}
			} else if (vValue.value) {
				oResult = vValue.value;
			} else if (Array.isArray(vValue)) {
				oResult = [];
				for (var i = 0; i < vValue.length; i++) {
					oResult.push(getValue(oConfig, vValue[i]));
				}
			}
			return oResult;
		}
		var oMap = parameterMaps[sName],
			oSettings = {};
		for (var n in oMap) {
			var oMapItem = oMap[n],
				aOutputPath = n.split("/"),
				oCurrent = oSettings;

			if (oMapItem) {
				for (var i = 0; i < aOutputPath.length - 1; i++) {
					if (oCurrent[aOutputPath[i]] === undefined) {
						oCurrent[aOutputPath[i]] = {};
					}
					oCurrent = oCurrent[aOutputPath[i]];
				}
				oCurrent[aOutputPath[aOutputPath.length - 1]] = getValue(oConfig, oMapItem);
			}
		}
		return oSettings;
	}

	function generateCSSTextAsync(sConfigUrl, oConfigJson) {
		return loadResource(sConfigUrl, "json").then(function (oConfigJson) {
			return generateCSSText(oConfigJson, oConfigJson);
		});
	}

	return {
		loadResource: loadResource,
		generateCssText: generateCSSText,
		generateCssTextAsync: generateCSSTextAsync,
		generateJSONSettings: generateJSONSettings
	};
});