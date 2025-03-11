/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/rta/command/FlexCommand"
], function(
	Element,
	FlexRuntimeInfoAPI,
	ChangesWriteAPI,
	FlexCommand
) {
	"use strict";

	/**
	 * Extend Controller Command
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.135
	 * @alias sap.ui.rta.command.ExtendControllerCommand
	 */
	const ExtendControllerCommand = FlexCommand.extend("sap.ui.rta.command.ExtendControllerCommand", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				changeType: {
					type: "string",
					defaultValue: "codeExt"
				},
				codeRef: {
					type: "string"
				},
				viewId: {
					type: "string"
				}
			},
			associations: {},
			events: {}
		}
	});

	ExtendControllerCommand.prototype._createChange = function() {
		const sViewId = this.getViewId();
		const sCodeRef = this.getCodeRef();
		const oView = Element.getElementById(sViewId);
		const oAppComponent = this.getAppComponent();
		const sControllerName = oView.getControllerName
		&& oView.getControllerName()
		|| oView.getController()
		&& oView.getController().getMetadata().getName();
		// Calculate moduleName for code extension
		const sReference = FlexRuntimeInfoAPI.getFlexReference({element: oAppComponent});
		let sModuleName = sReference.replace(/\.Component/g, "").replace(/\./g, "/");
		sModuleName += "/changes/";
		sModuleName += sCodeRef.replace(/\.js/g, "");

		const oChangeSpecificData = {
			changeType: this.getChangeType(),
			codeRef: this.getCodeRef(),
			controllerName: sControllerName,
			reference: sReference,
			moduleName: sModuleName,
			generator: "sap.ui.rta.command.ExtendControllerCommand"
		};

		return ChangesWriteAPI.create({
			changeSpecificData: oChangeSpecificData,
			selector: oAppComponent
		});
	};

	ExtendControllerCommand.prototype.execute = function() {
		return Promise.resolve();
	};

	ExtendControllerCommand.prototype.undo = function() {
		return Promise.resolve();
	};

	/**
	 * For the extended controller commands to take effect, restart the app. This reloads the models.
	 */
	ExtendControllerCommand.prototype.needsReload = true;

	return ExtendControllerCommand;
});
