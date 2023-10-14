/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/config",
	"sap/base/util/Version",
	"sap/base/strings/camelize"
], (
	BaseConfig,
	Version,
	camelize
) => {
	"use strict";

	const BASE_CVERS = Version("1.14");

	const VERSION = "${version}";

	var M_COMPAT_FEATURES = {
		"xx-test"               : "1.15", //for testing purposes only
		"flexBoxPolyfill"       : "1.14",
		"sapMeTabContainer"     : "1.14",
		"sapMeProgessIndicator" : "1.14",
		"sapMGrowingList"       : "1.14",
		"sapMListAsTable"       : "1.14",
		"sapMDialogWithPadding" : "1.14",
		"sapCoreBindingSyntax"  : "1.24"
	};

	/**
	 * Returns the used compatibility version for the given feature.
	 *
	 * @alias module:sap/ui/core/getCompatibilityVersion
	 * @function
	 * @param {string} sFeature the key of desired feature
	 * @return {module:sap/base/util/Version} the used compatibility version
	 * @public
	 */
	const fnGetCompatibilityVersion = (sFeature) => {
		const PARAM_CVERS = "sapUiCompatVersion";
		const DEFAULT_CVERS = BaseConfig.get({
			name: PARAM_CVERS,
			type: BaseConfig.Type.String
		});

		function _getCVers(key){
			var v = !key ? DEFAULT_CVERS || BASE_CVERS.toString()
					: BaseConfig.get({
						name: camelize(PARAM_CVERS + "-" + key.toLowerCase()),
						type: BaseConfig.Type.String
					}) || DEFAULT_CVERS || M_COMPAT_FEATURES[key] || BASE_CVERS.toString();
			v = Version(v.toLowerCase() === "edge" ? VERSION : v);
			//Only major and minor version are relevant
			return Version(v.getMajor(), v.getMinor());
		}

		return M_COMPAT_FEATURES.hasOwnProperty(sFeature) ? _getCVers(sFeature) : _getCVers();
	};

	return fnGetCompatibilityVersion;
});