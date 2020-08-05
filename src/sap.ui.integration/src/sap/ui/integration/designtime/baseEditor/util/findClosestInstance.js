/*!
 * ${copyright}
 */
sap.ui.define(function () {
	"use strict";

	/**
	 * Looks for an instance of a specified type up to hierarchy. If instance is a of specified type,
	 * then this instance will be returned, otherwise ascendants will be checked one by one. If no
	 * instance of a specified type is found, then `undefined` is returned.
	 *
	 * @param {sap.ui.base.ManagedObject} oControl - Control to start search from
	 * @param {string} sClassName - Class name to look for, e.g. sap.ui.integration.baseEditor.BaseEditor
	 * @returns {sap.ui.base.ManagedObject|undefined} - `undefined` if there is no control of a type in hierarchy
	 *
	 * @function
	 * @experimental
	 * @private
	 */
	return function (oControl, sClassName) {
		function findUp(oControl) {
			if (oControl) {
				if (oControl.isA(sClassName)) {
					return oControl;
				} else {
					return findUp(oControl.getParent());
				}
			}
		}
		return findUp(oControl);
	};
});
