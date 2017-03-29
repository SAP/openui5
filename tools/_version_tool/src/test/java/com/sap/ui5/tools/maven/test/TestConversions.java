package com.sap.ui5.tools.maven.test;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

import junit.framework.Assert;

import org.junit.Test;

import com.sap.ui5.tools.maven.MyReleaseButton;
import com.sap.ui5.tools.maven.MyReleaseButton.ReleaseOperation;
import com.sap.ui5.tools.maven.FileUtils;

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

  private String setup(String scenario) throws IOException {
    return setup(scenario, new File("src/test/resources/input/common"));
  }


  private String setup(String scenario, File src) throws IOException {
    File dest = new File("target/tests", scenario);
    dest.mkdirs();
    FileUtils.copyDir(src, dest);
    return dest.getAbsolutePath();
  }

  @Test
  public void testSnapshotToRelease() throws Exception {
    final String scenario = "SnapshotToRelease";
    String destPath = setup(scenario);
    MyReleaseButton.setRelOperation(ReleaseOperation.PatchRelease);
    MyReleaseButton.main(new String[] { destPath, "0.10.0-SNAPSHOT", "0.10.0", "rel-0.10" });
    FileUtils.compare(scenario);
  }


  @Test
  public void testReleaseToSnapshot() throws Exception {
    final String scenario = "ReleaseToSnapshot";
    String destPath = setup(scenario);
    MyReleaseButton.setRelOperation(ReleaseOperation.PatchRelease);
    MyReleaseButton.main(new String[] { destPath, "0.10.0-SNAPSHOT", "0.10.0", "rel-0.10"  });
    MyReleaseButton.setRelOperation(ReleaseOperation.MilestoneDevelopment);
    MyReleaseButton.main(new String[] { destPath, "0.10.0", "0.11.0-SNAPSHOT", "rel-0.10" });
    FileUtils.compare(scenario);
  }


  @Test
  public void testSnapshotToAlpha() throws Exception {
    final String scenario = "SnapshotToAlpha";
    String destPath = setup(scenario);
    MyReleaseButton.setRelOperation(ReleaseOperation.PatchRelease);
    MyReleaseButton.main(new String[] { destPath, "0.10.0-SNAPSHOT", "0.10.0-alpha-1", "rel-0.10" });
    FileUtils.compare(scenario);
  }


  @Test
  public void testAlphaToSnapshot() throws Exception {
    final String scenario = "AlphaToSnapshot";
    String destPath = setup(scenario);
    MyReleaseButton.setRelOperation(ReleaseOperation.PatchRelease);
    MyReleaseButton.main(new String[] { destPath, "0.10.0-SNAPSHOT", "0.10.0-alpha-1",  "rel-0.10" });
    MyReleaseButton.main(new String[] { destPath, "0.10.0-alpha-1", "0.11.0-SNAPSHOT",  "rel-0.10" });
    FileUtils.compare(scenario);
  }


  @Test
  public void testContributorsVersions() throws Exception {
    final String scenario = "ContributorsVersions";
    File src = new File("src/test/resources/input", scenario);
    String destPath = setup(scenario, src);
    Properties contributorsVersions = new Properties();
    contributorsVersions.put("com.sap.ui5:core", "1.22.8");
    contributorsVersions.put("contributorsRange", "[1.22.0-SNAPSHOT, 1.23.0-SNAPSHOT)");
    MyReleaseButton.setRelOperation(ReleaseOperation.PatchDevelopment);
    MyReleaseButton.updateVersion(new File(destPath), "1.22.9", "1.22.9-SNAPSHOT", contributorsVersions, null, "rel-1.22");
    FileUtils.compare(scenario, src);
  }

}
