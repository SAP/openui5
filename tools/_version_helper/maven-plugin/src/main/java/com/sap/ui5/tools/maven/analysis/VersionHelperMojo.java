package com.sap.ui5.tools.maven.analysis;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import org.apache.maven.artifact.Artifact;
import org.apache.maven.artifact.metadata.ArtifactMetadataRetrievalException;
import org.apache.maven.artifact.metadata.ArtifactMetadataSource;
import org.apache.maven.artifact.repository.ArtifactRepository;
import org.apache.maven.artifact.versioning.ArtifactVersion;
import org.apache.maven.artifact.versioning.InvalidVersionSpecificationException;
import org.apache.maven.artifact.versioning.VersionRange;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.plugins.annotations.Component;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.plugins.annotations.ResolutionScope;
import org.apache.maven.project.DefaultProjectBuildingRequest;
import org.apache.maven.project.MavenProject;
import org.apache.maven.project.MavenProjectHelper;
import org.apache.maven.project.ProjectBuilder;
import org.apache.maven.project.ProjectBuildingRequest;
import org.apache.maven.repository.RepositorySystem;

/**
 * @author Peter Muessig, Todor Atanasov
 * 
 * mvn version-helper:analyze -Pmilestone.build,!snapshot.build
 */
@Mojo(name="analyze", defaultPhase=LifecyclePhase.PACKAGE , requiresDependencyResolution=ResolutionScope.COMPILE)
public class VersionHelperMojo extends AbstractMojo {

  
  /**
   * Project instance, used to retrieve some parameters as well as the remote repositories.
   */
  @Parameter(defaultValue="${project}", required=true, readonly=true)
  private MavenProject project = null;

  /** 
   * reference to the helper to build projects
   */
  @Component 
  private ProjectBuilder projectBuilder = null;
  
  /**
   * reference to the helper to create artifacts
   */
  @Component
  private RepositorySystem repositorySystem = null;
  
  /**
   * current repository/network configuration of Maven.
   */
  @Parameter(defaultValue="${repositorySystemSession}", readonly=true)
  private Object repositorySession = null;

  /*
  @Parameter(defaultValue="${project.remoteProjectRepositories}", readonly=true)
  private List<RemoteRepository> repositories = null;
  */
  
  /**
   * location of the local maven repository
   */
  @Parameter(defaultValue="${localRepository}", required=true, readonly=true)
  private ArtifactRepository localRepository = null;
  
  /**
   * Repository for Artifact versions etc.
   * Eventually used to retrieve older version of the current project.
   */
  @Component
  private ArtifactMetadataSource metadataSource = null;
  
  @Component
  private MavenProjectHelper projectHelper = null;
  
  @Parameter(defaultValue="${project.build.directory}", required=true)
  private File outputDirectory = null;
  
//  @Parameter(defaultValue="${project.build.finalName}", required=true)
//  private String outputName = null;
  
  /**
   * The version or the version Range
   */
  @Parameter(required=true)
  private String versionOrRange = null;

  

  /* (non-Javadoc)
   * @see org.apache.maven.plugin.AbstractMojo#execute()
   */
  @Override
  public void execute() throws MojoFailureException, MojoExecutionException {
    
    // create a building request and use the remote repositories from the settings
    ProjectBuildingRequest request = new DefaultProjectBuildingRequest();
    
    //TODO is this needed anymore ?
//    // for Maven 3.0/3.1/3.2 compatibility we need to use either org.sonatype.aether (3.0) or org.eclipse.aether (3.1+)
//    // RepositorySystemSession object - this is tough coding - maybe this should be centralized in future!!
//    try {
//      Class<?> clazz = null;
//      try {
//        clazz = Thread.currentThread().getContextClassLoader().loadClass("org.sonatype.aether.RepositorySystemSession");
//      } catch (ClassNotFoundException ex) {
//        clazz = Thread.currentThread().getContextClassLoader().loadClass("org.eclipse.aether.RepositorySystemSession");
//      }
//      Method m = request.getClass().getMethod("setRepositorySession", clazz );
//      m.invoke(request, repositorySession);
//    } catch (Exception ex) {
//      throw new MojoExecutionException("Failed to set the RepositorySystemSession!", ex);
//    }
    
    Properties versions = new Properties();
    Set<Artifact> artifacts = this.project.getArtifacts();
    for (Artifact artifact : artifacts) {

      //System.out.println(dep.getGroupId() + ":" + dep.getArtifactId() + ":" + dep.getBaseVersion() + ":" + dep.getClassifier() + ":" + dep.getType());
      
      // define the artifact we wanna lookup
      //Artifact a = this.repositorySystem.createArtifactWithClassifier(artifact.getGroupId(), artifact.getArtifactId(), this.versionOrRange, artifact.getType(), artifact.getClassifier());
      
      // resolve the POM artifact from the available Maven repositories
      try {
        //ProjectBuildingResult result = this.projectBuilder.build(a, request);
        
        //MavenProject p = result.getProject();
        //System.out.println(p.getGroupId() + ":" + p.getArtifactId() + ":" + p.getVersion());
        System.out.println(artifact.getGroupId() + ":" + artifact.getArtifactId() + ":" + artifact.getVersion());
        
        // search all version of the artifact
        List<ArtifactVersion> availableVersions = metadataSource.retrieveAvailableVersions(artifact, this.localRepository, project.getRemoteArtifactRepositories());

        VersionRange r = VersionRange.createFromVersionSpec(this.versionOrRange);
        List<ArtifactVersion> versionsInRange = new ArrayList<ArtifactVersion>();
        for (ArtifactVersion v : availableVersions) {
          if (r.containsVersion(v) && !"SNAPSHOT".equalsIgnoreCase(v.getQualifier())) {
//          if (r.containsVersion(v)) {
            versionsInRange.add(v);
          }
        }

        if (versionsInRange.size() > 0){
          Collections.sort(versionsInRange);
          System.out.println("  - " + versionsInRange.get(versionsInRange.size()-1).toString());
          versions.put(artifact.getGroupId() + ":" + artifact.getArtifactId(), versionsInRange.get(versionsInRange.size()-1).toString());
        } else {
          System.out.println(artifact.getGroupId() + ":" + artifact.getArtifactId() + " has no milestone version.");
        }
        
        /*
        VersionRangeRequest versionRangeRequest = new VersionRangeRequest(a, this.repositories, "project");
        */
        
//      } catch (ProjectBuildingException ex) {
//        ex.printStackTrace();
      } catch (ArtifactMetadataRetrievalException ex) {
        ex.printStackTrace();
      } catch (InvalidVersionSpecificationException ex) {
        ex.printStackTrace();
      }

    }
    
    File outputFile = new File(outputDirectory, "LatestVersions.prop");
    try {
      outputFile.getParentFile().mkdirs();
      outputFile.createNewFile();
      versions.store(new FileOutputStream(outputFile), "This is a first versions");
    } catch (Exception e) {
      e.printStackTrace();
    }

  } // method: execute
  
  
} // class: AnalyzeMojo