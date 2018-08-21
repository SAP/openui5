sap.ui.define([
	"sap/ui/fl/FakeLrepConnectorSessionStorage",
	"sap/ui/fl/FakeLrepSessionStorage",
	"sap/ui/core/ComponentContainer"
], function(
	FakeLrepConnectorSessionStorage,
	FakeLrepSessionStorage,
	ComponentContainer
) {
	"use strict";

	var RtaQunitUtils = {};

	RtaQunitUtils.renderTestModuleAt = function(sNamespace, sDomId){
		var oComp = sap.ui.getCore().createComponent({
			name : "sap.ui.rta.qunitrta",
			id : "Comp1",
			settings : {
				componentData : {
					"showAdaptButton" : true
				}
			}
		});

		var oCompCont = new ComponentContainer({
			component: oComp
		}).placeAt(sDomId);
		sap.ui.getCore().applyChanges();

		return oCompCont;
	};

	RtaQunitUtils.renderTestAppAt = function(sDomId){
		FakeLrepConnectorSessionStorage.enableFakeConnector();

		var oComp = sap.ui.getCore().createComponent({
			name : "sap.ui.rta.qunitrta",
			id : "Comp1",
			settings : {
				componentData : {
					"showAdaptButton" : true
				}
			}
		});

		var oCompCont = new ComponentContainer({
			component: oComp
		}).placeAt(sDomId);
		sap.ui.getCore().applyChanges();

		return oCompCont;
	};

	RtaQunitUtils.renderRuntimeAuthoringAppAt = function(sDomId){
		var oComp = sap.ui.getCore().createComponent({
			name : "sap.ui.rta.test",
			id : "Comp1",
			settings : {
				componentData : {
					"showAdaptButton" : true,
					"useSessionStorage": true
				}
			}
		});

		var oCompCont = new ComponentContainer({
			component: oComp
		}).placeAt(sDomId);
		sap.ui.getCore().applyChanges();

		return oCompCont;
	};

	RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd = function(iNumberOfChanges, assert) {
		var done = [];
		for (var i = 0; i < iNumberOfChanges; i++) {
			done.push(assert.async());
		}
		var iChangeCounter = 0;
		var fnAssert = function() {
			iChangeCounter++;
			if (iChangeCounter === iNumberOfChanges) {
				FakeLrepSessionStorage.detachModifyCallback(fnAssert);
				assert.equal(iChangeCounter, iNumberOfChanges, "then the rta changes are written to LREP");
			}
			done[iChangeCounter - 1]();
		};

		FakeLrepSessionStorage.attachModifyCallback(fnAssert);
	};

	// At the end of the test, the returning fnDetachEvent function must be called for clean up
	RtaQunitUtils.waitForExactNumberOfChangesInLrep = function(iNumberOfChanges, assert, sModifyType) {
		var done = [];
		for (var i = 0; i < iNumberOfChanges; i++) {
			done.push(assert.async());
		}
		var iChangeCounter = 0;
		var fnAssert = function(sPassedModifyType) {
			// Only collect operations of the given type
			if (sPassedModifyType !== sModifyType) {
				throw new Error("Unexpected LREP modification: Expected: " + sModifyType + ", but got " + sPassedModifyType);
			}
			iChangeCounter++;
			if (iChangeCounter === iNumberOfChanges) {
				assert.equal(iChangeCounter, iNumberOfChanges,
					"then " + iNumberOfChanges + " operations of type " + sModifyType + " happen in LREP");
			}
			if (iChangeCounter > iNumberOfChanges){
				assert.notOk(true, "Error: there are more " + sModifyType + " operations done in LREP than expected");
				return;
			}
			done[iChangeCounter - 1]();
		};
		var fnDetachEvent = function(){
			FakeLrepSessionStorage.detachModifyCallback(fnAssert);
		};

		FakeLrepSessionStorage.attachModifyCallback(fnAssert);

		return fnDetachEvent;
	};

	return RtaQunitUtils;
});
