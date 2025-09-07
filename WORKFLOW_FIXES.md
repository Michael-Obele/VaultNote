# GitHub Actions Workflow Fixes

## Issues Fixed

### 1. Release-Please Action v4 Configuration

- **Problem**: Using unsupported inputs `extra-files` and `changelog-types`
- **Solution**: Created proper manifest configuration files:
  - `.release-please-config.json` - Main configuration
  - `.release-please-manifest.json` - Version tracking
- **Benefits**: Proper v4 compatibility, better configuration management

### 2. Android Signing Issues

- **Problem**: Manual post-build signing with `apksigner` causing "INSTALL_FAILED_INVALID_APK" errors
- **Solution**:
  - Added proper signing configuration to `build.gradle.kts`
  - Let Gradle handle signing during build process
  - Removed problematic manual signing steps
- **Benefits**: Properly signed APKs and AABs, no installation failures

### 3. Workflow Optimizations

- **Removed**: Redundant debug steps and manual file operations
- **Added**: Better error handling and verification steps
- **Improved**: Version synchronization between files
- **Enhanced**: Artifact handling and upload process

## Key Changes

### Release-Please Configuration

```json
// .release-please-config.json
{
  "packages": {
    ".": {
      "release-type": "node",
      "changelog-sections": [...],
      "extra-files": [
        "src-tauri/tauri.conf.json",
        "src-tauri/Cargo.toml"
      ]
    }
  }
}
```

### Android Gradle Signing

```kotlin
// build.gradle.kts additions
signingConfigs {
  create("release") {
    val keystorePropertiesFile = rootProject.file("keystore.properties")
    val keystoreProperties = Properties()
    if (keystorePropertiesFile.exists()) {
      keystoreProperties.load(FileInputStream(keystorePropertiesFile))
    }
    // ... signing configuration
  }
}
```

### Workflow Improvements

- Proper keystore setup without manual signing
- Better version synchronization
- Enhanced error handling and verification
- Streamlined artifact management

## Required Secrets

Ensure these GitHub secrets are configured:

- `RELEASE_PLEASE_TOKEN` - GitHub PAT for release-please
- `ANDROID_KEYSTORE` - Base64 encoded keystore file
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_ALIAS` - Key alias
- `ANDROID_KEY_PASSWORD` - Key password
- `VITE_LOGIN_URL` - Application-specific environment variable

## Testing the Workflow

1. Push to main branch with conventional commits
2. Release-please will create a PR
3. Merge the PR to trigger builds
4. Check that both desktop and Android builds complete successfully
5. Verify signed APK/AAB files are uploaded to the release

## Common Issues and Solutions

### "INSTALL_FAILED_INVALID_APK"

- **Cause**: Manual signing after build
- **Solution**: Let Gradle handle signing during build

### "Resource not accessible by integration"

- **Cause**: Insufficient GitHub token permissions
- **Solution**: Use PAT with appropriate permissions for RELEASE_PLEASE_TOKEN

### Android build failures

- **Cause**: Missing NDK or SDK components
- **Solution**: Ensure all required SDK components are installed in workflow
