// ==UserScript==
// @name        CopyPostHtml
// @namespace   https://github.com/a549956952/CopyPostHtml
// @description 复制Discuz!贴子HTML代码，方便制作EPUB。
// @author      废喵
// @include     *forum.php?*
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @grant       GM_unregisterMenuCommand
// @version     2021.02.02
// @name:zh-CN  复制帖子HTML
// ==/UserScript==

//读取设置
var start= GM_getValue('start', 1); //起始楼层
var end= GM_getValue('end', 1); //结束楼层
var isReplaceing = GM_getValue('isReplaceing', false); //是否替换HTML
var isAuto = GM_getValue('isAuto', false); //是否自动复制

//悬浮窗实现
function Toast(msg,duration,mode){
    duration = typeof duration !== 'undefined'?duration : 3000;
    mode = typeof mode !== 'undefined'?mode :"none"
    var m = document.createElement('div');
    m.innerHTML = msg;
    switch(mode) {
        case "r":
            m.style.cssText="max-width:60%;min-width: 150px;padding:0 14px;height: 40px;color: rgb(255, 255, 255);line-height: 40px;text-align: center;border-radius: 4px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(255, 0, 0,.7);font-size: 16px;";
            break;
        case "g":
            m.style.cssText="max-width:60%;min-width: 150px;padding:0 14px;height: 40px;color: rgb(255, 255, 255);line-height: 40px;text-align: center;border-radius: 4px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(0, 255, 0,.7);font-size: 16px;";
            break;
        default:
            m.style.cssText="max-width:60%;min-width: 150px;padding:0 14px;height: 40px;color: rgb(255, 255, 255);line-height: 40px;text-align: center;border-radius: 4px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(0, 0, 0,.7);font-size: 16px;";
    }

    document.body.appendChild(m);
    setTimeout(function() {
        var d = 0.5;
        m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
        m.style.opacity = '0';
        setTimeout(function() { document.body.removeChild(m) }, duration);
    }, duration);
}

//查找str里第num个cha的位置
  function find(str,cha,num){
    num--;
    var x=str.indexOf(cha);
    for(var i=0;i<num;i++){
        x=str.indexOf(cha,x+1);
    }
    return x;
    }

//复制到剪切板实现
function copyToClipboard (text) {
    /*     if(text.indexOf('-') !== -1) {
        let arr = text.split('-');
        text = arr[0] + arr[1];
    } */
    var textArea = document.createElement("textarea");
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();

    try {
        return document.execCommand('copy');
    } catch (err) {
        return false;
    }

    document.body.removeChild(textArea);
}

//重新加载会变动部分
function relaod()
{
    GM_unregisterMenuCommand(replaceingMenuId);
    GM_unregisterMenuCommand(autoMenuId);
    addReplaceingMenu();
    addAutoMenu()
}

//添加按钮
function addMenu() {
    GM_registerMenuCommand('复制HTML代码', onMenu);
}
function onMenu() {
    var url = window.location.href;
    var page = 1;
    if(url.lastIndexOf('&page=')!==-1)
       {
           if(url.indexOf('&',url.lastIndexOf('&page=')+5)==-1) page = url.slice(url.lastIndexOf('&page=')+6); else page = url.slice(url.lastIndexOf('&page=')+6,url.indexOf('&',url.lastIndexOf('&page=')+5));
       }
    var text= new String();
    var rep1 = /<br[^>]*>/ig;
    var rep2 = /<p><\/p>|<p>[\n]<\/p>/ig;
    var posts = document.querySelectorAll(".t_f");
    var title=document.getElementById("thread_subject").textContent;
    if(start>posts.length)
    {
        start = posts.length;
    }
    if(end>posts.length)
    {
        end = posts.length;
    }
    for(var i = start-1;i<end;i++)
    {
        var post = posts[i].innerHTML;
        if(isReplaceing)
        {
            post= post.slice(0,1)+"<p>"+post.slice(1)
            post=post+'</p>\n';
            post = post.replace( rep1, '</p><p>' );
            post = post.replace( rep2, '\n<br />' );
        }
        text=text+"\n<\!-- "+title+" 第"+page+"页 第"+(i+1)+"楼 -->\n"+post;
    }
    if(copyToClipboard(text)) Toast('已经复制当前页面'+start+'至'+end+'楼',3000,"g"); else Toast('复制失败',3000,"r");
}
addMenu();

var settingMenuId;
function addSettingMenu() {
    settingMenuId = GM_registerMenuCommand('设置复制楼层（仅当前页面楼层）', onSettingMenu);
}
function onSettingMenu() {
    start=prompt("起始楼层(1~10)",1);
    end=prompt("结束楼层(1~10)",1);
    GM_setValue('start', start);
    GM_setValue('end', end);
}
addSettingMenu();

var replaceingMenuId;
function addReplaceingMenu() {
    replaceingMenuId = GM_registerMenuCommand('是否替换换行符为段落标签(' + (isReplaceing ? '是' : '否') + ')', onReplaceingMenu);
}
function onReplaceingMenu() {
    isReplaceing = !isReplaceing;
    GM_setValue('isReplaceing', isReplaceing);
    relaod();
}
addReplaceingMenu();

var autoMenuId;
function addAutoMenu() {
    autoMenuId = GM_registerMenuCommand('是否自动执行(' + (isAuto ? '是' : '否') + ')', onAutoMenu);
}
function onAutoMenu() {
    isAuto = !isAuto;
    GM_setValue('isAuto', isAuto);
    relaod();
}
addAutoMenu();

//自动复制
if(isAuto)
{
    onMenu();
}
