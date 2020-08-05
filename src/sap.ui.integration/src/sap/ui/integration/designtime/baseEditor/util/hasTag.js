/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/restricted/_intersection"
], function(
	_intersection
) {
	"use strict";

	/**
	 * Checks if the property editor configuration matches the specified list of tags
	 *
	 * Usage examples:
	 *
	 * hasTag({
	 *   tags: ["foo", "bar"]
	 * }, "foo");
	 * -> true
	 *
	 * hasTag({
	 *   tags: ["foo", "bar", "baz"]
	 * }, ["foo", "bar"]);
	 * -> true
	 *
	 * hasTag({
	 *   tags: ["foo", "bar"]
	 * }, ["foo", "baz"]);
	 * -> false
	 *
	 * @param {object} mConfig - Property editor configuration
	 * @param {string[]} [mConfig.tags] - List of tags in the configuration object
	 * @param {string|string[]} vTag - Tags for validation
	 * @returns {boolean} <code>true</code> is config fulfills specified tags
	 *
	 * @alias module:sap/ui/integration/designtime/baseEditor/util/hasTag
	 * @since 1.77
	 *
	 * @private
	 * @experimental
	 * @ui5-restricted
	 */

	return function hasTag(mConfig, vTag) {
		var aTags = [].concat(vTag);

		return (
			Array.isArray(mConfig.tags)
			&& _intersection(aTags, mConfig.tags).length === aTags.length
		);
	};
});