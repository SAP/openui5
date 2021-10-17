import ActionPipeline from "sap/ui/test/pipelines/ActionPipeline";
QUnit.module("processing");
QUnit.test("Should process a single action", function (assert) {
    var fnAction = this.spy(), oControlStub = {};
    var oPipeline = new ActionPipeline();
    oPipeline.process({
        control: oControlStub,
        actions: fnAction
    });
    sinon.assert.calledWith(fnAction, oControlStub);
});
QUnit.test("Should process multiple Actions", function (assert) {
    var fnFirstAction = this.spy(), fnSecondAction = this.spy(), oControlStub = {}, oAction = {
        executeOn: fnSecondAction
    };
    var oPipeline = new ActionPipeline();
    oPipeline.process({
        control: oControlStub,
        actions: [fnFirstAction, oAction]
    });
    sinon.assert.calledWith(fnFirstAction, oControlStub);
    sinon.assert.calledWith(fnSecondAction, oControlStub);
});