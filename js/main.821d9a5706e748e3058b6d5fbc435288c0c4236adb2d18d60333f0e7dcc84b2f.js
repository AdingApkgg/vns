(()=>{document.addEventListener("DOMContentLoaded",()=>{l(),u(),mediumZoom(".zoomable")});document.addEventListener("pjax:complete",()=>{quicklink.listen({priority:!0}),l(),u(),mediumZoom(".zoomable")});function l(){let e=document.getElementById("theme-toggle"),t=localStorage.getItem("theme")||"light";document.documentElement.setAttribute("data-theme",t),e&&e.addEventListener("click",()=>{let n=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",n),localStorage.setItem("theme",n)})}function u(){let e=document.querySelector("header"),t=document.getElementById("back-to-top");!e||!t||(window.addEventListener("scroll",function(){window.scrollY>200?e.classList.add("fixed"):e.classList.remove("fixed"),window.scrollY>300?(t.style.display="block",t.classList.add("show")):(t.style.display="none",t.classList.remove("show"))}),t.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"})}))}window.localStorage.getItem("fpson")==null||window.localStorage.getItem("fpson")=="1"?(a=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||function(e){window.setTimeout(e,16.666666666666668)}}(),s=0,d=0,i=Date.now(),c=Date.now(),r=function(){var e=Date.now(),t=e-c,n=Math.round(1e3/t);if(c=e,d++,s++,e>1e3+i){var n=Math.round(s*1e3/(e-i));if(n<=5)var o='<span style="color:#bd0000">\u5361\u6210ppt\u{1F922}</span>';else if(n<=15)var o='<span style="color:red">\u7535\u7ADE\u7EA7\u5E27\u7387\u{1F616}</span>';else if(n<=25)var o='<span style="color:orange">\u6709\u70B9\u96BE\u53D7\u{1F628}</span>';else if(n<35)var o='<span style="color:#9338e6">\u4E0D\u592A\u6D41\u7545\u{1F644}</span>';else if(n<=45)var o='<span style="color:#08b7e4">\u8FD8\u4E0D\u9519\u54E6\u{1F601}</span>';else var o='<span style="color:#39c5bb">\u5341\u5206\u6D41\u7545\u{1F923}</span>';document.getElementById("fps").innerHTML=`FPS:${n} ${o}`,s=0,i=e}a(r)},r()):document.getElementById("fps").style="display:none!important";var a,s,d,i,c,r,m=new MutationObserver(function(e){let t=document.querySelector(".aplayer-icon-lrc");t&&(setTimeout(function(){t.click()},1),m.disconnect())});m.observe(document,{childList:!0,subtree:!0});})();
