// src: Glob pattern(s) within "content" directory of @sap-theming/theming-base-content
// target: Directory relative to openui5 root

module.exports = [

	// Base
	{
		src: "Base/baseLib/baseTheme/base.less",
		target: "src/sap.ui.core/src/sap/ui/core/themes/base/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedDeclarations,
			commentOutUnusedVariables
		]
	},
	{
		src: "Base/baseLib/sap_belize_hcw/base.less",
		target: "src/sap.ui.core/src/sap/ui/core/themes/base/",
		append: true,
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},

	// Belize
	{
		src: "Base/baseLib/sap_belize_hcb/base.less",
		target: "src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize_hcb/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},
	{
		src: "Base/baseLib/sap_belize_hcw/base.less",
		target: "src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize_hcw/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},
	{
		src: "Base/baseLib/sap_belize_hcw/base.less",
		target: "src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize_hcw/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},
	{
		src: "Base/baseLib/sap_belize_plus/base.less",
		target: "src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize_plus/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},
	{
		src: "Base/baseLib/sap_belize/base.less",
		srcBase: "Base/baseLib/sap_belize/",
		target: "src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},

	// Fiori 3
	{
		src: "Base/baseLib/sap_fiori_3_dark/base.less",
		target: "src/themelib_sap_fiori_3/src/sap/ui/core/themes/sap_fiori_3_dark/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},
	{
		src: "Base/baseLib/sap_fiori_3_hcb/base.less",
		target: "src/themelib_sap_fiori_3/src/sap/ui/core/themes/sap_fiori_3_hcb/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},
	{
		src: "Base/baseLib/sap_fiori_3_hcw/base.less",
		target: "src/themelib_sap_fiori_3/src/sap/ui/core/themes/sap_fiori_3_hcw/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},
	{
		src: "Base/baseLib/sap_fiori_3/base.less",
		target: "src/themelib_sap_fiori_3/src/sap/ui/core/themes/sap_fiori_3/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},

	// Horizon
	{
		src: "Base/baseLib/sap_horizon/base.less",
		target: "src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},
	{
		src: "Base/baseLib/sap_horizon_dark/base.less",
		target: "src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon_dark/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},
	{
		src: "Base/baseLib/sap_horizon_hcb/base.less",
		target: "src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon_hcb/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},
	{
		src: "Base/baseLib/sap_horizon_hcw/base.less",
		target: "src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon_hcw/",
		processContent: [
			processCopyrightComment,
			commentOutUnusedVariables
		]
	},

	// TODO: Switch from manual update to import via theming base content
	// Import SAP-icons font to UI5 specific location
	// {
	// 	src: "Base/baseLib/baseTheme/fonts/SAP-icons.woff2",
	// 	target: "src/sap.ui.core/src/sap/ui/core/themes/base/fonts/",
	// 	encoding: "binary"
	// },

	// Import 72 fonts to UI5 specific locations
	{
		src: [
			"Base/baseLib/baseTheme/fonts/72-Bold-full.woff2",
			"Base/baseLib/baseTheme/fonts/72-Bold.woff2",
			"Base/baseLib/baseTheme/fonts/72-Light-full.woff2",
			"Base/baseLib/baseTheme/fonts/72-Light.woff2",
			"Base/baseLib/baseTheme/fonts/72-Regular-full.woff2",
			"Base/baseLib/baseTheme/fonts/72-Regular.woff2",
			"Base/baseLib/baseTheme/fonts/72Mono-Bold-full.woff2",
			"Base/baseLib/baseTheme/fonts/72Mono-Bold.woff2",
			"Base/baseLib/baseTheme/fonts/72Mono-Regular-full.woff2",
			"Base/baseLib/baseTheme/fonts/72Mono-Regular.woff2"
		],
		target: [
			"src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize/fonts/",
			"src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize_hcb/fonts/",
			"src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize_hcw/fonts/",
			"src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize_plus/fonts/",

			"src/themelib_sap_fiori_3/src/sap/ui/core/themes/sap_fiori_3/fonts/",
			"src/themelib_sap_fiori_3/src/sap/ui/core/themes/sap_fiori_3_dark/fonts/",
			"src/themelib_sap_fiori_3/src/sap/ui/core/themes/sap_fiori_3_hcb/fonts/",
			"src/themelib_sap_fiori_3/src/sap/ui/core/themes/sap_fiori_3_hcw/fonts/",

			"src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon/fonts/",
			"src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon_dark/fonts/",
			"src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon_hcb/fonts/",
			"src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon_hcw/fonts/"
		],
		encoding: "binary"
	},

	// Import 72Black font to UI5 specific locations
	{
		src: [
			"Base/baseLib/baseTheme/fonts/72-Black.woff2",
			"Base/baseLib/baseTheme/fonts/72-Black-full.woff2",
			"Base/baseLib/baseTheme/fonts/72-SemiboldDuplex.woff2",
			"Base/baseLib/baseTheme/fonts/72-SemiboldDuplex-full.woff2"
		],
		target: [
			"src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon/fonts/",
			"src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon_dark/fonts/",
			"src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon_hcb/fonts/",
			"src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon_hcw/fonts/"
		],
		encoding: "binary"
	}

];

const unusedVariables = [
	"sapFontUrl_72Mono_Bold_full_woff",
	"sapFontUrl_72Mono_Bold_full_woff2",
	"sapFontUrl_72Mono_Bold_woff",
	"sapFontUrl_72Mono_Bold_woff2",
	"sapFontUrl_72Mono_Regular_full_woff",
	"sapFontUrl_72Mono_Regular_full_woff2",
	"sapFontUrl_72Mono_Regular_woff",
	"sapFontUrl_72Mono_Regular_woff2",
	"sapFontUrl_72_Black_woff",
	"sapFontUrl_72_Black_woff2",
	"sapFontUrl_72_BoldItalic_woff",
	"sapFontUrl_72_BoldItalic_woff2",
	"sapFontUrl_72_Bold_full_woff",
	"sapFontUrl_72_Bold_full_woff2",
	"sapFontUrl_72_Bold_woff",
	"sapFontUrl_72_Bold_woff2",
	"sapFontUrl_72_Semibold_woff",
	"sapFontUrl_72_Semibold_woff2",
	"sapFontUrl_72_SemiboldDuplex_woff",
	"sapFontUrl_72_SemiboldDuplex_woff2",
	"sapFontUrl_72_Semibold_full_woff",
	"sapFontUrl_72_Semibold_full_woff2",
	"sapFontUrl_72_SemiboldDuplex_full_woff",
	"sapFontUrl_72_SemiboldDuplex_full_woff2",
	"sapFontUrl_72_CondensedBold_woff",
	"sapFontUrl_72_CondensedBold_woff2",
	"sapFontUrl_72_Condensed_woff",
	"sapFontUrl_72_Condensed_woff2",
	"sapFontUrl_72_Italic_woff",
	"sapFontUrl_72_Italic_woff2",
	"sapFontUrl_72_Light_full_woff",
	"sapFontUrl_72_Light_full_woff2",
	"sapFontUrl_72_Light_woff",
	"sapFontUrl_72_Light_woff2",
	"sapFontUrl_72_Regular_full_woff",
	"sapFontUrl_72_Regular_full_woff2",
	"sapFontUrl_72_Regular_woff",
	"sapFontUrl_72_Regular_woff2",
	"sapFontUrl_SAP-icons-Business-Suite_ttf",
	"sapFontUrl_SAP-icons-Business-Suite_woff",
	"sapFontUrl_SAP-icons-Business-Suite_woff2",
	"sapFontUrl_SAP-icons-TNT_ttf",
	"sapFontUrl_SAP-icons-TNT_woff",
	"sapFontUrl_SAP-icons-TNT_woff2",
	"sapFontUrl_SAP-icons_ttf",
	"sapFontUrl_SAP-icons_woff",
	"sapFontUrl_SAP-icons_woff2",
	"sapSvgLib_SAP-icons",
	"sapSvgLib_SAPGUI-icons",
	"sapSvgLib_SAPWeb-icons"
];

/*
 * Commenting out variables that are currently not used by UI5
 * - Font urls should be used once the @font-face declarations have been converted to mixins (also see comments below)
 * - SvgLib icons are not related to or used by UI5
 */
function commentOutUnusedVariables(content) {
	unusedVariables.forEach((variableName) => {
		content = content.replace(new RegExp("@" + variableName + ":.*", "gm"), "// $&");
	});
	return content;
}

/*
 * Commenting out declarations that are currently not used by UI5
 * - @font-face declarations should be converted to mixins that can be applied by UI5
 * - svgIcon classes are not related to UI5 at all
 *
 * Note: Using LESS comments (//) to also hide the content from the CSS
 */
function commentOutUnusedDeclarations(content) {
	const lines = content.split("\n");
	let commentOut = false;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (
			line === "@font-face {" ||
			line === ".sapSvgIconNegative {" ||
			line === ".sapSvgIconCritical {" ||
			line === ".sapSvgIconPositive {" ||
			line === ".sapSvgIconBase {"
		) {
			commentOut = true;
		}
		if (commentOut) {
			lines[i] = "// " + lines[i];
			if (line === "}") {
				commentOut = false;
			}
		}
	}
	return lines.join("\n") + "\n";
}

/*
 * Hiding the Theming Base Content copyright headers from the CSS
 * by adding LESS comments (//) in front of them.
 *
 * This is mainly important because some UI5 libraries (sap.viz) are
 * having problems with the curly brackets that are part of those comments.
 */
function processCopyrightComment(content) {
	const lines = content.split("\n");
	let commentOut = false;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (
			line === "/**" &&
			lines[i + 1] &&
			lines[i + 1].includes("Copyright")
		) {
			commentOut = true;
		}
		if (commentOut) {
			lines[i] = "// " + lines[i];
			if (line === "*/") {
				commentOut = false;
			}
		}
	}
	return lines.join("\n");
}
