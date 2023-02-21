let toggleBTN = document.getElementById('toggleBTN');
let sbar = document.getElementById('adsidebarForToggle');
var togglesbar = ()=>{
    if(sbar.getAttribute('togglestatus')=='true'){

        sbar.setAttribute('togglestatus','false')
        sbar.classList.remove('sbarActive')
    }else{
        sbar.classList.add('sbarActive')
        sbar.setAttribute('togglestatus','true')

    }
}