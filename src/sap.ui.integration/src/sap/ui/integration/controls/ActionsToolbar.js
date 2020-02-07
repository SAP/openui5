/*!
* ${copyright}
*/

// Provides control sap.ui.integration.controls.ActionsToolbar
sap.ui.define([
		"sap/ui/thirdparty/jquery",
		"sap/m/library",
		"sap/ui/core/Core",
		'sap/ui/core/Control',
		"sap/m/Button",
		"sap/m/OverflowToolbar",
		"sap/m/OverflowToolbarLayoutData",
		"sap/f/cards/CardActions",
		"./ActionsToolbarRenderer"
	],
	function(jQuery,
			 mLibrary,
			 Core,
			 Control,
			 Button,
			 OverflowToolbar,
			 OverflowToolbarLayoutData,
			 CardActions) {
		"use strict";

		// shortcut for sap.m.OverflowToolbarPriority
		var OverflowToolbarPriority = mLibrary.OverflowToolbarPriority,
			ToolbarStyle = mLibrary.ToolbarStyle;

		/**
		 * Constructor for a new ActionsToolbar.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @alias sap.ui.integration.controls.ActionsToolbar
		 */
		var ActionsToolbar = Control.extend("sap.ui.integration.controls.ActionsToolbar",  {
			metadata: {
				library: "sap.ui.integration",
				properties: {

				},
				aggregations: {
					/**
					 * The toolbar.
					 * @private
					 */
					_toolbar: {
						type: "sap.ui.core.Control",
						multiple: false,
						visibility: "hidden"
					}
				}
			}
		});

		ActionsToolbar.prototype._createActionButton = function (oHost, oCard, mActionConfig) {
			var bVisible = true,
				bEnabled = true;

			if (mActionConfig.visible) {
				if (jQuery.isFunction(mActionConfig.visible)) {
					bVisible = mActionConfig.visible(oCard);
				} else {
					bVisible = mActionConfig.visible;
				}
			}

			if (mActionConfig.enabled) {
				if (jQuery.isFunction(mActionConfig.enabled)) {
					bEnabled = mActionConfig.enabled(oCard);
				} else {
					bEnabled = mActionConfig.enabled;
				}
			}

			return new Button({
				icon: mActionConfig.icon,
				text: mActionConfig.text,
				tooltip: mActionConfig.tooltip,
				type: mActionConfig.buttonType,
				enabled: bEnabled,
				visible: bVisible,
				press: function (oEvent) {
					CardActions.fireAction({
						card: oCard,
						host: oHost,
						action: mActionConfig,
						manifestParameters: mActionConfig.parameters,
						source: oEvent.getSource(),
						url: mActionConfig.url
					});
				},
				layoutData: new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.AlwaysOverflow
				})
			});
		};

		ActionsToolbar.prototype.createToolbar = function (oHost, oCard) {
			var that = this,
				bHasVisibleButton = false,
				oActionButton,
				aActions,
				oToolbar;

			this.destroyAggregation('_toolbar');

			aActions = oHost.getActions();
			if (!aActions || !aActions.length) {
				return;
			}

			oToolbar = new OverflowToolbar({
				style: ToolbarStyle.Clear
			});

			aActions.forEach(function (actionConfig) {
				oActionButton = that._createActionButton(oHost, oCard, actionConfig);
				oToolbar.addContent(oActionButton);

				if (oActionButton.getVisible()) {
					bHasVisibleButton = true;
				}
			});

			if (bHasVisibleButton) {
				this.setAggregation('_toolbar', oToolbar);
			}

			return bHasVisibleButton;
		};

		return ActionsToolbar;
	});