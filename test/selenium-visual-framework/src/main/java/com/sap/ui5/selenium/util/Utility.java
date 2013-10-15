package com.sap.ui5.selenium.util;

import java.awt.AWTException;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.Rectangle;
import java.awt.Robot;
import java.awt.image.BufferedImage;
import java.awt.image.WritableRaster;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Collection;

import javax.imageio.ImageIO;

import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Point;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.internal.Killable;

public class Utility {

	/** API: Compare two images and highlight the differ image  <br>
	 *  If fileDiff is null, will not produce differ image  <br>
	 *  If fileDiff is not null, the differ image with RED highlight <br>
	 *  "colorDistance", it means that the distance(difference) of two color can be acceptable. if set 0, then color must be completely same. The value should > = 0; <br>
	 *  "pixelThreshold", it means that how many the unmatched pixels can be acceptable. if set 0, only all pixels are same, return TRUE. The value should > = 0; <br>
	 *  If dimensions of two images are different, then return FALSE and the differ image is merged by two original images. <br>
	 * */
	public static boolean imageComparer(File fileA, File fileB, File fileDiff, int colorDistance, int pixelThreshold, StringBuilder resultMessage) throws Exception {
		final String diffImageFormat = Constants.IMAGE_TYPE;

		// Make sure if save differ image
		boolean isSaveDiff;
		if (fileDiff == null) {
			isSaveDiff = false;
		} else {
			isSaveDiff = true;
		}

		// Read Image data form file
		BufferedImage biA = ImageIO.read(fileA);
		int heightA = biA.getHeight();
		int widthA = biA.getWidth();

		BufferedImage biB = ImageIO.read(fileB);
		int heightB = biB.getHeight();
		int widthB = biB.getWidth();

		// Create a differ image if image dimension is the same
		WritableRaster rasterA = biA.copyData(null);
		BufferedImage diff = new BufferedImage(biA.getColorModel(), rasterA, biA.isAlphaPremultiplied(), null);

		// Create a differ image if image dimension is different
		// The differ image should be merged by two images
		int border = 30; // Separate two image on one merged image
		BufferedImage mergedDiffImage = new BufferedImage(Math.max(widthA, widthB), (heightA + heightB + border), biA.getType());
		Graphics mergedDiffGraphic = mergedDiffImage.createGraphics();

		mergedDiffGraphic.drawImage(biA, 0, 0, null); // Draw 1st image

		for (int i = 0; i < border; i++) {
			mergedDiffGraphic.drawLine(0, heightA + i, Math.max(widthA, widthB), heightA + i);
		}

		mergedDiffGraphic.drawImage(biB, 0, heightA + border, null); // Draw 2nd image

		// Return message by StringBuilder "resultMessage"
		String newLine = "\n";
		resultMessage.append("Image A Height: " + biA.getHeight() + "  Image A Width: " + biA.getWidth() + newLine);
		resultMessage.append("Image B Height: " + biB.getHeight() + "  Image B Width: " + biB.getWidth() + newLine);
		resultMessage.append("Image A Color Bit Depth: " + biA.getColorModel().getPixelSize() + newLine);
		resultMessage.append("Image B Color Bit Depth: " + biB.getColorModel().getPixelSize() + newLine);

		// Check images dimension(height, width)
		if ((heightA * widthA) != (heightB * widthB)) {
			resultMessage.insert(0, "The Images demension is different!" + newLine);
			resultMessage.insert(0, "FALSE" + newLine);

			if (isSaveDiff) {
				ImageIO.write(mergedDiffImage, diffImageFormat, fileDiff);
			}

			return false;
		}

		int realPixelThreshold = 0;
		for (int h = 0; h < heightA; h++) {
			for (int w = 0; w < widthA; w++) {

				int realColorDistance = Math.abs(biA.getRGB(w, h) - biB.getRGB(w, h));
				if (realColorDistance > colorDistance) {

					// Highlight Differ part
					diff.setRGB(w, h, Color.RED.getRGB());
					realPixelThreshold++;
				}

			}
		}

		if (realPixelThreshold > pixelThreshold) {

			resultMessage.insert(0, "Real unmatch pixel number is " + realPixelThreshold + "  (Threshold=" + pixelThreshold + ")" + newLine);
			resultMessage.insert(0, "The Images pixels is difference!" + newLine);
			resultMessage.insert(0, "FALSE" + newLine);

			if (isSaveDiff) {

				ImageIO.write(diff, diffImageFormat, fileDiff);

			}

			return false;
		}

		resultMessage.insert(0, "Real unmatch pixel number is " + realPixelThreshold + "  (Threshold=" + pixelThreshold + ")" + newLine);
		resultMessage.insert(0, "Images are matched!" + newLine);
		resultMessage.insert(0, "TRUE" + newLine);

		return true;
	}

	/** API: Take full Screen Shot */
	public static boolean takeScreenShot(WebDriver driver, String filePath) {

		byte[] file = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);

		FileOutputStream out = null;

		try {
			out = new FileOutputStream(filePath);
			out.write(file);

		} catch (Exception e) {

			e.printStackTrace();
			return false;
		} finally {
			if (out != null) {
				try {
					out.close();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}

		return true;
	}

	/** Get Robot */
	private static Robot getRobot() throws AWTException {
		Robot robot = new Robot();
		robot.setAutoDelay(500);
		return robot;
	}

	/** API: Take a snaps shot in specific location and dimension. */
	public static boolean takeSnapShot(Point location, Dimension dimension, String filePath) {

		Robot robot;
		try {
			robot = getRobot();

			BufferedImage image = robot.createScreenCapture(new Rectangle(location.x, location.y, dimension.width, dimension.height));
			ImageIO.write(image, Constants.IMAGE_TYPE, new File(filePath));

		} catch (Exception e) {

			e.printStackTrace();

			return false;
		}

		return true;
	}

	/** Check target value<String> is existing in the collection */
	public static boolean isValueInCollection(String targetValue, Collection<String> collection) {

		for (String item : collection) {
			if (targetValue.equalsIgnoreCase(item)) {

				return true;
			}
		}
		return false;
	}

	/** Move and replace files */
	public static void moveFile(File source, File target) {

		if (target.exists()) {
			target.delete();
		}
		source.renameTo(target);
	}

	/** Delete File */
	public static void deleteFile(File file) {

		if (file != null && file.exists()) {
			file.delete();
		}
	}

	/** Kill WebDriver process on OS */
	public static void killWebDriver(WebDriver driver, int browserType) {

		if (driver != null) {
			driver.quit();
		}

		switch (browserType) {

		case Constants.FIREFOX:
			if (driver != null) {
				((Killable) driver).kill();
			}
			executeOnWindows("taskkill  /IM  firefox.exe /T /F");
			System.out.println("Success to clean Firefox WebDriver.");
			return;

		case Constants.IE8:
		case Constants.IE9:
		case Constants.IE10:
			executeOnWindows("taskkill  /IM  iexplore.exe /T /F");
			executeOnWindows("taskkill  /IM  IEDriverServer.exe /T /F");
			executeOnWindows("taskkill  /IM  WerFault.exe /T /F");
			System.out.println("Success to clean IE WebDriver.");
			return;

		case Constants.CHROME:
			executeOnWindows("taskkill  /IM  chrome.exe /T /F");
			executeOnWindows("taskkill  /IM  chromedriver.exe /T /F");
			System.out.println("Success to clean Chrome WebDriver.");
			return;
		}

	}

	/** Execute command on Windows OS */
	public static boolean executeOnWindows(String command) {

		try {
			Runtime.getRuntime().exec(command);
			Sleeper.sleepTightInSeconds(3);
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}

		return true;
	}
}
