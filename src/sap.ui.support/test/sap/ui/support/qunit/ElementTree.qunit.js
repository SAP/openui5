/*global sinon, QUnit*/

sap.ui.require(['sap/ui/support/supportRules/ui/external/ElementTree'],
	function (ElementTree) {
		'use strict';

		jQuery.sap.require('sap/ui/thirdparty/sinon');
		jQuery.sap.require('sap/ui/thirdparty/sinon-qunit');
		jQuery.sap.require("sap.ui.qunit.qunit-coverage");

		var CONTAINER_LOCATION = 'qunit-fixture';

		var mockElementTree = [{
			content: [{
				content: [{
					content: [{
						content: [],
						id: 'heading',
						name: 'sap.m.Text',
						skip: true
					}, {
						content: [],
						id: '__label0',
						name: 'sap.m.Label',
						skip: true
					}, {
						content: [],
						id: '__text0',
						name: 'sap.m.Text',
						skip: true
					}, {
						content: [],
						id: '__data0',
						name: 'sap.ui.core.CustomData',
						skip: true
					}],
					id: '__panel0',
					name: 'sap.m.Panel',
					skip: true
				}],
				id: 'body',
				name: 'sap-ui-area'
			}],
			id: 'WEBPAGE',
			name: 'WEBPAGE'
		}];

		var mockProblematicControls = {
			WEBPAGE: ['Error logs', 'CSS modifications - List of custom styles', 'Preload Configuration'],
			heading: ['CSS modifications - List of affected controls']
		};

		var mockSettingsObject = {
			controls: mockElementTree,
			issuesIds: mockProblematicControls
		};

		var htmlControlTree = '<filter><end><label><input type="checkbox" issues="" checked="">Issues</label><label><input type="checkbox" namespaces="" checked="">Namespaces</label><label><input type="checkbox" attributes="">Attributes</label></end></filter><tree show-namespaces="" show-problematic-elements=""><ul expanded="true"><li data-id="WEBPAGE" issue=""><offset style="padding-left:10px"><arrow down="true"></arrow></offset><tag data-search="WEBPAGEWEBPAGE">&lt;<namespace></namespace>WEBPAGE<attribute> id="<attribute-value>WEBPAGE</attribute-value>"</attribute>&gt;</tag><span class="showNumbOfIssues">[3  issue(s)] </span></li><ul expanded="true"><li data-id="body"><offset style="padding-left:20px"><arrow down="true"></arrow></offset><tag data-search="sap-ui-areabody">&lt;<namespace></namespace>sap-ui-area<attribute> id="<attribute-value>body</attribute-value>"</attribute>&gt;</tag><span class="hideNumbOfIssues">[0  issue(s)] </span></li><ul expanded="true"><li data-id="__panel0"><offset style="padding-left:30px"><arrow down="true"></arrow></offset><tag data-search="sap.m.Panel__panel0">&lt;<namespace>sap.m.</namespace>Panel<attribute> id="<attribute-value>__panel0</attribute-value>"</attribute>&gt;</tag><span class="hideNumbOfIssues">[0  issue(s)] </span></li><ul expanded="true"><li data-id="heading" issue=""><offset style="padding-left:40px"><place-holder></place-holder></offset><tag data-search="sap.m.Textheading">&lt;<namespace>sap.m.</namespace>Text<attribute> id="<attribute-value>heading</attribute-value>"</attribute>&gt;</tag><span class="showNumbOfIssues">[1  issue(s)] </span></li></ul><ul expanded="true"><li data-id="__label0"><offset style="padding-left:40px"><place-holder></place-holder></offset><tag data-search="sap.m.Label__label0">&lt;<namespace>sap.m.</namespace>Label<attribute> id="<attribute-value>__label0</attribute-value>"</attribute>&gt;</tag><span class="hideNumbOfIssues">[0  issue(s)] </span></li></ul><ul expanded="true"><li data-id="__text0"><offset style="padding-left:40px"><place-holder></place-holder></offset><tag data-search="sap.m.Text__text0">&lt;<namespace>sap.m.</namespace>Text<attribute> id="<attribute-value>__text0</attribute-value>"</attribute>&gt;</tag><span class="hideNumbOfIssues">[0  issue(s)] </span></li></ul><ul expanded="true"><li data-id="__data0"><offset style="padding-left:40px"><place-holder></place-holder></offset><tag data-search="sap.ui.core.CustomData__data0">&lt;<namespace>sap.ui.core.</namespace>CustomData<attribute> id="<attribute-value>__data0</attribute-value>"</attribute>&gt;</tag><span class="hideNumbOfIssues">[0  issue(s)] </span></li></ul></ul></ul></ul></tree>';

		/**
		 * Returns an object to mimic the set/get/remove attribute behavior
		 * @return {{
		 *      attributes: {},
		 *      nodeName: string,
		 *      setAttribute: setAttribute,
		 *      getAttribute: getAttribute,
		 *      removeAttribute: removeAttribute
		 * }} The HTML element mockup
		 */
		function getHTMLElementMockup() {
			return {
				attributes: {},
				nodeName: "CONTROL-TREE",
				setAttribute: function (attrName, value) {
					this.attributes[attrName] = value;
				},
				getAttribute: function (attrName) {
					return this.attributes[attrName];
				},
				removeAttribute: function (attrName) {
					delete this.attributes[attrName];
				}
			};
		}

		function setControlTreeHTML() {
			this.elementTree = new ElementTree(null, {});
			var fixtures = document.getElementById('qunit-fixture');
			var html = htmlControlTree;

			fixtures.innerHTML = '<control-tree id="control-tree" ></control-tree>';
			this.elementTree.setContainerId('control-tree');
			document.getElementById('control-tree').innerHTML = html;
		}

		function clearControlTreeHTML() {
			document.getElementById('control-tree').parentNode.removeChild(document.getElementById('control-tree'));
			this.elementTree = null;
		}

		QUnit.module('Initial values');

		QUnit.test('Creating element tree without data', function (assert) {
			// arrange
			var functionSpy = sinon.spy(ElementTree.prototype, 'setData');
			var warningFunctionSpy = sinon.spy(jQuery.sap.log, 'warning');
			var elementTree = new ElementTree(null, {});

			// assert
			assert.strictEqual(elementTree._data, undefined, 'The data should be undefined');
			assert.strictEqual(functionSpy.callCount, 1, 'setData should be called');
			assert.strictEqual(warningFunctionSpy.callCount, 1, 'A warning should be raised when element tree is instantiated without data');

			// clean
			jQuery.sap.log.warning.restore();
			ElementTree.prototype.setData.restore();
		});

		QUnit.test('Setting container and functions', function (assert) {
			// arrange
			var onIssueCountClicked = function () {
				return 'onIssueCountClicked';
			};
			var onSelectionChanged = function () {
				return 'onSelectionChanged';
			};
			var onHoverChanged = function () {
				return 'onHoverChanged';
			};
			var onMouseOut = function () {
				return 'onMouseOut';
			};
			var onInitialRendering = function () {
				return 'onInitialRendering';
			};

			var elementTree = new ElementTree(CONTAINER_LOCATION, {
				onIssueCountClicked: onIssueCountClicked,
				onSelectionChanged: onSelectionChanged,
				onHoverChanged: onHoverChanged,
				onMouseOut: onMouseOut,
				onInitialRendering: onInitialRendering
			});

			// assert
			assert.strictEqual(elementTree._ElementTreeContainer instanceof HTMLElement, true, 'The element tree container should be instantiated');
			assert.strictEqual(elementTree.onIssueCountClicked(), 'onIssueCountClicked', 'onIssueCountClicked should be set');
			assert.strictEqual(elementTree.onSelectionChanged(), 'onSelectionChanged', 'onSelectionChanged should be set');
			assert.strictEqual(elementTree.onHoverChanged(), 'onHoverChanged', 'onHoverChanged should be set');
			assert.strictEqual(elementTree.onMouseOut(), 'onMouseOut', 'onMouseOut should be set');
			assert.strictEqual(elementTree.onInitialRendering(), 'onInitialRendering', 'onInitialRendering should be set');
		});

		QUnit.test('Calling init() method', function (assert) {
			// arrange
			var initSpy = sinon.spy(ElementTree.prototype, 'init');
			var elementTree;

			// assert
			assert.strictEqual(initSpy.callCount, 0, 'init() should not be called before any data is set');

			// act
			elementTree = new ElementTree();
			elementTree.setData(mockSettingsObject);

			// assert
			assert.strictEqual(initSpy.callCount, 1, 'init() method should be called when data is set');

			// clean
			ElementTree.prototype.init.restore();
		});

		QUnit.test('Setting the _isFirstRendering property', function (assert) {
			// arrange
			var elementTree = new ElementTree();
			assert.strictEqual(elementTree._isFirstRendering, undefined, '_isFirstRendering should be undefined before any data is set');

			// act
			elementTree.setData(mockSettingsObject);

			// assert
			assert.strictEqual(elementTree._isFirstRendering, true, 'The property _isFirstRendering should be set when data is set');
		});

		QUnit.module('Setting element tree data, method setData()', {
			beforeEach: function () {
				this.elementTree = new ElementTree(null, {});
			},
			afterEach: function () {
				this.elementTree = null;
			}
		});

		QUnit.test('Setting the control tree data', function (assert) {
			// act
			this.elementTree.setData(mockSettingsObject);

			// assert
			assert.strictEqual(jQuery.isEmptyObject(this.elementTree._data), false, 'The _data private property should not be empty');
			assert.strictEqual(JSON.stringify(mockElementTree) === JSON.stringify(this.elementTree._data.controls), true, 'The _data property should be set correctly');
		});

		QUnit.test('Setting the control tree data, expects ElementType when passed correct value', function (assert) {
			// act
			var returnValue = this.elementTree.setData(mockSettingsObject);

			// assert
			assert.strictEqual(returnValue instanceof ElementTree, true, 'The method setData() should return "this" when data is set correctly');
		});

		QUnit.test('Setting the control tree data, expects undefined when passed incorrect value', function (assert) {
			// act
			var returnValue = this.elementTree.setData([]);

			// assert
			assert.strictEqual(returnValue, undefined, 'The method setData() should return undefined when data in incorrect');
		});

		QUnit.test('Setting the control tree data, expects undefined when passed value is the same', function (assert) {
			// act
			this.elementTree.setData(mockSettingsObject);
			var returnValue = this.elementTree.setData(mockSettingsObject);

			// assert
			assert.strictEqual(returnValue, undefined, 'The method setData() should return undefined when same data is set again');
		});

		QUnit.test('Calling the init() method when element tree container isn\'t set', function (assert) {
			// arrange
			var initSpy = sinon.spy(ElementTree.prototype, 'init');
			var _createHTMLSpy = sinon.spy(ElementTree.prototype, '_createHTML');
			var _createHandlersSpy = sinon.spy(ElementTree.prototype, '_createHandlers');
			var onInitialRenderingSpy = sinon.spy(this.elementTree, 'onInitialRendering');

			// act
			this.elementTree.setData(mockSettingsObject);

			// assert
			assert.strictEqual(initSpy.callCount, 1, 'The init() method should be called');
			assert.strictEqual(_createHTMLSpy.callCount, 0, 'The _createHTML() method should be called');
			assert.strictEqual(_createHandlersSpy.callCount, 0, 'The _createHandlers() method should be called');
			assert.strictEqual(onInitialRenderingSpy.callCount, 0, 'The onInitialRendering() method should be called');

			// clean
			ElementTree.prototype.init.restore();
			ElementTree.prototype._createHTML.restore();
			ElementTree.prototype._createHandlers.restore();
			this.elementTree.onInitialRendering.restore();
		});

		QUnit.test('Calling the init() method when element tree container is set', function (assert) {
			// arrange
			var initSpy = sinon.spy(ElementTree.prototype, 'init');
			var _createHTMLSpy = sinon.spy(ElementTree.prototype, '_createHTML');
			var _createHandlersSpy = sinon.spy(ElementTree.prototype, '_createHandlers');
			var onInitialRenderingSpy = sinon.spy(this.elementTree, 'onInitialRendering');
			this.elementTree._ElementTreeContainer = document.getElementById(CONTAINER_LOCATION);

			// act
			this.elementTree.setData(mockSettingsObject);

			// assert
			assert.strictEqual(initSpy.callCount, 1, 'The init() method should be called');
			assert.strictEqual(_createHTMLSpy.callCount, 1, 'The _createHTML() method should be called');
			assert.strictEqual(_createHandlersSpy.callCount, 1, 'The _createHandlers() method should be called');
			assert.strictEqual(onInitialRenderingSpy.callCount, 1, 'The onInitialRendering() method should be called');

			// clean
			ElementTree.prototype.init.restore();
			ElementTree.prototype._createHTML.restore();
			ElementTree.prototype._createHandlers.restore();
			this.elementTree.onInitialRendering.restore();
		});

		QUnit.test('Setting data for the second time', function (assert) {
			// arrange
			var _createTreeSpy = sinon.spy(ElementTree.prototype, '_createTree');

			// act
			this.elementTree.setData(mockSettingsObject);
			this.elementTree.setData(mockSettingsObject);

			// assert
			assert.strictEqual(_createTreeSpy.callCount, 0, 'Shouldn\'t make any changes when the data is the same');

			// clean
			ElementTree.prototype._createTree.restore();
		});

		QUnit.test('Setting data for the second time with different data', function (assert) {
			// arrange
			var _createTreeSpy = sinon.stub(ElementTree.prototype, '_createTree', function () {
				return 'createTee';
			});
			var mockSetting = jQuery.extend(true, {}, mockSettingsObject);
			mockSetting.controls[0].name = 'Page';

			// act
			this.elementTree.setData(mockSettingsObject);
			this.elementTree.setData(mockSetting);

			// assert
			assert.strictEqual(_createTreeSpy.callCount, 1, 'Should call _createTree() when changes are applied');

			// clean
			ElementTree.prototype._createTree.restore();
		});

		QUnit.test('Setting data with incorrect values', function (assert) {
			// arrange
			var warningFunctionSpy = sinon.spy(jQuery.sap.log, 'warning');

			// act
			this.elementTree.setData('Something');

			// assert
			assert.strictEqual(this.elementTree._data, undefined, 'The control tree data should not be set when passing a string');
			assert.strictEqual(warningFunctionSpy.callCount, 1, 'A warning should be logged when passing a string');

			// act
			this.elementTree.setData(['something']);

			// assert
			assert.strictEqual(this.elementTree._data, undefined, 'The control tree data should not be set when passing an array');
			assert.strictEqual(warningFunctionSpy.callCount, 2, 'A warning should be logged when passing an array');

			// clean
			jQuery.sap.log.warning.restore();
		});

		QUnit.module('Method getData', {
			beforeEach: function () {
				this.elementTree = new ElementTree(null, {});
			},
			afterEach: function () {
				this.elementTree = null;
			}
		});

		QUnit.test('Method getData', function (assert) {
			// act
			this.elementTree.setData(mockSettingsObject);

			// assert
			assert.strictEqual(this.elementTree.getData(), mockSettingsObject, 'Should return the correct value');
		});

		QUnit.module('Method setContainerId', {
			beforeEach: function () {
				this.elementTree = new ElementTree(null, {});
			},
			afterEach: function () {
				this.elementTree = null;
			}
		});

		QUnit.test('Method setContainerId', function (assert) {
			// arrange
			var initSpy = sinon.spy(this.elementTree, 'init');

			// act
			this.elementTree.setContainerId(CONTAINER_LOCATION);

			// assert
			assert.strictEqual(initSpy.callCount, 1, 'The init method should be called once');
			assert.strictEqual(this.elementTree._ElementTreeContainer, document.getElementById(CONTAINER_LOCATION), 'The container should be set correctly');
		});

		QUnit.module('Method getSelectedElement', {
			beforeEach: function () {
				this.elementTree = new ElementTree(null, {});
			},
			afterEach: function () {
				this.elementTree = null;
			}
		});

		QUnit.test('Method getSelectedElement', function (assert) {
			// arrange
			this.elementTree._selectedElement = 'something';

			// assert
			assert.strictEqual(this.elementTree.getSelectedElement(), 'something', 'Should return the private property _selectedElement');
		});

		QUnit.module('Method setSelectedElement()', {
			beforeEach: function () {
				setControlTreeHTML.call(this);
			},
			afterEach: function () {
				clearControlTreeHTML.call(this);
			}
		});

		QUnit.test('Passing incorrect parameter', function (assert) {
			// arrange
			var logSpy = sinon.spy(jQuery.sap.log, 'warning');
			var parameter;

			// act
			parameter = true;
			this.elementTree.setSelectedElement(parameter);

			// assert
			assert.notEqual(this.elementTree._selectedElement, parameter, 'Value should have not been set');
			assert.strictEqual(logSpy.callCount, 1, 'A warning should be issued');

			// act
			parameter = 1;
			this.elementTree.setSelectedElement(parameter);

			// assert
			assert.notEqual(this.elementTree._selectedElement, parameter, 'Value should have not been set');
			assert.strictEqual(logSpy.callCount, 2, 'A warning should be issued');

			// act
			parameter = {};
			this.elementTree.setSelectedElement(parameter);

			// assert
			assert.notEqual(this.elementTree._selectedElement, parameter, 'Value should have not been set');
			assert.strictEqual(logSpy.callCount, 3, 'A warning should be issued');

			// act
			parameter = [];
			this.elementTree.setSelectedElement(parameter);

			// assert
			assert.notEqual(this.elementTree._selectedElement, parameter, 'Value should have not been set');
			assert.strictEqual(logSpy.callCount, 4, 'A warning should be issued');

			// act
			parameter = function () {
				return 'something';
			};
			this.elementTree.setSelectedElement(parameter);

			// assert
			assert.notEqual(this.elementTree._selectedElement, parameter, 'Value should have not been set');
			assert.strictEqual(logSpy.callCount, 5, 'A warning should be issued');

			// clean
			jQuery.sap.log.warning.restore();
		});

		QUnit.test('Passing non-existing element id', function (assert) {
			// arrange
			var controlId = 'not-existing';
			var warningSpy = sinon.spy(jQuery.sap.log, 'warning');
			var _selectTreeElementSpy = sinon.spy(this.elementTree, '_selectTreeElement');

			// act
			this.elementTree.setSelectedElement(controlId);

			// assert
			assert.strictEqual(this.elementTree._selectedElement, undefined, 'Selected item should not be set');
			assert.strictEqual(warningSpy.callCount, 1, 'A warning should be raised');
			assert.strictEqual(_selectTreeElementSpy.callCount, 0, 'Method _selectTreeElement() should not be called');

			// clean
			jQuery.sap.log.warning.restore();
			this.elementTree._selectTreeElement.restore();
		});

		QUnit.test('Calling setSelectedElement() with correct parameters', function (assert) {
			// arrange
			var controlId = '__label0';
			var _selectTreeElementSpy = sinon.spy(this.elementTree, '_selectTreeElement');
			var warningSpy = sinon.spy(jQuery.sap.log, 'warning');
			var errorSpy = sinon.spy(jQuery.sap.log, 'error');

			// act
			var returnValue = this.elementTree.setSelectedElement(controlId);

			// assert
			assert.strictEqual(this.elementTree._selectedElement instanceof HTMLLIElement, true, 'The selected item should be a list item');
			assert.strictEqual(this.elementTree._selectedElement.getAttribute('data-id'), '__label0', 'sap.m.Label control should be selected');
			assert.strictEqual(document.getElementById('control-tree').querySelector("[data-id=__label0]"), this.elementTree._selectedElement, 'The correct element should be selected');

			assert.strictEqual(jQuery.isEmptyObject(this.elementTree._selectedElement), false, 'The selected item should be set');
			assert.strictEqual(_selectTreeElementSpy.callCount, 1, 'Method _selectTreeElement() should be called');
			assert.strictEqual(returnValue, this.elementTree, 'The element tree instance should be returned');
			assert.strictEqual(warningSpy.notCalled, true, 'No warnings should be raised');
			assert.strictEqual(errorSpy.notCalled, true, 'No errors should be raised');

			// clean
			this.elementTree._selectTreeElement.restore();
			jQuery.sap.log.warning.restore();
			jQuery.sap.log.error.restore();
		});

		QUnit.module('Method _selectTreeElement', {
			beforeEach: function () {
				setControlTreeHTML.call(this);
			},
			afterEach: function () {
				clearControlTreeHTML.call(this);
			}
		});

		QUnit.test('Calling _selectTreeElement() with correct id parameter', function (assert) {
			// arrange
			var elementId = '__label0';
			var _scrollToElementSpy = sinon.spy(this.elementTree, '_scrollToElement');
			var onSelectionChangedSpy = sinon.spy(this.elementTree, 'onSelectionChanged');
			var onIssueCountClickedSpy = sinon.spy(this.elementTree, 'onIssueCountClicked');

			// act
			this.elementTree._selectTreeElement(document.querySelector("[data-id=" + elementId + "]"));

			// assert
			assert.strictEqual(_scrollToElementSpy.called, true, 'Method _scrollToElement should be called');
			assert.strictEqual(onSelectionChangedSpy.notCalled, true, 'Method onSelectionChanged should not be called');
			assert.strictEqual(onIssueCountClickedSpy.notCalled, true, 'Method onIssueCountClicked should not be called');

			// clean
			this.elementTree._scrollToElement.restore();
			this.elementTree.onSelectionChanged.restore();
			this.elementTree.onIssueCountClicked.restore();
		});

		QUnit.test('Calling _selectTreeElement() with correct id and notify parameters', function (assert) {
			// arrange
			var elementId = '__label0';
			var onSelectionChangedSpy = sinon.spy(this.elementTree, 'onSelectionChanged');
			var onIssueCountClickedSpy = sinon.spy(this.elementTree, 'onIssueCountClicked');
			var clearSelectionSpy = sinon.spy(this.elementTree, 'clearSelection');
			var element = document.querySelector("[data-id=" + elementId + "]");

			// assert
			assert.strictEqual(element.getAttribute('selected'), null, 'The element should not be selected');

			// act
			this.elementTree._selectTreeElement(element, true);

			// assert
			assert.strictEqual(clearSelectionSpy.called, true, 'Method _scrollToElement should be called');
			assert.strictEqual(onSelectionChangedSpy.called, true, 'Method onSelectionChanged should not be called');
			assert.strictEqual(onIssueCountClickedSpy.called, true, 'Method onIssueCountClicked should not be called');
			assert.strictEqual(element.getAttribute('selected'), 'true', 'The element should be selected');

			// clean
			this.elementTree.onSelectionChanged.restore();
			this.elementTree.onIssueCountClicked.restore();
			this.elementTree.clearSelection.restore();
		});

		QUnit.module('Method clearSelection()', {
			beforeEach: function () {
				setControlTreeHTML.call(this);
			},
			afterEach: function () {
				clearControlTreeHTML.call(this);
			}
		});

		QUnit.test('Deselecting a selected element', function (assert) {
			// arrange
			var elementId = '__label0';
			var element = document.querySelector("[data-id=" + elementId + "]");

			// act
			element.setAttribute('selected', true);
			this.elementTree.clearSelection();

			// assert
			assert.strictEqual(element.getAttribute('selected'), null, 'The selection should be cleared after method invoke');
		});

		QUnit.module('Method _createHTML()', {
			beforeEach: function () {
				setControlTreeHTML.call(this);
			},
			afterEach: function () {
				clearControlTreeHTML.call(this);
			}
		});

		QUnit.test('Calling the right methods when no data is set', function (assert) {
			// arrange
			var _createFilterSpy = sinon.spy(this.elementTree, '_createFilter');
			var _createTreeContainerSpy = sinon.spy(this.elementTree, '_createTreeContainer');
			var _setReferencesSpy = sinon.spy(this.elementTree, '_setReferences');
			var _createTreeSpy = sinon.spy(this.elementTree, '_createTree');

			// act
			this.elementTree._createHTML();

			// assert
			assert.strictEqual(_createTreeSpy.callCount, 0, 'Method _createTree should not be called when no data is set');
			assert.strictEqual(_createFilterSpy.callCount, 1, 'Method _createFilter should be called');
			assert.strictEqual(_createTreeContainerSpy.callCount, 1, 'Method _createTreeContainer should be called');
			assert.strictEqual(_setReferencesSpy.callCount, 1, 'Method _setReferences should be called');

			// clean
			this.elementTree._createTree.restore();
			this.elementTree._createFilter.restore();
			this.elementTree._createTreeContainer.restore();
			this.elementTree._setReferences.restore();
		});

		QUnit.test('Calling method _createTree when data is set', function (assert) {
			// arrange
			var _createTreeSpy = sinon.spy(this.elementTree, '_createTree');

			// act
			this.elementTree.setData(mockSettingsObject);
			this.elementTree._createHTML();

			// assert
			assert.strictEqual(_createTreeSpy.callCount, 2, 'Method _createTree should be called when data is set');

			// clean
			this.elementTree._createTree.restore();
		});

		QUnit.test('Creating the right html output', function (assert) {
			var mockObject = {
				innerHTML: '',
				querySelector: function (element) {
					return element;
				}
			};
			this.elementTree._ElementTreeContainer = mockObject;

			// arrange
			var generatedHTML = '<filter>' +
				'<end>' +
				'<label><input type="checkbox" issues checked/>Issues</label>' +
				'<label><input type="checkbox" namespaces checked/>Namespaces</label>' +
				'<label><input type="checkbox" attributes/>Attributes</label>' +
				'</end>' +
				'</filter>';
			generatedHTML += '<tree show-namespaces show-problematic-elements></tree>';

			// act
			this.elementTree._createHTML();

			// assert
			assert.strictEqual(generatedHTML, this.elementTree._ElementTreeContainer.innerHTML, 'It should have generated the filter and the tree container elements');
		});

		QUnit.module('Method _setReferences()', {
			beforeEach: function () {
				setControlTreeHTML.call(this);
			},
			afterEach: function () {
				clearControlTreeHTML.call(this);
			}
		});

		QUnit.test('Creating the right html output', function (assert) {
			// arrange
			var elementTreeMock = {
				innerHTML: '',
				querySelector: function (element) {
					return element;
				}
			};

			// act
			this.elementTree._ElementTreeContainer = elementTreeMock;
			this.elementTree._setReferences();

			// assert
			assert.strictEqual(this.elementTree._filterContainer, 'filter',
				'The filter container reference should be set correctly');
			assert.strictEqual(this.elementTree._treeContainer, 'tree',
				'The tree container reference should be set correctly');
		});

		QUnit.module('Method _createFilter()', {
			beforeEach: function () {
				this.elementTree = new ElementTree(null, {});
			},
			afterEach: function () {
				this.elementTree = null;
			}
		});

		QUnit.test('_createFilter return value', function (assert) {
			// arrange
			var filterHTML = '<filter>' +
				'<end>' +
				'<label><input type="checkbox" issues checked/>Issues</label>' +
				'<label><input type="checkbox" namespaces checked/>Namespaces</label>' +
				'<label><input type="checkbox" attributes/>Attributes</label>' +
				'</end>' +
				'</filter>';

			// assert
			assert.strictEqual(this.elementTree._createFilter(), filterHTML, 'Should be the expected html');
		});

		QUnit.module('Method _createTreeContainer()', {
			beforeEach: function () {
				this.elementTree = new ElementTree(null, {});
			},
			afterEach: function () {
				this.elementTree = null;
			}
		});

		QUnit.test('_createTreeContainer return value', function (assert) {
			// arrange
			var treeContainerHTML = '<tree show-namespaces show-problematic-elements></tree>';

			// assert
			assert.strictEqual(this.elementTree._createTreeContainer(), treeContainerHTML, 'Should be the expected html');
		});

		QUnit.module('Method _createTree()', {
			beforeEach: function () {
				setControlTreeHTML.call(this);
			},
			afterEach: function () {
				clearControlTreeHTML.call(this);
			}
		});

		QUnit.test('_createTree calling needed methods', function (assert) {
			// arrange
			var getDataSpy = sinon.stub(this.elementTree, 'getData', function () {
				return {controls: undefined};
			});
			var _createTreeHTMLSpy = sinon.spy(this.elementTree, '_createTreeHTML');

			// act
			this.elementTree._createTree();

			// assert
			assert.strictEqual(getDataSpy.callCount, 1, 'Method getData should be called');
			assert.strictEqual(_createTreeHTMLSpy.callCount, 1, 'Method _createTreeHTML should be called');

			// clean
			this.elementTree.getData.restore();
			this.elementTree._createTreeHTML.restore();
		});

		QUnit.module('Method _createTree', {
			beforeEach: function () {
				this.elementTree = new ElementTree(null, {});
			},
			afterEach: function () {
				this.elementTree = null;
			}
		});

		QUnit.test('Passing undefined', function (assert) {
			// act
			var result = this.elementTree._createTreeHTML(undefined, 0);

			// assert
			assert.strictEqual(result, '', 'Should return an empty string');
		});

		QUnit.test('Generated HMTL output', function (assert) {
			// arrange
			var expectedHTML = '<ul expanded="true"><li data-id="WEBPAGE" issue><offset style="padding-left:10px" ><arrow down="true"></arrow></offset><tag data-search="WEBPAGEWEBPAGE">&#60;<namespace></namespace>WEBPAGE<attribute>&#32;id="<attribute-value>WEBPAGE</attribute-value>"</attribute>&#62;</tag><span class = showNumbOfIssues>[3  issue(s)] </span></li><ul expanded="true"><li data-id="body" ><offset style="padding-left:20px" ><arrow down="true"></arrow></offset><tag data-search="sap-ui-areabody">&#60;<namespace></namespace>sap-ui-area<attribute>&#32;id="<attribute-value>body</attribute-value>"</attribute>&#62;</tag><span class = hideNumbOfIssues>[0  issue(s)] </span></li><ul expanded="true"><li data-id="__panel0" ><offset style="padding-left:30px" ><arrow down="true"></arrow></offset><tag data-search="sap.m.Panel__panel0">&#60;<namespace>sap.m.</namespace>Panel<attribute>&#32;id="<attribute-value>__panel0</attribute-value>"</attribute>&#62;</tag><span class = hideNumbOfIssues>[0  issue(s)] </span></li><ul expanded="true"><li data-id="heading" issue><offset style="padding-left:40px" ><place-holder></place-holder></offset><tag data-search="sap.m.Textheading">&#60;<namespace>sap.m.</namespace>Text<attribute>&#32;id="<attribute-value>heading</attribute-value>"</attribute>&#62;</tag><span class = showNumbOfIssues>[1  issue(s)] </span></li></ul><ul expanded="true"><li data-id="__label0" ><offset style="padding-left:40px" ><place-holder></place-holder></offset><tag data-search="sap.m.Label__label0">&#60;<namespace>sap.m.</namespace>Label<attribute>&#32;id="<attribute-value>__label0</attribute-value>"</attribute>&#62;</tag><span class = hideNumbOfIssues>[0  issue(s)] </span></li></ul><ul expanded="true"><li data-id="__text0" ><offset style="padding-left:40px" ><place-holder></place-holder></offset><tag data-search="sap.m.Text__text0">&#60;<namespace>sap.m.</namespace>Text<attribute>&#32;id="<attribute-value>__text0</attribute-value>"</attribute>&#62;</tag><span class = hideNumbOfIssues>[0  issue(s)] </span></li></ul><ul expanded="true"><li data-id="__data0" ><offset style="padding-left:40px" ><place-holder></place-holder></offset><tag data-search="sap.ui.core.CustomData__data0">&#60;<namespace>sap.ui.core.</namespace>CustomData<attribute>&#32;id="<attribute-value>__data0</attribute-value>"</attribute>&#62;</tag><span class = hideNumbOfIssues>[0  issue(s)] </span></li></ul></ul></ul></ul>';

			// act
			this.elementTree.setData(mockSettingsObject);
			var html = this.elementTree._createTreeHTML(this.elementTree.getData().controls, 0);

			// assert
			assert.strictEqual(html, expectedHTML, 'The html output should be as expected');
		});

		QUnit.module('Method _toggleCollapse', {
			beforeEach: function () {
				this.elementTree = new ElementTree(null, {});
				this.target = getHTMLElementMockup();
				this.target.parentNode = getHTMLElementMockup();
			},
			afterEach: function () {
				this.elementTree = null;
				this.target = null;
			}
		});

		QUnit.test('Calling _toggleCollapse on an object without any attributes set', function (assert) {
			// act
			this.elementTree._toggleCollapse(this.target);

			// assert
			assert.strictEqual(jQuery.isEmptyObject(this.target.attributes), true, 'No attributes should be set');
		});

		QUnit.test('Calling _toggleCollapse on an object with "right" attribute set', function (assert) {
			// arrange
			this.target.setAttribute('right', 'true');

			// act
			this.elementTree._toggleCollapse(this.target);

			// assert
			assert.strictEqual(this.target.attributes.down, 'true', 'The "down" attribute should be set');
			assert.strictEqual(this.target.parentNode.attributes.expanded, 'true', 'The "expanded" attribute of the parent node should be set');
		});

		QUnit.test('Calling _toggleCollapse on an object with "down" attribute set', function (assert) {
			// arrange
			this.target.setAttribute('down', 'true');

			// act
			this.elementTree._toggleCollapse(this.target);

			// assert
			assert.strictEqual(this.target.attributes.right, 'true', 'The "right" attribute should be set');
			assert.strictEqual(this.target.attributes.down, undefined, 'The "down" attribute should be removed');
			assert.strictEqual(this.target.parentNode.attributes.expanded, undefined, 'The "expanded" attribute of the parent node should be removed');
		});

		QUnit.module('Method _scrollToElement', {
			beforeEach: function () {
				this.elementTree = new ElementTree(null, {});
			},
			afterEach: function () {
				this.elementTree = null;
			}
		});

		QUnit.test('Checking calculations of _scrollToElement', function (assert) {
			// arrange
			this.elementTree._treeContainer = {};
			this.elementTree._treeContainer.offsetHeight = 200;
			this.elementTree._treeContainer.offsetTop = 30;
			this.elementTree._treeContainer.scrollTop = 0;
			var windowObject = {innerHeight: 370};
			var target = {offsetTop: 200};

			// act
			this.elementTree._scrollToElement(target, windowObject);

			// assert
			assert.strictEqual(Math.round(this.elementTree._treeContainer.scrollTop), 138, 'Property _treeContainer should be set accordingly');
		});

		QUnit.module('Method _onTreeElementMouseHover', {
			beforeEach: function () {
				setControlTreeHTML.call(this);

				this.target = getHTMLElementMockup();
				this.target.parentNode = getHTMLElementMockup();
			},
			afterEach: function () {
				clearControlTreeHTML.call(this);
				this.target = null;
			}
		});

		QUnit.test('Calling the right methods', function (assert) {
			// arrange
			var event = {target: this.target};
			var onHoverChangedSpy = sinon.spy(this.elementTree, 'onHoverChanged');

			// act
			this.elementTree._onTreeElementMouseHover(event);

			// assert
			assert.strictEqual(this.target.attributes.hover, 'true', 'The "hover" attribute should be set');
			assert.strictEqual(onHoverChangedSpy.callCount, 1, 'Method onHoverChanged should be called');

			// clean
			this.elementTree.onHoverChanged.restore();
		});

		QUnit.module('Method _createHandlers', {
			beforeEach: function () {
				setControlTreeHTML.call(this);

				this.target = getHTMLElementMockup();
				this.target.parentNode = getHTMLElementMockup();
			},
			afterEach: function () {
				clearControlTreeHTML.call(this);
				this.target = null;
			}
		});

		QUnit.test('Check if the right event handlers are attached', function (assert) {
			// arrange
			this.elementTree._onArrowClick = function () {
				return '_onArrowClick';
			};
			this.elementTree._onSearchInput = function () {
				return '_onSearchInput';
			};
			this.elementTree._onSearchEvent = function () {
				return '_onSearchEvent';
			};
			this.elementTree._onOptionsChange = function () {
				return '_onOptionsChange';
			};
			this.elementTree._onTreeElementMouseHover = function () {
				return '_onTreeElementMouseHover';
			};
			this.elementTree._onTreeElementMouseOut = function () {
				return '_onTreeElementMouseOut';
			};

			// act
			this.elementTree._createHandlers();

			// assert
			assert.strictEqual(this.elementTree._treeContainer.onclick(), '_onArrowClick', 'The _treeContainer.onclick() should call the correct handler');
			assert.strictEqual(this.elementTree._filterContainer.onkeyup(), '_onSearchInput', 'The _treeContainer.onclick() should call the correct handler');
			assert.strictEqual(this.elementTree._filterContainer.onsearch(), '_onSearchEvent', 'The _treeContainer.onclick() should call the correct handler');
			assert.strictEqual(this.elementTree._filterContainer.onchange(), '_onOptionsChange', 'The _treeContainer.onclick() should call the correct handler');
			assert.strictEqual(this.elementTree._ElementTreeContainer.onmouseover(), '_onTreeElementMouseHover', 'The _treeContainer.onclick() should call the correct handler');
			assert.strictEqual(this.elementTree._ElementTreeContainer.onmouseout(), '_onTreeElementMouseOut', 'The _treeContainer.onclick() should call the correct handler');
		});
	});