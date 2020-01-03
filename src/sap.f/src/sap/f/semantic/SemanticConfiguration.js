/*!
 * ${copyright}
 */

/**
* Provides a private class <code>sap.f.semantic.SemanticConfiguration</code>.
*/
sap.ui.define([
	"sap/ui/base/Metadata",
	"sap/ui/core/IconPool",
	"sap/m/library",
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/core/InvisibleText"
], function(Metadata,
			IconPool,
			mobileLibrary,
			OverflowToolbarLayoutData,
			InvisibleText) {
		"use strict";

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	/**
	* Constructor for a <code>sap.f.semantic.SemanticConfiguration</code>.
	*
	* @class
	* Defines the visual properties and placement for each supported semantic type.
	*
	* @version ${version}
	* @private
	* @since 1.46.0
	* @alias sap.f.semantic.SemanticConfiguration
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var SemanticConfiguration = Metadata.createClass("sap.f.semantic.SemanticConfiguration", {});

	/**
	* The placement map of all supported semantic types.
	*/
	SemanticConfiguration._Placement = {
		titleText: "titleText",
		titleIcon: "titleIcon",
		footerLeft: "footerLeft",
		footerRight : "footerRight",
		shareMenu : "shareMenu"
	};

	/**
	* Checks and determines if the type is supported.
	*
	* @param {String} sType
	* @returns {Boolean}
	*/
	SemanticConfiguration.isKnownSemanticType = function (sType) {
		return SemanticConfiguration.getConfiguration(sType) !== null;
	};

	/**
	* Returns the configuration of the semantic type.
	*
	* @param {String} sType
	* @returns {Object | null}
	*/
	SemanticConfiguration.getConfiguration = function (sType) {
		return SemanticConfiguration._oTypeConfigs[sType] || null;
	};

	/**
	* Returns the settings (ui5 properties) of the semantic type,
	* defined in the configuration, that will be applied.
	*
	* @param {String} sType
	* @returns {Object | null}
	*/
	SemanticConfiguration.getSettings = function (sType) {
		if (SemanticConfiguration.isKnownSemanticType(sType)) {
			return SemanticConfiguration._oTypeConfigs[sType].getSettings();
		}

		return null;
	};

	/**
	* Returns the constraints of the semantic type,
	* defined in the configuration.
	*
	* @param {String} sType
	* @returns {String | null}
	*/
	SemanticConfiguration.getConstraints = function (sType) {
		if (SemanticConfiguration.isKnownSemanticType(sType)) {
			return SemanticConfiguration._oTypeConfigs[sType].constraints || null;
		}

		return null;
	};

	/**
	* Returns the placement of the semantic type,
	* defined in the configuration.
	*
	* @param {String} sType
	* @returns {String | null}
	*/
	SemanticConfiguration.getPlacement = function (sType) {
		if (SemanticConfiguration.isKnownSemanticType(sType)) {
			return SemanticConfiguration._oTypeConfigs[sType].placement;
		}
		return null;
	};

	/**
	* Returns the order of the semantic type,
	* defined in the configuration.
	*
	* @param {String} sType
	* @returns {Number | null}
	*/
	SemanticConfiguration.getOrder = function (sType) {
		if (SemanticConfiguration.isKnownSemanticType(sType)) {
			return SemanticConfiguration._oTypeConfigs[sType].order;
		}

		return null;
	};

	/**
	 * Determines if the <code>SemanticControl</code> should be preprocessed.
	 *
	 * @returns {Boolean}
	 */
	SemanticConfiguration.shouldBePreprocessed = function (sType) {
		if (SemanticConfiguration.isKnownSemanticType(sType)) {
			return SemanticConfiguration._oTypeConfigs[sType].needPreprocesing || false;
		}

		return false;
	};

	/**
	* Determines if the <code>SemanticControl</code> is a <code>MainAction</code>.
	*
	* @returns {Boolean}
	*/
	SemanticConfiguration.isMainAction = function (sType) {
		if (SemanticConfiguration.isKnownSemanticType(sType)) {
			return SemanticConfiguration._oTypeConfigs[sType].mainAction || false;
		}

		return false;
	};

	/**
	* Determines if the <code>SemanticControl</code> is a <code>Navigation</code> type of action,
	* such as <code>FullScreenAction</code> and <code>CloseAction</code>.
	*
	* @returns {Boolean}
	*/
	SemanticConfiguration.isNavigationAction = function (sType) {
		if (SemanticConfiguration.isKnownSemanticType(sType)) {
			return SemanticConfiguration._oTypeConfigs[sType].navigation || false;
		}

		return false;
	};


	/**
	* <code>SemanticControl</code> configuration object.
	*/
	SemanticConfiguration._oTypeConfigs = (function () {
		var oTypeConfigs = {},
			oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.f");

		// Title Semantic Text Buttons
		oTypeConfigs["sap.f.semantic.TitleMainAction"] = {
			placement: SemanticConfiguration._Placement.titleText,
			order: 0,
			mainAction : true,
			getSettings: function() {
				return {
					type: ButtonType.Emphasized,
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.NeverOverflow
					})};
			}
		};

		oTypeConfigs["sap.f.semantic.EditAction"] = {
			placement: SemanticConfiguration._Placement.titleText,
			order: 1,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_EDIT"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_EDIT"),
					type: ButtonType.Transparent
				};
			}
		};

		oTypeConfigs["sap.f.semantic.DeleteAction"] = {
			placement: SemanticConfiguration._Placement.titleText,
			order: 2,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_DELETE"),
					type: ButtonType.Transparent
				};
			}
		};

		oTypeConfigs["sap.f.semantic.CopyAction"] = {
			placement: SemanticConfiguration._Placement.titleText,
			order: 3,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_COPY"),
					type: ButtonType.Transparent
				};
			}
		};

		oTypeConfigs["sap.f.semantic.AddAction"] = {
			placement: SemanticConfiguration._Placement.titleText,
			order: 4,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_ADD"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_ADD"),
					type: ButtonType.Transparent
				};
			}
		};

		// Title Semantic Icon Buttons
		oTypeConfigs["sap.f.semantic.FavoriteAction"] = {
			placement: SemanticConfiguration._Placement.titleIcon,
			order: 0,
			constraints: "IconOnly",
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("favorite"),
					text: oBundle.getText("SEMANTIC_CONTROL_FAVORITE"),
					type: ButtonType.Transparent
				};
			}
		};

		oTypeConfigs["sap.f.semantic.FlagAction"] = {
			placement: SemanticConfiguration._Placement.titleIcon,
			order: 1,
			constraints: "IconOnly",
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("flag"),
					text: oBundle.getText("SEMANTIC_CONTROL_FLAG"),
					type: ButtonType.Transparent
				};
			}
		};

		// Title Semantic Icon navigation Actions
		oTypeConfigs["sap.f.semantic.FullScreenAction"] = {
			placement: SemanticConfiguration._Placement.titleIcon,
			order: 0,
			constraints: "IconOnly",
			navigation : true,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("full-screen"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_FULL_SCREEN"),
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.NeverOverflow
					}),
					type: ButtonType.Transparent
				};
			}
		};

		oTypeConfigs["sap.f.semantic.ExitFullScreenAction"] = {
			placement: SemanticConfiguration._Placement.titleIcon,
			order: 1,
			constraints: "IconOnly",
			navigation : true,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("exit-full-screen"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_EXIT_FULL_SCREEN"),
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.NeverOverflow
					}),
					type: ButtonType.Transparent
				};
			}
		};

		oTypeConfigs["sap.f.semantic.CloseAction"] = {
			placement: SemanticConfiguration._Placement.titleIcon,
			order: 2,
			constraints: "IconOnly",
			navigation : true,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("decline"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_CLOSE"),
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.NeverOverflow
					}),
					type: ButtonType.Transparent
				};
			}
		};

		// FOOTER Semantic LEFT Actions
		oTypeConfigs["sap.f.semantic.MessagesIndicator"] = {
			placement: SemanticConfiguration._Placement.footerLeft,
			order: 0,
			mainAction : false,
			getSettings: function() {
				var sTooltipId = InvisibleText.getStaticId("sap.f", "SEMANTIC_CONTROL_MESSAGES_INDICATOR");

				return {
					icon: IconPool.getIconURI("message-popup"),
					text: {
						path: "message>/",
						formatter: function (aMessages) {
							return aMessages.length || 0;
						}
					},
					tooltip: oBundle.getText("SEMANTIC_CONTROL_MESSAGES_INDICATOR"),
					ariaLabelledBy: sTooltipId,
					type: ButtonType.Emphasized,
					visible: {
						path: "message>/",
						formatter: function (aMessages) {
							return aMessages && aMessages.length > 0;
						}
					},
					models: {message: sap.ui.getCore().getMessageManager().getMessageModel()},
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.NeverOverflow
					})
				};
			}
		};

		// FOOTER Semantic RIGHT Actions
		oTypeConfigs["sap.m.DraftIndicator"] = {
			placement: SemanticConfiguration._Placement.footerRight,
			order: 0,
			needPreprocesing: true,
			mainAction : false,
			getSettings: function() {
				return {
					layoutData: new OverflowToolbarLayoutData({shrinkable: false})
				};
			}
		};

		oTypeConfigs["sap.f.semantic.FooterMainAction"] = {
			placement: SemanticConfiguration._Placement.footerRight,
			order: 1,
			mainAction : true,
			getSettings: function() {
				return {
					type: ButtonType.Emphasized,
					text: oBundle.getText("SEMANTIC_CONTROL_SAVE"),
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.NeverOverflow
					})};
			}
		};

		oTypeConfigs["sap.f.semantic.PositiveAction"] = {
			placement: SemanticConfiguration._Placement.footerRight,
			order: 2,
			mainAction : false,
			getSettings: function() {
				return {
					type: ButtonType.Accept,
					text: oBundle.getText("SEMANTIC_CONTROL_ACCEPT"),
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.NeverOverflow
					})};
			}
		};

		oTypeConfigs["sap.f.semantic.NegativeAction"] = {
			placement: SemanticConfiguration._Placement.footerRight,
			order: 3,
			mainAction : false,
			getSettings: function() {
				return {
					type: ButtonType.Reject,
					text: oBundle.getText("SEMANTIC_CONTROL_REJECT"),
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.NeverOverflow
					})};
			}
		};


		// SHARE MENU Semantic Actions
		oTypeConfigs["sap.f.semantic.SendEmailAction"] = {
			placement: SemanticConfiguration._Placement.shareMenu,
			order: 0,
			constraints: "IconOnly",
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("email"),
					text: oBundle.getText("SEMANTIC_CONTROL_SEND_EMAIL"),
					type: ButtonType.Transparent
				};
			}
		};

		oTypeConfigs["sap.f.semantic.DiscussInJamAction"] = {
			placement: SemanticConfiguration._Placement.shareMenu,
			order: 1,
			constraints: "IconOnly",
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("discussion-2"),
					text: oBundle.getText("SEMANTIC_CONTROL_DISCUSS_IN_JAM"),
					type: ButtonType.Transparent
				};
			}
		};

		oTypeConfigs["sap.f.semantic.ShareInJamAction"] = {
			placement: SemanticConfiguration._Placement.shareMenu,
			order: 2,
			constraints: "IconOnly",
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("share-2"),
					text: oBundle.getText("SEMANTIC_CONTROL_SHARE_IN_JAM"),
					type: ButtonType.Transparent
				};
			}
		};

		oTypeConfigs["sap.f.semantic.SendMessageAction"] = {
			placement: SemanticConfiguration._Placement.shareMenu,
			order: 3,
			constraints: "IconOnly",
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("discussion"),
					text: oBundle.getText("SEMANTIC_CONTROL_SEND_MESSAGE"),
					type: ButtonType.Transparent
				};
			}
		};

		oTypeConfigs["saveAsTileAction"] = {
			placement: SemanticConfiguration._Placement.shareMenu,
			order: 4,
			constraints: "IconOnly"
		};

		oTypeConfigs["sap.f.semantic.PrintAction"] = {
			placement: SemanticConfiguration._Placement.shareMenu,
			order: 5,
			constraints: "IconOnly",
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("print"),
					text: oBundle.getText("SEMANTIC_CONTROL_PRINT"),
					type: ButtonType.Transparent
				};
			}
		};

		return oTypeConfigs;
	})();

	return SemanticConfiguration;

});
