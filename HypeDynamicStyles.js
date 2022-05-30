/*!
Hype Dynamic Styles 1.0.4
copyright (c) 2022 Max Ziebell, (https://maxziebell.de). MIT-license
*/

/*
* Version-History
* 1.0.0 Initial release under MIT-license
* 1.0.1 - 1.0.2 Minimal fixes
* 1.0.3 Added data-style-var for mirroring mutations to CSS variables
*       Added data-style-closest to define a closest selector to set these on
* 1.0.4 Added monitoring and setting any value of style or transforms,
*       Added the possibility to cast the values (int, float) and register new casting functions
*
*/
if("HypeDynamicStyles" in window === false) window['HypeMissingSelectors'] = (function () {
	/* @const */
	const _isHypeIDE = window.location.href.indexOf("/Hype/Scratch/HypeScratch.") != -1;

	const _castingHelper = {
		int: parseInt,
		float: parseFloat
	};
	
		
	/* create our sheet */	
	const _sheet = createStyleSheet('hype-dynamic-styles');

	/**
	 * Creates a style sheet with the given id and returns it.
	 *
	 * @param {string} id - the id of the style sheet
	 * @returns {HTMLStyleElement} the style sheet
	 */
	function createStyleSheet(id) {
		const sheet = document.createElement('style');
		sheet.type = 'text/css';
		sheet.id = id;
		document.head.appendChild(sheet);
		return sheet;
	}
	
	/**
	 * @description This function registers a new casting function
	 *
	 * @param {string} name - The name of the casting function
	 * @param {function} func - The function to be registered
	 */
	function registerCastingFunction(name, func) {
		_castingHelper[name] = func;
	}
	
	/**
	 * @description This function resolves the casting of the CSS property
	 *
	 * @param {string} cmd - The casting command
	 * @param {string} value - The value to be casted
	 * @returns {string} - Returns the casted value
	 */
	function resolveCastingFunction(cmd, value) {
		return _castingHelper[cmd] ? _castingHelper[cmd](value) : value;
	}
	
	/**
	 * @description This function checks if the string is a valid CSS property
	 *
	 * @param {string} str - The string to be checked
	 * @returns {boolean} - Returns true if the string is a valid CSS property
	 */
	function isValidCSS(str) {
		var div = document.createElement('div');
		div.style.cssText = str;
		return !!div.style.length
	}
	
	/**
	 * @description This function inserts the style into the style sheet
	 *
	 * @param {string} id - The id of the element
	 * @param {string} style - The style to be inserted
	 */
	function insertStyle(id, style) {
		if (style.indexOf('transform') === -1) {
			if (/top|left|right|bottom/.test(style)) {
				style = 'transform: none; ' + style;
			}
		}
		_sheet.innerHTML += '#' + id + '{' + style.split(';').filter(function(a) {
			return a.trim().length > 0;
		}).map(function(a) {
			return a + (a.indexOf('!important') == -1 ? ' !important;' : ';');
		}).join('') + '}';
	}
	
	/**
	 * @description This function removes the style from the element
	 *
	 * @param {string} id - The id of the element
	 */
	function removeStyle(id) {
		_sheet.innerHTML = _sheet.innerHTML.replace(new RegExp('#' + id + '{[^}]*}'), '');
	}
	
	/**
	 * @description This function updates the style of the element.
	 *
	 * @param {string} id - The id of the element
	 * @param {string} style - The style to be inserted
	 */
	function updateStyle(id, style) {
		removeStyle(id);
		insertStyle(id, style);
	}
		
	/**
	 * @description This function sets the style of an element
	 *
	 * @param {string} id - The id of the element
	 * @param {object} style - The style object to be set
	 */
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
	
	/**
	 * @description This function converts a style object to a string
	 *
	 * @param {object} style - The style object to be converted
	 * @returns {string} - Returns the style object as a string
	 */
	function styleToString(style) {
		return Object.keys(style).map(function (k) {
			return k.replace(/[A-Z]/g, function (match) {
				return '-' + match.toLowerCase();
			}) + ': ' + style[k] + ';';
		}).join('');
	}
	
	/**
	 * @description This function resolves the CSS property
	 *
	 * @param {string} prop - The CSS property to be resolved
	 * @returns {array} - Returns an array of the resolved CSS property
	 */
	function resolveProp(prop) {
		const propMatch = prop.match(/\((\w+)\)\s*(\w+)/);
		if (propMatch) {
			return [propMatch[1], propMatch[2], propMatch[2] + '-' + propMatch[1]];
		} else {
			return [null, prop, prop]
		}
	}
	
	/**
	 * @description This function parses the transform property and returns the value of the property
	 *
	 * @param {string} prop - The property to be parsed
	 * @param {string} string - The string to be parsed
	 * @returns {string} - Returns the value of the property
	 */
	function parseTransform(prop, string) {
		const index = string.indexOf(prop);
		if (index === -1) return '';
		
		let i = index + prop.length;
		while (string.charAt(i) !== '(') i++;
		i++;
		
		let value = '';
		while (string.charAt(i) !== ')') {
			value += string.charAt(i);
			i++;
		}
		return value;
	}
	
	/**
	 * Remove a style variable from all elements in the base element
	 *
	 * @param {string} str - the style variable to remove
	 * @param {HTMLElement} baseElm - the base element to search in
	 */
	function removeStyleVariable(str, baseElm) {
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
		
		/**
		 * @description This function updates the CSS variables for the element
		 *
		 * @param {string} styleVariableName - The name of the CSS variable
		 * @param {HTMLElement} elm - The element to be updated
		 * @param {HTMLElement} baseElm - The element to be updated
		 */
		function updateVarsForElementOnBase(styleVariableName, elm, baseElm) {
			let closestSelector = elm.getAttribute('data-style-closest');
			if (closestSelector) baseElm = elm.closest(closestSelector) || baseElm;
			
			const style = elm.style;
			let props = styleVariableName.split(':');
			styleVariableName = props[0];
			props = props[1] ? props[1].split(',').map(prop => prop.trim()).filter(prop => prop.length) : ['width', 'height'];
		
			for (let prop of props) {
				const cmdProp = resolveProp(prop);
				if (style[cmdProp[1]]) {
					
					const value = resolveCastingFunction(cmdProp[0], style[cmdProp[1]]);
					baseElm.style.setProperty('--' + styleVariableName + '-' + cmdProp[2], value);
					props.splice(props.indexOf(prop), 1);
				}
			}
			
			if (style.transform) {					
				for (let prop of props) {
					const cmdProp = resolveProp(prop);
					const propMatch = parseTransform(cmdProp[1], style.transform);
					if (propMatch) {
						const value = resolveCastingFunction(cmdProp[0], propMatch);
						baseElm.style.setProperty('--' + styleVariableName + '-' + cmdProp[2], value);
					}
				}
			}
		}
		
		/**
		 * @description This function updates the vars
		 *
		 * @param {MutationRecord[]} mutations - The mutations to be observed
		 */
		function updateVars(mutations) {
			mutations.forEach(mutation => {
				const styleVariableName = mutation.target.getAttribute('data-style-var');
				if(!styleVariableName) return;
				if (mutation.oldValue && mutation.attributeName === 'data-style-closest') {
					removeStyleVariable(styleVariableName, element);
				}
				updateVarsForElementOnBase(styleVariableName, mutation.target, element);
			});
		}
		
		/**
		 * @description This function updates the tree
		 *
		 * @param {MutationRecord[]} mutations - The mutations to be observed
		 */
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
		
		/**
		 * @description This function sets the style of the element
		 *
		 * @param {HTMLElement} element - The element to be styled
		 * @param {string} style - The style to be applied to the element
		 */
		hypeDocument.setElementStyle = function(element, style){
			if (!element || !style) return;
			if (typeof style == 'object') style = styleToString(style);
			element.setAttribute('data-style', style);
		}
			
		/* 
		Extend if Hype Action Events is detected to allow the use of 
		actions to set the style of an element.
		*/
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
		version: '1.0.4',
		isValidCSS: isValidCSS,
		styleToString: styleToString,
		createStyleSheet: createStyleSheet,
		parseTransform: parseTransform,
		removeStyleVariable: removeStyleVariable,
		registerCastingFunction: registerCastingFunction,
		/* low level */
		resolveCastingFunction: resolveCastingFunction,
	};
})();
