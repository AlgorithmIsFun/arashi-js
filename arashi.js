/*
 * ArashiJS
 * http://github.com/stephank/arashi-js
 *
 * © 2010, Stéphan Kochen
 * Licensed under the GNU GPL version 2.
 */
var Spike=function(a,b){this.lane=a;if(b){this.top=b}else{this.top=C.depth}};Spike.prototype.draw=function(){c.save();grid.laneTranslation(this.lane,this.top);c.moveTo(0,0);c.restore();c.save();grid.laneTranslation(this.lane,C.depth);c.lineTo(0,0);c.restore()};Spike.prototype.paint=function(){c.lineWidth=0.01;c.strokeStyle="white";c.beginPath();this.draw();c.stroke()};var spikes=[];spikes.init=function(){spikes.length=0;var a;spikes[grid.numLanes-1]=null;for(a=0;a<grid.numLanes;a++){spikes[a]=new Spike(a,80)}};spikes.paint=function(){var a;for(a=0;a<grid.numLanes;a++){spikes[a].paint()}};C.plasmaRotation=21/120*2*Math.PI;C.plasmaCorner=Math.PI*2/3;var Plasma=function(a){this.lane=a;this.depth=C.depth};Plasma.prototype.update=function(){this.depth-=8;if(this.depth<0){Snd.whiz();return true}else{return false}};Plasma.prototype.paint=function(){var e=this.depth*C.plasmaRotation,d,b,a;c.save();grid.laneTranslation(this.lane,this.depth);c.lineWidth=0.02;c.strokeStyle="white";c.fillStyle="white";c.beginPath();c.moveTo(0,0);for(d=0;d<3;d++){e+=C.plasmaCorner;b=Math.cos(e)/6;a=Math.sin(e)/6;c.lineTo(b,a);c.fillRect(-(b/2),-(a/2),0.03,0.03)}c.stroke();c.restore()};var Snd=(function(){var a={};var e=$("<audio></audio>")[0],f="none";if(e.canPlayType){if(!window.arashi_devmode&&e.canPlayType('audio/ogg; codecs="vorbis"')!=="no"){f="ogg"}else{f="wav"}}var b={};var d=function(g){if(f==="none"){a[g]=function(){}}else{var h="snd/"+g+"."+f;b[g]=new Audio(h);b[g].load();a[g]=function(){var i=new Audio(h);i.play();return i}}};d("blast");d("blow");d("bonk");d("dziuung");d("fadeinphazer");d("fadeoutphazer");d("fallyell");d("fallzap");d("flythru");d("phazer");d("splitter");d("springy");d("swish");d("swoosh");d("tadaum");d("whiz");d("zrooming");d("zzfreelife");d("zzsuperzap");return a}());var C={};var c=null;var frame=null;var grid=null;C.radPerDeg=Math.PI/180;C.startDepth=20;C.depth=120;C.endDepth=C.startDepth+C.depth;C.fogDepth=C.startDepth*2;Engine={machine:null,state:null};Engine.start=function(b){var a=$("#game")[0];frame={w:a.getAttribute("width"),h:a.getAttribute("height"),mouseX:0,mouseY:0};c=a.getContext("2d");$().mousemove(function(d){frame.mouseX=d.pageX-a.offsetLeft;frame.mouseY=d.pageY-a.offsetTop});if(!b){b=TitleMachine}this.resume();this.startMachine(b)};Engine.startMachine=function(a){this.machine=a;this.transition("start")};Engine.transition=function(d,b){if(b){this.state=null;this.pause(b,function(){Engine.transition(d)})}else{this.state=this.machine[d];var a=this.machine["enter_"+d];if(a){a.apply(this.machine)}}};Engine.pause=function(a,b){if(this.frameTimer){clearInterval(this.frameTimer);this.frameTimer=null}if(a){if(this.pauseTimer){clearTimeout(this.pauseTimer)}this.pauseTimer=setTimeout(function(){Engine.pauseTimer=null;Engine.resume();if(b){b()}},a)}};Engine.resume=function(){if(this.pauseTimer){clearTimeout(this.pauseTimer);this.pauseTimer=null}if(!this.frameTimer){this.frameTimer=setInterval(function(){Engine.render()},50)}};Engine.blank=function(){c.fillStyle="black";c.fillRect(0,0,frame.w,frame.h)};Engine.render=function(){var a=new Date();this.blank();if(this.machine&&this.state){this.state.apply(this.machine)}if(window.arashi_devmode){var b=new Date()-a;c.save();c.translate(0.5,0.5);c.scale(3,3);c.translate(1,1);c.lineWidth=0.3;c.strokeStyle="white";c.beginPath();Dig7Segment.drawNumber(b);c.stroke();c.restore()}};var Rand={};(function(){var a,f,e,b,d=Math.pow(2,32)-2;Rand.reseed=function(g){if(g!==undefined){a=g[0];f=g[1];e=g[2];b=g[3]}else{a=Math.floor(Math.random()*d)+1;f=Math.floor(Math.random()*d)+1;e=Math.floor(Math.random()*d)+1;b=Math.floor(Math.random()*d)+1}};Rand.reseed();Rand.getSeed=function(){return[a,f,e,b]};Rand.gen=function(){var g=a^((a<<11)&4294967295);a=f;f=e;e=b;b=(b^(b>>19))^(g^(g>>8));return b}}());var Lightning={};Lightning.init=function(){var a=30,d=0;var b=function(h){var f=[h],g=1;while(true){if(g>3&&(Rand.gen()%a)===0){g-=1;var e=f[g];f[g]=[b(e),b(e)];break}else{if(a>15){a-=2}}if(Rand.gen()%2){f[g]=[f[g-1][0]+2+(Rand.gen()%30),f[g-1][1]+20+(Rand.gen()%10)]}else{f[g]=[f[g-1][0]-2-(Rand.gen()%30),f[g-1][1]+20+(Rand.gen()%10)]}d++;if(f[g][1]>frame.h){break}g++}return f};this.segments=b([frame.w/2,0]);this.segmentsCount=d;this.drawStart=0;this.drawEnd=10;this.drawSpeed=frame.h/8+1;this.lightningHit=false;this.flashIntensity=0};Lightning.draw=function(a,b){if(a===undefined){a=0}if(b===undefined){b=frame.h}var l=[this.segments];while(l.length!==0){var g=l.shift(),f=true;for(var e=0;e<g.length;e++){var h=g[e];if(h[1]>b){break}if(h[0].length!==undefined){var m=h[0][0][0]+(Rand.gen()%4),k=h[0][0][1]+(Rand.gen()%4);for(var d=0;d<h.length;d++){h[d][0][0]=m;h[d][0][1]=k}if(!f){c.lineTo(m,k)}l=l.concat(h);break}if(h[1]<a){continue}if(f){c.moveTo(h[0],h[1])}else{c.lineTo(h[0],h[1])}f=false;if(e!==0){h[0]+=Rand.gen()%4;h[1]+=Rand.gen()%4}}}};Lightning.update=function(){if(this.flashIntensity<=1&&this.drawStart>=frame.h){return true}this.flashIntensity=Math.round(this.flashIntensity*2/3);if(!this.lightningHit){if(this.drawEnd<frame.h){this.drawEnd+=this.drawSpeed}else{this.flashIntensity=255;this.lightningHit=true}}else{if(this.drawStart<frame.h){this.drawStart+=this.drawSpeed}}return false};Lightning.paint=function(){var a=this.flashIntensity,b=Math.round(a/2);c.fillStyle="rgb("+b+","+b+","+a+")";c.fillRect(0,0,frame.w,frame.h);c.lineWidth=3;c.strokeStyle="white";c.beginPath();this.draw(this.drawStart,this.drawEnd);c.stroke()};Lightning.animate=function(){if(this.update()){return true}this.paint();return false};var Dig7Segment=(function(){var a=function(){var d=[],b;for(b=0;b<8;b++){d[b]=false}for(b=0;b<arguments.length;b++){d[arguments[b]]=true}return d};return{digits:[a(0,1,2,3,4,5),a(1,2),a(0,2,3,5,6),a(0,1,2,3,6),a(1,2,4,6),a(0,1,3,4,6),a(0,1,3,4,5,6),a(1,2,3),a(0,1,2,3,4,5,6),a(0,1,2,3,4,6)]}}());Dig7Segment.drawDigit=function(b){var a=this.digits[b];if(a===undefined){return}c.moveTo(2,2);if(a[2]){c.lineTo(2,0)}else{c.moveTo(2,0)}if(a[3]){c.lineTo(0,0)}else{c.moveTo(0,0)}if(a[4]){c.lineTo(0,2)}else{c.moveTo(0,2)}if(a[5]){c.lineTo(0,4)}else{c.moveTo(0,4)}if(a[0]){c.lineTo(2,4)}else{c.moveTo(2,4)}if(a[1]){c.lineTo(2,2)}else{c.moveTo(2,2)}if(a[6]){c.lineTo(0,2)}};Dig7Segment.drawNumber=function(b){var d=b.toString();c.save();for(var a=0;a<d.length;a++){this.drawDigit(parseInt(d[a],10));c.translate(3,0)}c.restore()};var Dig14Segment=(function(){var a=function(){var d=[],b;for(b=0;b<14;b++){d[b]=false}for(b=0;b<arguments.length;b++){d[arguments[b]]=true}return d};return{characters:{"$":a(0,1,3,4,5,9,7,11),"(":a(8,10),")":a(6,12),"+":a(5,7,9,11),",":a(12),"-":a(5,9),".":a(11),"/":a(12,8),"0":a(0,1,2,3,4,8,12,13),"1":a(7,11),"2":a(0,2,3,9,12),"3":a(0,1,2,3,9),"4":a(1,2,4,5,9),"5":a(3,6,9,1,0),"6":a(0,1,3,4,5,9,13),"7":a(12,8,3),"8":a(0,1,2,3,4,5,9,13),"9":a(0,1,2,3,4,5,9),"<":a(0,12),"=":a(0,5,9),">":a(0,10),"?":a(2,3,4,9,11),"@":a(0,2,3,4,13,9,7),A:a(1,2,3,4,5,9,13),B:a(0,1,2,3,7,9,11),C:a(0,3,4,13),D:a(0,1,2,3,7,11),E:a(0,3,4,5,9,13),F:a(3,4,5,9,13),G:a(0,1,3,4,9,13),H:a(1,2,4,5,9,13),I:a(0,3,7,11),J:a(0,1,2,13),K:a(4,13,5,8,10),L:a(0,4,13),M:a(1,2,4,13,6,8),N:a(1,2,4,13,6,10),O:a(0,1,2,3,4,13),P:a(2,3,4,13,5,9),Q:a(0,1,2,3,4,13,10),R:a(2,3,4,13,5,9,10),S:a(0,1,3,4,5,9),T:a(3,11,7),U:a(0,1,2,4,13),V:a(4,13,12,8),W:a(1,2,4,13,12,10),X:a(12,8,6,10),Y:a(6,8,11),Z:a(0,3,8,12),"[":a(0,3,4,13),"\\":a(6,10),"]":a(0,1,2,3),"^":a(12,10),_:a(0),"œ":a(3,6,8,12,10)}}}());Dig14Segment.drawCharacter=function(b){var a=this.characters[b];if(a===undefined){return}if(a[0]){c.moveTo(0,4);c.lineTo(2,4)}if(a[3]){c.moveTo(0,0);c.lineTo(2,0)}c.moveTo(1,4);if(a[11]){c.lineTo(1,2)}else{c.moveTo(1,2)}if(a[8]){c.lineTo(2,0)}else{c.moveTo(2,0)}if(a[2]){c.lineTo(2,2)}else{c.moveTo(2,2)}if(a[9]){c.lineTo(1,2)}else{c.moveTo(1,2)}if(a[10]){c.lineTo(2,4)}else{c.moveTo(2,4)}if(a[1]){c.lineTo(2,2)}c.moveTo(1,0);if(a[7]){c.lineTo(1,2)}else{c.moveTo(1,2)}if(a[12]){c.lineTo(0,4)}else{c.moveTo(0,4)}if(a[13]){c.lineTo(0,2)}else{c.moveTo(0,2)}if(a[5]){c.lineTo(1,2)}else{c.moveTo(1,2)}if(a[6]){c.lineTo(0,0)}else{c.moveTo(0,0)}if(a[4]){c.lineTo(0,2)}};Dig14Segment.drawText=function(b){c.save();for(var a=0;a<b.length;a++){this.drawCharacter(b[a]);c.translate(3,0)}c.restore()};var SizzlingLine={};SizzlingLine.draw=function(j,i,g,f,h,a){var l=g-j,k=f-i,e=(Rand.gen()%32)-16,d=j+(l/2)+((k*e)/h),b=i+(k/2)-((l*e)/h);c.moveTo(j,i);c.lineTo(d,b);c.lineTo(g,f)};var VectorLogo=function(b,a){this.size=b;this.lines=a};VectorLogo.prototype.init=function(d){if(d===undefined||d==="horizontal"){this.dsweep=1+(this.size[0]/32);this.sweep=0;this.vertical=false}else{this.dsweep=1+(this.size[0]/128);this.sweep=2*this.dsweep;this.vertical=true}var a=this.lines;for(var b=0;b<a.length;b++){a[b].state=false}};VectorLogo.prototype.animate=function(){c.lineWidth=2;c.lineCap="square";this.sweep+=this.dsweep;var b=true;for(var d=0;d<this.lines.length;d++){var a=this.lines[d];switch(a.state){case false:b=false;if((this.vertical&&this.sweep>a[3]+(a[1]/2))||(!this.vertical&&this.sweep>a[2]+(a[0]/2))){a.state=true;a.timer=6}break;case true:b=false;c.strokeStyle="blue";c.beginPath();SizzlingLine.draw(a[0],a[1],a[2],a[3],1+Math.pow(2,8-(a.timer/2)),3);c.stroke();a.timer-=1;if(a.timer===0){a.state=undefined}break;case undefined:c.strokeStyle="yellow";c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(a[2],a[3]);c.stroke();break}}return b};var ArashiLogo=new VectorLogo([656,180],[[59,0,117,180],[117,180,0,180],[0,180,27,104],[27,104,50,104],[50,104,32,158],[32,158,86,158],[86,158,50,36],[50,36,59,0,-1],[109,45,176,45],[176,45,194,54],[194,54,208,77],[208,77,208,95],[208,95,194,117],[194,117,208,140],[208,140,208,180],[208,180,194,180],[194,180,181,171],[181,171,181,140],[181,140,172,126],[172,126,131,126],[131,126,122,117],[122,117,122,108],[122,108,127,104],[127,104,176,104],[176,104,185,95],[185,95,185,81],[185,81,172,68],[172,68,113,68],[113,68,104,59],[104,59,104,54],[104,54,109,45,-1],[277,0,335,180],[335,180,218,180],[218,180,245,104],[245,104,268,104],[268,104,250,158],[250,158,304,158],[304,158,268,36],[268,36,277,0,-1],[348,158,434,158],[434,158,443,153],[443,153,443,144],[443,144,402,90],[402,90,402,63],[402,63,425,41],[425,41,461,41],[461,41,474,59],[474,59,470,63],[470,63,434,63],[434,63,425,68],[425,68,425,86],[425,86,456,126],[456,126,465,149],[465,149,456,171],[456,171,443,180],[443,180,348,180],[348,180,339,176],[339,176,348,158,-1],[472,180,521,18],[521,18,530,9],[530,9,539,32],[539,32,517,108],[517,108,557,108],[557,108,566,126],[566,126,512,126],[512,126,494,180],[494,180,472,180,-1],[557,180,607,18],[607,18,616,9],[616,9,625,32],[625,32,580,180],[580,180,557,180,-1],[607,180,638,72],[638,72,647,63],[647,63,656,86],[656,86,629,180],[629,180,607,180,-1]]);var GameOverLogo=new VectorLogo([1148,180],[[136,44,136,10],[136,10,126,0],[126,0,10,0],[10,0,0,10],[0,10,0,171],[0,171,8,179],[8,179,127,179],[127,179,136,170],[136,170,136,77],[136,77,126,67],[126,67,70,67],[70,67,70,88],[70,88,105,88],[105,88,114,97],[114,97,114,149],[114,149,105,157],[105,157,51,157],[51,157,43,149],[43,149,43,88],[43,88,22,67],[22,67,22,24],[22,24,30,16],[30,16,105,16],[105,16,114,25],[114,25,114,44],[114,44,136,44,-1],[194,0,252,179],[252,179,135,179],[135,179,163,102],[163,102,185,102],[185,102,167,157],[167,157,221,157],[221,157,185,36],[185,36,194,0,-1],[297,179,306,170],[306,170,306,111],[306,111,283,89],[283,89,283,77],[283,77,293,67],[293,67,342,67],[342,67,351,77],[351,77,351,179],[351,179,373,179],[373,179,373,77],[373,77,383,67],[383,67,422,67],[422,67,432,77],[432,77,432,179],[432,179,454,179],[454,179,454,53],[454,53,445,44],[445,44,269,44],[269,44,261,53],[261,53,261,179],[261,179,297,179,-1],[479,102,469,112],[469,112,469,171],[469,171,477,179],[477,179,586,179],[586,179,586,157],[586,157,518,157],[518,157,510,149],[510,149,510,125],[510,125,586,125],[586,125,586,102],[586,102,479,102,-1],[479,53,488,44],[488,44,586,44],[586,44,586,67],[586,67,520,67],[520,67,510,78],[510,78,510,97],[510,97,479,97],[479,97,479,53,-1],[676,0,666,10],[666,10,666,171],[666,171,674,179],[674,179,776,179],[776,179,784,171],[784,171,784,139],[784,139,766,157],[766,157,718,157],[718,157,710,149],[710,149,710,32],[710,32,720,22],[720,22,757,22],[757,22,766,31],[766,31,766,144],[766,144,784,126],[784,126,784,10],[784,10,774,0],[774,0,676,0,-1],[810,44,801,53],[801,53,801,125],[801,125,828,152],[828,152,828,170],[828,170,837,179],[837,179,891,179],[891,179,900,170],[900,170,900,125],[900,125,900,44],[900,44,882,44],[882,44,882,157],[882,157,864,157],[864,157,855,148],[855,148,855,67],[855,67,833,44],[833,44,810,44,-1],[928,102,918,112],[918,112,918,171],[918,171,926,179],[926,179,1035,179],[1035,179,1035,157],[1035,157,967,157],[967,157,959,149],[959,149,959,125],[959,125,1035,125],[1035,125,1035,102],[1035,102,928,102,-1],[928,53,937,44],[937,44,1035,44],[1035,44,1035,67],[1035,67,969,67],[969,67,959,78],[959,78,959,97],[959,97,928,97],[928,97,928,53,-1],[1049,44,1116,44],[1116,44,1134,53],[1134,53,1148,76],[1148,76,1148,94],[1148,94,1134,116],[1134,116,1148,139],[1148,139,1148,179],[1148,179,1134,179],[1134,179,1121,170],[1121,170,1121,139],[1121,139,1112,125],[1112,125,1071,125],[1071,125,1062,116],[1062,116,1062,107],[1062,107,1067,103],[1067,103,1116,103],[1116,103,1125,94],[1125,94,1125,80],[1125,80,1112,67],[1112,67,1053,67],[1053,67,1044,58],[1044,58,1044,53],[1044,53,1049,44,-1]]);var Starfield={stars:[],color:[255,255,255],currentStars:0,maxStars:75,newStars:2,spawnArea:null,starSpeed:5,twist:[0,0],origTwist:[0,0],targetTwist:[0,0],tweeker:0};Starfield.stars[Starfield.maxStars]=null;Starfield.feed=function(){if(this.spawnArea===null){this.spawnArea={t:frame.h*-0.5,l:frame.w*-0.5,h:frame.h,w:frame.w}}var a=Math.min(this.maxStars-this.currentStars,this.newStars);for(;a>0;a-=1){this.stars[this.currentStars]=[this.spawnArea.l+(Rand.gen()%this.spawnArea.w)+this.twist[0],this.spawnArea.t+(Rand.gen()%this.spawnArea.h)+this.twist[1],C.endDepth];this.currentStars++}};Starfield.ride=function(){if(this.twist[0]!==this.targetTwist[0]||this.twist[1]!==this.targetTwist[1]){this.tweeker++;this.twist=[this.origTwist[0]+(this.targetTwist[0]-this.origTwist[0])*this.tweeker/32,this.origTwist[1]+(this.targetTwist[1]-this.origTwist[1])*this.tweeker/32]}else{this.origTwist=this.targetTwist;this.tweeker=0}var b=[frame.w/2+this.twist[0],frame.h/2+this.twist[1]];c.fillStyle="rgb("+this.color[0]+","+this.color[1]+","+this.color[2]+")";for(var e=0;e<this.currentStars;e++){var f=this.stars[e];var a=(f[0]-this.twist[0])*C.startDepth/f[2]+b[0],g=(f[1]-this.twist[1])*C.startDepth/f[2]+b[1];if(a<0||a>frame.w||g<0||g>frame.h||f.z<=this.starSpeed){this.currentStars-=1;this.stars[e]=this.stars[this.currentStars];this.stars[this.currentStars]=null;e-=1}else{var d;if(f.z<C.fogDepth){d=1}else{d=Math.max(0,Math.min(1,1-(f[2]-C.fogDepth)/(C.depth-C.fogDepth)))}c.globalAlpha=d;c.fillRect(a,g,d*2,d*2);f[2]-=this.starSpeed}}c.globalAlpha=1};Starfield.twistFromGrid=function(){var a=Math.min(frame.w/grid.size[0],frame.h/grid.size[1]);this.targetTwist=[grid.twist[0]*a,grid.twist[1]*a]};var GameMachine={enter_start:function(){grid=Grids.Circle16;Starfield.color=grid.color=[0,0,255];spikes.init();Engine.transition("flyInStars")},enter_flyInStars:function(){setTimeout(function(){Starfield.twistFromGrid()},1000);setTimeout(function(){Engine.transition("flyInGrid")},3000)},flyInStars:function(){Starfield.feed();Starfield.ride()},enter_flyInGrid:function(){grid.distance=C.flyInStart},flyInGrid:function(){if(grid.distance<=C.flyInAdvance){grid.setDistance(0);Engine.transition("main")}else{grid.setDistance(grid.distance-C.flyInAdvance)}Starfield.ride();c.save();grid.screenTranslation();grid.paint();spikes.paint();c.restore()},enter_main:function(){Engine.pause()},main:function(){},enter_flyThru:function(){},flyThru:function(){}};var TitleMachine={enter_start:function(){Engine.transition("firstLightningStrike")},enter_firstLightningStrike:function(){Lightning.init();Engine.blank();Engine.pause(800)},firstLightningStrike:function(){if(Lightning.animate()){Engine.transition("logo",800)}},enter_logo:function(){ArashiLogo.init();Snd.blast();var b=frame.w*3/4,d=b/ArashiLogo.size[0],a=ArashiLogo.size[1]*d;this.scale=d;this.translation=[(frame.w-b)/2,(frame.h-a)/2]},logo:function(){c.save();c.translate(this.translation[0],this.translation[1]);c.scale(this.scale,this.scale);var a=ArashiLogo.animate();c.restore();if(a){Engine.transition("secondLightningStrike",3000)}},enter_secondLightningStrike:function(){Lightning.init();Engine.blank();Engine.pause(800)},secondLightningStrike:function(){if(Lightning.animate()){Engine.transition("demo",800)}},enter_demo:function(){Snd.blast();GameMachine.playbackMode=true;GameMachine.recording=null;Engine.startMachine(GameMachine)}};C.gridMargin=1.05;C.gridTwistFactor=1/32;C.flyInStart=2*C.depth;C.flyInAdvance=8;var Grids={};var Grid=function(e){this.wraps=e.wraps;this.angles=e.angles;this.twist=[e.twist[0]*C.gridTwistFactor,e.twist[1]*C.gridTwistFactor];var m=[],f=0,n=0,l=0,j,g,b=0,h=0,o=0,d=0;m[this.angles.length]=null;for(j=0;j<this.angles.length;j++){m[j]=[n,l];b=Math.min(n,b);h=Math.max(n,h);o=Math.min(l,o);d=Math.max(l,d);f+=this.angles[j];g=f*C.radPerDeg;n+=Math.cos(g);l-=Math.sin(g)}if(this.wraps){m[j]=m[0].concat([-1])}else{m[j]=[n,l];b=Math.min(n,b);h=Math.max(n,h);o=Math.min(l,o);d=Math.max(l,d)}b-=C.gridMargin;h+=C.gridMargin;o-=C.gridMargin;d+=C.gridMargin;var k=C.startDepth/C.endDepth;b=Math.min(b,(b-this.twist[0])*k+this.twist[0]);h=Math.max(h,(h-this.twist[0])*k+this.twist[0]);o=Math.min(o,(o-this.twist[1])*k+this.twist[1]);d=Math.max(d,(d-this.twist[1])*k+this.twist[1]);this.size=[h-b,d-o];var a=[-(b+h)/2,-(o+d)/2];for(j=0;j<m.length;j++){m[j][0]+=a[0];m[j][1]+=a[1]}this.coords=m;this.numLanes=this.coords.length-1;this.color=[255,255,255];this.scoords=[];this.scoords[this.coords.length-1]=null;this.setDistance(0)};Grid.prototype.screenTranslation=function(){c.translate(frame.w/2,frame.h/2);var a=Math.min(frame.w/this.size[0],frame.h/this.size[1]);c.scale(a,a);c.translate(this.twist[0],this.twist[1]);c.globalAlpha=this.alphaFactor};Grid.prototype.depthFactorAt=function(a){return C.startDepth/(C.startDepth+a+this.distance)};Grid.prototype.laneTranslation=function(e,g){var f=Math.round(e),j=e+0.5-f;var i=this.coords[f],h=this.coords[(f+1)%this.coords.length];var d=i[0]+j*(h[0]-i[0]),a=i[1]+j*(h[1]-i[1]);var b=this.depthFactorAt(g);c.scale(b,b);c.translate(d-this.twist[0],a-this.twist[1])};Grid.prototype.setDistance=function(f){this.distance=f;var a=this.depthFactorAt(0),d=this.depthFactorAt(C.depth),b,e;for(b=0;b<this.coords.length;b++){e=this.coords[b];this.scoords[b]={sx:(e[0]-this.twist[0])*a,sy:(e[1]-this.twist[1])*a,ex:(e[0]-this.twist[0])*d,ey:(e[1]-this.twist[1])*d,close:(e[2]===-1)}}if(this.distance<C.fogDepth){this.alphaFactor=1}else{this.alphaFactor=Math.max(0,1-(this.distance-C.startDepth)/(C.flyInStart-C.startDepth-1))}};Grid.prototype.drawArea=function(){var a,b;c.moveTo(this.scoords[0].sx,this.scoords[0].sy);for(a=1;a<this.scoords.length;a++){b=this.scoords[a];c.lineTo(b.sx,b.sy)}for(a-=1;a>=0;a-=1){b=this.scoords[a];c.lineTo(b.ex,b.ey)}c.closePath()};Grid.prototype.drawLanes=function(){var a,b;for(a=0;a<this.scoords.length;a++){b=this.scoords[a];c.moveTo(b.sx,b.sy);c.lineTo(b.ex,b.ey)}c.moveTo(this.scoords[0].sx,this.scoords[0].sy);for(a=1;a<this.scoords.length;a++){b=this.scoords[a];if(b.close){c.closePath();break}c.lineTo(b.sx,b.sy)}c.moveTo(this.scoords[0].ex,this.scoords[0].ey);for(a=1;a<this.scoords.length;a++){b=this.scoords[a];if(b.close){c.closePath();break}c.lineTo(b.ex,b.ey)}};Grid.prototype.paint=function(){var a="rgb("+this.color[0]+","+this.color[1]+","+this.color[2]+")";c.fillStyle=a;c.strokeStyle=a;c.lineWidth=0.01;c.globalAlpha=0.03*this.alphaFactor;c.beginPath();this.drawArea();c.fill();c.globalAlpha=this.alphaFactor;c.beginPath();this.drawLanes();c.stroke()};Grids.Circle16=new Grid({wraps:true,twist:[0,45],angles:[165,-21,-21,-21,-27,-21,-21,-21,-27,-21,-21,-21,-27,-21,-21,-21]});Grids.Square16=new Grid({wraps:true,twist:[0,0],angles:[90,0,0,0,270,0,0,0,-90,0,0,0,-90,0,0,0]});Grids.Plus16=new Grid({wraps:true,twist:[0,30],angles:[270,-90,0,-90,90,-90,0,-90,90,-90,0,-90,90,-90,0,-90]});Grids.Peanut16=new Grid({wraps:true,twist:[0,20],angles:[168,-33,-45,-45,-33,-39,27,27,-39,-33,-45,-45,-33,-39,27,27]});Grids.RoundedPlus16=new Grid({wraps:true,twist:[0,0],angles:[0,-69,24,21,-66,-69,24,24,-69,291,24,24,-69,-69,24,24]});Grids.Triangle15=new Grid({wraps:true,twist:[0,0],angles:[180,0,0,0,0,-120,0,0,0,0,-120,0,0,0,0]});Grids.X16=new Grid({wraps:true,twist:[0,0],angles:[63,-57,-90,-60,108,-60,-90,-57,126,-57,-90,-60,108,300,-90,-57]});Grids.V15=new Grid({wraps:false,twist:[0,-100],angles:[246,0,0,0,0,0,0,-66,-66,0,0,0,0,0,0]});Grids.Stairs15=new Grid({wraps:false,twist:[0,-100],angles:[270,270,90,270,90,270,90,270,270,90,270,90,270,90,270]});Grids.U16=new Grid({wraps:false,twist:[0,0],angles:[270,0,0,0,-15,-21,-21,-21,-24,-21,-24,-24,-9,0,0,0]});Grids.Flat16=new Grid({wraps:false,twist:[0,-128],angles:[180,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]});Grids.CircleCut16=new Grid({wraps:true,twist:[0,45],angles:[165,-21,-27,-27,-27,-51,-66,-24,156,-24,-69,-48,-27,-27,-30,-18]});Grids.Starburst16=new Grid({wraps:true,twist:[0,30],angles:[255,-105,60,-105,60,-105,60,-105,60,-105,60,-105,60,-105,60,-105]});Grids.W15=new Grid({wraps:false,twist:[0,-128],angles:[225,30,6,-33,-48,-48,-30,78,75,-27,-48,-48,-33,3,27]});Grids.CrookedV16=new Grid({wraps:false,twist:[0,-50],angles:[-102,0,-6,-72,72,12,-21,-69,51,-87,-21,-6,-6,3,6,6]});Grids.Eight16=new Grid({wraps:true,twist:[2,2],angles:[237,-39,-39,-42,-57,-45,-36,-39,3,39,39,39,60,42,39,39]});Grids.Grid200=new Grid({wraps:true,twist:[0,0],angles:[207,0,315,315,0,270,0,315,315,0,36,0,45,45,0,90,0,45,45,0]});Grids.Grid100=new Grid({wraps:false,twist:[0,45],angles:[180,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18]});Grids.Grid101=new Grid({wraps:true,twist:[0,0],angles:[90,0,0,0,270,0,0,0,0,270,0,0,0,0,270,0,0,0,0,270]});Grids.Grid102=new Grid({wraps:true,twist:[0,20],angles:[168,-33,-45,-45,-33,-39,27,27,-39,-33,-45,-45,-33,-39,27,27]});Grids.Grid103=new Grid({wraps:false,twist:[0,-100],angles:[234,0,0,0,0,0,0,246,0,0,0,0,0,0]});Grids.Grid104=new Grid({wraps:false,twist:[0,-100],angles:[270,270,90,270,90,270,90,270,270,90,270,90,270,90,270]});Grids.Grid105=new Grid({wraps:true,twist:[0,0],angles:[135,0,270,270,0,90,0,270,270,0,90,0,270,270,0,90,0,270,270,0]});Grids.Grid106=new Grid({wraps:true,twist:[-10,-10],angles:[90,0,0,270,0,270,90,90,270,0,270,0,0,270,0,270,90,90,270,0]});Grids.Grid107=new Grid({wraps:true,twist:[0,0],angles:[135,0,0,270,0,0,270,18,54,18,270,0,0,270,0,0,270,18,54,18]});Grids.Grid108=new Grid({wraps:true,twist:[0,0],angles:[90,270,90,270,0,270,90,270,90,270,0,270,90,270,90,270,0,270,90,270,90,270,0,270]});Grids.Grid109=new Grid({wraps:true,twist:[0,45],angles:[180,-72,36,-72,36,-72,36,-72,36,-72,36,-72,36,-72,36,-72,36,-72,36,-72]});Grids.Grid110=new Grid({wraps:true,twist:[0,0],angles:[78,0,270,0,0,270,0,0,270,0,0,270,45,0,0,90,0,0,90,0,0,90,0,0]});Grids.Grid111=new Grid({wraps:true,twist:[0,0],angles:[144,0,66,0,204,0,66,0,204,0,66,0,204,0,66,0,114,66,204,66,204,66,204,66]});Grids.Grid112=new Grid({wraps:true,twist:[0,0],angles:[45,0,270,270,0,45,45,0,270,270,0,45,45,0,270,270,0,45,45,0,270,270,0,45]});Grids.Grid113=new Grid({wraps:true,twist:[0,0],angles:[180,0,-120,0,0,0,0,-120,0,0,0,0,-120,0,0]});Grids.Grid114=new Grid({wraps:false,twist:[0,0],angles:[-180,0,0,-72,0,0,-72,0,0,-72,0,0,-72,0,0]});Grids.Grid115=new Grid({wraps:true,twist:[0,0],angles:[120,0,0,-60,0,0,-60,0,0,-60,0,0,-60,0,0,-60,0,0]});Grids.Grid116=new Grid({wraps:false,twist:[0,0],angles:[0,90]});Grids.Grid119=new Grid({wraps:true,twist:[0,30],angles:[180,-108,72,-108,72,-108,72,-108,72,-108,72,-108,72,-108,72,-108,72,-108,72,-108]});