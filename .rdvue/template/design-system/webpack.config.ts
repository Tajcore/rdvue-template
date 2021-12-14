import { CleanWebpackPlugin } from "clean-webpack-plugin";
import Dotenv from 'dotenv-webpack';
import { ESBuildMinifyPlugin } from 'esbuild-loader';
import glob from 'glob';
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import SpeedMeasurePlugin from "speed-measure-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";
import webpack from 'webpack';
import type WebpackDevServer from 'webpack-dev-server';
import WebpackBar from 'webpackbar';
import { useFontLoader, useLibraryLoader, useMediaLoader, useSassLoader, useTsLoader, useVueLoader } from "./scripts/config";
import { LibraryPlugin } from './scripts/plugins';
import tsConfig from './tsconfig.json';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const IS_DEV = process.env.NODE_ENV !== 'production';
const LIBRARY_PATH = path.resolve(__dirname, '../../.library');
const smp = new SpeedMeasurePlugin({ disable: true });

const config: webpack.Configuration & WebpackDevServer.Configuration = smp.wrap({
  mode: IS_DEV ? 'development' : 'production',
  /**
   * HMR will NOT work without this setting
   * https://stackoverflow.com/a/66157895
   */
  target: 'web',
  entry: {
    main: "./src/main.ts",

    /**
     * While in DEV mode, track the library files so they
     * participate in HMR. The module generated from this
     * entry is never used, so we ignore in PROD.
     */
    ...IS_DEV && {
      library$: glob.sync(`${LIBRARY_PATH}/**/*.md`)
    }
  },
  output: {
    filename: "js/[name].[contenthash:8].js",
    path: path.resolve(__dirname, "dist"),
    chunkFilename: "[name].[contenthash:8].js",
  },
  module: {
    rules: [
      useTsLoader(IS_DEV),
      useVueLoader(IS_DEV),
      useFontLoader(IS_DEV),
      useMediaLoader(IS_DEV),
      useSassLoader(IS_DEV),
      useLibraryLoader(IS_DEV, {
        path: LIBRARY_PATH
      })
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: '../../.library/**/*.jpg', to: './img/[name][ext]' },
        { from: '../../.library/**/*.png', to: './img/[name][ext]' },
        { from: '../../.library/**/*.JPG', to: './img/[name][ext]' },
        { from: './src/assets/', to: './assets/img/' },
      ]
    }),
    new LibraryPlugin({
      path: LIBRARY_PATH
    }),
    new Dotenv({
      path: './config/.env',
      safe: './config/.env.example', // Validate against .env.example
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash:8].css",
      chunkFilename: "[name].[contenthash:8].css",
    }) as any,
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: "./public/favicon.png",
    }),
    new WebpackBar({
      name: 'RDVue',
      color: '#ffc423',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      '.rdvue': path.resolve(__dirname, '.rdvue/'),
      /** 
       * Required for Runtime + Compiler 
       * https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
       */
      vue$: "vue/dist/vue.esm.js",
    },
    extensions: ['.ts', '.js', '.vue', '.json'],
    mainFields: ['browser', 'module', 'main'],
  },
  externals: ['library$'],
  optimization: {
    minimize: !IS_DEV,
    minimizer: [
      new ESBuildMinifyPlugin({
        target: tsConfig.compilerOptions.target,
        css: true
      })
    ],
    moduleIds: "deterministic",
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          priority: -10,
          chunks: "all",
        },
      },
    },
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    stats: 'errors-warnings',
    injectHot: true,
    overlay: true,
    contentBase: 'public',
    watchContentBase: true,
    compress: true,
    port: 9000,
  },
});

export default config;