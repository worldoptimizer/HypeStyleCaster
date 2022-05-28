/*!
Hype Dynamic Styles 1.0
copyright (c) 2022 Max Ziebell, (https://maxziebell.de). MIT-license
*/

/*
* Version-History
* 1.0 Initial release under MIT-license
*/
if("HypeDynamicStyles" in window === false) window['HypeMissingSelectors'] = (function () {
	/* @const */
	const _isHypeIDE = window.location.href.indexOf("/Hype/Scratch/HypeScratch.") != -1;

	/* create our sheet */	
	const _sheet = document.createElement('style');
	_sheet.type = 'text/css';
	_sheet.id = 'hype-dynamic-styles';
	document.head.appendChild(_sheet);
	
	function isValidCSS(str) {
		var div = document.createElement('div');
		div.style.cssText = str;
		return !!div.style.length
	}
	
	function addStyle(id, style) {
		if (/top|left|right|bottom/.test(style)) {
			style = 'transform: none; ' + style;
		}
		_sheet.innerHTML += '#' + id + '{' + style.split(';').filter(function(a) {
			return a.trim().length > 0;
		}).map(function(a) {
			return a + (a.indexOf('!important') == -1 ? ' !important;' : ';');
		}).join('') + '}';
	}
	
	function removeStyle(id) {
		_sheet.innerHTML = _sheet.innerHTML.replace(new RegExp('#' + id + '{[^}]*}'), '');
	}
	
	function updateStyle(id, style) {
		removeStyle(id);
		addStyle(id, style);
	}
	
	function styleToString(style) {
		return Object.keys(style).map(function (k) {
			return k.replace(/[A-Z]/g, function (match) {
				return '-' + match.toLowerCase();
			}) + ': ' + style[k] + ';';
		}).join('');
	}	
	
	/* setup callbacks */
	function HypeDocumentLoad(hypeDocument, element, event) {
		/* mutation observer */
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				var id = mutation.target.id;
				var style = mutation.target.getAttribute('data-style');
				if (style === null) {
					removeStyle(id)
					return;
				}
				try {
					if (isValidCSS(style)) {
						updateStyle(id, style);
					} else {
						removeStyle(id);
					}
				} catch (e) {
					removeStyle(id)
				}
			});
		});
		
		/* start observing */
		observer.observe(element, {
			subtree: true,
			attributes: true,
			attributeFilter: ['data-style']
		});
		
		hypeDocument.refreshStyles = function(baseElm){
			baseElm = baseElm || hypeDocument;
			baseElm.querySelectorAll('[data-style-action]').forEach(function(elm){
				var code = elm.getAttribute('data-style-action');
				if (code) {
					var style = hypeDocument.triggerAction ('return '+code, {
						element: elm,
						event: event
					});
					if (style) {
						hypeDocument.setElementStyle(elm, style)
					}
				}
			});
		}
		
		hypeDocument.setElementStyle = function(element, style){
			if (!element || !style) return;
			if (typeof style == 'object') style = styleToString(style);
			element.setAttribute('data-style', style);
		}
	}
	
	/* add support for Hype Action Events if installed */
	function HypeScenePrepareForDisplay(hypeDocument, element, event) {
		if (HypeActionEvents) {
			hypeDocument.refreshStyles();
		}
	}
	
	if("HYPE_eventListeners" in window === false) { window.HYPE_eventListeners = Array(); }
	window.HYPE_eventListeners.push({type: "HypeDocumentLoad", callback: HypeDocumentLoad});
	window.HYPE_eventListeners.push({type: "HypeScenePrepareForDisplay", callback: HypeScenePrepareForDisplay});
	
	if (_isHypeIDE) document.addEventListener("DOMContentLoaded", function(){
		HypeDocumentLoad(null, document.body, null)
	});
	
	/* Reveal Public interface to window['HypeMissingSelectors'] */
	return {
		version: '1.0',
		styleToString: styleToString,
	};
})();
