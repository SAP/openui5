/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/rta/command/FlexCommand"], function(FlexCommand) {
	"use strict";

	/**
	 * Rename Element from one place to another
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.Rename
	 */
	var Rename = FlexCommand.extend("sap.ui.rta.command.Rename", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				renamedElement: {
					type: "object"
				},
				newValue: {
					type: "string",
					defaultValue: "new text"
				}
			},
			associations: {},
			events: {}
		}
	});

	Rename.prototype._getChangeSpecificData = function() {
		var mSpecificInfo = {
			changeType: this.getChangeType(),
			renamedElement: {
				id: this.getRenamedElement().getId()
			},
			value: this.getNewValue()
		};

		return mSpecificInfo;
	};

	return Rename;
});
