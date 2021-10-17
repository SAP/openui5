import Message from "sap/ui/core/message/Message";
import MessageManager from "sap/ui/core/message/MessageManager";
QUnit.module("sap/ui/core/message/MessageManager", {
    beforeEach: function () {
        var oConfiguration = { getHandleValidation: function () { } }, oCore = { getConfiguration: function () { } };
        this.mock(sap.ui).expects("getCore").returns(oCore);
        this.mock(oCore).expects("getConfiguration").returns(oConfiguration);
        this.mock(oConfiguration).expects("getHandleValidation").returns(false);
        this.oMessageManager = new MessageManager();
    }
});
var oProcessor = { getId: function () { return "id"; } }, oProcessorOther = { getId: function () { return "otherId"; } }, oMessage0 = new Message({
    processor: oProcessor,
    target: "target0"
}), oMessage0a = new Message({
    processor: oProcessor,
    target: "target0"
}), oMessage1 = new Message({
    processor: oProcessor,
    target: "target1"
}), oMessageMulti = new Message({
    processor: oProcessor,
    target: ["target0", "target1"]
}), oMessageOtherProcessor = new Message({
    processor: oProcessorOther,
    target: "targetOther"
}), oMessageUnbound = new Message({
    processor: oProcessor
});
[{
        before: undefined,
        after: {},
        remove: oMessage0
    }, {
        before: { id: { target0: [oMessage0], target1: [oMessage1] } },
        after: { id: { target1: [oMessage1] } },
        remove: oMessage0
    }, {
        before: { id: { target0: [oMessage0, oMessage0a] } },
        after: { id: { target0: [oMessage0a] } },
        remove: oMessage0
    }, {
        before: { id: { target0: [oMessage0, oMessageMulti], target1: [oMessageMulti] } },
        after: { id: { target0: [oMessage0] } },
        remove: oMessageMulti
    }, {
        before: { id: { undefined: [oMessageUnbound] } },
        after: { id: {} },
        remove: oMessageUnbound
    }].forEach(function (oFixture, i) {
    QUnit.test("_removeMessage, " + i, function (assert) {
        if (oFixture.before) {
            this.oMessageManager.mMessages = oFixture.before;
        }
        else {
            assert.deepEqual(this.oMessageManager.mMessages, {});
        }
        this.oMessageManager._removeMessage(oFixture.remove);
        assert.deepEqual(this.oMessageManager.mMessages, oFixture.after);
    });
});
[{
        add: oMessage0,
        before: {},
        after: { id: { target0: [oMessage0] } }
    }, {
        add: oMessage0a,
        before: { id: { target0: [oMessage0] } },
        after: { id: { target0: [oMessage0, oMessage0a] } }
    }, {
        add: oMessageMulti,
        before: {},
        after: { id: { target0: [oMessageMulti], target1: [oMessageMulti] } }
    }, {
        add: oMessageUnbound,
        before: {},
        after: { id: { undefined: [oMessageUnbound] } }
    }].forEach(function (oFixture, i) {
    QUnit.test("_importMessage, " + i, function (assert) {
        this.oMessageManager.mMessages = oFixture.before;
        this.oMessageManager._importMessage(oFixture.add);
        assert.deepEqual(this.oMessageManager.mMessages, oFixture.after);
    });
});
QUnit.test("_updateMessageModel", function (assert) {
    var oMessageManagerMock = this.mock(this.oMessageManager), oMessageModel = { setData: function () { } };
    oMessageManagerMock.expects("getMessageModel").returns(oMessageModel);
    oMessageManagerMock.expects("_pushMessages").withExactArgs("mProcessors");
    this.mock(oMessageModel).expects("setData").withExactArgs([oMessageUnbound, oMessage0, oMessage0a, oMessageMulti, oMessage1, oMessageOtherProcessor]);
    this.oMessageManager.mMessages = {
        id: {
            undefined: [oMessageUnbound],
            target0: [oMessage0, oMessage0a, oMessageMulti],
            target1: [oMessage1, oMessageMulti]
        },
        otherId: {
            targetOther: [oMessageOtherProcessor]
        }
    };
    this.oMessageManager._updateMessageModel("mProcessors");
});