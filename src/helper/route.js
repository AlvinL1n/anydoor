const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const tplPath = path.join(__dirname, '../template/dir.tpl');
const source = fs.readFileSync(tplPath, 'utf-8');
const template = Handlebars.compile(source.toString());
const config = require('../config/defaultConfig.js');

const mime = require('./mime');
const compress = require('./compress');

const isFresh = require('./cache');

module.exports = async function (req, res, filePath) {
	try {
		const stats = await stat(filePath);
		if (stats.isFile()) {
			console.log('filePath==>', filePath);
			const contentType = mime(filePath);
			res.statusCode = 200;
			res.setHeader('Content-Type', contentType);
			let rs = fs.createReadStream(filePath);
			//rs.setEncoding('utf8');
			//对js进行压缩
			if (filePath.match(config.compress)) {
				rs = compress(rs, req, res);
			}
			rs.pipe(res);
		} else if (stats.isDirectory()) {
			const files = await readdir(filePath);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/html');
			const dir = path.relative(config.root, filePath);
			const data = {
				title: path.basename(filePath),
				dir: dir ? `/${dir}` : '',
				files: files.map(file => {
					return {
						file,
						icon: mime(file)
					}
				})
			};
			res.end(template(data));

		}
	} catch (ex) {
		// console.log(ex);
		res.statusCode = 404;
		res.setHeader('Content-Type', 'text/plain');
		res.end(`${filePath} is not a directory or file\n ${ex.toString()}`);
	}
}
