

/*!
 * ${copyright}
 */

// sap.ui.mdc.BaseDelegate
sap.ui.define(['sap/ui/mdc/enum/BaseType', 'sap/ui/mdc/DefaultTypeMap', "sap/base/Log"], function (BaseType, DefaultTypeMap, Log) {
	"use strict";

	/**
	 * Basic Delegate for {@link sap.ui.mdc.Control}, {@link sap.ui.mdc.Element}<br>
	 *
	 * All delegate implementations for MDC controls must be derived directly or indirectly from this entity.
	 *
	 * <b>Note:</b> The method getTypeUtil is final. Please implement {@link sap.ui.mdc.BaseDelegate.getTypeMap getTypeMap} to customize type configuration for your usage-scenarios.
	 *
	 * @namespace
	 * @alias module:sap/ui/mdc/BaseDelegate
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @experimental
	 * @since 1.79.0
	 */
	var BaseDelegate = {};

	/**
	* Returns a TypeUtil for this delegate.
	*
	* <b>Note:</b>
	* Since 1.114.0 <code>getTypeUtil</code> is final!
	* Applications should implement {@link sap.ui.mdc.BaseDelegate.getTypeMap getTypeMap} instead to provide type mappings.
	* Please also see the following extensible presets: {@link sap.ui.mdc.DefaultTypeMap}, {@link sap.ui.mdc.odata.TypeMap}, {@link sap.ui.mdc.odata.v4.TypeMap}
	*
	* @param {object} oPayload Delegate payload object
	* @return {sap.ui.mdc.util.TypeUtil|sap.ui.mdc.util.TypeMap} configured TypeUtil/TypeMap
	* @since 1.79.0
	*
	*/
	BaseDelegate.getTypeUtil = function (oPayload) {
		return this.getTypeMap(oPayload);
	};



	/**
	 * Returns the typeutil configuration for this delegate.
	 *
	 * @param {object} oPayload Delegate payload object
	 * @return {sap.ui.mdc.util.TypeMap} typeMap configuration for this delegate
	 * Note: The returned array will also serve as a key in the weakmap-based typeutil cache of BaseDelegate
	 * @since 1.114.0
	 */
	BaseDelegate.getTypeMap = function (oPayload) {
		return DefaultTypeMap;
	};

	return BaseDelegate;
});
