function getQuery(e,n){n=n||window.location.href,e=e.replace(/[\[\]]/g,"\\$&");let t=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(n);return t?t[2]?decodeURIComponent(t[2].replace(/\+/g," ")):"":null}function getQueryString(e){return(e=e||window.location.href).indexOf("?")<0?"":e.substring(e.indexOf("?"),e.indexOf("#")>-1?e.indexOf("#"):void 0)}function setQuery(e,n,t){null!=n&&(n=""+n),t=t||window.location.search;let o=new RegExp("([?;&])"+e+"[^&;]*[;&]?"),i=t.replace(o,"$1").replace(/&$/,"");return(i.length>2?i+"&":"?")+(n?e+"="+n:"")}function modifyQueryFromURL(e,n,t){return t.substring(0,t.indexOf("?")>-1?t.indexOf("?"):void 0)+setQuery(e,n,getQueryString(t))+(t.indexOf("#")>-1?t.substring(t.indexOf("#")):"")}function setQueryString(e){var n=window.location.protocol+"//"+window.location.host+window.location.pathname+e+window.location.hash;history.pushState&&window.history.pushState({path:n},"",n)}function removeHash(){history.pushState("",document.title,window.location.pathname+window.location.search)}function escapeRegExp(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}String.prototype.replaceAll=function(e,n){return this.replace(new RegExp(escapeRegExp(e),"g"),n)};