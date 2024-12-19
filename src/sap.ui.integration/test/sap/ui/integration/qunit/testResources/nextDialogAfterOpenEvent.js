sap.ui.define([
	"sap/base/util/Deferred"
], (Deferred) => {
	"use strict";

	return (oDialog) => {
		const deferred = new Deferred();

		oDialog.attachEventOnce("afterOpen", deferred.resolve);

		return deferred.promise;
	};
});