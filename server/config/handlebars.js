let hbs = require('express-handlebars');

let setting = hbs.create({
    layoutsDir: 'server/views/layouts',
    defaultLayout: 'default',
    extname: '.hbs'
});

setting._renderTemplate = function(template, context, options){
    options.allowProtoMethodsByDefault = true;
    options.allowProtoPropertiesByDefault = true;

    return template(context, options);
}

module.exports = {
    hbs: hbs,
    setting: setting
}