/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/FlexCommand"
], function(FlexCommand) {
	"use strict";

	/**
	 * Split a control/element
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.ui.rta.command.Split
	 * @experimental Since 1.46. This class is experimental and provides only limited functionality. Also the API might be
	 *							 changed in future.
	 */
	var Split = FlexCommand.extend("sap.ui.rta.command.Split", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				newElementIds : {
					type : "string[]"
				},
				source : {
					type : "any"
				},
				parentElement : {
					type : "any"
				}
			},
			associations : {},
			events : {}
		}
	});

	/**
	 * @override
	 */
	Split.prototype._getChangeSpecificData = function() {
		var mSpecificInfo = {
			newElementIds : this.getNewElementIds(),
			sourceControlId : this.getSource().getId(),
			changeType : this.getChangeType(),
			parentId : this.getParentElement().getId()
		};
		return mSpecificInfo;
	};

	return Split;
});
