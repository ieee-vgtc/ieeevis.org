var gh         = require('github')
  , schedule   = require('node-schedule')
  , nodemailer = require('nodemailer')
  , smtpPool   = require('nodemailer-smtp-pool')
  , moment     = require('moment')
  , async      = require('async')
  , os         = require('os')
  , fs         = require('fs')
  , mailcred   = require(os.homedir()+'/.credentials/gmail.json') // see nodemailer documentation
  , ghcred     = require(os.homedir()+'/.credentials/github.json') // see github (node package) documentation
  , debug      = false
  , transporter
  , github
  , currentissue

console.log('Setting up VIS web report '+moment().format())

var job = schedule.scheduleJob(
    { hour: (12+8), minute: 0, dayOfWeek: 4 }, 
    function(){
      console.log('starting report...')
      async.waterfall([
        setAuth,
        createIssue,
        sendReport
      ])
    }
)

function setAuth(step) {
  transporter = nodemailer.createTransport(smtpPool({
      service: 'Gmail',
      auth: mailcred,
      // use up to 5 parallel connections
      maxConnections: 5,
      // do not send more than 10 messages per connection
      maxMessages: 10,
      // no not send more than 5 messages in a second
      rateLimit: 5
  }))

  github = new gh({
    protocol: 'https',
    host: 'api.github.com', 
    headers: {
        'user-agent': 'IEEE-VIS-Weekly-Report'
    },
    Promise: require('bluebird'),
    followRedirects: false,  
    timeout: 5000
  })
 
  github.authenticate({
    type: 'oauth',
    token: ghcred.token
  })

  step()
}

function sendReport(step) {
  var mailOptions = {
      from: 'ltharrison@wpi.edu',
      to: 'core_committee@ieeevis.org',
      cc: 'web@ieeevis.org',
      subject: 'IEEE VIS Web Report (cw '+(moment().week())+')', 
      text: reportText(),
  }

  if(debug) {
    mailOptions.to = 'lanetharrison@gmail.com'
    mailOptions.cc = ''
  }

  transporter.sendMail(mailOptions, function(err, info){
      if(err) {
        console.log(err)
        step()
      } else {
        console.log('VIS Web Report sent.')
        transporter.close()
        step()
      }
  })
}

function reportText( ) {
  var s = ''
  s = s + 'Here is the weekly approval thread: ' +currentissue.data.html_url+ '\n'
  s = s + '\n'
  return s
}
 
function createIssue(step) {
  var opts = {
    owner: 'ieee-vgtc',
    repo: 'ieeevis.org',
    title: 'Weekly Approval Thread for Production (cw '+(moment().week())+')',
    body: 'https://github.com/ieee-vgtc/ieeevis.org/compare/production...master/#diff-0\n\nThe link above is a file-by-file comparison between staging and production.\nPlease review and let us know which particular files should be pushed or held back.\nOnce we have approval we\'ll push it live to production (ieeevis.org).'
  }

  if(debug) {
    opts.owner = 'wpivis'
    opts.repo = 'test'
  }

  github.issues.create(opts, function(err, res) {
    if(err) console.log(err)
    console.log('Issue created')
    currentissue = res
    fs.writeFileSync('currentissue.json', JSON.stringify(currentissue))
    step()
  })
}

