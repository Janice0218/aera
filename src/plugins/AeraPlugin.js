'use strict';
exports.register = function (server, options, next) {

    server.route(require('../routes/CourseRouter'));
    server.route(require('../routes/GroupRouter'));

    next();

};

exports.register.attributes = {
    name: 'aera',
    version: '0.0.0'
};