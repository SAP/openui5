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
	 * Combine fields
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.ui.rta.command.Combine
	 * @experimental Since 1.46. This class is experimental and provides only limited functionality. Also the API might be
	 *							 changed in future.
	 */
	var Combine = FlexCommand.extend("sap.ui.rta.command.Combine", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				source : {
					type : "any"
				},
				combineElements : {
					type : "any[]"
				}
			},
			associations : {},
			events : {}
		}
	});

	/**
	 * @override
	 */
	Combine.prototype._getChangeSpecificData = function() {
		var aFieldIds = [];
		this.getCombineElements().forEach(function(oField) {
			aFieldIds.push(oField.getId());
		});
		var mSpecificInfo = {
			changeType : this.getChangeType(),
			sourceControlId : this.getSource().getId(),
			combineElementIds : aFieldIds
		};
		return mSpecificInfo;
	};

	return Combine;
});
