/* globals QUnit */
sap.ui.define([
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/fl/FakeLrepLocalStorage",
	"sap/ui/core/ComponentContainer"
], function(
	FakeLrepConnectorLocalStorage,
	FakeLrepLocalStorage,
	ComponentContainer
) {
	"use strict";

	var RtaQunitUtils = {};

	RtaQunitUtils.renderTestModuleAt = function(sNamespace, sDomId){
		var oComp = sap.ui.getCore().createComponent({
			name : "sap.ui.rta.test",
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
		FakeLrepConnectorLocalStorage.enableFakeConnector();

		var oComp = sap.ui.getCore().createComponent({
			name : "sap.ui.rta.test",
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

	RtaQunitUtils.waitForChangesToReachedLrepAtTheEnd = function(iNumberOfChanges, assert) {
		var done = [];
		for (var i = 0; i < iNumberOfChanges; i++) {
			done.push(assert.async());
		}
		var iChangeCounter = 0;
		var fnAssert = function() {
			iChangeCounter++;
			if (iChangeCounter === iNumberOfChanges) {
				FakeLrepLocalStorage.detachModifyCallback(fnAssert);
				assert.equal(iChangeCounter, iNumberOfChanges, "then the rta changes are written to LREP");
			}
			done[iChangeCounter - 1]();
		};

		FakeLrepLocalStorage.attachModifyCallback(fnAssert);
	};

	RtaQunitUtils.removeTestViewAfterTestsWhenCoverageIsRequested = function(){
		QUnit.done(function(details) {
			// If coverage is requested, remove the view to not overlap the coverage result
			if (QUnit.config.coverage == true && details.failed === 0) {
				jQuery("#test-view").hide();
			}
		});
	};

	return RtaQunitUtils;
}, /* bExport= */true);
