package com.sap.ui5.modules.librarytests.commons.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.TreePO;
import com.sap.ui5.selenium.common.TestBase;

public class TreeTest extends TestBase {

	private TreePO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/Tree.html";

	private int waitMilliseconds = 1000;

	private long timeOutSeconds = 10;

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, TreePO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	@Test
	public void testClickAction() {
		// Test click on tree1
		// Click node11. Avoid twinkle of tree node on IE9.
		userAction.mouseClick(driver, page.tree1Node11.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyNotificationArea("-Click-Node");

		// Click node111. Avoid twinkle of tree node on IE9.
		userAction.mouseClick(driver, page.tree1Node111.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(waitMilliseconds);
		verifyNotificationArea("-Click-NonSelectableNode");

		// Click node1
		page.clickNodeIcon(driver, userAction, page.tree1Node1, isRtlTrue());
		waitForElement(driver, false, page.tree1Node1.getAttribute("id") + "-children", timeOutSeconds);
		verifyNotificationArea("-CollapseNode");

		// Click node2
		page.clickNodeIcon(driver, userAction, page.tree1Node2, isRtlTrue());
		waitForElement(driver, true, page.tree1Node2.getAttribute("id") + "-children", timeOutSeconds);
		verifyNotificationArea("-ExpandNode");

		// Click node211. Avoid twinkle of tree node on IE9.
		userAction.mouseClick(driver, page.tree1Node211.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(page.tree1Id, page.tree1Id + "-Click-NonSelectableNonExpandableNode");
	}

	@Test
	public void testExpandOrCollapseAllNodes() {
		// Click collaspeAll button in tree1
		page.tree1CollapseAll.click();
		waitForElement(driver, false, page.tree1Node1.getAttribute("id") + "-children", timeOutSeconds);
		verifyElement(page.tree1ContentId, page.tree1Id + "-CollapseAll");
		verifyElement(page.notificationAreaId, "notificationArea-" + page.tree1Id + "-CollapseAll");

		// Click expandAll button in tree1
		page.tree1ExpandAll.click();
		waitForElement(driver, true, page.tree1Node1.getAttribute("id") + "-children", timeOutSeconds);
		verifyNotificationArea("-ExpandAll");
	}

	@Test
	public void testTooltip() {
		// Test toolTip on unselected Node
		showToolTip(page.tree1Node1.getAttribute("id"), waitMilliseconds);
		verifyBrowserViewBox(page.tree1Node1.getAttribute("id") + "-tooltip");

		// Test toolTip on selected Node
		showToolTip(page.tree1Node121Id, waitMilliseconds);
		verifyBrowserViewBox(page.tree1Node121Id + "-tooltip");
	}

	private void verifyNotificationArea(String imageName) {
		verifyElement(page.tree1Id, page.tree1Id + imageName);
		verifyElement(page.notificationAreaId, "notificationArea-" + page.tree1Id + imageName);
	}

}
