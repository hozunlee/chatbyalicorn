import adapter from '@sveltejs/adapter-auto'
import adapterNode from '@sveltejs/adapter-node'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: process.env.NODE_ENV === 'production' ? adapterNode() : adapter()
	},
	alias: {
		'@/*': './path/to/lib/*'
	}
}

export default config
