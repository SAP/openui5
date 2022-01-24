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
	 * Resize command
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.101
	 * @alias sap.ui.rta.command.Resize
	 */
	var Resize = FlexCommand.extend("sap.ui.rta.command.Resize", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				// Generic structure is required as some implementations (e.g. Tables) create changes like in Settings action
				content: {
					type: "any",
					group: "content"
				},
				changeType: {
					type: "string",
					defaultValue: "resize"
				}
			},
			associations: {},
			events: {}
		}
	});

	return Resize;
});