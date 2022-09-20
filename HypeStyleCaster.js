/*!
Hype Style Caster 1.0.7
copyright (c) 2022 Max Ziebell, (https://maxziebell.de). MIT-license
*/

/*
* Version-History
* 1.0.0 Initial release under MIT-license
* 1.0.1 - 1.0.2 Minimal fixes
* 1.0.3 Added data-cast-properties for mirroring mutations to CSS variables
*       Added data-cast-target to define a closest selector to set these on
* 1.0.4 Added monitoring and setting any value of style or transforms,
*       Added the possibility to cast the values (int, float) and register new casting functions
* 1.0.5 Refactored name to Hype Style Caster,
        Refactored data-style to data-style-declaration
		Refactored data-style-cast to data-cast-properties
		Refactored data-cast-target to data-cast-to-closest
		Added data-cast-to-target and data-cast-to-targets
* 1.0.6 Fixed updateTree by storing it document specific in _local
* 1.0.7 Allowing variable name additions that can be inherited, 
*       Added the ability to set default properties
*
*/
if("HypeStyleCaster" in window === false) window['HypeStyleCaster'] = (function () {
	/* @const */
	const _isHypeIDE = window.location.href.indexOf("/Hype/Scratch/HypeScratch.") != -1;

	const _castingHelper = {
		int: parseInt,
		float: parseFloat,
		string: (value) => '"'+value+'"',
	};
	
	// defaults
	let _default = {
		allowStyleExpression: true,
		allowStyleAction: true,
		castProperties: ['width', 'height'],
	}
	
	/* lookup for document specific observer etc. */
	let _lookup = {}
	
	/**
	 * This function allows to override a global default by key or if a object is given as key to override all default at once
	 *
	 * @param {String} key This is the key to override
	 * @param {String|Function|Object} value This is the value to set for the key
	 */
	 function setDefault(key, value){
		//allow setting all defaults
		if (typeof(key) == 'object') {
			_default = key;
			return;
		}
	
		//set specific default
		_default[key] = value;
	}
	
	/**
	 * This function returns the value of a default by key or all default if no key is given
	 *
	 * @param {String} key This the key of the default.
	 * @return Returns the current value for a default with a certain key.
	 */
	function getDefault(key){
		// return all defaults if no key is given
		if (!key) return _default;
	
		// return specific default
		return _default[key];
	}

		
	/* create our sheet */	
	const _sheet = createStyleSheet('hype-style-caster');

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
		/* init local observer lookup */
		let _local = _lookup[hypeDocument.documentId()] = {};
		
		/* custom data */
		if (_isHypeIDE && _default['customDataForPreview']){
			hypeDocument.customData = Object.assign(hypeDocument.customData, _default['customDataForPreview'] ||  _default['customData'])
		} else if (_default['customData']){
			hypeDocument.customData = Object.assign(hypeDocument.customData, _default['customData'])
		}
		
		/* mutation observer */
		_local.dataStyleObserver = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				var id = mutation.target.id;
				var ruleset = mutation.target.getAttribute('data-style-declaration') || ''; 
				
				if (_default['allowStyleExpression'])	{
					var styleExpression = mutation.target.getAttribute('data-style-expression');
					var styleExpressionReturn = '';
					try {
						styleExpressionReturn = new Function('customData', 'with(customData){ return ' + styleExpression + '}')(hypeDocument.customData);
					} catch (e) {
						// render error message
						console.error(
							"%c"+('Hype Style Caster Error')+
							"%c"+(' version '+HypeStyleCaster.version)+"\n\n"+
							"%c"+'return '+styleExpression+
							"%c"+"\n\n"+e+"\n\n",
							 "font-size:12px; font-weight:bold",
							 "font-size:8px",
							 "min-height:40px;display: inline-block; padding: 10px; background-color: rgba(255,255,255,0.25); border: 1px solid lightgray; border-radius: 4px; font-family:Monospace; font-size:12px",
							 "font-size:11px",
							 mutation.target,
						);
						
					}
					if (styleExpressionReturn) ruleset += ';'+styleExpressionReturn;
				}
				
				setStyle(id, ruleset);
			});
		});
		
		/* start observing for data-style changes */
		_local.dataStyleObserver.observe(element, {
			subtree: true,
			attributes: true,
			attributeFilter: ['data-style-declaration', 'data-style-expression']
		});
		
		/**
		 * @description This function updates the CSS variables for the element
		 *
		 * @param {string} styleVariableName - The name of the CSS variable
		 * @param {HTMLElement} elm - The element to be updated
		 */
		function updateVarsForElementOnBase(styleVariableName, elm) {
			let baseElm = element;
			let closestSelector = elm.getAttribute('data-cast-to-closest');
			if (!closestSelector) {
				baseElm = elm.closest('.HYPE_document > .HYPE_scene') || baseElm;
				let targetSelector = elm.getAttribute('data-cast-to-target');
				if (targetSelector){
					baseElm = baseElm.querySelector(targetSelector) || basElm;
				}
			} else {
				baseElm = elm.closest(closestSelector) || baseElm;			
			}
			
			const style = elm.style;
			let props = styleVariableName.split(':');
			
			// determine variable name for casting
			let castName = props[0].trim();
			let closestBasenameElm = elm.closest('[data-cast-basename]');
			let castBaseName = closestBasenameElm? closestBasenameElm.getAttribute('data-cast-basename').trim() + (castName? '-': '') :'';
			styleVariableName = castBaseName + castName;
			
			// abort without name
			if(!styleVariableName) return;
			
			// determine property names for casting
			props = props[1] ? props[1].split(',').map(prop => prop.trim()).filter(prop => prop.length) : _default['castProperties'];
		
			// cast styles
			for (let i = 0; i < props.length; i++) {
				const prop = props[i];
				const cmdProp = resolveProp(prop);	
				if (style[cmdProp[1]]) {	
					const value = resolveCastingFunction(cmdProp[0], style[cmdProp[1]]);		
					baseElm.style.setProperty('--' + styleVariableName + '-' + cmdProp[2], value);		
					props.splice(i, 1);
					i--;
				}
			}
			
			// cast remaining from styles.transform
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
				const styleVariableName = mutation.target.getAttribute('data-cast-properties');
				if(!styleVariableName) return;
				if (mutation.oldValue && mutation.attributeName === 'data-cast-to-closest') {
					removeStyleVariable(styleVariableName, element);
				}
				updateVarsForElementOnBase(styleVariableName, mutation.target);
			});
		}
		
		/**
		 * @description This function updates the tree
		 *
		 * @param {MutationRecord[]} mutations - The mutations to be observed
		 */
		_local.updateTree = function(mutations) {
			element.querySelectorAll('[data-cast-properties]').forEach(elm => {
				const styleVariableName = elm.getAttribute('data-cast-properties');
				if(!styleVariableName) return;
				/* refresh vars */
				updateVarsForElementOnBase(styleVariableName, elm);
				/* start observing for data-cast-properties and style changes */
				_local.dataCastObserver.observe(elm, { 
					attributes: true,
					attributeOldValue: true,
					attributeFilter: [
						'style',
						'data-cast-properties',
						'data-cast-to-closest',
						'data-cast-to-target',
					]
				});
			});
		}
		
		_local.dataCastObserver = new MutationObserver(updateVars);
		_local.treeObserver = new MutationObserver(_local.updateTree);
		
		/* start observing for tree updates */
		_local.treeObserver.observe(element, { 
			childList: true,
			subtree: true
		});
		
		/* start observing for data-cast-basename changes */
		_local.dataCastAttributeObserver = new MutationObserver(updateVars)
		_local.dataCastAttributeObserver.observe(element, {
			subtree: true,
			attributes: true,
			attributeFilter: ['data-cast-basename']
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
			element.setAttribute('data-style-declaration', style);
		}
			
		/* 
		Extend if Hype Action Events is detected to allow the use of 
		actions to set the style of an element.
		*/
		if (_default['allowStyleAction'] && 'HypeActionEvents' in window === true) {
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
		let _local = _lookup[hypeDocument.documentId()];
		_local.updateTree();
		if (_default['allowStyleAction'] && "HypeActionEvents" in window === true) {
			hypeDocument.refreshStyleActions();
		}
	}
	
	if("HYPE_eventListeners" in window === false) { window.HYPE_eventListeners = Array(); }
	window.HYPE_eventListeners.push({type: "HypeDocumentLoad", callback: HypeDocumentLoad});
	window.HYPE_eventListeners.push({type: "HypeScenePrepareForDisplay", callback: HypeScenePrepareForDisplay});
	
	if (_isHypeIDE) document.addEventListener("DOMContentLoaded", function(){
		HypeDocumentLoad({
				customData:{},
				documentId: () => 'ide',
			}, 
			document.body,
			null
		);
	});
	
	/* Reveal Public interface to window['HypeStyleCaster'] */
	return {
		version: '1.0.7',
		setDefault: setDefault,
		getDefault: getDefault,		
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
