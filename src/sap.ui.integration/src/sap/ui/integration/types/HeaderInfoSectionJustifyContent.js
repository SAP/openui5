/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";

	/**
	 * Defines how the space is distributed between and around content items
	 * @enum {string}
	 * since 1.136
	 * @private
	 */
	var HeaderInfoSectionJustifyContent = {
		/**
		 * Flex items are evenly distributed in the line.
		 */
		SpaceBetween: "SpaceBetween",
		/**
		 * Flex items are packed toward the end of the line.
		 */
		End: "End",
		/**
		 * Flex items are packed toward the start of the line.
		 */
		Start: "Start"
	};

	DataType.registerEnum("sap.ui.integration.types.HeaderInfoSectionJustifyContent", HeaderInfoSectionJustifyContent);

	return HeaderInfoSectionJustifyContent;
});