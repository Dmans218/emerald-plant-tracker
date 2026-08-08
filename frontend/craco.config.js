module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
      // Relative paths for production/Docker static serving; absolute for local dev HMR
      webpackConfig.output.publicPath = env === 'production' ? './' : '/';

      // Disable ESLint plugin to avoid compatibility issues with ESLint 9
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => !plugin.constructor.name.includes('ESLint')
      );

      return webpackConfig;
    },
  },
  devServer: (devServerConfig) => {
    devServerConfig.https = false;
    devServerConfig.allowedHosts = 'all';
    devServerConfig.historyApiFallback = {
      ...(devServerConfig.historyApiFallback || {}),
      disableDotRule: true,
    };
    // Proxy API to backend when package.json proxy is ignored by craco/wds versions
    devServerConfig.proxy = {
      '/api': { target: 'http://127.0.0.1:420', changeOrigin: true },
      '/uploads': { target: 'http://127.0.0.1:420', changeOrigin: true },
    };
    return devServerConfig;
  },
};