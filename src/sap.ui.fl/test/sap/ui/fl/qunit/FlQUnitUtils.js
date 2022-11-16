sap.ui.define([], function() {
	"use strict";

	var FlQUnitUtils = {};

	/**
	 * Stubs the function sap.ui.require. The aStubInformation property expects an object with the following properties:
	 * name: this path will be stubbed in the sap.ui.require. Can be a string (sync request) or array
	 * stub: the new return value for that path. Can be an object directly or an array in case of multiple paths
	 * error: only valid for async case. If set the error function is used instead of the success function
	 *
	 * @param {object} sandbox - Sinon or sandbox instance
	 * @param {object[]} aStubInformation - Information about the needed stubs
	 * @returns {object} The stub
	 */
	FlQUnitUtils.stubSapUiRequire = function(sandbox, aStubInformation) {
		var oRequireStub = sandbox.stub(sap.ui, "require");
		aStubInformation.forEach(function(oStubInformation) {
			oRequireStub
				.withArgs(oStubInformation.name)
				.callsFake(function(sModuleName, fnSuccess, fnError) {
					// the function can be called synchronously, then there is no success / error function
					// and the stub has to be returned directly
					if (!fnSuccess) {
						return oStubInformation.stub;
					}
					if (oStubInformation.error) {
						fnError(oStubInformation.stub);
					} else {
						fnSuccess(oStubInformation.stub);
					}
				});
		});
		oRequireStub.callThrough();
		return oRequireStub;
	};

	/**
	 * Stubs the sap.ui.require function and calls the check function with every path that is requested.
	 * If that function returns true the call is stubbed and the passed stub is returned.
	 * Otherwise the original require function is called.
	 *
	 * @param {object} sandbox - Sinon or sandbox instance
	 * @param {function} fnCheck - Check function
	 * @param {object} oStub - Stub to be returned by sap.ui.define
	 * @returns {object} The Stub
	 */
	FlQUnitUtils.stubSapUiRequireDynamically = function(sandbox, fnCheck, oStub) {
		var oRequireStub = sandbox.stub(sap.ui, "require");
		oRequireStub.callsFake(function(vModuleName, fnSuccess) {
			if (fnCheck(vModuleName)) {
				if (oStub) {
					fnSuccess(oStub);
				} else {
					fnSuccess();
				}
			} else {
				oRequireStub.wrappedMethod.apply(this, arguments);
			}
		});
		return oRequireStub;
	};

	return FlQUnitUtils;
});
