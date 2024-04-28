/**
 * @see https://github.com/webpack/webpack-cli/issues/312#issuecomment-732749280
 */
export default class BannerPlugin {
    constructor(options) {
        this.banner = options.banner
    }
    
    apply(compiler) {
        compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
            compilation.chunks.forEach(chunk => {
                chunk.files.forEach(filename => {
                    const asset = compilation.assets[filename]
                    asset._value = this.banner + asset._value
                })
            })
            
            callback()
        })
    }
}