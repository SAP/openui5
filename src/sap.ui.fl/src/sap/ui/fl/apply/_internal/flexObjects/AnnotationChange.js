/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject"
], function(
	FlexObject
) {
	"use strict";

	/**
	 * Flexibility AnnotationChange Class. Changes annotations on underlying V2 and V4 models.
	 *
	 * @class Flexibility Annotation Change Class.
	 * @extends sap.ui.fl.apply._internal.flexObjects.FlexObject
	 * @alias sap.ui.fl.apply._internal.flexObjects.AnnotationChange
	 * @since 1.128
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var AnnotationChange = FlexObject.extend("sap.ui.fl.apply._internal.flexObjects.AnnotationChange", {

		metadata: {
			properties: {
				/**
				 * The selector is required to enable the FlexCommand.
				 */
				selector: {
					type: "object",
					defaultValue: {}
				}
			}
		},

		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			FlexObject.apply(this, aArgs);
			this.setFileType("annotation_change");
		}

	});

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * @returns {object} Mapping information
	 * @static
	 */
	AnnotationChange.getMappingInfo = function() {
		return Object.assign(FlexObject.getMappingInfo(), {});
	};

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * Can be overridden to avoid access of static mapping within base methods.
	 * @returns {object} Mapping information
	 */
	AnnotationChange.prototype.getMappingInfo = function() {
		return AnnotationChange.getMappingInfo();
	};

	return AnnotationChange;
});