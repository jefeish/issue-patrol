const express = require('express')
const app = express()
const fs = require('fs')
const hbs = require('handlebars')
const path = __dirname + '/'
require('dotenv').config();
const util = require('util')

// --------------------------------------------------
const PORT = process.env.PORT
const TOKEN = process.env.TOKEN
const API_URL = process.env.API_URL

const { Octokit } = require("@octokit/rest")
const octokit = new Octokit({ auth: TOKEN });

// --------------------------------------------------
// 
// --------------------------------------------------
async function getIssues(owner, repo) {
    const { data } = await octokit.rest.issues.listForRepo({
        owner: owner,
        repo: repo,
        per_page: 2,
    });
    
    return data;
}

// --------------------------------------------------
// 
// --------------------------------------------------
app.get('/', function (req, res) {

    getIssues('jefeish', 'test').then(result => {
        console.log("title:" + util.inspect(result[0].title))
        console.log("state:" + util.inspect(result[0].state))
        console.log("created_at:" + util.inspect(result[0].created_at))
        console.log("updated_at:" + util.inspect(result[0].updated_at))
        console.log("html_url:" + util.inspect(result[0].html_url))
        
        fs.readFile(path + 'templates/issues-gantt.hbs', 'utf8', (err, tpl) => {
            if (err) {
                console.error(err)
                return
            }

            var header = fs.readFileSync(path + 'templates/header.html', 'utf8');
            var template = hbs.compile(tpl);
            var data = {
                "header": header
            };
            var result = template(data);
            res.send(result)
        });

    }).catch(err => {
        console.log(err);
        res.sendStatus(501);
    });

})

const server = app.listen(PORT, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})