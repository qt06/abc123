// ==UserScript==
// @name  微信公众号后台无障碍优化
// @namespace  https://accjs.org/
// @version  0.1
// @description  微信公众号后台无障碍优化脚本
// @author  杨永全
// @updated  2022-08-13
// @match  https://mp.weixin.qq.com/cgi-bin/*
// @match  https://mp.weixin.qq.com/misc/*
// @grant  none
// ==/UserScript==

(function() {
class MessageList {
constructor(selector) {
this.selector = selector;
this.els = [];
this.pos = -1;
}

first() {
if(this.checkStat('first')) {
this.toFocus(this.els[0]);
this.pos = 0;
}
}

last() {
if(this.checkStat('last')) {
this.toFocus(this.els[this.els.length - 1]);
this.pos = this.els.length - 1;
}
}

next() {
if(this.checkStat('next')) {
this.pos++;
this.toFocus(this.els[this.pos]);
}
}

prev() {
if(this.checkStat('prev')) {
this.pos--;
this.toFocus(this.els[this.pos]);
}
}

checkStat(op) {
this.els = document.querySelectorAll(this.selector);
let len = this.els.length;
if(len < 1) return false;
if(op == 'next' && this.pos >= len - 1) return false;
if(op == 'prev' && this.pos <= 0) return false;
return true;
}

toFocus(el) {
let tagName = el.tagName.toLowerCase();
let tagNames = ['div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'form', 'img', 'nav', 'header', 'main', 'footer', 'section', 'aside'];
if (tagNames.includes(tagName) || (tagName == 'a' && !el.hasAttribute('href'))) {
if (!el.hasAttribute('tabindex')) {
el.setAttribute('tabindex', '-1');
}
}
el.focus();
}
}
//copy from clipboardjs
  /**
   * Executes a given operation type.
   * @param {String} type
   * @return {Boolean}
   */
  function command(type) {
    try {
      return document.execCommand(type);
    } catch (err) {
      return false;
    }
  }

  /**
   * Creates a fake textarea element with a value.
   * @param {String} value
   * @return {HTMLElement}
   */
  function createFakeElement(value) {
    const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
    const fakeElement = document.createElement('textarea');
    // Prevent zooming on iOS
    fakeElement.style.fontSize = '12pt';
    // Reset box model
    fakeElement.style.border = '0';
    fakeElement.style.padding = '0';
    fakeElement.style.margin = '0';
    // Move element out of screen horizontally
    fakeElement.style.position = 'absolute';
    fakeElement.style[isRTL ? 'right' : 'left'] = '-9999px';
    // Move element to the same position vertically
    let yPosition = window.pageYOffset || document.documentElement.scrollTop;
    fakeElement.style.top = `${yPosition}px`;

    fakeElement.setAttribute('readonly', '');
    fakeElement.value = value;

    return fakeElement;
  }
//copy from clipboardjs end

  function copyToClipboard(text) {
  text = text || '';
  let fakeElement = createFakeElement(text);
  document.body.appendChild(fakeElement);
  fakeElement.select();
  fakeElement.setSelectionRange(0, fakeElement.value.length);
  command('copy');
  fakeElement.remove();
  }

function amo(proc, target, options) {
target = target || document.body;
options = options || {
'childList': true,
'subtree': true
};
let mo = new MutationObserver(proc);
mo.observe(target, options);
return mo;
}

function isVisible(t) {
return !! (!t.hasAttribute('disabled') && t.getAttribute('aria-hidden') !== 'true' && t.offsetParent !== null);
}

function gi(i, len, op) {
let n = op == '+' ? +1 : -1;
i = i + n;
if (i >= len) {
i = 0;
}
if (i < 0) {
i = len - 1;
}
return i;
}

function _toFocus(el) {
let tagName = el.tagName.toLowerCase();
let tagNames = ['div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'form', 'img', 'nav', 'header', 'main', 'footer', 'section', 'aside'];
if (tagNames.includes(tagName) || (tagName == 'a' && !el.hasAttribute('href'))) {
if (!el.hasAttribute('tabindex')) {
el.setAttribute('tabindex', '-1');
}
}
el.focus();
}

function toFocus(focusSelector, op) {
let els = Array.prototype.slice.call(document.body.querySelectorAll('*'));
let len = els.length;
let aeIndex = Math.max(0, els.indexOf(document.activeElement));
let i = aeIndex == 0 ? 0 : gi(aeIndex, len, op);
do {
if (els[i].matches(focusSelector) && isVisible(els[i])) {
_toFocus(els[i]);
break;
}
i = gi(i, len, op);
} while ( i != aeIndex );
}

function nextFocus(selector) {
toFocus(selector, '+');
}

function previousFocus(selector) {
toFocus(selector, '-');
}

function getLabel(labels, src) {
let label = '';
if(typeof src != 'string' || src == '') {
return label;
}
label = src;
for(let key in labels) {
if(src.includes(key)) {
label = labels[key];
break;
}
}
return label;
}

function q(selector, ele) {
ele = ele || document.body;
return ele.querySelectorAll(selector);
}

function addClass(el, className) {
if(el && className) {
className.split(' ').forEach((a) => {el.classList.add(a);});
}
}


function elementFocus(selector, index) {
index = index || 0;
els = q(selector);
let len = els.length;
if(len) {
index = (index < 0 || index >= len) ? len - 1 : index;
_toFocus(els[index]);
}
}

function operation(name) {
let els = q('.operation-item .name');
for(let i = 0; i < els.length; i++) {
if(els[i].innerText.includes(name)) {
els[i].click();
setTimeout(function() {elementFocus('.rc-dialog-wrap');}, 200);
break;
}
}
}

function createNotificationElement() {
if(document.querySelector('#al') !== null) {
return false;
}
let div = document.createElement('div');
div.id = 'al';
div.style = 'width: 0px; height: 0px; overflow: hidden; outline: none;';
div.setAttribute('aria-live', 'polite');
//div.setAttribute('aria-atomic', 'true');
document.body.appendChild(div);
}

function autoFocus(selector) {
setTimeout(function() {
let els = q(selector);
if(els.length < 1) return false;
for(let i = els.length - 1; i >= 0; i--) {
els[i].classList.add('accjs-process');
if(isVisible(els[i])) {
els[i].classList.add('has-auto-focus');
_toFocus(els[i]);
break;
}
}
}, 100);
}

const keydownCallbacks = {};
function keydown(shortcut, cb) {
shortcut.split(',').forEach((k) => {
let key;
let mods = [];
let keys = k.replace(/\s/g, '').split('+');
for(let i = 0; i < keys.length; i++) {
key = keys[i];
if(key == 'alt') mods.push('alt');
if(key == 'shift') mods.push('shift');
if(key == 'ctrl') mods.push('ctrl');
}
let cbKey = mods.length > 0 ? mods.join('__') : key;
if(!(key in keydownCallbacks)) keydownCallbacks[key] = {};
keydownCallbacks[key][cbKey] = cb;
});
}

document.addEventListener('keydown', function(e) {
if(!e.key || !e.target) return;
let key = e.key.toLowerCase();
if(key == ' ') key = 'space';
let keys = Object.keys(keydownCallbacks);
let isKey = keys.includes(key);
if(!isKey) return;
if(e.altKey && e.shiftKey && isKey) {
if ('alt__shift' in keydownCallbacks[key]) {
  if(keydownCallbacks[key]['alt__shift'](e) === false) e.preventDefault();
}
} else if(e.altKey && isKey) {
if ('alt' in keydownCallbacks[key]) {
  if(keydownCallbacks[key]['alt'](e) === false) e.preventDefault();
}
} else if(isKey) {
if (key in keydownCallbacks[key]) {
  if(keydownCallbacks[key][key](e) === false) e.preventDefault();
}
}
}, false);

const labels = {
"window-minimize": "最小化",
"window-maximize": "最大化",
"window-close": "关闭"
};

function attrProc(records) {
records.forEach(function(record) {
if(record.type == 'attributes' && record.target.nodeType == 1 && record.target.classList.contains('select-message-item-box')) {
var te = record.target;
if(te.classList.contains('selected')) {
te.setAttribute('aria-checked', 'true');
} else {
te.setAttribute('aria-checked', 'false');
}
}
});
}

function proc(records) {
//common
q('.weui-desktop-layout__side-menu__container:not(.accjs-has)').forEach((el) => {
el.setAttribute('role', 'navigation');
el.classList.add('accjs-has');
});
q('.weui-desktop-panel:not(.accjs-has), .weui-desktop-block:not(.accjs-has)').forEach((el) => {
el.setAttribute('role', 'main');
el.classList.add('accjs-has');
});

//撰写图文
q('ul.tpl_list .tpl_item, .media_extra_list .media_extra_item').forEach((el) => {
if(el.querySelectorAll('span').length > 0) {
let span = el.querySelector('span');
span.setAttribute('role', 'button');
span.setAttribute('tabindex', '0');
span.setAttribute('aria-haspopup', 'true');
}
if(el.querySelectorAll('ul').length > 0) {
q('.tpl_dropdown_menu .tpl_dropdown_menu_item', el).forEach((el1) => {
if(q('input', el1).length == 0) {
el1.setAttribute('role', 'button');
el1.setAttribute('tabindex', '0');
}
});
} else {
el.setAttribute('role', 'button');
el.setAttribute('tabindex', '0');
}
});
//edui-toolbar
q('[data-tooltip]:not(.accjs-has)').forEach((el) => {
el.setAttribute('aria-label', el.getAttribute('data-tooltip'));
el.setAttribute('role', 'button');
el.setAttribute('tabindex', '-1');
});
q('textarea#title:not(.accjs-has)').forEach((el) => {
el.setAttribute('aria-label', '文章标题');
});
q('input#author:not(.accjs-has)').forEach((el) => {
el.setAttribute('aria-label', '文章作者');
});
q('input.js_ori_setting_checkbox:not(.accjs-has)').forEach((el) => {
el.setAttribute('aria-label', '原创声明');
});
q('#edui1_iframeholder iframe:not(.accjs-has)').forEach((el) => {
setTimeout(function() {
//let c = el.contentDocument.cloneNode(true);
el.src = 'about:blank';
setTimeout(function() {
UE.instants['ueditorInstant0']._setup(el.contentDocument);
}, 1000);
}, 1500);
el.classList.add('accjs-has');
});

q('.weui-desktop-tooltip__wrp:not(.accjs-has), .weui-desktop-popover__target:not(.accjs-has)').forEach((el) => {
let label = el.textContent || '';
el.querySelectorAll('button, a').forEach((a) => {
a.setAttribute('aria-label', label);
a.setAttribute('tabindex', '0');
if(label == '换一张') {
a.setAttribute('aria-description', '请使用鼠标跟随');
}
el.classList.add('accjs-has');
});
});
q('.setting-group__cover .select-cover__btn:not(.accjs-has)').forEach((el) => {
el.setAttribute('role', 'button');
el.setAttribute('tabindex', '0');
el.setAttribute('aria-description', '请使用鼠标跟随');
el.setAttribute('data-accjs-action', 'mouseenter');
el.classList.add('accjs-has');
});
q('.appmsg_content_img_list .appmsg_content_img_item').forEach((el, index) => {
el.setAttribute('role', 'link');
el.setAttribute('aria-label', '图片' + (index + 1));
el.setAttribute('tabindex', '0');

el.classList.add('accjs-has');
});


q('.weui-desktop-dialog__close-btn:not(.accjs-has)').forEach((el) => {
el.setAttribute('aria-label', '关闭');
el.setAttribute('tabindex', '0');
el.classList.add('accjs-has');
});

//素材
q('.title_rank_context button.weui-desktop-icon-btn:not(.accjs-has)').forEach((el) => {
if(el.matches('.weui-desktop-icon-btn_current')) {
el.setAttribute('aria-selected', 'true');
}
el.classList.add('accjs-has');
});

q('.weui-desktop-img-picker__list .weui-desktop-img-picker__item:not(.accjs-has), .weui-desktop-table_img-list table tbody tr:not(.accjs-has), .audio_card_list .weui-desktop-audio-picker__item:not(.accjs-has), .weui-desktop-table_audio-list table tbody tr:not(.accjs-has)').forEach((el) => {
q('.weui-desktop-img-picker__img-title, .weui-desktop-audio-card__title, .weui-desktop-audio__title', el).forEach((strong) => {
strong.setAttribute('role', 'link');
strong.setAttribute('tabindex', '0');
strong.setAttribute('aria-description', '请使用鼠标跟随');
q('input[type="checkbox"]', el).forEach((cb) => {
cb.setAttribute('aria-label', strong.textContent);
});
});
el.classList.add('accjs-has');
});

q('ul.weui-desktop-tags .weui-desktop-tag:not(.accjs-has)').forEach((el) => {
el.setAttribute('role', 'link');
el.setAttribute('tabindex', '0');
});

q('.weui-desktop-operation-group .weui-desktop-operation-group_default:not(.accjs-has)').forEach((el) => {
el.setAttribute('role', 'button');
el.setAttribute('tabindex', '0');
el.setAttribute('aria-label', '操作');
el.setAttribute('aria-haspopup', 'true');
el.classList.add('accjs-has');
});

q('.weui-desktop-dropdown__list .weui-desktop-dropdown__list-ele .weui-desktop-dropdown__list-ele__text:not(.accjs-has)').forEach((el) => {
el.setAttribute('role', 'button');
el.setAttribute('tabindex', '0');
el.classList.add('accjs-has');
});

q('.weui-desktop-gallery__opr-switch .weui-desktop-icon-preview__opr-btn:not(.accjs-has)').forEach((el) => {
el.setAttribute('role', 'link');
el.setAttribute('tabindex', '0');
el.classList.add('accjs-has');
});
//草稿箱
q('.weui-desktop-media__list-wrp .weui-desktop-card_new .weui-desktop-card__inner:not(.accjs-has)').forEach((el) => {
el.setAttribute('role', 'button');
el.setAttribute('tabindex', '0');
el.setAttribute('aria-description', '请使用鼠标跟随');
el.classList.add('accjs-has');
});

//留言
q('.comment-article-list .article-list__item:not(.accjs-has)').forEach((el) => {
if(el.querySelectorAll('.article-list__item-title').length > 0) {
el.setAttribute('role', 'link');
el.setAttribute('tabindex', '0');
el.classList.add('accjs-has');
}
});

q('.comment-list__item .comment-nickname__ext:not(.accjs-has)').forEach((el) => {
el.setAttribute('role', 'button');
el.setAttribute('tabindex', '0');
el.setAttribute('aria-description', '请使用鼠标跟随');
el.classList.add('accjs-has');
});

q('.comment-list__item .comment-list__opr-list:not(.accjs-has)').forEach((el) => {
q('a[title="更多操作"]', el).forEach((a) => {
a.setAttribute('aria-description', '请使用鼠标跟随');
});
q('ul li', el).forEach((li) => {
li.setAttribute('role', 'link');
li.setAttribute('tabindex', '0');
});
el.classList.add('accjs-has');
});

//auto focus
autoFocus('.weui-desktop-gallery:not(.has-auto-focus), .weui-desktop-dialog:not(.has-auto-focus), .weui-desktop-popover');
//end proc
}

let articleList = new MessageList('.comment-article-list .article-list__item');
let commentList= new MessageList('.comment-list .comment-list__item_with-line, .user-messages-panel');

keydown('alt+q', function(e) {copyToClipboard(document.body.innerHTML);});
keydown('alt+x', function(e) {articleList.next();});
keydown('alt+shift+x', function(e) {articleList.prev();});
keydown('alt+c', function(e) {commentList.next();});
keydown('alt+shift+c', function(e) {commentList.prev();});
keydown('space, enter', function(e) {
if(e.target.matches('[role="checkbox"], [role="button"], [role="link"]')) {
e.preventDefault();
let eventName = e.target.hasAttribute('data-accjs-action') ? e.target.getAttribute('data-accjs-action') : 'click';
let event = new MouseEvent(eventName, {bubbles: true, cancelable: true});
e.target.dispatchEvent(event);
//e.target.click();
}
});

//createNotificationElement();
amo(proc);
proc();
/**
amo(attrProc, document.body, {
	'attributes': true,
	'attributeOldValue': true,
	'subtree': true,
	'attributeFilter': ['class']
});
*/

})();
