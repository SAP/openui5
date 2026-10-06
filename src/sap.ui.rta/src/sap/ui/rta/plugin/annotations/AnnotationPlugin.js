/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/DesignTime",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/dt/Util",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/annotations/AnnotationChangeDialog",
	"sap/ui/rta/plugin/annotations/AnnotationTypes",
	"sap/ui/rta/plugin/Plugin"
], function(
	BaseLog,
	DesignTime,
	JsControlTreeModifier,
	DtUtil,
	PersistenceWriteAPI,
	Utils,
	AnnotationChangeDialog,
	AnnotationTypes,
	Plugin
) {
	"use strict";

	async function handleCompositeCommand(oElement, oAction, aAnnotationChanges, aLegacyRenameChanges) {
		const oCompositeCommand = await this.getCommandFactory().getCommandFor(oElement, "composite");
		for (const oChange of aAnnotationChanges) {
			// the annotation could have different text types, depending on where the annotation is used
			// but the backend needs to know the type, so we just set it to "XFLD" if it is not defined
			if (oChange.content.text && !oChange.content.textType) {
				oChange.content.textType = "XFLD";
			}
			const oAnnotationCommand = await this.getCommandFactory().getCommandFor(
				oElement,
				"annotation",
				{
					changeType: oAction.changeType,
					serviceUrl: oChange.serviceUrl,
					content: { ...oChange.content, objectTemplateInfo: oAction.objectTemplateInfo },
					// aLegacyRenameChanges is only passed for singleRename scenarios, where there is only one annotation change to be saved
					// so we can simply add it in the loop
					changesToDelete: aLegacyRenameChanges
				}
			);
			oCompositeCommand.addCommand(oAnnotationCommand);
		}

		if (oCompositeCommand.getCommands().length > 0) {
			this.fireElementModified({
				command: oCompositeCommand
			});
		}
	}

	// For single-rename scenarios we remove any existing control-based rename change in the
	// context of the given control and change type, so the annotation change becomes the single
	// source of truth for the label.
	async function getLegacyRenameChanges(oElement, oAction) {
		const aLegacyRenameChanges = [];
		if (oAction.singleRename) {
			const aUIChanges = await PersistenceWriteAPI._getUIChanges({
				selector: oElement
			});
			const oAppComponent = Utils.getAppComponentForControl(oElement);
			aLegacyRenameChanges.push(...aUIChanges.filter((oChange) =>
				oChange.getChangeType() === oAction.controlBasedRenameChangeType
				&& JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), oAppComponent) === oElement.getId()
			));
		}
		return aLegacyRenameChanges;
	}

	function getActionIcon(oAnnotationAction) {
		const sDefaultIcon = oAnnotationAction.type === AnnotationTypes.StringType ? "sap-icon://edit" : "sap-icon://request";
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

	function checkDesigntimeActionProperties(oAction) {
		if (oAction.singleRename && !oAction.controlBasedRenameChangeType) {
			BaseLog.error("When using singleRename, controlBasedRenameChangeType must also be defined");
			return false;
		}
		return true;
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
	const AnnotationPlugin = Plugin.extend("sap.ui.rta.plugin.annotations.AnnotationPlugin", /** @lends sap.ui.rta.plugin.annotations.AnnotationPlugin.prototype */ {
		metadata: {
			library: "sap.ui.rta"
		}
	});

	const sPluginIdDefault = "CTX_ANNOTATION";
	const sPluginIdSingleLabelChange = "CTX_ANNOTATION_CHANGE_SINGLE_LABEL";

	AnnotationPlugin.prototype.init = function(...aArgs) {
		Plugin.prototype.init.apply(this, aArgs);
		this._oDialog = new AnnotationChangeDialog();
	};

	/**
	 * @override
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

	AnnotationPlugin.prototype.getActionText = function(oElementOverlay, oAction) {
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
	};

	/**
	 * @override
	 */
	AnnotationPlugin.prototype.handler = async function(aElementOverlays, mPropertyBag) {
		const oElementOverlay = aElementOverlays[0];
		const oElement = oElementOverlay.getElement();
		const oAction = mPropertyBag.menuItem.action;

		try {
			const aAnnotationChanges = await this._oDialog.openDialogAndHandleChanges({
				title: this.getActionText(oElementOverlay, oAction),
				type: oAction.type,
				control: oElement,
				delegate: oAction.delegate,
				annotation: oAction.annotation,
				description: oAction.description,
				singleRename: oAction.singleRename,
				controlBasedRenameChangeType: oAction.controlBasedRenameChangeType,
				featureKey: oAction.featureKey,
				validators: oAction.validators
			});

			if (aAnnotationChanges.length) {
				const aLegacyRenameChanges = await getLegacyRenameChanges(oElement, oAction);
				return handleCompositeCommand.call(this, oElement, oAction, aAnnotationChanges, aLegacyRenameChanges);
			}
			return undefined;
		} catch (vError) {
			throw DtUtil.propagateError(
				vError,
				"AnnotationPlugin#handler",
				"Error occurred during handler execution",
				"sap.ui.rta.plugin.annotations.AnnotationPlugin"
			);
		}
	};

	/**
	 * @override
	 */
	AnnotationPlugin.prototype.getMenuItems = async function(aElementOverlays) {
		const oElementOverlay = aElementOverlays[0];
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oElementOverlay);
		const oAnnotationActionMap = this.getAction(oResponsibleElementOverlay);

		const aMenuItems = [];
		if (oAnnotationActionMap) {
			let iIndex = 0;
			for (const sKey in oAnnotationActionMap) {
				const oAction = oAnnotationActionMap[sKey];
				oAction.featureKey = sKey;
				const sPluginId = oAction.type === AnnotationTypes.StringType && oAction.singleRename
					? sPluginIdSingleLabelChange
					: sPluginIdDefault;
				const iRank = this.getRank(sPluginId);
				const sActionText = this.getActionText(oResponsibleElementOverlay, oAction);
				if (checkDesigntimeActionProperties(oAction) && sActionText) {
					aMenuItems.push(await this._getMenuItems(aElementOverlays, {
						pluginId: `${sPluginId}_${sKey}`,
						icon: getActionIcon(oAction),
						rank: iRank + iIndex,
						action: oAction,
						text: sActionText,
						description: `Apply the "${sActionText}" annotation change to this element `
							+ `(annotation change type "${oAction.changeType}"). `
							+ "Call getContext first to list the editable annotation properties with their "
							+ `current values, then invoke with featureKey "${sKey}" and the desired changes.`
					}));
				}
				iIndex++;
			}
		}

		return aMenuItems.flat();
	};

	/**
	 * @override
	 */
	AnnotationPlugin.prototype.getActionName = function() {
		return "annotation";
	};

	/**
	 * Returns the parameters that a programmatic consumer (e.g. an AI agent) must provide to
	 * create the annotation commands. As a single overlay can offer multiple annotation actions,
	 * the concrete action is selected via the <code>featureKey</code> parameter.
	 * @returns {object[]} List of parameter descriptors
	 * @override
	 */
	AnnotationPlugin.prototype.getParameters = function() {
		return [
			{
				name: "featureKey",
				type: "string",
				required: true,
				description: "Identifies which annotation action to run. Must be one of the keys in "
					+ "`getContext().annotationActions`."
			},
			{
				name: "changes",
				type: "array",
				required: true,
				description: "The annotation changes to apply. Each entry is an object "
					+ "{ annotationPath: string, value: string|boolean|object }. `annotationPath` must be one of "
					+ "the paths listed under the chosen action's `properties` in getContext; `value` is the new "
					+ "value (a string for String/rename actions, a boolean for Boolean actions, or one of the "
					+ "`possibleValues` keys for ValueList actions)."
			}
		];
	};

	/**
	 * Returns element-specific context that an AI agent needs before it can fill the parameters:
	 * the available annotation actions (keyed by feature key) together with the editable
	 * properties, their current values and any allowed values as provided by the delegate.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay
	 * @returns {Promise<object>} Map of context entries in <code>{ description, value }</code> shape
	 * @override
	 */
	AnnotationPlugin.prototype.getContext = async function(oOverlay) {
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oOverlay);
		const oElement = oResponsibleElementOverlay.getElement();
		const oAnnotationActionMap = this.getAction(oResponsibleElementOverlay) || {};
		const mAnnotationActions = {};

		for (const sKey in oAnnotationActionMap) {
			const oAction = oAnnotationActionMap[sKey];
			// the delegate provides the service url and the element-specific annotation properties
			// eslint-disable-next-line no-await-in-loop
			const oChangeInfo = await oAction.delegate.getAnnotationsChangeInfo(oElement, oAction.annotation);
			mAnnotationActions[sKey] = {
				title: this.getActionText(oResponsibleElementOverlay, oAction),
				valueType: oAction.type,
				changeType: oAction.changeType,
				serviceUrl: oChangeInfo.serviceUrl,
				properties: (oChangeInfo.properties || []).map((oProperty) => ({
					annotationPath: oProperty.annotationPath,
					propertyName: oProperty.propertyName,
					label: oProperty.label || oProperty.propertyName,
					currentValue: oProperty.currentValue
				})),
				possibleValues: oChangeInfo.possibleValues || []
			};
		}

		return {
			annotationActions: {
				description: "Available annotation actions keyed by feature key. Pass the chosen key as the "
					+ "`featureKey` parameter. For each action, `valueType` is one of String/Boolean/ValueList, "
					+ "`properties` lists the editable annotation targets (use `annotationPath` in the `changes` "
					+ "parameter and `currentValue` to see the present value), and `possibleValues` lists the "
					+ "allowed values for ValueList actions. The Annotation Change will not change the control directly, "
					+ "but it will change the underlying annotation data. This means that one change will affect all controls "
					+ "bound to the same annotation. Only one change must be created for a particular value to be changed, "
					+ "even if it is shown by multiple controls. "
					+ "But the change will only be applied after a reload, for this the UI offers a reload option.",
				value: mAnnotationActions
			}
		};
	};

	/**
	 * Headless executor for the annotation action. Builds and fires the annotation command(s) for the
	 * action selected via <code>mParameters.featureKey</code>, mirroring the interactive handler.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay
	 * @param {object} mParameters - Parameters as declared in {@link #getParameters}
	 * @returns {Promise<void>} Resolves once the command has been fired
	 * @override
	 */
	AnnotationPlugin.prototype.createCommands = async function(oOverlay, mParameters) {
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oOverlay);
		const oElement = oResponsibleElementOverlay.getElement();
		const oAnnotationActionMap = this.getAction(oResponsibleElementOverlay) || {};
		const oAction = oAnnotationActionMap[mParameters.featureKey];

		if (!oAction) {
			throw new Error(`No annotation action found for feature key '${mParameters.featureKey}'`);
		}
		if (!checkDesigntimeActionProperties(oAction)) {
			throw new Error(`The annotation action for feature key '${mParameters.featureKey}' is not configured correctly`);
		}
		oAction.featureKey = mParameters.featureKey;

		const aChanges = mParameters.changes || [];
		if (!aChanges.length) {
			return;
		}

		const { serviceUrl: sServiceUrl } = await oAction.delegate.getAnnotationsChangeInfo(oElement, oAction.annotation);
		const bIsStringType = oAction.type === AnnotationTypes.StringType;

		const aAnnotationChanges = aChanges.map((oChange) => {
			const oContent = { annotationPath: oChange.annotationPath };
			// String type annotations are saved as translatable text, all other types as plain value
			oContent[bIsStringType ? "text" : "value"] = oChange.value;
			return {
				serviceUrl: sServiceUrl,
				content: oContent
			};
		});

		const aLegacyRenameChanges = await getLegacyRenameChanges(oElement, oAction);
		await handleCompositeCommand.call(this, oElement, oAction, aAnnotationChanges, aLegacyRenameChanges);
	};

	AnnotationPlugin.prototype.destroy = function(...args) {
		Plugin.prototype.destroy.apply(this, args);
		this._oDialog.destroy();
		delete this._oDialog;
	};

	return AnnotationPlugin;
});
