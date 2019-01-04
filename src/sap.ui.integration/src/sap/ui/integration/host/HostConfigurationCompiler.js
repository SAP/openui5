/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/less",
	"sap/base/Log"
], function (
	Less,
	Log
) {
	"use strict";
	//Parameter definitions
	//TODO: How to do this async?
	var lessParameters = jQuery.sap.loadResource("sap/ui/integration/host/HostConfigurationMap.json", {
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
		var oMap = lessParameters,
			aParameters = [];
		for (var n in oMap) {
			var vValue = _getObject(oConfig, oMap[n].path),
				sUnit = oMap[n].unit;
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

	function generateCSSTextAsync(sConfigUrl, oConfigJson) {
		return loadResource(sConfigUrl, "json").then(function (oConfigJson) {
			return generateCSSText(oConfigJson, oConfigJson);
		});
	}

	return {
		loadResource: loadResource,
		generateCssText: generateCSSText,
		generateCssTextAsync: generateCSSTextAsync
	};
});