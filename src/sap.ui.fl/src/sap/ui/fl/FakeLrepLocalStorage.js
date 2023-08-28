/*!
 * ${copyright}
 */

sap.ui.define([
], function(

) {
	return {
		deleteChanges() {
			return undefined/*FakeLrepConnectorLocalStorage*/.forTesting.synchronous.clearAll();
		}
	};
}, /* bExport= */ true);
