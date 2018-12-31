const GetDataLimit = 3
var currentTry = 0

document.onreadystatechange = function () {
  if (document.readyState == 'complete') {
    getData()
  }
}

function getData () {
  if (currentTry > GetDataLimit) {
    return
  }
  currentTry += 1
  const svgElement = document.getElementById('user-locations')
  var dataUrl = svgElement.getAttribute('data-url')
  const schoolUrl = 'https://profile.intra.42.fr/'
  if (dataUrl.indexOf(schoolUrl) == -1) {
    dataUrl =
      'https://profile.intra.42.fr/' + svgElement.getAttribute('data-url')
  }
  load(dataUrl, function (err, data) {
    if (err !== null) {
      getData()
    } else {
      parseData(data)
    }
  })
}

function load (url, callback) {
  var xhr = new XMLHttpRequest()
  xhr.withCredentials = true
  xhr.open('GET', url, true)
  xhr.responseType = 'json'
  xhr.onloadend = function () {
    var status = xhr.status
    if (status === 200 || status === 304) {
      callback(null, xhr.response)
    } else {
      callback(status, xhr.response)
    }
  }
  xhr.send()
}

function parseData (data) {
  // data example: "2018-11-05": "01:20:43.223085",
  var months = {}
  var i = 0
  for (var date in data) {
    // date example: 2018-07-11: "07:34:27.879271"
    const month = getMount(date)
    if (months[month] == null) {
      months[month] = { HH: 0, MM: 0 }
    }
    const tmp = parseHour(data[date])
    months[month].HH += parseInt(tmp[0], 10)
    months[month].MM += parseInt(tmp[1], 10)
  }
  convertMM(months)
  const root_element = document.getElementById('user-locations')
  addDataInPage(root_element.childNodes, months)
}

function getMount (date) {
  // date example: 2018-07-11
  const tmp = date.split('-')
  return tmp[1]
}

function parseHour (day) {
  // totalDay example: "07:34:27.879271"
  const tmp = day.split(':')
  if (tmp.length == 3) {
    const HH = parseInt(tmp[0])
    const MM = parseInt(tmp[1])
    if (HH >= 0 && HH < 24 && MM >= 0 && MM < 60) {
      return [HH, MM]
    }
  }
  return [0, 0]
}

function convertMM (logtime) {
  for (var key in logtime) {
    if (logtime.hasOwnProperty(key)) {
      const mm = logtime[key].MM % 60
      const hh = (logtime[key].MM - mm) / 60
      logtime[key].HH += hh
      logtime[key].MM = (mm < 10 ? '0' : '') + mm
    }
  }
}

function addDataInPage (page, logtime) {
  var months = []
  var allMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  if (page.length == 0) {
    getData()
    return
  }
  for (var i = 0; i < page.length; i++) {
    if (page[i].nodeName === 'text') {
      const month = page[i].textContent
      var monthNumber = allMonths.indexOf(month) + 1
      monthNumber = (monthNumber < 10 ? '0' : '') + monthNumber
      var hours = '00h00'
      if (logtime[monthNumber] != null) {
        hours = logtime[monthNumber].HH + 'h' + logtime[monthNumber].MM
      }
      const newText = page[i].textContent + ' ' + hours
      page[i].textContent = newText
    }
  }
}
