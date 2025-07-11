const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'nexp-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3 * 60 * 60 * 1000 } // 3 hours
}));

// Serve static files
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/image', express.static('image'));
app.use('/design', express.static('design'));
app.use('/config', express.static('config'));

// Helper function to clear cookies
function clearAllCookies(res) {
  const cookieNames = ['user', 'arrangement', 'block', 'max_blocks', 'condition', 'max_conditions', 'trial', 'max_trials', 'CurrentTrial', 'TrialsperBlock', 'taskNum'];
  cookieNames.forEach(name => {
    res.clearCookie(name);
  });
}

// Routes
app.get('/', (req, res) => {
  // Clear all cookies
  clearAllCookies(res);
  
  const message = req.query.message || '';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
<title>Experiment Run Template</title>
</head>
<body>
	<center>
	<table align="center">
		<tr id="image"> 
			<a href="http://hci.comp.nus.edu.sg/index.html"><img src="image/yourlogo.png"></a> 
			<hr/>
		</tr>
		
		<tr id="introduction">
			<div>
			<font size="+2" color="#FF0033" face="Georgia, Times New Roman, Times, serif"> Welcome to the XXX vs YYY experiment! </font>
			</div>	
			<br /><br />	
		</tr>
		
		${message ? `<tr><td><div style="color: red;">${message}</div></td></tr>` : ''}
		
		<tr style="text-align:center">
			<div> Please input your personal informational below.</div>
			<br />
		</tr>
		<form action="/analyze1" method="post">
		<tr height="35px">
			<td style="width:auto" align="left">
				<font style="font-weight:bold">Name: </font>
			</td>
			<td>
				<input type="text" class="Inputtext" name="name" value="XXX">
			</td>
		</tr>
		
		<tr height="35px">
		<td style="width:auto" align="left">
			<font style="font-weight:bold">Sex: </font>
		</td>
		<td>	
			<select name="sex" style="width:auto">
					<option value="female">Female</option>
					<option value="male">Male</option>
			</select>		
		</td>
		</tr>
		
		<tr height="35px">
		<td style="width:auto" align="left">
			<font style="font-weight:bold">Age: </font>
		</td>	
		<td>	
			<select name="age" style="width:auto">
					<option value="< 20"> < 20 </option>			
					<option value="20-25"> 20-25</option>
					<option value="26-30"> 26-30</option>
					<option value="31-35"> 31-35</option>
					<option value="36-40"> 36-40</option>
					<option value="> 40"> > 40</option>
			</select>	
		</td>
		</tr>
		
		<tr height="35px">
			<td>
				<font style="font-weight:bold">Department: &nbsp </font>
			</td>
			<td>
				<input type="text" class="Inputtext" name="department" value="XXX">
			</td>
		</tr>

		<tr height="35px">
			<td>
				<font style="font-weight:bold">Subject ID: &nbsp </font>
			</td>
			<td>
				<select id="subject_id" name="user" style="width:auto">
					<script language="javascript">
            			for(i = 0; i < 50; i++)
            				document.getElementById("subject_id").add(new Option(i.toString(),i));
            		</script>
				</select>&nbsp;		
			</td>
		</tr>
		<table>
		<br />
		<br />
		<tr>
		<input type="submit" style="width:100px; height:30px; font-weight:bold; font-size:20px" value="Start!">
		</table>
		</tr>
		</form>		
	</table>
</body>
</html>
  `;
  
  res.send(html);
});

app.post('/analyze1', (req, res) => {
  const { name, sex, age, department, user } = req.body;
  
  // Store form data in cookies
  res.cookie('demodata_name', name, { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('demodata_sex', sex, { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('demodata_age', age, { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('demodata_department', department, { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('user', user, { maxAge: 3 * 60 * 60 * 1000 });
  
  // Load config
  const config = JSON.parse(fs.readFileSync('config/config.json', 'utf8'));
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Experiment Run Template</title>
    <script type="text/javascript">
      history.pushState(null, null, '/analyze1');
      window.addEventListener('popstate', function(event) {
      history.pushState(null, null, '/analyze1');
      });
    </script>
</head>
<body>
<div align="center">
		<a href=""><img src="image/yourlogo.png"></a>
		<hr/>	
	</div>
	<div align="center">
		<font size="+2" color="#FF0033" face="Georgia, Times New Roman, Times, serif"> Welcome to the XXX vs YYY experiment! </font>
		<br /><br />
		<br /><br />
</div>
${config['pre-questionnaire'] ? `
    <div align="center">
    <h4>Please fill in the pre-questionnaire:</h4>
    <iframe src="${config['pre-questionnaire']}" width="760" height="500" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>
    </div>
` : ''}
<div style="font-size: 16pt">
    <hr />
    <p><b>Below is for experimental conductors only:</b></p>
    <p>    
	This part of the interface makes you choose which Interface do you want to do first. You can also modify the arrangement to whatever you want.
    </p>
    <p>
        In the framework, You have two choices: </br>
        1. Automaic: the arrangement is dependeing on the participant ID</br>
        2. Manual: you can choose any arrangement you want for the current participant</br>
    </p>
    <p>
</div>
<div style="font-size: 16pt">
    <p>Which type of arrangements should participant ${user} do?</p>
<form action="/analyze2" method="post">
    <span>Interface</span><br/>
    <input type="radio" name="arrangement" value="Automatic" style="font-size:20px">Automatic<br/>
    <input type="radio" name="arrangement" value="Manual" style="font-size:20px">Manual<br/>
    <br/><br/>
    <input id="submit" type="submit" style="width:100px; height:30px; font-weight:bold; font-size:20px" value="submit">
</form>
</div>
</body>
</html>
  `;
  
  res.send(html);
});

app.post('/analyze2', (req, res) => {
  const { arrangement } = req.body;
  
  if (!arrangement) {
    return res.redirect('/');
  }
  
  res.cookie('arrangement', arrangement, { maxAge: 3 * 60 * 60 * 1000 });
  
  const user = req.cookies.user;
  if (!user) {
    return res.redirect('/?message=Please use a username');
  }
  
  // Read the JSON file
  const json = JSON.parse(fs.readFileSync('design/Arrangement.json', 'utf8'));
  
  const arrangementNum = json.children.length;
  const blockNum = json.children[0].children.length;
  const conditionNum = json.children[0].children[0].children.length;
  const trialNum = json.children[0].children[0].children[0].children.length;
  
  const TrialsperBlock = conditionNum * trialNum;
  
  // SET FOR BLOCKS HERE
  const max_blocks = blockNum;
  
  res.cookie('max_blocks', max_blocks.toString(), { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('block', '0', { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('condition', '0', { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('max_conditions', conditionNum.toString(), { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('trial', '0', { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('max_trials', trialNum.toString(), { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('CurrentTrial', '1', { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('TrialsperBlock', TrialsperBlock.toString(), { maxAge: 3 * 60 * 60 * 1000 });
  
  const msgArray = [];
  
  for (let i = 0; i < arrangementNum; i++) {
    let Automsg = '';
    Automsg += json.children[i].name;
    Automsg += '<br />';
    const Autojson = json.children[i].children[0].children;
    for (const Autovalue of Autojson) {
      Automsg += Autovalue.name + ' : ' + trialNum + ' trials';
      Automsg += '<br />';
    }
    Automsg += '<br />';
    Automsg += 'The number of block is : ' + blockNum + '. You need to repeat the process above for ' + blockNum + ' times.';
    msgArray.push(Automsg);
  }
  
  const js_array = JSON.stringify(msgArray);
  
  let Automsg = '';
  let taskNum = 0;
  
  if (arrangement === 'Automatic') {
    taskNum = parseInt(user) % arrangementNum;
    Automsg = msgArray[taskNum];
  } else {
    taskNum = 0;
    Automsg = msgArray[taskNum];
  }
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Experiment Run Template 1</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script>
        $(document).ready(function(){
            var jsMsg = ${js_array};
            $("select").change(function(){
            	$('input[name="taskNum"]').val($("select").val());
                $("#arrangementContent").html( jsMsg[$("select").val()]);
            });
        });
    </script>
</head>
<body>
<div align="center">
    <form action="/task" method="post">
    <div align="center">
       <a href=""><img src="image/yourlogo.png"></a>
            <hr/>
    </div>
    <div align="center">
       <font size="+2" color="#FF0033" face="Georgia, Times New Roman, Times, serif"> Welcome to the XXX vs YYY experiment! </font>
       <br /><br />
       <br /><br />
       <font size="+1" color="#FF0033" face="Georgia, Times New Roman, Times, serif"> You have chosen the condition: </font>
       <br /><br />
    </div>
    ${arrangement === 'Manual' ? `
	<table>
		<tr height="35px">
		<td style="width:auto" align="left">
			<font style="font-weight:bold; font-size: 15pt">Arrangement: </font>
		</td>	
		<td>	
			<select name="tasks" style="width:auto">
				${Array.from({length: arrangementNum}, (_, i) => `<option value="${i}"> ${i} </option>`).join('')}
			</select>	
		</td>
		</tr>
	</table>
	` : ''}
    <table>
        <br /><br />
            <td>
                <p id="arrangementContent" style="font-size: 14pt">
                    ${Automsg}
                </p>
            </td>
    </table>
	<table>
		<br /><br />
		<td>
			<input name="taskNum" type="hidden" value="${taskNum}" >		
			<input id="submit" type="submit" style="width:100px; height:30px; font-weight:bold; font-size:20px" value="submit">
		</td>
	</table>
    </form>
</div>
</body>
</html>
  `;
  
  res.send(html);
});

app.post('/task', (req, res) => {
  const { taskNum } = req.body;
  
  if (taskNum !== undefined) {
    res.cookie('taskNum', taskNum, { maxAge: 3 * 60 * 60 * 1000 });
  }
  
  const user = req.cookies.user;
  if (!user) {
    return res.redirect('/?message=Please use a participant ID');
  }
  
  const block = parseInt(req.cookies.block || '0');
  const max_blocks = parseInt(req.cookies.max_blocks || '1');
  const trial = parseInt(req.cookies.trial || '0');
  const max_trials = parseInt(req.cookies.max_trials || '1');
  const condition = parseInt(req.cookies.condition || '0');
  const max_conditions = parseInt(req.cookies.max_conditions || '1');
  const CurrentTrial = parseInt(req.cookies.CurrentTrial || '1');
  const TrialsperBlock = parseInt(req.cookies.TrialsperBlock || '1');
  const currentTaskNum = req.cookies.taskNum || taskNum || '0';
  
  // Read JSON file
  const json = JSON.parse(fs.readFileSync('design/Arrangement.json', 'utf8'));
  const Autojson = json.children[parseInt(currentTaskNum)].children[block].children[condition].name;
  
  // Initialize session data
  const session_name = 'recordedData';
  const session_subject = 'subjectID';
  const session_betweenIV = 'betweenIV';
  
  if (!req.session[session_name]) {
    req.session[session_name] = json.children[parseInt(currentTaskNum)].children;
  }
  if (!req.session[session_subject]) {
    req.session[session_subject] = user;
  }
  if (!req.session[session_betweenIV]) {
    req.session[session_betweenIV] = json.children[parseInt(currentTaskNum)].name;
  }
  
  const html = `
<!DOCTYPE html>
<html>
<head>
<title>Experiment Run Template</title>
<link rel="stylesheet" href="css/general.css" />
<script type="text/javascript" src="js/count_time.js"></script>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script>
	function change() {
		stop_timer();
		var taskTime = Math.floor(secs/1000);
		jump("/mask", taskTime);
	}
	function jump(next_page, time) {
		location.href = next_page + "?taskTime=" + time;
	}
	$(document).ready(function(){
		$(window).keypress(function(e){
			if(e.which == 32) {
				stop_timer();
				var taskTime = Math.floor(secs/1000);
				jump("/mask", taskTime);
			}
		});
	});
</script>
</head>
<body> 
<div id="Header">
    <div id="InstructionAreaBox">
        <div id="InstructionArea">
		<left>
		<table>
			<b>Participant ID: </b> 
			  	${user}
				&nbsp; Trial: ${CurrentTrial}/${TrialsperBlock}
				&nbsp;
				&nbsp; Block: ${block + 1}/${max_blocks}
				&nbsp;
			<b>Timer. <script language="JavaScript">run()</script> </b> 
			<hr />	
			<p>${Autojson}</p>
			<div id="InstructionText">
				<p>Instruction here</p>
            </div>
		</table>
        </div>
    </div>
    <div id="InstructionButtonArea">
    	<center>
    	<button class="button1" onclick="change()" style="width: 120; height: 65; margin-top: 65px; font-size: 18px"><text class="black">Next task</text></button>
    	</center>
    </div>
</div>
<div id="Root">
</div>
</body>
</html>
  `;
  
  res.send(html);
});

app.get('/mask', (req, res) => {
  const taskTime = req.query.taskTime;
  
  if (!taskTime) {
    return res.redirect('/task?message=No taskTime passed');
  }
  
  const user = req.cookies.user;
  if (!user) {
    return res.redirect('/?message=Please use a participant ID');
  }
  
  let block = parseInt(req.cookies.block || '0');
  let condition = parseInt(req.cookies.condition || '0');
  let trial = parseInt(req.cookies.trial || '0');
  let CurrentTrial = parseInt(req.cookies.CurrentTrial || '1');
  
  const max_blocks = parseInt(req.cookies.max_blocks || '1');
  const max_conditions = parseInt(req.cookies.max_conditions || '1');
  const max_trials = parseInt(req.cookies.max_trials || '1');
  const TrialsperBlock = parseInt(req.cookies.TrialsperBlock || '1');
  
  // Store time in session
  if (req.session.recordedData) {
    req.session.recordedData[block].children[condition].children[trial].time = taskTime;
  }
  
  // Update counters
  const block_tmp = block;
  const condition_tmp = condition;
  const trial_tmp = trial;
  const CurrentTrial_tmp = CurrentTrial;
  
  trial++;
  CurrentTrial++;
  
  if (trial >= max_trials) {
    trial = 0;
    condition++;
    if (condition >= max_conditions) {
      condition = 0;
      CurrentTrial = 1;
      block++;
      if (block >= max_blocks) {
        return res.redirect('/final');
      }
    }
  }
  
  // Update cookies
  res.cookie('block', block.toString(), { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('condition', condition.toString(), { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('trial', trial.toString(), { maxAge: 3 * 60 * 60 * 1000 });
  res.cookie('CurrentTrial', CurrentTrial.toString(), { maxAge: 3 * 60 * 60 * 1000 });
  
  const html = `
<!DOCTYPE html>
<html>
<head>
<title>Experiment Run Template</title>
<script type="text/javascript" src="image/index.js"></script>
<script type="text/javascript" src="js/count_time.js"></script>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script>
	function jump(next_page) {
        location.href = next_page;
    }
    $(document).ready(function(){
		var name = prompt("Any request or problem to the participant?", "null");
		if(name != "null")
			jump("/task");
    });	
</script> 
</head>
<body>
	  <table>
		<b>Subject ID: </b> 
			   ${user}
		&nbsp; Trial: ${CurrentTrial_tmp}/${TrialsperBlock}
		&nbsp;
		&nbsp; Block: ${block + 1}/${max_blocks}
		&nbsp;
		<hr />	
	</table>
</body>
</html>
  `;
  
  res.send(html);
});

app.get('/final', (req, res) => {
  const config = JSON.parse(fs.readFileSync('config/config.json', 'utf8'));
  
  const html = `
<!DOCTYPE html>
<html>
<head>
<title>Experiment Run Template</title>
</head>
<body>
	<center>
	<table align="center">
		<tr id="image"> 
			<a href="http://hci.comp.nus.edu.sg/index.html"><img src="image/yourlogo.png"></a> 
			<hr/>
		</tr>
		<tr id="introduction">
			<div>
			<font size="+2" color="#FF0033" face="Georgia, Times New Roman, Times, serif"> Welcome to the XXX vs YYY experiment! </font>
			</div>	
			<br /><br />	
		</tr>
${config['post-questionnaire'] ? `
		<div align="center">
		<h4>Please fill in the post-questionnaire:</h4>
		<iframe src="${config['post-questionnaire']}" width="760" height="500" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>
		</div>
` : ''}
		<tr style="text-align:center">
			<br />
		    <hr />
			<div> <font size="+1">The experiment is over. Thanks for your participating!</font></div>
			<br />
			<div><a href="/download">Download</a> the resulting data.</div>
		</tr>
	</table>
</body>
</html>
  `;
  
  res.send(html);
});

app.get('/download', (req, res) => {
  const session_name = 'recordedData';
  const session_subject = 'subjectID';
  const session_betweenIV = 'betweenIV';
  
  if (!req.session[session_name] || !req.session[session_subject] || !req.session[session_betweenIV]) {
    return res.send('The result is not set successfully!');
  }
  
  const user = req.session[session_subject];
  const filename = `ResultOfParticipant-${user}.csv`;
  
  // Process between IV
  const DVArray = {};
  const betweenIV = req.session[session_betweenIV];
  
  if (betweenIV.includes('(')) {
    const DVpieces = betweenIV.split(',');
    for (let i = 0; i < DVpieces.length; i++) {
      let IV;
      if (i === 0) {
        IV = DVpieces[i].split('(')[1];
        if (IV) {
          IV = IV.split(')')[0].trim();
          if (IV !== '') {
            DVArray[`IV${i}`] = IV;
          }
        }
      } else if (i === DVpieces.length - 1) {
        IV = DVpieces[i].split(')')[0].trim();
        DVArray[`IV${i}`] = IV;
      } else {
        IV = DVpieces[i].trim();
        DVArray[`IV${i}`] = IV;
      }
    }
  }
  
  const NumOfBetweenIV = Object.keys(DVArray).length;
  const resultArray = [];
  
  req.session[session_name].forEach(block => {
    block.children.forEach(condition => {
      condition.children.forEach(trial => {
        const tmp = { ParticipantID: user };
        tmp.BlockNo = block.name;
        
        // Add between IVs
        for (let i = 0; i < NumOfBetweenIV; i++) {
          const IV_name = `IV${i}`;
          tmp[IV_name] = DVArray[IV_name];
        }
        
        // Parse condition name
        const pieces = condition.name.split(',');
        for (let i = 0; i < pieces.length; i++) {
          let IV;
          if (i === 0) {
            IV = pieces[i].split('(')[1];
            if (IV) {
              IV = IV.split(')')[0].trim();
              if (IV !== '') {
                tmp[`IV${i + NumOfBetweenIV}`] = IV;
              }
            }
          } else if (i === pieces.length - 1) {
            IV = pieces[i].split(')')[0].trim();
            tmp[`IV${i + NumOfBetweenIV}`] = IV;
          } else {
            IV = pieces[i].trim();
            tmp[`IV${i + NumOfBetweenIV}`] = IV;
          }
        }
        
        tmp.TrialNo = trial.name;
        tmp.Time = trial.time;
        
        resultArray.push(tmp);
      });
    });
  });
  
  // Generate CSV
  let csv = '';
  if (resultArray.length > 0) {
    const headers = Object.keys(resultArray[0]);
    csv += headers.join(',') + '\r\n';
    
    resultArray.forEach(row => {
      csv += headers.map(header => row[header]).join(',') + '\r\n';
    });
  }
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`NexP server running on http://localhost:${PORT}`);
});