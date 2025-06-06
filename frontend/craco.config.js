module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable parallel processing in all minimizers for Bun compatibility
      if (webpackConfig.optimization && webpackConfig.optimization.minimizer) {
        webpackConfig.optimization.minimizer.forEach((minimizer) => {
          // Check for both TerserPlugin and CssMinimizerPlugin
          if (minimizer.constructor.name === 'TerserPlugin' || 
              minimizer.constructor.name === 'CssMinimizerPlugin') {
            minimizer.options.parallel = false;
          }
        });
      }
      
      // Also disable cache to avoid potential issues
      webpackConfig.cache = false;
      
      // Disable source map generation for faster builds
      webpackConfig.devtool = false;
      
      return webpackConfig;
    },
  },
  // Disable ESLint completely for Docker build
  eslint: {
    enable: false
  }
}; 