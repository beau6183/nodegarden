"use strict";!function(){function t(){n=window.innerWidth*o,r=window.innerHeight*o,e=n*r,h.length=Math.sqrt(e)/25|0,m.width=n,m.height=r;var t,a;for(t=0,a=h.length;a>t;t++)h[t]||(h[t]={x:Math.random()*n,y:Math.random()*r,vx:3*Math.random()-1.5,vy:3*Math.random()-1.5,m:1.5*Math.random()+1,link:null,pos:!1})}function a(){var t,e,o,m,i,y,x,v,M,l,s,c;for(requestAnimationFrame(a),d.clearRect(0,0,n,r),v=0,c=h.length-1;c>v;v++)for(M=v+1;c+1>M;M++)l=h[v],s=h[M],y=s.x-l.x,x=s.y-l.y,t=Math.sqrt(Math.pow(y,2)+Math.pow(x,2)),t<Math.max(l.m,s.m)?(l.m<=s.m&&(l.x=Math.random()*n,l.y=Math.random()*r,l.vx=2*Math.random()-1,l.vy=2*Math.random()-1),s.m<=l.m&&(s.x=Math.random()*n,s.y=Math.random()*r,s.vx=2*Math.random()-1,s.vy=2*Math.random()-1)):t>200||(e={x:y/t,y:x/t},o=10*l.m*s.m/Math.pow(t,2),o>.025&&(o=.025),d.beginPath(),d.strokeStyle="rgba(63,63,63,"+40*o+")",d.moveTo(l.x,l.y),d.lineTo(s.x,s.y),d.stroke(),m=o*e.x,i=o*e.y,l.pos!==s.pos?(l.vx-=m,l.vy-=i,s.vx+=m,s.vy+=i):(l.vx+=m,l.vy+=i,s.vx-=m,s.vy-=i));for(v=0,c=h.length;c>v;v++)d.beginPath(),d.arc(h[v].x,h[v].y,h[v].m,0,2*Math.PI),d.fill(),h[v].x+=h[v].vx,h[v].y+=h[v].vy,(h[v].x>n+25||h[v].x<-25||h[v].y>r+25||h[v].y<-25)&&(h[v].x=Math.random()*n,h[v].y=Math.random()*r,h[v].vx=2*Math.random()-1,h[v].vy=2*Math.random()-1)}var n,r,e,o=window.devicePixelRatio,h=new Array(Math.sqrt(e)/10|0),m=document.createElement("canvas"),d=m.getContext("2d"),i=document.getElementById("container");1!==o&&(m.style.transform="scale("+1/o+")",m.style.transformOrigin="0 0"),m.id="nodegarden",i.appendChild(m),t(),a(),window.addEventListener("resize",t)}();