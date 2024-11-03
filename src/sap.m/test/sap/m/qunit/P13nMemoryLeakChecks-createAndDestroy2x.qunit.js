sap.ui.define([
  "sap/ui/thirdparty/jquery"
], function(jQuery0) {
  "use strict";
  // Note: the HTML page 'P13nMemoryLeakChecks-createAndDestroy2x.qunit.html' loads this module via data-sap-ui-on-init

  QUnit.config.autostart = false;
  jQuery0(function() {
	  /* global QUnit */
	  sap.ui.require(
		  [
			  "jquery.sap.global",
			  "sap/ui/VersionInfo",
			  "sap/ui/core/Element",
			  "sap/ui/core/ElementRegistry",
			  "sap/ui/core/Lib",
			  "sap/ui/test/utils/nextUIUpdate"
		  ],
		  async function(jQuery, VersionInfo, Element, ElementRegistry, Library, nextUIUpdate) {
			  var iAllControls = 0,
				  iFullyTestedControls = 0,
				  iTestedWithoutRenderingControls = 0;

			  const noop = () => {};

			  /**
			   * Iterates over all loaded libraries, but also all available libraries and tries to load them and their control lists.
			   * @returns an object that maps each library name to an array of control names in this library
			   */
			  async function loadAllAvailableLibraries() {

				  var mLoadedLibraries = {};

				  // Maybe libraries have been added, so discover what is available in order to also test them. But only do this when we are in sapui5.runtime layer, not when this test is executed in dist layer.
				  var oInfo = await VersionInfo.load();
				  for (var i = 0; i < oInfo.libraries.length; i++) {
					  var sInfoLibName = oInfo.libraries[i].name;
					  try {
						  var oLibrary = await Library.load(sInfoLibName);
						  mLoadedLibraries[sInfoLibName] = oLibrary.controls;
						  Log.info("Library '" + sInfoLibName + "...successfully.");
					  } catch (e) {
						  // not a control lib? This happens for e.g. "sap.ui.server.java"...
					  }
				  }

				  return mLoadedLibraries;
			  }


			  // gets a snapshot of all currently registered controls (keyed by their ID)
			  function getAllAliveControls() {
				  return ElementRegistry.all();
			  }


			  // asserts that both given maps have the same entries
			  QUnit.assert.equalElementsInControlList = function(mActual, mExpected, sMessage) {
				  var aUnexpectedElements = [];

				  for (var sId in mActual) {
					  if (!mExpected[sId]) {
						  aUnexpectedElements.push(oActualElement = mActual[sId]);
					  }
				  }

				  // enrich with helpful info to more easily identify the leaked control
				  for (var i = 0; i < aUnexpectedElements.length; i++) {
					  if (aUnexpectedElements[i].getText) {
						  aUnexpectedElements[i] += " (text: '" + aUnexpectedElements[i].getText() + "')";
					  }
				  }
				  this.push(aUnexpectedElements.length === 0, aUnexpectedElements.join(", "), "", sMessage);
			  };


			  // tries to fill all control properties with string values (hoping this might trigger more leaks)
			  var fillControlProperties = function(oControl) {
				  var mProperties = oControl.getMetadata().getAllProperties();

				  for (var sPropertyName in mProperties) {
					  var oProperty = mProperties[sPropertyName];
					  try {
						  oControl[oProperty._sMutator]("test"); // just try a string for everything now, TODO: check type
					  } catch (e) {
						  // type check error, ignore
					  }
				  }
				  oControl.setTooltip("test"); // seems not to be a property...
			  };



			  // checks whether the control with the given name should for some reason not be tested
			  var shouldIgnoreControl = function(sControlName, assert) {
				  // ignore controls which are known not to work standalone - some of them cannot work, some might need to be improved
				  if (sControlName === "sap.ui.commons.SearchField.CB" ||
					  sControlName === "sap.ui.commons.SearchFieldCB" ||
					  sControlName === "sap.ui.commons.Accordion" ||
					  sControlName === "sap.ui.core.ComponentContainer" ||
					  sControlName === "sap.ui.core.UIComponent" ||
					  sControlName === "sap.ui.core.mvc.HTMLView" ||
					  sControlName === "sap.ui.core.mvc.JSONView" ||
					  sControlName === "sap.ui.core.mvc.JSView" ||
					  sControlName === "sap.ui.core.mvc.XMLView" ||
					  sControlName === "sap.ui.core.mvc.TemplateView" ||
					  sControlName === "sap.ui.core.mvc.View" ||
					  sControlName === "sap.ui.core.tmpl.Template" ||
					  sControlName === "sap.m.FacetFilterItem" ||
					  sControlName === "sap.m.LightBox" ||
					  sControlName === "sap.m.NotificationListItem" ||
					  sControlName === "sap.m.TimePickerSlider" ||
					  sControlName === "sap.m.TimePickerSliders" ||
					  sControlName === "sap.m.Wizard" ||
					  sControlName === "sap.tnt.NavigationList" ||
					  sControlName === "sap.ui.layout.BlockLayoutRow" ||
					  sControlName === "sap.ui.suite.TaskCircle" ||
					  sControlName === "sap.ui.ux3.ActionBar" ||
					  sControlName === "sap.ui.ux3.ExactList.LB" ||
					  sControlName === "sap.uxap.AnchorBar" ||
					  sControlName === "sap.uxap.BreadCrumbs" ||
					  sControlName === "sap.uxap.ObjectPageSubSection"
				  ) { // known to be untestable
					  assert.ok(true, "WARNING: " + sControlName + " cannot be tested and has therefore been EXCLUDED.");
					  return true;
				  }

				  // ignore controls with known memory leaks - FIXME: reduce this list after the leaks have been fixed
				  if (
					  //sControlName === "sap.m.P13nDimMeasurePanel" || // Ticket: 1670353042
					  //sControlName === "sap.m.P13nFilterPanel" || // Ticket: 1670353042
					  //sControlName === "sap.m.P13nSortPanel" || // Ticket: 1670353042
					  //sControlName === "sap.m.P13nConditionPanel" || // Ticket: 1670353042
					  sControlName === "sap.m.QuickViewPage" || // Ticket: 1670352810
					  sControlName === "sap.m.ViewSettingsPopover" // Ticket: 1670352807
				  ) { // known to be leaking
					  assert.ok(true, "WARNING: " + sControlName + " is known to have memory leaks and is ignored until they are fixed.");
					  return true;
				  }
			  };



			  // Creates and renders two instances of the given control and asserts that the second instance does not leak any controls after destruction.
			  // Has some special logic to ignore or work around problems where certain controls do not work standalone.
			  async function checkControl(sControlName, assert) {
				  //	if (sControlName != "sap.m.P13nConditionPanel") {
				  //		return;
				  //	}

				  // Control Instance 1 - some control types statically create something for re-use across all instances

				  const oControlClass = await new Promise((resolve ,reject) => {
					  sap.ui.require([sControlName.replace(/\./g, "/")], (fnClass) => {
						  resolve(fnClass)
					  }, (err) => {
						  resolve(undefined)
					  });
				  });
				  if ( oControlClass == null ) {
					  return;
				  }

				  var oControl1 = new oControlClass();

				  getAllAliveControls();

				  if (sControlName !== "sap.m.PlanningCalendar") {
					  fillControlProperties(oControl1);
				  }

				  if (oControl1.placeAt) {

					  var oRenderer;
					  try {
						  oRenderer = oControl1.getMetadata().getRenderer();
					  } catch (e) {
						  // ignoring this control's rendering, message is written below
					  }

					  if (oRenderer) {
						  oControl1.placeAt(CONTENT_DIV_ID);
						  await nextUIUpdate().catch(noop);
					  } else {
						  // reported below
					  }
				  } else {
					  // reported below
				  }
				  oControl1.destroy();


				  // Control Instance 2 - any new controls leaked?

				  var mPreElements = getAllAliveControls(),

				  oControl2 = new oControlClass();
				  if (sControlName !== "sap.m.PlanningCalendar") {
					  fillControlProperties(oControl2);
				  }
				  if (oControl2.placeAt) {
					  var oRenderer;
					  try {
						  oRenderer = oControl2.getMetadata().getRenderer();
					  } catch (e) {
						  // ignoring this control's rendering, message is written below
					  }

					  if (oRenderer) {
						  oControl2.placeAt(CONTENT_DIV_ID);
						  await nextUIUpdate().catch(noop);
						  iFullyTestedControls++;
					  } else {
						  iTestedWithoutRenderingControls++;
						  assert.ok(true, "WARNING: " + sControlName + " does not have a renderer - NOT RENDERING THIS CONTROL");
					  }

				  } else {
					  iTestedWithoutRenderingControls++;
					  assert.ok(true, "WARNING: " + sControlName + " does not have a placeAt method - NOT RENDERING THIS CONTROL");
				  }

				  // check what's left after destruction
				  oControl2.destroy();


				  var oControl3 = new oControlClass();
				  if (sControlName !== "sap.m.PlanningCalendar") {
					  fillControlProperties(oControl3);
				  }
				  if (oControl3.placeAt) {
					  var oRenderer;
					  try {
						  oRenderer = oControl3.getMetadata().getRenderer();
					  } catch (e) {
						  // ignoring this control's rendering, message is written below
					  }

					  if (oRenderer) {
						  oControl3.placeAt(CONTENT_DIV_ID);
						  await nextUIUpdate().catch(noop);
						  iFullyTestedControls++;
					  } else {
						  iTestedWithoutRenderingControls++;
						  assert.ok(true, "WARNING: " + sControlName + " does not have a renderer - NOT RENDERING THIS CONTROL");
					  }

				  } else {
					  iTestedWithoutRenderingControls++;
					  assert.ok(true, "WARNING: " + sControlName + " does not have a placeAt method - NOT RENDERING THIS CONTROL");
				  }

				  // check what's left after destruction
				  oControl3.destroy();


				  var mPostElements = getAllAliveControls();

				  // controls left over by second instance are real leaks that will grow proportionally to instance count => ERROR
				  assert.equalElementsInControlList(mPostElements, mPreElements, "Memory leak check in " + sControlName);

				  // controls left over by first instance are either real leaks or one-time static leaks, which we accept
				  //assert.equalElementsInControlList(mPreElements, mPrePreElements, "Static leak check (WARNING ONLY!!) in " + sControlName);
			  };



			  var CONTENT_DIV_ID = "QUNIT_TEST_CONTENT_DIV",
			  oContentDomElement;

			  QUnit.module("Memory.Controls", {
				  before() {
					  oContentDomElement = document.createElement("div");
					  oContentDomElement.id = CONTENT_DIV_ID;
					  document.body.appendChild(oContentDomElement);
				  },
				  after() {
					  document.body.removeChild(oContentDomElement);
				  }
			  });


			  // Actual Tests


			  var mAllLibraries = await loadAllAvailableLibraries();


			  // sanity check to make sure this is actually testing something
			  QUnit.test("Should load at least several expected libraries and lots of controls", function(assert) {
				  assert.ok(mAllLibraries["sap.ui.core"], "Should have loaded the basic sap.ui.core library");
				  assert.ok(mAllLibraries["sap.m"], "Should have loaded the declared sap.m library");
				  assert.ok(mAllLibraries["sap.ui.layout"], "Should have loaded the non-declared but always existing sap.ui.layout library");

				  assert.ok(mAllLibraries["sap.ui.core"].length >= 10, "Should find at least 10 controls in sap.ui.core");
				  assert.ok(mAllLibraries["sap.m"].length >= 50, "Should find at least 50 controls in sap.m");
				  assert.ok(mAllLibraries["sap.ui.layout"].length >= 10, "Should find at least 10 controls in sap.ui.layout");
			  });



			  // loop over all libs and controls and create a test for each
			  for (const sLibName in mAllLibraries) {

				  QUnit.test("test " + sLibName + " controls", async function(assert) {
					  if (!mAllLibraries[sLibName].length) { // there are libraries with no controls
						  assert.expect(0);
					  }

					  for (var i = 0; i < mAllLibraries[sLibName].length; i++) {
						  var sControlName = mAllLibraries[sLibName][i];

						  if (sControlName) {
							  iAllControls++;

							  if (!shouldIgnoreControl(sControlName, assert)) {
								  await checkControl(sControlName, assert);
							  }
						  }
					  }

				  });

			  }


			  // make some numbers visible and ensure stuff was tested
			  QUnit.test("Statistics", function(assert) {
				  assert.ok(true, "Total number of found controls: " + iAllControls);
				  assert.ok(true, "Number of fully tested controls: " + iFullyTestedControls);
				  assert.ok(true, "Number of controls tested without rendering: " + iTestedWithoutRenderingControls);

				  assert.ok(iFullyTestedControls >= 200 /* magic number... just make sure we have tested lots of controls */ , "Should have tested lots of controls, at least 200");
			  });

			  QUnit.start();
		  }
	  );

  });
});