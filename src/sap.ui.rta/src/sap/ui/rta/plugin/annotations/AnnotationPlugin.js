/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/dt/Util",
	"sap/ui/rta/plugin/annotations/AnnotationChangeDialog",
	"sap/ui/rta/plugin/Plugin"
], function(
	BaseLog,
	DtUtil,
	AnnotationChangeDialog,
	Plugin
) {
	"use strict";

	async function handleCompositeCommand(oElement, oAction, aChanges) {
		const oCompositeCommand = await this.getCommandFactory().getCommandFor(oElement, "composite");
		for (const oChange of aChanges) {
			const oAnnotationCommand = await this.getCommandFactory().getCommandFor(
				oElement,
				"annotation",
				{
					changeType: oAction.changeType,
					serviceUrl: oChange.serviceUrl,
					content: oChange.content
				}
			);
			oCompositeCommand.addCommand(oAnnotationCommand);
		}

		if (oCompositeCommand.getCommands().length > 0) {
			this.fireElementModified({
				command: oCompositeCommand,
				hasAnnotationCommand: true
			});
		}
	}

	function getActionText(oElementOverlay, oAction) {
		const vName = oAction.title;
		const oElement = oElementOverlay.getElement();
		if (vName) {
			if (typeof vName === "function") {
				return vName(oElement);
			}
			const sText = oElementOverlay.getDesignTimeMetadata()?.getLibraryText(oElement, vName);
			if (sText) {
				return sText;
			}
		}
		BaseLog.error("Annotation action title is not properly defined in the designtime metadata");
		return undefined;
	}

	function getActionIcon(oAnnotationAction) {
		const sDefaultIcon = "sap-icon://request";
		const sActionIcon = oAnnotationAction.icon;
		if (!sActionIcon) {
			return sDefaultIcon;
		}
		if (typeof sActionIcon !== "string") {
			BaseLog.error("Icon setting for annotation action should be a string");
			return sDefaultIcon;
		}
		return sActionIcon;
	}

	/**
	 * Constructor for a new Annotation Plugin.
	 * Multiple annotation actions can be defined for the same overlay. Each action is represented by a menu item.
	 * The Annotation change specific data are entered in a dialog which returns the change data.
	 * One action/dialog can also create multiple changes.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.132
	 * @alias sap.ui.rta.plugin.AnnotationPlugin
	 */
	const AnnotationPlugin =
		Plugin.extend("sap.ui.rta.plugin.annotations.AnnotationPlugin", /** @lends sap.ui.rta.plugin.annotations.AnnotationPlugin.prototype */ {
			metadata: {
				library: "sap.ui.rta",
				associations: {},
				events: {}
			}
		});

	const sPluginId = "CTX_ANNOTATION";

	AnnotationPlugin.prototype.init = function(...aArgs) {
		Plugin.prototype.init.apply(this, aArgs);
		this._oDialog = new AnnotationChangeDialog();
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay to be checked for editable
	 * @returns {boolean} True if it's editable
	 * @private
	 */
	AnnotationPlugin.prototype._isEditable = function(oElementOverlay) {
		const oActions = this.getAction(oElementOverlay);

		if (oActions) {
			return Object.values(oActions).some((oAction) => {
				return oAction.changeType;
			});
		}

		return false;
	};

	/**
	 * Checks if Annotation actions are enabled for oOverlay
	 *
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {boolean} True if it's enabled
	 * @public
	 */
	AnnotationPlugin.prototype.isEnabled = function(aElementOverlays) {
		if (aElementOverlays.length !== 1) {
			return false;
		}

		const oElementOverlay = aElementOverlays[0];
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oElementOverlay);
		const oActions = this.getAction(oResponsibleElementOverlay);

		if (oActions) {
			return Object.values(oActions).some((oAction) => {
				if (typeof oAction.isEnabled !== "undefined") {
					if (typeof oAction.isEnabled === "function") {
						return oAction.isEnabled(oResponsibleElementOverlay.getElement());
					}
					return oAction.isEnabled;
				}
				return true;
			});
		}
		return false;
	};

	/**
	 * Opens the annotation dialog and creates the commands for the returned changes.
	 *
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target Overlays of the action
	 * @param {object} oAction - The action object defined in the designtime
	 * @return {Promise} Resolves with the creation of the commands
	 */
	AnnotationPlugin.prototype.handler = async function(aElementOverlays, oAction) {
		const oElementOverlay = aElementOverlays[0];
		const oElement = oElementOverlay.getElement();

		try {
			const aChanges = await this._oDialog.openDialogAndHandleChanges({
				title: getActionText(oElementOverlay, oAction),
				type: oAction.type,
				control: oElement,
				delegate: oAction.delegate,
				annotation: oAction.annotation,
				description: oAction.description
			});

			if (aChanges.length > 0) {
				return handleCompositeCommand.call(this, oElement, oAction, aChanges);
			}
			return undefined;
		} catch (vError) {
			throw DtUtil.propagateError(
				vError,
				"AnnotationPlugin#handler",
				"Error occurred during handler execution",
				"sap.ui.rta.plugin.annotations.annotationplugin"
			);
		}
	};

	/**
	 * Retrieves the context menu item for the actions.
	 * If multiple annotation actions are defined, it returns multiple menu items.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {object[]} Array of the items with required data
	 */
	AnnotationPlugin.prototype.getMenuItems = async function(aElementOverlays) {
		const oElementOverlay = aElementOverlays[0];
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oElementOverlay);
		const oAnnotationActionMap = this.getAction(oResponsibleElementOverlay);

		const aMenuItems = [];
		if (oAnnotationActionMap) {
			const iRank = this.getRank(sPluginId);

			if (this._isEditableByPlugin(oResponsibleElementOverlay) === undefined) {
				// The responsibleElement editableByPlugin state was not evaluated yet e.g. because it
				// has no visible geometry, thus evaluateEditable now
				await this.evaluateEditable([oResponsibleElementOverlay], { onRegistration: false });
			}
			Object.values(oAnnotationActionMap).forEach(function(oAction, iIndex) {
				if (
					this.isAvailable([oResponsibleElementOverlay])
				) {
					const sActionText = getActionText(oResponsibleElementOverlay, oAction);
					if (!sActionText) {
						return;
					}

					aMenuItems.push({
						id: sPluginId + iIndex,
						rank: iRank + iIndex,
						text: sActionText,
						icon: getActionIcon(oAction),
						enabled: (
							typeof oAction.isEnabled === "function" && oAction.isEnabled(aElementOverlays[0].getElement())
							|| (oAction.isEnabled !== false) && this.isEnabled(aElementOverlays)
						),
						handler: this.handler.bind(this, aElementOverlays, oAction)
					});
				}
			}, this);
		}

		return aMenuItems;
	};

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Returns the action name
	 */
	AnnotationPlugin.prototype.getActionName = function() {
		return "annotation";
	};

	AnnotationPlugin.prototype.destroy = function(...args) {
		Plugin.prototype.destroy.apply(this, args);
		this._oDialog.destroy();
		delete this._oDialog;
	};

	return AnnotationPlugin;
});