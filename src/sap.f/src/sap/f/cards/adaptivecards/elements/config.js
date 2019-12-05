/*!
 * ${copyright}
 */
sap.ui.define([], function () {
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
			"lineColor": "#D9D9D9" // @sapUiToolbarSeparatorColor
		},
		"supportsInteractivity": true,
		"fontTypes": {
			"default": {
				"fontFamily": "'72', '72full', Arial, Helvetica, sans-serif", // @sapUiFontFamily
				"fontSizes": {
					"small": 12, // @sapMFontSmallSize
					"default": 14, // @sapMFontMediumSize
					"medium": 14, // @sapMFontMediumSize
					"large": 16, // @sapMFontLargeSize
					"extraLarge": 20
				},
				"fontWeights": {
					"lighter": 200,
					"default": 400,
					"bolder": 600
				}
			},
			// default for monoscape
			"monospace": {
				"fontFamily": "'Courier New', Courier, monospace",
				"fontSizes": {
					"small": 12,
					"default": 14,
					"medium": 17,
					"large": 21,
					"extraLarge": 26
				},
				"fontWeights": {
					"lighter": 200,
					"default": 400,
					"bolder": 600
				}
			}
		},
		"containerStyles": {
			"default": {
				"backgroundColor": "#FFFFFF", // @sapUiTileBackground
				"foregroundColors": {
					"default": {
						"default": "#32363A", // @sapUiBaseText
						"subtle": "#767676"
					},
					"accent": {
						"default": "#053B70", // @sapUiInformativeText
						"subtle": "#0063B1"
					},
					"attention": {
						"default": "#BB0000", // @sapUiNegativeText
						"subtle": "#DDFF0000"
					},
					"good": {
						"default": "#107E3E", // @sapUiPositiveText
						"subtle": "#DD54a254"
					},
					"warning": {
						"default": "#E9730C", // @sapUiCriticalText
						"subtle": "#DDc3ab23"
					}
				}
			},
			"emphasis": {
				"backgroundColor": "#F4F4F4", // @sapUiNeutralBG
				"foregroundColors": {
					"default": {
						"default": "#32363A", // @sapUiBaseText
						"subtle": "#767676"
					},
					"accent": {
						"default": "#053B70", // @sapUiInformativeText
						"subtle": "#0063B1"
					},
					"attention": {
						"default": "#BB0000", // @sapUiNegativeText
						"subtle": "#DDFF0000"
					},
					"good": {
						"default": "#107E3E", // @sapUiPositiveText
						"subtle": "#DD54a254"
					},
					"warning": {
						"default": "#E9730C", // @sapUiCriticalText
						"subtle": "#DDc3ab23"
					}
				}
			},
			"accent": {
				"backgroundColor": "#F5FAFF", // @sapUiInformationBG
				"foregroundColors": {
					"default": {
						"default": "#32363A", // @sapUiBaseText
						"subtle": "#767676"
					},
					"dark": {
						"default": "#000000",
						"subtle": "#66000000"
					},
					"light": {
						"default": "#FFFFFF",
						"subtle": "#33000000"
					},
					"accent": {
						"default": "#053B70", // @sapUiInformativeText
						"subtle": "#0063B1"
					},
					"attention": {
						"default": "#BB0000", // @sapUiNegativeText
						"subtle": "#DDFF0000"
					},
					"good": {
						"default": "#107E3E", // @sapUiPositiveText
						"subtle": "#DD54a254"
					},
					"warning": {
						"default": "#E9730C", // @sapUiCriticalText
						"subtle": "#DDc3ab23"
					}
				}
			},
			"good": {
				"backgroundColor": "#F1FDF6", // @sapUiSuccessBG
				"foregroundColors": {
					"default": {
						"default": "#32363A", // @sapUiBaseText
						"subtle": "#767676"
					},
					"dark": {
						"default": "#000000",
						"subtle": "#66000000"
					},
					"light": {
						"default": "#FFFFFF",
						"subtle": "#33000000"
					},
					"accent": {
						"default": "#053B70", // @sapUiInformativeText
						"subtle": "#0063B1"
					},
					"attention": {
						"default": "#BB0000", // @sapUiNegativeText
						"subtle": "#DDFF0000"
					},
					"good": {
						"default": "#107E3E", // @sapUiPositiveText
						"subtle": "#DD54a254"
					},
					"warning": {
						"default": "#E9730C", // @sapUiCriticalText
						"subtle": "#DDc3ab23"
					}
				}
			},
			"attention": {
				"backgroundColor": "#FFEBEB", // @sapUiErrorBG
				"foregroundColors": {
					"default": {
						"default": "#32363A", // @sapUiBaseText
						"subtle": "#767676"
					},
					"dark": {
						"default": "#000000",
						"subtle": "#66000000"
					},
					"light": {
						"default": "#FFFFFF",
						"subtle": "#33000000"
					},
					"accent": {
						"default": "#053B70", // @sapUiInformativeText
						"subtle": "#0063B1"
					},
					"attention": {
						"default": "#BB0000", // @sapUiNegativeText
						"subtle": "#DDFF0000"
					},
					"good": {
						"default": "#107E3E", // @sapUiPositiveText
						"subtle": "#DD54a254"
					},
					"warning": {
						"default": "#E9730C", // @sapUiCriticalText
						"subtle": "#DDc3ab23"
					}
				}
			},
			"warning": {
				"backgroundColor": "#FEF7F1", // @sapUiWarningBG
				"foregroundColors": {
					"default": {
						"default": "#32363A", // @sapUiBaseText
						"subtle": "#767676"
					},
					"dark": {
						"default": "#000000",
						"subtle": "#66000000"
					},
					"light": {
						"default": "#FFFFFF",
						"subtle": "#33000000"
					},
					"accent": {
						"default": "#053B70", // @sapUiInformativeText
						"subtle": "#0063B1"
					},
					"attention": {
						"default": "#BB0000", // @sapUiNegativeText
						"subtle": "#DDFF0000"
					},
					"good": {
						"default": "#107E3E", // @sapUiPositiveText
						"subtle": "#DD54a254"
					},
					"warning": {
						"default": "#E9730C", // @sapUiCriticalText
						"subtle": "#DDc3ab23"
					}
				}
			}
		}
	};
});