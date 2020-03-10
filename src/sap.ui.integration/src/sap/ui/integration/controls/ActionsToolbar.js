/*!
* ${copyright}
*/

// Provides control sap.ui.integration.controls.ActionsToolbar
sap.ui.define([
		"sap/ui/thirdparty/jquery",
		"sap/ui/core/Core",
		'sap/ui/core/Control',
		"sap/m/library",
		"sap/m/Button",
		"sap/m/ActionSheet",
		"sap/ui/integration/util/CardActions",
		"./ActionsToolbarRenderer"
	],
	function(jQuery,
			 Core,
			 Control,
			 library,
			 Button,
			 ActionSheet,
			 CardActions) {
		"use strict";

		var ButtonType = library.ButtonType;

		function setButtonProperty(oButton, sPropertyName, oValue, oCard) {

			return new Promise(function (resolve) {

				var oResolvedValue;

				if (jQuery.isFunction(oValue)) {

					oResolvedValue = oValue(oCard);

					if (oResolvedValue instanceof Promise) {

						oResolvedValue.then(function (oResult) {
							oButton.setProperty(sPropertyName, oResult);
							resolve();
						});

						return;
					}

				} else {
					oResolvedValue = oValue;
				}

				oButton.setProperty(sPropertyName, oResolvedValue);
				resolve();
			});
		}

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

		ActionsToolbar.prototype._open = function () {
			this._refreshButtons().then(function () {

				this._oActionSheet.openBy(this._getToolbar());

			}.bind(this));
		};

		ActionsToolbar.prototype._createActionButton = function (oHost, oCard, mActionConfig) {

			return new Button({
				icon: mActionConfig.icon,
				text: mActionConfig.text,
				tooltip: mActionConfig.tooltip,
				type: mActionConfig.buttonType,
				press: function (oEvent) {
					CardActions.fireAction({
						card: oCard,
						host: oHost,
						action: mActionConfig,
						parameters: mActionConfig.parameters,
						source: oEvent.getSource(),
						url: mActionConfig.url
					});
				}
			});
		};


		ActionsToolbar.prototype._getToolbar = function () {
			var oToolbar = this.getAggregation('_toolbar');
			if (!oToolbar) {
				oToolbar = new Button({
					icon: 'sap-icon://overflow',
					type: ButtonType.Transparent,
					press: function (oEvent) {
						this._open();
					}.bind(this)
				});

				this.setAggregation('_toolbar', oToolbar);
			}

			return oToolbar;
		};


		ActionsToolbar.prototype.initializeContent = function (oHost, oCard) {

			var that = this,
				oActionButton,
				aButtons = [],
				aActions;

			this._oCard = oCard;

			this._aActions = aActions = oHost.getActions();
			if (!aActions || !aActions.length) {
				return false;
			}

			aActions.forEach(function (actionConfig) {
				oActionButton = that._createActionButton(oHost, oCard, actionConfig);
				aButtons.push(oActionButton);
			});

			if (this._oActionSheet) {
				this._oActionSheet.destroy();
			}

			this._oActionSheet = new ActionSheet({
				buttons: aButtons
			});

			return true;
		};

		ActionsToolbar.prototype._refreshButtons = function () {
			var aActions = this._aActions,
				oCard = this._oCard,
				aButtons = this._oActionSheet.getButtons(),
				mAction,
				oButton,
				i,
				aPromises = [];

			for (i = 0; i < aActions.length; i++) {
				mAction = aActions[i];
				oButton = aButtons[i];

				aPromises.push(setButtonProperty(oButton, 'enabled', mAction.enabled, oCard));
				aPromises.push(setButtonProperty(oButton, 'visible', mAction.visible, oCard));
			}

			return Promise.all(aPromises);
		};

		ActionsToolbar.prototype.exit = function () {

			this._oCard = null;
			this._aActions = null;

			if (this._oActionSheet) {
				this._oActionSheet.destroy();
				this._oActionSheet = null;
			}
		};

		return ActionsToolbar;
	});