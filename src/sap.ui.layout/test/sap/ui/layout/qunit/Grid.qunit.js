/* global QUnit*/

(function () {
	"use strict";

	var oCore = sap.ui.getCore(),
		TESTS_DOM_CONTAINER = 'qunit-fixture',
		GRID_ID = 'grid1',
		VISIBLE_PREFIX = 'visible_',
		CLASSES_FOR_PREFIX = 'CSS classes for ',
		VISIBILITY_CLASSES_FOR_PREFIX = CLASSES_FOR_PREFIX + ' visibility only on screen sizes ',
		PHONE_STRING = 'Phone',
		TABLET_STRING = 'Tablet',
		LARGE_DESKTOP_STRING = 'LargeDesktop',
		DESKTOP_STRING = 'Desktop',
		PHONE_MEDIA_CLASS = '.sapUiRespGridMedia-Std-Phone',
		TABLET_MEDIA_CLASS = '.sapUiRespGridMedia-Std-Tablet',
		DESKTOP_MEDIA_CLASS = '.sapUiRespGridMedia-Std-Desktop',
		LARGE_DESKTOP_MEDIA_CLASS = '.sapUiRespGridMedia-Std-LargeDesktop',
		oFactory = {
			getLabel: function(sId, oLayoutData) {
				oLayoutData = oLayoutData && oFactory.getLayoutData(oLayoutData);

				return new sap.m.Label(sId, {
					text: "Label's text",
					width: '100%',
					layoutData: oLayoutData
				});
			},
			getButton: function (sId, bVisible, oLayoutData) {
				oLayoutData = oLayoutData && oFactory.getLayoutData(oLayoutData);

				return new sap.m.Button(sId, {
					text: "Button's text",
					width: "100%",
					visible: bVisible,
					layoutData: oLayoutData
				});
			},
			getInput: function (sId, oLayoutData) {
				oLayoutData = oLayoutData && oFactory.getLayoutData(oLayoutData);

				return new sap.m.Input(sId, {
					value: "Input's value",
					width: '100%',
					layoutData: oLayoutData
				});
			},
			getLayoutData: function (oProps) {
				oProps = oProps || {};
				return new sap.ui.layout.GridData(oProps);
			},
			getGrid: function (sId) {
				return new sap.ui.layout.Grid(sId, {
					hSpacing: 1,
					vSpacing: 1,
					defaultSpan: 'L2',
					content: [
						oFactory.getButton('hiddenButton', false, {}),
						oFactory.getButton('visibleButton', true, {}),
						oFactory.getLabel('defaultGridData'),
						oFactory.getLabel('moveBackwards', {
							moveBackwards: 'l1 m2' // Test if still works correctly with lower case
						}),
						oFactory.getLabel('moveForward', {
							moveForward: 'L1 M2 S1'
						}),
						oFactory.getLabel('span', {
							span: 'L4 S10'
						}),
						oFactory.getLabel('indent', {
							indent: 'L1 M7 S3'
						}),
						oFactory.getInput(VISIBLE_PREFIX + 'S', {
							visibleM: false,
							visibleL: false,
							visibleXL: false
						}),
						oFactory.getInput(VISIBLE_PREFIX + 'M', {
							visibleS: false,
							visibleL: false,
							visibleXL: false
						}),
						oFactory.getInput(VISIBLE_PREFIX + 'L', {
							visibleS: false,
							visibleM: false,
							visibleXL: false
						}),
						oFactory.getInput(VISIBLE_PREFIX + 'XL', {
							visibleS: false,
							visibleM: false,
							visibleL: false
						}),
						oFactory.getInput(VISIBLE_PREFIX + 'NONE', {
							visibleS: false,
							visibleM: false,
							visibleL: false,
							visibleXL: false
						})
					]
				});
			}
		},
		oUtility = {
			setupFunction: function() {
				this.oGrid = oFactory.getGrid(GRID_ID);
				this.oGrid.placeAt(TESTS_DOM_CONTAINER);
				oCore.applyChanges();
			},
			teardownFunction: function() {
				this.oGrid.destroy();
			},
			getRefById: function(sId) {
				var oElement = oCore.byId(sId);
				return oElement ? oElement.$() : null;
			},
			getParentRefById: function(sId) {
				var oElementRef = oUtility.getRefById(sId);
				return oElementRef ? oElementRef.parent() : null;
			},
			getMediaClassesMessage: function (sMedia, bShouldHaveClasses) {
				if (!bShouldHaveClasses) {
					return 'Only the' + sMedia + ' media class should be applied';
				}

				return 'Class for ' + sMedia + ' media is applied';
			},
			getAriaHiddenMessage: function (sVisibleOnSize, sMediaSize, bShouldBeVisible) {
				var sAllowance = bShouldBeVisible ? ' should' : ' should not';
				return 'Element which is visible on screen sizes ' + sVisibleOnSize + sAllowance + ' be visible on ' + sMediaSize + ' devices';
			},
			isVisible: function (oReference) {
				return oReference.is(':visible');
			},
			classesApplied: function ($DomEl, aClasses) {
			   return aClasses.every(function (sClass) {
				   return $DomEl.hasClass(sClass);
			   });
			}
		};



	QUnit.module('CSS class presence check', {
		beforeEach: oUtility.setupFunction,
		afterEach: oUtility.teardownFunction
	});

	QUnit.test('On the root div', function(assert) {
		var bGridHasClasses = oUtility.getRefById(GRID_ID).is('.sapUiRespGrid.sapUiRespGridHSpace1.sapUiRespGridVSpace1');
		assert.ok(bGridHasClasses, CLASSES_FOR_PREFIX + 'the root div of grid');
	});

	QUnit.test('Span', function(assert) {
		var bHasCustomSpanClasses = oUtility.getParentRefById('span').is('.sapUiRespGridSpanL4.sapUiRespGridSpanM6.sapUiRespGridSpanS10'),
			bHasDefaultSpanClasses = oUtility.getParentRefById('defaultGridData').is('.sapUiRespGridSpanL2.sapUiRespGridSpanM6.sapUiRespGridSpanS12');

		assert.ok(bHasCustomSpanClasses, CLASSES_FOR_PREFIX + 'custom span parameters');
		assert.ok(bHasDefaultSpanClasses, CLASSES_FOR_PREFIX + 'default span values');
	});

	QUnit.test('Indent', function(assert) {
		var bHasIndentClasses = oUtility.getParentRefById('indent').is('.sapUiRespGridIndentL1.sapUiRespGridIndentM7.sapUiRespGridIndentS3');
		assert.ok(bHasIndentClasses, CLASSES_FOR_PREFIX + 'custom indent');
	});

	QUnit.test('Move forward/backwards', function(assert) {
		var bHasMoveBackwardsClasses = oUtility.getParentRefById('moveBackwards').is('.sapUiRespGridBwdL1.sapUiRespGridBwdM2'),
			bHasMoveForwardClasses = oUtility.getParentRefById('moveForward').is('.sapUiRespGridFwdL1.sapUiRespGridFwdM2.sapUiRespGridFwdS1');

		assert.ok(bHasMoveBackwardsClasses, CLASSES_FOR_PREFIX + 'moveBackwards parameters');
		assert.ok(bHasMoveForwardClasses, CLASSES_FOR_PREFIX + 'moveForward parameters');
	});

	QUnit.test('Hidden controls inside', function (assert) {
		var $oInvisibleButtonContainer = jQuery(this.oGrid.getDomRef().children[0]),
			$oVisibleButtonContainer = jQuery(this.oGrid.getDomRef().children[1]);

		assert.ok($oInvisibleButtonContainer.hasClass("sapUiRespGridSpanInvisible"), "Invisible element has the appropriate class");
		assert.ok(!$oVisibleButtonContainer.hasClass("sapUiRespGridSpanInvisible"), "Visible element doesn't have the class for hidden elements");

		// Swap visibility
		sap.ui.getCore().byId('hiddenButton').setVisible(true);
		sap.ui.getCore().byId('visibleButton').setVisible(false);

		assert.ok(!$oInvisibleButtonContainer.hasClass("sapUiRespGridSpanInvisible"), "Class is removed after element's visibility is changed to visible");
		assert.ok($oVisibleButtonContainer.hasClass("sapUiRespGridSpanInvisible"), "Class is added when element's visibility changed to hidden");
	});

	QUnit.test('Visibility', function(assert) {
		var $oInputS = oUtility.getParentRefById(VISIBLE_PREFIX + 'S'),
			$oInputM = oUtility.getParentRefById(VISIBLE_PREFIX + 'M'),
			$oInputL = oUtility.getParentRefById(VISIBLE_PREFIX + 'L'),
			$oInputXL = oUtility.getParentRefById(VISIBLE_PREFIX + 'XL'),
			$oInputNONE = oUtility.getParentRefById(VISIBLE_PREFIX + 'NONE'),
			bHasVisibleSClasses = !$oInputS.hasClass('sapUiRespGridHiddenS') && oUtility.classesApplied($oInputS, ['sapUiRespGridHiddenM', 'sapUiRespGridHiddenL', 'sapUiRespGridHiddenXL']),
			bHasVisibleMClasses = !$oInputM.hasClass('sapUiRespGridHiddenM') && oUtility.classesApplied($oInputM, ['sapUiRespGridHiddenS', 'sapUiRespGridHiddenL', 'sapUiRespGridHiddenXL']),
			bHasVisibleLClasses = !$oInputL.hasClass('sapUiRespGridHiddenL') && oUtility.classesApplied($oInputL, ['sapUiRespGridHiddenS', 'sapUiRespGridHiddenM', 'sapUiRespGridHiddenXL']),
			bHasVisibleXLClasses = !$oInputXL.hasClass('sapUiRespGridHiddenXL') && oUtility.classesApplied($oInputXL, ['sapUiRespGridHiddenS', 'sapUiRespGridHiddenM', 'sapUiRespGridHiddenL']),
			bHasVisibleNONEClasses = oUtility.classesApplied($oInputNONE, ['sapUiRespGridHiddenS', 'sapUiRespGridHiddenM', 'sapUiRespGridHiddenL', 'sapUiRespGridHiddenXL']);

		assert.ok(bHasVisibleSClasses, VISIBILITY_CLASSES_FOR_PREFIX + 'S');
		assert.ok(bHasVisibleMClasses, VISIBILITY_CLASSES_FOR_PREFIX + 'M');
		assert.ok(bHasVisibleLClasses, VISIBILITY_CLASSES_FOR_PREFIX + 'L');
		assert.ok(bHasVisibleXLClasses, VISIBILITY_CLASSES_FOR_PREFIX + 'XL');
		assert.ok(bHasVisibleNONEClasses, VISIBILITY_CLASSES_FOR_PREFIX + 'NONE');
	});

	QUnit.test('Media', function(assert) {
		var $oGridRef = oUtility.getRefById(GRID_ID);

		// Toggles phone media size
		this.oGrid._toggleClass(PHONE_STRING);
		assert.ok($oGridRef.is(PHONE_MEDIA_CLASS), oUtility.getMediaClassesMessage(PHONE_STRING, true));
		assert.ok(!($oGridRef.is(TABLET_MEDIA_CLASS) || $oGridRef.is(DESKTOP_MEDIA_CLASS) || $oGridRef.is(LARGE_DESKTOP_MEDIA_CLASS)), oUtility.getMediaClassesMessage(PHONE_STRING));

		// Toggles tablet media size
		this.oGrid._toggleClass(TABLET_STRING);
		assert.ok($oGridRef.is(TABLET_MEDIA_CLASS), oUtility.getMediaClassesMessage(TABLET_STRING, true));
		assert.ok(!($oGridRef.is(PHONE_MEDIA_CLASS) || $oGridRef.is(DESKTOP_MEDIA_CLASS) || $oGridRef.is(LARGE_DESKTOP_MEDIA_CLASS)), oUtility.getMediaClassesMessage(TABLET_STRING));

		// Toggles desktop media size
		this.oGrid._toggleClass(DESKTOP_STRING);
		assert.ok($oGridRef.is(DESKTOP_MEDIA_CLASS), oUtility.getMediaClassesMessage(DESKTOP_STRING, true));
		assert.ok(!($oGridRef.is(PHONE_MEDIA_CLASS) || $oGridRef.is(TABLET_MEDIA_CLASS) || $oGridRef.is(LARGE_DESKTOP_MEDIA_CLASS)), oUtility.getMediaClassesMessage(DESKTOP_STRING));

		// Toggles large Desktop media size
		this.oGrid._toggleClass(LARGE_DESKTOP_STRING);
		assert.ok($oGridRef.is(LARGE_DESKTOP_MEDIA_CLASS), oUtility.getMediaClassesMessage(LARGE_DESKTOP_MEDIA_CLASS, true));
		assert.ok(!($oGridRef.is(PHONE_MEDIA_CLASS) || $oGridRef.is(TABLET_MEDIA_CLASS) || $oGridRef.is(DESKTOP_MEDIA_CLASS)), oUtility.getMediaClassesMessage(LARGE_DESKTOP_MEDIA_CLASS));
	});



	QUnit.module('Behaviour', {
		beforeEach: oUtility.setupFunction,
		afterEach: oUtility.teardownFunction
	});

	QUnit.test('Visibility state', function (assert) {
		var $visibleS = oUtility.getRefById(VISIBLE_PREFIX + 'S'),
			$visibleM = oUtility.getRefById(VISIBLE_PREFIX + 'M'),
			$visibleL = oUtility.getRefById(VISIBLE_PREFIX + 'L'),
			$visibleXL = oUtility.getRefById(VISIBLE_PREFIX + 'XL'),
			$visibleNONE = oUtility.getRefById(VISIBLE_PREFIX + 'NONE');

		// Toggles phone media size
		this.oGrid._toggleClass(PHONE_STRING);
		assert.strictEqual(oUtility.isVisible($visibleS), true, oUtility.getAriaHiddenMessage('S', PHONE_STRING, true));
		assert.strictEqual(oUtility.isVisible($visibleM), false, oUtility.getAriaHiddenMessage('M', PHONE_STRING));
		assert.strictEqual(oUtility.isVisible($visibleL), false, oUtility.getAriaHiddenMessage('L', PHONE_STRING));
		assert.strictEqual(oUtility.isVisible($visibleXL), false, oUtility.getAriaHiddenMessage('XL', PHONE_STRING));
		assert.strictEqual(oUtility.isVisible($visibleNONE), false, oUtility.getAriaHiddenMessage('NONE', PHONE_STRING));

		// Toggles tablet media size
		this.oGrid._toggleClass(TABLET_STRING);
		assert.strictEqual(oUtility.isVisible($visibleS), false, oUtility.getAriaHiddenMessage('S', TABLET_STRING));
		assert.strictEqual(oUtility.isVisible($visibleM), true, oUtility.getAriaHiddenMessage('M', TABLET_STRING, true));
		assert.strictEqual(oUtility.isVisible($visibleL), false, oUtility.getAriaHiddenMessage('L', TABLET_STRING));
		assert.strictEqual(oUtility.isVisible($visibleXL), false, oUtility.getAriaHiddenMessage('XL', TABLET_STRING));
		assert.strictEqual(oUtility.isVisible($visibleNONE), false, oUtility.getAriaHiddenMessage('NONE', TABLET_STRING));

		// Toggles desktop media size
		this.oGrid._toggleClass(DESKTOP_STRING);
		assert.strictEqual(oUtility.isVisible($visibleS), false, oUtility.getAriaHiddenMessage('S', DESKTOP_STRING));
		assert.strictEqual(oUtility.isVisible($visibleM), false, oUtility.getAriaHiddenMessage('M', DESKTOP_STRING));
		assert.strictEqual(oUtility.isVisible($visibleL), true, oUtility.getAriaHiddenMessage('L', DESKTOP_STRING, true));
		assert.strictEqual(oUtility.isVisible($visibleXL), false, oUtility.getAriaHiddenMessage('XL', DESKTOP_STRING));
		assert.strictEqual(oUtility.isVisible($visibleNONE), false, oUtility.getAriaHiddenMessage('NONE', DESKTOP_STRING));

		// Toggles large Desktop media size
		this.oGrid._toggleClass(LARGE_DESKTOP_STRING);
		assert.strictEqual(oUtility.isVisible($visibleS), false, oUtility.getAriaHiddenMessage('S', LARGE_DESKTOP_STRING));
		assert.strictEqual(oUtility.isVisible($visibleM), false, oUtility.getAriaHiddenMessage('M', LARGE_DESKTOP_STRING));
		assert.strictEqual(oUtility.isVisible($visibleL), false, oUtility.getAriaHiddenMessage('L', LARGE_DESKTOP_STRING));
		assert.strictEqual(oUtility.isVisible($visibleXL), true, oUtility.getAriaHiddenMessage('XL', LARGE_DESKTOP_STRING, true));
		assert.strictEqual(oUtility.isVisible($visibleNONE), false, oUtility.getAriaHiddenMessage('NONE', LARGE_DESKTOP_STRING));
	});



	QUnit.module('Accessibility', {
		beforeEach: oUtility.setupFunction,
		afterEach: oUtility.teardownFunction
	});

	QUnit.test('getAccessibilityInfo', function(assert) {
		// Toggle large desktop media size, so that we know exactly how many children are visible
		this.oGrid._toggleClass(DESKTOP_STRING);

		var oInfo = this.oGrid.getAccessibilityInfo();

		assert.ok(this.oGrid.getAccessibilityInfo, 'Grid has a getAccessibilityInfo function');
		assert.ok(oInfo, 'getAccessibilityInfo returns a info object');
		assert.ok(oInfo.role === undefined || oInfo.editable === null, 'AriaRole');
		assert.ok(oInfo.type === undefined || oInfo.editable === null, 'Type');
		assert.ok(oInfo.description === undefined || oInfo.editable === null, 'Description');
		assert.ok(oInfo.focusable === undefined || oInfo.editable === null, 'Focusable');
		assert.ok(oInfo.enabled === undefined || oInfo.editable === null, 'Enabled');
		assert.ok(oInfo.editable === undefined || oInfo.editable === null, 'Editable');
		assert.ok(oInfo.children && oInfo.children.length === 7, 'Children'); // Only 7 children are visible, because 4 of them are hidden on L devices
	});
})();