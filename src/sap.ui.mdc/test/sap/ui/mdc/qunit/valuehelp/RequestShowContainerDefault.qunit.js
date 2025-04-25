// Use this test page to test the API and features of the Popver container.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/Device",
	"sap/ui/mdc/valuehelp/RequestShowContainerDefault",
	"sap/ui/mdc/enums/RequestShowContainerReason"
], (
	Device,
	RequestShowContainerDefault,
	RequestShowContainerReason
	) => {
	"use strict";

	const oFakeValueHelp = {
		retrieveDelegateContent: () => true
	};

	QUnit.test(RequestShowContainerReason.Tap, async (assert) => {
		assert.ok(RequestShowContainerDefault[RequestShowContainerReason.Tap], "RequestShowContainerDefault.Tap is defined");
		assert.notOk(await RequestShowContainerDefault[RequestShowContainerReason.Tap](oFakeValueHelp, {getContent: () => []}), "An empty container should be hidden.");

		const oPhoneStub = sinon.stub(Device.system, "phone").value(true);

		assert.ok(await RequestShowContainerDefault[RequestShowContainerReason.Tap](oFakeValueHelp, {isSingleSelect: () => false, isDialog: () => true}), "On a phone, multi select containers should be shown.");
		assert.ok(await RequestShowContainerDefault[RequestShowContainerReason.Tap](oFakeValueHelp, {isSingleSelect: () => true, isDialog: () => false}), "On a phone, non-dialog containers should be shown.");

		oPhoneStub.restore();

		assert.ok(await RequestShowContainerDefault[RequestShowContainerReason.Tap](oFakeValueHelp, {
			isSingleSelect: () => false,
			isDialog: () => false,
			getContent: () => ([{
				isA: (sClass) => sClass === 'sap.ui.mdc.valuehelp.content.FixedList',
				getFilterList: () => false
			}])
		}), "A FixedList which isn't a Bool or FilterList should be shown.");


		assert.notOk(await RequestShowContainerDefault[RequestShowContainerReason.Tap](oFakeValueHelp, {
			isSingleSelect: () => false,
			isDialog: () => false,
			getContent: () => ([{
				isA: (sClass) => sClass === 'sap.ui.mdc.valuehelp.content.FixedList',
				getFilterList: () => true
			}])
		}), "A FixedList which is a FilterList should be hidden.");

		assert.notOk(await RequestShowContainerDefault[RequestShowContainerReason.Tap](oFakeValueHelp, {
			isSingleSelect: () => false,
			isDialog: () => false,
			getContent: () => ([{
				isA: (sClass) => ['sap.ui.mdc.valuehelp.content.FixedList', 'sap.ui.mdc.valuehelp.content.Bool'].includes(sClass),
				getFilterList: () => false
			}])
		}), "A FixedList which is a Bool should be hidden.");
	});

	QUnit.test(RequestShowContainerReason.Typing, async (assert) => {
		assert.ok(RequestShowContainerDefault[RequestShowContainerReason.Typing], "RequestShowContainerDefault.Typing is defined");
		assert.notOk(await RequestShowContainerDefault[RequestShowContainerReason.Typing](oFakeValueHelp, {getContent: () => []}), "An empty container should be hidden.");

		const oPhoneStub = sinon.stub(Device.system, "phone").value(true);
		sinon.spy(oFakeValueHelp, "retrieveDelegateContent");

		assert.notOk(await RequestShowContainerDefault[RequestShowContainerReason.Typing](oFakeValueHelp, {isSingleSelect: () => false, isDialog: () => true}), "On a phone, single select containers should be hidden.");
		assert.notOk(await RequestShowContainerDefault[RequestShowContainerReason.Typing](oFakeValueHelp, {isSingleSelect: () => true, isDialog: () => false}), "On a phone, dialog containers should be hidden.");
		assert.ok(oFakeValueHelp.retrieveDelegateContent.calledTwice, "retrieveDelegateContent was called.");

		oFakeValueHelp.retrieveDelegateContent.restore();
		oPhoneStub.restore();

		assert.ok(await RequestShowContainerDefault[RequestShowContainerReason.Typing](oFakeValueHelp, {
			isSingleSelect: () => false,
			isDialog: () => false,
			getContent: () => ([{
				isSearchSupported: () => true
			}])
		}), "Any content which supports search should be shown.");
	});

	QUnit.test(RequestShowContainerReason.Filter, async (assert) => {
		assert.ok(RequestShowContainerDefault[RequestShowContainerReason.Filter], "RequestShowContainerDefault.Filter is defined");
		assert.notOk(await RequestShowContainerDefault[RequestShowContainerReason.Filter](oFakeValueHelp, {getContent: () => []}), "An empty container should be hidden.");

		const oPhoneStub = sinon.stub(Device.system, "phone").value(true);
		assert.ok(await RequestShowContainerDefault[RequestShowContainerReason.Filter](oFakeValueHelp, {getContent: () => [{}]}), "On phone, any content should be shown.");
		oPhoneStub.restore();

		assert.notOk(await RequestShowContainerDefault[RequestShowContainerReason.Filter]({...oFakeValueHelp, getFilterValue: () => ""}, {
			getContent: () => ([{
				isA: (sClass) => sClass === 'sap.ui.mdc.valuehelp.base.FilterableListContent'
			}])
		}), "A FilterableListContent without a truthy filterValue should be hidden.");

		assert.notOk(await RequestShowContainerDefault[RequestShowContainerReason.Filter]({...oFakeValueHelp, getFilterValue: () => ""}, {
			getContent: () => ([{
				isA: (sClass) => sClass === 'sap.ui.mdc.valuehelp.base.ListContent',
				getListBinding: () => ({
					getCurrentContexts: () => []
				})
			}])
		}), "A ListContent with an empty list binding should be hidden.");

		assert.ok(await RequestShowContainerDefault[RequestShowContainerReason.Filter]({...oFakeValueHelp, getFilterValue: () => ""}, {
			getContent: () => ([{
				isA: (sClass) => sClass === 'sap.ui.mdc.valuehelp.base.ListContent',
				getListBinding: () => ({
					getCurrentContexts: () => [{}]
				})
			}])
		}), "A ListContent with an non-empty list binding should be shown.");

	});

	QUnit.test(RequestShowContainerReason.Focus, async (assert) => {
		assert.ok(RequestShowContainerDefault[RequestShowContainerReason.Focus], "RequestShowContainerDefault.Focus is defined");
		assert.notOk(await RequestShowContainerDefault[RequestShowContainerReason.Focus](), "Any container should be hidden.");

	});

	QUnit.test(RequestShowContainerReason.Navigate, async (assert) => {
		assert.ok(RequestShowContainerDefault[RequestShowContainerReason.Navigate], "RequestShowContainerDefault.Navigate is defined");
		sinon.spy(oFakeValueHelp, "retrieveDelegateContent");
		assert.notOk(await RequestShowContainerDefault[RequestShowContainerReason.Navigate](oFakeValueHelp), "Any container should be hidden.");
		assert.ok(oFakeValueHelp.retrieveDelegateContent.calledOnce, "retrieveDelegateContent was called.");
		oFakeValueHelp.retrieveDelegateContent.restore();
	});

	QUnit.test(RequestShowContainerReason.ValueHelpRequest, async (assert) => {
		assert.ok(RequestShowContainerDefault[RequestShowContainerReason.ValueHelpRequest], "RequestShowContainerDefault.ValueHelpRequest is defined");
		assert.notOk(await RequestShowContainerDefault[RequestShowContainerReason.ValueHelpRequest](undefined, {isDialog: () => false}), "Any non-dialog container should be hidden.");
		assert.ok(await RequestShowContainerDefault[RequestShowContainerReason.ValueHelpRequest](undefined, {isDialog: () => true}), "Any dialog-like container should be shown.");
	});
});
