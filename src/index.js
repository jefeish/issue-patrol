const express = require('express')
const app = express()
const fs = require('fs')
const hbs = require('handlebars')
const path = __dirname + '/'
require('dotenv').config();
const util = require('util')
const moment = require('moment');

// --------------------------------------------------
const PORT = process.env.PORT
const TOKEN = process.env.TOKEN
const API_URL = process.env.API_URL

const { Octokit } = require("@octokit/rest")
const octokit = new Octokit({ auth: TOKEN });

// --------------------------------------------------
// 
// --------------------------------------------------
async function getIssues(owner, repo, state, page_limit) {
    const { data } = await octokit.rest.issues.listForRepo({
        owner: owner,
        repo: repo,
        state: state,
        per_page: page_limit,
    });
    
    return data;
}

// --------------------------------------------------
// 
// --------------------------------------------------
app.get('/', function (req, res) {
    const state = req.query.issue_state || 'open'
    const repo = req.query.repo || 'test'
    const sortTasks = req.query.sortTasks 
    const page_limit = req.query.page_limit || 100
    
    getIssues('githubcustomers', repo, state, page_limit).then(result => {
        const TODAY = moment(new Date())
        const r = result

        fs.readFile(path + 'templates/issues-gantt.hbs', 'utf8', (err, tpl) => {
            if (err) {
                console.error(err)
                return
            }

            let issueGrid = []

            for (let i = 0; i < r.length; i++) {

                if (!r[i].pull_request) {
                    let row = {}
                    row['id'] = r[i].number
                    row['title'] = r[i].title
                    row['state'] = r[i].state
                    const start = moment(r[i].created_at)
                    const end = moment(r[i].updated_at)
                    const active = end.diff(start, 'days')
                    row['start'] = start
                    const state = r[i].state

                    if ( state !== 'open' ) {
                        row['end'] = end
                        row['done'] = 100
                    }
                    else {
                        const time_inprogress = end - start
                        const days_inprogress = Math.ceil(time_inprogress / (1000 * 60 * 60 * 24))
                        const days_since_last_update = Math.ceil(TODAY.diff(end, 'hours') / 24)
                        const days_total = days_since_last_update + days_inprogress
                        const active = Math.floor(days_inprogress * 100 / days_total)
                        console.log("Issue: "+r[i].number+" - days_total: "+days_total+" - days_inprogress: "+ days_inprogress +" - active: "+ active)
                        row['end'] = TODAY
                        row['done'] = active
                    }
 
                    issueGrid.push(row)
                }
            }
                
            if (issueGrid.length == 0) {
                issueGrid.push({ id:null, title:'No Issues found', state:null, start:null, end:null, a:null, done:null, b:null})
            }

            var template = hbs.compile(tpl);
            var data = {
                "sortTasks": sortTasks === 'on' ? 'true' : 'false',
                "repo": repo,
                "state": state,
                "page_limit": page_limit,
                "checked_all": state === 'all' ? 'checked' : '',
                "checked_open": state === 'open' ? 'checked' : '',
                "checked_closed": state === 'closed' ? 'checked' : '',
                "checked_reverse": sortTasks === 'on' ? 'checked' : '',
                "issue_filter": " - [ State: "+ state +" ]",
                "height": 30 * r.length + 100,
                "issues": issueGrid
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