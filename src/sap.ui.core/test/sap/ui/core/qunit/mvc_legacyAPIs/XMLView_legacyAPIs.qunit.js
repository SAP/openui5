/*global QUnit, sinon */
sap.ui.define([
	'sap/base/Log',
	'sap/base/i18n/Localization',
	"sap/ui/core/Element",
	'sap/ui/core/library',
	'sap/ui/core/mvc/View',
	'sap/ui/core/mvc/XMLView',
	'sap/ui/core/RenderManager',
	'sap/ui/model/json/JSONModel',
	'sap/ui/layout/VerticalLayout',
	'sap/ui/util/XMLHelper',
	'sap/m/Button',
	'sap/m/Panel',
	'./AnyView_legacyAPIs.qunit',
	'sap/ui/thirdparty/jquery',
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Log, Localization, Element, coreLibrary, View, XMLView, RenderManager, JSONModel, VerticalLayout, XMLHelper, Button, Panel, testsuite, jQuery, nextUIUpdate) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// shortcut
	function isPreserved(oDomRef) {
		return RenderManager.isPreservedContent(oDomRef);
	}

	function isInPreservedArea(oDomRef) {
		var oPreserveArea = RenderManager.getPreserveAreaRef();
		return !!(oPreserveArea.compareDocumentPosition(oDomRef) & Node.DOCUMENT_POSITION_CONTAINED_BY);
	}

	function dummyPlaceholder(oControl) {
		return document.getElementById(RenderManager.RenderPrefixes.Dummy + oControl.getId());
	}

	function invisiblePlaceholder(oControl) {
		return document.getElementById(RenderManager.RenderPrefixes.Invisible + oControl.getId());
	}

	// load the XML without parsing
	var sViewXML;
	var pViewXMLLoaded = Promise.resolve(
		jQuery.ajax({
			url: sap.ui.require.toUrl("example/mvc_legacyAPIs/test.view.xml"),
			dataType: "text"
		})
	).then(function(sResult) {
		sViewXML = sResult;
	});

	var oConfig = {
		viewClassName : "sap.ui.core.mvc.XMLView",
		idsToBeChecked : ["myPanel", "Button1", "localTableId"]
	};

	// run the full testset for a view loaded from a file
	testsuite(oConfig, "XMLView creation loading from file", function() {
		return sap.ui.xmlview("example.mvc_legacyAPIs.test");
	});

	// run the full testset for a view created from a string
	testsuite(oConfig, "XMLView creation via XML string", function() {
		// let the XMLView parse the XML string
		return sap.ui.xmlview({
			viewContent: sViewXML
		});
	});

	// run the full testset for a view created from an XML document
	testsuite(oConfig, "XMLView creation via XML document", function() {
		// parse the XML string and pass the XML document
		return sap.ui.xmlview({
			viewContent: XMLHelper.parse(sViewXML)
		});
	});

	// run the full testset for a view created from the root element of an XML document
	testsuite(oConfig, "XMLView creation via XML node", function() {
		// parse the XML string and pass the XML root element
		return sap.ui.xmlview({
			xmlNode: XMLHelper.parse(sViewXML).documentElement
		});
	});

	// run the full testset for a view created via the generic factory method
	testsuite(oConfig, "XMLView creation using generic view factory", function() {
		return sap.ui.view({
			type:ViewType.XML,
			viewName:"example.mvc_legacyAPIs.test",
			viewData:{test:"testdata"}
		});
	}, /* bCheckViewData = */ true);


	var sDefaultLanguage = Localization.getLanguage();

	QUnit.module("Apply settings", {
		beforeEach : function () {
			Localization.setLanguage("en-US");
		},
		afterEach : function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	// Settings can be provided at the constructor call or in the according view source. View source wins.

	QUnit.test("sync loading", function(assert) {
		// although settings are provided here, the resulting view should have the setting stated in the view source
		var oView = sap.ui.xmlview({
			viewName: 'example.mvc_legacyAPIs.test',
			displayBlock: false
		});
		assert.equal(oView.getDisplayBlock(), true, "DisplayBlock should be true");
		oView.destroy();
	});

	QUnit.test("async loading", function(assert) {
		var oView = sap.ui.xmlview({
			viewName: 'example.mvc_legacyAPIs.test',
			async: true,
			displayBlock: false
		});
		assert.equal(oView.getDisplayBlock(), false, "Displayblock should be false for the async-view stub");
		return oView.loaded().then(function() {
			assert.equal(oView.getDisplayBlock(), true, "DisplayBlock should be true for the resolved async view");
			oView.destroy();
		});
	});

	QUnit.module("Error handling", {
		before: function() {
			this.logSpyError = sinon.spy(Log, "error");
			this.logSpyWarning = sinon.spy(Log, "warning");
		},
		afterEach: function() {
			this.logSpyError.resetHistory();
			this.logSpyWarning.resetHistory();
		},
		after: function() {
			this.logSpyError.restore();
			this.logSpyWarning.restore();
		}
	});

	QUnit.test("[sap.ui.xmlview] broken binding string, error on top-level", function(assert) {
		var oView = sap.ui.xmlview({
			id: "syncView1",
			viewContent:
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:m='sap.m' xmlns:core='sap.ui.core'>" +
			"    <m:Panel>" +
			"       <m:Button id=\"brokenButtonInline\" text=\"{This should cause a parse error\"></m:Button>" +
			"    </m:Panel>" +
			"</mvc:View>"
		});

		// check for error log
		assert.ok(this.logSpyError.calledOnce);
		assert.strictEqual(
			this.logSpyError.getCall(0).args[0].message,
			"Error found in View (id: 'syncView1').\n" +
			"XML node: '<m:Button xmlns:m=\"sap.m\" id=\"brokenButtonInline\" text=\"{This should cause a parse error\"/>':\n" +
			"SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0",
			"Correct SyntaxError is logged"
		);

		// even "broken" controls should still be available (for compatibility)
		assert.ok(oView.byId("brokenButtonInline"), "Button with broken binding is still created.");

		// sync cases can be cleaned up
		oView.destroy();
	});

	QUnit.test("[sap.ui.xmlview] broken binding string, error in nested Fragment", function(assert) {
		var oView = sap.ui.xmlview({
			id: "syncView2",
			viewContent:
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:m='sap.m' xmlns:core='sap.ui.core'>" +
			"    <m:Panel>" +
			"       <core:Fragment id='innerFragment' fragmentName='testdata.fragments.XMLFragmentWithSyntaxErrors' type='XML'/>" +
			"    </m:Panel>" +
			"</mvc:View>"
		});

		// check for error log
		assert.ok(this.logSpyError.calledOnce);
		assert.deepEqual(
			this.logSpyError.getCall(0).args[0].message,
			"Error found in Fragment (id: 'syncView2--innerFragment').\n" +
			"XML node: '<m:Button xmlns:m=\"sap.m\" id=\"brokenButton\" text=\"{This should cause a parse error\"/>':\n" +
			"SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0",
			"Correct SyntaxError is logged"
		);

		// controls inside Fragment should still be available (for compatibility)
		assert.ok(oView.byId("innerFragment--brokenButton"), "Button with broken binding is still created.");

		// sync cases can be cleaned up
		oView.destroy();
	});

	QUnit.test("[sap.ui.xmlview] error caused by missing function reference (property-type 'function')", function(assert) {
		var oView = sap.ui.xmlview({
			id: "syncView3",
			viewContent:
			'<mvc:View xmlns="sap.m" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:html=\"http://www.w3.org/1999/xhtml\">' +
			'<Dialog id="dialog" title="XML Fragment Dialog" escapeHandler="closeDialog">' +
			'   <Text text="title" />                         ' +
			'   <buttons>                                              ' +
			'      <Button text="action!" press="doSomething" /> ' +
			'      <Button text="stuff" /> ' +
			'   </buttons>                                             ' +
			'</Dialog>                                                 ' +
			'</mvc:View>'
		});

		// check error log
		assert.ok(this.logSpyError.calledOnce);
		assert.deepEqual(
			this.logSpyError.getCall(0).args[0].message,
			"Error found in View (id: 'syncView3').\n" +
			"XML node: '<Dialog xmlns=\"sap.m\" id=\"dialog\" title=\"XML Fragment Dialog\" escapeHandler=\"closeDialog\"/>':\n" +
			"TypeError: The string 'closeDialog' couldn't be resolved to a function",
			"Correct TypeError is logged"
		);

		// check warning log
		assert.ok(
			this.logSpyWarning.calledWith(sinon.match(/Event handler name 'doSomething' could not be resolved to an event handler function/)),
			"Correct warning for missing event-handler was logged"
		);

		// controls inside Fragment should still be available (for compatibility)
		assert.equal(oView.byId("dialog").getButtons().length, 2, "Inner Controls are created.");

		// sync cases can be cleaned up
		oView.destroy();
	});

	QUnit.test("[sap.ui.xmlview=async] broken binding string, error on top-level", function(assert) {
		return sap.ui.xmlview({
			id: "syncView1",
			async: true,
			viewContent:
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:m='sap.m' xmlns:core='sap.ui.core'>" +
			"    <m:Panel>" +
			"       <m:Button id=\"brokenButtonInline\" text=\"{This should cause a parse error\"></m:Button>" +
			"    </m:Panel>" +
			"</mvc:View>"
		}).loaded().then(function(oView){
			// check for error log
			assert.ok(this.logSpyError.calledOnce);
			assert.strictEqual(
				this.logSpyError.getCall(0).args[0].message,
				"Error found in View (id: 'syncView1').\n" +
				"XML node: '<m:Button xmlns:m=\"sap.m\" id=\"brokenButtonInline\" text=\"{This should cause a parse error\"/>':\n" +
				"SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0",
				"Correct SyntaxError is logged"
			);

			// even "broken" controls should still be available (for compatibility)
			assert.ok(oView.byId("brokenButtonInline"), "Button with broken binding is still created.");

			// sync cases can be cleaned up
			oView.destroy();
		}.bind(this)).catch(function(){
			assert.ok(false, "The error shouldn't be thrown, only logged.");
		});
	});

	QUnit.test("[sap.ui.xmlview=async] broken binding string, error in nested Fragment", function(assert) {
		return sap.ui.xmlview({
			id: "syncView2",
			async: true,
			viewContent:
			"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:m='sap.m' xmlns:core='sap.ui.core'>" +
			"    <m:Panel>" +
			"       <core:Fragment id='innerFragment' fragmentName='testdata.fragments.XMLFragmentWithSyntaxErrors' type='XML'/>" +
			"    </m:Panel>" +
			"</mvc:View>"
		}).loaded().then(function(oView){
			// check for error log
			assert.ok(this.logSpyError.calledOnce);
			assert.deepEqual(
				this.logSpyError.getCall(0).args[0].message,
				"Error found in Fragment (id: 'syncView2--innerFragment').\n" +
				"XML node: '<m:Button xmlns:m=\"sap.m\" id=\"brokenButton\" text=\"{This should cause a parse error\"/>':\n" +
				"SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0",
				"Correct SyntaxError is logged"
			);

			// controls inside Fragment should still be available (for compatibility)
			assert.ok(oView.byId("innerFragment--brokenButton"), "Button with broken binding is still created.");

			// sync cases can be cleaned up
			oView.destroy();
		}.bind(this)).catch(function(){
			assert.ok(false, "The error shouldn't be thrown, only logged.");
		});
	});

	QUnit.test("[sap.ui.xmlview=async] error caused by missing function reference (property-type 'function')", function(assert) {
		return sap.ui.xmlview({
			id: "syncView3",
			async: true,
			viewContent:
			'<mvc:View xmlns="sap.m" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:html=\"http://www.w3.org/1999/xhtml\">' +
			'<Dialog id="dialog" title="XML Fragment Dialog" escapeHandler="closeDialog">' +
			'   <Text text="title" />                         ' +
			'   <buttons>                                              ' +
			'      <Button text="action!" press="doSomething" /> ' +
			'      <Button text="stuff" /> ' +
			'   </buttons>                                             ' +
			'</Dialog>                                                 ' +
			'</mvc:View>'
		}).loaded().then(function(oView){
			// check error log
			assert.ok(this.logSpyError.calledOnce);
			assert.deepEqual(
				this.logSpyError.getCall(0).args[0].message,
				"Error found in View (id: 'syncView3').\n" +
				"XML node: '<Dialog xmlns=\"sap.m\" id=\"dialog\" title=\"XML Fragment Dialog\" escapeHandler=\"closeDialog\"/>':\n" +
				"TypeError: The string 'closeDialog' couldn't be resolved to a function",
				"Correct TypeError is logged"
			);

			// check warning log
			assert.ok(
				this.logSpyWarning.calledWith(sinon.match(/Event handler name 'doSomething' could not be resolved to an event handler function/)),
				"Correct warning for missing event-handler was logged"
			);

			// controls inside Fragment should still be available (for compatibility)
			assert.equal(oView.byId("dialog").getButtons().length, 2, "Inner Controls are created.");

			// sync cases can be cleaned up
			oView.destroy();
		}.bind(this)).catch(function(){
			assert.ok(false, "The error shouldn't be thrown, only logged.");
		});
	});

	QUnit.module("Preserve DOM");

	QUnit.test("sync loading", async function(assert) {

		// load and place view, force rendering
		var oView = sap.ui.xmlview('example.mvc_legacyAPIs.test').placeAt('content');
		await nextUIUpdate();

		// check that DOM exists
		var oElemPanel1 = oView.byId("myPanel").getDomRef();
		var oElemTable1 = document.getElementById(oView.createId("localTableId"));
		assert.ok(oElemPanel1, "DOM for myPanel should exist");
		assert.ok(oElemTable1, "DOM for localTableId should exist");

		// force a rerendering
		oView.invalidate();
		await nextUIUpdate();

		// check that DOM has been preserved
		var oPanel = oView.byId("myPanel");
		var oElemPanel2 = oPanel.getDomRef();
		var oElemTable2 = document.getElementById(oView.createId("localTableId"));
		assert.ok(oElemPanel2, "DOM for myPanel should exist after rerendering");
		assert.ok(oElemTable2, "DOM for localTableId should exist after rerendering");
		assert.ok(oElemPanel1 !== oElemPanel2, "DOM for panel should differ"); // Note: this will fail if DOM patching becomes the default
		assert.ok(oElemTable1 === oElemTable2, "DOM for table must not differ");

		// check the preserved data attribute on the HTML nodes
		var oSubView1 = oPanel.getContent()[2];
		var oSubViewDomRef = oSubView1.getDomRef();
		assert.ok(oSubViewDomRef, "SubView for HTML nodes is rendered");
		assert.ok(oSubViewDomRef.hasAttribute("data-sap-ui-preserve"), "Dom Element has the preserve attribute set");

		oView.destroy();
		await nextUIUpdate();
	});

	QUnit.test("async loading", function(assert) {
		var done = assert.async();

		// load and place view, force rendering
		var oView = sap.ui.xmlview({
			viewName: 'example.mvc_legacyAPIs.test',
			async: true
		}).placeAt('content');

		// wait for the async load to complete
		oView.attachAfterInit(async function() {

			// ensure rendering
			await nextUIUpdate();

			// check that DOm now exists and that it is correctly marked for preservation
			var oElemView = oView.getDomRef();
			assert.ok(oElemView, "DOM for view must exist");
			assert.ok(oElemView.getAttribute("data-sap-ui-preserve"), "DOM must be marked as 'to be preserved' after init");

			// check DOM of controls
			var oElemPanel1 = oView.byId("myPanel").getDomRef();
			var oElemTable1 = document.getElementById(oView.createId("localTableId"));
			assert.ok(oElemPanel1, "DOM for myPanel should exist");
			assert.ok(oElemTable1, "DOM for localTableId should exist");

			// force a rerendering
			oView.invalidate();
			await nextUIUpdate();

			// check that DOM has been preserved
			var oPanel = oView.byId("myPanel");
			var oElemPanel2 = oPanel.getDomRef();
			var oElemTable2 = document.getElementById(oView.createId("localTableId"));
			assert.ok(oElemPanel2, "DOM for myPanel should exist after rerendering");
			assert.ok(oElemTable2, "DOM for localTableId should exist after rerendering");
			assert.ok(oElemPanel1 !== oElemPanel2, "DOM for panel should differ"); // Note: this will fail if DOM patching becomes the default
			assert.ok(oElemTable1 === oElemTable2, "DOM for table must not differ");

			// check the preserved data attribute on the HTML nodes
			var oSubView1 = oPanel.getContent()[2];
			var oSubViewDomRef = oSubView1.getDomRef();
			assert.ok(oSubViewDomRef, "SubView for HTML nodes is rendered");
			assert.ok(oSubViewDomRef.hasAttribute("data-sap-ui-preserve"), "Dom Element has the preserve attribute set");

			// complete execution only in next tick as the controller code will execute further QUnit asserts in the current tick
			setTimeout(async function() {
				oView.destroy();
				await nextUIUpdate();
				done();
			});
		});
	});

	QUnit.test("with custom RenderManager", async function(assert) {

		// load view, embed it in a Panel and force rendering
		var oView = sap.ui.xmlview('example.mvc_legacyAPIs.test');
		var oPanel = new Panel({
			text: "My View",
			content: [oView]
		}).placeAt('content');
		await nextUIUpdate();

		// check that DOM exists
		var oElemViewBefore = oView.getDomRef();
		assert.ok(oElemViewBefore, "DOM for view should exist");

		// simulate a rendering with a custom RenderManager
		var oPanelContent = oPanel.getDomRef("content");
		var rm = sap.ui.getCore().createRenderManager();
		rm.renderControl(oView);
		rm.flush(oPanelContent);

		// check that DOM has been preserved
		var oElemViewAfter = oView.getDomRef();
		assert.ok(oElemViewBefore, "DOM for view should exist after rerendering");
		assert.ok(oElemViewBefore === oElemViewAfter, "DOM must be the same");

		oPanel.destroy();
		await nextUIUpdate();
	});

	QUnit.test("visible property", async function(assert) {

		var xmlview;

		function check(bVisible, sMsgSuffix) {
			var vLayoutNode = document.getElementById('vLayout');
			var btnBeforeNode = document.getElementById('btnBefore');
			var xmlviewNode = document.getElementById('xmlview');
			var xmlviewPlaceholderNode = document.getElementById('sap-ui-invisible-xmlview');
			var btnAfterNode = document.getElementById('btnAfter');

			assert.ok(vLayoutNode, "vLayout be rendered");
			assert.ok(btnBeforeNode, "btnBefore should be rendered");
			assert.ok(btnAfterNode, "btnBefore should be rendered");
			assert.ok(xmlviewNode, "xmlview should be rendered");
			if ( bVisible ) {
				assert.ok(!xmlviewPlaceholderNode, "there should be no invisible placeholder for the xmlview");
			} else {
				assert.ok(xmlviewPlaceholderNode, "xmlview placeholder should be rendered");
				assert.ok(RenderManager.isPreservedContent(xmlviewNode), "xmlview should be part of the preserved area");
			}

			if ( bVisible ) {
				assert.ok(vLayoutNode.compareDocumentPosition(xmlviewNode) & Node.DOCUMENT_POSITION_CONTAINED_BY, "xmlview should be a descendant of vLayout" + sMsgSuffix);
				assert.ok(btnBeforeNode.compareDocumentPosition(xmlviewNode) & Node.DOCUMENT_POSITION_FOLLOWING, "xmlview should follow the btnBeforeNode" + sMsgSuffix);
				assert.ok(btnAfterNode.compareDocumentPosition(xmlviewNode) & Node.DOCUMENT_POSITION_PRECEDING, "xmlview should preced the btnAfterNode" + sMsgSuffix);
			} else {
				assert.ok(!(vLayoutNode.compareDocumentPosition(xmlviewNode) & Node.DOCUMENT_POSITION_CONTAINED_BY), "xmlview should not be a descendant of vLayout" + sMsgSuffix);
				assert.ok(vLayoutNode.compareDocumentPosition(xmlviewPlaceholderNode) & Node.DOCUMENT_POSITION_CONTAINED_BY, "xmlview placeholder should be a descendant of vLayout" + sMsgSuffix);
				assert.ok(btnBeforeNode.compareDocumentPosition(xmlviewPlaceholderNode) & Node.DOCUMENT_POSITION_FOLLOWING, "xmlview placeholder should follow the btnBeforeNode" + sMsgSuffix);
				assert.ok(btnAfterNode.compareDocumentPosition(xmlviewPlaceholderNode) & Node.DOCUMENT_POSITION_PRECEDING, "xmlview placeholder should preced the btnAfterNode" + sMsgSuffix);
			}

			// check children of xmlview
			var xmlviewChildHTMLNode = document.getElementById(xmlview.createId('localTableId'));
			var xmlviewChildButton3Node = document.getElementById(xmlview.createId('Button3'));
			assert.ok(xmlviewChildHTMLNode, "xmlview child DOM should be rendered");
			assert.ok(xmlviewChildButton3Node, "xmlview child control should be rendered");
			assert.ok(xmlviewNode.compareDocumentPosition(xmlviewChildHTMLNode) & Node.DOCUMENT_POSITION_CONTAINED_BY, "xmlview DOM should contain child DOM" + sMsgSuffix);
			assert.ok(xmlviewNode.compareDocumentPosition(xmlviewChildButton3Node) & Node.DOCUMENT_POSITION_CONTAINED_BY, "xmlview DOM should contain child control DOM" + sMsgSuffix);
			if ( xmlviewPlaceholderNode ) {
				assert.ok(!(xmlviewPlaceholderNode.compareDocumentPosition(xmlviewChildHTMLNode) & Node.DOCUMENT_POSITION_CONTAINED_BY), "xmlview placeholder should not contain child DOM of xmlview" + sMsgSuffix);
				assert.ok(!(xmlviewPlaceholderNode.compareDocumentPosition(xmlviewChildButton3Node) & Node.DOCUMENT_POSITION_CONTAINED_BY), "xmlview placeholder should not contain child control DOM of xmlview" + sMsgSuffix);
			}

		}

		var iLayoutRendered = 0;
		var oLayout = new VerticalLayout({
			id: 'vLayout',
			content: [
				new Button({id: 'btnBefore', text:'Button Before'}),
				xmlview = sap.ui.xmlview('xmlview', 'example.mvc_legacyAPIs.test'),
				new Button({id: 'btnAfter', text:'Button After'})
			]
		});
		oLayout.addEventDelegate({
			onAfterRendering: function() {
				iLayoutRendered++;
			}
		});
		oLayout.placeAt('content');

		await nextUIUpdate();
		check(true, " (after initial rendering)");
		assert.equal(1, iLayoutRendered, "layout initially should have been rendered once");

		xmlview.setVisible(false);
		await nextUIUpdate();
		check(false, " (after becoming invisible)");
		assert.equal(1, iLayoutRendered, "layout still should have been rendered only once (after making the xmlview invisible)");

		xmlview.setVisible(true);
		await nextUIUpdate();
		check(true, " (after becoming visible again)");
		assert.equal(1, iLayoutRendered, "layout still should have been rendered only once (after making the xmlview visible again)");

		oLayout.destroy();
	});

	QUnit.test("invisible child", async function(assert) {

		// load and place view, force rendering
		var oView = sap.ui.xmlview('example.mvc_legacyAPIs.test').placeAt('content'),
			oPanel = oView.byId("myPanel");
		await nextUIUpdate();

		// panel should be visible and have normal control DOM
		assert.ok(oPanel.getDomRef() && !isInPreservedArea(oPanel.getDomRef()), "panel rendered (and not part of the preserve area())");

		// make only the panel invisible, force rendering
		oPanel.setVisible(false);
		await nextUIUpdate();

		// there should be no more DOM for the panel, but an invisible placeholder
		assert.notOk(oPanel.getDomRef(), "panel should be hidden");
		assert.ok(invisiblePlaceholder(oPanel), "invisible placeholder should exist for the panel");

		// hide the view
		oView.setVisible(false);
		await nextUIUpdate();

		// this should move it to the preserve area with all child controls incl. the invisible placeholder
		assert.ok(oView.getDomRef() && isPreserved(oView.getDomRef()), "view has DOM and DOM is in preserved area");
		assert.ok(invisiblePlaceholder(oPanel), "invisible placeholder still should exist for panel");
		assert.ok(isInPreservedArea(invisiblePlaceholder(oPanel)), "invisible placeholder should be part of the preserve area");

		// restore both, view and child control
		oView.setVisible(true);
		oPanel.setVisible(true);
		await nextUIUpdate();

		// both view and child should have DOM, should not be in the preserve area and should have no placeholders
		assert.ok(oView.getDomRef() && !isPreserved(oView.getDomRef()), "view has DOM and DOM is no longer in preserved area");
		assert.notOk(dummyPlaceholder(oView), "view should have no more dummy placeholder");
		assert.notOk(invisiblePlaceholder(oView), "view should have no more invisible placeholder");
		assert.ok(oPanel.getDomRef() && !isInPreservedArea(oPanel.getDomRef()), "panel rendered after making it visible");
		assert.notOk(dummyPlaceholder(oPanel), "panel should have no more dummy placeholder");
		assert.notOk(invisiblePlaceholder(oPanel), "panel should have no more invisible placeholder");

		// now make view and child visible in two different renderings
		oView.setVisible(false);
		oPanel.setVisible(false);
		await nextUIUpdate();
		oView.setVisible(true);
		await nextUIUpdate();

		// invisible control should still be invisible and invisible placeholder still should exist
		assert.ok(oView.getDomRef() && !isPreserved(oView.getDomRef()), "view has DOM and DOM is no longer in preserved area");
		assert.notOk(oPanel.getDomRef(), "panel not rendered");
		assert.ok(invisiblePlaceholder(oPanel), "invisible placeholder should exist for invisible panel");
		assert.notOk(dummyPlaceholder(oPanel), "dummy placeholder must not exists for invisible panel");

		// making the panel visible should also work
		oPanel.setVisible(true);
		await nextUIUpdate();
		assert.ok(oPanel.getDomRef(), "panel rendered after making it visible");
		assert.notOk(invisiblePlaceholder(oPanel), "invisible placeholder must not exist for visible panel");
		assert.notOk(dummyPlaceholder(oPanel), "dummy placeholder must not exists for visible panel");

		oView.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Destroy removes preserved content from DOM", async function(assert) {
		// Because nobody else would do it

		// load and place view, force rendering
		var oView = sap.ui.xmlview('example.mvc_legacyAPIs.test').placeAt('content');
		await nextUIUpdate();

		var oDomRef = oView.getDomRef();
		RenderManager.preserveContent(oDomRef, true);

		oView.destroy();

		assert.ok(!RenderManager.getPreserveAreaRef().hasChildNodes(), "Preserve area is empty");
	});

	QUnit.test("Destroy with 'KeepDom'-mode removes preservable flag from DOM ref", async function(assert) {
		// Otherwise view content of already destroyed views might get preserve and never destroyed

		// load and place view, force rendering
		var oView = sap.ui.xmlview('example.mvc_legacyAPIs.test').placeAt('content');
		await nextUIUpdate();

		var oDomRef = oView.getDomRef();

		oView.destroy("KeepDom");
		RenderManager.preserveContent(oDomRef, true);

		assert.ok(!RenderManager.getPreserveAreaRef().hasChildNodes(), "Nothing got preserved");

		// Cleanup
		oDomRef = oView.getDomRef();
		oDomRef.parentElement.removeChild(oDomRef);
	});

	QUnit.test("Directly Nested XMLViews", async function(assert) {
		sap.ui.require.preload({
			"nested/views/outer.view.xml":
				"<View xmlns=\"sap.ui.core.mvc\">" +
					"<Text id=\"before\" text=\"another control before the nested view\" xmlns=\"sap.m\" />" +
					"<XMLView viewName=\"nested.views.middle\" id=\"middle\" />" +
					"<Text id=\"after\" text=\"another control after the nested view\" xmlns=\"sap.m\" />" +
				"</View>",
			"nested/views/middle.view.xml":
				"<View xmlns=\"sap.ui.core.mvc\">" +
					"<Text id=\"before\" text=\"another control before the nested view\" xmlns=\"sap.m\" />" +
					"<VBox id=\"vbox\" xmlns=\"sap.m\">" +
						"<XMLView viewName=\"nested.views.inner\" id=\"indirect-inner\" xmlns=\"sap.ui.core.mvc\" />" +
					"</VBox>" +
					"<XMLView viewName=\"nested.views.inner\" id=\"direct-inner\" xmlns=\"sap.ui.core.mvc\" />" +
					"<Text id=\"after\" text=\"another control before the nested view\" xmlns=\"sap.m\" />" +
				"</View>",
			"nested/views/inner.view.xml":
				"<View xmlns=\"sap.ui.core.mvc\">" +
					"<Text id=\"inside\" text=\"another control inside the view\" xmlns=\"sap.m\" />" +
				"</View>"
		});
		var expectedControls = [
			"outer",
				"outer--before",
				"outer--middle",
					"outer--middle--before",
					"outer--middle--vbox",
						"outer--middle--indirect-inner",
							"outer--middle--indirect-inner--inside",
					"outer--middle--direct-inner",
						"outer--middle--direct-inner--inside",
					"outer--middle--after",
				"outer--after"
		];

		// load and place view, force rendering
		var oView = sap.ui.xmlview("outer", { viewName: "nested.views.outer"}).placeAt('content');
		await nextUIUpdate();

		expectedControls.forEach(function(sId) {
			var oControl = Element.getElementById(sId);
			assert.ok(oControl, "control with id '" + sId + "' should exist");
			assert.ok(oControl.getDomRef(), "control with id '" + sId + "' should have DOM");
		});

		// install delegates on each control to assert later that all have been rendered
		var count = 0;
		expectedControls.forEach(function(sId) {
			var oControl = Element.getElementById(sId);
			oControl.addDelegate({
				onBeforeRendering: function() {
					count += 100;
				},
				onAfterRendering: function() {
					count += 1;
				}
			});
		});

		// Act: force a re-rerendering of the outer view
		oView.invalidate();
		await nextUIUpdate();

		// Assert: everythging has been rendered again
		assert.equal(count, 101 * expectedControls.length, "all controls should have participated in the rendering");
		expectedControls.forEach(function(sId) {
			var oControl = Element.getElementById(sId);
			assert.ok(oControl, "control with id '" + sId + "' should exist");
			assert.ok(oControl.getDomRef(), "control with id '" + sId + "' should have DOM");
			assert.notOk(document.getElementById(RenderManager.RenderPrefixes.Dummy + sId), "there should be no more Dummy-Element for id '" + sId + "'");
			assert.notOk(document.getElementById(RenderManager.RenderPrefixes.Temporary + sId), "there should be no more Temporary-Element for id '" + sId + "'");
		});

		oView.destroy();
		expectedControls.forEach(function(sId) {
			var oControl = Element.getElementById(sId);
			assert.notOk(oControl, "control with id '" + sId + "' should no longer exist");
			assert.notOk(document.getElementById(sId), "there should be no more DOM with id '" + sId + "'");
		});

	});

	QUnit.module("Additional tests:");

	// error
	QUnit.test("Error in template - no default aggregation defined", function(assert) {
		var sXml = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib" xmlns="http://www.w3.org/1999/xhtml">',
				'	<test:TestButton>',
				'		<test:Error/>',
				'	</test:TestButton>',
				'</mvc:View>'
			].join(''),
			sError = "Error found in View (id: 'erroneous_view_1').\n" +
					"XML node: '<test:Error xmlns:test=\"sap.ui.testlib\"/>':\n" +
					"Cannot add direct child without default aggregation defined for control sap.ui.testlib.TestButton";

		assert.throws(function() {
			sap.ui.xmlview("erroneous_view_1", {viewContent:sXml});
		}, Error(sError), "Must throw an error");
	});

	QUnit.test("Error in template - text in aggregation", function(assert) {
		var sXml = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib" xmlns="http://www.w3.org/1999/xhtml">',
				'	<test:TestButton>',
				'		Error',
				'	</test:TestButton>',
				'</mvc:View>'
			].join(''),
			sError = "Error found in View (id: 'erroneous_view_2').\n" +
					"XML node: '\t\tError\t':\n" +
					"Cannot add text nodes as direct child of an aggregation. For adding text to an aggregation, a surrounding html tag is needed.";

		assert.throws(function() {
			sap.ui.xmlview("erroneous_view_2", {viewContent:sXml});
		}, Error(sError), "Must throw an error");
	});

	QUnit.test("Error in controller", function(assert) {
		var sXml = [
				'<mvc:View controllerName="example.mvc.test.error" xmlns:mvc="sap.ui.core.mvc">',
				'</mvc:View>'
			].join('');

		// define erroneous controller
		sap.ui.controller("example.mvc.test.error", {
			onInit: function() {
				throw new Error("Controller error");
			}
		});
		assert.throws(function() {
			sap.ui.xmlview("erroneous_view_3", {viewContent:sXml});
		}, Error("Controller error"), "Must throw an error");
	});

	// encoding
	QUnit.test("Encoding", async function(assert) {

		var xmlWithHTMLFragment = [
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="http://www.w3.org/1999/xhtml">',
			'  <div title="&quot;&gt;&lt;span id=&quot;broken1&quot;&gt;broken1&lt;/span&gt;&lt;x y=&quot;">',
			'    <span id="valid1"></span>',
			'    <span id="valid2">',
			'      &lt;span id=&quot;broken2&quot;&gt;broken2&lt;/span&gt;',
			'    </span>',
			'  </div>',
			'</mvc:View>'
		].join('');

		var view = sap.ui.xmlview("view", {viewContent:xmlWithHTMLFragment});
		view.placeAt("content");
		await nextUIUpdate();

		assert.ok(jQuery("#view--valid1").length == 1, "DOM must contain view--valid1 element.");
		assert.ok(jQuery("#view--valid2").length == 1, "DOM must contain view--valid2 element.");
		assert.ok(jQuery("#broken1").length == 0, "DOM must not contain broken1 element.");
		assert.ok(jQuery("#broken2").length == 0, "DOM must not contain broken2 element.");

	});

	QUnit.test("DataBinding", function(assert) {

		var oModel1 = new JSONModel({
			booleanValue : true,
			integerValue: 8015,
			stringValue : 'Text1',
			data: {
				booleanValue: false,
				integerValue: 4242,
				stringValue: 'Text2'
			}
		});
		var oModel2 = new JSONModel({
			booleanValue : false,
			integerValue: 4711,
			stringValue : '1txeT'
		});

		var xmlWithBindings = [
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib">',
			'  <test:TestButton id="btn" enabled="{/booleanValue}" text="{/stringValue}" width="{/integerValue}" />',
			'</mvc:View>'
		].join('');

		var xmlWithNamedBindings = [
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib">',
			'  <test:TestButton id="btn" enabled="{model2>/booleanValue}" text="{model1>/stringValue}" width="{/integerValue}" />',
			'</mvc:View>'
		].join('');

		var xmlWithElementBinding = [
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib">',
			'  <test:TestButton id="btn" binding="{/data}" enabled="{booleanValue}" text="{stringValue}" width="{integerValue}" />',
			'</mvc:View>'
		].join('');

		var xmlWithoutBindings = [
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib">',
			'  <test:TestButton id="btn1" enabled="true" text="The following set is empty: \\{\\}" width="67" />',
			'  <test:TestButton id="btn2" enabled="false" text="\\{\\} is an empty set" width="42" />',
			'  <test:TestButton id="btn3" enabled="true" text="The following array is empty: []" width="67" />',
			'  <test:TestButton id="btn4" enabled="false" text="[] is an empty array" width="42" />',
			'</mvc:View>'
		].join('');

		var oViewWithBindings1 = sap.ui.xmlview({viewContent:xmlWithBindings});
		oViewWithBindings1.setModel(oModel1);
		assert.equal(oViewWithBindings1.byId("btn").getEnabled(), oModel1.getData().booleanValue, "Check 'enabled' property of button 'btn'");
		assert.equal(oViewWithBindings1.byId("btn").getText(), oModel1.getData().stringValue, "Check 'text' property of button 'btn'");
		assert.equal(oViewWithBindings1.byId("btn").getWidth(), oModel1.getData().integerValue, "Check 'width' property of button 'btn'");

		var oViewWithBindings2 = sap.ui.xmlview({viewContent:xmlWithBindings});
		oViewWithBindings2.setModel(oModel2);
		assert.equal(oViewWithBindings2.byId("btn").getEnabled(), oModel2.getData().booleanValue, "Check 'enabled' property of button 'btn'");
		assert.equal(oViewWithBindings2.byId("btn").getText(), oModel2.getData().stringValue, "Check 'text' property of button 'btn'");
		assert.equal(oViewWithBindings2.byId("btn").getWidth(), oModel2.getData().integerValue, "Check 'width' property of button 'btn'");

		var oViewWithNamedBindings = sap.ui.xmlview({viewContent:xmlWithNamedBindings});
		oViewWithNamedBindings.setModel(oModel2);
		oViewWithNamedBindings.setModel(oModel1, "model1");
		oViewWithNamedBindings.setModel(oModel2, "model2");
		assert.equal(oViewWithNamedBindings.byId("btn").getEnabled(), oModel2.getData().booleanValue, "Check 'enabled' property of button 'btn'");
		assert.equal(oViewWithNamedBindings.byId("btn").getText(), oModel1.getData().stringValue, "Check 'text' property of button 'btn'");
		assert.equal(oViewWithNamedBindings.byId("btn").getWidth(), oModel2.getData().integerValue, "Check 'width' property of button 'btn'");

		var oViewWithElementBinding = sap.ui.xmlview({viewContent:xmlWithElementBinding});
		oViewWithElementBinding.setModel(oModel1);
		assert.equal(oViewWithElementBinding.byId("btn").getEnabled(), oModel1.getData().data.booleanValue, "Check 'enabled' property of button 'btn'");
		assert.equal(oViewWithElementBinding.byId("btn").getText(), oModel1.getData().data.stringValue, "Check 'text' property of button 'btn'");
		assert.equal(oViewWithElementBinding.byId("btn").getWidth(), oModel1.getData().data.integerValue, "Check 'width' property of button 'btn'");

		var oViewWithoutBindings = sap.ui.xmlview({viewContent:xmlWithoutBindings});
		oViewWithoutBindings.setModel(oModel1);
		oViewWithoutBindings.setModel(oModel1, "model1");
		oViewWithoutBindings.setModel(oModel2, "model2");
		assert.equal(oViewWithoutBindings.byId("btn1").getText(), "The following set is empty: {}", "Check 'text' property of button 'btn1'");
		assert.equal(oViewWithoutBindings.byId("btn2").getText(), "{} is an empty set", "Check 'text' property of button 'btn2'");
		assert.equal(oViewWithoutBindings.byId("btn3").getText(), "The following array is empty: []", "Check 'text' property of button 'btn3'");
		assert.equal(oViewWithoutBindings.byId("btn4").getText(), "[] is an empty array", "Check 'text' property of button 'btn4'");
	});

	QUnit.test("Custom Data", function(assert) {

		var oModel = new JSONModel({
			value : 'myValue'
		});

		var xmlWithBindings = [
			'<mvc:View controllerName="example.mvc_legacyAPIs.test" xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib" xmlns:app="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">',
			'  <test:TestButton id="btn" app:myKey1="myValue1" app:myKey2="{/value}" app:myKey3="{path: \'/value\', formatter:\'.valueFormatter\'}" />',
			'</mvc:View>'
		].join('');

		var oView = sap.ui.xmlview({viewContent:xmlWithBindings});
		oView.setModel(oModel);
		assert.equal(oView.byId("btn").data("myKey1"), "myValue1", "Check CustomData 'myKey1' of button 'btn'");
		assert.equal(oView.byId("btn").data("myKey2"), oModel.getData().value, "Check CustomData 'myKey2' of button 'btn'");
		assert.equal(oView.byId("btn").data("myKey3"), "formatted-" + oModel.getData().value, "Check CustomData 'myKey3' of button 'btn'");

	});

	QUnit.module("View's root level settings");

	QUnit.test("Custom Data (legacy factory)", function(assert) {
		var oModel = new JSONModel({
			value : 'myValue'
		});

		var xmlWithBindings = [
			'<mvc:View controllerName="example.mvc_legacyAPIs.test"',
			'  xmlns:mvc="sap.ui.core.mvc"',
			'  xmlns:test="sap.ui.testlib"',
			'  xmlns:app="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"',
			'  app:myKey1="myValue1" app:myKey2="{/value}" app:myKey3="{path: \'/value\', formatter:\'.valueFormatter\'}">',
			'  <test:TestButton id="btn" app:myKey1="myValue1" app:myKey2="{/value}" app:myKey3="{path: \'/value\', formatter:\'.valueFormatter\'}" />',
			'</mvc:View>'
		].join('');

		var oView = sap.ui.xmlview({viewContent:xmlWithBindings});
		oView.setModel(oModel);

		assert.equal(oView.data("myKey1"), "myValue1", "Check CustomData 'myKey1' of the View");
		assert.equal(oView.data("myKey2"), oModel.getData().value, "Check CustomData 'myKey2' of the View");
		assert.equal(oView.data("myKey3"), "formatted-" + oModel.getData().value, "Check CustomData 'myKey3' of the View");
		assert.equal(oView.byId("btn").data("myKey1"), "myValue1", "Check CustomData 'myKey1' of button 'btn'");
		assert.equal(oView.byId("btn").data("myKey2"), oModel.getData().value, "Check CustomData 'myKey2' of button 'btn'");
		assert.equal(oView.byId("btn").data("myKey3"), "formatted-" + oModel.getData().value, "Check CustomData 'myKey3' of button 'btn'");

	});

	QUnit.test("Named Aggregations (legacy factory)", async function(assert) {
		var sXmlWithNamedAggregations = [
			'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib" xmlns:html="http://www.w3.org/1999/xhtml">',
			'  <mvc:content>',
			'    <test:TestButton id="contentButton" />',
			'    <html:div id="div1">test1</html:div>',
			'  </mvc:content>',
			'  <mvc:dependents>',
			'    <test:TestButton id="dependentButton" />',
			'    <html:div id="div2">test2</html:div>',
			'    plain text node',
			'    <core:Fragment id="innerFragment" fragmentName="testdata.fragments.XMLFragmentDialog" type="XML"/>',
			'  </mvc:dependents>',
			'</mvc:View>'
		].join('');

		var sXmlWithNamedDependents = [
			'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib">',
			'  <test:TestButton id="contentButton" />',
			'  <mvc:dependents>',
			'    <test:TestButton id="dependentButton" />',
			'    <core:Fragment id="innerFragment" fragmentName="testdata.fragments.XMLFragmentDialog" type="XML"/>',
			'  </mvc:dependents>',
			'</mvc:View>'
		].join('');

		var sXmlWithWrongAggregation = [
			'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib">',
			'  <test:TestButton id="contentButton" />',
			'  <mvc:wrong>',
			'    <test:TestButton id="dependentButton" />',
			'  </mvc:wrong>',
			'</mvc:View>'
		].join('');


		var oView = sap.ui.xmlview("viewWithNamedAggregations", { viewContent: sXmlWithNamedAggregations });
		oView.placeAt("content");
		await nextUIUpdate();
		assert.strictEqual(oView.byId("contentButton").getId(),"viewWithNamedAggregations--contentButton", "viewWithNamedAggregations: The button was added correctly");
		assert.strictEqual(oView.getContent()[0].getId(),"viewWithNamedAggregations--contentButton", "viewWithNamedAggregations: The button was added correctly to content aggregation");
		assert.strictEqual(oView.byId("dependentButton").getId(),"viewWithNamedAggregations--dependentButton", "viewWithNamedAggregations: The dependent button was added correctly");
		assert.strictEqual(oView.getDependents()[0].getId(),"viewWithNamedAggregations--dependentButton", "viewWithNamedAggregations: The dependent button was added correctly to dependents aggregation");
		assert.strictEqual(oView.getDependents()[1].getId(),"viewWithNamedAggregations--innerFragment--xmlDialog", "viewWithNamedAggregations: The dialog control from the dependent fragment was added correctly to dependents aggregation");

		var oDiv1 = document.getElementById(oView.createId("div1"));
		assert.ok(oDiv1, "XHTML element in 'content' aggregation is rendered");
		assert.equal(oDiv1.childNodes.length, 1, "The div has one child");
		assert.equal(oDiv1.childNodes[0].textContent, "test1", "The text content is correct");
		assert.notOk(document.getElementById(oView.createId("div2")), "XHTML element in 'dependents' aggregation is NOT rendered");
		assert.notOk(oDiv1.nextSibling.textContent.trim(), "HTML nodes or text nodes outside the content aggregation shouldn't be rendered");
		oView.destroy();

		oView = sap.ui.xmlview("xmlWithNamedDependents", { viewContent: sXmlWithNamedDependents });
		assert.strictEqual(oView.byId("contentButton").getId(),"xmlWithNamedDependents--contentButton", "xmlWithNamedDependents: The button was added correctly");
		assert.strictEqual(oView.getContent()[0].getId(),"xmlWithNamedDependents--contentButton", "xmlWithNamedDependents: The button was added correctly to content aggregation");
		assert.strictEqual(oView.byId("dependentButton").getId(),"xmlWithNamedDependents--dependentButton", "xmlWithNamedDependents: The dependent button was added correctly");
		assert.strictEqual(oView.getDependents()[0].getId(),"xmlWithNamedDependents--dependentButton", "xmlWithNamedDependents: The dependent button was added correctly to dependents aggregation");
		assert.strictEqual(oView.getDependents()[1].getId(),"xmlWithNamedDependents--innerFragment--xmlDialog", "viewWithNamedAggregations: The dialog control from the dependent fragment was added correctly to dependents aggregation");
		oView.destroy();

		assert.throws(function() {
			sap.ui.xmlview("xmlWithWrongAggregationLegacy", { viewContent: sXmlWithWrongAggregation });
		}, /failed to load .{1}sap\/ui\/core\/mvc\/wrong\.js/, "xmlWithWrongAggregation: Error thrown for unknown aggregation");
	});

	QUnit.test("Error should be thrown when 'content' aggregation of View is bound and binding template contains HTML node (legacy factory)", function(assert) {
		var sXmlWithBoundContent = [
			'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns:test="sap.ui.testlib" xmlns:html="http://www.w3.org/1999/xhtml" ',
			'  content="{path: \'/Supplier\', templateShareable:false}">',
			'  <html:div id="div2">',
			'    <core:Icon src="sap-icon://accept" />',
			'  </html:div>',
			'  <mvc:dependents>',
			'    <test:TestButton id="dependentButton" />',
			'    <core:Fragment id="innerFragment" fragmentName="testdata.fragments.XMLFragmentDialog" type="XML"/>',
			'  </mvc:dependents>',
			'</mvc:View>'
		].join('');

		var fnCreateViewSpy = sinon.spy(function() {
			sap.ui.xmlview("xmlWithBoundContent", { viewContent: sXmlWithBoundContent });
		});

		try {
			fnCreateViewSpy();
		} catch (err) {
			// do nothing
		}

		assert.equal(fnCreateViewSpy.getCall(0).exception.message, "Error found in View (id: 'xmlWithBoundContent').\nXML node: '<html:div xmlns:html=\"http://www.w3.org/1999/xhtml\" id=\"div2\"></html:div>':\nNo XHTML or SVG node is allowed because the 'content' aggregation is bound.", "Error thrown for having HTML nodes in the binding template of the bound 'content' aggregation");
	});

	QUnit.module("Preprocessor API", {
		beforeEach: function() {
			this.sViewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc"/>';
			this.runPreprocessorSpy = sinon.spy(View.prototype, "runPreprocessor");
			this.fnGetConfig = function(fnPreprocessor, bSyncSupport) {
				return {
					preprocessor: fnPreprocessor,
					_syncSupport: !!bSyncSupport
				};
			};
			this.fnChangeSourcePreprocessor = function(xml) {
				this.xml = XMLHelper.parse(this.sViewContent).documentElement;
				return this.xml;
			}.bind(this);
			this.createView = function(bAsync) {
				var preprocessor = {
					preprocessor: this.fnChangeSourcePreprocessor,
					_syncSupport: true
				};
				return sap.ui.xmlview({
					async: bAsync,
					viewContent: this.sViewContent,
					preprocessors: {
						xml:preprocessor,
						viewxml: preprocessor
					}
				});
			}.bind(this);
		},
		afterEach: function() {
			// reset global preprocessors
			View._mPreprocessors = {};
			this.runPreprocessorSpy.restore();
			delete this.xml;
		}
	});

	QUnit.test("registration", function(assert) {
		var logSpyError = this.spy(Log, "error");

		XMLView.registerPreprocessor(XMLView.PreprocessorType.XML, jQuery.noop, false);
		XMLView.registerPreprocessor(XMLView.PreprocessorType.VIEWXML, jQuery.noop, false);
		XMLView.registerPreprocessor(XMLView.PreprocessorType.CONTROLS, jQuery.noop, false);

		assert.strictEqual(View._mPreprocessors["XML"]["xml"][1].preprocessor, jQuery.noop, "Registration for xml successful");
		assert.strictEqual(View._mPreprocessors["XML"]["viewxml"][0].preprocessor, jQuery.noop, "Registration for viewxml successful");
		assert.strictEqual(View._mPreprocessors["XML"]["controls"][0].preprocessor, jQuery.noop, "Registration for content successful");

		logSpyError.resetHistory();
		XMLView.registerPreprocessor("unknown", jQuery.noop, false, {type: "unknown"});
		assert.ok(
			logSpyError.calledWith(sinon.match(/could not be registered due to unknown/)),
			"Error logged when registering invalid type");
		assert.strictEqual(View._mPreprocessors["XML"]["unknown"], undefined, "Registration for invalid type refused");

		logSpyError.resetHistory();
		XMLView.registerPreprocessor(XMLView.PreprocessorType.XML, jQuery.noop, false, true);
		assert.ok(
			logSpyError.calledWith(sinon.match(/only one on-demand-preprocessor allowed/)),
			"Error logged when registering more than one ondemand pp");
		assert.strictEqual(View._mPreprocessors["XML"]["unknown"], undefined, "Registration for invalid type refused");

		// explicitly providing view type "XML" does not fail
		var fnUniquePP = function() {};
		XMLView.registerPreprocessor(XMLView.PreprocessorType.XML, fnUniquePP, "XML", false);
		assert.ok(Array.isArray(View._mPreprocessors["XML"]["xml"]) &&
			View._mPreprocessors["XML"]["xml"].some(function(entry) {
				return entry.preprocessor === fnUniquePP;
			}), "Preprocessor call passed through to View");

		// explicitly providing an unsupported type fails
		assert.throws(function() {
			XMLView.registerPreprocessor(XMLView.PreprocessorType.XML, fnUniquePP, "YAML", false);
		}, TypeError, "TypeError thrown when registering for a view type other than XML");
	});

	QUnit.test("sync / no execution", function(assert) {
		assert.expect(1);
		var preprocessorSpy = sinon.spy();

		sap.ui.xmlview({
			viewContent: this.sViewContent,
			preprocessors: {
				xml: this.fnGetConfig(preprocessorSpy)
			}
		});

		sinon.assert.notCalled(preprocessorSpy);
	});

	QUnit.test("sync: assignment of preprocessor results", function(assert) {
		assert.expect(1);
		var oView = this.createView();
		assert.strictEqual(oView._xContent, this.xml, "Result was correctly assigned");
	});

	QUnit.test("async: assignment of preprocessor results", function(assert) {
		assert.expect(1);
		return this.createView(true).loaded().then(function(oView) {
			assert.strictEqual(oView._xContent, this.xml, "Result was correctly assigned");
		}.bind(this));
	});

	/*
	 * @param {boolean} bSync view loading mode
	 * @param {string} sType preprocessor type
	 * @param {int} [iCount] number of preprocessors, if not set the legacy version is tested
	 * @return {undefined|Promise} view promise in async mode
	 */
	function testPreprocessor(assert, bSync, sType, iCount) {
		var oView, oPreprocessors = {},
			preprocessorSpy = sinon.spy(function(vSource) {
				return bSync ? vSource : Promise.resolve(vSource);
			}),
			fnAssert = function() {
				if (sType === "viewxml") {
					sinon.assert.calledThrice(this.runPreprocessorSpy);
				} else {
					sinon.assert.calledTwice(this.runPreprocessorSpy);
				}
				sinon.assert.calledWith(this.runPreprocessorSpy, sType);
				sinon.assert.callCount(preprocessorSpy, iCount);
			}.bind(this);

		assert.expect(3);

		if (!iCount) {
			// compatible / legacy version with single preprocessor declaration
			iCount = 1;
			oPreprocessors[sType] = this.fnGetConfig(preprocessorSpy, true);
		} else {
			oPreprocessors[sType] = [];
			for (var i = 0; i < iCount; i++) {
				oPreprocessors[sType][i] = this.fnGetConfig(preprocessorSpy, true);
			}
		}

		oView = sap.ui.xmlview({
			viewContent: this.sViewContent,
			preprocessors: oPreprocessors,
			async: !bSync
		});

		return bSync ? fnAssert() : oView.loaded().then(fnAssert);
	}

	function testPreprocessorError(assert, bSync, sType) {
		var oView, oPreprocessors = {}, error,
			oError = new Error("preprocessor failed"),
			preprocessorSpy = sinon.spy(function(vSource) {
				throw oError;
			}),
			fnAssert = function(e) {
				assert.strictEqual(e, oError, "error was processed");
			};

		assert.expect(1);

		oPreprocessors[sType] = this.fnGetConfig(preprocessorSpy, true);

		// synchronous case -> try/catch
		try {
			oView = sap.ui.xmlview({
				viewContent: this.sViewContent,
				preprocessors: oPreprocessors,
				async: !bSync
			});
		} catch (_error) {
			error = _error;
		}

		// async case -> Promise#catch
		return bSync ? fnAssert(error) : oView.loaded().catch(fnAssert);
	}

	jQuery.each(XMLView.PreprocessorType, function(sProp, sType) {
		QUnit.test("sync - single preprocessor " + sType + " (compatible)", function(assert) {
			testPreprocessor.call(this, assert, true, sType);
		});
		QUnit.test("sync - multiple preprocessors " + sType, function(assert) {
			testPreprocessor.call(this, assert, true, sType, 2);
		});
		QUnit.test("async - single preprocessor " + sType + " (compatible)", function(assert) {
			return testPreprocessor.call(this, assert, false, sType);
		});
		QUnit.test("async - multiple preprocessors " + sType, function(assert) {
			return testPreprocessor.call(this, assert, false, sType, 2);
		});
		QUnit.test("sync - preprocessor error " + sType + " (compatible)", function(assert) {
			testPreprocessorError.call(this, assert, true, sType);
		});
		QUnit.test("async - preprocessor error " + sType, function(assert) {
			testPreprocessorError.call(this, assert, true, sType);
		});
	});

	// let test starter wait for the XML to be loaded
	return pViewXMLLoaded;
});
