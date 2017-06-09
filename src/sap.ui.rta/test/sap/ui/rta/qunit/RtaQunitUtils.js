/* eslint-disable */
function renderTestModuleAt(sNamespace, sDomId){
	"use strict";
	var oComp = sap.ui.getCore().createComponent({
		name : "sap.ui.rta.test",
		id : "Comp1",
		settings : {
			componentData : {
				"showAdaptButton" : true
			}
		}
	});

	var oCompCont = new sap.ui.core.ComponentContainer({
		component: oComp
	}).placeAt(sDomId);
	sap.ui.getCore().applyChanges();

	return oCompCont;
}

function renderTestAppAt(sDomId){
	"use strict";
	jQuery.sap.require("sap.ui.fl.FakeLrepConnectorLocalStorage");
	sap.ui.fl.FakeLrepConnectorLocalStorage.enableFakeConnector();

	var oComp = sap.ui.getCore().createComponent({
		name : "sap.ui.rta.test",
		id : "Comp1",
		settings : {
			componentData : {
				"showAdaptButton" : true
			}
		}
	});

	var oCompCont = new sap.ui.core.ComponentContainer({
		component: oComp
	}).placeAt(sDomId);
	sap.ui.getCore().applyChanges();

	return oCompCont;
}

function waitForChangesToReachedLrepAtTheEnd(iNumberOfChanges, assert) {
	"use strict";
	var done = [];
	for (var i = 0; i < iNumberOfChanges; i++) {
		done.push(assert.async());
	}
	var iChangeCounter = 0;
	var fnAssert = function() {
		iChangeCounter++;
		if (iChangeCounter === iNumberOfChanges) {
			jQuery.sap.require("sap.ui.fl.FakeLrepLocalStorage");
			sap.ui.fl.FakeLrepLocalStorage.detachModifyCallback(fnAssert);
			assert.equal(iChangeCounter, iNumberOfChanges, "then the rta changes are written to LREP");
		}
		done[iChangeCounter - 1]();
	};

	sap.ui.fl.FakeLrepLocalStorage.attachModifyCallback(fnAssert);
}

function removeTestViewAfterTestsWhenCoverageIsRequested(){
	"use strict";
	QUnit.done(function(details) {
		// If coverage is requested, remove the view to not overlap the coverage result
		if (QUnit.config.coverage == true && details.failed === 0) {
			jQuery("#test-view").hide();
		}
	});
}
/* eslint-enable */
