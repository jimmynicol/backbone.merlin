'use strict';

var LIVERELOAD_PORT, lrSnippet, mountFolder;

LIVERELOAD_PORT = 5101;
lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
mountFolder = function(connect, dir){
  return connect.static(
    require('path').resolve(dir)
  );
};

module.exports = function(grunt){

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      version: '<%= pkg.version %>',
      banner:
        '/*\n' +
        '-------------------\n' +
        'Backbone.Merlin\n' +
        '-------------------\n' +
        '\nv<%= pkg.version %>\n' +
        '\n' +
        'Copyright (c) <%= grunt.template.today("yyyy") %>: James Nicol <james.andrew.nicol@gmail.com>\n' +
        'Distributed under MIT license\n' +
        '\n' +
        'http://github.com/jimmynicol/backbone.merlin\n' +
        '*/\n\n'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['Gruntfile.js', 'lib/**/*.js']
    },
    concat: {
      options: {
        banner: '<%= meta.banner %>'
      },
      all: {
        src:  [
          'lib/merlin.js',
          'lib/merlin.slider.js',
          'lib/merlin.base.js',
          'lib/merlin.state.js',
          'lib/merlin.connector.js'
        ],
        dest: 'backbone.merlin.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      all: {
        src: 'backbone.merlin.js',
        dest: 'backbone.merlin.min.js'
      }
    },
    mocha: {
      options: {
        timeout: 3000,
        ignoreleaks: false,
        reporter: 'spec',
        ui: 'bdd'
      },
      all: ['test/**/*-test.html']
    },
    docco: {
      options: {
        output: 'docs/'
      },
      all: {
        src: 'backbone.merlin.js'
      }
    },
    connect: {
      livereload: {
        options: {
          port: 5100,
          middleware: function(connect){
            return [lrSnippet, mountFolder(connect, '.')];
          }
        }
      }
    },
    watch: {
      test: {
        files: ['lib/**/*.js', 'test/**/*-test.html'],
        tasks: ['mocha']
      },
      jshint: {
        files: ['Gruntfile.js', 'index.js', 'lib/**/*.js'],
        tasks: ['jshint', 'compile']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: ['lib/**/*.js', 'index.html']
      }
    }
  });

  grunt.registerTask('test',    ['mocha']);
  grunt.registerTask('compile', ['concat', 'uglify']);
  grunt.registerTask('docco',   ['concat', 'docco']);
  grunt.registerTask(
    'default', ['jshint', 'test', 'compile', 'connect', 'watch']
  );

};