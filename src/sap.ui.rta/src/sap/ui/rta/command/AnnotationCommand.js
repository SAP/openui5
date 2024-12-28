/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/rta/command/FlexCommand",
	"sap/ui/rta/library"
], function(
	ChangesWriteAPI,
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
				}
			},
			events: {}
		}
	});

	AnnotationCommand.prototype._createChange = function(mFlexSettings, sVariantManagementReference, sCommand) {
		const mChangeSpecificData = {
			...this._getChangeSpecificData(),
			...mFlexSettings,
			serviceUrl: this.getServiceUrl(),
			command: sCommand,
			jsOnly: this.getJsOnly(),
			generator: mFlexSettings.generator || rtaLibrary.GENERATOR_NAME
		};
		return ChangesWriteAPI.create({
			changeSpecificData: mChangeSpecificData,
			annotationChange: true,
			selector: this.getAppComponent()
		});
	};

	AnnotationCommand.prototype.execute = function() {
		return Promise.resolve();
	};

	AnnotationCommand.prototype.undo = function() {
		return Promise.resolve();
	};

	/**
	 * For annotation commands to take effect the app needs to be restarted as the models need to be reloaded.
	 */
	AnnotationCommand.prototype.needsReload = true;

	return AnnotationCommand;
});
