import StashedControlSupport from "sap/ui/core/StashedControlSupport";
import Element from "sap/ui/core/Element";
import Component from "sap/ui/core/Component";
import XMLView from "sap/ui/core/mvc/XMLView";
import Fragment from "sap/ui/core/Fragment";
import ListItem from "sap/ui/core/ListItem";
import JSONModel from "sap/ui/model/json/JSONModel";
import Button from "sap/m/Button";
import SegmentedButton from "sap/m/SegmentedButton";
import SegmentedButtonItem from "sap/m/SegmentedButtonItem";
import Select from "sap/m/Select";
import Panel from "sap/m/Panel";
import ObjectPageLayout from "sap/uxap/ObjectPageLayout";
import Log from "sap/base/Log";
import createAndAppendDiv from "sap/ui/qunit/utils/createAndAppendDiv";
createAndAppendDiv("content");
var sViewContent = "<mvc:View xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\">" + "<Panel id=\"Panel\">" + "<content>" + "<Button id=\"StashedButton\" stashed=\"true\"/>" + "<Button id=\"Button\"/>" + "</content>" + "</Panel>" + "</mvc:View>";
QUnit.module("Control mixin", {
    beforeEach: function () {
        this.Button = Button.extend("Button");
    }
});
QUnit.test("class", function (assert) {
    var fnClone = this.Button.prototype.clone, fnDestroy = this.Button.prototype.destroy;
    StashedControlSupport.mixInto(this.Button);
    assert.ok(this.Button.prototype.isStashed, "Control class has method 'isStashed'");
    assert.ok(this.Button.prototype.unstash, "Control class has method 'unstash'");
    assert.notStrictEqual(this.Button.prototype.destroy, fnClone, "Control class method 'clone' overwritten'");
    assert.notStrictEqual(this.Button.prototype.destroy, fnDestroy, "Control class method 'destroy' overwritten'");
});
QUnit.test("instance", function (assert) {
    StashedControlSupport.mixInto(this.Button);
    var oButton = new this.Button();
    assert.ok(!oButton.mProperties.stashed, "Control instance has 'stashed' property");
    assert.ok(oButton.isStashed, "Control instance has method 'isStashed'");
    assert.ok(oButton.unstash, "Control instance has method 'unstash'");
    assert.strictEqual(oButton.isStashed(), false, "'stashed' property default value is false");
    oButton.destroy();
});
QUnit.module("StashedControl", {
    beforeEach: function () {
        this.sId = "control";
        this.Button = Button.extend("Button");
        StashedControlSupport.mixInto(this.Button);
        this.create = function () {
            this.oUnstashedButton = new this.Button(this.sId);
            return [this.oUnstashedButton];
        }.bind(this);
        this.mSettings = {
            wrapperId: this.sId,
            fnCreate: this.create
        };
        this.oPanel = new Panel("parent");
        this.oButton = new this.Button(this.sId);
        this.oPanel.addContent(this.oButton);
    },
    afterEach: function () {
        if (this.oButton) {
            this.oButton.destroy();
        }
        this.oPanel.destroy();
    }
});
QUnit.test("factory", function (assert) {
    this.oStashedInfo = StashedControlSupport.createStashedControl(this.mSettings);
    assert.strictEqual(this.oStashedInfo.wrapperId, this.sId, "id is set");
    assert.strictEqual(this.oStashedInfo.fnCreate, this.create, "fnCreate hook is set");
});
QUnit.test("unstash", function (assert) {
    this.oStashedInfo = StashedControlSupport.createStashedControl(this.mSettings);
    assert.ok(this.oButton.isStashed(), "Control is stashed");
    this.oButton.unstash();
    assert.strictEqual(sap.ui.getCore().byId(this.sId), this.oUnstashedButton, "StashedControl has been replaced");
    assert.notOk(this.oUnstashedButton.isStashed(), "Control is not stashed anymore");
});
QUnit.test("destroy", function (assert) {
    StashedControlSupport.createStashedControl({
        wrapperId: "iAmStashed"
    });
    this.oButton = new this.Button("iAmStashed", { stashed: true });
    this.oPanel.addAggregation("content", this.oButton);
    this.oPanel.destroy();
    assert.strictEqual(StashedControlSupport.getStashedControls().length, 0, "Stashed control has been destroyed");
});
QUnit.module("XML (Controls)", {
    beforeEach: function () {
        this.assertSpy = this.spy(console, "assert");
        if (!Button.prototype.isStashed) {
            StashedControlSupport.mixInto(Button);
        }
        this.oView = sap.ui.xmlview("view", {
            viewContent: sViewContent
        }).placeAt("content");
    },
    afterEach: function (assert) {
        assert.ok(this.assertSpy.neverCalledWith(sinon.match.falsy, sinon.match(/unknown setting.*visible/)), "visible property never should be set when a class doesn't support it");
        this.oView.destroy();
    }
});
QUnit.test("StashedControl support (controls)", function (assert) {
    var done = assert.async();
    this.oView.onAfterRendering = function () {
        assert.strictEqual(jQuery("#view--StashedButton").length, 0, "Stashed button is not rendered");
        var oButton = sap.ui.getCore().byId("view--StashedButton");
        assert.ok(oButton, "Stashed button is available by id");
        assert.ok(oButton instanceof Button, "Stashed button is instanceof sap.m.Button");
        assert.ok(oButton.isStashed(), "Stashed button has stashed=true");
        assert.notOk(oButton.getVisible(), "Stashed button has visible=false");
        assert.strictEqual(jQuery("#view--Button").length, 1, "Button is rendered");
        assert.ok(sap.ui.getCore().byId("view--Button") instanceof Button, "Button is a Button");
        this.oView.onAfterRendering = function () {
            var oUnstashedButton = sap.ui.getCore().byId("view--StashedButton");
            assert.strictEqual(jQuery("#view--StashedButton").length, 1, "Unstashed button is rendered");
            assert.ok(oUnstashedButton instanceof Button, "Unstashed Button is still a Button");
            assert.notOk(oUnstashedButton.isStashed(), "UnstashedButton.isStashed() != true");
            assert.ok(oUnstashedButton.getVisible(), "Unstashed button has visible=true");
            done();
        };
        oButton.unstash();
        this.oView.invalidate();
    }.bind(this);
    this.oView.invalidate();
});
QUnit.test("getStashedControls", function (assert) {
    assert.strictEqual(StashedControlSupport.getStashedControls().length, 1, "One stashed control existent");
    assert.strictEqual(StashedControlSupport.getStashedControls("Panel")[0], sap.ui.getCore().byId("control11"), "One stashed controls in parent1");
});
QUnit.test("getStashedControlIds", function (assert) {
    assert.strictEqual(StashedControlSupport.getStashedControlIds().length, 1, "One stashed control existent");
    assert.strictEqual(StashedControlSupport.getStashedControlIds("view--Panel")[0], "view--StashedButton", "One stashed controls in parent1");
});
QUnit.module("XML (Elements)", {
    beforeEach: function () {
        this.assertSpy = this.spy(console, "assert");
    },
    afterEach: function (assert) {
        assert.ok(this.assertSpy.neverCalledWith(sinon.match.falsy, sinon.match(/unknown setting.*visible/)), "visible property never should be set when a class doesn't support it");
    }
});
QUnit.test("StashedControl support (Element with visible)", function (assert) {
    if (!SegmentedButtonItem.prototype.isStashed) {
        StashedControlSupport.mixInto(SegmentedButtonItem);
    }
    return XMLView.create({
        definition: "<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\">" + "<SegmentedButton id=\"SegmentedButton\">" + "<items>" + "<SegmentedButtonItem id=\"ItemA\" text=\"A\" stashed=\"true\" visible=\"true\"/>" + "<SegmentedButtonItem id=\"ItemB\" text=\"B\" stashed=\"true\" visible=\"false\"/>" + "<SegmentedButtonItem id=\"ItemC\" text=\"C\" visible=\"false\"/>" + "</items>" + "</SegmentedButton>" + "</mvc:View>"
    }).then(function (oView) {
        var oItemA = oView.byId("ItemA");
        var oItemB = oView.byId("ItemB");
        var oItemC = oView.byId("ItemC");
        assert.ok(oItemA instanceof SegmentedButtonItem, "ItemA is a SegmentedButtonItem");
        assert.ok(oItemA.isStashed(), "ItemA is stashed");
        assert.notOk(oItemA.getVisible(), "ItemA is not visible");
        assert.ok(oItemB instanceof SegmentedButtonItem, "ItemB is a SegmentedButtonItem");
        assert.ok(oItemB.isStashed(), "ItemB is stashed");
        assert.notOk(oItemB.getVisible(), "ItemB is not visible");
        assert.ok(oItemC instanceof SegmentedButtonItem, "ItemC is a SegmentedButtonItem");
        assert.notOk(oItemC.isStashed(), "ItemC is not stashed");
        assert.notOk(oItemC.getVisible(), "ItemC is not visible");
        assert.strictEqual(StashedControlSupport.getStashedControls().length, 2, "There should be 2 stashed objects");
        assert.strictEqual(StashedControlSupport.getStashedControlIds().length, 2, "There should be 2 stashed IDs");
        assert.deepEqual(StashedControlSupport.getStashedControlIds().sort(), [oView.createId("ItemA"), oView.createId("ItemB")], "the IDs of the stashed objects should match the IDs of the stashed items in the view");
        var oUnstashedItemA = oItemA.unstash();
        var oUnstashedItemB = oItemB.unstash();
        assert.notStrictEqual(oUnstashedItemA, oItemA, "stashed and unstashed ItemA should differ");
        assert.ok(oUnstashedItemA instanceof SegmentedButtonItem, "unstashed ItemA is a SegmentedButtonItem");
        assert.notOk(oUnstashedItemA.isStashed(), "unstashed ItemA no longer has stashed=true");
        assert.ok(oUnstashedItemA.getVisible(), "unstashed ItemA is visible");
        assert.notStrictEqual(oUnstashedItemB, oItemB, "stashed and unstashed ItemB should differ");
        assert.ok(oUnstashedItemB instanceof SegmentedButtonItem, "unstashed ItemB is a SegmentedButtonItem");
        assert.notOk(oUnstashedItemB.isStashed(), "unstashed ItemB no longer has stashed=true");
        assert.notOk(oUnstashedItemB.getVisible(), "unstashed ItemB is still not visible");
        oView.destroy();
    });
});
QUnit.test("StashedControl support (Element w/o visible)", function (assert) {
    if (!ListItem.prototype.isStashed) {
        StashedControlSupport.mixInto(ListItem);
    }
    return XMLView.create({
        definition: "<mvc:View xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\">" + "<Select id=\"Select\">" + "<core:ListItem id=\"ItemA\" text=\"A\" stashed=\"true\"/>" + "<core:ListItem id=\"ItemB\" text=\"B\"/>" + "</Select>" + "</mvc:View>"
    }).then(function (oView) {
        var oItemA = oView.byId("ItemA");
        var oItemB = oView.byId("ItemB");
        assert.ok(oItemA instanceof ListItem, "ItemA is a ListItem");
        assert.ok(oItemA.isStashed(), "ItemA is stashed");
        assert.ok(oItemB instanceof ListItem, "ItemB is a ListItem");
        assert.notOk(oItemB.isStashed(), "ItemB is not stashed");
        assert.strictEqual(StashedControlSupport.getStashedControls().length, 1, "There should be 1 stashed object");
        assert.strictEqual(StashedControlSupport.getStashedControlIds().length, 1, "There should be 1 stashed ID");
        assert.deepEqual(StashedControlSupport.getStashedControlIds().sort(), [oView.createId("ItemA")], "the IDs of the stashed objects should match the ID of the stashed item in the view");
        var oUnstashedItemA = oItemA.unstash();
        assert.notStrictEqual(oUnstashedItemA, oItemA, "stashed and unstashed ItemA should differ");
        assert.ok(oUnstashedItemA instanceof ListItem, "unstashed ItemA is a ListItem");
        assert.notOk(oUnstashedItemA.isStashed(), "unstashed ItemA no longer has stashed=true");
        oView.destroy();
    });
});
QUnit.module("Component integration");
QUnit.test("owner component", function (assert) {
    var oComponent = new Component("comp");
    return oComponent.runAsOwner(function () {
        return XMLView.create({ definition: sViewContent });
    }).then(function (oView) {
        var oButton = oView.byId("Button");
        var oStashedButton = oView.byId("StashedButton");
        var oButtonComponent = Component.getOwnerComponentFor(oButton);
        var oStashedButtonComponent = Component.getOwnerComponentFor(oStashedButton);
        assert.strictEqual(oStashedButtonComponent, oButtonComponent, "Stashed and normal Button have same owner");
        assert.equal(oStashedButtonComponent.getId(), "comp", "Stashed Button has the right owner");
        var oUnstashedButton = oStashedButton.unstash();
        var oUnstashedButtonComponent = Component.getOwnerComponentFor(oUnstashedButton);
        assert.strictEqual(oUnstashedButtonComponent, oButtonComponent, "Unstashed and normal Button have same owner");
        assert.equal(oUnstashedButtonComponent.getId(), "comp", "Unstashed Button has the right owner");
        oView.destroy();
        oComponent.destroy();
    });
});
QUnit.module("Async XMLView", {
    beforeEach: function () {
        if (!Button.prototype.isStashed) {
            StashedControlSupport.mixInto(Button);
        }
        return XMLView.create({
            id: "view",
            viewName: "test.StashedControl"
        }).then(function (oView) {
            this.oView = oView;
            oView.placeAt("content");
        }.bind(this));
    },
    afterEach: function () {
        this.oView.destroy();
    }
});
QUnit.test("StashedControl support (simple)", function (assert) {
    var done = assert.async();
    var fnTest = function () {
        this.oView.onAfterRendering = function () {
            assert.strictEqual(jQuery("#view--StashedButton").length, 0, "Stashed button is not rendered");
            var oButton = sap.ui.getCore().byId("view--StashedButton");
            assert.ok(oButton, "Stashed button is available by id");
            assert.ok(oButton instanceof Button, "Stashed button is instanceof sap.m.Button");
            assert.ok(oButton.isStashed(), "Stashed button has stashed=true");
            assert.strictEqual(jQuery("#view--Button").length, 1, "Button is rendered");
            assert.ok(sap.ui.getCore().byId("view--Button") instanceof Button, "Button is a Button");
            this.oView.onAfterRendering = function () {
                var oUnstashedButton = sap.ui.getCore().byId("view--StashedButton");
                assert.strictEqual(jQuery("#view--StashedButton").length, 1, "Unstashed button is rendered");
                assert.ok(oUnstashedButton instanceof Button, "Unstashed Button is still a Button");
                assert.notOk(oUnstashedButton.isStashed(), "UnstashedButton.isStashed() != true");
                done();
            };
            oButton.unstash();
            this.oView.invalidate();
        }.bind(this);
        this.oView.invalidate();
    }.bind(this);
    this.oView.loaded().then(fnTest);
});
QUnit.module("Stashing 2", {
    afterEach: function (assert) {
        if (this.oView) {
            this.oView.destroy();
        }
        var aStashedControlsTotal = StashedControlSupport.getStashedControls();
        assert.equal(aStashedControlsTotal.length, 0, "After each test there should be no remaining stashed controls.");
    }
});
QUnit.test("Check existence of empty wrappers", function (assert) {
    var oJSONModel = new JSONModel({
        title: "Cool Tile",
        subSections: [{
                foo: "bar"
            }]
    });
    return XMLView.create({
        id: "view",
        viewName: "testdata.mvc.stashed.OP",
        models: {
            "undefined": oJSONModel
        }
    }).then(function (oView) {
        assert.ok("View was loaded");
        this.oView = oView;
        var oOPL = this.oView.byId("ObjectPageLayout");
        var aAllSections = oOPL.getSections();
        assert.equal(aAllSections.length, 4, "4 sections in aggregation");
        assert.equal(aAllSections[0].getId(), oView.createId("section0"), "Section 0 is correct.");
        assert.deepEqual(aAllSections[0].getSubSections(), [], "Section 0 has no content");
        assert.equal(aAllSections[1].getId(), oView.createId("section1"), "Section 1 is correct.");
        assert.equal(aAllSections[1].getSubSections().length, 1, "Section 1 has content");
        assert.equal(aAllSections[2].getId(), oView.createId("section2"), "Section 2 is correct.");
        assert.deepEqual(aAllSections[2].getSubSections(), [], "Section 2 has no content");
        assert.equal(aAllSections[3].getId(), oView.createId("section3"), "Section 3 is correct.");
        assert.deepEqual(aAllSections[3].getSubSections(), [], "Section 3 has no content");
        var stashed = StashedControlSupport.getStashedControls(oOPL.getId());
        stashed[2].unstash();
        stashed[1].unstash();
        stashed[0].unstash();
        aAllSections = oOPL.getSections();
        assert.equal(aAllSections[0].getId(), oView.createId("section0"), "Section 0 is correct after unstashing.");
        assert.equal(aAllSections[0].getSubSections().length, 1, "Section 0 has content after unstashing");
        assert.equal(aAllSections[1].getId(), oView.createId("section1"), "Section 1 is correct after unstashing.");
        assert.equal(aAllSections[1].getSubSections().length, 1, "Section 1 has content after unstashing");
        assert.equal(aAllSections[2].getId(), oView.createId("section2"), "Section 2 is correct after unstashing.");
        assert.equal(aAllSections[2].getSubSections().length, 1, "Section 2 has content after unstashing");
        assert.equal(aAllSections[3].getId(), oView.createId("section3"), "Section 3 is correct after unstashing.");
        assert.equal(aAllSections[3].getSubSections().length, 1, "Section 3 has content after unstashing");
    }.bind(this)).catch(function (e) {
        assert.notOk(e.stack);
    });
});
QUnit.test("Clean-up after destroy", function (assert) {
    return XMLView.create({
        id: "view",
        viewName: "testdata.mvc.stashed.OP"
    }).then(function (oView) {
        this.oView = oView;
        var oOPL = this.oView.byId("ObjectPageLayout");
        var oPlaceholder = oOPL.removeSection(2);
        var aStashedControlsTotal = StashedControlSupport.getStashedControls();
        assert.equal(aStashedControlsTotal.length, 3, "All stashed controls retrieved");
        var aStashedControlsInParent = StashedControlSupport.getStashedControls(oView.createId("ObjectPageLayout"));
        assert.equal(aStashedControlsInParent.length, 2, "Number of stashed sections in ObjectPageLayout is correct.");
        oView.destroy();
        aStashedControlsTotal = StashedControlSupport.getStashedControls();
        assert.equal(aStashedControlsTotal.length, 1, "One stashed control left-over.");
        oPlaceholder.destroy();
        aStashedControlsTotal[0].destroy();
    }.bind(this)).catch(function (e) {
        assert.notOk(e.stack);
    });
});
QUnit.test("Unstash a control moved to a different runtime aggregation", function (assert) {
    return XMLView.create({
        id: "view",
        viewName: "testdata.mvc.stashed.OP"
    }).then(function (oView) {
        this.oView = oView;
        var oOPL = this.oView.byId("ObjectPageLayout");
        var oPlaceholder = oOPL.removeSection(2);
        assert.equal(oOPL.getSections().length, 3, "Number of sections in aggregation is correct.");
        var oOPL2 = new ObjectPageLayout("mySecondLayout");
        oOPL2.addSection(oPlaceholder);
        var aStashedControlsTotal = StashedControlSupport.getStashedControls();
        assert.equal(aStashedControlsTotal.length, 3, "All stashed controls retrieved");
        var aStashedControlsInParent = StashedControlSupport.getStashedControls(oView.createId("ObjectPageLayout"));
        assert.equal(aStashedControlsInParent.length, 2, "Number of stashed sections in ObjectPageLayout is correct.");
        var aStashedControlsInParent2 = StashedControlSupport.getStashedControls("mySecondLayout");
        assert.equal(aStashedControlsInParent2.length, 1, "Number of stashed sections 2nd ObjectPageLayout is correct.");
        aStashedControlsInParent2[0].unstash();
        var aOPL2Sections = oOPL2.getSections();
        assert.equal(aOPL2Sections.length, 1, "'sections' aggregation of 2nd ObjectPageLayout is correct.");
        assert.equal(aOPL2Sections[0].getSubSections().length, 1, "'subsections' aggregation of unstashed control is filled.");
        aStashedControlsTotal = StashedControlSupport.getStashedControls();
        assert.equal(aStashedControlsTotal.length, 2, "Only 2 stashed controls remaining.");
        oOPL2.destroy();
        aStashedControlsTotal = StashedControlSupport.getStashedControls();
        assert.equal(aStashedControlsTotal.length, 2, "Still 2 stashed controls remaining.");
    }.bind(this)).catch(function (e) {
        assert.notOk(e.stack);
    });
});
QUnit.test("Unstash a control outside an aggregation", function (assert) {
    return XMLView.create({
        id: "view",
        viewName: "testdata.mvc.stashed.OP"
    }).then(function (oView) {
        this.oView = oView;
        var oOPL = this.oView.byId("ObjectPageLayout");
        var oPlaceholder = oOPL.removeSection(2);
        var sFinalID = oPlaceholder.getId();
        assert.equal(oOPL.getSections().length, 3, "Number of sections in aggregation is correct.");
        var aStashedControlsTotal = StashedControlSupport.getStashedControls();
        assert.equal(aStashedControlsTotal.length, 3, "All stashed controls retrieved");
        var aStashedControlsInParent = StashedControlSupport.getStashedControls(oView.createId("ObjectPageLayout"));
        assert.equal(aStashedControlsInParent.length, 2, "Number of stashed sections in ObjectPageLayout is correct.");
        aStashedControlsTotal[1].unstash();
        var oFinalControl = sap.ui.getCore().byId(sFinalID);
        assert.equal(oFinalControl.getSubSections().length, 1, "Unstashed final control instance has content.");
        assert.equal(oFinalControl.getParent(), null, "Unstashed final control instance has no parent.");
        aStashedControlsTotal = StashedControlSupport.getStashedControls();
        assert.equal(aStashedControlsTotal.length, 2, "Still 2 stashed controls remaining.");
        oFinalControl.destroy();
    }.bind(this)).catch(function (e) {
        assert.notOk(e.stack);
    });
});
QUnit.test("Check Render result", function (assert) {
    var oJSONModel = new JSONModel({
        title: "Cool Tile",
        subSections: [{
                foo: "bar"
            }]
    });
    return XMLView.create({
        id: "view",
        viewName: "testdata.mvc.stashed.OP",
        models: {
            "undefined": oJSONModel
        }
    }).then(function (oView) {
        this.oView = oView;
        oView.placeAt("content");
        sap.ui.getCore().applyChanges();
        var oOPL = this.oView.byId("ObjectPageLayout");
        var aAllSections = oOPL.getSections();
        var oSection0DOM = jQuery("#" + aAllSections[0].getId())[0];
        var oSection1DOM = jQuery("#" + aAllSections[1].getId())[0];
        var oSection2DOM = jQuery("#" + aAllSections[2].getId())[0];
        var oSection3DOM = jQuery("#" + aAllSections[3].getId())[0];
        assert.notOk(oSection0DOM, "Section 0 is not rendered");
        assert.ok(oSection1DOM, "Section 1 is rendered");
        assert.notOk(oSection2DOM, "Section 2 is not rendered");
        assert.notOk(oSection3DOM, "Section 3 is not rendered");
        var stashed = StashedControlSupport.getStashedControls(oOPL.getId());
        stashed[2].unstash();
        stashed[1].unstash();
        stashed[0].unstash();
        sap.ui.getCore().applyChanges();
        aAllSections = oOPL.getSections();
        oSection0DOM = jQuery("#" + aAllSections[0].getId())[0];
        oSection1DOM = jQuery("#" + aAllSections[1].getId())[0];
        oSection2DOM = jQuery("#" + aAllSections[2].getId())[0];
        oSection3DOM = jQuery("#" + aAllSections[3].getId())[0];
        assert.ok(oSection0DOM, "Section 0 is rendered");
        assert.ok(oSection1DOM, "Section 1 is rendered");
        assert.ok(oSection2DOM, "Section 2 is rendered");
        assert.ok(oSection3DOM, "Section 3 is rendered");
    }.bind(this)).catch(function (e) {
        assert.notOk(e.stack);
    });
});
QUnit.test("Unstashed control should have aggregation bindings", function (assert) {
    var oSpy = sinon.spy(console, "assert");
    var oJSONModel = new JSONModel({
        title: "Cool Tile",
        subSections: [{
                foo: "bar"
            }]
    });
    return XMLView.create({
        id: "view",
        viewName: "testdata.mvc.stashed.OP",
        models: {
            "undefined": oJSONModel
        }
    }).then(function (oView) {
        this.oView = oView;
        var oOPL = this.oView.byId("ObjectPageLayout");
        var stashed = StashedControlSupport.getStashedControls(oOPL.getId());
        stashed[2].unstash();
        stashed[1].unstash();
        stashed[0].unstash();
        var aAllSections = oOPL.getSections();
        var oBoundSection = aAllSections[0];
        assert.ok(oBoundSection.getBinding("subSections"), "subSection are bound");
        assert.equal(oBoundSection.getSubSections().length, 1, "aggregation bound, 1 subSection created");
        assert.equal(oBoundSection.getSubSections()[0].getTitle(), "bar", "subSection bound and title resolved");
        assert.equal(oSpy.callCount, 0, "No assertion due to unremoved stahsed attribute must occur");
        oSpy.restore();
    }.bind(this)).catch(function (e) {
        assert.notOk(e.stack);
    });
});
QUnit.test("Throw error on clone of stashed placeholder", function (assert) {
    return XMLView.create({
        id: "view",
        viewName: "testdata.mvc.stashed.OP"
    }).then(function (oView) {
        this.oView = oView;
        assert.throws(function () {
            this.oView.getContent()[0].clone();
        });
    }.bind(this));
});
QUnit.test("Throw error when try to make a sap.ui.core.Fragment a stashed control", function (assert) {
    assert.throws(function () {
        StashedControlSupport.mixInto(Fragment);
    });
});
QUnit.test("Throw error when try to make sap.ui.core.mvc.View a stashed control", function (assert) {
    assert.throws(function () {
        StashedControlSupport.mixInto(XMLView);
    });
});