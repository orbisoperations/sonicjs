var dataService = require('./data.service');
var helperService = require('./helper.service');
var eventBusService = require('./event-bus.service');

var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;
var path = require("path");

module.exports = fileService = {

    // startup: async function () {
    //     eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
    //         if (options) {
    //             await mediaService.processHeroImage(options.page);
    //         }
    //     });
    // },

    getFile: async function (filePath) {
        let adminPath = path.join(__dirname, '../', filePath);
        // console.log('adminPath--->', adminPath);

        return new Promise((resolve, reject) => {
            fs.readFile(adminPath, "utf8", (err, data) => {
                if (err){
                    console.log(chalk.red(err));
                   reject(err); 
                } 
                else resolve(data);
            });
        });
    },

    writeFile: async function (filePath, fileContent) {
        let fullPath = path.join(__dirname, '../', filePath);
        // console.log('adminPath--->', adminPath);

        return new Promise((resolve, reject) => {
            fs.writeFile(fullPath, fileContent, (err, data) => {
                if (err){
                    console.log(chalk.red(err));
                   reject(err); 
                } 
                else resolve(data);
            });
        });
    },

}