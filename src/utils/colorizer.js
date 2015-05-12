module.exports = {
  styles: {
    foreground: {black: 30, red: 31, green: 32, yellow: 33, blue: 34, magenta: 35, cyan: 36, white: 37, gray: 90},
    background: {black: 40, red: 41, green: 42, yellow: 43, blue: 44, magenta: 45, cyan: 46, white: 47},
    redBold: {fg: 'red', bold: true},
    red: {fg: 'red'},
    greenBold: {fg: 'green', bold: true},
    green: {fg: 'green'},
    magenta: {fg: 'magenta'},
    magentaBold: {fg: 'magenta', bold: true},
    gray: {fg: 'gray'},
    cyan: {fg: 'cyan'},
    yellow: {fg: 'yellow'},
    yellowBold: {fg: 'yellow', bold: true},
    greenBar: {fg: 'white', bg: 'green', bold: true},
    redBar: {fg: 'white', bg: 'red', bold: true},
    cyanBar: {bg: 'cyan', fg: 'white', bold: true},
    yellowBar: {bg: 'yellow', fg: 'white', bold: true},
    magentaBar: {bg: 'magenta', fg: 'white', bold: true}
  },
  color: function(text, style, pad) {
    if(!(style in this.styles)) return text;
    return this.format(text, this.styles[style], pad);
  },
  format: function(text, style, pad) {
    let codes = [], curr, option;
    if(style.fg && (curr = this.styles.foreground[style.fg])) codes.push(curr);
    if(style.bg && (curr = this.styles.background[style.bg])) codes.push(curr);
    if('bold' in style) codes.push(1);
    if(typeof pad === 'number' && text.length < pad) {
      text += new Array(pad - text.length + 1).join(' ');
    }
    return "\u001b[" + codes.join(';') + 'm' + text + "\u001b[0m";
  }
};
