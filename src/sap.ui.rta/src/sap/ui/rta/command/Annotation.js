/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/FlexCommand"
], function(
	FlexCommand
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
	 * @since 1.128
	 * @alias sap.ui.rta.command.Annotation
	 */
	var AnnotationCommand = FlexCommand.extend("sap.ui.rta.command.Annotation", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				content: {
					type: "any",
					group: "content"
				}
			},
			events: {}
		}
	});

	/**
	 * For annotation commands to take effect the app needs to be restarted as the models need to be reloaded.
	 */
	AnnotationCommand.prototype.needsReload = true;

	return AnnotationCommand;
});
