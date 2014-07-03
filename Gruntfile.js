/*global module:false*/
module.exports = function(grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // show elapsed time at the end
  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({
    config: {
        src: 'src',
        dist: 'dist'
    },

    concat: {
      dist: {
        src: ['<%= config.src %>/upx.js'],
        dest: '<%= config.dist %>/upx.js'
      }
    },

    uglify: {
      my_target: {
        options: {
          preserveComments: 'some'
        },
        files: {
          '<%= config.dist %>/upx.min.js': ['<%= config.src %>/upx.js']
        }
      }
    },

    jshint: {
        options: {
            jshintrc: '.jshintrc',
            reporter: require('jshint-stylish')
        },
        all: [
            '<%= config.src %>/upx.js'
        ]
    },
  });

  grunt.registerTask('default', function (target) {
      grunt.task.run([
          'concat',
          'uglify'
      ]);
  });

  grunt.registerTask('jshint', function (target) {
      grunt.task.run([
          'jshint'
      ]);
  });
};
