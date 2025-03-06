/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/LocalResetAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/LayerUtils",
	"sap/ui/rta/command/FlexCommand",
	"sap/ui/rta/library"
], function(
	ChangesWriteAPI,
	FeaturesAPI,
	LocalResetAPI,
	PersistenceWriteAPI,
	LayerUtils,
	FlexCommand,
	rtaLibrary
) {
	"use strict";

	/**
	 * Annotation Command
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.132
	 * @alias sap.ui.rta.command.AnnotationCommand
	 */
	const AnnotationCommand = FlexCommand.extend("sap.ui.rta.command.AnnotationCommand", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				changeType: {
					type: "string"
				},
				serviceUrl: {
					type: "string"
				},
				content: {
					type: "any"
				},
				changesToDelete: {
					type: "object[]",
					defaultValue: []
				}
			},
			events: {}
		}
	});

	AnnotationCommand.prototype._createChange = function(mFlexSettings, sVariantManagementReference, sCommand) {
		this._aToBeResetChanges = [];
		const mChangeSpecificData = {
			...this._getChangeSpecificData(),
			...mFlexSettings,
			serviceUrl: this.getServiceUrl(),
			command: sCommand,
			jsOnly: this.getJsOnly(),
			generator: mFlexSettings.generator || rtaLibrary.GENERATOR_NAME
		};

		if (this.getChangesToDelete().length) {
			// If available, all changes of the current layer must be deleted via the LocalResetAPI
			// Changes in a lower layer can't be deleted via the LocalResetAPI and must be deleted via the deactivate change
			const aToBeDeactivatedChanges = [];
			if (FeaturesAPI.isLocalResetEnabled()) {
				this.getChangesToDelete().forEach((oFlexObject) => {
					if (LayerUtils.compareAgainstCurrentLayer(oFlexObject.getLayer(), mFlexSettings.layer) === -1) {
						aToBeDeactivatedChanges.push(oFlexObject);
					} else {
						this._aToBeResetChanges.push(oFlexObject);
					}
				});
			} else {
				aToBeDeactivatedChanges.push(...this.getChangesToDelete());
			}

			if (aToBeDeactivatedChanges.length) {
				this._oDeactivateChange = ChangesWriteAPI.create({
					changeSpecificData: {
						changeType: "deactivateChanges",
						content: { changeIds: aToBeDeactivatedChanges.map((oFlexObject) => oFlexObject.getId()) },
						generator: mFlexSettings.generator || rtaLibrary.GENERATOR_NAME,
						layer: mFlexSettings.layer
					},
					selector: this.getAppComponent()
				});
			}
		}

		return ChangesWriteAPI.create({
			changeSpecificData: mChangeSpecificData,
			annotationChange: true,
			selector: this.getAppComponent()
		});
	};

	AnnotationCommand.prototype.execute = async function() {
		// Annotation changes can only be applied during app start, so execute and undo only have to take care of reset / deactivate changes
		if (this._aToBeResetChanges.length) {
			await LocalResetAPI.resetChanges(this._aToBeResetChanges, this.getAppComponent(), true);
		}
		if (this._oDeactivateChange) {
			PersistenceWriteAPI.add({
				selector: this.getAppComponent(),
				flexObjects: [this._oDeactivateChange]
			});
		}
	};

	AnnotationCommand.prototype.undo = async function() {
		if (this._aToBeResetChanges.length) {
			await LocalResetAPI.restoreChanges(this._aToBeResetChanges, this.getAppComponent(), true);
		}
		if (this._oDeactivateChange) {
			PersistenceWriteAPI.remove({
				selector: this.getAppComponent(),
				flexObjects: [this._oDeactivateChange]
			});
		}
	};

	/**
	 * For annotation commands to take effect the app needs to be restarted as the models need to be reloaded.
	 */
	AnnotationCommand.prototype.needsReload = true;

	return AnnotationCommand;
});
