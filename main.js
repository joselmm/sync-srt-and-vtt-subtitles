let text = "";
$fileInput.onchange = async (e) => {
    $btnDownload.disabled=true;
    if (e.target.files.length === 0) { return }
    text = await getTextFromInput(e.target);
    text = text.replace(/\r/g, "")
    if (!text) { $btnSync.disabled = true; return };
    $btnSync.disabled = false;
   
};

document.getElementById("quit-limit").onclick=()=>{
    $limite.value="";
    var limitCache = localStorage.setItem("limit","");
    $limite.focus();
}


$btnSync.onclick = (e) => {
    /* console.log("hi there!"); */
    //console.log(text.match(testRegExpT));
    if (!$delay.valueAsNumber) {
        console.error("indica un numero valido");
        return
    }
    if (!(testRegExpT.test(text))) {
        console.error("formato de texto no compatible con el estandar srt");
        return
    }

    var info = extractInfo(text);
    
    var syncedInfo = syncTime(
        {
            info,
            delay: $delay.valueAsNumber
        }
    );
    
    var newSrtContent = createNewSrtContent(syncedInfo);
    var fileName =$fileInput.files[0].name;
    console.log(fileName)
    createLink(newSrtContent, fileName);
};

$btnDownload.onclick=(e)=>{
    $downloadLink.click();
};

$limite.onchange=(e)=>{
    localStorage.setItem("limit", e.target.value)
};
var limitCache = localStorage.getItem("limit");
if(limitCache){$limite.value=limitCache}