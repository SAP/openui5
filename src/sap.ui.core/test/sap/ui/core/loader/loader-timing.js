sap.ui.define([

], function () {
  "use strict";
  // Note: the HTML page 'loader-timing.html' loads this module via data-sap-ui-on-init

  sap.ui.loader.config({
	  paths: {
		  "fixture": "test-resources/sap/ui/core/loader/fixture"
	  }
  });

  async function sleep(ms) {
	  return new Promise((resolve) => setTimeout(() => resolve(), ms));
  }

  async function testDeepDependencies() {
	  console.time("require");
	  return new Promise((resolve) => {
		  sap.ui.require(["fixture/deepDependencies/deep1"], function(deep1) {
			  console.timeEnd("require");
			  resolve();
		  });
	  });
  }

  async function testBroadDependencies() {
	  console.time("require");
	  return new Promise((resolve) => {
		  sap.ui.require(["fixture/broadDependencies/broad1"], function(broad1) {
			  console.timeEnd("require");
			  resolve();
		  });
	  });
  }

  (async function main() {
	  await sap.ui.loader._.loadJSResourceAsync("fixture/custom-bundle.js");

	  await sleep(100);
	  await testDeepDependencies();

	  await sleep(100);
	  await testBroadDependencies();

	  document.body.insertAdjacentHTML("beforeEnd", "<div>FCP</div>");
  }());
});