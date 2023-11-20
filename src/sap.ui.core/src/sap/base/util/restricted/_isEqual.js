/*!
 * ${copyright}
 */
/**
 * See {@link https://lodash.com/docs/4.17.21#isEqual}
 *
 * @function
 * @alias module:sap/base/util/restricted/_isEqual
 * @author SAP SE
 * @since 1.80
 * @version ${version}
 * @private
 * @ui5-restricted
*/
sap.ui.define([
	"sap/base/util/restricted/_/lodash.custom"
], function(lodash) {
	"use strict";
	return lodash.isEqual;
});