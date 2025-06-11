module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ensure assets are served with relative paths for HTTP compatibility
      webpackConfig.output.publicPath = './';
      
      // Disable ESLint plugin to avoid compatibility issues with ESLint 9
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => !plugin.constructor.name.includes('ESLint')
      );
      
      // Disable any HTTPS-related optimizations
      if (webpackConfig.optimization) {
        webpackConfig.optimization.splitChunks = {
          ...webpackConfig.optimization.splitChunks,
          cacheGroups: {
            ...webpackConfig.optimization.splitChunks?.cacheGroups,
            default: {
              ...webpackConfig.optimization.splitChunks?.cacheGroups?.default,
              enforce: true
            }
          }
        };
      }
      
      return webpackConfig;
    },
  },
  devServer: {
    // Disable HTTPS enforcement in development
    https: false,
    // Allow serving over HTTP
    allowedHosts: 'all',
    // Disable any automatic redirects
    historyApiFallback: {
      disableDotRule: true,
    },
  },
};