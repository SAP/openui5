/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/rta/command/FlexCommand'], function(jQuery, FlexCommand) {
	"use strict";

	/**
	 * Create new container
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.CreateContainer
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var CreateContainer = FlexCommand.extend("sap.ui.rta.command.CreateContainer", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				index : {
					type : "int"
				},
				newControlId : {
					type : "string"
				},
				label : {
					type : "string"
				}
			},
			associations : {},
			events : {}
		}
	});

	CreateContainer.prototype._getChangeSpecificData = function(bForward) {

		var mSpecificInfo = {
			changeType : this.getChangeType(),
			index : this.getIndex(),
			newControlId : this.getNewControlId(),
			newLabel : this.getLabel()
		};

		return mSpecificInfo;
	};

	return CreateContainer;

}, /* bExport= */true);
