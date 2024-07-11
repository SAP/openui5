// src: Glob pattern(s) within "content" directory of @sap-theming/theming-base-content
// target: Directory relative to openui5 root

module.exports = [

	// Base variables as custom properties (CSS Variables)
	{
		src: "Base/baseLib/baseTheme/skeleton.less",
		rename: "skeleton.less",
		target: "src/sap.ui.core/src/sap/ui/core/themes/base/",
		processContent: [
			processCopyrightComment
		]
	},

	// Base
	{
		src: "Base/baseLib/baseTheme/base.less",
		target: "src/sap.ui.core/src/sap/ui/core/themes/base/",
		processContent: [
			processCopyrightComment,
			deactivateFontFaceDeclarations
		]
	},
	{
		src: "Base/baseLib/sap_belize_hcw/base.less",
		target: "src/sap.ui.core/src/sap/ui/core/themes/base/",
		append: true,
		processContent: [
			processCopyrightComment
		]
	},

	// Belize
	{
		src: "Base/baseLib/sap_belize_hcb/base.less",
		target: "src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize_hcb/",
		processContent: [
			processCopyrightComment
		]
	},
	{
		src: "Base/baseLib/sap_belize_hcw/base.less",
		target: "src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize_hcw/",
		processContent: [
			processCopyrightComment
		]
	},
	{
		src: "Base/baseLib/sap_belize_hcw/base.less",
		target: "src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize_hcw/",
		processContent: [
			processCopyrightComment
		]
	},
	{
		src: "Base/baseLib/sap_belize_plus/base.less",
		target: "src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize_plus/",
		processContent: [
			processCopyrightComment
		]
	},
	{
		src: "Base/baseLib/sap_belize/base.less",
		srcBase: "Base/baseLib/sap_belize/",
		target: "src/themelib_sap_belize/src/sap/ui/core/themes/sap_belize/",
		processContent: [
			processCopyrightComment
		]
	},

	// Fiori 3
	{
		src: "Base/baseLib/sap_fiori_3_dark/base.less",
		target: "src/themelib_sap_fiori_3/src/sap/ui/core/themes/sap_fiori_3_dark/",
		processContent: [
			processCopyrightComment
		]
	},
	{
		src: "Base/baseLib/sap_fiori_3_hcb/base.less",
		target: "src/themelib_sap_fiori_3/src/sap/ui/core/themes/sap_fiori_3_hcb/",
		processContent: [
			processCopyrightComment
		]
	},
	{
		src: "Base/baseLib/sap_fiori_3_hcw/base.less",
		target: "src/themelib_sap_fiori_3/src/sap/ui/core/themes/sap_fiori_3_hcw/",
		processContent: [
			processCopyrightComment
		]
	},
	{
		src: "Base/baseLib/sap_fiori_3/base.less",
		target: "src/themelib_sap_fiori_3/src/sap/ui/core/themes/sap_fiori_3/",
		processContent: [
			processCopyrightComment
		]
	},

	// Horizon
	{
		src: "Base/baseLib/sap_horizon/base.less",
		target: "src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon/",
		processContent: [
			processCopyrightComment
		]
	},
	{
		src: "Base/baseLib/sap_horizon_dark/base.less",
		target: "src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon_dark/",
		processContent: [
			processCopyrightComment
		]
	},
	{
		src: "Base/baseLib/sap_horizon_hcb/base.less",
		target: "src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon_hcb/",
		processContent: [
			processCopyrightComment
		]
	},
	{
		src: "Base/baseLib/sap_horizon_hcw/base.less",
		target: "src/themelib_sap_horizon/src/sap/ui/core/themes/sap_horizon_hcw/",
		processContent: [
			processCopyrightComment
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

const fontFaceSwitchVariables = [
	"sapCss_SAP-icons",
	"sapCss_72",
	"sapCss_SvgIconBase"
];

function replaceFontFaceSwitchVariables(content, replacement) {
	fontFaceSwitchVariables.forEach((variableName) => {
		content = content.replace(new RegExp("(@" + variableName + ":).*;", "gm"), replacement);
	});
	return content;
}

/*
 * Changing the font-face switches to "false" so that @font-face declarations are not rendered via mixins.
 * Currently UI5 maintains @font-face declarations by itself.
 */
function deactivateFontFaceDeclarations(content) {
	return replaceFontFaceSwitchVariables(content, "$1 false;");
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
