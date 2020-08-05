/*!
 * ${copyright}
 */
/**
 * See {@link https://lodash.com/docs/4.17.19#debounce}
 *
 * @function
 * @alias module:sap/base/util/restricted/_debounce
 * @author SAP SE
 * @since 1.71
 * @version ${version}
 * @private
 * @ui5-restricted
*/
sap.ui.define([
	"sap/base/util/restricted/_/lodash.custom"
], function(lodash) {
	"use strict";
	return lodash.debounce;
});