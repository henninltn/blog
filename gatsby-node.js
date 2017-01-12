const precss = require('precss')
const autoprefixer = require('autoprefixer')

exports.modifyWebpackConfig = function(config, env) {
  config.merge({
    postcss: [
      autoprefixer({
        browsers: ['IE 9', 'IE 10', 'IE 11', 'last 2 versions'],
        precss
      })
    ]
  })
  return config
}
