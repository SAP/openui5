/* global QUnit,sinon,SemanticUtil*/

(function ($, QUnit, sinon) {
	"use strict";

	sinon.config.useFakeTimers = false;

	var oFactory = SemanticUtil.oFactory,
		oSemanticConfiguration = oFactory.getSemanticConfiguration();

	/* --------------------------- SemanticTitle -------------------------------------- */
	QUnit.module("SemanticTitle", {
		beforeEach: function () {
			this.oDynamicPageTitle = oFactory.getDynamicPageTitle();
			this.oSemanticTitle = oFactory.getSemanticTitle(this.oDynamicPageTitle);
		},
		afterEach: function () {
			this.oSemanticTitle.destroy();
			this.oDynamicPageTitle.destroy();
			this.oSemanticTitle = null;
			this.oDynamicPageTitle = null;
		}
	});

	QUnit.test("test Semantic Text Actions", function (assert) {
		var oMainAction = oFactory.getTitleMainAction(),
			oEditAction = oFactory.getEditAction(),
			oDeleteAction = oFactory.getDeleteAction(),
			oCopyAction = oFactory.getCopyAction(),
			oAddAction = oFactory.getAddAction(),

			sMainActionType = "sap.f.semantic.TitleMainAction",
			sEditActionType = "sap.f.semantic.EditAction",
			sDeleteActionType = "sap.f.semantic.DeleteAction",
			sCopyActionType = "sap.f.semantic.CopyAction",
			sAddActionType = "sap.f.semantic.AddAction",

			iMainActionExpectedOrder = oSemanticConfiguration.getOrder(sMainActionType),
			iEditActionExpectedOrder = oSemanticConfiguration.getOrder(sEditActionType),
			iDeleteActionExpectedOrder = oSemanticConfiguration.getOrder(sDeleteActionType),
			iCopyActionExpectedOrder = oSemanticConfiguration.getOrder(sCopyActionType),
			iAddActionExpectedOrder = oSemanticConfiguration.getOrder(sAddActionType),

			iSemanticTextActions = 5,
			aSemanticTextActions = this.oSemanticTitle._aSemanticTextActions;

		// Act
		// Inserted first, but should be ordered third.
		this.oSemanticTitle.addContent(oDeleteAction, oSemanticConfiguration.getPlacement(sDeleteActionType));

		// Inserted as second, but should be ordered first.
		this.oSemanticTitle.addContent(oMainAction, oSemanticConfiguration.getPlacement(sMainActionType));

		// Inserted as third, but should be ordered second.
		this.oSemanticTitle.addContent(oEditAction, oSemanticConfiguration.getPlacement(sEditActionType));

		// Inserted as fourth, but should be ordered last.
		this.oSemanticTitle.addContent(oAddAction, oSemanticConfiguration.getPlacement(sAddActionType));

		// Inserted as last, but should be ordered fourth.
		this.oSemanticTitle.addContent(oCopyAction, oSemanticConfiguration.getPlacement(sCopyActionType));

		// Assert
		assert.equal(aSemanticTextActions.length, iSemanticTextActions,
			iSemanticTextActions + " semantic actions have been added.");
		assert.equal(this.oDynamicPageTitle.getActions().length, iSemanticTextActions,
			iSemanticTextActions + " semantic actions have been added to the container.");
		assert.equal(aSemanticTextActions.indexOf(oMainAction), iMainActionExpectedOrder,
			"The Main Action has the correct order: " + iMainActionExpectedOrder);
		assert.equal(aSemanticTextActions.indexOf(oEditAction), iEditActionExpectedOrder,
			"The Edit Action has the correct order: " + iEditActionExpectedOrder);
		assert.equal(aSemanticTextActions.indexOf(oDeleteAction), iDeleteActionExpectedOrder,
			"The Delete Action has the correct order: " + iDeleteActionExpectedOrder);
		assert.equal(aSemanticTextActions.indexOf(oCopyAction), iCopyActionExpectedOrder,
			"The Copy Action has the correct order: " + iCopyActionExpectedOrder);
		assert.equal(aSemanticTextActions.indexOf(oAddAction), iAddActionExpectedOrder,
			"The Add Action has the correct order: " + iAddActionExpectedOrder);

		assert.equal(this.oDynamicPageTitle.indexOfAction(oMainAction._getControl()), iMainActionExpectedOrder,
			"The Main Action internal control has the correct order: " + iMainActionExpectedOrder);
		assert.equal(this.oDynamicPageTitle.indexOfAction(oEditAction._getControl()), iEditActionExpectedOrder,
			"The Edit Action internal control has the correct order: " + iEditActionExpectedOrder);
		assert.equal(this.oDynamicPageTitle.indexOfAction(oDeleteAction._getControl()), iDeleteActionExpectedOrder,
			"The Delete Action internal control has the correct order: " + iDeleteActionExpectedOrder);
		assert.equal(this.oDynamicPageTitle.indexOfAction(oCopyAction._getControl()), iCopyActionExpectedOrder,
			"The Copy Action internal control has the correct order: " + iCopyActionExpectedOrder);
		assert.equal(this.oDynamicPageTitle.indexOfAction(oAddAction._getControl()), iAddActionExpectedOrder,
			"The Add Action internal control has the correct order: " + iAddActionExpectedOrder);

		// Act
		this.oSemanticTitle.removeContent(oDeleteAction, oSemanticConfiguration.getPlacement(sAddActionType));

		// Assert
		assert.equal(aSemanticTextActions.length, iSemanticTextActions - 1,
			iSemanticTextActions - 1 + " semantic actions remained after removing one.");
		assert.equal(this.oDynamicPageTitle.getActions().length, iSemanticTextActions - 1,
			iSemanticTextActions - 1 + " semantic actions remained in the container.");
		assert.equal(aSemanticTextActions.indexOf(oDeleteAction), -1,
			"The Delete Action has been removed.");
		assert.equal(this.oDynamicPageTitle.indexOfAction(oDeleteAction._getControl()), -1,
			"The Delete Action internal control has been removed from the container.");

		// Clean up
		oAddAction.destroy();
		oCopyAction.destroy();
		oDeleteAction.destroy();
		oMainAction.destroy();
	});

	QUnit.test("test Semantic Simple Icon Actions", function (assert) {
		var oFlagAction = oFactory.getFlagAction(),
			oFavoriteAction = oFactory.getFavoriteAction(),
			sFavoriteActionType = "sap.f.semantic.FavoriteAction", // semantic order 0
			sFlagActionType = "sap.f.semantic.FlagAction", // semantic order 1
			iSemanticSimpleIconActions = 2,
			iFavoriteActionExpectedOrder = oSemanticConfiguration.getOrder(sFavoriteActionType),
			iFlagActionExpectedOrder = oSemanticConfiguration.getOrder(sFlagActionType),
			aSemanticSimpleIconActions = this.oSemanticTitle._aSemanticSimpleIconActions;

		// Act
		// Inserted as first, but should be ordered second.
		this.oSemanticTitle.addContent(oFlagAction, oSemanticConfiguration.getPlacement(sFavoriteActionType));
		// Inserted second, but should be ordered first.
		this.oSemanticTitle.addContent(oFavoriteAction, oSemanticConfiguration.getPlacement(sFlagActionType));

		// Assert
		assert.equal(aSemanticSimpleIconActions.length, iSemanticSimpleIconActions,
			iSemanticSimpleIconActions + " semantic actions have been added.");
		assert.equal(aSemanticSimpleIconActions.indexOf(oFavoriteAction), iFavoriteActionExpectedOrder,
			"The Favorite Action has the correct order: " + iFavoriteActionExpectedOrder);
		assert.equal(aSemanticSimpleIconActions.indexOf(oFlagAction), iFlagActionExpectedOrder,
			"The Flag Action has the correct order: " + iFlagActionExpectedOrder);

		assert.equal(this.oDynamicPageTitle.getActions().length, iSemanticSimpleIconActions,
			iSemanticSimpleIconActions + " semantic actions have been added to the container.");
		assert.equal(this.oDynamicPageTitle.indexOfAction(oFavoriteAction._getControl()), iFavoriteActionExpectedOrder,
			"The Flag Action internal control has the correct order: " + iFavoriteActionExpectedOrder);
		assert.equal(this.oDynamicPageTitle.indexOfAction(oFlagAction._getControl()), iFlagActionExpectedOrder,
			"The Flag Action internal control has the correct order: " + iFlagActionExpectedOrder);

		// Act
		this.oSemanticTitle.removeContent(oFlagAction, oSemanticConfiguration.getPlacement(sFlagActionType));

		// Assert
		assert.equal(aSemanticSimpleIconActions.length, iSemanticSimpleIconActions - 1,
			iSemanticSimpleIconActions - 1 + " semantic actions remained.");
		assert.equal(aSemanticSimpleIconActions.indexOf(oFlagAction), -1,
			"The Flag Action has been removed.");

		assert.equal(this.oDynamicPageTitle.getActions().length, iSemanticSimpleIconActions - 1,
			iSemanticSimpleIconActions - 1 + " semantic actions remained in the container.");
		assert.equal(this.oDynamicPageTitle.indexOfAction(oFlagAction._getControl()), -1,
			"The Flag Action internal control has been removed from the container.");

		// Clean up
		oFlagAction.destroy();
		oFavoriteAction.destroy();
	});

	QUnit.test("test Semantic Navigation Icon Actions", function (assert) {
		var oCloseAction = oFactory.getCloseAction(),
			oFullScreenAction = oFactory.getFullScreenAction(),
			oExitFullScreenAction = oFactory.getExitFullScreenAction(),
			sFullScreenActionType = "sap.f.semantic.FullScreenAction",
			sExitFullScreenActionType = "sap.f.semantic.ExitFullScreenAction",
			sCloseActionType = "sap.f.semantic.CloseAction",
			iCloseActionExpectedOrder = 2,
			iFullScreenActionExpectedOrder = 0,
			iExistFullScreenActionExpectedOrder = 1,
			iSemanticNavIconActions = 3,
			aSemanticNavIconActions = this.oSemanticTitle._aSemanticNavIconActions;

		// Act
		// Inserted as first, but should be ordered third.
		this.oSemanticTitle.addContent(oCloseAction, oSemanticConfiguration.getPlacement(sCloseActionType));
		// Inserted second, and should remain second.
		this.oSemanticTitle.addContent(oExitFullScreenAction, oSemanticConfiguration.getPlacement(sExitFullScreenActionType));
		// Inserted third, but should be ordered first.
		this.oSemanticTitle.addContent(oFullScreenAction, oSemanticConfiguration.getPlacement(sFullScreenActionType));

		// Assert
		assert.equal(aSemanticNavIconActions.length, iSemanticNavIconActions,
			iSemanticNavIconActions + " semantic actions have been added.");
		assert.equal(aSemanticNavIconActions.indexOf(oFullScreenAction), iFullScreenActionExpectedOrder,
			"The FullScreen Action has the correct order: " + iFullScreenActionExpectedOrder);
		assert.equal(aSemanticNavIconActions.indexOf(oExitFullScreenAction), iExistFullScreenActionExpectedOrder,
			"The ExitFullScreen Action has the correct order: " + iExistFullScreenActionExpectedOrder);
		assert.equal(aSemanticNavIconActions.indexOf(oCloseAction), iCloseActionExpectedOrder,
			"The Close Action has the correct order: " + iCloseActionExpectedOrder);
		//
		assert.equal(this.oDynamicPageTitle.getNavigationActions().length, iSemanticNavIconActions,
			iSemanticNavIconActions + " semantic actions have been added to the container.");
		assert.equal(this.oDynamicPageTitle.indexOfNavigationAction(oFullScreenAction._getControl()), iFullScreenActionExpectedOrder,
			"The FullScreen Action internal control has the correct order: " + iFullScreenActionExpectedOrder);
		assert.equal(this.oDynamicPageTitle.indexOfNavigationAction(oExitFullScreenAction._getControl()), iExistFullScreenActionExpectedOrder,
			"The ExitFullScreen Action internal control has the correct order: " + iExistFullScreenActionExpectedOrder);
		assert.equal(this.oDynamicPageTitle.indexOfNavigationAction(oCloseAction._getControl()), iCloseActionExpectedOrder,
			"The Close Action internal control has the correct order: " + iCloseActionExpectedOrder);

		// Act
		this.oSemanticTitle.removeContent(oExitFullScreenAction, oSemanticConfiguration.getPlacement(sExitFullScreenActionType));

		// Assert
		assert.equal(aSemanticNavIconActions.length, iSemanticNavIconActions - 1,
			iSemanticNavIconActions - 1 + " semantic actions remained.");
		assert.equal(aSemanticNavIconActions.indexOf(oExitFullScreenAction), -1,
			"The ExitFullScreen Action has been removed.");
		assert.equal(this.oDynamicPageTitle.getNavigationActions().length, iSemanticNavIconActions - 1,
			iSemanticNavIconActions - 1 + " semantic actions remained in the container");
		assert.equal(this.oDynamicPageTitle.indexOfNavigationAction(oExitFullScreenAction._getControl()), -1,
			"The ExitFullScreen Action internal control has been removed from the container.");

		// Clean up
		oCloseAction.destroy();
		oFullScreenAction.destroy();
		oExitFullScreenAction.destroy();
	});

	QUnit.test("test Custom Text Actions", function (assert) {
		var oButton = oFactory.getAction(),
			oButton2 = oFactory.getAction(),
			iContentCount = 0, iContentIdx = 0;

		// Act
		iContentCount++;
		this.oSemanticTitle.addCustomTextAction(oButton);

		// Assert
		assert.equal(this.oSemanticTitle.getCustomTextActions().length, iContentCount,
			"There is one new action added - items count: " + iContentCount);
		assert.equal(this.oSemanticTitle.indexOfCustomTextAction(oButton), iContentIdx,
			"The action is added is on index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticTitle.removeAllCustomTextActions();

		// Assert
		assert.equal(this.oSemanticTitle.getCustomTextActions().length, iContentCount,
			"The single action has been removed - actions left: " + iContentCount);

		// Act
		iContentCount += 2;
		this.oSemanticTitle.addCustomTextAction(oButton);
		this.oSemanticTitle.insertCustomTextAction(oButton2, iContentIdx);

		// Assert
		assert.equal(this.oSemanticTitle.getCustomTextActions().length, iContentCount,
			"There are two actions added - actions count: " + iContentCount);
		assert.equal(this.oSemanticTitle.indexOfCustomTextAction(oButton2), iContentIdx,
			"The second action is inserted as first at index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticTitle.removeCustomTextAction(oButton2);
		assert.equal(this.oSemanticTitle.indexOfCustomTextAction(oButton2), -1,
			"The second action has been removed");
		assert.equal(this.oSemanticTitle.indexOfCustomTextAction(oButton), iContentIdx,
			"The single action is now on index: " + iContentIdx);
		assert.equal(this.oSemanticTitle.getCustomTextActions().length, iContentCount,
			"The actions count is: " + iContentCount);

		// Act
		this.oSemanticTitle.addCustomTextAction(oButton2);
		this.oSemanticTitle.destroyCustomTextActions();
		iContentCount = 0;

		// Assert
		assert.equal(this.oSemanticTitle.getCustomTextActions().length, iContentCount,
			"The actions have been destroyed - items count: " + iContentCount);
		assert.ok(oButton.bIsDestroyed, "The action has been destroyed.");
		assert.ok(oButton2.bIsDestroyed, "The action has been destroyed.");
	});

	QUnit.test("test Custom Icon Actions", function (assert) {
		var oButton = oFactory.getAction(),
			oButton2 = oFactory.getAction(),
			iContentCount = 0, iContentIdx = 0;

		// Act
		iContentCount++;
		this.oSemanticTitle.addCustomIconAction(oButton);

		// Assert
		assert.equal(this.oSemanticTitle.getCustomIconActions().length, iContentCount,
			"There is one new action added - items count: " + iContentCount);
		assert.equal(this.oSemanticTitle.indexOfCustomIconAction(oButton), iContentIdx,
			"The action is added is on index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticTitle.removeAllCustomIconActions();

		// Assert
		assert.equal(this.oSemanticTitle.getCustomIconActions().length, iContentCount,
			"The single action has been removed - actions left: " + iContentCount);

		// Act
		iContentCount += 2;
		this.oSemanticTitle.addCustomIconAction(oButton);
		this.oSemanticTitle.insertCustomIconAction(oButton2, iContentIdx);

		// Assert
		assert.equal(this.oSemanticTitle.getCustomIconActions().length, iContentCount,
			"There are two actions added - actions count: " + iContentCount);
		assert.equal(this.oSemanticTitle.indexOfCustomIconAction(oButton2), iContentIdx,
			"The second action is inserted as first at index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticTitle.removeCustomIconAction(oButton2);
		assert.equal(this.oSemanticTitle.indexOfCustomIconAction(oButton2), -1,
			"The second action has been removed");
		assert.equal(this.oSemanticTitle.indexOfCustomIconAction(oButton), iContentIdx,
			"The single action is now on index: " + iContentIdx);
		assert.equal(this.oSemanticTitle.getCustomIconActions().length, iContentCount,
			"The actions count is: " + iContentCount);

		// Act
		this.oSemanticTitle.addCustomIconAction(oButton2);
		this.oSemanticTitle.destroyCustomIconActions();
		iContentCount = 0;

		// Assert
		assert.equal(this.oSemanticTitle.getCustomIconActions().length, iContentCount,
			"The actions have been destroyed - items count: " + iContentCount);
		assert.ok(oButton.bIsDestroyed, "The action has been destroyed.");
		assert.ok(oButton2.bIsDestroyed, "The action has been destroyed.");
	});

	QUnit.test("test the order of all actions", function (assert) {
		var oAddAction = oFactory.getAddAction(),
			oCopyAction = oFactory.getCopyAction(),
			oCustomTextBtn = oFactory.getAction(),
			oCustomIconBtn = oFactory.getAction(),
			oShareMenuBtn = oFactory.getAction(),
			oFlagAction = oFactory.getFlagAction(),
			oFullScreenAction = oFactory.getFullScreenAction(),

			sAddActionType = "sap.f.semantic.AddAction",
			sCopyActionType = "sap.f.semantic.CopyAction",
			sFlagActionType = "sap.f.semantic.FlagAction",
			sFullScreenActionType = "sap.f.semantic.FullScreenAction",

			iCustomTextActionExpectedOrder = 0,
			iAddActionExpectedOrder = 2,
			iCopyActionExpectedOrder = 1,
			iCustomIconActionExpectedOrder = 3,
			iFlagActionExpectedOrder = 4,
			iShareMenuActionExpectedOrder = 5;

		// The order of the actions should be the following:
		// Custom Text | Semantic Text | Custom Icon | Semantic Simple Icon | ShareMenu Icon | Nav Icon

		// Act
		// Inserted as 1st, but should be ordered 3rd.
		this.oSemanticTitle.addContent(oAddAction, oSemanticConfiguration.getPlacement(sAddActionType));

		// Inserted as 2nd, but should be 4th.
		this.oSemanticTitle.addContent(oFlagAction, oSemanticConfiguration.getPlacement(sFlagActionType));

		// Inserted as 3rd, but should be 2nd.
		this.oSemanticTitle.addContent(oCopyAction, oSemanticConfiguration.getPlacement(sCopyActionType));

		// Inserted as 4th, but should be 7th.
		this.oSemanticTitle.addContent(oFullScreenAction, oSemanticConfiguration.getPlacement(sFullScreenActionType));

		// Inserted as 5th, but should be 1st.
		this.oSemanticTitle.addCustomTextAction(oCustomTextBtn);

		// Inserted as 6th, but should be 3th.
		this.oSemanticTitle.addCustomIconAction(oCustomIconBtn);

		// Inserted as 7th, but should be 5th.
		this.oSemanticTitle.addContent(oShareMenuBtn, "shareIcon");

		// Assert
		assert.equal(this.oDynamicPageTitle.indexOfAction(oCustomTextBtn), iCustomTextActionExpectedOrder,
			"The Custom Text Action has the correct order: " + iCustomTextActionExpectedOrder);
		assert.equal(this.oDynamicPageTitle.indexOfAction(oAddAction._getControl()), iAddActionExpectedOrder,
			"The Add Action has the correct order: " + iAddActionExpectedOrder);
		assert.equal(this.oDynamicPageTitle.indexOfAction(oCopyAction._getControl()), iCopyActionExpectedOrder,
			"The Copy Action has the correct order: " + iCopyActionExpectedOrder);
		assert.equal(this.oDynamicPageTitle.indexOfAction(oCustomIconBtn), iCustomIconActionExpectedOrder,
			"The Custom Icon Action has the correct order: " + iCustomIconActionExpectedOrder);
		assert.equal(this.oDynamicPageTitle.indexOfAction(oFlagAction._getControl()), iFlagActionExpectedOrder,
			"The Flag Action has the correct order: " + iFlagActionExpectedOrder);
		assert.equal(this.oDynamicPageTitle.indexOfAction(oShareMenuBtn), iShareMenuActionExpectedOrder,
			"The ShareMenu Action has the correct order: " + iShareMenuActionExpectedOrder);

		// Clean up
		oAddAction.destroy();
		oCopyAction.destroy();
		oFlagAction.destroy();
		oFullScreenAction.destroy();
	});

	/* --------------------------- SemanticFooter -------------------------------------- */
	QUnit.module("SemanticFooter", {
		beforeEach: function () {
			this.oOTB = oFactory.getOverflowToolbar();
			this.oSemanticFooter = oFactory.getSemanticFooter(this.oOTB);
		},
		afterEach: function () {
			this.oSemanticFooter.destroy();
			this.oOTB.destroy();
			this.oSemanticFooter = null;
			this.oOTB = null;
		}
	});

	QUnit.test("test Custom Actions", function (assert) {
		var oButton = oFactory.getAction(),
			oButton2 = oFactory.getAction(),
			iContentCount = 0, iContentIdx = 0;

		// Act
		iContentCount++;
		this.oSemanticFooter.addCustomAction(oButton);

		// Assert
		assert.equal(this.oSemanticFooter.getCustomActions().length, iContentCount,
			"There is one new action added - items count: " + iContentCount);
		assert.equal(this.oSemanticFooter.indexOfCustomAction(oButton), iContentIdx,
			"The action is added is on index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticFooter.removeAllCustomActions();

		// Assert
		assert.equal(this.oSemanticFooter.getCustomActions().length, iContentCount,
			"The single action has been removed - actions left: " + iContentCount);

		// Act
		iContentCount += 2;
		this.oSemanticFooter.addCustomAction(oButton);
		this.oSemanticFooter.insertCustomAction(oButton2, iContentIdx);

		// Assert
		assert.equal(this.oSemanticFooter.getCustomActions().length, iContentCount,
			"There are two actions added - actions count: " + iContentCount);
		assert.equal(this.oSemanticFooter.indexOfCustomAction(oButton2), iContentIdx,
			"The second action is inserted as first at index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticFooter.removeCustomAction(oButton2);
		assert.equal(this.oSemanticFooter.indexOfCustomAction(oButton2), -1,
			"The second action has been removed");
		assert.equal(this.oSemanticFooter.indexOfCustomAction(oButton), iContentIdx,
			"The single action is now on index: " + iContentIdx);
		assert.equal(this.oSemanticFooter.getCustomActions().length, iContentCount,
			"The actions count is: " + iContentCount);

		// Act
		this.oSemanticFooter.addCustomAction(oButton2);
		this.oSemanticFooter.destroyCustomActions();
		iContentCount = 0;

		// Assert
		assert.equal(this.oSemanticFooter.getCustomActions().length, iContentCount,
			"The actions have been destroyed - items count: " + iContentCount);
		assert.ok(oButton.bIsDestroyed, "The action has been destroyed.");
		assert.ok(oButton2.bIsDestroyed, "The action has been destroyed.");
	});

	QUnit.test("test Semantic Left Actions", function (assert) {
		var oMessagesIndicatorAction = oFactory.getMessagesIndicator(),
			oDraftIndicator = oFactory.getDraftIndicator(),
			sMessagesIndicatorType = "sap.f.semantic.MessagesIndicator",
			sDraftIndicatorType = "sap.m.DraftIndicator",
			iMessagesIndicatorExpectedOrder = 0,
			iDraftIndicatorExpectedOrder = 2,
			iFooterActions = 2;

		// Act
		// Inserted as first, but should be ordered second.
		this.oSemanticFooter.addContent(oDraftIndicator,
			oSemanticConfiguration.getPlacement(sDraftIndicatorType));
		// Inserted second, but should 1st.
		this.oSemanticFooter.addContent(oMessagesIndicatorAction,
			oSemanticConfiguration.getPlacement(sMessagesIndicatorType));

		// The Internal OverflowToolbar content count should be always decreased by one
		// as ToolbarSpacer is always added.
		assert.equal(this.oOTB.getContent().length - 1, iFooterActions,
			iFooterActions - 1 + " semantic actions have been added to the container.");
		assert.equal(this.oOTB.indexOfContent(oMessagesIndicatorAction._getControl()), iMessagesIndicatorExpectedOrder,
			"The MessagesIndicator Action internal control has the correct order: " + iMessagesIndicatorExpectedOrder);
		assert.equal(this.oOTB.indexOfContent(oDraftIndicator), iDraftIndicatorExpectedOrder,
			"The DraftIndicator Action internal control has the correct order: " + iDraftIndicatorExpectedOrder);

		// Act
		this.oSemanticFooter.removeContent(oMessagesIndicatorAction,
			oSemanticConfiguration.getPlacement(sMessagesIndicatorType));

		// Assert
		assert.equal(this.oOTB.getContent().length - 1, iFooterActions - 1,
			iFooterActions - 1 + " semantic actions remained in the container.");
		assert.equal(this.oOTB.indexOfContent(oMessagesIndicatorAction._getControl()), -1,
			"The MessagesIndicator Action internal control has been removed from the container.");
		assert.equal(this.oOTB.indexOfContent(oDraftIndicator), iDraftIndicatorExpectedOrder - 1,
			"The DraftIndicator Action should become first action as the MessagesIndicator is removed.");

		// Clean up
		oDraftIndicator.destroy();
		oMessagesIndicatorAction.destroy();
	});

	QUnit.test("test Semantic Right Actions", function (assert) {
		var oMainAction = oFactory.getFooterMainAction(),
			oPositiveAction = oFactory.getPositiveAction(),
			oNegativeAction = oFactory.getNegativeAction(),
			sMainActionType = "sap.f.semantic.FooterMainAction",
			sPositiveActionType = "sap.f.semantic.PositiveAction",
			sNegativeActionType = "sap.f.semantic.NegativeAction",
			iMainActionExpectedOrder = 1,
			iPositiveActionExpectedOrder = 2,
			iNegativeActionExpectedOrder = 3,
			iFooterActions = 3;

		// Act
		// Inserted as first, but should be ordered 3rd.
		this.oSemanticFooter.addContent(oNegativeAction,
			oSemanticConfiguration.getPlacement(sNegativeActionType));

		// Inserted as 2nd and should remain 2nd.
		this.oSemanticFooter.addContent(oPositiveAction,
			oSemanticConfiguration.getPlacement(sPositiveActionType));

		// Inserted 3rd, but should be ordered 1st.
		this.oSemanticFooter.addContent(oMainAction,
			oSemanticConfiguration.getPlacement(sMainActionType));

		// The Internal OverflowToolbar content count should be always decreased by one
		// as ToolbarSpacer is always added.
		assert.equal(this.oOTB.getContent().length - 1, iFooterActions,
			iFooterActions + " semantic actions have been added to the container.");
		assert.equal(this.oOTB.indexOfContent(oMainAction._getControl()), iMainActionExpectedOrder,
			"The Main Action internal control has the correct order: " + iMainActionExpectedOrder);
		assert.equal(this.oOTB.indexOfContent(oPositiveAction._getControl()), iPositiveActionExpectedOrder,
			"The Positive Action internal control has the correct order: " + iPositiveActionExpectedOrder);
		assert.equal(this.oOTB.indexOfContent(oNegativeAction._getControl()), iNegativeActionExpectedOrder,
			"The Negative Action internal control has the correct order: " + iNegativeActionExpectedOrder);

		// Act
		this.oSemanticFooter.removeContent(oMainAction,
			oSemanticConfiguration.getPlacement(sMainActionType));

		// Assert
		assert.equal(this.oOTB.getContent().length - 1, iFooterActions - 1,
			iFooterActions - 1 + " semantic actions remained in the container.");
		assert.equal(this.oOTB.indexOfContent(oMainAction._getControl()), -1,
			"The Main Action internal control has been removed from the container.");
		assert.equal(this.oOTB.indexOfContent(oPositiveAction._getControl()), iPositiveActionExpectedOrder - 1,
			"The Positive Action should become first action as the Main Action is removed.");
		assert.equal(this.oOTB.indexOfContent(oNegativeAction._getControl()), iNegativeActionExpectedOrder - 1,
			"The Negative Action should become second action as the Main Action is removed.");

		// Clean up
		oMainAction.destroy();
		oPositiveAction.destroy();
		oNegativeAction.destroy();
	});

	QUnit.test("test All Actions Order", function (assert) {
		var oMessagesIndicatorAction = oFactory.getMessagesIndicator(),
			oDraftIndicator = oFactory.getDraftIndicator(),
			oMainAction = oFactory.getFooterMainAction(),
			oPositiveAction = oFactory.getPositiveAction(),
			oNegativeAction = oFactory.getNegativeAction(),
			sMessagesIndicatorType = "sap.f.semantic.MessagesIndicator",
			sDraftIndicatorType = "sap.m.DraftIndicator",
			sMainActionType = "sap.f.semantic.FooterMainAction",
			sPositiveActionType = "sap.f.semantic.PositiveAction",
			sNegativeActionType = "sap.f.semantic.NegativeAction",
			iMessagesIndicatorExpectedOrder = 0,
			iDraftIndicatorExpectedOrder = 2,
			iMainActionExpectedOrder = 3,
			iPositiveActionExpectedOrder = 4,
			iNegativeActionExpectedOrder = 5,
			iFooterActions = 5;

		// Act
		// Inserted as first, but should be ordered 5th.
		this.oSemanticFooter.addContent(oNegativeAction,
			oSemanticConfiguration.getPlacement(sNegativeActionType));

		// Inserted as 2nd and should remain 4th.
		this.oSemanticFooter.addContent(oPositiveAction,
			oSemanticConfiguration.getPlacement(sPositiveActionType));

		// Inserted 3rd and should remain 3rd.
		this.oSemanticFooter.addContent(oMainAction,
			oSemanticConfiguration.getPlacement(sMainActionType));

		// Inserted 4th and should remain 1st.
		this.oSemanticFooter.addContent(oMessagesIndicatorAction,
			oSemanticConfiguration.getPlacement(sMessagesIndicatorType));

		// Inserted 5th and should remain 2nd.
		this.oSemanticFooter.addContent(oDraftIndicator,
			oSemanticConfiguration.getPlacement(sDraftIndicatorType));

		// Assert
		// The Internal OverflowToolbar content count should be always decreased by one
		// as ToolbarSpacer is always added.
		assert.equal(this.oOTB.getContent().length - 1, iFooterActions,
			iFooterActions + " semantic actions have been added to the container.");
		assert.equal(this.oOTB.indexOfContent(oMessagesIndicatorAction._getControl()), iMessagesIndicatorExpectedOrder,
			"The MessageIndicator Action internal control has the correct order: " + iMessagesIndicatorExpectedOrder);
		assert.equal(this.oOTB.indexOfContent(oDraftIndicator), iDraftIndicatorExpectedOrder,
			"The DraftIndicator Action internal control has the correct order: " + iDraftIndicatorExpectedOrder);
		assert.equal(this.oOTB.indexOfContent(oMainAction._getControl()), iMainActionExpectedOrder,
			"The Main Action internal control has the correct order: " + iMainActionExpectedOrder);
		assert.equal(this.oOTB.indexOfContent(oPositiveAction._getControl()), iPositiveActionExpectedOrder,
			"The Positive Action internal control has the correct order: " + iPositiveActionExpectedOrder);
		assert.equal(this.oOTB.indexOfContent(oNegativeAction._getControl()), iNegativeActionExpectedOrder,
			"The Negative Action internal control has the correct order: " + iNegativeActionExpectedOrder);

		// Act
		this.oSemanticFooter.removeContent(oMessagesIndicatorAction,
			oSemanticConfiguration.getPlacement(sMessagesIndicatorType));

		// Assert
		// All actions should be shifted to the left after removing the first one.
		assert.equal(this.oOTB.getContent().length - 1, iFooterActions - 1,
			iFooterActions - 1 + " semantic actions remained in the container.");
		assert.equal(this.oOTB.indexOfContent(oMessagesIndicatorAction._getControl()), -1,
			"The Main Action internal control has been removed from the container.");
		assert.equal(this.oOTB.indexOfContent(oDraftIndicator), iDraftIndicatorExpectedOrder - 1,
			"The DraftIndicator Action internal control has the correct order: " + iDraftIndicatorExpectedOrder - 1);
		assert.equal(this.oOTB.indexOfContent(oMainAction._getControl()), iMainActionExpectedOrder - 1,
			"The Main Action internal control has the correct order: " + iMainActionExpectedOrder - 1);
		assert.equal(this.oOTB.indexOfContent(oPositiveAction._getControl()), iPositiveActionExpectedOrder - 1,
			"The Positive Action should become first action as the Main Action is removed.");
		assert.equal(this.oOTB.indexOfContent(oNegativeAction._getControl()), iNegativeActionExpectedOrder - 1,
			"The Negative Action should become second action as the Main Action is removed.");

		// Clean up
		oMainAction.destroy();
		oPositiveAction.destroy();
		oNegativeAction.destroy();
	});

	/* --------------------------- SemanticShareMenu -------------------------------------- */
	QUnit.module("SemanticShareMenu", {
		beforeEach: function () {
			this.oActionSheet = oFactory.getActionSheet();
			this.oSemanticShareMenu = oFactory.getSemanticShareMenu(this.oActionSheet);
		},
		afterEach: function () {
			this.oSemanticShareMenu.destroy();
			this.oActionSheet.destroy();
			this.oSemanticShareMenu = null;
			this.oActionSheet = null;
		}
	});

	QUnit.test("test Custom Actions", function (assert) {
		var oButton = oFactory.getAction(),
			oButton2 = oFactory.getAction(),
			iContentCount = 0, iContentIdx = 0, mMode = {initial: "initial", menu: "menu"},
			oSpy = this.spy(this.oSemanticShareMenu, "_fireContentChanged");

		// Assert
		assert.equal(this.oSemanticShareMenu._getMode(), mMode.initial,
			"The ShareMenu is empty, the mode is initial");

		// Act
		iContentCount++;
		this.oSemanticShareMenu.addCustomAction(oButton);

		// Assert
		assert.equal(this.oSemanticShareMenu._getMode(), mMode.menu,
			"The ShareMenu is not empty, the mode is menu");
		assert.ok(oSpy.called, "The Internal ContentChanged event is fired");
		assert.equal(this.oSemanticShareMenu.getCustomActions().length, iContentCount,
			"There is one new action added - items count: " + iContentCount);
		assert.equal(this.oSemanticShareMenu.indexOfCustomAction(oButton), iContentIdx,
			"The action is added is on index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticShareMenu.removeAllCustomActions();

		// Assert
		assert.equal(this.oSemanticShareMenu._getMode(), mMode.initial,
			"The ShareMenu is empty, the mode is initial");
		assert.ok(oSpy.called, "The Internal ContentChanged event is fired");
		assert.equal(this.oSemanticShareMenu.getCustomActions().length, iContentCount,
			"The single action has been removed - actions left: " + iContentCount);

		// Act
		iContentCount += 2;
		this.oSemanticShareMenu.addCustomAction(oButton);
		this.oSemanticShareMenu.insertCustomAction(oButton2, iContentIdx);

		// Assert
		assert.equal(this.oSemanticShareMenu._getMode(), mMode.menu,
			"The ShareMenu is not empty, the mode is menu");
		assert.ok(oSpy.called, "The Internal ContentChanged event is fired");
		assert.equal(this.oSemanticShareMenu.getCustomActions().length, iContentCount,
			"There are two actions added - actions count: " + iContentCount);
		assert.equal(this.oSemanticShareMenu.indexOfCustomAction(oButton2), iContentIdx,
			"The second action is inserted as first at index: " + iContentIdx);

		// Act
		iContentCount--;
		this.oSemanticShareMenu.removeCustomAction(oButton2);
		assert.equal(this.oSemanticShareMenu.indexOfCustomAction(oButton2), -1,
			"The second action has been removed");
		assert.equal(this.oSemanticShareMenu.indexOfCustomAction(oButton), iContentIdx,
			"The single action is now on index: " + iContentIdx);
		assert.equal(this.oSemanticShareMenu.getCustomActions().length, iContentCount,
			"The actions count is: " + iContentCount);

		// Act
		this.oSemanticShareMenu.addCustomAction(oButton2);
		this.oSemanticShareMenu.destroyCustomActions();
		iContentCount = 0;

		// Assert
		assert.equal(this.oSemanticShareMenu._getMode(), mMode.initial,
			"The ShareMenu is empty, the mode is initial");
		assert.ok(oSpy.called, "The Internal ContentChanged event is fired");
		assert.equal(this.oSemanticShareMenu.getCustomActions().length, iContentCount,
			"The actions have been destroyed - items count: " + iContentCount);
		assert.ok(oButton.bIsDestroyed, "The action has been destroyed.");
		assert.ok(oButton2.bIsDestroyed, "The action has been destroyed.");
	});

	QUnit.test("test Semantic Actions", function (assert) {
		var oSendEmailAction = oFactory.getSendEmailAction(),
			oSendMessageAction = oFactory.getSendMessageAction(),
			oSaveAsTileAction = oFactory.getAction(),
			sSendEmailActionType = "sap.f.semantic.SendEmailAction",
			sSendMessageActionType = "sap.f.semantic.SendMessageAction",
			sSaveAsTileActionType = "saveAsTileAction",
			iSendEmailActionExpectedOrder = 0,
			iSendMessageActionExpectedOrder = 1,
			iSaveAsTileActionExpectedOrder = 2,
			iSemanticActions = 3,
			mMode = {initial: "initial", menu: "menu"},
			oSpy = this.spy(this.oSemanticShareMenu, "_fireContentChanged");

		oSaveAsTileAction._getType = function() {
			return sSaveAsTileActionType;
		};

		// Assert
		assert.equal(this.oSemanticShareMenu._getMode(), mMode.initial,
			"The ShareMenu is empty, the mode is initial");

		// Act

		// Inserted as 1st but should be ordered 3th.
		this.oSemanticShareMenu.addContent(oSaveAsTileAction,
				oSemanticConfiguration.getPlacement(sSaveAsTileActionType));

		// Inserted as 2nd and should be ordered 2nd.
		this.oSemanticShareMenu.addContent(oSendMessageAction,
			oSemanticConfiguration.getPlacement(sSendMessageActionType));

		// Inserted as 3th, but should be ordered 1st.
		this.oSemanticShareMenu.addContent(oSendEmailAction,
			oSemanticConfiguration.getPlacement(sSendEmailActionType));

		assert.ok(oSpy.called, "The Internal ContentChanged event is fired");
		assert.equal(this.oSemanticShareMenu._getMode(), mMode.menu,
			"The ShareMenu is not empty, the mode is menu");
		assert.equal(this.oActionSheet.getButtons().length, iSemanticActions,
			iSemanticActions + " semantic actions have been added to the container.");
		assert.equal(this.oActionSheet.indexOfButton(oSaveAsTileAction), iSaveAsTileActionExpectedOrder,
				"The Save as Tile Action has the correct order: " + iSaveAsTileActionExpectedOrder);
		assert.equal(this.oActionSheet.indexOfButton(oSendEmailAction._getControl()), iSendEmailActionExpectedOrder,
			"The Send Email Action internal control has the correct order: " + iSendEmailActionExpectedOrder);
		assert.equal(this.oActionSheet.indexOfButton(oSendMessageAction._getControl()), iSendMessageActionExpectedOrder,
			"The Send Message Action internal control has the correct order: " + iSendMessageActionExpectedOrder);

		//Act
		this.oSemanticShareMenu.removeContent(oSendEmailAction,
			oSemanticConfiguration.getPlacement(sSendEmailActionType));

		// Assert
		assert.equal(this.oSemanticShareMenu._getMode(), mMode.menu,
			"The ShareMenu is not empty, the mode is menu");
		assert.ok(oSpy.called, "The Internal ContentChanged event is fired");
		assert.equal(this.oActionSheet.getButtons().length, iSemanticActions - 1,
			iSemanticActions - 1 + " semantic actions remained in the container.");
		assert.equal(this.oActionSheet.indexOfButton(oSendEmailAction._getControl()), -1,
			"The Send Email Action internal control has been removed from the container.");
		assert.equal(this.oActionSheet.indexOfButton(oSendMessageAction._getControl()),
			iSendMessageActionExpectedOrder - 1, "The Send Message Action should become first action as the Main Action is removed.");

		// Clean up
		oSendEmailAction.destroy();
		oSendMessageAction.destroy();
		oSaveAsTileAction.destroy();
	});

	QUnit.module("SemanticShareMenu destroy", {
		beforeEach: function () {
			this.oActionSheet = oFactory.getActionSheet();
			this.oSemanticShareMenu = oFactory.getSemanticShareMenu(this.oActionSheet);
		},
		afterEach: function () {
			this.oActionSheet.destroy();
			this.oSemanticShareMenu = null;
			this.oActionSheet = null;
		}
	});
})(jQuery, QUnit, sinon);
