sap.ui.define([
  "sap/m/P13nPanel",
  "sap/ui/core/mvc/XMLView"
], function(P13nPanel, XMLView) {
  "use strict";
  // Note: the HTML page 'P13nPanel.qunit.html' loads this module via data-sap-ui-on-init

  (function () {
	  QUnit.module("sap.m.P13nPanel: Initialization via JS", {
		  beforeEach: function () {
		  },
		  afterEach: function () {
		  }
	  });
	  QUnit.test("Test", function (assert) {
		  assert.ok(new P13nPanel(), "Note: currently it is allowed to create an abstract class");
	  });

	  QUnit.module("sap.m.P13nPanel: Initialization via XML", {
		  beforeEach: function () {
		  },
		  afterEach: function () {
		  }
	  });
	  QUnit.test("Test", async function(assert) {
		  var sXml = [
			  '<core:View xmlns:core="sap.ui.core" xmlns:m="sap.m" xmlns="http://www.w3.org/1999/xhtml">',
			  '	<m:P13nPanel/>',
			  '</core:View>'
		  ].join('');
		  return (await XMLView.create({
			  definition: sXml
		  })).loaded().then(function (oView) {
			  assert.ok(oView);
			  assert.ok(oView.getContent()[0], "Note: currently it is allowed to create an abstract class");
			  assert.equal(oView.getContent()[0].getMetadata().getName(), "sap.m.P13nPanel");
		  });
	  });
  }());
});