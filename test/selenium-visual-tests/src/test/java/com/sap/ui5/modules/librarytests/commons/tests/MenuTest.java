package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;
import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.MenuPO;
import com.sap.ui5.selenium.common.TestBase;

public class MenuTest extends TestBase {

	private MenuPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/Menu.html";

	@Before
	public void setUp() {
		logTestStart();
		page = PageFactory.initElements(driver, MenuPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	@Test
	public void testMouseOverAction() {
		String menuItemId = null;
		String subMenuItemId = null;

		// ------------ Mouse over on MenuItems for Menu with first item unselected --------------
		page.clickElement(driver, userAction, page.MenuMouseBtn, page.menu1, true, this);
		verifyPage("Mouse-Opened-MouseMenu");

		menuItemId = page.menuitem11txtId;
		waitForReady(page.millisecond);

		// Avoid twinkle of item on IE9.
		userAction.mouseMove(driver, menuItemId);
		verifyElement(page.menu1, "Mouse-MouseMenu-mouseOver-" + menuItemId);

		menuItemId = page.menuitem12txtId;

		// Avoid twinkle of item on IE9.
		userAction.mouseMove(driver, menuItemId);
		userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_A);
		waitForReady(page.millisecond);
		verifyElement(page.menu1, "Mouse-MouseMenu-mouseOver-" + menuItemId);

		menuItemId = page.menuitem13txtId;
		userAction.mouseMove(driver, menuItemId);
		verifyElement(page.menu1, "Mouse-MouseMenu-mouseOver-" + menuItemId);

		waitForElement(driver, true, page.menu2Id, page.timeOutSeconds);
		verifyBrowserViewBox("Mouse-Opened-MouseMenu-SubMenu1");

		subMenuItemId = page.menuitem24txtId;
		userAction.mouseMove(driver, subMenuItemId);
		verifyElement(page.menu2Id, "Mouse-MouseMenu-mouseOver-" + subMenuItemId);

		waitForElement(driver, true, page.menu3Id, page.timeOutSeconds);
		verifyBrowserViewBox("Mouse-Opened-MouseMenu-SubMenu2");
	}

	@Test
	public void testClickAction() {
		String menuItemId = null;
		String subMenuItemId = null;

		// ------------ Click on MenuItems for Menu with first item unselected --------------
		page.clickElement(driver, userAction, page.MenuMouseBtn, page.menu1, true, this);

		menuItemId = page.menuitem11txtId;
		page.clickElement(driver, userAction, menuItemId, page.menu1, false, this);
		verifyElement(page.selectedMenuItemId, "MouseEvent-MouseMenu-Click-" + menuItemId);
		page.clickElement(driver, userAction, page.MenuMouseBtn, page.menu1, true, this);

		menuItemId = page.menuitem12txtId;

		// element.click() cannot work on IE9.
		userAction.mouseClick(driver, page.menuitem12tfId);

		userAction.mouseMoveToStartPoint(driver);
		userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_A);
		waitForReady(page.millisecond);
		userAction.pressOneKey(KeyEvent.VK_N);
		waitForReady(page.millisecond);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		waitForElement(driver, false, page.menu1, page.timeOutSeconds);
		verifyElement(page.selectedMenuItemId, "MouseEvent-MouseMenu-Click-" + menuItemId);
		page.clickElement(driver, userAction, page.MenuMouseBtn, page.menu1, true, this);

		menuItemId = page.menuitem13txtId;
		page.MouseOverElementByUserAction(driver, userAction, menuItemId, page.menu2Id, true, this);
		page.clickElement(driver, userAction, menuItemId, page.menu2Id, false, this);
		verifyBrowserViewBox("Mouse-MouseMenu-Click-" + menuItemId);
		page.MouseOverElementByUserAction(driver, userAction, menuItemId, page.menu2Id, true, this);

		subMenuItemId = page.menuitem24txtId;
		page.MouseOverElementByUserAction(driver, userAction, subMenuItemId, page.menu3Id, true, this);
		page.clickElement(driver, userAction, subMenuItemId, page.menu3Id, false, this);
		verifyBrowserViewBox("Mouse-MouseMenu-Click-" + subMenuItemId);

		userAction.mouseOver(driver, subMenuItemId, page.millisecond);
		userAction.mouseClick(driver, page.menuitem31Id);
		verifyElement(page.selectedMenuItemId, "MouseEvent-MouseMenu-Click-menuitem31");
	}

	@Test
	public void testKeyboardActionWithClick() {
		Actions action = new Actions(driver);
		List<WebElement> eList = page.menuItems;
		List<WebElement> subList = page.subMenu1Items;

		// ------------ ENTER/SPACE on MenuItems for Menu with first item selected --------------
		page.clickElement(driver, userAction, page.MenuKeyboardBtn, page.menu1, true, this);
		List<String> menuItemIdList = new ArrayList<String>();
		List<String> subMenuItemIdList = new ArrayList<String>();
		String menuItemId = null;
		String subMenuItemId = null;

		for (WebElement e : eList) {
			menuItemIdList.add(e.getAttribute("id"));
		}

		for (int i = 0; i < menuItemIdList.size(); i++) {
			menuItemId = menuItemIdList.get(i);
			if (menuItemId.equals("menuitem11-txt")) {
				userAction.pressOneKey(KeyEvent.VK_ENTER);
				waitForElement(driver, false, page.menu1, page.timeOutSeconds);
				verifyElement(page.selectedMenuItemId, "KBEvent-KBMenu-ENTER-" + menuItemId);
				page.clickElement(driver, userAction, page.MenuKeyboardBtn, page.menu1, true, this);
			} else if (menuItemId.equals("menuitem12-txt")) {
				action.sendKeys(Keys.DOWN).perform();
				WebElement menuitem12 = driver.findElement(By.id(page.menuitem12tfId));
				userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_A);
				if (browserIsFirefox()) {
					menuitem12.sendKeys("New Filter Value");
				} else {
					action.sendKeys("New Filter Value").perform();
				}
				userAction.pressOneKey(KeyEvent.VK_ENTER);
				waitForElement(driver, false, page.menu1, page.timeOutSeconds);
				verifyElement(page.selectedMenuItemId, "KBEvent-KBMenu-ENTER-" + menuItemId);
				page.clickElement(driver, userAction, page.MenuKeyboardBtn, page.menu1, true, this);
			} else if (menuItemId.equals("menuitem13-txt")) {
				userAction.pressOneKey(KeyEvent.VK_DOWN);
				userAction.pressOneKey(KeyEvent.VK_DOWN);
				userAction.pressOneKey(KeyEvent.VK_ENTER);
				waitForElement(driver, true, page.menu2Id, page.timeOutSeconds);
				waitForReady(page.millisecond);
				verifyPage("KBEvent-KBMenu-ENTER-" + menuItemId);

				for (WebElement element : subList) {
					subMenuItemIdList.add(element.getAttribute("id"));
				}

				for (int j = 0; j < subMenuItemIdList.size(); j++) {
					subMenuItemId = subMenuItemIdList.get(j);
					if (subMenuItemId.equals("menuitem24-txt")) {
						action.sendKeys(Keys.SPACE).perform();
						waitForElement(driver, true, page.menu3Id, page.timeOutSeconds);
						verifyElement(page.menu2Id, "KB-KBMenu-SPACE-" + subMenuItemId);
						userAction.pressOneKey(KeyEvent.VK_ENTER);
						waitForElement(driver, false, page.menu1, page.timeOutSeconds);
						verifyElement(page.selectedMenuItemId, "KBEvent-KBMenu-ENTER-menuitem31-txt");
						userAction.pressOneKey(KeyEvent.VK_SPACE);
						waitForElement(driver, true, page.menu1, page.timeOutSeconds);
					} else {
						action.sendKeys(Keys.SPACE).perform();
						verifyElement(page.menu2Id, "KB-KBMenu-SPACE-" + subMenuItemId);
						action.sendKeys(Keys.DOWN).perform();
					}
				}
			} else if (menuItemId.equals("menuitem14-txt")) {
				userAction.pressOneKey(KeyEvent.VK_UP);
				verifyPage("KB-KBMenu-UP-" + menuItemId);
				userAction.pressOneKey(KeyEvent.VK_ENTER);
				verifyPage("KB-KBMenu-ENTER-" + menuItemId);
			}
		}
	}

	@Test
	public void testKeyboardActionWithMouseOver() {
		Actions action = new Actions(driver);
		List<WebElement> eList = page.menuItems;
		List<WebElement> subList = page.subMenu1Items;

		// ------------ Mouse over on MenuItems for Menu with first item selected --------------
		page.clickElement(driver, userAction, page.MenuKeyboardBtn, page.menu1, true, this);

		for (WebElement e : eList) {
			String menuItemId = e.getAttribute("id");

			if (menuItemId.equals(page.menuitem12txtId)) {
				userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_A);
			}
			waitForReady(page.millisecond * 2);
			verifyPage("KB-KBMenu-Down-" + menuItemId);

			if (menuItemId.equals("menuitem13-txt")) {
				if (isRtlTrue()) {
					action.sendKeys(Keys.LEFT).perform();
					waitForElement(driver, true, page.menu2Id, page.timeOutSeconds);
					verifyPage("KB-Opened-KBSubMenu1-LEFT");
				} else {
					action.sendKeys(Keys.RIGHT).perform();
					waitForElement(driver, true, page.menu2Id, page.timeOutSeconds);
					verifyPage("KB-Opened-KBSubMenu1-RIGHT");
				}

				for (WebElement element : subList) {
					String subMenu1ItemId = element.getAttribute("id");

					if (subMenu1ItemId.equals("menuitem23-txt")) {
						verifyPage("KB-KBMenu-Down-" + subMenu1ItemId);

						if (isRtlTrue()) {
							action.sendKeys(Keys.LEFT).perform();
							verifyPage("KB-NotOpened-KBSubMenu2-LEFT");
						} else {
							action.sendKeys(Keys.RIGHT).perform();
							verifyPage("KB-NotOpened-KBSubMenu2-RIGHT");
						}
					} else if (subMenu1ItemId.equals("menuitem24-txt")) {
						verifyPage("KB-KBMenu-Down-" + subMenu1ItemId);

						if (isRtlTrue()) {
							action.sendKeys(Keys.LEFT).perform();
							waitForElement(driver, true, page.menu3Id, page.timeOutSeconds);
							verifyPage("KB-Opened-KBSubMenu2-LEFT");
						} else {
							action.sendKeys(Keys.RIGHT).perform();
							waitForElement(driver, true, page.menu3Id, page.timeOutSeconds);
							verifyPage("KB-Opened-KBSubMenu2-RIGHT");
						}

						action.sendKeys(Keys.ESCAPE).perform();
						waitForElement(driver, false, page.menu3Id, page.timeOutSeconds);
						verifyPage("KB-Closed-KBSubMenu2-ESCAPE");

						if (isRtlTrue()) {
							action.sendKeys(Keys.RIGHT).perform();
							waitForElement(driver, false, page.menu2Id, page.timeOutSeconds);
							verifyPage("KB-Closed-KBSubMenu1-RIGHT");
						} else {
							action.sendKeys(Keys.LEFT).perform();
							waitForElement(driver, false, page.menu2Id, page.timeOutSeconds);
							verifyPage("KB-Closed-KBSubMenu1-LEFT");
						}
					} else {
						action.sendKeys(Keys.DOWN).perform();
					}
				}
			} else if (menuItemId.equals("menuitem14-txt")) {
				if (isRtlTrue()) {
					action.sendKeys(Keys.ARROW_LEFT, Keys.UP).perform();
					verifyPage("KB-NotOpened-KBSubMenu1-LEFT");
				} else {
					action.sendKeys(Keys.ARROW_RIGHT, Keys.UP).perform();
					verifyPage("KB-NotOpened-KBSubMenu1-RIGHT");
				}
			}
			if (!menuItemId.equals(page.menuitem14txtId)) {
				action.sendKeys(Keys.DOWN).perform();
			} else {
				userAction.mouseClickStartPoint(driver);
				waitForElement(driver, false, page.menu1, page.timeOutSeconds);
				verifyPage("KB-KBMenu-ClosedByMouseClickOnContentArea");
			}
		}
	}

	@Test
	public void testDifferentStatusOfMenuItem() {
		String menuItemId = null;

		// ------------ Disabled MenuItem in Menu with first item unselected --------------
		page.clickCheckboxAndButton(driver, userAction, page.oMenuItemEnabled, page.MenuMouseBtn, this);
		verifyElement(page.menu1, "MouseMenu-Item2Disabled");

		// ------------ Disabled Menu with first item unselected --------------
		page.clickCheckboxAndButton(driver, userAction, page.oMenuEnabled, page.MenuMouseBtn, this);

		menuItemId = page.menuitem12txtId;
		userAction.mouseClick(driver, page.menuitem12lblId);
		userAction.mouseMoveToStartPoint(driver);
		verifyPage("Mouse-DisabledMouseMenu-Click-" + menuItemId);

		menuItemId = page.menuitem11txtId;
		List<WebElement> eList = page.menuItems;
		userAction.mouseClickStartPoint(driver);
		page.clickElement(driver, userAction, page.MenuMouseBtn, page.menu1, true, this);
		for (WebElement e : eList) {
			menuItemId = e.getAttribute("id");
			userAction.pressOneKey(KeyEvent.VK_DOWN);
			waitForReady(page.millisecond);
			verifyElement(page.menu1, "KB-DisabledMouseMenu-Down-" + menuItemId);
			userAction.pressOneKey(KeyEvent.VK_ENTER);
			waitForReady(page.millisecond);
			verifyElement(page.menu1, "KB-DisabledMouseMenu-Enter-" + menuItemId);
		}

		// ------------ Invisible MenuItem in Menu with first item unselected --------------
		page.clickCheckboxAndButton(driver, userAction, page.oMenuItemVisible, page.MenuMouseBtn, this);
		verifyPage("MouseMenu-Item3Invisible");

		// ------------ Enabled Menu with first item unselected --------------
		page.clickCheckboxAndButton(driver, userAction, page.oMenuEnabled, page.MenuMouseBtn, this);
		verifyPage("MouseMenu-Enabled");

		// ------------ Enabled MenuItem in Menu with first item unselected --------------
		page.clickCheckboxAndButton(driver, userAction, page.oMenuItemEnabled, page.MenuMouseBtn, this);
		verifyPage("MouseMenu-Item2Enabled");

		// ------------ Visible MenuItem in Menu with first item unselected --------------
		page.clickCheckboxAndButton(driver, userAction, page.oMenuItemVisible, page.MenuMouseBtn, this);
		verifyPage("MouseMenu-Item3Visible");
	}
}
