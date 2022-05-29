/*!
Hype Dynamic Styles 1.0.3
copyright (c) 2022 Max Ziebell, (https://maxziebell.de). MIT-license
*/

/*
* Version-History
* 1.0.0 Initial release under MIT-license
* 1.0.1 - 1.0.2 Minimal fixes
* 1.0.3 Added data-style-var for mirroring mutations to CSS variables
*       Added data-style-closest to define a closest selector to set these on
*
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
	
	function insertStyle(id, style) {
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
		insertStyle(id, style);
	}
	
	function styleToString(style) {
		return Object.keys(style).map(function (k) {
			return k.replace(/[A-Z]/g, function (match) {
				return '-' + match.toLowerCase();
			}) + ': ' + style[k] + ';';
		}).join('');
	}
	
	function setStyle(id, style) {
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
	}
	
	/* setup callbacks */
	function HypeDocumentLoad(hypeDocument, element, event) {
		/* mutation observer */
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				var id = mutation.target.id;
				var style = mutation.target.getAttribute('data-style');
				setStyle(id, style);
			});
		});
		
		/* start observing for data-style changes */
		observer.observe(element, {
			subtree: true,
			attributes: true,
			attributeFilter: ['data-style']
		});
		
				
		function removeStyleVariable(str, baseElm) {
			baseElm = baseElm || element;
			var elms = baseElm.querySelectorAll('*');
			for (var i = 0; i < elms.length; i++) {
				var elm = elms[i];
				var styles = getComputedStyle(elm);
				for (var j = 0; j < styles.length; j++) {
					var style = styles[j];
					if (style.startsWith('--' + str)) {
						elm.style.removeProperty(style);
					}
				}
			}
		}

		function updateVarsForElementOnBase(styleVariableName, elm, baseElm){
			let closestSelector = elm.getAttribute('data-style-closest');
			if (closestSelector) baseElm = elm.closest(closestSelector) || baseElm;
			
			const style = elm.style;
			if (style.width) {
				baseElm.style.setProperty('--' + styleVariableName + '-width', style.width);
			}
			if (style.height) {
				baseElm.style.setProperty('--' + styleVariableName + '-height', style.height);
			}
			if (style.transform) {
				const translate = style.transform;
				const translateX = translate.match(/translateX\((\d+px)\)/i);
				const translateY = translate.match(/translateY\((\d+px)\)/i);
				const rotateY = style.transform.match(/rotateY\((\d+deg)\)/i);
				if (translateX) {
					baseElm.style.setProperty('--' + styleVariableName + '-left', translateX[1]);
				}
				if (translateY) {
					baseElm.style.setProperty('--' + styleVariableName + '-top', translateY[1]);
				}
				if (rotateY) {
					baseElm.style.setProperty('--' + styleVariableName + '-rotateY', rotateY[1]);
				}
			}
		}
		
		function updateVars(mutations) {
			mutations.forEach(mutation => {
				const styleVariableName = mutation.target.getAttribute('data-style-var');
				if(!styleVariableName) return;
				if (mutation.oldValue && mutation.attributeName === 'data-style-closest') {
					removeStyleVariable(styleVariableName);
				}
				updateVarsForElementOnBase(styleVariableName, mutation.target, element);
			});
		}
		
		function updateTree(mutations) {
			element.querySelectorAll("[data-style-var]").forEach(elm => {
				const styleVariableName = elm.getAttribute('data-style-var');
				if(!styleVariableName) return;
				/* refresh vars */
				updateVarsForElementOnBase(styleVariableName, elm, element);
				/* start observing for data-style-var and style changes */
				observerVars.observe(elm, { 
					attributes: true,
					attributeOldValue: true,
					attributeFilter: ["style", "data-style-var", "data-style-closest"]
				});
			});
		}
		
		const observerVars = new MutationObserver(updateVars);
		const observerTree = new MutationObserver(updateTree);
		
		/* start observing for tree updates */
		observerTree.observe(element, { 
			childList: true,
			subtree: true
		});

		/* exit here in IDE */
		if (_isHypeIDE)  return;
			
		hypeDocument.setElementStyle = function(element, style){
			if (!element || !style) return;
			if (typeof style == 'object') style = styleToString(style);
			element.setAttribute('data-style', style);
		}
			
		/* extend if Hype Action Events is detected */
		if ("HypeActionEvents" in window === true) {
			hypeDocument.refreshStyleActions = function(baseElm){
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
		}
		
		/* expose to hypeDocument */
		hypeDocument.removeStyleVariable = removeStyleVariable;
		hypeDocument.setStyle = setStyle;
		hypeDocument.removeStyle = removeStyle;
	}
	
	/* add support for Hype Action Events if installed */
	function HypeScenePrepareForDisplay(hypeDocument, element, event) {
		if ("HypeActionEvents" in window === true) {
			hypeDocument.refreshStyleActions();
		}
	}
	
	if("HYPE_eventListeners" in window === false) { window.HYPE_eventListeners = Array(); }
	window.HYPE_eventListeners.push({type: "HypeDocumentLoad", callback: HypeDocumentLoad});
	window.HYPE_eventListeners.push({type: "HypeScenePrepareForDisplay", callback: HypeScenePrepareForDisplay});
	
	if (_isHypeIDE) document.addEventListener("DOMContentLoaded", function(){
		HypeDocumentLoad({}, document.body, null)
	});
	
	/* Reveal Public interface to window['HypeDynamicStyles'] */
	return {
		version: '1.0.3',
		styleToString: styleToString,
	};
})();
