if(!ORYX.Plugins){ORYX.Plugins=new Object()
}if(!ORYX.FieldEditors){ORYX.FieldEditors={}
}if(!ORYX.AssociationEditors){ORYX.AssociationEditors={}
}if(!ORYX.LabelProviders){ORYX.LabelProviders={}
}Ext.override(Ext.form.ComboBox,{anyMatch:false,caseSensitive:false,doQuery:function(c,b){if(c===undefined||c===null){c=""
}var a={query:c,forceAll:b,combo:this,cancel:false};
if(this.fireEvent("beforequery",a)===false||a.cancel){return false
}c=a.query;
b=a.forceAll;
if(b===true||(c.length>=this.minChars)){if(this.lastQuery!==c){this.lastQuery=c;
if(this.mode=="local"){this.selectedIndex=-1;
if(b){this.store.clearFilter()
}else{this.store.filter(this.displayField,c,this.anyMatch,this.caseSensitive)
}this.onLoad()
}else{this.store.baseParams[this.queryParam]=c;
this.store.load({params:this.getParams(c)});
this.expand()
}}else{this.selectedIndex=-1;
this.onLoad()
}}}});
ORYX.Plugins.PropertyWindow={facade:undefined,construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SHOW_PROPERTYWINDOW,this.init.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED,this.onSelectionChanged.bind(this));
this.init()
},init:function(){this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",null,["div"]);
this.currentDateFormat;
this.popularProperties=[];
this.simulationProperties=[];
this.displayProperties=[];
this.customAssignmentsProperties=[];
this.properties=[];
this.shapeSelection=new Hash();
this.shapeSelection.shapes=new Array();
this.shapeSelection.commonProperties=new Array();
this.shapeSelection.commonPropertiesValues=new Hash();
this.updaterFlag=false;
this.columnModel=new Ext.grid.ColumnModel([{header:ORYX.I18N.PropertyWindow.name,dataIndex:"name",width:90,sortable:true,renderer:this.tooltipRenderer.bind(this),css:"font-weight: bold;"},{header:ORYX.I18N.PropertyWindow.value,dataIndex:"value",id:"propertywindow_column_value",width:110,editor:new Ext.form.TextField({allowBlank:true}),renderer:this.renderer.bind(this)},{header:ORYX.I18N.PropertyWindow.desk,dataIndex:"groupname",hidden:true,sortable:true}]);
this.dataSource=new Ext.data.GroupingStore({proxy:new Ext.data.MemoryProxy(this.properties),reader:new Ext.data.ArrayReader({},[{name:"groupname"},{name:"name"},{name:"value"},{name:"icons"},{name:"gridProperties"}]),sortInfo:{field:"name",direction:"ASC"},groupField:"groupname"});
this.dataSource.load();
this.grid=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,clicksToEdit:1,stripeRows:true,autoExpandColumn:"propertywindow_column_value",width:"auto",colModel:this.columnModel,enableHdMenu:false,view:new Ext.grid.GroupingView({forceFit:false,groupTextTpl:"{[values.rs.first().data.groupname]}"}),store:this.dataSource});
region=this.facade.addToRegion("east",new Ext.Panel({width:400,layout:"anchor",autoScroll:true,autoHeight:true,border:false,items:[this.grid],anchors:"0, -30"}),ORYX.I18N.PropertyWindow.title);
this.grid.on("beforeedit",this.beforeEdit,this,true);
this.grid.on("afteredit",this.afterEdit,this,true);
this.grid.view.on("refresh",this.hideMoreAttrs,this,true);
this.grid.enableColumnMove=false
},selectDiagram:function(){this.shapeSelection.shapes=[this.facade.getCanvas()];
this.setPropertyWindowTitle();
this.identifyCommonProperties();
this.createProperties()
},specialKeyDown:function(b,a){if(b instanceof Ext.form.TextArea&&a.button==ORYX.CONFIG.KEY_Code_enter){return false
}},tooltipRenderer:function(b,c,a){c.cellAttr='title="'+a.data.gridProperties.tooltip+'"';
return b
},renderer:function(b,c,a){this.tooltipRenderer(b,c,a);
if(a.data.gridProperties.labelProvider){return a.data.gridProperties.labelProvider(b)
}if(b instanceof Date){b=b.dateFormat(ORYX.I18N.PropertyWindow.dateFormat)
}else{if(String(b).search("<a href='")<0){b=String(b).gsub("<","&lt;");
b=String(b).gsub(">","&gt;");
b=String(b).gsub("%","&#37;");
b=String(b).gsub("&","&amp;");
if(a.data.gridProperties.type==ORYX.CONFIG.TYPE_COLOR){b="<div class='prop-background-color' style='background-color:"+b+"' />"
}a.data.icons.each(function(d){if(d.name==b){if(d.icon){b="<img src='"+d.icon+"' /> "+b
}}})
}}return b
},beforeEdit:function(c){var d=this.dataSource.getAt(c.row).data.gridProperties.editor;
var a=this.dataSource.getAt(c.row).data.gridProperties.renderer;
if(d){this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
c.grid.getColumnModel().setEditor(1,d);
d.field.row=c.row;
d.render(this.grid);
d.setSize(c.grid.getColumnModel().getColumnWidth(1),d.height)
}else{return false
}var b=this.dataSource.getAt(c.row).data.gridProperties.propId;
this.oldValues=new Hash();
this.shapeSelection.shapes.each(function(e){this.oldValues[e.getId()]=e.properties[b]
}.bind(this))
},afterEdit:function(e){e.grid.getStore().commitChanges();
var c=e.record.data.gridProperties.propId;
var h=this.shapeSelection.shapes;
var b=this.oldValues;
var f=e.value;
var d=this.facade;
var a=ORYX.Core.Command.extend({construct:function(){this.key=c;
this.selectedElements=h;
this.oldValues=b;
this.newValue=f;
this.facade=d
},execute:function(){this.selectedElements.each(function(j){if(!j.getStencil().property(this.key).readonly()){j.setProperty(this.key,this.newValue)
}}.bind(this));
this.facade.setSelection(this.selectedElements);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.selectedElements.each(function(j){j.setProperty(this.key,this.oldValues[j.getId()])
}.bind(this));
this.facade.setSelection(this.selectedElements);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var g=new a();
this.facade.executeCommands([g]);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,elements:h,key:c,value:e.value})
},editDirectly:function(a,b){this.shapeSelection.shapes.each(function(d){if(!d.getStencil().property(a).readonly()){d.setProperty(a,b)
}}.bind(this));
var c=this.shapeSelection.shapes;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,elements:c,key:a,value:b});
this.facade.getCanvas().update()
},updateAfterInvalid:function(a){this.shapeSelection.shapes.each(function(b){if(!b.getStencil().property(a).readonly()){b.setProperty(a,this.oldValues[b.getId()]);
b.update()
}}.bind(this));
this.facade.getCanvas().update()
},dialogClosed:function(a){var b=this.field?this.field.row:this.row;
this.scope.afterEdit({grid:this.scope.grid,record:this.scope.grid.getStore().getAt(b),value:a});
this.scope.grid.startEditing(b,this.col)
},setPropertyWindowTitle:function(){if(this.shapeSelection.shapes.length==1){var a=this.shapeSelection.shapes.first().getStencil().title();
if(this.shapeSelection.shapes.first()&&this.shapeSelection.shapes.first().properties&&this.shapeSelection.shapes.first().properties["oryx-tasktype"]&&this.shapeSelection.shapes.first().properties["oryx-tasktype"].length>0){a=this.shapeSelection.shapes.first().properties["oryx-tasktype"]
}region.setTitle(ORYX.I18N.PropertyWindow.title+" ("+a+")")
}else{region.setTitle(ORYX.I18N.PropertyWindow.title+" ("+this.shapeSelection.shapes.length+" "+ORYX.I18N.PropertyWindow.selected+")")
}},setCommonPropertiesValues:function(){this.shapeSelection.commonPropertiesValues=new Hash();
this.shapeSelection.commonProperties.each(function(d){var c=d.prefix()+"-"+d.id();
var b=false;
var a=this.shapeSelection.shapes.first();
this.shapeSelection.shapes.each(function(e){if(a.properties[c]!=e.properties[c]){b=true
}}.bind(this));
if(!b){this.shapeSelection.commonPropertiesValues[c]=a.properties[c]
}}.bind(this))
},getStencilSetOfSelection:function(){var a=new Hash();
this.shapeSelection.shapes.each(function(b){a[b.getStencil().id()]=b.getStencil()
});
return a
},identifyCommonProperties:function(){this.shapeSelection.commonProperties.clear();
var d=this.getStencilSetOfSelection();
var c=d.values().first();
var b=d.values().without(c);
if(b.length==0){this.shapeSelection.commonProperties=c.properties()
}else{var a=new Hash();
c.properties().each(function(e){a[e.namespace()+"-"+e.id()+"-"+e.type()]=e
});
b.each(function(e){var f=new Hash();
e.properties().each(function(g){if(a[g.namespace()+"-"+g.id()+"-"+g.type()]){f[g.namespace()+"-"+g.id()+"-"+g.type()]=g
}});
a=f
});
this.shapeSelection.commonProperties=a.values()
}},onSelectionChanged:function(a){this.grid.stopEditing();
this.shapeSelection.shapes=a.elements;
if(a.elements){if(a.elements.length==0){this.shapeSelection.shapes=[this.facade.getCanvas()]
}}else{this.shapeSelection.shapes=[this.facade.getCanvas()]
}if(a.subSelection){this.shapeSelection.shapes=[a.subSelection]
}this.setPropertyWindowTitle();
this.identifyCommonProperties();
this.setCommonPropertiesValues();
this.createProperties()
},createProperties:function(){this.properties=[];
this.popularProperties=[];
this.simulationProperties=[];
this.customAssignmentsProperties=[];
this.displayProperties=[];
if(this.shapeSelection.commonProperties){this.shapeSelection.commonProperties.each((function(p,F){var t=p.prefix()+"-"+p.id();
var q=p.title();
var Z=[];
var C=this.shapeSelection.commonPropertiesValues[t];
var N=undefined;
var K=null;
var G=false;
var O=ORYX.FieldEditors[p.type()];
if(O!==undefined){N=O.init.bind(this,t,p,Z,F)();
if(N==null){return
}N.on("beforehide",this.facade.enableEvent.bind(this,ORYX.CONFIG.EVENT_KEYDOWN));
N.on("specialkey",this.specialKeyDown.bind(this))
}else{if(!p.readonly()){switch(p.type()){case ORYX.CONFIG.TYPE_STRING:if(p.wrapLines()){var f=new Ext.form.TextArea({alignment:"tl-tl",allowBlank:p.optional(),msgTarget:"title",maxLength:p.length()});
f.on("keyup",function(k,j){this.editDirectly(t,k.getValue().replace(/\\n/g,"\n"))
}.bind(this));
N=new Ext.Editor(f)
}else{var D=new Ext.form.TextField({allowBlank:p.optional(),msgTarget:"title",maxLength:p.length()});
D.on("keyup",function(j,k){this.editDirectly(t,j.getValue())
}.bind(this));
D.on("blur",function(j){if(!j.isValid(false)){this.updateAfterInvalid(t)
}}.bind(this));
D.on("specialkey",function(j,k){if(!j.isValid(false)){this.updateAfterInvalid(t)
}}.bind(this));
N=new Ext.Editor(D)
}break;
case ORYX.CONFIG.TYPE_BOOLEAN:var n=new Ext.form.Checkbox();
n.on("check",function(k,j){this.editDirectly(t,j)
}.bind(this));
N=new Ext.Editor(n);
break;
case ORYX.CONFIG.TYPE_INTEGER:var z=new Ext.form.NumberField({allowBlank:p.optional(),allowDecimals:false,msgTarget:"title",minValue:p.min(),maxValue:p.max()});
z.on("keyup",function(j,k){this.editDirectly(t,j.getValue())
}.bind(this));
N=new Ext.Editor(z);
break;
case ORYX.CONFIG.TYPE_FLOAT:var z=new Ext.form.NumberField({allowBlank:p.optional(),allowDecimals:true,msgTarget:"title",minValue:p.min(),maxValue:p.max()});
z.on("keyup",function(j,k){this.editDirectly(t,j.getValue())
}.bind(this));
N=new Ext.Editor(z);
break;
case ORYX.CONFIG.TYPE_COLOR:var X=new Ext.ux.ColorField({allowBlank:p.optional(),msgTarget:"title",facade:this.facade});
N=new Ext.Editor(X);
break;
case ORYX.CONFIG.TYPE_CHOICE:var v=p.items();
var y=[];
if(p.id()=="tasktype"&&ORYX.CALCULATE_CURRENT_PERSPECTIVE()==ORYX.RULEFLOW_PERSPECTIVE){v.each(function(j){if(j.value()==C){C=j.title()
}if(j.refToView()[0]){G=true
}if(j.value()=="Business Rule"||j.value()=="Script"||j.value()=="None"){if(ORYX.I18N.propertyNamesTaskType&&ORYX.I18N.propertyNamesTaskType[j.title()]&&ORYX.I18N.propertyNamesTaskType[j.title()].length>0){y.push([j.icon(),ORYX.I18N.propertyNamesTaskType[j.title()],j.value()])
}else{y.push([j.icon(),j.title(),j.value()])
}if(ORYX.I18N.propertyNamesTaskType&&ORYX.I18N.propertyNamesTaskType[j.title()]&&ORYX.I18N.propertyNamesTaskType[j.title()].length>0){Z.push({name:ORYX.I18N.propertyNamesTaskType[j.title()],icon:j.icon()})
}else{Z.push({name:j.title(),icon:j.icon()})
}}})
}else{v.each(function(k){if(k.value()==C){C=k.title()
}if(k.refToView()[0]){G=true
}var j="";
if(ORYX.I18N.propertyNamesValue[k.title()]&&ORYX.I18N.propertyNamesValue[k.title()].length>0){j=ORYX.I18N.propertyNamesValue[k.title()]
}else{j=k.title()
}if(!j){j=k.title()
}y.push([k.icon(),j,k.value()]);
Z.push({name:j,icon:k.icon()})
})
}var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
if(p.id()=="tasktype"){o.on("select",function(ad,j,k){this.editDirectly(t,ad.getValue());
var ab=this.facade.getSelection();
var ac=ab.first();
this.facade.setSelection([]);
this.facade.getCanvas().update();
this.facade.updateSelection();
this.facade.setSelection([ac]);
this.facade.getCanvas().update();
this.facade.updateSelection();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADED,elements:[ac]})
}.bind(this))
}else{o.on("select",function(ab,j,k){this.editDirectly(t,ab.getValue())
}.bind(this))
}N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DYNAMICCHOICE:var v=p.items();
var y=[];
var aa=false;
var R="";
v.each(function(af){if(af.value()==C){C=af.title()
}if(af.refToView()[0]){G=true
}if(af.needsprop().length>0){aa=true;
R=af.needsprop()
}y.push(["","",""]);
var ad=ORYX.EDITOR.getSerializedJSON();
var ae=jsonPath(ad.evalJSON(),af.value());
if(ae){if(ae.toString().length>0){for(var ac=0;
ac<ae.length;
ac++){var ag=ae[ac].split(",");
for(var ab=0;
ab<ag.length;
ab++){if(ag[ab].indexOf(":")>0){var k=ag[ab].split(":");
y.push([af.icon(),k[0],k[0]])
}else{y.push([af.icon(),ag[ab],ag[ab]])
}}}}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.PropertyWindow.noDataAvailableForProp,title:""})
}Z.push({name:af.title(),icon:af.icon()})
});
var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(af,j,ab){if(aa==true&&R.length>0){var ae=ORYX.EDITOR._pluginFacade.getSelection();
if(ae){var k=ae.first();
var ad="oryx-"+R;
var ac=k.properties[ad];
if(ac!=undefined&&ac.length<1){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"warning",msg:"This property needs the associated property '"+R+"' to be set.",title:""})
}}}this.editDirectly(t,af.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DYNAMICDATAINPUT:var y=[];
var r=ORYX.EDITOR._pluginFacade.getSelection();
if(r&&r.length==1){var u=r.first();
var s=u.resourceId;
var Y=ORYX.EDITOR.getSerializedJSON();
y.push(["","",""]);
var P=jsonPath(Y.evalJSON(),"$.childShapes.*");
for(var W=0;
W<P.length;
W++){var h=P[W];
if(h.resourceId==s){var Q=h.properties.datainputset;
var B=Q.split(",");
for(var V=0;
V<B.length;
V++){var m=B[V];
if(m.indexOf(":")>0){var a=m.split(":");
y.push(["",a[0],a[0]])
}else{y.push(["",m,m])
}}}}}var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(ab,j,k){this.editDirectly(t,ab.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DYNAMICDATAOUTPUT:var y=[];
var r=ORYX.EDITOR._pluginFacade.getSelection();
if(r&&r.length==1){var u=r.first();
var s=u.resourceId;
var Y=ORYX.EDITOR.getSerializedJSON();
y.push(["","",""]);
var P=jsonPath(Y.evalJSON(),"$.childShapes.*");
for(var W=0;
W<P.length;
W++){var h=P[W];
if(h.resourceId==s){var e=h.properties.dataoutputset;
var g=e.split(",");
for(var S=0;
S<g.length;
S++){var m=g[S];
if(m.indexOf(":")>0){var a=m.split(":");
y.push(["",a[0],a[0]])
}else{y.push(["",m,m])
}}}}}var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(ab,j,k){this.editDirectly(t,ab.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DYNAMICGATEWAYCONNECTIONS:var U=ORYX.Config.FACADE.getSelection();
var y=[];
if(U&&U.length==1){var u=U.first();
var s=u.resourceId;
var Y=ORYX.EDITOR.getSerializedJSON();
var x=new XMLHttpRequest;
var d=ORYX.PATH+"processinfo";
var c="uuid="+window.btoa(encodeURI(ORYX.UUID))+"&ppdata="+ORYX.PREPROCESSING+"&profile="+ORYX.PROFILE+"&gatewayid="+s+"&json="+encodeURIComponent(Y);
x.open("POST",d,false);
x.setRequestHeader("Content-type","application/x-www-form-urlencoded");
x.send(c);
if(x.status==200){var J=x.responseText.evalJSON();
for(var W=0;
W<J.length;
W++){var h=J[W];
y.push(["",h.sequenceflowinfo,h.sequenceflowinfo])
}}else{ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.errorDetOutConnections,title:""})
}}var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(ab,j,k){this.editDirectly(t,ab.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DATE:var I=ORYX.I18N.PropertyWindow.dateFormat;
if(!(C instanceof Date)){C=Date.parseDate(C,I)
}N=new Ext.Editor(new Ext.form.DateField({allowBlank:p.optional(),format:I,msgTarget:"title"}));
break;
case ORYX.CONFIG.TYPE_TEXT:var E=new Ext.form.ComplexTextField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_VARDEF:var E=new Ext.form.ComplexVardefField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_EXPRESSION:var E=new Ext.form.ConditionExpressionEditorField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_CALLEDELEMENT:var E=new Ext.form.ComplexCalledElementField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_RULEFLOW_GROUP:var E=new Ext.form.ComplexRuleflowGroupElementField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_CUSTOM:var E=new Ext.form.ComplexCustomField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade,title:(ORYX.I18N.propertyNames[p.id()]&&ORYX.I18N.propertyNames[p.id()].length>0)?ORYX.I18N.propertyNames[p.id()]:p.title(),attr:C});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_ACTION:var E=new Ext.form.ComplexActionsField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_GLOBAL:var E=new Ext.form.ComplexGlobalsField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_IMPORT:var E=new Ext.form.ComplexImportsField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_REASSIGNMENT:var E=new Ext.form.ComplexReassignmentField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_NOTIFICATIONS:var E=new Ext.form.ComplexNotificationsField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAINPUT:var E=new Ext.form.ComplexDataInputField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAINPUT_SINGLE:var E=new Ext.form.ComplexDataInputFieldSingle({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAOUTPUT:var E=new Ext.form.ComplexDataOutputField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAOUTPUT_SINGLE:var E=new Ext.form.ComplexDataOutputFieldSingle({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAASSIGNMENT:var E=new Ext.form.ComplexDataAssignmenField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade,shapes:this.shapeSelection.shapes});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_VISUALDATAASSIGNMENTS:var E=new Ext.form.ComplexVisualDataAssignmentField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade,shapes:this.shapeSelection.shapes});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_COMPLEX:var E=new Ext.form.ComplexListField({allowBlank:p.optional()},p.complexItems(),t,this.facade);
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case"CPNString":var D=new Ext.form.TextField({allowBlank:p.optional(),msgTarget:"title",maxLength:p.length(),enableKeyEvents:true});
D.on("keyup",function(j,k){this.editDirectly(t,j.getValue())
}.bind(this));
N=new Ext.Editor(D);
break;
default:var D=new Ext.form.TextField({allowBlank:p.optional(),msgTarget:"title",maxLength:p.length(),enableKeyEvents:true});
D.on("keyup",function(j,k){this.editDirectly(t,j.getValue())
}.bind(this));
N=new Ext.Editor(D)
}N.on("beforehide",this.facade.enableEvent.bind(this,ORYX.CONFIG.EVENT_KEYDOWN));
N.on("specialkey",this.specialKeyDown.bind(this))
}else{if(p.type()===ORYX.CONFIG.TYPE_URL||p.type()===ORYX.CONFIG.TYPE_DIAGRAM_LINK){C=String(C).search("http")!==0?("http://"+C):C;
C="<a href='"+C+"' target='_blank'>"+C.split("://")[1]+"</a>"
}}}if((p.visible()&&p.visible()==true)&&p.hidden()!=true&&(p.id()!="origbordercolor"&&p.id()!="origbgcolor"&&p.id()!="isselectable")){var H=true;
if(this.shapeSelection.shapes.length==1){if(p.fortasktypes()&&p.fortasktypes().length>0){var l=false;
var A=p.fortasktypes().split("|");
for(var W=0;
W<A.size();
W++){if(A[W]==this.shapeSelection.shapes.first().properties["oryx-tasktype"]){l=true
}}if(!l){H=false
}}if(p.ifproptrue()&&p.ifproptrue().length>0){var w=false;
var M=p.ifproptrue();
if(this.shapeSelection.shapes.first().properties["oryx-"+M]&&this.shapeSelection.shapes.first().properties["oryx-"+M]=="true"){w=true
}if(!w){H=false
}}if(p.fordistribution()&&p.fordistribution().length>0){var L=false;
var A=p.fordistribution().split("|");
for(var V=0;
V<A.size();
V++){if(A[V]==this.shapeSelection.shapes.first().properties["oryx-distributiontype"]){L=true
}}if(!L){H=false
}}}if(H){if(p.popular()){p.setPopular()
}if(p.simulation()){p.setSimulation()
}if(p.customassignment()){p.setCustomassignment()
}if(p.display()){p.setDisplay()
}if(p.extra()){p.setExtra()
}if(p.customassignment()){var T=(ORYX.I18N.propertyNames[p.id()]&&ORYX.I18N.propertyNames[p.id()].length>0)?ORYX.I18N.propertyNames[p.id()]:q;
this.properties.push(["Assignments",T,C,Z,{editor:N,propId:t,type:p.type(),tooltip:(ORYX.I18N.propertyNames[p.id()+"_desc"]&&ORYX.I18N.propertyNames[p.id()+"_desc"].length>0)?ORYX.I18N.propertyNames[p.id()+"_desc"]:p.description(),renderer:K,labelProvider:this.getLabelProvider(p)}])
}else{if(p.extra()){var T=(ORYX.I18N.propertyNames[p.id()]&&ORYX.I18N.propertyNames[p.id()].length>0)?ORYX.I18N.propertyNames[p.id()]:q;
this.properties.push([ORYX.I18N.PropertyWindow.moreProps,T,C,Z,{editor:N,propId:t,type:p.type(),tooltip:(ORYX.I18N.propertyNames[p.id()+"_desc"]&&ORYX.I18N.propertyNames[p.id()+"_desc"].length>0)?ORYX.I18N.propertyNames[p.id()+"_desc"]:p.description(),renderer:K,labelProvider:this.getLabelProvider(p)}])
}else{if(p.simulation()){var T=(ORYX.I18N.propertyNames[p.id()]&&ORYX.I18N.propertyNames[p.id()].length>0)?ORYX.I18N.propertyNames[p.id()]:q;
this.simulationProperties.push([ORYX.I18N.PropertyWindow.simulationProps,T,C,Z,{editor:N,propId:t,type:p.type(),tooltip:(ORYX.I18N.propertyNames[p.id()+"_desc"]&&ORYX.I18N.propertyNames[p.id()+"_desc"].length>0)?ORYX.I18N.propertyNames[p.id()+"_desc"]:p.description(),renderer:K,labelProvider:this.getLabelProvider(p)}])
}else{if(p.display()){var T=(ORYX.I18N.propertyNames[p.id()]&&ORYX.I18N.propertyNames[p.id()].length>0)?ORYX.I18N.propertyNames[p.id()]:q;
this.displayProperties.push([ORYX.I18N.PropertyWindow.displayProps,T,C,Z,{editor:N,propId:t,type:p.type(),tooltip:(ORYX.I18N.propertyNames[p.id()+"_desc"]&&ORYX.I18N.propertyNames[p.id()+"_desc"].length>0)?ORYX.I18N.propertyNames[p.id()+"_desc"]:p.description(),renderer:K,labelProvider:this.getLabelProvider(p)}])
}else{var T=(ORYX.I18N.propertyNames[p.id()]&&ORYX.I18N.propertyNames[p.id()].length>0)?ORYX.I18N.propertyNames[p.id()]:q;
this.popularProperties.push([ORYX.I18N.PropertyWindow.oftenUsed,T,C,Z,{editor:N,propId:t,type:p.type(),tooltip:(ORYX.I18N.propertyNames[p.id()+"_desc"]&&ORYX.I18N.propertyNames[p.id()+"_desc"].length>0)?ORYX.I18N.propertyNames[p.id()+"_desc"]:p.description(),renderer:K,labelProvider:this.getLabelProvider(p)}])
}}}}}}}).bind(this))
}this.setProperties()
},getLabelProvider:function(a){lp=ORYX.LabelProviders[a.labelProvider()];
if(lp){return lp(a)
}return null
},hideMoreAttrs:function(a){if(this.properties.length<=0){return
}this.grid.view.un("refresh",this.hideMoreAttrs,this)
},setProperties:function(){var d=this.popularProperties.concat(this.properties);
var a=d.concat(this.simulationProperties);
var c=a.concat(this.customAssignmentsProperties);
var b=c.concat(this.displayProperties);
this.dataSource.loadData(b)
}};
ORYX.Plugins.PropertyWindow=Clazz.extend(ORYX.Plugins.PropertyWindow);
Ext.form.ComplexListField=function(b,a,c,d){Ext.form.ComplexListField.superclass.constructor.call(this,b);
this.items=a;
this.key=c;
this.facade=d
};
Ext.extend(Ext.form.ComplexListField,Ext.form.TriggerField,{triggerClass:"x-form-complex-trigger",readOnly:true,emptyText:ORYX.I18N.PropertyWindow.clickIcon,editable:false,readOnly:true,buildValue:function(){var f=this.grid.getStore();
f.commitChanges();
if(f.getCount()==0){return""
}var d="[";
for(var c=0;
c<f.getCount();
c++){var e=f.getAt(c);
d+="{";
for(var a=0;
a<this.items.length;
a++){var b=this.items[a].id();
d+=b+":"+(""+e.get(b)).toJSON();
if(a<(this.items.length-1)){d+=", "
}}d+="}";
if(c<(f.getCount()-1)){d+=", "
}}d+="]";
d="{'totalCount':"+f.getCount().toJSON()+", 'items':"+d+"}";
return Object.toJSON(d.evalJSON())
},getFieldKey:function(){return this.key
},getValue:function(){if(this.grid){return this.buildValue()
}else{if(this.data==undefined){return""
}else{return this.data
}}},setValue:function(a){if(a.length>0){if(this.data==undefined){this.data=a
}}},keydownHandler:function(a){return false
},dialogListeners:{show:function(){this.onFocus();
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_KEYDOWN,this.keydownHandler.bind(this));
this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
return
},hide:function(){var a=this.dialogListeners;
this.dialog.un("show",a.show,this);
this.dialog.un("hide",a.hide,this);
this.dialog.destroy(true);
this.grid.destroy(true);
delete this.grid;
delete this.dialog;
this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_KEYDOWN,this.keydownHandler.bind(this));
this.facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
this.fireEvent("dialogClosed",this.data);
Ext.form.ComplexListField.superclass.setValue.call(this,this.data)
}},buildInitial:function(f,a){var b=new Hash();
for(var c=0;
c<a.length;
c++){var e=a[c].id();
b[e]=a[c].value()
}var d=Ext.data.Record.create(f);
return new d(b)
},buildColumnModel:function(n){var k=[];
for(var d=0;
d<this.items.length;
d++){var a=this.items[d].id();
var e=this.items[d].name();
var b=this.items[d].width();
var j=this.items[d].type();
var f;
if(j==ORYX.CONFIG.TYPE_STRING){f=new Ext.form.TextField({allowBlank:this.items[d].optional(),width:b})
}else{if(j==ORYX.CONFIG.TYPE_CHOICE){var h=this.items[d].items();
var m=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",n,["select",{style:"display:none"}]);
var l=new Ext.Template('<option value="{value}">{value}</option>');
h.each(function(o){l.append(m,{value:o.value()})
});
f=new Ext.form.ComboBox({editable:false,typeAhead:true,triggerAction:"all",transform:m,lazyRender:true,msgTarget:"title",width:b})
}else{if(j==ORYX.CONFIG.TYPE_DYNAMICCHOICE){var h=this.items[d].items();
var m=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",n,["select",{style:"display:none"}]);
var l=new Ext.Template('<option value="{value}">{value}</option>');
var g=false;
var c="";
h.each(function(t){if(t.needsprop()&&t.needsprop().length>0){g=true;
c=t.needsprop()
}var r=ORYX.EDITOR.getSerializedJSON();
var s=jsonPath(r.evalJSON(),t.value());
if(s){if(s.toString().length>0){for(var q=0;
q<s.length;
q++){var u=s[q].split(",");
for(var p=0;
p<u.length;
p++){if(u[p].indexOf(":")>0){var o=u[p].split(":");
l.append(m,{value:o[0]})
}else{l.append(m,{value:u[p]})
}}}}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.PropertyWindow.noDataAvailableForProp,title:""})
}});
f=new Ext.form.ComboBox({editable:false,typeAhead:true,triggerAction:"all",transform:m,lazyRender:true,msgTarget:"title",width:b});
f.on("select",function(u,o,q){if(g==true&&c.length>0){var t=ORYX.EDITOR._pluginFacade.getSelection();
if(t&&t.length==1){var p=t.first();
var s="oryx-"+c;
var r=p.properties[s];
if(r&&r.length<1){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"warning",msg:"This property needs the associated property '"+c+"' to be set.",title:""})
}}}}.bind(this))
}else{if(j==ORYX.CONFIG.TYPE_BOOLEAN){f=new Ext.form.Checkbox({width:b})
}else{if(j=="xpath"){f=new Ext.form.TextField({allowBlank:this.items[d].optional(),width:b})
}}}}}k.push({id:a,header:e,dataIndex:a,resizable:true,editor:f,width:b})
}return new Ext.grid.ColumnModel(k)
},afterEdit:function(a){a.grid.getStore().commitChanges()
},beforeEdit:function(h){var a=this.grid.getView().getScrollState();
var b=h.column;
var p=h.row;
var e=this.grid.getColumnModel().config[b].id;
for(var g=0;
g<this.items.length;
g++){var o=this.items[g];
var m=o.disable();
if(m!=undefined){var n=this.grid.getStore().getAt(p).get(o.id());
for(var d=0;
d<m.length;
d++){var f=m[d];
if(f.value==n){for(var c=0;
c<f.items.length;
c++){var l=f.items[c];
if(l==e){this.grid.getColumnModel().getCellEditor(b,p).disable();
return
}}}}}}this.grid.getColumnModel().getCellEditor(b,p).enable()
},onTriggerClick:function(){if(this.disabled){return
}var dialogWidth=0;
var recordType=[];
for(var i=0;
i<this.items.length;
i++){var id=this.items[i].id();
var width=this.items[i].width();
var type=this.items[i].type();
if((type==ORYX.CONFIG.TYPE_CHOICE)||(type==ORYX.CONFIG.TYPE_DYNAMICCHOICE)){type=ORYX.CONFIG.TYPE_STRING
}dialogWidth+=width;
recordType[i]={name:id,type:type}
}if(dialogWidth>800){dialogWidth=800
}dialogWidth+=22;
var data=this.data;
if(data==""){data="{}"
}var ds=new Ext.data.Store({proxy:new Ext.data.MemoryProxy(eval("("+data+")")),reader:new Ext.data.JsonReader({root:"items",totalProperty:"totalCount"},recordType)});
ds.load();
var cm=this.buildColumnModel();
this.grid=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:ds,cm:cm,stripeRows:true,clicksToEdit:1,selModel:new Ext.grid.CellSelectionModel()});
var toolbar=new Ext.Toolbar([{text:ORYX.I18N.PropertyWindow.add,handler:function(){var ds=this.grid.getStore();
var index=ds.getCount();
this.grid.stopEditing();
var p=this.buildInitial(recordType,this.items);
ds.insert(index,p);
ds.commitChanges();
this.grid.startEditing(index,0)
}.bind(this)},{text:ORYX.I18N.PropertyWindow.rem,handler:function(){var ds=this.grid.getStore();
var selection=this.grid.getSelectionModel().getSelectedCell();
if(selection==undefined){return
}this.grid.getSelectionModel().clearSelections();
this.grid.stopEditing();
var record=ds.getAt(selection[0]);
ds.remove(record);
ds.commitChanges()
}.bind(this)}]);
this.dialog=new Ext.Window({autoScroll:true,autoCreate:true,title:ORYX.I18N.PropertyWindow.complex,height:350,width:dialogWidth,modal:true,collapsible:false,fixedcenter:true,shadow:true,proxyDrag:true,keys:[{key:27,fn:function(){this.dialog.hide
}.bind(this)}],items:[toolbar,this.grid],bodyStyle:"background-color:#FFFFFF",buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){this.grid.getView().refresh();
this.grid.stopEditing();
this.data=this.buildValue();
this.dialog.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.dialog.hide()
}.bind(this)}]});
this.dialog.on(Ext.apply({},this.dialogListeners,{scope:this}));
this.dialog.show();
this.grid.on("beforeedit",this.beforeEdit,this,true);
this.grid.on("afteredit",this.afterEdit,this,true);
this.grid.render()
}});
Ext.form.ComplexTextField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}var b=new Ext.form.TextArea({anchor:"100% 100%",value:this.value,listeners:{focus:function(){this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN)
}.bind(this)}});
var a=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.text,height:500,width:500,modal:true,collapsible:false,fixedcenter:true,shadow:true,proxyDrag:true,keys:[{key:27,fn:function(){a.hide()
}.bind(this)}],items:[b],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
a.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var c=b.getValue();
this.setValue(c);
this.dataSource.getAt(this.row).set("value",c);
this.dataSource.commitChanges();
a.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
a.hide()
}.bind(this)}]});
a.show();
b.render();
this.grid.stopEditing();
b.focus(false,100)
}});
Ext.form.ComplexCustomField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}Ext.Ajax.request({url:ORYX.PATH+"customeditors",method:"POST",success:function(a){try{if(a.responseText&&a.responseText.length>0){var d=a.responseText.evalJSON();
var c=d.editors;
if(c[this.title]){var b=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.customEditorFor+" "+this.title,height:300,width:450,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){b.hide()
}.bind(this)}],items:[{xtype:"component",id:"customeditorswindow",autoEl:{tag:"iframe",src:c[this.title],width:"100%",height:"100%"}}],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
b.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var e=document.getElementById("customeditorswindow").contentWindow.getEditorValue();
this.setValue(e);
this.dataSource.getAt(this.row).set("value",e);
this.dataSource.commitChanges();
b.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
b.hide()
}.bind(this)}]});
b.show();
this.grid.stopEditing()
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.unableFindCustomEditor+" "+this.title,title:""})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.invalidCustomEditorData,title:""})
}}catch(f){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.errorApplyingCustomEditor+":\n"+f,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.errorApplyingCustomEditor+".",title:""})
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID}})
}});
Ext.form.ComplexNotificationsField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}var q=Ext.data.Record.create([{name:"type"},{name:"expires"},{name:"from"},{name:"tousers"},{name:"togroups"},{name:"replyto"},{name:"subject"},{name:"body"}]);
var b=new Ext.data.MemoryProxy({root:[]});
var A=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},q),proxy:b,sorters:[{property:"subject",direction:"ASC"},{property:"from",direction:"ASC"},{property:"tousers",direction:"ASC"},{property:"togroups",direction:"ASC"}]});
A.load();
if(this.value.length>0){this.value=this.value.replace(/\[/g,"");
this.value=this.value.replace(/\]/g,"");
var r=this.value.split("^");
for(var y=0;
y<r.length;
y++){var e=r[y];
if(e.indexOf("@")>0){var u=e.split("@");
var t=u[0];
var l=u[1];
var g=u[2];
var B="";
var m="";
var f="";
var n="";
var k="";
var d="";
if(t.indexOf("|")>0){var C=t.split("|");
for(var w=0;
w<C.length;
w++){var c=C[w].split(/:(.+)?/)[0];
var x=C[w].split(/:(.+)?/)[1];
if(c=="from"){B=x
}else{if(c=="tousers"){m=x
}else{if(c=="togroups"){f=x
}else{if(c=="replyTo"){n=x
}else{if(c=="subject"){k=x
}else{if(c=="body"){d=x.replace(/<br\s?\/?>/g,"\n")
}}}}}}}}else{var c=t.split(/:(.+)?/)[0];
var x=t.split(/:(.+)?/)[1];
if(c=="from"){B=x
}else{if(c=="tousers"){m=x
}else{if(c=="togroups"){f=x
}else{if(c=="replyTo"){n=x
}else{if(c=="subject"){k=x
}else{if(c=="body"){d=x.replace(/<br\s?\/?>/g,"\n")
}}}}}}}A.add(new q({type:g==undefined?"":g,expires:l==undefined?"":l,from:B==undefined?"":B,tousers:m==undefined?"":m,togroups:f==undefined?"":f,replyto:n==undefined?"":n,subject:k==undefined?"":k,body:d==undefined?"":d}))
}}}var o=new Array();
var D=new Array();
D.push("not-started");
D.push("not-started");
o.push(D);
var v=new Array();
v.push("not-completed");
v.push("not-completed");
o.push(v);
var s=Ext.id();
var p=new Extensive.grid.ItemDeleter();
var h=new Ext.form.TextArea({id:"notificationsbodyeditor",width:150,height:650,allowBlank:true,disableKeyFilter:true,grow:true});
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:A,id:s,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"type",header:ORYX.I18N.PropertyWindow.type,width:100,dataIndex:"type",editor:new Ext.form.ComboBox({id:"typeCombo",valueField:"name",displayField:"value",labelStyle:"display:none",submitValue:true,typeAhead:false,queryMode:"local",mode:"local",triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,store:new Ext.data.SimpleStore({fields:["name","value"],data:o})})},{id:"expires",header:ORYX.I18N.PropertyWindow.expiresAt,width:100,dataIndex:"expires",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"from",header:ORYX.I18N.PropertyWindow.from,width:100,dataIndex:"from",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"tousers",header:ORYX.I18N.PropertyWindow.toUsers,width:100,dataIndex:"tousers",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"togroups",header:ORYX.I18N.PropertyWindow.toGroups,width:100,dataIndex:"togroups",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"replyto",header:ORYX.I18N.PropertyWindow.replyTo,width:100,dataIndex:"replyto",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"subject",header:ORYX.I18N.PropertyWindow.subject,width:100,dataIndex:"subject",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"body",header:ORYX.I18N.PropertyWindow.body,width:100,height:650,dataIndex:"body",editor:new Ext.form.TextArea({width:150,height:650,allowBlank:true,disableKeyFilter:true,grow:true}),renderer:Ext.util.Format.htmlEncode},p]),selModel:p,autoHeight:true,tbar:[{text:ORYX.I18N.PropertyWindow.addNotification,handler:function(){A.add(new q({expires:"",from:"",tousers:"",type:"not-started",togroups:"",replyto:"",subject:"",body:""}));
a.fireEvent("cellclick",a,A.getCount()-1,1,null)
}}],clicksToEdit:1,listeners:{beforeedit:function(j){if(j.column!=8){return true
}var E=Ext.get("notificationsBodyEditorWindow");
if(!E){var F=new Ext.Window({id:"notificationsBodyEditorWindow",modal:true,collapsible:false,fixedcenter:true,shadow:true,proxyDrag:true,autoScroll:true,autoWidth:true,autoHeight:true,bodyBorder:false,closable:true,resizable:true,items:[{xtype:"panel",html:"<p class='instructions'>"+ORYX.I18N.PropertyWindow.addNotificationInstructions+"</p>"},{xtype:"textarea",id:"notificationbodyinput",width:350,height:300,modal:true,value:j.value}],bbar:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){j.record.set("body",Ext.get("notificationbodyinput").getValue());
F.close()
}}]});
F.show();
return false
}else{return false
}}}});
var z=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorForNotifications,height:350,width:900,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){z.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
z.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var j="";
a.stopEditing();
a.getView().refresh();
A.data.each(function(){if((this.data.tousers.length>0||this.data.togroups.length>0)&&this.data.subject.length>0&&this.data.body.length>0){j+="[from:"+this.data.from+"|tousers:"+this.data.tousers+"|togroups:"+this.data.togroups+"|replyTo:"+this.data.replyto+"|subject:"+this.data.subject+"|body:"+this.data.body.replace(/\r\n|\r|\n/g,"<br />")+"]";
j+="@["+this.data.expires+"]";
j+="@"+this.data.type;
j+="^"
}});
if(j.length>0){j=j.slice(0,-1)
}this.setValue(j);
this.dataSource.getAt(this.row).set("value",j);
this.dataSource.commitChanges();
z.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
z.hide()
}.bind(this)}]});
z.show();
a.render();
this.grid.stopEditing();
a.focus(false,100)
}});
Ext.form.ComplexReassignmentField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}var c=Ext.data.Record.create([{name:"users"},{name:"groups"},{name:"expires"},{name:"type"}]);
var l=new Ext.data.MemoryProxy({root:[]});
var d=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},c),proxy:l,sorters:[{property:"users",direction:"ASC"},{property:"groups",direction:"ASC"}]});
d.load();
if(this.value.length>0){this.value=this.value.replace(/\[/g,"");
this.value=this.value.replace(/\]/g,"");
var n=this.value.split("^");
for(var t=0;
t<n.length;
t++){var e=n[t];
if(e.indexOf("@")>0){var q=e.split("@");
var p=q[0];
var h=q[1];
var f=q[2];
var g="";
var s="";
if(p.indexOf("|")>0){var w=p.split("|");
var x=w[0];
var m=w[1];
var b=x.split(":");
if(b[0]=="users"){g=b[1]
}else{if(b[0]=="groups"){s=b[1]
}}var u=m.split(":");
if(u[0]=="users"){g=u[1]
}else{if(u[0]=="groups"){s=u[1]
}}}else{var z=p.split(":");
if(z[0]=="users"){g=z[1]
}else{if(z[0]=="groups"){s=z[1]
}}}d.add(new c({users:g,groups:s,expires:h,type:f}))
}}}var j=new Array();
var y=new Array();
y.push("not-started");
y.push("not-started");
j.push(y);
var r=new Array();
r.push("not-completed");
r.push("not-completed");
j.push(r);
var o=Ext.id();
var k=new Extensive.grid.ItemDeleter();
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:d,id:o,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"users",header:ORYX.I18N.PropertyWindow.users,width:150,dataIndex:"users",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"groups",header:ORYX.I18N.PropertyWindow.groups,width:150,dataIndex:"groups",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"expires",header:ORYX.I18N.PropertyWindow.expiresAt,width:150,dataIndex:"expires",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"type",header:ORYX.I18N.PropertyWindow.type,width:150,dataIndex:"type",editor:new Ext.form.ComboBox({id:"typeCombo",valueField:"name",displayField:"value",labelStyle:"display:none",submitValue:true,typeAhead:false,queryMode:"local",mode:"local",triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,store:new Ext.data.SimpleStore({fields:["name","value"],data:j})})},k]),selModel:k,autoHeight:true,tbar:[{text:ORYX.I18N.PropertyWindow.addReassignment,handler:function(){d.add(new c({users:"",groups:"",expires:"",type:"not-started"}));
a.fireEvent("cellclick",a,d.getCount()-1,1,null)
}}],clicksToEdit:1});
var v=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorForReassignment,height:350,width:700,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){v.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
v.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var A="";
a.stopEditing();
a.getView().refresh();
d.data.each(function(){if((this.data.users.length>0||this.data.groups.length>0)&&this.data.expires.length>0&&this.data.type.length>0){A+="[users:"+this.data.users+"|groups:"+this.data.groups+"]";
A+="@["+this.data.expires+"]";
A+="@"+this.data.type;
A+="^"
}});
if(A.length>0){A=A.slice(0,-1)
}this.setValue(A);
this.dataSource.getAt(this.row).set("value",A);
this.dataSource.commitChanges();
v.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
v.hide()
}.bind(this)}]});
v.show();
a.render();
this.grid.stopEditing();
a.focus(false,100)
}});
Ext.form.ComplexImportsField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}var a=ORYX.EDITOR.getSerializedJSON();
var b=jsonPath(a.evalJSON(),"$.properties.package");
var c=jsonPath(a.evalJSON(),"$.properties.id");
Ext.Ajax.request({url:ORYX.PATH+"calledelement",method:"POST",success:function(l){try{if(l.responseText.length>=0&&l.responseText!="false"){var x=Ext.decode(l.responseText);
var o=new Array();
var Q=new Array();
Q.push("String");
Q.push("String");
o.push(Q);
var k=new Array();
k.push("Integer");
k.push("Integer");
o.push(k);
var E=new Array();
E.push("Boolean");
E.push("Boolean");
o.push(E);
var v=new Array();
v.push("Float");
v.push("Float");
o.push(v);
var A=new Array();
A.push("Object");
A.push("Object");
o.push(A);
var f=new Array();
f.push("**********");
f.push("**********");
o.push(f);
var d=new Array();
for(var u in x){var y=x[u];
d.push(y)
}d.sort();
for(var I=0;
I<d.length;
I++){var K=new Array();
var g=d[I];
var w=g.split(".");
var O=w[w.length-1];
var C=g.substring(0,g.length-(O.length+1));
K.push(O+" ["+C+"]");
K.push(d[I]);
o.push(K)
}var F=Ext.data.Record.create([{name:"type"},{name:"classname"},{name:"customclassname"},{name:"wsdllocation"},{name:"wsdlnamespace"}]);
var N=new Ext.data.MemoryProxy({root:[]});
var n=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},F),proxy:N,sorters:[{property:"type",direction:"ASC"}]});
n.load();
if(this.value.length>0){var r=this.value.split(",");
for(var M=0;
M<r.length;
M++){var R="";
var h,s,G;
var q=r[M];
var j=q.split("|");
if(j[1]=="default"){R="default";
h=j[0];
s="";
G=""
}else{R="wsdl";
h="";
s=j[0];
G=j[1]
}var p=false;
for(var u in x){var y=x[u];
if(y==h){p=true
}}if(p){n.add(new F({type:R,classname:h,customclassname:"",wsdllocation:s,wsdlnamespace:G}))
}else{n.add(new F({type:R,classname:"",customclassname:h,wsdllocation:s,wsdlnamespace:G}))
}}}var m=new Extensive.grid.ItemDeleter();
var B=new Array();
var J=new Array();
J.push("default");
J.push("default");
B.push(J);
var z=new Array();
z.push("wsdl");
z.push("wsdl");
B.push(z);
var D=Ext.id();
var H=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:n,id:D,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"imptype",header:ORYX.I18N.PropertyWindow.importType,width:100,dataIndex:"type",editor:new Ext.form.ComboBox({id:"importTypeCombo",typeAhead:true,anyMatch:true,valueField:"name",displayField:"value",labelStyle:"display:none",submitValue:true,typeAhead:false,queryMode:"local",mode:"local",triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,store:new Ext.data.SimpleStore({fields:["name","value"],data:B})})},{id:"classname",header:"Defined Class Name",width:180,dataIndex:"classname",editor:new Ext.form.ComboBox({id:"customTypeCombo",typeAhead:true,anyMatch:true,valueField:"value",displayField:"name",labelStyle:"display:none",submitValue:true,typeAhead:false,queryMode:"local",mode:"local",triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,store:new Ext.data.SimpleStore({fields:["name","value"],data:o})})},{id:"customclassname",header:"Custom Class Name",width:180,dataIndex:"customclassname",editor:new Ext.form.TextField({allowBlank:true})},{id:"wsdllocation",header:ORYX.I18N.PropertyWindow.wsdlLocation,width:180,dataIndex:"wsdllocation",editor:new Ext.form.TextField({allowBlank:true})},{id:"wsdlnamespace",header:ORYX.I18N.PropertyWindow.wsdlNamespace,width:180,dataIndex:"wsdlnamespace",editor:new Ext.form.TextField({allowBlank:true})},m]),selModel:m,autoHeight:true,tbar:[{text:ORYX.I18N.PropertyWindow.addImport,handler:function(){n.add(new F({type:"default",classname:"",customclassname:"",wsdllocation:"",wsdlnamespace:""}));
H.fireEvent("cellclick",H,n.getCount()-1,1,null)
}}],clicksToEdit:1});
var L=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorForImports,height:400,width:900,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){L.hide()
}.bind(this)}],items:[H],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
L.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var e="";
H.getView().refresh();
H.stopEditing();
n.data.each(function(){if(this.data.type=="default"){if(this.data.classname.length>0){e+=this.data.classname+"|"+this.data.type+","
}else{e+=this.data.customclassname+"|"+this.data.type+","
}}if(this.data.type=="wsdl"){e+=this.data.wsdllocation+"|"+this.data.wsdlnamespace+"|"+this.data.type+","
}});
if(e.length>0){e=e.slice(0,-1)
}this.setValue(e);
this.dataSource.getAt(this.row).set("value",e);
this.dataSource.commitChanges();
L.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
L.hide()
}.bind(this)}]});
L.show();
H.render();
this.grid.stopEditing();
H.focus(false,100)
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Unable to find Data Types.",title:""})
}}catch(P){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Error retrieving Data Types info  :\n"+P,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Error retrieving Data Types info.",title:""})
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID,ppackage:b,pid:c,action:"showdatatypes"}})
}});
Ext.form.ComplexActionsField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}var f=Ext.data.Record.create([{name:"action"}]);
var j=new Ext.data.MemoryProxy({root:[]});
var d=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},f),proxy:j,sorters:[{property:"action",direction:"ASC"}]});
d.load();
if(this.value.length>0){var h=this.value.split("|");
for(var e=0;
e<h.length;
e++){var b=h[e];
d.add(new f({action:b}))
}}var g=new Extensive.grid.ItemDeleter();
var c=Ext.id();
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:d,id:c,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"action",header:ORYX.I18N.PropertyWindow.action,width:360,dataIndex:"action",editor:new Ext.form.TextField({allowBlank:true})},g]),selModel:g,autoHeight:true,tbar:[{text:ORYX.I18N.PropertyWindow.addAction,handler:function(){d.add(new f({action:""}));
a.fireEvent("cellclick",a,d.getCount()-1,1,null)
}}],clicksToEdit:1});
var k=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorForActions,height:300,width:450,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){k.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
k.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var l="";
a.getView().refresh();
a.stopEditing();
d.data.each(function(){if(this.data.action.length>0){l+=this.data.action+"|"
}});
if(l.length>0){l=l.slice(0,-1)
}this.setValue(l);
this.dataSource.getAt(this.row).set("value",l);
this.dataSource.commitChanges();
k.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
k.hide()
}.bind(this)}]});
k.show();
a.render();
this.grid.stopEditing();
a.focus(false,100)
}});
Ext.form.ComplexDataAssignmenField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,addParentVars:function(h,d,m,c,b,l){if(h){if(h._stencil._jsonStencil.id=="http://b3mn.org/stencilset/bpmn2.0#MultipleInstanceSubprocess"||h._stencil._jsonStencil.id=="http://b3mn.org/stencilset/bpmn2.0#Subprocess"||h._stencil._jsonStencil.id=="http://b3mn.org/stencilset/bpmn2.0#AdHocSubprocess"){var j=h.properties["oryx-vardefs"];
if(j&&j.length>0){var o=j.split(",");
for(var f=0;
f<o.length;
f++){var e=o[f];
var g=new Array();
if(e.indexOf(":")>0){var p=e.split(":");
g.push(p[0]);
g.push(p[0]);
b[p[0]]=p[1];
l.push(p[0])
}else{g.push(e);
g.push(e);
b[e]="java.lang.String";
l.push(e)
}m.push(g);
c.push(g)
}}if(h._stencil._jsonStencil.id=="http://b3mn.org/stencilset/bpmn2.0#MultipleInstanceSubprocess"){var a=h.properties["oryx-multipleinstancedatainput"];
if(a&&a.length>0){var g=new Array();
g.push(a);
g.push(a);
b[a]="java.lang.String";
l.push(g);
m.push(g);
c.push(g)
}var n=h.properties["oryx-multipleinstancedataoutput"];
if(n&&n.length>0){var g=new Array();
g.push(n);
g.push(n);
b[n]="java.lang.String";
l.push(g);
m.push(g);
c.push(g)
}}}if(h.parent){this.addParentVars(h.parent,d,m,c,b,l)
}}},onTriggerClick:function(){if(this.disabled){return undefined
}if(ORYX.USEOLDDATAASSIGNMENTS==false){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DATAIOEDITOR_SHOW,element:this.shapes[0]});
return
}var c="";
var f=ORYX.EDITOR.getSerializedJSON();
var G=jsonPath(f.evalJSON(),"$.properties.vardefs");
var m=new Array();
var p=new Array();
var d=new Hash();
var j=new Array();
var b=new Array();
var B=new Array();
var l=new Array();
var o=new Array();
var t=new Array();
p.push("");
var z=false;
var J=ORYX.EDITOR._pluginFacade.getSelection();
if(J){var y=J.first();
if(y&&y.parent){if(y.parent._stencil._jsonStencil.id=="http://b3mn.org/stencilset/bpmn2.0#MultipleInstanceSubprocess"||y.parent._stencil._jsonStencil.id=="http://b3mn.org/stencilset/bpmn2.0#Subprocess"||y.parent._stencil._jsonStencil.id=="http://b3mn.org/stencilset/bpmn2.0#AdHocSubprocess"){p.push("** Process/Subprocess Definitions **");
m.push(p);
j.push(p);
z=true
}this.addParentVars(y.parent,p,m,j,d,b)
}}if(!z){p.push("** Variable Definitions **");
m.push(p);
j.push(p)
}if(G){G.forEach(function(O){if(O.length>0){var L=O.split(",");
for(var N=0;
N<L.length;
N++){var M=new Array();
var P=L[N];
if(P.indexOf(":")>0){var K=P.split(":");
M.push(K[0]);
M.push(K[0]);
d[K[0]]=K[1];
b.push(K[0])
}else{M.push(P);
M.push(P);
d[P]="java.lang.String";
b.push(P)
}m.push(M);
j.push(M)
}}})
}var q=new Array();
q.push("");
q.push("** Data Inputs **");
m.push(q);
B.push(q);
Ext.each(this.dataSource.data.items,function(O){if((O.data.gridProperties.propId=="oryx-datainputset")||(O.data.gridProperties.propId=="oryx-datainput")){var L=O.data.value.split(",");
for(var N=0;
N<L.length;
N++){var P=L[N];
var M=new Array();
if(P.indexOf(":")>0){var K=P.split(":");
M.push(K[0]);
M.push(K[0]);
d[K[0]]=K[1];
l.push(K[0])
}else{M.push(P);
M.push(P);
d[P]="java.lang.String";
l.push(P)
}m.push(M);
B.push(M)
}}});
var s=new Array();
s.push("");
s.push("** Data Outputs **");
m.push(s);
o.push(s);
Ext.each(this.dataSource.data.items,function(O){if((O.data.gridProperties.propId=="oryx-dataoutputset")||(O.data.gridProperties.propId=="oryx-dataoutput")){var M=O.data.value.split(",");
for(var K=0;
K<M.length;
K++){var P=M[K];
var N=new Array();
if(P.indexOf(":")>0){var L=P.split(":");
N.push(L[0]);
N.push(L[0]);
d[L[0]]=L[1];
t.push(L[0])
}else{N.push(P);
N.push(P);
d[P]="java.lang.String";
t.push(P)
}m.push(N);
o.push(N)
}}});
var e=Ext.data.Record.create([{name:"atype"},{name:"from"},{name:"type"},{name:"to"},{name:"tostr"},{name:"dataType"},{name:"assignment"}]);
var E=new Ext.data.MemoryProxy({root:[]});
var I=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},e),proxy:E,sorters:[{property:"atype",direction:"ASC"},{property:"from",direction:"ASC"},{property:"to",direction:"ASC"},{property:"tostr",direction:"ASC"}]});
I.load();
if(this.value.length>0){var w=this.value.split(",");
for(var D=0;
D<w.length;
D++){var g=w[D];
if(g.indexOf("=")>0){var A=g.split("=");
if(A[0].startsWith("[din]")){var r=A[0].slice(5,A[0].length);
var C=d[r];
if(!C){C="java.lang.String"
}A.shift();
var h=A.join("=").replace(/\#\#/g,",");
h=h.replace(/\|\|/g,"=");
I.add(new e({atype:"DataInput",from:r,type:"is equal to",to:"",tostr:h,dataType:C,assignment:"false"}))
}else{if(A[0].startsWith("[dout]")){var r=A[0].slice(6,A[0].length);
var C=d[r];
if(!C){C="java.lang.String"
}A.shift();
var h=A.join("=").replace(/\#\#/g,",");
h=h.replace(/\|\|/g,"=");
I.add(new e({atype:"DataOutput",from:r,type:"is equal to",to:"",tostr:h,dataType:C,assignment:"false"}))
}else{var r=A[0];
var C=d[r];
if(!C){C="java.lang.String"
}A.shift();
var h=A.join("=").replace(/\#\#/g,",");
h=h.replace(/\|\|/g,"=");
I.add(new e({atype:"DataInput",from:r,type:"is equal to",to:"",tostr:h,dataType:C,assignment:"false"}))
}}}else{if(g.indexOf("->")>0){var A=g.split("->");
if(A[0].startsWith("[din]")){var r=A[0].slice(5,A[0].length);
var C=d[r];
if(!C){C="java.lang.String"
}var k="DataInput";
I.add(new e({atype:k,from:r,type:"is mapped to",to:A[1],tostr:"",dataType:C,assignment:"true"}))
}else{if(A[0].startsWith("[dout]")){var r=A[0].slice(6,A[0].length);
var C=d[r];
if(!C){C="java.lang.String"
}var k="DataOutput";
I.add(new e({atype:k,from:r,type:"is mapped to",to:A[1],tostr:"",dataType:C,assignment:"true"}))
}}}else{if(A[0].startsWith("[din]")){var r=A[0].slice(5,A[0].length);
var C=d[r];
if(!C){C="java.lang.String"
}I.add(new e({atype:"DataInput",from:r,type:"is equal to",to:"",tostr:"",dataType:C,assignment:"false"}))
}else{if(A[0].startsWith("[dout]")){var r=A[0].slice(5,A[0].length);
var C=d[r];
if(!C){C="java.lang.String"
}I.add(new e({atype:"DataInput",from:r,type:"is equal to",to:"",tostr:"",dataType:C,assignment:"false"}))
}}var C=d[g]
}}}}I.on("update",function(M,K,L){if(L=="edit"){var N=d[K.get("from")];
if(!N){N="java.lang.String"
}K.set("dataType",N)
}});
var H=new Ext.form.ComboBox({name:"fromCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:m})});
var v=new Ext.form.ComboBox({name:"typeCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:[["is mapped to",ORYX.I18N.PropertyWindow.isMappedTo],["is equal to",ORYX.I18N.PropertyWindow.isEqualTo]]})});
var n=new Ext.form.ComboBox({name:"toCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:m})});
var u=new Extensive.grid.ItemDeleter();
var x=Ext.id();
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:I,id:x,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"valueType",header:ORYX.I18N.PropertyWindow.dataType,width:180,dataIndex:"dataType",hidden:"true"},{id:"atype",header:"Assignment Type",width:180,dataIndex:"atype"},{id:"from",header:ORYX.I18N.PropertyWindow.fromObject,width:180,dataIndex:"from",editor:H},{id:"type",header:ORYX.I18N.PropertyWindow.assignmentType,width:100,dataIndex:"type",editor:v},{id:"to",header:ORYX.I18N.PropertyWindow.toObject,width:180,dataIndex:"to",editor:n},{id:"tostr",header:ORYX.I18N.PropertyWindow.toValue,width:180,dataIndex:"tostr",editor:new Ext.form.TextField({name:"tostrTxt",allowBlank:true}),renderer:Ext.util.Format.htmlEncode},u]),selModel:u,autoHeight:true,tbar:[{text:"[ Input Assignment ]",handler:function(){I.add(new e({atype:"DataInput",from:"",type:"",to:"",tostr:"",assignment:"false"}));
c="datainput";
a.fireEvent("cellclick",a,I.getCount()-1,1,null)
}},{text:"[ Input Mapping ]",handler:function(){I.add(new e({atype:"DataInput",from:"",type:"",to:"",tostr:"",assignment:"true"}));
c="datainput";
a.fireEvent("cellclick",a,I.getCount()-1,1,null)
}},{text:"[ Output Mapping ]",handler:function(){I.add(new e({atype:"DataOutput",from:"",type:"",to:"",tostr:"",assignment:"true"}));
c="dataoutput";
a.fireEvent("cellclick",a,I.getCount()-1,1,null)
}}],clicksToEdit:1,listeners:{beforeedit:function(P){if(P.record.data.atype=="DataInput"){var K=P.grid.getColumnModel().getCellEditor(P.column,P.row)||{};
K=K.field||{};
if(K.name=="typeCombo"){K.destroy();
var L;
if(P.record.data.assignment=="true"){L=new Ext.form.ComboBox({name:"typeCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:[["is mapped to",ORYX.I18N.PropertyWindow.isMappedTo]]})})
}else{L=new Ext.form.ComboBox({name:"typeCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:[["is equal to",ORYX.I18N.PropertyWindow.isEqualTo]]})})
}P.grid.getColumnModel().setEditor(P.column,new Ext.grid.GridEditor(L))
}if(K.name=="fromCombo"){K.destroy();
var M;
if(P.record.data.assignment=="true"){M=new Ext.form.ComboBox({name:"fromCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:j})})
}else{M=new Ext.form.ComboBox({name:"fromCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:B})})
}P.grid.getColumnModel().setEditor(P.column,new Ext.grid.GridEditor(M))
}if(K.name=="toCombo"){K.destroy();
var O;
if(P.record.data.assignment=="true"){O=new Ext.form.ComboBox({name:"toCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:B})})
}else{O=new Ext.form.ComboBox({name:"toCombo",disabled:true,valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:B})})
}P.grid.getColumnModel().setEditor(P.column,new Ext.grid.GridEditor(O))
}if(K.name=="tostrTxt"){K.destroy();
var N;
if(P.record.data.assignment=="true"){N=new Ext.form.TextField({name:"tostrTxt",allowBlank:true,disabled:true})
}else{N=new Ext.form.TextField({name:"tostrTxt",allowBlank:true})
}P.grid.getColumnModel().setEditor(P.column,new Ext.grid.GridEditor(N))
}}if(P.record.data.atype=="DataOutput"){var K=P.grid.getColumnModel().getCellEditor(P.column,P.row)||{};
K=K.field||{};
if(K.name=="typeCombo"){K.destroy();
var L;
if(P.record.data.assignment=="true"){L=new Ext.form.ComboBox({name:"typeCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:[["is mapped to",ORYX.I18N.PropertyWindow.isMappedTo]]})})
}else{L=new Ext.form.ComboBox({name:"typeCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:[["is equal to",ORYX.I18N.PropertyWindow.isEqualTo]]})})
}P.grid.getColumnModel().setEditor(P.column,new Ext.grid.GridEditor(L))
}if(K.name=="fromCombo"){K.destroy();
var M;
if(P.record.data.assignment=="true"){M=new Ext.form.ComboBox({name:"fromCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:o})})
}else{M=new Ext.form.ComboBox({name:"fromCombo",disabled:true,valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:o})})
}P.grid.getColumnModel().setEditor(P.column,new Ext.grid.GridEditor(M))
}if(K.name=="toCombo"){K.destroy();
var O;
if(P.record.data.assignment=="true"){O=new Ext.form.ComboBox({name:"toCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:j})})
}else{O=new Ext.form.ComboBox({name:"toCombo",disabled:true,valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:j})})
}P.grid.getColumnModel().setEditor(P.column,new Ext.grid.GridEditor(O))
}if(K.name=="tostrTxt"){K.destroy();
var N;
if(P.record.data.assignment=="true"){N=new Ext.form.TextField({name:"tostrTxt",allowBlank:true,disabled:true})
}else{N=new Ext.form.TextField({name:"tostrTxt",allowBlank:true})
}P.grid.getColumnModel().setEditor(P.column,new Ext.grid.GridEditor(N))
}}}}});
var F=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorForDataAssignments,height:350,width:890,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){F.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
F.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var K="";
a.getView().refresh();
a.stopEditing();
I.data.each(function(){if(this.data.from.length>0&&this.data.type.length>0){var L=this.data.atype;
if(this.data.type=="is mapped to"){if(L=="DataInput"){K+="[din]"+this.data.from+"->"+this.data.to+","
}else{if(L=="DataOutput"){K+="[dout]"+this.data.from+"->"+this.data.to+","
}}}else{if(this.data.type=="is equal to"){if(this.data.tostr.length>0){var M=this.data.tostr.replace(/,/g,"##");
M=M.replace(/=/g,"||");
if(L=="DataInput"){K+="[din]"+this.data.from+"="+M+","
}else{if(L=="DataOutput"){K+="[dout]"+this.data.from+"="+M+","
}}}else{if(L=="DataInput"){K+="[din]"+this.data.from+"=,"
}else{if(L=="DataOutput"){K+="[dout]"+this.data.from+"=,"
}}}}}}});
if(K.length>0){K=K.slice(0,-1)
}this.setValue(K);
this.dataSource.getAt(this.row).set("value",K);
this.dataSource.commitChanges();
F.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
F.hide()
}.bind(this)}]});
F.show();
a.render();
this.grid.stopEditing();
a.focus(false,100);
return a
}});
Ext.form.NameTypeEditor=Ext.extend(Ext.form.TriggerField,{windowTitle:"",addButtonLabel:"",single:false,editable:false,readOnly:true,dtype:"",addCustomKPI:"",onTriggerClick:function(){if(this.disabled){return
}if(ORYX.USEOLDDATAASSIGNMENTS==false){if(this.dtype==ORYX.CONFIG.TYPE_DTYPE_DINPUT||this.dtype==ORYX.CONFIG.TYPE_DTYPE_DOUTPUT){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DATAIOEDITOR_SHOW,element:this.facade.getSelection()[0]});
return
}}var a=ORYX.EDITOR.getSerializedJSON();
var b=jsonPath(a.evalJSON(),"$.properties.package");
var c=jsonPath(a.evalJSON(),"$.properties.id");
Ext.Ajax.request({url:ORYX.PATH+"calledelement",method:"POST",success:function(n){try{if(n.responseText.length>=0&&n.responseText!="false"){var z=Ext.decode(n.responseText);
var M=new Array();
var V=new Array();
V.push("true");
V.push("true");
M.push(V);
var R=new Array();
R.push("false");
R.push("false");
M.push(R);
var p=new Array();
var U=new Array();
U.push("String");
U.push("String");
p.push(U);
var m=new Array();
m.push("Integer");
m.push("Integer");
p.push(m);
var G=new Array();
G.push("Boolean");
G.push("Boolean");
p.push(G);
var x=new Array();
x.push("Float");
x.push("Float");
p.push(x);
var C=new Array();
C.push("Object");
C.push("Object");
p.push(C);
var f=new Array();
f.push("**********");
f.push("**********");
p.push(f);
var d=new Array();
for(var w in z){var B=z[w];
d.push(B)
}d.sort();
for(var K=0;
K<d.length;
K++){var L=new Array();
var g=d[K];
var y=g.split(".");
var S=y[y.length-1];
var E=g.substring(0,g.length-(S.length+1));
L.push(S+" ["+E+"]");
L.push(d[K]);
p.push(L)
}var H=Ext.data.Record.create([{name:"name"},{name:"stype"},{name:"ctype"},{name:"kpi"}]);
var v=new Ext.data.MemoryProxy({root:[]});
var l=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},H),proxy:v,sorters:[{property:"name",direction:"ASC"}]});
l.load();
if(this.value.length>0){var u=this.value.split(",");
for(var Q=0;
Q<u.length;
Q++){var q=u[Q];
if(q.indexOf(":")>0){var h=q.split(":");
var r=false;
for(var P=0;
P<p.length;
P++){var s=p[P];
for(var N=0;
N<s.length;
N++){var I=s[N];
if(I==h[1]){r=true;
break
}}}if(r==true){var D="false";
if(h.length==3){D=h[2]
}l.add(new H({name:h[0],stype:h[1],ctype:"",kpi:D}))
}else{var D="false";
if(h[1]=="true"||h[1]=="false"){l.add(new H({name:h[0],stype:"",ctype:"",kpi:h[1]}))
}else{var D="false";
if(h.length==3){D=h[2]
}l.add(new H({name:h[0],stype:"",ctype:h[1],kpi:D}))
}}}else{l.add(new H({name:q,stype:"",ctype:"",kpi:"false"}))
}}}var o=new Extensive.grid.ItemDeleter();
o.setDType(this.dtype);
var F=Ext.id();
Ext.form.VTypes.inputNameVal=/^[a-z0-9\-\.\_]*$/i;
Ext.form.VTypes.inputNameText="Invalid name";
Ext.form.VTypes.inputName=function(e){return Ext.form.VTypes.inputNameVal.test(e)
};
var A=this.addCustomKPI;
var J=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:l,id:F,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"name",header:ORYX.I18N.PropertyWindow.name,width:100,dataIndex:"name",editor:new Ext.form.TextField({allowBlank:true,vtype:"inputName",regex:/^[a-z0-9\-\.\_]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"stype",header:"Defined Types",width:200,dataIndex:"stype",editor:new Ext.form.ComboBox({typeAhead:true,anyMatch:true,id:"customTypeCombo",valueField:"value",displayField:"name",labelStyle:"display:none",submitValue:true,typeAhead:true,queryMode:"local",mode:"local",triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,editable:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:p})})},{id:"ctype",header:ORYX.I18N.PropertyWindow.customType,width:200,dataIndex:"ctype",editor:new Ext.form.TextField({allowBlank:true}),renderer:Ext.util.Format.htmlEncode},{id:"kpi",header:"KPI",width:100,dataIndex:"kpi",disabled:(A!="true"),editor:new Ext.form.ComboBox({typeAhead:true,anyMatch:true,id:"kpiConbo",valueField:"value",displayField:"name",labelStyle:"display:none",submitValue:true,typeAhead:true,queryMode:"local",mode:"local",disabled:(A!="true"),triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,editable:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:M})})},o]),selModel:o,autoHeight:true,tbar:[{text:this.addButtonLabel,handler:function(){if(this.single&&l.getCount()>0){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.OnlySingleEntry,title:""})
}else{l.add(new H({name:"",stype:"",ctype:"",kpi:"false"}));
J.fireEvent("cellclick",J,l.getCount()-1,1,null)
}}.bind(this)}],clicksToEdit:1});
var O=new Ext.Window({layout:"anchor",autoCreate:true,title:this.windowTitle,height:300,width:700,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){O.hide()
}.bind(this)}],items:[J],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
O.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var e="";
J.stopEditing();
J.getView().refresh();
var j=this.addCustomKPI;
l.data.each(function(){if(this.data.name.length>0){if(this.data.stype.length>0){if(this.data.stype=="Object"&&this.data.ctype.length>0){e+=this.data.name+":"+this.data.ctype;
if(j=="true"){e+=":"+this.data.kpi
}e+=","
}else{e+=this.data.name+":"+this.data.stype;
if(j=="true"){e+=":"+this.data.kpi
}e+=","
}}else{if(this.data.ctype.length>0){e+=this.data.name+":"+this.data.ctype;
if(j=="true"){e+=":"+this.data.kpi
}e+=","
}else{e+=this.data.name;
if(j=="true"){e+=":"+this.data.kpi
}e+=","
}}}});
if(e.length>0){e=e.slice(0,-1)
}this.setValue(e);
this.dataSource.getAt(this.row).set("value",e);
this.dataSource.commitChanges();
O.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
O.hide()
}.bind(this)}]});
O.show();
J.render();
this.grid.stopEditing();
J.focus(false,100)
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Unable to find Data Types.",title:""})
}}catch(T){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Error retrieving Data Types info  :\n"+T,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Error retrieving Data Types info.",title:""})
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID,ppackage:b,pid:c,action:"showdatatypes"}})
}});
Ext.form.ComplexVardefField=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:ORYX.I18N.PropertyWindow.editorForVariableDefinitions,addButtonLabel:ORYX.I18N.PropertyWindow.addVariable,dtype:ORYX.CONFIG.TYPE_DTYPE_VARDEF,addCustomKPI:"true"});
Ext.form.ComplexDataInputField=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:ORYX.I18N.PropertyWindow.editorForDataInput,addButtonLabel:ORYX.I18N.PropertyWindow.addDataInput,dtype:ORYX.CONFIG.TYPE_DTYPE_DINPUT});
Ext.form.ComplexDataOutputField=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:ORYX.I18N.PropertyWindow.editorForDataOutput,addButtonLabel:ORYX.I18N.PropertyWindow.addDataOutput,dtype:ORYX.CONFIG.TYPE_DTYPE_DOUTPUT});
Ext.form.ComplexDataInputFieldSingle=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:ORYX.I18N.PropertyWindow.editorForDataInput,addButtonLabel:ORYX.I18N.PropertyWindow.addDataInput,single:true,dtype:ORYX.CONFIG.TYPE_DTYPE_DINPUT});
Ext.form.ComplexDataOutputFieldSingle=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:ORYX.I18N.PropertyWindow.editorForDataOutput,addButtonLabel:ORYX.I18N.PropertyWindow.addDataOutput,single:true,dtype:ORYX.CONFIG.TYPE_DTYPE_DOUTPUT});
Ext.form.ComplexGlobalsField=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:ORYX.I18N.PropertyWindow.editorForGlobals,addButtonLabel:ORYX.I18N.PropertyWindow.addGlobal,dtype:ORYX.CONFIG.TYPE_DTYPE_GLOBAL});
Ext.form.ConditionExpressionEditorField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}function a(aa){c.setValue(aa);
c.dataSource.getAt(c.row).set("value",aa);
c.dataSource.commitChanges();
R.hide()
}function e(ad){var aa=new String("");
var ae="\0";
var ab="\0";
var ac=false;
for(i=0;
i<ad.length;
i++){ab=ae;
ae=ad.charAt(i);
if(ae==="\\"){if(ac){aa=aa+ae;
ac=false;
ae="\0"
}else{ac=true
}}else{if(ac){if(ae==="n"){aa=aa+"\n"
}else{aa=aa+ae
}}else{aa=aa+ae
}}if(ab==="\\"){if(ac){ac=false
}}}return aa
}var A=false;
Ext.each(this.dataSource.data.items,function(aa){if(aa.data.gridProperties.propId=="oryx-conditionexpressionlanguage"&&aa.data.value=="java"){A=true
}});
var c=this;
var w=true;
var T=true;
var p;
var m=new Ext.form.TextArea({id:Ext.id(),fieldLabel:ORYX.I18N.PropertyWindow.expressionEditor,value:e(this.value),autoScroll:true});
var O;
var n;
if(!A){p=new Ext.Panel({border:false,items:[m]})
}else{var r;
var I=new Ext.Panel({layout:"column",border:false,style:"margin-left:10px;display:block;",items:[new Ext.form.TextField({name:"stringValue"})]});
var f=new Ext.Panel({layout:"column",border:false,style:"margin-left:10px;display:block;",items:[new Ext.form.NumberField({name:"floatValue",allowDecimals:true})]});
var E=new Ext.Panel({layout:"column",border:false,style:"margin-left:10px;display:block;",items:[new Ext.form.NumberField({name:"floatFrom",allowDecimals:true}),new Ext.form.NumberField({name:"floatTo",allowDecimals:true,style:"margin-left:10px;display:block;"})]});
var W=new Ext.Panel({layout:"column",border:false,style:"margin-left:10px;display:block;",items:[new Ext.form.NumberField({name:"intValue",allowDecimals:false})]});
var Z=new Ext.Panel({layout:"column",border:false,style:"margin-left:10px;display:block;",items:[new Ext.form.NumberField({name:"intForm",allowDecimals:false}),new Ext.form.NumberField({name:"intTo",allowDecimals:false,style:"margin-left:10px;display:block;"})]});
var u=[];
u.push(["contains",ORYX.I18N.ConditionExpressionEditorField.contains,I,[0]]);
u.push(["endsWith",ORYX.I18N.ConditionExpressionEditorField.endsWith,I,[0]]);
u.push(["equalsTo",ORYX.I18N.ConditionExpressionEditorField.equalsTo,I,[0]]);
u.push(["isEmpty",ORYX.I18N.ConditionExpressionEditorField.isEmpty,null,null]);
u.push(["isNull",ORYX.I18N.ConditionExpressionEditorField.isNull,null,null]);
u.push(["startsWith",ORYX.I18N.ConditionExpressionEditorField.startsWith,I,[0]]);
var B=new Ext.data.SimpleStore({fields:[{name:"value"},{name:"title"},{name:"panel"},{name:"inputs"}],data:u});
var s=[];
s.push(["between",ORYX.I18N.ConditionExpressionEditorField.between,E,[0,1]]);
s.push(["equalsTo",ORYX.I18N.ConditionExpressionEditorField.equalsTo,f,[0]]);
s.push(["greaterThan",ORYX.I18N.ConditionExpressionEditorField.greaterThan,f,[0]]);
s.push(["greaterOrEqualThan",ORYX.I18N.ConditionExpressionEditorField.greaterThanOrEqual,f,[0]]);
s.push(["isNull",ORYX.I18N.ConditionExpressionEditorField.isNull,null,null]);
s.push(["lessThan",ORYX.I18N.ConditionExpressionEditorField.lessThan,f,[0]]);
s.push(["lessOrEqualThan",ORYX.I18N.ConditionExpressionEditorField.lessThanOrEqual,f,[0]]);
var z=new Ext.data.SimpleStore({fields:[{name:"value"},{name:"title"},{name:"panel"},{name:"inputs"}],data:s});
var x=[];
x.push(["between",ORYX.I18N.ConditionExpressionEditorField.between,Z,[0,1]]);
x.push(["equalsTo",ORYX.I18N.ConditionExpressionEditorField.equalsTo,W,[0]]);
x.push(["greaterThan",ORYX.I18N.ConditionExpressionEditorField.greaterThan,W,[0]]);
x.push(["greaterOrEqualThan",ORYX.I18N.ConditionExpressionEditorField.greaterThanOrEqual,W,[0]]);
x.push(["isNull",ORYX.I18N.ConditionExpressionEditorField.isNull,null,null]);
x.push(["lessThan",ORYX.I18N.ConditionExpressionEditorField.lessThan,W,[0]]);
x.push(["lessOrEqualThan",ORYX.I18N.ConditionExpressionEditorField.lessThanOrEqual,W,[0]]);
var Y=new Ext.data.SimpleStore({fields:[{name:"value"},{name:"title"},{name:"panel"},{name:"inputs"}],data:x});
var P=[];
P.push(["isFalse",ORYX.I18N.ConditionExpressionEditorField.isFalse,null,null]);
P.push(["isNull",ORYX.I18N.ConditionExpressionEditorField.isNull,null,null]);
P.push(["isTrue",ORYX.I18N.ConditionExpressionEditorField.isTrue,null,null]);
var o=new Ext.data.SimpleStore({fields:[{name:"value"},{name:"title"},{name:"panel"},{name:"inputs"}],data:P});
var N=[];
N.push(["isNull",ORYX.I18N.ConditionExpressionEditorField.isNull,null,null]);
var q=new Ext.data.SimpleStore({fields:[{name:"value"},{name:"title"},{name:"panel"},{name:"inputs"}],data:N});
I.hide();
f.hide();
E.hide();
W.hide();
Z.hide();
var U=ORYX.EDITOR.getSerializedJSON();
var b=jsonPath(U.evalJSON(),"$.properties.vardefs");
var F=[];
if(b){b.forEach(function(ae){if(ae.length>0){var ac=ae.split(",");
for(var ad=0;
ad<ac.length;
ad++){var af=ac[ad];
if(af.indexOf(":")>0){var ab=af.split(":");
var ag=ab[0].trim();
var aa=ab[1].trim();
switch(aa){case"String":case"java.lang.String":F.push([ag,aa,B]);
break;
case"Integer":case"java.lang.Integer":case"java.math.BigInteger":case"java.lang.Short":case"java.lang.Long":F.push([ag,aa,Y]);
break;
case"Float":case"java.math.BigDecimal":case"java.lang.Float":case"java.lang.Double":F.push([ag,aa,z]);
break;
case"Boolean":case"java.lang.Boolean":F.push([ag,aa,o]);
break;
default:F.push([ag,aa,q])
}}}}})
}var v=new Ext.data.SimpleStore({fields:[{name:"value"},{name:"type"},{name:"store"}],data:F});
var h=new Ext.form.ComboBox({editable:false,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,listeners:{select:function(ad,ab,ac){L();
r=ab;
var aa=r.get("panel");
if(aa!=null){aa.show()
}}}});
var X=new Ext.form.ComboBox({editable:false,store:v,displayField:"value",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,listeners:{select:function(ac,aa,ab){h.clearValue();
L();
h.bindStore(aa.get("store"))
}}});
var M=new Ext.form.FormPanel({layout:"table",title:ORYX.I18N.ConditionExpressionEditorField.editorTab,layoutConfig:{columns:3},defaults:{border:false},items:[{colspan:3,items:[{style:"font-size:12px;margin:10px;display:block;",anchor:"100%",xtype:"label",html:ORYX.I18N.ConditionExpressionEditorField.editorDescription}]},{style:"font-size:12px;margin:10px;display:block;",anchor:"100%",xtype:"label",html:ORYX.I18N.ConditionExpressionEditorField.processVariable},{colspan:2,items:[X]},{style:"font-size:12px;margin:10px;display:block;",anchor:"100%",xtype:"label",html:ORYX.I18N.ConditionExpressionEditorField.condition},h,{items:[I,f,E,W,Z]}]});
var y=new Ext.Panel({title:ORYX.I18N.ConditionExpressionEditorField.scriptTab,layout:"anchor",defaults:{border:false},items:[m]});
function k(aa){var ab=ORYX.I18N.ConditionExpressionEditorField.scriptParseError;
ab=ab.replace("{0}",aa);
Ext.MessageBox.show({msg:ab,icon:Ext.MessageBox.WARNING,buttons:{ok:ORYX.I18N.PropertyWindow.ok,cancel:ORYX.I18N.PropertyWindow.cancel},fn:function(ac){if(ac=="ok"){H(true,true)
}else{D(false,false)
}}})
}function V(aa){var ab=ORYX.I18N.ConditionExpressionEditorField.scriptGenerationError;
ab=ab.replace("{0}",aa);
Ext.MessageBox.show({msg:ab,icon:Ext.MessageBox.WARNING,buttons:{ok:ORYX.I18N.PropertyWindow.ok}})
}var l=function(ag){if(ag.responseText.length>0){var am=Ext.decode(ag.responseText);
if(am.errorMessage){if(!T){k(am.errorMessage);
return
}else{w=false
}}else{var ae;
var af;
var ad=[];
am.conditions.forEach(function(ao){ae=ao.condition;
ao.parameters.forEach(function(ap){if(af==null){af=ap
}else{ad.push(ap)
}})
});
var ak=v.find("value",af);
if(ak==-1){var al=ORYX.I18N.ConditionExpressionEditorField.nonExistingVariable;
al=al.replace("{0}",af);
k(al);
return
}else{X.setValue(af);
var ab=v.getAt(ak);
X.fireEvent("select",X,ab);
h.setValue(ae);
var ac=ab.get("store");
ak=ac.find("value",ae);
var ah=ac.getAt(ak);
h.fireEvent("select",h,ah);
var aa=ah.get("panel");
if(aa!=null){var aj=ah.get("inputs");
if(aj!=null&&aj.length==ad.length){var ai;
for(ai=0;
ai<aj.length;
ai++){var an=aa.getComponent(aj[ai]).setValue(ad[ai])
}}}w=true
}}}T=false;
if(w){H(true,false)
}else{D(false,false)
}};
var C=function(){D(false,false)
};
function D(ab,aa,ac){if(O){O.toTextArea();
O=null
}if(aa){m.setValue(ac)
}w=ab;
p.setActiveTab(y);
R.setTitle(ORYX.I18N.ConditionExpressionEditorField.sequenceFlowFullTitle);
J()
}function H(aa,ab){if(ab){j()
}w=aa;
p.setActiveTab(M);
R.setTitle(ORYX.I18N.ConditionExpressionEditorField.sequenceFlowTitle)
}p=new Ext.TabPanel({renderTo:Ext.getBody(),activeTab:0,defaults:{border:false},items:[M,y],listeners:{tabchange:function(ac,ad){if(ad.title==ORYX.I18N.ConditionExpressionEditorField.scriptTab){if(w){if(X.getValue()==""||(X.getValue()!=""&&h.getValue()=="")){D(false,true,"")
}else{var ab=function(ag){w=true;
if(ag.responseText.length>0){var af=Ext.decode(ag.responseText);
if(af.errorMessage){V(af.errorMessage);
H(true,false)
}else{D(false,true,af.script)
}}};
var ae=function(){H(true,false)
};
var aa=t(ab,ae);
if(aa==false){H(true,false)
}}}}else{if(!w){if(O.getValue()==null||O.getValue().trim()==""){H(true,true)
}else{m.setValue(O.getValue());
G({script:O.getValue()})
}}}}}});
function j(){X.clearValue();
h.clearValue();
L()
}function L(){if(r!=null){var aa=r.get("panel");
if(aa){var ab=r.get("inputs");
if(ab!=null){ab.forEach(function(ac){aa.getComponent(ac).setValue(null)
})
}aa.hide()
}r=null
}}function d(){if(!r){return false
}var aa=r.get("panel");
if(aa==null){return true
}var ac=r.get("inputs");
if(ac!=null){var ab=[];
ac.forEach(function(ad){var ae=aa.getComponent(ad).getValue();
if(ae===undefined){return false
}ab.push(ae)
});
if(ab.length!=ac.length){return false
}if(ab.length==2){return ab[1]>ab[0]
}}return true
}function Q(){var ae=X.getValue();
if(!ae||!d()){return null
}var ab=[];
ab.push(ae);
var aa=r.get("panel");
if(aa!=null){var ad=r.get("inputs");
if(ad!=null){ad.forEach(function(af){ab.push(aa.getComponent(af).getValue())
})
}}var ac={operator:"AND",conditions:[{condition:h.getValue(),parameters:ab}]};
return ac
}function g(ad,ab,aa,ac){Ext.Ajax.request({url:ORYX.PATH+"customeditors",method:"POST",params:{expression_editor_command:ad,expression_editor_message:Ext.util.JSON.encode(ab)},success:function(ae){aa(ae)
}.bind(this),failure:function(){ac()
}})
}function G(aa){g("parseScript",aa,l,C)
}function t(aa,ab){var ac=Q();
if(!ac){V(ORYX.I18N.ConditionExpressionEditorField.paramsError);
return false
}g("generateScript",ac,aa,ab);
return true
}var S=function(ab){if(ab.responseText.length>0){var aa=Ext.decode(ab.responseText);
if(aa.errorMessage){V(aa.errorMessage)
}else{a(aa.script)
}}};
var K=function(){V(ORYX.I18N.ConditionExpressionEditorField.saveError)
}
}var R=new Ext.Window({layout:"anchor",autoCreate:true,height:430,width:680,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){R.hide()
}.bind(this)}],items:[p],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
R.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){if(A){if(w){t(S,K)
}else{var aa=O.getValue().replace(/\\/g,"\\\\").replace(/\r\n|\r|\n/g,"\\n");
a(aa)
}}else{var aa=O.getValue().replace(/\\/g,"\\\\").replace(/\r\n|\r|\n/g,"\\n");
a(aa)
}}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
R.hide()
}.bind(this)}]});
function J(){this.foldFunc=CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
O=CodeMirror.fromTextArea(document.getElementById(m.getId()),{mode:"text/x-java",lineNumbers:true,lineWrapping:true,matchBrackets:true,onGutterClick:this.foldFunc,extraKeys:{"Ctrl-Z":function(aa){CodeMirror.hint(aa,CodeMirror.jbpmHint,R)
}},onCursorActivity:function(){O.setLineClass(n,null,null);
n=O.setLineClass(O.getCursor().line,null,"activeline")
}.bind(this)});
n=O.setLineClass(0,"activeline")
}if(A){if(this.getValue()!=null&&this.getValue()!=""){G({script:this.getValue()})
}else{H(true,false);
T=false
}}else{R.setTitle(ORYX.I18N.ConditionExpressionEditorField.simpleTitle)
}R.show();
p.setHeight(R.getInnerHeight());
if(!A){J()
}this.grid.stopEditing()
}});
Ext.form.ComplexRuleflowGroupElementField=Ext.extend(Ext.form.TriggerField,{editable:true,readOnly:false,onTriggerClick:function(){if(this.disabled){return
}var b=ORYX.EDITOR.getSerializedJSON();
var d=jsonPath(b.evalJSON(),"$.properties.package");
var f=jsonPath(b.evalJSON(),"$.properties.id");
var a=Ext.data.Record.create([{name:"name"},{name:"rules"},{name:"repo"},{name:"project"},{name:"branch"},{name:"fullpath"}]);
var c=new Ext.data.MemoryProxy({root:[]});
var e=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},a),proxy:c,sorters:[{property:"name",direction:"ASC"}]});
e.load();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:"Loading RuleFlow Groups",title:""});
Ext.Ajax.request({url:ORYX.PATH+"calledelement",method:"POST",success:function(j){try{if(j.responseText.length>0&&j.responseText!="false"){var C=Ext.decode(j.responseText);
for(var H in C){var z=C[H];
var y=new Array();
var r=z.split("||");
var q=r[0];
var m=r[1];
var x=m.split("<<");
var o="";
var t="";
var h="";
for(var A=0;
A<x.length;
A++){var D=x[A].split("^^");
var s=new Array();
s.push(D[0]);
s.push(D[1]);
y.push(s);
var u=x[A];
var l=u.split("^^");
var G=l[1];
var p=G.split("://");
var F=p[1];
var w=F.split("@");
if(h.indexOf(w[0])<0){h+=w[0]+","
}var k=w[1];
if(o.indexOf(k.split("/")[0])<0){o+=k.split("/")[0]+","
}if(t.indexOf(k.split("/")[1])<0){t+=k.split("/")[1]+","
}}if(o.endsWith(",")){o=o.substr(0,o.length-1)
}if(t.endsWith(",")){t=t.substr(0,t.length-1)
}if(h.endsWith(",")){h=h.substr(0,h.length-1)
}e.add(new a({name:q,rules:y,repo:o,project:t,branch:h,fullpath:G}))
}e.commitChanges();
var v=Ext.id();
var g=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:e,id:v,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"rfgname",header:"RuleFlow Group Name",width:200,sortable:true,dataIndex:"name",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"rfrulenames",header:"Rules",width:200,sortable:false,renderer:function(N,J,L,M,Q,O){function I(T,V,S,U){new Ext.form.ComboBox({name:"ruleflowscombo",id:U,valueField:"value",displayField:"name",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:T})}).render(document.getElementById(v),V)
}function P(T,V,S,U){new Ext.Button({text:"view",handler:function(W,Z){var Y=Ext.getCmp(U).getRawValue();
var X=Ext.getCmp(U).getValue();
if(Y&&Y.length>0&&X&&X.length>0){parent.designeropenintab(Y,X)
}}}).render(document.getElementById(v),V)
}var K="rulenamescombodiv-"+M;
var R="rncombo-"+M;
I.defer(1,this,[O.getAt(M).get("rules"),K,L,R]);
P.defer(1,this,[O.getAt(M).get("rules"),K,L,R]);
return('<div id="'+K+'"></div>')
}},{id:"rfrepository",header:"Repositories",width:100,sortable:true,dataIndex:"repo",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"rfproject",header:"Projects",width:100,sortable:true,dataIndex:"project",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"rfbranch",header:"Branches",width:100,sortable:true,dataIndex:"branch",editor:new Ext.form.TextField({allowBlank:true,disabled:true})}])});
g.on("afterrender",function(K){if(this.value.length>0){var I=0;
var L=this.value;
var J=g;
e.data.each(function(){if(this.data.name==L){J.getSelectionModel().select(I,1)
}I++
})
}}.bind(this));
var n=new Ext.Panel({id:"ruleFlowGroupsPanel",title:'<center><p style="font-size:11px"><i>Select RuleFlow Group Name and click on Save</i></p></center>',layout:"column",items:[g],layoutConfig:{columns:1},defaults:{columnWidth:1}});
var B=new Ext.Window({layout:"anchor",autoCreate:true,title:"Editor for RuleFlow Groups",height:350,width:760,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,items:[n],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
B.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.Save.save,handler:function(){if(g.getSelectionModel().getSelectedCell()!=null){var I=g.getSelectionModel().getSelectedCell()[0];
var J=e.getAt(I).data.name;
g.stopEditing();
g.getView().refresh();
this.setValue(J);
this.dataSource.getAt(this.row).set("value",J);
this.dataSource.commitChanges();
B.hide()
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"No data selected.",title:""})
}}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
B.hide()
}.bind(this)}]});
B.show();
g.render();
g.fireEvent("afterrender");
this.grid.stopEditing();
g.focus(false,100)
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Unable to find RuleFlow Groups.",title:""})
}}catch(E){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Error retrieving RuleFlow Groups info  :\n"+E,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Error retrieving RuleFlow Groups info.",title:""})
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID,ppackage:d,pid:f,action:"showruleflowgroups"}});
this.grid.stopEditing()
}});
Ext.form.ComplexCalledElementField=Ext.extend(Ext.form.TriggerField,{editable:true,readOnly:false,onTriggerClick:function(){if(this.disabled){return
}var a=Ext.data.Record.create([{name:"name"},{name:"pkgname"},{name:"imgsrc"}]);
var e=new Ext.data.MemoryProxy({root:[]});
var d=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},a),proxy:e,sorters:[{property:"name",direction:"ASC"}]});
d.load();
var b=ORYX.EDITOR.getSerializedJSON();
var c=jsonPath(b.evalJSON(),"$.properties.package");
var f=jsonPath(b.evalJSON(),"$.properties.id");
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.PropertyWindow.loadingProcessInf,title:""});
Ext.Ajax.request({url:ORYX.PATH+"calledelement",method:"POST",success:function(j){try{if(j.responseText.length>0&&j.responseText!="false"){var m=Ext.decode(j.responseText);
for(var o in m){var p=o.split("|");
d.add(new a({name:p[0],pkgname:p[1],imgsrc:m[o]}))
}d.commitChanges();
var h=Ext.id();
var g=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:d,id:h,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"pid",header:ORYX.I18N.PropertyWindow.processId,width:200,dataIndex:"name",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"pkgn",header:ORYX.I18N.PropertyWindow.packageName,width:200,dataIndex:"pkgname",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"pim",header:ORYX.I18N.LocalHistory.headertxt.ProcessImage,width:250,dataIndex:"imgsrc",renderer:function(q){if(q&&q.length>0){return'<center><img src="'+ORYX.PATH+"images/page_white_picture.png\" onclick=\"new ImageViewer({title: 'Process Image', width: '650', height: '450', autoScroll: true, fixedcenter: true, src: '"+q+"',hideAction: 'close'}).show();\" alt=\"Click to view Process Image\"/></center>"
}else{return ORYX.I18N.LocalHistory.headertxt.ProcessImage.NoAvailable
}}}]),autoHeight:true});
g.on("afterrender",function(s){if(this.value.length>0){var q=0;
var t=this.value;
var r=g;
d.data.each(function(){if(this.data.name==t){r.getSelectionModel().select(q,1)
}q++
})
}}.bind(this));
var n=new Ext.Panel({id:"calledElementsPanel",title:"<center>"+ORYX.I18N.PropertyWindow.selectProcessId+"</center>",layout:"column",items:[g],layoutConfig:{columns:1},defaults:{columnWidth:1}});
var l=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorForCalledEvents,height:350,width:680,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){l.hide()
}.bind(this)}],items:[n],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
l.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.Save.save,handler:function(){if(g.getSelectionModel().getSelectedCell()!=null){var q=g.getSelectionModel().getSelectedCell()[0];
var r=d.getAt(q).data.name;
g.stopEditing();
g.getView().refresh();
this.setValue(r);
this.dataSource.getAt(this.row).set("value",r);
this.dataSource.commitChanges();
l.hide()
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.LocalHistory.LocalHistoryView.msg,title:""})
}}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
l.hide()
}.bind(this)}]});
l.show();
g.render();
g.fireEvent("afterrender");
this.grid.stopEditing();
g.focus(false,100)
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.unableToFindOtherProcess,title:""})
}}catch(k){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.errorResolvingOtherProcessInfo+" :\n"+k,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.errorResolvingOtherProcessInfo+".",title:""})
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID,ppackage:c,pid:f}})
}});
Ext.form.ComplexVisualDataAssignmentField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}Ext.each(this.dataSource.data.items,function(h){if((h.data.gridProperties.propId=="oryx-assignments")){}});
var f=ORYX.EDITOR.getSerializedJSON();
var a=jsonPath(f.evalJSON(),"$.properties.vardefs");
if(!a){a=""
}var c=jsonPath(f.evalJSON(),"$.properties.globals");
if(!c){c=""
}var g="";
var b=jsonPath(f.evalJSON(),"$.childShapes.*");
for(var e=0;
e<b.length;
e++){if(b[e].stencil.id=="DataObject"){g+=b[e].properties.name;
g+=","
}}if(g.endsWith(",")){g=g.substr(0,g.length-1)
}var d=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorVisualDataAssociations,height:550,width:850,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){d.hide()
}.bind(this)}],items:[{xtype:"component",id:"visualdataassignmentswindow",autoEl:{tag:"iframe",src:ORYX.BASE_FILE_PATH+"customeditors/visualassignmentseditor.jsp?vars="+a+"&globals="+c+"&dobj="+g,width:"100%",height:"100%"}}],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
d.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var h=document.getElementById("visualdataassignmentswindow").contentWindow.getEditorValue();
this.setValue(h);
this.dataSource.getAt(this.row).set("value",h);
this.dataSource.commitChanges();
d.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
d.hide()
}.bind(this)}]});
d.show();
this.grid.stopEditing()
}});