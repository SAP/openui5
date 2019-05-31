/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/rta/command/FlexCommand"], function(FlexCommand) {
	"use strict";

	/**
	 * CustomAdd Command
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.62
	 * @alias sap.ui.rta.command.CustomAdd
	 * @experimental Since 1.62. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var CustomAdd = FlexCommand.extend("sap.ui.rta.command.CustomAdd", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				index : {
					type: "int"
				},
				addElementInfo: {
					type: "object"
				},
				aggregationName: {
					type: "string"
				},
				customItemId: {
					type: "string"
				}
			}
		}
	});

	CustomAdd.prototype._getChangeSpecificData = function() {
		var mSpecificChangeInfo = {
			customItemId: this.getCustomItemId(),
			changeType : this.getChangeType(),
			index: this.getIndex(),
			addElementInfo: this.getAddElementInfo(),
			aggregationName: this.getAggregationName()
		};
		return mSpecificChangeInfo;
	};

	return CustomAdd;
}, /* bExport= */true);
