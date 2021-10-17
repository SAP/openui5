import Log from "sap/base/Log";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import coreLibrary from "sap/ui/core/library";
import View from "sap/ui/core/mvc/View";
import XMLView from "sap/ui/core/mvc/XMLView";
import RenderManager from "sap/ui/core/RenderManager";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import VerticalLayout from "sap/ui/layout/VerticalLayout";
import Button from "sap/m/Button";
import Panel from "sap/m/Panel";
import testsuite from "./AnyView.qunit";
var ViewType = coreLibrary.mvc.ViewType;
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
var oConfig = {
    viewClassName: "sap.ui.core.mvc.XMLView",
    idsToBeChecked: ["myPanel", "Button1", "localTableId"]
};
testsuite(oConfig, "XMLView creation loading from file", function () {
    return sap.ui.xmlview("example.mvc.test");
});
testsuite(oConfig, "XMLView creation via XML string", function () {
    var xml = jQuery.sap.syncGetText(sap.ui.require.toUrl("example/mvc/test.view.xml"), null, undefined);
    return sap.ui.xmlview({ viewContent: xml });
});
testsuite(oConfig, "XMLView creation via XML document", function () {
    var xml = jQuery.sap.syncGetText(sap.ui.require.toUrl("example/mvc/test.view.xml"), null, undefined);
    return sap.ui.xmlview({
        viewContent: jQuery.sap.parseXML(xml)
    });
});
testsuite(oConfig, "XMLView creation via XML node", function () {
    var xml = jQuery.sap.syncGetText(sap.ui.require.toUrl("example/mvc/test.view.xml"), null, undefined);
    return sap.ui.xmlview({
        xmlNode: jQuery.sap.parseXML(xml).documentElement
    });
});
testsuite(oConfig, "XMLView creation using generic view factory", function () {
    return sap.ui.view({ type: ViewType.XML, viewName: "example.mvc.test", viewData: { test: "testdata" } });
}, true);
var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();
QUnit.module("Apply settings", {
    beforeEach: function () {
        sap.ui.getCore().getConfiguration().setLanguage("en-US");
    },
    afterEach: function () {
        sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
    }
});
QUnit.test("sync loading", function (assert) {
    var oView = sap.ui.xmlview({
        viewName: "example.mvc.test",
        displayBlock: false
    });
    assert.equal(oView.getDisplayBlock(), true, "DisplayBlock should be true");
    oView.destroy();
});
QUnit.test("async loading", function (assert) {
    var oView = sap.ui.xmlview({
        viewName: "example.mvc.test",
        async: true,
        displayBlock: false
    });
    assert.equal(oView.getDisplayBlock(), false, "Displayblock should be false for the async-view stub");
    return oView.loaded().then(function () {
        assert.equal(oView.getDisplayBlock(), true, "DisplayBlock should be true for the resolved async view");
        oView.destroy();
    });
});
QUnit.test("async loading new Factory with resource bundle", function (assert) {
    var oResourceBundleCreateSpy = sinon.spy(ResourceBundle, "create");
    var oViewPromise = XMLView.create({ definition: "" + "<mvc:View resourceBundleName=\"testdata.mvc.text\"\n" + "\t\t   resourceBundleAlias=\"i18n\"\n" + "\t\t   xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\" xmlns:html=\"http://www.w3.org/1999/xhtml\">\n" + "\t<Panel id=\"aPanel\">\n" + "\t\t<Button id=\"Button1\" text=\"{i18n>TEXT_CLOSE}\" press=\"doIt\"></Button>\n" + "\t</Panel>\n" + "</mvc:View>" + "" });
    return oViewPromise.then(function (oView) {
        var oCreateCall = oResourceBundleCreateSpy.getCall(0);
        assert.ok(oCreateCall.args[0].async, "async call");
        oResourceBundleCreateSpy.restore();
        assert.ok(oView.getModel("i18n") instanceof ResourceModel, "has model with the expected alias");
        oView.destroy();
    });
});
QUnit.module("Error handling", {
    before: function () {
        this.logSpyError = sinon.spy(Log, "error");
        this.logSpyWarning = sinon.spy(Log, "warning");
    },
    afterEach: function () {
        this.logSpyError.reset();
        this.logSpyWarning.reset();
    },
    after: function () {
        this.logSpyError.restore();
        this.logSpyWarning.restore();
    }
});
QUnit.test("[XMLView.create] broken binding string", function (assert) {
    var oViewPromise = XMLView.create({
        id: "asyncView1",
        definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:m='sap.m' xmlns:core='sap.ui.core'>" + "    <m:Panel id='aPanel'>" + "       <m:Button id=\"Button1\" text=\"{This should cause a parse error\"></m:Button>" + "    </m:Panel>" + "</mvc:View>"
    });
    return oViewPromise.then(function (oView) {
        assert.ok(false, "should not succeed");
    }, function (err) {
        assert.strictEqual(err.message, "Error found in View (id: 'asyncView1').\n" + "XML node: '<m:Button xmlns:m=\"sap.m\" id=\"Button1\" text=\"{This should cause a parse error\"/>':\n" + "SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0", "SyntaxError is thrown during parsing of binding string.");
    });
});
QUnit.test("[XMLView.create] broken binding string, error in nested Fragment", function (assert) {
    var oViewPromise = XMLView.create({
        id: "asyncView2",
        definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:m='sap.m' xmlns:core='sap.ui.core'>" + "    <m:Panel id='aPanel'>" + "       <core:Fragment id='innerFragment' fragmentName='testdata.fragments.XMLFragmentWithSyntaxErrors' type='XML'/>" + "    </m:Panel>" + "</mvc:View>"
    });
    return oViewPromise.then(function (oView) {
        assert.ok(false, "should not succeed");
    }, function (err) {
        assert.strictEqual(err.message, "Error found in Fragment (id: 'asyncView2--innerFragment').\n" + "XML node: '<m:Button xmlns:m=\"sap.m\" id=\"brokenButton\" text=\"{This should cause a parse error\"/>':\n" + "SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0", "SyntaxError is thrown during parsing of binding string.");
    });
});
QUnit.test("[XMLView.create] error caused by missing function reference (property-type 'function')", function (assert) {
    var oViewPromise = XMLView.create({
        id: "asyncView3",
        definition: "<mvc:View xmlns=\"sap.m\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:html=\"http://www.w3.org/1999/xhtml\">" + "<Dialog id=\"dialog\" title=\"XML Fragment Dialog\" escapeHandler=\"closeDialog\">" + "   <Text text=\"title\" />                         " + "   <Text text=\"nope\" />                         " + "   <buttons>                                              " + "      <Button text=\"action!\" press=\"doSomething\" /> " + "      <Button text=\"stuff\" /> " + "   </buttons>                                             " + "</Dialog>                                                 " + "</mvc:View>"
    });
    return oViewPromise.then(function (oView) {
        assert.ok(false, "should not succeed");
    }, function (err) {
        assert.strictEqual(err.message, "Error found in View (id: 'asyncView3').\n" + "XML node: '<Dialog xmlns=\"sap.m\" id=\"dialog\" title=\"XML Fragment Dialog\" escapeHandler=\"closeDialog\"/>':\n" + "TypeError: The string 'closeDialog' couldn't be resolved to a function", "TypeError is thrown for missing function reference on Dialog.");
    });
});
QUnit.test("[sap.ui.xmlview] broken binding string, error on top-level", function (assert) {
    var oView = sap.ui.xmlview({
        id: "syncView1",
        viewContent: "<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:m='sap.m' xmlns:core='sap.ui.core'>" + "    <m:Panel>" + "       <m:Button id=\"brokenButtonInline\" text=\"{This should cause a parse error\"></m:Button>" + "    </m:Panel>" + "</mvc:View>"
    });
    assert.ok(this.logSpyError.calledOnce);
    assert.strictEqual(this.logSpyError.getCall(0).args[0].message, "Error found in View (id: 'syncView1').\n" + "XML node: '<m:Button xmlns:m=\"sap.m\" id=\"brokenButtonInline\" text=\"{This should cause a parse error\"/>':\n" + "SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0", "Correct SyntaxError is logged");
    assert.ok(oView.byId("brokenButtonInline"), "Button with broken binding is still created.");
    oView.destroy();
});
QUnit.test("[sap.ui.xmlview] broken binding string, error in nested Fragment", function (assert) {
    var oView = sap.ui.xmlview({
        id: "syncView2",
        viewContent: "<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:m='sap.m' xmlns:core='sap.ui.core'>" + "    <m:Panel>" + "       <core:Fragment id='innerFragment' fragmentName='testdata.fragments.XMLFragmentWithSyntaxErrors' type='XML'/>" + "    </m:Panel>" + "</mvc:View>"
    });
    assert.ok(this.logSpyError.calledOnce);
    assert.deepEqual(this.logSpyError.getCall(0).args[0].message, "Error found in Fragment (id: 'syncView2--innerFragment').\n" + "XML node: '<m:Button xmlns:m=\"sap.m\" id=\"brokenButton\" text=\"{This should cause a parse error\"/>':\n" + "SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0", "Correct SyntaxError is logged");
    assert.ok(oView.byId("innerFragment--brokenButton"), "Button with broken binding is still created.");
    oView.destroy();
});
QUnit.test("[sap.ui.xmlview] error caused by missing function reference (property-type 'function')", function (assert) {
    var oView = sap.ui.xmlview({
        id: "syncView3",
        viewContent: "<mvc:View xmlns=\"sap.m\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:html=\"http://www.w3.org/1999/xhtml\">" + "<Dialog id=\"dialog\" title=\"XML Fragment Dialog\" escapeHandler=\"closeDialog\">" + "   <Text text=\"title\" />                         " + "   <buttons>                                              " + "      <Button text=\"action!\" press=\"doSomething\" /> " + "      <Button text=\"stuff\" /> " + "   </buttons>                                             " + "</Dialog>                                                 " + "</mvc:View>"
    });
    assert.ok(this.logSpyError.calledOnce);
    assert.deepEqual(this.logSpyError.getCall(0).args[0].message, "Error found in View (id: 'syncView3').\n" + "XML node: '<Dialog xmlns=\"sap.m\" id=\"dialog\" title=\"XML Fragment Dialog\" escapeHandler=\"closeDialog\"/>':\n" + "TypeError: The string 'closeDialog' couldn't be resolved to a function", "Correct TypeError is logged");
    assert.ok(this.logSpyWarning.calledWithExactly("Event handler name 'doSomething' could not be resolved to an event handler function"), "Correct warning for missing event-handler was logged");
    assert.equal(oView.byId("dialog").getButtons().length, 2, "Inner Controls are created.");
    oView.destroy();
});
QUnit.test("[sap.ui.xmlview=async] broken binding string, error on top-level", function (assert) {
    return sap.ui.xmlview({
        id: "syncView1",
        async: true,
        viewContent: "<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:m='sap.m' xmlns:core='sap.ui.core'>" + "    <m:Panel>" + "       <m:Button id=\"brokenButtonInline\" text=\"{This should cause a parse error\"></m:Button>" + "    </m:Panel>" + "</mvc:View>"
    }).loaded().then(function (oView) {
        assert.ok(this.logSpyError.calledOnce);
        assert.strictEqual(this.logSpyError.getCall(0).args[0].message, "Error found in View (id: 'syncView1').\n" + "XML node: '<m:Button xmlns:m=\"sap.m\" id=\"brokenButtonInline\" text=\"{This should cause a parse error\"/>':\n" + "SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0", "Correct SyntaxError is logged");
        assert.ok(oView.byId("brokenButtonInline"), "Button with broken binding is still created.");
        oView.destroy();
    }.bind(this)).catch(function () {
        assert.ok(false, "The error shouldn't be thrown, only logged.");
    });
});
QUnit.test("[sap.ui.xmlview=async] broken binding string, error in nested Fragment", function (assert) {
    return sap.ui.xmlview({
        id: "syncView2",
        async: true,
        viewContent: "<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:m='sap.m' xmlns:core='sap.ui.core'>" + "    <m:Panel>" + "       <core:Fragment id='innerFragment' fragmentName='testdata.fragments.XMLFragmentWithSyntaxErrors' type='XML'/>" + "    </m:Panel>" + "</mvc:View>"
    }).loaded().then(function (oView) {
        assert.ok(this.logSpyError.calledOnce);
        assert.deepEqual(this.logSpyError.getCall(0).args[0].message, "Error found in Fragment (id: 'syncView2--innerFragment').\n" + "XML node: '<m:Button xmlns:m=\"sap.m\" id=\"brokenButton\" text=\"{This should cause a parse error\"/>':\n" + "SyntaxError: no closing braces found in '{This should cause a parse error' after pos:0", "Correct SyntaxError is logged");
        assert.ok(oView.byId("innerFragment--brokenButton"), "Button with broken binding is still created.");
        oView.destroy();
    }.bind(this)).catch(function () {
        assert.ok(false, "The error shouldn't be thrown, only logged.");
    });
});
QUnit.test("[sap.ui.xmlview=async] error caused by missing function reference (property-type 'function')", function (assert) {
    return sap.ui.xmlview({
        id: "syncView3",
        async: true,
        viewContent: "<mvc:View xmlns=\"sap.m\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:html=\"http://www.w3.org/1999/xhtml\">" + "<Dialog id=\"dialog\" title=\"XML Fragment Dialog\" escapeHandler=\"closeDialog\">" + "   <Text text=\"title\" />                         " + "   <buttons>                                              " + "      <Button text=\"action!\" press=\"doSomething\" /> " + "      <Button text=\"stuff\" /> " + "   </buttons>                                             " + "</Dialog>                                                 " + "</mvc:View>"
    }).loaded().then(function (oView) {
        assert.ok(this.logSpyError.calledOnce);
        assert.deepEqual(this.logSpyError.getCall(0).args[0].message, "Error found in View (id: 'syncView3').\n" + "XML node: '<Dialog xmlns=\"sap.m\" id=\"dialog\" title=\"XML Fragment Dialog\" escapeHandler=\"closeDialog\"/>':\n" + "TypeError: The string 'closeDialog' couldn't be resolved to a function", "Correct TypeError is logged");
        assert.ok(this.logSpyWarning.calledWithExactly("Event handler name 'doSomething' could not be resolved to an event handler function"), "Correct warning for missing event-handler was logged");
        assert.equal(oView.byId("dialog").getButtons().length, 2, "Inner Controls are created.");
        oView.destroy();
    }.bind(this)).catch(function () {
        assert.ok(false, "The error shouldn't be thrown, only logged.");
    });
});
QUnit.module("Preserve DOM");
QUnit.test("sync loading", function (assert) {
    var oView = sap.ui.xmlview("example.mvc.test").placeAt("content");
    sap.ui.getCore().applyChanges();
    var oElemPanel1 = oView.byId("myPanel").getDomRef();
    var oElemTable1 = document.getElementById(oView.createId("localTableId"));
    assert.ok(oElemPanel1, "DOM for myPanel should exist");
    assert.ok(oElemTable1, "DOM for localTableId should exist");
    oView.invalidate();
    sap.ui.getCore().applyChanges();
    var oElemPanel2 = oView.byId("myPanel").getDomRef();
    var oElemTable2 = document.getElementById(oView.createId("localTableId"));
    assert.ok(oElemPanel2, "DOM for myPanel should exist after rerendering");
    assert.ok(oElemTable2, "DOM for localTableId should exist after rerendering");
    assert.ok(oElemPanel1 !== oElemPanel2, "DOM for panel should differ");
    assert.ok(oElemTable1 === oElemTable2, "DOM for table must not differ");
    oView.destroy();
    sap.ui.getCore().applyChanges();
});
QUnit.test("async loading", function (assert) {
    var done = assert.async();
    var oView = sap.ui.xmlview({
        viewName: "example.mvc.test",
        async: true
    }).placeAt("content");
    sap.ui.getCore().applyChanges();
    var oElemView = oView.getDomRef();
    assert.ok(oElemView, "DOM for view must exist");
    assert.ok(oElemView.getAttribute("data-sap-ui-preserve") == null, "DOM must not be marked as 'to be preserved' after construction but before afterInit");
    oView.attachAfterInit(function () {
        sap.ui.getCore().applyChanges();
        var oElemView = oView.getDomRef();
        assert.ok(oElemView, "DOM for view must exist");
        assert.ok(oElemView.getAttribute("data-sap-ui-preserve"), "DOM must be marked as 'to be preserved' after init");
        var oElemPanel1 = oView.byId("myPanel").getDomRef();
        var oElemTable1 = document.getElementById(oView.createId("localTableId"));
        assert.ok(oElemPanel1, "DOM for myPanel should exist");
        assert.ok(oElemTable1, "DOM for localTableId should exist");
        oView.invalidate();
        sap.ui.getCore().applyChanges();
        var oElemPanel2 = oView.byId("myPanel").getDomRef();
        var oElemTable2 = document.getElementById(oView.createId("localTableId"));
        assert.ok(oElemPanel2, "DOM for myPanel should exist after rerendering");
        assert.ok(oElemTable2, "DOM for localTableId should exist after rerendering");
        assert.ok(oElemPanel1 !== oElemPanel2, "DOM for panel should differ");
        assert.ok(oElemTable1 === oElemTable2, "DOM for table must not differ");
        setTimeout(function () {
            done();
            oView.destroy();
            sap.ui.getCore().applyChanges();
        });
    });
});
QUnit.test("with custom RenderManager", function (assert) {
    var oView = sap.ui.xmlview("example.mvc.test");
    var oPanel = new Panel({
        text: "My View",
        content: [oView]
    }).placeAt("content");
    sap.ui.getCore().applyChanges();
    var oElemViewBefore = oView.getDomRef();
    assert.ok(oElemViewBefore, "DOM for view should exist");
    var oPanelContent = oPanel.getDomRef("content");
    var rm = sap.ui.getCore().createRenderManager();
    rm.renderControl(oView);
    rm.flush(oPanelContent);
    var oElemViewAfter = oView.getDomRef();
    assert.ok(oElemViewBefore, "DOM for view should exist after rerendering");
    assert.ok(oElemViewBefore === oElemViewAfter, "DOM must be the same");
    oPanel.destroy();
    sap.ui.getCore().applyChanges();
});
QUnit.test("visible property", function (assert) {
    var xmlview;
    function check(bVisible, sMsgSuffix) {
        var vLayoutNode = document.getElementById("vLayout");
        var btnBeforeNode = document.getElementById("btnBefore");
        var xmlviewNode = document.getElementById("xmlview");
        var xmlviewPlaceholderNode = document.getElementById("sap-ui-invisible-xmlview");
        var btnAfterNode = document.getElementById("btnAfter");
        assert.ok(vLayoutNode, "vLayout be rendered");
        assert.ok(btnBeforeNode, "btnBefore should be rendered");
        assert.ok(btnAfterNode, "btnBefore should be rendered");
        assert.ok(xmlviewNode, "xmlview should be rendered");
        if (bVisible) {
            assert.ok(!xmlviewPlaceholderNode, "there should be no invisible placeholder for the xmlview");
        }
        else {
            assert.ok(xmlviewPlaceholderNode, "xmlview placeholder should be rendered");
            assert.ok(RenderManager.isPreservedContent(xmlviewNode), "xmlview should be part of the preserved area");
        }
        if (bVisible) {
            assert.ok(vLayoutNode.compareDocumentPosition(xmlviewNode) & Node.DOCUMENT_POSITION_CONTAINED_BY, "xmlview should be a descendant of vLayout" + sMsgSuffix);
            assert.ok(btnBeforeNode.compareDocumentPosition(xmlviewNode) & Node.DOCUMENT_POSITION_FOLLOWING, "xmlview should follow the btnBeforeNode" + sMsgSuffix);
            assert.ok(btnAfterNode.compareDocumentPosition(xmlviewNode) & Node.DOCUMENT_POSITION_PRECEDING, "xmlview should preced the btnAfterNode" + sMsgSuffix);
        }
        else {
            assert.ok(!(vLayoutNode.compareDocumentPosition(xmlviewNode) & Node.DOCUMENT_POSITION_CONTAINED_BY), "xmlview should not be a descendant of vLayout" + sMsgSuffix);
            assert.ok(vLayoutNode.compareDocumentPosition(xmlviewPlaceholderNode) & Node.DOCUMENT_POSITION_CONTAINED_BY, "xmlview placeholder should be a descendant of vLayout" + sMsgSuffix);
            assert.ok(btnBeforeNode.compareDocumentPosition(xmlviewPlaceholderNode) & Node.DOCUMENT_POSITION_FOLLOWING, "xmlview placeholder should follow the btnBeforeNode" + sMsgSuffix);
            assert.ok(btnAfterNode.compareDocumentPosition(xmlviewPlaceholderNode) & Node.DOCUMENT_POSITION_PRECEDING, "xmlview placeholder should preced the btnAfterNode" + sMsgSuffix);
        }
        var xmlviewChildHTMLNode = document.getElementById(xmlview.createId("localTableId"));
        var xmlviewChildButton3Node = document.getElementById(xmlview.createId("Button3"));
        assert.ok(xmlviewChildHTMLNode, "xmlview child DOM should be rendered");
        assert.ok(xmlviewChildButton3Node, "xmlview child control should be rendered");
        assert.ok(xmlviewNode.compareDocumentPosition(xmlviewChildHTMLNode) & Node.DOCUMENT_POSITION_CONTAINED_BY, "xmlview DOM should contain child DOM" + sMsgSuffix);
        assert.ok(xmlviewNode.compareDocumentPosition(xmlviewChildButton3Node) & Node.DOCUMENT_POSITION_CONTAINED_BY, "xmlview DOM should contain child control DOM" + sMsgSuffix);
        if (xmlviewPlaceholderNode) {
            assert.ok(!(xmlviewPlaceholderNode.compareDocumentPosition(xmlviewChildHTMLNode) & Node.DOCUMENT_POSITION_CONTAINED_BY), "xmlview placeholder should not contain child DOM of xmlview" + sMsgSuffix);
            assert.ok(!(xmlviewPlaceholderNode.compareDocumentPosition(xmlviewChildButton3Node) & Node.DOCUMENT_POSITION_CONTAINED_BY), "xmlview placeholder should not contain child control DOM of xmlview" + sMsgSuffix);
        }
    }
    var iLayoutRendered = 0;
    var oLayout = new VerticalLayout({
        id: "vLayout",
        content: [
            new Button({ id: "btnBefore", text: "Button Before" }),
            xmlview = sap.ui.xmlview("xmlview", "example.mvc.test"),
            new Button({ id: "btnAfter", text: "Button After" })
        ]
    });
    oLayout.addEventDelegate({
        onAfterRendering: function () {
            iLayoutRendered++;
        }
    });
    oLayout.placeAt("content");
    sap.ui.getCore().applyChanges();
    check(true, " (after initial rendering)");
    assert.equal(1, iLayoutRendered, "layout initially should have been rendered once");
    xmlview.setVisible(false);
    sap.ui.getCore().applyChanges();
    check(false, " (after becoming invisible)");
    assert.equal(1, iLayoutRendered, "layout still should have been rendered only once (after making the xmlview invisible)");
    xmlview.setVisible(true);
    sap.ui.getCore().applyChanges();
    check(true, " (after becoming visible again)");
    assert.equal(1, iLayoutRendered, "layout still should have been rendered only once (after making the xmlview visible again)");
    oLayout.destroy();
});
QUnit.test("invisible child", function (assert) {
    var oView = sap.ui.xmlview("example.mvc.test").placeAt("content"), oPanel = oView.byId("myPanel");
    sap.ui.getCore().applyChanges();
    assert.ok(oPanel.getDomRef() && !isInPreservedArea(oPanel.getDomRef()), "panel rendered (and not part of the preserve area())");
    oPanel.setVisible(false);
    sap.ui.getCore().applyChanges();
    assert.notOk(oPanel.getDomRef(), "panel should be hidden");
    assert.ok(invisiblePlaceholder(oPanel), "invisible placeholder should exist for the panel");
    oView.setVisible(false);
    sap.ui.getCore().applyChanges();
    assert.ok(oView.getDomRef() && isPreserved(oView.getDomRef()), "view has DOM and DOM is in preserved area");
    assert.ok(invisiblePlaceholder(oPanel), "invisible placeholder still should exist for panel");
    assert.ok(isInPreservedArea(invisiblePlaceholder(oPanel)), "invisible placeholder should be part of the preserve area");
    oView.setVisible(true);
    oPanel.setVisible(true);
    sap.ui.getCore().applyChanges();
    assert.ok(oView.getDomRef() && !isPreserved(oView.getDomRef()), "view has DOM and DOM is no longer in preserved area");
    assert.notOk(dummyPlaceholder(oView), "view should have no more dummy placeholder");
    assert.notOk(invisiblePlaceholder(oView), "view should have no more invisible placeholder");
    assert.ok(oPanel.getDomRef() && !isInPreservedArea(oPanel.getDomRef()), "panel rendered after making it visible");
    assert.notOk(dummyPlaceholder(oPanel), "panel should have no more dummy placeholder");
    assert.notOk(invisiblePlaceholder(oPanel), "panel should have no more invisible placeholder");
    oView.setVisible(false);
    oPanel.setVisible(false);
    sap.ui.getCore().applyChanges();
    oView.setVisible(true);
    sap.ui.getCore().applyChanges();
    assert.ok(oView.getDomRef() && !isPreserved(oView.getDomRef()), "view has DOM and DOM is no longer in preserved area");
    assert.notOk(oPanel.getDomRef(), "panel not rendered");
    assert.ok(invisiblePlaceholder(oPanel), "invisible placeholder should exist for invisible panel");
    assert.notOk(dummyPlaceholder(oPanel), "dummy placeholder must not exists for invisible panel");
    oPanel.setVisible(true);
    sap.ui.getCore().applyChanges();
    assert.ok(oPanel.getDomRef(), "panel rendered after making it visible");
    assert.notOk(invisiblePlaceholder(oPanel), "invisible placeholder must not exist for visible panel");
    assert.notOk(dummyPlaceholder(oPanel), "dummy placeholder must not exists for visible panel");
    oView.destroy();
    sap.ui.getCore().applyChanges();
});
QUnit.test("Destroy removes preserved content from DOM", function (assert) {
    var oView = sap.ui.xmlview("example.mvc.test").placeAt("content");
    sap.ui.getCore().applyChanges();
    var oDomRef = oView.getDomRef();
    RenderManager.preserveContent(oDomRef, true);
    oView.destroy();
    assert.ok(!RenderManager.getPreserveAreaRef().hasChildNodes(), "Preserve area is empty");
});
QUnit.test("Destroy with 'KeepDom'-mode removes preservable flag from DOM ref", function (assert) {
    var oView = sap.ui.xmlview("example.mvc.test").placeAt("content");
    sap.ui.getCore().applyChanges();
    var oDomRef = oView.getDomRef();
    oView.destroy("KeepDom");
    RenderManager.preserveContent(oDomRef, true);
    assert.ok(!RenderManager.getPreserveAreaRef().hasChildNodes(), "Nothing got preserved");
    oDomRef = oView.getDomRef();
    oDomRef.parentElement.removeChild(oDomRef);
});
QUnit.test("Directly Nested XMLViews", function (assert) {
    sap.ui.require.preload({
        "nested/views/outer.view.xml": "<View xmlns=\"sap.ui.core.mvc\">" + "<Text id=\"before\" text=\"another control before the nested view\" xmlns=\"sap.m\" />" + "<XMLView viewName=\"nested.views.middle\" id=\"middle\" />" + "<Text id=\"after\" text=\"another control after the nested view\" xmlns=\"sap.m\" />" + "</View>",
        "nested/views/middle.view.xml": "<View xmlns=\"sap.ui.core.mvc\">" + "<Text id=\"before\" text=\"another control before the nested view\" xmlns=\"sap.m\" />" + "<VBox id=\"vbox\" xmlns=\"sap.m\">" + "<XMLView viewName=\"nested.views.inner\" id=\"indirect-inner\" xmlns=\"sap.ui.core.mvc\" />" + "</VBox>" + "<XMLView viewName=\"nested.views.inner\" id=\"direct-inner\" xmlns=\"sap.ui.core.mvc\" />" + "<Text id=\"after\" text=\"another control before the nested view\" xmlns=\"sap.m\" />" + "</View>",
        "nested/views/inner.view.xml": "<View xmlns=\"sap.ui.core.mvc\">" + "<Text id=\"inside\" text=\"another control inside the view\" xmlns=\"sap.m\" />" + "</View>"
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
    var oView = sap.ui.xmlview("outer", { viewName: "nested.views.outer" }).placeAt("content");
    sap.ui.getCore().applyChanges();
    expectedControls.forEach(function (sId) {
        var oControl = sap.ui.getCore().byId(sId);
        assert.ok(oControl, "control with id '" + sId + "' should exist");
        assert.ok(oControl.getDomRef(), "control with id '" + sId + "' should have DOM");
    });
    var count = 0;
    expectedControls.forEach(function (sId) {
        var oControl = sap.ui.getCore().byId(sId);
        oControl.addDelegate({
            onBeforeRendering: function () {
                count += 100;
            },
            onAfterRendering: function () {
                count += 1;
            }
        });
    });
    oView.invalidate();
    sap.ui.getCore().applyChanges();
    assert.equal(count, 101 * expectedControls.length, "all controls should have participated in the rendering");
    expectedControls.forEach(function (sId) {
        var oControl = sap.ui.getCore().byId(sId);
        assert.ok(oControl, "control with id '" + sId + "' should exist");
        assert.ok(oControl.getDomRef(), "control with id '" + sId + "' should have DOM");
        assert.notOk(document.getElementById(RenderManager.RenderPrefixes.Dummy + sId), "there should be no more Dummy-Element for id '" + sId + "'");
        assert.notOk(document.getElementById(RenderManager.RenderPrefixes.Temporary + sId), "there should be no more Temporary-Element for id '" + sId + "'");
    });
    oView.destroy();
    expectedControls.forEach(function (sId) {
        var oControl = sap.ui.getCore().byId(sId);
        assert.notOk(oControl, "control with id '" + sId + "' should no longer exist");
        assert.notOk(document.getElementById(sId), "there should be no more DOM with id '" + sId + "'");
    });
});
QUnit.module("Rendering", {
    before: function () {
        sap.ui.predefine("testdata/mvc/EmptyControl", ["sap/ui/core/Control"], function (Control) {
            return Control.extend("testdata.mvc.EmptyControl", {
                metadata: {},
                renderer: {
                    render: function () { }
                }
            });
        });
    }
});
QUnit.test("Empty Control in XMLView", function (assert) {
    var sXML = "<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:test=\"testdata.mvc\">" + "<Button id=\"Benjamin\" text=\"DJ Ben Jammin\"></Button>" + "<test:EmptyControl></test:EmptyControl>" + "<Button id=\"Jenson\" text=\"Jenson\"></Button>" + "</mvc:View>";
    return XMLView.create({
        definition: sXML
    }).then(function (oView) {
        oView.placeAt("content");
        sap.ui.getCore().applyChanges();
        var oButtonDomRef = oView.byId("Jenson").getDomRef();
        assert.ok(oButtonDomRef.parentNode === oView.getDomRef(), "Button is a direct DOM child of the View.");
        oView.destroy();
    });
});
QUnit.module("Additional tests:");
QUnit.test("Error in template - no default aggregation defined", function (assert) {
    var sXml = [
        "<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns:test=\"sap.ui.testlib\" xmlns=\"http://www.w3.org/1999/xhtml\">",
        "\t<test:TestButton>",
        "\t\t<test:Error/>",
        "\t</test:TestButton>",
        "</mvc:View>"
    ].join(""), sError = "Cannot add direct child without default aggregation defined for control sap.ui.testlib.TestButton";
    assert.throws(function () {
        sap.ui.xmlview("erroneous_view_1", { viewContent: sXml });
    }, Error(sError), "Must throw an error");
});
QUnit.test("Error in template - text in aggregation", function (assert) {
    var sXml = [
        "<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns:test=\"sap.ui.testlib\" xmlns=\"http://www.w3.org/1999/xhtml\">",
        "\t<test:TestButton>",
        "\t\tError",
        "\t</test:TestButton>",
        "</mvc:View>"
    ].join(""), sError = "Cannot add text nodes as direct child of an aggregation. For adding text to an aggregation, a surrounding html tag is needed: Error";
    assert.throws(function () {
        sap.ui.xmlview("erroneous_view_2", { viewContent: sXml });
    }, Error(sError), "Must throw an error");
});
QUnit.test("Error in controller", function (assert) {
    var sXml = [
        "<mvc:View controllerName=\"example.mvc.test.error\" xmlns:mvc=\"sap.ui.core.mvc\">",
        "</mvc:View>"
    ].join("");
    sap.ui.controller("example.mvc.test.error", {
        onInit: function () {
            throw new Error("Controller error");
        }
    });
    assert.throws(function () {
        sap.ui.xmlview("erroneous_view_3", { viewContent: sXml });
    }, Error("Controller error"), "Must throw an error");
});
QUnit.test("Encoding", function (assert) {
    var xmlWithHTMLFragment = [
        "<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"http://www.w3.org/1999/xhtml\">",
        "  <div title=\"&quot;&gt;&lt;span id=&quot;broken1&quot;&gt;broken1&lt;/span&gt;&lt;x y=&quot;\">",
        "    <span id=\"valid1\"></span>",
        "    <span id=\"valid2\">",
        "      &lt;span id=&quot;broken2&quot;&gt;broken2&lt;/span&gt;",
        "    </span>",
        "  </div>",
        "</mvc:View>"
    ].join("");
    var view = sap.ui.xmlview("view", { viewContent: xmlWithHTMLFragment });
    view.placeAt("content");
    sap.ui.getCore().applyChanges();
    assert.ok(jQuery("#view--valid1").length == 1, "DOM must contain view--valid1 element.");
    assert.ok(jQuery("#view--valid2").length == 1, "DOM must contain view--valid2 element.");
    assert.ok(jQuery("#broken1").length == 0, "DOM must not contain broken1 element.");
    assert.ok(jQuery("#broken2").length == 0, "DOM must not contain broken2 element.");
});
QUnit.test("DataBinding", function (assert) {
    var oModel1 = new JSONModel({
        booleanValue: true,
        integerValue: 8015,
        stringValue: "Text1",
        data: {
            booleanValue: false,
            integerValue: 4242,
            stringValue: "Text2"
        }
    });
    var oModel2 = new JSONModel({
        booleanValue: false,
        integerValue: 4711,
        stringValue: "1txeT"
    });
    var xmlWithBindings = [
        "<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns:test=\"sap.ui.testlib\">",
        "  <test:TestButton id=\"btn\" enabled=\"{/booleanValue}\" text=\"{/stringValue}\" width=\"{/integerValue}\" />",
        "</mvc:View>"
    ].join("");
    var xmlWithNamedBindings = [
        "<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns:test=\"sap.ui.testlib\">",
        "  <test:TestButton id=\"btn\" enabled=\"{model2>/booleanValue}\" text=\"{model1>/stringValue}\" width=\"{/integerValue}\" />",
        "</mvc:View>"
    ].join("");
    var xmlWithElementBinding = [
        "<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns:test=\"sap.ui.testlib\">",
        "  <test:TestButton id=\"btn\" binding=\"{/data}\" enabled=\"{booleanValue}\" text=\"{stringValue}\" width=\"{integerValue}\" />",
        "</mvc:View>"
    ].join("");
    var xmlWithoutBindings = [
        "<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns:test=\"sap.ui.testlib\">",
        "  <test:TestButton id=\"btn1\" enabled=\"true\" text=\"The following set is empty: \\{\\}\" width=\"67\" />",
        "  <test:TestButton id=\"btn2\" enabled=\"false\" text=\"\\{\\} is an empty set\" width=\"42\" />",
        "  <test:TestButton id=\"btn3\" enabled=\"true\" text=\"The following array is empty: []\" width=\"67\" />",
        "  <test:TestButton id=\"btn4\" enabled=\"false\" text=\"[] is an empty array\" width=\"42\" />",
        "</mvc:View>"
    ].join("");
    var oViewWithBindings1 = sap.ui.xmlview({ viewContent: xmlWithBindings });
    oViewWithBindings1.setModel(oModel1);
    assert.equal(oViewWithBindings1.byId("btn").getEnabled(), oModel1.getData().booleanValue, "Check 'enabled' property of button 'btn'");
    assert.equal(oViewWithBindings1.byId("btn").getText(), oModel1.getData().stringValue, "Check 'text' property of button 'btn'");
    assert.equal(oViewWithBindings1.byId("btn").getWidth(), oModel1.getData().integerValue, "Check 'width' property of button 'btn'");
    var oViewWithBindings2 = sap.ui.xmlview({ viewContent: xmlWithBindings });
    oViewWithBindings2.setModel(oModel2);
    assert.equal(oViewWithBindings2.byId("btn").getEnabled(), oModel2.getData().booleanValue, "Check 'enabled' property of button 'btn'");
    assert.equal(oViewWithBindings2.byId("btn").getText(), oModel2.getData().stringValue, "Check 'text' property of button 'btn'");
    assert.equal(oViewWithBindings2.byId("btn").getWidth(), oModel2.getData().integerValue, "Check 'width' property of button 'btn'");
    var oViewWithNamedBindings = sap.ui.xmlview({ viewContent: xmlWithNamedBindings });
    oViewWithNamedBindings.setModel(oModel2);
    oViewWithNamedBindings.setModel(oModel1, "model1");
    oViewWithNamedBindings.setModel(oModel2, "model2");
    assert.equal(oViewWithNamedBindings.byId("btn").getEnabled(), oModel2.getData().booleanValue, "Check 'enabled' property of button 'btn'");
    assert.equal(oViewWithNamedBindings.byId("btn").getText(), oModel1.getData().stringValue, "Check 'text' property of button 'btn'");
    assert.equal(oViewWithNamedBindings.byId("btn").getWidth(), oModel2.getData().integerValue, "Check 'width' property of button 'btn'");
    var oViewWithElementBinding = sap.ui.xmlview({ viewContent: xmlWithElementBinding });
    oViewWithElementBinding.setModel(oModel1);
    assert.equal(oViewWithElementBinding.byId("btn").getEnabled(), oModel1.getData().data.booleanValue, "Check 'enabled' property of button 'btn'");
    assert.equal(oViewWithElementBinding.byId("btn").getText(), oModel1.getData().data.stringValue, "Check 'text' property of button 'btn'");
    assert.equal(oViewWithElementBinding.byId("btn").getWidth(), oModel1.getData().data.integerValue, "Check 'width' property of button 'btn'");
    var oViewWithoutBindings = sap.ui.xmlview({ viewContent: xmlWithoutBindings });
    oViewWithoutBindings.setModel(oModel1);
    oViewWithoutBindings.setModel(oModel1, "model1");
    oViewWithoutBindings.setModel(oModel2, "model2");
    assert.equal(oViewWithoutBindings.byId("btn1").getText(), "The following set is empty: {}", "Check 'text' property of button 'btn1'");
    assert.equal(oViewWithoutBindings.byId("btn2").getText(), "{} is an empty set", "Check 'text' property of button 'btn2'");
    assert.equal(oViewWithoutBindings.byId("btn3").getText(), "The following array is empty: []", "Check 'text' property of button 'btn3'");
    assert.equal(oViewWithoutBindings.byId("btn4").getText(), "[] is an empty array", "Check 'text' property of button 'btn4'");
});
QUnit.test("Custom Data", function (assert) {
    var oModel = new JSONModel({
        value: "myValue"
    });
    var xmlWithBindings = [
        "<mvc:View controllerName=\"example.mvc.test\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:test=\"sap.ui.testlib\" xmlns:app=\"http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1\">",
        "  <test:TestButton id=\"btn\" app:myKey1=\"myValue1\" app:myKey2=\"{/value}\" app:myKey3=\"{path: '/value', formatter:'.valueFormatter'}\" />",
        "</mvc:View>"
    ].join("");
    var oView = sap.ui.xmlview({ viewContent: xmlWithBindings });
    oView.setModel(oModel);
    assert.equal(oView.byId("btn").data("myKey1"), "myValue1", "Check CustomData 'myKey1' of button 'btn'");
    assert.equal(oView.byId("btn").data("myKey2"), oModel.getData().value, "Check CustomData 'myKey2' of button 'btn'");
    assert.equal(oView.byId("btn").data("myKey3"), "formatted-" + oModel.getData().value, "Check CustomData 'myKey3' of button 'btn'");
});
QUnit.module("Preprocessor API", {
    beforeEach: function () {
        this.sViewContent = "<mvc:View xmlns:mvc=\"sap.ui.core.mvc\"/>";
        this.runPreprocessorSpy = sinon.spy(View.prototype, "runPreprocessor");
        this.fnGetConfig = function (fnPreprocessor, bSyncSupport) {
            return {
                preprocessor: fnPreprocessor,
                _syncSupport: !!bSyncSupport
            };
        };
        this.fnChangeSourcePreprocessor = function (xml) {
            this.xml = jQuery.sap.parseXML(this.sViewContent).documentElement;
            return this.xml;
        }.bind(this);
        this.createView = function (bAsync) {
            var preprocessor = {
                preprocessor: this.fnChangeSourcePreprocessor,
                _syncSupport: true
            };
            return sap.ui.xmlview({
                async: bAsync,
                viewContent: this.sViewContent,
                preprocessors: {
                    xml: preprocessor,
                    viewxml: preprocessor
                }
            });
        }.bind(this);
    },
    afterEach: function () {
        View._mPreprocessors = {};
        this.runPreprocessorSpy.restore();
        delete this.xml;
    }
});
QUnit.test("registration", function (assert) {
    var logSpyError = this.spy(Log, "error");
    XMLView.registerPreprocessor(XMLView.PreprocessorType.XML, jQuery.noop, false);
    XMLView.registerPreprocessor(XMLView.PreprocessorType.VIEWXML, jQuery.noop, false);
    XMLView.registerPreprocessor(XMLView.PreprocessorType.CONTROLS, jQuery.noop, false);
    assert.strictEqual(View._mPreprocessors["XML"]["xml"][1].preprocessor, jQuery.noop, "Registration for xml successful");
    assert.strictEqual(View._mPreprocessors["XML"]["viewxml"][0].preprocessor, jQuery.noop, "Registration for viewxml successful");
    assert.strictEqual(View._mPreprocessors["XML"]["controls"][0].preprocessor, jQuery.noop, "Registration for content successful");
    logSpyError.resetHistory();
    XMLView.registerPreprocessor("unknown", jQuery.noop, false, { type: "unknown" });
    assert.ok(logSpyError.calledWith(sinon.match(/could not be registered due to unknown/)), "Error logged when registering invalid type");
    assert.strictEqual(View._mPreprocessors["XML"]["unknown"], undefined, "Registration for invalid type refused");
    logSpyError.resetHistory();
    XMLView.registerPreprocessor(XMLView.PreprocessorType.XML, jQuery.noop, false, true);
    assert.ok(logSpyError.calledWith(sinon.match(/only one on-demand-preprocessor allowed/)), "Error logged when registering more than one ondemand pp");
    assert.strictEqual(View._mPreprocessors["XML"]["unknown"], undefined, "Registration for invalid type refused");
    var fnUniquePP = function () { };
    XMLView.registerPreprocessor(XMLView.PreprocessorType.XML, fnUniquePP, "XML", false);
    assert.ok(Array.isArray(View._mPreprocessors["XML"]["xml"]) && View._mPreprocessors["XML"]["xml"].some(function (entry) {
        return entry.preprocessor === fnUniquePP;
    }), "Preprocessor call passed through to View");
    assert.throws(function () {
        XMLView.registerPreprocessor(XMLView.PreprocessorType.XML, fnUniquePP, "YAML", false);
    }, TypeError, "TypeError thrown when registering for a view type other than XML");
});
QUnit.test("sync / no execution", function (assert) {
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
QUnit.test("sync: assignment of preprocessor results", function (assert) {
    assert.expect(1);
    var oView = this.createView();
    assert.strictEqual(oView._xContent, this.xml, "Result was correctly assigned");
});
QUnit.test("async: assignment of preprocessor results", function (assert) {
    assert.expect(1);
    return this.createView(true).loaded().then(function (oView) {
        assert.strictEqual(oView._xContent, this.xml, "Result was correctly assigned");
    }.bind(this));
});
function testPreprocessor(assert, bSync, sType, iCount) {
    var oView, oPreprocessors = {}, preprocessorSpy = sinon.spy(function (vSource) {
        return bSync ? vSource : Promise.resolve(vSource);
    }), fnAssert = function () {
        if (sType === "viewxml") {
            sinon.assert.calledThrice(this.runPreprocessorSpy);
        }
        else {
            sinon.assert.calledTwice(this.runPreprocessorSpy);
        }
        sinon.assert.calledWith(this.runPreprocessorSpy, sType);
        sinon.assert.callCount(preprocessorSpy, iCount);
    }.bind(this);
    assert.expect(3);
    if (!iCount) {
        iCount = 1;
        oPreprocessors[sType] = this.fnGetConfig(preprocessorSpy, true);
    }
    else {
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
    var oView, oPreprocessors = {}, error, oError = new Error("preprocessor failed"), preprocessorSpy = sinon.spy(function (vSource) {
        throw oError;
    }), fnAssert = function (e) {
        assert.strictEqual(e, oError, "error was processed");
    };
    assert.expect(1);
    oPreprocessors[sType] = this.fnGetConfig(preprocessorSpy, true);
    try {
        oView = sap.ui.xmlview({
            viewContent: this.sViewContent,
            preprocessors: oPreprocessors,
            async: !bSync
        });
    }
    catch (_error) {
        error = _error;
    }
    return bSync ? fnAssert(error) : oView.loaded().catch(fnAssert);
}
jQuery.each(XMLView.PreprocessorType, function (sProp, sType) {
    QUnit.test("sync - single preprocessor " + sType + " (compatible)", function (assert) {
        testPreprocessor.call(this, assert, true, sType);
    });
    QUnit.test("sync - multiple preprocessors " + sType, function (assert) {
        testPreprocessor.call(this, assert, true, sType, 2);
    });
    QUnit.test("async - single preprocessor " + sType + " (compatible)", function (assert) {
        return testPreprocessor.call(this, assert, false, sType);
    });
    QUnit.test("async - multiple preprocessors " + sType, function (assert) {
        return testPreprocessor.call(this, assert, false, sType, 2);
    });
    QUnit.test("sync - preprocessor error " + sType + " (compatible)", function (assert) {
        testPreprocessorError.call(this, assert, true, sType);
    });
    QUnit.test("async - preprocessor error " + sType, function (assert) {
        testPreprocessorError.call(this, assert, true, sType);
    });
});