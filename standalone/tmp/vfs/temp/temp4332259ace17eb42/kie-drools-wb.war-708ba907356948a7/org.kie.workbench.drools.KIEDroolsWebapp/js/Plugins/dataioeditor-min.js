if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.DataIOEditorPlugin={currentElement:undefined,construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DATAIOEDITOR_SHOW,this.showDataIOEditor.bind(this))
},showDataIOEditor:function(a){this.currentElement=a.element;
this.getDataTypesForDataIOEditor(this.currentElement)
},getDataTypesForDataIOEditor:function(b){var a=ORYX.EDITOR.getSerializedJSON();
var c=jsonPath(a.evalJSON(),"$.properties.package");
var d=jsonPath(a.evalJSON(),"$.properties.id");
Ext.Ajax.request({url:ORYX.PATH+"calledelement",method:"POST",success:function(g){try{if(g.responseText.length>=0&&g.responseText!="false"){var f=Ext.decode(g.responseText);
this.doShowDataIOEditor(b,f)
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Unable to find Data Types.",title:""})
}}catch(h){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Error retrieving Data Types info  :\n"+h,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Error retrieving Data Types info.",title:""})
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID,ppackage:c,pid:d,action:"showdatatypes"}})
},doShowDataIOEditor:function(a,d){var e="";
var q=new Array();
for(var w in d){var o=d[w];
q.push(o)
}q.sort();
for(var g=0;
g<q.length;
g++){var b=q[g];
var h=b.split(".");
var p=h[h.length-1];
var f=b.substring(0,b.length-(p.length+1));
var k=p+" ["+f+"]:"+b;
e=e+k;
if(g<q.length-1){e=e+","
}}var c="";
var u="String:String, Integer:Integer, Boolean:Boolean, Float:Float, Object:Object, ******:******,"+c+e;
var n=a.getStencil();
var r=undefined;
if(n.property("oryx-name")!==undefined){r=a.properties["oryx-name"]
}var v=undefined;
if(n.property("oryx-datainput")!==undefined){v=a.properties["oryx-datainput"]
}var l=undefined;
if(n.property("oryx-datainputset")!==undefined){l=a.properties["oryx-datainputset"]
}var m=undefined;
if(n.property("oryx-dataoutput")!==undefined){m=a.properties["oryx-dataoutput"]
}var s=undefined;
if(n.property("oryx-dataoutputset")!==undefined){s=a.properties["oryx-dataoutputset"]
}var j=undefined;
if(n.property("oryx-assignments")!==undefined){j=a.properties["oryx-assignments"]
}else{if(n.property("oryx-datainputassociations")!==undefined){j=a.properties["oryx-datainputassociations"]
}else{if(n.property("oryx-dataoutputassociations")!==undefined){j=a.properties["oryx-dataoutputassociations"]
}}}var i=this.getProcessVars(a);
parent.designersignalshowdataioeditor(r,v,l,m,s,i,j,u,function(A){var B=JSON.parse(A);
var x=this.currentElement;
var y=x.getStencil();
var t=new Hash();
var z=new Hash();
if(y.property("oryx-datainput")!==undefined){t["oryx-datainput"]=B.inputVariables;
z["oryx-datainput"]=x.properties["oryx-datainput"]
}if(y.property("oryx-datainputset")!==undefined){t["oryx-datainputset"]=B.inputVariables;
z["oryx-datainputset"]=x.properties["oryx-datainputset"]
}if(y.property("oryx-dataoutput")!==undefined){t["oryx-dataoutput"]=B.outputVariables;
z["oryx-dataoutput"]=x.properties["oryx-dataoutput"]
}if(y.property("oryx-dataoutputset")!==undefined){t["oryx-dataoutputset"]=B.outputVariables;
z["oryx-dataoutputset"]=x.properties["oryx-dataoutputset"]
}if(y.property("oryx-assignments")!==undefined){t["oryx-assignments"]=B.assignments;
z["oryx-assignments"]=x.properties["oryx-assignments"]
}else{if(y.property("oryx-datainputassociations")!==undefined){t["oryx-datainputassociations"]=B.assignments;
z["oryx-datainputassociations"]=x.properties["oryx-datainputassociations"]
}else{if(y.property("oryx-dataoutputassociations")!==undefined){t["oryx-dataoutputassociations"]=B.assignments;
z["oryx-dataoutputassociations"]=x.properties["oryx-dataoutputassociations"]
}}}this.setElementProperties(x,t,z)
}.bind(this))
},setElementProperties:function(c,a,e){var d=this.facade;
var b=ORYX.Core.Command.extend({construct:function(){this.newProperties=a;
this.oldProperties=e;
this.selectedElements=[c];
this.facade=d
},execute:function(){this.newProperties.each(function(g){if(!c.getStencil().property(g.key).readonly()){c.setProperty(g.key,g.value)
}}.bind(this));
this.facade.setSelection(this.selectedElements);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.oldProperties.each(function(g){if(!c.getStencil().property(g.key).readonly()){c.setProperty(g.key,g.value)
}}.bind(this));
this.facade.setSelection(this.selectedElements);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var f=new b();
this.facade.executeCommands([f]);
a.each(function(g){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,elements:[c],key:g.key,value:g.value})
}.bind(this))
},getProcessVars:function(c){var e="** "+ORYX.I18N.DataIOEditorPlugin.VariableDefinitions+" **,";
if(c&&c.parent){var d=this.getParentVars(c.parent);
if(d&&d.length>0){e=e+d
}}var a="";
var b=ORYX.EDITOR.getSerializedJSON();
var f=jsonPath(b.evalJSON(),"$.properties.vardefs");
if(f){f.forEach(function(g){if(g.length>0){a=a+g+","
}})
}if(a&&a.length>0){e=e+a
}return e
},getParentVars:function(c){var d="";
if(c){if(c._stencil._jsonStencil.id=="http://b3mn.org/stencilset/bpmn2.0#MultipleInstanceSubprocess"||c._stencil._jsonStencil.id=="http://b3mn.org/stencilset/bpmn2.0#Subprocess"||c._stencil._jsonStencil.id=="http://b3mn.org/stencilset/bpmn2.0#EventSubprocess"||c._stencil._jsonStencil.id=="http://b3mn.org/stencilset/bpmn2.0#AdHocSubprocess"){var f=c.properties["oryx-vardefs"];
if(f&&f.length>0){d=d+this.sortVarsString(f)
}if(c._stencil._jsonStencil.id=="http://b3mn.org/stencilset/bpmn2.0#MultipleInstanceSubprocess"){var b=c.properties["oryx-multipleinstancedatainput"];
if(b&&b.length>0){d=d+this.sortVarsString(b)
}var a=c.properties["oryx-multipleinstancedataoutput"];
if(a&&a.length>0){d=d+this.sortVarsString(a)
}}}if(c.parent){var e=this.getParentVars(c.parent);
if(e&&e.length>0){d=d+e
}}}return d
},sortVarsString:function(d){if(!d||d.length<1){return""
}var b=d.split(",");
b.sort();
var c="";
for(var a=0;
a<b.length;
a++){c=c+b[a]+","
}return c+","
}};
ORYX.Plugins.DataIOEditorPlugin=ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.DataIOEditorPlugin);