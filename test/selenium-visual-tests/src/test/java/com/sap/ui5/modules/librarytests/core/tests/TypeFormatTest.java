package com.sap.ui5.modules.librarytests.core.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.core.pages.TypeFormatPO;
import com.sap.ui5.selenium.common.TestBase;

public class TypeFormatTest extends TestBase {

	private TypeFormatPO page;

	private final int timeOutSeconds = 500;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/core/visual/TypeFormat.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, TypeFormatPO.class);
		loadPage(targetUrl);
	}

	/** Verify full Page UI and all element initial UI */
	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	/** Verify format in different locales. */
	@Test
	public void testCheckFormat() {

		String enUSText = page.en_US.getText();
		String zhCNText = page.zh_CN.getText();
		String ruRUText = page.ru_RU.getText();
		String heILText = page.he_IL.getText();
		String xxXXText = page.xx_XX.getText();

		// Verify en_US local
		page.en_US.click();
		this.waitForElement(driver, true, page.en_US.getAttribute("id"), timeOutSeconds);
		verifyElement(page.dateFormatID, "CheckDateFormat-" + enUSText);
		verifyElement(page.timeFormatID, "CheckTimeFormat-" + enUSText);
		verifyElement(page.datetimeFormatID, "CheckDateTimeFormat-" + enUSText);
		verifyElement(page.numberFormatID, "CheckNumberFormat-" + enUSText);

		// Verify zh_CN local
		page.zh_CN.click();
		this.waitForElement(driver, true, page.zh_CN.getAttribute("id"), timeOutSeconds);
		verifyElement(page.dateFormatID, "CheckDateFormat-" + zhCNText);
		verifyElement(page.timeFormatID, "CheckTimeFormat-" + zhCNText);
		verifyElement(page.datetimeFormatID, "CheckDateTimeFormat-" + zhCNText);
		verifyElement(page.numberFormatID, "CheckNumberFormat-" + zhCNText);

		// Verify ru_RU local
		page.ru_RU.click();
		this.waitForElement(driver, true, page.ru_RU.getAttribute("id"), timeOutSeconds);
		verifyElement(page.dateFormatID, "CheckDateFormat-" + ruRUText);
		verifyElement(page.timeFormatID, "CheckTimeFormat-" + ruRUText);
		verifyElement(page.datetimeFormatID, "CheckDateTimeFormat-" + ruRUText);
		verifyElement(page.numberFormatID, "CheckNumberFormat-" + ruRUText);

		// Verify he_IL local
		page.he_IL.click();
		this.waitForElement(driver, true, page.he_IL.getAttribute("id"), timeOutSeconds);
		verifyElement(page.dateFormatID, "CheckDateFormat-" + heILText);
		verifyElement(page.timeFormatID, "CheckTimeFormat-" + heILText);
		verifyElement(page.datetimeFormatID, "CheckDateTimeFormat-" + heILText);
		verifyElement(page.numberFormatID, "CheckNumberFormat-" + heILText);

		page.xx_XX.click();
		this.waitForElement(driver, true, page.xx_XX.getAttribute("id"), timeOutSeconds);
		verifyElement(page.dateFormatID, "CheckDateFormat-" + xxXXText);
		verifyElement(page.timeFormatID, "CheckTimeFormat-" + xxXXText);
		verifyElement(page.datetimeFormatID, "CheckDateTimeFormat-" + xxXXText);
		verifyElement(page.numberFormatID, "CheckNumberFormat-" + xxXXText);
	}
}
