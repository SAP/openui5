sap.ui.define([
	"sap/ui/core/routing/History",
	"sap/ui/core/routing/HashChanger",
	"sap/base/util/Deferred",
	"sap/ui/base/EventProvider"
], function(History, HashChanger, Deferred, EventProvider) {
	"use strict";

	var oReady;

	var oHashChanger = HashChanger.getInstance();
	oHashChanger.init();

	var oHistory = History.getInstance();
	var oHashSynchronizer = new EventProvider();

	var iFrameId = "iframe1";
	var mActions = {
		updateHash: function(oEvent) {
			var sHash = oEvent.data.hash,
				sDirection = oEvent.data.direction;

			if (sHash === oHashChanger.getHash()) {
				oHashSynchronizer.fireEvent("finish");
			} else {
				oHashChanger.replaceHash(sHash, sDirection);
			}
		},
		iFrameInit: function(oEvent) {
			var sHash = oHashChanger.getHash();
			document.getElementById(iFrameId).contentWindow.postMessage({
				action: "updateHash",
				hash: sHash
			}, "*");
		},
		iFrameReady: function(oEvent) {
			oReady.resolve();
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
		var oIFrame = document.getElementById(iFrameId);
		if (oIFrame) {
			oIFrame.contentWindow.postMessage({
				action: "updateHash",
				hash: sHash,
				direction: oHistory.getDirection()
			}, "*");
		}
	});

	return {
		createIFrame: function() {
			oReady = new Deferred();

			var oParentDOM = document.getElementById("qunit-fixture");
			var oIFrame = document.createElement("iframe");
			oIFrame.width = "100%";
			oIFrame.height = "400px";
			oIFrame.src = "fixture/historyIframe/iframe/index.html";
			oIFrame.id = iFrameId;
			oParentDOM.appendChild(oIFrame);

			return oReady.promise;
		},
		setHash: function(sHash) {
			var oFinish = new Deferred();

			oHashSynchronizer.attachEventOnce("finish", function() {
				oFinish.resolve();
			});

			oHashChanger.setHash(sHash);

			return oFinish.promise;
		},
		replaceHash: function(sHash) {
			var oFinish = new Deferred();

			oHashSynchronizer.attachEventOnce("finish", function() {
				oFinish.resolve();
			});

			oHashChanger.replaceHash(sHash);

			return oFinish.promise;
		},
		getDirection: function() {
			return oHistory.getDirection();
		},
		waitForHashChange: function() {
			var oFinish = new Deferred();
			oHashSynchronizer.attachEventOnce("finish", function() {
				oFinish.resolve();
			});

			return oFinish.promise;
		},
		removeIFrame: function() {
			document.getElementById(iFrameId).remove();
		}
	};
});
