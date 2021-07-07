sap.ui.define([
	"sap/ui/core/routing/History",
	"sap/ui/core/routing/HashChanger",
	"sap/base/util/Deferred",
	"sap/ui/base/EventProvider"
], function(History, HashChanger, Deferred, EventProvider) {
	"use strict";

	var oHashChanger = HashChanger.getInstance();
	var oHistory = History.getInstance();

	var bInit = false;
	var oHashSynchronizer = new EventProvider();

	var mActions = {
		updateHash: function(oEvent) {
			var sHash = oEvent.data.hash,
				sDirection = oEvent.data.direction;

			if (sHash === oHashChanger.getHash()) {
				oHashSynchronizer.fireEvent("finish");
			} else {
				oHashChanger.replaceHash(sHash, sDirection);
			}

			if (!bInit) {
				bInit = true;
				oHashChanger.init();
				window.parent.postMessage({
					action: "iFrameReady"
				}, "*");
			}
		}
	};

	window.addEventListener("message", function(oEvent) {
		var oData = oEvent.data;
		if (oData.action && mActions[oData.action]) {
			mActions[oData.action](oEvent);
		}
	});

	oHashChanger.attachEvent("hashChanged", function(oEvent) {
		var sHash = oEvent.getParameter("newHash");
		window.parent.postMessage({
			action: "updateHash",
			hash: sHash,
			direction: oHistory.getDirection()
		}, "*");
	});

	window.parent.postMessage({
		action: "iFrameInit"
	}, "*");

	window.setHash = function(sHash) {
		var oFinish = new Deferred();

		oHashSynchronizer.attachEventOnce("finish", function() {
			oFinish.resolve();
		});

		oHashChanger.setHash(sHash);

		return oFinish.promise;
	};

	window.replaceHash = function(sHash) {
		var oFinish = new Deferred();

		oHashSynchronizer.attachEventOnce("finish", function() {
			oFinish.resolve();
		});

		oHashChanger.replaceHash(sHash);

		return oFinish.promise;
	};

	window.getDirection = function() {
		return oHistory.getDirection();
	};

	window.waitForHashChange = function() {
		var oFinish = new Deferred();
		oHashSynchronizer.attachEventOnce("finish", function() {
			oFinish.resolve();
		});

		return oFinish.promise;
	};
});
