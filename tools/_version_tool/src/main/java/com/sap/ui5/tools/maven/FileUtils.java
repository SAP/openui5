/*
 * Copyright 2017 by SAP SE, Walldorf., http://www.sap.com.
 * All rights reserved. Use is subject to license terms.
 * This software is the confidential and proprietary information
 * of SAP SE, Walldorf. You shall not disclose such confidential
 * information and shall use it only in accordance with the terms
 * of the license agreement you entered into with SAP.
 */
package com.sap.ui5.tools.maven;

import java.io.File;
import java.io.IOException;

import junit.framework.Assert;


public class FileUtils {
  public static void copyDir(File src, File dest) throws IOException {
    File[] children = src.listFiles();
    if (children != null) {
      if (!dest.exists())
        dest.mkdirs();
      for (File child : children) {
        File destChild = new File(dest, child.getName());
        if (child.isDirectory()) {
          copyDir(child, destChild);
        } else {
          String encoding = MyReleaseButton.UTF8;
          if ("MANIFEST.MF".equals(child.getName())) {
            encoding = MyReleaseButton.ISO_8859_1;
          }
          CharSequence in = MyReleaseButton.readFile(child, encoding);
          MyReleaseButton.writeFile(destChild, in.toString(), encoding);
        }
      }
    }
  }


  public static void compareDir(File source, File expected, File actual) throws IOException {
    File[] children = source.listFiles();
    if (children != null) {
      for (File sourceChild : children) {
        File expectedChild = new File(expected, sourceChild.getName());
        File actualChild = new File(actual, sourceChild.getName());
        if (sourceChild.isDirectory()) {
          compareDir(sourceChild, expectedChild, actualChild);
        } else {
          String encoding = MyReleaseButton.UTF8;
          if ("MANIFEST.MF".equals(expectedChild.getName())) {
            encoding = MyReleaseButton.ISO_8859_1;
          }
          Assert.assertTrue("expected content must have been defined for " + source.getName(), expectedChild.exists());
          String expectedContent = MyReleaseButton.readFile(expectedChild, encoding).toString();
          String actualContent = MyReleaseButton.readFile(actualChild, encoding).toString();
          Assert.assertEquals("mismatch in content of " + expectedChild.getName(), expectedContent, actualContent);
        }
      }
    }
  }
  
  public static void compare(String scenario) throws IOException {
    compare(scenario, new File("src/test/resources/input/common"));
  }


  public static void compare(String scenario, File src) throws IOException {
    File expected = new File("src/test/resources/expected", scenario);
    File actual = new File("target/tests", scenario);
    compareDir(src, expected, actual);
  }

}
