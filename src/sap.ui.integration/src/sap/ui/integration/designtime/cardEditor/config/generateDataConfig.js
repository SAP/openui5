/*!
 * ${copyright}
 *
 * @function
 * @private
 * @experimental
 */
sap.ui.define(function () {
	"use strict";

	return function (aTags, sRelativePath, sAttributePrefix) {
		var defaultDataConfig = {
			"DataRequestUrl": {
				"tags": aTags.concat(["data"]),
				"label": "{i18n>CARD_EDITOR.DATA.REQUEST.URL}",
				"type": "string",
				"defaultValue": "",
				"path": sRelativePath + "data/request/url"
			},
			"DataRequestMode": {
				"tags": aTags.concat(["data"]),
				"label": "{i18n>CARD_EDITOR.DATA.REQUEST.MODE}",
				"type": "enum",
				"enum": [
					"no-cors",
					"same-origin",
					"cors"
				],
				"defaultValue": "cors",
				"path": sRelativePath + "data/request/mode",
				"visible": "{= !!${context>" + sRelativePath + "data/request/url} }"
			},
			"DataRequestMethod": {
				"tags": aTags.concat(["data"]),
				"label": "{i18n>CARD_EDITOR.DATA.REQUEST.METHOD}",
				"type": "enum",
				"enum": [
					"GET",
					"POST"
				],
				"defaultValue": "GET",
				"path": sRelativePath + "data/request/method",
				"visible": "{= !!${context>" + sRelativePath + "data/request/url} }"
			},
			"DataRequestParameters": {
				"tags": aTags.concat(["data"]),
				"label": "{i18n>CARD_EDITOR.DATA.REQUEST.PARAMETERS}",
				"type": "map",
				"path": sRelativePath + "data/request/parameters",
				"visible": "{= !!${context>" + sRelativePath + "data/request/url} }"
			},
			"DataRequestHeaders": {
				"tags": aTags.concat(["data"]),
				"label": "{i18n>CARD_EDITOR.DATA.REQUEST.HEADERS}",
				"type": "map",
				"path": sRelativePath + "data/request/headers",
				"visible": "{= !!${context>" + sRelativePath + "data/request/url} }"
			},
			"DataRequestWithCredentials": {
				"tags": aTags.concat(["data"]),
				"label": "{i18n>CARD_EDITOR.DATA.REQUEST.WITHCREDENTIALS}",
				"type": "boolean",
				"defaultValue": false,
				"path": sRelativePath + "data/request/withCredentials",
				"visible": "{= !!${context>" + sRelativePath + "data/request/url} }"
			},
			"DataJson": {
				"tags": aTags.concat(["data"]),
				"label": "{i18n>CARD_EDITOR.DATA.JSON}",
				"type": "json",
				"path": sRelativePath + "data/json",
				"visible": "{= !${context>" + sRelativePath + "data/request/url} }"
			},
			"DataPath": {
				"tags": aTags.concat(["data"]),
				"label": "{i18n>CARD_EDITOR.DATA.PATH}",
				"type": "string",
				"path": sRelativePath + "data/path"
			},
			"DataServiceName": {
				"tags": aTags.concat(["data"]),
				"label": "{i18n>CARD_EDITOR.DATA.SERVICE.NAME}",
				"type": "string",
				"path": sRelativePath + "data/service/name",
				"visible": false // Currently undocumented
			},
			"DataServiceParameters": {
				"tags": aTags.concat(["data"]),
				"label": "{i18n>CARD_EDITOR.DATA.SERVICE.PARAMETERS}",
				"type": "map",
				"path": sRelativePath + "data/service/parameters",
				"visible": false // Currently undocumented
			},
			"DataUpdateInterval": {
				"tags": aTags.concat(["data"]),
				"label": "{i18n>CARD_EDITOR.DATA.UPDATEINTERVAL}",
				"type": "number",
				"path": sRelativePath + "data/updateInterval"
			}
		};

		var oGeneratedDataConfig = {};
		Object.keys(defaultDataConfig).forEach(function (sKey) {
			oGeneratedDataConfig[sAttributePrefix + sKey] = defaultDataConfig[sKey];
		});
		return oGeneratedDataConfig;
	};
});
