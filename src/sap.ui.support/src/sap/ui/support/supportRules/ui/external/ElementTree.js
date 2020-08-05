/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global"],
	function (jQuery) {
		"use strict";

		function _isObject(data) {
			return (typeof data === "object" && !Array.isArray(data) && data !== null);
		}

		/**
		 * @param {ElementTreeRenderingOptions} options
		 * @returns {string}
		 * @private
		 */
		function _startElementTreeList(options) {

			return "<ul " + options.attributes.join(" ") + ">";
		}

		/**
		 * @returns {string}
		 * @private
		 */
		function _endElementTreeList() {
			return "</ul>";
		}

		/**
		 * @param {ElementTreeRenderingOptions.controls} options
		 * @returns {string}
		 * @private
		 */
		function _startElementTreeListItem(options, hasIssue) {
			var html = "<li data-id=\"" + options.id + "\" ";
			if (hasIssue) {
				html += "issue";
			}
			html += ">";
			return html;
		}

		/**
		 * @returns {string}
		 * @private
		 */
		function _endElementTreeListItem() {
			return "</li>";
		}

		/**
		 * Create HTML for the left part of the ElementTree list item.
		 * @param {ElementTreeOptions.controls} controls
		 * @param {number} paddingLeft
		 * @returns {string}
		 * @private
		 */
		function _getElementTreeLeftColumnOfListItem(controls, paddingLeft) {
			var html = "<offset style=\"padding-left:" + paddingLeft + "px\" >";

			if (controls.content.length > 0) {
				html += "<arrow down=\"true\"></arrow>";
			} else {
				html += "<place-holder></place-holder>";
			}

			html += "</offset>";

			return html;
		}

		/**
		 * Create HTML for the right part of the ElementTree list item.
		 * @param {Object} control - JSON object form {ElementTreeOptions.controls}
		 * @returns {string}
		 * @private
		 */
		function _getElementTreeRightColumnOfListItem(control, numberOfIssues) {
			var splitControlName = control.name.split(".");
			var name = splitControlName[splitControlName.length - 1];
			var nameSpace = control.name.replace(name, "");
			var hideShowClass = (numberOfIssues > 0) ? "showNumbOfIssues" : "hideNumbOfIssues";

			return "<tag data-search=\"" + control.name + control.id + "\">" +
				"&#60;" +
				"<namespace>" + nameSpace + "</namespace>" +
				name +
				"<attribute>&#32;id=\"<attribute-value>" + control.id + "</attribute-value>\"</attribute>" +
				"&#62;" +
				"</tag>" + "<span class = " + hideShowClass  + ">[" + numberOfIssues + "  issue(s)] </span>";
		}

		/**
		 * Search for the nearest parent Node.
		 * @param {element} element - HTML DOM element that will be the root of the search
		 * @param {string} parentNodeName - The desired HTML parent element nodeName
		 * @returns {Object} HTML DOM element
		 * @private
		 */
		function _findNearestDOMParent(element, parentNodeName) {
			while (element.nodeName !== parentNodeName) {
				if (element.nodeName === "CONTROL-TREE") {
					break;
				}
				element = element.parentNode;
			}

			return element;
		}

		/**
		 * ElementTree constructor.
		 * @param {string} id - The id of the DOM container
		 * @param {ElementTree} instantiationOptions
		 * @constructor
		 */
		function ElementTree(id, instantiationOptions) {
			var areInstantiationOptionsAnObject = _isObject(instantiationOptions);
			var options;

			/**
			 * Make sure that the options parameter is Object and
			 * that the ElementTree can be instantiate without initial options.
			 */
			if (areInstantiationOptionsAnObject) {
				options = instantiationOptions;
			} else {
				options = {};
			}

			// Save DOM reference
			this._ElementTreeContainer = document.getElementById(id);

			/**
			 * Method fired when the number of issues against an element is clicked
			 */
			this.onIssueCountClicked = options.onIssueCountClicked ? options.onIssueCountClicked : function () {};

			/**
			 * Method fired when the selected element in the ElementTree is changed.
			 * @param {string} selectedElementId - The selected element id
			 */
			this.onSelectionChanged = options.onSelectionChanged ? options.onSelectionChanged : function (selectedElementId) {};

			/**
			 * Method fired when an element in the ElementTree is right-clicked.
			 * @param {string} selectedElementId - The selected element id
			 */
			this.onContextMenu = options.onContextMenu ? options.onContextMenu : function (selectedElementId) {};

			/**
			 * Method fired when the hovered element in the ElementTree is changed.
			 * @param {string} hoveredElementId - The hovered element id
			 */
			this.onHoverChanged = options.onHoverChanged ? options.onHoverChanged : function (hoveredElementId) {};

			/**
			 * Method fired when the mouse is out of the ElementTree.
			 */
			this.onMouseOut = options.onMouseOut ? options.onMouseOut : function () {};

			/**
			 * Method fired when the initial ElementTree rendering is done.
			 */
			this.onInitialRendering = options.onInitialRendering ? options.onInitialRendering : function () {};

			this.filterOptions = jQuery.extend({
				issues: true,
				namespaces: true,
				attributes: true,
				search: false
			}, options.filter);

			// Object with the tree model that will be visualized
			this.setData(options.data);
		}

		/**
		 * Initialize Tree.
		 */
		ElementTree.prototype.init = function () {
			if (!this._ElementTreeContainer) {
				return;
			}

			this._createHTML();
			this._createHandlers();

			// Fire event to notify that the ElementTree is initialized
			this.onInitialRendering();
		};

		/**
		 * Get the data model used for the tree.
		 * @returns {ElementTreeOptions} the data that is used for the tree
		 */
		ElementTree.prototype.getData = function () {
			return this._data;
		};

		/**
		 * Set the data model used for the tree.
		 * @param {ElementTreeOptions} data
		 * @returns {ElementTree}
		 */
		ElementTree.prototype.setData = function (data) {
			var oldData = this.getData();
			var isDataAnObject = _isObject(data);

			if (isDataAnObject === false) {
				jQuery.sap.log.warning("The parameter should be an Object");
				return;
			}

			// Make sure that the new data is different from the old one
			if (JSON.stringify(oldData) === JSON.stringify(data)) {
				return;
			}

			this._data = data;

			// Initialize ElementTree on first rendering
			// If it is a second rendering, render only the tree elements
			if (this._isFirstRendering === undefined) {
				this.init();
				this._isFirstRendering = true;
			} else {
				this._createTree();
			}

			return this;
		};

		ElementTree.prototype.setContainerId = function (id) {
			this._ElementTreeContainer = document.getElementById(id);
			this.init();
		};

		/**
		 * Returns the selected <li> element of the tree.
		 * @returns {Element} HTML DOM element
		 */
		ElementTree.prototype.getSelectedElement = function () {
			return this._selectedElement;
		};

		/**
		 * Set the selected <li> element of the tree.
		 * @param {string} elementID - HTML DOM element id
		 * @returns {ElementTree}
		 */
		ElementTree.prototype.setSelectedElement = function (elementID, bNotify) {
			var selectedElement;

			if (typeof elementID !== "string") {
				jQuery.sap.log.warning("Please use a valid string parameter");
				return;
			}

			selectedElement = this._ElementTreeContainer.querySelector("[data-id='" + elementID + "']");

			if (selectedElement === null) {
				jQuery.sap.log.warning("The selected element is not a child of the ElementTree");
				return;
			}

			this._selectedElement = selectedElement;
			this._selectTreeElement(selectedElement, bNotify);

			return this;
		};

		ElementTree.prototype.clearSelection = function () {
			var selectedList = this._ElementTreeContainer.querySelector("[selected]");

			if (selectedList) {
				selectedList.removeAttribute("selected");
			}
		};

		/**
		 * Create and places the ElementTree HTML.
		 * @private
		 */
		ElementTree.prototype._createHTML = function () {
			var html;

			html = this._createFilter();
			html += this._createTreeContainer();

			this._ElementTreeContainer.innerHTML = html;
			// Save reverences for future use
			this._setReferences();

			if (this.getData() !== undefined) {
				this._createTree();
			}
		};

		/**
		 * Create the HTML needed for filtering.
		 * @returns {string}
		 * @private
		 */
		ElementTree.prototype._createFilter = function () {
			return "<filter>" +
				"<end>" +
				(this.filterOptions.search ? "<input type=\"text\" search placeholder=\"Search by ID or type\"></input>" : "") +
				(this.filterOptions.search ? "<label><input type=\"checkbox\" filter/>Filter results <results>(0)</results></label>" : "") +
				(this.filterOptions.issues ? "<label><input type=\"checkbox\" issues checked/>Issues</label>" : "") +
				(this.filterOptions.namespaces ? "<label><input type=\"checkbox\" namespaces checked/>Namespaces</label>" : "") +
				(this.filterOptions.attributes ? "<label><input type=\"checkbox\" attributes/>Attributes</label>" : "") +
				"</end>" +
				"</filter>";
		};

		/**
		 * Create the HTML container for the tree.
		 * @returns {string}
		 * @private
		 */
		ElementTree.prototype._createTreeContainer = function () {
			return "<tree show-namespaces show-problematic-elements></tree>";
		};

		/**
		 * Create ElementTree HTML.
		 */
		ElementTree.prototype._createTree = function () {
			var controls = this.getData().controls;

			this._treeContainer.innerHTML = this._createTreeHTML(controls);
		};

		/**
		 * Create HTML tree from JSON.
		 * @param {ElementTreeOptions.controls} controls
		 * @param {number} level - nested level
		 * @returns {string} HTML ElementTree in form of a string
		 * @private
		 */
		ElementTree.prototype._createTreeHTML = function (controls, level) {
			if (controls === undefined || controls.length === 0) {
				return "";
			}

			var html = "";
			var nestedLevel = level || 0;
			var paddingLeft = ++nestedLevel * 10;
			var that = this;
			var issuesIds = this.getData().issuesIds;

			controls.forEach(function (control) {
				html += _startElementTreeList({
					attributes: ["expanded=\"true\""]
				});

				var hasIssue = issuesIds && issuesIds[control.id] !== undefined ? true : false;
				var numberOfIssues = hasIssue ? issuesIds[control.id].length : 0;
				html += _startElementTreeListItem({
					id: control.id
				}, hasIssue);

				html += _getElementTreeLeftColumnOfListItem(control, paddingLeft);

				html += _getElementTreeRightColumnOfListItem(control, numberOfIssues);

				html += _endElementTreeListItem();

				html += that._createTreeHTML(control.content, nestedLevel);

				html += _endElementTreeList();
			});

			return html;
		};

		/**
		 * Hide/Show nested "<ul>" in "<li>" elements.
		 * @param {Element} target - DOM element
		 * @private
		 */
		ElementTree.prototype._toggleCollapse = function (target) {
			var targetParent = _findNearestDOMParent(target.parentNode, "UL");

			if (target.getAttribute("right") === "true") {
				target.removeAttribute("right");
				target.setAttribute("down", "true");

				targetParent.setAttribute("expanded", "true");
			} else if (target.getAttribute("down") === "true") {
				target.removeAttribute("down");

				targetParent.removeAttribute("expanded");
				target.setAttribute("right", "true");
			}
		};

		/**
		 * Add visual selection to clicked "<li>" elements.
		 * @param {Element} targetElement - DOM element
		 * @private
		 */
		ElementTree.prototype._selectTreeElement = function (targetElement, bNotify) {
			var target = _findNearestDOMParent(targetElement, "LI");
			var dataId = target.attributes["data-id"];

			if (!dataId) {
				return;
			}

			var id = dataId.value;
			// Prevent tree element selection for allowing proper multiple tree element selection for copy/paste
			if (id === this._ElementTreeContainer.id) {
				return;
			}

			this._scrollToElement(target, window);

			if (bNotify) {
				this.onSelectionChanged(id);
			}

			this.clearSelection();

			target.setAttribute("selected", "true");

			if (bNotify) {
				this.onIssueCountClicked(id);
			}
		};

		/**
		 * Scroll to element in the ElementTree.
		 * @param {Element} target DOM element to which need to be scrolled
		 * @param {document.window} oWindow The window element. Passed as a parameter to enable parameter mockup and function testing
		 */
		ElementTree.prototype._scrollToElement = function (target, oWindow) {
			var desiredViewBottomPosition = this._treeContainer.offsetHeight - this._treeContainer.offsetTop + this._treeContainer.scrollTop;

			if (target.offsetTop > desiredViewBottomPosition || target.offsetTop < this._treeContainer.scrollTop) {
				this._treeContainer.scrollTop = target.offsetTop - oWindow.innerHeight / 6;
			}
		};

		/**
		 * Search tree elements that match given criteria.
		 * @param {string} userInput - Search criteria
		 * @private
		 */
		ElementTree.prototype._searchInTree = function (userInput) {
			var searchableElements = this._ElementTreeContainer.querySelectorAll("[data-search]");
			var searchInput = userInput.toLocaleLowerCase();
			var elementInformation;

			for (var i = 0; i < searchableElements.length; i++) {
				elementInformation = searchableElements[i].getAttribute("data-search").toLocaleLowerCase();

				if (elementInformation.indexOf(searchInput) !== -1) {
					searchableElements[i].parentNode.setAttribute("matching", true);
				} else {
					searchableElements[i].parentNode.removeAttribute("matching");
				}
			}
		};

		/**
		 * Remove  "matching" attribute from the search.
		 * @private
		 */
		ElementTree.prototype._removeAttributesFromSearch = function () {
			var elements = this._treeContainer.querySelectorAll("[matching]");

			for (var i = 0; i < elements.length; i++) {
				elements[i].removeAttribute("matching");
			}
		};

		/**
		 * Visualize the number of elements which satisfy the search.
		 * @private
		 */
		ElementTree.prototype._setSearchResultCount = function (count) {
			this._filterContainer.querySelector("results").innerHTML = "(" + count + ")";
		};

		/**
		 * Event handler for mouse click on a tree element arrow.
		 * @param {Object} event - click event
		 * @private
		 */
		ElementTree.prototype._onArrowClick = function (event) {
			var $target = jQuery(event.target);
			var nodeName = $target.prop("nodeName");

			if (nodeName === "ARROW") {
				this._toggleCollapse(event.target);
			} else {
				this._selectTreeElement(event.target, true);
			}
		};

		/**
		 * Event handler for mouse right-click on a tree element.
		 * @param {Object} event - contextmenu event
		 * @private
		 */
		ElementTree.prototype._onContextMenu = function (event) {
			event.preventDefault();
			var nodeName = jQuery(event.target).prop("nodeName");

			if (nodeName !== "ARROW") {
				var target = _findNearestDOMParent(event.target, "LI");
				var dataId = target.attributes["data-id"];

				if (dataId) {
					this.clearSelection();
					target.setAttribute("selected", "true");
					this.onContextMenu({
						domElementId: dataId.value,
						location: {
							x: event.pageX,
							y: event.pageY
						}
					});
				}
			}
		};

		/**
		 * Event handler for user input in "search" input.
		 * @param {Object} event - keyup event
		 * @private
		 */
		ElementTree.prototype._onSearchInput = function (event) {
			var target = event.target;
			var searchResultCount;

			if (target.getAttribute("search") !== null) {

				if (target.value.length !== 0) {
					this._searchInTree(target.value);
				} else {
					this._removeAttributesFromSearch("matching");
				}

				searchResultCount = this._treeContainer.querySelectorAll("[matching]").length;
				this._setSearchResultCount(searchResultCount);
			}
		};

		/**
		 * Event handler for onsearch event.
		 * @param {Object} event - onsearch event
		 * @private
		 */
		ElementTree.prototype._onSearchEvent = function (event) {
			var searchResultCount;

			if (event.target.value.length === 0) {
				this._removeAttributesFromSearch("matching");

				searchResultCount = this._treeContainer.querySelectorAll("[matching]").length;
				this._setSearchResultCount(searchResultCount);
			}

		};

		/**
		 * Event handler for ElementTree options change.
		 * @param {Object} event - click event
		 * @private
		 */
		ElementTree.prototype._onOptionsChange = function (event) {
			var target = event.target;

			if (target.getAttribute("filter") !== null) {
				if (target.checked) {
					this._treeContainer.setAttribute("show-filtered-elements", true);
				} else {
					this._treeContainer.removeAttribute("show-filtered-elements");
				}
			}

			if (target.getAttribute("issues") !== null) {
				if (target.checked) {
					this._treeContainer.setAttribute("show-problematic-elements", true);
				} else {
					this._treeContainer.removeAttribute("show-problematic-elements");
				}
			}

			if (target.getAttribute("namespaces") !== null) {
				if (target.checked) {
					this._treeContainer.setAttribute("show-namespaces", true);
				} else {
					this._treeContainer.removeAttribute("show-namespaces");
				}
			}

			if (target.getAttribute("attributes") !== null) {
				if (target.checked) {
					this._treeContainer.setAttribute("show-attributes", true);
				} else {
					this._treeContainer.removeAttribute("show-attributes");
				}
			}

		};

		/**
		 * Event handler for mouse hover on tree element.
		 * @param {Object} event - mouse event
		 * @private
		 */
		ElementTree.prototype._onTreeElementMouseHover = function (event) {
			var target = _findNearestDOMParent(event.target, "LI");

			var hoverList = this._ElementTreeContainer.querySelector("[hover]");

			if (hoverList) {
				hoverList.removeAttribute("hover");
			}

			target.setAttribute("hover", "true");

			var dataId = target.attributes["data-id"];
			this.onHoverChanged(dataId && dataId.value);
		};

		/**
		 * Event handler for mouse out of the tree element.
		 * @param {Object} event - mouse event
		 * @private
		 */
		ElementTree.prototype._onTreeElementMouseOut = function (event) {
			this.onMouseOut();
		};

		/**
		 * Create all event handlers for the ElementTree.
		 * @private
		 */
		ElementTree.prototype._createHandlers = function () {
			this._treeContainer.onclick = this._onArrowClick.bind(this);
			this._treeContainer.oncontextmenu = this._onContextMenu.bind(this);
			this._filterContainer.onkeyup = this._onSearchInput.bind(this);
			this._filterContainer.onsearch = this._onSearchEvent.bind(this);
			this._filterContainer.onchange = this._onOptionsChange.bind(this);
			this._ElementTreeContainer.onmouseover = this._onTreeElementMouseHover.bind(this);
			this._ElementTreeContainer.onmouseout = this._onTreeElementMouseOut.bind(this);
		};

		/**
		 * Save references to ElementTree different sections.
		 * @private
		 */
		ElementTree.prototype._setReferences = function () {
			this._filterContainer = this._ElementTreeContainer.querySelector("filter");
			this._treeContainer = this._ElementTreeContainer.querySelector("tree");
		};

		return ElementTree;
	});
