/*global QUnit*/
sap.ui.define([
    "sap/m/Page",
    "sap/m/NavContainer",
    "sap/m/Button",
    "sap/ui/test/utils/nextUIUpdate",
    "sap/ui/util/Mobile",
    "sap/m/Dialog",
    "sap/m/Popover"
], function (
    Page,
    NavContainer,
    Button,
    nextUIUpdate,
    Mobile,
    Dialog,
    Popover
) {
    "use strict";

    // Constants for test configuration
    const TEST_TIMEOUTS = {
        SHORT: 50,
        MEDIUM: 100,
        LONG: 500
    };

    /**
     * Helper function for creating test pages
     * @param {string} sId The ID of the page to create
     * @param {string} sTitle The title of the page
     * @param {sap.ui.core.Control[]} aContent The content controls of the page
     * @returns {sap.m.Page} The created test page
     */
    function createTestPage(sId, sTitle, aContent) {
        return new Page(sId, {
            title: sTitle || "Test Page",
            content: aContent || []
        });
    }

    /**
     * Helper function to create DOM container for tests
     * @param {string} sPrefix Prefix for container ID
     * @returns {HTMLElement} The created container element
     */
    function createTestContainer(sPrefix) {
        const oContainer = document.createElement("div");
        oContainer.id = sPrefix + "-" + Date.now();
        oContainer.style.height = "100%";
        document.body.appendChild(oContainer);
        return oContainer;
    }

    /**
     * Helper function to clean up DOM container
     * @param {HTMLElement} oContainer The container to clean up
     */
    function cleanupTestContainer(oContainer) {
        if (oContainer?.parentNode) {
            oContainer.parentNode.removeChild(oContainer);
        }
    }

    // Initialize Mobile library for proper rendering
    Mobile.init();

    // Module: Core API - Construction and Initialization
    QUnit.module("Core API - Construction and Initialization", {
        beforeEach: function () {
            this.oNavContainer = null;
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }
        }
    });

    QUnit.test("Should create NavContainer instance with default properties", function (assert) {
        // Act
        this.oNavContainer = new NavContainer();

        // Assert
        assert.ok(this.oNavContainer instanceof NavContainer, "NavContainer instance created");
        assert.strictEqual(this.oNavContainer.getPages().length, 0, "No pages initially");
        assert.strictEqual(this.oNavContainer.getCurrentPage(), undefined, "No current page initially");
        assert.strictEqual(this.oNavContainer.getAutoFocus(), true, "AutoFocus enabled by default");
        assert.strictEqual(this.oNavContainer.getDefaultTransitionName(), "slide", "Default transition is slide");
        assert.strictEqual(this.oNavContainer.getHeight(), "100%", "Default height is 100%");
        assert.strictEqual(this.oNavContainer.getWidth(), "100%", "Default width is 100%");
        assert.strictEqual(this.oNavContainer.getVisible(), true, "Default visibility is true");
    });

    QUnit.test("Should create NavContainer with custom initial configuration", function (assert) {
        // Arrange
        const oPage1 = createTestPage("testPage1", "Test Page 1");
        const oPage2 = createTestPage("testPage2", "Test Page 2");

        // Act
        this.oNavContainer = new NavContainer({
            pages: [oPage1, oPage2],
            initialPage: oPage1.getId(),
            autoFocus: false,
            defaultTransitionName: "fade",
            height: "500px",
            width: "300px"
        });

        // Assert
        assert.strictEqual(this.oNavContainer.getPages().length, 2, "Two pages added");
        assert.strictEqual(this.oNavContainer.getCurrentPage(), oPage1, "Initial page set correctly");
        assert.strictEqual(this.oNavContainer.getAutoFocus(), false, "AutoFocus disabled");
        assert.strictEqual(this.oNavContainer.getDefaultTransitionName(), "fade", "Custom default transition set");
        assert.strictEqual(this.oNavContainer.getHeight(), "500px", "Custom height set");
        assert.strictEqual(this.oNavContainer.getWidth(), "300px", "Custom width set");
    });

    QUnit.test("Should handle empty pages array gracefully", function (assert) {
        // Act
        this.oNavContainer = new NavContainer({
            pages: []
        });

        // Assert
        assert.strictEqual(this.oNavContainer.getPages().length, 0, "No pages in empty array");
        assert.strictEqual(this.oNavContainer.getCurrentPage(), undefined, "No current page with empty pages");
        assert.strictEqual(this.oNavContainer.currentPageIsTopPage(), false, "No top page with empty pages");
    });

    QUnit.test("Should handle null/undefined initial page gracefully", function (assert) {
        // Act
        this.oNavContainer = new NavContainer({
            initialPage: null
        });

        // Assert
        assert.strictEqual(this.oNavContainer.getInitialPage(), null, "Initial page should be null");
        assert.strictEqual(this.oNavContainer.getCurrentPage(), undefined, "No current page with null initialPage");
    });

    QUnit.test("Should handle invalid initial page ID gracefully", function (assert) {
        // Act
        this.oNavContainer = new NavContainer({
            initialPage: "nonExistentPage"
        });

        // Assert
        assert.strictEqual(this.oNavContainer.getInitialPage(), "nonExistentPage", "Initial page ID stored");
        assert.strictEqual(this.oNavContainer.getCurrentPage(), undefined, "No current page with invalid initialPage");
    });

    // Module: Core API - Page Management
    QUnit.module("Core API - Page Management", {
        beforeEach: function () {
            this.oNavContainer = new NavContainer();
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }
        }
    });

    QUnit.test("Should add page successfully and support method chaining", function (assert) {
        // Arrange
        const oPage = createTestPage("addedPage", "Added Page");

        // Act
        const result = this.oNavContainer.addPage(oPage);

        // Assert
        assert.strictEqual(result, this.oNavContainer, "addPage returns NavContainer for chaining");
        assert.strictEqual(this.oNavContainer.getPages().length, 1, "Page added successfully");
        assert.strictEqual(this.oNavContainer.getPage("addedPage"), oPage, "Page retrievable by ID");
    });

    QUnit.test("Should insert page at correct position", function (assert) {
        // Arrange
        const oPage1 = createTestPage("page1", "Page 1");
        const oPage2 = createTestPage("page2", "Page 2");
        const oPage3 = createTestPage("page3", "Page 3");

        this.oNavContainer.addPage(oPage1);
        this.oNavContainer.addPage(oPage3);

        // Act
        const result = this.oNavContainer.insertPage(oPage2, 1);

        // Assert
        assert.strictEqual(result, this.oNavContainer, "insertPage returns NavContainer for chaining");
        assert.strictEqual(this.oNavContainer.getPages().length, 3, "All pages present");
        assert.strictEqual(this.oNavContainer.getPages()[1], oPage2, "Page inserted at correct position");
    });

    QUnit.test("Should remove page and clean up references", function (assert) {
        // Arrange
        const oPage1 = createTestPage("page1", "Page 1");
        const oPage2 = createTestPage("page2", "Page 2");

        this.oNavContainer.addPage(oPage1);
        this.oNavContainer.addPage(oPage2);

        // Act
        const removedPage = this.oNavContainer.removePage(oPage1);

        // Assert
        assert.strictEqual(removedPage, oPage1, "Removed page returned");
        assert.strictEqual(this.oNavContainer.getPages().length, 1, "Page count decreased");
        assert.strictEqual(this.oNavContainer.getPage("page1"), null, "Page no longer retrievable");
    });

    QUnit.test("Should handle removal of non-existent page gracefully", function (assert) {
        // Act
        const result = this.oNavContainer.removePage("nonExistentPage");

        // Assert
        assert.strictEqual(result, null, "Remove returns null for non-existent page");
        assert.strictEqual(this.oNavContainer.getPages().length, 0, "Page count unchanged");
    });

    QUnit.test("Should handle removal of page by index", function (assert) {
        // Arrange
        const oPage1 = createTestPage("pageByIndex1", "Page 1");
        const oPage2 = createTestPage("pageByIndex2", "Page 2");
        const oPage3 = createTestPage("pageByIndex3", "Page 3");

        this.oNavContainer.addPage(oPage1);
        this.oNavContainer.addPage(oPage2);
        this.oNavContainer.addPage(oPage3);

        // Act
        const removedPage = this.oNavContainer.removePage(1);

        // Assert
        assert.strictEqual(removedPage, oPage2, "Middle page removed correctly");
        assert.strictEqual(this.oNavContainer.getPages().length, 2, "Page count decreased");
        assert.strictEqual(this.oNavContainer.getPages()[1], oPage3, "Remaining pages shifted correctly");
    });

    QUnit.test("Should handle invalid page insertion index", function (assert) {
        // Arrange
        const oPage1 = createTestPage("invalidIndex1", "Page 1");
        const oPage2 = createTestPage("invalidIndex2", "Page 2");

        this.oNavContainer.addPage(oPage1);

        // Act - insert at invalid index
        const result = this.oNavContainer.insertPage(oPage2, 10);

        // Assert
        assert.strictEqual(result, this.oNavContainer, "insertPage returns NavContainer for chaining");
        assert.strictEqual(this.oNavContainer.getPages().length, 2, "Page still added despite invalid index");
        assert.strictEqual(this.oNavContainer.getPages()[1], oPage2, "Page added at end when index too high");
    });

    // Module: Core API - Navigation State
    QUnit.module("Core API - Navigation State", {
        beforeEach: function () {
            this.oPage1 = createTestPage("statePage1", "State Page 1");
            this.oPage2 = createTestPage("statePage2", "State Page 2");
            this.oPage3 = createTestPage("statePage3", "State Page 3");

            this.oNavContainer = new NavContainer({
                pages: [this.oPage1, this.oPage2, this.oPage3],
                initialPage: this.oPage1.getId()
            });

            this.oContainer = createTestContainer("test-nav-container");
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }
            if (this.oPage1) {
                this.oPage1.destroy();
                this.oPage1 = null;
            }
            if (this.oPage2) {
                this.oPage2.destroy();
                this.oPage2 = null;
            }
            if (this.oPage3) {
                this.oPage3.destroy();
                this.oPage3 = null;
            }

            cleanupTestContainer(this.oContainer);
        }
    });

    QUnit.test("Should have correct initial navigation state", function (assert) {
        // Assert
        assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage1, "Current page is initial page");
        assert.strictEqual(this.oNavContainer.getPreviousPage(), undefined, "No previous page initially");
        assert.strictEqual(this.oNavContainer.currentPageIsTopPage(), true, "Initial page is top page");
    });

    QUnit.test("Should initialize page stack correctly", function (assert) {
        // Act
        this.oNavContainer._ensurePageStackInitialized();

        // Assert
        assert.strictEqual(this.oNavContainer._pageStack.length, 1, "Page stack initialized with one page");
        assert.strictEqual(this.oNavContainer._pageStack[0].id, this.oPage1.getId(), "Correct page in stack");
        assert.strictEqual(this.oNavContainer._pageStack[0].isInitial, true, "Initial page marked correctly");
    });

    QUnit.test("Should retrieve pages by ID correctly", function (assert) {
        // Assert
        assert.strictEqual(this.oNavContainer.getPage("statePage1"), this.oPage1, "Page 1 retrieved correctly");
        assert.strictEqual(this.oNavContainer.getPage("statePage2"), this.oPage2, "Page 2 retrieved correctly");
        assert.strictEqual(this.oNavContainer.getPage("nonexistent"), null, "Non-existent page returns null");
    });

    QUnit.test("Should insert previous page into navigation stack", function (assert) {
        // Act
        const result = this.oNavContainer.insertPreviousPage("statePage2", "fade", { testData: "value" });

        // Assert
        assert.strictEqual(result, this.oNavContainer, "insertPreviousPage returns NavContainer for chaining");
        assert.strictEqual(this.oNavContainer._pageStack.length, 2, "Page stack has two pages");
        assert.strictEqual(this.oNavContainer._pageStack[0].id, "statePage2", "Previous page inserted correctly");
        assert.strictEqual(this.oNavContainer._pageStack[0].transition, "fade", "Transition stored correctly");
        assert.deepEqual(this.oNavContainer._pageStack[0].data, { testData: "value" }, "Data stored correctly");
    });

    QUnit.test("Should navigate back to an inserted previous page", async function (assert) {
        // Arrange
        const fnDone = assert.async();

        // Render the NavContainer first
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        // Navigate to Page 2 first
        await new Promise((resolve) => {
            this.oNavContainer.attachEventOnce("afterNavigate", resolve);
            this.oNavContainer.to("statePage2");
        });

        assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage2, "Pre-condition: Current page is Page 2");
        assert.strictEqual(this.oNavContainer._pageStack.length, 2, "Pre-condition: Page stack has 2 pages");

        // Act
        // Insert Page 3 as previous page
        this.oNavContainer.insertPreviousPage("statePage3");
        assert.strictEqual(this.oNavContainer._pageStack.length, 3, "Page stack should now have 3 pages");
        assert.strictEqual(this.oNavContainer._pageStack[1].id, "statePage3", "Page 3 should be inserted at index 1 in the stack");

        this.oNavContainer.attachEventOnce("afterNavigate", (oEvent) => {
            // Assert
            assert.strictEqual(oEvent.getParameter("direction"), "back", "Navigation direction should be 'back'");
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage3, "Should have navigated back to the inserted Page 3");
            assert.strictEqual(this.oNavContainer.getPreviousPage(), this.oPage1, "The previous page should now be Page 1");
            fnDone();
        });

        // Trigger the back navigation
        this.oNavContainer.back();
    });

    // Module: Core API - Forward Navigation
    QUnit.module("Core API - Forward Navigation", {
        beforeEach: function () {
            this.oPage1 = createTestPage("navPage1", "Nav Page 1");
            this.oPage2 = createTestPage("navPage2", "Nav Page 2");
            this.oPage3 = createTestPage("navPage3", "Nav Page 3");

            this.oNavContainer = new NavContainer({
                pages: [this.oPage1, this.oPage2, this.oPage3],
                initialPage: this.oPage1.getId()
            });

            this.oContainer = createTestContainer("test-nav-container");
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }
            if (this.oPage1) {
                this.oPage1.destroy();
                this.oPage1 = null;
            }
            if (this.oPage2) {
                this.oPage2.destroy();
                this.oPage2 = null;
            }
            if (this.oPage3) {
                this.oPage3.destroy();
                this.oPage3 = null;
            }

            cleanupTestContainer(this.oContainer);
        }
    });

    QUnit.test("Should navigate to page and fire events correctly", async function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oNavigateSpy = this.spy();
        const oNavigationFinishedSpy = this.spy();

        // Render the NavContainer first
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        // Set up event handlers
        this.oNavContainer.attachNavigate(oNavigateSpy);
        this.oNavContainer.attachNavigationFinished((oEvent) => {
            oNavigationFinishedSpy(oEvent);

            // Assert - Method behavior
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage2, "Current page changed");
            assert.strictEqual(this.oNavContainer.getPreviousPage(), this.oPage1, "Previous page set correctly");
            assert.strictEqual(this.oNavContainer.currentPageIsTopPage(), false, "No longer at top page");

            // Assert - Event behavior
            assert.strictEqual(oNavigateSpy.calledOnce, true, "Navigate event fired exactly once");
            assert.strictEqual(oNavigationFinishedSpy.calledOnce, true, "NavigationFinished event fired exactly once");

            const oNavigateEvent = oNavigateSpy.firstCall.args[0];
            assert.strictEqual(oNavigateEvent.getParameter("fromId"), "navPage1", "Navigate event fromId correct");
            assert.strictEqual(oNavigateEvent.getParameter("toId"), "navPage2", "Navigate event toId correct");
            assert.strictEqual(oNavigateEvent.getParameter("isTo"), true, "Navigate event isTo flag correct");
            assert.strictEqual(oNavigateEvent.getParameter("direction"), "to", "Navigate event direction correct");

            fnDone();
        });

        // Act
        const result = this.oNavContainer.to("navPage2");

        // Assert immediate return value
        assert.strictEqual(result, this.oNavContainer, "to() returns NavContainer for chaining");
    });

    QUnit.test("Should navigate with custom transition and data", async function (assert) {
        const fnDone = assert.async();
        const testData = { key: "value", number: 42 };
        let customTransitionCalled = false;
        let receivedData = null;

        // Render the NavContainer first - transitions only work when rendered
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        // Add delegate to capture data
        const oDataDelegate = {
            onBeforeShow: function (oEvent) {
                receivedData = oEvent.data;
            }
        };
        this.oPage2.addEventDelegate(oDataDelegate);

        // Add custom transition to verify it's being used
        this.oNavContainer.addCustomTransition("testTransition",
            function (oFromPage, oToPage, fCallback) {
                customTransitionCalled = true;
                oToPage.removeStyleClass("sapMNavItemHidden");
                oFromPage.addStyleClass("sapMNavItemHidden");
                fCallback();
            },
            function (oFromPage, oToPage, fCallback) {
                customTransitionCalled = true;
                oToPage.removeStyleClass("sapMNavItemHidden");
                oFromPage.addStyleClass("sapMNavItemHidden");
                fCallback();
            }
        );

        // Use afterNavigate for rendered test (like other transition tests)
        this.oNavContainer.attachAfterNavigate(() => {
            // Assert navigation completed
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage2, "Navigation with data completed");

            // Assert custom transition was used
            assert.strictEqual(customTransitionCalled, true, "Custom transition should be executed");

            // Assert data was passed correctly
            assert.deepEqual(receivedData, testData, "Navigation data should be passed to target page");
            assert.strictEqual(receivedData.key, "value", "Data property 'key' should be correct");
            assert.strictEqual(receivedData.number, 42, "Data property 'number' should be correct");

            fnDone();
        });

        // Act - trigger navigation
        this.oNavContainer.to("navPage2", "testTransition", testData);
    });

    QUnit.test("Should handle navigation to non-existent page gracefully", function (assert) {
        // Act
        const result = this.oNavContainer.to("nonexistentPage");

        // Assert
        assert.strictEqual(result, this.oNavContainer, "Method returns NavContainer even for invalid page");
        assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage1, "Current page unchanged for invalid navigation");
    });

    QUnit.test("Should prevent navigation to same page", function (assert) {
        const fnDone = assert.async();
        const oNavigateSpy = this.spy();

        this.oNavContainer.attachNavigate(oNavigateSpy);

        // Act
        this.oNavContainer.to("navPage1");

        // Wait briefly to ensure no events are fired
        setTimeout(() => {
            assert.strictEqual(oNavigateSpy.notCalled, true, "No navigate event fired for same page");
            fnDone();
        }, TEST_TIMEOUTS.SHORT);
    });

    // Module: Core API - Back Navigation
    QUnit.module("Core API - Back Navigation", {
        beforeEach: function () {
            this.oPage1 = createTestPage("backPage1", "Back Page 1");
            this.oPage2 = createTestPage("backPage2", "Back Page 2");
            this.oPage3 = createTestPage("backPage3", "Back Page 3");

            this.oNavContainer = new NavContainer({
                pages: [this.oPage1, this.oPage2, this.oPage3],
                initialPage: this.oPage1.getId()
            });

            // Set up navigation stack for back testing
            this.oNavContainer.to("backPage2");
            this.oNavContainer.to("backPage3");
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }
            if (this.oPage1) {
                this.oPage1.destroy();
                this.oPage1 = null;
            }
            if (this.oPage2) {
                this.oPage2.destroy();
                this.oPage2 = null;
            }
            if (this.oPage3) {
                this.oPage3.destroy();
                this.oPage3 = null;
            }
        }
    });

    QUnit.test("Should navigate back one level correctly", function (assert) {
        const fnDone = assert.async();
        const oNavigationFinishedSpy = this.spy();

        // Pre-condition
        assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage3, "Pre-condition: Starting from page 3");

        this.oNavContainer.attachNavigationFinished((oEvent) => {
            oNavigationFinishedSpy(oEvent);

            // Assert
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage2, "Current page correct after back navigation");
            assert.strictEqual(this.oNavContainer.getPreviousPage(), this.oPage1, "Previous page correct after back navigation");

            // Assert event parameters
            assert.strictEqual(oNavigationFinishedSpy.calledOnce, true, "navigationFinished event was fired once");
            assert.strictEqual(oEvent.getParameter("fromId"), "backPage3", "Event fromId parameter correct");
            assert.strictEqual(oEvent.getParameter("toId"), "backPage2", "Event toId parameter correct");
            assert.strictEqual(oEvent.getParameter("isBack"), true, "Event isBack parameter correct");
            assert.strictEqual(oEvent.getParameter("direction"), "back", "Event direction parameter correct");

            fnDone();
        });

        // Act
        const result = this.oNavContainer.back();
        assert.strictEqual(result, this.oNavContainer, "back() returns NavContainer for chaining");
    });

    QUnit.test("Should navigate back to specific page", function (assert) {
        const fnDone = assert.async();
        const oNavigationFinishedSpy = this.spy();

        // Pre-condition
        assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage3, "Pre-condition: Starting from page 3");

        this.oNavContainer.attachNavigationFinished((oEvent) => {
            oNavigationFinishedSpy(oEvent);

            // Assert
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage1, "Current page after backToPage");
            assert.strictEqual(this.oNavContainer.currentPageIsTopPage(), true, "Back to top page");

            assert.strictEqual(oEvent.getParameter("toId"), "backPage1", "Event toId parameter correct");
            assert.strictEqual(oEvent.getParameter("isBackToPage"), true, "Event isBackToPage flag correct");
            assert.strictEqual(oEvent.getParameter("direction"), "backToPage", "Event direction correct");

            fnDone();
        });

        // Act
        const result = this.oNavContainer.backToPage("backPage1");
        assert.strictEqual(result, this.oNavContainer, "backToPage() returns NavContainer for chaining");
    });

    QUnit.test("Should navigate back to top page", function (assert) {
        const fnDone = assert.async();
        const oNavigationFinishedSpy = this.spy();

        this.oNavContainer.attachNavigationFinished((oEvent) => {
            oNavigationFinishedSpy(oEvent);

            // Assert
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage1, "Current page after backToTop");
            assert.strictEqual(this.oNavContainer.currentPageIsTopPage(), true, "At top page");

            assert.strictEqual(oEvent.getParameter("toId"), "backPage1", "Event toId parameter correct");
            assert.strictEqual(oEvent.getParameter("isBackToTop"), true, "Event isBackToTop flag correct");
            assert.strictEqual(oEvent.getParameter("direction"), "backToTop", "Event direction correct");

            fnDone();
        });

        // Act
        const result = this.oNavContainer.backToTop();
        assert.strictEqual(result, this.oNavContainer, "backToTop() returns NavContainer for chaining");
    });

    QUnit.test("Should handle back navigation with non-existent page gracefully", function (assert) {
        // Act
        const result = this.oNavContainer.backToPage("nonExistentPage");

        // Assert
        assert.strictEqual(result, this.oNavContainer, "Method returns NavContainer");
        assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage3, "Current page unchanged");
    });

    // Module: Core API - Event System
    QUnit.module("Core API - Event System", {
        beforeEach: function () {
            this.oPage1 = createTestPage("eventPage1", "Event Page 1");
            this.oPage2 = createTestPage("eventPage2", "Event Page 2");

            this.oNavContainer = new NavContainer({
                pages: [this.oPage1, this.oPage2],
                initialPage: this.oPage1.getId()
            });
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }
            if (this.oPage1) {
                this.oPage1.destroy();
                this.oPage1 = null;
            }
            if (this.oPage2) {
                this.oPage2.destroy();
                this.oPage2 = null;
            }
        }
    });

    QUnit.test("Should support cancelable navigate event", function (assert) {
        const fnDone = assert.async();
        const oNavigationFinishedSpy = this.spy();

        this.oNavContainer.attachNavigate((oEvent) => {
            oEvent.preventDefault();
        });
        this.oNavContainer.attachNavigationFinished(oNavigationFinishedSpy);

        // Act
        this.oNavContainer.to("eventPage2");

        // Wait briefly to ensure no navigation occurs
        setTimeout(() => {
            assert.strictEqual(oNavigationFinishedSpy.notCalled, true, "Navigation was cancelled");
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage1, "Still on original page");
            fnDone();
        }, TEST_TIMEOUTS.LONG);
    });

    QUnit.test("Should provide complete event parameters", function (assert) {
        const fnDone = assert.async();
        const oNavigateSpy = this.spy();

        this.oNavContainer.attachNavigate(oNavigateSpy);
        this.oNavContainer.attachNavigationFinished(() => {
            // Assert
            const oEvent = oNavigateSpy.firstCall.args[0];

            // Test parameter presence and types
            assert.strictEqual(typeof oEvent.getParameter("from"), "object", "from parameter present and correct type");
            assert.strictEqual(typeof oEvent.getParameter("fromId"), "string", "fromId parameter present and correct type");
            assert.strictEqual(typeof oEvent.getParameter("to"), "object", "to parameter present and correct type");
            assert.strictEqual(typeof oEvent.getParameter("toId"), "string", "toId parameter present and correct type");
            assert.strictEqual(typeof oEvent.getParameter("firstTime"), "boolean", "firstTime parameter is boolean");
            assert.strictEqual(typeof oEvent.getParameter("isTo"), "boolean", "isTo parameter is boolean");
            assert.strictEqual(typeof oEvent.getParameter("isBack"), "boolean", "isBack parameter is boolean");
            assert.strictEqual(typeof oEvent.getParameter("isBackToPage"), "boolean", "isBackToPage parameter is boolean");
            assert.strictEqual(typeof oEvent.getParameter("isBackToTop"), "boolean", "isBackToTop parameter is boolean");
            assert.strictEqual(typeof oEvent.getParameter("direction"), "string", "direction parameter present and correct type");

            fnDone();
        });

        // Act
        this.oNavContainer.to("eventPage2");
    });

    // Module: Core API - Property Management
    QUnit.module("Core API - Property Management", {
        beforeEach: function () {
            this.oNavContainer = new NavContainer();
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }
        }
    });

    QUnit.test("Should manage autoFocus property correctly", function (assert) {
        // Assert default
        assert.strictEqual(this.oNavContainer.getAutoFocus(), true, "Default autoFocus is true");

        // Act
        const result = this.oNavContainer.setAutoFocus(false);

        // Assert
        assert.strictEqual(result, this.oNavContainer, "setAutoFocus returns NavContainer for chaining");
        assert.strictEqual(this.oNavContainer.getAutoFocus(), false, "AutoFocus set to false");
    });

    QUnit.test("Should manage defaultTransitionName property correctly", function (assert) {
        // Assert default
        assert.strictEqual(this.oNavContainer.getDefaultTransitionName(), "slide", "Default transition is slide");

        // Act
        this.oNavContainer.setDefaultTransitionName("fade");

        // Assert
        assert.strictEqual(this.oNavContainer.getDefaultTransitionName(), "fade", "Transition changed to fade");
    });

    QUnit.test("Should manage dimension properties correctly", function (assert) {
        // Assert defaults
        assert.strictEqual(this.oNavContainer.getHeight(), "100%", "Default height is 100%");
        assert.strictEqual(this.oNavContainer.getWidth(), "100%", "Default width is 100%");

        // Act
        this.oNavContainer.setHeight("500px");
        this.oNavContainer.setWidth("300px");

        // Assert
        assert.strictEqual(this.oNavContainer.getHeight(), "500px", "Height set correctly");
        assert.strictEqual(this.oNavContainer.getWidth(), "300px", "Width set correctly");
    });

    QUnit.test("Should manage visibility property correctly", function (assert) {
        // Assert default
        assert.strictEqual(this.oNavContainer.getVisible(), true, "Default visibility is true");

        // Act
        this.oNavContainer.setVisible(false);

        // Assert
        assert.strictEqual(this.oNavContainer.getVisible(), false, "Visibility set to false");
    });

    // Module: Rendered Navigation - DOM and Lifecycle
    QUnit.module("Rendered Navigation - DOM and Lifecycle", {
        beforeEach: function () {
            this.oPage1 = createTestPage("renderedPage1", "Rendered Page 1");
            this.oPage2 = createTestPage("renderedPage2", "Rendered Page 2");

            this.oNavContainer = new NavContainer({
                pages: [this.oPage1, this.oPage2],
                initialPage: this.oPage1.getId()
            });

            this.oContainer = createTestContainer("test-rendered-container");
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }
            if (this.oPage1) {
                this.oPage1.destroy();
                this.oPage1 = null;
            }
            if (this.oPage2) {
                this.oPage2.destroy();
                this.oPage2 = null;
            }

            cleanupTestContainer(this.oContainer);
        }
    });

    QUnit.test("Should render NavContainer with correct DOM structure", async function (assert) {
        // Act
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        // Assert
        assert.strictEqual(!!this.oNavContainer.getDomRef(), true, "NavContainer should be rendered");
        assert.strictEqual(!!this.oPage1.getDomRef(), true, "Initial page should be rendered");
        assert.strictEqual(!!this.oPage2.getDomRef(), false, "Non-current page should not be rendered");

        const $navContainer = this.oNavContainer.$();
        assert.strictEqual($navContainer.hasClass("sapMNav"), true, "NavContainer should have correct CSS class");
    });

    QUnit.test("Should handle page lifecycle events on navigation", async function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oEventSpies = {
            onBeforeHide: this.spy(),
            onBeforeShow: this.spy(),
            onAfterShow: this.spy()
        };

        // Set up event delegates consistently
        this.oPage1.addEventDelegate({
            onBeforeHide: oEventSpies.onBeforeHide
        });

        this.oPage2.addEventDelegate({
            onBeforeShow: oEventSpies.onBeforeShow,
            onAfterShow: oEventSpies.onAfterShow
        });

        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        this.oNavContainer.attachAfterNavigate(() => {
            // Assert
            assert.ok(oEventSpies.onBeforeHide.calledOnce, "onBeforeHide event should be called on source page");
            assert.ok(oEventSpies.onBeforeShow.calledOnce, "onBeforeShow event should be called on target page");
            assert.ok(oEventSpies.onAfterShow.calledOnce, "onAfterShow event should be called on target page");
            fnDone();
        });

        // Act
        this.oNavContainer.to("renderedPage2");
    });

    // Module: Lifecycle Management
    QUnit.module("Lifecycle Management", {
        beforeEach: function () {
            // Using helper functions defined in the test suite
            this.oButton1 = new Button("lifecycleBtn1", { text: "Focus Me" });
            this.oPage1 = createTestPage("lifecyclePage1", "Lifecycle Page 1", [this.oButton1]);
            this.oPage2 = createTestPage("lifecyclePage2", "Lifecycle Page 2");

            this.oNavContainer = new NavContainer({
                pages: [this.oPage1, this.oPage2],
                initialPage: this.oPage1.getId()
            });

            this.oContainer = createTestContainer("test-lifecycle-container");
        },
        afterEach: function () {
            // The NavContainer is already destroyed within the test, so no extra cleanup is needed here.
            // The other controls are destroyed along with it because they are part of its aggregation.
            cleanupTestContainer(this.oContainer);
        }
    });

    QUnit.test("Should clean up internal references on destroy to prevent memory leaks", async function (assert) {
        // Arrange
        // 1. Render the control into the DOM.
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        // 2. Focus the button on the first page. This is key to ensuring _mFocusObject gets populated.
        this.oButton1.focus();
        assert.strictEqual(document.activeElement, this.oButton1.getDomRef(), "Pre-condition: The button on Page 1 is focused.");

        // 3. Navigate to the second page. This will trigger the logic that saves the focus reference.
        await new Promise((resolve) => {
            this.oNavContainer.attachEventOnce("afterNavigate", resolve);
            this.oNavContainer.to("lifecyclePage2");
        });

        // 4. Verify that the internal _mFocusObject has been populated.
        assert.ok(this.oNavContainer._mFocusObject, "Pre-condition: _mFocusObject should be populated after navigation.");
        assert.ok(this.oNavContainer._mFocusObject["lifecyclePage1"], "Pre-condition: A focus reference for the 'from' page should exist.");

        // Act
        // Destroy the NavContainer. This will trigger the exit() method.
        this.oNavContainer.destroy();

        // Assert
        // Check that the internal properties are nulled as defined in the exit() method.
        assert.strictEqual(this.oNavContainer._mFocusObject, null, "Internal property '_mFocusObject' should be nulled on destroy.");
        assert.strictEqual(this.oNavContainer._placeholder, undefined, "Internal property '_placeholder' should be undefined on destroy.");
        assert.ok(this.oNavContainer.bIsDestroyed, "The control's bIsDestroyed flag should be true.");
    });

    // Module: Transitions and Animations
    QUnit.module("Transitions and Animations", {
        beforeEach: function () {
            this.oPage1 = createTestPage("transPage1", "Transition Page 1");
            this.oPage2 = createTestPage("transPage2", "Transition Page 2");

            this.oNavContainer = new NavContainer({
                pages: [this.oPage1, this.oPage2],
                initialPage: this.oPage1.getId()
            });

            this.oContainer = createTestContainer("test-transition-container");
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }
            if (this.oPage1) {
                this.oPage1.destroy();
                this.oPage1 = null;
            }
            if (this.oPage2) {
                this.oPage2.destroy();
                this.oPage2 = null;
            }

            cleanupTestContainer(this.oContainer);
        }
    });

    QUnit.test("Should execute 'slide' transition correctly", async function (assert) {
        const fnDone = assert.async();

        // Arrange
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        this.oNavContainer.attachAfterNavigate(() => {
            // Assert: Final state after transition
            assert.strictEqual(!!this.oPage2.getDomRef(), true, "Target page should be rendered");
            assert.strictEqual(this.oPage1.$().css("display"), "none", "Source page should be hidden");
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage2, "Current page should be updated to page 2");

            // Assert: Animation classes should be cleaned up from both pages
            assert.strictEqual(this.oPage1.$().hasClass("sapMNavItemFading"), false, "Source page cleanup: Fading class removed");
            assert.strictEqual(this.oPage2.$().hasClass("sapMNavItemFading"), false, "Target page cleanup: Fading class removed");
            assert.strictEqual(this.oPage2.$().hasClass("sapMNavItemSlideLeft"), false, "Target page cleanup: Slide class removed");

            fnDone();
        });

        // Act
        // The "slide" transition is the default, but we specify it for clarity
        this.oNavContainer.to("transPage2", "slide");
    });

    QUnit.test("Should execute 'show' transition correctly", async function (assert) {
        const fnDone = assert.async();

        // Arrange
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        this.oNavContainer.attachAfterNavigate(() => {
            // Assert
            assert.strictEqual(!!this.oPage2.getDomRef(), true, "Target page should be rendered");
            assert.strictEqual(this.oPage1.$().css("display"), "none", "Source page should be hidden");
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage2, "Current page should be updated");
            fnDone();
        });

        // Act
        this.oNavContainer.to("transPage2", "show");
    });

    QUnit.test("Should execute 'fade' transition correctly", async function (assert) {
        const fnDone = assert.async();

        // Arrange
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        this.oNavContainer.attachAfterNavigate(() => {
            // Assert
            assert.strictEqual(!!this.oPage2.getDomRef(), true, "Target page should be rendered");
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage2, "Current page should be updated");

            // Check that transition classes are cleaned up
            assert.strictEqual(this.oPage2.$().hasClass("sapMNavItemFading"), false, "Transition classes should be cleaned up");
            fnDone();
        });

        // Act
        this.oNavContainer.to("transPage2", "fade");
    });

    QUnit.test("Should execute 'flip' transition correctly", async function (assert) {
        const fnDone = assert.async();

        // Arrange
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        this.oNavContainer.attachAfterNavigate(() => {
            // Assert: Final state after transition
            assert.strictEqual(!!this.oPage2.getDomRef(), true, "Target page should be rendered");
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage2, "Current page should be updated to page 2");

            // Assert: Animation classes should be cleaned up
            const $navContainer = this.oNavContainer.$();
            const $fromPage = this.oPage1.$();
            const $toPage = this.oPage2.$();

            assert.strictEqual($navContainer.hasClass("sapMNavFlip"), false, "Main container cleanup: Flipping class removed");
            assert.strictEqual($fromPage.hasClass("sapMNavItemFlipping"), false, "Source page cleanup: Flipping class removed");
            assert.strictEqual($fromPage.hasClass("sapMNavItemFlipPrevious"), false, "Source page cleanup: Flip position class removed");
            assert.strictEqual($toPage.hasClass("sapMNavItemFlipping"), false, "Target page cleanup: Flipping class removed");

            fnDone();
        });

        // Act
        this.oNavContainer.to("transPage2", "flip");
    });

    QUnit.test("Should execute 'baseSlide' transition correctly", async function (assert) {
        const fnDone = assert.async();

        // Arrange
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        this.oNavContainer.attachAfterNavigate(() => {
            // Assert: Final state after transition
            assert.strictEqual(!!this.oPage2.getDomRef(), true, "Target page should be rendered");
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage2, "Current page should be updated to page 2");

            // Assert: Animation classes should be cleaned up
            const $fromPage = this.oPage1.$();
            const $toPage = this.oPage2.$();

            assert.strictEqual($fromPage.hasClass("sapMNavItemSlideCenterToLeft"), false, "Source page cleanup: Animation class removed");
            assert.strictEqual($toPage.hasClass("sapMNavItemSlideRightToCenter"), false, "Target page cleanup: Animation class removed");

            fnDone();
        });

        // Act
        this.oNavContainer.to("transPage2", "baseSlide");
    });

    QUnit.test("Should support custom transitions", async function (assert) {
        const fnDone = assert.async();
        let customTransitionCalled = false;

        // Arrange - render the NavContainer first
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        this.oNavContainer.addCustomTransition("customTest",
            function (oFromPage, oToPage, fCallback) {
                customTransitionCalled = true;
                oToPage.removeStyleClass("sapMNavItemHidden");
                oFromPage.addStyleClass("sapMNavItemHidden");
                fCallback();
            },
            function (oFromPage, oToPage, fCallback) {
                oToPage.removeStyleClass("sapMNavItemHidden");
                oFromPage.addStyleClass("sapMNavItemHidden");
                fCallback();
            }
        );

        this.oNavContainer.attachAfterNavigate(() => {
            // Assert
            assert.strictEqual(customTransitionCalled, true, "Custom transition should be executed");
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage2, "Navigation should succeed");
            fnDone();
        });

        // Act
        this.oNavContainer.to("transPage2", "customTest");
    });

    // Module: Navigation Queue and State Management
    QUnit.module("Navigation Queue and State Management", {
        beforeEach: function () {
            this.oPage1 = createTestPage("queuePage1", "Queue Page 1");
            this.oPage2 = createTestPage("queuePage2", "Queue Page 2");
            this.oPage3 = createTestPage("queuePage3", "Queue Page 3");

            this.oNavContainer = new NavContainer({
                pages: [this.oPage1, this.oPage2, this.oPage3],
                initialPage: this.oPage1.getId()
            });

            this.oContainer = createTestContainer("test-queue-container");
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }
            if (this.oPage1) {
                this.oPage1.destroy();
                this.oPage1 = null;
            }
            if (this.oPage2) {
                this.oPage2.destroy();
                this.oPage2 = null;
            }
            if (this.oPage3) {
                this.oPage3.destroy();
                this.oPage3 = null;
            }

            cleanupTestContainer(this.oContainer);
        }
    });

    QUnit.test("Should queue rapid navigation requests", async function (assert) {
        const fnDone = assert.async();
        const navigationOrder = [];

        // Arrange
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        this.oNavContainer.attachAfterNavigate((oEvent) => {
            navigationOrder.push(oEvent.getParameter("toId"));

            if (navigationOrder.length === 2) {
                // Assert
                assert.deepEqual(navigationOrder, ["queuePage2", "queuePage3"], "Navigation should be executed in order");
                assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage3, "Final page should be correct");
                assert.strictEqual(this.oNavContainer._pageStack.length, 3, "Page stack should have the correct number of entries");
                fnDone();
            }
        });

        // Act - trigger rapid navigation
        this.oNavContainer.to("queuePage2");
        this.oNavContainer.to("queuePage3");
    });

    QUnit.test("Should maintain correct navigation stack", function (assert) {
        // Act
        this.oNavContainer.to("queuePage2");
        this.oNavContainer.to("queuePage3");

        // Assert
        assert.strictEqual(this.oNavContainer._pageStack.length, 3, "Stack should have 3 pages");
        assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage3, "Current page should be page 3");
        assert.strictEqual(this.oNavContainer.getPreviousPage(), this.oPage2, "Previous page should be page 2");
        assert.strictEqual(this.oNavContainer.currentPageIsTopPage(), false, "Should not be at top page");
    });

    // Module: Error Handling and Edge Cases
    QUnit.module("Error Handling and Edge Cases", {
        beforeEach: function () {
            this.oPage1 = createTestPage("errorHandlingPage1", "Error Page 1");
            this.oPage2 = createTestPage("errorHandlingPage2", "Error Page 2");
            this.oPage3 = createTestPage("errorHandlingPage3", "Error Page 3");

            this.oNavContainer = new NavContainer({
                pages: [this.oPage1, this.oPage2, this.oPage3],
                initialPage: this.oPage1.getId()
            });

            this.oContainer = createTestContainer("test-error-container");
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }
            if (this.oPage1) {
                this.oPage1.destroy();
                this.oPage1 = null;
            }
            if (this.oPage2) {
                this.oPage2.destroy();
                this.oPage2 = null;
            }
            if (this.oPage3) {
                this.oPage3.destroy();
                this.oPage3 = null;
            }

            cleanupTestContainer(this.oContainer);
        }
    });

    QUnit.test("Should handle back navigation when at top page", function (assert) {
        // Act
        const result = this.oNavContainer.back();

        // Assert
        assert.strictEqual(result, this.oNavContainer, "Method should return NavContainer for chaining");
        assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage1, "Should remain on current page");
        assert.strictEqual(this.oNavContainer.currentPageIsTopPage(), true, "Should still be at top page");
    });

    QUnit.test("Should handle removeAllPages correctly", async function (assert) {
        // Arrange - render the NavContainer first to properly initialize the page stack
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        // Verify initial state
        assert.strictEqual(this.oNavContainer.getPages().length, 3, "Should have 3 pages initially");
        assert.strictEqual(this.oNavContainer._pageStack.length, 1, "Page stack should have 1 entry initially");
        assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage1, "Current page should be page1");
        assert.strictEqual(!!this.oPage1.getDomRef(), true, "Page1 should be rendered in DOM");

        // Clear the initialPage association to prevent stack re-initialization
        this.oNavContainer.setInitialPage(null);

        // Act
        const removedPages = this.oNavContainer.removeAllPages();

        // Assert immediate results
        assert.strictEqual(removedPages.length, 3, "Should return all removed pages");
        assert.strictEqual(this.oNavContainer.getPages().length, 0, "Should have no pages in aggregation");

        // Now the _pageStack should be empty because we cleared the initialPage association
        assert.strictEqual(this.oNavContainer._pageStack.length, 0, "Page stack should be empty after removeAllPages");

        // Assert DOM cleanup
        assert.strictEqual(!!this.oPage1.getDomRef(), false, "Page1 DOM should be removed");
        assert.strictEqual(!!this.oPage2.getDomRef(), false, "Page2 DOM should be removed");
        assert.strictEqual(!!this.oPage3.getDomRef(), false, "Page3 DOM should be removed");

        // After removing all pages and clearing initialPage, getCurrentPage() returns undefined
        // because _getActualInitialPage() returns null, and the stack remains empty
        assert.strictEqual(this.oNavContainer.getCurrentPage(), undefined, "Should have no current page");

        // When initialPage is null and there are no pages, _ensurePageStackInitialized()
        // calls _getActualInitialPage() which returns null, so no entry is pushed to the stack
        assert.strictEqual(this.oNavContainer._pageStack.length, 0, "Page stack should remain empty when no pages exist and no initialPage");
    });

    QUnit.test("Should handle page removal from navigation stack", function (assert) {
        // Arrange
        this.oNavContainer.to("errorHandlingPage2");

        // Act
        const removedPage = this.oNavContainer.removePage(this.oPage2);

        // Assert
        assert.strictEqual(removedPage, this.oPage2, "Should return removed page");
        assert.strictEqual(this.oNavContainer._pageStack.length, 1, "Stack should be cleaned up");
        assert.strictEqual(this.oPage2.$().length, 0, "Removed page DOM should be cleaned up");
    });

    QUnit.test("Should navigate back automatically when the current page is removed", async function (assert) {
        // Arrange
        const fnDone = assert.async();

        // Render the NavContainer first to properly initialize the page stack
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        // Navigate to the second page and then to a third page
        await new Promise((resolve) => {
            this.oNavContainer.attachEventOnce("afterNavigate", resolve);
            this.oNavContainer.to("errorHandlingPage2");
        });
        await new Promise((resolve) => {
            this.oNavContainer.attachEventOnce("afterNavigate", resolve);
            this.oNavContainer.to("errorHandlingPage3");
        });

        // Assert pre-conditions
        const oPage3 = this.oNavContainer.getPage("errorHandlingPage3");
        assert.strictEqual(this.oNavContainer.getCurrentPage(), oPage3, "Pre-condition: Current page is Page 3");
        assert.strictEqual(this.oNavContainer._pageStack.length, 3, "Pre-condition: Page stack has 3 pages");
        assert.ok(!!oPage3.getDomRef(), "Pre-condition: Page 3 is rendered in the DOM");

        // Act
        // Remove Page 3 from the NavContainer
        this.oNavContainer.removePage(oPage3);
        await nextUIUpdate(); // Wait for DOM changes to be reflected

        // Assert
        const oPage2 = this.oNavContainer.getPage("errorHandlingPage2");
        assert.strictEqual(this.oNavContainer.getCurrentPage(), oPage2, "Should automatically navigate back to Page 2");
        assert.ok(oPage2.$().is(":visible"), "The new current page (Page 2) should now be visible");
        assert.strictEqual(this.oNavContainer._pageStack.length, 2, "Page stack should now contain only 2 pages");
        assert.strictEqual(oPage3.bIsDestroyed, undefined, "The removed page control itself should not be destroyed");
        assert.strictEqual(this.oContainer.querySelector("#" + oPage3.getId()), null, "DOM of the removed page should be cleaned up");

        fnDone();
    });

    // Module: Accessibility and Focus Management
    QUnit.module("Accessibility and Focus Management", {
        beforeEach: function () {
            this.oButton1 = new Button("focusBtn1", { text: "Button 1" });
            this.oButton2 = new Button("focusBtn2", { text: "Button 2" });

            this.oPage1 = createTestPage("focusPage1", "Focus Page 1", [this.oButton1]);
            this.oPage2 = createTestPage("focusPage2", "Focus Page 2", [this.oButton2]);

            this.oNavContainer = new NavContainer({
                pages: [this.oPage1, this.oPage2],
                initialPage: this.oPage1.getId()
            });

            this.oContainer = createTestContainer("test-focus-container");
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }
            if (this.oButton1) {
                this.oButton1.destroy();
                this.oButton1 = null;
            }
            if (this.oButton2) {
                this.oButton2.destroy();
                this.oButton2 = null;
            }
            if (this.oPage1) {
                this.oPage1.destroy();
                this.oPage1 = null;
            }
            if (this.oPage2) {
                this.oPage2.destroy();
                this.oPage2 = null;
            }

            cleanupTestContainer(this.oContainer);
        }
    });

    QUnit.test("Should enhance pages accessibility with aria-hidden", async function (assert) {
        // Arrange
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        // Act
        this.oNavContainer.enhancePagesAccessibility();

        // Assert
        assert.strictEqual(!!this.oPage1.$().attr("aria-hidden"), false, "Current page should not have aria-hidden");

        // Navigate and test again
        const fnDone = assert.async();
        this.oNavContainer.attachAfterNavigate(() => {
            assert.strictEqual(this.oPage1.$().attr("aria-hidden"), "true", "Previous page should have aria-hidden");
            assert.strictEqual(!!this.oPage2.$().attr("aria-hidden"), false, "Current page should not have aria-hidden");
            fnDone();
        });

        this.oNavContainer.to("focusPage2");
    });

    QUnit.test("Should respect autoFocus disabled setting", async function (assert) {
        // Arrange
        const fnDone = assert.async();
        this.oNavContainer.setAutoFocus(false);
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        const focusedElement = document.activeElement;

        this.oNavContainer.attachAfterNavigate(() => {
            // Assert
            assert.strictEqual(document.activeElement, focusedElement, "Focus should not change when autoFocus is disabled");
            fnDone();
        });

        // Act
        this.oNavContainer.to("focusPage2");
    });

    // Module: Integration and Real-world Scenarios
    QUnit.module("Integration and Real-world Scenarios", {
        beforeEach: function () {
            this.aPages = [];
            for (let i = 1; i <= 5; i++) {
                this.aPages.push(createTestPage("integrationPage" + i, "Integration Page " + i));
            }

            this.oNavContainer = new NavContainer({
                pages: this.aPages,
                initialPage: this.aPages[0].getId()
            });

            this.oContainer = createTestContainer("test-integration-container");
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }

            this.aPages.forEach((oPage) => {
                if (oPage) {
                    oPage.destroy();
                }
            });
            this.aPages = [];

            cleanupTestContainer(this.oContainer);
        }
    });

    QUnit.test("Should handle complex navigation sequence", async function (assert) {
        const fnDone = assert.async();
        const expectedSequence = ["integrationPage2", "integrationPage3", "integrationPage2", "integrationPage1"];
        const actualSequence = [];
        let navigationCount = 0;

        // Render the NavContainer first
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        this.oNavContainer.attachAfterNavigate((oEvent) => {
            actualSequence.push(oEvent.getParameter("toId"));
            navigationCount++;

            // Execute the next navigation based on current count
            if (navigationCount === 1) {
                // After first navigation (to page2), go to page3
                this.oNavContainer.to("integrationPage3");
            } else if (navigationCount === 2) {
                // After second navigation (to page3), go back to page2
                this.oNavContainer.back();
            } else if (navigationCount === 3) {
                // After third navigation (back to page2), go back to top
                this.oNavContainer.backToTop();
            } else if (navigationCount === 4) {
                // All navigations complete - assert results
                assert.strictEqual(actualSequence.length, 4, "Should have completed 4 navigations");
                assert.deepEqual(actualSequence, expectedSequence, "Navigation sequence should be correct");
                assert.strictEqual(this.oNavContainer.getCurrentPage(), this.aPages[0], "Should end at initial page");
                assert.strictEqual(this.oNavContainer.currentPageIsTopPage(), true, "Should be at top page");
                fnDone();
            }
        });

        // Start the navigation sequence
        this.oNavContainer.to("integrationPage2");
    });

    QUnit.test("Should handle navigation with data passing", async function (assert) {
        const fnDone = assert.async();
        const testData = { userId: 123, mode: "edit" };
        const backData = { saved: true };
        let forwardDataReceived = null;
        let backDataReceived = null;

        // Render the NavContainer first
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        // Add delegate to capture data - we need to check both pages since back navigation
        // triggers events on the page we're navigating back to
        const oDelegate = {
            onBeforeShow: function (oEvent) {
                // For forward navigation, data is in oEvent.data
                if (oEvent.data && Object.keys(oEvent.data).length > 0) {
                    forwardDataReceived = oEvent.data;
                }
                // For back navigation, backData is in oEvent.backData
                if (oEvent.backData && Object.keys(oEvent.backData).length > 0) {
                    backDataReceived = oEvent.backData;
                }
            }
        };

        // Add delegate to the first page (where we navigate back to)
        this.aPages[0].addEventDelegate(oDelegate);
        // Also add to second page to capture forward navigation
        this.aPages[1].addEventDelegate(oDelegate);

        this.oNavContainer.attachAfterNavigate((oEvent) => {
            if (oEvent.getParameter("isBack")) {
                // Assert back navigation data
                assert.deepEqual(forwardDataReceived, testData, "Forward data should be passed correctly");
                assert.deepEqual(backDataReceived, backData, "Back data should be passed correctly");
                assert.strictEqual(backDataReceived.saved, true, "Back data property should be correct");
                fnDone();
            } else {
                // Forward navigation completed - now trigger back with data
                assert.deepEqual(forwardDataReceived, testData, "Forward data should be received");
                this.oNavContainer.back(backData);
            }
        });

        // Start navigation with data
        this.oNavContainer.to("integrationPage2", "show", testData);
    });

    // Module: Stress and Advanced Scenarios
    QUnit.module("Stress and Advanced Scenarios", {
        beforeEach: function () {
            this.oPage1 = createTestPage("stressPage1", "Stress Page 1");
            this.oPage2 = createTestPage("stressPage2", "Stress Page 2");
            this.oPage3 = createTestPage("stressPage3", "Stress Page 3");

            this.oNavContainer = new NavContainer({
                pages: [this.oPage1, this.oPage2, this.oPage3],
                initialPage: this.oPage1.getId()
            });

            this.oContainer = createTestContainer("test-stress-container");
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
                this.oNavContainer = null;
            }
            if (this.oPage1) {
                this.oPage1.destroy();
                this.oPage1 = null;
            }
            if (this.oPage2) {
                this.oPage2.destroy();
                this.oPage2 = null;
            }
            if (this.oPage3) {
                this.oPage3.destroy();
                this.oPage3 = null;
            }

            cleanupTestContainer(this.oContainer);
        }
    });

    QUnit.test("Should handle navigation interrupted by rerendering", async function (assert) {
        // Arrange
        const fnDone = assert.async();
        const navigationOrder = [];
        this.oNavContainer.placeAt(this.oContainer.id);
        await nextUIUpdate();

        // Attach a listener to track the order of completed navigations
        this.oNavContainer.attachAfterNavigate((oEvent) => {
            navigationOrder.push(oEvent.getParameter("toId"));

            // When the final navigation is complete, run assertions
            if (navigationOrder.length === 2 && navigationOrder[1] === "stressPage3") {
                // Assert
                assert.deepEqual(navigationOrder, ["stressPage2", "stressPage3"], "Navigations should complete in the correct order");
                assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage3, "Final current page should be correct");
                assert.strictEqual(this.oNavContainer._pageStack.length, 3, "Page stack should have the correct number of entries");
                fnDone();
            }
        });

        // Act
        // 1. Start the first navigation but DO NOT await it yet.
        this.oNavContainer.to("stressPage2", "slide");

        // 2. Immediately trigger an invalidation while the first animation is running.
        this.oNavContainer.invalidate();
        await nextUIUpdate(); // Force the render queue to process the invalidation.

        // 3. Immediately queue a second navigation. The NavContainer should handle this gracefully.
        this.oNavContainer.to("stressPage3", "slide");
    });

    // Module: Integration Scenarios
    QUnit.module("Integration Scenarios", {
        beforeEach: function () {
            this.oPage1 = createTestPage("integrationPage1", "Integration Page 1");
            this.oPage2 = createTestPage("integrationPage2", "Integration Page 2", [
                new Button("btnInPage2", { text: "Focusable" })
            ]);

            this.oNavContainer = new NavContainer({
                pages: [this.oPage1, this.oPage2],
                initialPage: this.oPage1.getId()
            });

            this.oDialog = new Dialog("testDialog", {
                title: "NavContainer in Dialog",
                content: [this.oNavContainer],
                stretch: true,
                endButton: new Button({
                    text: "Close",
                    press: () => {
                        this.oDialog.close();
                    }
                })
            });

            this.oContainer = createTestContainer("test-integration-container");
        },
        afterEach: function () {
            this.oDialog.destroy(); // NavContainer and Pages will be destroyed as they are aggregated
            cleanupTestContainer(this.oContainer);
        }
    });

    QUnit.test("Should navigate correctly when placed inside a sap.m.Dialog", function (assert) {
        // Arrange
        const fnDone = assert.async();

        this.oDialog.attachEventOnce("afterOpen", () => {
            // Assert: Initial state inside the dialog
            assert.ok(this.oDialog.isOpen(), "Dialog should be open");
            assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage1, "Initial page inside dialog is correct");

            // Arrange: Attach listener for the navigation we are about to trigger
            this.oNavContainer.attachEventOnce("afterNavigate", (oEvent) => {
                // Assert: Final state after navigation
                assert.strictEqual(oEvent.getParameter("toId"), "integrationPage2", "afterNavigate event fired for the correct page");
                assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage2, "Current page is correctly updated to Page 2");

                // Assert focus management - very important for popups
                const oDialogDomRef = this.oDialog.getDomRef();
                assert.ok(oDialogDomRef.contains(document.activeElement), "Focus should remain within the Dialog after navigation");

                // Cleanup and finish
                this.oDialog.close();
                fnDone();
            });

            // Act: Trigger navigation inside the dialog
            this.oNavContainer.to("integrationPage2");
        });

        // Act: Open the dialog
        this.oDialog.open();
    });

    QUnit.test("Should navigate correctly when placed inside a sap.m.Popover", async function (assert) {
        // Arrange
        // Create a NavContainer inside a Popover
        const oNavContainerForPopover = new NavContainer({
            width: "250px",
            height: "300px",
            pages: [
                createTestPage("popoverPage1", "Popover Page 1", [
                    new Button({ text: "Button on Popover Page 1" })
                ]),
                createTestPage("popoverPage2", "Popover Page 2", [
                    new Button({ text: "Button on Popover Page 2" })
                ])
            ]
        });

        const oPopover = new Popover({
            title: "NavContainer in Popover",
            content: [oNavContainerForPopover],
            modal: true // Make popover modal to prevent auto-close on focus loss
        });

        // Create a button to open the Popover
        const oOpeningButton = new Button({
            text: "Open Popover"
        }).placeAt(this.oContainer.id);

        await nextUIUpdate();

        const afterNavigatePromise = new Promise((resolve) => {
            oNavContainerForPopover.attachEventOnce("afterNavigate", resolve);
        });

        const afterOpenPromise = new Promise((resolve) => {
            oPopover.attachEventOnce("afterOpen", resolve);
        });

        // Act: Open the Popover
        oPopover.openBy(oOpeningButton);
        await afterOpenPromise;

        // Assert: Initial state
        assert.ok(oPopover.isOpen(), "Popover should be open");
        assert.strictEqual(oNavContainerForPopover.getCurrentPage().getId(), "popoverPage1", "Initial page is correct");

        // Act: Trigger navigation
        oNavContainerForPopover.to("popoverPage2");
        await afterNavigatePromise;

        // Assert: Final state after navigation
        assert.strictEqual(oNavContainerForPopover.getCurrentPage().getId(), "popoverPage2", "Navigation to Page 2 is successful");

        const oPopoverDomRef = oPopover.getDomRef();
        assert.ok(oPopoverDomRef, "Popover should still be in the DOM");

        // Check if the Popover is still visible before asserting focus, as it might auto-close in some test environments.
        if (oPopover.$().is(":visible") && document.activeElement) {
            assert.ok(oPopoverDomRef.contains(document.activeElement), "Focus should remain within the Popover");
        }

        // Cleanup
        oPopover.close();
    });

    // Module: Stress Tests - Interrupted Navigation
    QUnit.module("Stress Tests - Interrupted Navigation", {
        beforeEach: function () {
            this.oPage1 = createTestPage("stressPage1", "Stress Page 1");
            this.oPage2 = createTestPage("stressPage2", "Stress Page 2");
            this.oPage3 = createTestPage("stressPage3", "Stress Page 3");

            this.oNavContainer = new NavContainer({
                pages: [this.oPage1, this.oPage2, this.oPage3],
                initialPage: this.oPage1.getId()
            });

            this.oContainer = createTestContainer("test-stress-container");

            /**
             * A reusable helper function to test navigation that is interrupted by a rerendering.
             * @param {object} assert The QUnit assert object.
             * @param {object} options Configuration for the test.
             * @param {string} options.transitionName The name of the transition to test (e.g., "slide", "fade").
             * @returns {Promise} A promise that resolves when the test is complete.
             */
            this.testInterruptedNavigation = async function (assert, options) {
                const { transitionName } = options;
                const navigationOrder = [];
                const RENDER_TIMEOUT = 3000; // Increased timeout for complex async stress tests.
                let resolvePromise; // Declare resolve function in outer scope

                // Use a promise to handle the asynchronous flow of multiple navigations.
                const testPromise = new Promise((resolve) => {
                    resolvePromise = resolve; // Store resolve function in outer scope

                    // Arrange
                    this.oNavContainer.attachAfterNavigate((oEvent) => {
                        navigationOrder.push(oEvent.getParameter("toId"));

                        // This event will fire twice. We resolve the promise after the second navigation is complete.
                        if (navigationOrder.length === 2) {
                            resolve();
                        }
                    });
                });

                // 1. Place the control in the DOM and wait for the initial rendering.
                this.oNavContainer.placeAt(this.oContainer.id);
                await nextUIUpdate();

                // Act
                // 2. Start the first navigation but DO NOT await it. This lets the animation start
                //    while our test code continues to execute.
                this.oNavContainer.to("stressPage2", transitionName);

                // 3. Immediately trigger an invalidation to interrupt the ongoing animation.
                this.oNavContainer.invalidate();

                // 4. Immediately queue a second navigation. The NavContainer should handle this
                //    gracefully after the rerendering is complete.
                this.oNavContainer.to("stressPage3", transitionName);

                // Set a timeout to fail the test if the promise doesn't resolve.
                const aTimeout = setTimeout(() => {
                    assert.ok(false, `Test timed out after ${RENDER_TIMEOUT}ms for transition '${transitionName}'.`);
                    resolvePromise(); // Now resolve is accessible
                }, RENDER_TIMEOUT);

                // Wait for both navigations to complete.
                await testPromise;
                clearTimeout(aTimeout);

                // Assert
                assert.deepEqual(navigationOrder, ["stressPage2", "stressPage3"], `Navigations should complete in the correct order for '${transitionName}' transition.`);
                assert.strictEqual(this.oNavContainer.getCurrentPage(), this.oPage3, "The final current page should be correct.");
                assert.strictEqual(this.oNavContainer._pageStack.length, 3, "The page stack should have the correct number of entries.");
                assert.notOk(this.oNavContainer._bNavigating, "The internal '_bNavigating' flag should be reset to false.");
            };
        },
        afterEach: function () {
            if (this.oNavContainer) {
                this.oNavContainer.destroy();
            }
            // Pages are destroyed with the NavContainer.
            cleanupTestContainer(this.oContainer);
        }
    });

    // Now, use the helper function to create tests for each transition type.
    QUnit.test("Should handle 'slide' navigation interrupted by rerendering", async function (assert) {
        await this.testInterruptedNavigation(assert, { transitionName: "slide" });
    });

    QUnit.test("Should handle 'fade' navigation interrupted by rerendering", async function (assert) {
        await this.testInterruptedNavigation(assert, { transitionName: "fade" });
    });

    QUnit.test("Should handle 'flip' navigation interrupted by rerendering", async function (assert) {
        await this.testInterruptedNavigation(assert, { transitionName: "flip" });
    });

    QUnit.test("Should handle 'show' navigation interrupted by rerendering", async function (assert) {
        // The "show" transition is instant, but the principle of interrupting the
        // internal navigation state is the same.
        await this.testInterruptedNavigation(assert, { transitionName: "show" });
    });
});