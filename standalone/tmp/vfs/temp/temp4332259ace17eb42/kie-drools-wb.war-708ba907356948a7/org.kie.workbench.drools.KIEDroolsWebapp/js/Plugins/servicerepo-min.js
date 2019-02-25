if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.ServiceRepoIntegration=Clazz.extend({repoDialog:undefined,repoContent:undefined,construct:function(a){this.facade=a;
if(!(ORYX.READONLY==true||ORYX.VIEWLOCKED==true)){this.facade.offer({name:ORYX.I18N.View.connectServiceRepo,functionality:this.jbpmServiceRepoConnect.bind(this),group:"servicerepogroup",icon:ORYX.BASE_FILE_PATH+"images/repository_rep.gif",description:ORYX.I18N.View.connectServiceRepoDesc,index:4,minShape:0,maxShape:0,isEnabled:function(){return !(ORYX.READONLY==true||ORYX.VIEWLOCKED==true)
}.bind(this)})
}},jbpmServiceRepoConnect:function(){this._showInitialRepoScreen()
},_showInitialRepoScreen:function(){this.repoContent=new Ext.Panel({layout:"table",html:"<br/><br/><br/><br/><center>"+ORYX.I18N.View.noServiceSpecified+"</center>"});
var a=new Ext.Button({text:ORYX.I18N.View.connect,handler:function(){var b="";
var c=this._readCookie("designerservicerepos");
if(c!=null){b=c+","+Ext.getCmp("serviceurlfield").getRawValue()
}else{b=Ext.getCmp("serviceurlfield").getRawValue()
}this._createCookie("designerservicerepos",b,365);
this._updateRepoDialog(Ext.getCmp("serviceurlfield").getRawValue());
this.selectedrepourl=Ext.getCmp("serviceurlfield").getRawValue()
}.bind(this)});
this.repoDialog=new Ext.Window({autoCreate:true,autoScroll:true,layout:"fit",plain:true,bodyStyle:"padding:5px;",title:ORYX.I18N.View.connectServiceRepoDataTitle,height:440,width:600,modal:true,fixedcenter:true,shadow:true,proxyDrag:true,resizable:true,items:[this.repoContent],tbar:[this._getRepoCombo(),a],buttons:[{text:"Install selected item",handler:function(){if(this.mygrid.getSelectionModel().getSelectedCell()!=null){var b=this.mygrid.getSelectionModel().getSelectedCell()[0];
ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.View.installingRepoItem,title:""});
var c=this.mygrid.getStore().getAt(b).get("name");
var d=this.mygrid.getStore().getAt(b).get("category");
Ext.Ajax.request({url:ORYX.PATH+"jbpmservicerepo",method:"POST",success:function(f){try{if(f.responseText=="false"){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.failInstallation,title:""})
}else{ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"success",msg:ORYX.I18N.View.successInstall,title:""})
}}catch(g){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.failAssetsInstallation+": "+g,title:""})
}}.createDelegate(this),failure:function(){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.failAssetsInstallation+".",title:""})
}.createDelegate(this),params:{action:"install",profile:ORYX.PROFILE,uuid:window.btoa(encodeURI(ORYX.UUID)),asset:c,category:d,repourl:this.selectedrepourl}})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.LocalHistory.LocalHistoryView.msg,title:""})
}}.bind(this)},{text:ORYX.I18N.jPDLSupport.close,handler:function(){this.repoDialog.hide();
this.repoDialog.destroy(true);
delete this.repoDialog
}.bind(this)}]});
this.repoDialog.on("hide",function(){if(this.repoDialog){this.repoDialog.destroy(true);
delete this.repoDialog
}});
this.repoDialog.show()
},_getRepoCombo:function(){var b=new Array();
var f=new Ext.data.SimpleStore({fields:["url","value"],data:[[]]});
var c=this._readCookie("designerservicerepos");
if(c!=null){if(c.startsWith(",")){c=c.substr(1,c.length)
}if(c.endsWith(",")){c=c.substr(0,c.length-1)
}var k=c.split(",");
for(var g=0;
g<k.length;
g++){var d=k[g];
if(d.length>=0){var h=new Array();
h.push(d);
h.push(d);
b.push(h)
}}f.loadData(b);
f.commitChanges()
}else{var a=new Array();
a.push("http://people.redhat.com/tsurdilo/repository");
a.push("http://people.redhat.com/tsurdilo/repository");
b.push(a);
var j=new Array();
j.push("http://people.redhat.com/kverlaen/repository");
j.push("http://people.redhat.com/kverlaen/repository");
b.push(j);
f.loadData(b);
f.commitChanges()
}var e=new Ext.form.ComboBox({id:"serviceurlfield",name:"repourl",forceSelection:false,editable:true,allowBlank:false,displayField:"url",valueField:"value",mode:"local",queryMode:"local",typeAhead:true,value:"",triggerAction:"all",fieldLabel:"Location",width:300,store:f});
return e
},_updateRepoDialog:function(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.View.connectServiceRepoConnecting,title:""});
Ext.Ajax.request({url:ORYX.PATH+"jbpmservicerepo",method:"POST",success:function(c){try{if((c.responseText=="false")||(c.responseText.startsWith("false||"))){if(this.repoDialog){this.repoDialog.remove(this.repoContent,true)
}this.repoContent=new Ext.Panel({layout:"table",html:"<br/><br/><br/><br/><center>"+ORYX.I18N.View.noServiceSpecified+".</center>"});
this.repoDialog.add(this.repoContent);
this.repoDialog.doLayout();
if(c.responseText.startsWith("false||")){var b=c.responseText.split("||");
ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.failConnectService+" - "+b[1],title:""})
}else{ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.failConnectService,title:""})
}}else{this._showJbpmServiceInfo(c.responseText,a)
}}catch(d){if(this.repoDialog){this.repoDialog.remove(this.repoContent,true)
}this.repoContent=new Ext.Panel({layout:"table",html:"<br/><br/><br/><br/><center>"+ORYX.I18N.View.noServiceSpecified+"</center>"});
this.repoDialog.add(this.repoContent);
this.repoDialog.doLayout();
ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.failConnectService+":"+d,title:""})
}}.createDelegate(this),failure:function(){if(this.repoDialog){this.repoDialog.remove(this.repoContent,true)
}this.repoContent=new Ext.Panel({layout:"table",html:"<br/><br/><br/><br/><center>"+ORYX.I18N.View.noServiceSpecified+"</center>"});
this.repoDialog.add(this.repoContent);
this.repoDialog.doLayout();
ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.failConnectService+".",title:""})
},params:{action:"display",profile:ORYX.PROFILE,uuid:window.btoa(encodeURI(ORYX.UUID)),repourl:a}})
},_showJbpmServiceInfo:function(e,c){var g=e.evalJSON();
var f=[];
var b=0;
for(var d in g){f[b]=g[d];
b++
}this.mystore=new Ext.data.SimpleStore({fields:[{name:"name"},{name:"displayName"},{name:"icon"},{name:"category"},{name:"explanation"},{name:"documentation"},{name:"inputparams"},{name:"results"}],data:f});
var a=Ext.id();
this.mygrid=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:this.mystore,id:a,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"icon",header:ORYX.I18N.View.headerIcon,width:50,sortable:true,dataIndex:"icon",renderer:this._renderIcon},{id:"displayName",header:ORYX.I18N.View.headerName,width:100,sortable:true,dataIndex:"displayName",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"explanation",header:ORYX.I18N.View.headerExplanation,width:100,sortable:true,dataIndex:"explanation",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"documentation",header:ORYX.I18N.View.headerDocumentation,width:100,sortable:true,dataIndex:"documentation",renderer:this._renderDocs},{id:"inputparams",header:ORYX.I18N.View.headerInput,width:200,sortable:true,dataIndex:"inputparams",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"results",header:ORYX.I18N.View.headerResults,width:200,sortable:true,dataIndex:"results",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"category",header:ORYX.I18N.View.headerCategory,width:100,sortable:true,dataIndex:"category",editor:new Ext.form.TextField({allowBlank:true,disabled:true})}])});
if(this.repoDialog){this.repoDialog.remove(this.repoContent,true)
}this.repoContent=new Ext.TabPanel({activeTab:0,border:false,width:"100%",height:"100%",tabPosition:"top",layoutOnTabChange:true,deferredRender:false,items:[{title:ORYX.I18N.View.serviceNodes,autoScroll:true,items:[this.mygrid],layout:"fit",margins:"10 10 10 10"}]});
this.repoDialog.add(this.repoContent);
this.repoDialog.doLayout()
},_renderIcon:function(a){return'<img src="'+a+'"/>'
},_renderDocs:function(a){return'<a href="'+a+'" target="_blank">link</a>'
},_createCookie:function(c,d,e){if(e){var b=new Date();
b.setTime(b.getTime()+(e*24*60*60*1000));
var a="; expires="+b.toGMTString()
}else{var a=""
}document.cookie=c+"="+d+a+"; path=/"
},_readCookie:function(b){var e=b+"=";
var a=document.cookie.split(";");
for(var d=0;
d<a.length;
d++){var f=a[d];
while(f.charAt(0)==" "){f=f.substring(1,f.length)
}if(f.indexOf(e)==0){return f.substring(e.length,f.length)
}}return null
}});