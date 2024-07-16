/*!
* ${copyright}
*/

// Provides control sap.ui.integration.controls.ActionsToolbar
sap.ui.define([
	"./ActionsToolbarRenderer",
	"sap/base/strings/capitalize",
	"sap/ui/core/Control",
	"sap/m/library",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/m/Button",
	"sap/m/ActionSheet",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/integration/cards/actions/CardActions"
], function(
	ActionsToolbarRenderer,
	capitalize,
	Control,
	mLibrary,
	Element,
	Library,
	coreLibrary,
	Button,
	ActionSheet,
	ManagedObjectObserver,
	CardActions
) {
	"use strict";

	var ButtonType = mLibrary.ButtonType;

	var HasPopup = coreLibrary.aria.HasPopup;

	function setButtonProperty(oButton, sPropertyName, oValue, oCard) {

		return new Promise(function (resolve) {

			var oResolvedValue;

			if (typeof oValue === "function") {

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
	var ActionsToolbar = Control.extend("sap.ui.integration.controls.ActionsToolbar", {
		metadata: {
			library: "sap.ui.integration",
			properties: {

			},
			aggregations: {
				actionDefinitions: {
					type: "sap.ui.integration.ActionDefinition",
					multiple: true
				},

				/**
				 * The toolbar.
				 * @private
				 */
				_toolbar: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},

				_actionSheet: {
					type: "sap.m.ActionSheet",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		renderer: ActionsToolbarRenderer
	});

	ActionsToolbar.prototype.init = function () {
		this.setAggregation("_actionSheet", new ActionSheet());
		this._aActions = []; // holds actions from host and extension
		this._mActionObservers = new Map();
		this._oObserver = new ManagedObjectObserver(this._observeActionsAggregation.bind(this));
		this._oObserver.observe(this, {
			aggregations: [
				"actionDefinitions"
			]
		});
	};

	ActionsToolbar.prototype.exit = function () {
		this._oCard = null;
		this._aActions = null;
		this._oObserver.disconnect();
		this._oObserver = null;
		this._mActionObservers.clear();
		this._mActionObservers = null;
	};

	ActionsToolbar.prototype.onBeforeRendering = function () {
		this._updateVisibility();
	};

	/**
	 * Initializes the buttons which are added by Extension#setActions and Host#setActions.
	 * @param {sap.ui.integration.widgets.Card} oCard The card which owns this toolbar
	 */
	ActionsToolbar.prototype.initializeContent = function (oCard) {
		var that = this,
			oActionButton,
			aButtons = [],
			aActions = [],
			oActionSheet = this.getAggregation("_actionSheet"),
			oHost = oCard.getHostInstance();

		oCard.getAggregation("_extension");

		if (oHost) {
			aActions = aActions.concat(oHost.getActions() || []);
		}

		this._aActions = aActions;

		aActions.forEach(function (oAction) {
			oActionButton = that._createActionButton(oAction, false);
			aButtons.push(oActionButton);
		});

		if (this._aButtons) {
			this._aButtons.forEach(function (oButton) {
				oButton.destroy();
			});
		}
		aButtons.forEach(oActionSheet.addButton, oActionSheet);
		this._aButtons = aButtons;

		// Make an initial check for 'visible' and 'enabled' for the buttons
		this._refreshButtons().then(this._updateVisibility.bind(this));
	};

	ActionsToolbar.prototype.setCard = function (oCard) {
		this._oCard = oCard;
	};

	ActionsToolbar.prototype._open = function () {
		this._refreshButtons().then(function () {
			this.getAggregation("_actionSheet").openBy(this._getToolbar());
		}.bind(this));
	};

	ActionsToolbar.prototype._getToolbar = function () {
		var oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");
		var oToolbar = this.getAggregation('_toolbar');
		if (!oToolbar) {
			oToolbar = new Button({
				id: this.getId() + "-overflowButton",
				icon: 'sap-icon://overflow',
				type: ButtonType.Transparent,
				ariaHasPopup: HasPopup.Menu,
				tooltip: oResourceBundle.getText("CARD_ACTIONS_OVERFLOW_BUTTON_TOOLTIP"),
				press: function (oEvent) {
					this._open();
				}.bind(this)
			});

			this.setAggregation('_toolbar', oToolbar);
		}

		return oToolbar;
	};

	ActionsToolbar.prototype._refreshButtons = function () {
		var aActions = this._aActions,
			oCard = this._oCard,
			aButtons = this._aButtons,
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

	/**
	 * @param {object} vAction Action config object
	 * @param {boolean} bIsActionDefinition
	 * @returns {sap.m.Button} Button, which will be displayed in the menu
	 */
	ActionsToolbar.prototype._createActionButton = function (vAction, bIsActionDefinition) {
		var mSettings = bIsActionDefinition ? this._getActionConfig(vAction) : vAction;

		var oBtn = new Button({
				icon: mSettings.icon,
				text: mSettings.text,
				tooltip: mSettings.tooltip,
				type: mSettings.buttonType,
				visible: bIsActionDefinition ? mSettings.visible : false,
				press: function (oEvent) {
					var mCurrSettings = bIsActionDefinition ? this._getActionConfig(vAction) : vAction;

					CardActions.fireAction({
						card: this._oCard,
						host: this._oCard.getHostInstance(),
						action: mCurrSettings,
						parameters: mCurrSettings.parameters,
						source: oEvent.getSource()
					});
				}.bind(this)
			});

		if (bIsActionDefinition) {
			oBtn.setEnabled(mSettings.enabled);
		}

		return oBtn;
	};

	ActionsToolbar.prototype._updateVisibility = function () {
		var bVisible = this.getAggregation("_actionSheet").getButtons().some(function (oButton) {
			return oButton.getVisible();
		});

		this.setVisible(bVisible);
	};

	/**
	 * @private
	 * @ui5-restricted sap.f.BaseHeader
	 */
	ActionsToolbar.prototype.updateVisibility = function () {
		this._updateVisibility();
	};

	ActionsToolbar.prototype._getActionConfig = function (oActionDefinition) {
		var mSettings = ["visible", "enabled", "icon", "text", "tooltip", "parameters", "buttonType", "type"].reduce(function (mAcc, sKey) {
			mAcc[sKey] = oActionDefinition["get" + capitalize(sKey)]();
			return mAcc;
		}, {});

		mSettings.action = function () {
			oActionDefinition.firePress();
		};

		return mSettings;
	};

	/**
	 * Maps <code>actions</code> aggregation to the buttons
	 * @param {object} oChanges The mutation info
	 */
	ActionsToolbar.prototype._observeActionsAggregation = function (oChanges) {
		var oActionDefinition = oChanges.child;

		if (oChanges.mutation === "insert") {
			var oButton = this._createActionButton(oActionDefinition, true);

			this.getAggregation("_actionSheet").insertButton(oButton, this.indexOfActionDefinition(oActionDefinition));
			oActionDefinition.setAssociation("_menuButton", oButton);

			var oActionObserver = new ManagedObjectObserver(this._observeSingleAction.bind(this));
			oActionObserver.observe(oActionDefinition, {
				properties: true,
				aggregations: ["tooltip"]
			});
			this._mActionObservers.set(oActionDefinition.getId(), oActionObserver);
			this._updateVisibility();
		} else if (oChanges.mutation === "remove") {
			Element.getElementById(oActionDefinition.getAssociation("_menuButton")).destroy();
			this._mActionObservers.get(oActionDefinition.getId()).disconnect();
			this._mActionObservers.delete(oActionDefinition.getId());
		}
	};

	ActionsToolbar.prototype._observeSingleAction = function (oChanges) {
		var oActionDefinition = oChanges.object,
			sName = oChanges.name,
			oButton = Element.getElementById(oActionDefinition.getAssociation("_menuButton")),
			vVal = oChanges.current;

		if (["type", "parameters"].indexOf(sName) !== -1) {
			return;
		}

		if (oChanges.type === "aggregation") {
			vVal = oChanges.child;
		}

		if (sName === "buttonType") {
			sName = "type";
		}

		oButton["set" + capitalize(sName)](vVal);
		this._updateVisibility();
	};

	ActionsToolbar.prototype.setEnabled = function (bValue) {
		var oToolbar = this._getToolbar();

		if (bValue) {
			oToolbar.setEnabled(true);
		} else {
			this.getAggregation("_actionSheet").close();
			oToolbar.setEnabled(false);
		}
	};

	return ActionsToolbar;
});