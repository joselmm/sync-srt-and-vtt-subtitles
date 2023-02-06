const testRegExpT = new RegExp(/\d+\n\d\d:\d\d:\d\d,\d\d\d --> \d\d:\d\d:\d\d,\d\d\d\n/, "g");
const $fileInput = document.querySelector("#srt-input");
const $delay = document.querySelector("#delay");
const $btnSync = document.querySelector("#btn-sync");
const $limite = document.querySelector("#limite");
const $downloadLink = document.querySelector("#download-link");
const $btnDownload = document.querySelector("#btn-download");


function srtToMs(tiempoSrt) {
    tiempoSrt = "" + tiempoSrt;
    var milisc = Number(tiempoSrt.slice(-3));
    var sc = Number(tiempoSrt.slice(6, 8))
    var min = Number(tiempoSrt.slice(3, 5))
    var hours = Number(tiempoSrt.slice(0, 2))

    //conversion a milisegundos
    milisc = milisc
    sc = sc * 1000
    min = min * 60 * 1000
    hours = hours * 60 * 60 * 1000

    return (milisc + sc + min + hours)
};

function msToSrtTime(test) {

    //60 minutes per hour * 60 seconds per minute * 1000 ms per second = miliseconds per hour
    const msPerH = 60 * 60 * 1000;
    //3600000

    //60 seconds per minute * 1000 ms per second = miliseconds per minute
    const msPerM = 60 * 1000;
    //60000

    //1000 ms per second = ms per second
    const msPerS = 1000;

    // test number
    //let test = 2*msPerH + 59*msPerM + 59*msPerS + 222;
    //console.log(test);
    let hours = (test - (test % msPerH)) / msPerH;
    if (hours >= 100) { console.error("el numero exede las 99 horas"); return }
    test = test - (hours * msPerH);

    let minutes = (test - (test % msPerM)) / msPerM;
    test = test - (minutes * msPerM);

    let seconds = (test - (test % msPerS)) / msPerS;
    test = test - (seconds * msPerS);
    milisecondsString = "" + test;
    secondsString = "" + seconds;
    minutesString = "" + minutes;
    hoursString = "" + hours;


    let miliseconds = "";
    if (test === 0) {
        miliseconds = "000";
    } else if (milisecondsString.length === 1) {
        miliseconds = "00" + milisecondsString;
    } else if (milisecondsString.length === 2) {
        miliseconds = "0" + milisecondsString;
    } else if (milisecondsString.length === 3) {
        miliseconds = milisecondsString;
    }

    if (seconds === 0) {
        seconds = "00";
    } else if (secondsString.length === 1) {
        seconds = "0" + secondsString;
    } else if (milisecondsString.length === 2) {
        seconds = secondsString;
    }


    if (minutes === 0) {
        minutes = "00";
    } else if (minutesString.length === 1) {
        minutes = "0" + minutesString;
    } else if (minutesString.length === 2) {
        minutes = minutesString;
    }


    if (hours === 0) {
        hours = "00";
    } else if (hoursString.length === 1) {
        hours = "0" + hoursString;
    } else if (hoursString.length === 2) {
        hours = hoursString;
    }

    return (`${hours}:${minutes}:${seconds},${miliseconds}`)
};

function getTextFromInput($input) {
    return $input.files[0].text()
        .then((text) => { return text })
};
var textoPrevio = "";
function extractInfo(text) {
    var textos = text.split(testRegExpT)
    var indicesYTiempos = text.match(testRegExpT)
    textoPrevio = textos[0];//usame
    textos = textos.slice(1);
    const collection = [];
    if (!(indicesYTiempos.length === textos.length)) {
        console.error("el numero de indices y tiempos no es igual numero de textos\nDebe haber una igualdad entre ambas variables");
        return
    }
    textos.forEach((texto, i) => {
        var temp = {};
        var indice = indicesYTiempos[i].split("\n")[0];
        var tiempos = indicesYTiempos[i].split("\n")[1];
        var srtHomeTime = tiempos.split(" --> ")[0];
        var srtEndTime = tiempos.split(" --> ")[1];
        var msHomeTime = srtToMs(srtHomeTime);
        var msEndTime = srtToMs(srtEndTime);
        temp = {
            indice,
            srtHomeTime,
            srtEndTime,
            msHomeTime,
            msEndTime,
            texto
        }
        collection.push(temp);
    });
    return collection;
};

function syncTime({ info, delay }) {
    var syncInfo = [];
    //console.log(delay)
    info.forEach((elem, i) => {
        var add = true;
        var temp = {};
        var srtHomeTime = "", srtEndTime = "";
        var indice = elem.indice;
        var msHomeTime = elem.msHomeTime;
        var msEndTime = elem.msEndTime;
        var texto = elem.texto;

        //operaciones de delay
        var limite = (!!$limite.value) ? srtToMs($limite.value) : Infinity;
        if ((msHomeTime + delay >= 0) &&  (msEndTime + delay < limite)) {
            msHomeTime = msHomeTime + delay;
            msEndTime = msEndTime + delay;
            srtHomeTime = msToSrtTime(msHomeTime);
            srtEndTime = msToSrtTime(msEndTime);
        } else {
            add = false;
        }

        temp = {
            indice,
            srtHomeTime,
            srtEndTime,
            msHomeTime,
            msEndTime,
            texto
        }
        
        if (add) {syncInfo.push(temp)};
    })
    return syncInfo
};

function createNewSrtContent(info,textoPrevio) {
    let newSrtContent = (!!textoPrevio)? textoPrevio : "";
    info.forEach((elem,i) => {
        var indice = elem.indice;
        var srtHomeTime = elem.srtHomeTime;
        var srtEndTime = elem.srtEndTime;
        var texto = elem.texto;

        var statement = `${indice}\n${srtHomeTime} --> ${srtEndTime}\n${texto}`;
        newSrtContent+=statement;
    });
    return newSrtContent;
};

function createLink(srtContent, fileName) {
    const blob = new Blob([srtContent],{type:"text/plain"});
    $downloadLink.href= URL.createObjectURL(blob);
    $downloadLink.download= fileName;
    $btnDownload.disabled=false;
};


