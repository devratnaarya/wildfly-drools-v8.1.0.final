if((typeof Range!=="undefined")&&!Range.prototype.createContextualFragment){Range.prototype.createContextualFragment=function(a){var c=document.createDocumentFragment(),b=document.createElement("div");
c.appendChild(b);
b.outerHTML=a;
return c
}
};