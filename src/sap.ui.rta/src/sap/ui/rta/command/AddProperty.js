/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/FlexCommand"
], function(FlexCommand) {
	"use strict";

	/**
	 * Add new OData / delegate property to a control
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.78
	 * @alias sap.ui.rta.command.AddProperty
	 */
	var AddProperty = FlexCommand.extend("sap.ui.rta.command.AddProperty", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				index: {
					type: "int",
					group: "content"
				},
				newControlId: {
					type: "string",
					group: "content"
				},
				// the name "bindingPath" conflicts with getBindingPath() method from ManagedObject
				bindingString: {
					type: "string",
					group: "content"
				},
				modelType: {
					type: "string",
					group: "content"
				},
				relevantContainerId: {
					type: "string",
					group: "content"
				},
				parentId: {
					type: "string",
					group: "content"
				},
				oDataServiceVersion: {
					type: "string",
					group: "content"
				},
				oDataServiceUri: {
					type: "string",
					group: "oDataInformation"
				},
				propertyName: {
					type: "string",
					group: "oDataInformation"
				},
				entityType: {
					type: "string",
					group: "oDataInformation"
				}
			}
		}
	});

	AddProperty.prototype._getChangeSpecificData = function() {
		// general format
		return {
			changeType: this.getChangeType(),
			content: {
				index: this.getIndex(),
				newControlId: this.getNewControlId(),
				bindingPath: this.getBindingString(),
				parentId: this.getParentId(),
				// used to connect to default delegate
				modelType: this.getModelType(),
				// allow change handlers to access delegates if the change is not done on the relevant container
				relevantContainerId: this.getRelevantContainerId(),
				// used to connect to change handler mediator
				oDataServiceVersion: this.getODataServiceVersion()
			},
			// necessary for custom fields support tools
			oDataInformation: {
				oDataServiceUri: this.getODataServiceUri(),
				propertyName: this.getPropertyName(),
				entityType: this.getEntityType()
			}
		};
	};

	return AddProperty;
}, /* bExport= */true);
