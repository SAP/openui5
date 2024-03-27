/*
 * ${copyright}
 */
sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Enumerations for p13n enum artifacts
	 * @namespace
	 * @name sap.m.p13n.enums
	 * @private
	 * @ui5-restricted sap.m.p13n
	 */

	/**
	 * Enumeration of the preferred persistence mode for personalization changes using the {@link sap.m.p13n.PersistenceProvider PersistenceProvider}
	 *
	 * @enum {string}
	 * @since 1.104
	 * @alias sap.m.p13n.enums.PersistenceMode
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 */
	const PersistenceMode = {
		/**
		 * Personalization changes are created in the SAPUI5 flexibility layer using <code>ignoreVariantManagement: true</code>
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Global: "Global",

		/**
		 * Personalization changes are created and implicitly persisted only if no additional <code>sap.ui.fl.variants.VariantManagement</code>
		 * control reference could be found. If a <code>sap.ui.fl.variants.VariantManagement</code> control has been found,
		 * it will be used instead.
		 *
		 * @private
		 * @ui5-restricted sap.fe
		 */
		Auto: "Auto",

		/**
		 * Personalization changes are never persisted. Using this mode will ensure that personalization changes are never persisted in a <code>sap.ui.fl.variants.VariantManagement</code>.
		 * This mode should be used whenever it is certain that a control mustn't persist its personalization state.
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.fe
		 */
		Transient: "Transient"
	};

	DataType.registerEnum("sap.m.p13n.enums.PersistenceMode", PersistenceMode);

	return PersistenceMode;
});