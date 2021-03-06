module.exports =  function(grunt) {
  'use strict';

  // load .env file
  var dotenv = require('dotenv');
  dotenv.load();

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        banner: '/* <%= pkg.name %> <%= pkg.version %> */\n'
      },
      dist: {
        src: [
          'bower_components/sha256/index.js',
          'src/**/*.js'
        ],
        dest: 'dist/filepreviews.js'
      }
    },

    uglify: {
      options: {
        banner: '/* <%= pkg.name %> <%= pkg.version %> */\n'
      },
      dist: {
        files: {
          'dist/filepreviews.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js'],
      options: {
        globals: {
          console: true,
          module: true,
          document: true
        }
      }
    },

    watch: {
      scripts: {
        options: { livereload: true },
        files: ['<%= jshint.files %>', 'demo/*'],
        tasks: ['default']
      }
    },

    s3: {
      options: {
        bucket: process.env.AWS_S3_BUCKET,
        access: 'public-read',
        maxOperations: 20,
        headers: {
          'Cache-Control': 'max-age=630720000, public',
          'Expires': new Date(Date.now() + 63072000000).toUTCString()
        },
      },

      cdn: {
        upload: [
          {
            src: 'dist/*.js',
            dest: 'latest',
            options: { gzip: true }
          },
          {
            src: 'dist/*.js',
            dest: '<%= pkg.version %>',
            options: { gzip: true }
          },

          // Upload demo
          {
            src: 'dist/*.js',
            dest: 'demo/dist',
            options: { gzip: true }
          },
          {
            src: 'demo/*',
            dest: 'demo/demo',
            options: { gzip: true }
          },
          {
            src: 'bower_components/jquery/dist/*',
            dest: 'demo/bower_components/jquery/dist',
            options: { gzip: true }
          }

        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-s3');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
  grunt.registerTask('publish', ['jshint', 'concat', 'uglify', 's3']);

};
