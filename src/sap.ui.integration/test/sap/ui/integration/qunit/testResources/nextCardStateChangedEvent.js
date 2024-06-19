sap.ui.define([
	"sap/base/util/Deferred"
], (Deferred) => {
	"use strict";

	return (card) => {
		const deferred = new Deferred();

		card.attachEventOnce("stateChanged", deferred.resolve);

		return deferred.promise;
	};
});