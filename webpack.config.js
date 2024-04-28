import {resolve, dirname} from "path"
import {fileURLToPath} from "url"
import BannerPlugin from "./src/js/external/BannerPlugin.js"
import banner from "./src/js/_banner.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
    mode: 'production',
    entry: './src/index.js',
    output: {
        filename: 'player.user.js',
        path: resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new BannerPlugin({
            banner
        }),
    ]
}