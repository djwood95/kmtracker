module.exports = {
    baseUrl: process.env.NODE_ENV === 'production'
      ? '/kmtracker2/dist'
      : '/',

      // where to output built files
    outputDir: 'dist',
  }