import HashChanger from "sap/ui/core/routing/HashChanger";
import History from "sap/ui/core/routing/History";
import Log from "sap/base/Log";
import HistoryUtils from "./HistoryUtils";
HashChanger.getInstance().init();
QUnit.begin(HistoryUtils.init);
QUnit.done(HistoryUtils.exit);
QUnit.test("Should not use push state when runs in iframe", function (assert) {
    var done = assert.async();
    var iframe = document.createElement("iframe");
    iframe.src = sap.ui.require.toUrl("testdata/routing/HistoryIFrame.html");
    document.addEventListener("historyReady", function (oEvent) {
        assert.strictEqual(oEvent._bUsePushStateInFrame, false, "Should not use push state when runs in iframe");
        document.body.removeChild(iframe);
        done();
    });
    document.body.appendChild(iframe);
});
QUnit.module("history.state enhancement", {
    before: HistoryUtils.check,
    beforeEach: function (assert) {
        var that = this;
        this.oExtendedHashChanger = HashChanger.getInstance();
        this.oFireHashChangeStub = sinon.stub(this.oExtendedHashChanger, "fireEvent").callsFake(function (sEventName, oParameter) {
            if (sEventName === "hashChanged") {
                if (that.fnBeforeFireHashChange) {
                    that.fnBeforeFireHashChange();
                }
            }
            HashChanger.prototype.fireEvent.apply(this, arguments);
        });
        this.setup = function () {
            this.checkDirection = function (fnAction, fnAssertion) {
                return new Promise(function (resolve, reject) {
                    var handler = function (oEvent) {
                        fnAssertion(oEvent.getParameter("newHash"));
                        this.oExtendedHashChanger.detachEvent("hashChanged", handler);
                        resolve();
                    }.bind(this);
                    this.oExtendedHashChanger.attachEvent("hashChanged", handler);
                    fnAction();
                }.bind(this));
            }.bind(this);
            this.oExtendedHashChanger.init();
            this.oHistory = History.getInstance();
            this.oExtendedHashChanger.setHash("foo");
            assert.strictEqual(this.oHistory.getDirection(), "NewEntry");
            this.oExtendedHashChanger.setHash("bar");
            assert.strictEqual(this.oHistory.getDirection(), "NewEntry");
            this.oExtendedHashChanger.setHash("foo");
            assert.strictEqual(this.oHistory.getDirection(), "NewEntry");
            return this.checkDirection(function () {
                window.history.go(-1);
            }, function (sHash) {
                if (sHash === "bar") {
                    assert.strictEqual(this.oHistory.getDirection(), "Backwards");
                }
            }.bind(this));
        }.bind(this);
    },
    afterEach: function () {
        this.oExtendedHashChanger.setHash("");
        this.oFireHashChangeStub.restore();
    }
});
QUnit.test("Method getHistoryStateOffset", function (assert) {
    var that = this;
    var pSetup = this.setup();
    if (!History._bUsePushState) {
        return pSetup.then(function () {
            assert.strictEqual(that.oHistory.getHistoryStateOffset(), undefined, "The functionality isn't available within an iFrame");
        });
    }
    else {
        return pSetup.then(function () {
            assert.strictEqual(that.oHistory.getHistoryStateOffset(), 0, "History state offest is 0 after hashChange is processed");
        }).then(function () {
            that.fnBeforeFireHashChange = function () {
                assert.strictEqual(that.oHistory.getHistoryStateOffset(), undefined, "History state offset is undefined after new hash");
            };
            return that.checkDirection(function () {
                that.oExtendedHashChanger.setHash("foobar");
            }, function (sHash) {
                assert.strictEqual(that.oHistory.getHistoryStateOffset(), 0, "History state offest is 0 after hashChange is processed");
                delete that.fnBeforeFireHashChange;
            });
        }).then(function () {
            that.fnBeforeFireHashChange = function () {
                assert.strictEqual(that.oHistory.getHistoryStateOffset(), -2, "History state offset is -2 after window.history.go(-2)");
            };
            return that.checkDirection(function () {
                window.history.go(-2);
            }, function (sHash) {
                assert.strictEqual(that.oHistory.getHistoryStateOffset(), 0, "History state offest is 0 after hashChange is processed");
                delete that.fnBeforeFireHashChange;
            });
        }).then(function () {
            that.fnBeforeFireHashChange = function () {
                assert.strictEqual(that.oHistory.getHistoryStateOffset(), 2, "History state offset is 2 after window.history.go(2)");
            };
            return that.checkDirection(function () {
                window.history.go(2);
            }, function (sHash) {
                assert.strictEqual(that.oHistory.getHistoryStateOffset(), 0, "History state offest is 0 after hashChange is processed");
                delete that.fnBeforeFireHashChange;
            });
        }).then(function () {
            that.fnBeforeFireHashChange = function () {
                var iOffset = that.oHistory.getHistoryStateOffset();
                assert.ok(iOffset === undefined || iOffset === 0, "History state offset is undefined or 0 after hash is replaced");
            };
            return that.checkDirection(function () {
                that.oExtendedHashChanger.replaceHash("replacedHash");
            }, function (sHash) {
                assert.strictEqual(that.oHistory.getHistoryStateOffset(), 0, "History state offest is 0 after hashChange is processed");
                delete that.fnBeforeFireHashChange;
            });
        });
    }
});
QUnit.test("Consume fullHash parameter of hashChange event", function (assert) {
    assert.expect(5);
    return this.setup().then(function () {
        return this.checkDirection(function () {
            window.history.go(1);
        }, function (sHash) {
            if (sHash === "foo") {
                assert.strictEqual(this.oHistory.getDirection(), !History._bUsePushState ? "Unknown" : "Forwards");
            }
        }.bind(this));
    }.bind(this));
});
QUnit.test("Log a warning if window.history.state is already in use", function (assert) {
    var oSpy = sinon.spy(Log, "debug");
    this.fnBeforeFireHashChange = function () {
        window.history.replaceState("invalid_state", window.document.title);
    };
    assert.expect(6);
    return this.setup().then(function () {
        return this.checkDirection(function () {
            window.history.go(1);
        }, function (sHash) {
            if (sHash === "foo") {
                assert.strictEqual(this.oHistory.getDirection(), "Unknown");
            }
        }.bind(this));
    }.bind(this)).then(function () {
        if (!History._bUsePushState) {
            assert.equal(oSpy.callCount, 0, "there's no log written within an iFrame");
        }
        else {
            assert.ok(oSpy.alwaysCalledWith("Unable to determine HistoryDirection as history.state is already set: invalid_state", "sap.ui.core.routing.History"), "The debug log is done correctly");
        }
        oSpy.restore();
    });
});
QUnit.test("The new direction method should return the same direction if hashChanged event is fired without browser hash change", function (assert) {
    assert.expect(!History._bUsePushState ? 6 : 7);
    var oSpy, that = this, sLastDirection;
    return this.setup().then(function () {
        sLastDirection = that.oHistory.getDirection();
        return that.checkDirection(function () {
            oSpy = sinon.spy(that.oHistory, "_getDirectionWithState");
            that.oExtendedHashChanger.fireHashChanged("");
        }, function (sHash) {
            if (sHash === "") {
                if (!History._bUsePushState) {
                    assert.equal(oSpy.callCount, 0, "function is not called within an iFrame");
                }
                else {
                    assert.equal(oSpy.callCount, 1, "function is called once");
                }
                if (History._bUsePushState) {
                    assert.equal(oSpy.getCall(0).returnValue, "Direction_Unchanged", "the function should detect that the direction shouldn't be updated");
                    assert.strictEqual(that.oHistory.getDirection(), sLastDirection, "the direction isn't changed");
                }
                else {
                    assert.strictEqual(that.oHistory.getDirection(), "Unknown", "the direction should be Unknown");
                }
                oSpy.restore();
            }
        });
    });
});
QUnit.test("Direction determination after a hash is replaced", function (assert) {
    assert.expect(7);
    var that = this;
    return this.setup().then(function () {
        return that.checkDirection(function () {
            that.oExtendedHashChanger.replaceHash("replaced");
        }, function (sHash) {
            if (sHash === "replaced") {
                assert.strictEqual(that.oHistory.getDirection(), "Unknown", "The direction should be Unknown after the hash is replaced");
            }
        });
    }).then(function () {
        that.oExtendedHashChanger.setHash("afterReplaced");
        assert.strictEqual(that.oHistory.getDirection(), "NewEntry", "The direction is new entry");
    }).then(function () {
        return that.checkDirection(function () {
            window.history.back();
        }, function (sHash) {
            assert.strictEqual(that.oHistory.getDirection(), "Backwards", "The direction should be Backwards");
        });
    });
});
QUnit.test("Direction determination after a hash is replaced with the same hash", function (assert) {
    var that = this;
    var sHash = "theSameHashValue";
    return this.setup().then(function () {
        return that.checkDirection(function () {
            that.oExtendedHashChanger.setHash(sHash);
        }, function (sHash) {
            assert.strictEqual(that.oHistory.getDirection(), "NewEntry", "The direction should be NewEntry after the hash is set");
        });
    }).then(function () {
        function onHashChanged() {
            assert.ok(false, "no hashChanged event should be fired");
        }
        that.oExtendedHashChanger.attachEvent("hashChanged", onHashChanged);
        that.oExtendedHashChanger.replaceHash(sHash, "Backwards");
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                that.oExtendedHashChanger.detachEvent("hashChanged", onHashChanged);
                assert.equal(that.oHistory.getDirection(), "Backwards", "The custom direction is saved correctly");
                resolve();
            }, 200);
        });
    });
});
QUnit.module("Initialization");
QUnit.test("Keep existing history state - Initialized HashChanger", function (assert) {
    History._aStateHistory = [];
    var oHistoryStub = sinon.stub(History, "getInstance");
    var oHashChanger = new HashChanger();
    oHistoryStub.callsFake(function () {
        return undefined;
    });
    oHashChanger.setHash("hash\u00C4");
    window.history.replaceState({
        sap: {
            history: ["hash1", "hash2", "hash\u00C4"]
        }
    }, "");
    oHashChanger.init();
    var oNewHistory = new History(oHashChanger);
    if (!History._bUsePushState) {
        assert.equal(History._aStateHistory.length, 0, "There's no history state entry");
    }
    else {
        assert.equal(History._aStateHistory.length, 3, "There are three new history state entries");
        assert.strictEqual(History._aStateHistory[0], "hash1", "The first history state entry is correctly 'hash1'");
        assert.strictEqual(History._aStateHistory[1], "hash2", "The second history state entry is correctly 'hash2'");
        assert.strictEqual(History._aStateHistory[2], "hash\u00C4", "The third history state entry is correctly 'hash\u00C4'");
        assert.strictEqual(oNewHistory.getPreviousHash(), undefined, "The previous hash is correctly undefined");
    }
    oHistoryStub.restore();
    oNewHistory.destroy();
    oHashChanger.destroy();
});
QUnit.test("Keep existing history state - Not yet initialized HashChanger", function (assert) {
    History._aStateHistory = [];
    var oHistoryStub = sinon.stub(History, "getInstance");
    var oHashChanger = new HashChanger();
    oHistoryStub.callsFake(function () {
        return undefined;
    });
    oHashChanger.setHash("hash\u00C4");
    window.history.replaceState({
        sap: {
            history: ["hash1", "hash2", "hash\u00C4"]
        }
    }, "");
    var oNewHistory = new History(oHashChanger);
    if (!History._bUsePushState) {
        assert.equal(History._aStateHistory.length, 0, "There's no history state entry");
    }
    else {
        assert.equal(History._aStateHistory.length, 0, "There's no history state entry");
        oHashChanger.init();
        assert.equal(History._aStateHistory.length, 3, "There are three new history state entries");
        assert.strictEqual(History._aStateHistory[0], "hash1", "The first history state entry is correctly 'hash1'");
        assert.strictEqual(History._aStateHistory[1], "hash2", "The second history state entry is correctly 'hash2'");
        assert.strictEqual(History._aStateHistory[2], "hash\u00C4", "The third history state entry is correctly 'hash\u00C4'");
        assert.strictEqual(oNewHistory.getPreviousHash(), undefined, "The previous hash is correctly set");
    }
    oHistoryStub.restore();
    oNewHistory.destroy();
    oHashChanger.destroy();
});
QUnit.module("history management", {
    before: HistoryUtils.check,
    beforeEach: function () {
        HashChanger.getInstance().replaceHash("");
    }
});
QUnit.test("Should use the hashChanger in the singleton", function (assert) {
    var oHashChanger = HashChanger.getInstance();
    var sut = History.getInstance(), oHashChanged = this.spy(sut, "_hashChangedByApp"), lengthBefore = sut.aHistory.length;
    oHashChanger.setHash("foo");
    oHashChanger.replaceHash("bar");
    assert.strictEqual(sut, History.getInstance(), "Should be a singleton");
    assert.strictEqual(oHashChanged.callCount, 2, "Should be called twice");
    assert.ok(oHashChanged.firstCall.calledWithExactly("foo", false), "Should register to setHash");
    assert.ok(oHashChanged.secondCall.calledWith("bar", true), "Should register to replaceHash");
    assert.strictEqual(sut.aHistory.length, lengthBefore + 1, "should have 1 entry in the history");
    assert.strictEqual(sut.aHistory[lengthBefore], "bar");
});
sap.ui.require(["sap/ui/core/qunit/routing/HistoryQunit"], function () {
    QUnit.start();
});