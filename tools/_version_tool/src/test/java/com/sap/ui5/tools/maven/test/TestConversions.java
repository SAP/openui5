package com.sap.ui5.tools.maven.test;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

import junit.framework.Assert;

import org.junit.Test;

import com.sap.ui5.tools.maven.MyReleaseButton;


/**
 * This is currently only a collection of test ideas:
 * 
 * - clean test: clean target, run generation and check the set of files that have been generated
 * - noop build: run clean, then run a build again -> must not modify any file
 * - touch behavior: run clean, touch behavior, rebuild -> single file must be regenerated
 * - touch central type: ...
 * - add a type that leads to a new interpretation of a reference
 * - remove a type 
 * - modify the global configuration (add/remove library)
 * - force: run all scenarios again: all files must be touched
 * 
 * TODO Before the tests can be written, either a mockup generator has to be build or the generator must have some
 * means to instrument it or the dependency check must be freed from its dependencies to NewGeneration (prefered)
 * 
 * @author Frank Weigel
 */
public class TestConversions {

  private static void copyDir(File src, File dest) throws IOException {
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


  private static void compareDir(File source, File expected, File actual) throws IOException {
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


  private String setup(String scenario) throws IOException {
    return setup(scenario, new File("src/test/resources/input/common"));
  }


  private String setup(String scenario, File src) throws IOException {
    File dest = new File("target/tests", scenario);
    dest.mkdirs();
    copyDir(src, dest);
    return dest.getAbsolutePath();
  }


  private void compare(String scenario) throws IOException {
    compare(scenario, new File("src/test/resources/input/common"));
  }


  private void compare(String scenario, File src) throws IOException {
    File expected = new File("src/test/resources/expected", scenario);
    File actual = new File("target/tests", scenario);
    compareDir(src, expected, actual);
  }


  @Test
  public void testSnapshotToRelease() throws Exception {
    final String scenario = "SnapshotToRelease";
    String destPath = setup(scenario);
    MyReleaseButton.main(new String[] { destPath, "0.10.0-SNAPSHOT", "0.10.0", "rel-0.10" });
    compare(scenario);
  }


  @Test
  public void testReleaseToSnapshot() throws Exception {
    final String scenario = "ReleaseToSnapshot";
    String destPath = setup(scenario);
    MyReleaseButton.main(new String[] { destPath, "0.10.0-SNAPSHOT", "0.10.0", "rel-0.10"  });
    MyReleaseButton.main(new String[] { destPath, "0.10.0", "0.11.0-SNAPSHOT", "rel-0.10" });
    compare(scenario);
  }


  @Test
  public void testSnapshotToAlpha() throws Exception {
    final String scenario = "SnapshotToAlpha";
    String destPath = setup(scenario);
    MyReleaseButton.main(new String[] { destPath, "0.10.0-SNAPSHOT", "0.10.0-alpha-1", "rel-0.10" });
    compare(scenario);
  }


  @Test
  public void testAlphaToSnapshot() throws Exception {
    final String scenario = "AlphaToSnapshot";
    String destPath = setup(scenario);
    MyReleaseButton.main(new String[] { destPath, "0.10.0-SNAPSHOT", "0.10.0-alpha-1",  "rel-0.10" });
    MyReleaseButton.main(new String[] { destPath, "0.10.0-alpha-1", "0.11.0-SNAPSHOT",  "rel-0.10" });
    compare(scenario);
  }


  @Test
  public void testContributorsVersions() throws Exception {
    final String scenario = "ContributorsVersions";
    File src = new File("src/test/resources/input", scenario);
    String destPath = setup(scenario, src);
    Properties contributorsVersions = new Properties();
    contributorsVersions.put("com.sap.ui5:core", "1.22.8");
    contributorsVersions.put("contributorsRange", "[1.22.0-SNAPSHOT, 1.23.0-SNAPSHOT)");
    MyReleaseButton.updateVersion(new File(destPath), "1.22.9", "1.22.9-SNAPSHOT", contributorsVersions, null, "rel-1.22");
    compare(scenario, src);
  }

}
