package com.sap.ui5.tools.infra.git2p4;

import com.sap.ui5.tools.maven.*;

import com.sap.ui5.tools.maven.FileUtils;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.when;
import static org.mockito.Matchers.anyVararg;
import static org.mockito.Matchers.anyObject;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import junit.framework.Assert;

import org.junit.Test;
import org.mockito.Mockito;
import org.mockito.internal.matchers.Any;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;

import com.sap.ui5.tools.infra.git2p4.commands.relnotes.ReleaseNotes;
import com.sap.ui5.tools.maven.MvnClient;
import com.sap.ui5.tools.maven.MyReleaseButton;
import com.sap.ui5.tools.maven.MyReleaseButton.ReleaseOperation;
import com.sap.ui5.tools.maven.test.TestConversions;

public class TestG2P4Main {
  public static final String PATCH_BEFORE_RELEASE = "PatchBeforeRelease";
  public static final String PATCH_AFTER_RELEASE = "PatchAfterRelease";
  public static final String DIST_PATCH_BEFORE_RELEASE = "DistPatchBeforeRelease";
  public static final String DIST_PATCH_AFTER_RELEASE = "DistPatchAfterRelease";
  public static final String MINOR_BEFORE_RELEASE = "MinorBeforeRelease";
  public static final String MINOR_AFTER_RELEASE = "MinorAfterRelease";
  public static final String DIST_MINOR_BEFORE_RELEASE = "DistMinorBeforeRelease";
  public static final String DIST_MINOR_AFTER_RELEASE = "DistMinorAfterRelease";
  public static final String UPDATE_DIST_REPACKAGE_OBJECT_IDS = "UpdateDistRepackageObjectIds";
  public static final String PATCH_DEVELOPMENT = "patch-development";
  public static final String PATCH_RELEASE = "patch-release";
  public static final String DEVELOPMENT = "development";
  public static final String RUNTIME = "runtime";
  public static final String ARGS_RELEASE = "--release";
  public static final String ARGS_FILE = "--file";
  public static final String DIST = "dist";
  public static final String MASTER = "master";
  public static final String DIST_ABAP_SMP = "dist-abap-smp";
  public static final String OBJECT_ID_CHANGE = "objectId-change";
  public static final String TEST_SRC_OBJECT_IDS = "src/test/resources/IntegrationTests/testObjectIds.json";
  public static final String REL_1_44 = "rel-1.44";
//  public static TestConversions testConversionClient = new TestConversions();
  private String version = null;

  private String destinationTestPath = null;

  
  private static String repo;

  private enum RelOperationScenario {
    RuntimePatchRelease,
    RuntimePatchDevelopment,
    DistPatchRelease,
    DistPatchReleasePrep,
    DistPatchDevelopment,
    RuntimeMinorRelease,
    RuntimeMinorDevelopment,
    DistMinorReleasePrep,
    DistMinorRelease,
    DistMinorDevelopment,
    UpdateDistRepackageObjectIds,
    RulesUiRelNotes
  }


  private enum InputSrcFolder {
    Openui5, Common, DistPatchBeforeRelease, DistMinorBeforeRelease, RulesUiRelNotes
}
  void setDestinationTestPath(String destinationPath){
    this.destinationTestPath = destinationPath;
  }
  
  void setTestScenarioVersionInput(String inputVersion){
    this.version = inputVersion;
  }

  private File findPath(InputSrcFolder srcFolder, String defaultSource) {
    String defaultSrcPath = defaultSource != null ? defaultSource : "src/test/resources/IntegrationTests/input/";
    Map<InputSrcFolder, String> folderNames = new HashMap<InputSrcFolder, String>();
    
    folderNames.put(InputSrcFolder.Common , "common");
    folderNames.put(InputSrcFolder.Openui5 , "openui5");
    folderNames.put(InputSrcFolder.DistPatchBeforeRelease , "DistPatchBeforeRelease");
    folderNames.put(InputSrcFolder.DistMinorBeforeRelease , "DistMinorBeforeRelease");
    folderNames.put(InputSrcFolder.RulesUiRelNotes , "sap.rules.ui");

    return new File(defaultSrcPath += folderNames.get(srcFolder));
  }

  private String setup(String scenario, String repository, InputSrcFolder inputTestSrcFol) throws IOException {
    return setup(scenario, repository, findPath(inputTestSrcFol, null));
  }

  private static String setup(String scenario, String repository, File src) throws IOException {
    File dest = new File("target/tests/" + scenario + "\\" + repository);
    dest.mkdirs();
    FileUtils.copyDir(src, dest);
    return dest.getAbsolutePath();
  }

  private File setInputSrcFolderForComparing(String scenario, String baseFolder){
    String baseSrcFolder = baseFolder != null ? baseFolder : "src/test/resources/IntegrationTests/input/";
    if(scenario.equals("RulesUiRelNotes")){
      baseSrcFolder += "sap.rules.ui";
    } else {
      baseSrcFolder += "common";
    }
    return new File(baseSrcFolder);
  }
  private void compare(String scenario) throws IOException {
    compare(scenario, setInputSrcFolderForComparing(scenario, null));
  }

  private static void compare(String scenario, File src) throws IOException {
    File expected = new File("src/test/resources/IntegrationTests/expected", scenario + "\\" + repo);
    File actual = new File("target/tests", scenario + "\\" + repo);
    FileUtils.compareDir(src, expected, actual);
  }

  public void createTestScenarioDir(String scenario, String repo, InputSrcFolder inputSrcFol, ReleaseOperation relOperation, String inputVersion) throws IOException {
    setTestScenarioVersionInput(inputVersion);
    setDestinationTestPath(setup(scenario, repo, inputSrcFol)); 
    
    MyReleaseButton.setRelOperation(relOperation);
    
    System.out.println("The Pom's versions have been prepared for the given test scenario.The test can now be started.");
  }

  public void changePomsVersions(String destPath, String version) throws IOException {
    MyReleaseButton.main(new String[] { destPath, "0.10.0-SNAPSHOT", version, "rel-1.44" });
  }

  public String[] getArguments(RelOperationScenario relOpScenario) {
    String repoSet = null;
    String command = null;
    String branch = null;
    String gitDir = "C:\\Users\\I331214\\git\\sapui5.misc\\tools\\_git2p4\\target\\tests\\";

    switch (relOpScenario) {
      case RuntimePatchRelease:
        repoSet = RUNTIME;
        command = PATCH_RELEASE;
        gitDir += PATCH_BEFORE_RELEASE;
        branch = REL_1_44;
        break;
      case RuntimePatchDevelopment:
        repoSet = RUNTIME;
        command = PATCH_DEVELOPMENT;
        gitDir += PATCH_AFTER_RELEASE;
        branch = REL_1_44;
        break;
      case DistPatchReleasePrep:
        repoSet = DIST;
        command = PATCH_DEVELOPMENT;
        gitDir += DIST_PATCH_BEFORE_RELEASE;
        branch = REL_1_44;
        break;
      case DistPatchRelease:
        repoSet = DIST;
        command = PATCH_RELEASE;
        gitDir += DIST_PATCH_BEFORE_RELEASE;
        branch = REL_1_44;
        break;
      case DistPatchDevelopment:
        repoSet = DIST;
        command = PATCH_DEVELOPMENT;
        gitDir += DIST_PATCH_AFTER_RELEASE;
        branch = REL_1_44;
        break;
      case RuntimeMinorDevelopment:
        repoSet = RUNTIME;
        command = DEVELOPMENT;
        gitDir += MINOR_AFTER_RELEASE;
        branch = MASTER;
        break;
      case RuntimeMinorRelease:
        repoSet = RUNTIME;
        command = ARGS_RELEASE;
        gitDir += MINOR_BEFORE_RELEASE;
        branch = MASTER;
        break;
      case DistMinorReleasePrep:
        repoSet = DIST;
        command = DEVELOPMENT;
        gitDir += DIST_MINOR_BEFORE_RELEASE;
        branch = MASTER;
        break;
      case DistMinorRelease:
        repoSet = DIST;
        command = ARGS_RELEASE;
        gitDir += DIST_MINOR_BEFORE_RELEASE;
        branch = MASTER;
        break;
      case DistMinorDevelopment:
        repoSet = DIST;
        command = DEVELOPMENT;
        gitDir += DIST_MINOR_AFTER_RELEASE;
        branch = MASTER;
        break;
      case UpdateDistRepackageObjectIds:
        repoSet = "dist-abap-smp";
        command = "objectId-change";
        gitDir += relOpScenario.UpdateDistRepackageObjectIds.toString();
        branch = REL_1_44;
        break;
      case RulesUiRelNotes:
        repoSet = "sap.rules.ui";
        command = "release-notes";
        gitDir += relOpScenario.RulesUiRelNotes.toString();
        branch = REL_1_44;
        break;
      default:
        break;
    }
    
    List<String> args = new ArrayList<String>();
    args.add(command);
    args.add("--p4-dest-path");
    args.add("//tc1/phoenix/#");
    args.add("--git-dir");
    args.add(gitDir);
    args.add("--repository-set");
    args.add(repoSet);
    args.add("--git-ssh-user");
    args.add("i331214");
    args.add("--git-use-https");
    args.add("--git-user");
    args.add("i331214");
    args.add("--git-email");
    args.add("yavor.nikolov@sap.com");
    args.add("--branch");
    args.add(branch);
    args.add("--preview");
    args.add("--git-no-fetch");
    args.add("--git-no-checkout");
    
    if (relOpScenario.equals(RelOperationScenario.UpdateDistRepackageObjectIds)) {
      args.add("--file");
      args.add("file:///" + new File("src\\test\\resources\\IntegrationTests\\testObjectIds.json").getAbsolutePath());
    } else if (relOpScenario.equals(RelOperationScenario.RulesUiRelNotes)) {
      args.add("--fix-or-feature-only");
      args.add("--lowest-minor");
      args.add("44");
      args.add("--ssh-suffix");
      args.add("github");
    }    
    
    String[] arguments = args.toArray(new String[args.size()]);
    
    return arguments;
  }

  @Test
  public void testMain0UpdateDistRepackageObjectIds() throws Exception {
    Git2P4Main git2P4Main = new Git2P4Main();
    String[] args = getArguments(RelOperationScenario.UpdateDistRepackageObjectIds);
    String scenario = RelOperationScenario.UpdateDistRepackageObjectIds.toString();
    repo = "sapui5.dist.repackage";
    //the inputVersion in createTestScenarioDir() should be 1.44.18
    createTestScenarioDir(scenario, repo, InputSrcFolder.Common, ReleaseOperation.PatchRelease, "1.44.18");
    changePomsVersions(destinationTestPath, version);
    git2P4Main.git = Mockito.mock(GitClient.class);
    git2P4Main.main0(args);
    compare(scenario);
  }

  @Test
  public void testMain0RuntimePatchAfterRelease() throws Exception {
    Git2P4Main git2P4Main = new Git2P4Main();
    String[] args = getArguments(RelOperationScenario.RuntimePatchDevelopment);
    String scenario = "PatchAfterRelease";
    repo = "openui5";
    //the inputVersion in createTestScenarioDir() should be 1.44.1
    createTestScenarioDir(scenario, repo, InputSrcFolder.Openui5, ReleaseOperation.PatchRelease, "1.44.1");
    changePomsVersions(destinationTestPath, version);
    
    repo = "sapui5.runtime";
  //the inputVersion in createTestScenarioDir() should be 1.44.1
    createTestScenarioDir(scenario, repo, InputSrcFolder.Common, ReleaseOperation.PatchRelease, "1.44.1");
    changePomsVersions(destinationTestPath, version);
    git2P4Main.git = Mockito.mock(GitClient.class);
    git2P4Main.main0(args);
    compare(scenario);
  }

  @Test
  public void testMain0RuntimePatchBeforeRelease() throws Exception {
    Git2P4Main git2P4Main = new Git2P4Main();
    String[] args = getArguments(RelOperationScenario.RuntimePatchRelease);
    String scenario = "PatchBeforeRelease";
    repo = "openui5";
    //the inputVersion in createTestScenarioDir() should be 1.44.2-SNAPSHOT
    createTestScenarioDir(scenario, repo, InputSrcFolder.Openui5, ReleaseOperation.PatchDevelopment, "1.44.2-SNAPSHOT");
    changePomsVersions(destinationTestPath, version);
    
    repo = "sapui5.runtime";
    createTestScenarioDir(scenario, repo, InputSrcFolder.Common, ReleaseOperation.PatchDevelopment, "1.44.2-SNAPSHOT");
    changePomsVersions(destinationTestPath, version);
    git2P4Main.git = Mockito.mock(GitClient.class);
    git2P4Main.main0(args);
    compare(scenario);
  }

  @Test
  public void testMain0DistPatchBeforeRelease() throws Exception {
    Git2P4Main git2P4Main = new Git2P4Main();
    String[] args = getArguments(RelOperationScenario.DistPatchRelease);
    String scenario = "DistPatchBeforeRelease";
    repo = "sapui5.dist";
    createTestScenarioDir(scenario, repo, InputSrcFolder.DistPatchBeforeRelease, ReleaseOperation.PatchRelease, null);

    git2P4Main.git = Mockito.mock(GitClient.class);
    git2P4Main.mvn = Mockito.mock(MvnClient.class);
    MyReleaseButton.mvn = git2P4Main.mvn;
    when(git2P4Main.mvn.getLatestOutput()).thenReturn("so unable to set version to 1.44.3");
    git2P4Main.main0(args);
    compare(scenario);
  }

  @Test
  public void testMain0DistPatchAfterRelease() throws Exception {
    Git2P4Main git2P4Main = new Git2P4Main();
    String[] args = getArguments(RelOperationScenario.DistPatchDevelopment);
    String scenario = "DistPatchAfterRelease";
    repo = "sapui5.dist";
    //the inputVersion in createTestScenarioDir() should be 1.44.2
    createTestScenarioDir(scenario, repo, InputSrcFolder.Common, ReleaseOperation.PatchRelease, "1.44.2");
    changePomsVersions(destinationTestPath, version);
    git2P4Main.git = Mockito.mock(GitClient.class);
    git2P4Main.mvn = Mockito.mock(MvnClient.class);
    MyReleaseButton.mvn = git2P4Main.mvn;
    when(git2P4Main.mvn.getLatestOutput()).thenReturn("so unable to set version to 1.44.3-SNAPSHOT");
    git2P4Main.main0(args);
    compare(scenario);
  }

  @Test
  public void testMain0MinorBeforeRelease() throws Exception {
    Git2P4Main git2P4Main = new Git2P4Main();
    String[] args = getArguments(RelOperationScenario.RuntimeMinorRelease);
    String scenario = "MinorBeforeRelease";
    repo = "openui5";
    //the inputVersion in createTestScenarioDir() should be 1.45.0-SNAPSHOT
    createTestScenarioDir(scenario, repo, InputSrcFolder.Openui5, ReleaseOperation.MinorRelease, "1.45.0-SNAPSHOT");
    changePomsVersions(destinationTestPath, version);
    
    repo = "sapui5.runtime";
    createTestScenarioDir(scenario, repo, InputSrcFolder.Common, ReleaseOperation.MilestoneDevelopment, "1.45.0-SNAPSHOT");
    changePomsVersions(destinationTestPath, version);
    git2P4Main.git = Mockito.mock(GitClient.class);
    git2P4Main.main0(args);
    compare(scenario);
  }
  
  @Test
  public void testMain0MinorAfterRelease() throws Exception {
    Git2P4Main git2P4Main = new Git2P4Main();
    String[] args = getArguments(RelOperationScenario.RuntimeMinorDevelopment);
    String scenario = "MinorAfterRelease";
    repo = "openui5";
    //the inputVersion in createTestScenarioDir() should be 1.44.0
    createTestScenarioDir(scenario, repo, InputSrcFolder.Openui5, ReleaseOperation.MinorRelease, "1.44.0");
    changePomsVersions(destinationTestPath, version);
    
    repo = "sapui5.runtime";
    createTestScenarioDir(scenario, repo, InputSrcFolder.Common, ReleaseOperation.MinorRelease, "1.44.0");
    changePomsVersions(destinationTestPath, version);
    git2P4Main.git = Mockito.mock(GitClient.class);
    git2P4Main.contributorsVersions = Mockito.mock(ContributorsVersions.class);
    git2P4Main.main0(args);
    compare(scenario);
  }

  

  @Test
  public void testMain0DistMinorBeforeRelease() throws Exception {
    Git2P4Main git2P4Main = new Git2P4Main();
    String[] args = getArguments(RelOperationScenario.DistMinorRelease);

    String scenario = "DistMinorBeforeRelease";
    repo = "sapui5.dist";
    createTestScenarioDir(scenario, repo, InputSrcFolder.DistMinorBeforeRelease, ReleaseOperation.MilestoneDevelopment, null);
    git2P4Main.git = Mockito.mock(GitClient.class);
    git2P4Main.mvn = Mockito.mock(MvnClient.class);
    when(git2P4Main.mvn.getLatestOutput()).thenReturn("so unable to set version to 1.46.0");
    git2P4Main.main0(args);
    compare(scenario);
  }

  @Test
  public void testMain0DistMinorAfterRelease() throws Exception {
    Git2P4Main git2P4Main = new Git2P4Main();
    String[] args = getArguments(RelOperationScenario.DistMinorDevelopment);
    String scenario = "DistMinorAfterRelease";
    repo = "sapui5.dist";
    //the inputVersion in createTestScenarioDir() should be 1.46.0
    createTestScenarioDir(scenario, repo, InputSrcFolder.Common, ReleaseOperation.MilestoneDevelopment, "1.46.0");
    changePomsVersions(destinationTestPath, version);
    git2P4Main.git = Mockito.mock(GitClient.class);
    git2P4Main.mvn = Mockito.mock(MvnClient.class);
    MyReleaseButton.mvn = git2P4Main.mvn;
    when(git2P4Main.mvn.getLatestOutput()).thenReturn("so unable to set version to 1.47.0-SNAPSHOT");

    git2P4Main.contributorsVersions = Mockito.mock(ContributorsVersions.class);
    MyReleaseButton.setFileOSLocation("src/test/resources/IntegrationTests");

    git2P4Main.main0(args);
    compare(scenario);
  }
  
@Test
public void testMain0SapUiRulesRelNotes() throws IOException{
  Git2P4Main git2P4Main = new Git2P4Main();
  String[] args = getArguments(RelOperationScenario.RulesUiRelNotes);
  String scenario = "RulesUiRelNotes";
  repo = "sap.rules.ui";
  createTestScenarioDir(scenario, repo, InputSrcFolder.RulesUiRelNotes, ReleaseOperation.MilestoneDevelopment, null);
  git2P4Main.git.lastOutput = new ArrayList<String>() {{
    add("commit affb5f62ca578e9e925bd578471dd4b7b5688a59 a5bcd0222d606189ecbbe2c6d6e111304d95b834");
    add("Author:     Test");
    add("AuthorDate: 1480594602 +0000");
    add("Commit:     Test");
    add("CommitDate: 1480594602 +0000");
    add("");
    add("  [FIX]  test scenario for FIX or FEAUTURE");
    add("");
    add("commit a5bcd0222d606189ecbbe2c6d6e111304d95b834 e85366bc1cbb8680543872ee4fc7ff04848d10e9");
    add("Author:     Test");
    add("AuthorDate: 1480592839 +0000");
    add("Commit:     Test");
    add("CommitDate: 1480592839 +0000");
    add("");
    add("    update pom files");
    add("");
    add("commit e85366bc1cbb8680543872ee4fc7ff04848d10e9 a806f3fdfdb0df292eb519549f84ce4cc90e37e4 01e0cc7968d07f5c0d4a07c9db770a4825327818");
    add("Merge: a806f3f 01e0cc7");
    add("Author:     Test");
    add("AuthorDate: 1480335622 +0200");
    add("Commit:     Test");
    add("CommitDate: 1480335622 +0200");
    add("");
    add("    Merge pull request #346 from RulesDevOps/doc_remove_RB_experimental");
    add("   ");
    add("    [FIX] remove experimental from RuleBuilder api");
    add("");
    add("commit 01e0cc7968d07f5c0d4a07c9db770a4825327818 46feb94a9afc15940f44b22ccbfb68d07e337b1a a806f3fdfdb0df292eb519549f84ce4cc90e37e4");
    add("Merge: 46feb94 a806f3f");
    add("Author:     Test");
    add("AuthorDate: 1480333051 +0200");
    add("Commit:     Test");
    add("CommitDate: 1480333051 +0200");
    add("");
    add("    Merge branch 'REL-1.44' into doc_remove_RB_experimental");
    add("");
    add("commit a806f3fdfdb0df292eb519549f84ce4cc90e37e4 a599d15f37bfaeff91ebb1b655f2b84aeccadef7 9de23846eee2c5fcb9b5eb064e21950da70ec013");
    add("Merge: a599d15 9de2384");
    add("Author:     Test");
    add("AuthorDate: 1480333028 +0200");
    add("Commit:     Test");
    add("CommitDate: 1480333028 +0200");
    add("");
    add("    Merge pull request #347 from RulesDevOps/ExpAdv_fix_bind_value_prop");
    add("  ");
    add("  [INTERNAL] fix bind value property in ExpressionAdvanced control");
   }};
  git2P4Main.git = spy(git2P4Main.git);
  Mockito.doReturn(true).when(git2P4Main.git).execute((String[]) anyVararg());
  
  Mockito.doReturn(true).when(git2P4Main.git).commit((CharSequence) anyObject());
  git2P4Main.main0(args);
  compare(scenario);
}
}