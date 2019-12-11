/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/theming/Parameters"], function (Parameters) {
	"use strict";

	return {
		"spacing": {
			"small": 8, // .sapUiTinyMarginTop
			"default": 16, // .sapUiSmallMarginTop
			"medium": 32, // .sapUiMediumMarginTop
			"large": 48, // .sapUiLargeMarginTop
			"extraLarge": 48, // .sapUiLargeMarginTop
			"padding": 16 // cozy and compact padding for card content
		},
		"separator": {
			"lineThickness": 1,
			"lineColor": Parameters.get("sapUiToolbarSeparatorColor") // @sapUiToolbarSeparatorColor
		},
		"supportsInteractivity": true,
		"fontTypes": {
			"default": {
				"fontFamily": Parameters.get("sapUiFontFamily"), // @sapUiFontFamily
				"fontSizes": {
					"small": Parameters.get("sapMFontSmallSize"),
					"default": Parameters.get("sapMFontMediumSize"), // @sapMFontMediumSize
					"medium": Parameters.get("sapMFontMediumSize"), // @sapMFontMediumSize
					"large": Parameters.get("sapMFontLargeSize"), // @sapMFontLargeSize
					"extraLarge": 20
				}
			},
			// default for monoscape
			"monospace": {}
		},
		"containerStyles": {
			"default": {
				// in order to get out of the box the card content background or use
				// @sapUiTileBackground
				"backgroundColor": "transparent",
				"foregroundColors": {
					"default": {
						"default": Parameters.get("sapUiBaseText")
					},
					"accent": {
						"default": Parameters.get("sapUiInformativeText")
					},
					"attention": {
						"default": Parameters.get("sapUiNegativeText")
					},
					"good": {
						"default": Parameters.get("sapUiPositiveText")
					},
					"warning": {
						"default": Parameters.get("sapUiCriticalText")
					}
				}
			},
			"emphasis": {
				"backgroundColor": Parameters.get("sapUiNeutralBG"),
				"foregroundColors": {
					"default": {
						"default": Parameters.get("sapUiBaseText")
					},
					"accent": {
						"default": Parameters.get("sapUiInformativeText")
					},
					"attention": {
						"default": Parameters.get("sapUiNegativeText")
					},
					"good": {
						"default": Parameters.get("sapUiPositiveText")
					},
					"warning": {
						"default": Parameters.get("sapUiCriticalText")
					}
				}
			},
			"accent": {
				"backgroundColor": Parameters.get("sapUiInformationBG"),
				"foregroundColors": {
					"default": {
						"default": Parameters.get("sapUiBaseText")
					},
					"accent": {
						"default": Parameters.get("sapUiInformativeText")
					},
					"attention": {
						"default": Parameters.get("sapUiNegativeText")
					},
					"good": {
						"default": Parameters.get("sapUiPositiveText")
					},
					"warning": {
						"default": Parameters.get("sapUiCriticalText")
					}
				}
			},
			"good": {
				"backgroundColor": Parameters.get("sapUiSuccessBG"),
				"foregroundColors": {
					"default": {
						"default": Parameters.get("sapUiBaseText")
					},
					"accent": {
						"default": Parameters.get("sapUiInformativeText")
					},
					"attention": {
						"default": Parameters.get("sapUiNegativeText")
					},
					"good": {
						"default": Parameters.get("sapUiPositiveText")
					},
					"warning": {
						"default": Parameters.get("sapUiCriticalText")
					}
				}
			},
			"attention": {
				"backgroundColor": Parameters.get("sapUiErrorBG"),
				"foregroundColors": {
					"default": {
						"default": Parameters.get("sapUiBaseText")
					},
					"accent": {
						"default": Parameters.get("sapUiInformativeText")
					},
					"attention": {
						"default": Parameters.get("sapUiNegativeText")
					},
					"good": {
						"default": Parameters.get("sapUiPositiveText")
					},
					"warning": {
						"default": Parameters.get("sapUiCriticalText")
					}
				}
			},
			"warning": {
				"backgroundColor": Parameters.get("sapUiWarningBG"),
				"foregroundColors": {
					"default": {
						"default": Parameters.get("sapUiBaseText")
					},
					"accent": {
						"default": Parameters.get("sapUiInformativeText")
					},
					"attention": {
						"default": Parameters.get("sapUiNegativeText")
					},
					"good": {
						"default": Parameters.get("sapUiPositiveText")
					},
					"warning": {
						"default": Parameters.get("sapUiCriticalText")
					}
				}
			}
		}
	};
});