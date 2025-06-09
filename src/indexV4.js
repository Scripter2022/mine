//const { getMaxListeners } = require("events");
//const nodemailer = require("nodemailer");
//let testEmailAccount = nodemailer.createTestAccount();
/** MySQL*/
// const { get } = require('https');
// const bodyParser = require('body-parser');

const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const urlencodedParser = express.urlencoded({ extended: false });
const xlsx = require('json-as-xlsx');
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: '192.168.20.50',
  user: 'userdb',
  password: 'iop',
  database: 'glpidb',
});
const app = express();

/*HANDLEBARS*/
const expressHandlebars = require('express-handlebars').engine;
app.engine(
  'handlebars',
  expressHandlebars({
    defaultLayout: 'main',
  })
);
app.set('view engine', 'handlebars');
app.use(function (req, res, next) {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});
// http://localhost:8080/
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static(__dirname + '/public'));
//app.use(morgan("combined", { stream: accessLogStream }));
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'accessMain.log'), {
  flags: 'a',
});

app.use(morgan('combined', { stream: accessLogStream }));

function getDate() {
  // return date of today

  let date1 = new Date();

  //console.log(date1);

  //date1.setDate(2);

  //date1.setMonth(3);

  console.log(date1);

  let dayStart = date1.getDate();
  let dayEnd = date1.getDate() + 1;
  let mounth = date1.getMonth() + 1;
  let year = date1.getFullYear();

  console.log(dayStart, dayEnd, mounth, year);

  if (dayEnd <= 31) {
    console.log('<=31');

    let dataStart = year + '-' + '0' + mounth + '-' + '0' + dayStart + 'T08:00:00.000Z';
    let dataStop = year + '-' + '0' + mounth + '-' + '0' + dayEnd + 'T08:00:00.000Z';
    let dataTime = [dataStart, dataStop];

    return dataTime;
  } else {
    console.log('>31');

    dayEnd = 1;

    let mounth2 = mounth++;
    let dataStart = year + '-' + '0' + mounth2 + '-' + '0' + dayStart + 'T08:00:00.000Z';
    let dataStop = year + '-' + '0' + mounth + '-' + '0' + dayEnd + 'T08:00:00.000Z';
    let dataTime = [dataStart, dataStop];

    return dataTime;
  }
}

//cron.schedule(' 41 08,16 * * *  ', getDate);

function getSqlData(date, res, req) {
  date = getDate();

  //date=[ '2024-07-031T08:00:00.000Z', '2024-08-01T08:00:00.000Z' ]

  console.log(date);

  connection.query(
    `SELECT COUNT(*) FROM glpi_tickets WHERE date BETWEEN '${date[0]}' AND '${date[1]}'`,
    function (err, rows1) {
      if (err) throw err;
      connection.query(
        `SELECT DATE_FORMAT(date, '%d/%m/%Y %H:%i'), name, users_id_recipient, status FROM glpi_tickets WHERE date BETWEEN '${date[0]}' AND '${date[1]}'`,
        function (err, rows2) {
          if (err) throw err;
          connection.query(
            `SELECT * FROM glpi_tickets 
          INNER JOIN glpi_tickets_users ON glpi_tickets.id=glpi_tickets_users.tickets_id 
          INNER JOIN glpi_groups_users ON glpi_tickets_users.users_id=glpi_groups_users.users_id
          INNER JOIN glpi_groups ON glpi_groups_users.groups_id=glpi_groups.id WHERE date BETWEEN '${date[0]}' AND '${date[1]}'`,
            function (err, rows3) {
              //console.log(rows1)
              var ticketsObjColl = [];
              let count = [];
              let group = [];
              let ticketStat = [];
              let obj = {};
              var ticketsObj = {};
              let key2 = 'count';
              let key5 = 'ticketS';
              let key8 = 'groupCount';
              let arrStatus = {};
              for (i = 0; i < rows2.length; i++) {
                if (rows2[i].status == 2) {
                  arrStatus[i] = 'в работе...';
                } else if (rows2[i].status == 6) {
                  arrStatus[i] = 'Закрыта';
                } else {
                  arrStatus[i] = 'ожидание...';
                }
                let key4 = 'tickets_' + i;

                ticketsObj[key4] = {
                  date: rows2[i]["DATE_FORMAT(date, '%d/%m/%Y %H:%i')"],
                  name: rows2[i].name,
                  status: arrStatus[i],
                };

                ticketsObjColl.push(ticketsObj[key4]);
              }

              obj[key5] = ticketsObjColl;

              for (i = 0; i < rows3.length; i++) {
                group[i] = rows3[i].name;
              }

              var sum_SGE = 0;
              var sum_SPR = 0;
              var sum_ASU = 0;
              var sum_SLA = 0;
              var sum_SOZS = 0;
              var sum_SPU = 0;
              var sum_SVT = 0;
              var sum_SVKH = 0;
              var sum_OVV = 0;
              var sum_OES = 0;
              var sum_OTT = 0;
              var sum_SB = 0;
              var sum_IT = 0;
              var podr = 0;
              var sum_BLAG = 0;

              for (i = 0; i < group.length; i++) {
                if (group[i] == 'Служба главного энергетика') {
                  sum_SGE = sum_SGE + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба противопожарного режима') {
                  sum_SPR = sum_SPR + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)

                if (group[i] == 'Служба автоматизированных систем управления') {
                  sum_ASU = sum_ASU + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба ледовой арены') {
                  sum_SLA = sum_SLA + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба по обслуживанию зданий и сооружений') {
                  sum_SOZS = sum_SOZS + 1;
                } else {
                  // console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба профессиональной уборки') {
                  sum_SPU = sum_SPU + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба вертикального транспорта') {
                  sum_SVT = sum_SVT + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба вентиляции, кондиционирования и холодоснабжения') {
                  sum_SVKH = sum_SVKH + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)

                if (group[i] == 'Отдел водоснабжения и водоотведения') {
                  sum_OVV = sum_OVV + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Отдел по электроснабжению') {
                  sum_OES = sum_OES + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Отдел теплотехники') {
                  sum_OTT = sum_OTT + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба безопасности') {
                  sum_SB = sum_SB + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Департамент IT и технологий') {
                  sum_IT = sum_IT + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                if (group[i] == 'Подрядчики') {
                  podr = podr + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                if (group[i] == 'Служба благоустройства') {
                  sum_BLAG = sum_BLAG + 1;
                } else {
                  //console.log('.')
                }
              }

              let groupName = [
                'Служба главного энергетика',
                'Служба противопожарного режима',
                'Служба автоматизированных систем управления',
                'Служба ледовой арены',
                'Служба по обслуживанию зданий и сооружений',
                'Служба профессиональной уборки',
                'Служба вертикального транспорта',
                'Служба вентиляции, кондиционирования и холодоснабжения',
                'Отдел водоснабжения и водоотведения',
                'Отдел по электроснабжению',
                'Отдел теплотехники',
                'Служба безопасности',
                'Департамент IT и технологий',
                'Подрядчики',
                'Служба благоустройства',
              ];

              let groupCount = [
                sum_SGE,
                sum_SPR,
                sum_ASU,
                sum_SLA,
                sum_SOZS,
                sum_SPU,
                sum_SVT,
                sum_SVKH,
                sum_OVV,
                sum_OES,
                sum_OTT,
                sum_SB,
                sum_IT,
                podr,
                sum_BLAG,
              ];

              count[0] = groupCount.reduce(function (sum, el) {
                return sum + el;
              });
              obj[key2] = count;

              for (i = 0; i < groupCount.length; i++) {
                let key7 = 'stat_' + i;
                ticketsObj[key7] = {
                  maintenance: groupName[i],
                  count: groupCount[i],
                };

                ticketStat.push(ticketsObj[key7]);
              }

              obj[key8] = ticketStat;

              console.log(obj);
              res.render('home copy', obj);
              //console.log(obj);
            }
          );
        }
      );
    }
  );
}
function getSqlDataPost(date, res, req) {
  //console.log('Date=> ' + date)
  console.log('POST');
  connection.query(
    `SELECT COUNT(*) FROM glpi_tickets WHERE date BETWEEN '${date[0]}' AND '${date[1]}'`,
    function (err, rows1) {
      if (err) throw err;
      connection.query(
        `SELECT DATE_FORMAT(date, '%d/%m/%Y %H:%i'), name, users_id_recipient, status FROM glpi_tickets WHERE date BETWEEN '${date[0]}' AND '${date[1]}'`,
        function (err, rows2) {
          if (err) throw err;
          connection.query(
            `SELECT * FROM glpi_tickets 
          INNER JOIN glpi_tickets_users ON glpi_tickets.id=glpi_tickets_users.tickets_id 
          INNER JOIN glpi_groups_users ON glpi_tickets_users.users_id=glpi_groups_users.users_id
          INNER JOIN glpi_groups ON glpi_groups_users.groups_id=glpi_groups.id WHERE date BETWEEN '${date[0]}' AND '${date[1]}'`,
            function (err, rows3) {
              var ticketsObjColl = [];
              let count = [];
              let group = [];
              let ticketStat = [];
              let obj = {};
              var ticketsObj = {};
              var arrStatus = {};
              let key2 = 'count';
              let key5 = 'ticketS';
              let key8 = 'groupCount';

              for (i = 0; i < rows2.length; i++) {
                if (rows2[i].status == 2) {
                  arrStatus[i] = 'в работе...';
                } else if (rows2[i].status == 6) {
                  arrStatus[i] = 'Закрыта';
                } else {
                  arrStatus[i] = 'ожидание...';
                }
                let key4 = 'tickets_' + i;
                ticketsObj[key4] = {
                  date: rows2[i]["DATE_FORMAT(date, '%d/%m/%Y %H:%i')"],
                  name: rows2[i].name,
                  status: arrStatus[i],
                };

                ticketsObjColl.push(ticketsObj[key4]);
              }
              obj[key5] = ticketsObjColl;
              // for (i = 0; i < rows1.length; i++) {
              //   count[i] = rows1[i]['COUNT(*)'];
              //   obj[key2] = count;
              // }

              for (i = 0; i < rows3.length; i++) {
                group[i] = rows3[i].name;
                //console.log(group[i]);
              }
              var sum_SGE = 0;
              var sum_SPR = 0;
              var sum_ASU = 0;
              var sum_SLA = 0;
              var sum_SOZS = 0;
              var sum_SPU = 0;
              var sum_SVT = 0;
              var sum_SVKH = 0;
              var sum_OVV = 0;
              var sum_OES = 0;
              var sum_OTT = 0;
              var sum_SB = 0;
              var sum_IT = 0;
              var podr = 0;
              var sum_BLAG = 0;

              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба главного энергетика') {
                  sum_SGE = sum_SGE + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба противопожарного режима') {
                  sum_SPR = sum_SPR + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба автоматизированных систем управления') {
                  sum_ASU = sum_ASU + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба ледовой арены') {
                  sum_SLA = sum_SLA + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба по обслуживанию зданий и сооружений') {
                  sum_SOZS = sum_SOZS + 1;
                } else {
                  // console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба профессиональной уборки') {
                  sum_SPU = sum_SPU + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба вертикального транспорта') {
                  sum_SVT = sum_SVT + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба вентиляции, кондиционирования и холодоснабжения') {
                  sum_SVKH = sum_SVKH + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Отдел водоснабжения и водоотведения') {
                  sum_OVV = sum_OVV + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Отдел по электроснабжению') {
                  sum_OES = sum_OES + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Отдел теплотехники') {
                  sum_OTT = sum_OTT + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Служба безопасности') {
                  sum_SB = sum_SB + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                //console.log(otchet.name)
                if (group[i] == 'Департамент IT и технологий') {
                  sum_IT = sum_IT + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                if (group[i] == 'Подрядчики') {
                  podr = podr + 1;
                } else {
                  //console.log('.')
                }
              }
              for (i = 0; i < group.length; i++) {
                if (group[i] == 'Служба благоустройства') {
                  sum_BLAG = sum_BLAG + 1;
                } else {
                  //console.log('.')
                }
              }
              let groupName = [
                'Служба главного энергетика',
                'Служба противопожарного режима',
                'Служба автоматизированных систем управления',
                'Служба ледовой арены',
                'Служба по обслуживанию зданий и сооружений',
                'Служба профессиональной уборки',
                'Служба вертикального транспорта',
                'Служба вентиляции, кондиционирования и холодоснабжения',
                'Отдел водоснабжения и водоотведения',
                'Отдел по электроснабжению',
                'Отдел теплотехники',
                'Служба безопасности',
                'Департамент IT и технологий',
                'Подрядчики',
                'Служба благоустройства',
              ];
              let groupCount = [
                sum_SGE,
                sum_SPR,
                sum_ASU,
                sum_SLA,
                sum_SOZS,
                sum_SPU,
                sum_SVT,
                sum_SVKH,
                sum_OVV,
                sum_OES,
                sum_OTT,
                sum_SB,
                sum_IT,
                podr,
                sum_BLAG,
              ];
              count[0] = groupCount.reduce(function (sum, el) {
                return sum + el;
              });
              obj[key2] = rows1[0];

              for (i = 0; i < groupCount.length; i++) {
                let key7 = 'stat_' + i;
                ticketsObj[key7] = {
                  maintenance: groupName[i],
                  count: groupCount[i],
                };
                ticketStat.push(ticketsObj[key7]);
              }
              obj[key8] = ticketStat;
              for (i = 0; i < ticketsObjColl.length; i++) {
                //console.log(ticketsObjColl[i].status);
                if (ticketsObjColl[i].status == 2) {
                  arrStatus[i] = 'В работе';
                } else if (ticketsObjColl[i].status == 6) {
                  arrStatus[i] = 'Закрыта';
                } else {
                  arrStatus[i] = 'Ожидает или статус не определен';
                }
              }

              res.render('home copy', obj);

              /*MYSPREADSHEET*/

              var groupCountExcel = obj.groupCount;
              var countExcel = { count: obj.count[0] };
              var ticketExcel = obj.ticketS;
              let data = [
                {
                  sheet: 'Заявки суточный',
                  columns: [
                    { label: 'Дата', value: (row) => row.date }, // Custom format
                    // { label: "Phone", value: (row) => (row.more ? row.more.phone || "" : "") }, // Run functions
                    { label: 'Заявка', value: (row) => row.name }, // Custom format
                    { label: 'Статус', value: (row) => row.status }, // Custom format
                  ],

                  content: ticketExcel,
                },
                {
                  sheet: 'Статистика',
                  columns: [
                    { label: 'Служба', value: (row) => row.maintenance }, // Custom format
                    // { label: "Phone", value: (row) => (row.more ? row.more.phone || "" : "") }, // Run functions
                    { label: 'Количество заявок *', value: (row) => row.count }, // Custom format
                  ],
                  content: groupCountExcel,
                },
                {
                  sheet: 'Общая',
                  columns: [
                    { label: 'Общее количество заявок', value: (row) => row.count }, // Custom format
                  ],
                  content: [countExcel],
                },
              ];

              let settings = {
                fileName: 'MySpreadsheet' + '_' + date[0] + '-' + date[1], // Name of the resulting spreadsheet
                extraLength: 3, // A bigger number means that columns will be wider
                writeMode: 'writeFile', // The available parameters are 'WriteFile' and 'write'. This setting is optional. Useful in such cases https://docs.sheetjs.com/docs/solutions/output#example-remote-file
                writeOptions: {}, // Style options from https://docs.sheetjs.com/docs/api/write-options
                RTL: false, // Display the columns from right-to-left (the default value is false)
              };

              xlsx(data, settings); // Will download the excel file
            }
          );
        }
      );
    }
  );

  // send mail with defined transport object
}

// async..await is not allowed in global scope, must use a wrapper

app.get('/', function (req, res, next) {
  getSqlData(req, res);

  //console.log(date);
});
app.get('/doc', function (req, res, next) {
  res.render('doc');
  console.log('DOC');
});

app.post(
  '/',
  urlencodedParser,
  function (req, res, next) {
    if (!req.body) return res.sendStatus(400);
    let dataS = req.body.dateStart + 'T08:00:00.000Z';
    let dataE = req.body.dateStop + 'T08:00:00.000Z';
    let date = [dataS, dataE];

    console.log(date);

    getSqlDataPost(date, res);
    next();
  },
  function (req, res, next) {
    let dataS = req.body.dateStart + 'T08:00:00.000Z';
    let dataE = req.body.dateStop + 'T08:00:00.000Z';
    let date = [dataS, dataE];

    console.log('Проверка чекбокса --> ' + req.body.excelExport);
    if (req.body.excelExport == 'on') {
      res.download('MySpreadsheet' + '_' + date[0] + '-' + date[1] + '.xlsx', function (error) {
        console.log('Грузим файл по выборке!');
        setTimeout(function () {
          fs.unlink('MySpreadsheet' + '_' + date[0] + '-' + date[1] + '.xlsx', (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log('Файл был удален!!!');
            }
          });
        }, 50000);
      });
    } else {
      console.log('checkbox not choos!!!');
    }
  }
);

app.listen(8080);
console.log('Сервер поднялся...');
