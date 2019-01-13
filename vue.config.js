module.exports = {
    baseUrl: process.env.NODE_ENV === 'production'
      ? '/kmtracker2'
      : '/',

      // where to output built files
    outputDir: 'dist',
  }